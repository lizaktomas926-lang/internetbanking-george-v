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
          <span className="text-[11px]
