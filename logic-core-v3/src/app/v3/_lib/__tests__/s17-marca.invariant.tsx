/**
 * INVARIANTE — B3 · LA MARCA EN TRES REGISTROS.
 *
 *     npx tsx src/app/v3/_lib/__tests__/s17-marca.invariant.tsx
 *     npm run test:s17-marca
 *
 * Afirma que las tres piezas —logotipo, separador, prefijo— existan, se compongan
 * como conjunto, y respeten las reglas cerradas del sistema: el prefijo consume el
 * ALIAS del acento (no un color concreto) y va como RELLENO (no como texto), el
 * separador es la regla del sistema, y Instrument Serif NO se carga ni se usa dos
 * veces (es una propuesta con su razón, no una dependencia).
 *
 * ⚠ Renderiza el marcado real con `renderToStaticMarkup`; no mira el navegador.
 *
 * ⚠ **B4-A: el montaje YA no es del sprint paralelo.** Decía que dónde se montan
 * las piezas en el home vivo iba al reporte y no acá; B4-A las montó en el rótulo
 * de sección, en el pie y en la pastilla, así que §6 lo AFIRMA sobre el home
 * entero renderizado, y §7 cuenta las apariciones de Instrument Serif.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// `tsx` compila el JSX con el runtime clásico: los componentes buscan React en el
// ámbito global. Igual que `s3-piezas.tsx`.
;(globalThis as unknown as { React: typeof React }).React = React

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ALIAS_DE_ACENTO, CLASE_PREFIJO, CLASE_SEPARADOR, INSTRUMENT_SERIF_PROPUESTA, LOGOTIPO } from '../../_componentes/marca/sistema'
import { Logotipo, MarcaLockup, PrefijoDeServicio, Separador } from '../../_componentes/marca/Marca'
import { Home } from '../../_secciones/Home'
import { REGISTRO } from '../../_secciones/_contrato/registro'
import { marcar } from '../../_secciones/_invariantes/render'

const RAIZ = process.cwd()
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

const html = (nodo: React.ReactElement): string => renderToStaticMarkup(nodo)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LOS TRES REGISTROS EXISTEN Y SE COMPONEN COMO CONJUNTO')

const logo = html(<Logotipo />)
afirmar(logo.includes('data-pieza="logotipo"') && logo.includes(LOGOTIPO), `el logotipo renderiza «${LOGOTIPO}»`, logo)
afirmar(/font-titulo/.test(logo), '  en la familia del sistema (Chivo, `font-titulo`), no un texto suelto')

const sep = html(<Separador />)
afirmar(sep.includes('data-pieza="separador"') && new RegExp(`\\b${CLASE_SEPARADOR}\\b`).test(sep), `el separador es la regla del sistema (\`${CLASE_SEPARADOR}\`)`, sep)
afirmar(sep.includes('aria-hidden="true"'), '  y es decorativo: no anuncia nada')

const pre = html(<PrefijoDeServicio />)
afirmar(pre.includes('data-pieza="prefijo-de-servicio"'), 'el prefijo de servicio existe')

const lockup = html(<MarcaLockup>lo que sigue</MarcaLockup>)
afirmar(
  lockup.includes('data-pieza="prefijo-de-servicio"') && lockup.includes('data-pieza="logotipo"') && lockup.includes('data-pieza="separador"'),
  'el lockup compone los TRES: prefijo + logotipo + separador — el sistema, no el símbolo suelto',
)
const lockupMinimo = html(<MarcaLockup />)
afirmar(
  lockupMinimo.includes('data-pieza="prefijo-de-servicio"') && lockupMinimo.includes('data-pieza="logotipo"') && !lockupMinimo.includes('data-pieza="separador"'),
  'la firma mínima (sin continuación) es prefijo + logotipo, y el separador NO aparece sin algo que separar',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL PREFIJO — el ALIAS del acento, como RELLENO, nunca como texto')

afirmar(new RegExp(`\\b${CLASE_PREFIJO}\\b`).test(pre), `el prefijo usa \`${CLASE_PREFIJO}\` — RELLENO, la forma que vale en los dos temas`, pre)
afirmar(!/text-acento/.test(pre), '  y NUNCA `text-acento`: sobre oscuro el acento no llega ni a 3:1')
afirmar(CLASE_PREFIJO === 'bg-acento' && ALIAS_DE_ACENTO === '--color-acento', 'consume el ALIAS `--color-acento`, que se retiñe por `data-servicio`')
// No se nombra ningún acento CONCRETO en ninguna pieza: eso rompería el retiñido.
const FUENTE_MARCA_TSX = leer('src/app/v3/_componentes/marca/Marca.tsx')
const FUENTE_MARCA_TS = leer('src/app/v3/_componentes/marca/sistema.ts')
for (const concreto of ['acento-web', 'acento-ia-automatizacion', 'acento-software']) {
  afirmar(!FUENTE_MARCA_TSX.includes(concreto), `Marca.tsx no nombra el acento concreto \`${concreto}\` — sólo el alias`)
}
controlPositivo(
  'el detector de acento-como-texto NO está ciego: vería un `text-acento`',
  '<span class="text-acento">x</span>',
  (h: string) => !/text-acento/.test(h),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · CERO COLOR ESCRITO — sólo tokens')

for (const [fuente, nombre] of [[FUENTE_MARCA_TSX, 'Marca.tsx'], [FUENTE_MARCA_TS, 'sistema.ts']] as const) {
  const hex = fuente.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
  afirmarIgual(hex, [], `${nombre} no escribe ni un hex`)
  afirmar(!/\brgba?\(/.test(fuente), `${nombre} no escribe ni un rgb()/rgba()`)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · INSTRUMENT SERIF — propuesta con razón, NO cargada, NO usada dos veces')

afirmarIgual(INSTRUMENT_SERIF_PROPUESTA.cargadaHoy, false, 'Instrument Serif NO se carga en este bloque (sin dependencias, tipografía cerrada)')
afirmarIgual(INSTRUMENT_SERIF_PROPUESTA.registro, 'separador', 'el lugar PROPUESTO es el separador')
afirmar(INSTRUMENT_SERIF_PROPUESTA.razon.length > 40, '  y viene con su razón escrita, no como capricho')
// No hay un `.woff2` de una serif nuevo ni un next/font/local nuevo en el árbol de marca ni en layout.
const FUENTE_LAYOUT = leer('src/app/v3/layout.tsx')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
afirmar(!/serif/i.test(sinComentarios(FUENTE_MARCA_TSX)), 'ninguna pieza referencia una familia serif EN EL CÓDIGO: hoy el separador es la regla del sistema (la palabra sólo vive en el comentario de la propuesta)')
/**
 * ⚠️ **ERA «DOS FAMILIAS LOCALES, NO UNA TERCERA» Y HOY SON TRES.** La tercera
 * entró con el rehecho del titular del hero y **no es la serif que este frente
 * vigila**: es Archivo, una grotesca de la misma fundición que Chivo, pedida
 * por su nombre para la cara de display.
 *
 * La afirmación se reescribe para que siga vigilando LO QUE VIGILABA —que
 * nadie cargue una serif por la ventana— en vez de contar familias, que era el
 * proxy. El contador se mantiene igual de duro: la tercera está NOMBRADA, así
 * que una cuarta sin declarar sigue rompiendo esto.
 */
const FAMILIAS_LOCALES_DECLARADAS = ['chivo-latin.woff2', 'chivo-mono-latin.woff2', 'archivo-display-latin.woff2'] as const
afirmarIgual((FUENTE_LAYOUT.match(/localFont\(/g) ?? []).length, FAMILIAS_LOCALES_DECLARADAS.length, `el layout carga exactamente las ${FAMILIAS_LOCALES_DECLARADAS.length} familias locales declaradas, ni una más`)
afirmarIgual(
  FAMILIAS_LOCALES_DECLARADAS.filter((f) => !FUENTE_LAYOUT.includes(f)),
  [],
  '  y son esas tres por nombre de binario: Chivo, Chivo Mono y Archivo (la cara de display)',
)
afirmar(
  !/serif/i.test(sinComentarios(FUENTE_LAYOUT).replace(/sans-serif/g, '')),
  '  y NINGUNA es una serif: el separador sigue siendo la regla del sistema, no una letra nueva',
  'la única aparición de «serif» en el código del layout es el `sans-serif` del fallback',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · CABLEADO EN EL INSTRUMENTO — se demuestra y se puede mirar')

const FUENTE_GALERIA = leer('src/app/v3/componentes/page.tsx')
afirmar(FUENTE_GALERIA.includes('GaleriaMarca'), 'la galería de componentes monta la ficha de marca, para verla en el navegador')
const FUENTE_BLOQUE = leer('src/app/v3/componentes/_bloques/GaleriaMarca.tsx')
afirmar(FUENTE_BLOQUE.includes('data-seccion="invertida"'), '  y la muestra sobre papel Y sobre la sección invertida: la regla del acento sólo se ve con los dos fondos')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · B4-A · LAS PIEZAS ESTÁN MONTADAS EN EL HOME VIVO')

/**
 * B3 dejó las tres construidas y **sin montar**: las superficies de marca del
 * home caían en `_secciones/` y en la geometría de la pastilla, que eran del
 * sprint paralelo. Acá se afirma que ya no: se renderiza el home entero, en las
 * dos ramas, y se cuenta dónde aparece cada registro.
 */
const HOME = [false, true].map((anima) => marcar(<Home />, { anima }))
const [QUIETO, ANIMADO] = HOME
const veces = (html: string, aguja: string): number => html.split(aguja).length - 1

/**
 * ⚠️ **LAS SECCIONES SIN MARCA SE NOMBRAN UNA POR UNA, NO SE BAJA EL PISO.**
 *
 * Este renglón afirmaba «al menos una por cada una de las 8 secciones», y el
 * ajuste de estructura del hero lo puso en rojo: la rama animada pasó de 8 a 7.
 * Bajar el número a 7 habría dejado la comprobación pasando por una razón que
 * nadie puede leer. Lo que se declara es la EXCEPCIÓN, con su motivo, y el piso
 * se deriva de ella — así que una segunda sección que pierda su marca sin
 * declararse vuelve a poner esto en rojo.
 *
 * El cuadrado de `--color-acento` de la columna lateral del hero se sacó por
 * pedido del humano («muy afuera de la columna»). La pieza NO se tocó: las
 * otras tres secciones que la montaban y el pie la siguen mostrando, y la
 * columna de 140 px del hero sigue reservada con un `<div>` vacío, porque es la
 * que sostiene el cierre estructural de B11.
 */
const SECCIONES_SIN_MARCA = ['hero'] as const

/**
 * LAS SUPERFICIES DEL HOME QUE MONTAN LA PALABRA `develOP`, con su motivo.
 *
 * Es la lista de la que sale el número que se afirma abajo. Está acá y no como
 * un literal para que agregar una aparición obligue a escribir POR QUÉ, que es
 * la diferencia entre un padrón y un contador.
 */
const SUPERFICIES_CON_LOGOTIPO = [
  { donde: 'el pie', motivo: 'la firma del documento, desde S17' },
  { donde: 'el Hero', motivo: 'PAPEL-2 §2 — la marca arriba del titular, visible sólo en los anchos de papel (320 y 375), donde el panel es opaco y la sala no se ve' },
] as const
const PISO_DEL_PREFIJO = REGISTRO.length - SECCIONES_SIN_MARCA.length

for (const [rama, html] of [['quieta', QUIETO], ['animada', ANIMADO]] as const) {
  afirmar(veces(html, 'data-pieza="prefijo-de-servicio"') >= PISO_DEL_PREFIJO, `rama ${rama}: el PREFIJO aparece ${veces(html, 'data-pieza="prefijo-de-servicio"')} veces — al menos una por cada una de las ${PISO_DEL_PREFIJO} secciones que lo montan (${REGISTRO.length} menos ${SECCIONES_SIN_MARCA.join(', ')}, declarada arriba) más el pie`)
  afirmar(veces(html, 'data-pieza="separador"') > 0, `  el SEPARADOR aparece ${veces(html, 'data-pieza="separador"')} veces: los rótulos con número y nombre contiguos, más el pie`)
  /**
   * ⚠️ **PAPEL-2 · SON DOS, Y LA SEGUNDA ESTÁ DECLARADA CON SU CONDICIÓN.**
   *
   * Hasta este sprint el pie era la única superficie del home con el logotipo.
   * Ahora el Hero monta la marca arriba del titular —la palabra y el isotipo—
   * porque en 320 y 375 pinta papel opaco, o sea que la sala NO se ve y la
   * pantalla se queda sin lo único que la distinguía de las otras siete.
   *
   * **El número no se sube y ya: se DERIVA de una lista de superficies con su
   * motivo**, igual que `SECCIONES_SIN_MARCA` deriva el piso del prefijo. Una
   * tercera aparición sin declararse vuelve a poner esto en rojo, que es para lo
   * que la comprobación existe.
   *
   * ⚠ El logotipo del Hero está en el marcado de los OCHO anchos y **se ve en
   * dos**: `chico:hidden` lo apaga de 390 para arriba. Esta cuenta es de marcado,
   * así que lo cuenta igual — y eso es correcto, porque lo que cuesta bytes es
   * estar, no verse. Lo que se ve por ancho lo mide `hero.invariant` §15c.
   */
  afirmarIgual(
    veces(html, 'data-pieza="logotipo"'),
    SUPERFICIES_CON_LOGOTIPO.length,
    `  y el LOGOTIPO aparece ${SUPERFICIES_CON_LOGOTIPO.length} veces: ${SUPERFICIES_CON_LOGOTIPO.map((s) => s.donde).join(' · ')}`,
  )
  afirmarIgual(
    veces(html, 'data-pieza="isotipo"'),
    1,
    `  y el ISOTIPO UNA sola: el dibujo de la marca sólo lo monta el Hero, y sólo se VE abajo de 390`,
  )
}

/** ⚠️ **EL DEFECTO QUE EL MONTAJE ARREGLA, afirmado sobre el marcado.** La marca
 *  del pie viajaba como texto adentro de un `Caption` con `uppercase`, así que
 *  el sitio decía «DEVELOP». La pieza trae `normal-case` y la palabra sobrevive.
 *
 *  ⚠️ **PAPEL-2 · SE BUSCA EL ÚLTIMO Y NO EL PRIMERO, Y ES UNA CORRECCIÓN DEL
 *  DETECTOR.** Este renglon tomaba `indexOf`, o sea la PRIMERA aparición del
 *  logotipo del documento, y eso valía mientras el pie fuera la única. Con la
 *  marca del Hero —que abre el documento— la primera pasó a ser otra y el
 *  chequeo se puso en rojo midiendo la pieza equivocada. El pie CIERRA el
 *  documento, así que `lastIndexOf` lo encuentra por una propiedad estructural
 *  y no por un orden que el próximo sprint pueda volver a mover.
 *
 *  Y la del Hero no necesita `normal-case` porque no hereda caja alta de nadie:
 *  vive ARRIBA del `h1`, que es el único `uppercase` de esa columna. Eso se
 *  afirma abajo como lo que es — una propiedad del árbol, no una confianza. */
const enElPie = QUIETO.slice(QUIETO.lastIndexOf('data-pieza="logotipo"'))
afirmar(/normal-case/.test(enElPie.slice(0, 300)), 'el logotipo del pie lleva `normal-case`: la caja alta heredada no se come la `d` minúscula ni el `OP`')
afirmar(
  QUIETO.indexOf('data-pieza="logotipo"') < QUIETO.indexOf('data-titular="dos-registros"'),
  '  y el del Hero está AFUERA del `h1`: no puede heredar su `uppercase`, y por eso no lleva `normal-case`',
)
afirmarIgual(
  veces(QUIETO, `>${LOGOTIPO}<`),
  SUPERFICIES_CON_LOGOTIPO.length,
  `  y las ${SUPERFICIES_CON_LOGOTIPO.length} apariciones llegan al marcado sin transformar: «${LOGOTIPO}»`,
)
afirmar(QUIETO.includes(`>${LOGOTIPO}<`), `y la palabra llega al marcado sin transformar: «${LOGOTIPO}»`)
controlPositivo('el detector vería el logotipo sin la protección', '<span data-pieza="logotipo" class="uppercase">develOP</span>', (h: string) => /normal-case/.test(h))

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · INSTRUMENT SERIF sigue sin montarse — contado sobre el árbol renderizado')

/**
 * La regla del sistema es que tenga **UNA sola aparición en todo el sitio** y
 * todavía no está decidida. B4-A **no la monta** —el `.woff2` no está en el
 * repo y cargarla es una decisión de tipografía, no de montaje— así que lo que
 * se cuenta acá es cero. **Con su control positivo**, para que ese cero no sea
 * un verde por ceguera: el mismo contador tiene que ver una aparición cuando la
 * hay. El día que alguien la monte, esto le dice cuántas van.
 */
const apariciones = (html: string): number =>
  [...html.matchAll(/font-serif|font-instrument|Instrument\s*Serif/gi)].length
for (const [rama, html] of [['quieta', QUIETO], ['animada', ANIMADO]] as const) {
  afirmarIgual(apariciones(html), 0, `rama ${rama}: CERO apariciones de una serif en el árbol renderizado del home`)
}
afirmar(apariciones(QUIETO + ANIMADO) <= Number(INSTRUMENT_SERIF_PROPUESTA.usoMaximo.match(/\d+/)?.[0] ?? 1), `y el techo del sistema sigue siendo el declarado: «${INSTRUMENT_SERIF_PROPUESTA.usoMaximo}»`)
controlPositivo('el contador NO está ciego: ve una aparición cuando la hay', '<span class="font-serif">x</span>', (h: string) => apariciones(h) === 0)
controlPositivo('  y la ve escrita como familia', '<span style="font-family: Instrument Serif">x</span>', (h: string) => apariciones(h) === 0)

cerrar('s17-marca')
