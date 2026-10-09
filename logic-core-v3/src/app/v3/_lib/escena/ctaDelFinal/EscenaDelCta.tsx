'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import * as THREE from 'three'

import { RELEVO_DE_LOS_TITULOS } from '../../titulos3d/registro'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { crearElEstudio } from '../estudio'
import { KEY_INTENSITY } from '../probeLighting'
import type { ProbeStatsStore } from '../probeStore'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import type { Variante } from '../titulos3d/armado'
import { corrimiento, pinDelLugar } from '../titulos3d/colocacion'
import { EN_VIVO as EN_VIVO_DEL_FINAL } from '../final/recorridoDelFinal'
import { viajeEnCurso } from '../viaje'
import { armarElCta, fondoDelMarco, fuentesDeLaMetamorfosis, letrasEnLaPantalla, piezasDe, ponerElMarco, ponerLaPieza, soltarElCta, type ArmadoDelCta } from './armadoDelCta'
import { armarElContorno, type CajaDelValor, type CuadroDeLaMetamorfosis } from './contorno'
import { CTA_EN_VIVO, FRASE_DE_VOLUMEN, ctaListo, ctaVisibleEnElViaje, marcarElCtaListo, suscribirAlLugarDelCta, versionDelLugarDelCta } from './enVivo'
import { cajaDeAhora, medirElValor, renglonesDeLaFrase, type CajaDeAhora, type MetricasDeLaFuente, type RenglonDeLaFrase, type ValorMedido } from './medidaDeLosValores'
import { letrasDeLaFrase, type LetraDeLaFrase } from './piezasDeLaMetamorfosis'
import { ANCLAJE_DEL_CTA, camaraDelCta, correrElPlano, homografiaDelCta, nuevosPlanosDelCta, ponerLosPlanos, type PlanosDelCta } from './planosDelCta'
import { apareceDeLosValores, armadoSobreElCta, cajaDe, estadoDeLaMetamorfosis, posesDe, valoresAPlano } from './transformacion'
import { armarElVolteo } from './volteo'
import { VALORES } from '../../../_secciones/por-que-develop/contenido'

/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL EN LA ESCENA (en su módulo, que se descarga aparte) — arma el giro letra por letra
 * (`armadoDelCta.ts`) cuando el DOM tiene sus lugares y las fuentes cargaron, lo compila y avisa al DOM (que entonces esconde
 * su texto). En cada cuadro pone las letras en las poses del giro (`transformacion.ts`) con el progreso que escribe el DOM
 * (función del scroll). En el escenario se dibuja desde que la transformación arranca (antes, la frase es el título de
 * volumen, que desde ahí queda relevado); en la lista, siempre que el CTA está en la pantalla. Su luz es la de los títulos:
 * la noche del logo y los reflejos con la luz de la sala. [PULIDO 4] C1 · y, a la vez, la metamorfosis de los seis valores
 * en la frase del CTA (`contorno.ts`; [PULIDO 6] E1 · `fusion` se borró). En un viaje del menú, nada (`ctaVisibleEnElViaje`).
 * [PULIDO 5] D1 · el giro de `2411371a` (en lugar del cruce) y todo ANCLADO EN EL MUNDO (`planosDelCta.ts`): la frase y
 * «HABLANOS» quedan quietos en la sala y el enlace del DOM los sigue (A1).
 */

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
  readonly stats: ProbeStatsStore
}

/** Cuánto se levanta el CTA hacia la cámara con el mouse encima (cuerpos) y en cuánto llega (s). Con el dedo no hay hover. */
const HOVER_DEL_CTA = { levanta: 0.12, s: 0.12 } as const

/**
 * [PULIDO 5] D1 · el ancho que pueden ocupar la frase y el CTA: el de la pantalla menos un aire a cada lado (px) y, en el
 * escenario, no más que una fracción de ella (un renglón de punta a punta no se lee como título). Si no entran, se achican.
 */
const ANCHO_DEL_CTA = { aire: 20, escenario: 0.86 } as const
const anchoMaximoDelCta = (): number => Math.max(1, Math.min(window.innerWidth - 2 * ANCHO_DEL_CTA.aire, CTA_EN_VIVO.donde === 'escenario' ? ANCHO_DEL_CTA.escenario * window.innerWidth : Infinity))

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
  /** Lo que costó el último cuadro en la CPU (ms). */
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

/**
 * [PULIDO 6] E1 · el aire entre la frase y el cartel del giro (por el cuerpo del CTA): el cartel no sube de la franja de «HABLANOS»
 * (entre 0,3 y 0,5 se pisaba con la frase que se arma).
 */
const AIRE_ENTRE_LA_FRASE_Y_EL_GIRO = 0.12

/** El alto que puede tener el cartel: del borde de abajo de la frase (más el aire) al de «HABLANOS». */
function altoDelCartel(destino: ArmadoDelCta['letras']['destino'], frase: Medidas['caja']): number {
  const c = cajaDe(destino)
  return Math.max(1, c.y + c.alto / 2 - (frase.y + frase.alto / 2) - AIRE_ENTRE_LA_FRASE_Y_EL_GIRO * (destino[0]?.cuerpo ?? 0))
}

/** El enlace del CTA en el DOM (lo que se toca): el que se lleva al plano proyectado. */
const enlaceDelCta = (): HTMLElement | null => CTA_EN_VIVO.destino?.closest('a') ?? null

export default function EscenaDelCta({ keyLightRef, logoMaterialRef, stats }: Props) {
  const color: Variante = entornoDeLaEscena().titulos === 'blanco' ? 'blanco' : 'negro'
  const gl = useThree((s) => s.gl)
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
  const raiz = useRef<THREE.Group>(null)
  const version = useSyncExternalStore(suscribirAlLugarDelCta, versionDelLugarDelCta, versionDelLugarDelCta)
  const m = useRef<EstadoDeLaEscenaDelCta>({ armado: null, meta: null, medidas: null, estudio: null, hover: 0, cajas: Array.from({ length: 6 }, () => ({ x: 0, y: 0, escala: 1 })), cuadro: null, planos: nuevosPlanosDelCta(), enlace: '' })

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
      const fuentes = fuentesDeLaMetamorfosis()
      const anchoMaximo = anchoMaximoDelCta()
      const a = armarElCta(origen, destino, color, CTA_EN_VIVO.donde === 'lista', fuentes.fuerte, anchoMaximo)
      // La metamorfosis: los valores medidos planos (en px de su caja) y la frase en sus renglones de LECTURA (con su escenario
      // clavado: quedan en el mundo, no van con la página).
      const medidos = valores.map((el) => (el === null ? null : medirElValor(el, fuentes.valores.data as MetricasDeLaFuente, el.closest(ESCENARIO))))
      const inicio = valores.map((el, k): CajaDelValor => {
        const medido = medidos[k]
        const c: CajaDeAhora = { x: 0, y: 0, escala: 1 }
        if (el !== null && medido !== null) cajaDeAhora(el, medido, el.closest(ESCENARIO), 1, c)
        return c
      })
      const corrido = corrimiento(pinDelLugar(frase[0]), window.scrollY)
      const renglones = renglonesDeLaFrase(frase, [false, false, true]).map((r) => ({ ...r, arriba: r.arriba - corrido }))
      const letras = letrasDeLaFrase(renglones, fuentes.frase, fuentes.fuerte, anchoMaximo)
      const medidas: Medidas = { valores: medidos, renglones, letras, caja: cajaDeLaFrase(letras), cuerpo: Math.max(1, ...letras.map((l) => l.cuerpo)) }
      // [PULIDO 7] F2 · el volteo (sin bandera) o la metamorfosis por contorno (`?meta=contorno`, hasta que se apruebe el volteo).
      const deLasFuentes = { valores: fuentes.valores, frase: fuentes.frase.fuente, fuerte: fuentes.fuerte.fuente }
      const pruebas = entornoDeLaEscena().pruebas
      const meta = pruebas.meta === 'contorno' ? armarElContorno(medidas.valores, inicio, medidas.letras, deLasFuentes, color) : armarElVolteo(medidas.valores, renglones, medidas.letras, deLasFuentes, color, VALORES.map((v) => v.titulo), pruebas.volteo === 'juntos' ? 'juntos' : 'cascada')
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
      llevarElEnlace(estado, '')
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
        costoMs: s.meta?.costo() ?? 0,
        piezas: a === null ? 0 : piezasDe(a).length,
        visibles: a === null ? 0 : piezasDe(a).filter((p) => p.grupo.visible).length,
        marco: a?.marco.visible ?? false,
        lienzo: a?.lienzo.visible ?? false,
        metaVisibles: s.meta?.objetos.filter((o) => o.visible).length ?? 0,
        letrasDeLaFrase: s.medidas?.letras.length ?? 0,
        cuerpoDeLaFrase: s.medidas?.cuerpo ?? 0,
        letrasDeLosValores: s.medidas?.valores.reduce((n, x) => n + (x?.letras.length ?? 0), 0) ?? 0,
        iconos: s.medidas?.valores.reduce((n, x) => n + (x?.iconos.length ?? 0), 0) ?? 0,
        enlace: s.enlace,
        corrido: a?.destino.fijo ? corrimiento(a.destino.fijo.pin, window.scrollY) : null,
        pin: a?.destino.fijo?.pin ?? null,
        scroll: window.scrollY,
        camara: CAMARA_SIN_EL_MOUSE.position.toArray().map((x) => Math.round(x * 100) / 100),
        camaraDelCta: camaraDelCta().position.toArray().map((x) => Math.round(x * 100) / 100),
        delCta,
      }
    }
    return () => {
      delete ventana.__ctaDelBanco
    }
  }, [camara, tam.width, tam.height])

  useFrame((state, delta) => alCuadro(m.current, logoMaterialRef.current, keyLightRef.current, state.camera, tam, stats.current, Math.min(delta, 0.1)))

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
  readonly planos: PlanosDelCta
  /** La transformada que tiene el enlace (sólo se escribe si cambia). */
  enlace: string
}

/**
 * [PULIDO 5] D1 · el CTA ya se fue: su escenario subió más de una pantalla (se fue con su sección) o la cámara del final empezó a
 * subir (desde el cenit, una pieza vertical que quedó en la sala se ve de canto, atravesando el pie).
 */
function seFue(a: ArmadoDelCta, alto: number): boolean {
  const caja = a.destino.fijo
  return EN_VIVO_DEL_FINAL.camara > 0 || (caja !== null && corrimiento(caja.pin, window.scrollY) < -alto)
}

/** [PULIDO 5] D1 · A1 · la transformada del enlace del CTA (sólo si cambió). */
function llevarElEnlace(s: EstadoDeLaEscenaDelCta, css: string): void {
  if (css === s.enlace) return
  const el = enlaceDelCta()
  s.enlace = css
  if (el === null) return
  el.style.transformOrigin = css === '' ? '' : '0 0'
  el.style.transform = css
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
  // [PULIDO 5] D1 · la frase va en su lugar de lectura (medido con el escenario clavado): no se corre con la página.
  const corrimientoDeLaFrase = { x: 0, y: 0 }
  return {
    items,
    cajaDeLosValores: { x: (x0 + x1) / 2, y: (y0 + y1) / 2, ancho: Math.max(1, x1 - x0), alto: Math.max(1, y1 - y0) },
    cajaDeLaFrase: medidas.caja,
    corrimiento: corrimientoDeLaFrase,
    cuerpoDeLaFrase: medidas.cuerpo,
    fuga: { x: tam.width / 2, y: tam.height / 2 },
    fondo,
    progreso: p,
    apareceDeLosValores: CTA_EN_VIVO.donde === 'lista' ? CTA_EN_VIVO.entrada : apareceDeLosValores(p),
  }
}

/** Un cuadro: los planos del mundo, las letras, las poses del giro, la metamorfosis, el enlace, el hover y la luz. */
function alCuadro(s: EstadoDeLaEscenaDelCta, logo: THREE.MeshStandardMaterial | null, luz: THREE.DirectionalLight | null, viva: THREE.Camera, tam: { readonly width: number; readonly height: number }, medidasDelLogo: { readonly logoW: number; readonly logoH: number }, dt: number): void {
  const a = s.armado
  if (a === null) return
  const p = CTA_EN_VIVO.progreso
  // [PULIDO 4] C1 · 5 · en un viaje del menú el CTA no se dibuja (el recorrido sólo pasa por la sección). [PULIDO 5] D1 · y,
  // anclado en el mundo, tampoco cuando ya se fue (`seFue`): su escenario se soltó más de una pantalla o la cámara del final subió.
  const enPantalla = ctaVisibleEnElViaje(viajeEnCurso() !== null) && (CTA_EN_VIVO.donde === 'lista' || p > 0) && !seFue(a, tam.height)
  a.marco.visible = enPantalla
  a.lienzo.visible = enPantalla
  if (!enPantalla || !(viva instanceof THREE.PerspectiveCamera)) {
    llevarElEnlace(s, '')
    return
  }
  // [PULIDO 5] D1 · los planos del mundo: el giro sale del de la frase (en la lista, de la pantalla: no hay título del que
  // salir) y la metamorfosis de la pantalla; en el primer tramo los dos llegan al del CTA y desde ahí quedan quietos en la sala.
  ponerLosPlanos(s.planos, viva, tam.height, tam.width / Math.max(1, tam.height), medidasDelLogo)
  const caja = a.destino.fijo
  // Y se va con su sección (fuera de su escenario clavado), como los títulos de volumen.
  if (caja !== null) correrElPlano(s.planos.cta, corrimiento(caja.pin, window.scrollY))
  const anclado = suaveEntre(p, ANCLAJE_DEL_CTA.desde, ANCLAJE_DEL_CTA.hasta)
  ponerElMarco(a.marco, CTA_EN_VIVO.donde === 'lista' ? s.planos.pantalla : s.planos.frase, s.planos.cta, anclado)
  ponerElMarco(a.lienzo, s.planos.pantalla, s.planos.cta, anclado)
  letrasEnLaPantalla(a, window.scrollY)
  const destino = a.letras.destino
  // [PULIDO 6] E1 · el cartel, en la franja de «HABLANOS» (no sube a la de la frase).
  const alto = s.medidas === null ? undefined : altoDelCartel(destino, s.medidas.caja)
  posesDe(p, { origen: a.letras.origen, destino, pantalla: { ancho: tam.width, alto: tam.height }, armado: armadoSobreElCta(a.letras.origen, destino, alto), altoDelCartel: alto }, a.poses)
  // El hover (con el mouse, ya llegado): el CTA se levanta apenas hacia la cámara.
  s.hover += ((CTA_EN_VIVO.hover && p >= 0.97 ? 1 : 0) - s.hover) * (1 - Math.exp(-dt / HOVER_DEL_CTA.s))
  for (const pose of a.poses.destino) pose.z += s.hover * HOVER_DEL_CTA.levanta * (destino[0]?.cuerpo ?? 0)
  // En la lista el origen aparece antes de transformarse (cuando el logo ya bajó).
  for (const pose of a.poses.origen) pose.aparece *= CTA_EN_VIVO.entrada
  let i = 0
  for (const b of a.origen) for (const pieza of b.piezas) ponerLaPieza(pieza, a.poses.origen[i++])
  a.destino.piezas.forEach((pieza, k) => ponerLaPieza(pieza, a.poses.destino[k]))
  // [PULIDO 4] C1 · la metamorfosis de los valores en la frase, con el mismo progreso.
  if (s.meta !== null && s.medidas !== null) {
    s.cuadro = cuadroDeAhora(s, s.medidas, fondoDelMarco(a.lienzo, viva), tam, p)
    s.meta.poner(estadoDeLaMetamorfosis(p), s.cuadro)
  }
  // [PULIDO 5] D1 · A1 · el enlace del DOM, al cuadrilátero donde la cámara viva ve la caja de «HABLANOS» en su plano.
  const enlace = enlaceDelCta()
  if (caja !== null && enlace !== null) {
    const dom = { x: caja.lugar.izquierda, y: caja.lugar.arriba + corrimiento(caja.pin, window.scrollY), ancho: enlace.offsetWidth, alto: enlace.offsetHeight }
    llevarElEnlace(s, homografiaDelCta(s.planos.cta, { x: caja.lugar.izquierda + caja.dx, y: caja.lugar.arriba, ancho: caja.ancho, alto: caja.lugar.linea }, dom, viva, { ancho: tam.width, alto: tam.height }))
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
