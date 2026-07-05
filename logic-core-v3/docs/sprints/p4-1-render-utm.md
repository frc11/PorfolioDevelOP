# P4.1 — Render de atribución por campaña (UTM) en el panel

> Fuente de verdad detallada del sprint. Cierre resumido en `docs/bitacora-roadmap.md`.
> Consume lo que dejó vivo **UTM.1** (captura first-touch). Solo render — cero runtime,
> cero captura, cero migración.

## Contexto

UTM.1 dejó `ChatbotLead.utmSource/utmMedium/utmCampaign` capturadas y persistidas
first-touch (widget → conversación → lead), pero `utmCampaign` quedó como **dato dormido**:
ningún read-path lo mostraba al dueño. El panel ya mostraba el **origen** del lead
(Google/Instagram/Directo/Otros) vía `src/lib/dashboard/lead-origin.ts` — la fuente ÚNICA
de atribución, reusada por el detalle del lead y por la agregación del home
(`tallyOrigins` → `LeadOrigins`).

Este sprint agrega la dimensión de **campaña**: la muestra en el detalle del lead y agrega
un desglose por campaña en el home.

## Principio rector: EXTENDER, no duplicar

La dimensión de campaña se agregó a `lead-origin.ts` (junto a `categorizeOrigin`), no en un
módulo paralelo → una sola fuente de verdad de atribución. La agregación del home reusa el
mismo servicio org-scoped (`getHomeBusinessMetrics` / `businessWhere`): se le sumó
`utmCampaign` al `select` que ya corría y un `tallyCampaigns` hermano de `tallyOrigins`.

## Decisiones cerradas (con Valentino, antes de escribir)

1. **Label de "sin campaña" = "Sin campaña"** (no "Directo/Otros"). No se confunde con el
   "Directo" del bloque de origen (que es otra dimensión: un lead de Google orgánico tiene
   origen Google pero no tiene campaña). El `utm_campaign` crudo nunca se muestra.
2. **Home sin campañas → estado vacío honesto** ("Todavía sin campañas"), como Origen y
   Embudo. La tarjeta está siempre presente; muestra el empty state cuando en el período no
   hay NINGUNA campaña etiquetada (el caso real hoy, porque casi todos los leads son null).

## Qué se construyó

### A. Mapa compartido — `src/lib/dashboard/lead-origin.ts`
`campaignLabel(utmCampaign: string | null): string | null` — función pura. Humaniza el slug
crudo a lenguaje de dueño (`promo_diciembre` → "Promo Diciembre", `launch_q3` → "Launch Q3");
split en separadores UTM comunes (`[\s._+-]+`), title-case por token, cap defensivo de 48
chars con elipsis. `null`/vacío/solo-separadores → `null` (la vista lo trata como "Sin
campaña", nunca inventa).

### B. Agregación del home — `src/lib/dashboard/home-metrics-logic.ts`
- `CampaignBucket { label; count }` y `CampaignBreakdown { campaigns; noCampaign; total }`.
- `tallyCampaigns(rawCampaigns, topN = 5)` — hermano de `tallyOrigins`. Agrupa por label
  humanizado (así `promo_dic` y `Promo-Dic` caen en el mismo bucket); los `null` van a
  `noCampaign` (apartados de las campañas reales, no mezclados); cola de campañas reales
  más allá de topN se pliega en "Otras campañas". **Garantía de suma preservada**:
  `sum(campaigns) + noCampaign == items.length` (reconcilia con "Leads esta semana" del hero).
- Re-exporta `campaignLabel` (mismo patrón que `categorizeOrigin`).

### C. Capa de datos — `src/lib/dashboard/home-metrics.ts`
- `utmCampaign: true` sumado al `select` de `periodLeads` (única línea de query nueva; misma
  query org-scoped, mismo `businessWhere` con `botConfig: { organizationId }`).
- `campaigns: CampaignBreakdown` en `HomeBusinessMetrics`.
- `const campaigns = tallyCampaigns(periodLeads.map((l) => l.utmCampaign))`.

### D. Render del home
- `src/components/dashboard/home/LeadCampaigns.tsx` (nuevo, server component, espejo de
  `LeadOrigins`): tarjeta "Campañas". `buckets.length === 0` → `SectionEmptyState
  variant="campaign"` ("Todavía sin campañas"). Con campañas: barras cian por campaña real +
  renglón muted "Sin campaña" (cuando `noCampaign > 0`); `%` sobre `total`.
- `src/components/dashboard/home/SectionEmptyState.tsx`: `variant='campaign'` → ícono
  `Megaphone`.
- `src/app/(protected)/dashboard/page.tsx`: `<LeadCampaigns>` a lo ancho, debajo de la grilla
  Origen | Embudo.

### E. Render del detalle
- `src/app/(protected)/dashboard/chatbot/leads/[id]/page.tsx`: `campaignLabel(lead.utmCampaign)`
  (sin cambio de query — `lead.utmCampaign` ya viene por `include`); prop nueva a `LeadDetail`.
- `src/modules/chatbot/components/dashboard/LeadDetail.tsx`: prop `campaignLabel: string | null`
  + celda "Campaña" (ícono `Megaphone`, strokeWidth 1.5) en la grilla "Cómo llegó", al lado de
  "Origen". `null` → "Sin campaña" (honesto, sin vacío feo).

### F. Tests — `src/lib/dashboard/home-metrics-logic.invariant.ts`
- §10 `campaignLabel`: snake/kebab/punto → título legible; mayúsculas gritadas normalizadas;
  `null`/`''`/espacios/`'___'` → `null`; cap de largo con elipsis.
- §11 `tallyCampaigns`: agrupa variantes del mismo slug; `null` → `noCampaign` (no bucket);
  **suma preservada**; all-null → `campaigns:[]` (dispara empty state); `[]` → todo en cero;
  fold de cola en "Otras campañas" sin perder la suma.

Org-scoping: heredado del `businessWhere` existente (mismo filtro que Origen, no se tocó);
`tallyCampaigns` es puro.

## Manejo del null (la mayoría de los leads hoy)
- Detalle: lead sin campaña → celda "Campaña: **Sin campaña**".
- Home: si NO hay ninguna campaña real en el período → empty state "Todavía sin campañas".
  Si hay ≥1 campaña real → las campañas + un renglón "Sin campaña" con el resto.
- Nunca un dash vacío, nunca `utm_campaign=...` crudo, nunca una campaña inventada.

## Verificación

- **Tests:** `npm run check:invariant:home-metrics` → **✓ verde** (incl. §10 y §11 nuevas).
- **Tipos:** `.\node_modules\.bin\tsc.cmd --noEmit` → sin errores nuevos (único: baseline
  preexistente `searchconsole.ts:119`). Cero `any`.
- **Lint:** `eslint` sobre los 9 archivos tocados/creados → **limpio** (sin output).
- **visual-qa (desktop + mobile):** ❓ **no ejecutado en esta sesión** — el subagente reportó
  que las herramientas de preview (`preview_start`/`preview_screenshot`/`preview_eval`) no
  estaban disponibles en su entorno (solo tuvo Read/Glob/Grep). No es una regresión ni un bug
  de código. Fallback sancionado (CLAUDE.md + plan aprobado): **verificación visual declarada
  para el humano en `:3000`** (ver "Pendiente del humano"). Además, el seed de QA no puebla
  `utmCampaign`, así que el caso **con** campaña requiere dato real de todos modos.

## Ejemplos (lenguaje de dueño)
- Lead **con** campaña `utm_campaign=promo_diciembre` → Detalle: "Campaña: **Promo Diciembre**".
  Home: renglón "Promo Diciembre: N leads · X%".
- Lead **sin** campaña → Detalle: "Campaña: **Sin campaña**". Home: agrupado en el renglón
  "Sin campaña" (o empty state si es el único caso del período).

## Fuera de scope (anotado, no implementado)
- `utmMedium` (cpc/organic) — jerga; el sprint es solo campaña.
- Filtrar la lista de leads por campaña, tendencias multi-período, export por campaña.
- Backfill de campañas en leads viejos (pre-UTM.1) — se ven honestamente como "Sin campaña".

## Pendiente del humano (Valentino)
- Verificación visual en `:3000`: detalle de un lead **con** y **sin** campaña + el desglose
  del home; confirmar lenguaje de dueño (nada de `utm_*` crudo) y que los null se ven
  honestos, no vacíos.
- ⚠ El seed de QA (`scripts/dev/qa-seed-leads.ts:186`) puebla solo `utmSource`, **no**
  `utmCampaign` → los leads seedeados muestran "Sin campaña" y el home muestra el empty state.
  Para ver el caso **con** campaña hace falta un lead con `utmCampaign` (flujo real del widget
  con `?utm_campaign=...`, o una fila de seed puntual).
- Commitear cuando revises (lo hacés vos).
