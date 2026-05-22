# Cleanup DB — limpieza de basura semántica en dev

**Fecha:** 2026-05-21
**Branch Neon:** `dev` (host `ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`)
**Operador:** Claude Opus 4.7 (sesión asistida por Franco)
**Estado:** ✅ Ejecutado y verificado en dev. **Pendiente replicar en prod** (branch `main` de Neon).
**Fuente:** auditoría previa [`2026-05-auditoria-db.md`](2026-05-auditoria-db.md) §1.4 y §7.J.

---

## 0. Veredicto (5 líneas)

Se removieron 2 orgs duplicadas leftover del seed `v2-unify-project-task` (abril) + 1 Project duplicado + 1 bot de testing (`dsa`) + su KnowledgeBase. Se reasignó el único Project huérfano (`organizationId = null`) a la org `develop`, dejando el camino listo para volver `Project.organizationId` a `NOT NULL` (B11.1). Se desactivó adicionalmente el bot `chatbot` (slug=`chatbot`, en `empresa-demo`) que figuraba activo sin uso real. Todo ejecutado en una sola transacción Prisma; `prisma migrate status` dice "Database schema is up to date" después del cambio. Cero datos legítimos tocados.

---

## 1. Discrepancias del prompt original vs realidad

Antes de ejecutar, la inspección read-only encontró dos cosas que cambiaban el plan:

### 1.1 El bot `dsa` no estaba en `sonrisa-norte` real

El prompt asumía que el bot `dsa` vivía en la org real `sonrisa-norte`. **No.** Vivía en la org DUPLICADA `agency-os-cmnkiw999002u9fdw2xr733hl` (que se llama "Clinica Dental Sonrisa Norte" pero es la copia leftover, no la real). Borrar esa org cascadeó el bot automáticamente — no hizo falta delete separado del bot, y la `sonrisa-norte` real (con su cliente `cliente@sonrisanorte.com`, 1 ticket abierto, 2 services, 1 project) quedó intacta.

### 1.2 La org duplicada de Sigma no estaba vacía

`agency-os-cmnkiwar4003a9fdwr63115kc` (Estudio Contable Sigma duplicada) tenía 1 Project asociado (también duplicado: mismo nombre "Sitio institucional y mantenimiento mensual" que la `sigma-contable` real ya tenía). Como `Project.organizationId` está con `onDelete: SetNull`, borrar la org sin tocar el Project lo hubiera dejado huérfano — lo opuesto del objetivo de B11.1. Se borró el Project explícitamente PRIMERO, después la org.

---

## 2. BACKUP DE LO BORRADO (filas crudas)

Snapshot capturado en read-only antes de la transacción. Si hay que revertir, estos son los datos completos.

### 2.1 Organization `os-org-cmnkiwar4003a9fdwr63115kc` (Sigma duplicada)

```json
{
  "id": "os-org-cmnkiwar4003a9fdwr63115kc",
  "companyName": "Estudio Contable Sigma",
  "slug": "agency-os-cmnkiwar4003a9fdwr63115kc",
  "logoUrl": null, "analyticsPropertyId": null, "siteUrl": null,
  "n8nWorkflowIds": [],
  "onboardingCompleted": false,
  "whatsapp": null, "notificationPrefs": null,
  "leadNotificationEmail": null, "leadNotificationMode": "IMMEDIATE",
  "createdAt": "2026-04-06T04:20:47.594Z",
  "dataConnections": null,
  "googleRating": null, "googleReviewsCount": 0,
  "executiveBriefRegenerations": 0
  // todos los campos opcionales = null
}
```

### 2.2 Project `cmnkiwar4003a9fdwr63115kc` (proyecto duplicado de Sigma) + cascade

```json
{
  "id": "cmnkiwar4003a9fdwr63115kc",
  "name": "Sitio institucional y mantenimiento mensual",
  "description": "Proyecto entregado con sitio institucional, formularios de contacto y automatizaciones livianas.",
  "status": "COMPLETED",
  "agreedAmount": "900",
  "monthlyRate": "120",
  "maintenanceStartDate": "2026-02-19T13:00:00.000Z",
  "deliveredAt": "2026-02-18T21:00:00.000Z",
  "estimatedEndDate": "2026-02-21T21:00:00.000Z",
  "osLeadId": null,
  "organizationId": "os-org-cmnkiwar4003a9fdwr63115kc"
}
```

**Cascade del Project (todo borrado por `onDelete: Cascade`):**

```json
// Tasks (2)
[
  { "id": "cmnkiwbec003k9fdwljvhbb4j", "title": "Sitio institucional y pages de servicios", "status": "DONE", "createdAt": "2026-04-06T06:20:15.556Z" },
  { "id": "cmnkiwbk8003m9fdweqppn2ct", "title": "Formularios y derivacion de consultas", "status": "DONE", "createdAt": "2026-04-06T06:20:15.556Z" }
]
// OsPaymentMilestone: 2 filas (no detalladas)
// OsMaintenancePayment: 2 filas (no detalladas)
// OsTimeEntry: 0 filas
```

### 2.3 Organization `os-org-cmnkiw999002u9fdw2xr733hl` (Sonrisa duplicada)

```json
{
  "id": "os-org-cmnkiw999002u9fdw2xr733hl",
  "companyName": "Clinica Dental Sonrisa Norte",
  "slug": "agency-os-cmnkiw999002u9fdw2xr733hl",
  "logoUrl": null, "siteUrl": null,
  "n8nWorkflowIds": [],
  "onboardingCompleted": false,
  "whatsapp": null,
  "createdAt": "2026-04-06T04:20:47.594Z"
  // resto null
}
```

**Cascade de la org (todo borrado por `onDelete: Cascade`):**

```json
// BotConfig (dsa)
{
  "id": "cmpfw87ek00019frols4y75p9",
  "organizationId": "os-org-cmnkiw999002u9fdw2xr733hl",
  "slug": "dsa", "botName": "dsa", "isActive": false,
  "accentColor": "#06b6d4",
  "avatarStyle": "neuro",
  "tone": "informal_rioplatense",
  "welcomeMessage": "¡Hola! Soy dsa. ¿En qué te puedo ayudar hoy?",
  "proactivePrompts": { "default": ["¿En qué puedo ayudarte?"] },
  "quickReplies": [
    { "id": "turno", "label": "Quiero un turno", "prompt": "Quiero sacar un turno" },
    { "id": "obras", "label": "Obras sociales", "prompt": "¿Trabajan con mi obra social?" },
    { "id": "urgencia", "label": "Tengo urgencia", "prompt": "Tengo dolor, necesito atención urgente" },
    { "id": "precios", "label": "Precios", "prompt": "¿Cuánto cuesta una consulta?" }
  ],
  "whatsappNumber": "das",
  "llmProvider": "google", "llmModel": "gemini-2.5-flash",
  "temperature": 0.7, "maxOutputTokens": 800,
  "monthlyQuota": 1000,
  "allowedDomains": [],
  "industry": "medico_odontologico",
  "createdAt": "2026-05-21T19:38:11.707Z"
}

// KnowledgeBase (del bot dsa)
{
  "id": "cmpfw87id00039fromrpm1jmj",
  "botConfigId": "cmpfw87ek00019frols4y75p9",
  // 7 secciones, todas template con placeholders {{...}} sin completar
  // contenido omitido del backup por ser plantilla genérica del industry medico_odontologico
}
```

`_count` del bot dsa antes de borrar: `{ conversations: 0, leads: 0, quotaUsages: 0, events: 0, insights: 0, alerts: 0 }` — nada útil que perder.

---

## 3. Cambios no destructivos (reasignaciones)

### 3.1 Project huérfano reasignado

```diff
// id: osv2-project-agency-os-internal-motor-interno-de-automatizacion-operativa
{
  "name": "Motor interno de automatizacion operativa",
  "status": "IN_PROGRESS",
  "agreedAmount": "3000",
- "organizationId": null,
+ "organizationId": "cmp2rnpv000009fdgr680t5bq"  // → org develop
  "tasks": 4 (1 DONE, 2 IN_PROGRESS, 1 TODO),
  "paymentMilestones": 2,
  "timeEntries": 4
}
```

Las 4 tasks y 4 time entries asociados quedan vivos bajo la org `develop`. Esto **desbloquea B11.1** (volver `Project.organizationId` a `NOT NULL`).

### 3.2 Bot `chatbot` desactivado

```diff
// BotConfig slug=chatbot, en org empresa-demo
- "isActive": true,
+ "isActive": false,
```

El bot estaba activo pero con 0 conversations, 0 leads, 0 events — claramente un leftover de testing. Decisión de Franco durante la sesión.

---

## 4. Counts antes/después

| Tabla | Antes | Después | Δ |
|---|---:|---:|---:|
| Organization | 8 | **6** | -2 |
| OrgMember | 5 | 5 | 0 |
| Project | 8 | 7 | -1 |
| ProjectsOrphan (`organizationId IS NULL`) | 1 | **0** | -1 |
| Task | 34 | 32 | -2 |
| BotConfig | 3 | **2** | -1 |
| KnowledgeBase | 3 | 2 | -1 |
| OsPaymentMilestone | 10 | 8 | -2 |
| OsMaintenancePayment | 4 | 2 | -2 |
| OsTimeEntry | 29 | 29 | 0 |

**Integrity checks post-cleanup:**
- ✅ `Projects still orphan: 0`
- ✅ `Sigma dup org gone: true`
- ✅ `Sonrisa dup org gone: true`
- ✅ `Bot dsa gone: true`
- ✅ `Orphan project reassigned to develop: true`
- ✅ `Bot chatbot isActive = false`

---

## 5. Verificación post-cleanup

```
$ npx prisma migrate status
42 migrations found in prisma/migrations
Database schema is up to date!
```

✅ Sin drift. La limpieza fue solo de datos, no de schema.

```
$ npm run build
✗ Falla — pero NO por el cleanup.
```

El build rompe en `src/lib/ai/executive-brief.ts:233`: una migración in-progress de Anthropic SDK → Vercel AI SDK (commit aún sin hacer en `git status` inicial) usa `maxTokens: 200` donde el Vercel AI SDK espera `maxOutputTokens: 200`. **Fix de una línea, fuera del scope de este sprint.** Spawneado como task separada.

---

## 6. PASOS PARA REPLICAR EN PROD

> ⚠️ Antes de correr en prod: validá visualmente en dev que el admin no tiene basura (panel de chatbots, panel de clientes). Después seguí estos pasos.

### Pre-requisitos

1. Tener `DATABASE_URL` apuntando a la branch `main` de Neon en una variable temporal (no en `.env` ni `.env.local` — que apuntan a dev y NO se deben tocar).
2. Tener un backup logical de Neon de `main` (Neon hace point-in-time recovery automático — verificar en el dashboard que existe un restore point reciente).
3. Confirmar que en prod existen los 6 IDs target con un SELECT read-only (los IDs pueden ser distintos si en prod no se ejecutaron los mismos seeds — verificar antes).

### Verificación read-only en prod

Correr el inspector con la URL de prod:

```powershell
# Desde logic-core-v3/
$env:DATABASE_URL = "<URL prod copiada del dashboard de Neon>"
node scripts/_db-cleanup-inspect.mjs
node scripts/_db-cleanup-inspect2.mjs
```

Verificar que:
- Las 2 orgs `agency-os-cmnki...` existen y tienen los mismos counts que en dev.
- Existe el Project huérfano con `organizationId = null`.
- Existe la org `develop`.
- Si los IDs internos son distintos en prod (probable si los seeds corrieron en distinto orden), **actualizá los IDs hardcoded** en `scripts/_db-cleanup-execute.mjs` antes de seguir.

### Ejecutar en prod

```powershell
# Desde logic-core-v3/, con DATABASE_URL ya apuntando a main de Neon:
node scripts/_db-cleanup-execute.mjs
```

El script tiene un safety check al inicio: si el host no coincide con el dev (`ep-quiet-waterfall-acv0fpll...`), **aborta**. Para correrlo en prod hay que comentar/cambiar el check de host en el script — punto explícito a hacer manualmente para no autodisparar destructivos en prod.

Cambio puntual a hacer en `scripts/_db-cleanup-execute.mjs`:

```diff
- const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech';
+ const EXPECTED_PROD_HOST = '<host de la branch main de Neon>';
...
- if (host !== EXPECTED_DEV_HOST) {
+ if (host !== EXPECTED_PROD_HOST) {
```

Después correr el script. Va a:
1. Verificar host = prod
2. Verificar que todos los targets existen
3. Imprimir baseline counts
4. Ejecutar transacción (las 5 ops atómicas)
5. Imprimir counts post y diff
6. Imprimir integrity checks

Si **cualquier** target no existe o tiene state inesperado, el script aborta antes de tocar nada.

### Post-prod

1. `npx prisma migrate status` con DATABASE_URL = prod → debe decir "Database schema is up to date".
2. Hacer un smoke en el admin de la app desplegada: que los listados de chatbots y clientes ya no muestren las orgs/bot fantasma.
3. **Limpiar los scripts temporales** (`scripts/_db-cleanup-*.mjs`) — son throwaway, no van al repo final. Borrar con confianza:
   ```powershell
   Remove-Item scripts/_db-cleanup-inspect.mjs, scripts/_db-cleanup-inspect2.mjs, scripts/_db-cleanup-execute.mjs
   ```

---

## 7. Lo que NO se hizo (intencionalmente)

- **No se borró el bot `chatbot` ni su org `empresa-demo`** — solo se desactivó. Si Franco confirma que es totalmente prescindible, sería otro sprint corto.
- **No se aplicó la migration pendiente `20260520190000_add_alert_types`** — está identificada en la auditoría previa como urgente pero es un sprint propio (afecta enum `BotAlertType`, no datos).
- **No se ejecutó `Project.organizationId → NOT NULL`** — ahora que `ProjectsOrphan = 0`, el camino está libre, pero requiere migration Prisma generada con `migrate dev` que también es sprint propio (B11.1).
- **No se tocó la org `ejemplo`** (1 member, 1 service, 0 projects) — no estaba en scope. Es candidato a revisar.

---

## 8. Scripts utilizados

Tres scripts throwaway dentro de `logic-core-v3/scripts/` (prefijo `_` para señal de temporal):

| Archivo | Función | Reusable en prod |
|---|---|---|
| `_db-cleanup-inspect.mjs` | Read-only: dump filas + counts cascade | ✅ con DATABASE_URL=prod |
| `_db-cleanup-inspect2.mjs` | Read-only round 2: aclaró el caso del Project bajo Sigma duplicado | ✅ con DATABASE_URL=prod |
| `_db-cleanup-execute.mjs` | Destructivo: transacción + integrity checks | ⚠️ requiere cambiar el host check |

**Decisión:** se dejan en el repo hasta que se complete prod. Borrar después.

---

*Fin del documento. Re-leer antes de tocar prod.*
