import { ThemeProvider } from '@/hooks/useThemeObserver'
import { HomeWrapper } from '@/components/layout/HomeWrapper'

import { Hero } from '@/components/layout/Hero'
import { Portfolio } from '@/components/sections/home/Portfolio'
import { PortalDemo } from '@/components/sections/portal-demo/PortalDemo'
import { Nosotros } from '@/components/sections/nosotros/Nosotros'
import { Servicios } from '@/components/sections/servicios/Servicios'
import { Cierre } from '@/components/sections/cierre/Cierre'
import { Footer } from '@/components/sections/home/Footer'

/**
 * El home, después de B4-S3.
 *
 * Seis secciones en el orden de la arquitectura, alternando tema de forma
 * estricta y con el índice de capítulos correlativo:
 *
 * | # | Sección | Tema | `id` |
 * |---|---|---|---|
 * | 01 | Hero | oscuro | `inicio` |
 * | 02 | El caso real | crema | `portfolio` |
 * | 03 | El panel del lunes | oscuro | `portal-demo` |
 * | 04 | Por qué develOP + Somos | crema | `caracteristicas` · `nosotros` |
 * | 05 | Los cuatro frentes | oscuro | `servicios` |
 * | 06 | El cierre | crema | — |
 *
 * **Ya no hay `dynamic()`.** Las seis son Server Components y el único JS de la
 * página vive en tres islas: `SectionShell` (que observa el viewport para
 * invertir el tema), el ciclo de escenas del panel del lunes y el CTA a
 * `/contact` del cierre. Partir eso en chunks separados con `next/dynamic`
 * agregaba un placeholder `animate-pulse` y una carga en cascada para ahorrar
 * kilobytes que ya no existen: las secciones que pesaban —el monolito de 9.898
 * líneas, los dos scrollytelling de `400vh`, el marquee infinito— se borraron en
 * este sprint.
 *
 * **Tampoco hay `SectionWrapper`.** Envolvía a cada hijo en un `motion.div` con
 * `initial={{ opacity: 0, y: 40 }}`, y Framer serializa ese `initial` en el HTML
 * del SSR: cada sección nacía invisible y dependía del JS para aparecer. El
 * reveal ahora es `animate-ds-reveal`, una animación CSS que corre sin JS.
 */
export default function Home() {
  return (
    <ThemeProvider>
      <HomeWrapper>
        <Hero />
        <Portfolio />
        <PortalDemo />
        <Nosotros />
        <Servicios />
        <Cierre />
        <Footer />
      </HomeWrapper>
    </ThemeProvider>
  )
}
