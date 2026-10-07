import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Home, Banknote, Plus, PieChart, Menu, ArrowLeft } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background text-foreground pb-24 font-sans">
      {children}
    </div>
  );
}

export function PersistentBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Skryť na obrazovke zadávania platby a v detaile transakcie
  if (path === "/nova-platba" || path.startsWith("/transakcia")) {
    return null;
  }

  const isPrehlad = path === "/";
  const isPlatby = path === "/platby";
  const isRozpocet = path === "/rozpocet";
  const isViac = path === "/nastavenia" || path === "/karty" || path === "/sporenie" || path === "/upozornenia";

  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-slate-200/70 dark:border-zinc-800/80 bg-white/95 dark:bg-[#12161f]/95 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl shadow-lg transition-colors">
      <div className="grid grid-cols-5 items-end px-2">
        
        {/* 1. Prehľad */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 text-[11px] transition ${
            isPrehlad
              ? "font-bold text-[#196ee6] dark:text-[#38bdf8]"
              : "text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
          }`}
        >
          <Home className={`w-5 h-5 mb-1 ${isPrehlad ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span>Prehľad</span>
        </Link>

        {/* 2. Platby */}
        <Link
          to="/platby"
          className={`flex flex-col items-center py-1 text-[11px] transition ${
            isPlatby
              ? "font-bold text-[#196ee6] dark:text-[#38bdf8]"
              : "text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
          }`}
        >
          <Banknote className={`w-5 h-5 mb-1 ${isPlatby ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span>Platby</span>
        </Link>

        {/* 3. Stredové vyvýšené tlačidlo '+' */}
        <div className="flex justify-center -mt-5">
          <Link
            to="/nova-platba"
            aria-label="Nová platba"
            className="w-13 h-13 rounded-full bg-[#196ee6] hover:bg-[#155ec4] text-white flex items-center justify-center shadow-lg shadow-[#196ee6]/35 active:scale-95 transition-all"
          >
            <Plus className="w-7 h-7 stroke-[2.6]" />
          </Link>
        </div>

        {/* 4. Rozpočet */}
        <Link
          to="/rozpocet"
          className={`flex flex-col items-center py-1 text-[11px] transition ${
            isRozpocet
              ? "font-bold text-[#196ee6] dark:text-[#38bdf8]"
              : "text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
          }`}
        >
          <PieChart className={`w-5 h-5 mb-1 ${isRozpocet ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span>Rozpočet</span>
        </Link>

        {/* 5. Viac (Nastavenia) */}
        <Link
          to="/nastavenia"
          className={`flex flex-col items-center py-1 text-[11px] transition ${
            isViac
              ? "font-bold text-[#196ee6] dark:text-[#38bdf8]"
              : "text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
          }`}
        >
          <Menu className={`w-5 h-5 mb-1 ${isViac ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span>Viac</span>
        </Link>

      </div>
    </nav>,
    document.body,
  );
}

export function BrandHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: ReactNode;
}) {
  return (
    <header className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between">
        {back ? (
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">George</span>
        )}
        {action}
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
    </header>
  );
}
