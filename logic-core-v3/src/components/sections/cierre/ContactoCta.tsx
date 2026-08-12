'use client'

import { CtaButton } from '@/components/design-system'
import { useTransitionContext } from '@/context/TransitionContext'

/**
 * CTA secundario del cierre: el único pedazo de la sección que necesita JS.
 *
 * Existe como componente aparte para que `Cierre.tsx` siga siendo Server
 * Component. `/contact` es navegación INTERNA del sitio público, y la regla del
 * repo es que eso va por `triggerTransition()` — nunca por `href` ni por
 * `router.push()`. El `href` de `CtaButton` está reservado a destinos externos
 * (wa.me, mailto, tel), que es lo que usa el CTA primario de al lado.
 */
export function ContactoCta() {
  const { triggerTransition } = useTransitionContext()

  return (
    <CtaButton tone="secondary" onClick={() => triggerTransition('/contact')}>
      Otras formas de contacto
    </CtaButton>
  )
}
