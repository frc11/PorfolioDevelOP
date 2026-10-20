'use client'

import Link from 'next/link'
import { useRef, type MouseEvent, type ReactNode } from 'react'

import { pedirLaSalidaDeLaVariante } from '../_lib/escena/ruta/salidaDeLaVariante'

/**
 * ⚠️ INSTRUMENTO. [B12a.3] El enlace de la página de prueba que pide la salida de la variante (P-H29d) antes de navegar: espera la
 * señal y recién entonces deja pasar el clic al `<Link>` (el mismo enlace, apretado de nuevo: nunca `router.push`). Interino hasta la
 * navegación de B12a.6 (`EnlaceDeRuta`, con el velo), que pide la señal antes del velo; se va con la página de prueba.
 */
export function EnlaceConLaSalida({ href, children, className }: { readonly href: string; readonly children: ReactNode; readonly className?: string }): React.JSX.Element {
  const dejarPasar = useRef(false)
  const alClic = (e: MouseEvent<HTMLAnchorElement>): void => {
    if (dejarPasar.current) {
      dejarPasar.current = false
      return
    }
    // Abrir en otra pestaña o ventana no se lleva la página: no hay salida.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const enlace = e.currentTarget
    void pedirLaSalidaDeLaVariante().then(() => {
      dejarPasar.current = true
      enlace.click()
    })
  }
  return (
    <Link href={href} className={className} onClick={alClic}>
      {children}
    </Link>
  )
}
