'use client'

import { useMemo } from 'react'
import { AlertaMetrica, type AlertaMetricaProps } from './AlertaMetrica'
import type { AnalyticsData } from '@/lib/analytics'

const PRIORITY: Record<string, number> = { DANGER: 0, WARNING: 1, INFO: 2, SUCCESS: 3 }

export function AnalyticsAlertas({ data }: { data: AnalyticsData }) {
  const alertas = useMemo<AlertaMetricaProps[]>(() => {
    const lista: AlertaMetricaProps[] = []

    // Tasa de rebote > 60% → DANGER
    if (data.bounceRate > 60) {
      lista.push({
        tipo: 'DANGER',
        titulo: 'Tasa de rebote alta',
        descripcion: `Tu tasa de rebote es del ${data.bounceRate.toFixed(1)}%. Muchos visitantes se van sin interactuar. Revisemos el contenido de tu página principal.`,
        accion: { label: 'Hablar con el equipo', href: '/dashboard/messages?context=default' },
      })
    }

    // Tendencia de sesiones: comparamos primera vs segunda mitad del período
    if (data.dailySessions.length >= 10) {
      const half = Math.floor(data.dailySessions.length / 2)
      const firstSlice = data.dailySessions.slice(0, half)
      const secondSlice = data.dailySessions.slice(half)
      const avgFirst = firstSlice.reduce((s, d) => s + d.sessions, 0) / firstSlice.length
      const avgSecond = secondSlice.reduce((s, d) => s + d.sessions, 0) / secondSlice.length
      const changePct = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0

      if (changePct < -20) {
        lista.push({
          tipo: 'WARNING',
          titulo: 'Caída en visitas detectada',
          descripcion: `Tus visitas bajaron ${Math.abs(changePct).toFixed(0)}% este mes. Puede ser estacional o indicar un problema. Te recomendamos revisar.`,
        })
      } else if (changePct > 15) {
        lista.push({
          tipo: 'SUCCESS',
          titulo: '¡Tus visitas están creciendo!',
          descripcion: `Tus visitas crecieron ${changePct.toFixed(0)}% este mes. El trabajo de posicionamiento está dando resultados.`,
        })
      }
    }

    // Duración promedio < 60s → INFO
    if (data.avgSessionDurationSec < 60) {
      lista.push({
        tipo: 'INFO',
        titulo: 'Tiempo en sitio bajo',
        descripcion:
          'Los visitantes pasan poco tiempo en tu sitio. Podría mejorar con mejor contenido o velocidad de carga.',
        accion: { label: 'Ver recomendaciones', href: '/dashboard/messages?context=default' },
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
