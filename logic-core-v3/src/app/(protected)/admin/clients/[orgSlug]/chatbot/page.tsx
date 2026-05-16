import { redirect } from 'next/navigation'

export default async function ChatbotIndex({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  redirect(`/admin/clients/${orgSlug}/chatbot/overview`)
}
