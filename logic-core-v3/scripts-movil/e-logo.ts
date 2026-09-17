/**
 * MOVIL-1 · E — DÓNDE CAE EL CENTRO DEL LOGO A 390×844, en los siete keyframes.
 *
 *     npx tsx scripts-movil/e-logo.ts
 *
 * ── ⚠️ ESTO REPORTA. NO AFIRMA. Y ES LA MITAD QUE IMPORTA ─────────────────
 *
 * La instrucción del sprint lo dice con estas palabras: *«REPORTALA, NO LA
 * AFIRMES: hoy no sabemos cuál es la correcta, y escribir una afirmación ahora
 * sería clavar el defecto.»*
 *
 * Por eso este archivo es un **script**, no un invariante. No importa `afirmar`,
 * no tiene control positivo y no puede ponerse en rojo. La afirmación se escribe
 * en el sprint de composición, cuando haya una posición decidida, y entonces
 * este script deja de ser la fuente y pasa a ser el testigo del ANTES.
 *
 * ── Qué mide, exactamente ─────────────────────────────────────────────────
 *
 * El **centro horizontal de la caja de tinta del logo**, en fracción del ancho
 * del cuadro (0 = borde izquierdo, 0,5 = centro geométrico, 1 = borde derecho),
 * con el mismo muestreador que `s10-logo`, `s8-tinta` y `s16-encuadre` usan —
 * `muestrearLogo` + `cajaDelLogo`—, sobre la escena REAL. No se escribe una
 * segunda aritmética: si el encuadre cambia, este script lo sigue.
 *
 * ⚠️ **Es la caja de la TINTA, no la del mesh.** El logo puede salirse del
 * cuadro, y cuando se sale, la caja que se mide es la parte que quedó adentro —
 * por eso va también `dentro`, la fracción del logo que entra, y `toca`, si
 * toca el borde. Un centro de 0,5 con `dentro` en 0,4 no dice «está centrado»:
 * dice «lo que se ve está centrado», que es otra frase.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import {
  ESCENA_REAL,
  cajaDelLogo,
  cobertura,
  fraccionDentro,
} from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import { RAIZ_DE_SALIDAS, VENTANA } from './movil-comun'

/** La malla del muestreo. Las mismas que `s16-encuadre-soporte.ts` usa. */
const COLUMNAS = 300
const FILAS = 220

/**
 * ⚠️ **EL `factor` NO ES OPCIONAL, Y ESTE SCRIPT LO APRENDIÓ FALLANDO.**
 *
 * `muestrearLogo` con `factor = 1` muestrea EXACTAMENTE el cuadro, así que
 * `celdasDeLogo` y `enCuadro` cuentan lo mismo y `fraccionDentro` devuelve 1,000
 * siempre — un 100 % que no significa «el logo entra entero» sino «no miré
 * afuera». Y peor: la caja envolvente queda RECORTADA al cuadro, así que en los
 * keyframes donde el logo se sale, el centro daba **0,5000 exacto por
 * construcción** (x0 = −0,9967, x1 = +0,9967, la primera y la última celda). Tres
 * de los siete keyframes publicaban ese 0,5 falso.
 *
 * `2.6` es el mismo factor que usa `s16-encuadre-soporte.ts` para medir los aires
 * del hero: extiende el campo sin cambiar el tamaño de celda, así que la caja es
 * la del logo y no la del recorte.
 */
const FACTOR = 2.6

function main(): void {
  const aspecto = VENTANA.ancho / VENTANA.alto
  console.log(
    `\n  ${VENTANA.ancho}×${VENTANA.alto} — aspecto ${aspecto.toFixed(6)} · malla ${COLUMNAS}×${FILAS} · campo ×${FACTOR} · escena REAL`,
  )
  console.log('\n  #  keyframe            progreso   frameX   centroX    en px    dentro   cobertura  toca borde')
  console.log('  ─────────────────────────────────────────────────────────────────────────────────────────')

  const filas = CHOREO_KEYFRAMES.map((k, i) => {
    const m = muestrearLogo(k.at, aspecto, ESCENA_REAL, COLUMNAS, FILAS, FACTOR)
    const c = cajaDelLogo(m)
    if (c === null) {
      console.log(`  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${k.at.toFixed(3).padStart(8)}   ${k.pose.frameX.toFixed(2).padStart(6)}      (sin tinta del logo en el cuadro)`)
      return { indice: i + 1, keyframe: k.name, progreso: k.at, frameX: k.pose.frameX, centroX: null }
    }
    // El muestreador devuelve NDC en [-1, 1]. A fracción del ancho del cuadro.
    const centroNdc = (c.x0 + c.x1) / 2
    const centroX = (centroNdc + 1) / 2
    const dentro = fraccionDentro(m)
    const cob = cobertura(m)
    console.log(
      `  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${k.at.toFixed(3).padStart(8)}   ${k.pose.frameX.toFixed(2).padStart(6)}   ${centroX.toFixed(4).padStart(7)}   ${(centroX * VENTANA.ancho).toFixed(1).padStart(6)}   ${(dentro * 100).toFixed(1).padStart(5)} %   ${(cob * 100).toFixed(1).padStart(6)} %   ${m.tocaElBorde ? 'SÍ' : 'no'}`,
    )
    return {
      indice: i + 1,
      keyframe: k.name,
      progreso: k.at,
      frameX: k.pose.frameX,
      centroX,
      centroXpx: centroX * VENTANA.ancho,
      x0: c.x0,
      x1: c.x1,
      dentro,
      cobertura: cob,
      tocaElBorde: m.tocaElBorde,
    }
  })

  console.log('\n  ⚠️ NO SE AFIRMA NINGUNO DE ESTOS NÚMEROS. El encuadre en vertical es el insumo del')
  console.log('     sprint de composición; este sprint monta y degrada, y tenía PROHIBIDO componer.')
  console.log('     El centro geométrico de la pantalla es 0,5000 / 195,0 px — está en la tabla para')
  console.log('     comparar, no como objetivo: cuál es la posición correcta lo decide el humano.\n')

  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const destino = path.join(RAIZ_DE_SALIDAS, 'e-logo.json')
  writeFileSync(
    destino,
    `${JSON.stringify({ ventana: VENTANA, aspecto, malla: { COLUMNAS, FILAS, FACTOR }, cuando: new Date().toISOString(), filas }, null, 2)}\n`,
    'utf8',
  )
  console.log(`  escrito: ${destino}`)
}

main()
