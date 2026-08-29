/**
 * INVARIANTE — el divisor de líneas: el agrupamiento y la protección de lectores.
 *
 * Corre con `npm run test:s2-lineas`.
 *
 * ── Por qué esto renderiza el componente de verdad ─────────────────────────
 *
 * La protección de accesibilidad no vive en una función que se pueda probar
 * suelta: vive en el JSX. Un chequeo sobre una función auxiliar dejaría pasar el
 * caso que importa —que alguien edite el componente y saque el `aria-hidden`—.
 *
 * Así que se renderiza `LineasDeTexto` a HTML con `react-dom/server`, sin
 * navegador, y se afirma sobre el marcado real. `renderToStaticMarkup` no corre
 * efectos, con lo cual sale la fase de MEDICIÓN, que es la que está en pantalla
 * el primer cuadro y la que un lector de pantalla podría alcanzar primero.
 * La protección está escrita una sola vez, en el envoltorio que envuelve a las
 * dos fases, así que afirmarla sobre una vale para las dos.
 *
 * ── El control positivo ────────────────────────────────────────────────────
 *
 * Una versión SIN la protección —el mismo texto partido en `span`, sin copia
 * accesible y sin `aria-hidden`— corre por el MISMO predicado y tiene que
 * fallar. Sin eso, el predicado podría estar mirando cualquier cosa.
 */

import { useMotionValue } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { LineasDeTexto } from '../../../motion/_componentes/LineasDeTexto'
import {
  ATRIBUTO_PIEZAS,
  ATRIBUTO_TEXTO_ACCESIBLE,
  TOLERANCIA_DE_LINEA_PX,
  agruparEnLineas,
  lineaUnica,
  palabrasDe,
  textoDeLineas,
  textoNormalizado,
} from '../lineas'
import { PATRONES } from '../patrones'

const TEXTO = 'Seis líneas que suben una detrás de otra, con dos décimas de retraso.'

// ═══════════════════════════════════════════════════════════════════════════
titulo('L1 · El agrupamiento — de topes medidos a líneas')

const topes = [0, 0, 0, 40, 40, 40, 40, 80]
afirmarIgual(
  agruparEnLineas(topes).map((l) => l.length),
  [3, 4, 1],
  'ocho palabras en tres topes distintos dan tres líneas de 3, 4 y 1',
)
afirmarIgual(agruparEnLineas([]), [], 'sin palabras no hay líneas')
afirmarIgual(agruparEnLineas([12]).length, 1, 'una palabra es una línea')
afirmarIgual(
  agruparEnLineas([0, 1.4, 0.7, 40]).map((l) => l.length),
  [3, 1],
  `las diferencias de sub-píxel no abren línea (tolerancia ${TOLERANCIA_DE_LINEA_PX} px)`,
)
afirmarIgual(
  agruparEnLineas([0, 40, 80]).map((l) => l.length),
  [1, 1, 1],
  'y una separación de interlineado sí',
)

controlPositivo(
  'con una tolerancia enorme el agrupamiento colapsa a una línea: la tolerancia hace algo',
  1000,
  (tol: number) => agruparEnLineas([0, 40, 80], tol).length === 3,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('L2 · La reconstrucción no pierde ni duplica una palabra')

const palabras = palabrasDe(TEXTO)
const lineas = agruparEnLineas([0, 0, 0, 40, 40, 40, 80, 80, 80, 80, 120, 120, 120])
afirmarIgual(palabras.length, 13, 'el texto de prueba tiene trece palabras')
afirmarIgual(
  textoDeLineas(palabras, lineas).join(' '),
  textoNormalizado(TEXTO),
  'unir las líneas devuelve el texto original normalizado',
)
afirmarIgual(
  textoDeLineas(palabras, lineaUnica(palabras.length)).join(' '),
  textoNormalizado(TEXTO),
  'y con una sola línea —el estado previo a medir— también',
)

controlPositivo(
  'la reconstrucción ve un agrupamiento que PIERDE una palabra',
  [[0, 1, 2], [3, 4, 5], [6, 7, 8, 9], [10]] as readonly (readonly number[])[],
  (grupos) => textoDeLineas(palabras, grupos).join(' ') === textoNormalizado(TEXTO),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('L3 · ACCESIBILIDAD — sobre el marcado real del componente')

function Sonda({ texto }: { texto: string }): React.JSX.Element {
  const progreso = useMotionValue(0)
  return (
    <LineasDeTexto
      texto={texto}
      progreso={progreso}
      claves={PATRONES.P1.claves}
      curva={PATRONES.P1.curva}
      duracionDeclarada={PATRONES.P1.duracionDeclarada}
      escalonado={PATRONES.P1.escalonado}
      className="font-titulo text-titulo-m"
    />
  )
}

/** La versión SIN la protección. Es el control positivo, y nada más lo usa. */
function SondaSinProteccion({ texto }: { texto: string }): React.JSX.Element {
  return (
    <div className="relative">
      <span className="flex flex-col">
        {palabrasDe(texto).map((palabra, i) => (
          <span key={`${palabra}-${i}`}>{palabra} </span>
        ))}
      </span>
    </div>
  )
}

/** La etiqueta de apertura que contiene un atributo dado. */
function etiquetaCon(html: string, atributo: string): string | null {
  const i = html.indexOf(atributo)
  if (i === -1) return null
  const inicio = html.lastIndexOf('<', i)
  const fin = html.indexOf('>', i)
  if (inicio === -1 || fin === -1) return null
  return html.slice(inicio, fin + 1)
}

/** El contenido de texto del elemento que lleva un atributo dado. */
function contenidoDe(html: string, atributo: string): string | null {
  const etiqueta = etiquetaCon(html, atributo)
  if (etiqueta === null) return null
  const desde = html.indexOf(etiqueta) + etiqueta.length
  const hasta = html.indexOf('</span>', desde)
  if (hasta === -1) return null
  return html.slice(desde, hasta)
}

/**
 * EL PREDICADO. Las dos mitades de la protección, y las dos son obligatorias.
 * Es el mismo para el componente y para el control.
 */
function protegeALectores(html: string, texto: string): boolean {
  const accesible = contenidoDe(html, ATRIBUTO_TEXTO_ACCESIBLE)
  if (accesible !== textoNormalizado(texto)) return false
  const piezas = etiquetaCon(html, ATRIBUTO_PIEZAS)
  if (piezas === null) return false
  return piezas.includes('aria-hidden="true"')
}

const marcado = renderToStaticMarkup(<Sonda texto={TEXTO} />)

afirmar(
  contenidoDe(marcado, ATRIBUTO_TEXTO_ACCESIBLE) === textoNormalizado(TEXTO),
  'el texto COMPLETO sobrevive en un nodo accesible',
  contenidoDe(marcado, ATRIBUTO_TEXTO_ACCESIBLE) ?? '(no está)',
)
afirmar(
  (etiquetaCon(marcado, ATRIBUTO_TEXTO_ACCESIBLE) ?? '').includes('sr-only'),
  '  y va oculto a la vista con `sr-only`, no con `display: none`',
)
afirmar(
  (etiquetaCon(marcado, ATRIBUTO_PIEZAS) ?? '').includes('aria-hidden="true"'),
  'las piezas visuales van `aria-hidden`: no se anuncian dos veces',
  etiquetaCon(marcado, ATRIBUTO_PIEZAS) ?? '(no está)',
)
afirmar(protegeALectores(marcado, TEXTO), 'el componente pasa el predicado completo')

controlPositivo(
  'una versión SIN la protección falla el MISMO predicado',
  renderToStaticMarkup(<SondaSinProteccion texto={TEXTO} />),
  (html: string) => protegeALectores(html, TEXTO),
)

// Y el predicado tampoco puede pasar por la mitad.
controlPositivo(
  'el predicado rechaza un marcado con la copia accesible pero SIN aria-hidden',
  `<div><span class="sr-only" ${ATRIBUTO_TEXTO_ACCESIBLE}="">${textoNormalizado(TEXTO)}</span><span ${ATRIBUTO_PIEZAS}=""><span>x</span></span></div>`,
  (html: string) => protegeALectores(html, TEXTO),
)
controlPositivo(
  'y rechaza un marcado con aria-hidden pero SIN la copia accesible',
  `<div><span ${ATRIBUTO_PIEZAS}="" aria-hidden="true"><span>x</span></span></div>`,
  (html: string) => protegeALectores(html, TEXTO),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('L4 · El texto de la copia accesible NO depende del corte de línea')

/**
 * Es la razón de fondo de la protección: el corte depende del ancho de la
 * ventana, así que si el lector de pantalla leyera las piezas, la MISMA frase se
 * anunciaría distinto en dos ventanas. La copia accesible es una sola cadena y
 * no la toca ningún agrupamiento.
 */
const conCorteA = textoDeLineas(palabras, agruparEnLineas([0, 0, 40, 40, 40, 80, 80, 80, 80, 120, 120, 120, 160]))
const conCorteB = textoDeLineas(palabras, agruparEnLineas([0, 0, 0, 0, 0, 0, 40, 40, 40, 40, 40, 40, 40]))
afirmar(conCorteA.length !== conCorteB.length, 'dos anchos distintos dan distinta cantidad de líneas')
afirmarIgual(
  conCorteA.join(' '),
  conCorteB.join(' '),
  '  y sin embargo el texto que anuncia el lector es exactamente el mismo',
)

cerrar('lineas.invariant')
