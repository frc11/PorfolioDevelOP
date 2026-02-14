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

// ============================================================================
// LEAD QUALIFICATION
// ============================================================================

/**
 * Califica la calidad del lead basándose en el contexto capturado
 */
export function qualifyLead(context: LeadContext): QualificationResult {
    const missingInfo: string[] = [];
    let score = 0;

    // Scoring system
    if (context.serviceType && context.serviceType !== 'unknown') score += 2;
    if (context.projectDescription) score += 3;
    if (context.industry) score += 1;
    if (context.timeline) score += 2;
    if (context.hasBudget) score += 2;

    // Check missing critical info
    if (!context.projectDescription) missingInfo.push('descripción del proyecto');
    if (!context.timeline) missingInfo.push('timeline esperado');
    if (context.hasBudget === undefined) missingInfo.push('contexto de presupuesto');

    // Determine quality
    let quality: LeadQuality;
    let readyToConnect: boolean;
    let recommendation: string;

    if (score >= 8) {
        quality = 'hot';
        readyToConnect = true;
        recommendation = 'Lead altamente calificado. Conectar inmediatamente con contexto completo.';
    } else if (score >= 5) {
        quality = 'warm';
        readyToConnect = missingInfo.length <= 1;
        recommendation = readyToConnect
            ? 'Lead prometedor. Conectar con la info disponible.'
            : `Obtener: ${missingInfo.join(', ')} antes de conectar.`;
    } else if (score >= 3) {
        quality = 'cold';
        readyToConnect = false;
        recommendation = `Lead con interés inicial. Profundizar en: ${missingInfo.join(', ')}.`;
    } else {
        quality = 'unqualified';
        readyToConnect = false;
        recommendation = 'Muy poca información. Explorar necesidades antes de conectar.';
    }

    return {
        quality,
        readyToConnect,
        missingInfo,
        recommendation,
    };
}

// ============================================================================
// WHATSAPP MESSAGE GENERATION
// ============================================================================

const WHATSAPP_NUMBER = '5493815674738'; // +54 3815674738

/**
 * Genera el enlace de WhatsApp con mensaje pre-cargado personalizado
 */
export function generateWhatsAppLink(context: LeadContext): string {
    const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

    // Construye el mensaje según el tipo de servicio
    let message = 'Hola DevelOP! Vengo desde el chat de Logic Core. ';

    switch (context.serviceType) {
        case 'template':
            message += 'Estoy interesado en sus templates premium. ';
            break;
        case 'custom_web':
            message += 'Necesito desarrollo web a medida. ';
            break;
        case 'software':
            message += 'Necesito desarrollo de software/sistema. ';
            break;
        case 'ai_automation':
            message += 'Me interesa implementar IA/automatizaciones. ';
            break;
        default:
            message += 'Me gustaría consultar sobre sus servicios. ';
    }

    // Agrega contexto si está disponible
    if (context.projectDescription) {
        message += `Proyecto: ${context.projectDescription.slice(0, 100)}. `;
    }

    if (context.industry) {
        message += `Industria: ${context.industry}. `;
    }

    if (context.timeline) {
        message += `Timeline: ${context.timeline}. `;
    }

    // URL encode el mensaje
    const encodedMessage = encodeURIComponent(message.trim());

    return `${baseUrl}?text=${encodedMessage}`;
}

/**
 * Genera mensaje de presentación para email (backup)
 */
export function generateEmailMessage(context: LeadContext): string {
    let message = 'Asunto: Consulta desde Logic Core\n\n';
    message += 'Hola DevelOP,\n\n';
    message += 'Me comunico desde su chat web. ';

    switch (context.serviceType) {
        case 'template':
            message += 'Estoy interesado en sus templates premium.\n\n';
            break;
        case 'custom_web':
            message += 'Necesito desarrollo web a medida.\n\n';
            break;
        case 'software':
            message += 'Necesito desarrollo de software/sistema.\n\n';
            break;
        case 'ai_automation':
            message += 'Me interesa implementar IA/automatizaciones.\n\n';
            break;
        default:
            message += 'Me gustaría consultar sobre sus servicios.\n\n';
    }

    if (context.projectDescription) {
        message += `Descripción del proyecto: ${context.projectDescription}\n\n`;
    }

    if (context.industry) {
        message += `Industria/Rubro: ${context.industry}\n\n`;
    }

    if (context.timeline) {
        message += `Timeline estimado: ${context.timeline}\n\n`;
    }

    message += 'Quedo atento a su respuesta.\n\nSaludos!';

    return message;
}

// ============================================================================
// CONVERSATION HELPERS
// ============================================================================

/**
 * Genera preguntas de calificación basadas en lo que falta
 */
export function getQualificationQuestions(context: LeadContext): string[] {
    const questions: string[] = [];

    if (!context.projectDescription) {
        questions.push('¿Podés contarme un poco más sobre qué querés lograr con este proyecto?');
    }

    if (!context.timeline) {
        questions.push('¿Tenés algún deadline o fecha objetivo para tenerlo funcionando?');
    }

    if (!context.industry) {
        questions.push('¿Para qué industria o tipo de negocio es?');
    }

    if (context.hasBudget === undefined) {
        questions.push('¿Tenés un rango de presupuesto estimado en mente?');
    }

    return questions;
}

/**
 * Sugiere el servicio más apropiado basado en el contexto
 */
export function suggestService(context: LeadContext): {
    service: ServiceType;
    reason: string;
} {
    const { projectDescription, timeline, budgetRange } = context;

    // Si menciona urgencia o tiempo corto → template
    if (timeline && /urgente|rápido|semana|ya/i.test(timeline)) {
        return {
            service: 'template',
            reason: 'Por tu timeline ajustado, un template premium personalizado sería la mejor opción para lanzar rápido sin sacrificar calidad.',
        };
    }

    // Si menciona presupuesto bajo → template
    if (budgetRange && /poco|limitado|bajo|económico/i.test(budgetRange)) {
        return {
            service: 'template',
            reason: 'Para optimizar tu inversión, un template premium es excelente opción. Lo personalizamos a tu marca y lo tenés funcionando en días.',
        };
    }

    // Si menciona características complejas → custom
    if (projectDescription && /único|complejo|específico|integración|api|sistema/i.test(projectDescription)) {
        return {
            service: 'custom_web',
            reason: 'Por los requerimientos específicos que mencionás, un desarrollo a medida te va a dar la flexibilidad y escalabilidad que necesitás.',
        };
    }

    // Default based on detected intent
    return {
        service: context.serviceType || 'consultation',
        reason: 'Según lo que me contaste, este servicio se alinea con tus objetivos.',
    };
}

// ============================================================================
// OBJECTION HANDLING
// ============================================================================

export const OBJECTION_RESPONSES: Record<string, string> = {
    price_too_high:
        'Entiendo la preocupación por el presupuesto. Nuestros precios reflejan código profesional y arquitectura escalable. Podemos explorar opciones como empezar con un MVP o un template personalizado que se ajuste mejor a tu inversión inicial. ¿Cuál es el rango que manejás?',

    need_cheaper:
        'Hay opciones más económicas en el mercado (plantillas genéricas, Fiverr, etc.), pero la diferencia está en el approach. Nosotros entregamos código propietario que es tuyo y crece con tu negocio. Si el presupuesto es ajustado, podemos priorizar features esenciales o arrancar con un template. ¿Qué te parece?',

    too_slow:
        'Los tiempos dependen del alcance. Templates personalizados: 1-2 semanas. Custom: 3-8 semanas. Si tenés una fecha crítica, podemos trabajar con un approach de MVP y luego iterar. ¿Cuál es tu deadline ideal?',

    not_sure_yet:
        'Perfecto, no hay apuro. A veces ayuda ver ejemplos concretos. ¿Querés que te muestre algún template similar a lo que buscás para que tengas una referencia? Después charlamos sin compromiso.',

    already_have_quote:
        'Excelente que estés evaluando opciones. Lo que nos diferencia es el enfoque de ingeniería: código escalable, no plantillas. Si querés, compartí tu quote con el equipo para comparar manzanas con manzanas y que veas el approach técnico que proponemos.',

    DIY_option:
        'Si tenés skills técnicos, plataformas como Wix o Webflow son válidas para empezar. La ventaja de trabajar con nosotros es que obtenés código profesional, optimización técnica y soporte de ingenieros. Cuando tu proyecto crezca, no vas a estar limitado por las restricciones de las plataformas. ¿Tenés experiencia programando?',
};

// ============================================================================
// ANALYTICS & TRACKING (opcional para después)
// ============================================================================

export interface ConversationMetrics {
    totalMessages: number;
    intentsDetected: ServiceType[];
    qualificationScore: number;
    timeToConnect: number; // seconds
    objections: string[];
}
