import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  ofreceSalida,
  rutaManual,
  type PantallaDef,
  type PosicionManual,
} from '@/lib/leados/manual'
import { ManualHeader, NavConstruccion, type CabeceraLead } from './manual-nav'
import { BarraAccion, ProveedorAccion } from './barra-accion'
import { FranjaRecorrido } from './franja-recorrido'

/**
 * Zona-slot del layout-tipo. Todas las pantallas del manual están migradas
 * (corte 5.6): las tres zonas siempre llegan con contenido real, así que acá
 * solo se enmarca — sin contenido no se renderiza nada (mismo criterio que ya
 * usaba la reentrada para sus zonas vacías, P3#10).
 *
 * P17 — deja de ser una TARJETA y pasa a ser una BANDA. Era
 * `rounded-2xl border bg p-4`, y con la instrucción arriba (otra tarjeta) el
 * setter miraba hasta cuatro superficies anidadas antes de llegar a un campo:
 * página → tarjeta de zona → sub-tarjeta del contenido → campos. Las dos
 * primeras zonas no aportaban nada que el rótulo y el espacio no aporten, y su
 * `p-4` costaba 32 px verticales cada una encima del pliegue.
 *
 * La única que conserva tarjeta es el bloque de trabajo (`destacada`): es la
 * regla del sistema —una sola cosa lleva tarjeta, el bloque activo— y de paso
 * es lo que hace que se lo encuentre de un vistazo al volver a la pantalla.
 */
function Zona({
  etiqueta,
  children,
  destacada = false,
  acentuada = false,
}: {
  etiqueta: string
  children?: ReactNode
  /** El bloque de trabajo: la ÚNICA zona que lleva tarjeta. */
  destacada?: boolean
  /** …y el único acento de color de la pantalla, cuando es el paso de ahora. */
  acentuada?: boolean
}) {
  if (!children) return null
  return (
    <section
      aria-label={etiqueta}
      className={cn(
        destacada &&
          'rounded-2xl border p-4 sm:p-5 ' +
            (acentuada
              ? 'border-cyan-400/25 bg-cyan-500/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
              : 'border-white/10 bg-white/[0.03]'),
      )}
    >
      <p
        className={cn(
          'text-[11px] font-medium',
          // S7 — el rótulo que pide ACCIÓN se distingue; los otros dos bajan de
          // peso Y salen de la versalita. Antes eran tres versalitas del mismo
          // tono y el mismo peso compitiendo entre sí, cuando sólo una nombra
          // algo para hacer: el ojo no tenía dónde ir primero.
          destacada
            ? 'uppercase tracking-[0.18em] text-zinc-300'
            : 'text-zinc-600',
        )}
      >
        {etiqueta}
      </p>
      {/* `data-zona="contenido"` separa el CONTENIDO de la banda de su rótulo:
          es lo que deja medir —y fijar con un test— cuánto pone el layout-tipo
          por encima del bloque de trabajo sin que el contenido de la pantalla
          contamine el número (`scripts/qa-corridas/medir-pliegue-manual.ts`). */}
      <div data-zona="contenido" className="mt-2">
        {children}
      </div>
    </section>
  )
}

type PantallaManualProps = {
  leadId: string
  /** El contexto de cabecera del lead (5.6) — badges, links, notas, asignación. */
  cabecera: CabeceraLead
  pantalla: PantallaDef
  posicion: PosicionManual
  /** Reentrada M-R: la nota de Franco va AL FRENTE, antes de la instrucción. */
  encabezado?: ReactNode
  /** Slots del layout-tipo — las pantallas reales los llenan al migrar. */
  contexto?: ReactNode
  municion?: ReactNode
  captura?: ReactNode
  /**
   * P19 — El nodo que SOLO declara la acción principal (`useAccionPrincipal`) y
   * no renderiza nada, para la pantalla que no tiene bloque de trabajo propio.
   *
   * Existe por `mr`: su única interacción es el botón, y desde P18 el botón vive
   * en la barra. Lo que quedaba en la zona de Registro era un párrafo solo
   * dentro de la tarjeta acentuada —la superficie con la que el layout-tipo dice
   * «acá se trabaja»— sin un control adentro. La zona se disuelve; el declarador
   * se monta acá, hermano de las zonas, sin pintar nada.
   */
  accion?: ReactNode
}

/**
 * El layout-tipo de pantalla del manual (Bloque 4): una pantalla = una tarea
 * atómica con su instrucción corta, su contexto re-servido, su munición
 * (bloque copiable / link externo), su captura y su avance. Arriba de todo, la
 * franja del recorrido (P20): dónde está el lead entre los nueve pasos, qué
 * quedó hecho y qué falta. Solo presentación: la posición viene derivada del
 * server y los gates reales viven en el motor.
 */
export function PantallaManual({
  leadId,
  cabecera,
  pantalla,
  posicion,
  encabezado,
  contexto,
  municion,
  captura,
  accion,
}: PantallaManualProps) {
  const esActual = pantalla.id === posicion.actual
  // C-17: el cyan "Tu paso ahora" se reserva a lo accionable (disciplina B9). Un
  // `actual` con `habilitadas` vacía es una pantalla terminal (DESCARTADA en m2,
  // agendada en m16): sigue siendo la actual (para el guard de la página y la
  // salida "Ir a tu paso"), pero NO es un paso para trabajar → tono zinc, sin cyan.
  const esPasoActivo = esActual && posicion.habilitadas.length > 0
  const completada = posicion.completadas.includes(pantalla.id)
  const esConstruccion = pantalla.fase === 'construccion'

  return (
    // P18 — el proveedor envuelve TODO el contenido de la pantalla: la barra
    // es hermana de las zonas (hija directa de la raíz) para que su `sticky`
    // valga en cualquier posición del scroll, y los formularios del Registro
    // le declaran su acción desde adentro sin que su estado local tenga que
    // subir hasta acá.
    <ProveedorAccion>
      <div className="space-y-4">
        <ManualHeader cabecera={cabecera} />

        {encabezado && <div data-slot="encabezado">{encabezado}</div>}

        {/* P20 — el recorrido entero, en el mismo lugar en las catorce: entre la
            cabecera y el título de la pantalla. Reemplaza al rótulo con el
            nombre de la fase que vivía en la fila de abajo (decía dónde estabas
            y nada más) y a la tira de completadas del pie (decía el pasado).
            Va pegada a la instrucción —`space-y-2`, no el `space-y-4` de la
            raíz— porque juntas son una sola cosa: dónde estás y qué hacer acá. */}
        <div className="space-y-2">
          <FranjaRecorrido leadId={leadId} posicion={posicion} pantalla={pantalla.id} />

          {/* La instrucción — protagonista, y desde P17 una BANDA, no una tarjeta.
              El `p-5` de la tarjeta costaba 40 px verticales en las catorce sin
              decir nada que el título no diga; el filo de color sobrevive porque es
              lo que marca «éste es tu paso», y ahora es lo único que lo marca acá
              (el acento pleno se mudó al bloque de trabajo — S5). */}
          <section
            aria-label="Instrucción de esta pantalla"
            className={cn(
              'border-l-2 pl-3.5',
              esPasoActivo ? 'border-white/25' : 'border-white/10',
            )}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {pantalla.tipo === 'reentrada' && (
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-rose-300/80">
                  Reentrada — correcciones de Franco
                </p>
              )}
              {esPasoActivo ? (
                <Badge tone="cyan" variant="soft">
                  Tu paso ahora
                </Badge>
              ) : completada ? (
                <Badge tone="emerald" variant="soft">
                  Completada
                </Badge>
              ) : (
                <Badge tone="zinc" variant="outline">
                  Disponible
                </Badge>
              )}
            </div>

            {/* h2: con el corte 5.6 el h1 de la página es el negocio (cabecera). */}
            <h2 className="mt-1 text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
              {pantalla.titulo}
            </h2>
            {pantalla.detalle && (
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">
                {pantalla.detalle}
              </p>
            )}
          </section>
        </div>

        {/* Las tres zonas del layout-tipo — slots que las pantallas reales llenan.
            Zona no renderiza nada sin contenido (reentrada y cualquier slot vacío).
            Sólo el Registro lleva tarjeta: es el bloque de trabajo. */}
        <Zona etiqueta="Contexto del lead">{contexto}</Zona>
        <Zona etiqueta="Munición">{municion}</Zona>
        <Zona etiqueta="Registro" destacada acentuada={esPasoActivo}>
          {captura}
        </Zona>
        {/* Declara la acción de la barra sin zona propia — ver `accion`. */}
        {accion}

        {/* Avance: si no estás parado en tu paso, la salida corta es volver a él
            — salvo que sea el paso actual el que te mandó acá. Ese caso (P23) es
            el ciclo: `espera` ofrece «Registralo» → m5, y m5 ofrecía «Ir a tu
            paso actual» → espera, que vuelve a ofrecer m5. Las dos puntas eran
            correctas por separado; el ciclo lo hacía la composición. La que se
            va es la VUELTA, no la ida: el setter entró a m5 a registrar algo y
            m5 conserva su acción, su franja y «Volver a tu día». */}
        {!esActual && !ofreceSalida(posicion.actual, pantalla.id, posicion) && (
          <section
            aria-label="Avance"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4"
          >
            <p className="text-xs leading-relaxed text-zinc-500">
              {completada
                ? 'Esta pantalla ya quedó hecha — mirala tranquilo, no se resetea nada.'
                : 'Esta pantalla está disponible — tu paso de ahora es otro.'}
            </p>
            <Link
              href={rutaManual(leadId, posicion.actual)}
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20"
            >
              Ir a tu paso actual
              <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
            </Link>
          </section>
        )}

        {esConstruccion && (
          <NavConstruccion leadId={leadId} pasoActivo={pantalla.id} posicion={posicion} />
        )}

        {/* P20 — la tira de completadas del pie ya no está: lo hecho vive en la
            franja de arriba, con lo que falta al lado y sin costar 91 px al pie
            de las catorce. Los saltos hacia atrás siguen libres — son los mismos
            destinos, con el mismo criterio de alcance. */}

        {/* La acción principal. Va ÚLTIMA en el DOM a propósito: el rango de
            un `sticky` termina en el borde de su padre, así que sólo siendo
            hija directa de la raíz queda a la vista en todo el recorrido del
            scroll. Si la pantalla no declaró acción, no se pinta nada. */}
        <BarraAccion />
      </div>
    </ProveedorAccion>
  )
}
