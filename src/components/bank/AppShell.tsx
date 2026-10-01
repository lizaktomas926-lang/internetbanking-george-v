import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Home, ArrowLeftRight, Compass, Settings, ArrowLeft } from "lucide-react";

const navItems = [
  { to: "/", label: "Prehľad", icon: Home },
  { to: "/platby", label: "Platby", icon: ArrowLeftRight },
  { to: "/rozpocet", label: "Objavujte", icon: Compass },
  { to: "/nastavenia", label: "Profil", icon: Settings },
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

  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-border bg-surface/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_24px_rgb(0_0_0/0.06)] backdrop-blur-xl">
      <div className="grid grid-cols-4 px-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-medium transition-colors ${
                active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.3 : 1.8} />
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
