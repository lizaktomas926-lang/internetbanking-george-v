import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { AppShell, BrandHeader } from "@/components/bank/AppShell";
import { useBank } from "@/lib/bank-store";

export const Route = createFileRoute("/_authenticated/karty")({
  head: () => ({
    meta: [
      { title: "Moje karty | George" },
      { name: "description", content: "Prehľad vašich platobných kariet v George." },
      { property: "og:title", content: "Moje karty | George" },
      { property: "og:description", content: "Prehľad vašich platobných kariet v George." },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  const s = useBank();
  const digits = (s.iban || "").replace(/\D/g, "");
  const lastFour = digits.slice(-4) || "0000";
  const holder = s.owner || "Majiteľ účtu";
  const now = new Date();
  const expiry = `${String(now.getMonth() + 1).padStart(2, "0")}/${String((now.getFullYear() + 4) % 100).padStart(2, "0")}`;

  return (
    <AppShell>
      <BrandHeader title="Moje karty" subtitle="Platobné karty k vášmu účtu" back />
      <div className="space-y-4 px-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#196ee6] to-[#0b3d91] p-5 text-white shadow-lg">
          <div className="mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <CreditCard className="size-5" /> Debetná karta VISA
            </span>
            <span className="text-xs opacity-80">Aktívna</span>
          </div>
          <div className="mb-4 text-lg tracking-widest">•••• •••• •••• {lastFour}</div>
          <div className="flex justify-between text-xs opacity-80">
            <span>Platnosť: {expiry}</span>
            <span>{holder}</span>
          </div>
        </div>
        <p className="px-1 text-xs text-muted-foreground">
          Ďalšie karty si budete môcť objednať čoskoro.
        </p>
      </div>
    </AppShell>
  );
}
