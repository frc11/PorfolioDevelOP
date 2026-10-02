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

/** El contacto del pie: lo que falta o está mal, campo por campo. Vacío = se puede enviar. */
export function validarElPie(d: DatosDelPie): ErroresDelPie {
  const e: ErroresDelPie = {}
  const nombre = d.nombre.trim()
  if (nombre.length < 2 || nombre.length > MAXIMOS.nombre) e.nombre = 'Decinos cómo te llamás.'
  const mail = d.mail.trim()
  if (!EMAIL.test(mail) || mail.length > MAXIMOS.contacto) e.mail = 'Un mail válido, así te respondemos.'
  const mensaje = d.mensaje.trim()
  if (mensaje.length < 3 || mensaje.length > MAXIMOS.mensaje) e.mensaje = 'Contanos aunque sea en una línea.'
  return e
}

/** El newsletter: un mail. */
export function validarElMail(mail: string): string | null {
  const m = mail.trim()
  return EMAIL.test(m) && m.length <= MAXIMOS.contacto ? null : 'Un mail válido, así te avisamos.'
}
