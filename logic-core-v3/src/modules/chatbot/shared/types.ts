/**
 * Public types of the chatbot module.
 *
 * IMPORTANT: This module never imports `Organization` from `@prisma/client`
 * directly. Instead, functions that need org data receive this minimal
 * interface as a parameter. This is part of the module boundary rules
 * that enable future extraction to a separate repo / package.
 *
 * See: src/modules/chatbot/README.md
 */

export interface ChatbotOrganization {
  id: string
  slug: string
  companyName: string
}

/**
 * Quick reply configuration for the chatbot UI.
 */
export interface QuickReply {
  emoji?: string
  label: string
  promptToSend: string
}

/**
 * Proactive prompts map by route.
 */
export type ProactivePromptsMap = Record<string, string[]>

/**
 * Route → accent color map for contextual coloring.
 */
export type RouteColorMap = Record<string, string>

/**
 * Avatar style options.
 */
export type AvatarStyle = 'neuro' | 'simple' | 'custom_image' | 'emoji' | 'none'

/**
 * LLM provider options (only google is functional in MVP).
 */
export type LLMProviderName = 'google' | 'anthropic' | 'openai'

/**
 * Chatbot lead status.
 */
export type ChatbotLeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'converted'

/**
 * Tone presets.
 */
export type BotTone = 'informal_rioplatense' | 'formal' | 'neutral'

/**
 * Industry/vertical for template selection.
 */
export type BotIndustry =
  | 'concesionaria_autos'
  | 'clinica_medica'
  | 'odontologia'
  | 'gimnasio'
  | 'restaurante'
  | 'inmobiliaria'
  | 'distribuidora'
  | 'constructora'
  | 'contable'
  | 'generic'
  | 'agency'  // exclusivo para develOP
