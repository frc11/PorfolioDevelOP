'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { Button, Card, Field, Input, TextArea } from '@/components/ui'
import { cargarProspecto } from '@/app/(protected)/setter/_actions/prospecto.actions'
import { NuevoProspectoSchema } from '@/app/(protected)/setter/_actions/prospecto.schemas'

type FormState = {
  businessName: string
  contactName: string
  phone: string
  email: string
  industry: string
  zone: string
  instagramUrl: string
  currentWebUrl: string
  notes: string
}

const VACIO: FormState = {
  businessName: '',
  contactName: '',
  phone: '',
  email: '',
  industry: '',
  zone: '',
  instagramUrl: '',
  currentWebUrl: '',
  notes: '',
}

/** Normaliza para el cotejo del aviso de duplicado: sin acentos, sin caja, sin bordes. */
function normalizar(texto: string): string {
  return texto
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

type NuevoProspectoFormProps = {
  /**
   * Nombres de negocio que el setter YA tiene en su cartera (crudos, aislados por
   * dueño en el server). Solo para el aviso NO bloqueante de posible duplicado.
   */
  nombresExistentes: string[]
}

export function NuevoProspectoForm({ nombresExistentes }: NuevoProspectoFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(VACIO)
  const [errorNombre, setErrorNombre] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const existentesNorm = useMemo(
    () => nombresExistentes.map(normalizar),
    [nombresExistentes],
  )

  const set = <Campo extends keyof FormState>(campo: Campo, valor: string) => {
    setForm((actual) => ({ ...actual, [campo]: valor }))
    if (campo === 'businessName' && errorNombre) setErrorNombre(null)
  }

  // Aviso NO bloqueante: el setter ya tiene un lead con ese nombre. No frena el
  // alta — puede ser otra sucursal, un homónimo, o quererlo cargar igual.
  const posibleDuplicado = useMemo(() => {
    const nombre = normalizar(form.businessName)
    return nombre !== '' && existentesNorm.includes(nombre)
  }, [form.businessName, existentesNorm])

  const guardar = () => {
    setServerError(null)
    setErrorNombre(null)
    const parsed = NuevoProspectoSchema.safeParse(form)
    if (!parsed.success) {
      const nombreIssue = parsed.error.issues.find((issue) => issue.path[0] === 'businessName')
      if (nombreIssue) setErrorNombre(nombreIssue.message)
      const otroIssue = parsed.error.issues.find((issue) => issue.path[0] !== 'businessName')
      if (otroIssue) setServerError(otroIssue.message)
      return
    }
    startTransition(async () => {
      const result = await cargarProspecto(parsed.data)
      if (!result.success) {
        setServerError(result.error)
        toast.error(result.error)
        return
      }
      toast.success('Prospecto cargado — completá la ficha para arrancar')
      // Portal (no es el sitio público): navegación imperativa post-submit al
      // wizard del lead recién creado. No hay alternativa declarativa — el id sale
      // de la action.
      router.push(`/setter/leads/${result.data.id}`)
    })
  }

  return (
    <Card padding="lg" className="space-y-5">
      <Field
        label="Nombre del negocio"
        required
        error={errorNombre ?? undefined}
        hint="Lo mínimo para abrir la ficha. El resto lo completás ahora o después."
      >
        <Input
          value={form.businessName}
          onChange={(event) => set('businessName', event.target.value)}
          invalid={Boolean(errorNombre)}
          placeholder="Ej: Café de la Esquina"
          autoFocus
        />
      </Field>

      {posibleDuplicado && (
        <p className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-3 text-xs leading-relaxed text-amber-200/90">
          Ya tenés un lead con ese nombre en tu cartera. Podés cargarlo igual si es
          otro local o un contacto distinto.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Contacto" hint="Con quién hablás / quién atiende">
          <Input
            value={form.contactName}
            onChange={(event) => set('contactName', event.target.value)}
            placeholder="Ej: Marina (dueña)"
          />
        </Field>
        <Field label="Teléfono / WhatsApp">
          <Input
            value={form.phone}
            onChange={(event) => set('phone', event.target.value)}
            placeholder="Ej: 11 5555 5555"
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => set('email', event.target.value)}
            placeholder="Ej: hola@negocio.com"
          />
        </Field>
        <Field label="Rubro">
          <Input
            value={form.industry}
            onChange={(event) => set('industry', event.target.value)}
            placeholder="Ej: Gastronomía"
          />
        </Field>
        <Field label="Zona">
          <Input
            value={form.zone}
            onChange={(event) => set('zone', event.target.value)}
            placeholder="Ej: Palermo, CABA"
          />
        </Field>
        <Field label="Instagram">
          <Input
            value={form.instagramUrl}
            onChange={(event) => set('instagramUrl', event.target.value)}
            placeholder="https://instagram.com/…"
          />
        </Field>
        <Field label="Web actual">
          <Input
            value={form.currentWebUrl}
            onChange={(event) => set('currentWebUrl', event.target.value)}
            placeholder="https://…"
          />
        </Field>
      </div>

      <Field
        label="Notas"
        hint="Lo que sepas de entrada: de dónde salió, qué le pasa, por qué te interesa."
      >
        <TextArea
          value={form.notes}
          onChange={(event) => set('notes', event.target.value)}
          rows={3}
          placeholder="Ej: lo vi en IG, postean poco y no tienen web. Buen producto, mala vidriera digital."
        />
      </Field>

      {serverError && <p className="text-xs text-red-400">{serverError}</p>}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          onClick={guardar}
          loading={isPending}
          icon={<UserPlus size={15} strokeWidth={1.5} />}
        >
          Cargar prospecto
        </Button>
        <p className="text-[11px] text-zinc-600">
          Entra frío, en ficha — listo para que lo evalúes como cualquier otro.
        </p>
      </div>
    </Card>
  )
}
