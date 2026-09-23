/**
 * §22 DEL INVARIANTE DE TRABAJOS — **la tabla es la especificación, y nada nace
 * ni muere.**
 *
 * Las dos mitades son la misma pregunta vista desde dos lados: si el túnel
 * reproduce lo que se midió en la referencia.
 *
 *   · **la tabla.** Nuestras cinco capas tienen que ser cinco de sus siete, con
 *     los números TAL CUAL —sin promediar ni redondear—, encadenadas en pares que
 *     sean consecutivos en la suya, y la recta tiene que pasar por lo que el
 *     navegador midió en ella, no sólo por sus propias puntas.
 *   · **nada nace ni muere.** Todas existen desde el primer cuadro, arrancan en
 *     escala 0 y crecen sin un salto: no hay un nacimiento de un píxel ni un
 *     tramo invisible, que eran las dos piezas de la ley que se fue.
 *
 * ⚠ Vive en su propio archivo por la regla de las 300 líneas, con el corte por
 * TEMA que el repo ya usa en `s6-traspaso.ts` y en `trabajos-rotulo.ts`.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { CONTENIDO } from './contenido'
import {
  ANCHO_DEL_CTA,
  ANCHO_DEL_CUADRO_DE_REFERENCIA,
  CAPAS_DEL_TUNEL,
  ORIGEN_DEL_TUNEL,
  PX_DEL_TUNEL,
  escalaDeLaCapa,
  letrasEscritas,
  poseDelTunel,
  type CapaDeLaTabla,
} from './tunel'

type FilaMedida = CapaDeLaTabla & { readonly suya: string }

/**
 * ⚠️ **EL RECIBO: la tabla medida ENTERA, sus siete capas.** Copiada del registro
 * de la medición (`scripts-b4/ref-tabla.ts` sobre heatbureau.com, 1440 × 900,
 * volcado en `ref-tabla-crudo.tsv`). Vive acá y no en el producto porque es la
 * otra punta: el producto usa cinco, y esto afirma que son cinco de éstas.
 */
const TABLA_MEDIDA: readonly FilaMedida[] = [
  { suya: 'escenario', de: 1, a: 1.3, arranca: 199, topa: 1420 },
  { suya: '#0', de: 0.8, a: 1.3, arranca: 475, topa: 1631 },
  { suya: '#1', de: 0, a: 0.7, arranca: 712, topa: 1428 },
  { suya: '#2', de: 0, a: 0.9, arranca: 810, topa: 1720 },
  { suya: '#3', de: 0, a: 1.2, arranca: 1303, topa: 1983 },
  { suya: '#4', de: 0, a: 1.05, arranca: 1636, topa: 2236 },
  { suya: '#5', de: 0, a: 0.4, arranca: 1873, topa: 2290 },
]

/**
 * Y muestras CRUDAS de la misma medición: la escala que su DOM tenía escrita en
 * muescas donde la capa estaba creciendo. Con esto la tabla no se afirma contra
 * sí misma: la recta tiene que pasar por lo que se midió. El escenario sale de
 * su cadena —la acumulada de su #0 sobre la propia—, como en la sonda.
 */
const MUESTRAS_MEDIDAS: readonly { readonly suya: string; readonly y: number; readonly escala: number }[] = [
  { suya: 'escenario', y: 500, escala: 1.07396 },
  { suya: 'escenario', y: 1000, escala: 1.19681 },
  { suya: '#2', y: 900, escala: 0.089011 },
  { suya: '#2', y: 1300, escala: 0.484615 },
  { suya: '#2', y: 1700, escala: 0.88022 },
  { suya: '#3', y: 1400, escala: 0.171176 },
  { suya: '#3', y: 1700, escala: 0.700588 },
  { suya: '#3', y: 1900, escala: 1.05353 },
  { suya: '#4', y: 1700, escala: 0.112 },
  { suya: '#4', y: 2000, escala: 0.637 },
  { suya: '#4', y: 2200, escala: 0.987 },
  { suya: '#5', y: 1900, escala: 0.025899 },
  { suya: '#5', y: 2100, escala: 0.217746 },
  { suya: '#5', y: 2200, escala: 0.313669 },
]

/**
 * Cuánto puede separarse la recta de una muestra. Las muestras traen seis
 * decimales y la tabla tiene sus scrolls en píxeles enteros: con eso el peor
 * caso es 4·10⁻⁶. Una tabla corrida 50 px se separa 0,088.
 */
const TOLERANCIA_CONTRA_LO_MEDIDO = 1e-4

/**
 * ⚠️ **CUÁNTO PUEDE CRECER UNA CAPA EN PANTALLA POR PÍXEL DE SCROLL.** La más
 * rápida de la tabla crece 5,3 px de pantalla por píxel de scroll, al final,
 * cuando ya desborda el cuadro. Un nacimiento que se VE es otra cosa: una tarjeta
 * que aparece con 29 px —el «0,02 del cuadro» de hace tres sprints— en un solo
 * píxel de scroll.
 */
const CRECIMIENTO_MAXIMO_POR_PX = 10

/** La ley vieja del CTA, para el control: e-plegados sobre un avance en scrolls. */
const FRACCION_QUE_DABA_LA_LEY_VIEJA = Math.exp(4.31034) / 1440 / ANCHO_DEL_CTA

/** La escala fija que la ventana del CTA ESCRIBE en el marcado —no la constante—. */
const escalaEscritaEnLaVentana = (html: string): number =>
  Number(/data-pieza="ventana-del-cta"[^>]*scale\(([\d.]+)\)/.exec(html)?.[1] ?? Number.NaN)

/** Lo que mide el CTA en pantalla al final del túnel, en anchos de cuadro, con esa escala. */
const ctaEnPantallaAlFinal = (html: string): number => {
  const fin = poseDelTunel(PX_DEL_TUNEL)
  return fin.anchos[fin.anchos.length - 1] * fin.cta * escalaEscritaEnLaVentana(html) * ANCHO_DEL_CTA
}
const mideSuCaja = (html: string): boolean => Math.abs(ctaEnPantallaAlFinal(html) - ANCHO_DEL_CTA) < 1e-4
/** El marcado con otra escala fija en la ventana, para los controles. */
const conOtraEscala = (html: string, escala: number): string =>
  html.replace(/(data-pieza="ventana-del-cta"[^>]*scale\()[\d.]+/, `$1${escala.toFixed(5)}`)

const NUESTRAS: readonly CapaDeLaTabla[] = [CAPAS_DEL_TUNEL.escenario, ...CAPAS_DEL_TUNEL.proyectos, CAPAS_DEL_TUNEL.cta]

const igual = (x: CapaDeLaTabla, y: CapaDeLaTabla): boolean =>
  x.de === y.de && x.a === y.a && x.arranca === y.arranca && x.topa === y.topa

/** Qué fila suya es cada una nuestra, o `null` si no es ninguna tal cual. */
const cualEs = (capas: readonly CapaDeLaTabla[]): (string | null)[] =>
  capas.map((c) => TABLA_MEDIDA.find((f) => igual(f, c))?.suya ?? null)

const consecutivas = (suyas: readonly (string | null)[]): boolean =>
  suyas.every((s, k) => k === 0 || (s !== null && suyas[k - 1] !== null && Number(s.slice(1)) === Number((suyas[k - 1] ?? '').slice(1)) + 1))

/** Cuánto se aleja una tabla de las muestras medidas de las capas que usa. */
const peorContraLoMedido = (capas: readonly CapaDeLaTabla[]): number => {
  const suyas = cualEs(NUESTRAS)
  let peor = 0
  for (const m of MUESTRAS_MEDIDAS) {
    const k = suyas.indexOf(m.suya)
    if (k < 0) continue
    peor = Math.max(peor, Math.abs(escalaDeLaCapa(capas[k], m.y) - m.escala))
  }
  return peor
}

/** El mayor crecimiento en pantalla de un proyecto en un píxel de scroll, en px. */
const mayorCrecimiento = (anchosEn: (px: number) => readonly number[]): number => {
  let mayor = 0
  for (let px = 0; px < PX_DEL_TUNEL; px += 1) {
    const antes = anchosEn(px)
    const despues = anchosEn(px + 1)
    for (let i = 0; i < antes.length; i += 1) {
      mayor = Math.max(mayor, (despues[i] - antes[i]) * ANCHO_DEL_CUADRO_DE_REFERENCIA)
    }
  }
  return mayor
}

export function afirmarLaTablaYElNacimiento(cuantas: number, conMotion: string): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('22 · La tabla es la especificación, y nada nace ni muere')

  // ── CINCO DE SUS SIETE, TAL CUAL ────────────────────────────────────────
  const suyas = cualEs(NUESTRAS)
  afirmarIgual(suyas, ['escenario', '#2', '#3', '#4', '#5'], 'nuestras cinco capas son cinco de las siete medidas, con sus cuatro números tal cual: escenario, #2, #3, #4 y su CTA')
  controlPositivo(
    'el detector vería una capa redondeada',
    [{ de: 0, a: 0.9, arranca: 800, topa: 1700 }],
    (capas: CapaDeLaTabla[]) => cualEs(capas).every((s) => s !== null),
  )
  afirmar(consecutivas(suyas.slice(1)), '  y los pares padre → hijo de nuestra cadena son CONSECUTIVOS en la suya (#2 → #3 → #4 → #5): las razones entre capas que coexisten son las de ella')
  controlPositivo('  y vería una cadena con un hueco', ['#1', '#3', '#4', '#5'], consecutivas)

  // ── ARRANCAN EN CERO ────────────────────────────────────────────────────
  afirmar(
    [...CAPAS_DEL_TUNEL.proyectos, CAPAS_DEL_TUNEL.cta].every((c) => c.de === 0),
    '  los tres proyectos y el CTA arrancan en escala 0; el único que no es el escenario, que no tiene nada propio que mostrar',
  )
  controlPositivo('  y vería su #0, que arranca en 0,8', TABLA_MEDIDA[1], (c: CapaDeLaTabla) => c.de === 0)

  // ── LA RECTA PASA POR LO QUE EL NAVEGADOR MIDIÓ ─────────────────────────
  const peor = peorContraLoMedido(NUESTRAS)
  afirmar(
    peor <= TOLERANCIA_CONTRA_LO_MEDIDO,
    `las rectas pasan por las ${MUESTRAS_MEDIDAS.length} muestras crudas de la referencia: el peor desvío es ${peor.toExponential(1)}`,
  )
  controlPositivo(
    '  el detector vería la tabla corrida 50 px',
    NUESTRAS.map((c) => ({ ...c, arranca: c.arranca + 50, topa: c.topa + 50 })),
    (capas: CapaDeLaTabla[]) => peorContraLoMedido(capas) <= TOLERANCIA_CONTRA_LO_MEDIDO,
  )

  // ── EL CTA LLEGA A SU TAMAÑO: el defecto de este sprint ─────────────────
  /**
   * ⚠️ **ACÁ ESTABA EL AGUJERO.** Ninguna afirmación llevaba al CTA de punta a
   * punta: se probaba `letrasEscritas(1)` metiendo el 1 a mano, y la ley vieja
   * —e-plegados sobre un avance medido en scrolls— lo dejaba clavado en el 8,3 %
   * de su tamaño con todo en verde. Ahora se le pregunta al túnel cuánto mide el
   * CTA cuando termina, con la escala que la ventana ESCRIBE en el marcado.
   */
  const fin = poseDelTunel(PX_DEL_TUNEL)
  afirmarIgual(fin.fraccionDelCta, 1, 'cuando el túnel termina, el CTA está en su tamaño EXACTO: la fracción que el túnel produce vale 1, no «casi»')
  controlPositivo(
    'el detector vería el defecto medido: la ley vieja lo clavaba en e^4,31 / 1440, el 8,3 % de su tamaño',
    FRACCION_QUE_DABA_LA_LEY_VIEJA,
    (fraccion: number) => fraccion === 1,
  )
  afirmar(
    mideSuCaja(conMotion),
    `  y en pantalla mide ${ctaEnPantallaAlFinal(conMotion).toFixed(5)} del cuadro, lo que dice su caja (${ANCHO_DEL_CTA}): la escala que la ventana escribe (${escalaEscritaEnLaVentana(conMotion)}) cierra la cadena en 1, así que el texto sale al tamaño declarado`,
  )
  controlPositivo('  el detector vería la ventana sin su escala fija: 0,37 del cuadro, el mismo «no termina de crecer»', conOtraEscala(conMotion, 1), mideSuCaja)
  controlPositivo(
    '  y el tope aplicado dos veces de antes: la cadena cerrando en 0,62 sobre una caja que ya mide 62 %',
    conOtraEscala(conMotion, escalaEscritaEnLaVentana(conMotion) * ANCHO_DEL_CTA),
    mideSuCaja,
  )
  const letras = [...CONTENIDO.cta.frase.replace(/ /g, '')].length
  afirmarIgual(letrasEscritas(poseDelTunel(0).fraccionDelCta, letras), 0, '  al arrancar el túnel no hay una sola letra escrita')
  afirmarIgual(
    letrasEscritas(fin.fraccionDelCta, letras),
    letras,
    `  y al terminar la frase está entera —las ${letras} letras que la capa cuenta— con la fracción del túnel, no con un 1 escrito a mano`,
  )

  // ── NADA NACE: todas existen desde el principio, en cero ────────────────
  const alArrancar = poseDelTunel(0)
  afirmarIgual(
    [...alArrancar.anchos, alArrancar.fraccionDelCta],
    [...CAPAS_DEL_TUNEL.proyectos.map(() => 0), 0],
    'cuando el túnel arranca, los tres proyectos y el CTA miden 0 en pantalla: existen, pero no pintan',
  )
  for (const [i, capa] of CAPAS_DEL_TUNEL.proyectos.entries()) {
    const suArranque = capa.arranca - ORIGEN_DEL_TUNEL
    afirmar(
      poseDelTunel(suArranque).anchos[i] === 0 && poseDelTunel(suArranque + 1).anchos[i] > 0,
      `  el proyecto ${i + 1} sigue en 0 hasta su scroll ${capa.arranca} y recién ahí empieza a crecer`,
    )
  }

  // ── Y NADA APARECE DE GOLPE ─────────────────────────────────────────────
  /** Las cuatro capas con caja: los tres proyectos y la ventana del CTA. */
  const conCaja = (px: number): readonly number[] => {
    const pose = poseDelTunel(px)
    return [...pose.anchos, pose.fraccionDelCta * ANCHO_DEL_CTA]
  }
  const crece = mayorCrecimiento(conCaja)
  afirmar(
    crece < CRECIMIENTO_MAXIMO_POR_PX,
    `en ${PX_DEL_TUNEL} px de túnel ninguna de las cuatro capas con caja —tres proyectos y el CTA— crece más de ${crece.toFixed(2)} px de pantalla por píxel de scroll: no hay un solo salto`,
  )
  controlPositivo(
    '  el detector vería una tarjeta que aparece con 29 px de golpe',
    (px: number): readonly number[] => [px < 700 ? 0 : 29 / ANCHO_DEL_CUADRO_DE_REFERENCIA],
    (anchosEn: (px: number) => readonly number[]) => mayorCrecimiento(anchosEn) < CRECIMIENTO_MAXIMO_POR_PX,
  )

  // ── NADA MUERE, Y NADA SE FUNDE ─────────────────────────────────────────
  /**
   * ⚠️ Todas las capas están en el marcado desde el primer cuadro y ninguna lleva
   * opacidad: con capas anidadas, una opacidad menor que 1 en una madre apagaría
   * a toda su cadena, y un fundido es exactamente lo que la referencia no tiene.
   */
  afirmarIgual(
    [...conMotion.matchAll(/data-capa="([^"]+)"/g)].map((m) => m[1]),
    // SPRINT DEMOS · la capa de demos va después, afuera de la cadena: la escala el vacío.
    ['escenario', ...CAPAS_DEL_TUNEL.proyectos.map((_, i) => `proyecto-${String(i)}`), 'cta', 'demos'],
    `las ${cuantas + 2} capas están en el marcado del primer cuadro, en el orden de la cadena, y después la de demos`,
  )
  const conOpacidad = (html: string): string[] =>
    [...html.matchAll(/<[a-z]+[^>]*data-capa="[^"]*"[^>]*>/g)].map((m) => m[0]).filter((t) => /opacity/.test(t))
  afirmarIgual(conOpacidad(conMotion), [], '  y ninguna escribe su opacidad: se ve o no se ve por su escala, nunca por un fundido')
  controlPositivo('  el detector vería una capa que se funde', '<div data-capa="proyecto-0" style="opacity:0">', (html: string) => conOpacidad(html).length === 0)

  /**
   * Cuántas se VEN a la vez, para el reporte: las que miden más de un píxel desde
   * la más chica que cubre el cuadro para adentro. Las de afuera quedan tapadas.
   */
  const CUBRE = 900 / (ANCHO_DEL_CUADRO_DE_REFERENCIA * (9 / 16))
  const reparto: Record<number, number> = {}
  for (let px = 0; px <= PX_DEL_TUNEL; px += 1) {
    const anchos = poseDelTunel(px).anchos
    let desde = 0
    anchos.forEach((a, i) => {
      if (a >= CUBRE) desde = i
    })
    const n = anchos.slice(desde).filter((a) => a * ANCHO_DEL_CUADRO_DE_REFERENCIA > 1).length
    reparto[n] = (reparto[n] ?? 0) + 1
  }
  console.log(
    `  reparto de cuántos proyectos se ven a la vez: ${Object.keys(reparto)
      .sort()
      .map((k) => `${k} → ${reparto[Number(k)]} px`)
      .join('  ·  ')}`,
  )
}
