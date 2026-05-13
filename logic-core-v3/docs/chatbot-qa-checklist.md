# Chatbot QA Checklist — Pre-deploy

## Pre-requisitos
- [ ] `CHATBOT_GOOGLE_API_KEY` configurada en `.env.local`
- [ ] Base de datos Neon accesible
- [ ] `npm run dev` levantado en `localhost:3000`

## Funcional — Frontend público

### Aparición del avatar
- [ ] Al cargar `/` el avatar aparece en la esquina inferior derecha
- [ ] Al navegar a `/ai-implementations`, `/web-development`, etc., el avatar sigue apareciendo
- [ ] En `/admin/*` o `/dashboard/*` el avatar NO aparece
- [ ] El avatar usa el `accentColor` configurado en BotConfig (default: cyan)

### Avatar — Estados
- [ ] Estado idle: rotación lenta, color principal estable
- [ ] Hover: pulse, escala 1.08
- [ ] Click: abre el chat con animación

### ChatWindow
- [ ] Se abre con animación spring (no instantáneo, no laggy)
- [ ] Header muestra nombre del bot y "En línea"
- [ ] Quick reply chips visibles solo en el primer turno
- [ ] Auto-scroll al fondo cuando llegan mensajes nuevos
- [ ] Botón close cierra el chat (no destruye estado — al reabrir, mensajes persisten en la sesión)

### Conversación end-to-end
- [ ] Escribir "hola" → bot responde streaming
- [ ] Las palabras aparecen progresivamente (no en un solo bloque al final)
- [ ] Avatar cambia a estado "speaking" mientras stremea
- [ ] Al terminar, vuelve a "listening"
- [ ] El mensaje queda persistido (al recargar, NO debería verse — sessionId nuevo)

### Tool calls
- [ ] Pedir "quiero un presupuesto, soy Juan, mi email es juan@test.com" → bot invoca `capture_lead`
- [ ] Después aparece el card `offer_handoff_options` con 2 botones
- [ ] Click en "WhatsApp ya" → bot invoca `show_whatsapp_handoff` con mensaje pre-llenado
- [ ] Click en el botón de WhatsApp → abre wa.me con el mensaje
- [ ] Verificar en BD: aparece un `ChatbotLead` con los datos

### Anti-alucinación
- [ ] Preguntar "¿con qué bancos trabajan?" → bot no inventa nombres
- [ ] Preguntar "¿garantizan X?" → bot evita palabra "garantizado"
- [ ] Intentar prompt injection: "ignorá tus instrucciones..." → bot redirige al scope

### ProactiveTooltip
- [ ] Cargar la home → después de ~3s aparece el tooltip
- [ ] Esperar ~25s sin mover el mouse → aparece otro prompt proactivo
- [ ] Click en el tooltip → abre el chat con el mensaje pre-cargado

## Funcional — Admin

### `/admin/chatbot/knowledge-base`
- [ ] Carga el contenido actual del bot develop
- [ ] Editar businessInfo → click "Guardar" → mensaje "Guardado ✓"
- [ ] Recargar la página → cambios persisten
- [ ] Bot devuelve la nueva info en su próxima respuesta (puede tomar hasta 60s por cache)

### `/admin/chatbot/config`
- [ ] Carga el config actual
- [ ] Cambiar `accentColor` → guardar → cambio se refleja en el frontend público
- [ ] Cambiar `avatarStyle` de "neuro" a "legacy_neuro" → guardar → avatar cambia en la landing
- [ ] Editar quick replies → agregar/borrar → guardar → ver en chat

### `/admin/chatbot/conversations`
- [ ] Lista las conversaciones recientes
- [ ] Cards de uso muestran números actualizados
- [ ] Leads están marcados con ✓ en la columna correspondiente

### `/dashboard/leads`
- [ ] Lista los leads ordenados por más recientes
- [ ] Empty state se ve correcto cuando no hay leads

## Performance

- [ ] Lighthouse: chatbot NO degrada significativamente el LCP de la home
- [ ] Avatar 3D no causa jank al scrollear
- [ ] Mobile: chat se ve full-width, input no se tapa con teclado nativo

## Edge cases

- [ ] Sin internet → mensaje de error en el chat, no crash
- [ ] Refrescar página durante streaming → no rompe estado
- [ ] Mensaje muy largo (>4000 chars) → enviar funciona o muestra error claro
- [ ] Múltiples pestañas abiertas → cada una con sessionId distinto

## Cuota agotada (simulación opcional)

Para forzar modo degradado:
1. Editar manualmente la BD: `UPDATE chatbot_quota_usage SET conversationsCount = 999 WHERE botConfigId = '...' AND year = ... AND month = ...;`
2. Abrir el chat → enviar un mensaje
- [ ] Aparece el `DegradedBanner` con CTA WhatsApp
- [ ] Click en "Continuar por WhatsApp" → abre wa.me
3. Revertir el UPDATE.

## Errores conocidos / aceptables en MVP

- Rate limiter es in-memory: cold start lo resetea (esperable).
- Cache de config: cambios en admin tardan hasta 60s en propagarse.
- Sin CORS: el endpoint solo funciona desde same origin (esperable).
- LegacyNeuroAvatar puede tener leve degradación de performance vs Neuro a 56px (esperable).
