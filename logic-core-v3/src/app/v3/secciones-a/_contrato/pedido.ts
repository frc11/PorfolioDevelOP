/**
 * EL PEDIDO — lo que falta, dicho por el propio contenido.
 *
 * ── Por qué un marcador no alcanza ────────────────────────────────────────
 *
 * Los marcadores (`[CIFRA]`, `[FOTO DEL EQUIPO]`) cubren lo que se ve como un
 * agujero: una casilla vacía en la pantalla. Pero hay una segunda clase de
 * contenido provisional que **no se ve como agujero y es igual de provisional**:
 * la prosa de relleno. Una bajada de dos líneas con la longitud y la estructura
 * retóricas correctas es imprescindible para poder juzgar la composición, y a la
 * vez no es el texto definitivo — sólo que, a diferencia de una casilla vacía,
 * se lee exactamente igual que si lo fuera.
 *
 * Es el mismo mecanismo de la deuda que este sprint no repite, aplicado a las
 * palabras en vez de a los números: **lo provisional que parece terminado se
 * publica sin que nadie se acuerde**.
 *
 * ── La salida: se declara, y la declaración se verifica ────────────────────
 *
 * Cada sección exporta, al lado de su contenido, la lista de las rutas cuyo
 * texto es relleno. No es una nota al pie: es un dato, y el instrumento afirma
 * que **cada ruta declarada existe de verdad en el contenido**. Una entrada que
 * apunte a un campo que se renombró o se borró hace fallar la comprobación, que
 * es lo que impide que el pedido se quede viejo mientras parece completo.
 *
 * El sentido inverso —prosa provisional que nadie declaró— no lo puede ver
 * ningún instrumento: no hay forma de distinguir una frase definitiva de una
 * provisional leyéndola. Eso queda en la disciplina de quien escribe la sección
 * y en la revisión humana, y se dice acá para que no se lea como cubierto.
 */

import { textosDe } from './marcadores'

/** Qué clase de cosa falta. Cerrado: el pedido se agrupa por esto. */
export const CLASES_DE_PEDIDO = ['cifra', 'metrica', 'foto', 'captura', 'testimonio', 'prosa'] as const

export type ClaseDePedido = (typeof CLASES_DE_PEDIDO)[number]

export interface EntradaDePedido {
  /**
   * La ruta dentro del contenido, en el mismo idioma que produce `textosDe`:
   * `proyectos[0].nombre`. El instrumento la resuelve contra el objeto real.
   */
  readonly ruta: string
  readonly clase: ClaseDePedido
  /** Qué hay que traer, en una línea, dicho para Franco y no para un programador. */
  readonly que: string
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
