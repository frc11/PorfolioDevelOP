/**
 * LA SEGUNDA MITAD DE `reducido.invariant.tsx` — **el camino de producción**.
 *
 * No tiene script propio y no lo va a tener: lo corre `npm run test:s2-reducido`,
 * que es donde estas afirmaciones tienen sentido. Vive en su propio archivo por
 * la regla de las 300 líneas, no porque sea otra pregunta.
 *
 * ═══ POR QUÉ ESTE ARCHIVO EXISTE: «VERDE POR ARNÉS» ════════════════════════
 *
 * `reducido.invariant.tsx` estuvo en verde —46 afirmaciones, 0 fallas— **mientras
 * el sitio ignoraba `prefers-reduced-motion`**. No era un descuido: renderizaba a
 * través de `<MotionConfig reducedMotion={preferencia}>` y después afirmaba sobre
 * esa misma `preferencia`. **Inyectaba el valor bajo prueba y comprobaba que el
 * árbol le hacía caso.** Probaba el arnés.
 *
 * El discriminador de la regla es una pregunta: *¿qué parte de esta afirmación la
 * puso el instrumento?* Ahí la respuesta incluía la entrada bajo prueba.
 *
 * Acá la respuesta es OTRA. El instrumento pone el ÁRBOL —el mismo que compone
 * `v3/layout.tsx`— y **no pone la preferencia**: el valor sale de
 * `usePrefiereMenosMovimiento`, por su `snapshotDeServidor`, que es el contrato
 * del hook de producción. Y el control negativo captura el defecto de hoy: el
 * MISMO árbol SIN el proveedor sí anima. Si alguien saca el proveedor, R7b se
 * pone en rojo.
 *
 * ── EL LÍMITE DE ESTE CAMINO, DECLARADO ───────────────────────────────────
 *
 * En un render de servidor `usePrefiereMenosMovimiento` devuelve SIEMPRE su
 * snapshot conservador (`true`), así que acá sólo se puede ver la rama
 * `'always'`. La rama `'never'` —un navegador real sin la preferencia, que TIENE
 * que animar— **no es observable desde acá** y se mide en
 * `scripts-b7/a-reducido.ts`, con la preferencia puesta por
 * `Emulation.setEmulatedMedia` y su corrida de control sin ella. Los dos caminos
 * hacen falta: éste dice cuál es la composición y aquél dice qué hace el
 * navegador con ella.
 */

import { MotionConfig } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { AJUSTES_MEDIDOS } from '../../../motion/_componentes/ajustes'
import { BloqueDePatron, type EstadoDelBloque } from '../../../motion/_componentes/BloqueDePatron'
import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../__tests__/afirmar'
import { leer } from '../../__tests__/s3-archivos'
import { ATRIBUTO_PIEZAS } from '../lineas'
import { PATRONES, type IdDePatron } from '../patrones'
import { ProveedorDeMovimiento, vocabularioDeMovimiento } from '../ProveedorDeMovimiento'

type Contenido = (props: { estado: EstadoDelBloque }) => React.JSX.Element

const LAYOUT_V3 = 'src/app/v3/layout.tsx'
const PROVEEDOR = 'src/app/v3/_lib/motion/ProveedorDeMovimiento.tsx'
const CURSOR = 'src/app/v3/_componentes/chrome/CursorCompuerta.tsx'
const SCROLL_SUAVE = 'src/app/v3/_componentes/CompuertaDelScrollSuave.tsx'

/** El hook que es LA fuente única de la preferencia en todo /v3. */
const HOOK_DE_LA_PREFERENCIA = 'usePrefiereMenosMovimiento'

const importaElHook = (fuente: string): boolean =>
  new RegExp(`import\\s*\\{[^}]*\\b${HOOK_DE_LA_PREFERENCIA}\\b`).test(fuente)

const sinComentarios = (fuente: string): string =>
  fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')

const escribeEstilo = (html: string, propiedad: string): boolean => html.includes(propiedad)

const bloque = (id: IdDePatron, Contenido: Contenido, cantidad: number): React.JSX.Element => (
  <BloqueDePatron
    patron={PATRONES[id]}
    ajustes={AJUSTES_MEDIDOS}
    cantidadDePiezas={cantidad}
    className="relative"
  >
    {(estado) => <Contenido estado={estado} />}
  </BloqueDePatron>
)

/** El árbol tal como lo compone `v3/layout.tsx`: el proveedor arriba, nada forzado. */
const conElProveedor = (id: IdDePatron, C: Contenido, n: number): string =>
  renderToStaticMarkup(<ProveedorDeMovimiento>{bloque(id, C, n)}</ProveedorDeMovimiento>)

/** El MISMO árbol sin el proveedor: el defecto de hoy, capturado como control. */
const sinElProveedor = (id: IdDePatron, C: Contenido, n: number): string =>
  renderToStaticMarkup(bloque(id, C, n))

/** Con un `<MotionConfig>` anidado adentro del proveedor: el forzado de R1…R6. */
const forzadoAdentro = (id: IdDePatron, C: Contenido, n: number): string =>
  renderToStaticMarkup(
    <ProveedorDeMovimiento>
      <MotionConfig reducedMotion="never">{bloque(id, C, n)}</MotionConfig>
    </ProveedorDeMovimiento>,
  )

export interface CasoDeProduccion {
  readonly id: IdDePatron
  readonly Contenido: Contenido
  readonly cantidad: number
}

export function afirmarElCaminoDeProduccion(
  casos: readonly CasoDeProduccion[],
  p1: CasoDeProduccion,
  textoDeP1: string,
): void {
  // ═════════════════════════════════════════════════════════════════════════
  titulo('R7 · EL CAMINO DE PRODUCCIÓN — el proveedor, sin forzar nada')

  /**
   * Ninguna llamada de este bloque pasa `reducedMotion`. La entrada la produce
   * `usePrefiereMenosMovimiento` por su `snapshotDeServidor`, que es lo que el
   * servidor y el render de HIDRATACIÓN sirven de verdad.
   */
  afirmar(casos.length >= 6, `el camino de producción se renderiza con ${casos.length} patrones`)
  for (const { id, Contenido, cantidad } of casos) {
    const html = conElProveedor(id, Contenido, cantidad)
    afirmar(
      !escribeEstilo(html, 'transform:') && !escribeEstilo(html, 'will-change'),
      `${id} bajo el proveedor de producción: ni transformada ni capa de composición`,
    )
  }

  const p1ConProveedor = conElProveedor(p1.id, p1.Contenido, p1.cantidad)
  afirmar(
    !p1ConProveedor.includes(ATRIBUTO_PIEZAS),
    'y el divisor de líneas tampoco corre: el texto no se parte',
  )
  afirmar(
    p1ConProveedor.includes(textoDeP1),
    '  con el texto entero en el documento — «no se monta» no es «no se ve»',
  )

  // ═════════════════════════════════════════════════════════════════════════
  titulo('R7b · CONTROL NEGATIVO — el defecto de B7, capturado')

  /**
   * ⚠️ **Éstas son las afirmaciones que se ponen en ROJO si alguien saca el
   * proveedor.** Sin él, `useReducedMotionConfig()` corta en el default
   * `"never"` de `MotionConfigContext` y el media query no se lee nunca: el
   * sitio anima con la preferencia puesta. Es exactamente lo que la Fase 0 de
   * B7 midió en el navegador — 2450 transformadas acumuladas contra 2450.
   *
   * P1 y P3 quedan afuera por la misma razón de método que R3: en un render de
   * servidor P1 está en su fase de medición y P3 sólo anima opacidad.
   */
  const conControl = casos.filter((c) => !['P1', 'P3'].includes(c.id))
  afirmar(conControl.length > 0, `el control negativo corre sobre ${conControl.length} patrones`)
  for (const { id, Contenido, cantidad } of conControl) {
    afirmar(
      escribeEstilo(sinElProveedor(id, Contenido, cantidad), 'transform:'),
      `${id} SIN el proveedor SÍ escribe transformada: el instrumento es capaz de fallar`,
    )
  }
  afirmar(
    sinElProveedor(p1.id, p1.Contenido, p1.cantidad).includes(ATRIBUTO_PIEZAS),
    'y sin el proveedor el divisor de líneas SÍ corre: P1 sale partido',
  )

  // ═════════════════════════════════════════════════════════════════════════
  titulo('R8 · UNA SOLA FUENTE — el layout monta el proveedor y lee de ella')

  const layout = sinComentarios(leer(LAYOUT_V3))
  afirmar(
    /import\s*\{\s*ProveedorDeMovimiento\s*\}\s*from\s*'\.\/_lib\/motion\/ProveedorDeMovimiento'/.test(
      layout,
    ),
    'el layout de /v3 importa el proveedor de `_lib/motion/`',
  )
  afirmar(
    layout.includes('<ProveedorDeMovimiento>') && layout.includes('</ProveedorDeMovimiento>'),
    '  y lo MONTA envolviendo el árbol: no es un import muerto',
  )
  afirmar(
    layout.indexOf('<ProveedorDeMovimiento>') < layout.indexOf('data-v3'),
    '  por afuera de la raíz `data-v3`, o sea cubriendo también las dos compuertas',
  )

  controlPositivo(
    'el detector ve un layout que importa el proveedor y NO lo monta',
    "import { ProveedorDeMovimiento } from './_lib/motion/ProveedorDeMovimiento'\nexport default function L({children}){ return <div data-v3>{children}</div> }",
    (fuente: string) => fuente.includes('<ProveedorDeMovimiento>'),
  )

  /**
   * Y la propiedad que hace que esto sea UNA política y no tres: los tres
   * lectores de la preferencia en /v3 —el proveedor, el cursor y el scroll
   * suave— importan EL MISMO hook. La lista se deriva de los tres fuentes.
   */
  const lectores = [PROVEEDOR, CURSOR, SCROLL_SUAVE]
  const queNoLoLeen = lectores.filter((a) => !importaElHook(sinComentarios(leer(a))))
  afirmarIgual(
    queNoLoLeen,
    [],
    `los ${lectores.length} lectores de la preferencia en /v3 salen del mismo \`${HOOK_DE_LA_PREFERENCIA}\``,
  )
  afirmar(
    !/useReducedMotion\b/.test(sinComentarios(leer(PROVEEDOR))),
    '  y el proveedor NO abre una cuarta lectura con `useReducedMotion` de la librería',
  )
  afirmar(
    !/matchMedia/.test(sinComentarios(leer(PROVEEDOR))),
    '  ni consulta `matchMedia` por su cuenta: la fuente es el store, no una copia',
  )

  controlPositivo(
    'el detector ve un lector que se escribe su propio matchMedia',
    "import { useSyncExternalStore } from 'react'\nconst x = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches",
    (fuente: string) => importaElHook(fuente),
  )

  // ═════════════════════════════════════════════════════════════════════════
  titulo('R9 · El forzado por contexto de R1…R6 sigue GANANDO adentro de producción')

  /**
   * Es la afirmación que impide que este arreglo aflojara el invariante viejo.
   * Si el proveedor hubiera reemplazado el mecanismo —por ejemplo leyendo el
   * media query directo en `useMovimientoReducido`—, un `<MotionConfig>` anidado
   * dejaría de tener efecto, `reducido.invariant.tsx` perdería su capacidad de
   * renderizar los DOS árboles y el control positivo de R3 se caería. Acá se
   * afirma que NO pasó: el forzado gana, porque es el mismo contexto de React y
   * el proveedor más cercano manda.
   */
  const anidado = conControl[0]
  afirmar(anidado !== undefined, 'hay un patrón con el que probar el forzado anidado')
  if (anidado !== undefined) {
    afirmar(
      escribeEstilo(forzadoAdentro(anidado.id, anidado.Contenido, anidado.cantidad), 'transform:'),
      `un <MotionConfig reducedMotion="never"> ADENTRO del proveedor gana: ${anidado.id} vuelve a animar`,
    )
    afirmar(
      !escribeEstilo(conElProveedor(anidado.id, anidado.Contenido, anidado.cantidad), 'transform:'),
      `  y sin ese forzado el mismo ${anidado.id} sigue quieto: la diferencia es el forzado, no el árbol`,
    )
  }

  // ═════════════════════════════════════════════════════════════════════════
  titulo('R10 · La traducción al vocabulario de MotionConfig es total y son DOS')

  afirmarIgual(vocabularioDeMovimiento(true), 'always', 'prefiere menos movimiento → `always`')
  afirmarIgual(vocabularioDeMovimiento(false), 'never', 'no lo prefiere → `never`')
  afirmarIgual(
    [true, false].map(vocabularioDeMovimiento).filter((v) => v !== 'always' && v !== 'never').length,
    0,
    "`'user'` NO se emite: delegaría en `useReducedMotion` de la librería, que lee otra consulta, se captura con `useState` al montar y vale `null` en el servidor",
  )

  controlPositivo(
    'la traducción no es una constante: los dos valores son distintos',
    [true, false] as const,
    ([a, b]) => vocabularioDeMovimiento(a) === vocabularioDeMovimiento(b),
  )
}
