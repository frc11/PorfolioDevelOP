import { type RefObject, useEffect, useRef, useState } from 'react'

import {
  getIntroStage,
  introEnteredClean,
  subscribeIntroStage,
} from '@/components/layout/home-intro/introHandoff'

import { medirLasSeccionesEn } from './extensionDeLasSecciones'
import { medidaSinElEstiramiento } from './tramoEstirado'
import { avisarQueSeMovioLaPagina } from './paginaMovida'
import { aplicarElDiaDelFinal, bloqueTapaElCuadro, bloqueVivo, medirElBloqueOpacoEn } from './nocheDisparada'
import { progresoDelScroll } from './recorrido'
import { aplicarRevelado } from './revelado'
import { escenaRetenida } from './retencion'
import { suscribirAlViaje, viajeEnCurso } from './viaje'
import {
  ESTADO_INICIAL,
  escenaEnCuadro,
  siguiente,
  type EstadoDeLaEscena,
  type FaseDeLaEscena,
} from './visibilidad'
import { createNumericStore, type ProbeRig } from './probeStore'

/**
 * LA ATADURA DE LA ESCENA AL SCROLL — el enchufe entre la posicion de la pagina
 * y el progreso del rig.
 *
 * ⚠️ **NO ES CODIGO NUEVO. SALIO DE `EscenaDelHome.tsx` EN B5, VERBATIM**, con
 * su docblock entero y sin cambiar una linea de logica. El motivo es la regla de
 * las 300 lineas del repo: aquel archivo estaba en **300 exactas** y B5 tenia que
 * agregarle la fuente de eventos del puntero. Un archivo que pasa las 300 se
 * parte, y esta es la parte que se corta sola — es un hook completo, con una
 * responsabilidad propia y un solo consumidor.
 *
 * ⚠️ `s10-raf.invariant.ts` lee el fuente de la escena para afirmar que el
 * pulso vive en un efecto PASIVO. Desde B5 ese fuente son DOS archivos, y el
 * invariante los concatena: la propiedad es del modulo de la escena, no de un
 * archivo.
 */

/** El progreso al que la escena se queda quieta mientras el intro la tapa. */
const PROGRESO_RETENIDO = 0

/** [CALIDAD 1] B2 · los dos eventos de cuadro, armados una vez (no uno por cuadro de scroll). */
const EN_CUADRO = { tipo: 'cuadro', enCuadro: true } as const
const FUERA_DE_CUADRO = { tipo: 'cuadro', enCuadro: false } as const

/**
 * ATA LA ESCENA AL SCROLL DE LA PÁGINA — el progreso y la visibilidad, de UNA
 * sola lectura por cuadro.
 *
 * ⚠ **Las dos cosas salen de la misma medición, y por eso viven en el mismo
 * efecto.** `scrollY`, la extensión de las secciones y el alto de la ventana se
 * leen una vez; de ahí sale el progreso (`recorrido.ts`) y de ahí sale si hay un
 * panel transparente en cuadro (`visibilidad.ts`). Leerlos dos veces sería medir
 * el mismo scroll con dos relojes y arriesgarse a que un cuadro escriba un
 * progreso de una lectura y una fase de otra.
 *
 * ── ⚠️ V3-B · EL DENOMINADOR YA NO ES EL DOCUMENTO ────────────────────────
 *
 * Acá se leía `document.documentElement.scrollHeight`, y §7.46 midió lo que eso
 * costaba: el documento tiene cosas que no son secciones —el pie, cuando salga
 * de la `<section id="cierre">`, son 485 px a 1440 y 746 px a 375— y el anclaje
 * se deriva de la TABLA de secciones, así que el progreso del diferencial se
 * corría de 0,750 a 0,7201 / 0,6906 sin que nadie tocara el anclaje. Ahora se
 * mide **la extensión de las ocho** (`extensionDeLasSecciones.ts`) y el
 * denominador deja de depender de lo que no es una sección.
 *
 * **Si no hay secciones que medir, este cuadro no escribe nada.** No hay
 * respaldo al alto del documento: volver a él en silencio sería reintroducir el
 * defecto justo cuando el instrumento no puede verlo. Es la misma forma que las
 * otras dos guardas de abajo — se sale del cuadro, se conserva lo último escrito
 * y el próximo evento vuelve a intentar.
 *
 * ── Por qué un listener con `requestAnimationFrame` y no un loop ───────────
 *
 * Porque el progreso sólo cambia cuando alguien scrollea. Un `useFrame` que lo
 * recalculara en los 60 cuadros de una página quieta haría el mismo trabajo para
 * escribir el mismo número. El `rAF` coalesce la ráfaga de eventos de scroll a
 * **como mucho una escritura por cuadro**, que es exactamente lo que el rig
 * necesita. Y sigue funcionando con el lazo del canvas suspendido: este `rAF` es
 * del documento, no del renderer.
 *
 * ── ⚠️ La guarda de la pestaña oculta ──────────────────────────────────────
 *
 * Con la pestaña ocluida el navegador saltea los rendering steps:
 * `window.innerHeight` devuelve 0 y toda medición de scroll o layout da cero
 * (lección ya escrita en `CLAUDE.md`). Acá eso pondría el progreso en 0 y
 * mandaría la cámara al hero sin que nadie haya scrolleado. Se comprueba
 * `document.visibilityState` **y** que la ventana tenga alto antes de escribir un
 * solo número.
 */
export function useEscenaAtadaAlScroll(
  rig: ReturnType<typeof createNumericStore<ProbeRig>>,
  retenida: boolean,
  reveladoRef: RefObject<HTMLDivElement | null>,
): EstadoDeLaEscena {
  const [estado, setEstado] = useState<EstadoDeLaEscena>(ESTADO_INICIAL)
  // [FINAL 2] La fase, para el revelado; y cuando vuelve a correr, una lectura que descubre la escena ya pintada.
  const faseRef = useRef<FaseDeLaEscena>(ESTADO_INICIAL.fase)
  const pedirRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    faseRef.current = estado.fase
    if (estado.fase === 'corriendo') pedirRef.current?.()
  }, [estado.fase])
  // [CALIDAD 1] B2: el último estado confirmado, para no llamar a React en cada cuadro de scroll sin transición.
  const estadoRef = useRef<EstadoDeLaEscena>(ESTADO_INICIAL)
  useEffect(() => {
    estadoRef.current = estado
  }, [estado])

  useEffect(() => {
    let pedido = 0
    // [CALIDAD 1] B2: lo que se mide en cada cuadro, escrito siempre en los mismos objetos.
    const extension = { arriba: 0, abajo: 0 }
    // [AJUSTES FINALES] B1 · el scroll y el pie de las secciones sin el tramo estirado del túnel ([CIERRE] 1C; REGLA DE ALTURAS).
    const sinEstirar = { y: 0, abajo: 0 }
    const bloque = bloqueVivo()

    const leer = (): void => {
      pedido = 0
      if (document.visibilityState !== 'visible') return
      const ventana = window.innerHeight
      if (!(ventana > 0)) return
      const desplazamiento = window.scrollY
      const secciones = medirLasSeccionesEn(document, desplazamiento, extension)
      if (secciones === null) return
      const medida = medidaSinElEstiramiento(desplazamiento, secciones.abajo, desplazamiento, ventana, sinEstirar)

      const quieta = escenaRetenida(getIntroStage(), introEnteredClean())
      const progreso = quieta
        ? PROGRESO_RETENIDO
        : progresoDelScroll(medida.y, secciones.arriba, medida.abajo, ventana)
      rig.set('progress', progreso)
      // [FINAL 2] El día del final, con la misma medida y en el mismo cuadro que el progreso.
      const elBloque = medirElBloqueOpacoEn(document, ventana, bloque)
      aplicarElDiaDelFinal(elBloque)

      // [VIAJES] Durante un viaje el `<main>` está apagado y se ve la sala entera: dibuja también en la banda opaca.
      const viajando = viajeEnCurso() !== null
      const enCuadro =
        viajando ||
        escenaEnCuadro(
          medida.y,
          secciones.arriba,
          medida.abajo,
          ventana,
        ) ||
        // [NOCTURNO FINAL] A5 · abajo de 1024 las ventanas del recorrido (en pantallas del escritorio) daban por tapada la sala
        // en las Demos, que en el teléfono la dejan ver: quedaba el último cuadro, congelado. Ahí se dibuja salvo que el
        // bloque opaco (Servicios y Tu panel) tape el cuadro entero.
        (window.innerWidth < 1024 && elBloque !== null && !bloqueTapaElCuadro(elBloque))
      // `siguiente` devuelve el MISMO objeto cuando no hay transición, así que
      // React descarta la actualización y esto no re-renderiza por cuadro de
      // scroll. Es una propiedad del contrato de `visibilidad.ts`, afirmada por
      // identidad en su invariante — no una esperanza sobre esta línea.
      // [CALIDAD 1] B2: sin transición `siguiente` devuelve el mismo objeto; entonces no se llama a React (que igual
      // reservaría la actualización en cada cuadro de scroll).
      const evento = enCuadro ? EN_CUADRO : FUERA_DE_CUADRO
      if (siguiente(estadoRef.current, evento) !== estadoRef.current) setEstado((previo) => siguiente(previo, evento))

      // B3 · EL REVELADO, de la MISMA lectura de scroll: sólo una máscara CSS en
      // el envoltorio, jamás la pose ni el progreso. Ver `revelado.ts`.
      // [FINAL 2] Y sólo con la escena CORRIENDO: al reanudar, el canvas guarda el último cuadro de antes
      // de suspenderse (con un salto, una pose y una luz que no son las de acá) hasta que vuelve a pintar.
      aplicarRevelado(reveladoRef.current, ventana, !quieta && enCuadro && !viajando && faseRef.current === 'corriendo')
    }

    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(leer)
    }
    pedirRef.current = pedir

    // [FINAL 2] El día del final se escribe también EN el evento: los eventos de scroll se despachan
    // antes que los cuadros de animación, así que la escena lo ve en el mismo cuadro del salto.
    const alDesplazar = (): void => {
      avisarQueSeMovioLaPagina()
      aplicarElDiaDelFinal(medirElBloqueOpacoEn(document, window.innerHeight, bloque))
      pedir()
    }
    leer()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    window.addEventListener('resize', pedir)
    document.addEventListener('visibilitychange', pedir)
    const desuscribir = subscribeIntroStage(pedir)
    // [VIAJES] Al empezar y al terminar un viaje se vuelve a leer: la escena se enciende o se suspende en el acto.
    const desuscribirDelViaje = suscribirAlViaje(pedir)

    return () => {
      if (pedido !== 0) cancelAnimationFrame(pedido)
      window.removeEventListener('scroll', alDesplazar)
      window.removeEventListener('resize', pedir)
      document.removeEventListener('visibilitychange', pedir)
      desuscribir()
      desuscribirDelViaje()
    }
    // `retenida` entra en las dependencias para que soltar la escena vuelva a
    // leer el scroll de una vez, sin esperar al próximo evento.
  }, [rig, retenida, reveladoRef])

  /**
   * El pulso de la reanudación. Sólo corre mientras la fase lo pide, y avisa
   * **un cuadro por vez**: cuántos hacen falta antes de volver a la física lo
   * decide `siguiente()`, no este efecto. Acá no hay política.
   */
  useEffect(() => {
    if (estado.fase !== 'reanudando') return
    const pedido = requestAnimationFrame(() => {
      setEstado((previo) => siguiente(previo, { tipo: 'pintado' }))
    })
    return () => cancelAnimationFrame(pedido)
  }, [estado])

  return estado
}
