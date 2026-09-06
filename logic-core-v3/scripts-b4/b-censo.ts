/**
 * FRENTE B · 3 — LOS ACONTECIMIENTOS Y EL HUECO MÁXIMO ABAJO DEL UMBRAL, con el
 * censo de B2.
 *
 * ── ⚠️ POR QUÉ CERO PUEDE SER EL RESULTADO CORRECTO ──────────────────────
 *
 * Abajo de 1025 la compuerta no monta el escenario ni la coreografía: el ritmo
 * lo dan sólo el `sticky` y las transiciones de CSS, que **no escriben estilo en
 * línea**. El censo cuenta aterrizajes de estilo en línea, así que **puede dar
 * cero, y ese cero es el hallazgo**.
 *
 * Pero cero es también lo que devolvería un instrumento que no vio la página. La
 * serie `estiloPorParada` es lo que los separa —`censo.ts` lo dice—: toda en
 * cero significa que no hay un solo estilo en línea en el documento; con valores
 * y sin aterrizajes, es otra cosa y hay que ir a mirarla. **Este archivo publica
 * la serie, no sólo el cero.**
 *
 * ── El par 1024/1025, que vale más que las cuatro tablas ──────────────────
 *
 * Los dos comparten el alto a propósito (`perfiles.ts`), así que la única
 * variable entre ellos es el ancho, que es lo único que la compuerta lee. El par
 * es lo que muestra qué cambia AL CRUZAR la compuerta, y no una diferencia
 * atribuible a dos causas.
 *
 * ⚠️ **El paso va en píxeles y la ventana de fusión es `2·paso`** (`censo.ts`),
 * o sea que vale una fracción distinta de pantalla en cada perfil. Con paso 120
 * la fusión es 240 px: 0,36 pantallas a 375 y 0,31 a 768. Va declarado en el
 * JSON porque sin eso los perfiles no se pueden comparar.
 */

import { HUECO_MAXIMO_DE_LA_REFERENCIA_PANTALLAS } from './censo'
import { perfilPorId, type Perfil } from './perfiles'
import { censar, documento, type ResultadoDelCenso } from './sitio'
import { conLaPagina, dos, guardarJson, procedencia } from './b-comun'

const PASO_PX = 120

/** Los cuatro de abajo del umbral, más `1025` — el otro lado del par. */
const A_MEDIR: readonly Perfil[] = ['375', '393', '768', '1024', '1025'].map(perfilPorId)

interface FilaDelCenso {
  readonly perfil: string
  readonly ancho: number
  readonly alto: number
  readonly debajoDelUmbral: boolean
  readonly desde: number
  readonly hasta: number
  readonly paso: number
  readonly paradas: number
  readonly ventanaDeFusionPx: number
  readonly ventanaDeFusionPantallas: number
  readonly sinSistemaDeMovimiento: boolean
  readonly estiloPorParadaMax: number
  readonly estiloPorParadaMin: number
  readonly estiloPorParada: readonly number[]
  readonly acontecimientos: number
  readonly piezasTotales: number
  readonly huecoMaximoPantallas: number | null
  readonly huecoMedioPantallas: number | null
  readonly huecosPantallas: readonly number[]
  readonly montajes: number
  readonly grupos: readonly { readonly ini: number; readonly fin: number; readonly piezas: number }[]
}

function fila(perfil: Perfil, r: ResultadoDelCenso, rango: { readonly desde: number; readonly hasta: number }): FilaDelCenso {
  const serie = r.lectura.estiloPorParada
  return {
    perfil: perfil.id,
    ancho: perfil.ancho,
    alto: perfil.alto,
    debajoDelUmbral: perfil.debajoDelUmbral,
    desde: rango.desde,
    hasta: rango.hasta,
    paso: PASO_PX,
    paradas: serie.length,
    ventanaDeFusionPx: 2 * PASO_PX,
    ventanaDeFusionPantallas: dos((2 * PASO_PX) / r.lectura.ventana),
    sinSistemaDeMovimiento: r.sinSistemaDeMovimiento,
    estiloPorParadaMax: serie.length === 0 ? 0 : Math.max(...serie),
    estiloPorParadaMin: serie.length === 0 ? 0 : Math.min(...serie),
    estiloPorParada: serie,
    acontecimientos: r.censo.acontecimientos,
    piezasTotales: r.censo.piezasTotales,
    huecoMaximoPantallas: r.censo.huecoMaximoPantallas,
    huecoMedioPantallas: r.censo.huecoMedioPantallas,
    huecosPantallas: r.censo.huecosPantallas,
    montajes: r.lectura.montajes.length,
    grupos: r.censo.grupos,
  }
}

async function principal(): Promise<void> {
  const filas: FilaDelCenso[] = []
  for (const perfil of A_MEDIR) {
    const f = await conLaPagina(perfil, '/v3', async ({ pagina }) => {
      const doc = await documento(pagina)
      const rango = { desde: 0, hasta: Math.max(0, doc.alturaPx - doc.ventanaPx) }
      const r = await censar(pagina, { ...rango, paso: PASO_PX })
      return fila(perfil, r, rango)
    })
    filas.push(f)
    console.log(
      `${f.perfil.padEnd(5)} paradas ${String(f.paradas).padStart(4)} · estilo en línea por parada: ` +
        `min ${f.estiloPorParadaMin} / max ${f.estiloPorParadaMax} · ` +
        `sinSistemaDeMovimiento=${f.sinSistemaDeMovimiento} · acontecimientos ${f.acontecimientos} · ` +
        `piezas ${f.piezasTotales} · hueco máx ${f.huecoMaximoPantallas ?? 'null'} pantallas · ` +
        `medio ${f.huecoMedioPantallas ?? 'null'} · montajes ${f.montajes}`,
    )
  }

  const abajo = filas.find((f) => f.perfil === '1024')
  const arriba = filas.find((f) => f.perfil === '1025')
  const par =
    abajo === undefined || arriba === undefined
      ? null
      : {
          nota: 'mismo alto (768), única variable el ancho — es lo único que la compuerta lee.',
          '1024': { acontecimientos: abajo.acontecimientos, piezas: abajo.piezasTotales, estiloMax: abajo.estiloPorParadaMax, huecoMaximoPantallas: abajo.huecoMaximoPantallas },
          '1025': { acontecimientos: arriba.acontecimientos, piezas: arriba.piezasTotales, estiloMax: arriba.estiloPorParadaMax, huecoMaximoPantallas: arriba.huecoMaximoPantallas },
        }
  if (par !== null) console.log(`\npar 1024/1025: ${JSON.stringify(par)}`)

  const ruta = guardarJson('censo', {
    procedencia: procedencia(
      'scripts-b4/b-censo.ts',
      `censo de acontecimientos de B2-DELTAS §0 vía scripts-b4/censo.ts, paso ${PASO_PX} px, asentamiento por defecto (8 esperas de 140 ms). Sin estrangular. Emulado.`,
    ),
    varaDeB2: {
      huecoMaximoPantallas: HUECO_MAXIMO_DE_LA_REFERENCIA_PANTALLAS,
      bandaObjetivo: [0.67, 1.11],
      medidoA: '1440, en B2, con otro instrumento — se cita, no se resta.',
    },
    comoLeerElCero:
      'un cero con `sinSistemaDeMovimiento: true` y `estiloPorParada` toda en cero es EL hallazgo: abajo de 1025 no hay coreografía. Un cero con estiloPorParada > 0 sería otra cosa.',
    parDeLaCompuerta: par,
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
