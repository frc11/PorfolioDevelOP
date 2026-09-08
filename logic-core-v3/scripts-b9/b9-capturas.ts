/**
 * B9 · LAS CAPTURAS DE POR QUÉ DEVELOP, EN EL MISMO `scrollY` ANTES Y DESPUÉS.
 *
 * ── Las cuatro reglas de captura de B4-B, y cómo se cumplen acá ───────────
 *
 *   1. **La escena tarda entre 300 y 700 ms en dibujar su primer cuadro**, y
 *      fotografiarla antes miente por 77 puntos de aire muerto. Se espera
 *      `GRACIA_DE_ESCENA_MS` (1200) en CADA parada, no sólo en la primera.
 *   2. **El recorte exige el scroll ahí.** Acá no hay recorte: se captura el
 *      viewport tal cual, después de un `scrollA` real, así que lo que sale es
 *      lo que el visitante vería en ese píxel de scroll.
 *   3. **Escribir en `docs/` con el navegador abierto corrompe la medición.**
 *      Los PNG se escriben en el temporal y se mudan con el Chrome ya cerrado.
 *   4. **El preloader no arma bajo webdriver**: se navega con la marca del intro
 *      puesta antes del primer pintado (`irA` lo hace por defecto).
 *
 * ⚠️ **Y la que hace comparable el par**: se publica el `scrollHeight` del
 * documento en cada corrida. Si el «después» no mide lo mismo que el «antes»,
 * el mismo `scrollY` ya no es el mismo lugar y las capturas no se pueden restar.
 *
 * Corre con:
 *
 *     npx tsx scripts-b9/b9-capturas.ts 1920 antes
 *     npx tsx scripts-b9/b9-capturas.ts 1440 despues
 */

import path from 'node:path'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, scrollA, verificarLaPagina } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'
import { jsonPendiente, mudar, rutaTemporal, SITIO, tres, type Pendiente } from './b9-comun'

const RAIZ_DE_CAPTURAS = 'docs/rediseno/capturas/b9'

const PERFIL = process.argv[2] ?? '1920'
const ETIQUETA = process.argv[3] ?? 'antes'

/**
 * Las paradas, **derivadas de la geometría medida y no escritas a mano**: la
 * sección `por-que-develop` mide una pantalla, así que las cinco se expresan
 * como fracciones de pantalla contadas desde su tope.
 *
 *   −0,45  el bloque de los cuatro diferenciales acaba de asomar por abajo
 *    0,00  la sección llena el cuadro exacto
 *    0,22  donde HOY arranca la animación de los cuatro bloques
 *    0,33  el bloque, centrado en el cuadro
 *    0,44  donde HOY la animación termina — la sección ya se fue casi la mitad
 */
const FRACCIONES: readonly number[] = [-0.45, 0, 0.22, 0.33, 0.44]

interface FilaDeCaptura {
  readonly fraccion: number
  readonly scrollPedido: number
  readonly scrollLogrado: number
  readonly archivo: string
  readonly bytes: number
  /** Opacidad en línea mínima entre los descendientes del bloque de P5, en esa parada. */
  readonly opacidadDelDiferencial: number | null
  readonly cajaDelBloque: { readonly top: number; readonly alto: number } | null
}

const LECTURA_DEL_BLOQUE = `(() => {
  const panel = document.querySelector('[data-panel="por-que-develop"]')
  if (panel === null) return null
  const bloques = [...panel.querySelectorAll('[data-arbol]')]
  const el = bloques[bloques.length - 1]
  if (el === undefined) return null
  let o = -1
  for (const d of el.querySelectorAll('[style]')) {
    const m = /(?:^|;)\\s*opacity:\\s*([0-9.]+)/.exec(d.getAttribute('style') ?? '')
    if (m !== null) { const v = Number(m[1]); if (o < 0 || v < o) o = v }
  }
  const r = el.getBoundingClientRect()
  return { opacidad: o < 0 ? null : Math.round(o * 1000) / 1000, top: Math.round(r.top * 10) / 10, alto: Math.round(r.height * 10) / 10 }
})()`

async function main(): Promise<void> {
  const perfil = perfilPorId(PERFIL)
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('b9-capturas'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
  })
  const pendientes: Pendiente[] = []
  const filas: FilaDeCaptura[] = []
  let alturaDelDocumento = 0
  let panelDeLaSeccion: { top: number; alto: number } | null = null
  try {
    const p = await abrirPagina(chrome)
    await emular(p, perfil)
    await irA(p, SITIO)
    const estado = await verificarLaPagina(p, perfil)
    alturaDelDocumento = estado.alturaDelDocumento
    await esperarElPrimerCuadro(p)

    panelDeLaSeccion = await medir<{ top: number; alto: number }>(
      p,
      `(() => {
        const el = document.querySelector('[data-panel="por-que-develop"]')
        const r = el.getBoundingClientRect()
        return { top: Math.round((r.top + window.scrollY) * 10) / 10, alto: Math.round(r.height * 10) / 10 }
      })()`,
    )
    if (panelDeLaSeccion === null) throw new Error('no se encontró [data-panel="por-que-develop"]')

    for (const f of FRACCIONES) {
      const y = Math.round(panelDeLaSeccion.top + f * perfil.alto)
      const logrado = await scrollA(p, y)
      await esperarElPrimerCuadro(p)
      const lectura = await medir<{ opacidad: number | null; top: number; alto: number } | null>(p, LECTURA_DEL_BLOQUE)
      const nombre = `por-que-develop-${perfil.id}-${ETIQUETA}-y${y}.png`
      const temporal = rutaTemporal(nombre)
      const bytes = await capturar(p, temporal)
      pendientes.push({ temporal, destino: path.join(RAIZ_DE_CAPTURAS, nombre) })
      filas.push({
        fraccion: f,
        scrollPedido: y,
        scrollLogrado: logrado,
        archivo: path.join(RAIZ_DE_CAPTURAS, nombre),
        bytes,
        opacidadDelDiferencial: lectura?.opacidad ?? null,
        cajaDelBloque: lectura === null ? null : { top: lectura.top, alto: lectura.alto },
      })
      console.log(
        `f=${String(f).padStart(6)} · y=${String(y).padStart(6)} (logrado ${logrado}) · opacidad del diferencial ${lectura?.opacidad ?? 'null'} · caja top ${lectura?.top ?? '-'} alto ${lectura?.alto ?? '-'} · ${bytes} B`,
      )
    }
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }

  pendientes.push(
    jsonPendiente(`capturas-${perfil.id}-${ETIQUETA}.json`, {
      perfil: perfil.id,
      etiqueta: ETIQUETA,
      alturaDelDocumento,
      panel: panelDeLaSeccion,
      graciaDeEscenaMs: 1200,
      nota: 'si el scrollHeight del documento cambia entre antes y después, el mismo scrollY deja de ser el mismo lugar y el par no se puede restar.',
      filas: filas.map((f) => ({
        ...f,
        topEnPantallas: f.cajaDelBloque === null ? null : tres(f.cajaDelBloque.top / perfil.alto),
      })),
    }),
  )
  const escritos = mudar(pendientes)
  console.log('')
  console.log(`documento: ${alturaDelDocumento} px`)
  for (const e of escritos) console.log(`escrito: ${e}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
