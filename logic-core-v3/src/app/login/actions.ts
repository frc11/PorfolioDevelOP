'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email o contraseña incorrectos'
        default:
          return 'Ocurrió un error. Intentá de nuevo.'
      }
    }
    // Re-throw para que Next.js maneje el NEXT_REDIRECT
    throw error
  }
  return null
}
