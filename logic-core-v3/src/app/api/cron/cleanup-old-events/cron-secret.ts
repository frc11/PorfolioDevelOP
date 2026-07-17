/**
 * Same auth shape as `regenerate-briefs`/`send-executive-reports`/`os-follow-up`
 * (duplicada ahí 3 veces, no hay helper compartido — no se tocan esos archivos
 * en este sprint). A diferencia del patrón más viejo de `send-weekly-reports`/
 * `generate-insights` (`authHeader !== 'Bearer ' + secret`), esto falla cerrado
 * si `CRON_SECRET` no está seteada: `undefined !== 'Bearer undefined'` da falso
 * NEGATIVO por accidente ahí, pero acá es explícito — nunca autentica contra un
 * secret vacío.
 *
 * Vive en este módulo hermano (no en `route.ts`) porque Next solo permite
 * exports de handlers/config en un `route.ts`: un `export function` extra rompe
 * el typecheck de `.next/types` (TS2344). El invariant testea esta extracción y
 * el rechazo sin secret directo, sin invocar `GET` en el camino feliz (que
 * llamaría a `cleanupOldEvents` de verdad — DB real, fuera del alcance de un
 * invariant).
 */
export function getProvidedCronSecret(request: Request): string | null {
  const authorizationHeader = request.headers.get('authorization')?.trim()
  const cronHeader = request.headers.get('x-cron-secret')?.trim()

  if (authorizationHeader?.startsWith('Bearer ')) {
    return authorizationHeader.slice('Bearer '.length).trim()
  }

  return cronHeader ?? null
}
