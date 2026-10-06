/**
 * [RONDA 2] F1 · LO QUE SE VALIDA DE LOS FORMULARIOS DEL HOME — puro (sin Zod: entra en el bundle del cliente sin pesar),
 * lo mismo en el navegador (el aviso al lado del campo) y en el servidor (`/api/contacto`, `/api/newsletter`, que además
 * pasan los datos por su esquema de Zod). El panel deslizante tiene el suyo (`_chrome/contacto/enviarContacto.ts`).
 */
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const TELEFONO = /^\+?[\d\s()-]{8,}$/

/** Lo máximo de cada campo (lo mismo exige el servidor). */
export const MAXIMOS = { nombre: 120, contacto: 160, empresa: 160, presupuesto: 160, mensaje: 4000 } as const

export interface DatosDelPie {
  readonly nombre: string
  readonly mail: string
  readonly mensaje: string
}
export type CampoDelPie = keyof DatosDelPie
export type ErroresDelPie = Partial<Record<CampoDelPie, string>>

/**
 * El contacto del pie: lo que falta o está mal, campo por campo. Vacío = se puede enviar. [EL ENCASTRE] 1E · el único
 * obligatorio es el mail; el nombre y el mensaje son opcionales (sólo su largo máximo, que también frena el campo).
 */
export function validarElPie(d: DatosDelPie): ErroresDelPie {
  const e: ErroresDelPie = {}
  if (d.nombre.trim().length > MAXIMOS.nombre) e.nombre = 'Un nombre más corto, por favor.'
  const mail = d.mail.trim()
  if (!EMAIL.test(mail) || mail.length > MAXIMOS.contacto) e.mail = 'Un mail válido, así te respondemos.'
  if (d.mensaje.trim().length > MAXIMOS.mensaje) e.mensaje = 'Es largo: resumilo un poco, por favor.'
  return e
}

/** El newsletter: un mail. */
export function validarElMail(mail: string): string | null {
  const m = mail.trim()
  return EMAIL.test(m) && m.length <= MAXIMOS.contacto ? null : 'Un mail válido, así te avisamos.'
}
