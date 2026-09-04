'use client'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Pie } from '../../_componentes/chrome/Pie'
import { Caption, Micro } from '../../_componentes/tipografia/Textos'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeTitular } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { EncabezadoDeSeccion, Seccion } from '../_contrato/Seccion'
import { ColumnasDelPie } from './ColumnasDelPie'
import {
  CTA_DE_CIERRE,
  ETIQUETA_DE_SECCION,
  LINEA_DE_CIERRE,
  TITULAR_DE_CIERRE,
} from './contenido'

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
   * arriba de una pantalla vacía.** Medido en el navegador, con la receta de
   * `docs/rediseno/MEDICION-NAVEGADOR.md`:
   *
   *     ancho   caja del titular   líneas   tinta del titular
   *     1440    1376 px (entera)     1          61,03 px
   *     1920    1856 px (entera)     1          70,86 px
   *
   * Una línea de 957,4 px sobre un cuadro de 1856 con 210,78 px (1440) y
   * 380,22 px (1920) de banda vacía debajo del último renglón. La tabla de
   * deltas (`docs/rediseno/sprints/B1-DELTAS.md` §1) publica de dónde sale la
   * corrección: **las cajas de texto de la referencia son angostas y FIJAS**
   * —480 px a 1440 y a 1920, 0,25 del viewport— y las nuestras crecían con la
   * ventana. Acá se acota igual, y por eso la medida NO es una columna de
   * grilla: una columna fluida vuelve a crecer.
   *
   * **Seis cuerpos del titular** —`calc(var(--text-titulo-xl) * 6)` = 336 px,
   * al lado de los 6,67 cuerpos de la referencia (480 / 72)—. El 6 no es un
   * gusto: es la única banda que parte el titular en 3 líneas a 1440 y en 4 a
   * 1920 sin que la sección se pase de su pantalla. Barrida de 4 en 4 px sobre
   * el titular real, con su tipografía y con `text-wrap: balance` puestos:
   *
   *     ancho   4 líneas       3 líneas       2 líneas
   *     1440    192 – 315 px   316 – 447 px   448 – 827 px
   *     1920    224 – 363 px   364 – 519 px   520 – 959 px
   *
   * La intersección «3 a 1440 · 4 a 1920» es **[316, 363]**; 336 cae en el
   * medio, con 20 px de margen abajo y 27 arriba. Y la palabra más larga del
   * titular mide 243,5 px a 1440 y 282,7 a 1920: entra en la caja en los dos.
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
      <EncabezadoDeSeccion seccion={seccion} nombre={ETIQUETA_DE_SECCION} />

      <Bloque patron="P1">
        {(progreso) => (
          /* ⚠ El envoltorio lleva el `id` con el que la `<section>` se nombra
             (S11, defecto 10). El `h2` sale de `CanalDeTitular`, que no tiene
             prop `id` —`canales.tsx` no es de este frente—, así que el id va en
             el elemento que lo contiene: el nombre accesible se computa del
             contenido, y el contenido de este `div` es exactamente el titular.
             Es una caja de bloque adentro del `Bloque`, que ya era una: no mueve
             un píxel del apilado de `--spacing-12` del pie.

             ⚠ Y ES TAMBIÉN LA CAJA DE LA MEDIDA (B1). El `max-width` va acá y
             no en el `h2`: `CanalDeTitular` parte el texto línea por línea
             MIDIENDO el ancho de su caja, así que acotar el contenedor es lo
             que cambia el corte; acotar el `h2` desde afuera obligaría a pasar
             la clase por `className`, que es donde `cn()` mezcla utilidades de
             texto. Un `div` de bloque con `max-width` no toca ni el árbol de
             encabezados ni el nombre accesible. */
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
        )}
      </Bloque>

      {/* El CTA no cuelga de ningún progreso: la instrucción le asigna P1 al
          titular y P2 a las columnas, y ninguno de los dos es esto. Un tercer
          bloque para un solo enlace sería coreografía que nadie pidió. El
          envoltorio evita que el `inline-flex` del CTA se estire a lo ancho
          del apilado del pie, que es un contenedor `flex` en columna. */}
      <div>
        <CtaEnlace href={CTA_DE_CIERRE.destino} rotulo={CTA_DE_CIERRE.rotulo} />
      </div>

      <Bloque patron="P2">
        {(progreso) => <ColumnasDelPie progreso={progreso} />}
      </Bloque>

      <LineaDeCierre />
    </Pie>
  )
}

/**
 * La última línea del documento. Fecha, razón social y legales no existen y no
 * se inventan: van con su marcador y con la nota que dice qué entra ahí.
 *
 * `opacity-casi` sobre la tinta y no `text-tinta-tenue`: los tokens de tinta
 * secundaria NO se redefinen en `[data-seccion="invertida"]`, así que sobre el
 * fondo oscuro quedan gris medio sobre casi negro. La opacidad, en cambio, se
 * da vuelta con la tinta. El instrumento publica las dos razones de contraste.
 */
function LineaDeCierre(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-[var(--spacing-1)]">
      <Caption como="p" className="font-codigo uppercase">
        {[LINEA_DE_CIERRE.marca, ...LINEA_DE_CIERRE.piezas].join(' · ')}
      </Caption>
      <Micro como="p" className="opacity-casi uppercase">
        {LINEA_DE_CIERRE.nota}
      </Micro>
    </div>
  )
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
