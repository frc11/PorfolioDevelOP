# Sprint Alpha.0.5 — Fixes post test manual

**Fecha:** 2026-05-17
**Duración real:** 2h

## Cambios aplicados

### Performance
- Cache verificado/aplicado en: `auth`, `resolveOrgId`, `isAdminPreview`, `getClientChatbotSession`.
- SubscriptionBanner refactorizado: SÍ (extraído helper `getSubscriptionForOrg` con cache y recibe `orgId`).

### Agency Dashboard
- 3 botones agregados a ChatbotManager: Configurar bot, Editar conocimiento, Ver detalle completo.
- CTA agregado cuando cliente no tiene bot: "Configurar chatbot".
- Error rojo "sin proyecto" suavizado a estado neutro informativo con call to action a "Crear primer proyecto".

### Activity Log
- Formato 24h aplicado a todas las fechas.
- Etiquetas "Hoy"/"Ayer" para eventos recientes y fecha local para los antiguos.

### Dashboard cliente
- "Mi Chatbot" agregado al sidebar (siempre visible).
- ChatbotUpsellLanding component creado con hero, beneficios, confianza y precios.
- ChatbotOverview extraído como componente separado de la lógica de página.
- `checkClientHasChatbot` helper creado y cached en `src/modules/chatbot/server/admin/clientHasChatbot.ts`.

## Commits
(Se commitea al final del reporte en consola por el usuario)

## Issues conocidos / pendientes
Ninguno detectado en esta fase.

## Próximo sprint
Alpha.0.6 — Limpieza legacy duplicado + auditoría env vars
