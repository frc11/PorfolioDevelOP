/**
 * [B1] s76 · B1.1b — LA BASE DEL SELECTOR, pura: la REGLA DE ALTURAS en los tres anchos, la noche del tramo, los pasos y las anclas,
 * y el reloj de Demos contra el túnel archivado. Cada afirmación con su control positivo.
 *
 * [B1.2b] Las banderas salieron: el paso es UNA constante (`PANTALLAS_POR_PASO`, 1,5 pantallas por proyecto). Donde B1.1b barría
 * los tres valores de la bandera, ahora barre la constante y dos valores de control (`PASOS`): lo que se afirma sigue siendo que
 * TODO se deriva del paso (el alto, el `k` por ancho, las anclas y el reloj de Demos), no sólo que el de la página da bien.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { NOCHE_DISPARADA, nivelConLaNocheDisparada } from '../escena/nocheDisparada'
import { sampleLightArc } from '../escena/choreographySampler'
import type { MutableLightLevels } from '../escena/choreographyTypes'
import { pantallaDeProgreso, progresoDePantalla } from '../escena/recorrido'
import { TRAMO_ESTIRADO, medidaSinElEstiramiento, sinElEstiramiento, type TramoEstirado } from '../escena/tramoEstirado'
import { DISPARO_DE_LA_NOCHE, SOLAPE_DE_LA_SECCION } from '../../_secciones/trabajos/geometria'
import { ARRANQUE_DEL_VACIO, LLEGADA_DE_LOS_DEMOS, PX_DEL_VACIO, PX_DE_LA_SECCION_DE_HOY, vacioSinTope } from '../../_secciones/trabajos/demos/relojDeDemos'
import { ANCLAS_DEL_PORTFOLIO } from '../../_secciones/trabajos/portfolio/anclas'
import {
  ADELANTO_DE_DEMOS, ANTES_DEL_PIN, CANTIDAD_DE_PASOS, EN_LA_COLA, HISTERESIS_PX, PANTALLAS_POR_PASO, PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA, PX_DE_LA_APROXIMACION,
  bordesDelPaso, centroDelPaso, kDelAncho, mostradoDeDemos, pantallasDelAncla, pasoConHisteresis, pasoEn, pxDeLaSalida, pxDeLaSeccion,
  pxDelMostradoDeDemos, pxDelScroll, type AnchoDelPortfolio, type IndiceDePaso,
} from '../../_secciones/trabajos/portfolio/pasos'
import { CAPA_DEL_VACIO, arranqueDeLaSalida, pxDeLaSeccion as pxDeLaSeccionDeAntes, pxDelTunelEn } from '../../_archivo/tunel-portfolio/geometria'
import { ESTIRAMIENTO_DEL_TUNEL, PX_DEL_ARRANQUE_DEL_TUNEL } from '../../_archivo/tunel-portfolio/ritmo'
import { ORIGEN_DEL_TUNEL, PX_DEL_TUNEL, PX_DEL_VACIO as PX_DEL_VACIO_DEL_TUNEL } from '../../_archivo/tunel-portfolio/tunel'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const ANCHOS: readonly AnchoDelPortfolio[] = ['escritorio', 'tablet', 'movil']
/** La constante de la página y dos valores de control de la derivación (uno que comprime en el teléfono: k < 1). */
const PASOS = [PANTALLAS_POR_PASO, 1, 2] as const
const V3 = path.join(process.cwd(), 'src/app/v3')
/** Lo que el túnel estiraba en cada ancho (escritorio: lo descontaba la escena). */
const E: Readonly<Record<AnchoDelPortfolio, number>> = { escritorio: 1, tablet: ESTIRAMIENTO_DEL_TUNEL.tablet, movil: ESTIRAMIENTO_DEL_TUNEL.movil }
const SALIDA_DE_ANTES = pxDeLaSeccionDeAntes(arranqueDeLaSalida(3))

/** La escena midiendo un scroll `y` con un tramo anotado (o ninguno), sobre un panel de tope `tope` y una ventana `h`. */
function medida(tramo: Omit<TramoEstirado, 'panel'> | null, tope: number, y: number, abajo: number, h: number): { y: number; abajo: number } {
  const panel = { isConnected: true, getBoundingClientRect: () => ({ top: tope }) } as unknown as Element
  TRAMO_ESTIRADO.valor = tramo === null ? null : { ...tramo, panel }
  const r = medidaSinElEstiramiento(y, abajo, 0, h, { y: 0, abajo: 0 })
  TRAMO_ESTIRADO.valor = null
  return { y: r.y, abajo: r.abajo }
}

/** Lo que la escena veía HOY en un ancho: el túnel estirado (anotado sólo desde 1024) en la sección de antes. */
const tramoDeAntes = (ancho: AnchoDelPortfolio): Omit<TramoEstirado, 'panel'> | null =>
  ancho === 'escritorio' ? { k: ESTIRAMIENTO_DEL_TUNEL.escritorio, arranque: PX_DEL_ARRANQUE_DEL_TUNEL, largo: PX_DEL_TUNEL } : null
const altoDeAntes = (ancho: AnchoDelPortfolio): number => 6813 + ((ancho === 'escritorio' ? ESTIRAMIENTO_DEL_TUNEL.escritorio : E[ancho]) - 1) * PX_DEL_TUNEL
const tramoNuevo = (ancho: AnchoDelPortfolio, paso: number): Omit<TramoEstirado, 'panel'> => ({ k: kDelAncho(paso, ancho), arranque: PX_DE_LA_APROXIMACION, largo: PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho] })

/** El mapeo afuera del selector, cada 10 px de la regla: el de la escena nueva contra el de hoy. Devuelve el peor desvío (px). */
function desvioAfuera(ancho: AnchoDelPortfolio, paso: number, h: number, descontar: boolean): number {
  const tope = 5073
  const resto = 20000
  const escala = h / 900
  const cero = tope - h
  const nuevo = pxDeLaSeccion(paso)
  const antes = altoDeAntes(ancho)
  let peor = 0
  for (let p = -900; p <= nuevo + 900; p += 10) {
    if (p >= PX_DE_LA_APROXIMACION && p < pxDeLaSalida(paso)) continue
    const pAntes = p < PX_DE_LA_APROXIMACION ? p : p - (nuevo - antes)
    const yNuevo = cero + p * escala
    const yAntes = cero + pAntes * escala
    const n = medida(descontar ? tramoNuevo(ancho, paso) : null, tope, yNuevo, tope + nuevo * escala + resto, h)
    const a = medida(tramoDeAntes(ancho), tope, yAntes, tope + antes * escala + resto, h)
    peor = Math.max(peor, Math.abs(n.y - a.y), Math.abs(n.abajo - a.abajo))
  }
  return peor
}

export function afirmarLaBase(): void {
  titulo('B1.1b · 3 · La REGLA DE ALTURAS: afuera del selector la escena ve los mismos píxeles que hoy, en los tres anchos')

  afirmarIgual(ANCHOS.map((a) => PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[a]), ANCHOS.map((a) => SALIDA_DE_ANTES - PX_DE_LA_APROXIMACION + (E[a] - 1) * PX_DEL_TUNEL), 'lo que la escena veía entre el pin y la salida es la fórmula del túnel archivado: 2.982 desde 1024, 3.722 en tablet, 4.462 en el teléfono')
  for (const paso of PASOS) {
    for (const ancho of ANCHOS) {
      for (const h of [900, 844]) {
        const d = desvioAfuera(ancho, paso, h, true)
        afirmar(d < 1e-6, `paso ${paso}, ${ancho}, alto ${h}: k = ${kDelAncho(paso, ancho).toFixed(5)}, desvío máximo afuera del selector ${d.toExponential(1)} px`)
      }
    }
  }
  afirmar(kDelAncho(1, 'movil') < 1, '  con el paso de control de 1 en el teléfono k queda por debajo de 1 (el selector comprime) y el descuento vale igual')
  controlPositivo('sin el descuento del selector, lo de después se corre', 'escritorio' as const, (a: AnchoDelPortfolio) => desvioAfuera(a, PANTALLAS_POR_PASO, 900, false) < 1e-6)
  afirmarIgual(PASOS.map((p) => Math.round((pxDeLaSeccion(p) / 9) * 100) / 100), [1025.67, 825.67, 1225.67], 'la sección mide 1025,67svh con la constante (1,5 pantallas por proyecto, cuatro pasos) y lo que da la derivación con 1 y con 2')

  titulo('B1.1b · 4 · El tramo del Portfolio es de noche')

  // La gota prende con la caja SIN solape a `lineaDeLaNoche` del tope del cuadro: en px de la regla del progreso de la sección.
  const disparo = (SOLAPE_DE_LA_SECCION - DISPARO_DE_LA_NOCHE.ida / 100) * 900
  afirmar(disparo < 0, `la noche se dispara ${(-disparo).toFixed(0)} px de la regla ANTES de que arranque el progreso de la sección: toda la aproximación y el selector van con la gota disparada`)
  const pin = progresoDePantalla(pantallaDeProgreso(0.5) - SOLAPE_DE_LA_SECCION)
  const nivel = (p: number, conGota: boolean): number => {
    const arco: MutableLightLevels = { level: 0, kelvin: 0, azimuthDeg: 0, elevationDeg: 0 }
    sampleLightArc(p, arco)
    NOCHE_DISPARADA.cantidad = conGota ? 1 : 0
    const n = nivelConLaNocheDisparada(arco.level)
    NOCHE_DISPARADA.cantidad = 0
    return n
  }
  // El progreso de la escena en cada px de la sección (desde 1024, el paso por defecto): la regla descontada sobre los nudos.
  const arranque = pantallaDeProgreso(0.5) - SOLAPE_DE_LA_SECCION - 1
  const kDefecto = kDelAncho(PANTALLAS_POR_PASO, 'escritorio')
  const progresos: number[] = []
  for (let px = 0; px <= pxDeLaSeccion(PANTALLAS_POR_PASO); px += 10) {
    progresos.push(progresoDePantalla(arranque + sinElEstiramiento(px, PX_DE_LA_APROXIMACION, kDefecto * PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA.escritorio, kDefecto) / 900))
  }
  afirmar(progresos.every((p) => nivel(p, true) <= 0.04 + 1e-12), `con la gota disparada el nivel no pasa de la noche en ninguno de los ${progresos.length} puntos de la sección (cada 10 px)`)
  controlPositivo('sin la gota, la aproximación no es de noche', progresos[0], (p: number) => nivel(p, false) <= 0.04)
  // [B1.2b] Ya no se apagan: la ventana existía porque el túnel tapaba la sala. Ninguno de los tres lee una ventana del progreso.
  const ventana = /fueraDelTunel|tunelEnLaEscena|TUNEL_EN_LA_ESCENA/
  const sinComentarios = (c: string): string => c.replace(/^\s*(\/\/|\*).*$/gm, '')
  const losTres = ['_lib/escena/estrellas/Estrellas.tsx', '_lib/escena/estrellas/Fugaz.tsx', '_lib/escena/formacion/Formacion.tsx'].map((r) => sinComentarios(readFileSync(path.join(V3, r), 'utf8')))
  afirmar(losTres.every((c) => !ventana.test(c)) && !existsSync(path.join(V3, '_lib/escena/tunelEnLaEscena.ts')), `estrellas, fugaces y la formación siguen durante el Portfolio (desde el pin, p ${pin.toFixed(5)}): ninguno se apaga por una ventana del progreso y la ventana se borró`)
  controlPositivo('  el detector ve una ventana', 'const visible = fueraDelTunel(rig.current.progress)', (c: string) => !ventana.test(sinComentarios(c)))

  titulo('B1.1b · 5 · Los pasos y las anclas ([B1.2b] uno por proyecto y uno para «la tuya»), con la constante y los de control')

  for (const paso of PASOS) {
    const centros = Array.from({ length: CANTIDAD_DE_PASOS }, (_, i) => pasoEn(centroDelPaso(i, paso), paso))
    afirmarIgual(centros, [0, 1, 2, 3], `paso ${paso}: el centro de cada paso cae en su paso; antes del pin, ${pasoEn(PX_DE_LA_APROXIMACION - 1, paso)}; en la cola, ${pasoEn(pxDeLaSalida(paso), paso)}`)
    // Con el panel en 0 y una ventana de 844: el salto nativo deja el ancla arriba del cuadro, o sea el scroll en su tope.
    const llega = ANCLAS_DEL_PORTFOLIO.map((a) => pasoEn(pxDelScroll(pantallasDelAncla(a.paso, paso) * 844, 0, 844), paso))
    afirmarIgual(llega, ANCLAS_DEL_PORTFOLIO.map((a) => a.paso), `  y cada deep link (el salto nativo pone su ancla arriba del cuadro) cae en el paso de su proyecto`)
  }
  controlPositivo('  un ancla sin la pantalla de antes cae en el paso equivocado', PANTALLAS_POR_PASO, (paso: number) => ANCLAS_DEL_PORTFOLIO.every((a) => pasoEn((pantallasDelAncla(a.paso, paso) + 2) * 900, paso) === a.paso))
  const P = PANTALLAS_POR_PASO
  const borde = bordesDelPaso(2 as IndiceDePaso, P)
  afirmar(pasoConHisteresis(2, borde.hasta + HISTERESIS_PX - 1, P) === 2 && pasoConHisteresis(2, borde.hasta + HISTERESIS_PX, P) === 3 && pasoConHisteresis(ANTES_DEL_PIN, PX_DE_LA_APROXIMACION, P) === ANTES_DEL_PIN && pasoConHisteresis(3, pxDeLaSalida(P) + HISTERESIS_PX, P) === EN_LA_COLA, `la histéresis: para dejar un paso hay que pasar su borde por ${HISTERESIS_PX} px (también al entrar y al salir del selector)`)
  controlPositivo('  sin histéresis el borde dispara enseguida', 2 as IndiceDePaso, (i: IndiceDePaso) => pasoEn(bordesDelPaso(i, P).hasta + 1, P) === i)

  titulo('B1.1b · 6 · El reloj de Demos: la cola al píxel, sin el túnel')

  afirmar(PX_DEL_VACIO === PX_DEL_VACIO_DEL_TUNEL && ARRANQUE_DEL_VACIO === SALIDA_DE_ANTES && PX_DE_LA_SECCION_DE_HOY === 6813, 'el reloj del vacío tiene los números del túnel archivado: 969 px desde la salida (3.882 de 6.813)')
  let mismo = true
  for (let m = 0.5; m <= 1; m += 1 / 4096) if (Math.abs(vacioSinTope(m) - (pxDelTunelEn(m) + ORIGEN_DEL_TUNEL - CAPA_DEL_VACIO.arranca) / PX_DEL_VACIO_DEL_TUNEL) > 1e-9) mismo = false
  afirmar(mismo, '  y la fracción del vacío sin tope es la de antes en cada `mostrado`')
  // [B1.2d] A9 · la cola de antes, corrida `ADELANTO_DE_DEMOS`: el título de Demos arranca en el borde de la cola menos la histéresis,
  // donde el Portfolio ya se fue bajando y subiendo (0 px de escena sola). Las alturas no cambian.
  const arranqueDelTitulo = (paso: number, reloj: (m: number, p: number) => number = pxDelMostradoDeDemos): number =>
    reloj((ARRANQUE_DEL_VACIO + LLEGADA_DE_LOS_DEMOS.desde * PX_DEL_VACIO) / 6813, paso)
  for (const paso of PASOS) {
    const cola = [0, 300, 1131, 2000, 2931].map((d) => mostradoDeDemos(pxDeLaSalida(paso) + d, paso) * 6813)
    afirmarIgual(cola.map((x) => Math.round(x * 1e6) / 1e6), [0, 300, 1131, 2000, 2931].map((d) => Math.round(Math.min(6813, SALIDA_DE_ANTES + d + ADELANTO_DE_DEMOS) * 1e6) / 1e6), `paso ${paso}: la cola de antes corrida ${ADELANTO_DE_DEMOS.toFixed(1)} px (A9: Demos arranca mientras el Portfolio se va)`)
    afirmar(Math.abs(arranqueDelTitulo(paso) - (pxDeLaSalida(paso) - HISTERESIS_PX)) < 1e-6, `  paso ${paso}: el título de Demos empieza a subir en ${arranqueDelTitulo(paso).toFixed(1)}, el borde de la cola menos la histéresis (el Portfolio se fue bajando y subiendo)`)
  }
  controlPositivo('  el detector ve el reloj de B1.2c (el título de Demos 581 px después de la cola: 551 px de escena sola bajando)', (m: number, p: number) => m * 6813 + pxDeLaSalida(p) - SALIDA_DE_ANTES, (reloj: (m: number, p: number) => number) => arranqueDelTitulo(PANTALLAS_POR_PASO, reloj) <= pxDeLaSalida(PANTALLAS_POR_PASO) - HISTERESIS_PX + 1e-6)
  afirmar(mostradoDeDemos(PX_DE_LA_APROXIMACION + 100, PANTALLAS_POR_PASO) * 6813 < SALIDA_DE_ANTES, '  y antes de la cola Demos no llega (el vacío en 0)')
  controlPositivo('  un reloj que no corre la cola haría llegar a Demos en otro lugar', (px: number) => px / 6813, (reloj: (px: number) => number) => Math.abs(reloj(pxDeLaSalida(PANTALLAS_POR_PASO)) * 6813 - (SALIDA_DE_ANTES + ADELANTO_DE_DEMOS)) < 1e-6)
}
