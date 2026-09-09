/**
 * B9 · §2 — LA REGLA, DERIVADA SOBRE LA GEOMETRÍA MEDIDA, ANTES DE TOCAR CÓDIGO.
 *
 * ── Por qué este paso existe ──────────────────────────────────────────────
 *
 * Porque una regla que se aplica a 19 instancias tiene bordes, y los bordes se
 * buscan ANTES y no después de escribir el cambio. Este script no abre un
 * navegador: consume las cajas que `b9-desfases.ts` ya midió —`topDeFlujo`,
 * `altoDeFlujo`, la ventana y el alto del documento— y calcula, con la fórmula
 * de `posicionDeAncla`, dónde caería cada instancia bajo la regla.
 *
 * Los tres bordes que busca, y que ninguna tabla de «antes» muestra:
 *
 *   1. **El punto de llegada que cae después del último píxel de scroll.** Un
 *      bloque de la última pantalla puede tener su llegada fuera del documento:
 *      la regla sería inalcanzable y la pieza no llegaría nunca a su estado
 *      final. Se marca `INALCANZABLE`.
 *   2. **El rango que degenera.** `rangoDeScroll` acota a 1 px y el patrón se
 *      lee como un salto.
 *   3. **La fusión de acontecimientos.** Dos llegadas separadas por 240 px o
 *      menos el censo de B2 las cuenta como una. Se publica la distancia entre
 *      llegadas consecutivas ANTES y DESPUÉS, que es el aviso temprano del gate.
 *
 * Corre con: `npx tsx scripts-b9/b9-derivar.ts`
 */

import { readFileSync } from 'node:fs'

import { posicionDeAncla, rangoDeScroll, type ParDeAnclas } from '../src/app/v3/_lib/motion/anclas'
import { dos, tres } from './b9-comun'

/** La regla: `top bottom-=80px` → `bottom bottom-=240px`. Es el ancla de P1. */
const ENTRADA_PX = 80
const DESCANSO_PX = 240
const REGLA: ParDeAnclas = {
  inicio: { declarado: 'top bottom-=80px', elemento: { fraccion: 0, px: 0 }, viewport: { fraccion: 1, px: -ENTRADA_PX } },
  fin: { declarado: 'bottom bottom-=240px', elemento: { fraccion: 1, px: 0 }, viewport: { fraccion: 1, px: -DESCANSO_PX } },
}

interface Instancia {
  readonly bloque: {
    readonly seccion: string | null
    readonly ordinal: number
    readonly anclaje: string | null
    readonly topDeFlujo: number
    readonly altoDeFlujo: number
  }
  readonly empiezaAMoverse: number | null
  readonly terminaDeMoverse: number | null
  readonly entraEnCuadro: number | null
  readonly saleDeCuadro: number | null
  readonly cuadroAlTerminar: { readonly top: number; readonly fondo: number } | null
}

/** Las que NO reciben la regla, con el motivo. Es un padrón, no una omisión. */
const EXCLUIDAS: Readonly<Record<string, string>> = {
  'hero#0': 'su rango cierra en scrollY negativo — declarado como aritmética en Hero.tsx:64-71',
  'hero#1': 'ídem',
  'trabajos#0': 'ZONA PROHIBIDA — diferido como D-B9.T1',
  'trabajos#1': 'ZONA PROHIBIDA',
  'servicios#0': 'el pin: su ancla es ANCLA_DEL_PIN y es correcta por construcción',
}

function main(): void {
  for (const perfil of ['1920', '1440']) {
    const j = JSON.parse(
      readFileSync(`docs/rediseno/outputs/b9/desfases-${perfil}-antes.json`, 'utf8'),
    ) as {
      ventana: number
      alturaDelDocumento: number
      instancias: readonly Instancia[]
    }
    const V = j.ventana
    const ultimoScroll = j.alturaDelDocumento - V

    console.log('')
    console.log(`═══ ${perfil} · ventana ${V} · documento ${j.alturaDelDocumento} · último píxel de scroll ${ultimoScroll}`)
    console.log('')
    console.log(
      ['instancia'.padEnd(20), 'hoy llega', 'regla llega', 'Δ', 'fondo hoy', 'fondo regla', 'rango', 'estado'].join(' | '),
    )

    const llegadasAntes: { id: string; y: number }[] = []
    const llegadasDespues: { id: string; y: number }[] = []

    for (const i of j.instancias) {
      const id = `${i.bloque.seccion ?? '?'}#${i.bloque.ordinal}`
      const caja = { topDoc: i.bloque.topDeFlujo, alto: i.bloque.altoDeFlujo }
      const motivo = EXCLUIDAS[id]

      const inicio = posicionDeAncla(REGLA.inicio, caja, V)
      const fin = posicionDeAncla(REGLA.fin, caja, V)
      const r = rangoDeScroll(REGLA, caja, V)
      const fondoRegla = tres((caja.topDoc + caja.alto - fin) / V)

      if (i.terminaDeMoverse !== null) llegadasAntes.push({ id, y: i.terminaDeMoverse })
      llegadasDespues.push({ id, y: motivo === undefined ? fin : (i.terminaDeMoverse ?? fin) })

      const estados: string[] = []
      if (motivo !== undefined) estados.push(`EXCLUIDA (${motivo})`)
      else {
        if (fin > ultimoScroll) estados.push(`⚠️ INALCANZABLE: llega ${dos(fin - ultimoScroll)} px después del último píxel de scroll`)
        if (r.fin - r.inicio <= 1) estados.push('⚠️ RANGO DEGENERADO')
        if (estados.length === 0) estados.push('ok')
      }

      console.log(
        [
          id.padEnd(20),
          String(i.terminaDeMoverse).padStart(9),
          String(dos(fin)).padStart(11),
          String(i.terminaDeMoverse === null ? '-' : dos(fin - i.terminaDeMoverse)).padStart(7),
          String(i.cuadroAlTerminar?.fondo ?? '-').padStart(9),
          String(fondoRegla).padStart(11),
          String(dos(r.fin - r.inicio)).padStart(6),
          estados.join(' · '),
        ].join(' | '),
      )
      void inicio
    }

    for (const [nombre, lista] of [
      ['ANTES', llegadasAntes],
      ['REGLA', llegadasDespues],
    ] as const) {
      const orden = [...lista].sort((a, b) => a.y - b.y)
      const juntas: string[] = []
      for (let k = 1; k < orden.length; k += 1) {
        const d = orden[k].y - orden[k - 1].y
        if (d <= 240) juntas.push(`${orden[k - 1].id}→${orden[k].id} ${dos(d)}px`)
      }
      console.log(
        `  ${nombre}: llegadas a ≤240 px (el censo las funde): ${juntas.length === 0 ? 'ninguna' : juntas.join(' · ')}`,
      )
    }
  }
}

main()
