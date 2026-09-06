/**
 * FRENTE A · EL REPARTO DEL PESO DE `/v3`, ARCHIVO POR ARCHIVO.
 *
 * ── De dónde sale «la carga inicial», y por qué no de un manifiesto ───────
 *
 * De los `<script src>` del HTML PRERENDERIZADO de la ruta
 * (`<dist>/server/app/v3.html`). Es la decisión que `s3-bundle.ts` ya tomó y
 * este archivo la respeta en vez de inventar la suya: ese HTML es literalmente
 * lo que el servidor manda y lo que el navegador pide en el primer viaje. Un
 * manifiesto es una descripción — y `app-build-manifest.json` **ya no existe**
 * en esta versión de Next: se buscó en `.next-probe` y no está.
 *
 * ── SOBRE QUÉ BUILD SALE ESTA TABLA ──────────────────────────────────────
 *
 * Sobre **`.next-probe`**, el build de PRODUCCIÓN que ya estaba hecho en este
 * worktree (`BUILD_ID` = `RNJ_7OrwmSYE84zZiWvNa`). No sobre el `next dev` del
 * 3002: en dev no hay minificación ni tree-shaking, y una cifra de peso tomada
 * ahí no describe al sitio.
 *
 * ── LOS CUATRO GRUPOS, y de dónde sale cada frontera ──────────────────────
 *
 *   1. **piso del framework** — `rootMainFiles` + `polyfillFiles` de
 *      `build-manifest.json`: lo que Next pide en TODA ruta sin que ningún
 *      componente lo elija. Es lo que `presupuesto.ts` publica con su dueño.
 *   2. **SDK de navegador de Sentry** — el archivo DEL PISO que lleva la huella
 *      `browserTracingIntegration` (`puertas-de-sentry.ts`). Se identifica por
 *      CONTENIDO y no por nombre: el nombre del chunk lo elige webpack y cambia
 *      con el grafo, y un descuento que falla hacia el lado que no se nota es
 *      peor que no tenerlo (SITIO-S10, §7.30).
 *   3. **chrome del layout raíz** — lo que `/v3` comparte con el home (`/`) y no
 *      es del piso: el chrome viejo que el layout raíz importa estáticamente.
 *   4. **propio de `/v3`** — lo que `/v3` pide y el home no.
 *
 * ── LOS CONTROLES POSITIVOS, que corren en cada corrida ───────────────────
 *
 * Ninguna de las tres comprobaciones de abajo puede pasar por vacío: cada una
 * corre contra una entrada que TIENE que hacerla fallar y se imprime el
 * resultado. Ver `controles()`.
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

import {
  descontarElSdk,
  PISO_DEL_FRAMEWORK,
  TECHO_PROPIO_GZIP_KIB,
} from '../src/components/layout/carga-diferida/presupuesto'
import { HUELLA_DEL_SDK } from '../src/components/layout/carga-diferida/puertas-de-sentry'

const RAIZ = process.cwd()
const DIST = path.join(RAIZ, '.next-probe')
const SALIDA = 'docs/rediseno/outputs/b4/a-peso.json'

type Grupo = 'piso-del-framework' | 'sdk-de-sentry' | 'chrome-del-layout-raiz' | 'propio-de-v3'

interface Fila {
  readonly archivo: string
  readonly crudoBytes: number
  readonly gzipBytes: number
  readonly crudoKiB: number
  readonly gzipKiB: number
  readonly grupo: Grupo
}

function htmlDe(ruta: string): string {
  const nombre = ruta === '/' ? 'index' : ruta.replace(/^\//, '')
  const archivo = path.join(DIST, 'server', 'app', `${nombre}.html`)
  return existsSync(archivo) ? readFileSync(archivo, 'utf8') : ''
}

/** Los `.js` que pide la carga inicial de una ruta: sus `<script src>`. */
function conjuntoInicial(ruta: string): string[] {
  const encontrados = htmlDe(ruta).matchAll(/\/_next\/(static\/[^"']+?\.js)/g)
  return [...new Set([...encontrados].map((m) => m[1]))].sort()
}

/** Las hojas que pide una ruta: sus `<link rel=stylesheet>`. */
function hojasDe(ruta: string): string[] {
  const encontrados = htmlDe(ruta).matchAll(/\/_next\/(static\/css\/[^"']+?\.css)/g)
  return [...new Set([...encontrados].map((m) => m[1]))].sort()
}

interface Peso {
  readonly crudo: number
  readonly gzip: number
}

function pesarUno(relativo: string): Peso {
  const p = path.join(DIST, relativo)
  if (!existsSync(p)) return { crudo: 0, gzip: 0 }
  const bytes = readFileSync(p)
  return { crudo: statSync(p).size, gzip: gzipSync(bytes).length }
}

function pesar(archivos: readonly string[]): Peso {
  let crudo = 0
  let gzip = 0
  for (const f of archivos) {
    const u = pesarUno(f)
    crudo += u.crudo
    gzip += u.gzip
  }
  return { crudo, gzip }
}

const tieneLaHuella = (relativo: string, huella: string): boolean => {
  const p = path.join(DIST, relativo)
  return existsSync(p) && readFileSync(p, 'utf8').includes(huella)
}

const kib = (n: number): number => Number((n / 1024).toFixed(1))

interface Control {
  readonly nombre: string
  readonly esperado: string
  readonly obtenido: string
  readonly pasa: boolean
}

/**
 * ⚠️ **NINGUNA COMPROBACIÓN VERDE POR VACÍO.** Los tres controles corren contra
 * una entrada que tiene que hacerlos fallar, y el resultado se imprime y se
 * guarda en el JSON.
 */
function controles(inicialV3: readonly string[], portador: string | null): readonly Control[] {
  const marcaFalsa = 'esta-huella-no-existe-en-ningun-chunk-jamas'
  const conMarcaFalsa = inicialV3.filter((f) => tieneLaHuella(f, marcaFalsa))
  const inventado = 'static/chunks/no-existe-este-chunk.js'

  return [
    {
      nombre: 'el buscador de huella NO encuentra una huella inventada',
      esperado: '0 archivos',
      obtenido: `${conMarcaFalsa.length} archivos`,
      pasa: conMarcaFalsa.length === 0,
    },
    {
      nombre: 'y SÍ encuentra la huella real del SDK en la carga inicial',
      esperado: 'exactamente 1 portador',
      obtenido: portador === null ? 'ninguno' : portador,
      pasa: portador !== null,
    },
    {
      nombre: '`descontarElSdk` devuelve null con un portador que no está en el conjunto',
      esperado: 'null',
      obtenido: String(descontarElSdk(inicialV3, inventado)),
      pasa: descontarElSdk(inicialV3, inventado) === null,
    },
    {
      nombre: 'el extractor de `<script src>` NO ve scripts en una ruta que no existe',
      esperado: '0 archivos',
      obtenido: `${conjuntoInicial('/ruta-que-no-existe-jamas').length} archivos`,
      pasa: conjuntoInicial('/ruta-que-no-existe-jamas').length === 0,
    },
  ]
}

function principal(): void {
  if (!existsSync(DIST)) throw new Error(`no existe ${DIST}`)
  const buildId = readFileSync(path.join(DIST, 'BUILD_ID'), 'utf8').trim()

  const manifiesto = JSON.parse(readFileSync(path.join(DIST, 'build-manifest.json'), 'utf8')) as {
    rootMainFiles: string[]
    polyfillFiles: string[]
  }
  const piso = [...manifiesto.rootMainFiles, ...manifiesto.polyfillFiles].sort()

  const inicialV3 = conjuntoInicial('/v3')
  const inicialHome = conjuntoInicial('/')
  if (inicialV3.length === 0) throw new Error('la carga inicial de /v3 salió vacía: el extractor está ciego')

  const portadores = inicialV3.filter((f) => tieneLaHuella(f, HUELLA_DEL_SDK))
  const portador = portadores.length === 1 ? portadores[0] : null

  const grupoDe = (f: string): Grupo => {
    if (portador !== null && f === portador) return 'sdk-de-sentry'
    if (piso.includes(f)) return 'piso-del-framework'
    return inicialHome.includes(f) ? 'chrome-del-layout-raiz' : 'propio-de-v3'
  }

  const filas: Fila[] = inicialV3
    .map((f): Fila => {
      const p = pesarUno(f)
      return {
        archivo: f,
        crudoBytes: p.crudo,
        gzipBytes: p.gzip,
        crudoKiB: kib(p.crudo),
        gzipKiB: kib(p.gzip),
        grupo: grupoDe(f),
      }
    })
    .sort((a, b) => b.gzipBytes - a.gzipBytes)

  const porGrupo = (g: Grupo): Peso => pesar(filas.filter((f) => f.grupo === g).map((f) => f.archivo))
  const total = pesar(inicialV3)
  const sinSdk = descontarElSdk(inicialV3, portador)

  const hojas = hojasDe('/v3')
  const pesoCss = pesar(hojas)

  const chequeos = controles(inicialV3, portador)

  const salida = {
    frente: 'a',
    asunto: 'el reparto del peso de la carga inicial de /v3, archivo por archivo',
    instrumento: 'scripts-b4/a-peso.ts — `<script src>` del HTML prerenderizado + gzipSync de node:zlib',
    build: {
      cual: 'prod (.next-probe)',
      buildId,
      dist: '.next-probe',
      nota: 'NO es el next dev del 3002: sin minificar y sin tree-shaking, una cifra de peso de dev no describe al sitio.',
    },
    emulado: false,
    totales: {
      archivos: inicialV3.length,
      crudoKiB: kib(total.crudo),
      gzipKiB: kib(total.gzip),
    },
    grupos: {
      'piso-del-framework': {
        archivos: filas.filter((f) => f.grupo === 'piso-del-framework').length,
        crudoKiB: kib(porGrupo('piso-del-framework').crudo),
        gzipKiB: kib(porGrupo('piso-del-framework').gzip),
        deQuien: PISO_DEL_FRAMEWORK.deQuien,
      },
      'sdk-de-sentry': {
        archivos: filas.filter((f) => f.grupo === 'sdk-de-sentry').length,
        crudoKiB: kib(porGrupo('sdk-de-sentry').crudo),
        gzipKiB: kib(porGrupo('sdk-de-sentry').gzip),
        portador,
        huella: HUELLA_DEL_SDK,
      },
      'chrome-del-layout-raiz': {
        archivos: filas.filter((f) => f.grupo === 'chrome-del-layout-raiz').length,
        crudoKiB: kib(porGrupo('chrome-del-layout-raiz').crudo),
        gzipKiB: kib(porGrupo('chrome-del-layout-raiz').gzip),
      },
      'propio-de-v3': {
        archivos: filas.filter((f) => f.grupo === 'propio-de-v3').length,
        crudoKiB: kib(porGrupo('propio-de-v3').crudo),
        gzipKiB: kib(porGrupo('propio-de-v3').gzip),
      },
    },
    contraElPresupuesto: {
      techoDeclaradoKiB: TECHO_PROPIO_GZIP_KIB,
      totalGzipKiB: kib(total.gzip),
      sinElSdkGzipKiB: sinSdk === null ? null : kib(pesar(sinSdk).gzip),
      pisoPublicadoEnPresupuestoTsGzipKiB: PISO_DEL_FRAMEWORK.gzipKiB,
      sdkPublicadoEnPresupuestoTsGzipKiB: PISO_DEL_FRAMEWORK.sentryGzipKiB,
    },
    css: {
      hojas,
      crudoKiB: kib(pesoCss.crudo),
      gzipKiB: kib(pesoCss.gzip),
      nota: 'el presupuesto declarado es de JS; el CSS se publica aparte y no entra en la suma de arriba.',
    },
    controlesPositivos: chequeos,
    filas,
  }

  mkdirSync(path.dirname(SALIDA), { recursive: true })
  writeFileSync(SALIDA, `${JSON.stringify(salida, null, 2)}\n`)

  console.log(`build: ${salida.build.cual} · BUILD_ID ${buildId}`)
  console.log(`/v3 carga inicial: ${inicialV3.length} archivos · ${kib(total.crudo)} KiB crudo · ${kib(total.gzip)} KiB gzip`)
  for (const g of ['piso-del-framework', 'sdk-de-sentry', 'chrome-del-layout-raiz', 'propio-de-v3'] as const) {
    const p = porGrupo(g)
    console.log(`  ${g.padEnd(24)} ${String(filas.filter((f) => f.grupo === g).length).padStart(2)} arch · ${String(kib(p.gzip)).padStart(6)} KiB gzip`)
  }
  console.log(`  sin el chunk del SDK: ${sinSdk === null ? 'NO SE PUDO DESCONTAR' : `${kib(pesar(sinSdk).gzip)} KiB gzip`}`)
  console.log(`  CSS de /v3: ${hojas.length} hoja(s) · ${kib(pesoCss.gzip)} KiB gzip`)
  console.log('controles positivos:')
  for (const c of chequeos) console.log(`  ${c.pasa ? 'OK  ' : 'FALLA'} ${c.nombre} — esperado ${c.esperado}, obtenido ${c.obtenido}`)
  if (chequeos.some((c) => !c.pasa)) throw new Error('un control positivo falló: la tabla no se publica como buena')
  console.log(`escrito: ${SALIDA}`)
}

principal()
