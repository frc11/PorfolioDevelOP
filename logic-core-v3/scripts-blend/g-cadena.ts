/**
 * G — ¿LLEGAN LOS TRATAMIENTOS A LA ESCENA? La compuerta del sprint.
 *
 *     npx tsx scripts-blend/g-cadena.ts [--ancho=768|375|todos]
 *
 * Dos de los tres tratamientos dependen de una condicion que no se puede
 * suponer, y son condiciones DISTINTAS:
 *
 *   · **V3 · `mix-blend-mode`** mezcla contra lo pintado debajo **en el mismo
 *     contexto de apilamiento**. Si entre el texto y el `<canvas>` hay un
 *     ancestro que abre uno propio, el texto se mezcla contra ESE grupo —que no
 *     incluye la escena— y sale blanco sobre blanco. Es lo que BLEND-1 midio
 *     cortado en 716 de 716 lecturas; aca se vuelve a preguntar para la bajada,
 *     a 768 y 375, que son anchos que ese sprint no midio.
 *
 *   · **V4 · `backdrop-filter`** filtra el «backdrop», que lo acota el BACKDROP
 *     ROOT, y esa es otra lista: la raiz del documento, o un ancestro con
 *     `filter`, `opacity < 1`, `mask`, `mix-blend-mode` o `backdrop-filter`
 *     propio. Un contexto de apilamiento hecho con `position` + `z-index` **no**
 *     crea backdrop root. O sea que V4 puede llegar donde V3 no llega, y eso no
 *     se deriva: se fotografia.
 *
 * ── Los dos discriminadores empiricos ─────────────────────────────────────
 *
 *   1. **V3.** Con el blend puesto, se compara lo que el navegador pinto contra
 *      `255 - fondo`, y solo donde las dos hipotesis predicen distinto (fondo
 *      >= 55 sRGB): sobre el logo casi negro, `255 - fondo` y el blanco de la
 *      cadena cortada son el mismo numero, y contarlo ahi daria un falso «llega»
 *      (el agujero que BLEND-1 §1.3 tuvo que tapar). Se corre DOS veces: con el
 *      arbol de hoy y con el destrabe de BLEND-1 §1.4 puesto, que es el control
 *      positivo — si el instrumento no ve la cadena destrabada, no puede afirmar
 *      nada sobre la cortada.
 *
 *   2. **V4.** `brightness(K)` es una multiplicacion canal por canal en sRGB, o
 *      sea que si el backdrop de verdad incluye la escena, cada pixel de atras
 *      tiene que cumplir `salida = min(255, K x entrada)`. Se verifica esa
 *      igualdad pixel por pixel adentro del rect. Y trae su propio control: la
 *      MISMA cuenta sobre los pixeles de papel (que ya estan cerca de 255 y
 *      saturan) no discrimina, asi que se publica aparte la cuenta sobre los
 *      pixeles OSCUROS, que son los unicos que pueden probar que el canvas entro.
 */

import { cajaYTinta } from '../scripts-b5/pagina'
import { medir } from '../scripts-b4/navegador'
import type { Imagen } from '../scripts-b8/glifo-alfa'

import { argumento, asentarElHome, conLaPagina, guardarJson } from './blend-comun'
import {
  ASENTAMIENTO_MS,
  BAJADA,
  CRUCE,
  DESTRABAR,
  LECTOR_DE_CAJAS,
  PERFILES,
  PONER_EL_BLEND,
  PONER_LAS_CAPAS,
  SACAR_LAS_CAPAS,
  aPixeles,
  asegurarCarpetas,
  blendPintado,
  esperar,
  foto,
  fotoDeLaMascara,
  fotoDelFondo,
  fuenteDelDetector,
  mascara,
  scrollA,
  verificarElDestrabe,
  type CajasDelTexto,
  type Puesto,
  type Rect,
} from './f-comun'

/** El brillo con el que se prueba el alcance del backdrop. Es el que el pedido nombra. */
const BRILLO_DE_PRUEBA = 2.2

/**
 * LA CADENA DE LA BAJADA, hasta el ancestro que la corta.
 *
 * El detector de apilado se lee del fuente de `a-cadena.ts` (ver `f-comun.ts`);
 * lo que agrega este lector es la segunda pregunta, la de `backdrop-filter`: el
 * BACKDROP ROOT no lo abre un `z-index`, asi que se busca por separado.
 */
function lectorDeLaCadena(): string {
  return [
    '(() => {',
    fuenteDelDetector(),
    '  const abreBackdropRoot = (el) => {',
    '    const cs = getComputedStyle(el)',
    '    const r = []',
    '    if (el === document.documentElement) r.push({ propiedad: "(raiz)", valor: "documentElement" })',
    '    if (cs.filter !== "none") r.push({ propiedad: "filter", valor: cs.filter })',
    '    if (parseFloat(cs.opacity) < 1) r.push({ propiedad: "opacity", valor: cs.opacity })',
    '    if (cs.mixBlendMode !== "normal") r.push({ propiedad: "mix-blend-mode", valor: cs.mixBlendMode })',
    '    if (cs.backdropFilter !== "none" && cs.backdropFilter !== "") r.push({ propiedad: "backdrop-filter", valor: cs.backdropFilter })',
    '    if (cs.maskImage !== "none" && cs.maskImage !== "") r.push({ propiedad: "mask-image", valor: cs.maskImage })',
    '    return r',
    '  }',
    `  const p = document.querySelector(${JSON.stringify(BAJADA)})`,
    '  const lienzo = document.querySelector("canvas")',
    '  if (p === null) return { hay: false }',
    '  const cadena = []',
    '  let corte = null',
    '  let backdropRoot = null',
    '  let n = p.parentElement',
    '  while (n !== null) {',
    '    const razones = apila(n)',
    '    const raiz = abreBackdropRoot(n)',
    '    const nodo = { ...describir(n), razones, backdropRoot: raiz, contieneElCanvas: lienzo !== null && n.contains(lienzo) }',
    '    cadena.push(nodo)',
    '    if (razones.length > 0 && corte === null) corte = nodo',
    '    if (raiz.length > 0 && backdropRoot === null) backdropRoot = nodo',
    '    if (n === document.documentElement) break',
    '    n = n.parentElement',
    '  }',
    '  return {',
    '    hay: true,',
    '    hayCanvas: lienzo !== null,',
    '    grupoDelBlend: corte,',
    '    llegaAlCanvas: corte === null ? lienzo !== null : corte.contieneElCanvas,',
    '    backdropRoot,',
    '    elBackdropVeElCanvas: backdropRoot === null ? lienzo !== null : backdropRoot.contieneElCanvas,',
    '    largo: cadena.length,',
    '    cadena,',
    '  }',
    '})()',
  ].join('\n')
}

interface RazonDeApilado {
  readonly propiedad: string
  readonly valor: string
}

interface NodoDeLaCadena {
  readonly etiqueta: string
  readonly clases: string
  readonly datos: Readonly<Record<string, string>>
  readonly position: string
  readonly zIndex: string
  readonly razones: readonly RazonDeApilado[]
  readonly backdropRoot: readonly RazonDeApilado[]
  readonly contieneElCanvas: boolean
}

interface LecturaDeLaCadena {
  readonly hay: boolean
  readonly hayCanvas?: boolean
  readonly grupoDelBlend?: NodoDeLaCadena | null
  readonly llegaAlCanvas?: boolean
  readonly backdropRoot?: NodoDeLaCadena | null
  readonly elBackdropVeElCanvas?: boolean
  readonly largo?: number
  readonly cadena?: readonly NodoDeLaCadena[]
}

function nombre(n: NodoDeLaCadena): string {
  const clases = n.clases.split(/\s+/).filter((c) => c.length > 0).slice(0, 3).join('.')
  const datos = Object.keys(n.datos).map((k) => `[${k}]`).join('')
  return `${n.etiqueta}${datos}${clases === '' ? '' : `.${clases}`}`
}

/**
 * EL AJUSTE DE `brightness(K)`: cuantos pixeles cumplen `salida = min(255, K x entrada)`.
 *
 * Se parte en dos poblaciones porque una sola no discrimina: los pixeles de papel
 * ya saturan con K = 2,2 (247 x 2,2 = 543) y cumplirian la igualdad tambien si el
 * filtro se hubiera aplicado sobre un fondo blanco cualquiera. Los OSCUROS son
 * los unicos que prueban que lo que se filtro fue la escena.
 */
function ajusteDelBrillo(
  base: Imagen,
  tratada: Imagen,
  r: Rect,
  k: number,
): {
  readonly pixeles: number
  readonly cumplen: number
  readonly cumplenPct: number
  readonly oscuros: number
  readonly oscurosQueCumplen: number
  readonly oscurosPct: number
  readonly ejemplo: string
} {
  const x0 = Math.max(0, Math.floor(r.x))
  const y0 = Math.max(0, Math.floor(r.y))
  const x1 = Math.min(base.ancho, Math.ceil(r.x + r.ancho))
  const y1 = Math.min(base.alto, Math.ceil(r.y + r.alto))
  let pixeles = 0
  let cumplen = 0
  let oscuros = 0
  let oscurosQueCumplen = 0
  let ejemplo = '(ninguno oscuro)'
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (y * base.ancho + x) * 4
      const g = (base.datos[i] + base.datos[i + 1] + base.datos[i + 2]) / 3
      let bien = true
      for (let c = 0; c < 3; c += 1) {
        const esperado = Math.min(255, Math.round(k * base.datos[i + c]))
        if (Math.abs(tratada.datos[i + c] - esperado) > 3) bien = false
      }
      pixeles += 1
      if (bien) cumplen += 1
      if (g < 120) {
        oscuros += 1
        if (bien) oscurosQueCumplen += 1
        if (oscuros === 1) {
          ejemplo = `entrada ${Math.round(g)} -> salida ${Math.round((tratada.datos[i] + tratada.datos[i + 1] + tratada.datos[i + 2]) / 3)} (esperado ${Math.round(Math.min(255, k * g))})`
        }
      }
    }
  }
  const dos = (v: number): number => Math.round(v * 100) / 100
  return {
    pixeles,
    cumplen,
    cumplenPct: pixeles === 0 ? Number.NaN : dos((100 * cumplen) / pixeles),
    oscuros,
    oscurosQueCumplen,
    oscurosPct: oscuros === 0 ? Number.NaN : dos((100 * oscurosQueCumplen) / oscuros),
    ejemplo,
  }
}

async function principal(): Promise<void> {
  verificarElDestrabe()
  asegurarCarpetas()
  const pedido = argumento('ancho', 'todos')
  const perfiles = pedido === 'todos' ? PERFILES : PERFILES.filter((p) => p.id === pedido)
  const salida: Record<string, unknown>[] = []

  for (const perfil of perfiles) {
    const y = CRUCE[perfil.id]
    console.log(`\n=== ${perfil.id} (${perfil.ancho}x${perfil.alto}) | cruce en scroll ${y}`)

    const fila = await conLaPagina(
      perfil,
      '/v3',
      async (s) => {
        await asentarElHome(s)
        await scrollA(s.pagina, y)
        await esperar(ASENTAMIENTO_MS)

        // ── 1 · la cadena, derivada ─────────────────────────────────────────
        const cadena = await medir<LecturaDeLaCadena>(s.pagina, lectorDeLaCadena())
        if (!cadena.hay) throw new Error('no se encontro la bajada')
        const grupo = cadena.grupoDelBlend ?? null
        const raizDelBackdrop = cadena.backdropRoot ?? null
        console.log(`  blend    | corta en: ${grupo === null ? '(nada corta)' : nombre(grupo)}`)
        if (grupo !== null) console.log(`           | por: ${grupo.razones.map((r) => `${r.propiedad}=${r.valor}`).join(' + ')}`)
        console.log(`           | llega al canvas: ${cadena.llegaAlCanvas === true ? 'SI' : 'NO'}`)
        console.log(`  backdrop | root: ${raizDelBackdrop === null ? '(ninguno)' : nombre(raizDelBackdrop)}`)
        console.log(`           | el backdrop ve el canvas: ${cadena.elBackdropVeElCanvas === true ? 'SI' : 'NO'}`)

        // ── 2 · el discriminador de V3 ──────────────────────────────────────
        const cajas = await cajaYTinta(s.pagina, BAJADA)
        if (cajas.cajas.length === 0) throw new Error('la bajada no devolvio caja de texto')
        const T = await fotoDeLaMascara(s.pagina, `g-${perfil.id}-t`)
        const m = mascara(T, cajas.cajas)
        const A = await fotoDelFondo(s.pagina, `g-${perfil.id}-a`)

        const puestoHoy = await medir<Puesto>(s.pagina, PONER_EL_BLEND(true))
        const B = await foto(s.pagina, `g-${perfil.id}-b-hoy`)
        await medir<Puesto>(s.pagina, PONER_EL_BLEND(false))
        const hoy = blendPintado(m, A, B)

        const destrabado = await medir<Puesto>(s.pagina, DESTRABAR(true))
        const Ad = await fotoDelFondo(s.pagina, `g-${perfil.id}-a-destrabado`)
        await medir<Puesto>(s.pagina, PONER_EL_BLEND(true))
        const Bd = await foto(s.pagina, `g-${perfil.id}-b-destrabado`)
        await medir<Puesto>(s.pagina, PONER_EL_BLEND(false))
        const conDestrabe = blendPintado(m, Ad, Bd)
        const sacado = await medir<Puesto>(s.pagina, DESTRABAR(false))

        console.log(`  V3 | blend puesto: ${puestoHoy.tomo ? 'ok' : 'NO TOMO'} (${puestoHoy.porque})`)
        console.log(`     | arbol de hoy    coincidencia ${hoy.coincidencia}% sobre ${hoy.discriminantes} px que discriminan`)
        console.log(`     | cadena destrabe ${destrabado.tomo ? 'ok' : 'NO TOMO'}: coincidencia ${conDestrabe.coincidencia}% sobre ${conDestrabe.discriminantes}`)
        console.log(`     | destrabe sacado: ${sacado.tomo ? 'ok' : 'NO VOLVIO'} (${sacado.porque})`)

        // ── 3 · el discriminador de V4 ──────────────────────────────────────
        const cajasDelTexto = await medir<CajasDelTexto>(s.pagina, LECTOR_DE_CAJAS)
        if (cajasDelTexto.bloque === null) throw new Error('no se leyo la caja del bloque')
        const rect = aPixeles(cajasDelTexto.bloque)
        const base = await fotoDelFondo(s.pagina, `g-${perfil.id}-sin-backdrop`)
        const capaPuesta = await medir<Puesto>(
          s.pagina,
          PONER_LAS_CAPAS([rect], `backdrop-filter: brightness(${BRILLO_DE_PRUEBA}); -webkit-backdrop-filter: brightness(${BRILLO_DE_PRUEBA});`),
        )
        const conBackdrop = await fotoDelFondo(s.pagina, `g-${perfil.id}-con-backdrop`)
        await medir<Puesto>(s.pagina, SACAR_LAS_CAPAS)
        const ajuste = ajusteDelBrillo(base, conBackdrop, rect, BRILLO_DE_PRUEBA)

        console.log(`  V4 | capa puesta: ${capaPuesta.tomo ? 'ok' : 'NO TOMO'} (${capaPuesta.porque})`)
        console.log(`     | cumplen salida=min(255,${BRILLO_DE_PRUEBA}x entrada): ${ajuste.cumplenPct}% de ${ajuste.pixeles} px`)
        console.log(`     | y entre los OSCUROS (<120): ${ajuste.oscurosPct}% de ${ajuste.oscuros} | ${ajuste.ejemplo}`)

        return {
          ancho: perfil.id,
          scrollY: y,
          rectDelBloque: rect,
          renglones: cajasDelTexto.renglones.length,
          pixelesDeGlifo: m.indices.length,
          blend: {
            cortaEn: grupo === null ? null : nombre(grupo),
            razones: grupo === null ? [] : grupo.razones,
            llegaAlCanvas: cadena.llegaAlCanvas === true,
            coincidenciaHoy: hoy.coincidencia,
            coincidenciaDestrabado: conDestrabe.coincidencia,
            discriminantes: hoy.discriminantes,
            destrabeTomo: destrabado.tomo,
            destrabeVolvio: sacado.tomo,
          },
          backdrop: {
            root: raizDelBackdrop === null ? null : nombre(raizDelBackdrop),
            razones: raizDelBackdrop === null ? [] : raizDelBackdrop.backdropRoot,
            veElCanvas: cadena.elBackdropVeElCanvas === true,
            brillo: BRILLO_DE_PRUEBA,
            ajuste,
          },
          cadena: (cadena.cadena ?? []).map((n) => ({
            nodo: nombre(n),
            apila: n.razones.map((r) => `${r.propiedad}=${r.valor}`),
            backdropRoot: n.backdropRoot.map((r) => `${r.propiedad}=${r.valor}`),
            contieneElCanvas: n.contieneElCanvas,
          })),
        }
      },
      { quien: 'blend2' },
    )
    salida.push(fila)
  }

  console.log(`\n  ${guardarJson('f-cadena', { brilloDePrueba: BRILLO_DE_PRUEBA, anchos: salida })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
