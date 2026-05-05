const API_BASE = 'https://api.brevo.com/v3'

const headers = () => ({
  'api-key': process.env.BREVO_API_KEY ?? '',
  'Content-Type': 'application/json',
  'Accept': 'application/json',
})

export async function ensureBrevoList(orgName: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/contacts/lists`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        name: `develOP - ${orgName}`,
        folderId: 1,
      }),
    })
    if (!res.ok) {
      console.error('[Brevo] ensureList:', await res.text())
      return null
    }
    const data = await res.json()
    return data.id
  } catch (err) {
    console.error('[Brevo] ensureList error:', err)
    return null
  }
}

export async function syncContact(params: {
  email: string
  firstName?: string | null
  lastName?: string | null
  listIds: number[]
  attributes?: Record<string, string>
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: params.email,
        attributes: {
          FIRSTNAME: params.firstName ?? '',
          LASTNAME: params.lastName ?? '',
          ...params.attributes,
        },
        listIds: params.listIds,
        updateEnabled: true,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[Brevo] syncContact error:', err)
    return false
  }
}

export async function createCampaign(params: {
  name: string
  subject: string
  htmlContent: string
  fromName: string
  fromEmail: string
  listIds: number[]
}): Promise<{ ok: true; campaignId: number } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/emailCampaigns`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        name: params.name,
        subject: params.subject,
        htmlContent: params.htmlContent,
        sender: { name: params.fromName, email: params.fromEmail },
        recipients: { listIds: params.listIds },
      }),
    })

    if (!res.ok) {
      return { ok: false, error: `Brevo error: ${res.status} ${await res.text()}` }
    }

    const data = await res.json()
    return { ok: true, campaignId: data.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown' }
  }
}

export async function sendCampaign(campaignId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/emailCampaigns/${campaignId}/sendNow`, {
      method: 'POST',
      headers: headers(),
    })
    return res.ok
  } catch (err) {
    console.error('[Brevo] sendCampaign error:', err)
    return false
  }
}

export async function getCampaignStats(campaignId: number): Promise<{
  recipientCount: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
} | null> {
  try {
    const res = await fetch(`${API_BASE}/emailCampaigns/${campaignId}`, {
      headers: headers(),
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      recipientCount: data.recipients?.lists?.length ?? 0,
      opened: data.statistics?.globalStats?.uniqueViews ?? 0,
      clicked: data.statistics?.globalStats?.uniqueClicks ?? 0,
      bounced: data.statistics?.globalStats?.softBounces ?? 0,
      unsubscribed: data.statistics?.globalStats?.unsubscriptions ?? 0,
    }
  } catch {
    return null
  }
}
