# Usados — comprador caliente (modelo + financiación + visita)

- **slug:** `sanmiguel`
- **sessionId:** `ev4-smoke-usados-1-comprador-caliente-1782862556791`

### Turno 1
**Visitante:** ¿Tenés el Corolla que publicaron?

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

### Turno 2
**Visitante:** ¿Se puede en cuotas con prendario?

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

### Turno 3
**Visitante:** Quiero ir a verlo y hacer un test drive

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

### Turno 4
**Visitante:** Mi teléfono es 381 555 1234, llámenme

⚠️ HTTP 404 — {"error":"Bot not found or inactive"}

---

## Intents detectados (esperados por el pack EV.4) y señales

| Turno | Mensaje del visitante | Intent esperado | HTTP | Tool calls |
|---|---|---|---|---|
| 1 | ¿Tenés el Corolla que publicaron? | `specific_model` | 404 | — |
| 2 | ¿Se puede en cuotas con prendario? | `financing_inquiry` | 404 | — |
| 3 | Quiero ir a verlo y hacer un test drive | `schedule_visit` | 404 | — |
| 4 | Mi teléfono es 381 555 1234, llámenme | `human_handoff` | 404 | — |

> Intent esperado = clave que el pack del bot debe detectar (validado por ev4.invariant.ts).
