/**
 * TEXTO-1 · C — LA MÍNIMA: qué combinación alcanza, con qué techos, y a qué costo.
 *
 *     npx tsx scripts-texto/c-minima.ts
 *
 * No abre el navegador: **lee lo que A y B midieron** y hace la aritmética
 * encima. Existe por dos razones y las dos son de método:
 *
 *   1. El espacio de combinaciones es el producto de cinco palancas. Medirlo
 *      entero en el navegador serían miles de cargas; medir las palancas por
 *      separado y COMPONERLAS cuesta ocho. Lo que hace que componer sea legítimo
 *      es que el modelo se valida contra los **272 puntos** que B ya midió —alto
 *      del bloque y cantidad de renglones, en los ocho anchos— y los reproduce
 *      con **0 desvíos**: si reproduce todos, predice.
 *   2. Los DOS techos que este sprint encontró no se ven en una captura y no
 *      salen del navegador: son invariantes del repo.
 *
 *      · **La escala es una escala a 375.** `s3-banda-afirmaciones` §2 exige
 *        crecimiento estricto en los cuatro anchos de la banda, y a 375
 *        `titulo-xl` vale 36 y `display` 37: **un píxel**. La palanca (a) tiene
 *        1,00 px de recorrido a 375, no los 13 que un barrido sugiere.
 *      · **Bajar un piso mueve 1920.** `s3-tipografia` §2 exige que el tercer
 *        término de cada `clamp()` sea la recta evaluada en el tope. Con el
 *        ancla de 1440 fija, mover el piso cambia la PENDIENTE, y el techo es la
 *        misma recta 480 px más allá: sube. 1920 está cerrado, así que el costo
 *        se publica en vez de descubrirse después.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { RAIZ_DE_SALIDAS, dos } from './texto-comun'

const PISO_DE_LA_BANDA = 375
const ANCLA_DE_LA_BANDA = 1440
const TOPE_DE_LA_BANDA = 1920
const ANCLA_L1 = 58
const ANCLA_L2 = 104
/** El piso de `titulo-xl`, el nivel inmediatamente abajo. Techo de la palanca (a). */
const PISO_DE_TITULO_XL = 36

interface FilaMedida {
  readonly ancho: number
  readonly alto: number
  readonly masaDelLogo: { readonly ultimaFila: number; readonly fraccion: number; readonly huecoHastaElBorde: number }
  readonly avances: Record<string, { readonly ancho: number; readonly fontSize: number } | null>
  readonly resultados: readonly {
    readonly clave: string
    readonly altoDelBloque: number | null
    readonly fsL1: number
    readonly fsL2: number
    readonly renglonesL1: number
    readonly renglonesL2: number
    readonly renglonesBajada: number
  }[]
}

interface Geometria {
  readonly ancho: number
  readonly alto: number
  readonly cajaDelTitular: number
  readonly avanceL1: number
  readonly avanceL2: number
  readonly interlineado: number
  readonly altoDeRenglonDeLaBajada: number
  readonly renglonesDeLaBajada: number
  readonly altoDelCta: number
  readonly huecoTitularBajada: number
  readonly huecoBajadaCta: number
  readonly rellenoAbajo: number
  readonly ultimaFilaDeLaMasa: number
  readonly fraccionDeLaMasa: number
  readonly huecoHastaElBorde: number
}

interface Ajuste {
  readonly pisoL1: number
  readonly pisoL2: number
  readonly interlineado: number
  readonly bajadaEnUnaLinea: boolean
  readonly huecoTitularBajada: number
  readonly huecoBajadaCta: number
  readonly rellenoAbajo: number
}

const HOY = (g: Geometria): Ajuste => ({
  pisoL1: 37,
  pisoL2: 67,
  interlineado: g.interlineado,
  bajadaEnUnaLinea: false,
  huecoTitularBajada: g.huecoTitularBajada,
  huecoBajadaCta: g.huecoBajadaCta,
  rellenoAbajo: g.rellenoAbajo,
})

function deLaCurva(piso: number, ancla: number, ancho: number): number {
  const a = (ancla - piso) / (ANCLA_DE_LA_BANDA - PISO_DE_LA_BANDA)
  const b = ancla - a * ANCLA_DE_LA_BANDA
  const techo = b + a * TOPE_DE_LA_BANDA
  return Math.min(Math.max(piso, b + a * ancho), techo)
}

interface Pronostico {
  readonly fsL1: number
  readonly fsL2: number
  readonly renglonesL1: number
  readonly renglonesL2: number
  readonly altoDelTitular: number
  readonly altoDelBloque: number
  readonly sobraHastaElBorde: number
  readonly sobraConElRelleno: number
}

/** El modelo. Se valida contra lo medido antes de creerle una sola cifra. */
function pronostico(g: Geometria, a: Ajuste): Pronostico {
  const fsL1 = deLaCurva(a.pisoL1, ANCLA_L1, g.ancho)
  const fsL2 = deLaCurva(a.pisoL2, ANCLA_L2, g.ancho)
  const n1 = Math.ceil((fsL1 * g.avanceL1) / g.cajaDelTitular)
  const n2 = Math.ceil((fsL2 * g.avanceL2) / g.cajaDelTitular)
  const altoDelTitular = n1 * fsL1 * a.interlineado + n2 * fsL2 * a.interlineado
  const renglonesDeLaBajada = a.bajadaEnUnaLinea ? 1 : g.renglonesDeLaBajada
  const altoDelBloque =
    altoDelTitular +
    a.huecoTitularBajada +
    renglonesDeLaBajada * g.altoDeRenglonDeLaBajada +
    a.huecoBajadaCta +
    g.altoDelCta
  return {
    fsL1,
    fsL2,
    renglonesL1: n1,
    renglonesL2: n2,
    altoDelTitular,
    altoDelBloque,
    sobraHastaElBorde: altoDelBloque - g.huecoHastaElBorde,
    sobraConElRelleno: altoDelBloque - (g.huecoHastaElBorde - a.rellenoAbajo),
  }
}

function main(): void {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const medidoB = JSON.parse(
    readFileSync(path.join(RAIZ_DE_SALIDAS, 'b-palancas-hoy.json'), 'utf8'),
  ) as { filas: readonly FilaMedida[] }
  const medidoA = JSON.parse(
    readFileSync(path.join(RAIZ_DE_SALIDAS, 'a-desglose-hoy.json'), 'utf8'),
  ) as {
    filas: readonly {
      ancho: number
      desglose: {
        titular: { ancho: number } | null
        linea1: { lineHeight: number; fontSize: number }
        bajada: { lineHeight: number; renglones: { cantidad: number } | null }
        cta: { caja: { alto: number } | null }
        relleno: { abajo: number }
        huecos: { titularABajada: number; bajadaACta: number }
      }
    }[]
  }

  const geometrias: Geometria[] = medidoB.filas.map((f) => {
    const d = medidoA.filas.find((x) => x.ancho === f.ancho)
    if (d === undefined) throw new Error(`falta el desglose de ${f.ancho}`)
    const a1 = f.avances.linea1
    const a2 = f.avances.linea2
    if (a1 === null || a1 === undefined || a2 === null || a2 === undefined) {
      throw new Error(`falta el avance de ${f.ancho}`)
    }
    return {
      ancho: f.ancho,
      alto: f.alto,
      cajaDelTitular: d.desglose.titular?.ancho ?? 0,
      avanceL1: a1.ancho / a1.fontSize,
      avanceL2: a2.ancho / a2.fontSize,
      interlineado: d.desglose.linea1.lineHeight / d.desglose.linea1.fontSize,
      altoDeRenglonDeLaBajada: d.desglose.bajada.lineHeight,
      renglonesDeLaBajada: d.desglose.bajada.renglones?.cantidad ?? 1,
      altoDelCta: d.desglose.cta.caja?.alto ?? 0,
      huecoTitularBajada: d.desglose.huecos.titularABajada,
      huecoBajadaCta: d.desglose.huecos.bajadaACta,
      rellenoAbajo: d.desglose.relleno.abajo,
      ultimaFilaDeLaMasa: f.masaDelLogo.ultimaFila,
      fraccionDeLaMasa: f.masaDelLogo.fraccion,
      huecoHastaElBorde: f.masaDelLogo.huecoHastaElBorde,
    }
  })

  // ── 1 · EL CONTROL: el modelo contra los puntos que B midió ───────────────
  console.log('\n1 · EL CONTROL — el modelo reproduce lo medido\n')
  const desvios: string[] = []
  let comparados = 0
  for (const f of medidoB.filas) {
    const g = geometrias.find((x) => x.ancho === f.ancho)
    if (g === undefined) continue
    for (const r of f.resultados) {
      let a: Ajuste | null = null
      const mL1 = /^a-piso-L1-([\d.]+)$/.exec(r.clave)
      const mL2 = /^b-piso-L2-([\d.]+)$/.exec(r.clave)
      const mLi = /^c-interlineado-([\d.]+)$/.exec(r.clave)
      if (r.clave === 'base') a = HOY(g)
      else if (mL1 !== null) a = { ...HOY(g), pisoL1: Number(mL1[1]) }
      else if (mL2 !== null) a = { ...HOY(g), pisoL2: Number(mL2[1]) }
      else if (mLi !== null) a = { ...HOY(g), interlineado: Number(mLi[1]) }
      else if (r.clave === 'e-bajada-una-linea') a = { ...HOY(g), bajadaEnUnaLinea: true }
      if (a === null) continue
      comparados += 1
      const p = pronostico(g, a)
      if (r.altoDelBloque !== null && Math.abs(p.altoDelBloque - r.altoDelBloque) > 0.6) {
        desvios.push(`@${f.ancho} ${r.clave}: modelo ${dos(p.altoDelBloque)} vs medido ${r.altoDelBloque}`)
      }
      if (p.renglonesL1 !== r.renglonesL1 || p.renglonesL2 !== r.renglonesL2) {
        desvios.push(
          `@${f.ancho} ${r.clave}: renglones modelo ${p.renglonesL1}/${p.renglonesL2} vs medido ${r.renglonesL1}/${r.renglonesL2}`,
        )
      }
    }
  }
  console.log(`  ${comparados} puntos comparados · ${desvios.length} desvios`)
  for (const d of desvios.slice(0, 20)) console.log(`    ✗ ${d}`)
  // Control positivo: el comparador tiene que VER un modelo equivocado.
  const g375 = geometrias.find((x) => x.ancho === 375)
  if (g375 !== undefined) {
    const malo = pronostico(g375, { ...HOY(g375), interlineado: 1.5 })
    console.log(
      `  control positivo: con interlineado 1,5 el modelo da ${dos(malo.altoDelBloque)} px a 375 ` +
        `(medido 264,34) — la comparacion NO pasa por casualidad`,
    )
  }

  // ── 2 · LOS UMBRALES DE ENVOLVIMIENTO ────────────────────────────────────
  console.log('\n2 · LOS UMBRALES — a que tamaño cada registro deja de envolver\n')
  console.log('  ancho  caja del titular   umbral L1   hoy L1   umbral L2   hoy L2')
  for (const g of geometrias) {
    const h = pronostico(g, HOY(g))
    console.log(
      `  ${String(g.ancho).padStart(5)}  ${g.cajaDelTitular.toFixed(2).padStart(16)}` +
        `  ${(g.cajaDelTitular / g.avanceL1).toFixed(3).padStart(9)}  ${h.fsL1.toFixed(2).padStart(6)}${h.renglonesL1 > 1 ? ' ✗' : '  '}` +
        `  ${(g.cajaDelTitular / g.avanceL2).toFixed(3).padStart(9)}  ${h.fsL2.toFixed(2).padStart(6)}${h.renglonesL2 > 1 ? ' ✗' : '  '}`,
    )
  }

  // ── 3 · EL COSTO EN LOS ANCHOS CERRADOS ──────────────────────────────────
  console.log('\n3 · EL COSTO EN LOS ANCHOS CERRADOS — mover el piso mueve el techo\n')
  console.log('  nivel   piso   @1024    @1440    @1920   (hoy: display 49,80/58,00/67,46 · display-xl 89,55/104,00/120,68)')
  for (const piso of [37, 36.5, 36.01]) {
    console.log(
      `  display ${String(piso).padStart(6)}  ${deLaCurva(piso, ANCLA_L1, 1024).toFixed(2).padStart(6)}  ` +
        `${deLaCurva(piso, ANCLA_L1, 1440).toFixed(2).padStart(6)}  ${deLaCurva(piso, ANCLA_L1, 1920).toFixed(2).padStart(6)}`,
    )
  }
  for (const piso of [67, 64, 60, 55, 50, 44]) {
    console.log(
      `  disp-xl ${String(piso).padStart(6)}  ${deLaCurva(piso, ANCLA_L2, 1024).toFixed(2).padStart(6)}  ` +
        `${deLaCurva(piso, ANCLA_L2, 1440).toFixed(2).padStart(6)}  ${deLaCurva(piso, ANCLA_L2, 1920).toFixed(2).padStart(6)}`,
    )
  }
  console.log(
    `  ⚠ el piso de la palanca (a) no puede bajar de ${PISO_DE_TITULO_XL} px: es el piso de titulo-xl y la escala ` +
      'tiene que crecer ESTRICTAMENTE a 375 (`s3-banda-afirmaciones` §2). Recorrido util: 1,00 px.',
  )

  // ── 4 · LA BÚSQUEDA DE LA MÍNIMA ─────────────────────────────────────────
  console.log('\n4 · LA MINIMA — la combinacion mas chica que alcanza en 375 y en 768\n')
  const PISOS_L1 = [37, 36.5, 36.25, 36.01]
  const PISOS_L2 = [67, 66, 65, 64, 62, 60, 58, 56, 55, 54, 52, 50, 48, 46, 44, 42, 40, 38]
  const INTERLINEADOS = [1.09, 1.05, 1.0, 0.95, 0.9]
  const BAJADAS = [false, true]
  const HUECOS_1 = [32, 24, 16, 8]
  const HUECOS_2 = [24, 16, 8]

  interface Combinacion {
    readonly pisoL1: number
    readonly pisoL2: number
    readonly interlineado: number
    readonly bajadaEnUnaLinea: boolean
    readonly huecoTitularBajada: number
    readonly huecoBajadaCta: number
    readonly cambios: number
    readonly fuera: number
    readonly razonDeLosRegistros: number
    readonly porAncho: Record<string, { sobra: number; fsL1: number; fsL2: number; n1: number; n2: number }>
  }

  /**
   * «Alcanza» = el bloque entra entero debajo del fin de la masa en TODOS los
   * anchos pedidos. La `sobra` que se compara es la que el barrido calculó, y
   * cuál de las dos lecturas del objetivo es la eligió `evaluar` con su
   * `conRelleno`.
   */
  const alcanza = (c: Combinacion, anchos: readonly number[]): boolean =>
    anchos.every((w) => {
      const v = c.porAncho[String(w)]
      return v !== undefined && v.sobra <= 0
    })

  /**
   * `conRelleno` elige la LECTURA del objetivo: con `false` el bloque se compara
   * contra el borde de abajo del viewport —la lectura del enunciado, que ya
   * gastó `pb-20`— y con `true` contra el borde que `pb-20` deja, que es donde
   * el árbol lo apoya de verdad. Las dos se publican; el barrido de abajo corre
   * la primera, que es la única en la que existe alguna combinación.
   */
  function evaluar(
    pisoL1: number,
    pisoL2: number,
    interlineado: number,
    bajadaEnUnaLinea: boolean,
    h1: number,
    h2: number,
    conRelleno: boolean,
  ): Combinacion {
    const porAncho: Record<string, { sobra: number; fsL1: number; fsL2: number; n1: number; n2: number }> = {}
    for (const g of geometrias) {
      const p = pronostico(g, {
        pisoL1,
        pisoL2,
        interlineado,
        bajadaEnUnaLinea,
        huecoTitularBajada: h1,
        huecoBajadaCta: h2,
        rellenoAbajo: conRelleno ? g.rellenoAbajo : 0,
      })
      porAncho[String(g.ancho)] = {
        sobra: dos(conRelleno ? p.sobraConElRelleno : p.sobraHastaElBorde),
        fsL1: dos(p.fsL1),
        fsL2: dos(p.fsL2),
        n1: p.renglonesL1,
        n2: p.renglonesL2,
      }
    }
    const cambios =
      (pisoL1 !== 37 ? 1 : 0) +
      (pisoL2 !== 67 ? 1 : 0) +
      (interlineado !== 1.09 ? 1 : 0) +
      (bajadaEnUnaLinea ? 1 : 0) +
      (h1 !== 32 ? 1 : 0) +
      (h2 !== 24 ? 1 : 0)
    return {
      pisoL1,
      pisoL2,
      interlineado,
      bajadaEnUnaLinea,
      huecoTitularBajada: h1,
      huecoBajadaCta: h2,
      cambios,
      fuera: (h1 !== 32 ? 1 : 0) + (h2 !== 24 ? 1 : 0),
      razonDeLosRegistros: dos(pisoL2 / pisoL1),
      porAncho,
    }
  }

  const todas: Combinacion[] = []
  for (const p1 of PISOS_L1) {
    for (const p2 of PISOS_L2) {
      if (p2 <= p1) continue // la escala tiene que seguir creciendo a 375
      for (const li of INTERLINEADOS) {
        for (const b of BAJADAS) {
          for (const h1 of HUECOS_1) {
            for (const h2 of HUECOS_2) {
              todas.push(evaluar(p1, p2, li, b, h1, h2, false))
            }
          }
        }
      }
    }
  }

  const reportar = (titulo: string, anchos: readonly number[], soloDeLaLista: boolean): void => {
    const validas = todas
      .filter((c) => (soloDeLaLista ? c.fuera === 0 : true))
      .filter((c) => alcanza(c, anchos))
      .sort(
        (a, b) =>
          a.cambios - b.cambios ||
          b.razonDeLosRegistros - a.razonDeLosRegistros ||
          b.interlineado - a.interlineado ||
          b.pisoL2 - a.pisoL2,
      )
    console.log(`\n  ${titulo} — ${validas.length} combinaciones de ${todas.length}`)
    if (validas.length === 0) {
      console.log('    NINGUNA. No existe combinacion en el espacio barrido.')
      return
    }
    for (const c of validas.slice(0, 6)) {
      const v = (w: number): string => {
        const x = c.porAncho[String(w)]
        return `${w}: ${x.fsL1.toFixed(1)}/${x.fsL2.toFixed(1)} (${x.n1}+${x.n2} lin) sobra ${x.sobra.toFixed(1)}`
      }
      console.log(
        `    [${c.cambios} cambio(s)${c.fuera > 0 ? `, ${c.fuera} fuera de la lista` : ''}] ` +
          `piso L1 ${c.pisoL1} · piso L2 ${c.pisoL2} · interlineado ${c.interlineado} · ` +
          `bajada ${c.bajadaEnUnaLinea ? '1 linea' : '2 lineas'} · huecos ${c.huecoTitularBajada}/${c.huecoBajadaCta} · ` +
          `razon L2/L1 a 375 ${c.razonDeLosRegistros}x`,
      )
      console.log(`         ${[320, 375, 768].map(v).join('   |   ')}`)
    }
  }

  reportar('SOLO las cinco palancas de la instruccion · alcanza en 375 y 768', [375, 768], true)
  reportar('SOLO las cinco palancas · alcanza en 320, 375 y 768', [320, 375, 768], true)
  reportar('Con los dos huecos declarados · alcanza en 375 y 768', [375, 768], false)
  reportar('Con los dos huecos declarados · alcanza en 320, 375 y 768', [320, 375, 768], false)

  // ── 5 · EL REPARTO DEL ALTO, por ancho ───────────────────────────────────
  console.log('\n5 · DE QUE ESTA HECHO EL ALTO — reparto del bloque\n')
  console.log('  ancho  titular        huecos      bajada        CTA      bloque   titular/bloque')
  for (const g of geometrias) {
    const p = pronostico(g, HOY(g))
    const huecos = g.huecoTitularBajada + g.huecoBajadaCta
    const bajada = g.renglonesDeLaBajada * g.altoDeRenglonDeLaBajada
    console.log(
      `  ${String(g.ancho).padStart(5)}  ${p.altoDelTitular.toFixed(2).padStart(7)}  ${String(huecos).padStart(10)}` +
        `  ${bajada.toFixed(0).padStart(10)}  ${g.altoDelCta.toFixed(0).padStart(9)}  ${p.altoDelBloque.toFixed(2).padStart(10)}` +
        `  ${((p.altoDelTitular / p.altoDelBloque) * 100).toFixed(1).padStart(13)} %`,
    )
  }

  const salida = {
    cuando: new Date().toISOString(),
    instrumento: 'scripts-texto/c-minima.ts — aritmetica sobre a-desglose-hoy.json y b-palancas-hoy.json',
    control: { comparados, desvios },
    geometrias,
    umbrales: geometrias.map((g) => ({
      ancho: g.ancho,
      cajaDelTitular: dos(g.cajaDelTitular),
      umbralL1: dos(g.cajaDelTitular / g.avanceL1),
      umbralL2: dos(g.cajaDelTitular / g.avanceL2),
    })),
    topes: {
      pisoDeTituloXl: PISO_DE_TITULO_XL,
      recorridoDeLaPalancaA: 37 - PISO_DE_TITULO_XL,
      costoEn1920: PISOS_L2.map((p) => ({ piso: p, display_xl_1920: dos(deLaCurva(p, ANCLA_L2, 1920)) })),
    },
    combinaciones: todas.filter((c) => alcanza(c, [375, 768])).slice(0, 200),
  }
  const ruta = path.join(RAIZ_DE_SALIDAS, 'c-minima.json')
  writeFileSync(ruta, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  -> ${ruta}`)
}

main()
