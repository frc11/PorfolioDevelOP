# Sprint Alpha.0.7 — Baseline + Observability

**Fecha:** 2026-05-17

## Métricas baseline establecidas

- Chatbot P95: 12987ms
- Chatbot P99: 12987ms
- DB Latency: 1082ms
- Documento: `docs/baselines/2026-05-chatbot-runtime.md`

## Sentry

- Sentry instalado: SÍ (el paquete `@sentry/nextjs` ya estaba en dependencias pero faltaba config)
- Alerts documentadas para Franco: SÍ
- Endpoint de test creado y removido: NO (saltado ya que la variable `SENTRY_DSN` no estaba presente en el entorno local)

## Backups

- Estado actual de Neon documentado: SÍ
- Disaster recovery plan creado: SÍ

## Próximo sprint

Alpha.0.8 — Tests E2E ampliados
