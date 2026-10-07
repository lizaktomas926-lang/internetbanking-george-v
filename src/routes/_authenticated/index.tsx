import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Search, 
  CreditCard, 
  Bell, 
  Copy, 
  Check, 
  BarChart2, 
  TrendingUp, 
  Send, 
  ArrowDownLeft, 
  PiggyBank,
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/bank/AppShell";
import { balance, formatEur, monthTotals, MONTHS, useBank } from "@/lib/bank-store";

// Formátovanie iniciál z mena
function formatInitials(name?: string | null, fallback = "G"): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (!first) return fallback;
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

// Získanie krstného mena
function getFirstName(fullName?: string | null, fallback = "Používateľ"): string {
  if (!fullName) return fallback;
  const first = fullName.trim().split(/\s+/)[0];
  return first || fallback;
}

// Formátovanie IBAN do blokov po 4 znaky
function formatIbanBlocks(iban?: string | null): string {
  if (!iban) return "SK31 1200 3545 0984 0539";
  const clean = iban.replace(/\s+/g, "");
  return clean.match(/.{1,4}/g)?.join(" ") ?? iban;
}

function GeorgePrehlad() {
  const s = useBank();
  const total = balance(s);
  const userInitials = formatInitials(s.owner);
  const firstName = getFirstName(s.owner, "Adam");
  const { income, expense } = monthTotals(s);
  const currentMonthName = (MONTHS[new Date().getUTCMonth()] ?? "tento mesiac").toLowerCase();

  const [copied, setCopied] = useState(false);

  const isNegative = total < 0;
  const absVal = Math.abs(total);
  const wholeEuros = Math.floor(absVal).toLocaleString("sk-SK");
  const cents = Math.round((absVal - Math.floor(absVal)) * 100).toString().padStart(2, "0");

  const formattedIban = formatIbanBlocks(s.iban);

  const handleCopyIban = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanIban = (s.iban || "SK311200354509840539").replace(/\s+/g, "");
    navigator.clipboard.writeText(cleanIban);
    setCopied(true);
    toast.success("IBAN bol skopírovaný do schránky");
    setTimeout(() => setCopied(false), 2000);
  };

  // Posledné 4 transakcie pre sekciu "Posledné pohyby"
  const recentTransactions = [...(s.transactions ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f3f6fb] dark:bg-[#0c0f17] text-slate-900 dark:text-white pb-28 font-sans transition-colors">
        
        {/* Modrý podklad hlavičky George */}
        <div className="bg-[#196ee6] dark:bg-[#111e33] px-5 pt-3 pb-16 text-white transition-colors">
          <div className="flex items-center justify-between pt-1">
            {/* Profil a pozdrav */}
            <Link to="/nastavenia" className="flex items-center gap-3 active:opacity-80 transition">
              <div className="w-11 h-11 rounded-full bg-white text-[#196ee6] font-bold text-sm flex items-center justify-center shadow-md">
                {userInitials}
              </div>
              <div>
                <p className="text-[13px] text-white/80 leading-tight">Dobrý deň,</p>
                <p className="text-[17px] font-bold text-white leading-tight">{firstName}</p>
              </div>
            </Link>

            {/* Ikony vpravo hore */}
            <div className="flex items-center gap-2">
              <Link 
                to="/platby" 
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition backdrop-blur-sm"
                aria-label="Hľadať"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </Link>
              <Link 
                to="/karty" 
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition backdrop-blur-sm"
                aria-label="Karty"
              >
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              </Link>
              <Link 
                to="/upozornenia" 
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition backdrop-blur-sm"
                aria-label="Upozornenia"
              >
                <Bell className="w-5 h-5 stroke-[2.2]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hlavná karta Účet prekrývajúca modrý banner */}
        <div className="px-4 -mt-10">
          <div className="rounded-3xl bg-white dark:bg-[#161a23] p-5 shadow-sm border border-slate-100 dark:border-zinc-800/60">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[12px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
                  Bežný účet
                </span>
                
                <div className={`mt-1 flex items-baseline ${isNegative ? "text-[#e11d48] dark:text-[#ff5a70]" : "text-slate-900 dark:text-white"}`}>
                  <span className="text-[36px] font-extrabold leading-none tracking-tight">
                    {isNegative ? "-" : ""}{wholeEuros},
                  </span>
                  <span className="text-[22px] font-bold leading-none ml-0.5">
                    {cents}&nbsp;€
                  </span>
                </div>
                
                <p className="mt-1 text-[13px] text-slate-500 dark:text-zinc-400">
                  {formatEur(total)} vlastné zdroje
                </p>
              </div>

              {/* Logo George 'g' */}
              <div className="w-9 h-9 rounded-full bg-[#196ee6]/10 dark:bg-[#196ee6]/20 flex items-center justify-center text-[#196ee6] dark:text-[#38bdf8] shrink-0 font-bold text-lg">
                g
              </div>
            </div>

            {/* Zobrazenie a kopírovanie IBAN */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/60">
              <p className="text-[14px] font-mono font-medium tracking-wider text-slate-600 dark:text-zinc-300">
                {formattedIban}
              </p>
              <button
                type="button"
                onClick={handleCopyIban}
                className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#196ee6] dark:text-[#38bdf8] hover:underline"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Skopírované" : "Kopírovať IBAN"}</span>
              </button>
            </div>

            {/* Akcie karty: Nová platba | Prijať */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/60 grid grid-cols-2 gap-2 text-center">
              <Link
                to="/nova-platba"
                className="py-2.5 px-3 rounded-xl bg-[#f0f5ff] dark:bg-[#182a40] text-[#196ee6] dark:text-[#38bdf8] font-bold text-[14px] active:scale-[0.98] transition text-center"
              >
                Nová platba
              </Link>
              <Link
                to="/prijat"
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-200 font-bold text-[14px] active:scale-[0.98] transition text-center"
              >
                Prijať
              </Link>
            </div>
          </div>
        </div>

        {/* Dva widgety: Výdavky za október / Príjmy za október */}
        <div className="px-4 mt-4 grid grid-cols-2 gap-3">
          <Link
            to="/rozpocet"
            className="rounded-2xl bg-white dark:bg-[#161a23] p-4 shadow-sm border border-slate-100 dark:border-zinc-800/60 active:scale-[0.98] transition"
          >
            <div className="flex items-center justify-between text-[13px] font-medium text-slate-600 dark:text-zinc-400">
              <span>Výdavky za {currentMonthName}</span>
              <span className="flex w-6 h-6 items-center justify-center rounded-full bg-[#fde8ef] dark:bg-[#381a28] text-[#be0055]">
                <BarChart2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-2 text-[22px] font-bold text-slate-900 dark:text-white leading-none">
              {formatEur(expense)}
            </div>
            <p className="mt-2 text-[12px] text-slate-400 dark:text-zinc-500">
              {s.budgets?.length ? `${s.budgets.length} nastavené limity` : "4 nastavené limity"}
            </p>
          </Link>

          <div className="rounded-2xl bg-white dark:bg-[#161a23] p-4 shadow-sm border border-slate-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between text-[13px] font-medium text-slate-600 dark:text-zinc-400">
              <span>Príjmy za {currentMonthName}</span>
              <span className="flex w-6 h-6 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-2 text-[22px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
              {formatEur(income)}
            </div>
            <p className="mt-2 text-[12px] text-slate-400 dark:text-zinc-500">
              Tento mesiac
            </p>
          </div>
        </div>

        {/* Riadok 4 rýchlych akcií */}
        <div className="px-4 mt-5">
          <div className="grid grid-cols-4 gap-2 text-center">
            <Link to="/nova-platba" className="flex flex-col items-center gap-1.5 group">
              <div className="w-13 h-13 rounded-2xl bg-[#edf4ff] dark:bg-[#182844] flex items-center justify-center text-[#196ee6] dark:text-[#38bdf8] group-active:scale-95 transition">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-medium text-slate-700 dark:text-zinc-300 leading-tight">Nová platba</span>
            </Link>

            <Link to="/prijat" className="flex flex-col items-center gap-1.5 group">
              <div className="w-13 h-13 rounded-2xl bg-[#edf4ff] dark:bg-[#182844] flex items-center justify-center text-[#196ee6] dark:text-[#38bdf8] group-active:scale-95 transition">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-medium text-slate-700 dark:text-zinc-300 leading-tight">Prijať</span>
            </Link>

            <Link to="/karty" className="flex flex-col items-center gap-1.5 group">
              <div className="w-13 h-13 rounded-2xl bg-[#edf4ff] dark:bg-[#182844] flex items-center justify-center text-[#196ee6] dark:text-[#38bdf8] group-active:scale-95 transition">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-medium text-slate-700 dark:text-zinc-300 leading-tight">Karty</span>
            </Link>

            <Link to="/sporenie" className="flex flex-col items-center gap-1.5 group">
              <div className="w-13 h-13 rounded-2xl bg-[#edf4ff] dark:bg-[#182844] flex items-center justify-center text-[#196ee6] dark:text-[#38bdf8] group-active:scale-95 transition">
                <PiggyBank className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-medium text-slate-700 dark:text-zinc-300 leading-tight">Sporenie</span>
            </Link>
          </div>
        </div>

        {/* Sekcia: Posledné pohyby */}
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">Posledné pohyby</h2>
            <Link to="/platby" className="text-[13px] font-semibold text-[#196ee6] dark:text-[#38bdf8] hover:underline">
              Zobraziť všetky
            </Link>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#161a23] shadow-sm border border-slate-100 dark:border-zinc-800/60 divide-y divide-slate-100 dark:divide-zinc-800/60 overflow-hidden">
            {recentTransactions.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-400">Žiadne nedávne transakcie</p>
            ) : (
              recentTransactions.map((tx) => {
                const isIncome = tx.amount > 0;
                return (
                  <Link
                    key={tx.id}
                    to="/transakcia/$id"
                    params={{ id: tx.id }}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition active:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isIncome 
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" 
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      }`}>
                        {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900 dark:text-white line-clamp-1">
                          {tx.title}
                        </p>
                        <p className="text-[12px] text-slate-400 dark:text-zinc-500">
                          {tx.date} • {tx.category}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[15px] font-bold ${
                      isIncome 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-slate-900 dark:text-white"
                    }`}>
                      {isIncome ? "+" : ""}{formatEur(tx.amount)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}

const HOME_TITLE = "Internetbanking George";
const HOME_DESC =
  "Získajte s ním prehľad o svojich financiách 24 hodín denne, 7 dní v týždni. Rýchlo a pohodlne vybavte všetko, čo potrebujete.";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESC },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GeorgePrehlad,
});
