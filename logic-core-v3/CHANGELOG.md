# Changelog develOP

Cambios visibles en el producto. Para detalle técnico, ver `docs/sprints/`.

## v1.0.0 — 2026-05-20 (cierre Alpha v2)

Primera versión estable después de la fase Alpha v2 (Recuperación).
La fase Alpha original se declaró completa pero tenía gaps críticos; Alpha v2 los resolvió.

### ✨ Nuevo

**Widget embebible (visitantes en sitios del cliente):**
- 📜 Script vanilla JS (~5KB) — se pega antes de `</body>` en cualquier plataforma
- 🔒 Domain whitelisting por bot — no carga en dominios no autorizados
- 🛡️ Validación de origin server-side en todos los endpoints del chatbot
- 🔒 CORS dinámico calculado desde `BotConfig.allowedDomains`
- 💬 WhatsApp handoff con contexto completo de la conversación
- 📋 Instrucciones por plataforma: HTML, WordPress, Tiendanube, Shopify, Wix, Squarespace, Custom

**Para develOP (Admin):**
- 🤖 Gestión global de chatbots en `/admin/chatbots` — vista unificada de todos los bots
- ➕ Crear bot standalone en `/admin/chatbots/new` (para org existente o nueva)
- 🔧 Tab "Instalar" en detail del bot con snippet y guía por plataforma
- 📨 Email automático al activar bot (template `bot-activated.ts`)
- 📅 Cron de reportes semanales configurado en Netlify (lunes 9am Argentina)
- 🔄 Trigger manual de reportes desde `/admin/settings/reports`
- 📊 Audit log de envíos de reportes
- 🚨 Sistema de alertas con 7 tipos, triage UI, email/Telegram en críticas
- 📦 Bulk operations: pausar bots, activar bots, exportar leads
- 🔄 Re-envío manual de credenciales desde panel del cliente
- 🚀 Onboarding wizard end-to-end — sin SQL manual

**Para clientes (Dashboard):**
- 📅 Reporte semanal automático por email cada lunes
- 📋 Vista de instalación en `/dashboard/chatbot/install` con snippet copy-paste
- 📱 Leads en tiempo real con polling 30s
- 📧 Notificación email cuando se captura un lead
- 🔑 Cambio forzado de password en primer login
- 📊 Métricas en formato negocio (oportunidades, valor estimado, conversaciones)

### 🔧 Mejoras

- ⚡ Refactor de `/dashboard/chatbot` a rutas anidadas `/(protected)/dashboard/chatbot/*`
- 🗺️ Nueva ruta canónica para bots: `/admin/chatbots/[botId]` (depreca `/admin/clients/[id]/chatbot/*`)
- 🔐 Validación origin en todos los endpoints públicos del chatbot
- 🧹 Eliminación de rutas zombi y código muerto (R5 cleanup)
- 🧪 Tests E2E ampliados: 24 specs totales (era 22)

### 📚 Documentación

- 6 workflows operativos en `docs/operations/` (agrega 06-instalar-widget.md)
- STATUS.md reescrito con realidad post Alpha v2
- CHANGELOG.md actualizado con detalle honesto

### ⚠ Limitaciones conocidas en v1.0

- Cold start de Neon: ~1s en primer hit después de inactividad
- Rate limiter in-memory (no persiste entre cold starts)
- AIExecutiveBrief sigue MOCK (no LLM real)
- Reportes semanales por bot (no consolidados por cliente con varios bots)

---

## v0.9.0 — Mayo 2026 (Alpha original — deprecada)

La fase Alpha original se declaró "release-ready" pero tenía gaps críticos:
widget no embebible, reportes solo parciales, rutas incompletas.
Alpha v2 resolvió estos issues. Ver `docs/sprints/alpha-v2-*.md`.

### Alpha original incluía

**Para vos como dueño de PyME (Dashboard cliente):**
- 🎨 Personalización del bot: color, posición, avatar, mensaje, respuestas rápidas
- 📊 Métricas en formato negocio
- 📱 Dashboard mobile completo
- 🔍 Cards de leads con WhatsApp directo

**Para develOP (Admin):**
- 📝 KB Editor profesional con markdown, diff, búsqueda, sandbox
- ⚙️ BotConfig Editor con 5 tabs y 14+ campos
- ✅ Sistema de activación con 6 pre-flight checks
- 📈 Health page con gráficos de latencia P50/P95
- 🗂️ Audit log con diff JSON expandible
- ⌨️ Cmd+K para saltar entre clientes

**Para todos:**
- 🎨 Design System con 12 componentes consolidados
- 📚 Playground visual en `/admin/_design`
- ✨ Animaciones suaves (page transitions, stagger, hover lift)
- 💀 Skeleton loaders en todas las páginas
- ♿ Respeta `prefers-reduced-motion`

---

## v0.8.0 — Mayo 2026 (MVP)

24 sprints originales. Bot multi-tenant funcionando con Vertex AI, 4 tools, KB por industria.
