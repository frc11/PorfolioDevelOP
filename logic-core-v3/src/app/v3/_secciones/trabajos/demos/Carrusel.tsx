'use client'

import { useEffect, useRef } from 'react'

import { Imagen } from '../../../_componentes/medios/Imagen'
import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'

import { avanzarLaCinta, envolver, esUnToque, FISICA_DEL_CARRUSEL, intencionDelGesto, velocidadDelGesto, type Muestra } from './fisicaDelCarrusel'
import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_PORTADA, type Demo } from './catalogo'

/**
 * EL CARRUSEL DE DEMOS — abajo de 1024, en lugar del estante. **[MÓVIL-TRABAJOS]**
 *
 * En el teléfono son dos renglones —el de arriba corre a la derecha y el de abajo a
 * la izquierda, desfasado en cuatro demos para que nunca coincida la misma en la
 * misma columna— y en tablet uno solo, con más portadas a la vista. La física es
 * `fisicaDelCarrusel.ts`; acá está lo que toca el DOM: una transformada por cuadro sobre la
 * pista, un `requestAnimationFrame` por renglón y sólo mientras se ve.
 *
 * ⚠️ **EL GESTO NO SE LE ROBA A LA PÁGINA.** El renglón es `touch-action: pan-y`:
 * el scroll vertical lo sigue haciendo el navegador, y el carrusel toma el dedo
 * recién cuando el gesto pasó 8 px y es más horizontal que vertical. Un toque (menos
 * de 6 px y 250 ms) abre la demo en otra pestaña; un arrastre no abre nada.
 *
 * ⚠️ **Sin `will-change` mientras el vacío crece:** una capa promovida debajo del
 * túnel deja de cortarse por su agujero (`CapaDeDemos`). La pista se promueve recién
 * cuando la cinta arranca, que es con el vacío ya lleno.
 */
export function Carrusel({ enMarcha }: { readonly enMarcha?: () => boolean }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  return (
    // Tres portadas por renglón en el teléfono y cinco en tablet: la hoja lee estas dos propiedades.
    <div
      data-pieza="carrusel"
      className="-mx-[var(--pad-lateral-compacto)] flex flex-col gap-3 [--portada-aire:var(--spacing-3)] [--portada-ancho:calc((100vw-var(--spacing-3))/3)] escritorio:hidden movil:[--portada-aire:var(--spacing-4)] movil:[--portada-ancho:calc((100vw-var(--spacing-4))/5)]"
    >
      <Renglon sentido={1} desfase={0} enMarcha={enMarcha} reducido={reducido} principal />
      <Renglon sentido={-1} desfase={4} enMarcha={enMarcha} reducido={reducido} className="hidden max-movil:block" />
    </div>
  )
}

function Renglon({
  sentido,
  desfase,
  enMarcha,
  reducido,
  principal = false,
  className,
}: {
  readonly sentido: 1 | -1
  readonly desfase: number
  readonly enMarcha?: () => boolean
  readonly reducido: boolean
  readonly principal?: boolean
  readonly className?: string
}): React.JSX.Element {
  const renglon = useRef<HTMLDivElement | null>(null)
  const pista = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const caja = renglon.current
    const tira = pista.current
    if (caja === null || tira === null) return
    let largo = tira.scrollWidth / 2
    let estado = { x: envolver(-desfase * (largo / CATALOGO_DE_DEMOS.length), largo), v: 0 }
    let cuadro = 0
    let anterior = 0
    let promovida = false
    let conFoco = false
    let gesto: { x0: number; y0: number; t0: number; xDeLaPista: number; muestras: Muestra[]; intencion: 'horizontal' | 'vertical' | null } | null = null
    let suprimirElClic = false

    const pintar = (): void => {
      tira.style.transform = promovida ? `translate3d(${estado.x.toFixed(2)}px, 0, 0)` : `translateX(${estado.x.toFixed(2)}px)`
    }
    const paso = (ahora: number): void => {
      const dt = anterior === 0 ? 0 : Math.min(0.1, (ahora - anterior) / 1000)
      anterior = ahora
      const anda = enMarcha === undefined || enMarcha()
      if (anda !== promovida) {
        promovida = anda
        tira.style.willChange = anda ? 'transform' : ''
      }
      if (gesto === null || gesto.intencion !== 'horizontal') {
        const reposo = anda && !reducido && !conFoco ? sentido * FISICA_DEL_CARRUSEL.velocidadDeReposo : 0
        estado = avanzarLaCinta(estado, reposo, dt, largo)
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
      if (!e.isPrimary) return
      gesto = { x0: e.clientX, y0: e.clientY, t0: e.timeStamp, xDeLaPista: estado.x, muestras: [{ t: e.timeStamp, x: e.clientX }], intencion: null }
      suprimirElClic = false
    }
    const alMover = (e: PointerEvent): void => {
      if (gesto === null || !e.isPrimary) return
      const dx = e.clientX - gesto.x0
      if (gesto.intencion === null) {
        gesto.intencion = intencionDelGesto(dx, e.clientY - gesto.y0)
        if (gesto.intencion === 'vertical') {
          gesto = null
          return
        }
        if (gesto.intencion === 'horizontal') caja.setPointerCapture(e.pointerId)
      }
      if (gesto.intencion !== 'horizontal') return
      // 1:1 con el dedo, contado desde donde estaba la pista al apoyar.
      estado = { x: envolver(gesto.xDeLaPista + dx, largo), v: 0 }
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
        estado = { x: estado.x, v: velocidadDelGesto(gesto.muestras, e.timeStamp) }
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
    // Con el teclado adentro se detiene y trae la portada enfocada al cuadro.
    const alEnfocar = (e: FocusEvent): void => {
      conFoco = true
      const portada = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-parte="portada"]') ?? null
      if (portada !== null) {
        estado = { x: envolver(-portada.offsetLeft + FISICA_DEL_CARRUSEL.umbralDeIntencionPx, largo), v: 0 }
        pintar()
      }
    }
    const alDesenfocar = (): void => {
      conFoco = false
    }

    const medida = new ResizeObserver(() => {
      largo = tira.scrollWidth / 2
      estado = { x: envolver(estado.x, largo), v: estado.v }
    })
    const vista = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) prender()
      else apagar()
    })
    medida.observe(tira)
    vista.observe(caja)
    caja.addEventListener('pointerdown', alApoyar)
    caja.addEventListener('pointermove', alMover)
    caja.addEventListener('pointerup', alLevantar)
    caja.addEventListener('pointercancel', alCancelar)
    caja.addEventListener('click', alHacerClic, true)
    caja.addEventListener('focusin', alEnfocar)
    caja.addEventListener('focusout', alDesenfocar)
    pintar()
    return () => {
      apagar()
      medida.disconnect()
      vista.disconnect()
      caja.removeEventListener('pointerdown', alApoyar)
      caja.removeEventListener('pointermove', alMover)
      caja.removeEventListener('pointerup', alLevantar)
      caja.removeEventListener('pointercancel', alCancelar)
      caja.removeEventListener('click', alHacerClic, true)
      caja.removeEventListener('focusin', alEnfocar)
      caja.removeEventListener('focusout', alDesenfocar)
    }
  }, [desfase, enMarcha, reducido, sentido])

  return (
    <div ref={renglon} data-parte="renglon" data-sentido={sentido > 0 ? 'derecha' : 'izquierda'} className={className} {...(principal ? {} : { 'aria-hidden': true })}>
      <div ref={pista} data-parte="pista">
        <Lista enfocable={principal} />
        <Lista enfocable={false} copia />
      </div>
    </div>
  )
}

function Lista({ enfocable, copia = false }: { readonly enfocable: boolean; readonly copia?: boolean }): React.JSX.Element {
  return (
    <div className="flex" {...(copia ? { 'aria-hidden': true, 'data-parte': 'copia' } : {})}>
      {CATALOGO_DE_DEMOS.map((demo: Demo) => (
        <a
          key={demo.slug}
          href={demo.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${demo.nombre}, ${demo.rubro}`}
          data-parte="portada"
          draggable={false}
          {...(enfocable ? {} : { tabIndex: -1 })}
        >
          <Imagen src={demo.portada} alt="" ancho={MEDIDA_DE_LA_PORTADA.ancho} alto={MEDIDA_DE_LA_PORTADA.alto} sizes="(min-width: 426px) 20vw, 34vw" />
        </a>
      ))}
    </div>
  )
}
