/**
 * PULIDO 8 — el invariante: npm run test:s59-pulido-8
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   G1 · la limpieza: el volteo con las placas a la vez es el producto; la cascada, `?volteo=` y `?meta=contorno` (la metamorfosis
 *        vieja, con su código: el estado, el ruido y el stencil del lienzo) ya no existen.
 *   G2 · «HABLANOS» tocable apenas su cara se lee en el giro (su área sigue la homografía; antes, no) y su subrayado 3D (hover,
 *        foco visible, el dedo al formarse; ~300 ms; sin animación con movimiento reducido).
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-8.md`.
 */
import { existsSync, readFileSync } from 'node:fs'

import * as THREE from 'three'

import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { MARCO_DEL_CTA, lugarDelMarco, nuevoLugarDelMarco } from '../escena/ctaDelFinal/armadoDelCta'
import { esquinasEnElGiro, homografiaDelCta } from '../escena/ctaDelFinal/planosDelCta'
import { SUBRAYADO, anchoDelSubrayado, armarElSubrayado, pasoDelSubrayado, pideElSubrayado, ponerElSubrayado } from '../escena/ctaDelFinal/subrayado'
import { CARA_LEGIBLE, TRANSFORMACION, armadoSobreElCta, cajaDe, caraDelCta, ctaTocable, suave, type LetraEnPantalla } from '../escena/ctaDelFinal/transformacion'
import { aplicar } from '../pie3d/homografia'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('G1 · La limpieza: el volteo a la vez, sin la cascada ni la metamorfosis vieja')

// YA NO EXISTEN: `contorno.ts`; en el código de la escena del CTA, nada que la nombre (ni su estado, su ruido o el stencil que
// pedía al lienzo); las claves `meta` y `volteo` de las pruebas (ni pedidas sueltas ni por `?pruebas=`); la cascada del volteo.
// Reemplaza a las aserciones que fijaban `contorno` (`s55` C1, `s56` D1 · 5, `s57` E1 · 1 a 3) y la cascada (`s58` F2 · 2).
const CTA = '_lib/escena/ctaDelFinal'
interface Codigo {
  readonly existe: boolean
  readonly escena: string
  readonly volteo: string
  readonly transformacion: string
  readonly piezas: string
  readonly lienzo: string
}
const codigoDeHoy = (): Codigo => ({
  existe: existsSync(`${V3}/${CTA}/contorno.ts`),
  escena: sinComentarios(leer(`${CTA}/EscenaDelCta.tsx`)),
  volteo: sinComentarios(leer(`${CTA}/volteo.ts`)),
  transformacion: sinComentarios(leer(`${CTA}/transformacion.ts`)),
  piezas: sinComentarios(leer(`${CTA}/piezasDeLaMetamorfosis.ts`)),
  lienzo: sinComentarios(leer('_lib/escena/configuracionDelCanvas.ts')),
})
type Pedido = typeof entornoPedido
const limpiezaBien = (c: Codigo, f: Pedido): boolean => {
  const sinContorno = !c.existe && !/contorno|armarElContorno/.test(c.escena + c.volteo) && !/estadoDeLaMetamorfosis|METAMORFOSIS|ATRAS/.test(c.transformacion + c.escena) &&
    !/RUIDO_DE_LA_METAMORFOSIS/.test(c.piezas) && !/stencil/.test(c.lienzo)
  const sinBanderas = !(PRUEBAS_SUELTAS as readonly string[]).some((k) => k === 'meta' || k === 'volteo') && !('meta' in ENTORNO.pruebas) && !('volteo' in ENTORNO.pruebas) &&
    ['producto,meta=contorno', 'producto,volteo=juntos', 'producto,volteo=cascada'].every((p) => !('meta' in f(p).pruebas) && !('volteo' in f(p).pruebas)) && !/pruebas\.(meta|volteo)/.test(c.escena)
  const sinCascada = !/cascada|juntos|VOLTEOS|\bcada\b/.test(c.volteo) && c.volteo.includes('export const ARRANCA_EL_VOLTEO = FIN_DEL_VOLTEO - VOLTEO.voltea.dura') &&
    c.escena.includes('const meta = armarElVolteo(medidas.valores, renglones, medidas.letras, deLasFuentes, color, VALORES.map((v) => v.titulo))')
  return sinContorno && sinBanderas && sinCascada
}
const hoy = codigoDeHoy()
afirmar(limpiezaBien(hoy, entornoPedido), '1 · `contorno` (su archivo, su estado, su ruido y el stencil del lienzo), la cascada, `?meta=` y `?volteo=` ya no existen: el volteo a la vez es el producto')
controlPositivo('1 · el detector VE `contorno.ts` todavía en el disco', { ...hoy, existe: true }, (c: Codigo) => limpiezaBien(c, entornoPedido))
controlPositivo('  y la bandera `volteo=juntos` todavía pedible', ((p: string) => ({ ...entornoPedido(p), pruebas: { ...entornoPedido(p).pruebas, volteo: 'no' } })) as unknown as Pedido, (f: Pedido) => limpiezaBien(hoy, f))
controlPositivo('  y la cascada de vuelta', { ...hoy, volteo: hoy.volteo.replace('voltea: { dura: 0.2 }', 'voltea: { dura: 0.2, cada: 0.035 }') }, (c: Codigo) => limpiezaBien(c, entornoPedido))
controlPositivo('  y el stencil de vuelta en el lienzo', { ...hoy, lienzo: `${hoy.lienzo}\n  stencil: true,` }, (c: Codigo) => limpiezaBien(c, entornoPedido))

// ═══════════════════════════════════════════════════════════════════════════
titulo('G2 · «HABLANOS»: tocable apenas su cara se lee, y con su subrayado')

// LA COMPOSICIÓN DE PRUEBA (1440 × 900): «Seis razones / para elegirnos» arriba y «HABLANOS» (8 letras de cuerpo 104) en su
// lugar; el plano del CTA, el de una cámara de la pose C (la de `s56`).
const camara = (x: number, y: number, z: number): THREE.PerspectiveCamera => {
  const c = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 400)
  c.position.set(x, y, z)
  c.lookAt(0, 1.2, 0)
  c.updateMatrixWorld(true)
  return c
}
const CAMARA = camara(0, 4.5, 31)
const CUADRO = { ancho: 1440, alto: 900 }
const renglon = (texto: string, x0: number, y: number, cuerpo: number, r: number): LetraEnPantalla[] => [...texto].map((letra, i) => ({ x: x0 + i * 0.72 * cuerpo, y, cuerpo, ancho: 0.66 * cuerpo, alto: 0.72 * cuerpo, renglon: r, letra }))
const ORIGEN = [...renglon('Seisrazones', 130, 200, 60, 0), ...renglon('paraelegirnos', 1000, 180, 60, 1)]
const HABLANOS = renglon('HABLANOS', 470, 540, 104, 0)
const C_DEL_CTA = cajaDe(HABLANOS)
const ARMADO = armadoSobreElCta(ORIGEN, HABLANOS)
const CTA_PLANO = lugarDelMarco(CAMARA, CUADRO.alto, MARCO_DEL_CTA.cerca, nuevoLugarDelMarco())
const DEL_CTA = { x: C_DEL_CTA.x - C_DEL_CTA.ancho / 2, y: C_DEL_CTA.y - C_DEL_CTA.alto / 2, ancho: C_DEL_CTA.ancho, alto: C_DEL_CTA.alto }
const PLANO = new THREE.Object3D()
PLANO.position.copy(CTA_PLANO.posicion)
PLANO.quaternion.copy(CTA_PLANO.giro)
PLANO.scale.setScalar(CTA_PLANO.escala)
PLANO.updateMatrixWorld(true)
const enLaPantalla = (x: number, y: number, z: number): [number, number] => {
  const v = new THREE.Vector3(x, -y, z).applyMatrix4(PLANO.matrixWorld).project(CAMARA)
  return [((v.x + 1) / 2) * CUADRO.ancho, ((1 - v.y) / 2) * CUADRO.alto]
}
// La cuenta de referencia del giro (la de `2411371a`, escrita acá aparte): dónde va el centro de cada letra de «HABLANOS».
const acotar = (x: number): number => Math.min(1, Math.max(0, x))
function letraDeReferencia(p: number, d: LetraEnPantalla): [number, number] {
  const G = TRANSFORMACION.giro
  const angulo = Math.PI * suave(acotar((p - G.desde) / G.gira))
  const baja = suave(acotar((p - G.baja[0]) / G.baja[1]))
  const [dx, dz] = [-(d.x - C_DEL_CTA.x), -G.espesor * d.cuerpo]
  return enLaPantalla(C_DEL_CTA.x + dx * Math.cos(angulo) + dz * Math.sin(angulo), d.y + (ARMADO - C_DEL_CTA.y) * (1 - baja), (-dx * Math.sin(angulo) + dz * Math.cos(angulo)) * (1 - baja))
}
// El p en que la cara se vuelve legible (pasó el canto y muestra `CARA_LEGIBLE` de su ancho).
let [pa, pz]: [number, number] = [TRANSFORMACION.giro.desde, TRANSFORMACION.giro.desde + TRANSFORMACION.giro.gira]
for (let k = 0; k < 50; k += 1) [pa, pz] = caraDelCta((pa + pz) / 2) >= CARA_LEGIBLE ? [pa, (pa + pz) / 2] : [(pa + pz) / 2, pz]
const LEGIBLE = pz

// 1 · TOCABLE APENAS SE LEE: en el p en que la cara se vuelve legible el enlace es tocable y su área (la homografía del DOM, con las
// esquinas donde las lleva el giro) cubre el centro de cada letra que se ve y la abraza; un poco antes (0,01), no es tocable. Y así en cada p
// hasta el final. Lo del DOM: el puntero sigue a `ctaTocable`, Enter no abre antes y la escena lleva el enlace con el giro. Medido en
// el banco (`g2-toque.ts`, 1440 y 390): antes del umbral 0 de 8 letras reciben el puntero y el clic no abre Contacto; desde ahí, 8
// de 8 (nada le intercepta el puntero) y el clic lo abre, sin mover la página.
interface Toque {
  readonly tocable: (p: number) => boolean
  readonly conElGiro: boolean
}
const dentro = (q: readonly [number, number][], [x, y]: readonly [number, number]): boolean => q.every((a, i) => {
  const b = q[(i + 1) % q.length]
  return (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]) >= -1e-6
})
function areaDelEnlace(p: number, conElGiro: boolean): [number, number][] {
  const css = homografiaDelCta(CTA_PLANO, DEL_CTA, DEL_CTA, CAMARA, CUADRO, conElGiro ? esquinasEnElGiro(DEL_CTA, C_DEL_CTA, ARMADO, p, 104, 0) : undefined)
  const m = (/matrix3d\(([^)]+)\)/.exec(css)?.[1] ?? '').split(',').map(Number)
  if (m.length !== 16) return []
  return ([[0, 0], [DEL_CTA.ancho, 0], [DEL_CTA.ancho, DEL_CTA.alto], [0, DEL_CTA.alto]] as const).map(([u, v]) => {
    const [x, y] = aplicar(m, u, v)
    return [x + DEL_CTA.x, y + DEL_CTA.y]
  })
}
const domDelCta = sinComentarios(leer('_componentes/ctaDelFinal/CtaDelFinal.tsx'))
const escenaG2 = sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx'))
/** Cuánto puede pasarse el área de la caja de los centros de las letras (px): media letra y su aire (el cuerpo es 104). */
const ABRAZA = 90
const toqueBien = (t: Toque): boolean => {
  const antes = !t.tocable(LEGIBLE - 0.01)
  const cubre = [LEGIBLE + 1e-4, 0.52, 0.58, 0.64, 0.7, 0.85, 1].every((p) => {
    const area = areaDelEnlace(p, t.conElGiro)
    const centros = HABLANOS.map((d) => letraDeReferencia(p, d))
    // Y la abraza: ninguna esquina del área pasa de `ABRAZA` px de la caja de los centros (no es el lugar final, más ancho).
    const [x0, x1, y0, y1] = [Math.min(...centros.map((q) => q[0])), Math.max(...centros.map((q) => q[0])), Math.min(...centros.map((q) => q[1])), Math.max(...centros.map((q) => q[1]))]
    const abraza = area.every(([x, y]) => x > x0 - ABRAZA && x < x1 + ABRAZA && y > y0 - ABRAZA && y < y1 + ABRAZA)
    return t.tocable(p) && area.length === 4 && centros.every((q) => dentro(area, q)) && abraza
  })
  return antes && cubre && CARA_LEGIBLE > 0 && CARA_LEGIBLE <= 0.5 &&
    /* [PULIDO 11] A4 · J9 e · en el escenario el de siempre (`ctaTocable`); en la lista, el del deslizamiento */ domDelCta.includes('const tocable = enLaLista ? tocableEnLaLista : ctaTocable') && domDelCta.includes("const pointerEvents = useTransform(progreso, (p) => (tocable(p) ? 'auto' : 'none'))") && domDelCta.includes("if (e.key === 'Enter' && !tocable(progreso.get())) e.preventDefault()") &&
    escenaG2.includes('const esquinas = ctaTocable(p) ? esquinasEnElGiro(delCta, cajaDelCta, armado, p, destino[0]?.cuerpo ?? 0, levanta) : undefined') && escenaG2.includes('homografiaDelCta(s.planos.cta, delCta, dom, viva, { ancho: tam.width, alto: tam.height }, esquinas)')
}
afirmar(toqueBien({ tocable: ctaTocable, conElGiro: true }), '1 · tocable apenas su cara se lee en el giro: ahí el área del enlace cubre cada letra (y en cada p hasta el final); un poco antes, no', `legible en p = ${LEGIBLE.toFixed(3)} (la cara muestra ${String(CARA_LEGIBLE * 100)} % de su ancho)`)
controlPositivo('1 · el detector VE el CTA tocable recién al llegar (el de antes, 0,97)', { tocable: (p: number) => p >= 0.97, conElGiro: true }, toqueBien)
controlPositivo('  y uno tocable antes de leerse (de canto)', { tocable: (p: number) => caraDelCta(p) >= -0.2, conElGiro: true }, toqueBien)
controlPositivo('  y el enlace en el lugar final mientras gira (sin seguir la homografía del giro)', { tocable: ctaTocable, conElGiro: false }, toqueBien)

// 2 · EL SUBRAYADO, CUÁNDO: con el mouse, el hover o el foco visible sobre el CTA tocable; con el dedo (sin hover), «HABLANOS»
// formado (p = 1) y nada más. Se dibuja en `SUBRAYADO.s` (~300 ms, a 60 cuadros) y se retira igual; con movimiento reducido, de golpe.
type Pide = typeof pideElSubrayado
type Paso = typeof pasoDelSubrayado
const cuadros = (paso: Paso, desde: number, pide: boolean, quieto: boolean): number => {
  let [d, n] = [desde, 0]
  while ((pide ? d < 1 : d > 0) && n < 600) [d, n] = [paso(d, pide, 1 / 60, quieto), n + 1]
  return n
}
const cuandoBien = (pide: Pide, paso: Paso): boolean => {
  const L = LEGIBLE + 0.01
  const conMouse = pide(L, { hover: true, foco: false, tactil: false }) && pide(L, { hover: false, foco: true, tactil: false }) && !pide(LEGIBLE - 0.01, { hover: true, foco: false, tactil: false }) && !pide(1, { hover: false, foco: false, tactil: false })
  const conElDedo = pide(1, { hover: false, foco: false, tactil: true }) && !pide(0.9, { hover: true, foco: true, tactil: true })
  const [ida, vuelta] = [cuadros(paso, 0, true, false), cuadros(paso, 1, false, false)]
  const tiempo = Math.abs(ida / 60 - 0.3) <= 0.04 && Math.abs(vuelta / 60 - 0.3) <= 0.04 && cuadros(paso, 0, true, true) === 1 && cuadros(paso, 1, false, true) === 1
  return conMouse && conElDedo && tiempo && SUBRAYADO.s === 0.3 && anchoDelSubrayado(0) === 0 && anchoDelSubrayado(1) === 1
}
afirmar(cuandoBien(pideElSubrayado, pasoDelSubrayado), '2 · el subrayado: con el hover o el foco visible sobre el CTA tocable (con el dedo, al formarse y queda); se dibuja y se retira en ~300 ms; quieto, de golpe', `${String(cuadros(pasoDelSubrayado, 0, true, false))} cuadros a 60 fps`)
controlPositivo('2 · el detector VE un subrayado de golpe (sin animación con movimiento)', ((d: number, pide: boolean) => (pide ? 1 : 0)) as Paso, (p: Paso) => cuandoBien(pideElSubrayado, p))
controlPositivo('  y uno que con el dedo espera un hover que no llega', ((p: number, e: Parameters<Pide>[1]) => (e.hover || e.foco) && ctaTocable(p)) as Pide, (p: Pide) => cuandoBien(p, pasoDelSubrayado))

// 3 · EL SUBRAYADO, DÓNDE: 3D, en el marco del CTA (anclado en el mundo con «HABLANOS» y su perspectiva), con el volumen y el
// material de las letras (su bisel, el filo de noche con su propio contorno); debajo de la línea de base, de izquierda a derecha
// (su comienzo quieto mientras se dibuja) y, en el giro, en la cara de «HABLANOS» (la misma cuenta de referencia). Nada de una
// línea del CSS: el enlace sigue sin subrayado propio. Cursor de enlace y el tic de los CTA (`[data-abre-contacto]`).
const subrayadoFuente = sinComentarios(leer('_lib/escena/ctaDelFinal/subrayado.ts'))
const sonido = sinComentarios(leer('_chrome/sonido/ControlDelSonido.tsx'))
interface Fuentes {
  readonly escena: string
  readonly dom: string
}
const LINEA = { izquierda: 470, base: 560, cuerpo: 104 }
function dondeBien(f: Fuentes): boolean {
  const u = armarElSubrayado(6, 'negro')
  const raiz = new THREE.Group()
  raiz.add(u.grupo)
  const poner = (p: number, dt: number): THREE.Box3 => {
    const pose = { ry: Math.PI * suave(acotar((p - TRANSFORMACION.giro.desde) / TRANSFORMACION.giro.gira)) + Math.PI }
    ponerElSubrayado(u, LINEA, { c: C_DEL_CTA, armado: ARMADO, p, giro: pose.ry, seVe: true, levanta: 0 }, { hover: true, foco: false, tactil: false }, false, dt)
    raiz.updateMatrixWorld(true)
    return new THREE.Box3().setFromObject(u.grupo)
  }
  const y = LINEA.base + SUBRAYADO.debajo * LINEA.cuerpo
  const mitad = poner(1, 0.15)
  const entera = poner(1, 1)
  const deIzquierdaADerecha = Math.abs(mitad.min.x - LINEA.izquierda) < 1 && Math.abs(entera.min.x - LINEA.izquierda) < 1 && mitad.max.x < entera.max.x - 100 && Math.abs(entera.max.x - (LINEA.izquierda + 6 * LINEA.cuerpo)) < 1
  const debajo = Math.abs(u.grupo.position.y + y) < 1e-6 && entera.min.y < -LINEA.base && entera.max.y < -LINEA.base
  poner(0.6, 1)
  const [enElGiro, ref] = [enLaPantalla(u.grupo.position.x, -u.grupo.position.y, u.grupo.position.z), letraDeReferencia(0.6, { x: LINEA.izquierda, y, cuerpo: LINEA.cuerpo, ancho: 0, alto: 0, renglon: 0, letra: '' })]
  const conLaCara = Math.hypot(enElGiro[0] - ref[0], enElGiro[1] - ref[1]) < 0.5
  const material = subrayadoFuente.includes('const material = materialDelCta(color, contorno)') && subrayadoFuente.includes('bevelEnabled: true, bevelThickness: bisel.grosor') && f.escena.includes('a.marco.add(subrayado.grupo)')
  const sinCss = f.dom.includes('className="inline-block cursor-pointer no-underline"') && !/text-decoration|decoration-|\bunderline\b(?!-)/.test(f.dom.replace('no-underline', '')) && f.dom.includes('data-abre-contacto="panel"') && sonido.includes('[data-abre-contacto]')
  const quieto = f.escena.includes('const quieto = usePrefiereMenosMovimiento()') && f.escena.includes('s.quieto, dt)')
  return deIzquierdaADerecha && debajo && conLaCara && material && sinCss && quieto
}
afirmar(dondeBien({ escena: escenaG2, dom: domDelCta }), '3 · el subrayado es 3D, en el marco del CTA con el material y el filo de las letras: debajo de la base, de izquierda a derecha, con el giro; cursor de enlace y el tic de los CTA')
controlPositivo('3 · el detector VE el subrayado fuera del marco (no se dibuja en el mundo)', { escena: escenaG2.replace('a.marco.add(subrayado.grupo)', 'void subrayado.grupo'), dom: domDelCta }, dondeBien)
controlPositivo('  y una línea del CSS en el enlace (sin cursor de enlace)', { escena: escenaG2, dom: domDelCta.replace('className="inline-block cursor-pointer no-underline"', 'className="inline-block underline"') }, dondeBien)

cerrar('s59-pulido-8')
