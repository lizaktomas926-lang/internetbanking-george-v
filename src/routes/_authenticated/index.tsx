import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  BarChart2,
  Plus,
  Edit3,
  RotateCw,
  Smartphone,
  FileText,
  Zap,
  CheckSquare,
  QrCode,
  BatteryCharging,
  PiggyBank,
  CreditCard,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { balance, formatEur, useBank } from "@/lib/bank-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/platby")({
  head: () => ({
    meta: [
      { title: "Detail účtu | George" },
      { name: "description", content: "Prehľad transakcií a správa SPACE účtu George." },
    ],
  }),
  component: DetailUctuGeorge,
});

type TabType = "transakcie" | "funkcie" | "karty" | "info";

export default function DetailUctuGeorge() {
  const s = useBank();
  const navigate = useNavigate();
  const total = balance(s);
  const [activeTab, setActiveTab] = useState<TabType>("transakcie");
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedBic, setCopiedBic] = useState(false);

  function copyText(text: string, isIban: boolean) {
    navigator.clipboard.writeText(text);
    if (isIban) {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    } else {
      setCopiedBic(true);
      setTimeout(() => setCopiedBic(false), 2000);
    }
    toast.success("Skopírované do schránky");
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Číslo účtu",
        text: `SPACE účet: ${s.iban} (${s.owner})`,
      }).catch(() => {});
    } else {
      copyText(s.iban, true);
    }
  }

  function renderFormattedAmount(amount: number) {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const whole = Math.floor(absVal).toLocaleString("sk-SK");
    const cents = Math.round((absVal - Math.floor(absVal)) * 100)
      .toString()
      .padStart(2, "0");

    return (
      <span className={isNegative ? "text-[#C80036]" : "text-slate-900"}>
        {isNegative ? "-" : ""}
        {whole}
        <span className="text-xl font-bold align-top">,{cents}</span> €
      </span>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#F4F6F9] pb-28 text-slate-900 font-sans">
        {/* 1. George Fuchsiová hlavička (Screenshot 2-5) */}
        <header className="relative bg-[#C8005A] px-4 pt-6 pb-16 text-white">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="rounded-full p-2 text-white/90 transition hover:bg-white/10 active:scale-95"
              aria-label="Späť na Prehľad"
            >
              <ArrowLeft className="size-6" />
            </button>
          </div>
        </header>

        {/* 2. Hlavná biela karta účtu vysunutá cez hlavičku */}
        <div className="-mt-11 px-4">
          <div className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Účet</h2>
                <div className="mt-1 text-2xl font-extrabold tracking-tight">
                  {renderFormattedAmount(total)}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatEur(total)} vlastné zdroje
                </p>
              </div>

              {/* Kruhová fotka účtu */}
              <div className="size-12 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=100&auto=format&fit=crop&q=80"
                  alt="Účet"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Štyri oválne záložky (Pills) */}
        <div className="mt-4 px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {(
              [
                { id: "transakcie", label: "Transakcie" },
                { id: "funkcie", label: "Funkcie" },
                { id: "karty", label: "Karty" },
                { id: "info", label: "Info" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#EBF3FC] text-[#196EE6] shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Obsah záložiek */}
        <main className="mt-4 px-4">
          {/* TAB 1: TRANSAKCIE (Screenshot 2) */}
          {activeTab === "transakcie" && (
            <div className="space-y-4">
              {/* Box: Platobné príkazy a rezervácie */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-[#E40046] border border-orange-100">
                  <Edit3 className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Platobné príkazy a rezervácie
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    1 nezrealizovaná platba & 0 rezervácií
                  </p>
                </div>
              </div>

              {/* Zoznam transakcií po mesiacoch */}
              <div className="space-y-4">
                {/* September 2026 */}
                <div>
                  <h4 className="px-1 py-1 text-xs font-semibold text-slate-600">
                    September 2026
                  </h4>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#196EE6] text-white font-bold text-lg">
                          §
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Poplatok</p>
                          <p className="text-[11px] text-slate-500">30.09.2026</p>
                          <p className="text-[11px] text-slate-500">KS: 0898</p>
                          <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Poplatky
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">-7,00 €</span>
                    </div>
                  </div>
                </div>

                {/* August 2026 */}
                <div>
                  <h4 className="px-1 py-1 text-xs font-semibold text-slate-600">
                    August 2026
                  </h4>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#196EE6] text-white font-bold text-lg">
                          §
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Poplatok</p>
                          <p className="text-[11px] text-slate-500">31.08.2026</p>
                          <p className="text-[11px] text-slate-500">KS: 0898</p>
                          <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Poplatky
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">-7,00 €</span>
                    </div>
                  </div>
                </div>

                {/* Júl 2026 */}
                <div>
                  <h4 className="px-1 py-1 text-xs font-semibold text-slate-600">
                    Júl 2026
                  </h4>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#196EE6] text-white font-bold text-lg">
                          §
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Poplatok</p>
                          <p className="text-[11px] text-slate-500">31.07.2026</p>
                          <p className="text-[11px] text-slate-500">KS: 0898</p>
                          <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Poplatky
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">-7,00 €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plávajúca spodná lišta George v detaile účtu (Screenshot 2) */}
              <div className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Vyhľadávanie v transakciách"
                    className="flex size-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-md border border-slate-200/60 active:scale-95"
                  >
                    <Search className="size-5" />
                  </button>
                  <Link
                    to="/rozpocet"
                    aria-label="Štatistika výdavkov"
                    className="flex size-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-md border border-slate-200/60 active:scale-95"
                  >
                    <BarChart2 className="size-5" />
                  </Link>
                </div>

                <Link
                  to="/nova-platba"
                  className="flex items-center gap-2 rounded-full bg-[#196EE6] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600 active:scale-95"
                >
                  <Plus className="size-4 stroke-[3]" />
                  <span>Nová platba</span>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: FUNKCIE (Screenshot 3) */}
          {activeTab === "funkcie" && (
            <div className="space-y-4">
              <div className="divide-y divide-slate-100 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <Link
                  to="/nova-platba"
                  className="flex items-center gap-3.5 p-4 transition hover:bg-slate-50"
                >
                  <RotateCw className="size-5 text-[#196EE6] shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Trvalé príkazy</span>
                </Link>

                <div className="flex items-center gap-3.5 p-4 transition hover:bg-slate-50 cursor-pointer">
                  <Smartphone className="size-5 text-[#196EE6] shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Výber z bankomatu mobilom
                  </span>
                </div>

                <div className="flex items-center gap-3.5 p-4 transition hover:bg-slate-50 cursor-pointer">
                  <FileText className="size-5 text-[#196EE6] shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Výpisy z účtu</span>
                </div>

                <div className="flex items-center gap-3.5 p-4 transition hover:bg-slate-50">
                  <Zap className="size-5 text-[#196EE6] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      Limit pre okamžité platby (SEPA)
                    </span>
                    <p className="text-[11px] text-slate-500">10 000 € na deň</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 transition hover:bg-slate-50 cursor-pointer">
                  <CheckSquare className="size-5 text-[#196EE6] shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Súhlasy s inkasom</span>
                </div>

                <Link
                  to="/prijat"
                  className="flex items-center gap-3.5 p-4 transition hover:bg-slate-50"
                >
                  <QrCode className="size-5 text-[#196EE6] shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Vytvoriť payme link / QR kód
                  </span>
                </Link>

                <div className="flex items-center gap-3.5 p-4 transition hover:bg-slate-50 cursor-pointer">
                  <BatteryCharging className="size-5 text-[#196EE6] shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Dobiť kredit</span>
                </div>
              </div>

              {/* Sekcia Automatické sporenie */}
              <div className="pt-2">
                <h4 className="px-1 py-1 text-xs font-semibold text-slate-600">
                  Automatické sporenie
                </h4>
                <div className="mt-1 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <PiggyBank className="size-5 text-[#196EE6]" />
                    <span className="text-xs font-bold text-slate-900">Drobné bokom</span>
                  </div>
                  <span className="rounded-full bg-[#196EE6] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    Nové
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KARTY (Screenshot 4) */}
          {activeTab === "karty" && (
            <div className="space-y-4">
              {/* Hlavná grafická karta */}
              <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="relative h-14 w-24 overflow-hidden rounded-lg bg-slate-900 shadow-xs shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&auto=format&fit=crop&q=80"
                    alt="VISA virtuálna karta"
                    className="h-full w-full object-cover opacity-80"
