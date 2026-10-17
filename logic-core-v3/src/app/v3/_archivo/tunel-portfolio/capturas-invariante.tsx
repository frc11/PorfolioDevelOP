import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { COMPOSICION_MIN_ANCHO_PX } from '../../_lib/compuerta'

import { CapturaPorDispositivo } from './Captura'
import { CONSULTA_DEL_CORTE, CORTE_DE_MOVIL_PX, MEDIDA_POR_CORTE, corteParaElAncho, fuenteDelCorte } from './capturas'
import { CONTENIDO } from './contenido'
import { MEDIDAS_DE_LAS_CAPTURAS, SIZES_DE_LA_CAPTURA } from './geometria'
import { medidasDeWebp } from './trabajos-piezas'

/**
 * §26 DEL INVARIANTE DE TRABAJOS — **LA DIRECCIÓN DE ARTE.** Lo llama `trabajos.invariant`.
 *
 * Que cada ancho cargue SÓLO su captura se afirma sobre el marcado que se sirve: se
 * leen las `<source>` y la `<img>` del `<picture>`, se resuelve para cada ancho cuál
 * gana con la misma regla del navegador (la primera que cumple), y se afirma que el
 * archivo ganador es el del corte y que ninguna fuente nombra el archivo de otro.
 * Que el navegador lo haga de verdad lo mide el banco del sprint sobre la red.
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(AQUI, '../../../../..')
const TEMA = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
const TECHO_DE_PESO_KIB = 150

interface Fuente {
  readonly media: string | null
  readonly urls: readonly string[]
}

/** Las fuentes de un `<picture>` en el orden del marcado, la `<img>` al final. */
function fuentesDe(html: string): Fuente[] {
  const fuentes: Fuente[] = []
  for (const m of html.matchAll(/<(source|img)\b([^>]*)>/g)) {
    const atributos = m[2]
    const media = /\bmedia="([^"]*)"/.exec(atributos)?.[1] ?? null
    const srcset = /\bsrcSet="([^"]*)"|\bsrcset="([^"]*)"/.exec(atributos)
    const src = /\bsrc="([^"]*)"/.exec(atributos)?.[1]
    const urls = [...(srcset?.[1] ?? srcset?.[2] ?? '').split(',').map((d) => d.trim().split(/\s+/)[0]), src ?? '']
      .filter((u) => u.length > 0)
      .map((u) => decodeURIComponent(u.replace(/&amp;/g, '&')))
    fuentes.push({ media: m[1] === 'img' ? null : media, urls })
  }
  return fuentes
}

/** La regla del navegador para una consulta `(max-width: N)`: cumple si el ancho no la pasa. */
function cumple(media: string, ancho: number): boolean {
  const n = /\(max-width:\s*([\d.]+)px\)/.exec(media)
  if (n === null) throw new Error(`consulta que este lector no sabe resolver: ${media}`)
  return ancho <= Number(n[1])
}

/** Qué archivo de captura elige un ancho: el de la primera fuente que cumple. */
function elegida(fuentes: readonly Fuente[], ancho: number): readonly string[] {
  const gana = fuentes.find((f) => f.media === null || cumple(f.media, ancho))
  if (gana === undefined) throw new Error('el <picture> no tiene imagen de base')
  return [...new Set(gana.urls.map((u) => /\/capturas\/[^&?]+/.exec(u)?.[0] ?? u))]
}

const ANCHOS = [320, 375, 390, 425, 426, 768, 820, 1023, 1024, 1440, 1920] as const

export function afirmarLaDireccionDeArte(): void {
  titulo('26 · La dirección de arte: cada ancho descarga sólo su captura')

  afirmarIgual(
    Number(/--breakpoint-movil:\s*(\d+)px/.exec(TEMA)?.[1]),
    CORTE_DE_MOVIL_PX,
    'el corte de móvil de las `<source>` es `--breakpoint-movil` del tema',
  )
  afirmarIgual(
    Number(/--breakpoint-escritorio:\s*(\d+)px/.exec(TEMA)?.[1]),
    COMPOSICION_MIN_ANCHO_PX,
    '  y el de tablet es `--breakpoint-escritorio`: la caja y el archivo cambian en el mismo ancho',
  )

  for (const [i, proyecto] of CONTENIDO.proyectos.entries()) {
    for (const corte of ['movil', 'tablet'] as const) {
      const ruta = path.join(RAIZ, 'public', fuenteDelCorte(proyecto.pagina.fuente, corte))
      const real = medidasDeWebp(new Uint8Array(readFileSync(ruta)))
      const kib = statSync(ruta).size / 1024
      afirmarIgual([real.ancho, real.alto], [MEDIDA_POR_CORTE[corte].ancho, MEDIDA_POR_CORTE[corte].alto], `«${proyecto.nombre}» ${corte}: el archivo mide lo que declara \`capturas.ts\``)
      afirmar(kib <= TECHO_DE_PESO_KIB, `  y pesa ${kib.toFixed(1)} KiB, debajo de ${String(TECHO_DE_PESO_KIB)}`)
    }

    const html = renderToStaticMarkup(
      createElement(CapturaPorDispositivo, {
        fuente: proyecto.pagina.fuente,
        alt: proyecto.pagina.alt,
        ancho: MEDIDAS_DE_LAS_CAPTURAS[i].ancho,
        alto: MEDIDAS_DE_LAS_CAPTURAS[i].alto,
        sizes: SIZES_DE_LA_CAPTURA,
      }),
    )
    const fuentes = fuentesDe(html)
    afirmarIgual(
      fuentes.map((f) => f.media),
      [CONSULTA_DEL_CORTE.movil, CONSULTA_DEL_CORTE.tablet, null],
      `«${proyecto.nombre}»: móvil, tablet y la de escritorio de base, en ese orden`,
    )
    const errados = ANCHOS.filter((ancho) => {
      const corte = corteParaElAncho(ancho)
      const esperado = corte === 'escritorio' ? proyecto.pagina.fuente : fuenteDelCorte(proyecto.pagina.fuente, corte)
      const gana = elegida(fuentes, ancho)
      return gana.length !== 1 || gana[0] !== esperado
    })
    afirmarIgual(errados, [], `  y en los ${String(ANCHOS.length)} anchos gana UN archivo, el de su corte (320 a 1920)`)
  }

  controlPositivo(
    'el lector ve una tablet que se come al móvil (las `<source>` al revés)',
    [
      { media: CONSULTA_DEL_CORTE.tablet, urls: ['/capturas/banu-tablet.webp'] },
      { media: CONSULTA_DEL_CORTE.movil, urls: ['/capturas/banu-movil.webp'] },
      { media: null, urls: ['/capturas/banu.webp'] },
    ] as const,
    (fuentes: readonly Fuente[]) => elegida(fuentes, 375)[0] === '/capturas/banu-movil.webp',
  )
  controlPositivo(
    '  y una fuente que nombra dos archivos',
    [{ media: CONSULTA_DEL_CORTE.movil, urls: ['/capturas/banu-movil.webp', '/capturas/banu.webp'] }, { media: null, urls: ['/capturas/banu.webp'] }] as const,
    (fuentes: readonly Fuente[]) => elegida(fuentes, 375).length === 1,
  )
}
