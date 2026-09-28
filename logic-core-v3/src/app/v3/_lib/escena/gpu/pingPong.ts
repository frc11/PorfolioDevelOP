import * as THREE from 'three'

/**
 * [ESCENA 6] UNA SIMULACIÓN EN LA GPU — dos texturas que se turnan (la de este paso lee la del
 * anterior) y un triángulo que cubre la pantalla. La usan el piso vivo (una celda por bloque) y el
 * polvo con física (una celda por mota). Cada paso es UNA llamada de dibujo sobre un búfer chico.
 *
 * Con `salidas` > 1 escribe varias texturas a la vez (MRT): el fragment declara
 * `layout( location = k ) out vec4 …` y lee las anteriores de `uEstado[k]`.
 */

export interface PingPong {
  /** La textura con el último estado, una por salida. */
  readonly estado: () => readonly THREE.Texture[]
  /** Para el banco: lee el último estado de una salida como números. */
  readonly leer: (renderer: THREE.WebGLRenderer, salida?: number) => Float32Array
  readonly material: THREE.ShaderMaterial
  /** Corre un paso: dibuja el siguiente estado leyendo el actual. */
  readonly paso: (renderer: THREE.WebGLRenderer) => void
  /** Pone todo el estado en `valor` (en cada canal de cada salida). */
  readonly llenar: (renderer: THREE.WebGLRenderer, valor: THREE.Vector4) => void
  readonly soltar: () => void
}

const VERTEX = /* glsl */ `
out vec2 vUv;
void main() {
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4( position.xy, 0.0, 1.0 );
}
`

/** `precisa`: 32 bits por canal (el polvo guarda posiciones de hasta ±70); si no, 16 (las alturas del piso). */
export function crearPingPong(ancho: number, alto: number, salidas: number, fragmentShader: string, uniforms: Record<string, THREE.IUniform>, precisa = false): PingPong {
  const opciones = {
    count: salidas,
    type: precisa ? THREE.FloatType : THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  }
  const blancos = [new THREE.WebGLRenderTarget(ancho, alto, opciones), new THREE.WebGLRenderTarget(ancho, alto, opciones)]
  let actual = 0
  const uEstado = { value: blancos[0].textures.slice() }
  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: VERTEX,
    fragmentShader,
    uniforms: { ...uniforms, uEstado, uTam: { value: new THREE.Vector2(ancho, alto) } },
    depthTest: false,
    depthWrite: false,
  })
  // Un triángulo que cubre todo el búfer.
  const geometria = new THREE.BufferGeometry()
  geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
  const malla = new THREE.Mesh(geometria, material)
  malla.frustumCulled = false
  const escena = new THREE.Scene()
  escena.add(malla)
  const camara = new THREE.Camera()

  const dibujar = (renderer: THREE.WebGLRenderer, destino: THREE.WebGLRenderTarget): void => {
    const previo = renderer.getRenderTarget()
    const autoLimpiar = renderer.autoClear
    const xr = renderer.xr.enabled
    renderer.autoClear = false
    renderer.xr.enabled = false
    renderer.setRenderTarget(destino)
    renderer.render(escena, camara)
    renderer.setRenderTarget(previo)
    renderer.autoClear = autoLimpiar
    renderer.xr.enabled = xr
  }

  return {
    estado: () => blancos[actual].textures,
    leer: (renderer, salida = 0) => {
      if (precisa) {
        const datos = new Float32Array(ancho * alto * 4)
        renderer.readRenderTargetPixels(blancos[actual], 0, 0, ancho, alto, datos, undefined, salida)
        return datos
      }
      const crudo = new Uint16Array(ancho * alto * 4)
      renderer.readRenderTargetPixels(blancos[actual], 0, 0, ancho, alto, crudo, undefined, salida)
      return Float32Array.from(crudo, (h) => THREE.DataUtils.fromHalfFloat(h))
    },
    material,
    paso: (renderer) => {
      uEstado.value = blancos[actual].textures.slice()
      const siguiente = 1 - actual
      dibujar(renderer, blancos[siguiente])
      actual = siguiente
    },
    llenar: (renderer, valor) => {
      const previo = renderer.getRenderTarget()
      const color = renderer.getClearColor(new THREE.Color())
      const alfa = renderer.getClearAlpha()
      for (const b of blancos) {
        renderer.setRenderTarget(b)
        renderer.setClearColor(new THREE.Color(valor.x, valor.y, valor.z), valor.w)
        renderer.clear(true, false, false)
      }
      renderer.setClearColor(color, alfa)
      renderer.setRenderTarget(previo)
    },
    soltar: () => {
      for (const b of blancos) b.dispose()
      geometria.dispose()
      material.dispose()
    },
  }
}
