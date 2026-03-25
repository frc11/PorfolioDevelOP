import { Resend } from 'resend'
import * as React from 'react'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[]
  subject: string
  react: React.ReactElement
}) {
  if (!resend) {
    return { success: true }
  }

  try {
    const data = await resend.emails.send({
      from: 'develOP Agency <hello@develop-agency.com>',
      to,
      subject,
      react,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
