/**
 * ROCE-1 · EL BANCO DEL CORRIMIENTO VERTICAL — lo compartido entre el barrido y
 * la medición final.
 *
 * ── Qué pregunta contesta este banco, y por qué no lo contesta ninguno ─────
 *
 * TAPADO-1 mide la superposición **en la posición que el bloque tiene**.
 * COMPO-2 barrió el TAMAÑO del registro 1 y, de paso, midió dos posiciones
 * sueltas (la regla global sola, y el renglón devuelto). Ninguno barrió la
 * POSICIÓN como variable continua, que es lo único que este sprint pide:
 * «bajá el bloque hasta que no roce».
 *
 * ── LA PALANCA: EL RELLENO DE ABAJO, Y NO UN `transform` ──────────────────
 *
 * Con `justify-end`, el borde inferior del bloque queda exactamente a
 * `padding-bottom` del borde inferior del viewport (`min-h-svh` con
 * `box-sizing: border-box`, que es lo que la preflight de Tailwind deja puesto).
 * Bajar el bloque N px es, entonces, `padding-bottom: 80 − N`, y la relación es
 * EXACTA: no hay una constante de proporcionalidad que haya que creerle.
 *
 * ⚠️ **Y no se usa `transform: translateY`, que era la otra forma.** La lección
 * de abril de `CLAUDE.md` es explícita: `getBoundingClientRect()` con una
 * transformada activa devuelve coordenadas que no son las del layout. El banco
 * cruza esos rectángulos con píxeles de una captura; una transformada metería
 * las dos lecturas en sistemas de coordenadas distintos.
 *
 * ⚠️ **El `!important` no es prudencia: es un defecto medido.** `tapado-comun.ts`
 * lo dejó escrito — el árbol de React vuelve a commitear en medio de la medición
 * y pisa cualquier `style` inline.
 *
 * ── LOS DOS TECHOS, y de dónde sale cada uno ──────────────────────────────
 *
 * · **El techo DURO** es el viewport: el bloque no puede pasar el borde de
 *   abajo. Es `padding-bottom: 0`, o sea N = 80 px.
 * · **El techo ÚTIL** es el piso de pie que el repo ya derivó: PAPEL-2 dejó
 *   `max-chico:pb-2` con el argumento de que `80 − 72 = 8` px es el SOBRANTE una
 *   vez descontada la pastilla. Donde la pastilla está apagada, ese 8 es el piso
 *   que el propio árbol declara, así que N = 72 px.
 *
 * A 768 hay **una tercera reserva**: `claseDelAireDelPieEnPortatil` le pone a la
 * grilla un `margin-bottom` de `--text-base × --leading-texto` (25,6 px) que
 * COMPO-2 agregó para devolverle al bloque el renglón que la regla global le
 * sacó. Gastarlo también es posible y se mide, pero **no es lo mismo que gastar
 * el relleno**: ese margen es lo que hoy mantiene al registro 2 fuera de la
 * segunda masa, y por eso el barrido lo publica aparte.
 */

/** El relleno de abajo del hero en los dos anchos de este sprint: `pb-20`. */
export const PIE_HOY_PX = 80
/** El piso de pie que PAPEL-2 derivó para los anchos sin pastilla: `pb-2`. */
export const PISO_DEL_PIE_PX = 8
/** El margen que COMPO-2 le devolvió a la grilla a 768. Sólo existe en esa banda. */
export const MARGEN_DE_768_PX = 25.6

export const SEL_PANTALLA = '[data-pantalla="hero"]'
/** La grilla que cuelga de la pantalla: el elemento que lleva el margen de 768. */
export const SEL_GRILLA = '[data-pantalla="hero"] > div'

/**
 * LA REGLA QUE BAJA EL BLOQUE N px.
 *
 * Los primeros `PIE_HOY_PX − PISO_DEL_PIE_PX` (72) salen del relleno; lo que
 * pase de ahí se le saca al margen de la grilla, que a 768 vale 25,6 y en los
 * demás anchos vale 0 — y ahí un margen negativo es lo que baja el bloque. Las
 * dos reservas se gastan **en ese orden** porque es el orden en el que el árbol
 * las declara: el relleno es del hero y el margen es una compensación puntual.
 */
export function BAJAR(n: number, margenBase: number): string {
  const delRelleno = Math.min(n, PIE_HOY_PX - PISO_DEL_PIE_PX)
  const delMargen = n - delRelleno
  const pie = PIE_HOY_PX - delRelleno
  const margen = margenBase - delMargen
  return `${SEL_PANTALLA}{padding-bottom:${pie.toFixed(3)}px!important}${SEL_GRILLA}{margin-bottom:${margen.toFixed(3)}px!important}`
}

/** El corrimiento que un par (relleno, margen) representa. Se publica para poder
 *  auditar que la regla hizo lo que dice. */
export function corrimientoDe(pie: number, margen: number, margenBase: number): number {
  return PIE_HOY_PX - pie + (margenBase - margen)
}

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/roce'
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/roce'
