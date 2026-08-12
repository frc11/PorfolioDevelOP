'use client'

import {
  ChapterLabel,
  CtaButton,
  DisplayHeading,
  Lead,
  MonoLabel,
  SectionShell,
  Subhead,
} from '@/components/design-system'
import { getWhatsappHref } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { ESCENAS, type Escena } from './data'
import { PanelPlate } from './PanelPlate'
import { useEscenaCycle } from './useEscenaCycle'

/**
 * S3 del home — el panel del lunes. Tema oscuro.
 *
 * Conserva el concepto (que es bueno: tres momentos de una mañana, no una lista
 * de features) y cambia su ejecución entera. Lo que se fue:
 *
 * · `DashboardStoryBackground`, ~200 líneas de gradientes radiales, blurs de
 *   `3xl`, grillas enmascaradas y ocho SVG decorativos, con dos loops `Infinity`
 *   corriendo de por vida.
 * · Los mockups con `conic-gradient`, `boxShadow` de color y barras con
 *   degradado.
 * · El CTA propio con borde cian, glow en hover y `whileTap`.
 * · La línea conectora vertical con su destello perpetuo.
 *
 * Lo que queda es la lámina de producto, tres escenas y un riel. **Sin Framer
 * Motion en el árbol**: el cross-fade es la animación CSS del sistema.
 * `useReducedMotion` se importa de `motion/react` pero por dentro es un
 * `matchMedia` — no arrastra el motor de animación.
 *
 * **Legible a mitad de ciclo.** El riel con las tres horas está SIEMPRE
 * completo y la escena activa se marca sobre él. Quien llega cuando va por la
 * segunda ve las tres, sabe que son tres y sabe en cuál está. El texto de la
 * escena activa se lee entero sin esperar nada.
 *
 * El contrato de motion —cancelar el loop fuera del viewport, no arrancarlo con
 * `prefers-reduced-motion`— vive en `useEscenaCycle`, documentado ahí.
 */
export function PortalDemo() {
  const { ref, indice, seleccionar } = useEscenaCycle(ESCENAS.length)

  return (
    <SectionShell theme="dark" id="portal-demo">
      <div className="flex flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <ChapterLabel number="03" />
            <MonoLabel>Un lunes cualquiera</MonoLabel>
          </div>

          <DisplayHeading size="lg" as="h2">
            Un lunes a la mañana, abrís tu panel.
          </DisplayHeading>

          <Lead>Mientras arrancás el café, el sistema ya trabajó.</Lead>
        </div>

        <div className="flex flex-col gap-8">
          {/*
            El riel. Las tres horas siempre visibles, la activa marcada. Son
            botones de verdad: alcanzables con teclado, con `aria-current` para
            que el lector de pantalla anuncie en cuál está parado, y tocarlos
            corta el avance automático — quien quiere leer tranquilo tiene por
            dónde salirse del loop.
          */}
          <ul className="grid gap-px border-y border-ds-rule bg-ds-rule sm:grid-cols-3">
            {ESCENAS.map((escena, index) => (
              <li key={escena.id} className="bg-ds-canvas">
                <button
                  type="button"
                  onClick={() => seleccionar(index)}
                  aria-current={index === indice ? 'true' : undefined}
                  className={cn(
                    'flex w-full cursor-pointer flex-col items-start gap-1 px-4 py-4 text-left',
                    'transition-opacity duration-300 motion-reduce:transition-none',
                    'outline-none focus-visible:ring-1 focus-visible:ring-ds-fg',
                    // Con reduced-motion se ven las tres escenas a la vez, así
                    // que atenuar dos pasos del riel no significaría nada.
                    index === indice
                      ? 'opacity-100'
                      : 'opacity-55 hover:opacity-90 motion-reduce:opacity-100',
                  )}
                >
                  <span className="font-ds-mono text-ds-subhead tabular-nums text-ds-fg">
                    {escena.hora}
                  </span>
                  <span className="font-ds-mono text-ds-eyebrow uppercase text-ds-fg-muted">
                    {escena.momento}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/*
            LAS TRES ESCENAS ESTÁN SIEMPRE EN EL DOM, y quién se ve lo decide
            CSS. No es un detalle de implementación: es lo que evita un error de
            hidratación.

            La primera versión ramificaba el JSX con `estatico` —una escena si
            había motion, las tres si no—. Pero `useReducedMotion()` devuelve
            `false` en el servidor y `true` en el cliente, así que el HTML del
            SSR y el primer render del cliente salían distintos: React error
            #418, medido en runtime con `reducedMotion: 'reduce'`.

            Acá el marcado es idéntico en servidor y cliente. `motion-reduce:`
            es una media query pura: quien pidió menos movimiento ve las tres
            escenas desde el primer paint, sin depender de que corra un solo
            byte de JS. El `useReducedMotion` del hook ya solo gatea el
            temporizador — comportamiento, no marcado.

            Y el fade sale gratis: un elemento en `display:none` no corre sus
            animaciones, así que al pasar a `block` la animación de entrada
            arranca de cero. Es un fade por cambio de escena, de una pasada, sin
            remontar nada y sin un loop.
          */}
          <div ref={ref} className="flex flex-col">
            {ESCENAS.map((escena, index) => (
              <div
                key={escena.id}
                className={cn(
                  'animate-ds-reveal grid items-start gap-10',
                  'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14',
                  // El margen solo aplica en la vista estática, donde las tres
                  // escenas conviven apiladas.
                  'motion-reduce:mb-14 motion-reduce:last:mb-0',
                  index === indice ? 'block lg:grid' : 'hidden motion-reduce:block motion-reduce:lg:grid',
                )}
              >
                <EscenaTexto escena={escena} />
                <div className="mt-8 lg:mt-0">
                  <PanelPlate escena={escena.id} hora={escena.hora} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start gap-4">
          <CtaButton href={getWhatsappHref()} target="_blank">
            Escribinos por WhatsApp
          </CtaButton>
          <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
            El panel viene con lo que entregamos. No se paga aparte.
          </p>
        </div>
      </div>
    </SectionShell>
  )
}

function EscenaTexto({ escena }: { escena: Escena }) {
  return (
    <div className="flex flex-col gap-5">
      <Subhead as="h3">{escena.pregunta}</Subhead>

      <div className="flex flex-col gap-2">
        <MonoLabel>Qué ves</MonoLabel>
        <p className="max-w-ds-prose text-ds-body text-ds-fg">{escena.muestra}</p>
      </div>

      <div className="flex flex-col gap-2 border-t border-ds-rule pt-5">
        <MonoLabel>Qué hacés</MonoLabel>
        <p className="max-w-ds-prose text-ds-body text-ds-fg-muted">{escena.decidis}</p>
      </div>
    </div>
  )
}
