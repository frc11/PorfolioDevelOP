import type { Metadata } from 'next'
import { Radar } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { requireSetter } from '@/lib/auth-guards'
import { armarCola, idsEnCola } from '@/lib/leados/cola'
import { seleccionarFoco } from '@/lib/leados/foco'
import { leerFocoLeadId } from '@/lib/leados/foco-cookie'
import { contarEnVueloPorTurno, particionarCartera } from '@/lib/leados/flow'
import { buildHomeLeads } from '@/lib/leados/home'
import { derivarMisNumeros } from '@/lib/leados/mis-numeros'
import { getNovedadesSetter } from '@/lib/leados/novedades'
import { listOwnedLeads } from '@/lib/leados/ownership'
import { getProgresoSemana } from '@/lib/leados/progreso'
import { CarteraView } from './_components/cartera-view'
import { ColaDelDia } from './_components/cola-del-dia'
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

  // Modo dirección (2.1a) + LA COLA (P21). La cola "trabajar" ya viene ordenada
  // (A-05: fijado primero, después respondió → caliente → resto);
  // `seleccionarFoco` elige cuál la encabeza respetando el sticky (D7) que dejó
  // la cookie, y `armarCola` la arma con ese lead PRIMERO.
  //
  // Hasta P21 `grupos.trabajar` tenía UN consumidor —`seleccionarFoco`— y
  // ninguna superficie: de 49 leads accionables el panel mostraba 1, y las
  // tareas más urgentes del embudo (una demo aprobada esperando el link, un
  // rechazo esperando retrabajo) vivían como AVISOS en un bloque pasivo mientras
  // el foco apuntaba a otro negocio. La cola no cambia el criterio ni el orden:
  // renderiza el grupo que ya existía.
  const particion = particionarCartera(homeLeads)
  const stickyId = await leerFocoLeadId()
  const foco = seleccionarFoco(particion.grupos.trabajar, stickyId)
  const cola = armarCola(foco.foco, foco.resto)

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
  //
  // El conteo es una FUNCIÓN (`contarEnVueloPorTurno`, flow.ts) y no un bucle
  // acá: armado a mano, este bloque le pasaba al turno tres campos y se olvidaba
  // de `finalUrl`, así que las demos aprobadas sin el link de Franco figuraban
  // como «esperando al negocio». Un conteo dentro del componente no lo puede
  // afirmar ningún chequeo; una función sí.
  const enVuelo = [
    ...particion.grupos.seguimiento,
    ...particion.grupos.revision,
    ...particion.grupos.agendadas,
  ]
  const enVueloPorTurno = contarEnVueloPorTurno(enVuelo)
  const pausados = particion.pausados.length
  const fijados = particion.fijados.length

  // Números propios del setter: derivados de los MISMOS leads ya cargados (cero
  // queries nuevas), aislados por construcción (la cartera ya filtra por dueño).
  const misNumeros = derivarMisNumeros(leads, userId)
  // Ambas lecturas reusan los leads ya cargados (no se le pega de nuevo a la
  // cartera): las novedades dirigidas y la señal de avance. En paralelo — son
  // independientes entre sí.
  // 2.2 / P21 — los avisos se deduplican contra LA COLA: si una novedad apunta a
  // un lead que YA aparece como tarea (arriba), no se muestra dos veces. Hasta
  // P21 el dedup era contra un solo lead —el foco— porque la cola no se
  // renderizaba; con la cola dibujada, ese dedup dejaba entrar exactamente la
  // duplicación que este sprint prohíbe (el aviso abajo y la tarea arriba).
  // Se excluye lo VISIBLE en la cola, no el grupo `trabajar` entero: un
  // accionable que no entró conserva su aviso en vez de desaparecer de las dos
  // superficies. Sin cola (en-espera / vacío) no hay a quién deduplicar.
  const [novedades, progreso] = await Promise.all([
    getNovedadesSetter(userId, leads, { excludeLeadIds: idsEnCola(cola) }),
    getProgresoSemana(userId, leads),
  ])

  return (
    <div className="space-y-8">
      {/* P21 — sin eyebrow y sin subtítulo. El eyebrow escribía «LeadOS» a tres
          centímetros del «LeadOS» del topbar, y el subtítulo le explicaba el
          producto («Un lead a la vez: el que toca ahora…») a alguien que lo abre
          todos los días: la primera pantalla del uso diario no es el lugar donde
          se presenta la herramienta. El título queda. */}
      <PageHeader title="Tu día" icon={Radar} />

      {/* LA COLA DE HOY va PRIMERO, antes de cualquier bloque informativo: es el
          trabajo del día, con el foco como su primer ítem destacado. Si no hay
          nada accionable, el "todo en espera" ocupa su lugar (2.1b) — la cola
          vacía no queda en blanco. */}
      {homeLeads.length === 0 ? (
        <HomeEmpty />
      ) : cola.items.length > 0 ? (
        <ColaDelDia cola={cola} proximo={foco.proximo} stickyActivo={foco.stickyActivo} />
      ) : (
        <HomeEnEspera
          enVueloPorTurno={enVueloPorTurno}
          pausados={pausados}
          fijados={fijados}
        />
      )}

      {homeLeads.length > 0 && (
        /* La cartera completa queda accesible pero secundaria (colapsada). */
        <CarteraView leads={homeLeads} />
      )}

      {/* 2.2 / A-06 / P21 — NOTICIAS, después de la cola y de la cartera. Lo que
          exige una acción ya subió a la cola y no se repite acá (dedup por
          `excludeLeadIds`); lo que queda informa. Su "Abrir" ANCLA el lead como
          foco (mismo mecanismo que "Ir a trabajarlo"), no es un atajo que
          reconstituye una cola paralela. Vive fuera del branch de leads: un
          saliente sin cartera igual ve "te sacaron el lead". */}
      <NovedadesPanel novedades={novedades} />

      {/* Reflexivo y secundario: los números propios van al pie. */}
      {homeLeads.length > 0 && <MisNumeros numeros={misNumeros} />}

      {/* Acuse sobrio del laburo reciente — reflexivo, al pie, no compite. */}
      <ProgresoSemana progreso={progreso} />
    </div>
  )
}
