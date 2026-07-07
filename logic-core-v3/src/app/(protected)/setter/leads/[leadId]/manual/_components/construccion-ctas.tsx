'use client'

import { Hammer } from 'lucide-react'
import { Button } from '@/components/ui'
import { useStepAction } from '@/lib/use-step-action'
import {
  iniciarConstruccion,
  reabrirConstruccion,
} from '@/app/(protected)/setter/_actions/dossier.actions'

/**
 * 5.6 — Las dos transiciones de Construcción que vivían SOLO en el wizard
 * (`construccion-step`) y que el corte trae al manual, con las MISMAS actions
 * intactas (ownership + guardia de stage server-side; el motor no se toca):
 *   - `iniciarConstruccion` (BRIEF→CONSTRUCCION): sin esto el borrador (m13)
 *     nunca se habilita — el registro del draft exige CONSTRUCCION;
 *   - `reabrirConstruccion` (RECHAZADA→CONSTRUCCION): el re-loop del rechazo —
 *     el chequeo final (m14) queda futuro hasta reabrir.
 * `useStepAction` refresca la ruta tras el éxito y la posición se re-deriva sola.
 */

export function ArrancarConstruccion({ leadId }: { leadId: string }) {
  const { isPending, run } = useStepAction()
  return (
    <Button
      onClick={() =>
        run(() => iniciarConstruccion(leadId), {
          successToast: 'Construcción arrancada — seguí la guía.',
        })
      }
      loading={isPending}
      icon={<Hammer size={14} strokeWidth={1.5} />}
    >
      Arrancar construcción
    </Button>
  )
}

export function ReabrirConstruccion({ leadId }: { leadId: string }) {
  const { isPending, run } = useStepAction()
  return (
    <Button
      onClick={() =>
        run(() => reabrirConstruccion(leadId), {
          successToast: 'Construcción reabierta — guiate por el rechazo.',
        })
      }
      loading={isPending}
      icon={<Hammer size={14} strokeWidth={1.5} />}
    >
      Reabrir construcción
    </Button>
  )
}
