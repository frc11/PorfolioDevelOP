import { AL_TONO, COMUN, PALETA_GLSL, SALIDA, f } from './comun'

/**
 * [PULIDO 16] N2 · EL SOMBREADOR DE LAS PARTÍCULAS (`docs/rediseno/PLASMA.md`), instanciado: un cuadrado por partícula.
 *   · ÁTOMO: un núcleo (de día, una esfera de grafito con un borde especular fino y claro del lado de la luz; de noche, luz) y, DE
 *     CERCA, sus electrones girando en una elipse inclinada (el LOD: con el núcleo de más de ~3 px se ven; de lejos, un punto con
 *     halo; entre los dos, un fundido, sin corte).
 *   · ION: el núcleo con un halo más grande y más caliente (se enfría solo), sin órbita.
 *   · ELECTRÓN: chico, con una ESTELA alineada a su velocidad en la pantalla (la del que sale disparado, larga).
 * PROFUNDIDAD DE CAMPO barata: lo que está lejos del foco (el logo) se ve más blando y más tenue. LA LUZ de los arcos: lo cercano
 * a un arco se enciende un instante (de noche suma luz; de día le prende el borde). De día, además, un anillo del papel alrededor:
 * sobre el papel no se ve; sobre el logo negro, lo separa. Sobre un texto se apagan.
 */
export const PARTICULAS = {
  /** El radio del núcleo en el mundo (u, del más chico al más grande) y el del electrón; sus topes en px. */
  radio: [0.045, 0.095],
  radioDelElectron: 0.028,
  px: [1.3, 8],
  /** Hasta dónde llega el cuadrado (en radios del núcleo): el halo del átomo, con sus órbitas, el del ion y el del electrón. */
  halo: 3.2,
  conOrbitas: 3.5,
  haloDelIon: 4.6,
  haloDelElectron: 2.4,
  /** El LOD: desde qué radio en px empiezan a verse las órbitas y desde cuál se ven enteras. */
  lod: [2.2, 3.8],
  /** La órbita (en radios del núcleo): su semieje, el radio de sus electrones y cuánto giran (rad/s). */
  orbita: { semieje: 2.55, electron: 0.42, giro: 3.1 },
  /** La estela del electrón: cuánto tiempo de recorrido muestra (s) y su largo máximo (px). */
  estela: { s: 0.075, maximoPx: 70 },
  /** La profundidad de campo: desde qué distancia al foco (u) se ablanda y desde cuál del todo. */
  foco: [3.5, 14],
} as const

const P = PARTICULAS

export const VERTICES_DE_LAS_PARTICULAS = /* glsl */ `
attribute vec3 aLugar;
attribute vec3 aVelocidad;
attribute vec4 aDatos;
attribute vec4 aOrbita;
attribute float aCalor;
uniform float uFoco;
varying vec2 vLocal;
varying float vEspecie;
varying float vAlfa;
varying float vBrillo;
varying float vCalor;
varying float vLod;
varying float vBlur;
varying float vRadioPx;
varying float vEstela;
varying float vLuz;
varying float vTexto;
varying vec4 vOrbita;
${COMUN}
void main() {
	vec3 mundo = uCentro + aLugar;
	vec4 mv = viewMatrix * vec4( mundo, 1.0 );
	float distancia = max( 0.5, - mv.z );
	float especie = aDatos.x;
	float electron = step( 2.5, especie );
	float ion = step( 1.5, especie ) * ( 1.0 - electron );
	float radioMundo = mix( mix( ${f(P.radio[0])}, ${f(P.radio[1])}, aDatos.y ), ${f(P.radioDelElectron)}, electron );
	float radioPx = clamp( uEscalaPx * radioMundo / distancia, ${f(P.px[0])} * uPixel, ${f(P.px[1])} * uPixel );
	float blur = smoothstep( ${f(P.foco[0])}, ${f(P.foco[1])}, abs( distancia - uFoco ) );
	float lod = ( 1.0 - electron ) * ( 1.0 - ion ) * smoothstep( ${f(P.lod[0])} * uPixel, ${f(P.lod[1])} * uPixel, radioPx ) * ( 1.0 - 0.8 * blur );
	vec4 clip = projectionMatrix * mv;
	vTexto = adentroDelTexto( clip.xy / clip.w );
	vLuz = luzDeLosArcos( aLugar );
	vec2 mitad = uResolucion * 0.5;
	if ( electron > 0.5 ) {
		// La estela: de donde estaba hace un rato a donde está, en la pantalla.
		vec4 antes = projectionMatrix * viewMatrix * vec4( mundo - aVelocidad * ${f(P.estela.s)}, 1.0 );
		vec2 d = ( clip.xy / clip.w - antes.xy / max( antes.w, 0.05 ) ) * mitad;
		float largo = min( length( d ), ${f(P.estela.maximoPx)} * uPixel );
		vec2 dir = largo > 0.5 ? normalize( d ) : vec2( 1.0, 0.0 );
		vec2 normal = vec2( - dir.y, dir.x );
		float r = radioPx * ${f(P.haloDelElectron)} * ( 1.0 + 0.6 * blur );
		float a = position.x < 0.0 ? - ( largo + r ) : r;
		clip.xy += ( dir * a + normal * position.y * r ) / mitad * clip.w;
		vLocal = vec2( a, position.y * r ) / radioPx;
		vEstela = largo / radioPx;
	} else {
		float extension = mix( mix( ${f(P.halo)}, ${f(P.conOrbitas)}, lod ), ${f(P.haloDelIon)}, ion ) * ( 1.0 + 0.6 * blur );
		clip.xy += position.xy * radioPx * extension / mitad * clip.w;
		vLocal = position.xy * extension;
		vEstela = 0.0;
	}
	gl_Position = clip;
	vEspecie = especie;
	vAlfa = aDatos.z;
	vBrillo = aDatos.w;
	vCalor = aCalor;
	vLod = lod;
	vBlur = blur;
	vRadioPx = radioPx;
	vOrbita = aOrbita;
}
`

export const FRAGMENTOS_DE_LAS_PARTICULAS = /* glsl */ `
varying vec2 vLocal;
varying float vEspecie;
varying float vAlfa;
varying float vBrillo;
varying float vCalor;
varying float vLod;
varying float vBlur;
varying float vRadioPx;
varying float vEstela;
varying float vLuz;
varying float vTexto;
varying vec4 vOrbita;
${COMUN}
${PALETA_GLSL}
${AL_TONO}
const vec3 LUZ_DIA = vec3( -0.4417, 0.5399, 0.7165 );
// Una capa sobre lo acumulado (de día: los objetos se tapan entre sí).
void sobre( inout vec4 acum, vec3 c, float a ) {
	acum.rgb = c * a + acum.rgb * ( 1.0 - a );
	acum.a = a + acum.a * ( 1.0 - a );
}
void main() {
	float px = ( 1.0 + 4.0 * vBlur ) / max( 1.0, vRadioPx );
	float luz = min( 1.6, vLuz );
	float brillo = vBrillo;
	vec4 dia = vec4( 0.0 );
	vec3 luzNoche = vec3( 0.0 );
	if ( vEspecie > 2.5 ) {
		// EL ELECTRÓN: la distancia al segmento de la cola a la cabeza; se apaga hacia la cola.
		float sx = clamp( vLocal.x, - vEstela, 0.0 );
		float d = length( vec2( vLocal.x - sx, vLocal.y ) );
		float t = vEstela > 1e-3 ? - sx / vEstela : 0.0;
		float cola = 1.0 - t;
		float cuerpo = ( 1.0 - smoothstep( 1.0 - px, 1.0 + px, d ) ) * cola * cola;
		float halo = exp( - d * d * 0.8 ) * cola;
		sobre( dia, uHaloDia, halo * 0.45 );
		sobre( dia, mix( uNucleoDia, uBordeDia, 0.25 * ( 1.0 - t ) + 0.4 * luz ), cuerpo );
		luzNoche = uNucleoNoche * cuerpo * ( 1.6 + brillo + luz ) + uHaloNoche * halo * ( 0.45 + 0.3 * luz );
	} else {
		float r = length( vLocal );
		float ion = step( 1.5, vEspecie );
		// EL NÚCLEO: una esfera chica, sombreada.
		float nucleo = 1.0 - smoothstep( 1.0 - px, 1.0 + px, r );
		vec2 n2 = r > 1e-3 ? vLocal / r : vec2( 0.0 );
		float nz = sqrt( max( 0.0, 1.0 - r * r ) );
		vec3 N = vec3( vLocal, nz );
		float lambert = 0.42 + 0.58 * max( 0.0, dot( N, LUZ_DIA ) );
		float borde = smoothstep( 0.55, 0.9, r ) * ( 1.0 - smoothstep( 0.9, 1.0 + px, r ) ) * smoothstep( -0.25, 0.75, dot( n2, LUZ_DIA.xy ) );
		vec2 hacia = vLocal - LUZ_DIA.xy * 0.42;
		float brillito = exp( - dot( hacia, hacia ) / 0.05 );
		vec3 grafito = mix( uNucleoDia * lambert, uBordeDia, min( 1.0, borde * ( 0.9 + luz ) + brillito * 0.75 + 0.25 * brillo ) );
		// EL HALO: de día un anillo del papel (lo separa del logo negro); de noche, luz (el ion: más grande y más caliente).
		float calor = ion * ( 0.5 + vCalor );
		float anilloDia = exp( - pow( ( r - mix( 1.3, 1.6, ion ) ) / mix( 0.32, 0.6, ion ), 2.0 ) ) * mix( 0.4, 0.55, ion );
		float halo = exp( - r * r * mix( 0.5, 0.2, ion ) ) * ( mix( 0.3, 0.42, ion ) + 0.4 * brillo + 0.35 * luz ) * ( 1.0 + calor );
		// LAS ÓRBITAS (de cerca): una elipse inclinada y sus electrones, que giran.
		float orbitas = 0.0;
		float camino = 0.0;
		if ( vLod > 0.01 ) {
			float c = cos( vOrbita.y );
			float s = sin( vOrbita.y );
			vec2 q = vec2( c * vLocal.x + s * vLocal.y, - s * vLocal.x + c * vLocal.y );
			float rx = ${f(P.orbita.semieje)};
			float ry = ${f(P.orbita.semieje)} * vOrbita.z;
			float e = length( vec2( q.x / rx, q.y / ry ) );
			camino = exp( - pow( ( e - 1.0 ) * ry / ( 0.09 + 1.5 * px ), 2.0 ) ) * 0.24;
			for ( int k = 0; k < 2; k ++ ) {
				if ( float( k ) >= vOrbita.x ) break;
				float fi = vOrbita.w + uTiempo * ${f(P.orbita.giro)} * ( 1.0 + 0.27 * float( k ) ) + float( k ) * 3.14159;
				float dd = length( q - vec2( cos( fi ) * rx, sin( fi ) * ry ) );
				orbitas += 1.0 - smoothstep( ${f(P.orbita.electron)} - px, ${f(P.orbita.electron)} + px, dd );
			}
			orbitas = min( 1.0, orbitas ) * vLod;
			camino *= vLod;
		}
		sobre( dia, uHaloDia, anilloDia * ( 1.0 - nucleo ) );
		sobre( dia, uNucleoDia, camino );
		sobre( dia, grafito, nucleo );
		sobre( dia, mix( uNucleoDia, uBordeDia, 0.3 + 0.5 * luz ), orbitas );
		vec3 nucleoNoche = uNucleoNoche * ( 1.25 + 1.4 * brillo + luz ) * ( 0.6 + 0.4 * nz );
		vec3 haloNoche = mix( uHaloNoche, uCalienteNoche, min( 1.0, calor ) );
		luzNoche = nucleoNoche * nucleo + haloNoche * halo * ( 1.0 - nucleo ) + uNucleoNoche * ( orbitas * 1.3 + camino * 0.6 );
	}
	vec3 colorDia = dia.a > 1e-4 ? dia.rgb / dia.a : vec3( 0.0 );
	float aDia = dia.a;
	// Los fundidos, el desenfoque (más tenue), los textos (pasan por detrás) y el final (se apagan con la cámara que sube).
	float vis = vAlfa * ( 1.0 - 0.7 * vBlur ) * ( 1.0 - ${f(0.95)} * vTexto ) * ( 1.0 - uApagado );
	${SALIDA}
}
`
