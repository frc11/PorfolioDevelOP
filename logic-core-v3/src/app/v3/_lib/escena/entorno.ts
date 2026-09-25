/**
 * [ESCENA 2] EL ENTORNO — las ideas de la exploración, cada una detrás de su PROPIA bandera.
 *
 * **Todas apagadas**: el producto es la base limpia (`escena-base-limpia`). Se combinan libres entre
 * sí. El banco de comparación las prende ANTES de cargar la página, sin tocar este archivo:
 *
 *     window.__entornoDeLaEscena = 'E1,E2,E3,E6'
 *
 * Qué es cada una, y el veredicto de la exploración, en `docs/rediseno/SPRINT-ESCENA-2.md`.
 */

export const IDEAS_DEL_ENTORNO = ['E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'] as const

export type IdeaDelEntorno = (typeof IDEAS_DEL_ENTORNO)[number]

export type Entorno = Readonly<Record<IdeaDelEntorno, boolean>>

/** Una línea por idea: lo que se prende. */
export const QUE_ES: Readonly<Record<IdeaDelEntorno, string>> = {
  E0: 'mancha — sin la mancha de contacto debajo del logo',
  E1: 'óculo y haz — un óculo arriba y un haz suave sobre el logo; el polvo brilla adentro',
  E2: 'monolitos — cuatro volúmenes puros en el horizonte, medio tragados por la bruma',
  E3: 'el día como recorrido — un tinte casi imperceptible de la bruma y del haz, atado al arco',
  E4: 'pulso — cada ~6 s una onda tenue sale del logo por el piso y se apaga',
  E5: 'anillos — dos anillos finos inclinados orbitan el logo en Por qué develOP y el pie',
  E6: 'polvo que responde — estelas cortas con la velocidad, inercia al frenar, más largas cerca',
  E7: 'el cursor — el polvo se corre al paso del puntero y vuelve con inercia',
  E8: 'el foco — el polvo nítido en el plano del logo y más blando lejos de él, como un lente',
}

/** LAS BANDERAS. Todas en `false`: ninguna idea llega al producto sin decidirse. */
export const ENTORNO: Entorno = {
  E0: false,
  E1: false,
  E2: false,
  E3: false,
  E4: false,
  E5: false,
  E6: false,
  E7: false,
  E8: false,
}

type VentanaConEntorno = Window & { __entornoDeLaEscena?: unknown }

let resuelto: Entorno | null = null

/**
 * Las banderas de esta carga: las de arriba, más las que el banco pidió antes de cargar. Se
 * resuelve UNA vez y queda fija, para que todos los componentes vean la misma escena.
 */
export function entornoDeLaEscena(): Entorno {
  if (resuelto !== null) return resuelto
  if (typeof window === 'undefined') return ENTORNO
  const pedido = (window as VentanaConEntorno).__entornoDeLaEscena
  const prendidas = new Set(typeof pedido === 'string' ? pedido.split(',').map((s) => s.trim()) : [])
  const banderas = { ...ENTORNO }
  for (const idea of IDEAS_DEL_ENTORNO) banderas[idea] = ENTORNO[idea] || prendidas.has(idea)
  resuelto = banderas
  return resuelto
}
