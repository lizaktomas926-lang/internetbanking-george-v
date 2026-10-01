import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check, ArrowDownLeft } from "lucide-react";
import { AppShell, BrandHeader } from "@/components/bank/AppShell";
import { addTransaction, CATEGORIES, useBank } from "@/lib/bank-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/prijat")({
  head: () => ({
    meta: [
      { title: "Prijať peniaze | George" },
      { name: "description", content: "Zaevidujte prijatý prevod alebo zdieľajte svoj IBAN pre platbu." },
    ],
  }),
  component: Prijat,
});

const field =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary";

export default function Prijat() {
  const s = useBank();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Ostatné príjmy");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  function copyIban() {
    if (!s.iban) return;
    navigator.clipboard.writeText(s.iban);
    setCopied(true);
    toast.success("IBAN bol skopírovaný do schránky");
    setTimeout(() => setCopied(false), 2000);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const value = Number(amount.replace(",", "."));
    if (!name.trim()) return setError("Zadajte odosielateľa.");
    if (!Number.isFinite(value) || value <= 0) return setError("Zadajte platnú sumu.");

    setBusy(true);
    try {
      await addTransaction({
        type: "in",
        counterparty: name.trim(),
        amount: Math.round(value * 100) / 100,
        date: new Date().toISOString(),
        category,
      });
      toast.success("Prijatý prevod bol zaevidovaný");
      navigate({ to: "/platby" });
    } catch (err) {
      console.error(err);
      setError("Nepodarilo sa uložiť príjem.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <BrandHeader
        title="Prijať peniaze"
        subtitle="Váš účet pre príchodzie platby"
        back
      />

      <div className="space-y-4 px-4 pb-24">
        {/* Karta s vlastným IBAN-om */}
        <section className="rounded-3xl bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Môj IBAN
            </p>
            <button
              type="button"
              onClick={copyIban}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-border/40"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span>Skopírované</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-primary" />
                  <span>Kopírovať</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-3 font-mono text-[17px] font-bold tracking-wide text-foreground">
            {s.iban || "Načítavam IBAN..."}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">{s.owner || "Klient George"}</p>
        </section>

        {/* Formulár pre zaevidovanie platby */}
        <form onSubmit={submit} className="space-y-3 rounded-3xl bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-1 text-[15px] font-bold text-foreground">
            <ArrowDownLeft className="size-4.5 text-income" />
            <span>Zaevidovať prijatý prevod</span>
          </div>

          <label className="block">
            <span className="text-[12px] text-muted-foreground">Odosielateľ</span>
            <input
              className={`${field} mt-1`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meno odosielateľa alebo spoločnosti"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-muted-foreground">Suma (€)</span>
            <input
              className={`${field} mt-1 text-[22px] font-bold text-foreground`}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-muted-foreground">Kategória</span>
            <select
              className={`${field} mt-1`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="rounded-xl bg-destructive/10 p-2.5 text-[13px] font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-income text-[15px] font-semibold text-white shadow-md transition-opacity hover:opacity-95 disabled:opacity-50"
          >
            <span>{busy ? "Ukladám príjem…" : "Pridať príjem na účet"}</span>
          </button>
        </form>
      </div>
    </AppShell>
  );
}
