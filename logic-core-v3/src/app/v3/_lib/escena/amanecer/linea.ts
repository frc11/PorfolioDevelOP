import type { BloqueOpaco } from '../nocheDisparada'

/**
 * [ESCENA 7] T11 · EL AMANECER — puro: cuándo arranca y qué pasa en cada momento.
 * [ESCENA 8] T3: encendido en el producto y ATADO AL SCROLL (ver «El avance», abajo).
 *
 * **Qué es.** La vuelta del día como un EVENTO DE LUZ (la 6g de ESCENA 6 más los rayos por la trama). El
 * día entra desde afuera, en este orden:
 *
 * 1. **Se apagan las estrellas** (y la vía láctea): la sala sigue de noche.
 * 2. **La luz nace en el horizonte, detrás de la formación**: un resplandor bajo en todo el borde del
 *    cielo; las copias quedan a contraluz y la niebla de afuera se ilumina desde atrás.
 * 3. **El frente de luz avanza fila por fila**, de las lejanas a las cercanas: cada copia que alcanza pasa
 *    de silueta a copia de día.
 * 4. **Entra por los cuadrados de la trama**: el sol bajo del amanecer pasa por los huecos y deja haces
 *    en el aire de la sala y cuadros de luz en el piso, como una persiana.
 * 5. **Llega al piso vivo y, por último, al logo.**
 *
 * **El momento (la propuesta).** El mismo de 6g, que es el único en que no se rompe nada: cuando el borde
 * de abajo de Tu panel sube y deja ver la sala (`visible`). Bajando, la noche sigue hasta ahí, y ahí
 * arranca el amanecer. Subiendo, la noche vuelve escondida (la compuerta de siempre decide el regreso).
 *
 * **El avance [ESCENA 8] T3.** Ya no es un reloj que se acelera: el amanecer es un avance de 0 a 1 que
 * PIDE el scroll —el borde de Tu panel de `visible` a `hasta` del cuadro (`avanceDelScroll`)— y el que se
 * MUESTRA lo persigue con una velocidad tope (`perseguir`): de punta a punta tarda por lo menos `minimoS`.
 * Con un scroll lento el amanecer sigue al scroll; con uno rápido se reproduce entero a esa velocidad,
 * alcanzando al scroll; hacia atrás, igual (la noche vuelve con el mismo guion al revés). En ESCENA 7 un
 * scroll rápido lo terminaba en un parpadeo (el reloj ×3 y el tope del título) y casi no se veía.
 *
 * **El texto no queda sobre la sala a oscuras.** La tinta de «Por qué develOP» es de día. En escritorio el
 * texto del escenario espera al día (`diaParaElTexto`): la frase, que va sobre las paredes, cuando el frente
 * pasó la trama; los valores y el CTA, que van más abajo, sobre el piso, cuando el frente pasó el piso (medido:
 * con el piso todavía oscuro la tinta da 1,4 a 3,4). Abajo de 1024 el texto va con la mezcla por diferencia y se
 * lee sobre cualquier fondo. El pie es compartido y no espera: si queda a la vista antes, el amanecer salta a
 * lo legible (`texto.abajo[1]`). Con menos movimiento no hay evento: el día llega de una vez en la compuerta.
 *
 * **Cómo se pinta.** La luz de la sala es una sola (el arco). Hasta `cambio` la sala sigue de noche (se
 * sostiene la noche) y el horizonte se enciende encima. En `cambio` la sala pasa a día, y lo que el
 * frente todavía no alcanzó se oscurece al tono de la noche (el papel, el piso de abajo, las copias, la
 * trama, los bloques; el polvo guarda su blanco de noche y el logo su gris de noche hasta que el frente
 * los alcanza, así el logo es lo último). El cielo pasa de noche a día desde el horizonte hacia arriba.
 */
export const AMANECER = {
  /** Qué fracción del cuadro tiene que dejar ver Tu panel (su borde de abajo, desde arriba): la compuerta, y donde arranca el avance. */
  visible: 0.85,
  /** [ESCENA 8] T3 · Dónde termina el avance: el borde de Tu panel ya arriba del cuadro (el escenario del final clavado). */
  hasta: -0.15,
  /** [ESCENA 8] T3 · Lo más rápido que corre, de punta a punta (s): con un scroll rápido se reproduce entero a esta velocidad. */
  minimoS: 2.5,
  /**
   * [ESCENA 8] T3 · El texto del final aparece entre dos avances: la frase (sobre las paredes) cuando el frente ya
   * pasó la trama; lo de abajo (los valores, el CTA y el pie, sobre el piso) cuando ya pasó el piso.
   */
  texto: { frase: [0.64, 0.72], abajo: [0.82, 0.9] },
  /** Las estrellas se apagan (s). */
  estrellas: [0, 0.9],
  /** El resplandor del horizonte nace y queda (s); se va al final. */
  resplandor: [0.5, 2.4],
  /** Hasta acá la sala sigue de noche (s). */
  cambio: 2.4,
  /** El frente (s, radio): por la formación, por la trama y el piso, y el logo. */
  frente: [
    [2.4, 300],
    [4.6, 46],
    [6.4, 4],
    [7.0, -6],
  ],
  /** Los haces por la trama: nacen, pican y se van (s). */
  rayos: [4.1, 4.9, 6.4],
  /** Todo asentado (s). */
  final: 7.6,
  /** El ancho del frente (u) y el tono de lo que todavía no alcanzó (codificado, sobre el papel). */
  ancho: 6,
  oscuro: 0.2,
  /** El sol del amanecer: detrás de la formación que se ve desde el pie (azimut y elevación, grados). */
  sol: { azimut: 180, elevacion: 9 },
} as const

const suave = (u: number): number => {
  const x = Math.min(1, Math.max(0, u))
  return x * x * (3 - 2 * x)
}

/** El radio del frente a `s` segundos (afuera de todo antes, más adentro que el logo después). */
export function frenteEn(s: number): number {
  const f = AMANECER.frente
  if (s <= f[0][0]) return f[0][1]
  for (let i = 1; i < f.length; i += 1) {
    if (s <= f[i][0]) return f[i - 1][1] + (f[i][1] - f[i - 1][1]) * suave((s - f[i - 1][0]) / (f[i][0] - f[i - 1][0]))
  }
  return f[f.length - 1][1]
}

export interface MomentoDelAmanecer {
  /** Cuánto se ven las estrellas (1 a 0). */
  readonly estrellas: number
  /** El resplandor del horizonte (0 a 1). */
  readonly resplandor: number
  /** ¿La sala sigue de noche? */
  readonly sostieneLaNoche: boolean
  /** ¿El frente barre (la sala ya es de día y lo no alcanzado se oscurece)? */
  readonly barre: boolean
  readonly frente: number
  /** Los haces por la trama (0 a 1). */
  readonly rayos: number
  /** El cielo, de noche a día (0 a 1), desde que la sala cambia. */
  readonly cielo: number
}

/** [CALIDAD 1] B2 · un momento escribible, para la escena (que lo llena en cada cuadro sin reservar). */
export type MomentoVivo = { -readonly [K in keyof MomentoDelAmanecer]: MomentoDelAmanecer[K] }

/** Cuándo el frente pasa por las primeras filas (una bisección: se hace una vez, no en cada cuadro). */
let frenteEnLasPrimeras = Number.NaN

/** Qué pasa a `s` segundos de empezar el amanecer. Con `destino`, lo escribe ahí ([CALIDAD 1] B2). */
export function momentoEn(s: number, destino?: MomentoVivo): MomentoDelAmanecer {
  const a = AMANECER
  const [r0, r1, r2] = a.rayos
  if (Number.isNaN(frenteEnLasPrimeras)) frenteEnLasPrimeras = frenteHasta(46)
  const rayos = s < r0 || s > r2 ? 0 : s < r1 ? suave((s - r0) / (r1 - r0)) : 1 - suave((s - r1) / (r2 - r1))
  const resplandor = s < a.resplandor[0] ? 0 : s < a.resplandor[1] ? suave((s - a.resplandor[0]) / (a.resplandor[1] - a.resplandor[0])) : 1 - suave((s - frenteEnLasPrimeras) / (a.final - frenteEnLasPrimeras))
  const m = destino ?? { estrellas: 0, resplandor: 0, sostieneLaNoche: false, barre: false, frente: 0, rayos: 0, cielo: 0 }
  m.estrellas = 1 - suave((s - a.estrellas[0]) / (a.estrellas[1] - a.estrellas[0]))
  m.resplandor = resplandor
  m.sostieneLaNoche = s < a.cambio
  m.barre = s >= a.cambio && s < a.final
  m.frente = frenteEn(s)
  m.rayos = rayos
  m.cielo = suave((s - a.cambio) / (a.final - a.cambio))
  return m
}

/** Cuándo el frente llega al radio `r` (s). */
export function frenteHasta(r: number): number {
  const f = AMANECER.frente
  for (let i = 1; i < f.length; i += 1) {
    if (r >= f[i][1]) {
      // Bisección sobre el tramo (el frente baja con el tiempo).
      let a: number = f[i - 1][0]
      let b: number = f[i][0]
      for (let k = 0; k < 40; k += 1) {
        const m = (a + b) / 2
        if (frenteEn(m) > r) a = m
        else b = m
      }
      return (a + b) / 2
    }
  }
  return f[f.length - 1][0]
}

/**
 * La compuerta: prende sólo cuando Tu panel deja ver la sala; apaga sólo cuando la de siempre apaga (con el
 * bloque tapando). `antes` es el estado del cuadro anterior; `deSiempre`, lo que dice la compuerta de hoy.
 */
export function amanecerEn(b: BloqueOpaco, antes: boolean, deSiempre: boolean): boolean {
  const seVe = b.tuPanel.pie < b.alto * AMANECER.visible
  return antes ? seVe || deSiempre : seVe
}

/** [ESCENA 8] T3 · El avance que pide el scroll (0 a 1): dónde está el borde de abajo de Tu panel (px desde arriba del cuadro). */
export function avanceDelScroll(pieDeTuPanel: number, alto: number): number {
  const desde = AMANECER.visible * alto
  const hasta = AMANECER.hasta * alto
  return Math.min(1, Math.max(0, (desde - pieDeTuPanel) / (desde - hasta)))
}

/** [ESCENA 8] T3 · Un paso del avance que se muestra: persigue al pedido, a lo sumo `dt / minimoS`, en las dos direcciones. */
export function perseguir(mostrado: number, pedido: number, dt: number): number {
  const tope = dt / AMANECER.minimoS
  return mostrado + Math.max(-tope, Math.min(tope, pedido - mostrado))
}

/** [ESCENA 8] T3 · Cuánto puede mostrarse el texto del final (tinta de día) con este avance: 0 hasta que su fondo está iluminado. */
export function diaParaElTexto(avance: number, donde: keyof typeof AMANECER.texto): number {
  const [a, b] = AMANECER.texto[donde]
  return suave((avance - a) / (b - a))
}

/** [ESCENA 8] T3 · Un cuadro más largo que esto (s) es la escena que vuelve de estar suspendida (detrás del bloque opaco). */
export const PAUSA_S = 0.5

/** Lo que decide el avance de un cuadro, además del pedido. */
export interface CuadroDelAmanecer {
  /** La compuerta recién prendió el día. */
  readonly recien: boolean
  /** Es de los primeros cuadros de la escena: una carga ya adentro del final. */
  readonly carga: boolean
  /** Menos movimiento. */
  readonly quieto: boolean
  /** Un viaje del menú. */
  readonly viaje: boolean
  /** Nadie vio el camino: el bloque tapa el cuadro, o la escena vuelve de estar suspendida. */
  readonly oculto: boolean
  /** El pie (tinta de día, no espera) está a la vista. */
  readonly pie: boolean
}

/**
 * [CALIDAD 1] A1 · EL DÍA DE LA LLEGADA. En un viaje del menú que no cambia de luz (de día a día) el amanecer no corre:
 * desde el primer cuadro la compuerta es la del destino y, si está prendida, el amanecer está entero (el día). No el
 * avance que pide el scroll allá: abajo de 1024 «Por qué develOP» llega con el borde de Tu panel arriba y pide 0,851,
 * el centro todavía oscuro, y mostrarlo desde el primer cuadro pinta de noche el vuelo entero. `pieDeTuPanel` es el
 * borde de abajo de Tu panel EN EL DESTINO (px desde arriba del cuadro); los destinos del menú no caen en la
 * histéresis de `amanecerEn`.
 */
export function compuertaEnLaLlegada(pieDeTuPanel: number, alto: number): boolean {
  return pieDeTuPanel < alto * AMANECER.visible
}

/** [CALIDAD 1] A1 · Cuánto puede volver el scroll para atrás de la llegada antes de soltar el día entero. */
export const SOLTAR_LA_LLEGADA = 0.02

/**
 * [CALIDAD 1] A1 · Después de un viaje de día a día el amanecer sigue entero mientras el scroll no lo alcance (1) ni
 * vuelva para atrás de donde llegó: así no corre para atrás al llegar. Volviendo, lo suelta y sigue la vuelta de siempre.
 */
export function sigueEntero(pedido: number, pedidoAlLlegar: number): boolean {
  return pedido < 1 && pedido >= pedidoAlLlegar - SOLTAR_LA_LLEGADA
}

/**
 * [ESCENA 8] T3 · El avance de este cuadro. Sin evento al cargar ya adentro del final, en un viaje ni donde nadie
 * lo ve (va derecho al pedido); con menos movimiento, de una vez; si no, persigue al pedido con la velocidad tope,
 * y con el pie a la vista no queda atrás de lo legible. [CALIDAD 1] Un viaje que cambia de luz sigue acá (como
 * antes); uno de día a día no llega: lo resuelve `compuertaEnLaLlegada`.
 */
export function avanceDelCuadro(anterior: number, pedido: number, dt: number, c: CuadroDelAmanecer): number {
  if (c.quieto) return pedido > 0 ? 1 : 0
  if (c.recien) return c.carga || c.viaje ? pedido : 0
  if (c.viaje || c.oculto) return pedido
  return Math.max(perseguir(anterior, pedido, dt), c.pie ? AMANECER.texto.abajo[1] : 0)
}

/** [CALIDAD 1] A1 · Lo que el amanecer prendido recuerda de un cuadro al otro. */
export interface MemoriaDelAmanecer {
  avance: number
  /** Llegó de un viaje de día a día y sostiene el día entero. */
  entero: boolean
  /** El avance que pedía el scroll al terminar ese viaje. */
  pedidoAlLlegar: number
}

/**
 * [CALIDAD 1] A1 · Un cuadro del amanecer prendido. En un viaje de día a día, el día entero (y se anota la llegada);
 * después, sostenido mientras `sigueEntero`; si no, `avanceDelCuadro` como siempre. Escribe en `m`.
 */
export function pasoDelAmanecer(m: MemoriaDelAmanecer, deDiaADia: boolean, pedido: number, dt: number, c: CuadroDelAmanecer): void {
  if (deDiaADia) {
    m.avance = 1
    m.entero = true
    m.pedidoAlLlegar = pedido
    return
  }
  if (m.entero && sigueEntero(pedido, m.pedidoAlLlegar)) {
    m.avance = 1
    return
  }
  m.entero = false
  m.avance = avanceDelCuadro(m.avance, pedido, dt, c)
}

/**
 * [PULIDO 2] 2 · EL AMANECER EN UN VIAJE QUE CAMBIA DE LUZ Y LLEGA A ÉL: cuánto, a los `s` de un viaje de `duraS` (del click
 * al frenazo, en el reloj del viaje). Arranca después del preludio (con el `<main>` ya ido), crece con la curva simétrica
 * (arranca y llega quieto) y está entero al llegar: el día de la llegada, como en un viaje de día a día.
 */
export const AMANECER_EN_EL_VIAJE = { desdeS: 0.3 } as const

export function completoDelViaje(s: number, duraS: number): number {
  const largo = duraS - AMANECER_EN_EL_VIAJE.desdeS
  if (!(largo > 0)) return 1
  const u = Math.min(1, Math.max(0, (s - AMANECER_EN_EL_VIAJE.desdeS) / largo))
  return u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u)
}
