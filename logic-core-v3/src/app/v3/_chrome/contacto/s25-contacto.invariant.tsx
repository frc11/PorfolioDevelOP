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
import { ESCENARIO_MIN_ANCHO_PX } from '../../_lib/compuerta'
import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { siguienteFoco } from '../../_secciones/trabajos/demos/dialogo'
import { abrirContacto, cerrarContacto, devolverElFoco, focoDelOrigen, precargaDe, SELECTOR_DE_APERTURA } from './apertura'
import { CamposDelContacto } from './CamposDelContacto'
import { animacionDelPanel, CLASES_DEL_PANEL, curvaDelPanel, esElPanel, PANEL } from './panel'
import { ESCALA_AL_NACER, escalaDelViaje, MS_DE_LA_SALIDA_DE_LA_PLACA, TRANSICIONES } from './placa'
import { PlacaDelContacto } from './PlacaDelContacto'
import { DESPUES_DEL_ENVIO, INTERESES, PRECARGA_POR_SERVICIO, ROTULO_DEL_ENVIO, TITULO } from './contenido'
import { enviarContacto, validarContacto, type DatosDeContacto } from './enviarContacto'
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
// [P-H10] Al botón REAL: los CTA de Servicios ponen el atributo en un `div` (que no recibe el foco: quedaba en `body`).
const boton = { isConnected: true, matches: () => true } as unknown as HTMLElement
const envoltorio = { isConnected: true, matches: () => false, querySelector: () => boton } as unknown as HTMLElement
const suelto = { isConnected: false, matches: () => true } as unknown as HTMLElement
const alBotonReal = (f: (o: HTMLElement | null) => HTMLElement | null): boolean => f(envoltorio) === boton && f(boton) === boton && f(suelto) === null && f(null) === null
afirmar(alBotonReal(focoDelOrigen), '[P-H10] el foco vuelve al control real: el que abrió si lo puede recibir; si es un envoltorio, el primer control de adentro; si ya no está en la página, a nadie')
controlPositivo('  el detector VE la devolución de antes (el foco al envoltorio, que no lo recibe)', (o: HTMLElement | null): HTMLElement | null => o, alBotonReal)
const DELEGACION = quitarComentarios(leer('src/app/v3/_chrome/contacto/apertura.ts'))
afirmar(/=== ABRE_EL_PANEL\) abrirContacto\(precargaDe\(objetivo\), origenDelClic\(e\.target, objetivo\)\)/.test(DELEGACION) && /const destino = focoDelOrigen\(estado\.origen\)/.test(DELEGACION), '  y la delegación guarda el control que se tocó (con el teclado, el que tenía el foco) adentro del disparador')
// [P-H12] Las caras de la placa no reciben el puntero: van después de la hoja y tapaban la X al pedir el elemento del punto.
const PLACA = renderToStaticMarkup(<PlacaDelContacto activa><div data-parte="hoja" /></PlacaDelContacto>)
const sinPuntero = (h: string): boolean => {
  const caras = [...h.matchAll(/<div data-cara="[a-z]+"[^>]*style="([^"]*)"/g)]
  return caras.length === 5 && caras.every((c) => /pointer-events:\s*none/.test(c[1]))
}
afirmar(sinPuntero(PLACA), '[P-H12] las cinco caras de la placa no reciben el puntero (`pointer-events: none`): el clic en la X llega a la X')
controlPositivo('  el detector VE las caras de antes (con el puntero)', PLACA.replace(/;?pointer-events:\s*none/g, ''), sinPuntero)

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
// [NOCTURNO FINAL] A7 · cambió por pedido: los «Quiero mi…» abren el PANEL de contacto (la hoja) con su servicio marcado,
// no viajan al formulario del pie.
afirmar(SERVICIOS.every((f) => /data-abre-contacto="panel"/.test(f) && /data-precarga=\{/.test(f)), 'los dos CTA de Servicios (el de móvil y el que rota) abren el panel de contacto con su servicio marcado')
// [RETOQUE 3D] 3I: `#contacto` es el formulario del pie (el viaje lo lleva); los `[data-abre-contacto]` viajan ahí también.
// [CIERRE RETOQUE 3D] N1: menos los del panel (`data-abre-contacto="panel"`), que abren la hoja.
const APERTURA = leer('src/app/v3/_chrome/contacto/apertura.ts')
afirmar(!SELECTOR_DE_APERTURA.includes('a[href="#contacto"]') && SELECTOR_DE_APERTURA.includes('[data-abre-contacto]') && /viajarAlContacto\(selectorDeLosViajes\)/.test(APERTURA) && /=== ABRE_EL_PANEL\) abrirContacto\(precargaDe\(objetivo\)/.test(APERTURA), 'todo apunta al contacto del pie (`#contacto` es su ancla y `[data-abre-contacto]` viaja ahí), menos los del panel, que abren la hoja')
const HOJA_WEB = renderToStaticMarkup(<HojaParaElInvariante precarga={['web']} />)
const marcados = (h: string): string[] => [...h.matchAll(/<input[^>]*type="checkbox"[^>]*>/g)].filter((m) => /checked/.test(m[0])).map((m) => /value="([^"]+)"/.exec(m[0])?.[1] ?? '?')
afirmarIgual(marcados(HOJA_WEB), ['web'], '  y la hoja abre con ese chip marcado de verdad, y sólo ese')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El envío: una sola puerta, validación real y nunca un «enviado» falso')

// [RONDA 2] F1: envía a `/api/contacto` (el endpoint propio); sin `mailto` ni WhatsApp. El que envía se cambia acá por uno de prueba.
const VALIDO: DatosDeContacto = { intereses: ['web'], presupuesto: 'todavía no sé', nombre: 'Ana', medio: 'ana@tuempresa.com', empresa: '', mensaje: 'Una web para el negocio' }
afirmarIgual(Object.keys(validarContacto(VALIDO)), [], 'con todo lo obligatorio, no hay errores (la empresa es opcional)')
// [EL ENCASTRE] 1E · cambió por pedido: el único obligatorio es el email o el teléfono (antes, todo salvo la empresa).
const SOLO_EL_MEDIO: DatosDeContacto = { intereses: [], presupuesto: '', nombre: '', medio: '1155667788', empresa: '', mensaje: '' }
afirmarIgual(Object.keys(validarContacto(SOLO_EL_MEDIO)), [], '  con sólo el email o el teléfono alcanza (EL ENCASTRE 1E: lo demás es opcional)')
afirmarIgual(Object.keys(validarContacto({ ...VALIDO, intereses: [], medio: 'ana' })).sort(), ['medio'], '  y se marca lo que falta: un contacto que no es email ni teléfono (sin opción marcada, se puede enviar)')
afirmar(ROTULO_DEL_ENVIO === 'Enviar' && !/¡?[Ee]nviado!?/.test(DESPUES_DEL_ENVIO + ROTULO_DEL_ENVIO), 'el botón dice lo que pasa, y nada dice «enviado»')
afirmar(INTERESES.length === 7 && !/newsletter|novedades/i.test(HOJA), 'siete opciones y sin casilla de newsletter')
afirmar(!/whatsapp|wa\.me|mailto:/i.test(HOJA.replace(/<a href="mailto:[^"]*"[^>]*>[^<]*<\/a>/, '')), '  la hoja no nombra WhatsApp ni manda por `mailto` (el mail de la bajada es un enlace para escribir, no el envío)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · [C2 · 22] El panel de abajo de escritorio: ~70 %, centrado, desde el fondo; el envío del sitio; el autocompletado; los errores')

// El panel (teléfono y tablet, y siempre con el menú del teléfono) es el mismo formulario en una hoja centrada que llega del fondo con
// una escala y un fundido, sin 3D; en escritorio (1024 en adelante), la placa de siempre. El tamaño real se mide en
// scripts-carga/contacto-general.ts (68 a 72 % del ancho y del alto visibles a 390 y 768; a 1024 ya es escritorio).
const HOJA_PANEL = renderToStaticMarkup(<HojaParaElInvariante escritorio={false} />)
const FUENTE_SIN = quitarComentarios(FUENTE)
const clase = (...partes: string[]): string => partes.join('')
const esPanel = (h: string): boolean =>
  /data-forma="panel"/.test(h) && h.includes('data-parte="escenario-del-panel"') && !h.includes('data-cara=') && !/data-placa/.test(h) && h.includes(CLASES_DEL_PANEL) && /role="dialog"/.test(h) && h.includes('data-parte="velo"')
afirmar(esPanel(HOJA_PANEL), 'abajo de escritorio la hoja es el PANEL: en su escenario centrado, con las clases del panel, sin placa ni caras 3D, y sigue siendo el diálogo con su velo')
controlPositivo('  el detector VE la placa de escritorio (con sus caras 3D)', HOJA, esPanel)
controlPositivo('  y una hoja que no es el panel', HOJA_PANEL.replace('data-forma="panel"', 'data-forma="hoja"'), esPanel)
afirmar(/data-forma="placa"/.test(HOJA) && (HOJA.match(/data-cara=/g) ?? []).length === 5 && !HOJA.includes('escenario-del-panel'), '  y en escritorio sigue la placa (cinco caras y su escenario), sin el del panel')
afirmar((HOJA.match(/data-esquina=/g) ?? []).length === 4, '  [L1] y cuatro caras de esquina que cierran el borde (los costados se corren del radio y dejaban un hueco)')
controlPositivo('  el detector VE una placa sin las esquinas', HOJA.replace(/data-esquina=/g, 'data-x='), (h: string) => (h.match(/data-esquina=/g) ?? []).length === 4)

// El tamaño: ~70 % del ancho y del alto (el alto es un mínimo: si el contenido pide más, crece hasta el 90 % y recién ahí scrollea).
const clasesDelTamano = (c: string, p: typeof PANEL): boolean =>
  c.includes(clase('w-', '[', String(p.ancho * 100), '%]')) && c.includes(clase('min-h-', '[', String(p.alto * 100), 'svh]')) && c.includes(clase('max-h-', '[', String(p.altoMaximo * 100), 'svh]'))
afirmar(PANEL.ancho === 0.7 && PANEL.alto === 0.7 && PANEL.altoMaximo > PANEL.alto && clasesDelTamano(CLASES_DEL_PANEL, PANEL), '  el panel mide ~70 % del ancho y del alto visibles (el alto es un mínimo, con tope al 90 %): sus clases están escritas enteras y atadas a esas fracciones')
controlPositivo('  el detector VE un panel de todo el ancho (como la hoja de antes)', CLASES_DEL_PANEL.replace(clase('w-', '[70%]'), 'w-full'), (c: string) => clasesDelTamano(c, PANEL))

// Dónde empieza el panel: 1024 es escritorio (decisión del dueño); abajo y con el menú del teléfono, el panel.
afirmar(ESCENARIO_MIN_ANCHO_PX === 1024 && /useAnchoMinimo\(CONSULTA_ESCENARIO\)/.test(FUENTE_SIN) && esElPanel('menu', true) && esElPanel('barra', false) && !esElPanel('barra', true), '  el panel es de 1023 para abajo (y siempre con el menú del teléfono); desde 1024, escritorio con la placa: un solo 1024, el del escenario')
controlPositivo('  el detector VE una tablet con la placa (la barra a 768 sin panel)', (m: 'barra' | 'menu', e: boolean): boolean => m === 'menu' && !e, (f: typeof esElPanel) => f('menu', true) && f('barra', false) && !f('barra', true))

// La llegada: la misma curva de tamaño que la placa de escritorio, vista como avance de una escala que va de ESCALA_AL_NACER a 1.
const igualALaPlaca = (curva: (t: number) => number): boolean =>
  [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].every((t) => Math.abs(ESCALA_AL_NACER + (1 - ESCALA_AL_NACER) * curva(t) - escalaDelViaje(t)) < 1e-9) && curva(0) === 0 && Math.abs(curva(1) - 1) < 1e-9
afirmar(igualALaPlaca(curvaDelPanel), '  entra con la curva de tamaño de la placa de escritorio (a cada instante, el mismo tamaño aparente)')
controlPositivo('  el detector VE una entrada en recta (otra curva)', (t: number) => t, igualALaPlaca)
const objeto = (v: unknown): Readonly<Record<string, unknown>> => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {})
const conMovimiento = animacionDelPanel(false)
const llegaDelFondo = (a: ReturnType<typeof animacionDelPanel>): boolean => {
  const ini = objeto(a.initial)
  const ani = objeto(a.animate)
  const sal = objeto(a.exit)
  const viaje = objeto(objeto(objeto(ani.transition).scale))
  const salida = objeto(objeto(objeto(sal.transition).scale))
  return (
    ini.scale === ESCALA_AL_NACER && ini.opacity === 0 && ani.scale === 1 && ani.opacity === 1 && sal.scale === ESCALA_AL_NACER && sal.opacity === 0 && !('y' in ini) && !('y' in sal) &&
    viaje.delay === TRANSICIONES.viaje.delay && viaje.duration === TRANSICIONES.viaje.duration && salida.duration === MS_DE_LA_SALIDA_DE_LA_PLACA / 1000
  )
}
afirmar(llegaDelFondo(conMovimiento), '  llega del fondo con una escala y un fundido (de un punto a su tamaño, con el retardo y la duración del viaje de la placa) y se va igual (vuelve al fondo y se desvanece); sin desplazarse desde abajo')
controlPositivo('  el detector VE la hoja que sube desde abajo (la de antes)', { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }, llegaDelFondo)
const soloFundido = (a: ReturnType<typeof animacionDelPanel>): boolean => [a.initial, a.animate, a.exit].every((v) => !('scale' in objeto(v)) && !('y' in objeto(v)) && 'opacity' in objeto(v))
afirmar(soloFundido(animacionDelPanel(true)), '  con movimiento reducido, sólo un fundido (sin escala ni desplazamiento)')
controlPositivo('  el detector VE el movimiento completo con movimiento reducido', conMovimiento, soloFundido)

// El envío: el estándar del sitio (EstadoDeEnvio), en todos los anchos; el éxito cierra el panel, el error vuelve con lo escrito.
const delEnvio = (f: string): boolean =>
  /<EstadoDeEnvio estado=\{estado\} alVolver=\{alVolver\}>/.test(f) && /if \(despuesDe === 'exito'\) cerrarContacto\(\)\s*else setEstado\('reposo'\)/.test(f) &&
  /if \(Object\.keys\(validarContacto\(datos\)\)\.length === 0\) setEstado\('enviando'\)/.test(f) && !/TarjetaDeResultado|<Carga |conDuracionMinima|CIERRE_MS|useAltoGuardado/.test(f)
afirmar(delEnvio(FUENTE_SIN), 'el envío es el del sitio (EstadoDeEnvio): inválido responde al toque, válido pasa a la carga; con el éxito el panel se cierra, con el error vuelve el formulario con lo escrito; sin la tarjeta ni la carga de antes')
controlPositivo('  el detector VE el envío de antes (la tarjeta de resultado)', FUENTE_SIN.replace('<EstadoDeEnvio estado={estado} alVolver={alVolver}>', '<TarjetaDeResultado>'), delEnvio)
controlPositivo('  y el éxito que no cierra el panel', FUENTE_SIN.replace("if (despuesDe === 'exito') cerrarContacto()", "if (despuesDe === 'exito') setEstado('reposo')"), delEnvio)
const conEstadoDeEnvio = (h: string): boolean => /data-pieza="estado-de-envio"[\s\S]*<form /.test(h)
afirmar(conEstadoDeEnvio(HOJA_PANEL) && conEstadoDeEnvio(HOJA), '  y en el marcado el formulario vive adentro de su estado de envío (el mismo en el panel y en la placa)')
controlPositivo('  el detector VE un marcado sin el estado de envío', HOJA_PANEL.replace('data-pieza="estado-de-envio"', 'data-pieza="otro"'), conEstadoDeEnvio)

// El autocompletado: ningún campo del contacto es del pie (data-foco="campo"), así que toma la regla global de /v3 (piezas.css; s85 la ata).
const sinCamposDelPie = (h: string): boolean => (h.match(/<input /g) ?? []).length >= 4 && !/data-foco="campo"/.test(h)
afirmar(sinCamposDelPie(HOJA_PANEL), 'los campos del contacto toman el autocompletado global de /v3 (ninguno es de los del pie, que tienen el suyo)')
controlPositivo('  el detector VE un campo marcado como del pie', HOJA_PANEL.replace('<input ', '<input data-foco="campo" '), sinCamposDelPie)

// Los errores de validación: el formato de siempre del sitio (la píldora con borde punteado, el texto debajo y aria-invalid).
const vacioDeDatos: DatosDeContacto = { intereses: [], presupuesto: '', nombre: '', medio: '', empresa: '', mensaje: '' }
const sinAccion = (): void => undefined
const conErrores = (errores: Parameters<typeof CamposDelContacto>[0]['errores']): string => renderToStaticMarkup(<CamposDelContacto datos={vacioDeDatos} errores={errores} alternarInteres={sinAccion} escribir={sinAccion} compacto />)
const formatoDelSitio = (h: string): boolean => /aria-invalid="true"/.test(h) && /border-dashed/.test(h) && h.includes('id="contacto-error-medio"') && h.includes('Un email o un teléfono.')
afirmar(formatoDelSitio(conErrores({ medio: 'Un email o un teléfono.' })), 'el error de validación va en el formato del sitio: la píldora con borde punteado, aria-invalid y el texto debajo')
controlPositivo('  el detector VE los campos sin error', conErrores({}), formatoDelSitio)

void (async (): Promise<void> => {
  const pedidos: { ruta: string; datos: Readonly<Record<string, unknown>> }[] = []
  const servidor = (respuesta: { ok: true } | { ok: false; error: string }) => async (ruta: string, datos: Readonly<Record<string, unknown>>) => {
    pedidos.push({ ruta, datos })
    return respuesta
  }
  // [EL ENCASTRE] 1E · lo inválido ahora es el contacto (el nombre vacío se puede enviar).
  const invalido = await enviarContacto({ ...VALIDO, medio: '' }, servidor({ ok: true }))
  afirmar(invalido.estado === 'invalido' && pedidos.length === 0, 'con errores no sale nada')
  const valido = await enviarContacto(VALIDO, servidor({ ok: true }))
  afirmar(valido.estado === 'enviado' && pedidos.length === 1 && pedidos[0].ruta === '/api/contacto' && pedidos[0].datos.origen === 'panel' && pedidos[0].datos.nombre === 'Ana', 'válido, va al endpoint propio (`/api/contacto`, origen `panel`) y dice «enviado» sólo con la respuesta')
  const caido = await enviarContacto(VALIDO, servidor({ ok: false, error: 'No pudimos enviarlo.' }))
  afirmar(caido.estado === 'error' && caido.mensaje === 'No pudimos enviarlo.', '  y si el servidor no puede, el error normal del formulario')
  controlPositivo('  el chequeo vería un envío que dice «enviado» sin esperar la respuesta', { estado: 'enviado' } as const, (r: { estado: string }) => r.estado === 'error')
  cerrar('s25-contacto.invariant')
})()
