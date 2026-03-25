import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version'
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { clientId, url, duration } = data
    
    // Si no hay información mínima, abortamos pero retornamos éxito para no romper el cliente
    if (!clientId || !url) {
      return NextResponse.json({ success: true, message: 'Missing required fields' }, { headers: corsHeaders })
    }

    await prisma.pageView.create({
      data: {
        clientId: String(clientId),
        url: String(url),
        duration: duration ? Number(duration) : null
      }
    })

    // Retornamos de forma muy rápida
    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    // Evitamos bloqueos si algo falla en la DB al trackear
    console.error('[TRACKING API ERROR]', error)
    return NextResponse.json({ success: true }, { headers: corsHeaders })
  }
}
