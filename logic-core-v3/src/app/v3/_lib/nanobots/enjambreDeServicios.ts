import * as THREE from 'three'

import { sembrar } from '../escena/titulos3d/llegada'
import { extensionDelSimbolo, type Caja } from './capa'
import { APARTADO_GLSL, FISICA_DEL_ENJAMBRE, enSrgb, tramoDelEnjambre, type Enjambre } from './enjambre'
import { PUNTERO_DEL_ENJAMBRE } from './puntero'
import { VIDA_DE_LA_RED_GLSL, redNeuronal } from './redNeuronal'
import { ACENTOS_DEL_ARO, ENGRANAJES, GLOBO, MEZCLA_DEL_ARO, MODOS_DEL_ARO, OLA_DEL_ARO, ORBITA, PROPORCION_DE_LA_ORBITA, engranajes, globo, orbita, type ModoDelAro } from './simbolos'

/**
 * [B4] EL ENJAMBRE DE LA SECCIÓN SERVICIOS — el mismo motor de C4 (`enjambre.ts`: una llamada, los destinos como atributos, el
 * traspaso con su retraso, su resorte y su dispersión en la GPU, el desarme bajo el mouse) con las formas de B4 y un lienzo que cubre
 * el escenario entero, así el enjambre VIAJA por la pantalla de un lugar a otro:
 *
 *   0 · [C2-50] la ÓRBITA alrededor de «Nuestros servicios», con los tres acentos mezclándose   1 · el globo de meridianos (web)
 *   2 · los dos engranajes encastrados que giran (violeta)   3 · la red neuronal, con nodos que se prenden y pulsos (verde)
 *
 * Cada estado tiene su LUGAR en el escenario (lo mide la sección en el DOM: `ubicar`), y cada nanobot viaja de su punto en el lugar de
 * antes a su punto en el de después. Los acentos son los OSCUROS del tema (sobre papel), copiados acá: `three` no lee el CSS y el
 * motor llega perezoso. El invariante de B4 los compara contra `theme-develop.css`.
 *
 * [C2-50] Entre dos servicios, el viaje es una NUBE grande y volumétrica (ítem 13): una bola 3D que gira, del doble del símbolo, con
 * los nanobots más grandes, la profundidad en el alfa y un borde claro que la hace ver sobre el video y sobre el papel; casi sin el
 * retraso de cada uno (una nube, no un rastro). El viaje de la entrada a web queda como era (el truco de profundidad lo cuenta).
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
  /** [L3] Sólo la órbita (estado 0): la proporción de su caja (alto / ancho). Sin ella, 2:1. */
  readonly proporcion?: number
}

export interface DiagnosticoDelEnjambre {
  cajas: readonly Caja[] | null
  registrar: ((pixeles: readonly number[]) => void) | null
  /** [L3] Con el banco: después de cada cuadro, el centroide de los píxeles con nanobots (px CSS del lienzo) y cuántos. */
  medirElCentroide: boolean
  centroide: { readonly x: number; readonly y: number; readonly n: number } | null
}

export interface EnjambreDeServicios extends Enjambre {
  readonly ubicar: (lugares: readonly LugarDelEnjambre[]) => void
  readonly diagnostico: DiagnosticoDelEnjambre
  /** El radio en pantalla de cada símbolo, en unidades (`capa.ts`): la sección lo usa para que cada uno entre en su lugar. */
  readonly extensiones: readonly number[]
}

const f = (x: number): string => x.toFixed(5)

/** [C2-50] La nube del viaje entre servicios: su radio (unidades del símbolo), cuánto agranda los nanobots, el borde claro y cuánto del retraso se va. */
export const NUBE_DEL_VIAJE = { radio: 1.7, agrandar: 0.9, borde: 0.75, juntos: 0.85 } as const

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
uniform float uProporcion;
uniform float uModoDelAro;
uniform vec3 uColoresDelAro[ 3 ];
varying vec3 vColor;
varying float vAlfa;
varying float vBorde;
vec4 destino( float k ) { return k < 0.5 ? aS0 : ( k < 1.5 ? aS1 : ( k < 2.5 ? aS2 : aS3 ) ); }
vec4 lugarDe( float k ) { return k < 0.5 ? uLugares[ 0 ] : ( k < 1.5 ? uLugares[ 1 ] : ( k < 2.5 ? uLugares[ 2 ] : uLugares[ 3 ] ) ); }
vec3 colorDe( float k ) { return k < 0.5 ? uColores[ 0 ] : ( k < 1.5 ? uColores[ 1 ] : ( k < 2.5 ? uColores[ 2 ] : uColores[ 3 ] ) ); }
vec2 girar( vec2 p, float a ) { float c = cos( a ); float s = sin( a ); return vec2( c * p.x - s * p.y, s * p.x + c * p.y ); }
${VIDA_DE_LA_RED_GLSL}
${APARTADO_DE_SERVICIOS}
// [C2-50 · L3] El ángulo de un nanobot de la órbita AHORA (el de su semilla más lo que giró, a su velocidad).
float anguloDeLaOrbita( vec4 d, float t ) {
	vec2 q = d.xy / vec2( ${f(ORBITA.rx)}, ${f(ORBITA.ry)} );
	return atan( q.y, q.x ) + t * ${f(ORBITA.giro)} * ( 0.8 + 0.4 * aAzar.w );
}
vec3 vivo( float k, vec4 d, float t ) {
	vec3 p = d.xyz;
	if ( k < 0.5 ) {
		// [C2-50] La órbita: cada nanobot corre sobre su elipse (a su velocidad), y flota apenas en profundidad. [L3] La elipse es la de
		// su caja (x = 1, y = uProporcion), con la banda del mismo grosor alrededor.
		float r = length( d.xy / vec2( ${f(ORBITA.rx)}, ${f(ORBITA.ry)} ) );
		float a = anguloDeLaOrbita( d, t );
		vec2 dir = vec2( cos( a ), sin( a ) );
		p.xy = vec2( 1.0, uProporcion ) * dir + ( r - 1.0 ) * min( 1.0, uProporcion ) * dir;
		p.z += 0.04 * sin( t * 0.7 + aAzar.z * 6.2832 );
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
	if ( k > 1.5 ) p.xz = girar( p.xz, 0.22 * sin( t * 0.3 ) );
	return p;
}
// [L3] El color del aro, del ÁNGULO ACTUAL de cada nanobot (antes, del de su semilla: como cada uno gira a su velocidad, al minuto los
// colores quedaban mezclados punto por punto). \`i\` es un índice continuo: entre dos acentos vecinos, su mezcla.
vec3 acentoDelAro( float i ) {
	float k = mod( floor( i ), 3.0 );
	vec3 a = k < 0.5 ? uColoresDelAro[ 0 ] : ( k < 1.5 ? uColoresDelAro[ 1 ] : uColoresDelAro[ 2 ] );
	vec3 b = k < 0.5 ? uColoresDelAro[ 1 ] : ( k < 1.5 ? uColoresDelAro[ 2 ] : uColoresDelAro[ 0 ] );
	return mix( a, b, fract( i ) );
}
vec3 colorDeLaOrbita( vec4 d, float t ) {
	float a = anguloDeLaOrbita( d, t );
	// La vuelta, en el marco que gira con el aro (el de un nanobot de velocidad media): las manchas y los arcos viajan con los puntos.
	float s = fract( ( a - t * ${f(ORBITA.giro)} ) / 6.2832 );
	if ( uModoDelAro < 0.5 ) {
		// mezcla: manchas grandes (el borde de cada nanobot corrido por su azar) y algunos sueltos de otro color.
		if ( aAzar.y < ${f(MEZCLA_DEL_ARO.sueltos)} ) return acentoDelAro( floor( aAzar.x * 3.0 ) );
		float m = s * ${f(MEZCLA_DEL_ARO.manchas)} + ( aAzar.z - 0.5 ) * ${f(MEZCLA_DEL_ARO.borde)};
		return acentoDelAro( floor( m ) + smoothstep( 0.8, 1.0, fract( m ) ) );
	}
	if ( uModoDelAro < 1.5 ) {
		// tercios: un arco de cada acento, con el borde corto.
		float m = s * 3.0;
		return acentoDelAro( floor( m ) + smoothstep( 0.94, 1.0, fract( m ) ) );
	}
	// ola: todo el aro de un color; el siguiente nace arriba (detrás del título) y baja por los dos lados hasta encontrarse al pie.
	float desdeArriba = abs( mod( a - 1.5708 + 3.14159265, 6.2832 ) - 3.14159265 ) / 3.14159265;
	float c = t * ${f(OLA_DEL_ARO.vueltasPorSegundo)} - ${f(OLA_DEL_ARO.recorrido)} * desdeArriba;
	return acentoDelAro( floor( c ) + smoothstep( 0.0, ${f(OLA_DEL_ARO.frente)}, fract( c ) ) );
}
vec3 colorEn( float k, vec4 d, float t ) { return k < 0.5 ? colorDeLaOrbita( d, t ) : colorDe( k ); }
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
	// [C2-50] Entre dos servicios, la nube: casi sin retraso (todos juntos) y una bola que se infla a mitad de camino.
	float nube = uDesde > 0.5 && uHacia > uDesde ? 1.0 : 0.0;
	float retraso = ${f(FISICA_DEL_ENJAMBRE.retraso)} * ( 1.0 - ${f(NUBE_DEL_VIAJE.juntos)} * nube );
	float u = clamp( ( uAvance - aAzar.x * retraso ) / ( 1.0 - retraso ), 0.0, 1.0 );
	float e = resorte( u );
	float ec = clamp( e, 0.0, 1.0 );
	vec3 pA = vivo( uDesde, dA, t );
	vec3 pB = vivo( uHacia, dB, t );
	vec2 s = mix( enPantalla( uDesde, pA ), enPantalla( uHacia, pB ), e );
	float unidad = mix( lugarDe( uDesde ).z, lugarDe( uHacia ).z, ec );
	s += ( 1.0 - nube ) * ( aAzar.yz * 2.0 - 1.0 ) * ${f(FISICA_DEL_ENJAMBRE.dispersion)} * sin( 3.14159265 * u ) * vec2( unidad / uAspecto, unidad );
	float inflado = nube * pow( sin( 3.14159265 * u ), 0.6 );
	vec3 bola = normalize( aAzar.xyz * 2.0 - 1.0 + vec3( 0.0001 ) ) * pow( aAzar.w, 0.4 );
	bola.xz = girar( bola.xz, t * 0.5 );
	bola.xy = girar( bola.xy, 0.4 );
	s += inflado * ${f(NUBE_DEL_VIAJE.radio)} * cercaDe( bola ) * vec2( bola.x / uAspecto, bola.y ) * unidad;
	gl_Position = vec4( apartadoPorElPuntero( s, t ), 0.0, 1.0 );
	vec2 vida = mix( vidaDe( uDesde, dA, t ), vidaDe( uHacia, dB, t ), ec );
	float cerca = mix( cercaDe( pA ), cercaDe( pB ), ec );
	float tam = clamp( unidad * uMedioAlto / 55.0, 1.6 * uDpr, 2.8 * uDpr );
	gl_PointSize = tam * cerca * ( 1.0 + 0.6 * vida.y ) * ( 1.0 + ${f(NUBE_DEL_VIAJE.agrandar)} * inflado );
	vColor = mix( colorEn( uDesde, dA, t ), colorEn( uHacia, dB, t ), ec );
	float z = mix( pA.z, pB.z, ec );
	vAlfa = mix( mix( 0.4, 1.0, clamp( ( z + 1.0 ) * 0.5, 0.0, 1.0 ) ) * vida.x, mix( 0.45, 1.0, clamp( ( bola.z + 1.0 ) * 0.5, 0.0, 1.0 ) ), inflado );
	vBorde = inflado;
}
`

/**
 * [C2-50] El fragmento de Servicios: el punto de C4 y, en la nube del viaje (`vBorde`), un borde claro que lo despega del video oscuro
 * (el centro sigue en el acento: sobre el papel se lee igual).
 */
export const FRAGMENTO_DE_SERVICIOS = /* glsl */ `
varying vec3 vColor;
varying float vAlfa;
varying float vBorde;
void main() {
	float r = length( gl_PointCoord - 0.5 );
	float a = smoothstep( 0.5, 0.26, r ) * vAlfa;
	if ( a < 0.01 ) discard;
	vec3 color = mix( vColor, vec3( 1.0 ), vBorde * ${f(NUBE_DEL_VIAJE.borde)} * smoothstep( 0.18, 0.4, r ) );
	gl_FragColor = vec4( color * a, a );
}
`

/** Los cuatro símbolos de B4, `n` puntos cada uno (en el orden de los estados). Deterministas, como los de C4. */
export function simbolosDeServicios(n: number, semilla = 0xb04): readonly Float32Array[] {
  const azar = sembrar(semilla)
  return [orbita, globo, engranajes, redNeuronal].map((forma) => {
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

/** [L3] El centroide de los píxeles con nanobots del cuadro recién dibujado (de a `paso` píxeles: es del banco, no del producto). */
let bufferDelCentroide = new Uint8Array(0)
function centrar(gl: WebGLRenderingContext | WebGL2RenderingContext, dpr: number, ancho: number, alto: number, paso = 3): { readonly x: number; readonly y: number; readonly n: number } {
  // Un búfer reusado: uno nuevo por cuadro (11 MB a 1440) le daba al recolector pausas de medio segundo que el banco leía como saltos.
  if (bufferDelCentroide.length !== ancho * alto * 4) bufferDelCentroide = new Uint8Array(ancho * alto * 4)
  const pixeles = bufferDelCentroide
  gl.readPixels(0, 0, ancho, alto, gl.RGBA, gl.UNSIGNED_BYTE, pixeles)
  let [sx, sy, n] = [0, 0, 0]
  for (let y = 0; y < alto; y += paso)
    for (let x = 0; x < ancho; x += paso) {
      if (pixeles[(y * ancho + x) * 4 + 3] <= 8) continue
      sx += x
      sy += alto - 1 - y
      n += 1
    }
  return n === 0 ? { x: 0, y: 0, n } : { x: sx / n / dpr, y: sy / n / dpr, n }
}

/** El índice del modo del aro en el sombreador (`uModoDelAro`). */
export const indiceDelModoDelAro = (modo: ModoDelAro): number => MODOS_DEL_ARO.indexOf(modo)

/** El enjambre de B4 sobre su lienzo: si el navegador no da WebGL, tira (y la sección sigue sin nanobots). [L3] `modoDelAro`: `?aro-color=`. */
export function crearEnjambreDeServicios(lienzo: HTMLCanvasElement, puntos: number, modoDelAro: ModoDelAro = 'ola'): EnjambreDeServicios {
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
    uProporcion: { value: Number(PROPORCION_DE_LA_ORBITA) },
    uModoDelAro: { value: indiceDelModoDelAro(modoDelAro) },
    uColoresDelAro: { value: [ACENTOS_DEL_ARO.web, ACENTOS_DEL_ARO.software, ACENTOS_DEL_ARO.ia].map(enSrgb) },
  }
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTICE_DE_SERVICIOS, fragmentShader: FRAGMENTO_DE_SERVICIOS, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true })
  const nanobots = new THREE.Points(geometria, material)
  nanobots.frustumCulled = false
  const escena = new THREE.Scene()
  escena.add(nanobots)
  const camara = new THREE.Camera()
  const tamano = { ancho: 1, alto: 1 }
  let lugares: readonly LugarDelEnjambre[] = []
  const reubicar = (): void => {
    lugares.forEach((l, k) => uniforms.uLugares.value[k]?.set((l.x / tamano.ancho) * 2 - 1, 1 - (l.y / tamano.alto) * 2, (l.unidad / tamano.alto) * 2, 0))
    uniforms.uProporcion.value = lugares[0]?.proporcion ?? PROPORCION_DE_LA_ORBITA
  }
  const diagnostico: DiagnosticoDelEnjambre = { cajas: null, registrar: null, medirElCentroide: false, centroide: null }
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
      if (diagnostico.medirElCentroide) diagnostico.centroide = centrar(renderer.getContext(), renderer.getPixelRatio(), lienzo.width, lienzo.height)
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
