import type { Industry } from '../../../server/admin/createClientWithBot'
import type { AvatarKindId } from '@/modules/chatbot/components/avatar'

export interface QuickReply {
  id: string
  label: string
  prompt: string
}

export interface OnboardingState {
  // Toggle de alta: con chatbot (flujo completo) o sin chatbot (solo cliente)
  withBot: boolean

  // Paso 1
  orgName: string
  industry: Industry
  city: string
  websiteUrl: string | null
  // Avatar del cliente (Organization) — distinto del avatar del bot (Paso 4)
  clientAvatarImageUrl: string | null
  clientAvatarEmoji: string | null
  clientAvatarInitials: string | null

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
  accentSecondary: string | null
  chatSurfaceTint: string | null
  avatarStyle: AvatarKindId
  avatarImageUrl: string | null
  avatarEmoji: string | null
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
