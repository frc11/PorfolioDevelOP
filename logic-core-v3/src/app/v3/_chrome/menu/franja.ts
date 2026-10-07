/**
 * [NOCTURNO FINAL] C5 · LA FRANJA DE CERRAR DEL MENÚ DEL TELÉFONO — con el panel abierto, el círculo del botón estirado a
 * lo ancho (`data-franja`, la transición en `vidrio.css`); sin él, el círculo. `MenuDeVidrio` la estira cuando el panel
 * terminó de abrir y la recoge antes del Genie de cierre. Lo que tarda en recogerse sale de su transición (el token), no
 * de un número repetido acá. Aparte de `MenuDeVidrio.tsx` para que no pase las 300 líneas (`s8-montaje`).
 */

function franjaDe(caja: HTMLElement | null): HTMLElement | null {
  return caja?.querySelector<HTMLElement>('[data-parte="cerrar-el-menu"]') ?? null
}

/** Estira la franja (el panel abierto) o la vuelve al círculo. */
export function estirarLaFranja(caja: HTMLElement | null, si: boolean): void {
  const f = franjaDe(caja)
  if (si) f?.setAttribute('data-franja', 'abierta')
  else f?.removeAttribute('data-franja')
}

/** Cuánto tarda en recogerse (ms): la duración y el retardo de su transición, leídos de la hoja. */
export function msDeLaFranja(caja: HTMLElement | null): number {
  const capa = franjaDe(caja)?.querySelector('[data-parte="franja"]')
  if (capa === null || capa === undefined) return 0
  const s = getComputedStyle(capa)
  const segundos = (v: string): number => Math.max(0, ...v.split(',').map((x) => Number.parseFloat(x) * (x.trim().endsWith('ms') ? 0.001 : 1) || 0))
  return Math.round((segundos(s.transitionDuration) + segundos(s.transitionDelay)) * 1000)
}

/**
 * El círculo de la franja (y el del Genie) lleva el tono del BOTÓN, no el del vidrio: el vidrio se elige por lo que hay en
 * el centro de la pantalla y el botón por lo que tiene debajo; si difieren, el botón no cambia de color al volverse franja.
 */
export function tonoDelCirculo(capas: readonly (HTMLElement | null)[], botonInvertido: boolean): void {
  for (const capa of capas) {
    for (const c of capa?.querySelectorAll('[data-parte="circulo"]') ?? []) {
      if (botonInvertido) c.setAttribute('data-seccion', 'invertida')
      else c.removeAttribute('data-seccion')
    }
  }
}
