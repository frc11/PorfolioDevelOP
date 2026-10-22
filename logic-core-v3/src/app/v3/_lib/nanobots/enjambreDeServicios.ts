import * as THREE from 'three'

import { sembrar } from '../escena/titulos3d/llegada'
import { extensionDelSimbolo, type Caja } from './capa'
import { APARTADO_GLSL, FISICA_DEL_ENJAMBRE, FRAGMENTO_DEL_ENJAMBRE, enSrgb, tramoDelEnjambre, type Enjambre } from './enjambre'
import { PUNTERO_DEL_ENJAMBRE } from './puntero'
import { VIDA_DE_LA_RED_GLSL, redNeuronal } from './redNeuronal'
import { ENGRANAJES, GLOBO, engranajes, globo, nube } from './simbolos'

/**
 * [B4] EL ENJAMBRE DE LA SECCIÓN SERVICIOS — el mismo motor de C4 (`enjambre.ts`: una llamada, los destinos como atributos, el
 * traspaso con su retraso, su resorte y su dispersión en la GPU, el desarme bajo el mouse) con las formas de B4 y un lienzo que cubre
 * el escenario entero, así el enjambre VIAJA por la pantalla de un lugar a otro:
 *
 *   0 · la nube gris, detrás de «Nuestros servicios»   1 · el globo de meridianos, con el acento oscuro de web
 *   2 · los dos engranajes encastrados que giran (violeta)   3 · la red neuronal, con nodos que se prenden y pulsos (verde)
 *
 * Cada estado tiene su LUGAR en el escenario (lo mide la sección en el DOM: `ubicar`), y cada nanobot viaja de su punto en el lugar de
 * antes a su punto en el de después. Los acentos son los OSCUROS del tema (sobre papel), copiados acá: `three` no lee el CSS y el
 * motor llega perezoso. El invariante de B4 los compara contra `theme-develop.css`.
 *
 * [B4] Diagnóstico del truco de profundidad: con `diagnostico.cajas` puestas, después de cada cuadro cuenta los píxeles con nanobots
 * adentro de cada caja (`readPixels`, en el mismo cuadro) y los pasa a `diagnostico.registrar`. Sólo lo prende el banco.
 */

export const ACENTOS_DE_SERVICIOS_EN_PAPEL = { nube: '#7A7A76', web: '#1D5B8F', software: '#57429E', ia: '#1B6B4C' } as const

/** Un lugar en el lienzo (px CSS): su centro y cuántos px mide una unidad del símbolo. */
export interface LugarDelEnjambre {
  readonly x: number
  readonly y: number
  readonly unidad: number
}

export interface DiagnosticoDelEnjambre {
  cajas: readonly Caja[] | null
  registrar: ((pixeles: readonly number[]) => void) | null
}

export interface EnjambreDeServicios extends Enjambre {
  readonly ubicar: (lugares: readonly LugarDelEnjambre[]) => void
  readonly diagnostico: DiagnosticoDelEnjambre
  /** El radio en pantalla de cada símbolo, en unidades (`capa.ts`): la sección lo usa para que cada uno entre en su lugar. */
  readonly extensiones: readonly number[]
}

const f = (x: number): string => x.toFixed(5)

/**
 * El desarme bajo el mouse de C4, con el radio medido en el SÍMBOLO y no en el lienzo: el de C4 cubría un lienzo del tamaño del
 * símbolo, éste cubre el escenario entero (con el radio fijo, el hueco sería del tamaño de un tercio del globo). Si el texto de C4
 * cambiara y el reemplazo no encontrara su renglón, queda el radio de siempre (el sombreador compila igual).
 */
const APARTADO_DE_SERVICIOS = APARTADO_GLSL.replace('uniform float uAspecto;', 'uniform float uAspecto;\nuniform float uRadioDelPuntero;').replace(
  `float radio = ${f(PUNTERO_DEL_ENJAMBRE.radio)} *`,
  'float radio = uRadioDelPuntero *',
)
/** El radio del hueco, en unidades del símbolo del estado posado (el de C4 era ~0,2 del lado del lienzo). */
export const RADIO_DEL_PUNTERO_EN_UNIDADES = 0.2

export const VERTICE_DE_SERVICIOS = /* glsl */ `
attribute vec4 aS0;
attribute vec4 aS1;
attribute vec4 aS2;
attribute vec4 aS3;
attribute vec4 aAzar;
uniform float uDesde;
uniform float uHacia;
uniform float uAvance;
uniform float uTiempo;
uniform float uQuieto;
uniform float uMedioAlto;
uniform float uDpr;
uniform vec3 uColores[ 4 ];
uniform vec4 uLugares[ 4 ];
uniform vec2 uCentroA;
uniform vec2 uCentroB;
varying vec3 vColor;
varying float vAlfa;
vec4 destino( float k ) { return k < 0.5 ? aS0 : ( k < 1.5 ? aS1 : ( k < 2.5 ? aS2 : aS3 ) ); }
vec4 lugarDe( float k ) { return k < 0.5 ? uLugares[ 0 ] : ( k < 1.5 ? uLugares[ 1 ] : ( k < 2.5 ? uLugares[ 2 ] : uLugares[ 3 ] ) ); }
vec3 colorDe( float k ) { return k < 0.5 ? uColores[ 0 ] : ( k < 1.5 ? uColores[ 1 ] : ( k < 2.5 ? uColores[ 2 ] : uColores[ 3 ] ) ); }
vec2 girar( vec2 p, float a ) { float c = cos( a ); float s = sin( a ); return vec2( c * p.x - s * p.y, s * p.x + c * p.y ); }
${VIDA_DE_LA_RED_GLSL}
${APARTADO_DE_SERVICIOS}
vec3 vivo( float k, vec4 d, float t ) {
	vec3 p = d.xyz;
	if ( k < 0.5 ) {
		p += 0.05 * vec3( sin( t * 0.6 + aAzar.x * 6.2832 ), sin( t * 0.47 + aAzar.y * 6.2832 ), sin( t * 0.53 + aAzar.z * 6.2832 ) );
		p.xz = girar( p.xz, t * 0.12 );
	} else if ( k < 1.5 ) {
		if ( d.w < 0.5 ) {
			p.xz = girar( p.xz, t * 0.35 );
			p.yz = girar( p.yz, ${f(GLOBO.inclinacion)} );
		}
	} else if ( k < 2.5 ) {
		vec2 c = d.w < 0.5 ? uCentroA : uCentroB;
		float a = d.w < 0.5 ? t * 0.6 : - t * 0.6 * ${f(ENGRANAJES.razon)};
		p.xy = c + girar( p.xy - c, a );
	}
	if ( k < 0.5 || k > 1.5 ) p.xz = girar( p.xz, 0.22 * sin( t * 0.3 ) );
	return p;
}
float cercaDe( vec3 p ) { return 3.0 / ( 3.0 - p.z ); }
vec2 enPantalla( float k, vec3 p ) {
	vec4 l = lugarDe( k );
	vec2 q = p.xy * cercaDe( p ) * 0.82;
	return l.xy + vec2( q.x / uAspecto, q.y ) * l.z;
}
vec2 vidaDe( float k, vec4 d, float t ) { return k > 2.5 ? vidaDeLaRed( d, t, uQuieto ) : vec2( 1.0, 0.0 ); }
float resorte( float t ) {
	if ( t <= 0.0 ) return 0.0;
	if ( t >= 1.0 ) return 1.0;
	return 1.0 - exp( - ${f(FISICA_DEL_ENJAMBRE.amortiguacion)} * t ) * cos( ${f(FISICA_DEL_ENJAMBRE.frecuencia)} * t );
}
void main() {
	float t = uTiempo * ( 1.0 - uQuieto );
	vec4 dA = destino( uDesde );
	vec4 dB = destino( uHacia );
	float u = clamp( ( uAvance - aAzar.x * ${f(FISICA_DEL_ENJAMBRE.retraso)} ) / ${f(1 - FISICA_DEL_ENJAMBRE.retraso)}, 0.0, 1.0 );
	float e = resorte( u );
	float ec = clamp( e, 0.0, 1.0 );
	vec3 pA = vivo( uDesde, dA, t );
	vec3 pB = vivo( uHacia, dB, t );
	vec2 s = mix( enPantalla( uDesde, pA ), enPantalla( uHacia, pB ), e );
	float unidad = mix( lugarDe( uDesde ).z, lugarDe( uHacia ).z, ec );
	s += ( aAzar.yz * 2.0 - 1.0 ) * ${f(FISICA_DEL_ENJAMBRE.dispersion)} * sin( 3.14159265 * u ) * vec2( unidad / uAspecto, unidad );
	gl_Position = vec4( apartadoPorElPuntero( s, t ), 0.0, 1.0 );
	vec2 vida = mix( vidaDe( uDesde, dA, t ), vidaDe( uHacia, dB, t ), ec );
	float cerca = mix( cercaDe( pA ), cercaDe( pB ), ec );
	float tam = clamp( unidad * uMedioAlto / 55.0, 1.6 * uDpr, 2.8 * uDpr );
	gl_PointSize = tam * cerca * ( 1.0 + 0.6 * vida.y );
	vColor = mix( colorDe( uDesde ), colorDe( uHacia ), ec );
	float z = mix( pA.z, pB.z, ec );
	vAlfa = mix( 0.4, 1.0, clamp( ( z + 1.0 ) * 0.5, 0.0, 1.0 ) ) * vida.x;
}
`

/** Los cuatro símbolos de B4, `n` puntos cada uno (en el orden de los estados). Deterministas, como los de C4. */
export function simbolosDeServicios(n: number, semilla = 0xb04): readonly Float32Array[] {
  const azar = sembrar(semilla)
  return [nube, globo, engranajes, redNeuronal].map((forma) => {
    const datos = new Float32Array(n * 4)
    forma(n, azar).forEach((p, i) => datos.set(p, i * 4))
    return datos
  })
}

/** Cuántos píxeles con nanobots hay en cada caja (px CSS del lienzo), en el cuadro recién dibujado. */
function contar(gl: WebGLRenderingContext | WebGL2RenderingContext, cajas: readonly Caja[], dpr: number, altoDelBufer: number): number[] {
  return cajas.map((c) => {
    const x = Math.max(0, Math.floor(c.izquierda * dpr))
    const y = Math.max(0, Math.floor(altoDelBufer - c.abajo * dpr))
    const w = Math.max(0, Math.ceil((c.derecha - c.izquierda) * dpr))
    const h = Math.max(0, Math.ceil((c.abajo - c.arriba) * dpr))
    if (w === 0 || h === 0) return 0
    const pixeles = new Uint8Array(w * h * 4)
    gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixeles)
    let n = 0
    for (let i = 3; i < pixeles.length; i += 4) if (pixeles[i] > 8) n += 1
    return n
  })
}

/** El enjambre de B4 sobre su lienzo: si el navegador no da WebGL, tira (y la sección sigue sin nanobots). */
export function crearEnjambreDeServicios(lienzo: HTMLCanvasElement, puntos: number): EnjambreDeServicios {
  const renderer = new THREE.WebGLRenderer({ canvas: lienzo, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'default' })
  renderer.setClearColor(0x000000, 0)
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  renderer.setPixelRatio(dpr)
  const geometria = new THREE.BufferGeometry()
  geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(puntos * 3), 3))
  const simbolos = simbolosDeServicios(puntos)
  simbolos.forEach((datos, k) => geometria.setAttribute(`aS${String(k)}`, new THREE.BufferAttribute(datos, 4)))
  const azar = new Float32Array(puntos * 4)
  const semilla = sembrar(0x9e3779b9)
  for (let i = 0; i < azar.length; i += 1) azar[i] = semilla()
  geometria.setAttribute('aAzar', new THREE.BufferAttribute(azar, 4))
  const A = ACENTOS_DE_SERVICIOS_EN_PAPEL
  const uniforms = {
    uDesde: { value: 0 },
    uHacia: { value: 0 },
    uAvance: { value: 1 },
    uTiempo: { value: 0 },
    uQuieto: { value: 0 },
    uMedioAlto: { value: 1 },
    uDpr: { value: dpr },
    uColores: { value: [A.nube, A.web, A.software, A.ia].map(enSrgb) },
    uLugares: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, 0, 0.5, 0)) },
    uCentroA: { value: new THREE.Vector2(...ENGRANAJES.a.centro) },
    uCentroB: { value: new THREE.Vector2(...ENGRANAJES.b.centro) },
    uPuntero: { value: new THREE.Vector4(0, 0, 0, 0) },
    uAspecto: { value: 1 },
    uRadioDelPuntero: { value: Number(PUNTERO_DEL_ENJAMBRE.radio) },
  }
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTICE_DE_SERVICIOS, fragmentShader: FRAGMENTO_DEL_ENJAMBRE, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true })
  const nanobots = new THREE.Points(geometria, material)
  nanobots.frustumCulled = false
  const escena = new THREE.Scene()
  escena.add(nanobots)
  const camara = new THREE.Camera()
  const tamano = { ancho: 1, alto: 1 }
  let lugares: readonly LugarDelEnjambre[] = []
  const reubicar = (): void => {
    lugares.forEach((l, k) => uniforms.uLugares.value[k]?.set((l.x / tamano.ancho) * 2 - 1, 1 - (l.y / tamano.alto) * 2, (l.unidad / tamano.alto) * 2, 0))
  }
  const diagnostico: DiagnosticoDelEnjambre = { cajas: null, registrar: null }
  return {
    dibujar: (segundos, posicion, quieto) => {
      const { desde, hacia, avance } = tramoDelEnjambre(posicion, quieto)
      uniforms.uDesde.value = desde
      uniforms.uHacia.value = hacia
      uniforms.uAvance.value = avance
      uniforms.uTiempo.value = segundos
      uniforms.uQuieto.value = quieto ? 1 : 0
      uniforms.uRadioDelPuntero.value = RADIO_DEL_PUNTERO_EN_UNIDADES * (uniforms.uLugares.value[hacia]?.z ?? 1)
      renderer.render(escena, camara)
      if (diagnostico.cajas !== null && diagnostico.registrar !== null)
        diagnostico.registrar(contar(renderer.getContext(), diagnostico.cajas, renderer.getPixelRatio(), lienzo.height))
    },
    medir: (ancho, alto) => {
      if (ancho <= 0 || alto <= 0) return
      renderer.setSize(ancho, alto, false)
      tamano.ancho = ancho
      tamano.alto = alto
      uniforms.uMedioAlto.value = (alto * renderer.getPixelRatio()) / 2
      uniforms.uAspecto.value = ancho / alto
      reubicar()
    },
    ubicar: (nuevos) => {
      lugares = nuevos
      reubicar()
    },
    apuntar: (p) => {
      uniforms.uPuntero.value.set(p.x, p.y, p.fuerza, p.velocidad)
    },
    soltar: () => {
      geometria.dispose()
      material.dispose()
      renderer.dispose()
    },
    diagnostico,
    extensiones: simbolos.map(extensionDelSimbolo),
  }
}
