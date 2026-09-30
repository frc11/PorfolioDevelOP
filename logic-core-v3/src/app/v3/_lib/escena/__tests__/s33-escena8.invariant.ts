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
 * T4 · el cielo de día, en la franja del cielo de la noche, detrás de la formación y de la trama; se va con la noche
 *      antes de las estrellas; claro (el texto se lee). [CALIDAD 1] A2: el pintado celeste pasó al producto y las
 *      otras cinco pruebas se borraron (lo afirma s34-calidad1); acá queda lo que sigue valiendo del pintado.
 * T5 · la colisión con el logo: contra el campo de distancia de la malla real (una «c» de prueba, extruida por
 *      three como el logo: la boca de la «c» queda afuera, donde el anillo de ESCENA 7 la cerraba). [CALIDAD 1] A3:
 *      el pegado se borró (lo afirma s34).
 */
import * as THREE from 'three'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, entornoPedido } from '../entorno'
import { FALLA_S, FIRME, GUION, GUION_S, guionEn } from '../entorno/encendido'
import { LIMITE, TRAMA_ANCLADA, ZOCALO, contactoDeLaTrama } from '../moire/limite'
import { bandEnvelope } from '../moireTextures'
import { AMANECER, avanceDelCuadro, avanceDelScroll, diaParaElTexto, perseguir, type CuadroDelAmanecer } from '../amanecer/linea'
import * as linea from '../amanecer/linea'
import { CAMPO_DEL_LOGO, campoDelLogo, contornoDeLaMalla, distanciaDelCampo } from '../polvo/campoDelLogo'
import { FISICA } from '../polvo/simulacion'
import { CELESTE, CIELO_DE_DIA, diaDelCielo } from '../cieloDeDia/nubes'
import { ESTRELLAS } from '../estrellas/Estrellas'
import { INK_COLOR } from '../probeScene'
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

// ── T4 · el cielo de día ──────────────────────────────────────────────────
titulo('T4 · el cielo de día (el pintado celeste; [CALIDAD 1] A2 lo pasó al producto)')
const montaje = leer('ProbeStage.tsx')
afirmar(montaje.includes('<CieloDeDia calidad={calidad} />') && /pisoConFormacion\(calidad\) === undefined\) return null/.test(leer('cieloDeDia/CieloDeDia.tsx')), 'montado en la escena; sólo con la formación (es el cielo de afuera)')
// El tono: claro, y celeste.
const rgb = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number]
const lin = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (hex: string): number => { const [r, g, b] = rgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const wcag = (a: string, b: string): number => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
const [cr, , cb] = rgb(CELESTE.alto)
afirmar(cb - cr > 0.04, 'celeste desaturado, con nubes blancas', `arriba ${CELESTE.alto}`)
const peorTinta = Math.min(...[CELESTE.alto, CELESTE.sombra].map((c) => wcag(INK_COLOR, c)))
afirmar(peorTinta > 7, '  claro: la tinta del texto y el negro del logo se despegan de cualquier parte del cielo', `lo peor, ${peorTinta.toFixed(1)}:1 (AA pide 4,5)`)
// Dónde va: en la franja del cielo, detrás de la formación y de la trama; se va con la noche antes de las estrellas.
afirmar(diaDelCielo(0) === 1 && diaDelCielo(ESTRELLAS.umbral.desde) === 0 && CIELO_DE_DIA.radio === FORMACION.radioDelCielo, 'se va con la noche antes de que asomen las estrellas, y está donde el cielo de la noche', `apagado del todo con noche ${String(CIELO_DE_DIA.noche[1])}; las estrellas, desde ${String(ESTRELLAS.umbral.desde)}`)
const cielo = leer('cieloDeDia/CieloDeDia.tsx')
afirmar(/depthWrite: false,\s*toneMapped: false,\s*\}\)\)?\s*const cupula/.test(cielo) && /cupula\.renderOrder = 1000/.test(cielo) && !/transparent: true/.test(cielo), '  opaca y última de lo opaco: antes que la cúpula de la noche (transparente, que lo tapa de noche y lo destapa con el amanecer); no escribe profundidad (las estrellas la pisan)') // [CALIDAD 1] B8: con el dithering la cúpula va envuelta en conDithering(…)
const P8 = CIELO_DE_DIA.pintado
afirmar(P8.union <= 0.06 && P8.tono <= 0.02 && /fwidth\( a \)/.test(leer('cieloDeDia/nubes.ts')), 'pintado: un ciclorama con las uniones de los paneles apenas visibles (un píxel, unos puntos más oscuras) y cada panel con su tono', `${String(P8.paneles)} paneles en la vuelta, cada ${String(P8.cadaGrados)}°; la unión ${(P8.union * 100).toFixed(1)} %, el tono ±${(P8.tono * 50).toFixed(1)} %`)

// ── T5 · la colisión con el logo ──────────────────────────────────────────
titulo('T5 · la colisión contra la malla real del logo')
// Una «c» de prueba: un anillo abierto (la boca a la derecha, 60°), extruido por three como el logo (con bisel).
const [R, r, h] = [2, 1.26, 0.28]
const boca = Math.PI / 6
const c = new THREE.Shape()
c.absarc(0, 0, R, boca, 2 * Math.PI - boca, false)
c.absarc(0, 0, r, 2 * Math.PI - boca, boca, true)
const extruida = new THREE.ExtrudeGeometry(c, { depth: 2 * h, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.007, bevelSegments: 5, curveSegments: 64 })
extruida.translate(0, 0, -h)
const contorno = contornoDeLaMalla([{ posiciones: extruida.getAttribute('position').array, indices: extruida.index?.array ?? null, matriz: new THREE.Matrix4() }])
const campo = campoDelLogo(contorno)
const enElCampo = (q: readonly [number, number, number]): number => distanciaDelCampo(campo, q)
const medio = (R + r) / 2
// Distancias que se saben: en el medio del trazo, afuera del borde, arriba de la cara, en el hueco (más lejos que
// `CAMPO_DEL_LOGO.alcance` el campo es una cota: la física no mira tan lejos).
const casos: [string, readonly [number, number, number], number][] = [
  ['en el medio del trazo', [-medio, 0, 0], -Math.min((R - r) / 2, h + 0.007)],
  ['0,2 afuera del borde', [-(R + 0.2), 0, 0], 0.2],
  ['0,15 arriba de la cara', [0, medio, h + 0.007 + 0.15], 0.15],
  ['en el hueco, a 0,3 del borde de adentro', [-(r - 0.3), 0, 0], 0.3],
]
const errores = casos.map(([, q, esperada]) => Math.abs(enElCampo(q) - esperada))
afirmar(errores.every((e) => e < CAMPO_DEL_LOGO.celda / 2), 'el campo da la distancia a la malla (una «c» de prueba extruida como el logo): dentro de media celda', casos.map(([n], i) => `${n} ${errores[i].toFixed(3)}`).join(' · '))
afirmar(contorno.tramos.length / 4 > 100 && Math.abs(contorno.zMax - contorno.zMin - 2 * (h + 0.007)) < 1e-3, '  el contorno sale de las paredes de costado de la malla (sin el bisel) y el espesor, de la malla', `${String(contorno.tramos.length / 4)} tramos; espesor ${(contorno.zMax - contorno.zMin).toFixed(3)}`)
// La boca de la «c»: el anillo entero de ESCENA 7 la cerraba con una pared que no existe.
const enLaBoca: readonly [number, number, number] = [medio, 0, 0]
const anilloDe7 = (q: readonly [number, number, number]): number => {
  const d2 = Math.abs(Math.hypot(q[0], q[1]) - medio) - (R - r) / 2
  const dz = Math.abs(q[2]) - h
  return Math.hypot(Math.max(d2, 0), Math.max(dz, 0)) + Math.min(Math.max(d2, dz), 0)
}
const afueraEnLaBoca = (d: (q: readonly [number, number, number]) => number): boolean => d(enLaBoca) > 0.3
afirmar(afueraEnLaBoca(enElCampo), 'la boca de la «c» está afuera: ninguna mota se proyecta ni se pega a una pared que no existe', `en la boca, el campo da ${enElCampo(enLaBoca).toFixed(2)} u`)
controlPositivo('el detector VE el anillo entero de ESCENA 7 (cerraba la boca)', anilloDe7, afueraEnLaBoca)
extruida.dispose()
// La física lo usa en el choque, lo posado y lo que desliza. [CALIDAD 1] A3: el pegado se borró y el rodeo del flujo va
// contra la malla real (su propio campo, más grueso y de más alcance: s34).
const sim = leer('polvo/simulacion.ts')
const chocar = /vec3 chocar\( inout vec3 p, inout vec3 v \) \{[\s\S]*?\n\}/.exec(sim)?.[0] ?? ''
afirmar(/float d = campoDelLogo\( q \);/.test(chocar) && /normalDelCampo\( q \)/.test(chocar) && !/caraDelLogo/.test(chocar), 'el choque (lo que cae y se posa sobre el logo, lo que desliza, lo levantado) es contra el campo de la malla real')
afirmar(/float cara = campoDelLogo\( q \);/.test(sim) && /float lejos = campoDelLogo\(/.test(sim) && (sim.match(/normalDelCampo\(/g) ?? []).length >= 3, '  el contacto en el aire y lo que desliza, también')
const rodeo = /vec3 alrededorDelLogo\( vec3 p, vec3 aire \) \{[\s\S]*?\n\}/.exec(sim)?.[0] ?? ''
afirmar(/flujoDelLogo\( q \)/.test(rodeo) && !/caraDelLogo/.test(rodeo), '  [CALIDAD 1] A3: el rodeo del flujo, contra la malla real (el campo del flujo)')
afirmar(/campoDeAPoco\(contorno\)/.test(leer('polvo/Fisica.tsx')) && /requestIdleCallback/.test(leer('polvo/Fisica.tsx')) && /THREE\.Data3DTexture/.test(leer('polvo/campoDelLogo.ts')), '  una textura 3D que se arma una vez al cargar, fuera del cuadro ([CALIDAD 1] B1: de a poco), y se lee en el espacio del logo (sigue su pose)')
// El contacto: con la velocidad relativa a la superficie del logo, a un pelo de ella. [CALIDAD 1] A3: sin pegado.
afirmar(/float entra = - dot\( uVientoDelAire \+ v - velocidadDelLogo\( f \+ d \), n \);/.test(sim) && /v -= n \* min\( 0\.0, dot\( v - velocidadDelLogo\( p \), n \) \);/.test(sim), 'el contacto va con la velocidad relativa a la superficie del logo (que también se mueve)')
afirmar(FISICA.contacto.queda < 0.05, '  a un pelo de la superficie real (ESCENA 7 la dejaba a 0,11 de la forma aproximada)', `${String(FISICA.contacto.queda)} u`)

cerrar('s33-escena8')
