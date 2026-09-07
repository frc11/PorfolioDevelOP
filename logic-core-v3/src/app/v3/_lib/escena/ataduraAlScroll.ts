import { type RefObject, useEffect, useState } from 'react'

import {
  getIntroStage,
  introEnteredClean,
  subscribeIntroStage,
} from '@/components/layout/home-intro/introHandoff'

import { medirLasSecciones } from './extensionDeLasSecciones'
import { progresoDelScroll } from './recorrido'
import { aplicarRevelado } from './revelado'
import { escenaRetenida } from './retencion'
import {
  ESTADO_INICIAL,
  escenaEnCuadro,
  siguiente,
  type EstadoDeLaEscena,
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

  useEffect(() => {
    let pedido = 0

    const leer = (): void => {
      pedido = 0
      if (document.visibilityState !== 'visible') return
      const ventana = window.innerHeight
      if (!(ventana > 0)) return
      const desplazamiento = window.scrollY
      const secciones = medirLasSecciones(document, desplazamiento)
      if (secciones === null) return

      const quieta = escenaRetenida(getIntroStage(), introEnteredClean())
      const progreso = quieta
        ? PROGRESO_RETENIDO
        : progresoDelScroll(desplazamiento, secciones.arriba, secciones.abajo, ventana)
      rig.set('progress', progreso)

      const enCuadro = escenaEnCuadro(
        desplazamiento,
        secciones.arriba,
        secciones.abajo,
        ventana,
      )
      // `siguiente` devuelve el MISMO objeto cuando no hay transición, así que
      // React descarta la actualización y esto no re-renderiza por cuadro de
      // scroll. Es una propiedad del contrato de `visibilidad.ts`, afirmada por
      // identidad en su invariante — no una esperanza sobre esta línea.
      setEstado((previo) => siguiente(previo, { tipo: 'cuadro', enCuadro }))

      // B3 · EL REVELADO, de la MISMA lectura de scroll: sólo una máscara CSS en
      // el envoltorio, jamás la pose ni el progreso. Ver `revelado.ts`.
      aplicarRevelado(reveladoRef.current, ventana, !quieta && enCuadro)
    }

    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(leer)
    }

    leer()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    document.addEventListener('visibilitychange', pedir)
    const desuscribir = subscribeIntroStage(pedir)

    return () => {
      if (pedido !== 0) cancelAnimationFrame(pedido)
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      document.removeEventListener('visibilitychange', pedir)
      desuscribir()
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
