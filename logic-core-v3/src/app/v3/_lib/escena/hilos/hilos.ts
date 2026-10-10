/**
 * [PULIDO 11] E · LOS HILOS DE ENERGÍA (`?hilos=si`: exploración; sin la bandera, el polvo de siempre) — en lugar del polvo,
 * hilos de energía plasmática alrededor del logo: cada hilo es una cinta que sigue a su cabeza por un campo de curl (sin
 * divergencia: se tuercen y se cruzan sin juntarse en un punto) y deja su estela; por la estela corren cuentas de energía (laten).
 * De noche, blancos con resplandor (suman luz); de día, de tinta sobre el papel; monocromo, sin el rojo del error.
 *
 * [PULIDO 13] K6 · CON VOLUMEN: ya no son cintas sueltas sino HACES de muchas fibras finas que corren juntas (cintas de luz, fibras:
 * las referencias 1, 3 y 5). Cada haz tiene su espina (la cabeza de antes: órbita más curl) y sus fibras van alrededor de ella, en
 * 3D, enroscadas en hélice a lo largo de la estela y respirando (unos haces anchos, otros finos). Donde las fibras se juntan —en el
 * medio del haz— la luz se suma: un núcleo brillante con un halo suave (refs. 1 y 2). Más rápido corre el haz, más brilla su estela
 * (ref. 4). Lejos, más tenues y difusos; cerca, nítidos. Unas pocas fibras llevan chispas (las cuentas: sobrio). No cruzan el
 * texto: detrás de una caja de texto se apagan (pasan por detrás). `?hilos=color`: en un azul frío, para comparar.
 *
 * Todo en la GPU: una sola llamada de dibujo (una fibra por instancia), sin simulación ni texturas. La espina de cada haz es una
 * función ANALÍTICA del tiempo, así la estela es la misma función en el pasado: cada vértice evalúa su punto y el anterior (la
 * tangente) y se abre de costado en píxeles de pantalla.
 *
 * El puntero (el mouse o el dedo): los hilos cercanos lo RODEAN (giran alrededor de él en la pantalla y se acercan a un anillo),
 * vibran y se encienden; al irse el puntero se sueltan despacio (`activacionDelPuntero`). En el final del pie se apagan con la
 * cámara que sube (no compiten con la energía del piso).
 */
export const HILOS = {
  /** [PULIDO 13] K6 · cuántos haces y cuántas fibras tiene cada uno (la cantidad de cintas: una por fibra). */
  haces: 16,
  fibras: 16,
  /** Cuántos hilos (fibras) y cuántos puntos tiene cada estela. */
  cantidad: 16 * 16,
  puntos: 96,
  /** Cuánto pasado dibuja la estela (s): larga, para que el haz se lea como una cinta que fluye. */
  colaS: 4.5,
  /** [PULIDO 13] K6 · la fibra en la pantalla (px de CSS): su núcleo y su halo (la cinta mide los dos), y el halo de lejos. */
  fibra: { nucleo: 1.1, halo: 5, haloLejos: 9 },
  /**
   * [PULIDO 13] K6 · el ancho del haz (u, el radio de sus fibras alrededor de la espina): del más fino al más ancho; cuánto respira
   * y cuánto se aplana (el espesor de la cinta, fracción de su ancho: un haz es una cinta de fibras, no un tubo).
   */
  abertura: [0.2, 1.5],
  respira: 0.35,
  plano: 0.3,
  /** [PULIDO 13] K6 · cuántas vueltas da una fibra alrededor de la espina a lo largo de la estela (la hélice) y cuánto gira en el tiempo. */
  helice: { vueltas: [0.4, 1.6], giraS: 0.5 },
  /** Dónde viven: un anillo alrededor del logo (u: radio de adentro y de afuera) y cuánto suben y bajan. */
  volumen: { radios: [4.2, 14], alto: 6 },
  /** Lo que gira cada hilo alrededor del logo (rad/s, de menos a más). */
  vuelta: [0.07, 0.2],
  /** El campo de curl: su frecuencia (1/u), cuánto desvía (u) y cuánto deriva en el tiempo. */
  curl: { frecuencia: 0.3, amplitud: 1.7, deriva: 0.13 },
  /** Las cuentas de energía (las chispas) que corren por la estela: cuántas, a qué velocidad y qué parte de las fibras las lleva. */
  pulso: { cuentas: 2.2, velocidad: 0.6, fibras: 0.18 },
  /** [PULIDO 13] K6 · la velocidad de la espina (u/s) a la que su estela brilla entera (más lenta, menos: las estelas de la ref. 4). */
  rapido: 4,
  /**
   * El puntero, en la pantalla (NDC con aspecto): el radio de alcance, cuánto gira un hilo alrededor (rad, en el centro), a qué
   * fracción del radio se aprieta el anillo, cuánto vibra (NDC) y cuánto se enciende (más luz y más ancho).
   */
  puntero: { radio: 0.34, abrazo: 2.9, anillo: 0.42, vibra: 0.0045, enciende: 1.4 },
  /** La activación: sube en `tomaS` y se suelta en `sueltaS` (s); el empuje del cursor de la escena que la prende del todo. */
  activacion: { tomaS: 0.12, sueltaS: 1.4, empujeEntero: 0.35 },
  /** Cuánto se ve cada fibra: de día (tinta) y de noche (luz que suma; muchas se suman en el núcleo del haz). */
  opacidad: { dia: 0.38, noche: 0.5 },
  /** [PULIDO 13] K6 · el texto: cuántas cajas se miran, cuánto aire alrededor (px de CSS) y cuánto se apagan detrás. */
  texto: { cajas: 8, margenPx: 14, apaga: 0.94 },
} as const

/** La activación del puntero (0 a 1): sube rápido hacia lo que pide el empuje y baja despacio (se sueltan suave). */
export function activacionDelPuntero(anterior: number, empuje: number, dt: number): number {
  const A = HILOS.activacion
  const objetivo = Math.min(1, Math.max(0, empuje / A.empujeEntero))
  const tau = objetivo > anterior ? A.tomaS : A.sueltaS
  return objetivo + (anterior - objetivo) * Math.exp(-Math.max(0, dt) / tau)
}

/** Un número pseudoaleatorio estable en [0, 1) para el hilo `i` y el canal `c` (sin `Math.random`: los hilos son siempre los mismos). */
export function azarDelHilo(i: number, c: number): number {
  const x = Math.sin(i * 127.1 + c * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Las semillas de cada fibra (cuatro números por canal). `a` y `b` son las de su HAZ (las mismas para todas sus fibras): el radio de
 * su órbita, su velocidad (con signo), su fase, su altura; la inclinación de su órbita (dos ángulos), el desfase de su campo y su
 * abertura. [PULIDO 13] K6 · `c`, las de la fibra: a qué distancia de la espina (0 a 1, más en el medio), en qué ángulo, cuántas
 * vueltas da (con signo) y si lleva chispas (y su desfase).
 */
export function semillasDeLosHilos(n: number = HILOS.cantidad): { readonly a: Float32Array; readonly b: Float32Array; readonly c: Float32Array } {
  const a = new Float32Array(n * 4)
  const b = new Float32Array(n * 4)
  const c = new Float32Array(n * 4)
  const [r0, r1] = HILOS.volumen.radios
  const [v0, v1] = HILOS.vuelta
  const [w0, w1] = HILOS.abertura
  const [h0, h1] = HILOS.helice.vueltas
  for (let i = 0; i < n; i += 1) {
    const haz = Math.floor(i / HILOS.fibras)
    a[i * 4] = r0 + (r1 - r0) * Math.sqrt(azarDelHilo(haz, 0))
    a[i * 4 + 1] = (v0 + (v1 - v0) * azarDelHilo(haz, 1)) * (azarDelHilo(haz, 2) < 0.5 ? -1 : 1)
    a[i * 4 + 2] = azarDelHilo(haz, 3) * Math.PI * 2
    a[i * 4 + 3] = (azarDelHilo(haz, 4) * 2 - 1) * HILOS.volumen.alto
    b[i * 4] = (azarDelHilo(haz, 5) * 2 - 1) * 0.55
    b[i * 4 + 1] = azarDelHilo(haz, 6) * Math.PI * 2
    b[i * 4 + 2] = azarDelHilo(haz, 7) * 50
    // La abertura del haz: muchos finos y algunos anchos (el cuadrado del azar).
    b[i * 4 + 3] = w0 + (w1 - w0) * azarDelHilo(haz, 8) ** 2
    // La fibra: más fibras cerca de la espina (el núcleo del haz) que en el borde.
    c[i * 4] = azarDelHilo(i, 9) ** 1.5
    c[i * 4 + 1] = azarDelHilo(i, 10) * Math.PI * 2
    c[i * 4 + 2] = (h0 + (h1 - h0) * azarDelHilo(haz, 11)) * (azarDelHilo(haz, 12) < 0.5 ? -1 : 1)
    c[i * 4 + 3] = azarDelHilo(i, 13) < HILOS.pulso.fibras ? 1 + azarDelHilo(i, 14) : 0
  }
  return { a, b, c }
}

const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

/**
 * El campo: el curl de un potencial vectorial hecho de senos (tres octavas), en forma cerrada. Un curl no tiene divergencia: los
 * hilos se tuercen alrededor de vórtices y no se amontonan. `CURL_GLSL` define `curl(p)`.
 */
export const CURL_GLSL = /* glsl */ `
vec3 curl( vec3 p ) {
	vec3 c = vec3( 0.0 );
	float a = 1.0;
	for ( int o = 0; o < 3; o ++ ) {
		// Potencial A = ( sen(y + z·k), sen(z + x·k), sen(x + y·k) ): su curl, ∂A_z/∂y − ∂A_y/∂z, etc.
		float k = 1.3 + float( o ) * 0.37;
		vec3 q = p + vec3( 1.7, 9.2, 3.4 ) * float( o );
		float ax_y = cos( q.y + q.z * k );
		float ax_z = k * cos( q.y + q.z * k );
		float ay_z = cos( q.z + q.x * k );
		float ay_x = k * cos( q.z + q.x * k );
		float az_x = cos( q.x + q.y * k );
		float az_y = k * cos( q.x + q.y * k );
		c += a * vec3( az_y - ay_z, ax_z - az_x, ay_x - ax_y );
		p *= 2.03;
		a *= 0.5;
	}
	return c / 1.75;
}
`

const PASO_S = HILOS.colaS / (HILOS.puntos - 1)
const ANCHO_PX = HILOS.fibra.nucleo + HILOS.fibra.halo

/** El sombreador de vértices: la espina del haz, la fibra alrededor (en hélice), el puntero, el texto y la cinta abierta en la pantalla. */
export const VERTICES_DE_LOS_HILOS = /* glsl */ `
attribute float aK;
attribute float aLado;
attribute vec4 aSemillaA;
attribute vec4 aSemillaB;
attribute vec4 aSemillaC;
uniform float uTiempo;
uniform vec3 uCentro;
uniform vec2 uResolucion;
uniform float uPixel;
uniform vec2 uCursor;
uniform float uAspecto;
uniform float uActivo;
uniform vec4 uTextos[ ${String(HILOS.texto.cajas)} ];
uniform float uCuantosTextos;
varying float vK;
varying float vLado;
varying float vActivo;
varying float vCuenta;
varying float vLejos;
varying float vCentro;
varying float vRapido;
varying float vTexto;
${CURL_GLSL}
// La espina del haz: su órbita inclinada más el curl.
vec3 cabeza( float t ) {
	float ang = aSemillaA.z + aSemillaA.y * t;
	float r = aSemillaA.x * ( 1.0 + 0.12 * sin( t * 0.31 + aSemillaB.z ) );
	vec3 p = vec3( cos( ang ) * r, aSemillaA.w + 0.6 * sin( t * 0.23 + aSemillaB.y ), sin( ang ) * r );
	float ci = cos( aSemillaB.x ), si = sin( aSemillaB.x );
	p = vec3( p.x, p.y * ci - p.z * si, p.y * si + p.z * ci );
	float cj = cos( aSemillaB.y ), sj = sin( aSemillaB.y );
	p = vec3( p.x * cj - p.z * sj, p.y, p.x * sj + p.z * cj );
	return p + ${f(HILOS.curl.amplitud)} * curl( p * ${f(HILOS.curl.frecuencia)} + vec3( 0.0, t * ${f(HILOS.curl.deriva)}, aSemillaB.z ) );
}
// La fibra: alrededor de la espina, en el plano que la corta (dos ejes de costado a su tangente), en hélice y respirando.
vec3 fibra( float t, float k, vec3 espina, vec3 antes ) {
	vec3 tg = espina - antes;
	tg = length( tg ) > 1e-5 ? normalize( tg ) : vec3( 1.0, 0.0, 0.0 );
	vec3 n = cross( tg, vec3( 0.0, 1.0, 0.0 ) );
	n = length( n ) > 1e-4 ? normalize( n ) : vec3( 1.0, 0.0, 0.0 );
	vec3 b = cross( tg, n );
	float th = aSemillaC.y + aSemillaC.z * 6.2831853 * k + uTiempo * ${f(HILOS.helice.giraS)} * sign( aSemillaC.z );
	float abre = aSemillaB.w * ( 1.0 + ${f(HILOS.respira)} * sin( t * 0.41 + aSemillaB.z ) ) * mix( 0.55, 1.0, sin( k * 3.1415927 ) );
	return espina + ( n * cos( th ) + b * sin( th ) * ${f(HILOS.plano)} ) * aSemillaC.x * abre;
}
vec2 aPantalla( vec4 c ) {
	return c.xy / c.w;
}
// Cuánto adentro de una caja de texto (con su aire) está un punto de la pantalla (NDC): 0 afuera, 1 adentro, suave en el borde.
float adentroDelTexto( vec2 s ) {
	float m = 0.0;
	for ( int r = 0; r < ${String(HILOS.texto.cajas)}; r ++ ) {
		if ( float( r ) >= uCuantosTextos ) break;
		vec4 c = uTextos[ r ];
		vec2 borde = 10.0 / uResolucion * uPixel;
		float x = smoothstep( c.x - borde.x, c.x + borde.x, s.x ) * ( 1.0 - smoothstep( c.z - borde.x, c.z + borde.x, s.x ) );
		float y = smoothstep( c.y - borde.y, c.y + borde.y, s.y ) * ( 1.0 - smoothstep( c.w - borde.y, c.w + borde.y, s.y ) );
		m = max( m, x * y );
	}
	return m;
}
void main() {
	float t = uTiempo - aK * ${f(HILOS.colaS)};
	vec3 e0 = cabeza( t );
	vec3 e1 = cabeza( t - ${f(PASO_S)} );
	vec3 e2 = cabeza( t - ${f(2 * PASO_S)} );
	vec3 p = uCentro + fibra( t, aK, e0, e1 );
	vec3 q = uCentro + fibra( t - ${f(PASO_S)}, aK + ${f(1 / (HILOS.puntos - 1))}, e1, e2 );
	vec4 cp = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
	vec4 cq = projectionMatrix * modelViewMatrix * vec4( q, 1.0 );
	// Detrás de la cámara (o pegado a ella): fuera del cuadro, sin dividir por casi cero.
	if ( cp.w < 0.5 || cq.w < 0.5 ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		vK = 1.0;
		vLado = 1.0;
		vActivo = 0.0;
		vCuenta = 0.0;
		vLejos = 1.0;
		vCentro = 0.0;
		vRapido = 0.0;
		vTexto = 0.0;
		return;
	}
	vec2 sp = aPantalla( cp );
	vec2 sq = aPantalla( cq );
	// El puntero: en la pantalla (con el aspecto), el hilo gira alrededor de él y se aprieta hacia un anillo; vibra y se enciende.
	vec2 rel = ( sp - uCursor ) * vec2( uAspecto, 1.0 );
	float d = length( rel );
	float cerca = uActivo * exp( - pow( d / ${f(HILOS.puntero.radio)}, 2.0 ) );
	float giro = cerca * ${f(HILOS.puntero.abrazo)} * ( 0.75 + 0.25 * sin( uTiempo * 1.7 + aSemillaB.z ) );
	vec2 girado = mat2( cos( giro ), sin( giro ), - sin( giro ), cos( giro ) ) * rel;
	float radio = mix( d, ${f(HILOS.puntero.radio * HILOS.puntero.anillo)}, cerca * 0.65 );
	girado = d > 1e-5 ? girado / d * radio : girado;
	vec2 nuevo = uCursor + girado / vec2( uAspecto, 1.0 );
	vec2 corrido = nuevo - sp;
	sp += corrido;
	sq += corrido;
	// La lejanía: lejos, el halo más abierto (difuso) y la fibra más tenue.
	float lejos = clamp( ( cp.w - 8.0 ) / 60.0, 0.0, 1.0 );
	// La cinta: de costado a la tangente en la pantalla, en píxeles: el núcleo y el halo de la fibra (más ancha encendida).
	vec2 tangente = ( sp - sq ) * uResolucion;
	vec2 costado = length( tangente ) > 1e-4 ? normalize( vec2( - tangente.y, tangente.x ) ) : vec2( 0.0, 1.0 );
	float ancho = mix( ${f(ANCHO_PX)}, ${f(HILOS.fibra.nucleo + HILOS.fibra.haloLejos)}, lejos ) * uPixel * ( 1.0 + cerca * ${f(HILOS.puntero.enciende)} );
	vec2 vibra = costado * sin( uTiempo * 47.0 + aK * 31.0 + aSemillaB.z ) * ${f(HILOS.puntero.vibra)} * cerca;
	sp += vibra + costado * aLado * ancho / uResolucion;
	gl_Position = vec4( sp * cp.w, cp.z, cp.w );
	vK = aK;
	vLado = aLado;
	vActivo = cerca;
	vCuenta = aSemillaC.w > 0.0 ? aK * ${f(HILOS.pulso.cuentas)} - uTiempo * ${f(HILOS.pulso.velocidad)} + aSemillaC.w * 7.0 : -1.0;
	vLejos = lejos;
	vCentro = 1.0 - aSemillaC.x;
	vRapido = clamp( length( e0 - e1 ) / ${f(PASO_S)} / ${f(HILOS.rapido)}, 0.0, 1.0 );
	vTexto = adentroDelTexto( sp );
}
`

/** El sombreador de fragmentos: el núcleo y el halo de la fibra, la cola que se apaga, la velocidad, las chispas y el texto. */
export const FRAGMENTOS_DE_LOS_HILOS = /* glsl */ `
uniform vec3 uColorDia;
uniform vec3 uColorNoche;
uniform float uNoche;
uniform float uApagado;
varying float vK;
varying float vLado;
varying float vActivo;
varying float vCuenta;
varying float vLejos;
varying float vCentro;
varying float vRapido;
varying float vTexto;
void main() {
	float x = abs( vLado );
	// El núcleo de la fibra (fino: lejos, más fino todavía) y su halo (de noche; de día apenas).
	float n = ${f(HILOS.fibra.nucleo / ANCHO_PX)} * mix( 1.0, 0.6, vLejos );
	float nucleo = exp( - pow( x / n, 2.0 ) * 1.6 );
	float halo = exp( - x * x * 2.5 ) * mix( 0.12, 0.42, uNoche );
	float cola = pow( 1.0 - vK, 0.9 ) * smoothstep( 0.0, 0.06, vK + 0.001 );
	// Las chispas: sólo en las fibras que las llevan, cortas y sobrias.
	float chispa = vCuenta < 0.0 ? 0.0 : pow( max( 0.0, sin( fract( vCuenta ) * 6.2831853 ) ), 14.0 );
	float late = ( 0.55 + 0.45 * vRapido ) * ( 0.7 + 0.5 * vCentro ) + chispa * 1.4 + vActivo * 0.9;
	float a = ( nucleo * ( 1.0 - 0.45 * vLejos ) + halo ) * cola * late * mix( ${f(HILOS.opacidad.dia)}, ${f(HILOS.opacidad.noche)}, uNoche ) * ( 1.0 - uApagado ) * ( 1.0 - 0.6 * vLejos ) * ( 1.0 - ${f(HILOS.texto.apaga)} * vTexto );
	vec3 color = mix( uColorDia, uColorNoche, uNoche );
	// Premultiplicado: de noche suma luz (alfa 0 para el fondo); de día, tinta encima del papel.
	gl_FragColor = vec4( color * a, a * ( 1.0 - uNoche ) );
}
`
