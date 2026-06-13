# B7-PROBE — API de Cal.com: slots libres + creación de bookings

Fecha: 2026-06-12 · Investigación previa al diseño de B7 (agenda del setter). Solo lectura; sin código de feature.

---

## Respuesta categórica: **SÍ a ambas** (con dos salvedades de configuración, no de capacidad)

La API v2 de Cal.com permite **(a) listar slots libres** y **(b) crear un booking** programáticamente desde el backend. Más aún: **ninguna de las dos operaciones requiere API key** — son los mismos endpoints públicos que usa la página de reservas de Cal.com. Verificado con una llamada real de slots (ver punto 4).

Las salvedades no son de API sino de estado del repo/cuenta:

1. **No existe credencial ni cuenta configurada hoy.** `calComApiKey`, `calComUsername` y `calComEmbedUrl` están `NULL` en **todas** las organizaciones de la DB (verificado contra Neon), y no hay ninguna variable de entorno de Cal.com. La premisa "hay una API key utilizable" del enunciado ya no es cierta.
2. **La API v1 fue apagada el 8 de abril de 2026.** `getCalSummary` ([cal-com.ts](../src/lib/integrations/cal-com.ts)) llama `https://api.cal.com/v1/bookings?apiKey=...` — ese endpoint ya no existe; hoy la función devuelve `null` silenciosamente (el `res.ok` falla y loguea). Hallazgo fuera de alcance del probe, pero condiciona B7: todo se construye sobre **v2**.

Lo que hace falta para que B7 funcione (todo configuración, nada bloqueante):

- Cuenta Cal.com de Franco (plan free alcanza; no hay gating de plan documentado para estos endpoints) con su Google Calendar conectado.
- Un **event type** creado (ej. "Reunión develOP", 30 min) — los slots se piden siempre contra un event type.
- Guardar en la org: `calComUsername` + el slug del event type (o su `eventTypeId`). La API key (`cal_live_...`, Settings → Security) solo es necesaria para *listar/gestionar* bookings (y para migrar `getCalSummary` a v2), no para slots ni para crear la reserva.

---

## 1. Listar disponibilidad / slots libres

**`GET https://api.cal.com/v2/slots`** — header `cal-api-version: 2024-09-04`. **Auth: no requerida** para event types públicos (Bearer opcional).

Parámetros (query):

| Param | Oblig. | Ejemplo |
|---|---|---|
| `start` / `end` | sí | `2026-06-15` / `2026-06-17` (ISO 8601, UTC) |
| `eventTypeId` **o** `eventTypeSlug`+`username` | sí (una de las dos formas) | `eventTypeSlug=meet&username=peer` |
| `timeZone` | no (default UTC) | `America/Argentina/Buenos_Aires` |
| `duration` | no | minutos, si el event type ofrece varias |
| `format=range` | no | devuelve `{start, end}` en vez de solo `start` |

Response: `{ status: "success", data: { "YYYY-MM-DD": [{ start: "...-03:00" }, ...] } }` — agrupado por fecha, **ya convertido al timezone pedido**. Perfecto para "ofrecé 3 horarios": se toman 3 del array.

Depende de tener un event type configurado: **sí**, siempre se consulta contra uno. Bonus: `GET /v2/event-types?username=X` (header `cal-api-version: 2024-06-14`) también es público y permite descubrir los event types y sus slugs.

## 2. Crear un booking

**`POST https://api.cal.com/v2/bookings`** — header `cal-api-version: 2026-02-25`. **Auth: opcional** (mismo flujo que la página pública de reservas).

Payload mínimo:

```json
{
  "eventTypeId": 123,            // o eventTypeSlug + username
  "start": "2026-06-15T14:00:00Z",   // SIEMPRE en UTC, sin offset
  "attendee": {
    "name": "Prospecto X",
    "email": "prospecto@mail.com",
    "timeZone": "America/Argentina/Buenos_Aires",
    "language": "es"
  },
  "metadata": { "leadId": "..." }    // hasta 50 keys — útil para linkear con LeadOS
}
```

Opcionales relevantes: `attendee.phoneNumber`, `guests[]`, `lengthInMinutes`, `bookingFieldsResponses`. Response `201` con `{ id, uid, status: "accepted", start, end, hosts, attendees, ... }` — el `uid` es la referencia para cancelar/reagendar.

- **Notificaciones**: Cal.com dispara sus mails nativos de confirmación (invitado y host) y genera link de Cal Video si no se especifica `location` — no hay que manejar nada aparte.
- **Calendario de Franco**: Cal.com escribe el evento en el calendario conectado (Google Calendar) automáticamente; es exactamente su rol de capa intermedia. Requiere que Franco conecte su Google Calendar en la cuenta de Cal.com, una sola vez.
- **Plan**: sin requisito de plan pago documentado para este endpoint. Lo que sí está restringido al plan Platform (y deprecado para nuevos signups desde dic 2025) es el modo "managed users / OAuth client" — **no lo necesitamos**.

Cancelación (reversibilidad): **`POST /v2/bookings/{uid}/cancel`** — header `cal-api-version: 2026-02-25`, body opcional `{ "cancellationReason": "..." }`, tampoco exige auth para bookings normales.

## 3. Autenticación y límites

- **La `calComApiKey` actual no existe** (NULL en DB). Y aunque existiera una key v1, v1 está apagada. Para B7: slots + crear booking + cancelar **funcionan sin key**. La key v2 (`cal_live_...`, se pasa como `Authorization: Bearer ...`, ya no como query param) hace falta solo para `GET /v2/bookings` (listar la agenda, lo que hacía `getCalSummary`).
- **Rate limits**: 120 req/min por API key (ampliable a 200/min; enterprise negociable). Para llamadas sin key no está documentado un límite específico; el volumen de B7 (consultas puntuales del setter) está órdenes de magnitud por debajo.
- **v1 vs v2**: v1 fue apagada el 8/abr/2026 — no es opción. Diferencias que importan: auth por header Bearer (no `?apiKey=`), header `cal-api-version` obligatorio por endpoint, y `GET /v2/bookings` con filtros y paginación (mejor que el v1 que usaba `getCalSummary`).

## 4. Test real

**Slots — EJECUTADO ✅ (lectura, sin credencial).** `GET /v2/slots?username=peer&eventTypeSlug=meet&start=2026-06-15&end=2026-06-17&timeZone=America/Argentina/Buenos_Aires&duration=15` contra una cuenta pública real de Cal.com. Response (recortado):

```json
{
  "status": "success",
  "data": {
    "2026-06-15": [
      { "start": "2026-06-15T07:15:00.000-03:00" },
      { "start": "2026-06-15T07:20:00.000-03:00" },
      { "start": "2026-06-15T07:25:00.000-03:00" },
      ...
    ]
  }
}
```

Slots reales, agrupados por fecha y ya en huso de Buenos Aires. También verificado en vivo: `GET /v2/event-types?username=peer` (público, devuelve id/slug/duración de cada event type) y que un slug inexistente devuelve `404 "Event Type not found"` limpio.

**Creación de booking — NO EJECUTADO ⛔ (decisión deliberada).** No hay cuenta Cal.com propia ni de prueba (DB sin username/key); el único target real disponible era la agenda de un tercero, y el criterio del probe es no ensuciar agendas reales. El payload exacto que se usaría está en el punto 2, y la cancelación (`POST /v2/bookings/{uid}/cancel`) está documentada para hacerlo reversible. Queda como primer paso de B7: con la cuenta de Franco creada, repetir el par crear→cancelar como smoke test.

---

## Implicancias para el diseño de B7

1. **B7 se construye sobre Cal.com nativo (v2).** El fallback de "ventanas declaradas" no es necesario.
2. Setup previo (manual, una vez): cuenta Cal.com de Franco + Google Calendar conectado + event type + cargar `calComUsername`/slug (y opcionalmente una API key v2) en la org develOP.
3. El flujo del setter queda: `GET /v2/slots` → mostrar 3 → `POST /v2/bookings` con datos del prospecto (con `metadata.leadId` para trazabilidad) → guardar `uid` para cancelar/reagendar.
4. Deuda detectada fuera de alcance: migrar `getCalSummary` de v1 (muerta) a `GET /v2/bookings` con Bearer — hoy el módulo agenda-inteligente recibe `null`.
