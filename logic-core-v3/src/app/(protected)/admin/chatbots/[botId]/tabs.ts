export const VALID_TABS = ['overview', 'config', 'knowledge', 'activity', 'leads', 'conversations', 'install', 'integrations'] as const
export type TabId = (typeof VALID_TABS)[number]
