'use client'

import type { ProyectoDelPortfolio } from '../proyectos'

/**
 * [B1.2b] LAS MARCAS DE AGUA DE LAS TIRAS (plan §12, puntos 4 y 5) — un tratamiento para las cuatro: monocromas (la tinta), grandes,
 * de fondo y con poco brillo (`OPACIDAD_DE_LA_MARCA`), detrás del texto (van primero en la tira y el texto va posicionado después:
 * se pinta encima sin un `z-index`). Decorativas: `aria-hidden`. El AA del texto se mide con la marca debajo (el banco).
 *
 *   · un proyecto: el logo del cliente, por máscara (su silueta en la tinta: monocromo aunque el archivo sea de color); sin logo
 *     limpio, el nombre (`MarcaDeAguaTipografica`). Recién con la sección cerca (antes no se pide ni se dibuja);
 *   · «la tuya»: el «?» con el estilo del logo de develOP (`SignoDePregunta`), pegado al borde izquierdo.
 */
export const OPACIDAD_DE_LA_MARCA = 0.08

const CLASE_DE_LA_MARCA = 'pointer-events-none absolute inset-x-8 bottom-12 h-2/5 bg-tinta'

export function MarcaDeAgua({ proyecto, cerca }: { readonly proyecto: ProyectoDelPortfolio; readonly cerca: boolean }): React.JSX.Element | null {
  if (!cerca) return null
  if (proyecto.logo === null) return <MarcaDeAguaTipografica nombre={proyecto.nombre} />
  const mascara = `url(${proyecto.logo})`
  return (
    <div
      aria-hidden="true"
      data-marca-de-agua={proyecto.slug}
      className={CLASE_DE_LA_MARCA}
      style={{
        opacity: OPACIDAD_DE_LA_MARCA,
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
export function MarcaDeAguaTipografica({ nombre }: { readonly nombre: string }): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      data-marca-de-agua="nombre"
      className="pointer-events-none absolute inset-x-8 bottom-12 flex h-2/5 items-center justify-center text-center font-titulo text-[length:var(--text-display-xl)] leading-none text-tinta"
      style={{ opacity: OPACIDAD_DE_LA_MARCA }}
    >
      {nombre}
    </span>
  )
}

/**
 * EL «?» DE «LA TUYA», con el estilo del logo de develOP: «el logo, pero con forma de signo de pregunta». El logo es una cinta de
 * ancho constante (`LOGO_PATH_D`: lazos de radio ~257 por fuera y ~153 por dentro, cortes rectos); este signo es la misma cinta
 * (104 de ancho sobre un lazo de 200 de radio: 252 por fuera y 148 por dentro) con el gancho, la vuelta al revés que baja al
 * palo y el punto, todo de arcos y rectas (un contorno exacto, sin trazos que ensanchar). Y lleva lo de la pieza del logo de
 * `EncajeDelLogo`: el relleno gris, el filo claro (el canto que toma la luz) y la sombra corrida hacia abajo. Quieto.
 */
export const CONTORNO_DEL_SIGNO =
  'M51.83 323.76A252 252 0 1 1 426 498.24A148 148 0 0 0 352 626.41L352 730L248 730L248 626.41A252 252 0 0 1 374 408.17A148 148 0 1 0 154.25 305.7Z'
export const PUNTO_DEL_SIGNO = 'M248 810H352V914H248Z'
const VISTA_DEL_SIGNO = '36 16 540 920'
/** Lo que se corre la sombra (unidades del dibujo: el del logo, 16 hacia abajo) y el ancho del filo (el del logo, 6). */
const SOMBRA_DEL_SIGNO = 16
const FILO_DEL_SIGNO = 6

export function SignoDePregunta(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-marca-de-agua="signo"
      viewBox={VISTA_DEL_SIGNO}
      className="pointer-events-none absolute inset-y-0 left-0 my-auto h-4/5 w-auto"
      style={{ opacity: OPACIDAD_DE_LA_MARCA }}
    >
      <g transform={`translate(0 ${String(SOMBRA_DEL_SIGNO)})`} style={{ fill: 'var(--color-fondo)' }}>
        <path d={CONTORNO_DEL_SIGNO} />
        <path d={PUNTO_DEL_SIGNO} />
      </g>
      <g style={{ fill: 'color-mix(in srgb, var(--color-tinta) 55%, var(--color-fondo))', stroke: 'var(--color-tinta)', strokeWidth: FILO_DEL_SIGNO }}>
        <path d={CONTORNO_DEL_SIGNO} />
        <path d={PUNTO_DEL_SIGNO} />
      </g>
    </svg>
  )
}
