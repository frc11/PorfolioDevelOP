'use client'

import { useEffect, useRef } from 'react'

import { SEGUIMIENTO_DE_LA_REFERENCIA } from '../../_lib/cursor'
import { LOGO_BAJO_EL_PUNTERO } from '../../_lib/escena/entorno/hoverDelLogo'
import { nocheEfectiva } from '../../_lib/escena/nocheDisparada'
import { MARCA_CURSOR_DE_LA_SALA } from './marca'
import { ETIQUETA_DE_LA_DEMO, estadoBajo, fraccionDelPaso, tonoBajo, type EstadoDelCursor } from './estado'

/**
 * [INTERFAZ 1] T2 · EL CURSOR DE LA SALA — el punto y el halo, con la interpolación, el tono de lo que hay debajo y un
 * estado por lo que se va a tocar (`estado.ts`). Sólo desde 1024, con puntero fino y sin movimiento reducido
 * (`CompuertaDelCursor.tsx`). Convive con E7 (el polvo empujado por el puntero, en la escena): éste es DOM, con
 * `pointer-events: none`, y no toca ningún evento.
 *
 * ── Por cuadro: posiciones; al cambiar lo de abajo: el estado y el tono ─────
 *
 * El bucle mueve el punto y el halo hacia el puntero con las constantes de tiempo medidas en nk (en segundos: la misma
 * persecución a 60 y a 144 Hz) y escribe cuatro propiedades de CSS. Lo que hay debajo (`elementFromPoint`, estilos
 * computados) se lee sólo cuando el puntero se movió o la página se scrolleó; el logo, de la escena, en cada cuadro (es
 * un booleano). Todo va a atributos `data-` de la raíz: React no se vuelve a dibujar nunca. El bucle se duerme cuando
 * todo llegó y nada cambia, y lo despiertan el mouse o el scroll.
 *
 * Reemplaza en el home al cursor de S3 (`chrome/CursorPropio.tsx`, compartido: no se tocó; lo sigue usando la galería).
 */
const T63 = SEGUIMIENTO_DE_LA_REFERENCIA.t63Ms
const EPSILON_PX = 0.05
/** Cada cuánto, como mucho, se relee lo que hay debajo mientras el puntero o la página se mueven. */
const ENTRE_LECTURAS_MS = 60

export default function CursorDeLaSala(): React.JSX.Element {
  const raiz = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = raiz.current
    if (el === null) return
    const destino = { x: 0, y: 0 }
    const nucleo = { x: 0, y: 0 }
    const halo = { x: 0, y: 0 }
    let [iniciado, adentro, sucio, cuadro, antes, leido] = [false, false, false, 0, 0, 0]
    let [estado, tono, logo]: [EstadoDelCursor, string, boolean] = ['texto', 'claro', false]

    const escribir = (): void => {
      el.style.setProperty('--cursor-nucleo-x', `${nucleo.x.toFixed(2)}px`)
      el.style.setProperty('--cursor-nucleo-y', `${nucleo.y.toFixed(2)}px`)
      el.style.setProperty('--cursor-halo-x', `${halo.x.toFixed(2)}px`)
      el.style.setProperty('--cursor-halo-y', `${halo.y.toFixed(2)}px`)
    }

    const leerLoDeAbajo = (): void => {
      const debajo = adentro ? document.elementFromPoint(destino.x, destino.y) : null
      const nuevo = estadoBajo(debajo, logo)
      if (nuevo !== estado) el.setAttribute('data-estado', (estado = nuevo))
      const nuevoTono = tonoBajo(debajo, nocheEfectiva())
      if (nuevoTono !== tono) el.setAttribute('data-tono', (tono = nuevoTono))
    }

    const paso = (ahora: number): void => {
      const dt = antes === 0 ? 0 : (ahora - antes) / 1000
      antes = ahora
      const enElLogo = LOGO_BAJO_EL_PUNTERO.sobre
      // Lo de abajo se relee si cambió el logo, o si se movió algo y pasó un rato (lee estilos: no en cada cuadro).
      if (enElLogo !== logo || (sucio && ahora - leido > ENTRE_LECTURAS_MS)) {
        logo = enElLogo
        sucio = false
        leido = ahora
        leerLoDeAbajo()
      }
      const fn = fraccionDelPaso(dt, T63.nucleo)
      const fh = fraccionDelPaso(dt, T63.halo)
      nucleo.x += (destino.x - nucleo.x) * fn
      nucleo.y += (destino.y - nucleo.y) * fn
      halo.x += (destino.x - halo.x) * fh
      halo.y += (destino.y - halo.y) * fh
      const lejos = Math.abs(destino.x - halo.x) > EPSILON_PX || Math.abs(destino.y - halo.y) > EPSILON_PX || Math.abs(destino.x - nucleo.x) > EPSILON_PX || Math.abs(destino.y - nucleo.y) > EPSILON_PX
      if (lejos) escribir()
      // Despierto mientras algo se mueve, o mientras el puntero esté en la ventana (el logo puede llegar con el scroll).
      cuadro = lejos || adentro || sucio ? requestAnimationFrame(paso) : 0
      if (cuadro === 0) antes = 0
    }
    const despertar = (): void => {
      if (cuadro === 0) cuadro = requestAnimationFrame(paso)
    }

    const alMover = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      destino.x = e.clientX
      destino.y = e.clientY
      if (!iniciado) {
        nucleo.x = halo.x = destino.x
        nucleo.y = halo.y = destino.y
        iniciado = true
        escribir()
      }
      if (!adentro) el.setAttribute('data-activo', 'si')
      adentro = true
      sucio = true
      despertar()
    }
    // Afuera de la ventana, o adentro de un iframe (la ventana de una demo): el documento ya no ve el puntero.
    const alSalir = (e: PointerEvent): void => {
      if (e.relatedTarget !== null) return
      adentro = false
      el.removeAttribute('data-activo')
    }
    const alScrollear = (): void => {
      if (!adentro) return
      sucio = true
      despertar()
    }

    el.setAttribute('data-estado', estado)
    el.setAttribute('data-tono', tono)
    window.addEventListener('pointermove', alMover, { passive: true })
    document.addEventListener('pointerout', alSalir, { passive: true })
    window.addEventListener('scroll', alScrollear, { passive: true })
    return () => {
      window.removeEventListener('pointermove', alMover)
      document.removeEventListener('pointerout', alSalir)
      window.removeEventListener('scroll', alScrollear)
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
    }
  }, [])

  return (
    <div ref={raiz} data-pieza="cursor-sala" data-cursor={MARCA_CURSOR_DE_LA_SALA} aria-hidden="true">
      {/* El halo va primero: queda debajo del punto sin un z-index propio. */}
      <div data-parte="halo">
        <span data-parte="etiqueta">{ETIQUETA_DE_LA_DEMO}</span>
      </div>
      <div data-parte="nucleo" />
    </div>
  )
}
