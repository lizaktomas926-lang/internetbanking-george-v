import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  CreditCard, 
  PiggyBank, 
  PieChart, 
  Bell, 
  ArrowDownLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Fingerprint, 
  LogOut,
  Edit2,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resetStore, saveProfile, useBank } from "@/lib/bank-store";
import { resetNotifications, unreadCount, useNotifications } from "@/lib/notifications";
import {
  clearUnlocked,
  disableBiometric,
  enableBiometric,
  isBiometricEnabled,
  isBiometricSupported,
} from "@/lib/biometric";

export const Route = createFileRoute("/_authenticated/nastavenia")({
  head: () => ({
    meta: [
      { title: "Nastavenia · George" },
      { name: "description", content: "Nastavenia účtu, zabezpečenia a vzhľadu internetbankingu George." },
      { property: "og:title", content: "Nastavenia · George" },
      { property: "og:description", content: "Nastavenia účtu, zabezpečenia a vzhľadu internetbankingu George." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Nastavenia,
});

function Nastavenia() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const s = useBank();
  const notifs = useNotifications();
  const unread = unreadCount(notifs);

  // Profilové údaje
  const [owner, setOwner] = useState("");
  const [iban, setIban] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setOwner(s.owner || "Adam Večera");
    setIban(s.iban || "SK31 1200 3545 0984 0539");
  }, [s.owner, s.iban]);

  // Téma (Denný / Nočný režim)
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("george-theme");
    const isLight = saved === "light";
    setLight(isLight);
    document.documentElement.classList.toggle("light", isLight);
  }, []);

  function toggleTheme() {
    const nextLight = !light;
    setLight(nextLight);
    document.documentElement.classList.toggle("light", nextLight);
    window.localStorage.setItem("george-theme", nextLight ? "light" : "dark");
  }

  // Biometria
  const [userId, setUserId] = useState<string | null>(null);
  const [bioSupported, setBioSupported] = useState(false);
  const [bioUnlockOn, setBioUnlockOn] = useState(false);
  const [bioPayOn, setBioPayOn] = useState(true);
  const [bioBusy, setBioBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const id = data.user?.id ?? null;
      setUserId(id);
      if (id) {
        setBioUnlockOn(isBiometricEnabled(id));
        const savedPay = window.localStorage.getItem(`george-bio-pay:${id}`);
        setBioPayOn(savedPay !== "false");
      }
    });
    void isBiometricSupported().then((supported) => {
      if (active) setBioSupported(supported);
    });
    return () => {
      active = false;
    };
  }, []);

  async function toggleBioUnlock() {
    if (!userId) return;
    setBioBusy(true);
    try {
      if (bioUnlockOn) {
        disableBiometric(userId);
        setBioUnlockOn(false);
        toast.success("Odomknutie biometriou vypnuté");
      } else {
        await enableBiometric(userId, owner.trim() || "George");
        setBioUnlockOn(true);
        toast.success("Odomknutie biometriou zapnuté");
      }
    } catch {
      toast.error("Biometriu sa nepodarilo nastaviť. Overte prst alebo tvár ešte raz.");
    } finally {
      setBioBusy(false);
    }
  }

  function toggleBioPay() {
    if (!userId) return;
    const next = !bioPayOn;
    setBioPayOn(next);
    window.localStorage.setItem(`george-bio-pay:${userId}`, next ? "true" : "false");
    toast.success(next ? "Potvrdzovanie platieb biometriou zapnuté" : "Potvrdzovanie platieb biometriou vypnuté");
  }

  async function handleSaveProfile() {
    await saveProfile(owner.trim(), iban.trim());
    setIsEditing(false);
    toast.success("Údaje účtu boli uložené");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    resetStore();
    resetNotifications();
    clearUnlocked();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] dark:bg-[#0c0f17] text-slate-900 dark:text-white pb-32 font-sans transition-colors">
      
      {/* Modrá hlavička George */}
      <div className="bg-[#196ee6] dark:bg-[#111e33] px-5 pt-4 pb-14 text-white transition-colors">
        <Link 
          to="/" 
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </Link>
        <h1 className="text-[32px] font-extrabold tracking-tight text-white mt-4 leading-tight">
          Nastavenia
        </h1>
        <p className="text-[16px] text-white/80 font-medium">
          {owner}
        </p>
      </div>

      {/* Telo nastavení */}
      <div className="px-4 -mt-8 space-y-5">
        
        {/* Navigačné položky */}
        <div className="rounded-3xl bg-white dark:bg-[#161a23] shadow-sm border border-slate-100 dark:border-zinc-800/60 divide-y divide-slate-100 dark:divide-zinc-800/60 overflow-hidden">
          <Link to="/karty" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition">
            <div className="flex items-center gap-3.5">
              <CreditCard className="w-5 h-5 text-[#196ee6] dark:text-[#38bdf8]" />
              <span className="text-[15px] font-semibold">Karty</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>

          <Link to="/sporenie" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition">
            <div className="flex items-center gap-3.5">
              <PiggyBank className="w-5 h-5 text-[#196ee6] dark:text-[#38bdf8]" />
              <span className="text-[15px] font-semibold">Sporenie a ciele</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>

          <Link to="/rozpocet" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition">
            <div className="flex items-center gap-3.5">
              <PieChart className="w-5 h-5 text-[#196ee6] dark:text-[#38bdf8]" />
              <span className="text-[15px] font-semibold">Rozpočet</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>

          <Link to="/upozornenia" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition">
            <div className="flex items-center gap-3.5">
              <Bell className="w-5 h-5 text-[#196ee6] dark:text-[#38bdf8]" />
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold">Upozornenia</span>
                {unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#196ee6] text-white text-[11px] font-bold">
                    {unread}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>

          <Link to="/prijat" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition">
            <div className="flex items-center gap-3.5">
              <ArrowDownLeft className="w-5 h-5 text-[#196ee6] dark:text-[#38bdf8]" />
              <span className="text-[15px] font-semibold">Prijať peniaze</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>

        {/* VZHĽAD */}
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase px-1 mb-2">
            Vzhľad
          </p>
          <div className="rounded-3xl bg-white dark:bg-[#161a23] p-4 shadow-sm border border-slate-100 dark:border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-200">
                {light ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[15px] font-semibold">Denný režim</p>
                <p className="text-[12px] text-slate-400 dark:text-zinc-500">Prepnite kedykoľvek</p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                light ? "bg-[#196ee6]" : "bg-slate-200 dark:bg-zinc-700"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                light ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* ZABEZPEČENIE */}
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase px-1 mb-2">
            Zabezpečenie
          </p>
          <div className="rounded-3xl bg-white dark:bg-[#161a23] shadow-sm border border-slate-100 dark:border-zinc-800/60 divide-y divide-slate-100 dark:divide-zinc-800/60 overflow-hidden">
            
            {/* Odomknutie biometriou */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[#196ee6] dark:text-[#38bdf8]">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">Odomknutie biometriou</p>
                  <p className="text-[12px] text-slate-400 dark:text-zinc-500">Odtlačok prsta alebo tvár pri otvorení</p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleBioUnlock}
                disabled={bioBusy || !userId}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  bioUnlockOn ? "bg-[#196ee6]" : "bg-slate-200 dark:bg-zinc-700"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  bioUnlockOn ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Potvrdzovanie platieb */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[#196ee6] dark:text-[#38bdf8]">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">Potvrdzovanie platieb</p>
                  <p className="text-[12px] text-slate-400 dark:text-zinc-500">Biometria pred odoslaním novej platby</p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleBioPay}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  bioPayOn ? "bg-[#196ee6]" : "bg-slate-200 dark:bg-zinc-700"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  bioPayOn ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* MÔJ ÚČET */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
              Môj účet
            </p>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[13px] font-semibold text-[#196ee6] dark:text-[#38bdf8] hover:underline"
            >
              {isEditing ? "Zrušiť" : "Upraviť"}
            </button>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#161a23] p-5 shadow-sm border border-slate-100 dark:border-zinc-800/60 space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Meno majiteľa</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-[#196ee6]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 dark:text-zinc-500 font-medium">IBAN</label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-[#196ee6]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="w-full py-2.5 rounded-xl bg-[#196ee6] text-white font-semibold text-sm active:scale-98 transition"
                >
                  Uložiť zmeny
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 dark:text-zinc-500">Vlastník</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{owner}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 dark:text-zinc-500">IBAN</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">{iban}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 dark:text-zinc-500">Typ účtu</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Bežný účet</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tlačidlo Odhlásiť sa */}
        <button
          type="button"
          onClick={signOut}
          className="w-full py-4 rounded-2xl bg-white dark:bg-[#161a23] text-red-600 dark:text-red-400 font-semibold text-[15px] flex items-center justify-center gap-2 border border-slate-100 dark:border-zinc-800/60 shadow-sm active:scale-[0.99] transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Odhlásiť sa</span>
        </button>

      </div>
    </div>
  );
}
