/**
 * ATMÓSFERA (S6) — la niebla y la oclusión de contacto.
 *
 * Va aparte del rig de luz porque resuelve otro problema: `probeLighting.ts`
 * decide **de dónde viene la luz**; esto decide **qué le hace el espacio** —cuánto
 * aire hay entre la cámara y cada cosa y cómo se lee que el logo está apoyado—.
 *
 * **[ESCENA 2] Sin mapa de sombras.** La sombra del logo giraba con el sol del
 * arco y la escena ya no la tiene: lo que apoya el logo es la oclusión de
 * contacto, quieta, de abajo. Las constantes del mapa (ortográfica, bias, radio
 * de PCF) se fueron con ella; su historia está en git (`escena-base-limpia`).
 */

// ── La niebla ───────────────────────────────────────────────────────────────

/**
 * ⚠️ **[ESCENA 2] La bruma pasó de 20→150 a 42→110.** Arranca DETRÁS del logo
 * —la cámara lo ve a 40 como máximo, en la pose del pie— y se come el horizonte:
 * el ciclorama, que cae entre 70 y 150 de la cámara, se va a la niebla. El logo
 * sigue sin velarse en ningún cuadro, que es la condición de abajo. La cuenta
 * de la tabla de S7 es con los números viejos.
 *
 * PERSPECTIVA ATMOSFÉRICA — lo que más separa una escena 3D amateur de una
 * profesional, y cuesta dos números.
 *
 * ── Por qué lineal y no exponencial ────────────────────────────────────────
 *
 * `FogExp2` empieza a teñir desde el primer milímetro; con `Fog` lineal hay un
 * `near` explícito antes del cual no pasa nada. Eso importa acá porque hay algo
 * que NO se puede velar: el logo.
 *
 * ── Dónde arranca, y ésta es la decisión ───────────────────────────────────
 *
 * `FOG_NEAR` está calculado contra el recorrido CALIBRADO, no contra un rango
 * genérico. Los tres números que lo fijan:
 *
 * - **La distancia de ojo más grande de todo el recorrido es 17,5** (el keyframe
 *   de entrada; el cierre está a 16,1). `FOG_NEAR` = 20 queda por encima con
 *   2,5 de margen, y ese margen aguanta el offset de mouse a máxima distancia.
 *   O sea: **el logo NUNCA se vela, en ningún frame.** Es la condición para que
 *   sea el punto de mayor contraste de la escena.
 * - **El anillo de planos suspendidos cae entre 23 y 33 de la cámara** en las
 *   poses de frente, así que le toca entre **0,2% y 2,8%**: apenas un velo.
 * - **El ciclorama cae entre 45 y 87**, o sea entre **10% y 52%**. Ahí es donde
 *   la niebla trabaja de verdad: el fondo se despega del piso y la profundidad
 *   se lee sin una sola geometría nueva.
 *
 * ⚠️ **CORRECCIÓN DE S7, y cambia decisiones futuras: la niebla de three es
 * `smoothstep`, no lineal — y se mezcla en sRGB, no en lineal.**
 *
 * `fog_fragment.glsl.js` hace `smoothstep(fogNear, fogFar, depth)`, y el
 * `#include <fog_fragment>` va DESPUÉS de `<tonemapping_fragment>` y de
 * `<colorspace_fragment>`, así que la mezcla ocurre sobre el valor de salida ya
 * convertido. S6 la contó lineal y en espacio lineal, y por eso sobreestimó el
 * velo del medio campo:
 *
 * | distancia | S6 dijo (lineal) | es (smoothstep) |
 * |---:|---:|---:|
 * | 23 | 2,3% | **0,2%** |
 * | 33 | 10,0% | **2,8%** |
 * | 46 | 20,0% | **10,4%** |
 * | 84 | 49,2% | **48,8%** |
 *
 * O sea: **cerca casi no vela y lejos vela casi lo mismo.** El miedo de S6 —que
 * la niebla se comiera la masa oscura que S5 compuso— era cuatro veces mayor de
 * lo real: los planos del fondo del hero pasan de 5/255 a 10/255, no a 77/255
 * como daba la cuenta vieja. Si igual se quiere menos velo en el medio campo la
 * perilla sigue siendo `FOG_NEAR`; si se quiere más masa oscura,
 * `PLANE_DARK_COLOR`. Pero el problema es mucho más chico de lo que estaba
 * escrito.
 *
 * ── El halo, que es lo que hay que no hacer ────────────────────────────────
 *
 * Un halo alrededor del objeto aparece cuando la niebla del objeto es más clara
 * que el fondo contra el que se lo ve. Acá no puede pasar, por construcción: el
 * ciclorama **también** está enniebla y está SIEMPRE más lejos que lo que tiene
 * delante, así que su valor es siempre el más cercano al de la niebla. Todo lo
 * demás queda por debajo.
 */
export const FOG_NEAR = 42
export const FOG_FAR = 110

/**
 * Color de la niebla: un escalón por debajo del papel (`#F7F7F5`).
 *
 * Igual sería defendible —la niebla de un estudio es el propio ciclorama
 * rebotando— pero un pelo más oscuro hace que el fondo lejano CIERRE en vez de
 * abrirse, y con eso el espacio se lee como una sala y no como un infinito
 * blanco. La diferencia contra el piso cercano es de un 8% de luminancia: se
 * percibe como profundidad, no como un cambio de color.
 */
export const FOG_COLOR = '#EFEFEC'

// ── La oclusión de contacto ─────────────────────────────────────────────────

/**
 * LA SOMBRA DE CONTACTO — el detalle que hace que el objeto pertenezca al piso.
 *
 * La sombra proyectada dice de dónde viene la luz; la oclusión de contacto dice
 * que el objeto está APOYADO. Son dos cosas distintas y la segunda es la que
 * falta cuando un render "flota": es la luz ambiente que no llega a la rendija
 * entre el objeto y el suelo, así que es más densa, más cerrada y no tiene
 * dirección.
 *
 * ── Cómo está hecha, y por qué así ─────────────────────────────────────────
 *
 * Un plano horizontal debajo del logo con una máscara de alfa generada a mano
 * (`createContactSpriteData`, junto a los otros dos generadores de sprite en
 * `probeScene.ts`). **Un draw call, dos triángulos, una textura de 96² que se
 * calcula una vez.**
 *
 * La alternativa de biblioteca (`<ContactShadows>` de drei) renderiza la escena
 * desde abajo a una textura **en cada frame**: una pasada de render completa
 * más, por un efecto que acá es una mancha fija debajo de un objeto fijo. No
 * compensa, y de paso este camino no suma una importación.
 *
 * ── Las medidas ────────────────────────────────────────────────────────────
 *
 * Ancho poco más grande que la huella del logo y profundidad mucho mayor que su
 * espesor (0,56): la oclusión no copia la silueta, se derrama. El núcleo denso
 * cubre el tercio central y de ahí cae con exponente, que es lo que la
 * diferencia de un degradé lineal — una oclusión es fuerte y corta, no una
 * sombra difusa grande.
 *
 * Va **por encima de las marcas de piso** (que apoyan en `FLOOR_Y` y suben hasta
 * 0,012) para que también las oscurezca: una oclusión que no toca lo que está
 * debajo del objeto no es una oclusión, es una calcomanía.
 */
export const CONTACT_WIDTH = 8.6
export const CONTACT_DEPTH = 2.9
export const CONTACT_LIFT = 0.019
export const CONTACT_COLOR = '#171714'
export const CONTACT_OPACITY = 0.52
export const CONTACT_SPRITE_SIZE = 96
/** Fracción del radio con densidad plena. */
export const CONTACT_CORE = 0.3
/** Exponente de la caída fuera del núcleo. Más alto = más cerrada. */
export const CONTACT_FALLOFF = 1.9
