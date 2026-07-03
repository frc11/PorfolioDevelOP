import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  esPantallaId,
  faseDePantallaConstruccion,
  PANTALLAS,
  rutaManual,
} from '@/lib/leados/manual'
import { GuiaRetrabajo } from '../../_components/guia-retrabajo'
import { EstadoManual } from '../_components/estado-manual'
import {
  ConstruccionContexto,
  ConstruccionMunicion,
  ConstruccionRegistro,
} from '../_components/m-construccion'
import { M1Contexto, M1Municion, M1Registro } from '../_components/m1-ficha'
import { M2Contexto, M2Municion, M2Registro } from '../_components/m2-evaluador'
import { M3Contexto, M3Municion, M3Registro } from '../_components/m3-veredicto'
import { M4Contexto, M4Municion, M4Registro } from '../_components/m4-opener'
import { M6Contexto, M6Municion, M6Registro } from '../_components/m6-brief'
import { M13Contexto, M13Municion, M13Registro } from '../_components/m13-borrador'
import { M14Contexto, M14Municion, M14Registro } from '../_components/m14-chequeo'
import { M15Contexto, M15Municion, M15Registro } from '../_components/m15-envio'
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
  // FaseId de la fase de Construcción detrás de esta pantalla (m7–m12), o null.
  // Narrowea a `FaseId` dentro de la rama de slots — sin non-null assertion.
  const faseConstruccion = faseDePantallaConstruccion(pantalla.id)

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

  // Reentrada M-R: la nota de Franco AL FRENTE, antes de la instrucción. Es el
  // MISMO `GuiaRetrabajo` compartido que muestra el aterrizaje del wizard (una
  // sola fuente de la nota, no un Callout duplicado) + el recordatorio de que el
  // motor preservó checklist y borrador y reseteó el chequeo final.
  const notaRechazo =
    pantalla.tipo === 'reentrada' && manual.rechazo ? (
      <div className="space-y-2">
        <GuiaRetrabajo rechazo={manual.rechazo} />
        <p className="px-1 text-xs leading-relaxed text-zinc-400">
          Checklist y borrador quedaron como estaban — rehacé lo marcado en las fases y volvé a
          pasar el chequeo final (se reseteó).
        </p>
      </div>
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
      : pantalla.id === 'm2'
        ? {
            contexto: <M2Contexto lead={manual.leadCopy} ficha={manual.ficha} />,
            municion: <M2Municion />,
            captura: <M2Registro leadId={leadId} evaluada={manual.evaluacion !== null} />,
          }
        : pantalla.id === 'm3'
          ? {
              contexto: <M3Contexto lead={manual.leadCopy} ficha={manual.ficha} />,
              municion: <M3Municion />,
              captura: (
                <M3Registro
                  leadId={leadId}
                  leadStatus={manual.leadStatus}
                  caliente={manual.caliente}
                  evaluacion={manual.evaluacion}
                  descartado={manual.stage === 'DESCARTADA'}
                />
              ),
            }
          : pantalla.id === 'm4'
            ? {
                contexto: (
                  <M4Contexto
                    lead={manual.leadCopy}
                    ficha={manual.ficha}
                    evaluacion={manual.evaluacion}
                  />
                ),
                municion: <M4Municion />,
                captura: (
                  <M4Registro
                    leadId={leadId}
                    openerEnviado={manual.openerEnviado}
                    ultimoContacto={manual.ultimoContacto}
                    proximoToque={manual.proximoToque}
                  />
                ),
              }
            : pantalla.id === 'm6'
              ? {
                  contexto: (
                    <M6Contexto
                      lead={manual.leadCopy}
                      ficha={manual.ficha}
                      evaluacion={manual.evaluacion}
                    />
                  ),
                  municion: <M6Municion />,
                  captura: (
                    <M6Registro
                      leadId={leadId}
                      businessName={manual.lead.businessName}
                      brief={manual.brief}
                      capturando={manual.stage === 'EVALUADA'}
                    />
                  ),
                }
              : faseConstruccion
                ? {
                    contexto: (
                      <ConstruccionContexto
                        lead={manual.leadCopy}
                        brief={manual.brief}
                        ficha={manual.ficha}
                      />
                    ),
                    municion: <ConstruccionMunicion faseId={faseConstruccion} />,
                    captura: (
                      <ConstruccionRegistro
                        leadId={leadId}
                        faseId={faseConstruccion}
                        titulo={pantalla.corto}
                        completadas={manual.progreso.completadas}
                      />
                    ),
                  }
                : pantalla.id === 'mr'
                  ? {
                      // Reentrada: el brief re-servido para retrabajar contra él
                      // (las fases se alcanzan por `NavConstruccion`); la nota de
                      // Franco va como `encabezado`, arriba de la instrucción.
                      contexto: (
                        <ConstruccionContexto
                          lead={manual.leadCopy}
                          brief={manual.brief}
                          ficha={manual.ficha}
                        />
                      ),
                    }
                  : pantalla.id === 'm13'
                    ? {
                        contexto: <M13Contexto brief={manual.brief} />,
                        municion: <M13Municion />,
                        captura: (
                          <M13Registro
                            leadId={leadId}
                            stage={manual.stage}
                            draftUrl={manual.draftUrl}
                          />
                        ),
                      }
                    : pantalla.id === 'm14'
                      ? {
                          contexto: (
                            <M14Contexto draftUrl={manual.draftUrl} brief={manual.brief} />
                          ),
                          municion: <M14Municion />,
                          captura: (
                            <M14Registro
                              leadId={leadId}
                              stage={manual.stage}
                              draftUrl={manual.draftUrl}
                              selfCheck={manual.selfCheck}
                              brief={manual.brief}
                            />
                          ),
                        }
                      : pantalla.id === 'm15'
                        ? {
                            contexto: <M15Contexto finalUrl={manual.finalUrl} />,
                            municion: <M15Municion />,
                            captura: (
                              <M15Registro
                                leadId={leadId}
                                lead={manual.leadCopy}
                                stage={manual.stage}
                                status={manual.leadStatus}
                                caliente={manual.caliente}
                                finalUrl={manual.finalUrl}
                                demoEnviadaAt={manual.demoEnviadaAt}
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
