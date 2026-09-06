/**
 * EL CONTROL POSITIVO DEL BANCO, DE PUNTA A PUNTA.
 *
 *     npx tsx scripts-b4/humo.ts
 *
 * `banco.invariant.ts` prueba los instrumentos contra fixturas; esto los prueba
 * contra el sitio, que es lo único que demuestra que la receta entera —lanzar,
 * emular, recargar con la marca, verificar, esperar el primer cuadro, capturar,
 * decodificar— cierra.
 *
 * ── Lo que tiene que pasar, y las DOS cosas que tienen que fallar ─────────
 *
 *   1. Chrome propio levanta, con el otro lane usando el suyo.
 *   2. `/v3` a 1920 verifica los cinco campos del paso 4, `rAF` incluido.
 *   3. La marca del intro apaga el preloader: el documento mide 18 pantallas.
 *   4. **El hero da 0,00 % de aire muerto**, que es el número que B1 publicó.
 *      Es la única cifra de B1 que no depende de un parámetro sin declarar, y
 *      por eso es la que sirve para saber si el instrumento reconstruido mide lo
 *      mismo que el perdido.
 *   5. ⚠️ Emular 375 y verificar contra 1920 TIRA.
 *   6. ⚠️ Y capturar una región lejos del scroll da un número DISTINTO del que
 *      da la misma región con el scroll ahí. Sin esa sexta, la regla de captura
 *      de `captura.ts` sería una precaución sin evidencia.
 */

import { readFileSync } from 'node:fs'

import { aireMuerto } from './aire-muerto'
import { capturar, capturarRegion } from './captura'
import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { decodificarPng } from './png'

const URL_BASE = 'http://localhost:3002'
const PERFIL = perfilPorId('1920')
const TMP = process.env.TEMP ?? '.'

let fallas = 0
function ok(condicion: boolean, texto: string, detalle: string = ''): void {
  if (condicion) console.log(`  ok   ${texto}${detalle === '' ? '' : `  — ${detalle}`}`)
  else {
    fallas += 1
    console.error(`  FALLA ${texto}${detalle === '' ? '' : `  — ${detalle}`}`)
  }
}

function aireDe(ruta: string): number {
  return aireMuerto(decodificarPng(readFileSync(ruta))).porcentaje
}

/** ⚠️ Todo va adentro de una función: `tsx` transpila a CJS acá y no hay `await` de nivel superior. */
async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:\\Users\\Valentino\\.cache\\b4-medicion\\chrome-profile',
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  console.log(`\nChrome propio en el puerto ${chrome.puerto} — el del otro lane no se tocó`)

  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, `${URL_BASE}/v3`)
    const estado = await verificarLaPagina(p, PERFIL)
    ok(true, 'paso 4: la página verifica los cinco campos', JSON.stringify(estado))

    const pantallas = estado.alturaDelDocumento / estado.innerHeight
    ok(
      Math.abs(pantallas - 18) < 0.5,
      'el documento mide 18 pantallas — la marca del intro apagó el preloader y B2 ya corrió',
      `${pantallas.toFixed(2)} pantallas · ${estado.alturaDelDocumento} px`,
    )

    const paneles = await medir<{ id: string; alto: number; top: number }[]>(
      p,
      `[...document.querySelectorAll('[data-panel]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { id: el.dataset.panel, alto: r.height, top: r.top + window.scrollY }
      })`,
    )
    ok(paneles.length === 8, 'hay OCHO paneles con `data-panel`', paneles.map((s) => s.id).join(' · '))

    const hero = paneles[0]
    const r = await capturarRegion(p, `${TMP}\\b4-humo-hero.png`, {
      y: hero.top,
      alto: hero.alto,
      ancho: PERFIL.ancho,
    })
    const img = decodificarPng(readFileSync(`${TMP}\\b4-humo-hero.png`))
    ok(
      img.ancho === PERFIL.ancho && img.alto === Math.round(hero.alto),
      'la captura por región sale al ancho del perfil y al alto REAL de la sección',
      `${img.ancho}×${img.alto}, ${(r.bytes / 1024).toFixed(1)} KiB`,
    )
    const aireHero = aireMuerto(img)
    ok(
      aireHero.porcentaje === 0,
      'el hero da 0,00 % de aire muerto — el mismo número que B1 publicó con el instrumento perdido',
      `${aireHero.porcentaje.toFixed(2)} % · banda máx ${aireHero.bandaVaciaMaxPx} px`,
    )

    let tiro = false
    try {
      await emular(p, perfilPorId('375'))
      await verificarLaPagina(p, PERFIL)
    } catch {
      tiro = true
    }
    ok(tiro, '[control positivo] emular 375 y verificar contra 1920 TIRA: el paso 4 no está desactivado')
    await emular(p, PERFIL)

    const pqd = paneles.find((s) => s.id === 'por-que-develop')
    if (pqd === undefined) throw new Error('no se encontró por-que-develop')
    await capturarRegion(p, `${TMP}\\b4-humo-pqd-bien.png`, { y: pqd.top, alto: pqd.alto, ancho: PERFIL.ancho })
    const bien = aireDe(`${TMP}\\b4-humo-pqd-bien.png`)
    await medir<number>(p, '(async () => { window.scrollTo(0, 0); await new Promise((r) => requestAnimationFrame(r)); return window.scrollY })()')
    await capturar(p, `${TMP}\\b4-humo-pqd-mal.png`, { x: 0, y: pqd.top, width: PERFIL.ancho, height: pqd.alto })
    const mal = aireDe(`${TMP}\\b4-humo-pqd-mal.png`)
    ok(
      Math.abs(bien - mal) > 50,
      '[control positivo] la MISMA región capturada lejos del scroll da otro número: la regla de `captura.ts` tiene evidencia',
      `con el scroll ahí ${bien.toFixed(2)} % · con el scroll en 0 ${mal.toFixed(2)} %`,
    )

    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => {
    console.log(`\nhumo del banco B4: ${fallas} falla(s)`)
    process.exit(fallas === 0 ? 0 : 1)
  },
  (e: unknown) => {
    console.error(`\nhumo del banco B4 — SE CORTÓ: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
