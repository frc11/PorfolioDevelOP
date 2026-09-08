/**
 * B7 · FRENTE A — ¿EL SITIO HONRA `prefers-reduced-motion`? LA MEDIDA DEL
 * NAVEGADOR.
 *
 *     npx tsx scripts-b7/a-reducido.ts
 *
 * ── Qué contesta, y por qué hace falta además del invariante ──────────────
 *
 * `reducido.invariant.tsx` renderiza a HTML en el mismo proceso. Con eso alcanza
 * para decir **qué compone producción** —y desde B7 también que el camino de
 * producción produce la entrada, R7…R10— pero **no puede ver la rama `'never'`**:
 * en un render de servidor `usePrefiereMenosMovimiento` devuelve siempre su
 * snapshot conservador (`true`). O sea que el invariante no puede distinguir
 * «honra la preferencia» de «no anima nunca».
 *
 * Este archivo es el otro camino: **la preferencia la pone el ENTORNO**, por
 * `Emulation.setEmulatedMedia`, y `b7-comun` verifica con `matchMedia` desde la
 * página que llegó al documento antes de medir nada. La corrida sin la
 * preferencia es el control positivo: si ahí tampoco hay transformadas, el
 * instrumento no está midiendo el arreglo, está midiendo una página muerta.
 *
 * ── ⚠️ LA DEFINICIÓN ES LA HEREDADA, LITERAL ──────────────────────────────
 *
 * «Transformadas acumuladas» es la cuenta de elementos con `transform` en el
 * atributo `style`, **ACUMULADA sobre un barrido de media pantalla del documento
 * entero** (`scripts-b4/c-reducido-discriminador.ts`, y `CENSO_BARRIDO` de
 * `scripts-b7/lectores.ts`). No es una foto: una foto en `scrollY = 0` da 70 y
 * no 2450. Se reusa el lector, no se reescribe, porque dos definiciones producen
 * dos cifras que no se pueden comparar — y la comparación contra la Fase 0 es
 * todo el punto de este archivo.
 *
 * Los tiempos de espera son los mismos que `f0-reproduccion.ts`
 * (`esperarElPrimerCuadro` + 4 s) por la misma razón.
 *
 * ── ⚠️ LA MITAD QUE SE OLVIDA: EL CONTENIDO ───────────────────────────────
 *
 * Un patrón que no se monta puede dejar su elemento en `opacity: 0` para
 * siempre. **Un barrido que devuelva 0 transformadas Y 0 caracteres visibles es
 * un ROJO, no un verde**, y está escrito así abajo. La prueba de que la
 * preferencia se honra es que el texto esté visible y legible, no que nada se
 * mueva. `CENSO_BARRIDO` cuenta las dos cosas en la misma pasada.
 */

import { afirmar, afirmarIgual, cerrar, titulo } from '../src/app/v3/_lib/__tests__/afirmar'
import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { conLaPagina, guardarJson, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b7-comun'
import { CENSO_BARRIDO, type CensoBarrido } from './lectores'

const ANTES = [MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION]

/**
 * LAS DOS CONSULTAS, LEÍDAS DE LA MISMA PÁGINA — se PUBLICAN, no se afirman.
 *
 * `_lib/cursor.ts` declara `'(prefers-reduced-motion: reduce)'` y de ahí leen
 * los tres lectores de /v3. `useReducedMotion()` de `motion/react` —el hook en
 * el que habría delegado `reducedMotion: 'user'`— consulta
 * `"(prefers-reduced-motion)"`, la forma BOOLEANA, que es OTRA consulta.
 *
 * ⚠️ **Que sean dos consultas no implica que devuelvan dos cosas, y este bloque
 * existe para no confundirlas.** En la corrida del 2026-09-07, con
 * `Emulation.setEmulatedMedia`, las dos coincidieron en los dos sentidos
 * (`false/false` sin la preferencia, `true/true` con ella). O sea que **la
 * divergencia de consultas NO es un argumento medido contra `'user'`**: los
 * argumentos medidos contra `'user'` son los otros dos —se captura con
 * `useState` al montar y vale `null` en el servidor—, que se leen del fuente
 * instalado. El bloque queda para que una divergencia futura se vea sola.
 *
 * No se afirma nada acá: es comportamiento de la librería y del navegador, no
 * de este repo (regla 13).
 */
const LAS_DOS_CONSULTAS = `({
  laNuestra: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  laDeLaLibreria: window.matchMedia('(prefers-reduced-motion)').matches,
})`

interface LecturaDeConsultas {
  readonly laNuestra: boolean
  readonly laDeLaLibreria: boolean
}

/** El perfil de la Fase 0. Las cifras heredadas son de 1920. */
const PERFIL = '1920'

/**
 * LAS CIFRAS DE LA FASE 0, que son contra las que se compara.
 * `docs/rediseno/outputs/b7/f0-reproduccion.json`, bloque `d1`.
 */
const F0 = {
  transformadasSinLaPreferencia: 2450,
  piezasDeLineaSinLaPreferencia: 5,
  caracteresVisibles: 7104,
} as const

/** Cuánto puede moverse el contenido entre corridas sin que sea otra página. */
const TOLERANCIA_DE_CONTENIDO = 0.02

interface Corrida {
  readonly censo: CensoBarrido
  readonly consultas: LecturaDeConsultas
}

async function barrido(reducido: boolean): Promise<Corrida> {
  const perfil = perfilPorId(PERFIL)
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      const consultas = await medir<LecturaDeConsultas>(pagina, LAS_DOS_CONSULTAS)
      await medir(
        pagina,
        '(async () => { await new Promise((r) => setTimeout(r, 4000)); return true })()',
      )
      return { censo: await medir<CensoBarrido>(pagina, CENSO_BARRIDO), consultas }
    },
    { antesDelPintado: ANTES, movimientoReducido: reducido, quien: 'b7-a-reducido' },
  )
}

const cerca = (actual: number, referencia: number): boolean =>
  Math.abs(actual - referencia) / referencia <= TOLERANCIA_DE_CONTENIDO

async function principal(): Promise<void> {
  console.log(`· el barrido a ${PERFIL}, SIN la preferencia (control positivo)`)
  const corridaSin = await barrido(false)
  console.log(`· el mismo barrido CON la preferencia emulada por CDP`)
  const corridaCon = await barrido(true)
  const sin = corridaSin.censo
  const con = corridaCon.censo

  const salida = {
    perfil: PERFIL,
    consultas: { sinLaPreferencia: corridaSin.consultas, conLaPreferencia: corridaCon.consultas },
    definicion:
      'transformadas ACUMULADAS sobre un barrido de media pantalla del documento entero (CENSO_BARRIDO), la definición de scripts-b4/c-reducido-discriminador.ts',
    f0: F0,
    sinLaPreferencia: sin,
    conLaPreferencia: con,
    veredicto:
      con.conTransform === 0 && sin.conTransform > 0 && con.caracteresVisibles > 0
        ? 'ARREGLADO — con la preferencia no se monta nada y el contenido queda entero'
        : 'NO ARREGLADO',
  }
  console.log(`\n→ ${guardarJson('a-reducido', salida)}`)

  // ═══════════════════════════════════════════════════════════════════════
  titulo('A0 · La preferencia llegó al documento — las dos corridas')

  /**
   * `b7-comun` ya TIRA si no coincide, así que llegar hasta acá lo implica. Se
   * afirma igual porque una precondición que no se ve en la salida es una
   * precondición que nadie puede auditar.
   */
  afirmarIgual(con.matchMedia, true, 'con la preferencia, `matchMedia` en la página devuelve true')
  afirmarIgual(sin.matchMedia, false, 'sin la preferencia, devuelve false')
  afirmar(
    con.paradas > 1 && sin.paradas > 1,
    `y el barrido recorrió el documento entero: ${sin.paradas} paradas sin · ${con.paradas} con`,
  )

  // ═══════════════════════════════════════════════════════════════════════
  titulo('A1 · CONTROL POSITIVO — sin la preferencia el sitio SÍ se mueve')

  /**
   * Va PRIMERO a propósito. Sin esta mitad, «0 transformadas con la
   * preferencia» pasaría en verde con el sistema de motion apagado, con la
   * compuerta de 1025 mal resuelta o con la página en blanco. Es la misma
   * asimetría que R3 del invariante, medida en el navegador.
   */
  /**
   * ⚠️ **LA IDENTIDAD CON LA FASE 0 SE AFIRMA, NO SE IMPRIME.**
   *
   * Esto decía `sin.conTransform > 0` y publicaba los 2.450 de la Fase 0 en la
   * cadena de detalle: la cifra que el reporte usa como prueba de que la corrida
   * de control es la MISMA página que la medida antes vivía sólo en un renglón.
   * Una regresión que dejara el sitio animando la mitad pasaba en verde.
   *
   * El barrido es determinista —mismo perfil, mismo paso, mismos tiempos de
   * espera— así que la igualdad es exacta y se afirma como tal. Si algún día
   * deja de serlo, lo que hay que hacer es entender por qué, no ablandar el
   * predicado: un cambio en esta cifra ES un cambio en el sitio.
   */
  afirmarIgual(
    sin.conTransform,
    F0.transformadasSinLaPreferencia,
    `sin la preferencia hay ${sin.conTransform} transformadas acumuladas: el sistema ANIMA, y son las MISMAS que midió la Fase 0`,
  )
  afirmarIgual(
    sin.piezasDeLineas,
    F0.piezasDeLineaSinLaPreferencia,
    `y ${sin.piezasDeLineas} piezas de línea: el divisor CORRE, con la misma cuenta que la Fase 0`,
  )

  // ═══════════════════════════════════════════════════════════════════════
  titulo('A2 · LA TESIS — con la preferencia no se monta nada')

  afirmarIgual(con.conTransform, 0, 'con la preferencia: CERO transformadas acumuladas')
  afirmarIgual(con.piezasDeLineas, 0, '  y CERO piezas de línea: el divisor no corre')
  afirmar(
    sin.conTransform !== con.conTransform,
    'las dos corridas ya NO son idénticas — el defecto de la Fase 0 no se reproduce',
    `${sin.conTransform} sin · ${con.conTransform} con (la Fase 0 midió ${F0.transformadasSinLaPreferencia} contra ${F0.transformadasSinLaPreferencia})`,
  )

  // ═══════════════════════════════════════════════════════════════════════
  titulo('A3 · EL CONTENIDO — la mitad que se olvida')

  /**
   * ⚠️ **UN BARRIDO CON 0 TRANSFORMADAS Y 0 CARACTERES VISIBLES ES UN ROJO.**
   * Un patrón que no se monta puede dejar su elemento en `opacity: 0` para
   * siempre: eso no es honrar la preferencia, es apagar la página. La prueba es
   * que el texto esté, no que nada se mueva.
   */
  afirmar(
    con.caracteresVisibles > 0,
    `con la preferencia quedan ${con.caracteresVisibles} caracteres visibles: la página NO está apagada`,
  )
  afirmar(
    cerca(con.caracteresVisibles, F0.caracteresVisibles),
    `y está en el orden de los ${F0.caracteresVisibles} de la Fase 0 (±${TOLERANCIA_DE_CONTENIDO * 100}%)`,
    `${con.caracteresVisibles} contra ${F0.caracteresVisibles}`,
  )
  afirmar(
    cerca(con.caracteresVisibles, sin.caracteresVisibles),
    'las dos ramas sirven el MISMO contenido: la preferencia no recorta la página',
    `${sin.caracteresVisibles} sin · ${con.caracteresVisibles} con`,
  )
  afirmarIgual(con.nodosInvisibles, 0, 'y CERO nodos de texto apagados por opacidad')
  afirmarIgual(sin.nodosInvisibles, 0, '  tampoco sin la preferencia')
  if (con.nodosInvisibles > 0) {
    for (const e of con.ejemplosInvisibles) console.error(`    invisible: ${e}`)
  }

  // ═══════════════════════════════════════════════════════════════════════
  titulo('A4 · LAS DOS CONSULTAS — se publican, no se afirman (regla 13)')

  /**
   * Es la justificación EMPÍRICA de por qué el proveedor no emite
   * `reducedMotion: 'user'`. Con `'user'` la decisión pasaría a
   * `useReducedMotion()` de la librería, que consulta la forma BOOLEANA
   * `(prefers-reduced-motion)` en vez de `(prefers-reduced-motion: reduce)`.
   * Acá se leen las dos en la misma página, en las dos corridas.
   *
   * ⚠️ No se afirma porque es comportamiento del navegador y de la librería,
   * no de este repo. Se publica para que la diferencia sea un dato.
   */
  for (const [nombre, c] of [
    ['sin la preferencia', corridaSin.consultas],
    ['con la preferencia', corridaCon.consultas],
  ] as const) {
    console.log(
      `  ${nombre.padEnd(20)} (prefers-reduced-motion: reduce) = ${c.laNuestra}  ·  (prefers-reduced-motion) = ${c.laDeLaLibreria}`,
    )
  }
  if (corridaSin.consultas.laNuestra !== corridaSin.consultas.laDeLaLibreria) {
    console.log(
      '  ⚠️ LAS DOS CONSULTAS NO COINCIDEN sin la preferencia: delegar en la de la librería',
    )
    console.log(
      '     (`reducedMotion: "user"`) habría apagado el movimiento con la preferencia AUSENTE.',
    )
  }

  cerrar('a-reducido')
}

void principal()
