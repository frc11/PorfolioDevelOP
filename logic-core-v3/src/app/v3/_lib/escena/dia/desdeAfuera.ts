import type * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import type { BloqueOpaco } from '../nocheDisparada'

/**
 * [ESCENA 6] 6g · EL DÍA ENTRA DESDE AFUERA — una variante (con bandera) de la vuelta del día.
 *
 * **Hoy.** El día vuelve escondido: la compuerta (`nocheDisparada.ts`, `diaDelFinalEn`) cambia cuando el
 * MEDIO del bloque opaco (Servicios + Tu panel) pasa el medio del cuadro, con el bloque tapando todo.
 *
 * **La propuesta.** Que el cambio se vea en el único momento en que no se rompe nada: cuando el borde de
 * abajo de Tu panel sube y deja ver la sala (al `visible` del alto del cuadro). Bajando, la noche sigue
 * hasta ahí, y ahí arranca el barrido: la luz del día entra primero por afuera —el ciclorama, la
 * formación— y después cruza la trama hasta el logo, en `duracionS`. Subiendo, la noche vuelve
 * escondida, como hoy (la compuerta de siempre decide el regreso: histéresis).
 *
 * **Cómo se pinta.** La luz de la sala es una sola (el arco): no se puede tener de día afuera y de
 * noche adentro con las mismas luces. Durante el barrido la sala ya está de día, y lo que el frente
 * todavía no alcanzó se oscurece hasta el tono de la noche (`oscuro`, medido sobre el papel), en el
 * papel, el piso de abajo, las copias y la trama. El logo y el polvo pasan de golpe (son chicos y el
 * logo negro recorta contra el ciclorama, que ya es de día).
 */
export const DIA_DESDE_AFUERA = {
  /** Qué fracción del cuadro tiene que dejar ver Tu panel (su borde de abajo, desde arriba). */
  visible: 0.85,
  duracionS: 2.6,
  /** El frente: de dónde sale, hasta dónde llega y su ancho (u). */
  desde: 118,
  hasta: -8,
  ancho: 6,
  /** El papel de noche contra el de día, codificado (0,2 ≈ 50 / 240). */
  oscuro: 0.2,
} as const

/** Lo que leen los materiales. */
export const BARRIDO_DEL_DIA = {
  uFrenteDelDia: { value: 1e4 },
  uBarridoDelDia: { value: 0 },
}

/** ¿Está la variante? */
export function hayDiaDesdeAfuera(): boolean {
  return entornoDeLaEscena().pruebas.diaDesdeAfuera
}

/**
 * La compuerta de la variante. Prende sólo cuando Tu panel deja ver la sala; apaga sólo cuando la de
 * siempre apaga (con el bloque tapando). `antes` es el estado del cuadro anterior; `deSiempre`, lo que
 * dice la compuerta de hoy.
 */
export function diaDesdeAfueraEn(b: BloqueOpaco, antes: boolean, deSiempre: boolean): boolean {
  const seVe = b.tuPanel.pie < b.alto * DIA_DESDE_AFUERA.visible
  return antes ? seVe || deSiempre : seVe
}

/** El frente del barrido a `s` segundos de empezar (sale lento, cruza, llega lento). */
export function frenteEn(s: number): number {
  const u = Math.min(1, Math.max(0, s / DIA_DESDE_AFUERA.duracionS))
  const e = u * u * (3 - 2 * u)
  return DIA_DESDE_AFUERA.desde + (DIA_DESDE_AFUERA.hasta - DIA_DESDE_AFUERA.desde) * e
}

/** En GLSL: cuánto de día muestra un punto del mundo durante el barrido (1 si no hay barrido). */
export const DIA_DESDE_AFUERA_GLSL = /* glsl */ `
uniform float uFrenteDelDia;
uniform float uBarridoDelDia;
float diaDesdeAfuera( vec3 mundo ) {
	if ( uBarridoDelDia < 0.5 ) return 1.0;
	return smoothstep( uFrenteDelDia - ${DIA_DESDE_AFUERA.ancho.toFixed(1)}, uFrenteDelDia + ${DIA_DESDE_AFUERA.ancho.toFixed(1)}, length( mundo.xz ) );
}
`

/** La cuenta que se aplica después de la bruma: lo que el frente no alcanzó, con el tono de la noche. */
export const OSCURECER_GLSL = (mundo: string): string => /* glsl */ `
	gl_FragColor.rgb *= mix( ${DIA_DESDE_AFUERA.oscuro.toFixed(2)}, 1.0, diaDesdeAfuera( ${mundo} ) );
`

type Material = THREE.MeshStandardMaterial | THREE.MeshLambertMaterial

/**
 * Engancha el barrido en un material de three (papel, trama). Encadena el `onBeforeCompile` que ya
 * tuviera (el moiré vivo lo usa), no lo pisa.
 */
export function conElDiaDesdeAfuera<T extends Material>(material: T): T {
  if (!hayDiaDesdeAfuera()) return material
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, BARRIDO_DEL_DIA)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMundoDelDia;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n\tvMundoDelDia = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vMundoDelDia;\n${DIA_DESDE_AFUERA_GLSL}`)
      .replace('#include <fog_fragment>', `#include <fog_fragment>\n${OSCURECER_GLSL('vMundoDelDia')}`)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|dia-desde-afuera`
  material.needsUpdate = true
  return material
}
