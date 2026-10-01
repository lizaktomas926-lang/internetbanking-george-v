export interface ParsedPaymentData {
  iban?: string | undefined;
  amount?: string | undefined;
  recipientName?: string | undefined;
  vs?: string | undefined;
  note?: string | undefined;
}

export function parsePaymentQr(raw: string): ParsedPaymentData | null {
  const text = raw.trim();

  // 1. Payme URL formát: https://payme.sk?... alebo payme://...
  if (text.includes("payme.sk") || text.startsWith("payme:")) {
    try {
      const url = new URL(text.replace("payme://", "https://payme.sk/"));
      const p = url.searchParams;
      return {
        iban: p.get("iban") || p.get("IBAN") || undefined,
        amount: p.get("am") || p.get("amount") || undefined,
        recipientName: p.get("cn") || p.get("recipient") || undefined,
        vs: p.get("vs") || undefined,
        note: p.get("msg") || p.get("note") || undefined,
      };
    } catch {
      // fallback ďalej
    }
  }

  // 2. Európsky SEPA / EPC QR kód (začína BCD)
  if (text.startsWith("BCD")) {
    const lines = text.split(/\r?\n/);
    if (lines.length >= 7) {
      const recipientName = lines[4]?.trim();
      const iban = lines[5]?.trim();
      const amountRaw = lines[6]?.replace(/[^\d.,]/g, "").replace(",", ".");
      const vs = lines[8]?.trim();
      const note = lines[10]?.trim();

      return {
        recipientName: recipientName || undefined,
        iban: iban || undefined,
        amount: amountRaw || undefined,
        vs: vs || undefined,
        note: note || undefined,
      };
    }
  }

  // 3. Fallback: detekcia IBAN a sumy v obyčajnom texte (alebo JSON)
  const ibanMatch = text.match(/SK\d{2}\s?(?:\d{4}\s?){4}\d{4}/i);
  const amountMatch = text.match(/(\d+[.,]\d{2})\s?€?/);
  const vsMatch = text.match(/(?:VS|variabilny|var\.?\s*symbol)[:\s]*(\d{1,10})/i);

  if (ibanMatch) {
    return {
      iban: (ibanMatch[0] ?? "").replace(/\s+/g, "").toUpperCase(),
      amount: amountMatch?.[1]?.replace(",", ".") ?? undefined,
      vs: vsMatch?.[1] ?? undefined,
    };
  }

  return null;
}
