'use client'

import { useState } from 'react'
import { saveClientKnowledgeBase } from '@/modules/chatbot/server/admin/saveClientKnowledgeBase'
import type { KnowledgeBase } from '@prisma/client'
import { toast } from 'sonner'

export function ClientKnowledgeForm({ kb }: { kb: KnowledgeBase }) {
  const [businessInfo, setBusinessInfo] = useState(kb.businessInfo)
  const [servicesOrProducts, setServicesOrProducts] = useState(kb.servicesOrProducts)
  const [faq, setFaq] = useState(kb.faq)
  const [policies, setPolicies] = useState(kb.policies)
  const [salesGuidance, setSalesGuidance] = useState(kb.salesGuidance)

  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const promise = saveClientKnowledgeBase({
        businessInfo,
        servicesOrProducts,
        faq,
        policies,
        salesGuidance,
      }).then(res => {
        if (!res.ok) throw new Error(res.error ?? 'Error desconocido')
        return res
      })
      
      toast.promise(promise, {
        loading: 'Guardando conocimientos...',
        success: 'Base de conocimiento actualizada',
        error: (err) => `No se pudo guardar: ${err.message}`
      })
      
      await promise
    } catch (e) {
      // toast handles error notification
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8 bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
      
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-2">Información de Negocio</h2>
        <p className="text-xs text-zinc-500 mb-3">Quiénes son, dónde están, datos generales.</p>
        <textarea
          value={businessInfo}
          onChange={(e) => setBusinessInfo(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm font-mono"
          rows={5}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-2">Servicios o Productos</h2>
        <p className="text-xs text-zinc-500 mb-3">Lista detallada de lo que ofrecen y sus precios.</p>
        <textarea
          value={servicesOrProducts}
          onChange={(e) => setServicesOrProducts(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm font-mono"
          rows={6}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-2">Preguntas Frecuentes (FAQ)</h2>
        <p className="text-xs text-zinc-500 mb-3">Respuestas a las dudas más comunes de los clientes.</p>
        <textarea
          value={faq}
          onChange={(e) => setFaq(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm font-mono"
          rows={5}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-2">Políticas</h2>
        <p className="text-xs text-zinc-500 mb-3">Reglas, condiciones comerciales, envíos, devoluciones.</p>
        <textarea
          value={policies}
          onChange={(e) => setPolicies(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm font-mono"
          rows={4}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-2">Guía de Derivación / Ventas</h2>
        <p className="text-xs text-zinc-500 mb-3">Cómo identificar leads listos y cuándo derivarlos a un humano.</p>
        <textarea
          value={salesGuidance}
          onChange={(e) => setSalesGuidance(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm font-mono"
          rows={4}
        />
      </div>

      {/* Read Only fields managed by admin */}
      <div className="pt-6 border-t border-zinc-800 space-y-6 opacity-70">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-base font-semibold text-zinc-400">Ejemplos de Tono</h2>
            <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded">Configurado por develOP</span>
          </div>
          <textarea
            value={kb.toneExamples}
            readOnly
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800/50 rounded text-zinc-500 text-sm font-mono cursor-not-allowed"
            rows={3}
          />
        </div>
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-base font-semibold text-zinc-400">Frases Prohibidas</h2>
            <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded">Configurado por develOP</span>
          </div>
          <textarea
            value={kb.forbiddenStatements}
            readOnly
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800/50 rounded text-zinc-500 text-sm font-mono cursor-not-allowed"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-cyan-500 text-zinc-950 rounded font-medium disabled:opacity-40"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
