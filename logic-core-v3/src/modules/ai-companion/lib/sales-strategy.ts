/**
 * DevelOP Sales Strategy System
 * Intent recognition, lead qualification, and conversion optimization
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type IntentType =
    | 'template'
    | 'custom_web'
    | 'software'
    | 'ai_automation'
    | 'consultation'
    | 'price'
    | 'comparison'
    | 'urgency'
    | 'unknown';

export interface LeadContext {
    serviceType: IntentType;
    projectDescription?: string;
    industry?: string;
    timeline?: string;
    hasBudget?: boolean;
    budgetRange?: string;
    urgency?: 'high' | 'medium' | 'low';
    technicalRequirements?: string[];
}

/**
 * Detecta la intención del usuario basándose en su mensaje
 */
export function detectIntent(userMessage: string): IntentType {
    const message = userMessage.toLowerCase();

    const patterns: Record<IntentType, RegExp[]> = {
        price: [
            /precio/i, /costo/i, /cuánto cuesta/i, /presupuesto/i, /cotiza/i, /valor/i, /invertir/i
        ],
        comparison: [
            /competencia/i, /otros/i, /fiverr/i, /agencia/i, /diferencia/i, /por qué ustedes/i
        ],
        urgency: [
            /urgente/i, /rápido/i, /cuánto tardan/i, /tiempos/i, /deadline/i, /para ayer/i
        ],
        template: [
            /template/i, /plantilla/i, /luxury|tech|cyber|dining/i, /demo/i
        ],
        custom_web: [
            /web.*medida/i, /custom/i, /desarrollo web/i, /página web/i, /landing/i
        ],
        software: [
            /sistema/i, /software/i, /crm/i, /erp/i, /dashboard/i, /herramienta/i
        ],
        ai_automation: [
            /\bia\b/i, /inteligencia artificial/i, /chatbot/i, /automatiza/i, /n8n/i
        ],
        consultation: [
            /hablar/i, /reunión/i, /contacto/i, /whatsapp/i
        ],
        unknown: [],
    };

    for (const [intent, regexps] of Object.entries(patterns)) {
        if (intent === 'unknown') continue;
        for (const regex of regexps) {
            if (regex.test(message)) return intent as IntentType;
        }
    }

    return 'unknown';
}

/**
 * Retorna la respuesta estratégica sugerida según la intención detectada
 * para ser inyectada en el flujo de la consultoría.
 */
export function getStrategicResponse(intent: IntentType): string | null {
    switch (intent) {
        case 'price':
            return "Antes de hablar de inversión, tiene sentido entender qué resuelve. ¿Qué problema específico estás tratando de resolver con esto?";
        case 'comparison':
            return "La diferencia más importante no está en el precio. ¿Qué es lo que más te importa que quede bien hecho?";
        case 'urgency':
            return "Entiendo. Contame un poco más del contexto — eso me ayuda a darte un panorama más preciso del tiempo que manejaríamos.";
        default:
            return null;
    }
}
