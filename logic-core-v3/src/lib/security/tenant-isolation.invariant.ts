/**
 * Golden Suite GS.1 — invariante PURO de aislamiento multi-tenant.
 *
 * Corre SIN DB ni server (solo evalúa funciones puras de decisión):
 *
 *   npm run check:invariant:tenant-isolation
 *   (o: npx tsx src/lib/security/tenant-isolation.invariant.ts)
 *
 * Fija, de forma ejecutable, las DOS primitivas puras sobre las que se apoya
 * todo el aislamiento por where-clause del portal (no hay RLS):
 *
 *   1. `callerCanAccessOrg` (`@/lib/auth/assert-ownership`) — decide si un
 *      caller puede tocar un recurso YA cargado, sabiendo su rol. Es el guard
 *      role-aware de las páginas admin con ID dinámico. Hoy SIN test (auditoría
 *      maestra 2026-07, lente SEC §5.2: "assert-ownership.ts:96-107 hoy sin
 *      test").
 *   2. `resolveScopedOrgId` (`@/lib/security/org-scope`) — nunca confía el
 *      organizationId del cliente: lo deriva de la sesión y exige que el
 *      parámetro coincida. Complementa la cobertura de `idor-tokens.invariant`
 *      con la matriz completa de casos borde.
 *
 * Se corre con `tsx` (no `ts-node`) porque `assert-ownership` importa
 * `@/lib/prisma` de forma transitiva y `tsx` resuelve los alias de tsconfig.
 * NO se ejecuta ninguna query — es una prueba de LÓGICA, no de DB.
 */
import assert from 'node:assert/strict'
import type { Role } from '@prisma/client'
import { callerCanAccessOrg } from '../auth/assert-ownership.ts'
import { resolveScopedOrgId } from './org-scope.ts'

const ORG_A = 'org_a_aaaaaaaaaaaaaaaaaaaa'
const ORG_B = 'org_b_bbbbbbbbbbbbbbbbbbbb'

const SUPER_ADMIN = 'SUPER_ADMIN' as Role
const ORG_MEMBER = 'ORG_MEMBER' as Role
// Un tercer rol NO-admin: debe comportarse como ORG_MEMBER (scopeado a su org),
// nunca heredar el bypass del SUPER_ADMIN. Si el enum no tiene SETTER, el cast
// sigue ejercitando la rama "cualquier rol distinto de SUPER_ADMIN".
const SETTER = 'SETTER' as Role

// ============================================================
// 1 — callerCanAccessOrg: bypass de SUPER_ADMIN + scope estricto del resto
// ============================================================

// 1a. SUPER_ADMIN pasa SIEMPRE, aun con recurso de otra org o sin org.
assert.equal(
  callerCanAccessOrg({ role: SUPER_ADMIN, organizationId: ORG_A }, ORG_B),
  true,
  'SUPER_ADMIN opera sobre cualquier org (bypass legítimo, un solo develOP)',
)
assert.equal(
  callerCanAccessOrg({ role: SUPER_ADMIN, organizationId: null }, ORG_B),
  true,
  'SUPER_ADMIN sin org propia igual pasa (el bypass no depende de su org)',
)
assert.equal(
  callerCanAccessOrg({ role: SUPER_ADMIN, organizationId: null }, null),
  true,
  'SUPER_ADMIN pasa incluso si el recurso no tiene org resoluble',
)

// 1b. ORG_MEMBER: solo su propia org.
assert.equal(
  callerCanAccessOrg({ role: ORG_MEMBER, organizationId: ORG_A }, ORG_A),
  true,
  'ORG_MEMBER accede a un recurso de SU org',
)
assert.equal(
  callerCanAccessOrg({ role: ORG_MEMBER, organizationId: ORG_A }, ORG_B),
  false,
  'ORG_MEMBER NUNCA accede a un recurso de OTRA org (cross-tenant read cerrado)',
)

// 1c. Casos borde: recurso sin org, caller sin org.
assert.equal(
  callerCanAccessOrg({ role: ORG_MEMBER, organizationId: ORG_A }, null),
  false,
  'recurso con organizationId null → no se puede afirmar pertenencia → false',
)
assert.equal(
  callerCanAccessOrg({ role: ORG_MEMBER, organizationId: null }, ORG_A),
  false,
  'caller sin org (sesión rota) → false, jamás se cae en un match por coincidencia',
)
assert.equal(
  callerCanAccessOrg({ role: ORG_MEMBER, organizationId: undefined }, ORG_A),
  false,
  'caller con org undefined → false (no colapsa undefined con un org real)',
)
assert.equal(
  callerCanAccessOrg({ role: ORG_MEMBER, organizationId: null }, null),
  false,
  'null === null NO debe habilitar acceso: sin org concreta no hay pertenencia',
)

// 1d. Un tercer rol no-admin NO hereda el bypass: se comporta como ORG_MEMBER.
assert.equal(
  callerCanAccessOrg({ role: SETTER, organizationId: ORG_A }, ORG_A),
  true,
  'rol no-admin con org coincidente accede',
)
assert.equal(
  callerCanAccessOrg({ role: SETTER, organizationId: ORG_A }, ORG_B),
  false,
  'rol no-admin NO hereda el bypass del SUPER_ADMIN sobre otra org',
)

// ============================================================
// 2 — resolveScopedOrgId: matriz completa (jamás confiar el org del cliente)
// ============================================================

// 2a. Sin sesión → siempre null, aunque el cliente mande un org.
assert.equal(resolveScopedOrgId(null, null), null, 'sin sesión ni parámetro → null')
assert.equal(resolveScopedOrgId(null, ORG_B), null, 'sin sesión, con org ajena → null (no se opera)')
assert.equal(resolveScopedOrgId(null, ORG_A), null, 'sin sesión, aun coincidiendo texto → null')

// 2b. Con sesión: el parámetro debe coincidir o se rechaza.
assert.equal(
  resolveScopedOrgId(ORG_A, ORG_B),
  null,
  'org de sesión ≠ org del parámetro → null (cross-tenant cerrado)',
)
assert.equal(
  resolveScopedOrgId(ORG_A, ORG_A),
  ORG_A,
  'sesión y parámetro coinciden → se opera sobre la org de la SESIÓN',
)
assert.equal(
  resolveScopedOrgId(ORG_A, null),
  ORG_A,
  'sin parámetro, se usa la org de la sesión (default defensivo)',
)
// 2c. La org resuelta SIEMPRE es la de la sesión, nunca la del parámetro
//     (aunque coincidan, el valor devuelto proviene de la sesión).
assert.equal(
  resolveScopedOrgId(ORG_A, ORG_A),
  ORG_A,
  'el retorno es el orgId de la SESIÓN, no el string del cliente',
)

// ============================================================
// 3 — Coherencia entre ambas primitivas
// ============================================================
// Un ORG_MEMBER de A pidiendo un recurso/param de B debe ser rechazado por
// AMBOS caminos: por where-clause (resolveScopedOrgId) y por recurso-ya-cargado
// (callerCanAccessOrg). Nunca uno abre lo que el otro cierra.
assert.equal(resolveScopedOrgId(ORG_A, ORG_B), null, 'coherencia: param ajeno → rechazo (scope)')
assert.equal(
  callerCanAccessOrg({ role: ORG_MEMBER, organizationId: ORG_A }, ORG_B),
  false,
  'coherencia: recurso ajeno → rechazo (ownership)',
)

console.log(
  '✓ invariante tenant-isolation OK: callerCanAccessOrg (bypass SUPER_ADMIN + ' +
    'scope estricto del resto) y resolveScopedOrgId (org siempre desde la ' +
    'sesión) cierran el acceso cruzado por las dos vías puras.',
)
