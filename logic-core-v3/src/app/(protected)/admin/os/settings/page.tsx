import { Settings } from 'lucide-react'
import { SettingsConsole } from './_components/settings-console'
import { getSettings, listTeamMembers } from './_actions/settings.actions'

export default async function AgencyOsSettingsPage() {
  const [settingsResult, teamMembersResult] = await Promise.all([
    getSettings(),
    listTeamMembers(),
  ])

  if (!settingsResult.success) {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
              <Settings className="h-7 w-7" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                Agency OS / Configuracion
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                Configuracion
              </h1>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {settingsResult.error}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {!teamMembersResult.success ? (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-5 text-sm text-amber-100">
          {teamMembersResult.error}
        </div>
      ) : null}

      <SettingsConsole
        agencyName={settingsResult.data.settings.agencyName}
        updatedAt={settingsResult.data.settings.updatedAt}
        maskedTelegramBotToken={settingsResult.data.settings.osTelegramBotTokenMasked}
        settings={{
          contactEmail: settingsResult.data.settings.contactEmail,
          contactWhatsapp: settingsResult.data.settings.contactWhatsapp,
          websiteUrl: settingsResult.data.settings.websiteUrl,
          alertWebhookUrl: settingsResult.data.settings.alertWebhookUrl,
          alertOnTickets: settingsResult.data.settings.alertOnTickets,
          alertOnLeads: settingsResult.data.settings.alertOnLeads,
          alertOnChurn: settingsResult.data.settings.alertOnChurn,
          alertOnExpiringSubscriptions:
            settingsResult.data.settings.alertOnExpiringSubscriptions,
          alertOnClientMessages:
            settingsResult.data.settings.alertOnClientMessages,
          osWeeklyDemoTarget: settingsResult.data.settings.osWeeklyDemoTarget,
          osTelegramChatId: settingsResult.data.settings.osTelegramChatId,
        }}
        modulePricing={settingsResult.data.modulePricing}
        teamMembers={teamMembersResult.success ? teamMembersResult.data : []}
      />
    </section>
  )
}
