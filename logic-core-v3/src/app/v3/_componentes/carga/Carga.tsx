'use client'

import { motion } from 'motion/react'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { LOGO_INK_VIEWBOX, LOGO_INK_VIEWBOX_ATTR, LOGO_PATH_D } from '@/components/ui/LogoMark'
import { cn } from '@/lib/utils'

import { useMovimientoReducido } from '../../_lib/motion/reducido'

/**
 * [PULIDO 10] J3 · LA CARGA DE develOP — un solo componente para todo lo que espera en /v3: el logo.
 *
 *   <Carga tamano="chico" | "medio" | "grande" tinta="tinta" | "filo" textos={TEXTOS_DE_ENVIO} enLinea? etiqueta? />
 *
 * - **El trazo** (el de siempre): el contorno del logo se dibuja y se desdibuja en loop, y el relleno se pinta y se despinta
 *   en el medio. SVG, sin WebGL (liviano, ningún lienzo aparte: ningún cuadro opaco al montarse). Un solo trazado con
 *   `pathLength` 1: el guion no necesita medir el logo.
 * - **El giro** (`?carga=giro`): el logo con espesor (capas del mismo trazado corridas en profundidad, CSS 3D) girando sobre
 *   su eje vertical. Tampoco agrega un contexto de WebGL: el de la escena no se puede prestar sin un lienzo encima.
 *   [PULIDO 11] B5 · es el de siempre (el trazo queda de respaldo: con movimiento reducido, sin WebGL o con `?carga=trazo`) y
 *   gira sobre el PALITO de la P (no sobre el centro de la tinta: el logo no está centrado en él), con el palito en el medio
 *   del área de la carga.
 * - **`tinta`**: con qué se dibuja, según el fondo: `tinta` (el negro, sobre papel) o `filo` (el claro, sobre negro). Quien la
 *   contiene puede pisarla con `--carga-tinta` (el botón del pie: clara sobre la tecla, oscura en el angosto). Se pinta con
 *   `fill`/`stroke` y el texto con `-webkit-text-fill-color`, no con `color`: así se ve aunque lo que la contiene tenga el
 *   texto transparente (el pie de volumen apaga el DOM de su tecla con un `color` transparente importante).
 * - **`textos`**: un estado sobrio que cambia mientras espera (uno cada `CARGA.textoMs`, se queda en el último). Va en un
 *   `role="status"`: el lector lo anuncia. Sin textos, `etiqueta` es el nombre accesible.
 * - **`data-sin-volumen`**: el pie de volumen no la mide para su placa (no la extruye: se queda en el DOM, viva).
 * - **La espera mínima** (`conDuracionMinima`): que se vea hacer algo aunque la respuesta llegue antes (en producción va a ser
 *   rápida y no puede parpadear): `CARGA.minimoMs`.
 * - **Movimiento reducido**: el logo quieto (relleno) y el texto.
 */
export const CARGA = {
  /** Una vuelta del trazo o del giro (s): se dibuja, se pinta, se despinta y se desdibuja. */
  vueltaS: 2.4,
  minimoMs: 1400,
  textoMs: 900,
  lados: { chico: 'size-[var(--spacing-5)]', medio: 'size-[calc(var(--spacing-20)*1.2)]', grande: 'size-[calc(var(--spacing-20)*2)]' },
  /** El lado en CSS (para el espesor del giro): el mismo de `lados`. */
  ladoCss: { chico: 'var(--spacing-5)', medio: 'calc(var(--spacing-20) * 1.2)', grande: 'calc(var(--spacing-20) * 2)' },
  /** El giro: cuántas capas y cuánto espesor (fracción del lado), y la perspectiva (en lados). */
  giro: { capas: 9, espesor: 0.14, perspectiva: 4 },
} as const

/**
 * [PULIDO 11] B5 · el palito de la P en el trazado (`LOGO_PATH_D`, unidades del viewBox de 1024): su borde izquierdo en x = 532
 * (el primer punto del trazado) y el derecho en x ≈ 658. Su centro, como fracción del ancho de la tinta: el eje del giro.
 */
export const PALITO_DE_LA_P = { izquierda: 532, derecha: 658 } as const
export const EJE_DEL_PALITO = ((PALITO_DE_LA_P.izquierda + PALITO_DE_LA_P.derecha) / 2 - LOGO_INK_VIEWBOX.x) / LOGO_INK_VIEWBOX.width

export type TamanoDeLaCarga = keyof typeof CARGA.lados
export type VarianteDeLaCarga = 'trazo' | 'giro'

/** La variante pedida en `?carga=` ([PULIDO 11] B5 · sin pedir, o con otro valor: el giro; `trazo`, el trazo). */
export function varianteDeLaCarga(valor: string | null | undefined): VarianteDeLaCarga {
  return valor === 'trazo' ? 'trazo' : 'giro'
}

const sinCambios = (): (() => void) => () => undefined
// [PULIDO 11] B5 · sin WebGL, el trazo (el respaldo liviano).
const deLaPagina = (): VarianteDeLaCarga => ('WebGLRenderingContext' in window ? varianteDeLaCarga(new URLSearchParams(window.location.search).get('carga')) : 'trazo')

interface Props {
  readonly tamano?: TamanoDeLaCarga
  readonly tinta?: 'tinta' | 'filo'
  readonly textos?: readonly string[]
  /** El nombre accesible sin textos (o además de ellos). */
  readonly etiqueta?: string
  /** Con los textos al costado (el botón) en vez de abajo. */
  readonly enLinea?: boolean
  readonly className?: string
}

/** Espera la promesa y, por lo menos, `ms`: la carga se ve el tiempo suficiente para leerse como trabajo, no como un parpadeo. */
export async function conDuracionMinima<T>(promesa: Promise<T>, ms: number = CARGA.minimoMs): Promise<T> {
  const [resultado] = await Promise.all([promesa, new Promise((listo) => window.setTimeout(listo, ms))])
  return resultado
}

export function Carga({ tamano = 'medio', tinta = 'tinta', textos = [], etiqueta, enLinea = false, className }: Props): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const variante = useSyncExternalStore(sinCambios, deLaPagina, () => 'trazo' as const)
  const [indice, setIndice] = useState(0)
  useEffect(() => {
    if (textos.length < 2) return undefined
    const reloj = window.setInterval(() => setIndice((i) => Math.min(textos.length - 1, i + 1)), CARGA.textoMs)
    return () => window.clearInterval(reloj)
  }, [textos.length])
  const texto = textos[Math.min(indice, Math.max(0, textos.length - 1))]
  const color = `var(--carga-tinta, ${tinta === 'filo' ? 'var(--color-fondo)' : 'var(--color-tinta)'})`
  return (
    <span role="status" aria-label={texto === undefined ? etiqueta : undefined} data-pieza="carga" data-variante={variante} data-sin-volumen="" className={cn('inline-flex items-center', enLinea ? 'flex-row gap-[var(--spacing-2)]' : 'flex-col gap-[var(--spacing-3)]', className)}>
      {variante === 'giro' && !reducido ? <Giro tamano={tamano} color={color} /> : <Trazo tamano={tamano} color={color} quieto={reducido} />}
      {texto !== undefined && (
        <span className="text-caption leading-texto" style={{ WebkitTextFillColor: color }}>
          {texto}
        </span>
      )}
    </span>
  )
}

function Trazo({ tamano, color, quieto }: { readonly tamano: TamanoDeLaCarga; readonly color: string; readonly quieto: boolean }): React.JSX.Element {
  return (
    <svg viewBox={LOGO_INK_VIEWBOX_ATTR} aria-hidden="true" focusable="false" className={cn(CARGA.lados[tamano], 'shrink-0 overflow-visible')}>
      {quieto ? (
        <path d={LOGO_PATH_D} fill={color} />
      ) : (
        <motion.path
          d={LOGO_PATH_D}
          pathLength={1}
          fill={color}
          stroke={color}
          strokeWidth={14}
          strokeLinejoin="round"
          strokeDasharray="1 1"
          initial={{ strokeDashoffset: 1, fillOpacity: 0 }}
          animate={{ strokeDashoffset: [1, 0, 0, 0, -1], fillOpacity: [0, 0, 1, 0, 0] }}
          transition={{ duration: CARGA.vueltaS, times: [0, 0.38, 0.55, 0.78, 1], ease: 'easeInOut', repeat: Infinity }}
        />
      )}
    </svg>
  )
}

/**
 * El giro: el logo con espesor (capas corridas en profundidad, el frente entero y los cantos un poco más claros), girando. [PULIDO 11]
 * B5 · sobre el eje del palito de la P (`EJE_DEL_PALITO`), con el palito en el medio del área (el logo se corre lo que le falta).
 */
function Giro({ tamano, color }: { readonly tamano: TamanoDeLaCarga; readonly color: string }): React.JSX.Element {
  const { capas, espesor, perspectiva } = CARGA.giro
  const lado = CARGA.ladoCss[tamano]
  const canto = `color-mix(in srgb, ${color} 72%, var(--color-fondo))`
  const eje = `${(EJE_DEL_PALITO * 100).toFixed(2)}%`
  return (
    <span aria-hidden="true" className={cn(CARGA.lados[tamano], 'relative shrink-0')} style={{ perspective: `calc(${lado} * ${String(perspectiva)})` }}>
      <span className="absolute inset-0 block" style={{ transform: `translateX(${((0.5 - EJE_DEL_PALITO) * 100).toFixed(2)}%)`, transformStyle: 'preserve-3d' }}>
      <motion.span className="absolute inset-0 block" style={{ transformStyle: 'preserve-3d', transformOrigin: `${eje} 50%` }} animate={{ rotateY: 360 }} transition={{ duration: CARGA.vueltaS, ease: 'linear', repeat: Infinity }}>
        {Array.from({ length: capas }, (_, k) => (
          <svg key={k} viewBox={LOGO_INK_VIEWBOX_ATTR} focusable="false" className="absolute inset-0 size-full overflow-visible" style={{ transform: `translateZ(calc(${lado} * ${String(-(k * espesor) / Math.max(1, capas - 1))}))` }}>
            <path d={LOGO_PATH_D} fill={k === 0 || k === capas - 1 ? color : canto} />
          </svg>
        ))}
      </motion.span>
      </span>
    </span>
  )
}
