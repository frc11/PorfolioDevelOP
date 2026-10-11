/**
 * [PULIDO 17] O3 · EL CAMPO QUE LLEVA A LA ENERGÍA: curl noise (`docs/rediseno/REFERENCIAS-PLASMA.md`, 1 y 2). La velocidad es el
 * rotor de un potencial de ruido de gradiente: no tiene divergencia (el flujo se arremolina; nunca junta ni vacía de golpe). El
 * ruido trae su gradiente analítico (tres evaluaciones por punto, no dieciocho diferencias). El MISMO en la CPU (las chispas, los
 * núcleos) y en la GPU (el enjambre): el azar de la red es un hash de enteros de 32 bits, los mismos bits en JS y en GLSL, así un
 * núcleo deriva con la nube que lo rodea. Puro (la prueba lo corre en Node).
 */
export const RUIDO = {
  /** La escala del campo (1/u: un remolino mide ~1/escala) y cuánto se corre por segundo (en unidades del ruido). */
  escala: 0.17,
  deriva: [0.021, 0.034, 0.027],
} as const

/** Las doce direcciones de las aristas de un cubo (las de Perlin): el gradiente de cada esquina. */
const GRADIENTES = new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1])

/** El mezclador de 32 bits (lowbias32): con `Math.imul` y `>>> 0`, los mismos bits que el `uint` de GLSL. */
export function mezclar(x: number): number {
  let h = x >>> 0
  h = (h ^ (h >>> 16)) >>> 0
  h = Math.imul(h, 0x7feb352d) >>> 0
  h = (h ^ (h >>> 15)) >>> 0
  h = Math.imul(h, 0x846ca68b) >>> 0
  return (h ^ (h >>> 16)) >>> 0
}

/** El índice (×3) del gradiente de la esquina (x, y, z) del canal `c`. */
function esquina(x: number, y: number, z: number, c: number): number {
  return (mezclar(Math.imul(x, 0x8da6b343) ^ Math.imul(y, 0xd8163841) ^ Math.imul(z, 0xcb1ab31f) ^ Math.imul(c, 0x165667b1)) % 12) * 3
}

const G = GRADIENTES

/** El ruido de gradiente en (x, y, z) del canal `c` y su gradiente: (valor, ∂x, ∂y, ∂z) en `s` desde `o`. */
export function ruidoConGradiente(x: number, y: number, z: number, c: number, s: Float32Array, o: number): void {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const fx = x - ix
  const fy = y - iy
  const fz = z - iz
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
  const uz = fz * fz * fz * (fz * (fz * 6 - 15) + 10)
  const dux = 30 * fx * fx * (fx * (fx - 2) + 1)
  const duy = 30 * fy * fy * (fy * (fy - 2) + 1)
  const duz = 30 * fz * fz * (fz * (fz - 2) + 1)
  // Las esquinas: a (0,0,0), b (1,0,0), c (0,1,0), d (1,1,0), e (0,0,1), f (1,0,1), g (0,1,1), h (1,1,1).
  // Sin arreglos nuevos: se llama miles de veces por cuadro.
  const a = esquina(ix, iy, iz, c)
  const b = esquina(ix + 1, iy, iz, c)
  const cc = esquina(ix, iy + 1, iz, c)
  const d = esquina(ix + 1, iy + 1, iz, c)
  const e = esquina(ix, iy, iz + 1, c)
  const f = esquina(ix + 1, iy, iz + 1, c)
  const g = esquina(ix, iy + 1, iz + 1, c)
  const h = esquina(ix + 1, iy + 1, iz + 1, c)
  const va = G[a] * fx + G[a + 1] * fy + G[a + 2] * fz
  const vb = G[b] * (fx - 1) + G[b + 1] * fy + G[b + 2] * fz
  const vc = G[cc] * fx + G[cc + 1] * (fy - 1) + G[cc + 2] * fz
  const vd = G[d] * (fx - 1) + G[d + 1] * (fy - 1) + G[d + 2] * fz
  const ve = G[e] * fx + G[e + 1] * fy + G[e + 2] * (fz - 1)
  const vf = G[f] * (fx - 1) + G[f + 1] * fy + G[f + 2] * (fz - 1)
  const vg = G[g] * fx + G[g + 1] * (fy - 1) + G[g + 2] * (fz - 1)
  const vh = G[h] * (fx - 1) + G[h + 1] * (fy - 1) + G[h + 2] * (fz - 1)
  const k1 = vb - va
  const k2 = vc - va
  const k3 = ve - va
  const k4 = va - vb - vc + vd
  const k5 = va - vc - ve + vg
  const k6 = va - vb - ve + vf
  const k7 = -va + vb + vc - vd + ve - vf - vg + vh
  s[o] = va + k1 * ux + k2 * uy + k3 * uz + k4 * ux * uy + k5 * uy * uz + k6 * uz * ux + k7 * ux * uy * uz
  for (let q = 0; q < 3; q += 1) {
    const ga = G[a + q]
    s[o + 1 + q] = ga + ux * (G[b + q] - ga) + uy * (G[cc + q] - ga) + uz * (G[e + q] - ga) + ux * uy * (ga - G[b + q] - G[cc + q] + G[d + q]) + uy * uz * (ga - G[cc + q] - G[e + q] + G[g + q]) + uz * ux * (ga - G[b + q] - G[e + q] + G[f + q]) + ux * uy * uz * (-ga + G[b + q] + G[cc + q] - G[d + q] + G[e + q] - G[f + q] - G[g + q] + G[h + q])
  }
  s[o + 1] += dux * (k1 + k4 * uy + k6 * uz + k7 * uy * uz)
  s[o + 2] += duy * (k2 + k5 * uz + k4 * ux + k7 * uz * ux)
  s[o + 3] += duz * (k3 + k6 * ux + k5 * uy + k7 * ux * uy)
}

const N = new Float32Array(12)

/** El rotor del potencial (tres canales del ruido) en (x, y, z) relativos al centro, a la hora `t` (s), en `destino` desde `o`. */
export function rotor(x: number, y: number, z: number, t: number, destino: Float32Array, o: number): void {
  const e = RUIDO.escala
  const px = x * e + t * RUIDO.deriva[0]
  const py = y * e + t * RUIDO.deriva[1]
  const pz = z * e + t * RUIDO.deriva[2]
  ruidoConGradiente(px, py, pz, 0, N, 0)
  ruidoConGradiente(px, py, pz, 1, N, 4)
  ruidoConGradiente(px, py, pz, 2, N, 8)
  // (∂ψz/∂y − ∂ψy/∂z, ∂ψx/∂z − ∂ψz/∂x, ∂ψy/∂x − ∂ψx/∂y)
  destino[o] = N[10] - N[7]
  destino[o + 1] = N[3] - N[9]
  destino[o + 2] = N[5] - N[2]
}

const fl = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

/** Lo mismo en GLSL (ES 3.00: los enteros sin signo y los arreglos constantes). `rotor( p, t )`, `azar01( id, k )`. */
export const RUIDO_GLSL = /* glsl */ `
const vec3 GRADIENTES[ 12 ] = vec3[ 12 ]( vec3( 1, 1, 0 ), vec3( -1, 1, 0 ), vec3( 1, -1, 0 ), vec3( -1, -1, 0 ), vec3( 1, 0, 1 ), vec3( -1, 0, 1 ), vec3( 1, 0, -1 ), vec3( -1, 0, -1 ), vec3( 0, 1, 1 ), vec3( 0, -1, 1 ), vec3( 0, 1, -1 ), vec3( 0, -1, -1 ) );
uint mezclar( uint h ) {
	h ^= h >> 16u;
	h *= 0x7feb352du;
	h ^= h >> 15u;
	h *= 0x846ca68bu;
	h ^= h >> 16u;
	return h;
}
float azar01( uint id, uint k ) {
	return float( mezclar( id * 0x9e3779b9u ^ k * 0x85ebca6bu ) ) / 4294967295.0;
}
vec3 esquinaDelRuido( ivec3 c, uint k ) {
	return GRADIENTES[ mezclar( uint( c.x ) * 0x8da6b343u ^ uint( c.y ) * 0xd8163841u ^ uint( c.z ) * 0xcb1ab31fu ^ k * 0x165667b1u ) % 12u ];
}
vec4 ruidoConGradiente( vec3 x, uint k ) {
	vec3 i = floor( x );
	ivec3 c = ivec3( i );
	vec3 f = x - i;
	vec3 u = f * f * f * ( f * ( f * 6.0 - 15.0 ) + 10.0 );
	vec3 du = 30.0 * f * f * ( f * ( f - 2.0 ) + 1.0 );
	vec3 ga = esquinaDelRuido( c, k );
	vec3 gb = esquinaDelRuido( c + ivec3( 1, 0, 0 ), k );
	vec3 gc = esquinaDelRuido( c + ivec3( 0, 1, 0 ), k );
	vec3 gd = esquinaDelRuido( c + ivec3( 1, 1, 0 ), k );
	vec3 ge = esquinaDelRuido( c + ivec3( 0, 0, 1 ), k );
	vec3 gf = esquinaDelRuido( c + ivec3( 1, 0, 1 ), k );
	vec3 gg = esquinaDelRuido( c + ivec3( 0, 1, 1 ), k );
	vec3 gh = esquinaDelRuido( c + ivec3( 1, 1, 1 ), k );
	float va = dot( ga, f );
	float vb = dot( gb, f - vec3( 1.0, 0.0, 0.0 ) );
	float vc = dot( gc, f - vec3( 0.0, 1.0, 0.0 ) );
	float vd = dot( gd, f - vec3( 1.0, 1.0, 0.0 ) );
	float ve = dot( ge, f - vec3( 0.0, 0.0, 1.0 ) );
	float vf = dot( gf, f - vec3( 1.0, 0.0, 1.0 ) );
	float vg = dot( gg, f - vec3( 0.0, 1.0, 1.0 ) );
	float vh = dot( gh, f - vec3( 1.0, 1.0, 1.0 ) );
	float k1 = vb - va;
	float k2 = vc - va;
	float k3 = ve - va;
	float k4 = va - vb - vc + vd;
	float k5 = va - vc - ve + vg;
	float k6 = va - vb - ve + vf;
	float k7 = - va + vb + vc - vd + ve - vf - vg + vh;
	float valor = va + k1 * u.x + k2 * u.y + k3 * u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z;
	vec3 g = ga + u.x * ( gb - ga ) + u.y * ( gc - ga ) + u.z * ( ge - ga ) + u.x * u.y * ( ga - gb - gc + gd ) + u.y * u.z * ( ga - gc - ge + gg ) + u.z * u.x * ( ga - gb - ge + gf ) + u.x * u.y * u.z * ( - ga + gb + gc - gd + ge - gf - gg + gh );
	g += du * vec3( k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z, k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x, k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y );
	return vec4( valor, g );
}
vec3 rotor( vec3 p, float t ) {
	vec3 q = p * ${fl(RUIDO.escala)} + t * vec3( ${fl(RUIDO.deriva[0])}, ${fl(RUIDO.deriva[1])}, ${fl(RUIDO.deriva[2])} );
	vec4 a = ruidoConGradiente( q, 0u );
	vec4 b = ruidoConGradiente( q, 1u );
	vec4 c = ruidoConGradiente( q, 2u );
	return vec3( c.z - b.w, a.w - c.y, b.y - a.z );
}
`
