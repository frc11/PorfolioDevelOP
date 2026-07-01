/**
 * LeadOS — Sprint A.2: importación MASIVA de prospectos del setter (CSV).
 *
 * Módulo PURO (parser + mapeo + dedup intra-lote + construcción del alta). Cero
 * acceso a DB y cero `'use server'`: se importa IGUAL desde el cliente (preview
 * instantáneo del archivo) y desde el server action (verdad autoritativa), y el
 * chequeo de invariante lo corre sin tocar Neon.
 *
 * El aislamiento NO vive acá: vive en `ownedLeadCreateData` (isolation.ts), que
 * este módulo reusa fila por fila vía `construirAltasLote`. El dueño de CADA lead
 * del lote se DERIVA de la sesión en el server; nada del archivo lo decide. La
 * validación por fila (entrada NO confiable) la aplica el llamador con el
 * `NuevoProspectoSchema` de A.1 — el MISMO contrato del alta unitaria.
 *
 * Único import: `./isolation.ts` (puro). Así el invariante que importa este
 * módulo no arrastra nada server-only ni rompe ts-node.
 */
import {
  ownedLeadCreateData,
  type OwnedLeadFields,
} from './isolation.ts'

/** Tope de filas por tanda (entrada NO confiable: acota el costo del lote). */
export const MAX_FILAS_IMPORT = 500

/**
 * Columnas del formato FIJO v1. `key` calza con `OwnedLeadFields`; `header` es el
 * nombre canónico de la plantilla y `aliases` los aceptados (todo se coteja
 * normalizado: sin acentos, sin caja). Mapeo flexible de columnas = futuro.
 */
export type ColumnaImport = {
  key: keyof OwnedLeadFields
  header: string
  required: boolean
  aliases: string[]
}

export const COLUMNAS_IMPORT: ColumnaImport[] = [
  { key: 'businessName', header: 'nombre', required: true, aliases: ['negocio', 'business', 'businessname', 'empresa'] },
  { key: 'contactName', header: 'contacto', required: false, aliases: ['contactname', 'referente', 'persona'] },
  { key: 'phone', header: 'telefono', required: false, aliases: ['tel', 'whatsapp', 'wpp', 'celular', 'phone'] },
  { key: 'email', header: 'email', required: false, aliases: ['mail', 'correo', 'e-mail'] },
  { key: 'industry', header: 'rubro', required: false, aliases: ['industria', 'industry', 'sector'] },
  { key: 'zone', header: 'zona', required: false, aliases: ['zone', 'barrio', 'ubicacion', 'localidad'] },
  { key: 'instagramUrl', header: 'instagram', required: false, aliases: ['ig', 'instagramurl', 'insta'] },
  { key: 'currentWebUrl', header: 'web', required: false, aliases: ['sitio', 'website', 'currentweburl', 'url'] },
  { key: 'notes', header: 'notas', required: false, aliases: ['nota', 'notes', 'observaciones', 'obs'] },
]

/**
 * Plantilla descargable: encabezado canónico + una fila de ejemplo. El ejemplo
 * usa comillas en los campos con coma para mostrar el formato correcto.
 */
export const PLANTILLA_CSV: string =
  COLUMNAS_IMPORT.map((c) => c.header).join(',') +
  '\n' +
  [
    'Café de la Esquina',
    'Marina (dueña)',
    '11 5555 5555',
    'hola@cafedelaesquina.com',
    'Gastronomía',
    '"Palermo, CABA"',
    'https://instagram.com/cafedelaesquina',
    '',
    '"Lo vi en IG, postean poco y no tienen web."',
  ].join(',') +
  '\n'

/** Normaliza para cotejo de duplicados: sin bordes, sin acentos, sin caja. */
export function normalizarNombre(texto: string): string {
  return texto
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/**
 * Parser CSV correcto (RFC-4180): respeta campos entre comillas con comas,
 * saltos de línea y comillas escapadas (`""`). Tolera CRLF, LF y CR sueltos, y
 * un BOM al inicio. NO recorta los valores — eso lo hace el schema de A.1
 * (`emptyToUndefined`). Devuelve la matriz cruda fiel; el descarte de filas
 * vacías ocurre en `mapearFilas`.
 *
 * El split naíf por `,` del módulo de email-marketing rompe con comas dentro de
 * "Palermo, CABA" o de las notas — por eso acá va un parser de verdad.
 */
export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  const endField = () => {
    row.push(field)
    field = ''
  }
  const endRow = () => {
    endField()
    rows.push(row)
    row = []
  }

  while (i < text.length) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }

    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === ',') {
      endField()
      i++
      continue
    }
    if (ch === '\n') {
      endRow()
      i++
      continue
    }
    if (ch === '\r') {
      endRow()
      if (text[i + 1] === '\n') i++
      i++
      continue
    }
    field += ch
    i++
  }
  // Último campo/fila (el archivo puede no terminar en salto de línea).
  endRow()

  // Una sola fila final con un campo vacío = el salto de línea terminal. Las
  // demás filas en blanco se descartan en `mapearFilas` (todas las celdas vacías).
  if (
    rows.length > 0 &&
    rows[rows.length - 1].length === 1 &&
    rows[rows.length - 1][0] === ''
  ) {
    rows.pop()
  }
  return rows
}

/** Una fila cruda mapeada a campos, con su número de línea en el archivo. */
export type FilaCruda = {
  /** Línea en el archivo (encabezado = 1; primera fila de datos = 2). */
  fila: number
  data: OwnedLeadFields
}

export type MapeoResultado =
  | { ok: false; error: string }
  | { ok: true; filas: FilaCruda[] }

/**
 * Resuelve el encabezado (por header canónico o alias, normalizado) y arma una
 * `FilaCruda` por cada renglón de datos no vacío. Falla si falta la única
 * columna obligatoria (`nombre`). Las celdas se pasan crudas: el schema de A.1
 * recorta y normaliza vacío→undefined.
 */
export function mapearFilas(matriz: string[][]): MapeoResultado {
  if (matriz.length === 0) {
    return { ok: false, error: 'El archivo está vacío.' }
  }

  const encabezado = matriz[0].map((h) => normalizarNombre(h))
  const indices = new Map<keyof OwnedLeadFields, number>()

  for (const col of COLUMNAS_IMPORT) {
    const candidatos = [normalizarNombre(col.header), ...col.aliases.map(normalizarNombre)]
    const idx = encabezado.findIndex((h) => candidatos.includes(h))
    if (idx !== -1) indices.set(col.key, idx)
  }

  if (!indices.has('businessName')) {
    return {
      ok: false,
      error:
        'Falta la columna "nombre" (el negocio). Descargá la plantilla y respetá los encabezados.',
    }
  }

  const cell = (cols: string[], key: keyof OwnedLeadFields): string | undefined => {
    const idx = indices.get(key)
    if (idx === undefined) return undefined
    return cols[idx]
  }

  const filas: FilaCruda[] = []
  for (let r = 1; r < matriz.length; r++) {
    const cols = matriz[r]
    // Saltar renglones totalmente vacíos (líneas en blanco intermedias o finales).
    if (cols.every((c) => c.trim() === '')) continue

    filas.push({
      fila: r + 1, // 1-based, contando el encabezado como línea 1.
      data: {
        businessName: cell(cols, 'businessName') ?? '',
        contactName: cell(cols, 'contactName'),
        phone: cell(cols, 'phone'),
        email: cell(cols, 'email'),
        industry: cell(cols, 'industry'),
        zone: cell(cols, 'zone'),
        instagramUrl: cell(cols, 'instagramUrl'),
        currentWebUrl: cell(cols, 'currentWebUrl'),
        notes: cell(cols, 'notes'),
      },
    })
  }

  return { ok: true, filas }
}

/** Fila válida lista para el cotejo de duplicados y el alta. */
export type FilaValida = {
  fila: number
  data: OwnedLeadFields
  /** Nombre normalizado (cacheado para dedup en lote / cartera / sistema). */
  norm: string
}

export type FilaDuplicada = {
  fila: number
  nombre: string
  motivo: 'en-archivo' | 'en-cartera' | 'en-sistema'
}

/**
 * Deduplica DENTRO del lote por nombre normalizado: conserva la primera aparición,
 * marca las repetidas como `en-archivo`. Antes de tocar cartera/sistema —así una
 * lista con el mismo negocio dos veces no crea dos leads.
 */
export function dedupEnLote(validas: FilaValida[]): {
  unicas: FilaValida[]
  duplicadas: FilaDuplicada[]
} {
  const vistos = new Set<string>()
  const unicas: FilaValida[] = []
  const duplicadas: FilaDuplicada[] = []

  for (const f of validas) {
    if (vistos.has(f.norm)) {
      duplicadas.push({ fila: f.fila, nombre: f.data.businessName.trim(), motivo: 'en-archivo' })
      continue
    }
    vistos.add(f.norm)
    unicas.push(f)
  }
  return { unicas, duplicadas }
}

/**
 * Construye el alta de CADA fila reusando el builder aislado de A.1. El dueño se
 * fuerza a la sesión campo por campo dentro de `ownedLeadCreateData` — un
 * `assignedToId`/`owner` que venga del archivo NI se lee. Es el aislamiento por
 * construcción aplicado al lote: el invariante (`prospecto-import.invariant.ts`)
 * lo verifica sobre ESTA función, sin DB.
 */
export function construirAltasLote(
  datos: OwnedLeadFields[],
  userId: string,
): ReturnType<typeof ownedLeadCreateData>[] {
  return datos.map((d) => ownedLeadCreateData(d, userId))
}

/** Fila descartada por validación (entrada NO confiable rebotada, no rompe la tanda). */
export type FilaInvalida = {
  fila: number
  /** Nombre crudo si lo había — para que el reporte señale cuál fila revisar. */
  nombre: string | null
  motivo: string
}

/** Reporte final de una tanda: lo creado y lo rebotado, con su porqué. */
export type ImportReport = {
  creados: number
  invalidas: FilaInvalida[]
  duplicadas: FilaDuplicada[]
  /** Filas de datos consideradas (excluye encabezado y renglones vacíos). */
  totalFilas: number
}
