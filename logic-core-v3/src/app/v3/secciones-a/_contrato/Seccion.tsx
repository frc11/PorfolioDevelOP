import { cn } from '@/lib/utils'

import { Panel } from '../../_componentes/Panel'
import { Micro } from '../../_componentes/tipografia/Textos'
import type { Seccion as EntradaDeSeccion } from '../../_lib/secciones'

/**
 * EL ENVOLTORIO DE UNA SECCIÓN — panel, superficie, alto y pinneo.
 *
 * ── Qué agrega sobre `Panel`, y qué no ─────────────────────────────────────
 *
 * `Panel` (S1) ya resuelve lo importante: la `<section>` a sangre, la
 * superficie como dato, el `data-seccion="invertida"` que da vuelta el tema, el
 * `minHeight` que sale de la tabla y el `z-10` que la pone encima del canvas.
 * **Nada de eso se reimplementa.**
 *
 * Este envoltorio agrega exactamente dos cosas:
 *
 *   1. El atributo por el que los instrumentos agarran una sección sin
 *      depender del texto que muestra —el texto es relleno y va a cambiar.
 *   2. La rama pinneada CON CONTENIDO.
 *
 * ── Por qué la rama pinneada se escribe acá y no se reusa ──────────────────
 *
 * `PanelPinneado` (S1) existe y hace exactamente el mecanismo correcto, pero
 * **no acepta contenido**: renderiza `RotuloDePanel`, que es el rótulo del
 * esqueleto. Darle un `children` es cambiar un componente del layout de S1, y
 * este lane tiene prohibido tocar layout. Así que el mecanismo se reproduce
 * —son tres clases— con la fuente citada, y **queda reportado**: si se quiere
 * una sola fuente para el pinneo, es una prop `children` en `PanelPinneado`, y
 * es una decisión.
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
 * ── Sin una línea de JavaScript, y por eso cruza la compuerta ──────────────
 *
 * El pinneo es CSS puro, así que **sobrevive abajo de 1025** igual que en el
 * esqueleto. Es la mitad del ritmo que mobile conserva gratis, sin bajar un
 * byte de más, y es la razón por la que la sección más pesada del lane sigue
 * teniendo forma cuando la coreografía no corre.
 */

export interface SeccionProps {
  readonly seccion: EntradaDeSeccion
  /** Clases de la `<section>`. Se suman a las de la superficie. */
  readonly className?: string
  readonly children: React.ReactNode
}

export function Seccion({ seccion, className, children }: SeccionProps): React.JSX.Element {
  /**
   * ⚠ LA MARCA DEL LANE VIAJA EN EL PROPIO ELEMENTO PINNEADO, NO EN UN
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
          data-seccion-a={seccion.id}
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
      <div data-seccion-a={seccion.id} className={cn('w-full', className)}>
        {children}
      </div>
    </Panel>
  )
}

/**
 * EL NÚMERO DE LA SECCIÓN — el `01` de la columna lateral de 140px.
 *
 * ── Por qué este dígito sí, y no contradice la regla de §0.4 ───────────────
 *
 * Porque **no es un dato del negocio**: es el índice de la sección en el
 * recorrido, sale de `secciones.ts` y no de un `contenido.ts`, y no se puede
 * leer como un hecho sobre develOP. La regla dura prohíbe inventar cifras que
 * se lean como medidas; un ordinal de navegación no es una de ésas, y el
 * escáner de contenido no lo mira porque no está en el contenido.
 *
 * Es además la pieza medida: la columna lateral mide 140px exactos en 92
 * contenedores de la referencia, y ahí es donde vive el número.
 *
 * En `font-codigo` y mayúsculas, que es la forma medida de la etiqueta de
 * sección —`text.micro` con `--tracking-micro`, el único interletrado positivo
 * del sistema, que es lo que hace legible un cuerpo de 10px.
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
    <Micro como="p" className={cn('font-codigo uppercase opacity-casi', className)}>
      {seccion.numero}
    </Micro>
  )
}
