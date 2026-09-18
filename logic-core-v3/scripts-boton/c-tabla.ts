/**
 * C · LAS TABLAS — del crudo a las respuestas de los cinco pasos.
 *
 *     npx tsx scripts-boton/c-tabla.ts
 *
 * No abre el navegador. Lee los tres crudos que dejaron `a-referencia.ts` y
 * `b-nuestro.ts`, y los píxeles de la tira congelada, y escribe el destilado
 * que cita el reporte. Se puede volver a correr cuantas veces haga falta.
 *
 * ── Los papeles se DETECTAN, no se escriben ───────────────────────────────
 *
 * Un mapa a mano de qué nodo es cada cosa —«el segundo span es la copia B»— es
 * la clase de dato que se copia mal una vez y envenena todas las tablas. Acá
 * cada papel sale de una regla sobre lo medido, y la regla y su resultado se
 * imprimen para que se puedan auditar:
 *
 *   copias        los DOS nodos con el mismo texto propio no vacío
 *   ventana       el ancestro común de las copias con `overflow: hidden`
 *   subrayado     todo nodo cuyo `transform` es una escala en X pura (b=c=0,
 *                 d=1) que recorre más de media unidad
 *   brillo        todo nodo cuyo atributo `style` lo reescribe JavaScript
 *                 (más de diez escrituras en la grabación)
 */

import { existsSync, readFileSync } from 'node:fs'

import { decodificarPng, type Imagen } from '../scripts-b4/png'

import {
  anclasDe,
  avanceDeTransformada,
  contrastarCurva,
  descomponer,
  leerMatriz,
  nodo,
  serie,
  tramoPintado,
  tramosDe,
  tres,
  valorEn,
  type Tramo,
} from './analisis'
import { CRUDO, guardarJson } from './boton-comun'
import type { MedidaDelBoton } from './medida'
import type { NodoEstatico } from './pagina-de-boton'

const IDS: readonly string[] = ['nk', 'hero', 'cierre']

interface Papeles {
  readonly copias: readonly string[]
  readonly ventana: string | null
  readonly subrayado: readonly string[]
  readonly brillo: readonly string[]
}

function papelesDe(m: MedidaDelBoton): Papeles {
  const porTexto = new Map<string, string[]>()
  for (const n of m.reposo) {
    if (n.texto === '' || n.pseudo !== null) continue
    const l = porTexto.get(n.texto) ?? []
    l.push(n.clave)
    porTexto.set(n.texto, l)
  }
  let copias: readonly string[] = []
  for (const [, claves] of porTexto) if (claves.length === 2) copias = claves

  let ventana: string | null = null
  if (copias.length === 2) {
    const candidatos = m.reposo.filter(
      (n) => n.pseudo === null && copias.every((c) => c.startsWith(`${n.clave}>`)) && n.estilo.overflow === 'hidden',
    )
    ventana = candidatos.length === 0 ? null : candidatos[candidatos.length - 1].clave
  }

  const subrayado: string[] = []
  for (const s of m.grabacion.series) {
    const t = s.cs.transform
    if (t === undefined || t.length < 4) continue
    const escalas: number[] = []
    for (const [, v] of t) {
      const mm = leerMatriz(v)
      if (mm === null || mm.b !== 0 || mm.c !== 0 || mm.d !== 1) {
        escalas.length = 0
        break
      }
      escalas.push(mm.a)
    }
    if (escalas.length > 0 && Math.max(...escalas) - Math.min(...escalas) > 0.5) subrayado.push(s.clave)
  }

  const brillo = m.grabacion.series.filter((s) => s.inline.length > 10).map((s) => s.clave)
  return { copias, ventana, subrayado, brillo }
}

function declarada(m: MedidaDelBoton, clave: string, propiedad: string): {
  readonly duracion: number | null
  readonly retardo: number | null
  readonly curva: string
} {
  const a = m.animacionesAlEntrar.find(
    (x) => `${x.objetivo}${x.pseudo ?? ''}` === clave && x.propiedad === propiedad,
  )
  return a === undefined
    ? { duracion: null, retardo: null, curva: '' }
    : { duracion: a.duracion, retardo: a.retardo, curva: a.curva }
}

function primerTramoTras(tramos: readonly Tramo[], t0: number): Tramo | null {
  for (const t of tramos) if (t.desde >= t0 - 40) return t
  return null
}

function estadoDe(foto: readonly NodoEstatico[], clave: string): Record<string, string> {
  const n = nodo(foto, clave)
  return n === undefined ? {} : n.estilo
}

/** Distancia entre dos estados, sólo en las propiedades que alguna vez se movieron. */
function difiere(
  a: readonly NodoEstatico[],
  b: readonly NodoEstatico[],
  claves: readonly string[],
): readonly { readonly clave: string; readonly propiedad: string; readonly a: string; readonly b: string }[] {
  const salida: { clave: string; propiedad: string; a: string; b: string }[] = []
  for (const clave of claves) {
    const ea = estadoDe(a, clave)
    const eb = estadoDe(b, clave)
    for (const p of Object.keys(ea)) {
      if (ea[p] !== eb[p]) salida.push({ clave, propiedad: p, a: ea[p], b: eb[p] })
    }
  }
  return salida
}

// ═══ EL CONTRASTE DE PÍXEL ═══════════════════════════════════════════════

/**
 * DÓNDE ESTÁ PINTADA LA RAYA, LEÍDO DE LA FOTO Y NO DEL DOM.
 *
 * Es el control cruzado del subrayado: la geometría sale de `transform` y
 * `transform-origin`, que es un razonamiento; esto es el píxel. El detector no
 * busca un color —el de la referencia es claro sobre sala oscura y el nuestro
 * es tinta sobre papel, y un umbral de color sólo sirve para uno de los dos—
 * sino un BORDE HORIZONTAL: una fila que se aparta de las que tiene 3 px arriba
 * y 3 px abajo. Eso describe una raya de 1 a 3 px sobre cualquier fondo, y el
 * signo del apartamiento dice si es clara o es oscura.
 */
function rayaEn(
  img: Imagen,
  banda?: { readonly desde: number; readonly hasta: number; readonly signo: number },
): {
  readonly fila: number
  readonly signo: number
  readonly tramos: readonly (readonly [number, number])[]
  readonly corrida: number
  readonly perfil: { readonly maximo: number; readonly enX: number; readonly minimo: number }
} {
  const lum = (x: number, y: number): number => {
    const k = (y * img.ancho + x) * 4
    return 0.2126 * img.datos[k] + 0.7152 * img.datos[k + 1] + 0.0722 * img.datos[k + 2]
  }
  const UMBRAL = 18
  // ⚠️ La fila se elige por la CORRIDA CONTIGUA MAS LARGA y no por la cantidad
  // de píxeles que se apartan. Con la cantidad gana siempre la fila del
  // RÓTULO: veinte letras suman más píxeles de borde que una raya, y el
  // detector devolvía los huecos entre glifos como si fueran el hueco del
  // subrayado. Una corrida de más de 20 px seguidos no la produce ningún
  // glifo de este cuerpo; una raya la produce siempre.
  //
  // ⚠️ Y LA BÚSQUEDA VA ACOTADA A UNA BANDA, porque sin eso el fondo gana.
  // Con la escena de la referencia moviéndose detrás y con la celosía del
  // Cierre, hay filas de fondo con corridas de 56 px que le ganan al subrayado
  // justo en los cuadros donde el subrayado está PARTIDO —que son los únicos
  // que importan—. La banda sale del cuadro de hover pleno, donde la raya es
  // inequívoca (181 px en la referencia, 159 en el hero, 117 en el Cierre), y
  // se le dan 8 px de aire arriba y abajo porque la ventana crece 4 px y
  // empuja la raya con ella.
  let mejorFila = -1
  let mejorCorrida = 0
  let mejorSigno = 1
  const y0 = banda === undefined ? 3 : Math.max(3, banda.desde)
  const y1 = banda === undefined ? img.alto - 3 : Math.min(img.alto - 3, banda.hasta)
  for (const signo of banda === undefined ? [1, -1] : [banda.signo]) {
    for (let y = y0; y < y1; y += 1) {
      let corrida = 0
      let maxima = 0
      for (let x = 0; x < img.ancho; x += 1) {
        const s = signo * (lum(x, y) - 0.5 * (lum(x, y - 3) + lum(x, y + 3)))
        if (s > UMBRAL) {
          corrida += 1
          if (corrida > maxima) maxima = corrida
        } else corrida = 0
      }
      if (maxima > mejorCorrida) {
        mejorCorrida = maxima
        mejorFila = y
        mejorSigno = signo
      }
    }
  }
  const tramos: [number, number][] = []
  if (mejorFila >= 0) {
    let ini = -1
    for (let x = 0; x <= img.ancho; x += 1) {
      const hay =
        x < img.ancho && mejorSigno * (lum(x, mejorFila) - 0.5 * (lum(x, mejorFila - 3) + lum(x, mejorFila + 3))) > UMBRAL
      if (hay && ini < 0) ini = x
      if (!hay && ini >= 0) {
        if (x - ini >= 3) tramos.push([ini, x - 1])
        ini = -1
      }
    }
  }
  let maximo = -1
  let minimo = 1e9
  let enX = -1
  if (mejorFila >= 0) {
    for (let x = 0; x < img.ancho; x += 1) {
      const l = lum(x, mejorFila)
      if (l > maximo) {
        maximo = l
        enX = x
      }
      if (l < minimo) minimo = l
    }
  }
  return {
    fila: mejorFila,
    signo: mejorSigno,
    tramos,
    corrida: mejorCorrida,
    perfil: { maximo: Math.round(maximo * 10) / 10, enX, minimo: Math.round(minimo * 10) / 10 },
  }
}

/** El píxel más claro de la banda del subrayado: el discriminador del brillo. */
function picoDeLuz(img: Imagen, filaDesde: number, filaHasta: number): { readonly maximo: number; readonly x: number; readonly y: number } {
  let maximo = -1
  let mx = -1
  let my = -1
  for (let y = Math.max(0, filaDesde); y <= Math.min(img.alto - 1, filaHasta); y += 1) {
    for (let x = 0; x < img.ancho; x += 1) {
      const k = (y * img.ancho + x) * 4
      const l = 0.2126 * img.datos[k] + 0.7152 * img.datos[k + 1] + 0.0722 * img.datos[k + 2]
      if (l > maximo) {
        maximo = l
        mx = x
        my = y
      }
    }
  }
  return { maximo: Math.round(maximo * 10) / 10, x: mx, y: my }
}

// ═══ EL INFORME ══════════════════════════════════════════════════════════

interface Salida {
  readonly id: string
  readonly nombre: string
  readonly papeles: Papeles
  readonly inventario: readonly Record<string, string>[]
  readonly estados: Record<string, unknown>
  readonly declaradas: readonly Record<string, unknown>[]
  readonly entrada: readonly Record<string, unknown>[]
  readonly salida: readonly Record<string, unknown>[]
  readonly subrayado: Record<string, unknown>
  readonly brillo: readonly Record<string, unknown>[]
  readonly pixeles: readonly Record<string, unknown>[]
  readonly regreso: Record<string, unknown>
}

function analizar(m: MedidaDelBoton): Salida {
  const p = papelesDe(m)
  const anclas = anclasDe(m.grabacion)
  const E1 = anclas.entradas[0]
  const S1 = anclas.salidas[0]
  const E2 = anclas.entradas[1]

  const inventario = m.reposo.map((n) => ({
    clave: n.clave,
    etiqueta: n.etiqueta + (n.pseudo ?? ''),
    texto: n.texto.slice(0, 28),
    caja: n.rect === null ? '(pseudo)' : n.rect.map((x) => tres(x)).join(' · '),
    papel: p.copias[0] === n.clave
      ? 'copia A'
      : p.copias[1] === n.clave
        ? 'copia B'
        : p.ventana === n.clave
          ? 'ventana'
          : p.subrayado.includes(n.clave)
            ? 'subrayado'
            : p.brillo.includes(n.clave)
              ? 'brillo'
              : n.clave === m.preparacion.clave
                ? 'raíz'
                : '',
  }))

  const interesantes = [...new Set([...p.copias, ...(p.ventana === null ? [] : [p.ventana]), ...p.subrayado, ...p.brillo])]

  const declaradas = m.animacionesAlEntrar.map((a) => ({
    nodo: `${a.objetivo}${a.pseudo ?? ''}`,
    propiedad: a.propiedad,
    duracion: a.duracion,
    retardo: a.retardo,
    curva: a.curva,
  }))

  const entrada: Record<string, unknown>[] = []
  const salidaTramos: Record<string, unknown>[] = []
  for (const clave of interesantes) {
    const s = serie(m.grabacion, clave)
    if (s === undefined) continue
    for (const [prop, cambios] of Object.entries(s.cs)) {
      if (cambios.length < 2) continue
      const tr = tramosDe(cambios)
      const tE = primerTramoTras(tr, E1)
      const tS = primerTramoTras(tr, S1)
      const dec = declarada(m, clave, prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`))
      if (tE !== null && tE.desde < S1) {
        let contraste = null
        if (dec.duracion !== null && dec.retardo !== null) {
          const avance =
            prop === 'opacity'
              ? (v: string): number | null => {
                  const a = Number(tE.valorInicial)
                  const b = Number(tE.valorFinal)
                  return b === a ? null : (Number(v) - a) / (b - a)
                }
              : prop === 'transform'
                ? avanceDeTransformada(tE.valorInicial, tE.valorFinal)
                : null
          if (avance !== null) {
            contraste = contrastarCurva(cambios, E1, dec.duracion, dec.retardo, dec.curva, avance)
          }
        }
        entrada.push({
          nodo: clave,
          propiedad: prop,
          arranca: tres(tE.desde - E1),
          termina: tres(tE.hasta - E1),
          duracion: tE.duracion,
          muestras: tE.muestras,
          declarada: dec.duracion === null ? null : `${dec.duracion} ms + ${dec.retardo} ms · ${dec.curva}`,
          contraste,
        })
      }
      if (tS !== null) {
        salidaTramos.push({
          nodo: clave,
          propiedad: prop,
          arranca: tres(tS.desde - S1),
          termina: tres(tS.hasta - S1),
          duracion: tS.duracion,
          muestras: tS.muestras,
          instantaneo: tS.muestras === 1,
        })
      }
    }
  }

  // ── El subrayado, capa por capa y en tramos de píxel ──────────────────
  const capas = p.subrayado.map((clave) => {
    const n = nodo(m.reposo, clave)
    const s = serie(m.grabacion, clave)
    const ancho = n === undefined ? 0 : Number.parseFloat(n.estilo.width)
    const origen = n === undefined ? 0 : Number.parseFloat(n.estilo.transformOrigin)
    return { clave, ancho, origen, s, nodo: n }
  })
  const muestrasDelHueco: Record<string, unknown>[] = []
  if (capas.length > 0) {
    for (const dt of [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 700, 800, 900, 1000]) {
      const cubierto: [number, number][] = []
      for (const c of capas) {
        if (c.s === undefined || c.nodo === undefined) continue
        const v = valorEn(c.s.cs.transform ?? [], E1 + dt)
        const mm = v === null ? null : leerMatriz(v)
        const o = valorEn(c.s.cs.transformOrigin ?? [], E1 + dt)
        const origen = o === null ? c.origen : Number.parseFloat(o)
        if (mm === null) continue
        const t = tramoPintado(mm.a, origen, c.ancho)
        if (t.hasta - t.desde > 0.0005) cubierto.push([t.desde, t.hasta])
      }
      cubierto.sort((a, b) => a[0] - b[0])
      const huecos: [number, number][] = []
      let borde = 0
      for (const [a, b] of cubierto) {
        if (a > borde + 0.0005) huecos.push([borde, a])
        borde = Math.max(borde, b)
      }
      if (borde < 0.9995) huecos.push([borde, 1])
      muestrasDelHueco.push({
        t: dt,
        cubierto: cubierto.map(([a, b]) => `${(a * 100).toFixed(1)}–${(b * 100).toFixed(1)}`),
        huecos: huecos.map(([a, b]) => `${(a * 100).toFixed(1)}–${(b * 100).toFixed(1)}`),
        anchoDelHueco: tres(huecos.reduce((acc, [a, b]) => acc + (b - a), 0) * 100),
        centroDelHueco:
          huecos.length === 0 ? null : tres(((huecos[0][0] + huecos[huecos.length - 1][1]) / 2) * 100),
      })
    }
  }

  // ── El brillo ─────────────────────────────────────────────────────────
  const brillo = p.brillo.map((clave) => {
    const s = serie(m.grabacion, clave)
    const n = nodo(m.reposo, clave)
    const h = nodo(m.hoverPleno, clave)
    const tr = s === undefined ? [] : tramosDe(s.cs.transform ?? [])
    const tE = primerTramoTras(tr, E1)
    const dec = declarada(m, clave, 'transform')
    return {
      nodo: clave,
      escrituraDeJs: s === undefined ? 0 : s.inline.length,
      reposo: n === undefined ? null : { transform: n.estilo.transform, left: n.estilo.left, right: n.estilo.right, w: n.estilo.width },
      hover: h === undefined ? null : { transform: h.estilo.transform, left: h.estilo.left, right: h.estilo.right, w: h.estilo.width },
      declarada: dec.duracion === null ? null : `${dec.duracion} ms + ${dec.retardo} ms · ${dec.curva}`,
      arranca: tE === null ? null : tres(tE.desde - E1),
      termina: tE === null ? null : tres(tE.hasta - E1),
      sombra: n === undefined ? '' : n.estilo.boxShadow,
      filtro: n === undefined ? '' : n.estilo.filter,
      fondo: n === undefined ? '' : n.estilo.backgroundImage,
    }
  })

  // ── Los píxeles: el ancla sale del hover pleno ────────────────────────
  const capturaHover = m.capturas.find((c) => c.estado === '3-hover-pleno')
  let banda: { desde: number; hasta: number; signo: number } | undefined
  let extension: readonly [number, number] | null = null
  if (capturaHover !== undefined && existsSync(capturaHover.archivo)) {
    const img = decodificarPng(readFileSync(capturaHover.archivo))
    const r = rayaEn(img)
    // ⚠️ La referencia del 0 % al 100 % es la CORRIDA MÁS LARGA y no el primer
    // y el último tramo: en la escena de la referencia hay un borde horizontal
    // propio 69 px a la derecha del botón que caía en la misma fila y estiraba
    // la regla un 38 %.
    let mejor: readonly [number, number] | null = null
    for (const t of r.tramos) if (mejor === null || t[1] - t[0] > mejor[1] - mejor[0]) mejor = t
    banda = { desde: r.fila - 6, hasta: r.fila + 6, signo: r.signo }
    extension = mejor
  }
  const enPorciento = (x: number): number =>
    extension === null ? x : Math.round(((x - extension[0]) / (extension[1] - extension[0])) * 1000) / 10

  const pixeles: Record<string, unknown>[] = []
  for (const c of [...m.capturas, ...m.tira]) {
    if (!existsSync(c.archivo)) continue
    const img = decodificarPng(readFileSync(c.archivo))
    const r = rayaEn(img, banda)
    const pico = picoDeLuz(img, r.fila - 14, r.fila + 14)
    pixeles.push({
      estado: c.estado,
      instante: /^tira-\d+$/.test(c.estado) ? Number(c.estado.replace(/\D/g, '')) : null,
      fila: r.fila,
      corridaMasLarga: r.corrida,
      signo: r.signo > 0 ? 'clara' : 'oscura',
      tramos: r.tramos.map(([a, b]) => `${a}-${b}`),
      tramosEnPorciento: r.tramos
        .filter(([a, b]) => enPorciento(b) > -12 && enPorciento(a) < 112)
        .map(([a, b]) => `${enPorciento(a)}–${enPorciento(b)}`),
      sinRaya: r.corrida === 0,
      luzEnLaFila: r.perfil.maximo,
      luzEnX: r.perfil.enX,
      luzEnXPorciento: r.perfil.enX < 0 ? null : enPorciento(r.perfil.enX),
      picoEnLaBanda: pico.maximo,
      picoEnX: pico.x,
    })
  }

  // ── El regreso: reposo contra después de salir ────────────────────────
  const diferencias = difiere(m.reposo, m.despuesDeSalir, m.reposo.map((n) => n.clave))
  const segundaEntrada = E2 === undefined ? null : tres(E2 - E1)

  return {
    id: m.id,
    nombre: m.nombre,
    papeles: p,
    inventario,
    estados: {
      reposo: interesantes.map((c) => ({ nodo: c, ...resumen(estadoDe(m.reposo, c)) })),
      hoverPleno: interesantes.map((c) => ({ nodo: c, ...resumen(estadoDe(m.hoverPleno, c)) })),
      despuesDeSalir: interesantes.map((c) => ({ nodo: c, ...resumen(estadoDe(m.despuesDeSalir, c)) })),
    },
    declaradas,
    entrada,
    salida: salidaTramos,
    subrayado: { capas: capas.map((c) => ({ clave: c.clave, ancho: c.ancho, origenX: c.origen })), muestrasDelHueco },
    brillo,
    pixeles,
    regreso: {
      anclas: { entrada1: E1, salida1: S1, entrada2: E2 },
      segundaEntradaTrasLaPrimera: segundaEntrada,
      propiedadesQueNoVolvieron: diferencias.length,
      detalle: diferencias.slice(0, 20),
      cuadros: m.grabacion.cuadros,
      dtP50: m.grabacion.dtP50,
      dtP95: m.grabacion.dtP95,
      dtMax: m.grabacion.dtMax,
    },
  }
}

function resumen(e: Record<string, string>): Record<string, string> {
  const m = leerMatriz(e.transform ?? 'none')
  const d = m === null ? null : descomponer(m)
  return {
    transform: e.transform ?? '',
    giro: d === null ? '' : `${d.giroGrados}°`,
    escalaX: d === null ? '' : String(d.escalaX),
    traslacion: d === null ? '' : `${d.x} · ${d.y}`,
    opacity: e.opacity ?? '',
    clipPath: e.clipPath ?? '',
    width: e.width ?? '',
    height: e.height ?? '',
    transformOrigin: e.transformOrigin ?? '',
    borderBottom: `${e.borderBottomWidth ?? ''} ${e.borderBottomStyle ?? ''} ${e.borderBottomColor ?? ''}`.trim(),
    backgroundColor: e.backgroundColor ?? '',
    boxShadow: e.boxShadow ?? '',
    filter: e.filter ?? '',
    transition: `${e.transitionProperty ?? ''} ${e.transitionDuration ?? ''} ${e.transitionTimingFunction ?? ''} ${e.transitionDelay ?? ''}`.trim(),
  }
}

function principal(): void {
  const todo: Salida[] = []
  for (const id of IDS) {
    const ruta = `${CRUDO}/${id}-crudo.json`
    if (!existsSync(ruta)) {
      console.log(`  (falta ${ruta} — se saltea)`)
      continue
    }
    const m = JSON.parse(readFileSync(ruta, 'utf8')) as MedidaDelBoton
    const a = analizar(m)
    todo.push(a)
    console.log(`\n════ ${a.nombre}`)
    console.log('  papeles:', JSON.stringify(a.papeles))
    console.log('  declaradas:')
    for (const d of a.declaradas) {
      console.log(`     ${String(d.nodo).padEnd(32)} ${String(d.propiedad).padEnd(15)} ${String(d.duracion).padStart(5)} ms + ${String(d.retardo).padStart(4)} ms · ${d.curva}`)
    }
    console.log('  al ENTRAR (observado):')
    for (const e of a.entrada) {
      const c = e.contraste as { desvioMaximo: number; muestras: number } | null
      console.log(
        `     ${String(e.nodo).padEnd(32)} ${String(e.propiedad).padEnd(15)} ${String(e.arranca).padStart(7)} → ${String(e.termina).padStart(7)} ms  (${String(e.muestras).padStart(3)} muestras)` +
          (c === null ? '' : `  desvío máx vs la curva declarada: ${c.desvioMaximo}`),
      )
    }
    console.log('  al SALIR (observado):')
    for (const e of a.salida) {
      console.log(
        `     ${String(e.nodo).padEnd(32)} ${String(e.propiedad).padEnd(15)} ${String(e.arranca).padStart(7)} → ${String(e.termina).padStart(7)} ms  (${String(e.muestras).padStart(3)} muestras)${e.instantaneo === true ? '   ⚡ UN SOLO CUADRO' : ''}`,
      )
    }
    console.log('  subrayado — tramo pintado y hueco (en % del ancho):')
    for (const h of a.subrayado.muestrasDelHueco as Record<string, unknown>[]) {
      console.log(
        `     t+${String(h.t).padStart(4)}  cubre ${(h.cubierto as string[]).join(' + ').padEnd(28)} hueco ${(h.huecos as string[]).join(' + ').padEnd(24)} ancho ${String(h.anchoDelHueco).padStart(6)} centro ${String(h.centroDelHueco).padStart(6)}`,
      )
    }
    console.log('  píxeles de la tira:')
    for (const px of a.pixeles) {
      console.log(
        `     ${String(px.estado).padEnd(18)} fila ${String(px.fila).padStart(3)} (${px.signo}, corrida ${String(px.corridaMasLarga).padStart(3)})  tramos% ${(px.tramosEnPorciento as string[]).join(' | ').padEnd(26)} luz máx en la fila ${String(px.luzEnLaFila).padStart(6)} en ${String(px.luzEnXPorciento).padStart(6)}%`,
      )
    }
    console.log('  regreso:', JSON.stringify(a.regreso.propiedadesQueNoVolvieron), 'propiedades distintas entre reposo y después de salir')
    if ((a.regreso.propiedadesQueNoVolvieron as number) > 0) console.log('     ', JSON.stringify(a.regreso.detalle))
    console.log('  brillo:', JSON.stringify(a.brillo, null, 2))
  }
  const ruta = guardarJson('tablas', { instrumento: 'scripts-boton/c-tabla.ts', cuando: new Date().toISOString(), botones: todo })
  console.log(`\n  destilado → ${ruta}`)
}

principal()
