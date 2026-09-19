import { jsPDF } from "jspdf";
import fontUrl from "@/assets/DejaVuSans.ttf?url";
import { balance, formatDate, type BankState, type Txn } from "./bank-store";

const MUTED: [number, number, number] = [110, 110, 118];
const LINE: [number, number, number] = [222, 222, 228];

let fontReady: Promise<void> | null = null;
let base64 = "";

async function ensureFont(doc: jsPDF) {
  if (!fontReady) {
    fontReady = (async () => {
      const buf = await fetch(fontUrl).then((r) => r.arrayBuffer());
      let bin = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 8192) {
        bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      base64 = btoa(bin);
    })();
  }
  await fontReady;
  doc.addFileToVFS("DejaVuSans.ttf", base64);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.setFont("DejaVu", "normal");
}

/** Spoľahlivé uloženie PDF aj na iOS Safari / PWA, kde doc.save() zlyháva. */
function savePdf(doc: jsPDF, filename: string) {
  const blob = doc.output("blob");
  const nav = navigator as Navigator & { msSaveOrOpenBlob?: (b: Blob, n: string) => void };
  if (typeof nav.msSaveOrOpenBlob === "function") {
    nav.msSaveOrOpenBlob(blob, filename);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const supportsDownload = "download" in a;
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (!supportsDownload) {
    // starší iOS Safari: otvoriť v novom okne, ak klik nespôsobil navigáciu
    window.open(url, "_blank");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Potvrdenie o jednej platbe – rovnaký bankový štýl ako výpis z účtu */
export async function exportReceipt(s: BankState, t: Txn) {
  const doc = new jsPDF();
  await ensureFont(doc);
  const income = t.type === "in";
  const today = new Date().toISOString();

  // hlavička
  doc.setTextColor(...INK);
  doc.setFontSize(20);
  doc.text("GEORGE", 14, 24);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Slovenská sporiteľňa", 14, 30);
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text("Potvrdenie č. " + t.id.slice(0, 10).toUpperCase(), 196, 24, { align: "right" });

  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    ["Slovenská sporiteľňa, a.s.", "Tomášikova 48, 832 37 Bratislava", "IČO 00 151 653, zapísaná v Obchodnom registri"],
    14,
    40,
  );
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text([s.owner, "Slovenská republika"], 110, 40);

  doc.setFontSize(14);
  doc.text(income ? "Potvrdenie o prijatej platbe" : "Potvrdenie o vykonanej platbe", 14, 62);

  // suma
  doc.setFillColor(...BOXBG);
  doc.roundedRect(14, 68, 182, 24, 2, 2, "F");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Suma transakcie", 18, 76);
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(`${income ? "+" : "-"} ${num(t.amount)} EUR`, 18, 87);
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Stav", 192, 76, { align: "right" });
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Zrealizované", 192, 84, { align: "right" });

  // údaje o platbe
  doc.setFillColor(...BOXBG);
  doc.roundedRect(14, 98, 182, 62, 2, 2, "F");
  let y = 106;
  const L = 16;
  const R = 106;
  const W = 86;
  row(doc, L, W, y, "Názov Účtu", s.owner);
  row(doc, R, W, y, income ? "Odosielateľ" : "Príjemca", t.counterparty);
  y += 9;
  row(doc, L, W, y, "Číslo Účtu", s.iban);
  row(doc, R, W, y, "IBAN protistrany", t.iban || "—");
  y += 9;
  row(doc, L, W, y, "BIC", "MOJASKBX");
  row(doc, R, W, y, "Konštantný symbol", t.vs || "—");
  y += 9;
  row(doc, L, W, y, "Mena", "EUR");
  row(doc, R, W, y, "Kategória", t.category);
  y += 9;
  row(doc, L, W, y, "Dátum zúčtovania", formatDate(t.date));
  row(doc, R, W, y, "Dátum valuty", formatDate(t.date));
  y += 9;
  row(doc, L, W, y, "Dátum vyhotovenia", formatDate(today));
  row(doc, R, W, y, "Zostatok na Účte", num(balance(s)));

  // správa pre príjemcu
  y = 172;
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Správa pre príjemcu:", 14, y);
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(doc.splitTextToSize(t.note || "—", 182), 14, y + 6);

  // poznámka
  y += 22;
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Poznámka:", 14, y);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    doc.splitTextToSize(
      "Toto potvrdenie je vygenerované elektronicky a je platné bez podpisu a pečiatky. Ak pri transakcii nie je uvedená výška poplatku, banka takúto transakciu nespoplatňuje alebo je poplatok zahrnutý v poplatku za iný bankový produkt.",
      182,
    ),
    14,
    y + 6,
  );
  doc.setFillColor(...BOXBG);
  doc.roundedRect(14, y + 26, 182, 16, 2, 2, "F");
  doc.setTextColor(...INK);
  doc.text(
    doc.splitTextToSize(
      "Vklad podliehajúci ochrane vkladov v súlade so zákonom. Viac informácií získate v Informačnom formulári pre vkladateľa.",
      174,
    ),
    18,
    y + 33,
  );

  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text("info@mojabanka.sk", 30, 288);
  doc.text("Klientske centrum: 0850 111 888", 105, 288, { align: "center" });
  doc.text("www.mojabanka.sk", 180, 288, { align: "right" });

  savePdf(doc, `potvrdenie-o-platbe-${t.id.slice(0, 8)}.pdf`);
}

/* ---------- Výpis z účtu v štýle bankového výpisu ---------- */

const INK: [number, number, number] = [38, 44, 54];
const ACCENT: [number, number, number] = [74, 106, 138];
const BOXBG: [number, number, number] = [232, 238, 245];

function num(n: number) {
  const v = new Intl.NumberFormat("sk-SK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.abs(n))
    .replace(/\u00a0/g, " ");
  return n < 0 ? `- ${v}` : v;
}

function dot(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(...ACCENT);
  doc.circle(x, y - 1.2, 1.4, "F");
}

function row(doc: jsPDF, x: number, w: number, y: number, label: string, value: string) {
  doc.setFontSize(8.5);
  dot(doc, x, y);
  doc.setTextColor(...INK);
  doc.text(label, x + 2.6, y);
  doc.text(value, x + w, y, { align: "right" });
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.2);
  doc.line(x + 2.6, y + 1.8, x + w, y + 1.8);
}

/** Výpis z účtu so zostatkom a zoznamom transakcií */
export async function exportStatement(s: BankState, txns: Txn[] = s.transactions) {
  const doc = new jsPDF();
  await ensureFont(doc);

  const list = [...txns].sort((a, b) => a.date.localeCompare(b.date));
  const income = list.filter((t) => t.type === "in").reduce((a, t) => a + t.amount, 0);
  const expense = list.filter((t) => t.type === "out").reduce((a, t) => a + t.amount, 0);
  const end = balance(s);
  const start = end - income + expense;
  const today = new Date().toISOString();
  const first = list[0]?.date ?? today;
  const last = list[list.length - 1]?.date ?? today;

  // hlavička
  doc.setTextColor(...INK);
  doc.setFontSize(20);
  doc.text("GEORGE", 14, 24);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Slovenská sporiteľňa", 14, 30);
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(`č. ${new Date(today).getUTCFullYear()}/1 - Strana 1/1`, 196, 24, { align: "right" });

  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    ["Slovenská sporiteľňa, a.s.", "Tomášikova 48, 832 37 Bratislava", "IČO 00 151 653, zapísaná v Obchodnom registri"],
    14,
    40,
  );
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text([s.owner, "Slovenská republika"], 110, 40);

  // názov výpisu
  doc.setFontSize(14);
  doc.text("Výpis z Účtu: Osobný účet", 14, 62);

  // informačný box
  doc.setFillColor(...BOXBG);
  doc.roundedRect(14, 68, 182, 44, 2, 2, "F");
  let y = 76;
  const L = 16;
  const R = 106;
  const W = 86;
  row(doc, L, W, y, "Názov Účtu", s.owner);
  row(doc, R, W, y, "Účtovné obdobie", `${formatDate(first)} - ${formatDate(last)}`);
  y += 9;
  row(doc, L, W, y, "Číslo Účtu", s.iban);
  row(doc, R, W, y, "Počiatočný stav Účtu", num(start));
  y += 9;
  row(doc, L, W, y, "BIC", "MOJASKBX");
  row(doc, R, W, y, "Vklady spolu", num(income));
  y += 9;
  row(doc, L, W, y, "Mena", "EUR");
  row(doc, R, W, y, "Výbery spolu", num(-expense));
  y += 9;
  row(doc, L, W, y, "Dátum vyhotovenia výpisu", formatDate(today));
  row(doc, R, W, y, "Konečný stav Účtu", num(end));

  // tabuľka
  y = 132;
  doc.setFillColor(...BOXBG);
  doc.roundedRect(14, y - 6, 182, 14, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text(["Dátum", "valuty"], 17, y - 2);
  doc.text(["Dátum", "zúčtovania"], 38, y - 2);
  doc.text(["Popis", "transakcie"], 64, y - 2);
  doc.text(["Suma", "transakcie"], 150, y - 2, { align: "right" });
  doc.text(["Zostatok", "po transakcii"], 193, y - 2, { align: "right" });
  y += 14;

  let running = start;
  for (const t of list) {
    if (y > 268) {
      doc.addPage();
      y = 26;
    }
    running += t.type === "in" ? t.amount : -t.amount;
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(formatDate(t.date), 17, y);
    doc.text(formatDate(t.date), 38, y);
    doc.text(doc.splitTextToSize(t.counterparty, 80)[0] ?? "", 64, y);
    doc.text(num(t.type === "in" ? t.amount : -t.amount), 150, y, { align: "right" });
    doc.text(num(running), 193, y, { align: "right" });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(14, y + 3.4, 196, y + 3.4);
    y += 9;
  }

  // poznámka
  y += 6;
  if (y > 250) {
    doc.addPage();
    y = 26;
  }
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Poznámka:", 14, y);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    doc.splitTextToSize(
      "Ak v časti Suma poplatkov nie je uvedená výška poplatku, banka takúto transakciu nespoplatňuje alebo je poplatok za túto transakciu zahrnutý v poplatku za iný bankový produkt. Všetky poplatky sú uvedené v Sadzobníku poplatkov a náhrad.",
      182,
    ),
    14,
    y + 6,
  );
  doc.setFillColor(...BOXBG);
  doc.roundedRect(14, y + 26, 182, 16, 2, 2, "F");
  doc.setTextColor(...INK);
  doc.text(
    doc.splitTextToSize(
      "Vklad podliehajúci ochrane vkladov v súlade so zákonom. Viac informácií získate v Informačnom formulári pre vkladateľa, ktorý Vám bol doručený alebo odovzdaný.",
      174,
    ),
    18,
    y + 32,
  );

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text("info@mojabanka.sk", 30, 288);
    doc.text("Klientske centrum: 0850 111 888", 105, 288, { align: "center" });
    doc.text("www.mojabanka.sk", 180, 288, { align: "right" });
  }

  savePdf(doc, `vypis-${s.owner.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
