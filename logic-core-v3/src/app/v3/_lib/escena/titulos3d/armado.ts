import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datosDeLaFuente from '../../../_fuentes/chivo-400-titulos.json'
import datosDeArchivo from '../../../_fuentes/archivo-700-titulos.json'
import datosDeLaItalica from '../../../_fuentes/chivo-300-italica-titulos.json'
import datosDeLaFuerte from '../../../_fuentes/chivo-700-titulos.json'
import datosDeLaLiviana from '../../../_fuentes/chivo-300-titulos.json'
import type { FuenteDelTitulo, TituloDeVolumen } from '../../titulos3d/registro'
import { conElAmanecer } from '../amanecer/luz'
import { SATINADO } from '../estudio'
import { conLogoDeNoche, hornearContornos, type ContornoDelLogo } from '../logoDeNoche'
import { EMISION_EN_LA_NOCHE } from '../logoEmision'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import { enEmDelLugar, posicionesDelDom, type LugarEnElCuadro, type PinDelLugar } from './colocacion'
import { costadoDeDiaGlsl } from './filo'
import { armarElTitulo, type RayaEnEm } from './geometria'
import { DISOLVER_GLSL, DISOLVER_PARS_GLSL, LLEGADA_NORMAL_GLSL, LLEGADA_PARS_GLSL, LLEGADA_POSICION_GLSL } from './llegada'

/**
 * [RETOQUE PANEL] T4 · CÓMO SE ARMA UN TÍTULO DE VOLUMEN — salió de `TitulosDeVolumen.tsx` (que quedaba en el tope de las
 * 300 líneas al sumarle las rayas): la geometría con sus letras y sus rayas, el material (el negro satinado del logo o el
 * blanco, con el dibujo de noche, el amanecer y el costado de día) y lo que se suelta al irse.
 *
 * El filo de noche (em), el campo de su contorno (em) y las tapas del blanco de noche (valor en pantalla). Y el filo
 * del blanco de DÍA (su color, lineal): sobre el cielo claro las tapas blancas casi no se separan del fondo; con el filo
 * oscuro, el mismo dibujo de la noche al revés, se leen. De noche lo reemplaza el filo claro.
 */
const NOCHE_DEL_TITULO = { filo: 0.018, contorno: { alcance: 0.06, celda: 0.005 }, tapaDelBlanco: 0.86, filoDelBlancoDeDia: 0.06 } as const

/** El filo oscuro del blanco de día: el albedo del borde de las tapas, apagado con la noche (la del logo, por la emisiva). */
const FILO_DE_DIA_GLSL = /* glsl */ `
	diffuseColor.rgb = mix( diffuseColor.rgb, vec3( ${NOCHE_DEL_TITULO.filoDelBlancoDeDia.toFixed(3)} ), bordeDelLogoDeNoche() * ( 1.0 - clamp( emissive.r / ${EMISION_EN_LA_NOCHE.toFixed(3)}, 0.0, 1.0 ) ) );
`

export type Variante = 'negro' | 'blanco'

/** [RETOQUE 3D] Las fuentes de los títulos: la Chivo 400 de siempre, Archivo 700 y la Chivo 300 itálica del hero. [RETOQUE PANEL] T4: y la Chivo 700 y 300 del titular de Quiénes somos. */
const FUENTES: Readonly<Record<FuenteDelTitulo, Font>> = {
  'chivo-400': new Font(datosDeLaFuente as FontData),
  'archivo-700': new Font(datosDeArchivo as FontData),
  'chivo-300-italica': new Font(datosDeLaItalica as FontData),
  'chivo-700': new Font(datosDeLaFuerte as FontData),
  'chivo-300': new Font(datosDeLaLiviana as FontData),
}

/** [RETOQUE 3D] El lugar de un título en el cuadro, escribible: el de `pantalla` se recalcula en cada cuadro sin reservar. */
export type LugarVivo = { -readonly [K in keyof LugarEnElCuadro]: LugarEnElCuadro[K] }

export interface Armado {
  readonly titulo: TituloDeVolumen
  /** Lo que se muestra: persigue a la llegada y a la salida de la pieza (`persigue`). */
  readonly mostrado: { llegada: number; salida: number }
  readonly grupo: THREE.Group
  readonly malla: THREE.Mesh
  readonly material: THREE.MeshStandardMaterial
  readonly uniforms: { readonly uLlegada: { value: number }; readonly uSalida: { value: number }; readonly uQuieto: { value: number }; readonly uLevanta: { value: number }; readonly uPieDeLaPalabra: { value: THREE.Vector2 }; readonly uTrazos: { value: THREE.Vector4 } }
  readonly fuente: Font
  readonly contorno: ContornoDelLogo
  /** [RETOQUE PANEL] T4 · sin letras (el ≠): se dibuja sólo con alguna raya empezada. */
  readonly sinLetras: boolean
  colocado: boolean
  /**
   * [RETOQUE 3D] B1 · lo que el que se queda necesita para irse con su sección: dónde quedó colocado (el lugar de lectura,
   * el grupo y la dirección de arriba de la cámara que lo colocó), cuánto mundo es un píxel ahí y el recorrido del escenario.
   */
  readonly base: THREE.Vector3
  readonly arriba: THREE.Vector3
  mundoPorPx: number
  lugar: LugarEnElCuadro | null
  pin: PinDelLugar
  /** [RETOQUE 3D] El de `pantalla`, en cada cuadro: su lugar de ahora en el cuadro. */
  readonly ahora: LugarVivo
}

export function ponerElEstudio(material: THREE.MeshStandardMaterial, rt: THREE.WebGLRenderTarget): void {
  material.envMap = rt.texture
  material.needsUpdate = true
}

/** [RETOQUE PANEL] T4 · las rayas del título, medidas en el DOM una vez (px de su caja) y pasadas a em desde su origen. */
function rayasDe(titulo: TituloDeVolumen, fuente: Font): RayaEnEm[] {
  if (titulo.trazos.length === 0) return []
  const enEm = enEmDelLugar(titulo.lugar, fuente.data)
  const cuerpo = parseFloat(getComputedStyle(titulo.lugar).fontSize)
  return titulo.trazos.flatMap((t, indice) => {
    const s = t.medir(titulo.lugar)
    if (s === null || cuerpo <= 0) return []
    const [x1, y1] = enEm(s.x1, s.y1)
    const [x2, y2] = enEm(s.x2, s.y2)
    return [{ indice, x1, y1, x2, y2, grosor: s.grosor / cuerpo, nace: t.nace }]
  })
}

/** Avances de las rayas de un título (los que no tiene, en 0): el uniform de su sombreador. */
export function avancesDeLasRayas(titulo: TituloDeVolumen, destino: THREE.Vector4): boolean {
  const a = (k: number): number => Math.min(1, Math.max(0, titulo.trazos[k]?.avance.get() ?? 0))
  destino.set(a(0), a(1), a(2), a(3))
  return destino.x > 0 || destino.y > 0 || destino.z > 0 || destino.w > 0
}

export function armar(titulo: TituloDeVolumen, variante: Variante): Armado {
  const fuente = FUENTES[titulo.fuente]
  const { geometria, contornos, cajaDeLasLetras, letras } = armarElTitulo(fuente, titulo.texto, posicionesDelDom(titulo.lugar), titulo.gesto, rayasDe(titulo, fuente))
  const material = new THREE.MeshStandardMaterial({ color: variante === 'negro' ? INK_COLOR : PAPER_COLOR, roughness: SATINADO.roughness, metalness: 0, dithering: true })
  // [RETOQUE 3D] `levanta`: el pie de atrás de la palabra (el más bajo y el más atrás de sus LETRAS, em) es el eje del giro y la línea.
  // [RETOQUE PANEL] T4 · sin letras (el ≠), en 0: la caja vacía es infinita y el sombreador daría NaN aunque no se levante.
  const uniforms = { uLlegada: { value: 0 }, uSalida: { value: 0 }, uQuieto: { value: 0 }, uLevanta: { value: titulo.gesto === 'levanta' ? 1 : 0 }, uPieDeLaPalabra: { value: cajaDeLasLetras.isEmpty() ? new THREE.Vector2() : new THREE.Vector2(cajaDeLasLetras.min.y, cajaDeLasLetras.min.z) }, uTrazos: { value: new THREE.Vector4() } }
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${LLEGADA_PARS_GLSL}`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n${LLEGADA_NORMAL_GLSL}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${LLEGADA_POSICION_GLSL}`)
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\n${DISOLVER_PARS_GLSL}`).replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${DISOLVER_GLSL}`)
    // El blanco, de día: el filo oscuro (la función del borde la trae el dibujo de noche, que se instala abajo).
    if (variante === 'blanco') shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>\n${FILO_DE_DIA_GLSL}`)
    // [RETOQUE DEL PIE] P1 · el negro, de día: los costados en otro gris (`filo.ts`; era la b de la prueba de RONDA 2).
    else shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>\n${costadoDeDiaGlsl(EMISION_EN_LA_NOCHE)}`)
  }
  material.customProgramCacheKey = () => `titulo-de-volumen-${variante}`
  // De noche, el dibujo del logo (en em: el filo y el campo de su contorno); y el amanecer, como el resto de la sala.
  const contorno = hornearContornos(contornos, NOCHE_DEL_TITULO.contorno)
  conLogoDeNoche(material, contorno, variante === 'blanco' ? { ancho: NOCHE_DEL_TITULO.filo, tapa: NOCHE_DEL_TITULO.tapaDelBlanco } : { ancho: NOCHE_DEL_TITULO.filo })
  conElAmanecer(material)
  const malla = new THREE.Mesh(geometria, material)
  malla.name = `titulo de volumen · ${titulo.id}`
  // Las letras que llegan salen de la caja de la geometría quieta: sin descarte por encuadre (son una o dos mallas).
  malla.frustumCulled = false
  malla.visible = false
  const grupo = new THREE.Group()
  grupo.add(malla)
  return { titulo, mostrado: { llegada: titulo.queda ? 0 : titulo.llegada, salida: titulo.queda ? 0 : titulo.salida }, grupo, malla, material, uniforms, fuente, contorno, sinLetras: letras === 0, colocado: false, base: new THREE.Vector3(), arriba: new THREE.Vector3(0, 1, 0), mundoPorPx: 0, lugar: null, pin: { inicio: 0, fin: 0 }, ahora: { izquierda: 0, arriba: 0, linea: 0, cuerpo: 0, ancho: 0, alto: 0 } }
}

export function soltar(a: Armado): void {
  a.malla.geometry.dispose()
  a.material.dispose()
  a.contorno.textura.dispose()
}
