/**
 * PULIDO 13 — el invariante: npm run test:s64-pulido-13
 *
 * Lo que pidió el humano sobre PULIDO 11 y 12, cada cosa con su control positivo (el detector ve el estado de antes). Los recibos
 * medidos, en `docs/rediseno/entregas/pulido-13/`; el log, `docs/rediseno/SPRINT-PULIDO-13.md`.
 *   0 · lo que se borró con su código: el volteo «columpio», la carga «trazo» y la caída «ángulo» (ganaron el centrado, el giro y
 *       la caída de siempre).
 *   K2 a · la placa de Contacto crece pareja desde el primer cuadro (ni congelada ni a saltos).
 *   K2 b · la carga es UNA pieza que gira sobre el eje del palito de la P: sin perspectiva, el eje en el medio del espesor, capas
 *          sin rendijas y, de canto, las secciones de adentro (sin rayas).
 *   K2 c · el éxito encaja y SE ENCIENDE adentro de su forma: nada de luz que salga de los bordes.
 *   K2 d e · el envío del panel la primera vez, sin cuadros trabados (la tarjeta se precalienta con la placa quieta).
 *   K3 · el sonido del éxito y el del error, calibrados contra el pulso y el golpe.
 *   K4 a · la cámara de la caída: quieta hasta que el logo se inclina a su altura y desde ahí, atada al ángulo, lo mira de frente
 *          (también al rebobinar: el giro del quieto y la órbita se van antes de que el logo se levante).
 *   K4 b · el mail del pie sin ejemplo; el autocompletado no cambia el campo y no vuelve.
 *   K5 · en el teléfono, nada queda debajo de los controles fijos en el reposo de ninguna sección: la zona de la cabecera (el pie
 *        entra entero en una pantalla de 320 × 824; Demos arranca debajo) y, al fondo de una pantalla baja, los controles se retiran.
 *   K6 · los hilos de energía (`?hilos=si|color`) con volumen: haces de fibras en hélice alrededor de una espina, la luz que se suma
 *        en el medio, la lejanía, la velocidad, chispas sobrias, por detrás del texto; en la GPU, dentro del cuadro.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'

import { CARGA, EJE_DEL_PALITO, capasDelGiro, type TamanoDeLaCarga } from '../../_componentes/carga/Carga'
import { ENCAJE } from '../../_componentes/formularios/EncajeDelLogo'
import { PRECALENTAR } from '../../_componentes/formularios/PrecalentarElResultado'
import { ENTRADA_DEL_PARALAJE, ESCALA_AL_NACER, PERSPECTIVA_DE_LA_PLACA, TRANSICIONES, escalaDelViaje, viajeDesdeElFondo } from '../../_chrome/contacto/placa'
import { SONIDOS } from '../sonido/catalogo'
import { CORTES_DEL_SPRITE } from '../sonido/sprite'
import { PRUEBAS_SUELTAS } from '../escena/entorno'
import { CAIDA_AL_HUECO, anguloEnElReloj } from '../escena/final/caidaAlHueco'
import { FIN_DEL_GOLPE, LOGO_DE_SIEMPRE, RELOJ_DEL_FINAL, blancoDelFinal, camaraDelFinal, elevacionDe, orbitaDelFinal, poseDelLogo, quedaDelQuieto, segundosDelFinal, subida } from '../escena/final/recorridoDelFinal'
import { retiradaAlFondo } from '../../_chrome/recorrido/cabeceraAlFondo'
import { FRAGMENTOS_DE_LOS_HILOS, HILOS, VERTICES_DE_LOS_HILOS, semillasDeLosHilos } from '../escena/hilos/hilos'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const recibo = <T,>(nombre: string): T => JSON.parse(readFileSync(`docs/rediseno/entregas/pulido-13/${nombre}`, 'utf8')) as T

// ═══════════════════════════════════════════════════════════════════════════
titulo('0 · Lo que se borró con su código')
// Sin los comentarios: la historia (qué se borró y por qué) queda escrita.
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const VOLTEO = sinComentarios(leer('_lib/formularios/volteo.ts'))
const CARGA_TSX = leer('_componentes/carga/Carga.tsx')
const CAIDA = sinComentarios(leer('_lib/escena/final/caidaAlHueco.ts'))
const borrados = (volteo: string, carga: string, caida: string, sueltas: readonly string[]): boolean =>
  !/columpio|varianteDeLaPagina/.test(volteo) && !/function Trazo|varianteDeLaCarga|carga=/.test(sinComentarios(carga)) && !/VarianteDeLaCaida|varianteDeLaCaida|'angulo'/.test(caida) && !sueltas.includes('caida')
afirmar(borrados(VOLTEO, CARGA_TSX, CAIDA, PRUEBAS_SUELTAS), '0 · sin `?volteo=columpio`, sin `?carga=trazo` (con movimiento reducido, el logo quieto) y sin `?caida=angulo`: ni la bandera ni su código')
controlPositivo('0 · el detector VE la caída con su variante', `${CAIDA}\nexport type VarianteDeLaCaida = 'lenta' | 'angulo'`, (c: string) => borrados(VOLTEO, CARGA_TSX, c, PRUEBAS_SUELTAS))
controlPositivo('  y la bandera que sigue suelta', [...PRUEBAS_SUELTAS, 'caida'], (s: readonly string[]) => borrados(VOLTEO, CARGA_TSX, CAIDA, s))

// ═══════════════════════════════════════════════════════════════════════════
titulo('K2 a · La placa de Contacto crece pareja desde el primer cuadro')

// El modelo: el ancho aparente en cada cuadro de 75 Hz (la pantalla del banco) a lo largo del viaje. Parejo = siempre crece, nunca
// se queda quieto y ningún cuadro crece más de 1,5 veces lo que creció el anterior (un salto). Antes, los cuadros clave de `z` en
// recta: entre dos, el tamaño (d / (d − z)) casi no crecía y después se disparaba.
const CUADRO_S = 1 / 75
const anchosDe = (escalaEn: (t: number) => number): number[] => Array.from({ length: Math.ceil(TRANSICIONES.viaje.duration / CUADRO_S) + 1 }, (_, k) => escalaEn(Math.min(1, (k * CUADRO_S) / TRANSICIONES.viaje.duration)))
const parejo = (anchos: readonly number[]): boolean => {
  const pasos = anchos.slice(1).map((a, i) => a - anchos[i])
  const hastaElFinal = pasos.slice(0, -1)
  return hastaElFinal.every((p) => p > 0) && hastaElFinal.every((p, i) => i === 0 || p <= 1.5 * hastaElFinal[i - 1] + 1e-9)
}
const d = PERSPECTIVA_DE_LA_PLACA
const conCuadrosClave = (t: number): number => {
  const zs = viajeDesdeElFondo(16)
  const x = t * 16
  const i = Math.min(15, Math.floor(x))
  const z = zs[i] + (zs[i + 1] - zs[i]) * (x - i)
  return d / (d - z)
}
afirmar(parejo(anchosDe(escalaDelViaje)) && escalaDelViaje(0) === ESCALA_AL_NACER && escalaDelViaje(1) === 1, 'K2 a · el modelo: a 75 Hz el tamaño aparente crece en cada cuadro, sin quedarse quieto y sin saltos (ningún cuadro más de 1,5 veces el anterior)')
controlPositivo('K2 a · el detector VE el viaje de antes (cuadros clave de z en recta)', conCuadrosClave, (f: (t: number) => number) => parejo(anchosDe(f)))

// El código: se anima la fracción y `z` sale de la escala en cada cuadro; mientras espera al fondo, la placa no se ve.
const PLACA_TSX = leer('_chrome/contacto/PlacaDelContacto.tsx')
const cableado = (p: string): boolean =>
  p.includes('const z = useTransform(progreso, (t) => zDeLaEscala(escalaDelViaje(t)))') && p.includes('const viaje = animate(progreso, 1, TRANSICIONES.viaje)') &&
  p.includes('initial={{ opacity: 0 }}') && p.includes('animate={{ opacity: 1, transition: { duration: 0.1, delay: TRANSICIONES.viaje.delay } }}') && !/z: \[\.\.\./.test(p)
afirmar(cableado(PLACA_TSX), '  el código: la fracción en recta, su escala en cada cuadro, y el escenario a la vista recién cuando el viaje arranca')
controlPositivo('  el detector VE el punto quieto a la vista durante la espera', PLACA_TSX.replace('initial={{ opacity: 0 }}', 'initial={{ opacity: 1 }}'), cableado)

// Medido (1440 × 900): el ancho de la placa cuadro a cuadro. Ningún salto (antes, de 19 a 98 px en 4 cuadros: «5 veces más grande»).
type Ancho = readonly [number, number, number]
const APERTURA = recibo<{ antes: Ancho[]; despues: Ancho[] }>('k2-apertura.json')
const sinSaltos = (anchos: readonly Ancho[]): boolean => {
  // Desde el último cuadro de la espera (el punto, todavía invisible) en adelante.
  const k0 = anchos.findIndex(([, , w]) => w !== anchos[0][2])
  const vivos = anchos.slice(Math.max(0, k0 - 1)).map(([, , w]) => w)
  const pasos = vivos.slice(1).map((w, i) => w - vivos[i]).filter((p) => p > 0)
  const mediana = [...pasos].sort((a, b) => a - b)[Math.floor(pasos.length / 2)]
  return pasos.length > 30 && pasos.every((p) => p <= 1.5 * mediana)
}
afirmar(sinSaltos(APERTURA.despues), `  medido: ningún cuadro crece más de 1,5 veces la mediana (${String(APERTURA.despues.length)} cuadros)`)
controlPositivo('  el detector VE la apertura de antes', APERTURA.antes, sinSaltos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('K2 b · La carga es UNA pieza que gira sobre el eje del palito')
const TAMANOS: readonly TamanoDeLaCarga[] = ['chico', 'medio', 'grande']
const unaPieza = (c: string, capas: (t: TamanoDeLaCarga) => number): boolean =>
  // Sin perspectiva: de frente la cara de atrás queda exactamente detrás de la de adelante (no asoma un contorno corrido).
  !/perspective/.test(c.slice(c.indexOf('function Giro('))) &&
  // El eje: el palito de la P, en el medio del espesor (sobre la cara de adelante el cuerpo giraba de costado).
  c.includes('transformOrigin: `${eje} 50% calc(${lado} * ${String(-espesor / 2)})`') &&
  // Las capas sin rendijas: a lo sumo `separacionPx` entre dos, en cada tamaño.
  TAMANOS.every((t) => (CARGA.giro.espesor * CARGA.ladoPx[t]) / (capas(t) - 1) <= CARGA.giro.separacionPx) &&
  // De canto: las secciones de adentro, giradas 90° y centradas en el espesor, en todo el ancho de la tinta y en el eje.
  c.includes('{[...CARGA.secciones, EJE_DEL_PALITO].map((f) => (') && c.includes('rotateY(90deg)`') && c.includes('preserveAspectRatio="none"')
const repartidas = (s: readonly number[]): boolean => s.length >= 6 && s[0] <= 0.1 && s[s.length - 1] >= 0.85 && s.every((x, i) => i === 0 || x - s[i - 1] <= 0.15)
afirmar(unaPieza(CARGA_TSX, capasDelGiro) && repartidas(CARGA.secciones) && Math.abs(EJE_DEL_PALITO - 0.5877) < 0.01, `K2 b · sin perspectiva, el eje en el palito y en el medio del espesor, ${TAMANOS.map((t) => `${String(capasDelGiro(t))} capas`).join(' / ')} (≤ ${String(CARGA.giro.separacionPx)} px entre dos) y ${String(CARGA.secciones.length + 1)} secciones de canto`)
controlPositivo('K2 b · el detector VE el giro de antes (9 capas para todos los tamaños)', () => 9, (f: (t: TamanoDeLaCarga) => number) => unaPieza(CARGA_TSX, f))
controlPositivo('  el eje sobre la cara de adelante', CARGA_TSX.replace('transformOrigin: `${eje} 50% calc(${lado} * ${String(-espesor / 2)})`', 'transformOrigin: `${eje} 50%`'), (c: string) => unaPieza(c, capasDelGiro))
controlPositivo('  y sin las secciones (de canto, rayas)', CARGA_TSX.replace('{[...CARGA.secciones, EJE_DEL_PALITO].map((f) => (', '{[].map((f) => ('), (c: string) => unaPieza(c, capasDelGiro))

// ═══════════════════════════════════════════════════════════════════════════
titulo('K2 c · El éxito encaja y se enciende: nada de luz afuera de los bordes')
const ENCAJE_TSX = leer('_componentes/formularios/EncajeDelLogo.tsx')
const sinLuzAfuera = (e: string): boolean => {
  const pieza = e.slice(e.indexOf('<motion.g initial={false} animate={pieza}'), e.indexOf('</motion.g>'))
  return (
    // Nada que se abra ni resplandezca alrededor: ni la onda (un contorno que crece), ni la elipse, ni un degradé.
    !/ellipse|radialGradient|ENCAJE\.onda/.test(e) &&
    // El borde que se enciende es sólo el del error (el rojo).
    e.includes('{!exito && (\n        <motion.path d={LOGO_PATH_D} fill="none" strokeWidth={10} stroke="var(--rojo-del-error)"') &&
    // La luz del éxito vive ADENTRO de la pieza (su misma forma): cae apagada, sube al claro y se asienta.
    pieza.includes('data-luz-de-la-pieza=""') && ENCAJE.luz.apagada > ENCAJE.luz.queda && ENCAJE.luz.queda > 0 && ENCAJE.luz.queda < 0.2
  )
}
afirmar(sinLuzAfuera(ENCAJE_TSX), `K2 c · sin la onda, el resplandor ni el borde que se enciende; la pieza cae apagada (${String(ENCAJE.luz.apagada)}), se enciende y queda en ${String(ENCAJE.luz.queda)}`)
controlPositivo('K2 c · el detector VE la onda de luz de antes', ENCAJE_TSX.replace('<motion.g initial={false} animate={pieza}', '<motion.ellipse fill={`url(#luz-${id})`} />\n      <motion.g initial={false} animate={pieza}'), sinLuzAfuera)

// ═══════════════════════════════════════════════════════════════════════════
titulo('K2 d e · El envío del panel, la primera vez, sin cuadros trabados')
type Cuadros = readonly (readonly [number, number])[]
const FRIO = recibo<{ antes: { error: Cuadros; exito: Cuadros }; despues: { error: Cuadros; exito: Cuadros }; precalentadoDelPanel: { apertura: Cuadros } }>('k2-frio.json')
const fluido = (r: { error: Cuadros; exito: Cuadros }): boolean => [...r.error, ...r.exito].every(([, ms]) => ms <= 20)
// El precalentado: las dos tarjetas, del tamaño de la de verdad, con la placa ya quieta (llegó y entró el paralaje).
const FORM_TSX = leer('_chrome/contacto/FormularioDeContacto.tsx')
const precalienta = (f: string): boolean =>
  f.includes('(TRANSICIONES.viaje.delay + TRANSICIONES.viaje.duration + ENTRADA_DEL_PARALAJE.duration) * 1000 + 100') && f.includes("<PrecalentarElResultado activo={precalentar && fase === 'formulario'} compacto={compacto} />") &&
  PRECALENTAR.opacidad > 0 && PRECALENTAR.opacidad <= 0.02 && PRECALENTAR.ms >= 1000 && ENTRADA_DEL_PARALAJE.duration > 0
afirmar(fluido(FRIO.despues) && precalienta(FORM_TSX), 'K2 d e · medido en frío (sin la caché de sombreadores): el error y el éxito del panel sin un cuadro de más de 20 ms; la tarjeta se precalienta con la placa quieta')
controlPositivo('K2 d e · el detector VE el frío de antes (67, 213 y 107 ms con el error)', FRIO.antes, fluido)
afirmar(FRIO.precalentadoDelPanel.apertura.every(([t, ms]) => ms <= 20 || t < TRANSICIONES.viaje.delay * 1000 + 150 || t > (TRANSICIONES.viaje.delay + TRANSICIONES.viaje.duration + ENTRADA_DEL_PARALAJE.duration) * 1000), '  y lo que cuesta precalentar cae con la placa quieta (no en su viaje ni en la entrada del paralaje)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('K3 · El sonido del éxito y el del error')
const SONIDO_MD = readFileSync('docs/rediseno/SONIDO.md', 'utf8')
const SONORIDAD = recibo<{ lufs: Record<'golpe' | 'pulso' | 'pestillo' | 'exito' | 'error', number> }>('k3-sonoridad.json')
const efectiva = (s: 'golpe' | 'pulso' | 'pestillo' | 'exito' | 'error', vol: number): number => SONORIDAD.lufs[s] + 20 * Math.log10(vol)
const calibrados = (volExito: number, volError: number): boolean => {
  const [ex, er] = [efectiva('exito', volExito), efectiva('error', volError)]
  // Debajo del pulso y del golpe (son la respuesta de un formulario, no un momento de la escena), arriba de los clics.
  return [ex, er].every((v) => v < efectiva('pulso', SONIDOS.pulso.volumen) - 4 && v < efectiva('golpe', SONIDOS.golpe.volumen) - 8 && v > efectiva('pestillo', SONIDOS.pestillo.volumen) + 6)
}
const enSuLugar = (e: string, md: string): boolean =>
  'exito' in CORTES_DEL_SPRITE && 'error' in CORTES_DEL_SPRITE && e.includes("sonar(exito ? 'exito' : 'error')") && md.includes('| `exito` |') && md.includes('| `error` |') && md.includes('no imita ningún sonido de marca')
afirmar(calibrados(SONIDOS.exito.volumen, SONIDOS.error.volumen) && enSuLugar(ENCAJE_TSX, SONIDO_MD), `K3 · en el sprite y en el contacto de la pieza; ${efectiva('exito', SONIDOS.exito.volumen).toFixed(1)} y ${efectiva('error', SONIDOS.error.volumen).toFixed(1)} LUFS contra el pulso (${efectiva('pulso', 1).toFixed(1)}) y el golpe (${efectiva('golpe', 1).toFixed(1)})`)
controlPositivo('K3 · el detector VE un éxito a todo volumen (más fuerte que el pulso)', 1, (v: number) => calibrados(v, SONIDOS.error.volumen))
controlPositivo('  y el pestillo y el pulso de antes en el contacto', ENCAJE_TSX.replaceAll("sonar(exito ? 'exito' : 'error')", "sonar(exito ? 'pestillo' : 'pulso')"), (e: string) => enSuLugar(e, SONIDO_MD))

// ═══════════════════════════════════════════════════════════════════════════
titulo('K4 a · La cámara de la caída: el logo la mira de frente')

// El modelo: la pose E (la cámara del recorrido al llegar al pie, sin el mouse: (0, 5, 40) mirando al centro de la órbita, medida en
// el banco), la cámara del final y la pose del logo en cada 1/240 del reloj. El ángulo entre el eje de la cámara y la normal de la
// cara (0, sen a, cos a). Mientras el logo no llegó a la altura de la cámara (`e0`), la cámara no se mueve; desde ahí, de frente.
const POSE_E = new THREE.Vector3(0, 5, 40)
const e0 = elevacionDe(POSE_E)
const camara = new THREE.PerspectiveCamera(32, 1440 / 900, 0.1, 400)
const blanco = new THREE.Vector3()
const pose = { centro: new THREE.Vector3(), rotacionX: 0 }
const adelante = new THREE.Vector3()
interface Recorrida { readonly quietaHastaLaAltura: boolean; readonly peorDesdeLaAltura: number; readonly peorAntes: number }
const recorrer = (sube: (fin: number) => number): Recorrida => {
  let [quieta, peor, antes] = [true, 0, 0]
  for (let s = 0; s <= CAIDA_AL_HUECO.golpeS; s += 1 / 240) {
    const fin = s / RELOJ_DEL_FINAL.duracionS
    camara.position.copy(POSE_E)
    camara.lookAt(0, 0, 0)
    camaraDelFinal(camara, sube(fin), blancoDelFinal(fin, blanco), 0, 0, null)
    poseDelLogo(fin, LOGO_DE_SIEMPRE, pose)
    const a = -pose.rotacionX
    adelante.set(0, 0, -1).applyQuaternion(camara.quaternion)
    const angulo = THREE.MathUtils.radToDeg(Math.acos(Math.min(1, -(adelante.y * Math.sin(a) + adelante.z * Math.cos(a)))))
    const { toco } = anguloEnElReloj(LOGO_DE_SIEMPRE, s)
    if (a < e0) {
      if (camara.position.distanceTo(POSE_E) > 1e-6) quieta = false
      antes = Math.max(antes, angulo)
    } else if (!toco) peor = Math.max(peor, angulo)
  }
  return { quietaHastaLaAltura: quieta, peorDesdeLaAltura: peor, peorAntes: antes }
}
const deFrente = (r: Recorrida): boolean => r.quietaHastaLaAltura && r.peorDesdeLaAltura < 1 && r.peorAntes <= THREE.MathUtils.radToDeg(e0) + 0.1
const conLaCaida = recorrer((fin) => subida(fin, LOGO_DE_SIEMPRE, e0))
afirmar(deFrente(conLaCaida), `K4 a · el modelo: la cámara quieta hasta que el logo se inclina a su altura (${THREE.MathUtils.radToDeg(e0).toFixed(1)}°) y desde ahí hasta el golpe, de frente (peor ${conLaCaida.peorDesdeLaAltura.toFixed(2)}°)`)
// La subida de antes: un reloj propio desde el arranque (el 80 % con el logo todavía de pie y el resto hasta 0,4 s después del golpe).
const suavePaso = (x: number): number => { const u = Math.min(1, Math.max(0, x)); return u * u * u * (u * (u * 6 - 15) + 10) }
const subidaDeAntes = (fin: number): number => { const s = segundosDelFinal(fin); return 0.8 * suavePaso(s / 2.6) + 0.2 * suavePaso((s - 2.6) / (CAIDA_AL_HUECO.golpeS + 0.4 - 2.6)) }
controlPositivo('K4 a · el detector VE la cámara de antes (subía con el logo de pie y lo seguía tarde)', recorrer(subidaDeAntes), deFrente)

// El rebobinado: el giro del quieto y la órbita del mouse terminan en el golpe (después, el logo se levanta y la cámara lo sigue).
const CUADRO_FINAL = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const alRebobinar = (queda: (fin: number, desde: number) => number, orbita: (fin: number) => number, c: string): boolean =>
  queda(FIN_DEL_GOLPE, 1) === 0 && queda(1, 1) === 1 && queda(0.9, 1) > 0 && orbita(FIN_DEL_GOLPE) === 0 && orbita(1) === 1 &&
  c.includes('quietoRebobinado(alRebobinar, quedaDelQuieto(fin, s.reloj.rebobinado.desde), EN_VIVO)') && c.includes('ponerLaOrbita(state.camera, EN_VIVO.blanco, s.orbita.h * orbita, s.orbita.v * orbita)') &&
  c.includes('const sinMouse = sinElParalaje(fin, tamano, elevacion)') && c.includes('const sube = subida(fin, tamano, elevacion)')
afirmar(alRebobinar(quedaDelQuieto, orbitaDelFinal, CUADRO_FINAL), '  y al rebobinar: el giro del quieto y la órbita se van del todo antes de que el logo se levante; la cámara viva, sin el paralaje del recorrido mientras sube')
controlPositivo('  el detector VE el quieto que volvía con el rebobinado entero', (fin: number, desde: number) => fin / desde, (q: (fin: number, desde: number) => number) => alRebobinar(q, orbitaDelFinal, CUADRO_FINAL))

// Medido (1440 × 900, el mouse a un costado): con el reloj clavado y en vivo, de frente desde la altura de la cámara; al rebobinar.
const CAIDA_MEDIDA = recibo<{ clavados: [number, number, number][]; cayendo: [number, number][]; rebobinado: { antes: number; despues: number } }>('k4-caida.json')
const medidoDeFrente = (r: typeof CAIDA_MEDIDA): boolean =>
  r.clavados.filter(([s, a]) => a >= 7.5 && s < CAIDA_AL_HUECO.golpeS).every(([, , g]) => g < 1) && r.clavados.filter(([s, a]) => a >= 7.5 && s < CAIDA_AL_HUECO.golpeS).length >= 8 &&
  r.cayendo.filter(([a]) => a >= 7.5 && a < 89).every(([, g]) => g < 1) && r.rebobinado.despues < 4
afirmar(medidoDeFrente(CAIDA_MEDIDA), `  medido: de frente (< 1°) en todo el vuelco desde la altura de la cámara; al rebobinar, a lo sumo ${String(CAIDA_MEDIDA.rebobinado.despues)}° (era ${String(CAIDA_MEDIDA.rebobinado.antes)}°)`)
controlPositivo('  el detector VE el rebobinado de antes', { ...CAIDA_MEDIDA, rebobinado: { ...CAIDA_MEDIDA.rebobinado, despues: CAIDA_MEDIDA.rebobinado.antes } }, medidoDeFrente)

// ═══════════════════════════════════════════════════════════════════════════
titulo('K4 b · El mail del pie sin ejemplo; el autocompletado no cambia el campo y no vuelve')
const PIE_TSX = leer('_secciones/cierre/FormularioDelPie.tsx')
const FOCO_CSS = leer('_estilos/foco.css')
const sinEjemplo = (p: string): boolean => !/placeholder=/.test(p) && !leer('_secciones/cierre/contenido.ts').includes('ejemploDeMail')
afirmar(sinEjemplo(PIE_TSX), 'K4 b · el mail del pie, vacío (sin «nombre@dominio»)')
controlPositivo('K4 b · el detector VE el ejemplo de antes', PIE_TSX.replace('data-foco="campo"', "data-foco=\"campo\"\n                  placeholder={k === 'mail' ? c.ejemploDeMail : undefined}"), sinEjemplo)
// La causa: la regla del foco de los campos (sin capa) le ganaba a la demora del autocompletado (una utilidad, en su capa) y el
// celeste del navegador entraba en media duración rápida. La regla del autocompletado, con más especificidad, lo demora para siempre.
const demora = (css: string): boolean => {
  const i = css.indexOf('[data-v3] [data-foco="campo"]:autofill {')
  const regla = i < 0 ? '' : css.slice(i, css.indexOf('}', i))
  return regla.includes('transition-duration: var(--demora-del-autocompletado), var(--demora-del-autocompletado),') && css.indexOf('transition-property: color, background-color, border-color, box-shadow;') >= 0
}
const AUTO = recibo<{ antes: { autocompletado: { fondo: string; autofill: boolean }[] }; despues: { autocompletado: { fondo: string; autofill: boolean; valor: string }[]; lejos: { valor: string; autofill: boolean }[]; deVuelta: { valor: string; autofill: boolean }[] } }>('k4-autocompletado.json')
const transparente = (campos: readonly { fondo: string; autofill: boolean }[]): boolean => campos.filter((c) => c.autofill).length >= 2 && campos.filter((c) => c.autofill).every((c) => /rgba\(.*, 0\)$/.test(c.fondo))
afirmar(demora(FOCO_CSS) && transparente(AUTO.despues.autocompletado), 'K4 b · la causa: el campo autocompletado conserva su fondo (medido: transparente, antes el celeste del navegador)')
controlPositivo('K4 b · el detector VE el celeste de antes', AUTO.antes.autocompletado, transparente)
controlPositivo('  y la regla del foco sin la del autocompletado', FOCO_CSS.replace('[data-v3] [data-foco="campo"]:autofill {', '[data-v3] [data-foco="campo"]:hover {'), demora)
const noVuelve = (p: string, r: typeof AUTO.despues): boolean =>
  p.includes('const mirar = new IntersectionObserver(([e]) => {') && p.includes("el.querySelector(`#contacto-${k}`)?.matches(':autofill') === true") && p.includes('setVuelta((v) => v + 1)') &&
  r.lejos.every((c) => !c.autofill && c.valor === '') && r.deVuelta.every((c) => !c.autofill && c.valor === '')
afirmar(noVuelve(PIE_TSX, AUTO.despues), '  y al irse del pie lo autocompletado se vacía y los campos se vuelven a montar: al volver, vacíos y sin el estado (medido)')
controlPositivo('  el detector VE los campos de antes al volver (con lo autocompletado)', { ...AUTO.despues, deVuelta: AUTO.antes.autocompletado.map((c) => ({ ...c, valor: 'Ana Prueba' })) }, (r: typeof AUTO.despues) => noVuelve(PIE_TSX, r))

// ═══════════════════════════════════════════════════════════════════════════
titulo('K5 · En el teléfono, nada debajo de los controles fijos')
interface ParadaK5 { readonly cuadro: string; readonly destino: string; readonly controles: readonly string[]; readonly cruces: readonly unknown[] }
const K5 = recibo<{ antes: ParadaK5[]; despues: ParadaK5[] }>('k5-controles.json')
// Medido: en el reposo de cada sección (los 7 destinos del recorrido) y al fondo, de 320 a 820, ningún control fijo pisa contenido.
const sinCruces = (r: readonly ParadaK5[]): boolean => r.length >= 56 && r.every((p) => p.cruces.length === 0) && ['320x824', '320x568', '375x667', '390x844', '414x896', '768x1024', '820x1180'].every((c) => r.some((p) => p.cuadro === c))
afirmar(sinCruces(K5.despues), `K5 · medido: ${String(K5.despues.length)} paradas (7 secciones y el fondo, en 8 cuadros de 320 a 820): ningún cruce entre los controles fijos y el contenido`)
controlPositivo('K5 · el detector VE los cruces de antes (el titular del pie a 320 × 824, Demos a 320, el mail y WhatsApp a 375)', K5.antes, sinCruces)
// Y al fondo de 320 × 824 (el del humano) los controles se QUEDAN: el pie entra entero; se retiran sólo donde no entra.
const fondoBien = (r: readonly ParadaK5[]): boolean => r.some((p) => p.cuadro === '320x824' && p.destino === 'fondo' && p.controles.length === 3) && r.some((p) => p.cuadro === '375x667' && p.destino === 'fondo' && p.controles.length === 0)
afirmar(fondoBien(K5.despues), '  al fondo de 320 × 824 los controles se quedan (el pie entra entero); en una pantalla baja (375 × 667), se retiran')
// El código: la zona de la cabecera (el pie y Demos) y el retiro al fondo (sólo al fondo y con el pie más alto que la pantalla).
const BANDA = leer('_estilos/banda.css')
const BARRA_CSS = leer('_estilos/barra.css')
const zonaBien = (banda: string, barra: string, retira: typeof retiradaAlFondo): boolean =>
  barra.includes('--zona-de-la-cabecera: calc(max(var(--spacing-4), env(safe-area-inset-top)) + var(--spacing-12) + var(--spacing-4));') &&
  /\[data-v3\] \[data-panel='cierre'\] \[data-pieza='pie'\] \{\s*padding-block: var\(--zona-de-la-cabecera\) var\(--spacing-4\);/.test(banda) &&
  leer('_secciones/trabajos/demos/CapaDeDemos.tsx').includes('max-escritorio:content-center max-escritorio:pt-[var(--zona-de-la-cabecera)]') &&
  barra.includes('[data-v3][data-cabecera-retirada] :is([aria-controls="menu-movil"], [data-parte="lugar-del-parlante"], [data-pieza="infinito-del-recorrido"]) {') &&
  // Al fondo con el pie más alto que la pantalla, sí; al fondo con el pie entero, o lejos del fondo, no.
  retira(1000, 600, 1600, -40) && !retira(1000, 600, 1600, 10) && !retira(800, 600, 1600, -400)
afirmar(zonaBien(BANDA, BARRA_CSS, retiradaAlFondo), '  el código: la zona de la cabecera (los controles más un aire, con el inset seguro) arriba del pie y de Demos, y el retiro sólo al fondo con el pie cortado')
controlPositivo('  el detector VE un retiro que se queda retirado lejos del fondo', ((s: number, a: number, t: number, arriba: number) => arriba < 0 || s + a >= t) as typeof retiradaAlFondo, (f: typeof retiradaAlFondo) => zonaBien(BANDA, BARRA_CSS, f))

// ═══════════════════════════════════════════════════════════════════════════
titulo('K6 · Los hilos con volumen')
// Haces de fibras: las fibras de un mismo haz comparten su espina (la órbita y el campo) y cada una va a su distancia y su ángulo;
// unos haces finos y otros anchos; más fibras cerca de la espina (el núcleo).
const SEMILLAS = semillasDeLosHilos()
const conVolumen = (sem: ReturnType<typeof semillasDeLosHilos>): boolean => {
  const F = HILOS.fibras
  let comparten = true
  let distintas = 0
  const aberturas: number[] = []
  for (let h = 0; h < HILOS.haces; h += 1) {
    for (let j = 1; j < F; j += 1) {
      for (let c = 0; c < 4; c += 1) if (sem.a[(h * F + j) * 4 + c] !== sem.a[h * F * 4 + c] || sem.b[(h * F + j) * 4 + c] !== sem.b[h * F * 4 + c]) comparten = false
      if (sem.c[(h * F + j) * 4] !== sem.c[h * F * 4] || sem.c[(h * F + j) * 4 + 1] !== sem.c[h * F * 4 + 1]) distintas += 1
    }
    aberturas.push(sem.b[h * F * 4 + 3])
  }
  const centrales = Array.from({ length: HILOS.cantidad }, (_, i) => sem.c[i * 4]).filter((r) => r < 0.5).length
  return HILOS.cantidad === HILOS.haces * HILOS.fibras && HILOS.fibras >= 8 && comparten && distintas === HILOS.haces * (F - 1) && Math.min(...aberturas) < 0.4 && Math.max(...aberturas) > 1 && centrales > HILOS.cantidad * 0.55
}
afirmar(conVolumen(SEMILLAS), `K6 · ${String(HILOS.haces)} haces de ${String(HILOS.fibras)} fibras: las de un haz comparten su espina y cada una va a su lugar; haces finos y anchos; más fibras en el medio`)
controlPositivo('K6 · el detector VE los hilos de antes (cintas sueltas: cada una su propia órbita)', { a: SEMILLAS.a.map((x, i) => x + (i % (HILOS.fibras * 4) === 0 ? 0 : i * 1e-3)), b: SEMILLAS.b, c: SEMILLAS.c }, conVolumen)
// El sombreador: la fibra alrededor de la espina en hélice y aplanada (una cinta de fibras), la lejanía (más tenue y difusa), la
// velocidad (estelas más brillantes), chispas sólo en algunas fibras y, detrás de una caja de texto, apagadas.
const sombreadorBien = (v: string, fr: string): boolean =>
  v.includes('vec3 e0 = cabeza( t );') && v.includes('aSemillaC.z * 6.2831853 * k') && v.includes(`* ${String(HILOS.plano)} ) * aSemillaC.x * abre`) &&
  v.includes('vTexto = adentroDelTexto( sp );') && v.includes(`uniform vec4 uTextos[ ${String(HILOS.texto.cajas)} ];`) && v.includes('float lejos = clamp(') &&
  fr.includes(`( 1.0 - ${String(HILOS.texto.apaga)} * vTexto )`) && fr.includes('vCuenta < 0.0 ? 0.0') && fr.includes('vRapido') && fr.includes('vCentro') && HILOS.texto.apaga >= 0.9
afirmar(sombreadorBien(VERTICES_DE_LOS_HILOS, FRAGMENTOS_DE_LOS_HILOS), '  el sombreador: la fibra en hélice alrededor de la espina, una cinta; lejos, tenue y difusa; rápida, más brillo; chispas en pocas fibras; detrás del texto, apagada')
controlPositivo('  el detector VE hilos que cruzan el texto', FRAGMENTOS_DE_LOS_HILOS.replace(`( 1.0 - ${String(HILOS.texto.apaga)} * vTexto )`, '1.0'), (fr: string) => sombreadorBien(VERTICES_DE_LOS_HILOS, fr))
// El color: monocromo de fábrica (tinta y papel); `?hilos=color`, un azul frío hecho de tono, saturación y luz (sin hex).
const HILOS_TSX = leer('_lib/escena/hilos/HilosDeEnergia.tsx')
const colorBien = (t: string): boolean => t.includes('uColorDia: { value: enSrgb(INK_COLOR) }') && t.includes('noche: new THREE.Color().setHSL(0.55,') && t.includes('if (!color) return undefined') && !/#[0-9a-fA-F]{6}/.test(t)
afirmar(colorBien(HILOS_TSX), '  el color: tinta y papel de fábrica; con `?hilos=color`, el azul frío (y de vuelta al desmontarse)')
// Medido (NVIDIA, 1440 y 390): con los hilos, ningún cuadro de más de 20 ms y la media del polvo de siempre (dentro del cuadro).
type Corrida = { dia: { media: number; p95: number; mayoresDe20: number }; noche: { media: number; p95: number; mayoresDe20: number } }
const COSTO = recibo<{ corridas: Record<string, Corrida> }>('k6-hilos.json')
const dentroDelCuadro = (r: Record<string, Corrida>): boolean =>
  ['hilos-si-1440', 'hilos-color-1440', 'hilos-si-390'].every((k) => r[k] !== undefined && [r[k].dia, r[k].noche].every((x) => x.mayoresDe20 === 0 && x.p95 < 16.7)) &&
  ['1440', '390'].every((a) => Math.abs(r[`hilos-si-${a}`].noche.media - r[`polvo-${a}`].noche.media) < 0.5)
afirmar(dentroDelCuadro(COSTO.corridas), `  medido: con los hilos, la media de siempre (${String(COSTO.corridas['hilos-si-1440'].noche.media)} ms a 1440, ${String(COSTO.corridas['hilos-si-390'].noche.media)} a 390) y ningún cuadro de más de 20 ms`)
controlPositivo('  el detector VE una corrida con cuadros largos', { ...COSTO.corridas, 'hilos-si-390': { ...COSTO.corridas['hilos-si-390'], noche: { ...COSTO.corridas['hilos-si-390'].noche, mayoresDe20: 4 } } }, dentroDelCuadro)

cerrar('s64-pulido-13')
