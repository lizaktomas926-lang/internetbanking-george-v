import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Home, ArrowLeftRight, PiggyBank, PieChart, CreditCard, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = [
  { to: "/", label: "Prehľad", icon: Home },
  { to: "/platby", label: "Platby", icon: ArrowLeftRight },
  { to: "/karty", label: "Karty", icon: CreditCard },
  { to: "/sporenie", label: "Sporenie", icon: PiggyBank },
  { to: "/rozpocet", label: "Rozpočet", icon: PieChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background pb-28">{children}</div>;
}

export function PersistentBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-border bg-surface/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgb(0_0_0/0.08)] backdrop-blur-xl">
      <div className="grid grid-cols-5 px-1">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
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
    <header className="brand-header px-5 pb-16 pt-6 text-brand-foreground">
      <div className="flex items-center justify-between">
        {back ? (
          <Link to="/platby" className="text-2xl leading-none">
            ←
          </Link>
        ) : (
          <span className="text-[13px] font-semibold tracking-wide opacity-90">George · Dobrý deň</span>
        )}
        {action}
      </div>
      <h1 className="mt-4 text-[34px] font-bold leading-none">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm opacity-80">{subtitle}</p> : null}
    </header>
  );
}
