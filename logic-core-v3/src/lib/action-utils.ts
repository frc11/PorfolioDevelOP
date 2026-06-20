import { ZodError } from 'zod'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

export function fail(error: string): ActionResult<never> {
  return { success: false, error }
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
