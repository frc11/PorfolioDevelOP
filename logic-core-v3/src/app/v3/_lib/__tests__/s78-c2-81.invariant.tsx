/**
 * s78 · C2-81 (cola 2, 2026-10-23) · EL PRELOADER CONTINUO Y EL MOVIMIENTO DEL TELÉFONO, sin navegador. Cada afirmación con su control.
 *
 *   1 · el preloader en el compositor: todas sus animaciones son sólo de `opacity` y `transform`; reproducen la línea (`vistaDeLaLinea`)
 *       en el tiempo; la capa y la flecha no escriben estilos por cuadro; las rayas aparecen cuando llega el dibujo y la punta recorre
 *       el camino sin vueltas de 360°; lo frenable es sólo el último 20 %;
 *   2 · la preparación de la escena repartida: espera a que la bienvenida terminó de aparecer (con su seguro) y se calienta en partes;
 *   3 · el movimiento: dónde va, apagado por defecto (con movimiento reducido también), la inclinación mueve el puntero de la cámara y el
 *       moiré (con su filtro suave), apagarlo suelta los dos, y con el permiso negado no pasa nada;
 *   4 · el cableado: el botón (sus `aria-label`, su ícono de trazo 1,5, arriba a la derecha y sólo abajo de 1024), la frase del preloader
 *       (05-TEXTOS) que prende los dos, el prototipo del parlante que se fue.
 *
 * Lo que se ve y se mide en el tiempo real lo mide el orquestador: `scripts-carga/preloader.ts` y `scripts-carga/movimiento.ts`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { RAIZ } from './s3-archivos'
import { PULSO_DE_LA_PUNTA, TAU_DEL_FRENO, apareceLaRaya, fundidosDelTexto, inicioDeLaFlecha, recorridosDeLaPunta, salidaDeLaCapa, tauDelTrazo, type Animacion, type CuadroClave } from '../../_chrome/preloader/animaciones'
import { LINEA, lineaNueva, pasoDeLaLinea, trazoDeLaFlecha, vistaDeLaLinea, type EstadoDeLaLinea } from '../../_chrome/preloader/linea'
import { rayasDeLaFlecha, trazarLaFlecha } from '../../_chrome/preloader/trazado'
import { laPreparacionPuede, permitirLaPreparacion, SEGURO_DE_LA_PREPARACION_MS } from '../entrada'
import { calentarUnaParte, partesParaCalentar } from '../escena/gpu/partes'
import { GIROSCOPIO, INCLINACION_DEL_TELEFONO, estadoDelGiroscopio, filtrarLaInclinacion } from '../escena/giroscopio'
import { hayEntradaDeAfuera, laEntradaDelMoire } from '../escena/moire/entrada'
import { CLAVE_DEL_MOVIMIENTO, activarElMovimiento, arrancaPrendido, desactivarElMovimiento, hayMovimiento, llevaMovimiento, retomarElMovimiento } from '../escena/movimiento'

const V3 = 'src/app/v3'
const leer = (r: string): string => readFileSync(path.join(RAIZ, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El preloader en el compositor: sólo opacity y transform, la línea exacta, ningún estilo escrito por cuadro')

const V = { ancho: 1440, alto: 900 }
const TRAZADO_1440 = trazarLaFlecha([{ x: 457, y: 434, ancho: 526, alto: 38 }], { x: 32, y: 24, ancho: 48, alto: 48 }, V, 'derecha', 'ultimo')
const RAYAS_1440 = rayasDeLaFlecha(TRAZADO_1440, V)
const todas = (reducido: boolean): Animacion[] => {
  const f = fundidosDelTexto(reducido)
  return [f.bienvenida, f.blanco, f.frase, salidaDeLaCapa(reducido), ...RAYAS_1440.map((r) => apareceLaRaya(r, TRAZADO_1440.camino.largo, reducido)), ...recorridosDeLaPunta(TRAZADO_1440, reducido).map((t) => t.animacion), PULSO_DE_LA_PUNTA]
}
const PERMITIDAS = new Set(['opacity', 'transform', 'offset', 'easing'])
const soloCompositor = (as: readonly Animacion[]): boolean =>
  as.every((a) => a.cuadros.length >= 2 && a.cuadros.every((c) => Object.keys(c).every((k) => PERMITIDAS.has(k)) && (c.transform === undefined || /^((translate|rotate|scale)\([^)]*\)\s*)+$/.test(c.transform))))
const lasDelPreloader = [...todas(false), ...todas(true)]
afirmar(soloCompositor(lasDelPreloader), `las ${String(lasDelPreloader.length)} animaciones del preloader (el texto, el blanco, la salida, cada raya, la punta y su pulso, normal y con movimiento reducido) son sólo de \`opacity\` y \`transform\` (traslados, giros y escalas): las anima el compositor`)
controlPositivo('  el detector ve una flecha que se dibuja con `stroke-dashoffset` (la de antes)', [...lasDelPreloader, { cuadros: [{ strokeDashoffset: 100 } as CuadroClave, { strokeDashoffset: 0 } as CuadroClave], duracion: 1500, demora: 0, relleno: 'both' } as Animacion], soloCompositor)
controlPositivo('  y una punta que se mueve con `left`', [{ cuadros: [{ transform: 'translate(0px, 0px)' }, { transform: 'translate(1px, 1px)', left: '3px' } as CuadroClave], duracion: 1, demora: 0, relleno: 'both' } as Animacion], soloCompositor)

/** El valor de una animación en `tiempo` (ms desde su origen), con las curvas exactas (`x(s) = s`: controles de x en 1/3 y 2/3). */
const curva = (easing: string | undefined): ((s: number) => number) => {
  if (easing === undefined || easing === 'linear') return (s) => s
  const m = /^cubic-bezier\(([^)]+)\)$/.exec(easing)
  if (m === null) throw new Error(`curva desconocida ${easing}`)
  const [x1, y1, x2, y2] = m[1].split(',').map(Number)
  if (Math.abs(x1 - 1 / 3) > 1e-4 || Math.abs(x2 - 2 / 3) > 1e-4) throw new Error('el evaluador sólo sabe de x(s) = s')
  return (s) => 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s * s * y2 + s ** 3
}
function valor(a: Animacion, tiempo: number): number | null {
  const local = tiempo - a.demora
  const ops = a.cuadros.map((c) => c.opacity ?? Number.NaN)
  if (local < 0) return a.relleno === 'both' ? ops[0] : null
  if (a.duracion === 0 || local >= a.duracion) return a.relleno === 'none' ? null : ops[ops.length - 1]
  const p = local / a.duracion
  const off = a.cuadros.map((c, i) => c.offset ?? (i === 0 ? 0 : i === a.cuadros.length - 1 ? 1 : Number.NaN))
  for (let i = 0; i < a.cuadros.length - 1; i += 1) {
    if (p >= off[i] && p <= off[i + 1]) {
      const q = off[i + 1] === off[i] ? 1 : (p - off[i]) / (off[i + 1] - off[i])
      return ops[i] + (ops[i + 1] - ops[i]) * curva(a.cuadros[i].easing)(q)
    }
  }
  return null
}
function simular(): EstadoDeLaLinea[] {
  const e = lineaNueva()
  const m: EstadoDeLaLinea[] = []
  while (e.etapa !== 'fuera') {
    pasoDeLaLinea(e, 1000 / 60, true, false)
    m.push({ ...e })
  }
  return m
}
const recorrido = simular()
const reproduce = (f: ReturnType<typeof fundidosDelTexto>, salida: Animacion): number => {
  let peor = 0
  const desdeLaSalida = recorrido.find((x) => x.salidaDesde !== null)?.salidaDesde ?? 0
  for (const e of recorrido) {
    const v = vistaDeLaLinea(e, false)
    const capa = e.salidaDesde === null ? 1 : (valor(salida, e.t - desdeLaSalida) ?? 1)
    for (const [esperado, obtenido] of [
      [v.bienvenida, valor(f.bienvenida, e.t)],
      [v.blanco, valor(f.blanco, e.t)],
      [v.frase, valor(f.frase, e.t)],
      [v.capa, capa],
    ] as const)
      peor = Math.max(peor, Math.abs(esperado - (obtenido ?? Number.NaN)))
  }
  return peor
}
const desvio = reproduce(fundidosDelTexto(false), salidaDeLaCapa(false))
afirmar(desvio < 2e-3, `las animaciones reproducen la línea cuadro a cuadro (la bienvenida, el blanco, la frase y la salida, contra \`vistaDeLaLinea\` en ${String(recorrido.length)} cuadros): las curvas del sitio como \`cubic-bezier\` exactos`, `el peor desvío, ${desvio.toExponential(1)}`)
const lineal = fundidosDelTexto(false)
controlPositivo('  el detector ve una bienvenida que entra con otra curva (lineal)', { ...lineal, bienvenida: { ...lineal.bienvenida, cuadros: lineal.bienvenida.cuadros.map((c) => ({ ...c, easing: undefined })) } }, (f) => reproduce(f, salidaDeLaCapa(false)) < 2e-3)
const reducida = fundidosDelTexto(true)
const reducidaBien = (f: typeof reducida): boolean => valor(f.bienvenida, 0) === 1 && valor(f.bienvenida, 349) === 1 && valor(f.bienvenida, 351) === 0 && valor(f.frase, 351) === 1 && valor(f.blanco, 100) === 0 && f.bienvenida.duracion === 0 && inicioDeLaFlecha(true) === 350
afirmar(reducidaBien(reducida), '  con movimiento reducido, saltos sin fundido: la bienvenida hasta los 350 ms y de golpe el blanco con la frase (y la flecha ya dibujada)')
controlPositivo('  el detector ve la reducida con fundidos', fundidosDelTexto(false), reducidaBien)

// Las rayas, cuando llega el dibujo; la punta, sin vueltas; lo frenable, el último 20 %.
const inversaBien = (tau: (y: number) => number): boolean => [0, 0.1, 0.3, 0.5, 0.62, 0.8, 0.97, 1].every((y) => Math.abs(trazoDeLaFlecha(tau(y)) - y) < 1e-9)
afirmar(inversaBien(tauDelTrazo) && Math.abs(trazoDeLaFlecha(TAU_DEL_FRENO) - LINEA.frenoDesde) < 1e-9, `cada raya aparece cuando el dibujo llega a su principio (la inversa exacta del trazo); el freno, desde el ${String(LINEA.frenoDesde * 100)} % (${TAU_DEL_FRENO.toFixed(0)} ms de la flecha)`)
controlPositivo('  el detector ve rayas que aparecen a ritmo parejo (sin la curva del trazo)', (y: number) => y * LINEA.flechaMs, inversaBien)
const punta = recorridosDeLaPunta(TRAZADO_1440, false)
const angulo = (c: CuadroClave): number => Number(/rotate\(([-\d.]+)deg\)/.exec(c.transform ?? '')?.[1])
const puntaBien = (tramos: typeof punta): boolean => {
  const cuadros = tramos.flatMap((t) => t.animacion.cuadros)
  const offs = tramos.every((t) => t.animacion.cuadros.every((c, i, cs) => (c.offset ?? 0) >= 0 && (c.offset ?? 0) <= 1 && (i === 0 || (c.offset ?? 0) >= (cs[i - 1].offset ?? 0))))
  const sinVueltas = cuadros.every((c, i) => i === 0 || Math.abs(angulo(c) - angulo(cuadros[i - 1])) < 60)
  const ultimo = cuadros[cuadros.length - 1].transform ?? ''
  const llega = ultimo.startsWith(`translate(${TRAZADO_1440.punta.x.toFixed(2)}px, ${TRAZADO_1440.punta.y.toFixed(2)}px)`)
  const partes = tramos.length === 2 && !tramos[0].frenable && tramos[1].frenable && tramos[1].animacion.demora === TAU_DEL_FRENO && tramos[0].animacion.duracion + tramos[1].animacion.duracion === LINEA.flechaMs
  return offs && sinVueltas && llega && partes
}
afirmar(puntaBien(punta), `la punta recorre el camino (${String(punta.reduce((n, t) => n + t.animacion.cuadros.length, 0))} cuadros clave, el ángulo desenrollado) y termina en el borde del botón; en dos tramos: el libre y el frenable (desde el freno)`)
controlPositivo('  el detector ve un ángulo que da la vuelta entre dos cuadros (giraría 360°)', punta.map((t, i) => (i === 0 ? { ...t, animacion: { ...t.animacion, cuadros: t.animacion.cuadros.map((c, k) => (k === 5 ? { ...c, transform: (c.transform ?? '').replace(/rotate\(([-\d.]+)deg\)/, (_, a: string) => `rotate(${String(Number(a) + 360)}deg)`) } : c)) } } : t)), puntaBien)

// La capa y la flecha no escriben estilos por cuadro: todo va por `animar` (el reloj) o por `animate`.
const CAPA = sinComentarios(leer(`${V3}/_chrome/preloader/CapaDelPreloader.tsx`))
const FLECHA = sinComentarios(leer(`${V3}/_chrome/preloader/FlechaDelSonido.tsx`))
const sinEstilosPorCuadro = (fuentes: readonly string[]): boolean =>
  fuentes.every((c) => !/\.style\.(opacity|transform)\s*=|strokeDashoffset|setAttribute\('transform'|\.style\.setProperty\('opacity'/.test(c)) &&
  /animar\(el, a, r, 0\)/.test(fuentes[0]) && /animar\(capa, salidaDeLaCapa\(decision\.reducido\), r, e\.salidaDesde\)/.test(fuentes[0]) && /animar\(el, a, r, origen\)/.test(fuentes[1])
afirmar(sinEstilosPorCuadro([CAPA, FLECHA]), 'la capa y la flecha no escriben `opacity`, `transform` ni el trazo por cuadro: el texto, la salida y cada raya van con `animar` (alineadas con el reloj, en el compositor)')
controlPositivo('  el detector ve la capa de antes (las opacidades escritas por cuadro desde el rAF)', [`${CAPA}\nif (bienvenida.current !== null) bienvenida.current.style.opacity = String(v.bienvenida)`, FLECHA], sinEstilosPorCuadro)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La preparación de la escena, repartida: después de que la bienvenida apareció, y en partes')

;(globalThis as unknown as { window: unknown }).window = { __preloaderDelSitio: { activo: true, desde: 100 }, location: { search: '' } }
const antesDePermitir = laPreparacionPuede(100 + LINEA.bienvenidaEntraMs)
const conElSeguro = laPreparacionPuede(100 + SEGURO_DE_LA_PREPARACION_MS)
permitirLaPreparacion()
const despues = laPreparacionPuede(100 + LINEA.bienvenidaEntraMs)
afirmar(!antesDePermitir && conElSeguro && despues, `con el preloader, la escena no se prepara hasta que la capa lo dice (la bienvenida terminó de aparecer); si la capa nunca llega, a los ${String(SEGURO_DE_LA_PREPARACION_MS / 1000)} s igual`)
const PRECOMPILAR = sinComentarios(leer(`${V3}/_lib/escena/gpu/Precompilar.tsx`))
const ENTRADA = sinComentarios(leer(`${V3}/_lib/entrada.ts`))
const esperaBien = (p: string, en: string, c: string): boolean =>
  /if \(e\.cuadros < CUADROS_DESPUES_DEL_LOGO\) return\s*if \(!laPreparacionPuede\(\)\) return\s*e\.compilado = true/.test(p) && /if \(preparacionPermitida \|\| entradaAbierta\(\)\) return true/.test(en) && /e\.t >= LINEA\.bienvenidaEntraMs\)\) \{\s*preparacion = true\s*permitirLaPreparacion\(\)/.test(c) && /calentarUnaParte\(gl, escena, camara, e\.partes\[e\.parte\]\)\s*e\.parte \+= 1[\s\S]*?return/.test(p)
afirmar(esperaBien(PRECOMPILAR, ENTRADA, CAPA), '  en las fuentes: la compilación espera el permiso (sin preloader, siempre); la capa lo da cuando la bienvenida llegó a 1; el calentado, una parte por cuadro')
controlPositivo('  el detector ve la compilación que no espera', [PRECOMPILAR.replace(/if \(!laPreparacionPuede\(\)\) return\s*/, ''), ENTRADA, CAPA] as const, ([p, en, c]) => esperaBien(p, en, c))
controlPositivo('  y la capa que la suelta desde el arranque (en pleno fundido)', [PRECOMPILAR, ENTRADA, CAPA.replace('e.t >= LINEA.bienvenidaEntraMs', 'e.t >= 0')] as const, ([p, en, c]) => esperaBien(p, en, c))

// El calentado en partes: cada malla en una sola parte; en el dibujo de una, sólo las suyas (y los grupos prendidos); después, todo como estaba.
const escena = new THREE.Scene()
const grupo = new THREE.Group()
grupo.visible = false
escena.add(grupo)
const material = new THREE.MeshBasicMaterial()
const mallas = Array.from({ length: 13 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), material)
  m.visible = i % 3 !== 0
  m.frustumCulled = i % 2 === 0
  ;(i < 4 ? grupo : escena).add(m)
  return m
})
const camara = new THREE.PerspectiveCamera()
const partesBien = (calentarUna: typeof calentarUnaParte): boolean => {
  const partes = partesParaCalentar(escena, 6)
  const cubiertas = partes.flat()
  const antes = mallas.map((m) => [m.visible, m.frustumCulled])
  const dibujadas: THREE.Object3D[][] = []
  const gl = { setScissorTest: () => undefined, setScissor: () => undefined, render: (e: THREE.Object3D) => void dibujadas.push(mallas.filter((m) => { let o: THREE.Object3D | null = m; while (o !== null) { if (!o.visible) return false; o = o.parent } return e === escena })) }
  for (const p of partes) calentarUna(gl as unknown as Parameters<typeof calentarUnaParte>[0], escena, camara, p)
  const restaurado = mallas.every((m, i) => m.visible === antes[i][0] && m.frustumCulled === antes[i][1])
  return partes.length === 6 && cubiertas.length === 13 && new Set(cubiertas).size === 13 && dibujadas.every((d, i) => d.length === partes[i].length && d.every((m) => partes[i].includes(m))) && restaurado
}
afirmar(partesBien(calentarUnaParte), '  el calentado en 6 partes: cada malla (también las invisibles y las de un grupo apagado) en una sola; cada dibujo, sólo las de su parte; después, todo como estaba')
controlPositivo('  el detector ve el calentado de antes (todo de una, en cada parte)', ((gl, e, c) => {
  const tocados: [THREE.Object3D, boolean][] = []
  e.traverse((o) => {
    tocados.push([o, o.visible])
    o.visible = true
  })
  gl.render(e as THREE.Scene, c)
  for (const [o, v] of tocados) o.visible = v
}) as typeof calentarUnaParte, partesBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El movimiento: dónde va, apagado por defecto, la cámara y el moiré, y el permiso negado')

const aparatos = [
  { tactil: true, escritorio: false, conSensor: true, va: true },
  { tactil: true, escritorio: true, conSensor: true, va: false },
  { tactil: false, escritorio: false, conSensor: true, va: false },
  { tactil: true, escritorio: false, conSensor: false, va: false },
] as const
const vaBien = (f: typeof llevaMovimiento): boolean => aparatos.every((a) => f(a) === a.va)
afirmar(vaBien(llevaMovimiento), 'va en el teléfono y la tablet (táctil, abajo de 1024 y con el sensor); en escritorio (también una pantalla táctil de 1024 o más) y sin sensor, no')
controlPositivo('  el detector ve el movimiento en escritorio', ((a: Parameters<typeof llevaMovimiento>[0]) => a.tactil && a.conSensor) as typeof llevaMovimiento, vaBien)

// Un teléfono de mentira: los oyentes, el almacenamiento de la sesión, los relojes y el permiso.
interface Oyente {
  readonly tipo: string
  readonly f: (e: unknown) => void
}
const oyentes: Oyente[] = []
const sesion = new Map<string, string>()
const consultas = { reducido: true, tactil: true, escritorio: false }
let permiso: (() => Promise<'granted' | 'denied'>) | undefined
const relojes: (() => void)[] = []
const ventana = {
  __preloaderDelSitio: { activo: true, desde: 100 },
  location: { search: '' },
  DeviceOrientationEvent: {},
  matchMedia: (q: string) => ({ matches: q.includes('reduced-motion') ? consultas.reducido : q.includes('coarse') ? consultas.tactil : q.includes('min-width') ? consultas.escritorio : false }),
  sessionStorage: { getItem: (k: string) => sesion.get(k) ?? null, setItem: (k: string, v: string) => void sesion.set(k, v) },
  addEventListener: (tipo: string, f: (e: unknown) => void) => void oyentes.push({ tipo, f }),
  removeEventListener: (tipo: string, f: (e: unknown) => void) => {
    const i = oyentes.findIndex((o) => o.tipo === tipo && o.f === f)
    if (i >= 0) oyentes.splice(i, 1)
  },
  setTimeout: (f: () => void) => relojes.push(f),
  clearTimeout: () => undefined,
}
;(globalThis as unknown as { window: unknown }).window = ventana
;(globalThis as unknown as { document: unknown }).document = { visibilityState: 'visible', addEventListener: () => undefined, removeEventListener: () => undefined }
;(globalThis as unknown as { DeviceOrientationEvent: unknown }).DeviceOrientationEvent = {
  get requestPermission() {
    return permiso
  },
}
const inclinar = (beta: number, gamma: number, t: number): void => {
  for (const o of oyentes.filter((x) => x.tipo === 'deviceorientation')) o.f({ beta, gamma, timeStamp: t })
}
const escucha = (): boolean => oyentes.some((o) => o.tipo === 'deviceorientation')
const esperar = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

async function movimiento(): Promise<void> {
  // Con movimiento reducido y nada guardado en la sesión: apagado (no se prende solo, ni se escucha el sensor).
  retomarElMovimiento()
  const reducidoApagado = { estado: estadoDelGiroscopio(), escucha: escucha(), hay: hayMovimiento() }
  afirmar(reducidoApagado.hay && reducidoApagado.estado === 'apagado' && !reducidoApagado.escucha && !arrancaPrendido(null) && arrancaPrendido('si') && !arrancaPrendido('no'), 'con movimiento reducido arranca apagado (y sin movimiento reducido también: se recomienda prenderlo); lo prendido a mano dura la sesión')
  controlPositivo('  el detector ve uno que arranca prendido', { ...reducidoApagado, estado: 'prendido' }, (r) => r.hay && r.estado === 'apagado' && !r.escucha)

  // A mano (con movimiento reducido igual se puede), con el permiso de iOS concedido: la inclinación mueve el puntero de la cámara y el moiré.
  permiso = () => Promise.resolve('granted')
  activarElMovimiento()
  const pidiendo = estadoDelGiroscopio()
  await esperar()
  inclinar(60, 0, 0)
  for (let k = 1; k <= 40; k += 1) inclinar(60, GIROSCOPIO.gradosDelBorde.costado / 2, k * 16)
  const prendido = { pidiendo, estado: estadoDelGiroscopio(), x: INCLINACION_DEL_TELEFONO.x, activa: INCLINACION_DEL_TELEFONO.activa, moire: hayEntradaDeAfuera(), moireX: laEntradaDelMoire({ x: 9, y: 9 }).x, sesion: sesion.get(CLAVE_DEL_MOVIMIENTO) }
  const mueveBien = (p: typeof prendido): boolean => p.pidiendo === 'pidiendo' && p.estado === 'prendido' && p.activa && Math.abs(p.x - 0.5) < 0.01 && p.moire && Math.abs(p.moireX - p.x) < 1e-9 && p.sesion === 'si'
  afirmar(mueveBien(prendido), 'prendido a mano (el permiso de iOS pedido en el toque), inclinar a la mitad del borde lleva el puntero de la cámara a 0,5 y el moiré a lo mismo (su entrada de afuera, C2-31m); queda guardado en la sesión', `x ${prendido.x.toFixed(3)} · moiré ${prendido.moireX.toFixed(3)}`)
  controlPositivo('  el detector ve el moiré sin conectar', { ...prendido, moire: false, moireX: 9 }, mueveBien)
  controlPositivo('  y la cámara que no lo sigue', { ...prendido, activa: false }, mueveBien)
  const suave = filtrarLaInclinacion({ x: 0, y: 0 }, { x: 1, y: 0 }, 16)
  const filtroBien = (f: typeof filtrarLaInclinacion): boolean => {
    const uno = f({ x: 0, y: 0 }, { x: 1, y: 0 }, 16).x
    let p = { x: 0, y: 0 }
    for (let k = 0; k < 30; k += 1) p = f(p, { x: 1, y: 0 }, 16)
    return uno > 0.05 && uno < 0.3 && p.x > 0.99
  }
  afirmar(filtroBien(filtrarLaInclinacion), `  con un filtro suave (${String(GIROSCOPIO.filtroMs)} ms): una lectura sola mueve ${(suave.x * 100).toFixed(0)} % (no tiembla) y en medio segundo llega`)
  controlPositivo('  el detector ve el sensor crudo (cada temblor a la cámara)', ((_: { readonly x: number; readonly y: number }, l: { readonly x: number; readonly y: number }) => l) as typeof filtrarLaInclinacion, filtroBien)

  // Apagarlo suelta los dos.
  desactivarElMovimiento()
  const apagado = { estado: estadoDelGiroscopio(), escucha: escucha(), activa: INCLINACION_DEL_TELEFONO.activa, moire: hayEntradaDeAfuera(), sesion: sesion.get(CLAVE_DEL_MOVIMIENTO) }
  afirmar(apagado.estado === 'apagado' && !apagado.escucha && !apagado.activa && !apagado.moire && apagado.sesion === 'no', '  apagado: deja de escuchar, la cámara vuelve al mouse y el moiré también (sin entrada de afuera); queda guardado')

  // El permiso negado: queda apagado, no escucha, nada se mueve, y se guarda apagado (no se vuelve a pedir).
  permiso = () => Promise.resolve('denied')
  activarElMovimiento()
  await esperar()
  inclinar(60, 9, 2000)
  inclinar(60, 9, 2016)
  const negado = { estado: estadoDelGiroscopio(), escucha: escucha(), activa: INCLINACION_DEL_TELEFONO.activa, x: INCLINACION_DEL_TELEFONO.x, moire: hayEntradaDeAfuera(), sesion: sesion.get(CLAVE_DEL_MOVIMIENTO) }
  activarElMovimiento()
  await esperar()
  const otraVez = estadoDelGiroscopio()
  const nadaBien = (n: typeof negado, de: string): boolean => n.estado === 'negado' && de === 'negado' && !n.escucha && !n.activa && n.x === 0 && !n.moire && n.sesion === 'no'
  afirmar(nadaBien(negado, otraVez), 'con el permiso negado no pasa nada: queda apagado, no escucha el sensor, ni la cámara ni el moiré se mueven, se guarda apagado y otro toque no lo vuelve a pedir')
  controlPositivo('  el detector ve uno que escucha igual (sin el permiso)', { ...negado, escucha: true, activa: true, x: 0.5, moire: true }, (n) => nadaBien(n, otraVez))
}

// ═══════════════════════════════════════════════════════════════════════════
async function cableado(): Promise<void> {
  // Sin el teléfono de mentira: el render del botón es el del servidor.
  delete (globalThis as { window?: unknown }).window
  delete (globalThis as { document?: unknown }).document
  titulo('4 · El cableado: el botón arriba a la derecha (sólo abajo de 1024), la frase que prende los dos, el prototipo que se fue')
  const { ControlDelMovimiento } = await import('../../_chrome/movimiento/ControlDelMovimiento')
  const boton = renderToStaticMarkup(createElement(ControlDelMovimiento))
  const CONTROL = sinComentarios(leer(`${V3}/_chrome/movimiento/ControlDelMovimiento.tsx`))
  const ESQUINA = sinComentarios(leer(`${V3}/_chrome/movimiento/EsquinaDelMovimiento.tsx`))
  const CHROME = leer(`${V3}/_chrome/ChromeDelHome.tsx`)
  const botonBien = (m: string, c: string, e: string, ch: string): boolean =>
    /aria-label="Activar movimiento"/.test(m) && /data-estado="apagado"/.test(m) && /data-control-fijo=""/.test(m) && /stroke-width="1\.5"/.test(m) && /lucide-smartphone/.test(m) &&
    c.includes("aria-label={prendido ? 'Desactivar movimiento' : 'Activar movimiento'}") &&
    e.includes('escritorio:hidden') && e.includes(['right', '[max(var(--spacing-4),env(safe-area-inset-right))]'].join('-')) && e.includes('data-parte="lugar-del-movimiento"') && /useSyncExternalStore\(sinCambios, hayMovimiento, \(\) => false\)/.test(e) &&
    /<EsquinaDelMovimiento \/>\s*<EsquinaDelSonido \/>\s*\{\/\*[^]*?\*\/\}\s*<ChatDelSitio \/>/.test(ch)
  afirmar(botonBien(boton, CONTROL, ESQUINA, CHROME), 'el botón: «Activar movimiento» / «Desactivar movimiento» (05-TEXTOS), su estado en `data-estado`, el teléfono de lucide con trazo 1,5, un control fijo (la órbita no lo sigue), arriba a la derecha y escondido desde 1024; montado en el chrome junto al parlante', boton.slice(0, 160))
  controlPositivo('  el detector ve un botón sin su `aria-label`', [boton.replace('aria-label="Activar movimiento"', ''), CONTROL, ESQUINA, CHROME] as const, ([m, c, e, ch]) => botonBien(m, c, e, ch))
  controlPositivo('  y uno que se ve también en escritorio', [boton, CONTROL, ESQUINA.replace('escritorio:hidden', ''), CHROME] as const, ([m, c, e, ch]) => botonBien(m, c, e, ch))

  const TEXTOS = leer('docs/cola/2026-10-23/05-TEXTOS.md')
  const { FRASE, FLECHAS } = await import('../../_chrome/preloader/CapaDelPreloader')
  const fraseBien = (c: string, f: typeof FRASE): boolean =>
    TEXTOS.includes(`Escritorio: queda **«${f.escritorio}»**`) && TEXTOS.includes(`Teléfono y tablet: **«${f.conMovimiento}»**`) && /if \(conMovimiento\) activarElMovimiento\(\)\s*setActivado\(true\)/.test(c) && /const \[conMovimiento\] = useState\(hayMovimiento\)/.test(c) && FLECHAS.conMovimiento.length === 2 && FLECHAS.escritorio.length === 1 && FLECHAS.conMovimiento.some((x) => x.objetivo === 'movimiento')
  afirmar(fraseBien(CAPA, FRASE), 'la frase del preloader, tal cual 05-TEXTOS: en escritorio la del sonido (una flecha); en el teléfono la del sonido y el movimiento (dos flechas, una a cada botón), y tocarla prende los dos dentro del toque')
  controlPositivo('  el detector ve la frase que sólo prende el sonido', [CAPA.replace('if (conMovimiento) activarElMovimiento()', ''), FRASE] as const, ([c, f]) => fraseBien(c, f))

  const SONIDO = sinComentarios(leer(`${V3}/_chrome/sonido/ControlDelSonido.tsx`))
  const GIRO = sinComentarios(leer(`${V3}/_lib/escena/giroscopio.ts`))
  const separadosBien = (s: string, g: string): boolean => !/giroscopio|Giroscopio/.test(s) && !/giroscopio=si|prefers-reduced-motion/.test(g) && /fijarLaEntradaDelMoire\(INCLINACION_DEL_TELEFONO\)/.test(g) && /fijarLaEntradaDelMoire\(null\)/.test(g)
  afirmar(separadosBien(SONIDO, GIRO), 'el parlante ya no prende el movimiento (el prototipo `?giroscopio=si` se fue); el giroscopio no se niega con movimiento reducido (se prende a mano) y conecta la entrada del moiré (la suelta al callar)')
  controlPositivo('  el detector ve el prototipo en el parlante', [`${SONIDO}\nprenderElGiroscopio()`, GIRO] as const, ([s, g]) => separadosBien(s, g))
  cerrar('s78-c2-81')
}

void movimiento().then(cableado)
