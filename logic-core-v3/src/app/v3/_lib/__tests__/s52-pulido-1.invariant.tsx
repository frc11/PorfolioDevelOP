/**
 * PULIDO 1 — el invariante: npm run test:s52-pulido-1
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   P12 · el texto de Trabajos sobre el logo de noche, en el teléfono y la tablet: halo denso + velo detrás de la bajada.
 *   Las banderas del sprint (apagadas en el producto; en la URL, con `?pruebas=` o sueltas: `?cta=a`).
 *   P2  · el rebobinado del encastre: proporcional a lo avanzado, con tope de 1,6 s y curva in-out; el quieto vuelve con él.
 *   P6  · el logo del intro baja con el titular: de su primera letra a la última, a velocidad constante (`?angel=asentado`).
 *   P18 · el formulario del pie abajo de 1024: vidrio líquido (el material del menú, compartido), en AA de día y de noche.
 *   P1  · el brillo del piso (rehecho en PULIDO 2 · 4: la luz sale de abajo, por las juntas): blanca, por bloque, orgánica,
 *         con su ciclo; la sala se oscurece gradual con el sector prendido. Lo nuevo de la luz lo fija `s53-pulido-2`.
 *   P22 · el encastre abajo de 1024: encuadrado, con el dedo; quieto con movimiento reducido. (El escenario y `encastre=desvanece`
 *         se borraron en PULIDO 2 · 1: el final corre detrás del pie; lo fija `s53-pulido-2`.)
 *   P5  · un viaje del menú con el encastre avanzado: dura lo mismo que cualquiera; el final vuelve en paralelo, sin saltos.
 *   P17 · el CTA del final: A, la cámara sin el techo del domo en ningún aspecto (desde arriba, con un dolly-in leve por tiempo).
 *         B/C, las variantes de prueba (`?cta=a|b|c|d`): sin bandera el CTA de hoy; cada una con entrada, hover (toque) y salida.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-1.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-1/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'

import * as THREE from 'three'

import { aimWithFraming } from '../escena/cameraFraming'
import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido, pedidoDeLaUrl } from '../escena/entorno'
import { estadoQuieto, poderSuave } from '../escena/final/cuadroDelFinal'
import { ANCLAS_DEL_HUECO, conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { LUZ_DE_ABAJO, SECTOR_DE_LA_LUZ_GLSL, prendidoDeLaLuz, zonasDeLaLuz, type ZonaDeLaLuz } from '../escena/final/luzDeAbajo'
import { CTA_EN_EL_PISO, conElEscalonEnLaSimulacion } from '../escena/ctaDelFinal/enElPiso'
import { CTA_DEL_FINAL, alturaDelEscalon, filoEn, gestoDelToque, hazDelCta, inclinacionDeLaLosa, letraDelHaz } from '../escena/ctaDelFinal/estado'
import { PORTAL_EN_VIVO } from '../escena/ctaDelFinal/portal'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { ANCLAS_DEL_DIBUJO, conOndaDirigida } from '../escena/piso/ondaDirigida'
import { CAMERA_FOV, ORBIT_TARGET_Y } from '../escena/probeScene'
import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { MOUSE_HEIGHT_FACTOR } from '../escena/choreographyPhysics'
import { buildTrack, sampleTrack } from '../escena/choreographySampler'
import { HAZ } from '../escena/entorno/vivo'
import { DOLLY_DEL_CTA, POSES_DEL_FINAL, TIEMPOS_DEL_FINAL, dollyDelCta, enElSostenDelCta, pasoDelDolly, progresoDelFinal } from '../escena/finalDelRecorrido'
import { MOIRE_FAR_RADIUS } from '../escena/probeMoire'
import {
  FINAL_DEL_PIE,
  REBOBINADO,
  RELOJ_DEL_FINAL,
  VIAJE_DEL_FINAL,
  blancoDelFinal,
  camaraDelFinal,
  distanciaDelFinalAngosto,
  duracionDelRebobinado,
  haciaCero,
  oscuroDelFinal,
  pasoDelReloj,
  poder,
  poseDelLogo,
  quedaDelRebobinado,
  quietoRebobinado,
  relojQuieto,
  subida,
  duracionDeLaVuelta,
  type EntradaDelReloj,
  type RelojDelFinal,
} from '../escena/final/recorridoDelFinal'
import { CAIDA_DEL_LOGO, altoDesdeElBorde, alturaDeLaCaida, pasoDeLaBajada } from '../escena/intro/caida'
import { persigue } from '../escena/titulos3d/llegada'
import { LLEGADA_DEL_TITULAR_S } from '../titulos3d/titular'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { CtaDelFinal, LetrasDelCta } from '../../_componentes/ctaDelFinal/CtaDelFinal'
import { PERSPECTIVA_DE_LA_PLACA, viajeDesdeElFondo, viajeDesdeElPunto } from '../../_chrome/contacto/placa'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const R = RELOJ_DEL_FINAL
const DT = 1 / 60
type PasoDelReloj = (r: RelojDelFinal, e: EntradaDelReloj, dt: number) => void
const AL_FONDO: EntradaDelReloj = { alFondo: true, pieEntero: true, rebobinar: false, haciaAbajo: false, sinGestoS: 0, viajeS: 0 }

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
/**
 * ¿La bajada del cartel y el texto de las demos llevan el velo, con al menos 70 %? [PULIDO 2] 3 · sin rectángulo: un
 * pseudo-elemento detrás del texto con un degradé radial (no el fondo del párrafo con su sombra de caja, que se leía como
 * una caja: lo fija `s53-pulido-2` §3); y en ningún lado el fondo o la sombra de caja del velo.
 */
const conVelo = (css: string): boolean => {
  const velo = /--velo-sobre-la-escena: color-mix\(in srgb, var\(--color-fondo\) (\d+)%, transparent\);/.exec(css)
  const regla = /\[data-v3\] \[data-panel='trabajos'\] \[data-pieza='cartel'\] p::before,\s*\[data-v3\] \[data-panel='trabajos'\] \[data-capa='demos'\] \[data-pieza='texto'\]::before \{[^}]*background: var\(--degrade-del-velo\);/.test(css)
  const degrade = /--degrade-del-velo: radial-gradient\(closest-side, var\(--velo-sobre-la-escena\) \d+%, transparent\);/.test(css)
  const sinCaja = !/background-color: var\(--velo-sobre-la-escena\)|--sombra-del-velo/.test(css)
  return velo !== null && Number(velo[1]) >= 70 && regla && degrade && sinCaja
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
afirmar(!/velo-sobre-la-escena|sombra-del-velo|degrade-del-velo|alcance-del-velo/.test(fueraDeLaBanda), 'desde 1024 nada cambia: el velo (y su forma) vive sólo en la banda de abajo de 1024')

// ═══════════════════════════════════════════════════════════════════════════
titulo('Banderas del sprint: apagadas en el producto; con banco en el pedido; sin él, en la URL (`?pruebas=` o sueltas)')

// Cada punto con una alternativa o con variantes para elegir las deja atrás de una prueba: P2 `rebobinado=minimo`, P6
// `angel=asentado`, P17 `cta=a|b|c|d`. (P22 `encastre=desvanece`, P5 `vuelta=corta` y P1 `brillo=suave|fuerte` se borraron en
// PULIDO 2 · 1, 2 y 4, rechazadas; PULIDO 2 · 4 agrega `chispas=si` y 3, `velo=escena`.)
const PEDIDAS: Readonly<Record<(typeof PRUEBAS_SUELTAS)[number], readonly string[]>> = { rebobinado: ['minimo'], angel: ['asentado'], chispas: ['si'], cta: ['a', 'b', 'c', 'd'], velo: ['escena'] }
type Traductor = typeof entornoPedido
const banderasBien = (f: Traductor): boolean => {
  const apagadas = PRUEBAS_SUELTAS.every((k) => f('producto').pruebas[k] === 'no' && ENTORNO.pruebas[k] === 'no')
  const pedidas = PRUEBAS_SUELTAS.every((k) => PEDIDAS[k].every((v) => f(`producto,${k}=${v}`).pruebas[k] === v))
  const otras = PRUEBAS_SUELTAS.every((k) => f(`producto,${k}=cualquiera`).pruebas[k] === 'no')
  const juntas = f('producto,cta=b,chispas=si,angel=asentado').pruebas
  return apagadas && pedidas && otras && juntas.cta === 'b' && juntas.chispas === 'si' && juntas.angel === 'asentado' && f('producto,cta=b').E1 === ENTORNO.E1
}
afirmar(banderasBien(entornoPedido), 'cada prueba del sprint se pide por su nombre y vale sólo sus valores (otro valor es el producto); van juntas; en el producto están todas apagadas', PRUEBAS_SUELTAS.join(' · '))
controlPositivo('el detector VE un traductor que acepta cualquier valor', ((pedido: string) => {
  const e = entornoPedido(pedido)
  const cta = /cta=(\w+)/.exec(pedido)
  return cta === null ? e : { ...e, pruebas: { ...e.pruebas, cta: cta[1] as 'a' } }
}) as Traductor, banderasBien)
type DeLaUrl = typeof pedidoDeLaUrl
const urlBien = (f: DeLaUrl): boolean => {
  const sueltas = f('?cta=a&chispas=si')
  const ambas = f('?pruebas=pie=antes&angel=asentado')
  return f('') === null && f('?otra=1') === null && sueltas !== null && entornoPedido(sueltas).pruebas.cta === 'a' && entornoPedido(sueltas).pruebas.chispas === 'si' && ambas !== null && entornoPedido(ambas).pruebas.pie === 'antes' && entornoPedido(ambas).pruebas.angel === 'asentado' && PRUEBAS_SUELTAS.every((k) => f(`?${k}=${PEDIDAS[k][0]}`) !== null)
}
afirmar(urlBien(pedidoDeLaUrl) && /pedidoDeLaUrl\(window\.location\.search\)/.test(leer('_lib/escena/entorno.ts')), 'sin banco, la URL las pide también sueltas (`/v3?cta=a`, `/v3?chispas=si`) y con `?pruebas=`; sin nada, el producto')
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('P6 · El logo del intro baja «como un ángel»: con la primera letra del titular, a velocidad constante, y llega con la última')

// Antes esperaba arriba el 40 % de su reloj (fuera del cuadro: aparecía tarde) y después caía con gravedad para llegar a
// tiempo. Ahora sigue lo que la escena muestra del titular en volumen: el logo va antes en el cuadro, así que toma lo del
// cuadro anterior y le suma lo que el titular suma en éste (el mismo `dt` y el mismo tope de `persigue`).
interface Sincronia { readonly igual: boolean; readonly arrancaJuntos: boolean; readonly llegaJuntos: boolean; readonly lineal: boolean }
type PasoDeLaBajada = typeof pasoDeLaBajada
/** Un cuadro de la escena con titular: el logo (antes) y el titular (después), con cuadros de duración variable y un tirón. */
const conTitular = (paso: PasoDeLaBajada, abreEn: number, armaEn: number): Sincronia => {
  const titular = { llegada: 0, armado: armaEn <= 0, enCamino: true }
  const b = { u: 0, propio: false }
  const cuadros = Array.from({ length: 600 }, (_, i) => [1 / 60, 1 / 75, 1 / 144, 1 / 120][i % 4] + (i === 90 ? 0.12 : 0))
  let t = 0
  let igual = true
  let primeroLogo = -1
  let primeroTitular = -1
  let finLogo = -1
  let finTitular = -1
  const pasos: number[] = []
  for (let i = 0; i < cuadros.length && (finLogo < 0 || finTitular < 0); i += 1) {
    const dt = Math.min(cuadros[i], 0.1)
    t += dt
    const carga = t >= abreEn
    const antes = b.u
    paso(b, { conTitular: true, titular, cargaLista: carga, vencido: false }, dt)
    titular.armado = t >= armaEn
    if (titular.armado) titular.llegada = persigue(titular.llegada, carga ? 1 : 0, dt, LLEGADA_DEL_TITULAR_S)
    if (Math.abs(b.u - titular.llegada) > 1e-12) igual = false
    if (primeroLogo < 0 && b.u > 0) primeroLogo = i
    if (primeroTitular < 0 && titular.llegada > 0) primeroTitular = i
    if (finLogo < 0 && b.u >= 1) finLogo = i
    if (finTitular < 0 && titular.llegada >= 1) finTitular = i
    if (b.u > 0 && b.u < 1) pasos.push((b.u - antes) / dt)
  }
  const lineal = pasos.length > 0 && pasos.slice(1).every((v) => Math.abs(v - 1 / LLEGADA_DEL_TITULAR_S) < 1e-9)
  return { igual, arrancaJuntos: primeroLogo === primeroTitular && primeroLogo >= 0, llegaJuntos: finLogo === finTitular && finLogo >= 0, lineal }
}
// La carga se abre a los 0, 0,3 o 1,1 s, con el titular ya armado (el velo de la carga espera a que lo esté).
const sincroniaBien = (paso: PasoDeLaBajada): boolean => [[0, 0], [0.3, 0], [1.1, 0.5]].every(([abre, arma]) => {
  const x = conTitular(paso, abre, arma)
  return x.igual && x.arrancaJuntos && x.llegaJuntos && x.lineal
})
afirmar(sincroniaBien(pasoDeLaBajada), 'con el titular en volumen, el logo arranca en el MISMO cuadro que la primera letra, llega en el mismo cuadro que la última y baja a velocidad constante (1/2,4 por segundo), con cuadros de 60, 75, 120 y 144 Hz y un tirón')
const relojPropio: PasoDeLaBajada = (b, f, dt) => {
  // El de NOCTURNO FINAL B1: su propio reloj desde la carga abierta, sin mirar al titular.
  if (f.cargaLista) b.u = Math.min(1, b.u + dt / CAIDA_DEL_LOGO.duracionS)
}
controlPositivo('el detector VE un logo con su propio reloj de otra duración (el titular cambió y el logo no)', ((b, f, dt) => {
  if (f.cargaLista) b.u = Math.min(1, b.u + dt / 2)
}) as PasoDeLaBajada, sincroniaBien)
controlPositivo('  y uno que sigue al titular con un cuadro de atraso (sin sumar lo de este cuadro)', ((b, f) => {
  if (f.titular.armado) b.u = f.titular.llegada
}) as PasoDeLaBajada, sincroniaBien)

// Sin titular en volumen (abajo de 1024, `titulos=no`, o vencido el plazo de la carga sin que se arme): su propio reloj, lineal
// y de la misma duración, desde la carga abierta; con un titular anotado que todavía no se armó, espera arriba.
const sinTitularBien = (paso: PasoDeLaBajada): boolean => {
  const quieto = { llegada: 0, armado: false, enCamino: false }
  const a = { u: 0, propio: false }
  for (let i = 0; i < 30; i += 1) paso(a, { conTitular: true, titular: quieto, cargaLista: true, vencido: false }, 1 / 60)
  const espera = a.u === 0
  const b = { u: 0, propio: false }
  let n = 0
  while (b.u < 1 && n < 1000) {
    paso(b, { conTitular: false, titular: quieto, cargaLista: true, vencido: false }, 1 / 60)
    n += 1
  }
  const c = { u: 0, propio: false }
  paso(c, { conTitular: true, titular: quieto, cargaLista: true, vencido: true }, 1 / 60)
  return espera && Math.abs(n / 60 - LLEGADA_DEL_TITULAR_S) <= 1 / 60 && c.u > 0 && c.propio
}
afirmar(sinTitularBien(pasoDeLaBajada) && /if \(FUENTE\.cargaLista && FUENTE\.conTitular && !TITULAR_EN_VIVO\.armado\) s\.esperaS \+= dt\s*FUENTE\.vencido = s\.esperaS > CAIDA_DEL_LOGO\.esperaMaximaS/.test(sinComentarios(leer('_lib/escena/intro/CaidaDelLogo.tsx'))), '  sin titular en volumen, su propio reloj lineal de 2,4 s desde la carga abierta; con uno anotado que no se armó, espera arriba (a lo sumo 2,5 s con la carga abierta)')
controlPositivo('  el detector VE uno que no espera al titular anotado', relojPropio, sinTitularBien)

// Si el titular se pausa a mitad (quien carga bajó: queda fuera de la vista y no avanza), el logo no se cuelga en el aire
// (se vería desde la sección siguiente): sigue con su reloj desde donde iba, a la misma velocidad, y aterriza.
const pausaBien = (paso: PasoDeLaBajada): boolean => {
  const titular = { llegada: 0, armado: true, enCamino: true }
  const b = { u: 0, propio: false }
  let n = 0
  while (titular.llegada < 0.5) {
    paso(b, { conTitular: true, titular, cargaLista: true, vencido: false }, 1 / 60)
    titular.llegada = persigue(titular.llegada, 1, 1 / 60, LLEGADA_DEL_TITULAR_S)
    n += 1
  }
  titular.enCamino = false
  while (b.u < 1 && n < 1000) {
    paso(b, { conTitular: true, titular, cargaLista: true, vencido: false }, 1 / 60)
    n += 1
  }
  return b.u === 1 && Math.abs(n / 60 - LLEGADA_DEL_TITULAR_S) <= 2 / 60
}
afirmar(pausaBien(pasoDeLaBajada), '  si el titular se pausa a mitad (fuera de la vista), el logo sigue a la misma velocidad y aterriza a tiempo: no queda colgado')
controlPositivo('  el detector VE un logo que se queda con el titular pausado', ((b, f, dt) => {
  if (f.titular.armado) b.u = f.titular.enCamino && f.cargaLista ? Math.min(1, f.titular.llegada + dt / LLEGADA_DEL_TITULAR_S) : f.titular.llegada
}) as PasoDeLaBajada, pausaBien)

// Los tiempos salen de la MISMA constante (importada en el hero, en la escena y en la caída; ningún 2,4 escrito a mano).
const caidaFuente = sinComentarios(leer('_lib/escena/intro/caida.ts'))
const heroP6 = leer('_secciones/hero/Hero.tsx')
const unaConstante = (caida: string, hero: string): boolean => /duracionS: LLEGADA_DEL_TITULAR_S,/.test(caida) && !/2\.4/.test(caida) && /import \{ LLEGADA_DEL_TITULAR_S \} from '\.\.\/\.\.\/_lib\/titulos3d\/titular'/.test(hero) && !/const LLEGADA_DEL_TITULAR_S/.test(hero)
afirmar(unaConstante(caidaFuente, heroP6) && CAIDA_DEL_LOGO.duracionS === LLEGADA_DEL_TITULAR_S, '  la duración es una sola constante (`_lib/titulos3d/titular.ts`), importada por el hero y por la caída: si el titular cambia, el logo lo acompaña')
controlPositivo('  el detector VE una copia a mano', [caidaFuente.replace('duracionS: LLEGADA_DEL_TITULAR_S,', 'duracionS: 2.4,'), heroP6] as const, ([c, h]: readonly [string, string]) => unaConstante(c, h))
const titulos = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
afirmar(/TITULAR_EN_VIVO\.llegada = TITULAR_EN_VIVO\.armado \? llegadaDelTitular : 0/.test(titulos) && /llegadaDelTitular = Math\.min\(llegadaDelTitular, a\.mostrado\.llegada\)/.test(titulos) && /DEL_QUE_QUEDA\.enCamino = !fuera && !tapado/.test(titulos), '  la escena publica lo que MUESTRA del titular (el menor de sus dos registros) y si su llegada sigue su camino')

// Aparece apenas empieza: arranca con el borde de abajo del logo justo arriba del cuadro (no esperando fuera de él).
const camara = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 200)
camara.position.set(0, 1.6, 18)
camara.lookAt(0, 0, 0)
camara.updateMatrixWorld(true)
const logoDePrueba = new THREE.Group()
logoDePrueba.add(new THREE.Mesh(new THREE.BoxGeometry(6.9, 4.8, 0.6)))
const h0 = altoDesdeElBorde(camara, logoDePrueba)
const bordeY = new THREE.Vector3(0, h0 - 2.4, 0).project(camara).y
afirmar(Math.abs(bordeY - (1 + 2 * CAIDA_DEL_LOGO.desdeElBorde)) < 1e-3 && h0 < CAIDA_DEL_LOGO.alto, '  arranca justo arriba del borde de arriba del cuadro (se ve desde el primer instante), más cerca que la espera de antes', `${h0.toFixed(2)} u (antes ${String(CAIDA_DEL_LOGO.alto)} u, fuera del cuadro)`)
afirmar(/if \(antes === 0 && s\.u > 0 && !s\.medido\) \{\s*s\.alto = altoDesdeElBorde\(state\.camera, logo\)/.test(sinComentarios(leer('_lib/escena/intro/CaidaDelLogo.tsx'))), '  y la mide con la cámara de ese cuadro, al arrancar')

// `?angel=asentado`: un asentado mínimo en los últimos ~120 ms (llega en el mismo instante; continuo en altura y velocidad).
const asentadoBien = (h: typeof alturaDeLaCaida): boolean => {
  const n = 2400
  const y = Array.from({ length: n + 1 }, (_, i) => h(i / n, 10, true))
  const v = y.slice(1).map((x, i) => (y[i] - x) * n)
  const tAsienta = 1 - CAIDA_DEL_LOGO.asentadoS / LLEGADA_DEL_TITULAR_S
  const antesDeAsentar = v.slice(0, Math.floor(tAsienta * n) - 1)
  const constante = antesDeAsentar.every((x) => Math.abs(x - antesDeAsentar[0]) < 1e-6)
  const frena = v.slice(Math.ceil(tAsienta * n) + 1).every((x, i, a) => i === 0 || x <= a[i - 1] + 1e-9)
  const saltos = v.slice(1).every((x, i) => Math.abs(x - v[i]) < 0.2)
  return y[0] === 10 && y[n] === 0 && constante && frena && saltos && v[n - 1] < 0.05 * antesDeAsentar[0]
}
afirmar(asentadoBien(alturaDeLaCaida) && ENTORNO.pruebas.angel === 'no' && entornoPedido('producto,angel=asentado').pruebas.angel === 'asentado' && /entornoDeLaEscena\(\)\.pruebas\.angel === 'asentado'/.test(sinComentarios(leer('_lib/escena/intro/CaidaDelLogo.tsx'))), '  con `?angel=asentado`, constante y en los últimos 0,12 s frena parejo hasta posarse, llegando en el mismo instante; apagado en el producto (lineal puro)')
controlPositivo('  el detector VE un asentado que salta (frena de golpe)', ((u: number, alto?: number) => ((alto ?? 10) * (u >= 0.97 ? 0 : 1 - u / 0.97))) as typeof alturaDeLaCaida, asentadoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P18 · El formulario del pie en el teléfono y la tablet: vidrio líquido (el material del menú, sin duplicarlo)')

// La tarjeta sólida de C4 (el papel, borde y sombra) era demasiado invasiva. Abajo de 1024 la caja del contacto lleva el
// material del menú del teléfono: una sola definición en `vidrio.css`, compartida por selector (`[data-material="vidrio"]`).
const vidrio = sinComentarios(leer('_estilos/vidrio.css'))
const DESENFOQUE = '-webkit-backdrop-filter: blur(var(--vidrio-desenfoque)) saturate(var(--vidrio-saturacion));'
const materialBien = (css: string): boolean => {
  const veces = css.split(DESENFOQUE).length - 1
  const bloque = css.slice(0, css.indexOf(DESENFOQUE))
  const selector = bloque.slice(bloque.lastIndexOf('}') + 1)
  const compartido = (sel: string): boolean => new RegExp(`\\[data-v3\\] \\[data-pieza="vidrio"\\]${sel},\\s*\\[data-v3\\] \\[data-material="vidrio"\\]${sel}`).test(css)
  return veces === 1 && /\[data-pieza="vidrio"\]/.test(selector) && /\[data-material="vidrio"\]/.test(selector) && !/position: fixed/.test(selector) &&
    compartido('\\[data-seccion="invertida"\\]') && compartido('::before') && compartido('\\[data-seccion="invertida"\\]::before') && /\[data-v3\] \[data-pieza="vidrio"\] \{\s*position: fixed;\s*\}/.test(css)
}
afirmar(materialBien(vidrio), 'el material (tinte, desenfoque, especular y filo, claro y oscuro) se define UNA vez y lo comparten el menú y el formulario; el lugar fijo es sólo del menú')
controlPositivo('el detector VE un material copiado para el formulario', `${vidrio}\n[data-v3] [data-material="vidrio"] { ${DESENFOQUE} }`, materialBien)
// Lo propio del formulario, en su regla: el radio de una tarjeta, un tinte un poco más denso (rótulos chicos), el relleno de
// los campos y el color del texto de ejemplo (el de base caía a ~2:1). Medido a 390, 375 y 768: AA de día y de noche.
const propioBien = (css: string): boolean => /\[data-v3\] \[data-material="vidrio"\] \{[^}]*--vidrio-tinte-del-formulario: 66%;[^}]*border-radius: var\(--radius-medio\);[^}]*background-color: color-mix\(in srgb, var\(--color-fondo\) var\(--vidrio-tinte-del-formulario\), transparent\);/.test(css) && /\[data-v3\] \[data-material="vidrio"\] \[data-foco="campo"\] \{\s*background-color: var\(--campo-del-vidrio\);/.test(css) && /\[data-v3\] \[data-material="vidrio"\] \[data-foco="campo"\]::placeholder \{\s*color: var\(--ejemplo-del-campo\);\s*opacity: 1;/.test(css)
afirmar(propioBien(vidrio), '  lo propio del formulario: el radio de tarjeta, el tinte al 66 %, el relleno de los campos y el texto de ejemplo con su color (AA sobre el logo negro)')
controlPositivo('  el detector VE el texto de ejemplo de base (la tinta a la mitad, con la opacidad del campo encima)', vidrio.replace('color: var(--ejemplo-del-campo);', ''), propioBien)
// La caja: sólo abajo de 1024 (desde ahí, la placa 3D: escritorio no cambia), con el tono de la zona donde está.
const columnas = sinComentarios(leer('_secciones/cierre/ColumnasDelPie.tsx'))
const cajaBien = (c: string): boolean => /const angosto = useModoDelPie\(\) === 'plano'/.test(c) && /data-material=\{angosto \? 'vidrio' : undefined\}/.test(c) && /data-seccion=\{angosto && debajo === 'oscuro' \? 'invertida' : undefined\}/.test(c) && /const debajo = useTonoDebajo\(caja, angosto && aLaVista\)/.test(c) && /new IntersectionObserver/.test(c) && !/max-escritorio:bg-fondo|max-escritorio:shadow-flotante/.test(c)
afirmar(cajaBien(columnas), '  la caja de vidrio sólo abajo de 1024, del tono de la zona (vidrio claro sobre la sala de día, oscuro sobre la noche), leído sólo con la caja a la vista; la tarjeta sólida se fue')
controlPositivo('  el detector VE el vidrio también en escritorio', columnas.replace("data-material={angosto ? 'vidrio' : undefined}", 'data-material="vidrio"'), cajaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P22 · El encastre también en el teléfono y la tablet: encuadrado, con el dedo, quieto con movimiento reducido')

// [PULIDO 2] 1 · el escenario de una pantalla después del pie (y su otra lectura, `encastre=desvanece`) se borró, rechazado:
// la página termina en el pie y el final corre detrás de sus elementos (el encuadre entre ellos y el teclado, en `s53-pulido-2`).
// Lo que queda fijado acá: no hay nada después de las secciones, ni la hoja del escenario.
const home = sinComentarios(leer('_secciones/Home.tsx'))
const pieCss = leer('_estilos/pie.css')
const sinEscenario = (h: string, css: string): boolean => /\{REGISTRO\.map\([\s\S]*?\)\)\}\s*<\/>/.test(h) && !h.includes('escenario-del-encastre') && !css.includes('escenario-del-encastre') && !css.includes('data-encastre')
afirmar(sinEscenario(home, pieCss), 'abajo de 1024 la página termina en el pie: no hay escenario después de las secciones (PULIDO 2 · 1; medido a 390, el scroll máximo es 21423, el de antes de P22)')
controlPositivo('el detector VE el escenario de P22 después de las secciones', [home.replace(/\}\s*<\/>/, '}<div data-pieza="escenario-del-encastre" aria-hidden="true" /></>'), pieCss] as const, ([h, c]: readonly [string, string]) => sinEscenario(h, c))

// Montado también abajo de 1024 (y ahí, con movimiento reducido, quieto); en escritorio con movimiento reducido, como antes.
const etapa = sinComentarios(leer('_lib/escena/ProbeStage.tsx'))
const finalDelPie = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
const cuadroP22 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const montajeBien = (e: string, f: string): boolean => e.includes("{(!reducedMotion || calidad === 'compacta') && <FinalDelPie logoGroupRef={logoGroupRef} stats={stats} calidad={calidad} estatico={reducedMotion} />}") &&
  f.includes('mascaraDelLogo(logo.formas, logo.caja, angosto ? HUECO.lado / 2 : HUECO.lado)') && /if \(estatico\) return undefined[\s\S]{0,300}if \(!angosto\) return retener\(\)[\s\S]{0,400}new IntersectionObserver/.test(f) &&
  e.includes("compacta={calidad === 'compacta'}")
afirmar(montajeBien(etapa, finalDelPie), '  montado abajo de 1024 (la misma cinemática), con la máscara del hueco y la sombra del logo a la mitad de resolución, y los gestos retenidos sólo con el pie a la vista (un escucha de `touchmove` no pasivo siempre puesto le costaría el scroll a iOS)')
controlPositivo('  el detector VE el final sólo desde 1024 (el de antes)', [etapa.replace("{(!reducedMotion || calidad === 'compacta') && <FinalDelPie logoGroupRef={logoGroupRef} stats={stats} calidad={calidad} estatico={reducedMotion} />}", "{calidad === 'plena' && !reducedMotion && <FinalDelPie logoGroupRef={logoGroupRef} stats={stats} />}"), finalDelPie] as const, ([e, f]: readonly [string, string]) => montajeBien(e, f))

// El encuadre del final abajo de 1024: desde arriba, el logo (y su hueco, su misma huella) ocupa la mitad de la dimensión que
// lo limita; girando en el quieto (su círculo) sigue entero. Medido en la página: 49–50 % en 390, 375, 768, 844 y 667 de ancho.
const HUELLA = { ancho: 6.9, fondo: 4.8 }
const TAMANOS: ReadonlyArray<readonly [number, number]> = [[390, 844], [375, 667], [768, 1024], [844, 390], [667, 375]]
type Distancia = typeof distanciaDelFinalAngosto
const encuadreBien = (f: Distancia): boolean => TAMANOS.every(([w, h]) => {
  const d = f(35, w / h, HUELLA.ancho, HUELLA.fondo)
  const alto = 2 * d * Math.tan(THREE.MathUtils.degToRad(35) / 2)
  const ancho = alto * (w / h)
  const ocupa = Math.max(HUELLA.ancho / ancho, HUELLA.fondo / alto)
  const circulo = Math.hypot(HUELLA.ancho, HUELLA.fondo)
  return ocupa >= 0.45 && ocupa <= 0.55 && circulo <= 0.95 * Math.min(ancho, alto)
})
afirmar(encuadreBien(distanciaDelFinalAngosto) && /: encuadre === null \? distanciaDelFinalAngosto\(state\.camera\.fov, state\.camera\.aspect, tamano\.ancho \?\? ANCHO_DEL_LOGO, tamano\.alto\) :/.test(cuadroP22), '  el encuadre del final abajo de 1024: el logo y el hueco ocupan la mitad de lo que los limita (vertical u apaisado) y, girando, siguen enteros', TAMANOS.map(([w, h]) => `${String(w)}×${String(h)}`).join(' · '))
controlPositivo('  el detector VE la distancia de escritorio en un teléfono apaisado (el logo quedaba en el 13 % del ancho)', (() => 42.4) as Distancia, encuadreBien)

// Con movimiento reducido (abajo de 1024): sin cinemática, el estado final quieto al llegar al fondo (sin golpe, sin quieto).
const quietoBienP22 = (f: typeof estadoQuieto): boolean => {
  const r = relojQuieto()
  f(r, true)
  const alFondo = r.fin === 1 && r.velocidad === 0
  f(r, false)
  return alFondo && r.fin === 0
}
afirmar(quietoBienP22(estadoQuieto) && cuadroP22.includes('if (s.estatico) estadoQuieto(s.reloj,') && cuadroP22.includes('if (!s.estatico && s.antes < golpe && fin >= golpe) {') && cuadroP22.includes('if (s.estatico) quietoRebobinado(alRebobinar, 0, EN_VIVO)') && /gestoDelFinal\(s: EstadoDelFinal, g: GestoDeScroll\): boolean \{\s*if \(s\.estatico\) return false/.test(cuadroP22), '  con movimiento reducido, el final entero de una vez al fondo (y en cero fuera), sin el golpe, sin el giro del quieto y sin retener gestos')
controlPositivo('  el detector VE un reloj quieto que anima (sube de a poco)', ((r: RelojDelFinal, al: boolean) => {
  r.fin = al ? Math.min(1, r.fin + 0.1) : 0
}) as typeof estadoQuieto, quietoBienP22)

// [PULIDO 2] 1 · la otra lectura (`encastre=desvanece`: el pie se desvanecía mientras corría) se borró, rechazada: sin código muerto.
const sinDesvanecer = (c: string, f: string): boolean => !c.includes('desvanecerElPie') && !f.includes('desvanece') && !f.includes('data-encastre')
afirmar(sinDesvanecer(cuadroP22, finalDelPie), '  `encastre=desvanece` ya no existe (ni el pie que se desvanece, ni su marca): los elementos del pie quedan donde están')
controlPositivo('  el detector VE el pie que se desvanece de P22', [`${cuadroP22} export function desvanecerElPie(fin: number): void {}`, finalDelPie] as const, ([c, f]: readonly [string, string]) => sinDesvanecer(c, f))

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1 · El brillo del piso (rehecho en PULIDO 2 · 4: la luz sale de ABAJO, por las juntas; las tapas no se blanquean)')

// [PULIDO 2] 4 · el brillo de P1 (las tapas a blanco) se rechazó: «no entendiste mi concepto». Lo que P1 pedía y sigue
// valiendo se fija acá sobre la luz nueva (`final/luzDeAbajo.ts`): blanca, cuantizada al bloque, orgánica, con su ciclo (una
// o dos zonas, en otro lugar cada vez) y la sala apenas más oscura mientras corre. Lo nuevo (las rendijas, los costados desde
// la base, los cantos, el plano de abajo, los bloques que se separan y cambian de alto) lo fija `s53-pulido-2` §4.
const dibujoP1 = (() => {
  const material = conElFinalEnElPiso(new THREE.MeshStandardMaterial())
  const sombreador = { fragmentShader: [ANCLAS_DEL_DIBUJO.funcion, ...Object.values(ANCLAS_DEL_HUECO)].join('\n'), vertexShader: 'vAlto = transformed.y;\n#include <common>', uniforms: {} as Record<string, THREE.IUniform> }
  material.onBeforeCompile(sombreador as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer)
  material.dispose()
  return sombreador.fragmentShader
})()
const brilloP1 = dibujoP1.slice(dibujoP1.indexOf('vec3 conLasJuntas('), dibujoP1.indexOf('vec2 mascaraDelHueco('))
// Blanca y sin blanquear las tapas: la luz se SUMA en los costados (desde su base) y en los cantos, nunca la tapa entera.
const blancoBien = (g: string): boolean => /return color \+ vec3\( luz \* s \);/.test(g) && !/mix\( color, vec3\(/.test(g) && !/vec3\( 1(\.0)?, 0\.[0-9]+, 0\.[0-9]+ \)/.test(g) && !g.includes('lava')
afirmar(blancoBien(brilloP1), 'la luz es BLANCA (cero rojo) y se suma por las juntas (los costados y los cantos): las tapas no se ponen blancas')
controlPositivo('el detector VE las tapas blancas de P1 (rechazadas)', `${brilloP1}\nreturn mix( color, vec3( mix( 0.9, 1.0, vTapa ) ), k );`, blancoBien)
// Cuantizado al bloque: el sector se mide en el CENTRO del bloque (cada bloque se prende entero), no en cada punto del piso.
const bloqueBien = (g: string): boolean => g.includes('float s = sectorDeLaLuz( vCentroDelBloque, 0.0 );')
afirmar(bloqueBien(brilloP1), '  cuantizado al bloque: cada bloque se prende entero (el sector se mide en su centro)')
controlPositivo('  el detector VE una luz medida punto a punto (manchas que cortan los bloques)', brilloP1.replace('sectorDeLaLuz( vCentroDelBloque, 0.0 )', 'sectorDeLaLuz( vPiso.xz, 0.0 )'), bloqueBien)
// Orgánica: la distancia al centro deformada por un ruido (ni un círculo perfecto ni una grilla: nada de damero ni de mod).
const organicaBien = (g: string): boolean => /float d = lejos \+ [0-9.]+ \* \( ruidoDeLaLuz\( b \* [0-9.]+ \+ semilla \) - 0\.5 \);/.test(g) && LUZ_DE_ABAJO.irregular >= 0.3 && !/mod\(|step\( 0\.5, fract/.test(g)
afirmar(organicaBien(SECTOR_DE_LA_LUZ_GLSL), '  orgánica: la distancia al centro de la zona deformada por un ruido (sin círculos perfectos), sin damero ni grilla regular')
controlPositivo('  el detector VE una zona circular (sin el ruido)', SECTOR_DE_LA_LUZ_GLSL.replace(/float d = lejos \+ [^;]+;/, 'float d = lejos;'), organicaBien)

// El ciclo de vida, con la función de la escena (las zonas se calculan por cuadro y van como uniformes): nace (1,5 a 3 s),
// vive, se retira y otra aparece en otro lugar; una o dos a la vez como máximo; con una semilla fija.
const LA = LUZ_DE_ABAJO
const ALCANCE_P1 = { x: 16, y: 10, giro: 0 }
type Zonas = typeof zonasDeLaLuz
const cicloBien = (zonas: Zonas, cuantas: number): boolean => {
  let maximo = 0
  let conUna = 0
  let conDos = 0
  let hueco = 0
  let huecoMaximo = 0
  const lugares: [number, number][][] = Array.from({ length: cuantas }, () => [])
  const ciclos: number[] = Array.from({ length: cuantas }, () => -1)
  const buf: ZonaDeLaLuz[] = []
  for (let t = 0; t < 180; t += 0.1) {
    const z = zonas(t, ALCANCE_P1, 6, buf)
    let vivas = 0
    for (let k = 0; k < cuantas; k += 1) {
      if ((z[k]?.vida ?? 0) > 0.02) vivas += 1
      const semilla = z[k]?.semilla ?? 0
      if (semilla !== ciclos[k]) {
        ciclos[k] = semilla
        lugares[k].push([z[k]?.cx ?? 0, z[k]?.cz ?? 0])
      }
    }
    maximo = Math.max(maximo, vivas)
    if (vivas === 1) conUna += 1
    if (vivas === 2) conDos += 1
    hueco = vivas === 0 ? hueco + 0.1 : 0
    huecoMaximo = Math.max(huecoMaximo, hueco)
  }
  // Cada zona nueva, en otro lugar: de un ciclo al siguiente se mueve más de 2 u.
  const otroLugar = lugares.every((l) => l.every((p, i) => i === 0 || Math.hypot(p[0] - l[i - 1][0], p[1] - l[i - 1][1]) > 2))
  return maximo <= 2 && conUna > 0 && conDos > 0 && huecoMaximo < 4 && otroLugar && LA.nace[0] >= 1.5 && LA.nace[1] <= 3 && LA.periodo[0] > LA.nace[1] + LA.vive[1] + LA.muere[1]
}
afirmar(cicloBien(zonasDeLaLuz, LA.zonas) && LA.zonas === 2, '  cada zona nace en 1,5 a 3 s, vive y se retira, y la próxima aparece en otro lugar; nunca más de dos a la vez (a veces una, a veces dos, con huecos cortos)')
controlPositivo('  el detector VE una zona que no se retira nunca (siempre la misma, en el mismo lugar)', ((t: number, a: { x: number; y: number; giro: number }, m: number, s: ZonaDeLaLuz[]) => {
  s[0] = { cx: 5, cz: 0, radio: 4, vida: 1, semilla: 0 }
  s[1] = { cx: -5, cz: 0, radio: 4, vida: 0, semilla: 0 }
  return s
}) as Zonas, (z: Zonas) => cicloBien(z, 2))

// La sala se oscurece (en el color que se ve, parejo y neutro) GRADUAL con el sector prendido y vuelve cuando se apaga (y con
// el final: al rebobinar, también). El rig de luz, no (sin el tinte cálido del atardecer de B2). [PULIDO 2] 4 · antes, 10 a 15 %
// fijo con el final; ahora hasta 40 % con el sector entero prendido: la luz blanca de las juntas no se leía sobre el papel.
const cuadroP1 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const rigP1 = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
const alRasP1 = FINAL_DEL_PIE.presion.hastaS / R.duracionS
const oscuroBienP1 = (g: string, c: string): boolean => g.includes('gl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;\n\tgl_FragColor.rgb = conLasJuntas( gl_FragColor.rgb, vPiso.xz );') &&
  c.includes('piso.uOscuroDelBrillo.value = LUZ_DE_ABAJO.oscurece * oscuroDelFinal(fin) * prendidoDeLaLuz(s.zonas) * LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value') &&
  LA.oscurece >= 0.1 && LA.oscurece <= 0.4 && oscuroDelFinal(0) === 0 && oscuroDelFinal(alRasP1 - 0.01) === 0 && oscuroDelFinal(1) === 1 && oscuroDelFinal(alRasP1 + 0.05) < 1 && !/arc\.kelvin \+=/.test(rigP1)
afirmar(oscuroBienP1(dibujoP1, cuadroP1), '  la sala se oscurece (parejo, neutro; hasta un 40 % con el sector entero) gradual con el sector prendido y con el final; sin el tinte cálido del atardecer', `oscurece ${String(LA.oscurece)}`)
controlPositivo('  el detector VE el atardecer de antes (−45 %, de golpe con el final)', [dibujoP1, cuadroP1.replace('LUZ_DE_ABAJO.oscurece * oscuroDelFinal(fin) * prendidoDeLaLuz(s.zonas) * LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value', '0.45 * oscuroDelFinal(fin)')] as const, ([g, c]: readonly [string, string]) => oscuroBienP1(g, c))
// Quieto (movimiento reducido): un instante con una zona viva. Y `?brillo=` se borró (las intensidades de P1, rechazadas).
const quietoVivo = prendidoDeLaLuz(zonasDeLaLuz(LA.quietoEn, ALCANCE_P1, 6, []))
afirmar(quietoVivo > 0.8 && !('brillo' in ENTORNO.pruebas), '  quieto (movimiento reducido) queda una zona prendida; `?brillo=` ya no existe', `quieto: ${quietoVivo.toFixed(2)}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P5 · Un viaje del menú con el encastre avanzado: dura lo mismo que cualquiera y el final vuelve EN PARALELO, sin saltos')

// Antes (NOCTURNO FINAL A2) el viaje esperaba a que el final volviera a cero (2,2 s desde el entero) y recién ahí movía el
// scroll: desde el pie, cualquier viaje tardaba eso de más. Ahora sale como cualquiera (s52-nocturno-final A2: el efecto no
// espera) y la escena, que sabe cuánto dura el viaje, deshace el final adentro mientras el scroll ya viaja: a la velocidad del
// rebobinado de P2, con techo en el 56 % del viaje (`?vuelta=corta`: el 35 %). Se mide con la cámara del rig quieta (el
// preludio: el peor caso, nada más se mueve).
const camaraDelRigP5 = (): THREE.PerspectiveCamera => {
  const c = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 400)
  c.position.set(Math.sin(2.88) * 17.9, 8.2, Math.cos(2.88) * 17.9)
  c.lookAt(0, ORBIT_TARGET_Y, 0)
  aimWithFraming(c, 1440 / 900, 6.86, 4.78, Math.hypot(17.9, 8.2 - ORBIT_TARGET_Y), -0.494, 0)
  c.updateMatrixWorld()
  return c
}
const BLANCO_P5 = new THREE.Vector3()
const camaraEnP5 = (fin: number): THREE.PerspectiveCamera => {
  const c = camaraDelRigP5()
  blancoDelFinal(fin, BLANCO_P5)
  camaraDelFinal(c, subida(fin), BLANCO_P5, 0, 0, null)
  return c
}
const energiaP5 = (fin: number): number => Math.min(1, poder(fin))
const TAM_P5 = { alto: 4.78, espesor: 0.56 } as const
const POSE_P5 = { centro: new THREE.Vector3(), rotacionX: 0 }
const alturaDelLogoP5 = (fin: number): number => {
  poseDelLogo(fin, TAM_P5, POSE_P5)
  return POSE_P5.centro.y
}
/** Lo más que cambia en un cuadro: el giro de la cámara (grados), la altura del logo (u), el oscurecimiento del piso y la energía del brillo. */
interface PorCuadro { grados: number; logo: number; oscuro: number; energia: number }
const anotar = (p: PorCuadro, antes: number, ahora: number, camaraAntes: THREE.Camera, camaraAhora: THREE.Camera): void => {
  p.grados = Math.max(p.grados, THREE.MathUtils.radToDeg(camaraAhora.quaternion.angleTo(camaraAntes.quaternion)))
  p.logo = Math.max(p.logo, Math.abs(alturaDelLogoP5(ahora) - alturaDelLogoP5(antes)))
  p.oscuro = Math.max(p.oscuro, Math.abs(oscuroDelFinal(ahora) - oscuroDelFinal(antes)))
  p.energia = Math.max(p.energia, Math.abs(energiaP5(ahora) - energiaP5(antes)))
}
interface VueltaP5 extends PorCuadro { readonly s: number; readonly monotona: boolean }
/** Desde `desde` (corriendo), un viaje de `viajeS` segundos: cuánto tarda el final en volver a cero y cómo. */
const vueltaDelViaje = (paso: PasoDelReloj, desde: number, viajeS: number): VueltaP5 => {
  const r: RelojDelFinal = { ...relojQuieto(), fin: desde, fase: 'corre' }
  const p: PorCuadro = { grados: 0, logo: 0, oscuro: 0, energia: 0 }
  let [antes, camara, monotona] = [r.fin, camaraEnP5(r.fin), true]
  for (let i = 1; i <= 900; i += 1) {
    paso(r, { ...AL_FONDO, viajeS, enElViajeS: i * DT }, DT)
    const ahora = camaraEnP5(r.fin)
    anotar(p, antes, r.fin, camara, ahora)
    if (r.fin > antes + 1e-9) monotona = false
    ;[antes, camara] = [r.fin, ahora]
    if (r.fin === 0) return { ...p, s: i * DT, monotona }
  }
  return { ...p, s: Number.POSITIVE_INFINITY, monotona }
}
// La vara: el rebobinado de P2 (lo que se pidió como «rápido»), medido igual, desde el final entero y desde la mitad: lo más
// rápido que cambia cada cosa en alguno de los dos.
const delRebobinado = ((): PorCuadro => {
  const p: PorCuadro = { grados: 0, logo: 0, oscuro: 0, energia: 0 }
  for (const desde of [1, 0.5]) {
    const r: RelojDelFinal = { ...relojQuieto(), fin: desde, fase: 'corre' }
    pasoDelReloj(r, { ...AL_FONDO, rebobinar: true }, DT)
    let [antes, camara] = [r.fin, camaraEnP5(r.fin)]
    for (let i = 0; i < 300 && r.fin > 0; i += 1) {
      pasoDelReloj(r, { ...AL_FONDO, sinGestoS: (i + 1) * DT }, DT)
      const ahora = camaraEnP5(r.fin)
      anotar(p, antes, r.fin, camara, ahora)
      ;[antes, camara] = [r.fin, ahora]
    }
  }
  return p
})()
// [PULIDO 2] 2 · la vuelta de un viaje es EL REBOBINADO DE P2, comprimido en el primer `dentroS` (1 s desde el final entero) y
// en el reloj del viaje: lo que se afirmaba acá (a la velocidad de P2, con techo en el 56 % del viaje, repartida por lo que se
// ve, con `?vuelta=corta`) se reemplazó por pedido. Del viaje más corto (1,2 s) al más largo (2,5 s), desde el entero y desde
// la mitad: adentro del viaje y del segundo, siempre hacia atrás, cuadro a cuadro LA MISMA curva que el rebobinado de P2 (a
// `topeS / dentroS` de su velocidad), y la cámara, el logo y el oscurecimiento del piso no cambian por cuadro más que el
// rebobinado de P2 por esa misma proporción.
const VIAJES_P5 = [1.2, 1.8, 2.5] as const
const COMPRIME = REBOBINADO.topeS / VIAJE_DEL_FINAL.dentroS
const viajeBien = (paso: PasoDelReloj): boolean =>
  VIAJES_P5.every((viajeS) =>
    [1, 0.5].every((desde) => {
      const v = vueltaDelViaje(paso, desde, viajeS)
      const tope = duracionDeLaVuelta(desde)
      // La misma curva que P2, comprimida: el `fin` de cada cuadro es el de P2 a `COMPRIME` veces ese tiempo.
      const r: RelojDelFinal = { ...relojQuieto(), fin: desde, fase: 'corre' }
      let igual = true
      for (let i = 1; i <= 120 && r.fin > 0; i += 1) {
        paso(r, { ...AL_FONDO, viajeS, enElViajeS: i * DT }, DT)
        const comoP2 = desde * quedaDelRebobinado((i - 1) * DT * COMPRIME, duracionDelRebobinado(desde))
        if (Math.abs(r.fin - comoP2) > 1e-9) igual = false
      }
      return igual && v.s <= tope + 2 * DT && tope <= VIAJE_DEL_FINAL.dentroS * desde + 1e-9 && v.s <= viajeS && v.monotona &&
        v.grados <= delRebobinado.grados * COMPRIME * 1.02 && v.logo <= delRebobinado.logo * COMPRIME + 1e-9 && v.oscuro <= delRebobinado.oscuro * COMPRIME + 1e-9
    }),
  )
const corto = vueltaDelViaje(pasoDelReloj, 1, VIAJES_P5[0])
afirmar(viajeBien(pasoDelReloj), 'en un viaje el final vuelve a cero EN PARALELO con el rebobinado de P2 comprimido en el primer segundo (desde el entero, 1 s; desde la mitad, la mitad), adentro del viaje, siempre hacia atrás y con su misma curva; nada cambia por cuadro más que P2 a esa velocidad',
  `viaje de 1,2 s: vuelve en ${corto.s.toFixed(2)} s · cámara ${corto.grados.toFixed(2)}°/cuadro (P2: ${delRebobinado.grados.toFixed(2)}, ×${COMPRIME.toFixed(1)}) · logo ${corto.logo.toFixed(2)} u/cuadro (P2: ${delRebobinado.logo.toFixed(2)})`)
const comoA2: PasoDelReloj = (r, e, dt) => pasoDelReloj(r, e.viajeS > 0 ? { ...e, viajeS: 0, alFondo: false } : e, dt)
controlPositivo('el detector VE la vuelta de A2 (con tope, 2,2 s: el viaje esperaba a que terminara)', comoA2, viajeBien)
const aLaDeP2: PasoDelReloj = (r, e, dt) => pasoDelReloj(r, e.enElViajeS === undefined ? e : { ...e, enElViajeS: e.enElViajeS / COMPRIME }, dt)
controlPositivo('  y la de PULIDO 1, a la velocidad de P2 sin comprimir (1,6 s desde el entero: tarda)', aLaDeP2, viajeBien)
const vueltaLineal: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (r.fase === 'viaje') r.fin = Math.max(0, r.rebobinado.desde * (1 - r.rebobinado.s / Math.max(1e-9, r.rebobinado.dura)))
}
controlPositivo('  y una del mismo largo con otra curva (lineal: arranca de golpe)', vueltaLineal, viajeBien)
// El brillo no se apaga de un cuadro al otro: en el golpe `poder` cae entero, y el que se muestra baja con inercia
// (`poderSuave`). En el rebobinado de P2 y en la vuelta del viaje, lo más que baja en un cuadro.
const bajaDelBrillo = (suave: typeof poderSuave, comprime: number): number => {
  let [mostrado, maximo] = [Math.min(1, poder(1)), 0]
  for (let i = 1; i <= 200; i += 1) {
    const fin = quedaDelRebobinado(i * DT * comprime, duracionDelRebobinado(1))
    const antes = mostrado
    mostrado = suave(mostrado, Math.min(1, poder(fin)), DT)
    maximo = Math.max(maximo, antes - mostrado)
  }
  return maximo
}
const brilloBien = (suave: typeof poderSuave): boolean => bajaDelBrillo(suave, 1) <= 0.2 && bajaDelBrillo(suave, COMPRIME) <= 0.2
afirmar(brilloBien(poderSuave), '  el brillo se va en varios cuadros (no de golpe), en el rebobinado de P2 y en la vuelta del viaje', `lo más que baja en un cuadro: ${bajaDelBrillo(poderSuave, COMPRIME).toFixed(3)}`)
controlPositivo('  el detector VE el poder sin inercia (se apaga de un cuadro al otro en el golpe)', ((_a: number, objetivo: number) => objetivo) as typeof poderSuave, brilloBien)
// `?vuelta=corta` se borró (rechazada en PULIDO 1): no queda ni la prueba ni su lectura.
afirmar(!('vuelta' in entornoPedido('producto,vuelta=corta').pruebas) && !('vuelta' in ENTORNO.pruebas), '  `?vuelta=corta` ya no existe')

// Después del viaje, el reloj sale de su fase: al fondo con el pie entero vuelve a correr (como al llegar por scroll); fuera
// del fondo, espera en cero. Y un viaje que empieza a mitad de un rebobinado sigue desde donde estaba (sin saltos).
const salidaDelViajeBien = (paso: PasoDelReloj): boolean => {
  const alFondo: RelojDelFinal = { ...relojQuieto(), fin: 1, fase: 'corre' }
  for (let i = 0; i < 110; i += 1) paso(alFondo, { ...AL_FONDO, viajeS: 2.9 }, DT)
  const enCero = alFondo.fin === 0 && alFondo.fase === 'viaje'
  for (let i = 0; i < 30; i += 1) paso(alFondo, AL_FONDO, DT)
  const lejos: RelojDelFinal = { ...relojQuieto(), fin: 1, fase: 'corre' }
  for (let i = 0; i < 110; i += 1) paso(lejos, { ...AL_FONDO, alFondo: false, viajeS: 2.9 }, DT)
  for (let i = 0; i < 120; i += 1) paso(lejos, { ...AL_FONDO, alFondo: false }, DT)
  const aMitad: RelojDelFinal = { ...relojQuieto(), fin: 1, fase: 'corre' }
  paso(aMitad, { ...AL_FONDO, rebobinar: true }, DT)
  for (let i = 0; i < 30; i += 1) paso(aMitad, { ...AL_FONDO, sinGestoS: 1 }, DT)
  const [antes, pasoAntes] = [aMitad.fin, Math.abs(aMitad.velocidad) * DT]
  paso(aMitad, { ...AL_FONDO, viajeS: 2.9 }, DT)
  const sinSalto = Math.abs(aMitad.fin - antes) <= pasoAntes + 1e-9
  return enCero && alFondo.fase === 'corre' && alFondo.fin > 0 && lejos.fase === 'espera' && lejos.fin === 0 && sinSalto
}
afirmar(salidaDelViajeBien(pasoDelReloj), '  al terminar el viaje el reloj sale de su fase: al fondo con el pie entero vuelve a correr; fuera, espera en cero; un viaje a mitad de un rebobinado sigue desde donde estaba, sin saltos')
const clavado: PasoDelReloj = (r, e, dt) => {
  if (r.fase === 'viaje' && e.viajeS === 0) return
  pasoDelReloj(r, e, dt)
}
controlPositivo('  el detector VE un reloj que se queda en la fase del viaje', clavado, salidaDelViajeBien)

// El cableado: la escena lee la duración del viaje en curso; el quieto (giro y alejamiento) vuelve con el mismo reloj y,
// si la fase cambia (un viaje a mitad de un rebobinado), se toma de nuevo desde donde quedó.
const cuadroP5 = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const cableadoP5 = (c: string): boolean =>
  c.includes('viajeS: (viajeEnCurso()?.duracionMs ?? 0) / 1000, enElViajeS: enElViaje() }, dt)') && /if \(s\.reloj\.fase === 'rebobina' \|\| \(s\.reloj\.fase === 'viaje' && s\.reloj\.rebobinado\.dura > 0\)\) \{\s*if \(alRebobinar\.de !== s\.reloj\.fase\) \{\s*alRebobinar\.de = s\.reloj\.fase/.test(c) &&
  /quietoRebobinado\(alRebobinar, quedaDelRebobinado\(s\.reloj\.rebobinado\.s, s\.reloj\.rebobinado\.dura\), EN_VIVO\)/.test(c)
afirmar(cableadoP5(cuadroP5), '  el cableado: la escena lee cuánto dura el viaje en curso y el giro y el alejamiento del quieto vuelven con el mismo reloj (tomados de nuevo si un viaje corta un rebobinado)')
controlPositivo('  el detector VE un quieto que no se toma de nuevo (saltaría al giro del principio del rebobinado)', cuadroP5.replace('if (alRebobinar.de !== s.reloj.fase) {', 'if (alRebobinar.de === null) {'), cableadoP5)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P17-A · El CTA del final: la cámara sin el techo del domo en cuadro (1440, 1024, 768, 390, 375)')

// Antes: en C la cámara estaba a la altura del logo (0) y, con el logo contra el borde de abajo (`frameY` −1), miraba para
// arriba: el borde de arriba del cuadro tocaba la pared lejana a 42,9 de altura (46 con el mouse abajo) y el techo del domo
// (a `HAZ.arriba`, 40) entraba arriba. Ahora llega desde arriba y en el sostén sube y se acerca apenas (el dolly-in leve).
// Se mira la coreografía de verdad (la pista con sus curvas) de los valores al pie, con el mouse en sus dos puntas de altura,
// en los cinco aspectos: cada rayo del borde de arriba tiene que tocar la pared lejana por debajo del techo, con aire.
const ASPECTOS_P17 = [[1440, 900], [1024, 768], [768, 1024], [390, 844], [375, 812]] as const
const AIRE_DEL_TECHO = 2
/** Lo más alto que el borde de arriba del cuadro toca la pared lejana, en una pista, de los valores al pie. */
const bordeDeArriba = (pista: ReturnType<typeof buildTrack>): number => {
  const pose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
  const c = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 400)
  const rayo = new THREE.Vector3()
  let peor = Number.NEGATIVE_INFINITY
  for (let p = progresoDelFinal(TIEMPOS_DEL_FINAL.valores.hasta); p <= 1; p += 2e-4) {
    sampleTrack(pista, p, pose)
    for (const [ancho, alto] of ASPECTOS_P17) {
      c.aspect = ancho / alto
      c.updateProjectionMatrix()
      for (const [mouse, dolly] of [[-1, 0], [1, 0], [-1, DOLLY_DEL_CTA.u], [1, DOLLY_DEL_CTA.u]]) {
        // Como el rig: la cámara en la órbita (con la altura que le suma el mouse y, por las dudas en todo el camino, el
        // dolly-in del CTA), mirando al centro, y el encuadre.
        const az = THREE.MathUtils.degToRad(pose.angleDeg)
        const distancia = pose.distance - dolly
        const altura = pose.height + mouse * MOUSE_HEIGHT_FACTOR * distancia
        c.position.set(Math.sin(az) * distancia, altura, Math.cos(az) * distancia)
        c.lookAt(0, ORBIT_TARGET_Y, 0)
        if (pose.frameX !== 0 || pose.frameY !== 0) aimWithFraming(c, c.aspect, 6.86, 4.78, Math.hypot(distancia, altura - ORBIT_TARGET_Y), pose.frameX, pose.frameY)
        c.updateMatrixWorld()
        for (let i = 0; i <= 16; i += 1) {
          rayo.set(-1 + i / 8, 1, 0.5).unproject(c).sub(c.position).normalize()
          const o = c.position
          const a = rayo.x * rayo.x + rayo.z * rayo.z
          const b = 2 * (o.x * rayo.x + o.z * rayo.z)
          const k = o.x * o.x + o.z * o.z - MOIRE_FAR_RADIUS * MOIRE_FAR_RADIUS
          peor = Math.max(peor, o.y + ((-b + Math.sqrt(b * b - 4 * a * k)) / (2 * a)) * rayo.y)
        }
      }
    }
  }
  return peor
}
const PISTA_P17 = buildTrack(CHOREO_KEYFRAMES)
const techoBien = (pista: ReturnType<typeof buildTrack>): boolean => bordeDeArriba(pista) <= HAZ.arriba - AIRE_DEL_TECHO
const bordeHoy = bordeDeArriba(PISTA_P17)
afirmar(techoBien(PISTA_P17), 'en ningún aspecto ni con el mouse en sus puntas el borde de arriba del cuadro llega al techo del domo: de los valores al pie, toca la pared lejana por debajo del techo con aire', `lo más alto: ${bordeHoy.toFixed(1)} (el techo, a ${String(HAZ.arriba)})`)
const conLaDeAntes = CHOREO_KEYFRAMES.map((k) => (k.name === 'cta' || k.name === 'cta · sostén' ? { ...k, pose: { ...k.pose, height: 0, distance: 32 } } : k))
controlPositivo('el detector VE la cámara de antes (a la altura del logo, a 32: el techo arriba)', buildTrack(conLaDeAntes), techoBien)
// El dolly-in leve al llegar, por tiempo (la pista sostiene la pose: s9e): en el sostén del CTA se acerca menos del 5 % de
// la distancia en `entraS`, con curva suave; fuera vuelve; lo aplica el rig sólo con movimiento.
const C = POSES_DEL_FINAL.cta
type PasoDelDolly = typeof pasoDelDolly
const dollyBien = (paso: PasoDelDolly): boolean => {
  let k = 0
  const enElCta = progresoDelFinal((TIEMPOS_DEL_FINAL.cta.llega + TIEMPOS_DEL_FINAL.cta.hasta) / 2)
  const muestras: number[] = []
  for (let i = 0; i < 240; i += 1) {
    k = paso(k, enElSostenDelCta(enElCta), DT)
    muestras.push(dollyDelCta(k))
  }
  const llega = muestras.findIndex((d) => d >= DOLLY_DEL_CTA.u - 1e-9) * DT
  const maxPorCuadro = Math.max(...muestras.map((d, i) => (i === 0 ? d : d - muestras[i - 1])))
  for (let i = 0; i < 240; i += 1) k = paso(k, enElSostenDelCta(progresoDelFinal(TIEMPOS_DEL_FINAL.pie.llega)), DT)
  return C.height > 0 && C.frameY === -1 && DOLLY_DEL_CTA.u < 0.05 * Math.hypot(C.distance, C.height) && Math.abs(llega - DOLLY_DEL_CTA.entraS) <= 2 * DT && maxPorCuadro < (2 * DOLLY_DEL_CTA.u * DT) / DOLLY_DEL_CTA.entraS && k === 0 && !enElSostenDelCta(progresoDelFinal(TIEMPOS_DEL_FINAL.valores.hasta))
}
const rigP17 = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
afirmar(dollyBien(pasoDelDolly) && rigP17.includes('scratch.dolly.k = pasoDelDolly(scratch.dolly.k, physics && enElSostenDelCta(rigValues.progress), delta)') && rigP17.includes('distance -= dollyDelCta(scratch.dolly.k)'), '  al llegar, un dolly-in leve por tiempo (menos del 5 % de la distancia, en 1,6 s, con curva suave; fuera del sostén vuelve), sólo con movimiento', `ojo ${Math.hypot(C.distance, C.height).toFixed(2)} → ${(Math.hypot(C.distance, C.height) - DOLLY_DEL_CTA.u).toFixed(2)}`)
controlPositivo('  el detector VE un dolly de golpe (en un cuadro)', ((k: number, en: boolean) => (en ? 1 : 0)) as PasoDelDolly, dollyBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P17-B/C · Las variantes del CTA (`?cta=a|b|c|d`): sin bandera, el CTA de hoy; cada una con su entrada, su hover (su toque) y su salida')

// Sin bandera no hay variante y nada cambia: el envoltorio devuelve sus hijos tal cual y las letras, su texto (el primer
// render del cliente es también ése: la bandera se lee después de hidratar).
const sinVariante = renderToStaticMarkup(
  <CtaDelFinal llegada={null}>
    <p data-pieza="x">
      <LetrasDelCta texto="Hablanos" />
    </p>
  </CtaDelFinal>,
)
const porQueP17 = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
const defaultBien = (html: string, f: string): boolean =>
  html === '<p data-pieza="x">Hablanos</p>' && ENTORNO.pruebas.cta === 'no' && f.includes("abreElContacto={variante === null ? undefined : 'panel'}") && (f.match(/<CtaDelFinal /g) ?? []).length === 2
afirmar(defaultBien(sinVariante, porQueP17), 'sin `?cta=` el CTA es el de hoy: el envoltorio devuelve sus hijos tal cual, las letras su texto y el botón no abre el panel (va al pie, como antes); con una variante, abre Contacto', sinVariante)
controlPositivo('el detector VE un envoltorio que agrega una caja aun sin variante', renderToStaticMarkup(<div data-cta-variante="no"><p data-pieza="x">Hablanos</p></div>), (html: string) => defaultBien(html, porQueP17))

// Las cuatro, por sus cuentas puras (las mismas que usan el DOM y la escena).
const L = CTA_DEL_FINAL.losa
const losaBien = (f: typeof inclinacionDeLaLosa): boolean => {
  const sube = [0, 0.25, 0.5, 0.75, 1].map((l) => f(l, 0))
  const baja = [0, 0.5, 1].map((s) => f(1, s))
  return sube[0] === L.acostada && sube[4] === 0 && sube.every((g, i) => i === 0 || g <= sube[i - 1]) && baja[0] === 0 && baja[2] === L.acostada && baja[1] > 0
}
afirmar(losaBien(inclinacionDeLaLosa) && filoEn(0) === 0 && Math.abs(filoEn(L.vueltaDelFiloS * 0.5) - 0.5) < 1e-9 && Math.abs(filoEn(L.vueltaDelFiloS * 1.25) - 0.25) < 1e-9, '  a · la losa nace acostada (90°), se levanta con la llegada y vuelve a acostarse al abrir Contacto; el filo da una vuelta por el borde cada 1,4 s')
controlPositivo('  el detector VE una losa que no se acuesta al abrir Contacto', ((l: number) => L.acostada * (1 - l)) as typeof inclinacionDeLaLosa, losaBien)

const H = CTA_DEL_FINAL.haz
const hazBien = (haz: typeof hazDelCta, letra: typeof letraDelHaz): boolean => {
  // El haz: baja en `bajaS`; su luz parpadea (falla antes de prender) y queda prendida.
  const luces = Array.from({ length: 200 }, (_, i) => haz((i / 200) * H.guionS * 1.2).luz)
  let apagones = 0
  for (let i = 1; i < luces.length; i += 1) if (luces[i] < 0.05 && luces[i - 1] >= 0.05) apagones += 1
  const bajo = haz(H.bajaS).baja === 1 && haz(H.bajaS * 0.5).baja < 1 && haz(0).baja === 0
  // Las letras: apagadas antes, se encienden EN SECUENCIA (cada una después de la anterior) y quedan prendidas.
  const prende = (i: number): number => {
    for (let s = 0; s < 6; s += 0.005) if (letra(i, s) >= 0.95) return s
    return Number.POSITIVE_INFINITY
  }
  const orden = [0, 5, 10, 20, 40].map(prende)
  return bajo && apagones >= 2 && luces[luces.length - 1] === 1 && letra(0, 0) === H.apagada && orden.every((s, i) => Number.isFinite(s) && (i === 0 || s > orden[i - 1])) && letra(40, 6) === 1
}
afirmar(hazBien(hazDelCta, letraDelHaz), '  b · el haz baja sobre el CTA con el parpadeo de su encendido (falla antes de prender) y las letras se encienden en secuencia, una después de la otra, y quedan prendidas')
controlPositivo('  el detector VE todas las letras a la vez', hazDelCta, (h: typeof hazDelCta) => hazBien(h, (i: number, s: number) => letraDelHaz(0, s)))

const escalonBien = (f: typeof alturaDelEscalon): boolean =>
  f(0, 0) === 0 && f(1, 0) === CTA_DEL_FINAL.bloques.alto && f(1, 1) === CTA_DEL_FINAL.bloques.alto && f(0.4, 0) > f(0.4, 1) && f(0.4, 1) >= 0
afirmar(escalonBien(alturaDelEscalon) && gestoDelToque(0) === 0 && gestoDelToque(CTA_DEL_FINAL.toqueS * 0.5) > 0.99 && gestoDelToque(CTA_DEL_FINAL.toqueS * 1.01) === 0, '  c · el escalón se arma del centro a los bordes hasta su alto; el toque con el dedo es un gesto que sube y baja en 0,7 s')
controlPositivo('  el detector VE un escalón que sube entero de una vez', ((a: number) => CTA_DEL_FINAL.bloques.alto * a) as typeof alturaDelEscalon, escalonBien)

// d · la placa de Contacto sale del punto del clic: su viaje desde el fondo con un corrimiento que se ve en el punto al nacer
// y en el centro al llegar, sin pasarse (el corrimiento aparente baja parejo); sin punto, el de siempre (ninguno).
const portalBien = (f: typeof viajeDesdeElPunto): boolean => {
  const sin = f(null)
  const con = f({ x: 300, y: -120 })
  const VIAJE_P17 = viajeDesdeElFondo()
  const escala = VIAJE_P17.map((z) => PERSPECTIVA_DE_LA_PLACA / (PERSPECTIVA_DE_LA_PLACA - z))
  const aparente = con.x.map((x, i) => x * escala[i])
  return sin.x.every((x) => x === 0) && sin.y.every((y) => y === 0) && Math.abs(aparente[0] - 300) < 1e-6 && Math.abs(con.y[0] * escala[0] + 120) < 1e-6 && aparente[aparente.length - 1] === 0 && aparente.every((a, i) => i === 0 || a <= aparente[i - 1] + 1e-9)
}
afirmar(portalBien(viajeDesdeElPunto), '  d · la placa de Contacto sale del punto del clic (se ve ahí al nacer y en el centro al llegar, sin pasarse); sin punto, el viaje de siempre')
controlPositivo('  el detector VE un corrimiento lineal (con la perspectiva, la placa volaría fuera de la pantalla a mitad del viaje)', ((p: { readonly x: number; readonly y: number } | null) => {
  const n = viajeDesdeElFondo().length
  return { x: Array.from({ length: n }, (_, i) => (p === null ? 0 : p.x * (1 - i / (n - 1)) * 50)), y: Array.from({ length: n }, (_, i) => (p === null ? 0 : p.y * (1 - i / (n - 1)) * 50)) }
}) as typeof viajeDesdeElPunto, portalBien)

// El cableado: la escena monta lo suyo sólo con una variante; el piso y la trama se parchean sólo con la suya; la apertura
// guarda el punto sólo desde el portal; el hover lo dan el puntero y el foco del teclado, y el toque, el dedo.
const escenarioP17 = sinComentarios(leer('_lib/escena/ProbeStage.tsx'))
const pisoP17 = sinComentarios(leer('_lib/escena/piso/PisoVivo.tsx'))
const moireP17 = sinComentarios(leer('_lib/escena/MoireScreen.tsx'))
const aperturaP17 = sinComentarios(leer('_chrome/contacto/apertura.ts'))
const ctaP17 = sinComentarios(leer('_componentes/ctaDelFinal/CtaDelFinal.tsx'))
const cableadoP17 = (escenario: string): boolean =>
  escenario.includes('{varianteDelCta() !== null && <PiezaDelCta quieto={reducedMotion} />}') &&
  pisoP17.includes("const conEscalon = varianteDelCta() === 'c'") && pisoP17.includes('if (conEscalon) conElEscalonEnLaSimulacionDe(sim.material)') && pisoP17.includes('if (conEscalon) conElEscalonEnElPiso(material)') &&
  moireP17.includes("if (varianteDelCta() === 'd') {") &&
  aperturaP17.includes("objetivo.closest('[data-cta-desde-el-punto]') !== null ? puntoDelClic(e, objetivo) : null") && aperturaP17.includes('estado = { ...estado, abierto: true, precarga, origen, punto: puntoDelPedido }') &&
  ctaP17.includes('onPointerDown={alApretar}') && ctaP17.includes("e.target.matches(':focus-visible')") && ctaP17.includes("if (e.pointerType === 'touch') return")
afirmar(cableadoP17(escenarioP17), '  el cableado: la escena monta lo suyo sólo con una variante, el piso y la trama se parchean sólo con la suya, el punto del clic sólo desde el portal; hover con el puntero o el foco, y con el dedo un toque (sin hover)')
controlPositivo('  el detector VE la pieza de la escena montada siempre', escenarioP17.replace('{varianteDelCta() !== null && <PiezaDelCta quieto={reducedMotion} />}', '<PiezaDelCta quieto={reducedMotion} />'), cableadoP17)
// El piso y la trama con su parche: compilan contra el sombreador de verdad (las anclas existen) y, sin uniformes, no cambian nada.
const simP17 = conElEscalonEnLaSimulacion(conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL)))
afirmar(simP17.includes('dibujo = max( dibujo, escalonDelCta( xz ) );') && simP17.includes('if ( uArmadoDelEscalon <= 0.0 ) return 0.0;') && CTA_EN_EL_PISO.uArmadoDelEscalon.value === 0 && PORTAL_EN_VIVO.uPortal.value.z === 0, '  el escalón entra en la simulación del piso de verdad (sin armar, no hace nada) y el tirón del moiré arranca en cero')

cerrar('s52-pulido-1')
