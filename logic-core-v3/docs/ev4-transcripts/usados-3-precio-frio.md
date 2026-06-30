# Usados — consulta de precio fría

- **slug:** `sanmiguel`
- **sessionId:** `ev4-smoke-usados-3-precio-frio-1782862560359`

### Turno 1
**Visitante:** ¿Cuánto sale la Hilux?

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

### Turno 2
**Visitante:** ¿Es negociable el precio?

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

### Turno 3
**Visitante:** Gracias, lo pienso

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

---

## Intents detectados (esperados por el pack EV.4) y señales

| Turno | Mensaje del visitante | Intent esperado | HTTP | Tool calls |
|---|---|---|---|---|
| 1 | ¿Cuánto sale la Hilux? | `specific_model` | 404 | — |
| 2 | ¿Es negociable el precio? | `price_inquiry` | 404 | — |
| 3 | Gracias, lo pienso | `unknown` | 404 | — |

> Intent esperado = clave que el pack del bot debe detectar (validado por ev4.invariant.ts).
