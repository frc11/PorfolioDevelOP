# Regresión final — el sello del cierre del rediseño de experiencia (Bloques 5–7) · 2026-07-04

> **Qué es este documento.** El veredicto del Sprint 7.3: la verificación final de que NADA del núcleo ni de lo que el brief manda preservar se rompió durante el rediseño de experiencia del setter (el manual paso-por-pantalla que reemplazó al wizard de página larga). No es un sprint de features — es lectura + verificación exhaustiva multi-lente contra la **lista de preservación**, con subagentes por frente (aislamiento, gates, flujo, contenido, invariantes), refutación adversarial de cualquier regresión, y un crítico de completitud.
>
> **Regla del sprint.** Solo se arreglan **regresiones confirmadas** contra la lista de preservación (algo que el brief manda preservar y que se rompió). Todo lo demás (mejora, hallazgo nuevo no-regresivo, deuda pre-existente) se **anota, no se toca**. Si una regresión tocara el motor para arreglarse: **FRENAR y reportar** (decisión humana). Sin push.

---

## Veredicto

**El rediseño cumple el brief. Cierra VERDE. Cero regresiones.**

| Frente | Estado |
|---|---|
| Aislamiento | ✅ ok |
| Gates y línea inviolable | ✅ ok |
| Flujo | ✅ ok |
| Contenido | ✅ ok |
| Invariantes | ✅ ok |

Los cinco frentes verificaron su tramo de la lista de preservación contra evidencia concreta (archivo:línea, salida de invariante, git-diff). **Ninguna regresión** sobrevivió — no hubo ni una reclamada, así que la refutación adversarial no tuvo nada que confirmar. El crítico de completitud levantó 4 gaps de *evidencia-por-proxy* (no regresiones); 2 se cerraron en vivo en este sprint, 1 se cerró con la corrida de browser (`test:setter` 39/39) y 1 es una corrección de documentación (abajo). **Fase 2 no tocó una sola línea de producción** (regla 1).

---

## Método

Workflow multi-agente: 5 verificadores en paralelo (uno por frente), cada uno contra su tramo de la lista de preservación, corriendo sus invariantes puros + leyendo el código/tests/git; seguido de una fase de refutación adversarial de cada regresión reclamada (0), y un crítico de completitud que cruzó la cobertura de los 5 frentes contra la lista completa. 6 agentes, ~875k tokens, 162 tool-calls. El agente padre corrió por su cuenta la corrida pesada (build + suites de browser + integración) y cerró a mano los 2 gaps del crítico que admitían prueba directa.

**La vara.** El brief nombra un archivo `docs/brief-vision-flujo-setter.md` que **no existe** en el repo (ya anotado en el Sprint 7.0). Se usó como vara el contrato vigente (`src/lib/leados/manual.ts`, `paso.ts`, `flow.ts`, los `_data.ts`), el vocabulario 2.x de los Bloques 2–6, y la enumeración explícita de la lista de preservación en la instrucción del sprint.

---

## Fase 0 — Línea base

| Chequeo | Resultado |
|---|---|
| git limpio | ✅ (restaurado el ruido de `tests/leados/.last-run.json`, artefacto del runner) |
| `npx tsc --noEmit` | ✅ 0 errores |
| commits 7.0 / 7.1 / 7.2 en el log | ✅ `036d70b`/`288611a` · `c82ff48`/`f15acba` · `fecda1b` |
| `npx prisma migrate status` | ✅ al día (80 migraciones) |

---

## Fase 1 — Verificación por frente

### Aislamiento (multi-tenant / ownership) — ✅ ok
Invariantes puros: `particion`, `security (idor-tokens)`, `alta-propia`, `prospecto-import`, `setter-meta` → **5/5 pass**.
- **Suites cruzadas del Bloque 1 sin debilitar.** `02-isolation.spec.ts` (C1: A no ve cartera de B, el lead ajeno da el *mismo* not-found que un id inexistente = sin leak de existencia; C2: 2º setter ve solo lo suyo; C3: nota privada keyed por `(leadId, setterId)`; C4: novedades por `setterId`) y `alta-import.spec.ts` (A.1 `ownedLeadCreateData` fuerza `assignedToId`=sesión; A.2 dedup GLOBAL cross-setter + `$transaction`) son **byte-idénticos desde el corte 5.6** (`git diff 75b9d7f..HEAD` vacío en ambos).
- **Perímetro completo.** Las 13 server actions del setter guardan cada escritura con `requireSetter()` + ownership (`getOwnedLead`/`getOwnedDossier`/`saveOwned*`/`marcarEscaladoOwned`/`marcarDemoEnviadaOwned`, todas `null` si no-owned) antes de mutar; el stage solo se mueve por `transitionDossier`. Los 4 `prisma.osLead` crudos son solo los write-helpers session-forced de alta/import.
- **El manual no abre ningún camino.** `manual/page.tsx` y `manual/[paso]/page.tsx` derivan vía `cargarManualDelLead → getOwnedLead → notFound()` **antes** de derivar; `manual.ts` es derivación PURA (solo `import type` de Prisma); `not-found.tsx` renderiza el string exacto que asertan C1/C2.

### Gates y línea inviolable — ✅ ok
Invariantes puros: `gate-envio`, `self-check`, `reloop-selfcheck`, `progreso` → **4/4 pass**.
- **`gateEnvioDemo` idéntico.** Vive en `flow.ts:90-101` = `stage==='APROBADA' && Boolean(finalUrl) && gateBriefAbierto(status, caliente)`, con `gateBriefAbierto = leadRespondió(status) || esCaliente(caliente)` (`flow.ts:79`). `git diff 134c8af..HEAD -- flow.ts` muestra como ÚNICO cambio el pin-ordering del A-05 (6.1) — **cero líneas del gate tocadas**. El cambio de firma `score → caliente` (`629fe01`, admin-1b) es **pre-rediseño**.
- **La línea inviolable, re-validada server-side en el call site.** La action de envío `enviarDemoAprobada` (`outreach.actions.ts:205`) rechaza con `!finalUrl || !gateEnvioDemo({status, caliente, stage, finalUrl})` (líneas 223-230) y recién entonces reclama (`marcarDemoEnviadaOwned`, línea 232). El `finalUrl` lo escribe el **admin** al aprobar (`revision.actions.ts:80`), nunca el setter. Los tests `envio-demo-rechazo` (#12-15) prueban contra DB: no-APROBADA rechaza, APROBADA+frío rechaza, APROBADA+respondió-sin-finalUrl rechaza, y el gate positivo habilita.
- **Las 6 fases siguen sin gatear.** `manual.ts:514` → `habilitadas = [...PANTALLAS_CONSTRUCCION]` SIEMPRE; `progresoJson` jamás se cablea a la transición (`dossier.ts:379`); `saveOwnedProgreso` escribe solo `{progresoJson}` sin tocar `stage`.
- **El re-loop resetea solo el self-check y preserva checklist+draft.** `RELOOP_RESET.keys === ['selfCheckJson']` (→ `DbNull`), sin tocar `progresoJson`/`draftUrl`/`stage`; el self-check sobrevive a `EN_REVISION` para el admin. Probado end-to-end en `dossier-gates` #10 y `progreso-construccion` #17.

### Flujo — ✅ ok
Invariantes puros: `flow`, `foco`, `particion`, `novedades` → **4/4 pass**.
- **16/16 pasos alcanzables y en orden.** `posicionDe` (`manual.ts:473-581`) es exhaustivo por stage con guarda `never`; cada pantalla es `actual` para un stage alcanzable; `derivarPasoDelLead` (`paso.ts`) es la fuente única. `01-flow.spec.ts` recorre B1→B11 punta a punta con la URL `/manual/mN` como aserción de posición.
- **Puerta lateral intacta.** `home-sections.tsx:67` renderiza `<Link href="/setter/leads/${id}">` en la LeadCard de la cartera; A-06 (`811362c`) no tocó cartera/LeadCard.
- **Postergados vuelven al foco.** `grupoPara` (`flow.ts:370`): `POSTERGADO` vencido → `trabajar`, futuro → `seguimiento`. Invariante D6 verde.
- **El pin ordena, no excluye (A-05).** `particionarCartera` (`flow.ts:607`): fijado accionable+vigente+`!snoozed` → cima de `trabajar`. Invariante `particion` (5 sub-aserciones) verde.
- **Sin segunda cola (A-06).** `novedades-panel.tsx:74` usa `<AbrirFocoButton>` (ancla foco), no `<Link>`; la cola en revisión es un resumen. `00-surfaces` A4 aserta `getByRole('link') → 0` en la región de novedades.

### Contenido — ✅ ok
Invariantes puros: `escalamiento`, `timeline`, `mis-numeros`, `novedades` → **4/4 pass**.
- **Cero "caliente" en el veredicto del setter.** M3 (`m3-veredicto.tsx`) es el único surface visible del veredicto y renderiza `veredictoLabels` de prioridad (`CALIENTE → "Avanzar con prioridad"`, línea 38). El único "Caliente" visible es el badge legítimo de `esCaliente` (lo marca Franco), no el veredicto del evaluador.
- **Vocabulario 2.x limpio.** En las 16 pantallas, todos los hits de `wizard`/`paso` son comentarios internos invisibles; cero enums crudos en JSX. Único copy visible desalineado: `(paso anterior)` en `m14-chequeo.tsx:57` — ya catalogado en el smoke-test.
- **Datos re-servidos.** Teléfono (`m5:56`, `m16:35`), `escaladoNota` A-23 (re-servido + prefillea el re-escalar, `escalamiento-construccion.tsx:43-54`), `senalesOperativas` A-21 (capturado en `ficha-form.tsx:204`, re-servido en `copy-blocks.ts:65` y `:189`).

### Invariantes — ✅ ok
`npm run check:invariants` → **16/16 verde (EXIT=0)**, corrida limpia del padre (además de las corridas por-frente).
- **Ninguna sensible se debilitó.** `gate-envio-demo`, `self-check-gate`, `reloop-selfcheck-reset`, `foco` (leados) e `idor-tokens` (security) son **byte-idénticos** entre pre-ventana (`2e75007~1`) y HEAD — `git diff` vacío en los cinco: imposible que se removiera/aflojara una aserción. La única sensible tocada en la ventana es `particion` (**nueva** en 6.1) = fortalecimiento. Los archivos de motor que custodian (`gate-envio-demo.ts`, `self-check-gate.ts`, `reloop-selfcheck-reset.ts`, `security/*.ts`) no fueron tocados por ningún commit del rediseño.

---

## Crítico de completitud — 4 gaps (ninguno es regresión)

El crítico no halló regresiones y confirmó que los 5 frentes cubren la lista. Levantó 4 gaps de *evidencia-por-proxy* (límites del constraint no-build/no-port de los subagentes), tratados así:

1. **Wiring action → gate** (afirmado por spec no re-ejecutado). **Cerrado en vivo:** se leyó el cuerpo de `enviarDemoAprobada` (`outreach.actions.ts:223-232`) — re-invoca `gateEnvioDemo` antes de escribir; y `test:leados` (que corrió este sprint) incluye `envio-demo-rechazo` verde. Exhibido, no afirmado.
2. **Suites Bloque 1 verdes por proxy** (byte-idénticas + invariantes, no ejecutadas por los frentes). **Cerrado por ejecución directa:** `test:leados` corrió `alta-import` (A.1/A.2) verde; `02-isolation` (C1–C4) corrió verde en `test:setter` (39/39, Fase 3).
3. **Grep exhaustivo de `manual/_components` por prisma crudo** (afirmado). **Cerrado en vivo:** grep de `prisma`/`PrismaClient` en el directorio → **0 matches**. Ningún componente del manual carga/muta un lead por id.
4. **Defecto de documentación del brief.** El brief nombra un `gate-envio-demo.ts` como archivo de motor; **ese archivo no existe** — el gate inviolable vive en `src/lib/leados/flow.ts:90-101` (`gateEnvioDemo` + `gateBriefAbierto`). **Tocar `flow.ts` en esos rangos ES tocar el motor.** Queda registrado acá para futuros lectores.

---

## Fase 2 — Regresiones

**Ninguna.** Cero regresiones reclamadas, cero confirmadas. No se modificó ninguna línea de producción (regla 1). No aplicó el FRENAR-y-reportar de la regla 2 (no hubo regresión de motor que arreglar).

---

## Fase 3 — Corrida completa

| Comando | Resultado | Cubre |
|---|---|---|
| `npx tsc --noEmit` | ✅ 0 errores | tipos |
| `npm run check:invariants` | ✅ **16/16** (EXIT=0) | las 16 invariantes del dominio |
| `npm run test:leados` | ✅ **22/22** | gates + aislamiento + re-loop + self-check + alta/import (in-process, DB real) |
| `npm run build` | ✅ verde | primer build limpio post-7.2; rutas `/setter/**` + `/manual/[paso]` compiladas, 0 errores TS |
| `npx prisma migrate status` | ✅ al día (80) | schema |
| `npm run test:setter` | ✅ **39/39** (2.7m, 0 flakes) | recorrido punta-a-punta (01-flow B1→B11), aislamiento cruzado en vivo (02-isolation C1–C4), re-loop completo (01-flow B10), foco/pin (03), mobile/a11y (05), claim (06), admin (07) |

El recorrido de punta a punta (lead nuevo → agenda), el caso cruzado de aislamiento en vivo y el re-loop completo que pide Fase 3 están **codificados como e2e determinístico** en `test:setter` — la forma más fuerte de correrlos (no un click manual efímero). Corrida limpia al primer intento, sin flakes. La suite `05-empty-mobile-a11y` (F1–F6, incl. F6 landmarks + `aria-current` y F4 drawer mobile) es la **primera ejecución en browser de los cambios de a11y del 7.2** (`Field.tsx`) — que 7.2 no pudo correr por el `dev:qa` de otra sesión — y pasó verde.

---

## Pendientes post-proyecto (anotados, no implementados)

Nada de esto es regresión; todo queda para después del proyecto, a triage de Franco.

- **Los 39 hallazgos (b) del smoke-test 7.0** → [`SMOKE-TEST-MANUAL-2026-07.md`](SMOKE-TEST-MANUAL-2026-07.md). Los más serios:
  - `guidance-content.ts:347` — el hint base del score dice "4-5 marca el lead como caliente", contra la regla de M3 ("sugiere prioridad"). M3 lo sobrescribe, el setter no lo ve mal; la **fuente-guía** queda desalineada (copy, no motor). Severidad alta.
  - `pantalla-manual.tsx` — `NavConstruccion` se renderiza en la reentrada `mr` (por `PANTALLAS.mr.fase==='construccion'`). No rompe gate ni aislamiento; decisión de producto.
  - `m14`/`m15` (`ChequeoForm`/`EnvioForm`) — únicos sin error inline (solo toast); raíz: no usan `useStepAction`. No evaden el gate.
  - **Vocabulario muerto del wizard** en mensajes de error server-side: `"Paso 7"`/`"Paso 10"` (`outreach.actions.ts:165/173`), `"Paso 5"` (`dossier.actions.ts:382`), `"(paso anterior)"` (`m14-chequeo.tsx:57`), `"Paso 5"` (`guidance-content.ts:845`). **Cuidado:** los de `outreach`/`dossier` viven en server actions — corregirlos toca motor-adyacente, tratar con cautela.
- **`herramientas.ts`** — 4 de 5 URLs de herramientas externas son `null` (`// TODO: URL`): el Gem del Evaluador, el Gem de diseño/brief, el acceso a Claude Design, el Gem de outreach. Solo Netlify es real. **Son links de Franco, no bugs de código** — la UI muestra el acceso como "pendiente", no un link roto.
- **Pantallas pesadas de Construcción (m7-m12) en mobile** — su Registro cae bajo el fold por el mucho contexto re-servido; llevarlo sobre el fold exige el *reestructurar* que Franco descartó en 7.1. Lever suyo si algún día lo quiere.
- **Naming histórico** — `StepAnchorId` / comentarios de `paso.ts` nombran consumidores del wizard retirado (5.6). El tipo sigue siendo la costura viva de la derivación; motor intacto, solo naming.
- **Copy anotado en 7.1** — ninguno nuevo; el copy desalineado ya vive en el informe 7.0.
- **Higiene de tooling** (no afecta resultados): `eslint` como key deprecada en `next.config.ts` (warning de build); falta `"type":"module"` en `package.json` (warning de ts-node al correr invariantes). Cosmético.
- **La "vara" `docs/brief-vision-flujo-setter.md`** no existe en el repo — confirmar con Franco si debía existir con otro nombre/ubicación.
- **`.last-run.json`** de Playwright (artefacto del runner) — queda fuera del commit, ruido pre-existente.

> **Cerrado en el camino (ya no pendiente):** el a11y sistémico de `Field.tsx` que arrastraban 6.3/7.0/7.1 se resolvió en el Sprint 7.2 (`fecda1b`) — y este sprint es la primera vez que ese cambio pasa por `build` + la suite de browser.

---

## Cierre

**BLOQUE 7 CERRADO.** 7.0 (smoke-test exhaustivo) → 7.1 (pase perceptual, header compacto en mobile) → 7.2 (a11y sistémico de `Field`) → **7.3 (regresión final — el sello del cierre).**

**PROYECTO DE REDISEÑO DE EXPERIENCIA CERRADO.** El manual pasó de esqueleto (4.1) a la experiencia única del setter (Bloque 5, el corte), el home se alineó al brief §2/§4/§8 (Bloque 6), y el pulido + la verificación final cerraron el Bloque 7. **El motor (máquina de stages, gates, línea inviolable de envío, cadencia, agenda, escalamiento, aislamiento multi-tenant) no se tocó en ningún sprint del proyecto** — probado acá por invariantes byte-idénticas y git-diff, no por confianza.
