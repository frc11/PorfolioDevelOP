'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSetter } from '@/lib/auth-guards'
import { fail, ok, toErrorMessage, type ActionResult } from '@/lib/action-utils'
import { ownedListWhere } from '@/lib/leados/isolation'
import {
  construirAltasLote,
  dedupEnLote,
  mapearFilas,
  MAX_FILAS_IMPORT,
  normalizarNombre,
  parseCsv,
  type FilaInvalida,
  type FilaValida,
  type ImportReport,
} from '@/lib/leados/prospecto-import'
import { NuevoProspectoSchema } from './prospecto.schemas'

/**
 * Sprint A.2 — Importación MASIVA de prospectos propios del setter desde un CSV.
 * El lote ENTERO queda del setter de la sesión, frío, en FICHA — la versión en
 * tanda del alta unitaria de A.1, sin un solo lead fugado.
 *
 * Aislamiento (invariante #1, lado escritura, EXTENDIDO al lote): el dueño de
 * cada fila lo deriva `construirAltasLote → ownedLeadCreateData` del `userId` de
 * `requireSetter()`. Aunque el archivo traiga una columna `assignedToId`/`owner`,
 * NI se lee — el builder arma cada registro campo por campo. Anti-IDOR de
 * escritura en lote, verificado sin DB por `prospecto-import.invariant.ts`.
 *
 * Entrada NO confiable: el contenido del archivo se valida fila por fila con el
 * MISMO `NuevoProspectoSchema` de A.1. Nada del archivo se ejecuta ni se confía;
 * lo inválido se REPORTA y no rompe la tanda.
 */
export async function importarProspectos(
  formData: FormData,
): Promise<ActionResult<ImportReport>> {
  try {
    const userId = await requireSetter()

    const csv = formData.get('csv')
    if (typeof csv !== 'string' || csv.trim() === '') {
      return fail('El archivo está vacío o no se pudo leer.')
    }

    // ── 1. Parseo + mapeo del encabezado (estructura del archivo) ──
    const mapeo = mapearFilas(parseCsv(csv))
    if (!mapeo.ok) return fail(mapeo.error)
    if (mapeo.filas.length === 0) {
      return fail('El archivo no tiene filas de datos debajo del encabezado.')
    }
    if (mapeo.filas.length > MAX_FILAS_IMPORT) {
      return fail(
        `El archivo tiene ${mapeo.filas.length} filas; el máximo por tanda es ${MAX_FILAS_IMPORT}. Dividilo en partes.`,
      )
    }

    // ── 2. Validación por fila (entrada NO confiable, mismo contrato que A.1) ──
    const invalidas: FilaInvalida[] = []
    const validas: FilaValida[] = []
    for (const f of mapeo.filas) {
      const parsed = NuevoProspectoSchema.safeParse(f.data)
      if (!parsed.success) {
        invalidas.push({
          fila: f.fila,
          nombre: f.data.businessName.trim() || null,
          motivo: parsed.error.issues[0]?.message ?? 'Fila inválida.',
        })
        continue
      }
      validas.push({
        fila: f.fila,
        data: parsed.data,
        norm: normalizarNombre(parsed.data.businessName),
      })
    }

    // ── 3. Dedup dentro del archivo (mismo negocio repetido en la lista) ──
    const { unicas, duplicadas } = dedupEnLote(validas)

    // ── 4. Dedup contra la cartera (lo que el setter SÍ ve) y contra el sistema ──
    const propios = await prisma.osLead.findMany({
      where: ownedListWhere(userId),
      select: { businessName: true },
    })
    const enCartera = new Set(propios.map((l) => normalizarNombre(l.businessName)))
    const enSistema = await nombresEnSistema()

    const insertables: FilaValida[] = []
    for (const u of unicas) {
      if (enCartera.has(u.norm)) {
        duplicadas.push({ fila: u.fila, nombre: u.data.businessName, motivo: 'en-cartera' })
      } else if (enSistema.has(u.norm)) {
        duplicadas.push({ fila: u.fila, nombre: u.data.businessName, motivo: 'en-sistema' })
      } else {
        insertables.push(u)
      }
    }

    // ── 5. Alta del lote: cada fila por el builder aislado de A.1, atómico ──
    let creados = 0
    if (insertables.length > 0) {
      const altas = construirAltasLote(
        insertables.map((u) => u.data),
        userId,
      )
      const filasCreadas = await prisma.$transaction(
        altas.map((data) => prisma.osLead.create({ data, select: { id: true } })),
      )
      creados = filasCreadas.length

      // Entran a la cola `trabajar` del foco del setter y a la lista de Franco.
      revalidatePath('/setter')
      revalidatePath('/admin/leados')
    }

    return ok({ creados, invalidas, duplicadas, totalFilas: mapeo.filas.length })
  } catch (error) {
    return fail(toErrorMessage(error, 'No se pudo importar la lista'))
  }
}

/**
 * EXCEPCIÓN DELIBERADA y ACOTADA al aislamiento de LECTURA que A.1 blindó.
 *
 * Devuelve el conjunto de nombres (normalizados) que existen EN TODO el sistema,
 * sin distinción de dueño. Cruza el aislamiento de lectura SOLO en lo mínimo: un
 * bit de EXISTENCIA por nombre. NO expone de quién es el lead, ni ningún otro
 * dato, ni los nombres ajenos — el reporte al cliente solo señala los nombres que
 * el PROPIO setter intentó importar (los que él ya conocía por su archivo).
 *
 * Defendible porque develOP es un EQUIPO, no multi-tenant de clientes distintos:
 * evitar que una tanda importada genere duplicados a nivel equipo (que Franco
 * tendría que reconciliar) vale el bit. El invariante de NO-ROBO de escritura
 * queda intacto: detectar existencia no toca el dueño de nada. Si esto creciera,
 * conviene `unaccent` + índice en vez de traer todos los nombres.
 *
 * Vive en el action (server) — JAMÁS en isolation.ts: ese módulo es el contrato
 * de aislamiento PURO que el invariante verifica sin DB, y esto es justo la
 * excepción, con su propio comentario, fuera de ese contrato.
 */
async function nombresEnSistema(): Promise<Set<string>> {
  const todos = await prisma.osLead.findMany({ select: { businessName: true } })
  return new Set(todos.map((l) => normalizarNombre(l.businessName)))
}
