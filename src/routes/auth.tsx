import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Prihlásenie · Internetbanking George" },
      {
        name: "description",
        content: "Prihláste sa do internetbankingu George a majte svoje platby, sporenie a rozpočet vždy po ruke.",
      },
      { property: "og:title", content: "Prihlásenie · Internetbanking George" },
      {
        property: "og:description",
        content: "Prihláste sa do internetbankingu George a majte svoje platby, sporenie a rozpočet vždy po ruke.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [owner, setOwner] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { owner: owner.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Poslali sme vám overovací e-mail. Potvrďte ho a potom sa prihláste.");
          return;
        }
        toast.success("Účet je vytvorený.");
        navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Prihlásenie úspešné.");
        navigate({ to: "/", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Prihlásenie sa nepodarilo.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Prihlásenie cez Google sa nepodarilo.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background">
      <header className="brand-header px-5 pb-14 pt-10 text-brand-foreground">
        <p className="text-[13px] font-semibold tracking-wide opacity-90">George · Slovenská sporiteľňa</p>
        <h1 className="mt-3 text-[34px] font-bold leading-none">
          {mode === "in" ? "Prihlásenie" : "Nový účet"}
        </h1>
        <p className="mt-2 text-sm opacity-80">
          Vaše platby, sporenie a rozpočet zostanú uložené aj po zatvorení aplikácie.
        </p>
      </header>

      <div className="-mt-10 px-5">
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-lg">
          {sent ? (
            <p className="text-sm text-muted-foreground">
              Skontrolujte si e-mail <strong className="text-foreground">{email}</strong> a potvrďte registráciu.
              Potom sa môžete prihlásiť.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {mode === "up" ? (
                <label className="block text-sm">
                  <span className="text-muted-foreground">Meno majiteľa účtu</span>
                  <input
                    required
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Jakub Varga"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary"
                  />
                </label>
              ) : null}
              <label className="block text-sm">
                <span className="text-muted-foreground">E-mail</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Heslo</span>
                <input
                  required
                  type="password"
                  minLength={6}
                  autoComplete={mode === "in" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60"
              >
                {mode === "in" ? "Prihlásiť sa" : "Vytvoriť účet"}
              </button>
            </form>
          )}

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            alebo
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 font-semibold text-foreground disabled:opacity-60"
          >
            Pokračovať s Google
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setSent(false);
            }}
            className="mt-4 w-full text-center text-sm text-muted-foreground underline"
          >
            {mode === "in" ? "Nemáte účet? Zaregistrujte sa" : "Už máte účet? Prihláste sa"}
          </button>
        </div>
      </div>
    </div>
  );
}
