import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/bank/AppShell";
import { formatDate, formatEur, updateTransactionCategory, useBank } from "@/lib/bank-store";
import { AiCategoryButton } from "@/components/bank/AiCategoryButton";
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
  const [busy, setBusy] = useState(false);
  const [desc, setDesc] = useState<string | null>(null);

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

        <section className="space-y-2 rounded-2xl bg-surface p-4">
          <p className="text-[12px] text-muted-foreground">Popis platby pre rozpočet</p>
          <input
            value={desc ?? t.note ?? ""}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="napr. obed s kolegami"
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-[14px] outline-none focus:border-primary"
          />
          <AiCategoryButton
            label="Prekategorizovať pomocou AI"
            description={desc ?? t.note ?? ""}
            counterparty={t.counterparty}
            amount={t.amount}
            type={t.type}
            onCategory={(c) => updateTransactionCategory(t.id, c, desc ?? t.note ?? "")}
          />
        </section>

        <button
          onClick={async () => {
            setBusy(true);
            try {
              await exportReceipt(s, t);
              toast.success("Potvrdenie o platbe bolo stiahnuté");
            } catch (e) {
              console.error(e);
              toast.error("Potvrdenie sa nepodarilo vytvoriť. Skúste to prosím znova.");
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-[14px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          <FileDown className="size-4" /> {busy ? "Pripravujem…" : "Stiahnuť potvrdenie (PDF)"}
        </button>
      </div>
    </AppShell>
  );
}
