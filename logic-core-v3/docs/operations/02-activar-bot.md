# 02 — Activar un bot

**Tiempo estimado:** 5-10 minutos
**Responsable:** Cualquiera
**Prerequisito:** Cliente onboardeado (ver [workflow 01](./01-onboarding-cliente.md))

## Cuándo aplicar

- Bot recién creado y todavía no está respondiendo en producción
- Bot fue pausado y hay que reactivarlo
- Bot configurado por desarrollo, falta activarlo formalmente

## Paso 1: Ir al detail del cliente

1. `/admin/clients`
2. Buscar el cliente
3. Click en la card
4. Tab "Chatbot"

## Paso 2: Pre-flight check

Click "Activar bot" — se abre el modal con los 6 checks:

- ✓ Knowledge base completa
- ✓ Mensaje de bienvenida
- ✓ Quick replies (mínimo 3)
- ✓ WhatsApp configurado
- ✓ Color de acento
- ✓ Quota mensual

Si algún check está rojo: **resolverlo antes de activar**.

Si solo hay warnings amarillos: podés activar igual pero es mejor resolverlos.

## Paso 3: Probar antes de activar

⚠ Antes de hacer click final en "Activar":

1. Abrir en otra pestaña `/api/chatbot/[slug]/health`
2. Verificar JSON response: `"ok": true`
3. Mandar mensaje de prueba:

```bash
curl -X POST https://develop-portfolio.netlify.app/api/chatbot/[slug]/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hola, qué hacen?"}],
    "sessionId": "test-pre-activation"
  }'
```

Debe responder coherentemente.

## Paso 4: Activar

Click **"Activar bot"** en el modal.

Toast de confirmación: "Bot activado".

## Paso 5: Avisar al cliente

```
Hola [nombre]! Tu chatbot ya está activo en producción.

Probalo en tu sitio: [url]

Si ves algo raro, mandame screenshot por WhatsApp.

Vas a recibir un email cada lunes con el resumen de la semana.

Franco — develOP
```

## Common pitfalls

❌ **Activar sin probar**: 1 de cada 10 veces hay un edge case que rompe — siempre probar primero
❌ **No verificar quota**: si el cliente está cerca del límite, comunicarle antes
❌ **No revisar logs primero**: ir a `/admin/clients/[slug]/chatbot/activity` y ver que no hay errores recientes

## Siguiente paso

Ver [03-editar-kb.md](./03-editar-kb.md) cuando el cliente pida cambios.
