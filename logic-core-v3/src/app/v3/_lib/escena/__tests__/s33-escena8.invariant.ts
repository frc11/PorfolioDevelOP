/**
 * SPRINT ESCENA 8 — la última ronda de contenido, lo que se puede prometer sin navegador. Cada afirmación
 * lleva su control positivo donde el chequeo podría pasar por no mirar nada. Una sección por ticket.
 *
 * T1 · el haz: la mitad de los intentos fallidos (de siete, cuatro), el resto del guion igual.
 * T2 · el límite entre la trama y el piso: las dos capas bajan a pleno hasta debajo del piso (el piso las
 *      corta), la pared lleva un zócalo fino y el piso un contacto al pie de cada capa; sin tapar nada.
 * T3 · el amanecer atado al scroll: encendido; el avance que pide el scroll y el que se muestra, que lo persigue
 *      con una velocidad tope (entero en 2,5 s como mínimo), en las dos direcciones; sin evento donde nadie lo
 *      ve; el texto del final espera al día; el pie no deja al amanecer atrás de lo legible.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, entornoPedido } from '../entorno'
import { FALLA_S, FIRME, GUION, GUION_S, guionEn } from '../entorno/encendido'
import { LIMITE, TRAMA_ANCLADA, ZOCALO, contactoDeLaTrama } from '../moire/limite'
import { bandEnvelope } from '../moireTextures'
import { AMANECER, avanceDelCuadro, avanceDelScroll, diaParaElTexto, perseguir, type CuadroDelAmanecer } from '../amanecer/linea'
import * as linea from '../amanecer/linea'
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

// ── T3 · el amanecer atado al scroll ──────────────────────────────────────
titulo('T3 · el amanecer atado al scroll')
afirmar(ENTORNO.amanecer && !BASE_LIMPIA.amanecer && !entornoPedido('producto,amanecer=no').amanecer && !('amanecer' in ENTORNO.pruebas), 'encendido en el producto (dejó de ser una prueba); el banco lo apaga con `amanecer=no`')
afirmar(!('progresoPorScroll' in linea) && !('acelera' in AMANECER) && !('titulo' in AMANECER), '  ya no es el reloj de ESCENA 7 que se aceleraba ×3 y se cortaba con el título (con un scroll rápido casi no se veía)')
// Lo que pide el scroll: el borde de abajo de Tu panel, de la compuerta al escenario del final ya clavado.
const H = 900
afirmar(avanceDelScroll(AMANECER.visible * H, H) === 0 && avanceDelScroll(AMANECER.hasta * H, H) === 1 && avanceDelScroll(H, H) === 0 && avanceDelScroll(-H, H) === 1, 'el scroll pide de 0 (el borde de Tu panel en la compuerta) a 1 (el escenario del final clavado)', `${((AMANECER.visible - AMANECER.hasta) * H).toFixed(0)} px de scroll a 900 de alto`)
// Lo que se muestra: persigue con un tope, en las dos direcciones.
const dt = 1 / 60
const correrHasta = (desde: number, pedido: number, f: (a: number, p: number, d: number) => number): number => {
  let a = desde
  let t = 0
  while (Math.abs(a - pedido) > 1e-9 && t < 20) {
    a = f(a, pedido, dt)
    t += dt
  }
  return t
}
const entero = correrHasta(0, 1, perseguir)
const deVuelta = correrHasta(1, 0, perseguir)
const conTope = (f: (a: number, p: number, d: number) => number): boolean => correrHasta(0, 1, f) >= AMANECER.minimoS - dt
afirmar(conTope(perseguir) && Math.abs(entero - AMANECER.minimoS) < 2 * dt && Math.abs(deVuelta - entero) < 2 * dt, 'con un scroll rápido se reproduce entero a una velocidad tope, alcanzando al scroll; hacia atrás, igual', `de 0 a 1 en ${entero.toFixed(2)} s; de 1 a 0 en ${deVuelta.toFixed(2)} s`)
controlPositivo('el detector VE el amanecer de ESCENA 7 con un tirón (va derecho a lo que pide el scroll)', (_a: number, p: number) => p, conTope)
let lento = 0
let sigue = 0
for (let t = 0; t < 5; t += dt) {
  const pedido = Math.min(1, t / 4)
  lento = perseguir(lento, pedido, dt)
  sigue = Math.max(sigue, Math.abs(lento - pedido))
}
afirmar(sigue < 1e-9, 'con un scroll lento el avance es el del scroll (lo sigue)', 'el scroll pide de 0 a 1 en 4 s')
// Dónde no hay evento, y el pie.
const cuadro = (c: Partial<CuadroDelAmanecer>): CuadroDelAmanecer => ({ recien: false, carga: false, quieto: false, viaje: false, oculto: false, pie: false, ...c })
afirmar(avanceDelCuadro(0.2, 0.9, dt, cuadro({ recien: true })) === 0 && avanceDelCuadro(0, 0.9, dt, cuadro({ recien: true, carga: true })) === 0.9 && avanceDelCuadro(0, 0.9, dt, cuadro({ recien: true, viaje: true })) === 0.9, 'al entrar scrolleando arranca de la noche; al cargar ya adentro del final o en un viaje del menú, sin evento')
afirmar(avanceDelCuadro(0.2, 1, dt, cuadro({ oculto: true })) === 1 && avanceDelCuadro(0.2, 1, dt, cuadro({ quieto: true })) === 1 && avanceDelCuadro(0.9, 0, dt, cuadro({ quieto: true })) === 0, '  donde nadie lo ve (el bloque tapa, o la escena vuelve de estar suspendida) va derecho; con menos movimiento, de una vez')
afirmar(avanceDelCuadro(0.1, 1, dt, cuadro({ pie: true })) >= AMANECER.texto.abajo[1] && avanceDelCuadro(0.1, 1, dt, cuadro({})) < 0.2, 'el pie (compartido: no espera) a la vista no deja al amanecer atrás de lo legible', `salta a ${String(AMANECER.texto.abajo[1])} (medido: debajo de 0,9 la tinta del pie da 1,4 a 3,4)`)
// El texto del final espera al día.
afirmar(diaParaElTexto(AMANECER.texto.frase[0], 'frase') === 0 && diaParaElTexto(AMANECER.texto.frase[1], 'frase') === 1 && diaParaElTexto(AMANECER.texto.abajo[0], 'abajo') === 0 && diaParaElTexto(AMANECER.texto.abajo[1], 'abajo') === 1, 'el texto del final espera al día: la frase (sobre las paredes) y, más tarde, los valores y el CTA (sobre el piso)', `frase de ${String(AMANECER.texto.frase[0])} a ${String(AMANECER.texto.frase[1])}; abajo de ${String(AMANECER.texto.abajo[0])} a ${String(AMANECER.texto.abajo[1])}`)
const clavado = avanceDelScroll(0, H)
afirmar(diaParaElTexto(clavado, 'frase') === 1, '  con un scroll lento no cambia nada: cuando el escenario se clava (y llega la frase) el día ya está', `el avance con el escenario recién clavado: ${clavado.toFixed(2)}`)
const final = readFileSync(path.join(process.cwd(), 'src/app/v3/_secciones/por-que-develop/PorQueDevelop.tsx'), 'utf8')
afirmar(/useLlegadaDeDia\(pin, VENTANA_DE_LA_FRASE, 'frase'\)/.test(final) && /useLlegadaDeDia\(pin, ventanaDelValor\(indice\), 'abajo'\)/.test(final) && (final.match(/useLlegadaDeDia\(pin, VENTANA_DEL_(CTA|DESTACADO), 'abajo'\)/g) ?? []).length === 2, '  el escenario de Por qué develOP lo lee: la frase, cada valor, el CTA y su destacado')
afirmar(/Math\.min\(t, d\)/.test(final) && !/opacity: DIA_DEL_TEXTO/.test(final), '  como un tope de la llegada (la pieza llega con su gesto cuando hay día), no como una opacidad encima')
const amanecer = leer('amanecer/Amanecer.tsx')
afirmar(/DIA_DEL_TEXTO\.frase\.set\(m\.activo \? diaParaElTexto\(m\.avance, 'frase'\) : 1\)/.test(amanecer) && /quieto=\{reducedMotion\}/.test(leer('ProbeStage.tsx')), 'la escena lo escribe en cada cuadro (1 fuera del amanecer) y sabe si hay menos movimiento')

cerrar('s33-escena8')
