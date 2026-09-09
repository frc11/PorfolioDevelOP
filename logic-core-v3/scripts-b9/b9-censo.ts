/**
 * B9 · EL CENSO DE ACONTECIMIENTOS DE B2, ARRIBA DEL UMBRAL — el gate de ritmo.
 *
 * ── Por qué no alcanza con `scripts-b4/b-censo.ts` ────────────────────────
 *
 * Aquél mide los CUATRO perfiles de abajo de 1025 más el 1025, porque el frente
 * B de B4 era mobile. Ahí la coreografía no monta y el censo da cero por
 * construcción. **B9 mueve rangos de la coreografía**, así que lo que hay que
 * vigilar es el otro lado: 1920 y 1440, donde la coreografía sí corre y donde
 * B2 calibró.
 *
 * El instrumento es **el mismo** —`scripts-b4/censo.ts`, la fuente que barre y
 * la regla de agrupamiento que corre en Node—, con el mismo paso de 120 px. No
 * se reescribe ni una línea de la definición: dos definiciones de
 * «acontecimiento» producirían dos tablas que parecen la misma y no lo son.
 *
 * ⚠️ **La vara.** B2 publicó un hueco máximo de **1,11 pantallas** contra las
 * **1,56** de la referencia. Ese 1,11 se midió en B2 **con su propio
 * instrumento**; acá se vuelve a medir con el de `scripts-b4`, así que la cifra
 * de «antes» de esta corrida es la que vale para restar contra la de «después».
 * **Comparar el «después» de este instrumento contra el 1,11 de otro sería
 * restar dos varas distintas.**
 *
 * Corre con:
 *
 *     npx tsx scripts-b9/b9-censo.ts antes
 *     npx tsx scripts-b9/b9-censo.ts despues
 */

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { HUECO_MAXIMO_DE_LA_REFERENCIA_PANTALLAS } from '../scripts-b4/censo'
import { abrirPagina, cerrarPagina, emular, irA, verificarLaPagina } from '../scripts-b4/navegador'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'
import { censar, documento, paneles, seccionEnPosicion } from '../scripts-b4/sitio'
import { dos, jsonPendiente, mudar, SITIO } from './b9-comun'

const PASO_PX = 120
const ETIQUETA = process.argv[2] ?? 'antes'
const A_MEDIR: readonly Perfil[] = ['1920', '1440'].map(perfilPorId)

async function medirUno(perfil: Perfil): Promise<Record<string, unknown>> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('b9-censo'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, SITIO)
    await verificarLaPagina(p, perfil)
    const doc = await documento(p)
    const secciones = await paneles(p)
    const rango = { desde: 0, hasta: Math.max(0, doc.alturaPx - doc.ventanaPx) }
    const r = await censar(p, { ...rango, paso: PASO_PX })
    await cerrarPagina(p)

    const grupos = r.censo.grupos.map((g) => ({
      ...g,
      seccion: seccionEnPosicion(secciones, g.ini),
    }))
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
  }
}

async function main(): Promise<void> {
  const filas: Record<string, unknown>[] = []
  for (const perfil of A_MEDIR) {
    const f = await medirUno(perfil)
    filas.push(f)
    console.log(
      `${String(f.perfil).padEnd(5)} · paradas ${f.paradas} · estilo/parada ${f.estiloPorParadaMin}..${f.estiloPorParadaMax} · ` +
        `acontecimientos ${f.acontecimientos} · piezas ${f.piezasTotales} · ` +
        `hueco MÁX ${f.huecoMaximoPantallas} pantallas · medio ${f.huecoMedioPantallas} · montajes ${f.montajes}`,
    )
    const grupos = f.grupos as readonly { ini: number; fin: number; piezas: number; seccion: string | null }[]
    console.log(`      grupos: ${grupos.map((g) => `${g.seccion ?? '?'}@${g.ini}${g.fin === g.ini ? '' : `-${g.fin}`}(${g.piezas})`).join(' ')}`)
    console.log(`      huecos: ${(f.huecosPantallas as number[]).join(' ')}`)
  }

  const escritos = mudar([
    jsonPendiente(`censo-${ETIQUETA}.json`, {
      etiqueta: ETIQUETA,
      instrumento: 'scripts-b4/censo.ts (el de B2-DELTAS §0), paso 120 px, 8 esperas de 140 ms, sin estrangular, emulado',
      varaDeLaReferencia: {
        huecoMaximoPantallas: HUECO_MAXIMO_DE_LA_REFERENCIA_PANTALLAS,
        publicadoPorB2: 1.11,
        nota: 'el 1,11 de B2 salió de OTRO instrumento; la resta válida es antes/después de éste.',
      },
      filas,
    }),
  ])
  console.log('')
  for (const e of escritos) console.log(`escrito: ${e}`)
  console.log(`vara de la referencia: ${dos(HUECO_MAXIMO_DE_LA_REFERENCIA_PANTALLAS)} pantallas`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
