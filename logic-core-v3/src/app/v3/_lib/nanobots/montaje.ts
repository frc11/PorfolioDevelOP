import { CURSOR_EN_VIVO } from '../cursorEnVivo'
import { hayBanco } from '../escena/entorno'
import type { Enjambre } from './enjambre'
import { pasoDelPuntero, punteroQuieto, type ObjetivoDelPuntero } from './puntero'

/**
 * [EL ENCASTRE] 1C · el mouse sobre el lienzo (que no recibe el puntero: se escucha la ventana), en el cuadro del lienzo
 * (de −1 a 1). Se mide al moverse o al scrollear (el lienzo corre debajo del cursor quieto), no en cada cuadro. El dedo no.
 * [RETOQUE DEL ENCASTRE] 2A · con el cursor de la sala, donde se VE el cursor (su halo, interpolado: `cursorEnVivo.ts`),
 * no el puntero nativo; sin él, el puntero. La caja del lienzo se relee al moverse o al scrollear; el cursor, en cada cuadro.
 */
function escucharElPuntero(lienzo: HTMLCanvasElement): { readonly objetivo: (quieto: boolean) => ObjetivoDelPuntero; readonly soltar: () => void } {
  const mouse = { x: 0, y: 0, hay: false, medir: true }
  const objetivo = { x: 0, y: 0, dentro: false }
  const caja = { izquierda: 0, arriba: 0, ancho: 1, alto: 1 }
  const alMover = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.hay = true
    mouse.medir = true
  }
  const alSalir = (): void => {
    mouse.hay = false
    mouse.medir = true
  }
  const alScrollear = (): void => {
    mouse.medir = true
  }
  window.addEventListener('pointermove', alMover, { passive: true })
  window.addEventListener('scroll', alScrollear, { passive: true })
  document.documentElement.addEventListener('pointerleave', alSalir)
  return {
    objetivo: (quieto) => {
      if (mouse.medir) {
        mouse.medir = false
        const r = lienzo.getBoundingClientRect()
        caja.izquierda = r.left
        caja.arriba = r.top
        caja.ancho = Math.max(1, r.width)
        caja.alto = Math.max(1, r.height)
      }
      const conCursor = CURSOR_EN_VIVO.activo
      objetivo.x = (((conCursor ? CURSOR_EN_VIVO.x : mouse.x) - caja.izquierda) / caja.ancho) * 2 - 1
      objetivo.y = 1 - (((conCursor ? CURSOR_EN_VIVO.y : mouse.y) - caja.arriba) / caja.alto) * 2
      objetivo.dentro = mouse.hay && Math.abs(objetivo.x) <= 1 && Math.abs(objetivo.y) <= 1
      return quieto ? { ...objetivo, dentro: false } : objetivo
    },
    soltar: () => {
      window.removeEventListener('pointermove', alMover)
      window.removeEventListener('scroll', alScrollear)
      document.documentElement.removeEventListener('pointerleave', alSalir)
    },
  }
}

/**
 * [PASADA FINAL] C4 · EL ENJAMBRE EN LA PÁGINA — el lazo y lo que lo prende y lo apaga, sin three (el motor llega aparte,
 * perezoso: `GraficoDeServicios` lo importa recién al montar). El lazo corre sólo con el lienzo a la vista y la pestaña
 * visible (pausa fuera de pantalla); el primer cuadro dibujado avisa `listo` (el gráfico deja de mostrar la torta) y
 * si el navegador se lleva el contexto avisa `perdido` (vuelve la torta). Devuelve cómo desmontarlo.
 */
export function montarElEnjambre(
  lienzo: HTMLCanvasElement,
  enjambre: Enjambre,
  posicion: { readonly get: () => number },
  quieto: { readonly current: boolean },
  avisos: { readonly listo: () => void; readonly perdido: () => void },
): () => void {
  let cuadro = 0
  let visible = false
  let avisado = false
  let dibujados = 0
  let pausado = false
  const t0 = performance.now()
  // [EL ENCASTRE] 1C · el hueco del mouse: dos resortes por cuadro (`puntero.ts`); el desarme es del sombreador.
  const oido = escucharElPuntero(lienzo)
  const puntero = punteroQuieto()
  let antes = t0
  const paso = (): void => {
    cuadro = 0
    if (!visible || pausado || document.visibilityState !== 'visible') return
    const ahora = performance.now()
    pasoDelPuntero(puntero, oido.objetivo(quieto.current), (ahora - antes) / 1000)
    antes = ahora
    enjambre.apuntar(puntero)
    enjambre.dibujar((performance.now() - t0) / 1000, posicion.get(), quieto.current)
    dibujados += 1
    if (!avisado) {
      avisado = true
      avisos.listo()
    }
    cuadro = requestAnimationFrame(paso)
  }
  const arrancar = (): void => {
    if (cuadro === 0 && visible) cuadro = requestAnimationFrame(paso)
  }
  const mirador = new IntersectionObserver((entradas) => {
    visible = entradas.some((e) => e.isIntersecting)
    arrancar()
  })
  mirador.observe(lienzo)
  const medidor = new ResizeObserver(() => enjambre.medir(lienzo.clientWidth, lienzo.clientHeight))
  medidor.observe(lienzo)
  document.addEventListener('visibilitychange', arrancar)
  const perdido = (e: Event): void => {
    e.preventDefault()
    cancelAnimationFrame(cuadro)
    cuadro = 0
    visible = false
    mirador.disconnect()
    avisos.perdido()
  }
  lienzo.addEventListener('webglcontextlost', perdido)
  // Con banco: cuántos cuadros dibujó (fuera de pantalla no tiene que contar) y pausarlo (para medir la página sin él).
  const ventana = window as Window & { __nanobotsDelBanco?: { readonly dibujados: () => number; readonly pausar: (si: boolean) => void; readonly puntero: () => Readonly<typeof puntero> } }
  if (hayBanco())
    ventana.__nanobotsDelBanco = {
      dibujados: () => dibujados,
      pausar: (si) => {
        pausado = si
        arrancar()
      },
      puntero: () => ({ ...puntero }),
    }
  return () => {
    if (hayBanco()) delete ventana.__nanobotsDelBanco
    oido.soltar()
    cancelAnimationFrame(cuadro)
    mirador.disconnect()
    medidor.disconnect()
    document.removeEventListener('visibilitychange', arrancar)
    lienzo.removeEventListener('webglcontextlost', perdido)
    enjambre.soltar()
  }
}
