import { ERROR_INESPERADO, LINK_ENVIADO } from './contenido'

/**
 * [B7] EL ENVÍO DEL LOGIN — la validación del lado del cliente y lo que se hace con la respuesta. Puro: lo prueba `s79-ingreso`.
 *
 * El login NO se toca (`src/auth.ts` y `src/app/login/actions.ts` son la lógica de siempre): el formulario nuevo llama a las mismas
 * tres acciones (`AccionesDelIngreso`, cableadas en `acciones.ts`) con los mismos nombres de campo (`email`, `password`,
 * `magic-email`). Lo de acá es la presentación:
 *
 *   · **la validación del cliente** repite la del servidor, con sus mismos mensajes (el servidor la vuelve a correr igual; el
 *     invariante compara los textos con los de `actions.ts`), para marcar el campo antes de viajar;
 *   · **la respuesta**: un texto es un error ya escrito para la persona (se muestra tal cual); `SUCCESS` del Magic Link es el aviso
 *     del link; y el ÉXITO del login no vuelve: la acción redirige al panel (next rechaza la llamada con su error de redirección y
 *     navega solo). Ahí se baja el telón (`telon.ts`, el fundido al panel) y la hoja queda en la carga. Cualquier otra excepción
 *     es el error genérico: nunca el mensaje interno.
 */

export interface DatosDelIngreso {
  readonly email: string
  readonly clave: string
}

export type CampoDelIngreso = keyof DatosDelIngreso
export type ErroresDelIngreso = Partial<Record<CampoDelIngreso, string>>

/** Los mensajes del servidor (`loginAction` y `magicLinkAction`), los mismos: el cliente no inventa otros. */
export const MENSAJES_DEL_INGRESO = {
  emailFalta: 'El email es requerido.',
  emailInvalido: 'Email inválido.',
  claveFalta: 'La contraseña es requerida.',
  claveLargo: 'La contraseña debe tener entre 8 y 128 caracteres.',
} as const

/** Los largos del servidor. */
export const LARGOS_DEL_INGRESO = { email: 254, claveMinimo: 8, claveMaximo: 128 } as const

/** La regla del servidor para el email (recortado y en minúsculas): no vacío, con `@` y no más largo que 254. */
export function errorDelEmail(email: string): string | undefined {
  const e = email.trim().toLowerCase()
  if (e === '') return MENSAJES_DEL_INGRESO.emailFalta
  if (!e.includes('@') || e.length > LARGOS_DEL_INGRESO.email) return MENSAJES_DEL_INGRESO.emailInvalido
  return undefined
}

/** La regla del servidor para la contraseña: no vacía, entre 8 y 128. */
export function errorDeLaClave(clave: string): string | undefined {
  if (clave === '') return MENSAJES_DEL_INGRESO.claveFalta
  if (clave.length < LARGOS_DEL_INGRESO.claveMinimo || clave.length > LARGOS_DEL_INGRESO.claveMaximo) return MENSAJES_DEL_INGRESO.claveLargo
  return undefined
}

export function validarIngreso(d: DatosDelIngreso): ErroresDelIngreso {
  const errores: ErroresDelIngreso = {}
  const email = errorDelEmail(d.email)
  const clave = errorDeLaClave(d.clave)
  if (email !== undefined) errores.email = email
  if (clave !== undefined) errores.clave = clave
  return errores
}

/** Las tres maneras de entrar: las acciones del login de siempre (o las simuladas, o las de la prueba). */
export interface AccionesDelIngreso {
  readonly conClave: (previo: string | null, datos: FormData) => Promise<string | null>
  readonly conLink: (previo: string | null, datos: FormData) => Promise<string | null>
  /** [L6 · 80] Recuperar la contraseña: `LINK_ENVIADO` si salió, un texto si es un error ya escrito. */
  readonly conOlvido: (previo: string | null, datos: FormData) => Promise<string | null>
  readonly conGoogle: () => Promise<void>
}

export type Resultado =
  | { readonly estado: 'reposo' }
  | { readonly estado: 'error'; readonly mensaje: string }
  | { readonly estado: 'link-enviado' }
  /** La acción redirigió: se va al panel (el telón ya bajó). */
  | { readonly estado: 'entrando' }

export const REPOSO: Resultado = { estado: 'reposo' }

/** El error con que next rechaza una acción que redirigió (`NEXT_REDIRECT;…` en su `digest`). */
export function esUnaRedireccion(e: unknown): boolean {
  if (typeof e !== 'object' || e === null || !('digest' in e)) return false
  const digest = (e as { readonly digest: unknown }).digest
  return typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')
}

/**
 * Llama a la acción y traduce la respuesta. Con la redirección, `alEntrar` (bajar el telón) y «entrando»: la navegación ya la
 * despachó next (su router navega aunque la llamada se rechace), así que el error no se vuelve a tirar (no desmonta el home detrás
 * del telón para volver a pedir lo mismo).
 */
export async function resolverElIngreso(llamada: () => Promise<string | null | void>, alEntrar: () => void): Promise<Resultado> {
  try {
    const r = await llamada()
    if (r === LINK_ENVIADO) return { estado: 'link-enviado' }
    if (typeof r === 'string' && r !== '') return { estado: 'error', mensaje: r }
    return REPOSO
  } catch (e) {
    if (esUnaRedireccion(e)) {
      alEntrar()
      return { estado: 'entrando' }
    }
    return { estado: 'error', mensaje: ERROR_INESPERADO }
  }
}
