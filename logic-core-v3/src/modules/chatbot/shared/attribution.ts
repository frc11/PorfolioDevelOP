// UTM.1 — Parseo y sanitización de atribución first-touch (UTM + referrer).
// Plano (sin 'use client'/'use server') → lo consumen tanto los componentes
// cliente (LogicCompanion.tsx, ChatbotEmbed.tsx, para parsear la URL real de
// cada entrypoint) como el Zod schema del server (handleChatRequest.ts, para
// sanitizar lo que llega del visitante) y los tests, desde un solo lugar.

export interface ParsedAttribution {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  referrer: string | null
}

export const EMPTY_ATTRIBUTION: ParsedAttribution = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  referrer: null,
}

/**
 * Extrae utm_source/utm_medium/utm_campaign + referrer desde una URL de
 * página cruda. Usado por LogicCompanion.tsx (misma URL, same-origin) y por
 * ChatbotEmbed.tsx (URL de la página del cliente, recibida vía postMessage
 * desde widget.js). Pura extracción — la sanitización de confianza (cap de
 * longitud, quitar caracteres de control) vive en sanitizeAttributionField y
 * corre server-side; esto NO es el boundary de confianza.
 */
export function parseAttribution(pageUrl: string, referrer: string | null): ParsedAttribution {
  let params: URLSearchParams
  try {
    params = new URL(pageUrl).searchParams
  } catch {
    params = new URLSearchParams()
  }
  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    referrer: referrer && referrer.trim() !== '' ? referrer : null,
  }
}

// Códigos de caracteres de control a remover: C0 (0-31) + DEL (127). Construido
// desde charCodes (no un literal con escapes) para que el rango quede
// inequívoco en el fuente. Los campos de atribución son de una sola línea por
// naturaleza — ningún valor legítimo necesita tab/newline/CR tampoco.
const CONTROL_CHAR_CODES: number[] = []
for (let code = 0; code <= 31; code++) CONTROL_CHAR_CODES.push(code)
CONTROL_CHAR_CODES.push(127)

/** ¿Es este code point uno de los caracteres de control a remover? */
function isControlCharCode(code: number): boolean {
  return CONTROL_CHAR_CODES.includes(code)
}

/**
 * Sanitiza un valor de atribución (UTM o referrer) controlado por el
 * visitante: quita caracteres de control, recorta espacios y limita a
 * `maxLength`. Colapsa a `undefined` si queda vacío tras la limpieza (nunca
 * persiste `""`). Nunca lanza ni rechaza — es sanitización silenciosa, no
 * validación estricta (estos campos son de atribución best-effort, no lógica
 * crítica).
 */
export function sanitizeAttributionField(raw: string, maxLength: number): string | undefined {
  let withoutControlChars = ''
  for (const char of raw) {
    if (!isControlCharCode(char.charCodeAt(0))) withoutControlChars += char
  }
  const cleaned = withoutControlChars.trim().slice(0, maxLength)
  return cleaned.length > 0 ? cleaned : undefined
}
