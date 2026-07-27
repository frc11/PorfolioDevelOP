# PROGRESO — corrida M1 (manual de usuario del Panel del Setter)

Producto: [`00-INDICE.md`](00-INDICE.md) + los 10 capítulos.
Byproducto de auditoría: [`HALLAZGOS-MANUAL.md`](HALLAZGOS-MANUAL.md).

---

## FASE 0 — Terreno

| Chequeo | Resultado |
|---|---|
| Rama | `main` |
| HEAD al arrancar | `e7f81ab` — *docs(bitacora): cierre sprint P3.1* |
| **P3.1 en el log** | **Sí** (`e7f81ab`, `f45b81b`, `36d9095`, `786b357`, `4eb1b13`, `5fb6c58`, `5692380`, `7601f0a`) → el manual retrata copy **post-P3.1** |
| Sucio al arrancar | solo `docs/probe-01-censo-cosecha.md` (untracked, WIP ajeno) — **no se tocó** |
| Galería | 41 `.png` presentes, pero capturados en `6a88cbe` (**pre-P3.1**) → **regenerada** |
| Server de navegación viva | prod-QA en `:3001` (`npm run start:qa`), sembrado con `npm run seed:galeria` |

### Por qué se regeneró la galería

Los `.png` existían, pero eran de antes de P3.1 — el sprint que **cambió copy de
pantalla** (entre otras: «vencido visible en m5», que era el hallazgo #4 de la
corrida M0; `Parquear`→`Pausado`; pluralización de «Te paso N horarios»; retiro
de los placeholders «sin migrar»). Un manual escrito contra fotos viejas habría
citado texto que la app ya no dice. Se corrió `npm run seed:galeria` +
`SETTER_EXTERNAL_SERVER=1 npm run galeria:capturar` contra el mismo server QA que
se usó para navegar.

### Estado de las herramientas externas (`src/lib/leados/herramientas.ts`)

**4 de 5 siguen sin URL cargada** — igual que en M0. Sin cambios.

| Herramienta | URL | Se usa en |
|---|---|---|
| Evaluador | `null` → **PENDIENTE** | Evaluación (m2) |
| Gem de diseño | `null` → **PENDIENTE** | Brief (m6) |
| Claude Design | `null` → **PENDIENTE** | Construcción (m7–m12) |
| Netlify Drop | `https://app.netlify.com/drop` | Publicar el borrador (m13) |
| Gem de outreach | `null` → **PENDIENTE** | Primer contacto (m4) y Seguimiento (m5) |

Esto define cómo se escribe cada pantalla que las usa: el manual **nombra la
herramienta y dice que el acceso todavía no está cargado en el panel**, en vez de
fingir un link. Registrado como `H-01`.

---

## Estado de los capítulos

| Capítulo | Estado | Commit |
|---|---|---|
| 00 — Índice | **CERRADO** | `M1 cap 00-01` |
| 01 — Tu panel | **CERRADO** | `M1 cap 00-01` |
| 02 — Ficha y evaluación | **CERRADO** | `M1 cap 02` |
| 03 — Opener y seguimiento | **CERRADO** | `M1 cap 03` |
| 04 — Brief | **CERRADO** | `M1 cap 04` |
| 05 — Construcción | **CERRADO** | `M1 cap 05` |
| 06 — Borrador, chequeo y revisión | **CERRADO** | `M1 cap 06` |
| 07 — Cuando Franco dice no | **CERRADO** | `M1 cap 07` |
| 08 — Envío | **CERRADO** | `M1 cap 08` |
| 09 — Agenda | **CERRADO** | `M1 cap 09` |
| 10 — Cierres | **CERRADO** | `M1 cap 10` |
| HALLAZGOS | en curso | — |

---

## REPORTE FINAL

*(se completa al cerrar la corrida)*
