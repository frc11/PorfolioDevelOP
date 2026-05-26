'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// B11.6 — recibe `organizationId` (antes era `clientId` apuntando a User.id;
// la métrica conceptualmente es del negocio, no del individuo).
export async function upsertBusinessMetrics(
  organizationId: string,
  data: {
    month: string
    monthlyVisitors: number
    bounceRate: number
    avgTicketPrice: number
  }
) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }

  const existingMetric = await prisma.businessMetric.findFirst({
    where: {
      organizationId,
      month: data.month
    }
  })

  if (existingMetric) {
    await prisma.businessMetric.update({
      where: { id: existingMetric.id },
      data: {
        monthlyVisitors: data.monthlyVisitors,
        bounceRate: data.bounceRate,
        avgTicketPrice: data.avgTicketPrice
      }
    })
  } else {
    await prisma.businessMetric.create({
      data: {
        organizationId,
        month: data.month,
        monthlyVisitors: data.monthlyVisitors,
        bounceRate: data.bounceRate,
        avgTicketPrice: data.avgTicketPrice
      }
    })
  }

  revalidatePath('/dashboard')
  return { success: true }
}

