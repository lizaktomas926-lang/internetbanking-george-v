import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Fingerprint, LogOut } from "lucide-react";
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
      { title: "Nastavenia účtu · George" },
      { name: "description", content: "Upravte meno majiteľa účtu, číslo účtu a upozornenia v internetbankingu George." },
      { property: "og:title", content: "Nastavenia účtu · George" },
      { property: "og:description", content: "Upravte meno majiteľa účtu, číslo účtu a upozornenia v internetbankingu George." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [owner, setOwner] = useState("");
  const [iban, setIban] = useState("");
  const [email, setEmail] = useState("");
  const [prijatyPrevod, setPrijatyPrevod] = useState(true);
  const [odoslanaPlatba, setOdoslanaPlatba] = useState(true);
  const [prekrocenieRozpoctu, setPrekrocenieRozpoctu] = useState(true);

  useEffect(() => {
    setOwner(s.owner);
    setIban(s.iban);
  }, [s.owner, s.iban]);

  const [userId, setUserId] = useState<string | null>(null);
  const [bioSupported, setBioSupported] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      const id = data.user?.id ?? null;
      setUserId(id);
      if (id) setBioOn(isBiometricEnabled(id));
    });
    isBiometricSupported().then(setBioSupported);
  }, []);

  async function toggleBiometric() {
    if (!userId) return;
    setBioBusy(true);
    try {
      if (bioOn) {
        disableBiometric(userId);
        setBioOn(false);
        toast.success("Odomykanie biometriou je vypnuté.");
      } else {
        await enableBiometric(userId, owner.trim() || email || "George");
        setBioOn(true);
        toast.success("Aplikácia sa teraz odomkne odtlačkom prsta alebo tvárou.");
      }
    } catch {
      toast.error("Overenie sa nepodarilo. Skontrolujte zámku obrazovky na zariadení.");
    } finally {
      setBioBusy(false);
    }
  }

  async function save() {
    await saveProfile(owner.trim(), iban.trim());
    toast.success("Údaje účtu sú uložené.");
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
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background p-5">
      <div className="mb-6 flex items-center">
        <Link to="/" className="mr-4">
          <ArrowLeft className="size-6 cursor-pointer" />
        </Link>
        <h1 className="text-2xl font-bold">Nastavenia</h1>
      </div>

      <section className="mb-5 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <Fingerprint className="mt-0.5 size-5 text-primary" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold">Odomykanie odtlačkom alebo tvárou</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {bioSupported
                ? "Aplikácia si pri otvorení vyžiada odtlačok prsta, tvár alebo zámku obrazovky."
                : "Toto zariadenie alebo prehliadač nepodporuje odomykanie zámkou obrazovky."}
            </p>
          </div>
        </div>
        <button
          onClick={toggleBiometric}
          disabled={!bioSupported || bioBusy || !userId}
          className={`mt-4 w-full rounded-xl px-4 py-3 font-semibold disabled:opacity-60 ${
            bioOn
              ? "border border-border bg-background text-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {bioBusy ? "Overujem…" : bioOn ? "Vypnúť odomykanie biometriou" : "Zapnúť odomykanie biometriou"}
        </button>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Môj účet</h2>
        <label className="mt-3 block text-sm">
          <span className="text-muted-foreground">Meno majiteľa účtu</span>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary"
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-muted-foreground">Číslo účtu (IBAN)</span>
          <input
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary"
          />
        </label>
        {email ? <p className="mt-3 text-xs text-muted-foreground">Prihlásený e-mail: {email}</p> : null}
        <button
          onClick={save}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground"
        >
          Uložiť údaje
        </button>
      </section>

      <Link
        to="/upozornenia"
        className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
      >
        <span>
          <span className="block text-sm font-semibold">Upozornenia</span>
          <span className="block text-xs text-muted-foreground">
            Prijatý prevod, odoslaná platba, prekročenie rozpočtu {unread > 0 ? `· ${unread} nových` : ""}
          </span>
        </span>
        <span className="flex items-center gap-2 text-primary">
          {unread > 0 ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
              {unread}
            </span>
          ) : null}
          <Bell className="size-5" />
        </span>
      </Link>

      <button
        onClick={signOut}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 font-semibold text-foreground"
      >
        <LogOut className="size-4" /> Odhlásiť sa
      </button>
    </div>
  );
}
