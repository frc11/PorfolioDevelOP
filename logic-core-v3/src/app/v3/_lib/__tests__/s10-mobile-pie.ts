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

export interface ModeloDelCierre {
  readonly total: number
  /** Recorrido, contacto y novedades, en el orden en que el pie las emite. */
  readonly columnas: readonly number[]
  readonly lineasDelTitular: number
  /** Si las tres columnas van apiladas. La grilla del pie conmuta en 768. */
  readonly apiladas: boolean
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
  const total =
    2 * px('--spacing-20') + 4 * px('--spacing-12') +
    (apiladas ? 2 * micro + px('--grilla-canal-amplio') : micro) +
    lineasDelTitular * tamXl * px('--leading-titulo') +
    cuerpo + 2 * px('--spacing-2') +
    (apiladas ? columnas.reduce((a, b) => a + b, 0) + 2 * canal : Math.max(...columnas)) +
    cierre
  return { total, columnas, lineasDelTitular, apiladas }
}
