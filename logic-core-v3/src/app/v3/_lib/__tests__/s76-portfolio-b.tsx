/**
 * [B1.2d B] s76 · EL FORMULARIO DE «LA TUYA», SU ESPACIO Y LA PAUSA (`docs/rediseno/SPRINT-B1-PORTFOLIO.md` §14.6),
 * sin navegador: los campos del modal de contacto compartidos (y el modal IDÉNTICO: la huella de su marcado, tomada antes del cambio),
 * «Enviar» y WhatsApp en su fila, el clic que no hace nada y no suena, el bloque centrado (B6), [F6] que `?form=3d` (B7) salió, y `BotonPausa` en el video
 * del panel (P-H21). Cada afirmación con su control positivo.
 */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'

import { CamposDelContacto } from '../../_chrome/contacto/CamposDelContacto'
import { HojaParaElInvariante } from '../../_chrome/contacto/FormularioDeContacto'
import { marcar } from '../../_secciones/_invariantes/render'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { CLASE_DE_LA_PAUSA_DEL_PANEL, MedioDeLaTira, estadoDelVideo } from '../../_secciones/trabajos/portfolio/MedioDeLaTira'
import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import { tieneAtributo, type Nodo } from './s10-recorrido'

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const PORTFOLIO = '_secciones/trabajos/portfolio'
const huella = (m: string): string => createHash('sha256').update(m).digest('hex')

/**
 * Las huellas del marcado del modal de contacto, tomadas ANTES de sacar sus campos a `_componentes/formularios/Campos.tsx` (en el árbol
 * de `5ef4ce83`): la hoja entera (con y sin el interés precargado) y los campos vacíos, llenos con errores y en el teléfono.
 */
const ANTES = {
  // [C2 · 22] la hoja entera cambió por diseño (el envío es EstadoDeEnvio, y lleva `data-forma`); sus CAMPOS (los tres de abajo) siguen idénticos.
  hoja: 'c0f171481fd4484613656bcd61ee04cc56de13ce1f19f2fa8c63cd2c0aa56843',
  hojaWeb: 'ee7df87c9ecd5aa5092658adaab9c5e188bc06d2b1c238c102bd5b754ad855d6',
  vacio: '9cb4ffa3551b99a079ae50df0e7093f6b559f11ffd438b7eea8ee4f4d4d341b8',
  llenoConErrores: '2a3d2d3f0eb59113f08524764f3ea1131b4969b3e03d3f79bd3049564c4d84e1',
  compacto: '44ccfd4f0a79b489a93ef7b4f0a28c89dcaf99d74c97566bf121b32fff67e8f9',
} as const

export function afirmarB(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 32 · B4/B5 · «La tuya» con los campos del modal de contacto (el modal, idéntico)')

  const vacio = { intereses: [], presupuesto: '', nombre: '', medio: '', empresa: '', mensaje: '' } as const
  const lleno = { intereses: ['web' as const], presupuesto: '500', nombre: 'Ana', medio: 'a@b.c', empresa: 'X', mensaje: 'Hola' }
  const errores = { intereses: 'e1', presupuesto: 'e2', nombre: 'e3', medio: 'e4', mensaje: 'e5' }
  const nada = (): void => undefined
  const ahora = {
    hoja: renderToStaticMarkup(<HojaParaElInvariante />),
    hojaWeb: renderToStaticMarkup(<HojaParaElInvariante precarga={['web']} />),
    vacio: renderToStaticMarkup(<CamposDelContacto datos={vacio} errores={{}} alternarInteres={nada} escribir={nada} />),
    llenoConErrores: renderToStaticMarkup(<CamposDelContacto datos={lleno} errores={errores} alternarInteres={nada} escribir={nada} />),
    compacto: renderToStaticMarkup(<CamposDelContacto datos={vacio} errores={errores} alternarInteres={nada} escribir={nada} compacto />),
  }
  const identico = (a: typeof ahora): boolean => (Object.keys(ANTES) as (keyof typeof ANTES)[]).every((k) => huella(a[k]) === ANTES[k])
  afirmar(identico(ahora), 'el modal de contacto renderiza EXACTAMENTE lo mismo que antes de compartir sus campos: la hoja (con y sin el interés precargado) y los campos vacíos, con errores y en el teléfono')
  controlPositivo('  el detector ve un campo con una clase de más', { ...ahora, vacio: ahora.vacio.replace('data-foco="pastilla"', 'data-foco="pastilla" data-x=""') }, identico)
  const formulario = sinComentarios(leer(`${PORTFOLIO}/FormularioDeLaTuya.tsx`))
  const comparte = (f: string): boolean =>
    /from '\.\.\/\.\.\/\.\.\/_componentes\/formularios\/Campos'/.test(f) && /<CampoDeTextoLargo \{\.\.\.comun\} renglones=\{4\} \/>/.test(f) && /<CampoDePildora \{\.\.\.comun\}/.test(f) &&
    /<Cta type="submit" rotulo=\{enviando \? ROTULO_ENVIANDO : ROTULO_DEL_ENVIO\} deshabilitado=\{enviando\}/.test(f) &&
    /<div data-parte="fila-del-envio" className="mt-1 flex flex-wrap items-center justify-between gap-4">\s*<Cta[^>]*\/>\s*<EnlaceDeWhatsApp \/>/.test(f) && !/rounded-sutil border border-tinta\/30/.test(f)
  afirmar(comparte(formulario), '  «la tuya» usa los campos del modal (la píldora, el padding, los rótulos, el foco, el error y el ejemplo), «¿Qué necesitás?» es un texto largo de cuatro renglones, «Enviar» es el botón simple del sitio y WhatsApp va a su derecha, centrado, en la misma fila')
  controlPositivo('  el detector ve el formulario de B1.2c (sus campos propios)', `${formulario}\nconst x = 'rounded-sutil border border-tinta/30'`, comparte)
  const campos = sinComentarios(leer('_componentes/formularios/Campos.tsx'))
  afirmar(/4: '\[field-sizing:content\] min-h-\[4lh\] max-h-\[8lh\]'/.test(campos) && /rows=\{compacto \? renglones : renglones \+ 1\}/.test(campos), '  el texto largo: cuatro renglones como mínimo, crece con lo que se escribe hasta ocho')

  const tira = sinComentarios(leer(`${PORTFOLIO}/Tira.tsx`))
  const sonido = sinComentarios(leer('_chrome/sonido/ControlDelSonido.tsx'))
  const silencio = (t: string, s: string): boolean =>
    /aria-disabled=\{activa \|\| undefined\}\s*onClick=\{activa \? undefined : alElegir\}/.test(t) && /if \(blanco\.closest\(ENLACES_Y_BOTONES\)\?\.matches\('\[aria-disabled="true"\], :disabled'\) === true\) return/.test(s)
  afirmar(silencio(tira, sonido), '  el clic en el título de la tira abierta («La próxima es la tuya», o el nombre del proyecto) no hace nada y lo dice (`aria-disabled`, como el acordeón de la WAI), así que no suena: nada suena si no pasa nada')
  controlPositivo('  el detector ve la cabecera de antes (un botón activo que sonaba sin hacer nada)', [tira.replace('onClick={activa ? undefined : alElegir}', 'onClick={alElegir}'), sonido] as const, ([t, s]: readonly [string, string]) => silencio(t, s))
  const nodo = (atributos: string): Nodo => ({ atributos } as unknown as Nodo)
  const leeBien = (f: (n: Nodo, a: string) => boolean): boolean => !f(nodo(' type="button" aria-disabled="true"'), 'disabled') && f(nodo(' type="button" disabled=""'), 'disabled') && f(nodo('disabled'), 'disabled')
  afirmar(leeBien(tieneAtributo), '  y el lector de s10 ya no toma `aria-disabled` por `disabled`: la cabecera abierta sigue en el orden del teclado (como en el navegador)')
  controlPositivo('  el detector ve el lector de antes (`\\b`)', (n: Nodo, a: string) => new RegExp(`\\b${a}(?=[=\\s>]|$)`).test(n.atributos), leeBien)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 33 · B6 · «La tuya» centrada en el panel ([F6] y la prueba del formulario en 3D, `?form=3d`, salió)')

  const laTuya = sinComentarios(leer(`${PORTFOLIO}/LaTuya.tsx`))
  const centrada = (c: string): boolean => /activa && 'justify-center'/.test(c) && /paddingTop: DESPEJE_DE_LA_BARRA, paddingBottom: DESPEJE_DE_LA_BARRA/.test(c) && /className="relative flex min-h-0 flex-col gap-5 px-8 pt-4"/.test(c)
  afirmar(centrada(laTuya), 'el bloque entero (título, frase, bajada, formulario y la fila del botón), centrado en el alto con el mismo despeje arriba y abajo: sin el hueco grande de abajo (el criterio, < 10 % del panel, lo mide el banco)')
  controlPositivo('  el detector ve la tira de antes (el contenido arriba, el hueco abajo)', laTuya.replace("activa && 'justify-center'", 'false'), centrada)
  // [F6] La prueba del formulario en 3D (B7, `?form=3d`) salió entera: el código, la bandera y sus afirmaciones (las de la bandera, el
  // giro con el mouse y el plano en el servidor). Queda la que dice que salió.
  const sinVariante = (t: string, archivos: readonly string[]): boolean => !archivos.includes('FormularioEnPerspectiva.tsx') && !/FormularioEnPerspectiva|form=3d|data-forma/.test(t) && /<FormularioDeLaTuya visible=\{visible\} reducido=\{vivo\.reducido\} desde=\{2\} \/>/.test(t)
  const delPortfolio = readdirSync(path.join(V3, PORTFOLIO))
  afirmar(sinVariante(laTuya, delPortfolio), '  [F6] la prueba del formulario en 3D (`?form=3d`) salió entera: sin el archivo, sin la bandera, y «la tuya» con su formulario plano')
  controlPositivo('  el detector ve la tira con la prueba de B7', [laTuya.replace('<FormularioDeLaTuya visible={visible} reducido={vivo.reducido} desde={3} />', '<FormularioEnPerspectiva><FormularioDeLaTuya visible={visible} reducido={vivo.reducido} desde={3} /></FormularioEnPerspectiva>'), [...delPortfolio, 'FormularioEnPerspectiva.tsx']] as const, ([t, a]: readonly [string, readonly string[]]) => sinVariante(t, a))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('B1.2d B · 34 · P-H21 · La pausa del video en bucle del panel de escritorio')

  const p = PROYECTOS[0]
  const corre = marcar(<MedioDeLaTira proyecto={p} activa cerca aLaVista reducido={false} />, { anima: true })
  const quieto = marcar(<MedioDeLaTira proyecto={p} activa cerca aLaVista reducido />, { anima: false })
  afirmar(/<button type="button" data-pieza="boton-pausa" aria-pressed="false" aria-label="Pausar el video de El Garage"/.test(corre) && !/boton-pausa/.test(quieto), 'el video en bucle del panel lleva su pausa (`BotonPausa`, WCAG 2.2.2) mientras corre solo; con movimiento reducido (el póster, sin autoplay) no hace falta')
  afirmarIgual([estadoDelVideo(true, true, false, true).reproduce, estadoDelVideo(true, true, false, true, true).reproduce], [true, false], '  y pausado no se reproduce (en las historias, la pausa es mantener apretado)')
  controlPositivo('  el detector ve una pausa que no pausa', (pausado: boolean) => estadoDelVideo(true, true, false, true).reproduce || pausado, (f: (pausado: boolean) => boolean) => f(true) === false)
  // [F7] Sale el botón visible: la pausa queda sólo para el teclado (aparece con :focus-visible, nunca con el mouse).
  const soloTeclado = (m: string): boolean => {
    const clase = /data-pieza="boton-pausa"[^>]*class="([^"]*)"/.exec(m)?.[1] ?? ''
    return ['pointer-events-none', 'scale-0', 'focus-visible:scale-100'].every((c) => clase.split(' ').includes(c)) && !clase.split(' ').some((c) => c.startsWith('hover:'))
  }
  afirmar(soloTeclado(corre) && CLASE_DE_LA_PAUSA_DEL_PANEL.includes('focus-visible:scale-100'), '  [F7] y es sólo para el teclado: en escala 0 y sin puntero (el mouse no la ve ni la toca; sigue en el orden del Tab); aparece con el foco visible al tabular')
  controlPositivo('  el detector ve la pausa de B (a la vista y con el mouse)', corre.replace(CLASE_DE_LA_PAUSA_DEL_PANEL, 'absolute right-3 bottom-3'), soloTeclado)
}
