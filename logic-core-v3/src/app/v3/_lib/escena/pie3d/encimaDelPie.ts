import { HUNDIDOS } from '../../pie3d/registro'
import { cubicBezierEase } from '../bezier'
import type { Armada } from './armadas'
import { COLORES_DEL_PIE } from './geometria'

/**
 * [PULIDO 27] Y1 b · EL HOVER DEL PIE. En una placa (el mail, WhatsApp, las redes) la cara se aclara con el mouse encima o el foco
 * ([PULIDO 22] T2 a: el hundido solo no se veía). En el FORM eso aclaraba la placa entera (era una sola malla con un solo material): ahora
 * la placa no cambia y sólo cambia ENVIAR, como los botones del sitio: el relleno de la tecla se INVIERTE desde la izquierda (lo oscuro se
 * vuelve claro y el rótulo, oscuro), en el tiempo y la curva del sitio (`--duracion-lenta`, `--ease-principal`); al salir vuelve igual.
 * La tecla se sigue hundiendo como antes (`HUNDIDA_DEL_PIE`).
 */
export const RELLENO_DE_LA_TECLA = { s: 0.5, curva: [0.77, 0, 0.175, 1], borde: 0.015 } as const

/** Cuánto avanzó el relleno (lineal, 0 a 1), por el DOM de la pieza: sobrevive a un rearme del form. */
const AVANCE = new WeakMap<Element, number>()

/** El hover de este cuadro: en una placa, la cara que se aclara; en el form, el relleno de Enviar (`tau`: el del hundido, s). */
export function encimaDeLaPieza(a: Armada, quieto: boolean, dt: number, tau: number): void {
  const h = a.delHundido === null ? undefined : HUNDIDOS.get(a.delHundido)
  const encima = h !== undefined && (h.encima || h.foco || h.apretada) ? 1 : 0
  if (a.pieza.forma !== 'formulario') {
    a.uniformes.uEncimaDelPie.value = quieto ? encima : encima + (a.uniformes.uEncimaDelPie.value - encima) * Math.exp(-dt / tau)
    return
  }
  const antes = AVANCE.get(a.pieza.elemento) ?? 0
  const paso = dt / RELLENO_DE_LA_TECLA.s
  const ahora = quieto ? encima : encima > antes ? Math.min(encima, antes + paso) : Math.max(encima, antes - paso)
  AVANCE.set(a.pieza.elemento, ahora)
  a.uniformes.uBarridoDelPie.value = cubicBezierEase(RELLENO_DE_LA_TECLA.curva, ahora)
}

const f = (x: number): string => x.toFixed(4)
const color = (c: { readonly r: number; readonly g: number; readonly b: number }): string => `vec3( ${f(c.r)}, ${f(c.g)}, ${f(c.b)} )`
const B = RELLENO_DE_LA_TECLA.borde

/** Después del color de la cara (`material.ts`): en la tecla, lo que el relleno ya cubrió, invertido (sólo las caras, no los costados). */
export const RELLENO_DE_LA_TECLA_GLSL = /* glsl */ `
	float bordeDelRelleno = uBarridoDelPie * ${f(1 + 2 * B)} - ${f(B)};
	float llenoDelPie = vTeclaDelPie.y * vTapaDelPie * ( 1.0 - smoothstep( bordeDelRelleno - ${f(B)}, bordeDelRelleno + ${f(B)}, vTeclaDelPie.x ) );
	diffuseColor.rgb = mix( diffuseColor.rgb, mix( ${color(COLORES_DEL_PIE.claro)}, ${color(COLORES_DEL_PIE.negro)}, step( 0.5, dot( diffuseColor.rgb, vec3( 0.333 ) ) ) ), llenoDelPie );
`
