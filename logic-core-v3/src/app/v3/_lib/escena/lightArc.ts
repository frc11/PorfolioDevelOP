import type { LightStop } from './choreographyTypes'
import { KEY_ELEVATION_DEG, RIM_NIGHT_LEVEL } from './probeLighting'

/**
 * EL ARCO DEL SOL — el dato, en su propio archivo desde B8.
 *
 * `probeSun.ts` dibujaba el cuerpo hasta S11; `lightRig.ts` coloca la luz y la
 * celosía proyecta: todos leen de acá. Lo que ilumina, lo que proyecta la sombra
 * y lo que se ve en el cuadro son el mismo objeto en la misma posición: un sol
 * por un lado y una key por el otro son **dos soles**, y en cuanto uno se mueve
 * el espacio deja de ser creíble.
 *
 * Vivía adentro de `choreography.ts` (S6 → S9) y salió a este archivo en B8 por
 * la regla de las 300 líneas: aquél está en su base heredada exacta (471) y el
 * arco creció de seis a ocho paradas. `choreography.ts` lo re-exporta, así que
 * ningún consumidor cambió de import.
 *
 * ── La relación que ata el nivel con la elevación ──────────────────────────
 *
 * > **`level` = sin(elevación) / sin(36°)**
 *
 * No es una coincidencia bonita: es la definición. La irradiancia que una
 * fuente lejana deposita sobre una superficie horizontal es proporcional al
 * seno de su elevación, así que **la sala no se apaga porque bajamos un
 * número: se apaga porque el sol baja.** 36° es la elevación que S6 calibró
 * para la principal. Desde B8 la elevación de cada parada **se deriva** del
 * nivel con `elevacionDe`, así que la relación se cumple por construcción y
 * `s7-sol.invariant.ts` la sigue afirmando parada por parada.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * B8 · EL ARCO DEJA DE SER UNA TARDE: UNA TARDE, UNA NOCHE Y LA MAÑANA SIGUIENTE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * S9 dejó escrito que el arco era una tarde con descenso monótono, y por qué no
 * podía ser un día entero: con esta relación un sol rasante en el hero dejaría
 * la sala en nivel 0,26–0,35, más oscura que su propio cierre. Esa razón sigue
 * valiendo para el ARRANQUE. Lo que B8 cambió —decisión del humano, aceptada en
 * la instrucción— es lo que pasa DESPUÉS de Números:
 *
 *   · El humano grabó Trabajos con el velo de B6-A y el veredicto fue que «no
 *     se parece en nada» a la referencia. La causa es de concepción: un velo
 *     oscuro sobre una sala de papel blanco da gris, nunca negro. La sala de la
 *     referencia en su sección de proyectos tiene luminancia media **0,0010**
 *     (`docs/rediseno/outputs/b8/a-referencia.json`, pantallas 4 a 9); la
 *     nuestra en la pose de Trabajos con el sol a 31° daba 0,74.
 *   · Y en el pie pasaba lo contrario: el sol ya se había puesto (0,34) y el
 *     velo encima lo dejaba negro. «Volver a tener luz en el cierre» y
 *     «oscurecer Trabajos» no caben en una curva monótona.
 *
 * **Qué cuenta la curva nueva.** El día termina cuando termina Números.
 * **Trabajos trae la noche**: la única pantalla de scroll en la que el sol se
 * pone es la que sube el panel de Trabajos, porque los trabajos se ven como se
 * ven las pantallas —encendidos sobre el fondo oscuro— con el polvo hecho
 * estrellas. Detrás de Servicios y Tu panel, que son opacas, amanece sin que
 * nadie lo vea. El diferencial se lee a la luz de la mañana, exactamente la que
 * tenía en su ancla (0,643), y el cierre no vuelve a bajar: se queda en esa
 * misma luz, porque más luz en el pie es MÁS contraste roto (tinta clara sobre
 * la sala), no menos. No es física —un día tiene una sola noche— y se declara
 * como dramaturgia: el azimut sigue barriendo un solo día de un horizonte al
 * otro (los 180° de S9, con el γ de cada pose intacto), y lo único que se
 * conserva como ley es la relación nivel–elevación.
 *
 * ── Las paradas, y de dónde sale cada número ───────────────────────────────
 *
 * | at | qué pasa | nivel | elevación |
 * |---|---|---|---|
 * | 0 → 0,469 | hero · Quiénes somos · Números: la tarde de S9, intacta | 1 | 36° |
 * | 0,469 → 0,5 | Trabajos entra por el pie del cuadro: atardece en UNA pantalla | 1 → 0,04 | 36° → 1,35° |
 * | 0,5 → 0,60 | Trabajos llena el cuadro y se pinnea: **la noche** | **0,04** | 1,35° |
 * | 0,60 → 0,625 | **la vuelta**: el sol asoma antes del blanco de Servicios (B12) | 0,04 → 0,22 | → 7,4° |
 * | 0,625 → 0,7375 | oculto tras Servicios y Tu panel: amanece | 0,22 → 0,5 | → 17,1° |
 * | 0,7375 → 0,8525 | el diferencial entra con el sol subiendo | 0,5 → 0,643 | → 22,2° |
 * | 0,8525 → 1 | el diferencial en su ancla y el Cierre: media luz de mañana | 0,643 | 22,2° |
 *
 * Los progresos son los nudos del anclaje (`anclaje.ts`), no valores redondos:
 * 0,46875 es la pantalla 7 (el borde de arriba de Trabajos toca el pie del
 * viewport), 0,5 es la pantalla 8 (Trabajos llena el cuadro), 0,625 la 11
 * (suelta el pin), 0,7375 el margen de reanudación con el que la escena vuelve
 * a dibujar antes de que el diferencial asome (`visibilidad.ts`), 0,8525 el
 * ancla declarada del diferencial. `s20-arco.invariant.ts` afirma que cada uno
 * coincide con lo que las otras tablas derivan, con su control positivo.
 *
 * **El nivel de la noche sale del modelo y de la referencia.** ⚠️ B12 lo bajó de
 * 0,08 a **0,04** por pedido del humano —*«debe quedar full negro atrás»*— con
 * la tabla entera en la constante. Lo que sigue es la derivación de B8, que
 * vale igual porque el instrumento es el mismo:
 * `scripts-b8/modelo-de-luz.ts` —la misma cadena de shading que
 * `probe-escena/__tests__/shading.ts`, con el nivel por parámetro y el control
 * de S11 reproducido (248,3 / 218,7)— da para la pose de Trabajos un piso de
 * 33 y una pared de fondo de 23 en sRGB (luminancia 0,015 y 0,009), entre el
 * negro de la referencia (0,001) y sus pantallas oscuras con texto (0,032 a
 * 0,067). A 0,10 daba 44/30; a 0,06, 22/16. Se elige 0,08 y lo juzga el humano
 * grabando: es el gate real del bloque.
 *
 * ⚠️ **La noche obligó a dos cosas fuera de este archivo**, las dos con su
 * razón y aprobadas en la PARADA 1 de B8:
 *
 *   1. **El contraluz se apaga con la sala por debajo de 0,34**
 *      (`probeLighting.ts`, `rimIntensityAt`). Con el freno de S6 —`RIM ×
 *      (1 − (1 − nivel) × 0,62)`— el piso de Trabajos no bajaba de 78 aunque
 *      el sol tocara el horizonte: el rim del observador seguía iluminando la
 *      losa. 0,34 es el mínimo del arco viejo, así que todo lo que S6–S12
 *      midieron queda idéntico; la noche es el único régimen nuevo.
 *   2. **`SHADOW_FAR` sube de 64 a 200** (`probeAtmosphere.ts`): a 2,7° la
 *      sombra del logo mide 167 unidades y su punta cae a profundidad 189 del
 *      mapa; con 64 se cortaba en seco a mitad del piso. Lo encontró
 *      `s7-sol.invariant.ts` §3 corriendo sobre el arco candidato.
 *
 * ── Lo que no cambió ───────────────────────────────────────────────────────
 *
 * El azimut es el de S9 en cada progreso —las paradas nuevas toman el valor
 * que la recta vieja daba ahí— y la temperatura también: 6500 K hasta Números,
 * 6850 K en 0,75 y 7700 K al final, interpoladas en los `at` nuevos. La
 * temperatura del cierre (7700 K, fría) sigue siendo §7.8 de
 * `DIRECCION-ESCENA.md`: un número, y opinable.
 *
 * ── Lo que NO está acá ─────────────────────────────────────────────────────
 *
 * Cómo se reparte el nivel entre las tres luces, el hemisférico, la niebla y el
 * contraluz está en `probeLighting.ts`, y no es un reparto plano: el ambiente
 * se apaga más rápido que la principal y el contraluz se resiste hasta 0,34. Es
 * lo que hace que la escena gane contraste al oscurecerse en vez de volverse
 * gris.
 */

const RAD = Math.PI / 180

/**
 * La elevación que le corresponde a un nivel: `asin(nivel × sin 36°)`. Con
 * nivel 1 devuelve exactamente la elevación calibrada de la key —sin pasar por
 * el seno y el arcoseno, que devolverían 36,00000000000001— porque `s7-sol`
 * afirma esa igualdad con `===` y tiene razón en hacerlo.
 */
export function elevacionDe(level: number): number {
  if (level >= 1) return KEY_ELEVATION_DEG
  return Math.asin(level * Math.sin(KEY_ELEVATION_DEG * RAD)) / RAD
}

/**
 * El nivel de la sala en la noche de Trabajos.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠️ B12 · BAJA DE 0,08 A 0,04, Y ES EL PEDIDO DEL HUMANO CON SU NÚMERO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * *«Debe quedar full negro atrás»*. B8 eligió 0,08 y lo dejó explícitamente a
 * juicio del humano grabando —*«es el gate real del bloque»*—; el humano lo
 * grabó y dijo que no alcanza. **La oscuridad la da la luz, no un velo**: es la
 * lección de B8 y no se toca.
 *
 * Con `scripts-b8/modelo-de-luz.ts` —la misma cadena de shading, con su control
 * positivo de S11 (248,3 / 218,7) reproducido— en la pose de Trabajos y con el
 * contraluz apagándose por debajo de 0,34 (tabla B):
 *
 * | nivel | elev | piso medio | pared del fondo | lum piso | lum pared | FAR que pide |
 * |---:|---:|---:|---:|---:|---:|---:|
 * | 0,08 (B8) | 2,70° | 32,8 | 23,1 | 0,0150 | 0,0086 | 190 |
 * | **0,04** | **1,35°** | **11,2** | **10,8** | **0,0034** | **0,0033** | **357** |
 * | 0,02 | 0,67° | 2,9 | 5,6 | 0,0009 | 0,0017 | 693 |
 *
 * La referencia tiene su sala de proyectos en **0,0010** de luminancia media
 * (gris 0,6) y sus pantallas oscuras con texto entre 0,032 y 0,067
 * (`outputs/b8/a-referencia.json`, pantallas 4 a 9). O sea: 0,08 estaba ARRIBA
 * de la banda oscura de la referencia y 0,04 cae adentro, cerca de su piso.
 *
 * **Por qué 0,04 y no 0,02, que sería la cifra exacta de la referencia.** Por
 * la sombra: la elevación sale del nivel por ley (`elevacionDe`), y a 0,67° la
 * punta de la sombra del logo cae a profundidad **693** de la cámara de sombra
 * contra los 357 de 0,04. `SHADOW_FAR` tendría que ir de 200 a 720 y el
 * `SHADOW_BIAS` normalizado equivaldría a 0,21 unidades de MUNDO sobre un logo
 * que flota 0,72 sobre el papel: la sombra se despegaría **a pleno sol**, que es
 * donde sí se ve. Con 0,04 el FAR va a 380 y el bias se re-escala para dejar el
 * equivalente de mundo donde B8 lo dejó (ver `probeAtmosphere.ts`).
 *
 * Queda dicho, porque es la decisión del humano y tiene que ser revocable: **si
 * lo quiere todavía más negro, la cifra es 0,02 y el precio es esa sombra.**
 */
export const NIVEL_DE_LA_NOCHE = 0.04

/** El nivel con el que el diferencial se lee en su ancla y el Cierre termina. Es el de S9 en 0,8525. */
export const NIVEL_DE_LA_MANANA = 0.643

/**
 * ⚠️ **B12 · EL NIVEL AL QUE LLEGA LA VUELTA — NO SE ELIGE, SE IMPORTA.**
 * Es `RIM_NIGHT_LEVEL`, la frontera de la noche que S6/B8 ya tenían declarada:
 * el contraluz se apaga por debajo y las motas empiezan a brillar por debajo. La
 * vuelta lleva la sala exactamente hasta ahí, o sea hasta el punto en que el
 * propio sistema deja de llamar noche a la noche.
 */
export const NIVEL_DE_LA_VUELTA: number = RIM_NIGHT_LEVEL

/**
 * Dónde atardece: de la pantalla 7 a la 8, o sea mientras Trabajos entra por el
 * pie del cuadro. **No se movió en B12**: la noche llega exactamente cuando la
 * sección llena el cuadro y cuando la gota termina de cubrirlo
 * (`trabajos/geometria.ts`, `VENTANA_DE_LA_GOTA.expansionHasta` = 1/3 del
 * recorrido del bloque, que es esta misma pantalla). Lo que cambió es a QUÉ
 * nivel llega.
 */
export const ATARDECER = { desde: 0.46875, hasta: 0.5 } as const

/**
 * ⚠️ **B12 · UNA PANTALLA DE PROGRESO, DERIVADA Y NO ELEGIDA.** Los nudos del
 * anclaje (`anclaje.ts`) ponen la pantalla 8 en 0,5 y la 11 en 0,625: tres
 * pantallas sobre 0,125 de progreso, o sea **1/24 = 0,0416666…** por pantalla en
 * el tramo de Trabajos. Es la unidad con la que se corta la noche.
 */
const PANTALLA_EN_EL_TRAMO_DE_TRABAJOS = (0.625 - 0.5) / 3

/**
 * ⚠️ **B12 · LA NOCHE TERMINA UNA PANTALLA ANTES, Y LA PANTALLA QUE CEDE ES
 * EXACTAMENTE LA QUE EL PIN YA NO USA.**
 *
 * Un `sticky` de una pantalla adentro de una sección de tres se clava mientras
 * `top ≤ 0` y `bottom ≥ ventana`, o sea entre las pantallas **8 y 10**; en la
 * 10 → 11 el panel de Trabajos SE VA hacia arriba y Servicios —papel opaco—
 * sube desde el pie del cuadro. Esa pantalla es la única del tramo en la que el
 * visitante ve las dos cosas a la vez, y es donde el humano pidió *«una previa
 * al blanco»*: **del negro no se puede saltar al papel de golpe.**
 *
 * Así que la noche se sostiene el pin ENTERO (8 → 10) y la vuelta se lleva la
 * pantalla que el pin ya soltó (10 → 11). El negro de los tres proyectos no
 * pierde un solo píxel de scroll.
 */
export const NOCHE = { desde: ATARDECER.hasta, hasta: 0.625 - PANTALLA_EN_EL_TRAMO_DE_TRABAJOS } as const

/**
 * ⚠️ **B12 · LA VUELTA — la previa al blanco, en la pantalla en que Trabajos se
 * va y Servicios llega.**
 *
 * A dónde llega **no se elige: es la frontera de la noche que el sistema ya
 * tenía declarada.** `RIM_NIGHT_LEVEL` (0,34) es el nivel por debajo del cual el
 * contraluz se apaga (`probeLighting.ts`, B8) y por debajo del cual las motas
 * empiezan a brillar (`particleGlow.ts`, B8): es, literalmente, dónde el
 * proyecto declara que empieza y termina la noche. La vuelta lleva la sala
 * hasta ese borde y ni un punto más — el amanecer sigue después, escondido, y
 * llega a 0,5 en 0,7375 exactamente como lo dejó B8.
 *
 * Con el modelo de luz en la pose de Trabajos, la vuelta lleva el piso medio de
 * **11,2 a 134,5 sRGB** (luminancia 0,0034 → 0,2402) en una pantalla de scroll:
 * el papel de Servicios (247) deja de aparecer contra un negro absoluto.
 */
export const VUELTA = { desde: NOCHE.hasta, hasta: 0.625 } as const

/** Dónde amanece: escondido detrás de Servicios y Tu panel, hasta el margen de reanudación de la escena. */
export const AMANECER = { desde: 0.625, hasta: 0.7375 } as const

/** El ancla declarada del diferencial, espejada de `anclaje.ts` (`TRAMOS_ANCLADOS`). `s20-arco` afirma la igualdad. */
export const ANCLA_DEL_DIFERENCIAL = 0.8525

function parada(at: number, level: number, kelvin: number, azimuthDeg: number, ease?: LightStop['ease']): LightStop {
  const base = { at, level, kelvin, azimuthDeg, elevationDeg: Math.round(elevacionDe(level) * 1e4) / 1e4 }
  return ease === undefined ? base : { ...base, ease }
}

export const LIGHT_ARC: readonly LightStop[] = [
  // Mediodía. La elevación es la que S6 calibró para la key: el arco arranca ahí.
  parada(0, 1, 6500, -42),
  // S9 · el sol se queda quieto en la primera pantalla. Sin este stop el barrido
  // arranca en p=0 y el sol se corre hacia el lado de la cámara: γ se caía a 17°,
  // o sea luz plana en la primera pantalla del sitio. V3-B re-midió la razón:
  // γ en la ventana del hero da 40,8–95,2° con él y 34,3–63,7° sin él.
  parada(0.125, 1, 6500, -42, 'linear'),
  // La meseta de luz llega hasta que Trabajos toca el pie del cuadro (pantalla
  // 7). El azimut sigue la recta de S9: −42 → 115 entre 0,125 y 0,5.
  parada(ATARDECER.desde, 1, 6500, 101.9167, 'linear'),
  // Atardece en una pantalla de scroll: Trabajos trae la noche, y la gota
  // termina de cubrir el cuadro exactamente acá.
  parada(ATARDECER.hasta, NIVEL_DE_LA_NOCHE, 6500, 115, 'linear'),
  // La noche, sostenida durante el PIN entero (pantallas 8 → 10). Azimut y
  // kelvin de S9 interpolados en el `at` nuevo: la recta de azimut no cambia.
  parada(NOCHE.hasta, NIVEL_DE_LA_NOCHE, 6616.6667, 120.6667, 'linear'),
  // ⚠️ B12 · LA VUELTA: el sol asoma en la pantalla en que Trabajos se va y
  // Servicios llega. Sube hasta la frontera declarada de la noche (0,34).
  parada(VUELTA.hasta, NIVEL_DE_LA_VUELTA, 6675, 123.5, 'linear'),
  // Amanece escondido: la escena no dibuja entre 0,625 y 0,7375 (visibilidad).
  parada(AMANECER.hasta, 0.5, 6832.5, 131.15, 'shift'),
  // El diferencial entra con el sol subiendo y llega a su ancla con la luz de S9.
  parada(ANCLA_DEL_DIFERENCIAL, NIVEL_DE_LA_MANANA, 7219, 135.28, 'linear'),
  // El Cierre, a la misma luz: la sala se ve detrás del pie y no vuelve a bajar.
  parada(1, NIVEL_DE_LA_MANANA, 7700, 138, 'linear'),
]
