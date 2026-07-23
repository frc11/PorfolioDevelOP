# PROGRESO — corrida M0 (galería de estados del Panel del Setter)

**CORRIDA CERRADA.** Las 4 etapas completas. Este archivo queda como registro; el
producto está en [INDICE.md](INDICE.md).

---

## Terreno (FASE 0)

- Rama `main`, HEAD al arrancar `6a88cbe` (sprint 6.2).
- **Sprint 6.2 SÍ estaba en el log** → los estados de m16 con horarios ofrecidos se enumeraron y se alcanzaron.
- `npx tsc --noEmit` → exit 0 · `npm run build` → exit 0.
- Sucio al arrancar: solo `docs/probe-01-censo-cosecha.md` (untracked, WIP ajeno). **No se tocó, no se stageó.**

## Estado de las etapas

| Etapa | Estado | Commit |
|---|---|---|
| 0 — Terreno | CERRADA | — |
| 1 — Enumeración | CERRADA | `62ad4bf` |
| 2 — Sembrador | CERRADA | `9ecd20e` |
| 3 — Captura | CERRADA | `d3f540d`, `e18c639` (+ tanda 1) |
| 4 — Índice final e inalcanzables | CERRADA | commit final |

---

## REPORTE FINAL

**(1) Estados.** 37 enumerados · **37 capturados** · **0 inalcanzables**. Más 4
capturas mobile (41 `.png` en total).

**(2) Inalcanzables.** Ninguno. Se registran igual dos límites reales:
- **APROBADA y RECHAZADA no son alcanzables desde el panel del setter** — aprobar/rechazar la demo y cargar la `finalUrl` son acciones de Franco desde admin. Todo el tramo Envío/Agenda/re-loop existe para el setter sólo *después* de que Franco actúe.
- **El estado 24 (error persistente) no se puede sembrar, sólo provocar** — vive durante la vuelta de un submit rechazado. Se alcanzó desde la UI; no se puede "dejar la app" en ese estado.

**(3) Modo de sembrado.** 8 por flujo real (actividades = filas reales del motor;
la oferta de m16 por `guardarHorariosOfrecidosOwned`, el write-path exacto de la
action) · 2 por interacción real desde la UI (24a/24b) · 27 sembrado directo por
stage + blobs. El motivo del directo está argumentado en el INDICE: el flujo real
completo pasa obligatoriamente por acciones del admin.

**(4) Reproducible en dos corridas.** **Sí.** El sembrador es idempotente
(limpia su namespace `M0-GAL` y reconcilia; verificado corriéndolo 4 veces) y la
captura resuelve los leads por `businessName`, sin ids hardcodeados. La galería
completa se regeneró de cero dos veces, 41/41 las dos.

**(5) Dónde quedó.** `docs/manual-usuario/galeria/` — `INDICE.md` (el producto),
`PROGRESO.md` (esto), `png/` (las capturas). **Los `.png` NO van al repo**: 62 MB
en 41 archivos, regenerables enteros con `npm run galeria`. Decisión propia,
documentada en el `.gitignore` del directorio.

**(6) Suites (cierre).** Todo verde, con el prod-QA :3001 levantado:

| Suite | Resultado |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run check:invariants` | exit 0 (17 invariantes) |
| `npm run test:leados` | 25/25 |
| `npm run test:setter` | 60/60 |

**(7) Lo que llamó la atención.** Detallado con screenshot al lado en el INDICE.
Lo grave primero:
1. **4 de 5 herramientas externas dicen PENDIENTE** (Evaluador, Gem de diseño, Claude Design, Gem de outreach). Sólo Netlify Drop tiene URL. El manual manda al setter a herramientas que desde el panel no existen. **Hallazgo principal.**
2. **`fullPage` de Playwright no captura la pantalla completa en `/setter/*`** — el layout scrollea un `<main overflow-y-auto>` y el `document` mide el viewport. La primera vuelta de esta galería salió recortada por eso. Afecta a cualquier job de screenshots de este portal.
3. Un lead que llegó a APROBADA muestra la **Construcción como no completada** (el rastro sugiere que se salteó fases que evidentemente hizo).
4. Un **toque vencido no se ve vencido**: muestra "Próximo toque: 22/7" (fecha pasada) sin marca de atraso.
5. El **home llega con mucho ruido acumulado** (60 novedades, campana 9+) y sin techo ni resumen.
6. **Mezcla de controles**: checkbox nativo en m16 vs `role="switch"` en m14 y las fases, para la misma idea de tildar.
7. Artefacto de captura (no del producto): `motion/react` no lo frena el CSS inyectado.

**(8) Etapas.** Las 4 completas. Nada quedó a medias.

---

## Decisiones tomadas

1. **Nomenclatura**: `NN-nombre-del-estado.png`, prefijo `M-` para mobile. El número es el del índice.
2. **Enumeración por variación, no por pantalla**: 20 ids en `PANTALLAS`, 37 estados — las variaciones (cadencia viva/agotada, mr N°1/N°2, m16 virgen/ofrecidos/agendada, tilde habilitado/no) son donde vive el manual.
3. **Reuso de fixtures**: se extendió `tests/helpers/setter-db.ts` con campos opcionales (`exactName`, `progresoCompletadas`, `rechazosCount`, `sinFinalUrl`, `draftUrl`, `nextFollowUpAt`) en vez de escribir un sembrador paralelo. Los tests existentes no cambiaron de comportamiento (60/60).
4. **Los `.png` fuera del repo** — ver (5).
5. **El estado 24 lleva lead propio** aunque sea de interacción: tildar los 6 checks persiste `selfCheckJson`, así que compartir el lead del estado 22 lo habría ensuciado y roto la convergencia.
6. **El revert del stage en 24b va en `finally`** — un fallo a mitad dejaba el lead en otro estado y la galería dejaba de converger (pasó una vez durante la corrida).

## Cero cambios en producción

El diff de la corrida toca sólo: `docs/manual-usuario/galeria/*`,
`scripts/dev/m0-galeria-seed.ts`, `tests/galeria/*`, `tests/helpers/setter-db.ts`,
`playwright.galeria.config.ts` y 3 scripts nuevos en `package.json`. **Ningún
archivo de `src/`.** Motor, gates, ownership y schema intactos. Sin push.
