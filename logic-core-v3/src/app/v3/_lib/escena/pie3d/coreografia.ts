import * as THREE from 'three'

import type { LlegadaDeLaPieza } from '../../pie3d/registro'

/**
 * [PASADA FINAL] C2 · LA LLEGADA DEL PIE, POR COLUMNAS — antes las piezas estaban quietas en el mundo y entraban con la
 * página y el alejamiento de la cámara: en diagonal, todas juntas. Ahora cada columna tiene su gesto, en orden, sobre la
 * última pantalla (el progreso de la sección del pie, el mismo que movía el pie plano):
 *
 *   atrás     «Lo que sigue lo armamos con vos», el mail y WhatsApp: desde atrás y abajo, girando, como las letras de
 *             Portfolio (el titular, letra por letra, en el sombreador; el mail y WhatsApp, cada placa entera).
 *   tapa      el formulario: acostado hacia atrás sobre su canto de abajo, sube y se levanta hasta quedar de pie, como una
 *             tapa que se abre.
 *   fundido   lo demás (el logotipo, los rótulos, el recorrido, las redes, la línea legal): aparecen escalonados, de arriba
 *             abajo y de izquierda a derecha, subiendo apenas.
 *
 * **Función del scroll y robusta como F2.** Hay UN progreso mostrado para todo el pie, que persigue al del scroll sin ir
 * más rápido que el mínimo de cada tramo (`minimoS`: una columna nunca llega de golpe, ni con un salto al final ni con un
 * viaje del menú: se ven una después de la otra); al frenar a mitad de un tramo, lo mostrado se asienta en su extremo más
 * cercano (ninguna columna queda a medias); en un viaje del menú se desarma rápido y llega al terminar. Los tramos no se
 * pisan: cada columna termina antes de que empiece la siguiente, y eso es lo que deja asentar por columna.
 *
 * El DOM interactivo (los enlaces, el formulario) queda donde su pieza va a quedar, sin el puntero hasta que llega: lo que
 * se ve llegando es el 3D. Con movimiento reducido, nada se mueve: cada pieza sólo se disuelve en su lugar.
 */
export interface TramoDelPie {
  readonly llegada: LlegadaDeLaPieza
  /** Dónde empieza y dónde termina, en el progreso de la última pantalla (0: el pie asoma; 1: el último píxel). */
  readonly desde: number
  readonly hasta: number
  /** Lo que tarda como mínimo de punta a punta (s), en las dos direcciones. */
  readonly minimoS: number
  /** Qué parte del tramo ocupa cada pieza (el resto es el escalonado entre la primera y la última). */
  readonly dura: number
}

/**
 * Los tres tramos, en orden, donde cada columna ya se ve: medido (`scripts-pasada/c2-ventanas.ts`, de 1100 a 1920 de
 * ancho), la columna izquierda queda entera en el cuadro desde 0,62–0,68 de la última pantalla, el formulario desde
 * 0,70–0,78 y lo demás desde 0,72–0,80. El titular arranca un poco antes: sus letras llegan mientras termina de subir.
 * [RETOQUE DEL ENCASTRE] 2B · más cortos: de punta a punta 1,4 s (eran 3,2: al terminar de irse ya se había salido de la
 * sección); el escalonado por columnas no cambia, y las piezas reciben clics antes (al llegar).
 */
export const TRAMOS_DEL_PIE: readonly TramoDelPie[] = [
  { llegada: 'atras', desde: 0.56, hasta: 0.8, minimoS: 0.6, dura: 0.7 },
  { llegada: 'tapa', desde: 0.8, hasta: 0.92, minimoS: 0.4, dura: 1 },
  { llegada: 'fundido', desde: 0.92, hasta: 1, minimoS: 0.4, dura: 0.5 },
]

/** Fuera de los tramos (el alejamiento, el final) y en un viaje del menú: de punta a punta en esto (s). */
export const LIBRE_DEL_PIE_S = 0.5

const acotar = (x: number): number => Math.min(1, Math.max(0, x))

/** El tramo de una llegada. */
export function tramoDe(llegada: LlegadaDeLaPieza): TramoDelPie {
  return TRAMOS_DEL_PIE.find((t) => t.llegada === llegada) ?? TRAMOS_DEL_PIE[TRAMOS_DEL_PIE.length - 1]
}

/** Cuánto avanza lo mostrado por segundo en `p`, yendo en `sentido`: el ritmo del tramo en que está (fuera, libre). */
function ritmo(p: number, sentido: number): number {
  for (const t of TRAMOS_DEL_PIE) if (sentido > 0 ? p >= t.desde && p < t.hasta : p > t.desde && p <= t.hasta) return (t.hasta - t.desde) / t.minimoS
  return 1 / LIBRE_DEL_PIE_S
}

/** El próximo extremo de un tramo (o 0, o 1) desde `p` en `sentido`. */
function proximoBorde(p: number, sentido: number): number {
  let borde = sentido > 0 ? 1 : 0
  for (const t of TRAMOS_DEL_PIE) {
    for (const b of [t.desde, t.hasta]) {
      if (sentido > 0 && b > p + 1e-9 && b < borde) borde = b
      if (sentido < 0 && b < p - 1e-9 && b > borde) borde = b
    }
  }
  return borde
}

/** El asiento: con el scroll quieto a mitad de un tramo, su extremo más cercano; fuera de los tramos, lo pedido. */
export function asientoDelPie(pedido: number): number {
  const p = acotar(pedido)
  for (const t of TRAMOS_DEL_PIE) if (p > t.desde && p < t.hasta) return p - t.desde < t.hasta - p ? t.desde : t.hasta
  return p
}

/**
 * Un paso de lo mostrado: persigue a lo pedido (o a su asiento, con el scroll quieto) sin ir más rápido que el ritmo de
 * cada tramo que cruza; `libre`, a la velocidad de fuera de los tramos (el viaje del menú).
 */
export function avanceDelPie(mostrado: number, pedido: number, asentar: boolean, dt: number, libre = false): number {
  const meta = asentar ? asientoDelPie(pedido) : acotar(pedido)
  let p = acotar(mostrado)
  let resto = Math.max(0, dt)
  for (let k = 0; k < 16 && resto > 0 && p !== meta; k += 1) {
    const sentido = meta > p ? 1 : -1
    const borde = sentido > 0 ? Math.min(proximoBorde(p, 1), meta) : Math.max(proximoBorde(p, -1), meta)
    const v = libre ? 1 / LIBRE_DEL_PIE_S : ritmo(p, sentido)
    const necesita = Math.abs(borde - p) / v
    if (necesita <= resto) {
      p = borde
      resto -= necesita
    } else {
      p += sentido * v * resto
      resto = 0
    }
  }
  return acotar(p)
}

/** Cuánto va de su tramo (0 a 1) con lo mostrado `p`. */
export function progresoDelTramo(t: TramoDelPie, p: number): number {
  return acotar((p - t.desde) / (t.hasta - t.desde))
}

/** Cuánto llegó la pieza de lugar `orden` (0 la primera, 1 la última) con el progreso de su tramo: lineal (la curva la pone cada gesto). */
export function deLaPieza(u: number, orden: number, dura: number): number {
  return acotar((u - orden * (1 - dura)) / dura)
}

/** La curva de salida de las letras de Portfolio (cúbica): arranca rápido y frena al llegar. */
export const salida = (x: number): number => 1 - (1 - acotar(x)) ** 3

/** El orden de cada pieza en su grupo: de arriba abajo y de izquierda a derecha (filas de 8 px), de 0 a 1. */
export function ordenesDelGrupo(cajas: readonly { readonly x: number; readonly y: number }[]): number[] {
  const fila = (y: number): number => Math.round(y / 8)
  const indices = cajas.map((_, k) => k).sort((a, b) => fila(cajas[a].y) - fila(cajas[b].y) || cajas[a].x - cajas[b].x)
  const ordenes = new Array<number>(cajas.length).fill(0)
  indices.forEach((k, i) => {
    ordenes[k] = cajas.length > 1 ? i / (cajas.length - 1) : 0
  })
  return ordenes
}

/** Los gestos (px de la pieza; la geometría tiene la y hacia arriba y la cara del DOM en z = 0, el cuerpo hacia atrás). */
export const GESTOS_DEL_PIE = {
  /** De dónde sale (em del titular; altos de la placa en el mail y WhatsApp), cuánto gira y hasta dónde se disuelve. */
  atras: { desde: [0, -1.2, -16] as const, vueltasDeLasLetras: 1.25, vueltasDeLasPlacas: 0.75, inclinacion: 0.12, aparece: 0.35 },
  /** Acostada hacia atrás sobre su canto de abajo (rad), cuánto más abajo empieza (altos del formulario) y su fundido. */
  tapa: { acostada: Math.PI / 2, subida: 0.3, aparece: 0.2 },
  /** Cuánto más abajo empieza (px). */
  fundido: { subida: 12 },
} as const

const PIVOTE = new THREE.Vector3()
const IDA = new THREE.Matrix4()
const VUELTA = new THREE.Matrix4()
const GIRO = new THREE.Matrix4()
const INCLINADA = new THREE.Matrix4()

/**
 * La pose de una pieza que llega (`e`: cuánto llegó, 0 a 1, lineal) en su propio espacio: el viaje que se compone entre su
 * lugar en el mundo y su geometría. Llegada, la identidad. El titular (`porLetras`) no se mueve entero: llega cada letra.
 */
export function poseDeLaPieza(llegada: LlegadaDeLaPieza, e: number, caja: { readonly ancho: number; readonly alto: number; readonly espesor: number }, porLetras: boolean, quieto: boolean, destino: THREE.Matrix4): THREE.Matrix4 {
  const falta = 1 - salida(e)
  destino.identity()
  if (quieto || porLetras || falta <= 0) return destino
  if (llegada === 'atras') {
    const g = GESTOS_DEL_PIE.atras
    PIVOTE.set(caja.ancho / 2, -caja.alto / 2, -caja.espesor / 2)
    IDA.makeTranslation(PIVOTE.x + falta * g.desde[0] * caja.alto, PIVOTE.y + falta * g.desde[1] * caja.alto, PIVOTE.z + falta * g.desde[2] * caja.alto)
    GIRO.makeRotationY(falta * g.vueltasDeLasPlacas * 2 * Math.PI)
    INCLINADA.makeRotationX(falta * g.inclinacion * 2 * Math.PI)
    VUELTA.makeTranslation(-PIVOTE.x, -PIVOTE.y, -PIVOTE.z)
    return destino.multiplyMatrices(IDA, GIRO).multiply(INCLINADA).multiply(VUELTA)
  }
  if (llegada === 'tapa') {
    const g = GESTOS_DEL_PIE.tapa
    // La bisagra: el canto de abajo y de atrás (acostada hacia atrás, el cuerpo queda arriba de la bisagra).
    PIVOTE.set(caja.ancho / 2, -caja.alto, -caja.espesor)
    IDA.makeTranslation(PIVOTE.x, PIVOTE.y - falta * g.subida * caja.alto, PIVOTE.z)
    GIRO.makeRotationX(-falta * g.acostada)
    VUELTA.makeTranslation(-PIVOTE.x, -PIVOTE.y, -PIVOTE.z)
    return destino.multiplyMatrices(IDA, GIRO).multiply(VUELTA)
  }
  return destino.makeTranslation(0, -falta * GESTOS_DEL_PIE.fundido.subida, 0)
}

/** Cuánto se ve la pieza entera (0 a 1, el tramado que la disuelve). El titular se disuelve letra por letra: entero, 1. */
export function apareceDeLaPieza(llegada: LlegadaDeLaPieza, e: number, porLetras: boolean): number {
  if (porLetras) return 1
  if (llegada === 'atras') return THREE.MathUtils.smoothstep(e, 0, GESTOS_DEL_PIE.atras.aparece)
  if (llegada === 'tapa') return THREE.MathUtils.smoothstep(e, 0, GESTOS_DEL_PIE.tapa.aparece)
  return salida(e)
}

const f = (x: number): string => x.toFixed(5)

/**
 * El sombreador de las letras del titular: cada una sale `desde` (em, del cuerpo de sus letras) y llega girando, escalonadas
 * de la primera a la última, como las de Portfolio (la misma curva cúbica). Las demás piezas no llegan por letras
 * (`uLetrasDelPie` negativo): el viaje de la pieza entera lo pone la CPU. Todas se disuelven con el mismo tramado fijo en
 * la pantalla que los títulos (el material es opaco: sin orden de transparencias).
 */
const DURA_DE_LAS_LETRAS = 0.6
export const LETRAS_DEL_PIE_PARS_GLSL = /* glsl */ `
attribute vec4 aLetraDelPie;
uniform float uLetrasDelPie;
uniform float uCuerpoDelPie;
uniform float uApareceDelPie;
uniform float uQuietoDelPie;
varying float vApareceDelPie;
float llegadaDeLaLetraDelPie( float p, float orden ) {
	float u = clamp( ( p - orden * ${f(1 - DURA_DE_LAS_LETRAS)} ) / ${f(DURA_DE_LAS_LETRAS)}, 0.0, 1.0 );
	return 1.0 - pow( 1.0 - u, 3.0 );
}
mat3 giroDeLaLetraDelPie( float falta ) {
	float a = falta * ${f(GESTOS_DEL_PIE.atras.vueltasDeLasLetras * 2 * Math.PI)};
	float b = falta * ${f(GESTOS_DEL_PIE.atras.inclinacion * 2 * Math.PI)};
	mat3 y = mat3( cos( a ), 0.0, - sin( a ), 0.0, 1.0, 0.0, sin( a ), 0.0, cos( a ) );
	mat3 x = mat3( 1.0, 0.0, 0.0, 0.0, cos( b ), sin( b ), 0.0, - sin( b ), cos( b ) );
	return y * x;
}
`

/** Después de `beginnormal` (y de leer la cara, que es de la letra quieta): el giro de la letra y cuánto se ve. */
export const LETRAS_DEL_PIE_NORMAL_GLSL = /* glsl */ `
	float eDeLaLetraDelPie = uLetrasDelPie < 0.0 ? 1.0 : llegadaDeLaLetraDelPie( uLetrasDelPie, aLetraDelPie.w );
	float faltaDeLaLetraDelPie = ( 1.0 - eDeLaLetraDelPie ) * ( 1.0 - uQuietoDelPie );
	mat3 giroDelPie = giroDeLaLetraDelPie( faltaDeLaLetraDelPie );
	objectNormal = giroDelPie * objectNormal;
	vApareceDelPie = uApareceDelPie * smoothstep( 0.0, ${f(GESTOS_DEL_PIE.atras.aparece)}, eDeLaLetraDelPie );
`

/** Después de `begin_vertex`: la letra en camino, girada sobre su centro y corrida lo que le falta. */
export const LETRAS_DEL_PIE_POSICION_GLSL = /* glsl */ `
	transformed = aLetraDelPie.xyz + giroDelPie * ( transformed - aLetraDelPie.xyz ) + faltaDeLaLetraDelPie * uCuerpoDelPie * vec3( ${GESTOS_DEL_PIE.atras.desde.map((x) => f(x)).join(', ')} );
`

export const DISOLVER_DEL_PIE_PARS_GLSL = 'varying float vApareceDelPie;'
export const DISOLVER_DEL_PIE_GLSL = /* glsl */ `
	if ( vApareceDelPie < 0.999 && fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) ) >= vApareceDelPie ) discard;
`

/** Los uniformes de una pieza (cada pieza tiene su material: el programa es uno solo). */
export interface UniformesDelPie {
  readonly uLetrasDelPie: { value: number }
  readonly uCuerpoDelPie: { value: number }
  readonly uApareceDelPie: { value: number }
  readonly uQuietoDelPie: { value: number }
}

export function uniformesDelPie(): UniformesDelPie {
  return { uLetrasDelPie: { value: -1 }, uCuerpoDelPie: { value: 0 }, uApareceDelPie: { value: 1 }, uQuietoDelPie: { value: 0 } }
}
