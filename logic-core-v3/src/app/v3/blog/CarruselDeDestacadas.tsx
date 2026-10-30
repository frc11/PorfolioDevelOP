'use client'

import { animate, useMotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { CarruselDeTarjetas, type EstadoDeLaTarjeta } from '../_componentes/carrusel/CarruselDeTarjetas'
import { ASOMA, relativoEnLaVuelta } from '../_componentes/carrusel/asoma'
import { CARRUSEL } from '../_componentes/carrusel/maquinaDelCarrusel'
import { EnlaceDeRuta } from '../_componentes/navegacion/EnlaceDeRuta'
import { Caption, Cuerpo } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { sizesPorViewport } from '../_lib/imagen'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'
import { PRESENCIA_DEL_ENCABEZADO } from '../_secciones/trabajos/portfolio/EncabezadoDelPortfolio'
import { TitularQueSeLevanta, usePresencia } from '../_secciones/trabajos/portfolio/levantarse'

import { NOTAS_DESTACADAS, fechaLarga, minutosDeLectura, rutaDeLaNota } from './_notas/indice'
import type { Nota } from './_notas/tipos'
import { FORMA_DE_LA_DESTACADA, MS_POR_DESTACADA, corridaDeLaFoto } from './_movimiento/carrusel'
import { FotoDeNota } from './FotoDeNota'

/**
 * [M2] EL CARRUSEL DE LAS DESTACADAS — el carrusel común del Portfolio y de Demos (`CarruselDeTarjetas`, importado: su máquina, la pausa al
 * mantener apretado, las flechas, el dedo, el teclado, las líneas llenas de las ya vistas y `prefers-reduced-motion`), en su modo `asoma`: la
 * tarjeta grande y la siguiente asomada. Es el modo en el que la tarjeta ENTERA puede ser el enlace y el dedo igual la arrastra (en el modo de a
 * una, apoyar el dedo en un enlace no mantiene ni desliza). Valentino: «lo quiero más rápido, con efecto parallax en la foto para dar
 * profundidad, y que con apretar en toda la imagen puedas entrar».
 *
 * Lo propio (el reloj, la forma y la corrida de la foto) está en `_movimiento/carrusel.ts`. Mantener apretado pausa y, al soltar, no abre la nota.
 */
const ITEMS = NOTAS_DESTACADAS.map((nota) => ({ id: nota.slug, nota }))

export function CarruselDeDestacadas(): React.JSX.Element {
  const [actual, setActual] = useState(0)
  return (
    <div data-pieza="carrusel-de-notas" data-destacada={actual}>
      <CarruselDeTarjetas
        items={ITEMS}
        etiqueta="Notas destacadas"
        nombreDe={(t) => t.nota.titulo}
        rotulos={{ anterior: 'Nota anterior', siguiente: 'Nota siguiente' }}
        duracionMs={MS_POR_DESTACADA}
        vistasLlenas
        asoma={FORMA_DE_LA_DESTACADA}
        alCambiar={setActual}
        claseDeLaVista="h-[min(72svh,34rem)] grid-rows-1 py-3 escritorio:h-[min(78svh,52rem)]"
        renderItem={(t, estado) => <TarjetaDestacada nota={t.nota} estado={estado} relativo={relativoEnLaVuelta(estado.indice, actual, ITEMS.length)} />}
      />
    </div>
  )
}

function TarjetaDestacada({ nota, estado, relativo }: { readonly nota: Nota; readonly estado: EstadoDeLaTarjeta; readonly relativo: number }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const presencia = usePresencia(estado.activa, reducido, PRESENCIA_DEL_ENCABEZADO)
  const corrida = corridaDeLaFoto(relativo)
  const x = useMotionValue(`${String(corrida)}%`)
  useEffect(() => {
    const destino = `${String(corrida)}%`
    if (reducido) {
      x.set(destino)
      return undefined
    }
    const a = animate(x, destino, ASOMA.resorte)
    return () => a.stop()
  }, [corrida, reducido, x])

  // Mantener apretado pausa el carrusel (lo decide él): al soltar, ese clic no abre la nota. Un toque, un clic o Enter, sí.
  const apoyo = useRef<{ desde: number; tipo: string } | null>(null)
  const alHacerClic = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    const a = apoyo.current
    apoyo.current = null
    if (a !== null && performance.now() - a.desde >= CARRUSEL.mantenerMs) e.preventDefault()
  }

  return (
    <EnlaceDeRuta
      href={rutaDeLaNota(nota)}
      data-parte="tarjeta-destacada"
      draggable={false}
      tabIndex={estado.activa ? 0 : -1}
      onPointerDown={(e) => {
        apoyo.current = { desde: performance.now(), tipo: e.pointerType }
      }}
      onClick={alHacerClic}
      // El menú del toque largo (Android) taparía la pausa; el clic derecho del mouse sigue.
      onContextMenu={(e) => {
        if (apoyo.current?.tipo === 'touch') e.preventDefault()
      }}
      className="group flex h-full w-full flex-col gap-[var(--spacing-4)]"
    >
      <FotoDeNota nota={nota} sizes={sizesPorViewport(80, 86)} corrimientoX={x} className="min-h-0 w-full flex-1" />
      <span className="flex flex-col gap-[var(--spacing-2)] px-[var(--spacing-1)]">
        <Caption como="span" interletrado="micro" className="font-codigo uppercase text-tinta-media">
          {fechaLarga(nota.fecha)} · {minutosDeLectura(nota)} min de lectura
        </Caption>
        <Titular nivel="titulo-m" como="h3" className="-mb-[0.15em] overflow-hidden pb-[0.15em] group-hover:underline group-focus-visible:underline">
          <TitularQueSeLevanta presencia={presencia}>{nota.titulo}</TitularQueSeLevanta>
        </Titular>
        <Cuerpo className="line-clamp-2 max-w-[60ch] text-tinta-media max-tablet:hidden">{nota.resumen}</Cuerpo>
      </span>
    </EnlaceDeRuta>
  )
}
