export const DEFAULT_AGENCY_SETTINGS_ID = 'agency-settings-default'

export const DEFAULT_AGENCY_SETTINGS = {
  id: DEFAULT_AGENCY_SETTINGS_ID,
  agencyName: 'develOP',
  contactEmail: 'hello@develop.com.ar',
  contactWhatsapp: '',
  websiteUrl: 'https://develop.com.ar',
  alertWebhookUrl: '',
  alertOnTickets: true,
  alertOnLeads: true,
  alertOnChurn: true,
  alertOnExpiringSubscriptions: true,
  alertOnClientMessages: false,
} as const

export const AGENCY_TIMEZONE = 'America/Argentina/Buenos_Aires'
