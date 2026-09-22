import { useCallback, useEffect, useState } from "react";
import { Fingerprint, ScanFace } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isBiometricEnabled, isUnlocked, verifyBiometric } from "@/lib/biometric";

export function BiometricLock({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;
        const id = data.user?.id ?? null;
        setUserId(id);
        setLocked(!!id && isBiometricEnabled(id) && !isUnlocked(id));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const unlock = useCallback(async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await verifyBiometric(userId);
      if (ok) setLocked(false);
      else setError("Overenie sa nepodarilo. Skúste to znova.");
    } catch {
      setError("Overenie bolo zrušené alebo sa nepodarilo.");
    } finally {
      setBusy(false);
    }
  }, [userId]);

  useEffect(() => {
    if (checked && locked && !busy && !error) void unlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, locked]);

  if (!checked) return null;

  if (locked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Fingerprint className="size-12" strokeWidth={1.6} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Aplikácia je zamknutá</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Odomknite ju odtlačkom prsta, tvárou alebo zámkou obrazovky.
          </p>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </div>
        <button
          onClick={unlock}
          disabled={busy}
          className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60"
        >
          <ScanFace className="size-5" /> {busy ? "Overujem…" : "Odomknúť"}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
