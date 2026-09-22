/**
 * EL BARRIDO — cómo entra y cómo se va la noche de Trabajos.
 * **[B12 · PORTFOLIO]**
 *
 * ⚠️ **Se llamaba LA GOTA y era un círculo que cerraba el cuadro. Dejó de
 * serlo, y el archivo conserva el nombre sólo porque `soporte.ts` lo lee del
 * disco por su ruta.** Lo que hay acá ahora es una BANDA que cruza en diagonal.
 *
 * ── Los dos defectos que lo cambiaron, leídos cuadro a cuadro ─────────────
 *
 * 1. **Había cuadros de negro plano absoluto** —sin sala, sin logo, sin motas—
 *    entre uno de sala clara y uno de sala invertida. Era inevitable con un
 *    círculo que crecía hasta cubrir: entre que cubre y que se disuelve, lo
 *    único en pantalla es la capa. Cuatro veces en una sola grabación.
 * 2. **El color de la sala cambiaba sin que la animación hubiera corrido.** La
 *    inversión era un estado paralelo —un booleano que el observador prendía— y
 *    el círculo, una decoración que corría al lado. Con el scroll rápido se veía
 *    el resultado sin el gesto, en las dos direcciones.
 *
 * ── Lo que hay en su lugar ────────────────────────────────────────────────
 *
 *   · una **banda diagonal** que entra por la esquina de ABAJO A LA DERECHA y
 *     sale por la de ARRIBA A LA IZQUIERDA. Nunca aparece cubriendo la pantalla:
 *     es una franja con dos plumas y su ancho total sobre la diagonal es un dato
 *     declarado **menor que 100**, así que en todo cuadro queda diagonal sin
 *     tapar. Deja de ser una promesa: `anchoTotalDeLaBanda` lo hace comprobable
 *     sin navegador, y el barrido de píxeles lo mide sobre el render.
 *   · la **inversión del color cuelga del mismo reloj**: `cantidadDeLaNoche` es
 *     una función del avance del barrido y de nada más. Si el barrido no corrió,
 *     la cantidad no se movió. La vuelta es el mismo reloj leído al revés, así
 *     que la banda **sale por donde entró** y el color deshace lo que hizo.
 */

/**
 * ⚠️ **EL ANCHO DE LA BANDA Y SUS DOS PLUMAS, en porcentaje de la diagonal.**
 *
 * `30 + 2 × 16 = 62`. El número que importa es el TOTAL y la razón es una sola:
 * mientras sea menor que 100, **en todo cuadro hay diagonal sin tapar por los dos
 * extremos**, y ahí se sigue viendo la sala. Los 38 puntos que sobran se reparten
 * entre la esquina por la que la banda todavía no pasó y la que ya dejó atrás.
 *
 * Subirlo hasta 100 es exactamente el defecto que este archivo vino a cerrar.
 */
export const ANCHO_DE_LA_BANDA = 30
export const PLUMA_DE_LA_BANDA = 16

/** El ancho total sobre la diagonal. Derivado: es lo que se compara contra 100. */
export function anchoTotalDeLaBanda(): number {
  return ANCHO_DE_LA_BANDA + 2 * PLUMA_DE_LA_BANDA
}

/** Cuánto tarda el barrido en cruzar el cuadro, en ms. Es el mismo total que la
 *  transición ya tenía cuando era un círculo que cerraba y se disolvía. */
export const DURACION_DEL_BARRIDO = 760

/**
 * La curva del barrido: `CURVAS.principal` —`power1.out`, 1 − (1−t)²— escrita acá
 * y no importada, porque este módulo lo alcanza la rama QUIETA y `s7-contrato` §3
 * prohíbe que el árbol quieto importe un valor del sistema de motion. Editable a
 * mano, que es lo que el gesto pide.
 */
export const CURVA_DEL_BARRIDO = (t: number): number => 1 - (1 - t) * (1 - t)

/**
 * ⚠️ **DÓNDE, ADENTRO DEL BARRIDO, SE INVIERTE EL COLOR.**
 *
 * En el medio. No es un ritmo elegido: es el tramo en que la banda está cruzando
 * el centro del cuadro, o sea cuando más superficie tapa. Antes de 0,25 la banda
 * todavía está entrando y lo que se ve es la sala clara entera; después de 0,75
 * ya está saliendo y lo que se ve es la sala invertida entera. El cambio ocurre
 * mientras la banda es lo más grande que va a ser.
 */
export const VENTANA_DE_LA_INVERSION = { desde: 0.25, hasta: 0.75 } as const

/** Acota a [0,1]. Local para no importar `_lib` desde el núcleo de la sección. */
function acotar01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/**
 * CUÁNTA NOCHE HAY, dado el avance del barrido. **Es la única fuente del color.**
 *
 * Fuera de `VENTANA_DE_LA_INVERSION` devuelve los extremos exactos: 0 antes y 1
 * después. Que el color no pueda moverse sin que este número se mueva, y que este
 * número no pueda moverse sin que el barrido avance, es lo que cierra el segundo
 * defecto.
 */
export function cantidadDeLaNoche(t: number): number {
  const { desde, hasta } = VENTANA_DE_LA_INVERSION
  return CURVA_DEL_BARRIDO(acotar01((acotar01(t) - desde) / (hasta - desde)))
}

/**
 * ⚠️ **LOS DOS EXTREMOS DE LA MÁSCARA SON ALFA Y NO COLOR — y por eso no se
 * escriben con un hex.**
 *
 * Una `mask-image` no se pinta nunca: de su imagen el navegador usa el canal
 * ALFA, y de un degradado el `mask-mode` resuelve justamente a eso. `TAPA` con
 * cualquier color opaco da el mismo resultado al píxel, así que el color que
 * lleve no significa nada. Escritos como el MISMO color con alfa 1 y alfa 0, la
 * única diferencia que hay entre los dos queda a la vista.
 *
 * Es además lo que corresponde desde que el reposo viaja en el marcado: §11 del
 * invariante pide cero hex fuera de los tokens en la rama quieta, y tenía razón
 * —un hex ahí adentro se lee como un color de diseño escrito a mano, y esto no
 * lo es—.
 */
const TAPA = 'rgb(0 0 0 / 1)'
const DEJA_PASAR = 'rgb(0 0 0 / 0)'

/**
 * LA MÁSCARA DE LA BANDA en un avance dado.
 *
 * `to top left` pone el 0 % de la línea del degradado en la esquina de ABAJO A LA
 * DERECHA y el 100 % en la de ARRIBA A LA IZQUIERDA: la dirección del barrido es
 * literalmente esa palabra y no un signo escondido en una cuenta.
 *
 * El centro de la banda va de `−total/2` a `100 + total/2`, así que en `t = 0` la
 * pluma de atrás toca el 0 % —no hay un solo píxel negro— y en `t = 1` la de
 * adelante toca el 100 %. Entre medio, los dos extremos de la diagonal que la
 * banda no alcanza son cuadro sin tapar.
 */
export function maskDelBarrido(t: number): string {
  const total = anchoTotalDeLaBanda()
  const centro = -total / 2 + acotar01(t) * (100 + total)
  const medio = ANCHO_DE_LA_BANDA / 2
  const borde = (v: number): string => `${v.toFixed(2)}%`
  return (
    `linear-gradient(to top left, ${DEJA_PASAR} ${borde(centro - medio - PLUMA_DE_LA_BANDA)}, ` +
    `${TAPA} ${borde(centro - medio)}, ${TAPA} ${borde(centro + medio)}, ` +
    `${DEJA_PASAR} ${borde(centro + medio + PLUMA_DE_LA_BANDA)})`
  )
}

export interface EstadoDelBarrido {
  readonly mask: string
  readonly opacidad: number
  /** Cuánta noche corresponde a ESTE cuadro. El color sale de acá y de nada más. */
  readonly noche: number
}

/**
 * EL ESTADO DEL BARRIDO EN MILISEGUNDOS, o `null` si no arrancó o ya terminó.
 *
 * `null` NO significa «sin noche»: significa que la capa no existe. La noche de
 * los extremos la pone el llamador con `cantidadDeLaNoche(0)` y
 * `cantidadDeLaNoche(1)`, que son 0 y 1 — o sea que tampoco ahí hay un color
 * escrito a mano.
 */
export function estadoDelBarrido(ms: number): EstadoDelBarrido | null {
  if (ms < 0 || ms > DURACION_DEL_BARRIDO) return null
  const t = CURVA_DEL_BARRIDO(ms / DURACION_DEL_BARRIDO)
  return { mask: maskDelBarrido(t), opacidad: 1, noche: cantidadDeLaNoche(t) }
}

/**
 * ⚠️ **LA VUELTA — el MISMO barrido leído desde el final, y por eso no tiene
 * números propios.**
 *
 * En `ms = 0` devuelve lo que el barrido devuelve al terminar y en
 * `ms = DURACION_DEL_BARRIDO` lo que devuelve al empezar: la banda vuelve sobre
 * sus pasos y **sale por donde entró**, por abajo a la derecha. La noche deshace
 * su rampa con la misma curva, así que el color tampoco puede adelantarse al
 * gesto en esta dirección.
 */
export function estadoDeLaVuelta(ms: number): EstadoDelBarrido | null {
  return estadoDelBarrido(DURACION_DEL_BARRIDO - ms)
}
