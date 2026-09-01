/**
 * INVARIANTE — EL MONTAJE: los enchufes, y que los cuatro frentes entregaron.
 *
 * Corre con `npm run test:s8-montaje`. Se lee todo del disco: **no compara
 * contra `git`**, así que no es un check de frontera y no vence al commitear
 * (regla 12 de §3).
 *
 * Custodia cuatro cosas. Que **los enchufes** existan y digan lo que tienen que
 * decir: si alguien le cambia el destino al `import()` o le saca la marca, el
 * montaje se rompe en silencio. Que **los cuatro frentes entregaron** —el
 * contrato de `s8-padron.ts`, que existe por §7.21: cuando una corrida en
 * paralelo se corta por límite de gasto el reporte vuelve vacío y hay que
 * inventariar el disco—. Que **las dos decisiones que nadie tomó** sigan sin
 * tomarse: el cursor apagado y `'/'` armando el intro en el sitio vivo. Y **los
 * largos**, con la forma de la regla 13 — ver `s8-largos.ts`.
 */

import { CURSOR_PROPIO_EN_EL_HOME, IMPORT_DEL_CHROME } from '../../_chrome/contrato'
import { IMPORT_DEL_INTRO, MODULO_DEL_INTRO } from '../../_intro/contrato'
import { IMPORT_DE_LA_ESCENA, MODULO_DE_LA_ESCENA } from '../escena/contrato'
import { MARCA_ESCENA } from '../marcaEscena'
import { MARCA_ESCENARIO } from '../marcaEscenario'
// prettier-ignore
import { ENCHUFES, FRENTES, PUEDEN_IMPORTAR_LA_MARCA, SCRIPTS_DECLARADOS, archivosSinRegistrar, entregablesQueFaltan, existe, leer } from './s8-padron'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
// prettier-ignore
import { TODO_SRC, importanLaMarca, invariantesSueltos, largosDelSprint, scriptsDelPaquete, veLaMarca } from './s8-montaje-soporte'
import { LIMITE_DE_LINEAS, contarLineas, heredadosQueCrecieron, propiosQuePasan, repartir, type Largo } from './s8-largos'

const RUTAS_DEL_INTRO = ['/', '/v3']

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los enchufes existen — la Fase 0 escribió los puntos de montaje')

const enchufesQueFaltan = ENCHUFES.filter((a) => !existe(a))
afirmarIgual(enchufesQueFaltan, [], `los ${ENCHUFES.length} enchufes están en disco`)

controlPositivo(
  'el detector ve un enchufe que no existe',
  'src/app/v3/_lib/enchufe-inventado.ts',
  (a: string) => existe(a),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LA COMPUERTA DE LA ESCENA apunta al módulo real, y no al marcador')

const fuenteCompuerta = leer('src/app/v3/_componentes/EscenarioCompuerta.tsx')

afirmar(
  fuenteCompuerta.includes(`import('${IMPORT_DE_LA_ESCENA}')`),
  `la compuerta pide \`${IMPORT_DE_LA_ESCENA}\` con \`import()\` perezoso`,
)
afirmar(
  /\{\s*ssr:\s*false\s*\}/.test(fuenteCompuerta),
  '  con `ssr: false`: el ancho no existe en el servidor, y el chunk sale aparte',
)
afirmar(
  !fuenteCompuerta.includes("import('./EscenarioDePrueba')"),
  '  y ya no pide el marcador de posición de S1',
)
afirmar(existe(MODULO_DE_LA_ESCENA), `el módulo perezoso existe: \`${MODULO_DE_LA_ESCENA}\``)

/**
 * El marcador de posición NO se borró: `/v3/control-estatico` lo importa de
 * forma ESTÁTICA y es el control positivo del MECANISMO de la compuerta. Sin
 * él, «la escena no está en la carga inicial» pasaría en verde también si el
 * buscador estuviera ciego.
 */
afirmar(
  existe('src/app/v3/_componentes/EscenarioDePrueba.tsx'),
  'el marcador de posición sigue vivo: es el control positivo del mecanismo',
)
afirmar(
  leer('src/app/v3/control-estatico/page.tsx').includes('EscenarioDePrueba'),
  '  y la ruta gemela lo sigue importando de forma estática',
)
// Las dos constantes son literales, así que `tsc` sabe que no son iguales y
// reporta la comparación como inútil. Se ensanchan a `string` para poder
// AFIRMARLA: lo que se custodia no es el valor de hoy, es que nadie las
// unifique mañana — y esa afirmación tiene que poder fallar.
const marcaDeLaEscena: string = MARCA_ESCENA
const marcaDelMarcador: string = MARCA_ESCENARIO
afirmar(
  marcaDeLaEscena !== marcaDelMarcador,
  'las dos marcas son distintas: se pueden buscar por separado en el mismo build',
  `${marcaDeLaEscena} ≠ ${marcaDelMarcador}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · LA MARCA DE LA ESCENA la importa UN solo archivo de la aplicación')

/** El detector mira los ESPECIFICADORES de import y no el texto del archivo. El
 *  porqué —y el verde por vacío que lo obligó— está en `s8-montaje-soporte.ts`. */
afirmar(TODO_SRC.length > 100, `el barrido mira ${TODO_SRC.length} archivos de \`src/\``)

const conLaMarca = importanLaMarca(TODO_SRC)

/** La lista y su porqué viven en `s8-padron.ts`, con el contrato de entrega. */
afirmar(
  PUEDEN_IMPORTAR_LA_MARCA.includes(MODULO_DE_LA_ESCENA),
  'la lista de permitidos incluye al módulo perezoso: es el que la tiene que llevar',
)
afirmarIgual(
  conLaMarca.filter((a) => !PUEDEN_IMPORTAR_LA_MARCA.includes(a)),
  [],
  'ningún módulo de la aplicación importa `marcaEscena`: sólo el perezoso y los instrumentos declarados',
)
afirmar(
  conLaMarca.length > 0,
  '  y el contrapeso: el barrido SÍ encontró importadores — no es cero por ceguera',
  conLaMarca.join(' · '),
)

for (const [que, fuente] of [
  ['un import estático', "import { MARCA_ESCENA } from '../marcaEscena'"],
  ['y uno perezoso', "const X = dynamic(() => import('./marcaEscena'))"],
] as const) {
  controlPositivo(`el escáner ve ${que}`, fuente, (f: string) => !veLaMarca(f))
}
controlPositivo(
  'y NO lo ve cuando está adentro de un comentario',
  "/* el módulo perezoso hace import … from '../marcaEscena' */",
  veLaMarca,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL HOME monta el chrome, el intro y la compuerta — en ese orden')

const fuenteHome = leer('src/app/v3/page.tsx')

for (const [que, imp] of [
  ['el chrome', IMPORT_DEL_CHROME],
  ['el intro', IMPORT_DEL_INTRO],
] as const) {
  afirmar(fuenteHome.includes(`from '${imp}'`), `el home importa ${que} de \`${imp}\``)
}
afirmar(/<ChromeDelHome\s*\/>/.test(fuenteHome), 'y monta el chrome')
afirmar(/<IntroDelHome\s*\/>/.test(fuenteHome), '  y el intro')

/** El chrome va PRIMERO por geometría: el envoltorio de la pastilla es
 *  `sticky` de alto cero y su NACIMIENTO lo define dónde está en el árbol. */
const posChrome = fuenteHome.indexOf('<ChromeDelHome')
const posIntro = fuenteHome.indexOf('<IntroDelHome')
const posCompuerta = fuenteHome.indexOf('<CompuertaDelHome')
afirmar(
  posChrome > 0 && posChrome < posIntro && posIntro < posCompuerta,
  'y el orden es chrome → intro → compuerta: la pastilla nace lo más arriba posible',
  `${posChrome} < ${posIntro} < ${posCompuerta}`,
)
afirmar(existe(MODULO_DEL_INTRO), `el módulo del intro existe: \`${MODULO_DEL_INTRO}\``)

afirmar(
  (fuenteHome.match(/<CompuertaDelHome/g) ?? []).length === 1,
  'la compuerta de la coreografía se sigue resolviendo UNA sola vez, arriba',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · LAS DOS DECISIONES QUE NADIE TOMÓ, sin tomar')

afirmar(
  CURSOR_PROPIO_EN_EL_HOME === false,
  'el cursor propio del home está APAGADO: es una decisión de composición y la toma el humano',
)

/** Y la del sitio vivo: sacar `'/'` de la lista haría desaparecer el
 *  preloader del home en producción sin que nada más se queje. */
const fuenteRutas = leer('src/components/layout/home-intro/introRutas.ts')
afirmar(RUTAS_DEL_INTRO[0] === '/', 'y `/` sigue siendo la primera ruta en la que el intro arma')
afirmar(
  new RegExp(`RUTAS_DEL_INTRO[^=]*=\\s*\\[\\s*'/'`).test(fuenteRutas),
  '  escrito así en el archivo, no sólo en este instrumento',
)
afirmar(
  leer('src/components/layout/home-intro/introBoot.tsx').includes('CONDICION_DE_RUTA'),
  '  y el script pre-paint la consume: una sola definición',
)

controlPositivo(
  'el lector de la lista ve una que empieza por otra ruta',
  "export const RUTAS_DEL_INTRO: readonly string[] = ['/v3']",
  (f: string) => new RegExp(`RUTAS_DEL_INTRO[^=]*=\\s*\\[\\s*'/'`).test(f),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · LOS CUATRO FRENTES ENTREGARON — el contrato del padrón')

const faltantes = entregablesQueFaltan()
for (const frente of FRENTES) {
  const suyos = frente.entregables.filter((a) => !existe(a))
  afirmarIgual(suyos, [], `frente \`${frente.id}\` — ${frente.entregables.length} entregables`)
}
afirmarIgual(faltantes, [], 'ningún frente quedó a mitad de camino')

const deMas = archivosSinRegistrar()
console.log(`  archivos en disco no declarados en el padrón: ${deMas.length}`)
for (const a of deMas) console.log(`    · ${a}`)
console.log('  (no es falla: un frente puede partir un archivo que pasó las 300 líneas)')

/** Lo que SÍ es falla: un `.invariant` suelto sin script (regla 14). A quién se
 *  le hace la pregunta —y por qué no al padrón— está en el soporte. */
afirmarIgual(invariantesSueltos(), [], 'ningún `.invariant` suelto sin script en las carpetas de los frentes')
controlPositivo(
  'el buscador de sueltos NO da vacío cuando ningún invariante está cableado',
  new Set<string>(),
  (c: ReadonlySet<string>) => invariantesSueltos(c).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Los scripts declarados existen y apuntan a su archivo')

const scripts = scriptsDelPaquete()

for (const [script, archivo] of Object.entries(SCRIPTS_DECLARADOS)) {
  afirmar(scripts[script] === `npx tsx ${archivo}`, `\`${script}\` → \`${archivo}\``, scripts[script] ?? '(no existe)')
}
afirmar(
  scripts['test:s8'] === 'npx tsx src/app/v3/_lib/__tests__/s4-agregado.ts s8',
  'y la suite `s8` tiene su atajo apuntando al corredor',
)

controlPositivo(
  'el lector ve un script que no existe',
  'test:s8-inventado',
  (s: string) => scripts[s] !== undefined,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Los largos — lo propio se afirma, lo heredado se publica y se vigila')

/** Enchufes + entregables + los módulos de apoyo sin declarar: la cobertura es
 *  del sprint entero, que es lo que §7.17 pedía. Se compone en el soporte. */
const { medidos, reparto } = largosDelSprint()

afirmar(medidos.length > 0, `el medidor miró ${medidos.length} archivos del sprint`)
afirmarIgual(
  propiosQuePasan(reparto),
  [],
  `ninguno de los ${reparto.propios.length} archivos que S8 ESCRIBIÓ pasa las ${LIMITE_DE_LINEAS} líneas`,
)

console.log(`  HEREDADO de la mudanza — deuda de §7.13, publicada con atribución (regla 13):`)
for (const m of reparto.heredados) console.log(`    ${m.archivo}  ${m.lineas} líneas`)
console.log('    llegaron así: la mudanza no cambió una línea que no fuera un import.')
afirmarIgual(heredadosQueCrecieron(medidos), [], '  y ninguno engordó contra su línea de base')

controlPositivo(
  'el medidor ve un archivo propio de 301 líneas',
  [{ archivo: 'inventado.ts', lineas: 301 }],
  (l: Largo[]) => propiosQuePasan(repartir(l)).length === 0,
)
controlPositivo(
  'y la cuenta de líneas no le suma una al salto final: 300 líneas son 300',
  `${'x\n'.repeat(300)}`,
  (t: string) => contarLineas(t) !== 300,
)
controlPositivo(
  'y la vigilancia ve un heredado que engordó una línea',
  [{ archivo: 'src/app/v3/_lib/escena/OrbitRig.tsx', lineas: 653 }],
  (l: Largo[]) => heredadosQueCrecieron(l).length === 0,
)

cerrar('s8-montaje.invariant')
