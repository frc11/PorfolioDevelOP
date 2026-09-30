import * as THREE from 'three'

import { INK_ROUGHNESS } from './probeScene'

/**
 * [ESCENA 9] T3 · EL LOGO CON MATERIAL FÍSICO Y REFLEJOS DE ESTUDIO — una prueba (bandera `material=satinado` o
 * `material=brillante`).
 *
 * Hasta acá el logo es negro con luces analíticas y sin entorno (S6: «sin HDRI, media respuesta»): lo único que dibuja
 * su volumen es el brillo puntual de tres direccionales. Un objeto de estudio de verdad se lee por lo que REFLEJA: las
 * paredes curvas del logo (con las normales suaves de B7) barren muchas direcciones y cada una devuelve un pedazo del
 * estudio. Acá el estudio se GENERA (no se descarga nada): una sala gris oscura con un softbox grande arriba, dos tiras
 * verticales a los costados, un relleno tenue al frente y el piso claro del estudio, convertidos una vez al cargar en
 * un mapa de entorno filtrado por rugosidad (PMREM de three, 256 px por cara).
 *
 * El color base NO cambia (la tinta de siempre, metalness 0: el 4 % de reflejo de un dieléctrico, más en los cantos por
 * Fresnel). Dos variantes: satinado (el reflejo difuso, sin laca) y brillante (una laca encima: un segundo reflejo nítido
 * de los softbox). Cuánto se ven los reflejos sigue a la luz de la sala en cada cuadro (la principal): de noche, con la
 * sala apagada, el estudio también se apaga.
 */
export type MaterialDelLogo = 'satinado' | 'brillante'

export const MATERIALES_DEL_LOGO: Readonly<Record<MaterialDelLogo, { readonly roughness: number; readonly clearcoat: number; readonly clearcoatRoughness: number; readonly reflejos: number }>> = {
  satinado: { roughness: 0.3, clearcoat: 0, clearcoatRoughness: 0, reflejos: 1 },
  brillante: { roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.06, reflejos: 1 },
}

/** Los softbox del estudio: dónde (centro), cuánto miden, hacia dónde miran y cuánta luz dan (lineal). */
export const ESTUDIO = {
  /** La sala (una caja vista de adentro) y su gris. */
  sala: { lado: 24, alto: 14, gris: 0.04 },
  /** El piso del estudio: el papel claro que rebota (a la altura del piso de la escena, más o menos). */
  piso: { y: -3.2, gris: 0.12 },
  softbox: [
    { nombre: 'arriba', centro: [0, 7, 2], tam: [6, 3], mira: [0, -1, 0], luz: 6 },
    // Las tiras, por encima del horizonte: las tapas planas (vistas desde apenas arriba reflejan hacia abajo) no las
    // toman enteras; las paredes curvas que miran hacia arriba, sí, como bandas.
    { nombre: 'tira izquierda', centro: [-8, 4.8, 3.5], tam: [0.8, 5], mira: [1, -0.35, -0.35], luz: 10 },
    { nombre: 'tira derecha', centro: [8.5, 5, -4], tam: [0.7, 5], mira: [-1, -0.35, 0.45], luz: 8 },
    { nombre: 'frente alto', centro: [0, 6, 12], tam: [8, 2], mira: [0, -0.45, -1], luz: 2.4 },
  ],
} as const

/**
 * Lo que el material hace en vivo: cuánto se ven los reflejos de la variante puesta (0 = como el producto) y el nivel de
 * la luz de la sala del último cuadro (lo escribe `ReflejosDelLogo`).
 */
export const ESTUDIO_EN_VIVO = { reflejos: 1, nivel: 1 }

/** Pone la variante en el material (o la del producto, con `no`: sin reflejos, la rugosidad y sin laca). */
export function aplicarMaterial(m: THREE.MeshPhysicalMaterial, variante: MaterialDelLogo | 'no'): void {
  const v = variante === 'no' ? { roughness: INK_ROUGHNESS, clearcoat: 0, clearcoatRoughness: 0, reflejos: 0 } : MATERIALES_DEL_LOGO[variante]
  m.roughness = v.roughness
  m.clearcoat = v.clearcoat
  m.clearcoatRoughness = v.clearcoatRoughness
  ESTUDIO_EN_VIVO.reflejos = v.reflejos
  // Ya, no en el cuadro que viene: el banco dibuja cada variante en la misma tarea.
  m.envMapIntensity = v.reflejos * ESTUDIO_EN_VIVO.nivel
}

/** El estudio como escena (para generar el entorno): la sala, el piso y los softbox. Devuelve también cómo soltarla. */
export function escenaDelEstudio(): { readonly escena: THREE.Scene; readonly soltar: () => void } {
  const escena = new THREE.Scene()
  const soltables: { dispose: () => void }[] = []
  const basico = (gris: number, lado: THREE.Side = THREE.FrontSide): THREE.MeshBasicMaterial => {
    const m = new THREE.MeshBasicMaterial({ side: lado, toneMapped: false })
    m.color.setScalar(gris)
    soltables.push(m)
    return m
  }
  const { sala, piso } = ESTUDIO
  const caja = new THREE.BoxGeometry(sala.lado, sala.alto, sala.lado)
  soltables.push(caja)
  const cuarto = new THREE.Mesh(caja, basico(sala.gris, THREE.BackSide))
  cuarto.position.y = sala.alto / 2 + piso.y
  escena.add(cuarto)
  const plano = new THREE.PlaneGeometry(1, 1)
  soltables.push(plano)
  const suelo = new THREE.Mesh(plano, basico(piso.gris))
  suelo.scale.set(sala.lado, sala.lado, 1)
  suelo.rotation.x = -Math.PI / 2
  suelo.position.y = piso.y + 0.01
  escena.add(suelo)
  for (const s of ESTUDIO.softbox) {
    const caja = new THREE.Mesh(plano, basico(s.luz, THREE.DoubleSide))
    caja.scale.set(s.tam[0], s.tam[1], 1)
    caja.position.set(s.centro[0], s.centro[1], s.centro[2])
    caja.lookAt(s.centro[0] + s.mira[0], s.centro[1] + s.mira[1], s.centro[2] + s.mira[2])
    escena.add(caja)
  }
  return { escena, soltar: () => soltables.forEach((x) => x.dispose()) }
}

/** El mapa de entorno del estudio, filtrado por rugosidad (una vez al cargar). */
export function crearElEstudio(gl: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const { escena, soltar } = escenaDelEstudio()
  const generador = new THREE.PMREMGenerator(gl)
  const rt = generador.fromScene(escena, 0.02, 0.1, 60)
  generador.dispose()
  soltar()
  return rt
}

/** Arma el estudio y se lo pone al material; devuelve cómo sacarlo (lo llama la limpieza del MISMO montaje). */
export function ponerElEstudio(material: THREE.MeshPhysicalMaterial, gl: THREE.WebGLRenderer): () => void {
  const estudio = crearElEstudio(gl)
  material.envMap = estudio.texture
  material.needsUpdate = true
  return () => {
    material.envMap = null
    estudio.dispose()
  }
}
