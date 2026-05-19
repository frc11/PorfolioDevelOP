# Baseline Admin Performance — Mayo 2026

**Fecha de análisis:** 2026-05-19
**Sprint:** R3
**Reportado por:** Franco — "anda remil lento todo el /admin"

---

## Arquitectura del admin panel

- `/admin` → `agency-dashboard/page.tsx` → **redirect a `/admin/clients`** (stub sin datos)
- Hot path real: **`/admin/clients`**
- Layout: `dynamic = 'force-dynamic'` + `noStore()` → todas las rutas del admin son siempre SSR (nunca estáticas)

---

## Root causes identificados

### 1. Sin data cache en queries de admin

Todas las pages del admin hacían queries a Neon en cada request:

| Page | Queries antes de R3 | Queries después de R3 |
|---|---|---|
| `/admin` (layout) | `botAlert.count` en cada request | `unstable_cache` 30s TTL |
| `/admin/clients` | `organization.findMany` + 3 includes + 3 `_count` | `unstable_cache` 60s TTL |
| `/admin/leads` | `osLead.findMany` con activities + `_count` | `unstable_cache` 60s TTL |
| `/admin/projects` | `organization.findMany` (orgs dropdown) | `unstable_cache` 60s TTL |

### 2. Neon cold start (no controlable sin costo)

**Medición:** ~1082ms en primer hit después de inactividad (Neon free plan auto-suspend: 5min).

Esto explica el "remil lento" en la primera visita del día o después de períodos de inactividad.

- **Cold start** = wake-up de la instancia de Postgres en Neon + connection pool setup
- Afecta TODOS los requests post-idle, no solo el admin
- Las optimizaciones de R3 (`unstable_cache`) no mitigan el cold start — solo mejoran warm requests

### 3. Sin N+1 real

Todos los `prisma.findMany` con `include` + `_count.select` fueron revisados. No hay loops
haciendo queries dentro de `.map()`. Prisma genera SELECT IN para relaciones, no query por fila.

### 4. Cache de funciones de auth: OK

`auth()`, `resolveOrgId()`, `isAdminPreview()`, `getClientChatbotSession()` — todos
envueltos en `React.cache()`. No hay duplicación de queries de sesión.

---

## Optimizaciones aplicadas (Sprint R3)

| Opt | Cambio | Archivos |
|---|---|---|
| Opt-1 | `unstable_cache` para `organization.findMany` en clients page (60s, tag `admin-clients`) | `admin/clients/page.tsx` |
| Opt-2 | Suspense en clients page — header renderiza inmediatamente | `admin/clients/page.tsx` |
| Opt-3 | `unstable_cache` para `botAlert.count` en layout (30s, tag `admin-alerts-count`) | `admin/layout.tsx` |
| Opt-4 | `revalidateTag('admin-clients')` en mutaciones de Organization | `lib/actions/clients.ts`, `lib/bulk-actions.ts` |
| Opt-5 | `unstable_cache` para `osLead.findMany` en leads page (60s, tag `admin-leads`) | `admin/leads/page.tsx` |
| Opt-6 | `revalidateTag('admin-leads')` en mutaciones de OsLead | `leads/_actions/lead.actions.ts`, `demo.actions.ts`, `activity.actions.ts` |
| Opt-7 | `unstable_cache` para orgs dropdown en projects page (60s, tags `admin-orgs`, `admin-clients`) | `admin/projects/page.tsx` |

### Queries de BD por request — warm (post-R3)

| Page | Antes | Después | Ahorro |
|---|---|---|---|
| Navegación admin (layout) | 1 query (botAlert.count) | 0 queries (cache hit) | ~50-100ms |
| `/admin/clients` | ~6 queries (findMany + includes + counts) | 0 queries (cache hit) | ~150-300ms |
| `/admin/leads` | ~3 queries (osLead + activities + counts) | 0 queries (cache hit) | ~100-200ms |
| `/admin/projects` | ~1 query (orgs dropdown) | 0 queries (cache hit) | ~30-60ms |

---

## Cold start de Neon — Opciones (no implementadas)

### Opción A: Neon Launch Plan ($19/mo)
- Permite configurar `suspend_timeout` hasta 7 días (vs 5min en free)
- Si hay tráfico diario, elimina el cold start prácticamente en su totalidad
- **Recomendado** para cuando haya clientes reales usando el portal

### Opción B: Warm-up periódico gratuito
- Configurar **UptimeRobot** o **BetterStack** para hacer ping a `/api/health` cada 4 minutos
- Mantiene Neon activo sin costo adicional
- Funciona bien mientras no haya períodos de inactividad >4min consecutivos
- **Recomendado** como medida inmediata y gratuita

### Opción C: Reducir auto-suspend a 1min (no recomendada)
- Neon free permite configurar el timeout de suspensión
- Reducir a 1min aumenta la frecuencia de cold starts, no los elimina

---

## Notas técnicas

- `unstable_cache` opera en el **Data Cache** de Next.js — persiste entre requests del mismo servidor
- `dynamic = 'force-dynamic'` + `unstable_cache` son **compatibles**: la página renderiza SSR (sin HTML estático en disco) pero las queries DB sirven desde el data cache en warm hits
- En Netlify, el data cache persiste mientras la función serverless no se recicla. En entornos con múltiples instancias (scaling horizontal), cada instancia tiene su propio cache — aceptable para un panel admin de agencia con tráfico bajo
- `revalidateTag` invalida el cache inmediatamente cuando hay mutaciones. TTL de 60s solo aplica si el admin no ejecuta ninguna mutación en ese período (el dato nunca estará realmente stale en uso normal)

---

## Próximos pasos

- Activar UptimeRobot/BetterStack para warm-up de Neon (Opción B — gratis)
- Medir warm times reales desde DevTools > Network después de deploy
- Evaluar Neon Launch plan cuando haya clientes con uso diario ($19/mo)
- Re-medir si el número de clientes/leads crece significativamente (las queries se vuelven más lentas a escala)
