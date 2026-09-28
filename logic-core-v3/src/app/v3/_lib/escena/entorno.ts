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
 * **[ESCENA 6] Pasan al producto** tres pruebas de ESCENA 5: el logo como obstáculo del polvo y del
 * bokeh (5a, `obstaculo`), la mancha de contacto según el haz (5c, `sombraHaz`) y las motas del haz
 * de noche (5d, `motas`). Y el pulso ya no se apaga sobre las cajas de texto: la máscara se borró.
 *
 * **[ESCENA 7] Pasan al producto**, mejoradas: la formación («la fábrica gigante», `formacion`; sin
 * fallas: se borraron), el cielo de noche (estrellas y vía láctea, `cielo`), el polvo que se posa (con
 * los tiempos a la mitad, `posarse`), el piso vivo (un mar, sin scroll, `pisoVivo`), la inercia del aire
 * (6a tal cual, `inercia`), la niebla de afuera (6c + 6d, un solo efecto, `niebla`) y el haz que se
 * enciende (6e, más notorio, `hazEncendido`), además del polvo nítido (T10, `nitidez`) y el haz en el piso
 * (las sombras de las motas y la luz que rebota, T12, `rebote`). El banco las apaga para comparar con
 * `formacion=no`, `cielo=no`, `posarse=no`, `piso=no`, `inercia=no`, `niebla=no`, `encendido=no`,
 * `nitidez=no` y `rebote=no`. Se borraron 6b y 6f.
 *
 * **Las pruebas** (`Pruebas`) van apagadas en el producto y en la base; sólo el banco las prende:
 *
 * - T11 `amanecer` · el día entra desde afuera y por la trama, como un evento de luz (6g + los rayos);
 * - T13 `fibras`, `fugaz`, `enfoque` y `grano` · pelusas que caen girando, una estrella fugaz de noche,
 *   el foco que busca al frenar y el grano de cámara.
 *
 * El banco de medición pisa todo esto ANTES de cargar la página, sin tocar el archivo:
 *
 *     window.__entornoDeLaEscena = 'producto'                       → estas banderas, y la escena publica su estado
 *     window.__entornoDeLaEscena = 'base'                           → la escena de `escena-base-limpia`
 *     window.__entornoDeLaEscena = 'producto,amanecer'              → el producto con una prueba
 *     window.__entornoDeLaEscena = 'producto,moire=hoy,polvo=antes' → el producto con el moiré y el polvo de antes
 *     window.__entornoDeLaEscena = 'producto,obstaculo=no,sombra=blanda,motas=no' → sin 5a, 5c ni 5d
 *     window.__entornoDeLaEscena = 'E1,E6,haz=sutil'                → sólo esas, con esos niveles
 */

export const IDEAS_DEL_ENTORNO = ['E1', 'E4', 'E6', 'E7'] as const

export type IdeaDelEntorno = (typeof IDEAS_DEL_ENTORNO)[number]

export type NivelDelHaz = 'sutil' | 'medio'

export interface Pruebas {
  /** T11 · el amanecer: el día entra desde afuera y por la trama, como un evento de luz (`amanecer/`). */
  readonly amanecer: boolean
  /** T13 · fibras en el aire: pocas pelusas que caen girando (`pruebas/Fibras.tsx`). */
  readonly fibras: boolean
  /** T13 · la estrella fugaz, de noche, afuera de la trama (`pruebas/Fugaz.tsx`). */
  readonly fugaz: boolean
  /** T13 · el enfoque que busca: al frenar el scroll el foco duda y se clava en el logo (`pruebas/Enfoque.tsx`). */
  readonly enfoque: boolean
  /** T13 · el grano de cámara, muy fino y en movimiento (`pruebas/Grano.tsx`). */
  readonly grano: boolean
}

/** Todo apagado: así van en el producto y en la base. */
export const PRUEBAS_APAGADAS: Pruebas = {
  amanecer: false,
  fibras: false,
  fugaz: false,
  enfoque: false,
  grano: false,
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
  /** [ESCENA 5] El moiré con M1a, M2, M3 y M4 juntos (`moire/`). Sin él, el de la base. */
  readonly moire: boolean
  /** [ESCENA 5] El polvo con la misma densidad en todo el interior (`polvo/`). Sin él, el de la base. */
  readonly polvoParejo: boolean
  /** [ESCENA 6] 5a · el logo no se atraviesa: el polvo y el bokeh lo rodean (`polvo/obstaculo.ts`). */
  readonly obstaculo: boolean
  /** [ESCENA 6] 5c · la mancha de contacto según el haz (`sombra/sombraDelHaz.ts`). */
  readonly sombraHaz: boolean
  /** [ESCENA 6] 5d · las motas del haz, de noche (`polvo/motas.ts`). */
  readonly motas: boolean
  /** [ESCENA 7] T2 · la formación, «la fábrica gigante» (`formacion/`). En el teléfono no hay. */
  readonly formacion: boolean
  /** [ESCENA 7] T3 · el cielo de noche: estrellas y vía láctea, detrás de la trama (`estrellas/`). */
  readonly cielo: boolean
  /** [ESCENA 7] T4 · el polvo se posa con la quietud y lo levanta el aire (`polvo/Fisica.tsx`). */
  readonly posarse: boolean
  /** [ESCENA 7] T5 · el piso vivo, un mar de bloques que responde al cursor y al pulso (`piso/`). */
  readonly pisoVivo: boolean
  /** [ESCENA 7] T6 · 6a, el aire tiene inercia: sigue derivando después de un scroll fuerte (`polvo/Aire.tsx`). */
  readonly inercia: boolean
  /** [ESCENA 7] T8 · la niebla de afuera (6c + 6d): esconde las filas de atrás y se abre con la velocidad (`niebla/`). */
  readonly niebla: boolean
  /** [ESCENA 7] T9 · 6e, el haz se enciende al caer la noche: falla y después prende (`entorno/encendido.ts`). */
  readonly hazEncendido: boolean
  /** [ESCENA 7] T10 · el polvo nítido: motas chicas y definidas; sólo las muy cercanas se desenfocan, y poco. */
  readonly nitidez: boolean
  /**
   * [ESCENA 7] T12 · el haz en el piso: las motas que cruzan la mancha de luz del haz proyectan sombritas,
   * y de noche el piso iluminado aclara apenas la cara de abajo del logo (`polvo/sombras.ts`, `entorno/Rebote.tsx`).
   */
  readonly rebote: boolean
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
  moire: true,
  polvoParejo: true,
  obstaculo: true,
  sombraHaz: true,
  motas: true,
  formacion: true,
  cielo: true,
  posarse: true,
  pisoVivo: true,
  inercia: true,
  niebla: true,
  hazEncendido: true,
  nitidez: true,
  rebote: true,
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
  moire: false,
  polvoParejo: false,
  obstaculo: false,
  sombraHaz: false,
  motas: false,
  formacion: false,
  cielo: false,
  posarse: false,
  pisoVivo: false,
  inercia: false,
  niebla: false,
  hazEncendido: false,
  nitidez: false,
  rebote: false,
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
    moire: valor('moire') !== 'hoy' && (producto || partes.has('moire')),
    polvoParejo: valor('polvo') !== 'antes' && (producto || partes.has('parejo')),
    obstaculo: producto ? valor('obstaculo') !== 'no' : partes.has('obstaculo'),
    sombraHaz: producto ? !partes.has('sombra=blanda') : partes.has('sombra=haz'),
    motas: producto ? valor('motas') !== 'no' : partes.has('motas'),
    formacion: producto ? valor('formacion') !== 'no' : partes.has('formacion'),
    cielo: producto ? valor('cielo') !== 'no' : partes.has('cielo'),
    posarse: producto ? valor('posarse') !== 'no' : partes.has('posarse'),
    pisoVivo: producto ? valor('piso') !== 'no' : partes.has('piso'),
    inercia: producto ? valor('inercia') !== 'no' : partes.has('inercia'),
    niebla: producto ? valor('niebla') !== 'no' : partes.has('niebla'),
    hazEncendido: producto ? valor('encendido') !== 'no' : partes.has('encendido'),
    nitidez: producto ? valor('nitidez') !== 'no' : partes.has('nitidez'),
    rebote: producto ? valor('rebote') !== 'no' : partes.has('rebote'),
    pruebas: pruebasPedidas(partes),
  }
}

function pruebasPedidas(partes: ReadonlySet<string>): Pruebas {
  return {
    amanecer: partes.has('amanecer'),
    fibras: partes.has('fibras'),
    fugaz: partes.has('fugaz'),
    enfoque: partes.has('enfoque'),
    grano: partes.has('grano'),
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
