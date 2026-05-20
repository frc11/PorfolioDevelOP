# 06 — Instalar widget en sitio del cliente

**Tiempo estimado:** 10-20 minutos  
**Responsable:** develOP (guía al cliente)  
**Prerequisito:** Bot activo en `/admin/chatbots/[botId]`, dominios autorizados configurados

## Pre-requisitos

Antes de enviar el snippet al cliente, verificar:

- [ ] Bot está activo (`isActive: true`)
- [ ] Dominio(s) del cliente configurados en Config → Dominios permitidos
- [ ] El sitio del cliente está accesible (no en construcción)

Si los dominios no están configurados, el widget no va a cargar. El admin tab "Instalar" te avisa con un error si falta este paso.

## Workflow

### 1. Ir al tab "Instalar" del bot

En `/admin/chatbots/[botId]?tab=install` encontrás:
- El snippet listo para copiar
- Instrucciones paso a paso por plataforma
- Links directos al sitio del cliente para verificar

### 2. Copiar el snippet

```html
<script src="https://develop.com.ar/widget.js" data-bot="[slug-del-bot]" data-theme="dark"></script>
```

El tab tiene botón copy que lo copia al portapapeles.

### 3. Enviarlo al cliente con instrucciones

Mandá el snippet y las instrucciones de su plataforma. Podés copiar desde el tab o usar este template:

```
Hola [nombre],

Para instalar el chatbot en tu sitio, copiá este código:

[snippet]

Pegalo justo antes del cierre de </body> en todas las páginas de tu sitio.

Plataforma específica:
- WordPress: Plugins → Insert Headers and Footers → Scripts in Footer
- Tiendanube: Configuración → Códigos externos → Scripts antes de </body>
- Shopify: Online Store → Themes → Edit code → theme.liquid, antes de </body>
- Wix: Settings → Custom Code → Body end (requiere plan Business+)
- Squarespace: Settings → Advanced → Code Injection → Footer

Franco — develOP
```

### 4. Verificar que carga

Una vez que el cliente pegó el snippet:

1. Abrir su sitio en una pestaña nueva
2. Debería aparecer la burbuja flotante del chatbot en la esquina
3. Hacer click y probar que responde

Si el sitio está en el tab "Instalar", hay un link directo para abrirlo.

### 5. Confirmarle al cliente

```
Listo [nombre]! El chatbot ya está activo en tu sitio.

Si ves algo raro o querés ajustar algo, avisame.

Franco — develOP
```

## Common pitfalls

❌ **Snippet en `<head>` en vez de antes de `</body>`** — funciona pero no es óptimo para performance  
❌ **Dominio sin `www` pero el sitio usa `www`** (o viceversa) — agregar ambas variantes en allowedDomains  
❌ **CSP estricto en el sitio del cliente** — si el sitio tiene Content-Security-Policy que bloquea iframes, hay que pedir al cliente que agregue `frame-src https://develop.com.ar`  
❌ **Wix free plan** — no permite scripts custom, el cliente necesita plan Business o superior  
❌ **Bot pausado** — el widget carga pero no responde; el tab "Instalar" avisa con un banner amarillo  

## Verificación técnica

Para confirmar que el widget se está cargando:

1. Ir a `/admin/chatbots/[botId]?tab=activity`
2. Buscar eventos `CHAT.START` — aparecen cuando alguien abre el widget
3. Si hay `CHAT.START` con el dominio del cliente, la instalación fue exitosa

Si el cliente dice "no aparece":
1. Abrir DevTools → Console en el sitio del cliente
2. Buscar errores de `widget.js` — suele ser CORS o CSP
3. Ver [05-cliente-no-anda.md](./05-cliente-no-anda.md) para diagnóstico completo

## Siguiente paso

Ver [02-activar-bot.md](./02-activar-bot.md) si el bot aún no fue activado formalmente.
