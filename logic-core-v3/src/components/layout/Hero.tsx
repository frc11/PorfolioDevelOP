import {
  CtaButton,
  DisplayHeading,
  Eyebrow,
  Lead,
  SectionShell,
} from '@/components/design-system'
import { getWhatsappHref } from '@/lib/whatsapp'
import { HeroArtifactLayer } from './HeroArtifactLayer'

/**
 * S1 del home — hero tipográfico.
 *
 * Dos capas, deliberadamente desacopladas:
 *
 * 1. **Base tipográfica** (este archivo). Es lo que ven mobile, quien pidió
 *    `prefers-reduced-motion` y cualquiera cuyo canvas no cargue. No es un
 *    placeholder esperando al 3D: es el hero terminado. Server Component — no
 *    lleva `'use client'` ni una línea de JS propia, así que se pinta con el
 *    HTML del documento. El reveal de entrada es la animación CSS
 *    `animate-ds-reveal` del sistema, por la misma razón: si fuese de Framer,
 *    el SSR emitiría `opacity:0` y el hero quedaría en blanco hasta hidratar.
 *
 * 2. **Artefacto 3D** (`HeroArtifactLayer`), mejora progresiva de desktop que
 *    se monta DESPUÉS del contenido y aparece con un fade cuando está listo.
 *
 * Lo que este hero NO hace, y no debe volver a hacer: bloquear el scroll. El
 * scroll está disponible desde el primer frame, pase lo que pase con el canvas.
 * No hay readiness gate, no hay `PreloaderContext`, no hay fase que esperar.
 *
 * `id="inicio"` es consumido por `Navbar` (`MAIN_NAV_ITEMS`, `HASH_TO_LABEL`,
 * el fallback del IntersectionObserver) y por `DynamicDock`. No se renombra.
 */
export function Hero() {
  return (
    <SectionShell
      theme="dark"
      id="inicio"
      // Ritmo vertical propio (`spacing="none"`), no el `py-ds-section`
      // genérico: el hero reserva el alto del chrome fijo, y el chrome cambió
      // de borde en B2-S2.
      //
      // Arriba: la barra de navegación es fija y opaca, así que su alto
      // (`--spacing-ds-nav`) es reserva obligatoria — sin ella el eyebrow queda
      // debajo de la barra. Se suma al aire propio del hero en vez de
      // reemplazarlo.
      //
      // Abajo: ya no hay dock flotante que esquivar (era lo que pisaba el
      // microcopy). Lo único anclado abajo es el launcher del chat —
      // `bottom` 24px + 56px de alto = ~80px, y solo en la esquina derecha. La
      // reserva bajó de `clamp(7rem,16vh,11rem)` a lo que ese launcher pide de
      // verdad, que le devuelve alto útil al titular en viewports bajos.
      spacing="none"
      className="flex min-h-[100svh] items-center pt-[calc(var(--spacing-ds-nav)+clamp(1.5rem,4vh,3.5rem))] pb-[clamp(5rem,9vh,7rem)]"
    >
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
        <div className="animate-ds-reveal flex flex-col">
          {/*
            En grafía natural y no en mayúsculas: el `uppercase` lo pone el
            token del Eyebrow, así que se ve idéntico, pero el lector de
            pantalla no deletrea el texto letra por letra.
          */}
          <Eyebrow>Ingeniería de software — Tucumán, AR</Eyebrow>

          {/*
            Separaciones explícitas y no un `gap` parejo: el eyebrow pertenece
            al titular y va pegado; el CTA necesita aire para despegarse del
            cuerpo. Un gap uniforme los trata como cinco bloques sueltos.
          */}
          <DisplayHeading size="xl" as="h1" className="mt-5">
            Software de élite, sin la burocracia de agencia.
          </DisplayHeading>

          <Lead className="mt-6">
            Web, agentes de IA y sistemas a medida para negocios que quieren operar en serio. Desde
            Tucumán, para todo el país.
          </Lead>

          <div className="mt-8 flex flex-col items-start gap-4">
            <CtaButton href={getWhatsappHref()} target="_blank">
              Escribinos por WhatsApp
            </CtaButton>

            <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
              Te respondemos hoy. Coordinamos una llamada de 30 minutos, directo con un ingeniero.
            </p>
          </div>
        </div>

        <HeroArtifactLayer />
      </div>
    </SectionShell>
  )
}
