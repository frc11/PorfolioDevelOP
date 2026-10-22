/**
 * [B7] LOS TEXTOS DEL LOGIN — el título lo eligió Valentino; los demás son los del login de siempre (`src/app/login/page.tsx`),
 * para que el formulario nuevo diga lo mismo que el que reemplaza en el sitio nuevo. Sin cifras ni nada inventado.
 */

export const TITULO_DEL_INGRESO = 'Iniciá sesión para entrar al panel'

export const ROTULOS_DEL_INGRESO = {
  google: 'Continuar con Google',
  separador: 'o continuá con',
  grupoDeModos: 'Cómo querés ingresar',
  modos: { clave: 'Contraseña', link: 'Magic Link' },
  email: 'Email',
  clave: 'Contraseña',
  emailDelLink: 'Tu email',
  ingresar: 'Ingresar',
  ingresando: 'Ingresando…',
  enviarLink: 'Enviar Magic Link',
  generandoLink: 'Generando link…',
  olvido: '¿Olvidaste tu contraseña?',
  mostrarClave: 'Mostrar contraseña',
  ocultarClave: 'Ocultar contraseña',
  /** [C1] La prueba del panel todavía no existe: el botón está y no lleva a ningún lado. */
  probar: 'Probá el panel',
  volver: 'Volver al home',
} as const

export const EXPLICACION_DEL_LINK = 'Ingresá tu email y te enviamos un link de acceso de un solo uso. No necesitás contraseña.'

export const LINK_GENERADO = {
  titulo: 'Link generado',
  texto: 'La URL de verificación fue impresa en la consola del servidor. Copiala y pegala en el navegador para ingresar.',
} as const

/** Lo que dice cuando algo falla y no es un error que el servidor ya escribió para la persona (nunca el error interno). */
export const ERROR_INESPERADO = 'Ocurrió un error inesperado. Intentá de nuevo.'

/** Lo que devuelve el servidor cuando el Magic Link salió (`magicLinkAction`). */
export const LINK_ENVIADO = 'SUCCESS'

/** «¿Olvidaste tu contraseña?», la ruta de siempre (fuera de /v3). */
export const RUTA_DEL_OLVIDO = '/forgot-password'
