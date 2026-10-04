import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Txn = {
  id: string;
  type: "in" | "out";
  counterparty: string;
  iban?: string | undefined;
  amount: number;
  date: string; // ISO
  category: string;
  note?: string | undefined;
  vs?: string | undefined;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
};

export type BudgetLimit = { category: string; limit: number };

export type BankState = {
  owner: string;
  iban: string;
  transactions: Txn[];
  goals: Goal[];
  budgets: BudgetLimit[];
  loading: boolean;
  error: string | null;
};

export const CATEGORIES = [
  "Potraviny",
  "Bývanie",
  "Doprava",
  "Zábava",
  "Zdravie",
  "Poplatky",
  "Mzda",
  "Ostatné príjmy",
  "Sporenie",
  "Prevod",
];

function iso(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d, 10, 0, 0)).toISOString();
}

function randomIban() {
  let digits = "";
  for (let i = 0; i < 16; i++) digits += Math.floor(Math.random() * 10);
  const groups = digits.match(/.{1,4}/g) ?? [];
  return `SK31 1200 ${groups.slice(0, 3).join(" ")}`;
}

function seedTransactions() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  const rows: Omit<Txn, "id">[] =[
   { type: "in", counterparty: "Počiatočný zostatok", amount: 41097.5, date: iso(py, pm, 1), category: "Ostatné príjmy" },
category: "Ostatné príjmy" },
    { type: "in", counterparty: "Mzda · Karavela s.r.o.", amount: 1840, date: iso(y, m, 5), category: "Mzda", vs: "0100" },
    { type: "out", counterparty: "Billa", amount: 68.4, date: iso(y, m, 7), category: "Potraviny" },
    { type: "out", counterparty: "Nájom · Byt Petržalka", amount: 520, date: iso(y, m, 8), category: "Bývanie" },
    { type: "in", counterparty: "Radina Olha", iban: "SK42 1100 0000 0029 3633 0786", amount: 120, date: iso(y, m, 11), category: "Ostatné príjmy", note: "Vrátenie pôžičky" },
    { type: "out", counterparty: "Poplatok za vedenie účtu", amount: 7, date: iso(y, m, 12), category: "Poplatky", vs: "0898" },
    { type: "out", counterparty: "Slovnaft", amount: 52.1, date: iso(y, m, 14), category: "Doprava" },
    { type: "in", counterparty: "Mzda · Karavela s.r.o.", amount: 1840, date: iso(py, pm, 5), category: "Mzda" },
    { type: "out", counterparty: "Nájom · Byt Petržalka", amount: 520, date: iso(py, pm, 8), category: "Bývanie" },
    { type: "out", counterparty: "Kino Lumière", amount: 18, date: iso(py, pm, 19), category: "Zábava" },
  ];
  return rows;
}

const empty: BankState = {
  owner: "",
  iban: "",
  transactions: [],
  goals: [],
  budgets: [],
  loading: true,
  error: null,
};

let state: BankState = empty;
const listeners = new Set<() => void>();
let loadPromise: Promise<void> | null = null;

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

function num(v: unknown) {
  return typeof v === "number" ? v : Number(v ?? 0);
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function seedIfNeeded(userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("owner, iban, seeded")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.seeded) return profile;

  const iban = profile?.iban && profile.iban.length > 0 ? profile.iban : randomIban();

  await supabase.from("transactions").insert(
    seedTransactions().map((t) => ({
      user_id: userId,
      type: t.type,
      counterparty: t.counterparty,
      iban: t.iban ?? null,
      amount: t.amount,
      date: t.date,
      category: t.category,
      note: t.note ?? null,
      vs: t.vs ?? null,
    })),
  );
  await supabase.from("goals").insert([
    { user_id: userId, name: "Rezervný fond", target: 4000, saved: 2560 },
    { user_id: userId, name: "Dovolenka", target: 1200, saved: 340 },
  ]);
  await supabase.from("budgets").insert([
    { user_id: userId, category: "Potraviny", limit_amount: 400 },
    { user_id: userId, category: "Bývanie", limit_amount: 600 },
    { user_id: userId, category: "Doprava", limit_amount: 150 },
    { user_id: userId, category: "Zábava", limit_amount: 120 },
  ]);

  const { data: updated } = await supabase
    .from("profiles")
    .upsert({ id: userId, owner: profile?.owner ?? "", iban, seeded: true })
    .select("owner, iban, seeded")
    .maybeSingle();

  return updated ?? { owner: profile?.owner ?? "", iban, seeded: true };
}

export async function loadAll() {
  const userId = await currentUserId();
  if (!userId) {
    state = { ...empty, loading: false, error: null };
    emit();
    return;
  }

  const profile = await seedIfNeeded(userId);

  const [txns, goals, budgets] = await Promise.all([
    supabase.from("transactions").select("*").order("date", { ascending: false }),
    supabase.from("goals").select("*").order("created_at", { ascending: true }),
    supabase.from("budgets").select("*").order("created_at", { ascending: true }),
  ]);

  state = {
    owner: profile?.owner ?? "",
    iban: profile?.iban ?? "",
    transactions: (txns.data ?? []).map((r) => ({
      id: r.id,
      type: r.type === "in" ? "in" : "out",
      counterparty: r.counterparty,
      iban: r.iban ?? undefined,
      amount: num(r.amount),
      date: r.date,
      category: r.category,
      note: r.note ?? undefined,
      vs: r.vs ?? undefined,
    })),
    goals: (goals.data ?? []).map((g) => ({ id: g.id, name: g.name, target: num(g.target), saved: num(g.saved) })),
    budgets: (budgets.data ?? []).map((b) => ({ category: b.category, limit: num(b.limit_amount) })),
    loading: false,
    error: null,
  };
  emit();
}

export function hydrate() {
  if (!loadPromise) {
    loadPromise = loadAll().catch((error: unknown) => {
      console.error(error);
      state = {
        ...empty,
        loading: false,
        error: "Údaje účtu sa nepodarilo načítať. Skontrolujte pripojenie a skúste to znova.",
      };
      emit();
    });
  }
  return loadPromise;
}

export function resetStore() {
  loadPromise = null;
  state = empty;
  emit();
}

export function useBank() {
  const [snap, setSnap] = useState<BankState>(state);
  useEffect(() => {
    const l = () => setSnap(state);
    listeners.add(l);
    if (snap.loading) void hydrate();
    l();
    return () => {
      listeners.delete(l);
    };
  }, [snap.loading]);
  return snap;
}

export async function addTransaction(t: Omit<Txn, "id">) {
  const userId = await currentUserId();
  if (!userId) return;
  const { data } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: t.type,
      counterparty: t.counterparty,
      iban: t.iban ?? null,
      amount: t.amount,
      date: t.date,
      category: t.category,
      note: t.note ?? null,
      vs: t.vs ?? null,
    })
    .select("id")
    .maybeSingle();

  state.transactions = [{ ...t, id: data?.id ?? crypto.randomUUID() }, ...state.transactions];
  emit();

  void announceTransaction({ ...t, id: data?.id ?? "" });
}

async function announceTransaction(t: Txn) {
  const { notify } = await import("@/lib/notifications");

  if (t.type === "in") {
    await notify(
      "in",
      "Prijatý prevod",
      `${formatEur(t.amount)} od ${t.counterparty}. Nový zostatok ${formatEur(balance(state))}.`,
    );
  } else {
    await notify(
      "out",
      "Platba odoslaná",
      `${formatEur(t.amount)} pre ${t.counterparty}. Nový zostatok ${formatEur(balance(state))}.`,
    );

    const budget = state.budgets.find((b) => b.category === t.category);
    if (budget && budget.limit > 0) {
      const spent = state.transactions
        .filter((x) => x.type === "out" && x.category === t.category && inMonth(x))
        .reduce((a, x) => a + x.amount, 0);
      if (spent > budget.limit) {
        await notify(
          "budget",
          `Prekročený rozpočet · ${t.category}`,
          `Tento mesiac ste utratili ${formatEur(spent)} z limitu ${formatEur(budget.limit)}.`,
        );
      }
    }
  }
}

export async function addGoal(name: string, target: number) {
  const userId = await currentUserId();
  if (!userId) return;
  const { data } = await supabase
    .from("goals")
    .insert({ user_id: userId, name, target, saved: 0 })
    .select("id")
    .maybeSingle();
  state.goals = [...state.goals, { id: data?.id ?? crypto.randomUUID(), name, target, saved: 0 }];
  emit();
}

export async function depositToGoal(id: string, amount: number) {
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return;
  const saved = goal.saved + amount;
  await supabase.from("goals").update({ saved }).eq("id", id);
  state.goals = state.goals.map((g) => (g.id === id ? { ...g, saved } : g));
  emit();
  await addTransaction({
    type: "out",
    counterparty: `Sporenie · ${goal.name}`,
    amount,
    date: new Date().toISOString(),
    category: "Sporenie",
  });
}

export async function setBudget(category: string, limit: number) {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase
    .from("budgets")
    .upsert({ user_id: userId, category, limit_amount: limit }, { onConflict: "user_id,category" });
  const exists = state.budgets.some((b) => b.category === category);
  state.budgets = exists
    ? state.budgets.map((b) => (b.category === category ? { category, limit } : b))
    : [...state.budgets, { category, limit }];
  emit();
}

export async function removeBudget(category: string) {
  await supabase.from("budgets").delete().eq("category", category);
  state.budgets = state.budgets.filter((b) => b.category !== category);
  emit();
}

export async function saveProfile(owner: string, iban: string) {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from("profiles").upsert({ id: userId, owner, iban, seeded: true });
  state.owner = owner;
  state.iban = iban;
  emit();
}

/* selectors */
export function balance(s: BankState) {
  return s.transactions.reduce((acc, t) => acc + (t.type === "in" ? t.amount : -t.amount), 0);
}

export function inMonth(t: Txn, d = new Date()) {
  const x = new Date(t.date);
  return x.getUTCFullYear() === d.getUTCFullYear() && x.getUTCMonth() === d.getUTCMonth();
}

export function monthTotals(s: BankState, d = new Date()) {
  let income = 0;
  let expense = 0;
  for (const t of s.transactions) {
    if (!inMonth(t, d)) continue;
    if (t.type === "in") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense };
}

export const MONTHS = [
  "Január",
  "Február",
  "Marec",
  "Apríl",
  "Máj",
  "Jún",
  "Júl",
  "August",
  "September",
  "Október",
  "November",
  "December",
];

export function formatEur(n: number) {
  return new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(n);
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
}

export function groupByMonth(txns: Txn[]) {
  const map = new Map<string, Txn[]>();
  const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date));
  for (const t of sorted) {
    const d = new Date(t.date);
    const key = `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return [...map.entries()];
}
