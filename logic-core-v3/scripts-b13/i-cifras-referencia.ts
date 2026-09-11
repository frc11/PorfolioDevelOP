/**
 * I · LAS CIFRAS DE LA REFERENCIA — derivadas de la navegación que YA se pagó.
 *
 *     npx tsx scripts-b13/i-cifras-referencia.ts
 *
 * ── ⚠️ Por qué NO hay una segunda navegación ──────────────────────────────
 *
 * La regla del repo es **una navegación, una medición**, y §1 de B13 ya gastó la
 * suya. Pero la sección de cifras de la referencia **ya estaba medida**: B11
 * recorrió nk.studio a 1920 en 44 paradas y guardó, bloque por bloque, el texto,
 * el tamaño en píxeles, la caja y la opacidad (`outputs/b11/referencia-nk-1920.json`).
 * Todo lo que §3.1 pregunta —qué tamaños usa, dónde pone el rótulo, si entran
 * juntas o de a una, cómo se relacionan con su objeto— sale de ese JSON. **No se
 * abre el navegador: se lee lo que ya se midió.**
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 *
 *   · **Qué tamaños usa** y cuánto varían entre la mayor y la menor.
 *   · **Dónde pone el rótulo** respecto de la cifra, y con qué peso.
 *   · **Si entran juntas o de a una**: comparando la lista de cifras presentes
 *     entre dos paradas consecutivas de media pantalla.
 *   · **Cómo se relacionan con su objeto**: la caja del objeto contra la caja de
 *     las cifras, y la fracción de sus GLIFOS que cae sobre la silueta.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { escribirJson, red } from './b13-comun'

interface BloqueLeido {
  readonly etiqueta: string
  readonly texto: string
  readonly tamanoPx: number
  readonly opacidad: number
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly pixelesDeGlifo: number
  readonly sobreElObjeto: number
}
interface Parada {
  readonly pantalla: number
  readonly objeto: { readonly caja: readonly number[]; readonly fraccionDelCuadro: number }
  readonly bloques: readonly BloqueLeido[]
}

/** Un bloque es una CIFRA si su texto es sólo dígitos (con un `%` o un signo). */
const esCifra = (t: string): boolean => /^[0-9]{1,4}\s*[%+\-–—.,]*$/.test(t.trim()) && /[0-9]/.test(t)

function principal(): void {
  const crudo = JSON.parse(
    readFileSync(path.join(process.cwd(), 'docs/rediseno/outputs/b11/referencia-nk-1920.json'), 'utf8'),
  ) as { readonly paradas: readonly Parada[] }

  // La parada de la sección de cifras: la que tiene MÁS cifras grandes juntas.
  const conCifras = crudo.paradas
    .map((p) => ({ parada: p, cifras: p.bloques.filter((b) => esCifra(b.texto) && b.tamanoPx >= 24) }))
    .filter((x) => x.cifras.length > 0)
    .sort((a, b) => b.cifras.length - a.cifras.length)
  if (conCifras.length === 0) throw new Error('la referencia medida no tiene una sección de cifras')

  const mejor = conCifras[0]
  const p = mejor.parada
  const cifras = [...mejor.cifras].sort((a, b) => a.y - b.y || a.x - b.x)
  const tamanos = [...new Set(cifras.map((c) => c.tamanoPx))].sort((a, b) => a - b)

  console.log(`LA SECCIÓN DE CIFRAS de la referencia: pantalla ${p.pantalla} · ${cifras.length} cifras`)
  console.log('  cifra      tamaño     x      y   ancho  alto')
  for (const c of cifras) {
    console.log(`  ${c.texto.trim().padEnd(8)} ${String(c.tamanoPx).padStart(5)}px ${Math.round(c.x).toString().padStart(6)} ${Math.round(c.y).toString().padStart(6)} ${Math.round(c.ancho).toString().padStart(6)} ${Math.round(c.alto).toString().padStart(5)}`)
  }

  // ── Los tamaños ──────────────────────────────────────────────────────────
  console.log(`\n  TAMAÑOS de las cifras: ${tamanos.map((t) => `${t}px`).join(' · ')} — ${tamanos.length === 1 ? '⚠️ UNO SOLO' : `${tamanos.length} distintos, razón ${red(tamanos[tamanos.length - 1] / tamanos[0], 2)}:1`}`)

  // ── El rótulo: el bloque chico más cercano por debajo de cada cifra ──────
  const chicos = p.bloques.filter((b) => !esCifra(b.texto) && b.tamanoPx < Math.min(...tamanos))
  const rotulos = cifras.map((c) => {
    const candidatos = chicos
      .filter((b) => b.y > c.y && b.y - (c.y + c.alto) < 120 && Math.abs(b.x - c.x) < 160)
      .sort((a, b) => a.y - b.y)
    const r = candidatos[0]
    return r === undefined
      ? null
      : {
          cifra: c.texto.trim(),
          rotulo: r.texto.trim().slice(0, 44),
          tamanoPx: r.tamanoPx,
          razon: red(c.tamanoPx / r.tamanoPx, 2),
          desfaseY: red(r.y - (c.y + c.alto), 1),
          desfaseX: red(r.x - c.x, 1),
        }
  })
  console.log('\n  EL RÓTULO, respecto de su cifra:')
  for (const r of rotulos) {
    if (r === null) continue
    console.log(`    ${r.cifra.padEnd(6)} → «${r.rotulo}» · ${r.tamanoPx}px (razón ${r.razon}:1) · ${r.desfaseY} px DEBAJO · ${r.desfaseX >= 0 ? '+' : ''}${r.desfaseX} px en x`)
  }

  // ── La amplitud y el escalonado ──────────────────────────────────────────
  const x0 = Math.min(...cifras.map((c) => c.x))
  const x1 = Math.max(...cifras.map((c) => c.x + c.ancho))
  const columnas = [...new Set(cifras.map((c) => Math.round(c.x / 8) * 8))].sort((a, b) => a - b)
  const filas = [...new Set(cifras.map((c) => Math.round(c.y / 120)))].sort((a, b) => a - b)
  const escalonado = filas.map((f) => {
    const enLaFila = cifras.filter((c) => Math.round(c.y / 120) === f).map((c) => c.y)
    return red(Math.max(...enLaFila) - Math.min(...enLaFila), 1)
  })
  console.log(
    `\n  LA DISPERSIÓN: ${columnas.length} columnas × ${filas.length} filas · amplitud ${red(x1 - x0, 1)} px de 1920 (${red((100 * (x1 - x0)) / 1920, 1)} % del ancho)\n` +
      `    escalonado vertical DENTRO de cada fila: ${escalonado.map((e) => `${e} px`).join(' · ')}`,
  )

  // ── Contra su objeto ─────────────────────────────────────────────────────
  const glifos = cifras.reduce((n, c) => n + c.pixelesDeGlifo, 0)
  const sobre = cifras.reduce((n, c) => n + c.pixelesDeGlifo * c.sobreElObjeto, 0)
  const caja = p.objeto.caja
  const cruzaCaja = caja.length === 4 && x0 < caja[2] && x1 > caja[0]
  console.log(
    `\n  CONTRA SU OBJETO: caja [${caja.map((v) => Math.round(v)).join(', ')}] (${red(100 * p.objeto.fraccionDelCuadro, 2)} % del cuadro)\n` +
      `    las cifras ${cruzaCaja ? 'CRUZAN' : 'esquivan'} su caja · de sus glifos, ${red((100 * sobre) / Math.max(1, glifos), 2)} % cae sobre la SILUETA`,
  )

  // ── ¿Entran juntas o de a una? ───────────────────────────────────────────
  const vecinas = crudo.paradas
    .filter((q) => Math.abs(q.pantalla - p.pantalla) <= 1)
    .map((q) => ({ pantalla: q.pantalla, cifras: q.bloques.filter((b) => esCifra(b.texto) && b.tamanoPx >= 24).map((b) => b.texto.trim()).sort() }))
  console.log('\n  ¿ENTRAN JUNTAS O DE A UNA? (las paradas vecinas, media pantalla de paso)')
  for (const v of vecinas) console.log(`    pantalla ${String(v.pantalla).padStart(4)}: ${v.cifras.length} · ${v.cifras.join(' ')}`)

  console.log(
    `\nescrito: ${escribirJson('cifras-referencia', {
      fuente: 'docs/rediseno/outputs/b11/referencia-nk-1920.json (la navegación de B11)',
      pantalla: p.pantalla,
      cifras,
      tamanos,
      rotulos,
      amplitudPx: red(x1 - x0, 1),
      columnas: columnas.length,
      filas: filas.length,
      escalonado,
      objeto: p.objeto,
      glifosSobreLaSilueta: red((100 * sobre) / Math.max(1, glifos), 2),
      vecinas,
    })}`,
  )
}

principal()
