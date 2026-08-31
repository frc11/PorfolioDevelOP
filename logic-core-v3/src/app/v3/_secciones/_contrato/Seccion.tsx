import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Panel } from '../../_componentes/Panel'
import { EtiquetaDeSeccion, Micro } from '../../_componentes/tipografia/Textos'
import type { Seccion as EntradaDeSeccion } from '../../_lib/secciones'

import { ATRIBUTO_DE_SECCION } from './forma'

/**
 * EL ENVOLTORIO DE UNA SECCIÓN — panel, superficie, alto y pinneo.
 *
 * ── Qué agrega sobre `Panel`, y qué no ────────────────────────────────────
 *
 * `Panel` (S1) ya resuelve lo importante: la `<section>` a sangre, la
 * superficie como dato, el `data-seccion="invertida"` que da vuelta el tema, el
 * `minHeight` que sale de la tabla y el `z-10` que la pone encima del canvas.
 * **Nada de eso se reimplementa.**
 *
 * Este envoltorio agrega exactamente dos cosas: el atributo por el que los
 * instrumentos agarran una sección sin depender del texto que muestra —el texto
 * es relleno y va a cambiar— y la rama pinneada CON CONTENIDO.
 *
 * ── La divergencia entre los dos contratos, y cuál gana ───────────────────
 *
 * El lane A escribió el envoltorio con la rama pinneada adentro; el lane B lo
 * dejó como un `Panel` pelado y le pidió a cada sección que armara su propia
 * contención. **Gana el del lane A**, y la razón es la corrección de la tabla
 * que este sprint aplica: hasta ahora la única sección pinneada declarada era
 * Trabajos, del lane A, así que el lane B no tenía nada que pinnear. Con
 * `servicios` declarada `pinneada: 'siempre'` —que es lo que siempre fue,
 * construida como secuencia pinneada— la rama hace falta para las dos.
 *
 * ── Por qué la rama pinneada NO reusa `PanelPinneado` ─────────────────────
 *
 * `PanelPinneado` (S1) hace el mecanismo correcto pero **no acepta contenido**:
 * renderiza `RotuloDePanel`, que es el rótulo del esqueleto. El mecanismo se
 * reproduce acá —son tres clases— con su fuente citada.
 *
 * El mecanismo, tal como lo documenta `PanelPinneado`:
 *
 *     La <section> mide 300svh  → 300svh de recorrido de scroll.
 *     El hijo `sticky` mide 100svh y se clava en `top: 0`.
 *     Resultado: el panel queda clavado 200svh y después se va.
 *
 * Y sus dos condiciones, las dos cumplidas por construcción:
 *
 *   · **Ningún ancestro con `overflow` distinto de `visible`.** `sticky` se
 *     apaga en silencio, sin un solo error en consola. La cadena de /v3 está
 *     verificada limpia por S1; quien agregue un `overflow-hidden` arriba de
 *     esto lo rompe sin que nada se queje.
 *   · **El hijo `sticky` es hijo DIRECTO** de la sección que le da recorrido.
 *     Un envoltorio intermedio con altura automática le recorta el rango de
 *     pegado a cero.
 *
 * ── Sin una línea de JavaScript, y por eso cruza la compuerta ─────────────
 *
 * El pinneo es CSS puro, así que **sobrevive abajo de 1025** igual que en el
 * esqueleto. Es la mitad del ritmo que mobile conserva gratis, sin bajar un
 * byte de más, y es la razón por la que las dos secciones más pesadas del sitio
 * siguen teniendo forma cuando la coreografía no corre.
 */

export interface SeccionProps {
  readonly seccion: EntradaDeSeccion
  /** Clases de la caja interna. Se suman a las del pinneo. */
  readonly className?: string
  readonly children: React.ReactNode
}

export function Seccion({ seccion, className, children }: SeccionProps): React.JSX.Element {
  /**
   * ⚠ LA MARCA DE LA SECCIÓN VIAJA EN EL PROPIO ELEMENTO PINNEADO, NO EN UN
   * ENVOLTORIO. Y no es una preferencia de estilo: es la condición de la que
   * depende que el pinneo funcione.
   *
   * `position: sticky` se pega dentro de su CONTENEDOR DE BLOQUE. Si entre la
   * `<section>` de 300svh y el hijo `sticky` hubiera un `div` intermedio con
   * altura automática, ese `div` mediría lo que mide su contenido —100svh— y el
   * rango de pegado sería **cero**: el panel no se clavaría un solo píxel.
   *
   * Y lo peor del caso es cómo falla: sin un error, sin un aviso, y con un
   * marcado que se ve correcto. Por eso las dos ramas se escriben separadas en
   * vez de compartir un envoltorio con la marca — compartirlo era lo natural, y
   * era exactamente el bug.
   */
  if (seccion.pinneada !== undefined) {
    /**
     * Los dos modos del pinneo, emitidos como variantes y no como una rama de
     * JavaScript. `sticky` es CSS puro y ésa es la mitad de su valor: no
     * depende de que baje un bundle, así que no hay nada que decidir en tiempo
     * de ejecución ni hidratación que pueda diferir. `desde-escritorio` acota
     * el MISMO mecanismo con la variante `escritorio:`, que Tailwind genera
     * desde `--breakpoint-escritorio` — el 1025 no se escribe en ningún lado.
     *
     * ⚠ Las dos cadenas están enteras y literales. Una clase armada como
     * `${prefijo}sticky` no la ve el escáner de Tailwind, la regla no se emite
     * nunca y el panel deja de clavarse sin un solo error en consola.
     */
    const clasesDePin =
      seccion.pinneada === 'siempre'
        ? 'sticky top-0 h-svh'
        : 'escritorio:sticky escritorio:top-0 escritorio:h-svh'

    return (
      <Panel seccion={seccion}>
        <div
          {...{ [ATRIBUTO_DE_SECCION]: seccion.id }}
          data-pinneado={seccion.pinneada}
          className={cn('w-full', clasesDePin, className)}
        >
          {children}
        </div>
      </Panel>
    )
  }

  return (
    <Panel seccion={seccion}>
      <div {...{ [ATRIBUTO_DE_SECCION]: seccion.id }} className={cn('w-full', className)}>
        {children}
      </div>
    </Panel>
  )
}

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
    <Micro como="p" className={cn('font-codigo uppercase', className)}>
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
      <EtiquetaDeSeccion como="p" sangria={false}>
        {nombre}
      </EtiquetaDeSeccion>
    </div>
  )
}

/**
 * La contención estándar de una sección: a sangre, con los 32px fijos de
 * `--pad-lateral-compacto` y el tope de 1920px en el contenido.
 *
 * Es `Envoltorio` con un nombre que dice para qué se usa acá. Existe para que
 * las ocho secciones contengan igual sin que cada una recuerde qué props le
 * tocaban.
 */
export function ContenidoDeSeccion({
  children,
  className,
  claseDeContenido,
}: {
  readonly children: React.ReactNode
  readonly className?: string
  readonly claseDeContenido?: string
}): React.JSX.Element {
  return (
    <Envoltorio className={className} claseDeContenido={claseDeContenido}>
      {children}
    </Envoltorio>
  )
}
