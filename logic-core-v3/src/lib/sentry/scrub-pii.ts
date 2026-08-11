import type { ErrorEvent, EventHint } from '@sentry/nextjs'

// B14.5 — Scrubbing de PII OBLIGATORIO antes de mandar eventos a Sentry.
//
// Cubre dos riesgos distintos:
//   1. PII en strings libres (messages de error, breadcrumbs, query strings) →
//      patrones regex para emails, teléfonos, JWTs, tarjetas de crédito.
//   2. PII en estructuras (request.data, extras, contexts, headers) → denylist
//      de keys sensibles cuyos valores se redactan enteros sin mirar.
//
// La regla es conservativa: si dudo, scrub. Vale más perder un dato útil para
// debug que filtrar PII a un tercero (Sentry).
//
// No toca stack traces (los nombres de variables son útiles para debug y no
// llevan valores), solo el `value` del exception y campos de payload.

const SENSITIVE_KEY_PATTERN = new RegExp(
  [
    // Auth / credenciales
    'password', 'passwd', 'pwd', 'passphrase',
    'secret', 'apikey', 'api_key', 'access_token', 'accesstoken',
    'refresh_token', 'refreshtoken', 'id_token', 'idtoken',
    'auth_token', 'authtoken', '^token$', '^bearer$',
    'authorization', '^auth$', 'cookie',
    // PII de contacto
    '^email$', '^mail$',
    '^phone$', 'telephone', '^mobile$', 'whatsapp', '^celular$', '^telefono$',
    // Identificadores oficiales
    'ssn', '^dni$', '^cuit$', '^cuil$',
    // Tarjetas
    'credit_?card', 'cc_?number', 'cardnumber',
    // Sesión
    'sessionid', 'session_id', 'csrf',
    // PRIVACIDAD — headers/campos de IP por CLAVE: una IPv6 pasa los regex
    // de texto libre (la IPv4 solo se salva de casualidad como [phone]).
    // Anclados donde la subcadena es genérica ("ip" está en "shipping").
    'x-forwarded-for', 'x-real-ip', 'x-client-ip', 'x-nf-client-connection-ip',
    'client_?ip', '^ip$', 'ip_?address', 'remote_?addr', '^forwarded$',
  ].join('|'),
  'i',
)

const REDACTED = '[redacted]'
const MAX_DEPTH = 5

// Patrones para strings libres. Conservativos para minimizar falsos positivos.
//
// Orden importa: aplicamos los MÁS específicos primero. El último (phone) es
// el más genérico — si el orden se invierte, una tarjeta tipo "4111 1111 1111
// 1111" matchearía como phone, o un teléfono con muchos dígitos matchearía
// como CC. Los placeholders no tienen dígitos, así que una vez sustituidos
// no vuelven a matchear.
const PATTERNS: Array<{ rx: RegExp; placeholder: string }> = [
  // Email — RFC simplificado.
  { rx: /[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi, placeholder: '[email]' },
  // JWT — 3 segmentos base64url separados por punto, primero arranca con eyJ.
  { rx: /\beyJ[A-Za-z0-9_\-]{4,}\.eyJ[A-Za-z0-9_\-]{4,}\.[A-Za-z0-9_\-]{4,}\b/g, placeholder: '[jwt]' },
  // Tarjeta de crédito — formato estándar de 4 grupos de 4 dígitos
  // separados por espacio/guion. Estricto a propósito para no comerse
  // teléfonos con muchos dígitos. Strings de 13/15/19 dígitos sin separar
  // las dejamos para que phone las capture genéricamente.
  { rx: /\b\d{4}[ \-]\d{4}[ \-]\d{4}[ \-]\d{4}\b/g, placeholder: '[cc]' },
  // Teléfono — 8+ dígitos con separadores comunes (espacios, guiones,
  // paréntesis, puntos). Anclado a límites no-alphanum para no comerse
  // tokens largos.
  { rx: /(?<![A-Za-z0-9])\+?\d[\d\s().\-]{7,}\d(?![A-Za-z0-9])/g, placeholder: '[phone]' },
]

function scrubString(input: string): string {
  let out = input
  for (const { rx, placeholder } of PATTERNS) {
    out = out.replace(rx, placeholder)
  }
  return out
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function scrubValue(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) return '[depth-limit]'

  if (value === null || value === undefined) return value
  if (typeof value === 'string') return scrubString(value)
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((v) => scrubValue(v, depth + 1))
  }

  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        out[key] = REDACTED
      } else {
        out[key] = scrubValue(val, depth + 1)
      }
    }
    return out
  }

  // Funciones, símbolos, instances raras — los descartamos para no leakearlos.
  return '[unserializable]'
}

// Sentry permite que beforeSend devuelva null para descartar el evento, pero
// scrubPii nunca descarta — solo redacta. La firma acepta null en caso de
// que se encadene con otros filtros que devuelvan null.
//
// Tipado: el hook beforeSend del SDK recibe ErrorEvent. Si en el futuro
// se quiere scrubear transactions, usar beforeSendTransaction (otro hook).
export function scrubPii(
  event: ErrorEvent | null,
  _hint?: EventHint,
): ErrorEvent | null {
  if (!event) return null

  // 1. event.message (top-level)
  if (typeof event.message === 'string') {
    event.message = scrubString(event.message)
  }

  // 2. event.exception.values[].value — el message del Error (puede ser
  //    "User foo@bar.com not found" o similar).
  if (event.exception?.values) {
    for (const ex of event.exception.values) {
      if (typeof ex.value === 'string') {
        ex.value = scrubString(ex.value)
      }
    }
  }

  // 3. event.request — URL, query, headers, cookies, data del body.
  if (event.request) {
    const req = event.request
    if (typeof req.url === 'string') req.url = scrubString(req.url)
    if (typeof req.query_string === 'string') req.query_string = scrubString(req.query_string)
    if (req.data !== undefined) req.data = scrubValue(req.data, 0)
    if (req.headers && isPlainObject(req.headers)) {
      req.headers = scrubValue(req.headers, 0) as Record<string, string>
    }
    if (req.cookies && isPlainObject(req.cookies)) {
      // Cookies enteras al redactado — no son debug-útiles y siempre tienen sesión.
      req.cookies = { '[all]': REDACTED }
    }
  }

  // 4. event.user — Sentry recomienda mandar solo `id`. Si vino email,
  //    username o ip_address, los redactamos.
  if (event.user) {
    const safeUser: { id?: string | number } = {}
    if (typeof event.user.id === 'string' || typeof event.user.id === 'number') {
      safeUser.id = event.user.id
    }
    event.user = safeUser
  }

  // 5. event.extra / contexts / tags — pueden tener cualquier cosa.
  if (event.extra) event.extra = scrubValue(event.extra, 0) as Record<string, unknown>
  if (event.contexts) event.contexts = scrubValue(event.contexts, 0) as typeof event.contexts
  if (event.tags) event.tags = scrubValue(event.tags, 0) as typeof event.tags

  // 6. event.breadcrumbs — message libre + data estructurada.
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((b) => ({
      ...b,
      message: typeof b.message === 'string' ? scrubString(b.message) : b.message,
      data: b.data ? (scrubValue(b.data, 0) as Record<string, unknown>) : b.data,
    }))
  }

  return event
}

// Exportado solo para tests/smoke. NO usar fuera.
export const __INTERNALS_FOR_TESTING__ = {
  scrubString,
  scrubValue,
  SENSITIVE_KEY_PATTERN,
  PATTERNS,
}
