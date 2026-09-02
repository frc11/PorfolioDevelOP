/**
 * INVARIANTE — los ocho niveles existen, se consumen, pasan por sus anclas
 * medidas a lo largo de toda la banda, y la cap height que hace urgente la
 * verificación óptica sale del binario que /v3 sirve.
 *
 * Corre con `npm run test:s3-tipografia`.
 *
 * ── Las cinco afirmaciones ────────────────────────────────────────────────
 *
 *   1. Los ocho niveles existen en `theme-develop.css` con el valor que la
 *      tabla del sprint dice, y **seis tienen contraparte fluida y dos no**.
 *      Que falten los dos es tan importante como que estén los seis: `cuerpo`
 *      y `base` se midieron invariantes entre 768 y 1920.
 *   2. Cada `clamp()` **pasa por sus TRES anclas**: el piso a 375, el token
 *      FIJO del nivel a 1440 y el techo en el tope del contenido. Los dos
 *      primeros son medidos y **no se mueven**; el tercero es donde V3-C
 *      extendió la banda. Reemplaza a la comparación de literales que hacía
 *      esta sección, y es más fuerte: ve una PENDIENTE movida, que la vieja no.
 *   3. Los tres interlineados y los CUATRO interletrados se consumen. El
 *      cuarto —`--tracking-display`— no lo usa ningún componente medido, y por
 *      eso lo ejercita la ruta de demostración: un token que no se usa en
 *      ningún lado es un token que nadie puede juzgar.
 *   4. Los ocho niveles se consumen en el árbol del sprint.
 *   5. **La cap height se LEE del `.woff2`**, no se cita. De ahí sale el
 *      −4,72% que hace que la verificación óptica valga la pena.
 *   6-10. **La banda de punta a punta, y con qué se la compara** (V3-C): los
 *      ocho niveles en los cuatro anchos, la separación, el titular del Hero
 *      como fracción de la ventana, la tinta de cada sección contra su alto
 *      declarado, qué hace la referencia arriba de 1440 —leído de `LAYOUT.md`,
 *      no citado— y qué familia emite cada elemento del home compuesto. Las
 *      cinco viven en `s3-banda-afirmaciones.ts`.
 */

import type { Nivel } from '../tipografia'
import {
  CLASE_INTERLETRADO,
  CLASE_INTERLINEADO,
  INTERLETRADOS,
  INTERLINEADOS,
  METRICAS_DE_CHIVO,
  METRICAS_DE_INSTRUMENT_SANS,
  NIVELES,
  NIVELES_TIPOGRAFICOS,
} from '../tipografia'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DE_CODIGO, leer } from './s3-archivos'
import {
  TOPE_DE_LA_BANDA,
  declaradoDe,
  terminosDe,
  terminosDeExpresion,
  type TerminosDeClamp,
} from './s3-banda'
import { afirmarLaBanda, afirmarLaReferencia } from './s3-banda-afirmaciones'
import { resolver, tokensDelTema } from './s3-css'
import { leerMetricas } from './s3-woff2'
import { tokenPx } from './s10-css'

const tokens = tokensDelTema()
const fuenteDelSprint = ARCHIVOS_DE_CODIGO.map((a) => leer(a)).join('\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los ocho niveles, y los seis que además son fluidos')

afirmarIgual(NIVELES.length, 8, 'la tabla declara ocho niveles')

const tokensQueFaltan = NIVELES.filter((n) => !tokens.has(NIVELES_TIPOGRAFICOS[n].token))
afirmarIgual(tokensQueFaltan, [], 'los ocho tokens existen en theme-develop.css')

const valoresDistintos = NIVELES.filter(
  (n) => tokens.get(NIVELES_TIPOGRAFICOS[n].token) !== NIVELES_TIPOGRAFICOS[n].valorFijo,
).map((n) => ({ nivel: n, enElTema: tokens.get(NIVELES_TIPOGRAFICOS[n].token) }))
afirmarIgual(valoresDistintos, [], 'y valen lo que la tabla del sprint dice')

const conFluido = NIVELES.filter((n) => NIVELES_TIPOGRAFICOS[n].claseFluida !== null)
const sinFluido = NIVELES.filter((n) => NIVELES_TIPOGRAFICOS[n].claseFluida === null)
afirmarIgual(conFluido.length, 6, 'seis niveles tienen contraparte fluida')
afirmarIgual(sinFluido, ['cuerpo', 'base'], 'y los dos que no son los medidos INVARIANTES')

const fluidosQueFaltan = conFluido.filter((n) => !tokens.has(`--text-fluido-${n}`))
afirmarIgual(fluidosQueFaltan, [], 'los seis --text-fluido-* existen en el tema')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Las TRES anclas de cada clamp(): el piso, el token fijo y el tope')

/**
 * ⚠️ **CAMBIÓ DE FORMA EN V3-C Y ES MÁS FUERTE QUE ANTES.** Decía «cada
 * `clamp()` topa exactamente en el valor fijo de su nivel» comparando DOS
 * LITERALES —el tercer término contra `--text-<n>`—, lo cual valía sólo
 * mientras la banda terminara donde está el ancla. Ahora se afirman las TRES
 * anclas **evaluando la recta**: `recta(375)` = el piso, `recta(1440)` = el
 * token FIJO —**la comprobación de que la escala no se movió donde está
 * anclada**— y `recta(tope)` = el techo. Las tres están explicadas nivel por
 * nivel en `s3-banda.ts`. La vieja no veía un cambio de COEFICIENTE: mover la
 * pendiente dejaba el literal del techo intacto y la comprobación seguía verde
 * sobre una recta que ya no pasaba por 1440.
 */
const PISO = tokenPx('--fluido-piso', 0)
const ANCLA = tokenPx('--fluido-techo', 0)
afirmarIgual(PISO, 375, 'el ancla baja de la banda son 375px, y sale del tema')
afirmarIgual(ANCLA, 1440, 'la alta son 1440px — las dos siguen siendo las MEDIDAS')
afirmarIgual(
  TOPE_DE_LA_BANDA,
  tokenPx('--container-tope', 0),
  'y el tope de la banda ES `--container-tope`: no se declaró un número nuevo para tenerlo',
)

// Los dos lectores de la hoja tienen que decir lo mismo. `tokens` sale de
// `s3-css` y `terminosDe` de `s10-css`: son dos parsers distintos sobre el
// mismo archivo, y si divergieran, medio invariante estaría midiendo otra cosa.
afirmarIgual(
  conFluido.filter((n) => (tokens.get(`--text-fluido-${n}`) ?? '') !== declaradoDe(n)),
  [],
  'los dos lectores de `theme-develop.css` leen la MISMA declaración en los seis',
)

interface AnclaRota {
  readonly donde: string
  readonly esperado: number
  readonly obtenido: number
}

/**
 * Las anclas que NO dan. Vacío, o la escala se movió donde está anclada.
 *
 * Recibe el lector de términos como parámetro para que el control positivo
 * pueda correr ESTA MISMA función sobre un `clamp()` equivocado.
 */
function anclasRotas(
  niveles: readonly string[],
  leer: (nivel: string) => TerminosDeClamp | null,
): AnclaRota[] {
  const rotas: AnclaRota[] = []
  for (const nivel of niveles) {
    const terminos = leer(nivel)
    if (terminos === null) continue
    const fijo = resolver(NIVELES_TIPOGRAFICOS[nivel as Nivel].valorFijo, tokens)?.n ?? Number.NaN
    const puntos: readonly (readonly [string, number, number])[] = [
      [`piso de ${nivel}`, terminos.piso, terminos.recta(PISO)],
      [`ancla de ${nivel}`, fijo, terminos.recta(ANCLA)],
      [`tope de ${nivel}`, terminos.techo, terminos.recta(TOPE_DE_LA_BANDA)],
    ]
    for (const [donde, esperado, obtenido] of puntos) {
      // Tolerancia 0,001px: los coeficientes se publican a cuatro decimales y
      // S0 declara un error máximo de 0,0006px en los extremos de la banda.
      if (Math.abs(esperado - obtenido) > 0.001) rotas.push({ donde, esperado, obtenido })
    }
  }
  return rotas
}

const deLaHoja = (nivel: string): TerminosDeClamp | null => terminosDe(nivel as Nivel)

afirmarIgual(
  anclasRotas(conFluido, deLaHoja),
  [],
  'los seis clamp() pasan por sus TRES anclas: el piso a 375, el token FIJO a 1440, el techo en el tope',
)
controlPositivo(
  'el comparador de anclas ve una PENDIENTE movida — el modo de falla que la comprobación vieja NO veía',
  'clamp(36px, 1.8099rem + 1.9vw, 65.0141px)',
  (roto: string) => anclasRotas(['titulo-xl'], () => terminosDeExpresion(roto)).length === 0,
)
controlPositivo(
  'y también un TECHO movido, que ya no se confunde con una pendiente movida',
  'clamp(36px, 1.8099rem + 1.8779vw, 70px)',
  (roto: string) => anclasRotas(['titulo-xl'], () => terminosDeExpresion(roto)).length === 0,
)

/**
 * ⚠️ **LA BANDA DE UN NIVEL SE MIDE POR SU PENDIENTE, NO POR LA PRESENCIA DE
 * `vw` (SITIO-S11).** Subir el piso de `--text-fluido-micro` hasta su propio
 * `--text-micro` con el techo anclado en ese mismo valor deja la banda en CERO,
 * y un `+ 0vw` escrito para no romper una comprobación la habría dejado verde
 * sobre una expresión que no interpola. Se mide **techo − piso** y se separan
 * los dos casos: los que tienen banda TIENEN que interpolar con `vw`, y el que
 * no la tiene se DECLARA.
 *
 * **V3-C no lo tocó, y es una consecuencia y no una excepción:** extender la
 * banda sube los cinco techos que tenían pendiente, y el de `micro` se queda
 * donde estaba porque prolongar una recta CONSTANTE no la mueve.
 */
const bandaDe = (declarado: string): number => {
  const terminos = terminosDeExpresion(declarado)
  return terminos.techo - terminos.piso
}
const CON_BANDA = conFluido.filter((n) => bandaDe(declaradoDe(n)) > 0)
const SIN_BANDA = conFluido.filter((n) => bandaDe(declaradoDe(n)) === 0)
afirmarIgual(
  CON_BANDA.filter((n) => !declaradoDe(n).includes('vw')),
  [],
  `los ${CON_BANDA.length} niveles CON banda interpolan con vw: son fluidos de verdad`,
)
afirmarIgual(
  SIN_BANDA.filter((n) => declaradoDe(n).includes('vw')),
  [],
  'y el que NO la tiene no finge tenerla: cero `vw` decorativos',
)
afirmarIgual(SIN_BANDA, ['micro'], 'el único nivel sin banda es `micro`, y el tema declara por qué')
console.log(
  `  banda por nivel: ${conFluido.map((n) => `${n} ${bandaDe(declaradoDe(n)).toFixed(4)}px`).join(' · ')}`,
)
console.log(
  '  ⚠️ `micro` quedó con banda CERO en SITIO-S11 y V3-C lo dejó así: su piso no puede bajar de `--text-micro` (10px) ' +
    'sin reabrir el defecto 12 de §7.38, y su techo está anclado en ese mismo 10px por medición. Prolongar su recta ' +
    'hasta el tope no lo mueve, porque su recta es constante. DISPARADOR: el día que el techo suba, la banda vuelve ' +
    'sola con el método que el tema publica.',
)
controlPositivo(
  'el medidor de banda ve una banda no nula donde la hay',
  'clamp(8px, 0.456rem + 0.1878vw, 10px)',
  (roto: string) => bandaDe(roto) === 0,
)


// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los tres interlineados y los cuatro interletrados se consumen')

const interlineadosSinUso = INTERLINEADOS.filter(
  (i) => !fuenteDelSprint.includes(CLASE_INTERLINEADO[i]),
)
afirmarIgual(interlineadosSinUso, [], 'los tres --leading-* se usan en el árbol del sprint')

const interletradosSinUso = INTERLETRADOS.filter(
  (i) => !fuenteDelSprint.includes(CLASE_INTERLETRADO[i]),
)
afirmarIgual(interletradosSinUso, [], 'los cuatro --tracking-* también, `display` incluido')

const tokensDeMultiplicador = [
  ...INTERLINEADOS.map((i) => `--leading-${i}`),
  ...INTERLETRADOS.map((i) => `--tracking-${i}`),
]
afirmarIgual(
  tokensDeMultiplicador.filter((t) => !tokens.has(t)),
  [],
  'y los siete existen en el tema',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Los ocho niveles se consumen')

const nivelesSinUso = NIVELES.filter((n) => {
  const { claseFija, claseFluida } = NIVELES_TIPOGRAFICOS[n]
  return !fuenteDelSprint.includes(claseFija) && !fuenteDelSprint.includes(claseFluida ?? ' ')
})
afirmarIgual(nivelesSinUso, [], 'ningún nivel quedó sin consumir')

controlPositivo(
  'el buscador de consumo ve un nivel que nadie usa',
  'text-nivel-que-no-existe',
  (clase) => fuenteDelSprint.includes(clase),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La cap height sale del binario, no de una cita')

const chivo = leerMetricas('src/app/v3/_fuentes/chivo-latin.woff2')

afirmarIgual(chivo.unidadesPorEm, METRICAS_DE_CHIVO.unidadesPorEm, 'unitsPerEm leído de head')
afirmarIgual(chivo.xHeight, METRICAS_DE_CHIVO.xHeight, 'sxHeight leído de OS/2')
afirmarIgual(chivo.capHeight, METRICAS_DE_CHIVO.capHeight, 'sCapHeight leído de OS/2')
afirmar(chivo.versionOs2 >= 2, `OS/2 versión ${chivo.versionOs2} — trae las dos métricas`)

const deltaCap =
  ((chivo.capHeight - METRICAS_DE_INSTRUMENT_SANS.capHeight) /
    METRICAS_DE_INSTRUMENT_SANS.capHeight) *
  100
const deltaX =
  ((chivo.xHeight - METRICAS_DE_INSTRUMENT_SANS.xHeight) / METRICAS_DE_INSTRUMENT_SANS.xHeight) * 100

console.log(`  cap height  Chivo ${chivo.capHeight} · Instrument Sans ${METRICAS_DE_INSTRUMENT_SANS.capHeight}  →  ${deltaCap.toFixed(2)}%`)
console.log(`  x-height    Chivo ${chivo.xHeight} · Instrument Sans ${METRICAS_DE_INSTRUMENT_SANS.xHeight}  →  ${deltaX.toFixed(2)}%`)
console.log(`  razón cap/x Chivo ${(chivo.capHeight / chivo.xHeight).toFixed(4)} · Instrument Sans ${(METRICAS_DE_INSTRUMENT_SANS.capHeight / METRICAS_DE_INSTRUMENT_SANS.xHeight).toFixed(4)}`)

afirmar(
  Math.abs(deltaCap - -4.7222) < 0.001,
  'la cap height es 4,72% más chica — el número que hace urgente la verificación óptica',
  `${deltaCap.toFixed(4)}%`,
)
afirmar(
  Math.abs(deltaX) < 0.5,
  '  mientras la x-height coincide casi exacto: en cuerpo de texto no se va a notar',
  `${deltaX.toFixed(4)}%`,
)

controlPositivo(
  'el lector de métricas no acepta un archivo que no es un WOFF2',
  'src/app/v3/_lib/tipografia.ts',
  (ruta) => leerMetricas(ruta).capHeight > 0,
)

// ═══════════════════════════════════════════════════════════════════════════
afirmarLaBanda()

// ═══════════════════════════════════════════════════════════════════════════
afirmarLaReferencia()

cerrar('s3-tipografia.invariant')
