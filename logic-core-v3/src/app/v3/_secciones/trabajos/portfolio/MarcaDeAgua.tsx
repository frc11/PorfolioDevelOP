'use client'

import { motion } from 'motion/react'

import type { ProyectoDelPortfolio } from '../proyectos'

import { enLaSecuencia } from './secuencia'

/**
 * [B1.2b] LAS MARCAS DE AGUA DE LAS TIRAS (plan §12, puntos 4 y 5) — un tratamiento para las cuatro: monocromas (la tinta), grandes,
 * de fondo y con poco brillo (`OPACIDAD_DE_LA_MARCA`), detrás del texto (van primero en la tira y el texto va posicionado después:
 * se pinta encima sin un `z-index`). Decorativas: `aria-hidden`. El AA del texto se mide con la marca debajo (el banco).
 *
 *   · un proyecto: el logo del cliente, por máscara (su silueta en la tinta: monocromo aunque el archivo sea de color); sin logo
 *     limpio, el nombre (`MarcaDeAguaTipografica`). Recién con la sección cerca (antes no se pide ni se dibuja);
 *   · «la tuya»: el «?» con el estilo del logo de develOP ([B1.2c] `SignoDePregunta.tsx`: centrado en la tira y armándose).
 */
export const OPACIDAD_DE_LA_MARCA = 0.08

const CLASE_DE_LA_MARCA = 'pointer-events-none absolute inset-x-8 bottom-12 h-2/5 bg-tinta'

/** [C2 · 40] La marca entra con un fundido (con la secuencia de su tira, hasta su opacidad) y no de la nada; sin `visible`, quieta a la vista. */
export function MarcaDeAgua({ proyecto, cerca, visible = true, reducido = false }: { readonly proyecto: ProyectoDelPortfolio; readonly cerca: boolean; readonly visible?: boolean; readonly reducido?: boolean }): React.JSX.Element | null {
  if (!cerca) return null
  if (proyecto.logo === null) return <MarcaDeAguaTipografica nombre={proyecto.nombre} visible={visible} reducido={reducido} />
  const mascara = `url(${proyecto.logo})`
  return (
    <motion.div
      aria-hidden="true"
      data-marca-de-agua={proyecto.slug}
      className={CLASE_DE_LA_MARCA}
      {...enLaSecuencia(visible, 0, reducido, OPACIDAD_DE_LA_MARCA)}
      style={{
        maskImage: mascara,
        WebkitMaskImage: mascara,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}

/** Sin un logo limpio, el nombre del cliente como marca de agua (hasta que Valentino pase el archivo). */
export function MarcaDeAguaTipografica({ nombre, visible = true, reducido = false }: { readonly nombre: string; readonly visible?: boolean; readonly reducido?: boolean }): React.JSX.Element {
  return (
    <motion.span
      aria-hidden="true"
      data-marca-de-agua="nombre"
      className="pointer-events-none absolute inset-x-8 bottom-12 flex h-2/5 items-center justify-center text-center font-titulo text-[length:var(--text-display-xl)] leading-none text-tinta"
      {...enLaSecuencia(visible, 0, reducido, OPACIDAD_DE_LA_MARCA)}
    >
      {nombre}
    </motion.span>
  )
}
