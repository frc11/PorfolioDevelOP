'use client'

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

import { hayBanco } from '../entorno'

/**
 * [CALIDAD 1] Fase 0 · EL PERFIL DE LA GPU — sólo para el banco (`window.__gpuDelBanco`): cuánto tarda en la GPU cada
 * pasada del cuadro, con `EXT_disjoint_timer_query_webgl2`. Una consulta por cada `render` a un búfer propio (las
 * simulaciones del polvo y del piso vivo) y, en el render de la escena, una por OBJETO que se dibuja, agrupadas por
 * su nombre (`object.name`, o el del primer antepasado que lo tenga). Sin banco no se monta nada; sin la extensión,
 * `medir` devuelve `null` (el banco mide por diferencia, apagando pasadas).
 *
 * Mientras mide, pisa `renderer.render` y los `onBeforeRender`/`onAfterRender` de cada objeto (ninguno de la
 * escena los usa); al terminar los devuelve como estaban. Las consultas no se anidan: la del render de la escena no
 * existe, sus objetos llevan la suya.
 */

export interface PasadaMedida {
  /** ms de GPU por cuadro (el promedio de los cuadros medidos). */
  readonly ms: number
  /** Cuántas veces se dibujó por cuadro. */
  readonly veces: number
}

export interface PerfilMedido {
  readonly cuadros: number
  /** La GPU avisó que el reloj no es confiable (un cambio de frecuencia, otra aplicación): se descarta todo. */
  readonly disjunto: boolean
  readonly pasadas: Record<string, PasadaMedida>
  readonly totalMs: number
}

interface Extension {
  readonly TIME_ELAPSED_EXT: number
  readonly GPU_DISJOINT_EXT: number
}

type Dibujable = THREE.Object3D & { readonly isMesh?: boolean; readonly isPoints?: boolean; readonly isLine?: boolean; readonly isSprite?: boolean }

type VentanaDelBanco = Window & {
  __gpuDelBanco?: {
    medir: (cuadros: number, modo?: 'objetos' | 'cuadro') => Promise<PerfilMedido | null>
    contar: (ms: number) => Promise<{ readonly renders: number; readonly cuadros: number }>
    /** Graba el tiempo de GPU de cada cuadro hasta `parar`, que devuelve [instante, ms] por cuadro. */
    grabar: () => void
    parar: () => Promise<readonly (readonly [number, number])[]>
    /** [CALIDAD 1] B1 · los programas compilados, y los que aparecen mientras se vigila. */
    programas: () => unknown
    vigilar: () => void
    vigilados: () => unknown
    /** Para los experimentos con un programa: el contexto y el programa de WebGL de un programa de three. */
    contexto: () => WebGLRenderingContext | WebGL2RenderingContext
    programaCrudo: (id: number) => WebGLProgram | null
    /** [CALIDAD 1] B4 · para los instrumentos que se inyectan desde el banco: el renderer y la escena. */
    tres: () => { readonly gl: THREE.WebGLRenderer; readonly escena: THREE.Scene }
    extension: boolean
  }
}

/** El nombre de la pasada de un objeto: el suyo, el de un antepasado, o su tipo. */
function nombreDe(o: THREE.Object3D): string {
  for (let a: THREE.Object3D | null = o; a !== null; a = a.parent) if (a.name !== '') return a.name
  return `(sin nombre) ${o.type}`
}

function crearPerfil(renderer: THREE.WebGLRenderer, escena: THREE.Scene) {
  const ctx = renderer.getContext() as WebGL2RenderingContext
  const ext = ctx.getExtension('EXT_disjoint_timer_query_webgl2') as Extension | null

  /** `objetos`: una consulta por objeto de la escena; `cuadro`: una sola por el render de la escena (para contrastar). */
  const medir = (cuadros: number, modo: 'objetos' | 'cuadro' = 'objetos'): Promise<PerfilMedido | null> => {
    if (ext === null) return Promise.resolve(null)
    const consultas: { readonly q: WebGLQuery; readonly pasada: string }[] = []
    let abierta = false
    const abrir = (pasada: string): void => {
      if (abierta) return
      const q = ctx.createQuery()
      ctx.beginQuery(ext.TIME_ELAPSED_EXT, q)
      consultas.push({ q, pasada })
      abierta = true
    }
    const cerrar = (): void => {
      if (!abierta) return
      ctx.endQuery(ext.TIME_ELAPSED_EXT)
      abierta = false
    }
    // Las simulaciones: cada render a un búfer propio, una consulta.
    const render = renderer.render
    renderer.render = (s: THREE.Object3D, c: THREE.Camera): void => {
      const rt = renderer.getRenderTarget()
      if (rt === null || s === escena) {
        if (modo === 'cuadro' && s === escena) abrir('escena entera')
        render.call(renderer, s, c)
        if (modo === 'cuadro' && s === escena) cerrar()
        return
      }
      abrir(`simulación ${String(rt.width)}×${String(rt.height)}`)
      render.call(renderer, s, c)
      cerrar()
    }
    // La escena: cada objeto que se dibuja, una consulta.
    const pisados: { readonly o: THREE.Object3D; readonly antes: THREE.Object3D['onBeforeRender']; readonly despues: THREE.Object3D['onAfterRender'] }[] = []
    if (modo === 'objetos') escena.traverse((o) => {
      const d = o as Dibujable
      if (d.isMesh !== true && d.isPoints !== true && d.isLine !== true && d.isSprite !== true) return
      const pasada = nombreDe(o)
      pisados.push({ o, antes: o.onBeforeRender, despues: o.onAfterRender })
      o.onBeforeRender = () => abrir(pasada)
      o.onAfterRender = () => cerrar()
    })
    const soltar = (): void => {
      renderer.render = render
      for (const p of pisados) {
        p.o.onBeforeRender = p.antes
        p.o.onAfterRender = p.despues
      }
    }
    return new Promise((resolver) => {
      let quedan = cuadros
      const contar = (): void => {
        quedan -= 1
        if (quedan > 0) {
          requestAnimationFrame(contar)
          return
        }
        soltar()
        const leer = (): void => {
          if (!consultas.every(({ q }) => ctx.getQueryParameter(q, ctx.QUERY_RESULT_AVAILABLE) === true)) {
            requestAnimationFrame(leer)
            return
          }
          const disjunto = ctx.getParameter(ext.GPU_DISJOINT_EXT) === true
          const suma = new Map<string, { ns: number; veces: number }>()
          for (const { q, pasada } of consultas) {
            const ns = Number(ctx.getQueryParameter(q, ctx.QUERY_RESULT))
            const s = suma.get(pasada) ?? { ns: 0, veces: 0 }
            suma.set(pasada, { ns: s.ns + ns, veces: s.veces + 1 })
            ctx.deleteQuery(q)
          }
          const pasadas: Record<string, PasadaMedida> = {}
          let total = 0
          for (const [pasada, s] of suma) {
            pasadas[pasada] = { ms: s.ns / 1e6 / cuadros, veces: s.veces / cuadros }
            total += s.ns / 1e6 / cuadros
          }
          resolver({ cuadros, disjunto, pasadas, totalMs: total })
        }
        requestAnimationFrame(leer)
      }
      requestAnimationFrame(contar)
    })
  }

  /**
   * La GRABACIÓN: el tiempo de GPU de CADA cuadro mientras dura (el render de la escena más las simulaciones de ese
   * cuadro), para un recorrido entero. Las consultas se leen a medida que están, así que vivas hay pocas.
   */
  const grabar = (): (() => Promise<readonly (readonly [number, number])[]>) => {
    if (ext === null) return () => Promise.resolve([])
    const render = renderer.render
    const vivas: { readonly q: WebGLQuery; readonly t: number; readonly escena: boolean }[] = []
    const cuadros: [number, number][] = []
    let pendiente = 0
    let abierta = false
    let grabando = true
    renderer.render = (s: THREE.Object3D, c: THREE.Camera): void => {
      if (abierta) {
        render.call(renderer, s, c)
        return
      }
      const q = ctx.createQuery()
      ctx.beginQuery(ext.TIME_ELAPSED_EXT, q)
      abierta = true
      render.call(renderer, s, c)
      ctx.endQuery(ext.TIME_ELAPSED_EXT)
      abierta = false
      vivas.push({ q, t: performance.now(), escena: s === escena })
    }
    const drenar = (): void => {
      if (ctx.getParameter(ext.GPU_DISJOINT_EXT) === true) pendiente = Number.NaN
      while (vivas.length > 0 && ctx.getQueryParameter(vivas[0].q, ctx.QUERY_RESULT_AVAILABLE) === true) {
        const v = vivas.shift()
        if (v === undefined) break
        pendiente += Number(ctx.getQueryParameter(v.q, ctx.QUERY_RESULT)) / 1e6
        ctx.deleteQuery(v.q)
        // Las simulaciones van antes que la escena en el mismo cuadro: la escena cierra el cuadro.
        if (v.escena) {
          cuadros.push([v.t, pendiente])
          pendiente = 0
        }
      }
      if (grabando || vivas.length > 0) requestAnimationFrame(drenar)
    }
    requestAnimationFrame(drenar)
    return () =>
      new Promise((resolver) => {
        grabando = false
        renderer.render = render
        const esperar = (): void => {
          if (vivas.length > 0) {
            requestAnimationFrame(esperar)
            return
          }
          resolver(cuadros)
        }
        requestAnimationFrame(esperar)
      })
  }

  /**
   * [CALIDAD 1] B1 · LOS PROGRAMAS: cuántos compiló el renderer y quién usa cada uno. `vigilar` anota, cuadro a cuadro,
   * cuándo aparece uno nuevo (con el scroll), para saber qué se compila tarde (la primera vez que aparece una variante).
   */
  const programas = (): { readonly total: number; readonly lista: readonly { readonly id: number; readonly nombre: string; readonly usadoPor: readonly string[] }[] } => {
    const lista = renderer.info.programs ?? []
    const usadoPor = new Map<number, Set<string>>()
    escena.traverse((o) => {
      const d = o as Dibujable & { material?: THREE.Material | THREE.Material[] }
      if (d.material === undefined) return
      for (const m of Array.isArray(d.material) ? d.material : [d.material]) {
        const programa = (renderer.properties.get(m) as { currentProgram?: { id: number } }).currentProgram
        if (programa !== undefined) (usadoPor.get(programa.id) ?? usadoPor.set(programa.id, new Set()).get(programa.id))?.add(nombreDe(o))
      }
    })
    return { total: lista.length, lista: lista.map((p) => ({ id: p.id, nombre: p.name, usadoPor: [...(usadoPor.get(p.id) ?? [])] })) }
  }
  const nuevos: { t: number; y: number; ids: number[] }[] = []
  let vigilando = false
  const vigilar = (): void => {
    vigilando = true
    nuevos.length = 0
    let antes = new Set((renderer.info.programs ?? []).map((p) => p.id))
    const paso = (): void => {
      if (!vigilando) return
      const ahora = renderer.info.programs ?? []
      if (ahora.length !== antes.size) {
        const ids = ahora.map((p) => p.id).filter((id) => !antes.has(id))
        if (ids.length > 0) nuevos.push({ t: performance.now(), y: window.scrollY, ids })
        antes = new Set(ahora.map((p) => p.id))
      }
      requestAnimationFrame(paso)
    }
    requestAnimationFrame(paso)
  }
  const vigilados = (): { readonly nuevos: readonly { t: number; y: number; ids: number[] }[]; readonly programas: ReturnType<typeof programas> } => {
    vigilando = false
    return { nuevos: [...nuevos], programas: programas() }
  }

  /** Cuántos renders de la escena y cuántos cuadros de animación hubo en `ms` (¿cada cuadro dibuja?). */
  const contar = (ms: number): Promise<{ readonly renders: number; readonly cuadros: number }> => {
    const render = renderer.render
    let renders = 0
    let cuadros = 0
    renderer.render = (s: THREE.Object3D, c: THREE.Camera): void => {
      if (s === escena) renders += 1
      render.call(renderer, s, c)
    }
    const hasta = performance.now() + ms
    return new Promise((resolver) => {
      const paso = (ahora: number): void => {
        cuadros += 1
        if (ahora < hasta) {
          requestAnimationFrame(paso)
          return
        }
        renderer.render = render
        resolver({ renders, cuadros })
      }
      requestAnimationFrame(paso)
    })
  }

  return { medir, contar, grabar, programas, vigilar, vigilados, hayExtension: ext !== null }
}

export function PerfilDeLaGpu() {
  const gl = useThree((s) => s.gl)
  const escena = useThree((s) => s.scene)
  useEffect(() => {
    if (!hayBanco()) return undefined
    const perfil = crearPerfil(gl, escena)
    const ventana = window as VentanaDelBanco
    let parar: (() => Promise<readonly (readonly [number, number])[]>) | null = null
    ventana.__gpuDelBanco = {
      medir: perfil.medir,
      contar: perfil.contar,
      grabar: () => {
        parar = perfil.grabar()
      },
      parar: () => (parar === null ? Promise.resolve([]) : parar()),
      programas: perfil.programas,
      vigilar: perfil.vigilar,
      vigilados: perfil.vigilados,
      contexto: () => gl.getContext(),
      programaCrudo: (id) => (gl.info.programs ?? []).find((p) => p.id === id)?.program ?? null,
      tres: () => ({ gl, escena }),
      extension: perfil.hayExtension,
    }
    return () => {
      delete ventana.__gpuDelBanco
    }
  }, [gl, escena])
  return null
}
