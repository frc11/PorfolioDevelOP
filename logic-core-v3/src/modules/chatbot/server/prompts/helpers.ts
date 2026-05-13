/**
 * Helper functions for prompt building.
 */

/**
 * Translates the tone enum to a description the LLM can act on.
 * Falls back to informal_rioplatense if the tone isn't recognized.
 */
export function formatTone(tone: string): string {
  const tones: Record<string, string> = {
    informal_rioplatense:
      'cercano, directo, con voseo argentino (vos, decime, qué necesitás) ' +
      'y modismos rioplatenses suaves (che, dale, posta). Sin sobreactuar el lunfardo. ' +
      'Frases cortas.',
    formal:
      'profesional, usando "usted", lenguaje neutro de Argentina. ' +
      'Tono respetuoso pero accesible, sin formalidad rígida.',
    neutral:
      'directo y claro, sin marcaciones regionales fuertes. ' +
      'Apto para audiencias mixtas.',
  }
  return tones[tone] ?? tones.informal_rioplatense
}

/**
 * Formats a Date in Argentina timezone (America/Argentina/Buenos_Aires)
 * with full date and short time.
 *
 * Example output: "miércoles, 12 de mayo de 2026, 15:42"
 */
export function formatDateTimeArgentina(date: Date = new Date()): string {
  return date.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

/**
 * Returns a clean version of a KB section content, or a placeholder
 * if it's empty / whitespace-only.
 */
export function kbSection(content: string, sectionName: string): string {
  const trimmed = content.trim()
  if (!trimmed) {
    return `(Sin información cargada para "${sectionName}". Si el usuario pregunta sobre esto, seguí las reglas anti-alucinación.)`
  }
  return trimmed
}
