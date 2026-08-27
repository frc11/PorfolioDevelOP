import { ExternalLink, Hourglass, Wrench } from 'lucide-react'
import { HERRAMIENTAS, type HerramientaId } from '@/lib/leados/herramientas'

/**
 * Lanzador de una herramienta externa: abre su link en pestaña nueva. Si
 * todavía no tenemos el link cargado (url null), muestra un acceso "pendiente"
 * en vez de un link roto — el setter ve que falta y a quién pedírselo.
 *
 * Estilo NEUTRAL a propósito (disciplina de color B9): el cyan queda reservado
 * para lo accionable del flujo (copiar bloques, cards). Abrir una herramienta
 * externa espeja el patrón de los chips de «Materiales reales» de Construcción.
 */
export function HerramientaLauncher({
  id,
  onOpen,
}: {
  id: HerramientaId
  /** Hook opcional para cerrar el drawer mobile al abrir (lo usa el rail). */
  onOpen?: () => void
}) {
  const herramienta = HERRAMIENTAS[id]

  if (!herramienta.url) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/[0.06] px-3 py-1.5 text-[11px] font-medium text-amber-200/80">
        <Hourglass size={11} strokeWidth={1.5} />
        Link pendiente
      </span>
    )
  }

  return (
    <a
      href={herramienta.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onOpen}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
    >
      <ExternalLink size={11} strokeWidth={1.5} />
      Abrir {herramienta.nombre}
    </a>
  )
}

/**
 * La SALIDA de una herramienta sin link cargado: la línea que dice qué hacer
 * cuando se choca con la píldora «Link pendiente». Con el link cargado no
 * renderiza nada — no es un aviso permanente, es el destrabe de una pared real.
 *
 * Vive FUERA de todo plegable a propósito. Hasta este sprint era el último
 * párrafo del `<details>` «Qué es y cómo se usa» de acá abajo: un título que no
 * prometía ninguna salida, así que nadie lo abría y la pared quedaba sin
 * respuesta (24 choques contra ella en una sola corrida del recorrido). Lo que
 * destraba no se pliega; el «qué es / qué le das / qué te devuelve» sí.
 *
 * Exportada porque la píldora aparece en dos formas: dentro de `ToolGuide` (m2,
 * m4, m6, mc1/mc2, mr) y suelta como `HerramientaLauncher` (el bloque de
 * objeciones de m5). Una sola copia del texto para las dos.
 */
export function SalidaLinkPendiente({ id }: { id: HerramientaId }) {
  if (HERRAMIENTAS[id].url) return null
  return (
    <p className="text-[11px] leading-relaxed text-amber-200/70">
      Todavía no tenés el link cargado — pedíselo a Franco y lo vas a poder abrir desde acá.
    </p>
  )
}

/**
 * Explicación inline de una herramienta, en su paso: nombre + lanzador + —si el
 * link todavía no está— su salida, los tres siempre visibles; y un «qué es / qué
 * le das / qué te devuelve» colapsable (concisa, no agrega ruido al flujo).
 * Clona la calidad de la ayuda embebida de la ficha (m1): jerarquía clara,
 * lenguaje concreto, cero jerga. Contenido y link salen del registro editable
 * (lib/leados/herramientas.ts).
 *
 * El título del plegable nombra sus tres párrafos. «Qué es y cómo se usa» no
 * prometía nada —y encima escondía la salida de arriba—: un título que no dice
 * qué hay adentro es un plegable que no se abre.
 */
export function ToolGuide({ id }: { id: HerramientaId }) {
  const herramienta = HERRAMIENTAS[id]

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="space-y-1.5 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Wrench size={13} strokeWidth={1.5} className="text-zinc-400" />
            {herramienta.nombre}
          </p>
          <HerramientaLauncher id={id} />
        </div>
        <SalidaLinkPendiente id={id} />
      </div>

      <details className="border-t border-white/[0.06]">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
          Ver para qué sirve, qué le das y qué te devuelve
        </summary>
        <div className="space-y-2 px-4 pb-4 text-xs leading-relaxed text-zinc-400">
          <p>{herramienta.queEs}</p>
          <p>
            <span className="font-semibold text-zinc-300">Qué le das:</span>{' '}
            {herramienta.queLeDas}
          </p>
          <p>
            <span className="font-semibold text-zinc-300">Qué te devuelve:</span>{' '}
            {herramienta.queTeDevuelve}
          </p>
        </div>
      </details>
    </div>
  )
}
