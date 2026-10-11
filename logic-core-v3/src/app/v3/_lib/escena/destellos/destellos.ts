import { TEXTO_EN_PANTALLA } from './textoEnPantalla'
import { VARIANTES_DE_DESTELLOS, type VarianteDeDestellos } from './variantes'

export { VARIANTES_DE_DESTELLOS, type VarianteDeDestellos }

/**
 * [PULIDO 14] L3 · LOS DESTELLOS DE ENERGÍA (`?destellos=<variante>`: exploración; sin la bandera, el polvo de siempre). Los hilos
 * de PULIDO 11–13 no gustaron y se borraron. El pedido, en las palabras del humano: «no hilos, sino destellos de energía, sueltos,
 * y si paso el mouse hacen como el efecto de unirse un poco»; las referencias: partículas de energía, espacio, infinito, agujero
 * negro, lo cósmico (estallidos radiales de chispas, espirales galácticas, esferas de luz). Y volumen es CANTIDAD: decenas de miles,
 * muchos más que el polvo (3000).
 *
 * Todo en la GPU: una nube de puntos (`gl.POINTS`) sin posiciones guardadas (cada vértice es una semilla y el sombreador calcula
 * dónde está en este cuadro, en función del tiempo): una llamada de dibujo, sin simulación. Profundidad de verdad: el tamaño en la
 * pantalla es el del mundo a esa distancia (lejos, chicos) y el brillo se apaga con la lejanía (lejos, tenues y difusos). Cada
 * destello titila y los más brillantes tienen un brillo en cruz chico. Detrás de una caja de texto se apagan (pasan por detrás). En
 * el final del pie se apagan con la cámara que sube (la energía del piso manda). De noche, luz que suma (blanco luminoso); de día,
 * tinta con un halo claro. `?destellos-color=si`: un azul frío (cian de noche).
 *
 * El puntero (el mouse o el dedo) en la pantalla, con su alcance (`puntero.radio`), y lo que pasa al irse (`suelta`):
 *   · `chispas`: a la deriva; con el puntero se juntan sueltos hacia él y aparecen trazos tenues entre vecinos (una constelación
 *     que se forma: `constelacion`); al irse, se sueltan.
 *   · `agujero`: el puntero es un pozo de gravedad: los cercanos entran en órbita espiral (más rápida adentro), se estiran en estelas
 *     y se aprietan (un disco de acreción); al irse, siguen girando y se dispersan con inercia.
 *   · `infinito`: el símbolo de la marca: cerca del puntero se alinean en corrientes que dibujan un ∞ alrededor de él, en movimiento;
 *     sin puntero, cada tanto un ∞ se insinúa en el campo y se deshace.
 *   · `estallido`: cada tanto, en un punto al azar, un estallido radial suave de chispas que se frenan y quedan flotando; con el
 *     puntero se condensan en un núcleo brillante y al irse lo liberan en un estallido.
 *   · `galaxia`: el campo entero gira lento en espiral alrededor del logo (el centro de energía); con el puntero, un brazo local se
 *     curva y se une hacia él.
 *   · `lente` (propuesta): el campo de estrellas a tres profundidades con estrellas fugaces; el puntero es una lente gravitatoria:
 *     la luz de las de atrás se curva a su alrededor, se apilan en un anillo (el de Einstein) y brillan más ahí.
 */

export const DESTELLOS = {
  /** Cuántos destellos (el máximo medido dentro del cuadro: `docs/rediseno/entregas/pulido-14/l3-destellos.json`) y en el teléfono. */
  cantidad: 96000,
  cantidadCompacta: 48000,
  /** Dónde viven: una esfera alrededor del logo (u: el radio, y el hueco del medio, donde está el logo). */
  volumen: { radio: 26, hueco: 3.2 },
  /** El tamaño en el mundo (u, del más chico al más grande) y los topes en la pantalla (px de CSS). */
  tamano: [0.05, 0.2],
  pantalla: { minimo: 1, maximo: 26 },
  /** La lejanía: desde qué distancia de la cámara (u) se apagan y en cuánto (u). */
  lejania: { desde: 18, tramo: 50 },
  /** La deriva: cuánto se mueve cada uno alrededor de su lugar (u) y a qué ritmo (Hz); el giro lento del campo (rad/s). */
  deriva: { amplitud: 0.9, hz: [0.03, 0.12], giro: 0.012 },
  /** El titileo (Hz, del más lento al más rápido) y qué parte lleva brillo en cruz. */
  titila: { hz: [0.15, 0.9], cruz: 0.22 },
  /** El puntero, en NDC con el aspecto: su alcance; la activación sube en `tomaS` y se suelta en `sueltaS`; quieto, se suelta a los `quietoS`. */
  puntero: { radio: 0.42, tomaS: 0.15, sueltaS: 1.8, quietoS: 2.5 },
  /** La inercia al soltar (agujero, estallido): el empujón hacia afuera (NDC) y en cuánto se frena y vuelve (s). */
  suelta: { empujon: 0.32, frenaS: 0.35, vuelveS: 2.4 },
  /** `chispas`: cuánto se juntan y la constelación (cuántos de los destellos llevan trazos, a cuántos vecinos y hasta qué largo en px de CSS). */
  chispas: { junta: 0.55, constelacion: 12000, vecinos: 3, largoPx: 140 },
  /** `agujero`: la velocidad angular en el borde del pozo (rad/s), cuánto se aprieta el disco y el largo de las estelas (px por rad/s). */
  agujero: { giro: 0.55, aprieta: 0.62, estela: 2.2 },
  /** `infinito`: el ancho del ∞ (NDC), la velocidad por el símbolo (rad/s), qué parte se alinea y cada cuánto se insinúa solo (s). */
  infinito: { ancho: 0.26, velocidad: 0.9, alinea: 0.85, alcance: 1.6, solo: { cadaS: 9, duraS: 4.5 } },
  /** `estallido`: qué parte de los destellos son de estallidos, cuántos a la vez, cada cuánto, su velocidad (u/s) y su frenado (s). */
  estallido: { parte: 0.32, aLaVez: 10, cadaS: 7.5, velocidad: 7, frenaS: 0.55 },
  /** `galaxia`: los brazos, su enrosque, el radio (u), su espesor, la velocidad en el borde de adentro (rad/s) y la parte del halo. */
  galaxia: { brazos: 2, enrosque: 2.4, radio: [3.5, 24], espesor: 1.1, giro: 0.16, halo: 0.22 },
  /** `lente`: el radio del anillo (NDC) y el tope del brillo; las estrellas fugaces (cuántas a la vez y cada cuánto). */
  lente: { anillo: 0.16, brilloMaximo: 6, fugaces: { aLaVez: 3, cadaS: 6 } },
  /** Cuánto se ve: de día (tinta) y de noche (luz que suma). */
  opacidad: { dia: 0.78, noche: 0.85 },
  /** Detrás del texto, cuánto se apagan. */
  texto: { apaga: 0.94 },
} as const

/** El índice de cada variante en el sombreador (`#define VARIANTE`). */
export function indiceDeLaVariante(v: VarianteDeDestellos): number {
  return VARIANTES_DE_DESTELLOS.indexOf(v)
}

/** Un número estable en [0, 1) para el destello `i` y el canal `c` (sin `Math.random`: los destellos son siempre los mismos). */
export function azarDelDestello(i: number, c: number): number {
  const x = Math.sin(i * 127.1 + c * 311.7 + 0.5) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Las semillas: `a` = el lugar en la esfera unitaria (xyz; la distribución pareja en el volumen, sin el hueco) y el tamaño (w);
 * `b` = la fase del titileo, su ritmo, la fase de la deriva y un azar para los subconjuntos (los de estallido, los que se alinean).
 */
export function semillasDeLosDestellos(n: number): { readonly a: Float32Array; readonly b: Float32Array } {
  const a = new Float32Array(n * 4)
  const b = new Float32Array(n * 4)
  const hueco = DESTELLOS.volumen.hueco / DESTELLOS.volumen.radio
  for (let i = 0; i < n; i += 1) {
    // Pareja en el volumen: la dirección uniforme en la esfera y el radio con la raíz cúbica (entre el hueco y el borde).
    const z = azarDelDestello(i, 0) * 2 - 1
    const fi = azarDelDestello(i, 1) * Math.PI * 2
    const s = Math.sqrt(1 - z * z)
    const r = Math.cbrt(hueco ** 3 + azarDelDestello(i, 2) * (1 - hueco ** 3))
    a[i * 4] = Math.cos(fi) * s * r
    a[i * 4 + 1] = z * r
    a[i * 4 + 2] = Math.sin(fi) * s * r
    // Muchos chicos y pocos grandes.
    a[i * 4 + 3] = azarDelDestello(i, 3) ** 3
    b[i * 4] = azarDelDestello(i, 4)
    b[i * 4 + 1] = azarDelDestello(i, 5)
    b[i * 4 + 2] = azarDelDestello(i, 6)
    b[i * 4 + 3] = azarDelDestello(i, 7)
  }
  return { a, b }
}

/**
 * `chispas`: los pares de la constelación entre los primeros `m` destellos: cada uno con sus `vecinos` más cercanos en su lugar de
 * la esfera (una grilla: lineal en la cantidad). Devuelve los índices de los extremos (dos por trazo, sin repetir el par).
 */
export function paresDeLaConstelacion(a: Float32Array, m: number, vecinos: number): Uint32Array {
  const lado = 14
  const celda = (v: number): number => Math.min(lado - 1, Math.max(0, Math.floor(((v + 1) / 2) * lado)))
  const grilla = new Map<number, number[]>()
  for (let i = 0; i < m; i += 1) {
    const k = (celda(a[i * 4]) * lado + celda(a[i * 4 + 1])) * lado + celda(a[i * 4 + 2])
    const g = grilla.get(k)
    if (g === undefined) grilla.set(k, [i])
    else g.push(i)
  }
  const pares: number[] = []
  const vistos = new Set<string>()
  for (let i = 0; i < m; i += 1) {
    const [x, y, z] = [a[i * 4], a[i * 4 + 1], a[i * 4 + 2]]
    const [cx, cy, cz] = [celda(x), celda(y), celda(z)]
    const cerca: [number, number][] = []
    for (let dx = -1; dx <= 1; dx += 1)
      for (let dy = -1; dy <= 1; dy += 1)
        for (let dz = -1; dz <= 1; dz += 1) {
          const g = grilla.get(((cx + dx) * lado + (cy + dy)) * lado + (cz + dz))
          if (g === undefined || cx + dx < 0 || cy + dy < 0 || cz + dz < 0 || cx + dx >= lado || cy + dy >= lado || cz + dz >= lado) continue
          for (const j of g) if (j !== i) cerca.push([j, (a[j * 4] - x) ** 2 + (a[j * 4 + 1] - y) ** 2 + (a[j * 4 + 2] - z) ** 2])
        }
    cerca.sort((p, q) => p[1] - q[1])
    for (const [j] of cerca.slice(0, vecinos)) {
      const clave = i < j ? `${String(i)}-${String(j)}` : `${String(j)}-${String(i)}`
      if (vistos.has(clave)) continue
      vistos.add(clave)
      pares.push(i, j)
    }
  }
  return Uint32Array.from(pares)
}

/** La activación del puntero (0 a 1): sube rápido hacia lo que pide y se suelta despacio. */
export function activacionDelPuntero(anterior: number, pide: boolean, dt: number): number {
  const P = DESTELLOS.puntero
  const objetivo = pide ? 1 : 0
  return objetivo + (anterior - objetivo) * Math.exp(-Math.max(0, dt) / (objetivo > anterior ? P.tomaS : P.sueltaS))
}

/** Un número para el sombreador (siempre con punto decimal). */
const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

const D = DESTELLOS

/**
 * Lo que comparten los puntos y los trazos de la constelación: dónde está un destello en el cuadro (su posición de recorte) y cómo
 * se ve (su brillo, su tamaño en px, su estela). La variante se elige al compilar (`#define VARIANTE`).
 */
const DESTELLO_GLSL = /* glsl */ `
uniform float uTiempo;
uniform vec3 uCentro;
uniform vec2 uResolucion;
uniform float uPixel;
uniform float uEscalaPx;
uniform vec2 uCursor;
uniform float uAspecto;
uniform float uActivo;
uniform float uCaptura;
uniform vec2 uSoltado;
uniform float uSuelta;
uniform float uSoltada;
uniform vec4 uTextos[ ${String(TEXTO_EN_PANTALLA.cajas)} ];
uniform float uCuantosTextos;
float azar( float x ) { return fract( sin( x * 127.1 + 311.7 ) * 43758.5453 ); }
vec2 girar( vec2 v, float a ) { float c = cos( a ), s = sin( a ); return vec2( c * v.x - s * v.y, s * v.x + c * v.y ); }
// Cuánto adentro de una caja de texto (con su aire) está un punto de la pantalla (NDC): 0 afuera, 1 adentro, suave en el borde.
float adentroDelTexto( vec2 s ) {
	float m = 0.0;
	for ( int r = 0; r < ${String(TEXTO_EN_PANTALLA.cajas)}; r ++ ) {
		if ( float( r ) >= uCuantosTextos ) break;
		vec4 c = uTextos[ r ];
		// El borde del apagado, ancho (36 px): un campo denso no deja un rectángulo de bordes duros detrás del texto.
		vec2 borde = 36.0 / uResolucion * uPixel;
		float x = smoothstep( c.x - borde.x, c.x + borde.x, s.x ) * ( 1.0 - smoothstep( c.z - borde.x, c.z + borde.x, s.x ) );
		float y = smoothstep( c.y - borde.y, c.y + borde.y, s.y ) * ( 1.0 - smoothstep( c.w - borde.y, c.w + borde.y, s.y ) );
		m = max( m, x * y );
	}
	return m;
}
// El lugar del destello en el mundo (antes del puntero): su lugar, su deriva y el giro lento del campo; cada variante el suyo.
vec3 lugarDelDestello( vec4 sA, vec4 sB, out float brillo ) {
	float t = uTiempo;
	vec3 p = sA.xyz * ${f(D.volumen.radio)};
	brillo = 1.0;
#if VARIANTE == 4
	// galaxia: los brazos de una espiral logarítmica en un disco inclinado, con rotación diferencial (adentro más rápido); y un halo.
	if ( sB.w > ${f(D.galaxia.halo)} ) {
		float r = mix( ${f(D.galaxia.radio[0])}, ${f(D.galaxia.radio[1])}, sqrt( fract( sB.w * 7.13 ) ) );
		float brazo = floor( fract( sB.x * 3.7 ) * ${f(D.galaxia.brazos)} ) * 6.2831853 / ${f(D.galaxia.brazos)};
		float abre = ( fract( sB.z * 5.3 ) - 0.5 ) * mix( 0.9, 0.35, r / ${f(D.galaxia.radio[1])} );
		float th = brazo + ${f(D.galaxia.enrosque)} * log( r / ${f(D.galaxia.radio[0])} ) + abre - t * ${f(D.galaxia.giro)} * sqrt( ${f(D.galaxia.radio[0])} / r );
		float y = ( fract( sA.w * 9.1 + sB.y ) - 0.5 ) * ${f(D.galaxia.espesor)} * 2.0 * ( 1.0 - 0.6 * r / ${f(D.galaxia.radio[1])} );
		p = vec3( cos( th ) * r, y, sin( th ) * r );
		p.yz = girar( p.yz, 0.42 );
		p.xy = girar( p.xy, 0.18 );
		brillo = mix( 0.95, 0.6, r / ${f(D.galaxia.radio[1])} );
	} else {
		p *= 1.1;
		p.xz = girar( p.xz, - t * ${f(D.galaxia.giro * 0.15)} );
		brillo = 0.55;
	}
	return uCentro + p;
#else
	// El giro lento del campo alrededor del logo y la deriva de cada uno (tres senos de ritmos distintos).
	p.xz = girar( p.xz, t * ${f(D.deriva.giro)} * ( 0.6 + sB.y ) );
	float hz = mix( ${f(D.deriva.hz[0])}, ${f(D.deriva.hz[1])}, sB.y ) * 6.2831853;
	vec3 fase = vec3( sB.z, sB.x, sB.w ) * 6.2831853;
	p += ${f(D.deriva.amplitud)} * vec3( sin( t * hz + fase.x ), sin( t * hz * 1.31 + fase.y ), sin( t * hz * 0.77 + fase.z ) );
#endif
#if VARIANTE == 3
	// estallido: algunos son de estallidos; cada estallido nace en un punto al azar, sale radial y se frena, y queda flotando.
	if ( sB.w < ${f(D.estallido.parte)} ) {
		float k = floor( fract( sB.w * 13.7 ) * ${f(D.estallido.aLaVez)} );
		float periodo = ${f(D.estallido.cadaS)} * ( 0.8 + 0.4 * azar( k ) );
		float tt = t + azar( k + 3.1 ) * periodo;
		float epoca = floor( tt / periodo );
		float tau = tt - epoca * periodo;
		vec3 centro = ( vec3( azar( k * 7.0 + epoca ), azar( k * 11.0 + epoca + 0.3 ), azar( k * 13.0 + epoca + 0.7 ) ) * 2.0 - 1.0 ) * vec3( 14.0, 7.0, 10.0 );
		vec3 dir = normalize( sA.xyz + vec3( 1e-4 ) );
		float vel = ${f(D.estallido.velocidad)} * ( 0.45 + 0.55 * fract( sB.x * 3.3 ) );
		p = centro + dir * vel * ${f(D.estallido.frenaS)} * ( 1.0 - exp( - tau / ${f(D.estallido.frenaS)} ) );
		brillo = ( 0.6 + 2.6 * exp( - tau / 0.22 ) ) * smoothstep( 0.0, 0.05, tau ) * ( 1.0 - smoothstep( periodo * 0.72, periodo, tau ) );
	}
#endif
#if VARIANTE == 5
	// lente: tres profundidades (las de atrás, más lejos y más chicas) y las fugaces (cruzan rápido, cada tanto).
	p *= mix( 1.0, 1.6, step( 0.66, sB.w ) );
	if ( sB.w < 0.004 ) {
		float k = floor( sB.w / 0.004 * ${f(D.lente.fugaces.aLaVez)} );
		float periodo = ${f(D.lente.fugaces.cadaS)} * ( 0.7 + 0.6 * azar( k + 9.0 ) );
		float tt = t + azar( k ) * periodo;
		float epoca = floor( tt / periodo );
		float tau = ( tt - epoca * periodo ) / 0.9;
		vec3 desde = ( vec3( azar( k + epoca * 3.0 ), azar( k + epoca * 5.0 + 0.2 ), azar( k + epoca * 7.0 + 0.4 ) ) * 2.0 - 1.0 ) * vec3( 18.0, 9.0, 12.0 );
		vec3 hacia = desde + normalize( vec3( azar( k + epoca ) - 0.5, - 0.35, azar( k + epoca + 1.0 ) - 0.5 ) ) * 16.0;
		p = mix( desde, hacia, clamp( tau - sB.x * 0.08, 0.0, 1.0 ) );
		brillo = tau < 1.0 ? 3.0 * sin( 3.1415927 * clamp( tau, 0.0, 1.0 ) ) : 0.0;
	}
#endif
	return uCentro + p;
}
// El destello en el cuadro: la posición de recorte (con el puntero), su brillo, su tamaño en px y su estela (dirección y largo, px).
vec4 destelloEnElCuadro( vec4 sA, vec4 sB, out float brillo, out float tam, out vec2 estela, out float lejos, out float texto, out float cerca ) {
	vec3 mundo = lugarDelDestello( sA, sB, brillo );
	vec4 c = projectionMatrix * viewMatrix * vec4( mundo, 1.0 );
	estela = vec2( 0.0 );
	cerca = 0.0;
	texto = 0.0;
	lejos = 1.0;
	tam = 0.0;
	if ( c.w < 0.6 ) return vec4( 2.0, 2.0, 2.0, 1.0 );
	vec2 s = c.xy / c.w;
	vec2 asp = vec2( uAspecto, 1.0 );
	// El puntero: activo (sigue al cursor) o soltado (donde se soltó, con lo que quedaba de la activación).
	vec2 rel = ( s - uCursor ) * asp;
	float d = length( rel );
	float f = uActivo * exp( - pow( d / ${f(D.puntero.radio)}, 2.0 ) );
	vec2 relS = ( s - uSoltado ) * asp;
	float dS = length( relS );
	float fS = uSoltada * exp( - pow( dS / ${f(D.puntero.radio)}, 2.0 ) );
	float empujon = ( 1.0 - exp( - uSuelta / ${f(D.suelta.frenaS)} ) ) * exp( - uSuelta / ${f(D.suelta.vuelveS)} );
#if VARIANTE == 0
	// chispas: se juntan sueltos hacia el puntero (un poco, con un giro leve) y se encienden.
	s = uCursor + girar( rel * ( 1.0 - ${f(D.chispas.junta)} * f ), 0.35 * f * ( sB.x - 0.5 ) ) / asp;
	brillo *= 1.0 + 1.8 * f;
#elif VARIANTE == 1
	// agujero: en órbita alrededor del pozo (más rápida adentro), apretados en un disco; al soltar siguen girando y se dispersan.
	float queda = fS * exp( - uSuelta / ${f(D.suelta.vuelveS)} );
	float w = max( f, queda );
	bool activo = f >= queda;
	vec2 centro = activo ? uCursor : uSoltado;
	vec2 r0 = activo ? rel : relS;
	float d0 = length( r0 );
	float om = ${f(D.agujero.giro)} / ( d0 + 0.035 );
	// Soltado, sigue girando y se frena (la inercia); activo, uSuelta es 0.
	float giro = om * ( uCaptura + 1.2 * ( 1.0 - exp( - uSuelta / 1.2 ) ) );
	vec2 enDisco = girar( r0 * ( 1.0 - ${f(D.agujero.aprieta)} * w ), giro );
	s = mix( s, centro + enDisco / asp, w );
	vec2 afuera = dS > 1e-4 ? relS / dS : vec2( 0.0 );
	s += afuera * ${f(D.suelta.empujon)} * empujon * fS / asp;
	vec2 tg = d0 > 1e-4 ? vec2( - r0.y, r0.x ) / d0 : vec2( 0.0 );
	estela = tg * min( 46.0, om * d0 * ${f(D.agujero.estela)} * 60.0 ) * w;
	brillo *= 1.0 + 1.6 * w * exp( - d0 * 4.0 );
#elif VARIANTE == 2
	// infinito: los que se alinean corren por un ∞ alrededor del puntero; sin puntero, cada tanto uno se insinúa solo en el campo.
	float sobre = step( 1.0 - ${f(D.infinito.alinea)}, sB.w );
	float fase = sB.x * 6.2831853 + uTiempo * ${f(D.infinito.velocidad)} * ( 0.8 + 0.4 * sB.y );
	float den = 1.0 + sin( fase ) * sin( fase );
	vec2 lem = vec2( cos( fase ), sin( fase ) * cos( fase ) ) / den * ${f(D.infinito.ancho)};
	vec2 ancho = ( vec2( azar( sB.z ), azar( sB.z + 0.5 ) ) - 0.5 ) * 0.018;
	float fI = uActivo * exp( - pow( d / ${f(D.puntero.radio * D.infinito.alcance)}, 2.0 ) );
	float compromete = smoothstep( 0.08, 0.55, fI ) * sobre;
	s = mix( s, uCursor + ( lem + ancho ) / asp, compromete );
	float ep = floor( uTiempo / ${f(D.infinito.solo.cadaS)} );
	float tau = uTiempo - ep * ${f(D.infinito.solo.cadaS)};
	float env = smoothstep( 0.0, 1.3, tau ) * ( 1.0 - smoothstep( ${f(D.infinito.solo.duraS - 1.6)}, ${f(D.infinito.solo.duraS)}, tau ) );
	vec2 solo = vec2( azar( ep * 3.7 ) * 1.2 - 0.6, azar( ep * 5.3 + 0.4 ) * 1.0 - 0.5 );
	float fSolo = env * exp( - pow( length( ( s - solo ) * asp ) / ${f(D.puntero.radio * 0.9)}, 2.0 ) ) * sobre * ( 1.0 - f );
	s = mix( s, solo + ( lem * 1.1 + ancho ) / asp, fSolo * 0.85 );
	brillo *= 1.0 + 2.4 * max( compromete, fSolo );
	f = max( compromete, fSolo );
#elif VARIANTE == 3
	// estallido: con el puntero, un núcleo que se condensa y brilla; al soltar, el estallido.
	vec2 nucleo = rel * ( 1.0 - 0.86 * f ) + ( vec2( azar( sB.x ), azar( sB.y ) ) - 0.5 ) * 0.02 * f;
	vec2 afuera = dS > 1e-4 ? relS / dS : vec2( 0.0 );
	s = uCursor + nucleo / asp;
	s += afuera * ${f(D.suelta.empujon * 1.6)} * empujon * fS * ( 0.5 + fract( sB.z * 7.7 ) ) / asp;
	brillo *= 1.0 + 3.0 * f * exp( - d * 5.0 ) + 1.8 * fS * exp( - uSuelta / 0.4 );
#elif VARIANTE == 4
	// galaxia: un brazo local que se curva hacia el puntero y se une.
	s = uCursor + girar( rel * ( 1.0 - 0.38 * f ), 0.85 * f * ( 1.0 - d / ${f(D.puntero.radio * 1.6)} ) ) / asp;
	brillo *= 1.0 + 0.9 * f;
#elif VARIANTE == 5
	// lente: la imagen de afuera de una lente puntual (d' = (d + √(d² + 4θ²)) / 2) y su brillo (la magnificación, con tope).
	float te = ${f(D.lente.anillo)} * uActivo;
	if ( te > 1e-4 ) {
		float dp = 0.5 * ( d + sqrt( d * d + 4.0 * te * te ) );
		s = uCursor + ( d > 1e-5 ? rel / d * dp : vec2( te, 0.0 ) ) / asp;
		float u = max( d / te, 1e-3 );
		brillo *= mix( 1.0, min( ${f(D.lente.brilloMaximo)}, ( u * u + 2.0 ) / ( u * sqrt( u * u + 4.0 ) ) ), uActivo );
	}
#endif
	cerca = clamp( f, 0.0, 1.0 );
	lejos = clamp( ( c.w - ${f(D.lejania.desde)} ) / ${f(D.lejania.tramo)}, 0.0, 1.0 );
	float mundoTam = mix( ${f(D.tamano[0])}, ${f(D.tamano[1])}, sA.w );
	tam = clamp( uEscalaPx * mundoTam / c.w * ( 1.0 + 0.6 * cerca ), ${f(D.pantalla.minimo)} * uPixel, ${f(D.pantalla.maximo)} * uPixel );
	texto = adentroDelTexto( s );
	return vec4( s * c.w, c.z, c.w );
}
`

/** El sombreador de los puntos. */
export const VERTICES_DE_LOS_DESTELLOS = /* glsl */ `
attribute vec4 aSemillaA;
attribute vec4 aSemillaB;
varying float vBrillo;
varying float vLejos;
varying float vTexto;
varying float vCruz;
varying float vTam;
varying vec2 vEstela;
${DESTELLO_GLSL}
void main() {
	float brillo, tam, lejos, texto, cerca;
	vec2 estela;
	gl_Position = destelloEnElCuadro( aSemillaA, aSemillaB, brillo, tam, estela, lejos, texto, cerca );
	// El titileo: lento y suave en casi todos; los que tienen cruz, con picos.
	float hz = mix( ${f(D.titila.hz[0])}, ${f(D.titila.hz[1])}, aSemillaB.y ) * 6.2831853;
	float tw = 0.5 + 0.5 * sin( uTiempo * hz + aSemillaB.x * 6.2831853 );
	vCruz = step( 1.0 - ${f(D.titila.cruz)}, aSemillaB.x ) * pow( tw, 6.0 ) * ( 1.0 - lejos );
	vBrillo = brillo * mix( 0.35, 1.0, tw * tw );
	vLejos = lejos;
	vTexto = texto;
	float largo = length( estela ) * uPixel;
	vEstela = largo > 0.5 ? estela * uPixel : vec2( 0.0 );
	// El punto mide tres veces el núcleo (el halo entra entero) y la estela lo agranda (el de fragmentos dibuja la elipse adentro).
	vTam = tam;
	gl_PointSize = tam * 3.0 * ( 1.0 + 0.6 * vCruz ) + largo;
}
`

/** El sombreador de los fragmentos de un punto: el núcleo, el halo, la cruz, la estela, la lejanía, el texto, el día y la noche. */
export const FRAGMENTOS_DE_LOS_DESTELLOS = /* glsl */ `
uniform vec3 uColorDia;
uniform vec3 uColorNoche;
uniform float uNoche;
uniform float uApagado;
varying float vBrillo;
varying float vLejos;
varying float vTexto;
varying float vCruz;
varying float vTam;
varying vec2 vEstela;
void main() {
	vec2 p = gl_PointCoord - 0.5;
	p.y = - p.y;
	float total = vTam * 3.0 * ( 1.0 + 0.6 * vCruz ) + length( vEstela );
	// En px del punto; con estela, la distancia a un segmento (la estela) en lugar de a un punto.
	vec2 px = p * total;
	float largo = length( vEstela );
	vec2 eje = largo > 0.5 ? vEstela / largo : vec2( 1.0, 0.0 );
	float a1 = clamp( dot( px, eje ), - largo * 0.5, largo * 0.5 );
	float r = length( px - eje * a1 ) / max( 0.5, vTam * 0.5 );
	float nucleo = exp( - r * r * mix( 7.0, 3.5, vLejos ) );
	float halo = exp( - r * r * 1.4 ) * mix( 0.18, 0.4, uNoche );
	// La cruz: dos rayos finos (el destello de una lente), sólo en los que la llevan.
	vec2 q = abs( px ) / max( 0.5, total * 0.5 );
	float cruz = vCruz * ( exp( - q.y * 26.0 ) * ( 1.0 - q.x ) + exp( - q.x * 26.0 ) * ( 1.0 - q.y ) ) * 0.9;
	float a = ( nucleo + halo + cruz ) * vBrillo * mix( ${f(D.opacidad.dia)}, ${f(D.opacidad.noche)}, uNoche ) * ( 1.0 - 0.75 * vLejos ) * ( 1.0 - uApagado ) * ( 1.0 - ${f(D.texto.apaga)} * vTexto );
	if ( a < 0.004 ) discard;
	vec3 color = mix( uColorDia, uColorNoche, uNoche );
	// De día, el halo es claro (separa la tinta del fondo); de noche, todo suma luz.
	vec3 conHalo = mix( color, vec3( 1.0 ), halo / max( 1e-3, nucleo + halo + cruz ) * ( 1.0 - uNoche ) * 0.85 );
	gl_FragColor = vec4( conHalo * a, a * ( 1.0 - uNoche ) );
}
`

/** El sombreador de los trazos de la constelación (`chispas`): cada extremo calcula su destello y el del otro (el largo en px). */
export const VERTICES_DE_LA_CONSTELACION = /* glsl */ `
attribute vec4 aSemillaA;
attribute vec4 aSemillaB;
attribute vec4 aOtroA;
attribute vec4 aOtroB;
varying float vTrazo;
varying float vTexto;
${DESTELLO_GLSL}
void main() {
	float b0, t0, l0, x0, c0, b1, t1, l1, x1, c1;
	vec2 e0, e1;
	vec4 p = destelloEnElCuadro( aSemillaA, aSemillaB, b0, t0, e0, l0, x0, c0 );
	vec4 o = destelloEnElCuadro( aOtroA, aOtroB, b1, t1, e1, l1, x1, c1 );
	gl_Position = p;
	vec2 largo = ( p.xy / p.w - o.xy / o.w ) * uResolucion * 0.5 / uPixel;
	vTrazo = min( c0, c1 ) * ( 1.0 - smoothstep( ${f(D.chispas.largoPx * 0.5)}, ${f(D.chispas.largoPx)}, length( largo ) ) ) * ( 1.0 - max( l0, l1 ) * 0.7 );
	vTexto = max( x0, x1 );
}
`

export const FRAGMENTOS_DE_LA_CONSTELACION = /* glsl */ `
uniform vec3 uColorDia;
uniform vec3 uColorNoche;
uniform float uNoche;
uniform float uApagado;
varying float vTrazo;
varying float vTexto;
void main() {
	float a = vTrazo * mix( 0.28, 0.42, uNoche ) * ( 1.0 - uApagado ) * ( 1.0 - ${f(D.texto.apaga)} * vTexto );
	if ( a < 0.004 ) discard;
	vec3 color = mix( uColorDia, uColorNoche, uNoche );
	gl_FragColor = vec4( color * a, a * ( 1.0 - uNoche ) );
}
`
