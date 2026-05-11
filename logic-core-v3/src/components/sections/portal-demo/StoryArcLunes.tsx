'use client'

import { STORY_MOMENTS } from './data'
import { StoryMomentCard } from './StoryMomentCard'

export function StoryArcLunes() {
  return (
    <div className="relative">
      {/* Gradient radial background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(6,182,212,0.04) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Vertical connector line — desktop only */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden lg:block pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, #06b6d430, #8b5cf630, #10b98130)',
          opacity: 0.4,
        }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-32 md:gap-48">
        {STORY_MOMENTS.map((moment, index) => (
          <StoryMomentCard key={moment.id} moment={moment} index={index} />
        ))}
      </div>
    </div>
  )
}
