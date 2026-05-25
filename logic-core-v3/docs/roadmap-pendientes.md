# Roadmap pendientes

Lista única de deuda explícita conocida. Cada entrada referencia el sprint que la generó y la condición que la haría prioritaria. Cuando una pendiente se ejecuta, se mueve a la bitácora como su propio sprint cerrado.

---

## B5.8 — CRM Integration (n8n)

### Cron diario de retry para `CrmSyncAttempt` FAILED
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** Un cron (Vercel Cron o equivalente) que cada 24h barra `CrmSyncAttempt` con `status='FAILED'` del último día y dispare `syncLeadToCrm({ leadId, trigger: 'cron' })` para reintentar.
- **Por qué se postpuso:** En B5.8 el usuario decidió "in-flight + manual" (3 intentos automáticos al momento + botón "Reintentar" desde UI). Sin volumen real, el cron sería infra sin uso. El dueño puede recuperar manualmente desde el historial.
- **Cuándo prioritarlo:** Cuando haya una org con ≥1 lead FAILED por día durante una semana seguida sin que el dueño aprete "Reintentar" → señal de que el manual no escala. Si Matsu reporta "se me cae mucho n8n y no me doy cuenta", entra esto.
- **Notas:** Requiere `vercel.json` o equivalente (hoy no existe). Considerar Inngest si se necesita queue durable más allá de cron simple.

### DNS rebinding protection en `validateWebhookUrl`
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** El anti-SSRF actual rechaza IPs privadas LITERALES (`https://192.168.1.1/...`). Pero un dominio público (`https://attacker.com/...`) cuyo DNS resuelve a una IP privada pasaría. La protección completa: resolver la IP justo antes del POST en `postToN8n` y rechazar si cae en rango privado.
- **Por qué se postpuso:** Complejidad sustancial para un escenario de amenaza específico (atacante con cuenta comprometida que registra dominio malicioso). El audit log de cambios al webhook URL ya da rastro, y el operador puede detectar el ataque post-facto.
- **Cuándo prioritarlo:** Antes de aceptar clientes que manejen datos sensibles regulados (salud, financiero) — el threat model crece. O si se detecta intento real.
- **Implementación:** En `postToN8n.singlePost`, antes del fetch hacer `dns.lookup(parsed.hostname)` (con timeout corto) y volver a validar la IP resuelta contra la blacklist de `validateWebhookUrl`. Cachear resolución por unos segundos para no spamear DNS.

### Vista admin read-only del CrmIntegration por org
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** En `/admin/clients/[clientId]/chatbot/` o equivalente, una sección read-only que muestre la `CrmIntegration` de esa org (URL — quizás truncada para evitar leak en pantallas de soporte, `enabled`, `secretConfigured: bool`, `lastSyncAt`, `lastErrorAt`, `lastErrorMessage`) + las últimas 20 entradas del historial. Sin permisos de edición.
- **Por qué se postpuso:** El audit log + impersonation ya cubren los casos prácticos de soporte (develOP puede ver lo que el cliente ve haciendo impersonate). Un panel admin dedicado es UX-extra, no funcional-crítico.
- **Cuándo prioritarlo:** Si develOP termina haciendo soporte de configuración n8n recurrente y el flujo impersonation se siente lento.
- **Notas:** No edición desde admin para no introducir confusión "¿quién es el actor?" en el audit log. Si en el futuro develOP necesita editar en nombre del cliente, agregar columna `actorRole: SUPER_ADMIN | CLIENT` en `AdminAuditLog`.

### Nota legal/UX sobre PII a terceros en el form de CRM
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** Línea de advertencia visible en `CrmConfigForm` cuando se activa el sync: "Vas a enviar datos personales de tus clientes (nombre, contacto, mensaje) a este endpoint. Asegurate de cumplir con la legislación de privacidad aplicable en tu jurisdicción (LGPD / ley 25.326 en AR, etc.)."
- **Por qué se postpuso:** Una vez que el dueño decide enviar sus leads a su propio CRM, la responsabilidad legal pasa a su tratamiento. La nota es defensiva (CYA) más que funcional.
- **Cuándo prioritarlo:** Antes del lanzamiento del plan Business comercial real. Es UX prudente, no urgente para infra.
- **Notas:** Coordinar texto con un abogado. No sobre-escalar a "muro de checkbox" — es una nota informativa, no un consentimiento que bloquea el guardar.

### Idempotencia opt-in en payload a n8n (header `Idempotency-Key: leadId`)
- **Sprint origen:** B5.8 (2026-05-24)
- **Qué:** Mandar un header `Idempotency-Key: <leadId>` en cada POST a n8n. Si el cliente arma su flow n8n con dedupe por ese header, retries automáticos + retries manuales no generan duplicados en su CRM downstream (ej. no se manda el email al lead 2 veces).
- **Por qué se postpuso:** Para B5.8 MVP no se considera problema — captureLead ya es idempotente por conversationId, y retries de un mismo leadId son raros. El cliente puede deduplicar en n8n usando `leadId` del payload.
- **Cuándo prioritarlo:** Si un cliente reporta duplicados en su downstream o si Matsu pide explícitamente.

---

## B5.9 — Exportar leads a CSV

### Streaming / paginación cuando se excede EXPORT_LIMIT (10k)
- **Sprint origen:** B5.9 (2026-05-24)
- **Qué:** Hoy el endpoint `/api/dashboard/chatbot/leads/export` carga hasta 10k leads en memoria y devuelve el CSV completo en una sola Response. Si una org excede ese cap, se trunca silenciosamente. Solución: streaming con `ReadableStream` que pagina por cursor + escribe el CSV chunk a chunk al cliente.
- **Por qué se postpuso:** 10k leads cubre PyME por años. Una concesionaria PyME captura ~50-300 leads/mes con un chatbot bien configurado. 10k = 3-15 años de leads. Cuando aparezca el primer cliente que excede, se prioritiza.
- **Cuándo prioritarlo:** Cuando un audit log muestre exports con `count === 10000` (el cap exacto) → señal de truncado.
- **Notas:** Heredería el filtro multi-tenant + audit log + anti-injection sin cambios. El reto es solamente la mecánica del stream + UX de "este export tiene 50k filas, va a tardar".

### Export en `.xlsx` nativo (Excel)
- **Sprint origen:** B5.9 (2026-05-24)
- **Qué:** Generar archivos Excel `.xlsx` con formato (negrita en headers, anchos de columna, freeze de la primera fila, validación en la celda de estado). CSV es lowest common denominator pero `.xlsx` da mejor first-run experience.
- **Por qué se postpuso:** Requiere lib pesada (`xlsx` ~600KB, `exceljs` ~1.5MB). CSV cubre 100% de los casos prácticos. Si un cliente premium lo pide explícitamente, se considera.
- **Cuándo prioritarlo:** Si Matsu o un cliente Business equivalente lo pide. Mientras tanto, CSV con BOM abre limpio en Excel.

### Plantillas de export personalizadas por industria
- **Sprint origen:** B5.9 (2026-05-24)
- **Qué:** Que el dueño elija "exportar para CRM X" y obtener un CSV con las columnas + nombres + formato que ese CRM espera. Hoy es un CSV develOP-standard.
- **Por qué se postpuso:** Sin volumen suficiente para saber qué CRMs realmente importan a los clientes. Mientras tanto, el cliente puede mapear columnas manualmente en su importer.
- **Cuándo prioritarlo:** Cuando haya ≥3 clientes pidiendo el mismo CRM target (HubSpot, Salesforce, Pipedrive, Zoho, etc.).

---

## B9.3 — Disclaimer de IA en outputs LLM

### Badge "Generado por IA" en briefs/insights/summaries
- **Sprint origen:** B9.3 (2026-05-25) — fuera de scope por decisión Franco
- **Qué:** Agregar un disclaimer visible tipo "Generado por IA · puede contener imprecisiones · datos al [fecha]" en outputs que vienen de un LLM real. Hoy `AIExecutiveBrief` se rendea como prosa final sin marca. Cuando se conecten insights AI reales en `ChatbotOverview` (hoy se removió el placeholder), también requieren disclaimer.
- **Por qué se postpuso:** B9.3 era "honestidad de DATOS DEMO" (mock data presentado como real). El disclaimer de IA es un eje distinto: el dato ES real (el LLM realmente lo generó) pero puede ser impreciso. Decisión de producto aparte para no mezclar dos cambios de UX en el mismo sprint.
- **Cuándo prioritarlo:** Antes del lanzamiento comercial del plan que incluya AIExecutiveBrief (Pro+). Si un cliente toma decisiones de negocio leyendo un brief con alucinación del LLM y la marca no avisa que es IA, hay riesgo reputacional y legal.
- **Notas:** Coordinar el tono con el de `PreviewBanner` para que sean familias coherentes (uno marca "no es tu dato aún", otro marca "es tu dato pero generado por IA"). Considerar un componente compartido `DataOriginBadge` con variantes `demo | ai-generated | real-time`.

### Conectar insights AI reales en `ChatbotOverview`
- **Sprint origen:** B9.3 (2026-05-25) — el placeholder se removió en este sprint
- **Qué:** El card "Insights AI placeholder" se sacó del render porque era 100% inventado. El feature existe parcialmente en server (`getPendingInsightsByOrgSlug`, `getInsightsCountForBot` en `src/modules/chatbot/server/insights/`). Falta conectar el dashboard cliente para que rendee los insights reales cuando los haya.
- **Por qué se postpuso:** Implementar el render real requiere decidir UX (¿qué insights se muestran? ¿cómo se actúan? ¿se aprueban?). B9.3 priorizó eliminar el placeholder engañoso sobre construir el feature completo.
- **Cuándo prioritarlo:** Cuando los insights generados tengan valor accionable consistente para el dueño (no antes — un insight genérico es ruido).
- **Notas:** Reactivar el card en `src/modules/chatbot/components/dashboard/ChatbotOverview.tsx` (estaba al final del render, después del bloque de handoffs). Aplicar disclaimer de IA del item anterior si el insight viene de LLM.

### Milestone real del proyecto en `/dashboard/project`
- **Sprint origen:** B9.3 (2026-05-25) — el milestone hardcoded se removió en este sprint
- **Qué:** El bloque "Lanzamiento del Panel de Control · 15 de Abril 2026" era hardcoded — se rendeaba para TODOS los clientes idéntico. Se removió. Falta modelo Prisma para milestones de proyecto (hoy solo existe `OsPaymentMilestone`, que es de pagos OS, no aplica) + UI para que admin defina milestones por proyecto.
- **Por qué se postpuso:** El modelo de datos no existe y la UX del lado admin es no-trivial. Quitar el dato falso era urgente; construir el reemplazo no.
- **Cuándo prioritarlo:** Cuando develOP necesite comunicar fases formales al cliente (no solo tareas sueltas). Para el MVP actual, el `ProjectTaskTabs` ya muestra entregables concretos con fecha.
- **Implementación:** Agregar `ProjectMilestone { id, projectId, title, description, dueDate, completedAt }` al schema + admin UI para CRUD + reactivar `CurrentMilestone` en `/dashboard/project` consumiendo el primer milestone pendiente del proyecto. Component `CurrentMilestone` ya existe (`src/components/dashboard/CurrentMilestone.tsx`), no hay que reescribir.

---

*Convenio: cuando una pendiente se ejecuta, se moverá a `bitacora-roadmap.md` como su propio sprint cerrado y se borrará de acá. No se acumulan entradas resueltas.*
