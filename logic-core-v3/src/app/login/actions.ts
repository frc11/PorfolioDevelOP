'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function magicLinkAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get('email') as string

  if (!email || !email.includes('@') || email.length > 254) {
    return 'Email inválido.'
  }

  try {
    await signIn('resend', {
      email,
      redirectTo: '/dashboard',
      redirect: false,
    })
    // 'SUCCESS' indica al cliente que el link fue generado (ver consola del servidor)
    return 'SUCCESS'
  } catch (error) {
    if (error instanceof AuthError) {
      return 'No se pudo generar el Magic Link. Intentá de nuevo.'
    }
    throw error
  }
}

export async function googleSignInAction() {
  await signIn('google', { redirectTo: '/dashboard' })
}

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  // V-04: Validación de inputs antes de llegar a bcrypt y la DB
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !email.includes('@') || email.length > 254) {
    return 'Email inválido.'
  }
  if (!password || password.length < 8 || password.length > 128) {
    return 'Contraseña inválida.'
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email o contraseña incorrectos.'
        default:
          // V-02: Manejar email no verificado
          if ((error.cause as { message?: string })?.message === 'EMAIL_NOT_VERIFIED') {
            return 'Por favor verificá tu email antes de ingresar.'
          }
          return 'Ocurrió un error. Intentá de nuevo.'
      }
    }
    // Re-throw para que Next.js maneje el NEXT_REDIRECT
    throw error
  }
  return null
}
