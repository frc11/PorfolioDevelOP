/**
 * B7 · FRENTE D — QUÉ DEMORA EL LCP, con el número de cada tramo.
 *
 *     npx tsx scripts-b7/d-lcp-anatomia.ts        # contra el 3005 (build de producción)
 *
 * ── Por qué este archivo existe si el defecto ya está cerrado ─────────────
 *
 * Porque cerrarlo por medición contesta *«¿cruza el techo?»* y no contesta
 * *«¿de qué está hecho?»*. `f0-lcp.ts` publicó 4 corridas de 4 abajo de 2,5 s
 * —2.144 ms de mediana a 375 con el preset móvil— y el defecto no se reproduce.
 * Pero el margen es de 356 ms, o sea **14 %**, y un margen del 14 % sin saber
 * qué lo consume es un defecto dormido.
 *
 * ── La observación que ordena todo lo demás ───────────────────────────────
 *
 * En las SEIS filas de `f0-lcp.json`, **`fcpMs` es idéntico a `lcpMs`**. El
 * elemento LCP es el `<h1>` del hero, que es TEXTO del HTML del servidor: no hay
 * imagen que descargar, no hay canvas, no hay escena. O sea que **nada de lo que
 * pasa después del primer pintado entra en el LCP**, y la pregunta «qué demora
 * el LCP» es exactamente la pregunta «qué demora el primer pintado».
 *
 * Eso descarta de entrada a los sospechosos que un lector supondría: el TBT
 * (165–215 ms), la tarea más larga (215–257 ms) y el `loadEventEnd` (5.2 s)
 * ocurren DESPUÉS y no lo tocan. Lo que lo toca es el camino crítico: el HTML,
 * lo que bloquea el render, y las vueltas de red que hagan falta para tenerlo.
 *
 * ── Qué mide este archivo, entonces ───────────────────────────────────────
 *
 * El camino crítico completo, con `renderBlockingStatus` —que Chrome expone en
 * `PerformanceResourceTiming` y dice cuál recurso bloqueó el render de verdad,
 * en vez de deducirlo de la extensión— más el desglose de la navegación y las
 * fuentes. Todo lo que termina ANTES del FCP, con sus bytes y su espera.
 *
 * ⚠️ Se reusan **las mismas tres fuentes** de `scripts-b4/a-observador.ts` que
 * usaron B4-B y `f0-lcp.ts`: si el FCP saliera de otra definición, ningún tramo
 * de acá se podría restar del total publicado.
 *
 * ⚠️ Y **no aplica ninguna palanca.** La instrucción es explícita: si hay una
 * palanca barata, se dice con su costo y no se aplica sin decir qué cambia.
 */

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina, type Pagina } from '../scripts-b4/navegador'
import { estrangulamientoPorId, perfilPorId } from '../scripts-b4/perfiles'
import { FUENTE_DEL_OBSERVADOR } from '../scripts-b4/a-observador'

import { dos, guardarJson } from './b7-comun'
import { veredictoDelTecho } from './d-lcp-veredicto'
import { LECTOR, type Lectura, type Recurso } from './d-lcp-lectores'

const URL_MEDIDA = process.env.B7_URL_VITALES ?? 'http://localhost:3005/v3'
const PERFIL = perfilPorId('375')
const ESTRANGULAMIENTO = estrangulamientoPorId('movil')
/** Alcanza para el LCP y el `load`: `f0-lcp.json` los pone en 2,1 s y 5,3 s. */
const ASENTAMIENTO_MS = 9_000
const REPETICIONES = 3

async function unaCarga(
  chrome: Awaited<ReturnType<typeof lanzarChrome>>,
  bloquear: readonly string[] = [],
): Promise<Lectura> {
  const p: Pagina = await abrirPagina(chrome)
  try {
    await emular(p, PERFIL, { estrangulamiento: ESTRANGULAMIENTO })
    await p.conexion.enviar('Network.setCacheDisabled', { cacheDisabled: true }, p.sessionId)
    if (bloquear.length > 0) {
      await p.conexion.enviar('Network.setBlockedURLs', { urls: [...bloquear] }, p.sessionId)
    }
    await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: FUENTE_DEL_OBSERVADOR }, p.sessionId)
    await irA(p, URL_MEDIDA, { marcaDeIntro: true })
    await verificarLaPagina(p, PERFIL)
    await medir<boolean>(p, `(async () => { await new Promise((r) => setTimeout(r, ${ASENTAMIENTO_MS})); return true })()`)
    return await medir<Lectura>(p, LECTOR)
  } finally {
    await cerrarPagina(p)
  }
}

export const mediana = (xs: readonly number[]): number =>
  xs.length === 0 ? -1 : dos([...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)])

/** Los chunks de JS de la ruta. Ninguno participa del primer pintado. */
const CHUNKS = ['*/_next/static/chunks/*']

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('b7-d-lcp'), ancho: 900, alto: 900 })
  const cargas: Lectura[] = []
  const sinChunks: Lectura[] = []
  try {
    /**
     * ⚠️ **LOS DOS BRAZOS SE ALTERNAN, Y NO ES UN DETALLE DE ESTILO.**
     *
     * La primera versión corría los tres «completa» y después los tres
     * «sin-chunks», en serie. Con n = 3 y una diferencia del orden de una
     * decena de milisegundos sobre un FCP de 2.100, **el orden ES la
     * medición**: cualquier deriva del sistema operativo, de la caché del
     * proceso o de la GC entra entera en el delta. Así salió publicado un techo
     * de **+24 ms** que una re-corrida independiente devolvió como **−16 ms**:
     * bloquear los chunks habría MEJORADO y EMPEORADO el FCP según quién lo
     * corriera. El número era ruido con signo.
     *
     * Alternándolos, las dos poblaciones comparten el mismo entorno cuadro por
     * cuadro. Es el mismo cuidado que `d-cuadro-largo.ts` ya tenía, y que este
     * archivo no había copiado.
     *
     * ⚠️ **Y el techo se publica con su dispersión.** Una mediana sola, sobre
     * n = 3, no permite distinguir «no hay efecto» de «hay un efecto chico», y
     * la diferencia entre esas dos frases es todo lo que la pregunta pedía.
     */
    for (let i = 0; i < REPETICIONES; i += 1) {
      for (const [nombre, bolsa, bloquear] of [
        ['completa', cargas, [] as readonly string[]],
        ['sin-chunks', sinChunks, CHUNKS as readonly string[]],
      ] as const) {
        const l = await unaCarga(chrome, bloquear)
        if (l.visibilityState !== 'visible' || l.innerWidth === 0) {
          throw new Error(`la pestaña no estaba al frente: ${l.visibilityState} · innerWidth ${l.innerWidth}`)
        }
        if (l.fcpMs === null) throw new Error('sin FCP: el observador no se instaló antes del pintado')
        bolsa.push(l)
        console.log(
          `  ${nombre} ${i + 1}: FCP ${l.fcpMs} · LCP ${l.lcpMs} (${l.lcpTag}, texto=${l.lcpEsTexto}) · ${l.recursos.length} recursos`,
        )
      }
    }
  } finally {
    await cerrarChrome(chrome)
  }

  const ultima = cargas[cargas.length - 1]
  const fcp = ultima.fcpMs ?? 0
  const antesDelFcp = [...ultima.recursos].filter((r) => r.inicio < fcp).sort((a, b) => a.inicio - b.inicio)
  const bloqueantes = ultima.recursos.filter((r) => r.bloqueante === 'blocking')
  const bytesAntesDelFcp = antesDelFcp.reduce((a, r) => a + r.transferidos, 0)
  const n = ultima.navegacion

  /**
   * Las vueltas de red del camino crítico, contadas y valuadas. Es el tramo que
   * ninguna optimización de bytes puede tocar: son idas y vueltas.
   */
  const latenciaMs = ESTRANGULAMIENTO.latenciaMs
  const tramos = [
    { tramo: 'conexión (DNS + TCP), desde 0', hasta: n.conexionFin, ms: dos(n.conexionFin) },
    { tramo: 'HTML — pedido → primer byte', hasta: n.primerByte, ms: dos(n.primerByte - n.pedidoInicio) },
    { tramo: 'HTML — primer byte → completo', hasta: n.htmlCompleto, ms: dos(n.htmlCompleto - n.primerByte) },
    ...bloqueantes.map((r) => ({
      tramo: `bloqueante ${r.nombre} (${(r.transferidos / 1024).toFixed(1)} KiB, espera de red ${r.esperaDeRed} ms)`,
      hasta: r.fin,
      ms: dos(r.fin - r.inicio),
    })),
    { tramo: 'último bloqueante → FCP', hasta: fcp, ms: dos(fcp - Math.max(n.htmlCompleto, ...bloqueantes.map((r) => r.fin))) },
  ]

  const ruta = guardarJson('d-lcp-anatomia', {
    que: 'de qué está hecho el LCP de /v3 a 375 con el preset móvil: el camino crítico completo, tramo por tramo',
    instrumento: 'scripts-b7/d-lcp-anatomia.ts · las MISMAS fuentes de `scripts-b4/a-observador.ts` que usaron B4-B y `f0-lcp.ts`',
    url: URL_MEDIDA,
    perfil: PERFIL.id,
    estrangulamiento: `${ESTRANGULAMIENTO.id} — latencia ${latenciaMs} ms · bajada ${ESTRANGULAMIENTO.bajadaBps} B/s · CPU ${ESTRANGULAMIENTO.cpu}x`,
    carga: 'visita repetida, caché deshabilitado (`Network.setCacheDisabled`)',
    laObservacionQueOrdenaTodo:
      'FCP === LCP en las tres cargas y en las seis filas de `f0-lcp.json`. El elemento LCP es TEXTO del HTML del servidor, así que el LCP es el PRIMER PINTADO: nada posterior (TBT, tarea más larga, `load`) entra en la cifra.',
    fcpMs: cargas.map((c) => c.fcpMs),
    lcpMs: cargas.map((c) => c.lcpMs),
    fcpMedianaMs: mediana(cargas.map((c) => c.fcpMs ?? 0)),
    lcpEsTexto: cargas.every((c) => c.lcpEsTexto),
    navegacion: n,
    recursosAntesDelFcp: antesDelFcp.length,
    bytesAntesDelFcp,
    bloqueantesDelRender: bloqueantes,
    tramosDelCaminoCritico: tramos,
    latenciaEmulada: {
      msPorVuelta: latenciaMs,
      advertencia:
        'la latencia del preset del panel (562,5 ms) es casi cuatro veces la del preset «mobile» de Lighthouse (150 ms). Toda cifra de vuelta de red de esta tabla es CONSERVADORA: el sitio real paga menos.',
    },
    contencionDeAnchoDeBanda: {
      que: 'cuánto del FCP es competencia por el caño con los chunks de JS, que no participan del primer pintado',
      como: '`Network.setBlockedURLs` sobre `*/_next/static/chunks/*`, TODO lo demás igual, mismas repeticiones y mismo observador',
      fcpConTodoMs: cargas.map((c) => c.fcpMs),
      fcpSinLosChunksMs: sinChunks.map((c) => c.fcpMs),
      medianaConTodoMs: mediana(cargas.map((c) => c.fcpMs ?? 0)),
      medianaSinLosChunksMs: mediana(sinChunks.map((c) => c.fcpMs ?? 0)),
      /**
       * ⚠️ El techo va con su dispersión y con un veredicto DERIVADO, no con un
       * número solo. Ver la nota del bucle: la versión que publicaba `24` sin
       * dispersión era ruido con signo, y una re-corrida la dio en `−16`.
       */
      techoMedidoMs: dos(mediana(cargas.map((c) => c.fcpMs ?? 0)) - mediana(sinChunks.map((c) => c.fcpMs ?? 0))),
      rangoConTodoMs: [Math.min(...cargas.map((c) => c.fcpMs ?? 0)), Math.max(...cargas.map((c) => c.fcpMs ?? 0))],
      rangoSinLosChunksMs: [
        Math.min(...sinChunks.map((c) => c.fcpMs ?? 0)),
        Math.max(...sinChunks.map((c) => c.fcpMs ?? 0)),
      ],
      veredicto: veredictoDelTecho(cargas, sinChunks),
      elLcpSigueSiendoElMismoElemento: sinChunks.every((c) => c.lcpEsTexto && c.lcpTag === 'H1'),
      advertencia:
        'NO es una propuesta: una página sin sus chunks no hidrata. Es el TECHO medido de cualquier palanca que cambie el orden o la prioridad de descarga, y hay que restarle lo que esa palanca no pueda recuperar.',
    },
    fuentes: ultima.fuentes,
    recursos: ultima.recursos,
  })

  console.log(`\n  FCP mediana ${mediana(cargas.map((c) => c.fcpMs ?? 0))} ms · LCP mediana ${mediana(cargas.map((c) => c.lcpMs ?? 0))} ms · LCP es texto: ${cargas.every((c) => c.lcpEsTexto)}`)
  console.log(`  navegación: conexión ${n.conexionFin} · primer byte ${n.primerByte} · HTML completo ${n.htmlCompleto} (${(n.htmlTransferido / 1024).toFixed(1)} KiB) · domInteractive ${n.domInteractivo}`)
  console.log(`\n  bloqueantes del render (renderBlockingStatus === 'blocking'): ${bloqueantes.length}`)
  for (const r of bloqueantes) {
    console.log(`    ${r.nombre}  ${(r.transferidos / 1024).toFixed(1)} KiB · ${r.inicio} → ${r.fin} ms (espera de red ${r.esperaDeRed} ms)`)
  }
  console.log(`\n  ${antesDelFcp.length} recursos empiezan antes del FCP, ${(bytesAntesDelFcp / 1024).toFixed(1)} KiB:`)
  for (const r of antesDelFcp) {
    console.log(
      `    ${String(r.inicio).padStart(7)} → ${String(r.fin).padStart(7)} ms  ${(r.transferidos / 1024).toFixed(1).padStart(7)} KiB  ${String(r.bloqueante ?? '—').padEnd(12)} ${r.tipo.padEnd(10)} ${r.nombre}`,
    )
  }
  console.log(`\n  tramos del camino crítico:`)
  for (const t of tramos) console.log(`    ${String(t.ms).padStart(8)} ms   → t=${String(dos(t.hasta)).padStart(8)}   ${t.tramo}`)
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
