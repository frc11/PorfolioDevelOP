/**
 * s25 · EL CONTACTO — el formulario, su apertura y su envío. **[CONTACTO]**
 *
 * Se afirma sobre el marcado real de la hoja (render de servidor), sobre las funciones puras
 * del envío y de la precarga, y sobre el fuente donde la propiedad vive en un efecto. Cada
 * afirmación lleva su control positivo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { RAIZ } from '../../_lib/__tests__/s3-archivos'
import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { siguienteFoco } from '../../_secciones/trabajos/demos/dialogo'
import { abrirContacto, cerrarContacto, devolverElFoco, precargaDe, SELECTOR_DE_APERTURA } from './apertura'
import { DESPUES_DEL_ENVIO, INTERESES, PRECARGA_POR_SERVICIO, ROTULO_DEL_ENVIO, TITULO } from './contenido'
import { enviarContacto, mensajeDeContacto, validarContacto, type DatosDeContacto } from './enviarContacto'
import { HojaParaElInvariante } from './FormularioDeContacto'

const leer = (r: string): string => readFileSync(path.join(RAIZ, r), 'utf8')
const HOJA = renderToStaticMarkup(<HojaParaElInvariante />)
const FUENTE = leer('src/app/v3/_chrome/contacto/FormularioDeContacto.tsx')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El diálogo accesible: rol, nombre, cruz, foco atrapado y devuelto, Esc')

const esDialogo = (html: string): boolean => /role="dialog"/.test(html) && /aria-modal="true"/.test(html) && /aria-labelledby="contacto-titulo"/.test(html) && /id="contacto-titulo"/.test(html)
afirmar(esDialogo(HOJA), 'la hoja es un diálogo modal con nombre: `role="dialog"`, `aria-modal` y su título por `aria-labelledby`', TITULO)
controlPositivo('  el chequeo vería una hoja sin rol de diálogo', '<div aria-labelledby="contacto-titulo"><h2 id="contacto-titulo"></h2></div>', esDialogo)
afirmar(/<button[^>]*aria-label="Cerrar el formulario de contacto"/.test(HOJA), '  la cruz es un botón con nombre')
// La trampa: Tab al final vuelve al principio y Shift+Tab al principio va al final.
const [a, b, c] = ['a', 'b', 'c'].map((id) => ({ id }) as unknown as HTMLElement)
type Trampa = typeof siguienteFoco
const atrapa = (f: Trampa): boolean => f([a, b, c], c, false) === a && f([a, b, c], a, true) === c
afirmar(atrapa(siguienteFoco), '  el foco queda atrapado: da la vuelta en los dos sentidos')
controlPositivo('  el chequeo vería una trampa que deja salir el foco', (() => null) as Trampa, atrapa)
afirmar(/useDialogo\(caja, cerrarContacto\)/.test(FUENTE), '  Esc cierra: la hoja usa el mismo `useDialogo` de las demos (Escape → cerrar, Tab atrapado)')
afirmar(/onClick=\{cerrarContacto\}/.test(FUENTE) && /data-parte="velo"/.test(HOJA), '  y un click en el velo también cierra')
// El foco vuelve al disparador, un cuadro después de la salida.
let enfocado = false
const disparador = { focus: () => { enfocado = true } } as unknown as HTMLElement
const rafAntes = globalThis.requestAnimationFrame
globalThis.requestAnimationFrame = ((f: FrameRequestCallback) => { f(0); return 0 }) as typeof requestAnimationFrame
abrirContacto([], disparador)
cerrarContacto()
afirmar(!enfocado, '  cerrar no mueve el foco mientras la hoja sale (su trampa lo retendría)')
devolverElFoco()
afirmar(enfocado, '  y al terminar la salida el foco vuelve al botón que lo abrió')
globalThis.requestAnimationFrame = rafAntes
afirmar(/onExitComplete=\{devolverElFoco\}/.test(FUENTE), '  la devolución cuelga de la salida del diálogo')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El scroll bloqueado con el formulario abierto')

const DIALOGO = quitarComentarios(leer('src/app/v3/_secciones/trabajos/demos/dialogo.ts'))
const bloquea = (hoja: string, dialogo: string): boolean => dialogo.includes("html.style.overflow = 'hidden'") && /data-lenis-prevent=""/.test(hoja) && !/lenis\.stop/.test(dialogo + quitarComentarios(FUENTE))
afirmar(bloquea(HOJA, DIALOGO), 'overflow en `<html>` (el `useDialogo` de las demos) y `data-lenis-prevent` en la hoja, sin `lenis.stop()`')
controlPositivo('  el chequeo vería una hoja sin `data-lenis-prevent`', HOJA.replace('data-lenis-prevent=""', ''), (h: string) => bloquea(h, DIALOGO))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La precarga desde «Quiero mi…»')

const disparadorDe = (servicio: string | null): Element => ({ getAttribute: (n: string) => (n === 'data-precarga' ? servicio : null) }) as unknown as Element
afirmarIgual(precargaDe(disparadorDe('web')), ['web'], '«Quiero mi desarrollo web» abre con «Una página web»')
afirmarIgual(precargaDe(disparadorDe('software')), ['software'], '«Quiero mi software a medida» abre con «Software a medida»')
afirmarIgual(precargaDe(disparadorDe('ia-automatizacion')), ['chatbot', 'automatizaciones'], '«Quiero mi integración con IA» abre con «Un chatbot con IA» y «Automatizaciones»')
afirmarIgual(precargaDe(disparadorDe(null)), [], '  y el resto de los disparadores abre sin nada marcado')
controlPositivo('  el chequeo vería una precarga equivocada', { ...PRECARGA_POR_SERVICIO, web: ['tienda'] as const }, (tabla: Readonly<Record<string, readonly string[]>>) => tabla.web.join() === 'web')
const SERVICIOS = ['src/app/v3/_secciones/servicios/CtaDelServicio.tsx', 'src/app/v3/_secciones/servicios/CtaQueRota.tsx'].map(leer)
afirmar(SERVICIOS.every((f) => /data-abre-contacto=""/.test(f) && /data-precarga=\{/.test(f)), 'los dos CTA de Servicios (el de móvil y el que rota) abren el contacto con su servicio')
afirmar(SELECTOR_DE_APERTURA.includes('a[href="#contacto"]') && SELECTOR_DE_APERTURA.includes('[data-abre-contacto]'), 'lo abre todo `#contacto` y todo `[data-abre-contacto]`')
const HOJA_WEB = renderToStaticMarkup(<HojaParaElInvariante precarga={['web']} />)
const marcados = (h: string): string[] => [...h.matchAll(/<input[^>]*type="checkbox"[^>]*>/g)].filter((m) => /checked/.test(m[0])).map((m) => /value="([^"]+)"/.exec(m[0])?.[1] ?? '?')
afirmarIgual(marcados(HOJA_WEB), ['web'], '  y la hoja abre con ese chip marcado de verdad, y sólo ese')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El envío: una sola puerta, validación real y nunca un «enviado» falso')

const VALIDO: DatosDeContacto = { intereses: ['web'], presupuesto: 'todavía no sé', nombre: 'Ana', medio: 'ana@tuempresa.com', empresa: '', mensaje: 'Una web para el negocio' }
afirmarIgual(Object.keys(validarContacto(VALIDO)), [], 'con todo lo obligatorio, no hay errores (la empresa es opcional)')
afirmarIgual(Object.keys(validarContacto({ ...VALIDO, intereses: [], medio: 'ana' })).sort(), ['intereses', 'medio'], '  y se marca lo que falta: sin opción y con un contacto que no es email ni WhatsApp')
let abierta: string | null = null
const invalido = enviarContacto({ ...VALIDO, nombre: '' }, (u) => { abierta = u })
afirmar(invalido.estado === 'invalido' && abierta === null, 'con errores no sale nada')
const valido = enviarContacto(VALIDO, (u) => { abierta = u })
afirmar(valido.estado === 'abierto-en-whatsapp' && abierta !== null && (abierta as string).startsWith('https://wa.me/5493814154708?text=') && (abierta as string).includes(encodeURIComponent(mensajeDeContacto(VALIDO))), 'válido, abre wa.me con el mensaje armado')
controlPositivo('  el chequeo vería un envío que abre con errores', () => 'abierto', (f: () => string) => f() === 'invalido')
afirmar(ROTULO_DEL_ENVIO === 'Enviar por WhatsApp' && !/¡?[Ee]nviado!?/.test(DESPUES_DEL_ENVIO.texto + ROTULO_DEL_ENVIO), 'el botón dice lo que pasa, y nada dice «enviado»')
afirmar(INTERESES.length === 7 && !/newsletter|novedades/i.test(HOJA), 'siete opciones y sin casilla de newsletter')

cerrar('s25-contacto.invariant')
