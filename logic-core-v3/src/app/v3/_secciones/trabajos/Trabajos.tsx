'use client'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDePieza } from '../_contrato/canales'
import { NumeroDeSeccion, Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'

import { CONTENIDO } from './contenido'
import { CAJA_DE_LA_CAPTURA, GEOMETRIA } from './geometria'
import { Proyecto } from './Proyecto'

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
 * Un `Bloque patron="P7"` y los tres proyectos como tres piezas con índice 0, 1
 * y 2, cada una `absolute` en el mismo lugar: **superpuestas, no en fila**. Es
 * lo que pide P7 —`translateZ` de −3000 a +1000 con sus dos tramos contiguos,
 * `autoAlpha` 0→1→0, `scale` 0,6→1 y `pointerEvents` conmutando— y es la razón
 * de que sea UN bloque y no tres: la perspectiva la escribe `Bloque` en el
 * ANCESTRO. Tres bloques serían tres puntos de fuga y la pila dejaría de leerse
 * como una escena.
 *
 * ⚠ **Y la caja contra la que se reparten es la de la SECCIÓN, no la del
 * bloque** (`anclaje="seccion"`, B1). El ancla de P7 no cambia; lo que cambia
 * es contra qué se resuelve. Con la caja del bloque —826 px adentro de un hijo
 * `sticky` que no se mueve— los tres pasajes se consumían ANTES de que la
 * sección llegara al tope: medido, opacidad 0 en las tres pantallas, 85,65 % de
 * aire y 849 px de banda vacía. Con la caja de la sección el mismo ancla da
 * `rango = 3240`, del `scrollY` 3240 al 6480: arranca cuando la sección entra y
 * cierra cuando el pin suelta.
 *
 * ⚠ **LOS 268 px DEL FRAME DE LLEGADA SON EL PATRÓN, NO AIRE. No se «arreglan».**
 * En `scrollY` 4320 —el instante en que la sección toca el tope— el instrumento
 * de píxel mide 52,69 % de aire y una banda continua de 268 px, y eso es P7
 * haciendo lo que declara: su primer fotograma es `translateZ(−3000) scale(0,6)
 * autoAlpha 0`, o sea que **los planos todavía están viniendo**. Se disuelve en
 * los 675 px siguientes —a 4995 hay una tarjeta arriba de 0,5 y a 5400 las tres,
 * con 17,96 % de aire y 82 px de banda—. Bajarlo pediría que el gesto ya hubiera
 * terminado cuando la sección llega, que es lo contrario de lo que un patrón de
 * llegada hace. La cifra que califica a esta sección es la del recorrido, no la
 * del primer cuadro.
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
 * la grilla de tres colapsa a una y las tres tarjetas apiladas miden ~810 px
 * contra los ~555 px de `svh` que deja un teléfono. La tabla lo resuelve
 * declarándolo: `pinneada: 'desde-escritorio'`. Sin pin, los 300svh se reparten
 * entre los tres proyectos, uno por pantalla, y no queda desborde ni banda
 * vacía. La decisión está en `secciones.ts`, no escondida en una clase de acá.
 *
 * ⚠ **EL DESPINNEO SE ARREGLÓ A MEDIAS, Y LA MITAD QUE FALTABA ERA UNA BANDA
 * DE DOS PANTALLAS VACÍAS (defecto 3 de SITIO-S10, arreglado en S11).**
 *
 * El párrafo de arriba supone que abajo del umbral la grilla está colapsada, y
 * eso **sólo era cierto abajo de 768**: `Grilla columnas={3}` emite
 * `grid-cols-1 tablet:grid-cols-3`, así que de 768 a 1024 los tres proyectos
 * entraban EN FILA —una pantalla contra las tres declaradas: **dos pantallas de
 * banda oscura vacía**, medidas por `s10-mobile` §2—. El arreglo corre el
 * colapso al MISMO umbral que el pin: la grilla se pide de una columna y la de
 * tres vuelve con la variante `escritorio:`. Así los tres bordes —pin, colapso y
 * pantalla-por-proyecto— caen en 1025 y no queda tramo huérfano. `Grilla` NO se
 * toca: su tabla `3` la consumen otras secciones que sí quieren la fila en 768.
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
 * ── Los tres nombres SÍ son clickeables, y el porqué cambió (V3-D) ────────
 *
 * La sección no tenía un solo control y la razón era exacta: *"no hay página de
 * caso, y las URLs de los clientes no se inventan"*. **Ya no hay que
 * inventarlas**: los tres dominios de producción viven en `proyectos[].enlace`,
 * y el `h3` de cada proyecto es un `<a>` al sitio. Lo que NO cambió: **cero
 * `hover:`** y por lo tanto cero `focus-visible:` —van de a pares—, y la métrica
 * sigue visible y AFUERA del enlace: adentro entraría en su nombre accesible.
 */


export function Trabajos({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      {/* ── EL DESPEJE DE LA PASTILLA, arriba de 1025 ───────────────────────
          `escritorio:pt-16` y no `escritorio:py-8`, y el número sale de la
          pastilla y no del gusto: `BORDE_INFERIOR_EN_REPOSO_PX` son **72 px**
          —24 de reposo más 48 de alto— y esta sección es pinneada, así que su
          hijo se queda apoyado en el tope DOS pantallas enteras. Con 32 px de
          relleno el titular arrancaba en y 48 a 1920 y en y 49 a 1440, o sea
          **debajo** de la pastilla: 24 px de solape sobre el renglón, el 20,31 %
          de su alto, durante todo el pinneo. Con 64 arranca en 83 y 81.
          El costo está medido y es del escenario, que pierde 32 px de los 825
          que le quedaban; la tarjeta mide 736 y sigue entrando. */}
      <Envoltorio
        className="flex h-full flex-col py-4 escritorio:pt-16 escritorio:pb-8"
        claseDeContenido="flex h-full flex-col gap-4 escritorio:gap-8"
      >
        {/* ── EL MARCO QUIETO ─────────────────────────────────────────────
            No se anima: es contra esto que se lee la profundidad. `shrink-0`
            para que el escenario se quede con lo que sobre y no al revés. */}
        <Grilla columnas="lateral" className="shrink-0">
          <NumeroDeSeccion seccion={seccion} />
          <div className="flex flex-col gap-2">
            <EtiquetaDeSeccion>{CONTENIDO.etiqueta}</EtiquetaDeSeccion>
            <Titular nivel="titulo-m" como="h2" id={idDelTitularDeSeccion(seccion.id)} className="max-w-[var(--breakpoint-medio)]">
              {CONTENIDO.titular}
            </Titular>
            <Cuerpo className="max-w-[var(--breakpoint-medio)]">{CONTENIDO.bajada}</Cuerpo>
          </div>
        </Grilla>

        {/* ── EL ESCENARIO ────────────────────────────────────────────────
            `relative` porque las tres piezas se posicionan contra él, y
            `min-h-0 flex-1` para que ocupe lo que queda de la pantalla sin
            empujar al marco. La perspectiva de 1000px la escribe
            `BloqueDeSeccion` acá mismo, en el ancestro de los tres planos.

            `anclaje="seccion"` es lo único que B1 agrega, y es lo que hace que
            el gesto exista: el ancla de P7 se resuelve contra la `<section>` de
            300svh y no contra este bloque de 826 px, que adentro de un hijo
            `sticky` no se mueve. Sin eso, los tres planos terminaban su vuelo
            50 px ANTES de que la sección tocara el tope del viewport y sus tres
            pantallas se veían vacías. El porqué está en `AnclajeDelBloque`. */}
        <Bloque patron="P7" anclaje="seccion" className="relative min-h-0 flex-1">
          {(progreso) => {
            if (progreso === null) {
              /**
               * ── LA RAMA QUIETA, Y POR QUÉ CADA PROYECTO TOMA UNA PANTALLA ──
               *
               * Abajo de 1025 la sección **no se pinnea** —lo declara
               * `secciones.ts` con `pinneada: 'desde-escritorio'`— así que acá
               * no hay una caja clavada de `100svh` que respetar: hay 300svh de
               * documento que scrollean. Con la grilla en UNA columna hasta
               * 1025, los tres proyectos caen uno abajo del otro, y `min-h-svh`
               * le da a cada uno **su** pantalla: tres proyectos por tres
               * pantallas es exactamente el alto declarado de la sección. Ni
               * desborde ni tramo vacío.
               *
               * Desde 1025 pasan las dos a la vez y por la misma razón: vuelve
               * la fila (`escritorio:grid-cols-3`) y la pantalla por proyecto se
               * suelta (`escritorio:min-h-0`). Ahí esta rama sólo aparece con
               * `prefers-reduced-motion` y el panel SÍ está clavado en una
               * pantalla: tres cajas de `svh` adentro de una es el mismo
               * desborde, del otro lado.
               *
               * ⚠ `columnas={1}` con la fila en `className` y no `columnas={3}`
               * porque la tabla de `Grilla` no tiene una entrada de tres que
               * conmute en 1025 —la de `5` sí, y por esta misma razón—, y
               * `Grilla` la comparten las otras secciones: el pedido queda
               * anotado y el arreglo no lo necesita. La clase va literal porque
               * Tailwind escanea el fuente: una armada por template no se emite.
               */
              return (
                <Grilla
                  columnas={1}
                  className="content-center escritorio:h-full escritorio:grid-cols-3"
                >
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
              <CanalDePieza
                key={proyecto.nombre}
                progreso={progreso}
                patron="P7"
                cantidad={GEOMETRIA.planos}
                indice={indice}
                className="absolute inset-0 flex items-center"
              >
                {/* La MISMA grilla de tres, y el plano ocupa DOS de sus tres
                    columnas — ver `columnasDelPlano`: con una sola, la tarjeta
                    medía 394 px adentro de una pantalla que le deja 825 y
                    quedaban 463 px de banda vacía debajo. La clase va literal
                    porque Tailwind escanea el fuente. */}
                <Grilla columnas={3}>
                  <div className="tablet:col-span-2">
                    <Proyecto
                      proyecto={proyecto}
                      rotulo={CONTENIDO.rotuloDeLaMetrica}
                      caja={CAJA_DE_LA_CAPTURA}
                    />
                  </div>
                </Grilla>
              </CanalDePieza>
            ))
          }}
        </Bloque>
      </Envoltorio>
    </Seccion>
  )
}
