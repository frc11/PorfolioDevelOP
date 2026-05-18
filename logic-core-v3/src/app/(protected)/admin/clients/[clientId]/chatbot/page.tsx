import { redirect } from 'next/navigation'

export default async function ChatbotIndex({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  redirect(`/admin/clients/${clientId}/chatbot/overview`)
}
