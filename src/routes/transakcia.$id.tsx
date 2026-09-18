import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown } from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { formatDate, formatEur, useBank } from "@/lib/bank-store";
import { exportReceipt } from "@/lib/pdf-export";

export const Route = createFileRoute("/transakcia/$id")({
  head: () => ({
    meta: [
      { title: "Detail transakcie | Moja banka" },
      { name: "description", content: "Podrobnosti platby: suma, dátum, protistrana, IBAN a poznámka." },
      { property: "og:title", content: "Detail transakcie | Moja banka" },
      { property: "og:description", content: "Podrobnosti platby: suma, dátum, protistrana, IBAN a poznámka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detail,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border px-4 py-3 last:border-0">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[15px]">{value}</p>
    </div>
  );
}

function Detail() {
  const { id } = Route.useParams();
  const s = useBank();
  const t = s.transactions.find((x) => x.id === id);

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

  return (
    <AppShell>
      <header className="brand-header px-5 pb-16 pt-6 text-brand-foreground">
        <Link to="/platby" className="text-2xl leading-none">
          ←
        </Link>
        <h1 className="mt-4 text-[26px] font-bold leading-tight">{t.counterparty}</h1>
      </header>

      <div className="-mt-12 space-y-3 px-4">
        <section className="rounded-3xl bg-surface p-5">
          <p className={`text-[32px] font-bold leading-none ${income ? "text-income" : "text-foreground"}`}>
            {income ? "+" : "−"}
            {formatEur(t.amount).replace("-", "")}
          </p>
          <span className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground">
            {t.category}
          </span>
        </section>

        <section className="rounded-2xl bg-surface">
          <Row label="Typ transakcie" value={income ? "Prijatý prevod" : "Odoslaná platba"} />
          <Row label="Dátum spracovania" value={formatDate(t.date)} />
          {t.iban ? <Row label="IBAN protistrany" value={t.iban} /> : null}
          {t.vs ? <Row label="Konštantný symbol" value={t.vs} /> : null}
          {t.note ? <Row label="Poznámka" value={t.note} /> : null}
        </section>
      </div>
    </AppShell>
  );
}
