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
            /precio/i, /costo/i, /cu[aá]nto cuesta/i, /presupuesto/i, /cotiza/i, /valor/i, /invertir/i,
            /cu[aá]nto sale/i, /cu[aá]nto cobran/i, /tarifa/i, /plan/i, /paquete/i, /accesible/i, /barato/i, /caro/i
        ],
        comparison: [
            /competencia/i, /otros/i, /fiverr/i, /freelance/i, /agencia/i, /diferencia/i,
            /por qu[eé] ustedes/i, /por qu[eé] develOP/i, /mejor que/i, /comparado/i, /ventaja/i
        ],
        urgency: [
            /urgente/i, /r[aá]pido/i, /cu[aá]nto tardan/i, /tiempos/i, /deadline/i, /para ayer/i,
            /lo necesito ya/i, /esta semana/i, /este mes/i, /cu[aá]ndo est[aá]/i, /entrega/i
        ],
        template: [
            /template/i, /plantilla/i, /luxury|tech|cyber|dining/i, /demo/i,
            /predise[nñ]ado/i, /modelo/i, /base/i
        ],
        custom_web: [
            /web.*medida/i, /custom/i, /desarrollo web/i, /p[aá]gina web/i, /landing/i,
            /sitio web/i, /web propia/i, /quiero una web/i, /necesito una web/i, /mi web/i
        ],
        software: [
            /sistema/i, /software/i, /crm/i, /erp/i, /dashboard/i, /herramienta/i,
            /plataforma/i, /panel/i, /gesti[oó]n/i, /administraci[oó]n/i, /excel/i,
            /base de datos/i, /flujo de trabajo/i, /proceso interno/i
        ],
        ai_automation: [
            /\bia\b/i, /inteligencia artificial/i, /chatbot/i, /automatiza/i, /n8n/i,
            /bot/i, /agente/i, /respuesta autom/i, /atenci[oó]n autom/i, /flujo autom/i,
            /sin intervenci[oó]n/i, /solo solo/i, /que trabaje solo/i
        ],
        consultation: [
            /hablar/i, /reuni[oó]n/i, /contacto/i, /whatsapp/i,
            /llamada/i, /video/i, /zoom/i, /meet/i, /agenda/i, /charlar/i,
            /quiero hablar/i, /me pod[eé]s llamar/i
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
            return "El costo depende del problema que vamos a resolver, y eso varía bastante. Lo que sí puedo decirte es que el retorno de una solución bien implementada suele cubrir la inversión en los primeros meses. ¿Qué es lo que querés resolver concretamente?";
        case 'comparison':
            return "La diferencia real está en si te van a entregar algo que funciona para tu negocio o algo genérico. ¿Qué es lo más importante para vos que quede bien resuelto?";
        case 'urgency':
            return "Entiendo. Para darte una idea real de tiempos necesito saber bien de qué se trata. ¿Podés contarme más sobre lo que necesitás?";
        case 'custom_web':
            return "Para una web a medida, lo más importante es entender para qué la vas a usar: ¿captar clientes, vender online, mostrar portfolio? ¿Cómo están llegando hoy los clientes a tu negocio?";
        case 'software':
            return "Antes de pensar en un sistema, me ayuda entender cómo están manejando el proceso hoy. ¿Qué herramienta están usando actualmente y qué es lo que no les está funcionando?";
        case 'ai_automation':
            return "Para que la IA tenga sentido tiene que resolver un problema concreto. ¿Qué tarea se repite más en tu equipo y cuánto tiempo les lleva cada vez?";
        case 'consultation':
            return "Con gusto. Para que la charla sea más productiva, contame brevemente de qué se trata tu negocio y qué problema querés resolver. Así coordinamos con el equipo indicado.";
        default:
            return null;
    }
}
