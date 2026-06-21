import type { ReactNode } from 'react'
import { Check, Sparkles } from 'lucide-react'
import {
  GUIA_FICHA,
  GUIA_FICHA_EJEMPLAR,
  GUIA_SELF_CHECK_EJEMPLAR,
} from '@/lib/leados/guidance-content'

/**
 * «Ejemplo del estado ideal»: un `<details>` colapsable que el setter abre para
 * ver cómo se ve un paso BIEN hecho y comparar el suyo contra él, en vez de
 * arrancar de una pantalla en blanco sin referencia.
 *
 * Estilo NEUTRAL a propósito (disciplina B9: el cyan queda para lo accionable;
 * acá es enseñanza, mismo registro que `TeachPanel`). El contenido viene 100%
 * de `guidance-content.ts` (1.0) — este archivo solo lo pinta, no hardcodea.
 * Es complemento, no muleta: si una pantalla NECESITA el ejemplo para
 * entenderse, lo que está mal es el diseño base del paso, no la falta de guía.
 */
function EjemploIdealShell({
  resumen,
  titulo,
  porque,
  children,
}: {
  resumen: string
  titulo: string
  porque: string
  children: ReactNode
}) {
  return (
    <details className="rounded-xl border border-white/10 bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-3 text-xs font-semibold text-zinc-200 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
        <Sparkles size={13} strokeWidth={1.5} aria-hidden={true} className="text-zinc-400" />
        {resumen}
      </summary>
      <div className="space-y-3 border-t border-white/[0.06] px-4 py-3.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{titulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{porque}</p>
        </div>
        {children}
      </div>
    </details>
  )
}

/** Orden de los campos en el ejemplo — el mismo que el form de la ficha. */
const ORDEN_CAMPOS_FICHA: readonly (keyof typeof GUIA_FICHA.campos)[] = [
  'igManejadoPor',
  'identidadNotas',
  'presenciaDigital',
  'resenas',
  'contenidoReal',
  'senalesOperativas',
  'otros',
]

/** El select muestra su label, no el value del enum; el resto va tal cual. */
function valorCampo(campo: keyof typeof GUIA_FICHA.campos, valor: string): string {
  if (campo === 'igManejadoPor') {
    const opcion = GUIA_FICHA.campos.igManejadoPor.opciones.find((o) => o.value === valor)
    return opcion?.label ?? valor
  }
  return valor
}

/**
 * Ejemplo de una ficha bien hecha, para el inicio del Paso 1. Reusa los labels
 * de `GUIA_FICHA.campos` (no los duplica) y los valores modelo de
 * `GUIA_FICHA_EJEMPLAR`. Presentación pura.
 */
export function FichaEjemplo() {
  const ejemplo = GUIA_FICHA_EJEMPLAR
  return (
    <EjemploIdealShell
      resumen="Ver ejemplo de una ficha bien hecha"
      titulo={ejemplo.titulo}
      porque={ejemplo.porque}
    >
      <dl className="space-y-2.5">
        {ORDEN_CAMPOS_FICHA.map((campo) => (
          <div key={campo} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              {GUIA_FICHA.campos[campo].label}
            </dt>
            <dd className="mt-1 whitespace-pre-line text-xs leading-relaxed text-zinc-300">
              {valorCampo(campo, ejemplo.campos[campo])}
            </dd>
          </div>
        ))}
      </dl>
    </EjemploIdealShell>
  )
}

/**
 * Ejemplo de un self-check bien hecho, para el form del self-check. Modela el
 * artefacto terminado (obligatorios verificados + flags honestos); el checklist
 * real lo dibuja el step desde `flow.ts`. Presentación pura.
 */
export function SelfCheckEjemplo() {
  const ejemplo = GUIA_SELF_CHECK_EJEMPLAR
  return (
    <EjemploIdealShell
      resumen="Ver ejemplo de un self-check bien hecho"
      titulo={ejemplo.titulo}
      porque={ejemplo.porque}
    >
      <ul className="space-y-2">
        {ejemplo.lineas.map((linea) => (
          <li key={linea} className="flex items-start gap-2 text-xs leading-relaxed text-zinc-300">
            <Check
              size={13}
              strokeWidth={1.5}
              aria-hidden={true}
              className="mt-0.5 shrink-0 text-emerald-400/70"
            />
            <span>{linea}</span>
          </li>
        ))}
      </ul>
    </EjemploIdealShell>
  )
}
