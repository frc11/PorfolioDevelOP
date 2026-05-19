import type { Industry } from '../../../server/admin/createClientWithBot'

export interface QuickReply {
  id: string
  label: string
  prompt: string
}

export interface OnboardingState {
  // Paso 1
  orgName: string
  industry: Industry
  city: string
  websiteUrl: string | null

  // Paso 2
  botName: string
  welcomeMessage: string
  tone: 'informal_rioplatense' | 'formal' | 'neutral'

  // Paso 3
  businessInfo: string
  servicesOrProducts: string
  faq: string
  policies: string
  salesGuidance: string
  toneExamples: string
  forbiddenStatements: string

  // Paso 4
  accentColor: string
  avatarStyle: 'neuro' | 'legacy_neuro' | 'image' | 'emoji'
  position: 'bottom_right' | 'bottom_left'
  quickReplies: QuickReply[]
  whatsappNumber: string | null

  // Usuario administrador del cliente
  userEmail: string
  userName: string
  userPhone: string
}

export interface StepProps {
  state: OnboardingState
  update: (updates: Partial<OnboardingState>) => void
  onNext: () => void
  onBack?: () => void
}
