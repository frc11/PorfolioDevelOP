import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { ANCLAS_DEL_DIBUJO } from '../piso/ondaDirigida'
import { HUECO } from './hueco'

/**
 * [CIERRE] 3 · EL FINAL EN EL PISO VIVO — lo que el final le suma al piso, inyectado al armarlo (como la onda dirigida de
 * INTERFAZ 2): sin final todo vale cero y el piso es exactamente el de siempre.
 *
 *   · EL GOLPE (`uGolpe`): cuando el logo se encastra, un anillo fuerte que nace en él y corre por el piso (en la ecuación
 *     de ondas: el piso se levanta con su física, se refleja y se amortigua). [2E] Lo dibuja el resplandor de las juntas.
 *   · [EL ENCASTRE] 2F · EL PISO BAJO EL MOUSE (`uRastro`; reemplaza al piso que vibraba y al círculo oscuro de CIERRE,
 *     que se leía como una sombra que seguía al mouse): por donde pasa el mouse queda un rastro de puntos que se apagan
 *     con inercia (`rastro.ts`); en la simulación, levanta un poco los bloques; en el dibujo, por las rendijas que se
 *     abren (un bloque más alto que su vecino) sale el resplandor de abajo, con la forma de las juntas. Con el poder.
 *     [RETOQUE DEL ENCASTRE] 1E · ese resplandor era de tinta (oscuro, denso): ahora es LUZ (`LUZ_EN_EL_PISO`).
 *
 * [EL ENCASTRE] 2D · EL HUECO EXACTO (`hueco.ts`): el piso descarta sus tapas y costados donde la máscara del logo
 * acostado dice «adentro» (`uHueco`, en el plano del logo: (x, −z)) y su campo ancho pasa el umbral de la apertura
 * (`uApertura`: se abre desde el medio de los trazos hacia el borde exacto); el borde del corte se oscurece apenas (el
 * labio del pozo). Alrededor del logo el mar se calma (`uCalmaDelFinal`, en la simulación: el piso queda al ras) y el
 * techo que lo esquivaba se apaga (el logo entra en el piso). La mancha de contacto se va con la cámara (`uSinMancha`).
 * [RETOQUE DEL ENCASTRE] 1B · el labio, apenas (el hueco es del tono del piso) y se va al quedar al ras; 1C · el piso
 * calmo queda `HUECO.bajoElRas` debajo de la cara del logo al ras (sin contorno: `hueco.ts`).
 *
 * [EL ENCASTRE] 2E · EL PODER: cuando el logo queda al ras, desde las JUNTAS de los bloques alrededor del logo sale un
 * resplandor (`uPoder`), vivo (fluye y respira con un ruido lento) y más fuerte cerca del logo. El golpe es su pulso: el
 * frente corre por el piso con su física y enciende las juntas por donde pasa. [RETOQUE DEL ENCASTRE] 1F · ese resplandor
 * era de tinta: ahora es la luz de abajo (`LUZ_EN_EL_PISO`), más tenue que bajo el mouse, y el piso entero queda
 * energizado: las ondas y el mar dejan escapar la luz por las rendijas que abren al pasar.
 */
export const GOLPE_EN_EL_PISO = {
  /**
   * [NOCTURNO FINAL] B1 · LA SÚPER ONDA: la del encastre y la de la llegada del logo al cargar (`intro/caida.ts`),
   * mucho más grande que las de siempre (que se note): más lejos, más fuerte, más ancha y más larga. Antes: 1,7 s, 32 u,
   * 70 y 1,3 u (apenas más que un principal del pulso).
   */
  duracionS: 2.6,
  /** Hasta dónde llega el frente (u), su empuje y su ancho (u). */
  alcance: 58,
  fuerza: 120,
  ancho: 2.1,
  /**
   * Cuánto más alta se dibuja mientras dura (u): el piso dibuja sus ondas con un tope suave (`tanh`, 0,42 u: «llamativa,
   * no invasiva»), y con ese tope la súper onda no podía verse más alta que una de siempre.
   */
  masAlta: 1,
} as const

/**
 * [EL ENCASTRE] 2F · EL RASTRO DEL MOUSE en el piso: cuántos puntos, cada cuánto se agrega uno (u), en cuánto se apaga
 * (s: la inercia), su radio (u), cuánto levanta los bloques (u) y con qué fuerza los lleva (como la loma del cursor).
 */
export const RASTRO_EN_EL_PISO = { puntos: 8, cada: 0.55, apagaS: 0.9, radio: 1.7, alto: 0.3, rigidez: 120 } as const

/**
 * [EL ENCASTRE] 2D · el mar calmo alrededor del logo; y cuánto oscurece el labio.
 * [NOCTURNO FINAL] B3 · EL CÍRCULO ESTABLE (antes, una elipse angosta en la caja del logo, que sólo ocultaba el dibujo: el
 * mar seguía debajo y en el borde, en dos bloques y medio, el piso pasaba de las olas a cero: un rectángulo hundido en
 * escalones, que el golpe dejaba bien a la vista). Ahora es un CÍRCULO alrededor del centro del logo: entero hasta `radio`
 * (u: el logo y un margen) y con un borde ancho y suave (`borde`, u: cinco bloques), sin escalones; y es de verdad quieto:
 * adentro los bloques se asientan (la onda se amortigua, `amortigua` 1/s más) y no reaccionan al mouse, al pulso, al golpe
 * ni a las ondas (sus empujes se apagan con la calma). El orden en medio del caos.
 */
export const CALMA_EN_EL_PISO = { radio: 4.2, borde: 4, amortigua: 30, labio: 0.1 } as const

/**
 * [PULIDO 1] P1 · EL BRILLO DEL PISO: SECTORES BLANCOS QUE NACEN Y MUEREN (reemplaza al piso volcán de NOCTURNO FINAL B2: sus
 * focos naranjas al azar, que se leían como círculos rojos). Después del encastre (con el poder), una o dos ZONAS del piso vivo
 * se prenden en blanco, cada bloque entero (la zona se mide en el centro del bloque: cuantizada al bloque). Cada zona es
 * mayormente contigua y orgánica: la distancia a su centro, deformada por un ruido, contra un borde que crece con su vida
 * (sin damero, sin grilla regular, sin círculos perfectos). Su ciclo: NACE desde el centro (`nace`, s), VIVE respirando y
 * desplazándose apenas (`vive`, `respira`, `deriva`), MUERE achicándose (`muere`) y otra aparece «de la nada» en otro lugar de
 * lo que se ve (`uAlcanceDelBrillo`, fuera del mar calmo). Cada zona va con su reloj (`periodo`, más largo que su vida: queda un
 * hueco), desfasadas: nunca más de dos a la vez. Todo en el sombreador del piso, con una semilla fija (`semilla`). La intensidad
 * con `?brillo=suave|fuerte` (el producto, `medio`): cuánto blanco, cuánto halo en el borde y cuánto se oscurece la sala.
 */
export const BRILLO_EN_EL_PISO = {
  zonas: 2,
  periodo: [10.8, 12.4],
  desfase: 0.47,
  nace: [1.5, 3],
  vive: [3, 5],
  muere: [1.5, 2.5],
  radio: [3, 4.6],
  deriva: 0.16,
  respira: { amplitud: 0.08, periodoS: 3.2 },
  irregular: 0.55,
  ruido: 0.6,
  suave: 0.22,
  semilla: 17.31,
  /** Con movimiento reducido el brillo queda quieto en este instante de su reloj (una zona viva). */
  quietoEn: 10.5,
  /** Cuánto más allá del círculo calmo puede empezar (u, sobre la mitad de su borde). */
  margen: 1,
  intensidad: { suave: { blanco: 0.7, halo: 0 }, medio: { blanco: 0.9, halo: 0.22 }, fuerte: { blanco: 1, halo: 0.38 } },
  /** Cuánto se oscurece el piso mientras corre (10 a 15 % de lo que se ve, parejo), para que el blanco se lea. */
  oscurece: { suave: 0.1, medio: 0.12, fuerte: 0.15 },
} as const

/** [PULIDO 1] P1 · la intensidad pedida (`?brillo=`; el producto, `medio`). */
export type IntensidadDelBrillo = keyof typeof BRILLO_EN_EL_PISO.intensidad

/** [PULIDO 1] P1 · la de esta carga: la prueba, o `medio`. */
export function intensidadDelBrillo(): IntensidadDelBrillo {
  const pedida = entornoDeLaEscena().pruebas.brillo
  return pedida === 'no' ? 'medio' : pedida
}

/** [PULIDO 1] P1 · sólo para el banco: el brillo apagado (para medir su costo por diferencia, en el mismo cuadro). */
export const BRILLO_DEL_BANCO = { apagado: false }

/** Los uniformes del final en el piso: los comparten la simulación y el dibujo; los escribe `FinalDelPie`. */
export const FINAL_EN_EL_PISO = {
  /** nace (reloj de la escena), x, z (u), fuerza (0: ninguno). */
  uGolpe: { value: new THREE.Vector4(0, 0, 0, 0) },
  /** [EL ENCASTRE] 2F · el rastro del mouse: x, z (u) y cuánto vale cada punto (0: apagado). */
  uRastro: { value: Array.from({ length: RASTRO_EN_EL_PISO.puntos }, () => new THREE.Vector4(9999, 9999, 0, 0)) },
  /** [EL ENCASTRE] 2D · la máscara del logo acostado (R: la forma; G: el campo ancho) y su marco en el plano del logo. */
  uHueco: { value: null as THREE.Texture | null },
  uMarcoDelHueco: { value: new THREE.Vector4(0, 0, 1, 1) },
  /** 0 a 1: cuánto se abrió el hueco. */
  uApertura: { value: 0 },
  /** 0 a 1: cuánto se calmó el mar alrededor del logo; la media caja del logo en su plano (u). */
  uCalmaDelFinal: { value: 0 },
  uCajaDelLogo: { value: new THREE.Vector2(2.7, 2.4) },
  /** 0 a 1: cuánto se fue la mancha de contacto (con la cámara que sube). */
  uSinMancha: { value: 0 },
  /** [EL ENCASTRE] 2E · el poder liberado: 0 sin poder, 1 entero (con un destello al liberarse, un poco más). */
  uPoder: { value: 0 },
  /**
   * [PULIDO 1] P1 · lo que se ve del piso alrededor del logo, donde nacen las zonas: el medio ancho y el medio fondo del cuadro
   * (u) y el ángulo de su derecha sobre el piso (rad: la cámara gira en el quieto).
   */
  uAlcanceDelBrillo: { value: new THREE.Vector3(16, 10, 0) },
  /**
   * [PULIDO 1] P1 · cuánto se oscurece el piso entero mientras corre el brillo (0 a `oscurece`): en el color que se ve, porque
   * el tono de ACES aplasta los blancos (con la luz de la sala 12 % más baja el piso seguía en 0,96 de luminancia).
   */
  uOscuroDelBrillo: { value: 0 },
  /** [PULIDO 1] P1 · cuánto blanco y cuánto halo (`?brillo=`), y si queda quieto (movimiento reducido: 1). */
  uBrillo: { value: new THREE.Vector3(BRILLO_EN_EL_PISO.intensidad.medio.blanco, BRILLO_EN_EL_PISO.intensidad.medio.halo, 0) },
}


const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** Dónde entra en la simulación: antes de `main` (las funciones), junto al empuje de la onda dirigida, el dibujo y el techo. */
export const ANCLAS_DEL_FINAL = {
  main: 'void main() {',
  empuje: 'fuerza += empujeDeLaOnda( p, r * uLado );',
  dibujo: 'float dibujo = ( onda + marEn( xz, uTiempo ) ) * enElMar;',
  techo: 'if ( uConLogo > 0.5 ) {',
} as const

const SIMULACION_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform vec4 uRastro[ ${String(RASTRO_EN_EL_PISO.puntos)} ];
uniform float uCalmaDelFinal;
uniform vec2 uCajaDelLogo;
// [NOCTURNO FINAL] B1 · el tope del dibujo de la onda, más alto mientras dura la súper onda.
float topeConElGolpe( float tope ) {
	if ( uGolpe.w <= 0.0 ) return tope;
	float t = ( uTiempo - uGolpe.x ) / ${f(GOLPE_EN_EL_PISO.duracionS)};
	if ( t < 0.0 || t > 1.0 ) return tope;
	return tope + uGolpe.w * ${f(GOLPE_EN_EL_PISO.masAlta)} * pow( 1.0 - t, 1.2 );
}
float empujeDelGolpe( vec2 xz ) {
	if ( uGolpe.w <= 0.0 ) return 0.0;
	float t = ( uTiempo - uGolpe.x ) / ${f(GOLPE_EN_EL_PISO.duracionS)};
	if ( t < 0.0 || t > 1.0 ) return 0.0;
	float frente = 1.5 + ${f(GOLPE_EN_EL_PISO.alcance)} * ( 1.0 - pow( 1.0 - t, 2.2 ) );
	float d = ( length( xz - uGolpe.yz ) - frente ) / ${f(GOLPE_EN_EL_PISO.ancho)};
	return uGolpe.w * ${f(GOLPE_EN_EL_PISO.fuerza)} * exp( - d * d ) * pow( 1.0 - t, 1.5 ) * smoothstep( 0.0, 0.04, t );
}
// [EL ENCASTRE] 2F · el rastro del mouse levanta un poco los bloques (un resorte hacia una loma bajo cada punto).
float empujeDelRastro( vec2 p, float h ) {
	float f = 0.0;
	for ( int i = 0; i < ${String(RASTRO_EN_EL_PISO.puntos)}; i++ ) {
		vec4 q = uRastro[ i ];
		if ( q.z <= 0.0 ) continue;
		vec2 d = p - q.xy / uLado;
		float g = exp( - dot( d, d ) * uLado * uLado / ${f(RASTRO_EN_EL_PISO.radio * RASTRO_EN_EL_PISO.radio)} );
		f += q.z * ${f(RASTRO_EN_EL_PISO.rigidez)} * g * ( ${f(RASTRO_EN_EL_PISO.alto)} * g - h );
	}
	return f;
}
// [EL ENCASTRE] 2D · el mar calmo alrededor de la caja del logo acostado (en su plano: x, −z).
float calmaDelFinal( vec2 xz ) {
	if ( uCalmaDelFinal <= 0.0 ) return 0.0;
	return uCalmaDelFinal * ( 1.0 - smoothstep( ${f(CALMA_EN_EL_PISO.radio)}, ${f(CALMA_EN_EL_PISO.radio + CALMA_EN_EL_PISO.borde)}, length( xz ) ) );
}
`

/** La simulación del piso con el final: el golpe, el rastro del mouse y la calma. */
export function conElFinalEnLaSimulacion(glsl: string): string {
  if (Object.values(ANCLAS_DEL_FINAL).some((ancla) => !glsl.includes(ancla)) || !ONDA_CON_TOPE.test(glsl)) {
    throw new Error('[CIERRE] 3 · la simulación del piso cambió: el final no encuentra dónde entrar')
  }
  return glsl
    .replace(ANCLAS_DEL_FINAL.main, `${SIMULACION_GLSL}${ANCLAS_DEL_FINAL.main}`)
    .replace(
      ANCLAS_DEL_FINAL.empuje,
      `${ANCLAS_DEL_FINAL.empuje}\n\tfuerza += empujeDelGolpe( p * uLado ) + empujeDelRastro( p, h );\n\tfloat calmaAqui = calmaDelFinal( p * uLado );\n\tfuerza *= 1.0 - calmaAqui;\n\tamortigua += ${f(CALMA_EN_EL_PISO.amortigua)} * calmaAqui;`,
    )
    .replace(ANCLAS_DEL_FINAL.dibujo, `${ANCLAS_DEL_FINAL.dibujo}\n\tdibujo *= 1.0 - calmaDelFinal( xz );\n\tdibujo -= ${f(HUECO.bajoElRas)} * calmaDelFinal( xz );`)
    .replace(ANCLAS_DEL_FINAL.techo, 'if ( uConLogo > 0.5 && uCalmaDelFinal <= 0.0 ) {')
    .replace(ONDA_CON_TOPE, 'float topeDeLaOnda = topeConElGolpe( $1 );\n\tfloat onda = topeDeLaOnda * tanh( nueva / topeDeLaOnda );')
}

/** [NOCTURNO FINAL] B1 · el dibujo de la onda con su tope suave (el número es el de `PISO_VIVO.onda.tope`). */
const ONDA_CON_TOPE = /float onda = ([0-9.]+) \* tanh\( nueva \/ \1 \);/

const DIBUJO_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform sampler2D uHueco;
uniform vec4 uMarcoDelHueco;
uniform float uApertura;
uniform float uSinMancha;
uniform vec2 uCajaDelLogo;
// [EL ENCASTRE] 2E · el poder liberado (0 sin poder, 1 entero; en el destello, un poco más).
uniform float uPoder;
// [RETOQUE DEL ENCASTRE] 1F · fuera del mar calmo alrededor del logo: su borde son escalones del mar contra el piso quieto
// y, encendidos, dibujaban un marco de bloques alrededor del logo.
uniform float uCalmaDelFinal;
float fueraDeLaCalma( vec2 xz ) {
	if ( uCalmaDelFinal <= 0.0 ) return 1.0;
	return mix( 1.0, smoothstep( ${f(CALMA_EN_EL_PISO.radio + 0.5 * CALMA_EN_EL_PISO.borde)}, ${f(CALMA_EN_EL_PISO.radio + CALMA_EN_EL_PISO.borde + BRILLO_EN_EL_PISO.margen)}, length( xz ) ), uCalmaDelFinal );
}
// [PULIDO 1] P1 · EL BRILLO DEL PISO (BRILLO_EN_EL_PISO): una o dos zonas blancas, orgánicas, cuantizadas al bloque.
uniform vec3 uAlcanceDelBrillo;
uniform vec3 uBrillo;
uniform float uOscuroDelBrillo;
float azarDelBrillo( vec2 p ) {
	vec3 q = fract( vec3( p.xyx ) * 0.1031 );
	q += dot( q, q.yzx + 33.33 );
	return fract( ( q.x + q.y ) * q.z );
}
float ruidoDelBrillo( vec2 p ) {
	vec2 i = floor( p );
	vec2 u = fract( p );
	u = u * u * ( 3.0 - 2.0 * u );
	return mix( mix( azarDelBrillo( i ), azarDelBrillo( i + vec2( 1.0, 0.0 ) ), u.x ), mix( azarDelBrillo( i + vec2( 0.0, 1.0 ) ), azarDelBrillo( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}
// Una zona (k: su número) en el bloque de centro b, a los t s: x, cuánto se prende el bloque; y, el halo de su borde.
vec2 zonaDelBrillo( vec2 b, float k, float t ) {
	float periodo = ${f(BRILLO_EN_EL_PISO.periodo[0])} + ${f(BRILLO_EN_EL_PISO.periodo[1] - BRILLO_EN_EL_PISO.periodo[0])} * azarDelBrillo( vec2( k, 7.3 ) );
	float tz = t + ( k * ${f(BRILLO_EN_EL_PISO.desfase)} ) * periodo + ${f(BRILLO_EN_EL_PISO.semilla)};
	float n = floor( tz / periodo );
	float tau = tz - n * periodo;
	vec2 s = vec2( n, k * 13.1 + 0.7 );
	float nace = ${f(BRILLO_EN_EL_PISO.nace[0])} + ${f(BRILLO_EN_EL_PISO.nace[1] - BRILLO_EN_EL_PISO.nace[0])} * azarDelBrillo( s + 1.1 );
	float vive = ${f(BRILLO_EN_EL_PISO.vive[0])} + ${f(BRILLO_EN_EL_PISO.vive[1] - BRILLO_EN_EL_PISO.vive[0])} * azarDelBrillo( s + 2.3 );
	float muere = ${f(BRILLO_EN_EL_PISO.muere[0])} + ${f(BRILLO_EN_EL_PISO.muere[1] - BRILLO_EN_EL_PISO.muere[0])} * azarDelBrillo( s + 3.7 );
	// La vida: nace (0 a 1), vive (1), muere (1 a 0) y queda un hueco hasta el próximo período.
	float vida = smoothstep( 0.0, nace, tau ) * ( 1.0 - smoothstep( nace + vive, nace + vive + muere, tau ) );
	if ( vida <= 0.0 ) return vec2( 0.0 );
	// El lugar: en lo que se ve, fuera del mar calmo; y se desplaza apenas mientras vive.
	// En otro lugar que la anterior: el ángulo avanza 0,382 de vuelta por ciclo (la razón áurea) más un desvío (a lo sumo un cuarto).
	float a = 6.2831853 * fract( azarDelBrillo( vec2( k, 3.9 ) ) + n * 0.381966 + 0.25 * azarDelBrillo( s + 4.9 ) );
	vec2 e = vec2( cos( a ) * uAlcanceDelBrillo.x, sin( a ) * uAlcanceDelBrillo.y ) * ( 0.5 + 0.4 * azarDelBrillo( s + 5.3 ) );
	float cg = cos( uAlcanceDelBrillo.z );
	float sg = sin( uAlcanceDelBrillo.z );
	vec2 c = vec2( e.x * cg - e.y * sg, e.x * sg + e.y * cg );
	float minimo = ${f(CALMA_EN_EL_PISO.radio + 0.5 * CALMA_EN_EL_PISO.borde + BRILLO_EN_EL_PISO.margen + BRILLO_EN_EL_PISO.radio[0])};
	float lejos = length( c );
	if ( lejos < minimo ) c *= minimo / max( 0.001, lejos );
	float da = 6.2831853 * azarDelBrillo( s + 6.1 );
	c += vec2( cos( da ), sin( da ) ) * ${f(BRILLO_EN_EL_PISO.deriva)} * tau;
	float radio = ( ${f(BRILLO_EN_EL_PISO.radio[0])} + ${f(BRILLO_EN_EL_PISO.radio[1] - BRILLO_EN_EL_PISO.radio[0])} * azarDelBrillo( s + 7.7 ) ) * ( 1.0 + ${f(BRILLO_EN_EL_PISO.respira.amplitud)} * sin( 6.2831853 * tau / ${f(BRILLO_EN_EL_PISO.respira.periodoS)} ) );
	// La forma: la distancia deformada por el ruido (orgánica, no un círculo) contra un borde que crece con la vida. Lejos de
	// todo borde posible (ni el ruido ni el halo llegan), nada: la mayoría del piso no paga el ruido.
	float lejosDelCentro = length( b - c ) / radio;
	if ( lejosDelCentro > vida + 0.45 + ${f(0.5 * BRILLO_EN_EL_PISO.irregular)} ) return vec2( 0.0 );
	float d = lejosDelCentro + ${f(BRILLO_EN_EL_PISO.irregular)} * ( ruidoDelBrillo( b * ${f(BRILLO_EN_EL_PISO.ruido)} + s * 3.1 ) - 0.5 );
	float prendido = 1.0 - smoothstep( vida - ${f(BRILLO_EN_EL_PISO.suave)}, vida, d );
	float halo = ( 1.0 - smoothstep( vida, vida + 0.45, d ) ) * ( 1.0 - prendido ) * vida;
	return vec2( prendido * min( 1.0, vida * 2.0 ), halo );
}
// El brillo en este fragmento: el de su bloque (el centro del bloque: cada uno se prende entero), el mayor de las zonas.
vec3 conElBrillo( vec3 color, float energia ) {
	vec2 b = vPiso.xz - ( vEnElBloque - 0.5 ) * uLado;
	float t = mix( uTiempo, ${f(BRILLO_EN_EL_PISO.quietoEn)}, uBrillo.z );
	vec2 z = max( zonaDelBrillo( b, 0.0, t ), zonaDelBrillo( b, 1.0, t ) ) * energia;
	float k = clamp( z.x * uBrillo.x + z.y * uBrillo.y, 0.0, 1.0 );
	// La tapa se prende blanca; el costado, un poco menos (el bloque sigue leyéndose como un bloque).
	return mix( color, vec3( mix( 0.9, 1.0, vTapa ) ), k );
}
vec3 conLasJuntas( vec3 color, vec2 xz ) {
	// Con el poder liberado (después del encastre; en el destello, un poco más) y fuera del mar calmo.
	float energia = min( 1.0, uPoder ) * fueraDeLaCalma( xz );
	if ( energia <= 0.0 ) return color;
	return conElBrillo( color, energia );
}
// [EL ENCASTRE] 2D · la máscara del logo acostado en este punto del piso: R, la forma; G, el campo ancho.
vec2 mascaraDelHueco( vec2 xz ) {
	vec2 uv = ( vec2( xz.x, - xz.y ) - uMarcoDelHueco.xy ) / uMarcoDelHueco.zw;
	if ( any( lessThan( uv, vec2( 0.0 ) ) ) || any( greaterThan( uv, vec2( 1.0 ) ) ) ) return vec2( 0.0 );
	return texture2D( uHueco, uv ).rg;
}
bool enElHueco( vec2 xz ) {
	if ( uApertura <= 0.0 ) return false;
	vec2 m = mascaraDelHueco( xz );
	return m.r > 0.5 && m.g > ( 1.0 - uApertura ) * 0.95;
}
float labioDelHueco( vec2 xz ) {
	if ( uApertura <= 0.0 ) return 0.0;
	vec2 m = mascaraDelHueco( xz );
	return uApertura * ( 1.0 - min( 1.0, uPoder ) ) * smoothstep( 0.12, 0.45, m.g ) * ( 1.0 - smoothstep( 0.3, 0.6, m.r ) );
}
`

/** Las anclas del dibujo del piso que el final usa además de la de la onda: el arranque de `main`, la mancha y la niebla. */
export const ANCLAS_DEL_HUECO = {
  descarte: '#include <clipping_planes_fragment>',
  mancha: 'vec2 m = manchaDelContacto( vPiso.xz );',
  niebla: '#include <fog_fragment>',
} as const

/** El dibujo del piso con el final: el hueco, su labio, el resplandor de las juntas (el poder, el pulso, el rastro) y la mancha que se va. */
export function conElFinalEnElPiso<T extends THREE.Material>(material: T): T {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${clavePrevia()}|final-del-pie`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    const anclas = [ANCLAS_DEL_DIBUJO.funcion, ...Object.values(ANCLAS_DEL_HUECO)]
    if (anclas.some((ancla) => !shader.fragmentShader.includes(ancla))) {
      throw new Error('[CIERRE] 3 · el dibujo del piso cambió: el final no encuentra dónde entrar')
    }
    Object.assign(shader.uniforms, FINAL_EN_EL_PISO)
    shader.fragmentShader = shader.fragmentShader
      .replace(ANCLAS_DEL_DIBUJO.funcion, `${DIBUJO_GLSL}${ANCLAS_DEL_DIBUJO.funcion}`)
      .replace(ANCLAS_DEL_HUECO.descarte, `${ANCLAS_DEL_HUECO.descarte}\n\tif ( enElHueco( vPiso.xz ) ) discard;`)
      .replace(ANCLAS_DEL_HUECO.mancha, 'vec2 m = manchaDelContacto( vPiso.xz ) * ( 1.0 - uSinMancha );')
      .replace(ANCLAS_DEL_HUECO.niebla, `gl_FragColor.rgb *= 1.0 - ${f(CALMA_EN_EL_PISO.labio)} * labioDelHueco( vPiso.xz );\n\tgl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;\n\tgl_FragColor.rgb = conLasJuntas( gl_FragColor.rgb, vPiso.xz );\n${ANCLAS_DEL_HUECO.niebla}`)
  }
  return material
}
