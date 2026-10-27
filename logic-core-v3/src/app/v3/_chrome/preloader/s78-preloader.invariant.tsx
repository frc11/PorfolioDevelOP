/**
 * s78 · B12c (2026-10-22) · EL PRELOADER DEL SITIO, sin navegador. Cada afirmación con su control positivo.
 *
 *   1 · la decisión (el script ES5 del `<head>`, corrido con una ventana falsa): una vez por día (fecha local), nunca en una recarga ni
 *       volviendo con las flechas, sin almacenamiento se muestra igual, las salidas de las pruebas y el bloqueo del scroll que instala;
 *   2 · la línea de tiempo: 5,7 s en el caso normal, la flecha en 1,5 s, el freno en su último 20 % si falta la carga, quieta y con
 *       pulso desde los 6 s, el ícono desde los 12, el tope de 20 y la versión reducida de ~1 s;
 *   3 · el trazado de la flecha ([C2-81] a trazos, con tres bucles): la punta en el borde de su botón, apuntando a su centro, a 1440,
 *       1024, 768 y 390 (cajas de los
 *       tokens; las reales las mide `scripts-carga/preloader.ts`);
 *
 * La entrada (4), el cableado y el arnés de los bancos (5), en `s78-preloader-entrada.invariant.tsx`: aparte, porque pone una ventana
 * falsa con la decisión antes de la primera pregunta, como al hidratar.
 *
 * Lo que se ve y se mide en el tiempo real (la secuencia, la flecha contra el botón, el bloqueo, los tirones con y sin preloader) lo mide
 * el orquestador con `scripts-carga/preloader.ts`; la lista está en `docs/rediseno/SPRINT-B12C-NOCTURNO.md`.
 */
import { afirmar, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { CLAVE_DEL_DIA, PROPIEDAD_DE_LA_CUBIERTA, SCRIPT_DE_LA_DECISION, TOPE_MS } from './decision'
import { DURACION_NORMAL_MS, DURACION_REDUCIDA_MS, INICIO_DE_LA_FLECHA_MS, LINEA, LINEA_REDUCIDA, entradaLista, lineaNueva, pasoDeLaLinea, velocidadDeLaFlecha, vistaDeLaLinea, type EstadoDeLaLinea } from './linea'
import { TRAZADO, cajaDeLosRenglones, crucesDelCamino, muestrearElCamino, rayasDeLaFlecha, renglonesDe, trazarLaFlecha, type Caja, type Lado, type Raya, type Renglon, type Trazado } from './trazado'

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
titulo('2 · La línea de tiempo: 5 a 6 s, la flecha que frena en su último 20 % y pulsa desde los 6 s, la reducida de ~1 s')

const CUADRO = 1000 / 60
/** La tolerancia: dos cuadros (el reloj suma cuadros de 16,7 ms). */
const TOL = 2 * CUADRO
interface Simulada {
  readonly e: EstadoDeLaLinea
  readonly muestras: readonly EstadoDeLaLinea[]
}
function simular(reducido: boolean, listoDesde: number, hastaMs = 30000, paso: typeof pasoDeLaLinea = pasoDeLaLinea, sinFreno = false): Simulada {
  const e = lineaNueva()
  const muestras: EstadoDeLaLinea[] = []
  while (e.etapa !== 'fuera' && e.t < hastaMs) {
    paso(e, CUADRO, e.t >= listoDesde, reducido, sinFreno)
    muestras.push({ ...e })
  }
  return { e, muestras }
}
const primeraVez = (m: readonly EstadoDeLaLinea[], f: (x: EstadoDeLaLinea) => boolean): number => m.find(f)?.t ?? Number.NaN

const normal = simular(false, 0)
const finNormal = primeraVez(normal.muestras, (x) => x.etapa === 'fuera')
const flechaCompleta = primeraVez(normal.muestras, (x) => x.trazo >= 1)
afirmar(Math.abs(finNormal - DURACION_NORMAL_MS) <= TOL && finNormal >= 5000 && finNormal <= 6000 && Math.abs(flechaCompleta - (INICIO_DE_LA_FLECHA_MS + LINEA.flechaMs)) <= TOL, `con la carga lista, la secuencia entera dura ${String(DURACION_NORMAL_MS)} ms (Valentino: de 5 a 6 s) y la flecha se dibuja en ${String(LINEA.flechaMs)} ms`, `fuera a ${finNormal.toFixed(0)} ms · flecha completa a ${flechaCompleta.toFixed(0)} ms`)

// Sin la carga: frena en su último 20 % (nunca llega), y desde los 6 s quieta con el pulso; el ícono desde los 12; el tope a los 20.
const frenaBien = (s: Simulada): boolean => {
  const antesDelTope = s.muestras.filter((x) => x.t < LINEA.topeMs)
  const maximo = Math.max(...antesDelTope.map((x) => x.trazo))
  const enSeis = antesDelTope.filter((x) => x.t >= LINEA.pulsoDesdeMs + CUADRO)
  const quieta = enSeis.every((x) => x.trazo === enSeis[0].trazo && x.pulsa)
  const antesDeSeis = antesDelTope.filter((x) => x.t < LINEA.pulsoDesdeMs - CUADRO)
  const icono = primeraVez(s.muestras, (x) => x.icono)
  const sale = primeraVez(s.muestras, (x) => x.salidaDesde !== null)
  return maximo >= LINEA.frenoDesde && maximo < 1 && maximo <= LINEA.frenoHasta && quieta && antesDeSeis.every((x) => !x.pulsa) && Math.abs(icono - LINEA.iconoDesdeMs) <= TOL && sale >= LINEA.topeMs && sale <= LINEA.topeMs + 400
}
const sinCarga = simular(false, Infinity)
afirmar(frenaBien(sinCarga), `sin la carga, la flecha llega a su último 20 % y frena (nunca llega: hasta ${String(LINEA.frenoHasta)}), desde los ${String(LINEA.pulsoDesdeMs / 1000)} s se queda quieta con el pulso en la punta, el ícono de carga recién a los ${String(LINEA.iconoDesdeMs / 1000)} s y, al tope (${String(TOPE_MS / 1000)} s), sale igual`, `lo más dibujado antes del tope: ${Math.max(...sinCarga.muestras.filter((x) => x.t < LINEA.topeMs).map((x) => x.trazo)).toFixed(3)}`)
controlPositivo('  el detector ve la flecha sin freno (el control del banco `sin-freno`)', simular(false, Infinity, 30000, pasoDeLaLinea, true), frenaBien)
controlPositivo('  y una que sigue avanzando después de los 6 s', { ...sinCarga, muestras: sinCarga.muestras.map((x) => (x.t >= 7000 && x.t < 8000 ? { ...x, trazo: x.trazo + (x.t - 7000) / 1e5 } : x)) }, frenaBien)
const velocidadBien = (v: typeof velocidadDeLaFlecha): boolean => v(LINEA.frenoDesde - 0.01, false, 4000) === 1 && v(LINEA.frenoDesde + 0.05, false, 4000) < 1 && v(LINEA.frenoHasta, false, 4000) === 0 && v(0.5, false, LINEA.pulsoDesdeMs) === 0 && v(0.9, true, 9000) === 1
afirmar(velocidadBien(velocidadDeLaFlecha), '  el freno arranca exactamente en el 80 % del trazo; con la carga lista, su ritmo siempre')
controlPositivo('  el detector ve un freno que arranca antes', ((t: number, l: boolean, x: number) => (l ? 1 : x >= LINEA.pulsoDesdeMs ? 0 : t < 0.5 ? 1 : Math.max(0, (LINEA.frenoHasta - t) / (LINEA.frenoHasta - 0.5)) ** 2)) as typeof velocidadDeLaFlecha, velocidadBien)

// La carga llega tarde (a los 8 s, con la flecha quieta): retoma a su ritmo y sale enseguida.
const tarde = simular(false, 8000)
const saleTarde = primeraVez(tarde.muestras, (x) => x.salidaDesde !== null)
const finTarde = primeraVez(tarde.muestras, (x) => x.etapa === 'fuera')
afirmar(saleTarde >= 8000 && saleTarde <= 8000 + 400 && Math.abs(finTarde - saleTarde - LINEA.salidaMs) <= TOL, 'con la carga a los 8 s, la flecha termina enseguida (le faltaba su último tramo) y el blanco se va', `sale a ${saleTarde.toFixed(0)} ms · fuera a ${finTarde.toFixed(0)} ms`)

// Lo que se pinta: el negro con la bienvenida, el blanco, la frase y la capa entera hasta la salida.
const enT = (s: Simulada, t: number): EstadoDeLaLinea => s.muestras.find((x) => x.t >= t) ?? s.e
const vista = (t: number): ReturnType<typeof vistaDeLaLinea> => vistaDeLaLinea(enT(normal, t), false)
const pintaBien = vista(20).bienvenida < 0.1 && vista(1500).bienvenida === 1 && vista(1500).blanco === 0 && vista(2700).bienvenida === 0 && vista(3200).blanco === 1 && vista(3600).frase === 1 && vista(4000).capa === 1 && vista(5300).capa < 1 && vista(5300).capa > 0
afirmar(pintaBien, 'lo que se pinta: la bienvenida entra lenta, se queda y se va sobre el negro; el blanco con un fundido simple; la frase; la capa entera hasta que la flecha termina y después se desvanece')

// Con movimiento reducido: ~1 s, sin fundidos largos ni pulso.
const reducida = simular(true, 0)
const finReducida = primeraVez(reducida.muestras, (x) => x.etapa === 'fuera')
const reducidaBien = (s: Simulada, fin: number): boolean =>
  Math.abs(fin - DURACION_REDUCIDA_MS) <= TOL && fin >= 800 && fin <= 1300 && s.muestras.every((x) => !x.pulsa) && s.muestras.filter((x) => x.t >= LINEA_REDUCIDA.bienvenidaMs).every((x) => x.trazo === 1) && LINEA_REDUCIDA.salidaMs <= 200
afirmar(reducidaBien(reducida, finReducida), `con movimiento reducido, ${String(DURACION_REDUCIDA_MS)} ms: la bienvenida, de golpe la frase con la flecha ya dibujada, y un fundido corto; sin pulso`, `fuera a ${finReducida.toFixed(0)} ms`)
controlPositivo('  el detector ve la reducida con la secuencia entera', normal, (s) => reducidaBien(s, finNormal))
const reducidaSinCarga = simular(true, 3000)
afirmar(Math.abs(primeraVez(reducidaSinCarga.muestras, (x) => x.salidaDesde !== null) - 3000) <= TOL && reducidaSinCarga.muestras.every((x) => !x.pulsa), '  y si falta la carga, espera quieta (sin pulso) hasta que esté')

// Qué espera la entrada.
const todo = { fuentes: true, primerCuadro: true, caida: false, escritorio: true, conTitular: true, titularListo: true, preparada: true, urgentes: 0 }
const esperaBien = (f: typeof entradaLista): boolean =>
  f(todo) && !f({ ...todo, preparada: false }) && !f({ ...todo, urgentes: 1 }) && !f({ ...todo, titularListo: false }) && !f({ ...todo, fuentes: false }) && !f({ ...todo, primerCuadro: false }) && f({ ...todo, conTitular: false, titularListo: false }) && f({ ...todo, primerCuadro: false, preparada: false, urgentes: 2, titularListo: false, caida: true }) && !f({ ...todo, caida: true, fuentes: false })
afirmar(esperaBien(entradaLista), 'la entrada espera las fuentes, el primer cuadro, la escena preparada (compilada y calentada), el titular del hero armado y ningún título urgente en camino; con la escena caída, sólo las fuentes')
controlPositivo('  el detector ve una entrada que no espera a la escena preparada', ((e: Parameters<typeof entradaLista>[0]) => entradaLista({ ...e, preparada: true })) as typeof entradaLista, esperaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La flecha [C2-81]: a trazos, con tres bucles grandes, y la punta exactamente en su botón (1440, 1024, 768 y 390)')

/**
 * Los renglones y los botones, de los tokens: el botón en escritorio en su disco de 48 px (2 × `--spacing-3` + `--text-cuerpo` ×
 * `--leading-texto`) a `--spacing-6` de arriba y `--pad-lateral-compacto` del costado; abajo de 1024, los discos de `--spacing-12` a
 * `--spacing-4` (el del sonido a la izquierda, el del movimiento a la derecha). La frase en `titulo-m` (unos 0,53 em por letra): en
 * escritorio la del sonido, en un renglón; en el teléfono, la del movimiento, en uno (768) o dos (390). Las reales las mide el banco.
 */
interface CasoDeLaFlecha {
  readonly ancho: number
  readonly alto: number
  readonly renglones: readonly Caja[]
  readonly flechas: readonly { readonly boton: Caja; readonly lado: Lado; readonly renglon: Renglon }[]
}
const CASOS_DE_LA_FLECHA: readonly CasoDeLaFlecha[] = [
  { ancho: 1440, alto: 900, renglones: [{ x: 457, y: 434, ancho: 526, alto: 38 }], flechas: [{ boton: { x: 32, y: 24, ancho: 48, alto: 48 }, lado: 'derecha', renglon: 'ultimo' }] },
  { ancho: 1024, alto: 768, renglones: [{ x: 294, y: 368, ancho: 435, alto: 32 }], flechas: [{ boton: { x: 32, y: 24, ancho: 48, alto: 48 }, lado: 'derecha', renglon: 'ultimo' }] },
  {
    ancho: 768,
    alto: 1024,
    renglones: [{ x: 109, y: 497, ancho: 550, alto: 30 }],
    flechas: [
      { boton: { x: 16, y: 16, ancho: 48, alto: 48 }, lado: 'izquierda', renglon: 'primero' },
      { boton: { x: 704, y: 16, ancho: 48, alto: 48 }, lado: 'derecha', renglon: 'primero' },
    ],
  },
  {
    ancho: 390,
    alto: 844,
    renglones: [
      { x: 80, y: 400, ancho: 230, alto: 23 },
      { x: 85, y: 425, ancho: 220, alto: 23 },
    ],
    flechas: [
      { boton: { x: 16, y: 16, ancho: 48, alto: 48 }, lado: 'izquierda', renglon: 'primero' },
      { boton: { x: 326, y: 16, ancho: 48, alto: 48 }, lado: 'derecha', renglon: 'primero' },
    ],
  },
]
const corto = (c: CasoDeLaFlecha): number => Math.min(c.ancho, c.alto)
const bienTrazada = (t: Trazado, c: CasoDeLaFlecha, f: CasoDeLaFlecha['flechas'][number]): boolean => {
  const { punta, centro, radio, direccion, puntos, camino } = t
  const enElBorde = Math.abs(Math.hypot(punta.x - centro.x, punta.y - centro.y) - radio) < 0.01
  const alCentro = Math.abs(direccion.x * (centro.x - punta.x) + direccion.y * (centro.y - punta.y) - radio) < 0.01
  const ultimo = puntos[puntos.length - 2]
  const derecho = Math.abs((punta.x - ultimo.x) * direccion.y - (punta.y - ultimo.y) * direccion.x) < 0.01
  const fin = camino.puntos[camino.puntos.length - 1]
  const terminaElCamino = Math.hypot(fin.x - punta.x, fin.y - punta.y) < 0.01
  const m = TRAZADO.margen
  const adentro = camino.puntos.every((p) => p.x >= m - 1 && p.x <= c.ancho - m + 1 && p.y >= m - 1 && p.y <= c.alto - m + 1)
  const b = cajaDeLosRenglones(c.renglones)
  const fueraDelTexto = camino.puntos.every((p) => p.x < b.x - 4 || p.x > b.x + b.ancho + 4 || p.y < b.y - 4 || p.y > b.y + b.alto + 4)
  // Sale del costado pedido del renglón pedido (escritorio: a la derecha de «sonido.»).
  const r = f.renglon === 'primero' ? c.renglones[0] : c.renglones[c.renglones.length - 1]
  const sale = puntos[0]
  const delCostado = (f.lado === 'derecha' ? sale.x > r.x + r.ancho : sale.x < r.x) && sale.y >= r.y && sale.y <= r.y + r.alto
  const tresBucles = crucesDelCamino(camino) === 3
  const grandes = t.bucle >= Math.max(TRAZADO.bucle.min, 0.05 * corto(c))
  return enElBorde && alCentro && derecho && terminaElCamino && adentro && fueraDelTexto && delCostado && tresBucles && grandes
}
const aTrazos = (rayas: readonly Raya[], t: Trazado): boolean =>
  rayas.length >= 20 &&
  rayas.every((r) => r.largo >= 3 * TRAZADO.raya.grosor) &&
  rayas.every((r, i) => i === 0 || r.desde - rayas[i - 1].desde > r.largo + 1) &&
  Math.abs(rayas[rayas.length - 1].desde + rayas[rayas.length - 1].largo - (t.camino.largo - TRAZADO.raya.antesDeLaPunta)) < 1
for (const c of CASOS_DE_LA_FLECHA) {
  for (const f of c.flechas) {
    const t = trazarLaFlecha(c.renglones, f.boton, c, f.lado, f.renglon)
    const rayas = rayasDeLaFlecha(t, c)
    const boton = f.boton.x < c.ancho / 2 ? 'sonido (arriba a la izquierda)' : 'movimiento (arriba a la derecha)'
    afirmar(
      bienTrazada(t, c, f) && aTrazos(rayas, t),
      `${String(c.ancho)} · la del ${boton}: sale de la ${f.lado} del ${f.renglon === 'primero' ? 'primer' : 'último'} renglón, sube por encima del texto sin pisarlo, hace 3 bucles grandes encadenados y termina con la punta en el borde del disco (a su radio del centro, ${String(t.radio)} px) apuntando al centro; a trazos (rayas, no puntos)`,
      `${String(crucesDelCamino(t.camino))} cruces · bucles de ${t.bucle.toFixed(1)} px · ${String(rayas.length)} rayas de ${rayas[0]?.largo.toFixed(1) ?? '?'} px · ${t.camino.largo.toFixed(0)} px de camino`,
    )
  }
}
const c1440 = CASOS_DE_LA_FLECHA[0]
const f1440 = c1440.flechas[0]
const bien1440 = trazarLaFlecha(c1440.renglones, f1440.boton, c1440, f1440.lado, f1440.renglon)
controlPositivo('  el detector ve una flecha que termina en el centro del botón (lo taparía)', { ...bien1440, punta: bien1440.centro }, (t) => bienTrazada(t, c1440, f1440))
controlPositivo('  y una que termina 20 px antes', { ...bien1440, punta: { x: bien1440.punta.x - 20 * bien1440.direccion.x, y: bien1440.punta.y - 20 * bien1440.direccion.y } }, (t) => bienTrazada(t, c1440, f1440))
controlPositivo('  y una con un solo bucle (como la de antes)', { ...bien1440, camino: muestrearElCamino([...bien1440.puntos.slice(0, 7), ...bien1440.puntos.slice(-2)]) }, (t) => bienTrazada(t, c1440, f1440))
controlPositivo('  y una que sale de abajo de la frase (la de antes la rodeaba por abajo)', { ...bien1440, puntos: [{ x: 720, y: 500 }, ...bien1440.puntos.slice(1)] }, (t) => bienTrazada(t, c1440, f1440))
controlPositivo('  y una de puntos (la de antes)', rayasDeLaFlecha(bien1440, c1440).map((r) => ({ ...r, largo: TRAZADO.raya.grosor })), (r) => aTrazos(r, bien1440))
const movido = trazarLaFlecha(c1440.renglones, { ...f1440.boton, x: 300, y: 200 }, c1440, 'derecha', 'ultimo')
afirmar(Math.abs(Math.hypot(movido.punta.x - 324, movido.punta.y - 224) - 24) < 0.01, '  y sigue al botón donde esté (la caja real, no un número fijo)')
const juntos = renglonesDe([
  { x: 80, y: 400, ancho: 120, alto: 23 },
  { x: 200, y: 401, ancho: 110, alto: 22 },
  { x: 85, y: 425, ancho: 220, alto: 23 },
])
afirmar(juntos.length === 2 && juntos[0].ancho === 230 && juntos[1].y === 425, '  los rectángulos del texto se juntan por renglón (los que se pisan en altura)')

cerrar('s78-preloader')
