/**
 * s78 · B12c (2026-10-22) · EL PRELOADER DEL SITIO, la segunda mitad (la primera, la decisión, la línea y la flecha, en
 * `s78-preloader.invariant.tsx`). Cada afirmación con su control positivo.
 *
 *   4 · la entrada: con el preloader la carga del home no se abre (el titular y el logo que cae esperan) y las retenciones del scroll;
 *   5 · el cableado en las fuentes (el layout, la hoja, la escena preparada, el logo y el título que retienen el scroll) y el arnés de los
 *       bancos (todos salen sin el preloader sin tocarlos).
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { ARCHIVOS_DE_ESTILO, RAIZ } from '../../_lib/__tests__/s3-archivos'
import { REGISTRO_POR_NOMBRE } from '../../_lib/__tests__/s3-registro-de-tokens'
import { abrirLaCarga, cargaLista, suscribirALaCarga } from '../../_lib/carga'
import { abrirLaEntrada, entradaAbierta, retenerElScroll, scrollRetenido } from '../../_lib/entrada'
import { PROPIEDAD_DE_LA_CUBIERTA, TOPE_MS } from './decision'
import { PreloaderDelSitio } from './PreloaderDelSitio'

const V3 = 'src/app/v3'
const leer = (r: string): string => readFileSync(path.join(RAIZ, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La entrada: con el preloader, la carga del home espera (el titular y el logo), y las retenciones del scroll')

// La ventana con la decisión del script, ANTES de la primera pregunta (como al hidratar).
;(globalThis as unknown as { window: unknown }).window = { __preloaderDelSitio: { activo: true }, location: { search: '' } }
let avisos = 0
const soltarAviso = suscribirALaCarga(() => {
  avisos += 1
})
const cerradaAlPrincipio = !entradaAbierta()
abrirLaCarga()
const conElVeloListo = cargaLista()
const r1 = retenerElScroll()
const r2 = retenerElScroll()
const retenido = scrollRetenido()
abrirLaEntrada()
const abierta = { entrada: entradaAbierta(), carga: cargaLista(), avisos }
r1()
r1()
const conUna = scrollRetenido()
r2()
soltarAviso()
afirmar(cerradaAlPrincipio && !conElVeloListo && abierta.entrada && abierta.carga && abierta.avisos === 1 && retenido && conUna && !scrollRetenido(), 'con el preloader la entrada arranca cerrada: el velo de carga terminado NO abre la carga (el titular del hero y el logo esperan); se abre con la entrada, una vez. Las retenciones del scroll se cuentan, y soltar dos veces la misma no suelta otra')
const cargaFuente = sinComentarios(leer(`${V3}/_lib/carga.ts`))
const cargaEspera = (c: string): boolean => /if \(lista \|\| !pedida \|\| !entradaAbierta\(\)\) return/.test(c) && /suscribirALaEntrada\(abrirSiSePuede\)/.test(c)
afirmar(cargaEspera(cargaFuente), '  (en la fuente: la carga se abre sólo pedida y con la entrada abierta, y se entera cuando la entrada se abre)')
controlPositivo('  el detector ve la carga que no espera a la entrada', cargaFuente.replace(' || !entradaAbierta()', ''), cargaEspera)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El cableado: el layout, la hoja, la escena preparada, lo que retiene el scroll, y el arnés de los bancos')

const layout = leer(`${V3}/layout.tsx`)
const hoja = leer(`${V3}/_estilos/preloader.css`)
const montado = (l: string): boolean => /import '\.\/_estilos\/preloader\.css'/.test(l) && /<MarcaDeLaLlave \/>\s*\{\/\*[^]*?\*\/\}\s*<PreloaderDelSitio \/>/.test(l)
afirmar(montado(layout) && ARCHIVOS_DE_ESTILO.includes(`${V3}/_estilos/preloader.css`), 'el layout monta el preloader (encima de todo, después de la marca de la llave) y su hoja entra por el layout, en el padrón de s3')
controlPositivo('  el detector ve la hoja importada desde el componente', layout.replace("import './_estilos/preloader.css'", ''), montado)
const hojaBien = (h: string): boolean =>
  h.includes(`display: var(${PROPIEDAD_DE_LA_CUBIERTA}, none);`) && /\[data-v3\] \[data-pieza='preloader'\]\[data-estado\] \{\s*animation: none;/.test(h) && /@media \(prefers-reduced-motion: reduce\) \{\s*\[data-v3\] \[data-pieza='preloader'\] \{\s*animation-delay: var\(--preloader-seguro\) !important;/.test(h) && /@keyframes preloader-seguro \{\s*to \{\s*visibility: hidden;/.test(h)
afirmar(hojaBien(hoja) && REGISTRO_POR_NOMBRE.get('--preloader-seguro')?.valor === `${String(TOPE_MS)}ms` && hoja.includes(`--preloader-seguro: ${String(TOPE_MS)}ms;`), `la cubierta: escondida salvo con la decisión del <head>; su seguro sin hidratar la esconde a los ${String(TOPE_MS / 1000)} s (el mismo tope del bloqueo, registrado), también con movimiento reducido; con JavaScript, el componente la maneja`)
controlPositivo('  el detector ve el seguro sin el `!important` (la política le saca la espera: se iría en el acto)', hoja.replace('animation-delay: var(--preloader-seguro) !important;', 'animation-delay: var(--preloader-seguro);'), hojaBien)

const marcado = renderToStaticMarkup(createElement(PreloaderDelSitio))
const servidorBien = (m: string): boolean => /^<div data-pieza="preloader" aria-hidden="true" class="[^"]*fixed inset-0[^"]*"><\/div>$/.test(m)
afirmar(servidorBien(marcado), 'en el servidor, la cubierta es un `div` vacío y escondido para los lectores (sin texto, sin botón, sin diálogo): lo que se ve lo monta el cliente con la decisión', marcado)
controlPositivo('  el detector ve una cubierta que el servidor manda como diálogo', marcado.replace('aria-hidden="true"', 'role="dialog"'), servidorBien)

const caidaFuente = sinComentarios(leer(`${V3}/_lib/escena/intro/CaidaDelLogo.tsx`))
const precompilarFuente = sinComentarios(leer(`${V3}/_lib/escena/gpu/Precompilar.tsx`))
const tituloFuente = sinComentarios(leer(`${V3}/_componentes/titulos3d/TituloDePagina.tsx`))
const retienen = (c: string, p: string, t: string): boolean =>
  /logo\.position\.y = CAIDA_DEL_LOGO\.alto\s*estado\.soltar = retenerElScroll\(\)/.test(c) && /s\.u = -1\s*s\.soltar\?\.\(\)/.test(c) && /return \(\) => \{\s*estado\.soltar\?\.\(\)/.test(c) &&
  /calentar\(gl, a\.escena, camara\)[\s\S]*?marcarLaEscenaPreparada\(\)/.test(p) &&
  /const presencia = useMotionValue\(entradaAbierta\(\) \? 1 : 0\)/.test(t) && /const leer = \(\): void => \{\s*if \(!entradaAbierta\(\)\) return/.test(t) && /retencion\.current \?\?= retenerElScroll\(\)/.test(t) && /\}, LLEGADA_DEL_TITULAR_S \* 1000\)/.test(t)
afirmar(retienen(caidaFuente, precompilarFuente, tituloFuente), 'el logo del hero retiene el scroll mientras cae (y lo suelta al llegar o al desmontarse); la escena avisa cuando quedó preparada; el título de una página espera la entrada y retiene el scroll hasta llegar')
controlPositivo('  el detector ve el logo que no suelta al llegar', [caidaFuente.replace(/s\.u = -1\s*s\.soltar\?\.\(\)/, 's.u = -1'), precompilarFuente, tituloFuente] as const, ([c, p, t]) => retienen(c, p, t))
controlPositivo('  y el título que llega con la entrada cerrada', [caidaFuente, precompilarFuente, tituloFuente.replace('useMotionValue(entradaAbierta() ? 1 : 0)', 'useMotionValue(1)')] as const, ([c, p, t]) => retienen(c, p, t))

// Frozen y navegación: el preloader no usa ni el contexto viejo ni `router.push`; sin subrayado en la frase.
const CARPETA = `${V3}/_chrome/preloader`
const deLaCarpeta = readdirSync(path.join(RAIZ, CARPETA)).filter((a) => /\.tsx?$/.test(a) && !a.includes('.invariant.')).map((a) => sinComentarios(leer(`${CARPETA}/${a}`)))
const limpio = (fuentes: readonly string[]): boolean => fuentes.every((c) => !c.includes('PreloaderContext') && !c.includes('TransitionContext') && !c.includes('router.push') && !/\bunderline\b/.test(c))
afirmar(limpio(deLaCarpeta), `los ${String(deLaCarpeta.length)} archivos del preloader no tocan \`PreloaderContext\` (frozen) ni \`TransitionContext\`, no navegan con \`router.push\` y la frase va sin subrayado`)
controlPositivo('  el detector ve un import del contexto viejo', [...deLaCarpeta, "import { usePreloader } from '@/context/PreloaderContext'"], limpio)

// El arnés: ningún banco de `scripts-carga/` ve el preloader sin pedirlo. Playwright marca la automatización (`--enable-automation`, que
// pone `navigator.webdriver`) salvo que se la saquen; y los que manejan su Chrome sin marca siembran `home:intro`.
const BANCOS = 'scripts-carga'
const bancos = readdirSync(path.join(RAIZ, BANCOS)).filter((a) => a.endsWith('.ts')).map((a) => ({ a, c: leer(`${BANCOS}/${a}`) })).filter((b) => b.c.includes('/v3') && /chromium[.]|connectOverCDP|puppeteer/.test(b.c)) // los que abren un navegador (los ayudantes puros, como a8.ts, no)
const saleSinElPreloader = (b: { readonly a: string; readonly c: string }): boolean => {
  if (b.c.includes('__preloaderDelBanco')) return true // el banco del preloader: lo pide a propósito
  const automatizado = /chromium\.launch(PersistentContext)?\(/.test(b.c) && !/ignoreDefaultArgs:\s*(true|\[[^\]]*enable-automation)/.test(b.c)
  return automatizado || b.c.includes("sessionStorage.setItem('home:intro', '1')")
}
const sinSalida = bancos.filter((b) => !saleSinElPreloader(b)).map((b) => b.a)
afirmar(sinSalida.length === 0, `los ${String(bancos.length)} bancos de \`${BANCOS}/\` que abren /v3 salen sin el preloader sin tocarlos (automatizados por Playwright o con la siembra de siempre)`, sinSalida.join(', '))
controlPositivo('  el detector ve un banco que le saca la marca de automatización y no siembra', [{ a: 'x.ts', c: "chromium.launchPersistentContext(p, { ignoreDefaultArgs: ['--enable-automation'] }) /v3" }], (bs) => bs.every(saleSinElPreloader))
const comunes = ['scripts-b4/navegador.ts', 'scripts-b5/b5-comun.ts'].map((r) => leer(r))
afirmar(comunes.every((c) => c.includes("sessionStorage.setItem('home:intro','1')")), '  y los dos arneses comunes de los bancos con Chrome por CDP (B4, B5) siembran `home:intro` en cada carga')

cerrar('s78-preloader-entrada')
