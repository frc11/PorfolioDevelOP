/**
 * [L8b] LA SEGUNDA TANDA DE LA REVISIÓN DE VALENTINO, SÓLO ESCRITORIO — lo que L8b agregó. Sin navegador (las medidas y las fotos están en
 * L8b-resultado.md: `l8b-latido`, `l8b-entrada`, `l8b-resenas`, `l8b-pausa`).
 *
 *   1 · el botón del sonido late una vez en cada entrada (con su onda; con reducido, un pulso de opacidad), no repite tras el preloader
 *   2 · «Nuestros servicios»: el título baja sobre la bajada y crece; la caja del aro no depende de él
 *   3 · reseñas → CTA: un gatillo entero (los cruces de los bordes del tramo, sus lugares y el cableado)
 *   4 · Servicios: los destinos se calientan con la entrada a la vista, no en el cuadro del primer paso
 *
 * Cada afirmación lleva su control. Las clases arbitrarias se arman partidas (el escaneo de Tailwind 4 lee hasta los comentarios).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { animacionesDeLaEntrada, radioHastaLaEsquina } from '../../_chrome/sonido/LatidoDeLaEntrada'
import { latidoDelBoton } from '../../_chrome/preloader/animaciones'
import { LUGARES_DEL_GATILLO, cruceDelGatillo, guardadoDeVuelta, guardadoSuelto, pantallaDelCta } from '../../_secciones/por-que-develop/resenas/haciaElCta'
import { TAMANO_DEL_TITULO, TITULO_DE_ANTES_EM } from '../../_secciones/servicios/escenario/IntroDeServicios'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const clase = (...partes: string[]): string => partes.join('')

titulo('1 · [L8b] El latido de la entrada')
type DeLaEntrada = typeof animacionesDeLaEntrada
const unaVezConOnda = (f: DeLaEntrada): boolean => {
  const a = f(false, 0.03)
  const escala = a.boton.cuadros.some((c) => c.transform !== undefined)
  return a.boton.iteraciones === 1 && escala && a.ondas.length === 2 && a.ondas.every((o) => o.escala.iteraciones === 1 && o.opacidad.iteraciones === 1)
}
afirmar(unaVezConOnda(animacionesDeLaEntrada), 'el botón escala dos pulsos UNA vez (no el latido sin fin del preloader) y de cada pulso nace una onda, también de una vuelta')
controlPositivo('  el detector ve el latido sin fin del preloader', ((r: boolean, e: number) => ({ ...animacionesDeLaEntrada(r, e), boton: latidoDelBoton(false) })) as DeLaEntrada, unaVezConOnda)
const reducidoSutil = (f: DeLaEntrada): boolean => {
  const a = f(true, 0.03)
  return a.ondas.length === 0 && a.boton.cuadros.every((c) => c.transform === undefined) && a.boton.cuadros.filter((c) => c.opacity !== undefined && c.opacity < 1).length === 1
}
afirmar(reducidoSutil(animacionesDeLaEntrada), 'con movimiento reducido: un solo pulso de opacidad, sin escala y sin onda')
controlPositivo('  el detector ve la onda con movimiento reducido', ((r: boolean, e: number) => animacionesDeLaEntrada(false, e)) as DeLaEntrada, reducidoSutil)
afirmar(Math.abs(radioHastaLaEsquina(56, 48, 1440, 900) - Math.hypot(1384, 852)) < 1e-9, 'la onda cubre el fondo: su radio llega a la esquina más lejana de la pantalla')
const esquina = leer('_chrome/sonido/EsquinaDelSonido.tsx')
const latido = leer('_chrome/sonido/LatidoDeLaEntrada.tsx')
const cableado = (e: string, l: string): boolean => e.includes('<LatidoDeLaEntrada />') && l.includes('(esPrimera && conPreloader())') && l.includes('LATIDO_DE_LA_ENTRADA.desdePx') && l.includes('}, [ruta])') && l.includes("document.visibilityState !== 'visible'")
afirmar(cableado(esquina, latido), 'late en cada entrada (la carga y cada ruta), desde 1024, con la pestaña a la vista; tras el preloader de esta carga, no repite')
controlPositivo('  el detector ve un latido que repite el del preloader', [esquina, latido.replace('(esPrimera && conPreloader())', 'false')] as const, ([e, l]) => cableado(e, l))
controlPositivo('  el detector ve la esquina sin el latido', [esquina.replace('<LatidoDeLaEntrada />', ''), latido] as const, ([e, l]) => cableado(e, l))

titulo('2 · [L8b] «Nuestros servicios»: el título sobre la bajada, más grande; el aro quieto')
// La letra con el contenedor de 1440 × 900 (1376 px) y de 1024 × 768 (960 px): la nueva sobre la de antes.
const letra = (t: { divisor: number; tope: number }, cqw: number, svh: number): number => Math.min(cqw / t.divisor, (t.tope * svh) / 100)
const crece = (g: { divisor: number; tope: number }): boolean => [[1376, 900], [960, 768], [1302, 768]].every(([c, h]) => letra(g, c ?? 0, h ?? 0) >= 1.2 * letra(TAMANO_DEL_TITULO.escritorio, c ?? 0, h ?? 0) && letra(g, c ?? 0, h ?? 0) * TITULO_DE_ANTES_EM.ancho <= (c ?? 0) * 0.92)
afirmar(crece(TAMANO_DEL_TITULO.escritorioGrande), 'el título es al menos 1,2 veces el de antes a 1440, 1366 y 1024, y entra en un renglón (≤ 92 % del contenedor)')
controlPositivo('  el detector ve el tamaño de antes', TAMANO_DEL_TITULO.escritorio, crece)
const intro = leer('_secciones/servicios/escenario/IntroDeServicios.tsx')
const aroQuieto = (f: string): boolean =>
  f.includes(clase('escritorio:w-[calc(min(100cqw/var(--divisor-del-titulo),var(--tope-del-titulo))', '*var(--titulo-de-antes-em)*var(--ancho-del-aro))]')) &&
  !f.includes(clase('escritorio:w-[calc(var(--ancho-del-aro)', '*100%)]')) &&
  f.includes(clase('escritorio:bottom-', 'full')) &&
  f.includes(clase('escritorio:[--divisor-del-titulo:var(--divisor-del-titulo-', 'grande)]')) &&
  f.indexOf('<TituloQueSePintaAlLlegar') > f.indexOf('data-lugar-de-los-nanobots')
afirmar(aroQuieto(intro), 'la caja del aro se mide con el título de antes en em (no con el título), y el título cuelga del tope de la bajada con su tamaño grande')
controlPositivo('  el detector ve el aro medido contra el título (el de antes)', intro.replace(clase('escritorio:w-[calc(min(100cqw/var(--divisor-del-titulo),var(--tope-del-titulo))', '*var(--titulo-de-antes-em)*var(--ancho-del-aro))]'), clase('escritorio:w-[calc(var(--ancho-del-aro)', '*100%)]')), aroQuieto)
afirmar(TITULO_DE_ANTES_EM.ancho === 7.32 && TITULO_DE_ANTES_EM.alto === 0.9 && TITULO_DE_ANTES_EM.subidaDelAro === 0.45, 'el título de antes, medido en el build: 7,32 em de ancho, 0,9 em de alto, el aro sube 0,45 em')

titulo('3 · [L8b] Reseñas → CTA: un gatillo entero')
type Cruce = typeof cruceDelGatillo
const cruces = (f: Cruce): boolean =>
  f(5.95, 6.06) === 'ida' &&
  f(6.0, 6.01) === null &&
  f(9.63, 9.5) === 'vuelta' &&
  f(5, 9.8) === null &&
  f(9.7, 5) === null &&
  f(7, 7.5) === null &&
  f(8, 7.5) === null
afirmar(cruces(cruceDelGatillo), 'bajar por el fin de la lectura es la ida; subir por el CTA armado, la vuelta; un salto que cruza todo el tramo o un movimiento adentro no disparan')
controlPositivo('  el detector ve el salto del foco al CTA como un cruce', ((a: number, b: number) => (a <= 6.02 && b > 6.02 ? 'ida' : cruceDelGatillo(a, b))) as Cruce, cruces)
controlPositivo('  el detector ve un gatillo sin vuelta (la de antes: sigue al scroll)', ((a: number, b: number) => (cruceDelGatillo(a, b) === 'vuelta' ? null : cruceDelGatillo(a, b))) as Cruce, cruces)
const cerca = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9
afirmar(cerca(LUGARES_DEL_GATILLO.lectura, 6) && cerca(pantallaDelCta(0), 6.6) && cerca(pantallaDelCta(1), 9.6) && cerca(LUGARES_DEL_GATILLO.guardado, 6.78) && cerca(LUGARES_DEL_GATILLO.cta, 9.63), 'los lugares en pantallas del pin: la lectura termina en 6, la transformación va de 6,6 a 9,6; la ida se para en 6,78 (pasado el disparo) y termina en 9,63')
afirmar(guardadoSuelto(0.83) && !guardadoSuelto(0.8) && guardadoDeVuelta(0) && !guardadoDeVuelta(0.2), 'la ida sigue cuando la cámara soltó el guardado; la vuelta termina con el guardado en 0')
const tramo = leer('_secciones/por-que-develop/resenas/useTramoDeLasResenas.ts')
const gatillo = leer('_secciones/por-que-develop/resenas/useGatilloHaciaElCta.ts')
const cableadoDelGatillo = (t: string, g: string): boolean =>
  t.includes('useGatilloHaciaElCta(pin, raiz, disparoDeLaBajada)') && g.includes('viajeEnCurso() !== null') && g.includes('retenerLosGestos(') && g.includes('esperar(guardadoSuelto') && g.includes('esperar(guardadoDeVuelta') && g.includes('if (cola && !g.nuevo) return true')
afirmar(cableadoDelGatillo(tramo, gatillo), 'el tramo lo usa; no arranca con un viaje del navbar; retiene los gestos y la cola del que disparó; espera al guardado en la ida y en la vuelta')
controlPositivo('  el detector ve el tramo sin el gatillo', [tramo.replace('useGatilloHaciaElCta(pin, raiz, disparoDeLaBajada)', ''), gatillo] as const, ([t, g]) => cableadoDelGatillo(t, g))
controlPositivo('  el detector ve la cola del gesto suelta', [tramo, gatillo.replace('if (cola && !g.nuevo) return true', '')] as const, ([t, g]) => cableadoDelGatillo(t, g))

titulo('4 · [L8b] Servicios: los destinos, calentados con la entrada a la vista')
const escenario = leer('_secciones/servicios/escenario/EscenarioDeServicios.tsx')
const calentar = leer('_secciones/servicios/escenario/useCalentarLosDestinos.ts')
const antes = (e: string, c: string): boolean =>
  e.includes('useCalentarLosDestinos(escenario, !telefono)') && c.includes('new IntersectionObserver(') && c.includes('requestIdleCallback(calentar') && c.includes('Object.values(DESTINO_DEL_SERVICIO)') && c.includes('calentarElDestino(href)')
afirmar(antes(escenario, calentar), 'desde 1024 el escenario calienta las páginas de los servicios con la entrada a la vista y el hilo ocioso (no en el primer paso)')
controlPositivo('  el detector ve el escenario sin calentar (el de antes)', [escenario.replace('useCalentarLosDestinos(escenario, !telefono)', ''), calentar] as const, ([e, c]) => antes(e, c))

cerrar('s90-l8b')
