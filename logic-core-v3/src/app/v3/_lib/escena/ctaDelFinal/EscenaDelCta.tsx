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
import { armarElCta, fuentesDeLaMetamorfosis, letrasEnLaPantalla, lineaDelCta, piezasDe, ponerElMarco, ponerLaPieza, soltarElCta, type ArmadoDelCta } from './armadoDelCta'
import { CTA_EN_VIVO, FRASE_DE_VOLUMEN, ctaListo, ctaVisibleEnElViaje, marcarElCtaListo, suscribirAlLugarDelCta, versionDelLugarDelCta } from './enVivo'
import { cajaDeAhora, medirElValor, renglonesDeLaFrase, type CajaDeAhora, type MetricasDeLaFuente, type RenglonDeLaFrase, type ValorMedido } from './medidaDeLosValores'
import { letrasDeLaFrase, type LetraDeLaFrase } from './piezasDeLaMetamorfosis'
import { ANCLAJE_DEL_CTA, camaraDelCta, correrElPlano, esquinasEnElGiro, homografiaDelCta, nuevosPlanosDelCta, ponerLosPlanos, type PlanosDelCta } from './planosDelCta'
import { armarElSubrayado, ponerElSubrayado, soltarElSubrayado, type SubrayadoDelCta } from './subrayado'
import { apareceDeLosValores, armadoSobreElCta, cajaDe, ctaTocable, deslizadoEnLaLista, posesDe, tocableEnLaLista, valoresAPlano } from './transformacion'
import type { LugarDelMarco } from './armadoDelCta'
import { usePrefiereMenosMovimiento } from '../../usePrefiereMenosMovimiento'
import { armarElVolteo, type CuadroDelVolteo } from './volteo'
import { VALORES } from '../../../_secciones/por-que-develop/contenido'

/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL EN LA ESCENA (en su módulo, que se descarga aparte) — arma el giro letra por letra
 * (`armadoDelCta.ts`) cuando el DOM tiene sus lugares y las fuentes cargaron, lo compila y avisa al DOM (que entonces esconde
 * su texto). En cada cuadro pone las letras en las poses del giro (`transformacion.ts`) con el progreso que escribe el DOM
 * (función del scroll). En el escenario se dibuja desde que la transformación arranca (antes, la frase es el título de
 * volumen, que desde ahí queda relevado); en la lista, siempre que el CTA está en la pantalla. Su luz es la de los títulos:
 * la noche del logo y los reflejos con la luz de la sala. [PULIDO 4] C1 · y, a la vez, los seis valores se vuelven la frase del
 * CTA ([PULIDO 8] G1 · el volteo, `volteo.ts`: `contorno` se borró). En un viaje del menú, nada (`ctaVisibleEnElViaje`).
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

/** [PULIDO 4] C1 · los valores que se vuelven la frase, armados: lo que se agrega al lienzo, cómo se pone y cómo se suelta. */
export interface MetamorfosisArmada {
  readonly objetos: readonly THREE.Object3D[]
  readonly materiales: readonly THREE.MeshStandardMaterial[]
  poner(cuadro: CuadroDelVolteo): void
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
  const m = useRef<EstadoDeLaEscenaDelCta>({ armado: null, meta: null, subrayado: null, medidas: null, estudio: null, hover: 0, cajas: Array.from({ length: 6 }, () => ({ x: 0, y: 0, escala: 1 })), cuadro: null, planos: nuevosPlanosDelCta(), enlace: '', quieto: false, tactil: false })
  // [PULIDO 8] G2 · el subrayado aparece sin animación con movimiento reducido; con el dedo (sin hover) se dibuja al formarse.
  const quieto = usePrefiereMenosMovimiento()
  useEffect(() => {
    const estado = m.current
    const sinHover = window.matchMedia('(hover: none)')
    const poner = (): void => {
      estado.tactil = sinHover.matches
    }
    estado.quieto = quieto
    poner()
    sinHover.addEventListener('change', poner)
    return () => sinHover.removeEventListener('change', poner)
  }, [quieto])

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
      // El volteo: los valores medidos planos (en px de su caja) y la frase en sus renglones de LECTURA (con su escenario
      // clavado: quedan en el mundo, no van con la página).
      const medidos = valores.map((el) => (el === null ? null : medirElValor(el, fuentes.valores.data as MetricasDeLaFuente, el.closest(ESCENARIO))))
      const corrido = corrimiento(pinDelLugar(frase[0]), window.scrollY)
      const renglones = renglonesDeLaFrase(frase, [false, false, true]).map((r) => ({ ...r, arriba: r.arriba - corrido }))
      const letras = letrasDeLaFrase(renglones, fuentes.frase, fuentes.fuerte, anchoMaximo)
      const medidas: Medidas = { valores: medidos, renglones, letras, caja: cajaDeLaFrase(letras), cuerpo: Math.max(1, ...letras.map((l) => l.cuerpo)) }
      // [PULIDO 8] G1 · el volteo, el único (`contorno` y la cascada se borraron).
      const deLasFuentes = { valores: fuentes.valores, frase: fuentes.frase.fuente, fuerte: fuentes.fuerte.fuente }
      const meta = armarElVolteo(medidas.valores, renglones, medidas.letras, deLasFuentes, color, VALORES.map((v) => v.titulo))
      const rt = estado.estudio
      for (const p of piezasDe(a)) if (rt !== null) p.material.material.envMap = rt.texture
      for (const mat of meta.materiales) if (rt !== null) mat.envMap = rt.texture
      for (const o of meta.objetos) a.lienzo.add(o)
      const linea = lineaDelCta(a)
      const subrayado = linea === null ? null : armarElSubrayado(linea.ancho / Math.max(1e-6, linea.cuerpo), color)
      if (subrayado !== null) {
        if (rt !== null) subrayado.material.material.envMap = rt.texture
        a.marco.add(subrayado.grupo)
      }
      estado.subrayado = subrayado
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
      if (estado.subrayado !== null) soltarElSubrayado(estado.subrayado)
      estado.armado = null
      estado.meta = null
      estado.subrayado = null
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
        tocable: ctaTocable(CTA_EN_VIVO.progreso),
        subrayado: s.subrayado === null ? null : { dibujado: s.subrayado.dibujado, visible: s.subrayado.grupo.visible, x: s.subrayado.grupo.scale.x },
        corrido: a?.destino.fijo ? corrimiento(a.destino.fijo.pin, window.scrollY) : null,
        pin: a?.destino.fijo?.pin ?? null,
        scroll: window.scrollY,
        camara: CAMARA_SIN_EL_MOUSE.position.toArray().map((x) => Math.round(x * 100) / 100),
        camaraDelCta: camaraDelCta().position.toArray().map((x) => Math.round(x * 100) / 100),
        delCta,
        // [PULIDO 10] J1 · las cajas en el cuadro (px) de lo que dibuja la escena del CTA (las placas, la frase, HABLANOS), por grupo:
        // el instrumento de solapes no las ve en el DOM (lo que reemplaza está apagado).
        cajas: () => {
          const cajas: { id: string; grupo: string; x: number; y: number; ancho: number; alto: number }[] = [] // banco
          raiz.current?.updateMatrixWorld(true)
          raiz.current?.traverseVisible((o) => {
            if (!(o instanceof THREE.Mesh) || !(o.geometry instanceof THREE.BufferGeometry)) return
            o.geometry.computeBoundingBox()
            const b = o.geometry.boundingBox
            if (b === null || b.isEmpty()) return
            let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
            for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
              v.set(x, y, z).applyMatrix4(o.matrixWorld).project(camara)
              const [px, py] = [((v.x + 1) / 2) * tam.width, ((1 - v.y) / 2) * tam.height]
              ;[x0, y0, x1, y1] = [Math.min(x0, px), Math.min(y0, py), Math.max(x1, px), Math.max(y1, py)]
            }
            // El bloque de texto: HABLANOS (letras y subrayado) es uno, la frase (sus tramos, en placas distintas) es otra, y
            // cada placa con su título es la suya; los renglones de un mismo bloque no se cuentan entre sí.
            let grupo = o.name.startsWith('volteo · el tramo') ? 'la frase' : ''
            for (let p = o.parent; grupo === '' && p !== null && p !== raiz.current; p = p.parent) if (p.name === 'cta del final' || p.name.startsWith('volteo · la placa')) grupo = p.name
            if (grupo === '') grupo = o.parent?.name || (o.parent?.uuid ?? o.uuid)
            cajas.push({ id: `cta3d: ${o.name || grupo}`, grupo: `cta3d:${grupo}`, x: x0, y: y0, ancho: x1 - x0, alto: y1 - y0 })
          })
          return cajas
        },
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
  subrayado: SubrayadoDelCta | null
  medidas: Medidas | null
  estudio: THREE.WebGLRenderTarget | null
  hover: number
  readonly cajas: CajaDeAhora[]
  cuadro: CuadroDelVolteo | null
  readonly planos: PlanosDelCta
  /** La transformada que tiene el enlace (sólo se escribe si cambia). */
  enlace: string
  /** [PULIDO 8] G2 · movimiento reducido y sin hover (el dedo). */
  quieto: boolean
  tactil: boolean
}

/**
 * [PULIDO 5] D1 · el CTA ya se fue: su escenario subió más de una pantalla (se fue con su sección) o la cámara del final empezó a
 * subir (desde el cenit, una pieza vertical que quedó en la sala se ve de canto, atravesando el pie).
 */
function seFue(a: ArmadoDelCta, alto: number): boolean {
  const caja = a.destino.fijo
  return EN_VIVO_DEL_FINAL.camara > 0 || (caja !== null && corrimiento(caja.pin, window.scrollY) < -alto)
}

/** [PULIDO 11] A4 · J9 e · la derecha de un marco o de un lugar, en el mundo. */
const DERECHA = new THREE.Vector3()

/** [PULIDO 11] A4 · J9 e · corre un marco `px` px de la pantalla hacia su derecha (negativo, a la izquierda), en su plano. */
function correrDeCostado(marco: THREE.Group, px: number): void {
  if (px === 0) return
  DERECHA.set(1, 0, 0).applyQuaternion(marco.quaternion)
  marco.position.addScaledVector(DERECHA, px * marco.scale.x)
  marco.updateMatrixWorld(true)
}

/** [PULIDO 11] A4 · J9 e · corre un lugar del marco `px` px de la pantalla hacia su derecha. */
function correrElLugarDeCostado(lugar: LugarDelMarco, px: number): void {
  DERECHA.set(1, 0, 0).applyQuaternion(lugar.giro)
  lugar.posicion.addScaledVector(DERECHA, px * lugar.escala)
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

/** [PULIDO 4] C1 · dónde están ahora los valores (sus cajas del DOM: en el escenario su columna va en el plano del título). */
function cuadroDeAhora(s: EstadoDeLaEscenaDelCta, medidas: Medidas, p: number): CuadroDelVolteo {
  const items = CTA_EN_VIVO.valores.map((el, k) => {
    const medido = medidas.valores[k]
    const c = s.cajas[k]
    if (el !== null && medido !== null) cajaDeAhora(el, medido, el.closest(ESCENARIO), valoresAPlano(p), c)
    return { x: c.x, y: c.y, escala: c.escala }
  })
  return { items, progreso: p, apareceDeLosValores: CTA_EN_VIVO.donde === 'lista' ? CTA_EN_VIVO.entrada : apareceDeLosValores(p) }
}

/** Un cuadro: los planos del mundo, las letras, las poses del giro, la metamorfosis, el enlace, el hover y la luz. */
function alCuadro(s: EstadoDeLaEscenaDelCta, logo: THREE.MeshStandardMaterial | null, luz: THREE.DirectionalLight | null, viva: THREE.Camera, tam: { readonly width: number; readonly height: number }, medidasDelLogo: { readonly logoW: number; readonly logoH: number }, dt: number): void {
  const a = s.armado
  if (a === null) return
  const p = CTA_EN_VIVO.progreso
  // [PULIDO 11] A4 · J9 e · en la lista no hay giro ni volteo: las piezas ya formadas (las poses de 1) y se deslizan.
  const enLaLista = CTA_EN_VIVO.donde === 'lista'
  const formado = enLaLista ? 1 : p
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
  // [PULIDO 11] A4 · J9 e · «HABLANOS» (el marco) desde la derecha y la frase (el lienzo) desde la izquierda.
  const fuera = enLaLista ? 1 - deslizadoEnLaLista(p) : 0
  if (enLaLista) {
    correrDeCostado(a.marco, fuera * tam.width)
    correrDeCostado(a.lienzo, -fuera * tam.width)
    // El enlace del DOM va con «HABLANOS»: el lugar del CTA (se rehace en cada cuadro), corrido lo mismo.
    correrElLugarDeCostado(s.planos.cta, fuera * tam.width)
  }
  letrasEnLaPantalla(a, window.scrollY)
  const destino = a.letras.destino
  // [PULIDO 6] E1 · el cartel, en la franja de «HABLANOS» (no sube a la de la frase).
  const alto = s.medidas === null ? undefined : altoDelCartel(destino, s.medidas.caja)
  posesDe(formado, { origen: a.letras.origen, destino, pantalla: { ancho: tam.width, alto: tam.height }, armado: armadoSobreElCta(a.letras.origen, destino, alto), altoDelCartel: alto }, a.poses)
  // El hover (con el mouse, ya tocable: [PULIDO 8] G2 · desde que su cara se lee): el CTA se levanta apenas hacia la cámara.
  const tocable = enLaLista ? tocableEnLaLista(p) : ctaTocable(p)
  s.hover += ((CTA_EN_VIVO.hover && tocable ? 1 : 0) - s.hover) * (1 - Math.exp(-dt / HOVER_DEL_CTA.s))
  const levanta = s.hover * HOVER_DEL_CTA.levanta * (destino[0]?.cuerpo ?? 0)
  for (const pose of a.poses.destino) pose.z += levanta
  // En la lista el origen aparece antes de transformarse (cuando el logo ya bajó).
  for (const pose of a.poses.origen) pose.aparece *= CTA_EN_VIVO.entrada
  let i = 0
  for (const b of a.origen) for (const pieza of b.piezas) ponerLaPieza(pieza, a.poses.origen[i++])
  a.destino.piezas.forEach((pieza, k) => ponerLaPieza(pieza, a.poses.destino[k]))
  // [PULIDO 4] C1 · los valores que se vuelven la frase, con el mismo progreso.
  if (s.meta !== null && s.medidas !== null) {
    s.cuadro = cuadroDeAhora(s, s.medidas, formado)
    s.meta.poner(s.cuadro)
  }
  // [PULIDO 8] G2 · el subrayado, con el giro (el lugar de su comienzo en la cara de «HABLANOS») y el levante del hover.
  const cajaDelCta = cajaDe(destino)
  const armado = armadoSobreElCta(a.letras.origen, destino, alto)
  const pose = a.poses.destino[0]
  if (s.subrayado !== null) ponerElSubrayado(s.subrayado, lineaDelCta(a), { c: cajaDelCta, armado, p: formado, giro: pose?.ry ?? 0, seVe: pose !== undefined && pose.aparece > 0, levanta }, { hover: CTA_EN_VIVO.hover, foco: CTA_EN_VIVO.foco, tactil: s.tactil }, s.quieto, dt)
  // [PULIDO 5] D1 · A1 · el enlace del DOM, al cuadrilátero donde la cámara viva ve la caja de «HABLANOS» en su plano. [PULIDO 8]
  // G2 · tocable desde que su cara se lee, todavía en el giro: sus esquinas, donde están ahora (y en su lugar, antes).
  const enlace = enlaceDelCta()
  if (caja !== null && enlace !== null) {
    const dom = { x: caja.lugar.izquierda, y: caja.lugar.arriba + corrimiento(caja.pin, window.scrollY), ancho: enlace.offsetWidth, alto: enlace.offsetHeight }
    const delCta = { x: caja.lugar.izquierda + caja.dx, y: caja.lugar.arriba, ancho: caja.ancho, alto: caja.lugar.linea }
    // [PULIDO 11] A4 · J9 e · en la lista no hay giro: el enlace, en el plano del CTA (ya corrido con «HABLANOS»).
    if (enLaLista) llevarElEnlace(s, homografiaDelCta(s.planos.cta, delCta, dom, viva, { ancho: tam.width, alto: tam.height }))
    else {
      const esquinas = ctaTocable(p) ? esquinasEnElGiro(delCta, cajaDelCta, armado, p, destino[0]?.cuerpo ?? 0, levanta) : undefined
      llevarElEnlace(s, homografiaDelCta(s.planos.cta, delCta, dom, viva, { ancho: tam.width, alto: tam.height }, esquinas))
    }
  }
  // La luz de los títulos: la noche del logo (su emisiva, en el mismo cuadro) y los reflejos con la luz de la sala.
  const nivel = luz === null ? 1 : Math.min(1, luz.intensity / KEY_INTENSITY)
  for (const pieza of piezasDe(a)) {
    if (logo !== null) pieza.material.material.emissive.copy(logo.emissive)
    pieza.material.material.envMapIntensity = nivel
  }
  for (const mat of [...(s.meta?.materiales ?? []), ...(s.subrayado === null ? [] : [s.subrayado.material.material])]) {
    if (logo !== null) mat.emissive.copy(logo.emissive)
    mat.envMapIntensity = nivel
  }
}
