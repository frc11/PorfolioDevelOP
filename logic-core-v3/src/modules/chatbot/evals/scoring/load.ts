/**
 * Q1.2 — Carga y validación del `results/<ISO>.json` de Q1.1. Sin red.
 *
 * `../types.ts` no exporta un Zod de salida (solo valida el input de escenarios),
 * así que acá se valida el SUBCONJUNTO que el evaluador consume, con
 * `.passthrough()` para no romper si Q1.1 agrega campos. Tras validar la forma,
 * se castea el objeto (`unknown → RunResult`); la fuente de verdad del tipo sigue
 * siendo `../types.ts`.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import type { RunResult } from '../types'

const SCORING_DIR = dirname(fileURLToPath(import.meta.url))
export const RESULTS_DIR = join(SCORING_DIR, '..', 'results')
export const REPORTS_DIR = join(SCORING_DIR, '..', 'reports')

const TURN_SHAPE = z
  .object({
    userMessage: z.string(),
    assistantText: z.string(),
    wireText: z.string(),
    toolCalls: z.array(z.object({ toolName: z.string() }).passthrough()),
    intentDetectedOffline: z.string().nullable(),
    degraded: z.unknown(),
    error: z.string().nullable(),
  })
  .passthrough()

const SCENARIO_SHAPE = z
  .object({
    id: z.string(),
    pack: z.string(),
    description: z.string(),
    expectations: z.object({}).passthrough(),
    turns: z.array(TURN_SHAPE),
    error: z.string().nullable(),
  })
  .passthrough()

const RUN_RESULT_SHAPE = z
  .object({
    meta: z.object({}).passthrough(),
    scenarios: z.array(SCENARIO_SHAPE),
  })
  .passthrough()

/** Último `results/*.json` por orden ISO (nombres ordenan cronológicamente), o `null`. */
export function findLatestResults(): string | null {
  let entries: string[]
  try {
    entries = readdirSync(RESULTS_DIR)
  } catch {
    return null
  }
  const jsons = entries.filter((f) => f.endsWith('.json')).sort()
  const latest = jsons.at(-1)
  return latest ? join(RESULTS_DIR, latest) : null
}

/** Lee + valida la forma de un `results/*.json`. Tira con mensaje claro si no calza. */
export function loadResults(path: string): RunResult {
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    throw new Error(`no se pudo leer el archivo de resultados: ${path}`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`JSON inválido en ${path}`)
  }

  const check = RUN_RESULT_SHAPE.safeParse(parsed)
  if (!check.success) {
    const first = check.error.issues[0]
    const where = first ? `${first.path.join('.') || '(raíz)'}: ${first.message}` : 'forma inesperada'
    throw new Error(`el archivo no tiene forma de RunResult de Q1.1 (${where})`)
  }

  return parsed as RunResult
}
