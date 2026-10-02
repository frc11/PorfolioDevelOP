/**
 * [RONDA 2] F1 · EL ENVÍO DE LOS FORMULARIOS DEL HOME — una sola puerta: un POST con JSON a un endpoint propio
 * (`/api/contacto`, `/api/newsletter`). La respuesta trae `ok` o un `error` ya escrito para la persona (el servidor nunca
 * manda el error interno); sin red, o si el servidor no contesta en 15 s, un error normal del formulario.
 */
export type ResultadoDelEnvio = { readonly ok: true } | { readonly ok: false; readonly error: string }

export const ERROR_DE_RED = 'No pudimos enviarlo. Revisá tu conexión y probá de nuevo.'
const ESPERA_MS = 15000

export async function enviarAlServidor(ruta: string, datos: Readonly<Record<string, unknown>>): Promise<ResultadoDelEnvio> {
  const corte = new AbortController()
  const reloj = window.setTimeout(() => corte.abort(), ESPERA_MS)
  try {
    const r = await fetch(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos), signal: corte.signal })
    const cuerpo: unknown = await r.json().catch(() => null)
    if (r.ok && typeof cuerpo === 'object' && cuerpo !== null && (cuerpo as { ok?: unknown }).ok === true) return { ok: true }
    const error = typeof cuerpo === 'object' && cuerpo !== null ? (cuerpo as { error?: unknown }).error : null
    return { ok: false, error: typeof error === 'string' && error.length > 0 ? error : ERROR_DE_RED }
  } catch {
    return { ok: false, error: ERROR_DE_RED }
  } finally {
    window.clearTimeout(reloj)
  }
}
