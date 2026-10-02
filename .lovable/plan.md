# AI kategorizácia platieb pre rozpočet

## Čo používateľ uvidí
- Na obrazovke **Nová platba** je pole **Popis platby** (napr. „nákup v Lidli, ovocie“).
- Vedľa výberu kategórie je tlačidlo **Navrhnúť kategóriu (AI)**. Na základe popisu, príjemcu a sumy sa automaticky vyberie kategória (Potraviny, Bývanie, Doprava…). Používateľ ju môže pred odoslaním zmeniť.
- V **detaile transakcie** je tlačidlo **Prekategorizovať pomocou AI** pre staršie platby. Popis sa dá doplniť a kategória sa uloží.
- Rozpočet sa po zmene kategórie hneď prepočíta.
- Pri chybe (napr. minuté kredity alebo príliš veľa požiadaviek) sa zobrazí jasné hlásenie a platbu je stále možné odoslať s ručne zvolenou kategóriou.

## Technické detaily
- Server function `src/lib/categorize.functions.ts` (`createServerFn`, chránená cez `requireSupabaseAuth`, vstup overený cez zod: description, counterparty, amount, type).
- Volanie AI Gateway cez `@ai-sdk/openai` `.responses("openai/gpt-6-astra")` so `streamText` a štruktúrovaným výstupom, ktorý je obmedzený na zoznam `CATEGORIES`. Použije sa povinný blok `providerOptions.openai` (`reasoningEffort: "low"`, `store: false`). Pomocné funkcie zo skillu sa skopírujú do server-only modulov.
- Chyby 402/403/429 sa zachovajú a pošlú do UI ako toast. Opakované pokusy sa nerobia.
- Do stĺpca `transactions.note` sa uloží popis (stĺpec už existuje, migrácia netreba). Nová funkcia `updateTransactionCategory(id, category, note)` v bank-store.
- Do `src/start.ts` sa pridá middleware `attachSupabaseAuth`, ak tam ešte nie je. Ak chýba `LOVABLE_API_KEY`, vytvorí sa.
- Overenie: jedno reálne volanie a kontrola v prehliadači pod prihláseným testovacím účtom.
