import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, BrandHeader } from "@/components/bank/AppShell";
import { addTransaction, balance, CATEGORIES, formatEur, useBank } from "@/lib/bank-store";
import { toast } from "sonner";

export const Route = createFileRoute("/nova-platba")({
  head: () => ({
    meta: [
      { title: "Nová platba | George" },
      { name: "description", content: "Zadajte prevod na IBAN príjemcu, sumu a správu pre príjemcu." },
      { property: "og:title", content: "Nová platba | George" },
      { property: "og:description", content: "Zadajte prevod na IBAN príjemcu, sumu a správu pre príjemcu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NovaPlatba,
});

const field =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary";

function NovaPlatba() {
  const s = useBank();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [iban, setIban] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Prevod");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const value = Number(amount.replace(",", "."));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Zadajte meno príjemcu.");
    if (!iban.trim()) return setError("Zadajte IBAN príjemcu.");
    if (!Number.isFinite(value) || value <= 0) return setError("Zadajte platnú sumu.");
    addTransaction({
      type: "out",
      counterparty: name.trim(),
      iban: iban.trim().toUpperCase(),
      amount: Math.round(value * 100) / 100,
      date: new Date().toISOString(),
      category,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    function submit(e: React.FormEvent) {
  e.preventDefault();
  if (!name.trim()) return setError("Zadajte meno príjemcu.");
  if (!iban.trim()) return setError("Zadajte IBAN príjemcu.");
  if (!Number.isFinite(value) || value <= 0) return setError("Zadajte platnú sumu.");

  addTransaction({
    type: "out",
    counterparty: name.trim(),
    iban: iban.trim().toUpperCase(),
    amount: Math.round(value * 100) / 100,
    date: new Date().toISOString(),
    category,
    ...(note.trim() ? { note: note.trim() } : {}),
  });

  toast.success("Platba bola úspešne odoslaná");

  navigate({ to: "/platby" });
    }

  return (
    <AppShell>
      <BrandHeader title="Nová platba" subtitle={`Z účtu · ${formatEur(balance(s))}`} back />

      <form onSubmit={submit} className="-mt-12 space-y-3 px-4">
        <div className="space-y-3 rounded-3xl bg-surface p-4">
          <label className="block">
            <span className="text-[12px] text-muted-foreground">Príjemca</span>
            <input className={`${field} mt-1`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Meno a priezvisko" />
          </label>
          <label className="block">
            <span className="text-[12px] text-muted-foreground">IBAN / číslo účtu</span>
            <input
              className={`${field} mt-1 font-mono tracking-wide`}
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="SK00 0000 0000 0000 0000 0000"
            />
          </label>
          <label className="block">
            <span className="text-[12px] text-muted-foreground">Suma (€)</span>
            <input
              className={`${field} mt-1 text-[22px] font-bold`}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </label>
          <label className="block">
            <span className="text-[12px] text-muted-foreground">Kategória</span>
            <select className={`${field} mt-1`} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] text-muted-foreground">Správa pre príjemcu</span>
            <input className={`${field} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nepovinné" />
          </label>
        </div>

        {error ? <p className="px-1 text-[13px] text-expense">{error}</p> : null}

        <button
          type="submit"
          className="h-12 w-full rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground"
        >
          Odoslať platbu
        </button>
      </form>
    </AppShell>
  );}
