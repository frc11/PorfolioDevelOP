import * as THREE from 'three'

import { PROFUNDIDAD_GLSL } from '../../pase/pase'
import { AL_TONO, COMUN, SALIDA, f } from './comun'

/**
 * [PULIDO 17] O3 · LOS ARCOS, UN CANAL DE LUZ (`docs/rediseno/PLASMA.md`): una tira continua por camino (`arcos/cinta.ts`) que el
 * sombreador abre en la pantalla a los dos lados de cada punto, con la unión en inglete (el ancho en px de la pantalla: un canal fino
 * se ve fino lejos y cerca). El canal tiene tres capas gaussianas: el NÚCLEO fino de cada golpe, su HALO y el RESPLANDOR residual
 * (más ancho y tenue: lo que queda entre golpe y golpe). Menos dibujado que un trazo: las puntas se afinan hasta casi nada, la luz
 * CORRE por el canal (una ondulación del brillo a lo largo que se mueve) y las ramas son más tenues. De día, el halo es energía
 * oscura (grafito muy translúcido y ancho: el marco que deja ver el núcleo) y el núcleo, más blanco que el papel (o tinta, con
 * `uArcoDia.w`): en DOS PASADAS (`uCapa`): primero lo oscuro, después los núcleos. De noche suman. Sobre un texto, nada.
 */
export const TRAZO = {
  /** El medio ancho del canal (px de CSS, por el ancho de su clase), el del núcleo (px), cuánto corre la luz y cuánto se afinan las puntas. */
  uArcoForma: [11, 0.85, 0.3, 1],
  /**
   * De día: cuánto tapa el halo oscuro, el resplandor oscuro, el núcleo y su color (0 blanco, 1 tinta). [PULIDO 18] P1.c · el núcleo de
   * tinta y el halo tenue: con el núcleo blanco (invisible sobre el papel) quedaba una banda de humo gris; ahora, un rayo de tinta.
   */
  uArcoDia: [0.08, 0.04, 0.95, 1],
  /** De noche: la luz del halo, la del resplandor y la del núcleo. */
  uArcoNoche: [0.16, 0.18, 1.7, 0],
} as const

/** [PULIDO 18] P1.a · en cuánto se desvanece el canal contra lo opaco (u): corto (donde toca el logo, casi hasta el borde). */
export const ARCO_BLANDO = 0.15

export type NombreDelTrazo = keyof typeof TRAZO

export function uniformesDelTrazo(): Record<NombreDelTrazo, { value: THREE.Vector4 }> {
  const v = (n: NombreDelTrazo): { value: THREE.Vector4 } => ({ value: new THREE.Vector4(TRAZO[n][0], TRAZO[n][1], TRAZO[n][2], TRAZO[n][3]) })
  return { uArcoForma: v('uArcoForma'), uArcoDia: v('uArcoDia'), uArcoNoche: v('uArcoNoche') }
}

export const TRAZO_GLSL = /* glsl */ `
uniform vec4 uArcoForma;
uniform vec4 uArcoDia;
uniform vec4 uArcoNoche;
uniform float uCapa;
`

/**
 * [PULIDO 21] S1 · el canal en la pantalla, como función: lo usan los arcos (con sus atributos) y la red en reposo (con los puntos que
 * arma su sombreador). Necesita `COMUN` y `TRAZO_GLSL` antes.
 */
export const CANAL_DEL_ARCO = /* glsl */ `
varying float vLado;
varying float vAncho;
varying float vGolpe;
varying float vResidual;
varying float vTexto;
varying float vLargo;
varying float vSemilla;
varying float vRama;
varying float vDistancia;
vec2 enPantalla( vec4 c ) {
	return c.xy / c.w * uResolucion * 0.5;
}
void canalDelArco( vec3 aPunto, vec3 aAntes, vec3 aDespues, vec4 aForma, vec4 aExtra ) {
	vec4 c = projectionMatrix * viewMatrix * vec4( aPunto, 1.0 );
	vec4 cA = projectionMatrix * viewMatrix * vec4( aAntes, 1.0 );
	vec4 cD = projectionMatrix * viewMatrix * vec4( aDespues, 1.0 );
	vLado = aForma.x;
	vGolpe = aForma.z;
	vResidual = aForma.w;
	vLargo = aExtra.x;
	vSemilla = aExtra.y;
	vRama = aExtra.z;
	vTexto = 0.0;
	vAncho = 1.0;
	vDistancia = c.w;
	if ( aForma.y <= 0.0 || c.w <= 0.05 || cA.w <= 0.05 || cD.w <= 0.05 ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		return;
	}
	vec2 s = enPantalla( c );
	vec2 a = enPantalla( cA );
	vec2 d = enPantalla( cD );
	// La tangente: el promedio de los dos tramos (o el que hay, en las puntas); el inglete, con tope (sin picos en los quiebres).
	vec2 t1 = s - a;
	vec2 t2 = d - s;
	t1 = length( t1 ) > 1e-3 ? normalize( t1 ) : vec2( 0.0 );
	t2 = length( t2 ) > 1e-3 ? normalize( t2 ) : vec2( 0.0 );
	vec2 t = t1 + t2;
	t = length( t ) > 1e-3 ? normalize( t ) : ( length( t1 ) > 0.0 ? t1 : vec2( 1.0, 0.0 ) );
	vec2 normal = vec2( - t.y, t.x );
	vec2 n1 = length( t1 ) > 0.0 ? vec2( - t1.y, t1.x ) : normal;
	// [PULIDO 18] P1.d · el inglete, con un tope bajo: en un quiebre cerrado el halo ancho se plegaba en esquirlas blancas (de cerca).
	float inglete = 1.0 / max( 0.85, dot( normal, n1 ) );
	// Las puntas se afinan (el canal hacia sus dos puntas; cada rama hacia la suya).
	float afina = vRama > 0.5 ? mix( 1.0, 0.15, vLargo ) : 0.12 + 0.88 * smoothstep( 0.0, 0.16, vLargo ) * smoothstep( 1.0, 0.84, vLargo );
	afina = mix( 1.0, afina, uArcoForma.w );
	float medio = ( uCapa < 0.5 ? uArcoForma.x * aForma.y : uArcoForma.y * 3.0 * max( 0.6, aForma.y ) ) * uPixel * afina;
	vAncho = medio;
	vTexto = adentroDelTexto( c.xy / c.w );
	gl_Position = vec4( ( s + normal * vLado * medio * inglete ) / ( uResolucion * 0.5 ) * c.w, c.z, c.w );
}
`

export const VERTICES_DE_LOS_ARCOS = /* glsl */ `
attribute vec3 aPunto;
attribute vec3 aAntes;
attribute vec3 aDespues;
attribute vec4 aForma;
attribute vec4 aExtra;
${COMUN}
${TRAZO_GLSL}
${CANAL_DEL_ARCO}
void main() {
	canalDelArco( aPunto, aAntes, aDespues, aForma, aExtra );
}
`

/** [PULIDO 21] S1 · detrás de un texto: por vértice (los arcos, cortos) o, con `TEXTO_POR_PIXEL`, también por píxel (la red, enlaces largos). */
const TEXTO_DEL_ARCO = /* glsl */ `
float textoDelArco( float porVertice ) {
#ifdef TEXTO_POR_PIXEL
	return max( porVertice, adentroDelTexto( gl_FragCoord.xy / uResolucion * 2.0 - 1.0 ) );
#else
	return porVertice;
#endif
}
`

export const FRAGMENTOS_DE_LOS_ARCOS = /* glsl */ `
varying float vLado;
varying float vAncho;
varying float vGolpe;
varying float vResidual;
varying float vTexto;
varying float vLargo;
varying float vSemilla;
varying float vRama;
varying float vDistancia;
${COMUN}
${AL_TONO}
${TRAZO_GLSL}
${PROFUNDIDAD_GLSL}
${TEXTO_DEL_ARCO}
void main() {
	float x = abs( vLado ) * vAncho;
	// La luz que corre por el canal: una ondulación a lo largo que se mueve rápido (no un brillo parejo de trazo).
	float corre = 1.0 - uArcoForma.z + uArcoForma.z * ( 0.5 + 0.5 * sin( vLargo * 23.0 - uTiempo * 41.0 + vSemilla ) * sin( vLargo * 9.0 + uTiempo * 17.0 + vSemilla * 1.3 ) );
	float rama = vRama > 0.5 ? 0.6 : 1.0;
	float nucleo = exp( - pow( x / ( uArcoForma.y * uPixel ), 2.0 ) ) * vGolpe * corre * rama;
	// [PULIDO 18] P1.d · la luz que corre, sólo en el núcleo: en el halo ancho dibujaba rayas de través (una espina de pescado).
	float halo = exp( - pow( x / ( vAncho * 0.45 ), 2.0 ) ) * vGolpe * rama;
	float resplandor = exp( - pow( x / ( vAncho * 0.85 ), 2.0 ) ) * vResidual * rama;
	// La capa 0: la energía oscura (de día) y la luz del halo y del resplandor (de noche). La capa 1: el núcleo.
	float oscuro = min( 1.0, halo * uArcoDia.x + resplandor * uArcoDia.y );
	float blanco = min( 1.0, nucleo * uArcoDia.z );
	float aDia = uCapa < 0.5 ? oscuro : blanco;
	vec3 colorDia = uCapa < 0.5 ? uTintaDia : mix( uClaroDia, uTintaDia, uArcoDia.w );
	vec3 luzNoche = uCapa < 0.5 ? uLuzNoche * ( halo * uArcoNoche.x + resplandor * uArcoNoche.y ) : uLuzNoche * nucleo * uArcoNoche.z;
	// [PULIDO 18] P1.a · blando contra lo opaco en una distancia corta (ningún brillo corta una superficie).
	float blando = smoothstep( 0.0, ${f(ARCO_BLANDO)}, distanciaALoOpaco( gl_FragCoord.xy / uResolucion ) - vDistancia );
	float vis = ( 1.0 - ${f(0.95)} * textoDelArco( vTexto ) ) * ( 1.0 - uApagado ) * blando;
	${SALIDA}
}
`

/**
 * [PULIDO 18] P1.d · EL HALO DEL CANAL, CON PUNTOS (la pasada 0): un punto suave por punto del camino, del ancho del halo, aditivo de
 * noche y energía oscura de día; su peso, por lo que avanza hasta el siguiente punto en la pantalla (un tubo parejo, sin cuentas). Como
 * cinta, en un quiebre cerrado el halo ancho se plegaba en esquirlas blancas (visto de cerca); los puntos no se pliegan. El núcleo
 * sigue siendo la cinta fina (la pasada 1). Los mismos atributos de la cinta: sólo cuenta un lado (el otro no llega a dibujarse).
 */
export const HALO_DEL_ARCO = {
  /** El radio del punto (en medios anchos del canal) y hasta dónde llega (en radios). */
  radio: 0.55,
  llega: 2.6,
} as const

/** [PULIDO 21] S1 · el halo de un punto del canal, como función (los arcos y la red). Necesita `COMUN` y `TRAZO_GLSL` antes. */
export const HALO_DEL_CANAL = /* glsl */ `
varying float vGolpe;
varying float vResidual;
varying float vTexto;
varying float vPeso;
varying float vDistancia;
void haloDelArco( vec3 aPunto, vec3 aDespues, vec4 aForma, vec4 aExtra ) {
	vGolpe = aForma.z;
	vResidual = aForma.w;
	vTexto = 0.0;
	vPeso = 0.0;
	vDistancia = 0.0;
	// [PULIDO 18] El vértice del otro lado de la cinta (que el halo no usaba) va al medio del tramo: el doble de puntos, sin engordar el
	// halo (con el radio por el paso, una descarga larga y cercana quedaba como una columna blanca gruesa).
	vec3 punto = aForma.x < 0.0 ? mix( aPunto, aDespues, 0.5 ) : aPunto;
	vec4 c = projectionMatrix * viewMatrix * vec4( punto, 1.0 );
	vec4 cP = projectionMatrix * viewMatrix * vec4( aPunto, 1.0 );
	if ( aForma.y <= 0.0 || c.w <= 0.05 || cP.w <= 0.05 ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		gl_PointSize = 0.0;
		return;
	}
	vec4 cD = projectionMatrix * viewMatrix * vec4( aDespues, 1.0 );
	vec2 s = cP.xy / cP.w * uResolucion * 0.5;
	vec2 d = cD.w > 0.05 ? cD.xy / cD.w * uResolucion * 0.5 : s;
	float largo = aExtra.x;
	float rama = aExtra.z;
	float afina = rama > 0.5 ? mix( 1.0, 0.15, largo ) : 0.12 + 0.88 * smoothstep( 0.0, 0.16, largo ) * smoothstep( 1.0, 0.84, largo );
	afina = mix( 1.0, afina, uArcoForma.w );
	// El radio, al menos lo que hay hasta el punto que sigue (la mitad del tramo: hay uno en el medio): en un arco largo los puntos
	// quedaban separados (un collar de cuentas). Lo que crece por el paso no suma luz: más ancho, más tenue (base / radio).
	float paso = 0.5 * length( d - s );
	float base = max( 0.75, uArcoForma.x * aForma.y * uPixel * afina * ${f(HALO_DEL_ARCO.radio)} );
	float radio = max( base, 1.1 * paso * afina );
	vPeso = clamp( paso / ( 2.2 * radio ), 0.05, 0.85 ) * ( base / radio ) * ( rama > 0.5 ? 0.6 : 1.0 );
	gl_PointSize = 2.0 * radio * ${f(HALO_DEL_ARCO.llega)};
	gl_Position = c;
	vTexto = adentroDelTexto( c.xy / c.w );
	vDistancia = c.w;
}
`

export const VERTICES_DEL_HALO_DEL_ARCO = /* glsl */ `
attribute vec3 aPunto;
attribute vec3 aDespues;
attribute vec4 aForma;
attribute vec4 aExtra;
${COMUN}
${TRAZO_GLSL}
${HALO_DEL_CANAL}
void main() {
	haloDelArco( aPunto, aDespues, aForma, aExtra );
}
`

export const FRAGMENTOS_DEL_HALO_DEL_ARCO = /* glsl */ `
varying float vGolpe;
varying float vResidual;
varying float vTexto;
varying float vPeso;
varying float vDistancia;
${COMUN}
${AL_TONO}
${TRAZO_GLSL}
${PROFUNDIDAD_GLSL}
${TEXTO_DEL_ARCO}
void main() {
	vec2 q = ( gl_PointCoord - 0.5 ) * ${f(2 * HALO_DEL_ARCO.llega)};
	float r2 = dot( q, q );
	float borde = 1.0 - smoothstep( ${f((HALO_DEL_ARCO.llega - 0.6) ** 2)}, ${f(HALO_DEL_ARCO.llega ** 2)}, r2 );
	float halo = exp( - r2 ) * vGolpe * vPeso * borde;
	float resplandor = exp( - r2 * 0.28 ) * vResidual * vPeso * borde;
	float aDia = min( 1.0, halo * uArcoDia.x + resplandor * uArcoDia.y );
	vec3 colorDia = uTintaDia;
	vec3 luzNoche = uLuzNoche * ( halo * uArcoNoche.x + resplandor * uArcoNoche.y );
	float blando = smoothstep( 0.0, ${f(ARCO_BLANDO)}, distanciaALoOpaco( gl_FragCoord.xy / uResolucion ) - vDistancia );
	float vis = ( 1.0 - ${f(0.95)} * textoDelArco( vTexto ) ) * ( 1.0 - uApagado ) * blando;
	${SALIDA}
}
`