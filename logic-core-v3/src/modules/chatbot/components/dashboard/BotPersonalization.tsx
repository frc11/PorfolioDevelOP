'use client'

import { useMemo, useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import {
  AlignLeft,
  AlignRight,
  Check,
  Plus,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Section } from '@/components/ui/Section'
import { Eyebrow, Heading, Muted } from '@/components/ui/Typography'
import { cn } from '@/lib/utils'
import { updateBotAppearance } from '@/modules/chatbot/server/dashboard/updateBotAppearance'
import { AvatarPicker } from '@/modules/chatbot/components/avatar'
import { EmojiPickerField } from '@/modules/chatbot/components/admin/config/EmojiPickerField'
import { ColorPicker } from '@/modules/chatbot/components/admin/config/ColorPicker'
import { deriveBusinessInitials } from '@/modules/chatbot/shared/businessInitials'
import { BotConfigPreview, type BotPreviewState } from '@/modules/chatbot/components/preview'
import {
  CLIENT_AVATAR_STYLES,
  CURATED_COLORS,
  type BotPosition,
  type ClientAvatarStyle,
  type CuratedColor,
  isCuratedColor,
} from '@/modules/chatbot/shared/appearance'

interface BotPersonalizationProps {
  bot: {
    id: string
    /** Campos que el cliente edita */
    accentColor: string
    position: string
    avatarStyle: string
    avatarEmoji: string | null
    botName: string
    welcomeMessage: string
    quickReplies: unknown
    /** Campos visuales configurados por develOP en el admin — el cliente no los edita
     * pero el preview los necesita para ser un espejo fiel del widget real.
     * Vienen crudos de Prisma como `string` (los enums no se preservan en el query). */
    isActive: boolean
    avatarImageUrl: string | null
    accentSecondary: string | null
    chatSurfaceTint: string | null
    borderRadius: string
    bubbleStyle: string
    surfaceStyle: string
    intensityLevel: string
    fontStyle: string
  }
}

type BotPersonalizationState = {
  accentColor: CuratedColor
  accentSecondary: string | null
  chatSurfaceTint: string | null
  position: BotPosition
  avatarStyle: ClientAvatarStyle
  avatarEmoji: string | null
  welcomeMessage: string
  quickReplies: string[]
}

const COLOR_LABELS: Record<CuratedColor, string> = {
  '#06b6d4': 'Cyan develOP',
  '#8b5cf6': 'Violeta',
  '#10b981': 'Verde',
  '#f59e0b': 'Ambar',
  '#f43f5e': 'Rosa',
  '#6366f1': 'Indigo',
  '#0ea5e9': 'Celeste',
  '#14b8a6': 'Turquesa',
}

function isBotPosition(value: string): value is BotPosition {
  return value === 'bottom_right' || value === 'bottom_left'
}

function isClientAvatarStyle(value: string): value is ClientAvatarStyle {
  return (CLIENT_AVATAR_STYLES as readonly string[]).includes(value)
}

function normalizeQuickReplyTexts(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const replies: string[] = []

  for (const item of value) {
    const text =
      typeof item === 'string'
        ? item
        : item && typeof item === 'object'
          ? String(
              (item as Record<string, unknown>).label ??
                (item as Record<string, unknown>).promptToSend ??
                (item as Record<string, unknown>).prompt ??
                '',
            )
          : ''

    const trimmed = text.trim()
    if (trimmed) replies.push(trimmed.slice(0, 40))
    if (replies.length >= 4) break
  }

  return replies
}

function normalizeBotState(bot: BotPersonalizationProps['bot']): BotPersonalizationState {
  return {
    accentColor: isCuratedColor(bot.accentColor) ? bot.accentColor : CURATED_COLORS[0],
    accentSecondary: bot.accentSecondary,
    chatSurfaceTint: bot.chatSurfaceTint,
    position: isBotPosition(bot.position) ? bot.position : 'bottom_right',
    avatarStyle: isClientAvatarStyle(bot.avatarStyle) ? bot.avatarStyle : 'neuro',
    avatarEmoji: bot.avatarEmoji,
    welcomeMessage: bot.welcomeMessage.slice(0, 200),
    quickReplies: normalizeQuickReplyTexts(bot.quickReplies),
  }
}

export function BotPersonalization({ bot }: BotPersonalizationProps) {
  const initialState = useMemo(() => normalizeBotState(bot), [bot])
  const [state, setState] = useState<BotPersonalizationState>(initialState)
  const [savedState, setSavedState] = useState<BotPersonalizationState>(initialState)
  const [pending, startTransition] = useTransition()

  function update<K extends keyof BotPersonalizationState>(
    key: K,
    value: BotPersonalizationState[K],
  ) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const hasChanges = JSON.stringify(state) !== JSON.stringify(savedState)

  function handleSave() {
    startTransition(async () => {
      const result = await updateBotAppearance({
        accentColor: state.accentColor,
        accentSecondary: state.accentSecondary,
        chatSurfaceTint: state.chatSurfaceTint,
        position: state.position,
        avatarStyle: state.avatarStyle,
        avatarEmoji: state.avatarEmoji,
        welcomeMessage: state.welcomeMessage,
        quickReplies: state.quickReplies,
      })

      if (result.ok) {
        setSavedState(state)
        toast.success('Cambios guardados. Tu chatbot ya se ve asi.')
      } else {
        toast.error(`Error: ${result.error}`)
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <div>
          <Eyebrow>Personalizacion</Eyebrow>
          <Heading level={1}>Personalizar tu chatbot</Heading>
          <Muted>Cambia la apariencia y los mensajes. Los cambios se aplican al guardar.</Muted>
        </div>

        <Section title="Color del bot" description="Elegi un color de la paleta curada.">
          <Card padding="lg">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {CURATED_COLORS.map((color) => {
                const isActive = state.accentColor === color

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update('accentColor', color)}
                    title={COLOR_LABELS[color]}
                    aria-label={`Color ${COLOR_LABELS[color]}`}
                    aria-pressed={isActive}
                    className={cn(
                      'relative aspect-square rounded-2xl border-2 transition-transform focus:outline-none focus:ring-2 focus:ring-white/40',
                      isActive
                        ? 'scale-105 border-white/50'
                        : 'border-white/10 hover:scale-[1.03] hover:border-white/25',
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="bot-color-check"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                      </motion.span>
                    )}
                  </button>
                )
              })}
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              Color actual:{' '}
              <span className="font-mono text-zinc-300">{state.accentColor}</span>
              {' - '}
              <span className="text-zinc-400">{COLOR_LABELS[state.accentColor]}</span>
            </p>
          </Card>
        </Section>

        <Section
          title="Colores avanzados"
          description="Opcionales. Color secundario para gradientes y un tinte sutil para el fondo del chat."
        >
          <Card padding="lg" className="space-y-5">
            <Field label="Color secundario" hint="Opcional, para gradientes y acentos secundarios">
              <ColorPicker
                value={state.accentSecondary ?? ''}
                onChange={(value) => update('accentSecondary', value || null)}
                nullable
              />
            </Field>
            <Field label="Tinte del chat surface" hint="Color sutil del fondo del chat, opcional">
              <ColorPicker
                value={state.chatSurfaceTint ?? ''}
                onChange={(value) => update('chatSurfaceTint', value || null)}
                nullable
              />
            </Field>
          </Card>
        </Section>

        <Section title="Posicion en tu sitio" description="Donde aparece el boton del chatbot.">
          <Card padding="lg">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <OptionButton
                label="Abajo a la izquierda"
                icon={AlignLeft}
                active={state.position === 'bottom_left'}
                onClick={() => update('position', 'bottom_left')}
              />
              <OptionButton
                label="Abajo a la derecha"
                icon={AlignRight}
                active={state.position === 'bottom_right'}
                onClick={() => update('position', 'bottom_right')}
              />
            </div>
          </Card>
        </Section>

        <Section
          title="Avatar"
          description="Elegi cómo se ve tu asistente. Pasá el mouse sobre una opción para verla animada."
        >
          <Card padding="lg">
            <AvatarPicker
              value={state.avatarStyle}
              onChange={(id) => {
                if (isClientAvatarStyle(id)) update('avatarStyle', id)
              }}
              accentColor={state.accentColor}
              businessInitials={deriveBusinessInitials(bot.botName)}
              escapeHatches={['emoji']}
              avatarEmoji={state.avatarEmoji}
            />
            {state.avatarStyle === 'emoji' && (
              <div className="mt-4">
                <Field label="Emoji del avatar" hint="Un solo emoji sobre fondo de marca">
                  <EmojiPickerField
                    value={state.avatarEmoji}
                    onChange={(value) => update('avatarEmoji', value)}
                  />
                </Field>
              </div>
            )}
          </Card>
        </Section>

        <Section title="Mensaje de bienvenida" description="Lo primero que ve el visitante.">
          <Card padding="lg">
            <Field label="Mensaje" hint={`${state.welcomeMessage.length}/200 caracteres`} required>
              <textarea
                value={state.welcomeMessage}
                onChange={(event) =>
                  update('welcomeMessage', event.target.value.slice(0, 200))
                }
                rows={3}
                maxLength={200}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-400/30 focus:outline-none"
                placeholder="Hola! Te ayudo en lo que necesites."
              />
            </Field>
          </Card>
        </Section>

        <Section
          title="Respuestas rapidas"
          description="Hasta 4 opciones visibles para iniciar una conversacion."
        >
          <Card padding="lg">
            <QuickRepliesEditor
              quickReplies={state.quickReplies}
              onChange={(replies) => update('quickReplies', replies)}
            />
          </Card>
        </Section>

        <div className="sticky bottom-4 z-10">
          <Card padding="md" className="bg-zinc-950/90 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Muted>{hasChanges ? 'Tenes cambios sin guardar' : 'Todo guardado'}</Muted>
              <Button onClick={handleSave} disabled={!hasChanges} loading={pending}>
                Guardar cambios
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <BotConfigPreview state={buildPreviewState(state, bot)} />
      </aside>
    </div>
  )
}

function OptionButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon: LucideIcon
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-24 rounded-2xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/30',
        active
          ? 'border-cyan-400/40 bg-cyan-400/10'
          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]',
      )}
    >
      <Icon
        className={cn('mb-2 h-5 w-5', active ? 'text-cyan-300' : 'text-zinc-400')}
        strokeWidth={1.5}
      />
      <p className={cn('text-sm', active ? 'text-cyan-300' : 'text-zinc-300')}>{label}</p>
    </button>
  )
}

function QuickRepliesEditor({
  quickReplies,
  onChange,
}: {
  quickReplies: string[]
  onChange: (replies: string[]) => void
}) {
  const [newReply, setNewReply] = useState('')

  function addReply() {
    const trimmed = newReply.trim().slice(0, 40)
    if (!trimmed || quickReplies.length >= 4) return
    onChange([...quickReplies, trimmed])
    setNewReply('')
  }

  function updateReply(index: number, value: string) {
    onChange(quickReplies.map((reply, i) => (i === index ? value.slice(0, 40) : reply)))
  }

  function removeReply(index: number) {
    onChange(quickReplies.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {quickReplies.length > 0 && (
        <div className="space-y-2">
          {quickReplies.map((reply, index) => (
            <div key={`${reply}-${index}`} className="grid grid-cols-[minmax(0,1fr)_40px] gap-2">
              <Input
                value={reply}
                onChange={(event) => updateReply(index, event.target.value)}
                maxLength={40}
                aria-label={`Respuesta rapida ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeReply(index)}
                title="Eliminar"
                aria-label="Eliminar respuesta rapida"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {quickReplies.length < 4 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={newReply}
            onChange={(event) => setNewReply(event.target.value.slice(0, 40))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addReply()
              }
            }}
            placeholder="Ej: Cuanto cuesta?"
            maxLength={40}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={addReply}
            disabled={!newReply.trim()}
            icon={<Plus className="h-4 w-4" strokeWidth={1.5} />}
          >
            Agregar
          </Button>
        </div>
      )}

      <p className="text-xs text-zinc-500">{quickReplies.length}/4 respuestas rapidas</p>
    </div>
  )
}

/**
 * CC.4 — Arma el `BotPreviewState` para alimentar el preview compartido.
 *
 * Merge: cambios en vivo del cliente (state) + campos visuales que el admin
 * ya configuró (bot prop). El cliente NUNCA edita los del admin, pero sí los
 * VE reflejados en el preview para que sea espejo fiel del widget real.
 *
 * Quick replies: si el cliente NO los modificó (state coincide con el original
 * normalizado de DB), mostramos el JSON original con emojis incluidos —
 * paridad fiel con el admin. Si SÍ los modificó, mostramos sus strings sin
 * emoji (refleja lo que va a guardarse — el update borra emojis por diseño
 * de `toPublicQuickReplies` en `updateBotAppearance`).
 */
function buildPreviewState(
  state: BotPersonalizationState,
  bot: BotPersonalizationProps['bot'],
): BotPreviewState {
  const originalNormalized = normalizeQuickReplyTexts(bot.quickReplies)
  const clientEditedReplies =
    JSON.stringify(state.quickReplies) !== JSON.stringify(originalNormalized)

  const quickReplies: BotPreviewState['quickReplies'] = clientEditedReplies
    ? state.quickReplies.map((label, index) => ({
        id: `${index}-${label}`,
        label,
      }))
    : extractQuickRepliesFromJson(bot.quickReplies)

  return {
    accentColor: state.accentColor,
    accentSecondary: state.accentSecondary,
    position: state.position,
    avatarStyle: state.avatarStyle,
    welcomeMessage: state.welcomeMessage,
    quickReplies,
    botName: bot.botName,
    isActive: bot.isActive,
    avatarImageUrl: bot.avatarImageUrl,
    avatarEmoji: state.avatarEmoji,
    chatSurfaceTint: state.chatSurfaceTint,
    borderRadius: bot.borderRadius,
    bubbleStyle: bot.bubbleStyle,
    surfaceStyle: bot.surfaceStyle,
    intensityLevel: bot.intensityLevel,
    fontStyle: bot.fontStyle,
  }
}

/**
 * Lee el JSON crudo de `bot.quickReplies` (config guardada) y extrae label +
 * emoji para el preview. Tolerante a strings sueltos o shapes inesperados.
 */
function extractQuickRepliesFromJson(value: unknown): BotPreviewState['quickReplies'] {
  if (!Array.isArray(value)) return []
  const out: BotPreviewState['quickReplies'] = []
  for (const [index, item] of value.entries()) {
    if (typeof item === 'string') {
      const label = item.trim()
      if (label) out.push({ id: `${index}-${label}`, label })
    } else if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>
      const label = typeof record.label === 'string' ? record.label.trim() : ''
      const emoji = typeof record.emoji === 'string' ? record.emoji : undefined
      if (label) out.push({ id: `${index}-${label}`, label, emoji })
    }
    if (out.length >= 4) break
  }
  return out
}
