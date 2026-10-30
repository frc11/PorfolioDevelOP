/**
 * [SERVICIOS V0 · V1] LA ESTRUCTURA ANIMADA DE LAS TRES PÁGINAS — pura (sin react, sin three): qué luz pide la variante en cada avance de
 * la intro, cómo vuelve al irse y qué cambia en el celular. Plan: `docs/servicios/SPRINT-V0.md` §3; montada en el V1 (`SPRINT-V1.md`).
 *
 * La misma para Páginas web, Software e IA (decisión de Valentino):
 *   · en el avance 0, la COMPOSICIÓN COMPARTIDA, la del home (`COMPOSICION_DE_LA_LUZ`, P-H29f): el piso apenas encendido y la luz blanca;
 *     la noche la pone el preset de la página (`noche: 'noche'`), no la variante;
 *   · en la primera mitad de la intro se encienden el brillo y el color de la variante, con una curva suave (sin saltos en las puntas);
 *   · de la mitad al final quedan quietos, para que se lea el título;
 *   · al irse de la página bajan rápido y calmos hasta la composición en `SALIDA_DE_LA_VARIANTE_MS` (P-H29d: arranca rápido, llega sin
 *     rebote), con la página todavía quieta;
 *   · con movimiento reducido, el estado final quieto, y la salida es inmediata;
 *   · en el celular, la misma luz: la calidad compacta del home (`esc/calidad.ts`) baja el costo de la escena y la variante no tiene nada
 *     propio que bajar (la luz de abajo la dibuja el piso del home).
 *
 * Lo que cada página pone es su estado encendido (los canales al final del encendido): ver `luzDeWeb.ts`.
 */

import { COMPOSICION_DE_LA_LUZ, SALIDA_DE_LA_VARIANTE_MS } from '../../_lib/escena/ruta/variante'

/**
 * Los canales que mueve la variante. TODOS son luz: ninguno pinta una superficie (VARIANTES.md, «el acento es luz»). Van de 0 a 1:
 *   · `brilloDelPiso`: la energía de la luz de abajo, la que sale entre los bloques (1 = la del pie del home con todo su poder);
 *   · `tinteDelPiso`: cuánto del acento claro toma esa luz (0 = el blanco de base);
 *   · `tinteDeLaEnergia`: cuánto del acento claro toman las brasas, los arcos y la red (0 = el blanco de base).
 */
export const CANALES = ['brilloDelPiso', 'tinteDelPiso', 'tinteDeLaEnergia'] as const
export type Canal = (typeof CANALES)[number]
export type ParametrosDeLaEscena = Readonly<Record<Canal, number>>

/** Qué luz del home toca cada canal, por la ranura (B12a-API §4). El tipo es siempre `luz`: el test lo afirma, y un canal de superficie no entra. */
export const DESTINO_DE_CADA_CANAL: Readonly<Record<Canal, { readonly luz: string; readonly tipo: 'luz' }>> = {
  brilloDelPiso: { luz: 'la energía de la luz de abajo: luzDeAbajo(energia, …) (P-H29a, esc/ruta/variante.ts:29)', tipo: 'luz' },
  tinteDelPiso: { luz: 'el color de esa luz: luzDeAbajo(…, color) → uColorDeLaLuz (P-H29b, esc/final/enElPiso.ts:274, esc/final/planoDeLaLuz.ts:60)', tipo: 'luz' },
  tinteDeLaEnergia: { luz: 'energia(color) → uLuzNoche de las brasas, los arcos y la red (P-H29c, esc/energia/PlasmaYCargas.tsx:96-100)', tipo: 'luz' },
}

/** El avance 0 de las tres páginas, y adonde vuelve la escena al irse: la luz de la composición del home, sin teñir. */
export const COMPOSICION_COMPARTIDA: ParametrosDeLaEscena = { brilloDelPiso: COMPOSICION_DE_LA_LUZ.brilloDelPiso, tinteDelPiso: 0, tinteDeLaEnergia: 0 }

/** Dónde termina de encenderse la variante: a la mitad de la intro. De ahí a 1 queda quieta. */
export const ENCENDIDO_HASTA = 0.5

const acotar = (v: number): number => Math.min(1, Math.max(0, v))
/** El encendido: suave en las dos puntas (sin un salto al arrancar ni al llegar). */
const suave = (t: number): number => t * t * (3 - 2 * t)
/** La salida: arranca rápido y llega calma, sin pasarse (ease-out cúbica). */
const rapidaYCalma = (t: number): number => 1 - (1 - t) ** 3

function mezclar(desde: ParametrosDeLaEscena, hasta: ParametrosDeLaEscena, t: number): ParametrosDeLaEscena {
  // `a·(1 − t) + b·t`: en t = 0 da `a` y en t = 1 da `b`, exactos.
  const canal = (c: Canal): number => desde[c] * (1 - t) + hasta[c] * t
  return { brilloDelPiso: canal('brilloDelPiso'), tinteDelPiso: canal('tinteDelPiso'), tinteDeLaEnergia: canal('tinteDeLaEnergia') }
}

/** La luz de la escena en un avance de la intro (0 → 1), para una variante encendida. Con movimiento reducido, el estado final. */
export function parametrosEnElAvance(encendida: ParametrosDeLaEscena, avance: number, reducido: boolean): ParametrosDeLaEscena {
  return mezclar(COMPOSICION_COMPARTIDA, encendida, reducido ? 1 : suave(acotar(avance / ENCENDIDO_HASTA)))
}

/** La luz al irse de la página, `transcurridoMs` después de empezar la salida: de donde estaba a la composición compartida. */
export function parametrosDeLaSalida(desde: ParametrosDeLaEscena, transcurridoMs: number, reducido: boolean): ParametrosDeLaEscena {
  return mezclar(desde, COMPOSICION_COMPARTIDA, reducido ? 1 : rapidaYCalma(acotar(transcurridoMs / SALIDA_DE_LA_VARIANTE_MS)))
}

/** Una salida en curso: de dónde arrancó y cuándo (ms de `performance.now()`). */
export interface SalidaDeLaVariante {
  readonly desde: ParametrosDeLaEscena
  readonly t0: number
}

/** Lo que la variante lee de la ranura en su cuadro (`PropsDeLaVariante`, ya leído: el avance, `saliendo` y el reloj). */
export interface MomentoDeLaVariante {
  readonly avance: number
  readonly reducido: boolean
  readonly saliendo: boolean
  readonly ahora: number
}

/**
 * EL CUADRO DE LA VARIANTE — la luz que pide en este cuadro, y la salida que deja para el siguiente. Mientras la página se queda, la del
 * avance; desde el primer cuadro con `saliendo`, la salida, que arranca de la luz de ese cuadro y vuelve a la composición. Si `saliendo`
 * vuelve a `false` (la ranura dejó a la variante), la salida se olvida y manda otra vez el avance.
 */
export function cuadroDeLaVariante(encendida: ParametrosDeLaEscena, m: MomentoDeLaVariante, salida: SalidaDeLaVariante | null): { readonly parametros: ParametrosDeLaEscena; readonly salida: SalidaDeLaVariante | null } {
  if (!m.saliendo) return { parametros: parametrosEnElAvance(encendida, m.avance, m.reducido), salida: null }
  const s = salida ?? { desde: parametrosEnElAvance(encendida, m.avance, m.reducido), t0: m.ahora }
  return { parametros: parametrosDeLaSalida(s.desde, m.ahora - s.t0, m.reducido), salida: s }
}
