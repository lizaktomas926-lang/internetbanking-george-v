import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, ArrowLeftRight, PiggyBank, PieChart } from "lucide-react";

const tabs = [
  { to: "/", label: "Prehľad", icon: Home },
  { to: "/platby", label: "Platby", icon: ArrowLeftRight },
  { to: "/sporenie", label: "Sporenie", icon: PiggyBank },
  { to: "/rozpocet", label: "Rozpočet", icon: PieChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background pb-24">
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-border bg-surface/95 backdrop-blur">
        <div className="grid grid-cols-4 px-2 py-2">
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
      </nav>
    </div>
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
          <span className="text-[13px] font-medium opacity-80">Dobrý deň</span>
        )}
        {action}
      </div>
      <h1 className="mt-4 text-[34px] font-bold leading-none">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm opacity-80">{subtitle}</p> : null}
    </header>
  );
}
