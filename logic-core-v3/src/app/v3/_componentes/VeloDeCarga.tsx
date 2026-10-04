'use client'

import { useCallback, useEffect, useState, useSyncExternalStore, type AnimationEvent } from 'react'

import { CARGA, abrirLaCarga, hayPrimerCuadro, suscribirALaCarga } from '../_lib/carga'
import { laEscenaCayo, suscribirALaCaida } from '../_lib/escena/caida'
import { TITULOS_DE_VOLUMEN, suscribirALosTitulos, useTituloListo } from '../_lib/titulos3d/registro'

/**
 * [AJUSTES FINALES] A4 · EL VELO DE CARGA — la página arranca toda blanca y todo aparece junto, con un fundido, cuando está
 * todo (el porqué y las cuatro reglas, en `_lib/carga.ts`). Viaja en el HTML del servidor (nada se ve antes de hidratar) y
 * no recibe el puntero: no bloquea el scroll ni un cuadro. Tres etapas, escritas en `data-velo` y resueltas en
 * `_estilos/carga.css`:
 *
 *   · `espera`     opaco; la hoja lleva el seguro sin JavaScript: a los `plazoMs` del arranque se funde sola;
 *   · `saliendo`   el fundido, ya (lo pide el hook cuando está todo, o al vencer el plazo si el DOM llegó antes);
 *   · (fuera)      terminado el fundido (`animationend`, el de la hoja: así dura lo que dura aunque el hilo esté ocupado)
 *                  se desmonta y se abre la carga: el titular del hero cae.
 *
 * Qué espera: las fuentes, el primer cuadro de la escena (o que la escena se haya caído) y, si el registro de los títulos
 * tiene anotado el titular del hero (desde 1024, con títulos de volumen), que sus dos registros estén armados y compilados.
 *
 * ⚠️ Si el DOM se entera DESPUÉS del plazo (una máquina lenta: hidratar tardó más de 4 s), la hoja ya está fundiendo el velo
 * sola: no se pasa a `saliendo` (reiniciaría el fundido desde opaco: un destello blanco, medido con CPU ×4), se la deja
 * terminar. Con movimiento reducido no hay fundido en espera (la política del sitio corta toda animación a 1 ms): el velo
 * queda opaco hasta que está todo y se va de golpe; sin JavaScript, `<noscript>` lo saca.
 */
export const IDS_DEL_TITULAR_DEL_HERO = ['hero-registro-1', 'hero-registro-2'] as const

type Etapa = 'espera' | 'saliendo' | 'fuera'

const sinCambios = (): (() => void) => () => undefined

/** Las fuentes del documento, cargadas. `false` en el servidor y al hidratar. */
function useFuentesListas(): boolean {
  const [listas, setListas] = useState(false)
  useEffect(() => {
    let vivo = true
    void document.fonts.ready.then(() => {
      if (vivo) setListas(true)
    })
    return () => {
      vivo = false
    }
  }, [])
  return listas
}

/** Vencido el plazo desde el arranque de la página (la misma cuenta que la hoja y que el respaldo 2D del titular). */
function usePlazoVencido(): boolean {
  const [vencido, setVencido] = useState(false)
  useEffect(() => {
    const reloj = window.setTimeout(() => setVencido(true), Math.max(0, CARGA.plazoMs - performance.now()))
    return () => window.clearTimeout(reloj)
  }, [])
  return vencido
}

export function VeloDeCarga(): React.JSX.Element | null {
  const [etapa, setEtapa] = useState<Etapa>('espera')
  const fuentes = useFuentesListas()
  const vencido = usePlazoVencido()
  const primerCuadro = useSyncExternalStore(suscribirALaCarga, hayPrimerCuadro, () => false)
  const caida = useSyncExternalStore(suscribirALaCaida, laEscenaCayo, () => false)
  // Si el titular del hero está anotado como título de volumen, se lo espera armado; si no (el teléfono, sin títulos), no.
  const conTitular = useSyncExternalStore(suscribirALosTitulos, () => TITULOS_DE_VOLUMEN.has(IDS_DEL_TITULAR_DEL_HERO[0]), () => false)
  const titular1 = useTituloListo(IDS_DEL_TITULAR_DEL_HERO[0])
  const titular2 = useTituloListo(IDS_DEL_TITULAR_DEL_HERO[1])
  const todo = fuentes && (primerCuadro || caida) && (!conTitular || (titular1 && titular2))

  // Terminado el fundido: afuera, y la carga se abre (el titular del hero cae recién ahora).
  const terminar = useCallback((): void => {
    abrirLaCarga()
    setEtapa('fuera')
  }, [])

  useEffect(() => {
    if (etapa !== 'espera' || !(todo || vencido)) return undefined
    const ya = performance.now()
    if (ya < CARGA.plazoMs) {
      setEtapa('saliendo')
      return undefined
    }
    // Vencido antes de que el DOM se enterara: la hoja ya lo funde sola (o ya lo fundió); si su fin no llega, igual se va.
    const reloj = window.setTimeout(terminar, Math.max(0, CARGA.plazoMs + CARGA.fundidoMs - ya) + CARGA.margenMs)
    return () => window.clearTimeout(reloj)
  }, [etapa, todo, vencido, terminar])

  // El seguro del fundido pedido: si el fin de la animación no llega (la hoja no cargó), igual se va.
  useEffect(() => {
    if (etapa !== 'saliendo') return undefined
    const reloj = window.setTimeout(terminar, CARGA.fundidoMs + CARGA.margenMs)
    return () => window.clearTimeout(reloj)
  }, [etapa, terminar])

  const alTerminarLaAnimacion = (e: AnimationEvent<HTMLDivElement>): void => {
    if (e.animationName.startsWith('velo-de-carga-sale')) terminar()
  }

  if (etapa === 'fuera') return null
  return (
    <>
      <noscript>
        <style>{`[data-v3] [data-pieza='velo-de-carga'] { display: none; }`}</style>
      </noscript>
      <div data-pieza="velo-de-carga" data-velo={etapa} aria-hidden="true" onAnimationEnd={alTerminarLaAnimacion} className="bg-fondo pointer-events-none fixed inset-0 z-[var(--z-overlay)]" />
    </>
  )
}
