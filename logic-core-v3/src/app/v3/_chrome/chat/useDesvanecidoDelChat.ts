'use client'

import { useEffect, useState, type RefObject } from 'react'

import { LINEA_DEL_CHAT, ZONAS_SIN_CHAT, chatDesvanecido } from './compuerta'

/** La ventana del widget abierta (su marca, la del sitio vivo: se lee, no se toca). */
const SELECTOR_DE_LA_VENTANA = '[data-chatbot-window]'

/**
 * [C2-21] ¿EL CHAT SE DESVANECE? (ítem 24) — con una zona crucial en la línea del chat (`ZONAS_SIN_CHAT`, `LINEA_DEL_CHAT`) y la ventana
 * cerrada. Las zonas se vuelven a tomar en cada ruta (las páginas no las tienen: ahí no se desvanece); la ventana se mira en el DOM del
 * widget (un observador de mutaciones sobre la capa que lo envuelve).
 */
export function useDesvanecidoDelChat(capa: RefObject<HTMLElement | null>, ruta: string | null, montado: boolean): boolean {
  const [zona, setZona] = useState<{ readonly ruta: string | null; readonly adentro: boolean }>({ ruta: null, adentro: false })
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!montado) return undefined
    const zonas = ZONAS_SIN_CHAT.map((id) => document.querySelector(`[data-panel="${id}"]`)).filter((z): z is Element => z !== null)
    const cruzando = new Set<Element>()
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) cruzando.add(e.target)
          else cruzando.delete(e.target)
        }
        setZona({ ruta, adentro: cruzando.size > 0 })
      },
      { rootMargin: LINEA_DEL_CHAT },
    )
    zonas.forEach((z) => observador.observe(z))
    return () => observador.disconnect()
  }, [ruta, montado])

  useEffect(() => {
    const el = capa.current
    if (!montado || el === null) return undefined
    const mirar = (): void => setAbierto(el.querySelector(SELECTOR_DE_LA_VENTANA) !== null)
    const observador = new MutationObserver(mirar)
    // El widget se monta cerrado: desde ahí, cada cambio de su DOM.
    observador.observe(el, { childList: true, subtree: true })
    return () => observador.disconnect()
  }, [capa, montado])

  return chatDesvanecido(zona.ruta === ruta && zona.adentro, abierto)
}
