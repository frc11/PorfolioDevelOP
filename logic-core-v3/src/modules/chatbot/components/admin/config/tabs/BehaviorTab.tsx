'use client'

import { Plus, Trash2 } from 'lucide-react'
import { ColorPicker } from '../ColorPicker'
import { EmojiPickerField } from '../EmojiPickerField'
import { Field } from '../Field'
import { Input } from '../Input'
import type { BotConfigEditorState, BotConfigTabProps, QuickReplyItem } from '../types'

type ProactivePrompts = BotConfigEditorState['proactivePrompts']
type RouteColorMap = BotConfigEditorState['routeColorMap']

export function BehaviorTab({ state, update }: BotConfigTabProps) {
  return (
    <div className="space-y-6">
      <Field label="Mensaje de bienvenida" required hint="Primer mensaje que ve el usuario">
        <textarea
          value={state.welcomeMessage}
          onChange={(event) => update('welcomeMessage', event.target.value)}
          rows={4}
          maxLength={500}
          className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-400/30 focus:outline-none"
        />
        <p className="text-right text-xs text-zinc-500">{state.welcomeMessage.length} / 500</p>
      </Field>

      <Field label="Respuestas rapidas" hint="Chips iniciales debajo del chat">
        <QuickRepliesEditor
          value={state.quickReplies}
          onChange={(value) => update('quickReplies', value)}
        />
      </Field>

      <Field label="Prompts proactivos" hint="Mensajes por ruta. Usa / como default visual general.">
        <ProactivePromptsEditor
          value={state.proactivePrompts}
          onChange={(value) => update('proactivePrompts', value)}
        />
      </Field>

      <Field label="Mapa de color por ruta" hint="Permite contextualizar el color del widget por pagina">
        <RouteColorMapEditor
          value={state.routeColorMap}
          onChange={(value) => update('routeColorMap', value)}
        />
      </Field>
    </div>
  )
}

function QuickRepliesEditor({
  value,
  onChange,
}: {
  value: QuickReplyItem[]
  onChange: (value: QuickReplyItem[]) => void
}) {
  function handleAdd() {
    if (value.length >= 8) return
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        emoji: '',
        label: '',
        promptToSend: '',
      },
    ])
  }

  function handleUpdate(index: number, updates: Partial<QuickReplyItem>) {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...updates } : item)))
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="space-y-3">
      {value.map((reply, index) => (
        <div key={reply.id ?? index} className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
          <div className="grid grid-cols-[minmax(140px,190px)_minmax(0,1fr)_auto] gap-2">
            <EmojiPickerField
              value={reply.emoji || null}
              onChange={(value) => handleUpdate(index, { emoji: value ?? '' })}
            />
            <Input
              value={reply.label}
              onChange={(event) => handleUpdate(index, { label: event.target.value })}
              placeholder="Etiqueta"
              maxLength={40}
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="rounded-xl p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <Input
            value={reply.promptToSend}
            onChange={(event) => handleUpdate(index, { promptToSend: event.target.value })}
            placeholder="Mensaje real que se envia"
            maxLength={200}
            className="mt-2"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        disabled={value.length >= 8}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-cyan-300 hover:bg-white/[0.04] disabled:opacity-50"
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Agregar respuesta
      </button>
    </div>
  )
}

function ProactivePromptsEditor({
  value,
  onChange,
}: {
  value: ProactivePrompts
  onChange: (value: ProactivePrompts) => void
}) {
  const rows = Object.entries(value)

  function addRoute() {
    const key = nextRouteKey(value, '/')
    onChange({ ...value, [key]: [''] })
  }

  function updateRoute(oldRoute: string, nextRoute: string) {
    const trimmed = nextRoute.trim() || '/'
    const next = { ...value }
    const prompts = next[oldRoute] ?? []
    delete next[oldRoute]
    next[trimmed] = prompts
    onChange(next)
  }

  function updatePrompt(route: string, promptIndex: number, prompt: string) {
    onChange({
      ...value,
      [route]: (value[route] ?? []).map((item, index) => (index === promptIndex ? prompt : item)),
    })
  }

  function addPrompt(route: string) {
    const current = value[route] ?? []
    if (current.length >= 8) return
    onChange({ ...value, [route]: [...current, ''] })
  }

  function removePrompt(route: string, promptIndex: number) {
    const nextPrompts = (value[route] ?? []).filter((_, index) => index !== promptIndex)
    const next = { ...value }
    if (nextPrompts.length === 0) {
      delete next[route]
    } else {
      next[route] = nextPrompts
    }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {rows.map(([route, prompts]) => (
        <div key={route} className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
          <Input
            value={route}
            onChange={(event) => updateRoute(route, event.target.value)}
            placeholder="/web-development"
            className="font-mono"
          />
          <div className="mt-3 space-y-2">
            {prompts.map((prompt, index) => (
              <div key={`${route}-${index}`} className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(event) => updatePrompt(route, index, event.target.value)}
                  placeholder="Mensaje proactivo"
                  maxLength={240}
                />
                <button
                  type="button"
                  onClick={() => removePrompt(route, index)}
                  className="rounded-xl p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addPrompt(route)}
            disabled={prompts.length >= 8}
            className="mt-3 inline-flex items-center gap-2 text-xs text-cyan-300 hover:text-cyan-200 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Agregar prompt
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRoute}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-cyan-300 hover:bg-white/[0.04]"
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Agregar ruta
      </button>
    </div>
  )
}

function RouteColorMapEditor({
  value,
  onChange,
}: {
  value: RouteColorMap
  onChange: (value: RouteColorMap) => void
}) {
  const rows = Object.entries(value)

  function addRoute() {
    const key = nextRouteKey(value, '/')
    onChange({ ...value, [key]: '#06b6d4' })
  }

  function updateRoute(oldRoute: string, nextRoute: string) {
    const trimmed = nextRoute.trim() || '/'
    const next = { ...value }
    const color = next[oldRoute] ?? '#06b6d4'
    delete next[oldRoute]
    next[trimmed] = color
    onChange(next)
  }

  function updateColor(route: string, color: string) {
    onChange({ ...value, [route]: color })
  }

  function removeRoute(route: string) {
    const next = { ...value }
    delete next[route]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {rows.map(([route, color]) => (
        <div key={route} className="rounded-2xl border border-white/10 bg-zinc-950/50 p-3">
          <div className="mb-3 flex gap-2">
            <Input
              value={route}
              onChange={(event) => updateRoute(route, event.target.value)}
              placeholder="/ai-implementations"
              className="font-mono"
            />
            <button
              type="button"
              onClick={() => removeRoute(route)}
              className="rounded-xl p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <ColorPicker value={color} onChange={(nextColor) => updateColor(route, nextColor)} />
        </div>
      ))}

      <button
        type="button"
        onClick={addRoute}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-cyan-300 hover:bg-white/[0.04]"
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Agregar color por ruta
      </button>
    </div>
  )
}

function nextRouteKey(value: Record<string, unknown>, base: string): string {
  if (!(base in value)) return base
  let index = 2
  while (`${base}-${index}` in value) index += 1
  return `${base}-${index}`
}
