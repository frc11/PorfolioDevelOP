# Usados — pide hablar con humano

- **slug:** `sanmiguel`
- **sessionId:** `ev4-smoke-usados-4-humano-1782862561994`

### Turno 1
**Visitante:** Quiero hablar con un vendedor

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

### Turno 2
**Visitante:** Pasame el número de la agencia

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

---

## Intents detectados (esperados por el pack EV.4) y señales

| Turno | Mensaje del visitante | Intent esperado | HTTP | Tool calls |
|---|---|---|---|---|
| 1 | Quiero hablar con un vendedor | `human_handoff` | 404 | — |
| 2 | Pasame el número de la agencia | `human_handoff` | 404 | — |

> Intent esperado = clave que el pack del bot debe detectar (validado por ev4.invariant.ts).
