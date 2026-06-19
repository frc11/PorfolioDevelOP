import { OnboardingWizard } from '@/modules/chatbot/components/admin/onboarding/OnboardingWizard'

export default function NewClientPage() {
  return (
    <div className="pb-8">
      <header className="mb-8">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Onboarding</p>
        <h1 className="text-3xl font-semibold text-zinc-100">Nuevo cliente</h1>
        <p className="text-sm text-zinc-400 mt-2">
          Creá la cuenta del cliente. Con chatbot, sumás identidad, base de conocimiento y apariencia.
        </p>
      </header>

      <OnboardingWizard />
    </div>
  )
}
