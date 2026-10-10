/**
 * [PULIDO 11] E · LOS HILOS DE ENERGÍA (`?hilos=si`: exploración; sin la bandera, el polvo de siempre) — en lugar del polvo,
 * hilos de energía plasmática alrededor del logo: cada hilo es una cinta que sigue a su cabeza por un campo de curl (sin
 * divergencia: se tuercen y se cruzan sin juntarse en un punto) y deja su estela; por la estela corren cuentas de energía (laten).
 * De noche, blancos con resplandor (suman luz); de día, de tinta sobre el papel; monocromo, sin el rojo del error.
 *
 * Todo en la GPU: una sola llamada de dibujo (una cinta por instancia), sin simulación ni texturas. La cabeza de cada hilo es una
 * función ANALÍTICA del tiempo (su órbita más el curl de un potencial de senos), así la estela es la misma función en el pasado:
 * cada vértice evalúa su punto y el siguiente (la tangente) y se abre de costado en píxeles de pantalla.
 *
 * El puntero (el mouse o el dedo, el de la escena: `VIVO.uCursor`): los hilos cercanos lo RODEAN (giran alrededor de él en la
 * pantalla y se acercan a un anillo), vibran y se encienden; al irse el puntero se sueltan despacio (`activacionDelPuntero`). En
 * el final del pie se apagan con la cámara que sube (no compiten con la energía del piso).
 */
export const HILOS = {
  /** Cuántos hilos y cuántos puntos tiene cada estela. */
  cantidad: 36,
  puntos: 64,
  /** Cuánto pasado dibuja la estela (s). */
  colaS: 1.5,
  /** El ancho de la cinta en la pantalla (px de CSS, con el resplandor): en la cabeza y en la cola; el núcleo, la fracción del medio. */
  ancho: { cabeza: 10, cola: 3 },
  nucleo: 0.26,
  /** Dónde viven: un anillo alrededor del logo (u: radio de adentro y de afuera) y cuánto suben y bajan. */
  volumen: { radios: [4.6, 10.5], alto: 4.2 },
  /** Lo que gira cada hilo alrededor del logo (rad/s, de menos a más). */
  vuelta: [0.07, 0.2],
  /** El campo de curl: su frecuencia (1/u), cuánto desvía (u) y cuánto deriva en el tiempo. */
  curl: { frecuencia: 0.3, amplitud: 1.7, deriva: 0.13 },
  /** Las cuentas de energía que corren por la estela: cuántas y a qué velocidad (estelas por segundo). */
  pulso: { cuentas: 2.5, velocidad: 0.6 },
  /**
   * El puntero, en la pantalla (NDC con aspecto): el radio de alcance, cuánto gira un hilo alrededor (rad, en el centro), a qué
   * fracción del radio se aprieta el anillo, cuánto vibra (NDC) y cuánto se enciende (más luz y más ancho).
   */
  puntero: { radio: 0.24, abrazo: 2.4, anillo: 0.42, vibra: 0.0035, enciende: 0.9 },
  /** La activación: sube en `tomaS` y se suelta en `sueltaS` (s); el empuje del cursor de la escena que la prende del todo. */
  activacion: { tomaS: 0.12, sueltaS: 1.4, empujeEntero: 0.35 },
  /** Cuánto se ven: de día (tinta) y de noche (luz que suma). */
  opacidad: { dia: 0.42, noche: 0.85 },
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
 * Las semillas de cada hilo (cuatro números por hilo y cuatro más): el radio de su órbita, su velocidad (con signo), su fase, su
 * altura; la inclinación de su órbita (dos ángulos), el desfase de su campo y el de sus cuentas.
 */
export function semillasDeLosHilos(n: number = HILOS.cantidad): { readonly a: Float32Array; readonly b: Float32Array } {
  const a = new Float32Array(n * 4)
  const b = new Float32Array(n * 4)
  const [r0, r1] = HILOS.volumen.radios
  const [v0, v1] = HILOS.vuelta
  for (let i = 0; i < n; i += 1) {
    a[i * 4] = r0 + (r1 - r0) * Math.sqrt(azarDelHilo(i, 0))
    a[i * 4 + 1] = (v0 + (v1 - v0) * azarDelHilo(i, 1)) * (azarDelHilo(i, 2) < 0.5 ? -1 : 1)
    a[i * 4 + 2] = azarDelHilo(i, 3) * Math.PI * 2
    a[i * 4 + 3] = (azarDelHilo(i, 4) * 2 - 1) * HILOS.volumen.alto
    b[i * 4] = (azarDelHilo(i, 5) * 2 - 1) * 0.55
    b[i * 4 + 1] = azarDelHilo(i, 6) * Math.PI * 2
    b[i * 4 + 2] = azarDelHilo(i, 7) * 50
    b[i * 4 + 3] = azarDelHilo(i, 8)
  }
  return { a, b }
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

/** El sombreador de vértices: la cabeza, la estela, el puntero y la cinta abierta en la pantalla. */
export const VERTICES_DE_LOS_HILOS = /* glsl */ `
attribute float aK;
attribute float aLado;
attribute vec4 aSemillaA;
attribute vec4 aSemillaB;
uniform float uTiempo;
uniform vec3 uCentro;
uniform vec2 uResolucion;
uniform float uPixel;
uniform vec2 uCursor;
uniform float uAspecto;
uniform float uActivo;
varying float vK;
varying float vLado;
varying float vActivo;
varying float vCuenta;
varying float vLejos;
${CURL_GLSL}
vec3 cabeza( float t ) {
	float ang = aSemillaA.z + aSemillaA.y * t;
	float r = aSemillaA.x * ( 1.0 + 0.12 * sin( t * 0.31 + aSemillaB.z ) );
	vec3 p = vec3( cos( ang ) * r, aSemillaA.w + 0.6 * sin( t * 0.23 + aSemillaB.y ), sin( ang ) * r );
	// La órbita inclinada (dos ángulos).
	float ci = cos( aSemillaB.x ), si = sin( aSemillaB.x );
	p = vec3( p.x, p.y * ci - p.z * si, p.y * si + p.z * ci );
	float cj = cos( aSemillaB.y ), sj = sin( aSemillaB.y );
	p = vec3( p.x * cj - p.z * sj, p.y, p.x * sj + p.z * cj );
	return p + ${f(HILOS.curl.amplitud)} * curl( p * ${f(HILOS.curl.frecuencia)} + vec3( 0.0, t * ${f(HILOS.curl.deriva)}, aSemillaB.z ) );
}
vec2 aPantalla( vec4 c ) {
	return c.xy / c.w;
}
void main() {
	float t = uTiempo - aK * ${f(HILOS.colaS)};
	vec3 p = uCentro + cabeza( t );
	vec3 q = uCentro + cabeza( t - ${f(HILOS.colaS / HILOS.puntos)} );
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
	// La cinta: de costado a la tangente en la pantalla, en píxeles; afina hacia la cola y engorda encendida.
	vec2 tangente = ( sp - sq ) * uResolucion;
	vec2 costado = length( tangente ) > 1e-4 ? normalize( vec2( - tangente.y, tangente.x ) ) : vec2( 0.0, 1.0 );
	float ancho = mix( ${f(HILOS.ancho.cabeza)}, ${f(HILOS.ancho.cola)}, aK ) * uPixel * ( 1.0 + cerca * ${f(HILOS.puntero.enciende)} );
	vec2 vibra = costado * sin( uTiempo * 47.0 + aK * 31.0 + aSemillaB.z ) * ${f(HILOS.puntero.vibra)} * cerca;
	sp += vibra + costado * aLado * ancho / uResolucion;
	gl_Position = vec4( sp * cp.w, cp.z, cp.w );
	vK = aK;
	vLado = aLado;
	vActivo = cerca;
	vCuenta = aK * ${f(HILOS.pulso.cuentas)} - uTiempo * ${f(HILOS.pulso.velocidad)} + aSemillaB.w;
	vLejos = clamp( ( cp.w - 8.0 ) / 60.0, 0.0, 1.0 );
}
`

/** El sombreador de fragmentos: el núcleo y el resplandor de costado, la cola que se apaga y las cuentas que laten. */
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
void main() {
	float x = abs( vLado );
	float nucleo = exp( - pow( x / ${f(HILOS.nucleo)}, 2.0 ) * 2.5 );
	float halo = exp( - x * x * 3.0 ) * 0.35 * uNoche;
	float cola = pow( 1.0 - vK, 1.6 ) * smoothstep( 0.0, 0.04, vK + 0.001 );
	float cuenta = pow( max( 0.0, sin( fract( vCuenta ) * 6.2831853 ) ), 6.0 );
	float late = 0.55 + 0.45 * cuenta + vActivo * 0.6;
	float a = ( nucleo + halo ) * cola * late * mix( ${f(HILOS.opacidad.dia)}, ${f(HILOS.opacidad.noche)}, uNoche ) * ( 1.0 - uApagado ) * ( 1.0 - 0.6 * vLejos );
	vec3 color = mix( uColorDia, uColorNoche, uNoche );
	// Premultiplicado: de noche suma luz (alfa 0 para el fondo); de día, tinta encima del papel.
	gl_FragColor = vec4( color * a, a * ( 1.0 - uNoche ) );
}
`
