/**
 * BANCO DE ANCHO-1 — la plomería del bloque «el vacío», y nada más.
 *
 * ── Qué hereda, y de dónde ────────────────────────────────────────────────
 *
 * Todo lo resuelto se importa tal cual y no se copia: el cliente de CDP, la
 * receta ejecutable y la captura (`scripts-b4/`), el puente de automatización y
 * el ocultamiento (`scripts-b8/`), el asentamiento del home con reintentos y la
 * silueta del logo (`scripts-b11/`, `scripts-b5/`). **La máscara del logo es la
 * de `siluetaMasGrande` con los umbrales de `scripts-b8/c-bloques.ts`**, que es
 * la que `s10-logo` nombra y con la que B8 y B11 publicaron sus cifras. Medir
 * con otra copia sería medir con otra vara.
 *
 * ── Lo propio ─────────────────────────────────────────────────────────────
 *
 * El puerto (3000, el de la receta y el de ESTE worktree), el perfil de Chrome
 * (`ancho1`: dos procesos sobre el mismo `userDataDir` y el segundo no arranca),
 * **los seis anchos en sus dos regímenes de alto** y la carpeta temporal, que
 * acá vive FUERA del árbol: el dev server vigila el repo y una captura escrita
 * adentro lo hace recompilar en medio de la medición.
 *
 * ── ⚠ LOS DOS REGÍMENES DE ALTO, y por qué son dos ────────────────────────
 *
 * `s10-referencias.ts` es explícito: *«el alto no es una propiedad del ancho»*,
 * y declara los altos aparte con la fuente de cada uno. Este bloque barre el
 * eje del ANCHO, así que necesita las dos lecturas:
 *
 *   · **régimen de alto FIJO (900)** — los seis anchos con el alto de
 *     referencia de escritorio de S0 (`ALTOS_DECLARADOS`, el alto con el que se
 *     compuso todo). Es la única forma honesta de barrer el ancho: con un solo
 *     alto declarado, la única variable es la que la instrucción pregunta.
 *   · **régimen de PARES DECLARADOS** — los viewports que este repo ya midió o
 *     ya publica, cada uno con su procedencia. **1600 no tiene par declarado en
 *     ningún archivo del repo y por eso NO entra en este régimen**, en vez de
 *     emparejarlo a ojo.
 */

import { mkdirSync } from 'node:fs'
import path from 'node:path'

import type { Perfil } from '../scripts-b4/perfiles'
import { perfilPorId } from '../scripts-b4/perfiles'

export { asentarElHome } from '../scripts-b11/b11-comun'
export { cuatro, dos, SELECTOR_DE_LA_ESCENA, type Sesion } from '../scripts-b8/b8-comun'

/** 3000: el puerto de ESTA sesión y de la receta canónica. */
export const ORIGEN = 'http://localhost:3000'

/** Las salidas del bloque, dentro del árbol. Se escriben con el navegador CERRADO. */
export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/ancho1'

/** A donde van las capturas del reporte. Idem: con el navegador cerrado. */
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/ancho1'

/**
 * Las capturas intermedias, FUERA del árbol.
 *
 * B11 las mandaba a `.b11-capturas/` con una línea de `.gitignore`; acá van al
 * scratchpad de la sesión, que no está en el repo: este sprint tiene prohibido
 * construir, y eso incluye agregar una línea a `.gitignore`.
 */
export const TEMP = path.join(
  process.env.TEMP ?? process.env.TMP ?? '.',
  'ancho1-capturas',
)

const base = (ancho: number, alto: number, procedencia: string): Perfil => ({
  id: `${ancho}x${alto}`,
  nombre: `${ancho}×${alto}`,
  procedencia,
  ancho,
  alto,
  dpr: 1,
  movil: false,
  tactil: false,
  debajoDelUmbral: ancho < 1025,
})

/** El alto de referencia de escritorio de S0 (`ALTOS_DECLARADOS`, §7.28). */
export const ALTO_FIJO = 900

const FUENTE_DEL_ALTO_FIJO =
  'el alto de referencia de escritorio de S0, con el que se compuso todo (`_lib/__tests__/s10-referencias.ts`, `ALTOS_DECLARADOS`)'

/** Los seis anchos de la instrucción, con UN alto declarado. Barre el ancho solo. */
export const REGIMEN_ALTO_FIJO: readonly Perfil[] = [1024, 1280, 1440, 1600, 1920, 2560].map((w) =>
  base(w, ALTO_FIJO, `ancho de la instrucción de ANCHO-1 · alto ${ALTO_FIJO}: ${FUENTE_DEL_ALTO_FIJO}`),
)

/**
 * Los pares que este repo declara. Cada alto cita el archivo que lo fija.
 * **1600 no está**: no hay un solo archivo del repo que le declare un alto.
 */
export const REGIMEN_PARES: readonly Perfil[] = [
  base(1024, 768, '`scripts-b4/perfiles.ts` — «justo abajo del umbral», 1024×768'),
  base(1280, 800, '`src/components/layout/home-intro/introLanding.invariant.ts:48-52` — una de las tres ventanas del aterrizaje'),
  perfilPorId('1440'),
  perfilPorId('1920'),
  base(2560, 1440, '`scripts-b11/b11-comun.ts`, `PERFIL_2560` — «el ancho del peor caso del hero» (`MEDICION-NAVEGADOR.md` §1 paso 2)'),
]

export const TODOS: readonly Perfil[] = [
  ...REGIMEN_ALTO_FIJO,
  ...REGIMEN_PARES.filter((p) => !REGIMEN_ALTO_FIJO.some((q) => q.ancho === p.ancho && q.alto === p.alto)),
]

export function perfilDeAncho1(id: string): Perfil {
  const p = TODOS.find((x) => x.id === id || `${x.ancho}x${x.alto}` === id)
  if (p === undefined) throw new Error(`ANCHO-1 no declara el perfil «${id}». Los que hay: ${TODOS.map((x) => x.id).join(', ')}`)
  return p
}

export function asegurarCarpetas(): void {
  mkdirSync(TEMP, { recursive: true })
}

export function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}

/** Un número a n decimales, para que las tablas no publiquen dieciséis cifras. */
export function red(valor: number, decimales: number): number {
  const f = 10 ** decimales
  return Math.round(valor * f) / f
}
