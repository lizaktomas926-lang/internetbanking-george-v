import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, FileDown } from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { TxnRow } from "@/components/bank/TxnRow";
import { balance, formatEur, groupByMonth, useBank } from "@/lib/bank-store";
import { exportStatement } from "@/lib/pdf-export";

export const Route = createFileRoute("/platby")({
  head: () => ({
    meta: [
      { title: "História platieb | George" },
      { name: "description", content: "Všetky odoslané a prijaté prevody zoradené po mesiacoch." },
      { property: "og:title", content: "História platieb | George" },
      { property: "og:description", content: "Všetky odoslané a prijaté prevody zoradené po mesiacoch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Platby,
});

const filters = [
  { key: "all", label: "Všetko" },
  { key: "in", label: "Prijaté" },
  { key: "out", label: "Odoslané" },
] as const;

function Platby() {
  const s = useBank();
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const list = s.transactions.filter((t) => (filter === "all" ? true : t.type === filter));
  const groups = groupByMonth(list);
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      await exportStatement(s, list);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <header className="brand-header px-5 pb-16 pt-6 text-brand-foreground">
        <h1 className="text-[34px] font-bold leading-none">Platby</h1>
      </header>

      <div className="-mt-12 space-y-4 px-4">
        <section className="rounded-3xl bg-surface p-5">
          <p className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">Účet</p>
          <p className="mt-1 text-[28px] font-bold leading-none">{formatEur(balance(s))}</p>
          <button
            onClick={download}
            disabled={busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-[13px] font-semibold disabled:opacity-60"
          >
            <FileDown className="size-4" /> {busy ? "Pripravujem…" : "Stiahnuť PDF výpis"}
          </button>
        </section>

        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                filter === f.key ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {groups.length === 0 ? (
          <p className="rounded-2xl bg-surface p-6 text-center text-sm text-muted-foreground">
            Zatiaľ žiadne platby.
          </p>
        ) : (
          groups.map(([label, items]) => (
            <section key={label}>
              <h2 className="mb-2 text-[15px] font-semibold">{label}</h2>
              <div className="space-y-2">
                {items.map((t) => (
                  <TxnRow key={t.id} txn={t} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <Link
        to="/nova-platba"
        className="fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg"
      >
        <Plus className="size-4" /> Nová platba
      </Link>
    </AppShell>
  );
}
