import { ResultadosTabs } from '@/components/dashboard/ResultadosTabs'

export default function ResultadosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      <ResultadosTabs />

      <div>{children}</div>
    </div>
  )
}
