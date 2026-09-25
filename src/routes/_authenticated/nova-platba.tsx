import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, FileDown, Fingerprint } from "lucide-react";
import { enableBiometric, isBiometricEnabled, isBiometricSupported, verifyBiometric } from "@/lib/biometric";
import { AppShell, BrandHeader } from "@/components/bank/AppShell";
import {
  addTransaction,
  balance,
  CATEGORIES,
  formatDate,
  formatEur,
  useBank,
  type Txn,
} from "@/lib/bank-store";
import { exportReceipt } from "@/lib/pdf-export";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/nova-platba")({
  head: () => ({
    meta: [
      { title: "Nová platba | George" },
      {
        name: "description",
        content:
          "Zadajte prevod na IBAN príjemcu, sumu a správu pre príjemcu.",
      },
      { property: "og:title", content: "Nová platba | George" },
      {
        property: "og:description",
        content:
          "Zadajte prevod na IBAN príjemcu, sumu a správu pre príjemcu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NovaPlatba,
});

const field =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary";

function NovaPlatba() {
  const s = useBank();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [iban, setIban] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Prevod");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<Txn | null>(null);
  const [savingPdf, setSavingPdf] = useState(false);
  const { user } = Route.useRouteContext();
  const [bioOn, setBioOn] = useState(false);
  useEffect(() => setBioOn(isBiometricEnabled(user.id)), [user.id]);

  const value = Number(amount.replace(",", "."));

  if (sent) {
    return <PaymentReceipt txn={sent} s={s} savingPdf={savingPdf} setSavingPdf={setSavingPdf} onDone={() => navigate({ to: "/platby" })} />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");

    if (!name.trim()) {
      return setError("Zadajte meno príjemcu.");
    }

    if (!iban.trim()) {
      return setError("Zadajte IBAN príjemcu.");
    }

    if (!Number.isFinite(value) || value <= 0) {
      return setError("Zadajte platnú sumu.");
    }

    setBusy(true);
    try {
      if (!(await isBiometricSupported())) {
        throw new Error("Toto zariadenie alebo okno nepodporuje odtlačok ani tvár. Otvorte aplikáciu priamo v Safari alebo z plochy.");
      }
      if (!isBiometricEnabled(user.id)) {
        await enableBiometric(user.id, user.email ?? "George");
        setBioOn(true);
      } else {
        const ok = await verifyBiometric(user.id);
        if (!ok) throw new Error("Overenie odtlačkom alebo tvárou zlyhalo. Skúste znova.");
      }
    } catch (err) {
      setBusy(false);
      toast.error("Platba nebola potvrdená biometriou");
      const msg = err instanceof Error && err.name !== "NotAllowedError" ? err.message : "";
      return setError(msg || "Overenie bolo zrušené alebo zlyhalo. Skúste znova.");
    }
    setBusy(false);

    const txn = await addTransaction({
      type: "out",
      counterparty: name.trim(),
      iban: iban.trim().toUpperCase(),
      amount: Math.round(value * 100) / 100,
      date: new Date().toISOString(),
      category,
      ...(note.trim() ? { note: note.trim() } : {}),
    });

    toast.success("Platba bola úspešne odoslaná");

    if (txn) {
      setSent(txn);
    } else {
      navigate({ to: "/platby" });
    }
  }

  return (
    <AppShell>
      <BrandHeader
        title="Nová platba"
        subtitle={`Z účtu · ${formatEur(balance(s))}`}
        back
      />

      <form onSubmit={submit} className="-mt-12 space-y-3 px-4">
        <div className="space-y-3 rounded-3xl bg-surface p-4">
          <label className="block">
            <span className="text-[12px] text-muted-foreground">
              Príjemca
            </span>

            <input
              className={`${field} mt-1`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meno a priezvisko"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-muted-foreground">
              IBAN / číslo účtu
            </span>

            <input
              className={`${field} mt-1 font-mono tracking-wide`}
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="SK00 0000 0000 0000 0000 0000"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-muted-foreground">
              Suma (€)
            </span>

            <input
              className={`${field} mt-1 text-[22px] font-bold`}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-muted-foreground">
              Kategória
            </span>

            <select
              className={`${field} mt-1`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[12px] text-muted-foreground">
              Správa pre príjemcu
            </span>

            <input
              className={`${field} mt-1`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nepovinné"
            />
          </label>
        </div>

        {error ? (
          <p className="px-1 text-[13px] text-expense">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          {bioOn ? <Fingerprint className="h-5 w-5" /> : null}
          {busy ? "Overujem…" : bioOn ? "Potvrdiť biometriou a odoslať" : "Odoslať platbu"}
        </button>
        {!bioOn ? (
          <p className="px-1 text-center text-[12px] text-muted-foreground">
            Potvrdzovanie platieb odtlačkom alebo tvárou zapnete v Nastaveniach.
          </p>
        ) : null}
      </form>
    </AppShell>
  );
}

function PaymentReceipt({
  txn,
  s,
  savingPdf,
  setSavingPdf,
  onDone,
}: {
  txn: Txn;
  s: ReturnType<typeof useBank>;
  savingPdf: boolean;
  setSavingPdf: (v: boolean) => void;
  onDone: () => void;
}) {
  return (
    <AppShell>
      <header className="brand-header px-5 pb-16 pt-6 text-brand-foreground">
        <h1 className="text-[26px] font-bold leading-tight">Platba odoslaná</h1>
      </header>

      <div className="-mt-12 space-y-3 px-4">
        <section className="rounded-3xl bg-surface p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-income/15">
            <Check className="size-7 text-income" />
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">Odoslaná suma</p>
          <p className="text-[32px] font-bold leading-tight">
            −{formatEur(txn.amount).replace("-", "")}
          </p>
          <span className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground">
            Stav: Odoslaná
          </span>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Čaká na zaúčtovanie – zvyčajne do 1 pracovného dňa.
          </p>
        </section>

        <section className="rounded-2xl bg-surface">
          <Row label="Príjemca" value={txn.counterparty} />
          {txn.iban ? <Row label="IBAN príjemcu" value={txn.iban} /> : null}
          <Row label="Kategória" value={txn.category} />
          <Row label="Dátum odoslania" value={formatDate(txn.date)} />
          {txn.note ? <Row label="Správa pre príjemcu" value={txn.note} /> : null}
          <Row label="Nový zostatok na účte" value={formatEur(balance(s))} />
        </section>

        <button
          onClick={async () => {
            setSavingPdf(true);
            try {
              await exportReceipt(s, txn);
              toast.success("Potvrdenie o platbe bolo stiahnuté");
            } catch (e) {
              console.error(e);
              toast.error("Potvrdenie sa nepodarilo vytvoriť. Skúste to prosím znova.");
            } finally {
              setSavingPdf(false);
            }
          }}
          disabled={savingPdf}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-[14px] font-semibold text-primary-foreground disabled:opacity-60"
        >
          <FileDown className="size-4" /> {savingPdf ? "Pripravujem…" : "Stiahnuť potvrdenie (PDF)"}
        </button>

        <button
          onClick={onDone}
          className="flex w-full items-center justify-center rounded-full border border-border py-3 text-[14px] font-semibold"
        >
          Hotovo
        </button>

        <p className="pb-2 text-center text-[13px]">
          <Link to="/transakcia/$id" params={{ id: txn.id }} className="font-semibold text-primary">
            Zobraziť detail platby
          </Link>
        </p>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border px-4 py-3 last:border-0">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[15px]">{value}</p>
    </div>
  );
}
