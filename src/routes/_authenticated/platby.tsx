import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, FileDown, Search, X, Filter, Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/bank/AppShell";
import { TxnRow } from "@/components/bank/TxnRow";
import { balance, formatEur, groupByMonth, useBank, CATEGORIES, type Txn } from "@/lib/bank-store";
import { exportStatement } from "@/lib/pdf-export";

export const Route = createFileRoute("/_authenticated/platby")({
  head: () => ({
    meta: [
      { title: "História platieb | George" },
      { name: "description", content: "Vyhľadávanie, filtrovanie a výpisy z účtu." },
    ],
  }),
  component: Platby,
});

const TYPE_FILTERS = [
  { key: "all", label: "Všetko" },
  { key: "in", label: "Prijaté" },
  { key: "out", label: "Odoslané" },
] as const;

const PERIOD_FILTERS = [
  { key: "all", label: "Celé obdobie" },
  { key: "this_month", label: "Tento mesiac" },
  { key: "last_month", label: "Minulý mesiac" },
] as const;

function Platby() {
  const s = useBank();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "in" | "out">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [busyPdf, setBusyPdf] = useState(false);

  // Filtrovanie zoznamu platieb
  const filteredList = useMemo(() => {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    return s.transactions.filter((t) => {
      // 1. Filter typu
      if (typeFilter !== "all" && t.type !== typeFilter) return false;

      // 2. Filter kategórie
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

      // 3. Filter časového obdobia
      if (periodFilter !== "all") {
        const d = new Date(t.date);
        const y = d.getUTCFullYear();
        const m = d.getUTCMonth();

        if (periodFilter === "this_month") {
          if (y !== currentYear || m !== currentMonth) return false;
        } else if (periodFilter === "last_month") {
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          if (y !== prevYear || m !== prevMonth) return false;
        }
      }

      // 4. Fulltextové vyhľadávanie
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCounterparty = t.counterparty.toLowerCase().includes(q);
        const matchNote = t.note?.toLowerCase().includes(q) ?? false;
        const matchVs = t.vs?.toLowerCase().includes(q) ?? false;
        const matchAmount = String(t.amount).includes(q);
        const matchCategory = t.category.toLowerCase().includes(q);
        if (!matchCounterparty && !matchNote && !matchVs && !matchAmount && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [s.transactions, search, typeFilter, categoryFilter, periodFilter]);

  const groups = groupByMonth(filteredList);

  // Export do PDF
  async function downloadPdf() {
    if (filteredList.length === 0) {
      toast.info("Vo vybranom filtri nie sú žiadne platby na export.");
      return;
    }
    setBusyPdf(true);
    try {
      await exportStatement(s, filteredList);
      toast.success("PDF výpis bol stiahnutý");
    } catch (e) {
      console.error(e);
      toast.error("Výpis sa nepodarilo vytvoriť.");
    } finally {
      setBusyPdf(false);
    }
  }

  // Export do CSV
  function downloadCsv() {
    if (filteredList.length === 0) {
      toast.info("Vo vybranom filtri nie sú žiadne platby na export.");
      return;
    }

    const headers = ["Dátum", "Typ", "Protistrana", "IBAN", "Suma (€)", "Kategória", "VS", "Poznámka"];
    const rows = filteredList.map((t) => [
      t.date.slice(0, 10),
      t.type === "in" ? "Príjem" : "Výdavok",
      `"${(t.counterparty || "").replace(/"/g, '""')}"`,
      t.iban || "",
      t.type === "in" ? t.amount : -t.amount,
      `"${t.category}"`,
      t.vs || "",
      `"${(t.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vypis-george-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV výpis bol stiahnutý");
  }

  const hasActiveFilters = search || typeFilter !== "all" || categoryFilter !== "all" || periodFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setPeriodFilter("all");
  };

  return (
    <AppShell>
      <header className="brand-header px-5 pb-16 pt-6 text-brand-foreground">
        <h1 className="text-[34px] font-bold leading-none">Platby</h1>
      </header>

      <div className="-mt-12 space-y-4 px-4 pb-20">
        {/* Stav účtu a tlačidlá na export */}
        <section className="rounded-3xl bg-surface p-5 shadow-sm">
          <p className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">Aktuálny zostatok</p>
          <p className="mt-1 text-[28px] font-bold leading-none">{formatEur(balance(s))}</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={downloadPdf}
              disabled={busyPdf}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface-2 py-2.5 text-[12px] font-semibold transition-colors hover:bg-border/40 disabled:opacity-50"
            >
              <FileDown className="size-4 text-primary" /> {busyPdf ? "Pripravujem…" : "Stiahnuť PDF"}
            </button>
            <button
              onClick={downloadCsv}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface-2 py-2.5 text-[12px] font-semibold transition-colors hover:bg-border/40"
            >
              <Download className="size-4 text-emerald-600" /> Export do CSV
            </button>
          </div>
        </section>

        {/* Vyhľadávacie pole */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hľadať príjemcu, sumu, VS, poznámku..."
            className="w-full rounded-2xl border border-border bg-surface py-3 pl-10 pr-10 text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-surface-2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Hlavný filter typu platby */}
        <div className="flex gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                typeFilter === f.key ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Doplňujúce filtre: Obdobie a Kategória */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-[13px] font-medium outline-none"
          >
            {PERIOD_FILTERS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-[13px] font-medium outline-none"
          >
            <option value="all">Všetky kategórie</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Indikátor aktívnych filtrov */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between px-1 text-[12px] text-muted-foreground">
            <span>
              Nájdených platieb: <strong className="text-foreground">{filteredList.length}</strong>
            </span>
            <button onClick={resetFilters} className="font-semibold text-primary hover:underline">
              Zrušiť filtre
            </button>
          </div>
        )}

        {/* Zoznam transakcií */}
        {groups.length === 0 ? (
          <div className="rounded-3xl bg-surface p-8 text-center">
            <Filter className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-2 text-[15px] font-medium">Žiadne platby nezodpovedajú filtrom</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Skús upraviť vyhľadávanie alebo vymazať filtre.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 rounded-full bg-surface-2 px-4 py-2 text-[12px] font-semibold text-primary"
              >
                Resetovať filtre
              </button>
            )}
          </div>
        ) : (
          groups.map(([label, items]) => (
            <section key={label}>
              <h2 className="mb-2 text-[15px] font-semibold text-muted-foreground">{label}</h2>
              <div className="space-y-2">
                {items.map((t) => (
                  <TxnRow key={t.id} txn={t} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <Link
        to="/nova-platba"
        className="fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg"
      >
        <Plus className="size-4" /> Nová platba
      </Link>
    </AppShell>
  );
}
