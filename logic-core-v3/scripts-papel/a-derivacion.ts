/**
 * PAPEL-2 · LA DERIVACIÓN PREVIA — los tamaños del §3 y el presupuesto de alto
 * del §4, ANTES de tocar una línea de marcado.
 *
 * ── Por qué esto corre primero y sin navegador ────────────────────────────
 *
 * La instrucción pone el §4 como una PARADA: «simulá el alto total contra los
 * 667 px de 375 y los 568 de 320; si no entra, FRENÁ Y REPORTÁ». Una parada que
 * se contesta después de construir no es una parada. Así que este instrumento
 * contesta las dos preguntas con las mismas tablas de avance del `.woff2` y los
 * mismos tokens del tema con los que `hero/composicion.ts` ya trabaja — cero
 * navegador, cero build, cero cambios en el árbol.
 *
 * ── Las dos preguntas ─────────────────────────────────────────────────────
 *
 *   §3  ¿qué tamaño tienen que tener «TU NEGOCIO» y «VENDIENDO» para que el
 *       MÁS ANCHO de los dos iguale la tinta de «LAS 24 HS», con 2 px de
 *       tolerancia? — y la respuesta es una RAZÓN entre dos avances, no un
 *       número elegido.
 *
 *   §4  con esos tamaños, más la palabra `develOP` y el logo 2D arriba, ¿entra
 *       el bloque en 667 px (375) y en 568 (320)? — y si no entra, cuánto falta
 *       y con qué logo entraría.
 *
 * ── ⚠️ LOS SUPUESTOS, DECLARADOS ─────────────────────────────────────────
 *
 * · El avance sale de `hmtx` en la instancia POR DEFECTO del eje de peso. El
 *   registro 1 se pinta en 700 y la tabla publica el 600, así que se aplica
 *   `FACTOR_DEL_PESO_700`, el mismo que `hero/composicion.ts` §12b/§14b ya
 *   derivó contra el mismo binario. El registro 2 se pinta en 300 —más angosto
 *   que la tabla— y NO se corrige: ese error empuja a sobreestimar su tinta, o
 *   sea que el tamaño que sale del §3 es un tamaño con margen.
 * · No hay kerning. Mismo supuesto que los tres instrumentos anteriores.
 * · El alto de una caja de línea es `tamaño × interlineado`, que es lo que
 *   `cajaDeLinea` ya calcula. Los márgenes de colapso no existen acá: todas las
 *   piezas son ítems de un `flex-col`.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FUENTE_DISPLAY, FUENTE_ITALICA, FUENTE_TITULO, anchoDeTexto } from '../src/app/v3/_lib/__tests__/s10-avance'
import { leerAvancesDe } from '../src/app/v3/_lib/__tests__/s10-woff2'
import { tokenPx, anchoDeContenido } from '../src/app/v3/_lib/__tests__/s10-css'
import { tracking } from '../src/app/v3/_lib/__tests__/s10-mobile'
import { medidaDelTitular } from '../src/app/v3/_lib/__tests__/s3-banda-consecuencias'
import { DESCUENTO_NACIMIENTO_PX } from '../src/app/v3/_lib/navegacion'
import { CONTENIDO } from '../src/app/v3/_secciones/hero/contenido'
import { FACTOR_DEL_PESO_700 } from '../src/app/v3/_secciones/hero/composicion'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(AQUI, '..')
const SALIDA = path.join(RAIZ, 'docs/rediseno/outputs/papel')

/** Los dos anchos que este sprint pinta en papel. El resto no se mueve. */
const ANCHOS_DE_PAPEL = [320, 375] as const
/** El alto de viewport con el que se mide cada uno. Los del set de capturas. */
const ALTOS: Readonly<Record<number, number>> = { 320: 568, 375: 667 }

const DISPLAY = leerAvancesDe(FUENTE_DISPLAY)
const ITALICA = leerAvancesDe(FUENTE_ITALICA)
const ROMANA = leerAvancesDe(FUENTE_TITULO)

const FILA_1 = CONTENIDO.titularFila1.toUpperCase()
const FILA_2 = CONTENIDO.titularFila2.toUpperCase()
const FILA_3 = CONTENIDO.titularFila3.toUpperCase()

const TRACKING_DISPLAY = tracking('display')
const TRACKING_TITULO = tracking('titulo')

/** El avance en `em` de una cadena en la cara de display, con el peso corregido. */
const emDisplay = (texto: string): number =>
  (anchoDeTexto(DISPLAY, texto, 1, TRACKING_DISPLAY) * FACTOR_DEL_PESO_700)

/** El avance en `em` de una cadena en la itálica, sin corregir (ver supuestos). */
const emItalica = (texto: string): number => anchoDeTexto(ITALICA, texto, 1, TRACKING_TITULO)

/** El tamaño con el que HOY se pinta la fila 3 a cada ancho de papel. */
function tamanoDeLaFila3(ancho: number): number {
  return ancho < 375
    ? tokenPx('--text-display-xl-angosto', ancho)
    : tokenPx('--text-fluido-display-xl', ancho)
}

interface FilaDeDerivacion {
  readonly ancho: number
  readonly cajaDelTitular: number
  readonly tamanoFila3: number
  readonly tintaFila3: number
  readonly emFila1: number
  readonly emFila2: number
  readonly tamanoHoy: number
  readonly tamanoPedido: number
  readonly razon: number
  readonly tintaFila1Pedida: number
  readonly tintaFila2Pedida: number
  readonly desvio: number
  readonly entraEnLaCaja: boolean
  readonly techoDeLaCaja: number
}

function derivar(ancho: number): FilaDeDerivacion {
  const caja = medidaDelTitular(ancho)
  const t3 = tamanoDeLaFila3(ancho)
  const a1 = emDisplay(FILA_1)
  const a2 = emDisplay(FILA_2)
  const aMax = Math.max(a1, a2)
  const a3 = emItalica(FILA_3)
  const tinta3 = a3 * t3
  // La razón: el tamaño al que la fila MÁS ANCHA del registro 1 iguala la tinta
  // de la fila 3. No es un número elegido: es `avance(fila 3) / avance(la más
  // ancha del registro 1)` multiplicado por el tamaño de la fila 3.
  const razon = a3 / aMax
  const pedido = t3 * razon
  return {
    ancho,
    cajaDelTitular: caja,
    tamanoFila3: t3,
    tintaFila3: tinta3,
    emFila1: a1,
    emFila2: a2,
    tamanoHoy: tokenPx('--text-fluido-display', ancho),
    tamanoPedido: pedido,
    razon,
    tintaFila1Pedida: a1 * pedido,
    tintaFila2Pedida: a2 * pedido,
    desvio: Math.abs(aMax * pedido - tinta3),
    entraEnLaCaja: aMax * pedido <= caja,
    techoDeLaCaja: caja / aMax,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// §4 · EL PRESUPUESTO DE ALTO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * El alto del bloque, pieza por pieza, con los tamaños que el §3 pide.
 *
 * Las piezas que HOY existen se modelan con los mismos tokens que el marcado
 * emite; las dos que el §2 agrega se dejan como PARÁMETRO, porque de eso trata
 * la pregunta: cuánto sobra para ellas.
 */
interface Presupuesto {
  readonly ancho: number
  readonly alto: number
  readonly disponibleHoy: number
  readonly disponibleSinPastilla: number
  readonly registro1: number
  readonly registro2: number
  readonly huecoTitular: number
  readonly bajada: number
  readonly huecoColumna: number
  readonly cta: number
  readonly huecoBajadaCta: number
  readonly bloqueHoy: number
  readonly bloqueConElPedido: number
  readonly sobranteParaLaMarca: number
  readonly logotipo: number
  readonly isotipoAlto: number
  readonly isotipoAncho: number
  readonly marca: number
  readonly totalConLaMarca: number
  readonly holguraConPastilla: number
  readonly holguraSinPastilla: number
}

/** La razón de la caja de tinta del isotipo: `LOGO_INK_VIEWBOX` de `LogoMark`. */
const RAZON_DEL_ISOTIPO = 978.459 / 680.67

/** El interlineado de los dos registros del titular. El mismo token. */
const LEADING_TITULO = tokenPx('--leading-titulo', 0)
const LEADING_TEXTO = tokenPx('--leading-texto', 0)

/** Los dos huecos de la columna abajo de 1025: `gap-2` los dos (COMPO-1 §1). */
const HUECO_PX = tokenPx('--spacing-2', 0)

/** El relleno vertical que `cta.css` le pone al CTA, arriba y abajo. */
const RELLENO_DEL_CTA = tokenPx('--spacing-2', 0)

function presupuestar(d: FilaDeDerivacion): Presupuesto {
  const alto = ALTOS[d.ancho]
  // `pt-20` arriba y `pb-20` abajo. El de abajo es el que reserva la pastilla.
  const relleno = tokenPx('--spacing-20', 0)
  const disponibleHoy = alto - relleno * 2
  // Con la pastilla desmontada se liberan sus 72 px: el `pb` puede bajar al
  // sobrante que COMPO-1 §6 ya había medido, que es `80 − 72 = 8`.
  const pbSinPastilla = relleno - DESCUENTO_NACIMIENTO_PX
  const disponibleSinPastilla = alto - relleno - pbSinPastilla

  const registro1Hoy = 2 * d.tamanoHoy * LEADING_TITULO
  const registro1 = 2 * d.tamanoPedido * LEADING_TITULO
  const registro2 = d.tamanoFila3 * LEADING_TITULO
  // La bajada: dos renglones declarados abajo de 1025, en `text-base`.
  const bajada = 2 * tokenPx('--text-base', d.ancho) * LEADING_TEXTO
  // El CTA: un renglón de `text-cuerpo` más su relleno arriba y abajo.
  const cta = tokenPx('--text-cuerpo', d.ancho) * LEADING_TEXTO + RELLENO_DEL_CTA * 2

  const bloqueHoy = registro1Hoy + HUECO_PX + registro2 + HUECO_PX + bajada + HUECO_PX + cta
  const bloqueConElPedido = registro1 + HUECO_PX + registro2 + HUECO_PX + bajada + HUECO_PX + cta

  // Las dos piezas que el §2 agrega arriba, con los dos huecos de la columna.
  const logotipo = tokenPx('--text-fluido-caption', d.ancho) * LEADING_TITULO
  const isotipoAlto = d.tamanoPedido * LEADING_TITULO
  const marca = logotipo + HUECO_PX + isotipoAlto + HUECO_PX
  const totalConLaMarca = marca + bloqueConElPedido

  return {
    ancho: d.ancho,
    alto,
    disponibleHoy,
    disponibleSinPastilla,
    registro1,
    registro2,
    huecoTitular: HUECO_PX,
    bajada,
    huecoColumna: HUECO_PX,
    cta,
    huecoBajadaCta: HUECO_PX,
    bloqueHoy,
    bloqueConElPedido,
    sobranteParaLaMarca: disponibleSinPastilla - bloqueConElPedido,
    logotipo,
    isotipoAlto,
    isotipoAncho: isotipoAlto * RAZON_DEL_ISOTIPO,
    marca,
    totalConLaMarca,
    holguraConPastilla: disponibleHoy - totalConLaMarca,
    holguraSinPastilla: disponibleSinPastilla - totalConLaMarca,
  }
}

// ═══════════════════════════════════════════════════════════════════════════

const derivaciones = ANCHOS_DE_PAPEL.map(derivar)
const presupuestos = derivaciones.map(presupuestar)

const lineas: string[] = []
const p = (s: string): void => {
  lineas.push(s)
  console.log(s)
}

p('═══ PAPEL-2 · §3 · EL TAMAÑO DEL REGISTRO 1, DERIVADO ═══')
p('')
p(`avance de «${FILA_1}» (display 700, tracking ${TRACKING_DISPLAY}): ${emDisplay(FILA_1).toFixed(5)} em`)
p(`avance de «${FILA_2}» (display 700, tracking ${TRACKING_DISPLAY}): ${emDisplay(FILA_2).toFixed(5)} em`)
p(`avance de «${FILA_3}» (itálica 300, tracking ${TRACKING_TITULO}): ${emItalica(FILA_3).toFixed(5)} em`)
p(`la fila MÁS ANCHA del registro 1 es «${emDisplay(FILA_1) >= emDisplay(FILA_2) ? FILA_1 : FILA_2}»`)
p('')
for (const d of derivaciones) {
  p(`@${d.ancho}  caja ${d.cajaDelTitular.toFixed(2)} px`)
  p(`   fila 3: ${d.tamanoFila3.toFixed(2)} px → tinta ${d.tintaFila3.toFixed(2)} px`)
  p(`   registro 1 HOY: ${d.tamanoHoy.toFixed(2)} px → tinta ${(Math.max(d.emFila1, d.emFila2) * d.tamanoHoy).toFixed(2)} px  (escalón de ${(d.tintaFila3 - Math.max(d.emFila1, d.emFila2) * d.tamanoHoy).toFixed(2)} px)`)
  p(`   registro 1 PEDIDO: ${d.tamanoPedido.toFixed(2)} px  (razón ${d.razon.toFixed(5)} × ${d.tamanoFila3.toFixed(2)})`)
  p(`     «${FILA_1}» → ${d.tintaFila1Pedida.toFixed(2)} px · «${FILA_2}» → ${d.tintaFila2Pedida.toFixed(2)} px`)
  p(`     desvío contra la fila 3: ${d.desvio.toFixed(4)} px  (tolerancia 2)`)
  p(`     ¿entra en la caja? ${d.entraEnLaCaja ? 'SÍ' : 'NO'} — techo de la caja ${d.techoDeLaCaja.toFixed(2)} px`)
  p('')
}

p('═══ PAPEL-2 · §4 · EL PRESUPUESTO DE ALTO ═══')
p('')
p(`--leading-titulo ${LEADING_TITULO} · --leading-texto ${LEADING_TEXTO} · hueco ${HUECO_PX} px`)
p(`DESCUENTO_NACIMIENTO_PX (lo que la pastilla ocupa) = ${DESCUENTO_NACIMIENTO_PX} px`)
p('')
for (const b of presupuestos) {
  p(`@${b.ancho}×${b.alto}`)
  p(`   disponible HOY (pt-20 + pb-20):            ${b.disponibleHoy.toFixed(2)} px`)
  p(`   disponible SIN pastilla (pb baja a ${(b.alto - tokenPx('--spacing-20', 0) - b.disponibleSinPastilla).toFixed(0)}):  ${b.disponibleSinPastilla.toFixed(2)} px`)
  p(`   bloque HOY:                                ${b.bloqueHoy.toFixed(2)} px`)
  p(`   bloque con el §3:                          ${b.bloqueConElPedido.toFixed(2)} px   (+${(b.bloqueConElPedido - b.bloqueHoy).toFixed(2)})`)
  p(`      registro 1 ${b.registro1.toFixed(2)} · registro 2 ${b.registro2.toFixed(2)} · bajada ${b.bajada.toFixed(2)} · CTA ${b.cta.toFixed(2)} · huecos ${(HUECO_PX * 3).toFixed(2)}`)
  p(`   SOBRANTE para la marca (palabra + logo + 2 huecos): ${b.sobranteParaLaMarca.toFixed(2)} px`)
  p(`   la marca del §2 mide ${b.marca.toFixed(2)} px: palabra ${b.logotipo.toFixed(2)} + hueco ${HUECO_PX} + isotipo ${b.isotipoAlto.toFixed(2)} (× ${b.isotipoAncho.toFixed(2)} de ancho) + hueco ${HUECO_PX}`)
  p(`   TOTAL con la marca:                        ${b.totalConLaMarca.toFixed(2)} px`)
  p(`      holgura CON la pastilla (pb-20):        ${b.holguraConPastilla.toFixed(2)} px  ${b.holguraConPastilla >= 0 ? '' : '← NO ENTRA'}`)
  p(`      holgura SIN la pastilla (pb-2):         ${b.holguraSinPastilla.toFixed(2)} px  ${b.holguraSinPastilla >= 0 ? '✓ ENTRA' : '← NO ENTRA'}`)
  p('')
}

mkdirSync(SALIDA, { recursive: true })
writeFileSync(
  path.join(SALIDA, 'a-derivacion.json'),
  `${JSON.stringify({ derivaciones, presupuestos, leadingTitulo: LEADING_TITULO, leadingTexto: LEADING_TEXTO, hueco: HUECO_PX, descuentoDeLaPastilla: DESCUENTO_NACIMIENTO_PX }, null, 2)}\n`,
)
writeFileSync(path.join(SALIDA, 'a-derivacion.txt'), `${lineas.join('\n')}\n`)
console.log(`\nescrito en ${path.relative(RAIZ, SALIDA)}`)
