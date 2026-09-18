/**
 * D · EL HUECO, LEÍDO DEL PÍXEL — el control cruzado del subrayado.
 *
 *     npx tsx scripts-boton/d-hueco.ts
 *
 * La geometría del hueco sale de `transform` y `transform-origin`, que es un
 * razonamiento sobre valores computados. Esto es el píxel: sobre cada captura
 * de estado, dónde hay tinta en la fila del subrayado y dónde no.
 *
 * ── Por qué no alcanza el detector de `c-tabla.ts` ────────────────────────
 *
 * Aquél busca la fila con la CORRIDA contigua más larga en todo el recorte, y
 * eso es lo correcto contra la sala oscura de la referencia. Contra papel no:
 * el Cierre tiene una celosía de fondo con filas de 56 px de corrida y el hero
 * una escena que se mueve, y las dos le ganan al subrayado **justo en los
 * cuadros donde está partido**, que son los únicos que importan. Acá la
 * búsqueda va acotada por dos condiciones que un fondo no cumple:
 *
 *   1. **El rango de x sale del DOM**, no del píxel: la caja del nodo del
 *      subrayado en hover pleno, trasladada al recorte. Así la medición no
 *      puede caerse a un borde que esté fuera del botón.
 *   2. **A lo sumo TRES corridas.** La raya entera es una, la raya partida son
 *      dos; un renglón de texto son doce o más. Es el discriminador que separa
 *      el subrayado del rótulo sin depender de en qué fila caiga cada uno.
 *
 * El número que este script produce y que el reporte cita: **el ancho del
 * hueco en el cuadro del hueco máximo**, en % del ancho de la raya.
 */

import { existsSync, readFileSync } from 'node:fs'

import { decodificarPng, type Imagen } from '../scripts-b4/png'

import { CRUDO, dos, guardarJson } from './boton-comun'
import type { MedidaDelBoton } from './medida'

const IDS: readonly string[] = ['nk', 'hero', 'cierre']

/** La tinta de una raya: una fila que se aparta de las que tiene 4 px arriba y abajo. */
const UMBRAL = 25

function luminancia(img: Imagen, x: number, y: number): number {
  const k = (y * img.ancho + x) * 4
  return 0.2126 * img.datos[k] + 0.7152 * img.datos[k + 1] + 0.0722 * img.datos[k + 2]
}

function hayTinta(img: Imagen, x: number, y: number, signo: number): boolean {
  const alrededor = 0.5 * (luminancia(img, x, y - 4) + luminancia(img, x, y + 4))
  return signo * (alrededor - luminancia(img, x, y)) > UMBRAL
}

interface Lectura {
  readonly fila: number
  readonly cubiertoPorciento: number
  readonly tramos: readonly string[]
  readonly huecoPorciento: number
}

function leerLaRaya(img: Imagen, x0: number, x1: number, signo: number): Lectura {
  let mejorFila = -1
  let mejorCubierto = -1
  for (let y = 4; y < img.alto - 4; y += 1) {
    let cubierto = 0
    let corridas = 0
    let dentro = false
    for (let x = x0; x <= x1; x += 1) {
      if (hayTinta(img, x, y, signo)) {
        cubierto += 1
        if (!dentro) {
          corridas += 1
          dentro = true
        }
      } else dentro = false
    }
    if (corridas >= 1 && corridas <= 3 && cubierto > mejorCubierto) {
      mejorCubierto = cubierto
      mejorFila = y
    }
  }
  if (mejorFila < 0) return { fila: -1, cubiertoPorciento: 0, tramos: [], huecoPorciento: 0 }

  const ancho = x1 - x0
  const tramos: string[] = []
  const bordes: number[] = []
  let ini = -1
  for (let x = x0; x <= x1 + 1; x += 1) {
    const hay = x <= x1 && hayTinta(img, x, mejorFila, signo)
    if (hay && ini < 0) ini = x
    if (!hay && ini >= 0) {
      if (x - ini >= 2) {
        tramos.push(`${dos(((ini - x0) / ancho) * 100)}–${dos(((x - 1 - x0) / ancho) * 100)}`)
        bordes.push(ini, x - 1)
      }
      ini = -1
    }
  }
  // El hueco es lo que queda entre el final del primer tramo y el arranque del
  // último. Con un solo tramo no hay hueco.
  const hueco =
    bordes.length >= 4 ? ((bordes[bordes.length - 2] - bordes[1]) / ancho) * 100 : 0
  return {
    fila: mejorFila,
    cubiertoPorciento: dos((mejorCubierto / (ancho + 1)) * 100),
    tramos,
    huecoPorciento: dos(hueco),
  }
}

function principal(): void {
  const salida: Record<string, unknown>[] = []
  for (const id of IDS) {
    const ruta = `${CRUDO}/${id}-crudo.json`
    if (!existsSync(ruta)) continue
    const m = JSON.parse(readFileSync(ruta, 'utf8')) as MedidaDelBoton

    // El rango de x sale del DOM: la caja del subrayado en hover pleno.
    const enHover = m.hoverPleno.find((n) => n.rect !== null && n.rect[3] > 0 && n.rect[3] <= 6)
    if (enHover === undefined || enHover.rect === null) {
      console.log(`  ${id}: no se encontró un nodo de raya (alto ≤ 6 px) en el hover — se saltea`)
      continue
    }
    const x0 = Math.round(enHover.rect[0] - m.recorte.x)
    const x1 = Math.round(enHover.rect[0] + enHover.rect[2] - m.recorte.x)
    // Claro sobre sala oscura en la referencia, tinta sobre papel acá.
    const signo = id === 'nk' ? -1 : 1
    console.log(`\n═══ ${m.nombre}   raya en x ${x0}–${x1} del recorte (del DOM), ${signo > 0 ? 'tinta sobre papel' : 'clara sobre sala oscura'}`)

    for (const c of m.capturas) {
      if (!existsSync(c.archivo)) continue
      const l = leerLaRaya(decodificarPng(readFileSync(c.archivo)), x0, x1, signo)
      const corchete = c.desdeElHover === null ? '' : ` · el cuadro cae en [${c.desdeElHover[0]}, ${c.desdeElHover[1]}] ms del hover`
      console.log(
        `  ${c.estado.padEnd(19)} fila ${String(l.fila).padStart(3)} · cubre ${String(l.cubiertoPorciento).padStart(6)}% · hueco ${String(l.huecoPorciento).padStart(6)}%  →  ${l.tramos.join(' + ') || '(sin raya)'}${corchete}`,
      )
      salida.push({ boton: id, estado: c.estado, ...l, desdeElHover: c.desdeElHover })
    }
  }
  const ruta = guardarJson('hueco-en-el-pixel', {
    instrumento: 'scripts-boton/d-hueco.ts — el rango de x sale del DOM y la fila se elige con el tope de 3 corridas',
    cuando: new Date().toISOString(),
    lecturas: salida,
  })
  console.log(`\n  destilado → ${ruta}`)
}

principal()
