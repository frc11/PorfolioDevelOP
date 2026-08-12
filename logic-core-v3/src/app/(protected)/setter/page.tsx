import type { Metadata } from 'next'
import { Radar } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { requireSetter } from '@/lib/auth-guards'
import { seleccionarFoco } from '@/lib/leados/foco'
import { leerFocoLeadId } from '@/lib/leados/foco-cookie'
import { particionarCartera } from '@/lib/leados/flow'
import { buildHomeLeads } from '@/lib/leados/home'
import { derivarMisNumeros } from '@/lib/leados/mis-numeros'
import { getNovedadesSetter } from '@/lib/leados/novedades'
import { listOwnedLeads } from '@/lib/leados/ownership'
import { getProgresoSemana } from '@/lib/leados/progreso'
import { turnoDelLead, type Turno } from '@/lib/leados/turno'
import { CarteraView } from './_components/cartera-view'
import { FocoSurface } from './_components/foco-surface'
import { HomeEmpty } from './_components/home-empty'
import { HomeEnEspera } from './_components/home-en-espera'
import { MisNumeros } from './_components/mis-numeros'
import { NovedadesPanel } from './_components/novedades-panel'
import { ProgresoSemana } from './_components/progreso-semana'

export const metadata: Metadata = {
  title: 'LeadOS · develOP',
}

export const dynamic = 'force-dynamic'

export default async function SetterHomePage() {
  const userId = await requireSetter()
  const leads = await listOwnedLeads(userId)
  const homeLeads = buildHomeLeads(leads)

  // Modo dirección (2.1a): el home entrega UN lead accionable por vez. La cola
  // "trabajar" ya viene ordenada (A-05: fijado primero, después respondió →
  // caliente → resto); `seleccionarFoco` elige cuál es el foco respetando el
  // sticky (D7) que dejó la cookie.
  const particion = particionarCartera(homeLeads)
  const stickyId = await leerFocoLeadId()
  const foco = seleccionarFoco(particion.grupos.trabajar, stickyId)

  // 2.1b — "todo en espera": cuando no hay foco (cola `trabajar` vacía) pero sí
  // hay leads, mostramos dónde quedó el trabajo. Las tres cuentas son DISJUNTAS
  // por construcción de la partición: `enEspera` = en vuelo no accionable
  // (seguimiento/revisión/agendadas); `pausados` = los que el setter pausó;
  // `fijados` = fijados NO accionables (A-05: el fijado accionable ya es foco —
  // no llega acá; el pin ordena la cola, no la excluye. Un fijado en vuelo sí
  // queda esperando y se cuenta para no afirmar "0 leads activos").
  //
  // El desglose es POR TURNO (`turno.ts`, fuente única): hasta P11 esto era un
  // solo número rotulado «esperando respuesta», que contaba también las demos
  // paradas en la cola de Franco. La partición ya garantiza que nada de acá es
  // accionable — el turno traduce esa decisión, no la vuelve a tomar.
  const enVuelo = [
    ...particion.grupos.seguimiento,
    ...particion.grupos.revision,
    ...particion.grupos.agendadas,
  ]
  const enVueloPorTurno: Record<Turno, number> = { negocio: 0, franco: 0, setter: 0 }
  for (const lead of enVuelo) {
    const turno = turnoDelLead({
      status: lead.status,
      stage: lead.stage,
      accionPendiente: lead.accionable,
    })
    enVueloPorTurno[turno] += 1
  }
  const pausados = particion.pausados.length
  const fijados = particion.fijados.length

  // Números propios del setter: derivados de los MISMOS leads ya cargados (cero
  // queries nuevas), aislados por construcción (la cartera ya filtra por dueño).
  const misNumeros = derivarMisNumeros(leads, userId)
  // Ambas lecturas reusan los leads ya cargados (no se le pega de nuevo a la
  // cartera): las novedades dirigidas y la señal de avance. En paralelo — son
  // independientes entre sí.
  // 2.2 — los avisos se deduplican contra el foco: si una novedad apunta al lead
  // que YA es el protagonista (arriba), no se muestra dos veces. Sin foco
  // (en-espera / vacío) no hay a quién deduplicar → se muestran todos.
  const [novedades, progreso] = await Promise.all([
    getNovedadesSetter(userId, leads, { excludeLeadId: foco.foco?.id ?? null }),
    getProgresoSemana(userId, leads),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="LeadOS"
        title="Tu día"
        description="Un lead a la vez: el que toca ahora, con su próximo paso y por qué."
        icon={Radar}
      />

      {/* El foco es el protagonista: un negocio accionable a la vez (2.1). Si no
          hay accionables, el "todo en espera" reemplaza al foco (no al home).
          B6.5: va PRIMERO —pegado al header— para que su CTA ("Ir a trabajarlo" /
          "Cargar prospecto") quede sobre el fold. */}
      {homeLeads.length === 0 ? (
        <HomeEmpty />
      ) : foco.foco ? (
        <FocoSurface
          foco={foco.foco}
          proximo={foco.proximo}
          restantes={foco.restantes}
          total={foco.total}
          stickyActivo={foco.stickyActivo}
        />
      ) : (
        <HomeEnEspera
          enVueloPorTurno={enVueloPorTurno}
          pausados={pausados}
          fijados={fijados}
        />
      )}

      {/* 2.2 / A-06 — Secundario al foco pero presente: los handoffs recientes
          INFORMAN, y su "Abrir" ANCLA el lead como foco (mismo mecanismo que "Ir a
          trabajarlo"), no es un atajo que reconstituye una cola paralela.
          Deduplicado contra el foco. Vive fuera del branch de leads: un saliente
          sin cartera igual ve "te sacaron el lead". */}
      <NovedadesPanel novedades={novedades} />

      {homeLeads.length > 0 && (
        <>
          {/* La cartera completa queda accesible pero secundaria (colapsada). */}
          <CarteraView leads={homeLeads} />

          {/* Reflexivo y secundario: los números propios van al pie. */}
          <MisNumeros numeros={misNumeros} />
        </>
      )}

      {/* Acuse sobrio del laburo reciente — reflexivo, al pie, no compite. */}
      <ProgresoSemana progreso={progreso} />
    </div>
  )
}
