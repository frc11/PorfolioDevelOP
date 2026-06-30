# Agencia — interesado en sitio web

- **slug:** `develop`
- **sessionId:** `ev4-smoke-agencia-1-web-1782862496583`

### Turno 1
**Visitante:** Hola, necesito un sitio web para mi negocio

**Bot:** Dale, nosotros hacemos sitios web. Para entender mejor qué necesitás, contame un poco: ¿de qué rubro es tu negocio y qué te gustaría lograr con el sitio? Por ejemplo, ¿buscás más ventas, mostrar tus productos, o algo más?

### Turno 2
**Visitante:** ¿Cuánto sale más o menos?

**Bot:** Un sitio web nuestro arranca desde los $800 USD. El precio final varía mucho según lo que necesites.

Para darte una idea más precisa, contame un poco más: ¿tu negocio ya tiene presencia online o sería tu primera web? ¿Y qué tipo de funcionalidades te interesan más, como un catálogo de productos, un sistema de reservas, o algo más simple?

### Turno 3
**Visitante:** Quiero coordinar una reunión para charlarlo

**Bot:** Dale, perfecto. Para que el equipo te pueda contactar y coordinar una reunión, preparé este mensaje para WhatsApp. Así pueden entender rápido lo que buscás y te dan una mano.
Ahí te sale una tarjeta para que vayas directo a WhatsApp. Así el equipo te contacta y coordinan una charla.

---

## Intents detectados (esperados por el pack EV.4) y señales

| Turno | Mensaje del visitante | Intent esperado | HTTP | Tool calls |
|---|---|---|---|---|
| 1 | Hola, necesito un sitio web para mi negocio | `service_inquiry` | 200 | — |
| 2 | ¿Cuánto sale más o menos? | `price` | 200 | — |
| 3 | Quiero coordinar una reunión para charlarlo | `consultation` | 200 | show_whatsapp_handoff, show_whatsapp_handoff |

> Intent esperado = clave que el pack del bot debe detectar (validado por ev4.invariant.ts).
