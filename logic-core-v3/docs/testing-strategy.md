# Testing Strategy - develOP

## Niveles de testing

### 1. E2E (Playwright) - primary

22 specs cubriendo:

- Public flows: landing, chat, lead capture, config publica y health.
- Admin core: login, navegacion, onboarding, config de bot y KB.
- Admin advanced: bulk actions, alerts triage y audit log.
- Client flows: login, chatbot section, personalization y mobile dashboard.
- Critical end-to-end: flujo admin a cliente.
- Security: auth checks, role checks y cron secret.
- Performance budgets.
- Visual regression.

### 2. Type checking (TypeScript)

- `npx tsc --noEmit` debe pasar siempre.
- Strict mode habilitado.
- Evitar `any` nuevo; la base actual todavia conserva deuda historica en algunos modulos.

### 3. Build (Next.js)

- `npm run build` debe pasar siempre.
- Warnings de Sentry no bloquean build, pero deben monitorearse.

## Workflow de CI/CD recomendado

```yaml
on: pull_request
jobs:
  test:
    steps:
      - npm install
      - npm run build
      - npx tsc --noEmit
      - npx playwright test
```

## Performance budgets

Los budgets warm viven en `tests/perf-budget.json`.

| Pagina | Warm | Cold |
|---|---:|---:|
| /admin | <3s | <5s |
| /admin/clients | <3s | <5s |
| /admin/clients/[clientId] | <3.5s | <6s |
| /admin/clients/[orgSlug]/chatbot/overview | <3.5s | <6s |
| /dashboard | <3s | <5s |
| /dashboard/chatbot | <3s | <5s |
| /api/chatbot/develop/chat | <13s | <15s |

El budget de chat respeta el baseline Alpha.0.7: P95/P99 alrededor de 13s por Vertex AI, DB y streaming.

## Visual regression

Screenshots en `tests/e2e/22-visual-regression.spec.ts-snapshots/`.

El spec aplica:

- `toHaveScreenshot` con `maxDiffPixels: 100` y `threshold: 0.1`.
- `page.emulateMedia({ reducedMotion: 'reduce' })`.
- CSS test-only para desactivar animaciones/transiciones.
- Masks para headers/status live regions.

Para actualizar despues de un cambio visual intencional:

```bash
npx playwright test tests/e2e/22-visual-regression.spec.ts --update-snapshots
```

## Coverage actual

| Area | Cobertura |
|---|---|
| Public flows | Si |
| Admin login/navigation | Si |
| Admin onboarding | Parcial |
| Admin bot config | Smoke |
| Admin KB edit | Smoke |
| Admin advanced (audit, alerts, bulk) | Si |
| Client login/dashboard | Si |
| Client chatbot personalization | Si |
| Security | Si, con skips para endpoints no implementados |
| Mobile responsive | Si |
| Performance | Si |
| Visual regression | Si |
| Database integration | Parcial |
| LLM mocking | Manual |
| Unit tests de helpers | Pendiente |
| Cron jobs end-to-end | Parcial |
| Email sending | Manual |
| Accessibility | Pendiente para Beta |

## Coverage matrix

| Feature | Tests existentes | Gap |
|---|---|---|
| Landing page | 01-landing | Cubierto |
| Chat flow | 02-chat-flow | Cubierto |
| Lead capture | 03-lead-capture | Cubierto |
| Health endpoint | 04-health | Cubierto |
| Public config | 05-config-public | Cubierto |
| Admin login | 06-admin-login | Cubierto |
| Admin navigation | 07-admin-navigation | Cubierto |
| Admin onboarding wizard | 08-admin-onboarding | Parcial |
| Admin bot config edit | 09-admin-bot-config | Smoke |
| Admin KB edit | 10-admin-kb-edit | Smoke |
| Client login | 11-client-login | Cubierto |
| Client chatbot section | 12-client-chatbot-section | Cubierto |
| Client perf | 13-client-perf, 21-performance | Cubierto |
| E2E critical flow | 14-e2e-critical-flow | Cubierto |
| Client personalization | 15-client-personalization | Cubierto |
| Activity log filters | 18-admin-audit-log | Cubierto como audit filter |
| Audit log | 18-admin-audit-log | Cubierto |
| Alerts triage | 17-admin-alerts-triage | Cubierto |
| Bulk actions clients | 16-admin-bulk-actions | Cubierto |
| Command palette (Cmd+K) | Ninguno | Pendiente, no detectado como feature activa |
| Reduced motion | 22-visual-regression | Cubierto para screenshots |
| Mobile responsive | 20-mobile-responsive | Cubierto |
| Empty states | Parcial en specs existentes | Pendiente profundo |
| Skeleton loading | Loading pages existentes | Pendiente profundo |
| Security auth/roles | 19-security | Cubierto |
| Visual regression | 22-visual-regression | Cubierto |

## Gaps conocidos

- No hay unit tests de helpers individuales.
- Command palette no tiene spec porque no fue verificada como feature activa.
- Empty states y skeleton loading tienen cobertura indirecta, no exhaustiva.
- Cron con secret valido se salta cuando `CRON_SECRET` no esta disponible en el entorno de test.
- Email sending queda manual por dependencia Brevo/sandbox.
- No hay load testing concurrente en esta fase.
