import * as THREE from 'three'

/**
 * [ESCENA 9] T3 · LA SOMBRA PROYECTADA DEL LOGO SOBRE EL PISO VIVO — una prueba (bandera `sombra-logo`).
 *
 * Hasta acá el logo se apoya con una MANCHA (la oclusión de contacto: un óvalo debajo, que no sabe de la forma ni de la
 * luz). Acá, además, su sombra de verdad: la de la luz principal (la del sol del arco, que de día manda), con la forma de
 * la «cp», proyectada sobre los bloques del piso vivo (sobre sus tapas y costados, con su relieve), y suave. La mancha de
 * contacto sigue: las dos conviven (la mancha pone lo que está pegado al logo; la sombra, lo que la luz no alcanza).
 *
 * **Cómo: un mapa de sombra de VARIANZA.** El logo SOLO (nadie más proyecta: el piso no se sombrea a sí mismo, no hay
 * acné ni fugas entre capas) visto desde la principal con una cámara ortográfica que lo abraza, dibujado en cada cuadro
 * (el logo se balancea) como los dos momentos de su profundidad, desenfocado en dos pasadas a baja resolución: eso ES la
 * penumbra. En el piso, UNA lectura por píxel y la desigualdad de Chebyshev dicen cuánta luz llega. La primera versión
 * (una búsqueda del oclusor y un filtro de 36 muestras por píxel, PCSS) costaba 0,5–1,3 ms de GPU en la placa de medición,
 * arriba del presupuesto de §4; ésta, una lectura. La penumbra es pareja (no se afina cerca del palo de la «p»): para un
 * logo que flota alcanza, y lo que se apoya lo pone la mancha.
 *
 * Cuánto oscurece sigue al nivel de la principal: de noche, sin sol, se va (queda la mancha).
 */
export const SOMBRA_DEL_LOGO = {
  /** El lado del mapa (texeles) y la mitad de la caja de la cámara de la luz (u: el logo mide ~5 de ancho). */
  resolucion: 256,
  radio: 4.4,
  /** El largo de la caja a lo largo de la luz (u): de un lado del logo al piso. */
  lejos: 40,
  /** Cuánto oscurece con la principal entera (la mezcla hacia el color del contacto). */
  fuerza: 0.4,
  /** [NOCTURNO FINAL] B1 · con el logo en el aire (u sobre su lugar: desde, hasta), la sombra se va: al cargar, el logo cae. */
  aire: [1, 4],
  /** El desenfoque (la penumbra): pasadas de 9 muestras gaussianas, cada una de este sigma (texeles). */
  desenfoque: { pasadas: 2, sigma: 2.5 },
  /** La varianza mínima (contra el ruido) y el corte del sangrado de luz (Chebyshev). */
  varianzaMinima: 0.000002,
  sangrado: 0.3,
} as const

/** Lo que leen el piso (el mapa, la luz, cuánto oscurece) y lo que escribe `SombraDelLogo` en cada cuadro. */
export const SOMBRA_EN_VIVO = {
  uMapaDeLaSombra: { value: null as THREE.Texture | null },
  /** Proyección por vista de la cámara de la luz (del mundo a su recorte). */
  uLuzDeLaSombra: { value: new THREE.Matrix4() },
  /** La vista de la cámara de la luz (del mundo a su espacio: la profundidad es −z). */
  uVistaDeLaSombra: { value: new THREE.Matrix4() },
  uFuerzaDeLaSombra: { value: 0 },
}

/** [PULIDO 2] 6 · cuánto de la sombra deja el final del pie (0 a 1): se va al apoyarse y vuelve con un fundido. */
export const SOMBRA_EN_EL_FINAL = { fundido: 1 }

const S = SOMBRA_DEL_LOGO
const f = (x: number): string => x.toFixed(6)

/**
 * [PASADA FINAL] C3 · lo que distingue un mapa de otro: el del logo (por defecto, sus cifras de siempre) y el de los
 * títulos (`deLosTitulos.ts`; [AJUSTES FINALES] A2: en el producto, con su propio mapa). La técnica es la misma; cambian la caja, la resolución, la
 * penumbra y cómo se llaman sus uniformes en el piso.
 */
export interface ParametrosDelMapa {
  readonly resolucion: number
  readonly radio: number
  readonly lejos: number
  readonly desenfoque: { readonly pasadas: number; readonly sigma: number }
  readonly varianzaMinima: number
  readonly sangrado: number
}

/** El material del mapa: los dos momentos de la profundidad lineal a lo largo de la luz (0 a 1 en la caja). */
export function materialDelMapa(p: ParametrosDelMapa = S, nombre = 'sombra del logo'): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    name: `${nombre} · profundidad`,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
varying float vProfundidad;
void main() {
	vec4 vista = viewMatrix * modelMatrix * vec4( position, 1.0 );
	vProfundidad = - vista.z / ${f(p.lejos)};
	gl_Position = projectionMatrix * vista;
}`,
    fragmentShader: /* glsl */ `
varying float vProfundidad;
void main() {
	float d = vProfundidad;
	// El segundo momento con la pendiente del texel (la varianza de la propia superficie inclinada).
	float dx = dFdx( d );
	float dy = dFdy( d );
	gl_FragColor = vec4( d, d * d + 0.25 * ( dx * dx + dy * dy ), 0.0, 1.0 );
}`,
  })
}

/** Una pasada del desenfoque: 9 muestras gaussianas en `uPaso` (un texel en x o en y). */
function materialDelDesenfoque(p: ParametrosDelMapa, nombre: string): THREE.ShaderMaterial {
  const w = Array.from({ length: 5 }, (_, i) => Math.exp(-(i * i) / (2 * p.desenfoque.sigma * p.desenfoque.sigma)))
  const suma = w[0] + 2 * (w[1] + w[2] + w[3] + w[4])
  const pesos = w.map((x) => (x / suma).toFixed(6))
  return new THREE.ShaderMaterial({
    name: `${nombre} · desenfoque`,
    uniforms: { uMapa: { value: null }, uPaso: { value: new THREE.Vector2() } },
    depthTest: false,
    depthWrite: false,
    vertexShader: /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }`,
    fragmentShader: /* glsl */ `
uniform sampler2D uMapa;
uniform vec2 uPaso;
varying vec2 vUv;
void main() {
	vec2 m = texture2D( uMapa, vUv ).rg * ${pesos[0]};
	m += ( texture2D( uMapa, vUv + uPaso ).rg + texture2D( uMapa, vUv - uPaso ).rg ) * ${pesos[1]};
	m += ( texture2D( uMapa, vUv + 2.0 * uPaso ).rg + texture2D( uMapa, vUv - 2.0 * uPaso ).rg ) * ${pesos[2]};
	m += ( texture2D( uMapa, vUv + 3.0 * uPaso ).rg + texture2D( uMapa, vUv - 3.0 * uPaso ).rg ) * ${pesos[3]};
	m += ( texture2D( uMapa, vUv + 4.0 * uPaso ).rg + texture2D( uMapa, vUv - 4.0 * uPaso ).rg ) * ${pesos[4]};
	gl_FragColor = vec4( m, 0.0, 1.0 );
}`,
  })
}

/** Los nombres de una sombra en el piso: su función y sus uniformes (el mapa, la luz, la vista y cuánto oscurece). */
export interface NombresDeLaSombra {
  readonly funcion: string
  readonly mapa: string
  readonly luz: string
  readonly vista: string
  readonly fuerza: string
}

/** En el piso: `<funcion>( mundo )`, de 0 (a la luz) a 1 (del todo a la sombra). Una lectura. */
export function sombraProyectadaGlsl(n: NombresDeLaSombra, p: ParametrosDelMapa): string {
  return /* glsl */ `
uniform sampler2D ${n.mapa};
uniform mat4 ${n.luz};
uniform mat4 ${n.vista};
uniform float ${n.fuerza};
float ${n.funcion}( vec3 mundo ) {
	if ( ${n.fuerza} <= 0.001 ) return 0.0;
	vec4 recorte = ${n.luz} * vec4( mundo, 1.0 );
	vec2 uv = recorte.xy * 0.5 + 0.5;
	if ( uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0 ) return 0.0;
	float receptor = - ( ${n.vista} * vec4( mundo, 1.0 ) ).z / ${f(p.lejos)};
	vec2 m = texture2D( ${n.mapa}, uv ).rg;
	if ( receptor <= m.x ) return 0.0;
	// Chebyshev: la cota de cuánta luz pasa, con el sangrado cortado (una sola capa proyecta: casi no hay).
	float varianza = max( m.y - m.x * m.x, ${f(p.varianzaMinima)} );
	float d = receptor - m.x;
	float luz = varianza / ( varianza + d * d );
	luz = clamp( ( luz - ${p.sangrado.toFixed(3)} ) / ${(1 - p.sangrado).toFixed(3)}, 0.0, 1.0 );
	// El borde de la caja de la luz, sin corte.
	vec2 alBorde = min( uv, 1.0 - uv );
	return ( 1.0 - luz ) * smoothstep( 0.0, 0.04, min( alBorde.x, alBorde.y ) );
}
`
}

export const SOMBRA_DEL_LOGO_GLSL = sombraProyectadaGlsl({ funcion: 'sombraDelLogo', mapa: 'uMapaDeLaSombra', luz: 'uLuzDeLaSombra', vista: 'uVistaDeLaSombra', fuerza: 'uFuerzaDeLaSombra' }, S)

/** La línea que la aplica en el piso (en el espacio del búfer, como la mancha). */
export const APLICAR_LA_SOMBRA_GLSL = /* glsl */ `gl_FragColor.rgb = mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, sombraDelLogo( vPiso ) * uFuerzaDeLaSombra );`

/** El mapa: sus dos búferes (el del desenfoque se turna), la cámara de la luz, la escena del logo y la del desenfoque. */
export interface MapaDeLaSombra {
  readonly bufer: THREE.WebGLRenderTarget
  readonly escena: THREE.Scene
  readonly camara: THREE.OrthographicCamera
  readonly material: THREE.ShaderMaterial
  /** El desenfoque: su escena (un cuadrado), su búfer de paso y cómo correrlo. */
  readonly desenfoque: { readonly escena: THREE.Scene; readonly bufer: THREE.WebGLRenderTarget }
  readonly desenfocar: (gl: THREE.WebGLRenderer) => void
  readonly soltar: () => void
}

export function crearMapaDeLaSombra(p: ParametrosDelMapa = S, nombre = 'sombra del logo'): MapaDeLaSombra {
  // Flotante de 32 bits: la varianza es una resta de dos números parecidos (con medio punto se la comía el redondeo).
  const opciones = { type: THREE.FloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false }
  const bufer = new THREE.WebGLRenderTarget(p.resolucion, p.resolucion, { ...opciones, depthBuffer: true })
  bufer.texture.name = `${nombre} · mapa`
  const paso = new THREE.WebGLRenderTarget(p.resolucion, p.resolucion, { ...opciones, depthBuffer: false })
  paso.texture.name = `${nombre} · desenfoque`
  const escena = new THREE.Scene()
  escena.name = nombre
  escena.background = new THREE.Color(1, 1, 1) // lo que no tapa: lejos
  const camara = new THREE.OrthographicCamera(-p.radio, p.radio, p.radio, -p.radio, 0.05, p.lejos)
  const material = materialDelMapa(p, nombre)
  const desenfoque = materialDelDesenfoque(p, nombre)
  const cuadrado = new THREE.PlaneGeometry(2, 2)
  const malla = new THREE.Mesh(cuadrado, desenfoque)
  malla.name = `${nombre} · desenfoque`
  malla.frustumCulled = false
  const escenaDelDesenfoque = new THREE.Scene()
  escenaDelDesenfoque.add(malla)
  const camaraDelDesenfoque = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const texel = 1 / p.resolucion
  const desenfocar = (gl: THREE.WebGLRenderer): void => {
    const u = desenfoque.uniforms
    for (let k = 0; k < p.desenfoque.pasadas; k += 1) {
      u.uMapa.value = bufer.texture
      ;(u.uPaso.value as THREE.Vector2).set(texel, 0)
      gl.setRenderTarget(paso)
      gl.render(escenaDelDesenfoque, camaraDelDesenfoque)
      u.uMapa.value = paso.texture
      ;(u.uPaso.value as THREE.Vector2).set(0, texel)
      gl.setRenderTarget(bufer)
      gl.render(escenaDelDesenfoque, camaraDelDesenfoque)
    }
  }
  return {
    bufer,
    escena,
    camara,
    material,
    desenfoque: { escena: escenaDelDesenfoque, bufer: paso },
    desenfocar,
    soltar: () => {
      bufer.dispose()
      paso.dispose()
      material.dispose()
      desenfoque.dispose()
      cuadrado.dispose()
    },
  }
}
