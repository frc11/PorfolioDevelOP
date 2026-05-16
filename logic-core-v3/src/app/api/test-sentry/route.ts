import { NextResponse } from 'next/server'

export async function GET() {
  throw new Error('Test Sentry — esto debería aparecer en el dashboard de Sentry')
}
