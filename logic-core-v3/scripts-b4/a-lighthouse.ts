/**
 * FRENTE A · LIGHTHOUSE, LAS CUATRO CATEGORÍAS — móvil y escritorio.
 *
 * ── Por qué esto existe si «no se puede» ─────────────────────────────────
 *
 * `MEDICION-B4.md` §6 declara que la categoría **performance** de Lighthouse no
 * la produce esta cadena de herramientas, y la razón está bien: la herramienta
 * `lighthouse_audit` de `chrome-devtools-mcp` la excluye POR DISEÑO (su propia
 * descripción: *«This excludes performance»*), y encima el servidor MCP está
 * tomado por el otro lane.
 *
 * Pero **el bundle de Lighthouse que ese paquete trae adentro no excluye nada**:
 * la exclusión vive en la configuración con la que la herramienta lo llama, no
 * en el motor. Este script importa el bundle directo y lo corre con la
 * configuración por defecto, que trae las cuatro categorías.
 *
 * ── La puerta que PARECÍA estar abierta, y por qué está tapiada ──────────
 *
 * `navigationGather(page, requestor, options)` del bundle
 * (`lighthouse-devtools-mcp-bundle.js:58303`) dice, textual:
 *
 *     if (!page) {
 *       const { hostname = …, port = … } = flags;
 *       lhBrowser = await puppeteer_core_default.connect({ browserURL: … })
 *
 * O sea: con `page` en `undefined` se conectaría al puerto de depuración que se
 * le pase por `flags`, que es el del Chrome propio del banco (`cdp.ts`). Eso es
 * lo que este script intenta.
 *
 * ⚠️ **Y no funciona, por una razón que está en el fuente y se puede citar:**
 * la línea **57537** del bundle dice, entera,
 *
 *     var puppeteer_core_default = {};
 *
 * puppeteer-core está **stubbeado a un objeto vacío**: el servidor MCP le
 * inyecta su propio `page` de puppeteer, así que la rama `!page` es código
 * muerto. El error exacto que devuelve esta corrida es
 * `puppeteer_core_default.connect is not a function`.
 *
 * No hay una segunda puerta al alcance de este sprint: **no existe
 * `puppeteer-core` en `node_modules` de este repo, ni en el `_npx` del paquete,
 * ni global** (verificado), y traerlo sería sumar una dependencia, que la
 * instrucción prohíbe. Construir a mano un `page` compatible con `Driver`
 * —`target().createCDPSession()`, `browser()`, el `TargetManager`, el
 * `ExecutionContext` y el `Fetcher`— es reimplementar puppeteer, que es
 * exactamente el pozo que la instrucción manda no cavar.
 *
 * El script se deja **porque es la evidencia reproducible del intento**: se
 * corre, falla con el mismo mensaje, y escribe el JSON con la causa. La
 * categoría de rendimiento se aproxima por el otro lado, que es de donde sale:
 * LCP, CLS, TBT y FCP medidos con `PerformanceObserver` en `a-vitales.ts`.
 *
 * ── ⚠️ QUÉ TIPO DE CIFRA ES LA QUE SALE ──────────────────────────────────
 *
 * Lighthouse en modo `simulate` **no mide el reloj de pared**: carga la página
 * sin estrangular y después simula la red y la CPU sobre el grafo de
 * dependencias (Lantern). Es la cifra que publica un informe de Lighthouse y es
 * la que el presupuesto declarado nombra —«Lighthouse ≥ 80»—, pero **no es lo
 * mismo que el LCP observado** de `a-vitales.ts`, que sí sale de un
 * `PerformanceObserver` sobre una carga estrangulada de verdad. Las dos cifras
 * están y se declaran por separado; mezclarlas es el modo de falla del sprint.
 *
 * Corre contra el build de PRODUCCIÓN en `.next-probe`, puerto 3005.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'

const BUNDLE =
  'file:///C:/Users/Valentino/AppData/Local/npm-cache/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/third_party/lighthouse-devtools-mcp-bundle.js'

const URL_MEDIDA = 'http://localhost:3005/v3'
const SALIDA = 'docs/rediseno/outputs/b4/a-lighthouse.json'

interface Categoria {
  readonly id: string
  readonly title: string
  readonly score: number | null
}

interface Auditoria {
  readonly id: string
  readonly title: string
  readonly score: number | null
  readonly numericValue?: number
  readonly displayValue?: string
}

interface Lhr {
  readonly lighthouseVersion: string
  readonly requestedUrl: string
  readonly finalDisplayedUrl: string
  readonly categories: Record<string, Categoria>
  readonly audits: Record<string, Auditoria>
  readonly configSettings: { readonly formFactor: string; readonly throttlingMethod: string }
  readonly runWarnings: readonly string[]
}

interface Bundle {
  readonly navigation: (
    page: undefined,
    requestor: string,
    opciones: { readonly flags: Record<string, unknown> },
  ) => Promise<{ readonly lhr: Lhr } | undefined>
}

/** Las constantes del preset de escritorio de Lighthouse, escritas y no nombradas. */
const ESCRITORIO = {
  formFactor: 'desktop',
  screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
  throttling: {
    rttMs: 40,
    throughputKbps: 10 * 1024,
    cpuSlowdownMultiplier: 1,
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0,
  },
} as const

/** Y las del preset móvil, que son las de la configuración por defecto. */
const MOVIL = {
  formFactor: 'mobile',
  screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
  throttling: {
    rttMs: 150,
    throughputKbps: 1.6 * 1024,
    cpuSlowdownMultiplier: 4,
    requestLatencyMs: 150 * 3.75,
    downloadThroughputKbps: 1.6 * 1024 * 0.9,
    uploadThroughputKbps: 750 * 0.9,
  },
} as const

const AUDITORIAS_QUE_IMPORTAN = [
  'largest-contentful-paint',
  'first-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'speed-index',
  'interactive',
  'server-response-time',
  'total-byte-weight',
  'unused-javascript',
]

async function correr(
  bundle: Bundle,
  puerto: number,
  preset: typeof MOVIL | typeof ESCRITORIO,
  id: string,
): Promise<Record<string, unknown>> {
  const r = await bundle.navigation(undefined, URL_MEDIDA, {
    flags: {
      port: puerto,
      hostname: '127.0.0.1',
      logLevel: 'error',
      output: 'json',
      formFactor: preset.formFactor,
      screenEmulation: preset.screenEmulation,
      throttling: preset.throttling,
      throttlingMethod: 'simulate',
    },
  })
  if (r === undefined) throw new Error(`Lighthouse no devolvió resultado para ${id}`)
  const { lhr } = r
  const categorias: Record<string, number | null> = {}
  for (const [clave, c] of Object.entries(lhr.categories)) categorias[clave] = c.score
  const auditorias: Record<string, { valor: number | null; texto: string | null; puntaje: number | null }> = {}
  for (const clave of AUDITORIAS_QUE_IMPORTAN) {
    const a = lhr.audits[clave]
    if (a === undefined) continue
    auditorias[clave] = {
      valor: a.numericValue ?? null,
      texto: a.displayValue ?? null,
      puntaje: a.score,
    }
  }
  return {
    perfilDeLighthouse: id,
    formFactor: lhr.configSettings.formFactor,
    metodoDeEstrangulamiento: lhr.configSettings.throttlingMethod,
    estrangulamiento: preset.throttling,
    version: lhr.lighthouseVersion,
    url: lhr.finalDisplayedUrl,
    categorias,
    auditorias,
    advertencias: lhr.runWarnings,
  }
}

const CAUSA_CONOCIDA = {
  fuente: `${BUNDLE.replace('file:///', '')}:57537`,
  linea: 'var puppeteer_core_default = {};',
  explicacion:
    'puppeteer-core está stubbeado a un objeto vacío en el bundle: el servidor MCP le inyecta su propio `page`, así que la rama `!page` de `navigationGather` (línea 58303) es código muerto y `connect` no existe.',
  descartes: [
    'no hay `puppeteer-core` en node_modules de este repo (verificado)',
    'no hay `puppeteer-core` en el _npx del paquete chrome-devtools-mcp (verificado)',
    'no hay lighthouse ni puppeteer instalados globalmente (npm ls -g: netlify-cli, npm, pnpm)',
    'traer cualquiera de los dos sería sumar una dependencia, prohibido por la instrucción',
    'el servidor MCP `chrome-devtools-mcp` está tomado por el lane de C:\\v3-costura, y su `lighthouse_audit` excluye la categoría performance por diseño',
  ],
}

async function principal(): Promise<void> {
  const modulo = (await import(BUNDLE)) as unknown as Bundle
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('a'), ancho: 1280, alto: 900 })
  const corridas: Record<string, unknown>[] = []
  let fallo: string | null = null
  try {
    corridas.push(await correr(modulo, chrome.puerto, MOVIL, 'movil'))
    console.log('móvil listo')
    corridas.push(await correr(modulo, chrome.puerto, ESCRITORIO, 'escritorio'))
    console.log('escritorio listo')
  } catch (e: unknown) {
    fallo = e instanceof Error ? e.message : String(e)
  } finally {
    await cerrarChrome(chrome)
  }

  const salida = {
    frente: 'a',
    asunto: 'Lighthouse — las cuatro categorías, móvil y escritorio',
    instrumento:
      'scripts-b4/a-lighthouse.ts — el bundle de Lighthouse de chrome-devtools-mcp, importado directo, con `page: undefined` para que se conecte por CDP al Chrome del banco (perfil `a`)',
    build: { cual: 'prod (.next-probe, 3005)', url: URL_MEDIDA },
    emulado: true,
    sePudo: fallo === null,
    error: fallo,
    causa: fallo === null ? null : CAUSA_CONOCIDA,
    notaSobreLaCifra:
      'si corriera, sería modo `simulate` (Lantern): la carga es sin estrangular y la red y la CPU se simulan sobre el grafo. NO es el reloj de pared; para eso está a-vitales.json.',
    corridas,
  }
  mkdirSync(path.dirname(SALIDA), { recursive: true })
  writeFileSync(SALIDA, `${JSON.stringify(salida, null, 2)}\n`)
  if (fallo !== null) {
    console.error(`NO SE PUDO: ${fallo}`)
    console.error(`  causa: ${CAUSA_CONOCIDA.fuente} — ${CAUSA_CONOCIDA.linea}`)
  }
  for (const c of corridas) {
    console.log(`\n${String(c.perfilDeLighthouse)}:`)
    for (const [k, v] of Object.entries(c.categorias as Record<string, number | null>)) {
      console.log(`  ${k.padEnd(20)} ${v === null ? 'null' : Math.round(v * 100)}`)
    }
  }
  console.log(`\nescrito: ${SALIDA}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
