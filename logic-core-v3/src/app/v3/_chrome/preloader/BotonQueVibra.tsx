'use client'

import { Smartphone } from 'lucide-react'
import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref, type RefObject } from 'react'

import { IconoDelParlante } from '../sonido/IconoDelParlante'
import { apareceElBoton, inicioDelBoton, latidoDelBoton, ondaDelPulso } from './animaciones'
import { animar } from './reloj'

/**
 * [L6 · ítem 81] EL BOTÓN QUE VIBRA — reemplaza a la flecha. La capa tapa el chrome, así que el botón (el del sonido, arriba a la izquierda;
 * en el teléfono también el del movimiento, arriba a la derecha) se dibuja acá, en su lugar y con su aspecto: la caja es la real (el
 * botón, o su lugar si todavía no llegó, que es perezoso), medida en cada cuadro, así que sigue a la ventana y a las fuentes.
 *
 * Aparece cuando termina la frase y late («tu-tu … tu-tu»: dos pulsos cercanos y una pausa, `animaciones.ts`); de cada pulso nace una onda:
 * un anillo fino que crece desde el botón hasta la esquina más lejana y se desvanece, para que se siga con la vista hasta él. Todo en el
 * compositor (sólo `opacity` y `transform`), alineado con el reloj de la capa (`reloj.ts`): sigue aunque el hilo principal esté ocupado.
 * Con movimiento reducido no hay onda: el botón aparece de golpe y su opacidad late. No se toca (aria-hidden): lo que se toca es la frase.
 */
export const OBJETIVOS = {
  sonido: { boton: '[data-pieza="control-del-sonido"]', lugar: '[data-parte="lugar-del-parlante"]' },
  movimiento: { boton: '[data-pieza="control-del-movimiento"]', lugar: '[data-parte="lugar-del-movimiento"]' },
} as const
export type Objetivo = keyof typeof OBJETIVOS

/** Si el botón todavía no existe, el lado de su lugar (px): el disco de la esquina (`--spacing-12`). */
const LADO_DEL_DISCO_PX = 48
/** El grosor de la onda al llegar a su tamaño final (px): al nacer, escalada, es más fina. */
const GROSOR_DE_LA_ONDA_PX = 2

export interface ManijaDelBoton {
  /** Mide y, si algo se movió, rehace lo armado (y sus animaciones, alineadas con el reloj). */
  readonly medir: () => void
}

interface Armado {
  readonly x: number
  readonly y: number
  readonly lado: number
  /** El radio que cubre el fondo desde el centro del botón hasta la esquina más lejana. */
  readonly radio: number
  readonly ancho: number
  readonly alto: number
}

const igual = (a: Armado, b: Armado): boolean => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.lado - b.lado) < 0.5 && a.ancho === b.ancho && a.alto === b.alto

interface Props {
  readonly objetivo: Objetivo
  readonly reloj: RefObject<Animation | null>
  readonly reducido: boolean
  /** Sólo con banco: `sin-onda` (el botón no manda su onda) u `onda-corrida` (nace 120 px al costado). */
  readonly defecto: 'sin-onda' | 'onda-corrida' | null
  readonly ref: Ref<ManijaDelBoton>
}

export function BotonQueVibra({ objetivo, reloj, reducido, defecto, ref }: Props): React.JSX.Element | null {
  const [armado, setArmado] = useState<Armado | null>(null)
  const ultimo = useRef<Armado | null>(null)
  const aparece = useRef<HTMLSpanElement>(null)
  const latido = useRef<HTMLSpanElement>(null)
  const ondas = useRef<{ escala: HTMLSpanElement | null; opacidad: HTMLSpanElement | null }[]>([{ escala: null, opacidad: null }, { escala: null, opacidad: null }])

  // Las animaciones de lo armado de ahora: se rehacen si la caja cambia, alineadas con el reloj de la capa.
  useLayoutEffect(() => {
    const r = reloj.current
    if (armado === null || r === null) return undefined
    const origen = inicioDelBoton(reducido)
    const todas: Animation[] = []
    if (aparece.current !== null) todas.push(animar(aparece.current, apareceElBoton(reducido), r, origen))
    if (latido.current !== null) todas.push(animar(latido.current, latidoDelBoton(reducido), r, origen))
    if (!reducido && defecto !== 'sin-onda') {
      const escalaInicial = armado.lado / (2 * armado.radio)
      ondas.current.forEach((o, i) => {
        const a = ondaDelPulso(i === 0 ? 0 : 1, escalaInicial)
        if (o.escala !== null) todas.push(animar(o.escala, a.escala, r, origen))
        if (o.opacidad !== null) todas.push(animar(o.opacidad, a.opacidad, r, origen))
      })
    }
    return () => {
      for (const a of todas) a.cancel()
    }
  }, [armado, reducido, reloj, defecto])

  useImperativeHandle(
    ref,
    () => ({
      medir: (): void => {
        const sel = OBJETIVOS[objetivo]
        const el = document.querySelector(sel.boton) ?? document.querySelector(sel.lugar)
        const ancho = window.innerWidth
        const alto = window.innerHeight
        if (el === null || ancho <= 0 || alto <= 0) return
        const r = el.getBoundingClientRect()
        const lado = r.width >= 1 ? r.width : LADO_DEL_DISCO_PX
        const x = r.left
        const y = r.top
        const cx = x + lado / 2
        const cy = y + lado / 2
        const radio = Math.max(Math.hypot(cx, cy), Math.hypot(ancho - cx, cy), Math.hypot(cx, alto - cy), Math.hypot(ancho - cx, alto - cy))
        const nuevo: Armado = { x, y, lado, radio, ancho, alto }
        if (ultimo.current !== null && igual(ultimo.current, nuevo)) return
        ultimo.current = nuevo
        setArmado(nuevo)
      },
    }),
    [objetivo],
  )

  if (armado === null) return null
  const { x, y, lado, radio } = armado
  return (
    <div aria-hidden="true" data-parte="boton-que-vibra" data-objetivo={objetivo} className="text-tinta pointer-events-none absolute inset-0 overflow-hidden">
      {!reducido &&
        defecto !== 'sin-onda' &&
        [0, 1].map((i) => (
          <span
            key={i}
            ref={(el) => {
              ondas.current[i].opacidad = el
            }}
            data-parte="onda-del-pulso"
            className="absolute opacity-0"
            style={{ left: x + lado / 2 - radio + (defecto === 'onda-corrida' ? 120 : 0), top: y + lado / 2 - radio, width: 2 * radio, height: 2 * radio }}
          >
            <span
              ref={(el) => {
                ondas.current[i].escala = el
              }}
              className="block size-full rounded-full border-current will-change-transform"
              style={{ borderWidth: GROSOR_DE_LA_ONDA_PX }}
            />
          </span>
        ))}
      <span ref={aparece} data-parte="boton" className="absolute opacity-0" style={{ left: x, top: y, width: lado, height: lado }}>
        <span ref={latido} className="border-borde bg-fondo flex size-full items-center justify-center rounded-full border shadow-[var(--shadow-flotante)] will-change-transform">
          {objetivo === 'sonido' ? <IconoDelParlante prendido={false} suena={false} reducido /> : <Smartphone size={20} strokeWidth={1.5} className="text-tinta-tenue" />}
        </span>
      </span>
    </div>
  )
}
