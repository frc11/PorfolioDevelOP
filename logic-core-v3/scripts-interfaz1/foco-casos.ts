/**
 * SPRINT INTERFAZ 1 · cierre — el foco de los casos que el pase de Tab capturó mal: foco-casos.ts <rótulo>
 *
 * El pase entero (`foco.ts`) captura a los 0,9 s + scroll quieto: un control que todavía se está moviendo (el primer
 * libro mientras el estante se acomoda, un ítem del carrusel que se desliza a la vista) sale con el recorte corrido.
 * Acá cada caso se mide como lo vive una persona con teclado: desde arriba, Tab por Tab hasta el control (corren los
 * gestos de la página: el carrusel trae el ítem, el túnel salta a su piso), y se espera a que
 * la caja del control esté QUIETA (la misma en 8 lecturas seguidas, 1 s), CON TAMAÑO y ENTERA en pantalla antes de
 * capturar (una capa que todavía no llegó, como las demos en el teléfono, da una caja de 0 px quieta).
 * Lo mide `foco-hoja.py` (las franjas del anillo, escaladas como la caja). Va a
 * `interfaz1/t3-completitud/foco-casos-<rótulo>/`.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, carpeta, correr, esperar, tecla, type Banco } from './banco'
import { LEER } from './foco'

const ROTULO = process.argv[2] ?? 'despues'

interface Caso {
  readonly id: string
  readonly ancho: number
  readonly alto: number
  /** El control: el primero (en el orden del documento) que coincida y tenga este nombre. */
  readonly selector: string
  readonly nombre: string
}

const TODOS_LOS_CASOS: readonly Caso[] = [
  { id: 'libro-1-1440', ancho: 1440, alto: 900, selector: '[data-pieza="libro"]', nombre: 'Zero Protocol' },
  { id: 'carrusel-zero-390', ancho: 390, alto: 844, selector: '[data-pieza="carrusel"] a', nombre: 'Zero Protocol' },
  { id: 'carrusel-nexo-390', ancho: 390, alto: 844, selector: '[data-pieza="carrusel"] a', nombre: 'NEXO Bold' },
  { id: 'tunel-esquina-390', ancho: 390, alto: 844, selector: '[data-pieza="enlace-de-proyecto"]', nombre: 'Esquina Estudio' },
  { id: 'tunel-banu-390', ancho: 390, alto: 844, selector: '[data-pieza="enlace-de-proyecto"]', nombre: 'Banú Scents' },
]

// FOCO_CASOS=<texto>: sólo los casos cuyo id lo contiene (p. ej. «carrusel»).
const CASOS = TODOS_LOS_CASOS.filter((c) => c.id.includes(process.env.FOCO_CASOS ?? ''))

const CAJA = `(() => { const r = document.activeElement.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), innerWidth, innerHeight] })()`

const ES_EL_CASO = (c: Caso): string => `(() => { const e = document.activeElement; return !!e && e.matches(${JSON.stringify(c.selector)}) && ((e.getAttribute('aria-label') || '') + ' ' + e.textContent).includes(${JSON.stringify(c.nombre)}) })()`

async function unCaso(b: Banco, dir: string, c: Caso, paso: number): Promise<Record<string, unknown>> {
  // Desde arriba, Tab por Tab hasta el caso (el camino de una persona con teclado: cada control corre sus gestos).
  await medir(b.p, 'document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0)')
  await esperar(1500)
  let llego = false
  for (let k = 0; k < 120 && !llego; k += 1) {
    await tecla(b, 'Tab')
    await esperar(260)
    llego = await medir<boolean>(b.p, ES_EL_CASO(c))
  }
  if (!llego) return { paso, caso: c.id, nada: true, motivo: 'Tab no llegó' }
  // Quieta y entera: la misma caja en 8 lecturas seguidas (cada 125 ms), toda adentro del cuadro; hasta 8 s.
  let [antes, quietas, entera] = ['', 0, false]
  for (let k = 0; k < 64 && !(quietas >= 8 && entera); k += 1) {
    await esperar(125)
    const caja = await medir<number[]>(b.p, CAJA)
    const ahora = caja.slice(0, 4).join(',')
    quietas = ahora === antes ? quietas + 1 : 0
    antes = ahora
    // Con tamaño: una capa que todavía no llegó (escala 0) da una caja de 0 px, quieta y falsa.
    entera = caja[2] > 2 && caja[3] > 2 && caja[0] >= 0 && caja[1] >= 0 && caja[0] + caja[2] <= caja[4] + 1 && caja[1] + caja[3] <= caja[5]
    if (!entera) quietas = 0
  }
  await esperar(1500) // el rollover y el anillo terminan de entrar
  const info = await medir<Record<string, unknown>>(b.p, LEER)
  const png = `${String(paso).padStart(3, '0')}.png`
  const cap = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  writeFileSync(`${dir}/${png}`, Buffer.from(cap.data, 'base64'))
  await b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: c.ancho, height: c.alto, deviceScaleFactor: 1, mobile: c.ancho < 1024, screenWidth: c.ancho, screenHeight: c.alto }, b.p.sessionId)
  return { paso, png, caso: c.id, quieta: quietas >= 8, entera, ...info }
}

correr(async () => {
  const dir = `${carpeta('t3-completitud')}/foco-casos-${ROTULO}`
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const pasos: Record<string, unknown>[] = []
  for (const ancho of [...new Set(CASOS.map((c) => c.ancho))]) {
    const casos = CASOS.filter((c) => c.ancho === ancho)
    const b = await abrir(ancho, casos[0].alto)
    try {
      for (const c of casos) pasos.push(await unCaso(b, dir, c, pasos.length))
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${dir}/pasos.json`, JSON.stringify({ rotulo: ROTULO, pasos }, null, 1))
  console.log(JSON.stringify(pasos.map((p) => ({ caso: p.caso, quieta: p.quieta, entera: p.entera, nombre: p.nombre, nada: p.nada }))))
})
