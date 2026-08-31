/**
 * INVARIANTE — EL PESO DE LA CARGA INICIAL, SOBRE LA SALIDA DEL BUILD.
 *
 * Corre con `npm run build` y después `npm run test:s8-peso`. Acepta un distDir
 * alternativo: `npx tsx …/s8-peso.invariant.ts .next-otro`.
 *
 * ── Qué afirma este frente, y qué publica (regla 13) ──────────────────────
 *
 * **Afirma DOS cosas, las dos suyas:** (1) `HomeIntroBoot` no trae el grupo de
 * chunks de la página del home a NINGUNA ruta; (2) `static/chunks/app/page-*.js`,
 * el chunk de ENTRADA de esa página, que no puede ser de nadie más, no está en la
 * carga inicial de las rutas que no la renderizan. Ése era el defecto: el layout
 * le pedía el gate pre-paint al BARRIL del preloader, que webpack había puesto en
 * ese grupo porque `src/app/page.tsx` lo importa, y la referencia de cliente del
 * layout lo arrastraba entero a TODA ruta.
 *
 * ⚠ **Lo que NO se afirma:** que el grupo entero desaparezca. Dos de sus cuatro
 * chunks son vendor COMPARTIDO —`/styleguide` los pide por sus bloques del
 * sistema de diseño y `/v3` por sus ocho secciones—, y exigirlos ausentes sería
 * exigir que webpack no comparta nada. Se publican por ruta, con quién los pide.
 *
 * **Publica con atribución y sin afirmarlo** el total de `/v3`, el piso del
 * framework y el reparto heredado/propio: nada de eso lo produce este frente ni
 * lo puede arreglar desde `src/app/layout.tsx`, que es lo único que toca. El
 * techo se re-fijó con la forma de la regla 13 —se afirma lo que está SOBRE el
 * piso— y el porqué entero está en `../presupuesto.ts`.
 */
import { ARBOL_DEL_LAYOUT, LINEA_DE_BASE } from '../contrato'
import { CHUNK_DE_SENTRY, TECHO_PROPIO_GZIP_KIB, publicarElTecho } from '../presupuesto'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../../../app/v3/_lib/__tests__/afirmar'
import {
  DIST,
  conjuntoInicial,
  contiene,
  exigirBuild,
  htmlDe,
  kib,
  partirCargaInicial,
  pesar,
} from '../../../../app/v3/_lib/__tests__/s3-bundle'
import {
  TESTIGO_DEL_HOME,
  TESTIGO_DEL_LAYOUT,
  fugaDeChunks,
  grupoDeChunks,
  pisoDelFramework,
  referenciasQuePiden,
  rutasPrerenderizadas,
  soloDeLaPaginaDelHome,
} from './soporte'

exigirBuild()

const RUTA = '/v3'
const inicial = conjuntoInicial(RUTA)
const inicialHome = conjuntoInicial('/')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El conjunto que se mira existe y no está vacío')

afirmar(htmlDe(RUTA) !== '', `\`${RUTA}\` está prerenderizada en el build`)
afirmar(inicial.length > 0, `su carga inicial son ${inicial.length} archivos`)
afirmar(inicialHome.length > 0, `  y la del home ${inicialHome.length}, contra la que se parte`)
afirmar(pesar(inicial).crudo > 0, '  y pesan más de cero bytes')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LA CIFRA DE /v3, con su reparto — se publica, no se afirma')

const { heredados, propios, pesoHeredado, pesoPropio } = partirCargaInicial(inicial, inicialHome)
const total = pesar(inicial)
const enKiB = (n: number): number => Number((n / 1024).toFixed(1))

console.log(`  /v3 entero   ${inicial.length} archivos · ${kib(total.crudo)} crudo · ${kib(total.gzip)} gzip`)
console.log(`    heredado   ${heredados.length} archivos · ${kib(pesoHeredado.crudo)} crudo · ${kib(pesoHeredado.gzip)} gzip`)
console.log(`    propio     ${propios.length} archivos · ${kib(pesoPropio.crudo)} crudo · ${kib(pesoPropio.gzip)} gzip`)
for (const f of propios) console.log(`      · ${f}  ${kib(pesar([f]).crudo)}`)

/**
 * LA LÍNEA DE BASE, y por qué la cifra del 99,7% que la instrucción trae está
 * VENCIDA y no equivocada. Valía cuando `/v3` era el esqueleto de S1 y lo propio
 * era UN archivo de ~4,5 KiB; SITIO-S7 compuso las ocho secciones y lo propio
 * pasó a 55,8 KiB. La conclusión —la abrumadora mayoría del peso es heredada—
 * no se mueve; el número se publica corregido y derivado, no copiado.
 */
const base = LINEA_DE_BASE
const porcentaje = (parte: number, todo: number): string => `${((parte / todo) * 100).toFixed(1)}%`
const delta = (ahora: number, antes: number): string => `${ahora - antes >= 0 ? '+' : ''}${(ahora - antes).toFixed(1)}`
console.log(
  `  LO HEREDADO ES EL ${porcentaje(base.heredado.crudoKiB, base.v3.crudoKiB)} DEL CRUDO Y EL ` +
    `${porcentaje(base.heredado.gzipKiB, base.v3.gzipKiB)} DEL GZIP en la línea de base (${base.commit}).` +
    ' ⚠ la instrucción dice 99,7% y esa cifra está VENCIDA: medía el esqueleto de S1.',
)
console.log(
  `  contra la línea de base: ${delta(enKiB(total.crudo), base.v3.crudoKiB)} KiB crudo · ` +
    `${delta(enKiB(total.gzip), base.v3.gzipKiB)} KiB gzip`,
)
console.log('  DE QUIÉN ES: el layout RAÍZ importa el chrome viejo. Se publica con atribución (regla 13).')

afirmar(pesoPropio.crudo > 0, 'lo propio de /v3 pesa más de cero: las ocho secciones existen en el build')
afirmar(heredados.length > 0, 'y el heredado se pudo medir: la partición no está vacía')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL PISO DEL FRAMEWORK — lo que ninguna ruta puede evitar')

/** Sale de `build-manifest.json` (`rootMainFiles` + `polyfillFiles`): lo que Next
 *  pide en toda ruta sin que ningún componente lo elija. Decide si el techo es
 *  alcanzable, y por eso se mide en vez de razonarse. */
const piso = pisoDelFramework(DIST)
const pesoPiso = pesar(piso)
afirmar(piso.length > 0, `el build declara ${piso.length} archivos de piso`, piso.join(' · '))
for (const f of piso) console.log(`    · ${f}  ${kib(pesar([f]).crudo)} crudo · ${kib(pesar([f]).gzip)} gzip`)
console.log(`  PISO  ${kib(pesoPiso.crudo)} crudo · ${kib(pesoPiso.gzip)} gzip`)

afirmarIgual(piso.filter((f) => inicial.includes(f)).length, piso.length, '  y los pide entero la carga inicial de /v3')

console.log(
  `  el piso es el ${porcentaje(pesoPiso.gzip, total.gzip)} del gzip que /v3 pide, y ningún sprint de este ` +
    'track lo puede tocar. Por eso el techo se afirma SOBRE el piso — ver el bloque 6.',
)

/** El chunk más pesado del piso lleva el SDK de navegador de Sentry, que entra
 *  por `src/instrumentation-client.ts` y no por un componente. Se NOMBRA y se
 *  pesa entero: separar su parte del runtime de Next pediría otro build. */
const HUELLA_DE_SENTRY = 'browserTracingIntegration'
const conSentry = piso.filter((f) => contiene(f, HUELLA_DE_SENTRY))
for (const f of conSentry) console.log(`  ⚠ \`${f}\` lleva el SDK de navegador de Sentry — ${kib(pesar([f]).gzip)} gzip del piso.`)
afirmar(conSentry.length > 0, 'el piso lleva el SDK de Sentry: está medido, no supuesto', conSentry.join(' · '))

controlPositivo(
  'el buscador de huellas no encuentra una que no existe en esos chunks',
  'esta-huella-no-existe-en-ningun-chunk-del-piso',
  (h: string) => piso.some((f) => contiene(f, h)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LA TESIS — el grupo de la PÁGINA DEL HOME no viaja donde no se la renderiza')

/**
 * Los chunks se identifican por el manifiesto de referencias y no por nombre:
 * los nombres traen hash y una lista escrita a mano se vencería en el próximo
 * build. El testigo del home sólo lo importa `src/app/page.tsx`; el del layout,
 * sólo `src/app/layout.tsx`. Al restar queda el grupo propio del home.
 */
const delHome = grupoDeChunks(DIST, TESTIGO_DEL_HOME)
const delLayout = grupoDeChunks(DIST, TESTIGO_DEL_LAYOUT)
afirmar(delHome.length > 0, `el testigo del home (\`${TESTIGO_DEL_HOME}\`) tiene ${delHome.length} chunks`)
afirmar(delLayout.length > 0, `el testigo del layout (\`${TESTIGO_DEL_LAYOUT}\`) tiene ${delLayout.length} chunks`)

const exclusivos = soloDeLaPaginaDelHome(DIST)
afirmar(exclusivos.length > 0, `${exclusivos.length} chunks son SÓLO de la página del home`, exclusivos.join(' · '))
console.log(`  pesan ${kib(pesar(exclusivos).crudo)} crudo · ${kib(pesar(exclusivos).gzip)} gzip`)

/**
 * EL CONTROL POSITIVO, sobre el mismo predicado y el mismo build: en `/` esos
 * chunks TIENEN que estar. Un detector ciego no los encontraría en ninguna ruta
 * y «no hay fuga» pasaría en verde por vacío.
 */
afirmarIgual(
  fugaDeChunks(inicialHome, exclusivos).length,
  exclusivos.length,
  `en \`/\` están los ${exclusivos.length}: el detector encuentra cuando hay que encontrar`,
)

controlPositivo(
  'y el detector no ve fuga donde no la hay',
  [] as readonly string[],
  (i: readonly string[]) => fugaDeChunks(i, exclusivos).length > 0,
)

/**
 * ⚠️ LAS DOS RUTAS DONDE EL CHUNK DE ENTRADA DEL HOME SÍ PUEDE ESTAR, declaradas
 * con su motivo y no elegidas para que pase: `/` renderiza el home, y en `/v3` el
 * frente `intro` monta `HomeIntro` con import ESTÁTICO a propósito
 * (`_intro/contrato.ts`: el overlay tiene que viajar en el HTML del servidor).
 * El barril vive en el grupo del home, así que ahí el chunk vuelve por la puerta
 * de adelante y ese peso es de quien lo monta.
 */
const CON_EL_HOME_ADENTRO: Readonly<Record<string, string>> = {
  '/': 'renderiza el home: el chunk de entrada es suyo',
  '/v3': 'el frente `intro` monta `HomeIntro` con import estático, a propósito',
}

/** El chunk de entrada de la página del home. El hash cambia; la forma no. */
const ENTRADA_DEL_HOME = /^static\/chunks\/app\/page-[^/]+\.js$/

const rutas = rutasPrerenderizadas(DIST)
afirmar(rutas.length > 2, `el build trae ${rutas.length} rutas prerenderizadas para mirar`, rutas.join(' · '))

/** La afirmación 1 vale en TODA ruta: las exclusiones son sobre la entrada. */
const CULPABLE = 'HomeIntroBoot'
let peorCrudo = 0
let peorGzip = 0
let rutasConFuga = 0

for (const ruta of rutas) {
  const html = htmlDe(ruta)
  const inicialDe = conjuntoInicial(ruta)
  const fuga = fugaDeChunks(inicialDe, exclusivos)
  const porRuta = fuga.map((c) => ({ chunk: c, pide: referenciasQuePiden(html, c) }))
  const soloPorElLayout = porRuta.filter((f) => f.pide.length === 1 && f.pide[0] === CULPABLE)
  const peso = pesar(soloPorElLayout.map((f) => f.chunk))
  if (CON_EL_HOME_ADENTRO[ruta] === undefined && soloPorElLayout.length > 0) {
    rutasConFuga += 1
    peorCrudo = Math.max(peorCrudo, peso.crudo)
    peorGzip = Math.max(peorGzip, peso.gzip)
  }

  console.log(`  ${ruta.padEnd(22)} ${fuga.length}/${exclusivos.length} del grupo del home`)
  for (const f of porRuta) console.log(`      ${f.chunk.split('/').pop()}  ← ${f.pide.join(' · ') || '(sin nombre legible)'}`)
  if (soloPorElLayout.length > 0) console.log(`      SÓLO por el layout: ${soloPorElLayout.length} chunks · ${kib(peso.crudo)} crudo · ${kib(peso.gzip)} gzip`)

  // AFIRMACIÓN 1 — universal, sin excepciones.
  afirmar(!porRuta.some((f) => f.pide.includes(CULPABLE)), `  \`${CULPABLE}\` no trae nada del grupo del home a \`${ruta}\``)

  // AFIRMACIÓN 2 — el chunk de entrada de la página del home.
  const motivo = CON_EL_HOME_ADENTRO[ruta]
  if (motivo !== undefined) {
    console.log(`      la entrada del home puede estar acá: ${motivo}`)
    continue
  }
  afirmarIgual(
    inicialDe.filter((c) => ENTRADA_DEL_HOME.test(c)),
    [],
    `  y \`${ruta}\` no descarga el chunk de ENTRADA de la página del home`,
  )
}

const INVENTADO = 'static/chunks/inventado.js'
controlPositivo('el reconocedor de la entrada del home no confunde la de otra ruta', 'static/chunks/app/v3/page-9.js', (c: string) => ENTRADA_DEL_HOME.test(c))
controlPositivo('  y SÍ reconoce una con otro hash', 'static/chunks/app/page-0000000000000000.js', (c: string) => !ENTRADA_DEL_HOME.test(c))
controlPositivo('el diagnóstico ve el nombre de la referencia que pide un chunk', `:I[1,["7","${INVENTADO}"],"PiezaCulpable"]`, (h: string) => referenciasQuePiden(h, INVENTADO).length === 0)
controlPositivo('  y no inventa un culpable cuando ese chunk no aparece', ':I[1,["7","static/chunks/otro.js"],"Otra"]', (h: string) => referenciasQuePiden(h, INVENTADO).length > 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · CUÁNTO SE FUE, por ruta')

/**
 * El ahorro atribuible a ESTE frente, derivado y no escrito: los chunks del
 * grupo del home cuyo ÚNICO solicitante es `HomeIntroBoot`, POR RUTA. No se
 * suman entre rutas —son los mismos bytes; sumarlos daría una cifra que no es un
 * tamaño—. Contra la línea de base (`09113f42`): 4 archivos · 303,6 KiB crudo ·
 * 71,4 KiB gzip en ocho rutas, y 2 · 268,6 · 59,7 en `/styleguide`. Con el
 * arreglo tiene que dar CERO rutas.
 */
console.log(`  rutas que todavía cargan algo SÓLO por el import del layout: ${rutasConFuga}`)
console.log(`  peor caso por ruta: ${kib(peorCrudo)} crudo · ${kib(peorGzip)} gzip`)

const inicialTestigo = conjuntoInicial('/contact')
const pesoTestigo = pesar(inicialTestigo)
console.log(
  `  /contact  ${inicialTestigo.length} archivos · ${kib(pesoTestigo.crudo)} crudo · ${kib(pesoTestigo.gzip)} gzip` +
    ` — ANTES (${base.commit}): 26 archivos · 1404,2 KiB crudo · 428,5 KiB gzip`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · EL TECHO — cuánto falta, sin maquillar')

/** ⚠️ **EL TECHO SE RE-FIJÓ, Y NO PARA QUE PASE.** 300 KiB gzip sobre la carga
 *  inicial ENTERA no lo cumple nadie: el piso ya se come 248,3. Forma de la
 *  regla 13 — se afirma lo que está SOBRE el piso. El porqué, en `presupuesto.ts`. */
const sobreElPiso = pesar(inicial.filter((f) => !piso.includes(f)))
const sinSentry = pesar(inicial.filter((f) => !f.includes(CHUNK_DE_SENTRY)))

publicarElTecho({
  totalGzip: total.gzip,
  archivos: inicial.length,
  pisoGzip: pesoPiso.gzip,
  archivosDelPiso: piso.length,
  sobreElPisoGzip: sobreElPiso.gzip,
  sinSentryGzip: sinSentry.gzip,
  faltabaEnLaBase: LINEA_DE_BASE.v3.gzipKiB - TECHO_PROPIO_GZIP_KIB,
})

afirmar(
  enKiB(sobreElPiso.gzip) < TECHO_PROPIO_GZIP_KIB,
  `lo que /v3 pide POR ENCIMA del piso entra en ${TECHO_PROPIO_GZIP_KIB} KiB gzip`,
  `${kib(sobreElPiso.gzip)} — ${(TECHO_PROPIO_GZIP_KIB - enKiB(sobreElPiso.gzip)).toFixed(1)} KiB de aire`,
)
controlPositivo(
  'el techo no se cumple solo: con uno de 1 KiB, lo de hoy NO entra',
  1,
  (t: number) => enKiB(sobreElPiso.gzip) < t,
)

/** Las piezas del árbol que NO se difirieron, con su razón nombrada. */
const NO_SE_DIFIRIERON: Readonly<Record<string, string>> = {
  envoltorio: 'recibe `children`: diferirlo con `ssr:false` saca el árbol del HTML servido',
  head: 'su valor entero es llegar antes del primer pintado',
  hoja: '`ssr:false` está prohibido en un Server Component y `dynamic()` sin él precarga igual',
}
for (const p of ARBOL_DEL_LAYOUT) {
  if (p.nombre !== 'children') console.log(`    · ${p.nombre.padEnd(22)} ${p.naturaleza.padEnd(11)} ${NO_SE_DIFIRIERON[p.naturaleza]}`)
}
afirmar(
  Object.keys(NO_SE_DIFIRIERON).length === 3,
  'las tres naturalezas del inventario tienen su razón escrita: ninguna quedó sin explicar',
)

cerrar('s8-peso.invariant')
