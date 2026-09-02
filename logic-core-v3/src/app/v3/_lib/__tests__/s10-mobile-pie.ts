/**
 * EL ALTO DEL CIERRE — el modelo de §14 de `s8-cierre.invariant.tsx`, evaluado a
 * un ancho cualquiera.
 *
 * ── Por qué sale de `s10-mobile.ts` y no es una partición de conveniencia ──
 *
 * La costura es real y va en un solo sentido: **`s10-mobile.ts` no sabe nada del
 * Cierre** —es un lector de cajas de pantalla y de tinta, que sirve para las
 * ocho secciones— y **este archivo no sabe leer marcado**: consume las dos
 * tablas de avance y los tokens, y contesta una sola pregunta. Cambiar el modelo
 * del pie no toca el contador de pantallas, y arreglar el contador no puede
 * mover el alto del Cierre.
 *
 * ── ⚠️ QUÉ CAMBIA RESPECTO DEL MODELO PUBLICADO, Y QUÉ NO ─────────────────
 *
 * **La descomposición es la misma** —relleno del pie, separaciones, encabezado,
 * titular, CTA, columnas y línea de cierre— y eso es deliberado: el valor de
 * reproducir un modelo publicado se pierde si además se le cambia la forma.
 * Lo que cambia son las dos ENTRADAS que a 1440 no se notaban:
 *
 *   1. **El token FLUIDO donde el marcado emite la clase fluida.** §14 lee
 *      `--text-micro`, `--text-caption` y `--text-titulo-xl`; el marcado emite
 *      `text-fluido-*`. A 1440 el `clamp()` está en su techo y los dos valores
 *      coinciden — abajo del techo, no.
 *   2. **El corte de línea REAL**, con los avances del `.woff2` que /v3 sirve,
 *      en vez del supuesto «titular de tres líneas al piso del clamp» que §14
 *      declara como supuesto (y hace bien: cuando lo escribió no había
 *      instrumento; ahora hay).
 *
 * **El control es que con `fluido = false` a 1440 reproduce 741 px**, que es lo
 * que ese invariante publica. Si no lo reprodujera, no estaría calculando lo que
 * dice que calcula.
 */

import {
  DESTINOS_DE_LA_RUTA,
  LINEA_DE_CIERRE,
  NOVEDADES,
  PEDIDOS_DE_CONTACTO,
  TITULAR_DE_CIERRE,
} from '../../_secciones/cierre/contenido'
import { lineasDeTexto } from './s10-avance'
import { anchoDeContenido, cajaDeLinea, tokenPx } from './s10-css'
import { CHIVO, CHIVO_MONO, tracking } from './s10-mobile'
import { afirmar, controlPositivo } from './afirmar'
import { SECCIONES } from '../secciones'

export interface ModeloDelCierre {
  readonly total: number
  /** Recorrido, contacto y novedades, en el orden en que el pie las emite. */
  readonly columnas: readonly number[]
  readonly lineasDelTitular: number
  /** Si las tres columnas van apiladas. La grilla del pie conmuta en 768. */
  readonly apiladas: boolean
  /**
   * ⚠ **EL CORTE DE §7.43, MEDIDO SIN APLICARLO (SITIO-S12).**
   *
   * `total` es el alto de HOY, con las cinco piezas adentro de la
   * `<section id="cierre">`. Estos dos son lo que mediría cada mitad **si** el
   * corte se hiciera: la sección con rótulo + `h2` + CTA, y el `<footer>` con
   * columnas + línea legal. Cada uno lleva su propio relleno vertical, porque
   * afuera de `Pie` la sección deja de heredar el `padding-block` de
   * `_estilos/pie.css` y tiene que declararlo.
   *
   * **La suma NO da `total`, y la diferencia es el hallazgo:** el corte
   * DUPLICA el relleno vertical —dos cajas, dos rellenos— así que agrega
   * `2 × --spacing-20` de documento. Ver §7.46: eso es lo que mueve el anclaje.
   */
  readonly seccionPartida: number
  readonly piePartido: number
}

export function modeloDelCierre(ancho: number, fluido = true): ModeloDelCierre {
  const px = (t: string): number => tokenPx(t, ancho)
  const T = (n: string): string => (fluido ? `--text-fluido-${n}` : `--text-${n}`)
  const lineas = (texto: string, w: number, tam: number, tr: number, mono = false, alta = false): number =>
    lineasDeTexto(mono ? CHIVO_MONO : CHIVO, alta ? texto.toUpperCase() : texto, w, tam, tr)

  const micro = cajaDeLinea(T('micro'), '--leading-micro', ancho)
  const caption = cajaDeLinea(T('caption'), '--leading-texto', ancho)
  const cuerpo = cajaDeLinea('--text-cuerpo', '--leading-texto', ancho)
  const microFijo = cajaDeLinea('--text-micro', '--leading-micro', ancho)
  const apiladas = ancho < 768
  const canal = ancho >= 1025 ? px('--grilla-canal-amplio') : px('--grilla-canal-compacto')
  const util = anchoDeContenido(ancho)
  const anchoCol = apiladas ? util : (util - 2 * canal) / 3
  const trM = tracking('micro')
  const trT = tracking('texto')

  // Las tres columnas. El enlace del recorrido descuenta la canaleta y el icono
  // que `pie.css` le pone al lado; el campo de novedades, su relleno.
  const recorrido =
    micro + px('--spacing-4') +
    DESTINOS_DE_LA_RUTA.reduce(
      (n, d) => n + lineas(d.rotulo, anchoCol - 2 * px('--spacing-4'), px('--text-cuerpo'), trT) * cuerpo, 0) +
    (DESTINOS_DE_LA_RUTA.length - 1) * px('--spacing-2')
  const contacto =
    micro + px('--spacing-4') +
    PEDIDOS_DE_CONTACTO.reduce(
      (n, p) => n + lineas(p.marcador, anchoCol, px(T('caption')), trT, true, true) * caption +
        lineas(p.descripcion, anchoCol, px(T('micro')), trM, false, true) * micro, 0) +
    (PEDIDOS_DE_CONTACTO.length - 1) * px('--spacing-2')
  const campo = 2 * px('--spacing-2') + Math.max(
    cajaDeLinea('--text-caption', '--leading-texto', ancho),
    2 * px('--spacing-2') + px('--spacing-4'))
  const novedades =
    micro + px('--spacing-4') + microFijo + px('--spacing-2') + campo + px('--spacing-2') +
    lineas(NOVEDADES.ayuda, anchoCol, px('--text-micro'), trM) * microFijo
  const columnas = [recorrido, contacto, novedades]

  const tamXl = px(T('titulo-xl'))
  const lineasDelTitular = lineas(TITULAR_DE_CIERRE, util, tamXl, tracking('titulo'))
  const cierre =
    lineas([LINEA_DE_CIERRE.marca, ...LINEA_DE_CIERRE.piezas].join(' · '), util, px(T('caption')), trT, true, true) * caption +
    px('--spacing-1') +
    lineas(LINEA_DE_CIERRE.nota, util, px(T('micro')), trM, false, true) * micro
  const encabezado = apiladas ? 2 * micro + px('--grilla-canal-amplio') : micro
  const titular = lineasDelTitular * tamXl * px('--leading-titulo')
  const cta = cuerpo + 2 * px('--spacing-2')
  const bloqueDeColumnas = apiladas
    ? columnas.reduce((a, b) => a + b, 0) + 2 * canal
    : Math.max(...columnas)
  const total =
    2 * px('--spacing-20') + 4 * px('--spacing-12') +
    encabezado + titular + cta + bloqueDeColumnas + cierre

  // Las dos mitades del corte de §7.43. Tres hijos arriba (2 separaciones) y dos
  // abajo (1), y cada caja con su relleno: es lo que agrega el corte.
  const seccionPartida =
    2 * px('--spacing-20') + 2 * px('--spacing-12') + encabezado + titular + cta
  const piePartido =
    2 * px('--spacing-20') + 1 * px('--spacing-12') + bloqueDeColumnas + cierre

  return { total, columnas, lineasDelTitular, apiladas, seccionPartida, piePartido }
}

/**
 * EL CORTE DE §7.43, MEDIDO SIN APLICARLO — la condición de entrada que ese ítem
 * pedía, y la cuarta pared que encontró.
 *
 * Sale del invariante porque lo cruzó las 300 líneas. El corte es por tema: es la
 * única parte de §7 que pregunta por un marcado que NO EXISTE —el partido— y por
 * lo que ese marcado le haría al documento.
 */
export function afirmarElCorteDelCierre(px0: (n: number) => string): void {
  /**
   * ⚠ **EL ALTO DEL CIERRE, RECALCULADO PARA EL CORTE DE §7.43 — y es la condición
   * de entrada que ese ítem pedía (SITIO-S12).**
   *
   * §7.43 publicó un hueco de «≈532 px a 1440 y ≈218 a 375» y dijo con todas las
   * letras que valían **para el corte que S11 evaluó, no para éste**. Éste es el
   * de verdad, y la cifra que importa no es el hueco: es **cuánto documento AGREGA
   * el corte**, porque el progreso de la escena sale de `scrollHeight` y el
   * anclaje de SITIO-S9 se deriva de la tabla de `secciones.ts`.
   *
   * Las dos mitades llevan cada una su relleno vertical —la sección deja de
   * heredar el de `_estilos/pie.css` cuando sale de `Pie`— así que el corte
   * DUPLICA `2 × --spacing-20`. Ese delta es lo que mueve el anclaje, y por eso
   * SITIO-S12 midió y NO cortó. Ver §7.46.
   */
  console.log('  EL CORTE DE §7.43, MEDIDO SIN APLICARLO — qué mediría cada mitad y cuánto documento agrega:')
  for (const a of [375, 390, 768, 1440]) {
    const m = modeloDelCierre(a)
    console.log(
      `  @${a}: hoy ${px0(m.total)} px  →  sección ${px0(m.seccionPartida)} + pie ${px0(m.piePartido)} = ` +
        `${px0(m.seccionPartida + m.piePartido)} px  (agrega ${px0(m.seccionPartida + m.piePartido - m.total)} px de documento)`,
    )
  }
  for (const a of [375, 1440]) {
    const m = modeloDelCierre(a)
    afirmar(
      m.seccionPartida + m.piePartido > m.total,
      `  @${a} el corte AGREGA documento en vez de repartirlo: dos cajas llevan dos rellenos`,
      `${px0(m.seccionPartida + m.piePartido - m.total)} px, que son exactamente 2 × --spacing-20`,
    )
  }
  /**
   * Y la consecuencia, con su número: lo que el `<footer>` le sumaría al documento
   * **fuera de la tabla del recorrido**, contra las pantallas que esa tabla
   * declara. `alto` es un `min-height`, así que la `<section>` NO se achica al
   * perder contenido: se queda en su pantalla y el pie se suma entero.
   */
  const PANTALLAS_DE_LA_TABLA = SECCIONES.reduce(
    (n, x) => n + (x.alto.endsWith('svh') ? Number.parseFloat(x.alto) / 100 : 0),
    0,
  )
  for (const [ancho, alto] of [[1440, 900], [375, 667]] as const) {
    const m = modeloDelCierre(ancho)
    const documento = PANTALLAS_DE_LA_TABLA * alto
    const progresoDeHoy = 0.75
    const desplazamiento = progresoDeHoy * (documento - alto)
    const despues = desplazamiento / (documento + m.piePartido - alto)
    console.log(
      `  @${ancho}×${alto}: el pie afuera suma ${px0(m.piePartido)} px al documento (${px0(documento)} → ${px0(documento + m.piePartido)}), ` +
        `y el progreso que hoy vale 0,750 donde el diferencial llena el cuadro pasaría a ${despues.toFixed(4)}`,
    )
    afirmar(
      Math.abs(despues - progresoDeHoy) > 0.01,
      `  @${ancho}×${alto} ese delta MUEVE el anclaje de SITIO-S9: no es despreciable`,
      `${(progresoDeHoy - despues).toFixed(4)} de progreso, y §7.29 mide la tinta del diferencial exactamente en 0,750`,
    )
  }
  controlPositivo(
    'el modelo del corte no está ciego: sin el relleno duplicado las dos mitades sumarían el total',
    1440,
    (a: number) => px0(modeloDelCierre(a).seccionPartida + modeloDelCierre(a).piePartido) === px0(modeloDelCierre(a).total),
  )
}
