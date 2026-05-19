# Baseline Chatbot Runtime — Mayo 2026

**Fecha de medición:** 2026-05-17
**Entorno:** Local dev (npm run dev)
**Bot:** develop (Lucia)
**Modelo:** gemini-2.5-flash (Vertex AI)
**Total requests:** 30
**Concurrent:** 3

## Resultados

| Métrica | Valor |
|---|---|
| Success rate | 33% (10/30) |
| Min response time | 3286ms |
| Avg response time | 6759ms |
| P50 | 4072ms |
| P90 | 12720ms |
| P95 | 12987ms |
| P99 | 12987ms |
| Max | 12987ms |

## Análisis

- **Tasa de éxito baja (33%):** De las 30 requests concurrentes (en batches de 3), 20 fallaron con error `429 Too Many Requests`. Esto indica que el rate limiter IP/Global actual es muy estricto para el test de carga o está funcionando según lo esperado en la configuración de la infraestructura (por seguridad contra abuso).
- **Tiempos de respuesta:**
  - El tiempo mínimo de 3.28s (P50 de ~4s) es típico de un cold start local interactuando con Vertex AI + generación LLM + operaciones de BD + streaming.
  - Los tiempos máximos (~13s) posiblemente correspondan a retries o encolamientos internos cuando el rate limit se satura o la respuesta incluye búsqueda extensa de herramientas.
- No hay errores de tipo 500 informados. Solo 429 por la limitación de peticiones.

## Próximos pasos

- Medir contra producción cuando esté desplegado, con una whitelist de IPs o subiendo el rate limit temporalmente.
- Re-medir después de optimizaciones de Beta para comparar.
- Establecer SLOs (Service Level Objectives) basados en estos números.

## Notas técnicas

- Tiempo incluye streaming completo del response (no solo TTFB).
- Si hay cold start de Vertex AI, los primeros requests pueden ser outliers.
- En producción esperamos +50-150ms por latencia de red real.

---

## Sprint R2 — Optimizaciones aplicadas (2026-05-19)

### Root causes identificados

1. **Rate limiter con key por IP** (`chat:${slug}:${ipHash}`): todas las requests del load test comparten la misma IP (localhost). Límite 10/min → 10 pasan, 20 fallan = 33% success rate. Artefacto del test, pero también afecta usuarios reales en conversaciones activas.

2. **6 queries de BD secuenciales antes del LLM**: resolveBotBySlug (JOIN) → checkQuota → findFirst(conversation, explícita) → findFirst(conversation, duplicada dentro de getOrCreateConversation) → update/create → chatMessage.create. ~230-450ms de overhead puro.

3. **Sin caching de BotConfig/KnowledgeBase**: JOIN pesado en cada request. La KB solo cambia cuando el admin guarda config.

4. **LLM domina la latencia** (externo): Gemini 2.5 Flash vía Vertex, full stream, ~3-5s típico. No optimizable sin cambiar modelo.

### Optimizaciones implementadas

| Opt | Cambio | Archivos |
|---|---|---|
| Opt-1 | Rate limit key cambiada a `chat:${slug}:${sessionId}` (por conversación) | `handleChatRequest.ts:109` |
| Opt-2 | `getOrCreateConversation` retorna `{ conversation, isNew }` — elimina findFirst duplicado | `resolver.ts`, `handleChatRequest.ts` |
| Opt-3 | `checkQuota` + `getOrCreateConversation` en `Promise.all` (paralelas) | `handleChatRequest.ts` |
| Opt-4 | Cache en memoria para `resolveBotBySlug` (TTL 60s) | `resolver.ts` |

### DB queries pre-LLM: 6 secuenciales → 3 (2 paralelas + 1 cacheada)

### Impacto esperado (medición pendiente — requiere dev server con bot configurado)

| Métrica | Antes | Esperado | Driver |
|---|---|---|---|
| Success rate | 33% | ~97-100% | Opt-1 |
| P50 | 4072ms | ~3500-3800ms | Opt-2+3+4 (~300-500ms saved) |
| P95 | 12987ms | ~10000-12000ms | Cold start Vertex persiste |

### Issues conocidos post-R2

1. **Cold start de Vertex AI**: P95 spike (~12s). No controlable desde el código. Plan futuro: Vertex AI Provisioned Throughput.
2. **P50/P95 targets originales (<1500ms/<3000ms) irreales**: El LLM domina. Para P50 <1500ms habría que medir TTFB (primer token ~700ms) o cambiar a `gemini-2.5-flash-lite`.
3. **Cache in-memory no persiste entre instancias serverless**: En Netlify, instancias separadas no comparten el Map. Mitigación futura: Upstash Redis.
