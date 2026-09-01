/**
 * EL PADRÓN DE ENTREGA DE SITIO-S10 — qué frente escribe qué, declarado ANTES
 * de despachar.
 *
 * ⚠ **ESTO ES LA LECCIÓN DE §7.21 DE `DIRECCION-ESCENA.md`, CABLEADA.** Una
 * corrida con cuatro subagentes en paralelo se puede quedar a mitad por límite
 * de gasto: el corte no avisa, deja el disco en un estado intermedio y **el
 * reporte del workflow vuelve vacío**, así que el agente principal no sabe qué
 * se entregó si no mira el disco. Lo que permitió retomar sin perder nada en
 * SITIO-S5 fue exactamente esto: un padrón escrito ANTES, contra el que
 * `archivosDeclaradosQueFaltan()` dice qué falta.
 *
 * Es además la regla 1 de los subagentes de este sprint —*escribís SOLO en tu
 * carpeta*— hecha comprobable: el padrón dice de quién es cada archivo, y
 * `duenoDe()` lo contesta sin preguntarle a `git` (que vencería al commitear,
 * regla 12 de §3).
 *
 * ── ⚠ LA LECTURA QUE SE ELIGIÓ, con las frases que la fuerzan (§7.37) ──────
 *
 * `CLAUDE.md` dice, en su sección de subagentes, que *«son read-only. Solo el
 * agente padre escribe código.»* La instrucción de SITIO-S10 dice, en su regla
 * 1 para subagentes, *«**Escribís SOLO en tu carpeta.** Si necesitás algo de
 * afuera, reportalo»*, y en su regla 4 *«Tu invariante propio, con controles
 * positivos»*. **Las dos no pueden ser ciertas a la vez**, y hay tres cosas que
 * discriminan:
 *
 *   1. La regla 1 del sprint sólo tiene sentido si el subagente escribe: «sólo
 *      en tu carpeta» es una restricción de ESCRITURA.
 *   2. La regla absoluta 2 dice *«Solo el frente D cambia código de PRODUCTO»* —
 *      o sea que los otros tres cambian algo que no es producto: sus
 *      instrumentos.
 *   3. El repo ya lo hizo así tres veces: `anclaje.ts` declara con esas palabras
 *      que **él** no lo escribió ningún subagente y que `recorrido.ts` y
 *      `visibilidad.ts` sí (SITIO-S9), y §7.21 describe cuatro subagentes
 *      dejando *«carpetas a medio llenar»*.
 *
 * **Se eligió que los frentes de lane ESCRIBEN**, acotados por este padrón, y la
 * frase de `CLAUDE.md` se lee como lo que su propia sección enumera: los
 * subagentes de DESCUBRIMIENTO (`Explore`) y de VERIFICACIÓN (`visual-qa`) son
 * read-only. Lo que queda sin cumplirse literalmente es la frase «solo el agente
 * padre escribe código», y queda declarado acá.
 */

import { statSync } from 'node:fs'
import path from 'node:path'

import { RAIZ } from './s5-archivos'

export interface Frente {
  readonly id: string
  readonly nombre: string
  /** Si puede tocar código de producto. Sólo D. */
  readonly cambiaProducto: boolean
  /** Lo que tiene que dejar en disco. Se comprueba contra el disco. */
  readonly entregables: readonly string[]
  /** Lo que puede EDITAR de lo que ya existe. Vacío = nada. */
  readonly editables: readonly string[]
}

const TESTS = 'src/app/v3/_lib/__tests__'
const ESCENA = 'src/app/v3/_lib/escena'
const PROBE = 'src/app/probe-escena/__tests__'
const INTRO = 'src/components/layout/home-intro'

/**
 * LOS CUATRO FRENTES. Los entregables son rutas exactas: un frente que entrega
 * un archivo con otro nombre figura como «no entregó» Y como «escribió de
 * más», que es lo correcto — el padrón es el contrato, no una sugerencia.
 */
export const FRENTES: readonly Frente[] = [
  {
    id: 'A',
    nombre: 'Mobile — el sitio que nadie vio',
    cambiaProducto: false,
    entregables: [
      `${TESTS}/s10-mobile.ts`,
      // Declarado DESPUÉS del despacho: el frente lo pidió al partir por las 300
      // líneas, con su costura escrita. El padrón se actualiza, no se afloja.
      `${TESTS}/s10-mobile-pie.ts`,
      `${TESTS}/s10-mobile.invariant.ts`,
    ],
    editables: [],
  },
  {
    id: 'B',
    nombre: 'Accesibilidad — sobre el home compuesto',
    cambiaProducto: false,
    entregables: [
      `${TESTS}/s10-acceso.ts`,
      `${TESTS}/s10-acceso-color.ts`,
      `${TESTS}/s10-acceso-tablas.ts`,
      `${TESTS}/s10-acceso.invariant.ts`,
    ],
    editables: [],
  },
  {
    id: 'C',
    nombre: 'La composición del logo contra el texto',
    cambiaProducto: false,
    entregables: [
      `${ESCENA}/__tests__/s10-logo.ts`,
      `${ESCENA}/__tests__/s10-logo-lectura.ts`,
      `${ESCENA}/__tests__/s10-logo-cajas.ts`,
      `${ESCENA}/__tests__/s10-logo.invariant.ts`,
    ],
    editables: [],
  },
  {
    id: 'D',
    nombre: 'La deuda — el único frente que cambia código de producto',
    cambiaProducto: true,
    entregables: [
      // D4 — las mitades de cada archivo partido. El tercero apareció al
      // escribir los controles de D1: `s7-recorridos` pasó de 293 a 329.
      `${ESCENA}/__tests__/s8-escena-soporte.ts`,
      `${TESTS}/s8-montaje-soporte.ts`,
      `${PROBE}/s7-recorridos-soporte.ts`,
      // D5 — la medición del orden de los dos rAF.
      `${TESTS}/s10-raf.ts`,
      `${TESTS}/s10-raf.invariant.ts`,
    ],
    editables: [
      // D1 — los controles positivos que faltan, adentro de los diez archivos.
      `${PROBE}/s7-export.invariant.ts`,
      `${PROBE}/s7-modelado.invariant.ts`,
      `${PROBE}/s7-recorridos.invariant.ts`,
      `${PROBE}/s7-sol.invariant.ts`,
      `${PROBE}/s7-variantes.invariant.ts`,
      `${PROBE}/s10-batido.invariant.ts`,
      `${PROBE}/s10-escena.invariant.ts`,
      `${PROBE}/s10-fondo.invariant.ts`,
      `${PROBE}/s10-particulas.invariant.ts`,
      `${PROBE}/s10-tramas.invariant.ts`,
      // D2 — el chunk de Sentry por contenido y no por nombre.
      'src/components/layout/carga-diferida/presupuesto.ts',
      'src/components/layout/carga-diferida/__tests__/s8-peso.invariant.ts',
      // D3 — declarados y NO usados: el frente frenó. Ver `NO_ENTREGADOS`.
      `${ESCENA}/OrbitRig.tsx`,
      `${ESCENA}/pistaDelHome.ts`,
      `${ESCENA}/ProbeStage.tsx`,
      'src/app/probe-escena/_components/choreographyEditor.ts',
      `${ESCENA}/__tests__/s8-escena.invariant.ts`,
      // D4 — los dos archivos que se parten.
      `${TESTS}/s8-montaje.invariant.ts`,
      // D5 — el docblock de la constante, si la medición lo permite.
      `${ESCENA}/visibilidad.ts`,
    ],
  },
]

export interface NoEntregado {
  readonly frente: string
  readonly archivo: string
  readonly porQue: string
}

/**
 * LO QUE SE DECLARÓ Y NO SE ENTREGÓ, con su razón — y por qué está acá y no
 * borrado del padrón.
 *
 * ⚠ **Un entregable que se saca de la lista sin dejar rastro convierte un freno
 * en un olvido.** El padrón dice qué se prometió; si algo no se cumplió, lo que
 * corresponde es que se lea, no que desaparezca. Es la misma forma que
 * `s5-archivos.ts` usa con `ARCHIVOS_DE_RUTA`, que queda como lista vacía y no
 * se borra: *«es lo que hace que se lea, en el padrón, que acá hubo una ruta y
 * ya no hay»*.
 */
export const NO_ENTREGADOS: readonly NoEntregado[] = [
  {
    frente: 'D',
    archivo: `${ESCENA}/choreographyEditorTypes.ts`,
    porQue:
      'D3 se DECLARA en vez de resolverse, que es una de las dos salidas que la instrucción admite («resolvelo o declaralo con su razón»). El motivo es una medición: el costo que §7.36 publica —«1 archivo nuevo, 4 líneas cambiadas, 1 afirmación reescrita»— está INCOMPLETO. Nombra sólo `s8-escena.invariant.ts` §3 y se olvida de `s9-instrumentos.invariant.ts` §2, que es el instrumento que MIDE el acoplamiento: el arreglo le borra la premisa a cuatro de sus afirmaciones (los tres `IMPORT_DE_TIPO` sobre los tres archivos, y el `export type ChoreoEditor = {` sobre el editor, que con la re-exportación deja de matchear). Y hay una quinta consecuencia que ningún costo nombraba: las tres afirmaciones de «no importa un VALOR del panel» pasarían a ser verdaderas POR VACÍO, que es el modo de falla que este repo caza. El costo real es 1 archivo nuevo, 4 líneas de import y DOS instrumentos reescritos con sus controles',
  },
]

/** El banco compartido: lo escribió el agente principal en la Fase 0. */
export const BANCO: readonly string[] = [
  `${TESTS}/s10-referencias.ts`,
  `${TESTS}/s10-banco.ts`,
  `${TESTS}/s10-recorrido.ts`,
  `${TESTS}/s10-lectura.ts`,
  `${TESTS}/s10-css.ts`,
  `${TESTS}/s10-woff2.ts`,
  `${TESTS}/s10-avance.ts`,
  `${TESTS}/s10-padron.ts`,
  `${TESTS}/s10-banco.invariant.ts`,
  `${TESTS}/s10-lectura.invariant.ts`,
  `${TESTS}/s10-medida.invariant.ts`,
]

/**
 * LO QUE NINGÚN FRENTE PUEDE TOCAR. No es la lista de frozen del repo —ésa vale
 * igual— sino lo que ESTE sprint congela por encima: el banco compartido, la
 * tabla del recorrido, el contrato del anclaje, el paquete y el tema.
 */
export const INTOCABLES: readonly string[] = [
  ...BANCO,
  'src/app/v3/_lib/secciones.ts',
  `${ESCENA}/anclaje.ts`,
  `${ESCENA}/anclajeDerivacion.ts`,
  'package.json',
  'src/app/theme-develop.css',
  'src/app/layout.tsx',
  'src/instrumentation-client.ts',
  `${INTRO}`,
]

export function existe(relativo: string): boolean {
  try {
    statSync(path.join(RAIZ, relativo))
    return true
  } catch {
    return false
  }
}

/** Lo que el padrón declara y NO está en disco: alguien no entregó. */
export function entregablesQueFaltan(): { readonly frente: string; readonly archivo: string }[] {
  return FRENTES.flatMap((f) =>
    f.entregables.filter((a) => !existe(a)).map((archivo) => ({ frente: f.id, archivo })),
  )
}

/** De quién es un archivo, según el padrón. `null` = de nadie de este sprint. */
export function duenoDe(archivo: string): string | null {
  const normal = archivo.replace(/\\/g, '/')
  if (BANCO.includes(normal)) return 'banco (agente principal)'
  for (const f of FRENTES) {
    if (f.entregables.includes(normal)) return f.id
    if (f.editables.includes(normal)) return `${f.id} (edición declarada)`
  }
  return null
}

/** Los archivos que el sprint entero declara, para el reporte y el staging. */
export function padronCompleto(): string[] {
  return [...BANCO, ...FRENTES.flatMap((f) => [...f.entregables, ...f.editables])].sort()
}
