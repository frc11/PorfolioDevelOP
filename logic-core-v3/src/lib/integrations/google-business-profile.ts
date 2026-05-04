import { google } from 'googleapis'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/businessprofileperformance',
]

type GoogleReview = {
  reviewer?: {
    displayName?: string | null
  }
  starRating?: string | null
  comment?: string | null
  createTime?: string | null
  reviewReply?: unknown
}

type GoogleReviewsResponse = {
  totalReviewCount?: number
  averageRating?: number
  reviews?: GoogleReview[]
}

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_ID,
    process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET,
    process.env.GOOGLE_BUSINESS_PROFILE_REDIRECT_URI,
  )
}

export function getAuthUrl(orgId: string): string {
  const oauth2Client = getOAuthClient()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: orgId,
    prompt: 'consent',
  })
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

async function getAuthedClient(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      gbpAccessToken: true,
      gbpRefreshToken: true,
      gbpTokenExpiresAt: true,
    },
  })

  if (!org?.gbpAccessToken || !org.gbpRefreshToken) return null

  const oauth2Client = getOAuthClient()
  oauth2Client.setCredentials({
    access_token: org.gbpAccessToken,
    refresh_token: org.gbpRefreshToken,
    expiry_date: org.gbpTokenExpiresAt?.getTime(),
  })

  if (org.gbpTokenExpiresAt && org.gbpTokenExpiresAt.getTime() < Date.now() + 60000) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken()

      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          gbpAccessToken: credentials.access_token ?? org.gbpAccessToken,
          gbpTokenExpiresAt: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : org.gbpTokenExpiresAt,
        },
      })

      oauth2Client.setCredentials({
        access_token: credentials.access_token ?? org.gbpAccessToken,
        refresh_token: org.gbpRefreshToken,
        expiry_date: credentials.expiry_date ?? org.gbpTokenExpiresAt.getTime(),
      })
    } catch (err) {
      console.error('[GBP] Refresh failed:', err)
      return null
    }
  }

  return oauth2Client
}

export type GBPLocationMetrics = {
  totalReviews: number
  averageRating: number
  recentReviews: Array<{
    reviewerName: string
    rating: number
    comment: string | null
    createdAt: Date
    replied: boolean
  }>
  performance: {
    profileViews: number
    websiteClicks: number
    callClicks: number
    directionRequests: number
    period: '30d'
  }
}

export async function getGBPMetrics(organizationId: string): Promise<GBPLocationMetrics | null> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      gbpAccessToken: true,
      gbpRefreshToken: true,
      gbpLocationId: true,
      gbpConnectedAt: true,
    },
  })

  if (!org?.gbpAccessToken || !org.gbpRefreshToken || !org.gbpLocationId) return null

  return unstable_cache(
    async () => fetchGBPMetrics(organizationId),
    ['gbp-metrics', organizationId, org.gbpLocationId, org.gbpConnectedAt?.toISOString() ?? ''],
    { revalidate: 3600, tags: [`gbp:${organizationId}`] },
  )()
}

async function fetchGBPMetrics(organizationId: string): Promise<GBPLocationMetrics | null> {
  const oauth2Client = await getAuthedClient(organizationId)
  if (!oauth2Client) return null

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { gbpAccountId: true, gbpLocationId: true },
  })

  if (!org?.gbpLocationId) return null

  try {
    const reviewsRes = await fetch(
      `https://mybusiness.googleapis.com/v4/${org.gbpLocationId}/reviews?pageSize=20`,
      { headers: { Authorization: `Bearer ${oauth2Client.credentials.access_token}` } },
    )

    if (!reviewsRes.ok) {
      console.error('[GBP] Reviews API error:', reviewsRes.status, await reviewsRes.text())
      return null
    }

    const reviewsData = parseReviewsResponse(await reviewsRes.json())
    const totalReviews = reviewsData.totalReviewCount ?? 0
    const averageRating = reviewsData.averageRating ?? 0
    const recentReviews = (reviewsData.reviews ?? []).slice(0, 10).map((review) => ({
      reviewerName: review.reviewer?.displayName ?? 'Anónimo',
      rating: parseStarRating(review.starRating),
      comment: review.comment ?? null,
      createdAt: parseReviewDate(review.createTime),
      replied: Boolean(review.reviewReply),
    }))

    const performance = {
      profileViews: 0,
      websiteClicks: 0,
      callClicks: 0,
      directionRequests: 0,
      period: '30d' as const,
    }

    return {
      totalReviews,
      averageRating,
      recentReviews,
      performance,
    }
  } catch (err) {
    console.error('[GBP] fetchGBPMetrics error:', err)
    return null
  }
}

function parseStarRating(starRating: string | null | undefined): number {
  if (starRating === 'FIVE') return 5
  if (starRating === 'FOUR') return 4
  if (starRating === 'THREE') return 3
  if (starRating === 'TWO') return 2
  return 1
}

function parseReviewDate(createTime: string | null | undefined): Date {
  if (!createTime) return new Date()

  const parsed = new Date(createTime)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function parseReviewsResponse(value: unknown): GoogleReviewsResponse {
  if (!isRecord(value)) return {}

  return {
    totalReviewCount: typeof value.totalReviewCount === 'number' ? value.totalReviewCount : undefined,
    averageRating: typeof value.averageRating === 'number' ? value.averageRating : undefined,
    reviews: Array.isArray(value.reviews)
      ? value.reviews.filter(isGoogleReview)
      : undefined,
  }
}

function isGoogleReview(value: unknown): value is GoogleReview {
  return isRecord(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
