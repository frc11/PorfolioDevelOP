/**
 * s78 · B12c (2026-10-22) · EL PRELOADER DEL SITIO, sin navegador. Cada afirmación con su control positivo.
 *
 *   1 · la decisión (el script ES5 del `<head>`, corrido con una ventana falsa): una vez por día (fecha local), nunca en una recarga ni
 *       volviendo con las flechas, sin almacenamiento se muestra igual, las salidas de las pruebas y el bloqueo del scroll que instala;
 *   2 · la línea de tiempo: 5,7 s en el caso normal, el botón que late una vez (1,5 s) y, si falta la carga, el latido que se repite
 *       cada 2,8 s, el ícono desde los 12, el tope de 20 y la versión reducida de ~1 s ([L6 · ítem 81]: la flecha se fue).
 *
 * La entrada (4), el cableado y el arnés de los bancos (5), en `s78-preloader-entrada.invariant.tsx`: aparte, porque pone una ventana
 * falsa con la decisión antes de la primera pregunta, como al hidratar.
 *
 * Lo que se ve y se mide en el tiempo real (la secuencia, la onda contra el botón, el bloqueo, los tirones con y sin preloader) lo mide
 * el orquestador con `scripts-carga/preloader.ts`; la lista está en `docs/rediseno/SPRINT-B12C-NOCTURNO.md`.
 */
import { afirmar, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { CLAVE_DEL_DIA, PROPIEDAD_DE_LA_CUBIERTA, SCRIPT_DE_LA_DECISION, TOPE_MS } from './decision'
import { DURACION_NORMAL_MS, DURACION_REDUCIDA_MS, INICIO_DEL_BOTON_MS, LINEA, LINEA_REDUCIDA, entradaLista, latidosEn, lineaNueva, pasoDeLaLinea, vistaDeLaLinea, type EstadoDeLaLinea } from './linea'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La decisión, antes del primer pintado: una vez por día, nunca en una recarga, y las salidas de las pruebas')

interface Entorno {
  readonly search?: string
  readonly webdriver?: boolean
  readonly sesion?: Record<string, string>
  /** `null`: el almacenamiento tira (privado, bloqueado). */
  readonly local?: Record<string, string> | null
  /** El tipo de la navegación; `null`: sin la API nueva (cae a `performance.navigation`). */
  readonly tipo?: string | null
  readonly legado?: number
  readonly banco?: string
  readonly defecto?: string
  readonly reducido?: boolean
  readonly hoy?: Date
}
interface Oyente {
  readonly tipo: string
  readonly f: (e: EventoFalso) => void
}
interface EventoFalso {
  readonly target: { readonly closest: (s: string) => object | null } | null
  readonly key?: string
  prevenido: boolean
  detenido: boolean
  readonly preventDefault: () => void
  readonly stopPropagation: () => void
}
interface Corrida {
  readonly ver: boolean
  readonly decision: { readonly activo?: boolean; readonly reducido?: boolean; bloqueado?: boolean; readonly soltar?: () => void } | undefined
  readonly propiedades: Map<string, string>
  readonly local: Record<string, string> | null
  readonly oyentes: Oyente[]
  readonly reloj: { ahora: number }
}

const HOY = new Date(2026, 9, 22, 10, 30)
const deHoy = (f: Date): string => `${String(f.getFullYear())}-${String(f.getMonth() + 1)}-${String(f.getDate())}`

function correr(script: string, en: Entorno = {}): Corrida {
  const local = en.local === null ? null : { ...(en.local ?? {}) }
  const almacen = (m: Record<string, string> | null): { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } =>
    m === null
      ? {
          getItem: () => {
            throw new Error('sin almacenamiento')
          },
          setItem: () => {
            throw new Error('sin almacenamiento')
          },
        }
      : { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => void (m[k] = String(v)) }
  const oyentes: Oyente[] = []
  const propiedades = new Map<string, string>()
  const reloj = { ahora: 120 }
  const ventana: Record<string, unknown> = {
    location: { search: en.search ?? '' },
    navigator: { webdriver: en.webdriver === true },
    sessionStorage: almacen({ ...(en.sesion ?? {}) }),
    localStorage: almacen(local),
    performance: { now: () => reloj.ahora, getEntriesByType: en.tipo === null ? undefined : () => [{ type: en.tipo ?? 'navigate' }], navigation: en.legado === undefined ? undefined : { type: en.legado } },
    matchMedia: () => ({ matches: en.reducido === true }),
    addEventListener: (tipo: string, f: (e: EventoFalso) => void) => oyentes.push({ tipo, f }),
    removeEventListener: (tipo: string, f: (e: EventoFalso) => void) => {
      const i = oyentes.findIndex((o) => o.tipo === tipo && o.f === f)
      if (i >= 0) oyentes.splice(i, 1)
    },
    __preloaderDelBanco: en.banco,
    __defectosDelPreloader: en.defecto,
  }
  const documento = { documentElement: { style: { setProperty: (k: string, v: string) => void propiedades.set(k, v) } } }
  const fecha = en.hoy ?? HOY
  class FechaFija extends Date {
    constructor() {
      super(fecha.getTime())
    }
  }
  const correrlo = new Function('window', 'document', 'Date', script) as (w: unknown, d: unknown, f: unknown) => void
  correrlo(ventana, documento, FechaFija)
  const decision = ventana.__preloaderDelSitio as Corrida['decision']
  return { ver: propiedades.get(PROPIEDAD_DE_LA_CUBIERTA) === 'block' && decision?.activo === true, decision, propiedades, local, oyentes, reloj }
}

const evento = (adentroDe: string | null, key?: string): EventoFalso => {
  const e: EventoFalso = {
    target: { closest: (s: string) => (adentroDe !== null && s.split(',').includes(adentroDe) ? {} : null) },
    key,
    prevenido: false,
    detenido: false,
    preventDefault: () => {
      e.prevenido = true
    },
    stopPropagation: () => {
      e.detenido = true
    },
  }
  return e
}
const disparar = (c: Corrida, tipo: string, e: EventoFalso): EventoFalso => {
  for (const o of c.oyentes.filter((x) => x.tipo === tipo)) o.f(e)
  return e
}

/** La regla de cuándo se ve, contra el script: cada caso con lo que tiene que dar. */
const AYER = new Date(2026, 9, 21, 22, 0)
const CASOS: readonly { readonly que: string; readonly en: Entorno; readonly ver: boolean }[] = [
  { que: 'la primera entrada del día (sin nada guardado)', en: {}, ver: true },
  { que: 'otra entrada el mismo día', en: { local: { [CLAVE_DEL_DIA]: deHoy(HOY) } }, ver: false },
  { que: 'la primera del día siguiente (lo guardado es de ayer)', en: { local: { [CLAVE_DEL_DIA]: deHoy(AYER) } }, ver: true },
  { que: 'a las 23:59 del mismo día, todavía no', en: { local: { [CLAVE_DEL_DIA]: deHoy(HOY) }, hoy: new Date(2026, 9, 22, 23, 59) }, ver: false },
  { que: 'a las 00:01 del día siguiente (la fecha LOCAL), sí', en: { local: { [CLAVE_DEL_DIA]: deHoy(HOY) }, hoy: new Date(2026, 9, 23, 0, 1) }, ver: true },
  { que: 'una recarga, aunque sea la primera del día', en: { tipo: 'reload' }, ver: false },
  { que: 'volviendo con las flechas (un documento del historial)', en: { tipo: 'back_forward' }, ver: false },
  { que: 'una recarga con la API vieja (`performance.navigation`)', en: { tipo: null, legado: 1 }, ver: false },
  { que: 'sin almacenamiento, se muestra igual', en: { local: null }, ver: true },
  { que: 'bajo automatización (`navigator.webdriver`): no', en: { webdriver: true }, ver: false },
  { que: 'con la siembra de los bancos (`home:intro`): no', en: { sesion: { 'home:intro': '1' } }, ver: false },
  { que: 'con `?preloader=no`: no', en: { search: '?preloader=no' }, ver: false },
  { que: 'con `?preloader=si`: sí, también en una recarga y ya visto hoy', en: { search: '?a=1&preloader=si', tipo: 'reload', local: { [CLAVE_DEL_DIA]: deHoy(HOY) } }, ver: true },
  { que: 'el banco que lo quiere ver (`normal`): sin las salidas de automatización, decide el día', en: { banco: 'normal', webdriver: true, sesion: { 'home:intro': '1' } }, ver: true },
  { que: '  y con `normal` la recarga sigue sin mostrarlo', en: { banco: 'normal', webdriver: true, tipo: 'reload' }, ver: false },
  { que: 'el banco que lo pide siempre (`mostrar`)', en: { banco: 'mostrar', webdriver: true, tipo: 'reload' }, ver: true },
  { que: 'el control del banco `en-recargas`: se muestra en una recarga (el banco tiene que verlo)', en: { defecto: 'en-recargas', tipo: 'reload' }, ver: true },
]
const decideBien = (script: string): boolean => CASOS.every((c) => correr(script, c.en).ver === c.ver)
for (const c of CASOS) afirmar(correr(SCRIPT_DE_LA_DECISION, c.en).ver === c.ver, `${c.que}: ${c.ver ? 'se ve' : 'no se ve'}`)
controlPositivo('  el detector ve un preloader que aparece en las recargas', SCRIPT_DE_LA_DECISION.replace("vuelta=(t==='reload'||t==='back_forward')", 'vuelta=false'), decideBien)
controlPositivo('  el detector ve uno que aparece en cada entrada (sin el día)', SCRIPT_DE_LA_DECISION.replace('visto!==hoy', 'true'), decideBien)
controlPositivo('  el detector ve uno que no respeta la siembra de los bancos', SCRIPT_DE_LA_DECISION.replace("==='1'", "==='x'"), decideBien)

const primera = correr(SCRIPT_DE_LA_DECISION, { reducido: true })
afirmar(primera.local?.[CLAVE_DEL_DIA] === deHoy(HOY) && primera.decision?.reducido === true && primera.propiedades.get(PROPIEDAD_DE_LA_CUBIERTA) === 'block', 'al decidir que se ve: guarda la fecha de hoy, muestra la cubierta (la custom property del `<html>`) y anota el movimiento reducido')
const segunda = correr(SCRIPT_DE_LA_DECISION, { local: primera.local ?? {} })
afirmar(!segunda.ver && segunda.oyentes.length === 0 && segunda.propiedades.size === 0, '  y la entrada siguiente del día ya no: ni la cubierta, ni un oyente, ni la decisión en la ventana')

// El bloqueo del scroll que instala: la rueda y el toque (frenados también para Lenis) y las teclas que scrollean.
const bloqueaBien = (script: string): boolean => {
  const c = correr(script)
  const rueda = disparar(c, 'wheel', evento(null))
  const toque = disparar(c, 'touchmove', evento(null))
  const enUnDialogo = disparar(c, 'wheel', evento('[data-lenis-prevent]'))
  const espacio = disparar(c, 'keydown', evento(null, ' '))
  const espacioEnUnBoton = disparar(c, 'keydown', evento('button', ' '))
  const tab = disparar(c, 'keydown', evento(null, 'Tab'))
  const tipos = c.oyentes.map((o) => o.tipo).sort().join(',')
  c.reloj.ahora += TOPE_MS + 1
  const pasadoElTope = disparar(c, 'wheel', evento(null))
  c.reloj.ahora -= TOPE_MS + 1
  c.decision?.soltar?.()
  return tipos === 'keydown,touchmove,wheel' && rueda.prevenido && rueda.detenido && toque.prevenido && toque.detenido && !enUnDialogo.prevenido && espacio.prevenido && !espacioEnUnBoton.prevenido && !tab.prevenido && !pasadoElTope.prevenido && c.oyentes.length === 0 && c.decision?.bloqueado === false
}
afirmar(bloqueaBien(SCRIPT_DE_LA_DECISION), 'el bloqueo, desde el primer instante: la rueda y el toque (frenados en la captura de la ventana: tampoco le llegan a Lenis) y las teclas que scrollean; adentro de un diálogo con scroll propio o sobre un control, pasan; a los 20 s se suelta solo, y `soltar` saca los oyentes')
controlPositivo('  el detector ve un bloqueo que deja pasar la rueda a Lenis (sin detenerla)', SCRIPT_DE_LA_DECISION.replace('e.preventDefault();e.stopPropagation()', 'e.preventDefault()'), bloqueaBien)
controlPositivo('  y uno sin tope', SCRIPT_DE_LA_DECISION.replace(`w.performance.now()-a>${String(TOPE_MS)}`, 'false'), bloqueaBien)
afirmar(correr(SCRIPT_DE_LA_DECISION, { defecto: 'sin-bloqueo' }).decision?.bloqueado === false, '  el control del banco `sin-bloqueo`: se ve y no bloquea (el banco tiene que verlo)')

const es5 = (s: string): boolean => !/=>|`|\?\.|\?\?|\.\.\.|\blet\b|\bconst\b|\bclass\b/.test(s)
afirmar(es5(SCRIPT_DE_LA_DECISION), `el script es ES5 y de una línea (corre bloqueante en el <head>, antes de cualquier polyfill): ${String(SCRIPT_DE_LA_DECISION.length)} caracteres`)
controlPositivo('  el detector ve una flecha', `${SCRIPT_DE_LA_DECISION};var f=()=>1`, es5)


// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La línea de tiempo: 5 a 6 s, el botón que late y repite el latido si falta la carga, la reducida de ~1 s')

const CUADRO = 1000 / 60
/** La tolerancia: dos cuadros (el reloj suma cuadros de 16,7 ms). */
const TOL = 2 * CUADRO
interface Simulada {
  readonly e: EstadoDeLaLinea
  readonly muestras: readonly EstadoDeLaLinea[]
}
function simular(reducido: boolean, listoDesde: number, hastaMs = 30000, paso: typeof pasoDeLaLinea = pasoDeLaLinea): Simulada {
  const e = lineaNueva()
  const muestras: EstadoDeLaLinea[] = []
  while (e.etapa !== 'fuera' && e.t < hastaMs) {
    paso(e, CUADRO, e.t >= listoDesde, reducido)
    muestras.push({ ...e })
  }
  return { e, muestras }
}
const primeraVez = (m: readonly EstadoDeLaLinea[], f: (x: EstadoDeLaLinea) => boolean): number => m.find(f)?.t ?? Number.NaN

const normal = simular(false, 0)
const finNormal = primeraVez(normal.muestras, (x) => x.etapa === 'fuera')
const sale = primeraVez(normal.muestras, (x) => x.salidaDesde !== null)
afirmar(Math.abs(finNormal - DURACION_NORMAL_MS) <= TOL && finNormal >= 5000 && finNormal <= 6000 && Math.abs(sale - (INICIO_DEL_BOTON_MS + LINEA.ondaMs)) <= TOL, `con la carga lista, la secuencia entera dura ${String(DURACION_NORMAL_MS)} ms (Valentino: de 5 a 6 s) y el botón se ve ${String(LINEA.ondaMs)} ms (un latido) antes de la salida`, `fuera a ${finNormal.toFixed(0)} ms · sale a ${sale.toFixed(0)} ms`)
afirmar(latidosEn(INICIO_DEL_BOTON_MS - 1) === 0 && latidosEn(INICIO_DEL_BOTON_MS) === 1 && latidosEn(INICIO_DEL_BOTON_MS + LINEA.ondaMs) === 1 && latidosEn(INICIO_DEL_BOTON_MS + LINEA.latidoPeriodoMs - 1) === 1 && latidosEn(INICIO_DEL_BOTON_MS + LINEA.latidoPeriodoMs) === 2 && latidosEn(INICIO_DEL_BOTON_MS + 5 * LINEA.latidoPeriodoMs) === 6, '  el primer latido empieza cuando aparece el botón y uno más cada período (2,8 s): el caso normal ve uno solo')
controlPositivo('  el detector ve un latido que empieza antes de que aparezca el botón', ((t: number) => (t < 0 ? 0 : 1 + Math.floor(t / LINEA.latidoPeriodoMs))) as typeof latidosEn, (f: typeof latidosEn) => f(INICIO_DEL_BOTON_MS - 1) === 0)

// Sin la carga: el latido se repite cada período (nunca queda quieto), el ícono desde los 12 s, el tope a los 20.
const repiteBien = (s: Simulada): boolean => {
  const antesDelTope = s.muestras.filter((x) => x.t < LINEA.topeMs)
  const enBoton = antesDelTope.filter((x) => x.etapa === 'boton')
  const icono = primeraVez(s.muestras, (x) => x.icono)
  const saleDelTope = primeraVez(s.muestras, (x) => x.salidaDesde !== null)
  const ultimosLatidos = latidosEn(LINEA.topeMs - CUADRO)
  return enBoton.length > 0 && enBoton[enBoton.length - 1].etapa === 'boton' && ultimosLatidos >= 5 && antesDelTope.every((x) => x.salidaDesde === null) && Math.abs(icono - LINEA.iconoDesdeMs) <= TOL && saleDelTope >= LINEA.topeMs && saleDelTope <= LINEA.topeMs + 400
}
const sinCarga = simular(false, Infinity)
afirmar(repiteBien(sinCarga), `sin la carga, el botón sigue a la vista y su latido se repite cada ${String(LINEA.latidoPeriodoMs / 1000)} s (${String(latidosEn(LINEA.topeMs - CUADRO))} hasta el tope), el ícono de carga recién a los ${String(LINEA.iconoDesdeMs / 1000)} s y, al tope (${String(TOPE_MS / 1000)} s), sale igual`)
controlPositivo('  el detector ve una línea que sale sin la carga antes del tope', simular(false, 4000), repiteBien)

// La carga llega tarde (a los 8 s, con el latido repitiéndose): sale enseguida.
const tarde = simular(false, 8000)
const saleTarde = primeraVez(tarde.muestras, (x) => x.salidaDesde !== null)
const finTarde = primeraVez(tarde.muestras, (x) => x.etapa === 'fuera')
afirmar(saleTarde >= 8000 && saleTarde <= 8000 + 400 && Math.abs(finTarde - saleTarde - LINEA.salidaMs) <= TOL, 'con la carga a los 8 s, la salida arranca enseguida y el blanco se va', `sale a ${saleTarde.toFixed(0)} ms · fuera a ${finTarde.toFixed(0)} ms`)
const antesDelLatido = simular(false, INICIO_DEL_BOTON_MS - 1000)
afirmar(Math.abs(primeraVez(antesDelLatido.muestras, (x) => x.salidaDesde !== null) - (INICIO_DEL_BOTON_MS + LINEA.ondaMs)) <= TOL, '  con la carga lista antes de que aparezca el botón, igual se ve su primer latido entero (no sale a mitad de él)')
controlPositivo('  el detector ve una salida que no espera al primer latido', simular(false, 0, 30000, (e, dt, listo, reducido) => {
  pasoDeLaLinea(e, dt, listo, reducido)
  if (listo && e.salidaDesde === null && e.t >= INICIO_DEL_BOTON_MS) e.salidaDesde = e.t
}), (s: Simulada) => Math.abs(primeraVez(s.muestras, (x) => x.salidaDesde !== null) - (INICIO_DEL_BOTON_MS + LINEA.ondaMs)) <= TOL)

// Lo que se pinta: el negro con la bienvenida, el blanco, la frase y la capa entera hasta la salida.
const enT = (s: Simulada, t: number): EstadoDeLaLinea => s.muestras.find((x) => x.t >= t) ?? s.e
const vista = (t: number): ReturnType<typeof vistaDeLaLinea> => vistaDeLaLinea(enT(normal, t), false)
const pintaBien = vista(20).bienvenida < 0.1 && vista(1500).bienvenida === 1 && vista(1500).blanco === 0 && vista(2700).bienvenida === 0 && vista(3200).blanco === 1 && vista(3600).frase === 1 && vista(4000).capa === 1 && vista(5300).capa < 1 && vista(5300).capa > 0
afirmar(pintaBien, 'lo que se pinta: la bienvenida entra lenta, se queda y se va sobre el negro; el blanco con un fundido simple; la frase; la capa entera hasta que el primer latido termina y después se desvanece')

// Con movimiento reducido: ~1 s, sin fundidos largos.
const reducida = simular(true, 0)
const finReducida = primeraVez(reducida.muestras, (x) => x.etapa === 'fuera')
const reducidaBien = (s: Simulada, fin: number): boolean => Math.abs(fin - DURACION_REDUCIDA_MS) <= TOL && fin >= 800 && fin <= 1300 && s.muestras.every((x) => x.etapa !== 'boton' || x.t >= LINEA_REDUCIDA.bienvenidaMs) && LINEA_REDUCIDA.salidaMs <= 200
afirmar(reducidaBien(reducida, finReducida), `con movimiento reducido, ${String(DURACION_REDUCIDA_MS)} ms: la bienvenida, de golpe la frase con el botón a la vista, y un fundido corto`, `fuera a ${finReducida.toFixed(0)} ms`)
controlPositivo('  el detector ve la reducida con la secuencia entera', normal, (s) => reducidaBien(s, finNormal))
const reducidaSinCarga = simular(true, 3000)
afirmar(Math.abs(primeraVez(reducidaSinCarga.muestras, (x) => x.salidaDesde !== null) - 3000) <= TOL, '  y si falta la carga, espera hasta que esté')

// Qué espera la entrada.
const todo = { fuentes: true, primerCuadro: true, caida: false, escritorio: true, conTitular: true, titularListo: true, preparada: true, urgentes: 0 }
const esperaBien = (f: typeof entradaLista): boolean =>
  f(todo) && !f({ ...todo, preparada: false }) && !f({ ...todo, urgentes: 1 }) && !f({ ...todo, titularListo: false }) && !f({ ...todo, fuentes: false }) && !f({ ...todo, primerCuadro: false }) && f({ ...todo, conTitular: false, titularListo: false }) && f({ ...todo, primerCuadro: false, preparada: false, urgentes: 2, titularListo: false, caida: true }) && !f({ ...todo, caida: true, fuentes: false })
afirmar(esperaBien(entradaLista), 'la entrada espera las fuentes, el primer cuadro, la escena preparada (compilada y calentada), el titular del hero armado y ningún título urgente en camino; con la escena caída, sólo las fuentes')
controlPositivo('  el detector ve una entrada que no espera a la escena preparada', ((e: Parameters<typeof entradaLista>[0]) => entradaLista({ ...e, preparada: true })) as typeof entradaLista, esperaBien)

cerrar('s78-preloader')
