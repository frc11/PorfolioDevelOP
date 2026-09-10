import { Micro } from '../../_componentes/tipografia/Textos'

import { CONTENIDO_INVENTADO } from './llave'

/**
 * ⚠️ LA MARCA DE LA LLAVE — la franja que dice, en pantalla, que lo que se ve
 * abajo tiene cifras falsas.
 *
 * ── Por qué existe, y por qué no alcanza con el aviso del build ───────────
 *
 * El `prebuild` impide que esto se PUBLIQUE. Esta franja impide otra cosa
 * distinta y más callada: que alguien mire una captura, un video de la pantalla
 * o la pestaña de al lado y **crea que los números son datos**. La instrucción
 * lo pide con esas palabras —«algo que no se pueda confundir con el sitio
 * terminado»— y es la mitad humana del mecanismo: el build cuida el deploy, la
 * franja cuida a quien mira.
 *
 * ── Las cuatro decisiones de esta pieza ───────────────────────────────────
 *
 *   1. **Devuelve `null` con la llave apagada.** No hay un `hidden`, no hay un
 *      `display: none`: no existe. Es la misma regla que el resto de §4 —
 *      apagar la llave devuelve el sitio a lo que era.
 *   2. **`fixed`, y `pointer-events-none`.** No suma alto de documento y no
 *      tapa un clic. El anclaje de la escena sale de
 *      `document.documentElement.scrollHeight` y el progreso con él: una franja
 *      en el flujo movería las catorce pantallas del recorrido y ningún
 *      instrumento del lane lo vería como lo que es.
 *   3. **Arriba, no abajo.** Abajo, a `100svh − 72px`, vive la pastilla de
 *      navegación. Compartir borde sería tapar el chrome real con un aviso.
 *   4. **Tinta plena sobre papel invertido** —`bg-tinta text-fondo`, 17,60:1—,
 *      en la familia monoespaciada. Es el único bloque del sitio que se pinta
 *      así: se lee como lo que es, un cartel de obra, y no como una pieza de la
 *      composición. Sin color, que es regla del bloque.
 *
 * ── El parámetro `llave` ──────────────────────────────────────────────────
 *
 * Igual que en `conLlave()`: por defecto lee la constante, y el invariante le
 * pasa las dos ramas para comprobar en la misma corrida que prendida se ve y
 * apagada no existe. Una marca que sólo se puede mirar no es una marca
 * comprobada.
 */
export function MarcaDeLaLlave({
  llave = CONTENIDO_INVENTADO,
}: {
  readonly llave?: boolean
} = {}): React.JSX.Element | null {
  if (!llave) return null

  return (
    <div
      data-pieza="marca-de-la-llave"
      className="bg-tinta text-fondo pointer-events-none fixed inset-x-0 top-0 z-[var(--z-cabecera)] px-[var(--spacing-4)] py-[var(--spacing-2)]"
    >
      <Micro como="p" peso="medio" interletrado="micro" className="font-codigo text-center uppercase">
        Contenido inventado — las cifras, las métricas y el testimonio de esta página son falsos y
        están detrás de una llave. No es el sitio terminado.
      </Micro>
    </div>
  )
}
