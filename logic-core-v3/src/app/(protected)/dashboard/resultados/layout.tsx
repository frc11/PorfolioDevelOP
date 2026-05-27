import { ResultadosTabs } from '@/components/dashboard/ResultadosTabs'
import { PageHeader } from '@/components/ui'
import { TrendingUp } from 'lucide-react'

export default function ResultadosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      <PageHeader
        eyebrow="Resultados"
        title="Resultados"
        description="Tráfico, SEO y rendimiento de tu negocio digital"
        icon={TrendingUp}
      />

      <ResultadosTabs />

      <div>{children}</div>
    </div>
  )
}
