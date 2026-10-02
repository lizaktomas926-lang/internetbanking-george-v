import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { categorizeTxn } from "@/lib/categorize.functions";

export function AiCategoryButton({
  description,
  counterparty,
  amount,
  type = "out",
  onCategory,
  label = "Navrhnúť kategóriu (AI)",
}: {
  description: string;
  counterparty: string;
  amount: number;
  type?: "in" | "out";
  onCategory: (c: string) => void | Promise<void>;
  label?: string;
}) {
  const run = useServerFn(categorizeTxn);
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy || (!description.trim() && !counterparty.trim())}
      onClick={async () => {
        setBusy(true);
        try {
          const r = await run({ data: { description, counterparty, amount, type } });
          if (r.category) {
            await onCategory(r.category);
            toast.success(`Kategória: ${r.category}`);
          } else toast.error(r.error ?? "Kategóriu sa nepodarilo navrhnúť.");
        } catch (e) {
          console.error(e);
          toast.error("Kategóriu sa nepodarilo navrhnúť.");
        } finally {
          setBusy(false);
        }
      }}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface py-2.5 text-[13px] font-semibold text-primary disabled:opacity-50"
    >
      <Sparkles className="size-4" /> {busy ? "Analyzujem…" : label}
    </button>
  );
}
