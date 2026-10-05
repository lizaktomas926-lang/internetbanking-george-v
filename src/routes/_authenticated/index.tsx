import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, CreditCard, BarChart2, MoreVertical, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { Amount } from "@/components/bank/Amount";
import { balance, formatEur, monthTotals, MONTHS, useBank } from "@/lib/bank-store";

const DESC =
  "Náš internetbanking a apka má meno George. Získajte s ním prehľad o svojich financiách 24 hodín denne, 7 dní v týždni.";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Internetbanking George" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Internetbanking George" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GeorgePrehlad,
});

const pill =
  "inline-flex items-center rounded-full bg-primary/15 px-5 py-2.5 text-[15px] font-semibold text-primary active:scale-95 transition";

export default function GeorgePrehlad() {
  const s = useBank();
  const total = balance(s);
  const { income, expense } = monthTotals(s);
  const month = (MONTHS[new Date().getUTCMonth()] ?? "").toLowerCase();

  return (
    <AppShell>
      <header className="px-4 pt-6">
        <div className="flex items-center justify-end gap-5">
          <Link to="/ucet" aria-label="Hľadať"><Search className="size-6" /></Link>
          <Link to="/karty" aria-label="Karty"><CreditCard className="size-6" /></Link>
          <Link to="/nastavenia" aria-label="Profil" className="relative grid size-10 place-items-center rounded-full bg-surface-2">
            🦁
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-destructive" />
          </Link>
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">Prehľad</h1>
      </header>

      <div className="mt-5 flex gap-3 overflow-x-auto px-4 pb-1" data-no-swipe>
        <Link to="/rozpocet" className="min-w-[210px] rounded-3xl bg-surface p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[15px]">Výdavky za {month}</span>
            <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-primary">
              <BarChart2 className="size-4" />
            </span>
          </div>
          <p className="text-xl font-bold"><Amount value={expense} /></p>
          <p className="text-sm text-muted-foreground">
            {s.budgets.length ? "Nastavený rozpočet" : "Neurčený rozpočet"}
          </p>
        </Link>
        <div className="min-w-[210px] rounded-3xl bg-surface p-4">
          <span className="text-[15px]">Príjmy za {month}</span>
          <p className="mt-3 text-xl font-bold"><Amount value={income} /></p>
        </div>
      </div>

      <main className="space-y-4 px-4 pt-5">
        <h2 className="px-1 text-sm text-muted-foreground">Vaše produkty</h2>

        <div className="relative overflow-hidden rounded-3xl border-t-4 border-[#8a0a3c] bg-surface p-5">
          <Link to="/ucet" className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">Účet</h3>
              <div className="mt-1 text-3xl font-bold"><Amount value={total} /></div>
              <p className="mt-1 text-sm text-muted-foreground">{formatEur(total)} vlastné zdroje</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=100&auto=format&fit=crop&q=80"
              alt=""
              className="size-12 rounded-full object-cover"
            />
          </Link>
          <div className="mt-4 flex items-center justify-between">
            <Link to="/nova-platba" className={pill}>Nová platba</Link>
            <Link to="/ucet" aria-label="Viac" className="p-2 text-primary"><MoreVertical className="size-5" /></Link>
          </div>
        </div>

        <div className="rounded-3xl border-t-4 border-[#3b3a8f] bg-surface p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">Investície</h3>
              <div className="mt-1 text-3xl font-bold"><Amount value={0} /></div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80"
              alt=""
              className="size-12 rounded-full object-cover"
            />
          </div>
          <Link to="/sporenie" className={`${pill} mt-4`}>Vyhľadať a kúpiť</Link>
        </div>

        <div className="rounded-3xl border-t-4 border-[#5b2a6e] bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Moneyback</h3>
              <span className="mt-1 inline-block rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                5 nových ponúk
              </span>
              <p className="mt-2 text-sm text-muted-foreground">
                Objavte ponuky od najlepších značiek a získajte späť časť svojich peňazí.
              </p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#5b2a6e]/40 text-[#c084fc]">
              <ShoppingBag className="size-5" />
            </span>
          </div>
          <button type="button" className={`${pill} mt-4`}>Prezrite si 5 nových ponúk</button>
        </div>
      </main>
    </AppShell>
  );
}
