/**
 * B5.9 — Utilities para exportar leads a CSV.
 *
 * Diseño:
 *  - csvEscape: anti CSV-injection (prefijo `'` para `=+-@\t\r`) + RFC 4180 quoting.
 *  - buildLeadsCsv: headers en español, columnas en lenguaje del dueño,
 *    BOM UTF-8, CRLF, NUNCA score crudo ni jerga interna.
 */

export {
  csvEscape,
  rowToCsv,
  UTF8_BOM,
  CSV_NEWLINE,
} from './csvEscape'

export {
  buildLeadsCsv,
  type LeadForCsv,
  type BuildLeadsCsvOptions,
} from './buildLeadsCsv'
