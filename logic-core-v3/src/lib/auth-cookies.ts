/**
 * Fuente única del nombre y atributos de la cookie de sesión de NextAuth.
 *
 * DEBE decidirse por `NODE_ENV`, NUNCA por el protocolo de la request. Tres
 * piezas escriben/leen esta cookie y el JWT se salt-ea con su nombre, así que
 * las tres tienen que coincidir o la sesión no se encuentra:
 *   - `src/auth.ts`            → `auth()` de página (Node) que LEE el token.
 *   - `src/auth.config.ts`     → middleware edge (`proxy.ts`) que LEE el token.
 *   - `src/app/api/qa/login/route.ts` → mintea el token QA (el nombre es el salt).
 *
 * En prod-sobre-https los tres coinciden igual; el quiebre aparecía en un build
 * de prod servido sobre http local (QA): el middleware resolvía el nombre por el
 * default de Auth.js (`useSecureCookies` derivado del protocolo de `AUTH_URL`),
 * desalineándose del criterio `NODE_ENV` del resto. Centralizar acá lo elimina.
 *
 * Edge-safe: solo lee `process.env.NODE_ENV`, sin imports de Node ni Prisma.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const SESSION_COOKIE_NAME = IS_PRODUCTION
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PRODUCTION,
  path: '/',
}
