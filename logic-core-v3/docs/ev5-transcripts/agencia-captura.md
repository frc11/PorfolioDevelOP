# Agencia — captura de lead (cierre EV.5)
> Conversación diseñada para disparar capture_lead. Verifica tool copy agencia + payload v2.
- **slug:** `develop`
- **sessionId:** `ev5-smoke-agencia-captura-1782865834775`
### Turno 1
**Visitante:** Hola, me llamo Carlos Fernández. Quiero contratar un sitio web para mi ferretería.
**Bot:** Hola Carlos. Genial, los sitios web para negocios como el tuyo son nuestra especialidad.

Para darte la mejor orientación, contame un poco: ¿cómo manejan hoy las ventas o la comunicación con clientes en la ferretería? ¿Hay algún proceso específico que sientas que les está costando más tiempo o plata?
### Turno 2
**Visitante:** Mi email es carlos@ferreteria-gonzalez.com. ¿Cuánto sale más o menos?
**Bot:** Gracias por tu email, Carlos.

Los sitios web para negocios como el tuyo arrancan desde los $800 USD y el tiempo de entrega promedio es de 15 días.

Para poder darte un número más ajustado y entender bien lo que necesitan, ¿qué funcionalidades específicas te interesaría que tuviera la web para tu ferretería?
**Tools:** capture_lead, capture_lead
### Turno 3
**Visitante:** Me interesa seguir adelante. ¿Me contactan para coordinar?
**Bot:** Listo, Carlos. Registramos tu interés.

¿Preferís que el equipo te contacte directamente por WhatsApp para coordinar los detalles de la web para tu ferretería, o te paso el link para que inicies la conversación cuando te venga mejor?
---
## Tabla de intents y tool calls
| Turno | Mensaje | Intent esperado | HTTP | Tool calls | Nota |
|---|---|---|---|---|---|
| 1 | Hola, me llamo Carlos Fernández. Quiero contratar un sitio web para mi ferretería. | `service_inquiry` | 200 | — | Nombre + servicio concreto → askedSpecificModel=true (EV.5: ejemplo del pack agencia) |
| 2 | Mi email es carlos@ferreteria-gonzalez.com. ¿Cuánto sale más o menos? | `price` | 200 | capture_lead, capture_lead | Canal de contacto + consulta de precio → canal disponible para capture_lead |
| 3 | Me interesa seguir adelante. ¿Me contactan para coordinar? | `consultation` | 200 | — | Señal de cierre → debe disparar capture_lead (nombre + email disponibles) |
---
## Resultado EV.5
- **capture_lead fired:** ✅ capture_lead disparó
- **payload v2:** verificado por `ev5.superset.invariant.ts` (superset OK, signalsV2 correcto)
- **CrmSyncAttempt:** se crea si la org tiene CRM integration habilitada; verificar en DB o logs.
