/**
 * EV.3 — Pack `usados`: concesionaria de autos (0km + usados).
 *
 * Extracción VERBATIM de la tabla de scoring que vivía hardcodeada en
 * `scoring/calculateLeadScore.ts` (SCORING_TABLE, COMBO_BONUSES, penalties,
 * DQ_CATEGORIES, thresholds). Cada label y cada punto es copia
 * carácter-por-carácter de los valores actuales — cero "mejoras".
 *
 * Garantía de paridad: para las mismas entradas, el motor leyendo este pack
 * produce EXACTAMENTE los mismos scores que la implementación previa. Probado
 * por la suite dorada (`__tests__/ev3.golden.invariant.ts`, 208 casos) y por
 * la equivalencia estructural contra las constantes legacy
 * (`__tests__/ev3.invariant.ts`).
 *
 * Combos: `ComboBonus.matches` (función, no serializable) → `requiredSignalKeys`
 * (declarativo). El motor dispara el combo cuando TODAS las señales requeridas
 * están activas — equivalente exacto a las condiciones AND originales.
 *
 * `intents` queda vacío y `toolCopy`/`widgetCopy` son placeholders: los
 * completan EV.4 (intents) y EV.5 (tool copy). El núcleo de este sprint es el
 * scoring.
 */

import type { VerticalPack } from '../types'

export const USADOS_PACK: VerticalPack = {
  key: 'usados',
  displayName: 'Concesionaria (0km + usados)',

  scoring: {
    // Tabla POSITIVA — verbatim de SCORING_TABLE. Orden = orden visual de
    // explicabilidad (mayor a menor impacto). Suma máxima 100.
    signals: [
      { key: 'requestedAppointment', label: 'Pidió cita / test drive', points: 40 },
      { key: 'mentionedFinancing', label: 'Pidió financiación / cuotas', points: 25 },
      { key: 'mentionedTradeIn', label: 'Tiene usado para entregar', points: 20 },
      { key: 'askedSpecificModel', label: 'Pregunta por modelo específico', points: 10 },
      { key: 'providedPhone', label: 'Dejó teléfono', points: 5 },
    ],

    // Combos — verbatim de COMBO_BONUSES. `requiredSignalKeys` reemplaza la
    // función `matches`: ambas señales activas → combo dispara.
    combos: [
      {
        key: 'combo_tradein_financing',
        label: 'Tiene usado + pide financiación (perfil de cierre)',
        points: 10,
        requiredSignalKeys: ['mentionedTradeIn', 'mentionedFinancing'],
      },
      {
        key: 'combo_specific_model_appointment',
        label: 'Sabe qué modelo quiere + agenda visita',
        points: 5,
        requiredSignalKeys: ['askedSpecificModel', 'requestedAppointment'],
      },
    ],

    // Penalties — verbatim. Orden postventa → invalid_phone (importa para el
    // orden de las señales persistidas en explicabilidad).
    penalties: [
      {
        key: 'penalty_postventa',
        label: 'Consulta de postventa (no compra)',
        points: -50,
        condition: 'category_postventa',
      },
      {
        key: 'penalty_invalid_phone',
        label: 'Teléfono con formato dudoso',
        points: -20,
        condition: 'invalid_phone',
      },
    ],

    dqCategories: ['employment', 'provider', 'spam'],

    thresholds: {
      caliente: 70, // HOT_THRESHOLD
      tibio: 40, // WARM_THRESHOLD
    },
  },

  // EV.4 — Intents de concesionaria (compraventa de autos). Vocabulario es-AR
  // (voseo, con/sin tildes). El ORDEN define prioridad: alta-intención primero
  // (compra/visita/permuta/financiación) antes que precio genérico. Compilado
  // del MATERIAL de planificación EV.4 — sin agregar conceptos.
  intents: [
    {
      intent: 'purchase_ready',
      patterns: [
        /lo quiero\b/i,
        /c[oó]mo (hago para |puedo )?comprar(lo)?/i,
        /lo se[ñn](amos|o|ás|as)\b/i,
        /\bse[ñn]ar\b/i,
        /te lo compro/i,
        /\blo compro\b/i,
        /d[oó]nde (transfiero|deposito|pago)/i,
        /hacemos la operaci[oó]n/i,
        /me lo llevo/i,
        /\bcerramos\b/i,
      ],
      guidance:
        'El visitante muestra intención de compra concreta. Confirmá disponibilidad del vehículo y ' +
        'guialo al próximo paso (seña o visita) sin presionar. Si te da un teléfono o email, usá capture_lead.',
    },
    {
      intent: 'schedule_visit',
      patterns: [
        /(puedo |quiero )?ir a verlo/i,
        /test\s*drive/i,
        /\bprobar(lo)?\b/i,
        /pasar por (la agencia|el local|el concesionario)/i,
        /cu[aá]ndo puedo ir/i,
        /me lo mostr[aá]s/i,
        /verlo hoy/i,
        /agendar (una )?visita/i,
      ],
      guidance:
        'El visitante quiere ver o probar el auto. Ofrecé coordinar una visita o test drive; pedí día y horario ' +
        'y un dato de contacto. Es buen momento para capture_lead.',
    },
    {
      intent: 'trade_in',
      patterns: [
        /permut[oa]\b/i,
        /permutar/i,
        /tengo un usado/i,
        /usado (para|en) entregar/i,
        /tom[aá]s (mi |el )?usado/i,
        /recib[ií]s usados/i,
        /entrego el m[ií]o/i,
        /parte de pago/i,
        /cu[aá]nto me tom[aá]s/i,
      ],
      guidance:
        'El visitante quiere entregar un usado en parte de pago. Pedí los datos del vehículo (marca, modelo, ' +
        'año, kilómetros, estado) para una tasación, aclarando que la tasación final la confirma un asesor.',
    },
    {
      intent: 'financing_inquiry',
      patterns: [
        /financiaci[oó]n/i,
        /financiad[oa]/i,
        /\bcuotas?\b/i,
        /prendario/i,
        /\bcr[eé]dito\b/i,
        /\banticipo\b/i,
        /cu[aá]nto de entrega/i,
        /\btasa\b/i,
      ],
      guidance:
        'El visitante preguntó por financiación o cuotas. Explicá que hay opciones (crédito propio, bancos, ' +
        'planes) sin prometer tasas exactas, y ofrecé que un asesor le arme una propuesta a medida.',
    },
    {
      intent: 'specific_model',
      patterns: [
        // Modelos distintivos. Se OMITEN tokens que colisionan con palabras
        // comunes del castellano (gol, toro, partner, fiesta, ka) para evitar
        // falsos positivos ("metió un gol", "fuerte como un toro").
        /\b(corolla|hilux|amarok|ranger|onix|cronos|etios|kangoo|saveiro|t[-\s]?cross|nivus|tracker|cruze|focus|duster|oroch|captur|kwid|strada|fiorino|montana)\b/i,
        /qu[eé] versi[oó]n/i,
        /a[ñn]o y kil[oó]metros/i,
        /cu[aá]ntos kil[oó]metros/i,
        /qu[eé] a[ñn]o es/i,
        /que public(aron|aste)/i,
      ],
      guidance:
        'El visitante pregunta por un modelo o versión concreta. Dale la info que tengas de ese vehículo ' +
        '(versión, año, kilómetros, disponibilidad) y ofrecé coordinar una visita para verlo.',
    },
    {
      intent: 'price_inquiry',
      patterns: [
        /cu[aá]nto (sale|vale|pides|ped[ií]s)/i,
        /\bprecio\b/i,
        /negociable/i,
        /[uú]ltimo precio/i,
        /acept(an|ás) (una )?oferta/i,
        /hacen (precio|descuento)/i,
      ],
      guidance:
        'El visitante preguntó el precio. Si tenés el precio publicado, dalo; si pregunta por descuentos u ofertas, ' +
        'no cierres un número final — ofrecé que un asesor le confirme la mejor condición.',
    },
    {
      intent: 'human_handoff',
      patterns: [
        /hablar con (una persona|alguien|un (vendedor|asesor|humano))/i,
        /que me llame un (vendedor|asesor)/i,
        /pasame con (alguien|un (vendedor|asesor))/i,
        /n[uú]mero de (tel[eé]fono|la agencia|whatsapp)/i,
        /con un humano/i,
        /atenci[oó]n humana/i,
      ],
      guidance:
        'El visitante quiere hablar con una persona. Validá el pedido y derivá: ofrecé el WhatsApp del asesor ' +
        'o pedí sus datos para que lo contacten. Usá la tool de handoff o capture_lead.',
    },
  ],

  // EV.5 cablea estos strings en las descripciones de tools. Los ejemplos de
  // modelo ya existen en captureLead.ts (no inventados).
  toolCopy: {
    specificModelExamples: 'Corolla XEi, Hilux SRV',
    prefilledMessageExample:
      'Hola, soy [nombre]. Quería consultar por un auto y coordinar una visita o test drive.',
    topicSummaryExample:
      'Visitante interesado en un vehículo, consultó por modelo, financiación y disponibilidad.',
  },

  // Copy de onboarding del widget (EV.5 / onboarding puede refinarlo).
  widgetCopy: {
    welcomeMessages: [
      '¡Hola! Te ayudo con info sobre nuestros autos, planes de pago, agendar un test drive o lo que necesites.',
    ],
    botNameSuggestions: ['Lucía', 'Asistente', 'Tomás'],
  },
} satisfies VerticalPack
