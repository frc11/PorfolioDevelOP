'use client'

import React, { useRef, useEffect } from 'react'
import { useReducedMotion } from 'motion/react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface BorderParticle {
  position: number // 0-1 Perimeter position
  speed: number
  size: number
  opacity: number
  color: string
  trail: number[] // Past positions
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function getPositionXY(
  t: number,
  W: number,
  H: number
): { x: number; y: number } {
  // Mapping 0-1 to clockwise perimeter:
  // 0.00 -> 0.25: Top
  // 0.25 -> 0.50: Right
  // 0.50 -> 0.75: Bottom
  // 0.75 -> 1.00: Left
  if (t < 0.25) {
    return { x: (t / 0.25) * W, y: 0 }
  } else if (t < 0.5) {
    return { x: W, y: ((t - 0.25) / 0.25) * H }
  } else if (t < 0.75) {
    return { x: W - ((t - 0.5) / 0.25) * W, y: H }
  } else {
    return { x: 0, y: H - ((t - 0.75) / 0.25) * H }
  }
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function DataPacketsCanvas() {
  const shouldReduceMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<BorderParticle[]>([])

  useEffect(() => {
    if (shouldReduceMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize 18 distributed particles
    particlesRef.current = Array.from({ length: 18 }, (_, i) => ({
      position: i / 18,
      speed: 0.0008 + Math.random() * 0.0006,
      size: 1.5 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
      color: Math.random() > 0.4 
        ? '245,158,11' // Amber
        : '249,115,22', // Orange
      trail: [],
    }))

    function draw() {
      if (!canvas || !ctx) return
      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      for (const p of particlesRef.current) {
        // Move Forward
        p.position = (p.position + p.speed) % 1

        // Maintain Trail (8 frames)
        p.trail.push(p.position)
        if (p.trail.length > 8) p.trail.shift()

        const { x, y } = getPositionXY(p.position, W, H)

        // Draw Trail (Fade out based on index)
        for (let i = 0; i < p.trail.length - 1; i++) {
          const tPos = getPositionXY(p.trail[i], W, H)
          const alpha = (i / p.trail.length) * p.opacity * 0.4
          
          ctx.beginPath()
          ctx.arc(tPos.x, tPos.y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`
          ctx.fill()
        }

        // Core Glow (Outer radial)
        const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 5)
        glow.addColorStop(0, `rgba(${p.color}, ${p.opacity * 0.6})`)
        glow.addColorStop(1, `rgba(${p.color}, 0)`)
        
        ctx.beginPath()
        ctx.arc(x, y, p.size * 5, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Core Nucleus (Inner bright spot)
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 220, 120, ${p.opacity})`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [shouldReduceMotion])

  if (shouldReduceMotion) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  )
}
