import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  CreditCard,
  BarChart2,
  MoreVertical,
  ShoppingBag,
  TrendingUp,
  Compass,
  MessageSquare,
  Activity,
} from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { balance, formatEur, monthTotals, MONTHS, useBank } from "@/lib/bank-store";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Internetbanking George" },
      { name: "description", content: "Prehľad George SLSP" },
    ],
  }),
  component: GeorgePrehlad,
});

export default function GeorgePrehlad() {
  const s = useBank();
  const total = balance(s);
  const { income, expense } = monthTotals(s);
  const currentMonthName = (MONTHS[new Date().getUTCMonth()] ?? "október").toLowerCase();

  function renderFormattedAmount(amount: number) {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const whole = Math.floor(absVal).toLocaleString("sk-SK");
    const cents = Math.round((absVal - Math.floor(absVal)) * 100)
      .toString()
      .padStart(2, "0");

    return (
      <span className={isNegative ? "text-[#C80036] dark:text-[#FF4D6D]" : "text-slate-900 dark:text-white"}>
        {isNegative ? "-" : ""}
        {whole}
        <span className="text-xl font-bold align-top">,{cents}</span> €
      </span>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0F141C] pb-24 text-slate-900 dark:text-white font-sans transition-colors duration-200">
        {/* 1. George Modrá hlavička */}
        <header className="bg-[#196EE6] px-5 pt-8 pb-10 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight">Prehľad</h1>
            <div className="flex items-center gap-3">
              <Link to="/platby" className="p-1 text-white/90 hover:text-white">
                <Search className="size-6" />
              </Link>
              <Link to="/karty" className="p-1 text-white/90 hover:text-white">
                <CreditCard className="size-6" />
              </Link>
              <Link
                to="/nastavenia"
                className="relative flex size-9 items-center justify-center rounded-full bg-amber-400 font-bold text-slate-900 ring-2 ring-white/40 overflow-hidden"
              >
                <span className="text-sm">🦁</span>
                <span className="absolute top-0 right-0 size-2.5 rounded-full bg-[#E40046] ring-2 ring-[#196EE6]" />
              </Link>
            </div>
          </div>

          {/* Dve informačné karty: Výdavky a Príjmy za mesiac */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {/* Výdavky */}
            <div className="rounded-2xl bg-white dark:bg-[#1C212B] p-3.5 text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Výdavky za {currentMonthName}</span>
                <span className="flex size-6 items-center justify-center rounded-full bg-blue-50 dark:bg-[#1E3250] text-[#196EE6] dark:text-[#4A94F8]">
                  <BarChart2 className="size-3.5" />
                </span>
              </div>
              <p className="mt-1 text-lg font-bold">
                {expense.toFixed(2).replace(".", ",")}
                <span className="text-xs font-semibold align-top"> €</span>
              </p>
              <Link
                to="/rozpocet"
                className="mt-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {s.budgets?.length ? "Nastavený rozpočet" : "Neurčený rozpočet"}
              </Link>
            </div>

            {/* Príjmy */}
            <div className="rounded-2xl bg-white dark:bg-[#1C212B] p-3.5 text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Príjmy za {currentMonthName}</span>
              </div>
              <p className="mt-1 text-lg font-bold">
                {income.toFixed(2).replace(".", ",")}
                <span className="text-xs font-semibold align-top"> €</span>
              </p>
            </div>
          </div>
        </header>

        {/* 2. Vaše produkty */}
        <main className="px-4 pt-4 space-y-4">
          <h2 className="px-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            Vaše produkty
          </h2>

          {/* Karta 1: Účet */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#1C212B] p-5 shadow-sm border border-slate-100 dark:border-white/5">
            {/* Farebný pásik George (Fuchsiový pre bežný účet) */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D8005A] via-[#E40046] to-[#D8005A]" />

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Účet</h3>
                <div className="mt-1 text-2xl font-extrabold tracking-tight">
                  {renderFormattedAmount(total)}
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {formatEur(total)} vlastné zdroje
                </p>
              </div>

              {/* Kruhový profil / obrázok účtu */}
              <div className="size-12 overflow-hidden rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=100&auto=format&fit=crop&q=80"
                  alt="Účet"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Tlačidlá na karte */}
            <div className="mt-4 flex items-center justify-between pt-1">
              <Link
                to="/nova-platba"
                className="inline-flex items-center justify-center rounded-full bg-[#EBF3FC] dark:bg-[#1E3250] px-4 py-2 text-xs font-semibold text-[#196EE6] dark:text-[#4A94F8] transition hover:bg-[#DCEBFB] dark:hover:bg-[#253d63] active:scale-95"
              >
                Nová platba
              </Link>
              <Link
                to="/platby"
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MoreVertical className="size-4.5" />
              </Link>
            </div>
          </div>

          {/* Karta 2: Investície */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#1C212B] p-5 shadow-sm border border-slate-100 dark:border-white/5">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2E2A72]" />

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Investície</h3>
                <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  0<span className="text-xl font-bold align-top">,00</span> €
                </div>
              </div>

              <div className="size-12 overflow-hidden rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80"
                  alt="Investície"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#EBF3FC] dark:bg-[#1E3250] px-4 py-2 text-xs font-semibold text-[#196EE6] dark:text-[#4A94F8] transition hover:bg-[#DCEBFB] dark:hover:bg-[#253d63] active:scale-95"
              >
                Vyhľadať a kúpiť
              </button>
            </div>
          </div>

          {/* Karta 3: Moneyback */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#1C212B] p-5 shadow-sm border border-slate-100 dark:border-white/5">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8E24AA]" />

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Moneyback</h3>
                <span className="mt-1 inline-block rounded-full bg-[#EBF3FC] dark:bg-[#1E3250] px-2.5 py-0.5 text-[10px] font-semibold text-[#196EE6] dark:text-[#4A94F8]">
                  5 nových ponúk
                </span>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-[240px]">
                  Objavte ponuky od najlepších značiek a získajte späť časť svojich peňazí.
                </p>
              </div>

              <div className="flex size-11 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/40 text-[#D8005A]">
                <ShoppingBag className="size-5" />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#EBF3FC] dark:bg-[#1E3250] px-4 py-2 text-xs font-semibold text-[#196EE6] dark:text-[#4A94F8] transition hover:bg-[#DCEBFB] dark:hover:bg-[#253d63] active:scale-95"
              >
                Prezrite si 5 nových ponúk
              </button>
            </div>
          </div>
        </main>

        {/* 3. Spodná navigácia George */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#151B24]/95 px-2 py-2 backdrop-blur-md">
          {/* Prehľad */}
          <Link
            to="/"
            className="flex flex-col items-center gap-1 text-[#196EE6] dark:text-[#4A94F8]"
          >
            <div className="flex h-7 w-12 items-center justify-center rounded-full bg-[#EBF3FC] dark:bg-[#1E3250]">
              <span className="font-extrabold text-sm tracking-tighter">g</span>
            </div>
            <span className="text-[10px] font-bold">Prehľad</span>
          </Link>

          {/* FIT */}
          <Link
            to="/rozpocet"
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <div className="relative flex h-7 items-center justify-center">
              <Activity className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#E40046]" />
            </div>
            <span className="text-[10px] font-medium">FIT</span>
          </Link>

          {/* Invest */}
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <TrendingUp className="size-5" />
            <span className="text-[10px] font-medium">Invest</span>
          </button>

          {/* Objavujte */}
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <Compass className="size-5" />
            <span className="text-[10px] font-medium">Objavujte</span>
          </button>

          {/* Kontakty */}
          <Link
            to="/nastavenia"
            className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <MessageSquare className="size-5" />
            <span className="text-[10px] font-medium">Kontakty</span>
          </Link>
        </nav>
      </div>
    </AppShell>
  );
}
