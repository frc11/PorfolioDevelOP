# EV.5 — Transcripts del smoke de cierre de bloque

## Estado
- **Agencia (develop):** smoke corre contra el dev server real.
- **Usados (sanmiguel):** PENDIENTE — bot inexistente en DB al cierre de EV.5.
  Cobertura: `test:ev5` cubre el payload v2 (superset + signalsV2) sin necesidad del bot.

## Cómo generar los transcripts
```bash
# 1. Asegurar verticalPack correcto en DB:
#    UPDATE chatbot_bot_config SET "verticalPack"='agencia' WHERE slug='develop';
# 2. Dev server con origin localhost:
npm run dev:qa
# 3. Smoke (otra terminal):
node scripts/ev5-smoke.mjs
```

## Gate EV.5
Franco lee los transcripts de captura y confirma:
1. El bot de agencia usó los ejemplos correctos (web/chatbot/IA) en el prompt de capture.
2. El payload v2 en n8n incluye `verticalPack` y `signalsV2` (superset de v1).
3. OK para cerrar el bloque EV completo.
