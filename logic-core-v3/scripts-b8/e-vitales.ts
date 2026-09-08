/**
 * LOS FPS DEL RECORRIDO CON SEIS SECCIONES ABIERTAS Y LA NOCHE EN TRABAJOS —
 * contra las líneas de base de B5 y de B6-A. El instrumento de la PARADA 2.
 *
 *     npx tsx scripts-b8/e-vitales.ts
 *
 * Es `scripts-b6/e-vitales.ts` (B6-A) con B8 adelante: el MISMO contador que
 * B5 (`CONTADOR_DE_CUADROS`), el mismo perfil (1440), la misma forma —una
 * lectura quieta de 3 s y tres recorridos de 12 s a 24 px por cuadro desde el
 * tope— y las mismas tres cifras (mediana, p05, mínimo). Las líneas de base se
 * LEEN de los JSON de B5 y de B6-A, no se transcriben.
 *
 * Lo que cambió entre B6-A y B8: la escena dibuja 13 de 17 pantallas en vez de
 * 7 (Quiénes somos y Números abiertas), sin velo, con el arco que se apaga en
 * Trabajos, un shadow map con FAR 200 y las partículas brillando en la noche.
 * Cualquiera podría costar cuadros; acá se mide si lo hacen.
 */

import { existsSync, readFileSync } from 'node:fs'

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { CONTADOR_DE_CUADROS } from '../scripts-b5/vitales-lectores'

import { MARCA_DE_INTRO, PERFIL, PUENTE_DE_AUTOMATIZACION, asentarElHome, conLaPagina, dos, guardarJson } from './b8-comun'

interface Cuadros {
  readonly cuadros: number
  readonly duracionMs: number
  readonly fpsMediana: number
  readonly fpsP05: number
  readonly fpsMinimo: number
  readonly indiceDelPeor: number
  readonly cuadrosLargos: number
  readonly scrollFinal: number
}

interface Vitales {
  readonly quieta: Cuadros
  readonly recorridos: readonly Cuadros[]
}

interface VitalesDeB5 extends Vitales {
  readonly lineasDeBase: { readonly fpsMinimoB4B: number }
}

const RECORRIDOS = 3
const linea = (nombre: string, c: Cuadros): string =>
  `${nombre.padEnd(14)} ${String(c.cuadros).padStart(4)} cuadros · mediana ${dos(c.fpsMediana).toFixed(2)} · p05 ${dos(c.fpsP05).toFixed(2)} · mín ${dos(c.fpsMinimo).toFixed(2)} (cuadro ${c.indiceDelPeor}, ${c.cuadrosLargos} > 20 ms) · hasta y=${c.scrollFinal}`

const peorDe = (v: Vitales): { mediana: number; p05: number; minimo: number; largos: string } => ({
  mediana: Math.min(...v.recorridos.map((r) => r.fpsMediana)),
  p05: Math.min(...v.recorridos.map((r) => r.fpsP05)),
  minimo: Math.min(...v.recorridos.map((r) => r.fpsMinimo)),
  largos: v.recorridos.map((r) => r.cuadrosLargos).join('/'),
})

async function principal(): Promise<void> {
  const b5 = JSON.parse(readFileSync('docs/rediseno/outputs/b5/b5-vitales.json', 'utf8')) as VitalesDeB5
  const rutaB6 = 'docs/rediseno/outputs/b6/e-vitales.json'
  const b6 = existsSync(rutaB6) ? (JSON.parse(readFileSync(rutaB6, 'utf8')) as Vitales) : null
  const salida = await conLaPagina(
    PERFIL,
    '/v3',
    async (s) => {
      await asentarElHome(s)
      await scrollA(s.pagina, 0)
      await esperarElPrimerCuadro(s.pagina)
      const quieta = await medir<Cuadros>(s.pagina, CONTADOR_DE_CUADROS(3000, false))
      const recorridos: Cuadros[] = []
      for (let i = 0; i < RECORRIDOS; i += 1) {
        await scrollA(s.pagina, 0)
        await esperarElPrimerCuadro(s.pagina)
        recorridos.push(await medir<Cuadros>(s.pagina, CONTADOR_DE_CUADROS(12000, true)))
      }
      return { quieta, recorridos }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO] },
  )

  console.log('B8 (seis abiertas, sin velo, la noche en Trabajos, partículas que brillan):')
  console.log(`  ${linea('quieta', salida.quieta)}`)
  salida.recorridos.forEach((r, i) => console.log(`  ${linea(`recorrido ${i + 1}`, r)}`))
  if (b6 !== null) {
    console.log('B6-A (línea de base, leída de b6/e-vitales.json):')
    console.log(`  ${linea('quieta', b6.quieta)}`)
    b6.recorridos.forEach((r, i) => console.log(`  ${linea(`recorrido ${i + 1}`, r)}`))
  }
  console.log('B5 (línea de base, leída de b5-vitales.json):')
  console.log(`  ${linea('quieta', b5.quieta)}`)
  b5.recorridos.forEach((r, i) => console.log(`  ${linea(`recorrido ${i + 1}`, r)}`))

  const hoy = peorDe(salida)
  const deB5 = peorDe(b5)
  console.log(
    `\n  comparación (peor de ${RECORRIDOS} recorridos): mediana ${dos(hoy.mediana)} contra ${dos(deB5.mediana)} (B5)` +
      (b6 === null ? '' : ` y ${dos(peorDe(b6).mediana)} (B6-A)`) +
      ` · p05 ${dos(hoy.p05)} contra ${dos(deB5.p05)}${b6 === null ? '' : ` y ${dos(peorDe(b6).p05)}`}` +
      ` · mínimo ${dos(hoy.minimo)} contra ${dos(deB5.minimo)}${b6 === null ? '' : ` y ${dos(peorDe(b6).minimo)}`}` +
      ` · cuadros largos ${hoy.largos} contra ${deB5.largos}${b6 === null ? '' : ` y ${peorDe(b6).largos}`}`,
  )
  console.log(`  línea de base de B4-B para el mínimo: ${b5.lineasDeBase.fpsMinimoB4B}`)
  const ruta = guardarJson('e-vitales', {
    perfil: PERFIL.id,
    ...salida,
    lineasDeBase: {
      b5: { de: 'docs/rediseno/outputs/b5/b5-vitales.json', quieta: b5.quieta, recorridos: b5.recorridos, fpsMinimoB4B: b5.lineasDeBase.fpsMinimoB4B },
      b6: b6 === null ? null : { de: rutaB6, quieta: b6.quieta, recorridos: b6.recorridos },
    },
  })
  console.log(`  ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
