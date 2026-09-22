'use client'

import { useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { palabrasDe } from '../../_lib/palabras'
import { CanalDePiezas } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { MarcaDeSeccion } from '../_contrato/Seccion'

import { CONTENIDO } from './contenido'
import {
  CAJA_DEL_CARTEL,
  CARTEL,
  ORIGEN_DEL_CARTEL,
  MEDIDA_DEL_CUERPO_CH,
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
 * ── Por qué escribe el estilo a mano y no por un canal ─────────────────
 *
 * Porque el gesto es el de `tunel.ts` y no el de un patrón del sistema: la misma
 * función de pose que mueve las fotos y los nombres mueve esto. Que las tres
 * cosas compartan `poseDelGesto` **es** el requisito de un vocabulario único.
 */
export function PortadaDeTrabajos({
  seccion,
  progreso,
}: PropsDeSeccion & { readonly progreso: MotionValue<number> }): React.JSX.Element {
  const cartel = useRef<HTMLDivElement | null>(null)
  const pintura = useTransform(progreso, (p) =>
    enLaVentana(enLaVentana(p, CARTEL), VENTANA_DE_LA_PINTURA),
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
      <Titular nivel="display-xl" como="h2" id={idDelTitularDeSeccion(seccion.id)}>
        {CONTENIDO.titular}
      </Titular>
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
    </Envoltorio>
  )
}
