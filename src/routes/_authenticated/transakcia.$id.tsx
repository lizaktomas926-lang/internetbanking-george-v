import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Download, Tag, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppShell } from "@/components/bank/AppShell";
import { formatDate, formatEur, useBank } from "@/lib/bank-store";
import { exportReceipt } from "@/lib/pdf-export";

export const Route = createFileRoute("/_authenticated/transakcia/$id")({
  head: () => ({
    meta: [
      { title: "Detail transakcie | George" },
      { name: "description", content: "Podrobnosti platby: suma, dátum, protistrana, IBAN a poznámka." },
      { property: "og:title", content: "Detail transakcie | George" },
      { property: "og:description", content: "Podrobnosti platby: suma, dátum, protistrana, IBAN a poznámka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detail,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[13px] text-detail-muted">{label}</dt>
      <dd className="mt-1 break-words text-[17px] leading-relaxed">{value}</dd>
    </div>
  );
}

function Detail() {
  const { id } = Route.useParams();
  const s = useBank();
  const t = s.transactions.find((x) => x.id === id);
  const [busy, setBusy] = useState(false);

  if (!t) {
    return (
      <AppShell>
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">Transakcia sa nenašla.</p>
          <Link to="/platby" className="mt-4 inline-block text-[13px] font-semibold text-primary">
            Späť na platby
          </Link>
        </div>
      </AppShell>
    );
  }

  const income = t.type === "in";
  const ordered = [...s.transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const index = ordered.findIndex((transaction) => transaction.id === t.id);
  const runningBalance = ordered.slice(0, index + 1).reduce((sum, transaction) => sum + (transaction.type === "in" ? transaction.amount : -transaction.amount), 0);
  const amountParts = t.amount.toFixed(2).split(".");

  return (
    <AppShell>
      <div className="transaction-detail min-h-screen bg-detail-background pb-6 font-sans text-foreground">
      <header className="px-4 pb-6 pt-6">
        <Button asChild variant="ghost" size="icon" className="text-detail-action" aria-label="Späť na platby">
          <Link to="/platby"><ArrowLeft /></Link>
        </Button>
      </header>

      <div className="space-y-4 px-4">
        <section className="rounded-3xl bg-detail-surface p-4">
          <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
          <h1 className="break-words text-[20px] font-bold leading-snug">{t.counterparty}</h1>
          <p className="mt-1 text-[32px] font-bold leading-tight" aria-label={`${income ? "+" : "−"}${formatEur(t.amount)}`}>
            {income ? "+" : "−"}
            {Math.floor(t.amount).toLocaleString("sk-SK")},<span className="align-top text-[19px]">{amountParts[1]}</span> €
          </p>
          </div>
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-detail-direction text-detail-muted">
            {income ? <ArrowDownLeft className="size-8" /> : <ArrowUpRight className="size-8" />}
          </span>
          </div>
          <Button
            variant="secondary"
            disabled={busy}
            title="Stiahnuť potvrdenie (PDF)"
            className="mt-5 h-9 rounded-full bg-detail-action-surface px-4 font-semibold text-detail-action hover:bg-detail-action-surface/80"
            onClick={async () => {
              setBusy(true);
              try {
                await exportReceipt(s, t);
                toast.success("Potvrdenie o platbe bolo stiahnuté");
              } catch (error) {
                console.error(error);
                toast.error("Potvrdenie sa nepodarilo vytvoriť. Skúste to prosím znova.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Download /> {busy ? "Pripravujem…" : "Potvrdenie PDF"}
          </Button>
        </section>

        <section className="flex items-center gap-4 rounded-3xl bg-detail-surface px-4 py-5">
          <Tag className="size-6 shrink-0 text-detail-action" />
          <span className="rounded-full border border-detail-muted px-3 py-1 text-[13px] font-semibold text-detail-muted">
            {t.category}
          </span>
        </section>

        {t.note ? <section className="flex items-start gap-4 rounded-3xl bg-detail-surface px-4 py-5">
          <Pencil className="size-6 shrink-0 text-detail-action" />
          <p className="break-words text-[16px] text-detail-muted">{t.note}</p>
        </section> : null}

        <dl className="space-y-6 rounded-3xl bg-detail-surface p-4">
          <Row label={income ? "Odosielateľ" : "Príjemca"} value={t.counterparty} />
          {t.iban ? <Row label="IBAN" value={t.iban} /> : null}
          <Row label="Dátum spracovania" value={formatDate(t.date)} />
          <Row label="Typ transakcie" value={income ? "Prijatý prevod" : "Platobný príkaz na úhradu"} />
          {t.vs ? <Row label="Variabilný symbol" value={t.vs} /> : null}
          <Row label="Priebežný zostatok" value={formatEur(runningBalance)} />
        </dl>
      </div>
      </div>
    </AppShell>
  );
}
