/**
 * PA-2 — Suite del helper de escape CSV (copia de terreno neutro en src/lib/csv/).
 * Fija anti-inyección de fórmula (= + - @ tab CR), quoting RFC 4180, el orden
 * anti-injection→wrap, y rowToCsv. Es el gate del sprint.
 * Corre: npx tsx src/lib/csv/__tests__/csv-escape.test.ts
 */
import assert from 'node:assert/strict'
import { CSV_NEWLINE, UTF8_BOM, csvEscape, rowToCsv } from '../csv-escape'

function run() {
  // --- Anti-fórmula: prefijo ' si arranca con char peligroso ---
  assert.equal(csvEscape('=cmd()'), "'=cmd()", '= prefijado')
  assert.equal(csvEscape('+1'), "'+1", '+ prefijado')
  assert.equal(csvEscape('-1'), "'-1", '- prefijado')
  assert.equal(csvEscape('@x'), "'@x", '@ prefijado')
  assert.equal(csvEscape('\tx'), "'\tx", 'tab inicial prefijado')
  assert.equal(
    csvEscape('\rx'),
    '"\'\rx"',
    'CR inicial: prefijado Y wrapped (único char que dispara ambos caminos)'
  )
  assert.equal(
    csvEscape('=HYPERLINK("https://evil.com","x")'),
    '"\'=HYPERLINK(""https://evil.com"",""x"")"',
    'payload real: prefijo + wrap + quotes duplicadas'
  )
  console.log('✓ anti-fórmula: = + - @ tab prefijados con comilla simple')

  // --- Caso real documentado: teléfono con + se prefija (Excel no lo ejecuta) ---
  assert.equal(
    csvEscape('+5493815551234'),
    "'+5493815551234",
    'teléfono con + inicial se prefija — correcto, no es fórmula al abrir'
  )
  console.log('✓ teléfono +549... se prefija (documentado, no es regresión)')

  // --- Quoting RFC 4180 ---
  assert.equal(csvEscape('a,b'), '"a,b"', 'coma -> wrapped')
  assert.equal(csvEscape('say "hi"'), '"say ""hi"""', 'comilla interna duplicada + wrapped')
  assert.equal(csvEscape('line1\nline2'), '"line1\nline2"', 'newline -> wrapped')
  assert.equal(csvEscape('a\rb'), '"a\rb"', 'CR interno -> wrapped')
  console.log('✓ quoting RFC 4180: coma, comilla, newline, CR')

  // --- Orden: anti-injection PRIMERO, wrap DESPUÉS (el ' queda DENTRO de las quotes) ---
  assert.equal(csvEscape('=1,2'), '"\'=1,2"', 'prefijo primero, wrap después')
  assert.ok(
    csvEscape('=1,2').startsWith('"\''),
    'la comilla simple queda dentro del wrap, no fuera'
  )
  console.log('✓ orden anti-injection → wrap (comilla simple dentro de las quotes)')

  // --- null/undefined/number ---
  assert.equal(csvEscape(null), '', 'null -> vacío')
  assert.equal(csvEscape(undefined), '', 'undefined -> vacío')
  assert.equal(csvEscape(42), '42', 'number -> String sin comillas')
  assert.equal(csvEscape(-7), "'-7", 'number negativo: String("-7") arranca con - -> prefijado')
  console.log('✓ null/undefined -> "" · number -> String')

  // --- Valor limpio: sale tal cual, sin comillas de más ---
  assert.equal(csvEscape('Juan Pérez'), 'Juan Pérez', 'valor limpio intacto')
  assert.equal(csvEscape('juan@mail.com'), 'juan@mail.com', '@ NO inicial no dispara prefijo')
  assert.equal(
    csvEscape('2026-07-11T12:00:00.000Z'),
    '2026-07-11T12:00:00.000Z',
    'fecha ISO intacta (arranca con dígito)'
  )
  console.log('✓ valores limpios salen tal cual')

  // --- rowToCsv: array mixto, cada celda escapeada, join con coma ---
  assert.equal(
    rowToCsv(['a', 42, null, '=x', 'b,c']),
    'a,42,,\'=x,"b,c"',
    'línea con celdas mixtas escapeadas'
  )
  assert.equal(
    rowToCsv(['Cliente', 'Bot', 'Nombre', 'Email', 'Teléfono', 'Intent', 'Status', 'Fecha']),
    'Cliente,Bot,Nombre,Email,Teléfono,Intent,Status,Fecha',
    'los headers actuales salen byte-idénticos al join(",") previo'
  )
  console.log('✓ rowToCsv: celdas mixtas + headers idénticos a los actuales')

  // --- Constantes ---
  // charCodeAt pina el codepoint de forma VISIBLE: el literal U+FEFF es
  // invisible en el source y un formatter podría alterarlo en silencio.
  assert.equal(UTF8_BOM.charCodeAt(0), 0xfeff, 'BOM = U+FEFF')
  assert.equal(UTF8_BOM.length, 1, 'BOM es un solo code unit')
  assert.equal(CSV_NEWLINE, '\r\n', 'separador CRLF')
  console.log('✓ constantes UTF8_BOM y CSV_NEWLINE')

  console.log('✓ csv-escape: TODOS los asserts pasaron')
}

run()
