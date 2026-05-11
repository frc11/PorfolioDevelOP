'use client'

import { PortalDemoHeader } from './PortalDemoHeader'
import { StoryArcLunes } from './StoryArcLunes'

export function PortalDemo() {
  return (
    <section className="w-full py-24 md:py-36 px-6 md:px-10 lg:px-16 max-w-6xl mx-auto">
      <div className="mb-20 md:mb-28">
        <PortalDemoHeader />
      </div>

      <StoryArcLunes />
    </section>
  )
}
