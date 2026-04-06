'use client'

import { useMemo, useState, useTransition, type InputHTMLAttributes, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  BellRing,
  CheckCircle2,
  Clock3,
  Loader2,
  Settings2,
  Target,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import type { PremiumFeatureKey } from '@/lib/premium-features'
import {
  updateModulePricing,
  updateSettings,
} from '../_actions/settings.actions'

type SettingsConsoleProps = {
  agencyName: string
  updatedAt: string
  maskedTelegramBotToken: string | null
  settings: {
    contactEmail: string
    contactWhatsapp: string
    websiteUrl: string
    alertWebhookUrl: string
    alertOnTickets: boolean
    alertOnLeads: boolean
    alertOnChurn: boolean
    alertOnExpiringSubscriptions: boolean
    alertOnClientMessages: boolean
    osWeeklyDemoTarget: number
    osTelegramChatId: string
  }
  modulePricing: Array<{
    moduleKey: PremiumFeatureKey
    name: string
    description: string
    price: number
    type: string
    active: boolean
  }>
  teamMembers: Array<{
    id: string
    name: string
    email: string
  }>
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function maskFromInput(value: string) {
  if (!value) {
    return null
  }

  return `••••••••${value.slice(-4)}`
}

export function SettingsConsole({
  agencyName,
  updatedAt,
  maskedTelegramBotToken,
  settings,
  modulePricing,
  teamMembers,
}: SettingsConsoleProps) {
  const router = useRouter()
  const [isSavingSettings, startSavingSettings] = useTransition()
  const [isSavingPricing, startSavingPricing] = useTransition()
  const [draft, setDraft] = useState({
    ...settings,
    osWeeklyDemoTarget: String(settings.osWeeklyDemoTarget),
    osTelegramBotToken: '',
  })
  const [pricingRows, setPricingRows] = useState(modulePricing)
  const [pricingDrafts, setPricingDrafts] = useState<Record<PremiumFeatureKey, string>>(
    () =>
      Object.fromEntries(
        modulePricing.map((row) => [row.moduleKey, String(row.price)])
      ) as Record<PremiumFeatureKey, string>
  )
  const [savingModuleKey, setSavingModuleKey] = useState<PremiumFeatureKey | null>(null)
  const [maskedToken, setMaskedToken] = useState(maskedTelegramBotToken)

  const updatedAtLabel = useMemo(() => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(updatedAt))
  }, [updatedAt])

  function saveAllSettings() {
    startSavingSettings(async () => {
      const result = await updateSettings({
        contactEmail: draft.contactEmail,
        contactWhatsapp: draft.contactWhatsapp,
        websiteUrl: draft.websiteUrl,
        alertWebhookUrl: draft.alertWebhookUrl,
        alertOnTickets: draft.alertOnTickets,
        alertOnLeads: draft.alertOnLeads,
        alertOnChurn: draft.alertOnChurn,
        alertOnExpiringSubscriptions: draft.alertOnExpiringSubscriptions,
        alertOnClientMessages: draft.alertOnClientMessages,
        osWeeklyDemoTarget: Number(draft.osWeeklyDemoTarget),
        osTelegramBotToken: draft.osTelegramBotToken,
        osTelegramChatId: draft.osTelegramChatId,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      if (draft.osTelegramBotToken.trim()) {
        setMaskedToken(maskFromInput(draft.osTelegramBotToken.trim()))
      }

      setDraft((current) => ({
        ...current,
        osTelegramBotToken: '',
      }))

      toast.success(result.data.message)
      router.refresh()
    })
  }

  function saveModulePricing(moduleKey: PremiumFeatureKey) {
    setSavingModuleKey(moduleKey)

    startSavingPricing(async () => {
      const nextPrice = Number(pricingDrafts[moduleKey] ?? '')
      const result = await updateModulePricing(moduleKey, nextPrice)

      if (!result.success) {
        toast.error(result.error)
        setSavingModuleKey(null)
        return
      }

      setPricingRows((current) =>
        current.map((row) =>
          row.moduleKey === moduleKey
            ? {
                ...row,
                price: nextPrice,
              }
            : row
        )
      )

      toast.success(result.data.message)
      setSavingModuleKey(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Configuracion
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Centro de control operativo
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              Ajusta la configuracion compartida del portal, el pricing de modulos y los
              parametros internos que usa el equipo comercial y operativo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <InfoPill icon={<Settings2 className="h-4 w-4 text-cyan-300" />}>
              {agencyName}
            </InfoPill>
            <InfoPill icon={<Clock3 className="h-4 w-4 text-zinc-300" />}>
              Actualizado {updatedAtLabel}
            </InfoPill>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Portal de clientes"
          title="Configuracion compartida y precios premium"
          description="Adopta la misma base del admin clasico para contacto, alertas y catalogo comercial del portal."
        />

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Datos y alertas</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Esta configuracion sigue siendo la fuente de verdad del portal.
                </p>
              </div>
              <SaveButton
                disabled={isSavingSettings}
                label={isSavingSettings ? 'Guardando...' : 'Guardar'}
                onClick={saveAllSettings}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Email principal">
                <Input
                  value={draft.contactEmail}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      contactEmail: event.target.value,
                    }))
                  }
                  placeholder="hello@develop.com.ar"
                />
              </Field>
              <Field label="WhatsApp">
                <Input
                  value={draft.contactWhatsapp}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      contactWhatsapp: event.target.value,
                    }))
                  }
                  placeholder="+54 9 11..."
                />
              </Field>
              <Field className="md:col-span-2" label="Sitio web">
                <Input
                  value={draft.websiteUrl}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      websiteUrl: event.target.value,
                    }))
                  }
                  placeholder="https://develop.com.ar"
                />
              </Field>
              <Field className="md:col-span-2" label="Webhook de alertas">
                <Input
                  value={draft.alertWebhookUrl}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      alertWebhookUrl: event.target.value,
                    }))
                  }
                  placeholder="https://hooks.slack.com/..."
                />
              </Field>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <ToggleRow
                label="Alertar tickets urgentes"
                description="Notifica cuando entra soporte prioritario."
                enabled={draft.alertOnTickets}
                onToggle={() =>
                  setDraft((current) => ({
                    ...current,
                    alertOnTickets: !current.alertOnTickets,
                  }))
                }
              />
              <ToggleRow
                label="Alertar nuevos leads"
                description="Avisa sobre oportunidades comerciales nuevas."
                enabled={draft.alertOnLeads}
                onToggle={() =>
                  setDraft((current) => ({
                    ...current,
                    alertOnLeads: !current.alertOnLeads,
                  }))
                }
              />
              <ToggleRow
                label="Alertar churn"
                description="Marca clientes con baja actividad."
                enabled={draft.alertOnChurn}
                onToggle={() =>
                  setDraft((current) => ({
                    ...current,
                    alertOnChurn: !current.alertOnChurn,
                  }))
                }
              />
              <ToggleRow
                label="Alertar vencimientos"
                description="Recuerda suscripciones proximas a vencer."
                enabled={draft.alertOnExpiringSubscriptions}
                onToggle={() =>
                  setDraft((current) => ({
                    ...current,
                    alertOnExpiringSubscriptions:
                      !current.alertOnExpiringSubscriptions,
                  }))
                }
              />
              <ToggleRow
                label="Alertar mensajes del cliente"
                description="Resalta nuevos mensajes entrantes del portal."
                enabled={draft.alertOnClientMessages}
                onToggle={() =>
                  setDraft((current) => ({
                    ...current,
                    alertOnClientMessages: !current.alertOnClientMessages,
                  }))
                }
                className="md:col-span-2"
              />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Pricing de modulos premium</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Ajusta el valor comercial visible para el portal de clientes.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-zinc-400">
                {pricingRows.filter((row) => row.active).length} activos
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {pricingRows.map((row) => {
                const isSavingRow = isSavingPricing && savingModuleKey === row.moduleKey

                return (
                  <div
                    key={row.moduleKey}
                    className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-white">{row.name}</p>
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]',
                              row.active
                                ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                                : 'border border-white/10 bg-white/5 text-zinc-400'
                            )}
                          >
                            {row.active ? 'Activo' : 'Inactivo'}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                            {row.type === 'one-time' ? 'Pago unico' : 'Mensual'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          {row.description}
                        </p>
                      </div>

                      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                            USD
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={pricingDrafts[row.moduleKey] ?? ''}
                            onChange={(event) =>
                              setPricingDrafts((current) => ({
                                ...current,
                                [row.moduleKey]: event.target.value,
                              }))
                            }
                            className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-14 pr-4 text-sm text-white outline-none transition-colors focus:border-cyan-400/35 sm:w-[150px]"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isSavingRow}
                          onClick={() => saveModulePricing(row.moduleKey)}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSavingRow ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Agency OS"
          title="Parametros internos del equipo"
          description="Centraliza la meta comercial semanal, el ritmo de follow-up y la composicion del equipo."
        />

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <GlassCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Operacion comercial</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Configuracion propia de Agency OS para seguimiento de demos.
                </p>
              </div>
              <SaveButton
                disabled={isSavingSettings}
                label={isSavingSettings ? 'Guardando...' : 'Guardar'}
                onClick={saveAllSettings}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Field label="Objetivo semanal de demos">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={draft.osWeeklyDemoTarget}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      osWeeklyDemoTarget: event.target.value,
                    }))
                  }
                />
              </Field>

              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Meta actual</p>
                    <p className="text-sm text-zinc-400">
                      {draft.osWeeklyDemoTarget || '0'} demos por semana
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-medium text-white">Intervalos de follow-up</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Referencia informativa. La logica vive en <code>lib/follow-up.ts</code>.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {['Dia 2', 'Dia 4', 'Dia 7'].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Miembros del equipo</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Usuarios con rol SUPER_ADMIN habilitados para operar la OS.
                </p>
              </div>
              <InfoPill icon={<Users className="h-4 w-4 text-cyan-300" />}>
                {teamMembers.length} miembros
              </InfoPill>
            </div>

            <div className="mt-5 space-y-3">
              {teamMembers.length ? (
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="grid gap-2 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{member.email}</p>
                    </div>
                    <div className="flex items-center justify-start md:justify-end">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                        SUPER_ADMIN
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-4 py-6 text-sm text-zinc-500">
                  No hay miembros internos cargados.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Notificaciones"
          title="Telegram y referencias operativas"
          description="Guarda credenciales de Telegram para alertas internas y deja visibles los horarios operativos del cron."
        />

        <GlassCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Canales internos</h2>
              <p className="mt-1 text-sm text-zinc-400">
                El token se mantiene enmascarado. Si dejas el campo vacio, se conserva el valor actual.
              </p>
            </div>
            <SaveButton
              disabled={isSavingSettings}
              label={isSavingSettings ? 'Guardando...' : 'Guardar'}
              onClick={saveAllSettings}
            />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
            <Field label="Telegram Bot Token">
              <Input
                type="password"
                value={draft.osTelegramBotToken}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    osTelegramBotToken: event.target.value,
                  }))
                }
                placeholder={maskedToken ?? 'Sin configurar'}
              />
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {maskedToken
                  ? `Actual: ${maskedToken}`
                  : 'Todavia no hay token configurado.'}
              </p>
            </Field>

            <Field label="Telegram Chat ID">
              <Input
                value={draft.osTelegramChatId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    osTelegramChatId: event.target.value,
                  }))
                }
                placeholder="-1001234567890"
              />
            </Field>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                <BellRing className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-medium text-white">Hora del cron</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                9:00 AM Argentina
              </p>
              <p className="mt-4 text-xs leading-5 text-zinc-500">
                Referencia informativa para el equipo. La programacion del cron no se edita desde esta pantalla.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  )
}

function GlassCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      {children}
    </div>
  )
}

function InfoPill({
  children,
  icon,
}: {
  children: ReactNode
  icon: ReactNode
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-300">
      {icon}
      <span>{children}</span>
    </div>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-sm font-medium text-zinc-200">{label}</span>
      {children}
    </label>
  )
}

function Input(
  props: InputHTMLAttributes<HTMLInputElement> & {
    className?: string
  }
) {
  return (
    <input
      {...props}
      className={cn(
        'h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35',
        props.className
      )}
    />
  )
}

function SaveButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      {label}
    </button>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  className,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-[24px] border border-white/10 bg-black/20 p-4',
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={cn(
          'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors',
          enabled
            ? 'border-emerald-400/30 bg-emerald-400/20'
            : 'border-white/10 bg-white/5'
        )}
      >
        <span
          className={cn(
            'absolute left-1 h-6 w-6 rounded-full border border-white/10 bg-[#090c12] transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
