import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, BellRing, PieChart, Volume2 } from "lucide-react";
import { formatEur } from "@/lib/bank-store";
import {
  clearNotifications,
  markAllRead,
  playNotificationSound,
  updateNotifSettings,
  useNotifications,
} from "@/lib/notifications";

export const Route = createFileRoute("/_authenticated/upozornenia")({
  head: () => ({
    meta: [
      { title: "Upozornenia · George" },
      {
        name: "description",
        content: "Zapnite si upozornenia na prijaté prevody, odoslané platby a prekročenie rozpočtu v internetbankingu George.",
      },
      { property: "og:title", content: "Upozornenia · George" },
      {
        property: "og:description",
        content: "Zapnite si upozornenia na prijaté prevody, odoslané platby a prekročenie rozpočtu v internetbankingu George.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Upozornenia,
});

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3 text-left"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`size-5 rounded-full bg-surface transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Upozornenia() {
  const { settings, items, loading } = useNotifications();

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background p-5">
      <div className="mb-6 flex items-center">
        <Link to="/nastavenia" className="mr-4">
          <ArrowLeft className="size-6 cursor-pointer" />
        </Link>
        <h1 className="text-2xl font-bold">Upozornenia</h1>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Kedy vás upozorníme</h2>
        <div className="mt-3 space-y-2">
          <Toggle
            label="Prijatý prevod"
            hint="Hlásenie, keď na účet pripíšeme peniaze."
            checked={settings.onIncoming}
            onChange={(v) => updateNotifSettings({ onIncoming: v })}
          />
          <Toggle
            label="Odoslaná platba"
            hint="Hlásenie po úspešnom odoslaní platby."
            checked={settings.onOutgoing}
            onChange={(v) => updateNotifSettings({ onOutgoing: v })}
          />
          <Toggle
            label="Prekročenie rozpočtu"
            hint="Hlásenie, keď výdavky prekročia mesačný limit kategórie."
            checked={settings.onBudget}
            onChange={(v) => updateNotifSettings({ onBudget: v })}
          />
          <Toggle
            label="Zvuk upozornenia"
            hint="Prehrať zvukové hlásenie pri každom upozornení."
            checked={settings.soundEnabled}
            onChange={(v) => updateNotifSettings({ soundEnabled: v })}
          />
        </div>
        <button
          type="button"
          onClick={playNotificationSound}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
        >
          <Volume2 className="size-4" /> Prehrať zvuk na ukážku
        </button>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Posledné hlásenia</h2>
          {items.length > 0 ? (
            <div className="flex gap-3 text-xs font-semibold text-primary">
              <button type="button" onClick={() => markAllRead()}>
                Označiť ako prečítané
              </button>
              <button type="button" onClick={() => clearNotifications()} className="text-muted-foreground">
                Vymazať
              </button>
            </div>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Načítavam…</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Zatiaľ žiadne hlásenia.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {items.map((n) => {
              const Icon = n.kind === "budget" ? PieChart : n.kind === "in" ? BellRing : Bell;
              return (
                <li
                  key={n.id}
                  className={`flex gap-3 rounded-xl border border-border px-3 py-3 ${
                    n.read ? "bg-background" : "bg-background ring-1 ring-primary/40"
                  }`}
                >
                  <Icon className={`mt-0.5 size-5 shrink-0 ${n.kind === "budget" ? "text-destructive" : "text-primary"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Hlásenia sa ukladajú v cloude, limit rozpočtu sledujeme v mene účtu ({formatEur(0).replace(/[\d\s,.]/g, "")}).
      </p>
    </div>
  );
}
