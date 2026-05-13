import type { BuildSystemPromptInput } from './types'
import {
  buildIdentity,
  buildMission,
  buildKnowledge,
  buildToolsOverview,
  buildBehavior,
  buildAntiHallucination,
  buildExamples,
  buildDynamicContext,
  buildOutputFormat,
} from './sections'

/**
 * Builds the complete system prompt for the chatbot.
 *
 * Composes 9 sections in order:
 *   1. Identity
 *   2. Mission and philosophy
 *   3. Business knowledge (KB injection)
 *   4. Tools overview
 *   5. Behavior rules
 *   6. Anti-hallucination rules (critical)
 *   7. Few-shot examples
 *   8. Dynamic context (per-request)
 *   9. Output format
 *
 * Sections are separated by `\n\n---\n\n` for clear visual structure.
 *
 * @param input - bot config + knowledge base + dynamic context
 * @returns the full system prompt as a single string
 */
export function buildSystemPrompt(input: BuildSystemPromptInput): string {
  return [
    buildIdentity(input),
    buildMission(input),
    buildKnowledge(input),
    buildToolsOverview(input),
    buildBehavior(input),
    buildAntiHallucination(input),
    buildExamples(input),
    buildDynamicContext(input),
    buildOutputFormat(input),
  ]
    .join('\n\n---\n\n')
    .trim()
}
