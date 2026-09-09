/**
 * B9 · §1.2 — CUÁNDO DISPARA UNA ENTRADA EN LA REFERENCIA.
 *
 * ── Por qué hace falta un instrumento distinto del de `b9-desfases.ts` ────
 *
 * Aquél encuentra las instancias por `[data-arbol]`, que es un atributo NUESTRO.
 * La referencia no lo tiene y no se le puede pedir. Así que acá el elemento
 * animado se descubre por la única huella que los dos sitios comparten: **un
 * atributo `style` en línea que cambia con el scroll**. Es la misma definición
 * que `scripts-b4/censo.ts` usa para el censo de acontecimientos, y es la que
 * hace que el número de un sitio y el del otro se puedan poner en la misma
 * columna.
 *
 * ⚠️ **De la referencia se MIDE, no se copia. Una navegación, una medición.**
 * Este script hace exactamente una: navega, barre, cierra. No sigue enlaces, no
 * abre una segunda página y no guarda una sola captura de su diseño.
 *
 * ── Las cuatro preguntas de §1.2, y cómo las contesta cada columna ────────
 *
 *   1. «a qué distancia del borde inferior del viewport empieza a moverse»
 *      → `entradaDesdeElBorde`: `ventana − top` en la parada del arranque, en
 *        fracción de pantalla. 0 = justo al asomar; negativo = ya había entrado.
 *   2. «si llega a su estado final al centro, al tercio, o antes de salir»
 *      → `fondoAlTerminar`: dónde está el BORDE INFERIOR de la caja cuando
 *        aterriza, en fracción de pantalla desde el tope del cuadro.
 *   3. «cuánto dura en píxeles de scroll»
 *      → `duracionPx`.
 *   4. «si el escalonado corre el disparo del último elemento y cuánto»
 *      → los elementos se agrupan por PADRE: un grupo con más de un hijo animado
 *        publica el desparramo entre el primer arranque y el último.
 *
 * Corre con:
 *
 *     npx tsx scripts-b9/b9-referencia.ts https://www.nk.studio/ nk
 *     npx tsx scripts-b9/b9-referencia.ts http://localhost:3002/v3 propio
 */

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'
import { dos, jsonPendiente, mudar, tres } from './b9-comun'

const PASO = 120

const URL = process.argv[2] ?? 'https://www.nk.studio/'
const QUIEN = process.argv[3] ?? 'nk'
const PERFIL = process.argv[4] ?? '1920'

interface ElementoAnimado {
  readonly ruta: string
  readonly etiqueta: string
  readonly padre: string
  /** `[h, top, alto]` por parada; `null` donde el elemento no existía. */
  readonly serie: readonly (readonly [number, number, number] | null)[]
}

interface LecturaDeReferencia {
  readonly paradas: readonly number[]
  readonly elementos: readonly ElementoAnimado[]
  readonly ventana: number
  readonly alturaDelDocumento: number
  readonly visibilityState: string
  readonly innerWidth: number
  readonly titulo: string
  readonly urlFinal: string
}

/**
 * La mitad que corre adentro de la página.
 *
 * ⚠️ Guarda el histórico de TODOS los elementos con estilo en línea y recién al
 * final descarta los que nunca cambiaron. Filtrar antes exigiría saber cuáles
 * se animan, que es justamente lo que se está midiendo.
 */
function fuente(paso: number): string {
  return `async () => {
  const PASO = ${paso}, ESPERAS = 8, MS = 140
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const dormir = (t) => new Promise((r) => setTimeout(r, t))
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i += 1) h = (((h * 33) ^ s.charCodeAt(i)) >>> 0); return h }
  const ruta = (el) => {
    const p = []
    let n = el
    while (n !== null && n.parentElement !== null) {
      p.push(n.tagName.toLowerCase() + ':' + [...n.parentElement.children].indexOf(n))
      n = n.parentElement
    }
    return p.reverse().join('/')
  }
  const leer = () => {
    const f = new Map()
    for (const el of document.querySelectorAll('[style]')) {
      const s = el.getAttribute('style')
      if (s === null || s.length === 0) continue
      const r = el.getBoundingClientRect()
      f.set(ruta(el), [hash(s), Math.round(r.top * 10) / 10, Math.round(r.height * 10) / 10, el.tagName.toLowerCase()])
    }
    return f
  }
  const iguales = (a, b) => {
    if (a.size !== b.size) return false
    for (const [k, v] of a) { const w = b.get(k); if (w === undefined || w[0] !== v[0] || w[1] !== v[1]) return false }
    return true
  }

  const HASTA = document.documentElement.scrollHeight - window.innerHeight
  const paradas = [], historia = []
  for (let y = 0; y <= HASTA; y += PASO) {
    window.scrollTo(0, y)
    await raf2()
    let f = leer()
    for (let i = 0; i < ESPERAS; i += 1) {
      await dormir(MS)
      const g = leer()
      if (iguales(f, g)) break
      f = g
    }
    paradas.push(window.scrollY)
    historia.push(f)
  }

  const rutas = new Set()
  for (const f of historia) for (const k of f.keys()) rutas.add(k)
  const elementos = []
  for (const r of rutas) {
    const serie = historia.map((f) => {
      const v = f.get(r)
      return v === undefined ? null : [v[0], v[1], v[2]]
    })
    let cambia = false, etiqueta = ''
    let previa = null
    for (let k = 0; k < serie.length; k += 1) {
      const s = serie[k]
      if (s === null) continue
      if (previa !== null && s[0] !== previa[0]) cambia = true
      previa = s
    }
    for (const f of historia) { const v = f.get(r); if (v !== undefined) { etiqueta = v[3]; break } }
    if (!cambia) continue
    elementos.push({ ruta: r, etiqueta, padre: r.slice(0, r.lastIndexOf('/')), serie })
  }

  return {
    paradas,
    elementos,
    ventana: window.innerHeight,
    alturaDelDocumento: document.documentElement.scrollHeight,
    visibilityState: document.visibilityState,
    innerWidth: window.innerWidth,
    titulo: document.title,
    urlFinal: location.href,
  }
}`
}

interface FilaDeReferencia {
  readonly ruta: string
  readonly etiqueta: string
  readonly padre: string
  readonly entra: number | null
  readonly sale: number | null
  readonly empieza: number | null
  readonly termina: number | null
  readonly duracionPx: number | null
  /** Fracción de pantalla desde el BORDE INFERIOR del cuadro hacia arriba, al arrancar. */
  readonly entradaDesdeElBorde: number | null
  /** Dónde está el borde inferior de la caja al aterrizar, en fracción de pantalla. */
  readonly fondoAlTerminar: number | null
  readonly topAlTerminar: number | null
  readonly fraccionFueraDeCuadro: number | null
}

function filas(l: LecturaDeReferencia): readonly FilaDeReferencia[] {
  const V = l.ventana
  return l.elementos.map((e) => {
    const enCuadro = e.serie.map((s) => s !== null && s[1] < V && s[1] + s[2] > 0)
    const iEntra = enCuadro.indexOf(true)
    const iSale = enCuadro.lastIndexOf(true)
    const cambios: number[] = []
    let previa: readonly [number, number, number] | null = null
    let iPrevia = -1
    for (let k = 0; k < e.serie.length; k += 1) {
      const s = e.serie[k]
      if (s === null) continue
      if (previa !== null && s[0] !== previa[0]) cambios.push(k)
      previa = s
      iPrevia = k
    }
    void iPrevia
    const iEmp = cambios.length === 0 ? -1 : Math.max(0, cambios[0] - 1)
    const iFin = cambios.length === 0 ? -1 : cambios[cambios.length - 1]
    const sEmp = iEmp < 0 ? null : e.serie[iEmp]
    const sFin = iFin < 0 ? null : e.serie[iFin]

    let fuera: number | null = null
    if (iEmp >= 0 && iFin >= iEmp) {
      let n = 0
      for (let k = iEmp; k <= iFin; k += 1) if (!enCuadro[k]) n += 1
      fuera = tres(n / (iFin - iEmp + 1))
    }

    return {
      ruta: e.ruta,
      etiqueta: e.etiqueta,
      padre: e.padre,
      entra: iEntra < 0 ? null : l.paradas[iEntra],
      sale: iSale < 0 ? null : l.paradas[iSale],
      empieza: iEmp < 0 ? null : l.paradas[iEmp],
      termina: iFin < 0 ? null : l.paradas[iFin],
      duracionPx: iEmp < 0 || iFin < 0 ? null : l.paradas[iFin] - l.paradas[iEmp],
      entradaDesdeElBorde: sEmp === null ? null : tres((V - sEmp[1]) / V),
      fondoAlTerminar: sFin === null ? null : tres((sFin[1] + sFin[2]) / V),
      topAlTerminar: sFin === null ? null : tres(sFin[1] / V),
      fraccionFueraDeCuadro: fuera,
    }
  })
}

function cuantiles(xs: readonly number[]): { p25: number; p50: number; p75: number; min: number; max: number } {
  const s = [...xs].sort((a, b) => a - b)
  const q = (f: number): number => s[Math.min(s.length - 1, Math.max(0, Math.round(f * (s.length - 1))))]
  return { min: dos(s[0]), p25: dos(q(0.25)), p50: dos(q(0.5)), p75: dos(q(0.75)), max: dos(s[s.length - 1]) }
}

async function main(): Promise<void> {
  const perfil = perfilPorId(PERFIL)
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome(`b9-${QUIEN}`),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
  })
  let lectura: LecturaDeReferencia
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    // La marca del intro es NUESTRA; en un sitio ajeno no aplica y no se pone.
    await irA(p, URL, { marcaDeIntro: QUIEN === 'propio' })
    const estado = await verificarLaPagina(p, perfil)
    console.log(
      `página verificada — ${estado.visibilityState} ${estado.innerWidth}×${estado.innerHeight} rAF=${estado.rafCorre} documento=${estado.alturaDelDocumento}`,
    )
    await medir<boolean>(p, `new Promise((r) => setTimeout(() => r(true), 3000))`)
    lectura = await medir<LecturaDeReferencia>(p, `(${fuente(PASO)})()`)
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }

  if (lectura.visibilityState !== 'visible' || lectura.innerWidth === 0) {
    throw new Error(`barrido inválido: ${lectura.visibilityState} / ${lectura.innerWidth}`)
  }

  const tabla = filas(lectura)
  console.log('')
  console.log(
    `B9 · REFERENCIA «${QUIEN}» — ${lectura.urlFinal} · «${lectura.titulo}» · ${perfil.ancho}×${perfil.alto} · documento ${lectura.alturaDelDocumento} px (${dos(lectura.alturaDelDocumento / lectura.ventana)} pantallas) · ${lectura.elementos.length} elementos animados · paso ${PASO} px`,
  )

  const conEntrada = tabla.filter((f) => f.entradaDesdeElBorde !== null && f.entra !== null)
  const arranques = conEntrada.map((f) => f.entradaDesdeElBorde as number)
  const finales = conEntrada.map((f) => f.fondoAlTerminar as number)
  const duraciones = conEntrada.map((f) => (f.duracionPx as number) / lectura.ventana)
  const fueras = conEntrada.map((f) => f.fraccionFueraDeCuadro ?? 0)

  console.log('')
  console.log(`sobre ${conEntrada.length} elementos animados:`)
  console.log(`  arranque, distancia DESDE EL BORDE INFERIOR (pantallas; 0 = justo al asomar, 1 = ya al tope):`)
  console.log(`    ${JSON.stringify(cuantiles(arranques))}`)
  console.log(`  aterrizaje, BORDE INFERIOR de la caja (pantallas desde el tope; 1 = al borde de abajo, 0,5 = al centro):`)
  console.log(`    ${JSON.stringify(cuantiles(finales))}`)
  console.log(`  duración en pantallas de scroll:`)
  console.log(`    ${JSON.stringify(cuantiles(duraciones))}`)
  console.log(`  fracción de la animación fuera de cuadro:`)
  console.log(`    ${JSON.stringify(cuantiles(fueras))}`)

  // El escalonado: grupos de hermanos animados bajo el mismo padre.
  const porPadre = new Map<string, FilaDeReferencia[]>()
  for (const f of conEntrada) {
    const l = porPadre.get(f.padre) ?? []
    l.push(f)
    porPadre.set(f.padre, l)
  }
  const grupos = [...porPadre.entries()]
    .filter(([, l]) => l.length > 1)
    .map(([padre, l]) => {
      const inicios = l.map((f) => f.empieza as number)
      const fines = l.map((f) => f.termina as number)
      return {
        padre,
        hijos: l.length,
        desparramoDeArranquePx: Math.max(...inicios) - Math.min(...inicios),
        desparramoDeArranquePantallas: tres((Math.max(...inicios) - Math.min(...inicios)) / lectura.ventana),
        ultimoTerminaEnFondo: l.reduce((a, b) => ((a.termina ?? 0) > (b.termina ?? 0) ? a : b)).fondoAlTerminar,
      }
    })
    .sort((a, b) => b.desparramoDeArranquePx - a.desparramoDeArranquePx)

  console.log('')
  console.log(`ESCALONADO — ${grupos.length} grupos de hermanos animados. Los 12 de mayor desparramo:`)
  for (const g of grupos.slice(0, 12)) {
    console.log(
      `  ${String(g.hijos).padStart(3)} hijos · desparramo ${String(g.desparramoDeArranquePx).padStart(5)} px (${g.desparramoDeArranquePantallas} pantallas) · el último aterriza con su fondo en ${g.ultimoTerminaEnFondo} · ${g.padre.slice(-70)}`,
    )
  }
  if (grupos.length > 0) {
    console.log(
      `  desparramo de arranque, cuantiles (pantallas): ${JSON.stringify(cuantiles(grupos.map((g) => g.desparramoDeArranquePantallas)))}`,
    )
  }

  const escritos = mudar([
    jsonPendiente(`referencia-${QUIEN}-${perfil.id}.json`, {
      quien: QUIEN,
      url: lectura.urlFinal,
      titulo: lectura.titulo,
      perfil: perfil.id,
      ventana: lectura.ventana,
      alturaDelDocumento: lectura.alturaDelDocumento,
      paso: PASO,
      elementos: tabla,
      grupos,
      resumen: {
        arranqueDesdeElBorde: cuantiles(arranques),
        fondoAlTerminar: cuantiles(finales),
        duracionEnPantallas: cuantiles(duraciones),
        fraccionFueraDeCuadro: cuantiles(fueras),
      },
    }),
  ])
  console.log('')
  for (const e of escritos) console.log(`escrito: ${e}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
