import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  esPantallaId,
  faseDePantallaConstruccion,
  PANTALLAS,
  rutaManual,
} from '@/lib/leados/manual'
import { GuiaRetrabajo } from '../../_components/guia-retrabajo'
import { UrgenciaBanner } from '../../_components/urgencia-banner'
import { ArchivoManual } from '../_components/archivo-manual'
import { ReabrirConstruccion } from '../_components/construccion-ctas'
import { EstadoManual } from '../_components/estado-manual'
import { HistorialDelLead } from '../_components/historial-lead'
import {
  ConstruccionContexto,
  ConstruccionMunicion,
  ConstruccionRegistro,
} from '../_components/m-construccion'
import { M1Contexto, M1Municion, M1Registro } from '../_components/m1-ficha'
import { M2Contexto, M2Municion, M2Registro } from '../_components/m2-evaluador'
import { M3Contexto, M3Municion, M3Registro } from '../_components/m3-veredicto'
import { M4Contexto, M4Municion, M4Registro } from '../_components/m4-opener'
import { M5Contexto, M5Municion, M5Registro } from '../_components/m5-seguimiento'
import { M6Contexto, M6Municion, M6Registro } from '../_components/m6-brief'
import { M13Contexto, M13Municion, M13Registro } from '../_components/m13-borrador'
import { M14Contexto, M14Municion, M14Registro } from '../_components/m14-chequeo'
import { M15Contexto, M15Municion, M15Registro } from '../_components/m15-envio'
import { M16Contexto, M16Municion, M16Registro } from '../_components/m16-agenda'
import type { CabeceraLead } from '../_components/manual-nav'
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

  // 5.6 — El contexto de cabecera que la página del wizard mostraba: badges,
  // links externos, notas y el rastro de asignación. El manual ES la experiencia.
  const cabecera: CabeceraLead = {
    lead: manual.leadCopy,
    status: manual.leadStatus,
    stage: manual.stage,
    caliente: manual.calienteBadge,
    contactName: manual.contactName,
    phone: manual.leadPhone,
    notas: manual.notas,
    asignadoEl: manual.asignadoEl,
  }

  // 5.6 — La memoria del lead, al pie de toda pantalla (colapsable).
  const historial = <HistorialDelLead events={manual.timeline} />

  if (pantalla.tipo === 'estado') {
    // 2.3 — El archivo es una pantalla de estado más (patrón espera/revisión),
    // pero de CIERRE: read-only, sin toque. Causa y motivo se derivan con la
    // MISMA regla que el home (`archivoMotivo`): DESCARTADA → motivoDescarte del
    // veredicto; PERDIDO → nota post-reunión de Franco (opcional).
    if (pantalla.id === 'archivo') {
      const causa = manual.stage === 'DESCARTADA' ? 'descartado' : 'perdido'
      const motivo =
        causa === 'descartado'
          ? (manual.evaluacion?.motivoDescarte ?? null)
          : (manual.agenda?.resultado?.nota ?? null)
      return (
        <div className="space-y-5">
          <ArchivoManual cabecera={cabecera} causa={causa} motivo={motivo} />
          {historial}
        </div>
      )
    }
    return (
      <div className="space-y-5">
        <EstadoManual
          leadId={leadId}
          cabecera={cabecera}
          tipo={pantalla.id === 'espera' ? 'espera' : 'revision'}
          proximoToque={manual.proximoToque}
          posicion={posicion}
        />
        {historial}
      </div>
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

  // 5.6 — Turnaround visible en las fases (el banner del wizard): el negocio
  // respondió y está esperando la demo. Null-safe: sin respuesta no renderiza.
  const encabezado =
    pantalla.tipo === 'reentrada' ? (
      notaRechazo
    ) : faseConstruccion ? (
      <UrgenciaBanner respondioDesde={manual.respondioDesde} />
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
                municion: <M4Municion dmsHoy={manual.dmsHoy} />,
                captura: (
                  <M4Registro
                    leadId={leadId}
                    openerEnviado={manual.openerEnviado}
                    ultimoContacto={manual.ultimoContacto}
                    proximoToque={manual.proximoToque}
                    openerTexto={manual.openerTexto}
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
                      stage={manual.stage}
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
                        stage={manual.stage}
                        escaladoAt={manual.escaladoAt}
                        escaladoNota={manual.escaladoNota}
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
                      // 5.6 — El re-loop necesita SU transición: reabrir la
                      // construcción (RECHAZADA→CONSTRUCCION, action intacta del
                      // wizard). Sin esto, el chequeo final queda futuro para siempre.
                      captura: (
                        <div className="space-y-3">
                          <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
                            Reabrí la construcción para rehacer lo que Franco marcó (lo tenés
                            arriba). Después volvés a publicar el borrador y a pasar el chequeo
                            final antes de reenviar — el historial de rechazos se conserva.
                          </p>
                          <ReabrirConstruccion leadId={leadId} />
                        </div>
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
                        : pantalla.id === 'm5'
                          ? {
                              contexto: (
                                <M5Contexto
                                  status={manual.leadStatus}
                                  followUpCount={manual.followUpCount}
                                  proximoToque={manual.proximoToque}
                                  reactivateAt={manual.reactivateAt}
                                  leadPhone={manual.leadPhone}
                                />
                              ),
                              municion: (
                                <M5Municion
                                  status={manual.leadStatus}
                                  followUpCount={manual.followUpCount}
                                  lead={manual.leadCopy}
                                  dmsHoy={manual.dmsHoy}
                                />
                              ),
                              captura: (
                                <M5Registro
                                  leadId={leadId}
                                  followUpCount={manual.followUpCount}
                                  ultimoToque={manual.ultimoToque}
                                />
                              ),
                            }
                          : pantalla.id === 'm16'
                            ? {
                                contexto: (
                                  <M16Contexto
                                    status={manual.leadStatus}
                                    leadPhone={manual.leadPhone}
                                  />
                                ),
                                municion: <M16Municion />,
                                captura: (
                                  <M16Registro
                                    leadId={leadId}
                                    status={manual.leadStatus}
                                    ficha={manual.ficha}
                                    agenda={manual.agenda}
                                    contactName={manual.contactName}
                                    leadEmail={manual.leadEmail}
                                    leadPhone={manual.leadPhone}
                                  />
                                ),
                              }
                            : {}

  return (
    <div className="space-y-5">
      <PantallaManual
        leadId={leadId}
        cabecera={cabecera}
        pantalla={pantalla}
        posicion={posicion}
        encabezado={encabezado}
        {...slots}
      />
      {historial}
    </div>
  )
}
