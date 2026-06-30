// Mapeo de ORIGEN de un lead — fuente ÚNICA compartida (P1.D). Lo usan el home
// (LeadOrigins / home-metrics) y el detalle del lead. Extraído de
// home-metrics-logic.ts para que no haya un mapeo paralelo: cualquier vista que
// muestre "de dónde llegó" importa de acá.
//
// Función pura, sin dependencias (server+client safe).

export type OriginLabel =
  | 'Google'
  | 'Instagram'
  | 'Facebook'
  | 'WhatsApp'
  | 'TikTok'
  | 'YouTube'
  | 'LinkedIn'
  | 'Directo'
  | 'Otros'

export interface OriginInput {
  referrerUrl: string | null
  utmSource: string | null
}

// Patrones honestos y conservadores: solo lo que reconocemos con confianza.
// Lo no mapeable cae en 'Otros' o 'Directo' (nunca se inventa una fuente).
const SOURCE_PATTERNS: ReadonlyArray<readonly [RegExp, OriginLabel]> = [
  [/google|gclid|googleads|googlesyndication/, 'Google'],
  [/instagram/, 'Instagram'],
  [/facebook|fbclid|fb\.com|fb\.me/, 'Facebook'],
  [/whatsapp|wa\.me/, 'WhatsApp'],
  [/tiktok/, 'TikTok'],
  [/youtube|youtu\.be/, 'YouTube'],
  [/linkedin|lnkd\.in/, 'LinkedIn'],
]

function matchSource(raw: string): OriginLabel | null {
  const s = raw.toLowerCase()
  for (const [re, label] of SOURCE_PATTERNS) {
    if (re.test(s)) return label
  }
  return null
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    // referrerUrl puede venir sin protocolo (solo host) — usar el string crudo.
    return url.toLowerCase()
  }
}

/**
 * Categoriza el origen de UN lead. Prioridad:
 *   1. UTM explícito conocido (atribución deliberada de campaña).
 *   2. Referrer externo conocido (Google/Instagram/...).
 *   3. Referrer del PROPIO sitio del cliente (ownHost) → 'Directo' (ya estaba ahí).
 *   4. Referrer presente pero desconocido → 'Otros'.
 *   5. Sin referrer ni UTM → 'Directo'.
 * `ownHost` es el host de Organization.siteUrl (para no marcar el tráfico interno
 * como 'Otros'). Si no se conoce, se omite el paso 3.
 */
export function categorizeOrigin(
  { referrerUrl, utmSource }: OriginInput,
  ownHost: string | null = null,
): OriginLabel {
  if (utmSource) {
    const m = matchSource(utmSource)
    if (m) return m
  }
  if (referrerUrl && referrerUrl.trim() !== '') {
    const h = hostOf(referrerUrl)
    const m = matchSource(h)
    if (m) return m
    if (ownHost && ownHost.trim() !== '') {
      // Comparación por dominio, no por substring: 'matsu.com' NO debe matchear
      // 'notmatsu.com'. Acepta el host exacto o un subdominio del propio sitio.
      const own = ownHost.toLowerCase().replace(/^www\./, '')
      const hh = h.replace(/^www\./, '')
      if (hh === own || hh.endsWith('.' + own)) return 'Directo'
    }
    return 'Otros'
  }
  return 'Directo'
}

/** Deriva el host de Organization.siteUrl para detectar tráfico interno. */
export function siteHost(siteUrl: string | null): string | null {
  if (!siteUrl) return null
  try {
    return new URL(siteUrl).hostname.toLowerCase()
  } catch {
    return siteUrl.toLowerCase().replace(/^https?:\/\//, '').split('/')[0] || null
  }
}
