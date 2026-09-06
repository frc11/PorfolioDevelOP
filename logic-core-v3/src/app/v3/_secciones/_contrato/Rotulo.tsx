import { cn } from '@/lib/utils'

import { PrefijoDeServicio, Separador } from '../../_componentes/marca/Marca'
import { EtiquetaDeSeccion, Micro } from '../../_componentes/tipografia/Textos'
import type { Seccion as EntradaDeSeccion } from '../../_lib/secciones'

/**
 * EL RÓTULO DE UNA SECCIÓN — el número, la etiqueta, y la MARCA.
 *
 * Salió de `Seccion.tsx` en B4-A, cuando montarle la marca al rótulo pasó ese
 * archivo de 300 líneas. El corte es por tema: allá vive el envoltorio —panel,
 * superficie, alto y pinneo—, acá el rótulo, que es la superficie de marca que
 * las ocho secciones comparten.
 */

/**
 * EL NÚMERO DE LA SECCIÓN — el `01` de la columna lateral de 140px.
 *
 * ── Por qué este dígito sí, y no contradice la regla del contenido ────────
 *
 * Porque **no es un dato del negocio**: es el índice de la sección en el
 * recorrido, sale de `secciones.ts` y no de un `contenido.ts`, y no se puede
 * leer como un hecho sobre develOP. La regla dura prohíbe inventar cifras que
 * se lean como medidas; un ordinal de navegación no es una de ésas.
 *
 * Es además la pieza medida: la columna lateral mide 140px exactos en 92
 * contenedores de la referencia, y ahí es donde vive el número.
 *
 * ── ⚠️ EL NÚMERO VA EN TINTA PLENA, Y NO ES ESTÉTICA ─────────────────────
 *
 * **Es la divergencia entre los dos contratos con la respuesta medida.** El
 * lane A lo pintaba a `--opacity-casi` (0,6), copiando `RotuloDePanel` de S1; el
 * lane B lo midió y lo dejó en tinta plena. **Gana el lane B, con el número:**
 * la tinta al 60 % compuesta sobre `--color-superficie-3` da **4,4043:1**, por
 * debajo de AA (4,5:1). Sobre el papel sí pasa —4,83:1— así que el defecto sólo
 * aparece en un panel `papel-transparente`… que es exactamente la superficie
 * del Hero y de Por qué develOP.
 *
 * O sea que no era una diferencia de gusto entre dos lanes: **el número del
 * Hero del lane A estaba abajo de AA**, y sólo se vio al juntar su versión del
 * rótulo con su propio recorrido de superficies.
 *
 * Bajar la opacidad empeora (menos alfa = más fondo claro = menos contraste) y
 * el sistema no declara ningún escalón por encima de 0,6. Así que el número va
 * en tinta plena: **13,62:1** peor caso sobre el canvas y **18,00:1** sobre la
 * sección invertida. Lo que lo mantiene discreto es el tamaño —`text-micro`,
 * 10 px, monoespaciada y en mayúsculas—, no un alfa que no da.
 *
 * ⚠️ **Queda reportado, y NO se toca:** `RotuloDePanel` de `_componentes/Panel.tsx`
 * tiene el mismo `opacity-casi`. Después de este sprint `/v3` ya no lo
 * renderiza —las secciones traen su propio rótulo— así que el defecto deja de
 * estar en pantalla, pero el componente sigue ahí para quien lo use.
 */
export function NumeroDeSeccion({
  seccion,
  className,
}: {
  readonly seccion: EntradaDeSeccion
  readonly className?: string
}): React.JSX.Element {
  return (
    // `font-codigo` va en `className` y no antes: `cn` resuelve el conflicto de
    // familia quedándose con la última, así que ésta es la posición que gana.
    <Micro como="p" className={cn('flex items-center gap-[var(--spacing-2)] self-start font-codigo uppercase', className)}>
      {/* ── B4-A · EL PREFIJO DE LA MARCA, en las OCHO secciones ────────────
          `NumeroDeSeccion` es la única pieza del rótulo que las ocho comparten
          —cuatro por `EncabezadoDeSeccion` y cuatro suelta—, así que es donde el
          prefijo aparece una vez y aparece siempre. La referencia resuelve ese
          registro con un glifo; acá el vocabulario es propio: un RELLENO en
          `--color-acento`, el alias que se retiñe. Nunca como texto.
          ⚠ `self-start`: como ítem de grilla este `<p>` se ESTIRA a la fila, y
          con `items-center` el número se iba al medio de una fila de 1000 px —
          medido a 1920, el `02` de Quiénes somos bajaba de y 5 a y 539. Con la
          caja en su alto natural el número vuelve arriba y el cuadrado se
          alinea con su renglón, que es lo que `items-center` tiene que hacer. */}
      <PrefijoDeServicio />
      {seccion.numero}
    </Micro>
  )
}

/**
 * El rótulo completo: el número en la columna lateral y la etiqueta con el
 * nombre de la sección.
 *
 * `EtiquetaDeSeccion` es la pieza más repetida del inventario —29 apariciones—
 * y trae su medición entera: `text.micro`, `leading.micro`, peso medio,
 * mayúsculas y la sangría de `--spacing-8`. Acá la sangría se apaga: la columna
 * lateral ya separa, y sumar las dos cosas la correría dos veces.
 */
export function EncabezadoDeSeccion({
  seccion,
  nombre,
  className,
}: {
  readonly seccion: EntradaDeSeccion
  /** El nombre visible. Es contenido, y por eso entra como dato y no se lee de
   *  la tabla: `secciones.ts` es el recorrido, no el copy. */
  readonly nombre: string
  readonly className?: string
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-[var(--grilla-canal-amplio)] tablet:grid-cols-[var(--columna-lateral)_minmax(0,1fr)]',
        className,
      )}
    >
      <NumeroDeSeccion seccion={seccion} />
      {/* ── B4-A · EL SEPARADOR, donde hay una relación que marcar ──────────
          La regla de 1px del sistema entre el número y el nombre: el registro que
          declara que hay un SISTEMA y no un símbolo suelto. Va acá y no en
          `NumeroDeSeccion` porque acá las dos cosas son contiguas; en las cuatro
          que reparten el rótulo por su cuenta no hay nada pegado que separar. */}
      <div className="flex items-center gap-[var(--spacing-2)]">
        <Separador />
        <EtiquetaDeSeccion como="p" sangria={false}>
          {nombre}
        </EtiquetaDeSeccion>
      </div>
    </div>
  )
}
