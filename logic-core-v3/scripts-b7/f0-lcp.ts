/**
 * B7 · FASE 0 — EL LCP, SOBRE UN BUILD Y CON LA DEFINICIÓN HEREDADA.
 *
 *     npx tsx scripts-b7/f0-lcp.ts          # contra el 3005 (build de producción)
 *
 * ── ⚠️ POR QUÉ NO SE REUSA `scripts-b4/a-vitales.ts` TAL CUAL ─────────────
 *
 * Porque escribe en `docs/rediseno/outputs/b4/a-vitales.json`, que es **la
 * medición publicada de B4-B**. Correrlo de nuevo la pisaría, y la regla 13 dice
 * que lo heredado se publica, no se sobrescribe. Lo que sí se reusa —y es lo que
 * hace comparables las dos corridas— son **las tres fuentes que definen la
 * medición**: el observador, el lector y el restituidor del gate del intro, los
 * tres importados de `scripts-b4/a-observador.ts` sin tocar una línea.
 *
 * ── Y por qué esto NO se puede medir sobre `next dev` ─────────────────────
 *
 * B5 publicó 364–408 ms de LCP sobre `next dev` y lo declaró no comparable con
 * los 2.378 ms de B4-B. Tenía razón: `next dev` va sin minificar, sin
 * tree-shaking y con HMR. **Esta corrida va contra `next start` sobre
 * `.next-probe`**, que es el mismo `distDir` y el mismo puerto que usó B4-B.
 *
 * ── El elemento LCP, y el defecto de método que lo rodea (`D-B5.2`) ───────
 *
 * El `<h1>` **sale del servidor con la clase del titular grande** y recién pasa
 * a `sr-only` de 1×1 al hidratar. En el instante que el LCP mide, es el titular.
 * Por eso el observador reporta el elemento **con las clases que tenía cuando
 * pintó**, y por eso ninguna medición de píxel puede leer el `<h1>` después de
 * hidratar y creer que eso es el titular.
 */

import { mkdirSync, writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina, type Pagina } from '../scripts-b4/navegador'
import { estrangulamientoPorId, perfilPorId, type Estrangulamiento, type Perfil } from '../scripts-b4/perfiles'
import { FUENTE_DE_LECTURA, FUENTE_DEL_OBSERVADOR, RESTITUIR_EL_GATE } from '../scripts-b4/a-observador'

import { RAIZ_DE_SALIDAS } from './b7-comun'

const URL_MEDIDA = process.env.B7_URL_VITALES ?? 'http://localhost:3005/v3'

/** El asentamiento y las repeticiones son los de B4-B. Cambiarlos rompería la comparación. */
const ASENTAMIENTO_MS = 14_000
const REPETICIONES = 2

interface Lectura {
  readonly falta: boolean
  readonly lcpMs: number | null
  readonly lcp: Record<string, unknown> | null
  readonly cls: number
  readonly fcpMs: number | null
  readonly tbtDesdeFcpHastaLoadMs: number
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

/**
 * Las dos combinaciones que deciden. La de B4-B que **no cumplió** —375 con el
 * preset móvil— y el escritorio de control, que cumplió con holgura.
 *
 * Las dos cargas son las que discriminan: `visita-repetida` es la de la receta;
 * `primera-visita` restituye el gate del intro, o sea el visitante nuevo real.
 */
const COMBINACIONES = [
  { perfil: '375', estr: 'movil' as const, carga: 'visita-repetida', marca: true, restituir: false },
  { perfil: '375', estr: 'movil' as const, carga: 'primera-visita', marca: false, restituir: true },
  { perfil: '1920', estr: 'escritorio' as const, carga: 'visita-repetida', marca: true, restituir: false },
]

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('b7-lcp'), ancho: 1280, alto: 900 })
  const filas: unknown[] = []
  try {
    for (const c of COMBINACIONES) {
      const perfil = perfilPorId(c.perfil)
      const estr = estrangulamientoPorId(c.estr)
      const lecturas: Lectura[] = []
      for (let i = 0; i < REPETICIONES; i += 1) {
        const l = await unaCarga(chrome, perfil, estr, { marca: c.marca, restituir: c.restituir })
        if (l.falta) throw new Error('el observador no se instaló: `window.__b4vitales` no existe')
        if (l.visibilityState !== 'visible' || l.innerWidth === 0) {
          throw new Error(`la pestaña no estaba al frente: ${l.visibilityState} · innerWidth ${l.innerWidth}`)
        }
        lecturas.push(l)
      }
      const lcps = lecturas.map((l) => l.lcpMs).filter((x): x is number => x !== null)
      const fila = {
        url: URL_MEDIDA,
        perfil: perfil.id,
        estrangulamiento: `${estr.id} — latencia ${estr.latenciaMs} ms · bajada ${estr.bajadaBps} B/s · CPU ${estr.cpu}x`,
        carga: c.carga,
        lcpMs: lecturas.map((l) => l.lcpMs),
        lcpMedianaMs: mediana(lcps),
        fcpMs: lecturas.map((l) => l.fcpMs),
        cls: lecturas.map((l) => l.cls),
        tbtMs: lecturas.map((l) => l.tbtDesdeFcpHastaLoadMs),
        tareaMasLargaMs: lecturas.map((l) => l.tareaMasLargaMs),
        loadEventEndMs: lecturas.map((l) => l.navegacion?.loadEventEnd ?? -1),
        recursos: lecturas.map((l) => l.recursos),
        bytesTransferidos: lecturas.map((l) => l.bytesTransferidos),
        elementoLcp: lecturas[lecturas.length - 1].lcp,
      }
      filas.push(fila)
      console.log(
        `· ${perfil.id} ${c.carga}: LCP ${fila.lcpMs.join(' / ')} ms · mediana ${fila.lcpMedianaMs} · CLS ${fila.cls.join('/')} · load ${fila.loadEventEndMs.join('/')}`,
      )
      console.log(`   elemento LCP: ${JSON.stringify(fila.elementoLcp)}`)
    }
  } finally {
    await cerrarChrome(chrome)
  }
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const ruta = `${RAIZ_DE_SALIDAS}/f0-lcp.json`
  writeFileSync(ruta, `${JSON.stringify({ filas }, null, 2)}\n`, 'utf8')
  console.log(`\n→ ${ruta}`)
}

void principal()
