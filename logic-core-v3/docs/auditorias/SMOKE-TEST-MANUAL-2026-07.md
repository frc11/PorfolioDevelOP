# Smoke-test exhaustivo del manual — Sprint 7.0 · 2026-07-04

> **Método.** Recorrido read-only de las 16 pantallas del manual (m1–m16) + la reentrada del re-loop (mr) + los 2 estados de espera (`espera`/`revision`), vía workflow multi-agente: 9 grupos de exploración por fase/pantalla + 2 pasadas cross-cutting (vocabulario 2.x entre pantallas, y asimetría form-extraído vs write-path) corriendo en paralelo, seguidos de una **triage adversarial** que releyó cada candidato "trivial-seguro" línea por línea antes de aceptarlo. 11 agentes de recorrido + 16 agentes de triage = 27 agentes, ~265 lecturas de archivo.
>
> **Nota metodológica.** La vara referenciada en la instrucción del sprint (`docs/brief-vision-flujo-setter.md`) no existe en el repo bajo ese nombre — no se encontró por ese nombre ni por contenido (`grep` global sin resultados). Se usó como vara el contrato vigente (`src/lib/leados/manual.ts`, `_data.ts`), el vocabulario 2.x ya establecido en los Bloques 2–6 (`bitacora-beta-3.md`, `MEMORY.md`) y la disciplina de color B9. Se deja anotado para que Franco confirme si el archivo debía existir con otro nombre/ubicación.
>
> **Resultado.** 41 hallazgos crudos → 2 confirmados como trivial-seguros tras triage (aplicados, ver Fase 2) → 39 en categoría (b), reportados abajo con evidencia, severidad y recomendación. Motor, gates y línea de envío quedaron intactos (no se tocó ninguno).

---

## 1. Resumen ejecutivo

- **El hallazgo más serio (severidad alta):** el hint compartido del campo score en `guidance-content.ts:347` (`GUIA_EVALUACION.campos.score.hint`) sigue diciendo *"4-5 marca el lead como caliente"*, contradiciendo la propia decisión de diseño de M3 (el caliente del Evaluador solo **sugiere** prioridad; el caliente operativo lo marca Franco). M3 lo sobrescribe con su propio texto y el setter no lo ve mal ahí — pero la fuente base queda desalineada con la regla de negocio vigente. Ver [§3](#3-m2--m3--evaluación).
- **m4 (Opener) no arrojó ningún hallazgo** — pantalla limpia contra los 7 lentes.
- **Un bug de comportamiento real encontrado y no clasificado como trivial:** en la pantalla de reentrada `mr`, `NavConstruccion` (el rail de las 6 fases) se renderiza igual que en m7–m12, porque `PANTALLAS.mr.fase === 'construccion'` (ver [§6](#6-m7-m12--mr--construcción-y-reentrada-del-re-loop)). No rompe el aislamiento ni los gates (m7–m12 ya están en `habilitadas` para RECHAZADA), pero puede ser una superficie no-intencional en la pantalla que el propio código documenta como "no lleva munición ni registro propios".
- **Referencias muertas al wizard viejo (Sprint 5.6, "el corte") sobreviven en 4 lugares** — mensajes de error server-side y un comentario de shell que hablan de "Paso 7", "Paso 10", "Paso 5", "paso anterior" y "pantalla real la llena al migrar", vocabulario que el manual retiró. Ver [§4](#4-m5--seguimiento), [§7](#7-m13--m14--borrador-y-chequeo-final), [§10](#10-shell-compartido-estados-y-auxiliares), [§11](#11-cross-cutting--vocabulario-2x).
- **Asimetría real entre familias de forms:** `ChequeoForm` y `EnvioForm` (m14, m15) son los únicos de las 16 pantallas que no muestran el error del server inline (solo `toast.error`), mientras el resto de ambas familias (form-extraído y write-path) sí lo hace. Raíz estructural: no usan el hook `useStepAction` que el resto ya adoptó. Ver [§12](#12-cross-cutting--asimetría-form-extraído-vs-write-path).
- **Accesibilidad:** falta `role="alert"` en mensajes de error ya-tintados como error es un patrón que atraviesa ~9 archivos de ambas familias + el componente compartido `Field.tsx` — se resolvieron los 2 casos que la triage confirmó como aislados y de una sola solución (ver Fase 2); el resto queda en (b) porque requiere decidir entre parchear archivo por archivo o mover la responsabilidad a `Field.tsx` (que tiene 33 consumidores en todo el repo).

---

## 2. Fase 2 — Arreglos trivial-seguros aplicados

De 16 candidatos propuestos como categoría (a), la triage adversarial confirmó **2**:

| # | Archivo:línea | Fix | Motivo del descarte de los otros 14 |
|---|---|---|---|
| 1 | [`manual/_components/seguimiento-form.tsx:159`](../../src/app/(protected)/setter/leads/[leadId]/manual/_components/seguimiento-form.tsx) | Agregado `role="alert"` al `<p>` de error, ya tintado `text-red-400` | — |
| 2 | [`_components/brief-form.tsx:200`](../../src/app/(protected)/setter/leads/[leadId]/_components/brief-form.tsx) | Agregado `role="alert"` al `<p>` de error de servidor | — |

Los 14 restantes fueron reclasificados a (b) porque: tocaban un componente compartido con múltiples consumidores (`Field.tsx`, 33 usos), admitían más de una solución razonable (p. ej. `role="alert"` puntual vs. mover la responsabilidad al componente base; `aria-labelledby` vs. agregar `id` a `Field`), o el síntoma vivía sobre contenido de negocio/copy editable (`SHELL_CONSTRUCCION`, `GUIA_DRAFT`) — todos casos que la regla del sprint marca como (b) por definición. El detalle de cada reclasificación queda en el log del workflow (no se repite acá para no inflar el informe).

**Verificación de estos 2 fixes:** son atributos ARIA puros (sin cambio de copy, comportamiento, gates ni motor) — no producen ninguna diferencia visual, por lo que no aplica la verificación por screenshot/browser (nada que capturar). Se verifican por: (a) precedente idéntico ya existente en `opener-form.tsx` para el mismo patrón, (b) `tsc`/build verdes post-cambio (Fase 4), (c) lectura directa de ambas líneas antes de editar.

---

## 3. m2 + m3 — Evaluación

| Archivo:línea | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| `src/lib/leados/guidance-content.ts:347` | **Alta** | `GUIA_EVALUACION.campos.score.hint` dice "4-5 marca el lead como caliente", contradiciendo el propio diseño de M3 (el comentario de `m3-veredicto.tsx:26-30` dice explícitamente que el caliente del Evaluador solo *sugiere* prioridad — el caliente operativo lo marca Franco). M3 sobrescribe el hint con `TEXTOS_M3.scoreHint` ("sugiere prioridad"), así que el setter en M3 no ve el texto contradictorio — pero la fuente base sigue afirmando lo contrario, y cualquier otra pantalla/consumidor futuro que no parametrice heredaría el texto viejo. | Corregir el hint base en `guidance-content.ts:347` para que hable de "sugiere prioridad", alineando la fuente única con la regla de negocio vigente. |
| `_components/evaluacion-form.tsx:223` (+ `:211`) | Media | M3 parametriza `scoreHint`/`veredictoHint`/`veredictoLabels` vía `textos` para desacoplarse del wizard, pero el título/detalle del gate de descarte y el hint de razonamiento siguen tomados directo de `GUIA_EVALUACION` sin pasar por ese objeto. No es un bug funcional hoy (texto neutral), pero si se re-lenguajea el gate de descarte para el manual, quedaría fuera de esa migración sin que nadie se acuerde. | Extender `EvaluacionTextos` para cubrir `gate.titulo`/`gate.detalle`/`razonamiento.hint`, o documentar explícitamente por qué esos dos quedan fuera del patrón de parametrización. |
| `manual/_components/m2-evaluador.tsx:73` | Baja | `M2Registro`, cuando la evaluación ya está registrada, solo ofrece un link "Ver el veredicto" en vez de un resumen de una línea (score/veredicto) que el dossier ya tiene guardado — recibe solo el booleano `evaluada`, no la `Evaluacion`. | Decisión de UX: si vale la pena, pasar `Evaluacion` (o score+veredicto) a `M2Registro` para mostrar un resumen corto en vez de forzar un clic extra a m3. |
| `_components/evaluacion-form.tsx:161` | Baja | El `radiogroup` de score define su propio `aria-label="Score de la evaluación"` en vez de asociarse con `aria-labelledby` al label visible que ya renderiza `<Field>` — texto distinto y redundante para un lector de pantalla. | Si `Field` expone un id de label, usar `aria-labelledby`; toca el contrato de `Field`, por eso queda en (b) y no en el fix aplicado en Fase 2. |

---

## 4. m5 — Seguimiento

| Archivo:línea | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| `src/app/(protected)/setter/_actions/outreach.actions.ts:165` (+ `:173`) | Media | Los mensajes de error de `registrarResultado` (consumidos y mostrados por `seguimiento-form.tsx:159`) dicen *"Primero registrá el opener (Paso 7)"* y *"Paso 10"* (para `CALL_AGENDADA`) — numeración del wizard de 5 pasos eliminado en el Sprint 5.6 ("el corte"). El setter de hoy solo conoce M4 (opener) y M16 (agenda), nunca "Paso 7"/"Paso 10". | Reemplazar "Paso 7" → "M4 (opener)" y "Paso 10" → "M16 (agenda)" en ambos mensajes de `outreach.actions.ts`. |

---

## 5. m6 — Brief

| Archivo:línea | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| `manual/_components/brief-sanity.tsx:25` | Media | El sanity-check "Menciona lo concreto — está bien" es `useState` local sin persistencia. Si el setter lo confirma y navega fuera de m6 (a m7 vía `StepLink`, por ejemplo) y vuelve, `BriefSanity` se remonta con `sanityOk=false` y vuelve a pedir la confirmación desde cero — indefinidamente, en cada visita. | Decidir si el sanity-check debe persistir (flag en `progresoJson`) o si el diseño acepta que sea un recordatorio no-bloqueante repetible en cada visita — en ese caso, documentarlo explícitamente en el componente para que no se lea como bug. |
| `manual/_components/m6-brief.tsx:39` | Baja | El fallback de contexto cuando falta ficha/evaluación (camino documentado como "inalcanzable con la guardia del server") usa un copy inline propio en vez de reusar `GUIA_BRIEF.gate`, que ya existe como fuente para el mismo mensaje de espera de m6. | Si se quiere blindar más, alinear con `GUIA_BRIEF.gate` en vez de una oración suelta no reutilizada de ningún lado. |

---

## 6. m7-m12 + mr — Construcción y reentrada del re-loop

| Archivo:línea | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| `manual/_components/pantalla-manual.tsx:88` + `:208` | Media | **Comportamiento real, no cosmético:** `esConstruccion = pantalla.fase === 'construccion'` es `true` también para `mr` (`PANTALLAS.mr.fase === 'construccion'` en `manual.ts:262`), así que `NavConstruccion` (el rail "Construcción — navegación libre" con links a m7–m12) se renderiza también en la pantalla de reentrada — una pantalla que el propio comentario del código (`pantalla-manual.tsx:89-91`) documenta como especial ("no lleva munición ni registro propios"). No rompe el gate: `posicionDe()` ya incluye `PANTALLAS_CONSTRUCCION` en `habilitadas` para `RECHAZADA` (`manual.ts:539`), así que navegar directo desde `mr` a cualquier fase es válido — pero puede no ser la intención de UX (¿el setter debería pasar primero por "Reabrí la construcción"?). | Confirmar con producto: si es intencional (acceso directo a las fases desde la reentrada), documentarlo en el comentario de `pantalla-manual.tsx`; si no, condicionar `esConstruccion` a excluir `mr` (o a que solo aplique dentro de `PANTALLAS_CONSTRUCCION`). |
| `manual/_components/m-construccion.tsx:61` | Media | El bloque de Munición (`CopyBlock` cyan + bullets cyan) no distingue entre la fase "Tu paso ahora" y una fase ya completada o distinta a la que se navegó — siempre el mismo tono cyan, mientras la zona de Instrucción de la misma pantalla sí atenúa a zinc cuando `!esActual` (disciplina B9). | Decisión de producto: documentar como intencional (la Munición es "siempre accionable" porque se puede re-copiar en cualquier momento durante navegación libre) o atenuar cuando la fase mostrada no es la actual, para consistencia visual con la zona de Instrucción. |
| `[paso]/page.tsx:221` | Media | La pantalla `mr` no ofrece la capa "me trabé — avisar a Franco" (`EscalamientoConstruccion`/`EscalarModal`) ni el banner de escalamiento vigente — solo aparecen al navegar a m7–m12. El setter puede estar tan trabado leyendo la corrección de Franco como durante la construcción misma. | Evaluar mostrar `EscalamientoConstruccion` también en `mr`, incluyendo el banner "Ya avisaste a Franco" si `escaladoAt` sigue vigente de un escalamiento anterior. |
| `manual/_components/fase-auto-reporte.tsx:47` | Baja | Si `guardarProgreso` falla, se dispara `toast.error` pero el tilde optimista (`useOptimistic`) no se revierte — falta `router.refresh()` en la rama de error para forzar la reconciliación con el dato real persistido. El tilde puede quedar mostrando un estado que no coincide con lo guardado hasta la próxima navegación. | Agregar `router.refresh()` (o un mensaje que aclare "no se guardó, tildá de nuevo") en la rama `if (!result.success)` de `toggle()`. |
| `manual/_components/m-construccion.tsx:74` | Baja | `key={item}` en la lista de items de cada fase usa el propio texto del item (contenido editable por Franco en `SHELL_CONSTRUCCION`, `flow-content.ts`) como key. Funciona hoy porque los items son únicos, pero es frágil si dos items de la misma fase llegan a tener texto idéntico. | Fuera de scope trivial porque el key deriva de copy de producto editable — si se decide blindar, evaluar un id estable por item en `ShellFase` en vez de derivar del texto. |
| `manual/_components/m-construccion.tsx:41` | Informativo | `ConstruccionContexto` se renderiza idéntico en m7–m12 y en `mr` — intencional y documentado en el propio código (re-servida del contexto). Se registra por completitud, sin acción necesaria. | — |

---

## 7. m13 + m14 — Borrador y chequeo final

| Archivo:línea | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| `src/app/(protected)/setter/_actions/dossier.actions.ts:382` | Media | El mensaje de error de `enviarARevision` (mostrado en `chequeo-form.tsx` vía `toast.error`) dice *"Falta publicar el draft (Paso 5) antes de enviar a revisión"* — "Paso 5" es vocabulario del wizard eliminado; el setter de hoy conoce "M13"/"Borrador". | Cambiar a algo como "Falta publicar el borrador (M13) antes de enviar a revisión", consistente con el link "Ir a publicar el borrador" que `m14-chequeo.tsx` ya ofrece para el mismo caso. |
| `dossier.schemas.ts:71` (+ `:72`, `:74`) | Baja | Los mensajes de validación de `DraftUrlInputSchema` dicen "draft" en 3 lugares, mientras toda la UI visible de m13 (`m13-borrador.tsx`, `borrador-form.tsx`: badge "Borrador publicado", label "URL del borrador") ya usa "borrador" (vocabulario 2.x). | Alinear los mensajes de Zod a "borrador" para no mezclar vocabulario dentro de la misma pantalla. |
| `manual/_components/m13-borrador.tsx:96` | Baja | `M13Registro` no replica la guardia defensiva que `M13Contexto` sí tiene (comentario explícito: "inalcanzable con la guardia del server... vacío honesto") para el caso `stage !== 'CONSTRUCCION' && !draftUrl` — cae directo a `BorradorForm` sin mensaje explicativo. Hoy inalcanzable por el gate de `enviarARevision`, pero asimétrico entre los dos slots de la misma pantalla. | Espejar la misma guardia honesta en `M13Registro` que ya existe en `M13Contexto`. |
| `dossier.actions.ts:317` | Baja | Fallback de `guardarDraftUrl` también dice "Revisá la URL del draft" — mismo vocabulario 1.x que el resto del schema. | Decisión de nomenclatura: alinear a "borrador" en los 5 mensajes del schema junto con el fallback, o confirmar que "draft" es el término técnico interno aceptado. |
| `src/components/ui/Field.tsx:16-23` | Media | `<label>` sin `htmlFor`/`id` (no asociación programática con el control) y `<p>` de error sin `role="alert"` — componente compartido con **33 consumidores** en todo el repo (no solo el manual). Es la raíz del mismo síntoma visto en m1/m6/m13 puntualmente. | Requiere decidir arquitectura (`useId()` + inyección de `id` al `children`, vs. contrato explícito de prop `id` por consumidor) — blast radius amplio, no es un fix aislado. |
| `guidance-content.ts:581` | Baja | `GUIA_DRAFT.campos.draftUrl.label` sigue diciendo "URL del draft" — contradice el vocabulario 2.x del propio m13 y no lo consume ningún componente (`borrador-form.tsx:91` hardcodea "URL del borrador" directamente). Confirmado por grep: cero referencias a `campos.draftUrl.label` en `src/`. | Corregir a "URL del borrador" o eliminar el campo si de verdad no se usa, para que la fuente de guía no quede desincronizada del vocabulario vigente. |

---

## 8. m15 + m16 — Envío y agenda

| Archivo:línea | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| `manual/_components/m16-agenda.tsx:138` | Media | La rama `CALL_AGENDADA` (sin blob de agenda) es la única de las 4 ramas de `M16Registro` sin ningún link/CTA de salida — a diferencia de la rama de gate cerrado, que sí ofrece `<Link>` a m5. | Decisión de producto: confirmar si hace falta un CTA de continuidad acá, o si es intencional que no haya acción pendiente. |
| `manual/_components/m16-agenda.tsx:140` | Baja | Esa misma rama usa tono neutro/zinc pese a describir una reunión ya concretada (hecho consumado), mientras el estado hermano `ReunionAgendada` (con blob completo) sí usa el emerald reservado a "Completada" (vocabulario 2.x). | Alinear a emerald si se considera "completada", o documentar por qué se trata distinto (dato incompleto vs. blob completo). |
| `manual/_components/agenda-form.tsx:92` | Baja | El reset de `slots`/`slotElegido` tras un conflicto de horario depende de `mensaje.includes('se acaba de ocupar')` — un match de substring contra el copy textual del error del server (`agenda.actions.ts:177`), no un código/flag explícito. Si se edita ese copy, el reset se rompe silenciosamente. | Reemplazar el acoplamiento por substring por un código de error explícito compartido entre server y client. |
| `m15-envio.tsx:124` vs `m16-agenda.tsx:161-166` | Media | Ambas pantallas ofrecen el mismo CTA de gate-cerrado (ir a m5 a registrar/avanzar la cadencia) con frases distintas: M15 dice "Seguí la cadencia — registrá un toque", M16 dice "Ir a «Registrá lo que pasó»" — mismo destino, dos formas de decirlo. | Unificar el label (por ejemplo, adoptar en ambos la forma que cita el título real de m5), o extraer una constante/componente compartido para este link de salida-de-gate. |
| `manual/_components/envio-form.tsx` (todo el archivo) | Media | `EnvioForm` es el único de la familia write-path-local (m5, m13-m16) que no pasa `onError` a `useStepAction` — el error de `enviarDemoAprobada` (gate/ownership de la línea de envío) queda solo en un toast efímero, a diferencia de `seguimiento-form.tsx` y `agenda-form.tsx` que sí lo capturan y muestran inline. | Pasar `onError: setError` (con su `useState`) y renderizar inline, replicando el patrón de sus hermanos en la misma carpeta. Nota: toca la línea de envío — cualquier cambio acá se trata con la misma cautela que el resto del gate. |

---

## 9. Cross-cutting — asimetría form-extraído vs write-path

| Archivo:línea | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| `manual/_components/chequeo-form.tsx:63` | Media | `ChequeoForm` (m14) no declara ningún `serverError`/mensaje inline — solo `toast.error`. Si el toast se cierra o el setter mira otra parte de la pantalla, el motivo del fallo (p. ej. "no todos los obligatorios están OK" de `enviarARevision`) desaparece sin dejar rastro visible. | Agregar estado local + mensaje inline, como ya hacen `ficha-form.tsx`/`brief-form.tsx` de la otra familia. |
| `chequeo-form.tsx` + `borrador-form.tsx` (raíz estructural) | Baja | Ninguno de los dos usa el hook `useStepAction` (creado explícitamente en el Sprint A-16 para unificar pending/error/success) pese a ser posteriores al hook — replican `useTransition` a mano. Esta es la causa raíz de por qué `ChequeoForm`/`EnvioForm` quedan sin manejo de error inline consistente. | Migrar `guardar()`/`enviar()` de ambos a `useStepAction`, resolviendo de paso el hallazgo anterior. |
| `borrador-form.tsx:38-42` | — (contraste positivo) | `BorradorForm` sí reusa el mismo estado `error` para validación client-side y fallo de server, mostrado vía `Field`. Se documenta como el patrón correcto que ya existe en la propia familia write-path-local — hace más notorio el hueco en `ChequeoForm`/`EnvioForm`. | Ninguna acción — referencia de patrón correcto. |

---

## 10. Shell compartido, estados y auxiliares

| Archivo:línea | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| `manual/_components/pantalla-manual.tsx:14-51` | Baja | El placeholder "sin migrar" de `Zona()` y su comentario ("la pantalla real la llena al migrar", "mientras esta pantalla no migre, el registro sigue viviendo en el wizard del lead") describen un estado transitorio ya cerrado: las 16 pantallas están migradas y el wizard no existe más desde el Sprint 5.6. Es documentación/copy muerto que puede confundir a quien lea el shell pensando que aún hay pantallas pendientes. | Simplificar o eliminar el fallback y su copy, o al menos actualizar el comentario. |
| `manual/_components/estado-manual.tsx:37-66` | Baja | Asimetría entre los dos estados zinc: `espera` ofrece un CTA ("¿Respondió o pasó algo antes? Registralo" → m5); `revision` no ofrece ningún CTA equivalente. | Confirmar con producto si es intencional (B9: en `revision` la pelota es de Franco) o si falta una vía de registro anticipado también ahí. |
| `manual/_components/estado-manual.tsx:43-55` | Baja | El `aria-label` de la sección de `revision` ("Demo en revisión") difiere del texto del `<h2>` interno ("Franco está revisando tu demo") — dos formulaciones distintas del mismo estado que un lector de pantalla anuncia una detrás de la otra. | Unificar el string o usar `aria-labelledby` apuntando al `h2`. |
| `_components/badge-provisorio.tsx:1-10` | Baja | Usa tono `amber` con significado de "meta-estado del contenido" ("Guía preliminar — en validación"), no el significado B9 estándar de amber (gate-pendiente). El propio comentario dice que "la secuencia del shell es provisoria por diseño" — puede ser vestigio de una etapa de validación ya cerrada (Bloque 4/5). Único consumidor: `m-construccion.tsx`. | Confirmar si el badge sigue vigente o es vestigial; si sigue, documentar por qué el amber tiene un significado distinto acá. |

---

## 11. Cross-cutting — vocabulario 2.x

| Archivo:línea | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| `guidance-content.ts:845` (`GUIA_ENVIO.espera.engancheSinAprobar`) | Media | Dice "...este paso no lo ofrece", reintroduciendo "paso" (vocabulario retirado) en vez de "esta pantalla" — visible al setter en M15 cuando el gate de envío está cerrado. | Cambiar "este paso" → "esta pantalla" en la fuente única (`guidance-content.ts`), sin tocar componentes. |
| `m14-chequeo.tsx:57` vs `m2-evaluador.tsx:34` | Media | M14 dice "Publicá el borrador (**paso anterior**)"; M2 dice "completala en la **pantalla anterior**" — mismo tipo de referencia, vocabulario distinto. El manual se organiza en "pantallas", no "pasos" (numeración retirada del wizard). | Cambiar "(paso anterior)" → "(pantalla anterior)" en `m14-chequeo.tsx:57`. |

*(El hallazgo del CTA duplicado M15/M16 hacia m5 con textos distintos ya está listado en [§8](#8-m15--m16--envío-y-agenda) — es la misma naturaleza cross-cutting, no se repite acá.)*

---

## 12. Accesibilidad — patrón sistémico `role="alert"` ausente

Además de los 2 casos resueltos en Fase 2, el mismo hueco (`<p className="text-xs text-red-400">{error}</p>` sin `role="alert"`) se repite en:

- `_components/ficha-form.tsx:249` (m1)
- `_components/evaluacion-form.tsx:230` (m3)
- `manual/_components/agenda-form.tsx:218,231,235` (m16 — 3 apariciones, guardas mutuamente excluyentes)
- `src/components/ui/Field.tsx:21-23` (componente compartido, consumido por `opener-form.tsx`/`borrador-form.tsx` y 31 lugares más fuera del manual)

**Por qué quedan en (b) y no se resolvieron como los 2 de Fase 2:** cada uno individualmente parece trivial, pero el conjunto admite dos remedios estructuralmente distintos y no equivalentes — parchear archivo por archivo (9+ sitios) vs. mover la responsabilidad a `Field.tsx` (que ampliaría el cambio a sus 33 consumidores en todo el repo, no solo el manual). Elegir entre esas rutas es una decisión de arquitectura de accesibilidad, no un fix mecánico de una sola forma — encaja en la regla "ante la duda, es (b)".

**Recomendación:** decidir el criterio (parche puntual vs. arreglo en `Field.tsx`) en un sprint dedicado a accesibilidad del kit compartido, no pantalla por pantalla.

---

## 13. Sin hallazgos

- **m4 (Opener):** las 7 lentes no encontraron nada — ni en `m4-opener.tsx` ni en `opener-form.tsx`.

---

## 14. Cierre

- **Trivial-seguros aplicados:** 2 (`role="alert"` en `seguimiento-form.tsx:159` y `brief-form.tsx:200`).
- **Hallazgos (b) para triage de Franco:** 39, listados arriba con archivo:línea, severidad y recomendación.
- **Motor, gates y línea de envío:** intactos — ningún hallazgo (b) fue implementado; el más cercano a "tocar comportamiento" (`NavConstruccion` en `mr`, §6) queda documentado, no resuelto, porque admite más de una decisión de producto válida.
- **Desvío de instrucción:** la vara referenciada (`docs/brief-vision-flujo-setter.md`) no existe en el repo — ver nota metodológica al inicio.
