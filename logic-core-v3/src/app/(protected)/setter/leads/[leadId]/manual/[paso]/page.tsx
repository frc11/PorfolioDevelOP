import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { OctagonAlert } from 'lucide-react'
import { Callout } from '@/components/ui'
import { esPantallaId, PANTALLAS, rutaManual } from '@/lib/leados/manual'
import { EstadoManual } from '../_components/estado-manual'
import { M1Contexto, M1Municion, M1Registro } from '../_components/m1-ficha'
import { PantallaManual } from '../_components/pantalla-manual'
import { cargarManualDelLead } from '../_data'

export const metadata: Metadata = {
  title: 'Manual del lead · LeadOS · develOP',
}

export const dynamic = 'force-dynamic'

type PantallaPageProps = {
  params: Promise<{ leadId: string; paso: string }>
}

/**
 * Una pantalla del manual (mapa v1). La GUARDIA es del servidor, no CSS:
 *   - lead ajeno o inexistente → 404 (regla de oro de ownership);
 *   - id de pantalla desconocido → redirect a la actual;
 *   - pantalla no habilitada ni completada (el futuro) → redirect a la actual
 *     — no se renderiza ni como fachada con candado;
 *   - las completadas quedan navegables sin resetear nada.
 */
export default async function PantallaDelManualPage({ params }: PantallaPageProps) {
  const { leadId, paso } = await params
  const manual = await cargarManualDelLead(leadId)
  if (!manual) notFound()

  const { posicion } = manual
  const destinoActual = rutaManual(leadId, posicion.actual)
  if (!esPantallaId(paso)) redirect(destinoActual)

  const accesible =
    posicion.completadas.includes(paso) || posicion.habilitadas.includes(paso)
  if (!accesible) redirect(destinoActual)

  const pantalla = PANTALLAS[paso]

  if (pantalla.tipo === 'estado') {
    return (
      <EstadoManual
        leadId={leadId}
        businessName={manual.lead.businessName}
        tipo={pantalla.id === 'espera' ? 'espera' : 'revision'}
        proximoToque={manual.proximoToque}
        posicion={posicion}
      />
    )
  }

  // Reentrada M-R: la nota de Franco AL FRENTE, antes de la instrucción —
  // checklist y borrador siguen como estaban (el motor los preservó).
  const notaRechazo =
    pantalla.tipo === 'reentrada' && manual.rechazo ? (
      <Callout
        tone="danger"
        accent
        icon={OctagonAlert}
        title={<span className="text-base">Franco pidió correcciones</span>}
        className="p-5 text-sm shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
      >
        <div className="space-y-1.5 leading-relaxed text-zinc-200">
          <p>
            <span className="font-semibold text-rose-200">Qué está mal:</span>{' '}
            {manual.rechazo.motivo}
          </p>
          {manual.rechazo.donde && (
            <p>
              <span className="font-semibold text-rose-200">Dónde:</span>{' '}
              {manual.rechazo.donde}
            </p>
          )}
          {manual.rechazo.arreglo && (
            <p className="whitespace-pre-wrap">
              <span className="font-semibold text-rose-200">Arreglo concreto:</span>{' '}
              {manual.rechazo.arreglo}
            </p>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          Checklist y borrador quedaron como estaban — rehacé lo marcado en las fases y
          volvé a pasar el chequeo final (se reseteó).
        </p>
      </Callout>
    ) : undefined

  // Slots por pantalla migrada — cada módulo m<N>-*.tsx llena los tres del
  // layout-tipo; las pantallas sin migrar muestran los placeholders honestos.
  const slots =
    pantalla.id === 'm1'
      ? {
          contexto: <M1Contexto lead={manual.leadCopy} />,
          municion: <M1Municion />,
          captura: (
            <M1Registro
              leadId={leadId}
              lead={manual.leadCopy}
              ficha={manual.ficha}
              editable={manual.fichaEditable}
            />
          ),
        }
      : {}

  return (
    <PantallaManual
      leadId={leadId}
      businessName={manual.lead.businessName}
      pantalla={pantalla}
      posicion={posicion}
      encabezado={notaRechazo}
      {...slots}
    />
  )
}
