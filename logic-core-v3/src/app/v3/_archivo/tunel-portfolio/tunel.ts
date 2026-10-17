/**
 * EL VOCABULARIO DEL TRAMO — **el cartel huye y el túnel se acerca.**
 * **[PORTFOLIO]**
 *
 * Dos mecánicas y ninguna tercera. La primera gobierna al CARTEL de Portfolio;
 * la segunda gobierna al TÚNEL de capturas y **es la excepción declarada a la
 * doctrina del sitio**: no cuelga de la POSICIÓN del scroll sino de su HISTORIA.
 * El cartel entró en la excepción con el túnel: su huida lee lo que el túnel
 * MUESTRA, con histéresis, para no volver encima de él subiendo.
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
 * ── 2 · EL TÚNEL — la tabla medida sobre la referencia, anidada ─────────
 *
 * Es la tabla de heatbureau.com tal cual —cinco de sus siete capas, cada una una
 * recta con clamp— y el resorte de su bundle. Nada se deriva: ver la sección 2.
 */

import type { CSSProperties } from 'react'

import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'

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
// 1 · EL CARTEL — huir sobre lo que el túnel muestra
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

/** Desde cuándo huye el cartel, en fracción de su ventana. */
export interface TiemposDelGesto {
  readonly huirDesde: number | null
}

export interface PoseDelElemento {
  readonly escala: number
  /** Alejamiento en z, en píxeles. Cero mientras no huye. */
  readonly z: number
  readonly opacidad: number
}

/**
 * LA POSE DEL CARTEL: su huida, o `null` si ya terminó de huir. Antes de huir la
 * caja está quieta y entera —lo que llega es su contenido, con el rango de su
 * propio call site—, y de ahí en adelante VUELA HACIA ADELANTE: z positivo y
 * opacidad a la vez. Cuánto huyó lo decide `huidaConHisteresis`.
 */
/** La pose de la huida para una fracción lineal de ella: 0 entero, 1 ya se fue. */
export function poseDeLaHuida(fraccion: number): PoseDelElemento | null {
  const t = CURVA_DEL_VUELO(Math.min(1, Math.max(0, fraccion)))
  if (t >= 1) return null
  return { escala: 1, z: DISTANCIA_DEL_VUELO * t, opacidad: 1 - t }
}

/**
 * ⚠️ **LA HUIDA CON HISTÉRESIS — subiendo, Portfolio no vuelve encima del túnel.**
 *
 * Bajando, el cartel huye en su ventana de siempre, mientras la primera captura
 * nace: es el relevo, y (c) sale de acá. Subiendo, si la huida se desanduviera
 * en esa MISMA ventana, el cartel volvería con El Garage todavía grande. Así que
 * subiendo vuelve en la ventana de ANTES —misma duración, terminada donde arranca
 * el túnel, con las capas ya en 0—, y entre las dos el cartel se queda como
 * estaba: una banda, no un interruptor, así que dar vuelta el gesto a mitad de
 * camino no salta. Recibe el progreso MOSTRADO del túnel, no el scroll.
 */
export function huidaConHisteresis(
  anterior: number,
  mostrado: number,
  ventanas: { readonly bajando: { readonly desde: number; readonly hasta: number }; readonly subiendo: { readonly desde: number; readonly hasta: number } },
): number {
  const en = (v: { readonly desde: number; readonly hasta: number }): number => acotar01((mostrado - v.desde) / (v.hasta - v.desde))
  return Math.min(en(ventanas.subiendo), Math.max(en(ventanas.bajando), anterior))
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
// 2 · EL TÚNEL — la tabla medida sobre la referencia, anidada
// ===========================================================================

/**
 * ⚠️ **EL TÚNEL ES UNA TABLA, NO UNA LEY.** Cinco iteraciones derivaron leyes
 * —dos tramos, ×2 por scroll, un umbral de percepción— de conteos hechos a ojo, y
 * las cinco fallaron. Lo que hay acá es lo que se MIDIÓ en heatbureau.com con
 * `scripts-b4/ref-tabla.ts` (1440 × 900, muescas de rueda reales, cada paso
 * posado) y se leyó de su bundle: cada capa escala en RECTA entre dos scrolls y
 * se queda en sus dos puntas. La recta reprodujo las 36 muestras de cada capa con
 * un error máximo de 7·10⁻⁶. Nada de esto se ajustó: son sus números, tal cual.
 *
 * ── ⚠️ ANIDADAS, Y ESO ES EL EFECTO ─────────────────────────────────────
 *
 * Cada capa vive ADENTRO de la anterior y lleva su propia escala. Lo que mide en
 * pantalla es el producto de la suya y la de todos sus ancestros: la aceleración
 * que se leía como exponencial es ese producto de rectas, no una curva.
 *
 * ── ⚠️ CINCO DE SUS SIETE, Y CUÁLES SE CAYERON ──────────────────────────
 *
 * Ella tiene escenario + seis imágenes; nosotros, escenario + tres proyectos +
 * CTA. Se cayeron su **#0** (el durazno: arranca en 0,8, y acá toda capa arranca
 * en 0) y su **#1**. Con esas dos afuera, cada par padre → hijo de nuestra cadena
 * —proyecto → proyecto → CTA— es un par CONSECUTIVO de la suya (#2 → #3 → #4 →
 * #5), así que las razones de tamaño entre capas que coexisten son las suyas, en
 * el mismo scroll. Es la única elección compatible con «arrancan en 0» que
 * conserva los tres pares, y la única cuyos tres proyectos terminan desbordando
 * el cuadro como los de ella.
 *
 * Su #3 además se desliza (`x: 42 → 0`, `y: 52 → 0`): acá no, lo único animado es
 * la escala.
 */

/** Una capa de la tabla: su escala va de `de` a `a` en recta entre `arranca` y
 *  `topa`, que son scrolls de la REFERENCIA en píxeles, y afuera se queda. */
export interface CapaDeLaTabla {
  readonly de: number
  readonly a: number
  readonly arranca: number
  readonly topa: number
}

/** La tabla, tal cual se midió. El comentario de cada fila dice qué capa suya es. */
export const CAPAS_DEL_TUNEL = {
  escenario: { de: 1, a: 1.3, arranca: 199, topa: 1420 }, // su escenario
  proyectos: [
    { de: 0, a: 0.9, arranca: 810, topa: 1720 }, // su #2
    { de: 0, a: 1.2, arranca: 1303, topa: 1983 }, // su #3
    { de: 0, a: 1.05, arranca: 1636, topa: 2236 }, // su #4
  ],
  cta: { de: 0, a: 0.4, arranca: 1873, topa: 2290 }, // su #5, que también es su CTA
} as const satisfies {
  readonly escenario: CapaDeLaTabla
  readonly proyectos: readonly CapaDeLaTabla[]
  readonly cta: CapaDeLaTabla
}

/** La escala de una capa en un scroll de la referencia: recta, y quieta afuera. */
export function escalaDeLaCapa(capa: CapaDeLaTabla, yDeLaReferencia: number): number {
  const t = (yDeLaReferencia - capa.arranca) / (capa.topa - capa.arranca)
  // Las puntas devuelven el valor de la tabla y no la cuenta: así el producto de
  // la cadena al final es BIT A BIT el de sus topes, y el CTA llega a 1 exacto.
  if (t <= 0) return capa.de
  if (t >= 1) return capa.a
  return capa.de + (capa.a - capa.de) * t
}

/**
 * ⚠️ **DÓNDE CAE NUESTRO TÚNEL EN SU REGLA: donde arranca nuestro primer
 * proyecto.** La tabla se corre ENTERA por esta sola constante, así que todas
 * las distancias entre capas quedan las suyas. El túnel sigue arrancando donde
 * el cartel empieza a huir (`geometria.ts`); lo que se elige acá es qué scroll de
 * ella le toca a ese instante, y le toca el del primer proyecto para que no haya
 * un tramo de escenario vacío. Su escenario arranca 611 px antes: lo hace con el
 * túnel todavía sin nada adentro, y por eso no se ve.
 */
export const ORIGEN_DEL_TUNEL = CAPAS_DEL_TUNEL.proyectos[0].arranca

/** Lo que dura el túnel: del arranque del primer proyecto al tope del CTA. 1.480 px. */
export const PX_DEL_TUNEL = CAPAS_DEL_TUNEL.cta.topa - ORIGEN_DEL_TUNEL

/** Lo que miden juntas, al final, las capas que envuelven al CTA. */
const ACUMULADA_FINAL_ARRIBA_DEL_CTA = CAPAS_DEL_TUNEL.proyectos.reduce(
  (producto: number, capa) => producto * capa.a,
  CAPAS_DEL_TUNEL.escenario.a,
)

/** La pose del túnel en un instante: cada escala propia y lo que mide cada uno. */
export interface PoseDelTunel {
  readonly escenario: number
  readonly proyectos: readonly number[]
  readonly cta: number
  /** El ancho en pantalla de cada proyecto, en anchos de cuadro: su cadena. */
  readonly anchos: readonly number[]
  /** Cuánto de su tamaño final lleva el CTA en pantalla, de 0 a 1. */
  readonly fraccionDelCta: number
}

/** La pose para un píxel del túnel, contado desde su arranque. */
export function poseDelTunel(pxDelTunel: number, pxDelEscenario: number = pxDelTunel): PoseDelTunel {
  const y = pxDelTunel + ORIGEN_DEL_TUNEL
  // El escenario lleva su propio resorte, así que puede ir en otro píxel.
  const escenario = escalaDeLaCapa(CAPAS_DEL_TUNEL.escenario, pxDelEscenario + ORIGEN_DEL_TUNEL)
  const proyectos = CAPAS_DEL_TUNEL.proyectos.map((capa) => escalaDeLaCapa(capa, y))
  const anchos: number[] = []
  let producto = escenario
  for (const escala of proyectos) {
    producto *= escala
    anchos.push(producto)
  }
  const cta = escalaDeLaCapa(CAPAS_DEL_TUNEL.cta, y)
  return {
    escenario,
    proyectos,
    cta,
    anchos,
    fraccionDelCta: (producto / ACUMULADA_FINAL_ARRIBA_DEL_CTA) * (cta / CAPAS_DEL_TUNEL.cta.a),
  }
}

/**
 * En qué píxel del túnel el proyecto `indice` llega a medir `ancho` en pantalla.
 * La cadena es un producto de rectas que no bajan, así que no baja: se biseca.
 * Si nunca llega, devuelve el final del túnel.
 */
export function pxParaQueElProyectoMida(indice: number, ancho: number): number {
  if (!(indice >= 0 && indice < CAPAS_DEL_TUNEL.proyectos.length)) throw new Error(`proyecto inválido: ${indice}`)
  const mide = (px: number): number => poseDelTunel(px).anchos[indice]
  if (mide(PX_DEL_TUNEL) < ancho) return PX_DEL_TUNEL
  let bajo = CAPAS_DEL_TUNEL.proyectos[indice].arranca - ORIGEN_DEL_TUNEL
  let alto = PX_DEL_TUNEL
  for (let k = 0; k < 48; k += 1) {
    const medio = (bajo + alto) / 2
    if (mide(medio) < ancho) bajo = medio
    else alto = medio
  }
  return alto
}

/** El `transform` de una capa: sólo escala. El centro lo pone su caja, que es el cuadro. */
export function transformDeLaCapa(escala: number): string {
  return `scale(${escala.toFixed(5)})`
}

/**
 * ⚠️ **UN SCROLL SON 100 PX.** Medido en B2 sobre el propio sitio —la rueda
 * entrega 100 px por golpe— y la referencia se midió con muescas del mismo
 * tamaño. Lo sigue usando el cartel para contar su huida en scrolls; el túnel ya
 * no cuenta en scrolls sino en los píxeles de ella.
 */
export const PX_POR_SCROLL = 100

/**
 * ⚠️ **EL ANCHO DEL CUADRO CON EL QUE SE CUENTAN LOS PÍXELES.** Todo lo del tramo
 * se midió a 1.440 × 900; los anchos en cuadros se pasan a píxeles con esto.
 */
export const ANCHO_DEL_CUADRO_DE_REFERENCIA = 1440

/**
 * ⚠️ **CUÁNTO DE SU CAPTURA OCUPA EL RÓTULO. Medido, no elegido.**
 *
 * El rótulo es `absolute bottom-0 left-0` adentro de la caja de la captura, así
 * que la razón entre los dos anchos no depende de la escala. Medido con
 * `offsetWidth` a 1440 × 900: 0,2674 · **0,3937** · 0,3521 — manda el más ancho,
 * porque de acá sale un umbral que tiene que valer para los tres. Una captura se
 * RECONOCE cuando se le puede leer el nombre, y eso pasa a este ancho.
 */
export const FRACCION_DEL_ROTULO = 0.3937

/** El ancho del cuadro, en anchos de cuadro: donde el rótulo toca el borde y sale. */
export const ANCHO_DEL_LIMITE = 1

/**
 * La banda en que se lee el rótulo: abre cuando entra en su captura y cierra
 * cuando la captura llega al ancho del cuadro, que es cuando su esquina de abajo
 * a la izquierda —donde vive— sale por el borde.
 */
export const BANDA_DEL_ROTULO = { desde: FRACCION_DEL_ROTULO, hasta: ANCHO_DEL_LIMITE } as const

/** Lo que tarda el rótulo en entrar o en salir: un cuarto de su banda. */
const RAMPA_DEL_ROTULO = (BANDA_DEL_ROTULO.hasta - BANDA_DEL_ROTULO.desde) / 4

/**
 * ⚠️ **EL ANCHO DESDE EL QUE EL RÓTULO SE LEE ENTERO — y es el piso del foco.**
 * Reconocible es poder leer el nombre, y en el borde de la banda el rótulo
 * todavía está en opacidad 0: un piso ahí deja el enlace enfocado invisible.
 */
export const ANCHO_CON_EL_ROTULO_ENTERO = BANDA_DEL_ROTULO.desde + RAMPA_DEL_ROTULO

/** Cuánto se ve el rótulo de una captura de ese ancho. Entra y sale en rampa. */
export function opacidadDelRotulo(ancho: number): number {
  const { desde, hasta } = BANDA_DEL_ROTULO
  return Math.min(acotar01((ancho - desde) / RAMPA_DEL_ROTULO), acotar01((hasta - ancho) / RAMPA_DEL_ROTULO))
}

/**
 * ⚠️ **EL RÓTULO ESCALA CON SU PROYECTO, y por eso no lleva transformada.** Vive
 * adentro de la caja de la captura y hereda la escala de su cadena: la razón
 * entre los dos anchos queda clavada en `FRACCION_DEL_ROTULO` en todo el
 * recorrido. Contra-escalarlo es lo que hacía leer «El Garage» gigante encima de
 * una captura chiquita.
 */
export function transformDelRotulo(): string {
  return 'scale(1)'
}

/** El ancho del rótulo en pantalla, en anchos de cuadro, para una captura de ese ancho. */
export function anchoDelRotuloEnPantalla(anchoDeLaCaptura: number): number {
  return anchoDeLaCaptura * FRACCION_DEL_ROTULO
}

// ── El resorte: por qué sigue creciendo cuando soltás ──────────────────────

/**
 * ⚠️ **LOS RESORTES SON LOS DE LA REFERENCIA, leídos de su bundle.** Sus capas de
 * imagen persiguen su recta con un resorte de framer-motion `stiffness 215,
 * damping 100, mass 1`: ζ = 3,41, muy sobreamortiguado, cero rebote. Su escenario
 * lleva otro, el de abajo. Reemplazan a la persecución de 5.000 ms, que salía de
 * un conteo a ojo.
 */
export const RESORTE_DEL_TUNEL = { rigidez: 215, amortiguamiento: 100, masa: 1 } as const // aflojarlo = bajar el amortiguamiento

/** El del escenario de la referencia, que es otro: ζ = 1,34, más vivo y sin rebote. */
export const RESORTE_DEL_ESCENARIO = { rigidez: 500, amortiguamiento: 60, masa: 1 } as const

export interface Resorte {
  readonly rigidez: number
  readonly amortiguamiento: number
  readonly masa: number
}

/** ζ = c / (2 √(k·m)). Por encima de 1 no rebota. */
export const zetaDe = (r: Resorte): number => r.amortiguamiento / (2 * Math.sqrt(r.rigidez * r.masa))
export const ZETA_DEL_RESORTE = zetaDe(RESORTE_DEL_TUNEL)

/**
 * ⚠️ **Un salto de cuadro no puede volverse un salto de imagen.** Si la pestaña
 * estuvo oculta o el hilo se trabó, `dt` llega enorme y el resorte se comería el
 * retraso entero en un cuadro. Se acota a dos cuadros largos.
 */
export const DT_MAXIMO_MS = 100

export interface EstadoDelResorte {
  readonly posicion: number
  readonly velocidad: number
}

/**
 * Un paso del resorte hacia un objetivo quieto durante `dtMs`.
 *
 * ⚠️ **Solución EXACTA del paso, no Euler.** Así el resultado no depende de los
 * cuadros por segundo: dos pasos de 8 ms dan lo mismo que uno de 16. Resuelve los
 * tres regímenes para que aflojar la constante no rompa nada, aunque el de la
 * referencia es el sobreamortiguado.
 */
export function avanzarElResorte(
  estado: EstadoDelResorte,
  objetivo: number,
  dtMs: number,
  resorte: Resorte = RESORTE_DEL_TUNEL,
): EstadoDelResorte {
  const t = Math.min(Math.max(dtMs, 0), DT_MAXIMO_MS) / 1000
  const w0 = Math.sqrt(resorte.rigidez / resorte.masa)
  const z = zetaDe(resorte)
  const x0 = estado.posicion - objetivo
  const v0 = estado.velocidad
  if (z > 1) {
    const s = w0 * Math.sqrt(z * z - 1)
    const r1 = -z * w0 + s
    const r2 = -z * w0 - s
    const a = (v0 - r2 * x0) / (r1 - r2)
    const b = x0 - a
    const e1 = Math.exp(r1 * t)
    const e2 = Math.exp(r2 * t)
    return { posicion: objetivo + a * e1 + b * e2, velocidad: r1 * a * e1 + r2 * b * e2 }
  }
  if (z === 1) {
    const b = v0 + w0 * x0
    const e = Math.exp(-w0 * t)
    return { posicion: objetivo + (x0 + b * t) * e, velocidad: (b - w0 * (x0 + b * t)) * e }
  }
  const wd = w0 * Math.sqrt(1 - z * z)
  const b = (v0 + z * w0 * x0) / wd
  const e = Math.exp(-z * w0 * t)
  const coseno = Math.cos(wd * t)
  const seno = Math.sin(wd * t)
  return {
    posicion: objetivo + e * (x0 * coseno + b * seno),
    velocidad: e * (-z * w0 * (x0 * coseno + b * seno) + wd * (b * coseno - x0 * seno)),
  }
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
 * 1.440 son 893 px, y con la relación de abajo, 558 px de alto. Es el ancho de
 * LAYOUT de su caja: la escala acumulada al final vale 1, así que es también lo
 * que mide en pantalla.
 */
export const ANCHO_DEL_CTA = 0.62

/** La relación de la ventana. 16:10, que es la de un portátil y no la de un cine. */
export const RELACION_DEL_CTA = { ancho: 16, alto: 10 } as const

/**
 * ⚠️ **LA CAJA DEL CTA DE ELLA NO ES LA NUESTRA, y esto las convierte.**
 *
 * Su CTA es un botón de 244 px que termina en 131: su cadena lo deja en 0,54 de
 * su tamaño, texto incluido. El nuestro es una ventana con una frase de display
 * adentro, y a 0,59 —lo que da nuestra cadena— la dirección de 15 px llegaría a la
 * pantalla en 8,8: ilegible. Así que su rampa se usa tal cual —de 0 a 0,4, entre
 * sus mismos dos scrolls— y la ventana lleva ADENTRO una escala fija que es la
 * inversa de la cadena al final: **la escala acumulada termina en 1** y lo que se
 * declara es lo que se ve. Es la regla que la ventana ya tenía escrita, dicha para
 * una cadena en vez de para una escala sola. No es un ajuste: sale de la tabla.
 */
export const CONVERSION_DE_LA_CAJA_DEL_CTA = 1 / (ACUMULADA_FINAL_ARRIBA_DEL_CTA * CAPAS_DEL_TUNEL.cta.a)

/**
 * ⚠️ **EL TIPEO CUELGA DEL CRECIMIENTO Y NO DE UN RELOJ PROPIO, y se mide contra
 * el TAMAÑO.** Cuántas letras se ven es función de cuánto de su tamaño final
 * lleva la ventana en pantalla y de nada más: la frase está entera con la ventana
 * en tres cuartos, y el último cuarto del crecimiento es tiempo de lectura.
 */
export const FRACCION_DEL_TIPEO = 0.72

export function letrasEscritas(fraccionDelTamano: number, total: number): number {
  return Math.round(acotar01(fraccionDelTamano / FRACCION_DEL_TIPEO) * total)
}

/**
 * ⚠️ **CADA CUÁNTO TITILA EL CURSOR. Es el ritmo de una consola, no un gusto.**
 *
 * Un cursor de terminal parpadea alrededor de una vez por segundo con 50 % de
 * duty. Va como token en línea —no como clase— porque el número vive acá, que
 * es donde está el resto del vocabulario del tramo, y así la hoja de estilo no
 * lo repite.
 */
export const TOKEN_DEL_TITILEO = '--tipeo-titileo'
export const DURACION_DEL_TITILEO = '1.06s'

/**
 * ⚠️ **DÓNDE ESTÁ LA CABEZA DE TIPEO, en palabras y en fracción de palabra.**
 *
 * Pura: recibe cuántas letras se escribieron y los largos de las palabras, y
 * devuelve en cuál está la cabeza y qué fracción de ella se descubrió. El
 * consumidor lo convierte a píxeles con la caja de layout de esa palabra.
 *
 * Cuando la frase terminó devuelve la ÚLTIMA palabra con fracción 1: el cursor
 * se queda al final y sigue titilando, que es lo que hace un cursor.
 */
export function cabezaDelTipeo(
  letras: number,
  largos: readonly number[],
): { readonly palabra: number; readonly fraccion: number } {
  let restan = letras
  for (let i = 0; i < largos.length; i += 1) {
    if (restan < largos[i]) return { palabra: i, fraccion: largos[i] === 0 ? 1 : restan / largos[i] }
    restan -= largos[i]
  }
  return { palabra: Math.max(0, largos.length - 1), fraccion: 1 }
}

/**
 * ⚠️ **EL FRENO — cuánto se queda la frase antes de que el tramo siga.**
 *
 * Se pidió como una DURACIÓN y va como una duración: son milisegundos, no
 * píxeles. Lo que frena es el AVANCE del tramo, no el scroll de la página —el
 * repo tiene dos invariantes que prohíben tocar el scroll, y la doctrina escrita
 * es que el gesto del visitante siempre gana—. Mientras dura, la página scrollea
 * normal y la frase se queda quieta para que se alcance a leer; después el avance
 * retoma y el resorte se encarga de que el reencuentro no sea un salto. **Nadie
 * queda atrapado: lo que se detiene es el gesto.**
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
 * ⚠️ **CUÁNTO SE QUEDA LA VENTANA EN SU TAMAÑO MÁXIMO. A mano, y es un piso.**
 *
 * Llegar al máximo y seguir de largo no deja leer el cartel: el crecimiento
 * termina y el tramo ya está en otra cosa. Así que al llegar se QUEDA, y el
 * visitante sigue scrolleando sin que la ventana cambie de tamaño.
 *
 * Va en píxeles de scroll y es un PISO: lo que sobra del alto de la sección se
 * lo queda esta espera. Se pidió al 30 % de lo que era (1.839 → 552 px), así que
 * el piso baja a 550, justo debajo. El freno de 900 ms suma el tiempo de lectura.
 */
export const PX_MINIMOS_DE_LA_ESPERA_DEL_CTA = 550

/**
 * ⚠️ **LA SALIDA — un VACÍO que crece desde el centro y revela la escena.**
 *
 * Reemplaza al traslado 1:1 hacia arriba, que se fue entero: a 1.300 de alto no
 * alcanzaba a vaciar el cuadro. El vacío es la PRÓXIMA CAPA DEL TÚNEL —anidada
 * adentro del CTA, recta con clamp sobre la regla de la referencia— y en vez de
 * una imagen es un agujero en la pila, por el que se ve la escena que ya está
 * detrás (`recorteDelVacio`). Cuando llena el cuadro no queda nada del túnel.
 *
 * ⚠️ **LA VENTANA SIGUE DURANDO 1.131 px, y no por el vacío:** la espera al 30 %
 * y los demos están fijos a los dos lados, así que moverla movería a uno de los
 * dos. El vacío la llena en `PX_DEL_VACIO` (969) y lo que sobra ya es la sala.
 */
export const PX_DE_LA_SALIDA = 1131

/**
 * ⚠️ **LA RAMPA DEL VACÍO ES LA DE LA ÚLTIMA CAPTURA (su #4), no la del CTA.**
 * Misma pendiente —1,05 de escala en 600 px de su scroll—, desde 0 y hasta la
 * escala con la que su cadena llena el cuadro. Con la del CTA (0,4 en 417 px)
 * tardaría 1.768 px en llenarlo: no entra en la ventana y se come 637 de los demos.
 */
export const RAMPA_DEL_VACIO: CapaDeLaTabla = CAPAS_DEL_TUNEL.proyectos[CAPAS_DEL_TUNEL.proyectos.length - 1]

/** La escala propia con la que una capa anidada adentro del CTA —en su tope— mide el cuadro entero. */
export const ESCALA_QUE_LLENA_EL_CUADRO = 1 / (ACUMULADA_FINAL_ARRIBA_DEL_CTA * CAPAS_DEL_TUNEL.cta.a)

/** Lo que tarda el vacío en llenar el cuadro, en px de la regla: 969. */
export const PX_DEL_VACIO =
  (ESCALA_QUE_LLENA_EL_CUADRO * (RAMPA_DEL_VACIO.topa - RAMPA_DEL_VACIO.arranca)) / (RAMPA_DEL_VACIO.a - RAMPA_DEL_VACIO.de)

/** La capa del vacío en la regla de la referencia, arrancando en `arranca`. */
export function capaDelVacio(arranca: number): CapaDeLaTabla {
  return { de: 0, a: ESCALA_QUE_LLENA_EL_CUADRO, arranca, topa: arranca + PX_DEL_VACIO }
}

/** Cuánto del cuadro ocupa el vacío, de 0 a 1: la cadena del CTA por su escala propia. */
export function fraccionDelVacio(pose: PoseDelTunel, capa: CapaDeLaTabla, pxDelTunel: number): number {
  const cadenaDelCta = (pose.anchos[pose.anchos.length - 1] ?? 0) * pose.cta
  return Math.min(1, cadenaDelCta * escalaDeLaCapa(capa, pxDelTunel + ORIGEN_DEL_TUNEL))
}

/**
 * ⚠️ **EL AGUJERO: el marco menos un rectángulo central, con la regla `evenodd`.**
 * El rectángulo va en % de la caja, así que tiene la proporción del cuadro a
 * cualquier alto —900 o 1.300— y crece desde el centro. El marco de afuera deja
 * el margen del recorte, igual que `overflow-clip-margin`. Lleno, no se pinta
 * nada de la caja: ni un píxel del túnel, ni un anillo de foco.
 */
export function recorteDelVacio(fraccion: number, margenPx: number): string {
  if (!(fraccion > 0)) return 'none'
  if (fraccion >= 1) return 'inset(50%)'
  const desde = `${(50 * (1 - fraccion)).toFixed(3)}%`
  const hasta = `${(50 * (1 + fraccion)).toFixed(3)}%`
  const afuera = `-${margenPx}px`
  const lejos = `calc(100% + ${margenPx}px)`
  const marco = `${afuera} ${afuera}, ${lejos} ${afuera}, ${lejos} ${lejos}, ${afuera} ${lejos}, ${afuera} ${afuera}`
  const hueco = `${desde} ${desde}, ${hasta} ${desde}, ${hasta} ${hasta}, ${desde} ${hasta}, ${desde} ${desde}`
  return `polygon(evenodd, ${marco}, ${hueco})`
}

/**
 * ⚠️ **EL ESPACIO DE DEMOS — dos pantallas, y el motivo es que UNA no alcanzó.**
 *
 * El tramo existía sobre el papel y no en la pantalla. Era «el viewport que
 * `sticky` deja despineado al final», y eso se reportó como que no se percibe:
 * durante ese viewport el panel sube y **servicios entra por abajo al mismo
 * tiempo**, así que no es un espacio, es una transición.
 *
 * Ahora es un tramo de PIN, después de que el vacío se llevó el túnel: la
 * sección sigue clavada y en el cuadro no hay nada más que la sala de noche.
 *
 * Y son dos pantallas, no una. Una es exactamente lo que ya había y no se leyó.
 * Dos son ~1,8 s a ritmo de lectura: un tramo que hay que ATRAVESAR, que es lo
 * que convierte un hueco en un lugar. Sigue vacío por dentro —lo que va adentro
 * es contenido y todavía no lo sabemos—, pero el lugar ya está reservado y se
 * nota.
 */
export const PANTALLAS_DEL_ESPACIO_DE_DEMOS = 2
export const PX_DEL_ESPACIO_DE_DEMOS =
  PANTALLAS_DEL_ESPACIO_DE_DEMOS * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
