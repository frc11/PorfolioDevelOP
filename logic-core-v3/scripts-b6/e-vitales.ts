/**
 * LOS FPS DEL RECORRIDO CON LAS SECCIONES ABIERTAS — contra la línea de base
 * de B5. El instrumento de la PARADA 2 (h).
 *
 *     npx tsx scripts-b6/e-vitales.ts
 *
 * El MISMO contador que B5 (`CONTADOR_DE_CUADROS`), el mismo perfil (1440), la
 * misma forma —una lectura quieta de 3 s y tres recorridos de 12 s a 24 px por
 * cuadro desde el tope— y las mismas tres cifras (mediana, p05, mínimo), para
 * que la comparación sea contra el mismo estadístico y no contra otro parecido.
 * La línea de base se LEE de `docs/rediseno/outputs/b5/b5-vitales.json`, no se
 * transcribe.
 *
 * Lo que cambió entre las dos mediciones: dos secciones más dejan ver la
 * escena, así que el lazo corre 7 de 17 pantallas en vez de 3, la escena se
 * dibuja detrás de Trabajos con un gradiente encima, y P7 mira con otro lente.
 * Cualquiera de las tres podría costar cuadros; acá se mide si lo hacen.
 */

import { readFileSync } from 'node:fs'

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { CONTADOR_DE_CUADROS } from '../scripts-b5/vitales-lectores'

import { MARCA_DE_INTRO, PERFIL, PUENTE_DE_AUTOMATIZACION, asentarElHome, conLaPagina, dos, guardarJson } from './b6-comun'

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

interface VitalesDeB5 {
  readonly quieta: Cuadros
  readonly recorridos: readonly Cuadros[]
  readonly lineasDeBase: { readonly fpsMinimoB4B: number }
}

const RECORRIDOS = 3
const linea = (nombre: string, c: Cuadros): string =>
  `${nombre.padEnd(14)} ${String(c.cuadros).padStart(4)} cuadros · mediana ${dos(c.fpsMediana).toFixed(2)} · p05 ${dos(c.fpsP05).toFixed(2)} · mín ${dos(c.fpsMinimo).toFixed(2)} (cuadro ${c.indiceDelPeor}, ${c.cuadrosLargos} > 20 ms) · hasta y=${c.scrollFinal}`

async function principal(): Promise<void> {
  const b5 = JSON.parse(readFileSync('docs/rediseno/outputs/b5/b5-vitales.json', 'utf8')) as VitalesDeB5
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

  console.log('B6-A (Trabajos y el Cierre abiertas, velo en gradiente, lente de P7):')
  console.log(`  ${linea('quieta', salida.quieta)}`)
  salida.recorridos.forEach((r, i) => console.log(`  ${linea(`recorrido ${i + 1}`, r)}`))
  console.log('B5 (línea de base, leída de b5-vitales.json):')
  console.log(`  ${linea('quieta', b5.quieta)}`)
  b5.recorridos.forEach((r, i) => console.log(`  ${linea(`recorrido ${i + 1}`, r)}`))

  const peorMediana = Math.min(...salida.recorridos.map((r) => r.fpsMediana))
  const peorP05 = Math.min(...salida.recorridos.map((r) => r.fpsP05))
  const peorMinimo = Math.min(...salida.recorridos.map((r) => r.fpsMinimo))
  const largos = salida.recorridos.map((r) => r.cuadrosLargos)
  const b5Mediana = Math.min(...b5.recorridos.map((r) => r.fpsMediana))
  const b5P05 = Math.min(...b5.recorridos.map((r) => r.fpsP05))
  const b5Minimo = Math.min(...b5.recorridos.map((r) => r.fpsMinimo))
  console.log(
    `\n  comparación (peor de ${RECORRIDOS} recorridos): mediana ${dos(peorMediana)} contra ${dos(b5Mediana)} · p05 ${dos(peorP05)} contra ${dos(b5P05)} · mínimo ${dos(peorMinimo)} contra ${dos(b5Minimo)} · cuadros largos ${largos.join('/')} contra ${b5.recorridos.map((r) => r.cuadrosLargos).join('/')}`,
  )
  console.log(`  línea de base de B4-B para el mínimo: ${b5.lineasDeBase.fpsMinimoB4B}`)
  const ruta = guardarJson('e-vitales', { perfil: PERFIL.id, ...salida, lineaDeBase: { de: 'docs/rediseno/outputs/b5/b5-vitales.json', quieta: b5.quieta, recorridos: b5.recorridos, fpsMinimoB4B: b5.lineasDeBase.fpsMinimoB4B } })
  console.log(`  ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
