/**
 * Fixtures del webhook de la Cloud API reenviado por 360dialog (B1-S1).
 *
 * Payloads con la forma REAL de los eventos — envelope entry/changes,
 * metadata, y el ruido que Meta manda de verdad (profile, conversation,
 * pricing, error_data) para probar que el parser tolera claves extra —
 * parametrizados por los datos del seed de cada corrida. Reflejan los datos
 * verificados del sprint: user_id (BSUID) siempre presente en mensajes,
 * wa_id/from pueden ser teléfono o BSUID, los status failed omiten contacts.
 */

export interface InboundMessageFixture {
  phoneNumberId: string
  /** wa_id y from del contacto: teléfono o BSUID — el test elige el escenario. */
  address: string
  bsuid: string
  wamid: string
  text?: string
  name?: string
  wabaId?: string
}

export function inboundTextMessagePayload(input: InboundMessageFixture): Record<string, unknown> {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: input.wabaId ?? '102290129340398',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550783881',
                phone_number_id: input.phoneNumberId,
              },
              contacts: [
                {
                  profile: { name: input.name ?? 'Cliente QA' },
                  wa_id: input.address,
                  user_id: input.bsuid,
                },
              ],
              messages: [
                {
                  from: input.address,
                  id: input.wamid,
                  timestamp: '1720000000',
                  text: { body: input.text ?? 'Hola, quiero info del servicio' },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  }
}

export interface StatusFixture {
  phoneNumberId: string
  wamid: string
  status: 'sent' | 'delivered' | 'read'
  recipientAddress: string
  recipientBsuid: string
}

/** Status de entrega/lectura — trae contacts con user_id (dato verificado). */
export function statusPayload(input: StatusFixture): Record<string, unknown> {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '102290129340398',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550783881',
                phone_number_id: input.phoneNumberId,
              },
              contacts: [{ wa_id: input.recipientAddress, user_id: input.recipientBsuid }],
              statuses: [
                {
                  id: input.wamid,
                  status: input.status,
                  timestamp: '1720000100',
                  recipient_id: input.recipientAddress,
                  recipient_user_id: input.recipientBsuid,
                  conversation: {
                    id: '3f2a1b7c8d9e0f1a2b3c4d5e6f7a8b9c',
                    origin: { type: 'service' },
                  },
                  pricing: { billable: true, pricing_model: 'PMP', category: 'service' },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  }
}

export interface FailedStatusFixture {
  phoneNumberId: string
  wamid: string
  recipientBsuid: string
}

/** Status failed — OMITE el bloque contacts (dato verificado del sprint). */
export function failedStatusPayload(input: FailedStatusFixture): Record<string, unknown> {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '102290129340398',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550783881',
                phone_number_id: input.phoneNumberId,
              },
              statuses: [
                {
                  id: input.wamid,
                  status: 'failed',
                  timestamp: '1720000200',
                  recipient_user_id: input.recipientBsuid,
                  errors: [
                    {
                      code: 131047,
                      title: 'Re-engagement message',
                      message: 'Re-engagement message',
                      error_data: {
                        details:
                          'Message failed to send because more than 24 hours have passed since the customer last replied to this number.',
                      },
                    },
                  ],
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  }
}

export interface UserIdUpdateFixture {
  phoneNumberId: string
  oldBsuid: string
  newBsuid: string
}

export function userIdUpdatePayload(input: UserIdUpdateFixture): Record<string, unknown> {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '102290129340398',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550783881',
                phone_number_id: input.phoneNumberId,
              },
              user_id_update: {
                old_user_id: input.oldBsuid,
                new_user_id: input.newBsuid,
                timestamp: '1720000300',
              },
            },
            field: 'user_id_update',
          },
        ],
      },
    ],
  }
}

/** Evento real de otro producto de la Cloud API que B1-S1 no maneja. */
export function unknownEventPayload(phoneNumberId: string): Record<string, unknown> {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '102290129340398',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '15550783881', phone_number_id: phoneNumberId },
              event: 'PARTNER_ADDED',
            },
            field: 'account_update',
          },
        ],
      },
    ],
  }
}
