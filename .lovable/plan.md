# AI kategorizácia platieb podľa popisu

## Čo pribudne
- **Nová platba**: nové pole „Popis platby" (napr. „nákup v Lidli", „benzín na cestu"). Pri písaní (po krátkej pauze) alebo tlačidlom „Navrhnúť kategóriu" AI navrhne kategóriu z rozpočtových kategórií (Potraviny, Bývanie, Doprava, Zábava, Zdravie, Poplatky, Sporenie, Prevod...). Návrh sa vyplní do výberu kategórie s označením „Navrhnuté AI" — používateľ ho môže zmeniť.
- **Detail transakcie**: zobrazí popis a tlačidlo „Prekategorizovať pomocou AI" pre staršie platby; zmena kategórie sa uloží a premietne do rozpočtu.
- **Platby (história)**: hromadná akcia „Zatriediť nezaradené" — AI prejde platby v kategórii „Prevod"/bez popisu a navrhne kategórie naraz (jedna požiadavka pre celú dávku).
- Jasné hlásenia (toast): pri vyčerpanom kredite, preťažení alebo chybe sa kategória nezmení a zobrazí sa zrozumiteľná správa.

## Technické detaily
- Popis sa ukladá do existujúceho stĺpca `note` v tabuľke transakcií (bez migrácie); nová funkcia `updateTransactionCategory(id, category)` v bank-store.
- Server funkcia `src/lib/categorize.functions.ts` s `requireSupabaseAuth`, vstup validovaný Zod (popis, protistrana, suma, typ; dávka max ~50 položiek). Volá Lovable AI Gateway cez `@ai-sdk/openai` `.responses("openai/gpt-6-astra")`, `streamText` + `Output.object` (malá schéma, kategória ako string, v kóde sa overí proti `CATEGORIES`, inak „Prevod"), `store: false`, reasoning `low`. Pomocné súbory gateway/run-id ako server-only moduly.
- Chyby 402/403/429 sa vracajú s bezpečnou správou do UI; bez automatických opakovaní.
- Overenie: skutočné volanie s testovacím účtom (jednotlivo aj dávka), kontrola zmeny rozpočtu.
