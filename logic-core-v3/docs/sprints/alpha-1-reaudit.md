# Sprint Alpha.1 — Re-auditoría funcional + Gap Analysis

**Fecha:** 2026-05-17
**Tipo:** Solo lectura — sin cambios de código

---

## TAREA 1 — Verificación Alpha.0.5

| Item | Estado | Evidencia |
|---|---|---|
| 1.A React.cache aplicado | ✅ OK | 6 funciones cacheadas: `getClientChatbotSession`, `checkClientHasChatbot`, `getSubscriptionForOrg`, `resolveOrgId`, `isAdminPreview`, `getImpersonationSession` |
| 1.B Botones Agency Dashboard | ✅ OK | "Configurar bot" (L101), "Editar conocimiento" (L108), "Ver detalle completo" (L114) en ChatbotManager.tsx |
| 1.C Sidebar "Mi Chatbot" | ✅ OK | Línea 14 de SidebarNav.tsx: `{ href: '/dashboard/chatbot', label: 'Mi Chatbot', icon: Bot }` — siempre visible, no condicional |
| 1.D Componentes dashboard | ✅ OK | `ChatbotUpsellLanding.tsx` y `ChatbotOverview.tsx` existen en `src/modules/chatbot/components/dashboard/` |
| 1.E Activity Log formato | ✅ OK | `formatTime()` usa `hour12: false` con locale `es-AR`, incluye lógica de "hoy"/"ayer"/fecha completa |

**Resultado: 5/5 items verificados. Sin refixes urgentes.**

---

## TAREA 2 — Auditoría funcional página por página

### 1. `/admin` (Dashboard KPIs — 846 líneas)

| Aspecto | Estado | Detalle |
|---|---|---|
| Búsqueda | N/A | Es dashboard de métricas |
| Filtros | N/A | |
| Sort | N/A | |
| Paginación | N/A | |
| Empty state | ✅ OK | Charts muestran texto si no hay datos |
| Loading state | ⚠ Básico | Solo `admin/loading.tsx` (root), sin skeleton específico |
| Error boundary | ❌ Falta | No existe `error.tsx` en ningún nivel admin |
| Toast notifications | N/A | |
| Workflow completo | ✅ Sí | Solo lectura |
| Confirmaciones | N/A | |
| **Prioridad** | **P1** | Error boundary faltante |

### 2. `/admin/agency-dashboard`

| Aspecto | Estado | Detalle |
|---|---|---|
| Búsqueda | N/A | |
| Filtros | N/A | |
| Empty state | ✅ OK | "No hay clientes activos" |
| Loading state | ⚠ Básico | Hereda root loading |
| Error boundary | ❌ Falta | |
| Toast | ⚠ Básico | ProjectManager tiene un TODO: "Optionally show a toast here" |
| Workflow completo | ✅ Sí | Botones navegan a rutas multi-tenant |
| **Prioridad** | **P1** | Toast pendiente en ProjectManager |

### 3. `/admin/clients`

| Aspecto | Estado | Detalle |
|---|---|---|
| Búsqueda | ❌ Falta | No hay input de búsqueda |
| Filtros | ❌ Falta | No hay filtros por estado/servicio |
| Sort | ❌ Falta | |
| Paginación | ❌ Falta | Lista completa sin paginar |
| Empty state | ✅ OK | "No hay clientes para mostrar" |
| Loading state | ⚠ Básico | Hereda root |
| Error boundary | ❌ Falta | |
| **Prioridad** | **P1** | Con pocos clientes es aceptable, pero escala mal |

### 4. `/admin/clients/[clientId]` (Detalle)

| Aspecto | Estado | Detalle |
|---|---|---|
| Empty state | ✅ OK | "No hay usuarios vinculados" |
| Loading state | ⚠ Básico | |
| Error boundary | ❌ Falta | |
| Toast | ❌ Falta | Module toggle tiene toast, pero overview no |
| Workflow | ✅ Sí | Navega a sub-secciones |
| **Prioridad** | **P2** | Funcional pero sin feedback visual |

### 5. `/admin/clients/new` (Wizard onboarding)

| Aspecto | Estado | Detalle |
|---|---|---|
| Validación de inputs | ⚠ Básico | Validación HTML required, no server-side |
| Error handling | ⚠ Básico | No se muestra error si creación falla |
| Loading state | ⚠ Básico | Sin skeleton ni spinner visible durante creación |
| Workflow | ⚠ Parcial | Funciona pero sin feedback de progreso real |
| **Prioridad** | **P0** | Wizard es flujo crítico — sin validación robusta ni error feedback |

### 6. `/admin/clients/[slug]/chatbot/overview`

| Aspecto | Estado | Detalle |
|---|---|---|
| Métricas | ✅ OK | Muestra overview de conversaciones/leads/tokens |
| Loading | ⚠ Básico | |
| Error boundary | ❌ Falta | |
| **Prioridad** | **P2** | Solo lectura |

### 7. `/admin/clients/[slug]/chatbot/config`

| Aspecto | Estado | Detalle |
|---|---|---|
| Toast | ✅ OK | `toast.success`/`toast.error` en BotConfigEditor |
| Validación | ⚠ Básico | Solo client-side |
| Test email | ✅ OK | Botón de envío de email de test |
| Error boundary | ❌ Falta | |
| Workflow | ✅ Sí | Editar + guardar funciona |
| **Prioridad** | **P1** | Funcional pero tiene `as any` cast (L17) — deuda técnica |

### 8. `/admin/clients/[slug]/chatbot/knowledge`

| Aspecto | Estado | Detalle |
|---|---|---|
| Toast | ✅ OK | `toast.success`/`toast.error` en KnowledgeBaseEditor |
| Validación | ⚠ Básico | |
| Error boundary | ❌ Falta | |
| Workflow | ✅ Sí | |
| **Prioridad** | **P1** | Funcional |

### 9. `/admin/clients/[slug]/chatbot/conversations`

| Aspecto | Estado | Detalle |
|---|---|---|
| Búsqueda | ❌ Falta | |
| Filtros | ❌ Falta | |
| Paginación | ❌ Falta | Hardcoded `limit: 100` |
| Empty state | ⚠ Básico | Depende de ConversationsTable |
| **Prioridad** | **P1** | Sin búsqueda ni paginación — escala mal |

### 10. `/admin/clients/[slug]/chatbot/leads`

| Aspecto | Estado | Detalle |
|---|---|---|
| Búsqueda | ❌ Falta | |
| Filtros | ❌ Falta | |
| Paginación | ❌ Falta | Hardcoded `limit: 100` |
| Empty state | ⚠ Básico | |
| **Prioridad** | **P1** | Mismo problema que conversations |

### 11. `/admin/clients/[slug]/chatbot/activity`

| Aspecto | Estado | Detalle |
|---|---|---|
| Live updates | ✅ OK | Polling cada N segundos |
| Formato | ✅ OK | 24h, fecha relativa |
| Filtros | ❌ Falta | No hay filtro por level |
| **Prioridad** | **P2** | Funcional |

### 12. `/admin/leads`

| Aspecto | Estado | Detalle |
|---|---|---|
| Pipeline visual | ✅ OK | Kanban con drag-and-drop |
| Filtros | ✅ OK | Tabs por estado |
| Empty state | ✅ OK | EmptyState en cada columna |
| Confirmaciones | ✅ OK | ConfirmDialog para delete |
| Toast | ❌ Falta | Actions no notifican éxito |
| Paginación | ❌ Falta | |
| **Prioridad** | **P1** | Funcional, falta toast en CRUD |

### 13. `/admin/projects`

| Aspecto | Estado | Detalle |
|---|---|---|
| Filtros | ✅ OK | Por status, serviceType, visibility |
| Empty state | ✅ OK | "Todavía no hay proyectos" |
| Confirmaciones | ✅ OK | ConfirmDialog en task-list y time-entry |
| Toast | ❌ Falta | CRUD sin toast |
| Paginación | ❌ Falta | |
| **Prioridad** | **P2** | Bien construido |

### 14. `/admin/team`

| Aspecto | Estado | Detalle |
|---|---|---|
| Empty state | ✅ OK | EmptyState en workload |
| **Prioridad** | **P2** | Solo lectura |

### 15. `/admin/tickets`

| Aspecto | Estado | Detalle |
|---|---|---|
| Filtros | ✅ OK | Tabs OPEN/IN_PROGRESS/RESOLVED |
| Empty state | ✅ OK | "No hay tickets en esta bandeja" |
| Paginación | ❌ Falta | |
| **Prioridad** | **P2** | Funcional |

### 16. `/admin/messages`

| Aspecto | Estado | Detalle |
|---|---|---|
| Empty state | ✅ OK | "No hay conversaciones activas" |
| **Prioridad** | **P2** | Funcional |

### 17. `/admin/settings`

| Aspecto | Estado | Detalle |
|---|---|---|
| Toast | ✅ OK | `toast.success`/`toast.error` |
| Empty state | ✅ OK | "No hay miembros internos" |
| **Prioridad** | **P2** | Bien construido |

### 18. `/admin/chatbot/health`

| Aspecto | Estado | Detalle |
|---|---|---|
| **Prioridad** | **P2** | Solo lectura |

### 19. `/admin/chatbot/activity`

| Aspecto | Estado | Detalle |
|---|---|---|
| Error state | ⚠ Básico | "Bot no encontrado" como div rojo |
| **Prioridad** | **P2** | Funcional |

---

## TAREA 3 — Gap Analysis priorizado

### P0 — Bloquean uso operativo

1. **Error boundaries inexistentes** — Todo `/admin/*` — Si un Server Component falla, el usuario ve la página blanca de Next.js por defecto sin manera de recuperarse
2. **Wizard onboarding sin validación robusta ni error feedback** — `/admin/clients/new` — Si la creación falla server-side, el usuario no recibe feedback; sin spinner durante submit

### P1 — Pulido importante

3. **Loading states solo en root** — Todo `/admin/*` — Solo existe `admin/loading.tsx` global, no hay skeletons por sección
4. **Búsqueda y filtros faltantes en clients** — `/admin/clients` — Sin input de búsqueda ni filtros por estado/servicio
5. **Paginación faltante en conversaciones y leads chatbot** — `/admin/clients/[slug]/chatbot/conversations` y `leads` — Hardcoded `limit: 100`, no escala
6. **Toast faltante en CRUD de leads (OS)** — `/admin/leads` — Acciones de pipeline no notifican éxito/error
7. **Toast faltante en ProjectManager** — `/admin/agency-dashboard` — TODO explícito en código (L21)
8. **`as any` cast en bot config page** — `/admin/clients/[slug]/chatbot/config` — Deuda técnica: `data.bot as any`
9. **Filtros faltantes en chatbot activity** — `/admin/clients/[slug]/chatbot/activity` — Sin filtro por level (info/warn/error)

### P2 — Nice-to-have

10. **Búsqueda en leads chatbot** — `/admin/clients/[slug]/chatbot/leads` — Buscador por nombre/email
11. **Paginación en tickets** — `/admin/tickets` — No escala con muchos tickets
12. **Paginación en projects** — `/admin/projects` — No escala
13. **Sort en client list** — `/admin/clients` — No hay sort por nombre/fecha
14. **Skeleton por sección** — Cada sub-ruta admin debería tener su propio loading skeleton

---

## TAREA 4 — Mapeo de gaps a sprints Alpha.2-5

### Alpha.2 — Onboarding wizard + Error boundaries globales
- **P0:** Error boundaries: crear `error.tsx` en `/admin/`, `/admin/clients/[clientId]/chatbot/`, y `/admin/projects/[projectId]/`
- **P0:** Wizard onboarding: validación server-side, spinner durante submit, error feedback
- **P1:** Loading state: crear `loading.tsx` en sub-rutas clave (clients, leads, projects)

### Alpha.3 — KB Editor + Conversations/Leads chatbot
- **P1:** Paginación en `/admin/clients/[slug]/chatbot/conversations` — reemplazar hardcoded 100 por cursor pagination
- **P1:** Paginación en `/admin/clients/[slug]/chatbot/leads` — idem
- **P2:** Búsqueda en chatbot leads — input por nombre/email
- **P1:** Filtros en chatbot activity — dropdown por level

### Alpha.4 — BotConfig Editor + Typing cleanup
- **P1:** Eliminar `as any` cast en config page — tipado correcto de BotConfig → BotConfigEditor props
- **P1:** Toast en ProjectManager (agency-dashboard) — reemplazar el TODO
- **P1:** Toast en OS leads CRUD — notificar éxito en move/delete

### Alpha.5 — Client list + polish
- **P1:** Búsqueda y filtros en `/admin/clients` — input + dropdown por estado/servicio
- **P2:** Sort en client list — por nombre, fecha de creación
- **P2:** Paginación en tickets y projects

### Gaps NO mapeados a Alpha.2-5
- P2 #14 (skeleton por sección): Pospuesto a Bloque C (Design System, Alpha.10-12) ya que requiere definir patterns de skeleton reutilizables primero
