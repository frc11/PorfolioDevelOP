# Estado del Proyecto — develOP / Logic Core v3

**Última actualización:** 2026-05-20 (cierre R24)
**Versión actual:** v1.0.0 (post Alpha v2)
**Próximo milestone:** Beta — features avanzadas

---

## Resumen 30 segundos

develOP es un chatbot multi-tenant para PyMEs LATAM, integrado a Logic Core v3.
Stack: Next.js 16, TypeScript, Prisma + Neon, NextAuth v5, Vertex AI (Gemini 2.5 Flash), Brevo, Netlify.

**Estado real al cierre de Alpha v2:**
- Producto funcional end-to-end
- Widget embebible en sitios externos (~5KB vanilla JS)
- Onboarding completo sin SQL manual
- Sistema de alertas operativo
- Reportes semanales automáticos vía cron
- 24 specs E2E + 1 integración (pass rate pendiente de verificación en CI)

---

## Lo que funciona en v1.0

### Para develOP (admin)
- ✅ Login y panel admin operativo
- ✅ Crear cliente desde wizard (Org + User + Bot + email automático)
- ✅ Gestión global de chatbots en `/admin/chatbots`
- ✅ Crear bot para org existente o nueva en `/admin/chatbots/new`
- ✅ Bulk operations (pausar, activar, exportar leads)
- ✅ Página unificada de bot con 5 tabs (Overview, Config, KB, Activity, Install)
- ✅ Editor con preview en vivo
- ✅ Audit log de todas las acciones
- ✅ Sistema de alertas con 7 tipos
- ✅ Email/Telegram en alertas críticas
- ✅ Re-envío manual de credenciales desde panel del cliente
- ✅ Trigger manual de detector de issues y reportes semanales
- ✅ Tab "Instalar" con snippet por plataforma (HTML, WordPress, Tiendanube, Shopify, Wix, Squarespace)
- ✅ Configuración de dominios autorizados por bot

### Para el cliente final
- ✅ Login con credenciales temporales
- ✅ Cambio forzado de password al primer login
- ✅ Dashboard con métricas en formato negocio
- ✅ Leads en tiempo real (polling 30s)
- ✅ Notificación email cuando se captura lead
- ✅ Personalización limitada del bot (color, posición, avatar, welcome)
- ✅ Vista de instalación con snippet copy-paste en `/dashboard/chatbot/install`
- ✅ Reporte semanal automático por email (cada lunes a las 9am Argentina)

### Para visitantes (en sitios del cliente)
- ✅ Widget embebible vía `<script>` simple (~5KB)
- ✅ Funciona en HTML, WordPress, Tiendanube, Shopify, Wix, Squarespace
- ✅ Conversación con bot (Vertex AI Gemini 2.5 Flash)
- ✅ Captura de leads automática con tool calling
- ✅ Handoff a WhatsApp con contexto de la conversación
- ✅ Domain whitelist — solo carga en dominios autorizados por el admin

---

## Métricas baseline al cierre

### Chatbot runtime
- P50: pendiente de medición en producción (era 4072ms antes de Alpha v2)
- P95: pendiente de medición en producción (era 12987ms antes de Alpha v2)
- Success rate: pendiente de medición en producción (era 33% antes de Alpha v2)

### Admin performance (warm)
- `/admin`: <1.5s
- `/admin/clients`: <1.5s
- `/admin/chatbots`: <1.5s
- `/admin/clients/[id]`: <2s

### Dashboard cliente (warm)
- `/dashboard`: <1.5s
- `/dashboard/chatbot`: <1.5s

### Database
- Latencia Neon (sa-east-1): ~93ms warm
- Cold start: ~1s después de inactividad prolongada

---

## Test coverage

- E2E (Playwright): 24 specs (01–22 originales, 30 onboarding E2E, 40 lead capture)
- Integración: 1 spec (alerts-detector)
- Pass rate: pendiente de verificación en entorno con env vars completos
- Performance budgets: enforced en spec 21
- Security tests: auth + role checks + CORS (spec 19)
- Mobile responsive: spec 20

---

## Cosas que NO están en v1.0 (intencional)

### Postpone a Beta
- ❌ Self-service signup del cliente
- ❌ "Olvidé mi contraseña" via email
- ❌ 2FA
- ❌ Cards ricos (product, service, gallery, calendar)
- ❌ KB híbrida con review queue (cliente edita, develOP revisa antes de aplicar)
- ❌ Lead scoring 0-100 con badges
- ❌ Memoria persistente del visitor con cookies
- ❌ Sugerencias proactivas al dueño del negocio
- ❌ Agenda integrada Cal.com
- ❌ WhatsApp Business API (hoy es link, no API)
- ❌ AIExecutiveBrief con LLM real (sigue MOCK)
- ❌ Sistema modular por planes (Starter/Pro/Enterprise)

### Limitaciones conocidas
- ⚠ Cold start de Neon: ~1s en primer hit después de inactividad
- ⚠ Rate limiter in-memory (se resetea en cold start del server)
- ⚠ Reportes semanales por bot (no consolidados si un cliente tiene varios bots)
- ⚠ Bulk operations sin schedule — se ejecutan en el momento, sin cola
- ⚠ Sin tests de carga concurrente
- ⚠ Admin básico en mobile (dashboard cliente sí es completo)

---

## Decisiones tomadas durante Alpha v2

1. Nueva ruta canónica `/admin/chatbots` — la vieja `/admin/clients/[id]/chatbot/*` queda deprecada
2. Widget como iframe + script vanilla JS (~5KB) — no dependencia de React en sitio del cliente
3. CORS dinámico + domain whitelist por bot en `BotConfig.allowedDomains`
4. Validación de origin server-side en todos los endpoints del chatbot
5. Email de activación automático al activar bot (`bot-activated.ts`)
6. Reportes semanales sin opt-in — los clientes ya tienen contrato
7. `/dashboard/chatbot` refactorizado a rutas anidadas `/(protected)/dashboard/chatbot/*`

---

## Decisiones pendientes (para Beta)

- ⚠ Sistema modular por plan (Starter/Pro/Enterprise) — definir con socio
- ⚠ Plan de Neon (Free vs Launch) — depende de backups
- ⚠ Integración Tiendanube vía API — pendiente decisión
- ⚠ Cuándo activar feature toggles por suscripción
- ⚠ Política de retención de conversaciones/leads

---

## Cómo arrancar para nuevo dev / IA

```bash
git clone [repo]
cd logic-core-v3
npm install
cp .env.example .env  # completar valores reales
npm run check-env
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Credenciales seed:
- Admin: admin@develop.com / Admin1234!
- Cliente: cliente@sanmiguel.com / Cliente1234!

Recursos:
- `docs/operations/` — workflows operativos (6 workflows)
- `docs/testing-strategy.md` — cómo correr tests
- `docs/design-system.md` — tokens y componentes UI
- `/admin/_design` — playground visual del design system

---

## Equipo

- **Franco** — Co-fundador, lead técnico y comercial
- **[Socio]** — Co-fundador, técnico

---

*Este archivo es la fuente única de verdad. Actualizar al cierre de cada milestone.*
