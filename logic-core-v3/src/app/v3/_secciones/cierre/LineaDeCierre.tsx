import { Logotipo, PrefijoDeServicio, Separador } from '../../_componentes/marca/Marca'
import { Caption, Micro } from '../../_componentes/tipografia/Textos'

import { LINEA_DE_CIERRE } from './contenido'

/**
 * La última línea del documento. Fecha, razón social y legales no existen y no
 * se inventan: van con su marcador y con la nota que dice qué entra ahí.
 *
 * `opacity-casi` sobre la tinta y no `text-tinta-tenue`: los tokens de tinta
 * secundaria NO se redefinen en `[data-seccion="invertida"]`, así que sobre el
 * fondo oscuro quedan gris medio sobre casi negro. La opacidad, en cambio, se
 * da vuelta con la tinta. El instrumento publica las dos razones de contraste.
 *
 * ═══ B4-A · ACÁ SE MONTA LA MARCA EN SUS TRES REGISTROS ═══════════════════
 *
 * Es la superficie donde el logotipo YA estaba —la única del home que lo tenía—
 * y por eso es donde el sistema entra entero: **prefijo · logotipo │ lo que
 * sigue**, el conjunto del diagnóstico de Franco y no el símbolo suelto.
 *
 * ⚠️ **Y arregla un defecto que estaba en pantalla.** La marca viajaba como
 * TEXTO adentro de un `Caption` con `uppercase`, así que el pie decía
 * **«DEVELOP»**: la caja alta se comía la única forma que este logotipo tiene
 * —la `d` minúscula y el `OP` en mayúscula—. Está en `pie-1920-antes.png`. La
 * pieza trae la palabra sin transformar y `normal-case` la protege de la
 * herencia; que sea una pieza y no una cadena es lo que lo cierra.
 *
 * El prefijo va como RELLENO en `--color-acento` —sobre la invertida el acento
 * da 2,71 · 2,99 · 2,46 y no llega ni a 3:1 como texto— y el separador es la
 * regla de 1px del sistema. ⚠ Se componen sueltas y no con `MarcaLockup` por
 * una medida: el lockup fija `text-cuerpo` para la continuación y esta línea es
 * un `Caption`; montarlo cambiaría el tamaño del último renglón del documento.
 */
export function LineaDeCierre(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-[var(--spacing-1)]">
      {/* ⚠ La continuación va en su propio `<span>` y no como texto suelto del
          `<p>`. Es marcado, no estilo: `s10-acceso` cuenta los marcadores
          anunciados **sólo en las hojas** —para no contarlos dos veces— así que
          un nodo con una etiqueta adentro Y texto propio pierde su texto. Con
          los tres marcadores del pie en su propia hoja el censo los sigue
          viendo. El punto ciego del detector queda REPORTADO, no arreglado: es
          de otro sprint. */}
      <Caption como="p" className="flex flex-wrap items-center gap-[var(--spacing-2)] font-codigo uppercase">
        <PrefijoDeServicio />
        <Logotipo className="normal-case" />
        <Separador />
        <span data-parte="continuacion">{LINEA_DE_CIERRE.piezas.join(' · ')}</span>
      </Caption>
      {/* ⚠️ B12 · A TINTA PLENA: el pie dejó de pintar su propio fondo, así que
          debajo hay sala y el peor píxel manda. Medido en la pose: 2,78:1 al 0,6
          contra 4,97:1 a plena (1920). Misma decisión que la nota de contacto. */}
      <Micro como="p" className="uppercase">
        {LINEA_DE_CIERRE.nota}
      </Micro>
    </div>
  )
}
