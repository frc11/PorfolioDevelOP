import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../probeMoire'
import { FLOOR_Y } from '../probeScene'

/**
 * [ESCENA 8] T2 · EL LÍMITE ENTRE LA TRAMA Y EL PISO — puro: dónde termina la trama y cómo se apoya.
 *
 * **Qué pasaba.** Con la formación, las dos capas bajaban hasta el piso pero con el alfa de vértice en cero
 * abajo: el fundido cubría el primer tramo de la malla (unos 2 u, no el 3,5 % que decía) y la trama se
 * apagaba antes de tocar nada. Se leía flotando.
 *
 * **Ahora.** Las dos capas bajan a pleno hasta `hunde` DEBAJO del piso, sin fundido: el piso (los bloques del
 * piso vivo, opacos) las corta, así que el borde lo dibuja el piso mismo, también donde el mar sube y baja
 * (la capa fina, en 38, queda parada en el mar). La capa gruesa —la pared, en 44, donde el mar ya se apagó y
 * el piso es plano— lleva un zócalo fino de su mismo color, más denso que las líneas, y el piso junto a él
 * junta un poco menos de luz (el contacto): se lee dónde apoya. La fina no lleva zócalo (el mar lo taparía y
 * destaparía), sólo su contacto, más angosto, que va con los bloques. Arriba no cambia nada.
 */
export const LIMITE = {
  /** Cuánto baja la trama por debajo del reposo del piso (u): más que el valle más hondo del mar con la onda. */
  hunde: 1.0,
  /** El zócalo de la capa gruesa: alto sobre el piso (u), cuánto se entierra (u) y su opacidad (las líneas, 0,45). */
  zocalo: { alto: 0.1, hunde: 0.3, opacidad: 0.62 },
  /** El contacto en el piso al pie de cada capa: cuánto oscurece al pie y en cuánto se apaga (u), a los dos lados. */
  contacto: { gruesa: { cuanto: 0.14, ancho: 0.7 }, fina: { cuanto: 0.1, ancho: 0.3 } },
} as const

/** Dónde empieza cada capa de la trama anclada (y del mundo). */
export const TRAMA_ANCLADA = { abajo: FLOOR_Y - LIMITE.hunde } as const

/** El zócalo: radio (un pelo adentro de la pared, para no pelearse con ella), abajo y arriba (y del mundo). */
export const ZOCALO = {
  radio: MOIRE_FAR_RADIUS - 0.02,
  abajo: FLOOR_Y - LIMITE.zocalo.hunde,
  arriba: FLOOR_Y + LIMITE.zocalo.alto,
} as const

/** Cuánto oscurece el contacto a una distancia `r` del centro (0 lejos de la pared). */
export function contactoDeLaTrama(r: number): number {
  const { gruesa, fina } = LIMITE.contacto
  return gruesa.cuanto * Math.exp(-Math.abs(r - MOIRE_FAR_RADIUS) / gruesa.ancho) + fina.cuanto * Math.exp(-Math.abs(r - MOIRE_NEAR_RADIUS) / fina.ancho)
}

/** Lo mismo en el fragmento del piso vivo (la luz del bloque se multiplica por `1 - esto`). */
export const CONTACTO_DE_LA_TRAMA_GLSL = /* glsl */ `
float contactoDeLaTrama( float r ) {
	return ${LIMITE.contacto.gruesa.cuanto.toFixed(3)} * exp( - abs( r - ${MOIRE_FAR_RADIUS.toFixed(2)} ) / ${LIMITE.contacto.gruesa.ancho.toFixed(3)} )
		+ ${LIMITE.contacto.fina.cuanto.toFixed(3)} * exp( - abs( r - ${MOIRE_NEAR_RADIUS.toFixed(2)} ) / ${LIMITE.contacto.fina.ancho.toFixed(3)} );
}
`
