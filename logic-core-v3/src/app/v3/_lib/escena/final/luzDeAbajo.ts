import * as THREE from 'three'

import { PISO_VIVO } from '../piso/bloques'

/**
 * [PULIDO 2] 4 · LA LUZ QUE SALE DE ABAJO, POR LAS JUNTAS (las referencias del humano: bloques grises con luz blanca que se
 * escapa por las rendijas). Donde hay energía, los bloques quedan a alturas distintas y se separan un poco; por las rendijas
 * se ve un plano que brilla debajo del piso (falso y local, sin bloom), las caras de los costados reciben la luz desde su base
 * y los cantos la atrapan. Las TAPAS no se ponen blancas.
 *
 * [PULIDO 3] A1 · DE UN SECTOR A TODA LA ESCENA («como si después de que se incruste el logo se volvió el caos y está a punto
 * de explotar todo por una sobrecarga de energía»): la energía de cada bloque la decide un CAMPO de ruido continuo con domain
 * warping que fluye; arranca en el golpe y se expande desde el hueco (`expansionDeLaLuz`, función de `fin`: al rebobinar se
 * retira con la curva de P2); cada onda del logo pasa como un frente que la sube. Se calcula UNA vez por bloque, en la
 * simulación del piso (el canal libre de su textura); el vértice, el dibujo y el plano de abajo la leen de ahí.
 *
 * [PULIDO 3B] B0 · LA VERSIÓN FINAL (las tres variantes del 3A, fundidas en una): más movimiento y más brillo (el campo corre
 * más rápido y una capa fina por encima cambia todo el tiempo: además sostiene la cobertura, nunca menos del 65 %); las
 * CORRIENTES que corren por las juntas, sin patrón (`CORRIENTES_DE_LA_LUZ_GLSL`); los PISTONES, racimos de bloques que suben y
 * bajan a su ritmo y al subir abren las rendijas (`pistonDeLaLuz`, sin vibración); las ondas del logo, cada ~3,2 s con un
 * corrimiento al azar (sin periodicidad), y el logo que las larga brillando (`rimDeLaLuz.ts`, con su pulso). Los cantos de las
 * tapas, más fuertes: el frente se ve desde el golpe, también sobre la meseta de la súper onda.
 */
export const LUZ_DE_ABAJO = {
  /** El campo: escala del ruido (1/u), cuánto lo tuerce el domain warping, cuánto cambia la torsión (1/s) y su deriva (u/s). */
  campo: { escala: 0.17, tuerce: 2.2, cambia: 0.3, deriva: [1.6, -1.02] },
  /** Desde qué valor del campo hay luz y desde cuál es entera. */
  umbral: [0.33, 0.7],
  /**
   * [PULIDO 3B] B0 · la capa fina: un ruido chico que corre rápido (escala 1/u, velocidad u/s), con su umbral y su fuerza. Se
   * suma al campo (el mayor de los dos): da el movimiento de cerca y sostiene la cobertura en cualquier momento y ancho.
   */
  fina: { escala: 0.55, corre: [1.3, -0.9], umbral: 0.5, fuerza: 0.35 },
  /** La expansión desde el hueco en el golpe: hasta dónde llega (u) y el ancho de su frente (u, que brilla al pasar). */
  expansion: { hasta: 36, frente: 3.2, brillo: 1.4 },
  /**
   * Las ondas del logo: cuánto suben la energía en su frente y su ancho (u). Durante el final el logo no larga los anillos del
   * pulso (NOCTURNO FINAL B3: cruzaban el círculo quieto), así que larga los suyos sólo en la energía: uno cada `cadaS` (corrido
   * hasta `corre` del intervalo, al azar), desde el borde del mar calmo (`desde`, u) a `velocidad` u/s; más el golpe.
   */
  ondas: { sube: 0.8, ancho: 1.8, cadaS: 3.2, corre: 0.35, velocidad: 12, desde: 7 },
  /** Cuánto más allá del círculo calmo del logo puede empezar (u). */
  margen: 1,
  /** Los bloques con energía: cuánto se separan (fracción del lado, por costado) y cuánto cambian de alto (u, de −a a +b). */
  separa: 0.045,
  alturas: [-0.12, 0.42],
  /** La luz: la del plano de abajo (por las rendijas), la de los costados desde su base (y su caída, u) y la de los cantos. */
  plano: 2.2,
  costado: 1.5,
  caeEn: 0.32,
  canto: 0.75,
  /** Cuánto más en sombra queda la tapa de un bloque con energía (la luz viene de abajo: la tapa no se blanquea). */
  sombraDeLaTapa: 0.12,
  /** Cuánto varía la luz de una junta a otra (fracción), a qué escala (1/u) y cuán rápido corre (u/s). */
  varia: 0.65,
  variaCada: 0.85,
  variaCorre: [0.55, -0.4],
  /** Cuánto varía la separación de un bloque a otro (fracción de `separa`): las rendijas no son todas del mismo ancho. */
  variaLaSeparacion: 0.55,
  /** Cuánto se oscurece la sala con la energía extendida (en el color que se ve; el logo, no). */
  oscurece: 0.38,
  /**
   * LA MANCHA NEGRA: con energía, ninguna tapa baja hasta el plano de abajo (la súper onda dibujaba valles de ~1,4 u, más
   * hondos que el pie de los bloques): las tapas se frenan con un piso blando que empieza en `desde` y no pasa de `hasta` (u).
   */
  fondo: { desde: -0.45, hasta: -0.53 },
} as const

/**
 * [PULIDO 3B] B0 · LAS CORRIENTES: por cada junta (una línea de la grilla), unas pocas corrientes; cada una en su propio
 * ciclo (de largo al azar), y en cada ciclo nace en un punto al azar de la línea, corre en un sentido al azar con su velocidad
 * y su largo, y se apaga (o descansa ese ciclo). Lo que no hay: fuentes fijas, anillos, periodos comunes; ni siquiera el ciclo
 * de una corriente dura siempre lo mismo (su reloj se tuerce con un ruido lento, `tuerce`, sin volver para atrás).
 */
export const CORRIENTES = { porJunta: 3, periodoS: [1.6, 4.4], tuerce: 0.7, descansa: 0.25, velocidad: [4, 13], largo: [1.5, 6], vive: 0.75, alcance: 45, fuerza: 1.6 } as const

/**
 * [PULIDO 3B] B0 · LOS PISTONES: racimos de bloques (de `racimo` de lado, corridos por fila: no se leen como grilla) que suben
 * y bajan, cada uno a su ritmo; en cada ciclo, sólo algunos (`cuantos`), con su alto. Al subir abren sus rendijas (`abre`: más
 * energía, más separación y más luz). Una subida lenta por ciclo: nada de vibración.
 */
export const PISTONES = { racimo: 3, periodoS: [1.4, 4], cuantos: 0.32, alto: [0.25, 0.75], abre: 1.2 } as const


/** Con movimiento reducido, el campo quieto en este instante de su reloj (s). */
export const CAMPO_QUIETO_EN = 23

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

/** La energía de un bloque por el campo (0 a 1), antes de la capa fina, la expansión y las ondas. */
export function energiaDelCampo(campo: number): number {
  return suave(LUZ_DE_ABAJO.umbral[0], LUZ_DE_ABAJO.umbral[1], campo) ** 1.5
}

/** [PULIDO 3B] B0 · la energía de un bloque en (x, z) a los `t` s, sin la expansión ni las ondas: el campo y la capa fina. */
export function energiaDeFondo(x: number, z: number, t: number): number {
  const F = LUZ_DE_ABAJO.fina
  const fina = F.fuerza * suave(F.umbral, F.umbral + 0.3, ruido(x * F.escala + t * F.corre[0] + 31.7, z * F.escala + t * F.corre[1] + 7.3))
  return Math.max(energiaDelCampo(campoDeLaLuz(x, z, t)), fina)
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

/** [PULIDO 3B] B0 · cuándo nace la onda `n` del logo (en el reloj de la luz): en su intervalo, corrida al azar. */
export function naceLaOnda(n: number): number {
  const O = LUZ_DE_ABAJO.ondas
  return (n + O.corre * azarDeLaLuz(n, 4.7)) * O.cadaS
}

/** [PULIDO 3B] B0 · cuánto hace que nació la última onda del logo a los `reloj` s (s; infinito si todavía ninguna). */
export function desdeLaUltimaOnda(reloj: number): number {
  const n = Math.floor(reloj / LUZ_DE_ABAJO.ondas.cadaS)
  for (const m of [n, n - 1]) if (reloj >= naceLaOnda(m)) return reloj - naceLaOnda(m)
  return Number.POSITIVE_INFINITY
}

/** [PULIDO 3B] B0 · la corriente en el punto `s` (bloques) de la junta `junta` del eje `eje` a los `t` s: la misma cuenta que `corrienteEnLaJunta`. */
export function corrienteEnLaJunta(junta: number, s: number, eje: number, t: number): number {
  let luz = 0
  for (let j = 0; j < CORRIENTES.porJunta; j += 1) {
    const [a, b] = [junta, eje * 7 + j * 13.1]
    const periodo = CORRIENTES.periodoS[0] + (CORRIENTES.periodoS[1] - CORRIENTES.periodoS[0]) * azarDeLaLuz(a + 0.17, b + 0.17)
    const ciclo = t / periodo + azarDeLaLuz(a + 0.53, b + 0.53) + CORRIENTES.tuerce * ruido(t / (2 * periodo), a * 0.37 + b)
    const n = Math.floor(ciclo)
    const [sa, sb] = [a + n * 1.37, b + n * 2.71]
    const tau = (ciclo - n) * periodo
    const vive = CORRIENTES.vive * periodo
    if (tau > vive || azarDeLaLuz(sa + 0.9, sb + 0.9) < CORRIENTES.descansa) continue
    const sentido = azarDeLaLuz(sa + 0.77, sb + 0.77) < 0.5 ? -1 : 1
    const velocidad = CORRIENTES.velocidad[0] + (CORRIENTES.velocidad[1] - CORRIENTES.velocidad[0]) * azarDeLaLuz(sa + 0.11, sb + 0.11)
    const cabeza = (azarDeLaLuz(sa + 0.31, sb + 0.31) - 0.5) * 2 * CORRIENTES.alcance + sentido * velocidad * tau
    const largo = CORRIENTES.largo[0] + (CORRIENTES.largo[1] - CORRIENTES.largo[0]) * azarDeLaLuz(sa + 0.63, sb + 0.63)
    const detras = (cabeza - s) * sentido
    if (detras < 0 || detras > largo) continue
    const cola = 1 - detras / largo
    luz = Math.max(luz, cola * cola * suave(0, 0.15, tau) * (1 - suave(0.6 * vive, vive, tau)))
  }
  return luz
}

/** Los uniformes de la luz de abajo; los comparten el piso, la simulación y el plano. */
export const LUZ_DE_ABAJO_EN_VIVO = {
  /** La energía (el poder del piso, con su inercia: 0 sin poder, 1 entero). */
  uEnergiaDeLaLuz: { value: 0 },
  /** El mar calmo del logo, donde la luz no entra: desde y hasta dónde se apaga (u) y cuánto está calmo (0 a 1). */
  uCalmaDeLaLuz: { value: new THREE.Vector3(0, 1, 0) },
  /** [PULIDO 3] A1 · la expansión desde el hueco: el radio (u) y el progreso (0 a 1). */
  uExpansionDeLaLuz: { value: new THREE.Vector2(0, 0) },
  /** [PULIDO 3] A1 · el reloj de la luz (s): el de la escena; quieto con movimiento reducido. */
  uRelojDeLaLuz: { value: 0 },
  /** [PULIDO 3B] B0 · cuánto brilla la luz (1: [PULIDO 4] C2 · `?energia=intensa`, que la subía, se borró). */
  uBrilloDeLaLuz: { value: 1 },
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))
const C = LUZ_DE_ABAJO.campo
const F = LUZ_DE_ABAJO.fina
const E = LUZ_DE_ABAJO.expansion
const O = LUZ_DE_ABAJO.ondas
const K = CORRIENTES
const P = PISTONES

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
// bloques que corre: la luz titila).
float brilloDeLaJunta( vec2 xz, float t ) {
	return ${f(1 - LUZ_DE_ABAJO.varia)} + ${f(LUZ_DE_ABAJO.varia)} * ruidoDeLaLuz( xz * ${f(LUZ_DE_ABAJO.variaCada)} + vec2( t * ${f(LUZ_DE_ABAJO.variaCorre[0])}, t * ${f(LUZ_DE_ABAJO.variaCorre[1])} ) );
}
`

/** [PULIDO 3] A1 · las ondas que larga el logo en la energía (0 a 1 en su frente, a la distancia r): pide `uRelojDeLaLuz` y el azar. */
export const ONDAS_DEL_LOGO_GLSL = /* glsl */ `
float ondaDelLogo( float r, float ancho ) {
	float n = floor( uRelojDeLaLuz / ${f(O.cadaS)} );
	float s = 0.0;
	for ( int k = 0; k < 2; k++ ) {
		float m = n - float( k );
		float tau = uRelojDeLaLuz - ( m + ${f(O.corre)} * azarDeLaLuz( vec2( m, 4.7 ) ) ) * ${f(O.cadaS)};
		if ( tau < 0.0 || tau > ${f(1.35 * O.cadaS)} ) continue;
		float d = ( r - ${f(O.desde)} - tau * ${f(O.velocidad)} ) / ancho;
		s += exp( - d * d ) * ( 1.0 - tau / ${f(1.35 * O.cadaS)} );
	}
	return s;
}
`

/**
 * [PULIDO 3] A1 · LA ENERGÍA EN LA SIMULACIÓN DEL PISO (una vez por bloque y por paso): el campo y [PULIDO 3B] B0 su capa fina,
 * la expansión desde el hueco (con su frente que brilla), las ondas del logo (las suyas, los anillos del pulso, `uAnillos`, y el
 * golpe, `uGolpe`), los pistones, la energía del poder y el mar calmo. Va al canal libre (`a`) de la textura de alturas.
 */
export const ENERGIA_EN_LA_SIMULACION_GLSL = /* glsl */ `
uniform float uEnergiaDeLaLuz;
uniform vec3 uCalmaDeLaLuz;
uniform vec2 uExpansionDeLaLuz;
uniform float uRelojDeLaLuz;
${RUIDO_DE_LA_LUZ_GLSL}
${ONDAS_DEL_LOGO_GLSL}
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
// [PULIDO 3B] B0 · el campo y la capa fina (el mayor de los dos).
float fondoDeLaEnergia( vec2 xz, float t ) {
	float campo = pow( smoothstep( ${f(LUZ_DE_ABAJO.umbral[0])}, ${f(LUZ_DE_ABAJO.umbral[1])}, campoDeLaLuz( xz, t ) ), 1.5 );
	float fina = ${f(F.fuerza)} * smoothstep( ${f(F.umbral)}, ${f(F.umbral + 0.3)}, ruidoDeLaLuz( xz * ${f(F.escala)} + vec2( t * ${f(F.corre[0])} + 31.7, t * ${f(F.corre[1])} + 7.3 ) ) );
	return max( campo, fina );
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
// [PULIDO 3B] B0 · el pistón de este bloque (u): su racimo, en su ciclo, sube y baja una vez (o descansa).
float pistonDeLaLuz( vec2 xz ) {
	vec2 celda = floor( xz / uLado );
	vec2 racimo = floor( vec2( celda.x + floor( celda.y / ${f(P.racimo)} ) * 1.7, celda.y ) / ${f(P.racimo)} );
	float periodo = ${f(P.periodoS[0])} + ${f(P.periodoS[1] - P.periodoS[0])} * azarDeLaLuz( racimo + 4.1 );
	float ciclo = uRelojDeLaLuz / periodo + azarDeLaLuz( racimo + 9.3 );
	float n = floor( ciclo );
	vec2 cn = racimo + n * vec2( 3.1, 1.7 );
	if ( azarDeLaLuz( cn + 0.4 ) > ${f(P.cuantos)} ) return 0.0;
	float sube = sin( 3.14159 * ( ciclo - n ) );
	return ( ${f(P.alto[0])} + ${f(P.alto[1] - P.alto[0])} * azarDeLaLuz( cn + 0.8 ) ) * ( 0.75 + 0.25 * azarDeLaLuz( celda + 0.6 ) ) * sube * sube;
}
// [PULIDO 3] A1 · el piso blando de las tapas con energía (la mancha negra: \`fondoDeLaLuz\`).
float fondoDeLaLuz( float alto ) {
	return alto >= ${f(LUZ_DE_ABAJO.fondo.desde)} ? alto : ${f(LUZ_DE_ABAJO.fondo.desde)} + ${f(LUZ_DE_ABAJO.fondo.hasta - LUZ_DE_ABAJO.fondo.desde)} * ( 1.0 - exp( ( alto - ${f(LUZ_DE_ABAJO.fondo.desde)} ) / ${f(LUZ_DE_ABAJO.fondo.desde - LUZ_DE_ABAJO.fondo.hasta)} ) );
}
// La energía de este bloque (0 a ~1,8): el fondo de la energía, hasta donde llegó la expansión (y su frente), más las ondas y
// el pistón (que también devuelve, para la altura); por el poder y nunca en el mar calmo del logo.
float energiaDeLaLuz( vec2 xz, out float piston ) {
	piston = 0.0;
	if ( uEnergiaDeLaLuz <= 0.0 || uExpansionDeLaLuz.x <= 0.0 ) return 0.0;
	float r = length( xz );
	float llego = 1.0 - smoothstep( uExpansionDeLaLuz.x - ${f(E.frente)}, uExpansionDeLaLuz.x, r );
	if ( llego <= 0.0 ) return 0.0;
	float frente = ( r - uExpansionDeLaLuz.x ) / ${f(E.frente)};
	float calma = uCalmaDeLaLuz.z * ( 1.0 - smoothstep( uCalmaDeLaLuz.x, uCalmaDeLaLuz.y, r ) );
	piston = pistonDeLaLuz( xz ) * llego * ( 1.0 - calma ) * uEnergiaDeLaLuz;
	float e = fondoDeLaEnergia( xz, uRelojDeLaLuz );
	e = e * llego + ${f(E.brillo)} * exp( - frente * frente ) * ( 1.0 - uExpansionDeLaLuz.y );
	e += ${f(O.sube)} * ondaDeLaLuz( r ) * llego * ( 0.35 + e );
	e += ${f(P.abre)} * piston;
	return min( 1.8, e ) * uEnergiaDeLaLuz * ( 1.0 - calma );
}
`

/**
 * [PULIDO 3] A1 · LA ENERGÍA LEÍDA FUERA DE LA SIMULACIÓN (el plano de abajo): el canal `a` de la textura de alturas
 * (`uPisoVivo`, `uGrillaDelPiso`: `piso/enVivo.ts`), interpolado entre los centros de los bloques.
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
 * [PULIDO 3B] B0 · LAS CORRIENTES POR LAS JUNTAS (`CORRIENTES`), en el dibujo (los costados) y en el plano de abajo (por las
 * rendijas): en el punto `xz`, la de la junta vertical y la de la horizontal más cercanas. Pide `uRelojDeLaLuz` y el azar.
 */
export const CORRIENTES_DE_LA_LUZ_GLSL = /* glsl */ `
float corrienteEnLaJunta( float junta, float s, float eje ) {
	float luz = 0.0;
	for ( int j = 0; j < ${String(K.porJunta)}; j++ ) {
		vec2 semilla = vec2( junta, eje * 7.0 + float( j ) * 13.1 );
		float periodo = ${f(K.periodoS[0])} + ${f(K.periodoS[1] - K.periodoS[0])} * azarDeLaLuz( semilla + 0.17 );
		float ciclo = uRelojDeLaLuz / periodo + azarDeLaLuz( semilla + 0.53 ) + ${f(K.tuerce)} * ruidoDeLaLuz( vec2( uRelojDeLaLuz / ( 2.0 * periodo ), semilla.x * 0.37 + semilla.y ) );
		float n = floor( ciclo );
		vec2 sn = semilla + n * vec2( 1.37, 2.71 );
		float tau = ( ciclo - n ) * periodo;
		float vive = ${f(K.vive)} * periodo;
		if ( tau > vive || azarDeLaLuz( sn + 0.9 ) < ${f(K.descansa)} ) continue;
		float sentido = azarDeLaLuz( sn + 0.77 ) < 0.5 ? -1.0 : 1.0;
		float cabeza = ( azarDeLaLuz( sn + 0.31 ) - 0.5 ) * ${f(2 * K.alcance)} + sentido * ( ${f(K.velocidad[0])} + ${f(K.velocidad[1] - K.velocidad[0])} * azarDeLaLuz( sn + 0.11 ) ) * tau;
		float largo = ${f(K.largo[0])} + ${f(K.largo[1] - K.largo[0])} * azarDeLaLuz( sn + 0.63 );
		float detras = ( cabeza - s ) * sentido;
		if ( detras < 0.0 || detras > largo ) continue;
		float cola = 1.0 - detras / largo;
		luz = max( luz, cola * cola * smoothstep( 0.0, 0.15, tau ) * ( 1.0 - smoothstep( 0.6 * vive, vive, tau ) ) );
	}
	return luz;
}
float corrientesDeLaLuz( vec2 xz, float lado ) {
	vec2 g = xz / lado;
	vec2 cerca = abs( g - floor( g + 0.5 ) );
	float v = corrienteEnLaJunta( floor( g.x + 0.5 ), g.y, 0.0 ) * ( 1.0 - smoothstep( 0.08, 0.2, cerca.x ) );
	float h = corrienteEnLaJunta( floor( g.y + 0.5 ), g.x, 1.0 ) * ( 1.0 - smoothstep( 0.08, 0.2, cerca.y ) );
	return ${f(K.fuerza)} * max( v, h );
}
`

/** [PULIDO 3] A1 · la altura del plano de abajo sobre el pie de los bloques (u): por debajo del piso blando de las tapas. */
export const PLANO_SOBRE_EL_ZOCALO = 0.02
export const ALTO_DEL_PLANO = -PISO_VIVO.zocalo + PLANO_SOBRE_EL_ZOCALO
