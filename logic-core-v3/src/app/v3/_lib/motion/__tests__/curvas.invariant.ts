/**
 * INVARIANTE — las seis curvas de GSAP.
 *
 * Corre con `npm run test:s2-curvas`.
 *
 * ── Qué se afirma, y por qué alcanza ───────────────────────────────────────
 *
 * Una curva mal escrita no rompe nada: compila, corre, y el movimiento se siente
 * "casi bien". No hay error de tipos ni de consola que la cace. Lo único que la
 * caza es comparar contra algo externo.
 *
 * Este invariante tiene tres capas, de menos a más externa:
 *
 *   C1  Forma: las seis empiezan en 0, terminan en 1 y son monótonas.
 *   C2  Fórmula: cada una coincide con su expresión escrita a mano, punto por
 *       punto, con el criterio de la medición (error máximo ≤ 0,001 sobre los
 *       21 puntos de t = 0 a 1 en pasos de 0,05).
 *   C3  **Control externo.** SCROLL.md §9.2 publica un número que no salió de
 *       acá: "el par de curvas distintas más parecido del catálogo es
 *       `power1.inOut` contra `sine.inOut`, a 0,028". Si nuestra `simetrica` no
 *       fuera `power1.inOut`, esa distancia no daría 0,028. Es la única
 *       afirmación de este archivo que no se puede satisfacer escribiendo la
 *       respuesta.
 *
 * Y una cuarta, que es una discrepancia y no una comprobación: la instrucción
 * del sprint escribe `power4.out` como `1 − (1−t)⁴`. En la nomenclatura de GSAP
 * eso es `power3.out`. C4 mide cuánto se separan las dos lecturas.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import {
  CURVAS,
  GRADO_DE_POTENCIA,
  NOMBRES_DE_CURVA,
  NOMBRE_EN_GSAP,
  PUNTOS_DE_MUESTREO,
  SINE_IN_OUT_PARA_CONTROL,
  TOLERANCIA_DE_CURVA,
  TWEENS_EN_LA_REFERENCIA,
  errorMaximo,
  type Curva,
} from '../curvas'

const casi = (a: number, b: number, tol = 1e-12): boolean => Math.abs(a - b) <= tol

// ═══════════════════════════════════════════════════════════════════════════
titulo('C1 · Forma — las seis empiezan en 0, terminan en 1, y no retroceden')

for (const nombre of NOMBRES_DE_CURVA) {
  const curva = CURVAS[nombre]
  afirmar(casi(curva(0), 0), `${nombre} (${NOMBRE_EN_GSAP[nombre]}) vale 0 en t=0`)
  afirmar(casi(curva(1), 1), `  y vale 1 en t=1`)

  let monotona = true
  for (let i = 1; i < PUNTOS_DE_MUESTREO.length; i++) {
    if (curva(PUNTOS_DE_MUESTREO[i]) < curva(PUNTOS_DE_MUESTREO[i - 1])) monotona = false
  }
  afirmar(monotona, `  y no retrocede en ningún punto — el patrón es reversible sin rebotes`)
}

controlPositivo(
  'la comprobación de monotonía ve una curva que SÍ retrocede',
  (t: number) => Math.sin(t * Math.PI),
  (curva: Curva) => {
    for (let i = 1; i < PUNTOS_DE_MUESTREO.length; i++) {
      if (curva(PUNTOS_DE_MUESTREO[i]) < curva(PUNTOS_DE_MUESTREO[i - 1])) return false
    }
    return true
  },
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('C2 · Fórmula — cada una contra su expresión, con el criterio de 0,001')

afirmarIgual(GRADO_DE_POTENCIA.power1, 2, 'power1 es la CUADRÁTICA (grado 2)')
afirmarIgual(GRADO_DE_POTENCIA.power2, 3, 'power2 es la cúbica (grado 3)')
afirmarIgual(GRADO_DE_POTENCIA.power4, 5, 'power4 es la QUÍNTICA (grado 5) — no la cuártica')

const escritasAMano: Readonly<Record<string, Curva>> = {
  principal: (t) => 1 - (1 - t) * (1 - t),
  entrada: (t) => t * t,
  simetrica: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
  'salida-fuerte': (t) => 1 - Math.pow(1 - t, 5),
  lineal: (t) => t,
  'simetrica-suave': (t) => (t < 0.5 ? 4 * t * t * t : 1 - 4 * Math.pow(1 - t, 3)),
}

for (const nombre of NOMBRES_DE_CURVA) {
  const error = errorMaximo(CURVAS[nombre], escritasAMano[nombre])
  afirmar(
    error <= TOLERANCIA_DE_CURVA,
    `${nombre} coincide con su fórmula`,
    `error máximo ${error.toFixed(9)}`,
  )
}

controlPositivo(
  'el comparador ve dos curvas DISTINTAS (principal contra entrada)',
  CURVAS.entrada,
  (otra: Curva) => errorMaximo(CURVAS.principal, otra) <= TOLERANCIA_DE_CURVA,
)

// La aproximación por cubic-bezier que el sprint prohíbe: se mide cuánto se
// separa, para que quede escrito que la prohibición tiene un número detrás.
const cubicBezier = (p1x: number, p1y: number, p2x: number, p2y: number): Curva => {
  const bezier = (a: number, b: number, t: number): number => {
    const u = 1 - t
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t
  }
  return (x) => {
    // Newton sobre el eje x para despejar el parámetro, 24 pasos: de sobra.
    let t = x
    for (let i = 0; i < 24; i++) {
      const ex = bezier(p1x, p2x, t) - x
      const d =
        3 * (1 - t) * (1 - t) * p1x + 6 * (1 - t) * t * (p2x - p1x) + 3 * t * t * (1 - p2x)
      if (Math.abs(d) < 1e-9) break
      t -= ex / d
    }
    return bezier(p1y, p2y, t)
  }
}

const errorDelBezier = errorMaximo(CURVAS.principal, cubicBezier(0.25, 0.46, 0.45, 0.94))
afirmar(
  errorDelBezier > TOLERANCIA_DE_CURVA,
  'la ease-out-quad del repo NO es power1.out: aproximarla con cubic-bezier no pasa el criterio',
  `error máximo ${errorDelBezier.toFixed(6)} contra una tolerancia de ${TOLERANCIA_DE_CURVA}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('C3 · CONTROL EXTERNO — la distancia publicada por la medición')

const distanciaSimetricaSine = errorMaximo(CURVAS.simetrica, SINE_IN_OUT_PARA_CONTROL)
afirmar(
  Math.abs(distanciaSimetricaSine - 0.028) < 0.0005,
  'simetrica contra sine.inOut da los 0,028 que publicó SCROLL.md §9.2',
  `medido acá: ${distanciaSimetricaSine.toFixed(6)}`,
)
afirmar(
  distanciaSimetricaSine > TOLERANCIA_DE_CURVA * 20,
  '  y esa distancia es 28 veces la tolerancia: el criterio discrimina con margen',
  `${(distanciaSimetricaSine / TOLERANCIA_DE_CURVA).toFixed(1)}×`,
)

controlPositivo(
  'la distancia contra uno mismo es cero — el comparador no inventa diferencias',
  CURVAS.simetrica,
  (otra: Curva) => errorMaximo(CURVAS.simetrica, otra) > TOLERANCIA_DE_CURVA,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('C4 · La discrepancia de la instrucción: cuártica contra quíntica')

const cuartica: Curva = (t) => 1 - Math.pow(1 - t, 4)
const separacion = errorMaximo(CURVAS['salida-fuerte'], cuartica)
afirmar(
  separacion > TOLERANCIA_DE_CURVA,
  'la cuártica de la instrucción y la quíntica de SCROLL.md son curvas distintas',
  `separación máxima ${separacion.toFixed(6)} — ${(separacion / TOLERANCIA_DE_CURVA).toFixed(0)}× la tolerancia`,
)
afirmar(
  errorMaximo(cuartica, (t) => 1 - Math.pow(1 - t, GRADO_DE_POTENCIA.power3)) === 0,
  '  y la cuártica de la instrucción ES power3.out en la nomenclatura de GSAP',
)
console.log(
  `  en t=0,5: quíntica ${CURVAS['salida-fuerte'](0.5).toFixed(5)} · cuártica ${cuartica(0.5).toFixed(5)}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('C5 · El vocabulario es de SEIS y su reparto es el medido')

afirmarIgual(NOMBRES_DE_CURVA.length, 6, 'el vocabulario tiene seis curvas')
const totalDeTweens = NOMBRES_DE_CURVA.reduce((n, c) => n + TWEENS_EN_LA_REFERENCIA[c], 0)
afirmarIgual(totalDeTweens, 278, 'las seis explican los 278 tweens autorales de la referencia')
afirmar(
  TWEENS_EN_LA_REFERENCIA.principal / totalDeTweens > 0.84,
  'y power1.out sola cubre más del 84 %',
  `${((TWEENS_EN_LA_REFERENCIA.principal / totalDeTweens) * 100).toFixed(1)} %`,
)

cerrar('curvas.invariant')
