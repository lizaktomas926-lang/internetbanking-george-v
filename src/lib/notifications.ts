import jsPDF from 'jspdf';

export interface TransactionPDFData {
  id: string;
  amount: number;
  currency?: string;
  senderName: string;
  senderIban: string;
  receiverName: string;
  receiverIban: string;
  date: string;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  note?: string;
  type?: string;
}

export const generateTransactionPDF = (txn: TransactionPDFData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = txn.currency || 'EUR';
  const amountFormatted = `${txn.amount > 0 ? '+' : ''}${txn.amount.toFixed(2).replace('.', ',')} ${currency}`;

  // --- HLAVIČKA BANKY (SLOVENSKÁ SPORITEĽŇA) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 153); // Modrá farba SLSP
  doc.text('SLOVENSKÁ SPORITEĽŇA', 15, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Slovenská sporiteľňa, a.s.', 15, 26);
  doc.text('Tomášikova 48, 832 37 Bratislava', 15, 30);
  doc.text('IČO 00 151 653, zapísaná v OR Mestského súdu Bratislava III., odd. Sa, vl. č. 601/B', 15, 34);

  // BIC / SWIFT vpravo hore
  doc.setFont('helvetica', 'bold');
  doc.text('BIC / SWIFT:', 140, 26);
  doc.setFont('helvetica', 'normal');
  doc.text('GIBASKBX', 170, 26);

  // Deliaca čiara pod hlavičkou
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, 38, 195, 38);

  // --- NÁZOV DOKUMENTU ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Potvrdenie o zrealizovanej platbe', 15, 48);

  // Dátum vyhotovenia
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Dátum vyhotovenia: ${txn.date}`, 15, 54);

  // --- SUMA TRANSAKCIE (Zvýraznený blok) ---
  doc.setFillColor(245, 247, 250);
  doc.rect(15, 60, 180, 20, 'F');

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Suma transakcie:', 20, 72);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(txn.amount < 0 ? 180 : 0, txn.amount < 0 ? 0 : 120, 0); // Červená / Zelená
  doc.text(amountFormatted, 185, 72, { align: 'right' }); // Zarovnané doprava

  // --- DETAIL PRÍKAZCU A PRÍJEMCU (Tabuľkový prehľad) ---
  let startY = 90;

  const drawRow = (label: string, value: string, y: number, isBold: boolean = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(label, 15, y);

    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(value || '-', 195, y, { align: 'right' }); // Zarovnanie hodnoty doprava

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(15, y + 2, 195, y + 2);
  };

  drawRow('Názov účtu príkazcu', txn.senderName, startY);
  startY += 8;
  drawRow('Číslo účtu príkazcu (IBAN)', txn.senderIban, startY, true);
  startY += 8;
  drawRow('Názov protiúčtu (Príjemca)', txn.receiverName, startY);
  startY += 8;
  drawRow('Číslo účtu príjemcu (IBAN)', txn.receiverIban, startY, true);
  startY += 8;
  drawRow('Dátum zúčtovania', txn.date, startY);
  startY += 8;

  if (txn.variableSymbol) {
    drawRow('Variabilný symbol', txn.variableSymbol, startY);
    startY += 8;
  }
  if (txn.specificSymbol) {
    drawRow('Špecifický symbol', txn.specificSymbol, startY);
    startY += 8;
  }
  if (txn.constantSymbol) {
    drawRow('Konštantný symbol', txn.constantSymbol, startY);
    startY += 8;
  }
  if (txn.note) {
    drawRow('Poznámka / Popis', txn.note, startY);
    startY += 8;
  }

  // --- POZNÁMKA PRE KLIENTA (Podľa vzoru SLSP) ---
  startY += 10;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  const noteText =
    'Poznámka: Toto potvrdenie je vyhotovené elektronicky a je platné bez pečiatky a podpisu. Všetky poplatky sú účtované podľa platného Sadzobníka poplatkov Slovenskej sporiteľne, a.s.';
  const splitNote = doc.splitTextToSize(noteText, 180);
  doc.text(splitNote, 15, startY);

  // --- PÄTIČKA (Slovenská sporiteľňa kontakty) ---
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(200, 200, 200);
  doc.line(15, pageHeight - 15, 195, pageHeight - 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('info@slsp.sk', 15, pageHeight - 9);
  doc.text('Klientske centrum: 0850 111 888', 105, pageHeight - 9, { align: 'center' });
  doc.text('www.slsp.sk', 195, pageHeight - 9, { align: 'right' });

  // Stiahnutie súboru
  doc.save(`Potvrdenie_platba_${txn.id || 'slsp'}.pdf`);
};
