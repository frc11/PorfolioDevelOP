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
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-4.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-4/mirar.txt`.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

import { ENTORNO, entornoPedido } from '../escena/entorno'
import { MARCO_DEL_CTA } from '../escena/ctaDelFinal/armadoDelCta'
import { ctaVisibleEnElViaje } from '../escena/ctaDelFinal/enVivo'
import { CONTORNO, remuestrear } from '../escena/ctaDelFinal/contorno'
import {
  ATRAS,
  METAMORFOSIS,
  RELEVO_DE_LOS_VALORES,
  TRANSFORMACION,
  VARIANTES_DE_LA_METAMORFOSIS,
  apareceDeLosValores,
  estadoDeLaMetamorfosis,
  nuevaPose,
  posesDe,
  valoresAPlano,
  type EscenaDeLaTransformacion,
  type EstadoDeLaMetamorfosis,
  type LetraEnPantalla,
  type PosesDeLaTransformacion,
  type VarianteDeLaMetamorfosis,
} from '../escena/ctaDelFinal/transformacion'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'
import { TIEMPOS_DEL_FINAL } from '../escena/finalDelRecorrido'
import { VENTANA_DE_LA_TRANSFORMACION, ventanaDelValor } from '../../_secciones/por-que-develop/geometria'
import { asentar, nuevoSeguidor, seguirAlScroll, type SeguidorDelValor } from '../../_secciones/por-que-develop/asientoDelValor'
import { CTA, FRASE, VALORES } from '../../_secciones/por-que-develop/contenido'
import ARCHIVO_400_CTA from '../../_fuentes/archivo-400-cta.json'
import ARCHIVO_700_CTA from '../../_fuentes/archivo-700-cta.json'
import ARCHIVO_700 from '../../_fuentes/archivo-700-titulos.json'
import CHIVO_400_VALORES from '../../_fuentes/chivo-400-valores.json'
import { CALMA_EN_EL_PISO } from '../escena/final/enElPiso'
import { CIRCULO_DE_LUZ, LUZ_DEL_CIRCULO_GLSL, pulsoDelCirculo } from '../escena/final/luzDelCirculo'
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
titulo('C1 · El CTA: el cruce recuperado y la metamorfosis de los seis valores en la frase')

// LAS LETRAS SINTÉTICAS: «Seis razones / para elegirnos» a los lados (como en el escenario) y «HABLANOS» al centro.
const renglon = (texto: string, x0: number, y: number, cuerpo: number, r: number): LetraEnPantalla[] => [...texto].filter((c) => c.trim() !== '').map((c, i) => ({ x: x0 + i * 0.55 * cuerpo, y, cuerpo, ancho: 0.5 * cuerpo, alto: 0.7 * cuerpo, renglon: r, letra: c }))
const ORIGEN = [...renglon(FRASE.izquierda, 130, 200, 60, 0), ...renglon(FRASE.derecha, 1000, 180, 60, 1)]
const HABLANOS = renglon(CTA.rotulo.toUpperCase(), 560, 520, 90, 0)
const ESCENA: EscenaDeLaTransformacion = { origen: ORIGEN, destino: HABLANOS, pantalla: { ancho: 1440, alto: 900 } }
const poses = (): PosesDeLaTransformacion => ({ origen: ORIGEN.map(nuevaPose), destino: HABLANOS.map(nuevaPose) })
type Cruce = typeof posesDe

// EL CRUCE, TAL CUAL ESTABA (`2411371a`, `?cta=cruce`): sus medidas, y su gesto — en 0 el origen en su lugar y el CTA sin
// dibujar; se extruye hacia la cámara y se agranda alrededor de su «o»; «HABLANOS» se ve recién cuando la contraforma lo
// contiene; en 1, el CTA en su lugar y el origen sin dibujar.
const DE_2411371A = { extruye: 0.22, profundo: 6, desde: 0.16, dura: 0.54, contraforma: 0.3, topeDelEspesor: 3, asienta: 0.3 }
const cruceBien = (f: Cruce): boolean => {
  const s = poses()
  f(0, ESCENA, s)
  const enCero = s.origen.every((q, i) => q.aparece === 1 && Math.abs(q.x - ORIGEN[i].x) < 1e-6 && Math.abs(q.escala - ORIGEN[i].cuerpo) < 1e-6) && s.destino.every((q) => q.aparece === 0)
  f(0.2, ESCENA, s)
  const extruida = s.origen.every((q) => q.z > 0)
  f(0.4, ESCENA, s)
  const agrandada = s.origen.every((q, i) => q.escala > 3 * ORIGEN[i].cuerpo) && s.destino.every((q) => q.aparece < 0.5)
  f(1, ESCENA, s)
  const enUno = s.origen.every((q) => q.aparece === 0) && s.destino.every((q, k) => q.aparece === 1 && Math.abs(q.x - HABLANOS[k].x) < 1e-6 && Math.abs(q.escala - HABLANOS[k].cuerpo) < 1e-6 && Math.abs(q.z) < 1e-6)
  const medidas = (Object.keys(DE_2411371A) as (keyof typeof DE_2411371A)[]).every((k) => TRANSFORMACION.cruce[k] === DE_2411371A[k])
  return enCero && extruida && agrandada && enUno && medidas
}
afirmar(cruceBien(posesDe), 'el cruce de PULIDO 2 (`2411371a`), recuperado: «Seis razones» se extruye y se agranda por su «o»; del otro lado, «HABLANOS» se asienta')
controlPositivo('el detector VE un CTA que se ve antes de que la «o» lo contenga', ((p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(p, e, s)
  if (p >= TRANSFORMACION.cruce.desde) s.destino.forEach((q) => Object.assign(q, { aparece: 1 }))
}) as Cruce, cruceBien)

// LA METAMORFOSIS: en 0, los valores en su lugar (nada cambió); se van atrás «poco» (ATRAS: a ~0,8 de su tamaño) y ANTES de
// cambiar; en `fusion`, se derriten en su lugar antes de irse; el disolvente cruza a la frase en el medio; la frase se limpia y
// vuelve adelante. TODO JUNTO: la frase termina en el mismo punto del scroll que «HABLANOS» (en 1, y no antes).
const asientaDelCta = (p: number): number => Math.min(1, Math.max(0, (p - (1 - TRANSFORMACION.cruce.asienta)) / TRANSFORMACION.cruce.asienta))
const metaBien = (f: (v: VarianteDeLaMetamorfosis, p: number) => EstadoDeLaMetamorfosis): boolean => VARIANTES_DE_LA_METAMORFOSIS.every((v) => {
  const [a, b] = [f(v, 0), f(v, 1)]
  const casi = f(v, 0.995)
  const enCero = a.atras === 0 && a.cambia === 0 && a.corte === 0 && a.sucia === 1 && a.adelante === 0 && a.turbulencia === 0
  const enUno = b.atras === 1 && b.cambia === 1 && b.corte === 1 && b.sucia === 0 && b.adelante === 1 && b.espesor === 1 && b.turbulencia === 0
  const juntos = casi.adelante < 1 && asientaDelCta(0.995) < 1 && Math.abs(casi.adelante - 1) < 0.01 && Math.abs(asientaDelCta(0.995) - 1) < 0.02
  // Primero atrás: cuando empieza a cambiar, ya se fueron; el cambio empieza con la mitad del alejamiento hecho, como mucho.
  const desde = (f2: (p: number) => number): number => [...Array(1001).keys()].map((k) => k / 1000).find((p) => f2(p) > 0) ?? 1
  const primeroAtras = desde((p) => f(v, p).atras) < desde((p) => f(v, p).cambia)
  return enCero && enUno && juntos && primeroAtras && ATRAS > 0 && ATRAS <= 0.3
})
afirmar(metaBien(estadoDeLaMetamorfosis), '  la metamorfosis (las dos técnicas): en 0 nada cambió; primero atrás («poco»), después cambian, se cruzan, la frase se limpia y vuelve; termina en el mismo punto que «HABLANOS»', `atrás ${String(ATRAS)} de la distancia (a ${(1 / (1 + ATRAS)).toFixed(2)} de su tamaño)`)
controlPositivo('  el detector VE una frase que termina antes que «HABLANOS» (en 0,9)', ((v: VarianteDeLaMetamorfosis, p: number) => estadoDeLaMetamorfosis(v, Math.min(1, p / 0.9))) as typeof estadoDeLaMetamorfosis, metaBien)

// LAS DOS TÉCNICAS, en 3D y terminando en la frase limpia. `fusion`: las dos mallas con el mismo ruido y el mismo flujo; los
// valores se derriten hacia la zona de la frase (desplazamiento en el vértice) y la frase nace de la masa y se des-deforma; el
// disolvente con umbral de ruido es complementario (lo que no es valor es frase: una sola masa). `contorno`: los dos textos
// remuestreados a LA MISMA cantidad de puntos, interpolados con turbulencia, la geometría rehecha en cada cuadro (con su costo
// medido) y el espesor que crece al asentarse. Sin partículas.
const fusion = sinComentarios(leer('_lib/escena/ctaDelFinal/fusion.ts'))
const contorno = sinComentarios(leer('_lib/escena/ctaDelFinal/contorno.ts'))
const cuadrado: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(10, 0), new THREE.Vector2(10, 10), new THREE.Vector2(0, 10)]
const tecnicasBien = (fu: string, co: string): boolean =>
  fu.includes("if ( ${frase ? 'corte >= uCorte' : 'corte < uCorte'} ) discard;") && (fu.match(/metaFlujo\(/g) ?? []).length >= 4 && fu.includes('vec2 centro = mix( c, cM, e );') && fu.includes('vec2 centro = mix( cM, c, e );') &&
  co.includes('THREE.ShapeUtils.triangulateShape(') && co.includes('const N = CONTORNO.puntos') && co.includes('enSentido(remuestrear(c.borde, N))') && co.includes('enSentido(remuestrear(f.borde, N))') && co.includes('costo = performance.now() - t0') &&
  co.includes('VOLUMEN_DEL_TITULO.profundidad * c.cuerpoDeLaFrase * kF * e.espesor') && remuestrear(cuadrado, CONTORNO.puntos).length === CONTORNO.puntos && !/THREE\.Points\b|PointsMaterial|part[ií]cula/i.test(`${fu}\n${co}`)
afirmar(tecnicasBien(fusion, contorno), '  `fusion`: dos mallas, el mismo flujo, la frase nace de la masa, el disolvente complementario; `contorno`: la misma cantidad de puntos, interpolados y re-triangulados por cuadro (con su costo), el espesor crece al asentarse')
controlPositivo('  el detector VE un disolvente que no es complementario (los dos con el mismo lado)', [fusion.replace("'corte >= uCorte'", "'corte < uCorte'"), contorno] as const, ([a, b]: readonly [string, string]) => tecnicasBien(a, b))

// LAS BANDERAS: `?meta=fusion|contorno` (sólo esas); sin bandera, `fusion` (la del producto).
const banderasBien = (f: typeof entornoPedido): boolean => ENTORNO.pruebas.meta === 'no' && f('producto,meta=contorno').pruebas.meta === 'contorno' && f('producto,meta=fusion').pruebas.meta === 'fusion' && f('producto,meta=otra').pruebas.meta === 'no' &&
  sinComentarios(leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx')).includes("return pedida === 'no' ? 'fusion' : pedida")
afirmar(banderasBien(entornoPedido), '  `?meta=fusion|contorno`; sin bandera, `fusion`')
controlPositivo('  el detector VE una bandera que acepta cualquier valor', ((p: string) => ({ ...entornoPedido(p), pruebas: { ...entornoPedido(p).pruebas, meta: 'contorno' } })) as unknown as typeof entornoPedido, banderasBien)

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
    const e = meta('fusion', p)
    const m = [e.atras, e.cambia, e.corte, e.sucia, e.adelante, e.turbulencia, apareceDeLosValores(p), valoresAPlano(p), meta('contorno', p).cambia, meta('contorno', p).espesor]
    const ahora = { valores: seguidores.map((s) => s.mostrado), cruce: c, meta: m }
    if (antes !== null) {
      const a = antes
      ahora.valores.forEach((v, i) => (peor.valor = Math.max(peor.valor, Math.abs(v - a.valores[i]))))
      const enPantalla = (q: { x: number; y: number }): boolean => q.x > -100 && q.x < 1540 && q.y > -100 && q.y < 1000
      for (const k of ['origen', 'destino'] as const) {
        c[k].forEach((q, i) => {
          const r = a.cruce[k][i]
          if ((q.aparece > 0 || r.aparece > 0) && (enPantalla(q) || enPantalla(r))) {
            if (enPantalla(q) && enPantalla(r)) peor.px = Math.max(peor.px, Math.hypot(q.x - r.x, q.y - r.y))
            peor.aparece = Math.max(peor.aparece, Math.abs(q.aparece - r.aparece))
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
afirmar(continuoBien(recorrido), '4 · todo es continuo en el scroll, ida y vuelta, con frenadas: los valores (con su asiento), el cruce y la metamorfosis no saltan en ningún paso', `${String(recorrido.pasos)} pasos y cuadros · lo peor: valor ${recorrido.peor.valor.toFixed(3)} del tramo, cruce ${recorrido.peor.px.toFixed(1)} px y ${recorrido.peor.aparece.toFixed(3)} de tramado, estado ${recorrido.peor.estado.toFixed(4)}`)
// El defecto que se arregló: al volver el scroll, lo mostrado saltaba al lugar del scroll (después de un asiento).
const conElSaltoDeAntes: Seguir = (s, p) => {
  s.scroll = p
  s.mostrado = p
}
controlPositivo('  el detector VE el salto de antes (lo asentado vuelve de golpe al lugar del scroll)', recorrer(conElSaltoDeAntes, posesDe, estadoDeLaMetamorfosis), continuoBien)
controlPositivo('  y un cruce con un salto («HABLANOS» que aparece de golpe, como en B1)', recorrer(seguirAlScroll, ((p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion) => {
  posesDe(p, e, s)
  s.destino.forEach((q) => Object.assign(q, { aparece: p >= TRANSFORMACION.cruce.desde + 0.2 ? 1 : 0 }))
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
// las letras que hacen falta (el woff2 del sitio sigue sólo de mayúsculas); los valores en la Chivo del DOM.
type Glifos = { readonly glyphs: Record<string, unknown>; readonly original_font_information?: { readonly source?: string } }
const letras = (t: string): Set<string> => new Set([...t].filter((c) => c.trim() !== ''))
const exactas = (f: Glifos, t: string): boolean => Object.keys(f.glyphs).filter((c) => c.trim() !== '').length === letras(t).size && [...letras(t)].every((c) => f.glyphs[c] !== undefined)
const fuenteBien = (f400: Glifos, f700: Glifos, valores: Glifos, script: string): boolean =>
  exactas(f400, CTA.frase) && exactas(f700, CTA.destacado) && /[a-zñóé]/.test(Object.keys(f400.glyphs).join('')) && f400.original_font_information?.source === 'pinchada-archivo-display.ttf' &&
  VALORES.every((v) => [...`${v.titulo}${v.linea}`].every((c) => c.trim() === '' || valores.glyphs[c] !== undefined)) && (ARCHIVO_700 as Glifos).glyphs.H !== undefined &&
  script.includes("{'origen': ARCHIVO_ENTERO, 'peso': 400, 'familia': 'Archivo', 'licencia': 'OFL-archivo.txt',") && script.includes("'textos': ['Este sitio empezó con una charla.'], 'destino': 'archivo-400-cta.json'}") && script.includes("'textos': ['El tuyo también.'], 'destino': 'archivo-700-cta.json'}")
afirmar(fuenteBien(ARCHIVO_400_CTA as Glifos, ARCHIVO_700_CTA as Glifos, CHIVO_400_VALORES as Glifos, leerDeLaRaiz('scripts-retoque/fuentes-3d.py')), '6 · la frase en Archivo con su copy (minúsculas y acentos), del TTF entero, sólo con sus letras; los valores en la Chivo del DOM', `${String(Object.keys((ARCHIVO_400_CTA as Glifos).glyphs).length)} y ${String(Object.keys((ARCHIVO_700_CTA as Glifos).glyphs).length)} glifos`)
controlPositivo('6 · el detector VE la frase de B1 (sólo mayúsculas)', [{ glyphs: Object.fromEntries([...letras(CTA.frase.toUpperCase())].map((c) => [c, 1])), original_font_information: { source: 'archivo-display-latin.woff2' } }, ARCHIVO_700_CTA as Glifos, CHIVO_400_VALORES as Glifos, leerDeLaRaiz('scripts-retoque/fuentes-3d.py')] as const, ([a, b, c, d]: readonly [Glifos, Glifos, Glifos, string]) => fuenteBien(a, b, c, d))

// 7 · SE MANTIENE: las siete pantallas (y la transformación en tres, terminando en `cta.armado`), el teléfono con el bloque
// clavado, el movimiento reducido con el estado final y ninguna letra delante del logo: el plano del CTA detrás del centro del
// logo, y la metamorfosis sólo va hacia atrás (los valores y la masa a `−ATRAS`, la frase de ahí a 0).
const listaDom = sinComentarios(leer('_componentes/ctaDelFinal/CtaDelFinal.tsx'))
const mantieneBien = (pantallas: number, cerca: number, atras: number): boolean => pantallas === 7 && Math.abs(TIEMPOS_DEL_FINAL.cta.armado - TIEMPOS_DEL_FINAL.valores.hasta - 3) < 1e-9 &&
  ctaDom.includes('<div className="sticky top-0 flex min-h-[var(--alto-del-cta-en-lista)]') && listaDom.includes('progreso.set(quieto ? 1 : progresoEnLaLista(r))') && cerca > 1 && atras > 0 &&
  escenaDelCta.includes('ponerElMarco(a.lienzo, CAMARA_SIN_EL_MOUSE, viva, 1, tam.height)') && fusion.includes('-uAtras * ( 1.0 - uAdelante )') && contorno.includes('const zF = zM * (1 - e.adelante)')
afirmar(mantieneBien(PANTALLAS_DE_POR_QUE_DEVELOP, MARCO_DEL_CTA.cerca, ATRAS), '7 · las siete pantallas, el teléfono clavado, el movimiento reducido en el estado final y ninguna letra delante del logo (todo detrás del plano del CTA)', `el plano a ${String(MARCO_DEL_CTA.cerca)} de la distancia del logo · relevo de los valores en ${String(RELEVO_DE_LOS_VALORES.tramado)} del progreso`)
controlPositivo('7 · el detector VE la frase delante del plano (z positivo)', [PANTALLAS_DE_POR_QUE_DEVELOP, MARCO_DEL_CTA.cerca, -0.2] as const, ([a, b, c]: readonly [number, number, number]) => mantieneBien(a, b, c))
void METAMORFOSIS

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
  return bloque.includes('s.golpeEn = t') && bloque.includes('sonar(sonidoDelGolpe)') && c.includes("import { sonar } from '../../sonido/bus'") && !/howler/i.test(c) &&
    c.includes("sonidoDelGolpe ??= entornoDeLaEscena().pruebas.golpe === 'b' ? 'golpe-b' : 'golpe-a'") &&
    veces(recorrido) === 1 && veces([...recorrido].reverse()) === 0 && veces([...recorrido, ...recorrido]) === 2
}
const cruzaComoElCuadro = (antes: number, fin: number, golpe: number): boolean => antes < golpe && fin >= golpe
afirmar(golpeBien(cuadroC2, cruzaComoElCuadro), 'el golpe suena desde su mismo evento: una vez al bajar, ninguna al rebobinar, otra en el reinicio; por el bus (respeta el apagado y el gesto)')
controlPositivo('el detector VE un golpe que suena también al rebobinar', [cuadroC2, (a: number, f: number, g: number) => (a < g) !== (f < g)] as const, ([c, f]: readonly [string, (a: number, f: number, g: number) => boolean]) => golpeBien(c, f))

// LAS DOS VARIANTES (`?golpe=a|b`; sin bandera, `a`), en el sprite y en el catálogo, por encima del pulso SIN SATURAR: se mide el
// sprite (Opus, decodificado): la energía (RMS) de cada golpe sobre la del pulso, y su pico debajo de 0 dB.
const variantesBien = (): boolean => ENTORNO.pruebas.golpe === 'no' && entornoPedido('producto,golpe=b').pruebas.golpe === 'b' && entornoPedido('producto,golpe=c').pruebas.golpe === 'no' &&
  'golpe-a' in CORTES_DEL_SPRITE && 'golpe-b' in CORTES_DEL_SPRITE && SONIDOS['golpe-a'].volumen >= SONIDOS.pulso.volumen && SONIDOS['golpe-b'].volumen >= SONIDOS.pulso.volumen
afirmar(variantesBien(), '  `?golpe=a|b` (sin bandera, `a`), en el sprite y en el catálogo, con el volumen del pulso o más')
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
  return { pulso: nivel(CORTES_DEL_SPRITE.pulso), 'golpe-a': nivel(CORTES_DEL_SPRITE['golpe-a']), 'golpe-b': nivel(CORTES_DEL_SPRITE['golpe-b']) }
}
const nivelesBien = (n: Record<string, Nivel>): boolean => ['golpe-a', 'golpe-b'].every((k) => n[k].rms > n.pulso.rms + 2 && n[k].pico < -0.1)
const niveles = existsSync('public/v3/sonido/sonidos.webm') ? nivelesDelSprite() : null
if (niveles === null) noCorre('  los niveles del golpe en el sprite', 'sin ffmpeg no se decodifica el Opus')
else {
  afirmar(nivelesBien(niveles), '  los golpes, más fuertes que el pulso (RMS) y sin saturar (pico debajo de 0 dB, decodificado)', `pulso ${niveles.pulso.rms.toFixed(1)} dB · golpe-a ${niveles['golpe-a'].rms.toFixed(1)} dB (pico ${niveles['golpe-a'].pico.toFixed(2)}) · golpe-b ${niveles['golpe-b'].rms.toFixed(1)} dB (pico ${niveles['golpe-b'].pico.toFixed(2)})`)
  controlPositivo('  el detector VE un golpe que satura', { ...niveles, 'golpe-a': { pico: 0.4, rms: niveles['golpe-a'].rms } }, nivelesBien)
}

// LA LUZ: el logo volvió a como era (sin el filo encendido de B0: ni su parche ni el hilo del piso) y el brillo es TODO el
// círculo quieto alrededor (su radio es el del círculo quieto), en blanco, fuera del oscurecimiento (lo fija `s54` B0), con la
// energía, y con un pulso en cada onda y uno más fuerte y más largo en el golpe (con el poder: en el golpe la energía todavía
// no se extendió). Con movimiento reducido, sin pulso.
const luzDelLogoC2 = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
const pisoC2 = sinComentarios(leer('_lib/escena/final/enElPiso.ts'))
const circuloBien = (radio: number, luz: typeof CIRCULO_DE_LUZ, logo: string, piso: string, c: string): boolean =>
  !logo.includes('RimDelLogo') && !logo.includes('conElRimDeLaLuz') && !existsSync(`${V3}/_lib/escena/final/rimDeLaLuz.ts`) && !/filoDelLogo/.test(piso) &&
  luz.radio === radio && luz.base > 0.5 && luz.golpe > luz.onda && luz.golpeS >= luz.ondaS && pulsoDelCirculo(0, luz.golpeS) === 1 && pulsoDelCirculo(3 * luz.golpeS, luz.golpeS) < 0.06 &&
  LUZ_DEL_CIRCULO_GLSL.includes('return mix( color, vec3( 1.0 ), clamp( luz, 0.0, 1.0 ) * disco ) + vec3( halo );') &&
  c.includes('LUZ_DEL_CIRCULO.uLuzDelCirculo.value = CIRCULO_DE_LUZ.base * extendida') && c.includes('LUZ_DEL_CIRCULO.uPulsoDelCirculo.value = s.estatico ? 0 :')
afirmar(circuloBien(CALMA_EN_EL_PISO.radio, CIRCULO_DE_LUZ, luzDelLogoC2, pisoC2, cuadroC2), 'la luz pasó del filo del logo (como era) a todo el círculo quieto: en blanco, con la energía, un pulso con cada onda y más fuerte en el golpe', `luz ${String(CIRCULO_DE_LUZ.base)}, onda +${String(CIRCULO_DE_LUZ.onda)} (${String(CIRCULO_DE_LUZ.ondaS)} s), golpe +${String(CIRCULO_DE_LUZ.golpe)} (${String(CIRCULO_DE_LUZ.golpeS)} s), radio ${String(CIRCULO_DE_LUZ.radio)} u`)
controlPositivo('el detector VE el logo con el filo de B0', [CALMA_EN_EL_PISO.radio, CIRCULO_DE_LUZ, `${luzDelLogoC2}\n<RimDelLogo />`, pisoC2, cuadroC2] as const, ([a, b, c, d, e]: readonly [number, typeof CIRCULO_DE_LUZ, string, string, string]) => circuloBien(a, b, c, d, e))
controlPositivo('y un círculo de otro radio que el quieto', [CALMA_EN_EL_PISO.radio + 1, CIRCULO_DE_LUZ, luzDelLogoC2, pisoC2, cuadroC2] as const, ([a, b, c, d, e]: readonly [number, typeof CIRCULO_DE_LUZ, string, string, string]) => circuloBien(a, b, c, d, e))


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

cerrar('s55-pulido-4')
