import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ArrowLeft, 
  Search, 
  BarChart2, 
  Plus, 
  FileEdit,
  CreditCard,
  QrCode,
  SlidersHorizontal,
  Copy,
  Share2
} from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { useBank } from "@/lib/bank-store";

export const Route = createFileRoute("/_authenticated/platby")({
  head: () => ({
    meta: [
      { title: "Účet a transakcie | George" },
      { name: "description", content: "História transakcií a správa účtu George" },
    ],
  }),
  component: UcetDetail,
});

// Logo ikona Slovenskej sporiteľne pre poplatky a bankové položky
function SlspLogoIcon() {
  return (
    <div className="w-10 h-10 rounded-full bg-[#196ee6] flex items-center justify-center text-white shrink-0 shadow-sm">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <circle cx="12" cy="6" r="2.2" />
        <rect x="7" y="10" width="10" height="2.5" rx="1.2" />
        <rect x="7" y="14" width="10" height="2.5" rx="1.2" />
        <rect x="7" y="18" width="10" height="2.5" rx="1.2" />
      </svg>
    </div>
  );
}

export default function UcetDetail() {
  const s = useBank();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"transakcie" | "funkcie" | "karty" | "info">("transakcie");

  const balanceMain = "-18 300";
  const balanceCents = "35";
  const ownResources = "-18 300,35 € vlastné zdroje";

  // História transakcií podľa screenshotov
  const monthGroups = [
    {
      month: "September 2026",
      items: [
        { id: "slsp-poplatok-09", title: "Poplatok", date: "30.09.2026", ks: "KS: 0898", tag: "Poplatky", amount: "-7,00 €" },
      ]
    },
    {
      month: "August 2026",
      items: [
        { id: "slsp-poplatok-08", title: "Poplatok", date: "31.08.2026", ks: "KS: 0898", tag: "Poplatky", amount: "-7,00 €" },
      ]
    },
    {
      month: "Júl 2026",
      items: [
        { id: "slsp-poplatok-07", title: "Poplatok", date: "31.07.2026", ks: "KS: 0898", tag: "Poplatky", amount: "-7,00 €" },
      ]
    }
  ];

  return (
    <AppShell hideBottomNav={true}>
      <div className="min-h-screen bg-[#f2f4f8] dark:bg-[#0e1117] text-slate-900 dark:text-white pb-28 font-sans transition-colors">
        
        {/* Fuchsiová hlavička s bielou šípkou späť */}
        <div className="bg-[#be0055] px-4 pt-3 pb-16 text-white transition-colors">
          <div className="flex items-center py-2">
            <Link 
              to="/" 
              className="p-1 -ml-1 text-white hover:opacity-80 active:scale-95 transition"
              aria-label="Späť na prehľad"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </Link>
          </div>
        </div>

        <div className="px-4 -mt-10 space-y-3">
          {/* Karta účtu (prekrýva hlavičku) */}
          <div className="rounded-2xl bg-white dark:bg-[#161a23] p-5 shadow-sm border border-slate-100 dark:border-zinc-800/40">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[17px] font-semibold text-slate-900 dark:text-white">Účet</h1>
                
                {/* Zostatok v koralovej / červenej farbe */}
                <div className="mt-1 flex items-baseline text-[#e11d48] dark:text-[#ff5a70]">
                  <span className="text-[32px] font-bold leading-none tracking-tight">
                    {balanceMain},
                  </span>
                  <span className="text-[18px] font-bold leading-none ml-0.5">
                    {balanceCents}&nbsp;€
                  </span>
                </div>

                <p className="mt-1.5 text-[13px] text-slate-500 dark:text-zinc-400">
                  {ownResources}
                </p>
              </div>

              {/* Kruhový obrázok mesta */}
              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700/60 shrink-0 bg-slate-100 dark:bg-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=120&auto=format&fit=crop&q=80"
                  alt="Účet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Funkčná lišta (4 záložky: Transakcie, Funkcie, Karty, Info) */}
          <div className="flex items-center justify-between gap-1 pt-1 pb-1 text-[14px]">
            <button
              type="button"
              onClick={() => setActiveTab("transakcie")}
              className={`rounded-full px-4 py-2 font-semibold transition ${
                activeTab === "transakcie"
                  ? "bg-[#e8f1fd] dark:bg-[#182a40] text-[#196ee6] dark:text-[#60a5fa]"
                  : "text-[#196ee6] dark:text-[#60a5fa] hover:opacity-80"
              }`}
            >
              Transakcie
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("funkcie")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                activeTab === "funkcie"
                  ? "bg-[#e8f1fd] dark:bg-[#182a40] text-[#196ee6] dark:text-[#60a5fa]"
                  : "text-[#196ee6] dark:text-[#60a5fa] hover:opacity-80"
              }`}
            >
              Funkcie
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("karty")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                activeTab === "karty"
                  ? "bg-[#e8f1fd] dark:bg-[#182a40] text-[#196ee6] dark:text-[#60a5fa]"
                  : "text-[#196ee6] dark:text-[#60a5fa] hover:opacity-80"
              }`}
            >
              Karty
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                activeTab === "info"
                  ? "bg-[#e8f1fd] dark:bg-[#182a40] text-[#196ee6] dark:text-[#60a5fa]"
                  : "text-[#196ee6] dark:text-[#60a5fa] hover:opacity-80"
              }`}
            >
              Info
            </button>
          </div>

          {/* Obsah záložky Transakcie */}
          {activeTab === "transakcie" && (
            <div className="space-y-4">
              {/* Karta: Platobné príkazy a rezervácie */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white dark:bg-[#161a23] p-4 shadow-sm border border-slate-100 dark:border-zinc-800/40">
                <div className="text-[#f43f5e] shrink-0">
                  <FileEdit className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                    Platobné príkazy a rezervácie
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    1 nezrealizovaná platba & 0 rezervácií
                  </p>
                </div>
              </div>

              {/* Skupiny transakcií po mesiacoch */}
              {monthGroups.map((group) => (
                <div key={group.month} className="space-y-2 pt-1">
                  <h2 className="text-[14px] font-semibold text-slate-800 dark:text-zinc-200 px-1">
                    {group.month}
                  </h2>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate({ to: `/transakcia/${item.id}` as any })}
                        className="cursor-pointer flex items-center justify-between rounded-2xl bg-white dark:bg-[#161a23] p-4 shadow-sm border border-slate-100 dark:border-zinc-800/40 hover:bg-slate-50 dark:hover:bg-[#1c212c] transition"
                      >
                        <div className="flex items-center gap-3">
                          <SlspLogoIcon />
                          <div>
                            <p className="text-[15px] font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </p>
                            <p className="text-[12px] text-slate-500 dark:text-zinc-400">
                              {item.date}
                            </p>
                            <p className="text-[12px] text-slate-500 dark:text-zinc-400">
                              {item.ks}
                            </p>
                            <div className="mt-1">
                              <span className="inline-block rounded-full border border-slate-200 dark:border-zinc-700 px-2 py-0.5 text-[11px] text-slate-600 dark:text-zinc-300">
                                {item.tag}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[16px] font-bold text-slate-900 dark:text-white">
                            {item.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Obsah záložky Funkcie */}
          {activeTab === "funkcie" && (
            <div className="space-y-2.5">
              {[
                { title: "Trvalé príkazy", desc: "Správa opakovaných platieb", icon: QrCode },
                { title: "Výber z bankomatu mobilom", desc: "Kód pre bezkartový výber", icon: SlidersHorizontal },
                { title: "Výpisy z účtu", desc: "Mesačné a ročné PDF výpisy", icon: FileEdit },
              ].map((f) => (
                <div key={f.title} className="flex items-center justify-between rounded-2xl bg-white dark:bg-[#161a23] p-4 shadow-sm border border-slate-100 dark:border-zinc-800/40">
                  <div className="flex items-center gap-3">
                    <f.icon className="w-5 h-5 text-[#196ee6] dark:text-[#38bdf8]" />
                    <div>
                      <p className="text-[15px] font-medium text-slate-900 dark:text-white">{f.title}</p>
                      <p className="text-[12px] text-slate-500 dark:text-zinc-400">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Obsah záložky Karty */}
          {activeTab === "karty" && (
            <div className="rounded-2xl bg-white dark:bg-[#161a23] p-5 shadow-sm border border-slate-100 dark:border-zinc-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-slate-500 dark:text-zinc-400">Virtuálna karta</p>
                  <p className="text-[16px] font-bold text-slate-900 dark:text-white mt-0.5">VISA Debit ···· 2269</p>
                </div>
                <CreditCard className="w-8 h-8 text-[#196ee6] dark:text-[#38bdf8]" />
              </div>
            </div>
          )}

          {/* Obsah záložky Info */}
          {activeTab === "info" && (
            <div className="rounded-2xl bg-white dark:bg-[#161a23] p-5 shadow-sm border border-slate-100 dark:border-zinc-800/40 space-y-3">
              <div>
                <p className="text-[12px] text-slate-500 dark:text-zinc-400">Názov účtu</p>
                <p className="text-[15px] font-medium text-slate-900 dark:text-white">SPACE účet</p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 dark:text-zinc-400">IBAN</p>
                <p className="text-[14px] font-mono font-medium text-slate-900 dark:text-white">SK83 0900 0000 0052 0892 1207</p>
              </div>
            </div>
          )}
        </div>

        {/* Špeciálna plávajúca spodná lišta pre obrazovku Účtu */}
        <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0f1218]/95 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            {/* Ľavé dve okrúhle tlačidlá: Hľadať a Štatistika */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="flex w-11 h-11 items-center justify-center rounded-full bg-[#edf4ff] dark:bg-[#16273c] text-[#196ee6] dark:text-[#38bdf8] hover:opacity-85 transition"
                aria-label="Vyhľadať v transakciách"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>

              <button
                type="button"
                className="flex w-11 h-11 items-center justify-center rounded-full bg-[#edf4ff] dark:bg-[#16273c] text-[#196ee6] dark:text-[#38bdf8] hover:opacity-85 transition"
                aria-label="Prehľad výdavkov a štatistika"
              >
                <BarChart2 className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* Pravé pilulkové tlačidlo: + Nová platba */}
            <Link
              to="/nova-platba"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#196ee6] hover:bg-[#155fc7] px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[2.4]" />
              <span>Nová platba</span>
            </Link>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
