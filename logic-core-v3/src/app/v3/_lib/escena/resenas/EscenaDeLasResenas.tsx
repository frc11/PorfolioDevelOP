'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { LOGO_BOX_WORLD } from '@/lib/logo-footprint'

import { RESENAS } from '../../../_secciones/por-que-develop/resenas/contenido'
import { DURACION_DE_LA_ENTRADA_S } from '../../../_secciones/por-que-develop/resenas/tramo'
import { hayBanco } from '../entorno'
import { compilarConCuidado } from '../gpu/compilar'
import { viajeEnCurso } from '../viaje'
import { ARO, HONDO_DE_LA_BAJADA, curvaDeLaEntrada, escalaDelAro, finDeLaEntrada, medidasDeLaEscala, medidasDelAro, DESTACA, destaqueDeLaPlaca, nieblaDeLaPlaca, nuevaPose, pasoDelGiro, pasoDelLevante, placasQueSeLeen, poseDeLaPlaca, resenaDeLaPlaca, textoConLaEntrada, type GiroDelAro, type MedidasDelAro } from './aro'
import { RESENAS_EN_VIVO, TARJETAS_DEL_ARO, ponerLaResena } from './enVivo'
import { armarLasPlacas, enLaNiebla, geometriaDeLaPlaca, soltarLasPlacas, type PlacaArmada } from './placas'
import { abrirElHueco, armarElHueco, soltarElHueco, type HuecoArmado } from './huecoDelAro'
import { cajaDelLogo, esconderLasTarjetas, llevarLaTarjeta, nuevaCaja, nuevaTarjeta, tamanoDeLasTarjetas, type CajaEnElCuadro, type EstadoDeLaTarjeta } from './tarjetas'

/**
 * [NOCTURNO B2] EL ARO DE LAS RESEÑAS EN LA ESCENA (en su módulo, que se descarga aparte y sólo desde 1024) — diez placas de papel con
 * espesor alrededor del logo, con el pie a la altura del pie del logo (que flota sobre el piso). La entrada, el giro, la niebla y la reseña
 * de cada placa salen de `aro.ts` (puro); acá sólo se ponen las placas en el mundo, se lleva el texto del DOM al frente de cada una
 * (`tarjetas.ts`) y se avisa al DOM qué reseña muestra cada placa (cambia en la nuca, donde no se ve). Sin el escenario de las reseñas
 * montado (abajo de 1024, con movimiento reducido o en otra página), nada se dibuja ni se escribe.
 */

type VentanaDelBanco = Window & { __aroDelBanco?: () => unknown }

interface Estado {
  placas: PlacaArmada[]
  geometria: THREE.BufferGeometry | null
  /** [B3] El anillo del piso bajo el aro. */
  hueco: HuecoArmado | null
  readonly giro: GiroDelAro
  readonly levante: number[]
  readonly tarjetas: EstadoDeLaTarjeta[]
  readonly tamano: { ancho: number }
  /** [C2-70] La caja del logo en el cuadro (px), en cada cuadro: el texto de la nuca de una placa de atrás no se pinta encima del logo. */
  readonly logo: CajaEnElCuadro
  costoMs: number
}

const POSE = nuevaPose()
const CENTRO = new THREE.Vector3()

const CAJA = new THREE.Box3() // banco
const ESQUINA = new THREE.Vector3() // banco
/** [C2-70e] Para el banco: la caja en el cuadro (px) de las placas que se dibujan, o `null` sin ninguna. */
function cajaDeLasPlacas(placas: readonly PlacaArmada[], camara: THREE.Camera, ancho: number, alto: number): { readonly arriba: number; readonly abajo: number; readonly izquierda: number; readonly derecha: number } | null {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const p of placas) {
    if (!p.malla.visible) continue
    CAJA.setFromObject(p.malla)
    for (let k = 0; k < 8; k += 1) {
      ESQUINA.set(k & 1 ? CAJA.max.x : CAJA.min.x, k & 2 ? CAJA.max.y : CAJA.min.y, k & 4 ? CAJA.max.z : CAJA.min.z).project(camara)
      const [x, y] = [((ESQUINA.x + 1) / 2) * ancho, ((1 - ESQUINA.y) / 2) * alto]
      ;[x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)]
    }
  }
  return x0 === Infinity ? null : { arriba: y0, abajo: y1, izquierda: x0, derecha: x1 }
}

export default function EscenaDeLasResenas() {
  const gl = useThree((s) => s.gl)
  const camara = useThree((s) => s.camera)
  const escena = useThree((s) => s.scene)
  const tam = useThree((s) => s.size)
  const raiz = useRef<THREE.Group>(null)
  const m = useRef<Estado>({ placas: [], geometria: null, hueco: null, giro: { angulo: 0, velocidad: 0 }, levante: Array.from({ length: ARO.placas }, () => 0), tarjetas: Array.from({ length: ARO.placas }, nuevaTarjeta), tamano: { ancho: 0 }, logo: nuevaCaja(), costoMs: 0 })

  // Las placas, con la medida de esta proporción (se rearman sólo si cambia la escala del aro).
  const escala = escalaDelAro(tam.width / Math.max(1, tam.height))
  useEffect(() => {
    const g = raiz.current
    const s = m.current
    if (g === null) return undefined
    const medidas = medidasDeLaEscala(escala)
    const geometria = geometriaDeLaPlaca(medidas)
    const placas = armarLasPlacas(geometria)
    for (const p of placas) g.add(p.malla)
    const hueco = armarElHueco(medidas.radio, escala)
    g.add(hueco.malla)
    s.placas = placas
    s.geometria = geometria
    s.hueco = hueco
    void compilarConCuidado(gl, g, camara, escena)
    return () => {
      for (const p of placas) g.remove(p.malla)
      soltarLasPlacas(placas, geometria)
      g.remove(hueco.malla)
      soltarElHueco(hueco)
      s.placas = []
      s.geometria = null
      s.hueco = null
      esconderLasTarjetas(TARJETAS_DEL_ARO, s.tarjetas)
    }
  }, [escala, gl, camara, escena])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__aroDelBanco = () => ({
      activo: RESENAS_EN_VIVO.activo,
      entrada: RESENAS_EN_VIVO.entrada,
      bajada: RESENAS_EN_VIVO.bajada,
      hueco: RESENAS_EN_VIVO.hueco,
      giro: RESENAS_EN_VIVO.giro,
      velocidad: RESENAS_EN_VIVO.velocidad,
      senalada: RESENAS_EN_VIVO.senalada,
      legibles: placasQueSeLeen(RESENAS_EN_VIVO.giro, medidasDelAro(tam.width / Math.max(1, tam.height))),
      placasVisibles: m.current.placas.filter((p) => p.malla.visible).length,
      costoMs: m.current.costoMs,
      // [C2-70e] Dónde se ve el aro (px: sus placas dibujadas) y la caja del logo, para el banco del guardado (`resenas-volteo.ts`).
      enElCuadro: raiz.current?.visible === true ? cajaDeLasPlacas(m.current.placas, camara, tam.width, tam.height) : null,
      logo: { ...m.current.logo },
    })
    return () => {
      delete ventana.__aroDelBanco
    }
  }, [camara, tam.width, tam.height])

  useFrame((state, delta) => {
    const desde = performance.now()
    alCuadro(m.current, raiz.current, state.camera, state.scene.fog?.color ?? null, { ancho: tam.width, alto: tam.height }, Math.min(delta, 0.1))
    m.current.costoMs = performance.now() - desde
  })

  return <group ref={raiz} name="resenas (el aro)" />
}

/** Un cuadro: el giro, cada placa en su pose (con su levante, su niebla y su reseña) y su texto del DOM en su frente. */
function alCuadro(s: Estado, grupo: THREE.Group | null, camara: THREE.Camera, niebla: THREE.Color | null, cuadro: { readonly ancho: number; readonly alto: number }, dt: number): void {
  if (grupo === null) return
  const v = RESENAS_EN_VIVO
  const medidas: MedidasDelAro = medidasDelAro(cuadro.ancho / Math.max(1, cuadro.alto))
  // [C2-70] La entrada frena con su curva hasta la velocidad del giro (sin escalón al armarse).
  const e = curvaDeLaEntrada(v.entrada, finDeLaEntrada(medidas, DURACION_DE_LA_ENTRADA_S))
  // [B3] Con el anillo del piso abierto el aro sigue (el anillo se cierra cuando ya no queda ninguna placa).
  const activo = v.activo && (e > 0 || v.hueco > 0) && viajeEnCurso() === null && camara instanceof THREE.PerspectiveCamera && s.placas.length > 0
  grupo.visible = activo
  if (!activo || !(camara instanceof THREE.PerspectiveCamera)) {
    esconderLasTarjetas(TARJETAS_DEL_ARO, s.tarjetas)
    return
  }
  const armado = e >= 1 && v.bajada <= 0
  const conPlacas = e > 0 && v.bajada < 1
  if (s.hueco !== null) abrirElHueco(s.hueco, v.hueco)
  // El arrastre llega en px del cuadro: se pasa a giro con el ancho de referencia (1440).
  const dx = v.arrastre.dx * ARO.arrastrePorPx * (1440 / Math.max(1, cuadro.ancho))
  v.arrastre.dx = 0
  pasoDelGiro(s.giro, dt, armado, v.senalada >= 0, v.quieto, v.arrastre.activo, dx)
  v.giro = s.giro.angulo
  v.velocidad = s.giro.velocidad
  const k = medidas.ancho / ARO.ancho
  const centroY = -LOGO_BOX_WORLD / 2 + ARO.sobreElPie * k + medidas.alto / 2
  camara.updateMatrixWorld()
  const ancho = tamanoDeLasTarjetas(camara, cuadro.alto, medidas, centroY, s.tamano)
  const conTexto = textoConLaEntrada(e) * (1 - Math.min(1, v.bajada * 4))
  cajaDelLogo(camara, cuadro, s.logo)
  for (let i = 0; i < s.placas.length; i += 1) {
    const p = s.placas[i]
    poseDeLaPlaca(i, e, s.giro.angulo, medidas, POSE)
    s.levante[i] = pasoDelLevante(s.levante[i], armado && v.senalada === i ? 1 : 0, dt)
    const y = centroY + s.levante[i] * ARO.levanta * k - v.bajada * HONDO_DE_LA_BAJADA
    // [C2-70] La de adelante se destaca: un poco más grande (la placa y su tarjeta) y con la cara marcada.
    const destaque = POSE.enElAro && armado ? destaqueDeLaPlaca(POSE.angulo) : 0
    const escala = 1 + DESTACA.escala * destaque
    p.malla.position.set(POSE.x, y, POSE.z)
    p.malla.rotation.set(0, POSE.mira, 0)
    p.malla.scale.setScalar(escala)
    const enLaNieblaDeLaSala = POSE.enElAro ? nieblaDeLaPlaca(POSE.angulo) : POSE.cadena === 1 ? 0.35 : 0
    enLaNiebla(p, enLaNieblaDeLaSala, niebla)
    // [C2-70] Sólidas y siempre visibles: la niebla ya no esconde ninguna (sólo las tiñe).
    p.malla.visible = conPlacas
    ponerLaResena(i, resenaDeLaPlaca(i, s.giro.angulo, RESENAS.length))
    // [C2-70] El texto en la cara que mira a la cámara (también la nuca de las de atrás), salvo en el fondo del aro, donde cambia de reseña.
    const texto = conPlacas && nieblaDeLaPlaca(POSE.angulo) < 0.995 ? conTexto : 0
    llevarLaTarjeta(TARJETAS_DEL_ARO[i], s.tarjetas[i], CENTRO.set(POSE.x, y, POSE.z), POSE.mira, medidas, texto, camara, cuadro, ancho, { escala, destacada: destaque > 0.5, logo: s.logo })
  }
}
