/**
 * SPRINT ESCENA 8 — la última ronda de contenido, lo que se puede prometer sin navegador. Cada afirmación
 * lleva su control positivo donde el chequeo podría pasar por no mirar nada. Una sección por ticket.
 *
 * T1 · el haz: la mitad de los intentos fallidos (de siete, cuatro), el resto del guion igual.
 */
import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { ENTORNO } from '../entorno'
import { FALLA_S, FIRME, GUION, GUION_S, guionEn } from '../entorno/encendido'

// ── T1 · el haz: último ajuste ────────────────────────────────────────────
titulo('T1 · el haz se enciende con la mitad de los intentos fallidos')
type Tramo = readonly [number, number, number]
/** El guion de ESCENA 7 (T9), tal cual se aprobó, para contar contra él. */
const GUION_7: readonly Tramo[] = [[0.1, 0.17, 0.42], [0.36, 0.4, 0.28], [0.62, 0.95, 0.5], [1.18, 1.24, 0.34], [1.48, 1.92, 0.58], [2.14, 2.22, 0.4], [2.42, 2.5, 0.62], [2.78, 3.7, 2.4]]
const intentos = (g: readonly Tramo[]): number => g.filter(([, , k]) => k < FIRME).length
const laMitad = (g: readonly Tramo[]): boolean => intentos(g) === Math.ceil(intentos(GUION_7) / 2)
afirmar(ENTORNO.hazEncendido, 'sigue encendido en el producto')
afirmar(laMitad(GUION), 'quedan la mitad de los intentos que fallan', `${String(intentos(GUION))} de ${String(intentos(GUION_7))} (redondeado hacia arriba)`)
controlPositivo('el detector VE el guion de ESCENA 7', GUION_7, laMitad)
const deLaFalla = GUION.slice(0, -1)
const deLaFalla7 = GUION_7.slice(0, -1)
afirmar(deLaFalla.every(([a, b, k]) => deLaFalla7.some(([a7, b7, k7]) => k7 === k && Math.abs(b7 - a7 - (b - a)) < 1e-9)), '  los que quedan son de los de antes (uno sí y uno no), con su largo y su intensidad')
const muestras = Array.from({ length: Math.round(GUION_S * 1000) }, (_u, i) => [i / 1000, guionEn(i / 1000)] as const)
const falla = muestras.filter(([s]) => s < FALLA_S).map(([, k]) => k)
afirmar(Math.max(...falla) < FIRME && falla.some((k) => k === 0) && guionEn(FALLA_S - 0.1) === 0, '  siguen más tenues que la luz final y entre uno y otro se apaga')
const golpe = GUION[GUION.length - 1]
afirmar(golpe[0] === FALLA_S && golpe[1] === GUION_S && golpe[2] === 2.4 && Math.abs(golpe[1] - golpe[0] - 0.92) < 1e-9, '  el golpe final, igual que en ESCENA 7 (2,4 que se asienta en la luz firme en 0,92 s)')
afirmar(FALLA_S < 2.78 && FALLA_S > 1.25, '  la falla dura menos que en ESCENA 7 y más que en ESCENA 6', `${String(FALLA_S)} s (ESCENA 7: 2,78; ESCENA 6: 1,25)`)

cerrar('s33-escena8')
