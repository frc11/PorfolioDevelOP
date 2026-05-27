'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, TestTube } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { saveCrmIntegration } from '@/modules/chatbot/server/admin/integrations/saveCrmIntegration'
import { testCrmConnection } from '@/modules/chatbot/server/admin/integrations/testCrmConnection'

interface CrmConfigFormProps {
  organizationId: string
  initial: {
    webhookUrl: string
    enabled: boolean
    secretHeaderName: string | null
    secretConfigured: boolean
  } | null
  encryptionAvailable: boolean
}

export function CrmConfigForm({ organizationId, initial, encryptionAvailable }: CrmConfigFormProps) {
  const [webhookUrl, setWebhookUrl] = useState(initial?.webhookUrl ?? '')
  const [enabled, setEnabled] = useState(initial?.enabled ?? false)
  const [secretHeaderName, setSecretHeaderName] = useState(
    initial?.secretHeaderName ?? '',
  )
  const [editingSecret, setEditingSecret] = useState(false)
  const [secretValue, setSecretValue] = useState('')
  const [revealSecret, setRevealSecret] = useState(false)
  const [pendingSave, startSave] = useTransition()
  const [pendingTest, startTest] = useTransition()

  const hasIntegration = initial !== null
  const canTest = hasIntegration && webhookUrl.length > 0

  function handleSave() {
    startSave(async () => {
      let secret: string | null | undefined
      if (editingSecret) {
        secret = secretValue.length > 0 ? secretValue : null
      } else {
        secret = undefined
      }

      const result = await saveCrmIntegration({
        organizationId,
        webhookUrl: webhookUrl.trim(),
        enabled,
        secretHeaderName:
          secretHeaderName.trim().length > 0 ? secretHeaderName.trim() : null,
        secret,
      })

      if (result.ok) {
        toast.success('Integración guardada')
        setEditingSecret(false)
        setSecretValue('')
        setRevealSecret(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleTest() {
    startTest(async () => {
      const result = await testCrmConnection({ organizationId })
      if (result.ok) {
        toast.success(
          `Conexión OK — HTTP ${result.httpStatus} · ${result.durationMs}ms`,
        )
      } else {
        toast.error(`Conexión falló: ${result.error}`)
      }
    })
  }

  return (
    <div className="space-y-5">
      <Field
        label="URL del webhook n8n"
        required
        hint="Solo HTTPS. El webhook va a recibir un POST por cada lead nuevo."
      >
        <Input
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://tu-n8n.com/webhook/abc-123"
          autoComplete="off"
          spellCheck={false}
          aria-label="URL del webhook n8n"
        />
      </Field>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-200">Sync activo</div>
          <div className="text-xs text-zinc-500">
            Si está apagado, los leads se guardan pero no se mandan a n8n.
          </div>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} label="Sync activo" />
      </div>

      <div className="space-y-3 border-t border-white/[0.06] pt-5">
        <div>
          <div className="text-sm font-medium text-zinc-200">
            Header de autenticación
            <span className="ml-2 text-xs font-normal text-zinc-500">(opcional)</span>
          </div>
          <div className="text-xs text-zinc-500">
            {encryptionAvailable
              ? 'Si el webhook requiere un header de auth (ej. X-Webhook-Secret), configurálo acá. Se guarda cifrado.'
              : 'No disponible: el cifrado de secrets no está configurado (CRM_SECRET_KEY ausente). La URL la podés guardar igual.'}
          </div>
        </div>

        <Field label="Nombre del header">
          <Input
            value={secretHeaderName}
            onChange={(e) => setSecretHeaderName(e.target.value)}
            placeholder="X-Webhook-Secret"
            disabled={!encryptionAvailable}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>

        {!editingSecret ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-zinc-400">
              {initial?.secretConfigured
                ? '🔒 Secret configurado'
                : 'Sin secret configurado'}
            </span>
            {encryptionAvailable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSecret(true)}
              >
                {initial?.secretConfigured ? 'Cambiar' : 'Configurar'}
              </Button>
            )}
          </div>
        ) : (
          <Field
            label="Valor del secret"
            hint="Se cifra antes de guardar. Dejá en blanco para borrar el secret existente."
          >
            <div className="flex items-center gap-2">
              <Input
                type={revealSecret ? 'text' : 'password'}
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevealSecret((v) => !v)}
                aria-label={revealSecret ? 'Ocultar secret' : 'Mostrar secret'}
              >
                {revealSecret ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingSecret(false)
                  setSecretValue('')
                  setRevealSecret(false)
                }}
              >
                Cancelar
              </Button>
            </div>
          </Field>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={pendingSave || webhookUrl.trim().length === 0}
          loading={pendingSave}
        >
          {pendingSave ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button
          variant="secondary"
          onClick={handleTest}
          disabled={pendingTest || !canTest}
          loading={pendingTest}
          icon={<TestTube className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        >
          {pendingTest ? 'Probando…' : 'Probar conexión'}
        </Button>
      </div>
    </div>
  )
}
