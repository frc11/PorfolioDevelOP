/**
 * ACOTAR A `[0, 1]` — cuatro líneas, y viven fuera de `_lib/motion/` por una
 * razón de EMPAQUETADO, no de estilo.
 *
 * ── Por qué se mudó acá (SITIO-S7) ────────────────────────────────────────
 *
 * Estaba en `_lib/motion/anclas.ts`, que es el archivo donde vive la geometría
 * del scroll. Ahí tiene todo el sentido del mundo salvo uno: la matemática de
 * la SECUENCIA de Servicios —repartir un progreso en tramos iguales— también la
 * necesita, y esa matemática corre en el árbol QUIETO, el que se sirve abajo de
 * 1025 y no puede importar una línea del sistema de motion.
 *
 * Importar `anclas.ts` sólo por esta función habría arrastrado el módulo entero
 * a la carga inicial de `/v3`, con sus anclas medidas adentro — y una de las
 * cinco huellas que `test:s2-bundle` busca vive justamente ahí. O sea que un
 * `clamp` de cuatro líneas habría roto la compuerta.
 *
 * ⚠ Este comentario NO escribe la huella. Un archivo del árbol quieto que
 * mencionara la cadena literal la metería en el fuente que el instrumento
 * escanea: el minificador la borraría del build, pero cualquier comprobación
 * sobre el CÓDIGO la encontraría. Es el mismo modo de falla que este proyecto
 * ya cazó tres veces — un instrumento que se mide a sí mismo.
 *
 * Las dos alternativas eran peores: copiarla deja dos fuentes de la misma
 * función, y dejarla donde estaba obligaba a duplicar la secuencia. Mudarla no
 * cambia ni un comportamiento —`anclas.ts` la sigue usando, importada de acá— y
 * saca un átomo genérico de un módulo que no lo es.
 */

/** Acota a `[0, 1]`. El progreso entra acotado a todo lo que sigue. */
export function acotar01(n: number): number {
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}
