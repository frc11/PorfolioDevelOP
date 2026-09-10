import { cn } from '@/lib/utils'

import { PrefijoDeServicio } from '../../_componentes/marca/Marca'
import { Grilla } from '../../_componentes/layout/Grilla'

/**
 * LA MARCA DE UNA SECCIÓN — lo que queda del rótulo cuando el rótulo se va.
 *
 * Salió de `Seccion.tsx` en B4-A, cuando montarle la marca al rótulo pasó ese
 * archivo de 300 líneas. El corte es por tema: allá vive el envoltorio —panel,
 * superficie, alto y pinneo—, acá la superficie de marca que las ocho secciones
 * comparten.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠️ B12 · EL NÚMERO Y EL RÓTULO SE FUERON. LA MARCA Y LA COLUMNA SE QUEDAN.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Pedido del humano, textual: *«sacar los textitos como "quiénes somos" y el
 * número de sección "02", ya que no será necesario ubicarlo así: directamente
 * llega el título con su respectiva sección»*. Se fueron las dos piezas de
 * TEXTO en las ocho: `NumeroDeSeccion` (el `01`) y la `EtiquetaDeSeccion` con
 * el nombre de la sección. **El título de cada sección es ahora lo primero que
 * aparece.**
 *
 * Lo que NO se fue, y las dos razones están medidas:
 *
 * 1. **El PREFIJO DE LA MARCA.** `NumeroDeSeccion` era «la única pieza del
 *    rótulo que las ocho comparten», o sea el único lugar donde el cuadrado de
 *    `--color-acento` aparecía una vez y aparecía siempre (B4-A). Borrarlo con
 *    el número habría sacado la marca de las ocho secciones del sitio, y
 *    `s17-marca.invariant` §5 lo cuenta: *«el PREFIJO aparece al menos una vez
 *    por cada una de las 8 secciones (el rótulo) más el pie»*. La afirmación NO
 *    se aflojó: sigue contando lo mismo, y lo que cambió es de qué pieza sale.
 * 2. **LA COLUMNA LATERAL DE 140 px.** Es una medida de la referencia —140 px
 *    exactos en 92 contenedores— y, más importante, **es la que sostiene el
 *    cierre estructural de B11**: las cuatro deudas del logo se cerraron
 *    poniendo el texto en columnas concretas (c7–c12 en Quiénes somos, c3–c5 la
 *    foto) y esas columnas se cuentan desde el borde de la grilla, no desde el
 *    borde de la pantalla. Sacar la columna correría toda la composición 140 px
 *    + canaleta a la izquierda y **reabriría D-B8.1, D-B8.2 y D-B8.6 sin que
 *    nada se quejara**. La columna se queda; lo que se va es su texto.
 *
 * Con eso, la resta de este sprint sobre la composición es exactamente las DOS
 * líneas de texto de arriba de cada sección, que es lo que se pidió, y no un
 * cambio de grilla que ningún pedido menciona.
 *
 * ── ⚠️ LO QUE SE LLEVÓ EL NÚMERO, Y ESTÁ REESCRITO Y NO BORRADO ───────────
 *
 * El docblock que este archivo tenía publicaba una medición que ya no aplica y
 * que **no se pierde**: el número iba en TINTA PLENA porque a `--opacity-casi`
 * (0,6) daba **4,4043:1** sobre `--color-superficie-3`, por debajo de AA, y ésa
 * era la divergencia entre los dos contratos que S7 resolvió con el número. Sin
 * número no hay tinta que medir, así que la afirmación que la sostenía
 * (`s6-contraste` §—) se reescribe contra la propiedad NUEVA: que ningún
 * archivo del lane monta `RotuloDePanel`. `RotuloDePanel` de
 * `_componentes/Panel.tsx` sigue teniendo el mismo `opacity-casi` y sigue sin
 * renderizarse en `/v3`: eso no cambió.
 */

/**
 * LA MARCA EN LA COLUMNA LATERAL — el cuadrado de `--color-acento`, solo.
 *
 * ⚠ `self-start`: como ítem de grilla este elemento se ESTIRA a la fila, y con
 * `items-center` el cuadrado se iba al medio de una fila de 1000 px — medido a
 * 1920 con el número, que bajaba de y 5 a y 539. Con la caja en su alto natural
 * la marca vuelve arriba y se alinea con el primer renglón de al lado.
 *
 * `aria-hidden` lo trae el propio prefijo: es un registro visual, no un dato, y
 * un lector de pantalla no tiene nada que anunciar acá.
 */
export function MarcaDeSeccion({ className }: { readonly className?: string }): React.JSX.Element {
  return (
    <div data-pieza="marca-de-seccion" className={cn('flex items-center self-start', className)}>
      <PrefijoDeServicio />
    </div>
  )
}

/**
 * LA CABECERA DE UNA SECCIÓN — la columna lateral con la marca, y la fluida con
 * lo que la sección quiera poner (o nada).
 *
 * Era `EncabezadoDeSeccion` y componía el número + separador + nombre. Con las
 * dos piezas de texto afuera, lo único que queda es **reservar la columna
 * lateral**, que es lo que mantiene la composición en su lugar. Se conserva como
 * componente —y no se reemplaza por un `<div>` suelto en cada sección— porque
 * las cuatro que la usaban comparten exactamente esta caja, y una copia por
 * sección serían cuatro oportunidades de que una se desalinee.
 */
export function CabeceraDeSeccion({
  children,
  className,
}: {
  readonly children?: React.ReactNode
  readonly className?: string
}): React.JSX.Element {
  return (
    <Grilla columnas="lateral" className={className}>
      <MarcaDeSeccion />
      {children === undefined ? <div /> : children}
    </Grilla>
  )
}
