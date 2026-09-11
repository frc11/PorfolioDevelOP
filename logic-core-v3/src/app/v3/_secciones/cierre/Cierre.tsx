'use client'

import { useTransform, type MotionValue } from 'motion/react'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Pie } from '../../_componentes/chrome/Pie'
import { Bloque, type Progreso } from '../_contrato/coreografia'
import { CanalDeTitular, CanalDeUnaPieza } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { CabeceraDeSeccion, Seccion } from '../_contrato/Seccion'
import { asentar } from './asentamiento'
import { ColumnasDelPie } from './ColumnasDelPie'
import { LineaDeCierre } from './LineaDeCierre'
import { CTA_DE_CIERRE, TITULAR_DE_CIERRE } from './contenido'

/**
 * EL CIERRE — el último cuadro del sitio. La mitad de DOM de "la cámara se
 * aleja": las columnas que suben.
 *
 * ── Qué es de este lane y qué no ──────────────────────────────────────────
 *
 * La observación de la referencia tiene dos mitades: **la cámara se aleja y la
 * marca retrocede hacia el horizonte** (eso es de la ESCENA, y este lane no la
 * toca) **mientras las columnas de enlaces suben** (eso es DOM, y es esto). La
 * mitad que falta queda reportada como hueco declarado, no como olvido.
 *
 * ── El pie se consume entero; acá no se rehace nada ───────────────────────
 *
 * `Pie` pone el `<footer>`, su envoltorio y el apilado de `--spacing-12`; sus
 * piezas y sus estados viven en `chrome/` y en `_estilos/pie.css`. Este archivo
 * no declara un `<footer>`, ni una regla de pie, ni un `data-pieza`: pone
 * contenido adentro de la caja que ya existe.
 *
 * ── Por qué NO se le pasa `invertido` a `Pie` ─────────────────────────────
 *
 * La sección ya lleva `data-seccion="invertida"` cuando su superficie lo pide
 * —lo escribe `Panel` leyendo `_lib/secciones.ts`, que es del lane A— y
 * `[data-pieza="pie"]` pinta `var(--color-fondo)`, que ese bloque ya redefinió.
 * Pasar `invertido` sería declarar dos veces la misma decisión y clavarla acá
 * en vez de en la tabla. Consecuencia buscada: la sección es correcta con
 * `papel-opaco` —lo que la tabla dice HOY— y con `oscuro-opaco` —lo que el
 * contrato acordó— sin tocar una línea. El instrumento lo afirma renderizando
 * el MISMO subárbol bajo las dos superficies.
 *
 * ── Dos bloques, no uno ───────────────────────────────────────────────────
 *
 * P1 y P2 no comparten ni ancla ni `scrub` —P1 mide `top bottom-=80px` con un
 * segundo de inercia; P2 mide `top bottom` sin inercia—, así que cada uno
 * cuelga de su propio progreso. Un solo bloque para los dos obligaría a elegir
 * un ancla y a mentir sobre la otra.
 *
 * ── El titular usa `CanalDeTitular` y no `TituloDeCierreDelPie` ───────────
 *
 * Los dos dan la misma medición —`titulo-xl`, `tracking.titulo`, peso normal—
 * porque los tres salen del default de `NIVELES_TIPOGRAFICOS['titulo-xl']`. La
 * diferencia es que el canal es el único que sabe partir el texto línea por
 * línea con P1 y traer su rama quieta. Reescribir eso adentro del título del
 * pie sería duplicar `CanalDeTitular`; lo único que hacía falta de la otra
 * pieza era `text-balance`, que entra por `className`.
 */

/**
 * LA GEOMETRÍA — los números de composición de la sección, juntos y fuera del
 * contenido. Están acá, y no en `contenido.ts`, porque son técnicos: los decide
 * quien compone y no cambian el día que llegue el copy definitivo.
 */
export const GEOMETRIA = {
  /**
   * ── B1 · LA MEDIDA DEL TITULAR: SEIS CUERPOS, Y NO ACOMPAÑA A LA VENTANA ──
   *
   * **El titular de cierre entraba en UNA línea y flotaba en el tercio de
   * arriba de una pantalla vacía.** Medido en el navegador (la receta de
   * `MEDICION-NAVEGADOR.md`): la caja entera —1376 px a 1440 y 1856 a 1920— con
   * el titular en UNA línea de 957,4 px y 210,78 / 380,22 px de banda vacía
   * debajo. La corrección sale de `B1-DELTAS.md` §1: **las cajas de texto de la
   * referencia son angostas y FIJAS** —480 px a 1440 y a 1920, 0,25 del
   * viewport— y las nuestras crecían con la ventana. Por eso la medida NO es una
   * columna de grilla: una columna fluida vuelve a crecer.
   *
   * **Seis cuerpos del titular** —`calc(var(--text-titulo-xl) * 6)` = 336 px,
   * al lado de los 6,67 cuerpos de la referencia (480 / 72)—. El 6 no es un
   * gusto: barrida de 4 en 4 px sobre el titular real, con su tipografía y su
   * `text-wrap: balance`, las bandas de 3 líneas a 1440 (316–447) y de 4 a 1920
   * (224–363) se cruzan en **[316, 363]**; 336 cae en el medio, con 20 px de
   * margen abajo y 27 arriba. La palabra más larga mide 243,5 px a 1440 y 282,7
   * a 1920: entra en los dos.
   *
   * ⚠ El NIVEL tipográfico no se toca: `titulo-xl` sigue siendo el más grande
   * de la escala. Lo que se acota es la caja, no la letra — la misma decisión
   * que la Fase 0 tomó en el Hero, por otra razón y con el mismo instrumento.
   */
  claseDeLaMedidaDelTitular: 'max-w-[calc(var(--text-titulo-xl)*6)]',
  /** Cuántos cuerpos mide la caja. El literal de arriba lo repite y el
   *  invariante afirma que los dos dicen lo mismo. */
  cuerposDeLaMedidaDelTitular: 6,
  /**
   * Cuántas líneas ocupa el titular a escritorio, con la medida puesta. Es
   * MEDIDO —no una promesa— y entra en el modelo de alto de §14 del
   * invariante, que hasta ahora sumaba una sola caja de línea.
   */
  lineasDelTitularEnEscritorio: 3,
} as const

/**
 * El contenido de la sección, SIN su `<section>`.
 *
 * Está separado para que el instrumento pueda montarlo bajo una superficie
 * forzada y comprobar que el pie se ve correcto con las dos. En la ruta nadie
 * lo usa suelto: se usa `Cierre`.
 */
export function ContenidoDelCierre({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    /* ── B1 · LA CADENA DE ALTO, para que el apilado se reparta ────────────
       Tres `grid` encadenados y un `content-between`. El `<footer>`, el
       envoltorio y la caja de contenido son cada uno ítem de grilla del de
       arriba, así que **se estiran** hasta el `min-h-svh` de la sección; sin
       esa cadena la caja de contenido queda de altura automática y el apilado
       se amontona arriba. Medido antes: 337 px de banda vacía continua debajo
       del último renglón a 1920. `content-between` y no `justify-between`
       porque la caja de contenido es una GRILLA de una columna: reparte las
       filas, que es lo mismo que el `justify` hace en un flex. */
    <Pie className="grid" claseDeEnvoltorio="grid" claseDeContenido="grid content-between">
      {/* ⚠️ B12: era el `08` con «Cierre». Los dos se fueron de las ocho. */}
      <CabeceraDeSeccion />

      {/* ⚠️ B9 · ESTE BLOQUE **NO** DECLARA `rango="ventana-visible"`, y es una
          omisión con número: `D-B9.C1`. Su ancla de P1 YA es la de la regla, así
          que la prop sería un no-op — pero `asentar` lo devuelve a
          `bottom bottom` y ahí aterriza con su borde inferior en 0,967 del
          cuadro (1920) en vez de 0,778. Declarar la regla acá sería afirmar algo
          que el remapeo desmiente. Sacar el remapeo es lo que hay que hacer, y
          toca la propiedad de B2 que `asentamiento.ts` sostiene: va aparte, con
          lo medido escrito ahí. */}
      <Bloque patron="P1">
        {(progreso) => <TitularDelCierre seccion={seccion} progreso={progreso} />}
      </Bloque>

      {/* ── B2 · EL CTA ENTRA, Y ENTRA CON LAS COLUMNAS ──────────────────────
          Hasta B2 no colgaba de ningún progreso, y la razón escrita era que la
          instrucción le asignaba P1 al titular y P2 a las columnas. B2 lo nombra
          entre las tres piezas que "entran hoy juntas", así que ahora entra.

          **P1 y no P2, y es una decisión medida.** Con P2 el enlace aterrizaría
          en 17828 —dentro del grupo de `por-que-develop`, que cierra en 17760— y
          eso volvería a fundir los dos grupos que el asentamiento del titular
          acaba de separar. Con P1 aterriza en 18081, o sea con las columnas del
          pie (18099 → 18175), y el Cierre queda con UN momento propio y nítido.
          P1 sobre un enlace no es una desviación del corpus: `a` es uno de los
          seis elementos que el patrón mide en la referencia.

          El `Bloque` reemplaza al envoltorio que ya estaba —el que evita que el
          `inline-flex` del CTA se estire a lo ancho del apilado del pie— y la
          pieza pone otro adentro: dos cajas de bloque donde había una, ninguna
          con medida propia. */}
      {/* ⚠️ B9 · ESTE BLOQUE **NO** DECLARA `rango="ventana-visible"` PORQUE LA
          REGLA NO SE PUEDE CUMPLIR ACÁ, y está medido: `D-B9.C2`.

          El punto de llegada de la regla —borde inferior de la caja a 240 px
          del borde de abajo del cuadro— le cae a este bloque en `scrollY`
          **18.415 a 1920 y 15.376 a 1440**, y el último píxel de scroll del
          documento es **18.360 y 15.300**. Son **55 px y 76 px DESPUÉS del
          final del scroll**: las tres columnas del pie se quedarían al 87 % de
          su entrada, para siempre, sin un solo error en consola.

          El Cierre es la última pantalla y el scroll se termina antes que él
          —`asentamiento.ts` ya lo tenía medido: la sección ocupa el documento
          de 18.360 a 19.440 y el último píxel de scroll es 18.360—. Eso no lo
          arregla un ancla: lo arreglaría mover el bloque en el documento, que
          es composición y no es de este bloque. Queda con el ancla de P2, que
          es la única que ahí adentro llega. */}
      {/* ⚠️ **B13 · LA BANDA SE REVIRTIÓ Y ESTO QUEDÓ COMO AGRUPADOR.** El pedido
          fue textual —*«el footer sigue siendo sólido, no transparente»*— y lo que
          la reversión destapa se declara (`D-B13.3`) en vez de taparse otra vez.
          Se conserva el `<div>` con su `grid gap-12` porque es lo que deja la caja
          de contenido en TRES filas: sacarlo la devuelve a CINCO y mueve el censo
          de B9, que está en su vara. El sangrado horizontal (`mx-` negativo +
          `px-`) se fue con el fondo: existía sólo para que el fondo llegara más
          lejos que el contenido. Lo que B12 puso acá y por qué: `_estilos/pie.css`
          y `docs/rediseno/outputs/B12-CIERRE.md` §2. ⚠ Es un `<div>` y no un
          componente, y es peso medido: envolverlo cuesta **81 B** (A/B). */}
      <div data-pieza="banda-del-pie" className="grid gap-[var(--spacing-12)]">
        <Bloque patron="P1" rango="ventana-visible">
          {(progreso) => (
            <CanalDeUnaPieza progreso={progreso} patron="P1">
              <CtaEnlace href={CTA_DE_CIERRE.destino} rotulo={CTA_DE_CIERRE.rotulo} />
            </CanalDeUnaPieza>
          )}
        </Bloque>

        <Bloque patron="P2">
          {(progreso) => <ColumnasDelPie progreso={progreso} />}
        </Bloque>

        <LineaDeCierre />
      </div>

    </Pie>
  )
}

/**
 * EL TITULAR — con su medida, su `id` y su asentamiento.
 *
 * ⚠ El envoltorio lleva el `id` con el que la `<section>` se nombra (S11,
 * defecto 10). El `h2` sale de `CanalDeTitular`, que no tiene prop `id`
 * —`canales.tsx` no es de este frente—, así que el id va en el elemento que lo
 * contiene: el nombre accesible se computa del contenido, y el contenido de
 * este `div` es exactamente el titular. Es una caja de bloque adentro del
 * `Bloque`, que ya era una: no mueve un píxel del apilado de `--spacing-12`.
 *
 * ⚠ Y ES TAMBIÉN LA CAJA DE LA MEDIDA (B1). El `max-width` va acá y no en el
 * `h2`: `CanalDeTitular` parte el texto línea por línea MIDIENDO el ancho de su
 * caja, así que acotar el contenedor es lo que cambia el corte; acotar el `h2`
 * desde afuera obligaría a pasar la clase por `className`, que es donde `cn()`
 * mezcla utilidades de texto.
 */
function CajaDelTitular({
  seccion,
  progreso,
}: PropsDeSeccion & { readonly progreso: Progreso }): React.JSX.Element {
  return (
    <div id={idDelTitularDeSeccion(seccion.id)} className={GEOMETRIA.claseDeLaMedidaDelTitular}>
      <CanalDeTitular
        progreso={progreso}
        patron="P1"
        texto={TITULAR_DE_CIERRE}
        nivel="titulo-xl"
        como="h2"
        className="text-balance"
      />
    </div>
  )
}

/**
 * ── B2 · EL TITULAR ATERRIZA ANTES DEL PIE, Y ASÍ EL CIERRE TIENE MOMENTO ──
 *
 * `asentar` satura el progreso de P1 en la fracción del rango donde el bloque
 * terminó de ENTRAR al cuadro; los 240 px que el ancla declara de más quedan de
 * asentamiento. De dónde sale la fracción y qué se midió para necesitarla está
 * en `asentamiento.ts`. En una línea: el titular aterrizaba a 135 px de las
 * columnas del pie y el censo de acontecimientos leía las dos cosas —y las de
 * `por-que-develop`— como un solo grupo, así que el Cierre medía CERO
 * acontecimientos propios.
 *
 * Vive en su propio componente porque `useTransform` es un hook: llamarlo
 * detrás de un `if` sería llamarlo condicionalmente. Es la misma forma que
 * `ServiciosEnSecuencia` y `tu-panel/Capacidades` ya usan.
 */
function TitularDelCierre({
  seccion,
  progreso,
}: PropsDeSeccion & { readonly progreso: Progreso }): React.JSX.Element {
  if (progreso === null) return <CajaDelTitular seccion={seccion} progreso={null} />
  return <TitularAsentado seccion={seccion} progreso={progreso} />
}

function TitularAsentado({
  seccion,
  progreso,
}: PropsDeSeccion & { readonly progreso: MotionValue<number> }): React.JSX.Element {
  const asentado = useTransform(progreso, asentar)
  return <CajaDelTitular seccion={seccion} progreso={asentado} />
}

/**
 * LA SECCIÓN. Recibe su entrada de la tabla y NADA MÁS: no consulta la
 * compuerta.
 *
 * Quien decide si hay coreografía es la composición del home, una sola vez y
 * arriba de las ocho. Es lo que permite que el instrumento renderice las DOS
 * ramas —instalando o no las primitivas animadas— sin inventar un atributo de
 * forzado en el producto.
 */
export function Cierre({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    /* `grid min-h-svh` es el primer eslabón de la cadena de alto del pie (B1):
       da la pantalla contra la que repartir y hace del `<footer>` un ítem de
       grilla, que estira. La caja de pantalla es NUEVA en esta sección —antes
       su alto era intrínseco y el `min-height` de la tabla el único piso— y
       `s10-mobile` lo declara. No cambia el alto en ningún ancho: la sección ya
       tenía `min-height: 100svh` de la tabla. */
    <Seccion seccion={seccion} className="grid min-h-svh">
      <ContenidoDelCierre seccion={seccion} />
    </Seccion>
  )
}
