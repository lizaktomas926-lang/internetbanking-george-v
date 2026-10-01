import { jsPDF } from "jspdf";
import type { BankState, Txn } from "@/lib/bank-store";
import { balance, formatEur } from "@/lib/bank-store";
import fontUrl from "@/assets/DejaVuSans.ttf?url";

// Načítanie fontu s podporou slovenskej diakritiky (cache na celú session)
let fontB64: string | null = null;
async function loadFont(): Promise<string> {
  if (fontB64) return fontB64;
  const res = await fetch(fontUrl);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let str = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    str += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  fontB64 = btoa(str);
  return fontB64;
}

async function newDoc(): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const font = await loadFont();
  doc.addFileToVFS("DejaVuSans.ttf", font);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFont("DejaVuSans.ttf", "DejaVu", "bold");
  doc.setFont("DejaVu", "normal");
  return doc;
}

// Spoľahlivé stiahnutie aj na iOS Safari / PWA, kde doc.save() zlyháva
function saveDoc(doc: jsPDF, filename: string) {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function header(doc: jsPDF) {
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 153);
  doc.text("SLOVENSKÁ SPORITEĽŇA", 15, 20);

  doc.setFont("DejaVu", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Slovenská sporiteľňa, a.s.", 15, 26);
  doc.text("Tomášikova 48, 832 37 Bratislava", 15, 30);
  doc.text("IČO 00 151 653, zapísaná v OR Mestského súdu Bratislava III., odd. Sa, vl. č. 601/B", 15, 34);

  doc.setFont("DejaVu", "bold");
  doc.text("BIC / SWIFT:", 140, 26);
  doc.setFont("DejaVu", "normal");
  doc.text("GIBASKBX", 170, 26);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, 38, 195, 38);
}

function footer(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(200, 200, 200);
  doc.line(15, pageHeight - 15, 195, pageHeight - 15);
  doc.setFontSize(8);
  doc.setFont("DejaVu", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("info@slsp.sk", 15, pageHeight - 9);
  doc.text("Klientske centrum: 0850 111 888", 105, pageHeight - 9, { align: "center" });
  doc.text("www.slsp.sk", 195, pageHeight - 9, { align: "right" });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

// Potvrdenie o jednej platbe (detail transakcie)
export async function exportReceipt(s: BankState, t: Txn) {
  const doc = await newDoc();
  header(doc);

  const income = t.type === "in";
  const amountFormatted = `${income ? "+" : "−"}${formatEur(t.amount)}`;

  doc.setFont("DejaVu", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Potvrdenie o zrealizovanej platbe", 15, 48);

  doc.setFontSize(9);
  doc.setFont("DejaVu", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Dátum vyhotovenia: ${fmtDate(new Date().toISOString())}`, 15, 54);

  // Zvýraznený blok so sumou
  doc.setFillColor(245, 247, 250);
  doc.rect(15, 60, 180, 20, "F");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Suma transakcie:", 20, 72);
  doc.setFontSize(14);
  doc.setFont("DejaVu", "bold");
  doc.setTextColor(income ? 0 : 180, income ? 120 : 0, 0);
  doc.text(amountFormatted, 185, 72, { align: "right" });

  let y = 90;
  const drawRow = (label: string, value: string, bold = false) => {
    doc.setFont("DejaVu", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(label, 15, y);
    doc.setFont("DejaVu", bold ? "bold" : "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(value || "-", 195, y, { align: "right" });
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(15, y + 2, 195, y + 2);
    y += 8;
  };

  drawRow("Názov účtu príkazcu", s.owner);
  drawRow("Číslo účtu príkazcu (IBAN)", s.iban, true);
  drawRow("Názov protiúčtu", t.counterparty);
  if (t.iban) drawRow("Číslo účtu protiúčtu (IBAN)", t.iban, true);
  drawRow("Dátum zúčtovania", fmtDate(t.date));
  if (t.vs) drawRow("Variabilný symbol", t.vs);
  if (t.note) drawRow("Poznámka / Popis", t.note);

  y += 10;
  doc.setFontSize(7.5);
  doc.setFont("DejaVu", "normal");
  doc.setTextColor(120, 120, 120);
  const noteText =
    "Poznámka: Toto potvrdenie je vyhotovené elektronicky a je platné bez pečiatky a podpisu. Všetky poplatky sú účtované podľa platného Sadzobníka poplatkov Slovenskej sporiteľne, a.s.";
  doc.text(doc.splitTextToSize(noteText, 180), 15, y);

  footer(doc);
  saveDoc(doc, `Potvrdenie_platba_${t.id || "george"}.pdf`);
}

// Výpis z účtu za vybrané obdobie (obrazovka Platby)
export async function exportStatement(s: BankState, txns: Txn[]) {
  const doc = await newDoc();
  header(doc);

  doc.setFont("DejaVu", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Výpis z účtu", 15, 48);

  doc.setFontSize(9);
  doc.setFont("DejaVu", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Dátum vyhotovenia: ${fmtDate(new Date().toISOString())}`, 15, 54);

  // Informačný box o účte
  doc.setFillColor(245, 247, 250);
  doc.rect(15, 60, 180, 34, "F");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Názov účtu:", 20, 68);
  doc.text("Číslo účtu (IBAN):", 20, 74);
  doc.text("Mena:", 20, 80);
  doc.text("Aktuálny zostatok:", 20, 86);
  doc.setFont("DejaVu", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(s.owner, 190, 68, { align: "right" });
  doc.text(s.iban, 190, 74, { align: "right" });
  doc.text("EUR", 190, 80, { align: "right" });
  doc.text(formatEur(balance(s)), 190, 86, { align: "right" });

  // Hlavička tabuľky transakcií
  let y = 104;
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Dátum", 15, y);
  doc.text("Popis", 45, y);
  doc.text("Suma", 150, y, { align: "right" });
  doc.text("Zostatok", 195, y, { align: "right" });
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(15, y + 2, 195, y + 2);
  y += 8;

  // Zostatok po transakcii — počítaný spätne od aktuálneho zostatku
  let running = balance(s);
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(8.5);

  for (const t of txns) {
    if (y > 270) {
      footer(doc);
      doc.addPage();
      y = 20;
    }
    const signed = t.type === "in" ? t.amount : -t.amount;
    doc.setTextColor(0, 0, 0);
    doc.text(fmtDate(t.date), 15, y);
    const label = t.counterparty.length > 42 ? `${t.counterparty.slice(0, 41)}…` : t.counterparty;
    doc.text(label, 45, y);
    doc.setTextColor(signed < 0 ? 180 : 0, signed < 0 ? 0 : 120, 0);
    doc.text(`${signed < 0 ? "−" : "+"}${formatEur(Math.abs(signed))}`, 150, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    doc.text(formatEur(running), 195, y, { align: "right" });
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.2);
    doc.line(15, y + 2, 195, y + 2);
    y += 7;
    running -= signed;
  }

  footer(doc);
  saveDoc(doc, `Vypis_george_${new Date().toISOString().slice(0, 10)}.pdf`);
}
