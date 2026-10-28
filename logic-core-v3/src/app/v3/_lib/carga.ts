import { anotar } from './diagnostico/anotar'
import { entradaAbierta, suscribirALaEntrada } from './entrada'

/**
 * [AJUSTES FINALES] A4 · LA CARGA DE LA PÁGINA (provisorio hasta el preloader) — hasta acá al cargar se veían primero piezas
 * sueltas (la bajada y los CTA del hero sobre blanco, el chrome) y recién después la escena y el titular de volumen. Ahora:
 *
 *   1. La página arranca toda blanca (`VeloDeCarga.tsx`: un velo del color de fondo, en el HTML del servidor, encima de todo
 *      y sin recibir el puntero: no bloquea el scroll ni un cuadro).
 *   2. Cuando la escena dibujó su primer cuadro (`marcarElPrimerCuadro`, lo llama el motor de la escena), están las fuentes
 *      (`document.fonts.ready`) y el titular 3D del hero está armado (`marcarListo`, el registro de los títulos), todo
 *      aparece junto con un fundido de `fundidoMs`. Sin escena (se cayó) o sin títulos de volumen, no se los espera.
 *   3. Recién terminado el fundido se abre la carga (`abrirLaCarga`): el titular del hero cae con su llegada, y con él la
 *      bajada y los CTA, que van en su plano y aparecen con sus letras (`escena/titulos3d/acompanantes.ts`).
 *   4. Respaldo: si en `plazoMs` desde el arranque de la página no está todo, el fundido arranca igual (con el respaldo 2D
 *      del titular si el 3D no llegó: `titular2d.ts` comparte el plazo). Con movimiento reducido no hay fundido (la política
 *      del sitio corta toda animación a 1 ms): el velo queda opaco hasta que está todo, o hasta el plazo, y se va de golpe
 *      ([CIERRE] 1A: abajo).
 *
 * Sin React ni three: dos bits y sus oyentes, para `useSyncExternalStore` y para el cuadro de la escena.
 */
export const CARGA = {
  /** Desde el arranque de la página (`performance.now()`): si no está todo, el fundido arranca igual. */
  plazoMs: 4000,
  /** El fundido del velo (la hoja lo tiene como `--velo-fundido`; el fin de su animación es lo que desmonta el velo). */
  fundidoMs: 800,
  /** El seguro: si el fin de la animación no llega, el velo se va igual, este margen después de lo que debía durar. */
  margenMs: 400,
} as const

/**
 * [CIERRE] 1A · EL VELO SIEMPRE SE VA — en el teléfono de Valentino quedaba tapando la página. Medido (WebKit con un
 * iPhone y Chromium con un Android, `cierre-final/1a/`): entrando por la IP de la red, el servidor de desarrollo rechaza
 * su conexión de recarga y la página no hidrata; sin React nadie pedía el fundido, y con «reducir movimiento» la hoja no
 * lo hacía sola (la espera no se animaba): opaco para siempre. Ahora, pase lo que pase:
 *
 *   · abajo de 1024 el velo espera sólo lo que existe ahí: las fuentes y el primer cuadro de la escena (o la escena caída);
 *     el titular de volumen se espera sólo desde 1024, y sólo si está anotado (`estaTodo`);
 *   · con JavaScript, a `seguroMs` del arranque se va igual, sin condiciones (`VeloDeCarga.tsx`);
 *   · sin hidratar, la hoja lo saca a los `plazoMs` en todos los anchos y también con movimiento reducido (de golpe).
 */
export const SEGURO_DEL_VELO_MS = CARGA.plazoMs + CARGA.fundidoMs + CARGA.margenMs

export interface EstadoDeLaCarga {
  readonly fuentes: boolean
  readonly primerCuadro: boolean
  readonly caida: boolean
  /** Desde 1024 (`CONSULTA_ESCENARIO`): el único ancho con titular de volumen. */
  readonly escritorio: boolean
  /** El titular del hero, anotado como título de volumen, y armado (sus dos registros). */
  readonly conTitular: boolean
  readonly titularListo: boolean
}

/** ¿Está todo lo que el velo espera? Las fuentes, el primer cuadro (o la caída) y, sólo desde 1024, el titular anotado. */
export const estaTodo = (e: EstadoDeLaCarga): boolean => e.fuentes && (e.primerCuadro || e.caida) && (!(e.escritorio && e.conTitular) || e.titularListo)

let primerCuadro = false
let lista = false
/** [B12c] El fundido del velo terminó (la carga se pidió): se abre recién con la entrada abierta (el preloader del sitio, `entrada.ts`). */
let pedida = false
let preparada = false
const oyentes = new Set<() => void>()

function avisar(): void {
  for (const f of oyentes) f()
}

function abrirSiSePuede(): void {
  if (lista || !pedida || !entradaAbierta()) return
  lista = true
  anotar('carga-abierta')
  avisar()
}
suscribirALaEntrada(abrirSiSePuede)

/** La escena dibujó su primer cuadro. Lo llama el motor de la escena, una vez. */
export function marcarElPrimerCuadro(): void {
  if (primerCuadro) return
  primerCuadro = true
  anotar('primer-cuadro')
  avisar()
}

export const hayPrimerCuadro = (): boolean => primerCuadro

/**
 * El fundido terminó: lo que esperaba a la carga (la llegada del titular del hero) arranca. [B12c] Con el preloader del sitio puesto, recién
 * cuando se va (`entrada.ts`): el titular y el logo que cae llegan a la vista, no debajo del blanco.
 */
export function abrirLaCarga(): void {
  if (pedida) return
  pedida = true
  abrirSiSePuede()
}

export const cargaLista = (): boolean => lista

/** [C2-81] El velo ya terminó y pidió la carga (con el preloader, se abre recién con la entrada). */
export const cargaPedida = (): boolean => pedida

/**
 * [B12c] La escena está preparada: compiló sus programas y los calentó (`escena/gpu/Precompilar.tsx`, una vez). El preloader del sitio
 * lo espera: el tirón de la primera compilación queda debajo de su blanco y no en la entrada.
 */
export function marcarLaEscenaPreparada(): void {
  if (preparada) return
  preparada = true
  avisar()
}

export const escenaPreparada = (): boolean => preparada

export function suscribirALaCarga(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
