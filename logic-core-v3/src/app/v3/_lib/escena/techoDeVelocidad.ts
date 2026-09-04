/**
 * EL TECHO DE VELOCIDAD DE LA CÁMARA — el arreglo de B2 §0.2, en un número.
 *
 * ⚠ **ESTE ARCHIVO ES DEL RECORRIDO, NO DE LA ESCENA.** Vive al lado de
 * `recorrido.ts` y de `anclaje.ts` porque es de la misma naturaleza que ellos
 * —cómo se reparte el recorrido sobre el scroll— y NO de la naturaleza del
 * resto de `_lib/escena/`, que es qué hay adentro de la sala. Está en su propio
 * módulo y no adentro de `recorrido.ts` por la regla de las 300 líneas del
 * repo: con este docblock, aquel archivo pasaba a 317.
 */

/**
 * EL TECHO DE VELOCIDAD DE LA CÁMARA — **una altura de cuadro por pantalla de
 * scroll**. (B2 §0.2)
 *
 * ── De dónde sale, y por qué NO sale de una pose ───────────────────────────
 *
 * De la queja del humano: *«el fondo avanza demasiado rápido cuando yo todavía
 * no llegué a esa zona»*. Puesta en número (`B2-DELTAS.md` §2): al llegar a
 * `por-que-develop` —la única sección, junto al hero, donde la sala se ve— la
 * cámara **ya recorrió el 96,8 % de su camino**, y llega al 90 % de cada tramo
 * hasta **1.644 px antes** de que el visitante llegue al final de ese tramo.
 *
 * ⚠ **La unidad es la PANTALLA y no el progreso, y eso es la mitad del arreglo.**
 * `s13b-soporte.ts` ya lo dejó escrito: el humano no controla el progreso,
 * controla el SCROLL, y cada tramo reparte su progreso sobre una cantidad
 * distinta de pantallas. Un techo sobre la pose sería acortar el recorrido de la
 * cámara —o sea tocar la coreografía—; un techo sobre la pantalla es **repartir
 * el mismo recorrido sobre más scroll**, que es lo que la instrucción pide con
 * *«un tramo que se pasa se estira; el progreso total no cambia»*.
 *
 * ── EL VALOR, derivado DOS veces de la pantalla ────────────────────────────
 *
 * 1. **El ritmo de la propia página.** Cuando el visitante scrollea una
 *    pantalla, la página se mueve exactamente una pantalla. Una cámara que se
 *    mueve más que eso **se le adelanta a la página que la tapa**, que es la
 *    queja, literal. → `1,0` altura de cuadro por pantalla de scroll.
 * 2. **El ritmo parejo de nuestro propio recorrido.** El arco entero de la
 *    cámara mide **12,29 alturas de cuadro** —integrado con `speedAt`, el mismo
 *    instrumento de `s13b`— y repartido parejo sobre **las 13 pantallas de
 *    scroll que la tabla declaraba cuando este techo se eligió** da **0,9451**.
 *    ⚠ Aplicar el techo estiró el documento, así que hoy ese promedio es más
 *    chico: la corroboración es del momento de decidir, y lo que el invariante
 *    custodia de acá en adelante es la desigualdad —el promedio por debajo del
 *    techo—, que es la que dice que el techo es alcanzable.
 *
 * Las dos derivaciones caen a **5,8 % una de otra**, y el techo toma la más
 * floja de las dos, que es la redonda. No es un número elegido: es el único
 * valor que las dos derivaciones sostienen a la vez.
 *
 * ⚠ **Lo custodia `b2-techo.invariant.ts`**, que integra el arco de cada
 * segmento y compara. Dos segmentos NO lo cumplen y los dos están declarados
 * ahí con la razón que los traba: no se aflojó el techo para que den verde.
 */
export const TECHO_DE_VELOCIDAD = 1
