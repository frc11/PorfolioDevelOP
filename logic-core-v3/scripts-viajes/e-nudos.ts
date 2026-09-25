/**
 * SPRINT VIAJES — ¿cada destino cae en su nudo? e-nudos.ts <ancho> <alto>
 *
 * Desde el Hero, un viaje a cada sección; en el píxel de llegada (y) se mira la propiedad que
 * define su nudo, contra un poco antes y un poco después:
 *   · Quiénes somos — las piezas de la primera pantalla quietas en y y en y+30, y todavía llegando
 *     en y−30 (el primer píxel de reposo). Si el reposo no entra en el cuadro, el título despejado.
 *   · Trabajos — «Portfolio» quieto en pantalla (y = y+30) y todavía subiendo en y−30; sin huir.
 *   · Servicios — el rodillo en el 00 en y, y en el 01 un píxel después (ya rotado).
 *   · Por qué develOP — ≥1024: la frase subida entera en y y sin terminar en y−30, y ningún valor
 *     llegando en y pero sí en y+30. <1024: el tope de la sección en el borde del cuadro.
 * Control positivo: las mismas preguntas en el ancla nativa (el tope menos 72 px) tienen que fallar.
 */
import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, type Banco } from './banco'
import { clicEnElItem } from './b-humo'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const ESCRITORIO = ANCHO >= 1024

async function ir(b: Banco, y: number, esperaMs = 500): Promise<void> {
  await medir(b.p, `(() => { window.scrollTo(0, ${String(y)}); return 0 })()`)
  await esperar(esperaMs)
}

const LECTURAS = {
  piezas: `[...document.querySelectorAll('[data-panel="quienes-somos"] [data-composicion="agencia"] [style]')].map((e) => { const c = getComputedStyle(e); return c.transform + c.opacity + c.clipPath + c.maskImage }).join('|')`,
  titulo: `document.querySelector('[data-panel="quienes-somos"] [data-composicion="agencia"] > [data-arbol]').getBoundingClientRect().top`,
  cartel: `(() => { const e = document.querySelector('[data-pieza="cartel"]'); const c = getComputedStyle(e); return { tope: e.getBoundingClientRect().top, visible: c.visibility === 'visible' && Number(c.opacity) > 0.99 } })()`,
  rodillo: `new DOMMatrix(getComputedStyle(document.querySelector('[data-rodillo="estados"] > div')).transform).m42`,
  frase: `new DOMMatrix(getComputedStyle(document.querySelector('[data-pieza="frase-del-final"]')).transform).m42`,
  valores: `Math.max(...[...document.querySelectorAll('[data-pieza="escenario-del-final"] li [style]')].map((e) => Number(getComputedStyle(e).opacity)))`,
  tope: (id: string) => `document.querySelector('[data-panel="${id}"]').getBoundingClientRect().top`,
}

/** Las preguntas del nudo de una sección, en el píxel `y`. Devuelve qué se cumplió. */
async function nudoEn(b: Banco, id: string, y: number): Promise<Record<string, boolean | number>> {
  const leer = <T>(expresion: string): Promise<T> => medir<T>(b.p, expresion)
  if (id === 'quienes-somos' && ESCRITORIO) {
    await ir(b, y)
    const enY = await leer<string>(LECTURAS.piezas)
    const titulo = await leer<number>(LECTURAS.titulo)
    await ir(b, y + 30)
    const despues = await leer<string>(LECTURAS.piezas)
    await ir(b, y - 30)
    const antes = await leer<string>(LECTURAS.piezas)
    await ir(b, y)
    const reposo = enY === despues && enY !== antes
    return { reposo, tituloDespejado: titulo >= 72 - 1, tituloEn: Math.round(titulo), cumple: reposo || Math.abs(titulo - 72) <= 1.5 }
  }
  if (id === 'trabajos') {
    await ir(b, y)
    const enY = await leer<{ tope: number; visible: boolean }>(LECTURAS.cartel)
    await ir(b, y + 30)
    const despues = await leer<{ tope: number; visible: boolean }>(LECTURAS.cartel)
    await ir(b, y - 30)
    const antes = await leer<{ tope: number; visible: boolean }>(LECTURAS.cartel)
    await ir(b, y)
    const quieto = Math.abs(enY.tope - despues.tope) < 1
    const subia = Math.abs(antes.tope - enY.tope) > 5
    return { quieto, subia, visible: enY.visible, cumple: quieto && subia && enY.visible }
  }
  if (id === 'servicios') {
    await ir(b, y, 1800)
    const enY = await leer<number>(LECTURAS.rodillo)
    await ir(b, y + 2, 1800)
    const despues = await leer<number>(LECTURAS.rodillo)
    await ir(b, y, 1800)
    const tope = await leer<number>(LECTURAS.tope(id))
    return { en00: Math.abs(enY) < 0.5, pasaAl01: despues < -1, tope: Math.round(tope), cumple: Math.abs(enY) < 0.5 && despues < -1 && Math.abs(tope) <= 1 }
  }
  // Abajo de 1024 Quiénes somos y Por qué no tienen coreografía que esperar: el nudo es su tope.
  if (!ESCRITORIO) {
    await ir(b, y)
    const tope = await leer<number>(LECTURAS.tope(id))
    return { tope: Math.round(tope), cumple: Math.abs(tope) <= 1 }
  }
  await ir(b, y)
  const frase = await leer<number>(LECTURAS.frase)
  const valores = await leer<number>(LECTURAS.valores)
  await ir(b, y - 30)
  const fraseAntes = await leer<number>(LECTURAS.frase)
  await ir(b, y + 30)
  const valoresDespues = await leer<number>(LECTURAS.valores)
  await ir(b, y)
  const subida = -0.3 * ALTO
  return {
    fraseSubida: Math.abs(frase - subida) < 1,
    fraseAntesSubiendo: fraseAntes > subida + 1,
    sinValores: valores < 0.01,
    valoresDespues: valoresDespues > 0.01,
    cumple: Math.abs(frase - subida) < 1 && fraseAntes > subida + 1 && valores < 0.01 && valoresDespues > 0.01,
  }
}

async function principal(): Promise<void> {
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'viajes-nudos' })
  try {
    for (const id of ['quienes-somos', 'trabajos', 'servicios', 'por-que-develop']) {
      await ir(b, 0, 1500)
      await clicEnElItem(b, id)
      for (let i = 0; i < 80; i += 1) {
        await esperar(100)
        if (!(await medir<boolean>(b.p, `document.querySelector('[data-v3] main').hasAttribute('data-v3-deslizando')`))) break
      }
      await esperar(1500)
      const y = await medir<number>(b.p, 'scrollY')
      const nudo = await nudoEn(b, id, y)
      const ancla = Math.round(await medir<number>(b.p, `document.querySelector('[data-panel="${id}"]').getBoundingClientRect().top + scrollY - 72`))
      const control = await nudoEn(b, id, ancla)
      console.log(JSON.stringify({ ancho: ANCHO, id, y, nudo, controlEnElAncla: { y: ancla, cumple: control.cumple } }))
    }
  } finally {
    await b.cerrar()
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
