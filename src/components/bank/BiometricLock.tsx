import { useCallback, useEffect, useState } from "react";
import { Fingerprint, ScanFace } from "lucide-react";
import { isBiometricEnabled, isUnlocked, verifyBiometric } from "@/lib/biometric";
import { Button } from "@/components/ui/button";

export function BiometricLock({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [locked, setLocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLocked(isBiometricEnabled(userId) && !isUnlocked(userId));
    } catch {
      setLocked(false);
      setError("Biometrický zámok sa nepodarilo načítať.");
    } finally {
      setChecked(true);
    }
  }, [userId]);

  const unlock = useCallback(async () => {
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

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">Načítavam zabezpečenie aplikácie…</p>
      </div>
    );
  }

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
        <Button
          onClick={unlock}
          disabled={busy}
          className="h-12 w-full max-w-xs rounded-xl font-semibold"
        >
          <ScanFace className="size-5" /> {busy ? "Overujem…" : "Odomknúť"}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
