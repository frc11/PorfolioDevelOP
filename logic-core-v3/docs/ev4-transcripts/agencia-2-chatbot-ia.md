# Agencia — interesado en chatbot IA

- **slug:** `develop`
- **sessionId:** `ev4-smoke-agencia-2-chatbot-ia-1782862529409`

### Turno 1
**Visitante:** Me interesa un chatbot con inteligencia artificial

**Bot:** Genial, los agentes de IA son una de nuestras especialidades. Para entender mejor cómo podemos ayudarte con un chatbot, contame un poco:

¿De qué tamaño es tu negocio y a qué rubro se dedica? Y, ¿qué proceso actual te está costando más tiempo o plata que crees que un chatbot podría mejorar?

### Turno 2
**Visitante:** ¿Por qué ustedes y no otra agencia?

**Bot:** Buena pregunta. Nuestro diferencial principal es que cada cliente tiene acceso a su propio portal SaaS, Logic Core. Ahí podés ver el estado de tus proyectos, métricas en tiempo real, las automatizaciones que tenés activas y reportes. Ningún otro competidor local ofrece algo así.

Además de eso, ¿qué es lo que más te importa resolver bien con un proveedor?

### Turno 3
**Visitante:** Lo necesito ya, es urgente

**Bot:** Entiendo, la urgencia es clave. Para que podamos darte una mano rápido, ¿qué es lo más crítico o el problema más grande que necesitás resolver ahora mismo con un chatbot de IA? Así vemos cómo encararlo.

---

## Intents detectados (esperados por el pack EV.4) y señales

| Turno | Mensaje del visitante | Intent esperado | HTTP | Tool calls |
|---|---|---|---|---|
| 1 | Me interesa un chatbot con inteligencia artificial | `service_inquiry` | 200 | — |
| 2 | ¿Por qué ustedes y no otra agencia? | `comparison` | 200 | — |
| 3 | Lo necesito ya, es urgente | `urgency` | 200 | — |

> Intent esperado = clave que el pack del bot debe detectar (validado por ev4.invariant.ts).
