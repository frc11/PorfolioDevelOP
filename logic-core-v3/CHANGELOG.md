# Changelog develOP

Cambios visibles en el producto. Para detalle técnico, ver `docs/sprints/`.

## v1.0.0 — Mayo 2026

Primera versión estable. Producto release-ready.

### ✨ Nuevo

**Para vos como dueño de PyME (Dashboard cliente):**
- 🎨 Podés personalizar el bot: color, posición, avatar, mensaje, respuestas rápidas
- 📊 Métricas en formato negocio: cuántas oportunidades capturó tu bot, valor estimado, personas atendidas
- 📱 El dashboard funciona perfecto en celular
- 💼 Sección "Mi Chatbot" siempre visible
- 🔍 Cards de leads mejorados con WhatsApp directo

**Para develOP (Admin):**
- 🚀 Onboarding wizard premium con preview en vivo, auto-save, sugerencias por industria
- 📝 KB Editor profesional: markdown con preview, diff antes de guardar, búsqueda, test prompt sandbox
- ⚙️ BotConfig Editor con 5 tabs exponiendo 14+ campos del schema
- ✅ Sistema de activación con 6 pre-flight checks
- 🚨 Sistema de alertas automáticas (7 tipos) con triage UI
- 📈 Health page con gráficos de latencia P50/P95
- 🗂️ Audit log con diff JSON expandible
- 🎯 Command Center unificado en `/admin/clients/[id]` con 5 tabs
- ⌨️ Cmd+K para saltar entre clientes
- 🔄 Bulk actions: exportar leads, pausar bots

**Para todos:**
- 🎨 Design System completo con 12 componentes consolidados
- 📚 Playground visual en `/admin/_design`
- ✨ Animaciones suaves (page transitions, stagger, hover lift)
- 💀 Skeleton loaders en todas las páginas
- ♿ Respeta `prefers-reduced-motion`

### 🔧 Mejoras
- ⚡ Performance: caching en queries críticas, ~60% más rápido en admin
- 🔍 Búsqueda + filtros + sort en lista de clientes
- 📌 Pin de clientes favoritos
- 📱 Mobile responsive completo (admin y dashboard)
- 🎨 Estética consistente con tokens del design system

### 📚 Documentación
- 5 workflows operativos en `docs/operations/`
- Testing strategy documentada
- Design system documentado
- STATUS.md como fuente única de verdad

### 🧪 Testing
- 22 specs Playwright cubriendo flows críticos
- Performance budgets enforced
- Visual regression con screenshots
- Security tests (auth, role checks)
- Mobile responsive tests

---

## v0.9.0 — Mayo 2026 (pre-Alpha)

Cierre de cabos sueltos antes de Alpha formal.
- Quick wins de performance
- Limpieza de legacy duplicado
- Auditoría de variables de entorno
- Baseline de métricas runtime
- Setup de observability (Sentry)
- Tests E2E ampliados

## v0.8.0 — Mayo 2026 (MVP completo)

24 sprints originales. Bot multi-tenant funcionando con Vertex AI, 4 tools, KB por industria.
