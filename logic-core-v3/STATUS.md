# Estado del Proyecto — develOP / Logic Core v3

**Última actualización:** 2026-05-17
**Versión actual:** v0.9 (pre-Alpha)
**Próximo milestone:** v1.0 (fin de Alpha)

---

## Resumen 30-segundos

develOP es un chatbot multi-tenant para PyMEs LATAM, integrado a Logic Core v3 (portal SaaS).
Stack: Next.js 16, TypeScript estricto, Prisma + Neon PostgreSQL, NextAuth v5, Vertex AI.

**Estado actual:** MVP completo (24 sprints originales) + 5 sprints de cierre pre-Alpha completados.
Listo para arrancar fase Alpha (profesionalización).

---

## Estado por sección

### Chatbot core
- ✅ Bot multi-tenant funcionando con Vertex AI
- ✅ 4 tools (capture_lead, handoff, whatsapp, navigate)
- ✅ Filosofía consultora ("diagnostica no vende")
- ✅ Tono rioplatense nativo
- ✅ 10 templates de KB por industria
- ✅ Health endpoint con env vars validation
- ✅ Activity log en tiempo real
- ✅ Insights AI semanales

### Admin (/admin)
- ✅ Dashboard KPIs comerciales (846 líneas)
- ✅ Agency Dashboard con clientes
- ✅ Wizard de onboarding (5 pasos)
- ✅ 6 rutas multi-tenant chatbot por cliente
- ✅ Bot Config editor + Knowledge Base editor
- ✅ Auth con SUPER_ADMIN check
- ✅ Audit log básico (Activity)
- ✅ Health + Alerts page
- ⚠ Mobile responsive básico (pendiente Alpha.9)
- ⚠ Mucho por pulir estéticamente (pendiente Bloque C)

### Dashboard cliente (/dashboard)
- ✅ Login + auth
- ✅ Sidebar con módulos
- ✅ "Mi Chatbot" siempre visible
- ✅ Upsell landing si no hay bot
- ✅ Overview con métricas si hay bot
- ✅ Leads + KB + Settings sub-pages
- ⚠ Performance mejorable (60% optimizado, falta 40%)
- ⚠ Estética por pulir (pendiente Bloque D)

### Infraestructura
- ✅ Deploy Netlify
- ✅ DB Neon (sa-east-1)
- ✅ Vertex AI configurado (Service Account)
- ✅ Sentry instalado (configs creados, DSN pendiente de configurar)
- ⚠ Backups Neon (depende de plan — verificar en consola Neon)
- ⚠ Sin CI/CD automatizado (manual deploys)

### Tests
- ✅ 5 tests E2E originales (landing, chat, leads, health, config)
- ✅ 9 tests E2E nuevos (admin + dashboard) — Sprint Alpha.0.8
- ✅ Helpers de auth para tests
- ⚠ 14 tests requieren calibración de selectores (fallan por timeout en login)
- ⚠ Sin tests de integración del bot
- ⚠ Sin tests de regresión visual

### Documentación
- ✅ `docs/chatbot-deploy.md`
- ✅ `docs/chatbot-qa-checklist.md`
- ✅ `docs/chatbot-sprints.md`
- ✅ `docs/env-vars.md` (Alpha.0.6)
- ✅ `docs/baselines/2026-05-chatbot-runtime.md` (Alpha.0.7)
- ✅ `docs/operations/sentry-setup.md` (Alpha.0.7)
- ✅ `docs/operations/neon-backups.md` (Alpha.0.7)
- ✅ `docs/sprints/alpha-0-cleanup.md` (Alpha.0)
- ✅ `docs/sprints/alpha-0-5-cleanup.md` (Alpha.0.5)
- ✅ `docs/sprints/alpha-0-6-cleanup-extended.md` (Alpha.0.6)
- ✅ `docs/sprints/alpha-0-7-baseline-observability.md` (Alpha.0.7)
- ✅ `docs/sprints/alpha-0-8-tests-e2e.md` (Alpha.0.8)
- ⚠ Falta docs/operations/ con workflows operativos (pendiente Alpha.20)

---

## Métricas baseline (mayo 2026)

### Chatbot runtime (Sprint Alpha.0.7)
| Métrica | Valor |
|---|---|
| P50 | 4072ms |
| P95 | 12987ms |
| P99 | 12987ms |
| Success rate | 33% (20/30 bloqueadas por rate limiter 429) |

### Performance dashboard cliente (Sprint Alpha.0.8, warm)
| Ruta | Tiempo |
|---|---|
| /dashboard | 1788ms |
| /dashboard/chatbot | 2414ms |

### Smoke test endpoints (Sprint Alpha.0.9, dev server)
| Ruta | HTTP | Tiempo |
|---|---|---|
| / | 200 | 10523ms (cold, incluye compilación) |
| /login | 200 | 162ms |
| /api/chatbot/develop/config | 200 | 2298ms |
| /api/chatbot/develop/health | 200 | 3759ms |
| /admin | 307 | 18ms |
| /admin/clients | 307 | 15ms |
| /admin/agency-dashboard | 307 | 17ms |
| /admin/clients/develop/chatbot/overview | 307 | 17ms |
| /admin/clients/develop/chatbot/config | 307 | 17ms |
| /admin/clients/develop/chatbot/knowledge | 307 | 16ms |
| /admin/chatbot/activity | 307 | 17ms |
| /admin/chatbot/health | 307 | 19ms |
| /dashboard | 307 | 17ms |
| /dashboard/chatbot | 307 | 16ms |

> Rutas protegidas devuelven 307 (redirect a /login) correctamente sin sesión.

### DB
- Latencia Neon: 1082ms (cold start, medido en /api/chatbot/develop/health)

---

## Roadmap

### Fase Alpha (en curso)
- Bloque A: Profesionalización funcional admin (Alpha.1-5)
- Bloque B: Profesionalización admin operativa (Alpha.6-9)
- Bloque C: Design system unificado (Alpha.10-12)
- Bloque D: Estética admin (Alpha.13-15)
- Bloque E: Profesionalización dashboard cliente (Alpha.16-18)
- Bloque F: Cierre + docs + testing (Alpha.19-21)

**Target:** v1.0 estable en ~8 semanas

### Fase Beta (post-Alpha)
- 8 features de valor: Cards ricos, KB híbrida, Widget embebible,
  Reportes AI semanales, Lead scoring, Memoria persistente,
  Sugerencias proactivas, Agenda integrada

**Target:** v1.5 con features Beta en ~3 meses adicionales

---

## Decisiones tomadas

- ✅ Stack final: Next.js 16, motion/react, Prisma+Neon, Vertex AI
- ✅ NeuroAvatar S7 como default (LegacyNeuroAvatar preservado)
- ✅ Multi-tenant por slug, no por subdomain
- ✅ Filosofía bot: consultora, no vendedora
- ✅ Tono rioplatense nativo
- ✅ Activación de bots: solo equipo develOP (no autoservicio)
- ✅ Personalización cliente: limitada y segura (paleta curada, no libertad total)
- ✅ Admin: solo equipo develOP, no admins externos
- ✅ Sin modular por suscripción (pendiente decisión con socio)

---

## Decisiones pendientes

- ⚠ Pricing por planes (Starter/Pro/Enterprise) — pendiente con socio
- ⚠ Cuándo activar sistema de feature toggles por plan
- ⚠ Cuándo migrar de Brevo a Resend (o mantener Brevo)
- ⚠ Plan de Neon (free vs Launch) — depende de backups
- ⚠ Integración Tiendanube — pospuesta a Fase Gamma
- ⚠ Configurar SENTRY_DSN en producción (Netlify)
- ⚠ Configurar variables de entorno críticas faltantes en producción

---

## Cómo arrancar para nuevo dev / IA

```bash
# Clonar
git clone [repo]
cd logic-core-v3

# Instalar
npm install

# Copiar y completar .env
cp .env.example .env
# Verificar env vars
npm run check-env

# Inicializar DB local (si no usás Neon directo)
npx prisma migrate deploy
npx prisma db seed

# Levantar dev
npm run dev

# Tests
npx playwright test
```

Credenciales seed:
- Admin: admin@develop.com / Admin1234!
- Cliente: cliente@sanmiguel.com / Cliente1234!

---

## Contacto / responsables

- **Franco** — Co-fundador, lead técnico y comercial
- **[Socio]** — Co-fundador, técnico

---

*Este archivo se actualiza al cierre de cada fase mayor o cuando cambian decisiones estratégicas.*
