import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  CreditCard,
  BarChart2,
  ShoppingBag,
} from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { useBank, balance, monthTotals, formatEur, MONTHS } from "@/lib/bank-store";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Prehľad | George" },
      { name: "description", content: "Prehľad George SLSP" },
    ],
  }),
  component: GeorgePrehlad,
});

function splitAmount(n: number) {
  const abs = Math.abs(n);
  const whole = Math.floor(abs).toLocaleString("sk-SK");
  const cents = (abs % 1).toFixed(2).slice(2);
  return { whole, cents };
}

export default function GeorgePrehlad() {
  const s = useBank();
  const navigate = useNavigate();

  // Skutočný zostatok a mesačné pohyby z údajov v cloude
  const bal = balance(s);
  const isNegative = bal < 0;
  const { whole: balanceMain, cents: balanceCents } = splitAmount(bal);
  const ownResources = `${formatEur(bal)} vlastné zdroje`;
  const { income, expense } = monthTotals(s);
  const exp = splitAmount(expense);
  const inc = splitAmount(income);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0e1117] text-white px-4 pt-4 pb-28 font-sans">
        
        {/* Horná lišta: Vyhľadávanie, Karty, Profil s červenou bodkou */}
        <div className="flex items-center justify-end gap-4 pt-2 pb-1">
          <Link to="/platby" className="p-1 text-white hover:text-zinc-300 transition">
            <Search className="w-6 h-6 stroke-[2.2]" />
          </Link>
          <Link to="/platby" className="p-1 text-white hover:text-zinc-300 transition">
            <CreditCard className="w-6 h-6 stroke-[2.2]" />
          </Link>
          <Link
            to="/nastavenia"
            className="relative flex w-8 h-8 items-center justify-center rounded-full bg-amber-400 text-zinc-900 font-bold overflow-hidden shadow"
          >
            <span className="text-sm">🦁</span>
            {/* Červený notifikačný odznak */}
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#ff4d6d] ring-2 ring-[#0e1117]" />
          </Link>
        </div>

        {/* Názov obrazovky */}
        <h1 className="text-[34px] font-extrabold tracking-tight text-white mt-1 mb-4">
          Prehľad
        </h1>

        {/* Dve informačné karty: Výdavky a Príjmy za október */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Výdavky */}
          <div className="rounded-2xl bg-[#161a23] p-4 border border-zinc-800/40">
            <div className="flex items-center justify-between text-[13px] font-medium text-zinc-300">
              <span>Výdavky za {MONTHS[new Date().getMonth()].toLowerCase()}</span>
              <span className="flex w-6 h-6 items-center justify-center rounded-full bg-[#182a3e] text-[#38bdf8]">
                <BarChart2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline">
              <span className="text-[26px] font-bold leading-none text-white">{exp.whole},</span>
              <span className="text-[16px] font-bold leading-none ml-0.5 text-white">{exp.cents}&nbsp;€</span>
            </div>
            <p className="mt-2 text-[12px] text-zinc-400">
              Neurčený rozpočet
            </p>
          </div>

          {/* Príjmy */}
          <div className="rounded-2xl bg-[#161a23] p-4 border border-zinc-800/40">
            <div className="flex items-center justify-between text-[13px] font-medium text-zinc-300">
              <span>Príjmy za {MONTHS[new Date().getMonth()].toLowerCase()}</span>
            </div>
            <div className="mt-2 flex items-baseline">
              <span className="text-[26px] font-bold leading-none text-white">{inc.whole},</span>
              <span className="text-[16px] font-bold leading-none ml-0.5 text-white">{inc.cents}&nbsp;€</span>
            </div>
          </div>
        </div>

        {/* Sekcia Vaše produkty */}
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-zinc-400 px-1">
            Vaše produkty
          </p>

          {/* 1. Karta: Účet (s bordovo-fuchsiovým horným akcentom) — kliknutie otvorí históriu platieb */}
          <Link
            to="/platby"
            className="block relative overflow-hidden rounded-2xl bg-[#161a23] p-5 border border-zinc-800/40 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-[#d946ef] before:to-[#f43f5e] transition hover:border-zinc-700/60"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-white">Účet</h2>

                {/* Skutočný zostatok z cloudu */}
                <div className={`mt-1 flex items-baseline ${isNegative ? "text-[#ff5a70]" : "text-white"}`}>
                  {isNegative && (
                    <span className="text-[32px] font-bold leading-none tracking-tight">-</span>
                  )}
                  <span className="text-[32px] font-bold leading-none tracking-tight">
                    {balanceMain},
                  </span>
                  <span className="text-[18px] font-bold leading-none ml-0.5">
                    {balanceCents}&nbsp;€
                  </span>
                </div>

                <p className="mt-1.5 text-[13px] text-zinc-400">
                  {ownResources}
                </p>
              </div>

              {/* Kruhový obrázok / thumbnail mesta na pravej strane */}
              <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700/60 shrink-0 bg-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=120&auto=format&fit=crop&q=80"
                  alt="Účet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Spodok karty: Tlačidlo Nová platba */}
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void navigate({ to: "/nova-platba" });
                }}
                className="inline-flex items-center justify-center rounded-full bg-[#1b273d] hover:bg-[#233454] px-4 py-2 text-[14px] font-medium text-[#60a5fa] transition"
              >
                Nová platba
              </button>
            </div>
          </Link>

          {/* 2. Karta: Investície (s modrým horným akcentom) */}
          <div className="relative overflow-hidden rounded-2xl bg-[#161a23] p-5 border border-zinc-800/40 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-[#3b82f6] before:to-[#6366f1]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-white">Investície</h2>
                
                <div className="mt-1 flex items-baseline text-white">
                  <span className="text-[32px] font-bold leading-none tracking-tight">0,</span>
                  <span className="text-[18px] font-bold leading-none ml-0.5">00&nbsp;€</span>
                </div>
              </div>

              {/* Kruhový obrázok modernej budovy */}
              <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700/60 shrink-0 bg-zinc-800">
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
                className="inline-flex items-center justify-center rounded-full bg-[#1b273d] hover:bg-[#233454] px-4 py-2 text-[14px] font-medium text-[#60a5fa] transition"
              >
                Vyhľadať a kúpiť
              </button>
            </div>
          </div>

          {/* 3. Karta: Moneyback (s fialovým horným akcentom) */}
          <div className="relative overflow-hidden rounded-2xl bg-[#161a23] p-5 border border-zinc-800/40 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-[#a855f7] before:to-[#ec4899]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-white">Moneyback</h2>
                <div className="mt-1.5 inline-flex items-center rounded-full bg-[#142639] px-2.5 py-0.5 text-[12px] font-medium text-[#38bdf8]">
                  5 nových ponúk
                </div>
              </div>

              {/* Kruhová ružová nákupná taška */}
              <div className="w-12 h-12 rounded-full bg-[#2e1627] text-[#f43f5e] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 stroke-[2]" />
              </div>
            </div>

            <p className="mt-3 text-[14px] leading-snug text-zinc-300">
              Objavte ponuky od najlepších značiek a získajte späť časť svojich peňazí.
            </p>

            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#1b273d] hover:bg-[#233454] px-4 py-2 text-[14px] font-medium text-[#60a5fa] transition"
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
