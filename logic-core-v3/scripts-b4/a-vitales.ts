/**
 * FRENTE A · LCP, CLS, TBT y FCP — sobre el BUILD DE PRODUCCIÓN, estrangulado.
 *
 * ── ⚠️ SOBRE QUÉ BUILD SALE CADA CIFRA, QUE ES EL MODO DE FALLA DEL SPRINT ─
 *
 * Sobre **`prod (.next-probe, 3005)`**: `next start` con el `distDir` aislado
 * del build ya hecho. **No sobre el `next dev` del 3002**, que va sin minificar,
 * sin tree-shaking y con HMR: una cifra de LCP tomada ahí no describe al sitio.
 * Cada fila del JSON lleva su `build` escrito.
 *
 * ── LAS DOS CARGAS, que es el hallazgo que la Fase 0 dejó servido ────────
 *
 * La receta del equipo apaga el preloader con `sessionStorage['home:intro']`.
 * Eso es correcto para medir layout — y **borra al visitante nuevo**, que sí ve
 * el preloader y espera 4,275 s.
 *
 * ⚠️ **Y sacar la marca NO alcanza, que es lo que este archivo midió antes de
 * publicar nada.** El gate pre-paint tiene cuatro condiciones y la segunda es
 * `navigator.webdriver !== true`: con un cliente de CDP conectado esa bandera
 * está en `true`, así que **el intro no arma y las dos cargas dan lo mismo**.
 * Medido en `a-gate-del-intro.ts`, con su control positivo. Por eso hay TRES
 * filas por combinación y no dos:
 *
 *   · **primera-visita** — sin la marca y con `navigator.webdriver` restituido a
 *     `false` antes del primer script. Es el visitante nuevo de verdad, CON el
 *     preloader, y es la cifra que le importa al negocio.
 *   · **visita-repetida** — con la marca. Es la carga de la receta y la que los
 *     otros frentes miden.
 *   · **sin-marca-bajo-automatizacion** — sin la marca y sin restituir. Está
 *     para que se vea que es indistinguible de la visita repetida, que es
 *     exactamente el hallazgo de método.
 *
 * Cada medición corre en una **pestaña nueva**: `sessionStorage` es por pestaña,
 * así que una pestaña nueva garantiza que la marca no viaja de una corrida a la
 * siguiente. (El preloader escribe la marca él mismo al terminar: sin pestaña
 * nueva, la segunda «primera visita» ya no lo sería.)
 *
 * ── ⚠️ Y LA CACHÉ, DECLARADA ────────────────────────────────────────────
 *
 * `Network.setCacheDisabled: true` en las TRES. La única variable entre las
 * filas es el gate del intro, así que el delta es atribuible al preloader y a
 * nada más. La consecuencia hay que decirla: **la fila «visita repetida» no
 * tiene la caché caliente que tendría un visitante repetido de verdad** — es la
 * carga de la receta con la red fría, no el mejor caso.
 *
 * ── INP ─────────────────────────────────────────────────────────────────
 *
 * No se mide. Ver `a-observador.ts`: sin interacción real y sostenida no hay una
 * sola entrada que califique, y un 0 sería la ausencia de clicks disfrazada de
 * latencia. Va como `null` con su causa.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina, type Pagina } from './navegador'
import { estrangulamientoPorId, perfilPorId, type Estrangulamiento, type Perfil } from './perfiles'
import { FUENTE_DE_LECTURA, FUENTE_DEL_OBSERVADOR, RESTITUIR_EL_GATE } from './a-observador'

const URL_MEDIDA = 'http://localhost:3005/v3'
const SALIDA = 'docs/rediseno/outputs/b4/a-vitales.json'

/** Cuánto se espera DESPUÉS del `load` antes de leer. El preloader dura 4,275 s
 *  y arranca cuando el JS bootea: con menos que esto, la «primera visita»
 *  devolvería el LCP del overlay y no el del contenido. */
const ASENTAMIENTO_MS = 14_000
const REPETICIONES = 2

type Carga = 'primera-visita' | 'visita-repetida' | 'sin-marca-bajo-automatizacion'

const CARGAS: readonly { readonly id: Carga; readonly marca: boolean; readonly restituir: boolean }[] = [
  { id: 'primera-visita', marca: false, restituir: true },
  { id: 'visita-repetida', marca: true, restituir: false },
  { id: 'sin-marca-bajo-automatizacion', marca: false, restituir: false },
]

interface Lectura {
  readonly falta: boolean
  readonly lcpMs: number | null
  readonly lcp: Record<string, unknown> | null
  readonly lcpCandidatos: number
  readonly cls: number
  readonly clsEventos: number
  readonly fcpMs: number | null
  readonly tbtDesdeFcpHastaLoadMs: number
  readonly tbtDesdeFcpHastaElFinDeLaVentanaMs: number
  readonly tareasLargas: number
  readonly tareaMasLargaMs: number
  readonly navegacion: { readonly loadEventEnd: number } | null
  readonly recursos: number
  readonly bytesTransferidos: number
  readonly errores: readonly string[]
  readonly visibilityState: string
  readonly innerWidth: number
}

async function unaCarga(
  chrome: Awaited<ReturnType<typeof lanzarChrome>>,
  perfil: Perfil,
  estr: Estrangulamiento,
  carga: { readonly marca: boolean; readonly restituir: boolean },
): Promise<Lectura> {
  const p: Pagina = await abrirPagina(chrome)
  try {
    await emular(p, perfil, { estrangulamiento: estr })
    await p.conexion.enviar('Network.setCacheDisabled', { cacheDisabled: true }, p.sessionId)
    if (carga.restituir) {
      await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: RESTITUIR_EL_GATE }, p.sessionId)
    }
    // ⚠️ ANTES de navegar: `layout-shift` y `longtask` no se rebuferean.
    await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: FUENTE_DEL_OBSERVADOR }, p.sessionId)
    await irA(p, URL_MEDIDA, { marcaDeIntro: carga.marca })
    await verificarLaPagina(p, perfil)
    await medir<boolean>(p, `(async () => { await new Promise((r) => setTimeout(r, ${ASENTAMIENTO_MS})); return true })()`)
    return await medir<Lectura>(p, FUENTE_DE_LECTURA)
  } finally {
    await cerrarPagina(p)
  }
}

const mediana = (xs: readonly number[]): number | null => {
  if (xs.length === 0) return null
  const o = [...xs].sort((a, b) => a - b)
  return o.length % 2 === 1 ? o[(o.length - 1) / 2] : Math.round(((o[o.length / 2 - 1] + o[o.length / 2]) / 2) * 10) / 10
}

interface Fila {
  readonly perfil: string
  readonly viewport: string
  readonly estrangulamiento: string
  readonly carga: Carga
  readonly repeticiones: number
  readonly lcpMs: readonly (number | null)[]
  readonly lcpMedianaMs: number | null
  readonly fcpMs: readonly (number | null)[]
  readonly fcpMedianaMs: number | null
  readonly cls: readonly number[]
  readonly clsMediana: number | null
  readonly tbtDesdeFcpHastaLoadMs: readonly number[]
  readonly tbtDesdeFcpHastaElFinDeLaVentanaMs: readonly number[]
  readonly loadEventEndMs: readonly number[]
  readonly tareasLargas: readonly number[]
  readonly tareaMasLargaMs: readonly number[]
  readonly recursos: readonly number[]
  readonly bytesTransferidos: readonly number[]
  readonly elementoLcp: Record<string, unknown> | null
  readonly lcpCandidatos: readonly number[]
  readonly erroresDelObservador: readonly string[]
}

function armarFila(perfil: Perfil, estr: Estrangulamiento, carga: Carga, lecturas: readonly Lectura[]): Fila {
  const num = (f: (l: Lectura) => number | null): (number | null)[] => lecturas.map(f)
  const numeros = (f: (l: Lectura) => number): number[] => lecturas.map(f)
  const lcps = num((l) => l.lcpMs)
  const ultima = lecturas[lecturas.length - 1]
  return {
    perfil: perfil.id,
    viewport: `${perfil.ancho}x${perfil.alto}x${perfil.dpr}`,
    estrangulamiento: `${estr.id} — latencia ${estr.latenciaMs} ms · bajada ${estr.bajadaBps} B/s · CPU ${estr.cpu}x`,
    carga,
    repeticiones: lecturas.length,
    lcpMs: lcps,
    lcpMedianaMs: mediana(lcps.filter((x): x is number => x !== null)),
    fcpMs: num((l) => l.fcpMs),
    fcpMedianaMs: mediana(num((l) => l.fcpMs).filter((x): x is number => x !== null)),
    cls: numeros((l) => l.cls),
    clsMediana: mediana(numeros((l) => l.cls)),
    tbtDesdeFcpHastaLoadMs: numeros((l) => l.tbtDesdeFcpHastaLoadMs),
    tbtDesdeFcpHastaElFinDeLaVentanaMs: numeros((l) => l.tbtDesdeFcpHastaElFinDeLaVentanaMs),
    loadEventEndMs: numeros((l) => l.navegacion?.loadEventEnd ?? -1),
    tareasLargas: numeros((l) => l.tareasLargas),
    tareaMasLargaMs: numeros((l) => l.tareaMasLargaMs),
    recursos: numeros((l) => l.recursos),
    bytesTransferidos: numeros((l) => l.bytesTransferidos),
    elementoLcp: ultima.lcp,
    lcpCandidatos: numeros((l) => l.lcpCandidatos),
    erroresDelObservador: [...new Set(lecturas.flatMap((l) => [...l.errores]))],
  }
}

const COMBINACIONES: readonly { readonly perfil: string; readonly estr: Estrangulamiento['id'] }[] = [
  { perfil: '375', estr: 'movil' },
  { perfil: '1920', estr: 'escritorio' },
  { perfil: '1440', estr: 'escritorio' },
]

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('a'), ancho: 1280, alto: 900 })
  const filas: Fila[] = []
  try {
    for (const c of COMBINACIONES) {
      const perfil = perfilPorId(c.perfil)
      const estr = estrangulamientoPorId(c.estr)
      for (const carga of CARGAS) {
        const lecturas: Lectura[] = []
        for (let i = 0; i < REPETICIONES; i += 1) {
          const l = await unaCarga(chrome, perfil, estr, carga)
          if (l.falta) throw new Error('el observador no se instaló: `window.__b4vitales` no existe')
          if (l.visibilityState !== 'visible' || l.innerWidth === 0) {
            throw new Error(`medición inválida: visibilityState="${l.visibilityState}", innerWidth=${l.innerWidth}`)
          }
          lecturas.push(l)
        }
        const fila = armarFila(perfil, estr, carga.id, lecturas)
        filas.push(fila)
        console.log(
          `${fila.perfil.padEnd(5)} ${carga.id.padEnd(30)} LCP ${String(fila.lcpMedianaMs).padStart(7)} ms · ` +
            `FCP ${String(fila.fcpMedianaMs).padStart(6)} ms · CLS ${String(fila.clsMediana).padStart(6)} · ` +
            `TBT(load) ${String(fila.tbtDesdeFcpHastaLoadMs.join('/')).padStart(9)} ms`,
        )
      }
    }
  } finally {
    await cerrarChrome(chrome)
  }

  const salida = {
    frente: 'a',
    asunto: 'LCP, CLS, TBT y FCP — las dos cargas, con estrangulamiento',
    instrumento:
      'scripts-b4/a-vitales.ts + a-observador.ts — PerformanceObserver instalado con Page.addScriptToEvaluateOnNewDocument ANTES de navegar',
    build: { cual: 'prod (.next-probe, 3005)', url: URL_MEDIDA },
    emulado: true,
    porQueEmulado:
      'viewport y puntero por Emulation.setDeviceMetricsOverride, red y CPU por Network.emulateNetworkConditions y Emulation.setCPUThrottlingRate, sobre el Chrome de esta máquina (Blink). No es un teléfono: ni el motor, ni el dpr real, ni la GPU, ni la térmica.',
    cache: 'DESHABILITADA en las tres cargas (Network.setCacheDisabled), para que la única variable sea el gate del intro.',
    gateDelIntro:
      'la fila `primera-visita` inyecta `Object.defineProperty(navigator,"webdriver",{get:()=>false})` antes del primer script, porque el gate pre-paint (introBoot.tsx) apaga el intro bajo automatización. Sin eso el preloader NO corre y las tres filas serían la misma. Evidencia y control positivo en a-gate-del-intro.json.',
    asentamientoMs: ASENTAMIENTO_MS,
    repeticiones: REPETICIONES,
    inp: null,
    porQueInpEsNull:
      'INP se mide sobre interacciones reales y sostenidas. Una carga sin un solo click no produce una entrada que califique; un 0 sería la ausencia de clicks, no la latencia del sitio.',
    presupuestoDeclarado: { lcpMs: 2500, jsGzipKiB: 300, lighthouse: 80 },
    filas,
  }
  mkdirSync(path.dirname(SALIDA), { recursive: true })
  writeFileSync(SALIDA, `${JSON.stringify(salida, null, 2)}\n`)
  console.log(`\nescrito: ${SALIDA}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
