/**
 * [B12a.1] EL PRESET DE LA PÁGINA — lo que la escena tiene que saber de la página en la que está (plan `docs/rediseno/SPRINT-B12a.md`
 * §3.1; D1: lo declara LA PÁGINA con `<PresetDeLaPagina>`, no una tabla del home, así `_lib/` no importa nada de servicios).
 *
 * El home declara `PRESET_DEL_HOME` y todo sigue igual: la escena lee el mapeo de sus secciones. Una página con escena (una de servicio)
 * declara los bloques que la despiertan (`tramos`: la intro y el pie); fuera de ellos, en el papel, duerme (D8, `'never'`). Sin ningún
 * preset (las galerías de `/v3`: tipografía, componentes, motion) la escena duerme entera después de su primer cuadro: lo medido en
 * Fase 0 (§2) eran unos 600 ms por segundo de hilo principal dibujando una escena que no se mira.
 *
 * El almacén es una PILA: con la navegación cliente (B12a.5) la página nueva se monta antes de que se desmonte la vieja, y cada una
 * saca sólo lo suyo.
 */

import type { IdDeServicio } from '../../../_secciones/_contrato/acento'
import type { IdDeVariante } from '../../../_variantes/registro'
import type { ChoreoKeyframe } from '../choreographyTypes'

export type IdDePagina = 'home' | IdDeServicio | 'base' | 'nosotros' | 'portfolio' | 'blog' | 'no-encontrada'

export interface PresetDeLaEscena {
  readonly id: IdDePagina
  /**
   * Los bloques que despiertan la escena (selectores de CSS): la intro y, desde B13, el pie. En el home, `null`: manda el mapeo de
   * las secciones (el preset ni se consulta).
   */
  readonly tramos: { readonly intro: string; readonly pie: string | null } | null
  /**
   * [B12a.2] La pista de cámara de la intro (`pistaDeLaIntro.ts`: de la composición inicial a la pose de la intro), o `null`: la del home
   * (`CHOREO_KEYFRAMES`, con el progreso de sus secciones).
   */
  readonly pista: readonly ChoreoKeyframe[] | null
  readonly noche: 'dia' | 'noche'
  /** El servicio dueño del acento: el claro sale del token por el id (nunca un hex). */
  readonly acento: IdDeServicio | null
  /**
   * [B12a.3] P-H29e · la variante de escena de la página, por su id en el registro (`_variantes/registro.ts`), o `null`. Un id y no el
   * componente: una página de servidor no puede pasarle una función a uno de cliente. La ranura la carga con un import dinámico.
   */
  readonly variante: IdDeVariante | null
}

export const PRESET_DEL_HOME: PresetDeLaEscena = { id: 'home', tramos: null, pista: null, noche: 'dia', acento: null, variante: null }

const pila: PresetDeLaEscena[] = []
const oyentes = new Set<() => void>()

/** El preset de la página que está (el último que entró), o `null`: ninguna lo declaró. */
export function presetActual(): PresetDeLaEscena | null {
  return pila[pila.length - 1] ?? null
}

/** Una página declara su preset; devuelve cómo sacarlo (saca ESE, aunque otro haya entrado después). */
export function apilarElPreset(p: PresetDeLaEscena): () => void {
  pila.push(p)
  for (const f of oyentes) f()
  return () => {
    const i = pila.lastIndexOf(p)
    if (i < 0) return
    pila.splice(i, 1)
    for (const f of oyentes) f()
  }
}

export function suscribirseAlPreset(f: () => void): () => void {
  oyentes.add(f)
  return () => oyentes.delete(f)
}

/** Una caja vertical en el documento (px desde el tope de la página). */
export interface CajaVertical {
  readonly arriba: number
  readonly abajo: number
}

/**
 * Si la escena tiene que estar despierta en una página que NO es el home (puro): sin preset, nunca (después de su primer cuadro); con
 * preset, si alguno de sus bloques asoma en el cuadro, con el margen de encendido (`margen`, en fracción del alto) de los dos lados.
 */
export function despiertaEnLaPagina(preset: PresetDeLaEscena | null, bloques: readonly CajaVertical[], scrollY: number, alto: number, margen: number): boolean {
  if (preset === null || !(alto > 0)) return false
  if (preset.tramos === null) return true
  const desde = scrollY - margen * alto
  const hasta = scrollY + alto + margen * alto
  return bloques.some((b) => b.abajo > desde && b.arriba < hasta)
}

/** Las cajas de los bloques del preset en el documento (medidas en el layout: los bloques de una página no llevan transformadas). */
export function bloquesDelPreset(documento: Pick<Document, 'querySelector'>, preset: PresetDeLaEscena | null, scrollY: number): readonly CajaVertical[] {
  if (preset === null || preset.tramos === null) return []
  const selectores = [preset.tramos.intro, preset.tramos.pie].filter((s): s is string => s !== null)
  return selectores.flatMap((s) => {
    const r = documento.querySelector(s)?.getBoundingClientRect()
    return r === undefined ? [] : [{ arriba: r.top + scrollY, abajo: r.bottom + scrollY }]
  })
}
