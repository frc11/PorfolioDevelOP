/**
 * [M3] SOFTWARE A MEDIDA · LOS DATOS DE LOS DOS MOMENTOS — puros (sin react) para los tests. Sólo lo que la página ya promete (05-TEXTOS,
 * Software: «planillas, cuadernos y mensajes sueltos»; «sistemas de gestión, turnos, stock, presupuestos y paneles internos»), sin
 * nombres, cifras ni resultados.
 */

import { CURVAS } from '../../../_lib/motion/curvas'
import { tramo } from '../avance'

export const TITULO_DE_LO_DE_SIEMPRE = 'Hoy, y con tu sistema' // C2: provisorio (M3)
export const COLUMNAS_DE_LO_DE_SIEMPRE = { hoy: 'Hoy', despues: 'Con tu sistema' } as const // C2: provisorio (M3)

/** Lo de siempre y lo que lo reemplaza (el prototipo 4, con las piezas de `posibles` de la página). */
export const RENGLONES = [
  { antes: 'La planilla de stock', despues: 'Un sistema de stock' },
  { antes: 'El cuaderno de turnos', despues: 'Una agenda de turnos' },
  { antes: 'El presupuesto en Word', despues: 'Presupuestos desde el sistema' },
  { antes: 'Los mensajes sueltos', despues: 'Un panel con todo junto' },
] as const

/**
 * [M3] El tachado y lo nuevo, SIMULTÁNEOS: un solo valor por renglón (el avance con la curva principal del sitio) mueve las dos cosas —
 * la raya que cruza lo de siempre y lo nuevo que se descubre a su lado, de izquierda a derecha, al mismo paso.
 */
export function avanceDelRenglon(avanceDelCruce: number): number {
  return CURVAS.principal(avanceDelCruce)
}

export const TITULO_DEL_ORDEN = 'Y lo suelto, en su lugar' // C2: provisorio (M3)
/** Al final del orden: la promesa de `posibles` (un sistema de gestión), tal cual la dice la página. */
export const CIERRE_DEL_ORDEN = 'Clientes, ventas y pagos en un solo lugar.' // software-a-medida.ts, posibles[0]

export const COLUMNAS = ['Para hacer', 'En curso', 'Listo'] as const

/** Los papeles sueltos: qué son (el rótulo), qué dicen, en qué columna terminan y dónde están tirados (en % de la mesa, con su giro). */
export const PAPELES = [
  { rotulo: 'Pedido', texto: 'Pedido por WhatsApp', columna: 0, x: 4, y: 6, giro: -7 },
  { rotulo: 'Turno', texto: 'Turno del sábado', columna: 1, x: 37, y: 3, giro: 5 },
  { rotulo: 'Presupuesto', texto: 'Presupuesto para mandar', columna: 0, x: 69, y: 9, giro: -4 },
  { rotulo: 'Stock', texto: 'Stock por reponer', columna: 0, x: 66, y: 38, giro: 8 },
  { rotulo: 'Pago', texto: 'Seña recibida', columna: 2, x: 2, y: 37, giro: 6 },
  { rotulo: 'Cliente', texto: 'Cliente nuevo', columna: 1, x: 35, y: 33, giro: -9 },
  { rotulo: 'Consulta', texto: 'Consulta sin contestar', columna: 1, x: 3, y: 69, giro: -5 },
  { rotulo: 'Factura', texto: 'Factura enviada', columna: 2, x: 36, y: 66, giro: 4 },
  { rotulo: 'Pedido', texto: 'Pedido entregado', columna: 2, x: 69, y: 70, giro: -8 },
] as const

/** La geometría del tablero, en % de la mesa: tres columnas de 1/3 con su margen, la cabecera y el alto de un papel. */
export const TABLERO = { margenX: 1.5, cabecera: 13, alto: 23, separacion: 4 } as const
export const ANCHO_DEL_PAPEL = 100 / 3 - 2 * TABLERO.margenX

/** El lugar de cada papel en el tablero: su columna y su renglón dentro de ella (en % de la mesa). */
export const LUGARES = PAPELES.map((p, i) => {
  const renglon = PAPELES.slice(0, i).filter((q) => q.columna === p.columna).length
  return { x: p.columna * (100 / 3) + TABLERO.margenX, y: TABLERO.cabecera + renglon * (TABLERO.alto + TABLERO.separacion) }
})

/** Cuándo viaja cada papel (sobre el avance del recorrido): escalonados en el orden de la lista, cada uno con su tramo. */
export const VIAJE = { arranque: 0.12, escalon: 0.065, duracion: 0.34 } as const

export interface PapelEnElTablero {
  readonly x: number
  readonly y: number
  readonly giro: number
  /** Levantado (en el aire): 0 apoyado, 1 en medio del viaje. Sube la sombra y lo pone arriba de los demás. */
  readonly levantado: number
  readonly llego: boolean
}

export function papelEn(i: number, avance: number): PapelEnElTablero {
  const p = PAPELES[i]
  const l = LUGARES[i]
  const inicio = VIAJE.arranque + i * VIAJE.escalon
  const crudo = tramo(avance, inicio, inicio + VIAJE.duracion)
  const t = CURVAS.simetrica(crudo)
  return {
    x: p.x + (l.x - p.x) * t,
    y: p.y + (l.y - p.y) * t,
    giro: p.giro * (1 - t),
    levantado: Math.sin(Math.PI * crudo),
    llego: crudo >= 1,
  }
}

/** El tablero aparece antes que los papeles: las rayas de las columnas se dibujan en este tramo. */
export const APARICION_DEL_TABLERO = [0, 0.14] as const
