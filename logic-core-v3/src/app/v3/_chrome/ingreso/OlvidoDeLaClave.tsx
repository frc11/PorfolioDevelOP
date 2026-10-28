'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Carga, conDuracionMinima } from '../../_componentes/carga/Carga'
import { Cta } from '../../_componentes/chrome/Cta'
import { CampoDePildora, ErrorDelCampo } from '../../_componentes/formularios/Campos'
import { EXPLICACION_DEL_OLVIDO, OLVIDO_ENVIADO, ROTULOS_DEL_INGRESO } from './contenido'
import { LARGOS_DEL_INGRESO, REPOSO, errorDelEmail, resolverElIngreso, type AccionesDelIngreso, type Resultado } from './envio'

/**
 * [L6 · ítem 80] «¿OLVIDASTE TU CONTRASEÑA?», EN LA HOJA DEL LOGIN — la página de siempre (`/forgot-password`) era el login viejo; ahora
 * es otra vista de la misma hoja (la estética de hoy: la píldora, el error en el campo, la carga de develOP) y no se sale del login
 * nuevo. La lógica es la de siempre (`forgotPasswordAction`, cableada en `acciones.ts`): pide el email y, sea cual sea la respuesta del
 * servidor, el aviso es el mismo (no revela si la cuenta existe).
 */

const ENLACE = 'underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:decoration-2'

export function OlvidoDeLaClave({
  acciones,
  alVolver,
  alOcupar,
}: {
  readonly acciones: AccionesDelIngreso
  readonly alVolver: () => void
  readonly alOcupar?: (ocupado: boolean) => void
}): React.JSX.Element {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [intento, setIntento] = useState(false)
  const carga = useRef<HTMLDivElement>(null)
  const [resultado, enviar, enviando] = useActionState(
    async (_previo: Resultado, envio: FormData): Promise<Resultado> => resolverElIngreso(() => conDuracionMinima(acciones.conOlvido(null, envio)), () => undefined),
    REPOSO,
  )
  const raiz = useRef<HTMLDivElement>(null)
  // Al abrir la vista el foco va al email (con mouse; en un táctil abriría el teclado encima de todo).
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) raiz.current?.querySelector<HTMLElement>('input[name="email"]')?.focus({ preventScroll: true })
  }, [])
  useEffect(() => {
    alOcupar?.(enviando)
    return () => alOcupar?.(false)
  }, [enviando, alOcupar])

  const volver = (
    <button type="button" data-parte="volver-al-ingreso" onClick={alVolver} className={cn('text-caption text-tinta-media inline-block py-[var(--spacing-2)]', ENLACE)}>
      {ROTULOS_DEL_INGRESO.volverAlIngreso}
    </button>
  )

  if (resultado.estado === 'link-enviado') {
    return (
      <div className="flex flex-col gap-[var(--spacing-4)]">
        <div
          ref={(el) => el?.focus({ preventScroll: true })}
          tabIndex={-1}
          role="status"
          data-parte="olvido-enviado"
          className="border-borde-fuerte flex flex-col gap-[var(--spacing-2)] rounded-[var(--radius-fuerte)] border p-[var(--spacing-5)] outline-none"
        >
          <p className="text-cuerpo font-medio leading-texto">{OLVIDO_ENVIADO.titulo}</p>
          <p className="text-caption text-tinta-media leading-texto">{OLVIDO_ENVIADO.texto}</p>
        </div>
        <div>{volver}</div>
      </div>
    )
  }

  const alEnviar = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (enviando) return
    const form = e.currentTarget
    const nuevo = errorDelEmail(email)
    setIntento(true)
    setError(nuevo)
    if (nuevo !== undefined) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    const envio = new FormData(form)
    startTransition(() => enviar(envio))
    requestAnimationFrame(() => carga.current?.focus({ preventScroll: true }))
  }

  return (
    <div ref={raiz} className="relative">
      <form noValidate onSubmit={alEnviar} inert={enviando} data-pieza="ingreso-olvido" className={cn('flex flex-col gap-[var(--spacing-3)]', enviando && 'invisible')}>
        <p className="text-caption text-tinta-media leading-texto">{EXPLICACION_DEL_OLVIDO}</p>
        <div className="flex flex-col gap-[var(--spacing-1)]">
          <CampoDePildora
            rotulo={ROTULOS_DEL_INGRESO.email}
            nombre="email"
            id="ingreso-olvido-email"
            valor={email}
            alEscribir={(v) => {
              setEmail(v)
              if (intento) setError(errorDelEmail(v))
            }}
            ejemplo=""
            maximo={LARGOS_DEL_INGRESO.email}
            idDelError="ingreso-error-olvido"
            conError={error !== undefined}
            requerido
            autocompletar="email"
            modoDeEntrada="email"
          />
          <ErrorDelCampo id="ingreso-error-olvido" texto={error} />
        </div>
        <div role="alert" data-parte="error-del-ingreso" className={cn((resultado.estado !== 'error' || resultado.mensaje === '') && 'sr-only')}>
          <ErrorDelCampo id="ingreso-error-servidor-olvido" texto={resultado.estado === 'error' ? resultado.mensaje : ''} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-[var(--spacing-3)] pt-[var(--spacing-2)]">
          {volver}
          <Cta type="submit" rotulo={enviando ? ROTULOS_DEL_INGRESO.enviandoOlvido : ROTULOS_DEL_INGRESO.enviarOlvido} deshabilitado={enviando} className="shrink-0" />
        </div>
      </form>
      {enviando && (
        <div ref={carga} tabIndex={-1} data-parte="carga" className="absolute inset-0 flex items-center justify-center">
          <Carga tamano="medio" etiqueta={ROTULOS_DEL_INGRESO.enviandoOlvido} />
        </div>
      )}
    </div>
  )
}
