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
  Plus,
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
    toast.success("IBAN skopírovaný do schránky");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppShell>
      {/* 1. Horná lišta: Vyhľadávanie, Upozornenia, Profil */}
      <header className="flex items-center justify-between px-5 pt-4 pb-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Prehľad</h1>
        <div className="flex items-center gap-1">
          <Link to="/platby" className="rounded-full p-2 text-muted-foreground hover:bg-muted" title="Hľadať">
            <Search className="size-5" />
          </Link>
          <Link to="/upozornenia" className="rounded-full p-2 text-muted-foreground hover:bg-muted" title="Upozornenia">
            <Bell className="size-5" />
          </Link>
          <Link to="/nastavenia" className="rounded-full p-2 text-muted-foreground hover:bg-muted" title="Nastavenia">
            <User className="size-5" />
          </Link>
        </div>
      </header>

      {/* 2. Mesačný prehľad výdavkov a príjmov */}
      <div className="px-4 py-2">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="pr-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Výdavky za {month}</span>
                <ArrowDownRight className="size-3.5 text-expense" />
              </div>
              <p className="mt-1 text-lg font-bold text-expense">{formatEur(expense)}</p>
            </div>
            <div className="pl-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Príjmy za {month}</span>
                <ArrowUpRight className="size-3.5 text-income" />
              </div>
              <p className="mt-1 text-lg font-bold text-income">{formatEur(income)}</p>
            </div>
          </div>
          <div className="mt-3 border-t border-border/60 pt-2.5">
            <Link to="/rozpocet" className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground">
              <span>{s.budgets?.length ? "Nastavený rozpočet" : "Neurčený rozpočet"}</span>
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Sekcia: Vaše produkty & Karta účtu */}
      <div className="mt-3 px-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vaše produkty</h2>
          <Link to="/nova-platba" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Plus className="size-3.5" /> Platba
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">SPACE účet</p>
            <p className={`mt-1 text-3xl font-extrabold tracking-tight ${total < 0 ? "text-expense" : "text-foreground"}`}>
              {formatEur(total)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatEur(total)} vlastné zdroje</p>
          </div>

          {/* Záložky detailu účtu */}
          <div className="mt-5 flex border-b border-border text-xs font-semibold">
            {(["transakcie", "funkcie", "karty", "info"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-2.5 text-center transition-all ${
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

          {/* TAB 1: Transakcie */}
          {activeTab === "transakcie" && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                <span>Platobné príkazy a rezervácie</span>
                <span className="font-semibold text-foreground">0 rezervácií</span>
              </div>
              <div className="divide-y divide-border/60">
                {s.transactions.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">Žiadne transakcie</p>
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

          {/* TAB 2: Funkcie */}
          {activeTab === "funkcie" && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/nova-platba"
                className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/50 p-3 font-medium hover:bg-muted"
              >
                <Repeat className="size-4 text-primary" />
                <span>Trvalé príkazy</span>
              </Link>
              <Link
                to="/prijat"
                className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/50 p-3 font-medium hover:bg-muted"
              >
                <QrCode className="size-4 text-primary" />
                <span>Payme / QR kód</span>
              </Link>
              <Link
                to="/karty"
                className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/50 p-3 font-medium hover:bg-muted"
              >
                <Smartphone className="size-4 text-primary" />
                <span>Výber mobilom</span>
              </Link>
              <Link
                to="/sporenie"
                className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/50 p-3 font-medium hover:bg-muted"
              >
                <PiggyBank className="size-4 text-primary" />
                <span>Sporenie</span>
              </Link>
              <div className="col-span-2 flex items-center justify-between rounded-xl border border-border/80 bg-background/50 p-3">
                <span className="text-muted-foreground">Limit SEPA platieb</span>
                <span className="font-semibold">10 000 € / deň</span>
              </div>
            </div>
          )}

          {/* TAB 3: Karty */}
          {activeTab === "karty" && (
            <div className="mt-4 space-y-3">
              <Link
                to="/karty"
                className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white shadow-sm"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-300">VISA virtuálna karta</p>
                  <p className="mt-2 font-mono text-sm tracking-widest">•••• 2269</p>
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

          {/* TAB 4: Info */}
          {activeTab === "info" && (
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Typ účtu</span>
                <span className="font-semibold">SPACE účet</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Názov účtu</span>
                <span className="font-semibold">{s.owner}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">IBAN</span>
                <button
                  type="button"
                  onClick={copyIban}
                  className="flex items-center gap-1 font-mono font-medium hover:text-primary"
                >
                  <span>{s.iban}</span>
                  {copied ? <Check className="size-3.5 text-income" /> : <Copy className="size-3.5" />}
                </button>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">BIC / SWIFT</span>
                <span className="font-mono font-semibold">GIBASBX</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
