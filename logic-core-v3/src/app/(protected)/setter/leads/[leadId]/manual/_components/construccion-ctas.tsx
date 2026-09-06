'use client'

import { Hammer } from 'lucide-react'
import { useStepAction } from '@/lib/use-step-action'
import {
  iniciarConstruccion,
  reabrirConstruccion,
} from '@/app/(protected)/setter/_actions/dossier.actions'
import { useAccionPrincipal } from './barra-accion'

/**
 * 5.6 — Las dos transiciones de Construcción que vivían SOLO en el wizard
 * (`construccion-step`) y que el corte trae al manual, con las MISMAS actions
 * intactas (ownership + guardia de stage server-side; el motor no se toca):
 *   - `iniciarConstruccion` (BRIEF→CONSTRUCCION): sin esto el borrador (m13)
 *     nunca se habilita — el registro del draft exige CONSTRUCCION;
 *   - `reabrirConstruccion` (RECHAZADA→CONSTRUCCION): el re-loop del rechazo —
 *     el chequeo final (m14) queda futuro hasta reabrir.
 * `useStepAction` refresca la ruta tras el éxito y la posición se re-deriva sola.
 *
 * P18 — las dos son la ACCIÓN PRINCIPAL de su pantalla, así que se pintan en la
 * barra fija de `PantallaManual` y no en el sitio donde se montan. Por eso el
 * componente no devuelve nada: sigue marcando DÓNDE vive la acción en el árbol
 * (y con qué texto de alrededor), pero el control se dibuja en la barra.
 * Ninguna de las dos se bloquea nunca — no hay motivo que mostrar.
 */

export function ArrancarConstruccion({ leadId }: { leadId: string }) {
  const { isPending, run } = useStepAction()
  useAccionPrincipal({
    etiqueta: 'Arrancar construcción',
    onClick: () =>
      run(() => iniciarConstruccion(leadId), {
        successToast: 'Construcción arrancada — seguí la guía.',
      }),
    loading: isPending,
    icon: <Hammer size={14} strokeWidth={1.5} />,
  })
  return null
}

export function ReabrirConstruccion({ leadId }: { leadId: string }) {
  const { isPending, run } = useStepAction()
  useAccionPrincipal({
    etiqueta: 'Reabrir construcción',
    onClick: () =>
      run(() => reabrirConstruccion(leadId), {
        successToast: 'Construcción reabierta — guiate por el rechazo.',
      }),
    loading: isPending,
    icon: <Hammer size={14} strokeWidth={1.5} />,
  })
  return null
}
