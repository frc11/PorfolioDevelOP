import type { Industry } from '../../../../server/admin/createClientWithBot'

export interface KBTemplate {
  businessInfo: string
  servicesOrProducts: string
  faq: string
  policies: string
  salesGuidance: string
  toneExamples: string
  forbiddenStatements: string
  quickReplies: { id: string; label: string; prompt: string }[]
}

import { legalTemplate } from './legal'
import { contableTemplate } from './contable'
import { medicoTemplate } from './medico'
import { gimnasioTemplate } from './gimnasio'
import { restaurantTemplate } from './restaurant'
import { inmobiliariaTemplate } from './inmobiliaria'
import { concesionariaTemplate } from './concesionaria'
import { distribuidoraTemplate } from './distribuidora'
import { constructoraTemplate } from './constructora'
import { genericoTemplate } from './generico'

export const KB_TEMPLATES: Record<Industry, KBTemplate> = {
  legal: legalTemplate,
  contable: contableTemplate,
  medico_odontologico: medicoTemplate,
  gimnasio: gimnasioTemplate,
  restaurant: restaurantTemplate,
  inmobiliaria: inmobiliariaTemplate,
  concesionaria: concesionariaTemplate,
  distribuidora: distribuidoraTemplate,
  constructora: constructoraTemplate,
  generico: genericoTemplate,
}

export function getTemplate(industry: Industry): KBTemplate {
  return KB_TEMPLATES[industry] ?? genericoTemplate
}
