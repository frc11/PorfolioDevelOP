/**
 * [CIERRE A-ter] A13 · LAS FALLAS DE LA CARGA — puro (sin DOM): lo que el arnés de estrés (`scripts-carga/`) cuenta como falla 1,5 s
 * después de llegar a una sección, sobre el estado que publica `window.__v3diag` (`publicar.ts`). Las cuatro del pedido, más las dos
 * formas en que «ninguno de los dos se ve» y «la animación no corresponde al scroll» aparecen en este sitio:
 *
 *   · `sin-imprimir`       un texto con su DOM en pantalla cuya pieza (en volumen o en textura) no está lista;
 *   · `fuente-de-respaldo` un texto impreso mientras su fuente del DOM no estaba cargada (y no se volvió a imprimir);
 *   · `letras-corridas`    un título impreso con la x de sus letras de otro momento (más de `LETRAS_CORRIDAS_EM` de lo que el DOM mide ahora);
 *   · `dom-visible`        el DOM de respaldo de un texto ya impreso, todavía a la vista (los dos a la vez; [A13b] el formulario del pie, en
 *                          volumen, deja vivo su DOM —lo que se escribe—: ahí se compara cada rótulo impreso contra su propio DOM);
 *   · `ninguno-visible`    un texto impreso, llegado y en pantalla, con su DOM apagado y su pieza sin dibujarse (ninguno de los dos);
 *   · `animacion-desfasada` un bloque animado en pantalla cuyo progreso (con el rango que midió) no es el de su rango medido ahora;
 *   · `epoca-sin-medir`    la página visible con la época de medición en cero (ningún bloque resolvió su rango: todo quieto);
 *   · `noche-desfasada`    la noche de la sala distinta de la que deja el scroll (la regla de las cuatro entradas), fuera de un viaje;
 *   · `remate-dormido`     el remate de Tu panel («Y más…») en pantalla y todavía esperando su gesto;
 *   · [B1] el túnel se fue al archivo y su falla (`tunel-desfasado`) con él; en su lugar, las del Portfolio:
 *   · `portfolio-desfasado` el selector en pantalla mostrando un paso que no es el que pide el scroll (con su histéresis), sin un salto en vuelo;
 *   · `portfolio-video`    más de un video reproduciéndose, o alguno con la sección fuera del cuadro;
 *   · `portfolio-ancla`    la página cargó con un deep link (`#portfolio-…`) y, antes de que el visitante scrollee, muestra otra tira.
 *
 * El progreso «esperado» de un bloque es el que tendría con el rango de una carga limpia (la referencia que el arnés toma desde arriba,
 * sin apuros) o, sin referencia, con su rango medido ahora en el layout (sin lo pegado ni lo transformado).
 */

export const UMBRALES_DE_LA_CARGA = {
  /** Opacidad efectiva del DOM de respaldo a partir de la cual se ve. */
  domVisible: 0.05,
  /** Lo que se le perdona al progreso de un bloque (su inercia puede ir un poco atrás). */
  progreso: 0.04,
  /** Letras corridas (em): un título con la x de cada letra de otro momento. */
  letrasEm: 0.02,
  /** Llegado y no ido (el pedido de su progreso). */
  llegado: 0.99,
  /** Lo que tarda el cambio del DOM al impreso (el fundido del DOM, ~0,4 s, y el primer cuadro): antes no cuenta como «los dos» ni «ninguno». */
  cambioMs: 1000,
} as const

export interface TextoDelDiag {
  readonly id: string
  readonly sistema: 'titulo' | 'pie' | 'tarjeta'
  /** Hace cuánto (ms) quedó listo (`null`: no se sabe, se cuenta como hace mucho). */
  readonly listoHaceMs?: number | null
  readonly listo: boolean
  readonly enPantalla: boolean
  readonly domOpacidad: number
  readonly impreso: { readonly version: number; readonly t: number; readonly fuenteCargada: boolean; readonly conectado: boolean } | null
  readonly fuenteCargadaAhora: boolean
  /** Lo más que se corrió una letra entre la impresión y ahora (em); `null` si la pieza no lo usa o no se puede medir. */
  readonly letrasCorridasEm: number | null
  /** La pieza se dibuja (`null`: no se sabe, p. ej. la textura de la tarjeta). */
  readonly dibujada: boolean | null
  /** Por su progreso pedido debería dibujarse (llegado, no ido, sin viaje ni relevo). */
  readonly debeDibujarse: boolean
  /**
   * [CIERRE A-ter] A13b · sólo el formulario del pie en volumen: lo que la placa imprime de él (rótulos, tecla, relieve de la tarjeta), cada uno con
   * la opacidad de su propio DOM. El formulario entero queda vivo a propósito (los campos, el foco, el lector), así que su opacidad no dice nada
   * de si un texto está doble; sin esto (`undefined`), se mira el DOM del texto entero.
   */
  readonly rotulos?: readonly RotuloDelDiag[]
}

export interface RotuloDelDiag {
  readonly rotulo: string
  readonly domOpacidad: number
}

export interface BloqueDelDiag {
  readonly id: string
  readonly enPantalla: boolean
  readonly medido: boolean
  /** El progreso con el rango que el bloque midió y el que da su rango medido ahora (sin lo pegado ni lo transformado). */
  readonly progreso: number
  readonly esperado: number
}

export interface EstadoDelDiag {
  readonly t: number
  readonly visible: boolean
  readonly scrollY: number
  readonly viaje: string | null
  readonly epoca: { readonly epoca: number; readonly alto: number }
  readonly textos: readonly TextoDelDiag[]
  readonly bloques: readonly BloqueDelDiag[]
  /** La noche puesta y la que deja el scroll (`null`: no se evalúa: tapada, el día del final o sin la gota). */
  readonly noche: { readonly actual: number; readonly esperada: number | null }
  readonly remate: { readonly enPantalla: boolean; readonly estado: string | null } | null
  /**
   * [B1] El Portfolio (el túnel se fue al archivo): el paso que muestra el selector y el que pide el scroll (con su histéresis, desde
   * el mostrado), si hay un salto en vuelo (ahí el mostrado ya es el destino), cuántos videos se reproducen, y el ancla con la que
   * cargó la página mientras el visitante no scrolleó (la tira que muestra y la que pidió el ancla).
   */
  readonly portfolio: {
    readonly enPantalla: boolean
    readonly enVuelo: boolean
    readonly pasoMostrado: number
    readonly pasoPedido: number
    readonly videos: number
    readonly ancla: { readonly id: string; readonly tira: number; readonly esperada: number } | null
  } | null
}

export type TipoDeFalla = 'sin-imprimir' | 'fuente-de-respaldo' | 'letras-corridas' | 'dom-visible' | 'ninguno-visible' | 'animacion-desfasada' | 'epoca-sin-medir' | 'noche-desfasada' | 'remate-dormido' | 'portfolio-desfasado' | 'portfolio-video' | 'portfolio-ancla'

export interface FallaDeLaCarga {
  readonly tipo: TipoDeFalla
  readonly id: string
  readonly detalle: string
}

const f2 = (x: number): string => x.toFixed(2)

/** Los umbrales, cualquier número (para los controles de s75). */
export type UmbralesDeLaCarga = { readonly [K in keyof typeof UMBRALES_DE_LA_CARGA]: number }

/** Las fallas de un estado (vacío: la carga está bien). */
export function fallasDe(e: EstadoDelDiag, u: UmbralesDeLaCarga = UMBRALES_DE_LA_CARGA): FallaDeLaCarga[] {
  const fallas: FallaDeLaCarga[] = []
  const falla = (tipo: TipoDeFalla, id: string, detalle: string): void => {
    fallas.push({ tipo, id, detalle })
  }
  if (!e.visible) return fallas
  for (const x of e.textos) {
    const asentado = (x.listoHaceMs ?? Number.POSITIVE_INFINITY) > u.cambioMs
    if (x.enPantalla && !x.listo) falla('sin-imprimir', x.id, `DOM ${f2(x.domOpacidad)}`)
    if (x.listo && x.impreso !== null && !x.impreso.fuenteCargada) falla('fuente-de-respaldo', x.id, `impreso a los ${String(x.impreso.t)} ms (v${String(x.impreso.version)}); ahora ${x.fuenteCargadaAhora ? 'cargada' : 'sin cargar'}`)
    if (x.listo && x.letrasCorridasEm !== null && x.letrasCorridasEm > u.letrasEm) falla('letras-corridas', x.id, `${x.letrasCorridasEm.toFixed(3)} em`)
    if (x.listo && asentado && x.enPantalla) {
      if (x.rotulos === undefined) {
        if (x.domOpacidad > u.domVisible) falla('dom-visible', x.id, `DOM ${f2(x.domOpacidad)}`)
      } else {
        for (const r of x.rotulos) if (r.domOpacidad > u.domVisible) falla('dom-visible', x.id, `rótulo «${r.rotulo}» DOM ${f2(r.domOpacidad)}`)
      }
    }
    if (x.listo && asentado && x.enPantalla && x.debeDibujarse && x.domOpacidad <= u.domVisible && x.dibujada === false && e.viaje === null) falla('ninguno-visible', x.id, 'DOM apagado y la pieza sin dibujarse')
  }
  if (e.epoca.alto === 0 && e.bloques.length > 0) falla('epoca-sin-medir', 'epoca', `época ${String(e.epoca.epoca)} con el alto en 0`)
  if (e.viaje === null) {
    for (const b of e.bloques) {
      if (b.enPantalla && Math.abs(b.progreso - b.esperado) > u.progreso) falla('animacion-desfasada', b.id, `${b.medido ? 'medido' : 'SIN MEDIR'}: ${f2(b.progreso)} contra ${f2(b.esperado)}`)
    }
    if (e.noche.esperada !== null && Math.abs(e.noche.actual - e.noche.esperada) > 0.5) falla('noche-desfasada', 'noche', `${f2(e.noche.actual)} contra ${f2(e.noche.esperada)}`)
    if (e.remate !== null && e.remate.enPantalla && e.remate.estado === 'espera') falla('remate-dormido', 'remate', 'en pantalla y esperando su gesto')
    const p = e.portfolio
    if (p !== null && p.enPantalla && !p.enVuelo && p.pasoMostrado !== p.pasoPedido) falla('portfolio-desfasado', 'portfolio', `muestra el paso ${String(p.pasoMostrado)} y el scroll pide el ${String(p.pasoPedido)}`)
    if (p !== null && (p.videos > 1 || (p.videos > 0 && !p.enPantalla))) falla('portfolio-video', 'portfolio', `${String(p.videos)} videos reproduciéndose${p.enPantalla ? '' : ' con la sección fuera del cuadro'}`)
    if (p !== null && p.ancla !== null && !p.enVuelo && p.ancla.tira !== p.ancla.esperada) falla('portfolio-ancla', p.ancla.id, `muestra la tira ${String(p.ancla.tira)} y el ancla pidió la ${String(p.ancla.esperada)}`)
  }
  return fallas
}
