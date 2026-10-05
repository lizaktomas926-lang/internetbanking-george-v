import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FilePenLine } from "lucide-react";
import { balance, formatDate, formatEur, groupByMonth, useBank } from "@/lib/bank-store";
import { Amount } from "@/components/bank/Amount";

export const Route = createFileRoute("/_authenticated/ucet")({
  head: () => ({
    meta: [
      { title: "Účet a transakcie | George" },
      { name: "description", content: "Zostatok účtu a história transakcií v George." },
      { property: "og:title", content: "Účet a transakcie | George" },
      { property: "og:description", content: "Zostatok účtu a história transakcií v George." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UcetPage,
});

const tabs = [
  { label: "Transakcie", to: "/ucet" },
  { label: "Funkcie", to: "/rozpocet" },
  { label: "Karty", to: "/karty" },
  { label: "Info", to: "/nastavenia" },
] as const;

function UcetPage() {
  const s = useBank();
  const total = balance(s);
  const groups = groupByMonth(s.transactions);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background pb-28 text-foreground">
      <div className="h-44 bg-gradient-to-b from-[#8a0a3c] to-[#6e0832] px-4 pt-5">
        <Link to="/" aria-label="Späť" className="inline-flex p-2 -ml-2 text-white">
          <ArrowLeft className="size-6" />
        </Link>
      </div>

      <div className="-mt-24 px-4">
        <div className="flex items-start justify-between rounded-3xl bg-surface p-5 shadow-lg">
          <div>
            <h1 className="text-lg font-bold">Účet</h1>
            <div className="mt-1 text-3xl font-bold"><Amount value={total} /></div>
            <p className="mt-1 text-sm text-muted-foreground">{formatEur(total)} vlastné zdroje</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=100&auto=format&fit=crop&q=80"
            alt=""
            className="size-12 rounded-full object-cover"
          />
        </div>

        <nav className="mt-4 flex items-center justify-between gap-1" data-no-swipe>
          {tabs.map((t) => (
            <Link
              key={t.label}
              to={t.to}
              className={`rounded-full px-4 py-2 text-[15px] font-semibold text-primary ${
                t.to === "/ucet" ? "bg-surface" : ""
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-4 rounded-3xl bg-surface p-4">
          <FilePenLine className="size-6 text-destructive" />
          <div>
            <p className="font-semibold">Platobné príkazy a rezervácie</p>
            <p className="text-sm text-muted-foreground">0 nezrealizovaných platieb & 0 rezervácií</p>
          </div>
        </div>

        {groups.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">Zatiaľ žiadne transakcie.</p>
        ) : (
          groups.map(([month, txns]) => (
            <section key={month} className="mt-6">
              <h2 className="mb-2 font-bold">{month}</h2>
              <div className="space-y-2">
                {txns.map((t) => (
                  <Link
                    key={t.id}
                    to="/transakcia/$id"
                    params={{ id: t.id }}
                    className="flex items-start gap-3 rounded-3xl bg-surface p-4"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {t.counterparty.trim().charAt(0).toUpperCase() || "S"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="truncate font-semibold">{t.counterparty}</p>
                        <p className={`shrink-0 font-semibold ${t.type === "in" ? "text-emerald-500" : ""}`}>
                          {t.type === "in" ? "+" : "-"}
                          {formatEur(t.amount)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(t.date)}</p>
                      {t.vs ? <p className="text-sm text-muted-foreground">VS: {t.vs}</p> : null}
                      <span className="mt-1 inline-block rounded-full border border-muted-foreground/60 px-2 text-xs text-muted-foreground">
                        {t.category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
