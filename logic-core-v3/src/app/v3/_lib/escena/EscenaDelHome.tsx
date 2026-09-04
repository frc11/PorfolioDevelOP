'use client'

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

import { useReducedMotion } from '@/lib/use-reduced-motion'
import {
  getIntroStage,
  introEnteredClean,
  subscribeIntroStage,
  useIntroStage,
} from '@/components/layout/home-intro/introHandoff'

import { CLASES_DE_LA_ESCENA } from './contrato'
import { MARCA_ESCENA } from '../marcaEscena'
import { EscudoDeLaEscena } from './EscudoDeLaEscena'
import ProbeStage from './ProbeStage'
import { medirLasSecciones } from './extensionDeLasSecciones'
import { crearPistaDelHome } from './pistaDelHome'
import { progresoDelScroll } from './recorrido'
import { aplicarRevelado } from './revelado'
import { escenaRetenida } from './retencion'
import {
  ESTADO_INICIAL,
  escenaEnCuadro,
  fisicaEn,
  frameloopDe,
  siguiente,
  type EstadoDeLaEscena,
} from './visibilidad'
import {
  PROBE_DEFAULTS,
  PROBE_RIG_DEFAULTS,
  PROBE_STATS_DEFAULTS,
  createNumericStore,
  type ProbeParams,
  type ProbeRig,
  type ProbeStats,
} from './probeStore'

/**
 * LA ESCENA 3D DEL HOME — el módulo perezoso que la compuerta monta.
 *
 * ⚠ **NO CONSTRUYE NADA. MONTA.** La escena la construyeron catorce sprints en
 * `/probe-escena` y SITIO-S8 la mudó a esta carpeta sin cambiarle un valor.
 * Este archivo es el equivalente del home de `ProbeEscena.tsx`: crea los tres
 * stores, arma la pista y renderiza `ProbeStage`. Lo que NO tiene —y es todo lo
 * que los diferencia— es el panel de calibración.
 *
 * ── Las cinco condiciones del contrato, y dónde se cumple cada una ─────────
 *
 * 1. **Entra por la compuerta que ya existe.** No hay una línea de compuerta
 *    acá: la de 1025 vive en `_componentes/EscenarioCompuerta.tsx` y este
 *    módulo es lo que ella pide con `import()`. Abajo del umbral nada de esto
 *    se descarga.
 * 2. **Fuera del flujo del documento.** El envoltorio lleva
 *    `CLASES_DE_LA_ESCENA` —`fixed inset-0 z-0 pointer-events-none`—, que es la
 *    razón por la que montar o desmontar no puede mover un panel.
 * 3. **Lleva la marca como valor de atributo.** `data-escena={MARCA_ESCENA}`.
 *    **Este es el único archivo de la aplicación que importa `marcaEscena.ts`**:
 *    si lo importara además cualquier módulo de la carga inicial, la marca
 *    viajaría con él y el instrumento reportaría —con razón— que la compuerta
 *    gotea.
 * 4. **`three` sólo se alcanza desde acá.** Todo el árbol de la escena cuelga
 *    de `ProbeStage`, que es el que importa `@react-three/fiber` y `three`.
 * 5. **No cambia un valor de la escena.** Ni una constante, ni un keyframe, ni
 *    un canal de luz. Lo que lo demuestra son las **34 suites que ya existían
 *    sobre estos módulos** —890 afirmaciones de VALOR, no de texto— corridas
 *    antes y después de la mudanza con la misma cuenta archivo por archivo.
 *    `s8-escena.invariant.ts` explica en su cabecera por qué un diff contra
 *    `git` sería el instrumento equivocado (§3.12 de `DIRECCION-ESCENA.md`).
 *
 * ── El progreso sale del scroll de la página, no de un control ─────────────
 *
 * `OrbitRig` ya lee `rig.get('progress')` en su `useFrame`, en modo
 * `coreografia` y con `playing = false` para que nada lo auto-avance. Lo único
 * que hace falta es que alguien lo escriba desde el scroll, y eso es
 * `useEscenaAtadaAlScroll` de acá abajo: **consumir lo que existe, sin tocar el
 * rig y sin inventar un segundo camino.**
 *
 * ── ESTE ARCHIVO ES EL ENCHUFE, y por eso no decide nada (SITIO-S9) ────────
 *
 * Lo escribió el agente principal en la Fase 0, antes de despachar los frentes,
 * y las dos decisiones que consume viven afuera:
 *
 * - **cuánto progreso le toca a cada posición de scroll** — `recorrido.ts`,
 *   sobre los nudos que `anclaje.ts` deriva de `secciones.ts` y de la
 *   coreografía. Acá sólo se llama a `progresoDelScroll`.
 * - **cuándo la escena tiene que estar dibujando** — `visibilidad.ts`, sobre las
 *   ventanas que salen de la misma derivación. Acá sólo se pasan `frameloop` y
 *   `physicsEnabled`.
 *
 * Las dos salen de **una sola lectura del scroll por cuadro**, que es la razón
 * por la que el enchufe existe en vez de que cada frente monte su propio
 * listener.
 *
 * ── `prefers-reduced-motion` y el aviso del intro ──────────────────────────
 *
 * Los dos se **consumen**, no se re-deciden. `reducedMotion` entra por prop y
 * la política ya vive adentro de `OrbitRig` (apaga inercia, mouse y vira). El
 * aviso del intro se lee de `introHandoff.ts`, que es el contrato que S8 dejó
 * escrito para esto.
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
function useEscenaAtadaAlScroll(
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

export default function EscenaDelHome() {
  // `useState` con inicializador perezoso y sin setter: la forma garantizada de
  // crear cada store una sola vez sin escribir un ref durante el render. Es la
  // misma que usa `ProbeEscena.tsx`.
  const [store] = useState(() => createNumericStore<ProbeParams>(PROBE_DEFAULTS))
  const [stats] = useState(() => createNumericStore<ProbeStats>(PROBE_STATS_DEFAULTS))
  const [rig] = useState(() => createNumericStore<ProbeRig>(PROBE_RIG_DEFAULTS))
  const [pista] = useState(() => crearPistaDelHome())

  const reducedMotion = useReducedMotion()
  const etapaDelIntro = useIntroStage()
  const retenida = escenaRetenida(etapaDelIntro, introEnteredClean())

  const reveladoRef = useRef<HTMLDivElement>(null) // el envoltorio, para la máscara del revelado (B3)
  const estadoDeLaEscena = useEscenaAtadaAlScroll(rig, retenida, reveladoRef)

  // `ProbeLogo` lo dispara UNA vez, en su efecto de montaje. Acá no enciende
  // ninguna pantalla —el home ya está entero detrás— pero el prop es
  // obligatorio y descartarlo en silencio escondería el evento.
  const alEstarLista = useCallback(() => undefined, [])
  // El progreso lo maneja el scroll: la reproducción automática no existe en el
  // home, así que este callback nunca puede dispararse.
  const alTerminarLaPasada = useCallback(() => undefined, [])

  return (
    <div
      ref={reveladoRef}
      className={CLASES_DE_LA_ESCENA}
      data-escena={MARCA_ESCENA}
      data-intro={etapaDelIntro}
      data-escena-fase={estadoDeLaEscena.fase}
      aria-hidden="true"
      // B3: la máscara del revelado. El `mask-image` lo escribe el scroll por
      // frame; estas dos fijan que cubra el envoltorio y no se repita.
      style={{ maskRepeat: 'no-repeat', maskSize: '100% 100%' }}
    >
      <EscudoDeLaEscena>
        <ProbeStage
          store={store}
          rig={rig}
          stats={stats}
          editor={pista}
          mode="coreografia"
          // La física es inercia + mouse + vira. Se apaga en DOS casos y los dos
          // son el mismo mecanismo: mientras el intro tapa la escena (contrato de
          // `introHandoff`, punto 2) y en el cuadro en que la escena vuelve de
          // estar suspendida, para que la pose sea la del progreso de HOY y no
          // una persecución desde la de hace diez pantallas.
          physicsEnabled={!retenida && fisicaEn(estadoDeLaEscena)}
          // El progreso sale del scroll, nunca de una reproducción: con
          // `playing` en `false` el rig no auto-avanza y sólo lee lo que
          // `useEscenaAtadaAlScroll` escribió.
          playing={false}
          onPlayEnd={alTerminarLaPasada}
          reducedMotion={reducedMotion}
          // SUSPENDER NO ES DESMONTAR: `'never'` para el lazo de r3f y no dibuja
          // un cuadro, con el contexto de WebGL y el árbol enteros. Volver cuesta
          // un cuadro.
          frameloop={frameloopDe(estadoDeLaEscena)}
          // Dos automatismos del panel que en el home no existen: la órbita
          // automática es del modo manual y la luz solidaria es una perilla de
          // calibración.
          autoOrbit={false}
          keyFollowsCamera={false}
          onReady={alEstarLista}
        />
      </EscudoDeLaEscena>
    </div>
  )
}
