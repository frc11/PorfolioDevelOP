# seed-latency — Lane intel-health

Seed de **desarrollo** para el LatencyChart de `/admin/chatbot/health`.
Inserta eventos `chat.message_completed` con `metadata.latencyMs` distribuido en
las últimas 24h, para que el chart muestre curvas P50/P95 y el verdict tenga datos.

## Qué hace

- Busca un `BotConfig` (preferentemente `slug: 'develop'`, si no el primero) y le
  cuelga ~96 eventos `chat.message_completed`.
- Cada evento: `conversationId = null`, `level = INFO`,
  `metadata = { _seed: 'intel-health', kind: 'dev-latency-seed', latencyMs }`.
- `createdAt` distribuido en 24 horas (3–5 eventos por hora).
- Latencia right-skewed con **cap duro 4499ms**: P50 ≈ 600–1200ms, cola ~3500ms,
  picos 4100–4499ms en 2 horas. Invariantes garantizadas: **P95 < 5000ms**
  (verdict `'ok'`) y **ningún evento > 12000ms**.
- `MIN_SAMPLES_FOR_CHART = 10` se supera de sobra → status `'ok'`.

## Correr

```bash
# desde logic-core-v3/
npm run seed:latency
```

Idempotente: borra primero lo sembrado por este lane y vuelve a insertar.

## Reversibilidad / cleanup

Los eventos quedan marcados con `metadata._seed = 'intel-health'`. Para removerlos:

```bash
# desde logic-core-v3/
npm run seed:latency -- --clean
```

Eso ejecuta:

```ts
await prisma.chatbotEvent.deleteMany({
  where: { metadata: { path: ['_seed'], equals: 'intel-health' } },
})
```

**Orden FK:** no hay dependencias que ordenar — `conversationId` es `null` en todos
los eventos sembrados (no se crearon Conversations). El `BotConfig` destino es
preexistente y **no** se toca: el cleanup solo borra los `ChatbotEvent` del lane.

## Nota importante (data compartida)

`ChatbotEvent` es una tabla compartida. Estos eventos sembrados **también aparecen**
en `/admin/chatbot/activity` y en la sección de chatbots (cuelgan del bot real). Es
esperado y por eso el marcador `_seed` propio del lane permite borrarlos sin tocar
data real.
