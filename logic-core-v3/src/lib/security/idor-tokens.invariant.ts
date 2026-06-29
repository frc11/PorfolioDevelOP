/**
 * Invariante de seguridad — corre SIN DB ni server:
 *
 *   npm run check:invariant:security
 *   (o: npx ts-node src/lib/security/idor-tokens.invariant.ts)
 *
 * Prueba, de forma ejecutable, las dos primitivas de autorización que cierran
 * los IDOR de este sprint:
 *   Vía 1 — token firmado por-contacto del opt-out de email-marketing
 *           (endpoint /api/email/optout/[contactId]).
 *   Vía 2 — decisión de scope de org: nunca se confía el organizationId del
 *           cliente; se deriva de la sesión y el parámetro debe coincidir.
 *
 * Importa solo módulos puros (HMAC sobre `crypto` nativo + comparación de
 * strings) — cero acceso a Neon, cero request context.
 */
import assert from 'node:assert/strict'
import {
  signEmailContactOptOutToken,
  verifyEmailContactOptOutToken,
  buildEmailContactOptOutUrl,
} from '../email/unsubscribe-token.ts'
import { resolveScopedOrgId } from './org-scope.ts'

// El módulo de tokens lee el secret en runtime (getSecret()). Para el chequeo
// puro alcanza con un secret de test si el entorno no trae uno.
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? 'invariant-test-secret'

// ============================================================
// Vía 1 — token de opt-out por contacto
// ============================================================
const CONTACT_A = 'ckcontactaaaaaaaaaaaaaaaaa'
const CONTACT_B = 'ckcontactbbbbbbbbbbbbbbbbb'

const tokenA = signEmailContactOptOutToken(CONTACT_A)

// 1. El token legítimo del propio contacto verifica → la baja real funciona.
assert.equal(
  verifyEmailContactOptOutToken(CONTACT_A, tokenA),
  true,
  'el token legítimo del contacto debe verificar',
)

// 2. Sin token / token vacío / basura → rechazado (no se actúa sobre nadie).
assert.equal(verifyEmailContactOptOutToken(CONTACT_A, ''), false, 'token vacío debe rechazarse')
assert.equal(
  verifyEmailContactOptOutToken(CONTACT_A, 'no-es-un-token-valido'),
  false,
  'token basura debe rechazarse',
)

// 3. El token de OTRO contacto NO sirve para A → cross-contact IDOR cerrado.
const tokenB = signEmailContactOptOutToken(CONTACT_B)
assert.notEqual(tokenA, tokenB, 'cada contacto debe tener un token distinto')
assert.equal(
  verifyEmailContactOptOutToken(CONTACT_A, tokenB),
  false,
  'el token de B no debe valer para A (IDOR)',
)

// 4. Token manipulado (1 char) → rechazado.
const tampered = (tokenA[0] === 'x' ? 'y' : 'x') + tokenA.slice(1)
assert.equal(
  verifyEmailContactOptOutToken(CONTACT_A, tampered),
  false,
  'un token alterado debe rechazarse',
)

// 5. La URL de baja lleva el token firmado (el contactId crudo deja de ser la
//    única llave de acción).
const url = buildEmailContactOptOutUrl(CONTACT_A)
assert.ok(url.includes(`/api/email/optout/${CONTACT_A}`), 'la URL apunta al endpoint del contacto')
assert.ok(url.includes(`token=${tokenA}`), 'la URL debe incluir el token firmado')

// ============================================================
// Vía 2 — scope de org derivado de la sesión
// ============================================================
const ORG_SESSION = 'org_session_123'
const ORG_OTHER = 'org_other_456'

// 6. Sin sesión → siempre null (rechazo), aunque el cliente mande un org.
assert.equal(
  resolveScopedOrgId(null, ORG_OTHER),
  null,
  'sin sesión no se opera sobre ninguna org',
)

// 7. Org del cliente distinta a la de la sesión → null → cross-tenant cerrado.
assert.equal(
  resolveScopedOrgId(ORG_SESSION, ORG_OTHER),
  null,
  'un organizationId ajeno al de la sesión debe rechazarse',
)

// 8. Coincide → se opera sobre la org de la SESIÓN.
assert.equal(
  resolveScopedOrgId(ORG_SESSION, ORG_SESSION),
  ORG_SESSION,
  'org de sesión y parámetro coinciden → se opera',
)

// 9. Defensivo: si la action no recibe org por parámetro, usa la de la sesión.
assert.equal(
  resolveScopedOrgId(ORG_SESSION, null),
  ORG_SESSION,
  'sin parámetro, se usa la org de la sesión',
)

console.log(
  '✓ invariante IDOR OK: token de opt-out por-contacto y scope de org desde ' +
    'la sesión cierran el acceso cruzado (Vía 1 + Vía 2).',
)
