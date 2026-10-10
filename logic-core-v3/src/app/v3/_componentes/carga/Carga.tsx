'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { LOGO_INK_VIEWBOX, LOGO_INK_VIEWBOX_ATTR, LOGO_PATH_D } from '@/components/ui/LogoMark'
import { cn } from '@/lib/utils'

import { useMovimientoReducido } from '../../_lib/motion/reducido'

/**
 * [PULIDO 10] J3 · LA CARGA DE develOP — un solo componente para todo lo que espera en /v3: el logo.
 *
 *   <Carga tamano="chico" | "medio" | "grande" tinta="tinta" | "filo" textos={TEXTOS_DE_ENVIO} enLinea? etiqueta? />
 *
 * - **El giro**: el logo con espesor (capas del mismo trazado corridas en profundidad, CSS 3D) girando sobre su eje vertical.
 *   No agrega un contexto de WebGL: el de la escena no se puede prestar sin un lienzo encima. [PULIDO 11] B5 · gira sobre el
 *   PALITO de la P (no sobre el centro de la tinta: el logo no está centrado en él), con el palito en el medio del área.
 *   [PULIDO 13] K2 · UNA pieza sólida: sin perspectiva (la proyección paralela: de frente la cara de atrás queda exactamente
 *   detrás de la de adelante y no asoma ningún contorno corrido), con las capas a menos de `separacionPx` (de canto se leen
 *   como un bloque, no como rebanadas) y el eje en el MEDIO del espesor (sobre la cara de adelante, el cuerpo giraba de costado
 *   y el eje se veía en el borde izquierdo del palito). El trazo y su bandera se borraron (no andaba).
 * - **Con movimiento reducido**: el logo quieto (relleno) y el texto.
 * - **`tinta`**: con qué se dibuja, según el fondo: `tinta` (el negro, sobre papel) o `filo` (el claro, sobre negro). Quien la
 *   contiene puede pisarla con `--carga-tinta` (el botón del pie: clara sobre la tecla, oscura en el angosto). Se pinta con
 *   `fill`/`stroke` y el texto con `-webkit-text-fill-color`, no con `color`: así se ve aunque lo que la contiene tenga el
 *   texto transparente (el pie de volumen apaga el DOM de su tecla con un `color` transparente importante).
 * - **`textos`**: un estado sobrio que cambia mientras espera (uno cada `CARGA.textoMs`, se queda en el último). Va en un
 *   `role="status"`: el lector lo anuncia. Sin textos, `etiqueta` es el nombre accesible.
 * - **`data-sin-volumen`**: el pie de volumen no la mide para su placa (no la extruye: se queda en el DOM, viva).
 * - **La espera mínima** (`conDuracionMinima`): que se vea hacer algo aunque la respuesta llegue antes (en producción va a ser
 *   rápida y no puede parpadear): `CARGA.minimoMs`.
 */
export const CARGA = {
  /** Una vuelta del giro (s). */
  vueltaS: 2.4,
  minimoMs: 1400,
  textoMs: 900,
  lados: { chico: 'size-[var(--spacing-5)]', medio: 'size-[calc(var(--spacing-20)*1.2)]', grande: 'size-[calc(var(--spacing-20)*2)]' },
  /** El lado en CSS (para el espesor del giro): el mismo de `lados`. */
  ladoCss: { chico: 'var(--spacing-5)', medio: 'calc(var(--spacing-20) * 1.2)', grande: 'calc(var(--spacing-20) * 2)' },
  /** El lado en px (con la raíz de 16: `--spacing-5` es 20 y `--spacing-20`, 80): para contar las capas. */
  ladoPx: { chico: 20, medio: 96, grande: 160 },
  /** El giro: el espesor (fracción del lado) y cuánto, a lo sumo, entre dos capas (px): de canto, un bloque sin rendijas. */
  giro: { espesor: 0.14, separacionPx: 0.7 },
  /**
   * [PULIDO 13] K2 · las secciones de adentro (fracciones del ancho de la tinta, más el eje): planos perpendiculares a la cara con
   * el perfil del logo en esa x. Exactamente de canto cada capa es una línea sin ancho y entre ellas se veía el fondo (rayas); ahí
   * las secciones miran de frente y su unión es la banda del espesor entera. En los demás ángulos quedan adentro del sólido.
   */
  secciones: [0.06, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9],
} as const

/**
 * [PULIDO 11] B5 · el palito de la P en el trazado (`LOGO_PATH_D`, unidades del viewBox de 1024): su borde izquierdo en x = 532
 * (el primer punto del trazado) y el derecho en x ≈ 658. Su centro, como fracción del ancho de la tinta: el eje del giro.
 */
export const PALITO_DE_LA_P = { izquierda: 532, derecha: 658 } as const
export const EJE_DEL_PALITO = ((PALITO_DE_LA_P.izquierda + PALITO_DE_LA_P.derecha) / 2 - LOGO_INK_VIEWBOX.x) / LOGO_INK_VIEWBOX.width

export type TamanoDeLaCarga = keyof typeof CARGA.lados

/** [PULIDO 13] K2 · cuántas capas lleva cada tamaño: las que hacen falta para que ninguna quede a más de `separacionPx` de la otra. */
export function capasDelGiro(tamano: TamanoDeLaCarga): number {
  return Math.ceil((CARGA.giro.espesor * CARGA.ladoPx[tamano]) / CARGA.giro.separacionPx) + 1
}

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
  const [indice, setIndice] = useState(0)
  useEffect(() => {
    if (textos.length < 2) return undefined
    const reloj = window.setInterval(() => setIndice((i) => Math.min(textos.length - 1, i + 1)), CARGA.textoMs)
    return () => window.clearInterval(reloj)
  }, [textos.length])
  const texto = textos[Math.min(indice, Math.max(0, textos.length - 1))]
  const color = `var(--carga-tinta, ${tinta === 'filo' ? 'var(--color-fondo)' : 'var(--color-tinta)'})`
  return (
    <span role="status" aria-label={texto === undefined ? etiqueta : undefined} data-pieza="carga" data-sin-volumen="" className={cn('inline-flex items-center', enLinea ? 'flex-row gap-[var(--spacing-2)]' : 'flex-col gap-[var(--spacing-3)]', className)}>
      {reducido ? <LogoQuieto tamano={tamano} color={color} /> : <Giro tamano={tamano} color={color} />}
      {texto !== undefined && (
        <span className="text-caption leading-texto" style={{ WebkitTextFillColor: color }}>
          {texto}
        </span>
      )}
    </span>
  )
}

/**
 * [PULIDO 13] K2 · la vista de una sección: una franja de 1 u de la tinta alrededor de la fracción `f` de su ancho (estirada al
 * espesor: `preserveAspectRatio="none"`), con el mismo alto que ven las capas (la tinta es más ancha que alta: en la caja cuadrada
 * el ancho la llena y el alto queda centrado).
 */
function vistaDeLaSeccion(f: number): string {
  const V = LOGO_INK_VIEWBOX
  const x = V.x + f * V.width
  return `${String(x - 0.5)} ${String(V.y + V.height / 2 - V.width / 2)} 1 ${String(V.width)}`
}

/** Con movimiento reducido: el logo quieto, relleno. */
function LogoQuieto({ tamano, color }: { readonly tamano: TamanoDeLaCarga; readonly color: string }): React.JSX.Element {
  return (
    <svg viewBox={LOGO_INK_VIEWBOX_ATTR} aria-hidden="true" focusable="false" className={cn(CARGA.lados[tamano], 'shrink-0 overflow-visible')}>
      <path d={LOGO_PATH_D} fill={color} />
    </svg>
  )
}

/**
 * El giro: el logo con espesor (capas corridas en profundidad: las dos caras en la tinta y el canto un poco más claro), girando.
 * [PULIDO 11] B5 · sobre el eje del palito de la P (`EJE_DEL_PALITO`), con el palito en el medio del área (el logo se corre lo que
 * le falta). [PULIDO 13] K2 · una pieza: sin perspectiva, capas a menos de `separacionPx` y el eje en el medio del espesor.
 */
function Giro({ tamano, color }: { readonly tamano: TamanoDeLaCarga; readonly color: string }): React.JSX.Element {
  const { espesor } = CARGA.giro
  const capas = capasDelGiro(tamano)
  const lado = CARGA.ladoCss[tamano]
  const canto = `color-mix(in srgb, ${color} 72%, var(--color-fondo))`
  const eje = `${(EJE_DEL_PALITO * 100).toFixed(2)}%`
  return (
    <span aria-hidden="true" className={cn(CARGA.lados[tamano], 'relative shrink-0')}>
      <span className="absolute inset-0 block" style={{ transform: `translateX(${((0.5 - EJE_DEL_PALITO) * 100).toFixed(2)}%)`, transformStyle: 'preserve-3d' }}>
        <motion.span className="absolute inset-0 block" style={{ transformStyle: 'preserve-3d', transformOrigin: `${eje} 50% calc(${lado} * ${String(-espesor / 2)})` }} animate={{ rotateY: 360 }} transition={{ duration: CARGA.vueltaS, ease: 'linear', repeat: Infinity }}>
          {Array.from({ length: capas }, (_, k) => (
            <svg key={k} viewBox={LOGO_INK_VIEWBOX_ATTR} focusable="false" className="absolute inset-0 size-full overflow-visible" style={{ transform: `translateZ(calc(${lado} * ${String(-(k * espesor) / (capas - 1))}))` }}>
              <path d={LOGO_PATH_D} fill={k === 0 || k === capas - 1 ? color : canto} />
            </svg>
          ))}
          {[...CARGA.secciones, EJE_DEL_PALITO].map((f) => (
            <svg key={`seccion-${String(f)}`} viewBox={vistaDeLaSeccion(f)} preserveAspectRatio="none" focusable="false" data-seccion-del-giro="" className="absolute top-0 h-full" style={{ left: `calc(${(f * 100).toFixed(2)}% - ${lado} * ${String(espesor / 2)})`, width: `calc(${lado} * ${String(espesor)})`, transform: `translateZ(calc(${lado} * ${String(-espesor / 2)})) rotateY(90deg)` }}>
              <path d={LOGO_PATH_D} fill={canto} />
            </svg>
          ))}
        </motion.span>
      </span>
    </span>
  )
}
