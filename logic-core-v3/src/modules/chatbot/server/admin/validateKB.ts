export interface KBValidationIssue {
  severity: 'error' | 'warning' | 'info'
  section: string
  message: string
  hint?: string
}

export function validateKB(kb: Record<string, string>): KBValidationIssue[] {
  const issues: KBValidationIssue[] = []

  const requiredSections = [
    'businessInfo',
    'servicesOrProducts',
    'faq',
    'policies',
    'salesGuidance',
  ]

  for (const section of requiredSections) {
    const content = kb[section]
    if (!content || content.trim().length < 10) {
      issues.push({
        severity: 'warning',
        section,
        message: `Seccion "${section}" esta vacia o es muy corta`,
        hint: 'Idealmente deberia tener al menos 50 caracteres',
      })
    }
  }

  const servicesOrProducts = kb.servicesOrProducts ?? ''
  const policies = kb.policies ?? ''
  const businessInfo = kb.businessInfo ?? ''

  if (/gratis|sin\s+costo/i.test(servicesOrProducts) && /\$|usd|peso/i.test(policies)) {
    issues.push({
      severity: 'warning',
      section: 'servicesOrProducts',
      message: 'Contradiccion potencial: servicios menciona "gratis" pero politicas habla de precios',
      hint: 'Revisa que el alcance gratuito y lo pago esten diferenciados',
    })
  }

  if (/gratis|sin\s+costo/i.test(policies) && /\$|usd|peso/i.test(servicesOrProducts)) {
    issues.push({
      severity: 'warning',
      section: 'policies',
      message: 'Contradiccion potencial: politicas menciona "gratis" pero servicios incluye precios',
      hint: 'Aclara si es una consulta, demo, envio u otro concepto puntual',
    })
  }

  const forbidden = kb.forbiddenStatements ?? ''
  if (forbidden && /no\s+vendemos\s+a\s+empresas/i.test(forbidden)) {
    const targetText = `${businessInfo}\n${servicesOrProducts}\n${kb.salesGuidance ?? ''}`
    if (/empresas|b2b|corporativo/i.test(targetText)) {
      issues.push({
        severity: 'error',
        section: 'forbiddenStatements',
        message: 'Contradiccion: frases prohibidas dice "no vendemos a empresas" pero la KB menciona B2B o empresas',
      })
    }
  }

  for (const [section, content] of Object.entries(kb)) {
    if (content && content.length > 5000) {
      issues.push({
        severity: 'info',
        section,
        message: `Seccion "${section}" es muy larga (${content.length} chars)`,
        hint: 'Considera resumir; secciones muy largas consumen tokens del contexto',
      })
    }
  }

  return issues
}
