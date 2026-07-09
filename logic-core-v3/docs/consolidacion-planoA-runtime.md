# Consolidación Plano A — Mejoras del runtime del chatbot

> **Qué es:** backlog único de las MEJORAS del runtime (chatbot: `/api/chatbot/*`, widget, KB, scoring, motor), fusionando las cuatro fuentes del Plano A que se solapaban. Es el plan maestro de mejoras de esta evolución; se actualiza en el ritual.
> **Alcance:** solo `[RUNTIME]` + `[COMPARTIDO]`. `[PANEL]` (`/admin`+`/dashboard`) es el otro chat → acá solo punteros. El Plano B (features E) NO entra: es su propio track.
> **Fuentes fusionadas:** (1) brief de traspaso — lo ya ejecutado; (2) `ROADMAP-CHATBOT-bloques-C` (C0–C3); (3) `ROADMAP-MEJORA-post-auditoria` (T0/MH/RB); (4) auditoría read-only del repo 2026-07-07 (~40 hallazgos RT/RE/CO).
> **Generado:** 2026-07-07 · aprobado por Valentino ("ok al backlog").

**Convención de veredictos:** ✅ hecho por la línea base · 🔁 duplicado entre fuentes (→ un hogar canónico) · 🆕 genuinamente nuevo/abierto · 🔒 carril seguridad (Franco) · 🅱️ Plano B disfrazado · 🧩 regla absorbida / diferido.

---

## Tres resultados que cambian el mapa

1. **El "(c) NUEVO" de la auditoría es relativo al repo, no a los planes.** El agente marcó NUEVO todo lo ausente de `docs/roadmap-pendientes.md`, pero C/T0/MH/RB no viven en el repo. Muchos "NUEVO" ya están planificados: `RT-1`=C0.3=MS-E6.1, `RT-4`=RB.2=C0.2. Sin este cruce se reimplementa lo diseñado.
2. **El tier C2 de bloques-C NO es mejora: es Plano B con otro número.** C2.2=E3 (catálogo), C2.3=E2 (memoria), C2.1↔E1 (detección→loop de KB). C2 sale de la consolidación y se funde al track de features. De bloques-C quedan como mejora real **C0, C1, C3**.
3. **Hay un nudo de coordinación, no sprints sueltos.** INFRA.3 + RB.3 + C3.1(cupo) + C3.4 + MH.2 tocan la misma función (`onFinish`/`persistTurn`/cupo en `handleChatRequest.ts`), que es archivo de Franco y toca el connection string. Gateado por la firma real de prod.

---

## 1) Ya hecho — no re-planificar

| Trabajo | Cubierto por | Residual abierto |
|---|---|---|
| `onError` mid-stream + observabilidad de persistencia | INFRA.1 ✅ | Sentry DSN ausente en prod (`[FALTA]`, va a stderr). C3.1 = solo su mitad; "no contar turno + liberar cupo" abierto → cluster 4 |
| Dedup del user message + retry del widget | INFRA.2 🟢 | Race write-write concurrente (RT-8) → misma migración que C3.2. Confirmar commit + decisión handoff-WhatsApp |
| Atribución first-touch | UTM.1 ✅ | Fallback de embed directo |
| Harness de evals + scoring | Q1.1/Q1.2 🟢 | Juez perceptual nunca corrió (falta `ANTHROPIC_API_KEY`). Q1.3 sin hacer |

C3.1 (onError) y las menciones a onError de RB.3 quedan parcialmente cerradas por INFRA.1.

---

## 2) Carril seguridad → Franco (marcados, NO se planifican acá)

- **RT-2** `/smoke` sin auth quema Gemini · **RE-13** `/health` expone internals · **PA-1** `runPreflightChecks` sin auth (admin)
- **RE-16** SSRF/DNS-rebinding n8n (pendiente B5.8) · **RE-7** atribución spoofeable por cualquier origin · **RT-13** sessionId adivinable → secuestro intra-tenant (fix = sessionId no-adivinable/firmado, ≠ `@@unique`; coordinar con cluster 3)
- **Cripto en reposo:** **CO-7** tokens OAuth en texto plano · **PD-1** credenciales onboarding en texto plano etiquetadas "ENCRIPTADO" (también Panel) · **A.4** secret en history sin purga

### Dos fricciones abiertas (decisión de Valentino)
- 🔴 **T0.1 (`/smoke`):** la instrucción de arranque lo mandó a seguridad, pero ROADMAP-MEJORA y el brief lo tienen como microsprint de runtime (excepción explícita al barrido), y su daño real es quema de tokens = prioridad de pricing. **Recomendación: T0.1 queda en runtime (control de costo); solo `/health` + authz/exposición van a Franco.** Pendiente de confirmar.
- 🟠 **RT-5 (turnos `assistant` inyectables):** hallazgo de seguridad, pero el único fix real es reconstruir historial desde `ChatMessage` = el rediseño de contrato de historial del runtime (cluster 2). Va acoplado; el propio RB.2 delega ese refinamiento a E2.

---

## 3) Backlog runtime consolidado

Orden: mejoras primero, fix de costo arriba. Modelo/effort traducido a la instalación actual (mecánico/localizado → **Sonnet 4.6 + Máx**; complejo → **Opus + Máx, rápido OFF**); los tags "low/medium/max" de bloques-C son del vocabulario viejo de `/effort`.

### ⚡ Cluster 1 — Telemetría de costo con modelo equivocado (PRIORIDAD #1)
- **Fuentes:** RT-1 (ALTA, VISTO) = **C0.3** = **MS-E6.1** → 🔁 DUP, bug real abierto.
- **Canónico:** `calculateCost` recibe `plan.llmModel` (misma fuente que `getModel`) + `getModel` con fallback a `gemini-2.5-flash` + **WARN cuando pricing da $0** por modelo desconocido.
- Se pega: **RT-6** (provider Claude stub → 500 + costo 0) — el fallback cierra el 500 runtime; sacar Claude del select admin va **→ Panel**.
- Adyacente: **RE-10b** (insights/brief no registran QuotaUsage → segundo agujero de costo) 🆕 · **CO-9** (modelo hardcodeado ×7 → constante única) 🆕, refactor separado (fuera de este sprint).
- **Verificación:** `SELECT` comparativo one-off en prod → `costUsd registrado ≠ 0` y = `plan.llmModel`. **Sin gate. Candidato a primer bloque.**

### 🛡️ Cluster 2 — Contrato del historial (cap + steering + hard-cap)
- **Fuentes:** RT-4+RT-7 (auditoría Tier 2 #8) · C0.2 · C1.2 · C1.3 · RB.2 → 🔁 DUP grande.
- **Canónico:** server `slice(-N)` en vez de rechazar >50 (RB.2) · widget ventana deslizante + soft-cap 15 → degradación WhatsApp (C0.2) · hard-cap ~40 en el **gating** no en el prompt (C1.3=RT-7) · bajar caps Zod (C1.2).
- **RT-5** (steering): se cierra reconstruyendo desde `ChatMessage`; RB.2 delega ese refinamiento a E2.
- 🔴 **Fork abierto:** ¿solo `slice(-N)` del historial del cliente (mínimo), o reconstruir desde `ChatMessage` (robusto, cierra RT-5, necesita endpoint GET-historial que también pide E2)? **Recomendación: mínimo ahora + DB-autoritativo a E2.**
- Es C0 real ("mata leads calientes hoy") → alto.

### 🚑 Cluster 3 — sessionId compuesto + races P2002
- **(a)** RB.1 (P2002 en getOrCreateConversation → re-leer; en capture_lead → `alreadyCaptured`) = A1.2/A1.6 → 🆕. **Sonnet + Máx, SIN migración, temprano** — corta los 500 ya.
- **(b)** RT-3 = C3.2 = auditoría Tier 2 #9 + RT-8 → 🔁 DUP. **Migración aditiva `@@unique([botConfigId, sessionId])` + widget namespacea key por slug.** Opus + Máx. Una sola migración cierra RT-3 y RT-8. Prereq de E2. ⚠️ protocolo Franco (Neon compartida).

### 🧵 Cluster 4 — Nudo onFinish (coordinado, NO suelto)
| Sub-parte | Fuentes | Estado |
|---|---|---|
| Observabilidad onError | INFRA.1 | ✅ |
| Cupo justo (no contar degradadas + compensar reserva si el stream muere) | MH.2 absorbe C3.1-cupo + C3.5 | 🆕 sensible (Opus + Máx) |
| onFinish transaccional + fallback ante respuesta vacía | RB.3 absorbe C3.4 · RT-12 | 🔁 DUP |
| terminated/P1017 (~13%) retry + `pgbouncer=true` | INFRA.3 | ⏳ connection string |
| Doble rate-limit → 1 write Neon/turno | RT-14 = C3.4-ratelimit | 🆕 menor |
- 🔴 **Gate:** firma real de prod primero (deployar INFRA.1+2, capturar `prismaCode` en Netlify Logs).
- 🔴 **Reconciliar RB.3 `$transaction` vs C3.4 "paralelizar":** recomendación `$transaction` (atomicidad > micro-paralelismo; Vertex domina la latencia). ⚠️ archivo de Franco.

### 📊 Cluster 5 — Métricas honestas (prerreq de R1)
- RE-11 (weekly sin `orderBy`) = MH.1 + `getLatencyHistory` 🆕 · RT-9 (messageCount deriva) + RE-10a (over-fetch 4×) = MH.3 🆕 · RE-12 (weekly sin idempotencia) + RE-10c (guard PENDING falta en ruta admin) = auditoría Tier 2 #15 🆕 · T0.2 (`cleanupOldEvents` cron) 🆕.

### 🎨 Cluster 6 — Widget/embed (defensivo + white-label)
- C0.1 navigate_to_page seed 🆕 (Sonnet + Máx, standalone) · RE-2 config falla → spinner eterno cacheado 🆕 (C0 "no roto") · RE-1 init-request sin handler 🆕.
- **RE-3/A5.1** (shell embed duplicado) = **EST.0** 🅱️ (prereq de EST) · **RE-4/RE-5** (theme muerto, cyan hardcodeado) = **EST.1** exactamente 🅱️ — no tocar aparte.

### 💸 Cluster 7 — Economía del precio fijo (optimización, tras corrección)
- C1.1 nonce HMAC estable → prefijo cacheable (~75% descuento input) 🆕 (toca spotlighting, sensible) · C1.4 medir el efecto 🆕 (no opcional — sin medición es fe).

### 🧹 Cluster 8 — [COMPARTIDO] + deuda
- **CO-1** build ignora tipos/lint 🆕 (cablear `tsc --noEmit` al CI; afecta cómo verificamos todo → coordinar con Panel).
- **C3.6** deuda handler + **A5.2** descomponer `handleChatRequest` (871 líneas) 🧩 regla al tocar el handler / incremental vía MS-E6.2.
- **CO-10** email no-op devuelve `{success:true}` sin key 🆕 (runtime=Resend, admin=Brevo).
- Tier 4: RT-10, **RT-11** (sacar default USADOS_PACK de scoring), RT-12, RE-6, RE-14, RE-15, CO-4, CO-8, CO-11, CO-12.
- Panel/auth (grueso lo dueña el chat Panel): CO-2, CO-3, CO-5, CO-6 (CO-5/6 = migraciones → Franco).

---

## 4) Cross-plane (Plano A ↔ Plano B) — flags

C2.2=E3 · C2.3=E2 (depende de C3.2 ✔) · C2.1↔E1 (detección = mitad-runtime del loop de KB) · MH.4↔C2.1 (salud/detección → panel). Cuando toque planificar features, C2 entra ahí.

---

## 5) Decisiones abiertas que gatean

1. **T0.1** → runtime (rec) o carril Franco.
2. **Firma de prod** (gate cluster 4) → ¿deployar INFRA.1+2 y capturar `prismaCode` real antes del nudo onFinish?
3. **Fork de historial** (cluster 2) → slice mínimo ahora + DB-autoritativo a E2 (rec).
4. **Juez Q1.2** → ¿cargar créditos API para ejercer el juez perceptual, o seguir `--no-judge`?
5. **C3.3 (knobs)** → NO re-confirmado por la auditoría del repo; re-descubrir si temperature/maxOutputTokens realmente se ignoran antes de planificar.
6. **Backfill `verticalPack`** (gate EV) → dato; bloquea paridad de scoring en prod si entra un vertical no-usados.

---

## 6) Orden de ejecución propuesto

1. **Cluster 1 — fix de costo** (sin gate). ← primer bloque.
2. **Cluster 6 defensivo + Cluster 2** (C0 "que no lo vea roto" / leads que mueren).
3. **T0** (T0.1 según decisión, T0.2, T0.3).
4. **Cluster 3** (RB.1 → C3.2 con migración/Franco).
5. **Cluster 4 — nudo onFinish** (gated en firma de prod + Franco).
6. **Cluster 5 (MH)** → habilita R1.
7. **Cluster 7 (C1 economía)** + **Q1.3** (cierre de evals antes de E1).
8. Deuda/higiene (cluster 8) intercalada al tocar cada zona.
9. Recién después, features del Plano B (E1 buque insignia, etc.).

El `00-INDICE-bloques-ejecucion.md` viejo está desactualizado (no integra T0/MH/RB ni "R1 exige MH" ni EST.0) — este documento reemplaza su orden para las mejoras.

---
*Mantenimiento: este es el plan maestro de mejoras del runtime. Los cierres verificados van a `docs/bitacora-roadmap.md` (los escribe CC). Las decisiones diferidas van a `docs/roadmap-pendientes.md`.*
