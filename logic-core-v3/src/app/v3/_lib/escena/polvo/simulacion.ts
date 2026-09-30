import { FLOOR_Y } from '../probeScene'
import { CAMPO_DEL_LOGO_GLSL, FLUJO_DEL_LOGO_GLSL } from './campoDelLogo'
import { DISTANCIA_AL_LOGO_GLSL } from './obstaculo'
import { POSARSE } from './posarse'
import { POLVO_PAREJO } from './volumen'

/**
 * [ESCENA 6] EL POLVO CON FÍSICA — pura: la simulación de cada mota en la GPU: el polvo que se posa
 * (y lo levanta el aire) y, desde ESCENA 7, el logo como obstáculo del aire. En el producto.
 *
 * **El estado.** Dos texturas de una celda por mota (32 bits por canal): la posición y la velocidad,
 * y en el canal que sobra, el MODO de la mota y desde cuándo está en él:
 *
 * - **0 · en el aire.** La mota es la del producto (la caja que acompaña a la cámara, las conchas que
 *   giran) MÁS un corrimiento `D` que el aire le da y que vuelve solo a cero
 *   (un resorte amortiguado). En reposo `D` = 0: la mota está exactamente donde estaba sin física.
 *   [ESCENA 7] T7: el aire que corre (6a) RODEA al logo, y la mota lo sigue con su inercia (ver abajo).
 * - **1 · cayendo.** Con la quietud (los tiempos de ESCENA 5: empieza a los 8 s, en el piso a los 25)
 *   cada mota se suelta del aire y baja con arrastre: la velocidad va hacia la de caída (la que la
 *   deja en el piso a tiempo) más una turbulencia lenta, así que deriva y no baja en línea recta.
 * - **2 · en el piso.** Quieta. [ESCENA 7] Con el piso vivo, apoyada en su bloque: sube y baja con el mar.
 * - **3 · sobre el logo.** Si cae sobre una cara de arriba del logo (normal a menos de 50° de la
 *   vertical) se queda ahí, guardada en el espacio del logo: acompaña su balanceo.
 * - **4 · deslizando.** Cuando la coreografía se mueve, la del logo resbala por la cara (la gravedad a
 *   lo largo de la superficie) hasta caerse por el borde, y sigue cayendo.
 * - **5 · levantada.** El despertar (scroll o cursor) arma un REMOLINO donde empezó el movimiento: gira
 *   (un vórtice de núcleo que crece y se apaga), chupa aire por abajo y sube por el centro, y un frente
 *   de ráfaga sale de ahí a `POSARSE.velocidad`. La mota que alcanza el frente queda en ese viento, con
 *   arrastre y un poco de gravedad; pasado el soplo, el aire la vuelve a llevar (modo 0, con el `D`
 *   que traiga). El logo es obstáculo en todos los modos que se mueven.
 * - ~~**6 · pegada.**~~ [ESCENA 7] La que chocaba con fuerza quedaba pegada un momento. [CALIDAD 1] A3: borrada.
 *
 * **[ESCENA 7] T7 · el obstáculo, como un obstáculo de verdad.** Hasta ESCENA 6 la holgura alrededor del
 * logo se abría con la velocidad de la cámara y se cerraba al frenar: una burbuja que empujaba las motas y
 * después las traía de vuelta a la fuerza. Se fue, y con ella la holgura fija: en reposo la mota está donde
 * está (las pocas que caen adentro del logo, unas tres de 14.000, se corren a su cara). Ahora el aire que corre (6a, `uVientoDelAire`) rodea la forma del
 * logo como un flujo potencial: cerca de la superficie se anula lo que entra y se acelera lo que pasa de
 * costado (`alrededor`). La mota no sigue ese flujo de golpe: se acerca a él con su arrastre (0,25 s). Con
 * el aire lento la mota tiene tiempo de doblar y RODEA al logo siguiendo el flujo; con el aire rápido no le
 * alcanza y CHOCA: se corre por la cara, sin rebote (en ESCENA 7 y 8, con fuerza, quedaba pegada: modo 6).
 *
 * **[ESCENA 8] T5 · el choque, contra la malla real.** El choque, el pegado, el polvo posado sobre el logo y el
 * que desliza usan el campo de distancia de la malla real (`campoDelLogo.ts`), no las formas aproximadas (el
 * anillo entero de la «c» cerraba su boca con una pared que no existe: ahí se formaban los arcos que flotaban
 * afuera del logo). El choque va con la velocidad RELATIVA a la superficie del logo, que también se mueve.
 *
 * **[CALIDAD 1] A3 · sin pegado, y el flujo por los huecos.** El pegado (modo 6) se borró: se veía raro. Queda el
 * flujo: el aire rodea al logo y la mota que igual llega a la cara se corre por ella, sin rebote. Y el flujo ya no
 * usa las formas de siempre (dos anillos enteros: la boca de la «c» era una pared) sino un campo de la malla real
 * (`CAMPO_DEL_FLUJO`, más grueso y de más alcance que el del choque): el aire, y el polvo con él, pasa por la boca
 * de la «c» y por el ojo de la «p». El polvo posado sobre el logo (modo 3) y el que desliza siguen con el campo fino.
 *
 * **[CALIDAD 1] B4 · nada aparece ni se va de golpe.** La mota del aire se ve según su lugar en el volumen que se
 * repite (se desvanece contra sus caras y contra el piso); la suelta (modos 1 a 5), según dónde está. Al cambiar de
 * régimen la visibilidad saltaba: al posarse, las motas del volumen que caían DEBAJO del piso (un tercio: invisibles
 * en el aire) aparecían de golpe sobre él, y al volver al aire después del soplo, las que tenían su lugar ahí
 * desaparecían de golpe. Ahora la simulación guarda en la parte fraccionaria del modo el PESO de la mota suelta (0 en
 * el aire, 1 suelta, en `fundido`), y el material mezcla con él el corte del volumen del aire: aparecen y se van con
 * un fundido. En el aire el corte de las CARAS vale siempre (donde la caja se repite, la mota del aire salta de lugar:
 * tiene que estar apagada), así que la levantada vuelve al aire sólo cuando su lugar está lejos de las caras. Y el
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
  /** Sobre el logo: el ángulo máximo de la cara (cos) y, deslizando, la gravedad sobre la cara y el roce. */
  logo: { cara: 0.64, gravedad: 1.4, roce: 0.8, radio: 0.03, suelta: 0.14 },
  /** Cuánto movimiento de la coreografía (0–1) hace resbalar el polvo del logo. */
  resbala: 0.15,
  /** El remolino del despertar: circulación, núcleo, subida, aspiración, frente y duración (s). */
  remolino: { circulacion: 14, nucleo: 0.8, crece: 1.6, subida: 2.6, aspira: 0.8, frente: 2.5, ascenso: 3, duraS: 6 },
  /** Cuánto dura el soplo en una mota levantada antes de que el aire la vuelva a llevar (s, más un azar). */
  soplo: { s: 1.4, azar: 0.8, gravedad: 0.3, arrastre: 0.35 },
  /** [ESCENA 7] T7 · el logo como obstáculo del aire: el radio de influencia del flujo que lo rodea (u). */
  obstaculo: { radio: 1.8 },
  /** [ESCENA 8] T5 · contra la malla real: a cuánto de la cara se detecta el contacto y dónde queda la mota que se corre por ella (u). */
  contacto: { detecta: 0.12, queda: 0.03 },
  /** [CALIDAD 1] B4 · en cuánto se suelta del aire la mota (aparece la que estaba debajo del piso) y en cuánto vuelve a él (s). */
  fundido: { entraS: 2.5, saleS: 1.5 },
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
 * [ESCENA 7] T7 · la perturbación del flujo alrededor del logo (la misma cuenta que `alrededorDelLogo` en
 * el shader): con el aire `aire`, en un punto a `d` de la cara, con normal `n`. Pura, para el invariante.
 */
export function flujoAlrededor(aire: readonly [number, number, number], n: readonly [number, number, number], d: number): [number, number, number] {
  const r = FISICA.obstaculo.radio
  const s = (r / (r + Math.max(d, 0))) ** 3
  const entra = aire[0] * n[0] + aire[1] * n[1] + aire[2] * n[2]
  return [0, 1, 2].map((k) => (-entra * n[k] + 0.5 * (aire[k] - entra * n[k])) * s) as [number, number, number]
}

/**
 * El `DISTANCIA_AL_LOGO_GLSL` más la cara del logo con espesor real, en las formas de siempre. Pide `uLogoC`,
 * `uLogoP` y `uLogoPalo` declarados. [ESCENA 7] El piso vivo la usa para que ningún bloque toque al logo (una forma
 * que lo envuelve alcanza). [CALIDAD 1] A3: la física ya no (el flujo va con la malla real).
 */
export const CARAS_DEL_LOGO_GLSL = /* glsl */ `
// El logo con su espesor de verdad: dos anillos extruidos (el trazo y la profundidad de la extrusión)
// y el palo, una caja. Mismas piezas que el obstáculo, en el espacio del grupo del logo.
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
uniform float uMovimiento;
uniform vec3 uVientoDelAire;
uniform mat4 uLogoAntes;
uniform sampler2D uPisoVivo;
uniform vec4 uGrillaDelPiso;
in vec2 vUv;
layout( location = 0 ) out vec4 salida0;
layout( location = 1 ) out vec4 salida1;
${DISTANCIA_AL_LOGO_GLSL}
${CAMPO_DEL_LOGO_GLSL}
${FLUJO_DEL_LOGO_GLSL}

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
	// [ESCENA 7] Sin la holgura: el logo como obstáculo lo hace el aire que lo rodea y el choque (modo 0).
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
	vec3 v = vec3( - radial.y, 0.0, radial.x ) * giro * ( 0.4 + 0.6 * enAltura ) + vec3( 0.0, sube, 0.0 ) + vec3( radial.x, 0.0, radial.y ) * aspira;
	// El frente de la ráfaga: sale del origen y levanta al pasar.
	float frente = exp( - pow( ( r - ${POSARSE.velocidad.toFixed(1)} * a ) / ${FISICA.remolino.frente.toFixed(2)}, 2.0 ) ) * exp( - a / 1.5 );
	v += ( vec3( radial.x, 0.0, radial.y ) * 1.2 + vec3( 0.0, 3.0, 0.0 ) ) * frente;
	return v;
}

// [ESCENA 7] T7 · el aire que rodea al logo: la perturbación de un flujo potencial alrededor de la forma
// (lo que entra a la superficie se anula; lo que pasa de costado, se acelera). Cae con la distancia.
// [CALIDAD 1] A3: la forma es la malla real (su campo del flujo): el aire pasa por la boca de la «c» y el ojo de la «p».
vec3 alrededorDelLogo( vec3 p, vec3 aire ) {
	vec3 q = ( uLogoInverso * vec4( p, 1.0 ) ).xyz;
	float d = flujoDelLogo( q );
	if ( d > ${(FISICA.obstaculo.radio * 4).toFixed(2)} ) return vec3( 0.0 );
	vec3 n = normalize( mat3( uLogo ) * normalDelFlujo( q ) );
	float s = pow( ${FISICA.obstaculo.radio.toFixed(2)} / ( ${FISICA.obstaculo.radio.toFixed(2)} + max( d, 0.0 ) ), 3.0 );
	float entra = dot( aire, n );
	return ( - entra * n + 0.5 * ( aire - entra * n ) ) * s;
}

// [ESCENA 8] T5: la velocidad de la superficie del logo en p (el punto del logo que está ahí, este cuadro y el anterior).
vec3 velocidadDelLogo( vec3 p ) {
	if ( uDt <= 0.0 ) return vec3( 0.0 );
	vec3 q = ( uLogoInverso * vec4( p, 1.0 ) ).xyz;
	return ( p - ( uLogoAntes * vec4( q, 1.0 ) ).xyz ) / uDt;
}


// Choca con el logo (la malla real, T5): afuera de su cara, sin velocidad hacia adentro de la superficie (que
// también se mueve). Devuelve la normal (0 si no tocó).
vec3 chocar( inout vec3 p, inout vec3 v ) {
	vec3 q = ( uLogoInverso * vec4( p, 1.0 ) ).xyz;
	float d = campoDelLogo( q );
	if ( d >= ${FISICA.logo.radio.toFixed(3)} ) return vec3( 0.0 );
	vec3 n = normalize( mat3( uLogo ) * normalDelCampo( q ) );
	p += n * ( ${FISICA.logo.radio.toFixed(3)} - d );
	v -= n * min( 0.0, dot( v - velocidadDelLogo( p ), n ) );
	return n;
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
			// El aire corre (6a) y la mota, con él: su velocidad es la del aire más v. Cerca del logo el aire
			// lo rodea (T7), y la mota se acerca a ese flujo con su arrastre (su inercia).
			vec3 d = e0.xyz;
			vec3 viento = vientoDelDespertar( p ) + alrededorDelLogo( p, uVientoDelAire );
			const float LAMBDA_DEL_AIRE = ${(1 / FISICA.aire.arrastre + FISICA.aire.amortigua).toFixed(4)};
			d += relajar( v, ( viento / ${FISICA.aire.arrastre.toFixed(2)} - ${FISICA.aire.rigidez.toFixed(2)} * d ) / LAMBDA_DEL_AIRE, LAMBDA_DEL_AIRE, dt );
			// Si igual llega a la cara del logo (la malla real, T5), se corre por la cara: sin lo que entra (con la
			// velocidad relativa a la superficie) y sin rebote. [CALIDAD 1] A3: ya no se pega.
			vec3 q = ( uLogoInverso * vec4( f + d, 1.0 ) ).xyz;
			float cara = campoDelLogo( q );
			if ( cara < ${FISICA.contacto.detecta.toFixed(2)} ) {
				vec3 n = normalize( mat3( uLogo ) * normalDelCampo( q ) );
				float entra = - dot( uVientoDelAire + v - velocidadDelLogo( f + d ), n );
				d = f + d + n * ( ${FISICA.contacto.queda.toFixed(3)} - cara ) - f;
				v += n * max( 0.0, entra );
			}
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
			p += relajar( v, objetivo, ${(1 / FISICA.caida.arrastre).toFixed(4)}, dt );
			vec3 n = chocar( p, v );
			if ( n.y > ${FISICA.logo.cara.toFixed(2)} ) {
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
		if ( despierta ) { modo = 5.0; desde = uReloj; }
		else if ( uMovimiento > ${FISICA.resbala.toFixed(2)} ) { modo = 4.0; v = vec3( 0.0 ); }
		else { salida0 = vec4( e0.xyz, modoConPeso( 3.0, peso, dt ) ); salida1 = vec4( 0.0, 0.0, 0.0, desde ); return; }
	}
	if ( modo > 3.5 && modo < 4.5 ) {
		if ( despierta ) { modo = 5.0; desde = uReloj; }
		else {
			// Deslizando: la gravedad a lo largo de la cara, con roce; al dejar la cara, cae.
			vec3 q = ( uLogoInverso * vec4( p, 1.0 ) ).xyz;
			vec3 n = normalize( mat3( uLogo ) * normalDelCampo( q ) );
			vec3 g = vec3( 0.0, - ${FISICA.logo.gravedad.toFixed(2)}, 0.0 );
			p += relajar( v, ( g - n * dot( g, n ) ) / ${FISICA.logo.roce.toFixed(2)}, ${FISICA.logo.roce.toFixed(2)}, dt );
			chocar( p, v );
			float lejos = campoDelLogo( ( uLogoInverso * vec4( p, 1.0 ) ).xyz );
			salida0 = vec4( p, modoConPeso( lejos > ${FISICA.logo.suelta.toFixed(2)} ? 1.0 : 4.0, peso, dt ) );
			salida1 = vec4( v, desde );
			return;
		}
	}
	// Levantada: en el viento del despertar y el del aire (que rodea al logo), con arrastre y poca gravedad;
	// pasado el soplo, el aire la lleva.
	vec3 viento = vientoDelDespertar( p ) + uVientoDelAire + alrededorDelLogo( p, uVientoDelAire ) + turbulencia( p );
	p += relajar( v, viento + vec3( 0.0, - ${FISICA.soplo.gravedad.toFixed(2)}, 0.0 ), ${(1 / FISICA.soplo.arrastre).toFixed(4)}, dt );
	// [CALIDAD 1] A3: la levantada que choca se corre por la cara (ya no se pega).
	chocar( p, v );
	if ( p.y < piso ) { p.y = piso; v.y = max( v.y, 0.0 ); }
	// [CALIDAD 1] B4 · vuelve al aire sólo si su lugar está lejos de las caras de la caja: ahí el aire la dibuja entera y
	// no hay salto; mientras tanto sigue suelta (cae despacio).
	if ( uReloj - desde > ${FISICA.soplo.s.toFixed(2)} + azar * ${FISICA.soplo.azar.toFixed(2)} && bordeDeF < ${(1 - POLVO_PAREJO.fundido).toFixed(3)} ) {
		salida0 = vec4( p - f, modoConPeso( 0.0, peso, dt ) );
		salida1 = vec4( v, desde );
		return;
	}
	salida0 = vec4( p, modoConPeso( 5.0, peso, dt ) );
	salida1 = vec4( v, desde );
}
`

/**
 * En el material de la mota: después del volumen y del obstáculo (que dejan en `transformed` la mota
 * del producto), la posición de la simulación. En el aire, la del producto más `D`; en los otros
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
