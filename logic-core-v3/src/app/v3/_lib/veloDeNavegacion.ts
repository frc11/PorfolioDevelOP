/**
 * [B12a.6] LA SEÑAL DEL VELO DE LA NAVEGACIÓN — sin react: la pide quien navega (`_componentes/navegacion/EnlaceDeRuta.tsx`) y la atiende
 * el velo del layout (`_chrome/velo/VeloDeNavegacion.tsx`), como la señal de la salida de la variante. Acá, porque `_componentes` no
 * importa de `_chrome`.
 *
 * [B12a.8] El color ya no es la noche del destino: lo decide el velo, que contrasta con lo que tapa. Y el velo avisa a la ventana cuándo
 * empieza a cubrir y cuándo la página nueva tiene su scroll (`EVENTOS_DEL_VELO`): la píldora de la navbar, que vive en el layout, se
 * desliza a su lugar del destino mientras el velo pasa.
 */

/** El home (`/v3`; con D8, `/`). */
export const RUTA_DEL_HOME = '/v3'

/**
 * [B12b] EL VIAJE: lo que cubre el cuadro con la ESCENA en vez de la banda (el papel se levanta y la cámara llega a la composición de la
 * página: `_componentes/navegacion/viajeAlServicio.ts`). Resuelve `escena` con el cuadro ya cubierto por la escena, o `banda` si no
 * pudo (sin escena a tiempo): entonces el velo cubre con la banda de siempre.
 */
export type ViajeDelVelo = () => Promise<'escena' | 'banda'>

/** Lo que pide quien navega: `cubierto` se llama con el cuadro cubierto entero; [B12b] `viaje`, si cubre la escena en vez de la banda. */
export interface PedidoDelVelo {
  readonly cubierto: () => void
  readonly viaje: ViajeDelVelo | null
}

let atender: ((p: PedidoDelVelo) => void) | null = null

/**
 * [B12b] El viaje pedido para el PRÓXIMO `cubrirConElVelo`, en el mismo clic: lo anota el `onClick` del enlace (que `EnlaceDeRuta` corre
 * antes de cubrir) y lo consume el pedido. Se olvida al terminar la tarea del clic (una microtarea): nunca queda para otra navegación.
 */
let viajePedido: ViajeDelVelo | null = null

export function pedirElViaje(v: ViajeDelVelo): void {
  viajePedido = v
  queueMicrotask(() => {
    if (viajePedido === v) viajePedido = null
  })
}

/** Cubre el cuadro con el velo y resuelve cuando está cubierto entero; sin el velo montado, en el acto. Se resuelve siempre. */
export function cubrirConElVelo(): Promise<void> {
  const viaje = viajePedido
  viajePedido = null
  return new Promise((resolver) => {
    if (atender === null) resolver()
    else atender({ cubierto: resolver, viaje })
  })
}

/** [B12b] ¿El velo está montado? (Sin él nadie repone la ruta: el viaje no se pide.) */
export const hayVelo = (): boolean => atender !== null

/** Sólo el velo del layout: atiende los pedidos mientras está montado. */
export function atenderElVelo(a: (p: PedidoDelVelo) => void): () => void {
  atender = a
  return () => {
    if (atender === a) atender = null
  }
}

/**
 * [B12a.8] Los avisos del velo en `window`: `cubre`, al empezar a cubrir (por un enlace o por la flecha: la página que se va todavía está);
 * `repuso`, con la ruta nueva montada y su scroll puesto (debajo del velo, antes de destapar). [B12a.8] `destapa`, al empezar a destapar
 * (en un cuadro del rAF, con el hilo libre: lo que arranque ahí no queda «empezado en el pasado»); `quieto`, al terminar.
 */
export const EVENTOS_DEL_VELO = { cubre: 'v3:velo-cubre', repuso: 'v3:velo-repuso', destapa: 'v3:velo-destapa', quieto: 'v3:velo-quieto' } as const

/**
 * [B12a.8] (4) EL VELO EN CURSO — cubriendo, tapando o destapando (lo escribe el velo al marcar su fase; `quieto` avisa al terminar). Lo
 * leen las obras pesadas del home que no hacen falta para su primer cuadro: la frase 3D del CTA del final y las piezas del pie (unos 360 y
 * 165 ms cada vez, medido en el build) y los títulos del ocio. Llegando al home con el velo, se armaban mientras el velo tapaba y destapaba:
 * la página nueva esperaba tapada más de 1 s y el destape tironeaba. Ahora esperan al velo quieto, salvo lo que está a la vista (la vuelta
 * al pie con la flecha): eso se arma tapado, como antes.
 */
export const VELO_EN_CURSO = { activo: false }

/**
 * [T0 · 2026-10-22] LO QUE RETIENE EL «QUIETO» — la banda marca si está en curso (`marcarLaBanda`) y el chrome que se mueve con el velo
 * puede retener el aviso de quieto hasta terminar (`retenerElQuieto`): la píldora, que se desliza mientras destapa y puede terminar
 * después que la banda. Así las obras pesadas del home (lo que espera a `quieto`: ~530 ms de hilo trabado en el dev) no caen en medio
 * de su deslizamiento: con el hilo trabado, el compositor la sigue moviendo pero el hilo la lee con la hora vieja (un salto aparente).
 * `VELO_EN_CURSO.activo` es la banda O alguna retención; `quieto` se avisa una vez, cuando las dos se terminan.
 */
const estadoDelQuieto = { banda: false, retenciones: 0 }

function actualizarElQuieto(): void {
  const antes = VELO_EN_CURSO.activo
  VELO_EN_CURSO.activo = estadoDelQuieto.banda || estadoDelQuieto.retenciones > 0
  if (antes && !VELO_EN_CURSO.activo && typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTOS_DEL_VELO.quieto))
}

/** Sólo el velo del layout: si la banda está en curso (cubriendo, tapando o destapando). */
export function marcarLaBanda(enCurso: boolean): void {
  estadoDelQuieto.banda = enCurso
  actualizarElQuieto()
}

/** Retiene el aviso de quieto hasta que se suelte (una vez: soltar de nuevo no hace nada). Devuelve cómo soltarlo. */
export function retenerElQuieto(): () => void {
  estadoDelQuieto.retenciones += 1
  actualizarElQuieto()
  let suelta = false
  return () => {
    if (suelta) return
    suelta = true
    estadoDelQuieto.retenciones -= 1
    actualizarElQuieto()
  }
}

/**
 * [T0 · 2026-10-22] LAS DOS VÍAS PARA BAJAR EL TIEMPO DEL VELO HACIA EL HOME (11 · 3): `banda` (la banda más corta: `VELO_CORTO`,
 * `_chrome/velo/velo.ts`) y `montaje` (el home se monta una sola vez: llegando por la navegación cliente, con la coreografía animada ya
 * cargada, sin el árbol quieto que después se rehacía entero; `_secciones/_contrato/precargaDeLaCoreografia.ts`). `ambas`, las dos;
 * `ninguna`, la de B12a.8 (la referencia del banco). La elige el banco con `window.__viaDelVelo` (`scripts-carga/velo.ts`, `VIA=…`), nunca la
 * URL; sin él, `VIA_POR_DEFECTO`.
 */
export type ViaDelVelo = 'banda' | 'montaje' | 'ambas' | 'ninguna'
export const VIA_POR_DEFECTO: ViaDelVelo = 'ambas'
const esVia = (v: unknown): v is ViaDelVelo => v === 'banda' || v === 'montaje' || v === 'ambas' || v === 'ninguna'
export function viaDelVelo(): ViaDelVelo {
  const v = typeof window === 'undefined' ? undefined : (window as Window & { __viaDelVelo?: unknown }).__viaDelVelo
  return esVia(v) ? v : VIA_POR_DEFECTO
}
export const conLaBandaCorta = (v: ViaDelVelo): boolean => v === 'banda' || v === 'ambas'
export const conElMontajeLiviano = (v: ViaDelVelo): boolean => v === 'montaje' || v === 'ambas'

/** Cerca del cuadro (media pantalla de margen): lo que se ve al destapar o apenas se scrollea. */
const aLaVista = (el: Element | null): boolean => {
  if (el === null) return false
  const r = el.getBoundingClientRect()
  return r.bottom > -0.5 * window.innerHeight && r.top < 1.5 * window.innerHeight
}

/** ¿Esta obra espera al velo? Sí mientras el velo está en curso y ninguno de sus lugares está a la vista. */
export function esperaAlVelo(lugares: readonly (Element | null)[]): boolean {
  return VELO_EN_CURSO.activo && !lugares.some(aLaVista)
}

/** Corre `f` ya con el velo quieto, o cuando quede quieto. Devuelve cómo cancelarla. */
export function cuandoElVeloQuede(f: () => void): () => void {
  if (!VELO_EN_CURSO.activo) {
    f()
    return () => undefined
  }
  window.addEventListener(EVENTOS_DEL_VELO.quieto, f, { once: true })
  return () => window.removeEventListener(EVENTOS_DEL_VELO.quieto, f)
}
