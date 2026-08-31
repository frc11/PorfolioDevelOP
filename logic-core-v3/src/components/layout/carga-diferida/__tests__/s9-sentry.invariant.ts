/**
 * INVARIANTE — EL SDK DE NAVEGADOR DE SENTRY EN LA CARGA INICIAL (§7.30).
 * Corre con `npm run test:s9-sentry`. Acepta un distDir alternativo.
 *
 * ── QUÉ DECIDIÓ ESTE FRENTE ───────────────────────────────────────────────
 *
 * **NO diferir el SDK**, por dos mediciones que la instrucción no tenía:
 *
 *   1. **Diferir no devuelve 142,1 KiB gzip, devuelve como MUCHO 77,9.** El chunk
 *      son 263 módulos de webpack y 142 se los piden OTROS 18 chunks de la carga
 *      inicial de `/v3`: el techo sale del grafo, no de restar el archivo entero.
 *   2. **Y cuesta justo la captura que importa.** `error.tsx` y `global-error.tsx`
 *      llaman `captureException` y viajan en las 11 rutas prerenderizadas. Sin
 *      `init`, `Scope.captureException` **devuelve un id y descarta el evento**
 *      (`@sentry/core/build/esm/scope.js:471-474`) y en producción **ni avisa**:
 *      un evento descartado que devuelve un id es peor que no tener Sentry,
 *      porque parece que funciona.
 *
 * Es la salida que el brief declara legítima — y acá además no son 142.
 *
 * ── QUÉ AFIRMA (lo propio) Y QUÉ PUBLICA (regla 13) ───────────────────────
 *
 * **Afirma** lo que sostiene esa decisión y puede cambiar sin que nadie lo note:
 * el `init` en línea con el scrub de PII, el padrón de puertas, las dos citas del
 * SDK instalado, que las tasas de replay muertas no vuelvan sin su integración, y
 * la bandera `removeDebugLogging` en `next.config.ts` con su efecto en el build.
 * **Publica sin afirmar** todo el peso: nada de eso lo produce este frente.
 */
import {
  BASE_S9,
  DECISION,
  HUELLA_DEL_SDK,
  INTEGRACIONES_DEL_INIT,
  PUERTAS_DECLARADAS,
  citaDelSdk,
  defaultIntegrationsDelSdk,
  publicarElPeso,
  publicarLaVentana,
  puertasEnElFuente,
  sinComentarios,
} from '../puertas-de-sentry'
import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from '../../../../app/v3/_lib/__tests__/afirmar'
import { DIST, conjuntoInicial, htmlDe, kib, pesar } from '../../../../app/v3/_lib/__tests__/s3-bundle'
import { RAIZ, leer, rutasPrerenderizadas } from './soporte'
import {
  publicarElDebugLogging,
  publicarElTecho,
  publicarLaSalidaB,
  publicarLasPuertas,
} from './s9-tablas'
import {
  chunkConHuella,
  cierreTransitivo,
  hayBuild,
  masNuevosQueElBuild,
  modulosDeChunk,
  pesarModulos,
  puertasHacia,
  todosLosChunksDe,
} from './grafo-de-chunks'

const RUTA = '/v3'
const CLIENTE = 'src/instrumentation-client.ts'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LA DECISIÓN, sobre el fuente — el SDK arranca EN LÍNEA')

const fuente = leer(CLIENTE)
const arrancaEnLinea = /^import \* as Sentry from '@sentry\/nextjs'$/m.test(fuente) && /Sentry\.init\(/.test(fuente)
const diferido = /await\s+import\(\s*['"]@sentry\/nextjs['"]/.test(fuente) || /import\(\s*['"]@sentry\/nextjs['"]/.test(fuente)

afirmar(arrancaEnLinea, `\`${CLIENTE}\` importa el SDK estático y llama \`Sentry.init\``)
afirmar(!diferido, '  y NO lo carga con un `import()` dinámico: la decisión de este frente es no diferir', DECISION.veredicto)
controlPositivo(
  'el detector de deferencia SÍ ve un `import()` dinámico cuando lo hay',
  "const S = await import('@sentry/nextjs')",
  (t: string) => !/import\(\s*['"]@sentry\/nextjs['"]/.test(t),
)

afirmar(/beforeSend\(/.test(fuente) && /scrubPii\(/.test(fuente), '  conserva `beforeSend` → `scrubPii`: el scrubbing de PII no se tocó')
afirmar(/dsn:\s*process\.env\.NEXT_PUBLIC_SENTRY_DSN/.test(fuente), '  y el DSN sigue saliendo de la variable de entorno, sin literal en el código')
controlPositivo('el lector del DSN no acepta un literal hardcodeado', "dsn: 'https://abc@o1.ingest.sentry.io/2'", (t: string) =>
  /dsn:\s*process\.env\.NEXT_PUBLIC_SENTRY_DSN/.test(t),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL PADRÓN DE PUERTAS — quién más importa el SDK en el cliente')

/**
 * La decisión de arriba se apoya en ESTE inventario. Si mañana alguien saca el
 * `captureException` de `global-error.tsx`, la razón 2 deja de valer y la
 * decisión hay que volver a tomarla — por eso se afirma la lista entera y no
 * sólo que «hay puertas»: un padrón que se mueve en silencio es una decisión
 * vencida que nadie revisa.
 */
const enElFuente = puertasEnElFuente(RAIZ)
afirmarIgual(enElFuente, PUERTAS_DECLARADAS.map((p) => p.archivo), 'el padrón de archivos de cliente que importan `@sentry/nextjs` es el declarado')
for (const p of PUERTAS_DECLARADAS) console.log(`    · ${p.archivo.padEnd(52)} ${p.pide.padEnd(20)} ${p.cuando}`)

controlPositivo(
  'el barredor de puertas no cuenta un `import type` (se borra al compilar)',
  'src/lib/sentry/scrub-pii.ts',
  (a: string) => enElFuente.includes(a),
)
controlPositivo(
  '  ni un archivo de servidor, que no viaja al navegador',
  'src/modules/chatbot/server/logging/logger.ts',
  (a: string) => enElFuente.includes(a),
)

const enLaCargaPublica = PUERTAS_DECLARADAS.filter((p) => p.enLaCargaInicialPublica)
afirmar(enLaCargaPublica.length >= 2, `${enLaCargaPublica.length} de esas puertas viajan en la carga inicial del sitio público`, enLaCargaPublica.map((p) => p.archivo).join(' · '))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · LAS DOS CITAS DEL SDK INSTALADO que hacen fatal a la deferencia')

for (const c of citaDelSdk(RAIZ)) {
  afirmar(c.encontrada, `${c.que} — \`${c.archivo}\``, c.aguja)
}
controlPositivo(
  'el lector del SDK no encuentra una aguja que no está en esos archivos',
  'estaAgujaNoExisteEnElSdkInstalado',
  (aguja: string) => citaDelSdk(RAIZ, aguja).some((c) => c.encontrada),
)

/**
 * La otra salida de §7.30 —`browserTracingIntegration` fuera del bundle— NO es
 * alcanzable desde este frente y no es opinión: el `init` de `@sentry/nextjs`
 * evalúa `getDefaultIntegrations(options)` **mientras arma `opts`**, así que la
 * llamada a `browserTracingIntegration()` existe pase lo que pase con lo que uno
 * le pase en `integrations` o en `defaultIntegrations`. El único interruptor es
 * el global de build `__SENTRY_TRACING__`, y lo prende
 * `withSentryConfig(…, { webpack: { treeshake: { removeTracing: true } } })` en
 * `next.config.ts`, que este frente tiene prohibido tocar. Se publica con dueño.
 */
console.log(`  la salida (b) de §7.30 vive en \`next.config.ts\` — fuera de este frente. ${DECISION.salidaB}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · SESSION REPLAY — las dos opciones muertas, BORRADAS en la parada')

/**
 * ⚠️ **SE LEE SIN COMENTARIOS, Y NO ES PROLIJIDAD: LA PRIMERA VERSIÓN PASÓ EN
 * VERDE POR UN COMENTARIO.** El porqué del borrado NOMBRA las opciones, y el
 * detector —que leía el archivo crudo— seguía afirmando que estaban puestas.
 * Es §7.25 en vivo, y la afirmación de abajo lo demuestra con este archivo.
 */
const codigo = sinComentarios(fuente)
const pideReplay = (f: string): boolean => /replays(OnError|Session)SampleRate/.test(f)
const porDefecto = defaultIntegrationsDelSdk(RAIZ)

afirmar(!pideReplay(codigo), `\`${CLIENTE}\` ya no pide ninguna tasa de replay: las dos se borraron`)
afirmar(
  pideReplay(fuente) && !pideReplay(codigo),
  '  y la PRUEBA de que el podado hace falta: el archivo CRUDO todavía la nombra — en el comentario que explica el borrado — y el podado no',
)
controlPositivo(
  'el detector ve la opción cuando está de verdad, o sea fuera de un comentario',
  '  replaysOnErrorSampleRate: 1.0,',
  (f: string) => !pideReplay(sinComentarios(f)),
)
afirmar(porDefecto.length > 0, `  el SDK instalado arma ${porDefecto.length} integraciones por default`, porDefecto.join(' · '))
afirmar(!porDefecto.includes('replayIntegration'), '  y `replayIntegration` NO está entre ellas: por eso las tasas no registraban nada')
afirmar(
  !/replayIntegration\s*\(/.test(codigo),
  '  y nadie la agrega: borrar las tasas deja el archivo coherente, no a medias',
)
controlPositivo('el lector de integraciones por default ve las que sí están', 'globalHandlersIntegration', (n: string) => !porDefecto.includes(n))
console.log('  borradas en la parada de SITIO-S9: costaban 0 bytes y capturaban 0 replays, y un flag que dice preservar algo que no existe es peor que no estar.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · LA VENTANA QUE UNA DEFERENCIA DEJARÍA DESCUBIERTA')

publicarLaVentana(INTEGRACIONES_DEL_INIT)
afirmar(
  INTEGRACIONES_DEL_INIT.every((i) => porDefecto.includes(i.nombre)),
  'las integraciones de la tabla de la ventana están todas en el default del SDK instalado',
)
noCorre(
  'cuánto DURA esa ventana en milisegundos',
  'pide un navegador con la pestaña visible midiendo el intervalo entre el primer byte y el `init`; este frente no abre navegador, y una medición de tiempo con la pestaña ocluida es cero por construcción (lección de CLAUDE.md). Lo que sí se midió es QUÉ deja de capturarse, arriba.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · EL PESO — se publica, no se afirma')

if (!hayBuild(DIST)) {
  noCorre('todo el bloque del peso', `no existe ${DIST}: corré \`npm run build\` y volvé a correr este invariante`)
  cerrar('s9-sentry.invariant')
}

const vencidos = masNuevosQueElBuild(DIST, RAIZ, PUERTAS_DECLARADAS.map((p) => p.archivo))
if (vencidos.length > 0) {
  noCorre(
    'la medición DESPUÉS, contra la línea de base de §7.30',
    `el build de disco es ANTERIOR a ${vencidos.length} de los archivos que deciden este número (${vencidos.join(' · ')}). Comparar contra §7.30 mediría dos códigos distintos — es §7.31. Corré \`npm run build\` y repetí.`,
  )
} else {
  console.log(`  el build de disco es POSTERIOR a las ${PUERTAS_DECLARADAS.length} puertas: lo que sigue mide el código de hoy.`)
}

const inicial = conjuntoInicial(RUTA)
afirmar(htmlDe(RUTA) !== '', `\`${RUTA}\` está prerenderizada y su carga inicial son ${inicial.length} archivos`)

const sdk = chunkConHuella(DIST, inicial, HUELLA_DEL_SDK)
afirmar(sdk !== null, `el chunk del SDK se identifica por la huella \`${HUELLA_DEL_SDK}\`, no por su nombre`, sdk ?? '(no encontrado)')
controlPositivo('el buscador por huella no inventa un chunk cuando la huella no existe', 'huellaQueNingunChunkTiene', (h: string) => chunkConHuella(DIST, inicial, h) !== null)

if (sdk === null) cerrar('s9-sentry.invariant')

const total = pesar(inicial)
const delSdk = pesar([sdk])
const sinSdk = pesar(inicial.filter((f) => f !== sdk))
const rutas = rutasPrerenderizadas(DIST)
const conBoundary = rutas.filter((r) => /static\/chunks\/app\/(global-)?error-/.test(htmlDe(r)))

publicarElPeso({
  ruta: RUTA,
  archivos: inicial.length,
  totalGzip: total.gzip,
  sdkCrudo: delSdk.crudo,
  sdkGzip: delSdk.gzip,
  sinSdkGzip: sinSdk.gzip,
  rutas: rutas.length,
  rutasConBoundary: conBoundary.length,
})

afirmarIgual(conBoundary.length, rutas.length, 'las 11 rutas prerenderizadas llevan `app/error` o `app/global-error` en su carga inicial')
afirmar(delSdk.gzip > 0, 'el chunk del SDK pesa más de cero: la medición no es vacía', kib(delSdk.gzip))

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · EL TECHO DE LO DIFERIBLE — del grafo de módulos, no de restar el archivo')

const mods = modulosDeChunk(DIST, sdk)
afirmar(mods.size > 0, `el chunk se parte en ${mods.size} módulos de webpack`)
const cubierto = pesarModulos(mods, mods.keys()).crudo / delSdk.crudo
afirmar(cubierto > 0.95, '  y el parser cubre el archivo: no se está midiendo un pedazo', `${(cubierto * 100).toFixed(1)}% de los bytes`)
controlPositivo('el parser de módulos no encuentra módulos en un texto que no es un chunk', 'no soy un chunk de webpack', (t: string) => todosLosChunksDe(t).size > 0)

const puertas = puertasHacia(DIST, inicial.filter((f) => f !== sdk), mods)
const esCliente = (c: string): boolean => c.includes('main-app')
const raicesAjenas = [...mods.keys()].filter((id) => [...puertas].some(([c, ids]) => !esCliente(c) && ids.has(id)))
const siguenEager = cierreTransitivo(mods, raicesAjenas)
const diferibles = [...mods.keys()].filter((id) => !siguenEager.has(id))

const pEager = pesarModulos(mods, siguenEager)
const pDifer = pesarModulos(mods, diferibles)
publicarLasPuertas(RUTA, mods, puertas)
publicarElTecho({
  ruta: RUTA,
  modulos: mods.size,
  puertas: puertas.size,
  totalGzip: total.gzip,
  sdkGzip: delSdk.gzip,
  eager: pEager,
  diferible: pDifer,
})

/** LA SALIDA (b) DE §7.30, PESADA: el módulo de `browserTracingIntegration`,
 *  identificado por la misma huella con la que se encontró el chunk. */
const delTracing = [...mods].filter(([, m]) => m.cuerpo.includes(HUELLA_DEL_SDK)).map(([id]) => id)
const pTracing = pesarModulos(mods, delTracing)
afirmarIgual(delTracing.length, 1, 'el módulo de `browserTracingIntegration` es UNO y se pesa solo')
publicarLaSalidaB(pTracing, delSdk.gzip)

/**
 * ⚠️ **LA TERCERA PALANCA QUE §7.30 NO ANOTABA — APLICADA EN LA PARADA.** Poda
 * los `logger.*` internos del SDK y es la única de las tres que **no cuesta un
 * gramo de cobertura**. Se afirma en los DOS lados y hacen falta los dos: sobre
 * `next.config.ts` —que dice de dónde viene y no prueba nada— y sobre el BUILD
 * —que prueba y no dice de dónde viene—. Es la pareja de `s7-compuerta`.
 */
const CONFIG = leer('next.config.ts')
afirmar(
  /treeshake:\s*\{[^}]*removeDebugLogging:\s*true/.test(sinComentarios(CONFIG)),
  '`next.config.ts` declara `webpack.treeshake.removeDebugLogging: true`',
)
afirmar(
  !/removeTracing:\s*true/.test(sinComentarios(CONFIG)),
  '  y NO declara `removeTracing`: apagar el monitoreo de performance es decisión de producto',
)
controlPositivo(
  'el lector de la bandera no la da por puesta cuando está en falso',
  'webpack: { treeshake: { removeDebugLogging: false } }',
  (f: string) => /treeshake:\s*\{[^}]*removeDebugLogging:\s*true/.test(sinComentarios(f)),
)

const guardas = [...mods.values()].reduce((a, m) => a + (m.cuerpo.match(/__SENTRY_DEBUG__/g) ?? []).length, 0)
afirmarIgual(
  guardas,
  0,
  `y el BUILD lo confirma: cero guardas \`__SENTRY_DEBUG__\` sin resolver, contra las ${BASE_S9.guardasDeDebug} que había antes de la bandera`,
)
publicarElDebugLogging(delSdk.crudo, delSdk.gzip)

afirmar(pDifer.modulos > 0 && pEager.modulos > 0, 'el grafo parte el chunk en dos: ni todo se difiere ni nada se difiere')
afirmar(pDifer.gzip < delSdk.gzip, '  y lo diferible es MENOS que el chunk entero: §7.30 sobreestima el lever', `${kib(pDifer.gzip)} < ${kib(delSdk.gzip)}`)
controlPositivo('el cierre transitivo desde cero semillas no arrastra ningún módulo', [] as readonly string[], (s: readonly string[]) => cierreTransitivo(mods, s).size > 0)
controlPositivo('  y desde TODAS las semillas no deja ninguno afuera', [...mods.keys()], (s: readonly string[]) => cierreTransitivo(mods, s).size < mods.size)

cerrar('s9-sentry.invariant')
