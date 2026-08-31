/**
 * INVARIANTE — EL MONTAJE DEL PRELOADER EN EL HOME NUEVO.
 *
 * Corre con `npm run test:s8-intro`. Se lee todo del DISCO: no compara contra
 * `git`, así que no es un check de frontera y no vence al commitear (regla 12).
 *
 * ── Qué custodia, y qué NO ────────────────────────────────────────────────
 *
 * El preloader está terminado desde S8d y **nunca se había montado en `/v3`**.
 * Montar no es construir: acá no hay una fase nueva, ni un color, ni un
 * instante. Entonces lo que se afirma no es que el preloader funcione —eso lo
 * custodian las cinco suites de `home-intro/`— sino que **sigue siendo el
 * mismo, montado en otra ruta**: el import estático (1), que el montaje
 * consuma en vez de copiar (2), las seis condiciones de §1.2 leídas del código
 * que ya existe (3), los dos congelados intactos (4), el gate armando en `/` y
 * en `/v3` (5), y el peso (6).
 *
 * ⚠ **El intro NO corre bajo automatización** (`navigator.webdriver !== true`,
 * `introBoot.tsx`). Es a propósito y no se toca — pero tiene un corolario que
 * conviene decir en voz alta: **nada de esto se puede verificar con un
 * navegador dirigido.** Lo que se afirma acá es el CABLEADO; que la secuencia
 * se vea bien en `/v3` lo verifica un humano, a ojo, en un navegador real.
 */

import { existsSync } from 'node:fs'

import { frameSceneEntry, SCENE_ENTRY_VIEW } from '@/lib/scene-framing'
import { planIntroFlight, sampleLogoPose } from '@/components/layout/home-intro/introFlight'
import { HOME_INTRO_TIMELINE } from '@/components/layout/home-intro/introTimeline'
import { CONDICION_DE_RUTA, RUTAS_DEL_INTRO } from '@/components/layout/home-intro/introRutas'

import { CONGELADOS_DEL_INTRO, EXPORT_DEL_INTRO, IMPORT_DEL_INTRO, MODULO_DEL_INTRO, PIEZA_QUE_SE_CONSUME } from '../contrato'
import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from '../../_lib/__tests__/afirmar'
import { especificadoresDeImport, existe, leer } from '../../_lib/__tests__/s8-padron'
import { DIST, conjuntoInicial, contiene, kib, partirCargaInicial, pesar } from '../../_lib/__tests__/s3-bundle'

import { BOOT, CONDICIONES, HOME, IDENTIDADES, LAYOUT_RAIZ, MODULO_DEL_PRELOADER, PIEZA, PIEZAS_INTERNAS } from './condiciones'
import { identidad, identidadDeTexto, identificadoresUsados, montaDeFormaEstatica, textosPresentes } from './soporte'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El home lo monta, y el import es ESTÁTICO')

const fuenteHome = leer(HOME)

afirmar(existe(MODULO_DEL_INTRO), `el módulo existe: \`${MODULO_DEL_INTRO}\``)
afirmar(MODULO_DEL_PRELOADER.length > 10, `el módulo del preloader son ${MODULO_DEL_PRELOADER.length} archivos`)
afirmar(
  montaDeFormaEstatica(fuenteHome, IMPORT_DEL_INTRO),
  `el home pide \`${IMPORT_DEL_INTRO}\` con un import ESTÁTICO de valor`,
)
afirmar(
  new RegExp(`import\\s*\\{[^}]*\\b${EXPORT_DEL_INTRO}\\b[^}]*\\}`).test(fuenteHome),
  `  y por el nombre \`${EXPORT_DEL_INTRO}\`, no por defecto`,
)
afirmar(new RegExp(`<${EXPORT_DEL_INTRO}\\s*/>`).test(fuenteHome), '  y lo monta, sin props')

controlPositivo(
  'el detector NO llama estático a un `dynamic(() => import(…))`',
  `const IntroDelHome = dynamic(() => import('${IMPORT_DEL_INTRO}'), { ssr: false })`,
  (f: string) => montaDeFormaEstatica(f, IMPORT_DEL_INTRO),
)
controlPositivo(
  'ni a un `import type`, que se borra al compilar y no pone nada en el HTML',
  `import type { IntroDelHome } from '${IMPORT_DEL_INTRO}'`,
  (f: string) => montaDeFormaEstatica(f, IMPORT_DEL_INTRO),
)
controlPositivo(
  'y no lo encuentra en un archivo que no lo importa',
  "import { Home } from './_secciones/Home'",
  (f: string) => montaDeFormaEstatica(f, IMPORT_DEL_INTRO),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · `IntroDelHome` CONSUME la pieza terminada — no la copia')

const fuenteMontaje = leer(MODULO_DEL_INTRO)

afirmarIgual(
  especificadoresDeImport(fuenteMontaje),
  [PIEZA_QUE_SE_CONSUME],
  `el montaje importa UN solo módulo, y es \`${PIEZA_QUE_SE_CONSUME}\``,
)
afirmar(/<HomeIntro\s*\/>/.test(fuenteMontaje), '  y monta `<HomeIntro />` tal cual, sin props')
afirmar(
  new RegExp(`export function ${EXPORT_DEL_INTRO}\\(\\)`).test(fuenteMontaje),
  `  con export nombrado \`${EXPORT_DEL_INTRO}\` y sin props`,
)
afirmar(!/export default/.test(fuenteMontaje), '  y sin export por defecto')

/**
 * La copia se caza por lo que NO puede aparecer. El detector mira
 * IDENTIFICADORES, así que el docblock del montaje —que nombra `dynamic`,
 * `IntroLogo3D` y `sessionStorage` para explicar por qué el import es
 * estático— no cuenta (§7.25).
 */
const internasEnLaPieza = identificadoresUsados(leer(PIEZA), PIEZAS_INTERNAS)
afirmarIgual(
  identificadoresUsados(fuenteMontaje, PIEZAS_INTERNAS),
  [],
  'el montaje no nombra una sola pieza interna del preloader: es un enchufe, no una copia',
)
afirmar(
  internasEnLaPieza.length >= 5,
  '  y el contrapeso: el MISMO detector encuentra varias en `HomeIntro.tsx`',
  internasEnLaPieza.join(' · '),
)

controlPositivo(
  'el detector de piezas internas ve una copia disfrazada',
  'const engine = useIntroEngine({ running: true })',
  (f: string) => identificadoresUsados(f, PIEZAS_INTERNAS).length === 0,
)
controlPositivo(
  'y no la ve cuando sólo está nombrada en un comentario',
  '/* `IntroLogo3D` pide su canvas con `dynamic`, no con `sessionStorage` */',
  (f: string) => identificadoresUsados(f, PIEZAS_INTERNAS).length > 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las SEIS condiciones de §1.2, leídas del código que ya existe')

for (const condicion of CONDICIONES) {
  titulo(`  ${condicion.numero} · ${condicion.titulo}`)

  if (condicion.exigidos.length > 0) {
    const faltan = condicion.exigidos
      .filter(([archivo, texto]) => textosPresentes(leer(archivo), [texto]).length === 0)
      .map(([archivo, texto]) => `${archivo}: ${texto}`)
    afirmarIgual(faltan, [], `los ${condicion.exigidos.length} texto(s) que la sostienen están`)
    controlPositivo(
      'el lector de textos no encuentra lo que no está',
      'export function nada() { return null }',
      (f: string) => textosPresentes(f, [condicion.exigidos[0][1]]).length > 0,
    )
  }

  if (condicion.prohibidos.length > 0) {
    const culpables = MODULO_DEL_PRELOADER.flatMap((a) =>
      identificadoresUsados(leer(a), condicion.prohibidos).map((s) => `${a}: ${s}`),
    )
    afirmarIgual(culpables, [], `ninguno de los ${MODULO_DEL_PRELOADER.length} archivos lo rompe`)
    controlPositivo(
      'el buscador ve la violación cuando existe de verdad',
      condicion.fuenteRota,
      (f: string) => identificadoresUsados(f, condicion.prohibidos).length === 0,
    )
    controlPositivo(
      'y no la ve cuando el docblock la nombra para negarla',
      `/** ${condicion.fuenteRota} */`,
      (f: string) => identificadoresUsados(f, condicion.prohibidos).length > 0,
    )
  }
}

titulo('  3.6 · El logo NUNCA cambia de tamaño')
/** No se lee del archivo: se mide corriendo el muestreador sobre la secuencia. */
const plan = planIntroFlight(1440, 810)
const destino = frameSceneEntry(1440, 810)
const altos = new Set<number>()
for (let i = 0; i <= 400; i += 1) {
  altos.add(sampleLogoPose(plan, HOME_INTRO_TIMELINE, i / 400).inkHeightPx)
}
const alto = [...altos][0]
afirmar(altos.size === 1, 'el alto de la tinta es UNO solo en los 401 instantes de la secuencia', `${alto.toFixed(2)} px`)
afirmar(
  destino !== null && alto === destino.inkHeightPx,
  '  y es el del destino: nace con el tamaño que va a tener en la escena',
  destino
    ? `${destino.inkWidthPx.toFixed(1)}×${destino.inkHeightPx.toFixed(1)} px · centro X ${destino.centerXPx.toFixed(1)} px sobre 1440×810`
    : 'sin destino',
)
afirmar(
  Math.abs(SCENE_ENTRY_VIEW.pitchDeg - 18.6) < 0.05,
  '  con la elevación de entrada de S9',
  `${SCENE_ENTRY_VIEW.pitchDeg.toFixed(4)}° · yaw ${SCENE_ENTRY_VIEW.yawDeg}°`,
)
controlPositivo(
  'el muestreador no da el mismo alto para cualquier plan: sin ventana medible da 0',
  planIntroFlight(0, 0),
  (p: ReturnType<typeof planIntroFlight>) =>
    sampleLogoPose(p, HOME_INTRO_TIMELINE, 0.5).inkHeightPx === alto,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Los DOS contextos congelados no se editaron — contra el disco')

afirmarIgual(
  [...CONGELADOS_DEL_INTRO],
  Object.keys(IDENTIDADES),
  'los dos congelados del contrato son los dos que se miden',
)
for (const archivo of CONGELADOS_DEL_INTRO) {
  afirmar(identidad(archivo) === IDENTIDADES[archivo], `\`${archivo}\` intacto`, identidad(archivo).slice(0, 16))
}
afirmar(
  leer(PIEZA).includes("setPhase('done')"),
  '`HomeIntro` consume `PreloaderContext` de la única forma correcta: la fase salta a `done`',
)
afirmarIgual(
  MODULO_DEL_PRELOADER.filter((a) =>
    especificadoresDeImport(leer(a)).some((m) => /TransitionContext$/.test(m)),
  ),
  [],
  'y ningún archivo del preloader importa `TransitionContext`',
)

controlPositivo(
  'el hash ve un archivo alterado por un solo carácter',
  `${leer('src/context/PreloaderContext.tsx')} `,
  (c: string) => identidadDeTexto(c) === IDENTIDADES['src/context/PreloaderContext.tsx'],
)
controlPositivo(
  'y el mismo hasher reconoce el contenido intacto — no está ciego',
  leer('src/context/PreloaderContext.tsx'),
  (c: string) => identidadDeTexto(c) !== IDENTIDADES['src/context/PreloaderContext.tsx'],
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El gate pre-paint arma — en `/` y ahora también en `/v3`')

const raiz = leer(LAYOUT_RAIZ)

afirmarIgual([...RUTAS_DEL_INTRO], ['/', '/v3'], 'las dos rutas, con `/` primero: el sitio vivo no cambia')
afirmar(CONDICION_DE_RUTA.includes('"/v3"'), 'la condición del script pre-paint nombra `/v3`', CONDICION_DE_RUTA)
afirmar(CONDICION_DE_RUTA.includes('indexOf('), '  y usa `indexOf`: el script corre antes de cualquier polyfill')
afirmar(leer(BOOT).includes('CONDICION_DE_RUTA'), '  y el script la consume: una sola definición')
afirmar(raiz.includes('<HomeIntroBoot />'), 'el layout raíz inyecta el script pre-paint')
afirmar(
  leer('src/app/globals.css').includes('html:not([data-home-intro]) [data-home-intro-overlay]'),
  'y la regla que esconde el overlay sin la marca sigue en `globals.css`',
)
/**
 * ⚠ La condición que rompería el montaje en silencio: `HomeIntro` llama
 * `usePreloader`, que **tira** si no encuentra proveedor. `/v3` cuelga del
 * layout raíz, así que lo tiene — pero conviene afirmarlo y no suponerlo.
 */
afirmar(
  raiz.indexOf('<PreloaderProvider>') > 0 &&
    raiz.indexOf('<PreloaderProvider>') < raiz.indexOf('{children}') &&
    raiz.indexOf('{children}') < raiz.indexOf('</PreloaderProvider>'),
  '`PreloaderProvider` envuelve `{children}`: `/v3` tiene proveedor y `usePreloader` no tira',
)

controlPositivo(
  'el lector de la lista ve una que no tiene `/v3`',
  ['/'],
  (r: readonly string[]) => JSON.stringify(r) === JSON.stringify(['/', '/v3']),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · EL PESO — lo que se puede medir sin build, y lo que no')

/**
 * Montar el intro de forma estática mete su código en la carga inicial de
 * `/v3`. La pregunta es si eso hace crecer **lo PROPIO** de `/v3`, que es lo
 * que `test:s5-peso` acota en 60 KiB crudo.
 *
 * Se puede adelantar sobre el build de la LÍNEA DE BASE, y la respuesta es que
 * no: el chunk que lleva el overlay ya viaja en la carga inicial de `/v3` HOY,
 * sin que `/v3` monte el intro, porque el layout raíz monta `HomeIntroBoot` del
 * mismo módulo. Es HEREDADO, no propio.
 *
 * ⚠ **Es una predicción, no la medición.** Componer cambia el grafo de módulos
 * y webpack reparticiona: el número que cierra el riesgo sale del build de la
 * Fase 2.
 */
if (!existsSync(DIST)) {
  noCorre(
    'el chunk del overlay ya viaja en la carga inicial de /v3, y por eso es HEREDADO',
    'no hay build en `.next/`. Es la mitad medible del riesgo de `test:s5-peso`.',
  )
} else {
  const inicialV3 = conjuntoInicial('/v3')
  const inicialHome = conjuntoInicial('/')
  const conElOverlay = inicialV3.filter((f) => contiene(f, 'data-home-intro-overlay'))
  afirmar(
    inicialV3.length > 0 && inicialHome.length > 0,
    `carga inicial medida: /v3 ${inicialV3.length} archivos · / ${inicialHome.length}`,
  )
  afirmar(
    conElOverlay.length > 0,
    'el chunk del overlay YA viaja en la carga inicial de /v3',
    `${conElOverlay.join(' · ')} — ${kib(pesar(conElOverlay).crudo)} crudo · ${kib(pesar(conElOverlay).gzip)} gzip`,
  )
  afirmar(
    conElOverlay.every((f) => inicialHome.includes(f)),
    '  y es el MISMO archivo que pide `/`: cuenta como HEREDADO, no como propio de /v3',
  )
  const { propios, pesoPropio } = partirCargaInicial(inicialV3, inicialHome)
  console.log(`  lo propio de /v3: ${propios.length} archivos · ${kib(pesoPropio.crudo)} crudo · presupuesto 60 KiB — ⚠️ sobre ESTE build`)
  controlPositivo(
    'el buscador no encuentra una huella que no existe',
    'data-home-intro-overlay-que-no-existe',
    (h: string) => inicialV3.some((f) => contiene(f, h)),
  )
}

cerrar('s8-intro.invariant')
