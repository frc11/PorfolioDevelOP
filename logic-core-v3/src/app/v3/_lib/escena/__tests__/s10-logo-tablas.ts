/**
 * LAS TABLAS DEL FRENTE DEL LOGO — las filas que el invariante imprime, y las
 * banderas que salen de recorrerlas.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Igual que sus vecinos: sus
 * números son coordenadas de cuadro, porcentajes de área y razones de contraste.
 *
 * ── Por qué existe (SITIO-S11) ─────────────────────────────────────────────
 *
 * `s10-logo.invariant.ts` llegó a este sprint en 297 líneas —dos de margen
 * contra el límite de 300 del repo— y el arreglo del defecto 14 le agregó una
 * sección entera de custodia. Antes de que el próximo lo descubra chocándose,
 * se partió: **acá se ARMAN las filas y se recorren, allá se afirma.** Es la
 * misma costura que `s8-escena-soporte.ts` estrenó, y la razón por la que cada
 * función devuelve las líneas Y las banderas juntas: recorrer dos veces la misma
 * grilla para sacar una bandera aparte sería medir dos cosas que tienen que ser
 * la misma.
 */

import { razonDeContraste } from '../../__tests__/afirmar'
import { TINTA_HEX } from '../../superficies'
import {
  TRANSPARENTES,
  VENTANAS,
  barridoVertical,
  cajaDelLogo,
  cobertura,
  contrasteSobreElFondo,
  contrasteSobreElLogo,
  fraccionDentro,
  mayorCaja,
  muestra,
  progresosDe,
  superposicion,
} from './s10-logo-lectura'
import { aCuadroAlto, aCuadroX } from './s10-logo-cajas'

const pct = (v: number, n = 1): string => `${(v * 100).toFixed(n).padStart(n === 0 ? 4 : 6)}%`
const par = (a: number, b: number): string => `${a.toFixed(2).padStart(5)},${b.toFixed(2).padStart(5)}`

export interface TablaDeFraccion {
  readonly lineas: readonly string[]
  /** ¿El logo del Hero entra ENTERO en los cuatro cuadros y en toda su ventana? */
  readonly heroEntero: boolean
  /** ¿La grilla extendida encerró al logo en las 32 muestras, o algún total quedó truncado? */
  readonly encerrado: boolean
  /** El borde SUPERIOR más alto que alcanza la caja del logo, en coordenada de cuadro. */
  readonly arribaMaxima: number
  /** La fracción del logo que queda dentro del cuadro en el PEOR de los cuadros. */
  readonly peorFraccionDentro: number
  /** La mayor porción del cuadro que ocupa el logo, y en qué cuadro. */
  readonly mayorCobertura: { readonly valor: number; readonly cuadro: string }
}

/** §3 — cuánto del logo entra en el cuadro, sección por sección y aspecto por aspecto. */
export function tablaDeFraccion(): TablaDeFraccion {
  const lineas = ['sección           cuadro        p     dentro  del cuadro       x        y']
  let heroEntero = true
  let encerrado = true
  let arribaMaxima = -Infinity
  let peorFraccionDentro = Infinity
  let mayorCobertura = { valor: -Infinity, cuadro: '' }

  for (const fila of TRANSPARENTES) {
    for (const v of VENTANAS) {
      for (const p of progresosDe(fila)) {
        const m = muestra(p, v.aspecto)
        const c = cajaDelLogo(m)
        if (m.tocaElBorde || c === null) {
          encerrado = false
          continue
        }
        if (fila.id === 'hero' && fraccionDentro(m) < 1) heroEntero = false
        if (fila.id !== 'hero') {
          if (c.y1 > arribaMaxima) arribaMaxima = c.y1
          if (fraccionDentro(m) < peorFraccionDentro) peorFraccionDentro = fraccionDentro(m)
          if (cobertura(m) > mayorCobertura.valor) mayorCobertura = { valor: cobertura(m), cuadro: v.etiqueta }
        }
        lineas.push(
          `${fila.id.padEnd(16)} ${v.etiqueta.padEnd(9)} ${p.toFixed(3)}  ${pct(fraccionDentro(m))}  ${pct(cobertura(m))}` +
            `   ${par(c.x0, c.x1)}  ${par(c.y0, c.y1)}`,
        )
      }
    }
  }
  return { lineas, heroEntero, encerrado, arribaMaxima, peorFraccionDentro, mayorCobertura }
}

export interface TablaDeSuperposicion {
  readonly lineas: readonly string[]
  /** ¿Hay algún cuadro donde el titular del diferencial NO se pueda dejar limpio? */
  readonly inevitable: boolean
  /** El rango de superposiciones mínimas del diferencial sobre los cuatro cuadros. */
  readonly minimaDelDiferencial: { readonly menor: number; readonly mayor: number }
}

/** §4 — cuánto se superpone el logo con la caja de texto más grande de cada sección. */
export function tablaDeSuperposicion(): TablaDeSuperposicion {
  const lineas = ['sección           cuadro    caja      p      banda x      sup.mín  máx  centrada']
  let inevitable = false
  let menor = Infinity
  let mayor = -Infinity

  for (const fila of TRANSPARENTES) {
    for (const v of VENTANAS) {
      const caja = mayorCaja(fila.id, v.ancho)
      const x0 = aCuadroX(caja.banda.izquierda, v.ancho)
      const x1 = aCuadroX(caja.banda.izquierda + caja.banda.ancho, v.ancho)
      const alto = aCuadroAlto(caja.altoPx, v.alto)
      for (const p of [fila.llenaDesde, (fila.llenaDesde + fila.seVeHasta) / 2]) {
        const m = muestra(p, v.aspecto)
        const b = barridoVertical(m, x0, x1, alto, 100)
        const centrada = superposicion(m, { x0, x1, y0: -alto / 2, y1: alto / 2 }).fraccion
        if (p === fila.llenaDesde && fila.id !== 'hero') {
          if (b.minima > 0) inevitable = true
          if (b.minima < menor) menor = b.minima
          if (b.minima > mayor) mayor = b.minima
        }
        lineas.push(
          `${fila.id.padEnd(16)} ${v.etiqueta.padEnd(9)} ${caja.etiqueta.padEnd(3)} ${p.toFixed(3)}` +
            `  ${par(x0, x1)}   ${pct(b.minima, 0)} ${pct(b.maxima, 0)}  ${pct(centrada, 0)}`,
        )
      }
    }
  }
  return { lineas, inevitable, minimaDelDiferencial: { menor, mayor } }
}

/** §5 — la tinta del texto contra el logo, por cuantiles, con el fondo al lado. */
export function tablaDeContraste(): readonly string[] {
  return TRANSPARENTES.map((fila) => {
    const p = fila.llenaDesde
    const m = muestra(p, VENTANAS[0].aspecto)
    return (
      `${fila.id.padEnd(16)} p=${p.toFixed(3)} — la tinta ${TINTA_HEX} contra EL LOGO: ${contrasteSobreElLogo(m, 0).toFixed(2)}:1 (peor) · ` +
      `${contrasteSobreElLogo(m, 0.05).toFixed(2)}:1 (p05) · ${contrasteSobreElLogo(m, 0.5).toFixed(2)}:1 (mediana) · ` +
      `${contrasteSobreElLogo(m, 1).toFixed(2)}:1 (el MEJOR píxel) — contra el FONDO, que es lo que \`s8-tinta\` publica: ` +
      `${contrasteSobreElFondo(p).toFixed(2)}:1`
    )
  })
}

/** El mejor píxel del logo, sobre las dos secciones transparentes. */
export const MEJOR_SOBRE_EL_LOGO = Math.max(
  ...TRANSPARENTES.map((f) => contrasteSobreElLogo(muestra(f.llenaDesde, VENTANAS[0].aspecto), 1)),
)
/** El PEOR píxel del fondo, que es la cifra que `s8-tinta` publica. */
export const PEOR_SOBRE_EL_FONDO = Math.min(...TRANSPARENTES.map((f) => contrasteSobreElFondo(f.llenaDesde)))
/** La tinta del texto contra la del logo, sin sombrear. */
export const TINTA_CONTRA_TINTA = (tintaDelLogo: string): number => razonDeContraste(TINTA_HEX, tintaDelLogo)

/**
 * ¿EL COMENTARIO DE UN KEYFRAME DECLARA SU RECORTE POR ARRIBA?
 *
 * El bloque de un keyframe es el comentario que lo abre: desde la llave que
 * abre su entrada del array hasta su `name: '…'`. Se busca **ahí y no en el
 * archivo entero**, porque «`choreography.ts` menciona un recorte en alguna
 * parte» y «la pose que se sale lo declara» no son la misma afirmación — y era
 * justamente la segunda la que faltaba (§7.40, defecto 18).
 *
 * ⚠ El nombre se busca con `lastIndexOf` a propósito: `TRAMOS` nombra a los seis
 * tramos con las mismas cadenas más arriba en el archivo, y un `indexOf` caería
 * en esa tabla, que no tiene comentario por entrada.
 */
export function declaraElRecorte(fuente: string, nombreDelKeyframe: string): boolean {
  const fin = fuente.lastIndexOf(`name: '${nombreDelKeyframe}'`)
  if (fin < 0) return false
  const inicio = fuente.lastIndexOf('\n  {\n', fin)
  if (inicio < 0) return false
  return /recorte por arriba/.test(fuente.slice(inicio, fin))
}
