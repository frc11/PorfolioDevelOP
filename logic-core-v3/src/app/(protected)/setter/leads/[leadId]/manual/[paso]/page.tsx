import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  esPantallaId,
  fasesDePantallaConstruccion,
  PANTALLAS,
  rutaManual,
  type PantallaId,
} from '@/lib/leados/manual'
import { causaDeEspera } from '@/lib/leados/turno'
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
  ReentradaMunicion,
} from '../_components/m-construccion'
import { M1Contexto, M1Municion, M1Registro } from '../_components/m1-ficha'
import { M2Contexto, M2Municion, M2Registro } from '../_components/m2-evaluador'
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
 * F2 — Las pantallas donde el setter CORRIGE: el aterrizaje del re-loop, las dos
 * de Construcción, el borrador y el chequeo final. En todas tiene que poder leer
 * qué le pidieron sin salir de donde está trabajando (en m14, además, para
 * verificar contra el pedido antes de reenviar). Fuera de esta lista el bloque no
 * existe: en `revision`/`m15`/`m16` la corrección ya pasó y sería ruido.
 */
const PANTALLAS_DEL_RETRABAJO: readonly PantallaId[] = ['mr', 'mc1', 'mc2', 'm13', 'm14']

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

  // Un destino es alcanzable si la posición derivada lo habilita o lo da por
  // completada — EXACTAMENTE el mismo criterio que la guardia de más arriba usa
  // para decidir si una pantalla se renderiza. Los enlaces que las pantallas
  // ofrecen a OTRAS pantallas se calculan con esto: sin el chequeo, el salto
  // rebota en silencio contra el `redirect` de la guardia (un callejón con un
  // paso más), y sin el enlace el destino se nombra y no se alcanza.
  const alcanzable = (destino: PantallaId) =>
    posicion.completadas.includes(destino) || posicion.habilitadas.includes(destino)

  // El destino de `EnlaceChequeoFinal` lo elige la MISMA rama de `draftUrl` que
  // usa la pieza: con borrador publicado lleva al chequeo (m14), sin él a
  // publicarlo (m13). Se resuelve una vez acá para que las dos superficies que lo
  // sirven —el pie de Construcción y el borrador verificado— no puedan discrepar.
  const chequeoAccesible = alcanzable(manual.draftUrl ? 'm14' : 'm13')

  const pantalla = PANTALLAS[paso]
  // Las fases del checklist que contiene esta pantalla (mc1: las tres que se
  // hacen con el brief; mc2: las tres que se hacen sobre la demo). Lista vacía
  // = no es pantalla de Construcción — el árbol despacha por eso.
  const fasesConstruccion = fasesDePantallaConstruccion(pantalla.id)
  const esConstruccion = fasesConstruccion.length > 0

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
    // La fecha de vuelta de un POSTERGADO viaja en la cabecera —la única
    // superficie común a TODAS las pantallas— porque el postergado aterriza
    // donde lo deje su stage, no siempre en «Registrá lo que pasó».
    reactivateAt: manual.reactivateAt,
    postergadoVencido: manual.postergadoVencido,
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
          // La causa sale de la fuente única — y el turno se deriva de ella, así
          // que la pantalla no puede nombrar un turno y explicar otra cosa.
          // `accionPendiente: false` no es una decisión de esta página: aterrizar
          // en una pantalla de ESTADO es, por construcción de `posicionDe`, no
          // tener nada para hacer ahora.
          causa={causaDeEspera({
            status: manual.leadStatus,
            stage: manual.stage,
            finalUrl: manual.finalUrl,
            accionPendiente: false,
          })}
          proximoToque={manual.proximoToque}
          followUpCount={manual.followUpCount}
          draftUrl={manual.draftUrl}
          posicion={posicion}
        />
        {historial}
      </div>
    )
  }

  // F2 — La nota de Franco AL FRENTE de TODA pantalla del retrabajo, no solo del
  // aterrizaje: hasta este sprint desaparecía al reabrir la construcción (`mr`
  // deja de ser alcanzable) justo cuando el setter empezaba a corregir. Es el
  // MISMO `GuiaRetrabajo` compartido (una sola fuente de la nota, no un Callout
  // por pantalla), con las vueltas anteriores como contexto secundario.
  //
  // El gate por stage es exacto, no aproximado: `rechazos` solo se appendea en
  // EN_REVISION→RECHAZADA y el ÚNICO camino de vuelta a CONSTRUCCION es el
  // re-loop (`LEGAL_TRANSITIONS`), así que rechazo + uno de esos dos stages ⟺
  // hay una corrección en curso. Sin rechazo, `null`: el bloque no existe.
  const guiaRetrabajo =
    manual.rechazo !== null &&
    (manual.stage === 'RECHAZADA' || manual.stage === 'CONSTRUCCION') &&
    PANTALLAS_DEL_RETRABAJO.includes(pantalla.id) ? (
      <GuiaRetrabajo rechazo={manual.rechazo} previos={manual.rechazosPrevios} />
    ) : null

  // 5.6 — Turnaround visible en las fases (el banner del wizard): el negocio
  // respondió y está esperando la demo. Null-safe: sin respuesta no renderiza.
  const encabezado =
    pantalla.tipo === 'reentrada' ? (
      // La reentrada suma el recordatorio de qué preservó y qué reseteó el motor.
      <div className="space-y-2">
        {guiaRetrabajo}
        <p className="px-1 text-xs leading-relaxed text-zinc-400">
          Checklist y borrador quedaron como estaban — rehacé lo marcado en las fases y volvé a
          pasar el chequeo final (se reseteó).
        </p>
      </div>
    ) : esConstruccion ? (
      <>
        {guiaRetrabajo}
        <UrgenciaBanner respondioDesde={manual.respondioDesde} />
      </>
    ) : (
      guiaRetrabajo
    )

  // Slots por pantalla — cada módulo m<N>-*.tsx llena los tres del layout-tipo
  // (todas las pantallas del manual ya están migradas, corte 5.6).
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
            // P4 — pantalla fusionada: el viaje a la herramienta y el registro
            // del veredicto en una sola. La ficha (contexto) sirve a los dos
            // movimientos: se copia para llevarla y queda abierta para
            // transcribir contra ella a la vuelta.
            contexto: <M2Contexto lead={manual.leadCopy} ficha={manual.ficha} />,
            municion: <M2Municion />,
            captura: (
              <M2Registro
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
                  seguimientoAccesible={alcanzable('m5')}
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
            : esConstruccion
              ? {
                  contexto: (
                    <ConstruccionContexto
                      lead={manual.leadCopy}
                      brief={manual.brief}
                      ficha={manual.ficha}
                    />
                  ),
                  municion: <ConstruccionMunicion fases={fasesConstruccion} />,
                  captura: (
                    <ConstruccionRegistro
                      leadId={leadId}
                      fases={fasesConstruccion}
                      completadas={manual.progreso.completadas}
                      stage={manual.stage}
                      draftUrl={manual.draftUrl}
                      escaladoAt={manual.escaladoAt}
                      escaladoNota={manual.escaladoNota}
                      correccionesAccesible={alcanzable('mr')}
                      chequeoAccesible={chequeoAccesible}
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
                    // El bloque copiable de arriba va a Claude Design y `mr` era
                    // la única pantalla de Construcción que no nombraba la
                    // herramienta: se copiaba sin acceso, sin qué esperar y —con
                    // el link sin cargar— sin la salida.
                    municion: <ReentradaMunicion />,
                    // 5.6 — El re-loop necesita SU transición: reabrir la
                    // construcción (RECHAZADA→CONSTRUCCION, action intacta del
                    // wizard). Sin esto, el chequeo final queda futuro para siempre.
                    captura: (
                      <div className="space-y-3">
                        {/* F2 — Antes prometía «el historial de rechazos se
                            conserva», un historial que el setter no veía por
                            ningún lado. Ahora las vueltas anteriores están en el
                            bloque de arriba, y el texto dice lo que de verdad
                            importa: el pedido te acompaña mientras corregís. */}
                        <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
                          Reabrí la construcción para rehacer lo que Franco marcó (lo tenés
                          arriba). Después volvés a publicar el borrador y a pasar el chequeo
                          final antes de reenviar — el pedido te sigue en cada pantalla.
                        </p>
                        <ReabrirConstruccion leadId={leadId} />
                      </div>
                    ),
                  }
                : pantalla.id === 'm13'
                  ? {
                      contexto: <M13Contexto brief={manual.brief} />,
                      // Congelado = RECHAZADA con el borrador publicado: el mismo
                      // estado que el registro dibuja read-only. Sin esto la
                      // munición mandaba a pegar la URL en un campo inexistente.
                      municion: (
                        <M13Municion
                          congelado={manual.stage === 'RECHAZADA' && Boolean(manual.draftUrl)}
                        />
                      ),
                      captura: (
                        <M13Registro
                          leadId={leadId}
                          stage={manual.stage}
                          draftUrl={manual.draftUrl}
                          chequeoAccesible={chequeoAccesible}
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
                                postergadoVencido={manual.postergadoVencido}
                                leadPhone={manual.leadPhone}
                              />
                            ),
                            municion: (
                              <M5Municion
                                leadId={leadId}
                                status={manual.leadStatus}
                                followUpCount={manual.followUpCount}
                                lead={manual.leadCopy}
                                dmsHoy={manual.dmsHoy}
                                agendaAccesible={alcanzable('m16')}
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
                              municion: (
                                <M16Municion status={manual.leadStatus} agenda={manual.agenda} />
                              ),
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
