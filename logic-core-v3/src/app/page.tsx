import { ThemeProvider } from '@/hooks/useThemeObserver'
import { HomeWrapper } from '@/components/layout/HomeWrapper'
import { HomeIntro } from '@/components/layout/HomeIntro'
import { SectionShell, Eyebrow, DisplayHeading } from '@/components/design-system'

// Componentes actuales del home, montados tal cual (S1-cimiento, Bloque 3).
// Sin dynamic(): el B0b documenta que las 9 secciones con dynamic() eran la
// causa del aterrizaje roto de anclas en carga fría (placeholder sin caja que
// hace crecer el documento después del hash-scroll). Import estático: cada
// componente ya es 'use client' por su cuenta, así que sigue siendo una isla
// de JS — lo que se saca es el code-splitting artificial de la composición,
// no la interactividad de cada pieza.
import { HeroSection } from '@/components/layout/HeroSection'
import { About } from '@/components/sections/home/About'
import { Portfolio } from '@/components/sections/home/Portfolio'
import OurServices from '@/components/sections/home/OurServices'
import { PortalDemo } from '@/components/sections/portal-demo/PortalDemo'
import { Footer } from '@/components/sections/home/Footer'

/**
 * Home — S1-cimiento: el andamio, no el diseño.
 *
 * 8 secciones del esquema, cada una envuelta en `SectionShell`. Mapeo de los
 * 6 componentes "tal cual" (Hero, About, Portfolio, OurServices, PortalDemo,
 * Footer) sobre las 8 filas de la tabla — el documento nombra los 6
 * componentes y por separado nombra qué 3 filas quedan con placeholder
 * (carrusel de palabras, tu panel, por qué develOP), pero no dicta la
 * asignación fila-por-fila de los otros 5. Resuelto por correspondencia de
 * contenido, sin ambigüedad real en 4 de 5:
 *   Hero → 1 (Hero) · About → 2 (Quiénes somos) · Portfolio → 4 (Trabajos) ·
 *   OurServices → 5 (Servicios, "no se toca", id="servicios" frozen).
 * El 5to — PortalDemo — no tiene fila obvia (no es "tu panel": esa fila pide
 * placeholder explícitamente, con el argumento de que PortalDemo no es un
 * componente "propio" de esa sección). Por eliminación cae en 8 (Cierre),
 * aunque temáticamente no calza — igual que el resto, "se va a ver fuera de
 * lugar" es el resultado esperado de este sprint. Footer NO es una de las 8:
 * hoy no tiene id, no es un ancla y B0b lo describe como chrome de cierre
 * global, no un capítulo — se monta después de las 8, no adentro de la 8va.
 *
 * `contained={false}` + `spacing="none"` en las 6 secciones legacy: cada una
 * ya trae su propio ancho, padding y fondo opaco propio (`Hero.tsx` pinta
 * `bg-[#f1f2f4]` en su propia `<section id="inicio">`, etc.) — envolverlas con
 * el contenedor/ritmo del sistema las apretaría contra un layout para el que
 * no fueron armadas. `SectionShell` acá solo aporta el scope de tema y la
 * capacidad de fundido de borde; el fundido en sí queda INVISIBLE en estas 6
 * secciones (su propio fondo opaco lo tapa) — visible recién donde un
 * placeholder está de un lado. Ver el punto abierto de S1-CIMIENTO.md.
 *
 * Ids: uno por sección, sin `id` en el `SectionShell` cuando el componente
 * legacy ya trae el suyo (Hero `#inicio`, Portfolio `#portfolio`, OurServices
 * `#servicios` — frozen, no se renombra). `#nosotros` es la excepción: sigue
 * duplicado ADENTRO de `About.tsx` (árbol mobile + desktop, bug preexistente
 * documentado en el B0b) y esta sección NO lo toca — About no está en el
 * scope de este sprint. No se agrega un tercer `#nosotros` acá: el bug queda
 * tal cual estaba, reportado, no resuelto.
 *
 * Tema vs. componente: el tema de cada `SectionShell` es el de la tabla, no
 * el que el componente legacy fuerce internamente. About.tsx llama
 * `useThemeSection(isInView, 'light')` por su cuenta (About.tsx:402,461) —
 * la tabla pide "oscuro" para esa fila. CONFLICTO CONOCIDO, no resuelto acá
 * por instrucción explícita: ni se fuerza el tema del shell a 'light' para
 * "hacerlo calzar", ni se edita About.tsx para sacarle el llamado. Los dos
 * anuncios de tema conviven — el de `SectionShell` y el interno de About —
 * hasta que About se reemplace en un sprint futuro. WhyDevelOP tenía el mismo
 * problema (fuerza 'dark' vía `useThemeSection`) pero no se monta en S1: su
 * caso no aplica.
 */
export default function Home() {
  return (
    <ThemeProvider>
      {/* Preloader del home (S3): capa encima del contenido, nunca un gate.
          Va en el HTML del server siempre; el script pre-paint de
          HomeIntroBoot (layout <head>) decide si se ve. Ver HomeIntro.tsx. */}
      <HomeIntro />
      <HomeWrapper>
        {/* 1 · Hero — claro. S3: `HeroSection` trae su PROPIO `SectionShell`
            (con su tema, su id="inicio" y su ritmo vertical), así que acá no va
            envuelto — anidarlo duplicaría el shell y con él el disparador de
            tema y el fundido de bordes. El hero legacy (`Hero.tsx`) sí
            necesitaba el wrapper porque no era una sección del sistema. */}
        <HeroSection />

        {/* 2 · Quiénes somos — oscuro (tabla). Conflicto con About.tsx
            documentado arriba: no resuelto en este sprint. */}
        <SectionShell theme="dark" contained={false} spacing="none">
          <About />
        </SectionShell>

        {/* 3 · Carrusel de palabras — claro. Sin componente propio todavía. */}
        <SectionShell id="carrusel" theme="light">
          <Eyebrow>03 — Carrusel de palabras</Eyebrow>
          <DisplayHeading size="lg" as="h2">
            Placeholder — carrusel de palabras
          </DisplayHeading>
        </SectionShell>

        {/* 4 · Trabajos — oscuro. Portfolio.tsx trae su propio id="portfolio". */}
        <SectionShell theme="dark" contained={false} spacing="none">
          <Portfolio />
        </SectionShell>

        {/* 5 · Servicios — claro. OurServices.tsx trae su propio id="servicios"
            (frozen: hardcodeado en TransitionContext, Navbar y el chatbot). No
            se toca OurServices.tsx en este sprint — se monta tal cual está. */}
        <SectionShell theme="light" contained={false} spacing="none">
          <OurServices />
        </SectionShell>

        {/* 6 · Tu panel — claro. Sin componente propio todavía: PortalDemo NO
            es el componente de esta fila (ver nota arriba). */}
        <SectionShell id="panel" theme="light">
          <Eyebrow>06 — Tu panel</Eyebrow>
          <DisplayHeading size="lg" as="h2">
            Placeholder — tu panel
          </DisplayHeading>
        </SectionShell>

        {/* 7 · Por qué develOP — claro. Sin componente propio todavía.
            WhyDevelOP.tsx no se monta (muere en este rediseño), pero su id
            `#caracteristicas` es una de las 5 anclas del home — el placeholder
            lo hereda para que la ancla siga resolviendo. */}
        <SectionShell id="caracteristicas" theme="light">
          <Eyebrow>07 — Por qué develOP</Eyebrow>
          <DisplayHeading size="lg" as="h2">
            Placeholder — por qué develOP
          </DisplayHeading>
        </SectionShell>

        {/* 8 · Cierre — claro. PortalDemo cae acá por eliminación (ver nota
            arriba) — fuera de lugar a propósito, resultado esperado de S1. */}
        <SectionShell id="cierre" theme="light" contained={false} spacing="none">
          <PortalDemo />
        </SectionShell>
      </HomeWrapper>

      {/* Footer: chrome de cierre global, no una de las 8 secciones (sin id,
          sin ancla propia hoy — ver nota arriba). Fuera de HomeWrapper: no
          participa de la transición cromática de tema, igual que hoy. */}
      <Footer />
    </ThemeProvider>
  )
}
