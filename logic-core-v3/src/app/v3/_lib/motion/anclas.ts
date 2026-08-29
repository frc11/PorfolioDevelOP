/**
 * LAS ANCLAS — de la gramática de ScrollTrigger a un rango de scroll en píxeles.
 *
 * ── Qué es un ancla ────────────────────────────────────────────────────────
 *
 * ScrollTrigger declara cuándo empieza y cuándo termina una animación con dos
 * cadenas de la forma `"<posición en el elemento> <posición en el viewport>"`.
 * `"top bottom-=80px"` se lee: cuando el BORDE SUPERIOR del elemento llega a 80
 * píxeles por encima del BORDE INFERIOR del viewport.
 *
 * Las nueve anclas de la referencia están medidas en SCROLL.md §3, agrupadas por
 * `(start declarado, end declarado, scrub, tipo)`. Son la mitad del patrón: la
 * otra mitad —qué anima— está en §9.7.
 *
 * ── El modelo, que es más simple que la gramática ──────────────────────────
 *
 * Cada lado de un ancla es una FRACCIÓN de su propia longitud más un
 * desplazamiento en PÍXELES. Nada más:
 *
 *     posiciónDeScroll = (topDoc + alto·fracciónElemento + pxElemento)
 *                      − (altoViewport·fracciónViewport + pxViewport)
 *
 * Con eso, `bottom-=240px` es `fracción 1, px −240`; `top+=20%` es
 * `fracción 0,2, px 0`; `80%` es `fracción 0,8`. Los porcentajes del lado del
 * viewport son del ALTO DEL VIEWPORT y los del lado del elemento son del ALTO
 * DEL ELEMENTO — son dos longitudes distintas y por eso el modelo las separa.
 *
 * ── Por qué se calcula y no se le pide a `useScroll` ───────────────────────
 *
 * `useScroll({ target, offset })` de `motion/react` resuelve cada extremo como
 * `resolveEdge(bordeElemento) − resolveEdge(bordeViewport)`, y `resolveEdge`
 * admite UN solo término: o una fracción de la longitud, o un desplazamiento en
 * píxeles, nunca los dos. `"top bottom-=80px"` sí se puede escribir
 * (`['80px', 'end']`), pero `"bottom bottom-=240px"` NO: haría falta
 * `fracción 1 + 240px` sobre el elemento, y esa suma no existe en la gramática.
 * Cuatro de las nueve anclas quedan fuera de lo expresable.
 *
 * La alternativa —aproximar— no es aceptable acá: el rango de P1 es
 * `alto + 160px`, y para el bloque de links del pie de la referencia eso son 190
 * píxeles en total. Un error de 240 sería más grande que el rango entero.
 *
 * Así que el rango se calcula, y a cambio se gana algo que la vía de `useScroll`
 * no daba: es una FUNCIÓN PURA de `(topDoc, alto, altoViewport)`, y se puede
 * comprobar contra los píxeles medidos en la referencia sin abrir un navegador.
 * `__tests__/anclas.invariant.ts` lo hace con el bloque del pie de la home.
 *
 * ── Beneficio lateral, y no es menor ───────────────────────────────────────
 *
 * `useScroll` marca `scrollYProgress` como acelerable cuando el `offset` mapea a
 * un rango con nombre de ViewTimeline, y ahí cualquier consumidor que derive ese
 * valor a `transform`/`opacity` se promueve en silencio a una animación nativa
 * atada al CONTENEDOR DE SCROLL ANCESTRO MÁS CERCANO. Este sistema pone
 * `overflow: hidden` en cada línea de texto, así que ese camino es exactamente
 * el que no queremos. Al derivar de `scrollY` —píxeles crudos, sin `target` y
 * sin `offset`— no hay rango con nombre, no hay aceleración y todos los
 * consumidores corren por el mismo camino de JS.
 */

/** Un extremo del ancla: fracción de la longitud propia más píxeles. */
export interface LadoDeAncla {
  /** 0 = borde superior, 0,5 = centro, 1 = borde inferior. */
  readonly fraccion: number
  /** Desplazamiento en píxeles. Negativo = hacia arriba. */
  readonly px: number
}

/** El ancla completa: dónde empieza y dónde termina, cada una con sus dos lados. */
export interface Ancla {
  readonly elemento: LadoDeAncla
  readonly viewport: LadoDeAncla
  /** La cadena original de ScrollTrigger, para poder auditar la traducción. */
  readonly declarado: string
}

export interface ParDeAnclas {
  readonly inicio: Ancla
  readonly fin: Ancla
}

/** La caja del elemento disparador, en coordenadas de documento. */
export interface CajaMedida {
  /** Distancia del tope del documento al tope del elemento. */
  readonly topDoc: number
  /** Alto del elemento. */
  readonly alto: number
}

export interface RangoDeScroll {
  /** Píxel de scroll donde el progreso vale 0. */
  readonly inicio: number
  /** Píxel de scroll donde el progreso vale 1. */
  readonly fin: number
}

const BORDES = { top: 0, center: 0.5, bottom: 1 } as const

/** Atajo para escribir un lado sin repetir la forma. */
const lado = (fraccion: number, px = 0): LadoDeAncla => ({ fraccion, px })

/** Un ancla, con su cadena declarada al lado para poder cruzarla con SCROLL.md. */
const ancla = (declarado: string, elemento: LadoDeAncla, viewport: LadoDeAncla): Ancla => ({
  declarado,
  elemento,
  viewport,
})

/**
 * Las anclas de los nueve patrones, en el orden de SCROLL.md §3.
 *
 * ⚠ La correspondencia entre las nueve FILAS de §3 (agrupadas por ancla) y los
 * nueve PATRONES de §9.7 (numerados por cantidad de instancias) es DERIVADA, no
 * está escrita en el documento. Se resolvió cruzando tres hechos de §9.7 con los
 * conteos por página de §3:
 *
 *   · P4 tiene 4 instancias "todas en services" → la fila de 4 que está toda en
 *     services es `top bottom → bottom top`, no la de 4 repartida en cuatro
 *     páginas.
 *   · P5 tiene 3 instancias "una por página" → la fila repartida
 *     (home 1, studio 1, services 1, work 1) da 3 dentro del alcance de §9.7,
 *     que no incluye `work`.
 *   · P8 es el único `scrub: 2` del sitio → la fila `top 80% → bottom 70%`.
 *
 * Las otras seis filas son inequívocas por conteo. Queda reportado como
 * derivación.
 */
export const ANCLAS: Readonly<Record<string, ParDeAnclas>> = {
  /** P1 — `top bottom-=80px` → `bottom bottom-=240px`. Rango = alto + 160. */
  P1: {
    inicio: ancla('top bottom-=80px', lado(BORDES.top), lado(BORDES.bottom, -80)),
    fin: ancla('bottom bottom-=240px', lado(BORDES.bottom), lado(BORDES.bottom, -240)),
  },
  /** P2 — `top bottom` → `bottom bottom`. Rango = alto exacto. */
  P2: {
    inicio: ancla('top bottom', lado(BORDES.top), lado(BORDES.bottom)),
    fin: ancla('bottom bottom', lado(BORDES.bottom), lado(BORDES.bottom)),
  },
  /** P3 — `top bottom-=10%` → `bottom center`. Rango = alto + 0,4 viewport. */
  P3: {
    inicio: ancla('top bottom-=10%', lado(BORDES.top), lado(0.9)),
    fin: ancla('bottom center', lado(BORDES.bottom), lado(BORDES.center)),
  },
  /** P4 — `top bottom` → `bottom top`. Rango = alto + un viewport entero. */
  P4: {
    inicio: ancla('top bottom', lado(BORDES.top), lado(BORDES.bottom)),
    fin: ancla('bottom top', lado(BORDES.bottom), lado(BORDES.top)),
  },
  /**
   * P5 — `top top+=20%` → `bottom bottom-=40%`. Rango = alto − 0,4 viewport.
   * ⚠ Es el único cuyo rango puede salir NEGATIVO: necesita un elemento más
   * alto que el 40 % del viewport. `rangoDeScroll` lo acota y lo deja anotado.
   */
  P5: {
    inicio: ancla('top top+=20%', lado(BORDES.top), lado(0.2)),
    fin: ancla('bottom bottom-=40%', lado(BORDES.bottom), lado(0.6)),
  },
  /**
   * P6 — sin declarar: usa el default de ScrollTrigger, que es
   * `top bottom` → `bottom top`. SCROLL.md hueco 7 registra que las tres
   * instancias de esta fila son las que no declaran ancla.
   */
  P6: {
    inicio: ancla('top bottom (default)', lado(BORDES.top), lado(BORDES.bottom)),
    fin: ancla('bottom top (default)', lado(BORDES.bottom), lado(BORDES.top)),
  },
  /** P7 — `top bottom` → `bottom bottom`. Las dos únicas timelines del sitio. */
  P7: {
    inicio: ancla('top bottom', lado(BORDES.top), lado(BORDES.bottom)),
    fin: ancla('bottom bottom', lado(BORDES.bottom), lado(BORDES.bottom)),
  },
  /** P8 — `top 80%` → `bottom 70%`. Rango = alto + 0,1 viewport. */
  P8: {
    inicio: ancla('top 80%', lado(BORDES.top), lado(0.8)),
    fin: ancla('bottom 70%', lado(BORDES.bottom), lado(0.7)),
  },
  /** P9 — `top 80%` → `bottom 60%`. Rango = alto + 0,2 viewport. */
  P9: {
    inicio: ancla('top 80%', lado(BORDES.top), lado(0.8)),
    fin: ancla('bottom 60%', lado(BORDES.bottom), lado(0.6)),
  },
}

/**
 * El píxel de scroll en el que se cumple un ancla.
 *
 * Es la fórmula entera del módulo y no tiene ramas: por eso se puede comprobar
 * contra los `start`/`end` medidos de la referencia.
 */
export function posicionDeAncla(a: Ancla, caja: CajaMedida, altoViewport: number): number {
  const enElElemento = caja.topDoc + caja.alto * a.elemento.fraccion + a.elemento.px
  const enElViewport = altoViewport * a.viewport.fraccion + a.viewport.px
  return enElElemento - enElViewport
}

/**
 * Rango mínimo, en píxeles. Un rango de 0 haría degenerar la interpolación
 * —dividir por cero— y P5 puede llegar ahí con un elemento bajo. Un píxel deja
 * la interpolación definida y el patrón se lee como un salto, que es la verdad:
 * el elemento es demasiado bajo para el ancla que le tocó.
 */
export const RANGO_MINIMO_PX = 1

/**
 * El rango de scroll de un patrón: entre qué dos píxeles el progreso va de 0 a 1.
 */
export function rangoDeScroll(
  par: ParDeAnclas,
  caja: CajaMedida,
  altoViewport: number,
): RangoDeScroll {
  const inicio = posicionDeAncla(par.inicio, caja, altoViewport)
  const finCrudo = posicionDeAncla(par.fin, caja, altoViewport)
  return { inicio, fin: Math.max(finCrudo, inicio + RANGO_MINIMO_PX) }
}

/** Si el ancla degeneró: el elemento es demasiado bajo para su par de anclas. */
export function rangoDegenerado(
  par: ParDeAnclas,
  caja: CajaMedida,
  altoViewport: number,
): boolean {
  const inicio = posicionDeAncla(par.inicio, caja, altoViewport)
  const fin = posicionDeAncla(par.fin, caja, altoViewport)
  return fin - inicio < RANGO_MINIMO_PX
}

/** Acota a `[0, 1]`. El progreso entra acotado a todo lo que sigue. */
export function acotar01(n: number): number {
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

/**
 * Progreso 0→1 de una posición de scroll dentro de un rango.
 *
 * Acotado en los dos extremos: fuera del rango el valor no cambia, y como
 * `MotionValue` solo avisa a sus suscriptores cuando el valor CAMBIA
 * (`updateAndNotify`: `if (this.current !== this.prev)`), un patrón fuera de su
 * rango no propaga nada. Eso es lo que hace innecesario un `IntersectionObserver`
 * para pausarlo: ya está pausado por el acotado.
 */
export function progresoEnRango(scrollY: number, rango: RangoDeScroll): number {
  return acotar01((scrollY - rango.inicio) / (rango.fin - rango.inicio))
}
