'use client'

import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { Fragment, useRef, useState } from 'react'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, Micro } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { CanalDeUnaPieza, VENTANA_QUE_RECORTA } from '../_contrato/canales'
import { Bloque } from '../_contrato/coreografia'
import type { PropsDeSeccion } from '../_contrato/forma'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

import { CONTENIDO } from './contenido'
import { DemosQuietos } from './demos/DemosQuietos'
import { RUTA_DEL_CTA, TRANSICION_DE_LA_ELEVACION, recorteDeLaRuta, useEncimaDelCta } from './encimaDelCta'
import { DESTINO_DEL_CTA } from './geometria'
import {
  CLASE_DE_LA_BAJADA_ANGOSTA,
  CLASE_DE_LA_FRASE_ANGOSTA,
  CLASE_DEL_TITULAR_DEL_CARTEL,
  ESTILO_DE_LA_CAJA_DE_LA_VENTANA,
  ESTILO_DEL_CARTEL_ANGOSTO,
} from './angosto'
import {
  CONVERSION_DE_LA_CAJA_DEL_CTA,
  DURACION_DEL_TITILEO,
  TOKEN_DEL_TITILEO,
  transformDeLaCapa,
} from './tunel'
import {
  CAJA_DEL_CARTEL,
  HUIDA_DEL_CARTEL,
  ORIGEN_DEL_CARTEL,
  MEDIDA_DEL_CUERPO_CH,
  clasesDelCuerpoDelCartel,
  enLaVentana,
} from './geometria'
import { Proyecto } from './Proyecto'
import { estiloDelLugar, huidaConHisteresis, poseDeLaHuida, transformDeLaPose } from './tunel'

/**
 * LAS PIEZAS DE TEXTO QUE EL ESCENARIO MONTA — el cartel y la rama quieta.
 *
 * Los nombres de los proyectos ya NO están acá: se mudaron a `CapaDelTunel`, que
 * es donde viven los elementos anclados a una esquina. Era la última pieza que
 * resolvía su entrada con otro vocabulario —llegaba de la profundidad con P7 y por
 * el eje vertical con P2— y el tramo tiene dos verbos, no cuatro.
 */

/**
 * EL CARTEL — «Portfolio» y su bajada, anclados arriba y a la derecha del logo.
 *
 * ── ⚠️ NACE Y CRECE, Y DESPUÉS HUYE. Los dos verbos, y ninguno más ───────
 *
 * Subía desde abajo con P2 y se hundía un 60 % de su propio alto para irse. Las
 * dos mitades se jubilan: ahora **crece desde su esquina de arriba a la
 * izquierda**, que queda clavada, y **se va alejándose en z mientras se
 * desvanece** — al mismo tiempo que la primera foto nace. Deslizarse hacia abajo
 * para desaparecer ya no existe en este tramo.
 *
 * Y con eso se cierra solo el margen de 1 px que el hundido dejaba contra el pie
 * del cuadro: el cartel ya no baja, así que no hay nada que pueda asomar.
 *
 * ── ⚠️ EL GESTO NO SE ELIGIÓ DE UN CATÁLOGO: SE COPIÓ DE DOS CALL SITES ──
 *
 * El pedido nombró dos piezas del sitio y dijo que Portfolio tiene que hacer
 * exactamente lo que hacen ellas. Se fue a leerlas, y la lectura corrigió al
 * catálogo —que decía P1 por ser el patrón más usado del corpus—:
 *
 *   · **el titular de «El equipo»** (`quienes-somos/equipo.tsx:54-62`) no usa P1.
 *     Usa **P2** —el bloque entero subiendo desde media altura propia— adentro
 *     de una VENTANA QUE RECORTA: `<span class="block overflow-hidden py-2 -my-2">`
 *     por fuera y `CanalDeUnaPieza` por dentro. El docblock de esa ventana lo
 *     dice con todas las letras: *«sin la máscara, las claves siguen corriendo y
 *     no se nota: ésa fue la regresión del titular»*. La línea base desde la que
 *     salen las palabras ES el borde de abajo de ese recorte.
 *   · **el cuerpo de «develOP es una agencia…»** (`QuienesSomos.tsx:147-157`) usa
 *     **P2 también**, y SIN ventana de recorte: sube desde media altura propia y
 *     ya está. Nada de encenderse palabra por palabra.
 *
 * Así que acá va lo mismo: P2 para los dos, la máscara sólo en el titular, y la
 * ventana de recorte se IMPORTA de la geometría compartida en vez de volver a
 * deletrear sus clases.
 *
 * ── ⚠️ Y EL PINTADO DEL CUERPO SALE ────────────────────────────
 *
 * El cuerpo se encendía palabra por palabra con P3. Se va por dos motivos y los
 * dos son del pedido: el call site que hay que copiar no lo hace, y el gesto se
 * repite después en Servicios —donde el párrafo se pinta mientras el paso
 * avanza—, así que usarlo acá le saca el sentido allá. El cuerpo llega con su
 * gesto y queda pintado.
 *
 * Con él se van el partidor de palabras y `CanalDePiezas` de este archivo.
 *
 * ── Qué mueve qué ───────────────────────────────────────
 *
 * El titular y el cuerpo los mueve **P2**, por canal del contrato compartido, en
 * dos ventanas distintas para que se lean en orden. Lo único que este archivo
 * escribe a mano es la SALIDA —el vuelo hacia adelante en z—, porque no hay
 * patrón del sistema para irse hacia el espectador y el que había iba al revés.
 */
export function PortadaDeTrabajos({
  seccion,
  progreso,
  mostrado,
}: PropsDeSeccion & {
  readonly progreso: MotionValue<number>
  /** El progreso que el túnel MUESTRA: la huida lo lee a él y no al scroll. */
  readonly mostrado: MotionValue<number>
}): React.JSX.Element {
  const cartel = useRef<HTMLDivElement | null>(null)
  /**
   * Cuánto huyó el cartel en el primer cuadro: sale del scroll, como la pose del
   * túnel. ⚠️ Se calcula UNA vez: si se recalculara en cada render, un re-render
   * sin scroll (una época de medición nueva, un resize) le escribiría encima a la
   * histéresis la pose de la ventana de bajada, y subiendo Portfolio volvía
   * encima del túnel.
   */
  const [huidaInicial] = useState(() => enLaVentana(progreso.get(), HUIDA_DEL_CARTEL.bajando))
  /** Cuánto huyó el cartel. La histéresis necesita el cuadro anterior. */
  const huida = useRef(huidaInicial)

  useMotionValueEvent(mostrado, 'change', (p) => {
    const el = cartel.current
    if (el === null) return
    huida.current = huidaConHisteresis(huida.current, p, HUIDA_DEL_CARTEL)
    const pose = poseDeLaHuida(huida.current)
    if (pose === null) {
      el.style.setProperty('visibility', 'hidden')
      return
    }
    el.style.setProperty('visibility', 'visible')
    el.style.setProperty('opacity', pose.opacidad.toFixed(4))
    el.style.setProperty('transform', transformDeLaPose(pose))
  })

  const inicial = poseDeLaHuida(huidaInicial)
  const lugar = estiloDelLugar(CAJA_DEL_CARTEL, ORIGEN_DEL_CARTEL)

  return (
    <div
      ref={cartel}
      data-pieza="cartel"
      /* ⚠️ `justify-center` y no el arranque por defecto: la caja del cartel mide
         0,42 del cuadro y su contenido bastante menos, así que apoyado arriba el
         bloque quedaba 64 px más alto que el medio de la pantalla aunque la CAJA
         estuviera centrada. Lo que el pedido pide que descanse a media pantalla
         es lo que se ve, no la caja que lo contiene. */
      /* MÓVIL-TRABAJOS: abajo de 1024 la caja va de margen a margen y se estira en alto;
         las `!` le ganan al lugar de escritorio, que va en línea. */
      className="absolute flex flex-col justify-center gap-6 will-change-transform max-escritorio:top-[var(--cartel-arriba-angosto)]! max-escritorio:left-[var(--pad-lateral-compacto)]! max-escritorio:h-[var(--cartel-alto-angosto)]! max-escritorio:w-[calc(100%-2*var(--pad-lateral-compacto))]!"
      style={
        inicial === null
          ? { ...lugar, ...ESTILO_DEL_CARTEL_ANGOSTO, visibility: 'hidden' }
          : {
              ...lugar,
              ...ESTILO_DEL_CARTEL_ANGOSTO,
              visibility: 'visible',
              opacity: inicial.opacidad,
              transform: transformDeLaPose(inicial),
            }
      }
    >
      {/**
       * ⚠️ **EL TITULAR: P2 ADENTRO DE LA VENTANA QUE RECORTA.**
       *
       * Copiado de `equipo.tsx:54-62`, que es el call site que el pedido nombró.
       * La ventana —`block overflow-hidden py-2 -my-2`— es lo que hace que el
       * gesto se LEA como una aparición: sin ella P2 sigue corriendo y no se
       * nota, que es textualmente la regresión que su docblock tiene anotada. El
       * relleno y el margen se cancelan en el layout y sólo corren el borde de
       * recorte, para que no se coma una cola de «p».
       *
       * Adentro de la ventana no hay nada focalizable —el titular es texto—, así
       * que `s5-compacto` no tiene nada que decir: la regla del anillo de foco
       * con desplazamiento positivo vale para cajas recortadas CON focalizables.
       *
       * El `id` va en el envoltorio de afuera: el nombre accesible se computa del
       * contenido, que es exactamente el titular.
       */}
      <div id={idDelTitularDeSeccion(seccion.id)}>
        <Bloque patron="P2" rango="ventana-de-la-mascara" className="block w-full">
          {(progresoDeLaMascara) => (
            <span className={VENTANA_QUE_RECORTA}>
              <CanalDeUnaPieza progreso={progresoDeLaMascara} patron="P2" como="span" className="block">
                <Titular nivel="display-xl" como="h2" className={CLASE_DEL_TITULAR_DEL_CARTEL}>
                  {CONTENIDO.titular}
                </Titular>
              </CanalDeUnaPieza>
            </span>
          )}
        </Bloque>
      </div>
      {/* ⚠️ **EL CUERPO: P2 Y SIN VENTANA.** Copiado de `QuienesSomos.tsx:147-157`,
          el otro call site que el pedido nombró: ahí la bajada de la agencia sube
          desde media altura propia y no lleva recorte. La diferencia con el
          titular no es un olvido —es lo que separa a un rótulo de un párrafo—.

          La medida va como estilo en línea y no como clase arbitraria: el número
          vive en `geometria.ts`, que es donde se decide, y así no hay una medida
          deletreada en ningún fuente que el escaneo de Tailwind pueda levantar. */}
      <div style={{ maxWidth: `${MEDIDA_DEL_CUERPO_CH}ch` }}>
        <Bloque patron="P2" rango="ventana-visible" className="block w-full">
          {(progresoDelCuerpo) => (
            <CanalDeUnaPieza progreso={progresoDelCuerpo} patron="P2">
              <p className={clasesDelCuerpoDelCartel()}>{CONTENIDO.bajada}</p>
            </CanalDeUnaPieza>
          )}
        </Bloque>
      </div>
    </div>
  )
}

/**
 * LA RAMA QUIETA — la misma sección, leída como lista.
 *
 * Abajo de 1025 no hay coreografía: no hay preludio que recorrer, no hay
 * conversión que mirar y no hay túnel. Queda el encabezado y los tres trabajos,
 * repartidos sobre el alto que la tabla declara —`min-h-[inherit]` hereda el
 * `min-height` del panel, que es el único lugar donde ese número vive— para que
 * el preludio no deje una pantalla vacía. La oscuridad la pinta la sección; acá
 * no hay velo que poner.
 */
export function RamaQuieta({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Envoltorio
      className="max-escritorio:min-h-[inherit] py-12"
      claseDeContenido="flex max-escritorio:min-h-[inherit] flex-col justify-between gap-12"
    >
      {/* MÓVIL-TRABAJOS: sin el punto azul en ningún ancho (la pieza es compartida y no se
          toca: acá deja de montarse). Desde 1024 la celda lateral queda vacía y el texto no se
          corre; abajo no hay celda y el titular se apoya en el margen de la página. */}
      <Grilla columnas="lateral" className="shrink-0 max-escritorio:grid-cols-1!">
        <div aria-hidden="true" className="max-escritorio:hidden" />
        <div className="flex flex-col gap-2 max-escritorio:gap-6">
          <Titular
            nivel="titulo-m"
            como="h2"
            id={idDelTitularDeSeccion(seccion.id)}
            className={`max-w-[var(--breakpoint-medio)] ${CLASE_DEL_TITULAR_DEL_CARTEL}`}
          >
            {CONTENIDO.titular}
          </Titular>
          <Cuerpo className={`max-w-[var(--breakpoint-medio)] ${CLASE_DE_LA_BAJADA_ANGOSTA}`}>{CONTENIDO.bajada}</Cuerpo>
        </div>
      </Grilla>
      {/* Una pantalla por trabajo, como antes del preludio. Con el `min-h-svh`
          puesto el reparto de `justify-between` tiene que estirar tres pantallas
          entre cuatro huecos y no siete entre cuatro: el ritmo de la lista se
          parece al de una pantalla por proyecto en vez de al de un hueco. */}
      {CONTENIDO.proyectos.map((proyecto, i) => (
        <div key={proyecto.nombre} className="flex min-h-svh flex-col justify-center">
          <Proyecto proyecto={proyecto} indice={i} />
        </div>
      ))}
      {/* ⚠️ **EL CTA TAMBIÉN ACÁ, y no es adorno: es paridad.** Arriba de 1025
          llega como una ventana de navegador que crece; abajo no hay coreografía,
          así que llega como lo que es — un enlace a contacto al final de la lista.
          Si existiera de un solo lado, `s10-acceso` vería dos recorridos de
          teclado distintos según el ancho, que es lo que afirma que no pasa. */}
      <div className="flex min-h-svh flex-col justify-center">
        {/* ⚠️ El enlace es «Hablemos», como arriba de 1025: allá su zona de clic
            cubre la ventana, acá es el CTA del sitio al pie del bloque. El orden de
            lectura es el mismo de los dos lados —dirección, frase, enlace,
            aclaración— porque `s10-acceso` compara las dos ramas. */}
        <div className="flex flex-col gap-2">
          {/* ⚠️ La dirección va PRIMERO, y el orden no es estético: arriba de 1025
              esto es una ventana de navegador y la barra de direcciones está
              arriba de todo. `s10-acceso` compara el texto anunciado de las dos
              ramas carácter por carácter, así que el orden de lectura tiene que
              ser el mismo de los dos lados del umbral. */}
          <Micro como="span" className="font-codigo">
            {CONTENIDO.cta.direccion}
          </Micro>
          <Titular nivel="titulo-l" como="p">
            {CONTENIDO.cta.frase}
          </Titular>
          <div className="flex flex-wrap items-baseline gap-4">
            <CtaEnlace href={DESTINO_DEL_CTA} rotulo={CONTENIDO.cta.rotulo} />
            <Micro como="span" className="font-codigo">
              {CONTENIDO.cta.aclaracion}
            </Micro>
          </div>
        </div>
      </div>
      {/* Después del CTA, las demos: arriba de 1025 se ven por el vacío. */}
      <DemosQuietos />
    </Envoltorio>
  )
}

/** Las dos redefiniciones de la caja de «Hablemos». Ver el docblock en el marcado. */
const ESTILO_DEL_CTA_EN_LA_VENTANA = {
  '--text-cuerpo': 'var(--text-titulo-m)',
  '--color-tinta': 'var(--color-fondo)',
} as React.CSSProperties

/**
 * LA VENTANA DE NAVEGADOR DEL CTA — el marcado, y nada más. **[PORTFOLIO]**
 *
 * Cromo mínimo: los tres círculos y una barra de direcciones con la dirección del
 * visitante. En el medio, la frase, que se escribe letra por letra a medida que la
 * ventana crece. Quién la mueve es `CapaDelTunel`: acá no hay una sola línea de
 * movimiento, para que el marcado se pueda leer de un vistazo.
 *
 * ⚠️ **LA FRASE ESTÁ ENTERA EN EL DOM DESDE EL PRIMER CUADRO, y eso no es un
 * detalle.** Lo que el tipeo apaga es la OPACIDAD de cada letra, no su existencia.
 * Un lector de pantalla anuncia la frase completa desde el principio —que es lo
 * que `s10-acceso` compara entre las dos ramas, carácter por carácter— y nadie
 * escucha un texto apareciendo de a una letra.
 *
 * ⚠️ **Las letras van en `<span>` con `aria-hidden` en el envoltorio y el texto
 * accesible aparte**, porque partir una frase en veintinueve elementos hace que
 * algunos lectores la lean letra por letra. El envoltorio partido es decoración;
 * el que se anuncia es el `sr-only`... y no: `s5-trabajos` afirma cero `sr-only`
 * en esta sección. Se resuelve al revés: el ancla lleva su `aria-label` con la
 * frase entera y las letras van escondidas de los lectores.
 */
export function VentanaDelCta({
  escalaInicial,
  refEnvoltorio,
  refFrase,
  refCursor,
  refVelo,
}: {
  readonly escalaInicial: number
  readonly refEnvoltorio: (el: HTMLDivElement | null) => void
  readonly refFrase: (el: HTMLDivElement | null) => void
  readonly refCursor: (el: HTMLSpanElement | null) => void
  readonly refVelo: (el: HTMLDivElement | null) => void
}): React.JSX.Element {
  const palabras = CONTENIDO.cta.frase.split(' ')
  const cuerpo = useRef<HTMLDivElement | null>(null)
  useEncimaDelCta(cuerpo, usePrefiereMenosMovimiento())
  return (
    <>
      {/* El velo que atenúa la sala. Es una capa pintada y no un filtro: ver
          `VELO_DEL_CTA` en `tunel.ts`. ⚠️ Vive ADENTRO del tercer proyecto, antes
          del CTA: afuera del nido pintaría encima de la ventana. Y adentro hereda
          la escala del proyecto, que al nacer el CTA va por 0,58 del cuadro: por
          eso se extiende un cuadro entero para cada lado, y el recorte del túnel
          lo deja en el cuadro. */}
      <div
        ref={refVelo}
        data-pieza="velo-del-cta"
        aria-hidden="true"
        className="bg-fondo pointer-events-none absolute -inset-full"
        style={{ opacity: 0 }}
      />
      {/* ⚠️ NO `data-pieza="cta"`: esa marca ya es del CTA del hero y del cierre, y
          `deslizamiento.ts` tiene un módulo entero colgado de ella. Robársela le
          daría a esta ventana el gesto de deslizamiento de aquél. */}
      {/* LA CAPA DEL CTA: la última de la tabla, de 0 a 0,4 entre sus dos
          scrolls. Es la caja del cuadro, como las otras, y la escala el lazo. */}
      <div
        ref={refEnvoltorio}
        data-capa="cta"
        className="absolute inset-0 will-change-transform"
        style={{ transform: transformDeLaCapa(escalaInicial) }}
      >
        <div
          data-pieza="ventana-del-cta"
          /**
           * ⚠️ **EL ANCHO LO PONE EL LAYOUT Y LA ESCALA ACUMULADA TERMINA EN 1.**
           *
           * Una caja del ancho del cuadro escalada a 0,62 multiplicaba todo lo de
           * adentro por 0,62 —la URL declarada en 10 px llegaba a la pantalla en
           * 6,2—. Con la caja ya del tamaño final y la cadena terminando en 1, un
           * tamaño declarado es el tamaño que se ve. La cadena termina en 1 por esta
           * escala fija: la conversión entre la caja de su CTA y la nuestra
           * (`CONVERSION_DE_LA_CAJA_DEL_CTA`), que sale de la tabla.
           */
          /* MÓVIL-TRABAJOS: abajo de 1024 la ventana es un iPad y abajo de 426 un iPhone, y
             entra entera en el alto (`CAJA_DE_LA_VENTANA_ANGOSTA`). */
          className="absolute top-1/2 left-1/2 aspect-[var(--ventana-relacion)] w-[var(--ventana-ancho)] max-escritorio:aspect-[var(--ventana-relacion-tablet)] max-escritorio:w-[min(var(--ventana-ancho-tablet),calc(var(--ventana-alto-tablet)*var(--ventana-proporcion-tablet)))] max-movil:aspect-[var(--ventana-relacion-movil)] max-movil:w-[min(var(--ventana-ancho-movil),calc(var(--ventana-alto-movil)*var(--ventana-proporcion-movil)))]"
          style={{
            ...ESTILO_DE_LA_CAJA_DE_LA_VENTANA,
            transform: `translate(-50%, -50%) scale(${CONVERSION_DE_LA_CAJA_DEL_CTA.toFixed(5)})`,
          }}
        >
          <div
            ref={cuerpo}
            data-pieza="cuerpo-de-la-ventana"
            /* ⚠️ `bg-tinta text-fondo` y no una superficie del tema: acá la sala está
               INVERTIDA, así que las superficies son oscuras y la tinta es clara —una
               ventana de navegador pintada con ellas queda gris sobre gris, medido—.
               El par invertido es el mismo que usa la franja de la llave, con su
               contraste conocido, y además es lo que hace que esto se lea como una
               ventana: papel claro con texto oscuro, encima de la noche.
               ⚠️ Ya no es el ancla: el enlace es «Hablemos» (`CtaEnlace`) y su zona de
               clic se estira sobre esta caja, que por eso es `relative`. Sin
               `overflow-hidden`: adentro hay un focalizable y su anillo va por fuera. */
            className="bg-tinta text-fondo rounded-sutil relative flex h-full w-full flex-col max-escritorio:rounded-fuerte max-movil:rounded-[calc(3*var(--radius-fuerte))]"
            style={{ transition: TRANSICION_DE_LA_ELEVACION }}
          >
            {/* El cromo: los tres círculos del semáforo y la barra de direcciones.
                Los círculos son decoración y van con los colores de macOS, que son
                lo que hace reconocible el gesto; la dirección SÍ es contenido y se
                anuncia, porque también está en la lista de abajo de 1025. */}
            {/* MÓVIL-TRABAJOS: el semáforo es de macOS y sólo va desde 1024. Abajo la barra es la
                de Safari: arriba y centrada en el iPad, y compacta, abajo y con el indicador de
                inicio en el iPhone. `order-last` la baja sin mover el orden de lectura. */}
            <div className="flex shrink-0 items-center gap-2 px-5 py-4 max-escritorio:justify-center max-movil:order-last max-movil:flex-col max-movil:gap-3 max-movil:px-4 max-movil:pt-2 max-movil:pb-3">
              <span aria-hidden="true" className="bg-semaforo-rojo block size-3 rounded-full max-escritorio:hidden" />
              <span aria-hidden="true" className="bg-semaforo-amarillo block size-3 rounded-full max-escritorio:hidden" />
              <span aria-hidden="true" className="bg-semaforo-verde block size-3 rounded-full max-escritorio:hidden" />
              <span className="border-fondo rounded-sutil ml-4 flex-1 border px-3 py-1 text-center max-escritorio:bg-fondo/10 max-escritorio:rounded-pastilla-s max-escritorio:ml-0 max-escritorio:max-w-[var(--ventana-barra-tablet)] max-escritorio:border-transparent max-escritorio:py-2 max-movil:w-full max-movil:max-w-none max-movil:flex-none">
                <Cuerpo como="span" className="font-codigo relative">
                  {CONTENIDO.cta.direccion}
                  {/* La ruta que se tipea con el puntero encima (`encimaDelCta.ts`).
                      AFUERA del flujo pero en su lugar estático —sin `top` ni `left`—:
                      queda pegada a la dirección y en su línea base, y la dirección
                      no se corre del centro. Es decoración y no se anuncia. */}
                  <span
                    aria-hidden="true"
                    data-pieza="ruta-del-cta"
                    className="absolute whitespace-nowrap"
                    style={{ clipPath: recorteDeLaRuta(0) }}
                  >
                    {RUTA_DEL_CTA}
                  </span>
                </Cuerpo>
              </span>
              <span aria-hidden="true" className="bg-fondo hidden h-1 w-1/3 rounded-full max-movil:block" />
            </div>
            {/**
             * ⚠️ **LA FRASE ES UN CARTEL, no un renglón centrado.**
             *
             * Tamaño de display, interlineado por debajo de 1 —`leading-cartel`, el
             * único del tema—, alineada a la izquierda y ocupando el ancho de la
             * ventana en tres renglones. Deliberadamente fuera de contexto: un
             * póster editorial adentro de un navegador.
             *
             * ⚠️ **EL TIPEO SE HACE CON UN RECORTE POR PALABRA, no con un elemento
             * por letra**, y es una restricción del repo: dos detectores comparan el
             * texto anunciado de las dos ramas nodo por nodo, y una frase partida en
             * veintinueve elementos deja de tener palabras. Medido: faltaban cuatro.
             * Con un `<span>` por PALABRA y un `clip-path` que la descubre de
             * izquierda a derecha, el texto del documento sigue siendo la frase y lo
             * que se ve sigue siendo letra por letra.
             */}
            <div className="flex flex-1 flex-col justify-center px-8 pb-8 max-movil:px-6 max-movil:pt-8 max-movil:pb-2">
              {/**
               * ⚠️ **EL CURSOR VA POSICIONADO, NO INTERCALADO.**
               *
               * La cabeza de tipeo cae en la MITAD de una palabra —cada palabra se
               * descubre con un recorte de izquierda a derecha—, así que un `_`
               * puesto entre dos palabras del marcado nunca estaría donde el texto
               * termina: estaría adelantado o atrasado hasta el ancho de una
               * palabra entera. Va como UNA pieza absoluta que el bucle mueve.
               *
               * ⚠️ **Y se mueve con `offsetLeft`, no con `getBoundingClientRect`.**
               * La ventana entera del CTA lleva una escala viva, así que los rects
               * de todo lo de adentro vienen multiplicados por ella y el cursor
               * quedaría cada vez más lejos a medida que la ventana crece.
               * `offsetLeft`/`offsetTop` son caja de LAYOUT y no los toca ninguna
               * transformada — la misma lección que el repo ya tiene anotada,
               * aplicada al revés: acá lo que se quiere es ignorarlas.
               *
               * El `relative` de la frase es lo que la hace `offsetParent`. Va en
               * un `span` que sigue siendo `inline`, así que no cambia un corte de
               * renglón del cartel.
               */}
              <Titular nivel="display-xl" como="p" className={`leading-cartel text-left ${CLASE_DE_LA_FRASE_ANGOSTA}`}>
                <span ref={refFrase} data-pieza="frase-del-cta" className="relative">
                  {palabras.map((palabra, p) => (
                    <Fragment key={`${palabra}-${String(p)}`}>
                      {p > 0 ? ' ' : null}
                      <span data-palabra={palabra} className="inline-block" style={{ clipPath: 'inset(0 100% 0 0)' }}>
                        {palabra}
                      </span>
                    </Fragment>
                  ))}
                  <span
                    ref={refCursor}
                    data-pieza="cursor-del-cta"
                    aria-hidden="true"
                    className="absolute top-0 left-0 will-change-transform"
                    style={{ [TOKEN_DEL_TITILEO as string]: DURACION_DEL_TITILEO } as React.CSSProperties}
                  >
                    _
                  </span>
                </span>
              </Titular>
              {/**
               * ⚠️ **«HABLEMOS» ES EL CTA DEL SITIO, y su zona de clic es la ventana.**
               *
               * Baja un renglón y usa el `CtaEnlace` sin tocarlo: su rollover, su
               * subrayado y su foco son los del resto del sitio. Dos redefiniciones
               * en la caja de afuera, y ninguna adentro del componente:
               *   · `--text-cuerpo` → `--text-titulo-m`: más grande que un cuerpo y
               *     claramente más chico que la frase. La ventana del rollover se
               *     deriva de ese token, así que crece con él;
               *   · `--color-tinta` → `--color-fondo`: el CTA pinta SIEMPRE en tinta
               *     (regla cerrada de la paleta), y adentro de esta ventana el papel
               *     es la tinta de la sala. Sin esto era tinta clara sobre papel claro.
               * La clase `after:` estira el `::after` del ancla sobre la ventana
               * entera: todo el cuadro sigue siendo el enlace a contacto, sin un
               * ancla adentro de otra.
               */}
              <div className="flex items-baseline gap-4 pt-12 max-escritorio:flex-wrap max-escritorio:gap-x-4 max-escritorio:gap-y-2 max-movil:pt-8">
                <span style={ESTILO_DEL_CTA_EN_LA_VENTANA}>
                  <CtaEnlace
                    href={DESTINO_DEL_CTA}
                    rotulo={CONTENIDO.cta.rotulo}
                    className="pointer-events-auto after:absolute after:inset-0"
                  />
                </span>
                <Micro como="span" className="font-codigo">
                  {CONTENIDO.cta.aclaracion}
                </Micro>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
