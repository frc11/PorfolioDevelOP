'use client'

import { useSyncExternalStore } from 'react'

import { CarruselDeTarjetas, type EstadoDeLaTarjeta, type PropsDelCarrusel } from '../../../_componentes/carrusel/CarruselDeTarjetas'
import { Imagen } from '../../../_componentes/medios/Imagen'
import { Caption, Cuerpo } from '../../../_componentes/tipografia/Textos'

import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_VENTANA, TEXTO_DE_DEMOS, type Demo } from './catalogo'

/** Nada que escuchar: lo único que cambia es servido → cliente. */
const sinCambios = (): (() => void) => () => undefined

/** Las cinco, como tarjetas del carrusel común (el `id` es su slug). */
export const TARJETAS_DE_DEMOS: readonly { readonly id: string; readonly demo: Demo }[] = CATALOGO_DE_DEMOS.map((demo) => ({ id: demo.slug, demo }))

/**
 * La captura, a lo sumo este alto (en `svh`): con el título, el párrafo y las flechas, el carrusel entra en la tablet acostada (1023 × 768).
 * El ancho del carrusel sale de ahí y de la proporción de la captura; en el teléfono manda el ancho de la columna.
 */
export const ALTO_DE_LA_CAPTURA_SVH = 40
const ESTILO_DEL_CARRUSEL = { maxWidth: `calc(${String(ALTO_DE_LA_CAPTURA_SVH)}svh * ${String(MEDIDA_DE_LA_VENTANA.ancho)} / ${String(MEDIDA_DE_LA_VENTANA.alto)})` } as const

/**
 * [NOCTURNO B5] LAS DEMOS EN EL TELÉFONO (y en la tablet): el carrusel del Portfolio — el componente común de B1.2e
 * (`_componentes/carrusel/`), con las demos como tarjetas. Reemplaza a la cinta que corría sola (`Carrusel.tsx`, con su física: se
 * fue). Una tarjeta a la vez, cada 10 s con su línea, las flechas y el deslice de costado; no es una trampa de scroll.
 *
 * Cada tarjeta es un ANCLA al template (en otra pestaña: «Tocá uno y se abre en otra pestaña»), con la captura de la demo en su ventana
 * (la misma imagen que curva el Genie en escritorio), su nombre y su rubro. Sólo la tarjeta activa es una parada de teclado: las otras
 * están montadas, invisibles e inertes, y su ancla sale del recorrido (`tabIndex` −1).
 *
 * ⚠️ **SE MONTA EN EL CLIENTE**, como el del Portfolio: servido, sus tarjetas de afuera escribirían su corrimiento (una transformada:
 * la rama quieta no tiene ninguna, `s10-acceso` y `s5-trabajos`). Sin JavaScript, abajo de 1024 no hay demos (antes, la cinta).
 *
 * `alMontarse`: la caja del carrusel, para la capa de Demos (en tablet llega con el gesto de los libros, entero, como un renglón).
 */
export function CarruselDeDemos({ className, alMontarse }: { readonly className?: string; readonly alMontarse?: (caja: HTMLDivElement | null) => void }): React.JSX.Element | null {
  const enElCliente = useSyncExternalStore(sinCambios, () => true, () => false)
  if (!enElCliente) return null
  return (
    <div ref={alMontarse} data-pieza="demos-en-carrusel" className={className} style={ESTILO_DEL_CARRUSEL}>
      <CarruselDeTarjetas {...PROPS_DEL_CARRUSEL_DE_DEMOS} />
    </div>
  )
}

/** Lo propio de las demos para el carrusel común (las tarjetas, sus nombres y las flechas): el invariante lo monta igual. */
export const PROPS_DEL_CARRUSEL_DE_DEMOS: PropsDelCarrusel<(typeof TARJETAS_DE_DEMOS)[number]> = {
  items: TARJETAS_DE_DEMOS,
  etiqueta: TEXTO_DE_DEMOS.carrusel.etiqueta,
  nombreDe: (t) => t.demo.nombre,
  rotulos: TEXTO_DE_DEMOS.carrusel.rotulos,
  renderItem: (t, e) => <TarjetaDeDemo demo={t.demo} estado={e} />,
}

function TarjetaDeDemo({ demo, estado }: { readonly demo: Demo; readonly estado: EstadoDeLaTarjeta }): React.JSX.Element {
  return (
    <a
      href={demo.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${demo.nombre}, ${demo.rubro}`}
      data-parte="tarjeta-de-demo"
      data-demo={demo.slug}
      draggable={false}
      {...(estado.activa ? {} : { tabIndex: -1 })}
      className="flex flex-col gap-3"
    >
      <span className="rounded-sutil block overflow-clip shadow-[var(--shadow-flotante)]">
        <Imagen src={demo.ventana} alt="" ancho={MEDIDA_DE_LA_VENTANA.ancho} alto={MEDIDA_DE_LA_VENTANA.alto} sizes="100vw" />
      </span>
      <span className="flex flex-col">
        <Cuerpo como="span" peso="semi">
          {demo.nombre}
        </Cuerpo>
        <Caption como="span" className="text-tinta/70">
          {demo.rubro}
        </Caption>
      </span>
    </a>
  )
}
