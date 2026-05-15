'use client'

import { useState, useTransition } from 'react'
import { saveKnowledgeBase } from '../../server/admin/saveKnowledgeBase'
import { saveKnowledgeBaseByOrgSlug } from '../../server/admin/saveKnowledgeBaseByOrgSlug'

interface KnowledgeBaseEditorProps {
  botConfigId: string
  initialData: {
    businessInfo: string
    servicesOrProducts: string
    faq: string
    policies: string
    salesGuidance: string
    toneExamples: string
    forbiddenStatements: string
  }
  orgSlug?: string
}

const SECTIONS = [
  {
    key: 'businessInfo',
    label: 'Información del negocio',
    placeholder: 'Quiénes son, dónde están, qué hacen, contactos básicos...',
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
    placeholder: 'Q&A en formato markdown. Usá **negritas** para preguntas.',
    rows: 15,
  },
  {
    key: 'policies',
    label: 'Políticas y condiciones',
    placeholder: 'Horarios, políticas de pago, garantías, devoluciones...',
    rows: 8,
  },
  {
    key: 'salesGuidance',
    label: 'Guía de derivación a ventas',
    placeholder: 'Cuándo derivar, cómo derivar, qué información capturar...',
    rows: 8,
  },
  {
    key: 'toneExamples',
    label: 'Ejemplos de tono y estilo',
    placeholder: 'Ejemplos concretos de cómo debe sonar el bot...',
    rows: 8,
  },
  {
    key: 'forbiddenStatements',
    label: 'Frases prohibidas (anti-alucinación)',
    placeholder: 'Cosas que el bot NUNCA debe decir, específicas de este negocio...',
    rows: 6,
  },
] as const

export function KnowledgeBaseEditor({ botConfigId, initialData, orgSlug }: KnowledgeBaseEditorProps) {
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSave = () => {
    setStatus('idle')
    setErrorMsg(null)
    startTransition(async () => {
      const result = orgSlug
        ? await saveKnowledgeBaseByOrgSlug({ orgSlug, ...data })
        : await saveKnowledgeBase({ botConfigId, ...data })

      if (result.success) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
        setErrorMsg(result.error ?? 'Error desconocido')
      }
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur py-4 z-10">
        <h1 className="text-2xl font-light">Knowledge Base</h1>
        <div className="flex items-center gap-3">
          {status === 'saved' && <span className="text-xs text-emerald-400">Guardado ✓</span>}
          {status === 'error' && <span className="text-xs text-red-400">Error: {errorMsg}</span>}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.key} className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">{section.label}</label>
          <textarea
            value={data[section.key as keyof typeof data]}
            onChange={(e) => setData({ ...data, [section.key]: e.target.value })}
            rows={section.rows}
            placeholder={section.placeholder}
            className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-100 resize-y focus:outline-none focus:border-cyan-500/50"
          />
          <div className="text-[10px] text-zinc-500 text-right">
            {data[section.key as keyof typeof data].length} chars
          </div>
        </div>
      ))}
    </div>
  )
}
