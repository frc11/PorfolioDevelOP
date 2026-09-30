'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { hayBanco } from '../entorno'
import { ESCENAS_APARTE } from '../gpu/Precompilar'
import { leerLaTrama } from '../estrellas/trama'
import type { MoireHandle } from '../MoireScreen'
import { DIA_DEL_FINAL, NOCHE_DEL_AMANECER, bloqueTapaElCuadro, bloqueVivo, medirElBloqueOpacoEn } from '../nocheDisparada'
import { viajeEnCurso } from '../viaje'
import { DIA_DEL_TEXTO } from './diaDelTexto'
import { AMANECER, PAUSA_S, avanceDelScroll, compuertaEnLaLlegada, diaParaElTexto, momentoEn, pasoDelAmanecer, type MomentoVivo } from './linea'
import { armarLosHaces, dibujarLosHaces, mostrarLosHaces, type HacesDelAmanecer } from './haces'
import { AMANECER_EN_VIVO, conElAmanecerEnElLogo, hayAmanecer } from './luz'

/**
 * [ESCENA 7] T11 · EL AMANECER — el avance del evento y los haces por la trama (`linea.ts` tiene el porqué).
 * Corre mientras la compuerta del amanecer tiene prendido el día; sostiene la noche hasta el cambio, escribe
 * lo que los materiales leen, y dibuja los haces: el sol bajo que pasa por los cuadrados de la trama deja luz
 * en el aire de la sala (una cuenta por píxel a lo largo del rayo: en cada punto, si el camino hacia el sol
 * pasa por un hueco de las dos capas de la trama).
 *
 * [ESCENA 8] T3 · El avance que se muestra persigue al que pide el scroll con una velocidad tope, en las dos
 * direcciones. No se reproduce donde nadie lo ve o no corresponde: al cargar ya adentro del final, en un viaje
 * del menú y con el bloque opaco tapando el cuadro, va derecho al pedido; con menos movimiento, el día llega
 * de una vez. Escribe cuánto día hay para el texto del final (`DIA_DEL_TEXTO`), y si el pie (compartido, no
 * espera) queda a la vista, no deja al amanecer atrás de lo legible.
 *
 * [CALIDAD 1] A1 · En un viaje de día a día el amanecer no corre (ni de ida ni de vuelta por Tu panel): desde el
 * primer cuadro, la compuerta del destino con el día entero (`compuertaEnLaLlegada`), que se sostiene al llegar
 * hasta que el scroll lo alcanza o vuelve para atrás (`sigueEntero`). Los viajes que cambian de luz, como antes.
 *
 * [CALIDAD 1] B5 · Los haces se dibujan a media resolución, en su búfer: `haces.ts`.
 */

type VentanaDelBanco = Window & {
  __amanecerDelBanco?: {
    estado: () => { activo: boolean; s: number; avance: number; pedido: number; texto: number; abajo: number; frente: number; rayos: number; resplandor: number; sostiene: boolean }
    /** Deja el amanecer quieto en el segundo `s` (o lo suelta con `null`): para fotografiar cada momento. */
    congelar: (s: number | null) => void
    /** [CALIDAD 1] B5 · los haces (su escena y su búfer): para compararlos con los de resolución completa. */
    haces: () => HacesDelAmanecer
  }
}

interface PropsDelAmanecer {
  readonly moireRef: RefObject<MoireHandle | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
  /** [ESCENA 8] Con menos movimiento no hay evento: el día llega de una vez en la compuerta. */
  readonly quieto: boolean
}

export function Amanecer(props: PropsDelAmanecer) {
  if (!hayAmanecer()) return null
  return <AmanecerPrendido {...props} />
}


/** [ESCENA 8] T3 · ¿El pie ya está a la vista? (Su tinta es de día y no espera al amanecer.) */
function pieALaVista(m: { pie: Element | null }): boolean {
  if (m.pie === null || !m.pie.isConnected) m.pie = document.querySelector('[data-panel="cierre"]')
  return m.pie !== null && m.pie.getBoundingClientRect().top < window.innerHeight
}


function AmanecerPrendido({ moireRef, logoMaterialRef, quieto }: PropsDelAmanecer) {
  const memoria = useRef({ activo: false, avance: 0, pedido: 0, cuadros: 0, pie: null as Element | null, logo: null as THREE.MeshStandardMaterial | null, congelado: null as number | null, entero: false, pedidoAlLlegar: 0, bloque: bloqueVivo(), momento: momentoEn(0) as MomentoVivo, cuadro: { recien: false, carga: false, quieto: false, viaje: false, oculto: false, pie: false } })
  const haces = useMemo(() => armarLosHaces(), [])
  useEffect(() => {
    // [CALIDAD 1] B5: la escena de los haces se dibuja aparte: que también se precompile y se caliente al arrancar.
    const aparte = { escena: haces.escena, bufer: haces.bufer }
    ESCENAS_APARTE.add(aparte)
    return () => {
      ESCENAS_APARTE.delete(aparte)
      haces.soltar()
    }
  }, [haces])

  // Al desmontarse, el texto del final no queda esperando un día que ya nadie escribe.
  useEffect(
    () => () => {
      DIA_DEL_TEXTO.frase.set(1)
      DIA_DEL_TEXTO.abajo.set(1)
    },
    [],
  )

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__amanecerDelBanco = {
      estado: () => ({ activo: memoria.current.activo, s: memoria.current.avance * AMANECER.final, avance: memoria.current.avance, pedido: memoria.current.pedido, texto: DIA_DEL_TEXTO.frase.get(), abajo: DIA_DEL_TEXTO.abajo.get(), frente: AMANECER_EN_VIVO.uFrenteDelDia.value, rayos: AMANECER_EN_VIVO.uRayos.value, resplandor: AMANECER_EN_VIVO.uResplandor.value, sostiene: NOCHE_DEL_AMANECER.sostenida }),
      congelar: (s) => {
        memoria.current.congelado = s
      },
      haces: () => haces,
    }
    return () => {
      delete ventana.__amanecerDelBanco
    }
  }, [haces])

  useFrame((state, delta) => {
    const m = memoria.current
    const dt = Math.min(delta, 0.1)
    // El logo guarda su gris de noche hasta que el frente lo alcanza (una sola vez por material).
    const logo = logoMaterialRef.current
    if (logo !== null && m.logo !== logo) {
      conElAmanecerEnElLogo(logo)
      m.logo = logo
    }
    // [ESCENA 8] T3: el avance persigue al que pide el scroll (el borde de Tu panel), con una velocidad tope.
    m.cuadros += 1
    // [CALIDAD 1] A1: en un viaje de día a día, desde el primer cuadro la compuerta del destino (Tu panel corrido allá).
    const luzDelViaje = viajeEnCurso()?.luz ?? null
    const bloque = DIA_DEL_FINAL.activo || luzDelViaje !== null ? medirElBloqueOpacoEn(document, window.innerHeight, m.bloque) : null
    const enLaLlegada = luzDelViaje !== null && bloque !== null ? compuertaEnLaLlegada(bloque.tuPanel.pie - (luzDelViaje.y1 - window.scrollY), bloque.alto) : null
    const activo = enLaLlegada ?? DIA_DEL_FINAL.activo
    m.pedido = activo && bloque !== null ? avanceDelScroll(bloque.tuPanel.pie, bloque.alto) : 0
    const recien = activo && !m.activo
    m.activo = activo
    if (m.congelado !== null) m.avance = m.congelado / AMANECER.final
    else if (!activo) {
      m.avance = 0
      m.entero = false
    } else {
      // [CALIDAD 1] B2: el cuadro de parámetros, siempre el mismo objeto.
      const c = m.cuadro
      c.recien = recien
      c.carga = m.cuadros <= 3
      c.quieto = quieto
      c.viaje = viajeEnCurso() !== null
      c.oculto = delta > PAUSA_S || (bloque !== null && bloqueTapaElCuadro(bloque))
      c.pie = pieALaVista(m)
      pasoDelAmanecer(m, enLaLlegada !== null, m.pedido, dt, c)
    }
    DIA_DEL_TEXTO.frase.set(m.activo ? diaParaElTexto(m.avance, 'frase') : 1)
    DIA_DEL_TEXTO.abajo.set(m.activo ? diaParaElTexto(m.avance, 'abajo') : 1)
    const momento = momentoEn(m.activo ? m.avance * AMANECER.final : AMANECER.final + 1, m.momento)
    const u = AMANECER_EN_VIVO
    // Mientras sostiene la noche, el cielo de noche que el cielo del amanecer va a destapar.
    if (m.activo && momento.sostieneLaNoche && state.scene.fog !== null) u.uCieloDeNoche.value.copy(state.scene.fog.color).convertLinearToSRGB()
    NOCHE_DEL_AMANECER.sostenida = m.activo && momento.sostieneLaNoche
    u.uEstrellasDelAmanecer.value = m.activo ? momento.estrellas : 1
    u.uResplandor.value = m.activo ? momento.resplandor : 0
    u.uBarridoDelDia.value = m.activo && momento.barre ? 1 : 0
    u.uFrenteDelDia.value = momento.frente
    u.uRayos.value = m.activo ? momento.rayos : 0
    u.uCieloDelAmanecer.value = m.activo && momento.barre ? momento.cielo : m.activo && !momento.sostieneLaNoche ? 1 : 0
    if (mostrarLosHaces(haces, u.uRayos.value > 0.001, state.camera.position)) {
      leerLaTrama(moireRef.current)
      dibujarLosHaces(haces, state.gl, state.camera)
    }
  })

  return <primitive object={haces.composicion} />
}
