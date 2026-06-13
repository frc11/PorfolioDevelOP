# B8A — Changelog de ejecución

**Branch:** `leados/b8a-hardening` · **Base:** `40853cd` (baseline B1–B7) · **Fecha:** 13/jun/2026

Cambios agrupados por **clase de riesgo** para que se puedan mergear por separado:
- **SEGURO** — UI / copy / UX / coherencia de derivación. Mergeable de una pasada.
- **SENSIBLE** — toca auth/seed, la maquinaria de booking o invariantes. Revisar con lupa.

Cada cambio referencia su hallazgo en [`b8a-auditoria.md`](./b8a-auditoria.md).
Verificación transversal: `npx tsc --noEmit` → exit 0 después de cada tanda; recorrido de runtime en `dev:qa` (3002) para los cambios observables.

---

## SEGURO

### S1 — H3: el lead agendado ya no pide "Completá la ficha" en "Agendadas"
**Archivos:** `src/lib/leados/flow.ts` (`proximaAccionPara`).
**Qué:** se agregó un caso explícito `status === 'CALL_AGENDADA'` al tope de `proximaAccionPara`, antes del `switch (stage)`. Ahora devuelve `{ proximaAccion: 'Reunión agendada — la cierra Franco', accionable: false }`.
**Por qué:** un lead con reunión agendada cuyo dossier no avanzó (p.ej. camino caliente preventivo, o el dato QA Vivero El Aromo) mostraba la próxima acción del stage (`Completá la ficha`) dentro del grupo "Agendadas" — incoherencia que mina la confianza del no-técnico.
**Riesgo:** nulo. No toca puertas ni status; solo el texto/accionabilidad derivados para el home-hub. No altera el agrupamiento (`grupoPara` ya mandaba CALL_AGENDADA a "agendadas").
**Verificado:** runtime — la tarjeta de Vivero El Aromo (CALL_AGENDADA + stage FICHA) ahora lee "Reunión agendada — la cierra Franco".

### S2 — H5: cross-link entre las dos superficies admin del mismo lead
**Archivos:** `src/app/(protected)/admin/leados/[leadId]/page.tsx` (revisión B5) · `src/app/(protected)/admin/leads/[leadId]/page.tsx` (pipeline + reunión B7).
**Qué:** en la superficie de revisión de demo se agregó "Ver ficha completa del lead →" (a `/admin/leads/[leadId]`); en el detalle de pipeline se agregó, solo si el lead tiene dossier LeadOS, "Ver revisión de la demo (LeadOS) →" (a `/admin/leados/[leadId]`). Importé `Link` en la página de pipeline (no estaba).
**Por qué:** Franco revisaba la demo en una sección del nav ("Revisión demos") y cerraba la reunión en otra ("Leads"), sin puente — fricción evitable en el cuello de botella del sistema.
**Riesgo:** nulo. Dos `<Link>` de navegación; el reverso es condicional a `lead.dossier` (no aparece en leads no-LeadOS).
**Verificado:** runtime — ambos links presentes y apuntando al lead correcto en las dos direcciones; sin errores de consola.

---

## SENSIBLE

### N1 — H8: el bypass QA deja de morir por `passwordResetRequired` *(auth/seed)*
**Archivos:** `prisma/seed.ts` (usuario `setter-qa@develop.test` + línea de credenciales del log).
**Qué:** el seed crea/actualiza el setter QA con `passwordResetRequired: false` (antes `true`). Comentario nuevo documenta la causa raíz y por qué es a propósito.
**Por qué (elección de fix):** de las opciones diagnosticadas en B7, elegí **(a) seed en false** sobre **(b) que el jwt callback respete el claim `qa-bypass`**. Razón: (a) toca SOLO datos de test, NO debilita el path real de auth (el callback sigue re-derivando `passwordResetRequired` de la DB para todos los usuarios reales, que es una feature de seguridad), y alinea el dato seedeado con la intención del bypass (el route `/api/qa/login` ya mintea el token con `false`). El alta REAL del setter sigue forzando el cambio de password (`passwordResetRequired: true` vía el flujo de alta, no vía seed) — sin cambios.
**Lo que NO cambié (a propósito):** `src/auth.ts` (callback jwt) y `src/app/api/qa/login/route.ts` quedan intactos. La triple-guard del route sigue siendo la frontera de seguridad real.
**Riesgo:** bajo, acotado a entorno dev/test. Tras `npx tsx prisma/seed.ts`, la sesión QA del setter sobrevive a los refresh sin redirect a `/cambiar-password`.
**Acción pendiente de Franco:** correr el seed en dev para reemplazar el workaround manual (DB flag) por el dato correcto. NO afecta prod.
**Verificado:** runtime — la sesión setter minteada vivió el recorrido completo (home + wizard) sin redirect; (el flag ya estaba en false por el workaround manual del 12/jun, este cambio lo hace permanente y resistente al re-seed).

### N2 — H1: la compensación de `confirmarReunion` ya no deja una reunión mentirosa *(maquinaria de booking)*
**Archivos:** `src/lib/leados/agenda.ts` (nuevo `revertirAgendaConfirmadaOwned`) · `src/app/(protected)/setter/_actions/agenda.actions.ts` (catch de compensación + import).
**Qué:** se agregó `revertirAgendaConfirmadaOwned(leadId, userId, bookingUid)` que borra la agenda cuando quedó en `estado: 'AGENDADA'` **filtrando por el `calBookingUid` puntual** (nunca pisa una agenda ajena). El catch de compensación de `confirmarReunion` ahora llama a AMBOS reverts: `revertirAgendandoOwned` (cubre el sub-caso "falló `guardarAgendaOwned`", estado todavía AGENDANDO) y `revertirAgendaConfirmadaOwned` (cubre "falló `registrarContactoComercial`", estado ya AGENDADA).
**Por qué:** el `revertirAgendandoOwned` original filtra por `estado = 'AGENDANDO'`; si el fallo ocurría DESPUÉS de `guardarAgendaOwned` (estado ya AGENDADA), el revert era un no-op → booking cancelado en Cal.com pero `agendaJson` quedaba AGENDADA con uid muerto y status en RESPONDIO. El setter veía una reunión confirmada inexistente y no podía re-agendar. Viola el invariante "nada queda mentiroso".
**Por qué refuerza (no degrada) un invariante:** no introduce doble-booking (el filtro por uid es estricto; el claim sigue exigiendo `agendaJson` NULL). Hace que la compensación REALMENTE limpie, que es lo que el invariante prometía.
**Riesgo:** bajo. Camino solo alcanzable ante fallo de DB entre dos writes; el nuevo helper es aditivo y estrechamente filtrado. `tsc` limpio.
**Verificado:** `tsc --noEmit` exit 0. El camino de fallo no es reproducible sin inyectar un error de DB → queda como **pendiente de verificación de Franco** (forzar un throw en `registrarContactoComercial` y confirmar que el lead queda en RESPONDIO sin agenda, listo para reintentar). La lógica del filtro está revisada arriba.

---

## Propuestas NO ejecutadas (tocan líneas rojas o tienen tradeoffs de diseño)

### P1 — H2: RE_SEGUIMIENTO deja al lead sin poder re-agendar *(recomendación: post-piloto)*
`guardarResultadoReunionAdmin` mantiene `estado: 'AGENDADA'` al registrar RE_SEGUIMIENTO; el lead vuelve a RESPONDIO pero `gateAgenda` lo bloquea para re-agendar. **No lo toqué** porque las tres salidas tienen tradeoffs sobre el invariante de idempotencia/persistencia de agenda:
- (a) nullear `agendaJson` en RE_SEGUIMIENTO → pierde el registro de la 1ª reunión (traspaso, uid, realizada, resultado);
- (b) relajar el claim/`gateAgenda` para sobrescribir → riesgo de doble-booking;
- (c) **(recomendada)** convertir `agendaJson` en historial (array de reuniones) → cambio de contrato `AgendaSchema` y posible migración aditiva.
**Recomendación:** (c) en su propio bloque post-piloto. Mientras tanto, si pasa en el piloto, Franco limpia/re-asigna manualmente. Probabilidad de ocurrencia en el piloto: baja.

### P2 — H4: el stepper superior no representa la mitad de outreach/agenda
`DossierStepper` tiene 5 pasos fijos (Ficha→Revisión) y para un lead EVALUADA en outreach marca "Brief" como actual, aunque el setter esté en opener/seguimiento. **No lo toqué** porque cambiar `pasoActual` para el caso EVALUADA-en-outreach requiere pensarlo con cuidado (no empeorar el resto). **Recomendación:** primero la versión barata — re-etiquetar el stepper para que se lea como "progreso de la DEMO" (no "tu próximo paso"), dejando la guía del "próximo paso" al home-hub y a la tarjeta activa del wizard. Versión completa (journey-aware con hito de Contacto/Agenda) en sprint de pulida.

### P3 — H7: la superficie de revisión muestra "Sin self-check" como estado normal
Un lead no puede llegar a EN_REVISION sin `selfCheckAprobado`; si la superficie lo muestra vacío es una anomalía, no un estado normal. **Recomendación (SEGURO, menor):** cambiar el copy del panel a un aviso ("⚠ Esta demo no tiene self-check registrado — revisá con más cuidado") cuando el dossier esté EN_REVISION/APROBADA sin self-check. No lo ejecuté en esta tanda por presupuesto; es un cambio chico y de bajo riesgo para una próxima.

### P4 — H6: numeración de pasos en zigzag (1,2,7,9,10,3,4,5,6)
Mitigado por el diseño (la tarjeta activa domina). Renumerar es ancho (los números aparecen en copy de muchos lados). **Recomendación:** baja prioridad; si se aborda, en vez de pelear con el número, que cada tarjeta colapsada explique "qué desbloquea".

---

## Estado al cierre de la tanda
- `npx tsc --noEmit` → **exit 0**.
- `npm run build` → ver reporte final.
- Migraciones: **sin cambios** (ningún fix tocó `schema.prisma`). El seed cambió un dato (no es migración).
- Líneas rojas: **ninguna degradada**. N2 refuerza el invariante de compensación; N1 no toca el path de auth real.
