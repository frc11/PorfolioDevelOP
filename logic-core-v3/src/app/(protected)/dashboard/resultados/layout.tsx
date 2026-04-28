import { ResultadosTabs } from '@/components/dashboard/ResultadosTabs'
import { TrendingUp } from 'lucide-react'

export default function ResultadosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      <header className="flex items-center gap-3 pt-2 sm:pt-4">
        <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
          <TrendingUp size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Resultados
          </h1>
          <p className="text-sm text-zinc-500">
            Tráfico, SEO y rendimiento de tu negocio digital
          </p>
        </div>
      </header>

      <ResultadosTabs />

      <div>{children}</div>
    </div>
  )
}
