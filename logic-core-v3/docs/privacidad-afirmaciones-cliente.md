# Privacidad de los datos de visitantes — qué se puede afirmar a un cliente

**Para qué es este documento.** Insumo para redactar el contrato con clientes del
chatbot sin prometer nada que el sistema no cumpla. Está escrito para leerse sin
contexto técnico previo. Cada afirmación dice en qué se respalda; cada negación
dice por qué no se puede afirmar y qué haría falta para poder hacerlo.

**Vigencia.** Las afirmaciones valen cuando los 3 commits del BLOQUE PRIVACIDAD
(agosto 2026) estén **deployados en producción** y se haya pasado el checklist
del final. Origen técnico: entrada "BLOQUE PRIVACIDAD" en `docs/bitacora-roadmap.md`.

**Contexto mínimo.** El chatbot corre en la infraestructura de develOP (Netlify +
base de datos Neon). Lo que un visitante escribe, y los datos que deja (nombre,
teléfono, email), se guardan en la base de datos, separados por organización
cliente, y el cliente los ve en su panel. Los "logs de plataforma" son los
registros técnicos de Netlify que solo ve develOP — ahí es donde este bloque
garantiza que NO haya datos personales.

---

## Lo que SÍ se puede afirmar

1. **"Los datos personales de tus visitantes no aparecen en los registros
   técnicos de la plataforma."** Nombre, contacto y resúmenes de conversación
   quedan solo en la base de datos de tu organización (y en tu panel), nunca en
   los logs de Netlify. *Respaldo:* el sistema de logging usa una lista blanca —
   solo campos técnicos aprobados salen al log; cualquier campo nuevo queda
   excluido por defecto, y un test automático (`test:pii`) falla si algún dato
   personal intenta salir.

2. **"Los mensajes de error del sistema no exponen datos personales."** La única
   clase de error de base de datos que repite los datos de la operación fallida
   se redacta en todas sus salidas (logs, monitoreo y respuestas al navegador).
   *Respaldo:* commit 3 del bloque; test automático incluido.

3. **"La dirección IP de tus visitantes no se guarda."** Se guarda solo un
   identificador irreversible derivado de la IP con un secreto criptográfico, y
   sin ese secreto configurado el sistema se niega a operar en producción (falla
   de forma visible en vez de degradar la protección). *Respaldo:* hash SHA-256
   con salt obligatorio; commit 2 del bloque. *Matiz:* ver punto 5 de la lista
   de negaciones (identificadores históricos).

4. **"Tus datos están aislados de los de otros clientes."** Toda lectura y
   escritura de datos del chatbot pasa por una capa que exige la organización
   dueña; el barrido del bloque no encontró ningún camino por el que una
   organización vea datos de otra. *Respaldo:* helper de aislamiento
   (`src/lib/isolation`) + barrido Fase 0.

5. **"El registro de actividad del bot se elimina automáticamente a los 30
   días."** *Respaldo:* tarea programada diaria (`cleanup-old-events`).
   *Matiz importante:* esto aplica al registro de eventos técnicos, no a las
   conversaciones ni a los leads — ver punto 2 de las negaciones.

---

## Lo que NO se puede afirmar (y por qué)

1. **NO afirmar: "ningún tercero recibe datos de tus visitantes."** Hoy el aviso
   interno de leads llega al chat de Telegram del equipo develOP con nombre y
   contacto del visitante (**decisión de producto pendiente**: o se mantiene y se
   declara en el contrato como parte del servicio, o se cambia a un aviso con
   identificador solamente). Además, los emails de notificación salen por
   Brevo/Resend (procesadores de datos) y el hosting es Netlify (procesa cada
   request). Si en el futuro se activa el monitoreo de errores (Sentry — hoy
   inactivo), sería otro procesador. **Para el contrato:** listar los
   procesadores, no negar su existencia.

2. **NO afirmar: "todo se borra a los 30 días."** Las conversaciones, los
   mensajes y los leads NO tienen retención automática: son el producto que el
   cliente consume en su panel. Los 30 días aplican solo al registro de eventos
   técnicos. **Para poder afirmarlo:** habría que definir e implementar una
   política de retención de conversaciones/leads (no existe hoy).

3. **NO afirmar: "nadie de develOP puede leer las conversaciones."** El panel de
   administración de develOP las muestra — es el modelo de soporte del producto.
   **Se puede afirmar en cambio:** "solo personal autorizado de develOP accede,
   con fines de soporte y operación del servicio."

4. **NO afirmar retroactividad: "los datos nunca estuvieron en los logs."**
   Antes de este bloque hubo derrames reales (nombres y contactos de visitantes
   en los logs de Netlify). Eso ya emitido expira según la retención de logs del
   plan de Netlify, no según nuestro código. **Para el contrato:** las garantías
   rigen desde el deploy del bloque en adelante.

5. **NO afirmar todavía la irreversibilidad de los identificadores de IP
   históricos.** Los generados antes de que el secreto fuera obligatorio usaron
   un valor de respaldo público (reversibles por fuerza bruta). Hay una limpieza
   de esos datos históricos pendiente; hasta hacerla, la garantía del punto 3 de
   las afirmaciones vale para lo nuevo, no para lo histórico.

---

## Checklist antes de usar esto en un contrato

- [ ] Los 3 commits del BLOQUE PRIVACIDAD deployados en producción.
- [ ] Prueba post-deploy hecha: mandar un mensaje real al bot de producción que
      dispare un lead o un handoff, y verificar en Netlify Logs que la línea
      sale con `redactedKeys` y sin nombre/contacto/resumen.
- [x] `CHATBOT_IP_HASH_SALT` creada en el entorno de Netlify (hecho, 2026-08-11).
- [ ] Retención de logs del plan de Netlify verificada (afecta el punto 4 de
      las negaciones).
- [ ] Decisión tomada sobre el aviso de Telegram (punto 1 de las negaciones) y
      reflejada en el texto del contrato.
- [ ] (Opcional, para cerrar el punto 5) Limpieza de los identificadores de IP
      históricos generados con el salt público.

*Última actualización: 2026-08-11 — cierre del BLOQUE PRIVACIDAD.*
