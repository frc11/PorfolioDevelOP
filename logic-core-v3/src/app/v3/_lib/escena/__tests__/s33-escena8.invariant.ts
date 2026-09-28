/**
 * SPRINT ESCENA 8 — la última ronda de contenido, lo que se puede prometer sin navegador. Cada afirmación
 * lleva su control positivo donde el chequeo podría pasar por no mirar nada. Una sección por ticket.
 *
 * T1 · el haz: la mitad de los intentos fallidos (de siete, cuatro), el resto del guion igual.
 * T2 · el límite entre la trama y el piso: las dos capas bajan a pleno hasta debajo del piso (el piso las
 *      corta), la pared lleva un zócalo fino y el piso un contacto al pie de cada capa; sin tapar nada.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, entornoPedido } from '../entorno'
import { FALLA_S, FIRME, GUION, GUION_S, guionEn } from '../entorno/encendido'
import { LIMITE, TRAMA_ANCLADA, ZOCALO, contactoDeLaTrama } from '../moire/limite'
import { bandEnvelope } from '../moireTextures'
import { PISO_VIVO } from '../piso/bloques'
import { FORMACION } from '../formacion/enFormacion'
import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS, MOIRE_OPACITY } from '../probeMoire'
import { FLOOR_Y } from '../probeScene'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8')

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

// ── T2 · el límite entre el moiré y el piso ───────────────────────────────
titulo('T2 · la trama anclada al piso')
afirmar(ENTORNO.limite && !BASE_LIMPIA.limite && !entornoPedido('producto,limite=no').limite && entornoPedido('limite').limite, 'encendido en el producto; el banco lo suelta con `limite=no` (la hoja antes/después)')
// El fundido de abajo: el alfa de vértice va de 0 en la fila de abajo a 1 en la siguiente (un tramo entero de malla).
const alPie = (fundido: number): number => (fundido === 0 ? 1 : bandEnvelope(0, fundido))
const apoya = (fundido: number): boolean => alPie(fundido) > 0.99
const pantalla = leer('MoireScreen.tsx')
afirmar(apoya(0) && /const fundido = anclada \? 0 : TRAMA_HASTA_EL_PISO\.fundido/.test(pantalla) && /spec\.fadeBottom === 0 && v < 0\.5 \? 1 :/.test(pantalla), 'las dos capas llegan a pleno hasta el pie: sin fundido abajo')
controlPositivo('el detector VE la trama de ESCENA 7 (fundido de 0,035: alfa 0 en el pie)', 0.035, apoya)
// Lo más hondo que baja el piso vivo: el mar con el agrupamiento y el picado al máximo, más la onda con su tope.
const marejadas = PISO_VIVO.mar.marejadas.reduce((a, [, , alto]) => a + alto, 0)
const hondo = (marejadas * 1.45 + PISO_VIVO.mar.picado.alto * 0.5) * PISO_VIVO.mar.alto + PISO_VIVO.onda.tope
afirmar(TRAMA_ANCLADA.abajo < FLOOR_Y - hondo, 'baja por debajo del valle más hondo: el pie lo dibuja el piso, también donde el mar baja', `la trama hasta ${(FLOOR_Y - TRAMA_ANCLADA.abajo).toFixed(2)} u debajo del reposo; el valle más hondo, ${hondo.toFixed(2)} u`)
afirmar(/abajo: FLOOR_Y - LIMITE\.hunde/.test(leer('moire/limite.ts')) && MOIRE_FAR_RADIUS < FORMACION.radioDelEscenario && MOIRE_NEAR_RADIUS < FORMACION.radioDelEscenario, '  las dos capas se paran sobre el escenario (adentro de su borde): el piso las tapa por debajo')
// El zócalo: en la pared (la gruesa), donde el mar ya se apagó.
const borde = FORMACION.radioDelEscenario
const enElMar = (r: number): number => {
  const [a, b] = [borde - PISO_VIVO.mar.borde[0], borde - PISO_VIVO.mar.borde[1]]
  const t = Math.min(1, Math.max(0, (r - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
afirmar(enElMar(MOIRE_FAR_RADIUS) < 0.15 && enElMar(MOIRE_NEAR_RADIUS) > 0.99, 'la pared (44) apoya donde el mar ya se apagó; la fina (38) está parada en el mar', `el mar al pie de la pared, ${(enElMar(MOIRE_FAR_RADIUS) * 100).toFixed(0)} %; al pie de la fina, ${(enElMar(MOIRE_NEAR_RADIUS) * 100).toFixed(0)} %`)
afirmar(ZOCALO.arriba - FLOOR_Y <= 0.12 && ZOCALO.abajo < FLOOR_Y && Math.abs(ZOCALO.radio - MOIRE_FAR_RADIUS) < 0.05, 'un zócalo fino al pie de la pared, enterrado un poco (el mar de su borde nunca lo despega)', `${String(LIMITE.zocalo.alto)} u sobre el piso`)
afirmar(LIMITE.zocalo.opacidad > MOIRE_OPACITY && LIMITE.zocalo.opacidad < 0.8, '  del color de la trama, más denso que sus líneas y todavía traslúcido (no tapa la formación)', `opacidad ${String(LIMITE.zocalo.opacidad)}; las líneas, ${String(MOIRE_OPACITY)}`)
afirmar(/renderOrder=\{MOIRE_FAR_ORDER\}/.test(pantalla) && /depthWrite: false, side: THREE\.BackSide/.test(pantalla), '  se dibuja con la pared (después de la formación y del cielo), sin escribir profundidad')
// El contacto: el piso junta menos luz al pie de cada capa, y en ningún otro lado.
afirmar(contactoDeLaTrama(MOIRE_FAR_RADIUS) > 0.1 && contactoDeLaTrama(MOIRE_NEAR_RADIUS) > 0.08 && contactoDeLaTrama(30) < 0.001 && contactoDeLaTrama(0) < 1e-6, 'el contacto: el piso se oscurece al pie de la pared y de la fina, y nada lejos de ellas', `al pie de la pared ${(contactoDeLaTrama(MOIRE_FAR_RADIUS) * 100).toFixed(1)} %, de la fina ${(contactoDeLaTrama(MOIRE_NEAR_RADIUS) * 100).toFixed(1)} %, a 30 u ${(contactoDeLaTrama(30) * 100).toFixed(3)} %`)
afirmar(/luz \*= 1\.0 - contactoDeLaTrama\( length\( vPiso\.xz \) \)/.test(leer('piso/bloques.ts')) && /conContacto = pisoConFormacion\(calidad\) !== undefined && entornoDeLaEscena\(\)\.limite/.test(leer('piso/PisoVivo.tsx')), '  va en la luz de los bloques (se mueve con el mar), sólo con la formación y la bandera')

cerrar('s33-escena8')
