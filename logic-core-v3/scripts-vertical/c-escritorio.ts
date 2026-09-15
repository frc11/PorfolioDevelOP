/**
 * VERTICAL-1 · C — CUÁNTA LIBERTAD DEJA ESCRITORIO, que es lo que decide si
 * este sprint puede tocar `frameX` siquiera.
 *
 *     npx tsx scripts-vertical/c-escritorio.ts
 *
 * ── ⚠️ EL HECHO ESTRUCTURAL QUE OBLIGA A MEDIR ESTO PRIMERO ───────────────
 *
 * **`frameX` vive en la POSE, y la pose no sabe de aspecto.** `aimWithFraming`
 * recibe el aspecto y lo usa para calcular el RECORRIDO disponible, pero el
 * coeficiente que multiplica ese recorrido —`frameX`— es un solo número para
 * todas las ventanas. O sea que **cualquier valor que se elija para 390 mueve
 * también 1440 y 1920**, que están cerrados.
 *
 * La instrucción del sprint lo pone como condición de parada: *«confirmá que
 * 1440 y 1920 NO se movieron… Si escritorio se movió, frená: la perilla no debía
 * tocarlo»*. Y nombra la prueba concreta: `s10-logo` en sus 8 renglones, la
 * mínima en 0 % en los 8, y las tres en 0 % a 1440×900 p=0.
 *
 * Así que la pregunta previa no es «qué `frameX` queda lindo a 390» sino **«¿hay
 * algún `frameX` distinto del de hoy que escritorio tolere?»**. Este script la
 * contesta: barre `frameX` y, para cada valor, mide si el logo sigue entrando
 * ENTERO en todos los cuadros de escritorio — que es lo que afirma §3 de
 * `s10-logo.invariant.ts` (`peorFraccionDentro >= 1`, sobre 32 muestras).
 *
 * Si el rango tolerado es un solo punto, la respuesta del sprint es que `frameX`
 * NO es la palanca, y eso es un hallazgo con su número.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL, VENTANAS, fraccionDentro } from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import { ASPECTO, FACTOR, MALLA_BARRIDO, RAIZ_DE_SALIDAS, cuatro, pistaCon } from './vertical-comun'

/**
 * Los cuadros de escritorio. Los cuatro de `s10-logo-lectura` —que son los que
 * §3 afirma— MÁS 1920×1080, que la instrucción nombra y que aquella tabla no
 * tiene. No se escriben a mano los cuatro: se importan.
 */
const ESCRITORIO = [
  ...VENTANAS.map((v) => ({ etiqueta: v.etiqueta, aspecto: v.aspecto })),
  { etiqueta: '1920×1080', aspecto: 1920 / 1080 },
]

/** 81 valores de −2 a +2, el mismo barrido que `a-geometria.ts`. */
const BARRIDO = Array.from({ length: 81 }, (_, i) => -2 + i * 0.05)

function dentroEn(nombre: string, progreso: number, frameX: number, aspecto: number): number {
  const pista = pistaCon({ [nombre]: frameX })
  return fraccionDentro(
    muestrearLogo(progreso, aspecto, ESCENA_REAL, MALLA_BARRIDO.columnas, MALLA_BARRIDO.filas, FACTOR, pista),
  )
}

function main(): void {
  console.log(`\n  CUADROS DE ESCRITORIO: ${ESCRITORIO.map((v) => `${v.etiqueta} (${v.aspecto.toFixed(3)})`).join(' · ')}`)
  console.log(`  contra la vertical del sprint: 390×844 (${ASPECTO.toFixed(3)})\n`)
  console.log('   #  keyframe            hoy     rango de `frameX` que escritorio tolera (logo ENTERO en los 5 cuadros)')
  console.log('   ─────────────────────────────────────────────────────────────────────────────────────────────────────')

  const filas = CHOREO_KEYFRAMES.map((k, i) => {
    const tolerados: number[] = []
    for (const fx of BARRIDO) {
      if (ESCRITORIO.every((v) => dentroEn(k.name, k.at, fx, v.aspecto) >= 0.99999)) tolerados.push(fx)
    }
    // El rango contiguo que CONTIENE el valor de hoy: un valor tolerado aislado
    // del otro lado no sirve, porque el recorrido tendría que pasar por el medio.
    let lo = k.pose.frameX
    let hi = k.pose.frameX
    if (tolerados.length > 0) {
      const paso = 0.05 + 1e-9
      const cerca = tolerados.filter((x) => Math.abs(x - k.pose.frameX) < 2.001)
      lo = k.pose.frameX
      hi = k.pose.frameX
      for (const x of [...cerca].sort((a, b) => a - b)) {
        if (x <= lo && lo - x <= paso) lo = x
      }
      for (const x of [...cerca].sort((a, b) => b - a)) {
        if (x >= hi && x - hi <= paso) hi = x
      }
      // Segunda pasada: expandir hasta donde la cadena de tolerados no se corte.
      let cambio = true
      while (cambio) {
        cambio = false
        for (const x of cerca) {
          if (x < lo && lo - x <= paso) {
            lo = x
            cambio = true
          }
          if (x > hi && x - hi <= paso) {
            hi = x
            cambio = true
          }
        }
      }
    }
    const hoyTolerado = tolerados.some((x) => Math.abs(x - k.pose.frameX) < 1e-9)
    const ancho = hi - lo
    console.log(
      `  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${k.pose.frameX.toFixed(2).padStart(5)}   ${
        tolerados.length === 0
          ? '(NINGUNO — ni el de hoy: el barrido no cae en la grilla)'
          : `[${lo.toFixed(2)} … ${hi.toFixed(2)}]  ancho ${ancho.toFixed(2)}  ·  ${tolerados.length}/${BARRIDO.length} valores tolerados en todo el barrido`
      }${hoyTolerado ? '' : '   ⚠️ el de HOY no está en la lista'}`,
    )
    return { nombre: k.name, progreso: k.at, frameXdeHoy: k.pose.frameX, hoyTolerado, rango: [cuatro(lo), cuatro(hi)], ancho: cuatro(ancho), tolerados: tolerados.map(cuatro) }
  })

  console.log('\n  ⚠️ `frameX` es UN número para todas las ventanas: lo que se elija acá vale también a 1440 y 1920.')
  console.log('     Si el rango tolerado es estrecho, la perilla no alcanza y hace falta otra — y eso es el hallazgo.\n')

  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const destino = path.join(RAIZ_DE_SALIDAS, 'c-escritorio.json')
  writeFileSync(destino, `${JSON.stringify({ escritorio: ESCRITORIO, aspectoVertical: ASPECTO, cuando: new Date().toISOString(), filas }, null, 2)}\n`, 'utf8')
  console.log(`  escrito: ${destino}`)
}

main()
