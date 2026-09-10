import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Panel } from '../../_componentes/Panel'
import type { Seccion as EntradaDeSeccion } from '../../_lib/secciones'

import { ATRIBUTO_DE_SECCION } from './forma'

/**
 * ⚠ **B4-A · EL RÓTULO SE MUDÓ A `Rotulo.tsx` y se re-exporta desde acá.**
 * Este archivo pasó las 300 líneas al montarle la marca al rótulo, y la regla
 * del repo es que se parte. El corte es por TEMA y no por tamaño: el envoltorio
 * resuelve el panel, el alto y el pinneo; el rótulo es la pieza de marca de la
 * sección. Se re-exportan para que las ocho secciones no cambien un import: lo
 * que se movió es dónde está escrito, no de dónde se consume.
 *
 * ⚠ **B12: `NumeroDeSeccion` y `EncabezadoDeSeccion` ya no existen.** El número
 * y el rótulo de texto se fueron de las ocho por pedido del humano; lo que queda
 * —la marca y la columna lateral de 140 px que sostiene el cierre estructural de
 * B11— vive en `MarcaDeSeccion` y `CabeceraDeSeccion`. El porqué de cada
 * conservación está en `Rotulo.tsx`.
 */
export { CabeceraDeSeccion, MarcaDeSeccion } from './Rotulo'

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
 * ── EL ALTO DEL HIJO PEGADO ES UN PISO, NO UN TECHO (SITIO-S11) ───────────
 *
 * `pinneada: 'siempre'` emitía `h-svh` —alto FIJO— y ésa era la **doble
 * contención** que dejó la unificación de S7: la rama pinneada del lane A se
 * sumó a la contención propia que Servicios ya traía, y nadie las restó.
 * Servicios pone adentro su `Bloque` de `min-height: 300svh` con los TRES
 * bloques apilados, o sea tres pantallas de contenido dentro de una caja clavada
 * de una: abajo de 1025 los servicios 2 y 3 no subían nunca a cuadro.
 * `s10-mobile` §3 lo midió —963 px @375×667 · 942 @390×844 · 1583 @768×900—.
 *
 * **El envoltorio era el que estaba mal**, y el propio `servicios/geometria.ts`
 * ya tenía escrita la regla que violaba: *«el alto de un bloque es `min-h-svh`,
 * no `h-svh`»*. Con `min-h-svh` la caja CRECE con su contenido en vez de
 * recortarlo, y el rango de pegado se acorta solo: si el hijo mide lo mismo que
 * su sección, el pin no recorre y no clava nada. Es lo correcto en los dos
 * casos — el que entra en una pantalla se sigue clavando igual, y el que no
 * entra deja de esconder lo que no le cabe.
 *
 * ⚠ **LA ASIMETRÍA ENTRE LOS DOS MODOS ES DELIBERADA, y no es un descuido.**
 * `desde-escritorio` conserva `escritorio:h-svh` porque ahí el alto fijo es
 * PORTANTE: Trabajos cuelga su composición de un `h-full` —`Envoltorio` y
 * escenario— y `height: 100%` contra un padre de altura automática resuelve a
 * `auto`, con lo que el escenario de los tres planos `absolute inset-0`
 * colapsaría a cero arriba de 1025. Esa geometría está medida y aprobada por
 * grabación, y este sprint no la toca. El modo que se corrige es el único que
 * tenía el defecto.
 *
 * **Dónde vive el pin de cada modo, después del arreglo:**
 *
 *   `desde-escritorio`  el hijo de ESTE envoltorio, `escritorio:h-svh`.
 *   `siempre`           el hijo lo declara la sección: arriba de 1025 es el
 *                       `sticky top-0 … min-h-svh` de `servicios/geometria.ts`
 *                       adentro del `Bloque` de 300svh, con el mismo recorrido
 *                       de 200svh que el envoltorio daba antes. Abajo de 1025
 *                       no hay coreografía y no hay nada que clavar: los tres
 *                       bloques se reparten las tres pantallas declaradas.
 *
 * `PANTALLAS_DEL_STICKY = 1` de `ritmo.ts` sigue valiendo, porque la cuenta que
 * produce es la de escritorio y ahí el hijo pegado sigue midiendo una pantalla
 * en los dos modos — lo que cambió es cuál elemento la lleva.
 *
 * ── Sin una línea de JavaScript, y por eso cruza la compuerta ─────────────
 *
 * El pinneo es CSS puro, así que el MECANISMO no depende de que baje un byte de
 * JavaScript y sigue existiendo abajo de 1025.
 *
 * ⚠ **Lo que decía este bloque, y por qué se corrige (B7 · frente B):**
 * *«sobrevive abajo de 1025 … es la mitad del ritmo que mobile conserva gratis,
 * y por eso las dos secciones más pesadas siguen teniendo forma»*. Lo que
 * sobrevive es el mecanismo; **el pin no**, y ahora está medido con scroll real
 * en los dos lados del umbral (`scripts-b7/b-pin.ts` →
 * `docs/rediseno/outputs/b7/b-pin.json`):
 *
 *   · **A 1024 hay 2 elementos `sticky` en todo el documento y ninguno es un pin
 *     del recorrido.** El de `trabajos` es `escritorio:sticky`, o sea
 *     `position: static` abajo del umbral —la compuerta lo apaga, y es lo
 *     buscado—; el de `servicios` es este envoltorio, con recorrido cero por
 *     construcción; y el `sticky` de la secuencia directamente **no se monta**,
 *     porque la rama apilada no lo tiene.
 *   · **A 1025, 1440 y 1920 hay 4**, y los dos pines de verdad recorren
 *     2.160 px cada uno a 1920 (Trabajos entre scrollY 8.642 y 10.800;
 *     Servicios entre 11.882 y 14.040).
 *
 * O sea que las dos secciones más pesadas conservan su ALTO abajo del umbral
 * —el `min-height` de la tabla— y no su pinneo. Y con `min-h-svh` eso es lo que
 * se quiere: una sección `siempre` cuyo contenido quieto mida más de una
 * pantalla clavada abajo de 1025 sería una sección escondida.
 *
 * ── ⚠️ ESTE ENVOLTORIO ES INERTE PARA `servicios`, Y HAY QUE SABERLO (B7) ──
 *
 * La consecuencia de arriba tiene un caso concreto, medido, y es una **trampa
 * para cualquier instrumento que mida este elemento**:
 *
 * `Servicios.tsx` pone adentro de este envoltorio un `Bloque` con
 * `style={{ minHeight: ALTO_DECLARADO }}` —el alto de la sección ENTERA— y es su
 * único hijo. Entonces el envoltorio **mide lo mismo que su padre** y su rango
 * de pegado es `alto − alto` = **cero, por construcción, en todos los perfiles y
 * para siempre**. Medido con scroll real en cuatro perfiles: 3240 de 3240 a
 * 1920, 2700 de 2700 a 1440, 2304 de 2304 a 1025 y 2370,44 de 2370,44 a 1024,
 * con desplazamiento cero en las 512 paradas del barrido
 * (`scripts-b7/b-pin.ts` → `docs/rediseno/outputs/b7/b-pin.json`).
 * **No está roto: nunca tuvo recorrido.** El pin de esa sección es el hijo
 * `sticky` de su secuencia, que recorre 2.160 px a 1920.
 *
 * **Cómo se distingue el que pinea del que no, sin adivinar:** un `sticky` son
 * DOS elementos —el hijo que se pega y el padre que le da recorrido— y el
 * recorrido disponible es `alto del padre − alto propio`. Mirar sólo la posición
 * del hijo devuelve el MISMO cero para el que está roto y para el que nunca tuvo
 * recorrido; B4-B midió este envoltorio así y publicó «el pin de `servicios` NO
 * pinea en ningún perfil», con el pin andando. **La cifra que discrimina es el
 * recorrido disponible, y va siempre al lado del cero.**
 *
 * Y la asimetría con el otro modo es exactamente ésta: en `desde-escritorio` el
 * hijo pegado es ESTE `div` —`escritorio:h-svh`, una pantalla contra las tres de
 * su sección: 1080 de 3240 a 1920, 2.160 px de recorrido, y ahí pinea de verdad—
 * mientras que en `siempre` el hijo pegado lo declara la sección. **El
 * envoltorio no cambia; cambia quién declara el alto adentro.**
 *
 * Se deja como está a propósito: el mecanismo del modo `siempre` es correcto
 * para una sección cuyo contenido pinneado NO declare el alto entero, y sacarlo
 * sería un cambio de composición sobre el archivo que sirve a las dos secciones
 * pinneadas. Lo que faltaba no era código: era esta nota.
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
        ? 'sticky top-0 min-h-svh'
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
