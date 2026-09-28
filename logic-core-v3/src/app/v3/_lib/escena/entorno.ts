/**
 * [ESCENA 3] EL ENTORNO — lo que se aprobó de la exploración de ESCENA 2, prendido en la base.
 *
 * - **E1** · óculo y haz: la columna de luz sobre el logo, en su nivel `sutil` (el `medio` queda
 *   para comparar).
 * - **E4** · el pulso: anillos que salen del logo por el piso, con hover (`entorno/maquinaDelPulso.ts`).
 * - **E6** · el polvo que responde: estelas con la velocidad y inercia al frenar.
 * - **E7** · el cursor: el polvo cercano se corre al paso del puntero y vuelve con inercia. Es el
 *   nivel A de ESCENA 3; el B (más alcance y el bokeh) y la estela del cursor se probaron y se
 *   borraron: el B necesitaba código propio y la estela no sumaba, porque el cursor ya mueve la
 *   cámara y E6 estira todo el polvo.
 *
 * E0, E2, E3, E5 y E8 se descartaron y su código se borró: quedan documentadas en
 * `docs/rediseno/SPRINT-ESCENA-2.md`.
 *
 * **[ESCENA 5] Encendidos**, además: el moiré con sus cuatro variantes juntas (`moire`, en
 * `moire/`) y el polvo con la misma densidad en todo el interior (`polvoParejo`, en `polvo/`).
 *
 * **[ESCENA 5] Las pruebas** (`Pruebas`) van apagadas en el producto y en la base; sólo el banco
 * las prende:
 *
 * - `formacion` · las copias falladas afuera de la trama, en un piso más bajo (`formacion/`);
 *   `mirada` las gira hacia el logo con el hover; en el teléfono no hay, salvo `movil=menos`;
 * - `estrellas` · el cielo de afuera, detrás de la trama y de la formación, sólo de noche;
 * - `obstaculo` (5a) · el polvo y el bokeh rodean al logo; `posarse` (5b) · el polvo se posa en el
 *   piso con la quietud; `sombra=haz` (5c) · la mancha de contacto según el haz; `motas` (5d) · las
 *   motas del haz, de noche; `R1` / `R2` (5e) · el relieve por ruido, y `relieve=vivo` lo hace
 *   evolucionar.
 *
 * El banco de medición pisa todo esto ANTES de cargar la página, sin tocar el archivo:
 *
 *     window.__entornoDeLaEscena = 'producto'                       → estas banderas, y la escena publica su estado
 *     window.__entornoDeLaEscena = 'base'                           → la escena de `escena-base-limpia`
 *     window.__entornoDeLaEscena = 'producto,formacion,estrellas'   → el producto con esas pruebas
 *     window.__entornoDeLaEscena = 'producto,moire=hoy,polvo=antes' → el producto con el moiré y el polvo de antes
 *     window.__entornoDeLaEscena = 'E1,E6,haz=sutil'                → sólo esas, con esos niveles
 */

export const IDEAS_DEL_ENTORNO = ['E1', 'E4', 'E6', 'E7'] as const

export type IdeaDelEntorno = (typeof IDEAS_DEL_ENTORNO)[number]

export type NivelDelHaz = 'sutil' | 'medio'

/** [ESCENA 5] El relieve por ruido (5e): en las paredes (R1) o en el piso de afuera (R2). */
export type Relieve = 'no' | 'R1' | 'R2'

export interface Pruebas {
  /** Las copias falladas afuera de la trama, en formación, en un piso más bajo que el nuestro. */
  readonly formacion: boolean
  /** F-mirada: con hover sobre el logo, las copias giran despacio hacia el original. */
  readonly mirada: boolean
  /** En el teléfono (`compacta`): sin formación, o la versión con menos copias. */
  readonly movil: 'ninguna' | 'menos'
  /** Estrellas: el cielo de afuera, sólo de noche. */
  readonly estrellas: boolean
  /** 5a · el logo no se atraviesa. */
  readonly obstaculo: boolean
  /** 5b · el polvo se posa con la quietud. */
  readonly posarse: boolean
  /** 5c · la mancha de contacto según el haz. */
  readonly sombraHaz: boolean
  /** 5d · las motas del haz, de noche. */
  readonly motas: boolean
  readonly relieve: Relieve
  /** 5e · el ruido del relieve evoluciona muy lento (si no, quieto). */
  readonly relieveVivo: boolean
}

/** Todo apagado: así van en el producto y en la base. */
export const PRUEBAS_APAGADAS: Pruebas = {
  formacion: false,
  mirada: false,
  movil: 'ninguna',
  estrellas: false,
  obstaculo: false,
  posarse: false,
  sombraHaz: false,
  motas: false,
  relieve: 'no',
  relieveVivo: false,
}

export interface Entorno {
  readonly E1: boolean
  readonly E4: boolean
  readonly E6: boolean
  readonly E7: boolean
  /** E1 · cuánto se nota el haz, de día y de noche (`entorno/Haz.tsx`). */
  readonly haz: NivelDelHaz
  /** La sombra de contacto sigue la altura del logo y responde al pulso (`entorno/sombra.ts`). */
  readonly sombraViva: boolean
  /** E4 · el anillo se apaga sobre las cajas de texto. Sólo el banco lo apaga, para medir sin él. */
  readonly mascaraDeTexto: boolean
  /** [ESCENA 5] El moiré con M1a, M2, M3 y M4 juntos (`moire/`). Sin él, el de la base. */
  readonly moire: boolean
  /** [ESCENA 5] El polvo con la misma densidad en todo el interior (`polvo/`). Sin él, el de la base. */
  readonly polvoParejo: boolean
  /** [ESCENA 5] Las pruebas: apagadas salvo en el banco. */
  readonly pruebas: Pruebas
}

/** LAS BANDERAS DEL PRODUCTO. */
export const ENTORNO: Entorno = {
  E1: true,
  E4: true,
  E6: true,
  E7: true,
  haz: 'sutil',
  sombraViva: true,
  mascaraDeTexto: true,
  moire: true,
  polvoParejo: true,
  pruebas: PRUEBAS_APAGADAS,
}

/** La base limpia: todo apagado. Es lo que el banco compara contra el producto. */
export const BASE_LIMPIA: Entorno = {
  E1: false,
  E4: false,
  E6: false,
  E7: false,
  haz: 'sutil',
  sombraViva: false,
  mascaraDeTexto: true,
  moire: false,
  polvoParejo: false,
  pruebas: PRUEBAS_APAGADAS,
}

type VentanaConEntorno = Window & { __entornoDeLaEscena?: unknown }

/**
 * Traduce el pedido del banco. Pura: el invariante la prueba sin navegador. Con `producto` en la
 * lista se parte de las banderas del producto y se le suman las pruebas pedidas; sin él, sólo lo
 * que la lista nombra.
 */
export function entornoPedido(pedido: string): Entorno {
  if (pedido.trim() === 'base') return BASE_LIMPIA
  if (pedido.trim() === 'producto') return ENTORNO
  const partes = new Set(pedido.split(',').map((s) => s.trim()))
  const valor = (clave: string): string | undefined =>
    [...partes].find((p) => p.startsWith(`${clave}=`))?.slice(clave.length + 1)
  const producto = partes.has('producto')
  const tiene = (idea: string): boolean => (producto ? ENTORNO[idea as IdeaDelEntorno] : partes.has(idea))
  const haz = valor('haz')
  return {
    E1: tiene('E1'),
    E4: tiene('E4'),
    E6: tiene('E6'),
    E7: tiene('E7'),
    haz: haz === 'sutil' || haz === 'medio' ? haz : ENTORNO.haz,
    sombraViva: !partes.has('sombra=quieta'),
    mascaraDeTexto: !partes.has('mascara=no'),
    moire: valor('moire') !== 'hoy' && (producto || partes.has('moire')),
    polvoParejo: valor('polvo') !== 'antes' && (producto || partes.has('parejo')),
    pruebas: pruebasPedidas(partes, valor),
  }
}

function pruebasPedidas(partes: ReadonlySet<string>, valor: (clave: string) => string | undefined): Pruebas {
  return {
    formacion: partes.has('formacion'),
    mirada: partes.has('mirada'),
    movil: valor('movil') === 'menos' ? 'menos' : 'ninguna',
    estrellas: partes.has('estrellas'),
    obstaculo: partes.has('obstaculo'),
    posarse: partes.has('posarse'),
    sombraHaz: valor('sombra') === 'haz',
    motas: partes.has('motas'),
    relieve: partes.has('R1') ? 'R1' : partes.has('R2') ? 'R2' : 'no',
    relieveVivo: valor('relieve') === 'vivo',
  }
}

let resuelto: Entorno | null = null

/**
 * Las banderas de esta carga: las de arriba, o las que pidió el banco antes de cargar. Se resuelve
 * UNA vez y queda fija, para que todos los componentes vean la misma escena.
 */
export function entornoDeLaEscena(): Entorno {
  if (resuelto !== null) return resuelto
  if (typeof window === 'undefined') return ENTORNO
  const pedido = (window as VentanaConEntorno).__entornoDeLaEscena
  resuelto = typeof pedido === 'string' ? entornoPedido(pedido) : ENTORNO
  return resuelto
}

/** ¿Hay un banco mirando? Sólo entonces la escena publica su estado para que lo lea. */
export function hayBanco(): boolean {
  return typeof window !== 'undefined' && typeof (window as VentanaConEntorno).__entornoDeLaEscena === 'string'
}
