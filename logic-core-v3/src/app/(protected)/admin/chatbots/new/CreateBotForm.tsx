'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Link2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createBotAction } from './actions'

interface OrgAvailable {
  id: string
  companyName: string
  slug: string
}

interface Props {
  orgsAvailable: OrgAvailable[]
  /** Org a preseleccionar (llega por ?organizationId= en la URL). Se valida contra
   *  orgsAvailable; si no está disponible, cae al default (primera org sin bot). */
  preselectedOrgId?: string
}

const INDUSTRIES = [
  { value: 'legal', label: 'Legal' },
  { value: 'contable', label: 'Contable' },
  { value: 'medico_odontologico', label: 'Médico / Odontológico' },
  { value: 'gimnasio', label: 'Gimnasio / Fitness' },
  { value: 'restaurant', label: 'Restaurant / Gastronomía' },
  { value: 'inmobiliaria', label: 'Inmobiliaria' },
  { value: 'concesionaria', label: 'Concesionaria' },
  { value: 'distribuidora', label: 'Distribuidora' },
  { value: 'constructora', label: 'Constructora' },
  { value: 'generico', label: 'Otro / Genérico' },
]

export function CreateBotForm({ orgsAvailable, preselectedOrgId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mode, setMode] = useState<'existing_org' | 'new_org'>(
    orgsAvailable.length > 0 ? 'existing_org' : 'new_org',
  )

  const initialOrgId =
    (preselectedOrgId && orgsAvailable.some((o) => o.id === preselectedOrgId)
      ? preselectedOrgId
      : orgsAvailable[0]?.id) ?? ''

  const [existingData, setExistingData] = useState({
    organizationId: initialOrgId,
    botName: '',
    industry: 'medico_odontologico',
    accentColor: '#06b6d4',
    whatsappNumber: '',
  })

  const [newOrgData, setNewOrgData] = useState({
    organizationName: '',
    userEmail: '',
    userName: '',
    industry: 'medico_odontologico',
    city: '',
    whatsappNumber: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createBotAction(
        mode === 'existing_org'
          ? { mode: 'existing_org', ...existingData }
          : { mode: 'new_org', ...newOrgData },
      )
      if (result.ok) {
        toast.success('Chatbot creado')
        router.push(`/admin/chatbots/${result.botId}`)
      } else {
        toast.error(`Error: ${result.error}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selector de modo */}
      <Card padding="md">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-3">
          ¿Para quién es el chatbot?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('existing_org')}
            disabled={orgsAvailable.length === 0}
            className={[
              'text-left rounded-2xl border p-4 transition-all',
              mode === 'existing_org'
                ? 'border-cyan-400/40 bg-cyan-400/10'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]',
              orgsAvailable.length === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <Link2
              className={`h-5 w-5 mb-2 ${mode === 'existing_org' ? 'text-cyan-300' : 'text-zinc-400'}`}
              strokeWidth={1.5}
            />
            <p
              className={`text-sm font-medium ${mode === 'existing_org' ? 'text-cyan-300' : 'text-zinc-300'}`}
            >
              Para una organización existente
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {orgsAvailable.length > 0
                ? `${orgsAvailable.length} sin bot todavía`
                : 'Todas las orgs ya tienen bot'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode('new_org')}
            className={[
              'text-left rounded-2xl border p-4 transition-all cursor-pointer',
              mode === 'new_org'
                ? 'border-cyan-400/40 bg-cyan-400/10'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]',
            ].join(' ')}
          >
            <Plus
              className={`h-5 w-5 mb-2 ${mode === 'new_org' ? 'text-cyan-300' : 'text-zinc-400'}`}
              strokeWidth={1.5}
            />
            <p
              className={`text-sm font-medium ${mode === 'new_org' ? 'text-cyan-300' : 'text-zinc-300'}`}
            >
              Crear org + bot de cero
            </p>
            <p className="text-xs text-zinc-500 mt-1">Onboarding completo</p>
          </button>
        </div>
      </Card>

      {/* Campos según modo */}
      <AnimatePresence mode="wait">
        {mode === 'existing_org' ? (
          <motion.div
            key="existing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card padding="lg" className="space-y-4">
              <Field label="Organización" required>
                <Select
                  value={existingData.organizationId}
                  onChange={(e) =>
                    setExistingData((prev) => ({ ...prev, organizationId: e.target.value }))
                  }
                  options={orgsAvailable.map((o) => ({ value: o.id, label: o.companyName }))}
                />
              </Field>

              <Field label="Nombre del bot" hint="El que ve el cliente final" required>
                <Input
                  value={existingData.botName}
                  onChange={(e) =>
                    setExistingData((prev) => ({ ...prev, botName: e.target.value }))
                  }
                  placeholder="Ej: Lucia, Asistente Virtual"
                />
              </Field>

              <Field label="Industria" required>
                <Select
                  value={existingData.industry}
                  onChange={(e) =>
                    setExistingData((prev) => ({ ...prev, industry: e.target.value }))
                  }
                  options={INDUSTRIES}
                />
              </Field>

              <Field label="Color de acento" hint="Default: cyan develOP">
                <input
                  type="color"
                  value={existingData.accentColor}
                  onChange={(e) =>
                    setExistingData((prev) => ({ ...prev, accentColor: e.target.value }))
                  }
                  className="h-10 w-20 rounded-lg cursor-pointer bg-transparent border border-white/10"
                />
              </Field>

              <Field label="WhatsApp" hint="Con código país, ej: 5493814111111">
                <Input
                  value={existingData.whatsappNumber}
                  onChange={(e) =>
                    setExistingData((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                  }
                  placeholder="549..."
                />
              </Field>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card padding="lg" className="space-y-4">
              <p className="text-xs text-zinc-500">
                Crea organización + bot + usuario primario y envía email automático.
              </p>

              <Field label="Nombre de la organización" required>
                <Input
                  value={newOrgData.organizationName}
                  onChange={(e) =>
                    setNewOrgData((prev) => ({ ...prev, organizationName: e.target.value }))
                  }
                  placeholder="Ej: Clínica San Miguel"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email del cliente" required>
                  <Input
                    type="email"
                    value={newOrgData.userEmail}
                    onChange={(e) =>
                      setNewOrgData((prev) => ({ ...prev, userEmail: e.target.value }))
                    }
                    placeholder="hola@cliente.com"
                  />
                </Field>

                <Field label="Nombre del cliente" required>
                  <Input
                    value={newOrgData.userName}
                    onChange={(e) =>
                      setNewOrgData((prev) => ({ ...prev, userName: e.target.value }))
                    }
                    placeholder="María Pereyra"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Industria" required>
                  <Select
                    value={newOrgData.industry}
                    onChange={(e) =>
                      setNewOrgData((prev) => ({ ...prev, industry: e.target.value }))
                    }
                    options={INDUSTRIES}
                  />
                </Field>

                <Field label="Ciudad">
                  <Input
                    value={newOrgData.city}
                    onChange={(e) =>
                      setNewOrgData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Tucumán"
                  />
                </Field>
              </div>

              <Field label="WhatsApp" hint="Con código país, ej: 5493814111111">
                <Input
                  value={newOrgData.whatsappNumber}
                  onChange={(e) =>
                    setNewOrgData((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                  }
                  placeholder="549..."
                />
              </Field>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {mode === 'existing_org' ? 'Crear chatbot' : 'Crear org + bot'}
        </Button>
      </div>
    </form>
  )
}
