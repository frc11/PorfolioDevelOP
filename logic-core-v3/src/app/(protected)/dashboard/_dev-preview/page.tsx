/**
 * /dashboard/_dev-preview — Server component for isolated visual QA.
 *
 * Renders HealthScore under all three states by injecting mock HealthScoreResult
 * values directly, bypassing the cache and DB. Safe to delete before production.
 *
 * Route access: any authenticated user (dashboard layout wraps this).
 */

import type { HealthScoreResult } from '@/lib/health-score'
import { HealthScore } from '@/components/dashboard/home/HealthScore'

// ─── Mock data factories ──────────────────────────────────────────────────────

const NOW = new Date()

function makeOnboarding(): HealthScoreResult {
  return {
    total: 0,
    level: 'ONBOARDING',
    connectionPercentage: 0,
    connectedSources: 0,
    totalSources: 6,
    dimensions: [
      { key: 'digital', label: 'Salud Digital', score: 0, weight: 0.4, metricsAvailable: 0, metricsTotal: 3 },
      { key: 'commercial', label: 'Salud Comercial', score: 0, weight: 0.35, metricsAvailable: 0, metricsTotal: 3 },
      { key: 'operational', label: 'Salud Operativa', score: 0, weight: 0.25, metricsAvailable: 0, metricsTotal: 3 },
    ],
    trend: { value: 0, direction: 'flat' },
    computedAt: NOW,
    cachedFrom: null,
  }
}

function makePartial(): HealthScoreResult {
  return {
    total: 62,
    level: 'PARTIAL',
    connectionPercentage: 33,
    connectedSources: 2,
    totalSources: 6,
    dimensions: [
      { key: 'digital', label: 'Salud Digital', score: 71, weight: 0.4, metricsAvailable: 2, metricsTotal: 3 },
      { key: 'commercial', label: 'Salud Comercial', score: 55, weight: 0.35, metricsAvailable: 1, metricsTotal: 3 },
      { key: 'operational', label: 'Salud Operativa', score: 0, weight: 0.25, metricsAvailable: 0, metricsTotal: 3 },
    ],
    trend: { value: 4, direction: 'up' },
    computedAt: NOW,
    cachedFrom: null,
  }
}

function makeComplete(): HealthScoreResult {
  return {
    total: 84,
    level: 'COMPLETE',
    connectionPercentage: 83,
    connectedSources: 5,
    totalSources: 6,
    dimensions: [
      { key: 'digital', label: 'Salud Digital', score: 91, weight: 0.4, metricsAvailable: 3, metricsTotal: 3 },
      { key: 'commercial', label: 'Salud Comercial', score: 78, weight: 0.35, metricsAvailable: 3, metricsTotal: 3 },
      { key: 'operational', label: 'Salud Operativa', score: 82, weight: 0.25, metricsAvailable: 3, metricsTotal: 3 },
    ],
    trend: { value: 7, direction: 'up' },
    computedAt: NOW,
    cachedFrom: null,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HealthScoreDevPreview() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 sm:p-10 space-y-10 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="border-b border-white/10 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-1">
          Dev Preview · Remove before release
        </p>
        <h1 className="text-2xl font-black text-white">HealthScore Component QA</h1>
        <p className="text-sm text-zinc-500 mt-1">
          All three connection-level states rendered with mock data. No DB queries.
        </p>
      </div>

      {/* ONBOARDING */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-3">
          Estado: ONBOARDING (0 fuentes)
        </p>
        <HealthScore data={makeOnboarding()} />
      </section>

      {/* PARTIAL */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-3">
          Estado: PARTIAL (2 de 6 fuentes)
        </p>
        <HealthScore data={makePartial()} />
      </section>

      {/* COMPLETE */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-3">
          Estado: COMPLETE (5 de 6 fuentes)
        </p>
        <HealthScore data={makeComplete()} />
      </section>
    </div>
  )
}
