/**
 * s87 · [B11] (2026-10-22) EL CHAT DEL SITIO EN /v3 — sin navegador, cada afirmación con su control positivo.
 *
 *   1 · diferido: perezoso (su módulo no viaja en la carga de /v3), nada en el HTML del servidor, y la compuerta (el preloader, el
 *       velo de carga, la escena preparada), las pruebas que no llaman a la API, las rutas, y sin config no se monta;
 *   2 · sin 3D: los avatares de /v3 son los livianos del registro, y el widget los usa en el botón y en la ventana; el sitio vivo, igual;
 *   3 · el lugar: abajo a la derecha, sin pisar las cajas del chrome en 360, 390, 768, 1024, 1440 y 1920 (con los tokens, `s87-cajas`);
 *   4 · el apilado: encima de la página y del velo de la navegación, debajo del login, el contacto, el menú, el velo de carga y el preloader.
 *
 * Las clases con corchetes se arman partidas (`clase`): Tailwind escanea este archivo (CLAUDE.md, modo pulido).
 */
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { createElement } from 'react'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { RAIZ } from '../../_lib/__tests__/s3-archivos'
import { BREAKPOINTS, tokenPx } from '../../_lib/__tests__/s10-css'
import { marcar } from '../../_secciones/_invariantes/render'
import { ChromeDelHome } from '../ChromeDelHome'
import { CLASE_DE_LA_PASTILLA_APAGADA } from '../contrato'
import { CLAVE_DE_LOS_BANCOS } from '../preloader/decision'
import { ChatDelSitio } from './ChatDelSitio'
import {
  AVATARES_SIN_3D,
  AVATAR_POR_DEFECTO,
  APARIENCIA_DEL_CHAT,
  chatPermitido,
  montarElChat,
  puedeEntrarElChat,
  rutaConChat,
  type EsperaDelChat,
} from './compuerta'
import { CUADROS, aireDeLaEsquina, cajasDelChat, cajasDelChrome, leer, loQuePisa, medidasDelChat, type Caja, type Cuadro, type MedidasDelChat } from './s87-cajas'

const V3 = 'src/app/v3'
const CHAT = `${V3}/_chrome/chat/ChatDelSitio.tsx`
const COMPANION = 'src/modules/chatbot/components/LogicCompanion.tsx'
const sinComentarios = (c: string): string => c.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
/** Una clase arbitraria de Tailwind, armada en tiempo de ejecución (nunca escrita entera en este archivo). */
const clase = (prefijo: string, valor: string): string => prefijo + '-' + '[' + valor + ']'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Diferido: perezoso, nada en el servidor, la compuerta, las pruebas, las rutas y la config')

const fuenteDelChat = sinComentarios(leer(CHAT))
const perezoso = (f: string): boolean =>
  /const cargarElChat = \(\) => import\('@\/modules\/chatbot\/components\/LogicCompanion'\)/.test(f) && /const LogicCompanion = lazy\(\(\) => cargarElChat\(\)/.test(f) && !/^import [^\n]*from '@\/modules\/chatbot(\/components[^']*)?'/m.test(f)
afirmar(perezoso(fuenteDelChat), 'el widget entra perezoso: `lazy` sobre un `import()` del componente, sin un import estático del módulo')
controlPositivo('  el detector ve un import estático del widget', `import { LogicCompanion } from '@/modules/chatbot'\n${fuenteDelChat}`, perezoso)

/**
 * Todo /v3 (sin las pruebas): ningún import estático del WIDGET (el barril, el componente, la ventana, los avatares, el globo, las
 * tarjetas, los hooks). Las demos del Panel sí importan piezas sueltas del módulo (las etiquetas y las columnas de los leads): no son
 * el widget y no lo arrastran.
 */
function archivosDeV3(dir = V3, acumulado: string[] = []): string[] {
  for (const e of readdirSync(path.join(RAIZ, dir))) {
    const r = `${dir}/${e}`
    if (statSync(path.join(RAIZ, r)).isDirectory()) archivosDeV3(r, acumulado)
    else if (/\.tsx?$/.test(e) && !/invariant|__tests__|s87-/.test(r)) acumulado.push(r)
  }
  return acumulado
}
const importaElChat = (f: string): boolean => /^import (?!type )[^\n]*from '@\/modules\/chatbot(\/(components\/(LogicCompanion|chat|avatar|tooltip|tool-cards)|hooks)[^']*)?'/m.test(f)
const estaticos = archivosDeV3().filter((r) => importaElChat(leer(r)))
afirmarIgual(estaticos, [], 'ningún archivo de /v3 importa estático el widget del chat (de su módulo, sólo la caché de la config)')
controlPositivo('  el detector ve el barril importado', "import { LogicCompanion } from '@/modules/chatbot'\n", (f: string) => !importaElChat(f))
const montajeVivo = leer('src/components/layout/ChatWidgetMount.tsx')
afirmar(/^import \{ prefetchBotConfig \} from '@\/modules\/chatbot\/shared\/configCache'$/m.test(montajeVivo), '  la caché ya viaja en toda ruta: el layout raíz la importa estática (`ChatWidgetMount`); /v3 no suma ese peso')

const marcadoDelChrome = marcar(createElement(ChromeDelHome), { anima: false })
const marcadoDelChat = marcar(createElement(ChatDelSitio), { anima: false })
const sinChatEnElServidor = (m: string): boolean => !/chat-del-sitio|data-chatbot/.test(m)
afirmar(marcadoDelChat === '' && sinChatEnElServidor(marcadoDelChrome), 'en el servidor no emite nada: ni el chat solo ni el chrome entero traen una caja o una parada del chat')
controlPositivo('  el detector ve el botón del chat en el marcado', `${marcadoDelChrome}<div data-chatbot-avatar="" role="button" tabindex="0"></div>`, sinChatEnElServidor)
const chromeFuente = sinComentarios(leer(`${V3}/_chrome/ChromeDelHome.tsx`))
const montado = (c: string): boolean => /import \{ ChatDelSitio \} from '\.\/chat\/ChatDelSitio'/.test(c) && /<EsquinaDelSonido \/>\s*<ChatDelSitio \/>/.test(c)
afirmar(montado(chromeFuente), '  lo monta el chrome del layout (el home y las páginas, sin volver a montarse entre rutas), al lado del parlante')
controlPositivo('  el detector ve el chrome sin el chat', chromeFuente.replace('<ChatDelSitio />', ''), montado)

const PERSONA: EsperaDelChat = { entradaAbierta: true, veloDeCarga: false, escenaLista: true, vencido: false }
const TABLA: readonly (readonly [string, EsperaDelChat, boolean])[] = [
  ['con el preloader (la entrada cerrada): no', { ...PERSONA, entradaAbierta: false, vencido: true }, false],
  ['con el velo de carga del home: no', { ...PERSONA, veloDeCarga: true, vencido: true }, false],
  ['la escena sin preparar y sin el plazo: no', { ...PERSONA, escenaLista: false }, false],
  ['la escena preparada (o caída): sí', PERSONA, true],
  ['la escena sin avisar, cumplido el plazo: sí', { ...PERSONA, escenaLista: false, vencido: true }, true],
]
const cumpleLaTabla = (f: (e: EsperaDelChat) => boolean): boolean => TABLA.every(([, e, sale]) => f(e) === sale)
afirmar(cumpleLaTabla(puedeEntrarElChat), `la compuerta: ${TABLA.map(([q]) => q).join('; ')}`)
controlPositivo('  la tabla ve una compuerta que no espera al preloader', (e: EsperaDelChat) => !e.veloDeCarga && (e.escenaLista || e.vencido), cumpleLaTabla)
const cableado = (f: string): boolean =>
  /entradaAbierta: entradaAbierta\(\)/.test(f) && /veloDeCarga: !cargaLista\(\) && document\.querySelector\('\[data-pieza="velo-de-carga"\]'\) !== null/.test(f) && /escenaLista: escenaPreparada\(\) \|\| laEscenaCayo\(\)/.test(f) &&
  /suscribirALaEntrada\(avisar\), suscribirALaCarga\(avisar\), suscribirALaCaida\(avisar\)/.test(f)
afirmar(cableado(fuenteDelChat) && leer(`${V3}/_componentes/VeloDeCarga.tsx`).includes('data-pieza="velo-de-carga"'), '  cableada a las señales de verdad: la entrada (B12c), el velo de carga, la escena preparada o caída, y escucha a las tres')
controlPositivo('  el detector ve la compuerta sin la entrada', fuenteDelChat.replace('entradaAbierta: entradaAbierta()', 'entradaAbierta: true'), cableado)
const pideDespues = (f: string): boolean => {
  const ocioso = f.indexOf('cuandoEsteOcioso(() => {')
  const pedidos = [...f.matchAll(/prefetchBotConfig\(|cargarElChat\(\)(?!\.then)/g)].map((m) => m.index ?? -1).filter((i) => i > f.indexOf('export function ChatDelSitio'))
  return ocioso > 0 && pedidos.length > 0 && pedidos.every((i) => i > ocioso) && /if \(!permitido \|\| !conChat \|\| !compuerta \|\| config !== 'esperando'\) return undefined/.test(f)
}
afirmar(pideDespues(fuenteDelChat), '  el módulo y la config se piden sólo con la compuerta abierta, en un momento ocioso')
controlPositivo('  el detector ve la config pedida al montar', fuenteDelChat.replace('export function ChatDelSitio(): React.JSX.Element | null {', 'export function ChatDelSitio(): React.JSX.Element | null {\n  void prefetchBotConfig(SLUG_DEL_CHAT)'), pideDespues)

const PRUEBAS = [
  ['una persona: sí', { automatizado: false, siembra: false, pedidoPorElBanco: false }, true],
  ['automatizado (Playwright, CDP con marca): no', { automatizado: true, siembra: false, pedidoPorElBanco: false }, false],
  ['con la siembra de los bancos: no', { automatizado: false, siembra: true, pedidoPorElBanco: false }, false],
  ['un banco que lo pide (y simula la config): sí', { automatizado: true, siembra: true, pedidoPorElBanco: true }, true],
] as const
const cumpleLasPruebas = (f: typeof chatPermitido): boolean => PRUEBAS.every(([, p, sale]) => f(p) === sale)
afirmar(cumpleLasPruebas(chatPermitido) && CLAVE_DE_LOS_BANCOS === 'home:intro' && leer('scripts-carga/chrome-en-los-anchos.ts').includes("sessionStorage.setItem('home:intro', '1')"), `las pruebas no llaman a la API del chat: ${PRUEBAS.map(([q]) => q).join('; ')}`)
controlPositivo('  la tabla ve un chat que se pide bajo automatización', () => true, cumpleLasPruebas)

const RUTAS = [['/v3', true], ['/v3/pagina-base', true], ['/v3/paginas-web', true], ['/v3/motion', false], ['/v3/componentes/x', false], ['/', false], [null, false]] as const
const cumpleLasRutas = (f: typeof rutaConChat): boolean => RUTAS.every(([r, sale]) => f(r) === sale)
afirmar(cumpleLasRutas(rutaConChat), 'en el home y las páginas sí; en los laboratorios de /v3 y fuera de /v3, no')
controlPositivo('  la tabla ve el chat en el laboratorio de motion (sus controles van en la misma esquina)', (r: string | null) => r !== null && r.startsWith('/v3'), cumpleLasRutas)
const TODO = { permitido: true, ruta: '/v3', compuerta: true, config: 'lista' } as const
const cumpleElMontaje = (f: typeof montarElChat): boolean => f(TODO) && !f({ ...TODO, config: 'sin' }) && !f({ ...TODO, config: 'esperando' }) && !f({ ...TODO, compuerta: false }) && !f({ ...TODO, permitido: false })
afirmar(cumpleElMontaje(montarElChat), 'se monta con todo; sin la config del bot (la API caída), no: ni el aviso de reintento del sitio vivo, que pisaría la píldora (§3)')
controlPositivo('  la tabla ve el montaje sin config', (m: Parameters<typeof montarElChat>[0]) => m.permitido && m.compuerta, cumpleElMontaje)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Sin 3D: los avatares livianos, en el botón y en la ventana; el sitio vivo, igual')

const registro = leer('src/modules/chatbot/components/avatar/registry.ts')
const entradas = new Map([...registro.matchAll(/\{\s*id: '([^']+)'[\s\S]*?weight: '(heavy|light)'[\s\S]*?\n {2}\}/g)].map((m) => [m[1], { peso: m[2], escala: m[0].includes('fillScale') }]))
const livianos = (ids: readonly string[]): boolean => ids.length > 0 && ids.every((id) => entradas.get(id)?.peso === 'light' && entradas.get(id)?.escala === false)
afirmar(livianos(AVATARES_SIN_3D) && entradas.get('neuro')?.peso === 'heavy' && /from '\.\/HeavyAvatarsLazy'/.test(registro), `los avatares de /v3 (${AVATARES_SIN_3D.join(', ')}) son los livianos del registro (SVG, sin escala: botón de 56 px); los 3D, perezosos y aparte`)
controlPositivo('  el detector ve el orbe 3D', ['neuro'], livianos)
// [C2-21] A la spec nueva: el geométrico es el único (la onda, el monograma y la bandera `?chat=` se borraron).
const unoSolo = (f: string): boolean => AVATARES_SIN_3D.length === 1 && AVATAR_POR_DEFECTO === 'geometrico' && !/URLSearchParams|BANDERA_DEL_CHAT/.test(f)
afirmar(unoSolo(fuenteDelChat), '  [C2-21] el avatar es el geométrico, el único: la onda, el monograma y `?chat=` se fueron')
controlPositivo('  el detector ve la bandera de antes', `${fuenteDelChat}\nconst avatar = new URLSearchParams(window.location.search).get(BANDERA_DEL_CHAT)`, unoSolo)
afirmar(APARIENCIA_DEL_CHAT.avatarStyle === 'geometrico' && APARIENCIA_DEL_CHAT.position === 'bottom_right', '  lo que /v3 fija: el avatar, la esquina de abajo a la derecha y [C2-21] los colores del home, en un solo objeto (el widget memoriza sobre él)')

const companion = sinComentarios(leer(COMPANION))
const usaLaApariencia = (c: string): boolean =>
  /const config = useMemo\(\s*\(\) => \(chatbot\.config && overrides \? \{ \.\.\.chatbot\.config, \.\.\.overrides \} : chatbot\.config\)/.test(c) && !/chatbot\.config\.|chatbot\.config!|config=\{chatbot\.config\}/.test(c) &&
  /<ChatWindow\s+config=\{config\}/.test(c) && /style=\{config\.avatarStyle\}/.test(c) && (c.match(/<ProactiveTooltip[^>]*?config=\{config\}/g) ?? []).length === 2 && /config\.position === 'bottom_left'/.test(c)
afirmar(usaLaApariencia(companion), 'el widget aplica lo fijado sobre la config del bot en el botón, la ventana (cabecera y avatar pensando), el globo y la esquina')
controlPositivo('  el detector ve la ventana con la config sin lo fijado (la cabecera con el orbe 3D)', companion.replace(/<ChatWindow\s+config=\{config\}/, '<ChatWindow\n            config={chatbot.config}'), usaLaApariencia)
const vivoIgual = (m: string): boolean => /<LogicCompanion slug=\{WIDGET_SLUG\} \/>/.test(m) && !/overrides/.test(m)
afirmar(vivoIgual(montajeVivo) && /: chatbot\.config\)/.test(companion), '  el sitio vivo no pasa nada: sin `overrides` la config ES la del bot (mismo objeto), y el widget se ve como siempre')
controlPositivo('  el detector ve el sitio vivo con algo fijado', montajeVivo.replace('<LogicCompanion slug={WIDGET_SLUG} />', '<LogicCompanion slug={WIDGET_SLUG} overrides={{ avatarStyle: "onda" }} />'), vivoIgual)
afirmar(/<LogicCompanion slug=\{SLUG_DEL_CHAT\} overrides=\{APARIENCIA_DEL_CHAT\} \/>/.test(fuenteDelChat), '  /v3 se lo pasa: el bot del sitio con su apariencia ([C2-21] una constante, sin bandera)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El lugar: abajo a la derecha, sin pisar el chrome en ningún ancho (los tokens)')

const medidas = medidasDelChat(companion, sinComentarios(leer('src/modules/chatbot/components/tooltip/ProactiveTooltip.tsx')))
afirmar(medidas.margen === 24 && medidas.lado === 56, `su lugar de antes, leído del widget: a ${String(medidas.margen)} px de los dos bordes (o la zona segura), ${String(medidas.lado)} px; el globo encima, a ${String(medidas.aireDelGlobo)} px, de hasta min(${String(medidas.globoMaxPx)} px, ${String(medidas.globoMaxVw)} vw)`)
const esquina = sinComentarios(leer(`${V3}/_chrome/sonido/EsquinaDelSonido.tsx`))
const control = sinComentarios(leer(`${V3}/_chrome/sonido/ControlDelSonido.tsx`))
const menu = sinComentarios(leer(`${V3}/_chrome/menu/MenuMovil.tsx`))
const barraCss = leer(`${V3}/_estilos/barra.css`)
const barra = sinComentarios(leer(`${V3}/_chrome/barra/BarraDelHome.tsx`))
const ARRIBA = 'max(var(--spacing-4),env(safe-area-inset-top))'
const elModeloSigue =
  esquina.includes(clase('top', ARRIBA)) && esquina.includes(clase('left', 'max(var(--spacing-4),env(safe-area-inset-left))')) && esquina.includes(clase('escritorio:top', 'var(--spacing-6)')) && esquina.includes(clase('escritorio:left', 'var(--pad-lateral-compacto)')) &&
  control.includes(clase('max-escritorio:size', 'var(--spacing-12)')) && control.includes(clase('escritorio:size', 'calc(var(--spacing-3)*2+var(--text-cuerpo)*var(--leading-texto))')) && control.includes(clase('mt', 'var(--spacing-2)')) &&
  menu.includes(`inset-x-0 ${clase('top', ARRIBA)} mx-auto grid ${clase('size', 'var(--spacing-12)')}`) &&
  barraCss.includes('--barra-reposo: var(--spacing-6);') && barraCss.includes('--barra-alto: calc(var(--spacing-3) * 2 + var(--text-cuerpo) * var(--leading-texto));') && barraCss.includes('--barra-margen-al-pie: var(--spacing-6);') &&
  /left: 50%;\s*transform: translateX\(-50%\);/.test(barraCss) && /right: var\(--pad-lateral-compacto\);\s*display: flex;\s*align-items: center;\s*gap: var\(--spacing-2\);/.test(barraCss) && barraCss.includes('padding-inline: var(--spacing-2) var(--spacing-1);') && barraCss.includes('padding-inline: var(--spacing-3);') &&
  CLASE_DE_LA_PASTILLA_APAGADA === 'max-medio:invisible' && barra.includes('>= AIRE_DE_LA_ESQUINA') && BREAKPOINTS.medio === 860 && BREAKPOINTS.escritorio === 1024
afirmar(elModeloSigue, '  el modelo describe el chrome de hoy: el parlante y su cartel, el menú, la píldora (centrada, desde `medio` y sólo si entra con la esquina) y Contacto y Login, con sus tokens')

const aire = aireDeLaEsquina(barra)
const pisadas = (cuadros: readonly Cuadro[], chat: (c: Cuadro) => Caja[]): string[] => cuadros.flatMap((c) => loQuePisa(c, chat(c), cajasDelChrome(c, aire)))
const delChat = (m: MedidasDelChat) => (c: Cuadro): Caja[] => cajasDelChat(c, m)
const conChat = pisadas(CUADROS, delChat(medidas))
afirmarIgual(conChat, [], `el botón y su globo no pisan el chrome ni se salen, en ${CUADROS.map((c) => `${String(c.ancho)}×${String(c.alto)}`).join(', ')}`)
const holgura = Math.min(...CUADROS.filter((c) => c.ancho >= BREAKPOINTS.medio).map((c) => {
  const pildora = cajasDelChrome(c, aire).find((k) => k.pieza === 'píldora (al pie)')
  return (cajasDelChat(c, medidas)[0]?.x0 ?? 0) - (pildora?.x1 ?? 0)
}))
afirmar(holgura >= tokenPx('--spacing-2', 1440), `  lo más cerca que queda de la píldora al pie (desde 860, con la esquina más angosta posible): ${holgura.toFixed(0)} px a lo ancho`)
controlPositivo('  el modelo ve el chat al centro, abajo (pisa la píldora al pie)', (c: Cuadro) => cajasDelChat(c, medidas).map((k) => ({ ...k, x0: k.x0 - c.ancho / 2 + 40, x1: k.x1 - c.ancho / 2 + 40 })), (f: (c: Cuadro) => Caja[]) => pisadas(CUADROS, f).length === 0)
controlPositivo('  el modelo ve el chat arriba a la izquierda (pisa el parlante)', (c: Cuadro) => [{ pieza: 'chat', x0: 20, x1: 76, y0: 20, y1: 76 }].concat(cajasDelChat(c, medidas).slice(1)), (f: (c: Cuadro) => Caja[]) => pisadas(CUADROS, f).length === 0)
controlPositivo('  el modelo ve el aviso de reintento del sitio vivo (240 px de ancho) pisando la píldora al pie a 1024', delChat({ ...medidas, lado: 240 }), (f: (c: Cuadro) => Caja[]) => pisadas(CUADROS, f).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El apilado: en el alto del chrome, encerrado, debajo de lo que tapa la página')

const z = (token: string): number => Number(tokenPx(token, 1440))
const zDe = (fuente: string, pieza: string): number | null => {
  const m = new RegExp(`data-pieza="${pieza}"[^>]*?className="[^"]*?\\bz-\\[([^\\]]+)\\]`).exec(fuente)
  if (m === null) return null
  const v = m[1].replace(/var\((--z-[a-z]+)\)/g, (_s: string, t: string) => String(z(t)))
  const calc = /^calc\((\d+)([+-])(\d+)\)$/.exec(v)
  return calc === null ? Number(v) : calc[2] === '+' ? Number(calc[1]) + Number(calc[3]) : Number(calc[1]) - Number(calc[3])
}
const encima = (chat: string): boolean => {
  const del = zDe(chat, 'chat-del-sitio')
  const tapan = [
    zDe(leer(`${V3}/_chrome/ingreso/HojaDelIngreso.tsx`), 'ingreso'),
    zDe(leer(`${V3}/_chrome/contacto/FormularioDeContacto.tsx`), 'contacto'),
    zDe(leer(`${V3}/_chrome/menu/MenuMovil.tsx`), 'menu-movil'),
    zDe(leer(`${V3}/_secciones/trabajos/demos/VentanaDeDemo.tsx`), 'dialogo-de-demo'),
    zDe(leer(`${V3}/_componentes/VeloDeCarga.tsx`), 'velo-de-carga'),
    zDe(leer(`${V3}/_chrome/preloader/PreloaderDelSitio.tsx`), 'preloader'),
  ]
  const velo = zDe(leer(`${V3}/_chrome/velo/VeloDeNavegacion.tsx`), 'velo-de-navegacion')
  const encerrado = new RegExp(`data-pieza="chat-del-sitio" className="fixed ${clase('z', 'var\\(--z-cabecera\\)').replace(/[[\]]/g, '\\$&')}"`).test(chat)
  return del !== null && velo !== null && encerrado && velo < del && tapan.every((t) => t !== null && del < t)
}
afirmar(encima(fuenteDelChat), `en --z-cabecera (${String(z('--z-cabecera'))}) y fijo, sin tamaño: encierra las capas propias del widget; encima del velo de la navegación, debajo del login (B7), el contacto, el menú, una demo, el velo de carga y el preloader (B12c)`)
controlPositivo('  el detector ve el chat encima del login', fuenteDelChat.replace(clase('z', 'var(--z-cabecera)'), clase('z', 'calc(var(--z-overlay)+2)')), encima)
controlPositivo('  el detector ve el envoltorio sin capa propia (las del widget, cerca del máximo, quedarían sueltas)', fuenteDelChat.replace(` ${clase('z', 'var(--z-cabecera)')}`, ''), encima)

cerrar('s87-chat')
