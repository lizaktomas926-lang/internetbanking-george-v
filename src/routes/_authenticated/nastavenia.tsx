import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resetStore, saveProfile, useBank } from "@/lib/bank-store";

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function save() {
    await saveProfile(owner.trim(), iban.trim());
    toast.success("Údaje účtu sú uložené.");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    resetStore();
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

      <section className="mt-5 rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Upozornenia</h2>
        <div className="mt-3 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Prijatý prevod</span>
            <input type="checkbox" checked={prijatyPrevod} onChange={() => setPrijatyPrevod(!prijatyPrevod)} />
          </div>
          <div className="flex items-center justify-between">
            <span>Odoslaná platba</span>
            <input type="checkbox" checked={odoslanaPlatba} onChange={() => setOdoslanaPlatba(!odoslanaPlatba)} />
          </div>
          <div className="flex items-center justify-between">
            <span>Prekročenie rozpočtu</span>
            <input
              type="checkbox"
              checked={prekrocenieRozpoctu}
              onChange={() => setPrekrocenieRozpoctu(!prekrocenieRozpoctu)}
            />
          </div>
        </div>
      </section>

      <button
        onClick={signOut}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 font-semibold text-foreground"
      >
        <LogOut className="size-4" /> Odhlásiť sa
      </button>
    </div>
  );
}
