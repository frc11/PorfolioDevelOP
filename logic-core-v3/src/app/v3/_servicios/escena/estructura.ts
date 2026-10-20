/**
 * [SERVICIOS V0] LA ESTRUCTURA ANIMADA DE LAS TRES PÁGINAS — pura (sin react, sin three): qué luz tiene la escena en cada avance de la
 * intro, cómo vuelve al irse y qué cambia en el celular. Plan: `docs/servicios/SPRINT-V0.md` §3. SIN MONTAR.
 *
 * La misma para Páginas web, Software e IA (decisión de Valentino):
 *   · en el avance 0, la COMPOSICIÓN COMPARTIDA: de noche, con el piso brilloso apenas encendido y la luz blanca de siempre;
 *   · en la primera mitad de la intro se encienden el brillo y el color de la variante, con una curva suave (sin saltos en las puntas);
 *   · de la mitad al final quedan quietos, para que se lea el título 3D;
 *   · al irse de la página bajan rápido y calmos hasta la composición compartida (arranca rápido, llega sin rebote);
 *   · con movimiento reducido, el estado final quieto, y la salida es inmediata;
 *   · en el celular, la misma escena: la calidad compacta del home (`_lib/escena/calidad.ts:57`, abajo de 1024) solo baja el costo.
 *
 * Lo que cada página pone es su estado encendido (los canales al final del encendido): ver `varianteDeWeb.ts`.
 */

import type { NivelDeCalidad } from '../../_lib/escena/calidad'

/**
 * Los canales que mueve la variante. TODOS son luz: ninguno pinta una superficie (VARIANTES.md, «el acento es luz»). Van de 0 a 1:
 *   · `noche`: el nivel de la noche (1 = noche plena: `uNoche`, `_lib/escena/particleGlow.ts:95-99`);
 *   · `brilloDelPiso`: la luz de abajo, la que sale entre los bloques (1 = la del pie del home con todo su poder);
 *   · `tinteDelPiso`: cuánto del acento claro toma esa luz (0 = el blanco de hoy);
 *   · `tinteDeLaEnergia`: cuánto del acento claro toman las brasas, los arcos y la red (0 = el blanco de hoy).
 */
export const CANALES = ['noche', 'brilloDelPiso', 'tinteDelPiso', 'tinteDeLaEnergia'] as const
export type Canal = (typeof CANALES)[number]
export type ParametrosDeLaEscena = Readonly<Record<Canal, number>>

/** Qué luz del home toca cada canal. El tipo es siempre `luz`: el test lo afirma, y un canal de superficie no entra. */
export const DESTINO_DE_CADA_CANAL: Readonly<Record<Canal, { readonly luz: string; readonly tipo: 'luz' }>> = {
  noche: { luz: 'el nivel de la noche: uNoche (particleGlow.ts:84 y :95-99)', tipo: 'luz' },
  brilloDelPiso: { luz: 'la luz de abajo, entre los bloques y en su plano: uBrilloDeLaLuz (final/luzDeAbajo.ts:211)', tipo: 'luz' },
  tinteDelPiso: { luz: 'el color de esa luz, hoy blanco en el shader (final/enElPiso.ts:273, final/planoDeLaLuz.ts:59)', tipo: 'luz' },
  tinteDeLaEnergia: { luz: 'uLuzNoche, el color de noche de las brasas, los arcos y la red (energia/dibujo/comun.ts:137)', tipo: 'luz' },
}

/**
 * B12a-API: reemplazar por el import (la composición inicial compartida, `esc/ruta/pistaDeLaIntro.ts`, SPRINT-B12a §9). El avance 0 de
 * las tres páginas: de noche, el piso apenas encendido y la luz sin teñir. Es también adonde vuelve la escena al irse (el velo).
 */
export const COMPOSICION_COMPARTIDA: ParametrosDeLaEscena = { noche: 1, brilloDelPiso: 0.12, tinteDelPiso: 0, tinteDeLaEnergia: 0 }

/** Dónde termina de encenderse la variante: a la mitad de la intro. De ahí a 1 queda quieta. */
export const ENCENDIDO_HASTA = 0.5

/** Cuánto tarda la salida, en ms: rápida, antes de que pase el velo (la banda de la gota tarda 760, `trabajos/gota.ts:54`). */
export const DURACION_DE_LA_SALIDA_MS = 420

const acotar = (v: number): number => Math.min(1, Math.max(0, v))
/** El encendido: suave en las dos puntas (sin un salto al arrancar ni al llegar). */
const suave = (t: number): number => t * t * (3 - 2 * t)
/** La salida: arranca rápido y llega calma, sin pasarse (ease-out cúbica). */
const rapidaYCalma = (t: number): number => 1 - (1 - t) ** 3

function mezclar(desde: ParametrosDeLaEscena, hasta: ParametrosDeLaEscena, t: number): ParametrosDeLaEscena {
  // `a·(1 − t) + b·t`: en t = 0 da `a` y en t = 1 da `b`, exactos.
  const canal = (c: Canal): number => desde[c] * (1 - t) + hasta[c] * t
  return { noche: canal('noche'), brilloDelPiso: canal('brilloDelPiso'), tinteDelPiso: canal('tinteDelPiso'), tinteDeLaEnergia: canal('tinteDeLaEnergia') }
}

/** La luz de la escena en un avance de la intro (0 → 1), para una variante encendida. Con movimiento reducido, el estado final. */
export function parametrosEnElAvance(encendida: ParametrosDeLaEscena, avance: number, reducido: boolean): ParametrosDeLaEscena {
  return mezclar(COMPOSICION_COMPARTIDA, encendida, reducido ? 1 : suave(acotar(avance / ENCENDIDO_HASTA)))
}

/** La luz al irse de la página, `transcurridoMs` después de empezar la salida: de donde estaba a la composición compartida. */
export function parametrosDeLaSalida(desde: ParametrosDeLaEscena, transcurridoMs: number, reducido: boolean): ParametrosDeLaEscena {
  return mezclar(desde, COMPOSICION_COMPARTIDA, reducido ? 1 : rapidaYCalma(acotar(transcurridoMs / DURACION_DE_LA_SALIDA_MS)))
}

/**
 * Lo que la calidad cambia en la variante: SOLO costo. La escena, los canales y el piso de bloques son los mismos (el piso de la
 * compacta tiene los mismos 5.852 bloques, más chicos: `_lib/escena/piso/bloques.ts:99-112` con radio 34 y no 45).
 *   · `resolucionDelCampo`: la escala del campo de la luz de abajo (la máscara del hueco y su distancia). La compacta lo arma a la mitad,
 *     el mismo mecanismo que el pie angosto del home (`_lib/escena/final/FinalDelPie.tsx:77,83`).
 */
export interface AjusteDeLaVariante {
  readonly resolucionDelCampo: number
}

export const AJUSTE_POR_CALIDAD: Readonly<Record<NivelDeCalidad, AjusteDeLaVariante>> = {
  plena: { resolucionDelCampo: 1 },
  compacta: { resolucionDelCampo: 0.5 },
}

/** El costo propio de la variante, relativo a la plena: los texeles del campo (la escala al cuadrado). */
export function costoRelativo(ajuste: AjusteDeLaVariante): number {
  return ajuste.resolucionDelCampo ** 2
}

/** La escena de la variante en un avance y una calidad: la luz (la misma en las dos calidades) y su ajuste de costo. */
export function escenaDeLaVariante(
  encendida: ParametrosDeLaEscena,
  avance: number,
  calidad: NivelDeCalidad,
  reducido: boolean,
): { readonly parametros: ParametrosDeLaEscena; readonly ajuste: AjusteDeLaVariante } {
  return { parametros: parametrosEnElAvance(encendida, avance, reducido), ajuste: AJUSTE_POR_CALIDAD[calidad] }
}
