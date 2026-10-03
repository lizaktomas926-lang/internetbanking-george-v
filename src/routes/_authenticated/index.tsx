import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Bell,
  User,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Copy,
  CreditCard,
  QrCode,
  Smartphone,
  Repeat,
  PiggyBank,
  Check,
  Send,
  Download,
} from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { TxnRow } from "@/components/bank/TxnRow";
import { balance, formatEur, monthTotals, MONTHS, useBank } from "@/lib/bank-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Internetbanking George" },
      { name: "description", content: "Prehľad účtu a financií George." },
    ],
  }),
  component: GeorgePrehlad,
});

type TabType = "transakcie" | "funkcie" | "karty" | "info";

export default function GeorgePrehlad() {
  const s = useBank();
  const total = balance(s);
  const { income, expense } = monthTotals(s);
  const month = (MONTHS[new Date().getUTCMonth()] ?? "október").toLowerCase();
  const [activeTab, setActiveTab] = useState<TabType>("transakcie");
  const [copied, setCopied] = useState(false);

  function copyIban() {
    navigator.clipboard.writeText(s.iban);
    setCopied(true);
    toast.success("IBAN bol skopírovaný");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppShell>
      {/* 1. George Modrá hlavička */}
      <header className="brand-header px-5 pt-7 pb-12 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Slovenská sporiteľňa</span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Prehľad</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/platby" className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20">
              <Search className="size-4.5" />
            </Link>
            <Link to="/upozornenia" className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20">
              <Bell className="size-4.5" />
            </Link>
            <Link to="/nastavenia" className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20">
              <User className="size-4.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Mesačný box Výdavky / Príjmy vysunutý cez hlavičku */}
      <div className="-mt-7 px-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="pr-3">
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <span>Výdavky za {month}</span>
                <ArrowDownRight className="size-3 text-expense" />
              </div>
              <p className="mt-1 text-base font-bold text-expense">{formatEur(expense)}</p>
            </div>
            <div className="pl-3">
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <span>Príjmy za {month}</span>
                <ArrowUpRight className="size-3 text-income" />
              </div>
              <p className="mt-1 text-base font-bold text-income">{formatEur(income)}</p>
            </div>
          </div>
          <div className="mt-3 border-t border-border/70 pt-2.5">
            <Link to="/rozpocet" className="flex items-center justify-between text-xs font-medium text-muted-foreground transition hover:text-foreground">
              <span>{s.budgets?.length ? "Nastavený rozpočet" : "Neurčený rozpočet"}</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Vaše produkty & Plastická karta SPACE účtu */}
      <div className="mt-5 px-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Vaše produkty
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground">
            1 bežný účet
          </span>
        </div>

        {/* Plastická George SPACE Karta */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f243e] via-[#16355c] to-[#0a1829] p-6 text-white shadow-xl shadow-blue-950/20 border border-white/10">
          {/* Svetelný reflex / lesk na karte */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-400/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />

          {/* Hlavička karty: Typ účtu a odznak */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <span className="text-xs font-semibold tracking-wide text-cyan-200 uppercase">
                SPACE účet
              </span>
            </div>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-slate-300 backdrop-blur-md">
              Hlavný účet
            </span>
          </div>

          {/* Zostatky: Disponibilný a Účtovný */}
          <div className="relative mt-4">
            <span className="text-[11px] font-medium text-slate-300">
              Disponibilný zostatok
            </span>
            <p className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {formatEur(total)}
            </p>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-300">
              <span>
                Účtovný: <strong className="text-white font-semibold">{formatEur(total + 35.5)}</strong>
              </span>
              <span>•</span>
              <span className="text-amber-300">
                Blokované: <strong>35,50 €</strong>
              </span>
            </div>
          </div>

          {/* IBAN s možnosťou rýchleho kopírovania */}
          <div className="relative mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <span className="tracking-wider">{s.iban}</span>
            </div>
            <button
              type="button"
              onClick={copyIban}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-medium text-white transition hover:bg-white/20 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-400" />
                  <span>Skopírované</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Kopírovať</span>
                </>
              )}
            </button>
          </div>

          {/* Rýchle akcie George (Zaplatiť, Skenovať, Payme, Výpis) */}
          <div className="relative mt-5 grid grid-cols-4 gap-2 pt-2">
            <Link
              to="/nova-platba"
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 p-2.5 text-center transition hover:bg-white/15 active:scale-95 backdrop-blur-sm"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-sm">
                <Send className="size-4 -rotate-45" />
              </div>
              <span className="text-[10px] font-semibold text-slate-100">Zaplatiť</span>
            </Link>

            <Link
              to="/platby"
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 p-2.5 text-center transition hover:bg-white/15 active:scale-95 backdrop-blur-sm"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white">
                <QrCode className="size-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-100">Skenovať</span>
            </Link>

            <Link
              to="/prijat"
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 p-2.5 text-center transition hover:bg-white/15 active:scale-95 backdrop-blur-sm"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white">
                <Smartphone className="size-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-100">Payme</span>
            </Link>

            <Link
              to="/karty"
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 p-2.5 text-center transition hover:bg-white/15 active:scale-95 backdrop-blur-sm"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white">
                <CreditCard className="size-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-100">Karta</span>
            </Link>
          </div>
        </div>

        {/* Spodný kontajner so záložkami transakcií */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          {/* Záložky (Transakcie, Funkcie, Karty, Info) */}
          <div className="flex border-b border-border text-xs font-semibold">
            {(["transakcie", "funkcie", "karty", "info"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-2.5 text-center capitalize transition-all ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "transakcie" && "Transakcie"}
                {tab === "funkcie" && "Funkcie"}
                {tab === "karty" && "Karty"}
                {tab === "info" && "Info"}
              </button>
            ))}
          </div>

          {/* Obsah záložiek */}
          {activeTab === "transakcie" && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                <span>Rezervácie a čakajúce platby</span>
                <span className="font-semibold text-amber-500">1 blokácia (35,50 €)</span>
              </div>
              <div className="divide-y divide-border/60">
                {s.transactions.length === 0 ? (
                  <p className="py-5 text-center text-xs text-muted-foreground">Žiadne transakcie</p>
                ) : (
                  s.transactions.slice(0, 5).map((t) => (
                    <TxnRow key={t.id} txn={t} />
                  ))
                )}
              </div>
              <Link
                to="/platby"
                className="block pt-2 text-center text-xs font-semibold text-primary hover:underline"
              >
                Zobraziť všetky transakcie →
              </Link>
            </div>
          )}

          {activeTab === "funkcie" && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/nova-platba"
                className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 p-3 font-medium transition hover:bg-muted"
              >
                <Repeat className="size-4 text-primary shrink-0" />
                <span>Trvalé príkazy</span>
              </Link>
              <Link
                to="/prijat"
                className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 p-3 font-medium transition hover:bg-muted"
              >
                <QrCode className="size-4 text-primary shrink-0" />
                <span>Payme link / QR</span>
              </Link>
              <Link
                to="/karty"
                className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 p-3 font-medium transition hover:bg-muted"
              >
                <Smartphone className="size-4 text-primary shrink-0" />
                <span>Výber mobilom</span>
              </Link>
              <Link
                to="/sporenie"
                className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 p-3 font-medium transition hover:bg-muted"
              >
                <PiggyBank className="size-4 text-primary shrink-0" />
                <span>Sporenie</span>
              </Link>
              <div className="col-span-2 flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 text-xs">
                <span className="text-muted-foreground">Denný limit SEPA</span>
                <span className="font-semibold text-foreground">10 000 €</span>
              </div>
            </div>
          )}

          {activeTab === "karty" && (
            <div className="mt-4 space-y-3">
              <Link
                to="/karty"
                className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-sm transition hover:opacity-95"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">VISA SPACE karta</p>
                  <p className="mt-2 font-mono text-sm tracking-widest text-white">•••• 2269</p>
                </div>
                <CreditCard className="size-6 text-primary" />
              </Link>
              <Link
                to="/karty"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <span>Spravovať karty a limity</span>
              </Link>
            </div>
          )}

          {activeTab === "info" && (
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Typ účtu</span>
                <span className="font-semibold text-foreground">SPACE účet</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Majiteľ účtu</span>
                <span className="font-semibold text-foreground">{s.owner}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">IBAN</span>
                <button
                  type="button"
                  onClick={copyIban}
                  className="flex items-center gap-1.5 font-mono font-medium hover:text-primary"
                >
                  <span>{s.iban}</span>
                  {copied ? <Check className="size-3.5 text-income" /> : <Copy className="size-3.5 text-muted-foreground" />}
                </button>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">BIC / SWIFT</span>
                <span className="font-mono font-semibold text-foreground">GIBASBX</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
