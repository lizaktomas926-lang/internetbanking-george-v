import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, CreditCard, BarChart2, MoreVertical } from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { balance, formatEur, monthTotals, MONTHS, useBank } from "@/lib/bank-store";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Prehľad | George" },
      { name: "description", content: "Internetbanking George Slovenská sporiteľňa" },
    ],
  }),
  component: GeorgePrehlad,
});

export default function GeorgePrehlad() {
  const s = useBank();
  const total = balance(s);
  const { income, expense } = monthTotals(s);
  const currentMonthName = (MONTHS[new Date().getUTCMonth()] ?? "tento mesiac").toLowerCase();

  const isNegative = total < 0;
  const absVal = Math.abs(total);
  const wholeEuros = Math.floor(absVal).toLocaleString("sk-SK");
  const cents = Math.round((absVal - Math.floor(absVal)) * 100).toString().padStart(2, "0");

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f2f4f8] dark:bg-[#0e1117] text-slate-900 dark:text-white pb-28 font-sans transition-colors">
        
        {/* Modrá hlavička George (v noci tmavá) */}
        <div className="bg-[#196ee6] dark:bg-transparent px-4 pt-3 pb-6 text-white transition-colors">
          <div className="flex items-center justify-end gap-4 pt-1 pb-2">
            <Link to="/platby" className="p-1 text-white hover:opacity-80 transition" aria-label="Hľadať">
              <Search className="w-6 h-6 stroke-[2.2]" />
            </Link>
            <Link to="/karty" className="p-1 text-white hover:opacity-80 transition" aria-label="Karty">
              <CreditCard className="w-6 h-6 stroke-[2.2]" />
            </Link>
            <Link
              to="/nastavenia"
              className="flex w-8 h-8 items-center justify-center rounded-full bg-amber-400 text-zinc-900 font-bold overflow-hidden shadow ring-2 ring-white/30"
              aria-label="Profil"
            >
              <span className="text-sm">🦁</span>
            </Link>
          </div>

          <h1 className="text-[34px] font-extrabold tracking-tight text-white mt-2 mb-4">
            Prehľad
          </h1>

          {/* Karty: Výdavky a Príjmy */}
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
                <span className="text-[26px] font-bold leading-none text-[#16a34a] dark:text-[#22c55e]">
                  {Math.floor(income).toLocaleString("sk-SK")},
                </span>
                <span className="text-[16px] font-bold leading-none ml-0.5 text-[#16a34a] dark:text-[#22c55e]">
                  {Math.round((income - Math.floor(income)) * 100).toString().padStart(2, "0")}&nbsp;€
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vaše produkty */}
        <div className="px-4 mt-3 space-y-3">
          <p className="text-[12px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase px-1">
            Vaše produkty
          </p>

          {/* Klikateľná celá karta Účet */}
          <Link
            to="/platby"
            className="block rounded-2xl bg-white dark:bg-[#161a23] p-5 shadow-sm border-l-4 border-l-[#be0055] border-y border-r border-slate-100 dark:border-zinc-800/40 active:scale-[0.99] transition hover:shadow-md cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white">Účet</h2>
                <div className={`mt-1 flex items-baseline ${isNegative ? "text-[#e11d48] dark:text-[#ff5a70]" : "text-slate-900 dark:text-white"}`}>
                  <span className="text-[32px] font-bold leading-none tracking-tight">
                    {isNegative ? "-" : ""}{wholeEuros},
                  </span>
                  <span className="text-[20px] font-bold leading-none ml-0.5">
                    {cents}&nbsp;€
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-slate-500 dark:text-zinc-400">
                  {formatEur(total)} vlastné zdroje
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-[#196ee6] flex items-center justify-center text-white shrink-0 shadow-sm">
                <span className="text-base font-bold">g</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-[#edf4ff] dark:bg-[#182a3e] px-4 py-1.5 text-[14px] font-semibold text-[#196ee6] dark:text-[#38bdf8]">
                Nová platba
              </span>
              <span className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                <MoreVertical className="w-5 h-5" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
