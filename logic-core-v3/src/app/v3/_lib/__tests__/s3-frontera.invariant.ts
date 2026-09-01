/**
 * CHECK DE FRONTERA — propiedades del MOMENTO del sprint, no del código.
 *
 * Corre con `npm run test:s3-frontera`, o con `npm run test:frontera` junto al
 * resto. **NO entra en ningún agregado, y corre ANTES del commit.**
 *
 * ── Por qué está separado de `s3-codigo.invariant.ts` ─────────────────────
 *
 * Todo lo de acá compara el árbol de trabajo contra `HEAD`. Durante el sprint,
 * con los cambios sin commitear, mide algo real: qué tocó el sprint y qué no.
 * **Commiteado y mergeado, `HEAD` ya contiene los cambios y el diff es vacío
 * por construcción** — no porque el sprint se haya portado mal, sino porque el
 * check se quedó sin base.
 *
 * Eso no lo vuelve inútil: lo vuelve **fechado**. Y la fecha ahora está
 * declarada. `evaluarVentana()` decide si hay base; si no la hay, cada
 * comprobación usa `noCorre()` —imprime que NO corrió y por qué— en vez de
 * fallar o, peor, pasar en verde.
 *
 * ── Qué afirma, cuando está dentro de su ventana ──────────────────────────
 *
 *   1. Los archivos prohibidos están **intactos**: `/v3/page.tsx`, el home,
 *      `/probe-escena`, `home-intro/` y los congelados.
 *   1b. `theme-develop.css` cambió sólo en la corrección aprobada: el único
 *      nombre nuevo es el declarado y ningún valor previo se movió.
 *   2. `package.json` cambió **sólo en `scripts`**. Ni una dependencia nueva.
 *
 * Los controles positivos corren SIEMPRE, dentro o fuera de ventana: prueban
 * que los detectores no están ciegos, y eso no depende del momento.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from './afirmar'
import { ARCHIVOS_DEL_SPRINT, leer } from './s3-archivos'
import { enElRepo, esAlta, git, rutasDadasDeAlta, rutasTocadas, tokensDeclaradosEn } from './s3-git'
import { AGREGADOS } from './padron-de-tokens'
import { encabezadoDeFrontera, evaluarVentana } from './s4-ventana'

const tocados = rutasTocadas()

/**
 * El testigo de la ventana son los archivos del propio sprint, y **se los busca
 * entre las ALTAS y no entre los tocados**.
 *
 * ⚠ **ESTO ERA UN DEFECTO DEL DETECTOR, Y LO DESTAPÓ SITIO-S11.** La premisa
 * estaba escrita desde el principio —*«son altas, así que mientras el sprint
 * esté sin commitear tienen que estar tocados»*— pero la comprobación cruzaba
 * los testigos contra `rutasTocadas()`, que no distingue quién los tocó. Y esa
 * diferencia importa: los 35 archivos de S3 están commiteados hace ocho
 * sprints, pero cuatro de ellos —`_estilos/navegacion.css`, `_estilos/foco.css`,
 * `chrome/Navegacion.tsx` y `tipografia/Titular.tsx`— los MODIFICÓ S11. Con eso
 * el detector declaraba DENTRO DE VENTANA un sprint que no era el suyo, y las
 * cuatro afirmaciones de abajo se ponían en rojo midiendo un diff que no les
 * pertenece: dos por los toques declarados de S11 y dos por su propio fechado
 * (`--color-superficie-translucida` ya no puede ser un token «nuevo» contra
 * HEAD, ni puede haber scripts nuevos).
 *
 * **Un alta la hace UNA sola vez quien crea el archivo.** Los sprints que vienen
 * después lo modifican (`M`), nunca lo dan de alta, así que `rutasDadasDeAlta()`
 * separa exactamente los dos estados que se confundían. Es la regla 12 aplicada
 * a su propio detector: un check de frontera fuera de su ventana **declara que
 * no corrió y por qué**, no falla — y para eso el detector tiene que saber
 * cuándo está fuera.
 */
const TESTIGOS = ARCHIVOS_DEL_SPRINT.map(enElRepo)
const ventana = evaluarVentana(TESTIGOS, rutasDadasDeAlta())
console.log(`\n${encabezadoDeFrontera('s3-frontera', ventana)}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los archivos prohibidos están intactos')

const PROHIBIDOS = [
  'src/app/v3/page.tsx',
  'src/app/page.tsx',
  'src/components/3d/HeroArtifact.tsx',
  'src/context/TransitionContext.tsx',
  'src/context/PreloaderContext.tsx',
  'prisma/schema.prisma',
  'auth.ts',
  'src/lib/prisma.ts',
]

/** Los prefijos de directorio que tampoco se tocan. */
const DIRECTORIOS_PROHIBIDOS = [
  'src/app/probe-escena/',
  'src/components/home-intro/',
  'src/app/setter/',
  'src/app/(protected)/setter/',
  'src/app/leados/',
]

const prohibidosEnElRepo = PROHIBIDOS.map(enElRepo)
const directoriosEnElRepo = DIRECTORIOS_PROHIBIDOS.map(enElRepo)

const prohibidosTocados = tocados.filter(
  (ruta) => prohibidosEnElRepo.includes(ruta) || directoriosEnElRepo.some((d) => ruta.startsWith(d)),
)
const propiosVistosPorGit = TESTIGOS.filter((ruta) =>
  tocados.some((t) => t === ruta || (t.endsWith('/') && ruta.startsWith(t))),
)

if (ventana.dentro) {
  afirmarIgual(prohibidosTocados, [], `ninguno de los ${PROHIBIDOS.length} archivos prohibidos fue tocado`)
  /**
   * EL CONTRAPESO, y es el que encontró el error de prefijo.
   *
   * Si las rutas del padrón y las de `git status` no hablan el mismo idioma, la
   * afirmación de arriba pasa en verde SIEMPRE. La única forma de saber que se
   * están comparando de verdad es exigir que las rutas del propio sprint
   * aparezcan en la lista.
   */
  afirmar(
    propiosVistosPorGit.length > 0,
    `git status ve ${propiosVistosPorGit.length} de los ${TESTIGOS.length} archivos del sprint`,
    'sin esto la afirmación de arriba pasaría en verde aunque comparara peras con manzanas',
  )
  afirmar(tocados.length > 0, `y ve ${tocados.length} rutas tocadas en total`)
} else {
  noCorre(
    `ninguno de los ${PROHIBIDOS.length} archivos prohibidos fue tocado`,
    'sin diff contra HEAD, `git status` no distingue "no lo toqué" de "ya está commiteado"',
  )
  noCorre(`git status ve N de los ${TESTIGOS.length} archivos del sprint`, ventana.razon)
  noCorre('y ve N rutas tocadas en total', ventana.razon)
}

controlPositivo(
  'el filtro reconocería un prohibido si apareciera en la lista de tocados',
  [enElRepo('src/app/v3/page.tsx'), enElRepo('src/app/v3/_estilos/cta.css')],
  (rutas) => rutas.filter((r) => prohibidosEnElRepo.includes(r)).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1b · El sistema cambió SÓLO en la corrección aprobada')

const TEMA = 'src/app/theme-develop.css'
/** Sale del padrón declarado, no de un literal repetido acá. */
const CORRECCION_APROBADA = AGREGADOS.map((a) => a.token).sort()

const temaAntes = tokensDeclaradosEn(git('show', `HEAD:${enElRepo(TEMA)}`))
const temaAhora = tokensDeclaradosEn(leer(TEMA))

const nombresNuevos = [...temaAhora.keys()].filter((n) => !temaAntes.has(n)).sort()
const nombresPerdidos = [...temaAntes.keys()].filter((n) => !temaAhora.has(n)).sort()
const valoresMovidos = [...temaAntes.entries()]
  .filter(([n, v]) => temaAhora.has(n) && temaAhora.get(n) !== v)
  .map(([n, v]) => ({ token: n, antes: v, ahora: temaAhora.get(n) }))

if (ventana.dentro) {
  afirmarIgual(nombresNuevos, CORRECCION_APROBADA, 'el único token nuevo es la corrección declarada')
  afirmarIgual(nombresPerdidos, [], 'no se perdió ninguno')
  afirmarIgual(valoresMovidos, [], 'y ningún valor previo se movió')
} else {
  noCorre(
    `el único token nuevo es la corrección declarada [${CORRECCION_APROBADA.join(' ')}]`,
    'HEAD ya trae la corrección, así que el conjunto de nombres nuevos es vacío por construcción',
  )
  noCorre('no se perdió ninguno', ventana.razon)
  noCorre('y ningún valor previo se movió', ventana.razon)
}

afirmar(
  temaAntes.size > 80,
  `el comparador leyó ${temaAntes.size} tokens en HEAD y ${temaAhora.size} ahora`,
  'no es verde por vacío — esto se lee de HEAD y vale dentro o fuera de ventana',
)

controlPositivo(
  'el comparador de valores vería uno movido',
  new Map([...temaAhora, ['--color-fondo', '#000000']]),
  (mapa) =>
    [...temaAntes.entries()].filter(([n, v]) => mapa.has(n) && mapa.get(n) !== v).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Sin dependencias nuevas — package.json cambió sólo en scripts')

interface Paquete {
  readonly dependencies?: Record<string, string>
  readonly devDependencies?: Record<string, string>
  readonly scripts?: Record<string, string>
}

const antes = JSON.parse(git('show', `HEAD:${enElRepo('package.json')}`)) as Paquete
const ahora = JSON.parse(leer('package.json')) as Paquete

const scriptsNuevos = Object.keys(ahora.scripts ?? {}).filter((k) => !(k in (antes.scripts ?? {})))
const scriptsCambiados = Object.keys(antes.scripts ?? {}).filter(
  (k) => (antes.scripts ?? {})[k] !== (ahora.scripts ?? {})[k],
)

if (ventana.dentro) {
  afirmarIgual(ahora.dependencies, antes.dependencies, '`dependencies` idéntico a HEAD')
  afirmarIgual(ahora.devDependencies, antes.devDependencies, '`devDependencies` idéntico a HEAD')
  afirmar(scriptsNuevos.length > 0, `${scriptsNuevos.length} scripts nuevos`, scriptsNuevos.join(' · '))
  afirmarIgual(scriptsCambiados, [], 'y ningún script previo se modificó')
} else {
  noCorre('`dependencies` idéntico a HEAD', ventana.razon)
  noCorre('`devDependencies` idéntico a HEAD', ventana.razon)
  noCorre(
    'N scripts nuevos',
    'HEAD ya trae los scripts del sprint: el conjunto de nuevos es vacío por construcción',
  )
  noCorre('y ningún script previo se modificó', ventana.razon)
}

controlPositivo(
  'el comparador de dependencias vería un agregado',
  { ...antes.dependencies, 'una-dependencia-nueva': '^1.0.0' },
  (deps) => JSON.stringify(deps) === JSON.stringify(antes.dependencies),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El detector de ventana distingue los dos estados')

/**
 * Sin esto, un detector que siempre dijera "fuera de ventana" apagaría este
 * archivo entero para siempre y nadie lo notaría: la salida diría "no corrió"
 * en vez de "falló", que es exactamente lo que se espera ver.
 */
const UN_TESTIGO = TESTIGOS[0]
afirmar(
  evaluarVentana(TESTIGOS, [UN_TESTIGO]).dentro,
  'con un testigo sin commitear, el detector dice DENTRO',
  UN_TESTIGO,
)
afirmar(
  !evaluarVentana(TESTIGOS, []).dentro,
  'con el árbol limpio, dice FUERA',
  evaluarVentana(TESTIGOS, []).razon,
)
controlPositivo(
  'el detector no dice DENTRO por una ruta ajena',
  ['un/archivo/que/no/es/del/sprint.ts'],
  (lista) => evaluarVentana(TESTIGOS, lista).dentro,
)

/**
 * ⚠ **EL CONTROL QUE FALTABA, Y ES EL QUE HABRÍA VISTO EL DEFECTO (SITIO-S11).**
 *
 * El detector se alimentaba de «tocados» y por eso no distinguía el alta de la
 * modificación. Los tres controles de arriba no lo veían: los tres le pasan una
 * lista sintética, y con una lista ya filtrada el filtro no se ejerce. Lo que
 * hay que controlar es **el filtro**, con los tres estados que `git status`
 * emite de verdad.
 */
afirmar(esAlta('??'), 'un archivo sin trackear ES un alta')
afirmar(esAlta('A '), '  y uno agregado al índice también')
controlPositivo('pero una MODIFICACIÓN no: es lo que hace un sprint posterior sobre un archivo ajeno', ' M', esAlta)
controlPositivo('  ni una modificación ya indexada', 'M ', esAlta)
afirmar(
  rutasDadasDeAlta().every((r) => tocados.includes(r)),
  `las ${rutasDadasDeAlta().length} altas son un subconjunto de las ${tocados.length} rutas tocadas`,
  'si no lo fueran, las dos lecturas estarían hablando de árboles distintos',
)

cerrar('s3-frontera.invariant')
