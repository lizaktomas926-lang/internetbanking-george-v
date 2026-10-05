import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Activity, TrendingUp, LayoutGrid, MessageSquare, ArrowLeft, Search, Plus } from "lucide-react";

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

  if (path !== "/") {
    return createPortal(
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[430px] items-center gap-3 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <Link to="/platby" aria-label="Hľadať" className="grid size-12 place-items-center rounded-full bg-surface text-primary">
          <Search className="size-6" />
        </Link>
        <Link
          to="/nova-platba"
          className="ml-auto flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[16px] font-semibold text-primary-foreground"
        >
          <Plus className="size-5" /> Nová platba
        </Link>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-border bg-surface/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 px-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = to === "/" && path === "/";
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-1 text-[12px] ${
                active ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`grid h-8 w-14 place-items-center rounded-full ${active ? "bg-primary/20" : ""}`}>
                {Icon ? <Icon className="size-5" /> : <span className="text-lg font-extrabold leading-none">g</span>}
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
