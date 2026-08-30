import type { IdDePatron } from '../../_lib/motion/patrones'
import { Hero } from '../hero/Hero'
import { CONTENIDO as CONTENIDO_HERO, PEDIDO as PEDIDO_HERO, PATRONES_DE_LA_SECCION as PATRONES_HERO } from '../hero/contenido'
import { Numeros } from '../numeros/Numeros'
import { CONTENIDO as CONTENIDO_NUMEROS, PEDIDO as PEDIDO_NUMEROS, PATRONES_DE_LA_SECCION as PATRONES_NUMEROS } from '../numeros/contenido'
import { QuienesSomos } from '../quienes-somos/QuienesSomos'
import { CONTENIDO as CONTENIDO_QUIENES, PEDIDO as PEDIDO_QUIENES, PATRONES_DE_LA_SECCION as PATRONES_QUIENES } from '../quienes-somos/contenido'
import { Trabajos } from '../trabajos/Trabajos'
import { CONTENIDO as CONTENIDO_TRABAJOS, PEDIDO as PEDIDO_TRABAJOS, PATRONES_DE_LA_SECCION as PATRONES_TRABAJOS } from '../trabajos/contenido'

import type { EntradaDePedido } from './pedido'
import { seccionDeA, type IdDeSeccionA, type PropsDeSeccion } from './forma'
import type { Seccion as EntradaDeSeccion } from '../../_lib/secciones'

/**
 * EL REGISTRO DE LAS CUATRO — lo arma la fase 2, no las secciones.
 *
 * ── Por qué es del principal ──────────────────────────────────────────────
 *
 * Porque es lo único que ve las cuatro a la vez, y ninguna sección podía
 * escribirlo: cada subagente sólo podía tocar su carpeta. Un registro armado
 * por partes sería cuatro archivos que se importan entre sí, que es exactamente
 * el acoplamiento que el reparto existe para evitar — hay un invariante que
 * afirma que ninguna sección importa de otra.
 *
 * ── Para qué sirve ────────────────────────────────────────────────────────
 *
 * Para que la ruta de demostración y los instrumentos transversales recorran
 * las cuatro **uniformemente**: la misma comprobación de contenido inventado,
 * de marcadores visibles y de completitud abajo de 1025 corre sobre las cuatro
 * sin un `if` por sección. Una comprobación escrita cuatro veces son cuatro
 * comprobaciones distintas.
 *
 * ── El orden es el del recorrido ──────────────────────────────────────────
 *
 * Y no es decorativo: la ruta las monta en este orden y un instrumento afirma
 * que coincide con `IDS_DE_SECCION_A` y con el orden de `secciones.ts`. El
 * recorrido de superficies —aparece, desaparece y vuelve— sólo significa algo
 * si el orden es el declarado.
 */

export interface ModuloRegistrado {
  readonly id: IdDeSeccionA
  /** La entrada de la tabla del recorrido: alto, superficie y pinneo. */
  readonly seccion: EntradaDeSeccion
  readonly Componente: (props: PropsDeSeccion) => React.JSX.Element
  /** El contenido como dato. Es lo que recorre el escáner de §0.4. */
  readonly contenido: unknown
  readonly pedido: readonly EntradaDePedido[]
  readonly patrones: readonly IdDePatron[]
}

export const REGISTRO: readonly ModuloRegistrado[] = [
  {
    id: 'hero',
    seccion: seccionDeA('hero'),
    Componente: Hero,
    contenido: CONTENIDO_HERO,
    pedido: PEDIDO_HERO,
    patrones: PATRONES_HERO,
  },
  {
    id: 'quienes-somos',
    seccion: seccionDeA('quienes-somos'),
    Componente: QuienesSomos,
    contenido: CONTENIDO_QUIENES,
    pedido: PEDIDO_QUIENES,
    patrones: PATRONES_QUIENES,
  },
  {
    id: 'numeros',
    seccion: seccionDeA('numeros'),
    Componente: Numeros,
    contenido: CONTENIDO_NUMEROS,
    pedido: PEDIDO_NUMEROS,
    patrones: PATRONES_NUMEROS,
  },
  {
    id: 'trabajos',
    seccion: seccionDeA('trabajos'),
    Componente: Trabajos,
    contenido: CONTENIDO_TRABAJOS,
    pedido: PEDIDO_TRABAJOS,
    patrones: PATRONES_TRABAJOS,
  },
]
