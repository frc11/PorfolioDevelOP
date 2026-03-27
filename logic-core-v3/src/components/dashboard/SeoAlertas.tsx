'use client'

import { useMemo } from 'react'
import { AlertaMetrica, type AlertaMetricaProps } from './AlertaMetrica'
import type { SearchConsoleData } from '@/lib/searchconsole'

const PRIORITY: Record<string, number> = { DANGER: 0, WARNING: 1, INFO: 2, SUCCESS: 3 }

export function SeoAlertas({ data }: { data: SearchConsoleData }) {
  const alertas = useMemo<AlertaMetricaProps[]>(() => {
    const lista: AlertaMetricaProps[] = []

    // Posición promedio > 20 → DANGER
    if (data.avgPosition > 20) {
      lista.push({
        tipo: 'DANGER',
        titulo: 'Posición en Google muy baja',
        descripcion: `Tu posición promedio en Google es #${data.avgPosition.toFixed(0)}. Estás en la segunda página o más abajo. La mayoría de los clicks van a las primeras 3 posiciones.`,
        accion: { label: 'Mejorar mi SEO', href: '/dashboard/messages' },
      })
    }

    // CTR < 2% → WARNING
    if (data.avgCtr < 2) {
      lista.push({
        tipo: 'WARNING',
        titulo: 'CTR bajo — la gente no entra',
        descripcion: `Tu tasa de clicks es del ${data.avgCtr.toFixed(1)}%. Tu sitio aparece en Google pero la gente no entra. Los títulos y descripciones necesitan mejora.`,
        accion: { label: 'Optimizar títulos', href: '/dashboard/messages' },
      })
    }

    // Keywords en top 3 → SUCCESS
    const top3 = data.topQueries.filter((q) => q.position <= 3).length
    if (top3 > 0) {
      lista.push({
        tipo: 'SUCCESS',
        titulo: `${top3} palabra${top3 > 1 ? 's clave' : ' clave'} en el top 3`,
        descripcion: `Tenés ${top3} palabra${top3 > 1 ? 's clave' : ' clave'} en el top 3 de Google. ¡Eso es tráfico gratuito garantizado!`,
      })
    }

    return lista.sort((a, b) => PRIORITY[a.tipo] - PRIORITY[b.tipo]).slice(0, 2)
  }, [data])

  if (alertas.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {alertas.map((a, i) => (
        <AlertaMetrica key={`${a.tipo}-${i}`} {...a} />
      ))}
    </div>
  )
}
