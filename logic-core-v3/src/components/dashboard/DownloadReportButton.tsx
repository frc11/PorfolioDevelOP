'use client'

import { useState, useRef } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { ExecutiveReportTemplate, ReportData } from './ExecutiveReportTemplate'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function monthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  return `${MONTHS_ES[parseInt(month) - 1] ?? month} ${year}`
}

function prevMonth(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-').map(Number)
  if (month === 1) return `${year - 1}-12`
  return `${year}-${String(month - 1).padStart(2, '0')}`
}

function currentYYYYMM(): string {
  return new Date().toISOString().slice(0, 7)
}

interface DownloadReportButtonProps {
  organizationId?: string
  variant?: 'primary' | 'ghost'
  month?: string
  isLocked?: boolean
}

function useDownloadHTML2Canvas(month: string) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const templateRef = useRef<HTMLDivElement>(null)

  const download = async () => {
    if (!templateRef.current) return
    setIsGeneratingPDF(true)

    try {
      // Dynamic imports to prevent SSR issues with canvas on Next.js
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(templateRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#080a0c',
      })

      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`develOP-Reporte-${month}.pdf`)
    } catch (e) {
      console.error(e)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return { download, loading: isGeneratingPDF, templateRef }
}

function ReportButton({
  month,
  variant = 'primary',
  isLocked = false,
}: DownloadReportButtonProps & { month: string }) {
  const { download, loading, templateRef } = useDownloadHTML2Canvas(month)

  const mockData: ReportData = {
    month: monthLabel(month),
    clientName: 'Concesionaria San Miguel S.A.',
    visits: '12,450',
    leads: '1,204',
    pipelineValue: '$45,000',
    hoursSaved: '120 hs',
    roi: '$3,600',
    tasksCompleted: 8,
    aiBrief: `El ecosistema B2B está superando las métricas en un 140% respecto al mes anterior. Las automatizaciones han absorbido la carga operativa más crítica del equipo de ventas y el onboarding digital redujo drásticamente la fricción inicial. El ROI proyectado sustenta los esfuerzos de escalabilidad planificados para el próximo trimestre.`
  }

  return (
    <>
      <div className="flex flex-col gap-1 group relative">
        <button
          onClick={download}
          disabled={loading || isLocked}
          className={[
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 overflow-hidden relative',
            variant === 'primary' && !isLocked
              ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : variant === 'ghost' && !isLocked
              ? 'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800'
              : 'border border-red-500/20 bg-red-500/10 text-red-400 cursor-not-allowed'
          ].join(' ')}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
          {loading ? 'Generando PDF...' : `Reporte de ${monthLabel(month)}`}
        </button>
        {isLocked && (
          <div className="absolute -bottom-8 left-0 hidden group-hover:block w-max bg-zinc-900 border border-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded shadow-xl z-10">
            Bloqueado por impago.
          </div>
        )}
      </div>

      {/* Hidden container for rendering */}
      <div className="fixed top-[-9999px] left-[-9999px] z-[-1] pointer-events-none" aria-hidden="true">
        <div ref={templateRef}>
          <ExecutiveReportTemplate data={mockData} />
        </div>
      </div>
    </>
  )
}

export function DownloadReportButtons({ organizationId, isLocked = false }: { organizationId?: string, isLocked?: boolean }) {
  const current = currentYYYYMM()
  const previous = prevMonth(current)

  return (
    <div className="flex flex-wrap gap-3">
      <ReportButton month={current} organizationId={organizationId} variant="primary" isLocked={isLocked} />
      <ReportButton month={previous} organizationId={organizationId} variant="ghost" isLocked={isLocked} />
    </div>
  )
}
