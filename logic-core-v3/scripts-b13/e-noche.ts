/**
 * E · LA NOCHE, PUNTO POR PUNTO — el afinado del valor y el control de la rampa.
 *
 *     npx tsx scripts-b13/e-noche.ts
 *     npx tsx scripts-b13/e-noche.ts --afinar=0.08,0.20,0.005
 *
 * ── Las dos preguntas que el barrido grueso deja abiertas ─────────────────
 *
 * 1. **Cuánto exactamente.** `a-barrido.ts` mide en saltos y la vara del valor
 *    no la pone el gusto: la pone la referencia. Su barra está entre **1,92:1 y
 *    7,90:1** contra su sala, con mediana **2,9:1** (`b-referencia.ts`). Acá se
 *    busca la emisiva que deja al logo en esa banda **sin bajar de AA la tinta
 *    CLARA que Trabajos escribe encima** — que es la restricción que la sección
 *    invertida impone y que ninguna otra tiene.
 * 2. **Qué pasa en la rampa.** La emisión sube durante el atardecer y baja en
 *    la vuelta. En el medio la sala pasa por valores intermedios, y ahí el logo
 *    podría quedar del mismo valor que su fondo: un cruce en el que la pieza
 *    desaparece durante unos cuadros. Se barre la ventana entera y se publica
 *    el MÍNIMO de contraste logo/sala y dónde cae.
 */

import { razonDeContraste } from '../src/app/v3/_lib/__tests__/afirmar'
import { muestrearCuadro, percentil, vistaEn } from '../src/app/v3/_lib/escena/__tests__/cuadro'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL, cobertura, gris, percentilDe } from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import { emisionDelLogoEn } from '../src/app/v3/_lib/escena/logoEmision'
import { ATARDECER, NOCHE, VUELTA } from '../src/app/v3/_lib/escena/lightArc'
import { levelAt } from '../src/app/probe-escena/__tests__/shading'

import { argumento, escribirJson, red } from './b13-comun'

const ASPECTO = 16 / 9
const AA = 4.5
/** La tinta clara de Trabajos: el papel dado vuelta. */
const TINTA_CLARA = '#F7F7F5'
/** El progreso en el que Trabajos llena el cuadro: la pose donde se afina. */
const TRABAJOS = 0.5

/** La banda de la referencia: contraste de su barra contra su sala. */
const REFERENCIA = { min: 1.92, mediana: 2.9, max: 7.9 } as const

interface Fila {
  readonly emisiva: number
  readonly logoP50: number
  readonly salaP50: number
  readonly logoContraLaSala: number
  readonly tintaClaraEncima: number
  readonly enLaBandaDeLaReferencia: boolean
  readonly tintaClaraPasaAA: boolean
}

function medir(progreso: number, emisiva: number): Fila {
  const m = muestrearLogo(progreso, ASPECTO, ESCENA_REAL, 300, 220, 2.6, undefined, emisiva)
  const ordenados = m.valor.slice()
  ordenados.sort()
  const logoP50 = percentilDe(ordenados, 0.5)
  const peorParaLaClara = percentilDe(ordenados, 1)
  const h = muestrearCuadro(progreso, vistaEn(progreso), ESCENA_REAL, 200, 113)
  const salaP50 = percentil(h.sinLogo, 0.5)
  const c = razonDeContraste(gris(logoP50), gris(salaP50))
  const t = razonDeContraste(TINTA_CLARA, gris(peorParaLaClara))
  return {
    emisiva: red(emisiva, 4),
    logoP50: red(logoP50, 1),
    salaP50: red(salaP50, 1),
    logoContraLaSala: red(c, 2),
    tintaClaraEncima: red(t, 2),
    enLaBandaDeLaReferencia: c >= REFERENCIA.min && c <= REFERENCIA.max,
    tintaClaraPasaAA: t >= AA,
  }
}

function principal(): void {
  const [desde, hasta, paso] = argumento('afinar', '0.02,0.30,0.005').split(',').map(Number)
  console.log(
    `AFINADO en Trabajos (p=${TRABAJOS}, nivel ${red(levelAt(TRABAJOS), 4)}) — la vara es la referencia: ` +
      `su barra da ${REFERENCIA.min}:1 a ${REFERENCIA.max}:1 contra su sala, mediana ${REFERENCIA.mediana}:1`,
  )
  console.log('  emisiva | logo | sala | logo/sala | tinta CLARA encima | ¿en la banda? ¿AA?')
  const filas: Fila[] = []
  for (let e = desde; e <= hasta + 1e-9; e += paso) {
    const f = medir(TRABAJOS, e)
    filas.push(f)
    console.log(
      `  ${f.emisiva.toFixed(3).padStart(7)} | ${f.logoP50.toFixed(1).padStart(5)} | ${f.salaP50.toFixed(1).padStart(4)} | ` +
        `${f.logoContraLaSala.toFixed(2).padStart(9)} | ${f.tintaClaraEncima.toFixed(2).padStart(18)} | ` +
        `${f.enLaBandaDeLaReferencia ? 'banda ' : '      '}${f.tintaClaraPasaAA ? 'AA' : '  '}`,
    )
  }

  const validas = filas.filter((f) => f.enLaBandaDeLaReferencia && f.tintaClaraPasaAA)
  if (validas.length === 0) {
    console.log('\n  🔴 NINGUNA emisiva cumple las dos: la banda de la referencia y AA para la tinta clara.')
  } else {
    const cercaDeLaMediana = validas.reduce((a, b) =>
      Math.abs(b.logoContraLaSala - REFERENCIA.mediana) < Math.abs(a.logoContraLaSala - REFERENCIA.mediana) ? b : a,
    )
    console.log(
      `\n  ✅ ${validas.length} valores cumplen las dos (${validas[0].emisiva} a ${validas[validas.length - 1].emisiva}). ` +
        `El más cercano a la mediana de la referencia: emisiva ${cercaDeLaMediana.emisiva} → ` +
        `logo ${cercaDeLaMediana.logoP50} sobre sala ${cercaDeLaMediana.salaP50} = ${cercaDeLaMediana.logoContraLaSala}:1 ` +
        `· tinta clara encima ${cercaDeLaMediana.tintaClaraEncima}:1`,
    )
  }

  // ── La rampa entera: atardecer → noche → vuelta ──────────────────────────
  console.log('\nLA RAMPA, con la curva puesta (emisión = `emisionDelLogoEn(nivel)`):')
  console.log('  progreso | nivel  | emisiva | %cuadro | logo | sala | logo/sala | tinta CLARA')
  const rampa: unknown[] = []
  let peor = { progreso: 0, contraste: Infinity }
  const desdeP = ATARDECER.desde - 0.01
  const hastaP = VUELTA.hasta + 0.01
  for (let p = desdeP; p <= hastaP + 1e-9; p += 0.005) {
    const progreso = red(p, 6)
    const nivel = levelAt(progreso)
    const emisiva = emisionDelLogoEn(nivel)
    const m = muestrearLogo(progreso, ASPECTO, ESCENA_REAL, 220, 160, 2.6, undefined, emisiva)
    const ordenados = m.valor.slice()
    ordenados.sort()
    const logoP50 = percentilDe(ordenados, 0.5)
    const h = muestrearCuadro(progreso, vistaEn(progreso), ESCENA_REAL, 200, 113)
    const salaP50 = percentil(h.sinLogo, 0.5)
    const c = razonDeContraste(gris(logoP50), gris(salaP50))
    const t = razonDeContraste(TINTA_CLARA, gris(percentilDe(ordenados, 1)))
    if (c < peor.contraste) peor = { progreso, contraste: c }
    rampa.push({ progreso, nivel: red(nivel, 4), emisiva: red(emisiva, 4), coberturaPct: red(cobertura(m) * 100, 2), logoP50: red(logoP50, 1), salaP50: red(salaP50, 1), logoContraLaSala: red(c, 2), tintaClaraEncima: red(t, 2) })
    console.log(
      `  ${progreso.toFixed(4)} | ${nivel.toFixed(4)} | ${emisiva.toFixed(4)} | ${(cobertura(m) * 100).toFixed(2).padStart(7)} | ` +
        `${logoP50.toFixed(1).padStart(5)} | ${salaP50.toFixed(1).padStart(5)} | ${c.toFixed(2).padStart(9)} | ${t.toFixed(2).padStart(10)}`,
    )
  }
  console.log(
    `\n  El MÍNIMO de contraste logo/sala en toda la rampa: ${peor.contraste.toFixed(2)}:1 en p=${peor.progreso.toFixed(4)} ` +
      `(la noche declarada va de ${NOCHE.desde} a ${NOCHE.hasta})`,
  )

  console.log(`\nescrito: ${escribirJson('noche-afinado', { referencia: REFERENCIA, trabajos: TRABAJOS, afinado: filas, rampa, peor })}`)
}

principal()
