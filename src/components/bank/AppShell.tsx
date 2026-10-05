import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Activity, TrendingUp, LayoutGrid, MessageSquare, ArrowLeft, Search, Plus, BarChart2 } from "lucide-react";

const navItems = [
  { to: "/", label: "Prehľad", icon: null },
  { to: "/rozpocet", label: "FIT", icon: Activity },
  { to: "/sporenie", label: "Invest", icon: TrendingUp },
  { to: "/karty", label: "Objavujte", icon: LayoutGrid },
  { to: "/nastavenia", label: "Kontakty", icon: MessageSquare },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background text-foreground pb-24">
      {children}
    </div>
  );
}

export function PersistentBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/nova-platba" || path.startsWith("/transakcia")) return null;

  // Spodná lišta pre obrazovku Účet (/platby) a ďalšie podstránky
  if (path !== "/") {
    return createPortal(
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[430px] items-center gap-2.5 border-t border-slate-200/60 dark:border-zinc-800/80 bg-white/95 dark:bg-[#161a23]/95 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <Link
          to="/platby"
          aria-label="Hľadať"
          className="grid size-11 place-items-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 active:scale-95 transition"
        >
          <Search className="size-5 stroke-[2.2]" />
        </Link>
        <Link
          to="/rozpocet"
          aria-label="Štatistika"
          className="grid size-11 place-items-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 active:scale-95 transition"
        >
          <BarChart2 className="size-5 stroke-[2.2]" />
        </Link>
        <Link
          to="/nova-platba"
          className="ml-auto flex h-11 items-center gap-2 rounded-full bg-[#196ee6] hover:bg-[#155ec4] px-5 text-[15px] font-semibold text-white shadow-sm active:scale-95 transition"
        >
          <Plus className="size-5 stroke-[2.4]" />
          <span>Nová platba</span>
        </Link>
      </div>,
      document.body,
    );
  }

  // Spodná lišta pre Prehľad (/)
  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-slate-200/60 dark:border-zinc-800/80 bg-white/95 dark:bg-[#161a23]/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 px-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = to === "/" && path === "/";
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-1 text-[11px] ${
                active ? "font-semibold text-[#196ee6] dark:text-[#38bdf8]" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className={`grid h-8 w-12 place-items-center rounded-full ${active ? "bg-[#edf4ff] dark:bg-[#182a3e]" : ""}`}>
                {Icon ? <Icon className="size-5" /> : <span className="text-base font-extrabold leading-none">g</span>}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
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
