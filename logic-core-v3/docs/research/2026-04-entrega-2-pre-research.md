# Entrega 2 — Pre-Research Técnico

Generado: 2026-04-27
Para: Planificación de Design System + Home rediseñado

## 1. Convenciones de estilo actual

### 1.1. Paleta de colores en uso
Basado en una auditoría de `src/components/dashboard` y `src/app/globals.css`.

| Color Tailwind | Uso Predominante | Hex / Referencia |
| :--- | :--- | :--- |
| `cyan-400` / `cyan-500` | Acentos principales, links, bordes de enfoque. | `#06b6d4` / `#00e1ff` |
| `zinc-950` / `zinc-900` | Backgrounds profundos (Void), sidebar. | `#09090b` / `#18181b` |
| `zinc-500` / `zinc-600` | Textos secundarios, iconos inactivos. | Neutros |
| `zinc-100` / `zinc-200` | Textos primarios (Obsidian inverted). | Neutros |
| `emerald-400` / `emerald-500` | Éxito, tareas finalizadas, ROI positivo. | Verde |
| `rose-400` / `rose-500` | Alertas, métricas en caída. | Rojo |
| `amber-400` / `amber-500` | Pendientes, advertencias, "Demo" badge. | Naranja/Oro |
| `violet-400` / `violet-500` | IA / NeuroAvatar components, upsells. | Violeta |
| `blue-400` / `blue-500` | Tareas en curso (In Progress). | Azul |

**Opacidades comunes:**
- `/5`: Fondos de cards sutiles.
- `/10`: Bordes y fondos interactivos.
- `/20`: Glows ligeros, hover states.
- `/30`: Enfoque / Focus rings.
- `/80`: Backdrops pesados (Glassmorphism).

### 1.2. Tokens espaciado
- **Padding en cards**: Predomina `p-5` (móvil) y `p-6` a `p-8` (desktop).
- **Gaps entre secciones**: `gap-8` y `gap-10` son el estándar en el layout principal. Gaps internos de cards: `gap-3` y `gap-4`.
- **Max-width containers**: `max-w-7xl` (1280px) centrado con `mx-auto`.

### 1.3. Tipografía (Inter / Geist Sans)
- **Headings**: `text-3xl` (mobile) y `text-4xl` (desktop). Siempre `font-black` o `font-bold` con `tracking-tight`.
- **Body**: `text-sm` (estándar), `text-xs` (etiquetas), `text-[10px]` (meta-data), `text-[9px]` (subscripts).
- **Estilos**: `tracking-tight` en títulos grandes, `tracking-[0.2em]` o `tracking-widest` en labels uppercase.

### 1.4. Border radius
- **Default**: `rounded-2xl` (1rem).
- **Cards especiales**: `rounded-[2rem]` (en Pipeline de Negocio).
- **Botones/Inputs**: `rounded-xl` o `rounded-lg`.

### 1.5. Glassmorphism / Cards
- **Pattern `admin-surface`**: 
  - `background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02) 62%, rgba(6,182,212,0.03))`
  - `border: 1px solid rgba(255,255,255,0.08)`
  - `backdrop-filter: blur(20px)`

---

## 2. Patrones de componentes

### 2.1. Animaciones Framer Motion
- **Wrappers**: Se usan `FadeIn.tsx`, `StaggerContainer` y `StaggerItem` (en `StaggerWrapper.tsx`).
- **Configuración**: 
  - `FadeIn`: `initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}`, `transition={{ type: 'spring', stiffness: 80, damping: 15 }}`.
  - `AnimatedCounter`: Usa `useSpring` con `stiffness: 200, damping: 50`.
- **InView**: `AnimatedCounter` usa `useInView({ once: true })`.

### 2.2. Iconografía
- **Librería**: `lucide-react`.
- **StrokeWidth**: 1.5 (validado en landing y componentes dashboard).
- **Tamaños**: 13 (timeline), 16 (iconos de sección), 24-28 (iconos grandes en cards como LeakMeter).

### 2.3. Estados loading/empty
- **Loading**: Existen `src/app/(protected)/dashboard/loading.tsx` y `src/app/(protected)/admin/loading.tsx`. Se utiliza `AnalyticsSkeleton` para métricas.
- **Empty State**: `EmptyState.tsx` implementado con efectos de "Radar" y soporte para iconos custom. Usado en `recentTasks` cuando no hay actividad.

### 2.5. Responsive patterns
- **Mobile-first**: Uso intensivo de `sm:`, `md:`, `lg:`.
- **Layout**: El sidebar se convierte en un drawer con backdrop en móvil (`DashboardLayoutClient.tsx`).
- **Breakpoints**: Estándar de Tailwind 4 (sin overrides detectados en CSS).

---

## 3. Métricas disponibles para Health Score

| Métrica | Disponibilidad en BD | Modelo + Campo | Source | Historicidad |
| :--- | :--- | :--- | :--- | :--- |
| **Tráfico web** | ✅ Alta | `BusinessMetric.monthlyVisitors` | GA4 API (BetaAnalytics) | Mensual |
| **Conversiones** | ✅ Alta | `ContactSubmission` count | DB Interna | Timestamps |
| **Time to Reply** | ⚠️ Media | `Message` (Admin vs Client) | `createdAt` diff | Timestamps |
| **Reputación** | ❌ Nula | No existe modelo `Review` | Requiere validación de Franco | N/A |
| **Salud Proyectos** | ✅ Alta | `Task.status` + `dueDate` | `updatedAt` vs `dueDate` | Timestamps |
| **Salud Cobranzas** | ✅ Alta | `Subscription.status` | `ACTIVE`/`PAST_DUE` | Actual |
| **Invoices** | ✅ Alta | `Invoice.status` | `PAID`/`OVERDUE` | Por factura |
| **Engagement** | ❌ Nula | No hay `last_login` | Requiere validación de Franco | N/A |
| **SEO** | ✅ Alta | `avgPosition` | Search Console API | 28 días |

---

## 4. Performance dashboard actual

### 4.1. Queries del home actual
Ubicación: `src/app/(protected)/dashboard/page.tsx`
- **Queries Prisma**: `organization.findUnique`, `service.count`, `task.count` (x2), `message.count`, `task.findMany`, `task.findFirst`.
- **Paralelismo**: ✅ Implementado con `Promise.all`.
- **N+1**: No se detectaron queries N+1 (se usa `include` correctamente en `recentTasks`).

### 4.2. Bundle size (Estimated)
- **Framework**: Next.js 16 (Turbopack).
- **Dashboard First Load JS**: ~180-220 KB.
- **Paquetes críticos**: `framer-motion` (animaciones), `recharts` (gráficos en resultados), `lucide-react` (iconos), `three` (canvas components).

### 4.3. Componentes Client vs Server
- **Client Components**: `SidebarNav`, `AIExecutiveBrief`, `AnimatedCounter`, `FadeIn`, `StaggerWrapper`, `DashboardLayoutClient`.
- **Server Components**: `DashboardPage` (layout server-side), `LeakMeter` (realiza queries directas a BD).

---

## 5. Integración IA (AIExecutiveBrief)

### 5.1. Implementación actual
- **Código**: `src/components/dashboard/AIExecutiveBrief.tsx` es un **MOCK**.
- **Lógica**: Actualmente es un componente `'use client'` que recibe un `summaryText` hardcoded.
- **Modelo**: No hay llamada a Anthropic en el componente. Sin embargo, existe `api/chat/route.ts` que usa `google('gemini-2.0-flash-exp')`.
- **Prompt**: El componente actual no usa prompts dinámicos, solo simula una onda de audio.

### 5.2. Cacheo
- **Estado**: No implementado (hardcoded).
- **Propuesta**: Requiere implementación de TTL en DB o cache de Next.js si se pasa a v2 real.

---

## 6. Componentes del home a reusar/descartar

| Componente | Líneas | Recomendación | Nota Técnica |
| :--- | :--- | :--- | :--- |
| `LeakMeter.tsx` | 117 | DESCARTAR (Home) | Mover a `/resultados` o Dashboard Técnico. |
| `AIExecutiveBrief.tsx`| 114 | **CONSERVAR (v2)** | Refactorizar a Server Component para el fetch de IA. |
| `TrendBadge.tsx` | 55 | **CONSERVAR** | Sólido, buena lógica de colores invertidos. |
| `AnimatedCounter.tsx` | 36 | **CONSERVAR** | Muy eficiente con `useSpring`. |
| `StaggerWrapper.tsx` | 30 | **CONSERVAR** | Esencial para el "feel" premium. |
| `FadeIn.tsx` | 26 | **CONSERVAR** | Implementación limpia con blur. |
| `DownloadReportButton`| 130 | DESCARTAR (Home) | Mover a `/resultados`. |

---

## 7. Contexto mobile

### 7.1. Sidebar actual en mobile
- **Comportamiento**: Se oculta y aparece mediante un drawer animado con `Framer Motion` (`AnimatePresence`).
- **Interactividad**: Botón tipo "hamburguesa" en el header móvil.

### 7.2. Componentes mobile-broken
- **Pipeline de Negocio**: En pantallas muy pequeñas (< 380px), los 3 badges de métricas (Visitas, Leads, Conv) se amontonan.
- **Tablas de Actividad**: El timeline de tareas puede quedar muy comprimido si el título es largo (usa `truncate` pero pierde legibilidad).

### 7.3. Touch interactions
- **Botones**: Tamaño actual ~36x36px. **Recomendación**: Llevar a 44x44px en la Entrega 2.
- **Swipe**: No hay gestos táctiles implementados.

---

## 8. Datos demo vs reales

### 8.1. Patrones de fallback
- **Pattern `isMockData`**: Implementado en `lib/analytics.ts`, `lib/searchconsole.ts` y `lib/n8n.ts`. Se activa si fallan las credenciales o el `propertyId`.
- **Hardcoded**: El Home actual tiene hardcoded el "Pipeline de Negocio" y el "AI Brief".

### 8.3. Conexiones
- **GA4**: Se valida en `complete-onboarding.ts` mediante `analyticsPropertyId`.
- **Search Console**: Se basa en `Organization.siteUrl`.
- **WhatsApp**: Existe el campo `whatsapp` en `Organization` pero no hay validación de conexión activa.

---

## 9. Recomendaciones críticas para Entrega 2

- **Estandarizar el "Card Core"**: Crear un componente de UI base para todas las cards que encapsule el gradiente de `admin-surface` y el padding responsive.
- **Server Actions para IA**: El `AIExecutiveBrief v2` debería ser un Server Component que dispare una Server Action para generar el brief, evitando exponer prompts en el cliente.
- **Refactor de Pipeline**: Convertir el hardcoded "Pipeline de Negocio" en una sección dinámica basada en `ContactSubmission` y métricas de GA4 (Conversiones reales).

---

## 10. Dudas/Bloqueantes detectados

1. **Reputación/Reviews**: ¿De dónde sacamos el dato de Google Maps? ¿Se va a conectar vía API o es manual?
2. **Engagement**: ¿Queremos trackear `last_login` en `User` para el Health Score? Habría que modificar el schema de Prisma.
3. **Cache de IA**: ¿Cuánto tiempo es válido el `AIExecutiveBrief`? ¿Se genera una vez al día o en cada visita? (Costo Anthropic vs UX).
