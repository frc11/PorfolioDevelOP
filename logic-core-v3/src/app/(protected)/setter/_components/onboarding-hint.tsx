'use client'

import { useSyncExternalStore } from 'react'
import { Megaphone, Target, X } from 'lucide-react'
import { Card } from '@/components/ui'

// v2 (2.5): el contenido pasó a explicar TAMBIÉN el modo dirección (el foco), no
// solo el flujo invertido. Se bumpea la versión para que la guía vuelva a
// mostrarse UNA vez tras el rediseño 2.1a — el que ya la había cerrado nunca vio
// explicada la pantalla nueva. Sigue siendo descartable: se cierra y no vuelve.
const STORAGE_KEY = 'leados-onboarding-v2'

// Store mínimo sobre localStorage. `useSyncExternalStore` es la lectura correcta
// de un store externo: el server (y el primer render del cliente) devuelven el
// snapshot de server (oculto) — sin desajuste de hidratación — y recién después
// se pasa al valor real. Reemplaza al patrón useState(false)+useEffect, que
// disparaba `set-state-in-effect` (no se puede usar un inicializador lazy de
// useState: leería `window` en SSR y rompería).
const listeners = new Set<() => void>()

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

function getVisibleSnapshot(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

/** Server + primer render del cliente: oculto, para no desajustar la hidratación. */
function getVisibleServerSnapshot(): boolean {
  return false
}

function dismissOnboarding(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // sin localStorage (modo privado): se oculta solo por esta sesión
  }
  listeners.forEach((onChange) => onChange())
}

// Segunda parte de la guía: el FLUJO INVERTIDO (lo más contraintuitivo del
// sistema: el opener va antes que la demo), no un índice de pasos. La numeración
// real vive en el panel del lead (su stepper de 5 etapas). Acá NO se numera ni se
// reenumera el flujo — eso duplicaría (y contradeciría) al stepper. Se explica la
// LÓGICA: frío → opener y esperás; caliente (4–5) → podés adelantar la demo.
// (La primera parte, arriba en el render, explica el MODO DIRECCIÓN: el foco.)
const FLUJO = [
  {
    titulo: 'El score del Evaluador marca el camino',
    detalle:
      'Armás la ficha y el Evaluador le pone un puntaje de 1 a 5. Ese puntaje decide si el lead es frío (la mayoría) o caliente (4–5) — y eso cambia el ORDEN de lo que hacés.',
  },
  {
    titulo: 'Frío: primero el opener, no la demo',
    detalle:
      'Para casi todos los leads mandás el opener (un mensaje corto, sin link ni precio) y esperás. La demo todavía NO se construye: la producción se abre recién si el negocio responde.',
  },
  {
    titulo: 'La espera es parte del laburo',
    detalle:
      'Mandado el opener, esperás respuesta. La maquinaria calcula y te avisa cuándo toca el próximo seguimiento — vos no llevás fechas. Si un paso del panel está apagado, todavía no es su momento.',
  },
  {
    titulo: 'Caliente (4–5): podés adelantar la demo',
    detalle:
      'La excepción: un lead que el Evaluador marca 4 o 5 te habilita a construir la demo preventiva sin esperar respuesta. Para todo el resto (1–3), primero va la conversación.',
  },
] as const

/**
 * "Cómo funciona" descartable: estático, sin tour. Se persiste en
 * localStorage — se muestra solo hasta que el setter lo cierra.
 */
export function OnboardingHint() {
  const visible = useSyncExternalStore(
    subscribe,
    getVisibleSnapshot,
    getVisibleServerSnapshot,
  )

  if (!visible) return null

  const dismiss = dismissOnboarding

  return (
    <Card variant="default" padding="lg" className="relative overflow-hidden">
      {/* Guía, no promo: acento izquierdo en vez del gradiente que la hacía parecer un CTA. */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-cyan-400/60" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            Antes de empezar
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-100">
            Cómo funciona tu día
          </h2>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar la guía de inicio"
          className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Modo dirección (2.5): lo PRIMERO que ve el setter es el foco — un lead
          por vez. Antes del flujo de cada lead, se explica cómo se trabaja en
          ESTA pantalla. Énfasis por layout/peso, no por color (disciplina B9). */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
        <Target size={15} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-zinc-300" />
        <div>
          <p className="text-xs font-semibold text-zinc-100">Trabajás un lead por vez</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Arriba está el que toca ahora — el más urgente, ya ordenado. Lo abrís con{' '}
            <span className="font-medium text-zinc-200">«Ir a trabajarlo»</span>. Si no es el
            momento, <span className="font-medium text-zinc-200">«Parquealo»</span> (lo saca de
            tu vista hasta la fecha que elijas) o <span className="font-medium text-zinc-200">«Saltá»</span>{' '}
            al próximo. No elegís de una lista: el orden ya viene resuelto.
          </p>
        </div>
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        El flujo de cada lead
      </p>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {FLUJO.map((item) => (
          <div
            key={item.titulo}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <p className="text-xs font-semibold text-zinc-200">{item.titulo}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.detalle}</p>
          </div>
        ))}
      </div>

      {/* La línea clave del flujo invertido — emphasis por layout/peso, NO por
          color: cyan queda reservado a lo accionable (disciplina B9). */}
      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
        <Megaphone
          size={15}
          strokeWidth={1.5}
          aria-hidden
          className="mt-0.5 shrink-0 text-zinc-300"
        />
        <p className="text-xs leading-relaxed text-zinc-200">
          <span className="font-semibold text-zinc-100">Ojo:</span> la demo se construye{' '}
          <span className="font-semibold text-zinc-100">DESPUÉS</span> de que el negocio
          responde — primero va el opener.
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="mt-4 text-xs font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
      >
        Entendido, no lo muestres más
      </button>
    </Card>
  )
}
