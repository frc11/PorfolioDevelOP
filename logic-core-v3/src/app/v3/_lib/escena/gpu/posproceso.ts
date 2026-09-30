import * as THREE from 'three'

/**
 * [ESCENA 9] T3 · EL POSPROCESO — una prueba que necesita la escena en un búfer antes de llegar a la pantalla:
 * `aa=taa` o `aa=msaa8`, el antialiasing de las aristas en movimiento (el titileo que B7 dejó anotado como el límite del
 * MSAA de 4 muestras): un TAA (la cámara corrida medio píxel en cada cuadro y el historial reproyectado y recortado a la
 * vecindad) o, sin tiempo, 8 muestras en lugar de 4. [ESCENA 10] T1: el bloom de noche, la otra prueba que lo usaba,
 * se borró (código y bandera); queda lo mínimo del antialiasing, que no se decidió.
 *
 * Sin EffectComposer (el contrato de /v3 no deja importar postprocessing; ESTADO §3): el molde es `amanecer/haces.ts`,
 * un búfer propio y un cuadrado. **La escena sale igual que en la pantalla**: el búfer se marca como el de XR para three
 * (`isXRRenderTarget`), y así los materiales aplican el tono y la codificación sRGB como si dibujaran al lienzo (sin eso,
 * en un búfer three los deja lineales y sin tono, y los materiales propios que escriben el color ya codificado —el gris
 * que el amanecer guarda para el logo, la noche— saldrían mal). Todo lo que sigue trabaja sobre esa imagen de pantalla
 * (el TAA en el espacio de pantalla, como muchos motores, para que el tono no parpadee), y la copia final la escribe tal
 * cual. Sin la prueba, nada de esto se monta y la escena se dibuja al lienzo como siempre.
 */
/**
 * La capa del polvo con el TAA: las motas se mueven solas (sin vectores de movimiento el TAA las borra: el recorte a la
 * vecindad acepta el fondo del historial y la mota queda al 10 %). Con el TAA van SOLO en esta capa y se dibujan después
 * de resolverlo, encima, con su antialias analítico de siempre (B6). (La capa 1 era la del bloom.)
 */
export const CAPA_DEL_POLVO = 2

export const POSPROCESO = {
  taa: {
    /** Cuánto del cuadro nuevo entra al historial en reposo, y con la cámara rápida (px por cuadro, desde `rapido`). */
    nuevo: 0.1,
    nuevoRapido: 0.35,
    rapido: 6,
    /** Los corrimientos de medio píxel: Halton (2, 3), este largo. */
    corrimientos: 8,
  },
} as const

type Aa = 'taa' | 'msaa8' | 'no'

const VERTICE_DEL_CUADRADO = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }
`

/** Un paso de pantalla entera: su material y su cuadrado (el mismo para todos). */
function paso(nombre: string, fragmento: string, uniforms: Record<string, THREE.IUniform>): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({ name: nombre, vertexShader: VERTICE_DEL_CUADRADO, fragmentShader: fragmento, uniforms, depthTest: false, depthWrite: false, toneMapped: false })
}

const COPIA_GLSL = /* glsl */ `
uniform sampler2D uImagen;
varying vec2 vUv;
void main() {
	gl_FragColor = vec4( texture2D( uImagen, vUv ).rgb, 1.0 );
}
`

/** El TAA: el historial reproyectado con la profundidad (la cámara se mueve) y recortado a la vecindad del cuadro nuevo. */
const TAA_GLSL = /* glsl */ `
uniform sampler2D uActual;
uniform sampler2D uProfundidad;
uniform sampler2D uHistorial;
uniform mat4 uInversaActual;
uniform mat4 uAnterior;
uniform vec2 uTexel;
uniform float uHayHistorial;
uniform float uDepurar;
varying vec2 vUv;
vec3 aYCoCg( vec3 c ) { return vec3( 0.25 * c.r + 0.5 * c.g + 0.25 * c.b, 0.5 * c.r - 0.5 * c.b, -0.25 * c.r + 0.5 * c.g - 0.25 * c.b ); }
vec3 aRgb( vec3 c ) { return vec3( c.x + c.y - c.z, c.x + c.z, c.x - c.y - c.z ); }
// El historial con Catmull-Rom en 5 lecturas (bilineal, releído en cada cuadro, lo emborronaba).
vec3 historialCR( vec2 uv ) {
	vec2 pos = uv / uTexel;
	vec2 c = floor( pos - 0.5 ) + 0.5;
	vec2 f = pos - c;
	vec2 w0 = f * ( - 0.5 + f * ( 1.0 - 0.5 * f ) );
	vec2 w1 = 1.0 + f * f * ( - 2.5 + 1.5 * f );
	vec2 w2 = f * ( 0.5 + f * ( 2.0 - 1.5 * f ) );
	vec2 w3 = f * f * ( - 0.5 + 0.5 * f );
	vec2 w12 = w1 + w2;
	vec2 t0 = ( c - 1.0 ) * uTexel;
	vec2 t3 = ( c + 2.0 ) * uTexel;
	vec2 t12 = ( c + w2 / w12 ) * uTexel;
	vec3 r = texture2D( uHistorial, vec2( t12.x, t0.y ) ).rgb * ( w12.x * w0.y )
		+ texture2D( uHistorial, vec2( t0.x, t12.y ) ).rgb * ( w0.x * w12.y )
		+ texture2D( uHistorial, t12 ).rgb * ( w12.x * w12.y )
		+ texture2D( uHistorial, vec2( t3.x, t12.y ) ).rgb * ( w3.x * w12.y )
		+ texture2D( uHistorial, vec2( t12.x, t3.y ) ).rgb * ( w12.x * w3.y );
	float w = w12.x * w0.y + w0.x * w12.y + w12.x * w12.y + w3.x * w12.y + w12.x * w3.y;
	return max( r / w, 0.0 );
}
void main() {
	vec3 actual = texture2D( uActual, vUv ).rgb;
	if ( uHayHistorial < 0.5 ) { gl_FragColor = vec4( actual, 1.0 ); return; }
	if ( uDepurar > 1.5 ) { gl_FragColor = vec4( uDepurar > 2.5 ? actual : texture2D( uHistorial, vUv ).rgb, 1.0 ); return; }
	// La vecindad (3 × 3) del cuadro nuevo, en YCoCg: su media y su desvío (el recorte por varianza).
	vec3 m1 = vec3( 0.0 );
	vec3 m2 = vec3( 0.0 );
	for ( int y = -1; y <= 1; y++ ) for ( int x = -1; x <= 1; x++ ) {
		vec3 c = aYCoCg( texture2D( uActual, vUv + vec2( float( x ), float( y ) ) * uTexel ).rgb );
		m1 += c;
		m2 += c * c;
	}
	m1 /= 9.0;
	vec3 desvio = sqrt( max( m2 / 9.0 - m1 * m1, 0.0 ) );
	// Dónde estaba este punto en el cuadro anterior: el mundo desde la profundidad, a la cámara de antes.
	float z = texture2D( uProfundidad, vUv ).r;
	vec4 mundo = uInversaActual * vec4( vUv * 2.0 - 1.0, z * 2.0 - 1.0, 1.0 );
	mundo /= mundo.w;
	vec4 antes = uAnterior * mundo;
	vec2 uvAntes = antes.xy / antes.w * 0.5 + 0.5;
	vec2 corrido = ( uvAntes - vUv ) / uTexel;
	// Con banco: el corrimiento reproyectado (px) y la profundidad, en vez de la imagen.
	if ( uDepurar > 0.5 ) { gl_FragColor = vec4( 0.5 + corrido * 0.05, length( mundo.xyz ) / 60.0, 1.0 ); return; }
	if ( uvAntes.x < 0.0 || uvAntes.y < 0.0 || uvAntes.x > 1.0 || uvAntes.y > 1.0 ) { gl_FragColor = vec4( actual, 1.0 ); return; }
	vec3 historial = aYCoCg( historialCR( uvAntes ) );
	historial = clamp( historial, m1 - desvio * 1.25, m1 + desvio * 1.25 );
	// Con la cámara rápida, más del cuadro nuevo: menos estela.
	float nuevo = mix( ${POSPROCESO.taa.nuevo.toFixed(3)}, ${POSPROCESO.taa.nuevoRapido.toFixed(3)}, smoothstep( 0.0, ${POSPROCESO.taa.rapido.toFixed(1)}, length( corrido ) ) );
	gl_FragColor = vec4( aRgb( mix( historial, aYCoCg( actual ), nuevo ) ), 1.0 );
}
`

/** Halton de base `b`, el término `i` (desde 1). */
export function halton(i: number, b: number): number {
  let [f, r, k] = [1, 0, i]
  while (k > 0) {
    f /= b
    r += f * (k % b)
    k = Math.floor(k / b)
  }
  return r
}

export interface Posproceso {
  /** Para el precompilado: la escena de los pasos (una malla por paso) y un búfer donde calentarlos. */
  readonly aparte: { readonly escena: THREE.Scene; readonly bufer: THREE.WebGLRenderTarget }
  /** Dibuja la escena y los pasos. */
  readonly dibujar: (gl: THREE.WebGLRenderer, escena: THREE.Scene, camara: THREE.Camera) => void
  /** Con banco: el TAA (para comparar su titileo). */
  readonly banco: { taa: boolean; depurar: (gl: THREE.WebGLRenderer) => unknown; muestras: (n: number) => void; depurarElTaa: (modo: number) => void; medirPasos: (gl: THREE.WebGLRenderer, dibujo: () => void, n: number) => Promise<Record<string, number>> }
  readonly soltar: () => void
}

export function crearPosproceso(opciones: { readonly aa: Aa }): Posproceso {
  const muestras = opciones.aa === 'msaa8' ? 8 : 4
  const conTaa = opciones.aa === 'taa'
  // La escena, como en la pantalla (ver arriba), con su profundidad (el TAA la lee para reproyectar).
  const escenaRT = new THREE.WebGLRenderTarget(1, 1, { samples: muestras, type: THREE.UnsignedByteType, depthBuffer: true })
  escenaRT.texture.colorSpace = THREE.SRGBColorSpace
  // Los bytes de pantalla tal cual (sin la decodificación de una textura sRGB), y el MISMO formato que las muestras: WebGL2
  // no resuelve el MSAA entre formatos distintos (con XR, three pone RGBA8 a las muestras y SRGB8_ALPHA8 a la textura).
  escenaRT.texture.internalFormat = 'RGBA8'
  ;(escenaRT as THREE.WebGLRenderTarget & { isXRRenderTarget: boolean }).isXRRenderTarget = true
  if (conTaa) escenaRT.depthTexture = new THREE.DepthTexture(1, 1, THREE.FloatType)
  escenaRT.texture.name = 'posproceso · escena'
  const opcionesDeMedio = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false }
  const historial = conTaa ? [new THREE.WebGLRenderTarget(1, 1, opcionesDeMedio), new THREE.WebGLRenderTarget(1, 1, opcionesDeMedio)] : []

  const u = {
    copia: { uImagen: { value: null as THREE.Texture | null } },
    taa: { uActual: { value: null as THREE.Texture | null }, uProfundidad: { value: null as THREE.Texture | null }, uHistorial: { value: null as THREE.Texture | null }, uInversaActual: { value: new THREE.Matrix4() }, uAnterior: { value: new THREE.Matrix4() }, uTexel: { value: new THREE.Vector2() }, uHayHistorial: { value: 0 }, uDepurar: { value: 0 } },
  }
  const materiales = {
    copia: paso('posproceso · copia', COPIA_GLSL, u.copia),
    taa: paso('posproceso · taa', TAA_GLSL, u.taa),
  }
  // Una malla por paso (se prende la del paso que corre): así el precompilado los compila todos al arrancar (regla 2).
  const cuadrado = new THREE.PlaneGeometry(2, 2)
  const escenaDelPaso = new THREE.Scene()
  escenaDelPaso.name = 'posproceso'
  const mallas = {} as Record<keyof typeof materiales, THREE.Mesh>
  for (const [k, m] of Object.entries(materiales) as [keyof typeof materiales, THREE.ShaderMaterial][]) {
    const malla = new THREE.Mesh(cuadrado, m)
    malla.name = m.name
    malla.frustumCulled = false
    malla.visible = false
    escenaDelPaso.add(malla)
    mallas[k] = malla
  }
  const camaraDelPaso = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  let prendida: THREE.Mesh | null = null

  const tam = new THREE.Vector2()
  const sinCorrimiento = new THREE.Matrix4()
  const vistaProyeccion = new THREE.Matrix4()
  let [ancho, alto, cuadro, cual, hayHistorial] = [0, 0, 0, 0, false]
  // Con banco: el tiempo de GPU de cada paso (una consulta de tiempo alrededor de cada uno; no se anidan).
  const crono = { ctx: null as WebGL2RenderingContext | null, ext: null as { readonly TIME_ELAPSED_EXT: number } | null, activo: false, consultas: [] as { readonly nombre: string; readonly q: WebGLQuery }[] }
  const abrir = (nombre: string): void => {
    if (!crono.activo || crono.ctx === null || crono.ext === null) return
    const q = crono.ctx.createQuery() // banco
    crono.ctx.beginQuery(crono.ext.TIME_ELAPSED_EXT, q)
    crono.consultas.push({ nombre, q })
  }
  const cerrar = (): void => {
    if (crono.activo && crono.ctx !== null && crono.ext !== null) crono.ctx.endQuery(crono.ext.TIME_ELAPSED_EXT)
  }
  const banco = {
    // Con banco: `n` dibujos medidos paso por paso; devuelve el promedio de cada paso (ms de GPU).
    medirPasos: (gl: THREE.WebGLRenderer, dibujo: () => void, n: number): Promise<Record<string, number>> => {
      const ctx = gl.getContext() as WebGL2RenderingContext
      crono.ctx = ctx
      crono.ext = ctx.getExtension('EXT_disjoint_timer_query_webgl2') as { readonly TIME_ELAPSED_EXT: number } | null
      if (crono.ext === null) return Promise.resolve({})
      crono.consultas = []
      crono.activo = true
      for (let k = 0; k < n; k += 1) dibujo()
      crono.activo = false
      const consultas = crono.consultas
      return new Promise((listo) => {
        const leer = (): void => {
          if (!consultas.every((c) => ctx.getQueryParameter(c.q, ctx.QUERY_RESULT_AVAILABLE) === true)) {
            requestAnimationFrame(leer)
            return
          }
          const suma: Record<string, number> = {}
          for (const c of consultas) {
            suma[c.nombre] = (suma[c.nombre] ?? 0) + Number(ctx.getQueryParameter(c.q, ctx.QUERY_RESULT)) / 1e6 / n
            ctx.deleteQuery(c.q)
          }
          listo(Object.fromEntries(Object.entries(suma).map(([k, v]) => [k, +v.toFixed(3)])))
        }
        requestAnimationFrame(leer)
      })
    },
    taa: true,
    // Con banco: un píxel del medio del búfer de la escena y el error de WebGL (para cuando algo sale negro).
    depurar: (gl: THREE.WebGLRenderer): unknown => {
      const px = new Uint8Array(4) // banco
      gl.readRenderTargetPixels(escenaRT, ancho >> 1, alto >> 1, 1, 1, px)
      return { ancho, alto, medio: [...px], error: gl.getContext().getError(), muestras: escenaRT.samples }
    },
    // Con banco: el TAA pinta el corrimiento reproyectado y la profundidad (para cuando no converge).
    depurarElTaa: (modo: number): void => {
      u.taa.uDepurar.value = modo
    },
    // Con banco: cuántas muestras tiene el búfer de la escena (se rearma en el próximo dibujo).
    muestras: (n: number): void => {
      escenaRT.dispose()
      escenaRT.samples = n
      hayHistorial = false
    },
  }

  /** Un paso de pantalla entera; `limpiar` en falso lo escribe encima (para devolver una imagen a un búfer con profundidad). */
  const pasar = (gl: THREE.WebGLRenderer, cual: keyof typeof materiales, destino: THREE.WebGLRenderTarget | null, limpiar = true): void => {
    if (prendida !== null) prendida.visible = false
    prendida = mallas[cual]
    prendida.visible = true
    gl.setRenderTarget(destino)
    const autoClear = gl.autoClear
    gl.autoClear = limpiar
    gl.render(escenaDelPaso, camaraDelPaso)
    gl.autoClear = autoClear
  }

  /**
   * Dibuja sólo una capa de la escena sobre lo que ya tiene `destino` (su color y su profundidad). Sin el fondo mientras
   * tanto: con un fondo de color three limpia el búfer aunque `autoClear` esté apagado (y se llevaba la profundidad).
   */
  const soloLaCapa = (gl: THREE.WebGLRenderer, escena: THREE.Scene, camara: THREE.Camera, capa: number, destino: THREE.WebGLRenderTarget): void => {
    const [autoClear, mascara, fondo] = [gl.autoClear, camara.layers.mask, escena.background]
    gl.setRenderTarget(destino)
    gl.autoClear = false
    escena.background = null
    camara.layers.set(capa)
    gl.render(escena, camara)
    camara.layers.mask = mascara
    escena.background = fondo
    gl.autoClear = autoClear
  }

  const medir = (gl: THREE.WebGLRenderer): void => {
    gl.getDrawingBufferSize(tam)
    if (tam.x === ancho && tam.y === alto) return
    ;[ancho, alto] = [tam.x, tam.y]
    escenaRT.setSize(ancho, alto)
    for (const h of historial) h.setSize(ancho, alto)
    hayHistorial = false
  }

  const dibujar = (gl: THREE.WebGLRenderer, escena: THREE.Scene, camara: THREE.Camera): void => {
    medir(gl)
    const previo = gl.getRenderTarget()
    const taa = conTaa && banco.taa
    // 1 · la escena (con el TAA, corrida una fracción de píxel: Halton 2, 3).
    if (taa && camara instanceof THREE.PerspectiveCamera) {
      sinCorrimiento.copy(camara.projectionMatrix)
      const k = (cuadro % POSPROCESO.taa.corrimientos) + 1
      camara.projectionMatrix.elements[8] += ((halton(k, 2) - 0.5) * 2) / ancho
      camara.projectionMatrix.elements[9] += ((halton(k, 3) - 0.5) * 2) / alto
      camara.projectionMatrixInverse.copy(camara.projectionMatrix).invert()
    }
    // Sin el TAA, el polvo va con todo lo demás (con el TAA existe sólo en su capa).
    const mascara = camara.layers.mask
    if (!taa) camara.layers.enable(CAPA_DEL_POLVO)
    abrir('la escena')
    gl.setRenderTarget(escenaRT)
    gl.render(escena, camara)
    cerrar()
    camara.layers.mask = mascara
    let imagen: THREE.Texture = escenaRT.texture
    // 2 · el TAA, y el polvo encima.
    if (taa && camara instanceof THREE.PerspectiveCamera) {
      const destino = historial[cual]
      u.taa.uActual.value = escenaRT.texture
      u.taa.uProfundidad.value = escenaRT.depthTexture
      u.taa.uHistorial.value = historial[1 - cual].texture
      // Sin el corrimiento: la uv de un píxel es la del cuadro «quieto» (con la cámara corrida, el historial se leía
      // desplazado lo que medía el corrimiento de cada cuadro, y se emborronaba).
      u.taa.uInversaActual.value.multiplyMatrices(sinCorrimiento, camara.matrixWorldInverse).invert()
      u.taa.uTexel.value.set(1 / ancho, 1 / alto)
      u.taa.uHayHistorial.value = hayHistorial ? 1 : 0
      abrir('el taa')
      pasar(gl, 'taa', destino)
      cerrar()
      camara.projectionMatrix.copy(sinCorrimiento)
      camara.projectionMatrixInverse.copy(sinCorrimiento).invert()
      // El historial se reproyecta con la cámara SIN corrimiento del cuadro que termina.
      vistaProyeccion.multiplyMatrices(sinCorrimiento, camara.matrixWorldInverse)
      u.taa.uAnterior.value.copy(vistaProyeccion)
      cual = 1 - cual
      hayHistorial = true
      // La imagen del TAA vuelve al búfer de la escena (que conserva su profundidad) y el polvo se dibuja encima.
      u.copia.uImagen.value = destino.texture
      abrir('el polvo encima')
      pasar(gl, 'copia', escenaRT, false)
      soloLaCapa(gl, escena, camara, CAPA_DEL_POLVO, escenaRT)
      cerrar()
      imagen = escenaRT.texture
    } else hayHistorial = false
    cuadro += 1
    // 3 · al lienzo, tal cual.
    u.copia.uImagen.value = imagen
    abrir('al lienzo')
    pasar(gl, 'copia', null)
    cerrar()
    gl.setRenderTarget(previo)
  }

  return {
    aparte: { escena: escenaDelPaso, bufer: escenaRT },
    dibujar,
    banco,
    soltar: () => {
      escenaRT.depthTexture?.dispose()
      escenaRT.dispose()
      for (const r of historial) r.dispose()
      for (const m of Object.values(materiales)) m.dispose()
      cuadrado.dispose()
    },
  }
}

