# Chatbot — Sprint Tracking

Lista de sprints del MVP del chatbot. Marcar `[x]` al completar cada uno.

## Grupo 1: Setup + BD

- [x] S0 — Setup del módulo y limpieza legacy
- [x] S1 — Schema Prisma + migración + seed develOP
- [x] S2 — Capa abstracción LLM (LLMProvider + GoogleProvider)

## Grupo 2: Server logic

- [ ] S3 — buildSystemPrompt + helpers
- [ ] S4 — Tool definitions con Zod (4 tools)
- [ ] S5 — API route /api/chatbot/[slug]/chat con streaming
- [ ] S6 — API route /api/chatbot/[slug]/config

## Grupo 3: UI core

- [ ] S7 — NeuroAvatar refactorizado
- [ ] S8 — ChatWindow reescrito
- [ ] S9 — Tool cards (Handoff + WhatsApp)

## Grupo 4: Integración cliente

- [ ] S10 — ProactiveTooltip refactor
- [ ] S11 — useChatbot hook + LogicCompanion orchestrator + localStorage

## Grupo 5: Admin

- [ ] S12 — /admin/chatbot/knowledge editor
- [ ] S13 — /admin/chatbot/config editor
- [ ] S14 — Dashboards (cliente + admin develOP)

## Grupo 6: Final

- [ ] S15 — Quota system + degraded mode
- [ ] S16 — Migración landing develOP
- [ ] S17 — QA pass
- [ ] S18 — Deploy + smoke test
