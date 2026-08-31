import { celosiaCoverage, fitCelosiaSkyShare } from './celosiaGeometry'
import { MOIRE_MISMATCH } from './probeMoire'
import { FLOOR_Y } from './probeScene'

/**
 * LA CELOSÍA (S11) — el sol deja de ser un objeto y pasa a ser una dirección.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * HAY UN SOL AFUERA Y UNA CELOSÍA EN EL MEDIO. LA LUZ ENTRA POR LOS HUECOS.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * S10 hizo visible al disco —de 13–36% tapado a 28–71%, con 109 y 157 puntos de
 * contraste— y no alcanzó: **no se leía como un sol, se leía como una mancha
 * clara difusa.** El diagnóstico no era de visibilidad. Un sol no es un círculo
 * en el cielo: es una dirección de la que viene la luz.
 *
 * Así que el cuerpo se borró entero (`SunBody.tsx`, `SunWashout.tsx` y
 * `probeSun.ts`) y **el arco no se tocó**: azimut, elevación, nivel y kelvin son
 * los de S9 y `nivel = sin(elevación)/sin(36°)` sigue valiendo. Es el mismo dato
 * con otro consumidor — antes colocaba un sprite, ahora proyecta.
 *
 * ── Sobre papel blanco no se puede AGREGAR luz, solo SACARLA ───────────────
 *
 * Es la razón por la que el disco no se veía y es la que ordena todo este
 * archivo. **El elemento visible es la sombra, no el rayo.**
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL TECHO QUE SE MIDIÓ ANTES DE CONSTRUIR
 * ════════════════════════════════════════════════════════════════════════════
 *
 * El piso está SOBREEXPUESTO, y eso acota cualquier sombra. Con el instrumento
 * de S10: el papel a luz plena da **249,4/255** y su propia sombra dura —la del
 * logo, que apaga la key entera— da **236,9**. **Doce puntos y medio es TODO el
 * rango** que una sombra proyectada puede usar, porque la key es el 46% de la
 * irradiancia del piso y `NeutralToneMapping` comprime todo lo que pasa de 0,76
 * lineal. El mismo aplastamiento se come las marcas: `#D7D7D5` sobre papel
 * iluminado queda a 5,0 puntos de él.
 *
 * O sea que **la proyección sola no arregla el piso**: baja el hero de 216 a 211
 * y Números de 222 a 219.
 *
 * ── Lo que sí lo mueve, y es la misma física ───────────────────────────────
 *
 * La celosía no tapa solo al sol: **tapa el cielo.** Y el hemisférico de esta
 * escena se llama, literalmente, "el cielo del estudio y el rebote del papel"
 * (`probeLighting.ts`). Así que el reparto sale de lo que cada luz YA declara
 * ser, no de una decisión nueva:
 *
 * | luz | dónde está | qué le hace la celosía |
 * |---|---|---|
 * | **key** | el sol, afuera | **el patrón**: sombra dura, medio grado de fuente contra una celda de 3,5° |
 * | **relleno** | *"el rebote de la sala"* | nada: está adentro |
 * | **contraluz** | *"solidario a la cámara"* | nada: está adentro |
 * | **hemisférico** | *"el cielo del estudio"* | **una constante**: es la fuente más ancha que hay, su sombra a través de una trama fina es su propio promedio |
 *
 * Con las dos cosas el papel pasa de **249,4 / 236,9 (12,5 puntos)** a
 * **248,3 / 218,8 — 29,5 puntos**. El alto casi no se mueve y la sombra baja 18,
 * porque la sombra cruza el codo del tone map y el alto se queda arriba. Es lo
 * que hace una fotografía.
 *
 * Y dos consecuencias que no se buscaron: **la sombra propia del logo gana los
 * mismos 17 puntos** (nunca fue un problema de celosía, era el mismo
 * aplastamiento) y **las 48 marcas se despiertan** — `#D7D7D5` está a 5,0 puntos
 * del papel en la luz y a **30,3 adentro de una banda**. No se agregó contraste:
 * se destapó el que ya estaba.
 */

// ── La barra ────────────────────────────────────────────────────────────────

/**
 * Qué fracción de la celda ocupa la barra que tapa. Es el único número propio de
 * este archivo: todo lo demás lo lee de `probeMoire.ts`.
 *
 * **0,29 es el máximo medido del batido, y la teoría dice lo mismo.** El batido
 * sobre el piso es una modulación de la cobertura LOCAL entre las dos capas: en
 * fase, la cobertura es la de una sola capa (c); fuera de fase, 1 − (1 − c)². La
 * diferencia es c − c², que es máxima en c = 0,5, o sea con la barra en
 * 1 − √0,5 = **0,293**. Medido sobre el cuadro real, el batido en puntos sRGB da
 * 10,8 en hero con 0,29 contra 9,4 con 0,25 y 10,5 con 0,35.
 *
 * **La perilla está en el panel y se calibra mirando.** Subirla a 0,35 baja tres
 * puntos más el valor medio del cuadro y afloja el batido; bajarla lo afloja
 * también y deja el piso más claro. El número que hay que mirar no es la media:
 * es si el batido se lee sobre el papel.
 *
 * ⚠️ **No es el trazo de la trama.** La trama dibujada tiene líneas de 0,194° —
 * el 5,5% de la celda fina— porque es la retícula del sitio, 1 px sobre 32 y
 * sobre 64. Con esa proporción la celosía sería casi todo hueco y la sombra
 * bajaría 1,4 puntos: invisible. La barra es una propiedad ÓPTICA de la celosía,
 * no un cambio a la trama; la trama no se toca (regla 5 del sprint).
 */
export const CELOSIA_BAR = 0.29
export const CELOSIA_BAR_MAX = 0.5

// ── El cielo ────────────────────────────────────────────────────────────────

/**
 * ⚠️ **ES UNA CONSTANTE, NO UNA OCLUSIÓN DE CIELO POSICIÓN A POSICIÓN.**
 *
 * Ω es la fracción de la irradiancia del hemisferio superior —pesada por coseno,
 * que es como un difuso Lambert ve el cielo— que la celosía intercepta. Sale de
 * **integrar el hemisferio contra la geometría de `probeMoire.ts`**, una vez, al
 * cargar el módulo, ajustado por mínimos cuadrados sobre todo el rango del slider
 * (ver `fitCelosiaSkyShare`): si mañana cambian los radios, las bandas o el
 * desvanecido, este número se mueve solo. No está escrito a mano.
 *
 * Se evalúa en el CENTRO de la losa. **Ésa es la simplificación, y queda
 * declarada:** medido punto por punto, el factor de cielo va de 0,676 en el
 * centro a 0,602 en el borde de la losa (radio 32) — o sea ±6% alrededor del
 * valor que se usa. Hacerlo por fragmento costaría una integral de hemisferio
 * por píxel; el error que se acepta a cambio es ese 6%, y se acepta porque la
 * variación es MONÓTONA y suave: no produce ningún borde, solo un degradé que la
 * constante aplana.
 *
 * La forma cerrada que corre en runtime es
 *
 *     cielo(barra) = 1 − Ω · (1 − (1 − cobertura)²)
 *
 * y su acuerdo con la integral numérica está comprobado en
 * `s11-piso.invariant.ts`: el error es de 0,1/1000 en la barra de diseño y no
 * pasa de 6/1000 en todo el rango del slider.
 */
export const CELOSIA_SKY_SHARE = fitCelosiaSkyShare([0, FLOOR_Y, 0], MOIRE_MISMATCH)

/**
 * Cuánto del hemisférico llega con la celosía puesta. 1 = cielo abierto.
 *
 * Va sobre la INTENSIDAD del hemisférico y no sobre su color de cielo, y hay un
 * motivo: `probeLighting.ts` dice que la diferencia entre el cielo y el rebote
 * del piso "es lo que dibuja la cove". Tocando solo el color de cielo esa
 * diferencia se invierte —el rebote pasa a ser más claro que el cielo— y la cove
 * se leería al revés. Bajando la intensidad, el gradiente se conserva: entra
 * menos luz a la sala, el papel devuelve menos, y la relación entre los dos
 * queda donde S6 la dejó.
 */
export function celosiaSkyFactor(bar: number): number {
  const open = 1 - celosiaCoverage(Math.min(CELOSIA_BAR_MAX, Math.max(0, bar)))
  return 1 - CELOSIA_SKY_SHARE * (1 - open * open)
}

// ── Los haces que NO van ────────────────────────────────────────────────────

/**
 * ⚠️ **UNA PREMISA DEL SPRINT QUE LA MEDICIÓN CORRIGIÓ, PARA QUE NADIE LA CITE
 * COMO REGLA.**
 *
 * El sprint decía que un haz de luz claro solo se lee contra fondo oscuro, y que
 * "en Hero, Números y Trabajos el cuadro es claro y un haz claro es invisible".
 * **El enunciado es demasiado general.** Con el cielo tapado, el fondo aéreo real
 * —el ciclorama con la envolvente encima— baja lo suficiente en las seis poses:
 *
 * | pose | fondo aéreo | margen a 255 | alfa aditivo para 5% de Weber |
 * |---|---:|---:|---:|
 * | hero | 208 | 47 | 0,041 |
 * | quiénes somos | 199 | 56 | 0,039 |
 * | números | 192 | 63 | 0,038 |
 * | trabajos | 184 | 71 | 0,036 |
 * | demos | 136 | 119 | 0,027 |
 * | cierre | 93 | 162 | 0,018 |
 *
 * Lo que sí sigue siendo verdad, y es la frase que corresponde: **sobre el PISO
 * —249 a 218— no hay margen para agregar luz, y el piso es el 51% al 73% del
 * cuadro en las poses claras.**
 *
 * **Los haces no se construyeron igual, y por tres razones que no son estéticas:**
 * (1) son geometría transparente nueva encima del 51%/57% que las dos capas de la
 * envolvente ya mezclan, justo en las poses más caras; (2) son aditivos, y S10
 * midió lo que cuesta lo aditivo acá —el washout llevó el contraste del sol de
 * 109 a 64 puntos—, así que se comerían los 29,5 que este sprint compró; (3) la
 * regla 6 del sprint prohíbe el efecto Star Wars, y un volumen visible saliendo
 * de una celosía **es** eso.
 *
 * La tabla queda escrita para que la decisión sea revocable con datos y no haya
 * que volver a medir.
 */
export const CELOSIA_SHAFT_ALPHA_FOR_5_PERCENT: readonly (readonly [string, number, number])[] = [
  ['hero', 208, 0.041],
  ['quiénes somos', 199, 0.039],
  ['números', 192, 0.038],
  ['trabajos', 184, 0.036],
  ['demos', 136, 0.027],
  ['cierre', 93, 0.018],
]
