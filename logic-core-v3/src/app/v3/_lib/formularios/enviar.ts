/**
 * [RONDA 2] F1 · EL ENVÍO DE LOS FORMULARIOS DEL HOME — una sola puerta: un POST con JSON a un endpoint propio
 * (`/api/contacto`, `/api/newsletter`). La respuesta trae `ok` o un `error` ya escrito para la persona (el servidor nunca
 * manda el error interno); sin red, o si el servidor no contesta en 15 s, un error normal del formulario.
 */
export type ResultadoDelEnvio = { readonly ok: true } | { readonly ok: false; readonly error: string }

/** [PULIDO 10] J3 · el estado de la carga mientras viaja un envío (los dos formularios): uno y después el otro. */
export const TEXTOS_DE_ENVIO = ['Enviando…', 'Casi…'] as const

export const ERROR_DE_RED = 'No pudimos enviarlo. Revisá tu conexión y probá de nuevo.'
const ESPERA_MS = 15000

/**
 * [PULIDO 9] · para probar los estados de los dos formularios mientras las rutas no envían nada de verdad (SÓLO en
 * desarrollo): `?envio=lento`, 2,5 s y llega; `?envio=error`, 2,5 s y el error de red. Ninguna toca la ruta (ni su límite
 * de intentos, que va en la base).
 */
export const ENVIO_SIMULADO = { demoraMs: 2500 } as const

export function envioSimulado(consulta: string, produccion = process.env.NODE_ENV === 'production'): 'lento' | 'error' | null {
  if (produccion) return null
  const pedido = new URLSearchParams(consulta).get('envio')
  return pedido === 'lento' || pedido === 'error' ? pedido : null
}

export async function enviarAlServidor(ruta: string, datos: Readonly<Record<string, unknown>>): Promise<ResultadoDelEnvio> {
  const simulado = envioSimulado(window.location.search)
  if (simulado !== null) {
    await new Promise((listo) => window.setTimeout(listo, ENVIO_SIMULADO.demoraMs))
    return simulado === 'error' ? { ok: false, error: ERROR_DE_RED } : { ok: true }
  }
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
