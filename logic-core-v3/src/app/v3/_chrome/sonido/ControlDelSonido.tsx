'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { Micro } from '../../_componentes/tipografia/Textos'
import { CURVAS } from '../../_lib/motion/curvas'
import { sonar } from '../../_lib/sonido/bus'
import type { MotorDelSonido } from '../../_lib/sonido/motor'
import { guardarPrendido, leerPrendido, suscribirAlPrendido } from '../../_lib/sonido/preferencia'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { SELECTOR_DE_LOS_CTA } from '../escena/RespuestaDeLaEscena'
import { progresoAbajo } from '../recorrido/InfinitoDelRecorrido'
import { IconoDelParlante } from './IconoDelParlante'
import { estadoDelMotor, pedirElMotor, soltarElMotor, suscribirAlMotor } from './motorCompartido'

/**
 * [3D Y SONIDO] T2 · EL CONTROL DEL SONIDO — un parlante chico, [PASADA FINAL] C1: justo encima del infinito del recorrido y
 * centrado con él, en la columna de su esquina (`recorrido/InfinitoDelRecorrido.tsx`, que lo recibe en `encima`), en su mismo lenguaje
 * (trazo fino, puntas redondas, el borde tenue del tono contrario) y con su mismo tono: copia el que el infinito leyó de
 * lo que hay debajo (`data-seccion`), así no hay una segunda lectura. [RETOQUE 3D] En el producto (era sólo con la prueba).
 *
 *   · **Apagado por defecto**, y la elección se recuerda (`preferencia.ts`, con try/catch).
 *   · **Nada suena sin una acción.** Prenderlo es un clic; si quedó prendido de otra visita, el motor (howler y el
 *     archivo) se carga recién con la primera interacción en la página (un toque, una tecla, [PASADA FINAL] A4: la rueda
 *     también): antes, ni se descarga. El contexto nace suspendido hasta la primera acción de verdad (un clic, un toque o
 *     una tecla en CUALQUIER parte de la página: el navegador no cuenta el scroll ni el hover) y cada acción lo despierta
 *     si hizo falta (Safari lo exige dentro del gesto); howler no lo suspende solo (`autoSuspend` apagado: el ambiente
 *     generativo se quedaba mudo a los 30 s con el parlante prendido). Lo que el botón muestra es lo real (`data-estado`:
 *     apagado, esperando la primera acción —las ondas tenues, latiendo—, o suena). [AJUSTES FINALES] A3 · apenas el motor
 *     queda listo arranca todo lo que no depende de una interacción (el ambiente ya; el pulso del logo y el encendido del
 *     haz, cuando les toque).
 *   · Prendido: el clic de cualquier enlace o botón suena (uno solo, delegado en el documento; la barra y los CTA con el
 *     pestillo, [CIERRE RETOQUE 3D] S1), el hover de los CTA suena el tic de la barra y suena UN ambiente generativo para
 *     toda la página (S2: sin archivo), salvo con movimiento reducido o con la pestaña oculta.
 *   · [PASADA FINAL] C1 · al tocarlo, el ícono se anima (`IconoDelParlante.tsx`: las ondas se dibujan o se cortan) y encima
 *     aparece un cartel de dos líneas, «Sonido / activado» o «Sonido / desactivado», que cambia con su animación y se va
 *     solo (`CARTEL_MS`). El cartel se ve y no se anuncia; lo anuncia una región viva que está siempre (`role="status"`),
 *     con el mismo texto, y el botón dice su estado con `aria-pressed`. Con movimiento reducido, sólo fundidos.
 */
const ENLACES_Y_BOTONES = 'a[href], button, [role="button"], summary'
/** [RETOQUE 3D] La barra (la pastilla, la esquina y el menú del teléfono) y los CTA: [CIERRE RETOQUE 3D] S1 · su clic, el pestillo. */
const DE_LA_BARRA = '[data-pieza="barra"] a, [data-pieza="menu-movil"] [data-parte="item-del-menu"]'
// [RONDA 2] F5 · y las piezas del pie (desde 1025): el hover, el tic; el clic, el pestillo, como una tecla.
const DE_LOS_CTA = `${SELECTOR_DE_LOS_CTA}, [data-pieza="empezar"], [data-abre-contacto], [data-pieza="bloque-solido"][data-solido]`
/** [RETOQUE PANEL] T2 · las demos de Tu panel: sin clic propio; lo que se toca adentro suena el pestillo de la barra y los CTA. */
const DE_LAS_DEMOS_DEL_PANEL = '[data-pieza="demo-del-panel"]'

/** Cuánto se queda el cartel después de tocar el parlante (ms), y su salida: corta, así el cambio de texto no se arrastra. */
export const CARTEL_MS = 1800
const SALIDA_DEL_CARTEL = { duration: 0.14, ease: CURVAS.principal } as const
const sinCambios = (): (() => void) => () => undefined
const abajoEnLaPagina = (): boolean => progresoAbajo(window.location.search)

export default function ControlDelSonido(): React.JSX.Element {
  const raiz = useRef<HTMLDivElement>(null)
  const prendido = useSyncExternalStore(suscribirAlPrendido, leerPrendido, () => false)
  const reducido = useMovimientoReducido()
  const motor = useRef<MotorDelSonido | null>(null)
  // [PASADA FINAL] A4 · lo real del motor, para que lo mostrado coincida (sin motor en el servidor).
  const estadoReal = useSyncExternalStore(suscribirAlMotor, estadoDelMotor, () => 'sin-motor')
  // [PASADA FINAL] C1 · el cartel (se ve) y el anuncio (se oye): los escribe el toque, no la carga.
  const [cartel, setCartel] = useState(false)
  const [anuncio, setAnuncio] = useState('')
  // [PULIDO 11] C2 · abajo de 1024 (salvo `?progreso=abajo`) es el disco de arriba a la izquierda de la cabecera.
  const abajo = useSyncExternalStore(sinCambios, abajoEnLaPagina, () => false)

  // El tono: el del infinito, que ya lo lee de lo que hay debajo (los dos están en la misma esquina).
  useEffect(() => {
    const infinito = document.querySelector('[data-pieza="infinito-del-recorrido"]')
    const el = raiz.current
    if (infinito === null || el === null) return undefined
    const copiar = (): void => {
      if (infinito.getAttribute('data-seccion') === 'invertida') el.setAttribute('data-seccion', 'invertida')
      else el.removeAttribute('data-seccion')
    }
    copiar()
    const espia = new MutationObserver(copiar)
    espia.observe(infinito, { attributes: true, attributeFilter: ['data-seccion'] })
    return () => espia.disconnect()
  }, [])

  // Prendido: el motor, con una acción de por medio (la del clic que lo prendió ya cuenta).
  useEffect(() => {
    if (!prendido) return undefined
    let vivo = true
    let pedido = false
    const cargar = (): void => {
      quitar()
      if (pedido) return
      pedido = true
      void pedirElMotor().then((m) => {
        if (vivo) motor.current = m
      })
    }
    const quitar = (): void => {
      window.removeEventListener('pointerdown', cargar, true)
      window.removeEventListener('keydown', cargar, true)
      window.removeEventListener('wheel', cargar, true)
      window.removeEventListener('touchstart', cargar, true)
    }
    if ((navigator as Navigator & { readonly userActivation?: { readonly hasBeenActive: boolean } }).userActivation?.hasBeenActive === true) cargar()
    else {
      window.addEventListener('pointerdown', cargar, true)
      window.addEventListener('keydown', cargar, true)
      // [PASADA FINAL] A4 · la rueda y el toque son la primera interacción de casi todos: howler y el archivo se cargan ya
      // (el contexto nace suspendido) y el primer clic de verdad ya suena, en vez de perderse cargando.
      window.addEventListener('wheel', cargar, true)
      window.addEventListener('touchstart', cargar, true)
    }
    // [PASADA FINAL] A4 · cada acción de verdad despierta el contexto si quedó suspendido (dentro del gesto, como pide Safari).
    const despertar = (): void => motor.current?.despertar()
    window.addEventListener('pointerdown', despertar, true)
    window.addEventListener('keydown', despertar, true)
    window.addEventListener('touchend', despertar, true)
    return () => {
      vivo = false
      quitar()
      window.removeEventListener('pointerdown', despertar, true)
      window.removeEventListener('keydown', despertar, true)
      window.removeEventListener('touchend', despertar, true)
      motor.current = null
      if (pedido) soltarElMotor()
    }
  }, [prendido])

  // Prendido: el clic (el de la barra y el de los CTA, el pestillo; el de siempre para lo demás), el tic del hover de los
  // CTA (el mismo de la barra) y [RETOQUE 3D] UN ambiente para toda la página (sin día ni noche); sin él con movimiento
  // reducido o con la pestaña oculta.
  useEffect(() => {
    if (!prendido) return undefined
    const alClic = (e: MouseEvent): void => {
      const blanco = e.target instanceof Element ? e.target : null
      if (blanco === null || blanco.closest('[data-pieza="control-del-sonido"]') !== null) return
      if (blanco.closest(DE_LAS_DEMOS_DEL_PANEL) !== null) {
        if (blanco.closest(ENLACES_Y_BOTONES) !== null) sonar('pestillo')
        return
      }
      if (blanco.closest(DE_LA_BARRA) !== null || blanco.closest(DE_LOS_CTA) !== null) sonar('pestillo')
      else if (blanco.closest(ENLACES_Y_BOTONES) !== null) sonar('clic')
    }
    let ctaSenalado: Element | null = null
    const alPasar = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse') return
      const cta = e.target instanceof Element ? e.target.closest(DE_LOS_CTA) : null
      if (cta !== null && cta !== ctaSenalado) sonar('tic')
      ctaSenalado = cta
    }
    const ambiente = (): void => motor.current?.ambiente(!reducido && document.visibilityState === 'visible')
    document.addEventListener('click', alClic)
    document.addEventListener('pointerover', alPasar)
    document.addEventListener('visibilitychange', ambiente)
    // [AJUSTES FINALES] A3 · apenas el motor está listo (el archivo cargado y el contexto corriendo, o sea después del primer
    // gesto de verdad) el ambiente arranca en el acto, sin esperar el reintento de cada segundo.
    const soltarElMotor = suscribirAlMotor(() => {
      if (estadoDelMotor() === 'listo') ambiente()
    })
    const reintento = window.setInterval(ambiente, 1000)
    ambiente()
    return () => {
      document.removeEventListener('click', alClic)
      document.removeEventListener('pointerover', alPasar)
      document.removeEventListener('visibilitychange', ambiente)
      soltarElMotor()
      window.clearInterval(reintento)
      motor.current?.ambiente(false)
    }
  }, [prendido, reducido])

  // El cartel se va solo; otro toque lo renueva.
  useEffect(() => {
    if (!cartel) return undefined
    const reloj = window.setTimeout(() => setCartel(false), CARTEL_MS)
    return () => window.clearTimeout(reloj)
  }, [cartel, prendido])

  const tocar = (): void => {
    guardarPrendido(!prendido)
    setCartel(true)
    setAnuncio(prendido ? 'Sonido desactivado' : 'Sonido activado')
  }

  return (
    // En la columna de la esquina (que no recibe el puntero): sólo esto lo recibe. Lleva el tono del infinito (`data-seccion`).
    <div ref={raiz} data-pieza="sonido-de-la-esquina" className="text-tinta pointer-events-auto relative flex justify-center">
      <span role="status" data-pieza="anuncio-del-sonido" className="sr-only">
        {anuncio}
      </span>
      {/* El cartel: centrado sobre el parlante en escritorio; en el teléfono, apoyado a su derecha (no se sale del cuadro). [PULIDO
          11] C2 · en la cabecera, debajo y apoyado a su izquierda (arriba se saldría del cuadro). */}
      <div aria-hidden="true" className={cn('pointer-events-none absolute bottom-full left-1/2 mb-[var(--spacing-2)] -translate-x-1/2 max-escritorio:translate-x-0', abajo ? 'max-escritorio:right-0 max-escritorio:left-auto' : 'max-escritorio:top-full max-escritorio:bottom-auto max-escritorio:left-0 max-escritorio:mt-[var(--spacing-2)] max-escritorio:mb-0')}>
        <AnimatePresence mode="wait">
          {cartel && (
            <motion.div
              key={prendido ? 'activado' : 'desactivado'}
              data-pieza="cartel-del-sonido"
              initial={reducido ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducido ? { opacity: 0, transition: SALIDA_DEL_CARTEL } : { opacity: 0, y: -4, scale: 0.98, transition: SALIDA_DEL_CARTEL }}
              transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
              className="bg-fondo text-tinta flex flex-col items-center gap-[var(--spacing-1)] rounded-[var(--radius-medio)] border border-borde px-[var(--spacing-3)] py-[var(--spacing-2)] whitespace-nowrap shadow-flotante"
            >
              <Micro como="span" className="text-tinta-tenue leading-none">
                Sonido
              </Micro>
              <Micro como="span" peso="medio" className="leading-none">
                {prendido ? 'activado' : 'desactivado'}
              </Micro>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button
        type="button"
        data-pieza="control-del-sonido"
        data-estado={!prendido ? 'apagado' : estadoReal === 'listo' ? 'suena' : 'esperando'}
        aria-pressed={prendido}
        aria-label="Sonido"
        onClick={tocar}
        className={cn('flex h-[var(--spacing-8)] w-[var(--spacing-8)] cursor-pointer items-center justify-center rounded-[var(--radius-circulo)] transition-colors duration-[var(--duracion-media)]', !abajo && 'max-escritorio:size-[var(--spacing-12)] max-escritorio:rounded-full max-escritorio:border max-escritorio:border-borde max-escritorio:bg-fondo max-escritorio:shadow-[var(--shadow-flotante)]')}
      >
        <IconoDelParlante prendido={prendido} suena={estadoReal === 'listo'} reducido={reducido} />
      </button>
    </div>
  )
}
