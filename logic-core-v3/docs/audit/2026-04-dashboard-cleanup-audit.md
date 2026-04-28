# Dashboard Cleanup Audit — Abril 2026

## 1. Resumen ejecutivo
- **Bajo riesgo estructural**: La eliminación de las 14 rutas listadas tiene un impacto a nivel de base de datos mayoritariamente BAJO. En su mayoría consumen el flag hardcoded `unlockedFeatures` del modelo `User` y renderizan componentes con datos mock estáticos o provistos por la API de Google (en el caso de SEO).
- **Módulos premium frágiles**: La gestión actual de módulos premium se basa en un array de strings (`User.unlockedFeatures`) sin un modelo relacional formal de suscripción por módulo, lo cual genera deuda técnica y dificulta la facturación escalable.
- **Dependencias faltantes**: Para las próximas etapas del dashboard (Fase 1), el proyecto ya cuenta con `recharts` y `zod`, pero carece de utilidades críticas como formateadores de fechas (`date-fns` o `dayjs`) y librerías de calendario para la gestión de turnos.

## 2. Bloqueantes detectados (HIGH/BLOCKING impact)
- **Notificaciones (Ruta: `/dashboard/notificaciones`)**: Es la única ruta de la lista con un nivel de impacto **MEDIUM/HIGH**. Consume directamente registros reales de la base de datos a través del modelo `Notification`. Si se elimina la UI de esta ruta sin reubicarla (por ejemplo, hacia un dropdown global), los datos quedarán huérfanos y los usuarios no tendrán forma de visualizar o marcar como leídas alertas reales que ya genera el sistema (como notificaciones de Upsell, mensajes nuevos de Admin o rutinas de `os-follow-up`).

## 3. Inventario de modelos Prisma
Listado exhaustivo de modelos actuales identificados en `schema.prisma`:

| Modelo | Campos Clave / Relaciones | Propósito Principal |
| :--- | :--- | :--- |
| **Account** | userId (User) | Integración NextAuth. |
| **Session** | userId (User) | Integración NextAuth. |
| **VerificationToken** | identifier, token | Autenticación y recuperación. |
| **User** | email, role, unlockedFeatures | Manejo de autenticación, roles y features habilitadas (hardcoded strings). |
| **PasswordResetToken** | userId (User) | Gestión de recuperación de contraseñas. |
| **Organization** | slug, onboardingCompleted | Core tenant (Multi-tenancy). Contiene relación a proyectos, servicios y miembros. |
| **OrgMember** | userId, organizationId, role | Tabla pivote para asociación de usuarios a organizaciones. |
| **Service** | organizationId (Organization) | Tipo de servicio contratado (WEB_DEV, AI, etc). |
| **Project** | organizationId (Organization) | Proyectos asociados a los servicios de la organización. |
| **Task** | projectId, assignedToId | Tareas de los proyectos (maneja estados y aprobaciones). |
| **Message** | organizationId (Organization) | Sistema de mensajes entre cliente y agencia. |
| **Subscription** | organizationId (Organization) | Manejo de status (ACTIVE, PAST_DUE). |
| **Invoice** | organizationId (Organization) | Facturas generadas. |
| **ContactSubmission**| email, leadStatus | Formulario de leads/contacto externos. |
| **Notification** | userId, organizationId, taskId | Notificaciones in-app. |
| **ClientAsset** | organizationId (Organization) | Bóveda de contraseñas y documentos. |
| **ClientBrandProfile**| organizationId (Organization) | Identidad de marca, guardada en onboarding. |
| **Ticket** | organizationId, userId | Soporte técnico y feature requests. |
| **TicketMessage** | ticketId, userId | Mensajes dentro de un ticket. |
| **BusinessMetric** | clientId (User) | Métricas comerciales (usado como demo). |
| **PageView** | clientId | Análisis de visitas (pixel). |
| **AgencySettings** | id | Configuraciones globales de la agencia. |
| **ModulePricing** | featureKey | Precios por módulo. |
| **OsLead** | assignedToId | Leads del OS interno. |
| **OsLeadActivity** | leadId, performedById | Actividades de seguimiento (CRM interno). |
| **OsDemo** | leadId | Demos enviadas. |
| **OsPaymentMilestone**| projectId | Hitos de pago por proyectos. |
| **OsMaintenancePayment**| projectId | Pagos de mantenimiento mensual. |
| **OsTimeEntry** | taskId, projectId, userId | Control de horas trabajadas. |

## 4. Mapeo rutas → modelos

| Ruta | Componente principal | Modelos Prisma usados | Server actions | Impact level |
| :--- | :--- | :--- | :--- | :--- |
| `/dashboard/agenda` | `AgendaInteligentePage` | `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/automations` | `AutomationsPage` | `Organization` (findUnique) | `requestUpsellAction` | LOW |
| `/dashboard/client-portal`| `ClientPortalPage` | `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/configuracion/pixel`| `PixelConfigPage` | `Ninguno` (solo `resolveOrgId`) | Ninguno | LOW |
| `/dashboard/pixel` | `PixelRetargetingPage`| `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/crm` | `MiniCrmPage` | `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/ecommerce` | `EcommercePage` | `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/email-automation`| `EmailAutomationPage` | `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/email-nurturing`| `EmailNurturingPage`| `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/resenias` | `MotorReseniasPage` | `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/seo-avanzado`| `SeoAvanzadoPage` | `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/social` | `SocialMediaHubPage`| `User` (unlockedFeatures) | Ninguno | LOW |
| `/dashboard/whatsapp` | `WhatsappAutopilotPage`| `User` (unlockedFeatures)| Ninguno | LOW |
| `/dashboard/notificaciones`| `NotificacionesPage`| `Notification` (CRUD) | Ninguno | MEDIUM/HIGH |

*Nota: `/dashboard/notificaciones` lee e interactúa con datos reales. Se debe migrar a un dropdown.*

## 5. Rutas duplicadas

| Ruta A | Ruta B | Cuál se conserva | Razón |
| :--- | :--- | :--- | :--- |
| `/messages` | `/mensajes` | `/messages` | La ruta `/mensajes` no existe en el proyecto. `/messages` contiene la lógica productiva. |
| `/profile` | `/mi perfil` | `/profile` | `/mi perfil` no existe. `/profile` gestiona el form del perfil. |
| `/vault` | `/bóveda` | `/vault` | `/bóveda` no existe. `/vault` es la que gestiona el componente `ClientAsset`. |
| `/pixel` | `/configuracion/pixel`| `/configuracion/pixel`| `/pixel` es un componente de upsell genérico; `/configuracion/pixel` inyecta dinámicamente el `PixelScript`. |
| `/seo` | `/seo-avanzado`| `/seo` | `/seo` tiene la integración real y productiva con `getSearchConsoleData`; `/seo-avanzado` es un mock de upsell. |
| `/project` | `/mi proyecto` | `/project` | `/mi proyecto` no existe. `/project` agrupa las tareas (modelo `Task`). |
| `/automations` | `/email-automation` y `/email-nurturing` | Ninguna | Todas están marcadas para eliminación (ver mapeo). Son páginas hardcodeadas de upsell que serán consolidadas. |

## 6. Sistema de módulos premium actual
**Estado actual:**
- Los módulos se almacenan de forma precaria como un array de strings en el modelo `User` (`unlockedFeatures String[] @default([])`).
- Los slugs que existen hardcodeados en los chequeos son: `whatsapp-autopilot`, `social-media-hub`, `seo-avanzado`, `motor-resenias`, `pixel-retargeting`, `email-nurturing`, `email-automation`, `ecommerce`, `mini-crm`, `client-portal`, `agenda-inteligente`.
- Existe un modelo `ModulePricing` (`featureKey`, `price`, `type`) para definir cuánto cuestan, pero no hay un modelo relacional de facturación por módulo por organización. El módulo de pagos (facturas) genera cargos pero la asignación de módulos se activa por código.

**Propuesta de migración (Sprint D0.2):**
Crear el modelo `PremiumModule` y una tabla pivote relacional `OrganizationModule` o `OrganizationSubscriptionModule` para rastrear cuándo se compró, estado (ACTIVO, CANCELADO), y relacionarlo con facturación recurrente, dejando de utilizar el `User.unlockedFeatures` que no es apto para entornos multi-tenant robustos ni B2B.

## 7. Onboarding /bienvenida
**Estado:**
- La ruta existe en `src/app/(onboarding)/bienvenida/page.tsx` (utiliza un route group aislado).
- El layout protegido (`src/app/(protected)/dashboard/layout.tsx`) redirige forzosamente hacia `/bienvenida` si el cliente no cumple: `!client.onboardingCompleted || !client.companyName?.trim()`.
- Tras completar los formularios, el action `completeOnboardingAction` en `src/actions/onboarding-actions.ts` marca `onboardingCompleted: true` de forma transaccional junto con las configuraciones (colores, tonos) en el modelo `ClientBrandProfile`.
- **Riesgo de redirect loop:** No existe riesgo ya que `/bienvenida` se encuentra en el grupo de rutas `(onboarding)` y no consume el layout principal de `(protected)/dashboard`.

## 8. Notificaciones
**Estado:**
- Existe el modelo `Notification` en Prisma.
- **Generadores:** Se generan mediante Server Actions (por ejemplo en `upsell.ts` cuando se pide activar un módulo, en `messages.ts`, y vía una rutina de cron job local `/api/cron/os-follow-up`).
- **Emails Transaccionales:** Existe `src/lib/email.ts` configurado con la librería `resend`. Actualmente envía correos para la recuperación de contraseñas, envío de tickets y links mágicos de next-auth, **pero no notifica por email sobre la creación de un nuevo registro en `Notification`**.

## 9. Subscription / Billing
**Estado:**
- Existe el modelo `Subscription` con manejo de estados a través de un Enum (`ACTIVE`, `PAST_DUE`, `CANCELED`).
- **Integración:** No existe actualmente una integración real mediante webhooks con Stripe ni MercadoPago a nivel de base de datos de Suscripciones. Es un status mockeado / manual (MercadoPago y Stripe solo aparecen como componentes de UI `IntegracionesAutomation.tsx` en el frontend público).
- **Bloqueos PAST_DUE:** Si el cliente está en estado `PAST_DUE`, la aplicación **no bloquea el acceso al contenido** (`dashboard/layout.tsx` no impide navegación). Únicamente se inyecta el componente `SubscriptionBanner.tsx` fijado en la UI alertando el estado.

## 10. Datos mock vs reales (Multi-tenancy)
**Estado:**
- No existe un campo flag de mock en BD.
- En páginas como `/seo`, la realidad de los datos depende de la existencia de `client.siteUrl`. Si `siteUrl` existe, consulta la API de Search Console, la cual puede determinar y devolver `isMockData = true` si el dominio no arrojó resultados y provee datos de "fallback". En otras rutas, los datos son componentes estáticos puramente hardcodeados (como `agenda/page.tsx` con constantes quemadas en el archivo).

**Recomendación:** Unificar la estrategia de fallbacks de "vista demo" usando explícitamente constantes provistas por un mock-service central, o vaciar los dashboards por defecto usando `EmptyState.tsx` cuando no hay data generada para el Tenant.

## 11. Componentes huérfanos
Al eliminar las 14 rutas, los siguientes componentes localizados en `src/components/dashboard/` ya no serán consumidos por el sistema (asumiendo que no se inyectan dinámicamente) y pueden ser considerados deuda técnica eliminable:
- `PixelScript.tsx`
- `DemoAnalytics.tsx` (ya huérfano)
- `AutomationsChart.tsx`
- `AutomationsAlertas.tsx`
- `NotificacionesList.tsx` (Solo si no se reubica la página a un modal/dropdown).
- `LockedFeatureView.tsx` (Su uso primario es para las páginas mockeadas de upsell de módulos, requiere auditoría de los pocos lugares donde pueda persistir).

## 12. Dependencias del package.json
* **recharts**: ✅ Instalado (`^3.8.0`).
* **zod**: ✅ Instalado (`^3.25.76`).
* **date-fns o dayjs**: ❌ **NO INSTALADO**. (Requerido para manejar Timezones y UI de calendarios).
* **calendar lib**: ❌ **NO INSTALADO**. (Sin dependencias como `react-day-picker` o `react-calendar` para el flow de turnos).

## 13. Recomendaciones para sprints D0.2 y D0.3
1. **Instalar dependencias clave**: Previo a la Fase 1, es imperativo instalar `date-fns` y un framework de DatePicker para evitar implementaciones manuales del manejo de fechas.
2. **Refactorizar Onboarding de Notificaciones**: Trasladar el listado principal de notificaciones in-app desde la ruta física hacia el header global del Layout mediante un DropdownPopover (consumiendo `NotificationCenter.tsx`).
3. **Migrar sistema de suscripciones**: Diseñar y ejecutar la migración a la estructura de base de datos multi-tenant para `PremiumModule` de manera de descontinuar y depreciar el array hardcodeado `unlockedFeatures` del modelo `User`.
4. **Borrado seguro**: Proceder a la eliminación en masa de las rutas de la sección 4 de este reporte.
