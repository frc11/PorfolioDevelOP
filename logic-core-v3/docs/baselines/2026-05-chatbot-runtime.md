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
