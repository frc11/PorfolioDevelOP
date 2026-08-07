/**
 * Auth compartida de los crons bajo `app/api/cron/*` (H.2).
 *
 * Movido desde `app/api/cron/cleanup-old-events/cron-secret.ts` (T0.2): dejó de
 * ser un helper de esa carpeta el día que otras rutas de cron necesitaron el
 * mismo patrón — vive en `src/lib/` como el resto de los módulos compartidos
 * del repo (`lib/isolation`, `lib/plan`, etc.), no dentro de un route folder.
 *
 * FALLA CERRADO: `isAuthorizedCronRequest` nunca autentica si `CRON_SECRET` no
 * está seteada. El patrón viejo que reemplaza (`authHeader !== 'Bearer ' +
 * process.env.CRON_SECRET`) tenía un agujero real: sin la env var, el token
 * esperado se volvía el string literal `"Bearer undefined"` — cualquiera que
 * mandara ese header exacto pasaba. H.2 migró `generate-insights`,
 * `send-weekly-reports` y `detect-bot-issues` (tenían el patrón viejo) y
 * `cleanup-old-events` (ya usaba la versión anterior de este mismo helper,
 * inline) a esta función única.
 *
 * `os-follow-up`, `regenerate-briefs`, `send-executive-reports` y `alerts` NO
 * se tocaron: ya fallan cerrado (cada uno con su propia copia inline del
 * mismo chequeo, o una variante equivalente en `alerts`), y son de dominios
 * fuera de este sprint (LeadOS / reportes ejecutivos org-scoped) — ver
 * bitácora H.2 para el detalle de por qué se dejaron así.
 */
export function getProvidedCronSecret(request: Request): string | null {
  const authorizationHeader = request.headers.get('authorization')?.trim()
  const cronHeader = request.headers.get('x-cron-secret')?.trim()

  if (authorizationHeader?.startsWith('Bearer ')) {
    return authorizationHeader.slice('Bearer '.length).trim()
  }

  return cronHeader ?? null
}

/**
 * true si el request trae el `CRON_SECRET` correcto (via `Authorization:
 * Bearer <secret>` o `X-Cron-Secret: <secret>`). Falla cerrado: si la env var
 * no está seteada, siempre `false` — nunca autentica contra un secret vacío.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const expectedSecret = process.env.CRON_SECRET?.trim()
  const providedSecret = getProvidedCronSecret(request)
  return Boolean(expectedSecret) && providedSecret === expectedSecret
}
