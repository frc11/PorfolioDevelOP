# Estado del Proyecto — develOP / Logic Core v3

**Última actualización:** Mayo 2026
**Versión actual:** v1.0.0 ✨
**Próximo milestone:** v1.5 (fin de fase Beta)

---

## Resumen 30 segundos

develOP es un chatbot multi-tenant para PyMEs LATAM, integrado a Logic Core v3.
Stack: Next.js 16, TypeScript, Prisma + Neon, NextAuth v5, Vertex AI.

**Estado:** v1.0 release-ready. Fase Alpha completada (21 sprints).
**Próximo:** Fase Beta — 8 features de valor.

---

## Lo que se completó en Alpha (Mayo 2026)

### Bloque pre-Alpha (Alpha.0.5 → 0.9)
- ✓ Fixes post test manual
- ✓ Limpieza legacy duplicado
- ✓ Baseline performance + observability
- ✓ Tests E2E ampliados
- ✓ STATUS.md inicial

### Bloque A — Profesionalización funcional admin (Alpha.1 → 5)
- ✓ Re-auditoría con base limpia
- ✓ Onboarding wizard premium (auto-save, pre-fills, preview)
- ✓ KB Editor profesional (markdown, diff, búsqueda, sandbox)
- ✓ BotConfig Editor con 14+ campos en 5 tabs
- ✓ Sistema de activación + alertas (7 tipos)

### Bloque B — Profesionalización admin operativa (Alpha.6 → 9)
- ✓ Command Center unificado
- ✓ Detail page premium (switcher Cmd+K, breadcrumbs, impersonate)
- ✓ Audit log con diff JSON
- ✓ Polish funcional + mobile básico

### Bloque C — Design System (Alpha.10 → 12)
- ✓ Design tokens + 12 componentes UI consolidados
- ✓ Storybook-lite en `/admin/_design`
- ✓ Migración masiva al design system

### Bloque D — Estética admin (Alpha.13 → 15)
- ✓ Animaciones (page transitions, stagger, hover lift)
- ✓ Skeleton loaders premium
- ✓ Polish Activity Log + Health + Alerts

### Bloque E — Dashboard cliente (Alpha.16 → 18)
- ✓ Audit + refinamiento estético
- ✓ Métricas formato negocio + mobile completo
- ✓ Personalización limitada del cliente

### Bloque F — Cierre (Alpha.19 → 21)
- ✓ Testing comprehensivo (22 specs E2E)
- ✓ Documentación operativa (5 workflows)
- ✓ Changelog v1.0 + versionado visible

---

## Métricas baseline establecidas

### Chatbot runtime (mayo 2026)
- P50: [rellenar con datos reales post-deploy]
- P95: [rellenar con datos reales post-deploy]
- Success rate: [rellenar con datos reales post-deploy]

### Performance admin (post-Alpha)
- `/admin`: warm <1.5s
- `/admin/clients`: warm <1.5s
- `/admin/clients/[id]`: warm <2s
- `/admin/chatbot/health`: warm <1.5s

### Performance dashboard cliente
- `/dashboard`: warm <1.5s
- `/dashboard/chatbot`: warm <1.5s

### Database
- Latencia Neon: ~93ms (sa-east-1)

---

## Test coverage actual

- E2E (Playwright): 22 specs
- Performance budgets: enforced
- Visual regression: baselines establecidos
- Security tests: auth + role checks

---

## Próxima fase: Beta (8 features)

| Feature | Días estimados |
|---|---|
| 1. Cards ricos (product, service, gallery, calendar) | 10-12 |
| 2. KB híbrida con review queue | 6-7 |
| 3. Widget embebible universal | 9-10 |
| 4. Reportes semanales automáticos con AI | 4-5 |
| 5. Lead scoring 0-100 con badges | 2-3 |
| 6. Memoria persistente visitor con cookies | 3-4 |
| 7. Sugerencias proactivas al dueño | 5-6 |
| 8. Agenda integrada Cal.com | 4-5 |

**Total Beta estimado:** 43-52 días de desarrollo (~3 meses calendario).

---

## Decisiones tomadas durante Alpha

- ✓ Migración a `/admin/clients/[clientId]` con tabs (deprecación agency-dashboard)
- ✓ Versionado visible v1.0 + changelog público
- ✓ Mobile: admin básico, dashboard cliente completo
- ✓ Paleta curada 8 swatches para cliente (no color picker libre)
- ✓ Personalización cliente limitada y segura
- ✓ Activación: solo equipo develOP (no autoservicio)
- ✓ KB híbrida diferida a Beta (cliente edita "fachada", develOP refina y aplica)
- ✓ Reportes AI semanales diferidos a Beta

---

## Decisiones pendientes (para Beta)

- ⚠ Sistema modular por plan (Starter/Pro/Enterprise) — definir con socio
- ⚠ Plan de Neon (Free vs Launch) — depende de backups
- ⚠ Integración Tiendanube — pendiente decisión
- ⚠ Cuándo activar feature toggles por suscripción

---

## Cómo arrancar para nuevo dev / IA

```bash
git clone [repo]
cd logic-core-v3
npm install
cp .env.example .env  # completar valores
npm run check-env
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Credenciales seed:
- Admin: admin@develop.com / Admin1234!
- Cliente: cliente@sanmiguel.com / Cliente1234!

Recursos:
- `docs/design-system.md` — componentes UI
- `docs/testing-strategy.md` — cómo testear
- `docs/operations/` — workflows operativos
- `/admin/_design` — playground visual

---

## Equipo

- **Franco** — Co-fundador, lead técnico y comercial
- **[Socio]** — Co-fundador, técnico

---

*Este archivo se actualiza al cierre de cada fase mayor.*
