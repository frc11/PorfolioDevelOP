"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
// import { Preloader } from '@/components/ui/Preloader'

// Heavy Components Lazy Loaded
const Hero = dynamic(() => import('@/components/layout/Hero').then(mod => mod.Hero), { ssr: true })
const Footer = dynamic(() => import('@/components/sections/Footer').then(mod => mod.Footer), { ssr: true })
const WhyDevelOP = dynamic(() => import('@/components/sections/WhyDevelOP').then(mod => mod.WhyDevelOP), { ssr: true })

import { AboutUs } from '@/components/sections/AboutUs'
import { Portfolio } from '@/components/sections/Portfolio'
import { OurServices } from '@/components/sections/OurServices';
import { WebDesigns } from '@/components/sections/WebDesigns'

import { InfiniteReviews } from '@/components/sections/InfiniteReviews'
import { motion } from 'framer-motion'
import { ThemeProvider, useTheme } from '@/hooks/useThemeObserver'
import { TemplateWarehouse } from '@/components/sections/TemplateWarehouse'
import { TeamSection } from '@/components/sections/TeamSection'
import { FeedbackLoop } from '@/components/sections/FeedbackLoop'

// Reusable Section Wrapper for unifying animations
const Section = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-15%" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

import { SectionTransition } from '@/components/layout/SectionTransition'
import { ServicesTransition } from '@/components/layout/ServicesTransition'

// ... (existing imports)

function HomeContent() {
  const { theme } = useTheme()

  // Theme colors - Hero is now excluded from this as it has its own style locking
  const bgColor = theme === 'light' ? '#fafafa' : '#000000' // zinc-50 vs black
  const textColor = theme === 'light' ? '#18181b' : '#ffffff' // zinc-900 vs white

  return (
    <motion.main
      className="w-full relative font-sans"
      animate={{
        backgroundColor: bgColor,
        color: textColor
      }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* <Preloader /> Removed and moved to layout */}

      {/* GLOBAL BACKGROUND - Removed ReactiveBackground for Light Mode */}
      {/* <ReactiveBackground /> */}

      {/* SCROLLABLE CONTENT */}
      <div className="relative z-10 w-full">

        {/* HERO SECTION (First Fold) - Now Modularized */}
        <Hero />

        {/* Light Mode Return - Horizontal Scroll */}
        <AboutUs />



        <Section>
          <Portfolio />
        </Section>



        <Section>
          <InfiniteReviews />
        </Section>

        {/* BLUR TRANSITION: Frosted lens effect */}
        <div className="relative z-20 -mb-32 pointer-events-none">
          <SectionTransition
            className="bg-gradient-to-b from-white via-white/60 to-transparent backdrop-blur-xl"
            height="h-48"
          />
        </div>

        <Section>
          <OurServices />
        </Section>



        <WhyDevelOP />



        <Footer />

      </div>
    </motion.main>
  )
}

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  )
}
