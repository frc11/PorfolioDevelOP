/**
 * s78-c30f · [C2-30f] (2026-10-23) QUIÉNES SOMOS · LAS FOTOS DEL EQUIPO — sin navegador, cada afirmación con su control positivo. Lo
 * que mide el navegador está en `scripts-carga/equipo.ts`.
 *
 *   1 · la orientación propia: la cuenta (acotar, el pivote) y, con el modelo de s67 (el recibo de PULIDO 16, los seis anchos y el
 *       mouse en el peor caso), que el plano de las personas no copia la orientación de la cámara, que el ángulo con la cámara viva
 *       no pasa del tope legible, que las fotos se leen (su proporción, sobre un piso) y que nada sale del cuadro;
 *   2 · el cableado: la sección lo pide sólo para las personas; la escena lo aplica con la colocación de cada cuadro; el banco lo lee;
 *   3 · las etiquetas: el nombre adentro de la foto (rectángulo del papel, letra de tinta; Franco arriba a la izquierda, Valentino
 *       arriba a la derecha), abajo sólo el rol, sin el nombre grande de afuera; los textos de `05-TEXTOS`;
 *   4 · la descripción más grande: antes y después por ancho, y su palabra más larga entra en su columna.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import * as THREE from 'three'

import { CONTENIDO } from '../../_secciones/quienes-somos/contenido'
import { GEOMETRIA, ORIENTACION_DE_LAS_PERSONAS, PLANO_DE_NOSOTROS } from '../../_secciones/quienes-somos/geometria'
import { quieto, veces } from '../../_secciones/quienes-somos/quienes-somos-piezas'
import { altoDeAntes } from '../../_secciones/quienes-somos/tramoDelEquipo'
import { BANDA_EN_VIVO, factorDeLaBanda, fovConFactor } from '../escena/banda'
import { crearDesplazamiento, desplazamientoDelMouse } from '../escena/modulacionDeLaPose'
import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR } from '../escena/probeScene'
import { anotarLaPoseDelCuadro, camaraConParteDelMouse, posarLaCamaraSinElMouse } from '../escena/sinElMouse'
import { cuadrilateroEnElPlano } from '../escena/titulos3d/acompanantes'
import { colocar, lineaDeBase, poseDeLaLectura } from '../escena/titulos3d/colocacion'
import { anguloEntre, girarSobreElPivote, orientacionAcotada, orientacionDeLaLectura, pivoteDeLaCaja } from '../escena/titulos3d/orientacionPropia'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const RAIZ = process.cwd()
const V3 = 'src/app/v3'
const leer = (rel: string): string => readFileSync(path.join(RAIZ, V3, rel), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La orientación propia: la cuenta')

const eje = new THREE.Vector3(0, 1, 0)
const camara = new THREE.Quaternion()
const cerca = new THREE.Quaternion().setFromAxisAngle(eje, THREE.MathUtils.degToRad(10))
const lejos = new THREE.Quaternion().setFromAxisAngle(eje, THREE.MathUtils.degToRad(40))
const tope = ORIENTACION_DE_LAS_PERSONAS.tope
const acotar = (propia: THREE.Quaternion, cam: THREE.Quaternion, t: number): THREE.Quaternion => orientacionAcotada(propia, cam, t, new THREE.Quaternion())
const acotaBien = (f: typeof acotar): boolean => {
  const a = f(cerca, camara, tope)
  const b = f(lejos, camara, tope)
  return anguloEntre(a, cerca) < 1e-6 && Math.abs(anguloEntre(b, camara) - tope) < 1e-6 && Math.abs(anguloEntre(b, lejos) - (40 - tope)) < 1e-6
}
afirmar(acotaBien(acotar), `a ${String(tope)}° o menos de la cámara queda la propia, tal cual; más lejos, queda en el tope y del lado de la propia (40° → ${String(tope)}° de la cámara, ${String(40 - tope)}° de la propia)`)
controlPositivo('  el detector VE un cartel (la orientación de la cámara, siempre)', ((_p: THREE.Quaternion, cam: THREE.Quaternion) => cam.clone()) as typeof acotar, acotaBien)

const grupo = new THREE.Group()
grupo.position.set(1, 2, -3)
grupo.quaternion.copy(cerca)
grupo.scale.setScalar(0.5)
grupo.updateMatrixWorld(true)
const pivote = new THREE.Vector3(4, -6, 0)
const delPivoteAntes = pivote.clone().applyMatrix4(grupo.matrixWorld)
girarSobreElPivote(grupo, pivote, lejos)
const delPivoteDespues = pivote.clone().applyMatrix4(grupo.matrixWorld)
afirmar(delPivoteAntes.distanceTo(delPivoteDespues) < 1e-9 && anguloEntre(grupo.quaternion, lejos) < 1e-6, 'gira sobre su pivote: el punto que se ve en el medio queda donde estaba, con la orientación nueva')
const piv = pivoteDeLaCaja({ x: 700, y: -200, ancho: 600, alto: 1000 }, { x: 600, y: 100 }, 20, 900, new THREE.Vector3())
const pivAbajo = pivoteDeLaCaja({ x: 700, y: 700, ancho: 600, alto: 1000 }, { x: 600, y: 100 }, 20, 900, new THREE.Vector3())
afirmar(piv.x === 20 && piv.y === -17.5 && pivAbajo.y === -30, 'el pivote es el medio de la caja a lo ancho y el medio del cuadro a lo alto (acotado a la caja: entrando, su borde de arriba)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La orientación propia en el recorrido (el modelo de s67, con el recibo de PULIDO 16)')

type Caja4 = readonly [number, number, number, number]
interface PiezaDelRecibo { readonly id: string; readonly dom: Caja4 }
interface MuestraDelRecibo { readonly scroll: number; readonly progreso: number; readonly piezas: readonly PiezaDelRecibo[] }
interface AnchoDelRecibo { readonly logo: readonly [number, number]; readonly muestras: readonly MuestraDelRecibo[] }
const N1 = JSON.parse(readFileSync(path.join(RAIZ, 'docs/rediseno/entregas/pulido-16/n1-nosotros.json'), 'utf8')) as { anchos: Readonly<Record<string, AnchoDelRecibo>> }
const ANCHOS = ['1024x768', '1280x800', '1366x768', '1440x900', '1920x1080', '2560x1440'] as const
const PERSONAS = ['franco-nombre', 'franco-bio', 'franco-foto', 'valentino-nombre', 'valentino-bio', 'valentino-foto'] as const
const PUNTEROS: readonly (readonly [number, number])[] = [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]
const MARGEN = 24
// [C2-30f · 2] El piso que pide el orquestador, con las piezas de texto además de las fotos (medido en el sitio con 18°: 0,846 a 1024).
const PISO_LEGIBLE = 0.87
const TOPE_LEGIBLE = 20
const FUENTE = { ascender: 900, descender: -250, resolution: 1000 }

/** Cómo se orienta el plano en el modelo: la escena de ahora (`propia`), el cartel de antes (`mira`) o la propia sin tope. */
type Modo = { readonly tipo: 'propia'; readonly tope: number } | { readonly tipo: 'mira' }
interface Vista { readonly plano: THREE.Quaternion; readonly viva: THREE.Quaternion; readonly cajas: Map<string, readonly number[]> }
const PLANO = new THREE.Group()
const Q: number[] = []
function vista(ancho: string, a: AnchoDelRecibo, m: MuestraDelRecibo, modo: Modo, px: number, py: number): Vista {
  const [W, H] = ancho.split('x').map(Number)
  BANDA_EN_VIVO.factor = factorDeLaBanda(W, H)
  const base = new THREE.PerspectiveCamera(fovConFactor(CAMERA_FOV, factorDeLaBanda(W, H)), W / H, CAMERA_NEAR, CAMERA_FAR)
  const p = poseDeLaLectura(m.progreso)
  const pose = { angleDeg: p.angleDeg, height: p.height, distance: p.distance, frameX: p.frameX, frameY: p.frameY, logoW: a.logo[0], logoH: a.logo[1] }
  posarLaCamaraSinElMouse(base, pose, W / H)
  anotarLaPoseDelCuadro(base, pose, desplazamientoDelMouse(crearDesplazamiento(), { x: px, y: py }, pose.distance, 1, m.progreso), W / H)
  const viva = camaraConParteDelMouse(1).clone()
  const lugar = { izquierda: W / 2, arriba: H / 2, linea: 100, cuerpo: 80, ancho: W, alto: H }
  colocar(PLANO, camaraConParteDelMouse(PLANO_DE_NOSOTROS.parteDelMouse), lugar, FUENTE, PLANO_DE_NOSOTROS.alejamiento)
  const ancla = { x: lugar.izquierda, y: lineaDeBase(lugar, FUENTE) }
  const piezas = m.piezas.filter((pz) => (PERSONAS as readonly string[]).includes(pz.id))
  const vivaQ = viva.getWorldQuaternion(new THREE.Quaternion())
  if (modo.tipo === 'propia' && piezas.length > 0) {
    const [x0, y0] = [Math.min(...piezas.map((pz) => pz.dom[0])), Math.min(...piezas.map((pz) => pz.dom[1]))]
    const caja = { x: x0, y: y0, ancho: Math.max(...piezas.map((pz) => pz.dom[2])) - x0, alto: Math.max(...piezas.map((pz) => pz.dom[3])) - y0 }
    const propia = orientacionDeLaLectura(ORIENTACION_DE_LAS_PERSONAS, W / H, a.logo[0], a.logo[1], new THREE.Quaternion())
    girarSobreElPivote(PLANO, pivoteDeLaCaja(caja, ancla, lugar.cuerpo, H, new THREE.Vector3()), orientacionAcotada(propia, vivaQ, modo.tope, new THREE.Quaternion()))
  }
  const cajas = new Map<string, readonly number[]>()
  for (const pz of piezas) {
    const c = { x: pz.dom[0], y: pz.dom[1], ancho: pz.dom[2] - pz.dom[0], alto: pz.dom[3] - pz.dom[1] }
    if (cuadrilateroEnElPlano(PLANO, ancla, lugar.cuerpo, c, viva, { ancho: W, alto: H }, Q)) cajas.set(pz.id, Q.map((v, i) => v + (i % 2 === 0 ? c.x : c.y)))
  }
  return { plano: PLANO.quaternion.clone(), viva: vivaQ, cajas }
}
const enCuadro = (pz: PiezaDelRecibo, H: number): boolean => pz.dom[3] > 0 && pz.dom[1] < H
const fotoALaVista = (m: MuestraDelRecibo, H: number): boolean => m.piezas.some((pz) => pz.id.endsWith('-foto') && pz.id !== 'nosotros-foto' && enCuadro(pz, H))

/** La legibilidad de una foto vista: su proporción contra la del DOM y lo parejos que quedan sus lados opuestos (lo peor de los tres). */
function legibilidad(q: readonly number[], dom: Caja4): number {
  const d = (i: number, j: number): number => Math.hypot(q[2 * i] - q[2 * j], q[2 * i + 1] - q[2 * j + 1])
  const [arriba, abajo, izq, der] = [d(0, 1), d(3, 2), d(0, 3), d(1, 2)]
  const proporcion = (arriba + abajo) / (izq + der) / ((dom[2] - dom[0]) / (dom[3] - dom[1]))
  return Math.min(proporcion, 1 / proporcion, Math.min(izq, der) / Math.max(izq, der), Math.min(arriba, abajo) / Math.max(arriba, abajo))
}
interface Recorrido { readonly anguloMaximo: number; readonly legible: number; readonly margen: number; readonly propiaQuieta: number; readonly giroDeLaCamara: number; readonly donde: string }
function recorrer(modo: Modo, anchos: readonly string[] = ANCHOS): Recorrido {
  let [anguloMaximo, legible, margen, propiaQuieta, giroDeLaCamara, donde] = [0, Infinity, Infinity, 0, Infinity, '']
  for (const w of anchos) {
    const a = N1.anchos[w]
    const [W, H] = w.split('x').map(Number)
    // Los momentos con la foto a la vista y la cámara cerca de la lectura (la propia, sin acotar): el plano no se mueve aunque la cámara sí.
    const quietos: Vista[] = []
    for (const m of a.muestras) {
      if (!fotoALaVista(m, H)) continue
      for (const [px, py] of PUNTEROS) {
        const v = vista(w, a, m, modo, px, py)
        anguloMaximo = Math.max(anguloMaximo, anguloEntre(v.plano, v.viva))
        for (const pz of m.piezas) {
          const q = v.cajas.get(pz.id)
          if (q === undefined || !enCuadro(pz, H)) continue
          const xs = [q[0], q[2], q[4], q[6]]
          const ys = [q[1], q[3], q[5], q[7]]
          const seLee = pz.dom[0] >= 0 && pz.dom[1] >= 0 && pz.dom[2] <= W && pz.dom[3] <= H
          const mg = Math.min(Math.min(...xs), W - Math.max(...xs), ...(seLee ? [Math.min(...ys), H - Math.max(...ys)] : []))
          if (mg < margen) [margen, donde] = [mg, `${w} ${pz.id} p${m.progreso.toFixed(3)} (${String(px)}, ${String(py)})`]
          legible = Math.min(legible, legibilidad(q, pz.dom))
        }
        if (px === 0 && py === 0 && modo.tipo === 'propia') {
          const propia = orientacionDeLaLectura(ORIENTACION_DE_LAS_PERSONAS, W / H, a.logo[0], a.logo[1], new THREE.Quaternion())
          if (anguloEntre(propia, v.viva) <= modo.tope - 1) quietos.push(v)
        }
        if (px === 0 && py === 0 && modo.tipo === 'mira') quietos.push(v)
      }
    }
    // Entre el primero y el último de esos momentos: cuánto giró la cámara y cuánto el plano.
    if (quietos.length >= 2) {
      const [i, j] = [quietos[0], quietos[quietos.length - 1]]
      giroDeLaCamara = Math.min(giroDeLaCamara, anguloEntre(i.viva, j.viva))
      propiaQuieta = Math.max(propiaQuieta, anguloEntre(i.plano, j.plano))
    }
  }
  return { anguloMaximo, legible, margen, propiaQuieta, giroDeLaCamara, donde }
}
const AHORA: Modo = { tipo: 'propia', tope }
const conLaEscena = recorrer(AHORA)
const noCopia = (r: Recorrido): boolean => r.giroDeLaCamara >= 10 && r.propiaQuieta < 0.5
afirmar(noCopia(conLaEscena), `la foto no copia la orientación de la cámara: entre el medio y la salida la cámara gira ${conLaEscena.giroDeLaCamara.toFixed(1)}° (lo menos, en los seis anchos) y el plano de las personas ${conLaEscena.propiaQuieta.toFixed(2)}° (quieto en el mundo)`)
const MIRA: Modo = { tipo: 'mira' }
controlPositivo('  el detector VE el cartel de antes (el plano colocado con la cámara de cada cuadro)', recorrer(MIRA), noCopia)
const acotado = (r: Recorrido): boolean => r.anguloMaximo <= tope + 1e-6 && tope <= TOPE_LEGIBLE
afirmar(acotado(conLaEscena), `el ángulo entre las fotos y la cámara viva nunca pasa de ${String(tope)}° (el tope legible es ${String(TOPE_LEGIBLE)}°), con el mouse en el peor caso: ${conLaEscena.anguloMaximo.toFixed(1)}°`)
const sinTope = recorrer({ tipo: 'propia', tope: 180 })
controlPositivo(`  el detector VE la orientación propia sin acotar (${sinTope.anguloMaximo.toFixed(0)}° entrando)`, sinTope, acotado)
const seLeen = (r: Recorrido): boolean => r.legible >= PISO_LEGIBLE
afirmar(seLeen(conLaEscena), `las fotos (y su texto) se leen: la proporción vista contra la real y sus lados opuestos, a ${conLaEscena.legible.toFixed(3)} o más (el piso, ${String(PISO_LEGIBLE)})`)
controlPositivo(`  el detector VE una foto torcida de más (sin tope: ${sinTope.legible.toFixed(3)})`, sinTope, seLeen)
const deAntes = recorrer({ tipo: 'propia', tope: 18 }, ['1024x768', '1440x900'])
controlPositivo(`  y el tope de antes (18°: medido en el sitio, 0,846 a 1024; el modelo, ${deAntes.legible.toFixed(3)})`, deAntes, seLeen)
const enteras = (r: Recorrido): boolean => r.margen >= MARGEN
afirmar(enteras(conLaEscena), `y nada sale del cuadro: la foto, el nombre y la bio de cada uno, con ${String(MARGEN)} px de margen en el peor caso (${conLaEscena.margen.toFixed(0)} px: ${conLaEscena.donde})`)
const conTreinta = recorrer({ tipo: 'propia', tope: 45 }, ['1024x768'])
controlPositivo(`  el detector VE un tope que saca la foto del cuadro (45° a 1024: ${conTreinta.margen.toFixed(0)} px)`, conTreinta, enteras)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El cableado: sólo las personas, con la colocación de cada cuadro; el banco')

const EQUIPO = sinComentarios(leer('_secciones/quienes-somos/equipo.tsx'))
const ESCENA = sinComentarios(leer('_lib/escena/titulos3d/acompanantes.ts'))
const cableado = (equipo: string, escena: string): boolean =>
  equipo.includes("useAcompananteDelTitulo<HTMLDivElement>('equipo', ORIENTACION_DE_LAS_PERSONAS)") && equipo.includes("useAcompananteDelTitulo<HTMLDivElement>('nosotros')") &&
  /colocar\(PLANO, camaraConParteDelMouse\(t\.parteDelMouse \?\? 0\), AHORA, a\.fuente\.data, k\)[\s\S]*if \(t\.colocacion === 'pantalla' && ac\.orientacion !== undefined && p\.propia !== null\) orientar\([\s\S]*if \(!cuadrilateroEnElPlano\(/.test(escena) &&
  escena.includes('const propia = ac.orientacion === undefined ? null : orientacionDeLaLectura(ac.orientacion, ') &&
  /if \(!mira\) \{\s*pivoteDeLaCaja\(caja, ancla, cuerpo, altoDelCuadro, PIVOTE\)\s*girarSobreElPivote\(PLANO, PIVOTE, orientacionAcotada\(propia, DE_LA_VIVA, o\.tope, ACOTADA\)\)/.test(escena)
afirmar(cableado(EQUIPO, ESCENA), 'la sección la pide sólo para el plano de las personas (la foto de Nosotros sigue como estaba); la escena la aplica después de colocar el plano y antes de proyectar el texto, sobre su pivote')
controlPositivo('  el detector VE la escena sin aplicarla', ESCENA.replace(/if \(t\.colocacion === 'pantalla' && ac\.orientacion !== undefined && p\.propia !== null\) orientar\([^\n]*\n/, ''), (e: string) => cableado(EQUIPO, e))
controlPositivo('  y la sección que no la pide', EQUIPO.replace("useAcompananteDelTitulo<HTMLDivElement>('equipo', ORIENTACION_DE_LAS_PERSONAS)", "useAcompananteDelTitulo<HTMLDivElement>('equipo')"), (e: string) => cableado(e, ESCENA))
const bancoBien = (e: string): boolean => /if \(!hayBanco\(\)\) return\s*const v = window as VentanaDelBanco\s*v\.__acompanantesDelBanco \?\?= /.test(e) && e.includes(".__defectosDeLaIntro === 'mira-camara'") && !/searchParams|location\.search/.test(e)
afirmar(bancoBien(ESCENA), 'el banco lee la orientación de cada plano sólo con el banco prendido (`__acompanantesDelBanco`), y su control (`mira-camara`) es de la ventana, nunca de la URL')
controlPositivo('  el detector VE la orientación publicada siempre', ESCENA.replace('if (!hayBanco()) return', ''), bancoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las etiquetas: el nombre adentro de la foto, el rol abajo (05-TEXTOS)')

const TEXTOS_05 = { franco: { nombre: 'Franco', rol: 'ESTRATEGIA · COMERCIAL · PLANIFICACIÓN', lado: 'izquierda' }, valentino: { nombre: 'Valentino', rol: 'EJECUCIÓN TÉCNICA', lado: 'derecha' } } as const
const DESCRIPCIONES = ['Enfocado, creativo, perfeccionista. Encargado de toda la estructura de develOP.', 'Obsesivo, curioso, inconformista. Escribe el sistema, lo pone a andar y lo mantiene.']
/** Los marcos de los dos retratos en el marcado: desde su `data-marco` hasta el botón. */
const marcosDe = (html: string): string[] => html.split('data-marco="dos-tomas"').slice(1, 3).map((m) => m.slice(0, m.indexOf('data-toque="marco"')))
const etiquetasBien = (html: string): boolean => {
  const marcos = marcosDe(html)
  return marcos.length === 2 && [TEXTOS_05.franco, TEXTOS_05.valentino].every((t, k) => {
    const m = marcos[k]
    const etiqueta = new RegExp(`<span aria-hidden="true" data-parte="etiqueta" data-lado="${t.lado}" class="([^"]*)">${t.nombre}</span>`).exec(m)
    const clases = etiqueta?.[1] ?? ''
    const rol = /data-parte="revelado-texto"><span class="([^"]*)"[^>]*>([^<]*)<\/span>/.exec(m)
    return etiqueta !== null && ['bg-fondo', 'text-tinta', 'absolute', 'top-'].every((c) => clases.includes(c)) && clases.includes(t.lado === 'izquierda' ? 'left-' : 'right-') && !clases.includes('mix-blend') &&
      rol !== null && rol[1].includes('uppercase') && rol[2].toUpperCase() === t.rol && !m.includes('revelado-nombre') && !new RegExp(`>${t.nombre}<`).test(m.replace(etiqueta[0], ''))
  })
}
afirmar(etiquetasBien(quieto), 'cada retrato lleva su nombre adentro, en un rectángulo del papel con letra de tinta (Franco arriba a la izquierda, Valentino arriba a la derecha), sin mezcla; abajo, sólo el rol («ESTRATEGIA · COMERCIAL · PLANIFICACIÓN» y «EJECUCIÓN TÉCNICA»)')
const conElNombreAbajo = quieto.replace('data-parte="revelado-texto">', 'data-parte="revelado-nombre"><span>Franco</span></p><p data-parte="revelado-texto">')
controlPositivo('  el detector VE el nombre de vuelta abajo, en el revelado', conElNombreAbajo, etiquetasBien)
controlPositivo('  y la etiqueta del lado equivocado', quieto.replace('data-lado="izquierda"', 'data-lado="derecha"'), etiquetasBien)
afirmar(['bg-fondo', 'text-tinta'].every((c) => leer('_secciones/quienes-somos/marco.tsx').includes(c)) && readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8').includes('--color-fondo: #F7F7F5;'), '  el rectángulo es el papel (#F7F7F5, el blanco del sitio) y la letra la tinta (17,6:1)')

const afueraBien = (html: string): boolean =>
  [TEXTOS_05.franco.nombre, TEXTOS_05.valentino.nombre].every((n) => veces(html, `<h4 class="sr-only">${n}</h4>`) === 1) && veces(html, '<h4') === 2 &&
  DESCRIPCIONES.every((d) => html.includes(d)) && CONTENIDO.personas.every((p, k) => p.descripcion === DESCRIPCIONES[k])
afirmar(afueraBien(quieto), 'el nombre grande de afuera se fue (su `h4` queda para el lector, oculto a la vista) y las descripciones son las de siempre')
controlPositivo('  el detector VE el nombre grande de vuelta afuera', quieto.replace('<h4 class="sr-only">Franco</h4>', '<h4 class="font-titulo">Franco</h4>'), afueraBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La descripción, más grande (antes y después) y entera en su columna')

/** `clamp(Apx, calc(Bpx + Cvw), Dpx)` a un ancho. */
const tamanoEn = (valor: string, w: number): number => {
  const m = /^clamp\(([\d.]+)px, calc\(([\d.]+)px \+ ([\d.]+)vw\), ([\d.]+)px\)$/.exec(valor)
  if (m === null) return Number.NaN
  const [min, b, c, max] = m.slice(1).map(Number)
  return Math.min(max, Math.max(min, b + (c * w) / 100))
}
const seccion = GEOMETRIA.estilos.seccion as unknown as Record<string, string>
const ANTES_PX = 15 // `--text-cuerpo`, el de `<Cuerpo>`, en todos los anchos
const movil = Number.parseFloat(seccion['--persona-cuerpo-movil']) * 16
const despues = (w: number): number => (w < 1024 ? movil : tamanoEn(seccion['--persona-cuerpo-tamano'], w))
const tabla = [390, 768, 1024, 1280, 1440, 1920].map((w) => `${String(w)}: ${String(ANTES_PX)} → ${despues(w).toFixed(1)} px`).join(' · ')
const masGrande = (f: (w: number) => number): boolean => [390, 768, 1024, 1280, 1440, 1920].every((w) => f(w) > ANTES_PX) && f(1440) >= 20
afirmar(masGrande(despues) && readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8').includes('--text-cuerpo: 15px;'), `más grande en todos los anchos (y 20 px a 1440): ${tabla}`)
controlPositivo('  el detector VE el cuerpo de siempre', () => ANTES_PX, masGrande)
afirmar(GEOMETRIA.descripcionDeLaPersona.includes('text-[length:var(--persona-cuerpo-tamano)]') && GEOMETRIA.descripcionDeLaPersona.includes('max-escritorio:text-[length:var(--persona-cuerpo-movil)]') && EQUIPO.includes('<p data-parte="descripcion" className={GEOMETRIA.descripcionDeLaPersona}>'), '  la descripción lleva ese tamaño (y la mezcla de siempre: `descripcionDeLaPersona`)')

// La palabra más larga de cada descripción, con los avances de la Chivo 400 (las fuentes de los títulos 3D, la misma cara) y el
// interletrado del texto (−0,01 em), contra su columna desde 1024: `--nombre-piso` (120 px) o un cuarto de la calle sin las canaletas.
type Glifos = { readonly glyphs: Readonly<Record<string, { readonly ha: number }>>; readonly resolution: number }
const FUENTES = ['chivo-400-valores', 'chivo-400-pie', 'chivo-400-titulos'].map((n) => JSON.parse(readFileSync(path.join(RAIZ, V3, `_fuentes/${n}.json`), 'utf8')) as Glifos)
const avance = (c: string): number => {
  for (const f of FUENTES) if (f.glyphs[c] !== undefined) return f.glyphs[c].ha / f.resolution
  return Number.NaN
}
const emDe = (palabra: string): number => [...palabra].reduce((s, c) => s + avance(c) - 0.01, 0)
const masLarga = Math.max(...DESCRIPCIONES.flatMap((d) => d.split(' ')).map(emDe))
const columna = (w: number): number => Math.max(Number.parseFloat(seccion['--nombre-piso']), (w / 2 - 32 - 3 * 16) / 4)
const HOLGURA = 4
const entra = (f: (w: number) => number): number => {
  let peor = Infinity
  for (let w = 1024; w <= 2560; w += 8) peor = Math.min(peor, columna(w) - masLarga * f(w))
  return peor
}
afirmar(Number.isFinite(masLarga) && entra(despues) >= HOLGURA, `y su palabra más larga («perfeccionista.», ${masLarga.toFixed(2)} em) entra en su columna de 1024 a 2560 con ${String(HOLGURA)} px o más de sobra: la columna y el alto de la fila no cambian`, `${entra(despues).toFixed(1)} px en el peor ancho`)
controlPositivo('  el detector VE 20 px parejos (a 1024 se sale de la columna)', () => 20, (f: (w: number) => number) => entra(f) >= HOLGURA)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · REGLA DE ALTURAS: desde 1024 no cambia; abajo, su tramo')

// El modelo de la columna de texto (antes: el nombre en `titulo-m` —abajo de 1024, `titulo-l`— con interlineado 1,09, la juntura de 12
// y la descripción a 15 px; ahora, sólo la descripción) con el corte de renglón de la Chivo, contra el alto de la foto (4:3).
const enRenglones = (texto: string, px: number, ancho: number): number => {
  let [n, renglon] = [1, '']
  for (const palabra of texto.split(' ')) {
    const con = renglon === '' ? palabra : `${renglon} ${palabra}`
    if (emDe(con) * px <= ancho) renglon = con
    else [n, renglon] = [n + 1, palabra]
  }
  return n
}
const fluido = (min: number, rem: number, vw: number, max: number, w: number): number => Math.min(max, Math.max(min, rem * 16 + (vw * w) / 100))
const tituloM = (w: number): number => fluido(18, 0.8169, 1.3146, 38.3107, w)
const tituloL = (w: number): number => fluido(24, 1.0599, 1.8779, 53.0141, w)
const textoDeAntes = (w: number, ancho: number, d: string): number => (w < 1024 ? tituloL(w) : tituloM(w)) * 1.09 + 12 + enRenglones(d, ANTES_PX, ancho) * ANTES_PX * 1.6
const textoDeAhora = (w: number, ancho: number, d: string): number => enRenglones(d, despues(w), ancho) * despues(w) * 1.6
const fotoEn = (w: number): number => 0.75 * (w / 2 - 32 - 16 - columna(w))
const laFotoManda = (factorDeLaFoto: number): boolean => {
  for (let w = 1024; w <= 2560; w += 8) for (const d of DESCRIPCIONES) if (Math.max(textoDeAntes(w, columna(w), d), textoDeAhora(w, columna(w), d)) >= fotoEn(w) * factorDeLaFoto) return false
  return true
}
afirmar(laFotoManda(1), 'desde 1024 la fila la manda la foto (más alta que la columna de texto de antes y que la de ahora, de 1024 a 2560): la sección no cambia de alto', `a 1024: foto ${fotoEn(1024).toFixed(0)} px, texto de antes ${textoDeAntes(1024, 120, DESCRIPCIONES[0]).toFixed(0)}, de ahora ${textoDeAhora(1024, 120, DESCRIPCIONES[0]).toFixed(0)} · a 1440: ${fotoEn(1440).toFixed(0)} / ${textoDeAntes(1440, columna(1440), DESCRIPCIONES[0]).toFixed(0)} / ${textoDeAhora(1440, columna(1440), DESCRIPCIONES[0]).toFixed(0)}`)
controlPositivo('  el detector VE una foto más baja que el texto', 0.5, laFotoManda)

// Abajo de 1024 (el modelo, para el reporte; el tramo lo mide el navegador): lo que cada fila se acorta y la pantalla del equipo.
const delModelo = [[390, 844], [768, 1024]].map(([w, h]) => {
  const ancho = w - 64
  const acortado = DESCRIPCIONES.reduce((s, d) => s + textoDeAntes(w, Math.min(ancho, 65 * avance('0') * ANTES_PX), d) - textoDeAhora(w, Math.min(ancho, 65 * avance('0') * despues(w)), d), 0)
  const titulo = fluido(36, 1.8099, 1.8779, 65.0141, w) * 1.09
  const ahora = 96 + titulo + 48 + 48 + DESCRIPCIONES.reduce((s, d) => s + textoDeAhora(w, Math.min(ancho, 65 * avance('0') * despues(w)), d) + 24 + 0.75 * ancho, 0)
  return { w, h, acortado, ahora: Math.max(h, ahora), antes: Math.max(h, ahora + acortado) }
})
afirmar(delModelo.every((m) => m.acortado > 0 && m.ahora < m.antes), `  abajo de 1024 la pantalla del equipo se acorta (el modelo): ${delModelo.map((m) => `${String(m.w)}: ${m.antes.toFixed(0)} → ${m.ahora.toFixed(0)} px (k ${(m.ahora / m.antes).toFixed(4)})`).join(' · ')}`)
const TRAMO = sinComentarios(leer('_secciones/quienes-somos/tramoDelEquipo.ts'))
const tramoBien = (equipo: string, tramo: string): boolean =>
  equipo.includes('useTramoDelEquipo(pantalla, CONTENIDO.personas)') && equipo.includes('<div ref={pantalla} data-pantalla="equipo"') &&
  equipo.includes('[--equipo-apila:1]') && equipo.includes('escritorio:[--equipo-apila:0]') && !/useAnchoMinimo|CONSULTA_ESCENARIO/.test(equipo) &&
  tramo.includes("if (getComputedStyle(el).getPropertyValue('--equipo-apila').trim() !== '1') return") && !/useAnchoMinimo|CONSULTA_ESCENARIO|matchMedia/.test(tramo) && tramo.includes('soltar = anotarTramo({ panel, k: alto / viejo, arranque, largo: viejo / escala })') &&
  tramo.includes("nombre: 'font-titulo text-fluido-titulo-l leading-titulo tracking-texto font-normal'") && tramo.includes("descripcion: 'font-cuerpo text-cuerpo leading-texto tracking-texto max-w-[var(--medida-movil)]'") &&
  tramo.includes('const observador = new ResizeObserver(anotar)') && !tramo.includes('secciones.ts')
afirmar(tramoBien(EQUIPO, TRAMO), '  y la sección anota su tramo abajo de 1024 (k = nuevo / viejo, el viejo medido con el fantasma de la columna de antes: el nombre en su escalón y el cuerpo de 15 px), sin tocar `secciones.ts`; desde 1024, ninguno')
controlPositivo('  el detector VE la sección sin su tramo', EQUIPO.replace('useTramoDelEquipo(pantalla, CONTENIDO.personas)', ''), (e: string) => tramoBien(e, TRAMO))
controlPositivo('  y la sección que consulta la compuerta (s7-contrato)', `${EQUIPO}\nconst escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)`, (e: string) => tramoBien(e, TRAMO))
const pisoBien = (f: typeof altoDeAntes): boolean => f(844, 800, 50) === 850 && f(844, 700, 50) === 844
afirmar(pisoBien(altoDeAntes), '  el alto de antes respeta el piso de la pantalla (`min-h-svh`): contenido más lo que se fue, o el piso')
controlPositivo('  el detector VE el alto sin el piso', ((_m: number, c: number, a: number) => c + a) as typeof altoDeAntes, pisoBien)

cerrar('s78-c30f')
