# Auditoría estructural — Zona del setter de LeadOS

> **Tipo:** diagnóstico estructural READ-ONLY. Insumo para un rediseño de UX.
> **Fecha:** 2026-06-23 · **Alcance:** `app/(protected)/setter/**` + fuentes de copy en `lib/leados/` (`guidance-content.ts`, `herramientas.ts`, `flow-content.ts`, `copy-blocks.ts`). **Fuera de alcance:** `admin/**`.
> **Método:** descubrimiento del árbol + 3 subagentes de exploración read-only en paralelo (home/cartera+cabina · wizard del lead · orientación/guía+copy), cada uno con un contrato de 5 dimensiones por pantalla; consolidación y cross-check del agente principal contra lectura directa de las 4 fuentes de copy.
> **Qué NO es:** no juzga si una pantalla "es intuitiva" ni "se ve bien" — eso es juicio perceptual de Franco con la app a la vista. No propone fixes ni rediseño: solo el diagnóstico objetivo. No se tocó código (cero diffs); no hay invariante que verificar porque no se escribió lógica.

---

## 1. Resumen del diagnóstico (objetivo, sin interpretación)

La zona del setter son **dos superficies de scroll vertical** (home/cartera y detalle del lead) sobre un **layout persistente** (topbar + rail), alimentadas por una **capa de contenido de 4 fuentes** (`guidance-content.ts`, `flow-content.ts`, `herramientas.ts`, `copy-blocks.ts`).

Tres hechos estructurales dominan el diagnóstico:

1. **Concentración de carga de guía en el wizard.** 4 de los 9 steps del detalle del lead superan el umbral de sobrecarga (~4+ bloques de guía o ~15+ líneas de prosa): **Construcción (22 líneas), Ficha (18), Self-check (16), Opener (14)**. El home, en cambio, no tiene ninguna pantalla sobrecargada (su único bloque grande, `OnboardingHint`, es descartable).
2. **Redundancia conceptual sistémica.** Tres reglas críticas del rol —*nunca cotizar*, *opener sin link/precio*, *flujo invertido (opener antes que demo)*— aparecen cada una en 3–4 lugares distintos (fuentes de copy + componentes en runtime). No es repetición literal en todos los casos, pero el setter recibe el mismo concepto desde varios ángulos en el mismo paso (caso extremo: `seguimiento-step` monta `TeachPanel id=objeciones` **y** `GuardrailRol` completo en el mismo Card, ambos portando "nunca cotizás → agendá la reunión").
3. **Cobertura de estados parcial y asimétrica.** Las páginas-ruta tienen vacío/error/carga (vía `loading.tsx`/`error.tsx`/`not-found.tsx`), pero **casi ninguna sección ni step individual tiene estado de error o de carga propios**: las funciones de datos son resilientes (devuelven vacío ante fallo) y el usuario no recibe feedback si una sección falla en silencio.

---

## 2. Inventario de pantallas

**41 vistas analizadas**, en tres bloques:

- **Bloque A — Home/Cartera + Cabina (12 vistas):** layout shell, home/cartera (page), HomeEmpty, loading, error, not-found, NovedadesPanel, ProgresoSemana, OnboardingHint, CarteraView, ContinuarCta, MisNumeros.
- **Bloque B — Wizard del lead (15 vistas):** page contenedora, loading, RecorridoStrip, DossierStepper, FichaStep, EvaluacionStep, OpenerStep, SeguimientoStep, AgendaStep, BriefStep, ConstruccionStep, DraftStep, SelfCheckStep, EscalarModal, LeadTimeline.
- **Bloque C — Componentes de guía + Fuentes de copy (14 piezas):** OnboardingHint*, ToolGuide, ToolsRail, EjemploIdeal·Ficha, EjemploIdeal·SelfCheck, CampoMejora, TeachPanel, ShortcutsHelp, GuardrailRol + las fuentes `guidance-content.ts`, `herramientas.ts`, `flow-content.ts`, `copy-blocks.ts`, `flow.ts`/`recorrido.ts`.

\* `OnboardingHint` se contabiliza en A (como sección del home) y se disecciona en C (como componente de guía).

**Notas de mapeo (discrepancias con el prompt):**
- No existe `decision-bar.tsx`. Lo que el prompt llama "decision-bar" es **`recorrido-strip.tsx`** — su función real es navegación secuencial entre leads de una cola (prev/next), **no** decisiones sobre el dossier.
- Fuente de copy extra no nombrada en el prompt: **`copy-blocks.ts`** (capa de armado de inputs para las IAs externas), incluida en el análisis.

---

## 3. Tabla resumen

Convenciones: **Guía** = nº de bloques de guía/instrucción · **Prosa** = líneas aprox. de texto instructivo · **Faltan** = estados ausentes (V=vacío, E=error, C=carga) · **Nav** = nº de decisiones de navegación ofrecidas · **⚠** = SOBRECARGADA.

### Bloque A — Home / Cartera + Cabina

| Pantalla | Guía | Prosa | Faltan | Nav | ⚠ |
|---|---:|---:|---|---:|:--:|
| Layout shell (topbar + rail + ToolsRail) | 0 | 0 | V·E·C | 3 | |
| Home / Cartera (`page.tsx`) | 2 | 2 | — | 2 | |
| HomeEmpty (vacío sin leads) | 1 | 2 | E·C | 0 | |
| Loading skeleton (`loading.tsx`) | 0 | 0 | V·E | 0 | |
| Error boundary (`error.tsx`) | 0 | 1 | V·C | 1 | |
| Not-found (`not-found.tsx`) | 0 | 1 | V·C | 1 | |
| NovedadesPanel | 0 | 2 | E·C | 4 | |
| ProgresoSemana | 0 | 0 | E·C | 0 | |
| OnboardingHint (home) | 1 | 13 | E·C | 1 | |
| CarteraView (lista + marcador + grupos) | 1 | 7 | E·C | 6 | |
| ContinuarCta | 0 | 0 | E·C | 1 | |
| MisNumeros | 0 | 4 | E·C | 0 | |

### Bloque B — Wizard del lead

| Pantalla | Guía | Prosa | Faltan | Nav | ⚠ |
|---|---:|---:|---|---:|:--:|
| Page contenedora (`page.tsx`) | 1 | 2 | V·E | 2 | |
| Loading skeleton (`loading.tsx`) | 0 | 0 | V·E | 0 | |
| RecorridoStrip (barra de cola) | 1 | 2 | E·C | 3 | |
| DossierStepper | 0 | 0 | V·E·C | 0 | |
| **FichaStep — Paso 1** | **4** | **18** | V·C | 1 | **⚠** |
| EvaluacionStep — Paso 2 | 3 | 10 | V·C | 1 | |
| **OpenerStep — Primer contacto** | **5** | **14** | V·C | 2 | **⚠** |
| SeguimientoStep — Seguimiento/envío | 4 | 12 | C | 3 | |
| AgendaStep — Agendar reunión | 2 | 6 | V | 1 | |
| BriefStep — Paso 3 | 2 | 5 | V·C | 1 | |
| **ConstruccionStep — Paso 4** | **5** | **22** | V·C | 3 | **⚠** |
| DraftStep — Publicar el draft | 2 | 6 | V·C | 1 | |
| **SelfCheckStep — Self-check** | **4** | **16** | V·C | 2 | **⚠** |
| EscalarModal | 1 | 3 | V | 2 | |
| LeadTimeline | 1 | 2 | E·C | 0 | |

### Bloque C — Componentes de guía + Fuentes de copy

> Los componentes de guía son overlays/bloques inline (no pantallas-ruta); las fuentes de copy no son UI (estados/nav = N/A). "Prosa" en las fuentes mide volumen de contenido, no prosa de una sola pantalla.

| Pieza | Guía | Prosa | Faltan | Nav | ⚠ |
|---|---:|---:|---|---:|:--:|
| OnboardingHint (componente) | 1 | 14 | V·E·C | 2 | |
| ToolGuide | 1 | 4 | V·E·C | 1 | |
| ToolsRail (nav persistente) | 1 | 5 | V·E·C | 5 | |
| EjemploIdeal · FichaEjemplo | 1 | 12 | V·E·C | 0 | |
| EjemploIdeal · SelfCheckEjemplo | 1 | 5 | V·E·C | 0 | |
| CampoMejora (nudge on-blur) | 1 | 1 | V·E·C | 0 | |
| TeachPanel | 1 | 6 | V·E·C | 0 | |
| ShortcutsHelp | 1 | 0 | V·E·C | 1 | |
| GuardrailRol | 1 | 3 | V·E·C | 0 | |
| `guidance-content.ts` (fuente) | 9 | ~80 | N/A | N/A | **⚠** |
| `flow-content.ts` (fuente) | 7 | ~55 | N/A | N/A | **⚠** |
| `herramientas.ts` (fuente) | 5 | ~20 | N/A | N/A | |
| `copy-blocks.ts` (fuente) | 0 | ~8 | N/A | N/A | |
| `flow.ts` / `recorrido.ts` (lógica) | 0 | 2 | N/A | N/A | |

---

## 4. Top de pantallas más recargadas (ordenado)

**Runtime (lo que el setter ve):**

1. **ConstruccionStep — 5 bloques / 22 líneas (la más recargada del sistema).** Apila, en una sola vista: `UrgenciaBanner` (condicional) + `GuiaRetrabajo` (condicional, el rechazo del admin) + párrafo de encuadre + `TeachPanel` (2 porqués + 2 ejemplos) + `ToolGuide` + `CopyBlock` + `MaterialesNegocio` + **la lista de 6 fases del `SHELL_CONSTRUCCION` (6 × 3 = 18 ítems instructivos)** + nota de guardado + `EscalarModal`. El setter recibe ~25 instrucciones de acción antes de poder hacer nada. Además el Badge "Guía preliminar — en validación" advierte que el contenido puede cambiar.
2. **FichaStep — 4 bloques / 18 líneas.** Párrafo intro + `FichaEjemplo` colapsable (ficha modelo completa) + hints de los 6 campos (siempre visibles) + hasta 5 nudges `CampoMejora` on-blur simultáneos si todos los campos quedan flojos + banner de validación en vivo.
3. **SelfCheckStep — 4 bloques / 16 líneas.** `TeachPanel` (porqués + ejemplos) **y** `SelfCheckEjemplo` (artefacto modelo) montados consecutivamente enseñando el mismo mensaje ("probar de verdad") + 6 `HARD_CHECKS` (cada uno con cómo-verificar y arreglo) + 4 `SOFT_CHECKS` + callout de estado.
4. **OpenerStep — 5 bloques / 14 líneas.** Encuadre + banner caliente (condicional) + `TeachPanel` + `CanalSeguridad` + `GuardrailRol` compacto. Riesgo añadido: dos `CopyBlock` cyan (input del Gem + opener listo) pueden coexistir y competir visualmente.
5. **SeguimientoStep — 4 bloques / 12 líneas.** El paso con más variantes de estado (5 sub-estados visuales): `CanalSeguridad` + `GuardrailRol` completo (con guion) + `TeachPanel id=objeciones` dentro de un `<details>`. Carga latente alta aunque parte esté plegada.
6. **OnboardingHint (home) — 1 bloque grande / 13 líneas.** 4 tarjetas de concepto + callout de énfasis. Mitigado por ser descartable (localStorage), pero coexiste con NovedadesPanel + ProgresoSemana antes de llegar a las cards.

**Fuentes de copy (volumen de contenido, no pantalla):**

- **`guidance-content.ts` — 9 bloques / ~80 líneas.** Concentra GUIA_FICHA (paso-formulario completo) + 5 bloques teach-only + 2 ejemplares + el registro. Es la fuente única de guía por diseño; su tamaño es esperado, pero es el mayor reservorio de prosa instructiva del sistema.
- **`flow-content.ts` — 7 bloques / ~55 líneas.** Mezcla contenido instructivo (`SHELL_CONSTRUCCION`, `CANAL_INSTAGRAM`, `GUARDRAIL_ROL`) con contenido funcional (`STATUS_LABELS`/`STAGE_LABELS`). La frontera "guía vs parámetro editable" no es nítida (ver §5).

---

## 5. Mapa de duplicación

### 5.1 Conceptos repetidos entre fuentes de copy (raíz de la redundancia)

| Concepto | Fuentes donde vive | Dónde lo ve el setter en runtime |
|---|---|---|
| **"Nunca cotizás ni negociás → agendá la reunión"** | `GUARDRAIL_ROL` (flow-content) · `GUIA_OBJECIONES` (guidance-content) · `buildObjecionInputBlock` (copy-blocks). El guion es **casi verbatim** en dos de ellas: `GUARDRAIL_ROL.guion` ("…de los números y los detalles se encarga el equipo… reunión cortita… ¿mañana o pasado?") vs `GUIA_OBJECIONES.ejemplos.asiSi` ("De los números se encarga el equipo en una reunión cortita — ¿te queda mejor mañana o pasado?"). | `GuardrailRol` compacto en Opener + `GuardrailRol` completo en Seguimiento + `TeachPanel id=objeciones` en el **mismo Card** de Seguimiento. |
| **"Opener sin link / sin precio (el link va en el 2º mensaje)"** | `GUIA_OPENER` (guidance-content) · `CANAL_INSTAGRAM.disciplina[2]` (flow-content) · `buildOpenerInputBlock` (copy-blocks) · texto de `PLANTILLAS_FOLLOW_UP` (comentario) | Encuadre del Opener + hint del campo de caracteres + aviso de link detectado + `GuardrailRol` + `OnboardingHint` (home). **Hasta 4–5 superficies.** |
| **"Flujo invertido: opener antes que demo"** | `GUIA_OPENER.porque` + `GUIA_CONSTRUCCION.porque` (guidance-content) | `OnboardingHint` (4 tarjetas, home) + `TeachPanel` en Opener + `TeachPanel` en Construcción. |
| **"Assets reales del negocio (logo/fotos, no stock)"** | `GUIA_CONSTRUCCION.ejemplos` (guidance-content) · `SHELL_CONSTRUCCION` fase "Assets reales" (flow-content) · `HARD_CHECKS.datosReales` (flow-content) · `buildConstruccionBlock` (copy-blocks) | `TeachPanel` **y** la fase del shell **en el mismo `ConstruccionStep`**; reaparece como hard-check en Self-check. |
| **"Fiel al brief / el brief es el plano"** | `SHELL_CONSTRUCCION` ("no agregues secciones que el brief no pide") · `HARD_CHECKS.fielAlBrief` · `GUIA_CONSTRUCCION` (porque + ejemplo "Fidelidad al brief") | Construcción (shell + TeachPanel) + Self-check (hard-check). |
| **"Verificar de verdad: celular + incógnito + tocar WhatsApp"** | `GUIA_SELF_CHECK.ejemplos` + `GUIA_SELF_CHECK_EJEMPLAR.lineas` (guidance-content) · `HARD_CHECKS` `carga`/`mobile`.comoVerificar (flow-content) | `TeachPanel` **y** `SelfCheckEjemplo` consecutivos + los 6 HARD_CHECKS, todo en `SelfCheckStep`. |
| **"CTA de WhatsApp con número real (wa.me)"** | `SHELL_CONSTRUCCION` fase "CTA de WhatsApp" · `HARD_CHECKS.linksWhatsapp` · `GUIA_CONSTRUCCION.ejemplos` | Construcción (shell + TeachPanel) + Self-check (hard-check). |
| **Frontera difusa guía/parámetro** | `GUARDRAIL_ROL.jugada` (flow-content) y `GUIA_OBJECIONES.porque` (guidance-content) son **dos representaciones del mismo concepto en dos archivos hermanos**. No hay decisión explícita de propiedad única por concepto. | — |

### 5.2 Duplicación de datos en runtime (mismo dato, dos lugares en la misma carga)

- **Conteo de novedades sin leer:** badge en el topbar del layout (persistente en toda la zona) **y** badge en el header del `NovedadesPanel` del home. Además son **dos queries distintas a la misma tabla** por request: `contarNovedadesSinLeer` (layout) y `getNovedadesSetter→totalSinLeer` (page).
- **El primer lead de "trabajar" aparece 3 veces dentro de `CarteraView`:** como `ContinuarCta` al tope, como primera `LeadCard` del grupo "Para trabajar ahora", y como destino del botón "Recorrer" de ese grupo. Su `proximaAccion` y su motivo de orden se repiten en el CTA y en la card.
- **Rechazo del admin (motivo/dónde/arreglo):** se muestra dos veces en la misma vista del lead — como `Callout` en `LeadWizard` (orquestador) y como `GuiaRetrabajo` dentro de `ConstruccionStep`.
- **`CanalSeguridad` (contador de DMs + tope):** idéntico en `OpenerStep` y `SeguimientoStep` (mismo componente, mismo prop, sin variación contextual).
- **Links externos del negocio (IG/Maps/web):** en el header de la page del lead y otra vez como chips en `MaterialesNegocio` dentro de `ConstruccionStep`.
- **Nombres de los pasos:** en el `DossierStepper` (5 macropasos) y otra vez como `h2` de cada step; además `herramientas.ts.dondeSeUsa` ("Paso 2 · Evaluación", etc.) re-rotula el mismo paso, triplicando la señal del paso activo.
- **Nombre de cada herramienta:** en el `ToolsRail` (nav persistente, siempre visible) y otra vez en el `ToolGuide` inline del step que la usa.

### 5.3 Patrón estructural repetido sin diferenciación visual

- **"Copiar bloque → pegar en herramienta externa → traer resultado"** se repite **idéntico en 3 steps consecutivos**: Ficha→Evaluador, Brief→Gem de diseño, Construcción→Claude Design — misma disposición `CopyBlock` + `ToolGuide`, sin nada que distinga visualmente los tres flujos entre sí.
- **Doble enseñanza por paso:** `TeachPanel` (por qué + ejemplos contrastados) y `EjemploIdeal` (artefacto modelo) se montan consecutivos en el mismo paso (Ficha y Self-check), cubriendo el mismo criterio desde dos formatos.

---

## 6. Inventario de estados faltantes

Patrón general: **cobertura completa solo a nivel de página-ruta** (`page.tsx` del home y `page.tsx`/`loading.tsx` del lead). A nivel de sección y de step, error y carga están casi siempre ausentes.

**Home/Cabina — secciones sin estado de error ni carga propios** (fallan en silencio devolviendo vacío):
- `NovedadesPanel` — falta E·C (si `getNovedadesSetter` falla, devuelve vacío y el panel no renderiza; el usuario no se entera).
- `ProgresoSemana` — falta E·C.
- `MisNumeros` — falta E·C.
- `ContinuarCta` — falta E·C.
- `CarteraView` — falta E·C (depende del error/loading de la page).
- `HomeEmpty` — falta E·C; además **0 acciones disponibles**: ningún CTA, sin forma de avisar a Franco; el "qué sigue" depende enteramente de Franco.
- Layout shell — falta V·E·C (no tiene manejo de borde para la query del badge).

**Wizard — steps sin estado de vacío ni carga propios:**
- Todos los steps dependen del skeleton de `loading.tsx` de la page, que **solo simula 3 bloques** aunque el wizard puede mostrar 8+ → posible layout shift; tampoco simula `RecorridoStrip`.
- `FichaStep`, `EvaluacionStep`, `OpenerStep`, `BriefStep`, `ConstruccionStep`, `DraftStep`, `SelfCheckStep` — falta V·C (los estados "apagado/locked" comunican indisponibilidad, pero no son estados-vacío de "no hay datos"; ningún step tiene skeleton ni indicador de carga entre submits salvo el prop `loading` de los botones).
- `SeguimientoStep` — falta solo C.
- `AgendaStep` — falta solo V.
- `LeadTimeline` — falta E·C (si `listOwnedLeadTimeline` falla, cae toda la page; no tiene skeleton propio).
- `DossierStepper` — falta V·E·C (indicador puro; aceptable por naturaleza).

**Skeletons que no espejan el contenido real** (riesgo de layout shift):
- Home `loading.tsx`: simula header + grid de 5 stat cards + 1 sección, pero **no** simula NovedadesPanel, ContinuarCta ni OnboardingHint.
- Lead `loading.tsx`: simula 3 steps; el real puede tener 8+, y omite el `RecorridoStrip` del modo-cola.

**Componentes de guía y fuentes de copy:** sin estados por diseño (presentacionales puros / contenido estático). Constatado, no es hallazgo de borde.

---

## 7. Observaciones de navegación / foco

**Dónde hay exceso de elección o dispersión:**
- **`CarteraView` (6 decisiones de navegación) — el punto más disperso.** Múltiples caminos que llegan **al mismo destino** (el detalle del lead) por rutas conceptualmente distintas: click en card, botón "Recorrer" (×grupo), `ContinuarCta`, atajo de teclado `r`. Flexibilidad operativa, pero sin un único "qué sigue" destacado cuando hay leads en varios grupos.
- **`ToolsRail` (5) y `NovedadesPanel` (4):** muchos targets de salida (5 herramientas externas; hasta 12 avisos + demos en cola). El rail no da "qué sigue" — solo accesos.
- **`RecorridoStrip` (3), `SeguimientoStep` (3), `ConstruccionStep` (3), layout (3).**

**Dónde el "qué sigue" NO está claro** (`navQueSigueClaro = false`):
- **`HomeEmpty`** — 0 acciones; el siguiente paso depende de Franco, no del usuario.
- **`CarteraView`** — 6 salidas al mismo lugar, sin jerarquía única de "trabajá esto ahora".
- **`OnboardingHint`** — tras descartar, deja al usuario en el home sin indicación de próximo paso.
- **`SeguimientoStep`** y **`ConstruccionStep`** — pasos de alta densidad con varias salidas (herramienta externa, registrar, escalar) sin un avance único señalizado.
- **`ToolsRail`** y **layout shell** — accesos sin destino de flujo.

**Dónde el foco SÍ es claro:**
- `ContinuarCta` — un solo destino (re-entrada al lead trabajable). Es la pieza con la intención de "qué sigue" más nítida del home.
- Estados de error/not-found — un único camino (Reintentar / Volver a tu cartera).
- La mayoría de los steps del wizard tienen un único CTA de avance (Guardar / Registrar / Confirmar).

**Modelo de navegación del wizard:** es **scroll vertical, no tabs ni rutas**. `StepAnchor` hace scroll al paso activo al cargar, pero:
- El `DossierStepper` solo cubre **5 macropasos**, mientras el wizard renderiza **9 steps** → no hay índice de saltos ni indicador de "cuál step requiere atención ahora" para los 4 steps que el stepper no representa.
- Entrada/salida del detalle: link "Volver a tu cartera" en el header + prev/next del `RecorridoStrip` solo en modo-cola (`?cola=`).

---

## 8. Apéndice — Composición vertical por pantalla

> Orden de arriba hacia abajo. Una línea por componente. (Detalle estructural completo; las dimensiones cuantitativas están en §3.)

### A. Home / Cartera + Cabina

**Layout shell** — `layout.tsx` + `setter-shell.tsx` + `setter-nav.tsx`
1. Topbar (server): marca LeadOS + badge novedades sin leer + chip de usuario + logout.
2. SetterShell (client): grilla rail 240px + área scrolleable; drawer mobile.
3. SetterNav: rail con sección "Trabajo" (único ítem "Cartera") + ToolsRail.
4. ToolsRail: 5 herramientas externas (estado "pendiente" para URLs sin configurar).

**Home / Cartera** — `page.tsx`
1. PageHeader (eyebrow "LeadOS", título "Tu cartera", desc "Laburá de arriba para abajo…", ícono Radar).
2. NovedadesPanel (solo si hay avisos o demos en cola).
3. ProgresoSemana (se oculta si total === 0).
4. OnboardingHint (descartable por localStorage).
5. HomeEmpty **o** CarteraView (rama exclusiva por `homeLeads.length`).
6. MisNumeros (solo si hay leads).

**HomeEmpty** — `home-empty.tsx`: EmptyState lg (Inbox + "Todavía no tenés leads asignados" + 2 líneas sobre que Franco asigna).

**Loading** — `loading.tsx`: skeleton header (3 líneas) + grid 5 cols + sección 4 cards.

**Error** — `error.tsx`: EmptyState lg (AlertTriangle + "No es culpa tuya…" + botón Reintentar→reset()).

**Not-found** — `not-found.tsx`: EmptyState lg (SearchX + "Ese lead no está en tu cartera" + CTA "Volver a tu cartera").

**NovedadesPanel** — `novedades-panel.tsx`
1. Header (Bell + "Novedades" + badge sin-leer + subtítulo + "Marcar como vistas").
2. Lista de AvisoItem (hasta 12: ícono + título + body + timestamp + "Abrir").
3. Sección "Tus demos esperando a Franco" (demos EN_REVISION, si hay).
4. MarcarVistoButton (action + router.refresh + toast).

**ProgresoSemana** — `progreso-semana.tsx`: label "Tu semana" + fila de métricas con valor > 0 (contactos/demos/reuniones) + label "últimos N días".

**OnboardingHint** — `onboarding-hint.tsx`
1. Header (eyebrow "Antes de tu primer lead" + h2 "Cómo funciona el flujo invertido" + X).
2. Grid 2×2 de 4 tarjetas (score / frío=opener primero / la espera / caliente=demo preventiva).
3. Callout con Megaphone (orden demo/opener).
4. Botón "Entendido, no lo muestres más".

**CarteraView** — `cartera-view.tsx`
1. ContinuarCta (re-entrada, si existe).
2. "De un vistazo" (5 StatCards).
3. CarteraToolbar (buscar + estado + orden; count + "Limpiar" al filtrar).
4. Resultados filtrados (o "Ningún lead coincide con eso.").
5. GroupSection "Fijados por vos" (si hay) — con "Recorrer".
6. GroupSection "Para trabajar ahora" — carril principal con "Recorrer".
7. GroupSection "Esperando revisión".
8. GroupSection "En seguimiento".
9. GroupSection "Agendadas".
10. CollapsibleSection "Pausados por vos".
11. ArchiveSection "Descartados y perdidos".
12. Link oculto (ancla atajo `r`) + ShortcutsHelp.

**ContinuarCta** — `continuar-cta.tsx`: Link de superficie completa → `/setter/leads/[id]?cola=trabajar` (PlayCircle + "Continuá donde dejaste" + negocio + próximaAcción + motivo de orden + ArrowRight hover).

**MisNumeros** — `mis-numeros.tsx`: label "Mis números" + Card "Leads activos" (Layers + activos/enCartera) + Card "Mi criterio · descarte vs avance" (Scale + % descarte + barra + ventana 30d, o "Todavía no evaluaste leads").

### B. Wizard del lead

**Page contenedora** — `leads/[leadId]/page.tsx`
1. RecorridoStrip (sticky, solo si `?cola=`).
2. `<header>`: Link volver + h1 + badges (estado/stage) + meta + chips de links + notas + banner de asignación.
3. LeadWizard (orquesta todos los steps).
4. LeadTimeline.

**Loading** — `loading.tsx`: skeletons (breadcrumb, h1, meta, stepper, 1 step grande, 2 steps chicos).

**RecorridoStrip** — `recorrido-strip.tsx`: ancla atajo `b` + `<nav>` (cola + "Lead X de N") + NavBtn anterior + NavBtn siguiente + ShortcutsHelp. *(Función real: navegación secuencial, no "decision-bar".)*

**DossierStepper** — `dossier-stepper.tsx`: `<ol>` de 5 macropasos (Ficha/Evaluación/Brief/Construcción/Revisión) con estado hecho/actual/pendiente/bloqueado.

**FichaStep** — `ficha-step.tsx`: h2 + intro + badge duración + FichaEjemplo (colapsable) + 6 Fields (cada uno con hint; 5 con CampoMejora on-blur) + banner faltantes/completo + error servidor + Guardar + AutosaveStatus + CopyBlock (si ficha completa).

**EvaluacionStep** — `evaluacion-step.tsx`: h2 + encuadre + ToolGuide(evaluador) + bloque "Qué mira el Evaluador" (5 criterios) + Score (radiogroup) + Veredicto (select) + Razonamiento + banner descarte auto + error + Registrar + modal descarte + nota score-3 gate cerrado.

**OpenerStep** — `opener-step.tsx`: h2 + badge Caliente + encuadre + banner caliente + TeachPanel(opener) + CanalSeguridad + ToolGuide(gemOutreach) + CopyBlock input + Field opener + aviso link detectado + CopyBlock opener listo + GuardrailRol compacto + Registrar.

**SeguimientoStep** — `seguimiento-step.tsx`: h2 + badge status + panel de cadencia + panel de envío de demo (3 variantes) + CopyBlock 2º mensaje + 4 botones de resultado + Field fecha reactivación + Field nota + Registrar + CopyBlock follow-up + CanalSeguridad + GuardrailRol completo + `<details>` objeciones (TeachPanel + CopyBlock).

**AgendaStep** — `agenda-step.tsx`: h2 + badge "Listo para agendar" + TeachPanel(traspaso) + checkbox "hablo con quien decide" + hint del decisor + Buscar horarios + CopyBlock horarios + grid de slots + panel de confirmación (nombre/email/notas) + Confirmar y agendar.

**BriefStep** — `brief-step.tsx`: h2 + encuadre + ToolGuide(gemDiseno) + CopyBlock + Field pegadoGem + título + CTA + secciones + concepto + notasMarca + error + Guardar/Cancelar + AutosaveStatus.

**ConstruccionStep** — `construccion-step.tsx`: h2 + badge "Guía preliminar" + UrgenciaBanner + GuiaRetrabajo (rechazo admin) + encuadre + TeachPanel(construccion) + ToolGuide(claudeDesign) + CopyBlock + MaterialesNegocio + `<ol>` 6 fases del SHELL + nota guardado + EscalarModal.

**DraftStep** — `draft-step.tsx`: h2 + encuadre (publicar ≠ enviar) + ToolGuide(netlifyDrop) + `<ol>` 4 instrucciones + Field URL + toggle "abrí y carga" + Guardar/Cancelar.

**SelfCheckStep** — `self-check-step.tsx`: h2 + encuadre + TeachPanel(selfCheck) + SelfCheckEjemplo + bloque Obligatorios (6 HARD_CHECKS) + bloque Ojo de diseño (4 SOFT_CHECKS) + callout estado + Guardar/Enviar a revisión.

**EscalarModal** — `escalar-modal.tsx`: botón trigger "Me trabé — avisar a Franco" + modal (título + desc) + Field "¿qué intentaste?" + Cancelar/Enviar.

**LeadTimeline** — `lead-timeline.tsx`: Card (History + h2 + subtítulo) + empty state (si 0 eventos) + `<ol>` de TimelineRow (eventos comerciales y de sistema).

### C. Componentes de guía + fuentes (resumen)

- **ToolGuide** — wrapper + header (Wrench + nombre + HerramientaLauncher) + `<details>` (queEs/queLeDas/queTeDevuelve) + aviso amber si `url=null`. Se monta inline en 6 steps (en Construcción **dos veces**, estados BRIEF y CONSTRUCCION).
- **ToolsRail** — nav persistente + label "Tus herramientas" + lista de 5 (nombre + dondeSeUsa + link/pendiente).
- **EjemploIdeal** (FichaEjemplo / SelfCheckEjemplo) — `<details>` colapsable + título + porqué + `<dl>`/`<ul>` del artefacto modelo. Contenido de `guidance-content.ts`.
- **CampoMejora** — `<p role=status>` nudge on-blur (Lightbulb + `.mejora` del campo). Se monta en 5 campos de la ficha.
- **TeachPanel** — `<details>` (o inline) "Por qué importa" + porqués (LineaRica) + ejemplos esto-sí/esto-no. Se instancia 6× (opener, construcción, selfCheck, objeciones, traspaso…).
- **ShortcutsHelp** — pastilla fija (Keyboard + "?") + panel de atajos. Se monta en CarteraView y RecorridoStrip (sets de atajos distintos).
- **GuardrailRol** — modo compacto (1 línea) y completo (regla + jugada + guion copiable). Fuente: `GUARDRAIL_ROL` de `flow-content.ts`.
- **Fuentes:** `guidance-content.ts` (guía por paso, fuente única) · `herramientas.ts` (5 herramientas externas; 4/5 con `url=null`) · `flow-content.ts` (SHELL/HARD/SOFT/CANAL/GUARDRAIL/PLANTILLAS + STATUS/STAGE_LABELS) · `copy-blocks.ts` (armado de inputs para IAs externas) · `flow.ts`/`recorrido.ts` (lógica pura + re-export; COLA_LABELS).

---

## 9. Constancias de método

- **Read-only:** no se editó, formateó ni creó ningún archivo de código. La única escritura es este reporte (`docs/auditoria-ux-setter.md`).
- **Sin ejecución:** no se levantó server, no se usó browser/Playwright, no se tocó la BD, no se corrió build/migraciones/seeds.
- **Verificación humana declarada:** este diagnóstico mapea **estructura** (composición, densidad, duplicación, estados, navegación). El juicio perceptual ("¿es intuitiva?, ¿se ve bien?") queda para Franco con la app a la vista, en una pasada posterior.
- **Tests de invariante:** no aplican — pasada read-only, no toca lógica, aislamiento multi-tenant, transiciones ni datos.
- **Cierre técnico:** no se corre quality-gate/build/lint — no se tocó código, no hay nada que gatear.
- **Sin recomendaciones:** los hallazgos se reportan; las decisiones de rediseño las toma la capa de planificación.
