'use client'

import { useEffect, useRef } from 'react'

import { SEGUIMIENTO_DE_LA_REFERENCIA } from '../../_lib/cursor'
import { CURSOR_EN_VIVO } from '../../_lib/cursorEnVivo'
import { LOGO_BAJO_EL_PUNTERO } from '../../_lib/escena/entorno/hoverDelLogo'
import { MARCA_CURSOR_DE_LA_SALA } from './marca'
import { PRESENCIA_DEL_CURSOR } from './presencia'
import { demoBajo, estadoBajo, fraccionDelPaso, nocheQueSeVe, tonoBajo, type EstadoDelCursor } from './estado'

/**
 * [INTERFAZ 1] T2 · EL CURSOR DE LA SALA — el punto y el halo, con la interpolación, el tono de lo que hay debajo y un
 * estado por lo que se va a tocar (`estado.ts`). Sólo desde 1024, con puntero fino y sin movimiento reducido
 * (`CompuertaDelCursor.tsx`). Convive con E7 (el polvo empujado por el puntero, en la escena): éste es DOM, con
 * `pointer-events: none`, y no toca ningún evento.
 *
 * ── Por cuadro: posiciones; al cambiar lo de abajo: el estado y el tono ─────
 *
 * El bucle mueve el punto y el halo hacia el puntero con las constantes de tiempo medidas en nk (en segundos: la misma
 * persecución a 60 y a 144 Hz) y escribe propiedades de CSS. Lo que hay debajo (`elementFromPoint`, estilos computados)
 * se lee sólo cuando el puntero se movió o la página se scrolleó; el logo, de la escena, en cada cuadro (es un
 * booleano). Todo va a atributos `data-` y propiedades de CSS de la raíz: React no se vuelve a dibujar nunca. El bucle se
 * duerme cuando todo llegó y nada cambia, y lo despiertan el mouse o el scroll.
 *
 * ── [Cierre de INTERFAZ 2] EL CARTEL DE LAS DEMOS, pegado al cursor ─────────
 *
 * Sobre una demo había dos carteles a la vez: la pastilla «Click para ver <proyecto>» arriba del libro y el círculo
 * «Abrir» del cursor. Queda uno, la combinación de los dos: la pastilla, pegada al cursor. Es UN objeto continuo:
 *   · nace en el punto del cursor y se abre hacia los costados hasta su ancho;
 *   · sigue al puntero con la persecución del halo (la de esta interpolación) y se apoya ARRIBA de la cara levantada del
 *     libro (el alza del estante y un paso de aire, como la pastilla de antes): no tapa la demo;
 *   · cambia de proyecto estirándose o achicándose (el ancho persigue al del texto nuevo; el texto cambia por fundido
 *     adentro de la misma caja): nunca dos cajas;
 *   · se va achicándose hacia el cursor.
 * El ancho, la escala y la posición se persiguen en segundos, como el punto y el halo. Sin el cursor (táctil, movimiento
 * reducido, abajo de 1024) y con el teclado queda la pastilla fija de siempre (`Biblioteca.tsx`, `presencia.ts`).
 *
 * Reemplaza en el home al cursor de S3 (`chrome/CursorPropio.tsx`, compartido: no se tocó; lo sigue usando la galería).
 */
const T63 = SEGUIMIENTO_DE_LA_REFERENCIA.t63Ms
const EPSILON_PX = 0.05
/** Cada cuánto, como mucho, se relee lo que hay debajo mientras el puntero o la página se mueven. */
const ENTRE_LECTURAS_MS = 60
/** El margen del cartel contra los bordes del cuadro (px de pantalla: es una medida de la ventana, no de diseño). */
const MARGEN_DEL_CARTEL_PX = 8

export default function CursorDeLaSala(): React.JSX.Element {
  const raiz = useRef<HTMLDivElement>(null)
  const cartelRef = useRef<HTMLDivElement>(null)
  const textoA = useRef<HTMLSpanElement>(null)
  const textoB = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = raiz.current
    const caja = cartelRef.current
    const capas = [textoA.current, textoB.current]
    if (el === null || caja === null || capas[0] === null || capas[1] === null) return
    PRESENCIA_DEL_CURSOR.montado = true
    const destino = { x: 0, y: 0 }
    const nucleo = { x: 0, y: 0 }
    const halo = { x: 0, y: 0 }
    // El cartel: su centro, su ancho y su escala, y adónde van. `pieza`: la demo bajo el puntero (null: ninguna).
    // `tope`: el borde de arriba del HUECO de la pieza (no de la cara, que se levanta): se relee con lo de abajo y el scroll.
    const cartel = { x: 0, y: 0, ancho: 0, escala: 0, anchoObjetivo: 0, alto: 0, aire: 0, relleno: 0, texto: '', capa: 0, pieza: null as Element | null, tope: 0 }
    let [iniciado, adentro, sucio, cuadro, antes, leido] = [false, false, false, 0, 0, 0]
    let [estado, tono, logo]: [EstadoDelCursor, string, boolean] = ['texto', 'claro', false]

    const escribir = (): void => {
      el.style.setProperty('--cursor-nucleo-x', `${nucleo.x.toFixed(2)}px`)
      el.style.setProperty('--cursor-nucleo-y', `${nucleo.y.toFixed(2)}px`)
      el.style.setProperty('--cursor-halo-x', `${halo.x.toFixed(2)}px`)
      el.style.setProperty('--cursor-halo-y', `${halo.y.toFixed(2)}px`)
      el.style.setProperty('--cursor-cartel-x', `${cartel.x.toFixed(2)}px`)
      el.style.setProperty('--cursor-cartel-y', `${cartel.y.toFixed(2)}px`)
      el.style.setProperty('--cursor-cartel-ancho', `${cartel.ancho.toFixed(2)}px`)
      el.style.setProperty('--cursor-cartel-escala', cartel.escala.toFixed(4))
    }

    // Las medidas del cartel que no cambian con el texto: su alto, el relleno de los costados y el aire sobre la cara.
    const medirLaCaja = (): void => {
      const estilo = getComputedStyle(caja)
      cartel.alto = caja.offsetHeight
      cartel.relleno = parseFloat(estilo.paddingInlineStart) + parseFloat(estilo.paddingInlineEnd)
      cartel.aire = parseFloat(estilo.scrollMarginBlockStart)
    }

    // Un texto nuevo: entra en la capa que no se ve (fundido adentro de la MISMA caja) y el ancho va a perseguir el suyo.
    const ponerElTexto = (texto: string): void => {
      if (texto === cartel.texto) return
      cartel.texto = texto
      const sale = capas[cartel.capa]
      cartel.capa = 1 - cartel.capa
      const entra = capas[cartel.capa]
      if (sale === null || entra === null) return
      entra.textContent = texto
      sale.removeAttribute('data-visible')
      entra.setAttribute('data-visible', '')
      cartel.anchoObjetivo = entra.offsetWidth + cartel.relleno
    }

    const leerLoDeAbajo = (): void => {
      const debajo = adentro ? document.elementFromPoint(destino.x, destino.y) : null
      let nuevo = estadoBajo(debajo, logo)
      const demo = nuevo === 'demo' ? demoBajo(debajo) : null
      // Un libro que todavía no llegó (el estante crece en el vacío del túnel, con su opacidad; la máscara del vacío no
      // corta el puntero): no hay una demo a la vista. Antes del cierre mostraba el «Abrir» sobre la nada (en Portfolio).
      if (nuevo === 'demo' && (demo === null || Number(getComputedStyle(demo.pieza).opacity) < 0.5)) nuevo = 'texto'
      if (nuevo !== estado) {
        // Entra a una demo: el cartel nace en el punto del cursor (sin ancho y sin escala).
        if (nuevo === 'demo' && cartel.escala < 0.02) {
          cartel.x = destino.x
          cartel.y = destino.y
          cartel.ancho = cartel.alto
          cartel.escala = 0
        }
        el.setAttribute('data-estado', (estado = nuevo))
      }
      cartel.pieza = nuevo === 'demo' && demo !== null ? demo.pieza : null
      if (nuevo === 'demo' && demo !== null) {
        cartel.tope = demo.pieza.getBoundingClientRect().top
        ponerElTexto(demo.texto)
      }
      const nuevoTono = tonoBajo(debajo, nocheQueSeVe())
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
      // RETOQUE DEL ENCASTRE 2A · dónde se ve el cursor (su halo): lo siguen los nanobots (sin corchetes: s37 busca reservas acá).
      CURSOR_EN_VIVO.x = halo.x
      CURSOR_EN_VIVO.y = halo.y
      CURSOR_EN_VIVO.activo = adentro
      // El cartel: arriba de la cara del libro bajo el puntero, siguiendo su x; sin demo, de vuelta al cursor, cerrándose.
      const conCartel = cartel.pieza !== null && estado === 'demo'
      const medio = cartel.anchoObjetivo / 2 + MARGEN_DEL_CARTEL_PX
      const cx = conCartel ? Math.min(Math.max(destino.x, medio), window.innerWidth - medio) : destino.x
      const cy = conCartel ? Math.max(cartel.tope - cartel.aire - cartel.alto / 2, cartel.alto / 2 + MARGEN_DEL_CARTEL_PX) : destino.y
      const ancho = conCartel ? cartel.anchoObjetivo : cartel.alto
      const escala = conCartel ? 1 : 0
      cartel.x += (cx - cartel.x) * fh
      cartel.y += (cy - cartel.y) * fh
      cartel.ancho += (ancho - cartel.ancho) * fn
      cartel.escala += (escala - cartel.escala) * fn
      const lejos =
        Math.abs(destino.x - halo.x) > EPSILON_PX ||
        Math.abs(destino.y - halo.y) > EPSILON_PX ||
        Math.abs(destino.x - nucleo.x) > EPSILON_PX ||
        Math.abs(destino.y - nucleo.y) > EPSILON_PX ||
        Math.abs(cx - cartel.x) > EPSILON_PX ||
        Math.abs(cy - cartel.y) > EPSILON_PX ||
        Math.abs(ancho - cartel.ancho) > EPSILON_PX ||
        Math.abs(escala - cartel.escala) > 0.001
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
        nucleo.x = halo.x = cartel.x = destino.x
        nucleo.y = halo.y = cartel.y = destino.y
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
      CURSOR_EN_VIVO.activo = false
      cartel.pieza = null
      el.removeAttribute('data-activo')
    }
    const alScrollear = (): void => {
      if (!adentro) return
      sucio = true
      despertar()
    }
    // Un clic en una demo la abre (la ventana con el Genie): el cartel se va hacia el cursor, no se queda encima.
    const alApretar = (): void => {
      cartel.pieza = null
      despertar()
    }

    medirLaCaja()
    cartel.ancho = cartel.alto
    el.setAttribute('data-estado', estado)
    el.setAttribute('data-tono', tono)
    window.addEventListener('pointermove', alMover, { passive: true })
    window.addEventListener('pointerdown', alApretar, { passive: true })
    document.addEventListener('pointerout', alSalir, { passive: true })
    window.addEventListener('scroll', alScrollear, { passive: true })
    window.addEventListener('resize', medirLaCaja, { passive: true })
    return () => {
      PRESENCIA_DEL_CURSOR.montado = false
      CURSOR_EN_VIVO.activo = false
      window.removeEventListener('pointermove', alMover)
      window.removeEventListener('pointerdown', alApretar)
      document.removeEventListener('pointerout', alSalir)
      window.removeEventListener('scroll', alScrollear)
      window.removeEventListener('resize', medirLaCaja)
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
    }
  }, [])

  return (
    <div ref={raiz} data-pieza="cursor-sala" data-cursor={MARCA_CURSOR_DE_LA_SALA} aria-hidden="true">
      {/* El halo va primero: queda debajo del punto sin un z-index propio. */}
      <div data-parte="halo" />
      <div data-parte="nucleo" />
      {/* [Cierre de INTERFAZ 2] El cartel de las demos, pegado al cursor: una caja, dos capas de texto para el fundido. */}
      <div ref={cartelRef} data-parte="cartel">
        <span ref={textoA} data-parte="cartel-texto" className="text-cuerpo tracking-texto leading-texto font-semi" />
        <span ref={textoB} data-parte="cartel-texto" className="text-cuerpo tracking-texto leading-texto font-semi" />
      </div>
    </div>
  )
}
