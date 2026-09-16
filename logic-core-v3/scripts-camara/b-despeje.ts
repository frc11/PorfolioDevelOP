/**
 * CAMARA-1 · B — LA DISTANCIA QUE DESPEJA EL TEXTO, que es otra pregunta.
 *
 *     npx tsx scripts-camara/b-despeje.ts
 *
 * ── Por qué este script existe, y qué corrige del PASO 1 ─────────────────
 *
 * El criterio de la instrucción —«que la tinta entre ENTERA con 5 % de margen»—
 * es **horizontal en las ventanas angostas**: lo que se sale del cuadro son los
 * costados, no el alto. Alejar hasta que los costados entren achica el alto sólo
 * de paso, y el PASO 1 lo midió: a 390 la banda libre de abajo pasa de 270 a 300
 * px, y el bloque de texto necesita 265 + 80 de reserva = **345**.
 *
 * Así que la pregunta que decide no es «¿entra la tinta?» sino **«¿a qué
 * distancia la tinta deja de pisar el texto donde el texto ESTÁ?»**.
 *
 * ── ⚠️ Y LA BANDA VERTICAL TAMPOCO ALCANZA COMO CRITERIO: SE PROBÓ ──────
 *
 * La primera versión de este script preguntaba si el borde de abajo de la tinta
 * quedaba por encima del borde de arriba del bloque. **Eso sólo vale cuando la
 * tinta cruza la columna de texto a lo ancho**, que es el caso en las ventanas
 * angostas —ahí la tinta es MÁS ANCHA que el cuadro— y NO es el caso a 1440 y
 * 1920, donde la tinta vive a la derecha y la columna a la izquierda. Con ese
 * criterio, 1440 daba «la tinta pisa el bloque por 112 px» mientras TAPADO-1
 * medía **0,7 % de superposición real**. Un criterio que da rojo donde la
 * pantalla está limpia no es conservador: es otro criterio.
 *
 * Lo que se usa acá es `superposicionReal` —el cruce en DOS ejes entre la tinta
 * y las cajas de texto en su posición derivada—, que es exactamente el
 * instrumento que TAPADO-1 dejó arreglado y contrastado contra el navegador.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import { muestrearLogo } from '@/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL, cajaDelLogo, cobertura } from '@/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import { repartoVertical, superposicionReal } from '@/app/v3/_lib/escena/__tests__/s10-logo-alto'
import {
  CAMPO,
  MALLA_FINA,
  RAIZ_DE_SALIDAS,
  VENTANAS,
  bandaLibre,
  dos,
  pistaConDistancia,
  techoDeDistancia,
  tres,
  type Ventana,
} from './camara-comun'

const HERO = CHOREO_KEYFRAMES[0]

/** Los dos umbrales que la instrucción nombra: «un dígito» y «limpio». */
export const UMBRAL_UN_DIGITO = 0.1
export const UMBRAL_LIMPIO = 0.01

interface Punto {
  readonly distancia: number
  readonly superposicion: number
  readonly cobertura: number
  readonly anchoDeLaTinta: number
  readonly tintaHastaPx: number
}

function enDistancia(v: Ventana, d: number): Punto {
  const m = muestrearLogo(
    HERO.at,
    v.ancho / v.alto,
    ESCENA_REAL,
    MALLA_FINA.columnas,
    MALLA_FINA.filas,
    CAMPO,
    pistaConDistancia(HERO.name, d),
  )
  const c = cajaDelLogo(m)
  const s = superposicionReal(m, repartoVertical('hero', v.ancho, v.alto))
  return {
    distancia: dos(d),
    superposicion: tres(s.fraccion),
    cobertura: tres(cobertura(m)),
    anchoDeLaTinta: c === null ? Number.NaN : tres(c.x1 - c.x0),
    tintaHastaPx: c === null ? Number.NaN : Math.round(bandaLibre(c, v.alto).tintaHastaPx),
  }
}

interface FilaDeDespeje {
  readonly ancho: number
  readonly alto: number
  readonly techoDeLaSala: number
  readonly hoy: Punto
  /** La primera distancia cuya superposición baja del 10 %, o `null`. */
  readonly aUnDigito: Punto | null
  /** La primera que baja del 1 %, o `null`. */
  readonly limpia: Punto | null
  readonly curva: readonly Punto[]
}

function despeje(v: Ventana): FilaDeDespeje {
  const techo = techoDeDistancia(HERO.pose.height)
  const curva: Punto[] = []
  for (let d = HERO.pose.distance; d <= techo + 1e-9; d += 1) curva.push(enDistancia(v, d))
  const primera = (u: number): Punto | null => curva.find((p) => p.superposicion <= u) ?? null
  return {
    ancho: v.ancho,
    alto: v.alto,
    techoDeLaSala: dos(techo),
    hoy: curva[0],
    aUnDigito: primera(UMBRAL_UN_DIGITO),
    limpia: primera(UMBRAL_LIMPIO),
    curva,
  }
}

function main(): void {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  console.log('PASO 1b — la distancia que DESPEJA el texto donde el texto esta (justify-end de TAPADO-1)\n')
  console.log(
    'ventana     superp. hoy   d para <10 %        d para <1 %         techo sala   cobertura hoy -> a la d de <1 %',
  )
  const filas = VENTANAS.map((v) => {
    const f = despeje(v)
    const cel = (p: Punto | null): string =>
      p === null ? '    NO HAY     ' : `d=${String(p.distancia).padStart(5)} (${(p.superposicion * 100).toFixed(1).padStart(4)} %)`
    console.log(
      `${String(f.ancho).padStart(4)}x${String(f.alto).padEnd(4)} ${(f.hoy.superposicion * 100).toFixed(1).padStart(10)} %   ` +
        `${cel(f.aUnDigito)}   ${cel(f.limpia)}   ${String(f.techoDeLaSala).padStart(8)}   ` +
        `${(f.hoy.cobertura * 100).toFixed(1)} % -> ${f.limpia === null ? '  -' : `${(f.limpia.cobertura * 100).toFixed(1)} %`}`,
    )
    return f
  })

  console.log('\nLa curva a 390 y a 768 — superposicion y cobertura contra la distancia\n')
  for (const ancho of [390, 768]) {
    const f = filas.find((x) => x.ancho === ancho)!
    console.log(
      `  ${ancho}: ` +
        f.curva
          .filter((_, i) => i % 4 === 0)
          .map((p) => `d${p.distancia}=${(p.superposicion * 100).toFixed(0)}%/${(p.cobertura * 100).toFixed(0)}%`)
          .join('  '),
    )
  }

  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, 'b-despeje.json'),
    `${JSON.stringify({ cuando: new Date().toISOString(), umbrales: { unDigito: UMBRAL_UN_DIGITO, limpio: UMBRAL_LIMPIO }, filas }, null, 2)}\n`,
    'utf8',
  )
  console.log(`\n  -> ${path.join(RAIZ_DE_SALIDAS, 'b-despeje.json')}`)
}

main()
