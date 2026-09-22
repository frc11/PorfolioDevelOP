/**
 * EL VOCABULARIO DEL TRAMO — **el cartel huye y el túnel se acerca.**
 * **[PORTFOLIO]**
 *
 * Dos mecánicas y ninguna tercera. La primera gobierna al CARTEL de Portfolio y
 * cuelga del progreso del scroll, como todo el resto del sitio. La segunda
 * gobierna al TÚNEL de capturas y **es la excepción declarada a esa doctrina**:
 * no cuelga de la POSICIÓN del scroll sino de su HISTORIA.
 *
 * ── ⚠️ LO QUE ESTE ARCHIVO DEJÓ DE SER ───────────────────────────────────
 *
 * Tenía una zona central con cuatro ranuras, una tabla de disposiciones y un
 * nacimiento desde un punto interior de cada celda. Eso se cayó entero: el
 * modelo pasa a ser un zoom inmersivo —una sola captura por proyecto, centrada,
 * creciendo hasta salirse del cuadro mientras la siguiente nace adentro—. Con él
 * se fueron los detectores de choque y los puntos interiores de las ranuras, que
 * no tenían otro consumidor.
 *
 * ── 1 · NACER Y CRECER, Y HUIR — lo que le queda al CARTEL ───────────────
 *
 * El cartel nace en un punto interior de su caja y crece hacia afuera sin moverse
 * de lugar: el `transform` lleva sólo escala y el lugar lo pone el
 * posicionamiento. Después HUYE — se aleja en z y se desvanece a la vez.
 *
 * Los dos números de la huida no se inventan: son los de la SALIDA de P7
 * (`patrones-piezas.ts`). Se escriben acá en vez de importarse porque a este
 * módulo lo alcanza la rama QUIETA, y `s7-contrato` prohíbe que el árbol quieto
 * importe un valor del sistema de motion.
 *
 * ── 2 · EL TÚNEL — medido sobre la referencia, no elegido ────────────────
 *
 * La mecánica y sus números salen de medir heatbureau.com con el banco de
 * `scripts-b4/`, a 1440 × 900, rastreando cuadro por cuadro la caja en pantalla
 * de cada imagen. Cada constante de abajo trae su medición. Los dos titulares:
 *
 *   · **no hay perspectiva.** `perspective: none` y `transform-style: flat` en
 *     las siete capas de la referencia. Es escala 2D y nada más.
 *   · **cada imagen crece en RECTA, no en exponencial.** Ajustando el ancho en
 *     pantalla contra el scroll, sólo en el tramo en que la imagen crece de
 *     verdad, la recta gana en las seis: R² 0,96–0,995 contra 0,77–0,84 del
 *     ajuste logarítmico. Lo que se lee como exponencial es el RELEVO —nace una
 *     cada tanto y las viejas siguen creciendo por fuera del cuadro—.
 */

import type { CSSProperties } from 'react'

/** Un lugar del cuadro en fracciones: `x` del ancho, `y` del alto. */
export interface PuntoDelCuadro {
  readonly x: number
  readonly y: number
}

/** Una caja del cuadro, en las mismas fracciones. */
export interface Caja {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
}

/** Acota a [0,1]. Local para no importar `_lib` desde el núcleo de la sección. */
function acotar01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

// ===========================================================================
// 1 · EL CARTEL — nacer, crecer y huir sobre el progreso del scroll
// ===========================================================================

/**
 * LA ESCALA CON LA QUE NACE EL CARTEL. Un 4 % de su tamaño final: sobre su caja
 * son unos 25 px de ancho a 1440, o sea un punto.
 */
export const ESCALA_DE_NACIMIENTO = 0.04

/**
 * ⚠️ **LA DISTANCIA Y LA CURVA DE LA HUIDA — son las de la SALIDA de P7.**
 *
 * `translateZ: 0 → −1000` con la curva `entrada` (`power1.in`, t al cuadrado) y
 * `autoAlpha` de 1 a 0 en el mismo tramo. Escritas y no importadas: ver arriba.
 */
export const DISTANCIA_DE_LA_HUIDA = 1000
export const CURVA_DE_LA_HUIDA = (t: number): number => t * t

/**
 * La rampa de crecimiento del cartel: exponencial de `ESCALA_DE_NACIMIENTO` a 1.
 *
 * Exponencial y no recta porque **crecer es una propiedad de RAZÓN**: con una
 * recta el elemento se despega del punto al primer píxel de scroll y después se
 * arrastra; con una potencia el ritmo relativo es constante y se lee como un zoom.
 */
export function escalaDelCrecimiento(u: number): number {
  return ESCALA_DE_NACIMIENTO ** (1 - acotar01(u))
}

/** Cuándo termina de crecer y desde cuándo huye, en fracción de su ventana. */
export interface TiemposDelGesto {
  readonly crecerHasta: number
  readonly huirDesde: number | null
}

export interface PoseDelElemento {
  readonly escala: number
  /** Alejamiento en z, en píxeles. Cero mientras no huye. */
  readonly z: number
  readonly opacidad: number
}

/**
 * LA POSE DEL CARTEL EN SU VENTANA, o `null` si no nació o ya terminó de huir.
 * Cuatro tramos y ninguno se superpone:
 *
 *   · `u ≤ 0` — no existe. ⚠️ El corte es ESTRICTO: fuera de su ventana el
 *     progreso SATURA en 0, así que con `< 0` el elemento quedaría pintado en su
 *     escala de nacimiento durante todo lo que viene antes.
 *   · hasta `crecerHasta` — CRECE hacia afuera desde su punto interior.
 *   · hasta `huirDesde` — MESETA. Quieto y entero: es el tramo en que se lee.
 *   · de ahí en adelante — HUYE: z y opacidad a la vez, la escala clavada en 1.
 */
export function poseDelGesto(u: number, tiempos: TiemposDelGesto): PoseDelElemento | null {
  const { crecerHasta, huirDesde } = tiempos
  if (!(crecerHasta > 0 && crecerHasta <= 1)) {
    throw new Error(`crecerHasta inválido: ${crecerHasta}`)
  }
  if (huirDesde !== null && !(huirDesde >= crecerHasta && huirDesde < 1)) {
    throw new Error(`huirDesde inválido: ${huirDesde} contra crecerHasta ${crecerHasta}`)
  }
  if (u <= 0) return null
  if (u < crecerHasta) {
    return { escala: escalaDelCrecimiento(u / crecerHasta), z: 0, opacidad: 1 }
  }
  if (huirDesde === null || u < huirDesde) {
    return { escala: 1, z: 0, opacidad: 1 }
  }
  const t = CURVA_DE_LA_HUIDA(Math.min(1, (u - huirDesde) / (1 - huirDesde)))
  if (t >= 1) return null
  return { escala: 1, z: -DISTANCIA_DE_LA_HUIDA * t, opacidad: 1 - t }
}

/** El estilo del LUGAR del cartel: su caja final y su punto interior. */
export function lugarDeLaCaja(caja: Caja, origen: PuntoDelCuadro): Record<string, string> {
  const pc = (v: number): string => `${(v * 100).toFixed(4)}%`
  return {
    left: pc(caja.x0),
    top: pc(caja.y0),
    width: pc(caja.x1 - caja.x0),
    height: pc(caja.y1 - caja.y0),
    'transform-origin': `${(origen.x * 100).toFixed(2)}% ${(origen.y * 100).toFixed(2)}%`,
  }
}

/**
 * ⚠️ **EL MISMO LUGAR PARA EL PRIMER RENDER — y no es el mismo objeto.**
 *
 * `lugarDeLaCaja` habla en nombres de propiedad CSS —con guion— porque es lo que
 * `style.setProperty` consume por cuadro. El objeto `style` de React quiere el
 * nombre en camello: con el guion **rechaza la clave** y avisa por consola
 * diciendo cuál esperaba. El render de servidor, en cambio, la emite igual
 * —comprobado sobre el marcado—, así que el papel y el cliente dejan de decir lo
 * mismo, que es la peor forma que puede tomar.
 *
 * Y acá no es cosmético: sin su punto interior en el primer render el cartel nace
 * desde el centro de su caja —el valor por omisión— en vez de desde el punto
 * declarado. Un primer cuadro que no es el que se escribió.
 */
export function estiloDelLugar(caja: Caja, origen: PuntoDelCuadro): CSSProperties {
  const camello: Record<string, string> = {}
  for (const [prop, valor] of Object.entries(lugarDeLaCaja(caja, origen))) {
    camello[prop.replace(/-([a-z])/g, (_, letra: string) => letra.toUpperCase())] = valor
  }
  return camello as CSSProperties
}

export function transformDeLaPose(pose: PoseDelElemento): string {
  return `translateZ(${pose.z.toFixed(1)}px) scale(${pose.escala.toFixed(4)})`
}

// ===========================================================================
// 2 · EL TÚNEL — el avance, y cuánto mide cada captura en pantalla
// ===========================================================================

/**
 * ⚠️ **EL AVANCE SE MIDE EN ANCHOS DE CUADRO, Y LA UNIDAD ES LA MEDICIÓN.**
 *
 * Una captura nace con ancho cero y crece en recta. Si el avance se cuenta en
 * anchos de cuadro, entonces **el ancho de una captura es, literalmente, el
 * avance que lleva desde que nació**: `ancho = avance − avanceDeSuNacimiento`.
 * No hay una constante de velocidad escondida —la elección de la unidad la hizo
 * desaparecer—, y todo lo demás de este bloque son distancias en esa misma regla.
 *
 * El avance crece mientras se baja y decrece al subir. No es el progreso de la
 * sección: lo PERSIGUE, con retraso. Ver `perseguir`.
 */

/**
 * ⚠️ **EL RELEVO — cuánto separa el nacimiento de una captura del de la
 * siguiente. MEDIDO.**
 *
 * En la referencia, al nacer una captura la anterior medía **29 %, 36 % y 29 %**
 * del ancho del cuadro en los tres relevos limpios del tramo grabado (los otros
 * dos caen en los bordes de la ventana y no cuentan). En anchos de cuadro, «la
 * anterior mide 0,32» y «el paso entre nacimientos es 0,32» son **el mismo
 * número**, porque el ancho ES el avance desde el nacimiento.
 *
 * Corrobora aparte: la referencia hacía nacer una cada ~300 px de scroll, y una
 * captura llenaba el cuadro en 870–1000 px. O sea 0,30–0,34 de su propia vida.
 */
export const ANCHO_DEL_RELEVO = 0.32

/**
 * «Llega al límite de la pantalla»: su ancho iguala al del cuadro. Es el fin del
 * túnel —lo que el paso 6 de la secuencia pide— y no un tamaño elegido.
 */
export const ANCHO_DEL_LIMITE = 1

/**
 * Debajo de esto una captura no se dibuja. A 1440 son 5,8 px: la referencia las
 * hacía aparecer entre 1 y 3 px, así que esto es un punto que ya se ve y no un
 * píxel suelto peleando con el redondeo del navegador.
 */
export const ANCHO_AL_APARECER = 0.004

/** El avance al que nace la captura `indice`. La primera nace en cero. */
export function avanceDelNacimiento(indice: number): number {
  if (!Number.isInteger(indice) || indice < 0) throw new Error(`índice inválido: ${indice}`)
  return indice * ANCHO_DEL_RELEVO
}

/**
 * El avance con el que el túnel queda cumplido: la ÚLTIMA captura llega al límite
 * de la pantalla. Deriva de las otras dos constantes y de cuántas hay.
 */
export function avanceQueCompletaElTunel(cuantas: number): number {
  if (!Number.isInteger(cuantas) || cuantas < 1) throw new Error(`cuántas inválido: ${cuantas}`)
  return avanceDelNacimiento(cuantas - 1) + ANCHO_DEL_LIMITE
}

/**
 * EL ANCHO DE UNA CAPTURA EN ANCHOS DE CUADRO, o `null` si todavía no se dibuja.
 *
 * ⚠️ No lleva tope, y no hace falta: el avance tampoco pasa del que completa el
 * túnel, así que la primera termina exactamente ahí. Cuánto vale ese máximo y por
 * qué cae donde la referencia lo tenía, en `anchoFinalDeLaPrimera`.
 */
export function anchoDeLaCaptura(indice: number, avance: number): number | null {
  const ancho = avance - avanceDelNacimiento(indice)
  return ancho < ANCHO_AL_APARECER ? null : ancho
}

/**
 * ⚠️ **CUÁNTO LLEGA A MEDIR LA PRIMERA, y por qué no es un número elegido.**
 *
 * Es lo que el modelo deja: con tres capturas, `2 × 0,32 + 1 = 1,64` anchos de
 * cuadro. La referencia medía entre **1,17 y 1,68** anchos de cuadro en las cinco
 * imágenes que llegaron a su tope. O sea que el desborde de la primera **cae
 * adentro de la banda medida sin que nadie lo haya puesto ahí**: sale de cuántas
 * capturas hay y de la separación entre ellas, y de nada más.
 */
export function anchoFinalDeLaPrimera(cuantas: number): number {
  return avanceQueCompletaElTunel(cuantas)
}

/**
 * ⚠️ **LA BANDA EN LA QUE EL RÓTULO SE LEE — las dos constantes de arriba otra vez.**
 *
 * El nombre y el rubro viajan con su captura y se ven exactamente mientras la
 * captura está entre el tamaño del relevo y el límite de la pantalla: antes es un
 * punto donde no entra un texto, y después el rótulo ya salió del cuadro con la
 * esquina a la que está pegado. No hay una tercera constante que calibrar.
 */
export const BANDA_DEL_ROTULO = { desde: ANCHO_DEL_RELEVO, hasta: ANCHO_DEL_LIMITE } as const

/** Cuánto se ve el rótulo de una captura de ese ancho. Entra y sale en rampa. */
export function opacidadDelRotulo(ancho: number): number {
  const { desde, hasta } = BANDA_DEL_ROTULO
  const rampa = (hasta - desde) / 4
  return Math.min(acotar01((ancho - desde) / rampa), acotar01((hasta - ancho) / rampa))
}

// ── La persecución: por qué sigue creciendo cuando soltás ──────────────────

/**
 * ⚠️ **CUÁNTO TARDA EN FRENAR DEL TODO DESPUÉS DE SOLTAR. Medido, y pedido.**
 *
 * El humano midió «~3 s» en la referencia y la medición lo confirma, pero no por
 * donde parece. Con un solo golpe de rueda de 120 px desde un estado quieto:
 * **el scroll de la referencia frena a los 764 ms** —eso es su scroll suave— y
 * **la imagen sigue creciendo hasta los 2.658 ms**, quedando 46 % más grande de
 * lo que era al soltar. Hay DOS amortiguaciones encadenadas y la segunda, la del
 * zoom, es la que se siente: su constante de tiempo medida es 454 ms
 * —decaimiento geométrico de razón 0,746 cada 133 ms, constante hasta el cuarto
 * decimal sobre nueve muestras—.
 *
 * Acá va UNA sola amortiguación con el tiempo que el humano pidió. Contra la
 * referencia, en los tres hitos del camino que queda por recorrer:
 *
 *     hito      referencia       esto
 *     50 %          525 ms     451 ms
 *     90 %        1.271 ms   1.499 ms
 *     99 %        2.231 ms   3.000 ms
 */
export const ASENTAMIENTO_DEL_TUNEL_MS = 3000

/** Qué queda sin recorrer cuando decimos «ya frenó». El 1 % del camino. */
export const RESTO_AL_ASENTARSE = 0.01

/** La constante de tiempo, DERIVADA del asentamiento: 651 ms. */
export const TAU_DEL_TUNEL_MS = ASENTAMIENTO_DEL_TUNEL_MS / Math.log(1 / RESTO_AL_ASENTARSE)

/**
 * ⚠️ **Un salto de cuadro no puede volverse un salto de imagen.** Si la pestaña
 * estuvo oculta o el hilo se trabó, `dt` llega enorme y la persecución se comería
 * el retraso entero en un cuadro. Se acota a dos cuadros largos.
 */
export const DT_MAXIMO_MS = 100

/**
 * LA PERSECUCIÓN: el avance real corre atrás del objetivo y nunca lo alcanza de
 * golpe. **Ésta es la excepción a «todo cuelga del progreso»**: el objetivo sí
 * cuelga del scroll, pero lo que se dibuja depende además de cuánto tiempo pasó.
 *
 * `1 − e^(−dt/τ)` y no un factor fijo por cuadro: así el resultado no cambia con
 * los cuadros por segundo. Con un factor fijo, la misma constante frenaría en 3 s
 * a 60 fps y en 1,5 s a 120 fps, y el gesto sería otro según el monitor.
 */
export function perseguir(actual: number, objetivo: number, dtMs: number): number {
  const dt = Math.min(Math.max(dtMs, 0), DT_MAXIMO_MS)
  return actual + (objetivo - actual) * (1 - Math.exp(-dt / TAU_DEL_TUNEL_MS))
}

/**
 * EL OBJETIVO DEL AVANCE PARA UN PROGRESO DE SECCIÓN DADO.
 *
 * Es lo ÚNICO del túnel que cuelga del scroll, y es una recta: empieza cuando el
 * cartel arranca a huir y termina donde empieza el tramo de demos. Las dos puntas
 * se derivan en `geometria.ts` y no se eligen acá.
 */
export function avanceObjetivo(
  progreso: number,
  ventana: { readonly desde: number; readonly hasta: number },
  cuantas: number,
): number {
  const largo = ventana.hasta - ventana.desde
  if (!(largo > 0)) throw new Error(`ventana del túnel inválida: ${ventana.desde} → ${ventana.hasta}`)
  return avanceQueCompletaElTunel(cuantas) * acotar01((progreso - ventana.desde) / largo)
}

/**
 * El `transform` de una captura: **centrada en el cuadro** y escalada a su ancho.
 *
 * El centrado va en el `transform` y no en el posicionamiento porque los
 * porcentajes de `translate` se miden sobre la caja SIN escalar: el centro de la
 * captura cae en el centro del cuadro valga su escala lo que valga. Todo crece
 * desde el medio, que es lo que hace que uno se meta adentro y no mire de costado.
 */
export function transformDeLaCaptura(ancho: number): string {
  return `translate(-50%, -50%) scale(${ancho.toFixed(5)})`
}

/**
 * El `transform` del rótulo, que **deshace** la escala de su captura para que el
 * texto mida siempre lo mismo en pantalla mientras viaja pegado a su esquina.
 */
export function transformDelRotulo(ancho: number): string {
  return `scale(${(1 / ancho).toFixed(5)})`
}
