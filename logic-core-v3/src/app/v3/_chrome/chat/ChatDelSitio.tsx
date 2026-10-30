'use client'

import { usePathname } from 'next/navigation'
import { Suspense, lazy, useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { prefetchBotConfig } from '@/modules/chatbot/shared/configCache'

import { cargaLista, escenaPreparada, suscribirALaCarga } from '../../_lib/carga'
import { entradaAbierta, suscribirALaEntrada } from '../../_lib/entrada'
import { laEscenaCayo, suscribirALaCaida } from '../../_lib/escena/caida'
import { CLAVE_DE_LOS_BANCOS } from '../preloader/decision'
import { APARIENCIA_DEL_CHAT, ESPERA_OCIOSA_MS, PLAZO_DEL_CHAT_MS, SLUG_DEL_CHAT, chatPermitido, montarElChat, puedeEntrarElChat, rutaConChat } from './compuerta'
import { useTonoDebajo } from '../menu/useTonoDebajo'
import { useDesvanecidoDelChat } from './useDesvanecidoDelChat'

/**
 * [B11] EL CHAT DEL SITIO — el widget del sitio vivo, abajo a la derecha, en el home y en las páginas de /v3 (lo monta el chrome del
 * layout: no se vuelve a montar entre rutas). Las reglas, en `compuerta.ts`; acá el cableado:
 *
 *   · **Diferido:** el módulo del widget es perezoso (`lazy`): no viaja en la carga de /v3; se pide con la compuerta abierta, en un
 *     momento ocioso, junto con la config del bot (la caché del widget: la misma promesa que después usa él). Sin config, no se monta.
 *   · **En el servidor no emite nada** (y antes de la compuerta tampoco): ni una caja ni una parada de tabulación en el HTML.
 *   · **Debajo de lo que tapa la página:** el widget trae sus capas propias (enteros cerca del máximo, para pisar cualquier sitio que lo
 *     embeba). Acá van ENCERRADAS en un contexto de apilado al alto del chrome (`--z-cabecera`, el de la barra y el parlante): encima de
 *     la página y del velo de la navegación, debajo de lo que la tapa entera (el login, el contacto, el menú del teléfono, la ventana de
 *     una demo, el velo de carga y el preloader, todos en `--z-overlay` o más). El envoltorio es `fixed` y sin tamaño: no suma alto.
 */
const cargarElChat = () => import('@/modules/chatbot/components/LogicCompanion')
const LogicCompanion = lazy(() => cargarElChat().then((m) => ({ default: m.LogicCompanion })))

type VentanaDelChat = Window & { __chatDelBanco?: unknown }

const sinCambios = (): (() => void) => () => undefined

function permitidoEnLaVentana(): boolean {
  let siembra = false
  try {
    siembra = window.sessionStorage.getItem(CLAVE_DE_LOS_BANCOS) === '1'
  } catch {
    siembra = false
  }
  return chatPermitido({ automatizado: window.navigator.webdriver === true, siembra, pedidoPorElBanco: (window as VentanaDelChat).__chatDelBanco === true })
}

/** El plazo de la escena se cumplió (lo marca el reloj de la suscripción: así la lectura no cambia sin aviso). */
let plazoCumplido = false

/** La compuerta, leída ahora (el velo de carga sigue mientras está en el DOM y la carga no se abrió). */
function compuertaAbierta(): boolean {
  return puedeEntrarElChat({
    entradaAbierta: entradaAbierta(),
    veloDeCarga: !cargaLista() && document.querySelector('[data-pieza="velo-de-carga"]') !== null,
    escenaLista: escenaPreparada() || laEscenaCayo(),
    vencido: plazoCumplido,
  })
}

function suscribirALaCompuerta(avisar: () => void): () => void {
  const quitar = [suscribirALaEntrada(avisar), suscribirALaCarga(avisar), suscribirALaCaida(avisar)]
  const plazo = window.setTimeout(() => {
    plazoCumplido = true
    avisar()
  }, Math.max(0, PLAZO_DEL_CHAT_MS - performance.now()))
  return () => {
    window.clearTimeout(plazo)
    for (const q of quitar) q()
  }
}

function cuandoEsteOcioso(f: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(f, { timeout: ESPERA_OCIOSA_MS })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(f, 200)
  return () => window.clearTimeout(id)
}

export function ChatDelSitio(): React.JSX.Element | null {
  const ruta = usePathname()
  const permitido = useSyncExternalStore(sinCambios, permitidoEnLaVentana, () => false)
  const compuerta = useSyncExternalStore(suscribirALaCompuerta, compuertaAbierta, () => false)
  const [config, setConfig] = useState<'esperando' | 'lista' | 'sin'>('esperando')
  const conChat = rutaConChat(ruta)

  // La compuerta abierta (y en una ruta con chat): en un momento ocioso, el módulo y la config, juntos. Una vez por documento.
  useEffect(() => {
    if (!permitido || !conChat || !compuerta || config !== 'esperando') return undefined
    let vivo = true
    const cancelar = cuandoEsteOcioso(() => {
      void Promise.all([cargarElChat(), prefetchBotConfig(SLUG_DEL_CHAT)])
        .then(([, c]) => {
          if (vivo) setConfig(c === null ? 'sin' : 'lista')
        })
        .catch(() => {
          if (vivo) setConfig('sin')
        })
    })
    return () => {
      vivo = false
      cancelar()
    }
  }, [permitido, conChat, compuerta, config])

  const montado = montarElChat({ permitido, ruta, compuerta, config })
  // [C2-21] En las zonas cruciales (el Portfolio, Servicios), cerrado, se desvanece y no se alcanza (`inert`); abierto, se queda.
  const capa = useRef<HTMLDivElement | null>(null)
  const desvanecido = useDesvanecidoDelChat(capa, ruta, montado)
  // [L9a] El avatar se da vuelta según lo que tiene abajo (blanco sobre la noche, negro sobre el papel): `piezas.css` bloque 5.
  const sonda = useRef<HTMLSpanElement | null>(null)
  const tono = useTonoDebajo(sonda, montado)

  if (!montado) return null
  return (
    <div data-pieza="chat-del-sitio" className="fixed z-[var(--z-cabecera)]" data-tono={tono}>
      {/* La sonda marca dónde está la burbuja (abajo a la derecha, 56 px a 24 px de los bordes): el tono se lee bajo su centro. */}
      <span ref={sonda} aria-hidden="true" className="pointer-events-none fixed right-6 bottom-6 size-14" />
      <div
        ref={capa}
        data-parte="desvanecido"
        data-desvanecido={desvanecido ? '' : undefined}
        inert={desvanecido}
        className="transition-opacity duration-[var(--duracion-lenta)] ease-[var(--ease-principal)] motion-reduce:transition-none data-desvanecido:opacity-0"
      >
        <Suspense fallback={null}>
          <LogicCompanion slug={SLUG_DEL_CHAT} overrides={APARIENCIA_DEL_CHAT} />
        </Suspense>
      </div>
    </div>
  )
}
