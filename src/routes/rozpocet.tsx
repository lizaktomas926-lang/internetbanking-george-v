import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import {
  CATEGORIES,
  formatEur,
  inMonth,
  monthTotals,
  MONTHS,
  removeBudget,
  setBudget,
  useBank,
} from "@/lib/bank-store";

export const Route = createFileRoute("/rozpocet")({
  head: () => ({
    meta: [
      { title: "Rozpočet príjmov a výdavkov | Moja banka" },
      { name: "description", content: "Mesačný rozpočet: limity kategórií, príjmy, výdavky a zostatok." },
      { property: "og:title", content: "Rozpočet príjmov a výdavkov | Moja banka" },
      { property: "og:description", content: "Mesačný rozpočet: limity kategórií, príjmy, výdavky a zostatok." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rozpocet,
});

const field =
  "w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary";

function Rozpocet() {
  const s = useBank();
  const { income, expense } = monthTotals(s);
  const month = MONTHS[new Date().getUTCMonth()];
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState("");

  const spentBy = (cat: string) =>
    s.transactions
      .filter((t) => t.type === "out" && t.category === cat && inMonth(t))
      .reduce((a, t) => a + t.amount, 0);

  const max = Math.max(income, expense, 1);

  return (
    <AppShell>
      <header className="brand-header px-5 pb-16 pt-6 text-brand-foreground">
        <h1 className="text-[34px] font-bold leading-none">Rozpočet</h1>
        <p className="mt-2 text-sm opacity-80">{month}</p>
      </header>

      <div className="-mt-12 space-y-4 px-4">
        <section className="rounded-3xl bg-surface p-5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-income">Príjmy</span>
            <span className="font-bold text-income">{formatEur(income)}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-income" style={{ width: `${(income / max) * 100}%` }} />
          </div>
          <div className="mt-4 flex items-center justify-between text-[13px]">
            <span className="text-expense">Výdavky</span>
            <span className="font-bold text-expense">{formatEur(expense)}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-expense" style={{ width: `${(expense / max) * 100}%` }} />
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">
            Zostáva vám <span className="font-bold text-foreground">{formatEur(income - expense)}</span>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[16px] font-semibold">Limity kategórií</h2>
          {s.budgets.length === 0 ? (
            <p className="rounded-2xl bg-surface p-5 text-center text-sm text-muted-foreground">
              Zatiaľ žiadne limity.
            </p>
          ) : (
            s.budgets.map((b) => {
              const spent = spentBy(b.category);
              const pct = Math.min(100, (spent / b.limit) * 100);
              const over = spent > b.limit;
              return (
                <div key={b.category} className="rounded-2xl bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold">{b.category}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-[12px] ${over ? "text-expense" : "text-muted-foreground"}`}>
                        {formatEur(spent)} / {formatEur(b.limit)}
                      </span>
                      <button onClick={() => removeBudget(b.category)} aria-label="Odstrániť limit">
                        <X className="size-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full ${over ? "bg-expense" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="space-y-3 rounded-2xl bg-surface p-4">
          <p className="text-[14px] font-semibold">Nastaviť limit</p>
          <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            className={field}
            inputMode="decimal"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Mesačný limit (€)"
          />
          <button
            onClick={() => {
              const v = Number(limit.replace(",", "."));
              if (Number.isFinite(v) && v > 0) {
                setBudget(category, v);
                setLimit("");
              }
            }}
            className="h-11 w-full rounded-2xl bg-primary text-[14px] font-semibold text-primary-foreground"
          >
            Uložiť limit
          </button>
        </section>
      </div>
    </AppShell>
  );
}
