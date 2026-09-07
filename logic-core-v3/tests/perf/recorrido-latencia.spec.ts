import { test, expect, type Page } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { qaLogin } from '../helpers/setter-auth'
import { getSetterQa, newTracker, teardown, disconnect, type SmokeTracker } from '../helpers/setter-db'
import { CASOS, type Caso, type PreparacionCaso } from './_casos'
import { armarPagina, cosechar, engancharRed, mediana, peor, type Medicion } from './_instrumento'

/**
 * P28 — LA TABLA. Corre las diecisiete acciones con registro del recorrido, tres
 * pasadas cada una, y escribe la descomposición de su latencia.
 *
 *   PERF_EXTERNAL_SERVER=1 PERF_SALIDA=docs/…/antes.json npm run test:perf
 *
 * Tres pasadas y no una: este proyecto ya midió 3 de 3 y después 1 de 3 sobre lo
 * mismo (P25). Se reportan la MEDIANA y la PEOR — una sola muestra publica la
 * suerte de esa corrida.
 *
 * Servidor TIBIO: `PERF_EXTERNAL_SERVER=1` contra un `next start` ya levantado.
 * El frío es otra condición y ya está caracterizada (P26): corre 30-45% más
 * lento y abre ventanas que la tibia no tiene.
 */

const PASADAS = Number(process.env.PERF_PASADAS ?? 3)
const SALIDA = process.env.PERF_SALIDA ?? 'tests/perf/.ultima-medicion.json'

const tracker: SmokeTracker = newTracker()
let setterId = ''

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/**
 * Hidratación real, no «cargó»: un clic antes de que React enganche los handlers
 * no dispara nada, y la medición saldría verde midiendo la nada. Se detecta por
 * la fibra que React deja sobre el nodo al hidratar.
 */
async function esperarHidratacion(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const nodos = Array.from(document.querySelectorAll('main button, main input, main a'))
    return nodos.some((nodo) =>
      Object.keys(nodo).some((llave) => llave.startsWith('__reactProps$') || llave.startsWith('__reactFiber$')),
    )
  }, undefined, { timeout: 30_000 })
}

/**
 * El render del servidor, SOLO: un GET de árbol (RSC) a la MISMA URL, en el
 * MISMO estado en que la acción la va a encontrar. Es exactamente lo que cuesta
 * el `router.refresh()` que las acciones disparan. Se descarta la primera de
 * cuatro: en un `next start` la primera visita a una ruta paga su compilación de
 * arranque y ese número no es el de la acción.
 */
async function medirRenderServidor(page: Page, url: string): Promise<number[]> {
  const tiempos = await page.evaluate(async (ruta) => {
    const medidos: number[] = []
    for (let i = 0; i < 4; i++) {
      const arranque = performance.now()
      const respuesta = await fetch(ruta, { headers: { RSC: '1' }, cache: 'no-store' })
      await respuesta.text()
      medidos.push(performance.now() - arranque)
    }
    return medidos
  }, url)
  return tiempos.slice(1).map((valor) => Math.round(valor))
}

/** Que la escritura ocurrió, releída de la base. Sin esto un número rápido podría
 *  ser el de una acción que rebotó. */
async function esperarRegistro(caso: Caso, leadId: string): Promise<boolean> {
  const tope = Date.now() + 20_000
  for (;;) {
    if (await caso.verificar(leadId)) return true
    if (Date.now() > tope) return false
    await new Promise((listo) => setTimeout(listo, 250))
  }
}

type MuestraCaso = Medicion & { registrado: boolean }

type FilaTabla = {
  clave: string
  accion: string
  pantalla: string
  acuseControl: { mediana: number; peor: number }
  acuseResultado: { mediana: number; peor: number } | null
  reflejo: { mediana: number; peor: number }
  escrituraDb: { mediana: number; peor: number }
  renderServidor: { mediana: number; peor: number }
  viajesAccion: number
  viajesRsc: number
  viajesPrefetch: number
  /** En cuántas de las pasadas la pantalla mostró algo distinto tras la acción. */
  cambioPantalla: number
  cambioTexto: { mediana: number; peor: number } | null
  msAccion: { mediana: number; peor: number }
  msRsc: { mediana: number; peor: number }
  redCritica: { mediana: number; peor: number }
  sinExplicar: { mediana: number; peor: number }
  registradoSiempre: boolean
}

function volcar(filas: readonly FilaTabla[], crudo: Record<string, unknown>): void {
  const destino = resolve(process.cwd(), SALIDA)
  mkdirSync(dirname(destino), { recursive: true })
  writeFileSync(
    destino,
    JSON.stringify({ generado: new Date().toISOString(), pasadas: PASADAS, filas, crudo }, null, 2),
    'utf8',
  )
}

/**
 * Mediana y peor de las pasadas, ignorando las que no dieron valor. `null` = no
 * hubo ninguna — y en la tabla eso sale como `0 / 0` para `reflejo` y
 * `sinExplicar`, que NO significa «instantáneo»: significa que el árbol volvió del
 * servidor y no repintó nada en `main`, porque lo que había que mostrar ya
 * estaba (el acuse del autoguardado, que es estado local). Se lee junto a
 * `cambió N/N`, que dice si la pantalla terminó distinta.
 */
function resumen(valores: readonly (number | null)[]): { mediana: number; peor: number } | null {
  const limpios = valores.filter((valor): valor is number => valor !== null)
  if (limpios.length === 0) return null
  return { mediana: mediana(limpios), peor: peor(limpios) }
}

test('P28 · la tabla de latencia de las diecisiete acciones con registro', async ({ page }) => {
  await qaLogin(page, 'setter')

  const filas: FilaTabla[] = []
  const crudo: Record<string, unknown> = {}

  for (const caso of CASOS) {
    const muestras: MuestraCaso[] = []
    let renderServidor: number[] = []

    for (let pasada = 0; pasada < PASADAS; pasada++) {
      const prep: PreparacionCaso = await caso.sembrar(tracker, setterId)
      await page.goto(prep.url, { waitUntil: 'domcontentloaded' })
      await esperarHidratacion(page)

      // El render del servidor se mide en la PRIMERA pasada, con la pantalla en
      // el estado exacto de partida (después de actuar el estado ya cambió).
      if (pasada === 0) renderServidor = await medirRenderServidor(page, prep.url)

      await caso.alistar?.(page, prep)
      await armarPagina(page)
      const red = engancharRed(page)
      await caso.actuar(page, prep)
      const medicion = await cosechar(page, red)
      red.soltar()

      const registrado = await esperarRegistro(caso, prep.leadId)
      muestras.push({ ...medicion, registrado })
    }

    // La escritura contra la base, SOLA: el mismo camino de dominio, en proceso,
    // contra leads gemelos sembrados igual (una escritura por gemelo: varias de
    // estas son transiciones y no se pueden repetir sobre el mismo dossier).
    const escrituras: number[] = []
    for (let pasada = 0; pasada < PASADAS; pasada++) {
      const gemelo = await caso.sembrar(tracker, setterId)
      const arranque = Date.now()
      await caso.escrituraSola(gemelo.leadId, setterId)
      escrituras.push(Date.now() - arranque)
    }

    const reflejos = muestras.map((muestra) => muestra.reflejoMs)
    // El residual va contra el CAMINO CRÍTICO de red, no contra la suma: dos
    // requests en paralelo suman el doble de lo que tardan, y el resto sale
    // negativo — un número imposible que taparía dónde se va el tiempo.
    const residuales = muestras.map((muestra) =>
      muestra.reflejoMs === null ? null : muestra.reflejoMs - muestra.redCriticaMs,
    )

    const fila: FilaTabla = {
      clave: caso.clave,
      accion: caso.titulo,
      pantalla: caso.pantalla,
      acuseControl: resumen(muestras.map((muestra) => muestra.acuseControlMs)) ?? { mediana: 0, peor: 0 },
      acuseResultado: resumen(muestras.map((muestra) => muestra.acuseResultadoMs)),
      reflejo: resumen(reflejos) ?? { mediana: 0, peor: 0 },
      escrituraDb: { mediana: mediana(escrituras), peor: peor(escrituras) },
      renderServidor: { mediana: mediana(renderServidor), peor: peor(renderServidor) },
      viajesAccion: Math.round(mediana(muestras.map((muestra) => muestra.viajesAccion))),
      viajesRsc: Math.round(mediana(muestras.map((muestra) => muestra.viajesRsc))),
      viajesPrefetch: Math.round(mediana(muestras.map((muestra) => muestra.viajesPrefetch))),
      cambioPantalla: muestras.filter((muestra) => muestra.cambioPantalla).length,
      cambioTexto: resumen(muestras.map((muestra) => muestra.cambioTextoMs)),
      msAccion: { mediana: mediana(muestras.map((m) => m.accionMs)), peor: peor(muestras.map((m) => m.accionMs)) },
      msRsc: { mediana: mediana(muestras.map((m) => m.rscMs)), peor: peor(muestras.map((m) => m.rscMs)) },
      redCritica: {
        mediana: mediana(muestras.map((m) => m.redCriticaMs)),
        peor: peor(muestras.map((m) => m.redCriticaMs)),
      },
      sinExplicar: resumen(residuales) ?? { mediana: 0, peor: 0 },
      registradoSiempre: muestras.every((muestra) => muestra.registrado),
    }
    filas.push(fila)
    crudo[caso.clave] = { muestras, escrituras, renderServidor }
    // Se escribe DESPUÉS DE CADA CASO: si el diecisieteavo se rompe, los
    // dieciséis medidos no se pierden con él.
    volcar(filas, crudo)

    console.log(
      `${caso.pantalla.padEnd(6)} ${caso.titulo}`.padEnd(52) +
        ` acuse ${String(fila.acuseControl.mediana).padStart(5)} / ${String(fila.acuseResultado?.mediana ?? '—').padStart(5)}` +
        ` · reflejo ${String(fila.reflejo.mediana).padStart(5)}` +
        ` · db ${String(fila.escrituraDb.mediana).padStart(5)}` +
        ` · render ${String(fila.renderServidor.mediana).padStart(5)}` +
        ` · viajes ${fila.viajesAccion}+${fila.viajesRsc} (pf ${fila.viajesPrefetch})` +
        ` · red ${String(fila.redCritica.mediana).padStart(5)}` +
        ` · resto ${String(fila.sinExplicar.mediana).padStart(5)}` +
        ` · texto ${String(fila.cambioTexto?.mediana ?? '—').padStart(5)}` +
        ` · cambió ${fila.cambioPantalla}/${PASADAS}` +
        ` · registrado ${fila.registradoSiempre ? 'sí' : 'NO'}`,
    )
  }

  const destino = resolve(process.cwd(), SALIDA)
  mkdirSync(dirname(destino), { recursive: true })
  writeFileSync(destino, JSON.stringify({ generado: new Date().toISOString(), pasadas: PASADAS, filas, crudo }, null, 2), 'utf8')
  console.log(`\nTabla escrita en ${destino}`)

  // El instrumento no afirma sobre latencia — afirma que MIDIÓ algo real: las
  // diecisiete escribieron en las tres pasadas. Un caso que dejó de registrar
  // deja de ser una medición y pasa a ser un test roto.
  const mudas = filas.filter((fila) => !fila.registradoSiempre).map((fila) => fila.clave)
  expect(mudas, 'toda acción medida registró en la base, en las tres pasadas').toEqual([])
})
