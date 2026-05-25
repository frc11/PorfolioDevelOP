export interface BusinessMetrics {
  conversations: number
  leads: number
  estimatedValue: number
  responseRate: number
  avgResponseSeconds: number
}

export function toBusinessMetrics(input: {
  monthlyConversations: number
  capturedLeads: number
  leadValueUSD?: number
  avgLatencyMs?: number
  successRate?: number
}): BusinessMetrics {
  return {
    conversations: input.monthlyConversations,
    leads: input.capturedLeads,
    estimatedValue: (input.capturedLeads ?? 0) * (input.leadValueUSD ?? 50),
    responseRate: Math.round((input.successRate ?? 0.95) * 100),
    avgResponseSeconds: Math.round((input.avgLatencyMs ?? 1500) / 100) / 10,
  }
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`
  return `$${amount.toLocaleString('es-AR')}`
}

export function formatConversationCount(count: number): string {
  if (count === 0) return 'Ninguna todavía'
  if (count === 1) return '1 conversación'
  if (count < 1000) return `${count} conversaciones`
  return `${(count / 1000).toFixed(1)}k conversaciones`
}

export function formatResponseTime(seconds: number): string {
  if (seconds < 1) return 'menos de 1s'
  if (seconds < 5) return `${seconds.toFixed(1)}s`
  return `${Math.round(seconds)}s`
}

export function generateBusinessSummary(metrics: BusinessMetrics): string {
  if (metrics.conversations === 0) {
    return 'Tu bot está listo para empezar a captar oportunidades.'
  }
  if (metrics.leads === 0) {
    return `${metrics.conversations} personas charlaron con tu bot. Capturando datos.`
  }
  return `Tu bot capturó ${metrics.leads} oportunidad${metrics.leads !== 1 ? 'es' : ''} este mes. Revisalas en "Mis leads".`
}
