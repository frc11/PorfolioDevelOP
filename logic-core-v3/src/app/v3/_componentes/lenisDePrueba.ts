import type Lenis from 'lenis'

import { OPCIONES_DE_LENIS } from '@/components/layout/SmoothScroll'

import { entornoDeLaEscena, hayBanco, type LenisDePrueba } from '../_lib/escena/entorno'

/**
 * [ESCENA 9] T4 · DOS AJUSTES DEL SCROLL SUAVE, A PRUEBA (bandera `lenis=<variante>`; decide Valentino).
 *
 * Hoy /v3 construye Lenis con las opciones del sitio (`OPCIONES_DE_LENIS`: `duration` 1,1 con una exponencial de
 * salida): cada evento de la rueda arranca una animación nueva de 1,1 s desde donde está el scroll hasta el objetivo.
 * nk.studio (`docs/rediseno/s0/SCROLL.md` §9.6) corre en modo `lerp` 0,1: cada cuadro se acerca un 10 % al objetivo,
 * sin duración. Son casi la misma exponencial (la salida de hoy decae a 6,3 por segundo; el lerp 0,1, a 6,0); cambia
 * el final: la de hoy se corta a los 1,1 s y la de nk se apaga sola.
 *
 *   `nk`      el modo de nk: `lerp` 0,1, sin duración ni curva.
 *   `sedoso`  más inercia: `lerp` 0,075 (decae a 4,5 por segundo: el 63 % en 222 ms en lugar de 167).
 *
 * La construcción no cambia (la afirman `compuerta` y `s18`): se cambian las opciones de la instancia, que Lenis lee
 * en cada evento de la rueda. Con banco, se cambian en vivo.
 */
export const LENIS_DE_PRUEBA: Readonly<Record<LenisDePrueba, { readonly lerp: number; readonly duration: undefined; readonly easing: undefined }>> = {
  nk: { lerp: 0.1, duration: undefined, easing: undefined },
  sedoso: { lerp: 0.075, duration: undefined, easing: undefined },
}

/** Las del sitio (el `lerp` que Lenis pone por defecto y que en modo duración no se usa). */
const COMO_EL_SITIO = { lerp: 0.1, duration: OPCIONES_DE_LENIS.duration, easing: OPCIONES_DE_LENIS.easing }

function poner(lenis: Lenis, variante: LenisDePrueba | 'no'): void {
  Object.assign(lenis.options, variante === 'no' ? COMO_EL_SITIO : LENIS_DE_PRUEBA[variante])
}

/** La prueba pedida (sin bandera, nada) y, con banco, el gancho para cambiarla en vivo. Devuelve la limpieza. */
export function instalarLenisDePrueba(lenis: Lenis): () => void {
  const pedida = entornoDeLaEscena().pruebas.lenis
  if (pedida !== 'no') poner(lenis, pedida)
  if (!hayBanco()) return () => undefined
  const ventana = window as Window & { __lenisDelBanco?: { poner: (v: LenisDePrueba | 'no') => void } }
  ventana.__lenisDelBanco = { poner: (v) => poner(lenis, v) }
  return () => {
    delete ventana.__lenisDelBanco
  }
}
