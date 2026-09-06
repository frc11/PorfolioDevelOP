/**
 * FRENTE A · POR QUÉ «PRIMERA VISITA» Y «VISITA REPETIDA» DAN LO MISMO.
 *
 * ── El hecho que obliga a este script ────────────────────────────────────
 *
 * `a-vitales.ts` midió las dos cargas de `/v3` en tres perfiles y las seis filas
 * dieron **un solo candidato de LCP** y el mismo elemento (`#titular-hero`), con
 * y sin la marca de intro. Si el preloader de 4,275 s corriera en la carga sin
 * marca, la primera visita tendría que haber tenido AL MENOS un candidato más y
 * un LCP posterior a esos 4,275 s. No los tuvo.
 *
 * Antes de escribir «el preloader no cuesta nada» —que sería una conclusión
 * sacada de un instrumento sin comprobar— hay que ir a ver si el intro
 * **siquiera armó**. Este script mide eso y nada más.
 *
 * ── Lo que se lee, y por qué esos cinco campos ───────────────────────────
 *
 * El gate pre-paint (`introBoot.tsx`, `HOME_INTRO_BOOT_JS`) tiene CUATRO
 * condiciones, y el script lee las cuatro más su resultado:
 *
 *   1. `location.pathname` ∈ `RUTAS_DEL_INTRO` (`['/', '/v3']`)
 *   2. `navigator.webdriver !== true`
 *   3. `!matchMedia('(prefers-reduced-motion: reduce)').matches`
 *   4. `sessionStorage['home:intro'] !== '1'`
 *   →  si las cuatro dan, marca `data-home-intro` en el `<html>`.
 *
 * ⚠️ **La condición 2 está documentada en el propio fuente como un límite del
 * método**: *«el intro no corre bajo automatización … Corolario: este componente
 * NO se puede verificar por automatización. Solo a ojo, en un navegador real»*
 * (`introBoot.tsx`). Este script no la esquiva: la MIDE, para que la cifra de
 * `a-vitales.ts` se pueda leer sabiendo qué incluye y qué no.
 *
 * ── El control positivo ─────────────────────────────────────────────────
 *
 * El lector de atributos se corre contra uno que TIENE que estar (`lang` en el
 * `<html>`) y contra uno inventado. Si el primero diera `false`, el `false` de
 * `data-home-intro` no probaría nada.
 *
 * ── ⚠️ LA TERCERA FILA: EL GATE RESTITUIDO, Y POR QUÉ NO ES HACER TRAMPA ─
 *
 * La tercera corrida inyecta, ANTES de cualquier script del documento,
 *
 *     Object.defineProperty(navigator, 'webdriver', { get: () => false })
 *
 * Eso **no desactiva una protección del sitio**: `navigator.webdriver` es una
 * bandera que el navegador enciende porque hay un cliente de CDP conectado, y
 * el gate la usa para no dejar colgada a una corrida headless. Ponerla en
 * `false` **restituye exactamente la condición del visitante real** —las otras
 * tres condiciones del gate se cumplen solas— y es la única forma de medir el
 * costo del preloader, que es lo que la instrucción pide.
 *
 * Y trae su propio control: **con el override, `data-home-intro` TIENE que
 * aparecer.** Si apareciera igual sin él, el override no probaría nada; si no
 * apareciera con él, la causa sería otra y habría que ir a buscarla.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { RESTITUIR_EL_GATE } from './a-observador'

const URL_MEDIDA = 'http://localhost:3005/v3'
const SALIDA = 'docs/rediseno/outputs/b4/a-gate-del-intro.json'

interface Lectura {
  readonly pathname: string
  readonly enLaListaDeRutas: boolean
  readonly webdriver: boolean
  readonly movimientoReducido: boolean
  readonly marcaDeSesion: string | null
  readonly intoArmo: boolean
  readonly controlAtributoQueExiste: boolean
  readonly controlAtributoInventado: boolean
  readonly overlayEnElDom: boolean
  readonly overlayVisible: boolean
}

const LECTURA = `(() => {
  const html = document.documentElement
  const overlay = document.querySelector('[data-home-intro-overlay], #home-intro, [class*="home-intro"]')
  let visible = false
  if (overlay) {
    const cs = getComputedStyle(overlay)
    visible = cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0
  }
  return {
    pathname: location.pathname,
    enLaListaDeRutas: ['/', '/v3'].indexOf(location.pathname) >= 0,
    webdriver: navigator.webdriver === true,
    movimientoReducido: matchMedia('(prefers-reduced-motion: reduce)').matches,
    marcaDeSesion: sessionStorage.getItem('home:intro'),
    intoArmo: html.hasAttribute('data-home-intro'),
    controlAtributoQueExiste: html.hasAttribute('lang'),
    controlAtributoInventado: html.hasAttribute('data-atributo-que-no-existe-jamas'),
    overlayEnElDom: overlay !== null,
    overlayVisible: visible,
  }
})()`

const CASOS: readonly { readonly id: string; readonly marca: boolean; readonly restituir: boolean }[] = [
  { id: 'primera-visita', marca: false, restituir: false },
  { id: 'visita-repetida', marca: true, restituir: false },
  { id: 'primera-visita-con-el-gate-restituido', marca: false, restituir: true },
]

async function principal(): Promise<void> {
  const perfil = perfilPorId('1920')
  const chrome = await lanzarChrome({ perfil: perfilDeChrome('a'), ancho: 1280, alto: 900 })
  const filas: { readonly carga: string; readonly lectura: Lectura }[] = []
  try {
    for (const caso of CASOS) {
      const p = await abrirPagina(chrome)
      await emular(p, perfil)
      await p.conexion.enviar('Network.setCacheDisabled', { cacheDisabled: true }, p.sessionId)
      if (caso.restituir) {
        await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: RESTITUIR_EL_GATE }, p.sessionId)
      }
      await irA(p, URL_MEDIDA, { marcaDeIntro: caso.marca })
      await verificarLaPagina(p, perfil)
      const lectura = await medir<Lectura>(p, LECTURA)
      filas.push({ carga: caso.id, lectura })
      await cerrarPagina(p)
    }
  } finally {
    await cerrarChrome(chrome)
  }

  const primera = filas[0].lectura
  const restituida = filas[2].lectura
  const control = primera.controlAtributoQueExiste && !primera.controlAtributoInventado

  const salida = {
    frente: 'a',
    asunto: 'el gate pre-paint del preloader bajo el Chrome del banco',
    instrumento: 'scripts-b4/a-gate-del-intro.ts — lectura de las cuatro condiciones de HOME_INTRO_BOOT_JS',
    build: { cual: 'prod (.next-probe, 3005)', url: URL_MEDIDA },
    emulado: true,
    controlesPositivos: [
      {
        nombre: 'el lector de atributos ve uno que existe (`lang`) y no ve uno inventado',
        pasa: control,
        detalle: `lang=${primera.controlAtributoQueExiste} · inventado=${primera.controlAtributoInventado}`,
      },
      {
        nombre: 'con el gate restituido el intro SÍ arma — el override hace lo que dice',
        pasa: restituida.intoArmo && !primera.intoArmo,
        detalle: `restituido.intoArmo=${restituida.intoArmo} · sin restituir=${primera.intoArmo} · webdriver restituido=${restituida.webdriver}`,
      },
    ],
    filas,
    consecuencia:
      primera.intoArmo === false && primera.webdriver
        ? 'el intro NO armó porque `navigator.webdriver === true`: el gate lo apaga bajo automatización por diseño (introBoot.tsx). Toda cifra de carga de este frente EXCLUYE el preloader — es la carga que ve un visitante repetido, no la primera visita real.'
        : primera.intoArmo === false
          ? 'el intro NO armó y NO fue por webdriver: hay que mirar cuál de las otras tres condiciones falló.'
          : 'el intro SÍ armó en la carga sin marca: las cifras de «primera visita» incluyen el preloader.',
  }
  mkdirSync(path.dirname(SALIDA), { recursive: true })
  writeFileSync(SALIDA, `${JSON.stringify(salida, null, 2)}\n`)
  for (const f of filas) console.log(f.carga, JSON.stringify(f.lectura))
  console.log(`control positivo: ${control ? 'OK' : 'FALLA'}`)
  console.log(salida.consecuencia)
  console.log(`escrito: ${SALIDA}`)
  if (!control) throw new Error('el control positivo falló: el lector de atributos no sirve')
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
