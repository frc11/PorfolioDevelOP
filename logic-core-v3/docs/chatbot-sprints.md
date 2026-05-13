# Chatbot — Sprint Tracking

Lista de sprints del MVP del chatbot. Marcar `[x]` al completar cada uno.

## Grupo 1: Setup + BD

- [x] S0 — Setup del módulo y limpieza legacy
- [x] S1 — Schema Prisma + migración + seed develOP
- [x] S2 — Capa abstracción LLM (LLMProvider + GoogleProvider)

## Grupo 2: Server logic

- [x] S3 — buildSystemPrompt + helpers
- [x] S4 — Tool definitions con Zod (4 tools)
- [x] S5 — API route /api/chatbot/[slug]/chat con streaming
- [x] S6 — API route /api/chatbot/[slug]/config

## Grupo 3: UI core

- [x] S7 — NeuroAvatar refactorizado
- [x] S8 — ChatWindow reescrito
- [x] S9 — Tool cards (Handoff + WhatsApp)

## Grupo 4: Integración cliente

- [x] S10 — ProactiveTooltip refactor
- [x] S11 — useChatbot hook + LogicCompanion orchestrator + localStorage
- [x] S12 — AvatarRenderer + Legacy Integration

## Grupo 5: Admin

- [x] S13 — /admin/chatbot/knowledge editor
- [x] S14 — /admin/chatbot/config editor
- [x] S15 — Dashboards (cliente + admin develOP)

## Grupo 6: Final

- [x] S16 — Quota system + degraded mode
- [x] S17 — Migración landing develOP
- [x] S18 — QA pass
- [x] S19 — Deploy + smoke test

## Bloque C — Reporte consolidado

### Sprints ejecutados
- [x] S11 — useChatbot + LogicCompanion
- [x] S12 — AvatarRenderer + LegacyNeuroAvatar integrado
- [x] S13 — Editor KnowledgeBase
- [x] S14 — Editor BotConfig
- [x] S15 — Dashboards (leads cliente + admin conversations)
- [x] S16 — Modo degradado refinement
- [x] S17 — Eliminada dev page + montado en landing
- [x] S18 — QA checklist generado
- [x] S19 — Deploy config

### Estado final del MVP
- Build: PASS
- Frontend público: avatar montado, chat funcional, tool cards renderizando
- Admin: KB editable, BotConfig editable, dashboards funcionales
- Deploy: configurado, env vars documentadas
- QA: checklist generado en `docs/chatbot-qa-checklist.md`

### Pendientes para que Franco lo lance a producción
1. Configurar env vars en Netlify (ver `docs/chatbot-deploy.md`)
2. Correr `docs/chatbot-qa-checklist.md` en local con `npm run dev`
3. Push a la branch de producción → Netlify auto-deploy
4. Smoke test en `https://develop-portfolio.netlify.app/`

### Issues conocidos
- Rate limiter es in-memory: cold start lo resetea (esperable).
- Cache de config: cambios en admin tardan hasta 60s en propagarse.
- Sin CORS: el endpoint solo funciona desde same origin (esperable).
- LegacyNeuroAvatar puede tener leve degradación de performance vs Neuro a 56px (esperable).

### Listo para producción
SÍ
