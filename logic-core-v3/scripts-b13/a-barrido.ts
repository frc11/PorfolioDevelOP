/**
 * A · EL BARRIDO DE EMISIÓN — las tres columnas que compiten, tramo por tramo.
 *
 *     npx tsx scripts-b13/a-barrido.ts
 *     npx tsx scripts-b13/a-barrido.ts --modo=constante
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 *
 * Para cada valor de emisiva del barrido y en cada uno de los seis tramos donde
 * la sala se ve, las tres cosas que §1.3 pide medir a la vez:
 *
 *   1. **El contraste del texto que cae encima**, con la tinta del sistema
 *      (`TINTA_HEX`) contra el PEOR píxel del logo. Es lo que decide.
 *   2. **Si el logo sigue leyéndose como el logo**: el degradé interno de la
 *      pieza (p95 − p05 de su propio valor) es lo que dibuja la cara, el bisel y
 *      el canto. Un objeto que emite demasiado se aplana: el degradé colapsa.
 *   3. ⚠️ **La trampa**: el contraste del logo **contra la sala** —contra su
 *      valor típico y contra su parte más clara, que es el papel—. Sobre papel
 *      claro un objeto que emite desaparece, y eso se ve en esta columna.
 *
 * ── El instrumento, y por qué sus cifras se pueden cruzar con las de antes ──
 *
 * El muestreo es el de S10 (`muestrearLogo`, la máscara real del SVG sobre la
 * grilla extendida) con el término de emisiva puesto donde va —adentro del tone
 * mapping— por `logoEmitido.ts`, que trae su propio control de equivalencia: con
 * la emisiva en 0 devuelve EXACTAMENTE lo que devuelve `shadeSurface`. La sala
 * sale de `muestrearCuadro` (`cuadro.ts`), el mismo muestreador cuya media
 * `s8-tinta` §1 cruza contra `sampleFrame` pose por pose.
 *
 * **Es un TECHO, no un piso**: ni éste ni aquél modelan las partículas, la
 * sombra proyectada ni el especular, y los tres empujan hacia abajo.
 */

import { razonDeContraste } from '../src/app/v3/_lib/__tests__/afirmar'
import { SUPERFICIES, TINTA_HEX } from '../src/app/v3/_lib/superficies'
import { seccionPorId } from '../src/app/v3/_lib/secciones'
import { muestrearCuadro, percentil, vistaEn } from '../src/app/v3/_lib/escena/__tests__/cuadro'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import {
  ESCENA_REAL,
  TRANSPARENTES,
  cobertura,
  gris,
  percentilDe,
} from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import { equivaleSinEmision } from '../src/app/v3/_lib/escena/__tests__/logoEmitido'
import { emisionDelLogoEn } from '../src/app/v3/_lib/escena/logoEmision'
import { levelAt } from '../src/app/probe-escena/__tests__/shading'

import { argumento, escribirJson, red } from './b13-comun'

/** El cuadro con el que se compuso el recorrido: 16:9 de escritorio. */
const ASPECTO = 16 / 9

/** AA para texto normal. */
const AA = 4.5

/**
 * Los valores de emisiva del barrido, en luz lineal. Llega hasta 1,5 porque el
 * blanco de pantalla pide ~1,47 contra `NeutralToneMapping` (el codo comprime
 * todo lo que pasa de 0,76), o sea que 1,5 es «el logo, blanco puro».
 */
const BARRIDO = [0, 0.02, 0.05, 0.1, 0.2, 0.3, 0.45, 0.62, 0.8, 1, 1.25, 1.5]

/** La tinta clara de las secciones invertidas: el papel dado vuelta. */
const TINTA_INVERTIDA = '#F7F7F5'

/** La tinta con la que ESA sección escribe. Medir todas con `TINTA_HEX` sería medir Trabajos con una tinta que no usa. */
function tintaDe(id: string): string {
  return SUPERFICIES[seccionPorId(id).superficie].invertida ? TINTA_INVERTIDA : TINTA_HEX
}

interface Lectura {
  readonly emisiva: number
  /** Cuánto del cuadro es logo. */
  readonly coberturaPct: number
  /** El valor del logo en pantalla: peor, p05, mediana, p95, mejor. */
  readonly logo: { readonly min: number; readonly p05: number; readonly p50: number; readonly p95: number; readonly max: number }
  /** El degradé interno de la pieza. Es lo que dibuja el volumen. */
  readonly degradado: number
  /** La sala detrás: p05, mediana y p95 (su parte más clara, el papel). */
  readonly sala: { readonly p05: number; readonly p50: number; readonly p95: number }
  /** La tinta del texto contra el logo: peor píxel, p05 y mediana. */
  readonly textoSobreElLogo: { readonly peor: number; readonly p05: number; readonly p50: number }
  /** El logo contra la sala: contra su valor típico y contra el papel. */
  readonly logoContraLaSala: number
  readonly logoContraElPapel: number
}

function leer(progreso: number, emisiva: number, tinta: string): Lectura {
  const m = muestrearLogo(progreso, ASPECTO, ESCENA_REAL, 300, 220, 2.6, undefined, emisiva)
  const ordenados = m.valor.slice()
  ordenados.sort()
  const q = (p: number) => percentilDe(ordenados, p)
  const h = muestrearCuadro(progreso, vistaEn(progreso), ESCENA_REAL, 200, 113)
  const sala = { p05: percentil(h.sinLogo, 0.05), p50: percentil(h.sinLogo, 0.5), p95: percentil(h.sinLogo, 0.95) }
  const contra = (a: number, b: number) => razonDeContraste(gris(a), gris(b))
  return {
    emisiva,
    coberturaPct: red(cobertura(m) * 100, 2),
    logo: { min: red(q(0), 1), p05: red(q(0.05), 1), p50: red(q(0.5), 1), p95: red(q(0.95), 1), max: red(q(1), 1) },
    degradado: red(q(0.95) - q(0.05), 1),
    sala: { p05: red(sala.p05, 1), p50: red(sala.p50, 1), p95: red(sala.p95, 1) },
    textoSobreElLogo: {
      // El PEOR píxel es el que menos contraste da, y con qué extremo del logo
      // cae depende de la tinta: la oscura sufre donde el logo es oscuro y la
      // clara donde el logo es claro. Se toma el mínimo de los dos extremos.
      peor: red(Math.min(razonDeContraste(tinta, gris(q(0))), razonDeContraste(tinta, gris(q(1)))), 2),
      p05: red(razonDeContraste(tinta, gris(q(0.05))), 2),
      p50: red(razonDeContraste(tinta, gris(q(0.5))), 2),
    },
    logoContraLaSala: red(contra(q(0.5), sala.p50), 2),
    logoContraElPapel: red(contra(q(0.5), sala.p95), 2),
  }
}

function principal(): void {
  const control = equivaleSinEmision()
  console.log(
    `CONTROL DE EQUIVALENCIA — ${control.casos} casos comparados contra \`shadeSurface\`, ` +
      `${control.discrepancias.length} discrepancias` +
      (control.discrepancias.length === 0 ? ' ✅' : ` 🔴 ${JSON.stringify(control.discrepancias.slice(0, 3))}`),
  )
  if (control.discrepancias.length > 0) process.exitCode = 1

  const modo = argumento('modo', 'todos')
  const tramos = TRANSPARENTES.map((f) => ({
    id: f.id,
    progreso: f.llenaDesde,
    nivel: red(levelAt(f.llenaDesde), 4),
    emisionDeHoy: red(emisionDelLogoEn(levelAt(f.llenaDesde)), 4),
  }))

  console.log(`\nlos seis tramos: ${tramos.map((t) => `${t.id} p=${t.progreso.toFixed(4)} nivel=${t.nivel}`).join(' · ')}`)

  const salida: { readonly tramos: typeof tramos; readonly filas: unknown[] } = { tramos, filas: [] }

  for (const tramo of tramos) {
    const tinta = tintaDe(tramo.id)
    console.log(
      `\n══ ${tramo.id.toUpperCase()} — p=${tramo.progreso.toFixed(4)} · nivel del arco ${tramo.nivel} ` +
        `· emisión de hoy ${tramo.emisionDeHoy} · su tinta ${tinta}`,
    )
    console.log(
      '   emisiva | %cuadro |  logo min/p50/max | degr | sala p05/p50/p95 | TEXTO peor  p05  p50 | logo/sala logo/papel',
    )
    const filas: Lectura[] = []
    for (const emisiva of BARRIDO) {
      const l = leer(tramo.progreso, emisiva, tinta)
      filas.push(l)
      console.log(
        `   ${l.emisiva.toFixed(2).padStart(7)} | ${l.coberturaPct.toFixed(2).padStart(6)} | ` +
          `${l.logo.min.toFixed(1).padStart(5)}/${l.logo.p50.toFixed(1).padStart(5)}/${l.logo.max.toFixed(1).padStart(5)} | ` +
          `${l.degradado.toFixed(1).padStart(4)} | ` +
          `${l.sala.p05.toFixed(0).padStart(3)}/${l.sala.p50.toFixed(0).padStart(3)}/${l.sala.p95.toFixed(0).padStart(3)} | ` +
          `${l.textoSobreElLogo.peor.toFixed(2).padStart(6)} ${l.textoSobreElLogo.p05.toFixed(2).padStart(5)} ${l.textoSobreElLogo.p50.toFixed(2).padStart(5)}` +
          `${l.textoSobreElLogo.peor >= AA ? ' ✅' : '   '} | ` +
          `${l.logoContraLaSala.toFixed(2).padStart(6)} ${l.logoContraElPapel.toFixed(2).padStart(7)}`,
      )
      if (modo === 'constante') continue
    }
    salida.filas.push({ tramo: tramo.id, progreso: tramo.progreso, nivel: tramo.nivel, tinta, lecturas: filas })
  }

  console.log(`\nescrito: ${escribirJson('barrido-de-emision', salida)}`)
}

principal()
