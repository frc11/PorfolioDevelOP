/**
 * Layer 4 of anti-hallucination defense.
 *
 * Runs regex patterns over the assistant's final text. Detects:
 * - Absolute guarantees ("te garantizo", "100%", "x10 ventas")
 * - Self-references as a generic AI model
 * - Prompt leaks (section headers from the system prompt)
 * - Fabricated-sounding metrics
 *
 * Does NOT block the output (the client already received the stream).
 * Returns warnings for structured logging. Operators review the logs.
 */

export type ValidationSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ValidationWarning {
  patternId: string
  severity: ValidationSeverity
  description: string
  match: string  // The matched substring (lowercased for privacy)
}

interface ValidationPattern {
  id: string
  regex: RegExp
  severity: ValidationSeverity
  description: string
}

const PATTERNS: ValidationPattern[] = [
  {
    id: 'guarantee_absolute',
    regex: /\b(garantizad[oa]s?|te garantizo|te aseguro al 100|aseguramos al 100)\b/i,
    severity: 'high',
    description: 'Absolute guarantee phrase detected',
  },
  {
    id: 'absolute_claim_100_pct',
    regex: /\b100\s?%\s+(seguro|garantizado|efectivo|de éxito)\b/i,
    severity: 'high',
    description: '100% absolute claim detected',
  },
  {
    id: 'inflated_multiplier',
    regex: /\b(x\s?\d+|\d+x)\s+(más\s+)?(ventas|leads|ingresos|clientes|conversion(?:es)?)\b/i,
    severity: 'high',
    description: 'Inflated multiplier claim (e.g., "x10 ventas")',
  },
  {
    id: 'self_reference_generic_ai',
    regex: /\b(como\s+modelo\s+de\s+(IA|inteligencia\s+artificial|lenguaje)|soy\s+(una\s+IA|un\s+modelo))\b/i,
    severity: 'medium',
    description: 'Self-reference as generic AI model',
  },
  {
    id: 'prompt_section_leak',
    regex: /(^|\n)\s*#\s*\d+\.\s+(IDENTIDAD|MISIÓN|CONOCIMIENTO|HERRAMIENTAS|REGLAS\s+DE\s+COMPORTAMIENTO|REGLAS\s+ANTI-ALUCINACIÓN)/i,
    severity: 'critical',
    description: 'System prompt section header leaked into output',
  },
  {
    id: 'fabricated_timeframe',
    regex: /\b(en\s+24\s+horas|en\s+menos\s+de\s+\d+\s+(minutos|horas))\b/i,
    severity: 'low',
    description: 'Time-frame claim — verify it matches the KB',
  },
]

export function validateAssistantOutput(text: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  for (const p of PATTERNS) {
    const match = text.match(p.regex)
    if (match) {
      warnings.push({
        patternId: p.id,
        severity: p.severity,
        description: p.description,
        match: match[0].toLowerCase(),
      })
    }
  }
  return warnings
}
