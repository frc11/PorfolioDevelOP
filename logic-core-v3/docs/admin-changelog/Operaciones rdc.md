- # develOP — Transversal / Operaciones: registro de cambios (cierre del admin)

- Registro de lo que no pertenece a un módulo solo: el método de trabajo en paralelo (git worktrees), los merges, los fixes de archivos compartidos, el `AdminBackButton`, las migraciones de schema y los lotes de hover. Complementa los registros por módulo (Dashboard, Chatbots, Leads, Demos, Proyectos, Equipo, Clientes). **Cierra el panel admin completo (las 4 áreas: Operaciones, Clientes, Inteligencia, Configuración).** Repo: github.com/frc11/PorfolioDevelOP · app: `logic-core-v3/`. Fecha de cierre: 20 de junio de 2026\.  
-   
- Reemplaza la versión previa "Transversal Operaciones" (que cubría solo la 1ª y 2ª tanda de Operaciones). Esta suma la 3ª gran tanda (Clientes \+ Inteligencia \+ Configuración) y el cierre del admin.  
-   
- ---

- # PARTE I — 1ª tanda: 3 lanes en paralelo (Dashboard, Proyectos+Equipo, Leads)

- 3 módulos en worktrees paralelos, planificados por chats separados, ejecutados por sesiones de CC dedicadas. La pieza que hizo viable el paralelo: una **auditoría previa de "zona de nadie"** (read-only) que mapeó exclusivos vs compartidos. Hallazgo: Proyectos y Equipo son inseparables (comparten `team/_actions/*`) → un solo lane (5 lanes planeados → 3 reales).  
-   
- Merges: Dashboard → Proyectos → Leads (Leads último por las deps de `@dnd-kit`), cada uno `--no-ff` con tsc intermedio. Fixes de shared resueltos en main antes de mergear (StatCard, ConfirmDialog portalizado, z-index). `AdminBackButton` unificado (`3da90cf`).

- # PARTE II — 2ª tanda: paralelo Chatbots \+ Demos \+ bloque main

- Metodología C (mixto): 2 lanes (Chatbots, Demos) \+ bloque secuencial en main (Equipo bug-horas \+ General back button \+ migraciones \+ uploader \+ backdrop-filter \+ 2 lotes de hover). Aislamiento limpio, solapamiento nulo. Fix post-merge de `decision-bar.tsx` (JSX roto por merge con código de Franco). Migración aditiva `convertedToOsLeadId` \+ `BOT_DELETED`. Fix centralizado del `backdrop-filter` en `AdminLayoutClient` (raíz del trap de `position:fixed`). Lotes de hover: patrón único, técnica de `ActivityLog` (la que NO difumina, no la del Dashboard).  
-   
- ---

- # PARTE III — 3ª gran tanda: las 3 secciones restantes (Clientes, Inteligencia, Configuración)

- ## III.1 El método: relevamiento global antes de dividir

- Antes de abrir los chats, un **relevamiento global read-only** de las 3 secciones (Opus ultracode) mapeó el acoplamiento. Veredicto: **las 3 NO comparten ningún archivo propio entre sí** — solo chrome universal de solo-consumo (`@/components/ui`, `@/lib/prisma`, `@/auth`, `AdminErrorBoundary`, `auth-guards`, `action-utils`). Landmine \#1: `src/components/ui/*` (144 importadores) — nadie lo toca como parte de su feature; si hace falta, es un frente "chrome" que mergea primero y solo.  
-   
- Cada sección se subdividió en sub-lanes propias (Clientes: clients/tickets/messages; Inteligencia: alertas/health/actividad; Configuración: settings/audit, design descartado). Orden de merge global: **Inteligencia → Configuración → Clientes** (de menor a mayor superficie de escritura).

- ## III.2 Merge de Inteligencia \+ Configuración (1ª remesa de la 3ª tanda)

- Consolidación por sector en ramas de integración, después a main. `lane/config-design` descartado (no-go). Choque conocido y manejado: `package.json` (Inteligencia sumó `seed:latency`). Inteligencia tocó `ActivityLog` (shared autorizado con Chatbots, sin cambio de firma) → no-regresión de la tab por-bot verificada. Sin schema.

- ## III.3 Merge de Clientes (2ª remesa)

- Merge interno de las 3 sub-lanes a `lane/clientes` (limpio), después a main. `AuditLogClient.tsx` auto-mergeó sin conflicto (config-audit tocó la maquinaria de filtros, clients el render del `reason` → secciones distintas del archivo, git las combinó). `BotPreview.tsx` borrado verificado sin referencias vivas. (Detalle completo: registro de Clientes.)

- ## III.4 Migraciones de la 3ª tanda (supervisadas)

| Commit | Migración | Notas |
| :---- | :---- | :---- |
| `988d1ae` | `Organization`: `city` \+ `avatarEmoji` \+ `avatarImageUrl` \+ `avatarInitials` \+ `internalNotes` \+ `deletedAt` | Aditiva, agrupada (6 columnas nullable). Camino manual \+ `migrate deploy` por el drift de Franco. |
| `d14fcff` | `AgencySettings`: `singleton Boolean @default(true) @unique` | Garantiza el singleton a nivel DB (el `id` era cuid random, sin ancla). 1 fila existente → aplicable directo. |

-   
- Ambas con `migrate deploy` (NO `migrate dev`) por el drift preexistente — ver III.6.

- ## III.5 Tanda de fixes de Clientes (sobre main)

- `city` persistida (`f5ccebc`), `internalNotes` inline \+ editor (`ef97856`/`2c26930`), helper `toErrorMessage` aplicado al leak de ZodError en `updateSettings` (`5e33733`), soft-delete \+ toggle Archivados (`3f1ad22`), avatar emoji+imagen-base64+iniciales-editables (`e8c7ae0`), hard-delete con `TypeToConfirmDialog` \+ cascade opción C \+ audit `CLIENT_DELETED` expandible (`59a22df`).

- ## III.6 El drift de Franco (recurrente, documentado)

- La DB Neon tiene objetos de la setter-lane de Franco que NO están en schema/migrations: `OsLeadSetterMeta` (+ 2 FKs), índices `OsLead_assignedToId_nextFollowUpAt_idx` y `OsLeadActivity_performedById_createdAt_idx`, y (descubierto después) una recreación del enum `ActivityChannel`. `migrate status` NO lo detecta (solo mira `_prisma_migrations`); `migrate diff --from-schema-datasource` sí. Por eso TODAS las migraciones de la 3ª tanda van con `migrate deploy` (no introspecta drift). **Pendiente para el merge de la lane de Franco:** su migración debe registrar esos objetos como ya-aplicados (`migrate resolve --applied`), no recrearlos.

- ## III.7 Limpieza final \+ push

- Código muerto borrado (`289d792`): `deleteClientAction` hard-delete legacy \+ cluster `client-*` (8 componentes) \+ exports muertos de `client.actions.ts` (conservando el re-export de impersonation) — 1999 líneas, tsc verde post-borrado. Seeds de Neon limpiados en una pasada (Inteligencia 14+96+62/3, Messages 39 — solo filas marcadas). Ramas borradas: las sub-lanes, `lane/clientes`, y los 5 backups (post-push). Push a `origin/main`.  
-   
- ---

- # PARTE IV — Episodios de entorno (lecciones operativas, acumuladas)

- **Cliente Prisma stale ≠ baseline rojo.** "model/enum does not exist" con el modelo presente \= cliente stale → `prisma generate` \+ `npm install`.  
- **`npx tsc` agarra un binario global trucho** → usar `.\node_modules\.bin\tsc.cmd --noEmit` desde `logic-core-v3`.  
- **Carpetas:** git desde la raíz; npm/tsc/build desde `logic-core-v3/`.  
- **`migrate status` no detecta drift estructural** — solo `migrate diff --from-schema-datasource`. En DB con drift, usar `migrate deploy` con SQL manual, nunca `migrate dev`.  
- **Worktree remove en Windows:** si `git worktree remove --force` falla por Permission denied (node\_modules lockeado), usar `Remove-Item -Recurse -Force` \+ `git worktree prune`.  
- **Lint ≠ baseline:** distinguir errores nuevos de los baseline aceptados (`set-state-in-effect` en hydration gates, `Date.now()` en render) — no chase-fixear patrones legítimos por una regla agresiva, riesgo de romper hydration.  
-   
- ---

- # PARTE V — Estado final: ADMIN CERRADO

- Las 4 áreas del panel admin quedan cerradas, documentadas y en `origin/main`:  
- 

| Área | Secciones | Estado |
| :---- | :---- | :---- |
| **Operaciones** | Dashboard, Chatbots, Leads, Demos, Proyectos, Equipo | ✅ cerrada (tandas 1 y 2\) |
| **Clientes** | Clientes, Tickets, Messages | ✅ cerrada (tanda 3\) |
| **Inteligencia** | Actividad global, Health score, Alertas | ✅ cerrada (tanda 3\) |
| **Configuración** | Settings, Audit log | ✅ cerrada (tanda 3\) |

-   
- **Pendientes de roadmap arrastrados (no urgentes, fuera del admin cerrado):**  
-   
- Lane de **setter de Franco** sin mergear (drift en la DB esperando su schema — ver III.6).  
- P1 Chatbots: color por ruta no llega al widget runtime.  
- `pipelineOrder` del kanban de Leads (toca schema).  
- Inteligencia mono-bot: scoping per-tenant archivado (3 migraciones que no se hicieron — decisión de producto).  
- Consolidaciones de deuda transversal: date-preset-filter (re-implementado en Leads/Alertas/Actividad/Audit), column-overview, dropdown de período. Sprint de consolidación opcional.  
- Idea agendada: "Cerrar lead → convertir en cliente" con vínculo de ID (feature, en el Drive de features).  
- Route B del preloader / Paint sprint (público).  
-   
- ---

- # PARTE VI — Lecciones transversales (las que valen para cualquier frente futuro)

- **Relevar el acoplamiento ANTES de dividir** hace seguro el paralelo. Las branches aíslan el commit, no el contenido.  
- **Commit por feature**; separar comportamiento de estética; **verificar el entorno antes que el código.**  
- **No automatizar lo que el entorno no permite** (verificación visual \= humano) ni **las decisiones del dueño** (negocio/autorización/infra se traen, no se inventan). La parada obligatoria de CC frenó, en esta tanda sola: 93 errores de Prisma stale tomados como baseline, un cambio de comportamiento escondido bajo "polish", un `migrate dev` que habría disparado reset destructivo, y un hard-delete irreversible sobre una premisa falsa del modelo.  
- **UN patrón compartido** para efectos repetidos; cuando un efecto degrada calidad, copiar la implementación que no degrada.  
- **Migraciones supervisadas:** SQL a la vista antes de tocar Neon; `migrate deploy` aditivo; nunca `reset`.  
- **El `.md` de control y los seeds fuera del repo / marcados** para limpieza segura.  
- 
