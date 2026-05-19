# 04 — Responder a una alerta del sistema

**Tiempo estimado:** 5-30 minutos (depende del tipo)
**Responsable:** Cualquiera (Franco primary)

## Cuándo aplicar

- Email de alerta llegó a la cuenta de develOP
- Notification badge rojo en `/admin/alerts`

## Tipos de alerta y respuesta

### 🔴 LLM_PROVIDER_ERROR (Crítica)

**Síntoma:** Bot devuelve errores 500 a usuarios.

**Diagnóstico (5 min):**
1. Ir a `/admin/chatbot/health` → ver status de Vertex AI
2. Ir a `https://status.cloud.google.com` → ver si hay outage
3. Ir a `/admin/clients/[slug]/chatbot/activity` → ver patrón de errores

**Si es outage de Vertex:**
- No podés hacer nada técnicamente, esperar
- Comunicar a clientes afectados: "estamos viendo un issue de nuestro proveedor de IA, lo resolvemos en cuanto vuelva. Tu bot vuelve solo."

**Si es error específico del cliente:**
- Revisar KB — puede tener prompt corrupto
- Revisar BotConfig — puede tener temperature out of range

**Acción final:** Marcar como "Resuelto" cuando pare la lluvia de errores.

---

### 🟠 QUOTA_EXHAUSTED (Alta)

**Síntoma:** Cliente llegó al límite mensual.

**Acción (5 min):**
1. Ir a `/admin/clients/[clientId]/chatbot/overview`
2. Verificar conversaciones del mes
3. **Si fue un mes legítimamente alto:**
   - Aumentar quota temporal en BotConfig
   - Recomendar al cliente upgrade al próximo plan
4. **Si parece tráfico anómalo (bot, scraper):**
   - Revisar IP patterns en activity log
   - Considerar agregar rate limit

**Resolver** cuando se ajusta la quota.

---

### 🟡 CLIENT_NO_ACTIVITY (Info)

**Síntoma:** Bot activo pero sin conversaciones 7 días.

**Acción (10 min):**
1. Verificar que el chatbot esté efectivamente embebido en el sitio del cliente
2. Si no está embebido:
   - Mandar email/WhatsApp al cliente recordándole el script de embed
3. Si está embebido pero sin visitas:
   - El sitio del cliente no recibe tráfico
   - Considerar campañas o cambios en sitio
   - Reportar al cliente con análisis honesto

**Resolver** cuando se confirma que el cliente sabe del estado.

---

### 🔵 ACTIVITY_ERRORS_SPIKE (Info)

**Síntoma:** Más errores que de costumbre en activity log.

**Acción (15 min):**
1. Ir a `/admin/clients/[slug]/chatbot/activity`
2. Filtrar por severity=error
3. Identificar patrón:
   - ¿Mismo tipo de input causa error?
   - ¿Mismo session_id repetido?
   - ¿Misma hora del día?
4. Si es bug reproducible → reportar y fixear
5. Si es input edge-case → agregar handling

**Resolver** cuando hay plan de mitigación claro.

---

## Cuándo escalar

Si la alerta es CRÍTICA y:
- No sabés qué hacer en 15 min → mandar mensaje al socio
- El cliente está activamente afectado → priorizar respuesta al cliente sobre el fix técnico
- Es horario fuera de oficina → marcar como ACK pero arreglar al día siguiente (a menos que sea CRÍTICA real)

## Pattern de respuesta al cliente afectado

```
Hola [nombre],

Vi que hubo un problema con tu chatbot a las [hora]. Estoy resolviendo ahora.

Te paso ETA: [tiempo realista, ser conservador]

Si querés ver actividad en tiempo real, entrá a tu dashboard.

Franco
```

## Common pitfalls

❌ **Ignorar alertas info**: pueden ser señal de problemas mayores
❌ **Resolver sin investigar la causa raíz**: vuelve a pasar
❌ **No comunicar a cliente afectado**: pierde confianza
❌ **Marcar como resuelto sin estar resuelto**: rompe el sistema de tracking
