/**
 * INVARIANTE — LA UNIDAD DE MEDIDA DE SITIO-S10: los tokens resueltos a un
 * ancho, y los avances leídos del binario que /v3 sirve.
 *
 * Corre con `npm run test:s10-medida`.
 *
 * ── Por qué las dos cosas van juntas y aparte del banco ────────────────────
 *
 * Porque las dos contestan la misma pregunta —**cuánto mide una cosa**— y
 * ninguna toca el marcado. El banco renderiza y lee; esto convierte una
 * expresión de CSS y una cadena de texto en píxeles. Son las dos mitades de
 * toda cifra de composición del sprint, y si una está mal, todas lo están.
 *
 * ── Los controles, y de dónde salen ───────────────────────────────────────
 *
 * Ninguno es una constante escrita al lado. Los tres vienen de fuentes que este
 * archivo no controla:
 *
 *   1. **El tema publica su propio método.** `theme-develop.css` dice que las
 *      seis expresiones fluidas se derivaron con `a = (max − min) / (1440 −
 *      375)`, o sea que cada `clamp()` tiene que valer su mínimo en 375 y su
 *      máximo en 1440. Si el resolvedor no lo reproduce, está mal.
 *   2. **La fuente publica su ancho medio.** `OS/2.xAvgCharWidth` es un campo
 *      del mismo binario, escrito por otra parte del pipeline de la fuente.
 *   3. **Chivo Mono es MONOESPACIADA.** Sus avances tienen que ser todos el
 *      mismo número, y un desplazamiento de tabla mal calculado no puede
 *      producir eso por casualidad. Es el control más duro de los tres.
 *
 * Y hay un cuarto, cruzado: `s3-woff2.ts` abre los mismos archivos con otro
 * lector, y los dos tienen que leer el mismo `unitsPerEm`.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ANCHOS } from './s10-banco'
import {
  BREAKPOINTS,
  SUPUESTOS_DEL_MODELO_DE_CSS,
  anchoDeContenido,
  cajaDeLinea,
  clasesEfectivas,
  hayToken,
  resolverLongitud,
  tokenPx,
  valorDeToken,
  variantesActivas,
} from './s10-css'
import {
  FUENTE_CODIGO,
  FUENTE_TITULO,
  anchoDeTexto,
  caracteresSinGlifo,
  lineasDeTexto,
  palabrasQueNoEntran,
} from './s10-avance'
import { avanceDeCaracter, leerAvancesDe } from './s10-woff2'
import { leerMetricas } from './s3-woff2'
import { NIVELES, NIVELES_TIPOGRAFICOS } from '../tipografia'

titulo('1 · El resolvedor de tokens, contra el método que el propio tema publica')

const PISO = tokenPx('--fluido-piso', 0)
const TECHO = tokenPx('--fluido-techo', 0)
for (const nivel of NIVELES) {
  const definicion = NIVELES_TIPOGRAFICOS[nivel]
  if (definicion.claseFluida === null) continue
  const fluido = definicion.token.replace('--text-', '--text-fluido-')
  const enElPiso = tokenPx(fluido, PISO)
  const enElTecho = tokenPx(fluido, TECHO)
  const declarado = /clamp\(\s*([\d.]+)px\s*,[\s\S]*,\s*([\d.]+)px\s*\)/.exec(valorDeToken(fluido))
  const minimo = Number.parseFloat(declarado?.[1] ?? 'NaN')
  const maximo = Number.parseFloat(declarado?.[2] ?? 'NaN')
  afirmar(
    Math.abs(enElPiso - minimo) < 0.01 && Math.abs(enElTecho - maximo) < 0.01,
    `\`${fluido}\` interpola entre sus extremos: ${enElPiso.toFixed(3)} en ${PISO} y ${enElTecho.toFixed(3)} en ${TECHO}`,
    `declarados ${minimo} y ${maximo}`,
  )
}
afirmarIgual(tokenPx('--text-base', 375), 16, '`1rem` resuelve a 16px — el supuesto de la raíz, declarado')
afirmarIgual(cajaDeLinea('--text-cuerpo', '--leading-texto', 375), 24, 'la caja de línea de cuerpo son 24px, igual que en `navegacion.ts`')
afirmarIgual(
  resolverLongitud('calc(var(--spacing-6) + var(--spacing-3) * 2 + var(--text-cuerpo) * var(--leading-texto))', 375),
  72,
  'el `calc()` de `_estilos/navegacion.css` resuelve a los 72px que `navegacion.ts` deriva',
)
afirmar(!hayToken('--token-que-no-existe'), 'el lector de tokens sabe decir que un token no está')
controlPositivo('el resolvedor TIRA con una unidad que no puede resolver sin alto', '10svh', (v: string) =>
  Number.isFinite(resolverLongitud(v, 375)),
)
controlPositivo('y con un token inventado', '--text-inventado', (t: string) => Number.isFinite(tokenPx(t, 375)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Las variantes de ancho salen de los `--breakpoint-*`, no de un número')

afirmarIgual(Object.keys(BREAKPOINTS).sort(), ['escritorio', 'medio', 'tablet'], 'los tres breakpoints se leen del tema')
afirmarIgual(variantesActivas(375), [], 'a 375 no hay ninguna variante activa')
afirmarIgual(variantesActivas(768), ['tablet'], 'a 768 entra `tablet` — el breakpoint es inclusivo')
afirmarIgual(variantesActivas(1024), ['tablet', 'medio'], 'a 1024 todavía NO hay `escritorio:`')
afirmarIgual(variantesActivas(1025), ['tablet', 'medio', 'escritorio'], 'y a 1025 sí: es el salto que separa los dos sitios')
afirmarIgual(
  clasesEfectivas('grid-cols-1 escritorio:grid-cols-5 hover:opacity-50', 1024),
  ['grid-cols-1', 'hover:opacity-50'],
  'una clase `escritorio:` se descarta entera abajo del umbral y el `hover:` se conserva',
)
afirmarIgual(
  clasesEfectivas('grid-cols-1 escritorio:grid-cols-5 hover:opacity-50', 1025),
  ['grid-cols-1', 'grid-cols-5', 'hover:opacity-50'],
  '  y arriba entra con el prefijo sacado',
)
controlPositivo(
  'el filtro de clases no deja pasar una variante de ancho que no llega',
  1024,
  (ancho: number) => clasesEfectivas('escritorio:sticky', ancho).includes('sticky'),
)
console.log(`  ancho de contenido por ancho: ${ANCHOS.map((a) => `${a}→${anchoDeContenido(a)}`).join(' · ')}`)

// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los avances salen del `.woff2` que /v3 sirve, con sus tres controles')

const LETRAS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

for (const [nombre, ruta] of [['Chivo', FUENTE_TITULO], ['Chivo Mono', FUENTE_CODIGO]] as const) {
  const tablas = leerAvancesDe(ruta)
  const otroLector = leerMetricas(ruta)
  afirmarIgual(
    tablas.unidadesPorEm,
    otroLector.unidadesPorEm,
    `${nombre} — los DOS lectores independientes leen el mismo \`unitsPerEm\``,
  )
  afirmar(tablas.avances.length > 100, `  y ${tablas.avances.length} glifos con avance`)
  afirmar(tablas.cmap.size > 100, `  y un cmap de ${tablas.cmap.size} puntos de código`)

  const medio =
    [...LETRAS].reduce((s, c) => s + avanceDeCaracter(tablas, c.codePointAt(0) ?? 0), 0) / LETRAS.length
  const desvio = Math.abs(medio - tablas.anchoMedioDeclarado) / tablas.anchoMedioDeclarado
  afirmar(
    desvio < 0.1,
    `  el avance medio medido (${medio.toFixed(1)}) reproduce el \`xAvgCharWidth\` que la fuente declara (${tablas.anchoMedioDeclarado})`,
    `${(desvio * 100).toFixed(1)}% de desvío`,
  )
  afirmarIgual(
    caracteresSinGlifo(tablas, 'áéíóúüñÁÉÍÓÚÑ¿¡·—“”'),
    [],
    '  y el subset latino cubre todo el castellano rioplatense que el sitio escribe',
  )
}

const MONO = leerAvancesDe(FUENTE_CODIGO)
const avancesDeLetrasMono = new Set([...LETRAS].map((c) => avanceDeCaracter(MONO, c.codePointAt(0) ?? 0)))
afirmarIgual(
  avancesDeLetrasMono.size,
  1,
  'EL CONTROL MÁS DURO: Chivo Mono es monoespaciada y las 52 letras dan UN solo avance',
)
console.log(`  ese avance vale ${[...avancesDeLetrasMono][0]} unidades — un desplazamiento de tabla mal calculado no produce esto por casualidad`)

const CHIVO = leerAvancesDe(FUENTE_TITULO)
afirmar(
  avanceDeCaracter(CHIVO, 'W'.codePointAt(0) ?? 0) > avanceDeCaracter(CHIVO, 'i'.codePointAt(0) ?? 0),
  'y Chivo NO es monoespaciada: la `W` avanza más que la `i`',
  `${avanceDeCaracter(CHIVO, 87)} contra ${avanceDeCaracter(CHIVO, 105)}`,
)
controlPositivo(
  'el detector de glifos faltantes ve un carácter que el subset latino no tiene',
  '漢',
  (t: string) => caracteresSinGlifo(CHIVO, t).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El corte de línea es proporcional al ancho, y no una cuenta de caracteres')

const FRASE = 'Tu negocio vendiendo en piloto'
const doceP = tokenPx('--text-fluido-titulo-xl', 375)
const anchos = [200, 400, 800, 1600].map((a) => lineasDeTexto(CHIVO, FRASE, a, doceP))
afirmar(
  anchos.every((n, i) => i === 0 || n <= anchos[i - 1]),
  'más ancho disponible nunca da MÁS líneas',
  anchos.join(' → '),
)
afirmarIgual(anchos[anchos.length - 1], 1, 'y con ancho de sobra entra en una sola línea')
afirmar(anchos[0] > 1, 'y con ancho chico se parte: el modelo no está clavado en 1', `${anchos[0]} líneas en 200px`)
afirmar(
  anchoDeTexto(CHIVO, FRASE, doceP) > anchoDeTexto(CHIVO, FRASE, doceP, -0.03),
  'el interletrado negativo del sistema angosta el texto, y entra en la cuenta',
)
afirmarIgual(
  palabrasQueNoEntran(CHIVO, FRASE, 10_000, doceP),
  [],
  'con un renglón enorme ninguna palabra desborda',
)
afirmar(
  palabrasQueNoEntran(CHIVO, FRASE, 10, doceP).length > 0,
  '  y con un renglón de 10px desbordan casi todas: el detector no está ciego',
)
controlPositivo('el contador de líneas no devuelve cero sobre un texto que existe', FRASE, (t: string) =>
  lineasDeTexto(CHIVO, t, 300, doceP) === 0,
)
afirmarIgual(lineasDeTexto(CHIVO, '', 300, doceP), 0, 'y un texto vacío sí da cero líneas')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los supuestos del modelo de CSS se publican')

afirmar(SUPUESTOS_DEL_MODELO_DE_CSS.length >= 4, `${SUPUESTOS_DEL_MODELO_DE_CSS.length} supuestos declarados`)
for (const s of SUPUESTOS_DEL_MODELO_DE_CSS) console.log(`  · ${s}`)

cerrar('s10-medida.invariant')
