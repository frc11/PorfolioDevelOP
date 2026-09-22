'use client'

import { useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { Fragment, useRef } from 'react'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, Micro } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { palabrasDe } from '../../_lib/palabras'
import { CanalDePiezas, CanalDeTitular } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { MarcaDeSeccion } from '../_contrato/Seccion'

import { CONTENIDO } from './contenido'
import { DESTINO_DEL_CTA } from './geometria'
import { ANCHO_DEL_CTA, RELACION_DEL_CTA } from './tunel'
import {
  CAJA_DEL_CARTEL,
  CARTEL,
  ORIGEN_DEL_CARTEL,
  MEDIDA_DEL_CUERPO_CH,
  VENTANA_DE_LA_LLEGADA,
  VENTANA_DE_LA_PINTURA,
  clasesDelCuerpoDelCartel,
  enLaVentana,
} from './geometria'
import { Proyecto } from './Proyecto'
import { estiloDelLugar, poseDelGesto, transformDeLaPose } from './tunel'

/**
 * LAS PIEZAS DE TEXTO QUE EL ESCENARIO MONTA — el cartel y la rama quieta.
 *
 * Los nombres de los proyectos ya NO están acá: se mudaron a `CapaDelTunel`, que
 * es donde viven los elementos anclados a una esquina. Era la última pieza que
 * resolvía su entrada con otro vocabulario —llegaba de la profundidad con P7 y por
 * el eje vertical con P2— y el tramo tiene dos verbos, no cuatro.
 */

/** Las palabras de la bajada, partidas una sola vez. El espacio va ADENTRO de la
 *  pieza y adelante de la palabra: dos piezas vecinas sin él se anuncian pegadas,
 *  y `s10-acceso` §8 compara el texto anunciado de las dos ramas carácter por
 *  carácter. Así la concatenación devuelve la bajada exacta de la rama quieta. */
const PALABRAS_DE_LA_BAJADA = palabrasDe(CONTENIDO.bajada)

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
 * ── El cuerpo se pinta, y por eso no pasa por `<Cuerpo>` ────────────────
 *
 * Se enciende palabra por palabra con `CanalDePiezas` y el patrón **P3**
 * —`opacity 0,3 → 1`, sin mover nada de lugar—, el mismo canal del contrato que
 * usa Servicios. No se copió nada de ese lane: el canal vive en
 * `_contrato/canales`, el partidor en `_lib/palabras`, los dos compartidos.
 *
 * La pintura corre exactamente en la MESETA (`VENTANA_DE_LA_PINTURA`): el único
 * tramo en que el cartel no está escalando ni alejándose.
 *
 * ── Qué mueve qué, ahora que el cartel llega con el gesto de la casa ───
 *
 * El titular lo mueve **P1**, por canal, y el cuerpo **P3**, por canal: los dos
 * del contrato compartido, ninguno escrito acá. Lo único que este archivo escribe
 * a mano es la SALIDA —el vuelo hacia adelante en z—, porque no hay patrón del
 * sistema para irse hacia el espectador y el que había iba al revés.
 */
export function PortadaDeTrabajos({
  seccion,
  progreso,
}: PropsDeSeccion & { readonly progreso: MotionValue<number> }): React.JSX.Element {
  const cartel = useRef<HTMLDivElement | null>(null)
  const pintura = useTransform(progreso, (p) =>
    enLaVentana(enLaVentana(p, CARTEL), VENTANA_DE_LA_PINTURA),
  )
  const llegada = useTransform(progreso, (p) =>
    enLaVentana(enLaVentana(p, CARTEL), VENTANA_DE_LA_LLEGADA),
  )

  useMotionValueEvent(progreso, 'change', (p) => {
    const el = cartel.current
    if (el === null) return
    const pose = poseDelGesto(enLaVentana(p, CARTEL), CARTEL)
    if (pose === null) {
      el.style.setProperty('visibility', 'hidden')
      return
    }
    el.style.setProperty('visibility', 'visible')
    el.style.setProperty('opacity', pose.opacidad.toFixed(4))
    el.style.setProperty('transform', transformDeLaPose(pose))
  })

  const inicial = poseDelGesto(enLaVentana(progreso.get(), CARTEL), CARTEL)
  const lugar = estiloDelLugar(CAJA_DEL_CARTEL, ORIGEN_DEL_CARTEL)

  return (
    <div
      ref={cartel}
      data-pieza="cartel"
      className="absolute flex flex-col gap-6 will-change-transform"
      style={
        inicial === null
          ? { ...lugar, visibility: 'hidden' }
          : {
              ...lugar,
              visibility: 'visible',
              opacity: inicial.opacidad,
              transform: transformDeLaPose(inicial),
            }
      }
    >
      {/**
       * ⚠️ **PORTFOLIO LLEGA CON EL GESTO DE LA CASA, y el gesto ya existía.**
       *
       * Entraba con una escala que crecía desde un punto interior. Eso no es el
       * sitio: el sitio tiene UN gesto para que un titular entre, y es **P1, el
       * revelado línea por línea** —142 instancias en el corpus de la referencia,
       * el 58 %, y su propio archivo dice que si se reproduce un solo efecto es
       * ése—. `LineasDeTexto` le pone a cada renglón su ventana de recorte y lo
       * sube desde una altura de sí mismo: **la línea base desde la que salen las
       * palabras es el borde de abajo de ese recorte**.
       *
       * No se escribió nada nuevo. El canal, el partidor y el patrón ya estaban,
       * y con ellos se fueron del núcleo la rampa de escala y su constante.
       *
       * El `id` va en el envoltorio porque `CanalDeTitular` no acepta `id` —es de
       * otro frente—, y el nombre accesible se computa del contenido, que es
       * exactamente el titular. Es la misma solución que usa Tu panel.
       */}
      <div id={idDelTitularDeSeccion(seccion.id)}>
        <CanalDeTitular progreso={llegada} patron="P1" texto={CONTENIDO.titular} nivel="display-xl" como="h2" />
      </div>
      {/* La medida va como estilo en línea y no como clase arbitraria: el número
          vive en `geometria.ts`, que es donde se decide, y así no hay una medida
          deletreada en ningún fuente que el escaneo de Tailwind pueda levantar. */}
      <div style={{ maxWidth: `${MEDIDA_DEL_CUERPO_CH}ch` }}>
        <CanalDePiezas
          progreso={pintura}
          patron="P3"
          cantidad={PALABRAS_DE_LA_BAJADA.length}
          como="span"
          contenedor={clasesDelCuerpoDelCartel()}
          render={(i) => (i === 0 ? PALABRAS_DE_LA_BAJADA[i] : ` ${PALABRAS_DE_LA_BAJADA[i]}`)}
        />
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
      <Grilla columnas="lateral" className="shrink-0">
        <MarcaDeSeccion />
        <div className="flex flex-col gap-2">
          <Titular
            nivel="titulo-m"
            como="h2"
            id={idDelTitularDeSeccion(seccion.id)}
            className="max-w-[var(--breakpoint-medio)]"
          >
            {CONTENIDO.titular}
          </Titular>
          <Cuerpo className="max-w-[var(--breakpoint-medio)]">{CONTENIDO.bajada}</Cuerpo>
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
        <a
          href={DESTINO_DEL_CTA}
          aria-label={`${CONTENIDO.cta.frase} ${CONTENIDO.cta.rotulo}`}
          data-pieza="enlace-del-cta"
          className="flex flex-col gap-2"
        >
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
          <Cuerpo como="span">{CONTENIDO.cta.rotulo}</Cuerpo>
        </a>
      </div>
    </Envoltorio>
  )
}

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
  refVentana,
  refFrase,
  refVelo,
}: {
  readonly refVentana: (el: HTMLDivElement | null) => void
  readonly refFrase: (el: HTMLDivElement | null) => void
  readonly refVelo: (el: HTMLDivElement | null) => void
}): React.JSX.Element {
  const palabras = CONTENIDO.cta.frase.split(' ')
  return (
    <>
      {/* El velo que atenúa la sala. Es una capa pintada y no un filtro: ver
          `VELO_DEL_CTA` en `tunel.ts`. */}
      <div
        ref={refVelo}
        data-pieza="velo-del-cta"
        aria-hidden="true"
        className="bg-fondo pointer-events-none absolute inset-0"
        style={{ opacity: 0 }}
      />
      {/* ⚠️ NO `data-pieza="cta"`: esa marca ya es del CTA del hero y del cierre, y
          `deslizamiento.ts` tiene un módulo entero colgado de ella. Robársela le
          daría a esta ventana el gesto de deslizamiento de aquél. */}
      <div
        ref={refVentana}
        data-pieza="ventana-del-cta"
        /**
         * ⚠️ **EL ANCHO LO PONE EL LAYOUT Y LA ESCALA VA DE 0 A 1.**
         *
         * Era al revés: una caja del ancho del cuadro escalada a 0,62. Con eso
         * todo lo de adentro salía multiplicado por 0,62 —la URL declarada en
         * 10 px llegaba a la pantalla en 6,2— y la tipografía del cromo era
         * ilegible. Con la caja ya del tamaño final, un tamaño declarado es el
         * tamaño que se ve.
         */
        className="absolute top-1/2 left-1/2 will-change-transform"
        style={{
          width: `${(ANCHO_DEL_CTA * 100).toFixed(2)}%`,
          aspectRatio: `${RELACION_DEL_CTA.ancho} / ${RELACION_DEL_CTA.alto}`,
          transform: 'translate(-50%, -50%) scale(0)',
        }}
      >
        <a
          href={DESTINO_DEL_CTA}
          data-pieza="enlace-del-cta"
          /* ⚠️ `bg-tinta text-fondo` y no una superficie del tema: acá la sala está
             INVERTIDA, así que las superficies son oscuras y la tinta es clara —una
             ventana de navegador pintada con ellas queda gris sobre gris, medido—.
             El par invertido es el mismo que usa la franja de la llave, con su
             contraste conocido, y además es lo que hace que esto se lea como una
             ventana: papel claro con texto oscuro, encima de la noche. */
          className="bg-tinta text-fondo rounded-sutil pointer-events-auto flex h-full w-full flex-col overflow-hidden"
        >
          {/* El cromo: los tres círculos del semáforo y la barra de direcciones.
              Los círculos son decoración y van con los colores de macOS, que son
              lo que hace reconocible el gesto; la dirección SÍ es contenido y se
              anuncia, porque también está en la lista de abajo de 1025. */}
          <div className="flex items-center gap-2 px-5 py-4">
            <span aria-hidden="true" className="bg-semaforo-rojo block size-3 rounded-full" />
            <span aria-hidden="true" className="bg-semaforo-amarillo block size-3 rounded-full" />
            <span aria-hidden="true" className="bg-semaforo-verde block size-3 rounded-full" />
            <span className="border-fondo rounded-sutil ml-4 flex-1 border px-3 py-1 text-center">
              <Cuerpo como="span" className="font-codigo">
                {CONTENIDO.cta.direccion}
              </Cuerpo>
            </span>
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
          <div className="flex flex-1 flex-col justify-center px-8 pb-8">
            <Titular nivel="display-xl" como="p" className="leading-cartel text-left">
              <span ref={refFrase} data-pieza="frase-del-cta">
                {palabras.map((palabra, p) => (
                  <Fragment key={`${palabra}-${String(p)}`}>
                    {p > 0 ? ' ' : null}
                    <span data-palabra={palabra} className="inline-block" style={{ clipPath: 'inset(0 100% 0 0)' }}>
                      {palabra}
                    </span>
                  </Fragment>
                ))}
              </span>
            </Titular>
            <Cuerpo como="span" className="pt-6">
              {CONTENIDO.cta.rotulo}
            </Cuerpo>
          </div>
        </a>
      </div>
    </>
  )
}
