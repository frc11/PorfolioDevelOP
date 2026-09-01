'use client'

import { cn } from '@/lib/utils'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Bloque } from '../_contrato/coreografia'
import { CanalDePieza, TextoPorLineas } from '../_contrato/canales'
import { NumeroDeSeccion, Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'

import { CONTENIDO } from './contenido'

/**
 * 01 · HERO — una pantalla, la escena a la vista, y el aire del pie reservado.
 *
 * ── El lugar que ocupa en el recorrido, y por qué es la única así ──────────
 *
 * `secciones.ts` le da `papel-transparente`, **100svh** y ningún pinneo. Las
 * tres cosas se leen con `seccionDeA('hero')` y ninguna se declara acá: el
 * alto, la superficie y el pinneo son del recorrido, no de la sección.
 *
 * Es la primera de las tres pantallas del sitio que dejan ver el canvas —Hero,
 * Por qué develOP y nada más— y por eso **esta sección no pinta fondo**. No hay
 * un `bg-` en toda la composición, y no es un olvido: el panel es transparente
 * y la sala se ve a través suyo. Un fondo puesto acá para que el texto se lea
 * mejor apagaría la única cosa que esta pantalla tiene y ninguna otra tiene.
 *
 * ── El texto va sobre la escena: qué se midió y qué NO ─────────────────────
 *
 * `hero.invariant.tsx` calcula la razón de contraste de `--color-tinta` contra
 * los dos tokens que pinta el marcador de posición del canvas y reporta el peor
 * caso. Sale muy por arriba de AA, así que el texto no necesita ninguna capa
 * abajo — y ésa es la razón por la que no la tiene.
 *
 * ⚠ **Esa cifra vale para el MARCADOR DE POSICIÓN, no para la escena real.** El
 * marcador son dos tokens planos; la sala 3D es un gradiente con luces y no
 * hereda el número. El día que la escena exista hay que volver a medir sobre la
 * pose real, y si ahí no diera AA la salida NO es inventar una capa de fondo en
 * esta sección: es la escena, que es de otro sprint. Queda reportado.
 *
 * ── Los últimos 72 px de esta pantalla no son míos ─────────────────────────
 *
 * La pastilla de navegación —que monta la RUTA, no esta sección— nace a
 * `100svh − 24px − 48px` y mide 48 de alto, centrada. O sea que **el pie de la
 * primera pantalla, en el centro, está ocupado**. Por eso el contenedor lleva
 * `pb-20` (80 px, `--spacing-20`): es el escalón declarado más chico que cubre
 * los 72 px de `DESCUENTO_NACIMIENTO_PX`, y el invariante compara los dos
 * números en vez de confiar en que alguien se acuerde.
 *
 * El `pt-20` de arriba NO es la simetría del de abajo: son dos decisiones que
 * hoy dan el mismo valor. El de abajo está atado a la geometría de la pastilla
 * y el invariante lo afirma contra ella; el de arriba es aire.
 *
 * ── La coreografía: un P1, un P2, y una cosa que no se mueve ───────────────
 *
 * P1 para el titular, con `TextoPorLineas`, que ya trae la rama quieta y el
 * árbol de encabezados. P2 para el bloque de bajada y CTA, que entra después
 * porque resuelve su ancla contra su propia caja — no hay un `stagger`
 * coordinándolos, y no hace falta.
 *
 * **El slogan queda quieto**, y es una decisión de composición: es la línea de
 * marca, la constante, y lo único que sostiene la pantalla mientras el
 * preloader todavía está saliendo. Animar las tres cosas dejaría el primer
 * cuadro completamente vacío, que es exactamente el defecto que una coreografía
 * de entrada existe para evitar.
 *
 * ⚠ **El logo que el preloader deja acá NO lo monta esta sección.** El traspaso
 * es chrome —vive entre el preloader y el layout— y componerlo es del sprint
 * del home. Esta sección no lo dibuja y no le reserva caja. Queda reportado.
 *
 * ── Abajo de 1025 y con `prefers-reduced-motion` ──────────────────────────
 *
 * `BloqueDeSeccion` entrega `progreso: null` y esta sección renderiza su
 * variante quieta: **el mismo contenido, completo y legible, sin una sola
 * transformada ni un `will-change`**. No es una degradación; es la otra mitad.
 * La grilla de cinco columnas colapsa a una —es la firma estructural medida del
 * breakpoint— así que el titular usa el ancho entero, que a 36 px es la medida
 * que corresponde.
 */

/**
 * LA GEOMETRÍA — todos los números de la sección, juntos y fuera del contenido.
 *
 * Están acá y no en `contenido.ts` porque son técnicos: los decide quien
 * construye la sección y no cambian el día que llegue el copy definitivo.
 * Mezclarlos con el contenido obligaría a exceptuarlos del escáner de cifras, y
 * una excepción es por donde vuelve a entrar la primera cifra inventada.
 */
export const GEOMETRIA = {
  /**
   * LA MEDIDA DEL TITULAR: 3 columnas de 5. [derivado]
   *
   * No es estética: es la condición de que P1 tenga algo que coreografiar. A
   * 1920 la columna fluida de la grilla lateral mide ~1700 px y el titular a
   * `titulo-xl` (56 px) ocupa ~1180, o sea que **a ancho completo entraría en
   * una sola línea** y el patrón de línea por línea se quedaría sin gesto. Tres
   * de cinco dan ~1000 px, que lo parten en dos.
   *
   * La grilla de 5 es además la única del sistema que colapsa en 1025 —la firma
   * estructural del breakpoint, 40 apariciones arriba y cero abajo—, o sea el
   * mismo píxel en el que se apaga la coreografía. La medida y el gesto
   * conmutan juntos y no queda una banda donde uno esté sin el otro.
   */
  columnasDeLaMedida: 3,
  columnasTotales: 5,
  /**
   * La clase, escrita ENTERA y literal. Tailwind escanea el código fuente: una
   * armada como `escritorio:col-span-` más el número no la ve nadie y su regla
   * no se emite nunca —el atributo queda en el HTML, el navegador no encuentra
   * nada, y la página se ve casi bien sin un solo error—. El invariante afirma
   * que este literal y el número de arriba dicen lo mismo, que es lo que impide
   * que se desincronicen.
   */
  claseDeLaMedida: 'escritorio:col-span-3',
  /**
   * Cuántas líneas promete el titular. Es inerte para P1 —`LineasDeTexto`
   * recalcula la cantidad con las líneas que MIDE, que es el punto entero del
   * divisor— y va declarado igual porque es lo que el bloque promete y lo que
   * hace comparable esta sección con el rango medido del patrón (1 a 6).
   */
  lineasDelTitular: 2,
  /**
   * Un solo target en el bloque P2, que es lo que mide el patrón: con una pieza
   * el escalonado queda inerte y la duración aplicada coincide con la
   * declarada. Es el único patrón donde las dos coinciden.
   */
  piezasDelBloqueDeEntrada: 1,
} as const

/**
 * La tipografía definitiva del titular, como constante.
 *
 * `TextoPorLineas` la exige y no por prolijidad: el divisor mide dónde corta
 * cada línea, y una medición tomada sin la tipografía final agrupa las palabras
 * con la métrica equivocada. Exportada para que el invariante afirme el MISMO
 * valor que se renderiza y no una copia escrita a mano.
 */
export const TIPOGRAFIA_DEL_TITULAR =
  'font-titulo text-fluido-titulo-xl leading-titulo tracking-titulo'

/**
 * La bajada y el CTA, escritos una sola vez.
 *
 * `items-start` no es decoración: `CtaEnlace` en su variante `linea` es un
 * `inline-block` y en una columna flex se estiraría a todo el ancho, con lo
 * cual el subrayado del rollover —que mide el 100 % de la ventana de recorte—
 * dejaría de terminar donde termina la palabra.
 */
function BajadaYCta(): React.JSX.Element {
  return (
    <>
      <Cuerpo>{CONTENIDO.bajada}</Cuerpo>
      {/* Un enlace nativo, nunca un div con manejador, y NUNCA adentro de otro
          interactivo: la referencia envuelve su botón en un enlace y eso son dos
          paradas de tabulación para un solo control. `Cta` (botón) y `CtaEnlace`
          (enlace) están separados justamente para que anidarlos haya que
          escribirlo a propósito. */}
      <CtaEnlace href={CONTENIDO.cta.destino} rotulo={CONTENIDO.cta.rotulo} />
    </>
  )
}

export function Hero({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Envoltorio>
        {/* `min-h-svh` y no `h-svh`: si el titular se parte en más líneas de las
            previstas —otro copy, otro idioma— la pantalla crece en vez de
            recortar el texto. El alto declarado de la sección es un MÍNIMO en
            `Panel`, así que las dos cajas dicen lo mismo. */}
        <div
          data-pantalla="hero"
          className="flex min-h-svh w-full flex-col justify-center pt-20 pb-20"
        >
          <Grilla columnas="lateral">
            <NumeroDeSeccion seccion={seccion} />
            <Grilla columnas={GEOMETRIA.columnasTotales}>
              <div className={cn('flex flex-col gap-8', GEOMETRIA.claseDeLaMedida)}>
                {/* El slogan ocupa el lugar que en las otras tres lleva el nombre
                    de la sección. El Hero no se anuncia —Hero es el nombre del
                    bloque en el recorrido, no una palabra que el visitante lea—
                    así que ese registro tipográfico, medido y con su sangría de
                    32 px, queda libre para la línea de marca. Mismo lugar, misma
                    escala, otra función, declarada. */}
                <EtiquetaDeSeccion>{CONTENIDO.slogan}</EtiquetaDeSeccion>

                <Bloque patron="P1">
                  {(progreso) => (
                    <TextoPorLineas
                      texto={CONTENIDO.titular}
                      progreso={progreso}
                      patron="P1"
                      como="h1"
                      className={TIPOGRAFIA_DEL_TITULAR}
                      // El `h1` es el nombre accesible de la región del Hero (S11, defecto 10).
                      id={idDelTitularDeSeccion(seccion.id)}
                    />
                  )}
                </Bloque>

                <Bloque patron="P2">
                  {(progreso) => (
                    <CanalDePieza
                      progreso={progreso}
                      patron="P2"
                      cantidad={GEOMETRIA.piezasDelBloqueDeEntrada}
                      indice={0}
                      className="flex flex-col items-start gap-6"
                    >
                      <BajadaYCta />
                    </CanalDePieza>
                  )}
                </Bloque>
              </div>
            </Grilla>
          </Grilla>
        </div>
      </Envoltorio>
    </Seccion>
  )
}
