import type { BloqueOpaco } from '../nocheDisparada'

/**
 * [ESCENA 7] T11 · EL AMANECER — puro: cuándo arranca y qué pasa en cada momento. Con bandera, apagado.
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
 * **La duración (la propuesta): 7,6 s** si se mira quieto. Si se sigue scrolleando, el reloj del amanecer
 * corre más rápido con la velocidad (`acelera`), y además no puede quedar atrás del scroll: cuando el
 * título de Por qué develOP llega a `titulo` del cuadro, el amanecer ya terminó (`progresoPorScroll`).
 * Así el texto nunca entra sobre la sala a oscuras.
 *
 * **Cómo se pinta.** La luz de la sala es una sola (el arco). Hasta `cambio` la sala sigue de noche (se
 * sostiene la noche) y el horizonte se enciende encima. En `cambio` la sala pasa a día, y lo que el
 * frente todavía no alcanzó se oscurece al tono de la noche (el papel, el piso de abajo, las copias, la
 * trama, los bloques; el polvo guarda su blanco de noche y el logo su gris de noche hasta que el frente
 * los alcanza, así el logo es lo último). El cielo pasa de noche a día desde el horizonte hacia arriba.
 */
export const AMANECER = {
  /** Qué fracción del cuadro tiene que dejar ver Tu panel (su borde de abajo, desde arriba). */
  visible: 0.85,
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
  /** Cuánto más rápido corre el reloj por cada pantalla por segundo de scroll. */
  acelera: 3,
  /** Dónde tiene que estar terminado: el tope de Por qué develOP, en fracción del cuadro desde arriba. */
  titulo: 0.62,
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

/** Qué pasa a `s` segundos de empezar el amanecer. */
export function momentoEn(s: number): MomentoDelAmanecer {
  const a = AMANECER
  const [r0, r1, r2] = a.rayos
  const rayos = s < r0 || s > r2 ? 0 : s < r1 ? suave((s - r0) / (r1 - r0)) : 1 - suave((s - r1) / (r2 - r1))
  const resplandor = s < a.resplandor[0] ? 0 : s < a.resplandor[1] ? suave((s - a.resplandor[0]) / (a.resplandor[1] - a.resplandor[0])) : 1 - suave((s - frenteHasta(46)) / (a.final - frenteHasta(46)))
  return {
    estrellas: 1 - suave((s - a.estrellas[0]) / (a.estrellas[1] - a.estrellas[0])),
    resplandor,
    sostieneLaNoche: s < a.cambio,
    barre: s >= a.cambio && s < a.final,
    frente: frenteEn(s),
    rayos,
    cielo: suave((s - a.cambio) / (a.final - a.cambio)),
  }
}

/** Cuándo el frente llega al radio `r` (s). */
export function frenteHasta(r: number): number {
  const f = AMANECER.frente
  for (let i = 1; i < f.length; i += 1) {
    if (r >= f[i][1]) {
      // Bisección sobre el tramo (el frente baja con el tiempo).
      let [a, b]: number[] = [f[i - 1][0], f[i][0]]
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

/**
 * El avance que el scroll le impone: 0 cuando arrancó, 1 cuando el tope de Por qué develOP llega a `titulo`
 * del cuadro. `inicio` es el scroll del arranque; `fin`, el scroll en que el título llega.
 */
export function progresoPorScroll(scroll: number, inicio: number, fin: number): number {
  if (fin <= inicio) return 1
  return Math.min(1, Math.max(0, (scroll - inicio) / (fin - inicio)))
}
