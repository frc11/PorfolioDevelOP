/**
 * EL BARRIDO DE `s8-escena.invariant.ts` — el corpus del disco y las cuatro
 * derivaciones que se hacen sobre él, aparte de las afirmaciones que las leen.
 *
 * ── ⚠️ POR QUÉ SE PARTIÓ, Y POR DÓNDE (SITIO-S10) ──────────────────────────
 *
 * El invariante estaba en **299 líneas**, o sea con UNA de margen contra el
 * límite de 300 que el repo se puso: el próximo que le agregara un chequeo lo
 * ponía en rojo por largo, y ésa es la peor forma de descubrir una deuda de
 * tamaño —descubrirla mientras se intenta otra cosa—. Se partió con margen y no
 * al filo, que es §7.13 aplicada en vez de anotada otra vez.
 *
 * **La costura NO es "por la mitad para que entre": es de NATURALEZA.** De un
 * lado el barrido —lo que lee el disco y produce listas—, del otro las
 * afirmaciones y sus controles positivos. Es la misma costura que el repo ya
 * usa en `_secciones/cierre/soporte.ts` y en `_chrome/__tests__/soporte.ts`, y
 * la que separa a `./soporte.ts` (los detectores primitivos) de este archivo
 * (las cuatro derivaciones COMPUESTAS que este invariante en particular hace
 * sobre ellos).
 *
 * ⚠️ **Y el corolario que decide la firma de cada función de acá:** todas
 * reciben el corpus por parámetro en vez de leerlo de un global. Sin eso el
 * invariante no podría correr la MISMA función contra una entrada equivocada, y
 * un detector que no se puede probar contra una entrada rota no se puede
 * defender. Los controles positivos siguen viviendo en el invariante, que es
 * donde se cuentan.
 *
 * ⚠️ **Este archivo NO termina en `.invariant.ts` a propósito:** `s4-cobertura`
 * busca en el disco los `*.invariant.ts` que ningún script corre y los reporta
 * como instrumentos huérfanos (regla 14). Un módulo de apoyo con ese sufijo
 * entraría a esa lista sin tener nada que correr.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

// prettier-ignore
import { DESTINO, MODULOS_MUDADOS, ORIGEN, RAIZ, archivosTs, especificadoresRotos, importaValorDe, quienImporta, referenciasA } from './soporte'

/** Todo `.ts`/`.tsx` de `src/`, en rutas absolutas. El corpus del barrido. */
export const TODOS: readonly string[] = archivosTs(path.join(RAIZ, 'src'))

/** Un fuente del repo por ruta relativa a la raíz. */
export const fuenteDe = (relativo: string): string =>
  readFileSync(path.join(RAIZ, relativo), 'utf8')

/** El corpus sin los instrumentos. Se excluyen con motivo: varios `__tests__/`
 *  llevan cadenas de FIXTURE que los detectores tienen que encontrar (§7.25), y
 *  contarlas como código de aplicación reportaría consumidores que no existen. */
export const soloAplicacion = (archivos: readonly string[]): string[] =>
  archivos.filter((a) => !a.includes(`${path.sep}__tests__${path.sep}`))

/** Los módulos de la aplicación que viven en el destino de la mudanza. */
export const enElDestino = (archivos: readonly string[]): string[] =>
  soloAplicacion(archivos).filter((a) => a.includes(path.join('v3', '_lib', 'escena')))

// ── 1 · §2 · Los especificadores rotos, acotados al radio del sprint ────────

/**
 * ⚠️ **EL ACOTE, con su nombre y su motivo.** Un barrido de todo `src` encuentra
 * hoy seis "rotos" y **los seis son cadenas de FIXTURE adentro de controles
 * positivos de otros instrumentos**, escritas a propósito para que un detector
 * las encuentre (§7.25). Se afirma sobre lo que este sprint controla, y el
 * invariante comprueba aparte que **lo excluido siga teniendo lo que el
 * detector busca** — sin esa segunda mitad, acotar sería un agujero con forma
 * de decisión.
 */
export const esDelSprint = (linea: string): boolean =>
  MODULOS_MUDADOS.some((m) => linea.endsWith(`/${m.replace(/\.tsx?$/, '')}`)) ||
  linea.includes(ORIGEN) ||
  linea.includes(DESTINO) ||
  linea.includes('probe-escena/_components')

export interface Rotos {
  /** Todos los que el barrido encontró, incluidos los fixtures ajenos. */
  readonly todos: readonly string[]
  /** Los que caen adentro del radio del sprint: los únicos que se afirman. */
  readonly delSprint: readonly string[]
}

export function rotosDeLaMudanza(archivos: readonly string[]): Rotos {
  const todos = especificadoresRotos(archivos)
  return { todos, delSprint: todos.filter(esDelSprint) }
}

// ── 2 · §3 · El vínculo del destino hacia /probe-escena ─────────────────────

/** Los módulos del destino que importan un VALOR del panel, en ruta relativa. */
export function conValorDelPanel(archivos: readonly string[]): string[] {
  return enElDestino(archivos)
    .filter((a) => importaValorDe(readFileSync(a, 'utf8'), 'probe-escena'))
    .map((a) => path.relative(RAIZ, a).split(path.sep).join('/'))
}

/** Los módulos del destino que NOMBRAN al panel de alguna forma, por basename. */
export function conTipoDelPanel(archivos: readonly string[]): string[] {
  return enElDestino(archivos)
    .filter((a) => referenciasA(readFileSync(a, 'utf8'), 'probe-escena').length > 0)
    .map((a) => path.basename(a))
    .sort()
}

/**
 * EL VÍNCULO CON EL PANEL DESPUÉS DE DARLO VUELTA (SITIO-S11, §7.36).
 *
 * Los tres tipos del editor —`ChoreoEditor`, `EditableKeyframe` y
 * `KeyframeOrigin`— se declaran ahora en `_lib/escena/choreographyEditorTypes.ts`
 * y el panel los RE-EXPORTA. Las tres propiedades que hacen que eso sea un corte
 * y no una mudanza del problema se leen juntas: que el módulo nuevo no mire al
 * panel, que el panel siga sirviéndolos, y que ya no los declare.
 */
export function vinculoConElPanel(): {
  readonly panelEnLosTipos: readonly string[]
  readonly panelReExporta: boolean
  readonly panelTodaviaDeclara: boolean
} {
  const tipos = fuenteDe('src/app/v3/_lib/escena/choreographyEditorTypes.ts')
  const panel = fuenteDe('src/app/probe-escena/_components/choreographyEditor.ts')
  return {
    panelEnLosTipos: referenciasA(tipos, 'probe-escena').map((e) => e.spec),
    panelReExporta: /export type \{ ChoreoEditor, EditableKeyframe, KeyframeOrigin \}/.test(panel),
    panelTodaviaDeclara: /^export type ChoreoEditor = \{$/m.test(panel),
  }
}

// ── 3 · §7 · Quién importa la marca de la escena ────────────────────────────

export const esLaMarca = (spec: string): boolean => /\/marcaEscena$/.test(spec)

/**
 * Los consumidores de `marcaEscena.ts`. Se le pasa el corpus ya filtrado o
 * entero según qué mitad se quiera medir: el invariante afirma sobre la
 * aplicación y usa el corpus ENTERO como contrapeso, para que la exclusión de
 * los instrumentos no pueda quedar vacía sin que nadie se entere.
 */
export function consumidoresDeLaMarca(archivos: readonly string[]): string[] {
  return quienImporta(archivos, esLaMarca)
}
