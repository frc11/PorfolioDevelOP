'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Megaphone } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import {
  ANNOUNCEMENT_BODY_MAX,
  CreateAnnouncementSchema,
} from '../_actions/announcements.schemas'
import { createAnnouncementAction } from '../_actions/announcements.actions'

type PublisherState = {
  title: string
  body: string
  audience: 'ALL' | 'ORG'
  organizationId: string
  expiresOn: string
}

type FieldErrors = Partial<Record<keyof PublisherState, string>>

const INITIAL: PublisherState = {
  title: '',
  body: '',
  audience: 'ALL',
  organizationId: '',
  expiresOn: '',
}

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35'

export function AnnouncementPublisher({
  organizations,
}: {
  organizations: Array<{ id: string; companyName: string }>
}) {
  const router = useRouter()
  const [state, setState] = useState<PublisherState>(INITIAL)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [isPending, startTransition] = useTransition()

  const update = <F extends keyof PublisherState>(field: F, value: PublisherState[F]) => {
    setState((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setServerError(null)
    setOk(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)
    setOk(false)

    const payload = {
      title: state.title,
      body: state.body,
      audience: state.audience,
      organizationId: state.audience === 'ORG' ? state.organizationId || null : null,
      expiresOn: state.expiresOn,
    }

    const parsed = CreateAnnouncementSchema.safeParse(payload)
    if (!parsed.success) {
      const collected: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') collected[field as keyof PublisherState] = issue.message
      }
      setErrors(collected)
      return
    }

    startTransition(async () => {
      const result = await createAnnouncementAction(parsed.data)
      if (!result.success) {
        setServerError(result.error)
        return
      }
      setState(INITIAL)
      setErrors({})
      setOk(true)
      router.refresh()
    })
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-2.5">
        <Megaphone size={18} strokeWidth={1.5} className="text-violet-400" />
        <h2 className="text-base font-semibold text-white">Publicar novedad</h2>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Se anuncia en el panel del cliente. Elegí si la ven todos o una sola organización.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200">Título</label>
          <Input
            value={state.title}
            onChange={(event) => update('title', event.target.value)}
            className={inputClassName}
            placeholder="Nuevo: ahora ves de dónde vienen tus leads"
          />
          {errors.title ? <p className="mt-2 text-xs text-rose-300">{errors.title}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200">Cuerpo</label>
          <textarea
            value={state.body}
            onChange={(event) => update('body', event.target.value)}
            maxLength={ANNOUNCEMENT_BODY_MAX}
            className={`${inputClassName} min-h-28 resize-none`}
            placeholder="Contale al cliente qué cambió y por qué le sirve, en lenguaje simple."
          />
          {errors.body ? <p className="mt-2 text-xs text-rose-300">{errors.body}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Alcance</label>
            <Select
              value={state.audience}
              onChange={(event) => update('audience', event.target.value as PublisherState['audience'])}
              className={inputClassName}
            >
              <option value="ALL">Todos los clientes</option>
              <option value="ORG">Una organización</option>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">
              Caduca el <span className="text-zinc-500">(opcional)</span>
            </label>
            <Input
              type="date"
              value={state.expiresOn}
              onChange={(event) => update('expiresOn', event.target.value)}
              className={inputClassName}
            />
            {errors.expiresOn ? (
              <p className="mt-2 text-xs text-rose-300">{errors.expiresOn}</p>
            ) : (
              <p className="mt-2 text-xs text-zinc-600">Sin fecha = no caduca.</p>
            )}
          </div>
        </div>

        {state.audience === 'ORG' ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Organización</label>
            <Select
              value={state.organizationId}
              onChange={(event) => update('organizationId', event.target.value)}
              className={inputClassName}
            >
              <option value="">Elegí una organización</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.companyName}
                </option>
              ))}
            </Select>
            {errors.organizationId ? (
              <p className="mt-2 text-xs text-rose-300">{errors.organizationId}</p>
            ) : null}
          </div>
        ) : null}

        {serverError ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {serverError}
          </div>
        ) : null}
        {ok ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Novedad publicada. Ya aparece en el panel de los clientes alcanzados.
          </div>
        ) : null}

        <div className="flex justify-end border-t border-white/10 pt-4">
          <Button
            type="submit"
            loading={isPending}
            className="border border-violet-400/20 bg-violet-400/10 text-violet-100 hover:bg-violet-400/15"
          >
            <span>{isPending ? 'Publicando...' : 'Publicar novedad'}</span>
          </Button>
        </div>
      </form>
    </section>
  )
}
