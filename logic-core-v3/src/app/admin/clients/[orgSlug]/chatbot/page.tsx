import { redirect } from 'next/navigation'

export default async function ChatbotIndexPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  redirect(`/admin/clients/${orgSlug}/chatbot/overview`)
}
