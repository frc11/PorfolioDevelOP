/**
 * FIX-ORIGIN — Invariante de la decisión "¿este GET sin header Origin es
 * same-origin confiable?" (`isSameOriginBypassApplicable` + `isTrustedSameOrigin`).
 *
 * Cero DB, cero network: solo ejercita las dos funciones PURAS de
 * `same-origin.ts` — separadas de `route.ts` justamente para esto (`route.ts`
 * importa `@/modules/chatbot/index.server`, un barrel server-only cuya cadena
 * de imports no carga fuera de webpack/Next — arrastra un `.module.css` de un
 * componente de avatar, preexistente). Los escenarios que SÍ tocan DB (bot
 * activo/inactivo/inexistente, allowlist cross-origin) están en
 * tests/integration/fix-origin-same-origin-config.spec.ts.
 *
 *   npx tsx src/app/api/chatbot/[slug]/config/__tests__/fix-origin-same-origin.invariant.ts
 *   npm run test:fixorigin
 */
import assert from 'node:assert/strict'
import { isSameOriginBypassApplicable, isTrustedSameOrigin } from '../same-origin'

let passed = 0
function check(label: string, fn: () => void): void {
  fn()
  passed += 1
  console.log(`  ✓ ${label}`)
}

const ORIGINAL_NODE_ENV = process.env.NODE_ENV
const ORIGINAL_QA_FLAG = process.env.QA_ALLOW_LOCALHOST

// Next.js declara `NODE_ENV` como `readonly` en su global.d.ts (ver
// node_modules/next/types/global.d.ts) — asignación directa no compila
// (TS2540) y `delete` tampoco (TS2704). `Object.defineProperty` es el
// idioma estándar para este problema conocido de Next: no pasa por el
// setter tipado, así que el `readonly` de TS no aplica. Cero `any`.
function setNodeEnv(value: string): void {
  Object.defineProperty(process.env, 'NODE_ENV', { value, configurable: true, enumerable: true, writable: true })
}
function setEnv(nodeEnv: string, qaFlag: string | undefined): void {
  setNodeEnv(nodeEnv)
  if (qaFlag === undefined) delete process.env.QA_ALLOW_LOCALHOST
  else process.env.QA_ALLOW_LOCALHOST = qaFlag
}
function restoreEnv(): void {
  setEnv(ORIGINAL_NODE_ENV ?? '', ORIGINAL_QA_FLAG)
}

const URL = 'https://develop-portfolio.netlify.app/api/chatbot/develop/config'
const req = (headers: Record<string, string> = {}): Request => new Request(URL, { headers })

console.log('FIX-ORIGIN — fix-origin-same-origin.invariant')

try {
  // ── isSameOriginBypassApplicable: reproduce la condición de rechazo de
  // validateOrigin({origin:null}) — SOLO prod sin flag de QA. ────────────────

  check('prod sin QA flag → aplica (el único caso donde validateOrigin(null) rechazaría)', () => {
    setEnv('production', undefined)
    assert.equal(isSameOriginBypassApplicable(), true)
  })

  check('dev → NO aplica (validateOrigin(null) ya permite ahí, sin cambios)', () => {
    setEnv('development', undefined)
    assert.equal(isSameOriginBypassApplicable(), false)
  })

  check('test/otro NODE_ENV (no "production") → NO aplica', () => {
    setEnv('test', undefined)
    assert.equal(isSameOriginBypassApplicable(), false)
  })

  check('prod CON QA_ALLOW_LOCALHOST=1 → NO aplica (ese flag ya abre origin=null)', () => {
    setEnv('production', '1')
    assert.equal(isSameOriginBypassApplicable(), false)
  })

  check('prod con QA_ALLOW_LOCALHOST en otro valor (no "1") → aplica igual', () => {
    setEnv('production', '0')
    assert.equal(isSameOriginBypassApplicable(), true)
  })

  // ── isTrustedSameOrigin: Sec-Fetch-Site manda; Referer es fallback SOLO si
  // el header falta por completo. ─────────────────────────────────────────

  check("Sec-Fetch-Site: same-origin → confiable, sin importar Referer/Host", () => {
    assert.equal(isTrustedSameOrigin(req({ 'sec-fetch-site': 'same-origin' })), true)
  })

  check('Sec-Fetch-Site: cross-site → NO confiable (explícito, no cae al fallback)', () => {
    assert.equal(
      isTrustedSameOrigin(
        req({ 'sec-fetch-site': 'cross-site', referer: URL, host: 'develop-portfolio.netlify.app' }),
      ),
      false,
    )
  })

  check('Sec-Fetch-Site: same-site → NO confiable (solo same-origin abre, per spec del fix)', () => {
    assert.equal(isTrustedSameOrigin(req({ 'sec-fetch-site': 'same-site' })), false)
  })

  check('Sec-Fetch-Site: none → NO confiable (navegación directa, no es el widget)', () => {
    assert.equal(isTrustedSameOrigin(req({ 'sec-fetch-site': 'none' })), false)
  })

  check('sin Sec-Fetch-Site, Referer con el MISMO host que Host → fallback confiable', () => {
    assert.equal(
      isTrustedSameOrigin(
        req({ referer: 'https://develop-portfolio.netlify.app/', host: 'develop-portfolio.netlify.app' }),
      ),
      true,
    )
  })

  check('sin Sec-Fetch-Site, Referer con host DISTINTO → no confiable', () => {
    assert.equal(
      isTrustedSameOrigin(req({ referer: 'https://otro-sitio.test/', host: 'develop-portfolio.netlify.app' })),
      false,
    )
  })

  check('sin Sec-Fetch-Site, sin Referer (curl/SSR) → no confiable', () => {
    assert.equal(isTrustedSameOrigin(req({ host: 'develop-portfolio.netlify.app' })), false)
  })

  check('sin Sec-Fetch-Site, Referer presente pero sin Host (no debería pasar en HTTP real) → no confiable', () => {
    assert.equal(isTrustedSameOrigin(req({ referer: 'https://develop-portfolio.netlify.app/' })), false)
  })

  check('Referer malformado (no parseable como URL) → no confiable, no explota', () => {
    assert.equal(
      isTrustedSameOrigin(req({ referer: 'no-es-una-url', host: 'develop-portfolio.netlify.app' })),
      false,
    )
  })

  check('sin ningún header → no confiable', () => {
    assert.equal(isTrustedSameOrigin(req({})), false)
  })
} finally {
  restoreEnv()
}

console.log(
  `✓ fix-origin-same-origin invariants OK (${passed} checks): el bypass solo aplica en la condición exacta ` +
    'donde validateOrigin(null) rechazaría hoy (prod, sin QA flag); Sec-Fetch-Site manda sobre el fallback de ' +
    'Referer; un valor explícito distinto de same-origin nunca cae al fallback.',
)
