import * as THREE from 'three'

/**
 * [PULIDO 2] 4 · LA LUZ QUE SALE DE ABAJO, POR LAS JUNTAS (rehace el brillo de PULIDO 1 P1: las tapas blancas, rechazadas:
 * «no entendiste mi concepto»; las referencias del humano: bloques grises con luz blanca que se escapa por las rendijas).
 * Después del encastre (con el poder), un SECTOR del piso vivo se enciende desde ABAJO: sus bloques quedan a alturas
 * distintas y se separan un poco; por las rendijas que se abren se ve un plano que brilla debajo del piso (con caída suave:
 * el resplandor es falso y local, sin bloom), las caras de los costados reciben la luz desde su base (más fuerte abajo, se
 * apaga hacia arriba) y los cantos la atrapan. Las TAPAS no se ponen blancas. El sector nace en un punto y se propaga por
 * las juntas (bloque a bloque, desde su centro), respira, se retira, y otro nace en otro lado: mayormente contiguo y
 * orgánico (la distancia a su centro deformada por un ruido), sin damero ni grilla ni círculos. La sala se oscurece
 * gradual mientras el sector se enciende y vuelve cuando se apaga.
 *
 * Las zonas (dónde, de qué tamaño y cuánto vive cada una) las calcula esta función por cuadro y las pasa como uniformes: el
 * sombreador sólo dibuja la forma. Así la escena sabe cuánto está prendido (el oscurecimiento) y el banco y los
 * invariantes la leen igual.
 */
export const LUZ_DE_ABAJO = {
  zonas: 2,
  periodo: [10.8, 12.4],
  desfase: 0.47,
  nace: [1.6, 2.6],
  vive: [3, 4.5],
  muere: [1.6, 2.4],
  radio: [3.2, 4.6],
  deriva: 0.12,
  respira: { amplitud: 0.08, periodoS: 3.4 },
  /** La forma: cuánto deforma el ruido la distancia (orgánica) y a qué escala, y lo suave del borde (en radios). */
  irregular: 0.55,
  ruido: 0.6,
  suave: 0.3,
  semilla: 17.31,
  /** Con movimiento reducido el sector queda quieto en este instante de su reloj (uno prendido). */
  quietoEn: 4.2,
  /** Cuánto más allá del círculo calmo del logo puede empezar (u). */
  margen: 1,
  /** Los bloques del sector: cuánto se separan (fracción del lado, por costado) y cuánto cambian de alto (u, de −a a +b). */
  separa: 0.045,
  alturas: [-0.12, 0.42],
  /** La luz: la del plano de abajo (por las rendijas) y cuánto más allá del sector llega su resplandor (en radios), la de los
   * costados desde su base (y su caída, u) y la de los cantos. */
  plano: 1.6,
  resplandor: 0.35,
  costado: 1.15,
  caeEn: 0.32,
  canto: 0.32,
  /** Cuánto más en sombra queda la tapa de un bloque del sector (la luz viene de abajo: la tapa no se blanquea). */
  sombraDeLaTapa: 0.12,
  /** Cuánto varía la luz de una junta a otra (fracción) y a qué escala (1/u): no todas las rendijas brillan igual. */
  varia: 0.65,
  variaCada: 0.85,
  /** Cuánto varía la separación de un bloque a otro (fracción de `separa`): las rendijas no son todas del mismo ancho. */
  variaLaSeparacion: 0.55,
  /** Cuánto se oscurece la sala con el sector entero prendido (en el color que se ve). */
  oscurece: 0.38,
} as const

/** Una zona en un cuadro: su centro (u), su radio (u), cuánto vive (0 a 1) y la semilla de su ruido. */
export interface ZonaDeLaLuz {
  cx: number
  cz: number
  radio: number
  vida: number
  semilla: number
}

/** Un azar fijo por número (mulberry32): el mismo ciclo da siempre la misma zona. */
function azar(n: number): number {
  let a = (Math.imul(n | 0, 0x9e3779b1) + 0x6d2b79f5) | 0
  a = Math.imul(a ^ (a >>> 15), a | 1)
  a ^= a + Math.imul(a ^ (a >>> 7), a | 61)
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296
}

const suave = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * Lo que se ve del piso (u: medio ancho y medio fondo del cuadro), el giro de su derecha (rad) y su centro (u: donde mira la
 * cámara; abajo de 1024 el logo va corrido a un hueco del pie y el centro de lo que se ve no es el logo).
 */
export interface AlcanceDeLaLuz {
  readonly x: number
  readonly y: number
  readonly giro: number
  readonly cx?: number
  readonly cz?: number
}

/**
 * Las zonas a los `t` s: cada una con su reloj (`periodo`, más largo que su vida: queda un hueco), desfasadas; nace, vive
 * respirando y desplazándose apenas, y se retira; la siguiente aparece en otro lugar de lo que se ve (el ángulo avanza
 * 0,382 de vuelta por ciclo, la razón áurea, más un desvío), fuera del mar calmo (`minimo`, u).
 */
export function zonasDeLaLuz(t: number, alcance: AlcanceDeLaLuz, minimo: number, salida: ZonaDeLaLuz[]): ZonaDeLaLuz[] {
  const L = LUZ_DE_ABAJO
  for (let k = 0; k < L.zonas; k += 1) {
    const periodo = L.periodo[0] + (L.periodo[1] - L.periodo[0]) * azar(k * 31 + 7)
    const tz = t + k * L.desfase * periodo + L.semilla
    const n = Math.floor(tz / periodo)
    const tau = tz - n * periodo
    const s = n * 7919 + k * 104729
    const nace = L.nace[0] + (L.nace[1] - L.nace[0]) * azar(s + 1)
    const vive = L.vive[0] + (L.vive[1] - L.vive[0]) * azar(s + 2)
    const muere = L.muere[0] + (L.muere[1] - L.muere[0]) * azar(s + 3)
    const vida = suave(0, nace, tau) * (1 - suave(nace + vive, nace + vive + muere, tau))
    const a = 2 * Math.PI * ((azar(k * 13 + 3) + n * 0.381966 + 0.25 * azar(s + 4)) % 1)
    const lejos = 0.5 + 0.4 * azar(s + 5)
    const ex = Math.cos(a) * alcance.x * lejos
    const ey = Math.sin(a) * alcance.y * lejos
    const cg = Math.cos(alcance.giro)
    const sg = Math.sin(alcance.giro)
    let cx = ex * cg - ey * sg + (alcance.cx ?? 0)
    let cz = ex * sg + ey * cg + (alcance.cz ?? 0)
    const r = Math.hypot(cx, cz)
    if (r < minimo) {
      const k2 = minimo / Math.max(0.001, r)
      cx *= k2
      cz *= k2
    }
    const da = 2 * Math.PI * azar(s + 6)
    cx += Math.cos(da) * L.deriva * tau
    cz += Math.sin(da) * L.deriva * tau
    const radio = (L.radio[0] + (L.radio[1] - L.radio[0]) * azar(s + 7)) * (1 + L.respira.amplitud * Math.sin((2 * Math.PI * tau) / L.respira.periodoS))
    const z = salida[k] ?? { cx: 0, cz: 0, radio: 1, vida: 0, semilla: 0 }
    z.cx = cx
    z.cz = cz
    z.radio = radio
    z.vida = vida
    z.semilla = (n % 97) * 3.1 + k * 13.1
    salida[k] = z
  }
  return salida
}

/** Cuánto está prendido el piso (0 a 1): la zona más viva. Con eso se oscurece la sala. */
export function prendidoDeLaLuz(zonas: readonly ZonaDeLaLuz[]): number {
  return zonas.reduce((m, z) => Math.max(m, z.vida), 0)
}

/** Los uniformes de la luz de abajo: las zonas (x, z, radio, vida) y sus semillas; los comparten el piso, la simulación y el plano. */
export const LUZ_DE_ABAJO_EN_VIVO = {
  uZonasDeLaLuz: { value: Array.from({ length: LUZ_DE_ABAJO.zonas }, () => new THREE.Vector4(0, 0, 1, 0)) },
  uSemillasDeLaLuz: { value: new THREE.Vector2(0, 13.1) },
  /** La energía (el poder del piso, con su inercia: 0 sin poder, 1 entero). */
  uEnergiaDeLaLuz: { value: 0 },
  /** El mar calmo del logo, donde la luz no entra: desde y hasta dónde se apaga (u) y cuánto está calmo (0 a 1). */
  uCalmaDeLaLuz: { value: new THREE.Vector3(0, 1, 0) },
}

const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** [PULIDO 2] 4 · el sector de la luz en un punto del piso (el centro de un bloque): la forma de cada zona, la mayor. */
export const SECTOR_DE_LA_LUZ_GLSL = /* glsl */ `
uniform vec4 uZonasDeLaLuz[ ${String(LUZ_DE_ABAJO.zonas)} ];
uniform vec2 uSemillasDeLaLuz;
uniform float uEnergiaDeLaLuz;
uniform vec3 uCalmaDeLaLuz;
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
// Cuánto está adentro del sector (0 a 1) y, con \`ancho\`, el resplandor alrededor (el plano de abajo, que se ve por las rendijas);
// nunca en el mar calmo del logo (su borde encendido dibujaba un marco de bloques y los bloques subían junto al hueco).
float sectorDeLaLuz( vec2 b, float ancho ) {
	if ( uEnergiaDeLaLuz <= 0.0 ) return 0.0;
	float s = 0.0;
	for ( int k = 0; k < ${String(LUZ_DE_ABAJO.zonas)}; k++ ) {
		vec4 z = uZonasDeLaLuz[ k ];
		if ( z.w <= 0.0 ) continue;
		float lejos = length( b - z.xy ) / z.z;
		if ( lejos > z.w + ${f(0.5 * LUZ_DE_ABAJO.irregular + 0.1)} + ancho ) continue;
		float semilla = k == 0 ? uSemillasDeLaLuz.x : uSemillasDeLaLuz.y;
		float d = lejos + ${f(LUZ_DE_ABAJO.irregular)} * ( ruidoDeLaLuz( b * ${f(LUZ_DE_ABAJO.ruido)} + semilla ) - 0.5 );
		s = max( s, 1.0 - smoothstep( z.w - ${f(LUZ_DE_ABAJO.suave)}, z.w + ancho, d ) );
	}
	float calma = uCalmaDeLaLuz.z * ( 1.0 - smoothstep( uCalmaDeLaLuz.x, uCalmaDeLaLuz.y, length( b ) ) );
	return s * uEnergiaDeLaLuz * ( 1.0 - calma );
}
// Cuánta luz se escapa por la junta de este punto (0,35 a 1): no todas las rendijas por igual (un ruido a la escala de unos
// bloques, que se corre despacio: la luz respira).
float brilloDeLaJunta( vec2 xz, float t ) {
	return ${f(1 - LUZ_DE_ABAJO.varia)} + ${f(LUZ_DE_ABAJO.varia)} * ruidoDeLaLuz( xz * ${f(LUZ_DE_ABAJO.variaCada)} + vec2( t * 0.13, - t * 0.09 ) + uSemillasDeLaLuz.x );
}
`
