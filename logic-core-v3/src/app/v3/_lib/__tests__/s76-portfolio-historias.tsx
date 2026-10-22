/**
 * [B1.2d B] s76 · LAS HISTORIAS, EL COMPONENTE COMÚN (`_componentes/historias/`, P-H19 y P-H31), sin navegador. Cada afirmación con su
 * control positivo.
 *
 * [B1.2e] Las historias se fueron del Portfolio (debajo de 1024 es el carrusel: `s76-portfolio-carrusel.tsx`); el componente común queda
 * porque lo usa el precio de servicios. Lo que fijaba su uso en el Portfolio (§27 el modo, §28 la ficha corta, §31 la entrada, §42 el
 * orden de F5 y F5b, y el cableado de §30) se reemplazó por la spec del carrusel, con su control; acá queda lo del componente: la máquina
 * (§29, con una lista de cuatro de prueba en lugar de los ítems del Portfolio), el freno del arrastre y el tic (§30) y lo de servicios (§43).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import type { MotionValue } from 'motion/react'
import type { ReactNode } from 'react'

import { BARRAS_SOBRE_ACENTO, Historias, type ColorDeLasBarras } from '../../_componentes/historias/Historias'
import {
  ESTADO_INICIAL, HISTORIAS, barrasDeLasHistorias, gestoDelPuntero, siguienteDeLasHistorias,
  type EstadoDeLasHistorias, type EventoDeLasHistorias, type ItemDeHistoria, type PasoDeLasHistorias,
} from '../../_componentes/historias/maquinaDeLasHistorias'
import { marcar } from '../../_secciones/_invariantes/render'
import { recorteDiagonal } from '../../_componentes/historias/corteDiagonal'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const veces = (html: string, aguja: string): number => html.split(aguja).length - 1

type Maquina = (e: EstadoDeLasHistorias, ev: EventoDeLasHistorias, items: readonly ItemDeHistoria[], d?: number) => PasoDeLasHistorias
/** Una serie de eventos desde el arranque: el último estado, las salidas y cuántos tics. */
function correr(m: Maquina, items: readonly ItemDeHistoria[], eventos: readonly EventoDeLasHistorias[]): { readonly e: EstadoDeLasHistorias; readonly salidas: string[]; readonly tics: number } {
  let e = ESTADO_INICIAL
  const salidas: string[] = []
  let tics = 0
  for (const ev of eventos) {
    const p = m(e, ev, items)
    e = p.estado
    if (p.salida !== null) salidas.push(p.salida)
    if (p.porElUsuario) tics += 1
  }
  return { e, salidas, tics }
}

export function afirmarLasHistorias(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 29 · P-H19 · Las historias, puras y comunes: con 3 pasos (el precio de servicios) y con 4, el último sin tiempo')

  const TRES: readonly ItemDeHistoria[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  const tiempo = (ms: number): EventoDeLasHistorias => ({ tipo: 'tiempo', ms })
  const reglas = (m: Maquina): boolean => {
    const arranque = correr(m, TRES, [tiempo(3000), { tipo: 'toque', fraccion: 0.9 }])
    const pasa = correr(m, TRES, [tiempo(HISTORIAS.duracionMs - 1), tiempo(2)])
    const pausada = correr(m, TRES, [{ tipo: 'mantener' }, tiempo(HISTORIAS.duracionMs * 2)])
    const suelta = correr(m, TRES, [{ tipo: 'mantener' }, { tipo: 'soltar' }, tiempo(HISTORIAS.duracionMs)])
    const atras = correr(m, TRES, [{ tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.1 }])
    const costados = correr(m, TRES, [{ tipo: 'deslice', dx: -80, dy: 5 }, { tipo: 'deslice', dx: -80, dy: 5 }, { tipo: 'deslice', dx: 80, dy: -5 }])
    const arriba = correr(m, TRES, [{ tipo: 'deslice', dx: 4, dy: -120 }])
    const abajo = correr(m, TRES, [{ tipo: 'deslice', dx: 4, dy: 120 }])
    const ultimo = correr(m, TRES, [tiempo(HISTORIAS.duracionMs), tiempo(HISTORIAS.duracionMs), tiempo(HISTORIAS.duracionMs * 3)])
    const despues = correr(m, TRES, [{ tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.9 }])
    return arranque.e.indice === 1 && arranque.e.transcurridoMs === 0 && arranque.e.reinicio === 1 &&
      pasa.e.indice === 1 && pasa.tics === 0 && pausada.e.indice === 0 && suelta.e.indice === 1 &&
      atras.e.indice === 0 && atras.tics === 2 && costados.e.indice === 1 && costados.tics === 3 &&
      arriba.salidas.join() === 'adelante' && abajo.salidas.join() === 'atras' && arriba.e.indice === 0 &&
      ultimo.e.indice === 2 && ultimo.salidas.length === 0 && despues.e.indice === 2 && despues.salidas.join() === 'adelante'
  }
  afirmar(reglas(siguienteDeLasHistorias), 'cada ítem arranca de cero (`reinicio` lo vuelve a montar); a los 10 s pasa solo (sin sonar); mantener pausa y soltar sigue; un toque a la izquierda vuelve y a la derecha avanza; de costado, igual; arriba sale adelante y abajo atrás; el último con tiempo se queda lleno; después del último, un toque sale')
  controlPositivo('  el detector ve una máquina que no pausa (mantener no frena el tiempo)', ((e, ev, it, d) => siguienteDeLasHistorias({ ...e, pausada: false }, ev, it, d)) as Maquina, reglas)
  controlPositivo('  y una que suena con el tiempo (dos sonidos por historia: el de B1.3)', ((e, ev, it, d) => {
    const r = siguienteDeLasHistorias(e, ev, it, d)
    return { ...r, porElUsuario: r.estado.indice !== e.indice }
  }) as Maquina, reglas)
  // [B1.2e] Una lista de cuatro de prueba, la última sin tiempo (eran los ítems del Portfolio, que ya no usa las historias).
  const CUATRO: readonly ItemDeHistoria[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd', sinTiempo: true }]
  const conLaTuya = (m: Maquina): boolean => {
    const quieta = correr(m, CUATRO, [{ tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.9 }, { tipo: 'toque', fraccion: 0.9 }, tiempo(HISTORIAS.duracionMs * 5)])
    const enfocada = correr(m, CUATRO, [{ tipo: 'foco', adentro: true }, { tipo: 'toque', fraccion: 0.9 }, { tipo: 'deslice', dx: -90, dy: 0 }, tiempo(HISTORIAS.duracionMs * 2)])
    return quieta.e.indice === 3 && quieta.salidas.length === 0 && enfocada.e.indice === 0 && enfocada.salidas.length === 0
  }
  afirmar(CUATRO.length === 4 && CUATRO[3]?.sinTiempo === true && conLaTuya(siguienteDeLasHistorias), '  con cuatro, el último sin tiempo se queda hasta que el usuario sale; con un campo enfocado, nada avanza (ni el tiempo, ni un toque, ni un deslice)')
  controlPositivo('  el detector ve una máquina que no mira el foco', ((e, ev, it, d) => siguienteDeLasHistorias({ ...e, enfocada: false }, ev, it, d)) as Maquina, conLaTuya)
  afirmarIgual([gestoDelPuntero(3, 4, false), gestoDelPuntero(30, 2, false), gestoDelPuntero(1, 1, true)], ['toque', 'deslice', 'nada'], '  el puntero: hasta 10 px es un toque; más, un deslice; si se mantuvo (pausó), al soltar no es nada')
  afirmarIgual(barrasDeLasHistorias({ ...ESTADO_INICIAL, indice: 1, transcurridoMs: HISTORIAS.duracionMs / 2 }, TRES), [1, 0.5, 0], '  las barras: las vistas llenas, la de ahora con su avance (lineal en 10 s), las que vienen vacías')
  const montadas = marcar(<Historias items={TRES} etiqueta="El precio" rotulos={{ anterior: 'Anterior', siguiente: 'Siguiente' }} alSalir={() => undefined} renderItem={(it) => <p data-item={it.id}>{it.id}</p>} />, { anima: true })
  const conTres = (m: string): boolean =>
    /<div role="group" aria-roledescription="historias" aria-label="El precio" data-pieza="historias" data-indice="0"/.test(m) && veces(m, 'data-parte="barra"') === 3 && /data-item="a"/.test(m) && !/data-item="b"/.test(m) &&
    /<button type="button" data-toque="anterior" class="sr-only">Anterior<\/button>/.test(m) && /touch-none/.test(m)
  afirmar(conTres(montadas), '  montadas FUERA del Portfolio con tres pasos: un grupo con nombre, tres barras, sólo el primer ítem pintado y los dos controles del teclado')
  controlPositivo('  el detector ve unas historias con una barra de más (cuatro fijas)', montadas.replace('data-parte="barra"', 'data-parte="barra"></span><span data-parte="barra"'), conTres)
  const comunes = ['_componentes/historias/maquinaDeLasHistorias.ts', '_componentes/historias/Historias.tsx'].map((r) => sinComentarios(leer(r))).join('\n')
  const independientes = (c: string): boolean => !/PortfolioVivo|usePortfolio|data-panel|_secciones\/trabajos/.test(c)
  afirmar(independientes(comunes), '  y no dependen del Portfolio: ni `PortfolioVivo` ni `[data-panel]` (lo propio entra por `items`, `renderItem` y `alSalir`)')
  controlPositivo('  el detector ve una pieza que lee el Portfolio', `${comunes}\nimport type { PortfolioVivo } from '../../_secciones/trabajos/portfolio/usePortfolio'`, independientes)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 30 · T8 y T1 · El dedo no mueve la página mientras corren, y un solo sonido por toque')

  // [P-H31b] Reemplazada por la spec (servicios: «el freno de arrastre del Portfolio pasa al componente: que lo tenga cualquier uso»): el
  // freno vive en el componente común y frena mientras las historias están montadas y presentes. [B1.2e] Lo del Portfolio (la rueda que
  // salía, el asentamiento de B1.3) se fue con sus historias: queda lo del componente.
  const freno = sinComentarios(leer('_componentes/historias/frenoDelArrastre.ts'))
  const conFreno = sinComentarios(leer('_componentes/historias/Historias.tsx'))
  const quieto = ([s, c]: readonly [string, string]): boolean =>
    /document\.addEventListener\('touchmove', frenar, \{ passive: false \}\)/.test(s) && /closest\('\[data-lenis-prevent\]'\)/.test(s) &&
    /const presentes = useIsPresent\(\)\s*useFrenoDelArrastre\(presentes\)/.test(c)
  afirmar(quieto([freno, conFreno]), 'mientras corren (montadas y presentes), el dedo no mueve la página (fuera de un diálogo): lo frena el componente común, en cualquier uso')
  controlPositivo('  el detector ve unas historias sin el freno', [freno, conFreno.replace('useFrenoDelArrastre(presentes)', '')] as const, quieto)
  controlPositivo('  y un freno que sigue frenando durante la salida (montadas, ya no presentes)', [freno, conFreno.replace('useFrenoDelArrastre(presentes)', 'useFrenoDelArrastre(true)')] as const, quieto)
  const componente = sinComentarios(leer('_componentes/historias/Historias.tsx'))
  const unSonido = (c: string): boolean => /if \(p\.porElUsuario\) sonar\('tic'\)/.test(c) && /onPointerUp=\{alSubir\}/.test(c) && !/<button[^>]*onClick=\{\(\) => aplicar\.current\(\{ tipo: 'toque', fraccion: 0\.8/.test(c)
  afirmar(unSonido(componente), '  un toque es del puntero sobre la superficie (no un botón: el sonido global no suma un «clic») y suena UN tic, sólo si el cambio lo pidió un gesto')
  controlPositivo('  el detector ve el tic de cada cambio, también el del tiempo', componente.replace('if (p.porElUsuario) sonar(\'tic\')', 'if (p.estado.indice !== antes.indice) sonar(\'tic\')'), unSonido)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('P-H31 · 43 · Para el precio de servicios: una transición propia, el freno en cualquier uso y las barras sobre el acento')

  // a · La transición entra por prop: el ítem va envuelto (en reposo, en 1) y, sin cambio, no hay un saliente. Sin ella, el Portfolio tal cual.
  const Sonda = ({ avance, sentido, children }: { readonly avance: MotionValue<number>; readonly sentido: 1 | -1; readonly children: ReactNode }): React.JSX.Element => (
    <div data-parte="sonda" data-avance={String(avance.get())} data-sentido={String(sentido)}>{children}</div>
  )
  const conLasNuevas = marcar(<Historias items={TRES} etiqueta="El precio" rotulos={{ anterior: 'Anterior', siguiente: 'Siguiente' }} alSalir={() => undefined} renderItem={(it) => <p data-item={it.id}>{it.id}</p>} transicion={{ ms: 600, Envoltorio: Sonda }} colorDeLasBarras={BARRAS_SOBRE_ACENTO} />, { anima: true })
  const envuelta = (m: string): boolean =>
    /<div data-parte="sonda" data-avance="1" data-sentido="1"><p data-item="a">a<\/p><\/div>/.test(m) && !m.includes('data-parte="saliente"') &&
    veces(m, 'style="background-color:color-mix(in srgb, var(--color-fondo) 25%, transparent)"') === 3 && !m.includes('bg-tinta')
  afirmar(envuelta(conLasNuevas), 'con `transicion`, el ítem va envuelto en la de la página (en reposo, avance 1); sin un cambio no hay saliente; con `colorDeLasBarras`, las tres barras en el papel y ninguna en la tinta')
  controlPositivo('  el detector ve el ítem sin envolver', conLasNuevas.replace('<div data-parte="sonda" data-avance="1" data-sentido="1">', '<div>'), envuelta)
  // [B1.2e] Sin el Portfolio (ya no las usa), lo que queda es el marcado por defecto: sin las dos props, el de antes.
  const marcadoPorDefecto = (m: string): boolean =>
    !m.includes('data-parte="sonda"') && !m.includes('data-parte="saliente"') && !m.includes('style="background-color') &&
    veces(m, 'class="relative h-0.5 flex-1 overflow-hidden rounded-full bg-tinta/25"') === 3 && /<span class="absolute inset-y-0 left-0 bg-tinta" style="width:0(?:\.00)?%"><\/span>/.test(m)
  afirmar(marcadoPorDefecto(montadas), '  sin las dos props, el marcado de antes: sin envoltorio, sin saliente y las barras de la tinta, con sus clases de siempre')
  controlPositivo('  el detector ve las barras del acento', conLasNuevas, marcadoPorDefecto)

  // La transición de prueba de la galería (un corte diagonal, `_componentes/historias/corteDiagonal.tsx`): crece, y desde la punta del sentido.
  // El área que deja ver un recorte (0 a 10.000, en % cuadrados), por la fórmula del cordón.
  const areaDelRecorte = (recorte: string): number => {
    if (recorte === 'none') return 10_000
    const puntos = [...recorte.matchAll(/(-?[\d.]+)% (-?[\d.]+)%/g)].map((m) => [Number(m[1]), Number(m[2])] as const)
    let doble = 0
    for (let i = 0; i < puntos.length; i++) {
      const a = puntos[i]
      const b = puntos[(i + 1) % puntos.length]
      if (a !== undefined && b !== undefined) doble += a[0] * b[1] - b[0] * a[1]
    }
    return Math.abs(doble) / 2
  }
  type Recorte = typeof recorteDiagonal
  const corteBien = (r: Recorte): boolean => ([1, -1] as const).every((s) => {
    const areas = [0, 0.25, 0.5, 0.75].map((a) => areaDelRecorte(r(a, s)))
    const punta = s === 1 ? '100% 100%' : '0% 0%'
    return (areas[0] ?? 1) < 1 && areas.every((x, k) => k === 0 || x > (areas[k - 1] ?? 0)) && r(1, s) === 'none' && r(0.1, s).includes(punta)
  })
  afirmar(corteBien(recorteDiagonal), '  el corte de prueba: de nada a todo, siempre creciendo; hacia adelante desde abajo a la derecha, hacia atrás desde arriba a la izquierda; en reposo, sin recorte')
  controlPositivo('  el detector ve un corte que no mira el sentido', ((a) => recorteDiagonal(a, 1)) as Recorte, corteBien)

  // c · Las barras sobre un acento (WCAG 1.4.11): el relleno contra el acento y contra la pista, ≥ 3:1 con los tres acentos del tema.
  const tema = leer('../theme-develop.css')
  const hex = (re: RegExp): string => re.exec(tema)?.[1] ?? '#000000'
  const PAPEL = hex(/--color-fondo:\s*(#[0-9A-Fa-f]{6})/)
  const TINTA = hex(/--color-tinta:\s*(#[0-9A-Fa-f]{6})/)
  const ACENTOS = [...tema.matchAll(/--color-acento-(web|ia-automatizacion|software):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => ({ id: m[1] ?? '', hex: m[2] ?? '#000000' }))
  type Rgb = readonly [number, number, number]
  const rgb = (h: string): Rgb => [Number.parseInt(h.slice(1, 3), 16), Number.parseInt(h.slice(3, 5), 16), Number.parseInt(h.slice(5, 7), 16)]
  const lineal = (c: number): number => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
  const luz = (c: Rgb): number => 0.2126 * lineal(c[0]) + 0.7152 * lineal(c[1]) + 0.0722 * lineal(c[2])
  const razon = (a: Rgb, b: Rgb): number => (Math.max(luz(a), luz(b)) + 0.05) / (Math.min(luz(a), luz(b)) + 0.05)
  const sobre = (c: Rgb, alfa: number, fondo: Rgb): Rgb => [c[0] * alfa + fondo[0] * (1 - alfa), c[1] * alfa + fondo[1] * (1 - alfa), c[2] * alfa + fondo[2] * (1 - alfa)]
  // Un color de la prop: `var(--color-fondo|tinta)`, o su `color-mix` con transparente al N %.
  const resolver = (css: string, fondo: Rgb): Rgb => {
    const m = /var\(--color-(fondo|tinta)\)(?: (\d+)%)?/.exec(css)
    const base = rgb(m?.[1] === 'tinta' ? TINTA : PAPEL)
    return sobre(base, m?.[2] === undefined ? 1 : Number(m[2]) / 100, fondo)
  }
  const peores = (c: ColorDeLasBarras): { readonly contraElAcento: number; readonly contraLaPista: number } => {
    const r = ACENTOS.map((a) => {
      const acento = rgb(a.hex)
      const relleno = resolver(c.relleno, acento)
      return { contraElAcento: razon(relleno, acento), contraLaPista: razon(relleno, resolver(c.pista, acento)) }
    })
    return { contraElAcento: Math.min(...r.map((x) => x.contraElAcento)), contraLaPista: Math.min(...r.map((x) => x.contraLaPista)) }
  }
  const legibles = (c: ColorDeLasBarras): boolean => ACENTOS.length === 3 && peores(c).contraElAcento >= 3 && peores(c).contraLaPista >= 3
  const peor = peores(BARRAS_SOBRE_ACENTO)
  const deLaTinta: ColorDeLasBarras = { pista: 'color-mix(in srgb, var(--color-tinta) 25%, transparent)', relleno: 'var(--color-tinta)' }
  afirmar(legibles(BARRAS_SOBRE_ACENTO), `  las barras sobre el acento: el relleno ${peor.contraElAcento.toFixed(2)}:1 contra el acento y ${peor.contraLaPista.toFixed(2)}:1 contra la pista, el peor de los tres acentos (≥ 3:1; las de la tinta daban ${peores(deLaTinta).contraElAcento.toFixed(2)}:1)`)
  controlPositivo('  el detector ve las barras de la tinta (las de antes)', deLaTinta, legibles)
  controlPositivo('  y una pista tan clara como el relleno', { ...BARRAS_SOBRE_ACENTO, pista: 'color-mix(in srgb, var(--color-fondo) 80%, transparent)' }, legibles)

}
