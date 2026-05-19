# 05 — Cliente reporta "el bot no anda"

**Tiempo estimado:** 10-60 minutos
**Responsable:** Franco (cliente-facing)

## Pre-flight: respirar 30 segundos

Cliente afectado = cliente ansioso. Tu primer trabajo es **bajarle la ansiedad**:

```
Hola [nombre], ya vi tu mensaje. Estoy revisando ahora mismo.
Te confirmo qué pasa en X minutos.
```

NO prometas resolución todavía — solo investigación.

## Triage en 3 minutos

### Step 1: ¿Está activo?

`/admin/clients/[clientId]` → ¿está activo?

- **NO** → activarlo (ver [workflow 02](./02-activar-bot.md))
- **SÍ** → continuar

### Step 2: ¿Health endpoint OK?

`/api/chatbot/[slug]/health`

- **Error 5xx** → ver [workflow 04](./04-responder-alerta.md) (LLM_PROVIDER_ERROR)
- **OK** → continuar

### Step 3: ¿Hay actividad reciente?

`/admin/clients/[slug]/chatbot/activity` → últimas 24h

- **Hay actividad y errores** → ver patrón, ir a step 4
- **Hay actividad y todo OK** → el problema puede ser el embed del cliente
- **Sin actividad** → el chatbot no está siendo invocado

### Step 4: Probar yo mismo

Abrir el sitio del cliente o usar el chatbot directo:

```bash
curl -X POST https://develop-portfolio.netlify.app/api/chatbot/[slug]/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hola"}], "sessionId":"debug-test"}'
```

- **Funciona** → el problema es del lado del cliente (browser, embed, network)
- **No funciona** → bug del bot, ir a step 5

## Causa probable según síntoma

### Síntoma: "no responde nada"
- ¿Embed script está en el sitio? (pedir screenshot del HTML)
- ¿Browser bloquea cookies? (Safari/Brave estricto)
- ¿Hay JS error en consola del cliente?

### Síntoma: "responde pero mal"
- KB desactualizada o contradictoria
- Tone configurado mal (formal vs informal mismatch)
- Quick replies mal redactados

### Síntoma: "responde en español pero raro"
- Vertex AI puede tener glitch — probar de nuevo
- Si persiste, revisar temperature (puede estar muy alto)

### Síntoma: "no me llegan los leads por WhatsApp"
- `whatsappNumber` en BotConfig puede estar mal
- Tool de handoff puede no estar siendo invocado
- Revisar audit log de ese chat — buscar lead capture

## Comunicar resolución

```
Listo [nombre], ya está arreglado.

Qué pasó: [descripción simple, sin jerga técnica]
Qué hicimos: [acción concreta]

Si vuelve a pasar, mandame screenshot.

Franco
```

## Si NO podés resolver en 1 hora

Comunicar honestamente:

```
[nombre], te pido disculpas. Estoy en este tema pero está siendo más complejo de lo que esperaba.

ETA real: [tiempo realista]

Mientras tanto, tu bot está [pausado / funcionando con limitación] — [descripción].

Te aviso en cuanto resuelvo.

Franco
```

## Common pitfalls

❌ **Decir "ya está resuelto" sin probarlo**: peor que el problema original
❌ **Explicaciones técnicas al cliente**: no entiende, se asusta
❌ **Defenderse antes de investigar**: cliente quiere sentir que lo escuchás
❌ **No mencionar ETA**: cliente sigue ansioso
❌ **Resolver sin entender la causa**: garantía de que vuelve a pasar

## Postmortem (cuando ya pasó)

Después de resolver, anotar en `docs/incidents/[fecha]-[cliente]-[issue].md`:

- Qué pasó (síntoma)
- Causa raíz (técnica)
- Resolución
- Prevención (qué hacer para que no vuelva a pasar)
- Tiempo de resolución total
- Comunicación al cliente: ¿bien manejada?

Esto es para vos en 6 meses cuando vuelva a pasar algo parecido.
