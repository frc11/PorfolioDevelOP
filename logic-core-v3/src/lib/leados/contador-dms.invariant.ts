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
import {
  esContactoComercial,
  esMensajeEnviado,
  SOLO_CONTACTOS_COMERCIALES,
  SOLO_MENSAJES_ENVIADOS,
} from './isolation.ts'

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
  // El `Record<ActivityResult, boolean>` de arriba es un guard DEL COMPILADOR, y
  // este script corre con `tsx`, que NO type-chequea (C0 §3.0: con un Record
  // deliberadamente incompleto, `tsx` llegó al runtime con 3 claves de 5 mientras
  // `ts-node` daba TS2739). Mientras el runner sea `tsx`, esa exhaustividad es
  // decoración. Esta aserción la vuelve real: enumera el enum EN RUNTIME.
  assert.deepEqual(
    Object.keys(esperado).sort(),
    Object.keys(ActivityResult).sort(),
    'el mapa de arriba dejó de cubrir todo ActivityResult: apareció (o desapareció) un valor ' +
      'del enum y nadie decidió si cuenta como mensaje mandado. Agregalo al mapa con su ' +
      'decisión — no lo dejes entrar al conteo por defecto.',
  )

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

// Réplica in-memory del `where` de `contarDmsHoy` (canal + mensajes mandados).
// Vive en el scope del módulo porque la usan DOS bloques: la jornada real (2) y
// el censo exhaustivo de canales (4). Una sola réplica — con dos, los dos ejes
// podrían medir cosas distintas y no nos enteraríamos.
type Fila = { channel: ActivityChannel; result: ActivityResult | null }

const contarDms = (filas: Fila[]): number =>
  filas.filter(
    (fila) => fila.channel === ActivityChannel.INSTAGRAM_DM && esMensajeEnviado(fila.result),
  ).length

// ── 2. LAS DOS DIRECCIONES sobre un día de trabajo real ──────────────────────
{

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


// ── 4. CENSO EXHAUSTIVO DE CANALES, en runtime ──────────────────────────────
// El falso verde que midió C0: un valor nuevo en `ActivityChannel` pasaba con la
// suite entera en verde, y en runtime ese canal entraba al conteo comercial
// (`esContactoComercial` → true: gasta un toque de la cadencia +2/+2/+3) sin sumar
// al tope que cuida la cuenta de Instagram (`contarDms` → 0). Las dos definiciones
// que este invariante existe para mantener unidas divergían sin una sola señal.
//
// El eje de canal se probaba con un único caso puntual —`contarDms([whatsapp]) === 0`—
// que un valor nuevo no toca. Y no hay ningún `Record<ActivityChannel, …>` en todo
// `src/`; aunque lo hubiera, sería inerte bajo `tsx`. Por eso el censo es de RUNTIME.
{
  // Escrito A MANO, un renglón por canal, con las DOS decisiones explícitas.
  const CENSO_CANALES: Record<string, { sumaAlTopeDeInstagram: boolean; esComercial: boolean }> = {
    INSTAGRAM_DM: { sumaAlTopeDeInstagram: true, esComercial: true },
    WHATSAPP: { sumaAlTopeDeInstagram: false, esComercial: true },
    EMAIL: { sumaAlTopeDeInstagram: false, esComercial: true },
    LLAMADA: { sumaAlTopeDeInstagram: false, esComercial: true },
    LOOM_VIDEO: { sumaAlTopeDeInstagram: false, esComercial: true },
    OTRO: { sumaAlTopeDeInstagram: false, esComercial: true },
    // Evento interno: ni suma al tope ni gasta cadencia.
    SISTEMA: { sumaAlTopeDeInstagram: false, esComercial: false },
  }

  assert.deepEqual(
    Object.keys(CENSO_CANALES).sort(),
    Object.keys(ActivityChannel).sort(),
    'apareció (o desapareció) un valor de ActivityChannel y el censo de este invariante no lo ' +
      'cubre. No lo agregues sin decidir las dos cosas: si suma al tope de Instagram y si ' +
      'cuenta como contacto comercial (que gasta un toque de la cadencia). Ojo: un canal ' +
      'nuevo entra al conteo comercial POR DEFECTO — `esContactoComercial` es `!== SISTEMA`.',
  )

  for (const [canal, decision] of Object.entries(CENSO_CANALES)) {
    const mandado: Fila = {
      channel: canal as ActivityChannel,
      result: ActivityResult.SIN_RESPUESTA,
    }
    assert.equal(
      contarDms([mandado]),
      decision.sumaAlTopeDeInstagram ? 1 : 0,
      `${canal}: ${decision.sumaAlTopeDeInstagram ? 'suma' : 'NO suma'} al tope de Instagram`,
    )
    assert.equal(
      esContactoComercial(canal as ActivityChannel),
      decision.esComercial,
      `${canal}: ${decision.esComercial ? 'es' : 'NO es'} contacto comercial (gasta cadencia)`,
    )
  }

  // El `where` y el predicado siguen siendo espejo sobre el censo entero.
  assert.deepEqual(
    SOLO_CONTACTOS_COMERCIALES,
    { channel: { not: ActivityChannel.SISTEMA } },
    'el where de contactos comerciales dejó de ser espejo del predicado del censo',
  )
}
console.log(
  '✓ invariante OK: el contador de DMs cuenta MENSAJES MANDADOS (SIN_RESPUESTA: ' +
    'opener y toques), no registros de actividad — postergar/responder/rechazar/agendar ' +
    'no lo mueven, registrar un toque suma 1, y el número coincide con la definición de ' +
    '«toque mandado» de la cadencia. Los DOS enums se censan EN RUNTIME (el runner es ' +
    '`tsx` y no type-chequea): un ActivityResult o un ActivityChannel nuevo se cae acá en ' +
    'vez de entrar al conteo comercial por defecto. Sigue siendo informativo: cero bloqueo.',
)
