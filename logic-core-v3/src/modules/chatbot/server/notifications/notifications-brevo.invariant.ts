/**
 * D3' — Invariante del contenido + motor de los mails migrados a Brevo.
 * Corre:  npx tsx src/modules/chatbot/server/notifications/notifications-brevo.invariant.ts
 *         (o npm run check:invariant:notifications-brevo)
 *
 * Puro: sin red ni DB. Borra las API keys del env ANTES de enviar, así:
 *   1) El render de cada template es determinístico (nunca llama a Brevo).
 *   2) El envío cae en el path "no configurado", que devuelve el contrato de
 *      brevo-service ('EMAIL_NOT_CONFIGURED'). Eso PRUEBA que el motor es Brevo
 *      —Resend devolvía otra firma— sin tocar la red.
 *
 * Cubre el sprint D3':
 *   - insights: el nombre del negocio (companyName) aparece y NUNCA sale
 *     "undefined" (regresión del bug org.name de D4, corregido en route.ts:66).
 *   - lead: los campos se preservan y el mensaje del lead se escapa (XSS-safe).
 *   - motor: ambos envíos enrutan por Brevo (contrato EMAIL_NOT_CONFIGURED /
 *     skipped), no por Resend.
 *
 * El env se lee lazy dentro de las funciones de envío, así que borrar las keys
 * acá (aunque los import se hoisteen) garantiza el path no-configurado al llamar.
 */
delete process.env.BREVO_API_KEY
delete process.env.RESEND_API_KEY

import assert from 'node:assert/strict'
import {
  sendLeadNotificationEmail,
  renderLeadNotificationHtml,
} from './sendLeadNotification.ts'
import {
  sendInsightsNotificationEmail,
  renderInsightsNotificationHtml,
} from './sendInsightsNotification.ts'

async function run() {
  // ── 1) INSIGHTS: nombre del negocio presente, nunca "undefined" ─────────────
  const insightsHtml = renderInsightsNotificationHtml({
    to: 'cliente@negocio.com',
    organizationName: 'Ferretería San Miguel',
    botName: 'Lucía',
    insightsCount: 3,
    dashboardUrl: 'https://app.develop.com.ar/dashboard/chatbot',
  })
  assert.ok(
    insightsHtml.includes('Ferretería San Miguel'),
    'el nombre del negocio (companyName) aparece en el mail de insights',
  )
  assert.ok(
    !insightsHtml.includes('undefined'),
    'el mail de insights NUNCA renderiza "undefined" (regresión del bug org.name de D4)',
  )
  assert.ok(insightsHtml.includes('Lucía'), 'el nombre del bot aparece en el mail de insights')
  assert.ok(insightsHtml.includes('3 insights nuevos'), 'el conteo de insights aparece')
  assert.ok(
    insightsHtml.includes('https://app.develop.com.ar/dashboard/chatbot'),
    'el link al panel aparece en el mail de insights',
  )

  // Pluralización count-aware ("oportunidad" vs "oportunidades"), preservada.
  const insightsSingular = renderInsightsNotificationHtml({
    to: 'x@y.com',
    organizationName: 'N',
    botName: 'B',
    insightsCount: 1,
    dashboardUrl: 'https://x',
  })
  assert.ok(insightsSingular.includes('1 oportunidad '), 'count=1 → "oportunidad" (singular)')
  assert.ok(!insightsSingular.includes('oportunidades'), 'count=1 no usa el plural')

  const insightsPlural = renderInsightsNotificationHtml({
    to: 'x@y.com',
    organizationName: 'N',
    botName: 'B',
    insightsCount: 4,
    dashboardUrl: 'https://x',
  })
  assert.ok(insightsPlural.includes('4 oportunidades'), 'count>1 → "oportunidades" (plural)')

  // ── 2) LEAD: campos preservados + escaping del mensaje del lead ─────────────
  const leadHtml = renderLeadNotificationHtml({
    to: 'admin@negocio.com',
    organizationName: 'Ferretería San Miguel',
    botName: 'Lucía',
    lead: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+54 11 2345 6789',
      intent: 'comprar',
      message: 'Hola, quiero <b>presupuesto</b>',
      createdAt: new Date('2026-07-03T12:00:00Z'),
    },
    dashboardUrl: 'https://app.develop.com.ar/dashboard/chatbot/leads',
  })
  assert.ok(leadHtml.includes('Ferretería San Miguel'), 'org name en el mail de lead')
  assert.ok(leadHtml.includes('Juan Pérez'), 'nombre del lead en el mail')
  assert.ok(leadHtml.includes('juan@example.com'), 'email del lead cuando existe')
  assert.ok(leadHtml.includes('+54 11 2345 6789'), 'teléfono del lead cuando existe')
  assert.ok(leadHtml.includes('comprar'), 'intent del lead en el mail')
  assert.ok(
    leadHtml.includes('&lt;b&gt;presupuesto&lt;/b&gt;'),
    'el mensaje del lead se escapa (XSS-safe), preservado en la migración',
  )
  assert.ok(!leadHtml.includes('<b>presupuesto</b>'), 'el html crudo del lead NO se inyecta')
  assert.ok(!leadHtml.includes('undefined'), 'el mail de lead nunca renderiza "undefined"')

  // Sin email/teléfono → las filas se omiten, sin "undefined".
  const leadNoContact = renderLeadNotificationHtml({
    to: 'admin@negocio.com',
    organizationName: 'N',
    botName: 'B',
    lead: {
      name: 'Ana',
      email: null,
      phone: null,
      intent: 'consulta',
      message: 'hola',
      createdAt: new Date('2026-07-03T12:00:00Z'),
    },
    dashboardUrl: 'https://x',
  })
  assert.ok(!leadNoContact.includes('Email:'), 'sin email → no se renderiza la fila Email')
  assert.ok(!leadNoContact.includes('Telefono:'), 'sin teléfono → no se renderiza la fila Telefono')
  assert.ok(!leadNoContact.includes('undefined'), 'null no produce "undefined" en el mail de lead')

  // ── 3) MOTOR: ambos envíos enrutan por Brevo (sin red, keys borradas) ───────
  const insightsSend = await sendInsightsNotificationEmail({
    to: 'cliente@negocio.com',
    organizationName: 'N',
    botName: 'B',
    insightsCount: 2,
    dashboardUrl: 'https://x',
  })
  assert.equal(insightsSend.ok, false, 'sin BREVO_API_KEY el envío de insights no procede')
  assert.ok(
    'error' in insightsSend && insightsSend.error === 'EMAIL_NOT_CONFIGURED',
    'insights enruta por Brevo: "EMAIL_NOT_CONFIGURED" es el contrato de brevo-service, no de Resend',
  )

  const leadSend = await sendLeadNotificationEmail({
    to: 'admin@negocio.com',
    organizationName: 'N',
    botName: 'B',
    lead: {
      name: 'Ana',
      email: null,
      phone: null,
      intent: 'consulta',
      message: 'hola',
      createdAt: new Date('2026-07-03T12:00:00Z'),
    },
    dashboardUrl: 'https://x',
  })
  assert.equal(leadSend.ok, false, 'sin motor configurado el Test email no procede')
  assert.ok(
    'skipped' in leadSend && leadSend.skipped === true,
    'lead preserva el contrato "skipped" del botón admin (mapeado desde EMAIL_NOT_CONFIGURED de Brevo)',
  )

  console.log('✓ notifications-brevo invariant OK — templates preservados, nombre presente, motor Brevo')
}

run().catch((err) => {
  console.error('✗ notifications-brevo invariant FAILED')
  console.error(err)
  process.exit(1)
})
