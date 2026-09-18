import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowDownLeft, PiggyBank, PieChart } from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { TxnRow } from "@/components/bank/TxnRow";
import { balance, formatEur, monthTotals, MONTHS, useBank } from "@/lib/bank-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prehľad účtu | Moja banka" },
      { name: "description", content: "Zostatok, príjmy a výdavky, sporenie a rozpočet na jednom mieste." },
      { property: "og:title", content: "Prehľad účtu | Moja banka" },
      { property: "og:description", content: "Zostatok, príjmy a výdavky, sporenie a rozpočet na jednom mieste." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Prehlad,
});

function Prehlad() {
  const s = useBank();
  const total = balance(s);
  const { income, expense } = monthTotals(s);
  const month = (MONTHS[new Date().getUTCMonth()] ?? "").toLowerCase();
  const goal = s.goals[0];

  return (
    <AppShell>
      <header className="brand-header px-5 pb-16 pt-6 text-brand-foreground">
        <p className="text-[13px] font-medium opacity-80">Dobrý deň</p>
        <h1 className="mt-1 text-[34px] font-bold leading-none">Prehľad</h1>
        <p className="mt-2 text-sm opacity-80">{s.owner}</p>
      </header>

      <div className="-mt-12 space-y-4 px-4">
        <section className="rounded-3xl bg-surface p-5">
          <p className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">Zostatok na účte</p>
          <p className={`mt-2 text-[36px] font-bold leading-none ${total < 0 ? "text-expense" : ""}`}>
            {formatEur(total)}
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">{s.iban}</p>
          <div className="mt-4 flex gap-2">
            <Link
              to="/nova-platba"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              <Plus className="size-4" /> Nová platba
            </Link>
            <Link
              to="/prijat"
              className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-surface-2 px-4 text-sm font-semibold"
            >
              <ArrowDownLeft className="size-4" /> Prijať
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-[12px] text-muted-foreground">Výdavky za {month}</p>
            <p className="mt-1 text-[20px] font-bold text-expense">{formatEur(expense)}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-[12px] text-muted-foreground">Príjmy za {month}</p>
            <p className="mt-1 text-[20px] font-bold text-income">{formatEur(income)}</p>
          </div>
        </section>

        {goal ? (
          <Link to="/sporenie" className="flex items-center gap-4 rounded-2xl bg-surface p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <PiggyBank className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between">
                <span className="text-[14px] font-semibold">{goal.name}</span>
                <span className="text-[12px] font-semibold text-income">
                  {Math.round((goal.saved / goal.target) * 100)}%
                </span>
              </span>
              <span className="mt-0.5 block text-[12px] text-muted-foreground">
                {formatEur(goal.saved)} z {formatEur(goal.target)}
              </span>
              <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full bg-income"
                  style={{ width: `${Math.min(100, (goal.saved / goal.target) * 100)}%` }}
                />
              </span>
            </span>
          </Link>
        ) : null}

        <Link to="/rozpocet" className="flex items-center gap-4 rounded-2xl bg-surface p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 text-muted-foreground">
            <PieChart className="size-5" />
          </span>
          <span className="flex-1 text-[14px] font-semibold">Rozpočet výdavkov</span>
          <span className="text-[12px] text-muted-foreground">{s.budgets.length} kategórií</span>
        </Link>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">Posledné pohyby</h2>
            <Link to="/platby" className="text-[12px] font-semibold text-primary">
              Zobraziť všetky
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {[...s.transactions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((t) => (
                <TxnRow key={t.id} txn={t} />
              ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
