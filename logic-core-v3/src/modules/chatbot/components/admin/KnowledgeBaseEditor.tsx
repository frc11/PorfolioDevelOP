'use client'

import { useMemo, useState } from 'react'
import { FlaskConical, Save } from 'lucide-react'
import { toast } from 'sonner'
import { estimateTokensFromKB } from '@/lib/tokens-estimate'
import { validateKB } from '@/modules/chatbot/server/admin/validateKB'
import { saveKnowledgeBase } from '../../server/admin/saveKnowledgeBase'
import { saveKnowledgeBaseByOrgSlug } from '../../server/admin/saveKnowledgeBaseByOrgSlug'
import { KBSearch } from './kb/KBSearch'
import { KBValidation } from './kb/KBValidation'
import { MarkdownEditor } from './kb/MarkdownEditor'
import { SaveConfirmModal } from './kb/SaveConfirmModal'
import { TestPromptSandbox } from './kb/TestPromptSandbox'

type KnowledgeBaseData = {
  businessInfo: string
  servicesOrProducts: string
  faq: string
  policies: string
  salesGuidance: string
  toneExamples: string
  forbiddenStatements: string
}

interface KnowledgeBaseEditorProps {
  botConfigId: string
  initialData: KnowledgeBaseData
  orgSlug?: string
  botName?: string
  tone?: string
  companyName?: string
}

const SECTIONS = [
  {
    key: 'businessInfo',
    label: 'Informacion del negocio',
    placeholder: 'Quienes son, donde estan, que hacen, contactos basicos...',
    rows: 10,
  },
  {
    key: 'servicesOrProducts',
    label: 'Servicios o productos',
    placeholder: 'Detalle de cada servicio/producto, precios base, tiempos...',
    rows: 15,
  },
  {
    key: 'faq',
    label: 'Preguntas frecuentes',
    placeholder: 'Q&A en formato markdown. Usa **negritas** para preguntas.',
    rows: 15,
  },
  {
    key: 'policies',
    label: 'Politicas y condiciones',
    placeholder: 'Horarios, politicas de pago, garantias, devoluciones...',
    rows: 8,
  },
  {
    key: 'salesGuidance',
    label: 'Guia de derivacion a ventas',
    placeholder: 'Cuando derivar, como derivar, que informacion capturar...',
    rows: 8,
  },
  {
    key: 'toneExamples',
    label: 'Ejemplos de tono y estilo',
    placeholder: 'Ejemplos concretos de como debe sonar el bot...',
    rows: 8,
  },
  {
    key: 'forbiddenStatements',
    label: 'Frases prohibidas',
    placeholder: 'Cosas que el bot NUNCA debe decir, especificas de este negocio...',
    rows: 6,
  },
] as const

const SECTION_LABELS = Object.fromEntries(SECTIONS.map((section) => [section.key, section.label]))

function normalizeKB(input: KnowledgeBaseData): KnowledgeBaseData {
  return {
    businessInfo: input.businessInfo ?? '',
    servicesOrProducts: input.servicesOrProducts ?? '',
    faq: input.faq ?? '',
    policies: input.policies ?? '',
    salesGuidance: input.salesGuidance ?? '',
    toneExamples: input.toneExamples ?? '',
    forbiddenStatements: input.forbiddenStatements ?? '',
  }
}

export function KnowledgeBaseEditor({
  botConfigId,
  initialData,
  orgSlug,
  botName = 'Asistente',
  tone = 'informal_rioplatense',
  companyName,
}: KnowledgeBaseEditorProps) {
  const [originalKB, setOriginalKB] = useState<KnowledgeBaseData>(() => normalizeKB(initialData))
  const [kb, setKb] = useState<KnowledgeBaseData>(() => normalizeKB(initialData))
  const [activeSection, setActiveSection] = useState<string>('businessInfo')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSandbox, setShowSandbox] = useState(false)
  const [saving, setSaving] = useState(false)

  const kbRecord = kb as Record<string, string>
  const originalKBRecord = originalKB as Record<string, string>
  const totalTokens = useMemo(() => estimateTokensFromKB(kbRecord), [kbRecord])
  const issues = useMemo(() => validateKB(kbRecord), [kbRecord])
  const hasChanges = useMemo(
    () => SECTIONS.some((section) => kb[section.key] !== originalKB[section.key]),
    [kb, originalKB],
  )

  function updateSection(section: keyof KnowledgeBaseData, value: string) {
    setKb((prev) => ({ ...prev, [section]: value }))
  }

  function handleJumpToSection(section: string) {
    setActiveSection(section)
    document.getElementById(`kb-section-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...kb }

    const promise = (orgSlug
      ? saveKnowledgeBaseByOrgSlug({ orgSlug, ...payload })
      : saveKnowledgeBase({ botConfigId, ...payload })
    ).then((result) => {
      if (!result.success) {
        throw new Error(result.error ?? 'Error guardando')
      }
      setOriginalKB(payload)
      setShowConfirm(false)
      return result
    })

    toast.promise(promise, {
      loading: 'Guardando KB...',
      success: 'KB guardada correctamente',
      error: (error: Error) => `Error: ${error.message}`,
    })

    try {
      await promise
    } catch {
      // toast.promise ya muestra el error.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {/* Card glass (no barra negra plana): bg frosted oscuro + blur fuerte
              para que el contenido al scrollear se lea como vidrio esmerilado y
              no "se cuele" detrás; borde completo + rounded + shadow para
              separarla al quedar sticky. z-20 sobre las secciones. */}
          <div className="sticky top-0 z-20 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-zinc-950/75 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur-[20px] backdrop-saturate-[180%] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-light text-zinc-100">
                Knowledge Base
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                ~{totalTokens} tokens estimados en total
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowSandbox(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] px-4 py-2 text-sm text-violet-300 hover:bg-violet-500/[0.12]"
              >
                <FlaskConical className="h-4 w-4" strokeWidth={1.5} />
                Probar prompt
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={!hasChanges || saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-300 disabled:opacity-50"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} />
                Guardar cambios
              </button>
            </div>
          </div>

          {SECTIONS.map(({ key, label, placeholder, rows }) => (
            <div key={key} id={`kb-section-${key}`} className="scroll-mt-28">
              <p
                className={`mb-2 text-[10px] uppercase tracking-[0.24em] ${
                  activeSection === key ? 'text-cyan-300' : 'text-cyan-500'
                }`}
              >
                {label}
              </p>
              <MarkdownEditor
                value={kb[key]}
                onChange={(value) => updateSection(key, value)}
                placeholder={placeholder}
                rows={rows}
              />
            </div>
          ))}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Busqueda
            </p>
            <KBSearch kb={kbRecord} sectionLabels={SECTION_LABELS} onJumpToSection={handleJumpToSection} />
          </div>

          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Validacion
            </p>
            <KBValidation issues={issues} />
          </div>
        </aside>
      </div>

      <SaveConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSave}
        oldKB={originalKBRecord}
        newKB={kbRecord}
        sectionLabels={SECTION_LABELS}
        loading={saving}
      />

      <TestPromptSandbox
        kb={kbRecord}
        botName={botName}
        tone={tone}
        companyName={companyName}
        open={showSandbox}
        onClose={() => setShowSandbox(false)}
      />
    </div>
  )
}
