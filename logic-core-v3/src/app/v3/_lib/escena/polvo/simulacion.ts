import { FLOOR_Y } from '../probeScene'
import { CAMPO_DEL_LOGO_GLSL } from './campoDelLogo'
import { POSARSE } from './posarse'
import { POLVO_PAREJO } from './volumen'

/**
 * [ESCENA 6] EL POLVO CON FÍSICA — pura: la simulación de cada mota en la GPU: el polvo que se posa
 * (y lo levanta el aire). En el producto.
 *
 * **El estado.** Dos texturas de una celda por mota (32 bits por canal): la posición y la velocidad,
 * y en el canal que sobra, el MODO de la mota y desde cuándo está en él:
 *
 * - **0 · en el aire.** La mota es la del producto (la caja que acompaña a la cámara, las conchas que
 *   giran) MÁS un corrimiento `D` que el aire le da y que vuelve solo a cero
 *   (un resorte amortiguado). En reposo `D` = 0: la mota está exactamente donde estaba sin física.
 * - **1 · cayendo.** Con la quietud (los tiempos de ESCENA 5: empieza a los 8 s, en el piso a los 25)
 *   cada mota se suelta del aire y baja con arrastre: la velocidad va hacia la de caída (la que la
 *   deja en el piso a tiempo) más una turbulencia lenta, así que deriva y no baja en línea recta.
 * - **2 · en el piso.** Quieta. [ESCENA 7] Con el piso vivo, apoyada en su bloque: sube y baja con el mar.
 * - **3 · sobre el logo.** Si cae sobre una cara de arriba del logo (normal a menos de 50° de la
 *   vertical) se queda ahí, guardada en el espacio del logo: acompaña su balanceo.
 * - ~~**4 · deslizando.**~~ [ESCENA 9] T1: borrado. Con el movimiento de la coreografía o el despertar, la
 *   posada sobre el logo se levanta (modo 5) en vez de resbalar por la cara hasta su borde.
 * - **5 · levantada.** El despertar (scroll o cursor) arma un REMOLINO donde empezó el movimiento: gira
 *   (un vórtice de núcleo que crece y se apaga), chupa aire por abajo y sube por el centro, y un frente
 *   de ráfaga sale de ahí a `POSARSE.velocidad`. La mota que alcanza el frente queda en ese viento, con
 *   arrastre y un poco de gravedad; pasado el soplo, el aire la vuelve a llevar (modo 0, con el `D`
 *   que traiga).
 * - ~~**6 · pegada.**~~ [ESCENA 7] La que chocaba con fuerza quedaba pegada un momento. [CALIDAD 1] A3: borrada.
 *
 * **[ESCENA 9] T1 · el obstáculo, afuera.** El polvo en vuelo ya no se entera del logo: lo atraviesa (el logo lo
 * tapa), como antes de 5a. Se borraron el rodeo (el aire que corría alrededor del logo como un flujo potencial,
 * ESCENA 7 T7, con su campo de la malla real de CALIDAD 1 A3), el contacto (la mota del aire o la levantada que
 * llegaba a la cara se corría por ella: con el lugar de reposo adentro del logo, quedaba contra la cara para
 * siempre, y el polvo se amontonaba en sus bordes) y el deslizar. Queda lo aprobado: con la página quieta, la mota
 * que CAE sobre una cara de arriba se posa ahí (contra el campo de la malla real, `campoDelLogo.ts`), y con el
 * despertar o el movimiento se levanta.
 *
 * **[CALIDAD 1] B4 · nada aparece ni se va de golpe.** La mota del aire se ve según su lugar en el volumen que se
 * repite (se desvanece contra sus caras y contra el piso); la suelta (modos 1 a 5), según dónde está. Al cambiar de
 * régimen la visibilidad saltaba: al posarse, las motas del volumen que caían DEBAJO del piso (un tercio: invisibles
 * en el aire) aparecían de golpe sobre él, y al volver al aire después del soplo, las que tenían su lugar ahí
 * desaparecían de golpe. Ahora la simulación guarda en la parte fraccionaria del modo el PESO de la mota suelta (0 en
 * el aire, 1 suelta, en `fundido`), y el material mezcla con él el corte del volumen del aire: aparecen y se van con
 * un fundido. En el aire el corte de las CARAS vale siempre (donde la caja se repite, la mota del aire salta de lugar:
 * tiene que estar apagada), así que la levantada vuelve al aire sólo cuando su lugar está lejos de las caras (con la
 * quietud, la que no puede volver se posa sin pasar por el aire, como se posan las del aire). Y el
 * remolino ya no aspira debajo del piso: su `exp( - alto / 1,2 )` crecía sin tope con la altura negativa y lanzaba las
 * motas de abajo del piso a millones de unidades (se veían como puntos sueltos).
 */

export const FISICA = {
  /** La textura: 128 de ancho. */
  ancho: 128,
  /** El aire: rigidez del resorte que devuelve `D` (1/s²), su amortiguación (1/s) y el arrastre hacia el viento (s). */
  aire: { rigidez: 0.6, amortigua: 0.9, arrastre: 0.25 },
  /** La caída: el arrastre (s), la turbulencia (u/s) y su escala (u), y la velocidad mínima de caída. */
  caida: { arrastre: 0.5, turbulencia: 0.22, escala: 3.5, minima: 0.05 },
  /** Sobre el logo: el ángulo máximo de la cara de arriba (cos) y a cuánto de la cara queda la posada (u). */
  logo: { cara: 0.64, radio: 0.03 },
  /** Cuánto movimiento de la coreografía (0–1) levanta el polvo del logo ([ESCENA 9] T1: antes lo hacía resbalar). */
  resbala: 0.15,
  /** El remolino del despertar: circulación, núcleo, subida, aspiración, frente y duración (s). */
  remolino: { circulacion: 14, nucleo: 0.8, crece: 1.6, subida: 2.6, aspira: 0.8, frente: 2.5, ascenso: 3, duraS: 6 },
  /** Cuánto dura el soplo en una mota levantada antes de que el aire la vuelva a llevar (s, más un azar). */
  soplo: { s: 1.4, azar: 0.8, gravedad: 0.3, arrastre: 0.35 },
  /** [CALIDAD 1] B4 · en cuánto se suelta del aire la mota (aparece la que estaba debajo del piso) y en cuánto vuelve a él (s). */
  fundido: { entraS: 2.5, saleS: 1.5 },
  /**
   * [RETOQUE 3D] B2 · la levantada sube a su lugar en el aire: con qué constante (s), a lo sumo a qué velocidad (u/s), a
   * qué distancia se le entrega al aire (u) y cuánto lo persigue como mucho después del soplo (s).
   */
  vuelta: { s: 0.8, tope: 3.5, entrega: 0.35, esperaS: 3 },
} as const

/** [CALIDAD 1] B4 · el peso de la mota suelta va en la parte fraccionaria del modo, de 0 a esto (menos de 0,5: el modo se redondea). */
export const PESO_EN_EL_MODO = 0.4

/**
 * [CALIDAD 1] B3 · UN PASO QUE NO DEPENDE DEL FRAMERATE: la velocidad `v` relaja hacia `objetivo` con tasa `lambda`
 * EXACTA en el paso (Euler exponencial), y lo que se mueve es su integral. Con Euler explícito la trayectoria del aire
 * se apartaba del tiempo continuo 1,0 % del pico a 60 Hz y 0,4 % a 144 Hz; así, 0,5 % y 0,2 %, y estable con cualquier
 * `dt`. La misma cuenta que `relajar` en el shader; pura, para el invariante (por componente).
 */
export function relajar(v: number, objetivo: number, lambda: number, dt: number): { readonly v: number; readonly movido: number } {
  const e = Math.exp(-lambda * dt)
  return { v: objetivo + (v - objetivo) * e, movido: objetivo * dt + ((v - objetivo) * (1 - e)) / lambda }
}

/** [CALIDAD 1] B3 · un paso del aire (modo 0) por componente: el resorte que devuelve `d` y el arrastre hacia el viento. */
export function pasoDelAire(d: number, v: number, viento: number, dt: number): { readonly d: number; readonly v: number } {
  const lambda = 1 / FISICA.aire.arrastre + FISICA.aire.amortigua
  const r = relajar(v, (viento / FISICA.aire.arrastre - FISICA.aire.rigidez * d) / lambda, lambda, dt)
  return { d: d + r.movido, v: r.v }
}

/**
 * La cara del logo con espesor real, en las formas de siempre (dos anillos y el palo). Pide `uLogoC`, `uLogoP` y
 * `uLogoPalo` declarados. [ESCENA 7] El piso vivo la usa para que ningún bloque toque al logo (una forma que lo
 * envuelve alcanza). [CALIDAD 1] A3: la física ya no. [ESCENA 9] T1: sólo el piso vivo.
 */
export const CARAS_DEL_LOGO_GLSL = /* glsl */ `
// El logo con su espesor de verdad: dos anillos extruidos (el trazo y la profundidad de la extrusión)
// y el palo, una caja. Mismas piezas que la forma del logo (formaDelLogo.ts), en el espacio de su grupo.
const float MEDIO_TRAZO = 0.371;
const float MEDIO_ESPESOR = 0.273;
float alAnillo( vec3 q, vec4 t ) {
	float d2 = abs( length( q.xy - t.xy ) - t.z ) - MEDIO_TRAZO;
	float dz = abs( q.z ) - MEDIO_ESPESOR;
	return length( max( vec2( d2, dz ), 0.0 ) ) + min( max( d2, dz ), 0.0 );
}
float alPaloDeVerdad( vec3 q, vec4 p ) {
	vec3 centro = vec3( p.x, ( p.y + p.z ) * 0.5, 0.0 );
	vec3 medio = vec3( p.w * 0.95, abs( p.y - p.z ) * 0.5, MEDIO_ESPESOR );
	vec3 d = abs( q - centro ) - medio;
	return length( max( d, 0.0 ) ) + min( max( d.x, max( d.y, d.z ) ), 0.0 );
}
float caraDelLogo( vec3 q ) {
	return min( min( alAnillo( q, uLogoC ), alAnillo( q, uLogoP ) ), alPaloDeVerdad( q, uLogoPalo ) );
}
vec3 normalDelLogo( vec3 q ) {
	vec2 e = vec2( 0.01, 0.0 );
	return normalize( vec3(
		caraDelLogo( q + e.xyy ) - caraDelLogo( q - e.xyy ),
		caraDelLogo( q + e.yxy ) - caraDelLogo( q - e.yxy ),
		caraDelLogo( q + e.yyx ) - caraDelLogo( q - e.yyx ) ) );
}
`

const L = POLVO_PAREJO.lado

/** La simulación: dos salidas (posición + modo, velocidad + desde cuándo). */
export const SIMULACION_DEL_POLVO_GLSL = /* glsl */ `
precision highp float;
uniform sampler2D uEstado[ 2 ];
uniform sampler2D uOrigenes;
uniform vec2 uTam;
uniform float uCuantas;
uniform mat4 uConcha[ 3 ];
uniform vec3 uCamara;
uniform vec3 uAdelante;
uniform vec3 uDeriva;
uniform float uDt;
uniform float uReloj;
uniform float uPosarse;
uniform float uQuieto;
uniform float uDesperto;
uniform vec3 uOrigen;
uniform float uRemolino;
uniform float uMovimiento;
uniform vec3 uVientoDelAire;
uniform mat4 uLogo;
uniform mat4 uLogoInverso;
uniform sampler2D uPisoVivo;
uniform vec4 uGrillaDelPiso;
in vec2 vUv;
layout( location = 0 ) out vec4 salida0;
layout( location = 1 ) out vec4 salida1;
${CAMPO_DEL_LOGO_GLSL}

float azar1( float n ) { return fract( sin( n * 12.9898 + 4.1414 ) * 43758.5453 ); }
float azar3( vec3 p ) { return fract( sin( dot( p, vec3( 127.1, 311.7, 74.7 ) ) ) * 43758.5453 ); }
float ruido3( vec3 p ) {
	vec3 i = floor( p );
	vec3 f = fract( p );
	vec3 u = f * f * ( 3.0 - 2.0 * f );
	float a = mix( mix( azar3( i ), azar3( i + vec3( 1, 0, 0 ) ), u.x ), mix( azar3( i + vec3( 0, 1, 0 ) ), azar3( i + vec3( 1, 1, 0 ) ), u.x ), u.y );
	float b = mix( mix( azar3( i + vec3( 0, 0, 1 ) ), azar3( i + vec3( 1, 0, 1 ) ), u.x ), mix( azar3( i + vec3( 0, 1, 1 ) ), azar3( i + vec3( 1, 1, 1 ) ), u.x ), u.y );
	return mix( a, b, u.z ) * 2.0 - 1.0;
}

// La mota del producto: la caja que acompaña a la cámara (la cuenta de volumen.ts). [CALIDAD 1] B4: y en \`borde\`,
// cuán cerca está de las caras de la caja (0 en el centro, 1 en una cara, donde se repite).
vec3 libre( vec3 p0, int k, out float borde ) {
	mat4 m = uConcha[ k ];
	mat3 giro = mat3( m );
	vec3 camara = transpose( giro ) * ( uCamara - m[ 3 ].xyz );
	vec3 adelante = transpose( giro ) * uAdelante;
	vec3 centro = camara + adelante * ${(L / 2 - POLVO_PAREJO.atras).toFixed(2)};
	vec3 t = p0 + transpose( giro ) * uDeriva;
	t = centro + mod( t - centro + ${(L / 2).toFixed(2)}, ${L.toFixed(2)} ) - ${(L / 2).toFixed(2)};
	vec3 enLaCaja = abs( t - centro ) / ${(L / 2).toFixed(2)};
	borde = max( enLaCaja.x, max( enLaCaja.y, enLaCaja.z ) );
	// [ESCENA 9] T1 · sin holgura ni rodeo: la mota del aire atraviesa al logo (el logo la tapa).
	return ( m * vec4( t, 1.0 ) ).xyz;
}

// [ESCENA 7] El piso bajo xz: el tope del bloque del piso vivo si hay, o el piso plano.
float pisoEn( vec2 xz ) {
	if ( uGrillaDelPiso.z < 0.5 ) return ${FLOOR_Y.toFixed(4)};
	ivec2 celda = ivec2( floor( xz / uGrillaDelPiso.y + uGrillaDelPiso.x * 0.5 ) );
	if ( celda.x < 0 || celda.y < 0 || celda.x >= int( uGrillaDelPiso.x ) || celda.y >= int( uGrillaDelPiso.x ) ) return ${FLOOR_Y.toFixed(4)};
	return ${FLOOR_Y.toFixed(4)} + texelFetch( uPisoVivo, celda, 0 ).b;
}

// [CALIDAD 1] B3 · la velocidad relaja EXACTA hacia \`objetivo\` en el paso (Euler exponencial): la misma trayectoria a
// 60, 75, 120 y 144 Hz, estable con cualquier dt. Devuelve lo que se movió en el paso (con dt 0, nada).
vec3 relajar( inout vec3 v, vec3 objetivo, float lambda, float dt ) {
	float e = exp( - lambda * dt );
	vec3 movido = objetivo * dt + ( v - objetivo ) * ( 1.0 - e ) / lambda;
	v = objetivo + ( v - objetivo ) * e;
	return movido;
}

// La turbulencia de la caída: lenta y horizontal, un poco vertical.
vec3 turbulencia( vec3 p ) {
	vec3 q = p / ${FISICA.caida.escala.toFixed(2)} + vec3( 0.0, 0.0, uReloj * 0.07 );
	return vec3( ruido3( q ), 0.35 * ruido3( q + 31.7 ), ruido3( q + 71.3 ) ) * ${FISICA.caida.turbulencia.toFixed(3)};
}

// El viento del despertar en p: el remolino (giro, subida por el centro, aspiración abajo) y el frente.
vec3 vientoDelDespertar( vec3 p ) {
	float a = uReloj - uDesperto;
	if ( a < 0.0 || a > ${FISICA.remolino.duraS.toFixed(1)} ) return vec3( 0.0 );
	vec2 d = p.xz - uOrigen.xz;
	float r = max( length( d ), 1e-3 );
	vec2 radial = d / r;
	float nucleo = ${FISICA.remolino.nucleo.toFixed(2)} + ${FISICA.remolino.crece.toFixed(2)} * a;
	float nace = smoothstep( 0.0, 0.3, a );
	float giro = ${FISICA.remolino.circulacion.toFixed(1)} * exp( - a / 2.2 ) * nace * r / ( r * r + nucleo * nucleo );
	float alto = p.y - ${FLOOR_Y.toFixed(4)};
	// El remolino sube: su centro de fuerza va ganando altura.
	float centroDeAltura = 1.0 + ${FISICA.remolino.ascenso.toFixed(1)} * a;
	float enAltura = exp( - pow( ( alto - centroDeAltura ) / ( 2.0 + 1.5 * a ), 2.0 ) );
	float sube = ${FISICA.remolino.subida.toFixed(2)} * exp( - a / 2.5 ) * nace * exp( - r * r / ( 2.0 * pow( nucleo * 1.8, 2.0 ) ) );
	// [CALIDAD 1] B4 · sin tope abajo del piso: con la altura negativa crecía sin límite y lanzaba las motas de ahí.
	float aspira = - ${FISICA.remolino.aspira.toFixed(2)} * exp( - max( alto, 0.0 ) / 1.2 ) * exp( - r * r / pow( 3.0 * nucleo, 2.0 ) ) * nace;
	// [RETOQUE 3D] B3 · el remolino (el giro, la subida por el centro y la aspiración) sólo si despertó el cursor: el del
	// scroll nace en un punto fijo delante de la cámara, que no es un lugar de la sala; de noche, con las motas encendidas,
	// se veía un embudo de luz que la cámara dejaba atrás. El frente (la ráfaga que levanta al pasar) es de los dos.
	vec3 v = ( vec3( - radial.y, 0.0, radial.x ) * giro * ( 0.4 + 0.6 * enAltura ) + vec3( 0.0, sube, 0.0 ) + vec3( radial.x, 0.0, radial.y ) * aspira ) * uRemolino;
	// El frente de la ráfaga: sale del origen y levanta al pasar.
	float frente = exp( - pow( ( r - ${POSARSE.velocidad.toFixed(1)} * a ) / ${FISICA.remolino.frente.toFixed(2)}, 2.0 ) ) * exp( - a / 1.5 );
	v += ( vec3( radial.x, 0.0, radial.y ) * 1.2 + vec3( 0.0, 3.0, 0.0 ) ) * frente;
	return v;
}

// [CALIDAD 1] B4 · una normal sin NaN: donde el campo no tiene gradiente (plano), \`normalize\` de cero daba NaN y la
// mota se perdía para siempre (12 de 14.000, trabadas cayendo); ahí, hacia arriba.
vec3 normalSegura( vec3 n ) {
	float largo = length( n );
	return largo > 1e-6 ? n / largo : vec3( 0.0, 1.0, 0.0 );
}

// [ESCENA 9] T1 · SÓLO SE POSA: la que cae (con la página quieta) y ENTRA al logo por una cara de arriba (la malla
// real) queda en esa cara; la que entra por otra cara, o ya estaba adentro, lo atraviesa (el logo la tapa). Nada
// la empuja ni la corre por la cara. Devuelve si se posó (y la deja a \`radio\` de la cara).
bool posarseEnElLogo( inout vec3 p, vec3 antes ) {
	vec3 q = ( uLogoInverso * vec4( p, 1.0 ) ).xyz;
	float d = campoDelLogo( q );
	if ( d >= ${FISICA.logo.radio.toFixed(3)} ) return false;
	if ( campoDelLogo( ( uLogoInverso * vec4( antes, 1.0 ) ).xyz ) < ${FISICA.logo.radio.toFixed(3)} ) return false;
	vec3 n = normalSegura( mat3( uLogo ) * normalDelCampo( q ) );
	if ( n.y <= ${FISICA.logo.cara.toFixed(2)} ) return false;
	p += n * ( ${FISICA.logo.radio.toFixed(3)} - d );
	return true;
}

// [CALIDAD 1] B4 · el modo con el peso de la mota suelta en su parte fraccionaria: hacia 1 en los modos sueltos y hacia
// 0 en el aire. El material mezcla con él el corte del volumen del aire: ni aparece ni se va de golpe.
float modoConPeso( float modo, float peso, float dt ) {
	peso = modo > 0.5 ? min( 1.0, peso + dt / ${FISICA.fundido.entraS.toFixed(2)} ) : max( 0.0, peso - dt / ${FISICA.fundido.saleS.toFixed(2)} );
	return modo + ${PESO_EN_EL_MODO.toFixed(2)} * peso;
}

void main() {
	ivec2 c = ivec2( gl_FragCoord.xy );
	float indice = float( c.y ) * uTam.x + float( c.x );
	if ( indice >= uCuantas ) { salida0 = vec4( 0.0 ); salida1 = vec4( 0.0 ); return; }
	vec4 e0 = texelFetch( uEstado[ 0 ], c, 0 );
	vec4 e1 = texelFetch( uEstado[ 1 ], c, 0 );
	vec4 o = texelFetch( uOrigenes, c, 0 );
	float modo = floor( e0.w + 0.5 );
	float peso = clamp( ( e0.w - modo ) / ${PESO_EN_EL_MODO.toFixed(2)}, 0.0, 1.0 );
	float desde = e1.w;
	vec3 v = e1.xyz;
	float dt = uDt;
	float azar = azar1( indice );
	float retraso = azar * ${POSARSE.desparejoS.toFixed(2)};
	float bordeDeF;
	vec3 f = libre( o.xyz, int( o.w + 0.5 ), bordeDeF );
	// En el aire, la del producto más D; sobre el logo, guardada en el espacio del logo.
	bool enElLogo = modo > 2.5 && modo < 3.5;
	vec3 p = modo < 0.5 ? f + e0.xyz : ( enElLogo ? ( uLogo * vec4( e0.xyz, 1.0 ) ).xyz : e0.xyz );
	// El piso bajo la mota (con el piso vivo, el tope de su bloque: la posada sube y baja con el mar).
	float piso = pisoEn( p.xz ) + 0.02 + fract( azar * 7.31 ) * ${POSARSE.alturaPosada.toFixed(3)};
	float quieta = uReloj - uQuieto;
	// El frente del despertar llega a esta mota: sólo cuenta si despertó después de que se soltara.
	bool despierta = uDesperto > desde && uReloj >= uDesperto + distance( p.xz, uOrigen.xz ) / ${POSARSE.velocidad.toFixed(1)};

	if ( modo < 0.5 ) {
		// En el aire: el corrimiento vuelve solo, y el viento (el despertar, 6b) lo empuja.
		if ( uPosarse > 0.5 && quieta > ${POSARSE.empiezaS.toFixed(1)} + retraso ) {
			modo = 1.0;
			desde = uReloj;
		} else {
			// El aire corre (6a) y la mota, con él (el corrimiento de todo el volumen); el despertar la empuja y el
			// resorte la devuelve. [ESCENA 9] T1: el logo no la toca (ni la rodea ni la corre por su cara).
			vec3 d = e0.xyz;
			vec3 viento = vientoDelDespertar( p );
			const float LAMBDA_DEL_AIRE = ${(1 / FISICA.aire.arrastre + FISICA.aire.amortigua).toFixed(4)};
			d += relajar( v, ( viento / ${FISICA.aire.arrastre.toFixed(2)} - ${FISICA.aire.rigidez.toFixed(2)} * d ) / LAMBDA_DEL_AIRE, LAMBDA_DEL_AIRE, dt );
			if ( dot( d, d ) < 1e-8 && dot( v, v ) < 1e-8 ) { d = vec3( 0.0 ); v = vec3( 0.0 ); }
			salida0 = vec4( d, modoConPeso( 0.0, peso, dt ) );
			salida1 = vec4( v, desde );
			return;
		}
	}
	if ( modo > 0.5 && modo < 1.5 ) {
		if ( despierta ) { modo = 5.0; desde = uReloj; }
		else {
			// Cayendo: con arrastre hacia la velocidad que la deja en el piso a tiempo, más la turbulencia.
			float falta = max( 0.6, ${POSARSE.asentadoS.toFixed(1)} + retraso * 0.3 - quieta );
			float baja = max( ${FISICA.caida.minima.toFixed(2)}, ( p.y - piso ) / falta );
			vec3 objetivo = turbulencia( p ) + vec3( 0.0, - baja, 0.0 );
			vec3 antes = p;
			p += relajar( v, objetivo, ${(1 / FISICA.caida.arrastre).toFixed(4)}, dt );
			if ( posarseEnElLogo( p, antes ) ) {
				salida0 = vec4( ( uLogoInverso * vec4( p, 1.0 ) ).xyz, modoConPeso( 3.0, peso, dt ) );
				salida1 = vec4( 0.0, 0.0, 0.0, desde );
				return;
			}
			if ( p.y <= piso ) { p.y = piso; v = vec3( 0.0 ); modo = 2.0; }
			salida0 = vec4( p, modoConPeso( modo, peso, dt ) );
			salida1 = vec4( v, desde );
			return;
		}
	}
	if ( modo > 1.5 && modo < 2.5 ) {
		if ( despierta ) { modo = 5.0; desde = uReloj; }
		else { salida0 = vec4( p.x, piso, p.z, modoConPeso( 2.0, peso, dt ) ); salida1 = vec4( 0.0, 0.0, 0.0, desde ); return; }
	}
	if ( modo > 2.5 && modo < 3.5 ) {
		// [ESCENA 9] T1 · con el despertar o con el movimiento de la coreografía se levanta: se suelta del logo (que
		// sigue su camino) y el viento la lleva; ya no resbala por la cara hasta amontonarse en su borde.
		if ( despierta || uMovimiento > ${FISICA.resbala.toFixed(2)} ) { modo = 5.0; desde = uReloj; v = vec3( 0.0 ); }
		else { salida0 = vec4( e0.xyz, modoConPeso( 3.0, peso, dt ) ); salida1 = vec4( 0.0, 0.0, 0.0, desde ); return; }
	}
	// Levantada (y la que deslizaba, que ya no existe): en el viento del despertar y el del aire, con arrastre; pasado el
	// soplo, el aire la lleva. [ESCENA 9] T1: el logo no la toca.
	// [RETOQUE 3D] B2 · y SUBE a su lugar en el aire (cerca de las caras de la caja, sólo a su altura): cualquier despertar,
	// aunque sea un scroll mínimo, la levanta entera. Antes la devolvía la gravedad o el resorte lento del aire (τ ≈ 8 s) y
	// a los 4 s de quietud se volvía a posar sin haber subido; las de cerca de las caras (44 %) no salían del piso.
	bool cercaDeLasCaras = bordeDeF >= ${(1 - POLVO_PAREJO.fundido).toFixed(3)};
	vec3 lugar = cercaDeLasCaras ? vec3( p.x, f.y, p.z ) : f;
	lugar.y = max( lugar.y, piso );
	vec3 hacia = ( lugar - p ) / ${FISICA.vuelta.s.toFixed(2)};
	float rapidez = length( hacia );
	if ( rapidez > ${FISICA.vuelta.tope.toFixed(2)} ) hacia *= ${FISICA.vuelta.tope.toFixed(2)} / rapidez;
	vec3 viento = vientoDelDespertar( p ) + uVientoDelAire + turbulencia( p );
	p += relajar( v, viento + hacia, ${(1 / FISICA.soplo.arrastre).toFixed(4)}, dt );
	if ( p.y < piso ) { p.y = piso; v.y = max( v.y, 0.0 ); }
	// [CALIDAD 1] B4 · vuelve al aire sólo si su lugar está lejos de las caras de la caja: ahí el aire la dibuja entera y
	// no hay salto. [RETOQUE 3D] B2: cuando llegó a su lugar (o su lugar es debajo del piso, donde el aire no la dibuja: se
	// funde), o si lo persiguió demasiado (la cámara lo corre); mientras tanto sigue suelta, en el aire.
	float pasado = uReloj - desde - ( ${FISICA.soplo.s.toFixed(2)} + azar * ${FISICA.soplo.azar.toFixed(2)} );
	if ( pasado > 0.0 ) {
		bool llego = distance( p, f ) < ${FISICA.vuelta.entrega.toFixed(2)} || f.y < ${POLVO_PAREJO.piso.toFixed(4)} || pasado > ${FISICA.vuelta.esperaS.toFixed(1)};
		if ( !cercaDeLasCaras && llego ) {
			salida0 = vec4( p - f, modoConPeso( 0.0, peso, dt ) );
			salida1 = vec4( v, desde );
			return;
		}
		// [CALIDAD 1] B4 (seguimiento) · la que no puede volver al aire, con la quietud se posa como las del aire, sin
		// pasar por él: antes quedaba levantada con la página quieta (medido en la noche: 5.449 de 14.000, nunca en el piso).
		if ( uPosarse > 0.5 && quieta > ${POSARSE.empiezaS.toFixed(1)} + retraso ) {
			salida0 = vec4( p, modoConPeso( 1.0, peso, dt ) );
			salida1 = vec4( v, uReloj );
			return;
		}
	}
	salida0 = vec4( p, modoConPeso( 5.0, peso, dt ) );
	salida1 = vec4( v, desde );
}
`

/**
 * En el material de la mota: después del volumen (que deja en `transformed` la mota del producto),
 * la posición de la simulación. En el aire, la del producto más `D`; en los otros
 * modos, la de la simulación. Cuánto se ve se vuelve a contar ahí (cerca de la lente, el alcance y
 * la sala); el corte del volumen del aire (sus caras y el piso: la mota posada está en el piso) va
 * mezclado por el peso de la mota suelta ([CALIDAD 1] B4).
 */
export const FISICA_EN_LA_MOTA_GLSL = /* glsl */ `
	{
		vec2 celda = vec2( mod( aIndice, ${FISICA.ancho.toFixed(1)} ), floor( aIndice / ${FISICA.ancho.toFixed(1)} ) );
		vec4 e0 = texelFetch( uFisica, ivec2( celda ), 0 );
		modoDeLaFisica = floor( e0.w + 0.5 );
		vec3 mundo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
		if ( modoDeLaFisica < 0.5 ) mundo += e0.xyz;
		else if ( modoDeLaFisica > 2.5 && modoDeLaFisica < 3.5 ) mundo = ( uLogo * vec4( e0.xyz, 1.0 ) ).xyz;
		else mundo = e0.xyz;
		transformed = transpose( mat3( modelMatrix ) ) * ( mundo - modelMatrix[ 3 ].xyz );
		// [CALIDAD 1] B4 · la cámara y la sala, donde se DIBUJA la mota (en el aire, con su corrimiento); el corte del
		// volumen del aire, mezclado por el peso de la mota suelta: nada aparece ni se va de golpe. En el aire, el de las
		// caras nunca deja de valer del todo (\`min\`): ahí se repite la caja y la mota salta de lugar.
		float lejos = distance( mundo, cameraPosition );
		float pesoSuelta = smoothstep( 0.0, 1.0, clamp( ( e0.w - modoDeLaFisica ) / ${PESO_EN_EL_MODO.toFixed(2)}, 0.0, 1.0 ) );
		vParejo = smoothstep( 0.8, CERCA_DEL_POLVO, lejos ) * ( 1.0 - smoothstep( ${(POLVO_PAREJO.alcance - 4).toFixed(2)}, ${POLVO_PAREJO.alcance.toFixed(2)}, lejos ) );
		vParejo *= 1.0 - smoothstep( ${(POLVO_PAREJO.radio - 1.5).toFixed(2)}, ${POLVO_PAREJO.radio.toFixed(2)}, length( mundo.xz ) );
		vParejo *= mix( carasDelAire, 1.0, modoDeLaFisica < 0.5 ? min( pesoSuelta, carasDelAire ) : pesoSuelta );
		vParejo *= mix( pisoDelAire, 1.0, pesoSuelta );
	}
`
