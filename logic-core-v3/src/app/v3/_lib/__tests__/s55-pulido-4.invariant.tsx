/**
 * PULIDO 4 — el invariante: npm run test:s55-pulido-4
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   C1 · el CTA bien hecho: el cruce de PULIDO 2 recuperado («Seis razones» → «HABLANOS»); la metamorfosis de los seis valores
 *        en la frase (atrás, se derriten o cambian de contorno, la frase vuelve adelante; `?meta=fusion|contorno`), todo
 *        terminando junto; CONTINUA en el scroll en las dos direcciones (pasos chicos, ida y vuelta, con frenadas); sin el CTA
 *        en un viaje; la frase en Archivo con su copy; las siete pantallas, el teléfono clavado, el movimiento reducido y
 *        ninguna letra delante del logo.
 *   C2 · el encastre: el golpe suena (desde el mismo evento; `?golpe=a|b`; más fuerte que el pulso, sin saturar) y el brillo
 *        pasa del filo del logo al círculo quieto (fuera del oscurecimiento, pulsa con cada onda y fuerte en el golpe).
 *   C3 · el mouse del pie: ±22° y hasta ±12°, con más ganancia por píxel en vertical; sin el techo del domo y debajo del tope
 *        de s23 (lo miden `s54` B2, con el rango nuevo).
 *   C4 · las filas de la tablet del pie (A2), por tokens registrados: `s6-tokens` T5 vuelve a verde.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-4.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-4/mirar.txt`.
 * [PULIDO 5] D1 · el cruce se borró (el pedido era el giro de `2411371a`, que fija `s56` D1 con su control); lo que acá seguía
 * fijado del cruce pasa al giro y `contorno` (la del producto) se arma una vez con topología fija. El log de cada aserción que
 * cambió: `docs/rediseno/SPRINT-PULIDO-5.md`.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

import { ENTORNO, entornoPedido } from '../escena/entorno'
import { MARCO_DEL_CTA } from '../escena/ctaDelFinal/armadoDelCta'
import { ctaVisibleEnElViaje } from '../escena/ctaDelFinal/enVivo'
import { CONTORNO, remuestrear } from '../escena/ctaDelFinal/contorno'
import { avancesDe, FUENTES_DEL_CTA } from '../escena/ctaDelFinal/fuentesDelCta'
import {
  ATRAS,
  METAMORFOSIS,
  RELEVO_DE_LOS_VALORES,
  TRANSFORMACION,
  apareceDeLosValores,
  estadoDeLaMetamorfosis,
  nuevaPose,
  posesDe,
  valoresAPlano,
  type EscenaDeLaTransformacion,
  type EstadoDeLaMetamorfosis,
  type LetraEnPantalla,
  type PosesDeLaTransformacion,
} from '../escena/ctaDelFinal/transformacion'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import { TIEMPOS_DEL_FINAL } from '../escena/finalDelRecorrido'
import { VENTANA_DE_LA_TRANSFORMACION, ventanaDelValor } from '../../_secciones/por-que-develop/geometria'
import { asentar, nuevoSeguidor, seguirAlScroll, type SeguidorDelValor } from '../../_secciones/por-que-develop/asientoDelValor'
import { CTA, FRASE, VALORES } from '../../_secciones/por-que-develop/contenido'
import ARCHIVO_NORMAL_CTA from '../../_fuentes/archivo-normal-cta.json'
import ARCHIVO_NORMAL_CTA_FUERTE from '../../_fuentes/archivo-normal-cta-fuerte.json'
import ARCHIVO_700 from '../../_fuentes/archivo-700-titulos.json'
import CHIVO_400_VALORES from '../../_fuentes/chivo-400-valores.json'
import { CALMA_EN_EL_PISO } from '../escena/final/enElPiso'
import { CORTES_DEL_SPRITE } from '../sonido/sprite'
import { ORBITA_DEL_MOUSE, gradosVerticales, nuevaOrbita, pasoDeLaOrbita } from '../escena/final/orbitaDelMouse'
import { SONIDOS } from '../sonido/catalogo'
import { afirmar, cerrar, controlPositivo, noCorre, titulo } from './afirmar'

import * as THREE from 'three'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const leerDeLaRaiz = (ruta: string): string => readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const tramo = (p: number, v: { readonly desde: number; readonly hasta: number }): number => Math.min(1, Math.max(0, (p - v.desde) / (v.hasta - v.desde)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C1 · El CTA: la transición de «Seis razones» (el giro desde PULIDO 5) y la metamorfosis de los seis valores en la frase')

// LAS LETRAS SINTÉTICAS: «Seis razones / para elegirnos» a los lados (como en el escenario) y «HABLANOS» al centro.
const renglon = (texto: string, x0: number, y: number, cuerpo: number, r: number): LetraEnPantalla[] => [...texto].filter((c) => c.trim() !== '').map((c, i) => ({ x: x0 + i * 0.55 * cuerpo, y, cuerpo, ancho: 0.5 * cuerpo, alto: 0.7 * cuerpo, renglon: r, letra: c }))
const ORIGEN = [...renglon(FRASE.izquierda, 130, 200, 60, 0), ...renglon(FRASE.derecha, 1000, 180, 60, 1)]
const HABLANOS = renglon(CTA.rotulo.toUpperCase(), 560, 520, 90, 0)
const ESCENA: EscenaDeLaTransformacion = { origen: ORIGEN, destino: HABLANOS, pantalla: { ancho: 1440, alto: 900 }, armado: 520 }
const poses = (): PosesDeLaTransformacion => ({ origen: ORIGEN.map(nuevaPose), destino: HABLANOS.map(nuevaPose) })
type Cruce = typeof posesDe

// [PULIDO 5] D1 · EL CRUCE SE BORRÓ (el pedido era el giro): su aserción («el cruce de `2411371a`, recuperado») y su control
// se fueron; el giro, tal como estaba en `2411371a`, lo fija `s56` D1 · 1 con su control.

// LA METAMORFOSIS: en 0, los valores en su lugar (nada cambió); se van atrás «poco» (ATRAS: a ~0,8 de su tamaño) y ANTES de
// cambiar; en `fusion`, se derriten en su lugar antes de irse; el disolvente cruza a la frase en el medio; la frase se limpia y
// vuelve adelante. TODO JUNTO: la frase termina en el mismo punto del scroll que «HABLANOS» (en 1, y no antes). [PULIDO 5] D1 ·
// «HABLANOS» se asienta con el giro (`baja`). [PULIDO 6] E1 · una sola técnica (`contorno`): `fusion` se borró.
const asientaDelCta = (p: number): number => Math.min(1, Math.max(0, (p - TRANSFORMACION.giro.baja[0]) / TRANSFORMACION.giro.baja[1]))
const metaBien = (f: (p: number) => EstadoDeLaMetamorfosis): boolean => ['contorno'].every(() => {
  const [a, b] = [f(0), f(1)]
  const casi = f(0.995)
  const enCero = a.atras === 0 && a.cambia === 0 && a.sucia === 1 && a.adelante === 0 && a.turbulencia === 0
  const enUno = b.atras === 1 && b.cambia === 1 && b.sucia === 0 && b.adelante === 1 && b.espesor === 1 && b.turbulencia === 0
  const juntos = casi.adelante < 1 && asientaDelCta(0.995) < 1 && Math.abs(casi.adelante - 1) < 0.01 && Math.abs(asientaDelCta(0.995) - 1) < 0.02
  // Primero atrás: cuando empieza a cambiar, ya se fueron; el cambio empieza con la mitad del alejamiento hecho, como mucho.
  const desde = (f2: (p: number) => number): number => [...Array(1001).keys()].map((k) => k / 1000).find((p) => f2(p) > 0) ?? 1
  const primeroAtras = desde((p) => f(p).atras) < desde((p) => f(p).cambia)
  return enCero && enUno && juntos && primeroAtras && ATRAS > 0 && ATRAS <= 0.3
})
afirmar(metaBien(estadoDeLaMetamorfosis), '  la metamorfosis: en 0 nada cambió; primero atrás («poco»), después cambian, se cruzan, la frase se limpia y vuelve; termina en el mismo punto que «HABLANOS»', `atrás ${String(ATRAS)} de la distancia (a ${(1 / (1 + ATRAS)).toFixed(2)} de su tamaño)`)
controlPositivo('  el detector VE una frase que termina antes que «HABLANOS» (en 0,9)', ((p: number) => estadoDeLaMetamorfosis(Math.min(1, p / 0.9))) as typeof estadoDeLaMetamorfosis, metaBien)

// LAS DOS TÉCNICAS, en 3D y terminando en la frase limpia. `fusion`: las dos mallas con el mismo ruido y el mismo flujo; los
// valores se derriten hacia la zona de la frase (desplazamiento en el vértice) y la frase nace de la masa y se des-deforma; el
// disolvente con umbral de ruido es complementario (lo que no es valor es frase: una sola masa). `contorno`: los dos textos
// remuestreados a LA MISMA cantidad de puntos, interpolados con turbulencia y el espesor que crece al asentarse. Sin partículas.
// [PULIDO 5] D1 · `contorno` ya no rehace la geometría por cuadro: topología fija (las pistas, una vez), el vértice mueve los
// puntos y las tapas van por stencil; el detalle lo fija `s56` D1 · 4. [PULIDO 6] E1 · `fusion` se borró (su código): queda `contorno`.
const contorno = sinComentarios(leer('_lib/escena/ctaDelFinal/contorno.ts'))
const cuadrado: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(10, 0), new THREE.Vector2(10, 10), new THREE.Vector2(0, 10)]
const tecnicasBien = (co: string): boolean =>
  co.includes('const pistas = pistasDeLaMetamorfosis(valores, inicio, frase, fuentes, n)') && co.includes('enSentido(remuestrear(borde, n), false)') && co.includes('costo = performance.now() - t0') &&
  co.includes('VOLUMEN_DEL_TITULO.profundidad * c.cuerpoDeLaFrase * kF * e.espesor') && remuestrear(cuadrado, CONTORNO.puntos).length === CONTORNO.puntos && !/THREE\.Points\b|PointsMaterial|part[ií]cula/i.test(co)
afirmar(tecnicasBien(contorno), '  `contorno`: la misma cantidad de puntos, interpolados (en el vértice: topología fija), el espesor crece al asentarse; sin partículas')
controlPositivo('  el detector VE una metamorfosis de partículas', `${contorno}\nnew THREE.Points()`, tecnicasBien)

// LAS BANDERAS: `?meta=fusion|contorno` (sólo esas); sin bandera, `fusion` (la del producto). [PULIDO 5] D1 · sin bandera,
// `contorno` (ganó). [PULIDO 6] E1 · `?meta=` se borró: `contorno` es la única. [PULIDO 7] F2 · vuelve `?meta=contorno` (sólo
// ese valor), pedido así: sin bandera, el volteo; `fusion` sigue sin pedir nada.
const banderasBien = (f: typeof entornoPedido): boolean => ENTORNO.pruebas.meta === 'no' && f('producto,meta=fusion').pruebas.meta === 'no' && f('producto,meta=contorno').pruebas.meta === 'contorno' &&
  sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx')).includes("const meta = pruebas.meta === 'contorno' ? armarElContorno(medidas.valores, inicio, medidas.letras, deLasFuentes, color) : armarElVolteo(")
afirmar(banderasBien(entornoPedido), '  [PULIDO 7] `?meta=contorno` (sólo ese valor; `fusion` no pide nada); sin bandera, el volteo')
controlPositivo('  el detector VE la bandera de antes todavía pedible', ((p: string) => ({ ...entornoPedido(p), pruebas: { ...entornoPedido(p).pruebas, meta: 'fusion' } })) as unknown as typeof entornoPedido, banderasBien)

// 4 · CONTINUA EN EL SCROLL, EN LAS DOS DIRECCIONES. Se recorre el scroll en pasos de 2 px (a 900 px por pantalla), de antes de
// que lleguen los valores hasta el final del CTA y de vuelta, con frenadas (un segundo quieto, a 60 cuadros: el asiento corre) cada
// 60 pasos. En cada paso y en cada cuadro: ningún valor del DOM salta en su tramo más de `SALTO.valor` (el defecto: de lo
// asentado al lugar del scroll de golpe, 0,57 medido), ninguna letra del cruce que esté en la pantalla se mueve más de
// `SALTO.px` ni cambia cuánto se ve más de `SALTO.aparece`, y nada de lo que la metamorfosis le da a la escena (su estado, el
// relevo y el lugar de los valores) cambia más de `SALTO.estado`.
const SALTO = { valor: 0.12, px: 60, aparece: 0.2, estado: 0.05 } as const
const ALTO = 900
const PIN = (PANTALLAS_DE_POR_QUE_DEVELOP - 1) * ALTO
type Seguir = (s: SeguidorDelValor, p: number) => void
interface Medida { readonly peor: { valor: number; px: number; aparece: number; estado: number }; readonly pasos: number }
function recorrer(seguir: Seguir, cruce: Cruce, meta: typeof estadoDeLaMetamorfosis): Medida {
  const peor = { valor: 0, px: 0, aparece: 0, estado: 0 }
  const seguidores = VALORES.map((_, i) => nuevoSeguidor(tramo(1.5 * ALTO / PIN, ventanaDelValor(i))))
  let antes: { valores: number[]; cruce: PosesDeLaTransformacion; meta: number[] } | null = null
  let pasos = 0
  const foto = (y: number): void => {
    const pin = y / PIN
    const p = tramo(pin, VENTANA_DE_LA_TRANSFORMACION)
    const c = poses()
    cruce(p, ESCENA, c)
    const e = meta(p)
    const co = meta(p)
    const m = [e.atras, e.cambia, e.sucia, e.adelante, e.turbulencia, apareceDeLosValores(p), valoresAPlano(p), co.cambia, co.espesor, co.sucia, co.adelante, co.turbulencia]
    const ahora = { valores: seguidores.map((s) => s.mostrado), cruce: c, meta: m }
    if (antes !== null) {
      const a = antes
      ahora.valores.forEach((v, i) => (peor.valor = Math.max(peor.valor, Math.abs(v - a.valores[i]))))
      const enPantalla = (q: { x: number; y: number }): boolean => q.x > -100 && q.x < 1540 && q.y > -100 && q.y < 1000
      // [PULIDO 5] D1 · lo que se VE de la letra: cuánto aparece por lo que muestra de frente (girada sobre Y o X, |cos|): el
      // giro cambia de cara en el canto (90°), donde de lado no se ve nada. Lo que no gira mide lo mismo que antes.
      const visto = (q: { aparece: number; rx: number; ry: number }): number => q.aparece * Math.abs(Math.cos(q.ry)) * Math.abs(Math.cos(q.rx))
      for (const k of ['origen', 'destino'] as const) {
        c[k].forEach((q, i) => {
          const r = a.cruce[k][i]
          if ((q.aparece > 0 || r.aparece > 0) && (enPantalla(q) || enPantalla(r))) {
            if (enPantalla(q) && enPantalla(r)) peor.px = Math.max(peor.px, Math.hypot(q.x - r.x, q.y - r.y))
            peor.aparece = Math.max(peor.aparece, Math.abs(visto(q) - visto(r)))
          }
        })
      }
      m.forEach((v, i) => (peor.estado = Math.max(peor.estado, Math.abs(v - a.meta[i]))))
    }
    antes = ahora
    pasos += 1
  }
  const ir = (y: number): void => {
    const pin = y / PIN
    seguidores.forEach((s, i) => seguir(s, tramo(pin, ventanaDelValor(i))))
    foto(y)
  }
  const quieto = (y: number): void => {
    for (let t = 0; t < 1; t += 1 / 60) {
      seguidores.forEach((s) => asentar(s, 1 / 60))
      foto(y)
    }
  }
  const [y0, y1] = [1.5 * ALTO, PIN]
  let k = 0
  for (let y = y0; y <= y1; y += 2) {
    ir(y)
    if (++k % 60 === 0) quieto(y)
  }
  for (let y = y1; y >= y0; y -= 2) {
    ir(y)
    if (++k % 60 === 0) quieto(y)
  }
  return { peor, pasos }
}
const continuoBien = (m: Medida): boolean => m.peor.valor <= SALTO.valor && m.peor.px <= SALTO.px && m.peor.aparece <= SALTO.aparece && m.peor.estado <= SALTO.estado
const recorrido = recorrer(seguirAlScroll, posesDe, estadoDeLaMetamorfosis)
afirmar(continuoBien(recorrido), '4 · todo es continuo en el scroll, ida y vuelta, con frenadas: los valores (con su asiento), el giro y la metamorfosis no saltan en ningún paso', `${String(recorrido.pasos)} pasos y cuadros · lo peor: valor ${recorrido.peor.valor.toFixed(3)} del tramo, giro ${recorrido.peor.px.toFixed(1)} px y ${recorrido.peor.aparece.toFixed(3)} de tramado, estado ${recorrido.peor.estado.toFixed(4)}`)
// El defecto que se arregló: al volver el scroll, lo mostrado saltaba al lugar del scroll (después de un asiento).
const conElSaltoDeAntes: Seguir = (s, p) => {
  s.scroll = p
  s.mostrado = p
}
controlPositivo('  el detector VE el salto de antes (lo asentado vuelve de golpe al lugar del scroll)', recorrer(conElSaltoDeAntes, posesDe, estadoDeLaMetamorfosis), continuoBien)
controlPositivo('  y un giro con un salto («HABLANOS» que aparece de golpe, como en B1)', recorrer(seguirAlScroll, ((p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(p, e, s)
  s.destino.forEach((q) => Object.assign(q, { aparece: p >= TRANSFORMACION.giro.desde + 0.05 ? 1 : 0 }))
}) as Cruce, estadoDeLaMetamorfosis), continuoBien)
// La causa, en el componente: el valor sigue al scroll con `seguirAlScroll` y el asiento parte de lo mostrado.
const valor = sinComentarios(leer('_secciones/por-que-develop/valorEnVolumen.tsx'))
afirmar(/seguirAlScroll\(a\.seguidor, p\)\s*posar\(a\.seguidor\.mostrado\)/.test(valor) && valor.includes('a.control = animate(s.mostrado, destino, { duration: ASIENTO.s * Math.abs(destino - s.mostrado), ease: \'linear\'') && !/posar\(p\)/.test(valor), '  la causa, en el valor: lo mostrado sigue al scroll (no se pone el del scroll) y el asiento parte de lo mostrado, a la velocidad de `asentar`')

// 5 · LOS VIAJES DEL MENÚ: durante un viaje que pasa por la sección el CTA no se muestra (ni la escena ni el DOM). Medido en el
// banco del pie a Inicio: 0 de 365 cuadros con el CTA (13 con la transformación a mitad).
const escenaDelCta = sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx'))
const ctaDom = sinComentarios(leer('_secciones/por-que-develop/CtaTransformado.tsx'))
const viajesBien = (visible: (v: boolean) => boolean, escena: string, dom: string): boolean => !visible(true) && visible(false) &&
  escena.includes('const enPantalla = ctaVisibleEnElViaje(viajeEnCurso() !== null) && (CTA_EN_VIVO.donde === \'lista\' || p > 0)') && escena.includes('a.marco.visible = enPantalla') && escena.includes('a.lienzo.visible = enPantalla') &&
  (dom.match(/estiloEnElViaje\(enViaje\)/g) ?? []).length === 2
afirmar(viajesBien(ctaVisibleEnElViaje, escenaDelCta, ctaDom), '5 · en un viaje del menú el CTA no se dibuja (el cruce y la metamorfosis) ni se ve su DOM (el escenario y la lista)')
controlPositivo('5 · el detector VE un CTA que se dibuja en el viaje', [() => true, escenaDelCta, ctaDom] as const, ([v, e, d]: readonly [(v: boolean) => boolean, string, string]) => viajesBien(v, e, d))

// 6 · LA FUENTE: la frase en Archivo con su copy (minúsculas, acentos), del TTF entero (OFL) con el ancho del sitio, y sólo con
// las letras que hacen falta (el woff2 del sitio sigue sólo de mayúsculas); los valores en la Chivo del DOM. [PULIDO 5] D1 · del
// TTF VARIABLE, en los dos anchos de `?ancho=` (la frase en 600; el destacado y «HABLANOS» en 900, en el mismo JSON).
type Glifos = { readonly glyphs: Record<string, unknown>; readonly original_font_information?: { readonly source?: string } }
const letras = (t: string): Set<string> => new Set([...t].filter((c) => c.trim() !== ''))
const exactas = (f: Glifos, t: string): boolean => Object.keys(f.glyphs).filter((c) => c.trim() !== '').length === letras(t).size && [...letras(t)].every((c) => f.glyphs[c] !== undefined)
const fuenteBien = (frase: Glifos, fuerte: Glifos, valores: Glifos, script: string): boolean =>
  exactas(frase, CTA.frase) && exactas(fuerte, `${CTA.destacado}${CTA.rotulo.toUpperCase()}`) && /[a-zñóé]/.test(Object.keys(frase.glyphs).join('')) && frase.original_font_information?.source === 'Archivo[wdth,wght].ttf' &&
  VALORES.every((v) => [...`${v.titulo}${v.linea}`].every((c) => c.trim() === '' || valores.glyphs[c] !== undefined)) && (ARCHIVO_700 as Glifos).glyphs.H !== undefined &&
  script.includes("*[{'origen': ARCHIVO_VARIABLE, 'peso': peso, 'ancho': wdth, 'familia': 'Archivo', 'licencia': 'OFL-archivo.txt', 'kerning': True,") && script.includes("for peso, textos, sufijo in ((600, ['Este sitio empezó con una charla.'], ''), (900, ['El tuyo también.', 'HABLANOS'], '-fuerte'))],")
// [PULIDO 6] E1 · un solo ancho (wdth 100): `?ancho=expandido` y sus fuentes se borraron.
const fuentesDelCtaBien = (script: string): boolean => [[ARCHIVO_NORMAL_CTA, ARCHIVO_NORMAL_CTA_FUERTE]].every(([a, b]) => fuenteBien(a as Glifos, b as Glifos, CHIVO_400_VALORES as Glifos, script))
afirmar(fuentesDelCtaBien(leerDeLaRaiz('scripts-retoque/fuentes-3d.py')), '6 · la frase en Archivo con su copy (minúsculas y acentos), del TTF entero, sólo con sus letras; los valores en la Chivo del DOM', `${String(Object.keys((ARCHIVO_NORMAL_CTA as Glifos).glyphs).length)} y ${String(Object.keys((ARCHIVO_NORMAL_CTA_FUERTE as Glifos).glyphs).length)} glifos`)
controlPositivo('6 · el detector VE la frase de B1 (sólo mayúsculas)', [{ glyphs: Object.fromEntries([...letras(CTA.frase.toUpperCase())].map((c) => [c, 1])), original_font_information: { source: 'archivo-display-latin.woff2' } }, ARCHIVO_NORMAL_CTA_FUERTE as Glifos, CHIVO_400_VALORES as Glifos, leerDeLaRaiz('scripts-retoque/fuentes-3d.py')] as const, ([a, b, c, d]: readonly [Glifos, Glifos, Glifos, string]) => fuenteBien(a, b, c, d))

// 7 · SE MANTIENE: las siete pantallas (y la transformación en tres, terminando en `cta.armado`), el teléfono con el bloque
// clavado, el movimiento reducido con el estado final y ninguna letra delante del logo: el plano del CTA detrás del centro del
// logo, y la metamorfosis sólo va hacia atrás (los valores y la masa a `−ATRAS`, la frase de ahí a 0).
const listaDom = sinComentarios(leer('_componentes/ctaDelFinal/CtaDelFinal.tsx'))
const mantieneBien = (pantallas: number, cerca: number, atras: number): boolean => pantallas === 7 && Math.abs(TIEMPOS_DEL_FINAL.cta.armado - TIEMPOS_DEL_FINAL.valores.hasta - 3) < 1e-9 &&
  ctaDom.includes('<div className="sticky top-0 flex min-h-[var(--alto-del-cta-en-lista)]') && listaDom.includes('progreso.set(quieto ? 1 : progresoEnLaLista(r))') && cerca > 1 && atras > 0 &&
  escenaDelCta.includes('ponerElMarco(a.lienzo, s.planos.pantalla, s.planos.cta, anclado)') && contorno.includes('const zF = zM * (1 - e.adelante)')
afirmar(mantieneBien(PANTALLAS_DE_POR_QUE_DEVELOP, MARCO_DEL_CTA.cerca, ATRAS), '7 · las siete pantallas, el teléfono clavado, el movimiento reducido en el estado final y ninguna letra delante del logo (todo detrás del plano del CTA)', `el plano a ${String(MARCO_DEL_CTA.cerca)} de la distancia del logo · relevo de los valores en ${String(RELEVO_DE_LOS_VALORES.tramado)} del progreso`)
controlPositivo('7 · el detector VE la frase delante del plano (z positivo)', [PANTALLAS_DE_POR_QUE_DEVELOP, MARCO_DEL_CTA.cerca, -0.2] as const, ([a, b, c]: readonly [number, number, number]) => mantieneBien(a, b, c))
void METAMORFOSIS
void avancesDe
void FUENTES_DEL_CTA

// ═══════════════════════════════════════════════════════════════════════════
titulo('C2 · El encastre: el sonido del golpe y la luz que pasa al círculo')

// EL SONIDO, DESDE EL MISMO EVENTO DEL GOLPE: adentro del bloque que marca el golpe (`s.golpeEn = t`), con la misma condición:
// `fin` cruza el golpe hacia adelante. Se recorre la condición: una vez al bajar, ninguna al rebobinar, otra en el reinicio
// automático (el reloj vuelve a 0 y corre de nuevo). Pasa por el bus (`sonar`): apagado o sin el gesto, no hace nada.
const cuadroC2 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const BLOQUE_DEL_GOLPE = 'if (!s.estatico && s.antes < golpe && fin >= golpe) {'
const golpeBien = (c: string, cruza: (antes: number, fin: number, golpe: number) => boolean): boolean => {
  const i = c.indexOf(BLOQUE_DEL_GOLPE)
  const bloque = i < 0 ? '' : c.slice(i, c.indexOf('\n  }', i))
  const recorrido = [...Array(41).keys()].map((k) => k / 40)
  const veces = (fins: readonly number[]): number => fins.slice(1).filter((f, k) => cruza(fins[k], f, 0.6)).length
  // [PULIDO 5] D2 · uno solo: `golpe` (era `golpe-b`; la variante por bandera se borró).
  return bloque.includes('s.golpeEn = t') && bloque.includes("sonar('golpe')") && c.includes("import { sonar } from '../../sonido/bus'") && !/howler/i.test(c) &&
    !c.includes("'golpe-a'") && !c.includes('pruebas.golpe') &&
    veces(recorrido) === 1 && veces([...recorrido].reverse()) === 0 && veces([...recorrido, ...recorrido]) === 2
}
const cruzaComoElCuadro = (antes: number, fin: number, golpe: number): boolean => antes < golpe && fin >= golpe
afirmar(golpeBien(cuadroC2, cruzaComoElCuadro), 'el golpe suena desde su mismo evento: una vez al bajar, ninguna al rebobinar, otra en el reinicio; por el bus (respeta el apagado y el gesto)')
controlPositivo('el detector VE un golpe que suena también al rebobinar', [cuadroC2, (a: number, f: number, g: number) => (a < g) !== (f < g)] as const, ([c, f]: readonly [string, (a: number, f: number, g: number) => boolean]) => golpeBien(c, f))

// LAS DOS VARIANTES (`?golpe=a|b`; sin bandera, `a`), en el sprite y en el catálogo, por encima del pulso SIN SATURAR: se mide el
// sprite (Opus, decodificado): la energía (RMS) de cada golpe sobre la del pulso, y su pico debajo de 0 dB. [PULIDO 5] D2 · ganó
// `b` (`a` «se escucha saturado»): uno solo, `golpe`, sin bandera.
const variantesBien = (): boolean => !('golpe' in ENTORNO.pruebas) && !('golpe-a' in CORTES_DEL_SPRITE) && !('golpe-b' in CORTES_DEL_SPRITE) &&
  'golpe' in CORTES_DEL_SPRITE && SONIDOS.golpe.volumen >= SONIDOS.pulso.volumen
afirmar(variantesBien(), '  un solo golpe (el de la sala), en el sprite y en el catálogo, con el volumen del pulso o más; sin bandera')
interface Nivel { readonly pico: number; readonly rms: number }
const nivelesDelSprite = (): Record<string, Nivel> | null => {
  let crudo: Buffer
  try {
    crudo = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', 'public/v3/sonido/sonidos.webm', '-f', 's16le', '-ac', '1', '-ar', '48000', '-'], { maxBuffer: 64 * 1024 * 1024 })
  } catch {
    return null
  }
  const muestras = new Int16Array(crudo.buffer, crudo.byteOffset, Math.floor(crudo.length / 2))
  const nivel = ([desde, dura]: readonly [number, number]): Nivel => {
    const tramoDeMuestras = muestras.subarray(Math.round((desde * 48000) / 1000), Math.round(((desde + dura) * 48000) / 1000))
    let [pico, suma] = [0, 0]
    for (const v of tramoDeMuestras) {
      pico = Math.max(pico, Math.abs(v) / 32768)
      suma += (v / 32768) ** 2
    }
    return { pico: 20 * Math.log10(Math.max(1e-9, pico)), rms: 10 * Math.log10(Math.max(1e-12, suma / Math.max(1, tramoDeMuestras.length))) }
  }
  return { pulso: nivel(CORTES_DEL_SPRITE.pulso), golpe: nivel(CORTES_DEL_SPRITE.golpe) }
}
const nivelesBien = (n: Record<string, Nivel>): boolean => ['golpe'].every((k) => n[k].rms > n.pulso.rms + 2 && n[k].pico < -0.1)
const niveles = existsSync('public/v3/sonido/sonidos.webm') ? nivelesDelSprite() : null
if (niveles === null) noCorre('  los niveles del golpe en el sprite', 'sin ffmpeg no se decodifica el Opus')
else {
  afirmar(nivelesBien(niveles), '  el golpe, más fuerte que el pulso (RMS) y sin saturar (pico debajo de 0 dB, decodificado)', `pulso ${niveles.pulso.rms.toFixed(1)} dB · golpe ${niveles.golpe.rms.toFixed(1)} dB (pico ${niveles.golpe.pico.toFixed(2)})`)
  controlPositivo('  el detector VE un golpe que satura', { ...niveles, golpe: { pico: 0.4, rms: niveles.golpe.rms } }, nivelesBien)
}

// LA LUZ: el logo volvió a como era (sin el filo encendido de B0: ni su parche ni el hilo del piso) y el brillo es TODO el
// círculo quieto alrededor (su radio es el del círculo quieto), en blanco, fuera del oscurecimiento (lo fija `s54` B0), con la
// energía, y con un pulso en cada onda y uno más fuerte y más largo en el golpe (con el poder: en el golpe la energía todavía
// no se extendió). Con movimiento reducido, sin pulso. [PULIDO 5] D2 · el círculo difuso se borró por pedido (`luzDelCirculo.ts`):
// la luz es el anillo, que fija `s56` D2; acá queda lo que sigue valiendo: el logo sin el filo encendido de B0.
const luzDelLogoC2 = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
const pisoC2 = sinComentarios(leer('_lib/escena/final/enElPiso.ts'))
const circuloBien = (logo: string, piso: string): boolean =>
  !logo.includes('RimDelLogo') && !logo.includes('conElRimDeLaLuz') && !existsSync(`${V3}/_lib/escena/final/rimDeLaLuz.ts`) && !/filoDelLogo/.test(piso) && !existsSync(`${V3}/_lib/escena/final/luzDelCirculo.ts`)
afirmar(circuloBien(luzDelLogoC2, pisoC2), 'el logo como era (sin el filo encendido de B0); [PULIDO 5] el círculo difuso se borró: la luz es el anillo (`s56` D2)')
controlPositivo('el detector VE el logo con el filo de B0', [`${luzDelLogoC2}\n<RimDelLogo />`, pisoC2] as const, ([a, b]: readonly [string, string]) => circuloBien(a, b))
void CALMA_EN_EL_PISO


// ═══════════════════════════════════════════════════════════════════════════
titulo('C3 · El mouse del pie: más rango, sobre todo vertical')

// EL RANGO: ~±22° a los costados y ±11–12° arriba y abajo. LA GANANCIA POR PÍXEL vertical, claramente mayor que la horizontal (a
// propósito: la pantalla es más baja que ancha), en 16:10, 4:3 y 16:9; el tope vertical llega antes del borde. Lo escribe el DOM
// (el alto sobre el ancho de la ventana). El techo del domo y el de velocidad, con este rango, los miden `s54` B2 (el domo desde
// abajo tampoco entra: simétrico; la velocidad, con el amortiguado subido).
const finalDelPieC3 = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
type Vertical = (y: number, aspecto: number) => number
const rangoBien = (O: typeof ORBITA_DEL_MOUSE, vertical: Vertical, dom: string): boolean => {
  const ganancias = [900 / 1440, 768 / 1024, 1080 / 1920].map((aspecto) => {
    const dy = 0.02
    const porPixelV = vertical(dy, aspecto) / (dy * aspecto)
    const porPixelH = O.horizontal
    return porPixelV / porPixelH
  })
  const o = { ...nuevaOrbita(), deja: 1 }
  for (let t = 0; t < 10 * O.amortiguaS; t += 1 / 60) pasoDeLaOrbita(o, { x: 1, y: 0.75, aspecto: 900 / 1440 }, true, 1 / 60)
  return O.horizontal >= 21 && O.horizontal <= 23 && O.vertical >= 11 && O.vertical <= 12 && ganancias.every((g) => g >= 1.4) && Math.abs(vertical(1, 0.625)) === O.vertical &&
    Math.abs(o.h - O.horizontal) < 0.01 && Math.abs(o.v - O.vertical) < 0.01 && O.amortiguaS > 0.3 && dom.includes('ORBITA_EN_VIVO.aspecto = window.innerHeight / Math.max(1, window.innerWidth)')
}
const porPixel = (aspecto: number): string => (gradosVerticales(0.02, aspecto) / (0.02 * aspecto) / ORBITA_DEL_MOUSE.horizontal).toFixed(2)
afirmar(rangoBien(ORBITA_DEL_MOUSE, gradosVerticales, finalDelPieC3), 'el mouse del pie: ±22° y hasta ±12°; la ganancia por píxel vertical, mayor que la horizontal (y el tope antes del borde); más amortiguada', `vertical/horizontal por píxel: ${porPixel(900 / 1440)} (16:10) · ${porPixel(768 / 1024)} (4:3) · amortiguada ${String(ORBITA_DEL_MOUSE.amortiguaS)} s`)
controlPositivo('el detector VE la ganancia de la proporción (la misma por píxel, ±11° en toda la altura)', [ORBITA_DEL_MOUSE, ((y: number, aspecto: number) => Math.max(-1, Math.min(1, y)) * aspecto * ORBITA_DEL_MOUSE.horizontal) as Vertical, finalDelPieC3] as const, ([a, b, c]: readonly [typeof ORBITA_DEL_MOUSE, Vertical, string]) => rangoBien(a, b, c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C4 · Las filas de la tablet del pie, por tokens (s6-tokens T5)')

// Las tres grillas de A2 (`grid-rows` con valores escritos en la clase) pasan a propiedades del pie, registradas en el padrón de
// `s3-tokens`, con EXACTAMENTE los valores de A2: nada visible cambia (medido a 768: las tres grillas resuelven sus filas).
const pieCss = leer('_estilos/pie.css')
const filasBien = (css: string, fuentes: string): boolean => css.includes('--filas-del-cierre: 1fr auto;') && css.includes('--filas-de-la-navegacion-del-pie: auto 1fr;') && css.includes('--filas-del-mensaje-del-pie: auto 1fr auto;') &&
  !/grid-rows-\[(?!var\()/.test(fuentes) && (fuentes.match(/grid-rows-\[var\(--filas-/g) ?? []).length === 3
const delPie = ['_secciones/cierre/Cierre.tsx', '_secciones/cierre/ColumnasDelPie.tsx', '_secciones/cierre/FormularioDelPie.tsx'].map((r) => leer(r)).join('\n')
afirmar(filasBien(pieCss, delPie), 'las tres filas de A2, por tokens del pie con sus mismos valores (sin arbitrarios sin var())')
controlPositivo('el detector VE una fila escrita en la clase', [pieCss, delPie.replace('grid-rows-[var(--filas-del-cierre)]', ['grid-rows-[1fr', 'auto]'].join('_'))] as const, ([a, b]: readonly [string, string]) => filasBien(a, b))

cerrar('s55-pulido-4')
