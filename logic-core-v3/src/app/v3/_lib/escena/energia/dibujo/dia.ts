import type * as THREE from 'three'

import { ARCO_DE_DIA } from './arcos'
import { DIA_SECUNDARIO } from './particulas'

/**
 * [PULIDO 27] Z3 · DE DÍA, TAN BUENAS COMO DE NOCHE (`?dia=`; de noche nada cambia). La hipótesis del humano: de día lo que se robaba la
 * atención eran los PUNTOS (titileo, color, intensidad), no los rayos; y el rayo de día quedó débil (PULIDO 24 V2: al 55 % del ancho y en
 * gris medio). Las variantes:
 *   · `rayo`: el rayo de noche en el día: el mismo camino, ramas, grosor y energía (sin afinarlo), con la luminancia para el papel: el
 *     núcleo de tinta casi negra y un halo oscuro suave alrededor; las cargas, las de siempre.
 *   · `carga`: las cargas con el color de PULIDO 23 (negras: sin el tope del grafito translúcido) y sin titileo; el rayo, el de siempre.
 *   · `ambos`: las dos juntas.
 *   · `calma`: el rayo de noche y las cargas de siempre (grafito, secundarias) pero quietas de brillo: sin titileo ni destellos sueltos.
 *   · `antes`: como estaba (PULIDO 24 V2), para comparar.
 * El rayo y la red en reposo comparten el trazo (`arcos.ts`): la variante vale para los dos. Por defecto, `calma`: el rayo pasa a ser lo
 * que se mira (se lee como tinta) y las cargas siguen secundarias y quietas (negras y titilando, como en PULIDO 23, compiten con el texto).
 * [PULIDO 28] · por decisión del humano, el por defecto pasa a `ambos`: el rayo de noche y las cargas negras, quietas de brillo.
 */
export const DE_DIA = {
  variantes: ['antes', 'rayo', 'carga', 'ambos', 'calma'],
  porDefecto: 'ambos',
  /** El arco de día: su ancho (parte del de noche), el gris del núcleo (lineal) y lo que tapan el halo oscuro, el resplandor y el núcleo. */
  arco: {
    antes: { fino: ARCO_DE_DIA.fino, gris: ARCO_DE_DIA.gris, tapa: [0.08, 0.04, 0.95] },
    // Medido en el sitio sobre los mismos rayos quietos (p27-z3b): de los candidatos (oscuro o claro con contorno, de 1 a 2,2 veces el
    // ancho), el núcleo oscuro 1,7 veces con el halo suave es el que mejor se lee sobre el papel y sobre el cristal.
    rayo: { fino: 1.7, gris: 0.015, tapa: [0.2, 0.06, 1] },
  },
  /** Las cargas de día: el tope del alfa (0,85: el negro de PULIDO 23; el grafito de PULIDO 24, `DIA_SECUNDARIO.tope`) y si quedan quietas de brillo. */
  carga: {
    antes: { tope: DIA_SECUNDARIO.tope, calma: 0 },
    negra: { tope: 0.85, calma: 1 },
    calma: { tope: DIA_SECUNDARIO.tope, calma: 1 },
  },
} as const

/** Las uniformes que cambia el día: el ancho y el gris del arco (`uDiaDelArco`), lo que tapa (`uArcoDia`) y las cargas (`uDiaDeLaCarga`). */
export interface UniformesDelDia {
  readonly arco: THREE.Vector4
  readonly tapa: THREE.Vector4
  readonly carga: THREE.Vector4
}

/** Pone la variante de la consulta (`?dia=`; si no es una de las variantes, la por defecto) y la devuelve. */
export function aplicarElDia(valor: string | null, u: UniformesDelDia): string {
  const v = valor !== null && (DE_DIA.variantes as readonly string[]).includes(valor) ? valor : DE_DIA.porDefecto
  const arco = v === 'antes' || v === 'carga' ? DE_DIA.arco.antes : DE_DIA.arco.rayo
  const carga = v === 'carga' || v === 'ambos' ? DE_DIA.carga.negra : v === 'calma' ? DE_DIA.carga.calma : DE_DIA.carga.antes
  u.arco.set(arco.fino, arco.gris, 0, 0)
  u.tapa.set(arco.tapa[0], arco.tapa[1], arco.tapa[2], 1)
  u.carga.set(carga.tope, carga.calma, 0, 0)
  return v
}
