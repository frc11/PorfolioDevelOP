import dynamic from 'next/dynamic'
import { ThemeProvider } from '@/hooks/useThemeObserver'
import { HomeWrapper } from '@/components/layout/HomeWrapper'
import { SectionWrapper } from '@/components/layout/SectionWrapper'

// Critical ATF (Above The Fold) Components
import { Hero } from '@/components/layout/Hero'
import { About } from '@/components/sections/home/About'

// Heavy Components Lazy Loaded
const Footer = dynamic(() => import('@/components/sections/home/Footer').then(mod => mod.Footer), { ssr: true })
const WhyDevelOP = dynamic(() => import('@/components/sections/home/WhyDevelOP').then(mod => mod.WhyDevelOP), { ssr: true })
const Portfolio = dynamic(() => import('@/components/sections/home/Portfolio').then(mod => mod.Portfolio), { loading: () => <div className="min-h-[50vh] animate-pulse bg-zinc-900/20" /> })
const OurServices = dynamic(() => import('@/components/sections/home/OurServices'), { loading: () => <div className="min-h-[50vh] animate-pulse bg-[#030303]" /> })
const PortalDemo = dynamic(() => import('@/components/sections/portal-demo/PortalDemo').then(mod => mod.PortalDemo), { loading: () => <div className="min-h-[50vh] animate-pulse bg-[#030303]" /> })
const TodoIncluido = dynamic(() => import('@/components/sections/todo-incluido/TodoIncluido').then(mod => mod.TodoIncluido), { loading: () => <div className="min-h-[50vh] animate-pulse bg-[#030303]" /> })
const ModulosOpcionales = dynamic(() => import('@/components/sections/modulos-opcionales/ModulosOpcionales').then(mod => mod.ModulosOpcionales), { loading: () => <div className="min-h-[50vh] animate-pulse bg-[#030303]" /> })
const PortalDemoCTA = dynamic(() => import('@/components/sections/portal-demo-cta/PortalDemoCTA').then(mod => mod.PortalDemoCTA), { loading: () => <div className="min-h-[50vh] animate-pulse bg-[#030303]" /> })
const InfiniteReviews = dynamic(() => import('@/components/sections/home/InfiniteReviews').then(mod => mod.InfiniteReviews), { loading: () => <div className="min-h-[20vh] animate-pulse bg-zinc-900/20" /> })

export default function Home() {
  return (
    <ThemeProvider>
      <HomeWrapper>
        <Hero />
        <About />
        <Portfolio />
        <InfiniteReviews />

        <SectionWrapper>
          <OurServices />
        </SectionWrapper>

        {/*
          `PortalDemo` sale del `SectionWrapper` en B3-S2. No es cosmético: el
          wrapper envuelve a su hijo en un `motion.div` con
          `initial={{ opacity: 0, y: 40 }}`, y Framer serializa ese `initial` en
          el HTML del SSR — la sección nace invisible y depende del JS para
          aparecer. Encima le montaba un segundo reveal ajeno arriba del reveal
          CSS del sistema. `Hero` y `Portfolio`, ya migrados, tampoco lo usan.
          `OurServices` lo conserva: no es de este sprint.
        */}
        <PortalDemo />

        <TodoIncluido />
        <ModulosOpcionales />
        <PortalDemoCTA />
        <WhyDevelOP />
        <Footer />
      </HomeWrapper>
    </ThemeProvider>
  )
}
