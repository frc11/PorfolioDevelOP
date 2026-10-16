/**
 * [CIERRE A-ter] A13 · LAS FALLAS DE LA CARGA — puro (sin DOM): lo que el arnés de estrés (`scripts-carga/`) cuenta como falla 1,5 s
 * después de llegar a una sección, sobre el estado que publica `window.__v3diag` (`publicar.ts`). Las cuatro del pedido, más las dos
 * formas en que «ninguno de los dos se ve» y «la animación no corresponde al scroll» aparecen en este sitio:
 *
 *   · `sin-imprimir`       un texto con su DOM en pantalla cuya pieza (en volumen o en textura) no está lista;
 *   · `fuente-de-respaldo` un texto impreso mientras su fuente del DOM no estaba cargada (y no se volvió a imprimir);
 *   · `letras-corridas`    un título impreso con la x de sus letras de otro momento (más de `LETRAS_CORRIDAS_EM` de lo que el DOM mide ahora);
 *   · `dom-visible`        el DOM de respaldo de un texto ya impreso, todavía a la vista (los dos a la vez);
 *   · `ninguno-visible`    un texto impreso, llegado y en pantalla, con su DOM apagado y su pieza sin dibujarse (ninguno de los dos);
 *   · `animacion-desfasada` un bloque animado en pantalla cuyo progreso (con el rango que midió) no es el de su rango medido ahora;
 *   · `epoca-sin-medir`    la página visible con la época de medición en cero (ningún bloque resolvió su rango: todo quieto);
 *   · `noche-desfasada`    la noche de la sala distinta de la que deja el scroll (la regla de las cuatro entradas), fuera de un viaje;
 *   · `remate-dormido`     el remate de Tu panel («Y más…») en pantalla y todavía esperando su gesto;
 *   · `tunel-desfasado`    el túnel de Trabajos en pantalla, quieto o lejos de lo que pide el scroll (las fotos quietas).
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
  /** Lo que el túnel puede ir atrás de lo que pide el scroll (fracción de su tramo). */
  tunel: 0.05,
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
  readonly tunel: { readonly enPantalla: boolean; readonly corriendo: boolean; readonly mostrado: number; readonly pedido: number } | null
}

export type TipoDeFalla = 'sin-imprimir' | 'fuente-de-respaldo' | 'letras-corridas' | 'dom-visible' | 'ninguno-visible' | 'animacion-desfasada' | 'epoca-sin-medir' | 'noche-desfasada' | 'remate-dormido' | 'tunel-desfasado'

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
    if (x.listo && asentado && x.enPantalla && x.domOpacidad > u.domVisible) falla('dom-visible', x.id, `DOM ${f2(x.domOpacidad)}`)
    if (x.listo && asentado && x.enPantalla && x.debeDibujarse && x.domOpacidad <= u.domVisible && x.dibujada === false && e.viaje === null) falla('ninguno-visible', x.id, 'DOM apagado y la pieza sin dibujarse')
  }
  if (e.epoca.alto === 0 && e.bloques.length > 0) falla('epoca-sin-medir', 'epoca', `época ${String(e.epoca.epoca)} con el alto en 0`)
  if (e.viaje === null) {
    for (const b of e.bloques) {
      if (b.enPantalla && Math.abs(b.progreso - b.esperado) > u.progreso) falla('animacion-desfasada', b.id, `${b.medido ? 'medido' : 'SIN MEDIR'}: ${f2(b.progreso)} contra ${f2(b.esperado)}`)
    }
    if (e.noche.esperada !== null && Math.abs(e.noche.actual - e.noche.esperada) > 0.5) falla('noche-desfasada', 'noche', `${f2(e.noche.actual)} contra ${f2(e.noche.esperada)}`)
    if (e.remate !== null && e.remate.enPantalla && e.remate.estado === 'espera') falla('remate-dormido', 'remate', 'en pantalla y esperando su gesto')
    const t = e.tunel
    if (t !== null && t.enPantalla && (!t.corriendo || Math.abs(t.mostrado - t.pedido) > u.tunel)) falla('tunel-desfasado', 'tunel', `${t.corriendo ? 'corre' : 'QUIETO'}: ${f2(t.mostrado)} contra ${f2(t.pedido)}`)
  }
  return fallas
}
