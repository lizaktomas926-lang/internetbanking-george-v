import { jsPDF } from "jspdf";
import fontUrl from "@/assets/DejaVuSans.ttf?url";
import { balance, formatDate, formatEur, MONTHS, type BankState, type Txn } from "./bank-store";

const BRAND: [number, number, number] = [92, 15, 27];
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

function eur(n: number) {
  return formatEur(n).replace(/\u00a0/g, " ");
}

function header(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, 210, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(title, 16, 22);
  doc.setFontSize(10);
  doc.text(subtitle, 16, 31);
  doc.setTextColor(20, 20, 24);
}

function labelValue(doc: jsPDF, label: string, value: string, y: number) {
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(label, 16, y);
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 24);
  doc.text(value, 16, y + 6);
  doc.setDrawColor(...LINE);
  doc.line(16, y + 10, 194, y + 10);
  return y + 18;
}

function footer(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Dokument vygenerovaný ${formatDate(new Date().toISOString())} · Moja banka · strana ${p}/${pages}`,
      16,
      288,
    );
  }
}

/** Potvrdenie o jednej platbe */
export async function exportReceipt(s: BankState, t: Txn) {
  const doc = new jsPDF();
  await ensureFont(doc);
  const income = t.type === "in";

  header(doc, "Potvrdenie o platbe", income ? "Prijatý prevod" : "Odoslaná platba");

  doc.setFontSize(26);
  doc.text(`${income ? "+" : "−"}${eur(t.amount).replace("-", "")}`, 16, 60);

  let y = 74;
  y = labelValue(doc, "Majiteľ účtu", s.owner, y);
  y = labelValue(doc, income ? "Prijaté na účet" : "Odoslané z účtu", s.iban, y);
  y = labelValue(doc, income ? "Odosielateľ" : "Príjemca", t.counterparty, y);
  if (t.iban) y = labelValue(doc, "IBAN protistrany", t.iban, y);
  y = labelValue(doc, "Dátum spracovania", formatDate(t.date), y);
  y = labelValue(doc, "Kategória", t.category, y);
  if (t.vs) y = labelValue(doc, "Konštantný symbol", t.vs, y);
  if (t.note) y = labelValue(doc, "Správa pre príjemcu", t.note, y);
  y = labelValue(doc, "Referencia platby", t.id.slice(0, 18).toUpperCase(), y);
  labelValue(doc, "Zostatok na účte", eur(balance(s)), y);

  footer(doc);
  doc.save(`potvrdenie-${formatDate(t.date).replace(/\./g, "")}.pdf`);
}

/** Výpis z účtu so zostatkom a zoznamom transakcií */
export async function exportStatement(s: BankState, txns: Txn[] = s.transactions) {
  const doc = new jsPDF();
  await ensureFont(doc);

  header(doc, "Výpis z účtu", `${s.owner} · ${s.iban}`);

  const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date));
  const income = sorted.filter((t) => t.type === "in").reduce((a, t) => a + t.amount, 0);
  const expense = sorted.filter((t) => t.type === "out").reduce((a, t) => a + t.amount, 0);

  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Aktuálny zostatok", 16, 56);
  doc.setFontSize(24);
  doc.setTextColor(20, 20, 24);
  doc.text(eur(balance(s)), 16, 67);

  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Príjmy vo výpise", 120, 56);
  doc.text("Výdavky vo výpise", 120, 68);
  doc.setFontSize(12);
  doc.setTextColor(22, 120, 70);
  doc.text(eur(income), 170, 56, { align: "right" });
  doc.setTextColor(170, 40, 50);
  doc.text(eur(expense), 170, 68, { align: "right" });

  let y = 84;
  doc.setTextColor(...MUTED);
  doc.setFontSize(9);
  doc.text("Dátum", 16, y);
  doc.text("Protistrana", 40, y);
  doc.text("Kategória", 120, y);
  doc.text("Suma", 194, y, { align: "right" });
  doc.setDrawColor(...LINE);
  doc.line(16, y + 2.5, 194, y + 2.5);
  y += 9;

  let currentMonth = "";
  for (const t of sorted) {
    if (y > 272) {
      doc.addPage();
      y = 24;
    }
    const d = new Date(t.date);
    const key = `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    if (key !== currentMonth) {
      currentMonth = key;
      doc.setFontSize(9);
      doc.setTextColor(...BRAND);
      doc.text(key, 16, y);
      y += 6;
    }
    doc.setTextColor(20, 20, 24);
    doc.setFontSize(9.5);
    doc.text(formatDate(t.date), 16, y);
    doc.text(doc.splitTextToSize(t.counterparty, 76)[0] ?? "", 40, y);
    doc.setTextColor(...MUTED);
    doc.text(t.category, 120, y);
    doc.setTextColor(t.type === "in" ? 22 : 170, t.type === "in" ? 120 : 40, t.type === "in" ? 70 : 50);
    doc.text(`${t.type === "in" ? "+" : "−"}${eur(t.amount).replace("-", "")}`, 194, y, { align: "right" });
    doc.setDrawColor(240, 240, 244);
    doc.line(16, y + 2.5, 194, y + 2.5);
    y += 8;
  }

  footer(doc);
  doc.save(`vypis-${s.owner.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
