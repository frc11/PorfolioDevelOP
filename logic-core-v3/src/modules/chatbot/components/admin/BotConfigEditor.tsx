'use client'

import { useState, useTransition } from 'react'
import { saveBotConfig, type BotConfigInput } from '../../server/admin/saveBotConfig'
import { saveBotConfigByOrgSlug } from '../../server/admin/saveBotConfigByOrgSlug'
import { sendTestNotification } from '../../server/admin/sendTestNotification'
import { Plus, Trash2, GripVertical, Mail } from 'lucide-react'

interface BotConfigEditorProps {
  initial: BotConfigInput
  orgSlug?: string
}

export function BotConfigEditor({ initial, orgSlug }: BotConfigEditorProps) {
  const [data, setData] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [testErrorMsg, setTestErrorMsg] = useState<string | null>(null)

  const update = <K extends keyof BotConfigInput>(key: K, value: BotConfigInput[K]) =>
    setData((d) => ({ ...d, [key]: value }))

  const handleSave = () => {
    setStatus('idle')
    startTransition(async () => {
      // Remove botConfigId when calling the orgSlug version
      const { botConfigId, ...restData } = data
      const result = orgSlug
        ? await saveBotConfigByOrgSlug({ orgSlug, ...restData })
        : await saveBotConfig(data)

      if (result.success) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
        setErrorMsg(result.error ?? 'Error desconocido')
      }
    })
  }

  const handleSendTest = () => {
    setTestStatus('idle')
    setTestErrorMsg(null)
    startTransition(async () => {
      if (!data.leadNotificationEmail) {
        setTestStatus('error')
        setTestErrorMsg('Configura un email primero')
        return
      }

      const result = await sendTestNotification({
        orgSlug: orgSlug ?? 'develop',
        email: data.leadNotificationEmail,
      })

      if (result.success) {
        setTestStatus('sent')
        setTimeout(() => setTestStatus('idle'), 3000)
      } else {
        setTestStatus('error')
        setTestErrorMsg(result.error ?? 'No se pudo enviar')
      }
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl pb-24">
      <div className="flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur py-4 z-10 border-b border-zinc-800/50">
        <h1 className="text-2xl font-light">Bot Configuration</h1>
        <div className="flex items-center gap-3">
          {status === 'saved' && <span className="text-xs text-emerald-400">Guardado ✓</span>}
          {status === 'error' && <span className="text-xs text-red-400">{errorMsg}</span>}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* SECCIÓN: Identity */}
      <Section title="Identidad">
        <Field label="Nombre del bot">
          <Input value={data.botName} onChange={(v) => update('botName', v)} maxLength={50} />
        </Field>
        <Field label="Mensaje de bienvenida">
          <Textarea value={data.welcomeMessage} onChange={(v) => update('welcomeMessage', v)} rows={3} />
        </Field>
        <Field label="Estado activo">
          <Toggle checked={data.isActive} onChange={(v) => update('isActive', v)} />
        </Field>
      </Section>

      {/* SECCIÓN: Visual */}
      <Section title="Apariencia">
        <Field label="Color principal">
          <ColorPicker value={data.accentColor} onChange={(v) => update('accentColor', v)} />
        </Field>
        <Field label="Color secundario (opcional)">
          <ColorPicker
            value={data.accentSecondary ?? ''}
            onChange={(v) => update('accentSecondary', v || null)}
            nullable
          />
        </Field>
        <Field label="Estilo de avatar">
          <Select
            value={data.avatarStyle}
            onChange={(v) => update('avatarStyle', v as BotConfigInput['avatarStyle'])}
            options={[
              { value: 'neuro', label: 'Neuro (particle sphere)' },
              { value: 'legacy_neuro', label: 'Legacy Neuro (avatar 3D con rostro)' },
              { value: 'image', label: 'Imagen personalizada' },
              { value: 'emoji', label: 'Emoji' },
            ]}
          />
        </Field>
        {data.avatarStyle === 'image' && (
          <Field label="URL de imagen del avatar">
            <Input
              value={data.avatarImageUrl ?? ''}
              onChange={(v) => update('avatarImageUrl', v || null)}
              placeholder="https://..."
            />
          </Field>
        )}
        {data.avatarStyle === 'emoji' && (
          <Field label="Emoji del avatar">
            <Input
              value={data.avatarEmoji ?? ''}
              onChange={(v) => update('avatarEmoji', v || null)}
              placeholder="🤖"
              maxLength={8}
            />
          </Field>
        )}
        <Field label="Border radius">
          <Select
            value={data.borderRadius}
            onChange={(v) => update('borderRadius', v as BotConfigInput['borderRadius'])}
            options={[
              { value: 'small', label: 'Pequeño' },
              { value: 'medium', label: 'Medio' },
              { value: 'large', label: 'Grande' },
            ]}
          />
        </Field>
        <Field label="Posición del avatar">
          <Select
            value={data.position}
            onChange={(v) => update('position', v as BotConfigInput['position'])}
            options={[
              { value: 'bottom_right', label: 'Inferior derecha' },
              { value: 'bottom_left', label: 'Inferior izquierda' },
            ]}
          />
        </Field>
        <Field label="Estilo de burbujas">
          <Select
            value={data.bubbleStyle}
            onChange={(v) => update('bubbleStyle', v as BotConfigInput['bubbleStyle'])}
            options={[
              { value: 'sharp', label: 'Sharp' },
              { value: 'rounded', label: 'Rounded' },
              { value: 'pill', label: 'Pill' },
            ]}
          />
        </Field>
      </Section>

      {/* SECCIÓN: Behavior */}
      <Section title="Comportamiento">
        <Field label="Tono">
          <Select
            value={data.tone}
            onChange={(v) => update('tone', v)}
            options={[
              { value: 'informal_rioplatense', label: 'Informal rioplatense (vos)' },
              { value: 'formal', label: 'Formal (usted)' },
              { value: 'neutral', label: 'Neutral' },
            ]}
          />
        </Field>
      </Section>

      {/* SECCIÓN: Handoff */}
      <Section title="Derivación">
        <Field label="Número de WhatsApp (con código de país, sin +)">
          <Input
            value={data.whatsappNumber ?? ''}
            onChange={(v) => update('whatsappNumber', v || null)}
            placeholder="5493815555555"
          />
        </Field>
      </Section>

      {/* SECCIÓN: Quick Replies */}
      <Section title="Respuestas rápidas (chips iniciales)">
        <QuickRepliesEditor
          value={data.quickReplies}
          onChange={(v) => update('quickReplies', v)}
        />
      </Section>

      <Section title="Notificaciones por email">
        <Field label="Email del cliente">
          <Input
            value={data.leadNotificationEmail ?? ''}
            onChange={(v) => update('leadNotificationEmail', v.trim() || null)}
            placeholder="dueno@negocio.com"
          />
        </Field>
        <Field label="Modo">
          <Select
            value={data.leadNotificationMode}
            onChange={(v) => update('leadNotificationMode', v as BotConfigInput['leadNotificationMode'])}
            options={[
              { value: 'IMMEDIATE', label: 'Inmediato' },
              { value: 'DAILY_DIGEST', label: 'Digest diario' },
              { value: 'DISABLED', label: 'Desactivado' },
            ]}
          />
        </Field>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={isPending || !data.leadNotificationEmail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-100 hover:border-cyan-500/60 disabled:opacity-50"
          >
            <Mail size={16} />
            Enviar email de prueba
          </button>
          {testStatus === 'sent' && <span className="text-xs text-emerald-400">Email enviado</span>}
          {testStatus === 'error' && <span className="text-xs text-red-400">{testErrorMsg}</span>}
        </div>
      </Section>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 p-6 border border-zinc-800 rounded-xl bg-zinc-900/30">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      {children}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  maxLength?: number
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
    />
  )
}

function Textarea({
  value,
  onChange,
  rows,
}: {
  value: string
  onChange: (val: string) => void
  rows: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 resize-y focus:outline-none focus:border-cyan-500/50"
    />
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-cyan-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function ColorPicker({
  value,
  onChange,
  nullable,
}: {
  value: string
  onChange: (val: string) => void
  nullable?: boolean
}) {
  const isClear = nullable && value === ''
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={isClear ? '#000000' : value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isClear}
        className={`h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-zinc-900 p-0 ${
          isClear ? 'opacity-50 grayscale' : ''
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={nullable ? 'Vacío (sin color)' : '#000000'}
        className="w-32 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
      />
      {nullable && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-zinc-400 hover:text-white underline underline-offset-2"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function QuickRepliesEditor({
  value,
  onChange,
}: {
  value: BotConfigInput['quickReplies']
  onChange: (val: BotConfigInput['quickReplies']) => void
}) {
  const handleAdd = () => {
    if (value.length >= 8) return
    const newItem = { id: crypto.randomUUID(), label: '', prompt: '' }
    onChange([...value, newItem])
  }

  const handleUpdate = (id: string, updates: Partial<typeof value[number]>) => {
    onChange(value.map((v) => (v.id === id ? { ...v, ...updates } : v)))
  }

  const handleRemove = (id: string) => {
    onChange(value.filter((v) => v.id !== id))
  }

  return (
    <div className="flex flex-col gap-3">
      {value.map((reply, idx) => (
        <div key={reply.id} className="flex gap-2 items-start bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
          <div className="mt-2 text-zinc-600 cursor-move">
            <GripVertical size={16} />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="text"
              value={reply.label}
              onChange={(e) => handleUpdate(reply.id, { label: e.target.value })}
              placeholder="Label (ej. 'Precios')"
              maxLength={40}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
            />
            <input
              type="text"
              value={reply.prompt}
              onChange={(e) => handleUpdate(reply.id, { prompt: e.target.value })}
              placeholder="Prompt real (ej. 'Quiero saber los precios')"
              maxLength={200}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemove(reply.id)}
            className="p-2 text-zinc-500 hover:text-red-400 mt-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {value.length < 8 && (
        <button
          type="button"
          onClick={handleAdd}
          className="self-start mt-2 flex items-center gap-2 text-sm text-cyan-500 hover:text-cyan-400"
        >
          <Plus size={16} /> Agregar respuesta rápida
        </button>
      )}
    </div>
  )
}
