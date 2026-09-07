'use client'

import { useCallback, useRef, useState } from 'react'

import { useReducedMotion } from '@/lib/use-reduced-motion'
import { introEnteredClean, useIntroStage } from '@/components/layout/home-intro/introHandoff'

import { useEscenaAtadaAlScroll } from './ataduraAlScroll'
import { CLASES_DE_LA_ESCENA } from './contrato'
import { MARCA_ESCENA } from '../marcaEscena'
import { EscudoDeLaEscena } from './EscudoDeLaEscena'
import ProbeStage from './ProbeStage'
import { fuenteDeEventosDelHome } from './fuenteDeEventos'
import { crearPistaDelHome } from './pistaDelHome'
import { escenaRetenida } from './retencion'
import { fisicaEn, frameloopDe } from './visibilidad'
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
          // ⚠️ Sin esto el offset de mouse NO llega: el div de eventos de r3f
          // vive en `z-0` debajo de las ocho secciones. `fuenteDeEventos.ts`
          // tiene la medición, el control positivo y por qué los dos van juntos.
          {...fuenteDeEventosDelHome()}
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
