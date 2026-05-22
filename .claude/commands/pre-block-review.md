Vas a actuar como auditor técnico antes de ejecutar el siguiente bloque del roadmap.
Tu trabajo es pensar en frío y cazar lo que se nos está escapando. No ejecutás nada.

El usuario te va a pegar una DEFINICIÓN del próximo bloque + un RESUMEN de sus sprints.
No es un prompt desarrollado — es la intención del bloque. Trabajás sobre eso + el código real del repo.

---

## PASO 1 — Anclar contexto real

Lee:
1. `docs/bitacora-roadmap.md` — último bloque cerrado
2. `docs/chatbot-sprints.md` — estado general
3. Los archivos del código que el próximo bloque va a tocar (inferilos del resumen)

No confíes en la bitácora sola. Verificá el estado real en el código.

---

## PASO 2 — Postmortem corto del bloque anterior

- ¿Qué quedó con deuda técnica o pendiente?
- ¿Qué asumió el agente que no debería haber asumido?
- ¿Qué se ejecutó pero nunca se verificó visualmente?

Máximo 3 items por pregunta. Si no hay nada, decilo.

---

## PASO 3 — PUNTOS CIEGOS (el núcleo de esta revisión)

Pensá en cada categoría aplicada al bloque que viene Y al producto actual.
Para cada una: o señalás un riesgo concreto, o decís explícitamente "cubierto / no aplica".
No inventes problemas para llenar la lista. Pero no dejes pasar uno real.

### Seguridad
- **Prompt injection:** es un chatbot. ¿Un usuario final puede manipular al bot para que filtre datos, ignore instrucciones, o actúe fuera de su rol? ¿Hay sanitización de la entrada del usuario antes de mandarla al LLM?
- **Aislamiento multi-tenant:** ¿puede el contexto, historial o datos de un tenant filtrarse a la respuesta de otro? ¿Todas las queries filtran por tenant?
- **Inputs:** ¿validación con Zod en cada Server Action y endpoint?
- **Auth:** ¿se verifica sesión y rol, o se asume que el middleware alcanza?
- **Secrets:** ¿alguna key o credencial podría terminar en logs, en el cliente, o en el contexto del LLM?

### Costo y abuso (crítico en un chatbot multi-tenant)
- **Runaway de tokens:** cada mensaje = una llamada a Gemini = plata. ¿Hay límite de mensajes por tenant? ¿Por usuario final? ¿Un tenant puede vaciarte la cuenta de Vertex?
- **Rate limiting:** ¿por tenant, por IP, por sesión?
- **Loops:** ¿puede el bot entrar en un loop que dispare llamadas infinitas?

### Resiliencia y fallas
- **Vertex AI caído:** ¿qué ve el usuario final si Gemini no responde o tarda? ¿Hay fallback, timeout, mensaje de error digno?
- **Fallas parciales:** si el bloque falla a mitad, ¿la DB queda en estado inconsistente? ¿Es idempotente?
- **Errores silenciosos:** ¿hay flujos donde algo falla sin que nadie se entere?

### Datos y observabilidad
- **Privacidad:** datos de PyMEs LATAM y sus clientes finales. ¿Se guarda algo sensible que no debería? ¿Hay consideración legal de privacidad?
- **Debugging en prod:** cuando esto falle en producción, ¿vas a tener cómo saber qué pasó? ¿Hay logging útil?
- **Timezones:** Argentina/LATAM. ¿Fechas y horarios manejados consistentemente?
- **Encoding:** español, tildes, ñ, emojis en mensajes. ¿Algo puede romperse?

### Experiencia real del usuario final
- **El dueño de la PyME:** ¿va a encontrar algo roto, confuso o vacío con lo que deja este bloque?
- **Estados vacíos:** ¿qué ve un tenant nuevo sin datos? ¿El widget sin conversaciones?
- **Mobile:** el widget embebible — ¿anda bien en celular?

### Escalabilidad
- **Crecimiento:** ¿esto aguanta 10 tenants? ¿100? ¿Qué se rompe primero?
- **Queries:** ¿hay algo que escanea toda la tabla y va a degradarse con volumen?

---

## PASO 4 — Output para Claude Web

Generá un bloque listo para copiar y pegar en Claude.ai, con este formato exacto:

---
**[PRE-BLOCK REVIEW — Próximo bloque: [nombre]]**

**Estado real del código (verificado, no según bitácora):**
[2-3 oraciones]

**Deuda técnica abierta:**
[lista o "ninguna detectada"]

**Puntos ciegos detectados (ordenados por severidad):**
[lista numerada: categoría → riesgo concreto → por qué importa para develOP]

**Decisiones que necesitan a Franco antes de ejecutar:**
[lista o "ninguna"]

**La pregunta más importante sin responder:**
[una sola pregunta de arquitectura para que Claude Web la resuelva]
---

Sé directo. Sin relleno. Si algo está bien, no lo adornes. Si algo es un riesgo real, no lo suavices.
