/**
 * DevelOP Sales Strategy System
 * Intent recognition, lead qualification, and conversion optimization
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ServiceType =
    | 'template'
    | 'custom_web'
    | 'software'
    | 'ai_automation'
    | 'consultation'
    | 'unknown';

export type LeadQuality = 'hot' | 'warm' | 'cold' | 'unqualified';

export interface LeadContext {
    serviceType: ServiceType;
    projectDescription?: string;
    industry?: string;
    timeline?: string;
    hasBudget?: boolean;
    budgetRange?: string;
    urgency?: 'high' | 'medium' | 'low';
    technicalRequirements?: string[];
}

export interface QualificationResult {
    quality: LeadQuality;
    readyToConnect: boolean;
    missingInfo: string[];
    recommendation: string;
}

// ============================================================================
// INTENT DETECTION
// ============================================================================

/**
 * Detecta el tipo de servicio que el usuario necesita basándose en su mensaje
 */
export function detectIntent(userMessage: string): ServiceType {
    const message = userMessage.toLowerCase();

    // Keywords por tipo de servicio
    const patterns: Record<ServiceType, RegExp[]> = {
        template: [
            /template/i,
            /plantilla/i,
            /rápid[oa]/i,
            /luxury|tech|cyber|dining/i,
            /demo/i,
            /muestra/i,
        ],
        custom_web: [
            /web.*medida/i,
            /personaliza/i,
            /único/i,
            /custom/i,
            /desarrollo web/i,
            /página web/i,
            /sitio web/i,
            /landing/i,
            /portfolio/i,
            /e-?commerce/i,
        ],
        software: [
            /sistema/i,
            /software/i,
            /aplicación/i,
            /app\b/i,
            /crm/i,
            /erp/i,
            /dashboard/i,
            /herramienta/i,
            /plataforma/i,
            /saas/i,
        ],
        ai_automation: [
            /\bia\b/i,
            /inteligencia artificial/i,
            /chatbot/i,
            /bot\b/i,
            /automatiza/i,
            /n8n/i,
            /workflow/i,
            /gpt/i,
            /claude/i,
            /machine learning/i,
        ],
        consultation: [
            /consult/i,
            /asesor/i,
            /presupuesto/i,
            /cotiza/i,
            /precio/i,
            /costo/i,
            /cuánto/i,
            /hablar/i,
            /reunión/i,
        ],
        unknown: [],
    };

    // Chequea cada patrón
    for (const [serviceType, regexps] of Object.entries(patterns)) {
        if (serviceType === 'unknown') continue;

        for (const regex of regexps) {
            if (regex.test(message)) {
                return serviceType as ServiceType;
            }
        }
    }

    return 'unknown';
}

// Qualification and Messaging helpers were removed as they were not in use.
