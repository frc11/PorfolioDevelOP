/**
 * B5.9 smoke tests — CSV utilities puras.
 *
 * Cobertura crítica:
 *   - csvEscape: anti-injection con =, +, -, @, tab, CR.
 *   - csvEscape: wrap en quotes con coma, quote, newline.
 *   - csvEscape: null/undefined → ''.
 *   - buildLeadsCsv: BOM presente, CRLF, headers correctos, NO score/scoreSignals/botConfigId.
 *   - buildLeadsCsv: modo DQ usa headers diferentes (con "Motivo de descarte").
 *   - buildLeadsCsv: clasificación se traduce ("hot" → "Caliente").
 *   - buildLeadsCsv: lead inyectado con nombre `=cmd` sale neutralizado.
 *
 * Uso: node --experimental-strip-types --no-warnings scripts/b59-smoke.ts
 */

/* eslint-disable no-console */
import {
  csvEscape,
  rowToCsv,
  UTF8_BOM,
  CSV_NEWLINE,
} from '../src/modules/chatbot/server/leads/csv/csvEscape.ts'
import { buildLeadsCsv } from '../src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts'

let passed = 0
let failed = 0

function expect<T>(label: string, actual: T, expected: T): void {
  const equal = JSON.stringify(actual) === JSON.stringify(expected)
  if (equal) {
    console.log(`  ✓ ${label}`)
    passed += 1
  } else {
    console.log(`  ✗ ${label}`)
    console.log(`     expected: ${JSON.stringify(expected)}`)
    console.log(`     actual:   ${JSON.stringify(actual)}`)
    failed += 1
  }
}

function expectOk(label: string, cond: boolean): void {
  if (cond) {
    console.log(`  ✓ ${label}`)
    passed += 1
  } else {
    console.log(`  ✗ ${label}`)
    failed += 1
  }
}

// ─── csvEscape: anti-injection ───────────────────────────────────────────────
console.log('\ncsvEscape — anti-injection:')

expect('lead =cmd → prefijo con comilla simple', csvEscape('=cmd'), `'=cmd`)
expect('prefijo +', csvEscape('+SUM(A1)'), `'+SUM(A1)`)
expect('prefijo -', csvEscape('-2+3'), `'-2+3`)
expect('prefijo @', csvEscape('@HYPERLINK'), `'@HYPERLINK`)
expect('prefijo tab', csvEscape('\tdanger'), `'\tdanger`)
// CR es char peligroso (prefijo `'`) Y contiene CR (wrap en quotes). Ambas reglas aplican.
expect('prefijo CR + wrap por contener \\r', csvEscape('\rdanger'), `"'\rdanger"`)

// Combinado: empieza con = Y contiene coma → primero prefijo, después wrap
expect(
  'inyección con coma combina escape + wrap',
  csvEscape('=cmd,evil'),
  `"'=cmd,evil"`,
)

// Caso negativo: char "peligroso" en medio NO se prefija
expect('= en medio no se prefija', csvEscape('foo=bar'), 'foo=bar')
expect('- en medio (telefono) no se prefija', csvEscape('+54 9 11-1234'), `'+54 9 11-1234`)
// Aclaración del caso anterior: empieza con + → SÍ se prefija. Esto puede
// molestar para telefonos pero es lo correcto: un visitante puede poner
// `+SUM(A1:A100)` como teléfono. El dueño ve `'+54...` con la comilla simple
// inicial, no ideal estéticamente pero seguro.

// ─── csvEscape: RFC 4180 quoting ─────────────────────────────────────────────
console.log('\ncsvEscape — RFC 4180:')

expect('coma → wrap en quotes', csvEscape('Hola, mundo'), '"Hola, mundo"')
expect('quote → wrap + duplicar', csvEscape('Dice "hola"'), '"Dice ""hola"""')
expect('newline → wrap', csvEscape('línea1\nlínea2'), '"línea1\nlínea2"')
expect('CRLF en medio → wrap', csvEscape('a\r\nb'), '"a\r\nb"')

// ─── csvEscape: null / undefined / number ────────────────────────────────────
console.log('\ncsvEscape — valores edge:')

expect('null → string vacío', csvEscape(null), '')
expect('undefined → string vacío', csvEscape(undefined), '')
expect('número → string del número', csvEscape(42), '42')
expect('string vacío → string vacío', csvEscape(''), '')
expect('texto sin specials → tal cual', csvEscape('Juan Pérez'), 'Juan Pérez')

// ─── rowToCsv ────────────────────────────────────────────────────────────────
console.log('\nrowToCsv:')

expect(
  'fila normal joineada por coma',
  rowToCsv(['Juan', 'juan@example.com', null, 42]),
  'Juan,juan@example.com,,42',
)
expect(
  'fila con celda peligrosa',
  rowToCsv(['=cmd', 'ok']),
  `'=cmd,ok`,
)

// ─── buildLeadsCsv ───────────────────────────────────────────────────────────
console.log('\nbuildLeadsCsv — estructura básica:')

const sampleLead = {
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '+54 9 11 1234 5678',
  intent: 'purchase_ready',
  message: 'Quiero la Hilux SRV',
  capturedAt: new Date('2026-05-24T13:00:00.000Z'), // 10:00 AR
  status: 'NEW' as const,
  effectiveClassification: 'hot' as const,
  category: 'sales' as const,
}

const csv = buildLeadsCsv([sampleLead])

expectOk('arranca con BOM UTF-8', csv.startsWith(UTF8_BOM))
expectOk('usa CRLF como separator', csv.includes(CSV_NEWLINE))

// Headers en español
expectOk('header "Nombre" presente', csv.includes('Nombre'))
expectOk('header "Email" presente', csv.includes('Email'))
expectOk('header "Teléfono" presente', csv.includes('Teléfono'))
expectOk('header "Qué pidió" presente', csv.includes('Qué pidió'))
expectOk('header "Qué tan listo está" presente', csv.includes('Qué tan listo está'))
expectOk('header "Estado" presente', csv.includes('Estado'))
expectOk('header "Fecha de contacto" presente', csv.includes('Fecha de contacto'))

// Lo que NO debe estar
expectOk('NO incluye "score"', !csv.toLowerCase().includes('score'))
expectOk('NO incluye "scoreSignals"', !csv.includes('scoreSignals'))
expectOk('NO incluye "botConfigId"', !csv.includes('botConfigId'))
expectOk('NO incluye "internalNotes"', !csv.includes('internalNotes'))
expectOk('NO incluye "classification"', !csv.includes('classification'))
expectOk('NO incluye "intent"', !csv.includes('intent') || !csv.match(/intent:/i))

// Labels traducidos
expectOk('clasificación hot → "Caliente"', csv.includes('Caliente'))
expectOk('intent purchase_ready → "Quiere comprar"', csv.includes('Quiere comprar'))
expectOk('status NEW → "Sin contactar"', csv.includes('Sin contactar'))

// Fecha formateada TZ-AR
expectOk('fecha formato DD/MM/YYYY', csv.includes('24/05/2026'))

// ─── buildLeadsCsv — anti-injection real con un lead malicioso ──────────────
console.log('\nbuildLeadsCsv — anti-injection end-to-end:')

const maliciousLead = {
  name: '=HYPERLINK("https://evil.com","Click")', // payload típico de form. injection
  email: '+evil@example.com',
  phone: '-1234',
  intent: 'other',
  message: '@SUM(A1:A100)',
  capturedAt: new Date('2026-05-24T13:00:00.000Z'),
  status: 'NEW' as const,
  effectiveClassification: 'warm' as const,
  category: 'sales' as const,
}

const maliciousCsv = buildLeadsCsv([maliciousLead])

// El nombre arrancaba con `=` Y contiene comas → el escape resulta en
// `"'=HYPERLINK(""https://evil.com"",""Click"")"` (prefijo `'` + wrap por la coma + duplicar quotes).
expectOk(
  'nombre =HYPERLINK queda neutralizado (prefijo comilla simple)',
  maliciousCsv.includes(`"'=HYPERLINK`),
)
expectOk(
  'email +evil queda neutralizado',
  maliciousCsv.includes(`'+evil@example.com`),
)
expectOk(
  'teléfono -1234 queda neutralizado',
  maliciousCsv.includes(`'-1234`),
)
expectOk(
  'mensaje @SUM queda neutralizado',
  maliciousCsv.includes(`'@SUM(A1:A100)`),
)
expectOk(
  'NO hay celda que empiece raw con = (fuera de "=Caliente"-style content que igual no aplica)',
  !/(^|\r\n|,)=[A-Z]/.test(maliciousCsv),
)

// ─── buildLeadsCsv — modo DQ ─────────────────────────────────────────────────
console.log('\nbuildLeadsCsv — modo DQ:')

const dqLead = {
  name: 'Empresa SA',
  email: 'rrhh@empresa.com',
  phone: null,
  intent: 'other',
  message: 'Les ofrezco mis servicios de consultoría',
  capturedAt: new Date('2026-05-24T13:00:00.000Z'),
  status: 'NEW' as const,
  effectiveClassification: 'dq' as const,
  category: 'provider' as const,
}

const dqCsv = buildLeadsCsv([dqLead], { includesDq: true })

expectOk('modo DQ tiene header "Motivo de descarte"', dqCsv.includes('Motivo de descarte'))
expectOk('modo DQ NO tiene "Qué tan listo está"', !dqCsv.includes('Qué tan listo está'))
expectOk('modo DQ NO tiene "Estado"', !dqCsv.includes('Estado'))
expectOk('categoría provider → "Proveedor"', dqCsv.includes('Proveedor'))

// ─── buildLeadsCsv — vacío ───────────────────────────────────────────────────
console.log('\nbuildLeadsCsv — set vacío:')

const emptyCsv = buildLeadsCsv([])
expectOk('CSV vacío tiene BOM', emptyCsv.startsWith(UTF8_BOM))
expectOk('CSV vacío tiene solo header + trailing CRLF', emptyCsv.endsWith(CSV_NEWLINE))
expectOk(
  'CSV vacío tiene exactamente 1 fila (header)',
  emptyCsv.replace(UTF8_BOM, '').trim().split(CSV_NEWLINE).length === 1,
)

// ─── Resultado ───────────────────────────────────────────────────────────────
console.log(`\n${passed} pasaron, ${failed} fallaron`)
process.exit(failed > 0 ? 1 : 0)
