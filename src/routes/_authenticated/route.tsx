import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PersistentBottomNav } from "@/components/bank/AppShell";
import { BiometricLock } from "@/components/bank/BiometricLock";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
  errorComponent: AuthErrorComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <p className="text-sm text-muted-foreground">Stránka sa nenašla.</p>
    </div>
  ),
});

function AuthErrorComponent({ error }: { error: Error }) {
  console.error(error);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-xl font-bold">Obrazovka sa nenačítala</h1>
      <p className="text-sm text-muted-foreground">Skúste to prosím znova alebo sa prihláste odznova.</p>
      <div className="flex gap-2">
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground"
        >
          Obnoviť
        </button>
        <Link
          to="/auth"
          className="rounded-xl border border-border bg-surface px-4 py-2.5 font-semibold text-foreground"
        >
          Prihlásenie
        </Link>
      </div>
    </div>
  );
}

function AuthenticatedLayout() {
  return (
    <BiometricLock>
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background pb-28">
        <Outlet />
        <PersistentBottomNav />
      </div>
    </BiometricLock>
  );
}
