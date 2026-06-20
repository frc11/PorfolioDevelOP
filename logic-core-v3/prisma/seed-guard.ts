/**
 * Sprint C.0 — Blindaje de seeds contra prod.
 *
 * Helper compartido por los seeds que MUTAN datos (`seed.ts`, `seed-agency-os.ts`).
 * Reúne dos protecciones, espejo del idioma ya usado en `scripts/seed-matsu.ts`
 * y `scripts/demos-seed-review-queue.ts`:
 *
 *   1. assertDevSeedTarget() — aborta si el destino no parece dev/local
 *      (o si NODE_ENV=production). Override explícito: ALLOW_PROD_SEED=1.
 *   2. requireSeedPassword() — exige la password por env var, SIN default.
 *      Falla con mensaje claro si falta (nunca inventa un valor).
 *
 * Nota de entorno: `@prisma/client` carga `.env` completo al importarse, así que
 * estas funciones ven `process.env` poblado cuando corren dentro de `main()`.
 * Prisma NO carga `.env.local`; las SEED_*_PASSWORD viven en `.env` (gitignored).
 */

// Fragmento del host de la branch Neon `dev` del repo (mismo que usan los
// scripts ya guardados). Si el connection string lo contiene, es dev.
const DEV_HOST_FRAGMENT = 'ep-quiet-waterfall-acv0fpll'

// Destinos locales aceptados además de la branch dev.
const LOCAL_FRAGMENTS = ['localhost', '127.0.0.1'] as const

function looksDevOrLocal(databaseUrl: string): boolean {
  if (databaseUrl.includes(DEV_HOST_FRAGMENT)) {
    return true
  }
  return LOCAL_FRAGMENTS.some((fragment) => databaseUrl.includes(fragment))
}

function extractHost(databaseUrl: string): string {
  return databaseUrl.match(/@([^/?]+)/)?.[1] ?? '(host desconocido)'
}

/**
 * Aborta el proceso si el seed apunta a un destino que no parece dev/local.
 * Pensado para ser la PRIMERA línea de `main()` en cualquier seed que mute datos.
 *
 * @param seedName Nombre del seed, solo para mensajes (ej. 'seed.ts').
 */
export function assertDevSeedTarget(seedName: string): void {
  if (process.env.ALLOW_PROD_SEED === '1') {
    console.warn(
      `⚠️  ${seedName}: ALLOW_PROD_SEED=1 — guard anti-prod DESHABILITADO. ` +
        'Confirmá que DATABASE_URL es el destino correcto antes de continuar.',
    )
    return
  }

  const databaseUrl = process.env.DATABASE_URL ?? ''

  if (databaseUrl.trim() === '') {
    console.error(
      `ABORT (${seedName}): DATABASE_URL no está seteada. ` +
        'Configurá la env de dev antes de seedear.',
    )
    process.exit(1)
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(
      `ABORT (${seedName}): NODE_ENV=production. Este seed solo corre en dev. ` +
        'Override explícito: ALLOW_PROD_SEED=1',
    )
    process.exit(1)
  }

  if (!looksDevOrLocal(databaseUrl)) {
    console.error(
      `ABORT (${seedName}): el host de DATABASE_URL "${extractHost(databaseUrl)}" ` +
        `no parece dev/local (esperado: contener "${DEV_HOST_FRAGMENT}", ` +
        '"localhost" o "127.0.0.1"). ' +
        'Si realmente querés correr contra este destino: ALLOW_PROD_SEED=1',
    )
    process.exit(1)
  }
}

/**
 * Devuelve la password de seed desde una env var. Sin default por diseño:
 * si falta, aborta con un mensaje claro en vez de sembrar un secreto conocido.
 *
 * @param envVarName Nombre de la variable (ej. 'SEED_ADMIN_PASSWORD').
 */
export function requireSeedPassword(envVarName: string): string {
  const value = process.env[envVarName]

  if (value === undefined || value.trim() === '') {
    console.error(
      `ABORT: falta la variable de entorno ${envVarName}. ` +
        'Seteala en .env (dev) — sin default por seguridad. Ver .env.example.',
    )
    process.exit(1)
  }

  return value
}
