'use client'

import Link from 'next/link'
import { useRef, type AnchorHTMLAttributes, type Ref } from 'react'

import { pedirLaSalidaDeLaVariante } from '../../_lib/escena/ruta/salidaDeLaVariante'
import { cubrirConElVelo } from '../../_lib/veloDeNavegacion'

import { calentarElDestino } from './calentar'

type PropsDelEnlace = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { readonly href: string; readonly ref?: Ref<HTMLAnchorElement> }

/** El defecto, para el control positivo del arnés (`window.__defectosDelVelo = 'sin-velo'`: navega sin cubrir); nunca la URL. */
const sinVelo = (): boolean => (window as Window & { __defectosDelVelo?: unknown }).__defectosDelVelo === 'sin-velo'

/**
 * [B12a.6] EL ENLACE ENTRE PÁGINAS DE `/v3` (plan §3.5 y §5; `docs/rediseno/B12a-API.md` §5) — el `<Link>` de next con el velo; nunca
 * `router.push` ni `TransitionContext`. Con un clic izquierdo sin modificadores pide la salida de la variante (P-H29d) y el velo y, con el
 * cuadro cubierto, deja pasar el clic al mismo `<Link>` (la navegación cliente: el lienzo y el chrome no se rehacen). El velo destapa la
 * página nueva (`_chrome/velo/VeloDeNavegacion.tsx`). Un ancla del documento (`#…`) es un `<a>` de siempre: la recorre el viaje del home.
 * Ctrl, Cmd, Shift, Alt, el botón del medio o un `target`: los del navegador.
 *
 * [B12a.8] Sin pantalla en blanco: el destino se PRECARGA (el `prefetch` del `<Link>`: la ruta entera apenas el enlace está a la vista, y
 * con el puntero encima o un toque el `<Link>` la adelanta) y, con el puntero o el foco, se calienta (las fuentes del título de una página,
 * `calentarElDestino`). Sin `useRouter`: el enlace también se renderiza fuera del router (la galería, los invariantes). La salida de la
 * variante y el velo van JUNTOS (los dos terminan antes de navegar: la banda cubre mientras la luz baja), así la pasada es una sola.
 */
export function EnlaceDeRuta({ href, ref, onClick, onPointerEnter, onFocus, children, ...resto }: PropsDelEnlace): React.JSX.Element {
  const dejarPasar = useRef(false)
  if (href.startsWith('#')) {
    return (
      <a ref={ref} href={href} onClick={onClick} onPointerEnter={onPointerEnter} onFocus={onFocus} {...resto}>
        {children}
      </a>
    )
  }
  const precargar = (): void => calentarElDestino(href)
  return (
    <Link
      ref={ref}
      href={href}
      scroll={false}
      prefetch
      onPointerEnter={(e) => {
        onPointerEnter?.(e)
        precargar()
      }}
      onFocus={(e) => {
        onFocus?.(e)
        precargar()
      }}
      onClick={(e) => {
        onClick?.(e)
        if (dejarPasar.current) {
          dejarPasar.current = false
          return
        }
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (resto.target !== undefined && resto.target !== '_self')) return
        e.preventDefault()
        const enlace = e.currentTarget
        precargar()
        void Promise.all([pedirLaSalidaDeLaVariante(), sinVelo() ? Promise.resolve() : cubrirConElVelo()]).then(() => {
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
