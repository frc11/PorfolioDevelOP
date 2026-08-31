/**
 * ATMÓSFERA Y SOMBRA (S6) — la niebla, el shadow map y la oclusión de contacto.
 *
 * Es la otra mitad de lo que S6 agregó, y va aparte del rig de luz porque
 * resuelve otro problema: `probeLighting.ts` decide **de dónde viene la luz**;
 * esto decide **qué le hace el espacio** —cuánto aire hay entre la cámara y cada
 * cosa, cómo cae la sombra del objeto y cómo se lee que está apoyado—.
 *
 * Las tres son lo que separa una escena 3D correcta de una que parece
 * fotografiada, y las tres cuestan poco: dos números para la niebla, un mapa de
 * profundidad cuatro veces más chico que el de S5, y un plano con una textura
 * generada.
 */

// ── La sombra ───────────────────────────────────────────────────────────────

/**
 * ⚠️ **`SHADOW_ORTHO` bajó de 13 a 6,5, y no es un recorte: es el arreglo.**
 *
 * La ortográfica del shadow map NO tiene que cubrir el LARGO de la sombra. La
 * cámara de sombra mira EN LA DIRECCIÓN de la luz, así que la sombra de un
 * objeto cae exactamente sobre la silueta de ese objeto en el espacio de la luz:
 * alargar el recuadro para "que entre la sombra" es cubrir superficie donde no
 * puede haber ninguna. Lo único que tiene que entrar es el objeto — radio de su
 * esfera envolvente **5,08** (la caja de 7,17 × 7,17 × 0,56) — más margen.
 *
 * Lo que ese error costaba era resolución, y mucha: el recuadro de ±13 tenía
 * cuatro veces el área necesaria, así que de los 2048² solo la cuarta parte caía
 * sobre el objeto.
 *
 * **Con ±6,5 y 1024², el téxel mide 0,0127 de mundo: EXACTAMENTE el mismo que
 * antes.** Misma nitidez, la cuarta parte de la memoria y la cuarta parte del
 * costo de cada pasada de sombra. Es el ahorro más grande de este sprint y no
 * cuesta un píxel de calidad.
 */
export const SHADOW_ORTHO = 6.5
export const SHADOW_MAP_SIZE = 1024

/**
 * Rango de profundidad de la cámara de sombra. Con la luz a 22 del centro, el
 * objeto ocupa de 16,9 a 27,1. Apretar el rango es lo que le da precisión al
 * buffer de profundidad, o sea menos acné con menos bias.
 *
 * ⚠️ **`SHADOW_FAR` subió de 46 a 64 en S7, y no es holgura: es obligatorio.**
 *
 * Desde que el sol recorre un arco, su elevación baja hasta 11,5° en el cierre,
 * y una luz rasante tira una sombra larga: el borde superior del logo proyecta a
 * **38,8 unidades** del objeto, contra las 10,9 que proyectaba a 36°. Ese punto
 * queda a 60,9 de profundidad desde la cámara de sombra.
 *
 * Y lo que pasa si el rango se queda corto no es que la sombra se degrade: el
 * shader de three descarta el test (`shadowCoord.z <= 1.0`) y devuelve
 * "iluminado", así que **la sombra se corta en seco** a mitad del piso. Un tajo
 * recto donde no hay nada que lo justifique.
 *
 * | elevación | largo de la sombra | profundidad máxima |
 * |---:|---:|---:|
 * | 36,0° (mediodía) | 10,9 | 33,3 |
 * | 20,7° | 21,7 | 43,8 |
 * | 11,5° (cierre) | **38,8** | **60,9** |
 *
 * El precio es precisión: el slab pasa de 34 a 52 de rango, así que el mismo
 * `SHADOW_BIAS` normalizado equivale a 0,016 de mundo en vez de 0,010. Sobre un
 * logo de 7 unidades es despreciable, y `SHADOW_NORMAL_BIAS` —que es el que
 * hace el trabajo fino— se mide en mundo y no cambia.
 *
 * La ortográfica NO hay que tocarla: la sombra cae sobre la silueta del objeto
 * en el espacio de la luz, así que su huella sigue cabiendo en la esfera
 * envolvente de 5,08 por rasante que sea la luz. Lo que crece es la
 * profundidad, no el ancho.
 */
export const SHADOW_NEAR = 12
export const SHADOW_FAR = 64

/**
 * El par que decide entre acné y peter-panning.
 *
 * `normalBias` corre el punto de muestreo a lo largo de la normal, y por eso se
 * mide en téxeles: 0,018 es ~1,4 téxeles de 0,0127. Con menos aparece acné en
 * las caras casi paralelas a la luz; con mucho más, la sombra se despega del
 * objeto en el contacto.
 *
 * Acá el despegue no es el riesgo que suele ser —el logo no toca el piso, ver
 * `FLOOR_Y`— pero la oclusión de contacto se apoya justo en esa zona, así que el
 * valor se mantiene chico igual.
 */
export const SHADOW_BIAS = -0.0003
export const SHADOW_NORMAL_BIAS = 0.018

/**
 * **El radio de penumbra — y una trampa de three 0.182 que conviene saber.**
 *
 * `<Canvas shadows>` (el booleano) hace que r3f ponga `PCFSoftShadowMap`. Suena
 * a la opción buena y **no lo es en esta versión de three**: el shader solo
 * implementa tres variantes —`SHADOWMAP_TYPE_PCF`, `_VSM` y `_BASIC`— y
 * `PCFSoftShadowMap` no está en la tabla `shadowMapTypeDefines` de
 * `WebGLProgram.js`, así que cae al `|| 'SHADOWMAP_TYPE_BASIC'` del final:
 * **una sola muestra, sin filtrar.** O sea que hasta S5 la sombra de esta escena
 * era un borde duro y aliasado, y no había perilla que la ablandara porque el
 * shader que corría no leía ninguna.
 *
 * `PCFShadowMap` sí está en la tabla, y en 0.182 su implementación es un **disco
 * de Vogel de 5 muestras rotado por píxel** con PCF por hardware en cada una
 * (~20 taps filtrados efectivos), **con el disco escalado por `shadow.radius`**.
 * O sea: la penumbra pasa a ser un número que se elige.
 *
 * Con radio 4 sobre un téxel de 0,0127, el disco mide 0,051 de mundo y el borde
 * se ablanda a ~0,10 — un 1,5% del ancho del logo, que es una penumbra de luz
 * grande y no un filo.
 *
 * ⚠️ **El costo se mueve de lado, no baja: hay que decirlo entero.** La PASADA
 * de sombra cuesta la cuarta parte (el mapa bajó a 1024²), pero la LECTURA pasa
 * de 1 a 5 muestras por fragmento que recibe sombra. Son dos presupuestos
 * distintos —el pre-pase de profundidad contra el sombreado de los receptores— y
 * los receptores acá son el piso y el logo. Bajar `SHADOW_RADIUS` es lo primero
 * si el borde granula (la rotación por píxel es ruido azul: a radio grande se
 * puede leer como grano en la penumbra).
 *
 * (La otra opción era `VSMShadowMap`, que da penumbras de verdad grandes, pero
 * agrega dos pasadas de desenfoque por actualización de sombra y tiene
 * artefactos propios de sangrado. Con una sola pieza proyectando, no compensa.)
 */
export const SHADOW_RADIUS = 4

// ── La niebla ───────────────────────────────────────────────────────────────

/**
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
export const FOG_NEAR = 20
export const FOG_FAR = 150

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
