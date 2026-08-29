/**
 * LA ÉPOCA DE MEDICIÓN — cuándo se vuelve a medir, y cuándo NO.
 *
 * ── El problema ────────────────────────────────────────────────────────────
 *
 * Dos cosas de este sistema necesitan medir cajas: el divisor de líneas —que no
 * puede calcular dónde corta el texto, tiene que preguntarlo— y el motor de
 * progreso, que necesita la posición y el alto del disparador para resolver el
 * ancla. Medir fuerza al navegador a resolver el layout. **Nunca por cuadro.**
 *
 * Este módulo es la única respuesta a "¿cuándo?", y la comparten los dos. Una
 * sola suscripción a `resize`, una sola espera de fuentes, un solo contador.
 * Cada instancia mide en su montaje y después una vez por época.
 *
 * ── Las tres razones para volver a medir ───────────────────────────────────
 *
 *   1. **Las fuentes terminaron de cargar.** Si el divisor corre antes, parte
 *      las líneas con la métrica de la fuente del sistema y quedan mal para
 *      siempre. `document.fonts.ready`. Si las fuentes YA estaban cargadas al
 *      arrancar, no se emite el evento: no hay nada que rehacer.
 *   2. **Cambió el ancho de la ventana.** Las líneas dependen del ancho. Con
 *      reposo: durante un arrastre de la ventana llegan decenas de `resize` y se
 *      mide UNA vez, cuando para.
 *   3. **La pestaña volvió a estar visible** con una medición pendiente.
 *
 * ── La tercera razón es una lección del repo, no una precaución ────────────
 *
 * Con la pestaña ocluida, minimizada o en una ventana de fondo, el navegador
 * saltea los rendering steps: no despacha `scroll`, no corre
 * `requestAnimationFrame`, y `window.innerWidth` devuelve **0**. Una medición
 * tomada ahí no es imprecisa: es cero. En un sprint anterior de este proyecto
 * eso se pagó tres veces —una primitiva de scroll que parecía rota, un layout
 * responsive que se reportaba en su rama mobile con una ventana de 1440, y
 * capturas con `clip` degenerado—. La regla que quedó es verificar
 * `document.visibilityState` ANTES de confiar en cualquier medición de layout.
 *
 * Acá esa regla es estructural: con la pestaña oculta el estado no avanza de
 * época, se anota como pendiente, y la medición ocurre cuando la pestaña vuelve.
 *
 * ── Por qué el núcleo es un reductor puro ──────────────────────────────────
 *
 * Porque la cifra "cuántas mediciones ocurren en un ciclo de vida típico" tiene
 * que tener un instrumento que la produzca, y un `useEffect` con un `setTimeout`
 * adentro no se puede afirmar sin navegador. `reducirEpoca` sí: se le da una
 * secuencia de eventos y devuelve cuántas épocas hubo.
 * `__tests__/epoca.invariant.ts` corre el ciclo típico, la ráfaga de arrastre y
 * el caso de la pestaña oculta, y compara contra un reductor ingenuo que no
 * tiene ni reposo ni guardia de visibilidad.
 */

import { useSyncExternalStore } from 'react'

/** Los cinco eventos que pueden mover el estado. No hay un sexto. */
export type EventoDeMedicion = 'fuentes' | 'resize' | 'reposo' | 'visible' | 'oculto'

export interface EstadoDeEpoca {
  /** Cuántas veces hubo que volver a medir desde el arranque. */
  readonly epoca: number
  /** Si el navegador está resolviendo layout para esta pestaña. */
  readonly visible: boolean
  /** Hay una medición debida que no se pudo tomar todavía. */
  readonly pendiente: boolean
}

export const EPOCA_INICIAL: EstadoDeEpoca = { epoca: 0, visible: true, pendiente: false }

/**
 * El reductor. Puro, sin reloj y sin DOM: el reposo llega como un evento
 * (`'reposo'`) que el temporizador de la capa de DOM emite cuando el arrastre
 * para. Así el debounce es comprobable.
 */
export function reducirEpoca(estado: EstadoDeEpoca, evento: EventoDeMedicion): EstadoDeEpoca {
  switch (evento) {
    case 'oculto':
      return { ...estado, visible: false }

    case 'visible':
      if (!estado.pendiente) return { ...estado, visible: true }
      return { epoca: estado.epoca + 1, visible: true, pendiente: false }

    case 'fuentes':
      if (!estado.visible) return { ...estado, pendiente: true }
      return { ...estado, epoca: estado.epoca + 1 }

    case 'resize':
      // No mide: anota. La época la mueve el reposo.
      return { ...estado, pendiente: true }

    case 'reposo':
      if (!estado.pendiente || !estado.visible) return estado
      return { epoca: estado.epoca + 1, visible: estado.visible, pendiente: false }
  }
}

/** Corre una secuencia de eventos sobre el estado inicial. Para los invariantes. */
export function correrEventos(
  eventos: readonly EventoDeMedicion[],
  desde: EstadoDeEpoca = EPOCA_INICIAL,
): EstadoDeEpoca {
  return eventos.reduce(reducirEpoca, desde)
}

/**
 * Cuántas mediciones toma UNA instancia en un ciclo de vida: la del montaje más
 * una por cada época posterior. Es la cifra que el sprint pide reportar, y sale
 * de acá.
 */
export function medicionesPorInstancia(eventos: readonly EventoDeMedicion[]): number {
  return 1 + correrEventos(eventos).epoca
}

/**
 * Ventana de reposo del arrastre de ventana, en milisegundos.
 *
 * No es una duración del sistema visual y por eso no sale de `--duracion-*`:
 * durante estos 150 ms no se anima nada ni se ve nada distinto. Es cuánto
 * silencio hace falta para decidir que el usuario terminó de arrastrar el borde
 * de la ventana. Más corto mide de más durante el arrastre; más largo deja el
 * texto partido con el ancho viejo un rato perceptible.
 */
export const REPOSO_MS = 150

export interface FotoDeEpoca {
  readonly epoca: number
  /** Ancho del viewport en el momento del corte. 0 = todavía no se pudo leer. */
  readonly ancho: number
  /** Alto del viewport. Es la longitud contra la que se resuelven las anclas. */
  readonly alto: number
}

/**
 * El corte de servidor: **siempre cero**, y es una constante estable.
 *
 * `useSyncExternalStore` compara identidades, así que devolver un objeto nuevo en
 * cada llamada haría un bucle de render. Y el cero no es un placeholder: es la
 * verdad. En el servidor no hay viewport, y un alto de 0 hace que el ancla no se
 * pueda resolver, que es exactamente lo que queremos —el patrón queda en su
 * estado de arranque hasta que haya una medición real.
 */
const FOTO_DE_SERVIDOR: FotoDeEpoca = { epoca: 0, ancho: 0, alto: 0 }

export function fotoDeServidor(): FotoDeEpoca {
  return FOTO_DE_SERVIDOR
}

/** Si el navegador está en condiciones de dar una medición de layout real. */
function medicionConfiable(): boolean {
  if (typeof document === 'undefined') return false
  return document.visibilityState === 'visible' && window.innerWidth > 0
}

let estado: EstadoDeEpoca = EPOCA_INICIAL
let foto: FotoDeEpoca = FOTO_DE_SERVIDOR
const oyentes = new Set<() => void>()
let temporizadorDeReposo: ReturnType<typeof setTimeout> | undefined
let cableado = false

function emitir(evento: EventoDeMedicion): void {
  const siguiente = reducirEpoca(estado, evento)
  const cambioLaEpoca = siguiente.epoca !== estado.epoca
  estado = siguiente
  if (!cambioLaEpoca) return
  foto = {
    epoca: siguiente.epoca,
    ancho: window.innerWidth,
    alto: window.innerHeight,
  }
  for (const oyente of oyentes) oyente()
}

/**
 * Pone el estado de acuerdo con lo que el navegador dice AHORA.
 *
 * Se llama antes de cada evento de medición y no solo en `visibilitychange`,
 * porque la guardia tiene dos condiciones y solo una de ellas emite un evento:
 * `visibilityState` avisa, pero un `innerWidth` en cero no avisa nada. Sin esta
 * resincronización, un estado que quedó en "oculto" por un ancho de cero no
 * saldría nunca de ahí y el sistema se quedaría sin medir para siempre, en
 * silencio.
 */
function sincronizarVisibilidad(): void {
  const confiable = medicionConfiable()
  if (confiable !== estado.visible) emitir(confiable ? 'visible' : 'oculto')
}

/**
 * Cablea los eventos del navegador al reductor. Se hace una sola vez para todo
 * el árbol: N patrones y N bloques de texto comparten UN oyente de `resize`.
 */
function cablear(): void {
  if (cableado) return
  cableado = true

  // El estado arranca con la visibilidad real, no con la supuesta.
  estado = { ...EPOCA_INICIAL, visible: medicionConfiable() }
  if (estado.visible) {
    foto = { epoca: 0, ancho: window.innerWidth, alto: window.innerHeight }
    // ⚠ Avisar acá NO es redundante. El primer render devolvió el corte de
    // servidor —viewport en cero— y esta línea es la que lo reemplaza por la
    // medida real. `useSyncExternalStore` re-lee el corte después de
    // suscribirse y lo detectaría igual, pero si NO lo detectara, y las fuentes
    // ya estuvieran cargadas y nadie tocara la ventana, el sistema se quedaría
    // con un viewport de cero para siempre y ningún patrón resolvería su ancla.
    // Es demasiado silencioso para dejarlo en manos de un detalle de React.
    for (const oyente of oyentes) oyente()
  }

  window.addEventListener(
    'resize',
    () => {
      sincronizarVisibilidad()
      emitir('resize')
      if (temporizadorDeReposo !== undefined) clearTimeout(temporizadorDeReposo)
      temporizadorDeReposo = setTimeout(() => {
        temporizadorDeReposo = undefined
        sincronizarVisibilidad()
        emitir('reposo')
      }, REPOSO_MS)
    },
    { passive: true },
  )

  document.addEventListener('visibilitychange', sincronizarVisibilidad)

  // Si las fuentes YA están cargadas no hay nada que rehacer, y no se gasta una
  // época: la medición del montaje ya sale con la métrica definitiva.
  if (document.fonts !== undefined && document.fonts.status !== 'loaded') {
    void document.fonts.ready.then(() => {
      sincronizarVisibilidad()
      emitir('fuentes')
    })
  }
}

function suscribir(alCambiar: () => void): () => void {
  // El oyente se registra ANTES de cablear: el cableado es el que reemplaza el
  // corte de servidor por la primera medición real, y si se registrara después
  // ese aviso llegaría a nadie.
  oyentes.add(alCambiar)
  cablear()
  return () => {
    oyentes.delete(alCambiar)
  }
}

function leer(): FotoDeEpoca {
  return foto
}

/**
 * El corte actual de la época y del viewport.
 *
 * Devuelve un objeto estable: solo cambia de identidad cuando la época avanza,
 * así que un `useEffect` con `[foto]` en las dependencias corre exactamente una
 * vez por época — que es la definición de "nunca por cuadro".
 */
export function useEpocaDeMedicion(): FotoDeEpoca {
  // Las tres funciones son de módulo, no del render: su identidad ya es estable
  // y envolverlas en `useCallback` no agregaría nada.
  return useSyncExternalStore(suscribir, leer, fotoDeServidor)
}
