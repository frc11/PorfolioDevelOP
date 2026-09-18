/**
 * DESLIZAR-2 · FASE C — EL ATERRIZAJE, EN LOS TRES ALTOS QUE EL DUEÑO NOMBRÓ.
 *
 *     npx tsx scripts-deslizar/c-aterrizaje.ts
 *
 * ── Qué contesta, y por qué se mide en vez de derivarse ───────────────────
 *
 * El dueño comparó el último cuadro de la grabación contra su captura y dijo
 * *«parece correcto ya»*: no hay nada que cambiar. Lo que pidió es **verificarlo
 * con el número**: qué fracción del viewport ocupa la sección Trabajos al frenar,
 * en 1280×800, 1440×900 y 1920×1080, y decirlo si en algún alto queda corta.
 *
 * La cuenta derivada es de una línea —el ancla frena en `8 × ventana − 72`, así
 * que la sección ocupa `ventana − 72`— y `a-llegada.ts` la imprime. Esto la MIDE,
 * y la razón es una regla del repo: **`alto` en `secciones.ts` es un
 * `min-height`, no un alto**, y su docblock publica que el natural de Trabajos es
 * 1.080 px contra los 3.240 declarados a 1920×1080. Si el contenido creciera por
 * encima de la tabla, el borde de abajo se movería y la cuenta derivada dejaría
 * de valer sin que nada se pusiera rojo. Se lee el rect, no la tabla.
 *
 * ⚠ Va con el viaje ENTERO, no con un `scrollTo` a mano: lo que se quiere medir
 * es dónde frena el mecanismo, no dónde frenaría una cuenta.
 */
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from '../scripts-b4/navegador'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'
import { MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from '../scripts-b5/b5-comun'
import {
  DURACION_DEL_DESLIZAMIENTO_S,
  PRELUDIO_MS,
  SELECTOR_DEL_CTA_DEL_HERO,
} from '../src/app/v3/_componentes/deslizamiento'
import { BORDE_INFERIOR_EN_REPOSO_PX } from '../src/app/v3/_lib/navegacion'
import { CONTENIDO } from '../src/app/v3/_secciones/hero/contenido'

const ORIGEN = process.env.ORIGEN_DESLIZAR ?? 'http://localhost:3007'
const ID_DEL_DESTINO = CONTENIDO.cta.destino.slice(1)
const TOTAL_MS = PRELUDIO_MS + DURACION_DEL_DESLIZAMIENTO_S * 1000

/**
 * 1280×800 no está en `perfiles.ts` y se declara acá, local a este bloque:
 * aquel archivo es de B4 y su invariante cuenta SIETE perfiles, así que agregarlo
 * allá movería un censo ajeno por una medición de una sola fase.
 */
const PERFIL_1280: Perfil = {
  id: '1280',
  nombre: '1280',
  procedencia:
    'el alto que el dueño nombró en la instrucción de DESLIZAR-2 para verificar el aterrizaje. Local a este bloque: `perfiles.ts` es de B4 y su invariante cuenta siete.',
  ancho: 1280,
  alto: 800,
  dpr: 1,
  movil: false,
  tactil: false,
  debajoDelUmbral: false,
}

const PERFILES = [PERFIL_1280, perfilPorId('1440'), perfilPorId('1920')] as const

interface Aterrizaje {
  readonly y: number
  readonly altoDeLaVentana: number
  readonly altoDeLaSeccion: number
  readonly topeRelativo: number
  readonly visible: number
  readonly fraccion: number
  readonly hash: string
}

const FUENTE = `(async () => {
  const cta = document.querySelector(${JSON.stringify(SELECTOR_DEL_CTA_DEL_HERO)})
  if (cta === null) throw new Error('no encuentro el CTA del hero')
  cta.click()
  // Se espera el total y un margen: lo que interesa es el cuadro del frenazo.
  await new Promise((r) => setTimeout(r, ${TOTAL_MS + 900}))
  const destino = document.getElementById(${JSON.stringify(ID_DEL_DESTINO)})
  if (destino === null) throw new Error('no encuentro la seccion de destino')
  const caja = destino.getBoundingClientRect()
  const visible = Math.max(0, Math.min(window.innerHeight, caja.bottom) - Math.max(0, caja.top))
  return {
    y: Math.round(window.scrollY),
    altoDeLaVentana: window.innerHeight,
    altoDeLaSeccion: Math.round(caja.height),
    topeRelativo: Math.round(caja.top),
    visible: Math.round(visible),
    fraccion: Math.round((visible / window.innerHeight) * 10000) / 100,
    hash: location.hash,
  }
})()`

let primera = true

async function medirEn(perfil: Perfil): Promise<Aterrizaje> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('deslizar-c'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
    limpiarPerfil: primera,
  })
  primera = false
  try {
    const p = await abrirPagina(chrome)
    try {
      await emular(p, perfil)
      for (const fuente of [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO]) {
        await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: fuente }, p.sessionId)
      }
      await irA(p, `${ORIGEN}/v3`, { marcaDeIntro: false })
      await verificarLaPagina(p, perfil)
      await medir(p, 'new Promise((r) => setTimeout(r, 2500))')
      await medir(
        p,
        `(async () => {
          for (let i = 0; i < 40; i += 1) {
            window.scrollTo(0, 0)
            await new Promise((r) => requestAnimationFrame(r))
            if (window.scrollY === 0) { await new Promise((r) => requestAnimationFrame(r)) }
            if (window.scrollY === 0) return window.scrollY
          }
          return window.scrollY
        })()`,
      )
      return await medir<Aterrizaje>(p, FUENTE)
    } finally {
      await cerrarPagina(p)
    }
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 900))
  }
}

async function principal(): Promise<void> {
  console.log('DESLIZAR-2 · C — el aterrizaje, medido sobre el rect real\n')
  console.log(`  el ancla despeja ${BORDE_INFERIOR_EN_REPOSO_PX} px · el total del viaje son ${TOTAL_MS} ms\n`)
  console.log('  perfil        y al frenar   tope de la seccion   visible / viewport      derivado')
  const filas: { readonly perfil: Perfil; readonly a: Aterrizaje }[] = []
  for (const perfil of PERFILES) {
    const a = await medirEn(perfil)
    filas.push({ perfil, a })
    const derivado = ((perfil.alto - BORDE_INFERIOR_EN_REPOSO_PX) / perfil.alto) * 100
    console.log(
      `  ${perfil.ancho}x${perfil.alto}`.padEnd(15) +
        `${a.y}`.padStart(8) +
        `${a.topeRelativo} px`.padStart(20) +
        `   ${a.visible} / ${a.altoDeLaVentana} = ${a.fraccion.toFixed(1)} %`.padEnd(24) +
        `${derivado.toFixed(1)} %`,
    )
  }
  console.log()
  const cortas = filas.filter(({ a }) => a.fraccion < 90)
  console.log(
    cortas.length === 0
      ? `  ✅ en los TRES altos la seccion ocupa mas del 90 % del viewport: ${filas.map(({ a }) => `${a.fraccion.toFixed(1)} %`).join(' · ')}`
      : `  🔴 QUEDA CORTA en ${cortas.length}: ${cortas.map(({ perfil, a }) => `${perfil.ancho}x${perfil.alto} → ${a.fraccion.toFixed(1)} %`).join(' · ')}`,
  )
  console.log(
    `  y el tope de la seccion cae a ${filas.map(({ a }) => `${a.topeRelativo}`).join(' / ')} px del borde de arriba` +
      ` — el despeje del ancla, donde vive la pastilla`,
  )
  const alturas = filas.map(({ a }) => a.altoDeLaSeccion)
  console.log(`  la seccion mide ${alturas.join(' / ')} px de alto REAL, contra 3 x ventana = ${PERFILES.map((p) => p.alto * 3).join(' / ')} declarados`)
}

void principal()
