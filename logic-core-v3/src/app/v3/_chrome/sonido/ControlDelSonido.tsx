'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { Micro } from '../../_componentes/tipografia/Textos'
import { CURVAS } from '../../_lib/motion/curvas'
import { sonar } from '../../_lib/sonido/bus'
import type { MotorDelSonido } from '../../_lib/sonido/motor'
import { guardarPrendido, leerPrendido, suscribirAlPrendido } from '../../_lib/sonido/preferencia'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { SELECTOR_DE_LOS_CTA } from '../escena/RespuestaDeLaEscena'
import { IconoDelParlante } from './IconoDelParlante'
import { estadoDelMotor, pedirElMotor, soltarElMotor, suscribirAlMotor } from './motorCompartido'

/**
 * [3D Y SONIDO] T2 · EL CONTROL DEL SONIDO — un parlante chico (trazo fino, puntas redondas). [RETOQUE 3D] En el producto (era sólo
 * con la prueba). [CIERRE A] A6 · el infinito del recorrido se fue: el parlante va en su esquina (`EsquinaDelSonido.tsx`), en escritorio
 * arriba a la izquierda en un disco del vidrio de Contacto y Login (del alto de la barra), y abajo de 1024 en el disco de la cabecera.
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
// [L5] Y el WhatsApp del FAQ de volumen, que suena como el del pie.
const DE_LOS_CTA = `${SELECTOR_DE_LOS_CTA}, [data-pieza="empezar"], [data-abre-contacto], [data-pieza="bloque-solido"][data-solido], [data-bloque-del-faq="whatsapp"]`
/** [RETOQUE PANEL] T2 · las demos de Tu panel: sin clic propio; lo que se toca adentro suena el pestillo de la barra y los CTA. */
const DE_LAS_DEMOS_DEL_PANEL = '[data-pieza="demo-del-panel"]'

/** Cuánto se queda el cartel después de tocar el parlante (ms), y su salida: corta, así el cambio de texto no se arrastra. */
export const CARTEL_MS = 1800
const SALIDA_DEL_CARTEL = { duration: 0.14, ease: CURVAS.principal } as const

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
      // [B1.2d B] Nada suena si no pasa nada: un control deshabilitado (la cabecera abierta del acordeón del Portfolio, por ejemplo), no.
      if (blanco.closest(ENLACES_Y_BOTONES)?.matches('[aria-disabled="true"], :disabled') === true) return
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

  // [C2-81] El prototipo del giroscopio (`?giroscopio=si`: este toque prendía también el movimiento) se fue: el movimiento tiene su
  // botón (`_chrome/movimiento/`) y la frase del preloader prende los dos.

  const tocar = (): void => {
    guardarPrendido(!prendido)
    setCartel(true)
    setAnuncio(prendido ? 'Sonido desactivado' : 'Sonido activado')
  }

  return (
    // En su esquina (que no recibe el puntero): sólo esto lo recibe. El disco lleva su fondo: se lee sobre cualquier sección.
    <div ref={raiz} data-pieza="sonido-de-la-esquina" className="text-tinta pointer-events-auto relative flex justify-center">
      <span role="status" data-pieza="anuncio-del-sonido" className="sr-only">
        {anuncio}
      </span>
      {/* El cartel: centrado sobre el parlante en escritorio; en el teléfono, apoyado a su derecha (no se sale del cuadro). [PULIDO
          11] C2 · en la cabecera, debajo y apoyado a su izquierda (arriba se saldría del cuadro). */}
      <div aria-hidden="true" className="pointer-events-none absolute top-full left-0 mt-[var(--spacing-2)]">
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
        className="flex cursor-pointer items-center justify-center rounded-full border-borde shadow-[var(--shadow-flotante)] transition-colors duration-[var(--duracion-media)] max-hasta-tablet:size-[var(--spacing-12)] max-hasta-tablet:border max-hasta-tablet:bg-fondo hasta-tablet:size-[calc(var(--spacing-3)*2+var(--text-cuerpo)*var(--leading-texto))] hasta-tablet:border-[length:var(--border-hairline)] hasta-tablet:bg-[var(--color-superficie-translucida)] hasta-tablet:backdrop-blur-[var(--blur-panel)]"
      >
        <IconoDelParlante prendido={prendido} suena={estadoReal === 'listo'} reducido={reducido} />
      </button>
    </div>
  )
}
