import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CreditCard,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Globe,
  ShoppingBag,
  Sliders,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { formatEur, useBank } from "@/lib/bank-store";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/karty")({
  head: () => ({
    meta: [
      { title: "Platobné karty | George" },
      { name: "description", content: "Správa platobných kariet, blokovanie a limity v George." },
    ],
  }),
  component: KartyPage,
});

type CardSettings = {
  isFrozen: boolean;
  onlinePayments: boolean;
  foreignPayments: boolean;
  contactless: boolean;
  atmLimit: number;
  posLimit: number;
  onlineLimit: number;
};

const DEFAULT_SETTINGS: CardSettings = {
  isFrozen: false,
  onlinePayments: true,
  foreignPayments: true,
  contactless: true,
  atmLimit: 500,
  posLimit: 1500,
  onlineLimit: 1000,
};

function KartyPage() {
  const bank = useBank();
  const [showSensitive, setShowSensitive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<CardSettings>(() => {
    try {
      const saved = localStorage.getItem("george_card_settings");
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem("george_card_settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof CardSettings>(key: K, value: CardSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText("4255123456789012");
    setCopied(true);
    toast.success("Číslo karty bolo skopírované");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFreeze = () => {
    const nextState = !settings.isFrozen;
    updateSetting("isFrozen", nextState);
    if (nextState) {
      toast.warning("Karta bola dočasne zablokovaná");
    } else {
      toast.success("Karta je opäť aktívna");
    }
  };

  return (
    <AppShell>
      <header className="brand-header px-5 pb-16 pt-6 text-brand-foreground">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold tracking-wide opacity-90">George · Karty</p>
          <CreditCard className="size-6 opacity-90" />
        </div>
        <h1 className="mt-2 text-[34px] font-bold leading-none">Moje karty</h1>
      </header>

      <div className="-mt-12 space-y-5 px-4">
        {/* Vizuálna karta */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-xl transition-all duration-300 ${
            settings.isFrozen
              ? "bg-gradient-to-br from-zinc-700 to-zinc-900 opacity-90 grayscale"
              : "bg-gradient-to-br from-[#0051a8] via-[#0072ce] to-[#0091ff]"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                Debetná karta George
              </span>
              <p className="text-[15px] font-bold">{bank.owner || "Klient George"}</p>
            </div>
            <div className="flex items-center gap-2">
              {settings.isFrozen && (
                <span className="flex items-center gap-1 rounded-full bg-red-500/30 px-2.5 py-0.5 text-[11px] font-medium text-red-100 backdrop-blur-md">
                  <Lock className="size-3" /> Zablokovaná
                </span>
              )}
              <span className="text-[18px] font-black italic tracking-wider">VISA</span>
            </div>
          </div>

          <div className="my-6">
            <div className="flex items-center gap-3">
              <p className="font-mono text-[19px] tracking-[0.18em]">
                {showSensitive ? "4255 1234 5678 9012" : "•••• •••• •••• 9012"}
              </p>
              <button
                onClick={copyCardNumber}
                className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/10"
                title="Kopírovať číslo"
              >
                {copied ? <Check className="size-4 text-emerald-300" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between text-[12px]">
            <div>
              <p className="text-white/60">Platnosť</p>
              <p className="font-mono font-semibold">{showSensitive ? "08/29" : "••/••"}</p>
            </div>
            <div>
              <p className="text-white/60">CVV / CVC</p>
              <p className="font-mono font-semibold">{showSensitive ? "482" : "•••"}</p>
            </div>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              {showSensitive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              <span>{showSensitive ? "Skryť údaje" : "Zobraziť údaje"}</span>
            </button>
          </div>
        </div>

        {/* Rýchle akcie */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={toggleFreeze}
            className={`flex items-center justify-center gap-2 rounded-2xl p-4 font-semibold transition-colors ${
              settings.isFrozen
                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
            }`}
          >
            {settings.isFrozen ? (
              <>
                <Unlock className="size-5" /> Odblokovať
              </>
            ) : (
              <>
                <Lock className="size-5" /> Dočasne zablokovať
              </>
            )}
          </button>

          <button
            onClick={() => toast.info("Apple Pay / Google Wallet je pripravená")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-surface p-4 font-semibold text-foreground hover:bg-surface-2"
          >
            <Smartphone className="size-5 text-primary" /> Pridať do Peňaženky
          </button>
        </div>

        {/* Zabezpečenie a funkcie */}
        <section className="space-y-4 rounded-3xl bg-surface p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <ShieldCheck className="size-5 text-primary" /> Zabezpečenie a platby
          </h2>

          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-[14px] font-medium">Internetové platby</p>
                <p className="text-[12px] text-muted-foreground">Platenie na e-shopoch kartou</p>
              </div>
              <Switch
                checked={settings.onlinePayments}
                onCheckedChange={(v) => updateSetting("onlinePayments", v)}
                disabled={settings.isFrozen}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-[14px] font-medium">Platby v zahraničí</p>
                <p className="text-[12px] text-muted-foreground">Použitie mimo Slovenska a EÚ</p>
              </div>
              <Switch
                checked={settings.foreignPayments}
                onCheckedChange={(v) => updateSetting("foreignPayments", v)}
                disabled={settings.isFrozen}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-[14px] font-medium">Bezkontaktné platby</p>
                <p className="text-[12px] text-muted-foreground">Priloženie karty k terminálu</p>
              </div>
              <Switch
                checked={settings.contactless}
                onCheckedChange={(v) => updateSetting("contactless", v)}
                disabled={settings.isFrozen}
              />
            </div>
          </div>
        </section>

        {/* Denné limity */}
        <section className="space-y-4 rounded-3xl bg-surface p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <Sliders className="size-5 text-primary" /> Denné limity
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Výber z bankomatu</span>
                <span className="font-semibold text-foreground">{formatEur(settings.atmLimit)}</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={settings.atmLimit}
                onChange={(e) => updateSetting("atmLimit", Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Platby u obchodníkov (POS)</span>
                <span className="font-semibold text-foreground">{formatEur(settings.posLimit)}</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={settings.posLimit}
                onChange={(e) => updateSetting("posLimit", Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Internetový limit</span>
                <span className="font-semibold text-foreground">{formatEur(settings.onlineLimit)}</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={settings.onlineLimit}
                onChange={(e) => updateSetting("onlineLimit", Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
