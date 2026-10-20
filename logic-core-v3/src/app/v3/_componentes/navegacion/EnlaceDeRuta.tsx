'use client'

import Link from 'next/link'
import { useRef, type AnchorHTMLAttributes } from 'react'

import { pedirLaSalidaDeLaVariante } from '../../_lib/escena/ruta/salidaDeLaVariante'
import { cubrirConElVelo, nocheDelDestino } from '../../_lib/veloDeNavegacion'

type PropsDelEnlace = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { readonly href: string }

/** El defecto, para el control positivo del arnés (`window.__defectosDelVelo = 'sin-velo'`: navega sin cubrir); nunca la URL. */
const sinVelo = (): boolean => (window as Window & { __defectosDelVelo?: unknown }).__defectosDelVelo === 'sin-velo'

/**
 * [B12a.6] EL ENLACE ENTRE PÁGINAS DE `/v3` (plan §3.5 y §5; `docs/rediseno/B12a-API.md` §5) — el `<Link>` de next con el velo; nunca
 * `router.push` ni `TransitionContext`. Con un clic izquierdo sin modificadores: pide la salida de la variante (P-H29d: vuelve a la
 * composición con la página quieta), pide el velo del color del destino (`cubrirConElVelo`: anochece hacia una página, amanece hacia el
 * home) y, con el cuadro cubierto, deja pasar el clic al mismo `<Link>` (la navegación cliente: el lienzo y el chrome no se rehacen). El
 * velo destapa la página nueva (`_chrome/velo/VeloDeNavegacion.tsx`). Un ancla del documento (`#…`) es un `<a>` de siempre: la recorre
 * el viaje del home. Ctrl, Cmd, Shift, Alt, el botón del medio o un `target`: los del navegador.
 */
export function EnlaceDeRuta({ href, onClick, children, ...resto }: PropsDelEnlace): React.JSX.Element {
  const dejarPasar = useRef(false)
  if (href.startsWith('#')) {
    return (
      <a href={href} onClick={onClick} {...resto}>
        {children}
      </a>
    )
  }
  return (
    <Link
      href={href}
      scroll={false}
      onClick={(e) => {
        onClick?.(e)
        if (dejarPasar.current) {
          dejarPasar.current = false
          return
        }
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (resto.target !== undefined && resto.target !== '_self')) return
        e.preventDefault()
        const enlace = e.currentTarget
        void pedirLaSalidaDeLaVariante()
          .then(() => (sinVelo() ? undefined : cubrirConElVelo(nocheDelDestino(href))))
          .then(() => {
            dejarPasar.current = true
            enlace.click()
          })
      }}
      {...resto}
    >
      {children}
    </Link>
  )
}
