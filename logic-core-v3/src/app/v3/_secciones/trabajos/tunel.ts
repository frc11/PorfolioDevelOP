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
 * ⚠️ **EL CARTEL YA NO CRECE: LLEGA CON EL GESTO DE LA CASA.**
 *
 * Nacía en un punto interior de su caja y crecía desde ahí —una escala de 0,04 a
 * 1—. Eso se cayó: el sitio tiene un gesto propio para que un titular entre, y es
 * **P1, el revelado línea por línea** —142 instancias, el 58 % del corpus de la
 * referencia, y su propio archivo dice que si se reproduce un solo efecto es ése—.
 * El texto se parte en líneas, cada una arranca desplazada una altura de sí misma
 * y sube hasta su lugar, tapada por su propia caja: **la línea base desde la que
 * salen las palabras es el borde de esa caja**.
 *
 * Reusarlo en vez de escribir otro es la regla del sprint, y de paso borra código:
 * la rampa de escala y su constante de nacimiento se fueron con él.
 *
 * Lo que le queda a este módulo del cartel es la SALIDA, que P1 no cubre.
 */

/**
 * ⚠️ **LA SALIDA DEL CARTEL VA HACIA ADELANTE, hacia el espectador.**
 *
 * Iba hacia atrás —`translateZ` negativo, achicándose— y ahora va al revés: se
 * agranda y pasa de largo. La distancia no es un número suelto: es **la mitad del
 * foco de la cámara de la escena**, que a 900 de alto vale 1.427 px. Con la mitad,
 * el cartel llega a `1427 / (1427 − 713) = 2,0` veces su tamaño justo cuando
 * termina de desvanecerse. Pasarse de ese foco lo mandaría a infinito.
 *
 * ⚠️ Es el ÚNICO gesto en z del tramo. Las capturas y el CTA ya no huyen: se
 * levantan y salen por arriba, que es otra cosa y vive en `CapaDelTunel`.
 */
export const FOCO_DE_LA_ESCENA_PX = 1427
export const DISTANCIA_DEL_VUELO = FOCO_DE_LA_ESCENA_PX / 2

/** La curva de la salida: `power1.in`, t al cuadrado. Es la de P7, escrita acá. */
export const CURVA_DEL_VUELO = (t: number): number => t * t

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
 *   · hasta `huirDesde` — QUIETO. Llega con P1 adentro y después se lee.
 *   · de ahí en adelante — VUELA HACIA ADELANTE: z positivo y opacidad a la vez.
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
  // Mientras LLEGA y mientras se lee, la caja está quieta y entera: lo que se
  // mueve adentro es P1, renglón por renglón, y eso no lo dibuja esta función.
  if (huirDesde === null || u < huirDesde) {
    return { escala: 1, z: 0, opacidad: 1 }
  }
  const t = CURVA_DEL_VUELO(Math.min(1, (u - huirDesde) / (1 - huirDesde)))
  if (t >= 1) return null
  return { escala: 1, z: DISTANCIA_DEL_VUELO * t, opacidad: 1 - t }
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
 * ⚠️ **EL RITMO — la única constante de velocidad, y sale de la referencia.**
 *
 * Cuánto MULTIPLICA su tamaño una captura cada 100 px de scroll. Medido sobre
 * heatbureau.com, en la banda donde vive la imagen que uno mira —entre el 40 % y
 * el 120 % del cuadro—: ×1,33 · ×1,33 · ×1,50 · ×1,54 en la primera mitad de esa
 * banda y ×1,02 · ×1,02 · ×1,18 · ×1,26 en la segunda. La mediana del conjunto
 * es **×1,25**, y es lo que se declara.
 *
 * ⚠️ **Que sea un factor y no una cantidad de píxeles ES el arreglo.** Antes el
 * ancho crecía en RECTA, que es como la referencia lo hace; el problema es que
 * una recta en píxeles es un ritmo RELATIVO que se desploma: la primera captura
 * iba de 189 a 472 px —×2,5— y más tarde de 1.323 a 2.362 —×1,8— sobre un tramo
 * de scroll casi cuatro veces más largo. Con un factor constante, tramos iguales
 * de scroll multiplican el tamaño por lo mismo **en cualquier punto del tramo**,
 * que es lo que el ojo llama «ritmo parejo».
 *
 * ⚠️ **La referencia NO se copia acá, y hay que decirlo.** Sus imágenes también
 * aceleran y frenan —más que las nuestras: ×3 a ×16 cada 100 px cuando son
 * chiquitas contra ×1,02 cuando llenan el cuadro—. Lo que la salva es que
 * conviven SEIS, así que la que uno mira está siempre en su fase lenta. Con tres
 * capturas ese truco no está disponible, y por eso acá el ritmo se declara en vez
 * de emerger.
 */
export const RITMO_POR_CIEN_PX = 1.25

/** El avance se mide en e-plegados: `ancho = nacer × e^(avance − nacimiento)`. */
export const AVANCE_POR_PX = Math.log(RITMO_POR_CIEN_PX) / 100

/**
 * ⚠️ **A QUÉ TAMAÑO NACE UNA CAPTURA, en anchos de cuadro.**
 *
 * La referencia no contesta esta pregunta: **sus imágenes nacen en 0 px con
 * opacidad 1** —medido: no entran con fundido ni aparecen grandes—. Nacen de la
 * nada y crecen en recta, que es justamente lo que acá se descartó.
 *
 * Con crecimiento exponencial el cero no existe, así que el tamaño de nacimiento
 * es una decisión, y es la que fija cuánto scroll pide el túnel.
 *
 * ⚠️ **Era 0,44 y bajó a 0,10, que son 144 px sobre un cuadro de 1.440.** A 0,44
 * la primera captura aparecía ya grande y el tramo se leía como tres saltos; a
 * 0,10 se la ve venir de lejos y tarda **1.032 px de scroll** en llenar el cuadro.
 * El precio está declarado y pagado: el túnel pasó de pedir 1.009 px a pedir
 * **3.001**, y la sección creció de tres pantallas a seis para dárselos.
 */
export const ANCHO_AL_NACER = 0.1

/**
 * ⚠️ **EL RELEVO — la siguiente nace cuando la anterior CASI llena el cuadro.**
 *
 * Era 0,32 y la segunda aparecía con la primera a un tercio de la pantalla. Ahora
 * la primera tiene que estar llegando al límite: 0,90 del ancho del cuadro. El
 * tramo deja de ser una pila profunda y pasa a ser tres zooms encadenados, que es
 * lo que se pidió.
 */
export const ANCHO_DEL_RELEVO = 0.9

/**
 * «Llega al límite de la pantalla»: su ancho iguala al del cuadro. Es el fin del
 * túnel y no un tamaño elegido.
 */
export const ANCHO_DEL_LIMITE = 1

/**
 * ⚠️ **EL TOPE — medido en la referencia, y acá hace falta de verdad.**
 *
 * Sus imágenes topaban entre 1,17 y 1,68 anchos de cuadro y se quedaban ahí. Con
 * crecimiento exponencial el tope deja de ser decorativo: sin él, la primera
 * terminaría en 4,18 anchos de cuadro —6.020 px de un archivo de 1.920— y lo que
 * se ve es una textura estirada, no una captura. El valor es el TECHO de la banda
 * medida, así que el desborde de la primera cae adentro de ella por construcción.
 */
export const ANCHO_MAXIMO = 1.68

/** El paso entre nacimientos, en e-plegados. DERIVADO del relevo y del nacimiento. */
export const PASO_DEL_RELEVO = Math.log(ANCHO_DEL_RELEVO / ANCHO_AL_NACER)

/**
 * ⚠️ **LA ENTRADA DEL NACIMIENTO — lo único que el exponencial obliga a inventar.**
 *
 * Una captura no puede aparecer de golpe ocupando el 44 % del cuadro. La referencia
 * no tiene este problema porque nace en cero. Acá entra con un fundido corto, y su
 * largo no es una constante nueva: es **un cuarto del paso del relevo**, o sea una
 * fracción de algo que ya estaba declarado.
 */
export const ENTRADA_DEL_NACIMIENTO = PASO_DEL_RELEVO / 4

/** El avance al que nace la captura `indice`. La primera nace en cero. */
export function avanceDelNacimiento(indice: number): number {
  if (!Number.isInteger(indice) || indice < 0) throw new Error(`índice inválido: ${indice}`)
  return indice * PASO_DEL_RELEVO
}

/**
 * El avance con el que el túnel queda cumplido: la ÚLTIMA captura llega al límite
 * de la pantalla. Deriva del paso y del tamaño de nacimiento.
 */
export function avanceQueCompletaElTunel(cuantas: number): number {
  if (!Number.isInteger(cuantas) || cuantas < 1) throw new Error(`cuántas inválido: ${cuantas}`)
  return avanceDelNacimiento(cuantas - 1) + Math.log(ANCHO_DEL_LIMITE / ANCHO_AL_NACER)
}

/** Cuántos píxeles de scroll pide el túnel entero, al ritmo declarado. */
export function pxQuePideElTunel(cuantas: number): number {
  return avanceQueCompletaElTunel(cuantas) / AVANCE_POR_PX
}

/**
 * EL ANCHO DE UNA CAPTURA EN ANCHOS DE CUADRO, o `null` si todavía no nació.
 *
 * `nacer × e^(avance − nacimiento)`, con tope. El ritmo relativo es el mismo en
 * cualquier punto de la curva, que es la propiedad entera de este bloque.
 */
export function anchoDeLaCaptura(indice: number, avance: number): number | null {
  const propio = avance - avanceDelNacimiento(indice)
  if (propio < 0) return null
  return Math.min(ANCHO_AL_NACER * Math.exp(propio), ANCHO_MAXIMO)
}

/** Cuánto se ve una captura recién nacida: entra en un cuarto de paso y se queda. */
export function opacidadDeLaCaptura(indice: number, avance: number): number {
  const propio = avance - avanceDelNacimiento(indice)
  if (propio < 0) return 0
  return Math.min(1, propio / ENTRADA_DEL_NACIMIENTO)
}

/**
 * ⚠️ **CUÁNTO LLEGA A MEDIR LA PRIMERA.** Con tres capturas el modelo la llevaría
 * a `0,44 × e^2,25 = 4,17` anchos de cuadro, así que **el tope de 1,70 sí muerde**:
 * termina ahí, adentro de los 1,17–1,68 que la referencia medía, y deja de crecer
 * mucho antes de que el túnel termine.
 */
export function anchoFinalDeLaPrimera(cuantas: number): number {
  return Math.min(ANCHO_AL_NACER * Math.exp(avanceQueCompletaElTunel(cuantas)), ANCHO_MAXIMO)
}

/**
 * ⚠️ **LA BANDA EN LA QUE EL RÓTULO SE LEE — las dos constantes del tramo, otra vez.**
 *
 * El nombre y el rubro viajan con su captura y se ven mientras la captura está
 * entre su tamaño de nacimiento y el del relevo: desde que aparece hasta que la
 * siguiente la releva. No hay una tercera constante que calibrar.
 */
export const BANDA_DEL_ROTULO = { desde: ANCHO_AL_NACER, hasta: ANCHO_DEL_RELEVO } as const

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

/** La inversa: en qué progreso de la sección el túnel lleva ese avance. */
export function progresoDelAvance(
  avance: number,
  ventana: { readonly desde: number; readonly hasta: number },
  cuantas: number,
): number {
  const total = avanceQueCompletaElTunel(cuantas)
  return ventana.desde + acotar01(avance / total) * (ventana.hasta - ventana.desde)
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

// ===========================================================================
// 3 - EL CTA: la ventana de navegador, su tipeo y el freno
// ===========================================================================

/**
 * ⚠️ **HASTA DÓNDE CRECE LA VENTANA DEL CTA. No cubre la pantalla.**
 *
 * Llega al 62 % del ancho del cuadro y ahí se queda. No es un número suelto: es
 * el ancho al que una ventana de navegador se lee COMO una ventana —con aire
 * alrededor, apoyada sobre la sala— en vez de como una pantalla nueva. Sobre
 * 1.440 son 893 px, y con la relación de abajo, 558 px de alto.
 */
export const ANCHO_DEL_CTA = 0.62

/** La relación de la ventana. 16:10, que es la de un portátil y no la de un cine. */
export const RELACION_DEL_CTA = { ancho: 16, alto: 10 } as const

/**
 * ⚠️ **EL TIPEO CUELGA DEL CRECIMIENTO Y NO DE UN RELOJ PROPIO.**
 *
 * Cuántas letras se ven es una función del avance de la ventana y de nada más.
 * Un reloj propio tendría que mantenerse de acuerdo con el crecimiento, y dos
 * relojes que tienen que coincidir es la forma de que un día no coincidan.
 *
 * ⚠️ **La frase termina ANTES que el crecimiento, y por eso hay una fracción.**
 * Terminaba justo en el final —`u = 1`— y el resultado medido fue que con la
 * ventana ya grande todavía se leía «¿El próximo proyecto so». Un cartel que
 * termina de escribirse en el último píxel no se alcanza a leer nunca: para
 * cuando está completo, ya hay que seguir. Con 0,72 la frase está entera con la
 * ventana en tres cuartos, y el último cuarto del crecimiento es tiempo de
 * lectura. No es un reloj nuevo: es la misma cuenta, dividida.
 */
export const FRACCION_DEL_TIPEO = 0.72

export function letrasEscritas(u: number, total: number): number {
  return Math.round(acotar01(u / FRACCION_DEL_TIPEO) * total)
}

/**
 * ⚠️ **EL FRENO — cuánto se queda la frase antes de que el tramo siga.**
 *
 * Se pidió como una DURACIÓN y va como una duración: son milisegundos, no
 * píxeles. Lo que frena es el AVANCE del tramo, no el scroll de la página —el
 * repo tiene dos invariantes que prohíben tocar el scroll, y la doctrina escrita
 * es que el gesto del visitante siempre gana—. Mientras dura, la página scrollea
 * normal y la frase se queda quieta para que se alcance a leer; después el avance
 * retoma y la persecución de tres segundos se encarga de que el reencuentro no
 * sea un salto. **Nadie queda atrapado: lo que se detiene es el gesto.**
 */
export const DURACION_DEL_FRENO_MS = 900

/**
 * ⚠️ **CUÁNTO SE ATENÚA EL FONDO, y por qué es un velo y no un desenfoque.**
 *
 * Se eligió OSCURECER. Desenfocar querría decir `backdrop-filter` sobre un canvas
 * 3D vivo, que es exactamente la familia de la que este repo ya se quemó: la
 * lección del `EffectComposer` dice que un filtro sobre el canvas se paga en
 * runtime de maneras que no se ven en estático. Un velo de color es una capa
 * pintada y no vuelve a leer el cuadro de atrás.
 *
 * El 0,55 es lo que hace falta para que la ventana de navegador —papel claro—
 * gane el primer plano sin apagar la sala del todo: por debajo la sala compite,
 * por encima el tramo se lee como un corte a negro.
 */
export const VELO_DEL_CTA = 0.55

/**
 * ⚠️ **CUÁNTO SUBE LA CAPA PARA SALIR DEL CUADRO, en alturas de ventana.**
 *
 * No alcanza con una: la primera captura llega a 1,68 anchos de cuadro y, sobre
 * un 16:9, eso son 1.361 px de alto centrados en una ventana de 900 — o sea que
 * asoma 230 px por arriba. Con 1,3 alturas el borde de abajo de lo más alto queda
 * por encima del tope del cuadro, con margen. Medido sobre el ancho máximo y la
 * relación de las capturas, no elegido.
 */
export const ALTURAS_DE_LA_LEVANTADA = 1.3

