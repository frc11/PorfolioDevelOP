/**
 * LA MARCA DEL CHUNK DE LA COREOGRAFÍA DEL HOME.
 *
 * ⚠️ **ESTE ARCHIVO NO PUEDE TENER NADA MÁS ADENTRO, Y ESO LO ENCONTRÓ EL
 * INSTRUMENTO.**
 *
 * La primera versión tenía las DOS marcas —la del árbol animado y la del
 * quieto— en este mismo módulo, porque son dos constantes del mismo tema. El
 * build las delató: la marca del árbol animado apareció en la carga inicial de
 * `/v3` **aunque el código animado no estuviera ahí**. El árbol quieto importa
 * su marca de acá, así que el módulo entero —las dos cadenas— viaja con él.
 *
 * **Una marca que comparte módulo con la marca del otro lado viaja con el otro
 * lado.** El instrumento no se equivocó: la cadena estaba de verdad en el
 * chunk. Lo que estaba mal era el módulo.
 *
 * La regla que queda: **cada marca de chunk vive sola, en un módulo que sólo
 * importa el lado que marca.** Es la misma razón por la que S1 y S2 tienen
 * `marcaEscenario.ts` y `marcaMotion.ts` separados, que hasta ahora parecía
 * prolijidad.
 *
 * ── Por qué una marca y no un nombre de archivo ───────────────────────────
 *
 * Porque lo que hay que poder afirmar es "este código NO viajó en la carga
 * inicial de /v3", y los nombres de archivo del build son hashes que webpack
 * reparte como quiere. Una cadena literal, en cambio, viaja adentro del módulo
 * y aparece en el chunk que lo contenga, se llame como se llame.
 *
 * Es el mismo mecanismo que S1 (`marcaEscenario.ts`) y S2 (`marcaMotion.ts`), y
 * la razón de que sean TRES marcas y no una es que son tres chunks distintos
 * detrás de la misma compuerta y hay que poder pesarlos por separado.
 *
 * ⚠ El valor no se usa para nada más que existir. No se renderiza, no se
 * compara y no configura nada: si alguien la "usara" para algo, la marca
 * pasaría a poder desaparecer por una poda y el instrumento quedaría ciego.
 * Por eso el módulo animado la exporta de vuelta, que es la forma más barata de
 * que ningún minificador la borre.
 */
export const MARCA_COREOGRAFIA_DEL_HOME = 'v3-coreografia-del-home-2026-08-30'
