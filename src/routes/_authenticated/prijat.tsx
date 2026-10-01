import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, BrandHeader } from "@/components/bank/AppShell";
import { addTransaction, CATEGORIES, useBank } from "@/lib/bank-store";

export const Route = createFileRoute("/_authenticated/prijat")({
  head: () => ({
    meta: [
      { title: "Prijatý prevod | George" },
      { name: "description", content: "Zaevidujte prijatý prevod alebo zdieľajte svoj IBAN pre platbu." },
      { property: "og:title", content: "Prijatý prevod | George" },
      { property: "og:description", content: "Zaevidujte prijatý prevod alebo zdieľajte svoj IBAN pre platbu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Prijat,
});

const field =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary";

function Prijat() {
  const s = useBank();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Ostatné príjmy");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!name.trim()) return setError("Zadajte odosielateľa.");
    if (!Number.isFinite(value) || value <= 0) return setError("Zadajte platnú sumu.");
    addTransaction({
      type: "in",
      counterparty: name.trim(),
      amount: Math.round(value * 100) / 100,
      date: new Date().toISOString(),
      category,
    });
    navigate({ to: "/platby" });
  
  return (
    <AppShell>
            <BrandHeader title="Prijať peniaze" subtitle="Váš účet pre príchodzie platby" back />

      <div className="space-y-3 px-4 pb-24">

          <p className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">Môj IBAN</p>
          <p className="mt-2 font-mono text-[16px] tracking-wide">{s.iban}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{s.owner}</p>
        </section>

        <form onSubmit={submit} className="space-y-3 rounded-3xl bg-surface p-4">
          <p className="text-[14px] font-semibold">Zaevidovať prijatý prevod</p>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Odosielateľ" />
          <input
            className={`${field} text-[22px] font-bold`}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
          />
          <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {error ? <p className="text-[13px] text-expense">{error}</p> : null}
          <button type="submit" className="h-12 w-full rounded-2xl bg-income/20 text-[15px] font-semibold text-income">
            Pridať príjem
          </button>
        </form>
      </div>
    </AppShell>
  );
}
