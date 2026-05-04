# develOP — Estado de Funcionalidad Real

**Última actualización:** 2026-05-02
**Mantenido por:** Franco

> Este documento es el SOURCE OF TRUTH de qué está realmente
> funcional vs qué es UI sin lógica vs qué está pendiente.
> Antes de prometer algo en landing o ventas, consultar acá.

---

## ✅ Funcional end-to-end con datos reales

### Para los clientes con página activa
- Sitio web responsive
- Hosting + dominio configurado
- SSL activo
- Formulario de contacto funcional
- Google Analytics conectado y midiendo (donde se haya activado)
- Search Console conectado y midiendo (donde se haya activado)

### Portal del cliente
- Login (NextAuth + Google OAuth)
- Mi Proyecto (tareas, hitos, aprobaciones)
- Mensajes con SLA visible
- Bóveda Digital (credenciales encriptadas)
- Notificaciones in-app
- Dashboard home con Health Score (estado calibrando si no hay data)

### Admin
- CRUD de organizaciones
- Toggles de módulos premium por org
- Mensajería bidireccional
- Tickets de soporte

---

## 🟡 Funcional con mocks/datos de prueba

- Resultados → Tráfico (estructura lista, datos demo, falta GA4 real por org)
- Resultados → SEO (estructura lista, datos demo, falta Search Console real por org)
- Health Score (estructura lista, calibrando si no hay APIs activas)
- AI Executive Brief (genera con Claude Haiku 4.5, requiere ANTHROPIC_API_KEY)

---

## 🔴 UI lista pero SIN lógica funcional

### Módulos premium ACTIVE en catálogo
- Motor de Reseñas → UI presente, lectura GBP básica implementada, falta gestión/respuestas reales
- Email Marketing Pro → UI presente, falta integración Brevo real
- Agenda Inteligente → UI presente, falta deploy Cal.com self-hosted o API key
- Tienda Conectada → UI presente, falta integración Tiendanube real

### Módulos premium COMING_SOON
- WhatsApp Autopilot → no construido
- Facturación AFIP → no construido
- Mini-CRM → no construido
- Cobranzas Automatizadas → no construido
- Reactivación Clientes → no construido

---

## 📊 APIs externas conectadas

| API | Estado | Notas |
|-----|--------|-------|
| Google Analytics 4 | ⚪ Implementada con fallback mock | Falta activar por cliente |
| Google Search Console | ⚪ Implementada con fallback mock | Falta activar por cliente |
| Anthropic (Claude) | ✅ Funcional | Para AIBrief |
| Resend (email) | ✅ Funcional | Notificaciones transaccionales |
| n8n REST API | ⚪ Implementada con fallback mock | Falta server n8n productivo |
| PageSpeed Insights | ⚪ Implementada con cache 6h | Requiere `GOOGLE_PAGESPEED_API_KEY` y `Organization.siteUrl` |
| Google Business Profile | ⚪ Lectura básica implementada | OAuth SUPER_ADMIN + setup manual de `gbpAccountId`/`gbpLocationId` |
| UptimeRobot | ❌ No integrada | Sprint 2 del roadmap |
| Brevo | ❌ No integrada | Sprint 4 del roadmap |
| Tiendanube | ❌ No integrada | Sprint 5 del roadmap |
| Cal.com | ❌ No deployada | Sprint 6 del roadmap |
| WhatsApp Business API | ❌ No integrada | Próxima fase |
| AFIP Web Services | ❌ No integrada | Próxima fase |
| MercadoPago | ❌ No integrada | Próxima fase (5+ clientes) |

---

### Setup manual Google Business Profile

- OAuth inicial: `/api/auth/google-business/start?orgId=ORG_ID` logueado como `SUPER_ADMIN`.
- Después del OAuth, setear `gbpAccountId` y `gbpLocationId` manualmente en Prisma Studio.
- Para encontrar IDs: llamar a `https://mybusinessaccountmanagement.googleapis.com/v1/accounts` con el access token activo y luego listar locations del account correspondiente.
- `gbpLocationId` debe guardarse como resource path compatible con reviews v4: `accounts/{accountId}/locations/{locationId}`.

---

## 🎯 Lo que se puede vender HOY (con honestidad)

✅ "Sitio web a medida + portal de cliente premium incluido"
   - Página web profesional ($800+ USD)
   - Portal de cliente con: Mi Proyecto, Mensajes, Bóveda, Resumen IA
   - Conexión a Google Analytics + Search Console (la hacemos nosotros)
   - Soporte por mensajes con SLA <4h en horario laboral

⚠️ Se puede ofrecer pero clarificando "Próximamente activable":
   - Motor de Reseñas (precio + ETA "antes de fin de mes")
   - Email Marketing Pro (idem)
   - Agenda Inteligente (idem)
   - Tienda Conectada (idem)

❌ NO prometer todavía como activables:
   - WhatsApp Autopilot
   - Facturación AFIP
   - Mini-CRM
   - Cobranzas
   - Reactivación de Clientes

---

## 🔧 Decisiones técnicas vigentes

- TypeScript estricto (cero `any`)
- Server Components por defecto
- Glassmorphism como lenguaje visual base
- Spanish rioplatense en todo el copy
- Mobile-first
- Multi-tenancy via `Organization` en Prisma
