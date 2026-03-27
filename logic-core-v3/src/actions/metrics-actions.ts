'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function upsertBusinessMetrics(
  clientId: string,
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
      clientId,
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
        clientId,
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

export async function toggleClientFeature(
  clientId: string,
  featureId: string,
  isUnlocked: boolean
) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { id: clientId }
  })

  if (!user) {
    throw new Error('Client not found')
  }

  let features = user.unlockedFeatures || []

  if (isUnlocked) {
    if (!features.includes(featureId)) {
      features.push(featureId)
    }
  } else {
    features = features.filter(f => f !== featureId)
  }

  await prisma.user.update({
    where: { id: clientId },
    data: {
      unlockedFeatures: features
    }
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
