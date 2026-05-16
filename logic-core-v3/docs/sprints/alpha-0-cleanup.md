# Alpha.0 Cleanup Sprint

## Resumen del Sprint
El objetivo del Sprint Alpha.0 fue sentar las bases para la fase de profesionalización y escalar la plataforma DevelOP a una arquitectura multi-tenant y de alto rendimiento. Las tareas abarcaron desde la auditoría exhaustiva del frontend y métricas de rendimiento, hasta la eliminación de deuda técnica y consolidación de directorios en el layout de administración `/admin`.

### 1. Limpieza y Archivos Residuales
- Se auditaron y eliminaron componentes, layouts e índices que correspondían a la iteración antigua de la arquitectura bajo `/admin/os` y `/os`, los cuales quedaron sin uso y generaban errores fantasma durante compilaciones o rutas no deseadas.
- Se silenció código ruidoso como los sondeos en consolas que contaminaban el log de producción (`ActivityLog.tsx`).

### 2. Seguridad en Endpoints Administrativos
- **Vulnerabilidades Resueltas:** Se identificaron 6 `server actions` y 1 API route que operaban la base de datos de los chatbots sin barrera de autorización.
- **Implementación:** Se creó el guard `requireSuperAdmin` el cual fue inyectado al inicio de `saveBotConfig`, `saveKnowledgeBase`, `createClientWithBot`, `sendTestNotification` (y sus variantes) y en la ruta `/api/admin/chatbot/events`.
- Ahora solo los roles `SUPER_ADMIN` pueden modificar configuraciones, previniendo accesos no autorizados.

### 3. Migración de Rutas Multi-Tenant
- Se corrigió el flujo de onboarding (Wizard), el cual requería una estructura `/admin/clients/[orgSlug]/chatbot` para funcionar.
- **Páginas creadas:** `overview`, `config`, `knowledge`, `conversations`, `leads`, y `activity`.
- Se proveyó su respectivo Layout anidado que muestra la configuración actual del chatbot con sus `ClientChatbotTabs`.
- El redirect del wizard ahora fluye sin errores hacia la nueva pestaña `overview`.

### 4. Estricto Tipado de React y Prisma
- Múltiples type casts `as any` en los pasos 1, 2 y 4 de onboarding del chatbot fueron reemplazados por sus equivalentes estrictos utilizando propiedades indexadas de `OnboardingState` y el schema de `Industry`.
- Se resolvió la deuda de tipos en `CommandCenterClient.tsx` y `ChatbotManager.tsx` extrayendo el tipo de respuesta estricto con `Prisma.PromiseReturnType`.

### 5. Consolidación de UI Components
- **StatCards:** Se detectaron dos versiones incompatibles (`chatbot` vs `os`). Fueron unificadas extendiendo la funcionalidad base del admin para aceptar números y props de formateo, reduciendo duplicación de código e inconsistencias visuales.
- **Toasts de Sonner:** Componentes administrativos como `BotConfigEditor` y `KnowledgeBaseEditor` usaban frágiles `setTimeout` con estado local. Se migraron a `sonner` para una respuesta visual instantánea, robusta y con colas asíncronas correctas.
- **Sidebar Admin:** Se purgaron links inactivos y hardcodeados, reemplazándolos con las vistas globales (`Health` y `Activity`).

### 6. Caching y Optimización de Consultas a BD
- Se mitigaron múltiples hit requests a la DB producidas por redundancia en `auth()`.
- La abstracción `NextAuth` en `auth.ts` fue envuelta explícitamente en `React.cache()`, aplicando la misma deduplicación eficiente de servidor para `getClientChatbotSession()`.

## Decisiones Arquitectónicas Pendientes
**Command Centers (Decisión para Alpha.1)**
Existe duplicación de responsabilidad visual entre `/admin/agency-dashboard` y `/admin/clients/[clientId]`. Dado el riesgo de refactorizaciones profundas para el tiempo restante en este primer sprint, se ha pospuesto unificar el Command Center. 
*Acción sugerida para el siguiente sprint:* Migrar gestores de entregables y bóveda hacia la vista detallada del cliente (`/admin/clients/[clientId]`) y eliminar la ruta `agency-dashboard` de raíz.

---

> [!TIP]
> **Checklist Final**
> - [x] Limpieza completada
> - [x] Autenticación reforzada (`SUPER_ADMIN`)
> - [x] Tipado estricto finalizado
> - [x] Rutas multi-tenant implementadas (6 páginas)
> - [x] Componentes de UI consolidados (StatCard, sonner)
> - [x] NextAuth / Prisma React.cache optimizations
> - [x] Next.js Build ✅
