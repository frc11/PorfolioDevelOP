'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const DotMatrix = dynamic(() => import('@/components/canvas/DotMatrix'), { ssr: false })

export function InviteBackground() {
  return (
    <>
      {/* DotMatrix background */}
      <div className="pointer-events-none fixed inset-0 opacity-20">
        <DotMatrix />
      </div>

      {/* Ambient glows */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 90% 50% at 50% -5%, rgba(6,182,212,0.12) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 40% at 85% 80%, rgba(16,185,129,0.06) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </>
  )
}
