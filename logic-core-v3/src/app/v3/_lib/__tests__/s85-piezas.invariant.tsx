/**
 * INVARIANTE — [C2 · 20] LAS PIEZAS COMPARTIDAS DE LA COLA 2: `EstadoDeEnvio`, `AvisoDeScroll`, `Reluciente` y el autocompletado de /v3.
 *
 * Corre con `npm run test:s85-piezas`. Sin navegador: la parte pura del envío, el marcado de cada pieza (renderizado a HTML, con y sin
 * movimiento reducido) y las reglas de `piezas.css`. Lo que se ve en movimiento (la carga girando, el encastre, la vuelta del formulario,
 * el `:autofill` de verdad) lo miden los bancos `scripts-carga/estado-de-envio.ts` y `scripts-carga/autocompletado.ts`.
 *
 * Cada afirmación lleva su control positivo con la MISMA función contra una entrada rota a propósito. Las clases arbitrarias que se
 * buscan en el código se arman partidas (`variante`): escritas enteras acá, el escaneo de Tailwind 4 las emitiría.
 */

import { existsSync } from 'node:fs'
import path from 'node:path'

import { createElement, type ReactNode } from 'react'

import { AvisoDeScroll } from '../../_componentes/avisos/AvisoDeScroll'
import { RELUCIENTE, Reluciente } from '../../_componentes/efectos/Reluciente'
import { EstadoDeEnvio } from '../../_componentes/formularios/EstadoDeEnvio'
import { marcar } from '../../_secciones/_invariantes/render'
import { ENVIO, MENSAJES_DEL_ENVIO, esperaParaPasar, vistaDelEstado, type EstadoDelEnvio, type MensajesDelEnvio, type VistaDelEnvio } from '../formularios/estadoDeEnvio'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DE_ESTILO, RAIZ, leer as leerCrudo } from './s3-archivos'
import { declaracionesDe, reglas } from './s3-css'

const V3 = 'src/app/v3'
const leer = (relativo: string): string => leerCrudo(relativo).replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
/** Una clase arbitraria de Tailwind, armada en tiempo de ejecución (nunca escrita entera en este archivo). */
const variante = (prefijo: string, valor: string): string => prefijo + ':' + '[' + valor + ']'

const HOJA = `${V3}/_estilos/piezas.css`
const CSS = leer(HOJA)
const REGLAS = reglas(CSS)
/** Las declaraciones de la regla con ese selector exacto (o `null` si no está). */
function regla(css: string, selector: string): Map<string, string> | null {
  const r = reglas(css).find((x) => x.selector === selector)
  return r === undefined ? null : new Map(declaracionesDe(r.cuerpo).map((d) => [d.prop, d.valor]))
}
/** El cuerpo crudo de esa regla: el lector de s3 no levanta las propiedades con prefijo de motor (`-webkit-…`). */
const cuerpoDe = (css: string, selector: string): string => reglas(css).find((x) => x.selector === selector)?.cuerpo ?? ''

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EstadoDeEnvio: el estado manda y la vista lo sigue, con el mínimo de la carga')

const MAPA: Readonly<Record<EstadoDelEnvio, VistaDelEnvio>> = { reposo: 'formulario', enviando: 'carga', exito: 'exito', error: 'error' }
const mapeaBien = (f: (e: EstadoDelEnvio) => VistaDelEnvio): boolean => (Object.keys(MAPA) as EstadoDelEnvio[]).every((e) => f(e) === MAPA[e])
afirmar(mapeaBien(vistaDelEstado), 'reposo → el formulario, enviando → la carga, éxito y error → su mensaje')
controlPositivo('  el detector ve un envío que muestra el formulario mientras viaja', (e: EstadoDelEnvio) => (e === 'enviando' ? 'formulario' : vistaDelEstado(e)), mapeaBien)

type Espera = typeof esperaParaPasar
const minimoBien = (f: Espera): boolean =>
  f('carga', 'exito', 1000, 1100) === ENVIO.minimoDeLaCargaMs - 100 &&
  f('carga', 'error', 1000, 1000 + ENVIO.minimoDeLaCargaMs + 50) === 0 &&
  f('carga', 'formulario', 1000, 1200) === ENVIO.minimoDeLaCargaMs - 200 &&
  f('formulario', 'carga', 0, 5000) === 0 &&
  f('exito', 'formulario', 0, 0) === 0
afirmar(minimoBien(esperaParaPasar), `la carga se ve por lo menos ${String(ENVIO.minimoDeLaCargaMs)} ms aunque la respuesta llegue antes (y ningún otro paso espera)`)
controlPositivo('  el detector ve una carga sin mínimo (parpadea)', (() => 0) as Espera, minimoBien)
// La carga entra a la mitad del fundido del formulario y tarda un fundido: el mínimo la deja aparecer entera antes de irse.
const ENTRADA_DE_LA_CARGA_MS = Math.round(ENVIO.fundidoS * 1.5 * 1000)
const entradaDeLaCarga = (minimoMs: number): boolean => minimoMs >= ENTRADA_DE_LA_CARGA_MS && minimoMs <= 1000
afirmar(entradaDeLaCarga(ENVIO.minimoDeLaCargaMs), `el mínimo (${String(ENVIO.minimoDeLaCargaMs)} ms) cubre la entrada de la carga (${String(ENTRADA_DE_LA_CARGA_MS)} ms) y es ~600 ms`)
controlPositivo('  el detector ve un mínimo que corta la carga a medio aparecer', 300, entradaDeLaCarga)
afirmar(ENVIO.mensajeMs >= 2500 && ENVIO.mensajeMs <= 3500 && ENVIO.fundidoReducidoS < ENVIO.fundidoS, `el mensaje se queda ~3 s (${String(ENVIO.mensajeMs)} ms) y con movimiento reducido el fundido es corto (${String(ENVIO.fundidoReducidoS)} s)`)

// Los textos, tal cual `05-TEXTOS.md` («Estado de envío»).
const TEXTOS = leer('docs/cola/2026-10-23/05-TEXTOS.md')
const seccionDelEnvio = TEXTOS.slice(TEXTOS.indexOf('## Estado de envío'), TEXTOS.indexOf('##', TEXTOS.indexOf('## Estado de envío') + 3))
const textosTalCual = (m: Readonly<Record<'contacto' | 'newsletter', MensajesDelEnvio>>): boolean =>
  [m.contacto.exito, m.contacto.error, m.newsletter.exito, m.newsletter.error].every((x) => seccionDelEnvio.includes(`**«${x.titulo}»**`) && seccionDelEnvio.includes(`**«${x.linea}»**`))
afirmar(seccionDelEnvio.length > 50 && textosTalCual(MENSAJES_DEL_ENVIO), 'los textos del éxito, del error y de la newsletter son los de 05-TEXTOS.md, tal cual')
controlPositivo('  el detector ve un texto reescrito', { ...MENSAJES_DEL_ENVIO, contacto: { ...MENSAJES_DEL_ENVIO.contacto, exito: { titulo: 'Recibido.', linea: 'Te contestamos pronto.' } } }, textosTalCual)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EstadoDeEnvio: el marcado de cada estado (el formulario no se desmonta; la carga y el encastre son los del sitio)')

const FORM: ReactNode = createElement('form', { 'data-demo': 'prueba' }, createElement('input', { name: 'nombre', defaultValue: 'Ana Prueba' }))
const conEstado = (estado: EstadoDelEnvio, preferencia: 'never' | 'always' = 'never'): string =>
  marcar(
    <EstadoDeEnvio estado={estado} alVolver={() => undefined}>
      {FORM}
    </EstadoDeEnvio>,
    { anima: true, preferencia },
  )
const REPOSO = conEstado('reposo')
const ENVIANDO = conEstado('enviando')
const ENVIANDO_QUIETO = conEstado('enviando', 'always')
const EXITO = conEstado('exito')
const ERROR = conEstado('error')
/** La capa del formulario: si está inerte y si trae lo escrito. */
const capaDelFormulario = (html: string): string => html.match(/<div[^>]*data-parte="formulario"[^>]*>/)?.[0] ?? ''
const enReposo = (html: string): boolean => !/\binert=""/.test(capaDelFormulario(html)) && !html.includes('data-pieza="carga"') && !html.includes('data-envio="resultado"')
afirmar(enReposo(REPOSO), 'en reposo: el formulario a la vista (no inerte), sin carga ni mensaje')
controlPositivo('  el detector ve la carga en reposo', ENVIANDO, enReposo)
const cargando = (html: string): boolean => /\binert=""/.test(capaDelFormulario(html)) && html.includes('data-pieza="carga"') && html.includes('data-seccion-del-giro') && html.includes('Ana Prueba')
afirmar(cargando(ENVIANDO), 'enviando: el formulario inerte (sigue montado, con lo escrito) y en su lugar la carga de develOP girando (`Carga`, con las secciones del giro)')
controlPositivo('  el detector ve un envío sin carga', REPOSO, cargando)
const quieta = (html: string): boolean => html.includes('data-pieza="carga"') && !html.includes('data-seccion-del-giro')
afirmar(quieta(ENVIANDO_QUIETO), '  con movimiento reducido, la carga quieta (el logo sin girar)')
controlPositivo('  el detector ve la carga girando con movimiento reducido', ENVIANDO, quieta)
const conMensaje = (html: string, encaje: string, titulo: string, region: 'status' | 'alert'): boolean =>
  html.includes('data-envio="resultado"') && html.includes('data-tarjeta="resultado"') && html.includes(`data-encaje="${encaje}"`) && html.includes(titulo) &&
  new RegExp(`role="${region}"[^>]*>${titulo.replace(/[.*+?^${}()|[\]\\¡!]/g, '\\$&')}`).test(html) && /\binert=""/.test(capaDelFormulario(html)) && html.includes('Ana Prueba')
afirmar(conMensaje(EXITO, 'encaja', MENSAJES_DEL_ENVIO.contacto.exito.titulo, 'status'), 'éxito: el encastre que encaja, «¡Recibido!» y su anuncio (status); el formulario detrás, montado')
controlPositivo('  el detector ve un éxito con el encastre del error', ERROR.replace(/data-encaje="no-encaja"/g, 'data-encaje="encaja"').replace(/Algo falló/g, '¡Recibido!'), (h: string) => conMensaje(h, 'encaja', MENSAJES_DEL_ENVIO.contacto.exito.titulo, 'status'))
afirmar(conMensaje(ERROR, 'no-encaja', MENSAJES_DEL_ENVIO.contacto.error.titulo, 'alert'), 'error: el encastre que no entra, «Algo falló» y su anuncio (alert); el formulario detrás con lo escrito (vuelve con los datos)')
controlPositivo('  el detector ve un error sin lo escrito', ERROR.replace(/Ana Prueba/g, ''), (h: string) => conMensaje(h, 'no-encaja', MENSAJES_DEL_ENVIO.contacto.error.titulo, 'alert'))

const FUENTE_DEL_ENVIO = sinComentarios(leer(`${V3}/_componentes/formularios/EstadoDeEnvio.tsx`))
const importaLasDelSitio = (f: string): boolean =>
  /import \{ Carga \} from '\.\.\/carga\/Carga'/.test(f) && /import \{ EncajeDelLogo, PROPORCION_DEL_ENCAJE \} from '\.\/EncajeDelLogo'/.test(f) && !/rotateY|<svg/.test(f) && /<AnimatePresence mode="wait"/.test(f)
afirmar(importaLasDelSitio(FUENTE_DEL_ENVIO), 'la carga y el encastre se IMPORTAN (`Carga`, `EncajeDelLogo`): ningún giro ni dibujo propio; los pasos con AnimatePresence en modo wait')
controlPositivo('  el detector ve un giro copiado', `${FUENTE_DEL_ENVIO}\nconst giro = { rotateY: 360 }`, importaLasDelSitio)
const vuelveSolo = (f: string): boolean =>
  /window\.setTimeout\(\(\) => volver\.current\(\), ENVIO\.mensajeMs\)/.test(f) && /alTerminar=\{\(\) => setAterrizo\(true\)\}/.test(f) && /alVolver=\{\(\) => volver\.current\(resultado\)\}/.test(f)
afirmar(vuelveSolo(FUENTE_DEL_ENVIO), 'el formulario vuelve solo: la cuenta del mensaje arranca cuando el encastre aterrizó y avisa `alVolver` con cuál fue (después del éxito, quien lo monta vacía)')
controlPositivo('  el detector ve un mensaje que no vuelve', FUENTE_DEL_ENVIO.replace('() => volver.current(), ENVIO.mensajeMs', '() => undefined, ENVIO.mensajeMs'), vuelveSolo)

const PIE = sinComentarios(leer(`${V3}/_secciones/cierre/FormularioDelPie.tsx`))
const pieSinEnvio = (f: string): boolean => !f.includes('EstadoDeEnvio')
afirmar(pieSinEnvio(PIE), 'el formulario del pie NO usa EstadoDeEnvio (queda como está)')
controlPositivo('  el detector ve el pie con EstadoDeEnvio', `${PIE}\nimport { EstadoDeEnvio } from '../../_componentes/formularios/EstadoDeEnvio'`, pieSinEnvio)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El encastre toma las tintas de la sección (papel e invertida)')

const tintasDelContexto = (css: string): boolean => {
  const r = regla(css, "[data-v3] [data-envio='resultado']")
  return r !== null && r.get('--resultado-oscuro-invertido') === 'var(--color-fondo)' && r.get('--resultado-claro-invertido') === 'var(--color-tinta)'
}
afirmar(tintasDelContexto(CSS), 'lo oscuro del encastre es el fondo de la sección y lo claro su tinta: sobre el papel cae una pieza de tinta (visible), en la invertida una clara')
controlPositivo('  el detector ve las tintas de la tarjeta (la pieza del color del papel, invisible sobre el papel)', CSS.replace("--resultado-oscuro-invertido: var(--color-fondo);\n  --resultado-claro-invertido: var(--color-tinta);", '--resultado-oscuro-invertido: var(--color-tinta);\n  --resultado-claro-invertido: var(--color-fondo);'), tintasDelContexto)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El autocompletado: el arreglo del pie, global para los campos de /v3 (el pie, intacto)')

const SELECTOR_DEL_AUTOCOMPLETADO = "[data-v3] :is(input, textarea, select):not([data-foco='campo']):autofill"
const autocompletadoGlobal = (css: string): boolean => {
  const r = regla(css, SELECTOR_DEL_AUTOCOMPLETADO)
  return (
    r !== null &&
    r.get('--demora-del-autocompletado') === '100000s' &&
    r.get('transition-property') === 'background-color, color' &&
    r.get('transition-duration') === 'var(--demora-del-autocompletado)' &&
    /(^|;)\s*-webkit-text-fill-color: currentColor;/.test(cuerpoDe(css, SELECTOR_DEL_AUTOCOMPLETADO)) &&
    r.get('caret-color') === 'currentColor'
  )
}
afirmar(autocompletadoGlobal(CSS), 'todo input, textarea y select de /v3 autocompletado conserva su fondo y su tinta: el fondo celeste y el color del navegador se demoran para siempre, el texto y el cursor en la tinta del formulario')
controlPositivo('  el detector ve la hoja sin la regla', CSS.replace(SELECTOR_DEL_AUTOCOMPLETADO, "[data-v3] :is(input, textarea, select):not([data-foco='campo']):hover"), autocompletadoGlobal)
controlPositivo('  y una regla que sólo demora el fondo (el texto queda negro del navegador)', CSS.replace('  -webkit-text-fill-color: currentColor;\n', ''), autocompletadoGlobal)
const pieIntacto = (pie: string, foco: string, css: string): boolean =>
  pie.includes(` ${variante('autofill', 'transition:background-color_100000s_0s,color_100000s_0s')} ${variante('autofill', '-webkit-text-fill-color:currentColor')} ${variante('autofill', 'caret-color:currentColor')}'`) &&
  foco.includes('[data-v3] [data-foco="campo"]:autofill {') &&
  css.includes(":not([data-foco='campo'])")
afirmar(pieIntacto(leer(`${V3}/_secciones/cierre/FormularioDelPie.tsx`), leer(`${V3}/_estilos/foco.css`), CSS), 'el pie sigue con su arreglo (la utilidad del campo y la demora de foco.css) y la regla global lo excluye: no lo pisa')
controlPositivo('  el detector ve una regla global que también toma los campos del pie', CSS.replace(":not([data-foco='campo'])", ''), (c: string) => pieIntacto(leer(`${V3}/_secciones/cierre/FormularioDelPie.tsx`), leer(`${V3}/_estilos/foco.css`), c))

const LAYOUT = leer(`${V3}/layout.tsx`)
const entraPorElLayout = (layout: string, padron: readonly string[]): boolean => layout.includes("import './_estilos/piezas.css'") && padron.includes(HOJA)
afirmar(entraPorElLayout(LAYOUT, ARCHIVOS_DE_ESTILO), 'la hoja entra por el layout (como todas: un componente que importa CSS rompe los invariantes en Node) y está en el padrón de s3-tokens')
controlPositivo('  el detector ve la hoja fuera del layout', LAYOUT.replace("import './_estilos/piezas.css'", ''), (l: string) => entraPorElLayout(l, ARCHIVOS_DE_ESTILO))
const PIEZAS_TSX = ['_componentes/formularios/EstadoDeEnvio.tsx', '_componentes/avisos/AvisoDeScroll.tsx', '_componentes/efectos/Reluciente.tsx'].map((a) => leer(`${V3}/${a}`))
const sinCss = (fuentes: readonly string[]): boolean => fuentes.every((f) => !/^import ['"][^'"]+\.css['"]/m.test(f))
afirmar(sinCss(PIEZAS_TSX), 'ninguna pieza importa su hoja')
controlPositivo('  el detector ve una pieza que importa su hoja', [...PIEZAS_TSX, "import '../../_estilos/piezas.css'"], sinCss)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · AvisoDeScroll: dos chevrones sin mango, texto gris, titila; botón sólo si es clickeable')

const AVISO = marcar(createElement(AvisoDeScroll, { texto: 'Scrolleá para explorarlo' }), { anima: true })
const AVISO_BOTON = marcar(createElement(AvisoDeScroll, { texto: 'Scrolleá una vez más para ver las preguntas frecuentes', tono: 'escena', alTocar: () => undefined }), { anima: true })
const decorativo = (html: string): boolean => /<div[^>]*aria-hidden="true"[^>]*data-pieza="aviso-de-scroll"/.test(html) && !html.includes('<button') && (html.match(/<path d="M3 2 L12 10 L21 2"/g) ?? []).length === 2 && html.includes('text-tinta-tenue') && html.includes('Scrolleá para explorarlo')
afirmar(decorativo(AVISO), 'sin acción: decorativo (`aria-hidden`), el texto en la tinta tenue (gris, AA) y dos chevrones abiertos (sin mango)')
controlPositivo('  el detector ve el aviso clickeable como decorativo', AVISO_BOTON, decorativo)
const clickeable = (html: string): boolean => /<button type="button"[^>]*data-pieza="aviso-de-scroll"[^>]*data-tono="escena"/.test(html) && !/<button[^>]*aria-hidden/.test(html)
afirmar(clickeable(AVISO_BOTON), 'con acción: un `<button>` (el foco visible es el del sitio), que el lector lee, con el tono de la escena')
controlPositivo('  el detector ve un aviso clickeable escondido al lector', AVISO_BOTON.replace('<button type="button"', '<button type="button" aria-hidden="true"'), clickeable)
const titila = (css: string): boolean => {
  const base = regla(css, "[data-v3] [data-pieza='aviso-de-scroll']")
  const quieto = regla(css, "[data-v3] [data-pieza='aviso-de-scroll'][data-quieto]")
  const pasos = REGLAS.filter((r) => r.contexto === '@keyframes aviso-de-scroll-titila').flatMap((r) => declaracionesDe(r.cuerpo).map((d) => d.prop))
  return base !== null && base.get('--aviso-ciclo') === '1600ms' && (base.get('animation') ?? '').startsWith('aviso-de-scroll-titila var(--aviso-ciclo)') && quieto?.get('animation') === 'none' && pasos.length > 0 && pasos.every((p) => p === 'opacity') && css.includes('@keyframes aviso-de-scroll-titila')
}
afirmar(titila(CSS), 'titila con la opacidad sola (un ciclo de 1,6 s) y se queda quieto con `data-quieto` (movimiento reducido o fuera de la pantalla)')
controlPositivo('  el detector ve un aviso que no se aquieta', CSS.replace("[data-v3] [data-pieza='aviso-de-scroll'][data-quieto] {\n  animation: none;", "[data-v3] [data-pieza='aviso-de-scroll'][data-quieto] {\n  animation-delay: 0s;"), titila)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Reluciente: un barrido sin layout, más vivo con el mouse, quieto con movimiento reducido')

const CAJA = marcar(createElement(Reluciente), { anima: true })
const TEXTO = marcar(<Reluciente como="texto">HABLANOS</Reluciente>, { anima: true })
const formas = (caja: string, texto: string): boolean => /<span aria-hidden="true" data-reluciente="caja"/.test(caja) && /<span data-reluciente="texto"[^>]*>HABLANOS<\/span>/.test(texto)
afirmar(formas(CAJA, TEXTO), 'en una caja: una capa decorativa (`aria-hidden`); en un texto: el mismo texto, legible por el lector')
controlPositivo('  el detector ve un texto escondido al lector', CAJA, (c: string) => formas(CAJA, c))
const PROPIEDADES_DE_LAYOUT = /^(left|right|top|bottom|width|height|margin|padding|inset)/
const pasosDe = (css: string, nombre: string): { readonly pasos: string[]; readonly props: string[] } => {
  const rs = reglas(css).filter((r) => r.contexto === `@keyframes ${nombre}`)
  return { pasos: rs.map((r) => r.selector), props: rs.flatMap((r) => declaracionesDe(r.cuerpo).map((d) => d.prop)) }
}
const sinLayout = (css: string): boolean => {
  const caja = [pasosDe(css, 'reluciente-caja'), pasosDe(css, 'reluciente-caja-viva')]
  const texto = [pasosDe(css, 'reluciente-texto'), pasosDe(css, 'reluciente-texto-vivo')]
  return caja.every((k) => k.props.length > 0 && k.props.every((p) => p === 'transform')) && texto.every((k) => k.props.length > 0 && k.props.every((p) => p === 'background-position')) && ![...caja, ...texto].some((k) => k.props.some((p) => PROPIEDADES_DE_LAYOUT.test(p)))
}
afirmar(sinLayout(CSS), 'la caja barre con `transform` y el texto con `background-position`: nada que fuerce el layout')
controlPositivo('  el detector ve un barrido con `left`', CSS.replace('transform: translateX(var(--reluciente-hasta));', 'left: var(--reluciente-hasta);'), sinLayout)
interface RitmoDelReluciente {
  readonly cicloMs: number
  readonly cicloVivoMs: number
  readonly pasada: number
  readonly pasadaViva: number
}
const ritmo = (css: string, r: RitmoDelReluciente): boolean => {
  const base = regla(css, '[data-v3] [data-reluciente]')
  const pct = (x: number): string => `${String(Math.round(x * 100))}%`
  return (
    base?.get('--reluciente-ciclo') === `${String(r.cicloMs)}ms` &&
    base.get('--reluciente-ciclo-vivo') === `${String(r.cicloVivoMs)}ms` &&
    r.cicloMs >= 3000 && r.cicloMs <= 4000 && r.cicloVivoMs < r.cicloMs &&
    pasosDe(css, 'reluciente-caja').pasos.includes(`${pct(r.pasada)}, 100%`) && pasosDe(css, 'reluciente-texto').pasos.includes(`${pct(r.pasada)}, 100%`) &&
    pasosDe(css, 'reluciente-caja-viva').pasos.includes(`${pct(r.pasadaViva)}, 100%`) && pasosDe(css, 'reluciente-texto-vivo').pasos.includes(`${pct(r.pasadaViva)}, 100%`)
  )
}
afirmar(ritmo(CSS, RELUCIENTE), `una pasada cada ${String(RELUCIENTE.cicloMs)} ms (pedido: cada 3–4 s), cada ${String(RELUCIENTE.cicloVivoMs)} ms con el mouse encima; la hoja y RELUCIENTE (para la escena) dicen lo mismo`)
controlPositivo('  el detector ve la hoja y la constante desatadas', { ...RELUCIENTE, cicloMs: 3000 }, (r: RitmoDelReluciente) => ritmo(CSS, r))
const hoverYQuieto = (css: string): boolean => {
  const i = (s: string): number => css.indexOf(s)
  const hoverCaja = regla(css, "[data-v3] :is(:hover, :focus-visible) > [data-reluciente='caja']::before")
  return hoverCaja?.get('animation-name') === 'reluciente-caja-viva' && i('[data-v3] [data-reluciente][data-quieto],') > i("[data-v3] [data-reluciente='texto']:hover,") && i('[data-v3] [data-reluciente][data-quieto],') > i("[data-v3] :is(:hover, :focus-visible) > [data-reluciente='caja']::before")
}
afirmar(hoverYQuieto(CSS), 'con el mouse o el foco, una pasada en el acto y más seguido; quieto (después del hover: le gana) con `data-quieto`')
controlPositivo('  el detector ve el quieto antes del hover (el hover lo pisaría)', CSS.replace('[data-v3] [data-reluciente][data-quieto],', '[data-v3] [data-reluciente][data-otro],'), hoverYQuieto)
const QUIETA = marcar(createElement(Reluciente), { anima: true, preferencia: 'always' })
const conQuieto = (html: string): boolean => /data-quieto=""/.test(html)
afirmar(conQuieto(QUIETA), '  con movimiento reducido la capa lleva `data-quieto` (sin barrido)')
controlPositivo('  el detector ve una capa sin la marca', QUIETA.replace('data-quieto=""', ''), conQuieto)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La página de prueba: interna, sin red real')

const PAGINA = leer(`${V3}/piezas/page.tsx`)
const DEMO = sinComentarios(leer(`${V3}/piezas/_bloques/PiezasDePrueba.tsx`))
const interna = (pagina: string, demo: string): boolean =>
  /robots: \{ index: false, follow: false, nocache: true \}/.test(pagina) &&
  demo.includes("export const ENVIO_DE_PRUEBA = '/api/piezas-de-prueba'") &&
  !existsSync(path.join(RAIZ, 'src/app/api/piezas-de-prueba')) &&
  !/\/api\/(contacto|newsletter)/.test(demo)
afirmar(interna(PAGINA, DEMO), '`/v3/piezas` es `noindex` y su envío va a una ruta que no existe (sin banco, el error; nunca la base): ni /api/contacto ni /api/newsletter')
controlPositivo('  el detector ve la demo enviando al contacto de verdad', PAGINA, (p: string) => interna(p, `${DEMO}\nfetch('/api/contacto')`))

cerrar('s85-piezas')
