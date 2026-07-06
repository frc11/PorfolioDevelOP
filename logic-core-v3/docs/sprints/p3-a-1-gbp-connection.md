# P3-A.1 — Eslabón backend de la conexión Google Business Profile

> Fuente de verdad del sprint (plan + guardas + log de ejecución). Backend + servicios
> server únicamente. La UI (botón, wizard, selector visual) es **P3-A.2**.

## Objetivo

Cerrar el eslabón backend de la conexión GBP: con los tokens ya persistidos por el callback,
**descubrir account+location** de Google (Account Management + Business Information API),
**persistirlos** en la org con **estados de conexión honestos**, exponer **dos servicios
server** para P3-A.2, y hacer el **llenado one-shot best-effort** de rating/count al conectar.
Sin UI, sin migración.

## Guardas de ejecución (aprobación del plan — Valentino)

1. **Puente v1→v4 (crítico).** Confirmado con línea exacta que el cliente v4 interpola
   `gbpLocationId` como path **COMPLETO** — ver [Puente v1→v4](#puente-v1v4-la-línea-que-lo-prueba).
   No hubo formato sorpresa → se persiste el compuesto.
2. **Multi-location admin (no se cambió).** Si un SUPER_ADMIN conecta una org con >1 sucursal,
   queda `CONNECTED_NO_LOCATION('multiple')` y la elección espera al selector de P3-A.2. **No se
   agregó** ninguna variante admin del selector; solo se dejó el estado legible (`deriveConnectionStatus`
   + `?gbp=` en el redirect) para que P3-A.2 lo levante.
3. **Build NO es gate.** El proyecto buildea rojo por baseline ajeno y OOMea → no se usó `npm run
   build`. Gate real corrido: invariante verde + `tsc --noEmit` sin errores nuevos + lint limpio en
   tocados + `prisma migrate status` en "up to date".
4. **Sin placeholders.** `revalidatePath('/dashboard/modules/motor-resenas')` (ruta real, verificada
   por glob). `actionType: 'OTHER'` confirmado en el enum Prisma `AuditActionType` (`schema.prisma:216`).

## Decisión de librería: `fetch` crudo (sin dependencia nueva)

La premisa del sprint (SDK `googleapis`/`mybusiness*` instalado) era **falsa** — no está en el
árbol. Instalado: `google-auth-library@10.9.0`, `@googleapis/webmasters`, `@google-analytics/data`.
El cliente GBP entero ya habla con Google por `OAuth2Client` + `fetch` crudo. Por regla CLAUDE.md
("no agregar dependencia con alternativa instalada") se **extendió el patrón fetch crudo** a las
REST v1, reusando el Bearer del cliente existente:
- Account Management v1: `GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts`
- Business Information v1: `GET https://mybusinessbusinessinformation.googleapis.com/v1/{account}/locations?readMask=name,title,storefrontAddress` (readMask obligatorio o 400).

## Arquitectura — 3 capas

El invariante corre con `tsx` importando **solo lógica pura** (sin prisma/next/fetch), igual que
`recommendations.invariant.ts` importa `rules.ts`.

| Capa | Archivo | Rol |
|---|---|---|
| **1 · Puro + engine** | `src/lib/integrations/gbp-connection-logic.ts` **(nuevo)** | tipos/uniones, `resolveConnection`, `composeLocationResourceName`, `deriveConnectionStatus`, `findLocationInList`, y `runConnectGbp`/`runListLocations`/`runSetActiveLocation` sobre `deps` inyectadas. Único import del invariante. |
| **2a · I/O** | `src/lib/integrations/gbp-discovery.ts` **(nuevo)** | `listGbpAccounts`/`listGbpLocations`: fetch crudo v1, paginado (`nextPageToken`, tope 20 páginas), parseo tipado con guards. |
| **2b · Wiring** | `src/lib/integrations/gbp-connection.ts` **(nuevo)** | arma `realDeps` (prisma store + discovery + token) y exporta `connectGbpForOrg`/`listLocationsForOrg`/`setActiveLocationForOrg`. Único nuevo con prisma. |
| **2c · Cliente (edit)** | `src/lib/integrations/google-business-profile.ts` | +`getGbpAccessToken` (accessor del Bearer, reusa `getAuthedClient`) y +`fetchGoogleRatingSnapshot` (one-shot, reusa `parseReviewsResponse`). Aditivo. |
| **3 · Servicios thin** | `src/lib/actions/gbp-connection.ts` **(nuevo, `'use server'`)** | `listAvailableLocations()` / `setActiveLocation(id)` — org de la SESIÓN, Zod, `ActionResult`. Espeja `upsell.ts`. |
| **Callback (edit)** | `src/app/api/auth/google-business/callback/route.ts` | tras persistir tokens: `connectGbpForOrg(orgId)` best-effort + `logAdminAction` + redirect `?gbp=<estado>`. |
| **Test (nuevo)** | `src/lib/integrations/gbp-connection.invariant.ts` | cardinalidad/aislamiento/best-effort/reconexión con `tsx`. |
| **Script** | `package.json` | `check:invariant:gbp-connection`. |
| **Schema (edit menor)** | `src/lib/actions/schemas.ts` | `SetActiveLocationSchema` (Zod del locationId). |

## Eslabón cerrado (antes → después)

- **Antes:** `callback/route.ts:38-46` escribía solo 4 tokens; `gbpAccountId`/`gbpLocationId`
  **nunca** se poblaban → todo el cliente v4 cortaba a `null`/`[]`.
- **Después:** `callback/route.ts` — tras el update de tokens, llama `connectGbpForOrg(orgId)`
  (best-effort) que descubre account+location, resuelve cardinalidad y persiste `gbpAccountId` +
  `gbpLocationId` (compuesto), con redirect honesto `/admin/clients?gbp=<estado>`.

## Persistencia por cardinalidad (Paso 2)

`resolveConnection(accounts, locations)` (puro), sobre las locations aplanadas de todas las accounts:
- **1 location** → `OPERATIONAL`; persiste `gbpAccountId` + `gbpLocationId` compuesto.
- **>1** → `CONNECTED_NO_LOCATION('multiple')`; `gbpLocationId: null`; `gbpAccountId` = la account
  si es inequívoca (una sola / todas comparten), si no `null`.
- **0** → `CONNECTED_NO_LOCATION('none')`; `gbpLocationId: null`.
- **Reconectar reemplaza** (siempre escribe ambos campos; downgrade 1→>1 nulea la location).

## Puente v1→v4 (la línea que lo prueba)

El cliente v4 interpola `gbpLocationId` **directo** como segmento de path:
- `google-business-profile.ts:154` → `` `https://mybusiness.googleapis.com/v4/${org.gbpLocationId}/reviews?pageSize=20` ``
- `google-business-profile.ts:297` → `` `https://mybusiness.googleapis.com/v4/${org.gbpLocationId}/reviews?pageSize=50` ``
- (`:241` reply usa `reviewName`, el resource completo de la review, no `gbpLocationId`).

Para que `/v4/${gbpLocationId}/reviews` sea una URL v4 válida, `gbpLocationId` **debe** ser
`accounts/{acc}/locations/{loc}` (las reviews v4 viven en `accounts/*/locations/*/reviews`). La
Business Information **v1** devuelve `name = "locations/{id}"` (sin prefijo). Por eso
`composeLocationResourceName(account, location)` arma el compuesto v4 (idempotente) y **se persiste
ese formato** — el cliente existente sigue funcionando sin tocarse.

## Storage de tokens + flag de deuda SEC

Se respetó el patrón existente: **tokens en CLARO** (idéntico a GBP actual y a Tiendanube; la única
encriptación del repo —`encryptSecret`— es solo para CRM en otro modelo). **No se introdujo
encriptación.**

> **🚩 Deuda SEC (flag):** `gbpAccessToken`/`gbpRefreshToken` quedan en claro en `@db.Text`. La
> encriptación de tokens OAuth (envelope AES-GCM, patrón del CRM) es un **sprint SEC dedicado**, no
> side-quest de este. Afecta también a Tiendanube y Cal.com (mismo patrón claro).

## Rating/count one-shot (Paso 5, best-effort)

`fetchGoogleRatingSnapshot(orgId)` reusa el mismo endpoint v4 de reviews (agregados
`totalReviewCount`/`averageRating` son top-level, `pageSize=1`). Al quedar `OPERATIONAL` escribe
`googleReviewsCount`, `googleRating` (= `null` si count 0 → mantiene honesto el guard de
`health-score.ts:163`) y `googleRatingUpdatedAt`. Todo en `try/catch`: si falla, queda `OPERATIONAL`
y conserva el valor previo. **Solo** orgs conectadas pisan el valor manual. Sin cron.

**Coherencia downstream:** P5.1 (`get-recommendations-for-org.ts`) lee solo `googleReviewsCount` —
un count real ≥10 suprime `reviews-engine` legítimamente (no rompe regla). `health-score.ts` lee
ambos y empieza a scorear reputación al aterrizar valores reales (por eso se escribe también
`googleRating`).

## Servicios server para P3-A.2 (Paso 4)

En `src/lib/actions/gbp-connection.ts` (`'use server'`), **org derivada de la sesión, nunca de un
parámetro** (anti-IDOR; SUPER_ADMIN no tiene `organizationId` → no los puede usar, es self-service
del dueño):
- `listAvailableLocations()` → lista las locations de la cuenta conectada de SU org.
- `setActiveLocation(locationId)` → Zod + valida pertenencia **server-side** (re-descubre con los
  tokens de la propia org) + persiste el compuesto + one-shot. Ninguna location cross-org es alcanzable.

## Tests (Paso 6) — `gbp-connection.invariant.ts`

`npm run check:invariant:gbp-connection` (o `npx tsx …`). Cubre: cardinalidad 1/>1(1-account y
multi-account)/0; **aislamiento** (connect de orgA escribe SOLO orgA; el store espía verifica las
keys del Map); **best-effort** (rating que explota → sigue OPERATIONAL); **reconexión reemplaza**
(+ downgrade a null); puras (`resolveConnection`/`compose`/`derive`/`extractId`); `setActiveLocation`
membership (location ajena → `{ok:false}` sin write); `listLocations` catálogo; determinismo.

## Verificación (gates reales corridos)

- ✅ `npm run check:invariant:gbp-connection` → **verde** (el log `rating boom` es el test best-effort
  ejercitando el catch a propósito; la conexión queda OPERATIONAL y sale el `✓` final).
- ✅ `.\node_modules\.bin\tsc.cmd --noEmit` → **sin errores nuevos**; único error = baseline ajeno
  `searchconsole.ts:119` (ignorado por sprint).
- ✅ `eslint` sobre los 8 archivos tocados → **0 errores / 0 warnings**.
- ✅ `npx prisma migrate status` → **"Database schema is up to date!"** (cero migración pendiente).
- `visual-qa`: **N/A** (backend sin UI).

## Pendiente de verificación viva (declarado)

⚠️ **No hay cuenta GBP de prueba todavía.** Las formas reales del JSON v1, el `readMask` y la
resolución del name v4 se basan en los docs REST de Google, **no** se ejercieron contra un token
real. El invariante prueba el contrato puro (cardinalidad/aislamiento/best-effort/reconexión), pero
la **verificación viva (OAuth vivo + locations reales) queda PENDIENTE**. No afirmar "funciona en
vivo" hasta tener la cuenta. E2E futuro (real-Neon, patrón `executive-report-lead-count.spec.ts`):
conectar org QA → `gbpLocationId` resuelve un reviews v4 real.

## Pendiente del humano (Valentino)

1. **Revisar con el mock** que el flujo cierra punta-a-punta y los estados son honestos.
2. **Commitear** cuando revises (lo hacés vos) — 5 archivos nuevos + 4 edits (ver tabla) + el script.
3. **OAuth vivo** pendiente de cuenta GBP de prueba (verificación viva declarada arriba).
4. Próximo: **P3-A.2** (UI: botón self-service, wizard, selector visual sobre `listAvailableLocations`/
   `setActiveLocation`).
