/**
 * [B1.2c] LA TRANSICIÓN ENTRE PROYECTOS — pura (plan §13, punto 4).
 *
 * En B1.2b la apertura del siguiente pisaba el cierre del anterior: la tira cambiaba de ancho mientras su contenido todavía se iba.
 * Ahora va en orden: la SALIDA completa del que se va (su contenido se apaga y después las tiras se reacomodan: la suya se cierra y
 * la del siguiente se abre, vacía), un RESPIRO y la ENTRADA del siguiente (su secuencia por tiempo, `secuencia.ts`). Con un scroll
 * rápido que cruza varios proyectos (o un hover que pasa por varios lomos) va al último, con una sola salida y una sola entrada: lo
 * pedido en el medio sólo cambia el destino. Con movimiento reducido, de una.
 *
 *   quieta    la tira `ancha` muestra su contenido
 *   saliendo  el contenido de la `ancha` se apaga (`salidaS`)
 *   abriendo  la `ancha` pasa a ser el destino: los anchos se reacomodan (`aperturaS`, el `duration-500` de la tira)
 *   respiro   las tiras quietas y vacías (`respiroS`)
 */

export const TRANSICION = { salidaS: 0.2, aperturaS: 0.5, respiroS: 0.2 } as const

export type FaseDeLaTransicion = 'quieta' | 'saliendo' | 'abriendo' | 'respiro'

export interface TransicionDeLasTiras {
  readonly fase: FaseDeLaTransicion
  /** La tira abierta (la ancha). */
  readonly ancha: number
  /** La tira pedida (adonde va). */
  readonly destino: number
}

export const quietaEn = (tira: number): TransicionDeLasTiras => ({ fase: 'quieta', ancha: tira, destino: tira })

/** Se pide otra tira. */
export function pedirTira(t: TransicionDeLasTiras, pedida: number, reducido: boolean): TransicionDeLasTiras {
  if (reducido) return quietaEn(pedida)
  switch (t.fase) {
    case 'quieta':
      return pedida === t.ancha ? t : { fase: 'saliendo', ancha: t.ancha, destino: pedida }
    case 'saliendo':
      // Se vuelve a la que se estaba yendo: su contenido entra otra vez; si no, sólo cambia el destino (una sola salida).
      return pedida === t.ancha ? quietaEn(pedida) : { ...t, destino: pedida }
    case 'abriendo':
    case 'respiro':
      // El contenido ya se fue: se reacomoda hacia la nueva (una sola entrada, la del último).
      return pedida === t.ancha ? t : { fase: 'abriendo', ancha: pedida, destino: pedida }
  }
}

/** Cuánto dura la fase de ahora (s); la quieta no termina. */
export function duracionDeLaFase(f: FaseDeLaTransicion): number | null {
  return f === 'saliendo' ? TRANSICION.salidaS : f === 'abriendo' ? TRANSICION.aperturaS : f === 'respiro' ? TRANSICION.respiroS : null
}

/** Terminó la fase de ahora: la que sigue. */
export function avanzarTransicion(t: TransicionDeLasTiras): TransicionDeLasTiras {
  switch (t.fase) {
    case 'saliendo':
      return { fase: 'abriendo', ancha: t.destino, destino: t.destino }
    case 'abriendo':
      return { ...t, fase: 'respiro' }
    case 'respiro':
      return quietaEn(t.destino)
    case 'quieta':
      return t
  }
}

/** Si el contenido de la tira `i` se muestra (su secuencia entra): sólo la ancha, quieta. */
export const muestraSuContenido = (t: TransicionDeLasTiras, i: number): boolean => t.fase === 'quieta' && t.ancha === i

/**
 * [C2 · 40] Si se ve el póster chico de la tira i (el del lomo): en los lomos y, en la tira que se va, YA durante la salida (el contenido
 * se desvanece hacia su póster y recién después se comprime). La ancha que se abre lo apaga mientras se abre; quieta, no lo tiene.
 */
export const muestraElPoster = (t: TransicionDeLasTiras, i: number): boolean => t.ancha !== i || t.fase === 'saliendo'
