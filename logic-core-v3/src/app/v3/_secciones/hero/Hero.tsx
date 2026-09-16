'use client'

import { cn } from '@/lib/utils'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Bloque } from '../_contrato/coreografia'
import { CanalDePieza } from '../_contrato/canales'
import { Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'

import { CONTENIDO } from './contenido'
import {
  GEOMETRIA,
  TIPOGRAFIA_DEL_TITULAR,
  TIPOGRAFIA_DE_LA_SEGUNDA_LINEA,
} from './geometria'

/**
 * 01 · HERO — una pantalla, la escena a la vista, y el aire del pie reservado.
 *
 * ── El lugar que ocupa en el recorrido, y por qué es la única así ──────────
 *
 * `secciones.ts` le da `papel-transparente`, **100svh** y ningún pinneo. Las
 * tres cosas se leen con `seccionDeA('hero')` y ninguna se declara acá: el
 * alto, la superficie y el pinneo son del recorrido, no de la sección.
 *
 * Es la primera de las dos pantallas del sitio que dejan ver el canvas —Hero y
 * Por qué develOP— y por eso **esta sección no pinta fondo**. No hay un `bg-` en
 * toda la composición, y no es un olvido: el panel es transparente y la sala se ve
 * a través suyo. Un fondo puesto acá para que el texto se lea mejor apagaría lo
 * único que esta pantalla tiene y ninguna otra tiene.
 *
 * ── El texto va sobre la escena: qué se midió y qué NO ─────────────────────
 *
 * `hero.invariant.tsx` calcula la razón de contraste de `--color-tinta` contra
 * los dos tokens que pinta el marcador de posición del canvas y reporta el peor
 * caso. Sale muy por arriba de AA, así que el texto no necesita ninguna capa
 * abajo — y ésa es la razón por la que no la tiene.
 *
 * ⚠ **Esa cifra vale para el MARCADOR DE POSICIÓN, no para la escena real.** El
 * marcador son dos tokens planos; la sala 3D es un gradiente con luces y no hereda
 * el número. El día que la escena exista hay que volver a medir sobre la pose real,
 * y si ahí no diera AA la salida NO es una capa de fondo acá: es la escena, que es
 * de otro sprint. Queda reportado.
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
 * El `pt-20` de arriba NO es la simetría del de abajo: son dos decisiones que hoy
 * dan el mismo valor. El de abajo está atado a la geometría de la pastilla y el
 * invariante lo afirma contra ella; el de arriba es aire.
 *
 * ── La coreografía: un P1, un P2, y una cosa que no se mueve ───────────────
 *
 * P1 para el titular y P2 para el bloque de bajada y CTA, cada uno resolviendo su
 * ancla contra su propia caja — no hay un `stagger` coordinándolos, y no hace
 * falta.
 *
 * ⚠️ **EL TITULAR DEJÓ DE SALIR POR `TextoPorLineas`, Y NO ES UNA PREFERENCIA.**
 * Ese componente reparte UNA cadena en líneas MIDIENDO dónde cortan, con UNA
 * tipografía heredada. Desde el rehecho las dos líneas del titular son dos
 * registros distintos —Archivo condensado 700 en mayúsculas arriba, Chivo Light
 * itálica abajo— y **dos caras no pueden salir de un divisor que reparte una
 * sola cadena con una sola métrica**. Así que el corte pasa a ser declarado y
 * cada línea es una pieza de P1 con su `indice`: el gesto del patrón es el
 * mismo, cambia quién decide dónde termina cada línea.
 *
 * Lo que se gana además: el `h1` vuelve a ser un encabezado con contenido de
 * frase y se cae el par `sr-only` + `aria-hidden` que `TextoPorLineas` necesita
 * —su docblock lo declara como desviación— porque `LineasDeTexto` emite un
 * `<div>`. `quienes-somos` sigue usándolo y la desviación sigue reportada ahí.
 *
 * ⚠️ **B2 · LOS DOS LLEGAN A DESTINO ANTES DE `scrollY` 0, Y ESO NO ES UN
 * DEFECTO ARREGLABLE ACÁ: ES LA ARITMÉTICA DE UNA PANTALLA.** El rango de P2
 * cierra en `fondo del bloque − alto de ventana` y el de P1 en eso más 240 px;
 * en una sección de UNA pantalla el fondo de cualquier bloque es ≤ la ventana,
 * así que los dos cierran en negativo. Medido a 1920×1080: el titular en −295 y
 * la bajada en −360, y el censo de acontecimientos no ve UN SOLO elemento del
 * hero cambiando en todo el documento. B2 pedía dos aterrizajes acá y se frenó:
 * la aritmética, las tres salidas y su costo están en `hero.invariant.tsx` §13.
 *
 * ⚠️ **EL SLOGAN SE FUE, Y CON ÉL LA ÚNICA PIEZA QUIETA DE LA PANTALLA.** Hasta
 * este ajuste la línea de marca iba arriba del titular y NO se animaba, con un
 * motivo escrito: era «lo único que sostiene la pantalla mientras el preloader
 * todavía está saliendo», y animar las tres cosas dejaba el primer cuadro
 * vacío. El pedido del humano la elimina como elemento propio, así que la
 * columna arranca ahora en el titular y **las cuatro piezas de la columna se
 * animan**. El primer cuadro del hero queda sin nada quieto: es una consecuencia
 * de la resta, está medida en `hero.invariant.tsx` §6, y no se compensa acá.
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
 *
 * ── Dónde están los números ───────────────────────────────────────────────
 *
 * En `geometria.ts`, junto con las dos constantes de tipografía del titular.
 * Salieron de acá cuando este archivo cruzó las 300 líneas del repo al
 * rehacerse el titular; el corte, y por qué las tipografías van con la
 * geometría y no con el marcado, están escritos allá.
 */

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
      {/* `registro="rotulo"`: mayúsculas, `--tracking-micro` —el único
          interletrado positivo del sistema— y la regla horizontal en tinta
          puesta en reposo. El rótulo NO cambia. Las tres cosas salen de tokens
          que ya existían y el porqué de que sea un atributo aparte y no una
          tercera `VarianteCta` está en `Cta.tsx`: esa tabla son las dos formas
          MEDIDAS y no se le agrega una decisión nuestra. */}
      <CtaEnlace
        href={CONTENIDO.cta.destino}
        rotulo={CONTENIDO.cta.rotulo}
        registro="rotulo"
      />
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
            `Panel`, así que las dos cajas dicen lo mismo.

            ⚠️ **`justify-end` ABAJO DEL BREAKPOINT, Y ES LA ÚNICA COSA QUE ESTE
            SPRINT MUEVE.** Decisión del dueño mirando la referencia: en vertical
            el logo va arriba y el texto abajo. El motivo medido: con el bloque
            centrado, el logo —que en esos anchos es MÁS ANCHO QUE EL CUADRO y
            cae en el medio de la pantalla— se come el titular. Medido sobre el
            píxel con `scripts-tapado/a-verdad.ts`, tinta del titular sobre la
            masa negra del logo: **56,2 % a 375 · 54,8 % a 390 · 48,1 % a 425 ·
            56,8 % a 768 · 20,6 % a 1024**, contra **0,6 % a 1440 y 0,1 % a
            1920**. Los dos anchos de escritorio están bien compuestos y por eso
            conservan `justify-center` — es lo que hace la variante.

            El bloque entero baja: titular, bajada y CTA. El orden interno no
            cambia, y ninguna otra clase se toca. `pb-20` sigue siendo el que
            reserva los 72 px de la pastilla (`soporte.ts` lo afirma contra
            `DESCUENTO_NACIMIENTO_PX`), así que `justify-end` apoya el bloque
            exactamente en ese borde y no debajo de la pastilla.

            ⚠ **A 320 esto NO alcanza, y está medido.** Ahí el bloque ocupa el
            66 % del viewport contra una masa de logo del 37 %: la suma pasa de
            100, así que **no existe ninguna posición en la que no se toquen**.
            El barrido de la mejor posición posible da 21,8 % pegado al borde de
            arriba; medido en pantalla, `justify-end` deja 31,5 % contra el
            30,7 % de antes. No es una regresión de este cambio: es que a ese
            ancho no existe una posición limpia. Los números están en
            `s10-logo-composicion.ts` y la salida no es de acá. */}
        <div
          data-pantalla="hero"
          className="flex min-h-svh w-full flex-col justify-end pt-20 pb-20 escritorio:justify-center"
        >
          <Grilla columnas="lateral">
            {/* ⚠️ LA COLUMNA LATERAL SE QUEDA VACÍA, Y NO ES UN `MarcaDeSeccion`
                MENOS: es un `<div>` que RESERVA la celda. La grilla `lateral`
                tiene dos celdas —140 px fijos y una fluida— y si el Hero pasara
                un solo hijo, la sub-grilla de 5 caería en la celda de 140 y la
                composición entera se correría. Es la misma forma que
                `CabeceraDeSeccion` ya usa cuando no le dan contenido.

                Lo que se fue es el CUADRADO de `--color-acento` que la marca
                pintaba ahí: pedido del humano, «muy afuera de la columna». La
                pieza no se toca —las otras tres secciones y el pie la siguen
                montando— y la columna de 140 px tampoco, porque es la que
                sostiene el cierre estructural de B11 (`Rotulo.tsx`). */}
            <div />
            <Grilla columnas={GEOMETRIA.columnasTotales}>
              <div className={cn('flex flex-col gap-8', GEOMETRIA.claseDeLaMedida)}>
                {/* La caja del titular: 2 de 3 de la medida. El porqué —y los
                    tres bordes seguros medidos sobre el píxel— están en
                    `GEOMETRIA.columnasDeLaCajaDelTitular`. La clase del tramo va
                    en el Bloque, que es el elemento que se mide: un envoltorio
                    de más entre la celda y el bloque no agrega nada. */}
                <Grilla columnas={GEOMETRIA.columnasDeLaCajaDelTitular}>
                  <Bloque patron="P1" className={GEOMETRIA.claseDelTitular}>
                    {(progreso) => (
                      // El `h1` es el nombre accesible de la región del Hero (S11,
                      // defecto 10), y acá es además el que junta los dos registros
                      // en UN nombre: «Tu negocio vendiendo las 24 hs». Las dos
                      // piezas son `<span>` —contenido de frase, que es lo único
                      // que un encabezado admite— así que no hace falta el par
                      // `sr-only` + `aria-hidden` que `TextoPorLineas` necesita
                      // para poder emitir un `<div>` adentro del `h1`.
                      <h1
                        id={idDelTitularDeSeccion(seccion.id)}
                        data-titular="dos-registros"
                        className="flex flex-col items-start"
                      >
                        {/* ⚠️ **LA LÍNEA 1 ES LA PIEZA QUIETA, Y NO PASA POR UN
                            CANAL.** Sin coreografía de entrada, presente en el
                            primer cuadro. Devuelve lo que el hero perdió al
                            irse el cepillo, que era la única pieza sin entrada
                            y estaba ahí por un motivo escrito: **sostiene la
                            pantalla mientras el preloader todavía está
                            saliendo**. Sin nada quieto, el primer cuadro del
                            hero queda vacío, que es exactamente el defecto que
                            una coreografía de entrada existe para evitar.

                            No es «P1 con duración cero»: es OTRO árbol, sin
                            primitiva montada, sin suscripción al progreso y sin
                            una transformada por cuadro. La línea 2 se queda con
                            P1 y es su única pieza. */}
                        <span className={TIPOGRAFIA_DEL_TITULAR}>{CONTENIDO.titularLinea1}</span>
                        {/* ⚠️ ESTE ESPACIO NO ES FORMATO: es el separador del
                            NOMBRE ACCESIBLE. Las dos piezas son hermanas y sin
                            nada en medio el h1 se anuncia «Tu negocio
                            vendiendolas 24 hs» — el mismo defecto que
                            `_lib/cta.ts` documenta para las dos copias del
                            rollover de la referencia. Lo encontró
                            `hero.invariant.tsx` §7 y no se ve: las dos piezas
                            son ítems de un contenedor `flex-col`. */}
                        {' '}
                        <CanalDePieza
                          progreso={progreso}
                          patron="P1"
                          cantidad={GEOMETRIA.piezasAnimadasDelTitular}
                          indice={0}
                          como="span"
                          className={TIPOGRAFIA_DE_LA_SEGUNDA_LINEA}
                        >
                          {CONTENIDO.titularLinea2}
                        </CanalDePieza>
                      </h1>
                    )}
                  </Bloque>
                </Grilla>

                {/* La bajada y el CTA en media medida. El CTA viaja adentro de la
                    misma caja a propósito: `items-start` lo deja en su ancho, así
                    que acotar la caja no lo estira ni lo corta. */}
                <Grilla columnas={GEOMETRIA.columnasDeLaCajaDeLaBajada}>
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
                </Grilla>
              </div>
            </Grilla>
          </Grilla>
        </div>
      </Envoltorio>
    </Seccion>
  )
}
