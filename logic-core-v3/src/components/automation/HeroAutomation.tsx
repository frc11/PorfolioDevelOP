'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'motion/react'

// â”€â”€â”€ DATA & TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AppNode {
  id: string
  label: string
  icon: 'message' | 'mail' | 'chart' | 'card' | 'megaphone' | 'workflow' | 'document' | 'receipt' | 'bolt'
  x: number // % of canvas
  y: number
  vx: number
  vy: number
  phase: number
  size: number
  color: string
  colorRgb: string
  glowIntensity: number
}

const APP_NODES_DATA: Omit<AppNode, 'vx' | 'vy' | 'glowIntensity'>[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'message', x: 0.15, y: 0.35, phase: 0, size: 36, color: '#25d366', colorRgb: '37,211,102' },
  { id: 'gmail', label: 'Gmail', icon: 'mail', x: 0.82, y: 0.28, phase: 1.2, size: 34, color: '#ea4335', colorRgb: '234,67,53' },
  { id: 'sheets', label: 'Sheets', icon: 'chart', x: 0.20, y: 0.72, phase: 2.4, size: 32, color: '#34a853', colorRgb: '52,168,83' },
  { id: 'mercadopago', label: 'MercadoPago', icon: 'card', x: 0.78, y: 0.70, phase: 3.6, size: 34, color: '#00b1ea', colorRgb: '0,177,234' },
  { id: 'meta', label: 'Meta Ads', icon: 'megaphone', x: 0.50, y: 0.18, phase: 0.8, size: 32, color: '#1877f2', colorRgb: '24,119,242' },
  { id: 'slack', label: 'Slack', icon: 'workflow', x: 0.88, y: 0.52, phase: 2.0, size: 30, color: '#e01e5a', colorRgb: '224,30,90' },
  { id: 'notion', label: 'Notion', icon: 'document', x: 0.12, y: 0.55, phase: 3.0, size: 30, color: '#ffffff', colorRgb: '255,255,255' },
  { id: 'afip', label: 'AFIP', icon: 'receipt', x: 0.50, y: 0.82, phase: 4.2, size: 32, color: '#f59e0b', colorRgb: '245,158,11' },
  { id: 'calendar', label: 'Calendar', icon: 'document', x: 0.32, y: 0.28, phase: 5.1, size: 29, color: '#4285f4', colorRgb: '66,133,244' },
  { id: 'tiendanube', label: 'TiendaNube', icon: 'card', x: 0.64, y: 0.76, phase: 5.8, size: 29, color: '#7b2fff', colorRgb: '123,47,255' },
  { id: 'hubspot', label: 'HubSpot', icon: 'workflow', x: 0.36, y: 0.64, phase: 6.5, size: 28, color: '#ff7a59', colorRgb: '255,122,89' },
  { id: 'salesforce', label: 'Salesforce', icon: 'chart', x: 0.82, y: 0.44, phase: 7.2, size: 28, color: '#1798c1', colorRgb: '23,152,193' },
  // CENTRAL ORCHESTRATOR
  {
    id: 'n8n',
    label: 'n8n · Automatización',
    icon: 'bolt',
    x: 0.50, y: 0.50,
    phase: 0,
    size: 52,
    color: '#f59e0b',
    colorRgb: '245,158,11'
  }
]

const NODE_PRESETS: Record<string, Record<string, { x: number; y: number; size?: number }>> = {
  compact: {
    whatsapp: { x: 0.09, y: 0.36, size: 22 },
    gmail: { x: 0.90, y: 0.25, size: 21 },
    sheets: { x: 0.17, y: 0.73, size: 21 },
    mercadopago: { x: 0.86, y: 0.67, size: 22 },
    meta: { x: 0.36, y: 0.20, size: 21 },
    slack: { x: 0.92, y: 0.48, size: 21 },
    notion: { x: 0.08, y: 0.55, size: 21 },
    afip: { x: 0.50, y: 0.84, size: 21 },
    calendar: { x: 0.22, y: 0.22, size: 20 },
    tiendanube: { x: 0.68, y: 0.79, size: 20 },
    hubspot: { x: 0.31, y: 0.63, size: 20 },
    salesforce: { x: 0.77, y: 0.38, size: 20 },
    n8n: { x: 0.50, y: 0.52, size: 38 },
  },
  mobile: {
    whatsapp: { x: 0.10, y: 0.37, size: 25 },
    gmail: { x: 0.88, y: 0.25, size: 24 },
    sheets: { x: 0.18, y: 0.74, size: 24 },
    mercadopago: { x: 0.84, y: 0.68, size: 24 },
    meta: { x: 0.35, y: 0.20, size: 24 },
    slack: { x: 0.90, y: 0.50, size: 23 },
    notion: { x: 0.09, y: 0.56, size: 23 },
    afip: { x: 0.50, y: 0.84, size: 24 },
    calendar: { x: 0.23, y: 0.23, size: 22 },
    tiendanube: { x: 0.68, y: 0.78, size: 22 },
    hubspot: { x: 0.32, y: 0.63, size: 22 },
    salesforce: { x: 0.76, y: 0.39, size: 22 },
    n8n: { x: 0.50, y: 0.52, size: 42 },
  },
  tablet: {
    whatsapp: { x: 0.12, y: 0.34, size: 29 },
    gmail: { x: 0.88, y: 0.29, size: 28 },
    sheets: { x: 0.20, y: 0.75, size: 28 },
    mercadopago: { x: 0.80, y: 0.72, size: 29 },
    meta: { x: 0.37, y: 0.22, size: 28 },
    slack: { x: 0.91, y: 0.51, size: 27 },
    notion: { x: 0.10, y: 0.57, size: 27 },
    afip: { x: 0.50, y: 0.84, size: 28 },
    calendar: { x: 0.22, y: 0.22, size: 27 },
    tiendanube: { x: 0.64, y: 0.77, size: 27 },
    hubspot: { x: 0.35, y: 0.65, size: 26 },
    salesforce: { x: 0.76, y: 0.41, size: 26 },
    n8n: { x: 0.50, y: 0.52, size: 48 },
  },
  laptop: {
    whatsapp: { x: 0.11, y: 0.39, size: 32 },
    gmail: { x: 0.88, y: 0.30, size: 31 },
    sheets: { x: 0.22, y: 0.76, size: 30 },
    mercadopago: { x: 0.83, y: 0.69, size: 31 },
    meta: { x: 0.38, y: 0.23, size: 30 },
    slack: { x: 0.91, y: 0.53, size: 29 },
    notion: { x: 0.10, y: 0.58, size: 29 },
    afip: { x: 0.50, y: 0.84, size: 30 },
    calendar: { x: 0.23, y: 0.25, size: 28 },
    tiendanube: { x: 0.66, y: 0.77, size: 28 },
    hubspot: { x: 0.35, y: 0.66, size: 28 },
    salesforce: { x: 0.74, y: 0.43, size: 28 },
    n8n: { x: 0.50, y: 0.53 },
  },
  desktop: {
    whatsapp: { x: 0.13, y: 0.42 },
    gmail: { x: 0.90, y: 0.32 },
    sheets: { x: 0.21, y: 0.76 },
    mercadopago: { x: 0.81, y: 0.68 },
    meta: { x: 0.32, y: 0.24 },
    slack: { x: 0.92, y: 0.54 },
    notion: { x: 0.10, y: 0.56 },
    afip: { x: 0.50, y: 0.84 },
    calendar: { x: 0.20, y: 0.25, size: 30 },
    tiendanube: { x: 0.66, y: 0.76, size: 30 },
    hubspot: { x: 0.35, y: 0.67, size: 29 },
    salesforce: { x: 0.72, y: 0.42, size: 29 },
    n8n: { x: 0.50, y: 0.52 },
  },
}

function getNodePreset(width: number) {
  if (width < 380) return NODE_PRESETS.compact
  if (width < 640) return NODE_PRESETS.mobile
  if (width < 960) return NODE_PRESETS.tablet
  if (width < 1280) return NODE_PRESETS.laptop
  return NODE_PRESETS.desktop
}

function createResponsiveNodes(width = 1440): AppNode[] {
  const preset = getNodePreset(width)

  return APP_NODES_DATA.map((node) => {
    const override = preset[node.id]

    return {
      ...node,
      x: override?.x ?? node.x,
      y: override?.y ?? node.y,
      size: override?.size ?? node.size,
      vx: 0,
      vy: 0,
      glowIntensity: node.id === 'n8n' ? 0.8 : 0,
    }
  })
}

function getHeroExclusionZones(width: number, height: number) {
  if (width < 640) {
    return [
      { left: width * 0.04, right: width * 0.96, top: height * 0.13, bottom: height * 0.34 },
      { left: width * 0.04, right: width * 0.96, top: height * 0.35, bottom: height * 0.57 },
    ]
  }

  if (width < 960) {
    return [
      { left: width * 0.08, right: width * 0.92, top: height * 0.12, bottom: height * 0.33 },
      { left: width * 0.10, right: width * 0.90, top: height * 0.35, bottom: height * 0.56 },
    ]
  }

  if (width < 1280) {
    return [
      { left: width * 0.17, right: width * 0.83, top: height * 0.12, bottom: height * 0.41 },
      { left: width * 0.22, right: width * 0.78, top: height * 0.43, bottom: height * 0.63 },
    ]
  }

  return [
    { left: width * 0.23, right: width * 0.77, top: height * 0.11, bottom: height * 0.43 },
    { left: width * 0.30, right: width * 0.70, top: height * 0.45, bottom: height * 0.64 },
  ]
}

function applyHeroExclusionFlow(node: AppNode, width: number, height: number, isMobileCanvas: boolean) {
  const radius = node.size + (isMobileCanvas ? 16 : 24)
  const influence = isMobileCanvas ? 74 : 112
  const zones = getHeroExclusionZones(width, height)
  const x = node.x * width
  const y = node.y * height
  let ax = 0
  let ay = 0

  for (const zone of zones) {
    const left = zone.left - radius
    const right = zone.right + radius
    const top = zone.top - radius
    const bottom = zone.bottom + radius
    const inside = x >= left && x <= right && y >= top && y <= bottom
    const closestX = Math.max(left, Math.min(x, right))
    const closestY = Math.max(top, Math.min(y, bottom))
    let dx = x - closestX
    let dy = y - closestY

    if (inside) {
      dx = x - (left + right) / 2
      dy = y - (top + bottom) / 2
    }

    let dist = Math.hypot(dx, dy)
    if (dist < 0.001) {
      dx = (node.vx || Math.sin(node.phase || 0.7)) * width
      dy = (node.vy || Math.cos(node.phase || 1.1)) * height
      dist = Math.hypot(dx, dy) || 1
    }

    if (!inside && dist > influence) continue

    const normalX = dx / dist
    const normalY = dy / dist
    const pressure = inside
      ? 1
      : Math.max(0, (influence - dist) / influence)
    const strength = (isMobileCanvas ? 0.0003 : 0.00024) * pressure
    const cross = node.vx * -normalY + node.vy * normalX
    const tangentSign = cross >= 0 ? 1 : -1
    const tangentX = -normalY * tangentSign
    const tangentY = normalX * tangentSign

    ax += normalX * strength + tangentX * strength * 0.35
    ay += normalY * strength + tangentY * strength * 0.35
  }

  node.vx += ax
  node.vy += ay
}

function keepNodeInCanvas(
  node: AppNode,
  marginX: number,
  marginY: number,
  maxY: number
) {
  if (node.x < marginX) {
    node.x = marginX
    node.vx = Math.abs(node.vx) * 0.55
  }
  if (node.x > 1 - marginX) {
    node.x = 1 - marginX
    node.vx = -Math.abs(node.vx) * 0.55
  }
  if (node.y < marginY) {
    node.y = marginY
    node.vy = Math.abs(node.vy) * 0.55
  }
  if (node.y > maxY) {
    node.y = maxY
    node.vy = -Math.abs(node.vy) * 0.55
  }
}

function applyNodeSeparation(nodes: AppNode[], width: number, height: number, isMobileCanvas: boolean) {
  const minDistance = isMobileCanvas ? 58 : 82
  const strength = isMobileCanvas ? 0.00006 : 0.000045

  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]
    if (a.id === 'n8n') continue

    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]
      if (b.id === 'n8n') continue

      const dx = (a.x - b.x) * width
      const dy = (a.y - b.y) * height
      const distance = Math.hypot(dx, dy) || 1
      if (distance >= minDistance) continue

      const pressure = (minDistance - distance) / minDistance
      const ax = (dx / distance) * pressure * strength
      const ay = (dy / distance) * pressure * strength

      a.vx += ax
      a.vy += ay
      b.vx -= ax
      b.vy -= ay
    }
  }
}

function getN8nOrbitPosition(frame: number, width: number, isMobileCanvas: boolean) {
  const t = frame * 0.0042
  const centerY = isMobileCanvas ? 0.315 : width < 960 ? 0.335 : 0.36
  const orbitX = isMobileCanvas ? 0.18 : width < 960 ? 0.16 : 0.22
  const orbitY = isMobileCanvas ? 0.045 : width < 960 ? 0.052 : 0.06

  return {
    x: 0.5 + Math.cos(t) * orbitX,
    y: centerY + Math.sin(t * 0.82) * orbitY,
  }
}

function isPointInHeroExclusionZone(x: number, y: number, width: number, height: number, padding = 0) {
  return getHeroExclusionZones(width, height).some(
    (zone) =>
      x >= zone.left - padding &&
      x <= zone.right + padding &&
      y >= zone.top - padding &&
      y <= zone.bottom + padding
  )
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
}

function drawNodeIcon(
  ctx: CanvasRenderingContext2D,
  icon: AppNode['icon'],
  cx: number,
  cy: number,
  size: number,
  color: string,
  alpha = 1
) {
  const s = size
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = Math.max(1.35, s * 0.075)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (icon) {
    case 'message': {
      ctx.beginPath()
      roundedRectPath(ctx, -s * 0.36, -s * 0.26, s * 0.72, s * 0.48, s * 0.16)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-s * 0.08, s * 0.22)
      ctx.lineTo(-s * 0.2, s * 0.36)
      ctx.lineTo(s * 0.06, s * 0.23)
      ctx.stroke()
      break
    }
    case 'mail': {
      ctx.beginPath()
      roundedRectPath(ctx, -s * 0.36, -s * 0.25, s * 0.72, s * 0.5, s * 0.07)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-s * 0.32, -s * 0.18)
      ctx.lineTo(0, s * 0.04)
      ctx.lineTo(s * 0.32, -s * 0.18)
      ctx.stroke()
      break
    }
    case 'chart': {
      for (const [x, h] of [[-0.22, 0.32], [0, 0.52], [0.22, 0.72]] as const) {
        ctx.beginPath()
        ctx.moveTo(s * x, s * 0.28)
        ctx.lineTo(s * x, s * (0.28 - h))
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(-s * 0.34, s * 0.28)
      ctx.lineTo(s * 0.34, s * 0.28)
      ctx.stroke()
      break
    }
    case 'card': {
      ctx.beginPath()
      roundedRectPath(ctx, -s * 0.4, -s * 0.24, s * 0.8, s * 0.48, s * 0.08)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-s * 0.34, -s * 0.06)
      ctx.lineTo(s * 0.34, -s * 0.06)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-s * 0.3, s * 0.11)
      ctx.lineTo(-s * 0.08, s * 0.11)
      ctx.stroke()
      break
    }
    case 'megaphone': {
      ctx.beginPath()
      ctx.moveTo(-s * 0.34, -s * 0.06)
      ctx.lineTo(s * 0.22, -s * 0.25)
      ctx.lineTo(s * 0.22, s * 0.25)
      ctx.lineTo(-s * 0.34, s * 0.06)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-s * 0.18, s * 0.09)
      ctx.lineTo(-s * 0.07, s * 0.34)
      ctx.stroke()
      break
    }
    case 'workflow': {
      ctx.beginPath()
      ctx.moveTo(-s * 0.28, -s * 0.14)
      ctx.lineTo(s * 0.28, -s * 0.14)
      ctx.moveTo(-s * 0.28, s * 0.14)
      ctx.lineTo(s * 0.28, s * 0.14)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(-s * 0.38, -s * 0.14, s * 0.07, 0, Math.PI * 2)
      ctx.arc(s * 0.38, s * 0.14, s * 0.07, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'document': {
      ctx.beginPath()
      roundedRectPath(ctx, -s * 0.3, -s * 0.38, s * 0.6, s * 0.76, s * 0.06)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-s * 0.14, -s * 0.12)
      ctx.lineTo(s * 0.16, -s * 0.12)
      ctx.moveTo(-s * 0.14, s * 0.04)
      ctx.lineTo(s * 0.16, s * 0.04)
      ctx.moveTo(-s * 0.14, s * 0.2)
      ctx.lineTo(s * 0.06, s * 0.2)
      ctx.stroke()
      break
    }
    case 'receipt': {
      ctx.beginPath()
      ctx.moveTo(-s * 0.28, -s * 0.36)
      ctx.lineTo(s * 0.28, -s * 0.36)
      ctx.lineTo(s * 0.28, s * 0.36)
      ctx.lineTo(s * 0.14, s * 0.28)
      ctx.lineTo(0, s * 0.36)
      ctx.lineTo(-s * 0.14, s * 0.28)
      ctx.lineTo(-s * 0.28, s * 0.36)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-s * 0.12, -s * 0.12)
      ctx.lineTo(s * 0.14, -s * 0.12)
      ctx.moveTo(-s * 0.12, s * 0.05)
      ctx.lineTo(s * 0.14, s * 0.05)
      ctx.stroke()
      break
    }
    case 'bolt': {
      ctx.beginPath()
      ctx.moveTo(s * 0.08, -s * 0.42)
      ctx.lineTo(-s * 0.18, s * 0.05)
      ctx.lineTo(s * 0.06, s * 0.05)
      ctx.lineTo(-s * 0.06, s * 0.42)
      ctx.lineTo(s * 0.26, -s * 0.1)
      ctx.lineTo(s * 0.02, -s * 0.1)
      ctx.closePath()
      ctx.fill()
      break
    }
  }

  ctx.restore()
}

// â”€â”€â”€ CANVAS SUB-COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function NodeCanvas({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const nodesRef = useRef<AppNode[]>(createResponsiveNodes())
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })
  const frameRef = useRef(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      const rect = canvas.parentElement?.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect?.width ?? window.innerWidth))
      const height = Math.max(1, Math.round(rect?.height ?? window.innerHeight))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      sizeRef.current = { width, height, dpr }
      nodesRef.current = createResponsiveNodes(width)
    }
    resize()
    window.addEventListener('resize', resize)
    const canvasParent = canvas.parentElement
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && canvasParent
        ? new ResizeObserver(resize)
        : null
    if (canvasParent) resizeObserver?.observe(canvasParent)

    const CONNECTION_DIST = 0.38
    const MOUSE_ATTRACT_DIST = 0.25

    function draw() {
      if (!canvas || !ctx) return
      frameRef.current++
      const f = frameRef.current
      const { width: W, height: H, dpr } = sizeRef.current
      const mouse = mouseRef.current

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const nodes = nodesRef.current
      const isCompactCanvas = W < 420
      const isMobileCanvas = W < 640
      const isTabletOrLess = W < 1024
      const hasMouseFocus = mouse.x > 0 || mouse.y > 0
      const appNodes = nodes.filter((n) => n.id !== 'n8n')

      let focusX = mouse.x / W
      let focusY = mouse.y / (H || 1)
      if (isTabletOrLess && !hasMouseFocus && appNodes.length > 0) {
        const phaseLen = 220
        const phase = f % phaseLen
        const baseIdx = Math.floor(f / phaseLen) % appNodes.length
        const nextIdx = (baseIdx + 1) % appNodes.length
        const blend = phase / phaseLen
        const from = appNodes[baseIdx]
        const to = appNodes[nextIdx]
        const orbitX = Math.cos(f * 0.03 + from.phase) * 0.045
        const orbitY = Math.sin(f * 0.024 + to.phase) * 0.03

        focusX = from.x + (to.x - from.x) * blend + orbitX
        focusY = from.y + (to.y - from.y) * blend + orbitY
      }
      focusX = Math.min(0.95, Math.max(0.05, focusX || 0.5))
      focusY = Math.min(0.92, Math.max(0.08, focusY || 0.5))

      // â”€â”€ MOVER NODOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      for (const n of nodes) {
        if (n.id === 'n8n') {
          const n8nOrbit = getN8nOrbitPosition(f, W, isMobileCanvas)
          const blend = shouldReduceMotion ? 1 : 0.08
          n.x += (n8nOrbit.x - n.x) * blend
          n.y += (n8nOrbit.y - n.y) * blend
          n.vx = 0
          n.vy = 0
          n.glowIntensity = 0.72
          continue
        }

        const t = f * 0.018 + n.phase
        const marginX = isMobileCanvas ? 0.055 : 0.08
        const marginY = isMobileCanvas ? 0.09 : 0.12
        const maxY = 0.9

        n.vx += Math.sin(t) * 0.000012
        n.vy += Math.cos(t * 0.72) * 0.000009

        // AtracciÃ³n sutil hacia el mouse
        if (hasMouseFocus || isTabletOrLess) {
          const dx = focusX - n.x
          const dy = focusY - n.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < MOUSE_ATTRACT_DIST) {
            const force = ((MOUSE_ATTRACT_DIST - dist) / MOUSE_ATTRACT_DIST) * 0.000025
            n.vx += dx * force
            n.vy += dy * force
            n.glowIntensity = Math.min(n.glowIntensity + 0.05, 1)
          } else {
            n.glowIntensity = Math.max(n.glowIntensity - 0.02, 0)
          }
        } else {
          n.glowIntensity = Math.max(n.glowIntensity - 0.02, 0)
        }

        applyHeroExclusionFlow(n, W, H, isMobileCanvas)

        const maxSpeed = isMobileCanvas ? 0.00125 : 0.00105
        const speed = Math.hypot(n.vx, n.vy)
        if (speed > maxSpeed) {
          n.vx = (n.vx / speed) * maxSpeed
          n.vy = (n.vy / speed) * maxSpeed
        }

        n.x += n.vx
        n.y += n.vy
        n.vx *= 0.94
        n.vy *= 0.94
        keepNodeInCanvas(n, marginX, marginY, maxY)
      }
      applyNodeSeparation(nodes, W, H, isMobileCanvas)

      // â”€â”€ CONEXIONES FORZADAS A n8n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const n8nNode = nodes.find(n => n.id === 'n8n')!
      const cx1 = n8nNode.x * W
      const cy1 = n8nNode.y * H

      for (const app of nodes) {
        if (app.id === 'n8n') continue
        const cx2 = app.x * W
        const cy2 = app.y * H

        // LÃ­nea base tenue punteada
        ctx.beginPath()
        ctx.moveTo(cx1, cy1)
        ctx.lineTo(cx2, cy2)
        ctx.strokeStyle = 'rgba(245,158,11,0.06)'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 8])
        ctx.stroke()
        ctx.setLineDash([])

        // PartÃ­cula viajando desde app -> n8n
        const particleSpeed = shouldReduceMotion ? 0.004 : 0.008
        const tP = ((f * particleSpeed + app.phase * 0.2) % 1)
        const px = cx2 + (cx1 - cx2) * tP
        const py = cy2 + (cy1 - cy2) * tP
        const pAlpha = Math.sin(tP * Math.PI) * 0.5

        if (!isPointInHeroExclusionZone(px, py, W, H, 10)) {
          const pg = ctx.createRadialGradient(px, py, 0, px, py, 4)
          pg.addColorStop(0, `rgba(245,158,11,${pAlpha})`)
          pg.addColorStop(1, 'rgba(245,158,11,0)')

          ctx.beginPath()
          ctx.arc(px, py, 4, 0, Math.PI * 2)
          ctx.fillStyle = pg
          ctx.fill()
        }
      }

      // â”€â”€ CONEXIONES DINÃMICAS (MOUSE) â”€â”€â”€â”€â”€â”€â”€â”€
      const mx = focusX
      const my = focusY

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          
          // Skip if both are not central and far from mouse? No, logic as prompt:
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          const midX = (a.x + b.x) / 2
          const midY = (a.y + b.y) / 2
          const mdx = mx - midX
          const mdy = my - midY
          const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy)

          const shouldConnect = dist < CONNECTION_DIST && mouseDist < 0.3

          if (!shouldConnect) continue

          const proximity = 1 - mouseDist / 0.3
          const alpha = proximity * 0.7

          // Base line
          ctx.beginPath()
          ctx.moveTo(a.x * W, a.y * H)
          ctx.lineTo(b.x * W, b.y * H)
          ctx.strokeStyle = `rgba(245,158,11,${alpha * 0.3})`
          ctx.lineWidth = 1
          ctx.stroke()

          // Glow line
          const grad = ctx.createLinearGradient(a.x * W, a.y * H, b.x * W, b.y * H)
          grad.addColorStop(0, `rgba(245,158,11,${alpha})`)
          grad.addColorStop(0.5, `rgba(255,200,50,${alpha * 1.2})`)
          grad.addColorStop(1, `rgba(249,115,22,${alpha})`)

          ctx.beginPath()
          ctx.moveTo(a.x * W, a.y * H)
          ctx.lineTo(b.x * W, b.y * H)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Particles along dynamic line
          if (!shouldReduceMotion && f % 4 === 0) {
            const tProgress = (f * 0.02) % 1
            const px = a.x * W + (b.x * W - a.x * W) * tProgress
            const py = a.y * H + (b.y * H - a.y * H) * tProgress
            if (isPointInHeroExclusionZone(px, py, W, H, 10)) continue
            const pg = ctx.createRadialGradient(px, py, 0, px, py, 6)
            pg.addColorStop(0, `rgba(255,220,100,${alpha})`)
            pg.addColorStop(1, 'rgba(245,158,11,0)')
            ctx.beginPath()
            ctx.arc(px, py, 6, 0, Math.PI * 2)
            ctx.fillStyle = pg
            ctx.fill()
          }
        }
      }

      // â”€â”€ DIBUJAR NODOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // Sort to draw n8n last (on top)
      const sortedNodes = [...nodes].sort((a,b) => a.id === 'n8n' ? 1 : b.id === 'n8n' ? -1 : 0)

      for (const n of sortedNodes) {
        const cx = n.x * W
        const cy = n.y * H
        const R = n.size
        const glow = n.glowIntensity

        if (n.id === 'n8n') {
            const behindHeroText = isPointInHeroExclusionZone(cx, cy, W, H, R * 0.2)
            const visibility = behindHeroText ? 0.16 : 0.78

            // Anillos pulsantes (3 anillos)
            for (let ring = 0; ring < 3; ring++) {
              const ringPhase = (f * 0.015 + ring * 0.33) % 1
              const ringR = R * (1 + ringPhase * 2.5)
              const ringAlpha = (1 - ringPhase) * 0.25 * visibility

              ctx.beginPath()
              ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
              ctx.strokeStyle = `rgba(245,158,11,${ringAlpha})`
              ctx.lineWidth = 1.5
              ctx.stroke()
            }

            // Glow grande permanente
            const bigGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 5)
            bigGlow.addColorStop(0, `rgba(245,158,11,${0.25 * visibility})`)
            bigGlow.addColorStop(0.4, `rgba(249,115,22,${0.08 * visibility})`)
            bigGlow.addColorStop(1, 'rgba(245,158,11,0)')
            ctx.beginPath()
            ctx.arc(cx, cy, R * 5, 0, Math.PI * 2)
            ctx.fillStyle = bigGlow
            ctx.fill()

            // Borde doble y nucleo
            ctx.beginPath()
            ctx.arc(cx, cy, R, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(245,158,11,${0.12 * visibility})`
            ctx.fill()
            ctx.strokeStyle = `rgba(245,158,11,${0.8 * visibility})`
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(cx, cy, R + 6, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(245,158,11,${0.25 * visibility})`
            ctx.lineWidth = 1
            ctx.stroke()

            drawNodeIcon(ctx, n.icon, cx, cy, R * 0.82, '#fbbf24', 0.95 * visibility)

            // Label n8n
            if (!isMobileCanvas && !behindHeroText) {
              ctx.font = '700 11px ui-monospace, monospace'
              ctx.textAlign = 'center'
              ctx.fillStyle = 'rgba(245,158,11,0.8)'
              ctx.fillText(n.label, cx, cy + R + 18)
            }
            
            continue
        }

        // --- NODO NORMAL ---
        // Outer Glow
        const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 3.5)
        outerGlow.addColorStop(0, `rgba(245,158,11,${0.15 * glow})`)
        outerGlow.addColorStop(1, 'rgba(245,158,11,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, R * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = outerGlow
        ctx.fill()

        // Plate
        ctx.beginPath()
        ctx.arc(cx, cy, R, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.06 + glow * 0.06})`
        ctx.fill()

        // Border
        ctx.beginPath()
        ctx.arc(cx, cy, R, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(245,158,11,${0.3 + glow * 0.5})`
        ctx.lineWidth = glow > 0.3 ? 2 : 1
        ctx.stroke()

        drawNodeIcon(ctx, n.icon, cx, cy, R * 0.92, n.color, 0.72 + glow * 0.28)

        // Label
        if (!isCompactCanvas) {
          ctx.font = `${isMobileCanvas ? 500 : 600} ${isMobileCanvas ? 9 : 11}px ui-monospace, monospace`
          ctx.textAlign = 'center'
          ctx.fillStyle = `rgba(245,158,11,${0.36 + glow * 0.46})`
          ctx.fillText(n.label, cx, cy + R + (isMobileCanvas ? 11 : 14))
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      resizeObserver?.disconnect()
    }
  }, [shouldReduceMotion, mouseRef])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}

function FloatingStat({ 
  label, 
  value, 
  pos, 
  delay 
}: { 
  label: string; 
  value: string; 
  pos: React.CSSProperties; 
  delay: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute',
        ...pos,
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
        style={{
          background: 'rgba(7, 7, 9, 0.55)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '16px',
          padding: '14px 22px',
          boxShadow: '0 0 0 1px rgba(245,158,11,0.08), 0 16px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(245,158,11,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6) 50%, transparent)',
        }}/>
        <p style={{ fontSize: '9px', color: 'rgba(245, 158, 11, 0.65)', fontWeight: 700, letterSpacing: '0.18em', margin: '0 0 5px', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>
          {label}
        </p>
        <p style={{ fontSize: '18px', color: 'white', fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>
          {value}
        </p>
        <svg
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: pos.right !== undefined ? 'auto' : '100%',
            right: pos.right !== undefined ? '100%' : 'auto',
            transform: 'translateY(-50%)',
            width: '80px',
            height: '2px',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <line
            x1="0" y1="1" x2="80" y2="1"
            stroke="rgba(245,158,11,0.18)"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

// â”€â”€â”€ MAIN HERO COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function HeroAutomation() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const [showHint, setShowHint] = useState(false)
  const [mouseMoved, setMouseMoved] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return
    const t = setTimeout(() => setShowHint(true), 2000)
    return () => clearTimeout(t)
  }, [shouldReduceMotion])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      if (!mouseMoved) {
        setMouseMoved(true)
        setShowHint(false)
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [mouseMoved])

  return (
    <section
      className="automation-hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#070709',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.12) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 75%)',
          opacity: 0.35,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <style>{`
        @keyframes moveHand {
          0%, 100% { transform: translateX(0) }
          50% { transform: translateX(6px) }
        }
        @keyframes amberShift {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        @keyframes automationTitleGlow {
          0%, 100% {
            filter: brightness(1) saturate(1.05);
          }
          50% {
            filter: brightness(1.14) saturate(1.24);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(245,158,11,0.9), 0 0 16px rgba(245,158,11,0.4) }
          50% { opacity: 0.75; box-shadow: 0 0 16px rgba(245,158,11,1), 0 0 32px rgba(245,158,11,0.6) }
        }
        @keyframes chevronAmber {
          0%, 100% { opacity: 0.25; transform: rotate(45deg) }
          50% { opacity: 0.7; transform: rotate(45deg) translateY(2px) }
        }
        @keyframes ringPulseAmber {
          0%, 100% { transform: scale(1); opacity: 0.15 }
          50% { transform: scale(1.08); opacity: 0.05 }
        }
        .automation-hero {
          min-height: 100svh !important;
          box-sizing: border-box;
          padding: 72px 0 96px;
          isolation: isolate;
        }
        .automation-hero__content {
          width: min(100%, 1060px) !important;
          max-width: 1060px !important;
          padding: 0 64px !important;
          transform: translateY(-8px);
        }
        .automation-hero__badge {
          gap: 10px !important;
          margin-bottom: 30px !important;
          padding: 11px 28px !important;
          box-shadow: 0 0 28px rgba(245,158,11,0.12), inset 0 1px 0 rgba(255,255,255,0.06) !important;
        }
        .automation-hero__badge-label,
        .automation-hero__button,
        .automation-hero__hint span {
          letter-spacing: 0 !important;
        }
        .automation-hero__badge-label {
          white-space: nowrap;
          font-size: 12px !important;
          font-weight: 800 !important;
        }
        .automation-hero__title {
          font-size: 92px !important;
          line-height: 0.96 !important;
          letter-spacing: 0 !important;
          margin-bottom: 26px !important;
          text-wrap: balance;
        }
        .automation-hero__copy {
          max-width: 640px !important;
          margin-bottom: 32px !important;
          padding: 22px 28px !important;
          font-size: 18px !important;
          line-height: 1.62 !important;
          border-radius: 14px !important;
        }
        .automation-hero__actions {
          gap: 14px !important;
        }
        .automation-hero__button {
          min-height: 48px;
          justify-content: center;
          white-space: nowrap;
        }
        @media (max-height: 780px) and (min-width: 960px) {
          .automation-hero {
            padding-top: 58px;
            padding-bottom: 70px;
          }
          .automation-hero__content {
            transform: translateY(-4px);
          }
          .automation-hero__badge {
            margin-bottom: 22px !important;
            padding: 10px 24px !important;
          }
          .automation-hero__title {
            font-size: 82px !important;
            margin-bottom: 22px !important;
          }
          .automation-hero__copy {
            max-width: 610px !important;
            margin-bottom: 26px !important;
            padding: 18px 24px !important;
            font-size: 16px !important;
            line-height: 1.58 !important;
          }
        }
        @media (max-width: 1280px) {
          .automation-hero__content {
            max-width: 920px !important;
          }
          .automation-hero__title {
            font-size: 76px !important;
          }
        }
        @media (max-width: 1120px) {
          .automation-hero__floating-stats {
            display: none !important;
          }
        }
        @media (max-width: 960px) {
          .automation-hero {
            align-items: flex-start !important;
            min-height: 900px !important;
            padding-top: 74px;
            padding-bottom: 112px;
          }
          .automation-hero__content {
            max-width: 760px !important;
            padding: 0 42px !important;
            transform: none;
          }
          .automation-hero__title {
            font-size: 64px !important;
          }
          .automation-hero__copy {
            max-width: 620px !important;
          }
        }
        @media (max-width: 640px) {
          .automation-hero {
            min-height: 870px !important;
            padding-top: 50px;
            padding-bottom: 100px;
          }
          .automation-hero__content {
            padding: 0 20px !important;
          }
          .automation-hero__badge {
            margin-bottom: 30px !important;
            padding: 9px 18px !important;
          }
          .automation-hero__badge-label {
            font-size: 10px !important;
          }
          .automation-hero__title {
            font-size: 42px !important;
            line-height: 0.98 !important;
            margin-bottom: 20px !important;
          }
          .automation-hero__copy {
            width: 100% !important;
            max-width: 100% !important;
            margin-bottom: 28px !important;
            padding: 18px 18px !important;
            font-size: 15px !important;
            line-height: 1.6 !important;
          }
          .automation-hero__actions {
            flex-direction: column;
            align-items: center;
            gap: 12px !important;
          }
          .automation-hero__button {
            width: min(100%, 296px);
          }
          .automation-hero__hint {
            display: none !important;
          }
        }
        @media (max-width: 380px) {
          .automation-hero {
            min-height: 900px !important;
            padding-top: 48px;
          }
          .automation-hero__content {
            padding: 0 18px !important;
          }
          .automation-hero__badge {
            padding: 8px 14px !important;
          }
          .automation-hero__badge-label {
            font-size: 9px !important;
          }
          .automation-hero__title {
            font-size: 39px !important;
            margin-bottom: 18px !important;
          }
          .automation-hero__copy {
            padding: 16px 14px !important;
            font-size: 14px !important;
            line-height: 1.56 !important;
          }
          .automation-hero__button {
            width: min(100%, 280px);
          }
        }
      `}</style>

      {/* Background Auroras */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Aurora Ã¡mbar central */}
        <div style={{
          position: 'absolute',
          top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, rgba(249,115,22,0.04) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }} />

        {/* Aurora naranja izquierda */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '-10%',
          width: '500px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }} />

        {/* Aurora Ã¡mbar derecha */}
        <div style={{
          position: 'absolute',
          top: '40%', right: '-10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 60%)',
          filter: 'blur(90px)',
        }} />
      </div>

      <NodeCanvas mouseRef={mouseRef} />

      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 20%, rgba(7,7,9,0.5) 60%, rgba(7,7,9,0.92) 100%)`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Content Slot */}
      <div
        className="automation-hero__content"
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '860px',
          padding: '0 clamp(20px, 5vw, 60px)',
          pointerEvents: 'none',
        }}
      >
        {/* BadgeAuto */}
        <motion.div
           className="automation-hero__badge"
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           style={{
             position: 'relative',
             overflow: 'hidden',
             display: 'inline-flex',
             alignItems: 'center',
             gap: '8px',
             border: '1px solid rgba(245,158,11,0.3)',
             borderRadius: '100px',
             padding: '11px 28px',
             marginBottom: '32px',
             background: 'rgba(245,158,11,0.07)',
             boxShadow: '0 0 20px rgba(245,158,11,0.08)',
             pointerEvents: 'none',
           }}
        >
          <motion.span
            aria-hidden="true"
            animate={shouldReduceMotion ? {} : { x: ['-150%', '250%'] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4.2, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)',
              borderRadius: '100px',
              pointerEvents: 'none',
              display: shouldReduceMotion ? 'none' : 'block',
            }}
          />
          <div style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: '#f59e0b',
            boxShadow: '0 0 8px rgba(245,158,11,0.9)',
            animation: 'pulse 1.8s ease-in-out infinite',
            flexShrink: 0,
          }}/>
          <span className="automation-hero__badge-label" style={{
            fontSize: '10px',
            letterSpacing: '0.22em',
            color: '#f59e0b',
            fontWeight: 700,
            fontFamily: 'ui-monospace, monospace',
          }}>
            PROCESOS QUE CORREN SOLOS 24/7
          </span>
        </motion.div>

        {/* TitleAuto */}
        <motion.h1
          className="automation-hero__title"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(42px, 7.5vw, 104px)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-0.05em',
            margin: '0 0 clamp(18px, 2.5vh, 28px)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ color: 'white' }}>
            Eliminá el trabajo
          </span>
          <br/>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{
              background: shouldReduceMotion
                  ? 'none'
                  : 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 35%, #f97316 65%, #f59e0b 100%)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: shouldReduceMotion ? '#f59e0b' : 'transparent',
              backgroundClip: 'text',
              filter: 'brightness(1.04) saturate(1.08)',
              animation: shouldReduceMotion ? 'none' : 'amberShift 5s ease-in-out infinite, automationTitleGlow 3.4s ease-in-out infinite',
              display: 'block',
              color: shouldReduceMotion ? '#f59e0b' : 'inherit',
            }}>
              robótico para siempre.
            </span>
            {!shouldReduceMotion && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '8%',
                  right: '8%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #f59e0b 40%, #f97316 60%, transparent)',
                  transformOrigin: 'center',
                  filter: 'blur(0.5px)',
                }}
              />
            )}
          </div>
        </motion.h1>

        {/* SubtitleAuto */}
        <motion.p
          className="automation-hero__copy"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(15px, 1.8vw, 19px)',
            color: 'rgba(255,255,255,0.74)',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto clamp(28px, 4vh, 44px)',
            background: 'linear-gradient(180deg, rgba(7,7,9,0.74) 0%, rgba(7,7,9,0.58) 100%)',
            border: '1px solid rgba(245,158,11,0.12)',
            borderRadius: 0,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 18px 48px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04)',
            padding: 'clamp(14px, 1.8vw, 20px) clamp(16px, 2.2vw, 24px)',
            textShadow: '0 1px 10px rgba(0,0,0,0.45)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '18px', background: 'rgba(245,158,11,0.3)' }} />
          <span style={{ position: 'absolute', top: 0, left: 0, height: '1px', width: '18px', background: 'rgba(245,158,11,0.3)' }} />
          
          <span style={{ position: 'absolute', top: 0, right: 0, width: '1px', height: '18px', background: 'rgba(245,158,11,0.3)' }} />
          <span style={{ position: 'absolute', top: 0, right: 0, height: '1px', width: '18px', background: 'rgba(245,158,11,0.3)' }} />
          
          <span style={{ position: 'absolute', bottom: 0, left: 0, width: '1px', height: '18px', background: 'rgba(245,158,11,0.3)' }} />
          <span style={{ position: 'absolute', bottom: 0, left: 0, height: '1px', width: '18px', background: 'rgba(245,158,11,0.3)' }} />
          
          <span style={{ position: 'absolute', bottom: 0, right: 0, width: '1px', height: '18px', background: 'rgba(245,158,11,0.3)' }} />
          <span style={{ position: 'absolute', bottom: 0, right: 0, height: '1px', width: '18px', background: 'rgba(245,158,11,0.3)' }} />

          Cada semana sin automatizar le cuesta a tu empresa{' '}
          <span style={{ color: 'rgba(245,158,11,0.98)', fontWeight: 700 }}>
            +12 horas de trabajo manual
          </span>
          {' '}en tareas repetitivas que no facturan.
          <br/>
          Conectamos WhatsApp, MercadoPago, AFIP y Excel para que tu equipo deje de copiar y pegar datos y enfoque su tiempo en vender y operar mejor.
        </motion.p>

        {/* CTAAuto */}
        <motion.div
          className="automation-hero__actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            pointerEvents: 'auto',
          }}
        >
          <motion.a
            className="automation-hero__button"
            href="#calculadora"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: '#070709',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.06em',
              padding: '13px 28px',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 0 32px rgba(245,158,11,0.35), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              overflow: 'hidden',
              isolation: 'isolate',
              textTransform: 'uppercase',
            }}
          >
            <motion.span
              aria-hidden="true"
              animate={{ x: ['-140%', '260%'] }}
              transition={{
                duration: 1.05,
                repeat: Infinity,
                repeatDelay: 3.95,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                inset: '-30% 0',
                left: '-45%',
                width: '42%',
                rotate: '18deg',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            <span style={{ position: 'relative', zIndex: 1 }}>
              Encender mi empresa →
            </span>
          </motion.a>

          <motion.a
            className="automation-hero__button"
            href="#flujo"
            whileHover={{
              scale: 1.02,
              borderColor: 'rgba(245,158,11,0.45)',
              color: '#f59e0b',
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
              fontSize: '13px',
              padding: '13px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              letterSpacing: '0.02em',
            }}
          >
            Ver cómo funciona
          </motion.a>
        </motion.div>

      </div>

      {/* Floating Stats */}
      {!shouldReduceMotion && (
        <div className="automation-hero__floating-stats" aria-hidden="true">
          <FloatingStat 
            label="0% trabajo manual" 
            value="Garantizado" 
            pos={{ top: '28%', left: '11%' }}
            delay={1.4}
          />
          <FloatingStat 
            label="24/7" 
            value="Operando solo" 
            pos={{ top: '64%', right: '11%' }}
            delay={1.6}
          />
          <FloatingStat 
            label="<10%" 
            value="del costo de un sueldo" 
            pos={{ bottom: '22%', left: '15%' }}
            delay={1.8}
          />
        </div>
      )}

      {/* Mouse Interaction Hint */}
      <AnimatePresence>
        {showHint && !mouseMoved && !shouldReduceMotion && (
          <motion.div
            className="automation-hero__hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              bottom: 'clamp(60px, 10vh, 90px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '100px',
              padding: '8px 18px',
              pointerEvents: 'none',
            }}
          >
            <svg
              width="12" height="18" viewBox="0 0 12 18" fill="none"
              style={{ animation: 'moveHand 1.2s ease-in-out infinite', flexShrink: 0 }}
            >
              <rect x="1" y="1" width="10" height="16" rx="5" stroke="rgba(245,158,11,0.7)" strokeWidth="1.4"/>
              <line x1="6" y1="4" x2="6" y2="7" stroke="rgba(245,158,11,0.7)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '12px', color: 'rgba(245,158,11,0.7)', letterSpacing: '0.1em' }}>
              Mové el mouse para ver la magia
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
