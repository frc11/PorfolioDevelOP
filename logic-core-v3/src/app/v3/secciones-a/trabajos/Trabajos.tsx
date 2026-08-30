'use client'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { sizesPorTresTramos } from '../../_lib/imagen'
import { BloqueDeSeccion } from '../_contrato/coreografia'
import { NumeroDeSeccion, Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'
import { Pieza } from '../_contrato/piezas'

import { CONTENIDO } from './contenido'
import { Proyecto, type CajaDeLaCaptura } from './Proyecto'

/**
 * 04 · TRABAJOS — la banda oscura, pinneada, con tres planos que vienen de atrás.
 *
 * ── Lo que la tabla decide y esta sección no declara ───────────────────────
 *
 * `secciones.ts` le da `oscuro-opaco`, **300svh** y `pinneada:
 * 'desde-escritorio'`. Las tres se leen con `seccionDeA('trabajos')` y ninguna
 * se escribe acá. `Seccion` ya pone el `<Panel>` con `data-seccion="invertida"`
 * —el tema se da vuelta solo y las MISMAS `bg-fondo text-tinta` pintan
 * invertido— y el hijo `escritorio:sticky escritorio:h-svh`.
 * **Desde 1025 todo lo de acá adentro mide UNA pantalla**, y por eso el
 * envoltorio y el escenario van en `h-full`: los otros 200svh son recorrido de
 * scroll, no lugar donde poner contenido. Abajo del umbral no hay pin y los
 * 300svh se reparten entre los tres proyectos — ver más abajo.
 *
 * ── EL EFECTO ES HTML CON PERSPECTIVA, NO GEOMETRÍA 3D ────────────────────
 *
 * Está medido contra el DOM vivo de la referencia: 44 targets, los 44 `Element`,
 * cero objetos de escena, todos con `matrix3d(...)` y `perspective: 1000px` en
 * un ANCESTRO. Por eso **este archivo no importa una sola línea de `three`, ni
 * de `@react-three/*`, ni de `drei`**, y el invariante lo afirma leyendo los
 * tres archivos del disco. Cargar un motor 3D para mover tres tarjetas sería
 * pagar un runtime entero por lo que hace la placa con cuatro propiedades.
 *
 * ── UN bloque, tres piezas, apiladas en el mismo lugar ────────────────────
 *
 * `BloqueDeSeccion patron="P7" piezas={3}` y los tres proyectos como tres
 * `Pieza` con índice 0, 1 y 2, cada una `absolute inset-0`: **superpuestas, no
 * en fila**. Es lo que pide P7 —`translateZ` de −3000 a +1000 con sus dos
 * tramos contiguos, `autoAlpha` 0→1→0, `scale` 0,6→1 y `pointerEvents`
 * conmutando para que lo que está lejos no sea clickeable— y es también la
 * razón de que sea UN bloque y no tres: la perspectiva la escribe
 * `BloqueDeSeccion` en el ANCESTRO, no en cada plano. Tres bloques serían tres
 * puntos de fuga distintos y la pila dejaría de leerse como una escena.
 *
 * El escalonado de 0,4 s reparte los tres dentro del mismo rango de scroll, así
 * que los 200svh de pinneo son exactamente el recorrido de los tres pasajes.
 *
 * ── La rama quieta: el MISMO proyecto, en fila ────────────────────────────
 *
 * Abajo de 1025 y con `prefers-reduced-motion`, `BloqueDeSeccion` entrega
 * `progreso: null` y los tres proyectos salen en una `Grilla` de tres columnas,
 * sin una transformada y sin un `will-change`. **La tarjeta es la misma pieza de
 * marcado en las dos ramas** —una sola `Proyecto`, no dos variantes— porque dos
 * copias son dos oportunidades de que una se quede sin marcador, y ése es el
 * defecto que ninguna mirada a la pantalla encontraría.
 *
 * ⚠ **ABAJO DE 1025 NO SE PINNEA, Y ESO ARREGLA UN DESBORDE MEDIDO.**
 *
 * La primera versión se pinneaba en todos los anchos y desbordaba: abajo de 768
 * la grilla de tres colapsa a una —es la regla medida de `Grilla`— y las tres
 * tarjetas apiladas miden ~810 px [derivado de la relación de aspecto y del
 * ancho de contenido de 375 px] contra los ~555 px de `svh` que deja un
 * teléfono. El contenido no se perdía, pero se leía tarde y recortado.
 *
 * La tabla lo resuelve declarándolo: `pinneada: 'desde-escritorio'`. Abajo del
 * umbral **no hay coreografía**, así que el pin no estaba sosteniendo ningún
 * gesto — sólo clavaba una caja que no entra. Sin pin, los 300svh de la sección
 * se reparten entre los tres proyectos, uno por pantalla, y no queda ni
 * desborde ni banda vacía. La decisión está en `secciones.ts` con su razón, no
 * escondida en una clase de este archivo.
 *
 * ── Sobre fondo oscuro el acento NO es texto ──────────────────────────────
 *
 * Medido: sobre `#0E0E0E` los tres acentos dan 2,71 · 2,99 · 2,46 — no sólo
 * fallan AA como texto (4,5:1), tampoco llegan a 3:1, que es el mínimo de un
 * componente de interfaz. Acá el acento va como **RELLENO**: la métrica es una
 * pastilla `bg-acento` con el papel encima (`text-tinta`, que en la sección
 * invertida ES el papel: 6,65:1). Y **nunca como borde**: el límite de la
 * tarjeta lo marca el marco punteado de la captura, que usa
 * `--color-borde-fuerte` y da 4,62:1 sobre el oscuro. El invariante recalcula
 * los tres números y afirma que no hay ni `text-acento` ni `border-acento`.
 *
 * ── Nada es clickeable, y es una decisión ─────────────────────────────────
 *
 * No hay página de caso para ninguno de los tres, y las URLs de los clientes no
 * se inventan. Quedaba `href="#trabajos"`, que es un enlace que existe y no
 * lleva a ningún lado: tres paradas de tabulación que no hacen nada es peor que
 * ninguna. Así que la sección **no tiene un solo control**, no tiene un solo
 * `hover:` y no tiene ningún `div` haciendo de botón. La métrica no necesitaba
 * el hover: la referencia la revela al pasar el puntero, y acá va **siempre
 * visible**, porque esconder la métrica es esconder el pedido a Franco. El día
 * que haya páginas de caso, cada tarjeta pasa a ser un `CtaEnlace` y el énfasis
 * de hover se agrega con su `focus-visible:` gemela.
 */

/**
 * LA GEOMETRÍA — todos los números de la sección, juntos y fuera del contenido.
 *
 * Están acá y no en `contenido.ts` porque son técnicos: los decide quien
 * construye la sección y no cambian el día que lleguen las capturas. Mezclarlos
 * con el contenido obligaría a exceptuarlos del escáner de cifras, y una
 * excepción es por donde vuelve a entrar la primera cifra inventada.
 */
export const GEOMETRIA = {
  captura: {
    /**
     * 1600 × 800, o sea **2:1 apaisado** — [decidido, con razón].
     *
     * Una captura de sitio es apaisada; la pregunta es cuánto. 16:10 sería el
     * viewport ENTERO de un portátil, y una vitrina no muestra la página
     * entera: muestra el pliegue. 1600 × 800 es literalmente eso —un ancho de
     * trabajo de escritorio recortado a lo que se ve sin scrollear— así que los
     * dos números salen de la misma medida y no de una proporción elegida.
     *
     * Tiene además una consecuencia de layout que decide el empate: esta
     * sección está pinneada a UNA pantalla, y tres cajas 16:10 apiladas miden
     * un 25 % más que tres cajas 2:1. La relación más apaisada es la que hace
     * que el tramo compacto entre.
     *
     * 1600 es el ARCHIVO que se pide, no una caja de pantalla: la caja más
     * grande que produce esta composición es un tercio del tope de 1920, o sea
     * ~640 px de CSS, y 1600 la cubre con margen para densidad alta sin pasarse
     * del candidato de 1920 de la escalera de Next. Con `fuente={null}` hoy sólo
     * se usa la relación; el día de la captura ya está el ancho pedido.
     */
    ancho: 1600,
    alto: 800,
    /**
     * Los porcentajes del `sizes`, y **por qué acá sí van tres tramos**.
     *
     * La caja de la captura es el ancho de la tarjeta, y la tarjeta es UNA
     * COLUMNA DE TRES en las dos ramas: en la quieta, una de las tres de la
     * fila; en la coreografiada, la del medio de la misma grilla de tres. O sea
     * que la caja NO cambia en 1025 —cambia en 768, que es donde `Grilla`
     * colapsa la de tres columnas—, y por eso el ayudante correcto es
     * `sizesPorTresTramos` y no `sizesPorViewport`.
     *
     * Es exactamente el caso inverso al de Quiénes somos, que descartó los tres
     * tramos porque su caja cambiaba EN 1025 y los dos tramos de arriba habrían
     * dado el mismo número. Acá el que se repite es el de arriba, y se repite
     * porque es verdad: de 768 para arriba la captura vale un tercio del ancho,
     * anime o no anime.
     */
    tercio: 33,
    completo: 100,
  },
  /**
   * Cuántos planos anima el patrón. Es lo que define el escalonado real de P7 y
   * tiene que coincidir con la cantidad de proyectos del contenido: el
   * invariante lo afirma, con su control positivo. Declararlo acá y no leerlo
   * del contenido es lo que hace que la coincidencia sea COMPROBABLE en vez de
   * cierta por construcción.
   */
  planos: 3,
} as const

/** El `sizes` real de las capturas. Exportado para que el instrumento afirme el
 *  MISMO valor que se le pasa al marco, y no una copia escrita a mano. */
export const SIZES_DE_LA_CAPTURA = sizesPorTresTramos(
  GEOMETRIA.captura.tercio,
  GEOMETRIA.captura.tercio,
  GEOMETRIA.captura.completo,
)

/** La caja de la captura, en un solo objeto: es lo que `Proyecto` recibe para
 *  no tener que importar la geometría de vuelta y cerrar un ciclo. */
export const CAJA_DE_LA_CAPTURA: CajaDeLaCaptura = {
  ancho: GEOMETRIA.captura.ancho,
  alto: GEOMETRIA.captura.alto,
  sizes: SIZES_DE_LA_CAPTURA,
}

export function Trabajos({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Envoltorio
        className="flex h-full flex-col py-4 escritorio:py-8"
        claseDeContenido="flex h-full flex-col gap-4 escritorio:gap-8"
      >
        {/* ── EL MARCO QUIETO ─────────────────────────────────────────────
            No se anima: es contra esto que se lee la profundidad. `shrink-0`
            para que el escenario se quede con lo que sobre y no al revés. */}
        <Grilla columnas="lateral" className="shrink-0">
          <NumeroDeSeccion seccion={seccion} />
          <div className="flex flex-col gap-2">
            <EtiquetaDeSeccion>{CONTENIDO.etiqueta}</EtiquetaDeSeccion>
            <Titular nivel="titulo-m" como="h2" className="max-w-[var(--breakpoint-medio)]">
              {CONTENIDO.titular}
            </Titular>
            <Cuerpo className="max-w-[var(--breakpoint-medio)]">{CONTENIDO.bajada}</Cuerpo>
          </div>
        </Grilla>

        {/* ── EL ESCENARIO ────────────────────────────────────────────────
            `relative` porque las tres piezas se posicionan contra él, y
            `min-h-0 flex-1` para que ocupe lo que queda de la pantalla sin
            empujar al marco. La perspectiva de 1000px la escribe
            `BloqueDeSeccion` acá mismo, en el ancestro de los tres planos. */}
        <BloqueDeSeccion
          patron="P7"
          piezas={GEOMETRIA.planos}
          className="relative min-h-0 flex-1"
        >
          {(estado) => {
            const progreso = estado.progreso
            if (progreso === null) {
              /**
               * ── LA RAMA QUIETA, Y POR QUÉ CADA PROYECTO TOMA UNA PANTALLA ──
               *
               * Abajo de 1025 la sección **no se pinnea** —lo declara
               * `secciones.ts` con `pinneada: 'desde-escritorio'`— así que acá
               * no hay una caja clavada de `100svh` que respetar: hay 300svh de
               * documento que scrollean. Con `Grilla columnas={3}` colapsada a
               * una columna en 768, los tres proyectos caen uno abajo del otro,
               * y `min-h-svh` le da a cada uno **su** pantalla: tres proyectos
               * por tres pantallas es exactamente el alto declarado de la
               * sección. Ni desborde ni tramo vacío.
               *
               * Desde 1025 la variante se apaga (`escritorio:min-h-0`), porque
               * ahí esta rama sólo aparece con `prefers-reduced-motion` y el
               * panel SÍ está clavado en una pantalla: tres cajas de `svh`
               * adentro de una de `svh` es el mismo desborde, del otro lado.
               */
              return (
                <Grilla columnas={3} className="content-center escritorio:h-full">
                  {CONTENIDO.proyectos.map((proyecto) => (
                    <div
                      key={proyecto.nombre}
                      className="flex min-h-svh flex-col justify-center escritorio:min-h-0"
                    >
                      <Proyecto
                        proyecto={proyecto}
                        rotulo={CONTENIDO.rotuloDeLaMetrica}
                        caja={CAJA_DE_LA_CAPTURA}
                      />
                    </div>
                  ))}
                </Grilla>
              )
            }
            return CONTENIDO.proyectos.map((proyecto, indice) => (
              <Pieza
                key={proyecto.nombre}
                spec={estado.spec}
                indice={indice}
                progreso={progreso}
                className="absolute inset-0 flex items-center"
              >
                {/* La MISMA grilla de tres: el plano ocupa la columna del medio,
                    así que su ancho es el de la tarjeta de la rama quieta y el
                    `sizes` dice la verdad en las dos. */}
                <Grilla columnas={3}>
                  <div className="tablet:col-start-2">
                    <Proyecto
                      proyecto={proyecto}
                      rotulo={CONTENIDO.rotuloDeLaMetrica}
                      caja={CAJA_DE_LA_CAPTURA}
                    />
                  </div>
                </Grilla>
              </Pieza>
            ))
          }}
        </BloqueDeSeccion>
      </Envoltorio>
    </Seccion>
  )
}
