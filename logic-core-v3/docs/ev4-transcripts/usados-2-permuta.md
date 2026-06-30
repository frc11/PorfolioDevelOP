# Usados — permuta

- **slug:** `sanmiguel`
- **sessionId:** `ev4-smoke-usados-2-permuta-1782862558664`

### Turno 1
**Visitante:** Tengo un usado para entregar en parte de pago

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

### Turno 2
**Visitante:** ¿Cuánto me tomás el mío?

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

### Turno 3
**Visitante:** ¿Y la diferencia la puedo financiar?

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

---

## Intents detectados (esperados por el pack EV.4) y señales

| Turno | Mensaje del visitante | Intent esperado | HTTP | Tool calls |
|---|---|---|---|---|
| 1 | Tengo un usado para entregar en parte de pago | `trade_in` | 404 | — |
| 2 | ¿Cuánto me tomás el mío? | `trade_in` | 404 | — |
| 3 | ¿Y la diferencia la puedo financiar? | `financing_inquiry` | 404 | — |

> Intent esperado = clave que el pack del bot debe detectar (validado por ev4.invariant.ts).
