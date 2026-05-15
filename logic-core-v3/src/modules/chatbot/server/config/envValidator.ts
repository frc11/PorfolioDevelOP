/**
 * Runtime validator for chatbot environment variables.
 *
 * Validates required env vars at runtime. Returns a structured result
 * that can be displayed in the admin health page and logged at startup.
 *
 * Critical vars: throw immediately on first access.
 * Optional vars: include warnings but don't throw.
 */

export interface EnvVarStatus {
  name: string
  present: boolean
  required: boolean
  description: string
  hint?: string
}

export interface EnvCheckResult {
  allCriticalPresent: boolean
  vars: EnvVarStatus[]
  errors: string[]
  warnings: string[]
}

const ENV_VARS: Omit<EnvVarStatus, 'present'>[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string for Neon DB',
    hint: 'Get it from Neon console → Connection details',
  },
  {
    name: 'CHATBOT_GOOGLE_API_KEY',
    required: true,
    description: 'Google Generative Language API key',
    hint: 'Get it from Google Cloud Console → APIs & Services → Credentials',
  },
  {
    name: 'CHATBOT_IP_HASH_SALT',
    required: false,
    description: 'Secret salt for IP hashing (GDPR-safe rate limiting)',
    hint: 'Generate with: openssl rand -hex 32',
  },
  {
    name: 'CHATBOT_LLM_PROVIDER',
    required: false,
    description: 'LLM provider to use (defaults to "google")',
  },
  {
    name: 'AUTH_SECRET',
    required: true,
    description: 'NextAuth secret for session encryption',
  },
]

/**
 * Validates all chatbot-related env vars. Does NOT throw — returns the result.
 */
export function checkChatbotEnv(): EnvCheckResult {
  const vars: EnvVarStatus[] = ENV_VARS.map((v) => {
    const value = process.env[v.name]
    const present = !!value && value.length > 0
    return { ...v, present }
  })

  const errors: string[] = []
  const warnings: string[] = []

  for (const v of vars) {
    if (v.required && !v.present) {
      errors.push(
        `Missing required env var: ${v.name}. ${v.description}. ${v.hint ?? ''}`.trim()
      )
    } else if (!v.required && !v.present) {
      warnings.push(
        `Missing optional env var: ${v.name}. ${v.description}. ${v.hint ?? ''}`.trim()
      )
    }
  }

  return {
    allCriticalPresent: errors.length === 0,
    vars,
    errors,
    warnings,
  }
}

/**
 * Throws if any critical env var is missing. Use this when you absolutely
 * cannot proceed (e.g. at provider construction time).
 */
export function requireChatbotEnv(): void {
  const result = checkChatbotEnv()
  if (!result.allCriticalPresent) {
    throw new Error(
      `Chatbot env validation failed:\n` +
        result.errors.map((e) => `  - ${e}`).join('\n')
    )
  }
}
