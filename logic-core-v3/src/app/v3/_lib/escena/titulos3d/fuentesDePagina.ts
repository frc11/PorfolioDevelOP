import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import type { FuenteDePagina, FuenteDelTitulo } from '../../titulos3d/registro'

/**
 * [B12a.4] LAS FUENTES 3D DEL TÍTULO DE LAS PÁGINAS — instancias de Archivo ([L6] tres: la familia fija y su peso elegido) (`scripts-retoque/fuentes-3d.py`), con un import
 * dinámico cada una: no van en la carga del lienzo (las del home sí, estáticas en `armado.ts`), así que el home no las baja. La
 * sincronía espera la de un título antes de armarlo (`sincronia.ts`) y `armado.ts` la lee de acá.
 */
const CARGAS: Readonly<Record<FuenteDePagina, () => Promise<{ readonly default: unknown }>>> = {
  'archivo-125-800': () => import('../../../_fuentes/archivo-125-800-pagina.json'),
  'archivo-125-300': () => import('../../../_fuentes/archivo-125-300-pagina.json'),
  'archivo-125-400': () => import('../../../_fuentes/archivo-125-400-pagina.json'), // [B12a.8] T5 · el peso elegido (la liviana un paso más pesada)
}

const CARGADAS = new Map<FuenteDePagina, Font>()
const EN_CAMINO = new Map<FuenteDePagina, Promise<void>>()

export const esFuenteDePagina = (f: FuenteDelTitulo): f is FuenteDePagina => Object.hasOwn(CARGAS, f)

/** La fuente, si ya llegó (`null`: todavía no). */
export const fuenteDePagina = (f: FuenteDePagina): Font | null => CARGADAS.get(f) ?? null

/** Pide la fuente una sola vez; la promesa se resuelve siempre (si falla, el título no se arma y se lee el `h1` del DOM). */
export function cargarLaFuenteDePagina(f: FuenteDePagina): Promise<void> {
  const enCamino = EN_CAMINO.get(f)
  if (enCamino !== undefined) return enCamino
  const pedido = CARGAS[f]()
    .then((m) => {
      CARGADAS.set(f, new Font(m.default as FontData))
    })
    .catch(() => {
      EN_CAMINO.delete(f)
    })
  EN_CAMINO.set(f, pedido)
  return pedido
}
