import * as THREE from 'three'

/**
 * [ESCENA 8] T5 · EL CAMPO DE DISTANCIA DEL LOGO — puro: la distancia con signo a la malla REAL del logo, en una
 * textura 3D que se calcula una vez al cargar y sigue la pose del logo (se lee en su espacio, con `uLogoInverso`).
 *
 * **Qué pasaba.** El choque y el pegado usaban formas aproximadas: dos anillos enteros y una caja. La «c» es un
 * anillo ABIERTO: el anillo entero cerraba su boca con una pared que no existe, y las motas cuyo lugar de
 * reposo caía ahí se proyectaban a esa pared en cada cuadro. Eran los arcos separados del logo, flotando afuera
 * de su borde, que se quedaban mientras el logo y el aire se movían.
 *
 * **La malla.** El logo es la extrusión del SVG (`ProbeLogo`, bisel de 0,007 u): un prisma. Las paredes de
 * costado de la malla (normal horizontal) proyectadas al plano del logo son el contorno, con sus agujeros; de ahí
 * sale la distancia en el plano (la mínima a un tramo) y el signo (paridad de los cruces de una recta). El
 * espesor es el de la malla. La distancia en 3D es la del prisma: la del plano y la del espesor combinadas.
 */
export const CAMPO_DEL_LOGO = {
  /** El lado de una celda de la textura (u) y cuánto sobra alrededor de la caja del logo (u). */
  celda: 0.05,
  margen: 0.5,
  /** Hasta dónde se busca el tramo más cercano (u): más lejos da lo mismo (la física mira a menos de 0,3). */
  alcance: 1.2,
} as const

export interface Contorno {
  /** Los tramos del contorno en el plano del logo: x0, y0, x1, y1 por tramo. */
  readonly tramos: Float32Array
  readonly zMin: number
  readonly zMax: number
}

/** Una malla del logo: sus posiciones (e índices), y la matriz de la malla al espacio del grupo del logo. */
export interface MallaDelLogo {
  readonly posiciones: ArrayLike<number>
  readonly indices: ArrayLike<number> | null
  readonly matriz: THREE.Matrix4
}

/** El contorno de la malla: sus paredes de costado proyectadas al plano del logo (sin repetir) y su espesor. */
export function contornoDeLaMalla(mallas: readonly MallaDelLogo[]): Contorno {
  const tramos: number[] = []
  const vistos = new Set<string>()
  let [zMin, zMax] = [Infinity, -Infinity]
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const n = new THREE.Vector3()
  const clave = (x: number, y: number): string => `${Math.round(x * 1e4)},${Math.round(y * 1e4)}`
  for (const m of mallas) {
    const vertice = (k: number, v: THREE.Vector3): THREE.Vector3 => v.set(m.posiciones[k * 3], m.posiciones[k * 3 + 1], m.posiciones[k * 3 + 2]).applyMatrix4(m.matriz)
    const cuantos = m.indices === null ? m.posiciones.length / 3 : m.indices.length
    const indice = (k: number): number => (m.indices === null ? k : m.indices[k])
    for (let t = 0; t + 2 < cuantos; t += 3) {
      vertice(indice(t), a)
      vertice(indice(t + 1), b)
      vertice(indice(t + 2), c)
      zMin = Math.min(zMin, a.z, b.z, c.z)
      zMax = Math.max(zMax, a.z, b.z, c.z)
      n.subVectors(b, a).cross(c.clone().sub(a))
      const largo = n.length()
      // Sólo las paredes de costado (normal horizontal): el bisel inclinado dibujaría otra vuelta del contorno.
      if (largo < 1e-12 || Math.abs(n.z / largo) > 0.02) continue
      // Su proyección es un tramo: los dos puntos más lejanos en el plano.
      const pares: [THREE.Vector3, THREE.Vector3][] = [[a, b], [b, c], [a, c]]
      const [p, q] = pares.reduce((x, y) => (Math.hypot(y[0].x - y[1].x, y[0].y - y[1].y) > Math.hypot(x[0].x - x[1].x, x[0].y - x[1].y) ? y : x))
      if (Math.hypot(p.x - q.x, p.y - q.y) < 1e-6) continue
      const [k1, k2] = [clave(p.x, p.y), clave(q.x, q.y)]
      const k = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`
      if (vistos.has(k)) continue
      vistos.add(k)
      tramos.push(p.x, p.y, q.x, q.y)
    }
  }
  return { tramos: Float32Array.from(tramos), zMin, zMax }
}

/** La distancia de (x, y) al tramo k. */
function alTramo(t: Float32Array, k: number, x: number, y: number): number {
  const [x0, y0, x1, y1] = [t[k * 4], t[k * 4 + 1], t[k * 4 + 2], t[k * 4 + 3]]
  const [dx, dy] = [x1 - x0, y1 - y0]
  const u = Math.min(1, Math.max(0, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(x - x0 - u * dx, y - y0 - u * dy)
}

export interface CampoDelLogo {
  /** La distancia con signo (u) en cada celda, x más rápido, después y, después z. */
  readonly datos: Float32Array
  readonly n: readonly [number, number, number]
  /** La esquina de la caja (espacio del logo) y su tamaño (u): la celda i está en `min + (i + 0,5) · celda`. */
  readonly min: readonly [number, number, number]
  readonly tam: readonly [number, number, number]
}

/** La distancia en el plano, con signo (negativa adentro), en una grilla de `nx` × `ny` celdas desde (x0, y0). */
export function distanciaEnElPlano(c: Contorno, x0: number, y0: number, nx: number, ny: number, celda: number): Float32Array {
  const t = c.tramos
  const cuantos = t.length / 4
  const alcance = CAMPO_DEL_LOGO.alcance
  // Los tramos por casilla (de `alcance` de lado), para buscar sólo cerca.
  const [bx, by] = [Math.ceil((nx * celda) / alcance) + 1, Math.ceil((ny * celda) / alcance) + 1]
  const casillas: number[][] = Array.from({ length: bx * by }, () => [])
  for (let k = 0; k < cuantos; k += 1) {
    const [ax, ay, cx, cy] = [t[k * 4], t[k * 4 + 1], t[k * 4 + 2], t[k * 4 + 3]]
    const i0 = Math.max(0, Math.floor((Math.min(ax, cx) - x0) / alcance))
    const i1 = Math.min(bx - 1, Math.floor((Math.max(ax, cx) - x0) / alcance))
    const j0 = Math.max(0, Math.floor((Math.min(ay, cy) - y0) / alcance))
    const j1 = Math.min(by - 1, Math.floor((Math.max(ay, cy) - y0) / alcance))
    for (let j = j0; j <= j1; j += 1) for (let i = i0; i <= i1; i += 1) casillas[j * bx + i].push(k)
  }
  const salida = new Float32Array(nx * ny)
  const cruces: number[] = []
  for (let j = 0; j < ny; j += 1) {
    const y = y0 + (j + 0.5) * celda
    // La paridad: dónde cruza la fila cada tramo que la corta (medio abierto: un vértice cuenta una vez).
    cruces.length = 0
    for (let k = 0; k < cuantos; k += 1) {
      const [ax, ay, cx, cy] = [t[k * 4], t[k * 4 + 1], t[k * 4 + 2], t[k * 4 + 3]]
      if (ay > y !== cy > y) cruces.push(ax + ((y - ay) / (cy - ay)) * (cx - ax))
    }
    cruces.sort((p, q) => p - q)
    const cj = Math.floor((y - y0) / alcance)
    for (let i = 0; i < nx; i += 1) {
      const x = x0 + (i + 0.5) * celda
      let d: number = alcance
      const ci = Math.floor((x - x0) / alcance)
      for (let jj = Math.max(0, cj - 1); jj <= Math.min(by - 1, cj + 1); jj += 1) {
        for (let ii = Math.max(0, ci - 1); ii <= Math.min(bx - 1, ci + 1); ii += 1) {
          for (const k of casillas[jj * bx + ii]) d = Math.min(d, alTramo(t, k, x, y))
        }
      }
      let despues = 0
      for (let r = cruces.length - 1; r >= 0 && cruces[r] > x; r -= 1) despues += 1
      salida[j * nx + i] = despues % 2 === 1 ? -d : d
    }
  }
  return salida
}

/** La distancia del prisma: la del plano `d2` combinada con la del espesor (medio espesor `h`, centro `zc`). */
export function delPrisma(d2: number, z: number, zc: number, h: number): number {
  const dz = Math.abs(z - zc) - h
  return Math.hypot(Math.max(d2, 0), Math.max(dz, 0)) + Math.min(Math.max(d2, dz), 0)
}

/** El campo entero: la caja del contorno con margen, la distancia en el plano y el prisma en cada celda. */
export function campoDelLogo(c: Contorno): CampoDelLogo {
  const { celda, margen } = CAMPO_DEL_LOGO
  const t = c.tramos
  let [xMin, yMin, xMax, yMax] = [Infinity, Infinity, -Infinity, -Infinity]
  for (let k = 0; k < t.length; k += 2) {
    xMin = Math.min(xMin, t[k])
    xMax = Math.max(xMax, t[k])
    yMin = Math.min(yMin, t[k + 1])
    yMax = Math.max(yMax, t[k + 1])
  }
  const min: [number, number, number] = [xMin - margen, yMin - margen, c.zMin - margen]
  const n: [number, number, number] = [Math.ceil((xMax - xMin + 2 * margen) / celda), Math.ceil((yMax - yMin + 2 * margen) / celda), Math.ceil((c.zMax - c.zMin + 2 * margen) / celda)]
  const plano = distanciaEnElPlano(c, min[0], min[1], n[0], n[1], celda)
  const [zc, h] = [(c.zMin + c.zMax) / 2, (c.zMax - c.zMin) / 2]
  const datos = new Float32Array(n[0] * n[1] * n[2])
  for (let k = 0; k < n[2]; k += 1) {
    const z = min[2] + (k + 0.5) * celda
    const capa = k * n[0] * n[1]
    for (let j = 0; j < n[0] * n[1]; j += 1) datos[capa + j] = delPrisma(plano[j], z, zc, h)
  }
  return { datos, n, min, tam: [n[0] * celda, n[1] * celda, n[2] * celda] }
}

/** Lo mismo que lee el shader, en TS (para el invariante): la distancia en un punto del espacio del logo. */
export function distanciaDelCampo(f: CampoDelLogo, q: readonly [number, number, number]): number {
  const celda = f.tam[0] / f.n[0]
  const u = [0, 1, 2].map((a) => (q[a] - f.min[a]) / celda - 0.5)
  const i = u.map((v, a) => Math.min(f.n[a] - 2, Math.max(0, Math.floor(v))))
  const w = u.map((v, a) => Math.min(1, Math.max(0, v - i[a])))
  let d = 0
  for (let dz = 0; dz < 2; dz += 1) {
    for (let dy = 0; dy < 2; dy += 1) {
      for (let dx = 0; dx < 2; dx += 1) {
        const peso = (dx ? w[0] : 1 - w[0]) * (dy ? w[1] : 1 - w[1]) * (dz ? w[2] : 1 - w[2])
        d += peso * f.datos[(i[2] + dz) * f.n[0] * f.n[1] + (i[1] + dy) * f.n[0] + i[0] + dx]
      }
    }
  }
  // Afuera de la caja: lo que falta hasta ella, sumado (una cota que sigue creciendo).
  const afuera = [0, 1, 2].map((a) => Math.max(0, f.min[a] - q[a], q[a] - f.min[a] - f.tam[a]))
  return d + Math.hypot(afuera[0], afuera[1], afuera[2])
}

/** Lo que leen los shaders: la textura, su caja en el espacio del logo, y si ya está (0 hasta que carga el logo). */
export const CAMPO_EN_VIVO = {
  uCampoDelLogo: { value: null as THREE.Data3DTexture | null },
  uCampoMin: { value: new THREE.Vector3() },
  uCampoTam: { value: new THREE.Vector3(1, 1, 1) },
  uHayCampo: { value: 0 },
}

/** La textura (media precisión: se filtra en todas las placas) y los uniforms. */
export function publicarElCampo(f: CampoDelLogo): THREE.Data3DTexture {
  const medio = new Uint16Array(f.datos.length)
  for (let k = 0; k < f.datos.length; k += 1) medio[k] = THREE.DataUtils.toHalfFloat(f.datos[k])
  const textura = new THREE.Data3DTexture(medio, f.n[0], f.n[1], f.n[2])
  textura.format = THREE.RedFormat
  textura.type = THREE.HalfFloatType
  textura.minFilter = THREE.LinearFilter
  textura.magFilter = THREE.LinearFilter
  textura.wrapS = THREE.ClampToEdgeWrapping
  textura.wrapT = THREE.ClampToEdgeWrapping
  textura.wrapR = THREE.ClampToEdgeWrapping
  textura.unpackAlignment = 1
  textura.needsUpdate = true
  CAMPO_EN_VIVO.uCampoDelLogo.value = textura
  CAMPO_EN_VIVO.uCampoMin.value.set(...f.min)
  CAMPO_EN_VIVO.uCampoTam.value.set(...f.tam)
  CAMPO_EN_VIVO.uHayCampo.value = 1
  return textura
}

/**
 * En GLSL: la distancia con signo a la malla real en un punto del espacio del logo, y su normal (diferencias
 * centradas de una celda). Sin el campo (antes de cargar el logo) no hay logo: devuelve lejos.
 */
export const CAMPO_DEL_LOGO_GLSL = /* glsl */ `
precision highp sampler3D;
uniform sampler3D uCampoDelLogo;
uniform vec3 uCampoMin;
uniform vec3 uCampoTam;
uniform float uHayCampo;
float campoDelLogo( vec3 q ) {
	if ( uHayCampo < 0.5 ) return 1e3;
	vec3 uvw = ( q - uCampoMin ) / uCampoTam;
	vec3 dentro = clamp( uvw, 0.0, 1.0 );
	return texture( uCampoDelLogo, dentro ).r + length( ( uvw - dentro ) * uCampoTam );
}
vec3 normalDelCampo( vec3 q ) {
	vec2 e = vec2( ${CAMPO_DEL_LOGO.celda.toFixed(3)}, 0.0 );
	vec3 g = vec3(
		campoDelLogo( q + e.xyy ) - campoDelLogo( q - e.xyy ),
		campoDelLogo( q + e.yxy ) - campoDelLogo( q - e.yxy ),
		campoDelLogo( q + e.yyx ) - campoDelLogo( q - e.yyx ) );
	return g / max( length( g ), 1e-6 );
}
`
