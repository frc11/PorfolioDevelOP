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
 * bokeh (5a; [ESCENA 9] T1: borrado, código y bandera), la mancha de contacto según el haz (5c, `sombraHaz`)
 * y las motas del haz de noche (5d, `motas`). Y el pulso ya no se apaga sobre las cajas de texto: la máscara se borró.
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
 * **[ESCENA 8] El veredicto de ESCENA 7**: la estrella fugaz pasa al producto (`fugaz`, se apaga con
 * `fugaz=no`); el foco que busca, las fibras, el grano y las sombras de las motas se borraron (código y
 * banderas). La luz que rebota (`rebote`) se queda.
 *
 * **[ESCENA 8] Encendidos**, además: la trama anclada al piso (T2, `limite`; el banco la suelta con
 * `limite=no`) y el amanecer atado al scroll (T3, `amanecer`; era la prueba T11 de ESCENA 7; el banco lo
 * apaga con `amanecer=no`).
 *
 * **[CALIDAD 1] A2** · el cielo de día (T4 de ESCENA 8) pasa al producto en su variante elegida, el pintado celeste
 * (`cieloDeDia`; el banco lo apaga con `cielo-dia=no`). Las otras cinco se borraron, código y banderas. El celeste
 * rompe la regla monocroma de DIRECCION-ESCENA: es una excepción aprobada (ESTADO-ESCENA.md).
 *
 * **[ESCENA 10] T1 · el cierre de ESCENA 9**: pasan al producto el logo de noche en su variante clara (`logoDeNoche`; el
 * banco lo apaga con `logo-noche=no`), el negro satinado con los reflejos del estudio (`materialDelLogo`, `material=no`),
 * la sombra del logo sobre el piso vivo (`sombraDelLogo`, `sombra-logo=no`), el tono ACES compensado (sin bandera: es el
 * tono del lienzo, `tono.ts`) y el scroll suave de nk (`_componentes/lenisDeNk.ts`). El bloom, el brillante, AgX, el
 * sedoso, las otras dos variantes del logo de noche y los títulos de ESCENA 9 se borraron, código y banderas.
 *
 * **[CIERRE RETOQUE 3D] P1** · el polvo en facetas (la variante b del RETOQUE 3D, `facetas`; el banco lo apaga con
 * `facetas=no`). La a y la c se borraron, código y bandera.
 *
 * **Las pruebas** (`Pruebas`) van apagadas en el producto y en la base; sólo el banco (o la URL) las prende.
 *
 * El banco de medición pisa todo esto ANTES de cargar la página, sin tocar el archivo:
 *
 *     window.__entornoDeLaEscena = 'producto'                       → estas banderas, y la escena publica su estado
 *     window.__entornoDeLaEscena = 'base'                           → la escena de `escena-base-limpia`
 *     window.__entornoDeLaEscena = 'producto,cielo-dia=no'          → el producto sin el cielo de día
 *     window.__entornoDeLaEscena = 'producto,moire=hoy,polvo=antes' → el producto con el moiré y el polvo de antes
 *     window.__entornoDeLaEscena = 'producto,sombra=blanda,motas=no'  → sin 5c ni 5d
 *     window.__entornoDeLaEscena = 'E1,E6,haz=sutil'                → sólo esas, con esos niveles
 */

export const IDEAS_DEL_ENTORNO = ['E1', 'E4', 'E6', 'E7'] as const

export type IdeaDelEntorno = (typeof IDEAS_DEL_ENTORNO)[number]

export type NivelDelHaz = 'sutil' | 'medio'

/**
 * Las pruebas del banco. [CALIDAD 1] Ninguna: el cielo de día pasó al producto (A2). [ESCENA 9] Las de ese sprint, para
 * que decida Valentino: cada una con su bandera, apagada en el producto. [ESCENA 10] T1: decididas; el antialiasing de
 * prueba (TAA u 8 muestras) también: queda el del lienzo de CALIDAD 1, y la bandera `aa=` se borró. T3: los títulos de
 * volumen, para que decida Valentino. [3D Y SONIDO] T1: los títulos pasaron al producto (`Entorno.titulos`); la prueba
 * que queda es el sonido (T2). [RETOQUE 3D] El sonido pasó al producto (su bandera se borró). [CIERRE] El túnel lento se borró (código y bandera) y el polvo en facetas pasó al producto (`facetas`). [RONDA 2] F4: el filo de los títulos de día (`filo`). [RETOQUE DEL PIE] P1: la b pasó al producto; la a, la c y la bandera se borraron. P2: el pie de antes (`pie=antes`). P3: dos pruebas del pie; [NOCTURNO] A2: la llegada se borró y la onda pasó al producto.
 */
/** [ESCENA 10] T3 · los dos materiales de los títulos de volumen: el negro satinado del logo y blanco. */
export type TitulosDeVolumen = 'negro' | 'blanco'

export interface Pruebas {
  /**
   * [RETOQUE DEL PIE] P2 · `pie=antes`: el pie de antes de RONDA 2 (las teclas de CSS 3D), para comparar con el de volumen.
   * P3 · [NOCTURNO] A2: `pie=llegada` se borró y `pie=onda` pasó al producto (el piso ondea debajo de la pieza del mouse).
   */
  readonly pie: 'antes' | 'no'
  /** [PULIDO 1] P2 · `rebobinado=minimo`: la otra lectura del pedido (desde cualquier punto, al menos 1 s; el producto es proporcional). */
  readonly rebobinado: 'minimo' | 'no'
  /** [PULIDO 1] P6 · `angel=asentado`: el logo del intro se asienta en sus últimos ~120 ms (el producto: lineal puro). */
  readonly angel: 'asentado' | 'no'
  /** [PULIDO 1] P1 · la intensidad del brillo del piso en el final: `suave` o `fuerte`; `no` es la del producto (`medio`, también en la URL). */
  readonly brillo: 'suave' | 'fuerte' | 'no'
  /** [PULIDO 1] P17 · las variantes del CTA del final para elegir (`no`: el de hoy, el producto). */
  readonly cta: 'a' | 'b' | 'c' | 'd' | 'no'
}

/**
 * Todo apagado: así van en el producto y en la base. [PASADA FINAL] B2: `panelborde=a|b` se borró (las demos de Tu panel van
 * con esquinas redondeadas y sombra). [AJUSTES FINALES] A1: `portfolio=e9|e10|3ds|lejos` se borró: la de ESCENA 10 (e10) es
 * la del producto (`_lib/titulos3d/registro.ts`, `camaraDeEntonces.ts`). A2: `sombratitulos=si` se borró: la sombra de los
 * títulos pasó al producto (`sombra/deLosTitulos.ts`). A5: `cabeza=libre` se borró: la cabeza de Servicios libre del menú
 * pasó al producto (`_secciones/servicios/angosto.tsx`). [CIERRE] 2B: `contactofondo=blur|blanco` se borró: el contacto como
 * placa con el fondo desenfocado pasó al producto (`_chrome/contacto/placa.ts`); el fundido a blanco se fue. [EL ENCASTRE]
 * 1A: `tunelk=1|1.3|1.8` se borró: el túnel de escritorio quedó en k = 1,8 (`_secciones/trabajos/ritmo.ts`). [PULIDO 2] 1:
 * `encastre=desvanece` se borró: abajo de 1024 el final corre detrás del pie, sin escenario (`escena/final/`). 2:
 * `vuelta=corta` se borró: en un viaje el final vuelve con el rebobinado de P2 comprimido (`recorridoDelFinal.ts`).
 */
export const PRUEBAS_APAGADAS: Pruebas = { pie: 'no', rebobinado: 'no', angel: 'no', brillo: 'no', cta: 'no' }

/** [PULIDO 1] Las pruebas del sprint que también se piden sueltas en la URL (`/v3?angel=asentado`), además de `?pruebas=`. */
export const PRUEBAS_SUELTAS = ['rebobinado', 'angel', 'brillo', 'cta'] as const

/** Lo que vale de una lista, o `no`. */
function unoDe<T extends string>(opciones: readonly T[], v: string | undefined): T | 'no' {
  return opciones.find((o) => o === v) ?? 'no'
}

/** Las pruebas de un pedido (con cualquier base: van aparte del producto). */
function pruebasDe(valor: (clave: string) => string | undefined): Pruebas {
  return {
    pie: unoDe<'antes'>(['antes'], valor('pie')),
    rebobinado: unoDe<'minimo'>(['minimo'], valor('rebobinado')),
    angel: unoDe<'asentado'>(['asentado'], valor('angel')),
    brillo: unoDe<'suave' | 'fuerte'>(['suave', 'fuerte'], valor('brillo')),
    cta: unoDe<'a' | 'b' | 'c' | 'd'>(['a', 'b', 'c', 'd'], valor('cta')),
  }
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
  /** [ESCENA 9] T4 · los bloques del piso vivo se dibujan de adelante hacia atrás (`piso/ordenDeLosBloques.ts`). */
  readonly ordenDelPiso: boolean
  /** [ESCENA 7] T6 · 6a, el aire tiene inercia: sigue derivando después de un scroll fuerte (`polvo/Aire.tsx`). */
  readonly inercia: boolean
  /** [ESCENA 7] T8 · la niebla de afuera (6c + 6d): esconde las filas de atrás y se abre con la velocidad (`niebla/`). */
  readonly niebla: boolean
  /** [ESCENA 7] T9 · 6e, el haz se enciende al caer la noche: falla y después prende (`entorno/encendido.ts`). */
  readonly hazEncendido: boolean
  /** [ESCENA 7] T10 · el polvo nítido: motas chicas y definidas; sólo las muy cercanas se desenfocan, y poco. */
  readonly nitidez: boolean
  /**
   * [ESCENA 7] T12 · la luz que rebota: de noche el piso iluminado por el haz aclara apenas la cara de abajo
   * del logo (`entorno/Rebote.tsx`). [ESCENA 8] Las sombras de las motas se borraron.
   */
  readonly rebote: boolean
  /** [ESCENA 7] T13 · la estrella fugaz, de noche, afuera de la trama (`estrellas/Fugaz.tsx`). [ESCENA 8] encendida. */
  readonly fugaz: boolean
  /** [ESCENA 8] T2 · la trama anclada al piso: baja a pleno hasta el piso, con zócalo y contacto (`moire/limite.ts`). */
  readonly limite: boolean
  /** [ESCENA 7] T11 · el amanecer: el día entra desde afuera y por la trama (`amanecer/`). [ESCENA 8] T3: encendido y atado al scroll. */
  readonly amanecer: boolean
  /** [ESCENA 8] T4 · el cielo de día (`cieloDeDia/`). [CALIDAD 1] A2: el pintado celeste, encendido. */
  readonly cieloDeDia: boolean
  /** [ESCENA 10] T1 · el logo de noche: costados negros y tapas con un filo claro (`logoDeNoche.ts`; era T2 de ESCENA 9). */
  readonly logoDeNoche: boolean
  /** [ESCENA 10] T1 · el negro satinado con los reflejos del estudio (`estudio.ts`; era T3 de ESCENA 9). */
  readonly materialDelLogo: boolean
  /** [ESCENA 10] T1 · la sombra del logo sobre el piso vivo, de día (`sombra/delLogo.ts`; era T3 de ESCENA 9). */
  readonly sombraDelLogo: boolean
  /** [CIERRE RETOQUE 3D] P1 · el polvo en facetas, la variante b del RETOQUE 3D (`polvo/facetas.ts`); va con `nitidez`. */
  readonly facetas: boolean
  /**
   * [3D Y SONIDO] T1 · los títulos de volumen de Portfolio y de la frase de Por qué develOP (`escena/titulos3d/`; eran T3
   * de ESCENA 10): el negro satinado del logo. `titulos=blanco` (con banco o en la URL) los pide blancos, para comparar;
   * `titulos=no` los apaga.
   */
  readonly titulos: TitulosDeVolumen | 'no'
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
  sombraHaz: true,
  motas: true,
  formacion: true,
  cielo: true,
  posarse: true,
  pisoVivo: true,
  ordenDelPiso: true,
  inercia: true,
  niebla: true,
  hazEncendido: true,
  nitidez: true,
  rebote: true,
  fugaz: true,
  limite: true,
  amanecer: true,
  cieloDeDia: true,
  logoDeNoche: true,
  materialDelLogo: true,
  sombraDelLogo: true,
  facetas: true,
  titulos: 'negro',
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
  sombraHaz: false,
  motas: false,
  formacion: false,
  cielo: false,
  posarse: false,
  pisoVivo: false,
  ordenDelPiso: false,
  inercia: false,
  niebla: false,
  hazEncendido: false,
  nitidez: false,
  rebote: false,
  fugaz: false,
  limite: false,
  amanecer: false,
  cieloDeDia: false,
  logoDeNoche: false,
  materialDelLogo: false,
  sombraDelLogo: false,
  facetas: false,
  titulos: 'no',
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
    sombraHaz: producto ? !partes.has('sombra=blanda') : partes.has('sombra=haz'),
    motas: producto ? valor('motas') !== 'no' : partes.has('motas'),
    formacion: producto ? valor('formacion') !== 'no' : partes.has('formacion'),
    cielo: producto ? valor('cielo') !== 'no' : partes.has('cielo'),
    posarse: producto ? valor('posarse') !== 'no' : partes.has('posarse'),
    pisoVivo: producto ? valor('piso') !== 'no' : partes.has('piso'),
    ordenDelPiso: producto ? valor('orden-piso') !== 'no' : partes.has('orden-piso'),
    inercia: producto ? valor('inercia') !== 'no' : partes.has('inercia'),
    niebla: producto ? valor('niebla') !== 'no' : partes.has('niebla'),
    hazEncendido: producto ? valor('encendido') !== 'no' : partes.has('encendido'),
    nitidez: producto ? valor('nitidez') !== 'no' : partes.has('nitidez'),
    rebote: producto ? valor('rebote') !== 'no' : partes.has('rebote'),
    fugaz: producto ? valor('fugaz') !== 'no' : partes.has('fugaz'),
    limite: producto ? valor('limite') !== 'no' : partes.has('limite'),
    amanecer: producto ? valor('amanecer') !== 'no' : partes.has('amanecer'),
    cieloDeDia: producto ? valor('cielo-dia') !== 'no' : partes.has('cielo-dia'),
    logoDeNoche: producto ? valor('logo-noche') !== 'no' : partes.has('logo-noche'),
    materialDelLogo: producto ? valor('material') !== 'no' : partes.has('material'),
    sombraDelLogo: producto ? valor('sombra-logo') !== 'no' : partes.has('sombra-logo'),
    facetas: producto ? valor('facetas') !== 'no' : partes.has('facetas'),
    titulos: producto ? (valor('titulos') === 'no' ? 'no' : valor('titulos') === 'blanco' ? 'blanco' : ENTORNO.titulos) : unoDe<TitulosDeVolumen>(['negro', 'blanco'], valor('titulos')),
    pruebas: pruebasDe(valor),
  }
}

let resuelto: Entorno | null = null

/**
 * [PULIDO 1] El pedido de la URL, sin banco: lo de `?pruebas=` y las pruebas del sprint sueltas (`?cta=a`), sobre el
 * producto; `null` si no pide nada. Pura: el invariante la prueba sin navegador.
 */
export function pedidoDeLaUrl(busqueda: string): string | null {
  const consulta = new URLSearchParams(busqueda)
  const sueltas = PRUEBAS_SUELTAS.map((k) => {
    const v = consulta.get(k)
    return v === null ? null : `${k}=${v}`
  })
  const lista = [consulta.get('pruebas'), ...sueltas].filter((x): x is string => x !== null && x !== '').join(',')
  return lista === '' ? null : `producto,${lista}`
}

/**
 * Las banderas de esta carga: las de arriba, o las que pidió el banco antes de cargar. Se resuelve
 * UNA vez y queda fija, para que todos los componentes vean la misma escena.
 */
export function entornoDeLaEscena(): Entorno {
  if (resuelto !== null) return resuelto
  if (typeof window === 'undefined') return ENTORNO
  const pedido = (window as VentanaConEntorno).__entornoDeLaEscena
  if (typeof pedido === 'string') resuelto = entornoPedido(pedido)
  else {
    // [ESCENA 9] Sin banco, las pruebas (y sólo ellas) se piden en la URL para mirarlas en vivo: `/v3?pruebas=pie=antes`.
    // [3D Y SONIDO] T1: y el material de los títulos (`titulos=blanco`, o `titulos=no`), que pasaron al producto.
    // [PULIDO 1] y las del sprint, también sueltas: `/v3?cta=a`, `/v3?brillo=fuerte` (`pedidoDeLaUrl`).
    const lista = pedidoDeLaUrl(window.location.search)
    const pedido = lista === null ? null : entornoPedido(lista)
    resuelto = pedido === null ? ENTORNO : { ...ENTORNO, titulos: pedido.titulos, pruebas: pedido.pruebas }
  }
  return resuelto
}

/** ¿Hay un banco mirando? Sólo entonces la escena publica su estado para que lo lea. */
export function hayBanco(): boolean {
  return typeof window !== 'undefined' && typeof (window as VentanaConEntorno).__entornoDeLaEscena === 'string'
}
