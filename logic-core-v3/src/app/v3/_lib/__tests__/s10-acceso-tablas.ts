/**
 * LAS TABLAS DEL REPORTE Y EL REGISTRO DE HALLAZGOS.
 *
 * Cuarto archivo del frente, y sale del invariante por la regla de las 300
 * líneas. El corte tiene costura: **el invariante AFIRMA y este archivo
 * IMPRIME.** Una afirmación se lee para saber si algo está bien; una tabla se
 * lee para saber cómo está. Mezclarlas dejaba un archivo donde no se podía
 * encontrar ninguna de las dos cosas.
 *
 * ── El registro de hallazgos, y por qué existe como dato ───────────────────
 *
 * Regla 13 del repo: **se afirma lo propio, se publica lo heredado.** Este
 * frente MIDE y no arregla, así que sus defectos no pueden ir en rojo — un
 * invariante puesto a fallar por algo que su sprint no toca entrena a ignorar
 * el rojo. Pero «publicar» con un `console.log` suelto no deja nada
 * comprobable: el registro los junta como DATO, y el invariante puede afirmar
 * cuántos hay y que los defectos están separados de las decisiones. Así el
 * verde no dice «no encontré nada», dice «encontré exactamente esto».
 */

import type { Landmark, Encabezado, Parada } from './s10-lectura'
import { nodosDe } from './s10-recorrido'
import { esRolDeLandmark, rotuloDeParada, textoAnunciado, type MarcadorAnunciado } from './s10-acceso'
import { AA, AAA, razon, type CajaDeColor } from './s10-acceso-color'

// ── El registro ─────────────────────────────────────────────────────────────

export type Gravedad = 'alta' | 'media' | 'baja'

export interface Publicado {
  readonly n: number
  readonly gravedad: Gravedad
  /** Un encabezado saltado es un **defecto**; que un marcador se lea en voz
   *  alta es una **decisión** de contenido. No se mezclan en el inventario. */
  readonly clase: 'defecto' | 'decisión'
  readonly dueño: string
  readonly que: string
}

const REGISTRO: Publicado[] = []

/** Publica un hallazgo: lo imprime donde corresponde y lo guarda para el conteo. */
export function publicar(p: Publicado): void {
  REGISTRO.push(p)
  console.log(`  ⚠ HALLAZGO ${p.n} [${p.clase} · ${p.gravedad}] ${p.que}`)
  console.log(`               dueño: ${p.dueño}`)
}

export function publicados(): readonly Publicado[] {
  return REGISTRO
}

/** El inventario, de mayor a menor gravedad. Lo imprime el invariante al final. */
export function imprimirInventario(): void {
  for (const g of ['alta', 'media', 'baja'] as const) {
    for (const p of REGISTRO.filter((x) => x.gravedad === g)) {
      console.log(`  ${String(p.n).padStart(2)}. [${g} · ${p.clase}] ${p.que.slice(0, 96)}…`)
    }
  }
}

// ── Las tablas ──────────────────────────────────────────────────────────────

/** El orden de tabulación completo, con la vía por la que se nombró cada parada. */
export function imprimirParadas(html: string, paradas: readonly Parada[]): void {
  console.log('   #   etiqueta  sección          rótulo → destino  [vía del nombre accesible]')
  for (const [i, p] of paradas.entries()) {
    const r = rotuloDeParada(html, p)
    console.log(
      `  ${String(i + 1).padStart(2)}   ${p.etiqueta.padEnd(8)}  ${(p.seccion ?? '(chrome)').padEnd(15)}  ${r.rotulo} → ${p.destino ?? '(sin destino)'}  [${r.via}]`,
    )
  }
}

/** El árbol de encabezados, indentado por nivel y con el texto ANUNCIADO. */
export function imprimirArbol(html: string, arbol: readonly Encabezado[]): void {
  const nodos = nodosDe(html)
  for (const h of arbol) {
    const anunciado = textoAnunciado(html, nodos[h.indice])
    const marca = h.ocultoALectores ? ' ⟨fuera del árbol⟩' : ''
    console.log(`     ${'  '.repeat(h.nivel - 1)}h${h.nivel}  [${(h.seccion ?? '-').padEnd(15)}] ${anunciado}${marca}`)
  }
}

/** Los landmarks reales y, abajo, los descartados CON SU REGLA. */
export function imprimirLandmarks(candidatos: readonly Landmark[]): void {
  console.log('  ── los que SÍ son landmark')
  for (const l of candidatos.filter((c) => esRolDeLandmark(c.rol))) {
    console.log(`     <${l.etiqueta}> → ${l.rol}  «${l.rotulo ?? '(sin nombre accesible)'}»`)
  }
  console.log('  ── los descartados, con la regla que los descarta')
  for (const l of candidatos.filter((c) => !esRolDeLandmark(c.rol))) {
    const porQue = l.porQueNo ?? `su rol es "${l.rol}", que no es uno de los ocho roles de landmark de ARIA`
    console.log(`     <${l.etiqueta}>${l.rol === null ? '' : ` role="${l.rol}"`} → ${porQue}`)
  }
}

/** Los marcadores: cuántos, cuáles, en qué sección, y CÓMO SUENAN. */
export function imprimirMarcadores(marcas: readonly MarcadorAnunciado[]): void {
  const cuenta = new Map<string, number>()
  for (const m of marcas) cuenta.set(m.marcador, (cuenta.get(m.marcador) ?? 0) + 1)
  for (const [marcador, veces] of [...cuenta].sort()) console.log(`  ${String(veces).padStart(2)}×  ${marcador}`)

  const porSeccion = new Map<string, number>()
  for (const m of marcas) porSeccion.set(m.seccion ?? '(chrome)', (porSeccion.get(m.seccion ?? '(chrome)') ?? 0) + 1)
  console.log('  por sección:', [...porSeccion].map(([s, n]) => `${s}=${n}`).join(' · '))

  console.log('  ── así suena el recorrido, frase por frase:')
  for (const frase of new Set(marcas.filter((m) => m.contexto.length < 130).map((m) => m.contexto))) {
    console.log(`     «${frase}»`)
  }
}

/** El contraste, una fila por sección × nivel × tinta, con el PEOR caso de cada una. */
export function imprimirContraste(cajas: readonly CajaDeColor[]): void {
  const peor = new Map<string, CajaDeColor>()
  for (const c of cajas) {
    if (c.razon === null) continue
    const clave = `${c.seccion}|${c.nivel}|${c.tinta.token}${c.tinta.alfa < 1 ? `@${c.tinta.alfa}` : ''}`
    const guardado = peor.get(clave)
    if (guardado === undefined || c.razon < (guardado.razon ?? Number.POSITIVE_INFINITY)) peor.set(clave, c)
  }
  console.log('  sección          superficie      nivel        tinta                     pintado→fondo     razón   veredicto  elemento')
  for (const [clave, c] of [...peor].sort()) {
    const r = c.razon ?? 0
    const v = r >= AAA ? 'AA + AAA' : r >= AA ? 'AA      ' : '❌ NI AA '
    const tinta = c.tinta.token + (c.tinta.alfa < 1 ? ` @${c.tinta.alfa}` : '')
    console.log(
      `  ${clave.split('|')[0].padEnd(16)} ${c.modo.padEnd(15)} ${c.nivel.padEnd(12)} ${tinta.padEnd(25)} ${c.pintado}→${c.fondo}  ${r.toFixed(2).padStart(5)}   ${v}  <${c.etiqueta}> «${c.texto}»`,
    )
  }
}

// ── El anillo de foco, parada por parada ────────────────────────────────────

export interface CaidaDelAnillo {
  /** Qué paradas del orden de tabulación caen acá. */
  readonly paradas: string
  readonly donde: string
  readonly anillo: string
  /** El fondo sobre el que cae, o `null` cuando es la ESCENA y no un token. */
  readonly sobre: string | null
}

/** El anillo sobre cada superficie, con su razón. `null` = lo mide otro instrumento. */
export function imprimirAnillos(caidas: readonly CaidaDelAnillo[]): void {
  for (const a of caidas) {
    const r = a.sobre === null ? null : razon(a.anillo, a.sobre)
    console.log(
      `  paradas ${a.paradas.padEnd(6)} ${a.donde}\n              anillo ${a.anillo} sobre ${a.sobre ?? 'LA ESCENA'} → ${r === null ? 'no se mide acá: la escena no es un token' : `${r.toFixed(2)}:1`}`,
    )
  }
}

/** Las caídas que NO llegan a 3:1, que es el mínimo de un componente de interfaz. */
export function anillosFlojos(caidas: readonly CaidaDelAnillo[]): string[] {
  return caidas.filter((a) => a.sobre !== null && razon(a.anillo, a.sobre) < 3).map((a) => a.donde)
}
