import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

import { VOLUMEN_DEL_TITULO } from '../titulos3d/geometria'
import type { MetricasDeLaFuente, RenglonDeLaFrase } from './medidaDeLosValores'
import { baseEnLaCaja } from './medidaDeLosValores'

/**
 * [PULIDO 4] C1 · LAS PIEZAS DE LA METAMORFOSIS — las letras (y los íconos) de los dos textos como geometría, en px del
 * marco (x a la derecha, y HACIA ARRIBA, z hacia la cámara: el marco da vuelta la y de la pantalla). Los contornos se
 * densifican (ningún tramo recto más largo que `maximo` em): la deformación se hace en los vértices, y un palo de dos
 * puntas no se dobla. Los valores, en la Chivo del DOM (400); la frase, en Archivo (su copy, con minúsculas) centrada en
 * cada renglón que el DOM le deja.
 */

/** Una letra de la frase del CTA en la pantalla: el comienzo de su avance y su línea de base (px), su cuerpo y su orden (0 a 1). */
export interface LetraDeLaFrase {
  readonly c: string
  readonly x: number
  readonly base: number
  readonly cuerpo: number
  readonly fuerte: boolean
  readonly orden: number
}

const avance = (f: Font, c: string): number => (f.data.glyphs[c]?.ha ?? 0) / f.data.resolution

/** Las letras de la frase, renglón por renglón, centradas en su caja del DOM y con la línea de base de su fuente. */
export function letrasDeLaFrase(renglones: readonly RenglonDeLaFrase[], normal: Font, fuerte: Font): LetraDeLaFrase[] {
  const salida: { c: string; x: number; base: number; cuerpo: number; fuerte: boolean }[] = []
  for (const r of renglones) {
    const f = r.fuerte ? fuerte : normal
    const ancho = [...r.texto].reduce((a, c) => a + avance(f, c), 0) * r.cuerpo
    let x = r.izquierda + (r.ancho - ancho) / 2
    const base = baseEnLaCaja(r.arriba, r.alto, r.cuerpo, f.data as MetricasDeLaFuente)
    for (const c of r.texto) {
      if (c.trim() !== '') salida.push({ c, x, base, cuerpo: r.cuerpo, fuerte: r.fuerte })
      x += avance(f, c) * r.cuerpo
    }
  }
  return salida.map((l, k) => ({ ...l, orden: salida.length <= 1 ? 0 : k / (salida.length - 1) }))
}

/** Un contorno con sus tramos rectos partidos (ninguno más largo que `maximo`), sin repetir el primer punto al final. */
export function densificar(puntos: readonly THREE.Vector2[], maximo: number): THREE.Vector2[] {
  const salida: THREE.Vector2[] = []
  const n = puntos.length - (puntos.length > 1 && puntos[0].equals(puntos[puntos.length - 1]) ? 1 : 0)
  for (let k = 0; k < n; k += 1) {
    const a = puntos[k]
    const b = puntos[(k + 1) % n]
    const partes = Math.max(1, Math.ceil(a.distanceTo(b) / maximo))
    for (let j = 0; j < partes; j += 1) salida.push(new THREE.Vector2().lerpVectors(a, b, j / partes))
  }
  return salida
}

/** Los contornos de una letra (em, y hacia arriba): cada forma con su borde y sus agujeros. */
export interface FormaEnContornos {
  readonly borde: THREE.Vector2[]
  readonly agujeros: THREE.Vector2[][]
}

export function contornosDeLaLetra(fuente: Font, c: string, maximo: number): FormaEnContornos[] {
  if (fuente.data.glyphs[c] === undefined) throw new Error(`la fuente de la metamorfosis no tiene «${c}»`)
  return fuente.generateShapes(c, 1).map((forma) => {
    const { shape, holes } = forma.extractPoints(VOLUMEN_DEL_TITULO.curvas)
    return { borde: densificar(shape, maximo), agujeros: holes.map((h) => densificar(h, maximo)) }
  })
}

/** Las formas densificadas de una letra, listas para extruir (sin volver a partir sus tramos). */
function formasDe(fuente: Font, c: string, maximo: number): THREE.Shape[] {
  return contornosDeLaLetra(fuente, c, maximo).map((f) => {
    const forma = new THREE.Shape(f.borde)
    forma.holes = f.agujeros.map((h) => new THREE.Path(h))
    return forma
  })
}

/**
 * Una letra en px del marco: su avance empieza en `x` y su línea de base está en `base` (px de la pantalla, y hacia abajo),
 * con su cuerpo; la cara de adelante en z = 0 y su espesor (em) hacia atrás. Con `bisel`, el de los títulos de volumen.
 */
export function geometriaDeLaLetra(fuente: Font, c: string, x: number, base: number, cuerpo: number, espesor: number, bisel: boolean, maximo: number): THREE.BufferGeometry {
  const B = VOLUMEN_DEL_TITULO.bisel
  const g = new THREE.ExtrudeGeometry(formasDe(fuente, c, maximo), bisel ? { depth: espesor, curveSegments: 1, bevelEnabled: true, bevelThickness: B.grosor, bevelSize: B.tamano, bevelOffset: -B.tamano, bevelSegments: B.segmentos } : { depth: espesor, curveSegments: 1, bevelEnabled: false })
  g.translate(0, 0, -espesor)
  g.scale(cuerpo, cuerpo, cuerpo)
  g.translate(x, -base, 0)
  return g
}

/** El trazo de Lucide (1,5 de 24): el mismo que el DOM. */
const TRAZO_DEL_ICONO = 1.5

/** Un ícono de Lucide (su SVG del DOM) en px del marco, en su caja (px de la pantalla, y hacia abajo): plano, de trazos. */
export function geometriaDelIcono(svg: string, x: number, y: number, ancho: number): THREE.BufferGeometry | null {
  const datos = new SVGLoader().parse(svg)
  const vista = (/viewBox="([^"]+)"/.exec(svg)?.[1] ?? '0 0 24 24').split(/[\s,]+/).map(Number)
  const k = ancho / (vista[2] > 0 ? vista[2] : 24)
  const estilo = SVGLoader.getStrokeStyle(TRAZO_DEL_ICONO, '#000', 'round', 'round', 4)
  const partes: THREE.BufferGeometry[] = []
  for (const camino of datos.paths) {
    for (const sub of camino.subPaths) {
      const g = SVGLoader.pointsToStroke(sub.getPoints(), estilo)
      if (g !== null) partes.push(g)
    }
  }
  if (partes.length === 0) return null
  const posiciones: number[] = []
  for (const g of partes) {
    const p = g.getAttribute('position')
    // Con la y dada vuelta, cada triángulo cambia de sentido: se lo recorre al revés para que mire a la cámara.
    for (let i = 0; i + 2 < p.count; i += 3) for (const j of [i, i + 2, i + 1]) posiciones.push(x + (p.getX(j) - vista[0]) * k, -(y + (p.getY(j) - vista[1]) * k), 0)
    g.dispose()
  }
  const salida = new THREE.BufferGeometry()
  salida.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3))
  salida.setAttribute('normal', new THREE.Float32BufferAttribute(posiciones.map((_, i) => (i % 3 === 2 ? 1 : 0)), 3))
  salida.setAttribute('uv', new THREE.Float32BufferAttribute(new Array<number>((posiciones.length / 3) * 2).fill(0), 2))
  return salida
}

/** Le pone a cada vértice de `g` un atributo constante (`nombre`, de `valores.length` componentes). */
export function conAtributo(g: THREE.BufferGeometry, nombre: string, valores: readonly number[]): THREE.BufferGeometry {
  const n = g.getAttribute('position').count
  const datos = new Float32Array(n * valores.length)
  for (let i = 0; i < n; i += 1) for (let j = 0; j < valores.length; j += 1) datos[i * valores.length + j] = valores[j]
  g.setAttribute(nombre, new THREE.BufferAttribute(datos, valores.length))
  return g
}

/**
 * EL RUIDO DE LA METAMORFOSIS — el simplex 3D de Ian McEwan y Stefan Gustavson (Ashima Arts, MIT), con nombres propios para
 * no chocar con los de three: suave, sin direcciones de grilla. Lo leen el vértice (la deformación) y el fragmento (el
 * disolvente de `fusion`).
 */
export const RUIDO_DE_LA_METAMORFOSIS_GLSL = /* glsl */ `
vec3 metaMod289( vec3 x ) { return x - floor( x * ( 1.0 / 289.0 ) ) * 289.0; }
vec4 metaMod289( vec4 x ) { return x - floor( x * ( 1.0 / 289.0 ) ) * 289.0; }
vec4 metaPermutar( vec4 x ) { return metaMod289( ( ( x * 34.0 ) + 1.0 ) * x ); }
vec4 metaRaizInversa( vec4 r ) { return 1.79284291400159 - 0.85373472095314 * r; }
float metaRuido( vec3 v ) {
	const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );
	const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );
	vec3 i = floor( v + dot( v, C.yyy ) );
	vec3 x0 = v - i + dot( i, C.xxx );
	vec3 g = step( x0.yzx, x0.xyz );
	vec3 l = 1.0 - g;
	vec3 i1 = min( g.xyz, l.zxy );
	vec3 i2 = max( g.xyz, l.zxy );
	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy;
	vec3 x3 = x0 - D.yyy;
	i = metaMod289( i );
	vec4 p = metaPermutar( metaPermutar( metaPermutar( i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) ) + i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) ) + i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );
	float n_ = 0.142857142857;
	vec3 ns = n_ * D.wyz - D.xzx;
	vec4 j = p - 49.0 * floor( p * ns.z * ns.z );
	vec4 x_ = floor( j * ns.z );
	vec4 y_ = floor( j - 7.0 * x_ );
	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs( x ) - abs( y );
	vec4 b0 = vec4( x.xy, y.xy );
	vec4 b1 = vec4( x.zw, y.zw );
	vec4 s0 = floor( b0 ) * 2.0 + 1.0;
	vec4 s1 = floor( b1 ) * 2.0 + 1.0;
	vec4 sh = -step( h, vec4( 0.0 ) );
	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
	vec3 p0 = vec3( a0.xy, h.x );
	vec3 p1 = vec3( a0.zw, h.y );
	vec3 p2 = vec3( a1.xy, h.z );
	vec3 p3 = vec3( a1.zw, h.w );
	vec4 norm = metaRaizInversa( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;
	vec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );
	m = m * m;
	return 42.0 * dot( m * m, vec4( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 ), dot( p3, x3 ) ) );
}
// El flujo: un campo de desplazamiento suave (dos ruidos), que cambia con el progreso (función del scroll).
vec2 metaFlujo( vec2 p, float t ) {
	return vec2( metaRuido( vec3( p * 0.0075, t ) ), metaRuido( vec3( p * 0.0075 + 19.3, t + 7.1 ) ) );
}
`

/** El punto del cuadro a una profundidad: en el plano, corrido para que su grupo (centro `c`) se vea en su lugar de la pantalla. */
export const EN_SU_LUGAR_GLSL = /* glsl */ `
vec3 metaEnSuLugar( vec2 visto, vec2 c, float z, vec2 fuga, float fondo ) {
	return vec3( visto - ( c - fuga ) * z / fondo, z );
}
`
