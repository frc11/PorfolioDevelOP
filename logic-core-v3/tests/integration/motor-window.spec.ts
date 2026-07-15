/**
 * B1-S2 — Test unitario de la ventana de servicio de 24h como dominio puro.
 *
 * Sin DB, sin efectos: `windowState(lastInboundAt, now)` se prueba en los
 * bordes exactos (justo antes de 24h, exactamente 24h, sin lastInboundAt).
 * Corre con el mismo runner que el resto (`npm run test:integration`).
 */
import { test, expect } from '@playwright/test'
import { SERVICE_WINDOW_MS, windowState } from '../../src/modules/motor/domain/window'

test.describe('B1-S2 — windowState (dominio puro de la ventana de 24h)', () => {
  const base = new Date('2026-07-09T12:00:00.000Z')

  test('sin lastInboundAt → CLOSED (conversación sin inbound, ej. iniciada por plantilla)', () => {
    expect(windowState(null, base)).toEqual({ state: 'CLOSED' })
  })

  test('justo dentro de la ventana (1 ms antes del borde) → OPEN con expiresAt correcto', () => {
    const now = new Date(base.getTime() + SERVICE_WINDOW_MS - 1)
    const result = windowState(base, now)
    expect(result.state).toBe('OPEN')
    if (result.state === 'OPEN') {
      expect(result.expiresAt.getTime()).toBe(base.getTime() + SERVICE_WINDOW_MS)
    }
  })

  test('exactamente 24h (now == expiresAt) → CLOSED (intervalo semiabierto)', () => {
    const now = new Date(base.getTime() + SERVICE_WINDOW_MS)
    expect(windowState(base, now)).toEqual({ state: 'CLOSED' })
  })

  test('1 ms después del borde → CLOSED', () => {
    const now = new Date(base.getTime() + SERVICE_WINDOW_MS + 1)
    expect(windowState(base, now)).toEqual({ state: 'CLOSED' })
  })

  test('mismo instante que el inbound → OPEN', () => {
    const result = windowState(base, base)
    expect(result.state).toBe('OPEN')
  })
})
