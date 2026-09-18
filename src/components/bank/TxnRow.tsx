import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatDate, formatEur, type Txn } from "@/lib/bank-store";

export function TxnRow({ txn }: { txn: Txn }) {
  const income = txn.type === "in";
  return (
    <Link
      to="/transakcia/$id"
      params={{ id: txn.id }}
      className="flex items-center gap-3 rounded-2xl bg-surface p-3 transition-colors active:bg-surface-2"
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-full ${
          income ? "bg-income/15 text-income" : "bg-surface-2 text-muted-foreground"
        }`}
      >
        {income ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{txn.counterparty}</p>
        <p className="text-[12px] text-muted-foreground">{formatDate(txn.date)}</p>
        <span className="mt-1 inline-block rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
          {txn.category}
        </span>
      </div>
      <p className={`shrink-0 text-[15px] font-bold ${income ? "text-income" : "text-foreground"}`}>
        {income ? "+" : "−"}
        {formatEur(txn.amount).replace("-", "")}
      </p>
    </Link>
  );
}
