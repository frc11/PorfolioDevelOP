'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import * as THREE from 'three'

import { RELEVO_DE_LOS_TITULOS } from '../../titulos3d/registro'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { crearElEstudio } from '../estudio'
import { KEY_INTENSITY } from '../probeLighting'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import type { Variante } from '../titulos3d/armado'
import { viajeEnCurso } from '../viaje'
import { FUENTES_DE_LA_METAMORFOSIS, armarElCta, fondoDelMarco, letrasEnLaPantalla, piezasDe, ponerElMarco, ponerLaPieza, soltarElCta, type ArmadoDelCta } from './armadoDelCta'
import { armarElContorno } from './contorno'
import { CTA_EN_VIVO, FRASE_DE_VOLUMEN, ctaListo, ctaVisibleEnElViaje, marcarElCtaListo, suscribirAlLugarDelCta, versionDelLugarDelCta } from './enVivo'
import { armarLaFusion, ponerLaFusion, soltarLaFusion, type CuadroDeLaMetamorfosis } from './fusion'
import { cajaDeAhora, medirElValor, renglonesDeLaFrase, type CajaDeAhora, type MetricasDeLaFuente, type RenglonDeLaFrase, type ValorMedido } from './medidaDeLosValores'
import { letrasDeLaFrase, type LetraDeLaFrase } from './piezasDeLaMetamorfosis'
import { ATRAS, apareceDeLosValores, estadoDeLaMetamorfosis, posesDe, valoresAPlano, type VarianteDeLaMetamorfosis } from './transformacion'

/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL EN LA ESCENA (en su módulo, que se descarga aparte) — arma el cruce letra por letra
 * (`armadoDelCta.ts`) cuando el DOM tiene sus lugares y las fuentes cargaron, lo compila y avisa al DOM (que entonces esconde
 * su texto). En cada cuadro pone las letras en las poses del cruce (`transformacion.ts`) con el progreso que escribe el DOM
 * (función del scroll). En el escenario se dibuja desde que la transformación arranca (antes, la frase es el título de
 * volumen, que desde ahí queda relevado); en la lista, siempre que el CTA está en la pantalla. Su luz es la de los títulos:
 * la noche del logo y los reflejos con la luz de la sala. [PULIDO 4] C1 · el cruce de `2411371a` (recuperado) y, a la vez, la
 * metamorfosis de los seis valores en la frase del CTA (`fusion.ts` o `contorno.ts`, con `?meta=`). En un viaje del menú,
 * nada (`ctaVisibleEnElViaje`).
 */

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
}

/** Cuánto se levanta el CTA hacia la cámara con el mouse encima (cuerpos) y en cuánto llega (s). Con el dedo no hay hover. */
const HOVER_DEL_CTA = { levanta: 0.12, s: 0.12 } as const

/** El tramo del progreso en que el marco pasa de fijo en el mundo a pegado a la pantalla. */
const MARCO_DEL_CTA = { desde: 0.02, hasta: 0.35 } as const
const suaveEntre = (p: number, a: number, b: number): number => {
  const u = Math.min(1, Math.max(0, (p - a) / (b - a)))
  return u * u * (3 - 2 * u)
}

/** [PULIDO 4] C1 · la metamorfosis armada, sea cual sea su técnica: lo que se agrega al lienzo, cómo se pone y cómo se suelta. */
export interface MetamorfosisArmada {
  readonly objetos: readonly THREE.Object3D[]
  readonly materiales: readonly THREE.MeshStandardMaterial[]
  poner(estado: ReturnType<typeof estadoDeLaMetamorfosis>, cuadro: CuadroDeLaMetamorfosis): void
  soltar(): void
  /** Lo que costó el último cuadro (ms): `contorno` rehace la geometría en cada uno. */
  readonly costo: () => number
}

interface Medidas {
  readonly valores: (ValorMedido | null)[]
  readonly renglones: RenglonDeLaFrase[]
  readonly letras: LetraDeLaFrase[]
  readonly caja: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }
  readonly cuerpo: number
}

type VentanaDelBanco = Window & { __ctaDelBanco?: () => unknown }

/** La variante de la metamorfosis de esta carga (sin bandera, `fusion`). */
const varianteDeLaMetamorfosis = (): VarianteDeLaMetamorfosis => {
  const pedida = entornoDeLaEscena().pruebas.meta
  return pedida === 'no' ? 'fusion' : pedida
}

const METRICAS_DE_LOS_VALORES = FUENTES_DE_LA_METAMORFOSIS.valores.data as MetricasDeLaFuente

/** El escenario de «Por qué develOP» (clavado en la pantalla): ahí se sigue a los valores. */
const ESCENARIO = '[data-pieza="escenario-del-final"]'

/** La caja de las letras de la frase (px de la pantalla): de los avances y de su línea de base. */
function cajaDeLaFrase(letras: readonly LetraDeLaFrase[]): Medidas['caja'] {
  if (letras.length === 0) return { x: 0, y: 0, ancho: 1, alto: 1 }
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity]
  for (const l of letras) {
    x0 = Math.min(x0, l.x)
    x1 = Math.max(x1, l.x + 0.6 * l.cuerpo)
    y0 = Math.min(y0, l.base - 0.75 * l.cuerpo)
    y1 = Math.max(y1, l.base + 0.2 * l.cuerpo)
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, ancho: x1 - x0, alto: y1 - y0 }
}

function armarLaMetamorfosis(v: VarianteDeLaMetamorfosis, m: Medidas, color: Variante): MetamorfosisArmada {
  if (v === 'contorno') return armarElContorno(m.valores, m.letras, FUENTES_DE_LA_METAMORFOSIS, color)
  const f = armarLaFusion(m.valores, m.letras, FUENTES_DE_LA_METAMORFOSIS, color)
  return { objetos: [f.valores, f.frase], materiales: f.materiales, poner: (e, c) => ponerLaFusion(f, e, c, ATRAS), soltar: () => soltarLaFusion(f), costo: () => 0 }
}

export default function EscenaDelCta({ keyLightRef, logoMaterialRef }: Props) {
  const color: Variante = entornoDeLaEscena().titulos === 'blanco' ? 'blanco' : 'negro'
  const gl = useThree((s) => s.gl)
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
  const raiz = useRef<THREE.Group>(null)
  const version = useSyncExternalStore(suscribirAlLugarDelCta, versionDelLugarDelCta, versionDelLugarDelCta)
  const m = useRef<EstadoDeLaEscenaDelCta>({ armado: null, meta: null, medidas: null, estudio: null, hover: 0, cajas: Array.from({ length: 6 }, () => ({ x: 0, y: 0, escala: 1 })), cuadro: null })

  useEffect(() => {
    const estado = m.current
    const rt = crearElEstudio(gl)
    estado.estudio = rt
    return () => {
      estado.estudio = null
      rt.dispose()
    }
  }, [gl])

  // La frase de volumen, relevada mientras la transformación la dibuja (en el escenario).
  useEffect(() => {
    RELEVO_DE_LOS_TITULOS.relevado = (id) => CTA_EN_VIVO.donde === 'escenario' && ctaListo() && CTA_EN_VIVO.progreso > 0 && (FRASE_DE_VOLUMEN as readonly string[]).includes(id)
    return () => {
      RELEVO_DE_LOS_TITULOS.relevado = () => false
    }
  }, [])

  // Se arma cuando el DOM tiene sus lugares (y las fuentes cargaron); se rearma si el DOM cambia de rama o de tamaño.
  useEffect(() => {
    void version
    const g = raiz.current
    const estado = m.current
    if (g === null) return undefined
    let vivo = true
    let espera = 0
    const intentar = (): void => {
      if (!vivo) return
      const origen = CTA_EN_VIVO.origen()
      const destino = CTA_EN_VIVO.destino
      const valores = CTA_EN_VIVO.valores
      const frase = CTA_EN_VIVO.frase.flatMap((el) => (el === null ? [] : [el]))
      if (destino === null || destino.offsetWidth === 0 || origen.length === 0 || frase.length < 3 || valores.some((el) => el === null || el.offsetWidth === 0)) {
        espera = window.setTimeout(intentar, 250)
        return
      }
      const a = armarElCta(origen, destino, color, CTA_EN_VIVO.donde === 'lista')
      // La metamorfosis: los valores medidos planos (en px de su caja) y la frase en sus renglones de ahora.
      const medidos = valores.map((el) => (el === null ? null : medirElValor(el, METRICAS_DE_LOS_VALORES, el.closest(ESCENARIO))))
      const renglones = renglonesDeLaFrase(frase, [false, false, true])
      const letras = letrasDeLaFrase(renglones, FUENTES_DE_LA_METAMORFOSIS.frase, FUENTES_DE_LA_METAMORFOSIS.fuerte)
      const medidas: Medidas = { valores: medidos, renglones, letras, caja: cajaDeLaFrase(letras), cuerpo: Math.max(1, ...letras.map((l) => l.cuerpo)) }
      const meta = armarLaMetamorfosis(varianteDeLaMetamorfosis(), medidas, color)
      const rt = estado.estudio
      for (const p of piezasDe(a)) if (rt !== null) p.material.material.envMap = rt.texture
      for (const mat of meta.materiales) if (rt !== null) mat.envMap = rt.texture
      for (const o of meta.objetos) a.lienzo.add(o)
      g.add(a.marco)
      g.add(a.lienzo)
      estado.armado = a
      estado.meta = meta
      estado.medidas = medidas
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
        g.remove(a.lienzo)
        soltarElCta(a)
      }
      estado.meta?.soltar()
      estado.armado = null
      estado.meta = null
      estado.medidas = null
    }
  }, [version, tam.width, tam.height, color, gl, camara])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    const v = new THREE.Vector3() // banco
    ventana.__ctaDelBanco = () => {
      const s = m.current
      const a = s.armado
      // Dónde dice el DOM que va cada letra del CTA y dónde la dibuja la escena (su centro proyectado, px).
      const delCta = a === null ? [] : a.destino.piezas.map((p, k) => {
        p.grupo.getWorldPosition(v).project(camara)
        return { dom: [Math.round(a.letras.destino[k].x), Math.round(a.letras.destino[k].y)], escena: [Math.round(((v.x + 1) / 2) * tam.width), Math.round(((1 - v.y) / 2) * tam.height)] }
      })
      return {
        progreso: CTA_EN_VIVO.progreso,
        donde: CTA_EN_VIVO.donde,
        listo: ctaListo(),
        meta: varianteDeLaMetamorfosis(),
        costoMs: s.meta?.costo() ?? 0,
        piezas: a === null ? 0 : piezasDe(a).length,
        visibles: a === null ? 0 : piezasDe(a).filter((p) => p.grupo.visible).length,
        marco: a?.marco.visible ?? false,
        lienzo: a?.lienzo.visible ?? false,
        metaVisibles: s.meta?.objetos.filter((o) => o.visible).length ?? 0,
        letrasDeLaFrase: s.medidas?.letras.length ?? 0,
        letrasDeLosValores: s.medidas?.valores.reduce((n, x) => n + (x?.letras.length ?? 0), 0) ?? 0,
        iconos: s.medidas?.valores.reduce((n, x) => n + (x?.iconos.length ?? 0), 0) ?? 0,
        delCta,
      }
    }
    return () => {
      delete ventana.__ctaDelBanco
    }
  }, [camara, tam.width, tam.height])

  useFrame((state, delta) => alCuadro(m.current, logoMaterialRef.current, keyLightRef.current, state.camera, tam, Math.min(delta, 0.1)))

  return <group ref={raiz} name="cta del final (raíz)" />
}

interface EstadoDeLaEscenaDelCta {
  armado: ArmadoDelCta | null
  meta: MetamorfosisArmada | null
  medidas: Medidas | null
  estudio: THREE.WebGLRenderTarget | null
  hover: number
  readonly cajas: CajaDeAhora[]
  cuadro: CuadroDeLaMetamorfosis | null
}

/** [PULIDO 4] C1 · dónde están ahora los valores (sus cajas del DOM: en el escenario su columna va en el plano del título) y la frase. */
function cuadroDeAhora(s: EstadoDeLaEscenaDelCta, medidas: Medidas, fondo: number, tam: { readonly width: number; readonly height: number }, p: number): CuadroDeLaMetamorfosis {
  const items = CTA_EN_VIVO.valores.map((el, k) => {
    const medido = medidas.valores[k]
    const c = s.cajas[k]
    if (el !== null && medido !== null) cajaDeAhora(el, medido, el.closest(ESCENARIO), valoresAPlano(p), c)
    const ancho = (medido?.ancho ?? 0) * c.escala
    const alto = (medido?.alto ?? 0) * c.escala
    const cuerpo = medido === null || medido.letras.length === 0 ? 16 : Math.max(...medido.letras.map((l) => l.cuerpo))
    return { x: c.x, y: c.y, escala: c.escala, cuerpo, cx: c.x + ancho / 2, cy: c.y + alto / 2, ancho, alto }
  })
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity]
  for (const it of items) {
    x0 = Math.min(x0, it.x)
    x1 = Math.max(x1, it.x + it.ancho)
    y0 = Math.min(y0, it.y)
    y1 = Math.max(y1, it.y + it.alto)
  }
  // La frase va clavada (centrada en la pantalla): si su renglón se movió desde que se armó, la malla se corre con él.
  const primero = CTA_EN_VIVO.frase[0]
  const antes = medidas.renglones[0]
  const ahora = primero?.getBoundingClientRect()
  const corrimiento = ahora === undefined || antes === undefined ? { x: 0, y: 0 } : { x: 0, y: ahora.top - antes.arriba }
  const F = medidas.caja
  return {
    items,
    cajaDeLosValores: { x: (x0 + x1) / 2, y: (y0 + y1) / 2, ancho: Math.max(1, x1 - x0), alto: Math.max(1, y1 - y0) },
    cajaDeLaFrase: { x: F.x + corrimiento.x, y: F.y + corrimiento.y, ancho: F.ancho, alto: F.alto },
    corrimiento,
    cuerpoDeLaFrase: medidas.cuerpo,
    fuga: { x: tam.width / 2, y: tam.height / 2 },
    fondo,
    progreso: p,
    apareceDeLosValores: CTA_EN_VIVO.donde === 'lista' ? CTA_EN_VIVO.entrada : apareceDeLosValores(p),
  }
}

/** Un cuadro: el marco frente a la cámara, las letras en la pantalla, las poses del cruce, la metamorfosis, el hover y la luz. */
function alCuadro(s: EstadoDeLaEscenaDelCta, logo: THREE.MeshStandardMaterial | null, luz: THREE.DirectionalLight | null, viva: THREE.Camera, tam: { readonly width: number; readonly height: number }, dt: number): void {
  const a = s.armado
  if (a === null) return
  const p = CTA_EN_VIVO.progreso
  // [PULIDO 4] C1 · 5 · en un viaje del menú el CTA no se dibuja (el recorrido sólo pasa por la sección).
  const enPantalla = ctaVisibleEnElViaje(viajeEnCurso() !== null) && (CTA_EN_VIVO.donde === 'lista' || p > 0)
  a.marco.visible = enPantalla
  a.lienzo.visible = enPantalla
  if (!enPantalla) return
  // El marco: en el escenario arranca fijo en el mundo (donde el título deja la frase) y en el primer tramo se pega a la
  // pantalla; en la lista, pegado desde el principio (no hay título del que salir). El lienzo, pegado siempre.
  const aViva = CTA_EN_VIVO.donde === 'lista' ? 1 : suaveEntre(p, MARCO_DEL_CTA.desde, MARCO_DEL_CTA.hasta)
  if (viva instanceof THREE.PerspectiveCamera) {
    ponerElMarco(a.marco, CAMARA_SIN_EL_MOUSE, viva, aViva, tam.height)
    ponerElMarco(a.lienzo, CAMARA_SIN_EL_MOUSE, viva, 1, tam.height)
  }
  letrasEnLaPantalla(a, window.scrollY)
  posesDe(p, { origen: a.letras.origen, destino: a.letras.destino, pantalla: { ancho: tam.width, alto: tam.height } }, a.poses)
  // El hover (con el mouse, ya llegado): el CTA se levanta apenas hacia la cámara.
  s.hover += ((CTA_EN_VIVO.hover && p >= 0.97 ? 1 : 0) - s.hover) * (1 - Math.exp(-dt / HOVER_DEL_CTA.s))
  for (const pose of a.poses.destino) pose.z += s.hover * HOVER_DEL_CTA.levanta * (a.letras.destino[0]?.cuerpo ?? 0)
  // En la lista el origen aparece antes de transformarse (cuando el logo ya bajó).
  for (const pose of a.poses.origen) pose.aparece *= CTA_EN_VIVO.entrada
  let i = 0
  for (const b of a.origen) for (const pieza of b.piezas) ponerLaPieza(pieza, a.poses.origen[i++])
  a.destino.piezas.forEach((pieza, k) => ponerLaPieza(pieza, a.poses.destino[k]))
  // [PULIDO 4] C1 · la metamorfosis de los valores en la frase, con el mismo progreso.
  if (s.meta !== null && s.medidas !== null) {
    s.cuadro = cuadroDeAhora(s, s.medidas, fondoDelMarco(a.lienzo, viva), tam, p)
    s.meta.poner(estadoDeLaMetamorfosis(varianteDeLaMetamorfosis(), p), s.cuadro)
  }
  // La luz de los títulos: la noche del logo (su emisiva, en el mismo cuadro) y los reflejos con la luz de la sala.
  const nivel = luz === null ? 1 : Math.min(1, luz.intensity / KEY_INTENSITY)
  for (const pieza of piezasDe(a)) {
    if (logo !== null) pieza.material.material.emissive.copy(logo.emissive)
    pieza.material.material.envMapIntensity = nivel
  }
  for (const mat of s.meta?.materiales ?? []) {
    if (logo !== null) mat.emissive.copy(logo.emissive)
    mat.envMapIntensity = nivel
  }
}
