/**
 * EL VOCABULARIO DEL TRAMO — **dos verbos, y nada más se mueve.**
 * **[PORTFOLIO · hasta el segundo proyecto]**
 *
 * Todo lo que entra o sale de este tramo usa uno de estos dos gestos. No hay un
 * tercero y la misma idea no se resuelve distinto en dos piezas: es la regla que
 * ordena el archivo y la razón por la que el cartel, las capturas, los logos y
 * los textos comparten una sola función de pose.
 *
 * ── NACER Y CRECER ────────────────────────────────────────────────────────
 *
 * El elemento **nace en un punto y crece expandiéndose hacia los lados que haga
 * falta** hasta llenar su caja final. **Cero traslación**: el `transform` lleva
 * una escala y nada más, y el lugar lo pone el posicionamiento.
 *
 * ⚠️ **EL ORIGEN ES UN PUNTO INTERIOR, NO UNA ESQUINA — y eso tira abajo la
 * cadena anterior.** La versión de antes anclaba cada pieza a una esquina y
 * hacía nacer la siguiente en la esquina HOMÓNIMA de la anterior. Esa elección
 * no era estética: era la única compatible con dar de baja la foto vieja cuando
 * quedaba tapada —para que una caja anclada llegue a CONTENER a otra, su esquina
 * tiene que caer del lado de afuera; para nacer DENTRO, del lado de adentro; y
 * las dos condiciones sólo se cruzan en la esquina misma—.
 *
 * **Al eliminarse la baja por tapado, la restricción desaparece.** Y tenía que
 * eliminarse: los logos son PNG que no miden lo mismo que una captura, así que
 * «la nueva tapa a la vieja» no es una propiedad que se pueda sostener. Ahora
 * todo se va con el mismo verbo —HUIR— y el origen puede ser cualquier punto de
 * adentro de la caja, declarado como dato.
 *
 * En el DOM eso es `transform-origin` en porcentaje de la caja propia. Con
 * `scale(s)` la caja se contrae hacia ESE punto: a escala 0 es el punto, a
 * escala 1 es la caja entera. Nacer y crecer, sin mover el lugar.
 *
 * ── HUIR ──────────────────────────────────────────────────────────────────
 *
 * Alejarse en z y desvanecerse, **al mismo tiempo**. Nada se desliza hacia abajo
 * ni hacia los costados para desaparecer, y nada desaparece por quedar tapado.
 *
 * Los dos números de la huida **no se inventan**: son los de la SALIDA de P7
 * (`patrones-piezas.ts`), el tramo que este repo ya usa para que un plano se
 * vaya al fondo. Se escriben acá en vez de importarse por la misma razón que la
 * curva de la gota: este módulo lo alcanza la rama QUIETA, y `s7-contrato` §3
 * prohíbe que el árbol quieto importe un valor del sistema de motion.
 *
 * ⚠️ Y para que el alejamiento se VEA hace falta `transform-style: preserve-3d`
 * en el contenedor: la `perspective` del bloque sólo alcanza a sus hijos, y
 * estas piezas son nietas. El porqué completo está en `DIRECCION-ESCENA.md` §79.
 *
 * ── ⚠️ UNA SOLA RAMPA DE ESCALA PARA TODOS, Y ES UN REQUISITO ────────────
 *
 * `ESCALA_DE_NACIMIENTO` es **una constante compartida y no una derivación por
 * elemento**: el texto y la captura de un mismo proyecto tienen que tener la
 * misma escala normalizada cuadro a cuadro. Con una sola rampa eso es cierto por
 * construcción —si comparten ventana, comparten pose— y no por calibración.
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

/**
 * LA ESCALA CON LA QUE NACE TODO. Un 4 % de su tamaño final: sobre la celda de
 * la zona son unos 19 px a 1440, o sea un punto. Una sola para todos: ver arriba.
 */
export const ESCALA_DE_NACIMIENTO = 0.04

/**
 * ⚠️ **LA DISTANCIA Y LA CURVA DE LA HUIDA — son las de la SALIDA de P7.**
 *
 * `translateZ: 0 → −1000` con la curva `entrada` (`power1.in`, t²) y `autoAlpha`
 * de 1 a 0 en el mismo tramo. Están escritas y no importadas: ver la cabecera.
 */
export const DISTANCIA_DE_LA_HUIDA = 1000
export const CURVA_DE_LA_HUIDA = (t: number): number => t * t

/**
 * La rampa de crecimiento: exponencial de `ESCALA_DE_NACIMIENTO` a 1.
 *
 * Exponencial y no recta porque **crecer es una propiedad de RAZÓN**: con una
 * recta el elemento se despega del punto al primer píxel de scroll y después se
 * arrastra; con una potencia el ritmo relativo es constante y se lee como un zoom.
 */
export function escalaDelCrecimiento(u: number): number {
  const acotado = u < 0 ? 0 : u > 1 ? 1 : u
  return ESCALA_DE_NACIMIENTO ** (1 - acotado)
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
 * LA POSE DE UN ELEMENTO EN SU VENTANA, o `null` si no nació o ya terminó de
 * huir. Cuatro tramos y ninguno se superpone:
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

// ── La geometría de una pieza ───────────────────────────────────────────────

/**
 * LA CAJA DE UNA PIEZA A UNA ESCALA DADA, contraída hacia su punto interior.
 *
 * Es la cuenta que el navegador hace con `transform-origin` + `scale`, escrita
 * acá para poder afirmarla sin navegador: dónde nace la pieza, si ese punto cae
 * adentro de la caja del proyecto anterior, y si dos piezas se pisan.
 */
export function cajaEnEscala(caja: Caja, origen: PuntoDelCuadro, escala: number): Caja {
  const ancho = caja.x1 - caja.x0
  const alto = caja.y1 - caja.y0
  const px = caja.x0 + origen.x * ancho
  const py = caja.y0 + origen.y * alto
  return {
    x0: px - origen.x * ancho * escala,
    x1: px + (1 - origen.x) * ancho * escala,
    y0: py - origen.y * alto * escala,
    y1: py + (1 - origen.y) * alto * escala,
  }
}

/** El punto del cuadro en el que nace una pieza: su origen, en absoluto. */
export function puntoDeNacimiento(caja: Caja, origen: PuntoDelCuadro): PuntoDelCuadro {
  return {
    x: caja.x0 + origen.x * (caja.x1 - caja.x0),
    y: caja.y0 + origen.y * (caja.y1 - caja.y0),
  }
}

/** Si `a` contiene a `b` por completo. Bordes incluidos. */
export function contiene(a: Caja, b: Caja): boolean {
  return a.x0 <= b.x0 && a.y0 <= b.y0 && a.x1 >= b.x1 && a.y1 >= b.y1
}

/** Si un punto cae adentro de una caja. Bordes incluidos. */
export function adentro(caja: Caja, punto: PuntoDelCuadro): boolean {
  return punto.x >= caja.x0 && punto.x <= caja.x1 && punto.y >= caja.y0 && punto.y <= caja.y1
}

/** Si dos cajas comparten un solo píxel. */
export function chocan(a: Caja, b: Caja): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
}

/** El estilo del LUGAR de una pieza: su caja final y su punto interior. */
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
 * `lugarDeLaCaja` habla en nombres de propiedad CSS —`transform-origin`— porque
 * es lo que `style.setProperty` consume por cuadro. El objeto `style` de React
 * quiere el nombre en camello: con el guion **rechaza la clave** y avisa por
 * consola diciendo cuál esperaba. El render de servidor, en cambio, la emite
 * igual —comprobado sobre el marcado—, así que el papel y el cliente dejan de
 * decir lo mismo, que es la peor forma que puede tomar.
 *
 * Y acá no es cosmético: sin `transform-origin` en el primer render una pieza
 * nace desde el centro de su caja —el valor por omisión— en vez de desde su
 * punto interior, hasta que el `ResizeObserver` la reescribe. Un primer cuadro
 * que no es el que se declaró, igual que el reposo del barrido.
 *
 * Las dos formas salen de UNA cuenta: esta función traduce la de `setProperty`.
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
