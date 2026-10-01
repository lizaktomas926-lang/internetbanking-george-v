import { useEffect, useMemo, useState } from "react";
import { Star, Clock } from "lucide-react";
import type { Txn } from "@/lib/bank-store";

export type Recipient = { name: string; iban: string; category?: string };

const key = (uid: string) => `george-fav-recipients:${uid}`;

function loadFavs(uid: string): Recipient[] {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) ?? "[]") as Recipient[];
  } catch {
    return [];
  }
}

export function RecipientPicker({
  userId,
  transactions,
  onPick,
  current,
}: {
  userId: string;
  transactions: Txn[];
  onPick: (r: Recipient) => void;
  current: Recipient;
}) {
  const [favs, setFavs] = useState<Recipient[]>([]);
  const [tab, setTab] = useState<"recent" | "fav">("recent");

  useEffect(() => setFavs(loadFavs(userId)), [userId]);

  const recent = useMemo(() => {
    const seen = new Set<string>();
    const out: Recipient[] = [];
    for (const t of [...transactions].sort((a, b) => b.date.localeCompare(a.date))) {
      if (t.type !== "out" || !t.iban) continue;
      const k = t.iban.replace(/\s/g, "");
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ name: t.counterparty, iban: t.iban, category: t.category });
      if (out.length >= 8) break;
    }
    return out;
  }, [transactions]);

  const norm = (i: string) => i.replace(/\s/g, "").toUpperCase();
  const isFav = (i: string) => favs.some((f) => norm(f.iban) === norm(i));

  function toggle(r: Recipient) {
    const next = isFav(r.iban) ? favs.filter((f) => norm(f.iban) !== norm(r.iban)) : [...favs, r];
    setFavs(next);
    localStorage.setItem(key(userId), JSON.stringify(next));
  }

  const list = tab === "recent" ? recent : favs;
  const canSaveCurrent = current.name.trim() && current.iban.trim().length >= 15 && !isFav(current.iban);

  return (
    <div className="rounded-3xl bg-surface p-4 shadow-sm">
      <div className="mb-3 flex gap-2">
        {(["recent", "fav"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"
            }`}
          >
            {t === "recent" ? <Clock className="size-3.5" /> : <Star className="size-3.5" />}
            {t === "recent" ? "Naposledy použité" : `Obľúbení (${favs.length})`}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-2 text-[13px] text-muted-foreground">
          {tab === "recent" ? "Zatiaľ ste neposlali žiadnu platbu na IBAN." : "Pridajte príjemcu hviezdičkou."}
        </p>
      ) : (
        <ul className="flex gap-2 overflow-x-auto pb-1" data-no-swipe>
          {list.map((r) => (
            <li key={r.iban} className="flex shrink-0 items-center gap-1 rounded-2xl border border-border pl-3">
              <button type="button" onClick={() => onPick(r)} className="max-w-[160px] py-2 text-left">
                <p className="truncate text-[13px] font-semibold">{r.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{r.iban}</p>
              </button>
              <button
                type="button"
                aria-label={isFav(r.iban) ? "Odobrať z obľúbených" : "Pridať do obľúbených"}
                onClick={() => toggle(r)}
                className="p-2"
              >
                <Star className={`size-4 ${isFav(r.iban) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {canSaveCurrent && (
        <button
          type="button"
          onClick={() => toggle({ name: current.name.trim(), iban: current.iban.trim().toUpperCase() })}
          className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-primary"
        >
          <Star className="size-3.5" /> Uložiť aktuálneho príjemcu
        </button>
      )}
    </div>
  );
}
