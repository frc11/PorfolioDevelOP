import { OnboardingWizard } from '@/modules/chatbot/components/admin/onboarding/OnboardingWizard'

export default function NewClientPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <header className="mb-8">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Onboarding</p>
        <h1 className="text-3xl font-semibold text-zinc-100">Nuevo cliente con chatbot</h1>
        <p className="text-sm text-zinc-400 mt-2">
          Configurá la organización, el bot y la base de conocimiento en 5 pasos.
        </p>
      </header>

      <OnboardingWizard />
    </div>
  )
}
