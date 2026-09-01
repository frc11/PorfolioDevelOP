/**
 * Chequeo de invariante de los BLOQUES POR FUENTE de la ficha — sin DB.
 *
 *   npm run check:invariant:ficha-bloques
 *
 * Qué protege, en una línea: que el mapa de bloques no se despegue del gate, y
 * que el recorrido camine y no encierre a nadie.
 *
 * ── §1 · El mapa contra el gate ──────────────────────────────────────────────
 * `ficha-bloques.ts` necesita saber QUÉ CAMPOS arreglan cada requisito de la
 * señal mínima, y `fichaFaltantes` no lo dice (devuelve prosa). Así que hay dos
 * listas: los `REQUISITOS` de acá y los `if` de `fichaFaltantes`. Dos listas que
 * pueden divergir es exactamente el problema que este bloque cierra, y lo cierra
 * SIN copiar el criterio: le da a `fichaFaltantes` fichas sintéticas armadas
 * desde el mapa y le exige que el conteo coincida en las dos direcciones.
 *
 *   · Cumplir TODOS los requisitos del mapa ⇒ CERO faltantes. Si alguien agrega
 *     un requisito nuevo a `fichaFaltantes` y no lo mapea acá, esa ficha deja de
 *     dar cero y esto se pone en rojo.
 *   · Romper UN requisito (vaciar todos sus campos) ⇒ EXACTAMENTE UN faltante.
 *     Si alguien saca un requisito de `fichaFaltantes` pero lo deja en el mapa,
 *     ese caso da cero y esto se pone en rojo.
 *
 * ── §2 · Por qué no puede pasar en verde sobre nada ──────────────────────────
 * Todo lo de §1 se apoya en que `fichaFaltantes` DE VERDAD rechace algo, así que
 * antes de nada se prueba el piso: la ficha vacía tiene que dar tantos faltantes
 * como requisitos hay. Un `fichaFaltantes` que devolviera `[]` siempre pasaría
 * la mitad de §1 sin chistar; contra eso está ese piso.
 *
 * ── §3 · El recorrido camina ─────────────────────────────────────────────────
 * El avance por completitud es el punto del sprint, y su falla silenciosa es que
 * los bloques se abran TODOS DE GOLPE: si «completo» fuera solo «no debe nada»,
 * un bloque sin requisitos propios (la web) estaría completo desde que se abre y
 * el recorrido por fuentes se perdería sin que nada fallara. Acá se camina el
 * recorrido entero de un lead nuevo, bloque por bloque, y se exige que en cada
 * paso el siguiente sea el que sigue — no dos más adelante.
 *
 * ── §4 · Nadie queda encerrado ───────────────────────────────────────────────
 * Un negocio sin web tiene que poder llegar al veredicto. Se prueba que un
 * recorrido que NUNCA escribe nada en el bloque de la web igual alcanza el
 * cierre, y que la señal mínima queda cumplida sin haber tocado ese bloque.
 */
import assert from 'node:assert/strict'
import { fichaFaltantes } from '@/lib/leados/flow'
import type { Ficha } from '@/lib/leados/contracts'
import {
  BLOQUES_DE_FICHA,
  BLOQUE_DE_CAMPO,
  REQUISITOS,
  bloqueCompleto,
  bloqueInicial,
  bloqueSiguiente,
  camposDelBloque,
  deudaDelBloque,
  valoresDeFicha,
  type CampoFicha,
  type ValoresFicha,
} from '@/lib/leados/ficha-bloques'

const VACIO: ValoresFicha = {
  igManejadoPor: '',
  identidadNotas: '',
  contenidoReal: '',
  comoSePresenta: '',
  imagenesUrl: '',
  resenas: '',
  resenasUrl: '',
  queVende: '',
  presenciaDigital: '',
  senalesOperativas: '',
  otraRedUrl: '',
  otros: '',
}

const con = (...campos: CampoFicha[]): ValoresFicha => {
  const valores: ValoresFicha = { ...VACIO }
  for (const campo of campos) {
    valores[campo] = campo === 'igManejadoPor' ? 'DUENO' : `contenido de ${campo}`
  }
  return valores
}

/** El puente valores→`Ficha` que consume el gate (mismo shape que el formulario). */
const aFicha = (valores: ValoresFicha): Ficha => ({
  identidad: {
    notas: valores.identidadNotas || undefined,
    igManejadoPor: valores.igManejadoPor === '' ? undefined : 'DUENO',
  },
  presenciaDigital: valores.presenciaDigital || undefined,
  resenas: valores.resenas || undefined,
  contenidoReal: valores.contenidoReal || undefined,
  senalesOperativas: valores.senalesOperativas || undefined,
  materiales: {
    resenasUrl: valores.resenasUrl || undefined,
    imagenesUrl: valores.imagenesUrl || undefined,
    otraRedUrl: valores.otraRedUrl || undefined,
    queVende: valores.queVende || undefined,
    comoSePresenta: valores.comoSePresenta || undefined,
  },
  otros: valores.otros || undefined,
})

// ── §2 · El piso: el gate rechaza algo ──────────────────────────────────────

assert.equal(
  fichaFaltantes(aFicha(VACIO)).length,
  REQUISITOS.length,
  'PISO: la ficha vacía tiene que dar un faltante por cada requisito mapeado — si da menos, ' +
    'el gate dejó de exigir algo que el mapa todavía cree que exige (o el mapa se quedó viejo), ' +
    'y todo lo que sigue estaría midiendo contra un gate que no rechaza.',
)

// ── §1 · El mapa contra el gate ─────────────────────────────────────────────

/** Un campo por requisito: el mínimo que satisface el mapa entero. */
const unoPorRequisito = REQUISITOS.map((requisito) => requisito.campos[0])
const todoCumplido = con(...unoPorRequisito)

assert.deepEqual(
  fichaFaltantes(aFicha(todoCumplido)),
  [],
  'Cumplir un campo de cada requisito del mapa tiene que dar CERO faltantes. Si no: ' +
    '`fichaFaltantes` exige algo que `REQUISITOS` no conoce — agregalo al mapa (y decidí en qué bloque cae).',
)

for (const requisito of REQUISITOS) {
  // Se cumple todo MENOS este requisito (ninguno de sus campos).
  const suyos: readonly CampoFicha[] = requisito.campos
  const roto = con(...unoPorRequisito.filter((campo) => !suyos.includes(campo)))
  const faltantes = fichaFaltantes(aFicha(roto))
  assert.equal(
    faltantes.length,
    1,
    `Vaciar el requisito «${requisito.id}» tiene que dar EXACTAMENTE un faltante y dio ${faltantes.length}. ` +
      'Si dio 0, el gate dejó de exigirlo y el mapa quedó viejo; si dio más de 1, sus campos se solapan con otro requisito.',
  )
  // Y ese requisito lo tiene que DEBER algún bloque: si no, nadie lo puede arreglar.
  const bloquesQueLoDeben = BLOQUES_DE_FICHA.filter((bloque) =>
    deudaDelBloque(bloque, roto).includes(requisito.id),
  )
  assert.ok(
    bloquesQueLoDeben.length > 0,
    `El requisito «${requisito.id}» está pendiente y ningún bloque lo debe: sus campos no tienen bloque asignado.`,
  )
}

// ── §3 · El recorrido camina, bloque por bloque ─────────────────────────────

/**
 * Un lead nuevo arranca en el primer bloque. La lista dice a qué bloque se llega
 * después de escribir lo que se escribe en el bloque en el que se está. Es el
 * recorrido real: cada paso escribe en la fuente que tiene abierta.
 */
const RECORRIDO: readonly { escribe: CampoFicha[]; despues: string }[] = [
  { escribe: ['igManejadoPor', 'contenidoReal'], despues: 'google' },
  { escribe: ['resenas'], despues: 'web' },
  { escribe: ['queVende'], despues: 'balance' },
  { escribe: ['presenciaDigital'], despues: 'cierre' },
]

assert.equal(bloqueInicial(VACIO), 'instagram', 'Un lead sin nada abre en la primera fuente.')

let posicion: string = 'instagram'
let acumulado: CampoFicha[] = []
for (const paso of RECORRIDO) {
  acumulado = [...acumulado, ...paso.escribe]
  const valores = con(...acumulado)
  assert.ok(
    bloqueCompleto(posicion as (typeof BLOQUES_DE_FICHA)[number], valores),
    `El bloque «${posicion}» tendría que quedar completo tras escribir ${paso.escribe.join(', ')}.`,
  )
  const siguiente = bloqueSiguiente(posicion as (typeof BLOQUES_DE_FICHA)[number], valores)
  assert.equal(
    siguiente,
    paso.despues,
    `Desde «${posicion}» el recorrido tiene que abrir «${paso.despues}» y abrió «${siguiente}». ` +
      'Saltearse un bloque acá es el síntoma de que «completo» dejó de mirar si el bloque tiene algo escrito: ' +
      'con ese criterio los bloques sin requisito propio se dan por hechos y las fuentes que faltan no se visitan.',
  )
  posicion = siguiente!
}

assert.equal(posicion, 'cierre', 'El recorrido completo termina en el veredicto.')
assert.equal(
  bloqueSiguiente('cierre', con(...acumulado)),
  null,
  'Del cierre no se avanza a ningún lado.',
)

// Y al volver a la pantalla con todo escrito, se entra directo al veredicto.
assert.equal(
  bloqueInicial(con(...acumulado)),
  'cierre',
  'Con la ficha completa, volver a la pantalla abre el veredicto — no manda a releer las fuentes.',
)

// ── §4 · Nadie queda encerrado: el negocio sin web ──────────────────────────

const SIN_WEB: CampoFicha[] = ['igManejadoPor', 'contenidoReal', 'resenas', 'presenciaDigital']
const sinWeb = con(...SIN_WEB)

assert.deepEqual(
  fichaFaltantes(aFicha(sinWeb)),
  [],
  'Un negocio sin web tiene que poder cumplir la señal mínima sin escribir una sola línea en ese bloque.',
)
assert.equal(
  bloqueInicial(sinWeb),
  'cierre',
  'Con la señal mínima cumplida, volver a la pantalla abre el VEREDICTO aunque quede un bloque ' +
    'opcional vacío. Si abriera en «web», el que no tiene web volvería siempre a un formulario ' +
    'que nunca va a poder llenar en vez de a la decisión que sí puede tomar.',
)
assert.equal(
  deudaDelBloque('web', sinWeb).length,
  0,
  'Y no debe nada: incompleto acá significa «vacío», nunca «te bloquea».',
)
assert.equal(
  bloqueCompleto('web', sinWeb),
  false,
  'El bloque de la web sigue marcado como no-escrito (queda ofrecido, no dado por hecho).',
)

// El bloque de la web no puede tener ningún campo obligatorio: si alguien mueve
// uno ahí, un negocio sin web deja de poder cerrar la ficha.
const camposObligatorios = new Set<CampoFicha>(REQUISITOS.flatMap((r) => [...r.campos]))
for (const campo of camposDelBloque('web')) {
  assert.ok(
    !camposObligatorios.has(campo),
    `«${campo}» es de la señal mínima y está en el bloque de la web: un negocio sin web no podría dejar su veredicto.`,
  )
}

// ── §5 · El censo cubre la ficha entera ─────────────────────────────────────

// El compilador ya garantiza que todo `CampoFicha` tenga bloque. Lo que no puede
// garantizar es que el puente `valoresDeFicha` lea TODOS los campos del contrato:
// si alguien agrega un campo a `FichaSchema` y se olvida del puente, el campo
// nuevo entraría siempre vacío y su bloque nunca se daría por escrito.
const fichaLlena = aFicha(con(...(Object.keys(BLOQUE_DE_CAMPO) as CampoFicha[])))
const releidos = valoresDeFicha(fichaLlena)
for (const campo of Object.keys(BLOQUE_DE_CAMPO) as CampoFicha[]) {
  assert.ok(
    releidos[campo].trim().length > 0,
    `«${campo}» se perdió en el viaje Ficha→valores: \`valoresDeFicha\` no lo lee, ` +
      'así que su bloque nunca se va a ver como escrito por más que el setter lo llene.',
  )
}

console.log(
  `✓ ficha-bloques: ${REQUISITOS.length} requisitos cruzados contra el gate, ` +
    `recorrido de ${RECORRIDO.length} pasos sin saltos, y el bloque de la web sin campos obligatorios.`,
)
