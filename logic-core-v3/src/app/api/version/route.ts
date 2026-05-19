import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    builtAt: process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
