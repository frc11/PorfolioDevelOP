/**
 * LA GEOMETRÍA DE TRABAJOS — todos los números de la sección, juntos.
 *
 * ── Por qué vive en su propio archivo (B1) ────────────────────────────────
 *
 * Porque `Trabajos.tsx` pasó las 300 líneas y la regla del proyecto es que se
 * parte, no que se afloja. El corte no es por tamaño: es el mismo que Servicios
 * ya tiene (`servicios/geometria.ts`) y separa **los números de la sección** de
 * **su composición**. Quien cambia una medida entra acá; quien cambia el orden
 * de las piezas entra al componente.
 *
 * Están acá y no en `contenido.ts` porque son técnicos: los decide quien
 * construye la sección y no cambian el día que lleguen las capturas. Mezclarlos
 * con el contenido obligaría a exceptuarlos del escáner de cifras, y una
 * excepción es por donde vuelve a entrar la primera cifra inventada.
 */

import { acotar01 } from '../../_lib/acotar'
import { sizesPorColumnas } from '../../_lib/imagen'

import type { CajaDeLaCaptura } from './Proyecto'

/**
 * LA GEOMETRÍA — todos los números de la sección, juntos y fuera del contenido.
 *
 * Están acá y no en `contenido.ts` porque son técnicos: los decide quien
 * construye la sección y no cambian el día que lleguen las capturas. Mezclarlos
 * con el contenido obligaría a exceptuarlos del escáner de cifras, y una
 * excepción es por donde vuelve a entrar la primera cifra inventada.
 */
export const GEOMETRIA = {
  captura: {
    /**
     * 1920 × 1080, o sea **16:9** — [MEDIDO SOBRE LOS ARCHIVOS, V3-D].
     *
     * Decía `1600 × 800` (2:1) con un buen argumento —el pliegue, y que tres
     * cajas 2:1 apiladas miden menos— **y las capturas llegaron en 16:9**. Con
     * la relación declarada distinta de la del archivo, el navegador reserva
     * 2:1, carga 16:9 y la caja CRECE: el salto de layout que declarar las
     * dimensiones existe para evitar, producido por la declaración misma. Tiene
     * que ser la del archivo, y el invariante lo comprueba abriéndolos.
     *
     * **No se recorta a 2:1**: recortar una captura le saca justo la parte que
     * prueba que el sitio existe entero — en la de Esquina, los 120 px que
     * sobran llevan el pie con el crédito. 1920 es el ARCHIVO, no una caja.
     */
    ancho: 1920,
    alto: 1080,
    /**
     * LA CAJA DEL PLANO, EN COLUMNAS DE LA GRILLA DEL ESCENARIO. **[B1 · medido]**
     *
     * ⚠ CORREGIDO EN B1, con el número que lo fuerza. Decía `tercio: 33` porque
     * el plano ocupaba UNA columna de tres: 597 px a 1920, o sea una tarjeta de
     * **394 px de alto** adentro de una pantalla pinneada que le deja **825 px**
     * libres debajo del marco. Sobre el píxel, eso son **463 px** de banda vacía
     * en el frame de plena opacidad — cuatro veces y media el techo del bloque.
     *
     * Con **2 de 3 columnas** —1232 px de ancho, 736 de alto— la banda de abajo
     * cae a **121 px**. No llega a los 104 y queda reportado: la tarjeta es 16:9
     * con 43 px de nombre y métrica, así que comerse esos 121 pediría 4 de 5
     * columnas (876 px de alto) y eso se corta 19 px abajo del viewport. Se
     * prefiere una banda medida a un recorte.
     *
     * ⚠ **Y por eso el `sizes` ya no describe las DOS ramas.** La animada —la
     * que recibe todo el mundo salvo quien pidió menos movimiento— muestra 2 de
     * 3; la quieta sigue mostrando las tres en fila, o sea 1 de 3. El `sizes` es
     * uno y describe una caja: se declara la de la rama ANIMADA, y la quieta de
     * escritorio baja una imagen del doble de lo que necesita. Sobre-pedir cuesta
     * bytes; sub-pedir sirve una captura borrosa a la mayoría.
     */
    columnasDelPlano: 2,
    columnasDeLaGrilla: 3,
    completo: 100,
  },
  /**
   * Cuántos planos anima el patrón. Es lo que define el escalonado real de P7 y
   * tiene que coincidir con la cantidad de proyectos del contenido: el
   * invariante lo afirma, con su control positivo. Declararlo acá y no leerlo
   * del contenido es lo que hace que la coincidencia sea COMPROBABLE en vez de
   * cierta por construcción.
   */
  planos: 3,
} as const

/**
 * EL REPARTO DE LOS TRES PLANOS SOBRE EL RECORRIDO. **[B2 · frente B]**
 *
 * ── El defecto, medido en el navegador ────────────────────────────────────
 *
 * Los tres planos se consumían con `cantidad = 3` e `indice = i`, o sea con el
 * ESCALONADO de P7 haciendo el reparto: 0,4 s de desfase sobre 3,5 s de
 * duración dan un total aplicado de 4,3 y tres ventanas de
 * `[0 · 0,814]`, `[0,093 · 0,907]` y `[0,186 · 1]` — **más del 80 % de
 * superposición**. Los tres vuelan a la vez de punta a punta y ninguno tiene un
 * lugar propio del scroll.
 *
 * El censo de acontecimientos de `B2-DELTAS.md` §0, a 1920×1080 sobre la página
 * viva, barriendo `[7440, 12000]`:
 *
 *     acontecimientos: 2
 *     grupos: 10200 (1 pieza) · 10560–10800 (2 piezas)
 *
 * o sea que **el primer aterrizaje de la sección caía 1.560 px después de que
 * la sección empieza**, y los tres caían amontonados en las últimas seis
 * décimas de pantalla del recorrido. Ésa es la segunda mitad del pozo de 5,44
 * pantallas del documento.
 *
 * ── El reparto nuevo, y de dónde sale ─────────────────────────────────────
 *
 * El recorrido se parte en **tres tramos iguales, uno por plano**, con la misma
 * cuenta que `_contrato/secuencia.ts` hace para Servicios: el plano `i` vale 0
 * antes de su tramo, corre de 0 a 1 adentro, y se queda en 1 después. Cada
 * plano llega, pasa y deja el lugar al siguiente en SU tercio del scroll.
 *
 * **El escalonado de P7 no se cambia: se apaga por donde ya estaba previsto.**
 * Cada plano se consume con `cantidad = 1`, y ahí el cronograma aplica el
 * escalonado sobre `cantidad − 1 = 0` — exactamente lo que le pasa a P2 en
 * Números, y por la misma razón: **el reparto pasa a ser del scroll y no del
 * cronograma.** Ni una clave, ni una curva, ni una duración de P7 se toca.
 *
 * ⚠ **Por qué el recorrido entero y no sólo el pin.** El ancla de P7 es
 * `top bottom → bottom bottom` sobre la `<section>` —lo fijó B1 con
 * `anclaje: 'seccion'`— así que el gesto arranca cuando la sección entra por el
 * pie del viewport y cierra cuando el pin suelta. Remapearlo al pin sería
 * pisar un ancla medida por la puerta de atrás.
 *
 * ⚠ **LO QUE ESTO NO PUEDE DAR, Y SE REPORTA: la meseta.** Para que cada
 * proyecto *se quede quieto* —el asentamiento que el frente C le construyó a
 * Servicios— el progreso local tendría que saturar donde TERMINA la llegada de
 * P7, que es `3 / 3,5` de su ventana. Ese número vive en
 * `_lib/motion/patrones-piezas.ts` y **una sección no puede importar un valor
 * del sistema de motion** (`s7-contrato` §3), ni escribirlo acá, que sería una
 * segunda fuente de un valor medido. Sin la meseta, lo que el censo registra de
 * cada plano es el final de su SALIDA. Queda reportado, no arreglado.
 */
export function localDelPlano(progreso: number, indice: number): number {
  return acotar01(acotar01(progreso) * GEOMETRIA.planos - indice)
}

/** Los puntos del recorrido donde cada plano termina el suyo: 1/3, 2/3 y 1. Es
 *  lo que el censo mide como aterrizaje, y lo que el invariante compara. */
export const ATERRIZAJES_DE_LOS_PLANOS: readonly number[] = Array.from(
  { length: GEOMETRIA.planos },
  (_, i) => (i + 1) / GEOMETRIA.planos,
)

/** El `sizes` real de las capturas. Exportado para que el instrumento afirme el
 *  MISMO valor que se le pasa al marco, y no una copia escrita a mano. */
export const SIZES_DE_LA_CAPTURA = sizesPorColumnas(
  GEOMETRIA.captura.columnasDelPlano,
  GEOMETRIA.captura.columnasDeLaGrilla,
  GEOMETRIA.captura.completo,
)

/** La caja de la captura, en un solo objeto: es lo que `Proyecto` recibe para
 *  no tener que importar la geometría de vuelta y cerrar un ciclo. */
export const CAJA_DE_LA_CAPTURA: CajaDeLaCaptura = {
  ancho: GEOMETRIA.captura.ancho,
  alto: GEOMETRIA.captura.alto,
  sizes: SIZES_DE_LA_CAPTURA,
}
