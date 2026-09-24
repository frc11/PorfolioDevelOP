'use client'

import { useEffect, useRef } from 'react'

import { Imagen } from '../../../_componentes/medios/Imagen'
import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'

import {
  FISICA_DEL_CARRUSEL,
  arrastrarLaFila,
  avanzarLaCinta,
  esUnToque,
  intencionDelGesto,
  lanzarLaFila,
  posicionDelRenglon,
  velocidadDelGesto,
  type EstadoDeLaFila,
  type Muestra,
  type SentidoDelRenglon,
} from './fisicaDelCarrusel'
import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_PORTADA, type Demo } from './catalogo'

/**
 * EL CARRUSEL DE DEMOS — abajo de 1024, en lugar del estante. **[MÓVIL-TRABAJOS · MÓVIL 2]**
 *
 * En el teléfono son dos renglones con demos DISTINTAS —arriba las cuatro primeras,
 * abajo las otras cuatro— y en tablet uno solo con las ocho. Los dos renglones son
 * UNA fila: una posición y una velocidad (`fisicaDelCarrusel.ts`) que el de arriba
 * lee hacia la derecha y el de abajo hacia la izquierda. Un dedo sobre cualquiera
 * de los dos mueve la fila, así que se mueven los dos. Un solo `requestAnimationFrame`
 * pinta los dos, y sólo mientras el carrusel se ve.
 *
 * ⚠️ **EL GESTO NO SE LE ROBA A LA PÁGINA.** El renglón es `touch-action: pan-y`:
 * el scroll vertical lo sigue haciendo el navegador, y el carrusel toma el dedo
 * recién cuando el gesto pasó 8 px y es más horizontal que vertical. Un toque (menos
 * de 6 px y 250 ms) abre la demo en otra pestaña; un arrastre no abre nada.
 *
 * ⚠️ **Sin `will-change` mientras el vacío crece:** una capa promovida debajo del
 * túnel deja de cortarse por su agujero (`CapaDeDemos`). Las pistas se promueven
 * recién cuando la cinta arranca, que es con el vacío ya lleno.
 *
 * Las demos de abajo existen en los dos renglones del marcado, pero cada ancho
 * muestra UNA copia: en el teléfono las 4–7 del de arriba van `hidden` y en tablet el
 * de abajo entero. Lo oculto con `display: none` no es parada ni se anuncia.
 */
const MITAD = CATALOGO_DE_DEMOS.length / 2
export const RENGLONES_DEL_CARRUSEL = [
  { sentido: 1, demos: CATALOGO_DE_DEMOS, clase: undefined },
  { sentido: -1, demos: CATALOGO_DE_DEMOS.slice(MITAD), clase: 'hidden max-movil:block' },
] as const satisfies readonly { sentido: SentidoDelRenglon; demos: readonly Demo[]; clase: string | undefined }[]

type Gesto = { sentido: SentidoDelRenglon; x0: number; y0: number; t0: number; xDeLaFila: number; muestras: Muestra[]; intencion: 'horizontal' | 'vertical' | null }

export function Carrusel({ enMarcha }: { readonly enMarcha?: () => boolean }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const carrusel = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const raiz = carrusel.current
    if (raiz === null) return
    const renglones = [...raiz.querySelectorAll<HTMLElement>('[data-parte="renglon"]')]
    const pistas = renglones.map((r) => r.querySelector<HTMLElement>('[data-parte="pista"]'))
    const sentidoDe = (r: HTMLElement): SentidoDelRenglon => (r.dataset.sentido === 'izquierda' ? -1 : 1)
    /** El largo de un renglón: la mitad de su pista, que lleva la lista dos veces. */
    const largoDe = (i: number): number => (pistas[i]?.scrollWidth ?? 0) / 2
    // LA fila: el de arriba es el renglón que siempre se ve, así que su largo envuelve la posición.
    let fila: EstadoDeLaFila = { x: 0, v: 0 }
    let cuadro = 0
    let anterior = 0
    let promovida = false
    let conFoco = false
    let gesto: Gesto | null = null
    let suprimirElClic = false

    const pintar = (): void => {
      pistas.forEach((pista, i) => {
        if (pista === null) return
        const x = posicionDelRenglon(fila, sentidoDe(renglones[i]), largoDe(i)).toFixed(2)
        pista.style.transform = promovida ? `translate3d(${x}px, 0, 0)` : `translateX(${x}px)`
      })
    }
    const paso = (ahora: number): void => {
      const dt = anterior === 0 ? 0 : Math.min(0.1, (ahora - anterior) / 1000)
      anterior = ahora
      const anda = enMarcha === undefined || enMarcha()
      if (anda !== promovida) {
        promovida = anda
        for (const pista of pistas) if (pista !== null) pista.style.willChange = anda ? 'transform' : ''
      }
      if (gesto === null || gesto.intencion !== 'horizontal') {
        const reposo = anda && !reducido && !conFoco ? FISICA_DEL_CARRUSEL.velocidadDeReposo : 0
        fila = avanzarLaCinta(fila, reposo, dt, largoDe(0))
      }
      pintar()
      cuadro = requestAnimationFrame(paso)
    }
    const prender = (): void => {
      if (cuadro !== 0) return
      anterior = 0
      cuadro = requestAnimationFrame(paso)
    }
    const apagar = (): void => {
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
      cuadro = 0
    }

    const alApoyar = (e: PointerEvent): void => {
      const renglon = e.currentTarget
      if (!e.isPrimary || !(renglon instanceof HTMLElement)) return
      gesto = { sentido: sentidoDe(renglon), x0: e.clientX, y0: e.clientY, t0: e.timeStamp, xDeLaFila: fila.x, muestras: [{ t: e.timeStamp, x: e.clientX }], intencion: null }
      suprimirElClic = false
    }
    const alMover = (e: PointerEvent): void => {
      const renglon = e.currentTarget
      if (gesto === null || !e.isPrimary || !(renglon instanceof HTMLElement)) return
      const dx = e.clientX - gesto.x0
      if (gesto.intencion === null) {
        gesto.intencion = intencionDelGesto(dx, e.clientY - gesto.y0)
        if (gesto.intencion === 'vertical') {
          gesto = null
          return
        }
        if (gesto.intencion === 'horizontal') renglon.setPointerCapture(e.pointerId)
      }
      if (gesto.intencion !== 'horizontal') return
      // 1:1 con el dedo, contado desde donde estaba la fila al apoyar: el otro renglón la sigue.
      fila = arrastrarLaFila(gesto.xDeLaFila, gesto.sentido, dx)
      gesto.muestras.push({ t: e.timeStamp, x: e.clientX })
      if (gesto.muestras.length > 12) gesto.muestras.shift()
      pintar()
    }
    const alLevantar = (e: PointerEvent): void => {
      if (gesto === null || !e.isPrimary) return
      const distancia = Math.hypot(e.clientX - gesto.x0, e.clientY - gesto.y0)
      suprimirElClic = !esUnToque(distancia, e.timeStamp - gesto.t0)
      if (gesto.intencion === 'horizontal') {
        gesto.muestras.push({ t: e.timeStamp, x: e.clientX })
        fila = lanzarLaFila(fila, gesto.sentido, velocidadDelGesto(gesto.muestras, e.timeStamp))
      }
      gesto = null
    }
    const alCancelar = (): void => {
      gesto = null
    }
    const alHacerClic = (e: MouseEvent): void => {
      if (!suprimirElClic) return
      e.preventDefault()
      suprimirElClic = false
    }
    // Con el TECLADO adentro se detiene y trae la portada enfocada al cuadro. Sólo el teclado:
    // un toque también enfoca, y mover la pista bajo el dedo le robaba el clic a la portada.
    const alEnfocar = (e: FocusEvent): void => {
      if (!(e.target instanceof HTMLElement) || !e.target.matches(':focus-visible')) return
      conFoco = true
      const portada = e.target.closest<HTMLElement>('[data-parte="portada"]')
      const renglon = e.target.closest<HTMLElement>('[data-parte="renglon"]')
      if (portada !== null && renglon !== null) {
        fila = { x: sentidoDe(renglon) * (-portada.offsetLeft + FISICA_DEL_CARRUSEL.umbralDeIntencionPx), v: 0 }
        pintar()
      }
    }
    const alDesenfocar = (): void => {
      conFoco = false
    }

    const medida = new ResizeObserver(() => pintar())
    const vista = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) prender()
      else apagar()
    })
    for (const pista of pistas) if (pista !== null) medida.observe(pista)
    vista.observe(raiz)
    const oyentes = [
      ['pointerdown', alApoyar],
      ['pointermove', alMover],
      ['pointerup', alLevantar],
      ['pointercancel', alCancelar],
    ] as const
    for (const r of renglones) {
      for (const [evento, fn] of oyentes) r.addEventListener(evento, fn)
      r.addEventListener('click', alHacerClic, true)
    }
    raiz.addEventListener('focusin', alEnfocar)
    raiz.addEventListener('focusout', alDesenfocar)
    pintar()
    return () => {
      apagar()
      medida.disconnect()
      vista.disconnect()
      for (const r of renglones) {
        for (const [evento, fn] of oyentes) r.removeEventListener(evento, fn)
        r.removeEventListener('click', alHacerClic, true)
      }
      raiz.removeEventListener('focusin', alEnfocar)
      raiz.removeEventListener('focusout', alDesenfocar)
    }
  }, [enMarcha, reducido])

  return (
    // Tres portadas por renglón en el teléfono y cinco en tablet: la hoja lee estas dos propiedades.
    // En un teléfono bajo la portada se topa por el alto (20 % del svh), así el bloque entra.
    <div
      ref={carrusel}
      data-pieza="carrusel"
      className="-mx-[var(--pad-lateral-compacto)] flex flex-col gap-3 [--portada-aire:var(--spacing-3)] [--portada-ancho:min(calc((100vw-var(--spacing-3))/3),calc(20svh/1.5+var(--spacing-3)))] escritorio:hidden movil:[--portada-aire:var(--spacing-4)] movil:[--portada-ancho:min(calc((100vw-var(--spacing-4))/5),calc(34svh/1.5+var(--spacing-4)))]"
    >
      {RENGLONES_DEL_CARRUSEL.map((r) => (
        <div key={r.sentido} data-parte="renglon" data-sentido={r.sentido > 0 ? 'derecha' : 'izquierda'} className={r.clase}>
          <div data-parte="pista">
            <Lista demos={r.demos} enfocable />
            <Lista demos={r.demos} enfocable={false} copia />
          </div>
        </div>
      ))}
    </div>
  )
}

/** En el renglón de arriba, las demos de la segunda mitad son de tablet: en el teléfono están abajo.
 *  La `!` le gana al `display: block` de la portada en `demos.css`. */
const soloEnTablet = (demo: Demo): boolean => CATALOGO_DE_DEMOS.indexOf(demo) >= MITAD

/** Las demos que se VEN en cada renglón de un aparato, leídas de las mismas dos reglas que el marcado. */
export function demosQueSeVen(aparato: 'movil' | 'tablet'): readonly (readonly string[])[] {
  return RENGLONES_DEL_CARRUSEL.filter((r) => aparato === 'movil' || r.clase === undefined).map((r) =>
    r.demos.filter((d) => !(aparato === 'movil' && r.demos.length === CATALOGO_DE_DEMOS.length && soloEnTablet(d))).map((d) => d.slug),
  )
}

function Lista({ demos, enfocable, copia = false }: { readonly demos: readonly Demo[]; readonly enfocable: boolean; readonly copia?: boolean }): React.JSX.Element {
  const deArriba = demos.length === CATALOGO_DE_DEMOS.length
  return (
    <div className="flex" {...(copia ? { 'aria-hidden': true, 'data-parte': 'copia' } : {})}>
      {demos.map((demo: Demo) => (
        <a
          key={demo.slug}
          href={demo.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${demo.nombre}, ${demo.rubro}`}
          data-parte="portada"
          draggable={false}
          className={deArriba && soloEnTablet(demo) ? 'max-movil:hidden!' : undefined}
          {...(enfocable ? {} : { tabIndex: -1 })}
        >
          <Imagen src={demo.portada} alt="" ancho={MEDIDA_DE_LA_PORTADA.ancho} alto={MEDIDA_DE_LA_PORTADA.alto} sizes="(min-width: 426px) 20vw, 34vw" />
        </a>
      ))}
    </div>
  )
}
