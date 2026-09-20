import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/bank/AppShell";
import { addGoal, depositToGoal, formatEur, useBank } from "@/lib/bank-store";

export const Route = createFileRoute("/sporenie")({
  head: () => ({
    meta: [
      { title: "Sporenie a ciele | George" },
      { name: "description", content: "Sporiace ciele, vklady a priebeh sporenia v eurách." },
      { property: "og:title", content: "Sporenie a ciele | George" },
      { property: "og:description", content: "Sporiace ciele, vklady a priebeh sporenia v eurách." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Sporenie,
});

const field =
  "w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary";

function Sporenie() {
  const s = useBank();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deposit, setDeposit] = useState<Record<string, string>>({});

  const saved = s.goals.reduce((a, g) => a + g.saved, 0);

  return (
    <AppShell>
      <header className="brand-header px-5 pb-16 pt-6 text-brand-foreground">
        <h1 className="text-[34px] font-bold leading-none">Sporenie</h1>
      </header>

      <div className="-mt-12 space-y-4 px-4">
        <section className="rounded-3xl bg-surface p-5">
          <p className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">Nasporené spolu</p>
          <p className="mt-1 text-[32px] font-bold leading-none text-income">{formatEur(saved)}</p>
        </section>

        {s.goals.map((g) => {
          const pct = Math.min(100, (g.saved / g.target) * 100);
          return (
            <section key={g.id} className="rounded-2xl bg-surface p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold">{g.name}</h2>
                <span className="text-[12px] font-semibold text-income">{Math.round(pct)}%</span>
              </div>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {formatEur(g.saved)} z {formatEur(g.target)}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-income" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className={field}
                  inputMode="decimal"
                  placeholder="Vklad (€)"
                  value={deposit[g.id] ?? ""}
                  onChange={(e) => setDeposit({ ...deposit, [g.id]: e.target.value })}
                />
                <button
                  onClick={() => {
                    const v = Number((deposit[g.id] ?? "").replace(",", "."));
                    if (Number.isFinite(v) && v > 0) {
                      depositToGoal(g.id, Math.round(v * 100) / 100);
                      setDeposit({ ...deposit, [g.id]: "" });
                    }
                  }}
                  className="shrink-0 rounded-2xl bg-primary px-5 text-[14px] font-semibold text-primary-foreground"
                >
                  Vložiť
                </button>
              </div>
            </section>
          );
        })}

        <section className="space-y-3 rounded-2xl bg-surface p-4">
          <p className="text-[14px] font-semibold">Nový cieľ</p>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Názov cieľa" />
          <input
            className={field}
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Cieľová suma (€)"
          />
          <button
            onClick={() => {
              const v = Number(target.replace(",", "."));
              if (name.trim() && Number.isFinite(v) && v > 0) {
                addGoal(name.trim(), v);
                setName("");
                setTarget("");
              }
            }}
            className="h-11 w-full rounded-2xl bg-surface-2 text-[14px] font-semibold"
          >
            Pridať cieľ
          </button>
        </section>
      </div>
    </AppShell>
  );
}
