/**
 * INVARIANTE TRANSVERSAL — ⚠️ EL CONTENIDO INVENTADO PARECE INVENTADO.
 *
 * Corre con `npm run test:s5-contenido`. Es **la** comprobación del sprint.
 *
 * ── La deuda que existe para no repetir ───────────────────────────────────
 *
 * Las cuatro landings vivas de develOP llevan cifras que nadie midió —`+340%`,
 * `86% más económico`, `2+ años en el mercado`, `Respondemos en menos de 2hs`—
 * y están publicadas. La asimetría es toda la razón: un **marcador visible** es
 * un pedido que no se puede ignorar, y una **cifra falsa** se publica sin que
 * nadie se acuerde de que era falsa, porque se lee igual que una verdadera.
 *
 * ── Las tres capas, y por qué ninguna sobra ───────────────────────────────
 *
 *   1. **Cifras con símbolo** — un dígito pegado a `%`, `+` o `×`. La forma
 *      exacta de la deuda, y la que pide §0.4 del sprint.
 *   2. **Cualquier dígito** — `12 proyectos` no lleva símbolo y se lee como un
 *      hecho igual. La regla dice *ningún número que se pueda leer como un
 *      hecho*, y la única lectura operativa de eso es "ninguno".
 *   3. **Hojas numéricas** — un `{ clientes: 12 }` no lo ve un escáner de
 *      cadenas y llega a la pantalla lo mismo.
 *
 * Y una cuarta que no es sobre números: **el marcador tiene que LLEGAR A LA
 * PANTALLA**. Un `[CIFRA]` que existe en el dato y no se renderiza no es un
 * pedido: es una cifra ausente en silencio.
 *
 * Cada detector se corre además contra la deuda real, transcrita. Sin esa
 * mitad, "cero cifras inventadas" pasaría en verde con un escáner roto y se
 * vería exactamente igual de bien.
 */

import { MotionConfig } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ProveedorDeCoreografia } from '../../secciones-a/_contrato/coreografia'
import {
  LISTA_BLANCA_DE_CIFRAS,
  MARCADORES,
  cifrasConSimboloDe,
  cuentaDeMarcadores,
  digitosDe,
  hallazgosDeCifraConSimbolo,
  hallazgosDeDigito,
  hallazgosDeMarcadorDesconocido,
  marcadoresDesconocidosDe,
  numerosDe,
  textosDe,
} from '../../secciones-a/_contrato/marcadores'
import { entradasColgadas, pedidoPorClase } from '../../secciones-a/_contrato/pedido'
import { REGISTRO } from '../../secciones-a/_contrato/registro'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

/** La deuda REAL, transcrita de `B0-AUDITORIA.md`. Es la entrada equivocada
 *  contra la que se prueba cada detector: si un escáner no la ve, no mide nada. */
const LA_DEUDA = {
  crecimiento: '+340% en consultas',
  economia: '86% más económico',
  antiguedad: '2+ años en el mercado',
  respuesta: 'Respondemos en menos de 2hs',
  multiplicador: '3× más ventas',
  clientes: { activos: 50 },
}

/** Renderiza una sección en su rama QUIETA — la de abajo de 1025. */
function marcarQuieto(indice: number): string {
  const { Componente, seccion } = REGISTRO[indice]
  return renderToStaticMarkup(
    <MotionConfig reducedMotion="never">
      <ProveedorDeCoreografia modo="nunca">
        <Componente seccion={seccion} />
      </ProveedorDeCoreografia>
    </MotionConfig>,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El alcance: las cuatro secciones, y el escaneo no está vacío')

afirmarIgual(REGISTRO.length, 4, 'el registro tiene las cuatro secciones')
afirmarIgual(
  REGISTRO.map((m) => m.id),
  ['hero', 'quienes-somos', 'numeros', 'trabajos'],
  'en el orden del recorrido',
)

const textosPorSeccion = REGISTRO.map((m) => ({ id: m.id, textos: textosDe(m.contenido) }))
for (const { id, textos } of textosPorSeccion) {
  afirmar(textos.length > 0, `\`${id}\` — el escáner recorrió ${textos.length} cadenas de contenido`, 'no es verde por vacío')
}
const totalDeTextos = textosPorSeccion.reduce((n, s) => n + s.textos.length, 0)
afirmar(totalDeTextos > 0, `${totalDeTextos} cadenas de contenido en total`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Cero cifras con símbolo — la forma exacta de la deuda')

for (const { id, contenido } of REGISTRO) {
  afirmarIgual(hallazgosDeCifraConSimbolo(contenido), [], `\`${id}\` — ninguna cifra con %, + o ×`)
}

const ciego = (texto: string): boolean => cifrasConSimboloDe(texto).length === 0
controlPositivo('el detector ve `+340% en consultas`', LA_DEUDA.crecimiento, ciego)
controlPositivo('y `86% más económico`', LA_DEUDA.economia, ciego)
controlPositivo('y `2+ años en el mercado`', LA_DEUDA.antiguedad, ciego)
controlPositivo('y `3× más ventas`', LA_DEUDA.multiplicador, ciego)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Cero dígitos, punto — porque `12 proyectos` también se lee como un hecho')

for (const { id, contenido } of REGISTRO) {
  afirmarIgual(hallazgosDeDigito(contenido), [], `\`${id}\` — ni un dígito en el contenido`)
}

controlPositivo(
  'el detector ve un número SIN símbolo, que el de arriba dejaría pasar',
  LA_DEUDA.respuesta,
  (texto: string) => digitosDe(texto).length === 0,
)
afirmarIgual(
  cifrasConSimboloDe(LA_DEUDA.respuesta),
  [],
  '  y se ve por qué hacen falta los dos: `menos de 2hs` no tiene símbolo y pasa el primero',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Cero hojas numéricas — lo que un escáner de cadenas no ve')

for (const { id, contenido } of REGISTRO) {
  afirmarIgual(
    numerosDe(contenido),
    [],
    `\`${id}\` — el contenido no tiene un solo número: la geometría vive en el componente`,
  )
}

controlPositivo(
  'el detector ve un `{ activos: 50 }` que ninguna cadena contiene',
  LA_DEUDA.clientes,
  (dato: unknown) => numerosDe(dato).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los marcadores salen del conjunto cerrado')

for (const { id, contenido } of REGISTRO) {
  afirmarIgual(
    hallazgosDeMarcadorDesconocido(contenido),
    [],
    `\`${id}\` — ningún marcador fuera de la lista cerrada`,
  )
}

controlPositivo(
  'el detector ve `[METRICA]` sin tilde, que no está en la lista',
  '[METRICA] de crecimiento',
  (texto: string) => marcadoresDesconocidosDe(texto).length === 0,
)
controlPositivo(
  'y ve un marcador inventado',
  'la cifra es [XX]',
  (texto: string) => marcadoresDesconocidosDe(texto).length === 0,
)

afirmarIgual(
  LISTA_BLANCA_DE_CIFRAS,
  [],
  'la lista blanca de excepciones está VACÍA: ninguna sección necesitó una',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Los marcadores LLEGAN A LA PANTALLA')

/**
 * Es la mitad que convierte el dato en un pedido. Se comprueba sobre la rama
 * QUIETA —la de abajo de 1025— a propósito: si el marcador sólo apareciera con
 * la coreografía puesta, en mobile la casilla estaría vacía y en silencio.
 *
 * ⚠ **Una sección puede dejar CERO marcadores, y eso no es un descuido.** El
 * Hero no muestra ninguna cifra, foto, captura ni testimonio: no tiene dónde
 * declarar un dato ausente. Lo provisional que tiene son dos textos, y los dos
 * están en `PEDIDO` como prosa.
 *
 * Por eso la afirmación por sección NO es "deja al menos un marcador" —eso
 * obligaría al Hero a inventarse una casilla— sino la que de verdad importa:
 * **nada provisional queda sin pedir**, sea como marcador visible o como
 * entrada del pedido. Y la garantía de que el extractor no está ciego se toma
 * del total del lane y de su control positivo, no de cada sección.
 */
const censo = new Map<string, number>()
for (let i = 0; i < REGISTRO.length; i++) {
  const { id, contenido, pedido } = REGISTRO[i]
  const html = marcarQuieto(i)
  const esperados = cuentaDeMarcadores(contenido)
  afirmar(
    esperados.size > 0 || pedido.length > 0,
    `\`${id}\` — lo provisional está pedido: ${esperados.size} clase(s) de marcador y ${pedido.length} entrada(s) de pedido`,
  )
  for (const [marcador, cuantos] of esperados) {
    const enPantalla = html.split(marcador).length - 1
    afirmar(
      enPantalla >= cuantos,
      `  ${marcador} × ${cuantos} llega${cuantos === 1 ? '' : 'n'} al marcado`,
      `${enPantalla} en el HTML`,
    )
    censo.set(marcador, (censo.get(marcador) ?? 0) + cuantos)
  }
}

const totalDeMarcadores = [...censo.values()].reduce((n, c) => n + c, 0)
afirmar(
  totalDeMarcadores > 0,
  `el lane deja ${totalDeMarcadores} marcadores pedidos en total`,
  'la comprobación de "llegan al marcado" no es verde por vacío',
)

controlPositivo(
  'el contador de apariciones ve un marcador ausente del marcado',
  '<p>sin marcadores</p>',
  (html: string) => html.split('[CIFRA]').length - 1 >= 1,
)

console.log('\n  ── EL PEDIDO A FRANCO — marcadores, por clase y por sección ──')
for (const marcador of MARCADORES) {
  const total = censo.get(marcador) ?? 0
  if (total === 0) continue
  const donde = REGISTRO.filter((m) => (cuentaDeMarcadores(m.contenido).get(marcador) ?? 0) > 0)
    .map((m) => `${m.id}×${cuentaDeMarcadores(m.contenido).get(marcador) ?? 0}`)
    .join(' · ')
  console.log(`  ${marcador.padEnd(20)} ${String(total).padStart(2)}   ${donde}`)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · El pedido de prosa: declarado, y sin entradas colgadas')

for (const { id, contenido, pedido } of REGISTRO) {
  afirmarIgual(
    entradasColgadas(contenido, pedido),
    [],
    `\`${id}\` — cada entrada del pedido apunta a una ruta que existe en el contenido`,
  )
  afirmar(pedido.length > 0, `  y declara ${pedido.length} entrada(s) de pedido`)
}

controlPositivo(
  'el detector ve una entrada del pedido que apunta a una ruta inexistente',
  { contenido: { titular: 'x' }, pedido: [{ ruta: 'bajada', clase: 'prosa' as const, que: 'la bajada' }] },
  (caso: { contenido: unknown; pedido: readonly { ruta: string; clase: 'prosa'; que: string }[] }) =>
    entradasColgadas(caso.contenido, caso.pedido).length === 0,
)

console.log('\n  ── EL PEDIDO A FRANCO — prosa y datos declarados ──')
for (const { id, pedido } of REGISTRO) {
  for (const [clase, entradas] of pedidoPorClase(pedido)) {
    for (const e of entradas) console.log(`  ${id.padEnd(15)} ${clase.padEnd(10)} ${e.ruta.padEnd(28)} ${e.que}`)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Los nombres que SÍ son verdad sobreviven')

/**
 * La regla no es "no escribir nada": es no inventar. Lo verdadero se usa, y hay
 * que comprobar que sigue estando — un escáner demasiado celoso que empujara a
 * borrar los nombres reales convertiría una sección honesta en una vacía.
 */
const VERDADES: readonly { texto: string; donde: string }[] = [
  { texto: 'Esquina', donde: 'trabajos' },
  { texto: 'El Garage', donde: 'trabajos' },
  { texto: 'Matsu Automotores', donde: 'trabajos' },
  { texto: 'Tucumán', donde: 'quienes-somos' },
]

for (const { texto, donde } of VERDADES) {
  const indice = REGISTRO.findIndex((m) => m.id === donde)
  const html = marcarQuieto(indice)
  afirmar(html.includes(texto), `\`${texto}\` aparece en \`${donde}\` — es verdad y se usa`)
}

controlPositivo(
  'el buscador de verdades vería una ausente',
  '<section>sin nombres</section>',
  (html: string) => html.includes('Matsu Automotores'),
)

cerrar('s5-contenido.invariant')
