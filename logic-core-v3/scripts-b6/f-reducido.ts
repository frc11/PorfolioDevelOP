/**
 * `prefers-reduced-motion` CON LAS SECCIONES ABIERTAS, SIN ARNÉS. El
 * instrumento de la PARADA 2 (g).
 *
 *     npx tsx scripts-b6/f-reducido.ts
 *
 * ── El mismo método de B5, en tres poses en vez de una ─────────────────────
 *
 * La preferencia es una entrada de AFUERA del árbol: forzarla en un render y
 * después afirmarla es verde por arnés (regla de B4-B). Acá la pone
 * `Emulation.setEmulatedMedia` —lo que el sistema operativo le diría al
 * navegador— y se verifica que la página la LEYÓ. Lo que se afirma sobre la
 * escena no es «no se monta» sino «no se mueve»: dos capturas separadas por
 * 5 s con la página quieta y el puntero sin tocar tienen que ser prácticamente
 * idénticas; y sin la preferencia, el MISMO par tiene que diferir —el control
 * positivo que impide que «quieta» pase en verde porque el canvas estaba negro.
 *
 * B5 lo midió en el hero. B6-A abrió Trabajos y el Cierre sobre la escena, así
 * que se mide en las tres poses donde la escena se ve: el hero, el pin de
 * Trabajos y el Cierre. Para que el velo no atenúe la comparación, el par se
 * captura con todo escondido menos la escena: lo que se compara es la sala.
 */

import { readFileSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { decodificarPng } from '../scripts-b4/png'

import { MARCA_DE_INTRO, PERFIL, PUENTE_DE_AUTOMATIZACION, TEMP, asegurarCarpetas, asentarElHome, conLaPagina, dos, guardarJson } from './b6-comun'
import { LECTOR_DE_PANELES } from './lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from './ocultar'

const VENTANA_DE_QUIETUD_MS = 5000
const ASENTAMIENTO_DEL_CONTENIDO_MS = 4000

const LECTOR = `(() => ({
  preferenciaLeidaPorLaPagina: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  escena: document.querySelector('[data-escena]') !== null,
  ancho: window.innerWidth,
}))()`

interface Leido {
  readonly preferenciaLeidaPorLaPagina: boolean
  readonly escena: boolean
  readonly ancho: number
}

function cuantoSeMovio(rutaA: string, rutaB: string): { pctPixeles: number; mediaDelta: number } {
  const A = decodificarPng(readFileSync(rutaA))
  const B = decodificarPng(readFileSync(rutaB))
  let distintos = 0
  let suma = 0
  const total = A.ancho * A.alto
  for (let i = 0; i < total; i += 1) {
    const k = i * 4
    const d = Math.max(Math.abs(A.datos[k] - B.datos[k]), Math.abs(A.datos[k + 1] - B.datos[k + 1]), Math.abs(A.datos[k + 2] - B.datos[k + 2]))
    if (d > 8) distintos += 1
    suma += d
  }
  return { pctPixeles: dos((100 * distintos) / total), mediaDelta: dos(suma / total) }
}

const POSES = ['hero', 'trabajos', 'cierre'] as const

async function principal(): Promise<void> {
  asegurarCarpetas()
  const filas: { caso: string; pose: string; scrollY: number; leido: Leido; quietud: { pctPixeles: number; mediaDelta: number }; problemas: string[] }[] = []
  for (const reducido of [true, false]) {
    const caso = reducido ? 'reducido' : 'normal'
    console.log(`  … caso ${caso}`)
    const lecturas = await conLaPagina(
      PERFIL,
      '/v3',
      async (s) => {
        await asentarElHome(s)
        const paneles = await medir<{ id: string; top: number; alto: number }[]>(s.pagina, LECTOR_DE_PANELES)
        const salida: { pose: string; scrollY: number; leido: Leido; quietud: { pctPixeles: number; mediaDelta: number } }[] = []
        for (const pose of POSES) {
          const panel = paneles.find((p) => p.id === pose)
          if (panel === undefined) throw new Error(`no existe ${pose}`)
          // Trabajos se mide en el pin, una pantalla adentro; las otras dos, en su tope.
          const y = Math.round(pose === 'trabajos' ? panel.top + s.perfil.alto : panel.top)
          await scrollA(s.pagina, y)
          await esperarElPrimerCuadro(s.pagina)
          await new Promise((r) => setTimeout(r, ASENTAMIENTO_DEL_CONTENIDO_MS))
          const leido = await medir<Leido>(s.pagina, LECTOR)
          if (!(await medir<boolean>(s.pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true)))) throw new Error('no quedó sólo la escena')
          await esperarElPrimerCuadro(s.pagina, 300)
          const antes = `${TEMP}/reducido-${caso}-${pose}-A.png`
          const despues = `${TEMP}/reducido-${caso}-${pose}-B.png`
          await capturar(s.pagina, antes)
          await new Promise((r) => setTimeout(r, VENTANA_DE_QUIETUD_MS))
          await capturar(s.pagina, despues)
          await medir(s.pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false))
          salida.push({ pose, scrollY: y, leido, quietud: cuantoSeMovio(antes, despues) })
        }
        return salida
      },
      { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO], movimientoReducido: reducido },
    )
    for (const l of lecturas) {
      const problemas: string[] = []
      if (l.leido.preferenciaLeidaPorLaPagina !== reducido) problemas.push(`la emulación NO tomó: la página lee ${l.leido.preferenciaLeidaPorLaPagina} y se pidió ${reducido}`)
      if (!l.leido.escena) problemas.push('la escena no está montada')
      if (reducido && l.quietud.pctPixeles > 0.5) problemas.push(`la escena SE MUEVE con la preferencia puesta: ${l.quietud.pctPixeles}% de los píxeles cambian en ${VENTANA_DE_QUIETUD_MS} ms (media ${l.quietud.mediaDelta})`)
      if (!reducido && l.quietud.pctPixeles < 5) problemas.push(`control positivo CAÍDO: sin la preferencia la escena tendría que moverse y sólo cambia el ${l.quietud.pctPixeles}%`)
      filas.push({ caso, ...l, problemas })
      console.log(`    ${caso.padEnd(8)} ${l.pose.padEnd(9)} y=${String(l.scrollY).padStart(5)} · lee ${l.leido.preferenciaLeidaPorLaPagina} · escena ${l.leido.escena ? 'montada' : 'AUSENTE'} · cambian ${l.quietud.pctPixeles}% de los píxeles (media ${l.quietud.mediaDelta})${problemas.length > 0 ? ` ⚠ ${problemas.join(' · ')}` : ''}`)
    }
  }
  const fallas = filas.filter((f) => f.problemas.length > 0).length
  console.log(`\n  ${filas.length} casos, ${fallas} con falla`)
  console.log(`  ${guardarJson('f-reducido', { que: 'la escena no se mueve con prefers-reduced-motion, en las tres poses donde se ve, y sí se mueve sin la preferencia', instrumento: 'scripts-b6/f-reducido.ts — la preferencia la pone Emulation.setEmulatedMedia, no el árbol', filas })}`)
  if (fallas > 0) process.exitCode = 1
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
