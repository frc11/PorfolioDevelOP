'use client'

import { seguirElScroll } from '../_lib/scrollEnMovimiento'

/**
 * [PASADA FINAL] B3 · UNA SOLA DEMO SE MUEVE A LA VEZ, Y NINGUNA MIENTRAS LA PÁGINA CORRE — las ocho demos de Tu panel
 * están montadas (al acercarse) y a la vista hay dos o tres juntas; cada una con su guion, sus relojes y sus animaciones
 * costaba el hilo principal que la sección no tiene. Medido con la NVIDIA (1440×900, un scroll suave de 9 s por la
 * sección): sin demos montadas, cero cuadros perdidos; con las demos montadas, ~30 por pasada, y lo que los perdía no
 * era el paralaje ni pausar las animaciones de CSS sino cada vez que React volvía a dibujar un árbol de demo (el cambio
 * de la que corre, el paso de un guion). Así que:
 *   · cada demo informa qué fracción de sí misma está en el cuadro, y corre sólo LA MÁS VISIBLE; las demás quedan
 *     congeladas (sus pasos no avanzan y sus animaciones de CSS se pausan); con empate, sigue la que ya corría;
 *   · la que corre se ELIGE SÓLO CON LA PÁGINA QUIETA (`scrollEnMovimiento.ts`, el mismo escucha compartido del video de
 *     Servicios): mientras el scroll se mueve no cambia nada y ningún guion da un paso (`reproduccion.ts` lo espera), o
 *     sea que ningún árbol de demo se vuelve a dibujar en medio del scroll; al frenar, la más visible retoma.
 * Y el MONTAJE DIFERIDO ESCALONADO: cuando varias se acercan a la vez (un scroll rápido), se montan de a una, con un
 * respiro entre cada una. Sin React: un registro y sus oyentes.
 */
const visibles = new Map<string, number>()
let laQueCorreAhora: string | null = null
const oyentes = new Set<() => void>()

/** Lo que se considera «la página quieta» (ms sin scroll): como el video de Servicios. */
export const QUIETO_PARA_ELEGIR_MS = 180
let enMovimiento = false
let eleccionPendiente = false
let siguiendoElScroll = false

function elegir(): string | null {
  let mejor: string | null = null
  let maxima = 0
  for (const [id, fraccion] of visibles) {
    if (fraccion > maxima) {
      maxima = fraccion
      mejor = id
    }
  }
  // Con empate, la que ya corría.
  if (laQueCorreAhora !== null && (visibles.get(laQueCorreAhora) ?? 0) === maxima && maxima > 0) return laQueCorreAhora
  return mejor
}

function elegirYAvisar(): void {
  eleccionPendiente = false
  const nueva = elegir()
  if (nueva === laQueCorreAhora) return
  laQueCorreAhora = nueva
  for (const f of oyentes) f()
}

function seguir(): void {
  if (siguiendoElScroll || typeof window === 'undefined') return
  siguiendoElScroll = true
  seguirElScroll(
    QUIETO_PARA_ELEGIR_MS,
    () => {
      enMovimiento = true
    },
    () => {
      enMovimiento = false
      if (eleccionPendiente) elegirYAvisar()
    },
  )
}

/** Una demo informa qué fracción de sí misma está en el cuadro (0: ninguna, se olvida). La elección espera a la página quieta. */
export function informarVisibilidad(id: string, fraccion: number): void {
  seguir()
  if (fraccion <= 0) visibles.delete(id)
  else visibles.set(id, fraccion)
  // La que corría y se fue del todo no puede seguir corriendo ni un momento más: se vuelve a elegir ya.
  if (enMovimiento && !(fraccion <= 0 && id === laQueCorreAhora)) {
    eleccionPendiente = true
    return
  }
  elegirYAvisar()
}

export const laQueCorre = (): string | null => laQueCorreAhora

/** ¿La página se está moviendo? Los guiones esperan a que frene para dar su paso. */
export const paginaEnMovimiento = (): boolean => enMovimiento

export function suscribirAlEscenario(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}

/** El respiro entre un montaje y el siguiente (ms). */
export const ENTRE_MONTAJES_MS = 150
let ultimoMontaje = 0

/** Pide montar una demo en su turno: la primera ya; las que se acercan juntas, de a una cada `ENTRE_MONTAJES_MS`. Devuelve cómo cancelarlo. */
export function montarEnTurno(f: () => void): () => void {
  const ahora = Date.now()
  const cuando = Math.max(ahora, ultimoMontaje + ENTRE_MONTAJES_MS)
  ultimoMontaje = cuando
  const reloj = window.setTimeout(f, cuando - ahora)
  return () => window.clearTimeout(reloj)
}
