import * as THREE from 'three'

import { DIBUJO, TEXTOS_GLSL } from '../energia/dibujo/comun'
import { RUIDO_GLSL } from '../energia/ruido'
import { TEXTO_EN_PANTALLA } from '../energia/textoEnPantalla'
import { COLOR_DE_LA_ESCENA_GLSL, PASE_EN_VIVO, PROFUNDIDAD_GLSL } from '../pase/pase'
import { CRISTAL, facetasAlrededor } from './cristal'

/**
 * [PULIDO 19] Q3 · EL VIDRIO FACETADO (`cristal.ts`: lo puro; `docs/rediseno/DIMENSION-ESPEJO.md`, «El cristal de fondo»): una pasada de
 * pantalla entera que, en cada píxel que es fondo, encuentra el punto del cilindro del cristal que ese rayo cruza, su FACETA (celdas de
 * Voronoi en las coordenadas del cilindro: alrededor y en alto, con la distancia exacta a su borde), su NORMAL (la del cilindro,
 * inclinada por faceta y girada hacia el borde en el bisel), REFRACTA el rayo de la vista por la ley de Snell y lee la copia del cuadro
 * donde ese rayo transmitido cae a `fondo` u detrás del vidrio (la transmisión barata en espacio de pantalla, una sola copia
 * compartida), le suma el Fresnel (Schlick), un brillo especular en los biseles (la luz de la sala y la cámara: se mueve con las dos)
 * y un reflejo tenue del entorno. Las facetas viven en la cúpula (al mover la cámara quedan donde están), se reacomodan muy lento (las
 * semillas derivan, las celdas crecen en alto) y los bordes se suavizan con `fwidth`: sin parpadeo ni temblor. Lo que no es fondo (el
 * logo, el piso cercano, las piezas, los títulos) no se toca ni se lee; sobre un texto, apenas. De día tinta en la talla y luz en el
 * bisel; de noche, luz. Con el prisma (`?espejo-prisma=si`), una dispersión mínima.
 */
export const VERTICES_DEL_CRISTAL = /* glsl */ `
void main() {
	gl_Position = vec4( position.xy, 0.0, 1.0 );
}
`

export const FRAGMENTOS_DEL_CRISTAL = /* glsl */ `
uniform vec2 uResolucion;
uniform float uPixel;
uniform float uTiempo;
uniform float uNoche;
uniform float uAmplitud;
uniform float uPrisma;
uniform vec3 uCamara;
uniform vec3 uAdelante;
uniform vec3 uLuz;
uniform mat4 uInversa;
uniform mat4 uProyeccion;
uniform vec4 uCilindro;
uniform vec4 uFaceta;
uniform vec4 uVidrio;
uniform vec4 uBrillo;
uniform vec4 uDeriva;
uniform vec2 uTalla;
uniform float uTopePx;
${PROFUNDIDAD_GLSL}
${COLOR_DE_LA_ESCENA_GLSL}
${TEXTOS_GLSL}
${RUIDO_GLSL}
// El punto del cilindro que cruza el rayo (la cámara está adentro: la raíz positiva); −1 si no lo cruza.
float hastaElCilindro( vec3 o, vec3 d, float radio ) {
	float a = dot( d.xz, d.xz );
	if ( a < 1e-6 ) return - 1.0;
	float b = 2.0 * dot( o.xz, d.xz );
	float c = dot( o.xz, o.xz ) - radio * radio;
	float disc = b * b - 4.0 * a * c;
	if ( disc < 0.0 ) return - 1.0;
	return ( - b + sqrt( disc ) ) / ( 2.0 * a );
}
// La semilla de una celda (alrededor, en alto): su centro, derivando muy lento.
vec2 semillaDeLaCelda( ivec2 c, float cuantas ) {
	int ca = int( mod( float( c.x ), cuantas ) );
	uint id = uint( ca + 4096 ) * 73856093u ^ uint( c.y + 4096 ) * 19349663u;
	float fase = azar01( id, 51u ) * 6.2831853;
	float w = 6.2831853 * uTiempo / uDeriva.x;
	vec2 base = vec2( azar01( id, 52u ), azar01( id, 53u ) ) * 0.6 + 0.2;
	return vec2( c ) + base + uDeriva.y * 0.5 * vec2( sin( w + fase ), cos( w * 0.73 + fase * 1.9 ) );
}
uint idDeLaCelda( ivec2 c, float cuantas ) {
	int ca = int( mod( float( c.x ), cuantas ) );
	return uint( ca + 4096 ) * 2654435761u ^ uint( c.y + 4096 ) * 2246822519u;
}
// La copia del cuadro en «desde» si es fondo (más lejos que el vidrio); si no, lo de acá.
vec3 leerDetras( vec2 aqui, vec2 desde, float dVidrio ) {
	float fondo = smoothstep( dVidrio - 2.0, dVidrio + 2.0, distanciaALoOpaco( desde ) );
	return colorDeAtras( mix( aqui, desde, fondo ) );
}
vec2 enPantalla( vec3 p ) {
	vec4 c = uProyeccion * vec4( p, 1.0 );
	return c.xy / max( 1e-4, c.w ) * 0.5 + 0.5;
}
void main() {
	vec2 uv = gl_FragCoord.xy / uResolucion;
	if ( uAmplitud < 0.002 || uHayColor < 0.5 ) discard;
	// El rayo de la vista por este píxel y dónde cruza el vidrio.
	vec4 lejos = uInversa * vec4( uv * 2.0 - 1.0, 1.0, 1.0 );
	vec3 dir = normalize( lejos.xyz / lejos.w - uCamara );
	float t = hastaElCilindro( uCamara, dir, uCilindro.x );
	if ( t <= 0.0 ) discard;
	vec3 P = uCamara + dir * t;
	if ( P.y < uCilindro.y || P.y > uCilindro.z ) discard;
	float dVidrio = dot( P - uCamara, uAdelante );
	// Sólo el fondo: lo opaco más lejos que el vidrio (el piso lejano se ve a través; el cercano, el logo y las piezas, no).
	float fondo = smoothstep( dVidrio - 1.5, dVidrio + 1.5, distanciaALoOpaco( uv ) );
	float texto = adentroDelTexto( uv * 2.0 - 1.0 );
	float amp = uAmplitud * fondo;
	if ( amp < 0.002 ) discard;
	// Las coordenadas de la faceta: alrededor (el arco) y en alto; las celdas justas alrededor (sin costura) y que crecen en alto.
	float fi = atan( P.z, P.x );
	float cuantas = uCilindro.w;
	float ladoAlrededor = 6.2831853 * uCilindro.x / cuantas;
	float ladoAlto = uFaceta.w * ( 1.0 + uDeriva.w * sin( 6.2831853 * uTiempo / uDeriva.z ) );
	vec2 q = vec2( ( fi + 3.14159265 ) / 6.2831853 * cuantas, ( P.y - uCilindro.y ) / ladoAlto );
	ivec2 base = ivec2( floor( q ) );
	// La celda más cercana (3 × 3) y la distancia exacta a su borde (las bisectrices, 5 × 5): en unidades de celda.
	float mejor = 8.0;
	ivec2 mc = base;
	vec2 mr = vec2( 0.0 );
	for ( int j = - 1; j <= 1; j ++ ) for ( int i = - 1; i <= 1; i ++ ) {
		ivec2 g = base + ivec2( i, j );
		vec2 r = semillaDeLaCelda( g, cuantas ) - q;
		float d = dot( r, r );
		if ( d < mejor ) {
			mejor = d;
			mr = r;
			mc = g;
		}
	}
	float borde = 8.0;
	vec2 haciaElBorde = vec2( 1.0, 0.0 );
	for ( int j = - 2; j <= 2; j ++ ) for ( int i = - 2; i <= 2; i ++ ) {
		ivec2 g = mc + ivec2( i, j );
		if ( g == mc ) continue;
		vec2 r = semillaDeLaCelda( g, cuantas ) - q;
		vec2 entre = r - mr;
		float largo = length( entre );
		if ( largo > 1e-5 ) {
			float d = dot( 0.5 * ( mr + r ), entre / largo );
			if ( d < borde ) {
				borde = d;
				haciaElBorde = entre / largo;
			}
		}
	}
	// A unidades del mundo (la celda no es cuadrada: el borde en u es el menor de los dos).
	float bordeU = borde * min( ladoAlrededor, ladoAlto );
	// La normal: la del cilindro hacia adentro, inclinada por faceta, y girada hacia el borde en el bisel (suave y antialiasada).
	vec3 n0 = - vec3( P.x, 0.0, P.z ) / uCilindro.x;
	vec3 tAlrededor = vec3( - sin( fi ), 0.0, cos( fi ) );
	vec3 tAlto = vec3( 0.0, 1.0, 0.0 );
	uint id = idDeLaCelda( mc, cuantas );
	vec2 inclina = ( vec2( azar01( id, 54u ), azar01( id, 55u ) ) * 2.0 - 1.0 ) * uFaceta.x;
	vec3 n = normalize( n0 + tAlrededor * inclina.x + tAlto * inclina.y );
	float anchoAA = max( uFaceta.y, 1.5 * fwidth( bordeU ) );
	float enElBisel = 1.0 - smoothstep( 0.0, anchoAA, bordeU );
	enElBisel = enElBisel * enElBisel;
	vec3 haciaElBorde3 = normalize( tAlrededor * haciaElBorde.x + tAlto * haciaElBorde.y );
	float giro = uFaceta.z * enElBisel;
	n = normalize( n * cos( giro ) + haciaElBorde3 * sin( giro ) );
	// La refracción (Snell) y dónde cae el rayo transmitido a «fondo» u detrás: ahí se lee la copia (con el tope, sin saltos).
	float sobreTexto = 1.0 - uTalla.y * texto;
	vec2 pantalla0 = enPantalla( P + dir * uVidrio.y );
	vec3 color;
	if ( uPrisma >= 0.5 ) {
		vec3 rr = refract( dir, n, 1.0 / ( uVidrio.x - uVidrio.z ) );
		vec3 rg = refract( dir, n, 1.0 / uVidrio.x );
		vec3 rb = refract( dir, n, 1.0 / ( uVidrio.x + uVidrio.z ) );
		vec2 dr = ( enPantalla( P + rr * uVidrio.y ) - pantalla0 ) * sobreTexto;
		vec2 dg = ( enPantalla( P + rg * uVidrio.y ) - pantalla0 ) * sobreTexto;
		vec2 db = ( enPantalla( P + rb * uVidrio.y ) - pantalla0 ) * sobreTexto;
		float tope = uTopePx * uPixel / uResolucion.y;
		dr *= min( 1.0, tope / max( 1e-5, length( dr ) ) );
		dg *= min( 1.0, tope / max( 1e-5, length( dg ) ) );
		db *= min( 1.0, tope / max( 1e-5, length( db ) ) );
		color = vec3( leerDetras( uv, uv + dr, dVidrio ).r, leerDetras( uv, uv + dg, dVidrio ).g, leerDetras( uv, uv + db, dVidrio ).b );
	} else {
		vec3 r = refract( dir, n, 1.0 / uVidrio.x );
		vec2 d = ( enPantalla( P + r * uVidrio.y ) - pantalla0 ) * sobreTexto;
		float tope = uTopePx * uPixel / uResolucion.y;
		d *= min( 1.0, tope / max( 1e-5, length( d ) ) );
		color = leerDetras( uv, uv + d, dVidrio );
	}
	// El Fresnel (Schlick), el brillo especular (la luz de la sala y la cámara) y el reflejo tenue del entorno (el cielo por la altura).
	float cosV = max( 0.0, dot( - dir, n ) );
	float fresnel = uVidrio.w + ( 1.0 - uVidrio.w ) * pow( 1.0 - cosV, 5.0 );
	vec3 h = normalize( uLuz - dir );
	float especular = pow( max( 0.0, dot( n, h ) ), uBrillo.z ) * mix( uBrillo.x, uBrillo.y, uNoche ) * ( 0.35 + 0.65 * fresnel + 0.5 * enElBisel );
	vec3 refl = reflect( dir, n );
	vec3 cieloDia = mix( vec3( 0.80, 0.80, 0.78 ), vec3( 0.97, 0.97, 0.96 ), refl.y * 0.5 + 0.5 );
	vec3 cieloNoche = mix( vec3( 0.015 ), vec3( 0.07, 0.07, 0.08 ), refl.y * 0.5 + 0.5 );
	vec3 cielo = mix( cieloDia, cieloNoche, uNoche );
	color = mix( color, cielo, fresnel * uBrillo.w );
	// De día, la talla: el bisel oscurece apenas (sin eso el vidrio no se lee sobre el papel); de noche, el bisel toma la luz.
	color *= 1.0 - uTalla.x * enElBisel * ( 1.0 - uNoche );
	color += vec3( especular ) * sobreTexto;
	float alfa = amp;
	gl_FragColor = vec4( color * alfa, alfa );
}
`

const CUADRADO = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0])

export function uniformesDelCristal() {
  const c = CRISTAL
  const f = facetasAlrededor()
  return {
    uResolucion: { value: new THREE.Vector2(1, 1) },
    uPixel: { value: 1 },
    uTiempo: { value: 0 },
    uNoche: { value: 0 },
    uAmplitud: { value: 0 },
    uPrisma: { value: 0 },
    uCamara: { value: new THREE.Vector3() },
    uAdelante: { value: new THREE.Vector3(0, 0, -1) },
    uLuz: { value: new THREE.Vector3(0, 1, 0) },
    uInversa: { value: new THREE.Matrix4() },
    uProyeccion: { value: new THREE.Matrix4() },
    uCilindro: { value: new THREE.Vector4(c.radio, c.abajo, c.arriba, f.cuantas) },
    uFaceta: { value: new THREE.Vector4(c.faceta.inclinacion, c.faceta.bisel, c.faceta.biselGiro, c.faceta.lado) },
    uVidrio: { value: new THREE.Vector4(c.vidrio.indice, c.vidrio.fondo, c.vidrio.dispersion, c.vidrio.f0) },
    uBrillo: { value: new THREE.Vector4(c.luz.especular[0], c.luz.especular[1], c.luz.dureza, 1) },
    uDeriva: { value: new THREE.Vector4(c.deriva.periodoS, c.deriva.cuanto, c.deriva.crecePeriodoS, c.deriva.crece) },
    uTalla: { value: new THREE.Vector2(c.luz.talla, c.donde.sobreTexto) },
    uTopePx: { value: c.topePx },
    uTextos: { value: Array.from({ length: TEXTO_EN_PANTALLA.cajas }, () => new THREE.Vector4()) },
    uCuantosTextos: { value: 0 },
    uTextoBorde: { value: DIBUJO.textoBorde },
    uTextoFuerza: { value: 1 },
    ...PASE_EN_VIVO,
  }
}
export type UniformesDelCristal = ReturnType<typeof uniformesDelCristal>

/** Desde dónde del ORDEN de los transparentes se dibuja: después de la copia del cuadro (−18) y antes del espejo (−14) y la energía (−10). */
export const ORDEN_DEL_CRISTAL = -16

/** La pasada de pantalla entera del cristal: transparente, premultiplicada, sin profundidad (lo que es fondo lo decide el pase). */
export function armarElCristal(uniformes: UniformesDelCristal): THREE.Mesh {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(CUADRADO, 3))
  g.setIndex([0, 1, 2, 2, 1, 3])
  const material = new THREE.ShaderMaterial({ vertexShader: VERTICES_DEL_CRISTAL, fragmentShader: FRAGMENTOS_DEL_CRISTAL, uniforms: uniformes, transparent: true, depthWrite: false, depthTest: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor })
  const malla = new THREE.Mesh(g, material)
  malla.name = 'cristal'
  malla.frustumCulled = false
  malla.renderOrder = ORDEN_DEL_CRISTAL
  return malla
}

/** El reflejo tenue del entorno se apaga con `uBrillo.w` (el banco lo mide por diferencia). */
export const REFLEJO_DEL_CRISTAL = { dia: CRISTAL.luz.reflejo[0], noche: CRISTAL.luz.reflejo[1] } as const

const LUZ = new THREE.Vector3()

/** Lo que el cuadro le escribe al cristal (un solo objeto, reescrito). */
export interface DelCuadroAlCristal {
  camara: THREE.Camera
  readonly resolucion: THREE.Vector2
  pixel: number
  tiempo: number
  noche: number
  amplitud: number
  /** La luz de la sala: su azimut (rad, el de la cámara más el corrimiento de la luz principal) y su elevación (rad). */
  luzAzimut: number
  luzElevacion: number
}

/** Un cuadro del cristal: las uniformes desde la cámara y la escena. */
export function cuadroDelCristal(u: UniformesDelCristal, f: DelCuadroAlCristal): void {
  const cam = f.camara
  u.uResolucion.value.copy(f.resolucion)
  u.uPixel.value = f.pixel
  u.uTiempo.value = f.tiempo
  u.uNoche.value = f.noche
  u.uAmplitud.value = f.amplitud
  u.uCamara.value.copy(cam.position)
  cam.getWorldDirection(u.uAdelante.value)
  u.uInversa.value.multiplyMatrices(cam.matrixWorld, cam.projectionMatrixInverse)
  u.uProyeccion.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)
  LUZ.set(Math.cos(f.luzElevacion) * Math.sin(f.luzAzimut), Math.sin(f.luzElevacion), Math.cos(f.luzElevacion) * Math.cos(f.luzAzimut))
  u.uLuz.value.copy(LUZ)
  u.uBrillo.value.w = f.noche > 0.5 ? CRISTAL.luz.reflejo[1] : CRISTAL.luz.reflejo[0] + (CRISTAL.luz.reflejo[1] - CRISTAL.luz.reflejo[0]) * f.noche
}
