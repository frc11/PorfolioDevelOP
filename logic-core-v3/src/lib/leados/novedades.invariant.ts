/**
 * Chequeo de invariante de las novedades dirigidas al setter — corre sin DB.
 *
 *   npm run check:invariant:novedades
 *
 * Verifica, de forma ejecutable (no "es obvio"), las garantías que el sprint
 * 0.5.8 promete y que la consigna pide constatar:
 *
 *   1. AISLAMIENTO DE LECTURA — el feed de novedades se filtra SOLO por el
 *      destinatario (`setterId`): un setter jamás alcanza las de otro.
 *   2. DIRECCIÓN CORRECTA ("por assignedToId" + el cabo) — la REGLA ÚNICA
 *      `destinatarioNovedad` dirige asignación/aprobación/rechazo al dueño
 *      ACTUAL del lead, y la reasignación-saliente al dueño PREVIO (que ya no es
 *      `assignedToId` — por eso necesita la fila addressed). En una reasignación
 *      A→B el entrante (B) y el saliente (A) no se cruzan.
 *   3. SEPARACIÓN CONTACTO-COMERCIAL — mostrar novedades NO reclasifica nada:
 *      `SISTEMA` sigue fuera de lo comercial, y una novedad ni siquiera es un
 *      canal de actividad (conjuntos disjuntos) → no puede contar como contacto.
 *   4. DOS EJES — el feed se aísla por DESTINATARIO (`setterId`) y la cola en
 *      revisión por DUEÑO ACTUAL (`assignedToId`): dimensiones distintas a
 *      propósito (el saliente ya no es dueño pero sí destinatario).
 *   5. EL PLIEGUE NO ESCONDE NINGUNA ACCIÓN (P21) — `agruparAvisos` sólo pliega
 *      avisos SIN `leadId`; ninguno de los que ofrecen "Abrir" pierde su fila, y
 *      la cuenta de avisos se conserva (filas + ocultos = entrada).
 *
 * Importa solo módulos puros (isolation.ts) y los enums de Prisma (valores en
 * runtime, sin DB) — cero Neon, cero efectos.
 */
import assert from 'node:assert/strict'
import { ActivityChannel, OsSetterNoticeKind } from '@prisma/client'
import {
  destinatarioNovedad,
  esContactoComercial,
  ownedListWhere,
  ownSetterNoticeWhere,
  SOLO_CONTACTOS_COMERCIALES,
} from './isolation.ts'
import { agruparAvisos, type AvisoView } from './novedades-agrupar.ts'

const SETTER_A = 'setter-a'
const SETTER_B = 'setter-b'

// 1. Aislamiento de lectura: el feed se arma SOLO con el setterId del dueño de
//    la sesión. El filtro de A nunca alcanza las novedades de B.
assert.deepEqual(ownSetterNoticeWhere(SETTER_A), { setterId: SETTER_A })
assert.notEqual(
  ownSetterNoticeWhere(SETTER_A).setterId,
  ownSetterNoticeWhere(SETTER_B).setterId,
  'el feed de un setter nunca debe alcanzar las novedades de otro',
)

// 2. Dirección correcta. Asignación / aprobación / rechazo → dueño ACTUAL.
assert.equal(
  destinatarioNovedad({ kind: 'LEAD_ASIGNADO', ownerActual: SETTER_A }),
  SETTER_A,
)
assert.equal(
  destinatarioNovedad({ kind: 'DEMO_APROBADA', ownerActual: SETTER_A }),
  SETTER_A,
)
assert.equal(
  destinatarioNovedad({ kind: 'DEMO_RECHAZADA', ownerActual: SETTER_A }),
  SETTER_A,
)

// 2b. Reasignación-saliente → dueño PREVIO (el que PERDIÓ el lead), NUNCA el
//     nuevo. Es el cabo 0.5.8: el saliente ya no es `assignedToId`, así que la
//     única forma de avisarle es la fila addressed por `setterId`.
const saliente = destinatarioNovedad({
  kind: 'LEAD_REASIGNADO_SALIENTE',
  ownerPrevio: SETTER_A,
})
assert.equal(saliente, SETTER_A)
assert.notEqual(
  saliente,
  SETTER_B,
  'el aviso de salida va al que PERDIÓ el lead, no al nuevo dueño',
)

// 2c. En una reasignación A→B el entrante (B, dueño actual) y el saliente (A,
//     dueño previo) reciben avisos DISTINTOS y no se cruzan.
const entrante = destinatarioNovedad({ kind: 'LEAD_ASIGNADO', ownerActual: SETTER_B })
const salienteAB = destinatarioNovedad({
  kind: 'LEAD_REASIGNADO_SALIENTE',
  ownerPrevio: SETTER_A,
})
assert.equal(entrante, SETTER_B)
assert.equal(salienteAB, SETTER_A)
assert.notEqual(
  entrante,
  salienteAB,
  'en A→B el entrante (B) y el saliente (A) no deben cruzarse',
)

// 2d. Sin dueño en el extremo → sin destinatario → no se crea fila (no hay a
//     quién avisar; un lead sin asignar no genera ruido).
assert.equal(destinatarioNovedad({ kind: 'LEAD_ASIGNADO', ownerActual: null }), null)
assert.equal(
  destinatarioNovedad({ kind: 'LEAD_REASIGNADO_SALIENTE', ownerPrevio: null }),
  null,
)

// 3. Separación contacto-comercial intacta: SISTEMA sigue sin contar y el filtro
//    reutilizable no cambia porque ahora mostremos novedades.
assert.equal(esContactoComercial(ActivityChannel.SISTEMA), false)
assert.deepEqual(SOLO_CONTACTOS_COMERCIALES, {
  channel: { not: ActivityChannel.SISTEMA },
})

// 3b. Una novedad NO es un canal de actividad: los conjuntos son disjuntos, así
//     que crear/mostrar una novedad no puede colarse en ningún conteo comercial
//     (`_count.activities`, "último contacto", cadencia). Es un modelo aparte.
const kinds: OsSetterNoticeKind[] = Object.values(OsSetterNoticeKind)
const canales: ActivityChannel[] = Object.values(ActivityChannel)
assert.ok(kinds.length >= 1 && canales.length >= 1)
for (const kind of kinds) {
  assert.ok(
    !(canales as string[]).includes(kind),
    `una novedad (${kind}) no es un canal de actividad — no puede contar como contacto`,
  )
}

// 4. Dos ejes a propósito: el feed dirigido se aísla por DESTINATARIO
//    (`setterId`); la cola en revisión por DUEÑO ACTUAL (`assignedToId`). Las
//    claves de filtro son distintas — el saliente cae en el primer eje, no en el
//    segundo.
assert.deepEqual(ownedListWhere(SETTER_A), { assignedToId: SETTER_A })
assert.notEqual(
  Object.keys(ownSetterNoticeWhere(SETTER_A))[0],
  Object.keys(ownedListWhere(SETTER_A))[0],
  'el feed (setterId) y la cola (assignedToId) son dimensiones distintas',
)

// ── 5. P21 — el pliegue no esconde ninguna acción ───────────────────────────
// El bug que motivó el agrupamiento: doce filas con el mismo título. El riesgo
// del arreglo es el opuesto — plegar algo que el setter podía abrir. Se barre el
// eje entero: cuántos avisos, cuántos con acción, y qué tope.
const aviso = (i: number, kind: OsSetterNoticeKind, leadId: string | null): AvisoView => ({
  id: `a${i}`,
  kind,
  title: `T-${kind}`,
  body: `b${i}`,
  hace: 'hace 1 h',
  leadId,
})

let casosPliegue = 0
for (let sinAccion = 0; sinAccion <= 40; sinAccion += 1) {
  for (let conAccion = 0; conAccion <= 6; conAccion += 1) {
    const entrada: AvisoView[] = []
    for (let i = 0; i < conAccion; i += 1) {
      // Repartidos entre los tipos que SÍ traen lead, para que el pliegue por
      // kind tenga la oportunidad de tragárselos si el criterio fuera el tipo.
      const kind: OsSetterNoticeKind = i % 2 === 0 ? 'DEMO_APROBADA' : 'DEMO_RECHAZADA'
      entrada.push(aviso(i, kind, `lead-${i}`))
    }
    for (let i = 0; i < sinAccion; i += 1) {
      entrada.push(aviso(1000 + i, 'LEAD_REASIGNADO_SALIENTE', null))
    }

    for (let tope = 0; tope <= 10; tope += 1) {
      casosPliegue += 1
      const { filas, ocultos } = agruparAvisos(entrada, tope)

      // Ninguna fila plegada trae acción: plegar y ofrecer "Abrir" es la
      // combinación imposible — si apareciera, el contador estaría tapando un
      // lead abrible.
      for (const fila of filas) {
        assert.ok(
          fila.cantidad === 1 || fila.leadId === null,
          'una fila plegada nunca trae un lead abrible',
        )
      }

      // Cada aviso con acción tiene su PROPIA fila, o quedó fuera por el tope —
      // nunca plegado dentro de otra.
      const idsConAccion = filas.filter((f) => f.leadId !== null).map((f) => f.key)
      assert.equal(
        new Set(idsConAccion).size,
        idsConAccion.length,
        'los avisos con acción no se colapsan entre sí',
      )
      assert.ok(
        idsConAccion.length === Math.min(conAccion, tope),
        'los avisos con acción entran primero y uno por fila',
      )

      // Ningún aviso se pierde en la cuenta: lo mostrado más lo oculto es la
      // entrada entera.
      const mostrados = filas.reduce((suma, f) => suma + f.cantidad, 0)
      assert.equal(
        mostrados + ocultos,
        entrada.length,
        'filas + ocultos cubren exactamente los avisos de entrada',
      )
      assert.ok(filas.length <= tope, 'el tope corta filas, no se excede')
    }
  }
}

// El caso medido en la cartera real: 32 reasignaciones-salientes idénticas → UNA
// fila con su cuenta, no doce entradas de texto repetido.
const treintaYDos = Array.from({ length: 32 }, (_, i) =>
  aviso(i, 'LEAD_REASIGNADO_SALIENTE', null),
)
const plegado = agruparAvisos(treintaYDos, 6)
assert.equal(plegado.filas.length, 1, '32 avisos del mismo tipo sin acción son UNA fila')
assert.equal(plegado.filas[0].cantidad, 32, 'y la fila dice que son 32')
assert.equal(plegado.ocultos, 0, 'plegados no es lo mismo que ocultos: no se perdió ninguno')

console.log(
  `✓ invariante OK: novedades aisladas por destinatario (setterId), dirección ` +
    `correcta (actual para asignar/aprobar/rechazar, previo para el saliente — el ` +
    `cabo 0.5.8), SISTEMA sigue fuera de lo comercial (novedad ≠ canal de ` +
    `actividad), y el pliegue de P21 (${casosPliegue} combinaciones) no esconde ` +
    `ninguna acción ni pierde un solo aviso de la cuenta.`,
)
