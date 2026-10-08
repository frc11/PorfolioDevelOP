'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import * as THREE from 'three'

import { RELEVO_DE_LOS_TITULOS } from '../../titulos3d/registro'
import { entornoDeLaEscena, hayBanco, type VarianteDelCta } from '../entorno'
import { crearElEstudio } from '../estudio'
import { KEY_INTENSITY } from '../probeLighting'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import type { Variante } from '../titulos3d/armado'
import { armarElCta, letrasEnLaPantalla, piezasDe, ponerElMarco, ponerLaPieza, soltarElCta, type ArmadoDelCta } from './armadoDelCta'
import { CTA_EN_VIVO, FRASE_DE_VOLUMEN, ctaListo, marcarElCtaListo, suscribirAlLugarDelCta, varianteDelCta, versionDelLugarDelCta } from './enVivo'
import { parejas, posesDe } from './variantes'

/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL EN LA ESCENA (sólo con `?cta=`; en su módulo, que se descarga aparte) — arma la frase y el
 * CTA letra por letra (`armadoDelCta.ts`) cuando el DOM tiene sus lugares y las fuentes cargaron, los compila y avisa al DOM
 * (que entonces esconde su texto). En cada cuadro pone las letras en las poses de la variante (`variantes.ts`) con el
 * progreso que escribe el DOM (función del scroll). En el escenario se dibuja desde que la transformación arranca (antes,
 * la frase es el título de volumen, que desde ahí queda relevado); en la lista, siempre que el CTA está en la pantalla. Su
 * luz es la de los títulos: la noche del logo y los reflejos con la luz de la sala.
 */

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
}

/** Cuánto se levanta el CTA hacia la cámara con el mouse encima (cuerpos) y en cuánto llega (s). Con el dedo no hay hover. */
const HOVER_DEL_CTA = { levanta: 0.12, s: 0.12 } as const

/** `capas`: lo más arriba de la pantalla de donde sale una capa (fracción del alto). */
const ENTRA_DESDE_ARRIBA = 0.08

/** En el escenario, dónde se arman el cartel de `giro` y la pila de `capas` (fracción del alto: la altura de la frase). */
const ARMADO_EN_EL_ESCENARIO = 0.27

/** El tramo del progreso en que el marco pasa de fijo en el mundo a pegado a la pantalla. */
const MARCO_DEL_CTA = { desde: 0.02, hasta: 0.35 } as const
const suaveEntre = (p: number, a: number, b: number): number => {
  const u = Math.min(1, Math.max(0, (p - a) / (b - a)))
  return u * u * (3 - 2 * u)
}

type VentanaDelBanco = Window & { __ctaDelBanco?: () => unknown }

export default function EscenaDelCta({ keyLightRef, logoMaterialRef }: Props) {
  const variante = varianteDelCta()
  const color: Variante = entornoDeLaEscena().titulos === 'blanco' ? 'blanco' : 'negro'
  const gl = useThree((s) => s.gl)
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
  const raiz = useRef<THREE.Group>(null)
  const version = useSyncExternalStore(suscribirAlLugarDelCta, versionDelLugarDelCta, versionDelLugarDelCta)
  const m = useRef<EstadoDeLaEscenaDelCta>({ armado: null, estudio: null, hover: 0 })

  useEffect(() => {
    const estado = m.current
    const rt = crearElEstudio(gl)
    estado.estudio = rt
    return () => {
      estado.estudio = null
      rt.dispose()
    }
  }, [gl])

  // La frase de volumen, relevada mientras la transformación la dibuja (en el escenario; en `capas` se va como hoy).
  useEffect(() => {
    RELEVO_DE_LOS_TITULOS.relevado = (id) => variante !== 'capas' && CTA_EN_VIVO.donde === 'escenario' && ctaListo() && CTA_EN_VIVO.progreso > 0 && (FRASE_DE_VOLUMEN as readonly string[]).includes(id)
    return () => {
      RELEVO_DE_LOS_TITULOS.relevado = () => false
    }
  }, [variante])

  // Se arma cuando el DOM tiene sus lugares (y las fuentes cargaron); se rearma si el DOM cambia de rama o de tamaño.
  useEffect(() => {
    void version
    const g = raiz.current
    const estado = m.current
    if (variante === null || g === null) return undefined
    let vivo = true
    let espera = 0
    const intentar = (): void => {
      if (!vivo) return
      const origen = CTA_EN_VIVO.origen()
      const destino = CTA_EN_VIVO.destino
      if (destino === null || destino.offsetWidth === 0 || (variante !== 'capas' && origen.length === 0)) {
        espera = window.setTimeout(intentar, 250)
        return
      }
      const a = armarElCta(variante, origen, destino, color, CTA_EN_VIVO.donde === 'lista')
      const rt = estado.estudio
      for (const p of piezasDe(a)) if (rt !== null) p.material.material.envMap = rt.texture
      g.add(a.marco)
      estado.armado = a
      gl.compile(g, camara)
      marcarElCtaListo(true)
    }
    void document.fonts.ready.then(() => {
      if (vivo) espera = window.setTimeout(intentar, 0)
    })
    return () => {
      vivo = false
      window.clearTimeout(espera)
      marcarElCtaListo(false)
      const a = estado.armado
      if (a !== null) {
        g.remove(a.marco)
        soltarElCta(a)
      }
      estado.armado = null
    }
  }, [version, tam.width, tam.height, variante, color, gl, camara])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    const v = new THREE.Vector3() // banco
    ventana.__ctaDelBanco = () => {
      const a = m.current.armado
      // Dónde dice el DOM que va cada letra del CTA y dónde la dibuja la escena (su centro proyectado, px).
      const delCta = a === null ? [] : a.destino.piezas.map((p, k) => {
        p.grupo.getWorldPosition(v).project(camara)
        return { dom: [Math.round(a.letras.destino[k].x), Math.round(a.letras.destino[k].y)], escena: [Math.round(((v.x + 1) / 2) * tam.width), Math.round(((1 - v.y) / 2) * tam.height)] }
      })
      return { variante, progreso: CTA_EN_VIVO.progreso, donde: CTA_EN_VIVO.donde, listo: ctaListo(), piezas: a === null ? 0 : piezasDe(a).length, visibles: a === null ? 0 : piezasDe(a).filter((p) => p.grupo.visible).length, delCta }
    }
    return () => {
      delete ventana.__ctaDelBanco
    }
  }, [variante, camara, tam.width, tam.height])

  useFrame((state, delta) => alCuadro(m.current, variante, logoMaterialRef.current, keyLightRef.current, state.camera, tam, Math.min(delta, 0.1)))

  return <group ref={raiz} name="cta del final (raíz)" />
}

interface EstadoDeLaEscenaDelCta {
  armado: ArmadoDelCta | null
  estudio: THREE.WebGLRenderTarget | null
  hover: number
}

/** Un cuadro: el marco frente a la cámara, las letras en la pantalla, las poses de la variante, el hover y la luz. */
function alCuadro(s: EstadoDeLaEscenaDelCta, variante: VarianteDelCta | null, logo: THREE.MeshStandardMaterial | null, luz: THREE.DirectionalLight | null, viva: THREE.Camera, tam: { readonly width: number; readonly height: number }, dt: number): void {
  const a = s.armado
  if (a === null || variante === null) return
  const p = CTA_EN_VIVO.progreso
  a.marco.visible = CTA_EN_VIVO.donde === 'lista' || p > 0
  if (!a.marco.visible) return
  // El marco: en el escenario arranca fijo en el mundo (donde el título deja la frase) y en el primer tramo se pega a la
  // pantalla; en la lista, pegado desde el principio (no hay título del que salir).
  const aViva = CTA_EN_VIVO.donde === 'lista' ? 1 : suaveEntre(p, MARCO_DEL_CTA.desde, MARCO_DEL_CTA.hasta)
  if (viva instanceof THREE.PerspectiveCamera) ponerElMarco(a.marco, CAMARA_SIN_EL_MOUSE, viva, aViva, tam.height)
  letrasEnLaPantalla(a, window.scrollY)
  if (a.parejas.length === 0) a.parejas = parejas(a.letras.origen, a.letras.destino)
  // `capas`: la caja de cada valor (el que no está, sale del lugar del CTA: `variantes.ts`). En la lista los valores ya
  // quedaron arriba de la pantalla: su capa entra desde el borde de arriba (no desde muy lejos, de golpe).
  a.valores.length = 0
  CTA_EN_VIVO.valores.forEach((el, k) => {
    if (el === null) return
    const r = el.getBoundingClientRect()
    a.valores[k] = { x: r.left + r.width / 2, y: Math.max(r.top + r.height / 2, -ENTRA_DESDE_ARRIBA * tam.height), ancho: r.width, alto: el.offsetHeight }
  })
  const armado = CTA_EN_VIVO.donde === 'lista' ? (a.letras.destino[0]?.y ?? 0) : ARMADO_EN_EL_ESCENARIO * tam.height
  posesDe(variante, p, { origen: a.letras.origen, destino: a.letras.destino, parejas: a.parejas, valores: a.valores, pantalla: { ancho: tam.width, alto: tam.height }, armado }, a.poses)
  // El hover (con el mouse, ya llegado): el CTA se levanta apenas hacia la cámara.
  s.hover += ((CTA_EN_VIVO.hover && p >= 0.97 ? 1 : 0) - s.hover) * (1 - Math.exp(-dt / HOVER_DEL_CTA.s))
  const destino = variante === 'capas' ? a.poses.capas : a.poses.destino
  for (const pose of destino) pose.z += s.hover * HOVER_DEL_CTA.levanta * (a.letras.destino[0]?.cuerpo ?? 0)
  // En la lista la frase aparece antes de transformarse (cuando el logo ya bajó).
  for (const pose of a.poses.origen) pose.aparece *= CTA_EN_VIVO.entrada
  let i = 0
  for (const b of a.origen) for (const pieza of b.piezas) ponerLaPieza(pieza, a.poses.origen[i++], a.conMorfo)
  a.destino.piezas.forEach((pieza, k) => ponerLaPieza(pieza, destino[k], a.conMorfo))
  // La luz de los títulos: la noche del logo (su emisiva, en el mismo cuadro) y los reflejos con la luz de la sala.
  const nivel = luz === null ? 1 : Math.min(1, luz.intensity / KEY_INTENSITY)
  for (const pieza of piezasDe(a)) {
    if (logo !== null) pieza.material.material.emissive.copy(logo.emissive)
    pieza.material.material.envMapIntensity = nivel
  }
}
