"use client"

import { Canvas } from '@react-three/fiber'
import { Suspense, ReactNode, useState } from 'react'
import { HeroArtifact } from '@/components/3d/HeroArtifact'
import { Preloader } from '@/components/ui/Preloader'
import { AboutUs } from '@/components/sections/AboutUs'
import { ProjectLab } from '@/components/sections/ProjectLab'
import { BusinessAccelerators } from '@/components/sections/BusinessAccelerators'
import { FeedbackLoop } from '@/components/sections/FeedbackLoop'
import { Footer } from '@/components/sections/Footer'
import { motion } from 'framer-motion'
import { Environment } from '@react-three/drei'

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

export default function Home() {
  const [heroActive, setHeroActive] = useState(false)

  return (
    <main className="w-full bg-white text-black relative font-sans">
      <Preloader onTransitionStart={() => setTimeout(() => setHeroActive(true), 500)} />

      {/* SCROLLABLE CONTENT */}
      <div className="relative z-10 w-full">

        {/* HERO SECTION (First Fold) */}
        <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-void">
          {/* COLUMN LEFT: TEXT */}
          <div className="flex flex-col justify-center px-8 md:px-24 order-2 md:order-1 bg-void text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 3.8 }} // Wait for preloader
              className="space-y-8"
            >
              <div className="flex items-center gap-2 text-neon font-mono text-[10px] tracking-[0.5em] uppercase">
                <span className="w-1 h-1 bg-neon rounded-full shadow-[0_0_8px_#00ffff]" />
                Exclusive_Digital_Partnership
              </div>

              <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-[0.85] uppercase">
                ELITE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">
                  SYSTEMS
                </span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed font-light">
                No solo creamos software. Construimos el <strong className="text-white font-bold">estatus digital</strong> de tu negocio con ingeniería de vanguardia y diseño de lujo.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <button className="bg-white text-black px-10 py-5 text-xs font-bold uppercase tracking-widest hover:bg-neon transition-colors duration-500 cursor-pointer">
                  Empezar Proyecto
                </button>
                <button className="border border-white/10 px-10 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer text-gray-300">
                  Nuestra Metodología
                </button>
              </div>
            </motion.div>
          </div>

          {/* COLUMN RIGHT: 3D ARTIFACT */}
          <div
            className="relative h-[50vh] md:h-screen w-full order-1 md:order-2 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 45%, #000000 55%, #000000 100%)'
            }}
          >
            <Canvas camera={{ position: [0, 0, 15], fov: 35 }}>
              <fog attach="fog" args={['#ffffff', 10, 30]} />
              <Suspense fallback={null}>
                <ambientLight intensity={1} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={100} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={50} color="#ffffff" />
                <HeroArtifact active={heroActive} />
                <Environment preset="studio" />
              </Suspense>
            </Canvas>
          </div>
        </section>

        {/* SECTIONS WITH FADE-IN */}
        <Section>
          <AboutUs />
        </Section>

        <Section>
          <ProjectLab />
        </Section>

        <Section>
          <BusinessAccelerators />
        </Section>

        <Section>
          <FeedbackLoop />
        </Section>

        <Section>
          <Footer />
        </Section>

      </div>
    </main>
  )
}
