/**
 * LAS PUERTAS POR LAS QUE EL SDK DE SENTRY ENTRA A LA CARGA INICIAL, y la
 * decisión de SITIO-S9 sobre §7.30, con su razón.
 *
 * Es el archivo que `presupuesto.ts` es para el techo: acá viven las constantes
 * declaradas, el inventario y lo que se PUBLICA; la afirmación vive en el
 * invariante. Se parte por lo de siempre —el invariante cruzaba las 300 líneas—
 * y no cambia una sola medición.
 *
 * ── LO QUE §7.30 DICE, Y DÓNDE SE QUEDA CORTO ─────────────────────────────
 *
 * Dice que el SDK son **142,1 KiB gzip** y que **entra por
 * `src/instrumentation-client.ts`**. Lo primero es el peso del ARCHIVO y es
 * exacto. Lo segundo es incompleto, y es lo que cambia la decisión: ese archivo
 * es un chunk COMPARTIDO de webpack —263 módulos—, y en el build de SITIO-S8 hay
 * **19 chunks de la carga inicial de `/v3`** pidiéndole módulos.
 * `instrumentation-client.ts` es la puerta más grande —el cierre de lo que pide
 * mide 125,4 KiB gzip— pero soltarla no borra el archivo: lo achica hasta donde
 * llegan los otros pedidos.
 *
 * ── LAS DOS RAZONES DE «NO DIFERIR» ───────────────────────────────────────
 *
 *   1. **El techo real de la salida (a) es 77,9 KiB gzip, no 142,1** — el 54,8 %
 *      del chunk. Sale del grafo de módulos del build (`grafo-de-chunks.ts`), no
 *      de restar el archivo entero. `/v3` quedaría en 299,6 KiB gzip, no en los
 *      235,3 que §7.30 proyecta.
 *   2. **Y se paga con la captura que más importa.** Sin `init` corrido,
 *      `Scope.captureException` **devuelve un id y descarta el evento**
 *      (`@sentry/core/build/esm/scope.js:471`), sin avisar en producción. Y los
 *      dos límites de error del sitio público —`src/app/error.tsx` y
 *      `src/app/global-error.tsx`— llaman `captureException` y viajan en la carga
 *      inicial de **las 11 rutas prerenderizadas**. `global-error.tsx` existe
 *      para «la app no pudo cargar»: diferir lo deja mudo en su única ventana.
 *
 * El brief del sprint declara esta salida legítima —*un sitio 142 KiB más
 * liviano que no reporta sus propios errores es peor negocio*—. Acá, además, no
 * son 142.
 *
 * ⚠ **Lee el disco a propósito**: el padrón de puertas y el barredor que lo
 * produce tienen que leerse juntos, o la lista se vence sin que nadie lo note.
 * El `node:fs` no llega a ningún bundle — como `presupuesto.ts`, ningún módulo
 * de la app lo importa: el único consumidor es `__tests__/s9-sentry.invariant.ts`.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

/** La huella que identifica al chunk del SDK, la misma que usa `s8-peso`. Se
 *  repite el literal porque aquel invariante no se puede importar: cierra con
 *  `process.exit`. Identificar por huella y no por nombre es lo que evita que la
 *  medición se venza con el hash del próximo build. */
export const HUELLA_DEL_SDK = 'browserTracingIntegration'

/** Lo medido en SITIO-S8 (`npm run test:s8-peso` §3) y escrito en §7.30. Es la
 *  línea de base contra la que este invariante publica su delta. */
export const BASE_730 = {
  pisoArchivos: 5,
  pisoCrudoKiB: 787.8,
  pisoGzipKiB: 248.3,
  sdkCrudoKiB: 466.8,
  sdkGzipKiB: 142.1,
  v3SinSdkGzipKiB: 235.3,
  medidoEn: 'SITIO-S8 · npm run test:s8-peso §3 · build-manifest rootMainFiles + polyfillFiles',
} as const

/**
 * LO QUE SITIO-S9 MIDIÓ SOBRE EL BUILD DE SITIO-S8, y que §7.30 no tenía. Se
 * publica como DELTA y nunca como afirmación: son cifras del build, y afirmarlas
 * convertiría cualquier rebuild en un rojo que no es un defecto.
 */
export const BASE_S9 = {
  modulosDelChunk: 263,
  puertasEnLaCargaInicial: 19,
  siguenEagerGzipKiB: 61.3,
  techoDiferibleGzipKiB: 77.9,
  tracingCrudoKiB: 52.0,
  tracingGzipKiB: 17.6,
  /** Guardas `__SENTRY_DEBUG__` sin resolver ANTES de `removeDebugLogging`. */ guardasDeDebug: 8,
  /** El chunk del SDK con la bandera de debug APAGADA. El bloque 7 publica el delta. */
  sdkGzipKiB: 142.1,
  sdkCrudoKiB: 466.8,
  medidoEn: 'SITIO-S9 · build de SITIO-S8 en .next · grafo de módulos de webpack',
} as const

export const DECISION = {
  veredicto: 'NO DIFERIR (salida legítima del brief, punto 3)',
  salidaA:
    'lazy-init del SDK: el techo NO es el chunk entero — el bloque 7 lo mide del grafo — y además deja sin ' +
    'cliente a los dos límites de error del sitio público durante la ventana de carga, que es su única ventana.',
  salidaB:
    'browserTracingIntegration fuera del bundle: NO cuesta captura de errores, y el bloque 7 pesa el módulo. ' +
    'Se apaga con `withSentryConfig(…, { webpack: { treeshake: { removeTracing: true } } })` en ' +
    '`next.config.ts` — fuera del alcance de este frente. Cuesta todo el monitoreo de performance: ' +
    'pageload, navegación y web vitals.',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// EL PADRÓN DE PUERTAS
// ═══════════════════════════════════════════════════════════════════════════

export interface PuertaDelSdk {
  readonly archivo: string
  /** Qué le pide al SDK. Es lo que decide cuánto arrastra: `init` arrastra todo. */
  readonly pide: string
  readonly cuando: string
  /** Si viaja en la carga inicial de una ruta del sitio PÚBLICO. */
  readonly enLaCargaInicialPublica: boolean
}

/**
 * Los archivos de CLIENTE que importan `@sentry/nextjs` por valor. Ordenados
 * como los devuelve el barrido del fuente, para poder afirmarlos de una.
 *
 * ⚠️ **La decisión de no diferir se apoya en este inventario.** Si alguien saca
 * el `captureException` de `global-error.tsx`, la razón 2 deja de valer y la
 * decisión hay que volver a tomarla — por eso se afirma la lista ENTERA y no
 * sólo que «hay puertas». Un padrón que se mueve en silencio es una decisión
 * vencida que nadie revisa.
 */
export const PUERTAS_DECLARADAS: readonly PuertaDelSdk[] = [
  { archivo: 'src/app/(protected)/setter/error.tsx', pide: 'captureException', cuando: 'límite de error de /setter', enLaCargaInicialPublica: false },
  { archivo: 'src/app/(protected)/setter/leads/[leadId]/error.tsx', pide: 'captureException', cuando: 'límite de error del detalle de lead', enLaCargaInicialPublica: false },
  { archivo: 'src/app/(protected)/setter/leads/[leadId]/manual/error.tsx', pide: 'captureException', cuando: 'límite de error de la carga manual', enLaCargaInicialPublica: false },
  { archivo: 'src/app/error.tsx', pide: 'captureException', cuando: 'límite de error RAÍZ — toda ruta', enLaCargaInicialPublica: true },
  { archivo: 'src/app/global-error.tsx', pide: 'captureException', cuando: 'el layout raíz mismo tiró — toda ruta', enLaCargaInicialPublica: true },
  { archivo: 'src/components/ui/SectionErrorBoundary.tsx', pide: 'captureException', cuando: 'límites de sección de /admin y /dashboard', enLaCargaInicialPublica: false },
  { archivo: 'src/instrumentation-client.ts', pide: 'init + captureRouterTransitionStart', cuando: 'antes de la hidratación, en TODA ruta', enLaCargaInicialPublica: true },
]

/**
 * El barrido del fuente que produce ese padrón. `import type` no cuenta —se
 * borra al compilar y no llega al navegador— y un archivo de servidor tampoco:
 * `logger.ts` y `persistTurn.ts` importan el mismo especificador y no pesan un
 * byte en el cliente. El discriminador es la directiva `'use client'`, más
 * `instrumentation-client.ts`, que es de cliente por su nombre y no la lleva.
 */
export function puertasEnElFuente(raiz: string): string[] {
  const IMPORTA = /^\s*import\s+(?!type\s)[^;]*?\s+from\s+["']@sentry\/nextjs["']/m
  const encontrados: string[] = []
  const caminar = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const completo = path.join(dir, e.name)
      if (e.isDirectory()) {
        caminar(completo)
        continue
      }
      if (!/\.tsx?$/.test(e.name)) continue
      const relativo = path.relative(raiz, completo).split(path.sep).join('/')
      const crudo = readFileSync(completo, 'utf8')
      const esCliente = /^\s*['"]use client['"]/.test(crudo) || relativo === 'src/instrumentation-client.ts'
      if (esCliente && IMPORTA.test(sinComentarios(crudo))) encontrados.push(relativo)
    }
  }
  caminar(path.join(raiz, 'src'))
  return encontrados.sort()
}

/** Los comentarios fuera: un especificador citado en una explicación no es un
 *  import (§7.25). Replicada acá para no arrastrar `__tests__` a este archivo. */
export function sinComentarios(fuente: string): string {
  return fuente
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/[^\n]*$/gm, ' ')
}

// ═══════════════════════════════════════════════════════════════════════════
// EL SDK INSTALADO — lo que dice su propio código
// ═══════════════════════════════════════════════════════════════════════════

export interface CitaDelSdk {
  readonly que: string
  readonly archivo: string
  readonly aguja: string
  readonly encontrada: boolean
}

/**
 * Las tres líneas del SDK instalado (`@sentry/nextjs` 10.62.0) que sostienen la
 * decisión. Se leen del disco y no se citan de memoria: una cita de una versión
 * que no es la instalada es prosa. Con `agujaAlternativa` el mismo lector corre
 * contra una aguja inventada — es el control positivo.
 */
export function citaDelSdk(raiz: string, agujaAlternativa?: string): CitaDelSdk[] {
  const citas: ReadonlyArray<Omit<CitaDelSdk, 'encontrada'>> = [
    {
      que: '`Scope.captureException` DESCARTA el evento si no hay cliente (y en prod no avisa)',
      archivo: 'node_modules/@sentry/core/build/esm/scope.js',
      aguja: '!this._client',
    },
    {
      que: 'el `init` de Next evalúa `getDefaultIntegrations(options)` al armar `opts`: el llamador no puede sacar browserTracing',
      archivo: 'node_modules/@sentry/nextjs/build/esm/client/index.js',
      aguja: 'defaultIntegrations: getDefaultIntegrations(options)',
    },
    {
      que: 'el único interruptor del tracing es un global de build, y lo prende `withSentryConfig` desde `next.config.ts`',
      archivo: 'node_modules/@sentry/nextjs/build/cjs/config/webpack.js',
      aguja: 'defines.__SENTRY_TRACING__ = false',
    },
  ]
  return citas.map((c) => {
    const p = path.join(raiz, c.archivo)
    const aguja = agujaAlternativa ?? c.aguja
    return { ...c, aguja, encontrada: existsSync(p) && readFileSync(p, 'utf8').includes(aguja) }
  })
}

/**
 * Las integraciones que el SDK instalado arma POR DEFAULT, leídas de los dos
 * `getDefaultIntegrations` que se componen: el de `@sentry/browser` (once) y el
 * de `@sentry/nextjs`, que le suma browserTracing y la normalización de stacks.
 *
 * Sirve para dos cosas distintas: probar que `replayIntegration` **no** está —y
 * entonces `replaysOnErrorSampleRate` no registra nada— y anclar la tabla de la
 * ventana descubierta a lo que el SDK realmente instala.
 */
export function defaultIntegrationsDelSdk(raiz: string): string[] {
  const archivos = [
    'node_modules/@sentry/browser/build/npm/esm/prod/sdk.js',
    'node_modules/@sentry/nextjs/build/esm/client/index.js',
  ]
  const nombres = new Set<string>()
  for (const a of archivos) {
    const p = path.join(raiz, a)
    if (!existsSync(p)) continue
    const texto = readFileSync(p, 'utf8')
    const desde = texto.indexOf('function getDefaultIntegrations')
    if (desde < 0) continue
    const siguiente = texto.indexOf('\nfunction ', desde + 1)
    const cuerpo = texto.slice(desde, siguiente < 0 ? texto.length : siguiente)
    for (const m of cuerpo.matchAll(/\b([a-z][\w$]*Integration)\(/g)) nombres.add(m[1])
  }
  return [...nombres].sort()
}

// ═══════════════════════════════════════════════════════════════════════════
// LA VENTANA DESCUBIERTA, Y EL PESO — se publican
// ═══════════════════════════════════════════════════════════════════════════

export interface IntegracionDelInit {
  readonly nombre: string
  readonly instala: string
}

/**
 * Las integraciones del default que **instalan algo cuando corre `init`** —y no
 * sólo procesan eventos ya capturados—. Son exactamente las que una deferencia
 * dejaría sin instalar durante la ventana, y por eso la ventana no se estima:
 * se enumera. Clasificadas por tener `setup`/`setupOnce` en
 * `@sentry/browser/build/npm/esm/prod/integrations/`; las demás
 * (`httpContext`, `cultureContext`, `linkedErrors`, `dedupe`,
 * `inboundFilters`, `functionToString`) corren en el momento del evento y no
 * pierden nada por llegar tarde.
 */
export const INTEGRACIONES_DEL_INIT: readonly IntegracionDelInit[] = [
  { nombre: 'globalHandlersIntegration', instala: '`window.onerror` y `onunhandledrejection` — los errores no capturados' },
  { nombre: 'browserApiErrorsIntegration', instala: 'envuelve setTimeout, setInterval, rAF, addEventListener y XHR' },
  { nombre: 'breadcrumbsIntegration', instala: 'consola, clicks, fetch/XHR e historial — el CONTEXTO de cada error' },
  { nombre: 'browserSessionIntegration', instala: 'arranca la sesión del navegador (la tasa de sesiones sanas)' },
  { nombre: 'browserTracingIntegration', instala: 'el span de `pageload` desde los tiempos de navegación' },
]

export function publicarLaVentana(tabla: readonly IntegracionDelInit[]): void {
  console.log('  si el SDK se difiriera, esto NO estaría instalado hasta que el chunk asincrónico aterrice:')
  for (const i of tabla) console.log(`    · ${i.nombre.padEnd(30)} ${i.instala}`)
  console.log(
    '  y lo PEOR no es una integración: `captureException` seguiría existiendo y devolviendo un id, ' +
      'pero sin cliente descarta el evento en silencio. Los dos límites de error del sitio público lo llaman.',
  )
}

export interface CifrasDelSdk {
  readonly ruta: string
  readonly archivos: number
  readonly totalGzip: number
  readonly sdkCrudo: number
  readonly sdkGzip: number
  readonly sinSdkGzip: number
  readonly rutas: number
  readonly rutasConBoundary: number
}

export function publicarElPeso(c: CifrasDelSdk): void {
  const kib = (n: number): string => `${(n / 1024).toFixed(1)} KiB`
  const delta = (ahora: number, antes: number): string => `${ahora - antes >= 0 ? '+' : ''}${(ahora - antes).toFixed(1)}`
  const enKiB = (n: number): number => Number((n / 1024).toFixed(1))
  console.log(`  ${c.ruta} entero: ${kib(c.totalGzip)} gzip · ${c.archivos} archivos`)
  console.log(`    el chunk del SDK: ${kib(c.sdkCrudo)} crudo · ${kib(c.sdkGzip)} gzip`)
  console.log(
    `      contra §7.30 (${BASE_730.medidoEn}): ${delta(enKiB(c.sdkCrudo), BASE_730.sdkCrudoKiB)} KiB crudo · ` +
      `${delta(enKiB(c.sdkGzip), BASE_730.sdkGzipKiB)} KiB gzip`,
  )
  console.log(`    sin ese chunk, ${c.ruta} mediría ${kib(c.sinSdkGzip)} gzip (§7.30 dice ${BASE_730.v3SinSdkGzipKiB})`)
  console.log(
    `    ⚠️ pero el chunk NO se puede sacar: ${c.rutasConBoundary} de ${c.rutas} rutas prerenderizadas llevan ` +
      '`app/error` o `app/global-error` en su carga inicial, y los dos piden el SDK.',
  )
  console.log(`  DE QUIÉN ES: ${DECISION.veredicto}. ${DECISION.salidaA}`)
}
