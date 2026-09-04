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
