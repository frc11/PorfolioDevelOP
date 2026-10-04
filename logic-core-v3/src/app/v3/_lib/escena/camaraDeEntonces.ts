import { entornoDeLaEscena } from './entorno'

/**
 * [PASADA FINAL] 0 · LA CÁMARA DE ENTONCES, con las pruebas de la llegada de Portfolio (`?pruebas=portfolio=…`).
 *
 * El mapeo scroll → progreso es proporcional a los altos DECLARADOS de las secciones. Hasta el nocturno Tu panel declaraba
 * 200svh midiendo bastante más, y la cámara del tramo de Portfolio iba ~0,03 de progreso ATRÁS: cuando llegaban las letras
 * todavía giraba de Quiénes somos a Números (8 a 13° de órbita durante la llegada), y eso es lo que hacía que se vieran
 * venir de lejos. RETOQUE PANEL T3 corrigió la tabla y la cámara de ese tramo se adelantó: hoy las letras llegan con la
 * órbita casi terminada y se ven de frente, cortas. Con la prueba, la cámara se mueve como entonces en ese tramo y como
 * hoy en el resto (sólo la cámara: la luz, la noche y todo lo demás siguen al scroll como hoy).
 *
 * `PARES`: el progreso de hoy y el de entonces EN EL MISMO SCROLL, a 1440×900, cada 60 px de 4173 a 7473 (de Quiénes
 * somos al medio de Trabajos): el de entonces, de `escena10/t3-titulos/lectura-1440.json` (ESCENA 10, medido con
 * `scripts-escena10/t3-lectura.ts`); el de hoy, de `scripts-pasada/p0-camara.ts`. Antes del primero, la de entonces se va
 * atrasando de a poco desde el comienzo de Quiénes somos (`TRAMO.desde`); después del último, alcanza a la de hoy antes
 * del nudo de las demos (`TRAMO.hasta`). En otros anchos se usa la misma cuenta en progreso (aproximada). Si la tabla de
 * secciones vuelve a cambiar, se corre el banco y se pegan sus pares.
 */
export const PARES_DE_LA_CAMARA: readonly (readonly [number, number])[] = [
  [0.41152, 0.38937], [0.41564, 0.39317], [0.41976, 0.39697], [0.42388, 0.40077], [0.428, 0.40457], [0.43212, 0.40837],
  [0.43624, 0.41217], [0.44036, 0.41597], [0.44448, 0.41977], [0.4486, 0.42358], [0.45272, 0.42738], [0.45684, 0.43118],
  [0.46096, 0.43498], [0.46508, 0.43878], [0.4692, 0.44258], [0.47332, 0.44638], [0.47744, 0.45018], [0.48156, 0.45398],
  [0.48568, 0.45779], [0.48979, 0.46159], [0.49391, 0.46539], [0.49803, 0.46919], [0.5006, 0.47299], [0.50175, 0.47679],
  [0.5029, 0.48059], [0.50405, 0.48439], [0.5052, 0.48819], [0.50635, 0.49199], [0.5075, 0.4958], [0.50864, 0.4996],
  [0.50979, 0.50095], [0.51094, 0.50201], [0.51209, 0.50307], [0.51324, 0.50413], [0.51439, 0.50519], [0.51554, 0.50625],
  [0.51669, 0.50731], [0.51784, 0.50837], [0.51899, 0.50943], [0.52014, 0.51049], [0.52129, 0.51155], [0.52243, 0.51261],
  [0.52358, 0.51367], [0.52473, 0.51473], [0.52588, 0.51579], [0.52703, 0.51685], [0.52818, 0.51791], [0.52933, 0.51897],
  [0.53048, 0.52003], [0.53163, 0.52109], [0.53278, 0.52215], [0.53393, 0.52321], [0.53507, 0.52427], [0.53622, 0.52533],
  [0.53737, 0.52639], [0.53852, 0.52745],
]

/** Desde dónde se va atrasando y hasta dónde alcanza a la de hoy (progreso: el comienzo de Quiénes somos y el nudo de las demos). */
export const TRAMO_DE_LA_CAMARA = { desde: 0.125, hasta: 0.625 } as const

/** El progreso de la cámara de entonces para el progreso de hoy (fuera del tramo, el mismo). */
export function comoEntonces(p: number): number {
  const pares = PARES_DE_LA_CAMARA
  const { desde, hasta } = TRAMO_DE_LA_CAMARA
  const [h0, e0] = pares[0]
  const [hN, eN] = pares[pares.length - 1]
  if (p <= desde || p >= hasta) return p
  if (p < h0) return p - (h0 - e0) * ((p - desde) / (h0 - desde))
  if (p > hN) return p - (hN - eN) * ((hasta - p) / (hasta - hN))
  let [a, b] = [0, pares.length - 1]
  while (b - a > 1) {
    const m = (a + b) >> 1
    if (pares[m][0] <= p) a = m
    else b = m
  }
  const [ha, ea] = pares[a]
  const [hb, eb] = pares[b]
  return ea + ((p - ha) / (hb - ha)) * (eb - ea)
}

/** El progreso con que se muestrea la cámara: el de hoy, o con una prueba de Portfolio el de entonces. */
export function progresoDeLaCamara(p: number): number {
  return entornoDeLaEscena().pruebas.portfolio === 'no' ? p : comoEntonces(p)
}
