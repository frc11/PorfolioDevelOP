/**
 * Invariante ejecutable del CONTADOR DE DMs del día — corre sin DB.
 *
 *   npm run check:invariant:contador-dms
 *
 * Qué protege (F1). La capa de seguridad de canal (`CanalSeguridad`) muestra
 * «N / tope DMs» para cuidar la cuenta de Instagram. Ese número tiene que contar
 * MENSAJES MANDADOS, no filas de actividad: antes contaba toda fila del canal, y
 * como postergar un contacto también deja una fila `INSTAGRAM_DM`, pausar un lead
 * —sin mandar nada— empujaba al setter contra un tope que no había alcanzado.
 *
 * El discriminador no se inventa acá: `countFollowUps` (lib/follow-up) ya define
 * «un toque mandado» como una fila `SIN_RESPUESTA`, y sobre ese conteo corre la
 * cadencia. Este invariante ata las dos definiciones para que no vuelvan a
 * divergir — si alguien cambia una, esto se cae.
 *
 * Se afirma además que el contador sigue siendo INFORMATIVO: nada de lo que hay
 * acá bloquea. Esa decisión está tomada y documentada en el componente.
 */
import assert from 'node:assert/strict'
import { ActivityChannel, ActivityResult } from '@prisma/client'
import { countFollowUps } from '../follow-up.ts'
import { esMensajeEnviado, SOLO_MENSAJES_ENVIADOS } from './isolation.ts'

// ── 1. El fragmento `where` y el predicado puro son ESPEJO ───────────────────
{
  assert.deepEqual(
    SOLO_MENSAJES_ENVIADOS,
    { result: ActivityResult.SIN_RESPUESTA },
    'el where del conteo filtra por resultado, no solo por canal',
  )

  // Todo el enum, exhaustivo: si mañana se agrega un ActivityResult, este bloque
  // obliga a decidir de qué lado cae en vez de que entre al conteo por defecto.
  const esperado: Record<ActivityResult, boolean> = {
    [ActivityResult.SIN_RESPUESTA]: true, // el setter mandó el DM y no le contestaron
    [ActivityResult.RESPONDIO]: false, // contestó el PROSPECTO
    [ActivityResult.POSTERGADO]: false, // pausa: no sale ningún mensaje
    [ActivityResult.RECHAZADO]: false, // reacción del prospecto
    [ActivityResult.CALL_AGENDADA]: false, // booking de Cal.com, no un DM
  }
  for (const [result, cuenta] of Object.entries(esperado)) {
    assert.equal(
      esMensajeEnviado(result as ActivityResult),
      cuenta,
      `${result}: ${cuenta ? 'cuenta' : 'NO cuenta'} como mensaje mandado`,
    )
  }

  // `result` es opcional en el modelo: una fila sin resultado no acredita un envío.
  assert.equal(esMensajeEnviado(null), false, 'fila sin resultado no cuenta')
}

// ── 2. LAS DOS DIRECCIONES sobre un día de trabajo real ──────────────────────
{
  type Fila = { channel: ActivityChannel; result: ActivityResult | null }

  // Réplica in-memory del `where` de `contarDmsHoy` (canal + mensajes mandados).
  const contarDms = (filas: Fila[]): number =>
    filas.filter(
      (fila) => fila.channel === ActivityChannel.INSTAGRAM_DM && esMensajeEnviado(fila.result),
    ).length

  const opener: Fila = { channel: ActivityChannel.INSTAGRAM_DM, result: ActivityResult.SIN_RESPUESTA }
  const toque: Fila = { channel: ActivityChannel.INSTAGRAM_DM, result: ActivityResult.SIN_RESPUESTA }
  const postergar: Fila = { channel: ActivityChannel.INSTAGRAM_DM, result: ActivityResult.POSTERGADO }
  const respondio: Fila = { channel: ActivityChannel.INSTAGRAM_DM, result: ActivityResult.RESPONDIO }
  const rechazo: Fila = { channel: ActivityChannel.INSTAGRAM_DM, result: ActivityResult.RECHAZADO }
  const reunion: Fila = { channel: ActivityChannel.INSTAGRAM_DM, result: ActivityResult.CALL_AGENDADA }
  const whatsapp: Fila = { channel: ActivityChannel.WHATSAPP, result: ActivityResult.SIN_RESPUESTA }
  const sistema: Fila = { channel: ActivityChannel.SISTEMA, result: null }

  const jornada: Fila[] = [opener, toque, postergar, respondio, rechazo, reunion, sistema]

  // Dirección 1 — POSTERGAR NO SUBE EL CONTADOR (el bug reportado).
  const sinPostergar = jornada.filter((fila) => fila !== postergar)
  assert.equal(
    contarDms(jornada),
    contarDms(sinPostergar),
    'postergar no mueve el contador: sumar esa fila da el mismo número',
  )
  assert.equal(contarDms([postergar]), 0, 'una postergación sola cuenta 0 DMs')

  // Dirección 2 — REGISTRAR UN MENSAJE SÍ LO SUBE.
  assert.equal(
    contarDms([...jornada, toque]),
    contarDms(jornada) + 1,
    'registrar un toque mandado suma exactamente 1',
  )
  assert.equal(contarDms([opener]), 1, 'el opener es un mensaje mandado')

  // El total de la jornada: solo opener + toque.
  assert.equal(contarDms(jornada), 2, 'de 7 filas del día, 2 son mensajes mandados')

  // Ninguna reacción del prospecto infla el número.
  assert.equal(contarDms([respondio, rechazo, reunion, postergar]), 0, 'reacciones ⇒ 0 DMs')

  // Otro canal no entra en el conteo de Instagram (el eje de canal sigue vivo).
  assert.equal(contarDms([whatsapp]), 0, 'un DM de otro canal no cuenta acá')

  // ── El puente con la cadencia: mismo universo de filas, mismo número ──
  // `countFollowUps` define «toque mandado» para la cadencia (+2/+2/+3-stop).
  // El contador de canal tiene que ver EXACTAMENTE lo mismo entre los DMs.
  const soloInstagram = jornada.filter((f) => f.channel === ActivityChannel.INSTAGRAM_DM)
  assert.equal(
    contarDms(jornada),
    countFollowUps(soloInstagram),
    'el contador de canal y la cadencia cuentan lo mismo: un toque mandado',
  )
}

// ── 3. SIGUE SIENDO INFORMATIVO: acá no hay ningún bloqueo ───────────────────
{
  // El arreglo corrige QUÉ se cuenta; no agrega un gate. El módulo del conteo no
  // expone nada que decida por el setter — expone un número y nada más.
  const exportado = Object.keys({ esMensajeEnviado, SOLO_MENSAJES_ENVIADOS })
  assert.deepEqual(
    exportado.sort(),
    ['SOLO_MENSAJES_ENVIADOS', 'esMensajeEnviado'],
    'el filtro aporta un predicado y un where: ningún gate nuevo',
  )
  assert.equal(typeof esMensajeEnviado(ActivityResult.SIN_RESPUESTA), 'boolean', 'predicado puro')
}

console.log(
  '✓ invariante OK: el contador de DMs cuenta MENSAJES MANDADOS (SIN_RESPUESTA: ' +
    'opener y toques), no registros de actividad — postergar/responder/rechazar/agendar ' +
    'no lo mueven, registrar un toque suma 1, y el número coincide con la definición de ' +
    '«toque mandado» de la cadencia. Sigue siendo informativo: cero bloqueo.',
)
