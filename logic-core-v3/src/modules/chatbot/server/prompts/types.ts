/**
 * Input data for the system prompt builder.
 *
 * Deliberately decoupled from Prisma types to keep the module
 * boundary clean. Callers extract the fields they need from
 * Prisma models before calling buildSystemPrompt.
 */

export interface BotConfigForPrompt {
  botName: string
  tone: string  // "informal_rioplatense" | "formal" | "neutral" | custom
}

export interface KnowledgeBaseForPrompt {
  businessInfo: string
  servicesOrProducts: string
  faq: string
  policies: string
  salesGuidance: string
  toneExamples: string
  forbiddenStatements: string
}

export interface PromptContext {
  /**
   * Display name of the company (e.g. "develOP", "Concesionaria San Miguel").
   * Comes from Organization.companyName.
   */
  companyName: string

  /**
   * Current path where the chat was opened (e.g. "/web-development").
   * Optional — undefined means the bot is not on a specific section.
   */
  currentPath?: string

  /**
   * Current date and time, ALREADY formatted in Argentina timezone.
   * Use formatDateTimeArgentina() helper.
   */
  currentDateTime: string

  /**
   * True if this is the user's first message in the conversation.
   * Used to decide whether the bot should greet again.
   */
  isFirstMessage: boolean
}

export interface BuildSystemPromptInput {
  botConfig: BotConfigForPrompt
  knowledgeBase: KnowledgeBaseForPrompt
  context: PromptContext
}
