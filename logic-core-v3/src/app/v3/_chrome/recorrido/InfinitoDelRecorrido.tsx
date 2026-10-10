'use client'

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { Micro } from '../../_componentes/tipografia/Textos'
import { nocheQueSeVe, tonoBajo } from '../cursor/estado'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { CAJA_DEL_INFINITO, TRAZO_DEL_INFINITO, textoDelPorcentaje } from './recorrido'

/**
 * [INTERFAZ 2] T4 · EL INFINITO DEL RECORRIDO — [Cierre de INTERFAZ 2] el indicador que quedó: un infinito (no el logo)
 * que se completa con el recorrido de la página, sobre su pista tenue, y debajo el porcentaje, chico y con números
 * tabulares (no baila). Sin botones ni clics: sólo indica (el menú es el que navega).
 *
 *   · El trazo se dibuja a lo largo de la lemniscata (`recorrido.ts`) del 0 al 100 %, con `stroke-dashoffset` sobre un
 *     largo normalizado (`pathLength = 1`): fino, con las puntas y las uniones redondeadas.
 *   · El avance es el del scroll (que con Lenis ya trae su inercia) con un resorte suave encima, en el tiempo: el trazo
 *     llega como llega la página, sin escalones. Con movimiento reducido, el scroll directo.
 *   · El tono, como el del cursor: el de lo que hay debajo (`tonoBajo`): sobre oscuro, claro; sobre claro, oscuro. Se
 *     lee con el scroll, a lo sumo cada 120 ms, y cada 400 ms quieto (la noche de Trabajos cae DESPUÉS del scroll, con la
 *     gota: leído sólo con el scroll quedaba oscuro sobre la noche). Una imagen o un video debajo cuentan como oscuros
 *     (las del sitio lo son: las capturas del panel, los proyectos; `tonoBajo` sólo mira fondos y subía hasta el papel del
 *     marco). Y el trazo y el número llevan un borde tenue del tono contrario (los dos tonos del anillo de foco, C40):
 *     sobre un medio gris o una imagen, se siguen leyendo.
 *   · Por cuadro: el resorte y dos propiedades del trazo (un MotionValue): React no se vuelve a dibujar. El número se
 *     escribe sólo cuando cambia el entero.
 *   · Escritorio: abajo a la derecha. Teléfono: el mismo infinito, más chico, abajo a la derecha (el botón del menú está
 *     arriba al centro). [PASADA FINAL] C1 · la esquina es una columna: lo que llega en `encima` (el parlante) va justo
 *     encima del infinito y centrado con él; la columna no recibe el puntero (sólo lo que va encima, si lo pide).
 *
 * ── `aria-hidden`, y no `role="progressbar"` ─────────────────────────────
 *
 * Es decorativo y repite lo que el lector ya sabe por el documento (dónde está, por sus encabezados y regiones). Y un
 * `progressbar` que cambia con cada scroll no es inocente: NVDA, por defecto, anuncia las barras de progreso con un pitido
 * en cada cambio de valor, así que bajar la página sería pitar sin parar. Mudo, no estorba.
 */
export const INERCIA_DEL_INFINITO = { stiffness: 120, damping: 26, mass: 0.5 } as const
/** El grueso del trazo, en unidades de la curva (de 104 de ancho): 1,8 px a 64 px y 1,4 px a 48. */
export const GRUESO_DEL_INFINITO = 3
const ENTRE_LECTURAS_MS = 120
/** Cada cuánto se relee el tono con la página quieta (lo que cambia sin scroll: la noche que cae, un viaje que llega). */
const RELECTURA_MS = 400

/** El número de abajo: se escribe sólo cuando cambia el entero (no hay un render de React por cuadro). */
function escribirElNumero(el: HTMLSpanElement | null, p: number): void {
  const texto = textoDelPorcentaje(p)
  if (el !== null && el.textContent !== texto) el.textContent = texto
}

/** [PULIDO 10] J9 · `?progreso=abajo`: en el teléfono, la esquina de abajo de antes (para comparar). */
export function progresoAbajo(consulta: string): boolean {
  return new URLSearchParams(consulta).get('progreso') === 'abajo'
}
const sinCambios = (): (() => void) => () => undefined
const abajoEnLaPagina = (): boolean => progresoAbajo(window.location.search)

export function InfinitoDelRecorrido({ encima = null }: { readonly encima?: React.ReactNode }): React.JSX.Element {
  const abajo = useSyncExternalStore(sinCambios, abajoEnLaPagina, () => false)
  const caja = useRef<HTMLDivElement>(null)
  const numero = useRef<HTMLSpanElement>(null)
  const reducido = useMovimientoReducido()
  const { scrollYProgress } = useScroll()
  const suave = useSpring(scrollYProgress, INERCIA_DEL_INFINITO)
  const avance = reducido ? scrollYProgress : suave
  const resto = useTransform(avance, (p) => 1 - Math.max(0, Math.min(1, p)))
  // Un trazo sin largo con punta redonda dibuja un punto: hasta que empieza, no se ve.
  const visible = useTransform(avance, (p) => (p > 0.002 ? 1 : 0))

  useMotionValueEvent(avance, 'change', (p) => escribirElNumero(numero.current, p))

  useEffect(() => {
    const el = caja.current
    if (el === null) return undefined
    escribirElNumero(numero.current, avance.get())
    let [leido, cuadro] = [0, 0]
    const leerElTono = (): void => {
      cuadro = 0
      leido = performance.now()
      const r = el.getBoundingClientRect()
      const debajo = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      const oscuro = (debajo !== null && (debajo.tagName === 'IMG' || debajo.tagName === 'VIDEO')) || tonoBajo(debajo, nocheQueSeVe()) === 'oscuro'
      // El tono se da vuelta con los tokens de la sección invertida: la tinta pasa a ser clara.
      if (oscuro) el.setAttribute('data-seccion', 'invertida')
      else el.removeAttribute('data-seccion')
    }
    const alScrollear = (): void => {
      if (cuadro !== 0) return
      const falta = ENTRE_LECTURAS_MS - (performance.now() - leido)
      cuadro = window.setTimeout(leerElTono, Math.max(0, falta))
    }
    leerElTono()
    const releer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && cuadro === 0) leerElTono()
    }, RELECTURA_MS)
    window.addEventListener('scroll', alScrollear, { passive: true })
    window.addEventListener('resize', alScrollear, { passive: true })
    return () => {
      window.removeEventListener('scroll', alScrollear)
      window.removeEventListener('resize', alScrollear)
      window.clearTimeout(cuadro)
      window.clearInterval(releer)
    }
  }, [avance])

  return (
    // [RETOQUE 3D] N2 · 1,3 veces más grande (48 → 62 px en el teléfono, 64 → 83 en escritorio); el trazo crece con él.
    // [PULIDO 10] J9 · en el teléfono, arriba a la derecha (el botón del menú va arriba al centro); con `?progreso=abajo`, la
    // columna de abajo de antes. En escritorio, como estaba.
    // [PULIDO 11] C2 · abajo de 1024, la cabecera: el parlante arriba a la left-[max(var(--spacing-4),env(safe-area-inset-left))] (lo que va encima se ubica solo), el menú al
    // centro y el progreso arriba a la right-[max(var(--spacing-4),env(safe-area-inset-right))]; los tres del tamaño del botón del menú (un disco de 48 px, con su fondo, su borde
    // y su sombra), en el mismo eje y adentro de la zona segura (`env(safe-area-inset-*)`, con el aire de siempre como mínimo).
    <div data-pieza="esquina-del-recorrido" className="pointer-events-none fixed right-[var(--spacing-4)] bottom-[var(--spacing-4)] z-[var(--z-cabecera)] flex w-[calc(var(--spacing-12)*1.3)] flex-col items-center gap-[var(--spacing-1)] max-escritorio:not-data-abajo:top-[max(var(--spacing-4),env(safe-area-inset-top))] max-escritorio:not-data-abajo:right-[max(var(--spacing-4),env(safe-area-inset-right))] max-escritorio:not-data-abajo:bottom-auto max-escritorio:not-data-abajo:w-auto escritorio:right-[var(--spacing-6)] escritorio:bottom-[var(--spacing-6)] escritorio:w-[calc(var(--spacing-8)*2.6)]" data-abajo={abajo ? '' : undefined}>
      <div data-parte="lugar-del-parlante" className={cn(!abajo && 'max-escritorio:fixed max-escritorio:top-[max(var(--spacing-4),env(safe-area-inset-top))] max-escritorio:left-[max(var(--spacing-4),env(safe-area-inset-left))]')}>
        {encima}
      </div>
      <div ref={caja} data-pieza="infinito-del-recorrido" aria-hidden="true" className={cn('text-tinta flex w-[calc(var(--spacing-12)*1.3)] flex-col items-center gap-[var(--spacing-1)] transition-colors duration-[var(--duracion-media)] escritorio:w-full', !abajo && 'max-escritorio:size-[var(--spacing-12)] max-escritorio:rounded-full max-escritorio:border max-escritorio:border-borde max-escritorio:bg-fondo max-escritorio:shadow-[var(--shadow-flotante)] max-escritorio:justify-center max-escritorio:gap-0')}>
        <svg viewBox={CAJA_DEL_INFINITO} className={cn('block h-auto w-full overflow-visible', !abajo && 'max-escritorio:w-[70%]')}>
          {/* El borde del tono contrario, debajo de todo: se lee sobre cualquier fondo (los dos tonos del anillo de foco). */}
          <path d={TRAZO_DEL_INFINITO} fill="none" stroke="var(--color-fondo)" strokeWidth={GRUESO_DEL_INFINITO + 2} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
          {/* La pista: el infinito entero, tenue. */}
          <path d={TRAZO_DEL_INFINITO} fill="none" stroke="currentColor" strokeWidth={GRUESO_DEL_INFINITO} strokeLinecap="round" strokeLinejoin="round" opacity={0.2} />
          {/* El recorrido: el mismo trazo, dibujado hasta donde llegaste. */}
          <motion.path d={TRAZO_DEL_INFINITO} fill="none" stroke="currentColor" strokeWidth={GRUESO_DEL_INFINITO} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: resto, opacity: visible }} />
        </svg>
        <Micro como="span" className="[text-shadow:0_0_var(--spacing-1)_var(--color-fondo)] tabular-nums">
          <span ref={numero} />
        </Micro>
      </div>
    </div>
  )
}
