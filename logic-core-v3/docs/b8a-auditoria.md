# B8A — Auditoría de LeadOS (hallazgos priorizados)

**Sesión:** B8A — auditoría y perfeccionamiento · **Branch:** `leados/b8a-hardening` · **Fecha:** 13/jun/2026
**Método:** recorrido de uso real como SETTER y como SUPER_ADMIN sobre `dev:qa` (puerto 3002, sesión minteada vía `/api/qa/login`), más lectura de la lógica compartida (`flow.ts`, contratos, `os-commercial.ts`, `agenda.ts`, actions). Cada hallazgo trae evidencia: `archivo:línea` o el estado/copy efectivamente observado en runtime.

> **Vara de cada hallazgo:** ¿le saca fricción al setter sin bajar la calidad de la demo? ¿hace la revisión de Franco más rápida/certera? ¿hace la herramienta más difícil de usar mal? Si no mueve ninguna de las tres, es ruido y no entra.

---

## 0. Lo que está sólido (verificado, no es hallazgo — es la base que NO hay que romper)

Para que la auditoría sea honesta hacia adentro: el esqueleto de seguridad e invariantes está **bien construido**. Verificado leyendo cada action:

- **Toda action del setter** (`setter/_actions/*`) abre con `requireSetter()` y accede a datos SOLO vía `getOwnedLead`/`getOwnedDossier`/`saveOwned*` (aislamiento por `assignedToId`). Input validado con zod antes de tocar DB. `mapError` nunca filtra mensajes internos. Ej: `dossier.actions.ts:83-99`, `outreach.actions.ts:89-134`, `agenda.actions.ts:111-139`.
- **Toda action admin** (`revision.actions.ts`, `reunion.actions.ts`) abre con `requireSuperAdmin()`. Las transiciones `EN_REVISION→APROBADA/RECHAZADA` viven SOLO ahí (`revision.actions.ts:39-86`). El setter no las alcanza.
- **Puertas únicas respetadas:** stages SOLO por `transitionDossier`; status comercial del setter SOLO por `os-commercial.ts`. El claim atómico de envío de demo (`marcarDemoEnviadaOwned`) y el de booking (`marcarAgendandoOwned`, `agenda.ts:139-156`, `updateMany` condicional sobre `agendaJson NULL`) están bien hechos — doble click = un solo efecto.
- **Flujo invertido respetado:** `gateEnvioDemo` exige APROBADA + finalUrl + (respondió o caliente) (`flow.ts:58-69`); el opener tiene hard-block de links en la UI (`flow.ts:340-345`). Verificado en runtime: opener de un lead RESPONDIO muestra "ENVIADO", no re-ofrece link.
- **El cierre admin NO ensucia `OsLeadActivity`:** `registrarResultadoReunion` mueve status con `prisma.osLead.update` directo (`reunion.actions.ts:81-84`) — es un evento interno, no contacto al prospecto, así que correctamente NO crea activity (no contamina el orden que lee el cron de "último contacto").

Conclusión: las **líneas rojas están firmes**. Los hallazgos de abajo son, casi todos, de coherencia/UX/copy y un par de bordes de corrección — ninguno exige aflojar un invariante.

---

## 1. Bloqueantes de uso / corrección

### H1 — `confirmarReunion`: la compensación es un no-op si el registro local falla DESPUÉS del booking *(SENSIBLE)*
**Qué:** En `confirmarReunion`, si Cal.com crea el booking OK y `guardarAgendaOwned` escribe `estado: AGENDADA`, pero el `registrarContactoComercial(CALL_AGENDADA)` posterior tira (hipo de DB, constraint), el `catch` ejecuta `cancelBooking(uid)` + `revertirAgendandoOwned`. Pero **`revertirAgendandoOwned` filtra por `agendaJson.path(['estado']) == 'AGENDANDO'`** (`agenda.ts:162-169`) y en ese punto el estado ya es `AGENDADA` → **el update no matchea y no borra nada**.
**Dónde:** `setter/_actions/agenda.actions.ts:222-231` (catch) + `src/lib/leados/agenda.ts:162-169` (`revertirAgendandoOwned`).
**Resultado mentiroso:** el booking queda cancelado en Cal.com, el status sigue en RESPONDIO (CALL_AGENDADA nunca se seteó), pero `agendaJson` queda `AGENDADA` con el uid muerto. El setter ve el resumen verde "reunión agendada" de una reunión que no existe, y `gateAgenda` (`agenda.actions.ts:99`) le bloquea re-agendar.
**Gravedad:** corrección — viola el invariante explícito "nada queda mentiroso" de la compensación. Probabilidad baja (requiere fallo de DB entre dos writes), pero es exactamente el caso que la compensación decía cubrir.
**Propuesta:** la compensación debe borrar también el `AGENDADA` recién escrito por ESTE flujo. Filtrar por uid para no pisar nada ajeno (no puede haber agenda previa: el claim exigió NULL). Clase SENSIBLE (toca la maquinaria de booking) → commit aparte.

---

## 2. Fricción seria

### H2 — RE_SEGUIMIENTO deja al lead sin poder re-agendar *(PROPUESTA — toca invariante de agenda)*
**Qué:** Cuando Franco cierra una reunión con resultado **RE_SEGUIMIENTO**, `guardarResultadoReunionAdmin` agrega `resultado` pero **mantiene `estado: 'AGENDADA'`** (`agenda.ts:225-228`) y el status del lead vuelve a RESPONDIO (`reunion.actions.ts:31,81`). En el wizard del setter, `gateAgenda` rechaza con `reunionAgendada(parseAgenda(agendaJson))` = true (`agenda.actions.ts:99` + `flow.ts:111-113`) → **"Este lead ya tiene la reunión agendada"**. El `AgendaStep` muestra el resumen verde viejo en vez del form.
**Dónde:** `src/lib/leados/agenda.ts:217-234`, `agenda.actions.ts:75-104`, `flow.ts:111-113`.
**Impacto:** la bitácora B7 define RE_SEGUIMIENTO como "vuelve a RESPONDIO, el setter retoma la conversación". Si esa conversación vuelve a llegar a "sí, reunámonos", el setter no tiene cómo agendar de nuevo — callejón sin salida en un flujo documentado.
**Por qué es propuesta y no fix:** las opciones tienen tradeoffs que tocan el invariante de idempotencia/persistencia de agenda: (a) nullear `agendaJson` en RE_SEGUIMIENTO → se pierde el registro de la 1ª reunión (traspaso, uid, realizada, resultado); (b) relajar el claim/`gateAgenda` para permitir sobrescribir → riesgo de doble-booking; (c) convertir `agendaJson` en historial (array de reuniones) → cambio de contrato/posible migración. Recomiendo **(c)** post-piloto; mientras tanto, si pasa en el piloto, el workaround manual es que Franco re-asigne o limpie la agenda. **No ejecutar a medias.**

### H3 — Home-hub: un lead CALL_AGENDADA muestra la próxima acción del dossier, no la de la reunión *(SEGURO)*
**Qué:** En el grupo "Agendadas", `proximaAccionPara` no tiene caso para `status === 'CALL_AGENDADA'` (`flow.ts:553-624`): cae al `switch (stage)` y muestra la acción del dossier. Observado en runtime: **"QA-B7 Vivero El Aromo" (CALL_AGENDADA, stage FICHA) aparece en "Agendadas" con la tarjeta "Completá la ficha"** y marcada como accionable.
**Dónde:** `src/lib/leados/flow.ts:553-624` (`proximaAccionPara`) y `:534-551` (`grupoPara`).
**Impacto:** incoherencia visible — el lead más avanzado del pipeline (reunión agendada, lo cierra Franco) le dice al setter que vuelva al Paso 1. Para un no-técnico, "esta reunión agendada quiere que complete la ficha" es exactamente el tipo de mensaje que mina la confianza en la herramienta.
**Propuesta:** caso explícito al tope de `proximaAccionPara`: `if (status === 'CALL_AGENDADA') return { proximaAccion: 'Reunión agendada — la cierra Franco', accionable: false }`. Limpio, sin tocar invariantes. *(Nota: en runtime se ve sobre datos QA simulados, pero la lógica lo produciría con cualquier lead agendado cuyo dossier no haya avanzado — p.ej. el camino caliente preventivo.)*

### H4 — El stepper superior no representa la mitad de outreach/agenda *(SEGURO, con cuidado)*
**Qué:** `DossierStepper` tiene 5 pasos fijos: Ficha · Evaluación · Brief · Construcción · Revisión (`dossier-stepper.tsx:9`). No existe representación de opener/seguimiento/agenda (los "Paso 7/9/10" del wizard). Peor: para un lead EVALUADA que está haciendo outreach, `pasoActual(EVALUADA) = 2` (`dossier-stepper.tsx:17-19`) → el stepper marca **"Brief" como paso actual** aunque el setter esté mandando el opener o en seguimiento.
**Dónde:** `setter/leads/[leadId]/_components/dossier-stepper.tsx:9,12-29`.
**Impacto:** el stepper es el "mapa" del lead. Hoy miente sobre dónde está el setter en la mitad de los casos (todo lead frío en conversación). Choca con el lema del home "Laburá de arriba para abajo: cada lead te dice su próximo paso".
**Propuesta:** o bien (a) re-etiquetar el stepper para que se lea como "progreso de la DEMO" y no como "tu próximo paso" (mínimo), o (b) hacerlo journey-aware sumando un hito de "Contacto/Agenda". Recomiendo (a) por ahora — bajo riesgo. *(El fix de la lógica de `pasoActual` requiere pensar el caso EVALUADA-en-outreach con cuidado para no empeorarlo; ver propuesta.)*

---

## 3. Pulido / coherencia

### H5 — Las dos superficies admin del mismo lead no están cross-linkeadas *(SEGURO)*
**Qué:** El mismo lead vive en dos páginas admin distintas, en dos secciones distintas del nav: la **revisión de demo (B5)** en `/admin/leados/[leadId]` ("Revisión demos") y el **cierre de reunión (B7)** + pipeline en `/admin/leads/[leadId]` ("Leads"). No hay link de una a la otra (la revisión tiene "Volver a la cola" y "Siguiente en la cola →"; el detalle de pipeline no menciona la revisión).
**Dónde:** `admin/leados/[leadId]/page.tsx` ↔ `admin/leads/[leadId]/page.tsx` (observado en runtime: navegué entre ambas, ninguna enlaza a la otra).
**Impacto:** Franco revisa la demo en un lado y cierra la reunión (GANADO/PERDIDO) en otro. Para el cuello de botella del sistema, saltar de sección a sección y reencontrar el lead es fricción evitable.
**Propuesta:** agregar un cross-link discreto en cada superficie ("Ver ficha completa del lead →" / "Ver revisión de la demo →"). SEGURO, alto valor para Franco.

### H6 — Numeración de pasos en zigzag (1, 2, 7, 9, 10, 3, 4, 5, 6) *(SEGURO, baja prioridad)*
**Qué:** El orden visual del wizard es correcto para el flujo invertido (ficha→eval→opener→seguimiento→agenda→brief→construcción→draft→self-check), pero los números canónicos saltan: 1, 2, **7, 9, 10**, **3, 4, 5, 6** (verificado en runtime, `lead-wizard.tsx:120-212`).
**Impacto:** mitigado porque la tarjeta activa domina y el resto está colapsado ("Se habilita cuando…"). Pero para un no-técnico leyendo de arriba a abajo, los números contradicen el orden. Mejora menor.
**Propuesta:** dado que los números aparecen en copy de muchos lados ("enviá el link (Paso 9)", "Mandá el opener (Paso 7)", "Paso 10"), renumerar es un cambio ancho y riesgoso para ganancia chica. Alternativa barata: que cada tarjeta colapsada muestre un guion de "qué desbloquea" en vez de pelear con el número. **Baja prioridad — documentar, no urgente.**

### H7 — Superficie de revisión: el estado "Sin self-check" se muestra como normal *(SEGURO, menor)*
**Qué:** En `/admin/leados/[leadId]`, un lead sin self-check muestra "Sin self-check — lo puebla el paso de construcción (B4)" (observado en runtime sobre Café La Esquina). Pero un lead **no puede** llegar a EN_REVISION sin `selfCheckAprobado` (`dossier.actions.ts:345-350`). Si la superficie muestra "sin self-check", es una anomalía (algo salteó el gate), no un estado normal.
**Dónde:** `admin/leados/[leadId]/_components/dossier-panels.tsx` (panel self-check) — copy observado en runtime.
**Impacto:** menor (en runtime es artefacto de datos QA que forzaron EN_REVISION sin self-check). Pero si pasara en prod, el copy tranquiliza cuando debería alertar a Franco.
**Propuesta:** cuando un dossier EN_REVISION/APROBADA no trae self-check, mostrar un aviso ("⚠ Esta demo no tiene self-check registrado — revisá con más cuidado") en vez del texto neutro. Menor.

### H8 — Bypass QA roto por `passwordResetRequired` (residual conocido B7) *(SENSIBLE)*
**Qué:** Ya diagnosticado en bitácora. Confirmado: `prisma/seed.ts:144,152` crea `setter-qa@develop.test` con `passwordResetRequired: true`; el callback `jwt` de `src/auth.ts:241-261` re-deriva ese campo de la DB en cada refresh (rama `!user`), pisando el `false` del token qa-bypass → middleware manda a `/cambiar-password` y la sesión QA muere. Hoy vive solo por un workaround manual en la DB dev (flag en false), que el próximo `seed` revierte.
**Dónde:** `prisma/seed.ts:137-154`, `src/auth.ts:237-275`, `src/app/api/qa/login/route.ts:169` (mintea `false`).
**Propuesta (elegida):** **opción (a)** — el seed crea el setter QA con `passwordResetRequired: false`. Razón: toca SOLO datos de test, no debilita el path real de auth, y alinea el estado seedeado con la intención del bypass (ambos `false`). El alta REAL del setter (que sí fuerza cambio de password) no pasa por el seed → no se ve afectada. Descarto la opción (b) (que el jwt respete el claim `qa-bypass` y no re-derive) porque mete una rama QA-condicional en el hot path de seguridad real, peor smell que arreglar datos de test. Clase SENSIBLE → commit aparte con justificación.

---

## 4. Resumen ejecutable

| # | Hallazgo | Gravedad | Clase | Acción en esta sesión |
|---|----------|----------|-------|------------------------|
| H1 | Compensación no-op en `confirmarReunion` | corrección | SENSIBLE | **Ejecutar** |
| H8 | Bypass QA roto (`passwordResetRequired`) | bloqueante QA | SENSIBLE | **Ejecutar** (seed = false) |
| H3 | CALL_AGENDADA muestra acción de dossier | fricción seria | SEGURO | **Ejecutar** |
| H5 | Superficies admin sin cross-link | pulido alto | SEGURO | **Ejecutar** (si entra) |
| H4 | Stepper omite outreach/agenda | coherencia | SEGURO | Ejecutar mínimo (re-etiquetar) o proponer |
| H7 | "Sin self-check" se ve normal | menor | SEGURO | Ejecutar si entra |
| H2 | RE_SEGUIMIENTO no deja re-agendar | fricción seria | PROPUESTA | **No ejecutar** (tradeoffs de invariante) |
| H6 | Numeración en zigzag | pulido | SEGURO | Documentar, baja prioridad |

> Las propuestas no ejecutadas y su recomendación quedan en `b8a-changelog.md` (sección Propuestas) y en el reporte final.
