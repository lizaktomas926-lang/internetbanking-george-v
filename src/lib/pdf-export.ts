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
  doc.text("MOJA BANKA", 14, 24);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("osobné bankovníctvo", 14, 30);
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(`č. ${new Date(today).getUTCFullYear()}/1 - Strana 1/1`, 196, 24, { align: "right" });

  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    ["Moja banka, a.s.", "Tomášikova 48, 832 37 Bratislava", "IČO 00 151 653, zapísaná v Obchodnom registri"],
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

  doc.save(`vypis-${s.owner.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
