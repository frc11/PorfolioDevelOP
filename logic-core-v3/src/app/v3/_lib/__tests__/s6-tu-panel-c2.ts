/**
 * INVARIANTE — TU PANEL, CUERPO (C2, tarea 60b). Lo corre `s6-tu-panel` (no es una suite propia: un módulo del instrumento, acá para que la sección siga con UN invariante, `s6-lane`): la palabra pálida detrás del
 * título, los espacios achicados y el alto que mide su contenido (REGLA DE ALTURAS), los textos de `05-TEXTOS.md`, el adiós
 * a `?grupo=` y `?palabra-movil=`, y en el teléfono el título más grande en tres renglones, la palabra fundida del ancho de
 * la sección y más notoria, y los títulos de los módulos distintos del cuerpo. Cada detector corre contra la entrada de
 * antes (su control positivo). Lo que sólo el navegador mide (los espacios en px, el eje, el candado) es `panel-b6.ts`.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import { RAIZ } from './s3-archivos'
import { quitarComentarios } from './s3-escaneo'
import { FUENTE_DISPLAY, anchoDeTexto } from './s10-avance'
import { leerAvancesDe } from './s10-woff2'
import { PALABRA_DEL_TITULO, TARJETAS, TITULO } from '../../_secciones/tu-panel/contenido'
import { textoAccesible } from '../../_secciones/tu-panel/deteccion'
import {
  ALFA_DE_LA_PALABRA,
  ALFA_DE_LA_PALABRA_ANGOSTA,
  CLASE_DE_LA_PALABRA,
  CLASE_DE_LA_PALABRA_DEL_TITULO,
  CLASE_DEL_GRUPO,
  CLASE_DEL_TITULO_ANGOSTO,
  CLASE_DEL_TITULO_DEL_MODULO,
  EM_DE_LA_PALABRA,
  RITMO,
  RITMO_ANGOSTO,
  TIPO,
  altoDelModulo,
  altoEnEscritorio,
  divisorDeLaPalabraAngosta,
  tamanoDelTitulo,
  tamanoDelTituloAngosto,
} from '../../_secciones/tu-panel/geometria'
import { TIPOGRAFIA_QUE_SE_PINTA } from '../../_secciones/tu-panel/TituloQueSePinta'

export interface EntradaDeC2 {
  /** El marcado servido, sin coreografía. */
  readonly quieto: string
  /** El código de producto de la sección, junto. */
  readonly codigo: string
  /** Las pantallas que declara la tabla (700svh → 7). */
  readonly tabla: number
  readonly fuenteDe: (nombre: string) => string
}

const cara = leerAvancesDe(FUENTE_DISPLAY)
/** La razón del ancho en la 700 contra la instancia por defecto (la de `s6-tu-panel` §5). */
const A_LA_700 = 8.19 / anchoDeTexto(cara, 'TU NEGOCIO VENDIENDO', 1, -0.02)
const emDe = (texto: string): number => anchoDeTexto(cara, texto.toUpperCase(), 1, -0.02) * A_LA_700

const TEMA = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
const hex = (re: RegExp): number[] => [1, 3, 5].map((i) => Number.parseInt((re.exec(TEMA)?.[1] ?? '#000000').slice(i, i + 2), 16))
const lineal = (c: number): number => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
const luz = (rgb: readonly number[]): number => 0.2126 * lineal(rgb[0]) + 0.7152 * lineal(rgb[1]) + 0.0722 * lineal(rgb[2])
const PAPEL = hex(/--color-fondo:\s*(#[0-9A-Fa-f]{6})/)
const TINTA = hex(/--color-tinta:\s*(#[0-9A-Fa-f]{6})/)
const contrasteDe = (alfa: number): number => (luz(PAPEL) + 0.05) / (luz(PAPEL.map((p, i) => alfa * TINTA[i] + (1 - alfa) * p)) + 0.05)

/** Lo que medía el respiro de antes (px): crecía hasta que la sección llenaba la tabla (aire 30, CTA y tres uniones de 100svh). */
const respiroDeAntes = (util: number, alto: number): number => 7 * alto - (0.3 + 1 + 3) * alto - 2 * TIPO.interlineado * tamanoDelTitulo(util, alto) - 3 * altoDelModulo(util, alto)

export function afirmacionesDeC2({ quieto, codigo, tabla, fuenteDe }: EntradaDeC2): void {
  // ═════════════════════════════════════════════════════════════════════════
  titulo('C2 · 1 · Los textos de los módulos, de `05-TEXTOS.md` (ítem 15)')

  const [clientes, resultados, chatbot] = TARJETAS.map((t) => t.descripcion)
  const textosBien = (r: string, c: string): boolean =>
    r.startsWith('Las estadísticas de tu sitio a mano: sesiones, usuarios, rebote y tiempo promedio,') &&
    c.startsWith('Toda la información que tu chatbot necesita saber de tu negocio, guardada en tu base de datos. Todo lo que ofrecés, las preguntas frecuentes,') &&
    c.endsWith('Si algo cambia, nos pedís el ajuste desde el panel.')
  afirmar(textosBien(resultados, chatbot) && clientes.startsWith('Cada persona que te deja sus datos'), '«El resumen del mes» empieza «Las estadísticas de tu sitio a mano:» y el del chatbot «Toda la información… guardada en tu base de datos. Todo lo que ofrecés,»; lo demás sigue igual')
  controlPositivo('  el detector VE los textos de antes («Las visitas de tu sitio de un vistazo:»)', ['Las visitas de tu sitio de un vistazo: sesiones, usuarios, rebote y tiempo promedio,', chatbot] as const, ([r, c]: readonly [string, string]) => textosBien(r, c))

  // ═════════════════════════════════════════════════════════════════════════
  titulo('C2 · 2 · «Lo que nos distingue», pálida detrás del título, de lado a lado')

  const palabra = PALABRA_DEL_TITULO.join(' ')
  const encabezado = /<div data-pieza="encabezado-del-panel"[\s\S]*?<\/h2>/.exec(quieto)?.[0] ?? ''
  const detras = (html: string): boolean => /^<div data-pieza="encabezado-del-panel" class="relative isolate"><span aria-hidden="true" data-pieza="palabra-del-titulo"/.test(html) && /<\/span><h2 /.test(html) && !textoAccesible(html).includes(PALABRA_DEL_TITULO[1])
  afirmarIgual(palabra, 'Lo que nos distingue', 'la palabra es la de `05-TEXTOS.md`')
  afirmar(detras(encabezado), '  va en la cabecera ANTES del título (detrás: `-z-10` en una cabecera `isolate`), `aria-hidden`: no se anuncia')
  controlPositivo('  el detector VE la palabra anunciada (sin `aria-hidden`)', encabezado.replace('<span aria-hidden="true" data-pieza="palabra-del-titulo"', '<span data-pieza="palabra-del-titulo"'), detras)
  const clase = CLASE_DE_LA_PALABRA_DEL_TITULO
  afirmar(['absolute', 'top-1/2', '-translate-y-1/2', '-z-10', 'font-display', 'font-fuerte', 'uppercase', 'text-tinta', '--alfa-de-la-palabra-angosta', '--alfa-de-la-palabra)'].every((c) => clase.includes(c)), '  centrada en la caja del título, en la letra y el alfa de las palabras fundidas (pálida y disimulada)')
  /** Lo que ocupa del ancho útil un texto con un divisor dado. */
  const ocupa = (texto: string, divisor: number): number => emDe(texto) / divisor
  const desde1024 = ocupa(palabra, TIPO.divisorDeLaPalabraDelTitulo)
  const abajo = Math.max(ocupa(PALABRA_DEL_TITULO[0], TIPO.divisorDeLaPalabraDelTituloAngosta), ocupa(PALABRA_DEL_TITULO[1], TIPO.divisorDeLaPalabraDelTituloAngosta))
  const deLadoALado = (o: number): boolean => o >= 0.9 && o < 1
  afirmar(deLadoALado(desde1024) && deLadoALado(abajo), `  de lado a lado: desde 1024 en un renglón (el ${(desde1024 * 100).toFixed(1)} % del ancho), abajo en dos (el más ancho, el ${(abajo * 100).toFixed(1)} %)`)
  controlPositivo('  el detector VE una palabra que no llega a los bordes (con el divisor del título)', ocupa(palabra, TIPO.divisorDelTitulo), deLadoALado)
  afirmar(/<span aria-hidden="true" data-pieza="palabra-del-titulo"[^>]*>Lo que nos <br data-corte="" class="escritorio:hidden"\/>distingue<\/span>/.test(quieto), '  el corte de los dos renglones existe sólo abajo de 1024')

  // ═════════════════════════════════════════════════════════════════════════
  titulo('C2 · 3 · Abajo de 1024 el título es más grande y va en tres renglones')

  const h2 = /<h2[^>]*data-pieza="titulo-que-se-pinta"[\s\S]*?<\/h2>/.exec(quieto)?.[0] ?? ''
  const tresRenglones = (html: string): boolean => (html.match(/<br data-corte="" class="escritorio:hidden"\/>/g) ?? []).length === 1 && /<br data-corte="" class="escritorio:hidden"\/> <span data-palabra=""[^>]*>controlás</.test(html) && /<span class="block whitespace-nowrap">/.test(html)
  afirmar(tresRenglones(h2) && TITULO.length === 2, '«El panel donde» / «controlás» / «TODO»: un solo corte, antes de «controlás», que desde 1024 no existe (ahí siguen los dos renglones)')
  controlPositivo('  el detector VE el título de antes, sin el corte', h2.replace(/<br data-corte="" class="escritorio:hidden"\/>/, ''), tresRenglones)
  afirmar(h2.includes(CLASE_DEL_TITULO_ANGOSTO) && CLASE_DEL_TITULO_ANGOSTO.startsWith('max-escritorio:') && CLASE_DEL_TITULO_ANGOSTO.includes('--divisor-del-titulo-angosto') && CLASE_DEL_TITULO_ANGOSTO.includes('--tope-del-titulo-angosto'), '  con su tamaño angosto (su divisor y su tope, del dato), sólo abajo de 1024')
  const masGrande = (angosto: (u: number, a: number) => number): boolean =>
    [[326, 844], [704, 1024], [359, 640]].every(([u, a]) => angosto(u, a) >= 1.4 * tamanoDelTitulo(u, a) && (3 * TIPO.interlineado * angosto(u, a)) / a <= 0.3)
  afirmar(masGrande(tamanoDelTituloAngosto), `  más grande: a 390 × 844 ${tamanoDelTituloAngosto(326, 844).toFixed(0)} px contra ${tamanoDelTitulo(326, 844).toFixed(0)}, a 768 × 1024 ${tamanoDelTituloAngosto(704, 1024).toFixed(0)} contra ${tamanoDelTitulo(704, 1024).toFixed(0)} (al menos 1,4 veces) y los tres renglones en menos del 30 % del alto`)
  controlPositivo('  el detector VE el tamaño de antes', tamanoDelTitulo, masGrande)
  const nuncaMenos = (angosto: (u: number, a: number) => number, clase: string): boolean => [[780, 390], [326, 844], [704, 1024], [892, 412]].every(([u, a]) => angosto(u, a) >= tamanoDelTitulo(u, a)) && clase.includes('--divisor-del-titulo)') && clase.includes('--tope-del-titulo)')
  afirmar(nuncaMenos(tamanoDelTituloAngosto, CLASE_DEL_TITULO_ANGOSTO), `  y nunca menos que el de antes: con el teléfono acostado (844 × 390) manda el de escritorio (${tamanoDelTituloAngosto(780, 390).toFixed(0)} px, no los ${(0.1 * 390).toFixed(0)} del tope angosto)`)
  controlPositivo('  el detector VE el tope angosto solo (más chico acostado)', (u: number, a: number) => Math.min(u / TIPO.divisorDelTituloAngosto, (TIPO.topeDelTituloAngosto / 100) * a), (f: (u: number, a: number) => number) => nuncaMenos(f, CLASE_DEL_TITULO_ANGOSTO))

  // ═════════════════════════════════════════════════════════════════════════
  titulo('C2 · 4 · Abajo de 1024 la palabra fundida va debajo del título, del ancho de la sección y más notoria')

  const desvios = TARJETAS.map((t) => Math.abs((EM_DE_LA_PALABRA[t.palabra] ?? 0) - emDe(t.palabra)) / emDe(t.palabra))
  afirmar(desvios.every((d) => d < 0.01), 'el ancho en em de cada palabra, contra el binario de la cara de display (a menos del 1 %)', desvios.map((d) => (d * 100).toFixed(2)).join(' · '))
  const llenan = (divisor: (p: string) => number): boolean => TARJETAS.every((t) => deLadoALado(emDe(t.palabra) / divisor(t.palabra)))
  afirmar(llenan(divisorDeLaPalabraAngosta), `  cada una ocupa el ancho de la sección (${TARJETAS.map((t) => `${t.palabra} ${((emDe(t.palabra) / divisorDeLaPalabraAngosta(t.palabra)) * 100).toFixed(0)} %`).join(' · ')})`)
  controlPositivo('  el detector VE el tamaño de antes (el ancho sobre 7: «mucho más discreta»)', () => 7, llenan)
  afirmar(TARJETAS.every((t) => quieto.includes(`--divisor-de-esta-palabra:${String(divisorDeLaPalabraAngosta(t.palabra))}`)), '  cada fila le pasa a su palabra su divisor (del dato)')
  const debajo = (c: string): boolean => ['max-escritorio:absolute', 'max-escritorio:inset-x-0', 'max-escritorio:-z-10', '--divisor-de-esta-palabra', 'escritorio:text-', '--alfa-de-la-palabra-angosta', '--alfa-de-la-palabra)'].every((x) => c.includes(x))
  afirmar(debajo(CLASE_DE_LA_PALABRA), '  detrás del título (absoluta, `-z-10`) sólo abajo de 1024; desde 1024, arriba de él en el flujo, con su tamaño y su alfa de siempre')
  controlPositivo('  el detector VE la palabra en el flujo (la «union» de antes)', CLASE_DE_LA_PALABRA.replace('max-escritorio:absolute ', ''), debajo)
  const notoria = (alfa: number): boolean => contrasteDe(alfa) >= 1.1 && contrasteDe(alfa) <= 1.16
  afirmar(notoria(ALFA_DE_LA_PALABRA_ANGOSTA) && Math.abs(contrasteDe(ALFA_DE_LA_PALABRA) - 1.0595) < 0.002, `  más notoria: abajo de 1024 al ${contrasteDe(ALFA_DE_LA_PALABRA_ANGOSTA).toFixed(3)}:1 (sigue pálida); desde 1024 al ${contrasteDe(ALFA_DE_LA_PALABRA).toFixed(4)}:1 de siempre`)
  controlPositivo('  el detector VE el alfa de antes («casi no se ve»)', ALFA_DE_LA_PALABRA, notoria)

  // ═════════════════════════════════════════════════════════════════════════
  titulo('C2 · 5 · Los títulos de los módulos, distintos del cuerpo y del título general (abajo de 1024)')

  const filas = quieto.match(/<li data-pieza="fila-del-panel"[\s\S]*?<\/li>/g) ?? []
  const clasesDeLosTitulos = filas.map((f) => /<h3 data-pieza="titular"[^>]*class="([^"]*)"/.exec(f)?.[1] ?? '')
  const distinto = (c: string): boolean => /\bmax-escritorio:font-display\b/.test(c) && /\bmax-escritorio:font-semi\b/.test(c) && /\bmax-escritorio:text-fluido-titulo-l\b/.test(c) && !/\buppercase\b/.test(c) && !/\bfont-fuerte\b/.test(c)
  afirmar(clasesDeLosTitulos.length === 3 && clasesDeLosTitulos.every(distinto) && clasesDeLosTitulos.every((c) => c.includes(CLASE_DEL_TITULO_DEL_MODULO)), 'en la cara de display del sitio (el cuerpo es Chivo), a 600 y en minúsculas (el título general va a 700 y en mayúsculas), más grandes (`titulo-l` fluido: 24 px a 390 contra los 15 del cuerpo)')
  controlPositivo('  el detector VE un título igual al general', `${TIPOGRAFIA_QUE_SE_PINTA} max-escritorio:font-display max-escritorio:font-semi max-escritorio:text-fluido-titulo-l`, distinto)
  controlPositivo('  el detector VE el título de antes (la familia del cuerpo)', 'font-titulo text-fluido-titulo-m', distinto)

  // ═════════════════════════════════════════════════════════════════════════
  titulo('C2 · 6 · Sin banderas: `?grupo=` queda en final y `?palabra-movil=` en debajo (las dos se fueron)')

  const sinBanderas = (c: string, archivo: boolean): boolean => !archivo && !/palabra-movil|useBanderasDelPanel|useSyncExternalStore|'union'|medio-entre-filas/.test(c)
  afirmar(sinBanderas(quitarComentarios(codigo), existsSync(path.join(RAIZ, 'src/app/v3/_secciones/tu-panel/banderas.ts'))), '`banderas.ts` borrado y ningún archivo de la sección lee la URL ni nombra `union`')
  controlPositivo('  el detector VE la bandera de antes', "const grupo = useSyncExternalStore(sinCambios, () => posicionDelGrupo(deLaUrl('grupo')), () => 'final')", (c: string) => sinBanderas(c, false))
  afirmar(Object.values(CLASE_DEL_GRUPO).every((c) => /\bescritorio:self-end\b/.test(c)) && !/translate-y/.test(Object.values(CLASE_DEL_GRUPO).join(' ')), '  `final`: el pie de cada grupo, al de su módulo (el ±2 px lo mide el banco)')
  afirmar(!/Fila[^\n]*grupo=|Fila[^\n]*palabra=/.test(fuenteDe('TuPanel.tsx')), '  y la fila no recibe posición ni palabra')

  // ═════════════════════════════════════════════════════════════════════════
  titulo('C2 · 7 · Los espacios (ítem 15) y el alto que mide su contenido (REGLA DE ALTURAS)')

  const chicos = (r: { readonly respiro: number; readonly entreFilas: number; readonly antesDelCta: number }): boolean => r.respiro <= 20 && r.entreFilas <= 25 && r.antesDelCta <= 10
  afirmar(chicos(RITMO), `desde 1024: título → primer módulo ${String(RITMO.respiro)}svh, entre módulos ${String(RITMO.entreFilas)}svh, último módulo → CTA ${String(RITMO.antesDelCta)}svh`)
  controlPositivo('  el detector VE los de antes (el respiro que crecía, 100 y 100)', { respiro: 61, entreFilas: 100, antesDelCta: 100 }, chicos)
  for (const [ancho, alto] of [[1440, 900], [1024, 768]] as const) {
    const util = ancho - 64
    const svh = alto / 100
    console.log(`  ${String(ancho)} × ${String(alto)} (px): título → módulo ${respiroDeAntes(util, alto).toFixed(0)} → ${(RITMO.respiro * svh).toFixed(0)} · entre módulos ${String(alto)} → ${(RITMO.entreFilas * svh).toFixed(0)} · último → CTA ${String(alto)} → ${(RITMO.antesDelCta * svh).toFixed(0)} (más el aire de adentro del CTA)`)
  }
  console.log(`  abajo de 1024 (sin cambios): respiro ${String(RITMO_ANGOSTO.respiro)}svh y entre módulos ${String(RITMO_ANGOSTO.entreFilas)}svh`)
  const midioSuContenido = (html: string): boolean => /<section[^>]*data-panel="tu-panel"[^>]*style="min-height:auto"/.test(html) && !/--alto-de-la-tabla|escritorio:grow|(^|[\s"])escritorio:min-h-/.test(html)
  afirmar(midioSuContenido(quieto), 'el `<section>` mide su contenido (sin el piso de la tabla) y ya no hay un tramo que crece')
  controlPositivo('  el detector VE la sección de antes (el respiro que crecía hasta la tabla)', quieto.replace('data-pieza="respiro-del-panel" class="', 'data-pieza="respiro-del-panel" class="escritorio:grow '), midioSuContenido)
  const pantallas = (util: number, alto: number): number => altoEnEscritorio(util, alto) / alto
  const corta = (f: (u: number, a: number) => number): boolean => [[1376, 900], [960, 768], [1856, 1080], [1216, 720]].every(([u, a]) => f(u, a) < tabla - 2)
  afirmar(corta(pantallas), `el modelo da ${[[1376, 900], [960, 768]].map(([u, a]) => `${pantallas(u, a).toFixed(2)} pantallas (k ≈ ${(pantallas(u, a) / tabla).toFixed(3)})`).join(' y ')} a 1440 × 900 y 1024 × 768, contra las ${String(tabla)} de la tabla: la escena lo descuenta con el tramo (§11)`)
  controlPositivo('  el detector VE la sección de antes (la tabla entera)', () => tabla, corta)
}
