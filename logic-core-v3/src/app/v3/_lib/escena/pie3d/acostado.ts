import type * as THREE from 'three'

import { SATINADO } from '../estudio'
import { COSTADO_DE_DIA } from '../titulos3d/filo'
import type { FormaDeLaPieza } from '../../pie3d/registro'
import type { UniformesDelPie } from './coreografia'

/**
 * [PULIDO 27] Y3 · LO ACOSTADO, LIMPIO — en el final, desde arriba, «Lo que sigue lo armamos con vos» y los botones del mail y WhatsApp se
 * veían raros: el satinado reflejaba el estudio en las caras (lavaba el texto a gris) y los costados de la extrusión, en su gris de día, se
 * leían como cantos plateados alrededor de cada letra. Mientras la pieza se acuesta (`uAcostadaDelPie`, 0 de pie y 1 acostada: el vuelco de
 * su columna) va a: la extrusión más baja (`relieve`: la del texto y el relieve de las placas, por forma), las caras MATE (`mate`, la
 * rugosidad, y casi sin los reflejos del estudio: `reflejo`) y los costados con un filo OSCURO sutil (`costado`) en vez del plateado: el
 * negro de la tinta sobre el piso, con todo el contraste. De pie, nada cambia.
 */
export const ACOSTADO = {
  mate: 0.85,
  reflejo: 0.2,
  costado: 0.035,
  relieve: { texto: 0.4, enlace: 0.4, placa: 0.45, formulario: 1 },
} as const

/** Lo que baja la extrusión de esta forma, acostada (la escala del espesor: 1, nada). */
export function relieveAcostado(forma: FormaDeLaPieza): number {
  return ACOSTADO.relieve[forma]
}

/** La luz de la pieza en este cuadro: el reflejo del estudio (`nivel`, el de la sala) y la rugosidad, de pie y acostada. */
export function luzAcostada(material: THREE.MeshStandardMaterial, uniformes: UniformesDelPie, nivel: number): void {
  const a = uniformes.uAcostadaDelPie.value
  material.envMapIntensity = nivel * (1 - (1 - ACOSTADO.reflejo) * a)
  material.roughness = SATINADO.roughness + (ACOSTADO.mate - SATINADO.roughness) * a
}

const f = (x: number): string => x.toFixed(4)

/** Después de la posición de las letras (`begin_vertex`): la extrusión, más baja acostada (la cara en z = 0 queda donde estaba). */
export const ACOSTADO_POSICION_GLSL = /* glsl */ `
	transformed.z *= mix( 1.0, uRelieveAcostadoDelPie, uAcostadaDelPie );
`

/** El gris de los costados (`COSTADO_DE_DIA`), de pie; acostada, el filo oscuro. */
export const COSTADO_ACOSTADO_GLSL = `mix( ${f(COSTADO_DE_DIA)}, ${f(ACOSTADO.costado)}, uAcostadaDelPie )`
