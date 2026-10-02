import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CATEGORIES } from "@/lib/bank-store";

export const categorizeTxn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        description: z.string().max(500),
        counterparty: z.string().max(200),
        amount: z.number(),
        type: z.enum(["in", "out"]),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ category: string | null; error: string | null }> => {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { category: null, error: "AI nie je nakonfigurované." };
    let runId: string | undefined;
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers);
        if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
        const res = await fetch(input, { ...init, headers });
        runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
        return res;
      },
    });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        system: `Si asistent banky. Zaraď transakciu do presne jednej kategórie zo zoznamu: ${CATEGORIES.join(", ")}. Odpovedz iba názvom kategórie, bez ďalšieho textu.`,
        prompt: `Typ: ${data.type === "in" ? "príjem" : "výdavok"}\nProtistrana: ${data.counterparty}\nSuma: ${data.amount} EUR\nPopis: ${data.description || "(bez popisu)"}`,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const text = (await result.text).trim().toLowerCase();
      const match = CATEGORIES.find((c) => text.includes(c.toLowerCase()));
      return match ? { category: match, error: null } : { category: null, error: "AI nenašla vhodnú kategóriu." };
    } catch (e: unknown) {
      const status = (e as { statusCode?: number })?.statusCode;
      console.error("categorize failed", status, e);
      if (status === 402) return { category: null, error: "Minuli sa AI kredity. Kategóriu zvoľte ručne." };
      if (status === 429) return { category: null, error: "Príliš veľa požiadaviek, skúste o chvíľu." };
      if (status === 403) return { category: null, error: "Prístup k AI je zablokovaný." };
      return { category: null, error: "Kategóriu sa nepodarilo navrhnúť." };
    }
  });
