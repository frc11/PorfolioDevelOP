/**
 * VERTICAL-1 · D — LA SUPERPOSICIÓN LOGO/COLUMNA A 390×844, keyframe por
 * keyframe, con `frameX` barrido.
 *
 *     npx tsx scripts-vertical/d-superposicion.ts
 *
 * ── Qué instrumento usa, y por qué NO se agrega 390 a `VENTANAS` ──────────
 *
 * Usa los MISMOS tres de `s10-logo` §4: `mayorCaja(id, ancho)` para la caja de
 * texto —derivada del marcado real, con los avances reales de la `.woff2` y las
 * variantes resueltas al ancho—, `muestra(progreso, aspecto)` para la máscara del
 * logo, y `barridoVertical` para la superposición MÍNIMA sobre todas las alturas
 * posibles del bloque.
 *
 * ⚠️ **Lo que NO se hace, y es deliberado: agregar `{390, 844}` a `VENTANAS`.**
 * Ese arreglo es de una línea y haría que las cuatro tablas de `s10-logo`
 * reportaran a 390 sin tocar nada más. **Y pondría `s10-logo` §3 en rojo**, que
 * afirma `peorFraccionDentro >= 1` sobre 32 muestras: a 390 el logo NO entra
 * entero (medido en `a-geometria.ts`), así que sumar la ventana rompería una
 * afirmación que hoy es verdadera de escritorio. Eso no es destapar el hueco, es
 * romper el gate. El hueco se destapa con un invariante PROPIO, que es lo que
 * este sprint escribe.
 *
 * ── Por qué la MÍNIMA y no la superposición de hoy ───────────────────────
 *
 * Porque es el criterio que `s10-logo` §4 ya usa y el que la instrucción del
 * sprint nombra: la mínima sobre el barrido vertical contesta **«¿existe alguna
 * altura a la que el bloque de texto no toque el logo?»**. Un 0 % ahí significa
 * que la composición es posible; un número mayor que cero significa que **no
 * existe** esa altura, y entonces el conflicto no lo resuelve mover el texto.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { MAPEO_DE_LAS_SECCIONES } from '../src/app/v3/_lib/escena/recorrido'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import { aCuadroAlto, aCuadroX } from '../src/app/v3/_lib/escena/__tests__/s10-logo-cajas'
import { ESCENA_REAL, barridoVertical, mayorCaja, superposicion } from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import { ASPECTO, FACTOR, MALLA_BARRIDO, MALLA_FINA, PISTA_DE_HOY, RAIZ_DE_SALIDAS, VENTANA, cuatro, pistaCon } from './vertical-comun'

/** 41 valores de −1 a +1: el rango legal de la perilla, en pasos de 0,05. */
const BARRIDO = Array.from({ length: 41 }, (_, i) => -1 + i * 0.05)

/** Las secciones TRANSPARENTES en pantalla en un progreso, con la que llena marcada. */
function seccionesEn(progreso: number): { readonly id: string; readonly llena: boolean; readonly transparente: boolean }[] {
  return MAPEO_DE_LAS_SECCIONES.filter((s) => progreso >= s.seVeDesde && progreso <= s.seVeHasta).map((s) => ({
    id: s.id,
    llena: progreso >= s.llenaDesde && progreso <= s.llenaHasta,
    transparente: s.dejaVerLaEscena,
  }))
}

function main(): void {
  console.log(`\n  ${VENTANA.ancho}×${VENTANA.alto} — aspecto ${ASPECTO.toFixed(6)} · la columna de texto a 390 es UNA sola, x=32 w=326 en las ocho\n`)
  console.log('   #  keyframe            p       sección medida        caja        banda x        alto    sup.MÍNIMA  máx    centrada')
  console.log('   ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────')

  const filas = CHOREO_KEYFRAMES.map((k, i) => {
    const enPantalla = seccionesEn(k.at)
    const transparentes = enPantalla.filter((s) => s.transparente)
    const llena = enPantalla.find((s) => s.llena)
    const m = muestrearLogo(k.at, ASPECTO, ESCENA_REAL, MALLA_FINA.columnas, MALLA_FINA.filas, FACTOR, PISTA_DE_HOY)

    const medidas = transparentes.map((s) => {
      const caja = mayorCaja(s.id, VENTANA.ancho)
      const x0 = aCuadroX(caja.banda.izquierda, VENTANA.ancho)
      const x1 = aCuadroX(caja.banda.izquierda + caja.banda.ancho, VENTANA.ancho)
      const alto = aCuadroAlto(caja.altoPx, VENTANA.alto)
      const b = barridoVertical(m, x0, x1, alto, 100)
      const centrada = superposicion(m, { x0, x1, y0: -alto / 2, y1: alto / 2 }).fraccion
      console.log(
        `  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${k.at.toFixed(3)}  ${s.id.padEnd(18)}${s.llena ? '*' : ' '} ${caja.etiqueta.padEnd(4)} [${x0.toFixed(3)} … ${x1.toFixed(3)}]  ${alto.toFixed(4)}   ${(b.minima * 100).toFixed(1).padStart(6)} %  ${(b.maxima * 100).toFixed(0).padStart(3)} %  ${(centrada * 100).toFixed(0).padStart(4)} %`,
      )
      return { seccion: s.id, llena: s.llena, caja: caja.etiqueta, x0: cuatro(x0), x1: cuatro(x1), alto: cuatro(alto), minima: b.minima, maxima: b.maxima, centrada }
    })
    if (medidas.length === 0) {
      console.log(`  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${k.at.toFixed(3)}  (ninguna sección transparente en pantalla)`)
    }
    return { indice: i + 1, keyframe: k.name, progreso: k.at, frameX: k.pose.frameX, llena: llena?.id ?? null, llenaEsTransparente: llena?.transparente ?? null, medidas }
  })

  console.log('\n  * = la sección que LLENA el cuadro en ese progreso.\n')

  // ── El barrido: ¿algún frameX baja la mínima? ────────────────────────────
  console.log('  ¿ALGÚN `frameX` BAJA LA SUPERPOSICIÓN MÍNIMA? — barrido de −1 a +1 sobre la sección que llena\n')
  console.log('   #  keyframe            sección           hoy      mejor    en frameX   peor     ¿el barrido la mueve?')
  console.log('   ──────────────────────────────────────────────────────────────────────────────────────────────────────')
  const barridos = CHOREO_KEYFRAMES.map((k, i) => {
    const llena = seccionesEn(k.at).find((s) => s.llena)
    const id = llena?.transparente === true ? llena.id : (seccionesEn(k.at).filter((s) => s.transparente).at(-1)?.id ?? null)
    if (id === null) {
      console.log(`  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} (ninguna transparente)`)
      return { indice: i + 1, keyframe: k.name, seccion: null, muestras: [] }
    }
    const caja = mayorCaja(id, VENTANA.ancho)
    const x0 = aCuadroX(caja.banda.izquierda, VENTANA.ancho)
    const x1 = aCuadroX(caja.banda.izquierda + caja.banda.ancho, VENTANA.ancho)
    const alto = aCuadroAlto(caja.altoPx, VENTANA.alto)
    const muestras = BARRIDO.map((fx) => {
      const mm = muestrearLogo(k.at, ASPECTO, ESCENA_REAL, MALLA_BARRIDO.columnas, MALLA_BARRIDO.filas, FACTOR, pistaCon({ [k.name]: fx }))
      return { frameX: fx, minima: barridoVertical(mm, x0, x1, alto, 100).minima }
    })
    const mejor = muestras.reduce((a, b) => (b.minima < a.minima ? b : a))
    const peor = muestras.reduce((a, b) => (b.minima > a.minima ? b : a))
    const deHoy = muestras.find((s) => Math.abs(s.frameX - k.pose.frameX) < 1e-9)
    const mueve = peor.minima - mejor.minima > 1e-6
    console.log(
      `  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${id.padEnd(17)} ${((deHoy?.minima ?? Number.NaN) * 100).toFixed(1).padStart(5)} %  ${(mejor.minima * 100).toFixed(1).padStart(5)} %   ${mejor.frameX.toFixed(2).padStart(6)}    ${(peor.minima * 100).toFixed(1).padStart(5)} %   ${mueve ? 'sí' : 'NO — plana en todo el barrido'}`,
    )
    return { indice: i + 1, keyframe: k.name, seccion: id, frameXdeHoy: k.pose.frameX, deHoy: deHoy?.minima ?? null, mejor, peor, mueve, muestras }
  })

  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const destino = path.join(RAIZ_DE_SALIDAS, 'd-superposicion.json')
  writeFileSync(destino, `${JSON.stringify({ ventana: VENTANA, aspecto: ASPECTO, cuando: new Date().toISOString(), filas, barridos }, null, 2)}\n`, 'utf8')
  console.log(`\n  escrito: ${destino}`)
}

main()
