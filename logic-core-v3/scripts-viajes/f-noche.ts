/**
 * SPRINT VIAJES — ¿un viaje de día a día pasa por la noche? f-noche.ts <ancho> <alto>
 *
 * Graba cada viaje entre Hero, Quiénes somos, Servicios y Por qué develOP (los doce de día a día)
 * y mide la luminancia media de cada cuadro (`signalstats`, YAVG de 0 a 255). Durante el viaje el
 * `<main>` está apagado: lo que se mide es la sala. El peor cuadro tiene que quedar lejos de la
 * noche. Control positivo: Hero → Trabajos, que es de día a noche, tiene que oscurecer.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, scrollHasta, type Banco } from './banco'
import { clicEnElItem } from './b-humo'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const DE_DIA = ['hero', 'quienes-somos', 'servicios', 'por-que-develop']
const RAIZ = `C:/Users/Valentino/.cache/b4-medicion/viajes/noche-${String(ANCHO)}`

/** A dónde van los cuadros del screencast: un solo escucha para toda la corrida (no se puede dar de baja). */
let grabando: string[] | null = null

async function viajar(b: Banco, id: string): Promise<void> {
  if (id === 'hero') await medir(b.p, `(() => { document.querySelector('[data-instrumento]').click(); return 0 })()`)
  else await clicEnElItem(b, id)
}

/** Graba un viaje y devuelve la luminancia media más baja de sus cuadros. */
async function peorLuz(b: Banco, origen: string, destino: string, knots: Record<string, number>): Promise<number> {
  await scrollHasta(b, knots[origen])
  const dir = `${RAIZ}/${origen}-a-${destino}`
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const cuadros: string[] = []
  const s = b.p.sessionId
  grabando = cuadros
  await b.p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 70, everyNthFrame: 1 }, s)
  await viajar(b, destino)
  await esperar(3600)
  await b.p.conexion.enviar('Page.stopScreencast', {}, s)
  await esperar(200)
  grabando = null
  const propios = cuadros.splice(0)
  propios.forEach((d, i) => writeFileSync(`${dir}/c${String(i).padStart(4, '0')}.jpg`, Buffer.from(d, 'base64')))
  const texto = execFileSync('ffmpeg', ['-loglevel', 'info', '-i', `${dir}/c%04d.jpg`, '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-f', 'null', '-'], { encoding: 'utf8' })
  const valores = [...texto.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]))
  return valores.length === 0 ? Number.NaN : Math.min(...valores)
}

async function principal(): Promise<void> {
  mkdirSync(RAIZ, { recursive: true })
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'viajes-noche' })
  b.p.conexion.al('Page.screencastFrame', (crudo) => {
    const params = crudo as unknown as { data: string; sessionId: number }
    grabando?.push(params.data)
    void b.p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId }, b.p.sessionId)
  })
  try {
    await medir(b.p, `(() => { const a = document.createElement('a'); a.href = '#hero'; a.setAttribute('data-pieza', 'nav-enlace'); a.setAttribute('data-instrumento', ''); a.style.display = 'none'; document.querySelector('[data-pieza="navegacion"]').appendChild(a); return 0 })()`)
    const knots: Record<string, number> = { hero: 0 }
    for (const id of ['quienes-somos', 'servicios', 'por-que-develop', 'trabajos']) {
      await scrollHasta(b, 0)
      await viajar(b, id)
      await esperar(3800)
      knots[id] = await medir<number>(b.p, 'scrollY')
    }
    const filas: unknown[] = []
    for (const origen of DE_DIA) {
      for (const destino of DE_DIA.filter((d) => d !== origen)) {
        const peor = await peorLuz(b, origen, destino, knots)
        filas.push({ origen, destino, peorLuz: +peor.toFixed(1) })
        console.log(JSON.stringify({ origen, destino, peorLuz: +peor.toFixed(1) }))
      }
    }
    const control = await peorLuz(b, 'hero', 'trabajos', knots)
    console.log(JSON.stringify({ control: 'hero-a-trabajos', peorLuz: +control.toFixed(1) }))
    writeFileSync(`${RAIZ}/informe.json`, JSON.stringify({ filas, control }, null, 2))
  } finally {
    await b.cerrar()
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
