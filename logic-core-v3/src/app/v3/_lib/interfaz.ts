/**
 * [INTERFAZ 1] LAS VARIANTES DE LA INTERFAZ EN LA URL — `/v3?interfaz=<clave>=<valor>,<clave>=<valor>`.
 *
 * Como `?pruebas=` de la escena (ESCENA 9): sin banco, para mirar en vivo lo que se decide. Se lee UNA vez por carga, y
 * sólo en el navegador (en el servidor no hay URL: el producto). Sin la consulta, el producto.
 *
 *   · `inercia=no` — el texto sin inercia (T1), para comparar; `inercia=marcada` — el doble de inclinación.
 *   · `cursor=nk` — el cursor de la referencia (T2): sobre lo que se toca se apaga y queda el nativo.
 */
let resuelto: ReadonlyMap<string, string> | null = null

export function varianteDeInterfaz(clave: 'inercia' | 'cursor'): string | null {
  if (typeof window === 'undefined') return null
  if (resuelto === null) {
    const pedido = new URLSearchParams(window.location.search).get('interfaz') ?? ''
    const pares = new Map<string, string>()
    for (const parte of pedido.split(',')) {
      const [k, v] = parte.split('=')
      if (k !== undefined && k !== '' && v !== undefined) pares.set(k.trim(), v.trim())
    }
    resuelto = pares
  }
  return resuelto.get(clave) ?? null
}
