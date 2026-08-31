/**
 * INVARIANTE — UN SOLO CONTRATO, Y LA FRONTERA QUE SOSTIENE LA COMPUERTA.
 *
 * Corre con `npm run test:s7-contrato`. Se lee todo del disco: lo que afirma es
 * cierto hoy, mañana y después de cualquier merge. **No compara contra `git`** —
 * eso sería un check de frontera y vencería al commitear.
 *
 * ── Las dos cosas que este archivo custodia ───────────────────────────────
 *
 *   1. **Que el contrato sea UNO.** Había dos, uno por lane, con los mismos
 *      problemas resueltos de formas distintas. Que ya no estén no alcanza: hay
 *      que afirmar que no vuelven, y que ninguna sección importa de un lugar
 *      que no sea el contrato único.
 *
 *   2. **Que el árbol quieto no toque el sistema de motion.** Es la condición
 *      de la que depende toda la compuerta: si una sección importara un valor
 *      de `_lib/motion/`, el sistema volvería a la carga inicial y la compuerta
 *      sería decorativa. `s7-compuerta` lo mide sobre el BUILD; acá se mira el
 *      FUENTE, que es donde se puede decir **cuál** import sobra.
 *
 * Los dos hacen falta. El del build prueba el resultado y no dice de dónde
 * viene; el del fuente dice de dónde viene y no prueba el resultado.
 */

import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import {
  CONTRATO,
  RAIZ,
  SECCIONES,
  importsDe,
  importsDeValor,
  leer,
  recorrer,
  sinComentariosNiCadenas,
} from './s7-soporte'

const TODOS = recorrer(SECCIONES).filter((a) => /\.tsx?$/.test(a))
const INSTRUMENTOS = TODOS.filter(
  (a) => /\.invariant\.tsx?$/.test(a) || a.startsWith(`${SECCIONES}/_invariantes/`),
)
const APOYOS = TODOS.filter((a) => /\/(deteccion|soporte)\.ts$/.test(a))
const PRODUCTO = TODOS.filter((a) => !INSTRUMENTOS.includes(a) && !APOYOS.includes(a))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El alcance, y que no está vacío')

afirmar(TODOS.length > 0, `las ocho secciones son ${TODOS.length} archivos`)
afirmar(PRODUCTO.length > 0, `  de los cuales ${PRODUCTO.length} son de producto`)
afirmar(INSTRUMENTOS.length > 0, `  y ${INSTRUMENTOS.length} instrumentos`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Hay UN contrato, y los dos de los lanes no están')

for (const viejo of ['src/app/v3/secciones-a', 'src/app/v3/secciones-b']) {
  afirmar(!existsSync(path.join(RAIZ, viejo)), `\`${viejo}/\` ya no existe`)
}
afirmar(existsSync(path.join(RAIZ, CONTRATO)), 'y el contrato único sí')

/** Las ocho carpetas de sección, derivadas del disco. No se listan. */
const CARPETAS = readdirSync(path.join(RAIZ, SECCIONES), { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
  .map((e) => e.name)
  .sort()
afirmarIgual(
  CARPETAS,
  ['cierre', 'hero', 'numeros', 'por-que-develop', 'quienes-somos', 'servicios', 'trabajos', 'tu-panel'],
  'las ocho carpetas de sección están, y ninguna más',
)

/** Ningún archivo de producto importa de OTRA sección: el acoplamiento que el
 *  reparto existía para evitar sigue prohibido después de juntarlas. */
const cruces: string[] = []
for (const archivo of PRODUCTO) {
  const carpeta = archivo.split('/')[4]
  if (carpeta.startsWith('_')) continue
  for (const modulo of importsDe(leer(archivo))) {
    const otra = CARPETAS.find((c) => c !== carpeta && modulo.includes(`../${c}/`))
    if (otra !== undefined) cruces.push(`${archivo} → ${modulo}`)
  }
}
afirmarIgual(cruces, [], 'ninguna sección importa de otra sección: el contrato es la única puerta')

controlPositivo(
  'el detector de cruces ve un import a otra sección',
  "import { X } from '../cierre/Cierre'",
  (fuente: string) =>
    !importsDe(fuente).some((m) => CARPETAS.some((c) => m.includes(`../${c}/`))),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL ÁRBOL QUIETO NO IMPORTA UN VALOR DEL SISTEMA DE MOTION')

/**
 * El módulo animado y su instalador son los ÚNICOS que pueden. Están declarados
 * uno por uno, no detectados por el nombre: una heurística de sufijo sería
 * exactamente la clase de exclusión silenciosa que este proyecto viene cazando.
 */
const PUEDEN_IMPORTAR_MOTION: readonly string[] = [
  `${CONTRATO}/coreografia-animada.tsx`,
  `${SECCIONES}/InstaladorDeCoreografia.tsx`,
]

/**
 * Y una excepción declarada, con su razón: la POLÍTICA de movimiento reducido.
 * No es coreografía —son cuarenta líneas sin una sola huella del sistema— y
 * usar otro hook para la misma preferencia sería tener dos políticas.
 */
const EXCEPCION_DE_POLITICA = '_lib/motion/reducido'

const sucios: string[] = []
for (const archivo of PRODUCTO) {
  if (PUEDEN_IMPORTAR_MOTION.includes(archivo)) continue
  for (const modulo of importsDeValor(leer(archivo))) {
    if (!/_lib\/motion\/|motion\/_componentes\//.test(modulo)) continue
    if (modulo.includes(EXCEPCION_DE_POLITICA)) continue
    sucios.push(`${archivo} → ${modulo}`)
  }
}
afirmarIgual(sucios, [], 'ningún archivo del árbol quieto importa un valor del sistema de motion')

/** Y el control: los dos que SÍ pueden, lo hacen. Sin esto, la afirmación de
 *  arriba pasaría en verde con un sistema de motion que nadie usa. */
const animado = leer(`${CONTRATO}/coreografia-animada.tsx`)
const importaElSistema = importsDeValor(animado).filter((m) =>
  /_lib\/motion\/|motion\/_componentes\//.test(m),
)
afirmar(
  importaElSistema.length >= 3,
  `el módulo animado SÍ importa el sistema: ${importaElSistema.length} módulos`,
  importaElSistema.join(' · '),
)

controlPositivo(
  'el detector ve un import de valor del sistema donde no corresponde',
  "import { PATRONES } from '../../_lib/motion/patrones'",
  (fuente: string) =>
    !importsDeValor(fuente).some((m) => /_lib\/motion\//.test(m)),
)

controlPositivo(
  'y NO confunde un import de tipo, que se borra al compilar',
  "import type { IdDePatron } from '../../_lib/motion/patrones'",
  (fuente: string) => importsDeValor(fuente).some((m) => /_lib\/motion\//.test(m)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La glue de S2 entra por UN solo archivo')

/**
 * `Pieza`, `Piezas` y `LineasDeTexto` viven en `motion/_componentes/`, que es la
 * carpeta privada de la ruta de demostración de S2 y está declarada como deuda
 * con fecha de baja. Cada lane lo había acotado a un archivo; ahora es uno solo
 * para las ocho, y el día que se muevan a `_lib/motion/` cambian tres líneas.
 */
const puertas = PRODUCTO.filter((a) =>
  importsDe(leer(a)).some((m) => m.includes('motion/_componentes/')),
)
afirmarIgual(
  puertas,
  [`${CONTRATO}/coreografia-animada.tsx`],
  'un solo archivo del home importa la glue de la ruta de demostración',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La compuerta se resuelve UNA vez, y no escribe el umbral')

const compuerta = leer(`${SECCIONES}/CompuertaDelHome.tsx`)
const sinComentarios = compuerta
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split('\n')
  .filter((l) => !/^\s*\/\//.test(l))
  .join('\n')

afirmar(/from '\.\.\/_lib\/compuerta'/.test(sinComentarios), 'importa el umbral de `_lib/compuerta`')
afirmar(/from '\.\.\/_lib\/useAnchoMinimo'/.test(sinComentarios), '  y el hook de `_lib/useAnchoMinimo`')
afirmar(!/1025/.test(sinComentarios), '  y NO escribe el 1025: un número repetido son dos compuertas')
afirmar(
  /dynamic\(\s*\(\)\s*=>\s*import\(/.test(sinComentarios),
  '  y el árbol animado entra por `dynamic(() => import(...))`, el mecanismo de S1',
)
afirmar(/ssr:\s*false/.test(sinComentarios), '  con `ssr: false`, que es lo que emite el chunk aparte')

/** Ninguna sección consulta la compuerta por su cuenta. */
const consultan = PRODUCTO.filter(
  (a) => a !== `${SECCIONES}/CompuertaDelHome.tsx` && /useAnchoMinimo|CONSULTA_ESCENARIO/.test(leer(a)),
)
afirmarIgual(consultan, [], 'ninguna sección consulta la compuerta: se resuelve una vez, arriba')

controlPositivo(
  'el chequeo del umbral ve un componente que declara el suyo',
  'const MIO = 1025',
  (fuente: string) => !/1025/.test(fuente),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · No quedan restos de los dos contratos')

/** Nombres que sólo existían mientras hubo dos contratos. Si alguno vuelve, es
 *  que alguien reintrodujo la división que este sprint sacó. */
const RESTOS: readonly string[] = [
  'ORDEN_DE_SECCIONES_B',
  'IdDeSeccionB',
  'IDS_DE_SECCION_A',
  'seccionDeA',
  'ModoDeCoreografia',
  'SUPERFICIE_DE_CONTRATO',
  'NUMERO_DE_CONTRATO',
  'ConCompuerta',
  'HuecoDeMedio',
  'BloqueDeSeccion',
]
const encontrados: string[] = []
for (const archivo of TODOS) {
  const fuente = sinComentariosNiCadenas(leer(archivo))
  for (const resto of RESTOS) {
    if (fuente.includes(resto)) encontrados.push(`${archivo}: ${resto}`)
  }
}
afirmarIgual(encontrados, [], 'ningún nombre de los dos contratos sobrevive en el árbol de secciones')

controlPositivo(
  'el detector de restos ve uno en el código',
  'export const ORDEN_DE_SECCIONES_B = []',
  (fuente: string) => !RESTOS.some((r) => sinComentariosNiCadenas(fuente).includes(r)),
)

controlPositivo(
  'y NO lo ve en un comentario, que es donde este sprint explica por qué ya no está',
  '/** Era ORDEN_DE_SECCIONES_B y se unificó. */',
  (fuente: string) => RESTOS.some((r) => sinComentariosNiCadenas(fuente).includes(r)),
)

controlPositivo(
  '  ni adentro de una cadena, que es donde un instrumento nombra lo que comprueba',
  "afirmar(true, 'los dos que hay los ponen Panel y HuecoDeMedio')",
  (fuente: string) => RESTOS.some((r) => sinComentariosNiCadenas(fuente).includes(r)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La regla de las 300 líneas, sobre lo que este sprint escribe')

/**
 * La regla del repo es que un archivo de más de 300 líneas se parte. Los de S1 y
 * S2 no los mira nadie —está anotado como deuda en §7.17 de `DIRECCION-ESCENA`—
 * y este sprint no la hereda: mira lo suyo, que son las ocho secciones, su
 * contrato y los instrumentos `s7-*`.
 *
 * Ya cazó uno: `_contrato/coreografia.tsx` llegó a 366 líneas y se partió en el
 * seam (contexto, proveedor y el bloque medido) y los canales. El corte no fue
 * por tamaño: **el seam declara qué se puede reemplazar y quién decide; los
 * canales son las formas concretas de colgar contenido de un progreso.** Se
 * cambian por razones distintas y por eso se leen por separado.
 */
const LIMITE = 300
const DE_ESTE_SPRINT = [
  ...TODOS,
  ...readdirSync(path.join(RAIZ, 'src/app/v3/_lib/__tests__'))
    .filter((n) => n.startsWith('s7-'))
    .map((n) => `src/app/v3/_lib/__tests__/${n}`),
]

/**
 * Igual que `wc -l`: las líneas TERMINADAS, o sea los saltos.
 *
 * `split('\n').length` cuenta una de más en un archivo que termina en salto —
 * que es todo archivo del repo— y ese uno de más puso en rojo, en la primera
 * corrida, a tres archivos de exactamente 300. Un contador que no coincide con
 * la herramienta contra la que la gente lo compara produce discusiones sobre el
 * contador en vez de sobre el archivo.
 */
const lineasDe = (archivo: string): number => (leer(archivo).match(/\n/g) ?? []).length
const medidos = DE_ESTE_SPRINT.map((a) => ({ a, n: lineasDe(a) })).sort((x, y) => y.n - x.n)
const largos = medidos.filter((f) => f.n > LIMITE).map((f) => `${f.a} — ${f.n} líneas`)

afirmar(DE_ESTE_SPRINT.length > 0, `se miraron ${DE_ESTE_SPRINT.length} archivos`)
afirmarIgual(largos, [], `ninguno pasa las ${LIMITE} líneas`)
console.log(
  `  los tres más largos: ${medidos
    .slice(0, 3)
    .map((f) => `${f.a.split('/').pop()} ${f.n}`)
    .join(' · ')}`,
)

controlPositivo(
  'el contador de líneas ve un archivo largo',
  `${Array.from({ length: LIMITE + 1 }, () => 'x').join('\n')}\n`,
  (texto: string) => (texto.match(/\n/g) ?? []).length <= LIMITE,
)

cerrar('s7-contrato.invariant')
