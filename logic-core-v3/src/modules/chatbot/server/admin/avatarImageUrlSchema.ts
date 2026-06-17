import { z } from 'zod'

// avatarImageUrl acepta una URL http(s) (legacy / avatares externos) o un data
// URL base64 de imagen (jpg/png/webp). La subida directa comprime la imagen a
// ~200x200 en el navegador y guarda el data URL en este campo (Postgres TEXT,
// sin límite de longitud en el schema).
//
// El cap de longitud es defense-in-depth: el cliente ya comprime, pero el server
// no debe aceptar un base64 gigante que infle la DB si alguien saltea la UI.
const MAX_AVATAR_URL_LENGTH = 600_000 // ~450KB binario; una webp 200x200 entra holgada

export const avatarImageUrlSchema = z
  .string()
  .refine(
    (value) =>
      /^https?:\/\//i.test(value) ||
      /^data:image\/(png|jpeg|webp);base64,/i.test(value),
    'La imagen del avatar debe ser una URL http(s) o un archivo subido.',
  )
  .refine(
    (value) => value.length <= MAX_AVATAR_URL_LENGTH,
    'La imagen es demasiado pesada. Subí una más liviana.',
  )
  .nullable()
