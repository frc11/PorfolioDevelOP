# EV.4 — Transcripts del smoke conversacional

Este directorio aloja los 7 transcripts (`.md` por conversación) que genera
`scripts/ev4-smoke.mjs`: 3 del bot de la agencia (`develop`) + 4 del bot de
concesionaria (`sanmiguel`/usados), vía POST real a `/api/chatbot/[slug]/chat`.

## ⚠️ Estado: PENDIENTE de correr (gated)

Los transcripts **no se generaron todavía** en este sprint. El smoke depende de
condiciones que no están dadas y que son decisión humana / costura EV.2-EV.3:

1. **Dev server caído** al cerrar EV.4. El endpoint valida `Origin`; para origin
   localhost hay que levantarlo con `QA_ALLOW_LOCALHOST=1` (ej. `npm run dev:qa`,
   puerto 3002).
2. **`verticalPack` de los bots = `'base'` en la DB** (default de la migración
   EV.2; el seed que setea `'usados'`/`'agencia'` no se corrió). Con los bots en
   `'base'`, el smoke NO ejercita los packs nuevos → no validaría EV.4. Es el
   **mismo gate de backfill que flagueó EV.3** y que está pendiente de decisión de
   Franco (la branch dev es compartida con el socio).
3. Los bots deben **existir** en la DB con su KB (San Miguel existe; el bot
   `develop` se siembra con `npx tsx src/modules/chatbot/prisma/seed.ts`).

## Cómo generar los transcripts (cuando se desbloquee)

```bash
# 1. Asegurar bots con su pack correcto (decisión de Franco — branch compartida):
#    UPDATE chatbot_bot_config SET "verticalPack"='agencia' WHERE slug='develop';
#    UPDATE chatbot_bot_config SET "verticalPack"='usados'  WHERE slug='sanmiguel';
#    (o correr los seeds correspondientes)

# 2. Levantar el dev server con origin localhost permitido:
npm run dev:qa            # puerto 3002

# 3. Correr el smoke (otra terminal):
EV4_BASE_URL=http://localhost:3002 node scripts/ev4-smoke.mjs
```

El script aborta e indica el motivo si el server no responde o si un bot no
existe / quedó en `'base'`. Cada transcript anota, al pie, el intent esperado por
turno (validado por `src/modules/chatbot/server/verticals/__tests__/ev4.invariant.ts`)
y los tool calls observados.
