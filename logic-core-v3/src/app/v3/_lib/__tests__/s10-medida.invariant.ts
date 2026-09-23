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

import { ESCENARIO_MIN_ANCHO_PX } from '../compuerta'
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
import { TOPE_DE_LA_BANDA, terminosDe } from './s3-banda'

titulo('1 · El resolvedor de tokens, contra el método que el propio tema publica')

/**
 * ⚠️ **V3-C SEPARÓ EL ANCLA DEL TECHO, Y ESTA COMPROBACIÓN LO SIGUE.**
 *
 * Decía «interpola entre sus extremos» y evaluaba el `clamp()` en `--fluido-piso`
 * y en `--fluido-techo`, esperando el mínimo y el máximo DECLARADOS. Valía
 * mientras la banda terminara en 1440. Desde que termina en `--container-tope`,
 * a 1440 el `clamp()` ya no da su máximo: da **el token FIJO del nivel**, que es
 * lo que la medición de S0 ancló ahí.
 *
 * Los tres puntos se comprueban ahora por separado, que es lo que el tema
 * publica: piso en `--fluido-piso`, token fijo en `--fluido-techo`, máximo en el
 * tope. El modelo de la recta se importa de `s3-banda.ts` en vez de reescribirlo
 * — es el mismo que `s3-tipografia` afirma, y dos lectores del mismo `clamp()`
 * que divergen son exactamente el defecto que este archivo existe para cazar.
 */
const PISO = tokenPx('--fluido-piso', 0)
const ANCLA = tokenPx('--fluido-techo', 0)
for (const nivel of NIVELES) {
  const definicion = NIVELES_TIPOGRAFICOS[nivel]
  if (definicion.claseFluida === null) continue
  const fluido = definicion.token.replace('--text-', '--text-fluido-')
  const terminos = terminosDe(nivel)
  if (terminos === null) continue
  const enElPiso = tokenPx(fluido, PISO)
  const enElAncla = tokenPx(fluido, ANCLA)
  const enElTope = tokenPx(fluido, TOPE_DE_LA_BANDA)
  const fijo = tokenPx(definicion.token, 0)
  afirmar(
    Math.abs(enElPiso - terminos.piso) < 0.01 &&
      Math.abs(enElAncla - fijo) < 0.01 &&
      Math.abs(enElTope - terminos.techo) < 0.01,
    `\`${fluido}\` pasa por sus tres puntos: ${enElPiso.toFixed(3)} en ${PISO} · ${enElAncla.toFixed(3)} en ${ANCLA} · ${enElTope.toFixed(3)} en ${TOPE_DE_LA_BANDA}`,
    `declarados piso ${terminos.piso}, token fijo ${fijo}, techo ${terminos.techo}`,
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

/**
 * ⚠️ **SON CINCO DESDE PAPEL-2, Y LOS DOS ÚLTIMOS SON DE OTRA ESPECIE.**
 *
 * `angosto` (375) y `chico` (390) no se agregaron para usarse hacia arriba como
 * los otros tres: se agregaron para poder escribir **`max-angosto:`** y
 * **`max-chico:`**, las dos únicas variantes `max-` del lane. Y son DOS y no una
 * porque contestan preguntas distintas, las dos medidas:
 *
 *   `angosto` 375   dónde el décimo nivel deja de entrar en UN renglón
 *                   (banda 320–374: de 371,13 px para arriba entra solo)
 *   `chico`   390   dónde deja de haber composición limpia sobre la escena
 *                   (banda 320–389: 43,76 % de tinta sobre el logo a 320 y
 *                   40,59 % a 375, contra 2,71 % a 390)
 *
 * El valor del cuarto es el mismo número que `--fluido-piso` —el ancho más
 * angosto al que se midió el sistema— y `tokens.invariant` §7b ata los dos
 * literales; §7c afirma que el quinto NO se ata a ninguno, porque es otro hecho.
 *
 * ⚠️ **`chico` es el ÚNICO con consumidores en los DOS sentidos**, y por eso su
 * cara `min-width` de abajo dejó de ser teórica: `chico:hidden` es lo que apaga
 * la marca del Hero y la pastilla de navegación de 390 para arriba.
 *
 * Los cinco aparecen en esta tabla y en `variantesActivas`, porque Tailwind emite
 * las DOS caras de todo breakpoint, y **374 se agrega como ancho de prueba**
 * porque es el único de la banda donde ninguno de los dos entró todavía.
 */
afirmarIgual(
  Object.keys(BREAKPOINTS).sort(),
  ['angosto', 'chico', 'escritorio', 'hasta-tablet', 'medio', 'movil', 'tablet'],
  'los SIETE breakpoints se leen del tema: los cinco de siempre más los dos que cierran una banda por arriba',
)
afirmarIgual(variantesActivas(374), [], 'a 374 no hay ninguna variante activa: es la banda donde el Hero pinta papel y el décimo nivel baja a 55')
afirmarIgual(variantesActivas(375), ['angosto'], 'a 375 entra `angosto` — el breakpoint es inclusivo, y es el primer ancho donde el décimo nivel entra en un renglón')
afirmarIgual(variantesActivas(389), ['angosto'], '  y a 389 sigue siendo el único: `chico` todavía no entró, o sea que el Hero sigue en papel')
afirmarIgual(variantesActivas(390), ['angosto', 'chico'], 'a 390 entra `chico` — el primer ancho donde la escena se ve y la marca del Hero se apaga')
afirmarIgual(variantesActivas(425), ['angosto', 'chico'], 'a 425 `movil` todavía NO entró: `max-movil:` cubre ESE ancho, que es el punto del token')
afirmarIgual(variantesActivas(426), ['angosto', 'chico', 'movil'], '  y a 426 sí: ahí la banda móvil termina')
afirmarIgual(variantesActivas(769), ['angosto', 'chico', 'movil', 'tablet', 'hasta-tablet'], 'a 769 entra `hasta-tablet`: `max-hasta-tablet:` cubre el 768 y `max-tablet:` no')
/**
 * ⚠️ **LAS DOS CARAS `min-width` DE LOS CORTES DE UN SENTIDO APARECEN ACÁ, Y NO
 * TIENEN CONSUMIDOR.** Tailwind emite las dos caras de todo breakpoint, así que
 * `--breakpoint-movil` (426) y `--breakpoint-hasta-tablet` (769) suman su cara de
 * arriba a esta lista aunque el lane use sólo la de abajo. Es lo mismo que ya
 * pasaba con `angosto` y `chico`: la tabla dice qué EMITE el tema, no qué se usa.
 */
afirmarIgual(variantesActivas(768), ['angosto', 'chico', 'movil', 'tablet'], 'a 768 entra `tablet`, y `movil` ya venía de 426')
/**
 * 🔴 **EL SALTO SE MUDÓ UN PÍXEL, y no es un ajuste cosmético del test.**
 * `escritorio:` entraba a 1025 porque el token valía 1025 y el token era también
 * la compuerta de coreografía. El sprint que bajó la composición a 1024 los
 * separó: la variante entra a 1024 —iPad apaisado y notebook componen como
 * escritorio— y la coreografía se quedó arriba. Por eso acá se afirma 1023 y
 * 1024, y el 1025 pasó a ser el borde del OTRO umbral, que no vive en el tema.
 */
afirmarIgual(
  variantesActivas(1023),
  ['angosto', 'chico', 'movil', 'tablet', 'hasta-tablet', 'medio'],
  'a 1023 todavía NO hay `escritorio:`',
)
afirmarIgual(
  variantesActivas(1024),
  ['angosto', 'chico', 'movil', 'tablet', 'hasta-tablet', 'medio', 'escritorio'],
  'y a 1024 sí: es el salto de COMPOSICIÓN, que ya no coincide con el de coreografía',
)
afirmarIgual(
  ESCENARIO_MIN_ANCHO_PX - BREAKPOINTS.escritorio,
  0,
  '  y el de coreografía corta en el mismo ancho: la franja de un píxel se cerró (MÓVIL-TRABAJOS)',
)
// ⚠️ 1023 y no 1024: el corte de composición bajó un píxel, así que 1024 pasó a
// ser el primer ancho donde `escritorio:` SÍ entra. El par de abajo prueba los
// dos lados del corte nuevo, y el control positivo usa el lado que descarta.
afirmarIgual(
  clasesEfectivas('grid-cols-1 escritorio:grid-cols-5 hover:opacity-50', 1023),
  ['grid-cols-1', 'hover:opacity-50'],
  'una clase `escritorio:` se descarta entera abajo del corte y el `hover:` se conserva',
)
afirmarIgual(
  clasesEfectivas('grid-cols-1 escritorio:grid-cols-5 hover:opacity-50', 1024),
  ['grid-cols-1', 'grid-cols-5', 'hover:opacity-50'],
  '  y a 1024 entra con el prefijo sacado: portátil compone como escritorio',
)
controlPositivo(
  'el filtro de clases no deja pasar una variante de ancho que no llega',
  1023,
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
