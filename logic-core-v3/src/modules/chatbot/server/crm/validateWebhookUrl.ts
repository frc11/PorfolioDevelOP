/**
 * B5.8 — Validación anti-SSRF de la URL del webhook n8n.
 *
 * Una URL maliciosa puede:
 *  - Apuntar a localhost/127.0.0.1 → llamar a servicios internos del runtime.
 *  - Apuntar a IPs privadas RFC1918 → escanear la red interna.
 *  - Apuntar a metadata endpoints de cloud (169.254.169.254, metadata.google.internal)
 *    → exfiltrar credenciales del entorno.
 *  - No-HTTPS → un secret header viaja en claro.
 *
 * Deuda conocida (roadmap-pendientes): DNS rebinding. Un atacante puede registrar
 * un dominio público cuya resolución DNS apunta a una IP privada. La protección
 * completa requiere resolver la IP justo antes del POST y rechazar si es privada.
 */

export type WebhookValidationResult =
  | { ok: true }
  | { ok: false; error: string }

const BLOCKED_HOSTNAMES: ReadonlySet<string> = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  'metadata.google.internal',
  '169.254.169.254', // metadata endpoints AWS/GCP/Azure
])

const BLOCKED_HOSTNAME_SUFFIXES: readonly string[] = [
  '.local',
  '.internal',
  '.localhost',
]

// RFC1918 + loopback + link-local IPv4 (regex sobre hostname numérico).
const PRIVATE_IPV4_PATTERNS: readonly RegExp[] = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
]

export function validateWebhookUrl(input: string): WebhookValidationResult {
  if (typeof input !== 'string' || input.trim().length === 0) {
    return { ok: false, error: 'La URL no puede estar vacía' }
  }

  let parsed: URL
  try {
    parsed = new URL(input.trim())
  } catch {
    return { ok: false, error: 'URL inválida' }
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, error: 'Solo se aceptan URLs HTTPS' }
  }

  // Hostname normalizado. En Node, URL.hostname devuelve IPv6 con corchetes
  // (`[::1]`), así que los strippeamos para que el match con `::1` funcione.
  const rawHostname = parsed.hostname.toLowerCase()
  const hostname =
    rawHostname.startsWith('[') && rawHostname.endsWith(']')
      ? rawHostname.slice(1, -1)
      : rawHostname

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { ok: false, error: 'Ese hostname no está permitido' }
  }

  for (const suffix of BLOCKED_HOSTNAME_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      return { ok: false, error: 'Ese hostname no está permitido' }
    }
  }

  for (const pattern of PRIVATE_IPV4_PATTERNS) {
    if (pattern.test(hostname)) {
      return { ok: false, error: 'No se pueden usar IPs privadas o de loopback' }
    }
  }

  // IPv6: rechazar loopback, link-local (fe80::/10) y unique local (fc00::/7).
  // Cobertura básica — n8n se accede vía dominio HTTPS, no IPv6 raw.
  if (
    hostname === '::1' ||
    hostname.startsWith('fe80:') ||
    hostname.startsWith('fc') ||
    hostname.startsWith('fd')
  ) {
    return { ok: false, error: 'No se pueden usar IPs privadas o de loopback' }
  }

  return { ok: true }
}
