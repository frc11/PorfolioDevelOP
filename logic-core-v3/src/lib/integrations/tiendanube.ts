import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

const API_BASE = 'https://api.tiendanube.com/v1'

const headers = (storeId: number, accessToken: string) => ({
  'Authentication': `bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'User-Agent': `develOP (contacto@develop.com.ar)`,
})

// ─── OAuth Flow ───

export function getAuthUrl(orgId: string): string {
  const params = new URLSearchParams({ state: orgId })
  return `https://www.tiendanube.com/apps/${process.env.TIENDANUBE_CLIENT_ID}/authorize?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  user_id: number
} | null> {
  try {
    const res = await fetch('https://www.tiendanube.com/apps/authorize/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.TIENDANUBE_CLIENT_ID,
        client_secret: process.env.TIENDANUBE_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
      }),
    })
    if (!res.ok) {
      console.error('[Tiendanube] token exchange:', await res.text())
      return null
    }
    return res.json()
  } catch (err) {
    console.error('[Tiendanube] OAuth error:', err)
    return null
  }
}

// ─── Helper auth ───

async function getAuth(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { tiendanubeStoreId: true, tiendanubeAccessToken: true },
  })
  if (!org?.tiendanubeStoreId || !org?.tiendanubeAccessToken) return null
  return { storeId: org.tiendanubeStoreId, accessToken: org.tiendanubeAccessToken }
}

// ─── Tipos ───

export type TiendanubeStoreSummary = {
  ordersThisMonth: number
  revenueThisMonth: number
  averageTicket: number
  ordersLastMonth: number
  revenueLastMonth: number
  topProducts: Array<{ id: number; name: string; sales: number; revenue: number }>
  lowStockProducts: Array<{ id: number; name: string; stock: number; sku: string | null }>
  abandonedCarts7d: number
}

export async function getStoreSummary(organizationId: string): Promise<TiendanubeStoreSummary | null> {
  return unstable_cache(
    async () => fetchStoreSummary(organizationId),
    ['tiendanube-summary', organizationId],
    { revalidate: 1800, tags: [`tiendanube:${organizationId}`] },
  )()
}

async function fetchStoreSummary(organizationId: string): Promise<TiendanubeStoreSummary | null> {
  const auth = await getAuth(organizationId)
  if (!auth) return null

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  try {
    const ordersThisMonthRes = await fetch(
      `${API_BASE}/${auth.storeId}/orders?per_page=200&created_at_min=${monthStart.toISOString()}&status=open,paid,packed,fulfilled`,
      { headers: headers(auth.storeId, auth.accessToken) },
    )
    const ordersThisMonth: Array<{ total?: string | number; products?: Array<{ product_id: number; name?: string; quantity?: number; price?: string | number }> }> = ordersThisMonthRes.ok ? await ordersThisMonthRes.json() : []

    const ordersLastMonthRes = await fetch(
      `${API_BASE}/${auth.storeId}/orders?per_page=200&created_at_min=${lastMonthStart.toISOString()}&created_at_max=${lastMonthEnd.toISOString()}&status=open,paid,packed,fulfilled`,
      { headers: headers(auth.storeId, auth.accessToken) },
    )
    const ordersLastMonth: Array<{ total?: string | number }> = ordersLastMonthRes.ok ? await ordersLastMonthRes.json() : []

    const productsRes = await fetch(
      `${API_BASE}/${auth.storeId}/products?per_page=200`,
      { headers: headers(auth.storeId, auth.accessToken) },
    )
    const products: Array<{
      id: number
      name: string | Record<string, string>
      variants?: Array<{ stock: number | null; sku?: string | null }>
    }> = productsRes.ok ? await productsRes.json() : []

    const cartsRes = await fetch(
      `${API_BASE}/${auth.storeId}/carts?per_page=50&abandoned=true`,
      { headers: headers(auth.storeId, auth.accessToken) },
    )
    const carts: unknown[] = cartsRes.ok ? await cartsRes.json() : []

    const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + Number(o.total ?? 0), 0)
    const revenueLastMonth = ordersLastMonth.reduce((sum, o) => sum + Number(o.total ?? 0), 0)
    const averageTicket = ordersThisMonth.length > 0 ? revenueThisMonth / ordersThisMonth.length : 0

    const productSales = new Map<number, { name: string; sales: number; revenue: number }>()
    for (const order of ordersThisMonth) {
      for (const item of order.products ?? []) {
        const productId = item.product_id
        const productName = item.name ?? 'Sin nombre'
        const existing = productSales.get(productId) ?? { name: productName, sales: 0, revenue: 0 }
        existing.sales += item.quantity ?? 0
        existing.revenue += Number(item.price ?? 0) * (item.quantity ?? 0)
        productSales.set(productId, existing)
      }
    }
    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    const lowStockProducts = products
      .flatMap((p) => (p.variants ?? []).map((v) => ({
        id: p.id,
        name: typeof p.name === 'object' ? (Object.values(p.name)[0] ?? 'Sin nombre') : p.name,
        stock: v.stock ?? 0,
        sku: v.sku ?? null,
      })))
      .filter((p) => p.stock !== null && p.stock <= 3)
      .slice(0, 10)

    return {
      ordersThisMonth: ordersThisMonth.length,
      revenueThisMonth,
      averageTicket,
      ordersLastMonth: ordersLastMonth.length,
      revenueLastMonth,
      topProducts,
      lowStockProducts,
      abandonedCarts7d: carts.length,
    }
  } catch (err) {
    console.error('[Tiendanube] fetchSummary error:', err)
    return null
  }
}
