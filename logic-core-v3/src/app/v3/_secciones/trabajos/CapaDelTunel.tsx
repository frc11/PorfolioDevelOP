'use client'

import { useMotionValueEvent, type MotionValue } from 'motion/react'
import React, { useCallback, useEffect, useRef } from 'react'

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { MarcoDeMedio } from '../_contrato/medios'

import { CONTENIDO } from './contenido'
import {
  ASPECTO_DE_REFERENCIA,
  DISPOSICIONES,
  ORIGEN_DE_LA_RANURA,
  cajaDeLaRanura,
  cajaDelMedio,
  enLaVentana,
  MEDIDAS_DE_LOS_MEDIOS,
  SIZES_DE_LA_RANURA,
  ventanaDelProyecto,
  type PiezaDelProyecto,
  type Ranura,
} from './geometria'
import {
  estiloDelLugar,
  lugarDeLaCaja,
  poseDelGesto,
  transformDeLaPose,
  type Caja,
  type PoseDelElemento,
} from './tunel'

/**
 * LA CAPA DE LA ZONA — la mitad que toca el DOM. **[PORTFOLIO]**
 *
 * El núcleo puro vive en `tunel.ts` (los dos verbos), los lugares y los tiempos
 * en `geometria.ts`, y acá está lo mínimo que escribe en el navegador. Cero
 * `setState` por cuadro: cada pieza es un `style.setProperty` sobre un `ref`.
 *
 * ── ⚠️ `preserve-3d`, Y SIN ESO LA HUIDA ES SÓLO UN FUNDIDO ───────────────
 *
 * `perspective` sólo alcanza a los HIJOS del elemento que la declara. La declara
 * el `Bloque` y este contenedor es su hijo, así que las piezas de acá adentro son
 * NIETAS: su `translateZ` se aplanaría. El porqué completo y la vara para
 * comprobarlo están en `DIRECCION-ESCENA.md` §79.
 *
 * ── ⚠️ CUATRO RANURAS Y UNA TABLA, no cuatro lugares por pieza ────────────
 *
 * Cada proyecto pone **cuatro cosas** en la zona central —nombre, rubro, logo y
 * captura— y cuál va en cuál de las cuatro ranuras lo dice `DISPOSICIONES`, una
 * fila por proyecto. Acá no se elige nada: se lee la fila y se pide la caja.
 *
 * Que la ranura sea la misma caja para los cuatro proyectos es lo que hace que
 * **todas las capturas terminen del mismo tamaño** sin declararlo en ningún lado.
 *
 * ── ⚠️ EL LUGAR ES POSICIÓN; EL ORIGEN, UN PUNTO INTERIOR ────────────────
 *
 * Cada pieza se posiciona en su caja final con `left/top/width/height` y recibe
 * un `transform-origin` en porcentaje de esa caja. El `transform` lleva **sólo
 * escala** mientras crece, así que la pieza no se mueve un píxel por crecer: se
 * contrae hacia su punto interior y se abre desde ahí.
 *
 * Los porcentajes de los MEDIOS dependen del aspecto —una captura 16:9 entra
 * distinto en una celda según la pantalla— así que se reescriben cuando cambia el
 * tamaño del contenedor, **no por cuadro**. El primer cuadro sale con
 * `ASPECTO_DE_REFERENCIA`.
 */

type ProyectoDeContenido = (typeof CONTENIDO.proyectos)[number]

/**
 * ⚠️ **LA RELACIÓN SALE DEL ARCHIVO REAL, y por eso es por proyecto.**
 *
 * Los tres logos miden 853×233, 1536×1024 y 1172×384: **tres relaciones
 * distintas** —3,661 · 1,500 · 3,052—. Una caja común los deformaría o los
 * recortaría, y las dos cosas están prohibidas. Cada uno entra contenido en su
 * ranura con SU relación. Las capturas sí comparten 16:9 porque las tres son
 * 1920×1080, y de ahí sale que terminen todas en la misma caja.
 */
function medidaDe(proyecto: number, que: 'logo' | 'captura'): { readonly ancho: number; readonly alto: number } {
  const m = MEDIDAS_DE_LOS_MEDIOS[proyecto]
  return que === 'logo' ? m.logo : m.pagina
}

function relacionDe(proyecto: number, que: 'logo' | 'captura'): number {
  const m = medidaDe(proyecto, que)
  return m.ancho / m.alto
}

/** Una pieza montada: qué proyecto, qué cosa y en qué ranura le tocó. */
export interface PiezaMontada {
  readonly clave: string
  readonly proyecto: number
  readonly que: PiezaDelProyecto
  readonly ranura: Ranura
}

/**
 * LAS DOCE PIEZAS, en orden de lectura: por proyecto, nombre, rubro, logo y
 * captura — el mismo orden que la rama quieta, porque `s10-acceso` §8 compara el
 * texto anunciado de las dos ramas carácter por carácter.
 */
export const PIEZAS: readonly PiezaMontada[] = CONTENIDO.proyectos.flatMap((p, i) =>
  (['nombre', 'rubro', 'logo', 'captura'] as const).map((que) => ({
    clave: `${p.nombre}·${que}`,
    proyecto: i,
    que,
    ranura: DISPOSICIONES[i][que],
  })),
)

/** La caja final de una pieza: la ranura entera si es texto, y el medio centrado
 *  adentro de la ranura si es imagen. */
function cajaDeLaPieza(pieza: PiezaMontada, aspecto: number): Caja {
  if (pieza.que === 'nombre' || pieza.que === 'rubro') return cajaDeLaRanura(pieza.ranura)
  return cajaDelMedio(pieza.ranura, relacionDe(pieza.proyecto, pieza.que), aspecto)
}

function escribirPose(el: HTMLElement, pose: PoseDelElemento | null): void {
  if (pose === null) {
    el.style.setProperty('visibility', 'hidden')
    return
  }
  el.style.setProperty('visibility', 'visible')
  el.style.setProperty('opacity', pose.opacidad.toFixed(4))
  el.style.setProperty('transform', transformDeLaPose(pose))
}

export function CapaDelTunel({
  progreso,
  className,
}: {
  readonly progreso: MotionValue<number>
  readonly className?: string
}): React.JSX.Element {
  const contenedor = useRef<HTMLDivElement | null>(null)
  const piezas = useRef<(HTMLDivElement | null)[]>([])
  const aspecto = useRef(ASPECTO_DE_REFERENCIA)

  const montar = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      piezas.current[i] = el
    },
    [],
  )

  /** Reescribe los LUGARES. Corre al montar y cuando cambia la caja, nunca por cuadro. */
  const acomodar = useCallback((): void => {
    for (let i = 0; i < PIEZAS.length; i += 1) {
      const el = piezas.current[i]
      if (el === null || el === undefined) continue
      const lugar = lugarDeLaCaja(cajaDeLaPieza(PIEZAS[i], aspecto.current), ORIGEN_DE_LA_RANURA[PIEZAS[i].ranura])
      for (const [prop, valor] of Object.entries(lugar)) el.style.setProperty(prop, valor)
    }
  }, [])

  useEffect(() => {
    const caja = contenedor.current
    if (caja === null) return
    const observador = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect
      if (!(width > 0 && height > 0)) return
      aspecto.current = width / height
      acomodar()
    })
    observador.observe(caja)
    return () => observador.disconnect()
  }, [acomodar])

  useMotionValueEvent(progreso, 'change', (p) => {
    for (let i = 0; i < PIEZAS.length; i += 1) {
      const el = piezas.current[i]
      if (el === null || el === undefined) continue
      const ventana = ventanaDelProyecto(PIEZAS[i].proyecto)
      escribirPose(el, ventana === null ? null : poseDelGesto(enLaVentana(p, ventana), ventana))
    }
  })

  const inicial = progreso.get()

  const estiloInicial = (pieza: PiezaMontada): React.CSSProperties => {
    const lugar = estiloDelLugar(cajaDeLaPieza(pieza, ASPECTO_DE_REFERENCIA), ORIGEN_DE_LA_RANURA[pieza.ranura])
    const ventana = ventanaDelProyecto(pieza.proyecto)
    const pose = ventana === null ? null : poseDelGesto(enLaVentana(inicial, ventana), ventana)
    return pose === null
      ? { ...lugar, visibility: 'hidden' }
      : { ...lugar, visibility: 'visible', opacity: pose.opacidad, transform: transformDeLaPose(pose) }
  }

  /**
   * ⚠️ **LAS CUATRO PIEZAS SON ENLACES AL SITIO DEL CLIENTE.**
   *
   * Clic en el nombre, en el rubro, en el logo o en la captura lleva al mismo
   * lugar. Son anclas de verdad —`<a href>`, no un manejador de clic sobre un
   * `div`— así que son paradas de teclado y el navegador les da su menú
   * contextual gratis. (El nombre de ese manejador no se escribe ni acá: §11 del
   * invariante lo cuenta sobre ESTA misma fuente, y un comentario que lo deletrea
   * lo pone en rojo sin que haya un solo `div` haciendo de botón.)
   * `target="_blank"` con `rel="noopener noreferrer"`: abre afuera sin darle al
   * otro sitio acceso a esta ventana ni el referente.
   *
   * ⚠️ El nombre lleva el ancla ADENTRO del `h3` y no al revés: `trabajos-piezas`
   * exige que el texto directo del ancla sea el nombre del cliente, y un
   * encabezado envuelto en un ancla dejaría de ser el encabezado de nada.
   */
  const alSitio = (
    proyecto: ProyectoDeContenido,
    nombreAccesible: string | undefined,
    hijo: React.ReactNode,
  ): React.JSX.Element => (
    <a
      href={proyecto.enlace}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={nombreAccesible}
      data-pieza="enlace-de-proyecto"
      className="block"
    >
      {hijo}
    </a>
  )

  const contenidoDeLaPieza = (pieza: PiezaMontada, proyecto: ProyectoDeContenido): React.ReactNode => {
    if (pieza.que === 'nombre') {
      return (
        <Titular nivel="titulo-xl" como="h3">
          <a href={proyecto.enlace} target="_blank" rel="noopener noreferrer" data-pieza="enlace-de-proyecto">
            {proyecto.nombre}
          </a>
        </Titular>
      )
    }
    if (pieza.que === 'rubro') return alSitio(proyecto, undefined, <Cuerpo como="span">{proyecto.rubro}</Cuerpo>)
    const medio = pieza.que === 'logo' ? proyecto.logo : proyecto.pagina
    const medida = medidaDe(pieza.proyecto, pieza.que)
    return alSitio(
      proyecto,
      medio.alt,
      <MarcoDeMedio
        marcador="[CAPTURA]"
        fuente={medio.fuente}
        alt={medio.alt}
        ancho={medida.ancho}
        alto={medida.alto}
        sizes={SIZES_DE_LA_RANURA}
      />,
    )
  }

  return (
    // ⚠️ SIN `aria-hidden`: las doce piezas son CONTENIDO —los pedidos que esta
    // sección deja abiertos— y `s10-acceso` §8 compara el texto anunciado de las
    // dos ramas carácter por carácter.
    <div
      ref={contenedor}
      data-pieza="tunel"
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {PIEZAS.map((pieza, i) => (
        <div
          key={pieza.clave}
          ref={montar(i)}
          data-pieza-de={pieza.clave}
          data-ranura={pieza.ranura}
          className="absolute flex flex-col justify-center will-change-transform"
          style={estiloInicial(pieza)}
        >
          {contenidoDeLaPieza(pieza, CONTENIDO.proyectos[pieza.proyecto])}
        </div>
      ))}
    </div>
  )
}
