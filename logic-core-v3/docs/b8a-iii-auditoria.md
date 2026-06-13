# B8A-III — Tercera auditoría de LeadOS (hallazgos NUEVOS)

**Sesión:** B8A-III — tercer perfeccionamiento · **Branch:** `leados/b8a-iii` (ramificada de `main` con B8a + B8a-II mergeados) · **Fecha:** 13/jun/2026
**Método:** recorrido de uso real con sesión viva (setter + super-admin minteados vía `/api/qa/login` en `dev:qa` 3002) + auditoría de código multi-agente en amplitud (5 lentes: calidad del entregable, caminos infelices, coherencia de copy/tono, lado de Franco, bordes de corrección/seguridad), con dedup y **verificación adversarial** de cada candidato (un escéptico re-abre los archivos citados e intenta refutar). Cada hallazgo trae evidencia `archivo:línea` o el estado observado en runtime. Lo que sólo se leyó en código y aún no se vivió queda marcado.

> **Honestidad de arranque (confirmada al cierre):** es la 3ª pasada. Las 2 anteriores quemaron la nafta fácil. Esta encontró **UNA** mejora real de impacto que las dos no cazaron (un guard de entrada faltante que permite corromper en silencio el outcome más valioso del sistema), más **seis** defectos menores de FORMA/copy/recuperación y un reorden de jerarquía en el panel de Franco. Ninguno toca una línea roja ni inventa valores `PROVISORIO`. Sin adorno: **salvo el guard de CALL_AGENDADA, el sistema está en su techo razonable pre-piloto.** El próximo paso de mayor valor es correr el piloto, no auditar una cuarta vez.

---

## 0. Lo que se re-verificó sólido en runtime (no son hallazgos)

Recorrido en vivo como setter y como Franco, no lectura a ciegas:

- **El corazón (Paso 3→4→6) está sólido.** Verificado sobre un lead descartable forzado a `CONSTRUCCION` (creado y borrado en la verificación, cero fixtures tocadas): NII-1 vive y funciona — el bloque pegable a Claude Design es auto-suficiente (BRIEF + `RESEÑAS REALES` + `CONTENIDO Y TONO REAL` + `DE DÓNDE BAJAR EL LOGO Y LAS FOTOS`), y el panel "Materiales reales del negocio" muestra los links de assets + reseñas + tono. El self-check tiene dos niveles con arreglo concreto por ítem, re-validación server-side contra `HARD_CHECKS` vigentes, y el draft-step deja explícito publicar≠enviar.
- **El lado de Franco cumple la promesa de ~2 min.** La cola ordena calientes→antigüedad; la pantalla de revisión trae demo embebida + veredicto + evaluación + brief + self-check + ficha en una sola vista; los fixes de las sesiones previas (H5 cross-link en ambas direcciones, H7 aviso rosa de self-check ausente) están presentes y funcionando.
- **Flujo invertido + idempotencia intactos.** El opener nunca ofrece link; el envío sólo con APROBADA + finalUrl + (respondió o caliente). Verificado en Gimnasio Atlas (camino preventivo) y en leads fríos.
- **Aislamiento por `assignedToId`, puertas únicas (`transitionDossier` / `os-commercial.ts`), guards admin-only, claims atómicos, husos horarios** — sin grietas nuevas (barrido de las 5 lentes).

Las **líneas rojas siguen firmes**. Ningún hallazgo de abajo las toca; el principal las **refuerza**.

---

## 1. Hallazgo de impacto ALTO (ejecutado — SENSIBLE)

### NIII-1 — `registrarResultado` (Paso 9) no re-valida `lead.status`: un lead CALL_AGENDADA puede corromperse desde un botón aún visible *(SENSIBLE — ejecutado)*

**Qué:** En el Paso 9 (Seguimiento), para un lead que YA está en `CALL_AGENDADA`, la UI sigue mostrando el bloque "Registrá lo que pasó" con los cuatro botones (`No respondió` / `Respondió` / `Postergar` / `Rechazó`) **habilitados**, y el server (`registrarResultado`) **no tiene guard sobre `lead.status`**. Un click en `Postergar`/`Respondió` baja el status, **pisa el CALL_AGENDADA**, deja el booking de Cal.com huérfano en `agendaJson` (estado AGENDADA + uid vivo), saca el lead del grupo "Agendadas" del home y **crea una `OsLeadActivity` nueva que ensucia el orden que el cron lee como "último contacto"** (línea roja 5).

**Por qué importa (la vara):** el outcome más valioso de toda la herramienta es la reunión agendada que cierra Franco. Hoy se puede corromper en silencio, sin que nadie lo note, con un solo click en un botón visible del flujo normal. Mueve `dificil-usar-mal` de lleno.

**Evidencia (code-confirmed + vivido en runtime):**
- `setter/_actions/outreach.actions.ts` — `registrarResultado` valida `requireSetter` + `getOwnedLead` + `actividades.length > 0` y bloquea SOLO el resultado literal `CALL_AGENDADA`; **no hay guard sobre `lead.status === 'CALL_AGENDADA'`**.
- `setter/leads/[leadId]/_components/seguimiento-step.tsx:130,135,285-311` — `respondio = leadRespondio(status)` es `true` para CALL_AGENDADA (`flow.ts:37-45`), `activo = true`, y el bloque OPCIONES se renderiza porque `contactos > 0`. Los 4 botones salen sin filtro por status.
- `src/lib/os-commercial.ts` — la rama RESPONDIO y `postergarLead` setean status incondicionalmente (pisan CALL_AGENDADA) y `registrarContactoComercial` crea actividad nueva.
- `setter/_actions/agenda.actions.ts:88-90` — el camino **espejo** (`ofrecerHorarios`/`confirmarReunion`) SÍ protege con "Este lead ya tiene la reunión agendada" → la asimetría delata el guard faltante en el otro lado.
- **Vivido en runtime:** sobre un lead `CALL_AGENDADA` con un opener registrado (`contactos>0`), el header muestra "REUNIÓN AGENDADA" y el Paso 9 renderiza los 4 botones OPCIONES habilitados. (No se clickearon — corromperían el lead.)
- **Distinto de H1** (compensación de booking dentro de `confirmarReunion`) **y de H3** (copy de próxima-acción en el home): esto es un **guard de ENTRADA inexistente**, alcanzable por flujo normal de UI.

**Qué se hizo:** ver `b8a-iii-changelog.md` → NIII-1. Resumen: guard server-side en `registrarResultado` (rechaza si `lead.status === CALL_AGENDADA`, espejando el copy de `gateAgenda`); en `seguimiento-step` se oculta el bloque OPCIONES para CALL_AGENDADA y se muestra una nota coherente con `proximaAccionPara` ("la reunión la cierra Franco"); y se hace la ficha read-only en el wizard para CALL_AGENDADA (ver NIII-2). **No se tocó** el `createActivity` del admin: ahí la laxitud es intencional (Franco maneja el ciclo de la reunión). SENSIBLE: el core es un guard sobre la maquinaria comercial → commit aparte. Refuerza la línea roja 5, no la degrada.

---

## 2. Hallazgos de impacto MEDIO/BAJO (ejecutados — SEGUROS)

### NIII-2 — El wizard no es consciente de CALL_AGENDADA: invita a "Completá la ficha" en un lead ya agendado *(SEGURO — ejecutado)*
**Qué:** el lado-UI del mismo problema que NIII-1, vivido primero en runtime. Para un lead `CALL_AGENDADA` cuyo dossier no avanzó (camino "respondió → directo a reunión sin construir demo", un éxito común del flujo invertido), el wizard muestra el **Paso 1 — Ficha** como formulario **activo y editable** con "Para habilitar la evaluación todavía falta…" y botón "Guardar ficha", contradiciendo el home que ya dice "Reunión agendada — la cierra Franco" (H3).
**Evidencia (vivido en runtime + code):** observado en vivo sobre QA-B7 Vivero El Aromo (CALL_AGENDADA, stage FICHA). `lead-wizard.tsx:79` — `fichaEditable = stage === null || stage === 'FICHA'`, sin contemplar status; `descartado` SÍ tiene short-circuit (sólo Ficha+Evaluación read-only), pero CALL_AGENDADA no.
**Por qué (la vara):** `dificil-usar-mal` + `friccion-setter`: el lead más avanzado del pipeline le dice al setter que vuelva al Paso 1. H3 arregló el card del home; el wizard quedó sin tocar.
**Qué se hizo:** en `lead-wizard.tsx`, `fichaEditable` pasa a `false` cuando `status === 'CALL_AGENDADA'` (la evaluación lo hereda) — junto con el ocultamiento de OPCIONES de NIII-1, el wizard deja de invitar trabajo de producción sobre un lead que cierra Franco. Cambio mínimo, mismo patrón que el short-circuit de `descartado`.

### NIII-3 — El envío a revisión (la acción más cara del setter) reporta el fallo SOLO con toast efímero *(SEGURO — ejecutado)*
**Qué:** `self-check-step` y `construccion-step` son las DOS únicas superficies del wizard que reportan un fallo del server con `toast.error()` solo (sonner, ~4s, abajo-derecha), sin error inline persistente. El resto del wizard (ficha/brief/opener/agenda/evaluación) usa `serverError` + `<p className="text-xs text-red-400">` persistente.
**Por qué (la vara):** `dificil-usar-mal`. "Enviar a revisión" es la entrega del trabajo a Franco; `enviarARevision` re-valida contra la DB (stage, draftUrl, self-check) y puede rebotar. Si el toast pasa desapercibido, el setter sigue creyendo que entregó y la demo nunca llega a la cola: **falso éxito tragado en silencio**.
**Evidencia:** `self-check-step.tsx` (ramas de fallo de `guardar`/`enviar` → toast-only), `construccion-step.tsx` (`transicionar` → toast-only); contraste con `ficha-step.tsx` / `brief-step.tsx` (inline persistente). `dossier.actions.ts` (`enviarARevision` rebota en 3 caminos re-validados) y `dossier.ts` (`transitionDossier` lanza por cambio concurrente de stage).
**Qué se hizo:** replicar el patrón ya presente en el repo — `serverError` useState + render persistente arriba de los botones — en ambos componentes. El toast queda como refuerzo. Cero librerías.

### NIII-4 — El hard-check `fielAlBrief` sólo verifica que ESTÉ todo, nunca que NO sobre *(SEGURO — ejecutado)*
**Qué:** el shell declara como regla "No agregues secciones que el brief no pide — el brief es el plano" (`flow.ts`), pero el hard-check que decide si la demo va a la cola pregunta sólo por **completitud** ("¿está todo lo que pedía?"), nunca por **sobrante**. Una demo con secciones inventadas por Claude Design (Galería/Equipo/FAQ) pasa el gate en verde y le llega a Franco con scope inflado.
**Por qué (la vara):** `dificil-usar-mal`. Es justo lo que un no-técnico deja pasar. Hueco real entre lo que la guía dice que importa y lo que el gate enforce.
**Evidencia:** `flow.ts` — `SHELL_CONSTRUCCION` (regla anti-sobrante) vs `HARD_CHECKS` `fielAlBrief.comoVerificar` (sólo completitud); `selfCheckAprobado` es puramente de presencia.
**Qué se hizo:** reescribir el `comoVerificar` de `fielAlBrief` bidireccional ("¿está TODO lo que pedía y NADA que no pidiera?…"). Sólo cambia la **FORMA** de una constante `PROVISORIO` (permitido explícitamente) — no agrega checks ni umbrales.

### NIII-5 — El onboarding del setter (paso 4) dice que construcción/revisión/envío "llegan en los próximos pasos" — pero ya están todos vivos *(SEGURO — ejecutado)*
**Qué:** la tarjeta "Cómo funciona" del home (lo primero que lee un setter nuevo) tiene un paso 4 ("Lo que sigue") que describe construir/revisar/enviar como features futuras. El wizard completo (construcción fase por fase, draft, self-check, agenda, envío) ya está construido y a un click.
**Por qué (la vara):** `friccion-setter`. Subvende el producto y mina la confianza en la guía justo en el onboarding — mapa mental inicial desactualizado.
**Evidencia:** `setter/_components/onboarding-hint.tsx` (`PASOS[3]`), contradicho por `dossier-stepper.tsx:7-9` ("se acabaron los 'próximo bloque'") y `lead-wizard.tsx:191-213` (renderiza todos los steps en vivo). Renderizado prominente en `setter/page.tsx`.
**Qué se hizo:** reescribir `PASOS[3]` para describir lo que el panel YA hace, manteniendo "en cuatro pasos" honesto. Sólo copy.

### NIII-6 — El SelfCheckPanel de Franco lidera con duros (siempre 100% verde en cola) y entierra los softFlags accionables *(SEGURO — ejecutado, validado visualmente)*
**Qué:** por construcción del gate de envío, todo dossier en cola muestra la lista de hard-checks 100% en verde — protagonismo visual sin valor informativo — mientras los `softFlags` (los reparos de diseño que el propio setter levantó, la única señal discriminante para el ojo de Franco) van debajo, en caja secundaria, sólo si existen.
**Por qué (la vara):** `revision-franco`. En una revisión de 2 min, la pieza de mayor protagonismo es la de menor valor. Subir/destacar softFlags y condensar los duros a un resumen afila el escaneo.
**Evidencia:** `flow.ts` (`selfCheckAprobado` exige todos los HARD_CHECKS en verde) + `dossier.actions.ts` (re-valida antes de EN_REVISION) → siempre verde en cola; `admin/leados/[leadId]/_components/dossier-panels.tsx` (`itemsDuros` primero, `softFlags` después y condicional).
**Qué se hizo:** reordenar el panel para que los softFlags (cuando existen) sean lo primero y más visible y la lista de duros se condense a un resumen "N/N verificados" expandible; si no hay softFlags, decirlo explícito. No cambia `HARD_CHECKS`/`SOFT_CHECKS` ni umbrales: sólo jerarquía visual. Validado con captura contra `/admin/leados/[id]`.

### NIII-7 — El shell dice copiar "el bloque del brief (acá abajo)" pero está ARRIBA y se llama "Bloque para Claude Design" *(SEGURO — ejecutado)*
**Qué:** doble desajuste literal guía↔UI en el primerísimo paso de la construcción: ubicación ("acá abajo" vs físicamente arriba) y nombre ("el bloque del brief" vs "Bloque para Claude Design").
**Por qué (la vara):** `friccion-setter`. Impacto genuinamente bajo (el bloque está visible con botón de copiar), pero hace dudar al no-técnico justo donde menos conviene.
**Evidencia:** `flow.ts` (`SHELL_CONSTRUCCION` fase Estructura, item 1) vs `construccion-step.tsx` (el `CopyBlock` se renderiza ANTES del `<ol>` del shell).
**Qué se hizo:** ajustar el copy del item 1 para apuntar al bloque por su nombre y ubicación reales. Sólo copy.

### NIII-8 — Conflicto al confirmar reunión deja el formulario en pantalla sin refrescar *(SEGURO — ejecutado)*
**Qué:** en `agenda-step`, ante un conflicto de concurrencia/stale ("Este lead ya tiene la reunión agendada" o "Ya hay una confirmación en curso… recargá"), `confirmar()` muestra el error rojo pero **no llama `router.refresh()`** (sólo lo hace para "se acaba de ocupar"). El formulario de confirmación queda en pantalla insistiendo en agendar algo que ya está agendado, en vez de pasar a la tarjeta-resumen "Reunión agendada" que ya existe.
**Por qué (la vara):** `dificil-usar-mal`. El server hace lo correcto (idempotencia intacta, rechaza el duplicado), pero la UI deja un estado contradictorio. Impacto bajo; el valor es `needs-runtime` (requiere reproducir la carrera).
**Evidencia:** `agenda-step.tsx` (rama de error de `confirmar()` sin `router.refresh()`; `useRouter` ya importado y usado en la rama de éxito); `agenda.actions.ts` (los mensajes de conflicto).
**Qué se hizo:** en la rama de error, cuando el error indique reunión ya agendada / confirmación en curso, llamar `router.refresh()` (mismo patrón que las ramas de éxito). Tiny, conforme al patrón.

---

## 3. NO ejecutados — propuestas / reservados

- **resultado-sin-realizada (PROPUESTA, future-work):** `guardarResultadoReunionAdmin` deja registrar GANADO/PERDIDO sin marcar `realizadaAt`; "realizadas" es la métrica que el piloto declara como real. **No se ejecutó** porque el lector de esa métrica (el conteo de B8) **todavía no existe** — optimizar la semántica de `realizadaAt` ahora es pulir un campo para un consumidor inexistente, y *cómo* cuenta B8 (auto-derivar `realizadaAt` vs exigir "realizada" en UI) es una decisión de semántica que pertenece a Franco. Recomendación: resolverlo cuando se construya el conteo de B8, con el dato del piloto.
- **error.message crudo en actions admin B6/B7 (MARGINAL, no ejecutado):** una divergencia real del patrón `mapError` en un par de actions `requireSuperAdmin` (`reunion`/`activity`/`demo`). Admin-only, sin actor hostil del lado setter; no mueve la vara. Higiene a criterio de Franco; el fix está documentado pero no es trabajo pre-piloto.
- **H2 / H4 / H6 (RESERVADOS para Franco) — sin cambios.** Re-confirmados en runtime: el zigzag de numeración (1,2,3,4,5,6,7,9,10) y que el `DossierStepper` marca "Brief" como paso actual para un lead en outreach siguen como estaban. Las recomendaciones afinadas de las sesiones 1-2 siguen vigentes. **No se tocaron.**

---

## 4. Lectura honesta de cierre

¿Encontró esta tercera sesión mejoras reales de impacto, o el sistema ya estaba en su techo? **Una mejora real de impacto alto (NIII-1) que las dos pasadas anteriores no cazaron** — y que sola justifica la sesión, porque protege el outcome más valioso del sistema de una corrupción silenciosa. El resto (NIII-2 a NIII-8) son defectos reales pero menores: coherencia, recuperación de error y un reorden de jerarquía — todos FORMA/copy o aditivos chicos sobre patrones existentes, ninguno toca una línea roja ni inventa valores `PROVISORIO`.

Sin adorno: **salvo el guard de CALL_AGENDADA, el sistema está efectivamente en su techo razonable pre-piloto.** Las capas de calidad del entregable, caminos infelices, coherencia y lado de Franco están en su techo, con sólo pulido de FORMA disponible. Lo que falta calibrar (cuántos checks, qué umbrales, qué fases del shell) **sólo lo da correr demos reales** — no leer más código. Una cuarta auditoría de amplitud daría rendimientos decrecientes.

**El próximo paso de mayor valor no es código: es correr el piloto.**
