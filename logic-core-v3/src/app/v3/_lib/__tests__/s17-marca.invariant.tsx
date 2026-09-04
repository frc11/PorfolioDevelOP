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
 * Dónde se MONTAN las piezas en el home vivo es del sprint paralelo y va al
 * reporte, no acá.
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
afirmar((FUENTE_LAYOUT.match(/localFont\(/g) ?? []).length === 2, 'el layout sigue con DOS familias locales (Chivo y Chivo Mono), no una tercera')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · CABLEADO EN EL INSTRUMENTO — se demuestra y se puede mirar')

const FUENTE_GALERIA = leer('src/app/v3/componentes/page.tsx')
afirmar(FUENTE_GALERIA.includes('GaleriaMarca'), 'la galería de componentes monta la ficha de marca, para verla en el navegador')
const FUENTE_BLOQUE = leer('src/app/v3/componentes/_bloques/GaleriaMarca.tsx')
afirmar(FUENTE_BLOQUE.includes('data-seccion="invertida"'), '  y la muestra sobre papel Y sobre la sección invertida: la regla del acento sólo se ve con los dos fondos')

cerrar('s17-marca')
