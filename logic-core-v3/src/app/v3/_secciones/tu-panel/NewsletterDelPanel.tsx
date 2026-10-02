'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { enviarAlServidor } from '../../_lib/formularios/enviar'
import { validarElMail } from '../../_lib/formularios/validar'
import { NEWSLETTER } from './contenido'

/**
 * [RONDA 2] F1 · EL NEWSLETTER DE TU PANEL, QUE ENVÍA — el mismo marcado que `FormularioDeNovedades` (compartido: la
 * galería de componentes lo sigue usando sin envío), así toma sus mismos estilos, con un envío de verdad a
 * `/api/newsletter`: validación al enviar (y mientras se corrige), el botón ocupado mientras viaja, y el resultado en una
 * región viva (el error, al lado del campo; el «listo», en su lugar). Sin carteles de «todavía no envía».
 */
type Estado = { readonly fase: 'quieto' | 'enviando' | 'listo' } | { readonly fase: 'error'; readonly mensaje: string }

export function NewsletterDelPanel(): React.JSX.Element {
  const [mail, setMail] = useState('')
  const [estado, setEstado] = useState<Estado>({ fase: 'quieto' })
  const [intento, setIntento] = useState(false)
  const errorDelCampo = intento ? validarElMail(mail) : null
  const idDelCampo = `${NEWSLETTER.id}-campo`
  const idDelAviso = `${NEWSLETTER.id}-aviso`
  const enviando = estado.fase === 'enviando'

  const alEnviar = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIntento(true)
    if (validarElMail(mail) !== null || enviando) return
    setEstado({ fase: 'enviando' })
    const r = await enviarAlServidor('/api/newsletter', { mail: mail.trim() })
    if (r.ok) {
      setEstado({ fase: 'listo' })
      setMail('')
      setIntento(false)
    } else setEstado({ fase: 'error', mensaje: r.error })
  }

  const error = errorDelCampo ?? (estado.fase === 'error' ? estado.mensaje : '')
  return (
    <form data-pieza="novedades-forma" noValidate onSubmit={(e) => void alEnviar(e)} className="flex flex-col gap-[var(--spacing-2)]">
      <label htmlFor={idDelCampo} className="text-micro leading-micro tracking-micro font-medio uppercase">
        {NEWSLETTER.rotulo}
      </label>
      <div data-pieza="novedades">
        <input
          id={idDelCampo}
          type="email"
          name="correo"
          autoComplete="email"
          placeholder={NEWSLETTER.placeholder}
          value={mail}
          onChange={(e) => {
            setMail(e.target.value)
            if (estado.fase !== 'enviando') setEstado({ fase: 'quieto' })
          }}
          aria-invalid={errorDelCampo !== null || undefined}
          aria-describedby={idDelAviso}
          data-parte="campo"
          className="text-caption leading-texto tracking-texto font-normal"
        />
        <button type="submit" data-pieza="novedades-envio" disabled={enviando} aria-busy={enviando || undefined} aria-label={NEWSLETTER.rotuloDeEnvio}>
          <span data-parte="icono" aria-hidden="true">
            {enviando ? <Loader2 className="size-[var(--spacing-4)] animate-spin motion-reduce:animate-none" strokeWidth={1.5} /> : <ArrowRight className="size-[var(--spacing-4)]" strokeWidth={1.5} />}
          </span>
        </button>
      </div>
      {/* Las dos regiones vivas existen desde el principio (una que nace con su texto no siempre se anuncia). */}
      <p id={idDelAviso} role="alert" className={cn('text-micro leading-micro tracking-micro', error === '' && 'sr-only')}>
        {error}
      </p>
      <p role="status" className="text-micro leading-micro tracking-micro empty:hidden">
        {estado.fase === 'listo' ? NEWSLETTER.listo : ''}
      </p>
    </form>
  )
}
