/**
 * SPRINT CALIDAD 1 — Fase 0 · el banco del motor: abrir /v3 SIN VSYNC y con los instrumentos del rendimiento.
 *
 * ⚠️ **Por qué sin vsync.** Con el vsync puesto el monitor de la máquina de medición (75 Hz) clava el cuadro en 13,34 ms
 * (o 26,68): un efecto que cuesta 2 ms no se ve y uno que cuesta 5 se ve como el doble. Con `--disable-gpu-vsync` y
 * `--disable-frame-rate-limit` Chrome saca cuadros tan rápido como puede, y el intervalo entre dos `requestAnimationFrame`
 * es el tiempo real del cuadro (el hilo principal, el compositor y la GPU, lo que tarde más). Es el mismo par de banderas
 * que ya usó BLEND-1 (`lanzarChrome`, `banderasExtra`).
 *
 * Los instrumentos van ANTES de que cargue la página y no dibujan nada:
 *   · el pedido del banco (`__entornoDeLaEscena`) y los errores de la consola;
 *   · el GRABADOR: un `requestAnimationFrame` registrado primero (corre antes que la escena y que Lenis en cada cuadro)
 *     que anota el instante y el scroll de cada cuadro en un búfer fijo (no reserva memoria por cuadro), y que puede
 *     MANEJAR el scroll a velocidad constante (el recorrido): lo pone antes de que corra el resto del cuadro;
 *   · el GANCHO DE REACT: un `__REACT_DEVTOOLS_GLOBAL_HOOK__` mínimo que, sólo cuando se lo prende, cuenta los commits
 *     y qué componentes se volvieron a dibujar en cada uno (la bandera de trabajo hecho de la fibra).
 * Sin el contador de dibujos de ESCENA (envuelve cada `drawElements`: costaría en el cuadro que se mide).
 */
import { cerrarChrome, lanzarChrome, type ChromeLanzado } from '../../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA, medir, type Pagina } from '../../scripts-b4/navegador'
import { esperar } from '../../scripts-viajes/banco'
import { ERRORES } from '../../scripts-escena/formacion'

export const SIN_VSYNC = ['--disable-gpu-vsync', '--disable-frame-rate-limit'] as const

export const GRABADOR = `(() => {
  const TOPE = 262144
  const t = new Float64Array(TOPE)
  const y = new Float64Array(TOPE)
  let n = 0
  let grabando = false
  let ruta = null
  const paso = (ahora) => {
    requestAnimationFrame(paso)
    if (ruta !== null) {
      if (ruta.t0 < 0) ruta.t0 = ahora
      const u = Math.min(1, ((ahora - ruta.t0) / 1000) * ruta.vel / Math.max(1, Math.abs(ruta.hasta - ruta.desde)))
      window.scrollTo(0, ruta.desde + (ruta.hasta - ruta.desde) * u)
      if (u >= 1) { const r = ruta; ruta = null; r.fin() }
    }
    if (grabando && n < TOPE) { t[n] = ahora; y[n] = scrollY; n += 1 }
  }
  requestAnimationFrame(paso)
  window.__cuadrosDelBanco = {
    empezar() { n = 0; grabando = true },
    parar() { grabando = false; return { t: Array.from(t.subarray(0, n)), y: Array.from(y.subarray(0, n)) } },
    recorrer(desde, hasta, vel) { return new Promise((fin) => { ruta = { desde, hasta, vel, t0: -1, fin } }) },
  }
})()`

export const GANCHO_DE_REACT = `(() => {
  const cuenta = { activo: false, commits: 0, porRaiz: {}, porComponente: {} }
  window.__commitsDelBanco = cuenta
  const nombre = (f) => {
    const t = f.type
    if (t === null || t === undefined || typeof t === 'string') return null
    return t.displayName || t.name || (t.render && (t.render.displayName || t.render.name)) || (t.type && (t.type.displayName || t.type.name)) || null
  }
  let siguiente = 1
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers: new Map(),
    supportsFiber: true,
    isDisabled: false,
    inject(interno) { const id = siguiente++; this.renderers.set(id, interno); return id },
    onScheduleFiberRoot() {},
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
    checkDCE() {},
    getFiberRoots() { return new Set() },
    onCommitFiberRoot(id, raiz) {
      if (!cuenta.activo) return
      cuenta.commits += 1
      cuenta.porRaiz[id] = (cuenta.porRaiz[id] || 0) + 1
      const pila = [raiz.current]
      while (pila.length > 0) {
        const f = pila.pop()
        if ((f.flags & 1) === 1 && f.alternate !== null) {
          const k = nombre(f)
          if (k !== null) cuenta.porComponente[k] = (cuenta.porComponente[k] || 0) + 1
        }
        if (f.child !== null) pila.push(f.child)
        if (f.sibling !== null) pila.push(f.sibling)
      }
    },
  }
})()`

export interface BancoDelMotor {
  readonly p: Pagina
  readonly ancho: number
  readonly alto: number
  readonly dpr: number
  readonly emular: () => Promise<unknown>
  readonly cerrar: () => Promise<void>
}

export interface OpcionesDelMotor {
  /** El pedido del banco (`producto` por defecto). */
  readonly pedido?: string
  readonly dpr?: number
  /** Con el vsync puesto (sólo para comparar con los bancos de antes). */
  readonly conVsync?: boolean
  /** En frío: el perfil de Chrome limpio, sin la caché de shaders de corridas anteriores (la primera visita). */
  readonly frio?: boolean
}

export async function abrirMotor(ancho: number, alto: number, o: OpcionesDelMotor = {}): Promise<BancoDelMotor> {
  const dpr = o.dpr ?? 1
  const chrome: ChromeLanzado = await lanzarChrome({
    perfil: `C:/Users/Valentino/.cache/b4-medicion/calidad-motor-${String(ancho)}`,
    ancho: ancho + 40,
    alto: alto + 140,
    banderasExtra: o.conVsync === true ? [] : [...SIN_VSYNC],
    limpiarPerfil: o.frio === true,
  })
  const p = await abrirPagina(chrome)
  const s = p.sessionId
  const emular = (): Promise<unknown> =>
    p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: dpr, mobile: ancho < 1024, screenWidth: ancho, screenHeight: alto }, s)
  await p.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] }, s)
  await emular()
  await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: `window.__entornoDeLaEscena = '${o.pedido ?? 'producto'}'; ${ERRORES}; ${GRABADOR}; ${GANCHO_DE_REACT}` }, s)
  await irA(p, 'http://localhost:3000/v3')
  await esperar(4000)
  let estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  for (let intento = 0; intento < 4 && estado.visible !== 'visible'; intento += 1) {
    await p.conexion.enviar('Page.bringToFront', {}, s)
    await esperar(1500)
    estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  }
  if (estado.visible !== 'visible' || estado.ancho !== ancho) throw new Error(`la pestaña no está al frente o el ancho no es el pedido: ${JSON.stringify(estado)}`)
  return {
    p,
    ancho,
    alto,
    dpr,
    emular,
    cerrar: async () => {
      await cerrarPagina(p)
      await cerrarChrome(chrome)
    },
  }
}
