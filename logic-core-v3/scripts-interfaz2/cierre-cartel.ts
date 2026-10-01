/**
 * SPRINT INTERFAZ 2 · cierre — el cartel de las demos pegado al cursor: el clip (entrar a una demo, pasar a la vecina —el
 * texto cambia—, salir), el mismo clip a un cuarto de velocidad, y la sonda: en cada cuadro, el ancho, la escala y la
 * posición del cartel y su texto (leídos de la página con `requestAnimationFrame`), más si la pastilla fija del estante
 * se mostró con el mouse (no tiene que) y con el teclado (sí). Va a `interfaz2/cierre/cartel/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, centroDe, correr, enCamaraLenta, esperar, grabar, hastaElEstante, raton, tecla } from './banco'

const LIBRO = '[data-panel="trabajos"] a[data-pieza="libro"]'
const MUESTREO = `(() => { window.__cartel = []; const c = document.querySelector('[data-pieza="cursor-sala"]'); const caja = c && c.querySelector('[data-parte="cartel"]'); const paso = () => { if (c && caja) { const r = caja.getBoundingClientRect(); const s = getComputedStyle(c); window.__cartel.push({ t: performance.now(), ancho: Math.round(r.width), x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), escala: Number(s.getPropertyValue('--cursor-cartel-escala') || 0), estado: c.getAttribute('data-estado'), texto: [...caja.querySelectorAll('[data-visible]')].map((e) => e.textContent).join('|'), fijo: !!document.querySelector('[data-pieza="cartel-de-demos"][data-parte="del-estante"][data-visible]') }) } window.__muestreoCartel = requestAnimationFrame(paso) }; paso() })()`

correr(async () => {
  const dir = carpeta('cierre/cartel')
  const b = await abrir(1440, 900, { pedido: 'producto' })
  try {
    const fuera: [number, number] = [720, 860]
    await raton(b, [700, 840], fuera, 3, 30)
    if (!(await hastaElEstante(b))) throw new Error('no llegué al estante')
    const l2 = await centroDe(b, LIBRO, 2)
    const l3 = await centroDe(b, LIBRO, 3)
    if (l2 === null || l3 === null) throw new Error('sin libros')
    const caja2 = await medir<{ top: number; bottom: number }>(b.p, `(() => { const r = document.querySelectorAll('${LIBRO}')[2].getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) } })()`)
    const gesto = async (): Promise<void> => {
      await esperar(500)
      await raton(b, fuera, [l2[0] - 20, l2[1] + 50], 16, 16)
      await esperar(1300)
      await raton(b, [l2[0] - 20, l2[1] + 50], [l3[0] + 10, l3[1] + 30], 10, 16)
      await esperar(1300)
      await raton(b, [l3[0] + 10, l3[1] + 30], fuera, 14, 16)
      await esperar(1200)
    }
    await medir(b.p, MUESTREO)
    const cuadros = await grabar(b, `${dir}/_cuadros`, gesto, 1200)
    const muestras = await medir<{ t: number; ancho: number; x: number; y: number; escala: number; estado: string; texto: string; fijo: boolean }[]>(b.p, 'cancelAnimationFrame(window.__muestreoCartel), window.__cartel')
    armarClip(`${dir}/_cuadros`, cuadros, `${dir}/cartel.mp4`, `el cartel pegado al cursor - entrar, pasar a la vecina, salir - ${b.placa.includes('NVIDIA') ? 'NVIDIA' : b.placa}`)
    enCamaraLenta(`${dir}/cartel.mp4`, `${dir}/cartel-a-un-cuarto.mp4`, 4)
    // Lo que se ve: el ancho y la escala nunca saltan (un objeto continuo), y nunca hay dos carteles.
    let [saltoDeAncho, saltoDeEscala] = [0, 0]
    for (let i = 1; i < muestras.length; i += 1) {
      saltoDeAncho = Math.max(saltoDeAncho, Math.abs(muestras[i].ancho - muestras[i - 1].ancho))
      saltoDeEscala = Math.max(saltoDeEscala, Math.abs(muestras[i].escala - muestras[i - 1].escala))
    }
    const textos = [...new Set(muestras.map((m) => m.texto).filter((t) => t !== ''))]
    const tapaLaCara = muestras.some((m) => m.estado === 'demo' && m.escala > 0.9 && m.y > caja2.top)
    // El teclado: la pastilla fija sigue (foco en un libro).
    await raton(b, fuera, [1400, 880], 4, 16)
    await medir(b.p, `document.querySelectorAll('${LIBRO}')[1].focus()`)
    await tecla(b, 'Tab')
    await esperar(900)
    const conTeclado = await medir<boolean>(b.p, `!!document.querySelector('[data-pieza="cartel-de-demos"][data-parte="del-estante"][data-visible]')`)
    const salida = {
      placa: b.placa,
      cuadros: muestras.length,
      textos,
      saltoDeAnchoMaximoPx: saltoDeAncho,
      saltoDeEscalaMaximo: Number(saltoDeEscala.toFixed(3)),
      dosCartelesConElMouse: muestras.some((m) => m.fijo && m.escala > 0.05),
      laPastillaFijaConElMouse: muestras.some((m) => m.fijo),
      laPastillaFijaConElTeclado: conTeclado,
      tapaLaCaraDelLibro: tapaLaCara,
      topeDelLibro: caja2.top,
    }
    writeFileSync(`${dir}/sonda.json`, JSON.stringify({ ...salida, muestras }, null, 1))
    console.log(JSON.stringify(salida, null, 1))
  } finally {
    await b.cerrar()
  }
})
