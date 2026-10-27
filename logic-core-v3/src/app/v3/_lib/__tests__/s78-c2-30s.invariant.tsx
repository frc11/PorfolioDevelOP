/**
 * s78-c2-30s · [C2-30s] EL ≠ DE QUIÉNES SOMOS, GRANDE Y CENTRADO EN EL ESPACIO LIBRE (cola 2, 2026-10-23, ítem 3 de la revisión).
 * Sin navegador: el tamaño y el centro del ≠ en función del espacio libre (la cuenta de `signo.ts`), que el CSS diga lo mismo que la
 * cuenta (evaluado a cada cuadro), que sea sólo desde 1024 y sin sumarle alto a la pantalla, la raya proporcional y lo que se
 * renderiza. Cada afirmación con su control positivo. En el navegador: `scripts-carga/distinto.ts`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'

import { enUnidadesDelLogo } from '../escena/banda'
import { GEOMETRIA } from '../../_secciones/quienes-somos/geometria'
import { conMotion, quieto } from '../../_secciones/quienes-somos/quienes-somos-piezas'
import {
  CLASES_DEL_SIGNO, ESTILO_DEL_SIGNO, GROSOR_DEL_SIGNO_EN_CUERPOS, MARGEN_DE_LA_PAGINA_PX, RELLENO_DEL_SIGNO, RESERVA_DEL_LOGO_SVH, TINTA_DEL_SIGNO,
  TOPE_DEL_CONTENIDO_PX, cajaDelSigno, espacioLibreDelSigno, ladoDelSigno, reservaDelLogoPx, tintaDelSigno, type Rect,
} from '../../_secciones/quienes-somos/signo'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { valorDeToken } from './s10-css'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')

/** Los cuadros de escritorio que se miden, y el modelo de la fila del ≠ (el banco la mide de verdad). */
const CUADROS: readonly (readonly [number, number])[] = [[1024, 768], [1280, 800], [1440, 900], [1920, 1080]]
/** El cuerpo del titular desde 1024: `min(38px, (50vw − 118px) / 14)` (`geometria.ts`). */
const cuerpoDelTitular = (w: number): number => Math.min(38, (w / 2 - 118) / 14)
/** El ≠ de antes: tres renglones del titular (`--signo-alto`, 3 × 1,25 em). */
const ladoDeAntes = (w: number): number => 3 * 1.25 * cuerpoDelTitular(w)
/** La fila del ≠: del pie del titular (13 svh + dos renglones) a la cabeza del cuerpo (12 svh del pie; cinco renglones de 27,2 px, seis abajo de 1280). */
function filaDelSigno(w: number, h: number): { readonly desde: number; readonly hasta: number } {
  return { desde: 0.13 * h + 2 * 1.25 * cuerpoDelTitular(w), hasta: 0.88 * h - (w < 1280 ? 6 : 5) * 17 * 1.6 }
}
const centro = (r: Rect): readonly [number, number] => [r.x + r.ancho / 2, r.y + r.alto / 2]
const cruza = (a: Rect, b: Rect): boolean => a.x < b.x + b.ancho && b.x < a.x + a.ancho && a.y < b.y + b.alto && b.y < a.y + a.alto

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El tamaño y el centro del ≠, en función del espacio libre')

interface Caso {
  readonly w: number
  readonly h: number
  readonly libre: Rect
  readonly caja: Rect
}
const CASOS: readonly Caso[] = CUADROS.map(([w, h]) => {
  const libre = espacioLibreDelSigno(w, h, filaDelSigno(w, h))
  return { w, h, libre, caja: cajaDelSigno(libre) }
})

const centrado = (c: Caso): boolean => {
  const [a, b] = [centro(c.caja), centro(c.libre)]
  return Math.abs(a[0] - b[0]) <= 0.05 * c.libre.ancho && Math.abs(a[1] - b[1]) <= 0.05 * c.libre.alto
}
afirmar(CASOS.every(centrado), 'centrado en el espacio libre (± 5 % en cada eje; la cuenta lo deja exacto)', CASOS.map((c) => `${String(c.w)}: libre ${c.libre.ancho.toFixed(0)} × ${c.libre.alto.toFixed(0)} desde x ${c.libre.x.toFixed(0)}, el ≠ ${c.caja.ancho.toFixed(0)} centrado en ${centro(c.caja).map((v) => v.toFixed(0)).join(', ')}`).join(' · '))
controlPositivo('  el detector ve el ≠ corrido un 10 % del espacio libre hacia el logo', CASOS.map((c) => ({ ...c, caja: { ...c.caja, x: c.caja.x + 0.1 * c.libre.ancho } })), (cs: readonly Caso[]) => cs.every(centrado))

const grande = (c: Caso): boolean => c.caja.ancho >= 2.5 * ladoDeAntes(c.w)
afirmar(CASOS.every(grande), 'mucho más grande: al menos 2,5 veces el de antes (tres renglones del titular) en cada cuadro', CASOS.map((c) => `${String(c.w)}: ${c.caja.ancho.toFixed(0)} contra ${ladoDeAntes(c.w).toFixed(0)} (${(c.caja.ancho / ladoDeAntes(c.w)).toFixed(2)} veces)`).join(' · '))
controlPositivo('  CONTROL=chico: el detector ve el tamaño de antes', CASOS.map((c) => ({ ...c, caja: { ...c.caja, ancho: ladoDeAntes(c.w), alto: ladoDeAntes(c.w) } })), (cs: readonly Caso[]) => cs.every(grande))

/** La tinta no toca nada: ni el titular (arriba de la fila), ni el cuerpo (abajo), ni el logo (su reserva), ni sale del margen. */
const noTapa = (c: Caso): boolean => {
  const tinta = tintaDelSigno(c.caja)
  const fila = filaDelSigno(c.w, c.h)
  const titular: Rect = { x: 0, y: 0, ancho: c.w, alto: fila.desde }
  const cuerpo: Rect = { x: 0, y: fila.hasta, ancho: c.w, alto: c.h - fila.hasta }
  const logo: Rect = { x: c.w / 2 - reservaDelLogoPx(c.w, c.h), y: 0, ancho: 2 * reservaDelLogoPx(c.w, c.h), alto: c.h }
  return !cruza(tinta, titular) && !cruza(tinta, cuerpo) && !cruza(tinta, logo) && tinta.x >= MARGEN_DE_LA_PAGINA_PX
}
afirmar(CASOS.every(noTapa), 'no tapa: la tinta no cruza el titular, el cuerpo ni la reserva del logo, y no sale del margen', CASOS.map((c) => { const t = tintaDelSigno(c.caja); return `${String(c.w)}: tinta x ${t.x.toFixed(0)}..${(t.x + t.ancho).toFixed(0)} (el logo desde ${(c.w / 2 - reservaDelLogoPx(c.w, c.h)).toFixed(0)}), y ${t.y.toFixed(0)}..${(t.y + t.alto).toFixed(0)}` }).join(' · '))
controlPositivo('  CONTROL=encima: el detector ve el ≠ sobre el titular', CASOS.map((c) => ({ ...c, caja: { ...c.caja, y: filaDelSigno(c.w, c.h).desde - c.caja.alto / 2 } })), (cs: readonly Caso[]) => cs.every(noTapa))
controlPositivo('  y ve el ≠ sin la reserva del logo (el espacio libre hasta el centro del cuadro)', CASOS.map((c) => { const libre = { ...c.libre, ancho: c.libre.ancho + reservaDelLogoPx(c.w, c.h) }; return { ...c, libre, caja: cajaDelSigno(libre) } }), (cs: readonly Caso[]) => cs.every(noTapa))

const ladoBien = (lado: (l: { ancho: number; alto: number }) => number): boolean =>
  CASOS.every((c) => {
    const l = lado(c.libre)
    const tintaAncho = (TINTA_DEL_SIGNO.x1 - TINTA_DEL_SIGNO.x0) * l
    const tintaAlto = (TINTA_DEL_SIGNO.y1 - TINTA_DEL_SIGNO.y0) * l
    const manda = Math.abs(tintaAncho - RELLENO_DEL_SIGNO * c.libre.ancho) < 0.5 || Math.abs(tintaAlto - RELLENO_DEL_SIGNO * c.libre.alto) < 0.5 || Math.abs(l - c.libre.alto) < 0.5
    return manda && tintaAncho <= RELLENO_DEL_SIGNO * c.libre.ancho + 0.5 && tintaAlto <= RELLENO_DEL_SIGNO * c.libre.alto + 0.5 && l <= c.libre.alto + 0.5
  })
afirmar(ladoBien(ladoDelSigno), `el lado: la tinta llena el ${String(RELLENO_DEL_SIGNO * 100)} % del lado que manda del espacio libre, y la caja no pasa del alto de su fila`)
controlPositivo('  el detector ve un lado fijo (no sale del espacio libre)', (l: { ancho: number; alto: number }) => Math.min(300, l.alto), ladoBien)
const crece = [100, 200, 300, 400, 500].map((a) => ladoDelSigno({ ancho: a, alto: 400 }))
afirmar(crece.every((v, k) => k === 0 || v >= (crece[k - 1] ?? 0)) && (crece[4] ?? 0) > (crece[0] ?? 0), 'y crece con el espacio libre (más ancho, más grande, hasta el alto de la fila)', crece.map((v) => v.toFixed(0)).join(' → '))
afirmar(Math.abs(TINTA_DEL_SIGNO.x1 - TINTA_DEL_SIGNO.x0 - 0.84) < 1e-9 && Math.abs(TINTA_DEL_SIGNO.y1 - TINTA_DEL_SIGNO.y0 - 0.68) < 1e-9, 'la tinta sale de los trazos del ≠ (`TRAZOS_DEL_SIGNO`): 0,84 de ancho y 0,68 de alto de su caja')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El CSS dice lo mismo que la cuenta (evaluado en cada cuadro)')

/** Un evaluador chico de `calc()`/`min()`/`max()` con unidades: lo justo para las tres propiedades del ≠. */
function evaluar(expr: string, unidades: Readonly<Record<string, number>>): number {
  const t = expr.match(/\d+(?:\.\d+)?[a-z]*|[a-z]+\(|[()+\-*/,]/g) ?? []
  let i = 0
  const factor = (): number => {
    const k = t[i] ?? ''
    i += 1
    if (k === '(' || k === 'calc(') {
      const v = suma()
      i += 1
      return v
    }
    if (k === 'min(' || k === 'max(') {
      const vs = [suma()]
      while (t[i] === ',') {
        i += 1
        vs.push(suma())
      }
      i += 1
      return k === 'min(' ? Math.min(...vs) : Math.max(...vs)
    }
    const m = /^(\d+(?:\.\d+)?)([a-z]*)$/.exec(k)
    if (m === null) return Number.NaN
    return Number(m[1]) * (m[2] === '' ? 1 : (unidades[m[2]] ?? Number.NaN))
  }
  const producto = (): number => {
    let v = factor()
    while (t[i] === '*' || t[i] === '/') {
      const op = t[i]
      i += 1
      const w = factor()
      v = op === '*' ? v * w : v / w
    }
    return v
  }
  function suma(): number {
    let v = producto()
    while (t[i] === '+' || t[i] === '-') {
      const op = t[i]
      i += 1
      const w = producto()
      v = op === '+' ? v + w : v - w
    }
    return v
  }
  return suma()
}
const TOKENS: Readonly<Record<string, string>> = Object.fromEntries(['--pad-lateral-compacto', '--container-tope', '--columna-lateral', '--grilla-canal-amplio'].map((k) => [k, valorDeToken(k)]))
const conTokens = (s: string, extra: Readonly<Record<string, string>> = {}): string => s.replace(/var\((--[a-z0-9-]+)\)/g, (_, k: string) => extra[k] ?? TOKENS[k] ?? `var(${k})`)
const prop = (k: string): string => String((ESTILO_DEL_SIGNO as Readonly<Record<string, unknown>>)[k] ?? '')

afirmar(TOKENS['--pad-lateral-compacto'] === `${String(MARGEN_DE_LA_PAGINA_PX)}px` && TOKENS['--container-tope'] === `${String(TOPE_DEL_CONTENIDO_PX)}px`, 'el margen y el tope de la cuenta son los tokens del tema', `${TOKENS['--pad-lateral-compacto'] ?? ''} · ${TOKENS['--container-tope'] ?? ''}`)

const anchoDelCss = (css: string): boolean =>
  CASOS.every((c) => Math.abs(evaluar(conTokens(css), { px: 1, vw: c.w / 100, svh: c.h / 100 }) - c.libre.ancho) < 0.5)
afirmar(anchoDelCss(prop('--signo-libre-ancho')), '`--signo-libre-ancho` (el Bloque: del margen al aire del logo) da el ancho del espacio libre de la cuenta en los cuatro cuadros')
controlPositivo('  el detector ve la reserva sin el aire', prop('--signo-libre-ancho').replace(enUnidadesDelLogo(RESERVA_DEL_LOGO_SVH), enUnidadesDelLogo(RESERVA_DEL_LOGO_SVH - 3)), anchoDelCss)

const ladoDelCss = (css: string): boolean =>
  CASOS.every((c) => Math.abs(evaluar(css, { px: 1, cqw: c.libre.ancho / 100, cqh: c.libre.alto / 100 }) - ladoDelSigno(c.libre)) < 0.5)
afirmar(ladoDelCss(prop('--signo-lado')), '`--signo-lado` (en `cqw`/`cqh` del Bloque) da el lado de la cuenta')
controlPositivo('  el detector ve el lado que llena el ancho entero', prop('--signo-lado').replace(/calc\(100cqw \* [\d.]+\)/, '100cqw'), ladoDelCss)

const corrimiento = evaluar(conTokens(prop('--signo-libre-corrimiento')), { px: 1 })
afirmar(corrimiento === 156, 'el Bloque arranca en el margen de la página: se corre la columna lateral y su canaleta (140 + 16 px)', `${String(corrimiento)} px`)

const cuerpoBien = (css: string): boolean => CASOS.every((c) => Math.abs(evaluar(conTokens(css, { '--signo-lado': String(ladoDelSigno(c.libre)), '--titular-interlineado': '1.25' }), {}) * 3 * 1.25 - ladoDelSigno(c.libre)) < 0.01)
afirmar(cuerpoBien(prop('--signo-cuerpo')) && String((GEOMETRIA.estilos.titular as Readonly<Record<string, unknown>>)['--signo-alto']) === 'calc(3em * var(--titular-interlineado))', 'el cuerpo del lugar es el lado sobre tres renglones: el SVG (`--signo-alto`, 3 renglones en em) mide el lado, y el volumen (en em) escala con él')
controlPositivo('  el detector ve un cuerpo que no da el lado en tres renglones', 'calc(var(--signo-lado) / 3)', cuerpoBien)

const GROSOR_EN_LA_CLASE = /--signo-grosor:calc\(var\(--signo-cuerpo\)\*([\d.]+)\)/.exec(CLASES_DEL_SIGNO.lugar)?.[1] ?? ''
const grosorBien = (g: number): boolean => Math.abs(g - 4.5 / 38) < 1e-4 && Math.abs(g / 3.75 - 4.5 / ladoDeAntes(1440)) < 1e-4
afirmar(Number(GROSOR_EN_LA_CLASE) === GROSOR_DEL_SIGNO_EN_CUERPOS && grosorBien(GROSOR_DEL_SIGNO_EN_CUERPOS), 'la raya en cuerpos (4,5 / 38): guarda con el ≠ la proporción que tenía a 1440 (4,5 px en 142,5)', `${GROSOR_EN_LA_CLASE} cuerpos`)
controlPositivo('  el detector ve la raya fija de 4,5 px sobre el ≠ grande de 1440 (en cuerpos de su lugar)', 4.5 / (ladoDelSigno(CASOS[2]?.libre ?? { ancho: 0, alto: 0 }) / 3.75), grosorBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Sólo desde 1024, y sin sumarle alto a la pantalla')

const todasDesde1024 = (clases: readonly string[]): boolean => clases.every((c) => c.split(/\s+/).every((k) => k.startsWith('escritorio:')))
afirmar(todasDesde1024([CLASES_DEL_SIGNO.libre, CLASES_DEL_SIGNO.lugar, GEOMETRIA.reparto.signo]), 'todas las clases nuevas son de escritorio: abajo de 1024 el ≠ es el de siempre (del DOM, tres renglones)')
// La clase del control va partida (el escaneo de Tailwind lee los tests).
controlPositivo('  el detector ve una clase sin la variante', [CLASES_DEL_SIGNO.libre, ['w-', '[var(--signo-lado)]'].join('')], todasDesde1024)

const sinAlto = (libre: string, reparto: string): boolean => libre.includes('escritorio:@container-size') && libre.includes('escritorio:self-stretch') && !reparto.includes('self-center')
afirmar(sinAlto(CLASES_DEL_SIGNO.libre, GEOMETRIA.reparto.signo), 'el Bloque es contenedor de TAMAÑO y llena su fila: no le suma alto (la fila que crece sigue siendo lo que sobra) y el ≠ se mide de ella')
controlPositivo('  el detector ve el Bloque sin contención (el ≠ empujaría la fila)', [CLASES_DEL_SIGNO.libre.replace('escritorio:@container-size ', ''), GEOMETRIA.reparto.signo] as const, ([l, r]: readonly [string, string]) => sinAlto(l, r))

const TRAZO_CSS = leer('_estilos/trazo.css')
const conRespaldo = (css: string): boolean => css.includes('stroke-width: var(--signo-grosor, calc(var(--border-hairline) * 4.5));')
afirmar(conRespaldo(TRAZO_CSS), 'la raya del ≠ lee `--signo-grosor` y, sin él, es la de siempre (el hilo por 4,5)')
controlPositivo('  el detector ve la raya fija', TRAZO_CSS.replace('var(--signo-grosor, calc(var(--border-hairline) * 4.5))', 'calc(var(--border-hairline) * 4.5)'), conRespaldo)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Lo que se renderiza (la rama quieta y la coreografía)')

const renderBien = (html: string): boolean => {
  const lugar = /<div data-pieza="signo-distinto" class="([^"]*)"[^>]*>\s*<svg data-signo="distinto"/.exec(html)
  const libre = /<div [^>]*class="([^"]*escritorio:@container-size[^"]*)" style="([^"]*)"/.exec(html)
  return lugar !== null && (lugar[1] ?? '').includes(CLASES_DEL_SIGNO.lugar.split(' ')[0] ?? '-') && libre !== null && (libre[2] ?? '').includes('--signo-lado:') && (libre[2] ?? '').includes('--signo-libre-ancho:') && (libre[2] ?? '').includes('--signo-alto:')
}
afirmar(renderBien(quieto) && renderBien(conMotion), 'el lugar del ≠ (con su SVG) y su Bloque (contenedor, con las propiedades del espacio libre y las del titular) en las dos ramas')
controlPositivo('  el detector ve el ≠ de antes (sin el lugar nuevo)', quieto.replace('data-pieza="signo-distinto"', 'data-pieza="otro"'), renderBien)

cerrar('s78-c2-30s')
