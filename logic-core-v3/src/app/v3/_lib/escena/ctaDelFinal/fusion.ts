import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { conElAmanecer } from '../amanecer/luz'
import { SATINADO } from '../estudio'
import { EMISION_EN_LA_NOCHE } from '../logoEmision'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import { COSTADO_DE_DIA } from '../titulos3d/filo'
import type { Variante } from '../titulos3d/armado'
import { VOLUMEN_DEL_TITULO } from '../titulos3d/geometria'
import type { ValorMedido } from './medidaDeLosValores'
import { EN_SU_LUGAR_GLSL, RUIDO_DE_LA_METAMORFOSIS_GLSL, conAtributo, geometriaDeLaLetra, geometriaDelIcono, type LetraDeLaFrase } from './piezasDeLaMetamorfosis'
import type { EstadoDeLaMetamorfosis } from './transformacion'

/**
 * [PULIDO 4] C1 · LA METAMORFOSIS `fusion` (la del producto) — los dos textos son mallas 3D (una por texto: una llamada cada
 * uno). Las de los valores se derriten con ruido hacia la zona de la frase (desplazamiento en el vértice: cada vértice con su
 * demora, así las letras se estiran mientras fluyen); la frase nace de ese mismo estado deformado (el mismo flujo, en el mismo
 * lugar) y se des-deforma. Entre las dos, un disolvente con umbral de ruido sobre el lugar en la masa: en el medio se leen
 * como UNA sola masa. Todo con el progreso (función del scroll): el vértice no guarda nada entre cuadros.
 *
 * Las cuentas van en px de la pantalla (y hacia abajo) y al final se pasan al marco (y hacia arriba); lo que se aleja se
 * achica alrededor del centro de su grupo, en su lugar de la pantalla (`metaEnSuLugar`).
 */

/**
 * Las medidas de la fusión. Cada LETRA se mueve entera (su demora sale de su centro: un ruido lento sobre la pantalla, así las
 * vecinas van juntas y nada se deshilacha): `demora` (fracción del cambio). Mientras viaja, el flujo dobla su camino
 * (`flujo`, px por el cuerpo de la frase) y la letra se estira en la dirección en que va (`estira`), como una gota. Derretida
 * (`derrite`: la deformación de adentro, por el cuerpo de cada letra, con un ruido lento, `detalle` por px: dobla palabras, no
 * revuelve letras), se ablanda en su lugar antes
 * de irse y llega así a la masa, más grande (`enLaMasa`: la densidad de la frase). La frase nace igual de derretida y se
 * limpia letra por letra. `compresion`: la masa es la caja de la frase, un poco más chica.
 */
export const FUSION = { flujo: 0.75, demora: 0.34, estira: 0.9, derrite: { valores: 0.6, frase: 0.5 }, detalle: { valores: 0.012, frase: 0.006 }, enLaMasa: 1.35, compresion: [0.9, 0.78] as const, vidaDelFlujo: 2.4 } as const

/** Los espesores (em): el título del valor tiene volumen (como su espesor del DOM); la línea, apenas; la frase, el de los títulos. */
const ESPESOR = { titulo: 0.12, linea: 0.05, frase: VOLUMEN_DEL_TITULO.profundidad } as const
/** Los tramos rectos más largos (em): la frase se dobla más (letras grandes), los valores alcanzan con menos. */
const MAXIMO = { valores: 0.16, frase: 0.07 } as const

export interface UniformesDeLaFusion {
  readonly uItems: { value: THREE.Vector4[] }
  readonly uCentros: { value: THREE.Vector2[] }
  readonly uCajaDeLosValores: { value: THREE.Vector4 }
  readonly uMasa: { value: THREE.Vector4 }
  readonly uCorrimiento: { value: THREE.Vector2 }
  readonly uFuga: { value: THREE.Vector2 }
  readonly uFondo: { value: number }
  readonly uAtras: { value: number }
  readonly uCambia: { value: number }
  readonly uCorte: { value: number }
  readonly uLimpia: { value: number }
  readonly uAdelante: { value: number }
  readonly uFlujo: { value: number }
  readonly uTiempo: { value: number }
  readonly uApareceDeLosValores: { value: number }
  readonly uDerrite: { value: number }
  readonly uCuerpoDeLaFrase: { value: number }
}

export interface FusionArmada {
  readonly valores: THREE.Mesh
  readonly frase: THREE.Mesh
  readonly u: UniformesDeLaFusion
  readonly materiales: readonly THREE.MeshStandardMaterial[]
}

const COMUN_GLSL = /* glsl */ `
uniform vec4 uMasa;
uniform vec2 uFuga;
uniform float uFondo;
uniform float uAtras;
uniform float uFlujo;
uniform float uTiempo;
uniform float uCorte;
uniform float uApareceDeLosValores;
uniform float uDerrite;
uniform float uCuerpoDeLaFrase;
${RUIDO_DE_LA_METAMORFOSIS_GLSL}
${EN_SU_LUGAR_GLSL}
`

/** El vértice de los valores: en su caja de ahora, atrás en su lugar; cada letra se derrite y viaja entera a la masa. */
const VERTICE_DE_LOS_VALORES = /* glsl */ `
	vec4 caja = uItems[ int( aItem + 0.5 ) ];
	vec2 q = caja.xy + vec2( position.x, -position.y ) * caja.z;
	vec2 c = caja.xy + vec2( aCentro.x, -aCentro.y ) * caja.z;
	vec2 centroDelValor = uCentros[ int( aItem + 0.5 ) ];
	// Adónde va el centro de la letra: la caja de los valores, llevada a la de la frase (comprimida).
	vec2 cM = uMasa.xy + ( c - uCajaDeLosValores.xy ) * ( uMasa.zw / max( uCajaDeLosValores.zw, vec2( 1.0 ) ) ) * vec2( ${FUSION.compresion[0].toFixed(3)}, ${FUSION.compresion[1].toFixed(3)} );
	float demora = ${FUSION.demora.toFixed(3)} * ( 0.5 + 0.5 * metaRuido( vec3( c * 0.0035, 0.37 ) ) );
	float m = clamp( ( uCambia - demora ) / ( 1.0 - ${FUSION.demora.toFixed(3)} ), 0.0, 1.0 );
	float e = m * m * ( 3.0 - 2.0 * m );
	float viaja = sin( 3.14159265 * e );
	vec2 centro = mix( c, cM, e );
	centro += metaFlujo( centro, uTiempo ) * uFlujo * viaja;
	// Adentro de la letra: se estira hacia donde va (una gota), crece hacia la masa y se derrite (un ruido de su tamaño).
	vec2 l = q - c;
	vec2 hacia = cM - c;
	vec2 dir = hacia / max( length( hacia ), 1e-3 );
	l += dir * dot( l, dir ) * ${FUSION.estira.toFixed(3)} * viaja;
	l *= mix( 1.0, ${FUSION.enLaMasa.toFixed(3)}, e );
	l += metaFlujo( q * ${(FUSION.detalle.valores / 0.0075).toFixed(3)}, uTiempo + 3.0 ) * uDerrite * ${FUSION.derrite.valores.toFixed(3)} * caja.w * caja.z;
	vMasa = cM + l;
	vTapa = step( 0.5, normal.z );
	vec3 enElPlano = metaEnSuLugar( centro + l, mix( centroDelValor, uMasa.xy, e ), -uAtras, uFuga, uFondo );
	vec3 transformed = vec3( enElPlano.x, -enElPlano.y, enElPlano.z + position.z * caja.z );
`

/** El vértice de la frase: cada letra nace en la masa, derretida (el mismo ruido), y se limpia y vuelve a su lugar; viene adelante. */
const VERTICE_DE_LA_FRASE = /* glsl */ `
	vec2 v = vec2( position.x, -position.y ) + uCorrimiento;
	vec2 c = vec2( aCentro.x, -aCentro.y ) + uCorrimiento;
	vec2 cM = uMasa.xy + ( c - uMasa.xy ) * vec2( ${FUSION.compresion[0].toFixed(3)}, ${FUSION.compresion[1].toFixed(3)} );
	float demora = ${FUSION.demora.toFixed(3)} * ( 0.35 + 0.35 * metaRuido( vec3( c * 0.0035, 2.11 ) ) + 0.3 * aOrden );
	float m = clamp( ( uLimpia - demora ) / ( 1.0 - ${FUSION.demora.toFixed(3)} ), 0.0, 1.0 );
	float e = m * m * ( 3.0 - 2.0 * m );
	vec2 centro = mix( cM, c, e );
	centro += metaFlujo( centro, uTiempo ) * uFlujo * sin( 3.14159265 * e );
	vec2 l = v - c;
	l *= mix( 0.85, 1.0, e );
	l += metaFlujo( v * ${(FUSION.detalle.frase / 0.0075).toFixed(3)}, uTiempo + 3.0 ) * ( 1.0 - e ) * ${FUSION.derrite.frase.toFixed(3)} * uCuerpoDeLaFrase;
	vMasa = cM + l;
	vTapa = step( 0.5, normal.z );
	vec3 enElPlano = metaEnSuLugar( centro + l, uMasa.xy, -uAtras * ( 1.0 - uAdelante ), uFuga, uFondo );
	vec3 transformed = vec3( enElPlano.x, -enElPlano.y, enElPlano.z + position.z );
`

/** El disolvente: un ruido sobre el lugar en la masa; los valores se ven debajo del umbral y la frase arriba (complementarios). */
const corteGlsl = (frase: boolean): string => /* glsl */ `
	float corte = clamp( 0.5 + 0.75 * metaRuido( vec3( vMasa * 0.021, 5.3 ) ), 0.0, 1.0 );
	if ( ${frase ? 'corte >= uCorte' : 'corte < uCorte'} ) discard;
	${frase ? '' : 'if ( uApareceDeLosValores < 0.999 && fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) ) >= uApareceDeLosValores ) discard;'}
`

function material(color: Variante, frase: boolean, u: UniformesDeLaFusion): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: color === 'negro' ? INK_COLOR : PAPER_COLOR, roughness: SATINADO.roughness, metalness: 0, dithering: true })
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u)
    const propios = frase ? 'attribute float aOrden;\nattribute vec2 aCentro;\nuniform vec2 uCorrimiento;\nuniform float uLimpia;\nuniform float uAdelante;' : 'attribute float aItem;\nattribute vec2 aCentro;\nuniform vec4 uItems[ 6 ];\nuniform vec2 uCentros[ 6 ];\nuniform vec4 uCajaDeLosValores;\nuniform float uCambia;'
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${COMUN_GLSL}\n${propios}\nvarying vec2 vMasa;\nvarying float vTapa;`)
      .replace('#include <begin_vertex>', frase ? VERTICE_DE_LA_FRASE : VERTICE_DE_LOS_VALORES)
    const dia = `( 1.0 - clamp( emissive.r / ${EMISION_EN_LA_NOCHE.toFixed(3)}, 0.0, 1.0 ) )`
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${COMUN_GLSL}\nvarying vec2 vMasa;\nvarying float vTapa;`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${corteGlsl(frase)}`)
      .replace('#include <map_fragment>', `#include <map_fragment>\n\tdiffuseColor.rgb = mix( vec3( ${COSTADO_DE_DIA.toFixed(3)} ), diffuseColor.rgb, mix( 1.0, vTapa, ${dia} ) );`)
  }
  m.customProgramCacheKey = () => `metamorfosis-fusion-${frase ? 'frase' : 'valores'}-${color}`
  conElAmanecer(m)
  return m
}

/** Arma las dos mallas: los valores (sus letras y sus íconos, cada vértice con su valor y el centro de su letra) y la frase. */
export function armarLaFusion(valores: readonly (ValorMedido | null)[], frase: readonly LetraDeLaFrase[], fuentes: { readonly valores: Font; readonly frase: Font; readonly fuerte: Font }, color: Variante): FusionArmada {
  const partes: THREE.BufferGeometry[] = []
  valores.forEach((v, k) => {
    if (v === null) return
    const cuerpoDelTitulo = Math.max(...v.letras.map((l) => l.cuerpo))
    for (const l of v.letras) {
      const g = geometriaDeLaLetra(fuentes.valores, l.c, l.x, l.base, l.cuerpo, l.cuerpo >= cuerpoDelTitulo ? ESPESOR.titulo : ESPESOR.linea, false, MAXIMO.valores)
      g.computeBoundingBox()
      const centro = g.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3()
      partes.push(conAtributo(conAtributo(g, 'aItem', [k]), 'aCentro', [centro.x, centro.y]))
    }
    for (const i of v.iconos) {
      const g = geometriaDelIcono(i.svg, i.x, i.y, i.ancho)
      if (g !== null) partes.push(conAtributo(conAtributo(g, 'aItem', [k]), 'aCentro', [i.x + i.ancho / 2, -(i.y + i.alto / 2)]))
    }
  })
  const deLaFrase = frase.map((l) => {
    const g = geometriaDeLaLetra(l.fuerte ? fuentes.fuerte : fuentes.frase, l.c, l.x, l.base, l.cuerpo, ESPESOR.frase, true, MAXIMO.frase)
    g.computeBoundingBox()
    const centro = g.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3()
    return conAtributo(conAtributo(g, 'aOrden', [l.orden]), 'aCentro', [centro.x, centro.y])
  })
  const u: UniformesDeLaFusion = {
    uItems: { value: Array.from({ length: 6 }, () => new THREE.Vector4(0, 0, 1, 20)) },
    uCentros: { value: Array.from({ length: 6 }, () => new THREE.Vector2()) },
    uCajaDeLosValores: { value: new THREE.Vector4(0, 0, 1, 1) },
    uMasa: { value: new THREE.Vector4(0, 0, 1, 1) },
    uCorrimiento: { value: new THREE.Vector2() },
    uFuga: { value: new THREE.Vector2() },
    uFondo: { value: 1000 },
    uAtras: { value: 0 },
    uCambia: { value: 0 },
    uCorte: { value: 0 },
    uLimpia: { value: 0 },
    uAdelante: { value: 0 },
    uFlujo: { value: 0 },
    uTiempo: { value: 0 },
    uApareceDeLosValores: { value: 0 },
    uDerrite: { value: 0 },
    uCuerpoDeLaFrase: { value: 56 },
  }
  const unir = (gs: THREE.BufferGeometry[]): THREE.BufferGeometry => {
    for (const g of gs) {
      // Los íconos (de trazos) no traen todo lo que trae una extrusión: se iguala a lo que las mallas leen.
      for (const nombre of Object.keys(g.attributes)) if (!['position', 'normal', 'aItem', 'aCentro', 'aOrden'].includes(nombre)) g.deleteAttribute(nombre)
      if (g.index !== null) g.copy(g.toNonIndexed())
    }
    const unida = gs.length > 0 ? mergeGeometries(gs, false) : null
    for (const g of gs) g.dispose()
    return unida ?? new THREE.BufferGeometry()
  }
  const materialDeLosValores = material(color, false, u)
  const materialDeLaFrase = material(color, true, u)
  const mallaDeLosValores = new THREE.Mesh(unir(partes), materialDeLosValores)
  const mallaDeLaFrase = new THREE.Mesh(unir(deLaFrase), materialDeLaFrase)
  for (const malla of [mallaDeLosValores, mallaDeLaFrase]) {
    malla.frustumCulled = false
    malla.visible = false
  }
  mallaDeLosValores.name = 'metamorfosis · los valores'
  mallaDeLaFrase.name = 'metamorfosis · la frase'
  return { valores: mallaDeLosValores, frase: mallaDeLaFrase, u, materiales: [materialDeLosValores, materialDeLaFrase] }
}

/** Lo que cambia en cada cuadro: dónde está cada valor y su centro, la caja de los valores y la de la frase (px de la pantalla). */
export interface CuadroDeLaMetamorfosis {
  readonly items: readonly { readonly x: number; readonly y: number; readonly escala: number; readonly cuerpo: number; readonly cx: number; readonly cy: number }[]
  readonly cajaDeLosValores: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }
  readonly cajaDeLaFrase: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }
  readonly corrimiento: { readonly x: number; readonly y: number }
  readonly cuerpoDeLaFrase: number
  readonly fuga: { readonly x: number; readonly y: number }
  readonly fondo: number
  readonly progreso: number
  /** Cuánto se ven los valores de la escena: en el escenario, desde que arranca (antes es el DOM); en la lista, con su entrada. */
  readonly apareceDeLosValores: number
}

/** Atrás «poco»: la fracción de la distancia del plano a la que se van los valores (y se arma la masa). */
export function ponerLaFusion(f: FusionArmada, e: EstadoDeLaMetamorfosis, c: CuadroDeLaMetamorfosis, atras: number): void {
  const u = f.u
  c.items.forEach((it, k) => {
    u.uItems.value[k].set(it.x, it.y, it.escala, it.cuerpo)
    u.uCentros.value[k].set(it.cx, it.cy)
  })
  const L = c.cajaDeLosValores
  u.uCajaDeLosValores.value.set(L.x, L.y, L.ancho / 2, L.alto / 2)
  const F = c.cajaDeLaFrase
  u.uMasa.value.set(F.x, F.y, F.ancho / 2, F.alto / 2)
  u.uCorrimiento.value.set(c.corrimiento.x, c.corrimiento.y)
  u.uFuga.value.set(c.fuga.x, c.fuga.y)
  u.uFondo.value = c.fondo
  u.uAtras.value = atras * c.fondo * e.atras
  u.uCambia.value = e.cambia
  // El umbral corre un poco más allá de las puntas del ruido: en 0, todo valores; en 1, toda frase.
  u.uCorte.value = -0.02 + 1.04 * e.corte
  u.uLimpia.value = 1 - e.sucia
  u.uAdelante.value = e.adelante
  u.uFlujo.value = FUSION.flujo * c.cuerpoDeLaFrase
  u.uDerrite.value = e.turbulencia
  u.uCuerpoDeLaFrase.value = c.cuerpoDeLaFrase
  u.uTiempo.value = FUSION.vidaDelFlujo * c.progreso
  u.uApareceDeLosValores.value = c.apareceDeLosValores
  f.valores.visible = e.corte < 1 && c.apareceDeLosValores > 0
  f.frase.visible = e.corte > 0
}

export function soltarLaFusion(f: FusionArmada): void {
  f.valores.geometry.dispose()
  f.frase.geometry.dispose()
  for (const m of f.materiales) m.dispose()
}
