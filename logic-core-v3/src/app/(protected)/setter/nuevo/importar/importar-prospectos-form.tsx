'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  FileUp,
  Upload,
} from 'lucide-react'
import { Button, Callout, Card } from '@/components/ui'
import { importarProspectos } from '@/app/(protected)/setter/_actions/prospecto-bulk.actions'
import { NuevoProspectoSchema } from '@/app/(protected)/setter/_actions/prospecto.schemas'
import {
  COLUMNAS_IMPORT,
  MAX_FILAS_IMPORT,
  PLANTILLA_CSV,
  mapearFilas,
  parseCsv,
  type FilaDuplicada,
  type ImportReport,
} from '@/lib/leados/prospecto-import'

/** Vista previa local (cortesía): el server sigue siendo la verdad autoritativa. */
type Preview =
  | { error: string }
  | { totalFilas: number; invalidas: number }

function previsualizar(csv: string): Preview {
  const mapeo = mapearFilas(parseCsv(csv))
  if (!mapeo.ok) return { error: mapeo.error }
  if (mapeo.filas.length === 0) {
    return { error: 'No hay filas de datos debajo del encabezado.' }
  }
  if (mapeo.filas.length > MAX_FILAS_IMPORT) {
    return { error: `${mapeo.filas.length} filas — el máximo por tanda es ${MAX_FILAS_IMPORT}. Dividilo.` }
  }
  let invalidas = 0
  for (const f of mapeo.filas) {
    if (!NuevoProspectoSchema.safeParse(f.data).success) invalidas++
  }
  return { totalFilas: mapeo.filas.length, invalidas }
}

const MOTIVO_DUP: Record<FilaDuplicada['motivo'], string> = {
  'en-archivo': 'repetido en el archivo',
  'en-cartera': 'ya en tu cartera',
  'en-sistema': 'ya en el sistema',
}

export function ImportarProspectosForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [csv, setCsv] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [errorImport, setErrorImport] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setReport(null)
    setErrorImport(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) ?? ''
      setCsv(text)
      setFileName(file.name)
      setPreview(previsualizar(text))
    }
    reader.readAsText(file)
  }

  const importar = () => {
    if (!csv) return
    setErrorImport(null)
    const fd = new FormData()
    fd.append('csv', csv)
    startTransition(async () => {
      const result = await importarProspectos(fd)
      if (!result.success) {
        setErrorImport(result.error)
        toast.error(result.error)
        return
      }
      setReport(result.data)
      if (result.data.creados > 0) {
        toast.success(`${result.data.creados} prospecto${result.data.creados !== 1 ? 's' : ''} importado${result.data.creados !== 1 ? 's' : ''}`)
        router.refresh()
      } else {
        toast.message('No se creó ningún lead nuevo — revisá el detalle')
      }
      // Permitir re-subir el mismo archivo si lo corrige.
      if (fileRef.current) fileRef.current.value = ''
    })
  }

  const descargarPlantilla = () => {
    const blob = new Blob([PLANTILLA_CSV], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla-prospectos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const previewError = preview && 'error' in preview ? preview.error : null
  const previewOk = preview && !('error' in preview) ? preview : null
  const puedeImportar = Boolean(csv) && !previewError && !isPending

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-5">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFile}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:border-cyan-400/30 hover:bg-cyan-500/[0.03]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04]">
            <FileUp size={20} strokeWidth={1.5} className="text-zinc-400" aria-hidden />
          </span>
          <span className="text-sm font-medium text-zinc-200">
            {fileName ?? 'Elegí un archivo CSV'}
          </span>
          <span className="text-xs text-zinc-500">
            Una fila por negocio. Columna <span className="text-zinc-300">nombre</span> obligatoria.
          </span>
        </button>

        {previewError && (
          <Callout tone="warning" icon={AlertTriangle} title="No se puede importar todavía">
            {previewError}
          </Callout>
        )}

        {previewOk && (
          <Callout tone="info" title="Listo para importar">
            Detectamos <strong className="text-blue-100">{previewOk.totalFilas}</strong>{' '}
            {previewOk.totalFilas === 1 ? 'negocio' : 'negocios'} en el archivo
            {previewOk.invalidas > 0 && (
              <>
                {' '}— <strong className="text-amber-200">{previewOk.invalidas}</strong> con datos a revisar (se reportan, no frenan al resto)
              </>
            )}
            . Los duplicados se detectan al importar.
          </Callout>
        )}

        {errorImport && (
          <Callout tone="danger" icon={AlertTriangle}>
            {errorImport}
          </Callout>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={importar}
            loading={isPending}
            disabled={!puedeImportar}
            icon={<Upload size={15} strokeWidth={1.5} />}
          >
            {previewOk ? `Importar ${previewOk.totalFilas} negocio${previewOk.totalFilas !== 1 ? 's' : ''}` : 'Importar lista'}
          </Button>
          <Button variant="ghost" size="sm" onClick={descargarPlantilla} icon={<Download size={14} strokeWidth={1.5} />}>
            Descargar plantilla
          </Button>
        </div>
      </Card>

      {report && <ReporteImportacion report={report} />}

      <ColumnasReferencia />
    </div>
  )
}

function ReporteImportacion({ report }: { report: ImportReport }) {
  const { creados, invalidas, duplicadas } = report
  return (
    <Card padding="lg" className="space-y-4">
      <Callout
        tone={creados > 0 ? 'success' : 'neutral'}
        icon={creados > 0 ? CheckCircle2 : Copy}
        title={`${creados} prospecto${creados !== 1 ? 's' : ''} importado${creados !== 1 ? 's' : ''}`}
      >
        {creados > 0
          ? // P19 — Decía «ya aparecen en tu foco». El foco es uno; una tanda
            // importada entra entera a la cola y sale de a uno, por orden. La
            // promesa que el producto sí cumple es la cola, no el foco.
            'Entraron a tu cartera sin marca de caliente, listos para completar la Ficha — el foco te los va trayendo de a uno, por orden.'
          : 'No se creó ningún lead nuevo en esta tanda. Revisá el detalle de las filas inválidas.'}
      </Callout>

      {invalidas.length > 0 && (
        <section className="space-y-2" aria-label="Filas inválidas">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300/80">
            {invalidas.length} {invalidas.length === 1 ? 'fila con error' : 'filas con error'}
          </h3>
          <ul className="max-h-56 space-y-1 overflow-y-auto text-xs">
            {invalidas.map((f) => (
              <li
                key={`inv-${f.fila}`}
                className="flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border border-amber-400/15 bg-amber-500/[0.04] px-3 py-1.5"
              >
                <span className="font-mono text-amber-200/70">fila {f.fila}</span>
                {f.nombre && <span className="text-zinc-300">{f.nombre}</span>}
                <span className="text-zinc-500">— {f.motivo}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {duplicadas.length > 0 && (
        <section className="space-y-2" aria-label="Duplicados saltados">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {duplicadas.length} {duplicadas.length === 1 ? 'duplicado saltado' : 'duplicados saltados'}
          </h3>
          <ul className="max-h-56 space-y-1 overflow-y-auto text-xs">
            {duplicadas.map((f, i) => (
              <li
                key={`dup-${f.fila}-${i}`}
                className="flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5"
              >
                <span className="font-mono text-zinc-600">fila {f.fila}</span>
                <span className="text-zinc-300">{f.nombre}</span>
                <span className="text-zinc-500">— {MOTIVO_DUP[f.motivo]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Card>
  )
}

function ColumnasReferencia() {
  return (
    <Card padding="lg" className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Columnas de la plantilla
      </h3>
      <p className="text-xs leading-relaxed text-zinc-500">
        Formato fijo: respetá los encabezados. Solo <span className="text-zinc-300">nombre</span> es
        obligatorio; el resto es opcional. Email y links (instagram/web), si los ponés, tienen que
        estar bien formados (los links, con <span className="text-zinc-300">https://</span>) o la fila se reporta.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {COLUMNAS_IMPORT.map((col) => (
          <span
            key={col.key}
            className={
              'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium ' +
              (col.required
                ? 'border-cyan-500/25 bg-cyan-500/[0.06] text-cyan-200'
                : 'border-white/[0.06] bg-white/[0.02] text-zinc-400')
            }
          >
            {col.header}
            {col.required && <span className="text-cyan-400">*</span>}
          </span>
        ))}
      </div>
    </Card>
  )
}
