/**
 * [L9b] TERCERA TANDA LIVIANA — lo que L9b cambió. Sin navegador (las medidas y las fotos están en L9b-resultado.md).
 *
 *   1 · el latido de la entrada: la onda más lenta (el doble) y UN latido por entrada, con la página lista
 *   2 · Servicios: el cambio de capa de los nanobots con el enjambre afuera del panel y del título
 *   3 · reseñas: se asientan al llegar y un gesto lleva al CTA (y vuelve asentada)
 *
 * Cada afirmación lleva su control.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { LATIDO } from '../../_chrome/preloader/animaciones'
import { LATIDO_DE_LA_ENTRADA, animacionesDeLaEntrada, numeroDeLaEntrada, tomarElLatido } from '../../_chrome/sonido/LatidoDeLaEntrada'
import { LUGARES_DEL_GATILLO, cruceDelGatillo, gestoAsentado, seFueDelAsiento } from '../../_secciones/por-que-develop/resenas/haciaElCta'
import { PIN_CON_LAS_RESENAS, avanceDeLasResenas, estadoDelAvance } from '../../_secciones/por-que-develop/resenas/tramo'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')

titulo('1 · [L9b] El latido de la entrada: más lento y una sola vez')
type DeLaEntrada = typeof animacionesDeLaEntrada
const ondaLenta = (f: DeLaEntrada): boolean =>
  f(false, 0.03).ondas.every((o) => {
    const [ultimaEscala, ultimaOpacidad] = [o.escala.cuadros[o.escala.cuadros.length - 1], o.opacidad.cuadros[o.opacidad.cuadros.length - 1]]
    return o.escala.duracion >= 1.8 * LATIDO.ondaMs && o.opacidad.duracion === o.escala.duracion && o.escala.iteraciones === 1 && ultimaEscala?.transform === 'scale(1)' && ultimaOpacidad?.opacity === 0
  })
afirmar(ondaLenta(animacionesDeLaEntrada) && LATIDO_DE_LA_ENTRADA.ondaMs === 2500, 'la onda viaja y se apaga en 2,5 s (el doble de la del preloader, 1,25 s), de una vuelta, y termina del tamaño entero y apagada')
controlPositivo('  el detector ve la onda de antes (la del preloader)', ((r: boolean, e: number) => ({ ...animacionesDeLaEntrada(r, e), ondas: animacionesDeLaEntrada(r, e).ondas.map((o) => ({ escala: { ...o.escala, duracion: LATIDO.ondaMs }, opacidad: { ...o.opacidad, duracion: LATIDO.ondaMs } })) })) as DeLaEntrada, ondaLenta)
afirmar(LATIDO.ondaMs === 1250, 'la onda del preloader no cambia (su latido que se repite mientras espera, igual)')

const unaPorEntrada = (tomar: (n: number) => boolean): boolean => {
  const a = numeroDeLaEntrada('/v3')
  const primera = tomar(a)
  const repetida = tomar(a) || tomar(numeroDeLaEntrada('/v3'))
  const b = numeroDeLaEntrada('/v3/pagina-base')
  return primera && !repetida && b > a && tomar(b) && !tomar(b)
}
afirmar(unaPorEntrada(tomarElLatido), 'cada entrada toma su latido UNA vez: el efecto que vuelve a correr o la pieza remontada no laten de nuevo; una ruta nueva, sí')
controlPositivo('  el detector ve un latido por cada corrida del efecto (lo de antes)', (): boolean => true, unaPorEntrada)
const latido = leer('_chrome/sonido/LatidoDeLaEntrada.tsx')
const cableado = (l: string): boolean => l.includes('if (!paginaLista() ||') && l.includes('if (!tomarElLatido(entrada)) return') && l.includes('ENTRADAS.latio >= entrada') && l.includes('}, [latido])') && l.includes("document.querySelector(VELO) === null") && l.includes("document.readyState === 'complete'")
afirmar(cableado(latido), 'late con la página lista (el preloader y el velo idos, el documento cargado), toma el latido de la entrada antes de latir y un cambio de preferencia no lo reinicia')
controlPositivo('  el detector ve el latido sin esperar la página', latido.replace('if (!paginaLista() ||', 'if ('), cableado)
controlPositivo('  el detector ve el latido que se reinicia con la preferencia', latido.replace('}, [latido])', '}, [latido, reducido])'), cableado)

titulo('3 · [L9b] Reseñas: se asientan y un gesto lleva al CTA')
const cerca = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9
afirmar(cerca(LUGARES_DEL_GATILLO.asiento, 4.5) && estadoDelAvance(avanceDeLasResenas(LUGARES_DEL_GATILLO.asiento / PIN_CON_LAS_RESENAS), null).entrada === 1 && LUGARES_DEL_GATILLO.asiento < LUGARES_DEL_GATILLO.lectura, 'el asiento es la pantalla 4,5: el aro ya armado, una pantalla y media antes del fin de la lectura')
type Cruce = typeof cruceDelGatillo
const llega = (f: Cruce): boolean =>
  f(4.3, 4.55) === 'asiento' && f(4.3, 6.3) === 'asiento' && f(4.5, 4.7) === null && f(4.3, 7.5) === null && f(3, 9.8) === null && f(5.95, 6.06) === 'ida' && f(9.63, 9.5) === 'vuelta' && f(4.6, 4.3) === null
afirmar(llega(cruceDelGatillo), 'bajar hasta el aro armado lo asienta (aunque el gesto se pase de largo); un salto que cae en la transformación o cruza todo, no; los cruces de antes siguen')
controlPositivo('  el detector ve el tramo sin asiento (lo de antes: había que scrollear la lectura)', ((a: number, b: number) => (cruceDelGatillo(a, b) === 'asiento' ? null : cruceDelGatillo(a, b))) as Cruce, llega)
const gestos = (f: typeof gestoAsentado): boolean => f(1, true, false) === 'ida' && f(1, true, true) === 'ida' && f(-1, true, true) === 'soltar' && f(1, false, true) === 'retener' && f(-1, false, true) === 'retener' && f(-1, false, false) === 'soltar'
afirmar(gestos(gestoAsentado), 'asentada: un gesto nuevo hacia abajo es la ida; hacia arriba suelta; la cola del que llegó se retiene')
controlPositivo('  el detector ve el asiento que deja scrollear (sin la ida de un gesto)', ((s: -1 | 1, n: boolean, c: boolean) => (c && !n ? 'retener' : 'soltar')) as typeof gestoAsentado, gestos)
afirmar(!seFueDelAsiento(4.5) && !seFueDelAsiento(4.56) && seFueDelAsiento(4.7) && seFueDelAsiento(3.9), 'asentada, la página que se mueve sin un gesto (la barra, el foco) la suelta')
const gatillo = leer('_secciones/por-que-develop/resenas/useGatilloHaciaElCta.ts')
const cableadoDelAsiento = (g: string): boolean =>
  g.includes("if (cruce === 'asiento') asentarse()") && g.includes('gestoAsentado(g.sentido, g.nuevo, cola)') && g.includes("esperar(guardadoDeVuelta, () => terminar('asentada'))") && g.includes('scrollDe(LUGARES_DEL_GATILLO.asiento), GATILLO_HACIA_EL_CTA.vueloDeVueltaMs') && g.includes('if (seFueDelAsiento(ahora) || viajeEnCurso() !== null) abortar()')
afirmar(cableadoDelAsiento(gatillo), 'el gatillo asienta al llegar, decide con el gesto asentado, y la vuelta termina asentada en el asiento')
controlPositivo('  el detector ve la vuelta al fin de la lectura (la de antes)', gatillo.replace('scrollDe(LUGARES_DEL_GATILLO.asiento), GATILLO_HACIA_EL_CTA.vueloDeVueltaMs', 'scrollDe(LUGARES_DEL_GATILLO.lectura), GATILLO_HACIA_EL_CTA.vueloDeVueltaMs'), cableadoDelAsiento)
controlPositivo('  el detector ve el gatillo sin asiento', gatillo.replace("if (cruce === 'asiento') asentarse()", ''), cableadoDelAsiento)

cerrar('s91-l9b')
