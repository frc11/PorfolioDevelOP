/**
 * PULIDO 1 — el invariante: npm run test:s52-pulido-1
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   P12 · el texto de Trabajos sobre el logo de noche, en el teléfono y la tablet: halo denso + velo detrás de la bajada.
 *   Las banderas del sprint (apagadas en el producto; en la URL, con `?pruebas=` o sueltas: `?cta=a`).
 *   P2  · el rebobinado del encastre: proporcional a lo avanzado, con tope de 1,6 s y curva in-out; el quieto vuelve con él.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-1.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-1/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido, pedidoDeLaUrl } from '../escena/entorno'
import { FINAL_DEL_PIE, REBOBINADO, RELOJ_DEL_FINAL, duracionDelRebobinado, haciaCero, pasoDelReloj, quietoRebobinado, relojQuieto, type EntradaDelReloj, type RelojDelFinal } from '../escena/final/recorridoDelFinal'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const R = RELOJ_DEL_FINAL
const DT = 1 / 60
type PasoDelReloj = (r: RelojDelFinal, e: EntradaDelReloj, dt: number) => void
const AL_FONDO: EntradaDelReloj = { alFondo: true, pieEntero: true, rebobinar: false, haciaAbajo: false, sinGestoS: 0, enViaje: false }

// ═══════════════════════════════════════════════════════════════════════════
titulo('P12 · Teléfono y tablet: el texto de Trabajos se lee sobre el logo de noche (AA, como sobre la noche)')

// El halo de C1 (nocturno final) era UNA sombra fina y difusa: medido a 390, sobre el logo la bajada del cartel quedaba en
// mediana 3,2–4,4:1 y la de las demos en 3,5–4,7 (la mitad de sus píxeles bajo AA). Ahora, abajo de 1024: el halo denso
// (la misma sombra corta apilada, la receta de D2) y un VELO del color de la noche detrás de la bajada (oscurece el logo
// sólo ahí; sobre la noche no se ve). Medido: sobre el logo, la bajada en mediana 10–12:1, lo mismo que sobre la noche.
const banda = leer('_estilos/banda.css')
const enLaBanda = (css: string): string => css.slice(css.indexOf('@media (width < 1024px) {'), css.indexOf('/* ── HOVER DONDE HAY'))
/** ¿El halo es denso? Al menos tres sombras cortas iguales del color del fondo, apiladas (la opacidad se suma). */
const haloDenso = (css: string): boolean => {
  const m = /--halo-sobre-la-escena: ([^;]+);/.exec(css)
  if (m === null) return false
  const sombras = m[1].split(/,(?![^(]*\))/).map((s) => s.trim())
  const cortas = sombras.filter((s) => /^0 0 0\.1em var\(--color-fondo\)$/.test(s)).length
  return cortas >= 3
}
/** ¿La bajada del cartel y el texto de las demos llevan el velo, con al menos 70 % del fondo? */
const conVelo = (css: string): boolean => {
  const velo = /--velo-sobre-la-escena: color-mix\(in srgb, var\(--color-fondo\) (\d+)%, transparent\);/.exec(css)
  const regla = /\[data-v3\] \[data-panel='trabajos'\] \[data-pieza='cartel'\] p,\s*\[data-v3\] \[data-panel='trabajos'\] \[data-capa='demos'\] \[data-pieza='texto'\] \{\s*background-color: var\(--velo-sobre-la-escena\);\s*box-shadow: var\(--sombra-del-velo\);/.test(css)
  const sombra = /--sombra-del-velo: 0 0 [0-9.]+em [0-9.]+em var\(--velo-sobre-la-escena\);/.test(css)
  return velo !== null && Number(velo[1]) >= 70 && regla && sombra
}
const p12Bien = (css: string): boolean => haloDenso(enLaBanda(css)) && conVelo(enLaBanda(css))
afirmar(haloDenso(enLaBanda(banda)), 'abajo de 1024 el halo del texto de Trabajos es denso: la misma sombra corta del fondo apilada (no una sola fina y difusa)')
afirmar(conVelo(enLaBanda(banda)), 'abajo de 1024 la bajada del cartel y el texto de las demos llevan un velo del color de la noche (≥ 70 %): oscurece el logo sólo detrás del texto')
// El código anterior (el halo de C1, sin velo): este invariante lo VE.
const HALO_DE_C1 = `@media (width < 1024px) {
  [data-v3] [data-panel='trabajos'] {
    --halo-sobre-la-escena: 0 0 0.06em var(--color-fondo), 0 0 0.2em color-mix(in srgb, var(--color-fondo) 90%, transparent), 0 0 0.6em color-mix(in srgb, var(--color-fondo) 55%, transparent);
  }

  [data-v3] [data-panel='trabajos'] [data-pieza='cartel'],
  [data-v3] [data-panel='trabajos'] [data-capa='demos'] {
    text-shadow: var(--halo-sobre-la-escena);
  }
}
/* ── HOVER DONDE HAY`
controlPositivo('el detector VE el halo de C1 (el código anterior: fino, sin velo)', HALO_DE_C1, p12Bien)
controlPositivo('y un velo demasiado tenue (50 %)', banda.replace(/(--velo-sobre-la-escena: color-mix\(in srgb, var\(--color-fondo\) )\d+%/, '$150%'), p12Bien)
// Escritorio no cambia: nada del velo fuera de la banda de abajo de 1024.
const fueraDeLaBanda = banda.replace(enLaBanda(banda), '')
afirmar(!/velo-sobre-la-escena|sombra-del-velo/.test(fueraDeLaBanda), 'desde 1024 nada cambia: el velo y su sombra viven sólo en la banda de abajo de 1024')

// ═══════════════════════════════════════════════════════════════════════════
titulo('Banderas del sprint: apagadas en el producto; con banco en el pedido; sin él, en la URL (`?pruebas=` o sueltas)')

// Cada punto con una alternativa o con variantes para elegir las deja atrás de una prueba: P2 `rebobinado=minimo`, P6
// `angel=asentado`, P1 `brillo=suave|fuerte` (el producto es `medio`), P17 `cta=a|b|c|d`, P22 `encastre=desvanece`.
const PEDIDAS: Readonly<Record<(typeof PRUEBAS_SUELTAS)[number], readonly string[]>> = { rebobinado: ['minimo'], angel: ['asentado'], brillo: ['suave', 'fuerte'], cta: ['a', 'b', 'c', 'd'], encastre: ['desvanece'] }
type Traductor = typeof entornoPedido
const banderasBien = (f: Traductor): boolean => {
  const apagadas = PRUEBAS_SUELTAS.every((k) => f('producto').pruebas[k] === 'no' && ENTORNO.pruebas[k] === 'no')
  const pedidas = PRUEBAS_SUELTAS.every((k) => PEDIDAS[k].every((v) => f(`producto,${k}=${v}`).pruebas[k] === v))
  const otras = PRUEBAS_SUELTAS.every((k) => f(`producto,${k}=cualquiera`).pruebas[k] === 'no')
  const juntas = f('producto,cta=b,brillo=fuerte,angel=asentado').pruebas
  return apagadas && pedidas && otras && juntas.cta === 'b' && juntas.brillo === 'fuerte' && juntas.angel === 'asentado' && f('producto,brillo=medio').pruebas.brillo === 'no' && f('producto,cta=b').E1 === ENTORNO.E1
}
afirmar(banderasBien(entornoPedido), 'cada prueba del sprint se pide por su nombre y vale sólo sus valores (otro valor es el producto); van juntas; en el producto están todas apagadas (`brillo=medio` es el producto)', PRUEBAS_SUELTAS.join(' · '))
controlPositivo('el detector VE un traductor que acepta cualquier valor', ((pedido: string) => {
  const e = entornoPedido(pedido)
  const cta = /cta=(\w+)/.exec(pedido)
  return cta === null ? e : { ...e, pruebas: { ...e.pruebas, cta: cta[1] as 'a' } }
}) as Traductor, banderasBien)
type DeLaUrl = typeof pedidoDeLaUrl
const urlBien = (f: DeLaUrl): boolean => {
  const sueltas = f('?cta=a&brillo=fuerte')
  const ambas = f('?pruebas=pie=antes&angel=asentado')
  return f('') === null && f('?otra=1') === null && sueltas !== null && entornoPedido(sueltas).pruebas.cta === 'a' && entornoPedido(sueltas).pruebas.brillo === 'fuerte' && ambas !== null && entornoPedido(ambas).pruebas.pie === 'antes' && entornoPedido(ambas).pruebas.angel === 'asentado' && PRUEBAS_SUELTAS.every((k) => f(`?${k}=${PEDIDAS[k][0]}`) !== null)
}
afirmar(urlBien(pedidoDeLaUrl) && /pedidoDeLaUrl\(window\.location\.search\)/.test(leer('_lib/escena/entorno.ts')), 'sin banco, la URL las pide también sueltas (`/v3?cta=a`, `/v3?brillo=fuerte`) y con `?pruebas=`; sin nada, el producto')
controlPositivo('el detector VE una URL que sólo lee `?pruebas=` (las sueltas no llegarían)', ((b: string) => {
  const v = new URLSearchParams(b).get('pruebas')
  return v === null ? null : `producto,${v}`
}) as DeLaUrl, urlBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P2 · El rebobinado del encastre, más rápido: proporcional a lo avanzado, con tope de 1,6 s y curva in-out')

// El mecanismo de A1 (un gesto, solo, hasta el logo parado; el reinicio a los 2,5 s) no cambia: cambia la velocidad. Antes
// rebobinaba a la velocidad de la cinemática (6,4 s desde el final entero; medido en la página: 3,5 s desde la mitad).
interface Rebobinado { readonly dura: number; readonly primerPaso: number; readonly ultimoPaso: number; readonly pico: number; readonly monotono: boolean; readonly fase: string }
/** Desde `desde` (fin), UN gesto y nada más: cuánto tarda, sus pasos y si baja siempre. */
const rebobinarDesde = (paso: PasoDelReloj, desde: number): Rebobinado => {
  const r = relojQuieto()
  for (let i = 0; i < 1200 && r.fin < desde; i += 1) paso(r, AL_FONDO, DT)
  r.fin = desde
  paso(r, { ...AL_FONDO, rebobinar: true }, DT)
  const pasos: number[] = []
  let t = DT
  let antes = r.fin
  for (let i = 0; i < 1200 && r.fin > 0; i += 1) {
    paso(r, { ...AL_FONDO, sinGestoS: t }, DT)
    t += DT
    pasos.push(antes - r.fin)
    antes = r.fin
  }
  const pico = Math.max(...pasos)
  return { dura: r.fin === 0 ? t : Number.POSITIVE_INFINITY, primerPaso: pasos[1] ?? 0, ultimoPaso: pasos[pasos.length - 1] ?? 0, pico, monotono: pasos.every((p) => p >= -1e-9), fase: r.fase }
}
const DESDES = [0.1, 0.25, 0.5, 0.75, 1] as const
const rebobinadoBien = (paso: PasoDelReloj): boolean =>
  DESDES.every((d) => {
    const x = rebobinarDesde(paso, d)
    // Proporcional (± dos cuadros), nunca más de 2 s, quieto al salir y al llegar (in-out), siempre hacia atrás, y parada.
    return Math.abs(x.dura - REBOBINADO.topeS * d) <= 2 * DT + 1e-6 && x.dura <= 2 && (d < 0.5 || (x.primerPaso < 0.25 * x.pico && x.ultimoPaso < 0.25 * x.pico)) && x.monotono && x.fase === 'parada'
  })
const desdeUno = rebobinarDesde(pasoDelReloj, 1)
afirmar(rebobinadoBien(pasoDelReloj), 'UN gesto rebobina en un tiempo proporcional a lo avanzado (desde el final entero, 1,6 s; desde la mitad, 0,8 s), nunca más de 2 s, con una curva in-out suave (arranca y llega quieto) y termina parada', `desde 1: ${desdeUno.dura.toFixed(2)} s · tope ${String(REBOBINADO.topeS)} s`)
const comoAntes: PasoDelReloj = (r, e, dt) => {
  // El de NOCTURNO FINAL A1: hacia atrás a la velocidad de la cinemática.
  if (r.fase === 'rebobina') {
    r.fin = Math.max(0, r.fin - dt / R.duracionS)
    if (r.fin === 0) {
      r.fase = 'parada'
      r.paradaS = 0
    }
    return
  }
  pasoDelReloj(r, e, dt)
}
controlPositivo('el detector VE el rebobinado de antes (a la velocidad de la cinemática: 6,4 s desde el final)', comoAntes, rebobinadoBien)
const lineal: PasoDelReloj = (r, e, dt) => {
  if (r.fase === 'rebobina') {
    r.fin = Math.max(0, r.fin - dt / REBOBINADO.topeS)
    if (r.fin === 0) {
      r.fase = 'parada'
      r.paradaS = 0
    }
    return
  }
  pasoDelReloj(r, e, dt)
}
controlPositivo('  y uno del mismo largo pero lineal (sin la curva in-out: arranca y frena de golpe)', lineal, rebobinadoBien)

// El quieto (el giro y el alejamiento del que se quedó) vuelve en el MISMO tiempo y con la misma curva: desde cualquier
// punto, todo vuelve en a lo sumo 1,6 s. Antes volvía por su cuenta con tope (90°/s): media vuelta tardaba más de 2 s.
const quietoBien = (f: typeof quietoRebobinado): boolean => {
  const estado = { giro: 0, aleja: 0, giroV: 0, alejaV: 0 }
  const alEmpezar = { giro: 179, aleja: 17 }
  let bien = true
  for (const queda of [1, 0.6, 0.25, 0]) {
    f(alEmpezar, queda, estado)
    bien = bien && Math.abs(estado.giro - 179 * queda) < 1e-6 && Math.abs(estado.aleja - 17 * queda) < 1e-6
  }
  return bien && estado.giro === 0 && estado.aleja === 0
}
afirmar(quietoBien(quietoRebobinado), '  el giro y el alejamiento del quieto vuelven con lo que queda del rebobinado (el mismo reloj y la misma curva que el logo)')
controlPositivo('  el detector VE un quieto que vuelve por su cuenta', ((a: { giro: number; aleja: number }, q: number, e: { giro: number; aleja: number }) => {
  e.giro = a.giro * Math.max(0, q - 0.1)
  e.aleja = a.aleja
}) as typeof quietoRebobinado, quietoBien)
const cuadro = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
afirmar(/fase === 'rebobina'[\s\S]{0,400}quietoRebobinado\(/.test(cuadro), '  y el cuadro del final lo usa mientras rebobina (en vez de la vuelta con tope de `relojDelQuieto`)')
// Media vuelta con la vuelta de antes (tope 90°/s y freno 140°/s²) tardaba más de 2 s: por eso el quieto va con el rebobinado.
let mediaVuelta = { x: 180, v: 0 }
let tMedia = 0
for (let i = 0; i < 1200 && mediaVuelta.x !== 0; i += 1) {
  const h = haciaCero(mediaVuelta.x, mediaVuelta.v, FINAL_DEL_PIE.quieto.vuelta.giroS, FINAL_DEL_PIE.quieto.vuelta.giroFreno, DT)
  mediaVuelta = { x: h.x, v: h.v }
  tMedia += DT
}
afirmar(tMedia > 2, '  (con la vuelta con tope, media vuelta del quieto tardaba más de 2 s: el motivo de atarlo al rebobinado)', `${tMedia.toFixed(2)} s`)

// La otra lectura del pedido («entre 1 y 2 s desde cualquier punto»), atrás de `?rebobinado=minimo`: nunca menos de 1 s.
const minimoBien = (f: typeof duracionDelRebobinado): boolean => [0.05, 0.3, 0.6].every((d) => f(d, REBOBINADO.minimoS) >= 1 && f(d, REBOBINADO.minimoS) <= 2) && f(1, REBOBINADO.minimoS) === REBOBINADO.topeS && f(0.05) < 0.1
afirmar(minimoBien(duracionDelRebobinado) && entornoPedido('producto,rebobinado=minimo').pruebas.rebobinado === 'minimo' && ENTORNO.pruebas.rebobinado === 'no', '  la alternativa `?rebobinado=minimo` (al menos 1 s desde cualquier punto) existe y está apagada en el producto')
controlPositivo('  el detector VE una alternativa que no pone el mínimo', ((d: number) => REBOBINADO.topeS * d) as typeof duracionDelRebobinado, minimoBien)

cerrar('s52-pulido-1')
