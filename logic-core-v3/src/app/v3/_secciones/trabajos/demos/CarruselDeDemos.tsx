'use client'

import { ArrowUpRight } from 'lucide-react'
import { useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { CarruselDeTarjetas, type EstadoDeLaTarjeta, type PropsDelCarrusel } from '../../../_componentes/carrusel/CarruselDeTarjetas'
import type { FormaDeLaTarjeta } from '../../../_componentes/carrusel/asoma'
import { Imagen } from '../../../_componentes/medios/Imagen'
import { Caption, Cuerpo } from '../../../_componentes/tipografia/Textos'

import { SUPERFICIE_DEL_CARRUSEL } from '../portfolio/TarjetaDelProyecto'

import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_PORTADA, TEXTO_DE_DEMOS, type Demo } from './catalogo'

/** Nada que escuchar: lo único que cambia es servido → cliente. */
const sinCambios = (): (() => void) => () => undefined

/** Las cinco, como tarjetas del carrusel común (el `id` es su slug). */
export const TARJETAS_DE_DEMOS: readonly { readonly id: string; readonly demo: Demo }[] = CATALOGO_DE_DEMOS.map((demo) => ({ id: demo.slug, demo }))

/**
 * [C2-41t] La forma de la tarjeta: vertical, la portada de la demo (la captura del sitio en el teléfono, 2:3) con su nombre debajo, así que
 * algo más angosta que 2:3; ocupa a lo sumo el 84 % del ancho (se asoma la siguiente) y llena el alto que le deja la pantalla de Demos.
 */
export const FORMA_DE_LA_TARJETA_DE_DEMO: FormaDeLaTarjeta = { proporcion: 0.6, fraccion: 0.84 }

/** La portada llena su caja y se corre a la izquierda: el 4 % de más corta la barra de scroll que quedó en el borde derecho de la captura. */
const CLASE_DE_LA_PORTADA = 'pointer-events-none absolute inset-y-0 left-0 h-full w-[104%] max-w-none object-cover object-left-top'

/**
 * [NOCTURNO B5] LAS DEMOS EN EL TELÉFONO (y en la tablet): el carrusel del Portfolio — el componente común de B1.2e
 * (`_componentes/carrusel/`), con las demos como tarjetas. Cada 10 s con su línea, las flechas y el deslice de costado; no es una trampa
 * de scroll.
 *
 * [C2-41t] EL MUESTRARIO, CUIDADO (antes una tarjeta sola con flechas): el modo `asoma` del carrusel común — una tarjeta grande, la siguiente
 * asomada a la derecha (a sangre hasta el borde del cuadro), el dedo que las arrastra y las barras de las vistas llenas, como las historias.
 * La tarjeta es la del Portfolio (su superficie) con la portada vertical de la demo: la versión de teléfono de cada sitio.
 *
 * Cada tarjeta es un ANCLA al template (en otra pestaña: «Tocá uno y se abre en otra pestaña»), con su nombre y su rubro. Sólo la tarjeta
 * activa es una parada de teclado: las otras están montadas e inertes, y su ancla sale del recorrido (`tabIndex` −1); un toque a la que
 * asoma la trae.
 *
 * ⚠️ **SE MONTA EN EL CLIENTE**, como el del Portfolio: servido, sus tarjetas de afuera escribirían su corrimiento (una transformada:
 * la rama quieta no tiene ninguna, `s10-acceso` y `s5-trabajos`). Sin JavaScript, abajo de 1024 no hay demos (antes, la cinta).
 *
 * `alMontarse`: la caja del carrusel, para la capa de Demos de escritorio (que lo esconde desde 1024).
 */
export function CarruselDeDemos({ className, alMontarse }: { readonly className?: string; readonly alMontarse?: (caja: HTMLDivElement | null) => void }): React.JSX.Element | null {
  const enElCliente = useSyncExternalStore(sinCambios, () => true, () => false)
  if (!enElCliente) return null
  return (
    <div ref={alMontarse} data-pieza="demos-en-carrusel" className={cn('flex flex-col', className)}>
      <CarruselDeTarjetas {...PROPS_DEL_CARRUSEL_DE_DEMOS} />
    </div>
  )
}

/** Lo propio de las demos para el carrusel común (las tarjetas, sus nombres, las flechas y la forma): el invariante lo monta igual. */
export const PROPS_DEL_CARRUSEL_DE_DEMOS: PropsDelCarrusel<(typeof TARJETAS_DE_DEMOS)[number]> = {
  items: TARJETAS_DE_DEMOS,
  etiqueta: TEXTO_DE_DEMOS.carrusel.etiqueta,
  nombreDe: (t) => t.demo.nombre,
  rotulos: TEXTO_DE_DEMOS.carrusel.rotulos,
  vistasLlenas: true,
  asoma: FORMA_DE_LA_TARJETA_DE_DEMO,
  className: 'min-h-0 flex-1',
  // La vista llena el alto que queda y sale a sangre hasta los bordes del cuadro (la que asoma llega al borde); el respiro de arriba y
  // abajo es para la sombra de la tarjeta.
  claseDeLaVista: 'min-h-0 flex-1 grid-rows-1 -mx-[var(--pad-lateral-compacto)] px-[var(--pad-lateral-compacto)] py-3',
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
      className={cn(SUPERFICIE_DEL_CARRUSEL, 'flex h-full w-full flex-col gap-3 p-3 shadow-[var(--shadow-flotante)]')}
    >
      <span className="rounded-sutil relative block min-h-0 flex-1 overflow-clip">
        <Imagen src={demo.portada} alt="" ancho={MEDIDA_DE_LA_PORTADA.ancho} alto={MEDIDA_DE_LA_PORTADA.alto} sizes="(min-width: 768px) 45vw, 80vw" className={CLASE_DE_LA_PORTADA} />
      </span>
      <span className="flex items-end justify-between gap-3 px-1">
        <span className="flex min-w-0 flex-col">
          <Cuerpo como="span" peso="semi">
            {demo.nombre}
          </Cuerpo>
          <Caption como="span" className="text-tinta/70">
            {demo.rubro}
          </Caption>
        </span>
        <ArrowUpRight className="size-5 shrink-0 text-tinta/70" strokeWidth={1.5} aria-hidden="true" />
      </span>
    </a>
  )
}
