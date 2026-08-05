import dynamic from 'next/dynamic'
import { ThemeProvider } from '@/hooks/useThemeObserver'
import { HomeWrapper } from '@/components/layout/HomeWrapper'

// Critical ATF (Above The Fold) Components
import { Hero } from '@/components/layout/Hero'
import { Nosotros } from '@/components/sections/nosotros/Nosotros'
import { Servicios } from '@/components/sections/servicios/Servicios'

// Heavy Components Lazy Loaded
const Footer = dynamic(() => import('@/components/sections/home/Footer').then(mod => mod.Footer), { ssr: true })
const Portfolio = dynamic(() => import('@/components/sections/home/Portfolio').then(mod => mod.Portfolio), { loading: () => <div className="min-h-[50vh] animate-pulse bg-zinc-900/20" /> })
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
        <Portfolio />
        <InfiniteReviews />

        {/*
          B4-S1 desmonta `OurServices` —el monolito de 9.898 líneas— y pone en
          su lugar la sección nueva. El ARCHIVO todavía existe: borrarlo es
          B4-S3, después de que S1 y S2 estén verificados. Acá deja de
          renderizarse, que es lo que hacía falta para que `id="servicios"` no
          quedara declarado dos veces en el mismo documento.

          Con él se va el último `SectionWrapper` del home. El wrapper envolvía
          a su hijo en un `motion.div` con `initial={{ opacity: 0, y: 40 }}`, y
          Framer serializa ese `initial` en el HTML del SSR: la sección nacía
          invisible y dependía del JS para aparecer. Encima montaba un segundo
          reveal ajeno arriba del reveal CSS del sistema. `Hero`, `Portfolio` y
          `PortalDemo`, ya migrados, tampoco lo usaban.

          El ORDEN todavía no es el de la arquitectura: la sección entra en el
          hueco que dejó el monolito. Reordenar las seis es B4-S3.
        */}

        {/*
          B4-S2 hace lo mismo con `About` y `WhyDevelOP`: los dos dejan de
          renderizarse acá y `Nosotros` —que los fusiona— ocupa el lugar. Los
          ARCHIVOS siguen existiendo hasta S3.

          Tenían que salir los dos en este sprint, no en la demolición: `About`
          declara `id="nosotros"` DOS veces (líneas 411 y 471, un árbol por
          breakpoint, los dos en el DOM) y `WhyDevelOP` declara
          `id="caracteristicas"` (línea 1629). Dejarlos montados habría puesto
          tres ids duplicados en el documento junto a los de la sección nueva, y
          `getElementById` resuelve al primero: los links del Navbar habrían
          seguido aterrizando en el árbol viejo.

          Va pegada a `Servicios` para que el par 04 → 05 se lea correlativo. El
          resto del orden sigue sin ser el de la arquitectura — eso es S3.
        */}
        <Nosotros />
        <Servicios />

        <PortalDemo />

        <TodoIncluido />
        <ModulosOpcionales />
        <PortalDemoCTA />
        <Footer />
      </HomeWrapper>
    </ThemeProvider>
  )
}
