import {
  ChapterLabel,
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
 *    HTML del documento. El reveal de entrada es una animación CSS del sistema,
 *    por la misma razón: si fuese de Framer, el SSR emitiría `opacity:0` y el
 *    hero quedaría en blanco hasta hidratar. El titular lleva la variante sin
 *    opacidad (`animate-ds-rise`) — ver la nota de la columna, abajo: no
 *    alcanza con no depender del JS, el titular tampoco puede nacer
 *    transparente.
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
        {/*
          El reveal va en los HIJOS y no en esta columna. Envolviendo la columna
          entera, el `from { opacity: 0 }` de `ds-reveal` se aplicaba también al
          titular, y la opacidad de un ancestro multiplica a todo lo que cuelga
          de él: el `h1` —que es el LCP de la página— quedaba transparente
          durante los 900 ms del fade, y Chrome no considera candidato a LCP a un
          elemento transparente. Medido con `elementtiming` inyectado en el HTML
          servido, que fecha la pintura del `h1` sin depender de su candidatura:
          pintaba a FCP + 1.020 ms; fuera del fade, en el MISMO frame que FCP.

          Los tres bloques de apoyo conservan `ds-reveal` intacto. El titular usa
          `ds-rise`, su compañero sin tramo de opacidad: misma distancia, misma
          duración, misma curva, así que la columna sigue entrando en lockstep —
          lo único que cambia es que el titular nace opaco.
        */}
        <div className="flex flex-col">
          {/*
            El hero LLEVA número. La sección-como-capítulo es la firma del
            sistema, y una portada sin numerar deja el índice arrancando en
            "01" sobre la segunda sección — que es justo la inconsistencia que
            se está corrigiendo. Numerar desde el hero da una convención
            mecánica, replicable tal cual en las cuatro landings.

            En la misma fila que el eyebrow y no encima: son dos etiquetas mono
            del mismo peso, y apiladas leen como dos kickers en pugna.

            El eyebrow va en grafía natural y no en mayúsculas: el `uppercase`
            lo pone el token, así que se ve idéntico, pero el lector de pantalla
            no deletrea el texto letra por letra.
          */}
          <div className="animate-ds-reveal flex flex-wrap items-center gap-x-6 gap-y-2">
            <ChapterLabel number="01" />
            <Eyebrow>Ingeniería de software — Tucumán, AR</Eyebrow>
          </div>

          {/*
            Separaciones explícitas y no un `gap` parejo: el eyebrow pertenece
            al titular y va pegado; el CTA necesita aire para despegarse del
            cuerpo. Un gap uniforme los trata como cinco bloques sueltos.
          */}
          <DisplayHeading size="xl" as="h1" className="animate-ds-rise mt-5">
            Software de élite, sin la burocracia de agencia.
          </DisplayHeading>

          <Lead className="animate-ds-reveal mt-6">
            Web, agentes de IA y sistemas a medida para negocios que quieren operar en serio. Desde
            Tucumán, para todo el país.
          </Lead>

          <div className="animate-ds-reveal mt-8 flex flex-col items-start gap-4">
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
