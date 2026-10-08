import * as THREE from 'three'

import { PISO_VIVO } from '../piso/bloques'

/**
 * [PULIDO 2] 4 · LA LUZ QUE SALE DE ABAJO, POR LAS JUNTAS (las referencias del humano: bloques grises con luz blanca que se
 * escapa por las rendijas). Donde hay energía, los bloques quedan a alturas distintas y se separan un poco; por las rendijas
 * se ve un plano que brilla debajo del piso (falso y local, sin bloom), las caras de los costados reciben la luz desde su base
 * y los cantos la atrapan. Las TAPAS no se ponen blancas.
 *
 * [PULIDO 3] A1 · DE UN SECTOR A TODA LA ESCENA («como si después de que se incruste el logo se volvió el caos y está a punto
 * de explotar todo por una sobrecarga de energía»). Ya no hay zonas que nacen y mueren: la energía de cada bloque la decide un
 * CAMPO de ruido continuo con domain warping que fluye en el tiempo (las zonas calientes viajan por todo el piso y nunca se
 * apaga: ~80 % de las juntas con algo de luz). Arranca en el golpe del logo y se expande desde el hueco (`expansionDeLaLuz`,
 * función de `fin`: al rebobinar se retira con la curva de P2); cada onda del logo pasa como un frente que la sube. El campo
 * se calcula UNA vez por bloque, en la simulación del piso (el canal libre de su textura: `ENERGIA_EN_LA_SIMULACION`); el
 * vértice (las rendijas), el dibujo (costados y cantos) y el plano de abajo lo leen de ahí.
 */
export const LUZ_DE_ABAJO = {
  /** El campo: escala del ruido (1/u), cuánto lo tuerce el domain warping, cuánto cambia la torsión (1/s) y su deriva (u/s). */
  campo: { escala: 0.11, tuerce: 2.2, cambia: 0.09, deriva: [0.55, -0.35] },
  /** Desde qué valor del campo hay luz y desde cuál es entera (la cobertura: `COBERTURA_DE_LA_LUZ`). */
  umbral: [0.375, 0.72],
  /** La expansión desde el hueco en el golpe: hasta dónde llega (u) y el ancho de su frente (u, que brilla al pasar). */
  expansion: { hasta: 36, frente: 3.2, brillo: 0.7 },
  /**
   * Las ondas del logo: cuánto suben la energía en su frente y su ancho (u). Durante el final el logo no larga los anillos del
   * pulso (NOCTURNO FINAL B3: cruzaban el círculo quieto), así que larga los suyos sólo en la energía: uno cada `cadaS`, desde
   * el borde del mar calmo (`desde`, u) a `velocidad` u/s; más el golpe (y los anillos del pulso, si los hubiera).
   */
  ondas: { sube: 0.8, ancho: 1.8, cadaS: 3.2, velocidad: 12, desde: 7 },
  /** Cuánto más allá del círculo calmo del logo puede empezar (u). */
  margen: 1,
  /** Los bloques con energía: cuánto se separan (fracción del lado, por costado) y cuánto cambian de alto (u, de −a a +b). */
  separa: 0.045,
  alturas: [-0.12, 0.42],
  /** La luz: la del plano de abajo (por las rendijas), la de los costados desde su base (y su caída, u) y la de los cantos. */
  plano: 1.6,
  costado: 1.15,
  caeEn: 0.32,
  canto: 0.32,
  /** Cuánto más en sombra queda la tapa de un bloque con energía (la luz viene de abajo: la tapa no se blanquea). */
  sombraDeLaTapa: 0.12,
  /** Cuánto varía la luz de una junta a otra (fracción) y a qué escala (1/u): no todas las rendijas brillan igual. */
  varia: 0.65,
  variaCada: 0.85,
  /** Cuánto varía la separación de un bloque a otro (fracción de `separa`): las rendijas no son todas del mismo ancho. */
  variaLaSeparacion: 0.55,
  /** Cuánto se oscurece la sala con la energía extendida (en el color que se ve). */
  oscurece: 0.38,
  /**
   * LA MANCHA NEGRA: con energía, ninguna tapa baja hasta el plano de abajo (la súper onda dibujaba valles de ~1,4 u, más
   * hondos que el pie de los bloques): las tapas se frenan con un piso blando que empieza en `desde` y no pasa de `hasta` (u).
   */
  fondo: { desde: -0.45, hasta: -0.53 },
} as const

/** [PULIDO 3] A1 · las variantes (`?energia=`): `sobrecarga` es el producto (sin bandera). */
export type VarianteDeLaEnergia = 'sobrecarga' | 'red' | 'inestable'

/** La variante de la bandera (`no`: la sobrecarga). */
export function varianteDeLaEnergia(pedida: 'red' | 'inestable' | 'no'): VarianteDeLaEnergia {
  return pedida === 'no' ? 'sobrecarga' : pedida
}

/** `red`: las corrientes por las juntas (cada cuántos bloques hay una fuente, su velocidad en bloques/s, el largo del trazo). */
export const RED_DE_LA_LUZ = { cada: 9, velocidad: 6, trazo: 0.22, conduce: 0.45, fuerza: 1.4, anillo: 1.2 } as const

/** Con movimiento reducido, el campo quieto en este instante de su reloj (s). */
export const CAMPO_QUIETO_EN = 23

/** `inestable`: el temblor (u), los picos (cada racimo de bloques, su ciclo en s, cuántos, cuánto levantan y cuánto duran). */
export const INESTABLE = { temblor: 0.035, racimo: 3, cicloS: 1.3, cuantos: 0.012, levanta: 0.6, duraS: 0.42, rim: 0.9 } as const

const suave = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const fract = (x: number): number => x - Math.floor(x)

/** El azar de un punto (el mismo que el sombreador: `azarDeLaLuz`). */
export function azarDeLaLuz(x: number, y: number): number {
  let qx = fract(x * 0.1031)
  let qy = fract(y * 0.1031)
  let qz = fract(x * 0.1031)
  const d = qx * (qy + 33.33) + qy * (qz + 33.33) + qz * (qx + 33.33)
  qx += d
  qy += d
  qz += d
  return fract((qx + qy) * qz)
}

function ruido(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  let ux = x - ix
  let uy = y - iy
  ux = ux * ux * (3 - 2 * ux)
  uy = uy * uy * (3 - 2 * uy)
  const a = azarDeLaLuz(ix, iy) + (azarDeLaLuz(ix + 1, iy) - azarDeLaLuz(ix, iy)) * ux
  const b = azarDeLaLuz(ix, iy + 1) + (azarDeLaLuz(ix + 1, iy + 1) - azarDeLaLuz(ix, iy + 1)) * ux
  return a + (b - a) * uy
}

function fbm(x: number, y: number): number {
  let s = 0
  let a = 0.5
  for (let i = 0; i < 3; i += 1) {
    s += a * ruido(x, y)
    x = x * 2.03 + 17.1
    y = y * 2.03 + 17.1
    a *= 0.5
  }
  return s / 0.875
}

/** El campo en (x, z) a los `t` s (0 a 1), la misma cuenta que `campoDeLaLuz` en la simulación. */
export function campoDeLaLuz(x: number, z: number, t: number): number {
  const C = LUZ_DE_ABAJO.campo
  const px = (x + C.deriva[0] * t) * C.escala
  const py = (z + C.deriva[1] * t) * C.escala
  const qx = fbm(px, py + t * C.cambia)
  const qy = fbm(px + 5.2 - t * C.cambia, py + 1.3)
  return fbm(px + C.tuerce * (qx - 0.5), py + C.tuerce * (qy - 0.5))
}

/** La energía de un bloque por el campo (0 a 1), antes de la expansión y las ondas. */
export function energiaDelCampo(campo: number): number {
  return suave(LUZ_DE_ABAJO.umbral[0], LUZ_DE_ABAJO.umbral[1], campo) ** 1.5
}

/** El radio (u) hasta donde llegó la expansión con el progreso `p` (0 a 1): sale del hueco y se asienta al cubrir la escena. */
export function radioDeLaExpansion(p: number, desde: number): number {
  const q = Math.min(1, Math.max(0, p))
  return desde + (LUZ_DE_ABAJO.expansion.hasta - desde) * (1 - (1 - q) ** 1.5)
}

/** [PULIDO 3] A1 · el alto dibujado de una tapa con el piso blando de la luz (u): igual arriba de `fondo.desde`; nunca bajo `fondo.hasta`. */
export function fondoDeLaLuz(alto: number): number {
  const { desde, hasta } = LUZ_DE_ABAJO.fondo
  return alto >= desde ? alto : desde + (hasta - desde) * (1 - Math.exp((alto - desde) / (desde - hasta)))
}

/** Los uniformes de la luz de abajo; los comparten el piso, la simulación, el plano y las chispas. */
export const LUZ_DE_ABAJO_EN_VIVO = {
  /** La energía (el poder del piso, con su inercia: 0 sin poder, 1 entero). */
  uEnergiaDeLaLuz: { value: 0 },
  /** El mar calmo del logo, donde la luz no entra: desde y hasta dónde se apaga (u) y cuánto está calmo (0 a 1). */
  uCalmaDeLaLuz: { value: new THREE.Vector3(0, 1, 0) },
  /** [PULIDO 3] A1 · la expansión desde el hueco: el radio (u) y el progreso (0 a 1). */
  uExpansionDeLaLuz: { value: new THREE.Vector2(0, 0) },
  /** [PULIDO 3] A1 · el reloj del campo (s): el de la escena; quieto con movimiento reducido. */
  uRelojDeLaLuz: { value: 0 },
  /** [PULIDO 3] A1 · lo que se ve del piso: su centro (u) y su radio (u), donde nacen las chispas. */
  uVistaDeLaLuz: { value: new THREE.Vector3(0, 0, 10) },
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** [PULIDO 3] A1 · las ondas que larga el logo en la energía (0 a 1 en su frente, a la distancia r): pide `uRelojDeLaLuz`. */
export const ONDAS_DEL_LOGO_GLSL = /* glsl */ `
uniform float uRelojDeLaLuz;
float ondaDelLogo( float r, float ancho ) {
	float fase = fract( uRelojDeLaLuz / ${f(LUZ_DE_ABAJO.ondas.cadaS)} );
	float d = ( r - ${f(LUZ_DE_ABAJO.ondas.desde)} - fase * ${f(LUZ_DE_ABAJO.ondas.cadaS * LUZ_DE_ABAJO.ondas.velocidad)} ) / ancho;
	return exp( - d * d ) * ( 1.0 - fase );
}
`

/** El azar y el ruido de la luz (los usan la simulación, el dibujo y el plano). */
export const RUIDO_DE_LA_LUZ_GLSL = /* glsl */ `
float azarDeLaLuz( vec2 p ) {
	vec3 q = fract( vec3( p.xyx ) * 0.1031 );
	q += dot( q, q.yzx + 33.33 );
	return fract( ( q.x + q.y ) * q.z );
}
float ruidoDeLaLuz( vec2 p ) {
	vec2 i = floor( p );
	vec2 u = fract( p );
	u = u * u * ( 3.0 - 2.0 * u );
	return mix( mix( azarDeLaLuz( i ), azarDeLaLuz( i + vec2( 1.0, 0.0 ) ), u.x ), mix( azarDeLaLuz( i + vec2( 0.0, 1.0 ) ), azarDeLaLuz( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}
// Cuánta luz se escapa por la junta de este punto (0,35 a 1): no todas las rendijas por igual (un ruido a la escala de unos
// bloques, que se corre despacio: la luz respira).
float brilloDeLaJunta( vec2 xz, float t ) {
	return ${f(1 - LUZ_DE_ABAJO.varia)} + ${f(LUZ_DE_ABAJO.varia)} * ruidoDeLaLuz( xz * ${f(LUZ_DE_ABAJO.variaCada)} + vec2( t * 0.13, - t * 0.09 ) );
}
`

const C = LUZ_DE_ABAJO.campo
const E = LUZ_DE_ABAJO.expansion
const O = LUZ_DE_ABAJO.ondas

/**
 * [PULIDO 3] A1 · LA ENERGÍA EN LA SIMULACIÓN DEL PISO (una vez por bloque y por paso): el campo, la expansión desde el
 * hueco (con su frente que brilla), las ondas del logo (los anillos del pulso, `uAnillos`, y el golpe, `uGolpe`), la energía
 * del poder y el mar calmo. Va al canal libre (`a`) de la textura de alturas. Pide `uTiempo`, `uAnillos` y `uGolpe`.
 */
export const ENERGIA_EN_LA_SIMULACION_GLSL = /* glsl */ `
uniform float uEnergiaDeLaLuz;
uniform vec3 uCalmaDeLaLuz;
uniform vec2 uExpansionDeLaLuz;
${ONDAS_DEL_LOGO_GLSL}
${RUIDO_DE_LA_LUZ_GLSL}
float fbmDeLaLuz( vec2 p ) {
	float s = 0.0;
	float a = 0.5;
	for ( int i = 0; i < 3; i++ ) {
		s += a * ruidoDeLaLuz( p );
		p = p * 2.03 + 17.1;
		a *= 0.5;
	}
	return s / 0.875;
}
// El campo (0 a 1): un ruido torcido por otro (domain warping) que fluye y deriva: las zonas calientes viajan sin parar.
float campoDeLaLuz( vec2 xz, float t ) {
	vec2 p = ( xz + vec2( ${f(C.deriva[0])}, ${f(C.deriva[1])} ) * t ) * ${f(C.escala)};
	vec2 q = vec2( fbmDeLaLuz( p + vec2( 0.0, t * ${f(C.cambia)} ) ), fbmDeLaLuz( p + vec2( 5.2 - t * ${f(C.cambia)}, 1.3 ) ) );
	return fbmDeLaLuz( p + ${f(C.tuerce)} * ( q - 0.5 ) );
}
// El frente de una onda a la distancia r (u): las del logo, los anillos del pulso (nace, dura, alcance, amplitud) y el golpe.
float ondaDeLaLuz( float r ) {
	float s = ondaDelLogo( r, ${f(O.ancho)} );
	for ( int i = 0; i < 4; i++ ) {
		vec4 a = uAnillos[ i ];
		if ( a.w <= 0.0 ) continue;
		float t = ( uTiempo - a.x ) / a.y;
		if ( t < 0.0 || t > 1.0 ) continue;
		float d = ( r - 3.6 - ( a.z - 3.6 ) * ( 1.0 - pow( 1.0 - t, 2.2 ) ) ) / ${f(O.ancho)};
		s += exp( - d * d ) * pow( 1.0 - t, 1.2 );
	}
	if ( uGolpe.w > 0.0 ) {
		float t = ( uTiempo - uGolpe.x ) / 2.6;
		if ( t >= 0.0 && t <= 1.0 ) {
			float d = ( r - 1.5 - 58.0 * ( 1.0 - pow( 1.0 - t, 2.2 ) ) ) / ${f(O.ancho)};
			s += 1.5 * exp( - d * d ) * pow( 1.0 - t, 1.2 );
		}
	}
	return s;
}
// La energía de este bloque (0 a ~1,8): el campo, hasta donde llegó la expansión (y su frente), más las ondas; por el poder y
// nunca en el mar calmo del logo.
// [PULIDO 3] A1 · el piso blando de las tapas con energía (la mancha negra: \`fondoDeLaLuz\`).
float fondoDeLaLuz( float alto ) {
	return alto >= ${f(LUZ_DE_ABAJO.fondo.desde)} ? alto : ${f(LUZ_DE_ABAJO.fondo.desde)} + ${f(LUZ_DE_ABAJO.fondo.hasta - LUZ_DE_ABAJO.fondo.desde)} * ( 1.0 - exp( ( alto - ${f(LUZ_DE_ABAJO.fondo.desde)} ) / ${f(LUZ_DE_ABAJO.fondo.desde - LUZ_DE_ABAJO.fondo.hasta)} ) );
}
float energiaDeLaLuz( vec2 xz ) {
	if ( uEnergiaDeLaLuz <= 0.0 || uExpansionDeLaLuz.x <= 0.0 ) return 0.0;
	float r = length( xz );
	float llego = 1.0 - smoothstep( uExpansionDeLaLuz.x - ${f(E.frente)}, uExpansionDeLaLuz.x, r );
	if ( llego <= 0.0 ) return 0.0;
	float frente = (r - uExpansionDeLaLuz.x) / ${f(E.frente)};
	float e = pow( smoothstep( ${f(LUZ_DE_ABAJO.umbral[0])}, ${f(LUZ_DE_ABAJO.umbral[1])}, campoDeLaLuz( xz, uRelojDeLaLuz ) ), 1.5 );
	e = e * llego + ${f(E.brillo)} * exp( - frente * frente ) * ( 1.0 - uExpansionDeLaLuz.y );
	e += ${f(O.sube)} * ondaDeLaLuz( r ) * llego * ( 0.35 + e );
	float calma = uCalmaDeLaLuz.z * ( 1.0 - smoothstep( uCalmaDeLaLuz.x, uCalmaDeLaLuz.y, r ) );
	return min( 1.8, e ) * uEnergiaDeLaLuz * ( 1.0 - calma );
}
`

/**
 * [PULIDO 3] A1 · LA ENERGÍA LEÍDA FUERA DE LA SIMULACIÓN (el plano de abajo, las chispas): el canal `a` de la textura de
 * alturas (`uPisoVivo`, `uGrillaDelPiso`: `piso/enVivo.ts`), interpolado entre los centros de los bloques.
 */
export const LECTURA_DE_LA_LUZ_GLSL = /* glsl */ `
uniform sampler2D uPisoVivo;
uniform vec4 uGrillaDelPiso;
uniform float uEnergiaDeLaLuz;
vec4 celdaDeLaLuz( ivec2 c ) {
	int n = int( uGrillaDelPiso.x );
	if ( c.x < 0 || c.y < 0 || c.x >= n || c.y >= n ) return vec4( 0.0 );
	return texelFetch( uPisoVivo, c, 0 );
}
float energiaEnElPiso( vec2 xz ) {
	if ( uEnergiaDeLaLuz <= 0.0 || uGrillaDelPiso.z < 0.5 ) return 0.0;
	vec2 g = xz / uGrillaDelPiso.y + 0.5 * uGrillaDelPiso.x - 0.5;
	ivec2 i = ivec2( floor( g ) );
	vec2 u = fract( g );
	float a = mix( celdaDeLaLuz( i ).a, celdaDeLaLuz( i + ivec2( 1, 0 ) ).a, u.x );
	float b = mix( celdaDeLaLuz( i + ivec2( 0, 1 ) ).a, celdaDeLaLuz( i + ivec2( 1, 1 ) ).a, u.x );
	return mix( a, b, u.y );
}
`

/**
 * [PULIDO 3] A1 · `?energia=red`: CORRIENTES POR LAS JUNTAS. Cada `cada` bloques hay una fuente; de ella salen trazos que
 * corren por las líneas de la grilla (la distancia por las juntas, en L1: al llegar a un nodo siguen de frente y doblan en
 * ángulo recto, o sea, se bifurcan), y sólo por los tramos que conducen (un azar por tramo). Cada onda del logo recarga la
 * red: su anillo recorre TODAS las juntas al pasar. Pide `uTiempo`, `uAnillos`, `uGolpe` y el azar de la luz.
 */
export const RED_DE_LA_LUZ_GLSL = /* glsl */ `
${ONDAS_DEL_LOGO_GLSL}
float redDeLaLuz( vec2 xz, float lado ) {
	vec2 g = xz / lado;
	vec2 i = floor( g );
	vec2 f = g - i;
	bool vertical = min( f.x, 1.0 - f.x ) < min( f.y, 1.0 - f.y );
	vec2 nodo = floor( g + 0.5 );
	vec2 tramo = vertical ? vec2( nodo.x, i.y ) : vec2( i.x, nodo.y );
	float conduce = step( ${f(1 - RED_DE_LA_LUZ.conduce)}, azarDeLaLuz( tramo * vec2( 1.0, 1.7 ) + ( vertical ? 0.31 : 0.77 ) ) );
	float corriente = 0.0;
	vec2 sc = floor( g / ${f(RED_DE_LA_LUZ.cada)} - 0.5 );
	for ( int k = 0; k < 4; k++ ) {
		vec2 c = sc + vec2( float( k - 2 * ( k / 2 ) ), float( k / 2 ) );
		vec2 fuente = floor( ( c + vec2( azarDeLaLuz( c + 3.1 ), azarDeLaLuz( c + 8.3 ) ) ) * ${f(RED_DE_LA_LUZ.cada)} );
		float d = abs( g.x - fuente.x ) + abs( g.y - fuente.y );
		float fase = fract( d / ${f(RED_DE_LA_LUZ.velocidad)} - uTiempo * ( 0.8 + 0.4 * azarDeLaLuz( c + 5.7 ) ) );
		corriente = max( corriente, smoothstep( 0.0, 0.03, fase ) * ( 1.0 - smoothstep( 0.03, ${f(RED_DE_LA_LUZ.trazo)}, fase ) ) * ( 1.0 - smoothstep( 4.0, 9.0, d ) ) );
	}
	float r = length( xz );
	float anillo = ondaDelLogo( r, 0.9 );
	for ( int k = 0; k < 4; k++ ) {
		vec4 a = uAnillos[ k ];
		if ( a.w <= 0.0 ) continue;
		float t = ( uTiempo - a.x ) / a.y;
		if ( t < 0.0 || t > 1.0 ) continue;
		float d = ( r - 3.6 - ( a.z - 3.6 ) * ( 1.0 - pow( 1.0 - t, 2.2 ) ) ) / 0.9;
		anillo += exp( - d * d ) * pow( 1.0 - t, 1.2 );
	}
	if ( uGolpe.w > 0.0 ) {
		float t = ( uTiempo - uGolpe.x ) / 2.6;
		float d = ( r - 1.5 - 58.0 * ( 1.0 - pow( 1.0 - clamp( t, 0.0, 1.0 ), 2.2 ) ) ) / 0.9;
		if ( t >= 0.0 && t <= 1.0 ) anillo += exp( - d * d ) * pow( 1.0 - t, 1.2 );
	}
	return ${f(RED_DE_LA_LUZ.fuerza)} * corriente * conduce + ${f(RED_DE_LA_LUZ.anillo)} * anillo;
}
`

/** [PULIDO 3] A1 · la altura del plano de abajo sobre el pie de los bloques (u): por debajo del piso blando de las tapas. */
export const PLANO_SOBRE_EL_ZOCALO = 0.02
export const ALTO_DEL_PLANO = -PISO_VIVO.zocalo + PLANO_SOBRE_EL_ZOCALO
