import type { LeadStatus } from '@prisma/client'
import { ExternalLink, GraduationCap } from 'lucide-react'
import type { Evaluacion, Ficha } from '@/lib/leados/contracts'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'
import { GUIA_EVALUACION } from '@/lib/leados/guidance-content'
import { FichaEjemplo } from '@/app/(protected)/setter/_components/ejemplo-ideal'
import {
  EvaluacionForm,
  EvaluacionResumen,
  type EvaluacionTextos,
} from '../../_components/evaluacion-form'
import { FichaForm } from '../../_components/ficha-form'
import { FichaStep } from '../../_components/ficha-step'

/**
 * M1 — «Mirá el negocio y decidí si vale una demo». La pantalla fusionada.
 *
 * D15-bis juntó acá lo que eran dos pantallas del MISMO stage (`FICHA`): cargar
 * la ficha (m1) y registrar el veredicto (m2). No es un reordenamiento
 * cosmético: m2 pedía transcribir la salida de un chat de evaluación externo, y
 * ese chat no tiene link cargado — sus tres campos son obligatorios porque
 * sostienen el gate, así que el recorrido del setter novato frenaba ahí sin
 * forma honesta de seguir. Ahora el veredicto es SUYO, y sale de la ficha que
 * acaba de cargar: por eso las dos mitades tienen que estar a la vista juntas.
 *
 * Lo que NO cambió: la etapa `EVALUADA`, la transición `FICHA→EVALUADA`, el
 * contrato persistido (`EvaluacionSchema`) y el camino de escritura
 * (`registrarEvaluacion`, con su gate de señal mínima server-side). Cambió de
 * dónde sale el dato, no su forma ni quién lo guarda.
 *
 * Los tres slots del layout-tipo (`PantallaManual`):
 *   - contexto: identidad + links del alta (lo que se sale a observar);
 *   - munición: la ficha ejemplar + en qué fijarse para puntuar;
 *   - registro: la ficha (viva o congelada) y, debajo, el veredicto que cierra
 *     el paso — en ese orden, porque el segundo se decide mirando el primero.
 */

/** Contexto: lo capturado en el alta que esta tarea necesita para observar. */
export function M1Contexto({ lead }: { lead: CopyBlockLead }) {
  const meta = [lead.industry, lead.zone].filter(Boolean).join(' · ')
  const links = [
    { label: 'Instagram', href: lead.instagramUrl },
    { label: 'Web actual', href: lead.currentWebUrl },
    { label: 'Google Maps', href: lead.googleMapsUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href))

  if (!meta && links.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        El alta no trajo links — buscá {lead.businessName} por nombre en Instagram y
        Google Maps.
      </p>
    )
  }

  return (
    <div className="space-y-2.5">
      {meta && <p className="text-sm text-zinc-400">{meta}</p>}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
            >
              <ExternalLink size={11} strokeWidth={1.5} aria-hidden />
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Munición: cómo se ve una ficha bien hecha + en qué fijarse para puntuar.
 *
 * La tabla de criterios venía de m2, donde explicaba qué miraba la herramienta
 * externa antes de llevarle la ficha. Es la misma lista y sigue sirviendo para
 * lo mismo —mirar antes de decidir—, solo que ahora el que mira es el setter.
 * Lo que se fue con la fusión es el `ToolGuide` del chat de evaluación: sin
 * viaje a la herramienta no hay herramienta que presentar.
 */
export function M1Municion() {
  return (
    <div className="space-y-4">
      <FichaEjemplo />
      {/* P17 — la tabla de criterios se pliega (regla de P4): es enseñanza, la
          mirás las primeras veces y después ya sabés en qué fijarte. Era la
          pieza más alta de la munición de m1 —275 px a 390— y empujaba el
          primer campo de la ficha fuera del pliegue. El título promete lo que
          hay adentro y nombra cuántos criterios son, así se sabe qué se abre. */}
      <details className="group">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
          <GraduationCap size={12} strokeWidth={1.5} aria-hidden className="shrink-0" />
          En qué fijarte para puntuar, y por qué pesa ({GUIA_EVALUACION.criterios.length}{' '}
          criterios)
        </summary>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {GUIA_EVALUACION.criterios.map((criterio) => (
            <li key={criterio.nombre} className="text-[11px] leading-relaxed text-zinc-500">
              <span className="font-semibold text-zinc-400">{criterio.nombre}:</span>{' '}
              {criterio.porQue}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

/**
 * Labels de prioridad post-2.1/admin-1b para el veredicto: el CALIENTE de la
 * evaluación solo SUGIERE prioridad (a Franco, que es quien marca el caliente
 * operativo del lead) — por eso en el manual la opción no dice «Caliente».
 * Los VALORES que viajan a la action no cambian (`VEREDICTO_VALUES`).
 */
/**
 * El nombre del último bloque del recorrido. NO reusa `GUIA_EVALUACION.titulo`
 * («Tu veredicto») a propósito: ese texto ya es el nombre accesible del selector
 * del veredicto (`aria-label="Tu veredicto"`), y la cabecera de un bloque es un
 * `<button>`. Dos controles con el mismo nombre en la misma pantalla es una
 * ambigüedad real —un lector de pantalla los anuncia igual, y cualquier búsqueda
 * por rol+nombre agarra el primero de los dos—; acá se midió con el helper que
 * elige opciones de un `<Select>`: apretaba la cabecera del bloque en vez del
 * selector, plegaba el veredicto y el panel de opciones nunca abría.
 */
const TITULO_CIERRE = 'Tu decisión'

const TEXTOS_M1: EvaluacionTextos = {
  scoreHint: 'Cuánto le ves, de 1 a 5: 1–2 descarta, 3 avanza, 4–5 sugiere prioridad.',
  veredictoHint: 'Tu decisión, coherente con el score que pusiste.',
  veredictoLabels: {
    DESCARTAR: 'Descartar',
    AVANZAR: 'Avanzar',
    CALIENTE: 'Avanzar con prioridad',
  },
}

/**
 * Registro: el recorrido entero de la pantalla, en el orden en que se hace.
 *
 * P16 — La ficha dejó de ser una lista larga y pasó a ser el RECORRIDO por las
 * fuentes que el setter visita (Instagram, Google, la web que ya tienen), con el
 * material que se baja de cada una adentro del mismo bloque; el veredicto es el
 * último tramo de ese mismo acordeón, no una sección aparte. Por eso entra como
 * slot `cierre` de `FichaForm`: el único que sabe qué bloque tiene que estar
 * abierto es el que ve lo que hay escrito en la ficha, y cuando ya no falta
 * nada, el bloque abierto tiene que ser el veredicto.
 *
 * Lo que NO cambió: la ficha viva mientras el veredicto no esté registrado y
 * congelada después; el veredicto sigue siendo lo que CIERRA el paso
 * (registrarlo transiciona `FICHA→EVALUADA` y la posición se re-deriva sola). La
 * señal mínima tampoco se chequea acá: el gate vive donde vivía —en
 * `registrarEvaluacion`, server-side— y el aviso de faltantes lo sigue mostrando
 * `FichaForm`, entero, debajo del acordeón.
 */
export function M1Registro({
  leadId,
  lead,
  ficha,
  editable,
  leadStatus,
  caliente,
  evaluacion,
  descartado,
}: {
  leadId: string
  lead: CopyBlockLead
  ficha: Ficha | null
  editable: boolean
  leadStatus: LeadStatus
  caliente: boolean
  evaluacion: Evaluacion | null
  descartado: boolean
}) {
  // El cierre del recorrido — el mismo contenido de siempre: el resumen si el
  // veredicto ya está registrado, el formulario si todavía no.
  const veredicto = evaluacion ? (
    <EvaluacionResumen
      evaluacion={evaluacion}
      descartado={descartado}
      titulo="Veredicto registrado"
      veredictoLabels={TEXTOS_M1.veredictoLabels}
    />
  ) : (
    <div className="space-y-4">
      <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
        Con lo que acabás de anotar arriba: cuánto le ves, si avanza o se descarta, y por
        qué. Nadie lo puntuó antes que vos.
      </p>
      <EvaluacionForm
        leadId={leadId}
        leadStatus={leadStatus}
        caliente={caliente}
        textos={TEXTOS_M1}
      />
    </div>
  )

  // Congelada (el veredicto ya está registrado): la MISMA vista solo-lectura de
  // siempre, con el veredicto debajo. No hay recorrido que hacer — no queda nada
  // por observar — así que acá no hay acordeón ni avance por completitud.
  if (!editable) {
    return (
      <div className="space-y-5">
        <section aria-label="La ficha del negocio">
          <FichaStep leadId={leadId} lead={lead} ficha={ficha} editable={false} />
        </section>
        <section aria-label="Tu veredicto" className="border-t border-white/[0.08] pt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Tu veredicto
          </p>
          <div className="mt-2">{veredicto}</div>
        </section>
      </div>
    )
  }

  return (
    <FichaForm
      leadId={leadId}
      ficha={ficha}
      cierre={{ titulo: TITULO_CIERRE, contenido: veredicto }}
    />
  )
}
