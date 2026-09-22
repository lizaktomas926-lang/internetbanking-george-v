import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
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
});

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
