import * as THREE from 'three'

/**
 * [PULIDO 18] P2 · LOS ECOS DEL LOGO (`docs/rediseno/DIMENSION-ESPEJO.md`): cuando el logo se mueve (la caída del principio, el
 * encastre del pie, el balanceo con el scroll), copias suyas DETRÁS, en abanico y espejadas, cada una con su pose de hace un rato
 * (las proyecciones de Strange). La misma geometría del logo, sin tocar el logo ni su material: mallas aparte, translúcidas, detrás de
 * él (la profundidad las tapa donde está el logo). De noche, un borde de luz; de día, una silueta de grafito. Sin reservas por cuadro:
 * la historia de las poses es un búfer fijo.
 */
export const ECOS = {
  /** Cuántas copias, cada cuántos cuadros de atraso cada una, el giro del abanico por copia (rad), lo que se corren hacia atrás (u). */
  copias: 5,
  atraso: 5,
  abanico: 0.16,
  atras: 0.9,
  /** El movimiento que las despierta (u/s del centro y rad/s del giro): desde, entero; y cuánto se nota cada una (la primera). */
  mueve: [0.25, 2.2],
  gira: [0.15, 1.4],
  alfa: 0.34,
} as const

const VERTICES = /* glsl */ `
varying vec3 vNormal;
varying vec3 vAlOjo;
void main() {
	vec4 mundo = modelMatrix * vec4( position, 1.0 );
	vNormal = normalize( mat3( modelMatrix ) * normal );
	vAlOjo = normalize( cameraPosition - mundo.xyz );
	gl_Position = projectionMatrix * viewMatrix * mundo;
}
`

const FRAGMENTOS = /* glsl */ `
uniform float uAlfa;
uniform float uNoche;
varying vec3 vNormal;
varying vec3 vAlOjo;
void main() {
	// El borde (fresnel): la silueta se lee, el cuerpo casi no.
	float borde = pow( 1.0 - abs( dot( normalize( vNormal ), vAlOjo ) ), 2.2 );
	float a = uAlfa * ( 0.25 + 0.75 * borde );
	if ( a < 0.003 ) discard;
	vec3 color = mix( vec3( 0.06, 0.06, 0.065 ), vec3( 0.92, 0.93, 0.96 ), uNoche );
	gl_FragColor = vec4( color * a, a );
}
`

export interface Ecos {
  readonly grupo: THREE.Group
  /** Por copia, sus mallas (una por malla del logo) y su material (su alfa). */
  readonly copias: readonly { readonly mallas: THREE.Mesh[]; readonly material: THREE.ShaderMaterial }[]
  /** Las mallas del logo y su lugar dentro del grupo del logo (fijo: el interior de `ProbeLogo` no se mueve). */
  readonly delLogo: { malla: THREE.Mesh; relativa: THREE.Matrix4 }[]
  /** La historia de las poses del grupo del logo (16 por cuadro) y dónde va la próxima. */
  readonly historia: Float32Array
  cabeza: number
  llenos: number
  /** El movimiento del logo (suavizado) y la amplitud. */
  amplitud: number
  readonly antes: THREE.Vector3
  readonly antesQ: THREE.Quaternion
}

const LARGO = ECOS.copias * ECOS.atraso + 1

export function crearEcos(): Ecos {
  const grupo = new THREE.Group()
  grupo.name = 'espejo: ecos'
  const copias = Array.from({ length: ECOS.copias }, () => ({
    mallas: [] as THREE.Mesh[],
    material: new THREE.ShaderMaterial({ vertexShader: VERTICES, fragmentShader: FRAGMENTOS, uniforms: { uAlfa: { value: 0 }, uNoche: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor }),
  }))
  return { grupo, copias, delLogo: [], historia: new Float32Array(LARGO * 16), cabeza: 0, llenos: 0, amplitud: 0, antes: new THREE.Vector3(Number.NaN, 0, 0), antesQ: new THREE.Quaternion() }
}

/** Arma las copias con las mallas del logo (una vez, cuando el logo ya está). */
export function tomarElLogo(e: Ecos, logo: THREE.Object3D): boolean {
  if (e.delLogo.length > 0) return true
  logo.updateMatrixWorld(true)
  const inversa = logo.matrixWorld.clone().invert()
  logo.traverse((o) => {
    if (o instanceof THREE.Mesh && !(o instanceof THREE.InstancedMesh)) e.delLogo.push({ malla: o, relativa: inversa.clone().multiply(o.matrixWorld) })
  })
  if (e.delLogo.length === 0) return false
  for (const c of e.copias) {
    for (const d of e.delLogo) {
      const m = new THREE.Mesh(d.malla.geometry, c.material)
      m.matrixAutoUpdate = false
      m.frustumCulled = false
      m.name = 'eco del logo'
      c.mallas.push(m)
      e.grupo.add(m)
    }
  }
  return true
}

const POSE = new THREE.Matrix4()
const GIRO = new THREE.Matrix4()
const ESPEJO = new THREE.Matrix4().makeScale(-1, 1, 1)
const ATRAS = new THREE.Vector3()
const CENTRO = new THREE.Vector3()
const Q = new THREE.Quaternion()

/**
 * Un cuadro: guarda la pose del logo, mide cuánto se mueve (eso las despierta; `forzada`, la amplitud del disparador, también) y
 * ubica cada copia con su pose de hace `k · atraso` cuadros, girada en abanico alrededor del eje vertical del logo, espejada una sí y
 * una no, y corrida hacia atrás (lejos de la cámara).
 */
export function cuadroDeLosEcos(e: Ecos, logo: THREE.Object3D, camara: THREE.Camera, dt: number, noche: number, forzada: number, ciclo: readonly number[]): void {
  logo.updateMatrixWorld()
  logo.matrixWorld.toArray(e.historia, e.cabeza * 16)
  e.cabeza = (e.cabeza + 1) % LARGO
  e.llenos = Math.min(LARGO, e.llenos + 1)
  logo.getWorldPosition(CENTRO)
  logo.getWorldQuaternion(Q)
  const mueve = Number.isFinite(e.antes.x) && dt > 0 ? CENTRO.distanceTo(e.antes) / dt : 0
  const gira = dt > 0 ? (2 * Math.acos(Math.min(1, Math.abs(Q.dot(e.antesQ))))) / dt : 0
  e.antes.copy(CENTRO)
  e.antesQ.copy(Q)
  const despierta = Math.max(Math.min(1, Math.max(0, (mueve - ECOS.mueve[0]) / (ECOS.mueve[1] - ECOS.mueve[0]))), Math.min(1, Math.max(0, (gira - ECOS.gira[0]) / (ECOS.gira[1] - ECOS.gira[0]))), forzada)
  // Crecen rápido y se apagan con el ciclo de los ecos (su cura).
  e.amplitud = despierta > e.amplitud ? e.amplitud + (despierta - e.amplitud) * Math.min(1, dt / ciclo[0]) : Math.max(despierta, e.amplitud - dt / ciclo[2])
  ATRAS.copy(CENTRO).sub(camara.position).normalize()
  for (let k = 0; k < e.copias.length; k += 1) {
    const c = e.copias[k]
    const n = k + 1
    const atraso = Math.min(e.llenos - 1, n * ECOS.atraso)
    const i = (e.cabeza - 1 - atraso + LARGO * 2) % LARGO
    POSE.fromArray(e.historia, i * 16)
    // El abanico: alternando a los dos lados; espejadas una sí y una no; más atrás cuanto más viejas.
    const lado = n % 2 === 0 ? 1 : -1
    GIRO.makeRotationY(lado * Math.ceil(n / 2) * ECOS.abanico * e.amplitud)
    POSE.multiply(GIRO)
    if (n % 2 === 1) POSE.multiply(ESPEJO)
    POSE.elements[12] += ATRAS.x * n * ECOS.atras * e.amplitud
    POSE.elements[13] += ATRAS.y * n * ECOS.atras * e.amplitud
    POSE.elements[14] += ATRAS.z * n * ECOS.atras * e.amplitud
    for (let j = 0; j < c.mallas.length; j += 1) c.mallas[j].matrix.multiplyMatrices(POSE, e.delLogo[j].relativa)
    c.material.uniforms.uAlfa.value = (ECOS.alfa * e.amplitud) / (1 + 0.55 * k)
    c.material.uniforms.uNoche.value = noche
    for (const m of c.mallas) m.visible = e.amplitud > 0.002
  }
}

export function soltarEcos(e: Ecos): void {
  for (const c of e.copias) c.material.dispose()
}
