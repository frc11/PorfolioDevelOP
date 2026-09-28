import { FLOOR_Y } from '../probeScene'
import { FORMACION, azar } from '../formacion/enFormacion'

/**
 * [ESCENA 8] T4 · EL CIELO DE DÍA — puro, con bandera y apagado: un cielo natural (cielo y nubes) adentro de un
 * espacio que se nota construido, como el de The Truman Show. Va en la misma franja de cielo que la noche,
 * detrás de la formación y de la trama; con la noche se funde al color de la bruma (antes de que aparezcan las
 * estrellas) y con el amanecer vuelve desde el horizonte hacia arriba (la cúpula de la noche lo destapa).
 *
 * Tres variantes, cada una en dos tonos (el celeste rompe la regla monocroma de DIRECCION-ESCENA: lo decide
 * Valentino mirando):
 *
 * - **pintado** · un ciclorama: una cúpula del mundo (no en el infinito: tiene un paralaje mínimo) con el cielo
 *   y las nubes pintados, y las uniones de los paneles apenas visibles (un píxel, unos puntos más oscuras, y
 *   cada panel con su tono apenas distinto, como pintado por separado).
 * - **bloques** · nubes hechas de cubos en el lenguaje del piso vivo: columnas de bloques sobre una base plana,
 *   con el alto de un campo de ruido (una «Isometric Noise Field» colgada del cielo), que derivan despacio.
 * - **particulas** · nubes densas hechas del mismo polvo de la escena: puntos chicos y nítidos, del tamaño de
 *   las motas, apretados en el núcleo y ralos en el borde, que derivan despacio.
 *
 * El cielo va del color de la bruma en el horizonte (empalma con el piso del fondo sin línea) al del tono
 * arriba. Las nubes, blancas; su sombra, apenas más oscura. Nada compite con el logo: todo claro y de poco
 * contraste, y el texto oscuro se lee sobre cualquier parte (lo mide el banco).
 */

export type VarianteDelCielo = 'pintado' | 'bloques' | 'particulas'
export type TonoDelCielo = 'celeste' | 'mono'
export const VARIANTES_DEL_CIELO: readonly VarianteDelCielo[] = ['pintado', 'bloques', 'particulas']
export const TONOS_DEL_CIELO: readonly TonoDelCielo[] = ['celeste', 'mono']

/** Los colores de cada tono (codificados): el cielo arriba, la nube y su sombra. En el horizonte, la bruma. */
export const TONOS: Record<TonoDelCielo, { readonly alto: string; readonly nube: string; readonly sombra: string }> = {
  celeste: { alto: '#B9C8D4', nube: '#FFFFFF', sombra: '#DCE2E7' },
  mono: { alto: '#D4D4D1', nube: '#FFFFFF', sombra: '#E4E4E1' },
}

export const CIELO_DE_DIA = {
  /** El radio del cielo: el de la noche (más allá de la última fila y del piso de abajo). */
  radio: FORMACION.radioDelCielo,
  /** A qué altura del rayo (el seno de la elevación) el cielo ya tiene el color de arriba. */
  degrade: 0.32,
  /** Entre qué cantidades de noche se apaga (antes de que asomen las estrellas, en 0,35). */
  noche: [0.1, 0.33],
  /** La bruma sobre las nubes cerca del horizonte: hasta qué seno de la elevación. */
  bruma: 0.07,
  pintado: {
    /** Los paneles: cuántos en la vuelta y cada cuántos grados de alto; cuánto oscurece la unión y cuánto varía el tono. */
    paneles: 24,
    cadaGrados: 9,
    union: 0.045,
    tono: 0.018,
    /** Las nubes pintadas: la escala del dibujo (a lo ancho y a lo alto), el umbral y la suavidad del borde. */
    nubes: { ancho: 5.5, alto: 16, umbral: 0.5, borde: 0.18 },
  },
  bloques: {
    cuantas: 22,
    /**
     * El lado de un bloque (u), el radio y la base de las nubes (u sobre el piso: de ~2° a ~20° sobre el horizonte, la
     * franja de cielo que se ve), y el alto máximo de una columna.
     */
    celda: 4.2,
    radio: [276, 314],
    base: [16, 110],
    alto: 20,
    /** Cuánto derivan (rad/s): una vuelta en ~26 min. */
    deriva: 0.004,
  },
  particulas: {
    cuantas: 22,
    porNube: 6500,
    radio: [276, 314],
    base: [16, 110],
    /** El lado de un punto en píxeles CSS: el de las motas del polvo nítido (T10 de ESCENA 7). */
    tam: [1.4, 3.2],
    deriva: 0.004,
  },
} as const

/** Un ruido de valor en 2D, determinista (para armar las nubes una vez). */
function ruido2(semilla: number): (x: number, y: number) => number {
  const hash = (i: number, j: number): number => {
    let h = (i * 374761393 + j * 668265263 + semilla * 1442695041) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
  }
  return (x, y) => {
    const [i, j] = [Math.floor(x), Math.floor(y)]
    const [u, v] = [x - i, y - j]
    const [su, sv] = [u * u * (3 - 2 * u), v * v * (3 - 2 * v)]
    const a = hash(i, j) + (hash(i + 1, j) - hash(i, j)) * su
    const b = hash(i, j + 1) + (hash(i + 1, j + 1) - hash(i, j + 1)) * su
    return a + (b - a) * sv
  }
}

/** Una columna de una nube de bloques: su centro (mundo), su tamaño y cuánto gira (para mirar al centro). */
export interface Columna {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly lado: number
  readonly alto: number
  readonly giro: number
}

/**
 * Las nubes de bloques: cada una, una grilla de columnas (a lo largo y hacia afuera) adentro de una elipse, sobre
 * una base plana, con el alto de un ruido (más alto en el medio). El alto se escalona en medios bloques: el
 * lenguaje del piso vivo.
 */
export function nubesDeBloques(semilla = 0x71e2): Columna[] {
  const b = CIELO_DE_DIA.bloques
  const r = azar(semilla)
  const ruido = ruido2(semilla)
  const columnas: Columna[] = []
  for (let k = 0; k < b.cuantas; k += 1) {
    const azimut = ((k + 0.2 + 0.6 * r()) / b.cuantas) * Math.PI * 2
    const radio = b.radio[0] + (b.radio[1] - b.radio[0]) * r()
    const base = FLOOR_Y + b.base[0] + (b.base[1] - b.base[0]) * r() ** 1.4
    const [nx, nz] = [7 + Math.floor(r() * 9), 3 + Math.floor(r() * 4)]
    const tangente = [Math.cos(azimut), -Math.sin(azimut)]
    const radial = [Math.sin(azimut), Math.cos(azimut)]
    for (let i = 0; i < nx; i += 1) {
      for (let j = 0; j < nz; j += 1) {
        const u = (i + 0.5 - nx / 2) / (nx / 2)
        const v = (j + 0.5 - nz / 2) / (nz / 2)
        const e = 1 - (u * u + v * v)
        if (e <= 0.05) continue
        const n = ruido(i * 0.45 + k * 17.3, j * 0.45 + k * 5.1)
        const alto = Math.max(0.5, Math.round(((e ** 0.7) * (0.35 + 0.9 * n) * b.alto) / (b.celda / 2))) * (b.celda / 2)
        const t = (i + 0.5 - nx / 2) * b.celda
        const s = (j + 0.5 - nz / 2) * b.celda
        const x = radial[0] * (radio + s) + tangente[0] * t
        const z = radial[1] * (radio + s) + tangente[1] * t
        columnas.push({ x, y: base + alto / 2, z, lado: b.celda, alto, giro: azimut })
      }
    }
  }
  return columnas
}

/**
 * Las nubes de polvo: cada una, unos bollos (elipsoides) a lo largo; los puntos, más apretados en el núcleo, con la
 * base aplanada. Por punto: la posición (mundo), y el brillo (la base, apenas más oscura) y el lado (px CSS).
 */
export function nubesDePolvo(semilla = 0x9b31): { posiciones: Float32Array; puntos: Float32Array; cuantos: number } {
  const p = CIELO_DE_DIA.particulas
  const r = azar(semilla)
  const cuantos = p.cuantas * p.porNube
  const posiciones = new Float32Array(cuantos * 3)
  const puntos = new Float32Array(cuantos * 2)
  let n = 0
  for (let k = 0; k < p.cuantas; k += 1) {
    const azimut = ((k + 0.2 + 0.6 * r()) / p.cuantas) * Math.PI * 2
    const radio = p.radio[0] + (p.radio[1] - p.radio[0]) * r()
    const base = FLOOR_Y + p.base[0] + (p.base[1] - p.base[0]) * r() ** 1.4
    const largo = 40 + 40 * r()
    const bollos = Array.from({ length: 3 + Math.floor(r() * 4) }, () => ({ t: (r() - 0.5) * largo, rx: 10 + 12 * r(), ry: 7 + 7 * r(), rz: 7 + 5 * r() }))
    const tangente = [Math.cos(azimut), -Math.sin(azimut)]
    const radial = [Math.sin(azimut), Math.cos(azimut)]
    for (let m = 0; m < p.porNube; m += 1) {
      const b = bollos[Math.floor(r() * bollos.length)]
      // Adentro del elipsoide, con densidad que cae hacia el borde (rechazo).
      let [x, y, z, q] = [0, 0, 0, 1]
      for (let intento = 0; intento < 30; intento += 1) {
        ;[x, y, z] = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]
        q = x * x + y * y + z * z
        if (q <= 1 && r() < (1 - q) ** 1.5) break
      }
      // La base plana: lo de abajo del bollo se aplasta.
      const alto = y < 0 ? y * 0.35 : y
      const t = b.t + x * b.rx
      const s = z * b.rz
      posiciones.set([radial[0] * (radio + s) + tangente[0] * t, base + b.ry * 0.35 + alto * b.ry, radial[1] * (radio + s) + tangente[1] * t], n * 3)
      puntos.set([0.8 + 0.2 * Math.min(1, Math.max(0, (alto + 0.35) / 1.2)), p.tam[0] + (p.tam[1] - p.tam[0]) * r() ** 2], n * 2)
      n += 1
    }
  }
  return { posiciones, puntos, cuantos: n }
}

/** Cuánto día hay para el cielo con esta noche (1 de día, 0 antes de que asomen las estrellas). */
export function diaDelCielo(noche: number): number {
  const [a, b] = CIELO_DE_DIA.noche
  const u = Math.min(1, Math.max(0, (noche - a) / (b - a)))
  return 1 - u * u * (3 - 2 * u)
}

const f = (n: number): string => n.toFixed(4)
const P = CIELO_DE_DIA.pintado

/**
 * El cielo en GLSL: el degradé de la bruma al tono de arriba y, en el pintado, las nubes pintadas y las uniones de
 * los paneles. `d` es la dirección desde el centro del mundo (la cúpula es del mundo). Pide `uAlto`, `uNube`,
 * `uSombra`, `uNiebla` y `uDia`.
 */
export const CIELO_DE_DIA_GLSL = /* glsl */ `
uniform vec3 uAlto;
uniform vec3 uNube;
uniform vec3 uSombra;
uniform vec3 uNiebla;
uniform float uDia;
float azarDelCielo( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float ruidoDelCielo( vec2 p ) {
	vec2 i = floor( p );
	vec2 u = fract( p );
	u = u * u * ( 3.0 - 2.0 * u );
	return mix( mix( azarDelCielo( i ), azarDelCielo( i + vec2( 1.0, 0.0 ) ), u.x ), mix( azarDelCielo( i + vec2( 0.0, 1.0 ) ), azarDelCielo( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}
float fbmDelCielo( vec2 p ) {
	float s = 0.0;
	float a = 0.5;
	for ( int i = 0; i < 5; i++ ) {
		s += a * ruidoDelCielo( p );
		p = mat2( 1.6, 1.2, - 1.2, 1.6 ) * p;
		a *= 0.5;
	}
	return s;
}
// El cielo sin nubes: de la bruma en el horizonte al tono de arriba.
vec3 cieloSolo( float alto ) {
	return mix( uNiebla, uAlto, pow( smoothstep( 0.0, ${f(CIELO_DE_DIA.degrade)}, alto ), 0.8 ) );
}
// La bruma que se come lo lejano cerca del horizonte (las nubes de bloques y de polvo también la llevan).
float brumaDelCielo( float alto ) {
	return 1.0 - smoothstep( 0.0, ${f(CIELO_DE_DIA.bruma)}, alto );
}
#ifdef CIELO_PINTADO
vec3 cieloPintado( vec3 d ) {
	float alto = d.y;
	vec3 color = cieloSolo( alto );
	float azimut = atan( d.x, d.z );
	float elevacion = asin( clamp( alto, -1.0, 1.0 ) );
	// Las nubes pintadas: un fbm estirado a lo ancho, con la pincelada (un ruido fino a lo largo).
	vec2 p = vec2( azimut * ${f(P.nubes.ancho)}, elevacion * ${f(P.nubes.alto)} );
	float n = fbmDelCielo( p + vec2( 3.1, 7.7 ) ) + 0.06 * ( ruidoDelCielo( vec2( p.x * 9.0, p.y * 1.5 ) ) - 0.5 );
	float nube = smoothstep( ${f(P.nubes.umbral)}, ${f(P.nubes.umbral + P.nubes.borde)}, n ) * smoothstep( 0.01, 0.08, alto );
	// La sombra de abajo de la nube: donde la de un poco más abajo es menos densa.
	float abajo = fbmDelCielo( p - vec2( 0.0, 0.35 ) + vec2( 3.1, 7.7 ) );
	vec3 deLaNube = mix( uSombra, uNube, smoothstep( -0.05, 0.12, n - abajo + 0.04 ) );
	color = mix( color, deLaNube, nube );
	color = mix( color, uNiebla, brumaDelCielo( alto ) * 0.85 );
	// Los paneles: la unión (un píxel, un poco más oscura) y el tono de cada panel, apenas distinto.
	if ( alto > 0.0 ) {
		float a = azimut / 6.2831853 * ${f(P.paneles)};
		float b = degrees( elevacion ) / ${f(P.cadaGrados)};
		vec2 lejos = vec2( min( fract( a ), 1.0 - fract( a ) ) / max( fwidth( a ), 1e-5 ), min( fract( b ), 1.0 - fract( b ) ) / max( fwidth( b ), 1e-5 ) );
		float junta = 1.0 - smoothstep( 0.4, 1.2, min( lejos.x, lejos.y ) );
		float tono = azarDelCielo( floor( vec2( a, b ) ) ) - 0.5;
		color *= ( 1.0 - ${f(P.union)} * junta ) * ( 1.0 + ${f(P.tono)} * tono );
	}
	return color;
}
#endif
`
