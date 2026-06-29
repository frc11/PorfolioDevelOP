# Auditoría 2 — Consistencia de diseño y organización del código · Zona del setter

> **READ-ONLY.** Diagnóstico, no remediación. No se tocó código, no se corrió app/build/DB.
> Complementaria a [`auditoria-ux-setter.md`](auditoria-ux-setter.md) (composición/densidad/copy/estados/navegación por pantalla).
> Esta pasada mide **consistencia del sistema de diseño, reutilización de componentes y consistencia de patrones** — NO estética.

**Fecha:** 2026-06-23 · **Zona:** `src/app/(protected)/setter/**` + primitivas compartidas de `src/components/ui/**` que el setter consume + `src/lib/design-tokens.ts`. **No** se auditó `admin/**`.

**Método:** 3 subagentes de exploración read-only en paralelo (1 por dimensión) + 1 verificador adversarial por dimensión que re-leyó cada archivo/línea citado para confirmar, refutar o ampliar. 6 agentes, ~227 lecturas de archivo.

**Resultado de la verificación adversarial (calidad del propio diagnóstico):**
- **D1:** 7 confirmados · 2 refutados · 4 omisiones recuperadas.
- **D2:** 23 confirmados · 3 refutados/matizados · 6 omisiones recuperadas.
- **D3:** 21 de 22 confirmados · 1 refutado parcial · 3 omisiones recuperadas.

**Límite duro respetado:** ningún hallazgo es un juicio estético. Todo se mide contra `design-tokens.ts`, contra la existencia de una primitiva compartida, o contra la presencia/ausencia objetiva de un atributo en el código. Lo que no se puede determinar sin runtime está marcado como tal.

---

## 1. Resumen ejecutivo — los hallazgos que mandan

1. **`Callout` re-implementado a mano ~14 veces** es la inconsistencia de reutilización más fuerte y verificable. La primitiva existe en `components/ui`, se usa **correctamente** en varios sitios de la misma zona (construccion / self-check / home / wizard), y a la vez la "caja de mensaje semántica" (`rounded border-X-400/20 bg-X-500/[0.06] text-X`) se copia a mano en 9+ componentes. En `construccion-step.tsx` la inconsistencia es **intra-archivo** (usa `Callout` bien en una línea y lo re-pinta a mano en otra).

2. **El hueco de a11y más serio vive en la primitiva compartida `Field.tsx`** y por eso es transversal a todos los steps: el `<label>` no se asocia programáticamente al control (sin `htmlFor`/`id`/`useId`) y el error de form es solo-visual (sin `role="alert"`/`aria-live`/`aria-invalid`). Es "consistente… en su carencia".

3. **`TextArea` y los `StatCard` a mano son primitivas locales que duplican el kit.** `text-area.tsx` es el gemelo declarado de `Input.tsx` (riesgo de drift), y `mis-numeros.tsx` re-implementa `StatCard` a mano mientras `cartera-view.tsx` (misma zona) sí lo usa.

4. **El "header de step" y la "option-card seleccionable" son los patrones copiados de mayor cardinalidad** (9 y 3 ubicaciones respectivamente), sin componente extraído.

5. **La adherencia a tokens es alta con bolsones acotados:** color y z-index están **muy** bien (cero `z-[]` literales, z-index siempre vía `style={{ zIndex }}` con tokens; paleta siempre por utilidades nombradas). Los bolsones de hardcode son **las sombras** (familia entera en valores arbitrarios, 4 valores distintos), el **tracking de eyebrow** (3 valores conviven, el token se respeta en 1 solo lugar) y ~4 medidas sueltas.

**Dos palancas de consolidación concentran la mayor parte del valor:** `Callout` (cubre D2 cajas + D3 banners) y el wiring de a11y de `Field` (cubre todos los forms). *(La interpretación/priorización es de la capa de planificación; acá solo se diagnostica.)*

---

## 2. D1 — Adherencia al sistema de diseño

### 2.1 Tokens vs hardcode — `mixto`

**Lo que está bien (calibración):**
- **z-index: impecable.** Cero `z-[]` literales en className en toda la zona. Se consume siempre vía `style={{ zIndex: zIndex.x }}` con los tokens (`setter-shell.tsx`, `recorrido-strip.tsx` usa `zIndex.sticky`, `shortcuts-help.tsx` usa `zIndex.overlay`). Ambos tiers existen en `design-tokens.ts:229` (`sticky:20`) y `:231` (`overlay:40`).
- **Color: por utilidades de escala.** La paleta (cyan/zinc/amber/emerald/rose/red) se aplica siempre con utilidades nombradas de Tailwind que espejan los tokens — no hay hex/rgb literal en className en la zona.

**Bolsones de hardcode confirmados:**

| # | Archivo:línea | Evidencia | Problema | Sev |
|---|---|---|---|---|
| 1 | `_components/continuar-cta.tsx:34`, `home-sections.tsx:210`, `novedades-panel.tsx:92` | `shadow-[0_8px_30px_rgba(0,0,0,0.25)]` | Sombra arbitraria repetida 3× | media |
| 1b | `_components/shortcuts-help.tsx:37`, `leads/[leadId]/_components/lead-wizard.tsx:136`, `dossier-stepper.tsx:70` | `shadow-[0_16px_40px_rgba(0,0,0,0.45)]` · `…0.4)]` · `shadow-[0_4px_12px_rgba(0,0,0,0.5)]` | **3 sombras arbitrarias más** → 4 valores distintos en la zona, ninguno coincide con `shadows.*` | media |
| 2 | `_components/setter-shell.tsx:53,69,74` | `w-[240px]` ×3 (`lg:pl-[240px]`) | Ancho de rail arbitrario (= `w-60`) repetido 3× | baja |
| 3 | `_components/cartera-toolbar.tsx:76,83` | `min-w-[9.5rem]` vs `min-w-[10rem]` | Dos anchos distintos entre Selects **hermanos** | baja |
| 4 | `_components/text-area.tsx:13` | `min-h-[88px]` | Fuera de la escala (`min-h-20`=80 / `min-h-24`=96) | baja |

**Matiz importante (lo confirmó el verificador leyendo `design-tokens.ts:176-182`):** `shadows` está exportado como objeto TS, igual que `zIndex`, y **no** está en el theme de Tailwind v4 → una utilidad `shadow-*` **nunca** puede consumir el token. El desvío real no es "no usaste la utilidad" sino "usaste valores arbitrarios divergentes y no trazables, con 4 variantes para el mismo rol de elevación". Curiosamente `dossier-stepper.tsx:70` (`0 4px 12px`) espeja el *offset/blur* de `shadows.default` pero con alpha 0.5 en vez de 0.2 — a un paso del token y aun así diverge.

### 2.2 Disciplina de color B9 — `consistente` (2 desviaciones puntuales)

| Archivo:línea | Evidencia | Violación B9 | Sev |
|---|---|---|---|
| `_components/autosave-status.tsx:23-28` | phase `error` → `text-amber-300` | **ERROR pintado en amber** (amber = GATE-PENDIENTE; un fallo de guardado es error → debería ser rojo). Semántica cruzada. | media |
| `leads/[leadId]/_components/evaluacion-step.tsx:234-238` | score 1-2 zinc · 3 cyan · 4-5 amber | cyan/amber usados como **peldaños de una escala de rating**, mezclando la semántica B9 (cyan=accionable, amber=gate) con un eje de puntaje | baja |

El resto del uso de color es correcto: cyan en CTAs/próxima-acción, emerald en verificado, rojo en error de validación, zinc en informativo.

### 2.3 Escala (tipografía / spacing) — `mixto`

**Hallazgo central — el eyebrow tiene 3 valores de tracking conviviendo, y el token casi no se usa:**
- Token: `letterSpacing.eyebrow = '0.24em'` (`design-tokens.ts:162`).
- `tracking-[0.18em]` (patrón dominante, **5 sitios**): `mis-numeros.tsx:20`, `cartera-view.tsx:144`, `continuar-cta.tsx:50`, `novedades-panel.tsx:118`, `progreso-semana.tsx:37`.
- `tracking-[0.2em]` + `font-bold` + `text-[10px]` (**2º patrón de eyebrow, 3 sitios**): `onboarding-hint.tsx:93`, `evaluacion-step.tsx:83,208`.
- `tracking-[0.24em]` (el token) → respetado en **un solo lugar**: `layout.tsx:53`.

> Es decir: el eyebrow que **sí** respeta el token es la excepción, no la regla. Hay además un segundo eje de variación (`font-bold`+`text-[10px]` vs `font-medium`+`text-[11px]`) que separa dos "familias" de eyebrow.

Outlier menor de spacing: `shortcuts-help.tsx:37` usa `p-3.5` (half-step) donde la escala sugiere `p-3`/`p-4`. *(El glass `blur/saturate` repetido SÍ es sistema documentado, no outlier.)*

---

## 3. D2 — Reutilización de componentes

### 3.1 Lo que se reusa bien — `consistente`

El kit compartido se importa desde el barrel `@/components/ui` y se compone correctamente. **No** se encontró ningún `<select>` nativo donde existe `<Select>`, ni card de divs donde existe `<Card>`, ni panel de vacío inline donde existe `<EmptyState>`:
- `Card`/`CardHeader`/`Field`/`Select`/`Button` bien compuestos (`ficha-step.tsx:144-273`).
- `StatCard` reusado en el marcador (`cartera-view.tsx:147-165`).
- `Modal` + `Button` para confirmaciones destructivas (`evaluacion-step.tsx:285-318`, `escalar-modal.tsx:70-101`) — cumple la regla "destructive actions require confirmation".
- `EmptyState` en los 3 boundaries (`home-empty.tsx`, `error.tsx`, `not-found.tsx`).
- `Badge` con `tone/variant/size/icon/pulse` en múltiples sitios, sin pills de estado a mano.

### 3.2 `Callout` — la inconsistencia de reutilización #1 — `inconsistente` (~14 sitios)

`Callout` existe, encapsula `tone` (success/warning/danger/neutral/info) + `icon` + `title` + `accent`, **y se usa correctamente** en `construccion-step` (`UrgenciaBanner`/`GuiaRetrabajo`), `self-check-step`, `home-sections`, `lead-wizard`. Pese a eso, la misma caja se re-implementa a mano:

| Archivo:línea | Caja a mano | Equivalente | Sev |
|---|---|---|---|
| `ficha-step.tsx:275-292` | warning + success inline | `<Callout tone="warning"/"success">` | alta |
| `brief-step.tsx:312-323` | success (con icono) + warning (con título "Chequeo rápido…") | `<Callout icon title>` | alta |
| `evaluacion-step.tsx:272-277` | neutral "descarte automático" | `<Callout tone="neutral">` | alta |
| `evaluacion-step.tsx:207-220` | info neutra "Qué mira el Evaluador" | `<Callout tone="neutral">`/`Card subtle` | baja |
| `opener-step.tsx:170-176` | amber "Lead caliente" | `<Callout tone="warning">` | media |
| `seguimiento-step.tsx:240-256` | success + panel brand "Demo aprobada" | `<Callout tone="success">` | media |
| `_components/canal-seguridad.tsx:17-30` | recalcula el mapa `tono→clases` (pasado=rose/cerca=amber/default=neutral) | `<Callout tone={…}>` (caso exacto que el doc de Callout dice reemplazar) | alta |
| `_components/guardrail-rol.tsx:16-34` | danger ×2 variantes (compacto/full) | `<Callout tone="danger" accent>` | media |
| `construccion-step.tsx:341-350` | danger "Ya avisaste a Franco" **— mismo archivo usa Callout danger/warning bien en :82/:94** | `<Callout tone="danger">` | alta |

**Omisiones recuperadas por la verificación:**
- `_components/teach-panel.tsx:39-52` — cajas "esto sí / esto no" (success+danger compactas) a mano.
- `self-check-step.tsx:154-224` — cabeceras de sección con borde de tono (amber "ojo de diseño") + filas check-en-caja a mano.

### 3.3 Primitivas locales que duplican el kit — `inconsistente`

| Archivo:línea | Qué es | Por qué importa | Sev |
|---|---|---|---|
| `_components/text-area.tsx:1-22` | **Gemelo de `Input.tsx`** portado a `<textarea>` (mismas clases base/focus/invalid; el comentario lo admite: "el kit no trae una") | Usado por 6+ steps; **drift** si `Input` cambia. Candidato a `components/ui/Textarea` hermano de `Input`. | alta |
| `_components/mis-numeros.tsx:26-101` *(omisión recuperada)* | **Re-implementa `StatCard` a mano** (div + icono + `text-2xl tabular-nums` + label) | `cartera-view.tsx` (misma zona) sí usa `StatCard`. Mismo concepto, dos formas. Peso similar a TextArea. | alta |
| `_components/progreso-semana.tsx:40-50` *(omisión)* | Tira de métricas "número+label+icono" a mano (layout horizontal) | Refuerza la dispersión "stat a mano" | media |
| `_components/copy-block.tsx:18-74` | No existe `CopyBlock` compartido; vive local. 7 consumidores (opener/brief/construccion/agenda/seguimiento/ficha/guardrail) | El componente local de mayor alcance. Candidato a compartido **si** otra zona lo necesitara (hoy solo setter). | media |
| `_components/ejemplo-ideal.tsx:20-46` | Shell colapsable `<details>` (summary sin marker + cuerpo border-top) | Duplicado en `teach-panel.tsx:122`, `ficha-step.tsx:126` (congelada), `tool-guide.tsx:66`. Sin primitiva `Disclosure`. | media |
| `_components/campo-mejora.tsx:14-29` | Hint neutro local (`role="status"` + Lightbulb) | Mini-variante de `Callout` neutral compacto; local justificado pero suma a la dispersión | baja |

### 3.4 Patrones copiados sin extraer — `inconsistente`

| Patrón | Ubicaciones | Evidencia | Sev |
|---|---|---|---|
| **Header de step** (h2 "Paso N — Título" + intro + badge + estado lock) | **9 steps** | `ficha:146`, `opener:65`, `brief:148`, `evaluacion:62`, `draft:55`, `construccion:208`, `selfcheck:88`, `agenda:124`, `seguimiento:139` | alta |
| **Option-card seleccionable** (`border` + `bg` activo) | **3 implementaciones** | `evaluacion-step.tsx:223-245` (score 1-5), `agenda-step.tsx:258-274` (slots), `seguimiento-step.tsx:291-313` (resultado) | media |
| **Control de confirmación** dispar | 2 controles distintos | `draft-step.tsx:161-170` usa `<Toggle>` compartido; `agenda-step.tsx:202-218` usa `<input type=checkbox>` crudo para la misma intención | media |
| **Barra de acento lateral** (`span … w-1 bg-…/80`) | ≥4 sitios | `home-sections:54`, `continuar-cta:40`, `onboarding-hint:90`, `novedades-panel:54` — `Callout` ya implementa esto vía prop `accent` | media |
| **Mapa `tono→color-de-barra`** *(omisión)* | `novedades-panel.tsx:53-54` | `KIND_META.accent` reconstruye a mano el mapeo tono→acento que `Callout` ya resuelve | media |
| **Superficie elevada destacada** | 2 sitios pixel-idénticos | `home-sections.tsx:209-211` ≡ `novedades-panel.tsx:92` (`rounded-2xl bg-white/[0.02] p-4 shadow-… ring-1 ring-inset ring-white/[0.08]`) | media |
| **Cuerpo de Rechazo "Qué/Dónde/Arreglo"** | 3 sitios | `home-sections:140`, `construccion-step:100` (GuiaRetrabajo), `lead-wizard:138` — los 3 usan `Callout` (bien) pero el **cuerpo interno** está copiado verbatim → `<RechazoDetalle>` | media |
| **Botones crudos** (icon/pill) donde aplica `<Button>` | varios | `lead-card-actions.tsx:238` (ActionButton icon-only `h-7 w-7`, no cubierto por Button) + 3 pills (`144/162/214`); `cartera-toolbar:96` ("Limpiar"); `novedades-marcar-visto:32` (replica `Button` secondary incl. su `disabled:opacity-50`); `onboarding-hint:100/138` | media/baja |
| **Link externo** `<a target=_blank><ExternalLink/>` | 3+ sitios (2 literales en draft) | `draft-step:75,96`, `construccion:148`, `tool-guide:33` → candidato `<ExternalLinkChip>` | baja |

*Legítimos (no son outliers, anotados como composición consciente):* `setter-nav.tsx` (nav con `triggerTransition` + pill `layoutId`), triggers del drawer en `setter-shell.tsx`, FAB de `shortcuts-help.tsx` (widget propio), y el reuso correcto de `<ShortcutsHelp>` desde `cartera-view`/`recorrido-strip`.

### 3.5 Near-duplicados / candidatos a consolidar — `mixto`

- **`text-area.tsx` ↔ `Input.tsx`** — casi-duplicado real, riesgo de drift (alta). *(ver 3.3)*
- **`loading.tsx` (lead) ↔ `LoadingState`** — el skeleton de carga se arma a mano con `<Skeleton h-72…>` ×N habiendo `LoadingState variant="skeleton-card"`. Solapa (no idéntico: layout específico). Reuso de `<Skeleton>` base es correcto. (baja)
- **`RechazoDetalle`** — helper local `GuiaRetrabajo` en un archivo, inline en otros dos → consolidar. (media)

---

## 4. D3 — Consistencia de patrones + responsive + a11y (estructura, no estética)

### 4.1 Forms — `consistente`

Los 9 steps comparten el molde: `'use client'` + `useState` manual + `zod safeParse` + `ActionResult` + `useTransition` + `toast.success/error` + `router.refresh()`. **Ningún step usa react-hook-form** ni una ruta de validación divergente. `use-autosave.ts` + `AutosaveStatus` + `useUnsavedGuard` se reusan idénticos en `ficha` y `brief`.

Desviaciones (acotadas, en su mayoría justificadas):
- `self-check-step.tsx:50-54` — **no** hace `safeParse` client-side; delega toda la validación a la action (deliberado: son toggles, no texto). baja.
- `construccion-step.tsx:196-206` — no es form de captura; son transiciones de stage vía helper `transicionar(action, mensajeOk)`. baja.
- `agenda-step.tsx:73-74` — **dos `useTransition`** (`buscando`/`confirmando`), único step con doble pending (justificado: dos acciones independientes). media.

### 4.2 Submit / loading / error — `mixto`

- **Patrón base:** `serverError` como `<p text-red-400>` + `<Button loading>` (ficha/brief/evaluacion/draft/agenda/escalar).
- **`self-check-step.tsx:226-237`** resuelve el feedback de gate con `<Callout success/neutral>` — **3er mecanismo** de "estado del form" (Callout vs `<p>` de color vs div con borde). media.
- **`construccion-step.tsx:82-117`** usa `<Callout warning/danger>` para banners mientras `ficha`/`brief` usan divs amber/emerald inline → Callout-vs-div conviven (liga con §3.2). media.
- **`agenda-step.tsx:317,330,334`** renderiza el **mismo `error` 3 veces** con guardas mutuamente excluyentes (un solo estado `error` para dos flujos). Frágil, único en la zona. media.
- **Omisión recuperada:** el error de submit se parte en **dos moldes paralelos** igual de extendidos — *Camino A* vía `Field error={…}` (`draft:149`, `escalar:90`, `opener:196`) vs *Camino B* `serverError` como `<p>` **fuera** de `Field` (`ficha:294`, `brief:258`, `evaluacion:279`, `agenda:317`, `seguimiento:336`). El explorador trató B como "el patrón base"; A es paralelo, no excepción.
- **Bien resuelto:** el loading del autosave es uniforme — `<Spinner size="xs">` compartido + `role="status"` (`autosave-status.tsx:48-61`). Sin spinners ad-hoc.

### 4.3 Responsive — `consistente`

**No hay duplicación de árbol por breakpoint.**
- Rail/drawer se renderiza **una sola vez**: un `<aside>` que en desktop queda fijo (`lg:translate-x-0`) y en mobile se desliza vía `transform` (`setter-shell.tsx:51-72`). `SetterNav` montado una vez.
- El wizard se renderiza una vez. `step-anchor.tsx:32-40` tiene una guarda **defensiva** contra `offsetParent===null` por si existiera una copia bajo `display:none` — hoy no existe (es defensa, no duplicación).
- Grids uniformes (`grid gap-3 sm:grid-cols-2`), descripciones ocultas en mobile (`hidden … sm:block`).
- Ícono-solo en mobile bien resuelto: `recorrido-strip.tsx:42` oculta el `<span>` de texto pero el nombre accesible vive en `aria-label` del `<Link>`.

### 4.4 A11y estructural — `mixto` (huecos altos en la primitiva compartida)

**Presente y uniforme (lo bueno):**
- `setter-nav.tsx:49,69` — `<nav aria-label>` + `aria-current="page"` en el activo; pill con `layoutId` namespaced.
- `use-keyboard-shortcuts.ts:14-20` — hook único con guarda `esEditable()` que respeta `input/textarea/select/contenteditable/role=textbox|listbox|combobox` y no secuestra teclas con modificador. Reusado por `recorrido-strip`/`cartera-view`/`shortcuts-help`.
- `evaluacion-step.tsx:222-245` — selector de score con `role="radiogroup"` + `role="radio"` + `aria-checked` (buen patrón custom).

**Huecos (consistentes en su carencia):**

| Archivo:línea | Hueco | Sev |
|---|---|---|
| `components/ui/Field.tsx:13-28` | **`<label>` NO asociado al control** (sin `htmlFor`/`id`/`useId`; los children van como hermanos). Click en label no enfoca; el lector no anuncia la etiqueta. Afecta a **todos** los steps que usan Field. | **alta** |
| `components/ui/Field.tsx:21-25` | **Error solo-visual**: `<p text-red-400>` sin `role="alert"`/`aria-live`, y Field no inyecta `aria-describedby`/`aria-invalid` en el control. | **alta** |
| `components/ui/Input.tsx:13-24` y `_components/text-area.tsx:9-22` | `invalid` solo cambia el borde; **no emite `aria-invalid`** ni acepta `id` para describedby. | media |
| `ficha:294`, `brief:258`, `evaluacion:279`, `agenda:317`, `seguimiento:336` | `serverError` como `<p>` **sin `aria-live`** — el feedback más crítico (error de guardado) es mudo para AT, mientras `autosave-status`/`campo-mejora` **sí** tienen `role="status"`. | media |
| `dossier-stepper.tsx:41` | `<ol aria-label>` marca el paso actual **solo visualmente**; **sin `aria-current="step"`** en el `<li>`, pese a que la nav sí usa `aria-current`. | media |

**Omisiones recuperadas (inconsistencias de patrón a11y):**
- **3+ mecanismos de label conviven:** `Field` (sin wrapping) vs `<label>` nativo envolviendo `<input type=checkbox>` en `agenda-step.tsx:202` (que **sí** da nombre/foco por wrapping) vs `<Toggle label>` en self-check. → El label correcto **existe** en la zona vía wrapping, lo que prueba que el hueco de `Field` es subsanable, no una limitación de plataforma.
- **Dos patrones ARIA para el mismo rol "selección única":** `aria-pressed` en los slots de `agenda-step:265` vs `role="radiogroup"` en el score de `evaluacion-step:223`.

---

## 5. Tabla — salud de consistencia por dimensión

| Dimensión | Sub-dimensión | Veredicto | Nº outliers | Evidencia (muestra) |
|---|---|---|---|---|
| **D1 Adherencia** | tokens-vs-hardcode | `mixto` | ~4 clusters / ~12 sitios | sombras (4 valores), `w-[240px]`×3, `min-w` dispar, `min-h-[88px]` |
| | disciplina-color-B9 | `consistente` | 2 | `autosave-status` amber=error; `evaluacion` score-scale cyan/amber |
| | escala-tipo/spacing | `mixto` | 3 valores / 9 sitios | eyebrow `tracking` 0.18/0.2/0.24; `p-3.5` half-step |
| **D2 Reutilización** | primitivas base del kit | `consistente` | 0 | Card/Field/Select/Modal/EmptyState/StatCard/Badge bien reusados |
| | reuso de `Callout` | `inconsistente` | ~14 | cajas a mano en ficha/brief/evaluacion/opener/seguimiento/canal/guardrail/construccion(+teach/self-check) |
| | primitivas locales vs compartidas | `inconsistente` | 6 | TextArea, StatCard-a-mano, CopyBlock, Disclosure, progreso-semana, campo-mejora |
| | patrones copiados | `inconsistente` | 8 patrones | step-header ×9, option-card ×3, accent-bar ×4, rechazo ×3, superficie ×2, botones crudos, links |
| | near-duplicados | `mixto` | 3 | TextArea↔Input (alta), loading↔LoadingState, RechazoDetalle |
| **D3 Patrones** | patrón-forms | `consistente` | 3 (justificadas) | self-check sin zod, construccion stage-transition, agenda doble useTransition |
| | submit/loading/error | `mixto` | 5 (+1 mold split) | self-check Callout, agenda triple-render, Field-vs-`<p>` paralelos |
| | responsive | `consistente` | 0 reales | un solo árbol, `transform`, StepAnchor defensivo |
| | a11y estructural | `mixto` (2 huecos altos) | 5 huecos + 2 inconsist. | Field label/error (alta), aria-invalid, serverError sin aria-live, stepper sin aria-current |

---

## 6. Correcciones de la verificación adversarial — NO perseguir

El verificador refutó estos hallazgos del explorador. Se documentan para que la capa de planificación **no** los tome como leads:

1. **`layout.tsx:53` `tracking-[0.24em]` NO es el outlier.** El explorador invirtió la regla: `0.24em` **es** el token (`design-tokens.ts:162`), así que esa línea es el **único eyebrow correcto**. Los divergentes son los `0.18em` (5 sitios). La inconsistencia existe, pero la dirección estaba al revés.
2. **`home-sections.tsx:98` no es un hallazgo.** Se auto-anulaba ("NO hardcode") y la evidencia (`text-[11px]/text-[10px]`) era imprecisa — esos tamaños los definen igual las primitivas. No es outlier.
3. **`tool-guide.tsx:24` chip "Link pendiente" → `Badge` es un `expected` incorrecto.** `Badge` fuerza `uppercase tracking-wider` (inapropiado para una etiqueta-frase) y sus tonos no coinciden con el pill apagado `amber-200/80`. El concepto "pill amber pendiente" es real, pero el gemelo verdadero es el chip neutro de `HerramientaLauncher`/`MaterialesNegocio`, **no** `Badge`. Hallazgo débil, no media.
4. **`opener-step.tsx:212` `text-rose-400` NO es un outlier de color de error.** Es un **aviso inline** ("El opener va SIN link"), no el error de submit; el error real de opener usa `red-400` vía `Field`. Además `rose` **es** un token (`design-tokens.ts:88` `#f43f5e`), no hardcode. La convención real es **consistente**: `rose` = sub-dominio "rechazo/retrabajo/aviso"; `red-400` = "error de validación/guardado".
5. **Falsa alarma de tokens** "`overlay`/`sticky` podrían no existir": **existen** (`design-tokens.ts:229/231`) y se consumen correctamente vía `style`.

---

## 7. Verificación humana declarada y límites

- **Esto mide consistencia/organización del código**, no apariencia. Si la UI "se ve bien" es un juicio perceptual de Franco con la app a la vista — **no** está en este reporte.
- **Sin runtime:** los huecos de a11y de `Field`/`Input`/`TextArea` son objetivamente reales en el código, pero su **impacto** percibido requiere prueba con lector de pantalla/teclado. La ausencia de duplicación de árbol responsive tiene evidencia de código fuerte (un solo render + `transform` + la guarda defensiva de `StepAnchor`), pero no se confirmó en navegador. Los conteos de "formas distintas" son por lectura de clases/JSX, no por árbol renderizado.
- **No verificado internamente:** `Select.tsx` (el explorador afirma que usa `useId`+`aria-describedby`; no se re-confirmó) ni `Modal.tsx`/`Callout.tsx` línea-a-línea más allá de lo citado.
- **Tests de invariante:** no aplican — read-only, no se tocó lógica/aislamiento/transiciones/datos.
- **Cierre técnico:** no se corrió quality-gate/build/lint — no se modificó código.
