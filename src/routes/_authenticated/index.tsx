import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  CreditCard,
  BarChart2,
  MoreVertical,
  ShoppingBag,
} from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { balance, monthTotals, MONTHS, useBank } from "@/lib/bank-store";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Prehľad | George" },
      { name: "description", content: "Prehľad George SLSP" },
    ],
  }),
  component: GeorgePrehlad,
});

export default function GeorgePrehlad() {
  const s = useBank();
  const navigate = useNavigate();

  // Reálne dáta z databázy
  const currentBalance = balance(s);
  const { income, expense } = monthTotals(s);
  const currentMonthName = (MONTHS[new Date().getUTCMonth()] ?? "október").toLowerCase();

  const isNegative = currentBalance < 0;
  const absVal = Math.abs(currentBalance);
  const wholeEuros = Math.floor(absVal).toLocaleString("sk-SK");
  const cents = Math.round((absVal - Math.floor(absVal)) * 100).toString().padStart(2, "0");

  const formattedOwnResources = `${isNegative ? "-" : ""}${wholeEuros},${cents} € vlastné zdroje`;

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f2f4f8] dark:bg-[#0e1117] text-slate-900 dark:text-white pb-28 font-sans transition-colors duration-200">
        
        {/* V dennom režime George modrá hlavička, v tmavom režime čisté tmavé pozadie */}
        <div className="bg-[#196ee6] dark:bg-transparent px-4 pt-3 pb-6 text-white transition-colors">
          <div className="flex items-center justify-end gap-3.5 pt-1 pb-1">
            <Link to="/platby" className="p-1 text-white hover:text-white/80 transition" aria-label="Hľadať">
              <Search className="w-6 h-6 stroke-[2.2]" />
            </Link>
            <Link to="/platby" className="p-1 text-white hover:text-white/80 transition" aria-label="Karty">
              <CreditCard className="w-6 h-6 stroke-[2.2]" />
            </Link>
            <Link
              to="/nastavenia"
              className="relative flex w-8 h-8 items-center justify-center rounded-full bg-amber-400 text-zinc-900 font-bold overflow-hidden shadow ring-2 ring-white/30 dark:ring-zinc-800"
              aria-label="Profil"
            >
              <span className="text-sm">🦁</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#ff4d6d] ring-2 ring-[#196ee6] dark:ring-[#0e1117]" />
            </Link>
          </div>

          <h1 className="text-[34px] font-extrabold tracking-tight text-white mt-2 mb-4">
            Prehľad
          </h1>

          {/* Dve karty: Reálne Výdavky a Príjmy za mesiac */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white dark:bg-[#161a23] p-4 text-slate-900 dark:text-white shadow-sm border border-slate-100/80 dark:border-zinc-800/40">
              <div className="flex items-center justify-between text-[13px] font-medium text-slate-700 dark:text-zinc-300">
                <span>Výdavky za {currentMonthName}</span>
                <span className="flex w-6 h-6 items-center justify-center rounded-full bg-[#edf4ff] dark:bg-[#182a3e] text-[#196ee6] dark:text-[#38bdf8]">
                  <BarChart2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-[26px] font-bold leading-none">
                  {Math.floor(expense).toLocaleString("sk-SK")},
                </span>
                <span className="text-[16px] font-bold leading-none ml-0.5">
                  {Math.round((expense - Math.floor(expense)) * 100).toString().padStart(2, "0")}&nbsp;€
                </span>
              </div>
              <Link to="/rozpocet" className="mt-2 block text-[12px] text-slate-500 dark:text-zinc-400 hover:underline">
                {s.budgets?.length ? "Nastavený rozpočet" : "Neurčený rozpočet"}
              </Link>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#161a23] p-4 text-slate-900 dark:text-white shadow-sm border border-slate-100/80 dark:border-zinc-800/40">
              <div className="flex items-center justify-between text-[13px] font-medium text-slate-700 dark:text-zinc-300">
                <span>Príjmy za {currentMonthName}</span>
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-[26px] font-bold leading-none">
                  {Math.floor(income).toLocaleString("sk-SK")},
                </span>
                <span className="text-[16px] font-bold leading-none ml-0.5">
                  {Math.round((income - Math.floor(income)) * 100).toString().padStart(2, "0")}&nbsp;€
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sekcia Vaše produkty */}
        <div className="px-4 mt-4 space-y-3">
          <p className="text-[13px] font-medium text-slate-500 dark:text-zinc-400 px-1">
            Vaše produkty
          </p>

          {/* 1. Karta: Účet — klikateľná, s reálnym zostatkom */}
          <Link
            to="/platby"
            className="group relative block overflow-hidden rounded-2xl bg-white dark:bg-[#161a23] p-5 shadow-sm border border-slate-100 dark:border-zinc-800/40 before:absolute before:inset-x-0 before:top-0 before:h-[3.5px] before:bg-gradient-to-r before:from-[#d946ef] before:to-[#f43f5e] active:scale-[0.99] transition cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white group-hover:text-[#196ee6] dark:group-hover:text-[#38bdf8] transition-colors">
                  Účet
                </h2>
                
                <div className={`mt-1 flex items-baseline ${isNegative ? "text-[#e11d48] dark:text-[#ff5a70]" : "text-slate-900 dark:text-white"}`}>
                  <span className="text-[32px] font-bold leading-none tracking-tight">
                    {isNegative ? "-" : ""}{wholeEuros},
                  </span>
                  <span className="text-[18px] font-bold leading-none ml-0.5">
                    {cents}&nbsp;€
                  </span>
                </div>

                <p className="mt-1.5 text-[13px] text-slate-500 dark:text-zinc-400">
                  {formattedOwnResources}
                </p>
              </div>

              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700/60 shrink-0 bg-slate-100 dark:bg-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=120&auto=format&fit=crop&q=80"
                  alt="Účet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="inline-flex items-center justify-center rounded-full bg-[#eef4ff] hover:bg-[#e0ecff] dark:bg-[#1b273d] dark:hover:bg-[#233454] px-4 py-2 text-[14px] font-medium text-[#196ee6] dark:text-[#60a5fa] transition">
                Nová platba
              </span>
              <span className="p-1 text-[#196ee6] dark:text-[#38bdf8] opacity-80 group-hover:opacity-100 transition">
                <MoreVertical className="w-5 h-5" />
              </span>
            </div>
          </Link>

          {/* 2. Karta: Investície */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#161a23] p-5 shadow-sm border border-slate-100 dark:border-zinc-800/40 before:absolute before:inset-x-0 before:top-0 before:h-[3.5px] before:bg-gradient-to-r before:from-[#196ee6] before:to-[#4f46e5] dark:before:from-[#3b82f6] dark:before:to-[#6366f1]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white">Investície</h2>
                <div className="mt-1 flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-[32px] font-bold leading-none tracking-tight">0,</span>
                  <span className="text-[18px] font-bold leading-none ml-0.5">00&nbsp;€</span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700/60 shrink-0 bg-slate-100 dark:bg-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80"
                  alt="Investície"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#eef4ff] hover:bg-[#e0ecff] dark:bg-[#1b273d] dark:hover:bg-[#233454] px-4 py-2 text-[14px] font-medium text-[#196ee6] dark:text-[#60a5fa] transition"
              >
                Vyhľadať a kúpiť
              </button>
            </div>
          </div>

          {/* 3. Karta: Moneyback */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#161a23] p-5 shadow-sm border border-slate-100 dark:border-zinc-800/40 before:absolute before:inset-x-0 before:top-0 before:h-[3.5px] before:bg-gradient-to-r before:from-[#9333ea] before:to-[#ec4899]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white">Moneyback</h2>
                <div className="mt-1.5 inline-flex items-center rounded-full bg-[#e0f2fe] dark:bg-[#142639] px-2.5 py-0.5 text-[12px] font-medium text-[#0284c7] dark:text-[#38bdf8]">
                  5 nových ponúk
                </div>
              </div>

              <div className="w-12 h-12 rounded-full bg-[#fdf2f8] dark:bg-[#2e1627] text-[#db2777] dark:text-[#f43f5e] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 stroke-[2]" />
              </div>
            </div>

            <p className="mt-3 text-[14px] leading-snug text-slate-600 dark:text-zinc-300">
              Objavte ponuky od najlepších značiek a získajte späť časť svojich peňazí.
            </p>

            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#eef4ff] hover:bg-[#e0ecff] dark:bg-[#1b273d] dark:hover:bg-[#233454] px-4 py-2 text-[14px] font-medium text-[#196ee6] dark:text-[#60a5fa] transition"
              >
                Prezrite si 5 nových ponúk
              </button>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
