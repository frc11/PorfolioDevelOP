'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { bulkImportClientsAction } from './actions'
import { toast } from 'sonner'

interface CSVRow {
  organizationName: string
  userEmail: string
  userName: string
  industry: string
  city: string
  whatsappNumber: string
  website?: string
  userPhone?: string
}

interface ImportResult {
  row: number
  email: string
  status: 'success' | 'error'
  error?: string
}

const REQUIRED_HEADERS = [
  'organizationName',
  'userEmail',
  'userName',
  'industry',
  'city',
  'whatsappNumber',
] as const

export function BulkImportClient() {
  const [parsing, setParsing] = useState(false)
  const [rows, setRows] = useState<CSVRow[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [executing, setExecuting] = useState(false)
  const [results, setResults] = useState<ImportResult[] | null>(null)

  function parseCSV(text: string): { rows: CSVRow[]; errors: string[] } {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return { rows: [], errors: ['CSV vacío'] }

    const headers = lines[0].split(',').map((h) => h.trim())
    const missing = REQUIRED_HEADERS.filter((r) => !headers.includes(r))
    if (missing.length > 0) {
      return { rows: [], errors: [`Faltan columnas: ${missing.join(', ')}`] }
    }

    const parsedRows: CSVRow[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      const raw: Record<string, string | undefined> = {}
      headers.forEach((h, idx) => {
        raw[h] = values[idx] || undefined
      })

      if (!raw.userEmail || !raw.userEmail.includes('@')) {
        errors.push(`Fila ${i + 1}: email inválido ("${raw.userEmail ?? ''}")`)
        continue
      }
      if (!raw.organizationName) {
        errors.push(`Fila ${i + 1}: organizationName vacío`)
        continue
      }
      if (!raw.userName) {
        errors.push(`Fila ${i + 1}: userName vacío`)
        continue
      }

      parsedRows.push({
        organizationName: raw.organizationName,
        userEmail: raw.userEmail,
        userName: raw.userName,
        industry: raw.industry ?? 'generico',
        city: raw.city ?? '',
        whatsappNumber: raw.whatsappNumber ?? '',
        website: raw.website,
        userPhone: raw.userPhone,
      })
    }

    return { rows: parsedRows, errors }
  }

  async function handleFile(file: File) {
    setParsing(true)
    setParseErrors([])
    setRows([])
    setResults(null)

    const text = await file.text()
    const { rows: parsed, errors } = parseCSV(text)

    setRows(parsed)
    setParseErrors(errors)
    setParsing(false)
  }

  async function handleExecute() {
    if (rows.length === 0 || executing) return
    setExecuting(true)
    try {
      const result = await bulkImportClientsAction(rows)
      setResults(result.results)
      const successes = result.results.filter((r) => r.status === 'success').length
      toast.success(`${successes} de ${result.results.length} clientes creados`)
    } catch {
      toast.error('Error inesperado al ejecutar el import')
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1 — Upload */}
      <Card padding="lg">
        <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">Paso 1</p>
        <p className="mb-4 text-base text-zinc-200">Subí tu CSV</p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
          className="text-sm text-zinc-300 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-cyan-400/15 file:px-4 file:py-2 file:text-cyan-300"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Columnas requeridas:{' '}
          <span className="font-mono text-zinc-400">{REQUIRED_HEADERS.join(', ')}</span>
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Industrias válidas: legal, contable, medico_odontologico, gimnasio, restaurant,
          inmobiliaria, concesionaria, distribuidora, constructora, generico
        </p>
      </Card>

      {parsing && <p className="text-sm text-zinc-400">Parseando...</p>}

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <Card
          padding="md"
          className="border-red-500/30 bg-red-500/5"
        >
          <p className="mb-2 text-sm font-medium text-red-300">
            {parseErrors.length} error{parseErrors.length !== 1 ? 'es' : ''} al parsear
          </p>
          <ul className="space-y-1 text-xs text-red-300/80">
            {parseErrors.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Step 2 — Preview */}
      {rows.length > 0 && !results && (
        <Card padding="lg">
          <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">Paso 2</p>
          <p className="mb-4 text-base text-zinc-200">
            Preview:{' '}
            <span className="text-cyan-300">{rows.length}</span> cliente{rows.length !== 1 ? 's' : ''} a crear
          </p>

          <div className="mb-4 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.04]">
                <tr>
                  <th className="px-3 py-2 text-left text-zinc-400">#</th>
                  <th className="px-3 py-2 text-left text-zinc-400">Empresa</th>
                  <th className="px-3 py-2 text-left text-zinc-400">Email</th>
                  <th className="px-3 py-2 text-left text-zinc-400">Industria</th>
                  <th className="px-3 py-2 text-left text-zinc-400">Ciudad</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="px-3 py-2 text-zinc-500">{i + 1}</td>
                    <td className="px-3 py-2 text-zinc-300">{row.organizationName}</td>
                    <td className="px-3 py-2 text-zinc-400">{row.userEmail}</td>
                    <td className="px-3 py-2">
                      <Badge variant="default" size="xs">{row.industry}</Badge>
                    </td>
                    <td className="px-3 py-2 text-zinc-500">{row.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="border-t border-white/5 px-3 py-2 text-xs text-zinc-500">
                ...y {rows.length - 20} más
              </p>
            )}
          </div>

          <Button onClick={() => void handleExecute()} loading={executing}>
            Crear {rows.length} cliente{rows.length !== 1 ? 's' : ''}
          </Button>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card padding="lg">
          <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">Resultados</p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="text-2xl font-semibold text-emerald-300">
                {results.filter((r) => r.status === 'success').length}
              </p>
              <p className="text-xs text-emerald-300/80">Éxitos</p>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
              <p className="text-2xl font-semibold text-red-300">
                {results.filter((r) => r.status === 'error').length}
              </p>
              <p className="text-xs text-red-300/80">Errores</p>
            </div>
          </div>

          <details className="text-xs">
            <summary className="cursor-pointer text-zinc-400 hover:text-zinc-200">
              Ver detalle fila por fila
            </summary>
            <ul className="mt-2 max-h-80 space-y-1 overflow-y-auto">
              {results.map((r, i) => (
                <li
                  key={i}
                  className={r.status === 'success' ? 'text-emerald-300/80' : 'text-red-300/80'}
                >
                  Fila {r.row}: {r.email} —{' '}
                  {r.status === 'success' ? 'OK' : r.error}
                </li>
              ))}
            </ul>
          </details>

          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => {
              setRows([])
              setResults(null)
              setParseErrors([])
            }}
          >
            Nuevo import
          </Button>
        </Card>
      )}
    </div>
  )
}
