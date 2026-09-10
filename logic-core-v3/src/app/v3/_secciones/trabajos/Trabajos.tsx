'use client'

import { Bloque, type Progreso } from '../_contrato/coreografia'
import { Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'

import { CONTENIDO } from './contenido'
import { VENTANA_DE_LA_GOTA } from './geometria'
import { CapaDeLaGota } from './CapaDeLaGota'
import { PlanoDelProyecto, PortadaDeTrabajos, RamaQuieta } from './piezas'

/**
 * 04 · TRABAJOS — la banda oscura, pinneada, con tres planos que vienen de atrás.
 *
 * ── Lo que la tabla decide y esta sección no declara ───────────────────────
 *
 * `secciones.ts` le da `oscuro-opaco`, **300svh** y `pinneada:
 * 'desde-escritorio'`, y ninguna de las tres se escribe acá. `Seccion` ya pone
 * el `<Panel>` con `data-seccion="invertida"` —el tema se da vuelta solo y las
 * MISMAS `bg-fondo text-tinta` pintan invertido— y el hijo `escritorio:sticky
 * escritorio:h-svh`. **Desde 1025 todo lo de acá adentro mide UNA pantalla**, y
 * por eso el envoltorio y el escenario van en `h-full`: los otros 200svh son
 * recorrido de scroll, no lugar donde poner contenido. Abajo del umbral no hay
 * pin y los 300svh se reparten entre los tres proyectos — ver más abajo.
 *
 * ── B2 · LOS MOMENTOS: dos aterrizajes, y los dos al final. [medido] ──────
 *
 * El censo de acontecimientos de `B2-DELTAS.md` §0, a 1920×1080 sobre la página
 * viva y barriendo `[7440, 12000]`, medía **2 grupos: 10200 y 10560–10800**. La
 * sección empieza en 8640, así que **el primer aterrizaje caía 1.560 px después
 * de que la sección arranca** — la segunda mitad del pozo de 5,44 pantallas.
 * Dos cosas lo producían, y las dos se arreglan acá:
 *
 * 1. **Los tres planos volaban a la vez.** El escalonado de P7 los superponía
 *    más del 80 %, así que los tres terminaban amontonados al final del
 *    recorrido. Ahora cada plano se lleva **un tercio del recorrido** y llega
 *    en su propio lugar del scroll: `localDelPlano`, en `geometria.ts`, con la
 *    medición y con lo que NO puede dar (la meseta).
 * 2. **El marco no aterrizaba nunca**, porque no se animaba. Ahora entra con
 *    **P2**, y su ancla —`top bottom → bottom bottom` sobre su propia caja— lo
 *    posa mientras la sección todavía está entrando, antes de que el pin
 *    empiece. Es el primer momento de la sección y llena el tramo de entrada.
 *
 * ⚠ **Y el marco sigue siendo el plano quieto contra el que se lee la
 * profundidad**: su rango de scroll cierra ANTES de que el pin arranque, así que
 * durante las dos pantallas pinneadas no se mueve un píxel.
 *
 * ✅ **B4-A: `contenido.ts` ya declara los DOS**, y §14 del invariante lo afirma
 * como igualdad en vez de publicarlo como delta.
 *
 * ── ✅ B4-A · LA MESETA: cada proyecto llega, SE QUEDA, y sale ─────────────
 *
 * `localDelPlano` ya no acota el tramo arriba: cada plano llega en los primeros
 * 840 px de su tramo, **se queda quieto 240** —el umbral con el que el censo
 * funde dos acontecimientos— y recién ahí sale, **desbordándose 140 px al tramo
 * del siguiente**. Ese desborde es el arreglo: mientras uno se va, el que viene
 * ya está pintado, y los cuadros vacíos de `scrollY` 8640, 9720 y 10800→11880
 * desaparecen. La derivación está en `asentamiento.ts`.
 *
 * ── EL EFECTO ES HTML CON PERSPECTIVA, NO GEOMETRÍA 3D ────────────────────
 *
 * Está medido contra el DOM vivo de la referencia: 44 targets, los 44 `Element`,
 * cero objetos de escena, todos con `matrix3d(...)` y `perspective: 1000px` en
 * un ANCESTRO. Por eso **este archivo no importa una sola línea de `three`, ni
 * de `@react-three/*`, ni de `drei`**, y el invariante lo afirma leyendo los
 * archivos del disco. Cargar un motor 3D para mover tres tarjetas sería pagar
 * un runtime entero por lo que hace la placa con cuatro propiedades.
 *
 * ── UN bloque, tres piezas, apiladas en el mismo lugar ────────────────────
 *
 * Un `Bloque patron="P7"` y los tres proyectos como tres piezas, cada una
 * `absolute` en el mismo lugar: **superpuestas, no en fila**. Es lo que pide P7
 * —`translateZ` de −3000 a +1000 con sus dos tramos contiguos, `autoAlpha`
 * 0→1→0, `scale` 0,6→1 y `pointerEvents` conmutando— y es la razón de que sea
 * UN bloque y no tres: la perspectiva la escribe `Bloque` en el ANCESTRO. Tres
 * bloques serían tres puntos de fuga y la pila dejaría de leerse como escena.
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
 * En `scrollY` 4320 —el instante en que la sección tocaba el tope— el
 * instrumento de píxel medía 52,69 % de aire y una banda continua de 268 px, y
 * eso es P7 haciendo lo que declara: su primer fotograma es
 * `translateZ(−3000) scale(0,6) autoAlpha 0`, o sea que **los planos todavía
 * están viniendo**. Se disolvía en los 675 px siguientes —a 4995 una tarjeta
 * arriba de 0,5 y a 5400 las tres, con 17,96 % de aire y 82 px de banda—.
 * Bajarlo pediría que el gesto ya hubiera terminado cuando la sección llega,
 * que es lo contrario de lo que hace un patrón de llegada.
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
 * contra los ~555 px de `svh` de un teléfono. La tabla lo resuelve
 * declarándolo: `pinneada: 'desde-escritorio'`. Sin pin, los 300svh se reparten
 * entre los tres proyectos, uno por pantalla. La decisión está en
 * `secciones.ts`, no escondida en una clase de acá.
 *
 * ⚠ **EL DESPINNEO SE ARREGLÓ A MEDIAS, Y LA MITAD QUE FALTABA ERA UNA BANDA
 * DE DOS PANTALLAS VACÍAS (defecto 3 de SITIO-S10, arreglado en S11).**
 *
 * El párrafo de arriba supone que abajo del umbral la grilla está colapsada, y
 * eso **sólo era cierto abajo de 768**: `Grilla columnas={3}` emite
 * `grid-cols-1 tablet:grid-cols-3`, así que de 768 a 1024 los tres proyectos
 * entraban EN FILA —una pantalla contra las tres declaradas: **dos pantallas de
 * banda oscura vacía**, medidas por `s10-mobile` §2—. El arreglo corre el
 * colapso al MISMO umbral que el pin, y los tres bordes caen en 1025 sin dejar
 * tramo huérfano. `Grilla` NO se toca: su tabla `3` la consumen otras secciones
 * que sí quieren la fila en 768.
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
 * inventarlas**: los tres dominios de producción viven en `proyectos[].enlace`
 * y el `h3` de cada proyecto es un `<a>` al sitio. Lo que NO cambió: **cero
 * `hover:`** y por lo tanto cero `focus-visible:`, y la métrica sigue visible y
 * AFUERA del enlace — adentro entraría en su nombre accesible. */


export function Trabajos({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      {/* ── ⚠️ B12 · EL ESCENARIO ES LA PANTALLA ENTERA, Y ESO ES EL CAMBIO ──
          Antes el hijo pinneado se repartía en dos: un MARCO clavado arriba
          —número, rótulo, titular y bajada— y el escenario con lo que sobraba.
          Los dos primeros se fueron con los rótulos (§1) y los dos segundos se
          mudaron al escenario como la PORTADA, así que acá ya no hay nada que
          repartir: el bloque de P7 ocupa la pantalla completa y todo lo que
          entra, entra centrado.

          El `Envoltorio` —relleno lateral y tope de 1920— bajó a cada pieza, y
          es lo que permite que la GOTA llegue a los bordes del cuadro: una capa
          `absolute inset-0` adentro de un envoltorio con 32 px de relleno
          dejaría una banda sin cubrir en los cuatro lados.

          ⚠ **El despeje de la pastilla (`escritorio:pt-16`) se fue con el marco,
          y es correcto que se vaya:** existía porque el titular arrancaba en
          y 48 y quedaba DEBAJO de la pastilla de navegación durante todo el
          pinneo. Ahora lo que ocupa el tope del cuadro es el borde superior de
          una captura centrada verticalmente, no un renglón. La rama quieta lo
          conserva, porque ahí el encabezado sigue arriba. */}
      <Bloque patron="P7" anclaje="seccion" lente="escena" className="relative h-full w-full">
        {(progreso: Progreso) => {
          if (progreso === null) return <RamaQuieta seccion={seccion} />
          return (
            <>
              {/* ── LA GOTA, y por qué va PRIMERA en el marcado ─────────────
                  Los hermanos posicionados se pintan en orden de documento, así
                  que la gota queda DEBAJO de la portada y de los planos: la
                  transición tapa la sala, nunca el contenido. Su color es
                  `var(--color-fondo)`, que adentro de la sección invertida vale
                  #0E0E0E — el color de la noche, no un color nuevo. */}
              <CapaDeLaGota
                progreso={progreso}
                ventana={VENTANA_DE_LA_GOTA}
                className="bg-fondo pointer-events-none absolute inset-0"
              />
              <PortadaDeTrabajos seccion={seccion} progreso={progreso} />
              {CONTENIDO.proyectos.map((proyecto, indice) => (
                <PlanoDelProyecto key={proyecto.nombre} progreso={progreso} indice={indice} proyecto={proyecto} />
              ))}
            </>
          )
        }}
      </Bloque>
    </Seccion>
  )
}
