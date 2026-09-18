/**
 * INVARIANTE — `Pie` deja pasar las dos cajas del Envoltorio, y sin props no
 * cambia el marcado de antes de B1.
 *
 * Corre con `npm run test:s3-layout`.
 *
 * ⚠️ **Modo pulido sacó el resto.** Padding lateral fijo, columnas fluidas,
 * canaletas fijas y la grilla de 5 columnas abajo de 1025 eran composición —
 * geometría medida contra tokens— y se desarmaron enteras. Lo que queda es la
 * cadena de contención: que `Pie` reenvíe `className` a la caja correcta, que
 * es un contrato de props y no una medida.
 */

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Pie, type PieProps } from '../../_componentes/chrome/Pie'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · B1 · `Pie` deja pasar las dos cajas del Envoltorio, y sin props no cambia')

/**
 * ── Por qué esta comprobación vive acá y no en el Cierre ──────────────────
 *
 * Porque lo que se afirma es de la CADENA DE CONTENCIÓN, que es el sujeto de
 * este invariante: `Pie` envuelve un `Envoltorio`, y hasta B1 no dejaba pasar
 * ninguna de sus dos clases —ni la de la caja a sangre ni la de la caja de
 * contenido—. Con eso, el alto moría en el contenido y el apilado del pie no se
 * podía repartir sobre la pantalla: 337 px de banda vacía continua debajo del
 * último renglón del Cierre, medidos a 1920.
 *
 * **Lo que se protege es que las props nuevas no muevan a nadie más.** `Pie` no
 * lo importa nadie fuera de `/v3` —el sitio vivo tiene su propio pie— pero sí lo
 * usan la galería de componentes y el arnés de piezas de S3. La afirmación es
 * contra el literal de antes de B1, byte a byte.
 *
 * ⚠ `createElement` y no JSX: este archivo es `.ts` y renombrarlo movería su
 * script y su entrada en el padrón por una comprobación de tres líneas.
 */
const PIE_DE_ANTES =
  '<footer data-pieza="pie"><div data-pieza="envoltorio" class="w-full max-w-full px-[var(--pad-lateral-compacto)]">' +
  '<div data-parte="contenido" class="mx-auto w-full max-w-tope flex flex-col gap-[var(--spacing-12)]">x</div></div></footer>'
const pie = (props: Partial<PieProps>): string =>
  renderToStaticMarkup(createElement(Pie, { children: 'x', ...props }))

afirmarIgual(pie({}), PIE_DE_ANTES, 'sin props, `Pie` emite byte a byte el marcado de antes de B1')
controlPositivo('el control ve un pie que SÍ cambió', pie({ className: 'grid' }), (h: string) => h === PIE_DE_ANTES)
afirmar(pie({ claseDeContenido: 'content-between' }).includes('gap-[var(--spacing-12)]'), 'con `claseDeContenido` el apilado de `--spacing-12` NO se pierde: las clases se mezclan')
// La caja a sangre es la que lleva `data-pieza="envoltorio"`; la de contenido va
// después. El `class` que se mira es el del PRIMERO, así que la afirmación
// distingue las dos cajas sin depender del orden en que `cn()` deja las clases.
const CAJA_A_SANGRE = /data-pieza="envoltorio" class="([^"]*)"/
afirmar((CAJA_A_SANGRE.exec(pie({ claseDeEnvoltorio: 'grid' }))?.[1] ?? '').split(' ').includes('grid'), '  y `claseDeEnvoltorio` llega a la caja A SANGRE')
afirmar(!(CAJA_A_SANGRE.exec(pie({ claseDeContenido: 'grid' }))?.[1] ?? '').split(' ').includes('grid'), '    mientras que `claseDeContenido` NO la toca: son dos cajas y dos props')

cerrar('s3-layout.invariant')
