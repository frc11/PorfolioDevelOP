'use client'

/* eslint-disable react/no-unescaped-entities */

import { useMemo, useState, useTransition, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { BellRing, CheckCircle2, Globe, Loader2, Mail, PlugZap, ShieldCheck, Sparkles, TrendingUp, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { inviteTeamMemberAction, saveAgencySettingsAction, testN8nConnectionAction, testWebhookAction, updateModulePricingAction, verifyGooglePermissionsAction } from '@/lib/actions/settings'
import { AGENCY_TIMEZONE } from '@/lib/agency-settings'
import type { PremiumFeatureKey } from '@/lib/premium-features'

type AgencySettingsDraft = {
  contactEmail: string
  contactWhatsapp: string
  websiteUrl: string
  alertWebhookUrl: string
  alertOnTickets: boolean
  alertOnLeads: boolean
  alertOnChurn: boolean
  alertOnExpiringSubscriptions: boolean
  alertOnClientMessages: boolean
}

type IntegrationStatus = { configured: boolean; value: string; maskedValue: string | null }
type PricingRow = { featureKey: PremiumFeatureKey; name: string; description: string; price: number; type: string; active: boolean }
type TeamMember = { id: string; name: string; email: string; createdAtLabel: string; lastAccessLabel: string }

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function AdminSettingsConsole({
  agencyName,
  initialSettings,
  integrations,
  modulePricing,
  teamMembers,
}: {
  agencyName: string
  initialSettings: AgencySettingsDraft
  integrations: {
    n8n: { apiUrl: IntegrationStatus; apiKey: IntegrationStatus; webhook: IntegrationStatus }
    google: { key: IntegrationStatus; docsUrl: string }
    anthropic: { key: IntegrationStatus; model: string; estimatedUsage: string }
  }
  modulePricing: PricingRow[]
  teamMembers: TeamMember[]
}) {
  const [tab, setTab] = useState<'agency' | 'integrations' | 'pricing' | 'team' | 'alerts'>('agency')
  const [settings, setSettings] = useState(initialSettings)
  const [pricing, setPricing] = useState(modulePricing)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [saving, startSaving] = useTransition()
  const [testingN8n, startTestingN8n] = useTransition()
  const [testingGoogle, startTestingGoogle] = useTransition()
  const [testingWebhook, startTestingWebhook] = useTransition()
  const [inviting, startInviting] = useTransition()

  const integrationsReady = useMemo(
    () =>
      [
        integrations.n8n.apiUrl.configured && integrations.n8n.apiKey.configured,
        integrations.google.key.configured,
        integrations.anthropic.key.configured,
        Boolean(settings.alertWebhookUrl.trim()),
      ].filter(Boolean).length,
    [integrations, settings.alertWebhookUrl],
  )

  const saveSettings = () =>
    startSaving(async () => {
      const result = await saveAgencySettingsAction(settings)
      if (result.success) {
        toast.success(result.data?.message ?? 'Configuración guardada.')
        return
      }

      toast.error(result.error ?? 'No se pudo guardar la configuración.')
    })

  const updatePricing = (next: PricingRow) =>
    updateModulePricingAction(next).then((result) => {
      if (!result.success) {
        toast.error(result.error ?? 'No se pudo actualizar el precio.')
        return
      }
      setPricing((current) => current.map((item) => (item.featureKey === next.featureKey ? next : item)))
      toast.success(result.data?.message ?? 'Precio actualizado.')
    })

  const tabs = [
    ['agency', 'Agencia', Sparkles],
    ['integrations', 'Integraciones', PlugZap],
    ['pricing', 'Catálogo', TrendingUp],
    ['team', 'Equipo', Users],
    ['alerts', 'Alertas', BellRing],
  ] as const

  const panel = (
    {
      agency: (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400/70">Identidad</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Datos de la agencia</h2>
              </div>
              <button type="button" onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/12 px-4 py-2 text-sm font-semibold text-cyan-200 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Guardar
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre de la agencia"><StaticValue>{agencyName}</StaticValue></Field>
              <Field label="Zona horaria"><StaticValue>{AGENCY_TIMEZONE}</StaticValue></Field>
              <Field label="Email principal"><Input value={settings.contactEmail} onChange={(event) => setSettings((current) => ({ ...current, contactEmail: event.target.value }))} /></Field>
              <Field label="WhatsApp"><Input value={settings.contactWhatsapp} onChange={(event) => setSettings((current) => ({ ...current, contactWhatsapp: event.target.value }))} /></Field>
              <Field className="md:col-span-2" label="URL del sitio web"><Input value={settings.websiteUrl} onChange={(event) => setSettings((current) => ({ ...current, websiteUrl: event.target.value }))} /></Field>
            </div>
          </section>
          <section className="rounded-[28px] border border-cyan-500/15 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.18),transparent_45%),rgba(255,255,255,0.025)] p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">Brand asset</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Logo y presencia</h2>
            <div className="mt-6 flex items-center gap-4 rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]">
                <Image src="/logodevelOP.png" alt="develOP" fill className="object-contain p-3" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">develOP</p>
                <p className="text-sm text-zinc-400">Control room principal del SaaS multi-tenant.</p>
              </div>
            </div>
          </section>
        </div>
      ),
      integrations: (
        <div className="grid gap-6 xl:grid-cols-2">
          <IntegrationCard title="N8N" configured={integrations.n8n.apiUrl.configured && integrations.n8n.apiKey.configured}>
            <InfoRow label="URL de instancia" value={integrations.n8n.apiUrl.value || 'No configurada'} />
            <InfoRow label="API Key" value={integrations.n8n.apiKey.maskedValue ?? 'No configurada'} />
            <InfoRow label="Webhook de contacto" value={integrations.n8n.webhook.value || 'No configurado'} />
            <ActionButton
              busy={testingN8n}
              icon={<PlugZap size={15} />}
              label="Probar conexión"
              onClick={() => startTestingN8n(async () => {
                const result = await testN8nConnectionAction()
                if (result.success) {
                  toast.success(result.data?.message ?? 'Conexión verificada.')
                } else {
                  toast.error(result.error ?? 'No se pudo conectar con n8n.')
                }
              })}
            />
          </IntegrationCard>
          <IntegrationCard title="Google" configured={integrations.google.key.configured}>
            <InfoRow label="Service account" value={integrations.google.key.maskedValue ?? 'No configurada'} />
            <Link href={integrations.google.docsUrl} target="_blank" className="inline-flex items-center gap-2 text-sm text-cyan-300"><Globe size={14} /> Ver guía</Link>
            <ActionButton
              busy={testingGoogle}
              icon={<ShieldCheck size={15} />}
              label="Verificar permisos"
              secondary
              onClick={() => startTestingGoogle(async () => {
                const result = await verifyGooglePermissionsAction()
                if (result.success) {
                  toast.success(result.data?.message ?? 'Permisos verificados.')
                } else {
                  toast.error(result.error ?? 'No se pudieron verificar los permisos.')
                }
              })}
            />
          </IntegrationCard>
          <IntegrationCard title="Anthropic" configured={integrations.anthropic.key.configured}>
            <InfoRow label="API Key" value={integrations.anthropic.key.maskedValue ?? 'No configurada'} />
            <InfoRow label="Modelo activo" value={integrations.anthropic.model} />
            <InfoRow label="Uso estimado" value={integrations.anthropic.estimatedUsage} />
          </IntegrationCard>
          <IntegrationCard title="Fuente de verdad" configured={integrationsReady === 4}>
            <p className="text-sm leading-7 text-zinc-400">Las API keys sensibles no se guardan en base de datos. Este panel solo muestra estado y últimos 4 caracteres.</p>
            <Link href="https://docs.netlify.com/build/configure-builds/environment-variables/" target="_blank" className="inline-flex items-center gap-2 text-sm text-cyan-300"><Globe size={14} /> Guía de Netlify</Link>
          </IntegrationCard>
        </div>
      ),
      pricing: (
        <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400/70">Pricing engine</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Catálogo de módulos premium</h2>
            </div>
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400">{pricing.filter((item) => item.active).length} activos</div>
          </div>
          <div className="space-y-3">
            {pricing.map((row) => (
              <PricingCard key={row.featureKey} row={row} onSave={updatePricing} />
            ))}
          </div>
        </section>
      ),
      team: (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400/70">SUPER_ADMIN</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Equipo interno</h2>
              </div>
              <button type="button" onClick={() => setInviteOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200"><Mail size={15} /> Invitar miembro</button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
                  <div><p className="text-sm font-semibold text-white">{member.name}</p><p className="text-sm text-zinc-500">{member.email}</p></div>
                  <MetaBlock label="Alta" value={member.createdAtLabel} />
                  <MetaBlock label="Último acceso" value={member.lastAccessLabel} />
                  <MetaBlock label="Rol" value="SUPER_ADMIN" cyan />
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.12),transparent_40%),rgba(255,255,255,0.025)] p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400/70">Flujo</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Invitación segura</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">Reutiliza el flujo existente de <code>/accept-invite</code> con token temporal, creación de contraseña y alta como SUPER_ADMIN.</p>
          </section>
        </div>
      ),
      alerts: (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400/70">Alert routing</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Webhook y disparadores</h2>
              </div>
              <button type="button" onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/12 px-4 py-2 text-sm font-semibold text-cyan-200 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Guardar
              </button>
            </div>
            <Field label="Webhook de alertas"><Input value={settings.alertWebhookUrl} placeholder="https://hooks.slack.com/..." onChange={(event) => setSettings((current) => ({ ...current, alertWebhookUrl: event.target.value }))} /></Field>
            <div className="mt-6 space-y-3">
              <ToggleCard label="Nuevo ticket HIGH o URGENT" enabled={settings.alertOnTickets} onClick={() => setSettings((current) => ({ ...current, alertOnTickets: !current.alertOnTickets }))} />
              <ToggleCard label="Nuevo lead de upsell" enabled={settings.alertOnLeads} onClick={() => setSettings((current) => ({ ...current, alertOnLeads: !current.alertOnLeads }))} />
              <ToggleCard label="Cliente sin actividad > 30 días" enabled={settings.alertOnChurn} onClick={() => setSettings((current) => ({ ...current, alertOnChurn: !current.alertOnChurn }))} />
              <ToggleCard label="Suscripción por vencer en < 7 días" enabled={settings.alertOnExpiringSubscriptions} onClick={() => setSettings((current) => ({ ...current, alertOnExpiringSubscriptions: !current.alertOnExpiringSubscriptions }))} />
              <ToggleCard label="Nuevo mensaje de cliente" enabled={settings.alertOnClientMessages} onClick={() => setSettings((current) => ({ ...current, alertOnClientMessages: !current.alertOnClientMessages }))} />
            </div>
            <ActionButton
              busy={testingWebhook}
              icon={<BellRing size={15} />}
              label="Probar webhook"
              secondary
              className="mt-6"
              onClick={() => startTestingWebhook(async () => {
                const result = await testWebhookAction()
                if (result.success) {
                  toast.success(result.data?.message ?? 'Webhook probado.')
                } else {
                  toast.error(result.error ?? 'No se pudo probar el webhook.')
                }
              })}
            />
          </section>
          <section className="rounded-[28px] border border-red-500/15 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_45%),rgba(255,255,255,0.025)] p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-red-300/80">Vista previa</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Formato del mensaje</h2>
            <div className="mt-6 rounded-[24px] border border-white/8 bg-black/30 p-5 font-mono text-sm leading-7 text-zinc-200">
              <p>🚨 [develOP Alert]</p><p>Tipo: Ticket Urgente</p><p>Cliente: Concesionaria San Miguel</p><p>Detalle: 'El formulario no envía'</p><p>Prioridad: ALTA</p><p>Ver en admin: /admin/tickets</p>
            </div>
          </section>
        </div>
      ),
    } as const
  )[tab]

  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,rgba(8,10,12,0.98),rgba(6,8,11,0.92))] p-7 shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">Admin settings</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Configuración de develOP</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">Centro de control para identidad de agencia, integraciones sensibles, precios premium, permisos del equipo y políticas de alerta.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Integraciones" value={`${integrationsReady}/4`} />
              <StatCard label="Módulos activos" value={String(pricing.filter((item) => item.active).length)} />
              <StatCard label="Equipo" value={String(teamMembers.length)} />
            </div>
          </div>
        </section>
        <section className="rounded-[30px] border border-white/8 bg-white/[0.02] p-3">
          <div className="grid gap-2 md:grid-cols-5">
            {tabs.map(([key, label, Icon]) => {
              const active = tab === key
              return (
                <button key={key} type="button" onClick={() => setTab(key)} className={cn('rounded-[22px] border px-4 py-4 text-left transition', active ? 'border-cyan-400/30 bg-cyan-400/[0.12] text-white' : 'border-transparent text-zinc-500 hover:border-white/8 hover:bg-white/[0.03] hover:text-zinc-200')}>
                  <div className="flex items-center gap-3">
                    <span className={cn('rounded-2xl p-2', active ? 'bg-cyan-400/15 text-cyan-200' : 'bg-white/[0.04]')}><Icon size={16} /></span>
                    <p className="text-sm font-semibold">{label}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            {panel}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {inviteOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 22, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }} className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0a0d10] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.7)]">
              <div className="mb-6 flex items-start justify-between">
                <div><p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400/70">Nuevo acceso</p><h2 className="mt-1 text-2xl font-semibold text-white">Invitar miembro</h2></div>
                <button type="button" onClick={() => setInviteOpen(false)} className="rounded-2xl border border-white/10 p-2 text-zinc-400 transition hover:text-white"><X size={16} /></button>
              </div>
              <Field label="Nombre"><Input value={inviteName} onChange={(event) => setInviteName(event.target.value)} /></Field>
              <Field className="mt-4" label="Email"><Input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} /></Field>
              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">Rol asignado: <span className="font-semibold text-cyan-300">SUPER_ADMIN</span></div>
              <button
                type="button"
                disabled={inviting}
                onClick={() => startInviting(async () => {
                  const result = await inviteTeamMemberAction({ email: inviteEmail, name: inviteName })
                  if (!result.success) {
                    toast.error(result.error ?? 'No se pudo enviar la invitación.')
                    return
                  }

                  toast.success(result.data?.message ?? 'Invitación enviada.')
                  setInviteName('')
                  setInviteEmail('')
                  setInviteOpen(false)
                })}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/12 px-4 py-3 text-sm font-semibold text-cyan-100 disabled:opacity-50"
              >
                {inviting ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />} Enviar invitación
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <div className={className}><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p><div className="mt-2">{children}</div></div>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-400/50 focus:bg-white/[0.05]', props.className)} />
}

function StaticValue({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200">{children}</div>
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4"><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p><div className="mt-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">{value}</div></div>
}

function MetaBlock({ label, value, cyan = false }: { label: string; value: string; cyan?: boolean }) {
  return <div><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p><p className={cn('mt-2 text-sm', cyan ? 'text-cyan-300' : 'text-zinc-300')}>{value}</p></div>
}

function IntegrationCard({ title, configured, children }: { title: string; configured: boolean; children: ReactNode }) {
  return <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400/70">{title}</p><h2 className="mt-1 text-xl font-semibold text-white">{title}</h2></div><span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em]', configured ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/25 bg-red-500/10 text-red-300')}><span className={cn('h-2 w-2 rounded-full', configured ? 'bg-emerald-400' : 'bg-red-400')} />{configured ? 'Configurada' : 'No configurada'}</span></div><div className="space-y-4">{children}</div></section>
}

function ActionButton({ busy, icon, label, onClick, secondary = false, className = '' }: { busy: boolean; icon: ReactNode; label: string; onClick: () => void; secondary?: boolean; className?: string }) {
  return <button type="button" onClick={onClick} disabled={busy} className={cn('inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold disabled:opacity-50', secondary ? 'border border-white/10 bg-white/[0.04] text-white' : 'border border-cyan-400/30 bg-cyan-400/10 text-cyan-200', className)}>{busy ? <Loader2 size={15} className="animate-spin" /> : icon}{label}</button>
}

function ToggleCard({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4 text-left"><span className="text-sm text-white">{label}</span><span className={cn('inline-flex h-8 w-14 items-center rounded-full border transition', enabled ? 'border-cyan-400/30 bg-cyan-400/20' : 'border-white/8 bg-white/5')}><span className="h-6 w-6 rounded-full bg-white transition" style={{ transform: enabled ? 'translateX(1.8rem)' : 'translateX(0.2rem)', background: enabled ? '#22d3ee' : '#d4d4d8' }} /></span></button>
}

function PricingCard({ row, onSave }: { row: PricingRow; onSave: (next: PricingRow) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(row.price))

  return (
    <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4 lg:grid-cols-[1.6fr_140px_140px_110px]">
      <div><p className="text-sm font-semibold text-white">{row.name}</p><p className="mt-1 text-sm text-zinc-500">{row.description}</p><p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-600">{row.featureKey}</p></div>
      <div><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Precio</p>{editing ? <input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => { onSave({ ...row, price: Number(draft) }); setEditing(false) }} className="mt-2 w-full rounded-xl border border-cyan-400/30 bg-cyan-500/8 px-3 py-2 text-sm text-white outline-none" /> : <button type="button" onClick={() => setEditing(true)} className="mt-2 w-full rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left text-sm font-semibold text-cyan-300">USD {row.price.toFixed(0)}</button>}</div>
      <div><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Tipo</p><button type="button" onClick={() => onSave({ ...row, type: row.type === 'monthly' ? 'one-time' : 'monthly' })} className="mt-2 w-full rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200">{row.type === 'monthly' ? 'Mensual' : 'Único'}</button></div>
      <div><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Activo</p><button type="button" onClick={() => onSave({ ...row, active: !row.active })} className={cn('mt-2 w-full rounded-xl border px-3 py-2 text-sm font-medium', row.active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-zinc-700 bg-zinc-900/80 text-zinc-400')}>{row.active ? 'Activo' : 'Pausado'}</button></div>
    </div>
  )
}
