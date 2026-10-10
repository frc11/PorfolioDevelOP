'use client'

import { motion } from 'motion/react'
import { useEffect, useRef, useState, type Ref, type RefCallback } from 'react'

import { cn } from '@/lib/utils'

import { RESULTADO, type TipoDeResultado } from '../../_lib/formularios/gracias'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { EncajeDelLogo, PROPORCION_DEL_ENCAJE } from './EncajeDelLogo'

/**
 * [PULIDO 11] B2 · B3 · LA TARJETA DEL RESULTADO de los dos formularios (el del pie y el panel de Contacto) — la cara de atrás de la
 * placa: ocupa la caja entera del formulario (`alto`: así el volteo comparte el eje con él) y es de tinta, con el encastre del logo
 * en el medio (`EncajeDelLogo`) y, cuando termina, el texto.
 *
 *   · `exito`: «Recibido. Te contestamos pronto.» (y, si se puede, «Enviar otro mensaje»).
 *   · `error`: «No se pudo enviar.», el error del envío y «Reintentar», que vuelve al formulario con TODO lo escrito; el foco va
 *     ahí cuando aparece. El rojo (`--rojo-del-error`, `resultado.css`) es el único color fuera del monocromo.
 *
 * La caja: exactamente el alto del formulario (`alto`); el lugar del encastre toma lo que sobra del texto y el logo se achica
 * para entrar (así la tarjeta nunca es más alta que el formulario y el volteo comparte el eje también en el teléfono).
 *
 * `empieza`: el encastre arranca cuando la tarjeta ya se ve (el que la monta lo sabe: en el DOM, al terminar de entrar; en el pie
 * de volumen, cuando la escena termina de voltear). En la placa 3D del pie (`enVolumen`) la tarjeta es transparente (la cara la
 * dibuja la escena) y no se mide para la placa (`data-sin-volumen`: la placa es lisa y se arma al toque).
 */
interface Props {
  readonly tipo: TipoDeResultado
  /** El error del envío (ya escrito para la persona). */
  readonly mensaje?: string
  readonly alto?: number
  readonly empieza: boolean
  readonly enVolumen?: boolean
  readonly compacto?: boolean
  readonly foco?: Ref<HTMLDivElement>
  readonly alReintentar?: () => void
  readonly alOtro?: () => void
  /** El texto ya está (el panel cuenta desde acá para cerrarse solo). */
  readonly alTerminar?: () => void
}

/** Una ref de afuera (función u objeto) y la propia, en el mismo elemento. */
function lasDos(de: Ref<HTMLDivElement> | undefined, propia: { current: HTMLDivElement | null }): RefCallback<HTMLDivElement> {
  return (el) => {
    propia.current = el
    if (typeof de === 'function') de(el)
    else if (de !== null && de !== undefined) de.current = el
  }
}

export function TarjetaDeResultado({ tipo, mensaje, alto, empieza, enVolumen = false, compacto = false, foco, alReintentar, alOtro, alTerminar }: Props): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const [listo, setListo] = useState(false)
  const raiz = useRef<HTMLDivElement | null>(null)
  const reintentar = useRef<HTMLButtonElement>(null)
  const avisar = useRef(alTerminar)
  useEffect(() => {
    avisar.current = alTerminar
  })
  useEffect(() => {
    if (!listo) return
    // Reintentar toma el foco sólo si sigue en la tarjeta (si la persona ya se fue a otra parte, no se lo saca).
    if (tipo === 'error' && raiz.current !== null && raiz.current.contains(document.activeElement)) reintentar.current?.focus({ preventScroll: true })
    avisar.current?.()
  }, [listo, tipo])
  const exito = tipo === 'exito'
  return (
    <div
      ref={lasDos(foco, raiz)}
      tabIndex={-1}
      data-tarjeta="resultado"
      data-resultado={tipo}
      data-sin-volumen=""
      className={cn(
        'flex w-full flex-col items-center justify-center text-center text-[var(--resultado-tinta)]',
        compacto ? 'gap-[var(--spacing-4)] px-[var(--spacing-4)] py-[var(--spacing-6)]' : 'gap-[var(--spacing-6)] px-[var(--spacing-6)] py-[var(--spacing-8)]',
        enVolumen ? 'bg-transparent' : 'rounded-[var(--radius-medio)] bg-[var(--resultado-fondo)]',
      )}
      style={alto === undefined ? undefined : { height: alto }}
    >
      {/* El encastre: toma el alto que sobra (con un mínimo) y el logo entra en él; arriba le queda lugar a la pieza para caer (la
          vista no recorta). */}
      <div className={cn('flex min-h-[calc(var(--spacing-20)*1.1)] w-full flex-1 items-center justify-center', compacto ? 'pt-[var(--spacing-6)]' : 'pt-[var(--spacing-12)]')}>
        <div className={cn('h-full w-full', compacto ? 'max-w-[calc(var(--spacing-20)*1.6)]' : 'max-w-[calc(var(--spacing-20)*2.2)]')} style={{ maxHeight: `calc(var(--spacing-20) * ${String(compacto ? 1.6 : 2.2)} / ${PROPORCION_DEL_ENCAJE.toFixed(4)})` }}>
          <EncajeDelLogo resultado={exito ? 'encaja' : 'no-encaja'} empieza={empieza} quieto={reducido} alTerminar={() => setListo(true)} />
        </div>
      </div>
      <motion.div className="flex flex-col items-center gap-[var(--spacing-2)]" initial={false} animate={listo ? { opacity: 1, y: 0 } : { opacity: 0, y: reducido ? 0 : 8 }} transition={{ duration: reducido ? 0 : 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <p className={cn('font-display font-fuerte tracking-display leading-titulo uppercase', compacto ? 'text-fluido-titulo-s' : 'text-fluido-titulo-m', !exito && 'text-[var(--texto-del-error)]')}>{exito ? RESULTADO.exito.titulo : RESULTADO.error.titulo}</p>
        <p className="text-cuerpo leading-texto max-w-[42ch]">{exito ? RESULTADO.exito.bajada : mensaje}</p>
        {!exito && alReintentar !== undefined && (
          <button ref={reintentar} type="button" tabIndex={listo ? 0 : -1} onClick={alReintentar} className="mt-[var(--spacing-3)] rounded-[var(--radius-pastilla-s)] border border-current px-[var(--spacing-5)] py-[var(--spacing-2)] text-cuerpo font-semi transition-colors hover:bg-[var(--resultado-tinta)] hover:text-[var(--resultado-fondo-solido)] focus-visible:bg-[var(--resultado-tinta)] focus-visible:text-[var(--resultado-fondo-solido)]">
            {RESULTADO.reintentar}
          </button>
        )}
        {exito && alOtro !== undefined && (
          <button type="button" tabIndex={listo ? 0 : -1} onClick={alOtro} className="mt-[var(--spacing-1)] px-[var(--spacing-2)] py-[var(--spacing-2)] text-micro leading-micro tracking-micro font-semi underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:decoration-2">
            {RESULTADO.otro}
          </button>
        )}
      </motion.div>
    </div>
  )
}
