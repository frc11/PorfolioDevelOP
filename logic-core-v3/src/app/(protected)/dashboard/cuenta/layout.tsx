import { CuentaTabs } from '@/components/dashboard/CuentaTabs'
import { PageHeader } from '@/components/ui'
import { Settings } from 'lucide-react'

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
      <PageHeader
        eyebrow="Configuración"
        title="Mi cuenta"
        description="Perfil, facturación y bóveda digital"
        icon={Settings}
      />

      <CuentaTabs />

      <div>{children}</div>
    </div>
  )
}
