/**
 * B12 · EL CENSO DE ACONTECIMIENTOS DE B2 — el gate de ritmo, antes y después
 * de sacar los rótulos de sección.
 *
 *     npx tsx scripts-b12/censo.ts antes
 *     npx tsx scripts-b12/censo.ts despues
 *
 * Es `scripts-b11/censo.ts` letra por letra —que a su vez es el de B9, que es
 * el de `scripts-b4/censo.ts` con el paso de 120 px y los dos anchos de la
 * coreografía— con una sola diferencia: la CARPETA DE SALIDA, que allá es
 * `outputs/b11` y acá es `outputs/b12`. Escribir en la de B11 pisaría las
 * cifras que firman su reporte.
 *
 * ⚠️ **La vara.** B9 dejó el hueco máximo en **1,33 pantallas a 1920 y 1,20 a
 * 1440** (`B9-DELTAS.md` §5), y B11 lo volvió a medir con este instrumento sin
 * moverlo. Sacar dos líneas de arriba de cada sección mueve todo lo de abajo, y
 * eso mueve el acontecimiento de la sección: la cifra de «antes» de esta corrida
 * es la que vale para restar contra la de «después», y las dos se comparan
 * contra 1,33 y 1,20.
 */

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { HUECO_MAXIMO_DE_LA_REFERENCIA_PANTALLAS } from '../scripts-b4/censo'
import { abrirPagina, cerrarPagina, emular, irA, verificarLaPagina } from '../scripts-b4/navegador'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'
import { censar, documento, paneles, seccionEnPosicion } from '../scripts-b4/sitio'

import { ORIGEN, dos, jsonPendiente, mudarPendientes } from './b12-comun'

const PASO_PX = 120
const ETIQUETA = process.argv[2] ?? 'antes'
const A_MEDIR: readonly Perfil[] = ['1920', '1440'].map(perfilPorId)

/** La vara de B9, medida con este instrumento (`B9-DELTAS.md` §5). */
export const HUECO_MAXIMO_DE_B9 = { '1920': 1.33, '1440': 1.2 } as const

async function medirUno(perfil: Perfil): Promise<Record<string, unknown>> {
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('b12-censo'), ancho: perfil.ancho, alto: perfil.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, `${ORIGEN}/v3`)
    await verificarLaPagina(p, perfil)
    const doc = await documento(p)
    const secciones = await paneles(p)
    const rango = { desde: 0, hasta: Math.max(0, doc.alturaPx - doc.ventanaPx) }
    const r = await censar(p, { ...rango, paso: PASO_PX })
    await cerrarPagina(p)
    const grupos = r.censo.grupos.map((g) => ({ ...g, seccion: seccionEnPosicion(secciones, g.ini) }))
    return {
      perfil: perfil.id,
      ancho: perfil.ancho,
      alto: perfil.alto,
      documento: doc,
      paneles: secciones,
      paso: PASO_PX,
      ventanaDeFusionPx: 2 * PASO_PX,
      paradas: r.lectura.estiloPorParada.length,
      estiloPorParadaMin: Math.min(...r.lectura.estiloPorParada),
      estiloPorParadaMax: Math.max(...r.lectura.estiloPorParada),
      sinSistemaDeMovimiento: r.sinSistemaDeMovimiento,
      acontecimientos: r.censo.acontecimientos,
      piezasTotales: r.censo.piezasTotales,
      huecoMaximoPantallas: r.censo.huecoMaximoPantallas,
      huecoMedioPantallas: r.censo.huecoMedioPantallas,
      huecosPantallas: r.censo.huecosPantallas,
      montajes: r.lectura.montajes.length,
      grupos,
    }
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 900))
  }
}

async function main(): Promise<void> {
  const filas: Record<string, unknown>[] = []
  for (const perfil of A_MEDIR) {
    const f = await medirUno(perfil)
    filas.push(f)
    const vara = HUECO_MAXIMO_DE_B9[perfil.id as keyof typeof HUECO_MAXIMO_DE_B9]
    console.log(
      `${String(f.perfil).padEnd(5)} · paradas ${f.paradas} · estilo/parada ${f.estiloPorParadaMin}..${f.estiloPorParadaMax} · ` +
        `acontecimientos ${f.acontecimientos} · piezas ${f.piezasTotales} · ` +
        `hueco MÁX ${f.huecoMaximoPantallas} pantallas (vara de B9: ${vara}) · medio ${f.huecoMedioPantallas} · montajes ${f.montajes}`,
    )
    const grupos = f.grupos as readonly { ini: number; fin: number; piezas: number; seccion: string | null }[]
    console.log(`      grupos: ${grupos.map((g) => `${g.seccion ?? '?'}@${g.ini}${g.fin === g.ini ? '' : `-${g.fin}`}(${g.piezas})`).join(' ')}`)
    console.log(`      huecos: ${(f.huecosPantallas as number[]).join(' ')}`)
  }
  jsonPendiente(`censo-${ETIQUETA}`, {
    etiqueta: ETIQUETA,
    instrumento:
      'scripts-b4/censo.ts (el de B2-DELTAS §0, corrido por b9-censo y b11-censo), paso 120 px, 8 esperas de 140 ms, sin estrangular, emulado, origen 3000',
    vara: { deB9: HUECO_MAXIMO_DE_B9, deLaReferencia: HUECO_MAXIMO_DE_LA_REFERENCIA_PANTALLAS },
    filas,
  })
  for (const e of mudarPendientes()) console.log(`escrito: ${e}`)
  console.log(`vara de la referencia: ${dos(HUECO_MAXIMO_DE_LA_REFERENCIA_PANTALLAS)} pantallas · de B9: 1,33 a 1920 y 1,20 a 1440`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
