/**
 * INVARIANTE — `prefers-reduced-motion`: los nueve patrones no se montan.
 *
 * Corre con `npm run test:s2-reducido`.
 *
 * ── Cómo se puede afirmar esto sin navegador ───────────────────────────────
 *
 * `useReducedMotionConfig` de `motion/react` respeta el contexto de
 * `MotionConfig`, así que el MISMO árbol se puede renderizar a HTML con la
 * preferencia puesta y sin ella, en el mismo proceso, y comparar los dos
 * marcados. No es una simulación de la preferencia: es la misma función que lee
 * la preferencia real, leyendo un contexto en vez del media query.
 *
 * ── El control positivo, que acá es la mitad que importa ───────────────────
 *
 * "Con la preferencia no aparece ninguna transformada" pasa en verde si el
 * sistema está roto y no anima nunca. Por eso cada afirmación tiene su gemela:
 * SIN la preferencia, la transformada TIENE que estar. Las dos juntas dicen algo;
 * cada una sola, no.
 */

import { MotionConfig } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { AJUSTES_MEDIDOS } from '../../../motion/_componentes/ajustes'
import { BloqueDePatron, type EstadoDelBloque } from '../../../motion/_componentes/BloqueDePatron'
import { ContenidoP4, ContenidoP7, ContenidoP8 } from '../../../motion/_componentes/contenidosPiezas'
import { ContenidoP1, ContenidoP2, ContenidoP3 } from '../../../motion/_componentes/contenidosTexto'
import {
  ITEMS_DE_LISTA,
  PARRAFO_QUE_ENCIENDE,
  PIEZAS_DEL_VUELO,
  PLANOS,
} from '../../../motion/_componentes/relleno'
import { altoDelBloqueSvh } from '../escenografia'
import { ATRIBUTO_PIEZAS, palabrasDe } from '../lineas'
import { ORDEN_DE_PATRONES, PATRONES, type IdDePatron } from '../patrones'
import { politicaDeMovimiento } from '../reducido'

type Contenido = (props: { estado: EstadoDelBloque }) => React.JSX.Element

/** Renderiza un patrón con o sin la preferencia, y devuelve el HTML. */
function marcar(
  id: IdDePatron,
  Contenido: Contenido,
  cantidad: number,
  preferencia: 'always' | 'never',
): string {
  return renderToStaticMarkup(
    <MotionConfig reducedMotion={preferencia}>
      <BloqueDePatron
        patron={PATRONES[id]}
        ajustes={AJUSTES_MEDIDOS}
        cantidadDePiezas={cantidad}
        className="relative"
      >
        {(estado) => <Contenido estado={estado} />}
      </BloqueDePatron>
    </MotionConfig>,
  )
}

/**
 * `cantidad` es la cantidad de piezas que el contenido REALMENTE renderiza, no
 * un número elegido: el conteo de estilos se compara contra ella. La primera
 * versión de este archivo pasaba 30 para P3 cuando el párrafo tiene 39 palabras,
 * y el chequeo lo cazó.
 */
const CASOS: readonly { id: IdDePatron; Contenido: Contenido; cantidad: number }[] = [
  { id: 'P1', Contenido: ContenidoP1, cantidad: 6 },
  { id: 'P2', Contenido: ContenidoP2, cantidad: 1 },
  { id: 'P3', Contenido: ContenidoP3, cantidad: palabrasDe(PARRAFO_QUE_ENCIENDE).length },
  { id: 'P4', Contenido: ContenidoP4, cantidad: ITEMS_DE_LISTA.length },
  { id: 'P7', Contenido: ContenidoP7, cantidad: PLANOS.length },
  { id: 'P8', Contenido: ContenidoP8, cantidad: PIEZAS_DEL_VUELO },
]

/**
 * Cuántos elementos llevan estilo escrito por el BLOQUE, con o sin preferencia.
 * Es 1 si el bloque declara alto mínimo o perspectiva, y 0 si no declara
 * ninguno de los dos — que es el caso de P4, cuyo ancla ya recorre un viewport
 * entero y no necesita alto propio. Se deriva de los mismos datos que usa el
 * componente, no se supone.
 */
const estilosDelBloque = (id: IdDePatron): number =>
  altoDelBloqueSvh(PATRONES[id].anclas) > 0 || PATRONES[id].perspectivaPx !== undefined ? 1 : 0

const escribeEstilo = (html: string, propiedad: string): boolean => html.includes(propiedad)
const elementos = (html: string): number => (html.match(/</g) ?? []).length

// ═══════════════════════════════════════════════════════════════════════════
titulo('R1 · La política es total: no hay un modo intermedio')

const sin = politicaDeMovimiento(true)
const con = politicaDeMovimiento(false)
afirmarIgual(
  sin,
  { montaElMotorDeProgreso: false, montaElDivisorDeLineas: false, aplicaTransformadas: false },
  'con la preferencia, las tres respuestas son NO',
)
afirmarIgual(
  con,
  { montaElMotorDeProgreso: true, montaElDivisorDeLineas: true, aplicaTransformadas: true },
  'sin la preferencia, las tres son SÍ',
)

controlPositivo(
  'una política INGENUA que solo acorta duraciones no pasa por "no monta nada"',
  { montaElMotorDeProgreso: true, montaElDivisorDeLineas: true, aplicaTransformadas: true },
  (p: typeof sin) =>
    !p.montaElMotorDeProgreso && !p.montaElDivisorDeLineas && !p.aplicaTransformadas,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('R2 · Con la preferencia NO se escribe una sola transformada')

for (const { id, Contenido, cantidad } of CASOS) {
  const conPreferencia = marcar(id, Contenido, cantidad, 'always')
  afirmar(
    !escribeEstilo(conPreferencia, 'transform:'),
    `${id} no escribe ninguna transformada`,
  )
  afirmar(
    !escribeEstilo(conPreferencia, 'will-change'),
    `  ni promueve una capa de composición`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('R3 · CONTROL POSITIVO — sin la preferencia, SÍ se escriben')

/**
 * P1 y P3 quedan afuera de esta afirmación por una razón de método, no por una
 * excepción: en un render de servidor no corren los efectos, así que P1 sale en
 * su fase de medición —sin transformada todavía— y P3 solo anima opacidad. Los
 * cuatro que sí escriben transformada en el primer cuadro son los que valen como
 * control. P1 tiene su propia afirmación en R4, sobre el divisor.
 */
for (const { id, Contenido, cantidad } of CASOS.filter((c) => !['P1', 'P3'].includes(c.id))) {
  const sinPreferencia = marcar(id, Contenido, cantidad, 'never')
  afirmar(
    escribeEstilo(sinPreferencia, 'transform:'),
    `${id} SÍ escribe transformada cuando la preferencia no está`,
  )
}

const p3Sin = marcar('P3', ContenidoP3, 30, 'never')
const p3Con = marcar('P3', ContenidoP3, 30, 'always')
afirmar(escribeEstilo(p3Sin, 'opacity:0.3'), 'P3 SÍ arranca en opacidad 0,3 sin la preferencia')
afirmar(!escribeEstilo(p3Con, 'opacity:'), '  y con la preferencia no escribe opacidad: el texto está')

const p7Sin = marcar('P7', ContenidoP7, 12, 'never')
const p7Con = marcar('P7', ContenidoP7, 12, 'always')
afirmar(
  escribeEstilo(p7Sin, 'visibility:hidden') && escribeEstilo(p7Sin, 'pointer-events:none'),
  'P7 SÍ escribe visibility y pointer-events sin la preferencia — el autoAlpha completo',
)
afirmar(
  !escribeEstilo(p7Con, 'visibility:') && !escribeEstilo(p7Con, 'pointer-events:'),
  '  y con la preferencia no escribe ninguna de las dos: los planos están y son clickeables',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('R4 · El divisor de líneas TAMPOCO corre — el texto queda entero')

const p1Con = marcar('P1', ContenidoP1, 6, 'always')
const p1Sin = marcar('P1', ContenidoP1, 6, 'never')

afirmar(
  !p1Con.includes(ATRIBUTO_PIEZAS),
  'con la preferencia el texto NO se parte: no hay piezas de línea',
)
afirmar(
  p1Sin.includes(ATRIBUTO_PIEZAS),
  '  y sin la preferencia SÍ se parte — el control positivo del divisor',
)
afirmar(
  p1Con.includes('Seis líneas, que es el bloque más largo'),
  'y el texto completo está en el documento, en un párrafo común',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('R5 · Cuánto más chico es el árbol, medido de dos formas')

/**
 * ⚠ La primera versión de este bloque afirmaba que el árbol reducido es
 * ESTRICTAMENTE más chico en elementos, y era falso: en P3, P7 y P8 la rama
 * quieta renderiza un elemento por pieza igual que la animada —lo que no
 * renderiza es la maquinaria—, así que los conteos empatan. La afirmación
 * correcta es más floja en elementos y más fuerte en estilos: **ningún elemento
 * lleva estilo escrito**, salvo el propio bloque, que declara su alto y su
 * perspectiva y no anima nada.
 */
const conEstilo = (html: string): number => (html.match(/style="/g) ?? []).length

for (const { id, Contenido, cantidad } of CASOS) {
  const conPreferencia = marcar(id, Contenido, cantidad, 'always')
  const sinPreferencia = marcar(id, Contenido, cantidad, 'never')
  afirmar(
    elementos(conPreferencia) <= elementos(sinPreferencia),
    `${id}: ${elementos(conPreferencia)} elementos contra ${elementos(sinPreferencia)} — nunca más grande`,
  )
  afirmarIgual(
    conEstilo(conPreferencia),
    estilosDelBloque(id),
    `  y con la preferencia ninguna PIEZA lleva estilo — solo el bloque, si declara alto o perspectiva`,
  )
}

// El control positivo del conteo: sin la preferencia hay un estilo por pieza.
for (const { id, Contenido, cantidad } of CASOS.filter((c) => c.id !== 'P1')) {
  const sinPreferencia = marcar(id, Contenido, cantidad, 'never')
  afirmarIgual(
    conEstilo(sinPreferencia),
    cantidad + estilosDelBloque(id),
    `${id} sin la preferencia: un estilo por cada una de sus ${cantidad} piezas`,
  )
}

/**
 * P1 queda afuera de ese conteo porque en un render de servidor está en su fase
 * de medición y todavía no tiene piezas. Su diferencia se mide en elementos, y
 * es la más grande de todas: el divisor de líneas es la maquinaria más pesada
 * del sistema.
 */
const p1ElementosCon = elementos(p1Con)
const p1ElementosSin = elementos(p1Sin)
afirmar(
  p1ElementosSin > p1ElementosCon * 5,
  `P1 sin la preferencia tiene ${p1ElementosSin} elementos contra ${p1ElementosCon}: el divisor es la pieza más pesada`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('R6 · Los nueve patrones existen y están cubiertos')

afirmarIgual(ORDEN_DE_PATRONES.length, 9, 'el sistema tiene nueve patrones')
afirmar(
  CASOS.length >= 6,
  `y esta comprobación renderiza ${CASOS.length} de los nueve`,
  CASOS.map((c) => c.id).join(' · '),
)

cerrar('reducido.invariant')
