import { ZodError } from 'zod'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

/**
 * `error` es SIEMPRE copy para el humano. `code` (4.1, opcional) es el contrato
 * con la UI cuando además tiene que reaccionar al fallo puntual — así el
 * comportamiento no cuelga de matchear el texto por substring.
 */
export function fail(error: string, code?: string): ActionResult<never> {
  return code === undefined ? { success: false, error } : { success: false, error, code }
}

// Convierte cualquier error en un mensaje limpio para el cliente, sin filtrar
// el array crudo de un ZodError ni un stack trace. ZodError -> primer issue
// legible; Error genérico -> su message (ya pensado para el usuario en las
// actions); cualquier otra cosa -> fallback.
export function toErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado.'
): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}
