"use client"

import { Canvas } from '@react-three/fiber'
import { Suspense, ReactNode, useState } from 'react'
import { HeroArtifact } from '@/components/3d/HeroArtifact'
import { Preloader } from '@/components/ui/Preloader'
import { AboutUs } from '@/components/sections/AboutUs'
import { ProjectLab } from '@/components/sections/ProjectLab'
import { BusinessAccelerators } from '@/components/sections/BusinessAccelerators'
import { WebDesigns } from '@/components/sections/WebDesigns'
import { SoftwareEcosystem } from '@/components/sections/SoftwareEcosystem'
import { TheStudio } from '@/components/sections/TheStudio'
import { InfiniteReviews } from '@/components/sections/InfiniteReviews'
import { Footer } from '@/components/sections/Footer'
import { motion } from 'framer-motion'
import { Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { DotMatrix } from '@/components/canvas/DotMatrix'
import { ThemeProvider, useTheme } from '@/hooks/useThemeObserver'
import { TemplateWarehouse } from '@/components/sections/TemplateWarehouse'
import { TeamSection } from '@/components/sections/TeamSection'
import { FeedbackLoop } from '@/components/sections/FeedbackLoop'
// import { ReactiveBackground } from '@/components/canvas/ReactiveBackground'

// Reusable Section Wrapper for unifying animations
const Section = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
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

function HomeContent() {
  const [heroActive, setHeroActive] = useState(false)
  const { theme } = useTheme()

  // Theme colors
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
      <Preloader onTransitionStart={() => setTimeout(() => setHeroActive(true), 500)} />

      {/* GLOBAL BACKGROUND - Removed ReactiveBackground for Light Mode */}
      {/* <ReactiveBackground /> */}

      {/* SCROLLABLE CONTENT */}
      <div className="relative z-10 w-full">

        {/* HERO SECTION (First Fold) */}
        <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden">
          {/* COLUMN LEFT: TEXT */}
          <div className="flex flex-col justify-center px-8 md:px-24 order-2 md:order-1 text-zinc-900 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 3.8 }} // Wait for preloader
              className="space-y-8"
            >
              <div className="flex items-center gap-2 text-cyan-600 font-mono text-[10px] tracking-[0.5em] uppercase">
                <span className="w-1 h-1 bg-cyan-600 rounded-full shadow-[0_0_8px_#0891b2]" />
                Exclusive_Digital_Partnership
              </div>

              <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-[0.85]">
                devel
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-400">
                  OP
                </span>
              </h1>

              <p className="text-zinc-600 text-lg md:text-xl max-w-lg leading-relaxed font-light">
                No solo desarrollamos soluciones a medida. Construimos la <strong className="text-zinc-900 font-bold">presencia digital</strong> de tu negocio con ingeniería de vanguardia y diseño de lujo.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <button className="bg-zinc-900 text-white px-10 py-5 text-xs font-bold uppercase tracking-widest hover:bg-cyan-600 transition-colors duration-500 cursor-pointer">
                  Empezar Proyecto
                </button>
                <button className="border border-zinc-200 px-10 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors cursor-pointer text-zinc-700">
                  Nuestra Metodología
                </button>
              </div>
            </motion.div>
          </div>



          {/* COLUMN RIGHT: 3D ARTIFACT */}
          <div
            className="relative h-[50vh] md:h-screen w-full order-1 md:order-2 overflow-hidden flex items-center justify-center"
          >
            <Canvas camera={{ position: [0, 0, 15], fov: 35 }} gl={{ alpha: true }}>
              <Suspense fallback={null}>
                {/* Background Dot Matrix */}
                <DotMatrix />

                {/* Lighting Setup for Light Mode */}
                <ambientLight intensity={1.5} />
                <Environment preset="studio" />

                {/* 3D Logo (Front) */}
                <HeroArtifact active={heroActive} />

                {/* Contact Shadows for depth */}
                <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={15} blur={2} far={4} color="#000000" />

                {/* Post-Processing Effects */}
                <EffectComposer disableNormalPass>
                  {/* Chromatic Aberration - Subtle lens distortion */}
                  <ChromaticAberration offset={[0.0015, 0.0015]} />

                  {/* 3D Noise - Integrates with global film grain */}
                  <Noise opacity={0.05} premultiply />

                  {/* Vignette - Darkens edges, centers attention */}
                  <Vignette eskil={false} offset={0.1} darkness={0.7} />
                </EffectComposer>
              </Suspense>
            </Canvas>
          </div>
        </section>
        {/* Light Mode Return - Horizontal Scroll */}
        <TheStudio />

        <Section>
          <ProjectLab />
        </Section>

        <Section>
          <InfiniteReviews />
        </Section>


        <Section>
          <BusinessAccelerators />
        </Section>


        <Section>
          <WebDesigns />
        </Section>

        <SoftwareEcosystem />

        <Section>
          <TeamSection />
        </Section>
        {/* Dark Mode Section - This triggers theme transition */}

        {/* Final CTA - Dark Mode */}
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
