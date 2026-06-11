'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Field } from '../Field'
import { Input } from '../Input'
import { Select } from '@/components/ui'
import { Slider } from '../Slider'
import type { BotConfigTabProps } from '../types'

const MODELS_BY_PROVIDER: Record<string, { value: string; label: string }[]> = {
  google: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
    { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
  ],
  openai: [
    { value: 'gpt-5.2', label: 'GPT-5.2' },
    { value: 'gpt-5.4-mini', label: 'GPT-5.4 Mini' },
  ],
}

export function AdvancedTab({ state, update }: BotConfigTabProps) {
  const modelOptions = MODELS_BY_PROVIDER[state.llmProvider] ?? MODELS_BY_PROVIDER.google

  function updateProvider(provider: typeof state.llmProvider) {
    update('llmProvider', provider)
    update('llmModel', MODELS_BY_PROVIDER[provider]?.[0]?.value ?? state.llmModel)
  }

  return (
    <div className="space-y-6">
      <Field label="Proveedor LLM">
        <Select
          value={state.llmProvider}
          onChange={(event) => updateProvider(event.target.value as typeof state.llmProvider)}
          options={[
            { value: 'google', label: 'Google Vertex' },
            { value: 'anthropic', label: 'Anthropic' },
            { value: 'openai', label: 'OpenAI' },
          ]}
        />
      </Field>

      <Field label="Modelo">
        <Select
          value={state.llmModel}
          onChange={(event) => update('llmModel', event.target.value)}
          options={modelOptions}
        />
      </Field>

      <Field label="Temperature" hint="0 es mas determinista, 2 es mas creativo">
        <Slider
          value={state.temperature}
          onChange={(value) => update('temperature', value)}
          min={0}
          max={2}
          step={0.1}
          format={(value) => value.toFixed(1)}
        />
      </Field>

      <Field label="Max output tokens">
        <Input
          type="number"
          value={state.maxOutputTokens}
          onChange={(event) => update('maxOutputTokens', Number(event.target.value))}
          min={100}
          max={8192}
        />
      </Field>

      <Field label="Quota mensual">
        <Input
          type="number"
          value={state.monthlyQuota}
          onChange={(event) => update('monthlyQuota', Number(event.target.value))}
          min={0}
          max={1000000}
        />
      </Field>

      <Field label="Numero de WhatsApp" hint="Con codigo de pais, sin +">
        <Input
          value={state.whatsappNumber ?? ''}
          onChange={(event) => update('whatsappNumber', event.target.value || null)}
          placeholder="5493815555555"
        />
      </Field>

      <Field label="Mensaje de WhatsApp" hint="Texto base para la derivacion">
        <textarea
          value={state.whatsappMessage ?? ''}
          onChange={(event) => update('whatsappMessage', event.target.value || null)}
          rows={3}
          maxLength={500}
          className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-400/30 focus:outline-none"
          placeholder="Hola, quiero hablar con el equipo..."
        />
      </Field>

      <Field label="Email de notificaciones" hint="Configuracion existente de la organizacion">
        <Input
          value={state.leadNotificationEmail ?? ''}
          onChange={(event) => update('leadNotificationEmail', event.target.value.trim() || null)}
          placeholder="dueno@negocio.com"
        />
      </Field>

      <Field label="Modo de notificaciones">
        <Select
          value={state.leadNotificationMode}
          onChange={(event) => update('leadNotificationMode', event.target.value as typeof state.leadNotificationMode)}
          options={[
            { value: 'IMMEDIATE', label: 'Inmediato' },
            { value: 'DAILY_DIGEST', label: 'Digest diario' },
            { value: 'DISABLED', label: 'Desactivado' },
          ]}
        />
      </Field>

      {/* ── Dominios permitidos ── */}
      <div className="border-t border-white/10 pt-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-zinc-200">Dominios permitidos</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Sitios donde el chatbot puede embeberse. Sin esto, el widget no va a cargar en sitios externos.
          </p>
        </div>

        <div className="space-y-2 mb-3">
          {state.allowedDomains.map((domain, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={domain}
                onChange={(e) => {
                  const next = [...state.allowedDomains]
                  next[idx] = e.target.value
                  update('allowedDomains', next)
                }}
                placeholder="ejemplo.com"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  update(
                    'allowedDomains',
                    state.allowedDomains.filter((_, i) => i !== idx),
                  )
                }}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-zinc-400 hover:border-red-500/40 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => update('allowedDomains', [...state.allowedDomains, ''])}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.04] transition-colors"
        >
          <Plus size={13} strokeWidth={1.5} />
          Agregar dominio
        </button>

        {state.allowedDomains.length === 0 && (
          <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
            <p className="text-xs text-amber-300">
              Sin dominios configurados, el chatbot no va a cargar en sitios externos.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
