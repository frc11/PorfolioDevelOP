'use client'

import { useMemo } from 'react'
import { OportunidadSEO, type OportunidadSEOProps } from './OportunidadSEO'
import type { SearchConsoleData } from '@/lib/searchconsole'
import { Lightbulb } from 'lucide-react'

type OportunidadDef = Omit<OportunidadSEOProps, 'index'>

export function OportunidadesSEO({ data }: { data: SearchConsoleData }) {
  const oportunidades = useMemo<OportunidadDef[]>(() => {
    const lista: OportunidadDef[] = []

    // ── Oportunidad 1: keywords con muchas impresiones pero CTR bajo (< 3%) ──
    const lowCtr = data.topQueries
      .filter((q) => q.impressions >= 100 && q.ctr < 3)
      .sort((a, b) => b.impressions - a.impressions)[0]

    if (lowCtr) {
      lista.push({
        impacto: 'ALTO',
        titulo: 'Palabras clave con potencial sin explotar',
        descripcion: `Aparecés en Google para "${lowCtr.query}" pero casi nadie entra (CTR: ${lowCtr.ctr}%). Con un mejor título en esa página podés triplicar las visitas.`,
        ctaLabel: 'Quiero mejorar esto',
        mensajeAdmin: `El cliente solicitó mejora de SEO: Optimizar el título y meta descripción para la keyword "${lowCtr.query}" que tiene ${lowCtr.impressions.toLocaleString('es-AR')} impresiones pero solo ${lowCtr.ctr}% de CTR.`,
      })
    }

    // ── Oportunidad 2: keywords en posición 4-10 (cerca del top 3) ──
    const nearTop = data.topQueries
      .filter((q) => q.position >= 4 && q.position <= 10)
      .sort((a, b) => a.position - b.position)[0]

    if (nearTop) {
      lista.push({
        impacto: 'MEDIO',
        titulo: 'Estás a un paso del top 3',
        descripcion: `Para "${nearTop.query}" estás en posición #${nearTop.position.toFixed(1)}. Con un pequeño empujón podés estar en el top 3 y multiplicar los clicks.`,
        ctaLabel: 'Quiero subir al top 3',
        mensajeAdmin: `El cliente solicitó mejora de SEO: Subir al top 3 la keyword "${nearTop.query}" que actualmente está en posición #${nearTop.position.toFixed(1)}.`,
      })
    }

    // ── Oportunidad 3: posición promedio > 15 ──
    if (data.avgPosition > 15) {
      lista.push({
        impacto: 'URGENTE',
        titulo: 'Tu competencia aparece antes que vos',
        descripcion: `En promedio aparecés en la posición #${data.avgPosition.toFixed(0)} de Google. Tus competidores en Tucumán están captando esos clientes.`,
        ctaLabel: 'Quiero aparecer primero',
        mensajeAdmin: `El cliente solicitó mejora de SEO: Mejorar posición promedio en Google. Actualmente está en posición #${data.avgPosition.toFixed(0)} y quiere aparecer en las primeras posiciones.`,
      })
    }

    return lista
  }, [data])

  if (oportunidades.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
          <Lightbulb size={15} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Oportunidades Detectadas</h2>
          <p className="text-[11px] text-zinc-500">
            Acciones concretas para mejorar tu posicionamiento
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {oportunidades.map((op, i) => (
          <OportunidadSEO key={`${op.impacto}-${i}`} {...op} index={i} />
        ))}
      </div>
    </div>
  )
}
