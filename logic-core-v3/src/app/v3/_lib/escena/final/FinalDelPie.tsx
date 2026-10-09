'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import { retenerLosGestos } from '../../gestosDelScroll'
import type { NivelDeCalidad } from '../calidad'
import { hayBanco } from '../entorno'
import { PISO_VIVO } from '../piso/bloques'
import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../probeScene'
import type { ProbeStatsStore } from '../probeStore'
import { FINAL_DEL_BANCO, alCuadroDelFinal, crearElEstado, gestoDelFinal, soltarElFinal, type EstadoDelFinal } from './cuadroDelFinal'
import { FINAL_EN_EL_PISO, LUZ_DEL_BANCO } from './enElPiso'
import { crearElPlanoDeLaLuz } from './planoDeLaLuz'
import { LUZ_DE_ABAJO_EN_VIVO } from './luzDeAbajo'
import { ENCUADRE_EN_VIVO, marcarElPie, medirElEncuadreDelPie } from './encuadreDelPie'
import { HUECO, distanciaDelLogo, formasDelLogo, mascaraDelLogo } from './hueco'
import { escribiendoEnUnCampo } from './teclado'
import { SOMBRA_EN_EL_FINAL } from '../sombra/delLogo'
import { EN_VIVO } from './recorridoDelFinal'
import { ORBITA_EN_VIVO } from './orbitaDelMouse'

/**
 * [CIERRE] 3 · EL FINAL DEL PIE EN LA ESCENA — va justo después del rig (`OrbitRig` pone la cámara del recorrido en la pose
 * E y el balanceo del logo; acá se les suma el final, en el mismo cuadro y antes que todo lo que los lee: el piso, el aire,
 * los títulos, las piezas del pie). Desde 1024 y con movimiento (`ProbeStage`). Lo que hace y el porqué, en `recorridoDelFinal.ts`.
 *
 * [EL ENCASTRE] · el componente arma lo de una vez (las formas del logo, la máscara del hueco y el pozo) y en cada cuadro
 * llama a `alCuadroDelFinal` (`cuadroDelFinal.ts`). [RETOQUE DEL ENCASTRE] 1A · sin el vapor: se abre el hueco y el logo encaja.
 *
 * [PULIDO 1] P22 · TAMBIÉN EN EL TELÉFONO Y LA TABLET (calidad `compacta`): la misma cinemática; la máscara del hueco a la
 * mitad de resolución. Con movimiento reducido (`estatico`, abajo de 1024): sin cinemática, el estado final quieto al
 * llegar al fondo. [PULIDO 2] 1 · sin el escenario de P22: corre al fondo, DETRÁS de los elementos del pie (que quedan
 * donde están, arriba e interactivos, como en escritorio); los gestos se retienen sólo con el pie a la vista (un escucha
 * de `touchmove` que no es pasivo, siempre puesto, le costaría el scroll a iOS) y, escribiendo en el formulario, ni eso
 * (`teclado.ts`).
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly stats: ProbeStatsStore
  readonly calidad: NivelDeCalidad
  readonly estatico: boolean
}

type VentanaDelBanco = Window & { __finalDelBanco?: () => { fin: number; fase: string; pieEntero: boolean; camara: number; giro: number; aleja: number; golpes: number; logo: number[]; apertura: number; encuadre: unknown; teclado: unknown } }

/** El espesor del logo (u): la extrusión y sus dos biseles, en la escala del SVG (el mismo que publica `ProbeLogo`). */
const ESPESOR_DEL_LOGO = (PROBE_EXTRUDE.depth + 2 * PROBE_EXTRUDE.bevelThickness) * PROBE_SVG_SCALE
/** [PULIDO 2] 1 · la huella del logo acostado (u) si la escena todavía no la publicó: la del SVG a su escala. */
const ANCHO_DE_LA_HUELLA = 6.9
const FONDO_DE_LA_HUELLA = 4.78

export function FinalDelPie({ logoGroupRef, stats, calidad, estatico }: Props) {
  const angosto = calidad === 'compacta'
  const svg = useLoader(SVGLoader, '/logodevelOP.svg')
  const logo = useMemo(() => formasDelLogo(svg), [svg])
  const grupo = useRef<THREE.Group>(null)
  const m = useRef<EstadoDelFinal | null>(null)

  // Se arma al montarse (el pozo, al grupo; la máscara, al piso); al irse (abajo de 1024, o con movimiento reducido), todo
  // como estaba.
  useLayoutEffect(() => {
    const g = grupo.current
    const grupoDelLogo = logoGroupRef.current
    if (g === null) return undefined
    const estado = crearElEstado(logo.formas, ESPESOR_DEL_LOGO, estatico, angosto)
    const mascara = mascaraDelLogo(logo.formas, logo.caja, angosto ? HUECO.lado / 2 : HUECO.lado)
    const piso = FINAL_EN_EL_PISO
    piso.uHueco.value = mascara.textura
    piso.uMarcoDelHueco.value.copy(mascara.marco)
    // [PULIDO 6] E2 · la distancia al logo (la calma, la energía, el golpe y las ondas se miden desde el filo).
    const distancia = distanciaDelLogo(logo.formas, logo.caja, angosto ? HUECO.campo.lado / 2 : HUECO.campo.lado)
    piso.uDistanciaAlLogo.value = distancia.textura
    piso.uMarcoDeLaDistancia.value.copy(distancia.marco)
    logo.caja.getSize(piso.uCajaDelLogo.value).multiplyScalar(0.5)
    // [PULIDO 2] 4 · el plano que brilla debajo del piso (se ve por las rendijas). [PULIDO 3B] B0 · las chispas se borraron.
    const plano = crearElPlanoDeLaLuz(PISO_VIVO.radioDeReferencia - 1)
    m.current = estado
    // [PULIDO 6] E2 · y el filo por afuera del logo (con la matriz del logo en cada cuadro: `filoConPoder.ts`).
    g.add(estado.pozo.grupo, estado.filo.malla, plano)
    return () => {
      g.remove(estado.pozo.grupo, estado.filo.malla, plano)
      plano.geometry.dispose()
      if (plano.material instanceof THREE.Material) plano.material.dispose()
      soltarElFinal(estado, grupoDelLogo)
      EN_VIVO.fin = 0
      // [PULIDO 2] 6 · sin el final, la sombra del logo entera.
      SOMBRA_EN_EL_FINAL.fundido = 1
      EN_VIVO.pegadoDesde = Number.POSITIVE_INFINITY
      piso.uGolpe.value.w = 0
      piso.uHueco.value = null
      piso.uDistanciaAlLogo.value = null
      estado.pozo.soltar()
      estado.filo.soltar()
      mascara.textura.dispose()
      distancia.textura.dispose()
      m.current = null
    }
  }, [logo, logoGroupRef, angosto, estatico])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__finalDelBanco = () => ({ fin: EN_VIVO.fin, fase: m.current?.reloj.fase ?? 'sin final', pieEntero: EN_VIVO.pieEntero, camara: EN_VIVO.camara, giro: EN_VIVO.giro, aleja: EN_VIVO.aleja, golpes: m.current?.golpes ?? 0, logo: logoGroupRef.current ? [...logoGroupRef.current.position.toArray(), logoGroupRef.current.rotation.x] : [], apertura: FINAL_EN_EL_PISO.uApertura.value, encuadre: ENCUADRE_EN_VIVO.valor, teclado: m.current === null ? null : { ...m.current.teclado, alFondo: m.current.alFondo, ultimo: m.current.gestos.ultimo, ahora: performance.now() / 1000 } })
    // [PULIDO 2] 4 · la luz de abajo apagada y prendida (su costo, por diferencia) y [PULIDO 3] A1 su energía y su expansión.
    const conLuz = ventana as Window & { __luzDelBanco?: { apagar: (apagada: boolean) => void; energia: () => unknown } }
    conLuz.__luzDelBanco = {
      apagar: (apagada) => {
        LUZ_DEL_BANCO.apagada = apagada
      },
      energia: () => ({ poder: LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value, radio: LUZ_DE_ABAJO_EN_VIVO.uExpansionDeLaLuz.value.x, expansion: LUZ_DE_ABAJO_EN_VIVO.uExpansionDeLaLuz.value.y }),
    }
    // [PULIDO 2] 1 · el reloj clavado en un `fin` (el contraste del pie en un cuadro quieto); `null` lo suelta.
    const conFijo = ventana as Window & { __finalFijoDelBanco?: (fin: number | null) => void }
    conFijo.__finalFijoDelBanco = (fin) => {
      FINAL_DEL_BANCO.fijo = fin
    }
    return () => {
      delete ventana.__finalDelBanco
      delete conLuz.__luzDelBanco
      delete conFijo.__finalFijoDelBanco
      LUZ_DEL_BANCO.apagada = false
      FINAL_DEL_BANCO.fijo = null
    }
  }, [logoGroupRef])

  // [PULIDO 3B] B2 · el mouse para la órbita del pie (en escritorio): dónde está, de −1 a 1, y si salió de la ventana. Se lee de la
  // ventana y no de r3f (su puntero sólo se mueve sobre la caja del lienzo, y el pie del DOM va encima).
  useEffect(() => {
    if (angosto || estatico) return undefined
    const mover = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse') return
      ORBITA_EN_VIVO.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      ORBITA_EN_VIVO.y = 1 - (e.clientY / Math.max(1, window.innerHeight)) * 2
      ORBITA_EN_VIVO.aspecto = window.innerHeight / Math.max(1, window.innerWidth)
      ORBITA_EN_VIVO.fuera = false
    }
    const salir = (e: MouseEvent): void => {
      if (e.relatedTarget === null) ORBITA_EN_VIVO.fuera = true
    }
    const perder = (): void => {
      ORBITA_EN_VIVO.fuera = true
    }
    window.addEventListener('pointermove', mover, { passive: true })
    document.addEventListener('mouseout', salir)
    window.addEventListener('blur', perder)
    return () => {
      window.removeEventListener('pointermove', mover)
      document.removeEventListener('mouseout', salir)
      window.removeEventListener('blur', perder)
      ORBITA_EN_VIVO.fuera = true
    }
  }, [angosto, estatico])

  // [RETOQUE DEL ENCASTRE] 1D · los gestos de scroll, antes que Lenis: hacia arriba al fondo rebobinan (`cuadroDelFinal.ts`).
  // [PULIDO 1] P22 · en el teléfono, sólo mientras se ve el pie (PULIDO 2 · 1: ya no hay escenario); quieto, nunca.
  useEffect(() => {
    if (estatico) return undefined
    const retener = (): (() => void) => retenerLosGestos((g) => (m.current === null ? false : gestoDelFinal(m.current, g)))
    if (!angosto) return retener()
    const vigilado = document.getElementById('cierre')
    if (vigilado === null) return undefined
    let soltar: (() => void) | null = null
    const vigia = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting && soltar === null) soltar = retener()
      else if (!e?.isIntersecting && soltar !== null) {
        soltar()
        soltar = null
      }
    })
    vigia.observe(vigilado)
    return () => {
      vigia.disconnect()
      soltar?.()
    }
  }, [angosto, estatico])

  // [PULIDO 2] 1 · abajo de 1024, dónde va el logo detrás del pie (`encuadreDelPie.ts`): al montarse, al asomarse el pie, cuando
  // algo de adentro cambia de tamaño (el pie mide una pantalla: su caja no cambia), con las fuentes y con la vista; con el
  // teclado abierto no (el viewport achicado no es el pie al fondo).
  useEffect(() => {
    if (!angosto) return undefined
    const pie = document.getElementById('cierre')
    let pendiente = 0
    const medir = (): void => {
      window.cancelAnimationFrame(pendiente)
      pendiente = window.requestAnimationFrame(() => {
        if (escribiendoEnUnCampo()) return
        medirElEncuadreDelPie({ ancho: stats.current.logoW || ANCHO_DE_LA_HUELLA, fondo: stats.current.logoH || FONDO_DE_LA_HUELLA })
      })
    }
    medir()
    const vigia = new ResizeObserver(medir)
    const asoma = new IntersectionObserver(medir, { threshold: [0, 0.5, 1] })
    if (pie !== null) {
      for (const e of [pie, ...pie.querySelectorAll('div, form, nav, ul')]) vigia.observe(e)
      asoma.observe(pie)
    }
    void document.fonts.ready.then(medir)
    window.addEventListener('resize', medir)
    return () => {
      window.cancelAnimationFrame(pendiente)
      vigia.disconnect()
      asoma.disconnect()
      window.removeEventListener('resize', medir)
      ENCUADRE_EN_VIVO.valor = null
      marcarElPie(false)
    }
  }, [angosto, stats])

  useFrame((state, delta) => {
    if (m.current !== null) alCuadroDelFinal(m.current, state, delta, logoGroupRef.current, { alto: stats.current.logoH || 4.78, espesor: stats.current.logoD || ESPESOR_DEL_LOGO, ancho: stats.current.logoW || undefined })
    // [PULIDO 2] 1 · abajo de 1024, al fondo y mientras el final corre (o el quieto lo mueve), el pie sin la mezcla: también
    // parado después de un rebobinado, con el logo en su lugar detrás de los enlaces (`encuadreDelPie.ts`).
    if (angosto && m.current !== null) marcarElPie(m.current.alFondo || EN_VIVO.fin > 0 || EN_VIVO.giro !== 0 || EN_VIVO.aleja !== 0)
  })

  return <group ref={grupo} name="final del pie" />
}
