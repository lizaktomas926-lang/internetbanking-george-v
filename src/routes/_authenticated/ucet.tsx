import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, FilePenLine, RefreshCw, Landmark, FileText, Zap, ClipboardCheck, QrCode, Smartphone,
  PiggyBank, X, Palette, CreditCard, Share2, Copy, type LucideIcon,
} from "lucide-react";
import { balance, formatDate, formatEur, groupByMonth, useBank } from "@/lib/bank-store";
import { Amount } from "@/components/bank/Amount";
import { exportStatement } from "@/lib/pdf-export";

export const Route = createFileRoute("/_authenticated/ucet")({
  head: () => ({
    meta: [
      { title: "Účet a transakcie | George" },
      { name: "description", content: "Zostatok účtu a história transakcií v George." },
      { property: "og:title", content: "Účet a transakcie | George" },
      { property: "og:description", content: "Zostatok účtu a história transakcií v George." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UcetPage,
});

const tabs = ["Transakcie", "Funkcie", "Karty", "Info"] as const;
type Tab = (typeof tabs)[number];

function H({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 mt-6 font-bold">{children}</h2>;
}
function Group({ children }: { children: ReactNode }) {
  return <div className="space-y-[3px] overflow-hidden rounded-3xl">{children}</div>;
}
function Item({ icon: Icon, label, sub, to, badge, onClick }: {
  icon: LucideIcon; label: string; sub?: string; to?: "/platby" | "/prijat" | "/nova-platba" | "/sporenie" | "/nastavenia" | "/karty"; badge?: string; onClick?: () => void;
}) {
  const body = (
    <>
      <Icon className="size-6 shrink-0 text-primary" />
      <div className="flex-1">
        <p className="text-[17px]">{label}</p>
        {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
      </div>
      {badge ? <span className="rounded-full bg-muted px-3 py-1 text-sm text-foreground">{badge}</span> : null}
    </>
  );
  const cls = "flex w-full items-center gap-5 bg-surface px-5 py-5 text-left";
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  return (
    <button type="button" className={cls} onClick={onClick ?? (() => toast("Táto funkcia bude čoskoro dostupná"))}>
      {body}
    </button>
  );
}
function Field({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-surface px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="truncate text-[17px]">{value}</p>
      </div>
      {copy ? (
        <button
          type="button"
          aria-label={`Kopírovať ${label}`}
          className="text-primary"
          onClick={() => navigator.clipboard?.writeText(value).then(() => toast.success("Skopírované"))}
        >
          <Copy className="size-6" />
        </button>
      ) : null}
    </div>
  );
}
async function share(owner: string, iban: string) {
  const text = `${owner}\nIBAN: ${iban}\nBIC: GIBASKBX`;
  try {
    if (navigator.share) await navigator.share({ title: "Informácie o účte", text });
    else { await navigator.clipboard.writeText(text); toast.success("Informácie skopírované"); }
  } catch { /* zrušené */ }
}

function TransactionsTab({ groups }: { groups: ReturnType<typeof groupByMonth> }) {
  return (
    <>
      <div className="mt-4 flex items-center gap-4 rounded-3xl bg-surface p-4">
        <FilePenLine className="size-6 text-destructive" />
        <div>
          <p className="font-semibold">Platobné príkazy a rezervácie</p>
          <p className="text-sm text-muted-foreground">0 nezrealizovaných platieb & 0 rezervácií</p>
        </div>
      </div>
      {groups.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">Zatiaľ žiadne transakcie.</p>
      ) : (
        groups.map(([month, txns]) => (
          <section key={month} className="mt-6">
            <h2 className="mb-2 font-bold">{month}</h2>
            <div className="space-y-2">
              {txns.map((t) => (
                <Link key={t.id} to="/transakcia/$id" params={{ id: t.id }} className="flex items-start gap-3 rounded-3xl bg-surface p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {t.counterparty.trim().charAt(0).toUpperCase() || "S"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="truncate font-semibold">{t.counterparty}</p>
                      <p className={`shrink-0 font-semibold ${t.type === "in" ? "text-emerald-500" : ""}`}>
                        {t.type === "in" ? "+" : "-"}{formatEur(t.amount)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(t.date)}</p>
                    {t.vs ? <p className="text-sm text-muted-foreground">VS: {t.vs}</p> : null}
                    <span className="mt-1 inline-block rounded-full border border-muted-foreground/60 px-2 text-xs text-muted-foreground">{t.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

function UcetPage() {
  const s = useBank();
  const total = balance(s);
  const groups = groupByMonth(s.transactions);
  const [tab, setTab] = useState<Tab>("Transakcie");
  const last4 = (s.iban.replace(/\s/g, "").slice(-4)) || "0000";

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background pb-28 text-foreground">
      <div className="h-44 bg-gradient-to-b from-[#8a0a3c] to-[#6e0832] px-4 pt-5">
        <Link to="/" aria-label="Späť" className="inline-flex p-2 -ml-2 text-white">
          <ArrowLeft className="size-6" />
        </Link>
      </div>

      <div className="-mt-24 px-4">
        <div className="flex items-start justify-between rounded-3xl bg-surface p-5 shadow-lg">
          <div>
            <h1 className="text-lg font-bold">Účet</h1>
            <div className="mt-1 text-3xl font-bold"><Amount value={total} /></div>
            <p className="mt-1 text-sm text-muted-foreground">{formatEur(total)} vlastné zdroje</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=100&auto=format&fit=crop&q=80"
            alt=""
            className="size-12 rounded-full object-cover"
          />
        </div>

        <nav className="mt-4 flex items-center justify-between gap-1" data-no-swipe>
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-[15px] font-semibold text-primary ${tab === t ? "bg-surface" : ""}`}
            >
              {t}
            </button>
          ))}
        </nav>

        {tab === "Transakcie" && <TransactionsTab groups={groups} />}

        {tab === "Funkcie" && (
          <div className="mt-4">
            <Group>
              <Item icon={RefreshCw} label="Trvalé príkazy" to="/platby" />
              <Item icon={Landmark} label="Výber z bankomatu mobilom" />
              <Item icon={FileText} label="Výpisy z účtu" onClick={() => exportStatement(s, s.transactions)} />
              <Item icon={Zap} label="Limit pre okamžité platby (SEPA)" sub="10 000 € na deň" />
              <Item icon={ClipboardCheck} label="Súhlasy s inkasom" />
              <Item icon={QrCode} label="Vytvoriť payme link / QR kód" to="/prijat" />
              <Item icon={Smartphone} label="Dobiť kredit" to="/nova-platba" />
            </Group>
            <H>Automatické sporenie</H>
            <Group>
              <Item icon={PiggyBank} label="Drobné bokom" to="/sporenie" badge="Nové" />
            </Group>
            <H>Zrušenia</H>
            <Group>
              <Item icon={X} label="Zrušiť účet" />
            </Group>
            <div className="mt-4">
              <Group>
                <Item icon={Palette} label="Prispôsobiť" to="/nastavenia" />
              </Group>
            </div>
          </div>
        )}

        {tab === "Karty" && (
          <div className="mt-4">
            <Link to="/karty" className="flex items-center gap-4 rounded-3xl bg-surface p-4">
              <div className="flex h-16 w-28 shrink-0 flex-col justify-between rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 p-2 text-[9px] font-bold text-white">
                <span>SLOVENSKÁ sporiteľňa</span>
                <span className="self-end text-xs italic">VISA</span>
              </div>
              <div>
                <p className="text-lg font-semibold">VISA virtuálna karta</p>
                <p className="text-muted-foreground">•••• {last4}</p>
              </div>
            </Link>
            <H>Ďalšie karty</H>
            <Group>
              <Item icon={CreditCard} label="Vytvoriť novú debetnú kartu" sub="Vyberte si z aktuálnej ponuky." to="/karty" />
              <Item icon={CreditCard} label="Vytvoriť virtuálnu kartu" to="/karty" />
            </Group>
          </div>
        )}

        {tab === "Info" && (
          <div className="mt-4">
            <Group>
              <Field label="Typ účtu" value="SPACE účet" />
              <Field label="Názov účtu" value={s.owner || "—"} />
              <Field label="IBAN" value={s.iban} copy />
              <Field label="BIC/SWIFT" value="GIBASKBX" copy />
              <Field label="Štandardný mesačný poplatok" value="7,00 €" />
            </Group>
            <div className="mt-4">
              <Group>
                <Item icon={Share2} label="Zdieľať informácie o účte" onClick={() => share(s.owner, s.iban)} />
              </Group>
            </div>
            <H>Zostatok</H>
            <Group>
              <Field label="Aktuálny zostatok" value={formatEur(total)} />
              <Field label="Disponibilný zostatok" value={formatEur(total)} />
            </Group>
          </div>
        )}
      </div>
    </div>
  );
}
