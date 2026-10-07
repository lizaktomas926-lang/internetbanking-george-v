import { describe, it, expect } from "vitest";
import { formatDate, groupByMonth, type Txn } from "@/lib/bank-store";

describe("História transakcií a radenie", () => {
  it("zoradí transakcie od najnovšej po najstaršiu", () => {
    const items: Txn[] = [
      { id: "1", type: "out", counterparty: "Billa", amount: 20, date: "2026-10-02T10:00:00Z", category: "Potraviny" },
      { id: "2", type: "out", counterparty: "Slovnaft", amount: 50, date: "2026-10-07T12:00:00Z", category: "Doprava" },
      { id: "3", type: "in", counterparty: "Mzda", amount: 1500, date: "2026-09-15T08:00:00Z", category: "Mzda" },
    ];

    const grouped = groupByMonth(items);
    
    // Október musí byť prvý, September druhý
    expect(grouped[0][0]).toBe("Október 2026");
    expect(grouped[1][0]).toBe("September 2026");
    
    // V októbri musí byť Slovnaft (7.10.) pred Billou (2.10.)
    expect(grouped[0][1][0].counterparty).toBe("Slovnaft");
    expect(grouped[0][1][1].counterparty).toBe("Billa");
  });

  it("správne naformátuje dátum v miestnom čase", () => {
    // Platba z 7. októbra o 23:30 (UTC+2) nesmie ukazovať predchádzajúci deň
    const isoDate = "2026-10-07T21:30:00.000Z";
    const formatted = formatDate(isoDate);
    expect(formatted).toBe("07.10.2026");
  });

  it("nová platba z dnešného dňa sa zaradí na samý vrch", () => {
    const existing: Txn[] = [
      { id: "1", type: "out", counterparty: "Staršia platba", amount: 10, date: "2026-10-06T10:00:00Z", category: "Iné" },
    ];
    const newTxn: Txn = {
      id: "2",
      type: "out",
      counterparty: "Dnešná platba",
      amount: 15,
      date: new Date().toISOString(),
      category: "Potraviny",
    };

    const all = [newTxn, ...existing].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    expect(all[0].counterparty).toBe("Dnešná platba");
  });
});
