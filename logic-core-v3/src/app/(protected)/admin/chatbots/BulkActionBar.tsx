'use client'

import { useTransition } from 'react'
import { motion } from 'motion/react'
import { Pause, Play, Download, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { bulkPauseBotsAction, bulkActivateBotsAction, exportLeadsBulkAction } from './bulk-actions'

interface Props {
  selectedIds: string[]
  totalBots: number
  onSelectAll: () => void
  onClear: () => void
}

export function BulkActionBar({ selectedIds, totalBots, onSelectAll, onClear }: Props) {
  const [pending, startTransition] = useTransition()

  function handlePause() {
    const count = selectedIds.length
    if (
      !confirm(
        `Pausar ${count} bot${count !== 1 ? 's' : ''}? El servicio se detiene para esos clientes.`,
      )
    )
      return
    startTransition(async () => {
      const result = await bulkPauseBotsAction(selectedIds)
      const s = result.success
      toast.success(
        `${s} bot${s !== 1 ? 's' : ''} pausado${s !== 1 ? 's' : ''}${result.failed > 0 ? `. ${result.failed} fallaron.` : '.'}`,
      )
      if (result.failed > 0) console.error('Bulk pause failures:', result.failures)
      onClear()
    })
  }

  function handleActivate() {
    startTransition(async () => {
      const result = await bulkActivateBotsAction(selectedIds)
      const s = result.success
      toast.success(
        `${s} bot${s !== 1 ? 's' : ''} activado${s !== 1 ? 's' : ''}${result.failed > 0 ? `. ${result.failed} fallaron.` : '.'}`,
      )
      onClear()
    })
  }

  function handleExportLeads() {
    startTransition(async () => {
      const result = await exportLeadsBulkAction(selectedIds)
      if (result.ok) {
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`Exportados ${result.totalLeads} leads`)
      } else {
        toast.error('Error al exportar')
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="sticky top-4 z-20 rounded-2xl border border-cyan-400/30 bg-cyan-400/5 backdrop-blur p-3 flex items-center justify-between gap-3 flex-wrap"
    >
      <div className="flex items-center gap-3">
        <span className="text-sm text-cyan-300 font-medium">
          {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
        </span>
        {selectedIds.length < totalBots && (
          <button
            onClick={onSelectAll}
            className="text-xs text-zinc-400 hover:text-zinc-200 underline-offset-2 hover:underline"
          >
            Seleccionar todos ({totalBots})
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          icon={<Pause className="h-3 w-3" strokeWidth={1.5} />}
          onClick={handlePause}
          disabled={pending}
        >
          Pausar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<Play className="h-3 w-3" strokeWidth={1.5} />}
          onClick={handleActivate}
          disabled={pending}
        >
          Activar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<Download className="h-3 w-3" strokeWidth={1.5} />}
          onClick={handleExportLeads}
          disabled={pending}
        >
          Exportar leads
        </Button>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-white/[0.05]"
          title="Limpiar selección"
        >
          <X className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  )
}
