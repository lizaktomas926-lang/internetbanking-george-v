import { useEffect, useState } from "react";

export type Txn = {
  id: string;
  type: "in" | "out";
  counterparty: string;
  iban?: string;
  amount: number;
  date: string; // ISO
  category: string;
  note?: string;
  vs?: string;
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

const KEY = "sk-banka-v2";

function iso(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d, 10, 0, 0)).toISOString();
}

function seed(): BankState {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  return {
    owner: "Jakub Varga",
    iban: "SK31 1200 0000 1987 4263 7541",
    transactions: [
      { id: "t0", type: "in", counterparty: "Počiatočný zostatok", amount: 41098.5, date: iso(py, pm, 1), category: "Ostatné príjmy" },
      { id: "t1", type: "in", counterparty: "Mzda · Karavela s.r.o.", amount: 1840, date: iso(y, m, 5), category: "Mzda", vs: "0100" },
      { id: "t2", type: "out", counterparty: "Billa", amount: 68.4, date: iso(y, m, 7), category: "Potraviny" },
      { id: "t3", type: "out", counterparty: "Nájom · Byt Petržalka", amount: 520, date: iso(y, m, 8), category: "Bývanie" },
      { id: "t4", type: "in", counterparty: "Radina Olha", iban: "SK42 1100 0000 0029 3633 0786", amount: 120, date: iso(y, m, 11), category: "Ostatné príjmy", note: "Vrátenie pôžičky" },
      { id: "t5", type: "out", counterparty: "Poplatok za vedenie účtu", amount: 7, date: iso(y, m, 12), category: "Poplatky", vs: "0898" },
      { id: "t6", type: "out", counterparty: "Slovnaft", amount: 52.1, date: iso(y, m, 14), category: "Doprava" },
      { id: "t7", type: "in", counterparty: "Mzda · Karavela s.r.o.", amount: 1840, date: iso(py, pm, 5), category: "Mzda" },
      { id: "t8", type: "out", counterparty: "Nájom · Byt Petržalka", amount: 520, date: iso(py, pm, 8), category: "Bývanie" },
      { id: "t9", type: "out", counterparty: "Kino Lumière", amount: 18, date: iso(py, pm, 19), category: "Zábava" },
    ],
    goals: [
      { id: "g1", name: "Rezervný fond", target: 4000, saved: 2560 },
      { id: "g2", name: "Dovolenka", target: 1200, saved: 340 },
    ],
    budgets: [
      { category: "Potraviny", limit: 400 },
      { category: "Bývanie", limit: 600 },
      { category: "Doprava", limit: 150 },
      { category: "Zábava", limit: 120 },
    ],
  };
}

let state: BankState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...seed(), ...(JSON.parse(raw) as BankState) };
  } catch {
    /* ignore */
  }
  emit();
}

export function useBank() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    const timer = window.setTimeout(hydrate, 0);
    return () => {
      window.clearTimeout(timer);
      listeners.delete(l);
    };
  }, []);
  return state;
}

export function addTransaction(t: Omit<Txn, "id">) {
  state = { ...state, transactions: [{ ...t, id: crypto.randomUUID() }, ...state.transactions] };
  persist();
  emit();
}

export function addGoal(name: string, target: number) {
  state = { ...state, goals: [...state.goals, { id: crypto.randomUUID(), name, target, saved: 0 }] };
  persist();
  emit();
}

export function depositToGoal(id: string, amount: number) {
  state = {
    ...state,
    goals: state.goals.map((g) => (g.id === id ? { ...g, saved: g.saved + amount } : g)),
    transactions: [
      {
        id: crypto.randomUUID(),
        type: "out",
        counterparty: `Sporenie · ${state.goals.find((g) => g.id === id)?.name ?? ""}`,
        amount,
        date: new Date().toISOString(),
        category: "Sporenie",
      },
      ...state.transactions,
    ],
  };
  persist();
  emit();
}

export function setBudget(category: string, limit: number) {
  const exists = state.budgets.some((b) => b.category === category);
  state = {
    ...state,
    budgets: exists
      ? state.budgets.map((b) => (b.category === category ? { ...b, limit } : b))
      : [...state.budgets, { category, limit }],
  };
  persist();
  emit();
}

export function removeBudget(category: string) {
  state = { ...state, budgets: state.budgets.filter((b) => b.category !== category) };
  persist();
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
