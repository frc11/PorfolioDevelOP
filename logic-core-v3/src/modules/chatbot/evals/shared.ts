/**
 * Q1.1 — Constantes y helpers compartidos del corredor de conversaciones
 * doradas (evals). Sin estado, sin Prisma, sin efectos de import: sólo datos
 * y funciones puras que consumen `seed-eval-bots.ts`, `cleanup.ts` y `runner.ts`.
 *
 * NO evalúa nada. Este bloque (Q1.1) sólo EJECUTA y CAPTURA; el scoring es Q1.2.
 */

/** Claves de pack que cubre el corredor. Espejo de `VerticalPackKey`. */
export type EvalPackKey = 'base' | 'usados' | 'agencia'

export const EVAL_PACKS: readonly EvalPackKey[] = ['base', 'usados', 'agencia']

/**
 * Bots QA dedicados (uno por pack). Slugs estables — el seed
 * (`seed-eval-bots.ts`) los crea `isActive:true` con el `verticalPack`
 * correspondiente; el corredor apunta a ellos por slug. NO son bots de
 * clientes reales (matsu, etc.) ni demos (sanmiguel, develop).
 */
export const EVAL_BOT_SLUGS: Record<EvalPackKey, { orgSlug: string; botSlug: string }> = {
  base: { orgSlug: 'qa-evals-base', botSlug: 'qaseed-evals-base' },
  usados: { orgSlug: 'qa-evals-usados', botSlug: 'qaseed-evals-usados' },
  agencia: { orgSlug: 'qa-evals-agencia', botSlug: 'qaseed-evals-agencia' },
}

/**
 * Prefijo de `sessionId` de TODA fila creada por el corredor. Es la marca de
 * cleanup: `cleanup.ts` borra exactamente lo que arranca con este prefijo
 * (patrón `scripts/regression/purge.ts`).
 */
export const SESSION_PREFIX = 'evals-'

/**
 * Guard de host dev-only. Host EXACTO de la branch Neon dev (no substring:
 * un `===` no puede matchear por accidente una URL de prod que contenga el
 * slug). Igual constante que `scripts/regression/purge.ts`.
 */
export const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech'

/** Plan destino de las orgs QA: el top existente (todas las tools + mayor quota). */
export const TARGET_PLAN_KEY = 'BUSINESS' as const

/** Dev server QA: `npm run dev:qa` levanta en 3002 con QA_ALLOW_LOCALHOST=1. */
export const DEFAULT_BASE_URL = process.env.EVALS_BASE_URL ?? 'http://localhost:3002'
export const DEFAULT_ORIGIN = process.env.EVALS_ORIGIN ?? DEFAULT_BASE_URL

/**
 * Aborta el proceso si `DATABASE_URL` no apunta a la branch Neon dev.
 * Corre a nivel top-level de cada entry ANTES de instanciar Prisma.
 */
export function guardDevHost(): void {
  const url = process.env.DATABASE_URL ?? ''
  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown)'
  if (host !== EXPECTED_DEV_HOST) {
    console.error(
      `[evals] ABORT: DATABASE_URL host "${host}" no coincide con la branch Neon dev.\n` +
        `        (esperado: ${EXPECTED_DEV_HOST})`,
    )
    process.exit(1)
  }
}

/** `true` si el arg está presente en `process.argv`. */
export function hasFlag(flag: string): boolean {
  return process.argv.includes(flag)
}

/** Valor de un flag `--k v` o `--k=v`; `null` si ausente. */
export function flagValue(flag: string): string | null {
  const argv = process.argv
  const eq = argv.find((a) => a.startsWith(`${flag}=`))
  if (eq) return eq.slice(flag.length + 1)
  const i = argv.indexOf(flag)
  if (i !== -1 && i + 1 < argv.length) return argv[i + 1]
  return null
}
