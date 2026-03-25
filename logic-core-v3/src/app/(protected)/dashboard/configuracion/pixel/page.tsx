import { resolveOrgId } from '@/lib/preview'
import { redirect } from 'next/navigation'
import { PixelScript } from '@/components/dashboard/PixelScript'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { ShieldAlert, Info } from 'lucide-react'

export default async function PixelConfigPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-4 sm:p-0">
      <FadeIn>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Configuración del Píxel</h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
            Instala el Píxel de <span className="text-cyan-400 font-bold">develOP</span> en tu sitio web para comenzar a medir fugas de capital y optimizar la retención de usuarios. 
            Simplemente copia el código a continuación y pégalo antes de la etiqueta <code className="text-cyan-300 font-mono text-xs cursor-default px-1 rounded bg-cyan-500/10">&lt;/body&gt;</code>.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <PixelScript clientId={organizationId} baseUrl={baseUrl} />
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Info size={18} />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">¿Cómo funciona?</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              El script mide el tiempo de permanencia de cada usuario. Si un visitante abandona el sitio en menos de <strong className="text-zinc-200">5 segundos</strong>, se registra como una <strong className="text-orange-400">fuga</strong> (rebote instantáneo).
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <ShieldAlert size={18} />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Impacto Directo</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Reducir las fugas iniciales puede aumentar tus conversiones en hasta un <strong className="text-zinc-200">40%</strong>. El Píxel es el primer paso para desbloquear las integraciones de <strong className="text-cyan-400">IA de Retención</strong>.
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
