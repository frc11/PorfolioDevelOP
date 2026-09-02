/**
 * EL PEDIDO — lo que falta, declarado sección por sección.
 *
 * ── Por qué un marcador no alcanza ────────────────────────────────────────
 *
 * Los marcadores (`[CIFRA]`, `[FOTO DEL EQUIPO]`) cubren lo que se ve como un
 * agujero: una casilla vacía en la pantalla. Pero hay una segunda clase de
 * contenido provisional que **no se ve como agujero y es igual de provisional**:
 * la prosa de relleno. Una bajada de dos líneas con la longitud y la estructura
 * retórica correctas es imprescindible para poder juzgar la composición, y a la
 * vez no es el texto definitivo — sólo que, a diferencia de una casilla vacía,
 * se lee exactamente igual que si lo fuera.
 *
 * Es el mismo mecanismo de la deuda que este proyecto no repite, aplicado a las
 * palabras en vez de a los números: **lo provisional que parece terminado se
 * publica sin que nadie se acuerde**.
 *
 * ── Y por qué un marcador tampoco alcanza para PEDIRLO ────────────────────
 *
 * `[CIFRA]` en la pantalla dice que falta un número. No dice **cuál**, ni en
 * qué archivo se edita, ni en qué formato entra. Eso es la diferencia entre un
 * agujero y un pedido, y es lo que `CONTENIDO-PENDIENTE.md` tiene que poder
 * decir sin que nadie abra el código.
 *
 * Por eso cada entrada lleva las tres cosas que la instrucción pide:
 *
 *   · **qué dato es** → `que`, escrito para Franco y no para un programador;
 *   · **en qué archivo se edita** → NO se escribe acá: sale del registro
 *     (`archivoDeContenido`), porque una ruta escrita a mano en veintitantas
 *     entradas se desactualiza en la primera mudanza — ésta acaba de pasar;
 *   · **qué formato espera** → `formato`.
 *
 * ── La declaración se verifica, no se cree ────────────────────────────────
 *
 * `s7-pedido` cruza estas tablas contra el TEXTO RENDERIZADO de las ocho:
 *
 *   · un marcador que se ve en pantalla y no está pedido acá → falla;
 *   · una entrada que pide un marcador que ya no se ve → falla.
 *
 * Las dos direcciones hacen falta. La primera impide que entre un agujero sin
 * pedido; la segunda impide que el pedido se quede viejo mientras parece
 * completo, que es el modo de falla que ninguna revisión encuentra.
 *
 * El sentido inverso para la PROSA —texto provisional que nadie declaró— no lo
 * puede ver ningún instrumento: no hay forma de distinguir una frase definitiva
 * de una provisional leyéndola. Eso queda en la disciplina de quien escribe la
 * sección y en la revisión humana, y se dice acá para que no se lea como
 * cubierto.
 */

import type { Marcador } from './marcadores'
import { textosDe } from './marcadores'

/** Qué clase de cosa falta. Cerrado: el pedido se agrupa por esto. */
export const CLASES_DE_PEDIDO = [
  'cifra',
  'metrica',
  'foto',
  'captura',
  'video',
  'testimonio',
  'enlace',
  'prosa',
] as const

export type ClaseDePedido = (typeof CLASES_DE_PEDIDO)[number]

/**
 * QUIÉN LO TIENE QUE TRAER. Cerrado, y con tres miembros porque son tres cosas
 * distintas de hacer, no tres personas.
 *
 * ── Por qué el pedido no alcanzaba sin esto ───────────────────────────────
 *
 * `CONTENIDO-PENDIENTE.md` decía qué falta, dónde se edita y en qué formato
 * entra — y no decía **a quién pedírselo**. Una lista de cuarenta y nueve cosas
 * sin dueño se lee entera y no se empieza por ningún lado: quien la abre tiene
 * que volver a decidir, ítem por ítem, si eso lo consigue él o lo tiene que
 * pedir. El dueño es lo que convierte la lista en tres listas cortas.
 *
 * Y va como DATO, al lado de cada entrada, por la misma razón que el formato:
 * una tabla de dueños escrita aparte se desincroniza en el primer pedido nuevo.
 *
 *   · `franco`     — lo tiene Franco o se lo tiene que pedir a un cliente:
 *                    cifras de la operación, permisos, testimonios, los datos
 *                    que sólo el negocio del cliente conoce.
 *   · `valentino`  — sale de acá adentro: una captura, un video, un archivo, o
 *                    el copy definitivo.
 *   · `decision`   — no hay nada que traer. Hay que decidir algo —si la casilla
 *                    va o no va, si la razón social figura, a qué canal empuja
 *                    el contacto— y recién después queda un dato que buscar.
 */
export const QUIENES_TRAEN = ['franco', 'valentino', 'decision'] as const

export type QuienLoTrae = (typeof QUIENES_TRAEN)[number]

/** Cómo se llama cada dueño en el documento. Acá, y no en el generador: el
 *  rótulo es parte de la definición del miembro, no de cómo se imprime. */
export const ROTULO_DE_QUIEN: Readonly<Record<QuienLoTrae, string>> = {
  franco: 'Franco (o un cliente)',
  valentino: 'Valentino',
  decision: 'Una decisión, antes que un dato',
}

export interface EntradaDePedido {
  /**
   * Dónde se edita, dentro del archivo de contenido de la sección.
   *
   * Para las secciones cuyo contenido es UN objeto, es la ruta en el idioma que
   * produce `textosDe`: `proyectos[0].nombre`. Para las que exportan constantes
   * sueltas, es el nombre de la constante. En el primer caso el instrumento la
   * resuelve contra el objeto real y una ruta colgada hace fallar.
   */
  readonly ruta: string
  readonly clase: ClaseDePedido
  /**
   * El marcador visible que ocupa el lugar, o `null` cuando lo provisional es
   * prosa y no se ve como agujero.
   */
  readonly marcador: Marcador | null
  /** A quién se le pide. Obligatorio: sin dueño, la lista no se puede repartir. */
  readonly quienLoTrae: QuienLoTrae
  /** Qué hay que traer, en una línea, dicho para Franco y no para un programador. */
  readonly que: string
  /** En qué formato entra: unidades, longitud, tamaño de archivo, forma. */
  readonly formato: string
}

/** Las rutas de texto que existen de verdad en un contenido. */
export function rutasDeTexto(contenido: unknown): string[] {
  return textosDe(contenido).map((h) => h.ruta)
}

/**
 * Las entradas del pedido que apuntan a una ruta que no existe.
 *
 * Devuelve la lista y no un booleano para que el instrumento pueda nombrarlas:
 * "el pedido tiene 2 entradas colgadas" no dice cuáles.
 */
export function entradasColgadas(
  contenido: unknown,
  pedido: readonly EntradaDePedido[],
): EntradaDePedido[] {
  const rutas = new Set(rutasDeTexto(contenido))
  return pedido.filter((e) => !rutas.has(e.ruta))
}

/** El pedido agrupado por clase, para el informe. */
export function pedidoPorClase(
  pedido: readonly EntradaDePedido[],
): Map<ClaseDePedido, EntradaDePedido[]> {
  const salida = new Map<ClaseDePedido, EntradaDePedido[]>()
  for (const entrada of pedido) {
    const lista = salida.get(entrada.clase)
    if (lista === undefined) salida.set(entrada.clase, [entrada])
    else lista.push(entrada)
  }
  return salida
}

/**
 * El pedido agrupado por dueño, en el orden declarado de `QUIENES_TRAEN` y no
 * en el de aparición: el documento tiene que listar los tres siempre igual, y
 * un dueño sin entradas tiene que salir con cero y no desaparecer — un bucket
 * vacío que no se imprime se lee como que no existe.
 */
export function pedidoPorQuien(
  pedido: readonly EntradaDePedido[],
): Map<QuienLoTrae, EntradaDePedido[]> {
  const salida = new Map<QuienLoTrae, EntradaDePedido[]>(QUIENES_TRAEN.map((q) => [q, []]))
  for (const entrada of pedido) salida.get(entrada.quienLoTrae)?.push(entrada)
  return salida
}

/** Los marcadores distintos que un pedido nombra, sin repetir y en orden. */
export function marcadoresDelPedido(pedido: readonly EntradaDePedido[]): Marcador[] {
  const vistos: Marcador[] = []
  for (const e of pedido) {
    if (e.marcador !== null && !vistos.includes(e.marcador)) vistos.push(e.marcador)
  }
  return vistos
}
