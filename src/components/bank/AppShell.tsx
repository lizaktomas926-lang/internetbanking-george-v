import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { 
  TrendingUp, 
  LayoutGrid, 
  MessageSquare, 
  ArrowLeft 
} from "lucide-react";

// George "g" logo pre záložku Prehľad
function GeorgeGIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="10" r="5" />
      <path d="M17 10v6a4 4 0 0 1-4 4h-2" />
    </svg>
  );
}

// George FIT ikona (oblúky / signál)
function GeorgeFitIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className}>
      <path d="M5 19C7 13 11 8 18 6" />
      <path d="M8 20C10 15 13 11 19 9" strokeWidth="1.8" />
      <circle cx="18" cy="5" r="1.5" fill="#f43f5e" stroke="none" />
    </svg>
  );
}

export const defaultGeorgeNavItems = [
  { to: "/", label: "Prehľad", icon: GeorgeGIcon },
  { to: "/fit", label: "FIT", icon: GeorgeFitIcon },
  { to: "/invest", label: "Invest", icon: TrendingUp },
  { to: "/rozpocet", label: "Objavujte", icon: LayoutGrid },
  { to: "/kontakty", label: "Kontakty", icon: MessageSquare },
] as const;

export function AppShell({ 
  children,
  hideBottomNav = false,
}: { 
  children: ReactNode;
  hideBottomNav?: boolean;
}) {
  return (
    <div className={`mx-auto min-h-screen w-full max-w-[430px] bg-[#f2f4f8] dark:bg-[#0e1117] text-slate-900 dark:text-white ${hideBottomNav ? "pb-6" : "pb-24"}`}>
      {children}
    </div>
  );
}

export function PersistentBottomNav({
  items = defaultGeorgeNavItems,
}: {
  items?: readonly { to: string; label: string; icon: any }[];
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (typeof document === "undefined") return null;

  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-slate-200/90 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0f1218]/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-colors">
      <div className="grid grid-cols-5 px-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-1 transition-colors ${
                active 
                  ? "text-[#196ee6] dark:text-[#38bdf8] font-semibold" 
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              <div className={`flex items-center justify-center transition-all ${
                active 
                  ? "w-12 h-7 rounded-full bg-[#e3effe] dark:bg-[#162c45] text-[#196ee6] dark:text-[#38bdf8]" 
                  : "w-12 h-7"
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] tracking-tight">{label}</span>
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
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-white">
            <ArrowLeft className="size-5" />
          </Link>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-400">George</span>
        )}
       už mi Ttčko Ttčko ttť55 4e {action}
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{subtitle}</p> : null}
    </header>
  );
}
