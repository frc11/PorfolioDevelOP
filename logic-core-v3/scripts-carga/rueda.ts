/**
 * [B1.2c] LA RUEDA Y EL HOVER EN EL PORTFOLIO, EN EL SITIO — lo que el arnés (`estres.ts`, `RUEDA`) mide y s76 afirma con su modelo
 * (`portfolio/rueda.ts`): el proyecto activo manda; con el puntero sobre un lomo y una muesca de la rueda, la página avanza o retrocede
 * de a un proyecto desde el activo y, con el mouse quieto, la rueda nunca reactiva un lomo (plan §13, punto 5). Sin Playwright: los casos
 * y la cuenta.
 */

/** Los pasos del escenario (`data-paso`): 0…3 las tiras, 4 la cola (Demos). */
export const NOMBRES_DE_LOS_PASOS = ['El Garage', 'Esquina', 'Banú', 'la tuya', 'Demos'] as const

/** Las anclas de las tiras, en el orden de los pasos: con el mouse quieto, la carga se queda en la suya. */
export const ANCLAS_DE_LOS_PASOS = ['portfolio-el-garage', 'portfolio-esquina-estudio', 'portfolio-banu-scents', 'portfolio-la-tuya'] as const

export interface CasoDeLaRueda {
  readonly nombre: string
  /** Dónde carga (el ancla de un paso). */
  readonly ancla: string
  /** El lomo sobre el que se deja el puntero (su tira), o `null` (el puntero sobre la columna de la izquierda). */
  readonly hover: string | null
  /** Las muescas, de a una (1 abajo, −1 arriba), separadas por una espera. */
  readonly muescas: readonly (1 | -1)[]
  /** El paso en que tiene que terminar. */
  readonly espera: number
}

export const CASOS_DE_LA_RUEDA: readonly CasoDeLaRueda[] = [
  { nombre: 'hover en Banú + una muesca abajo', ancla: 'portfolio-el-garage', hover: 'banu-scents', muescas: [1], espera: 3 },
  { nombre: 'hover en El Garage + una muesca abajo', ancla: 'portfolio-esquina-estudio', hover: 'el-garage', muescas: [1], espera: 1 },
  { nombre: 'hover en Esquina + una muesca arriba', ancla: 'portfolio-banu-scents', hover: 'esquina-estudio', muescas: [-1], espera: 0 },
  { nombre: 'mouse quieto sobre un lomo + dos muescas abajo', ancla: 'portfolio-el-garage', hover: 'esquina-estudio', muescas: [1, 1], espera: 3 },
  { nombre: 'después de «la tuya», una muesca abajo', ancla: 'portfolio-la-tuya', hover: null, muescas: [1], espera: 4 },
]

/**
 * Bien: terminó donde tenía que terminar y, desde la primera muesca, el paso sólo se movió en el sentido de la rueda (con el mouse
 * quieto ningún lomo lo hizo volver). `pasos`: los pasos muestreados cuadro a cuadro desde la primera muesca.
 */
export function laRuedaAnduvo(caso: CasoDeLaRueda, pasos: readonly number[]): boolean {
  const final = pasos[pasos.length - 1]
  const sentido = caso.muescas[0]
  const enOrden = pasos.every((p, i) => i === 0 || (p - pasos[i - 1]) * sentido >= 0)
  return final === caso.espera && enOrden
}

/** Los pasos distintos, en orden (para el informe). */
export const recorridoDeLosPasos = (pasos: readonly number[]): number[] => pasos.filter((p, i) => i === 0 || p !== pasos[i - 1])
