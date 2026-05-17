# Resumen del bloque Pre-Alpha (Alpha.0.5 → Alpha.0.9)

**Inicio:** 2026-05-17
**Fin:** 2026-05-17
**Sprints completados:** 5 (Alpha.0.5, 0.6, 0.7, 0.8, 0.9)
**Total de commits en el repo:** 141

## Lo que se hizo

### Alpha.0.5 — Fixes post test manual
Aplicación de React.cache a `getImpersonationSession` para eliminar llamadas DB redundantes en el admin.
Quick wins de performance admin (caché de funciones server-side críticas).
Correcciones directas surgidas del test manual de Franco sobre el MVP.

### Alpha.0.6 — Limpieza legacy + env vars
Eliminación de `src/components/admin/SidebarNav.tsx` (duplicado huérfano sin referencias).
Auditoría profunda de 33 variables de entorno: creación de `.env.example`, `docs/env-vars.md`, y `scripts/check-env.js`.
Limpieza de 3 `console.log` de depuración en rutas de producción; `vertex-credentials.json` añadido a `.gitignore`.

### Alpha.0.7 — Baseline + observability
Creación del script de load test (`scripts/load-test/chatbot-baseline.ts`) y medición baseline: P50=4072ms, P95=12987ms.
Instalación completa de Sentry (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`).
Documentación operativa: `docs/operations/sentry-setup.md` y `docs/operations/neon-backups.md` con plan de disaster recovery.

### Alpha.0.8 — Tests E2E ampliados
Creación de 9 nuevos archivos de test E2E cubriendo admin login, navegación, onboarding wizard, bot config, KB edit, client dashboard, chatbot section, performance, y flujo crítico end-to-end.
Creación de `tests/helpers/auth.ts` con helpers reutilizables `loginAsAdmin` y `loginAsClient`.
Resultado: 7/21 tests pasaron; 14 fallan por timeout en selectores del login (documentado para calibración).

### Alpha.0.9 — STATUS + verificación
Creación de `STATUS.md` en raíz como fuente de verdad del proyecto con métricas reales.
Smoke test de 14 endpoints: todos respondieron correctamente (200 para públicos, 307 redirect para protegidos).
Cierre del bloque pre-Alpha con documentación completa y verificación final.

## Métricas establecidas

| Métrica | Valor | Sprint |
|---|---|---|
| Chatbot P50 | 4072ms | Alpha.0.7 |
| Chatbot P95 | 12987ms | Alpha.0.7 |
| Chatbot P99 | 12987ms | Alpha.0.7 |
| Dashboard home (warm) | 1788ms | Alpha.0.8 |
| Dashboard chatbot (warm) | 2414ms | Alpha.0.8 |
| DB Latency (cold) | 1082ms | Alpha.0.7 |
| Login page | 162ms | Alpha.0.9 |
| API config | 2298ms | Alpha.0.9 |
| API health | 3759ms | Alpha.0.9 |

## Issues conocidos resueltos

- `SidebarNav.tsx` duplicado eliminado (Alpha.0.6)
- Console.logs de depuración eliminados de rutas de producción (Alpha.0.6)
- Variables de entorno documentadas y verificables con `npm run check-env` (Alpha.0.6)
- `vertex-credentials.json` protegido en `.gitignore` (Alpha.0.6)
- React.cache aplicado a `getImpersonationSession` (Alpha.0.5)
- Sentry configs faltantes creados (Alpha.0.7)

## Issues conocidos pendientes (para Alpha)

- 14 tests E2E fallan por timeout en selectores del login (calibración pendiente)
- 6 variables de entorno críticas faltan en `.env` local (AUTH_SECRET, NEXTAUTH_URL, GOOGLE_APPLICATION_CREDENTIALS, CHATBOT_GCP_PROJECT_ID, BREVO_API_KEY, DEVELOP_ALERTS_EMAIL)
- SENTRY_DSN no configurado (requiere proyecto en sentry.io)
- Backups de Neon sin verificar (requiere acceso a consola Neon)
- `src/components/ui/EmptyState.tsx` es un componente huérfano pendiente de decisión
- 3 TODOs en código (reintegrar chatbot en ai-implementations, agregar contactEmail y rubro a Organization en onboarding)

## Decisiones tomadas durante el bloque

- framer-motion legacy se mantiene intencionalmente en componentes del portfolio público
- Logs estructurales JSON del chatbot API se preservan (son para observabilidad en producción)
- Rate limiter del chatbot funciona correctamente bloqueando peticiones excesivas (429)
- Playwright config usa `npm run start` (production build) para tests, no dev server

## Archivos creados durante el bloque

| Archivo | Sprint |
|---|---|
| `.env.example` | Alpha.0.6 |
| `docs/env-vars.md` | Alpha.0.6 |
| `scripts/check-env.js` | Alpha.0.6 |
| `docs/sprints/alpha-0-6-cleanup-extended.md` | Alpha.0.6 |
| `scripts/load-test/chatbot-baseline.ts` | Alpha.0.7 |
| `docs/baselines/2026-05-chatbot-runtime.md` | Alpha.0.7 |
| `sentry.client.config.ts` | Alpha.0.7 |
| `sentry.server.config.ts` | Alpha.0.7 |
| `sentry.edge.config.ts` | Alpha.0.7 |
| `instrumentation.ts` | Alpha.0.7 |
| `docs/operations/sentry-setup.md` | Alpha.0.7 |
| `docs/operations/neon-backups.md` | Alpha.0.7 |
| `docs/sprints/alpha-0-7-baseline-observability.md` | Alpha.0.7 |
| `tests/helpers/auth.ts` | Alpha.0.8 |
| `tests/e2e/06-admin-login.spec.ts` | Alpha.0.8 |
| `tests/e2e/07-admin-navigation.spec.ts` | Alpha.0.8 |
| `tests/e2e/08-admin-onboarding.spec.ts` | Alpha.0.8 |
| `tests/e2e/09-admin-bot-config.spec.ts` | Alpha.0.8 |
| `tests/e2e/10-admin-kb-edit.spec.ts` | Alpha.0.8 |
| `tests/e2e/11-client-login.spec.ts` | Alpha.0.8 |
| `tests/e2e/12-client-chatbot-section.spec.ts` | Alpha.0.8 |
| `tests/e2e/13-client-perf.spec.ts` | Alpha.0.8 |
| `tests/e2e/14-e2e-critical-flow.spec.ts` | Alpha.0.8 |
| `docs/sprints/alpha-0-8-tests-e2e.md` | Alpha.0.8 |
| `STATUS.md` | Alpha.0.9 |
| `docs/sprints/alpha-pre-cierre-RESUMEN.md` | Alpha.0.9 |

## Próximo: Fase Alpha formal

Sprints Alpha.1 → Alpha.21 distribuidos en 6 bloques:
- alpha-bloque-A-admin-funcional.md (Alpha.1-5)
- alpha-bloque-B-admin-operativo.md (Alpha.6-9)
- alpha-bloque-C-design-system.md (Alpha.10-12)
- alpha-bloque-D-estetica-admin.md (Alpha.13-15)
- alpha-bloque-E-dashboard-cliente.md (Alpha.16-18)
- alpha-bloque-F-cierre.md (Alpha.19-21)
