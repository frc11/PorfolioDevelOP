/**
 * INVARIANTE — Los momentos de las tres páginas de servicio. **[M3]**
 *
 * Corre con `npm run test:s94-m3-momentos` (lo sumó M-INT; `verificar` lo corre). Los demás de `_servicios` siguen a mano con `npx tsx`.
 *
 * Afirma la CUENTA de cada momento (pura) y el MARCADO que sirve la página (`renderToStaticMarkup` de la intro y el cuerpo), cada
 * comprobación con su control positivo (el mismo detector contra una entrada armada para fallar):
 *   §1 web: las fases encadenadas y monótonas, el plano de cada trabajo, la repetición que nunca pasa al scroll, el marco que termina
 *      en teléfono, el menú con los tres trabajos y los videos sin `src`, `poster` ni `autoplay` en el HTML;
 *   §2 software: el tachado y lo nuevo con UN avance; el tablero sin solapes (al final y al principio) y sin saltos;
 *   §3 IA: un solo `h1` en la página, el chat sin encabezados y sin el cian del panel, el tilde con histéresis y el tic con sus ramas.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { PREGUNTAS_SUGERIDAS } from '../../_panel-vivo/demos/chatbot/datos'
import { PROYECTOS } from '../../_secciones/trabajos/proyectos'
import { IA_Y_AUTOMATIZACIONES } from '../datos/ia-y-automatizaciones'
import { PAGINAS_WEB } from '../datos/paginas-web'
import { SOFTWARE_A_MEDIDA } from '../datos/software-a-medida'
import { Intro } from '../Intro'
import { avanceClavado, avanceDelCruce } from '../momentos/avance'
import { TAREAS, debeSonar, tildeSiguiente } from '../momentos/atiende/datos'
import { trabajosDeLaPantalla } from '../momentos/MomentoDelServicio'
import { ANCHO_DEL_PAPEL, FRANJA_DE_LAS_CABECERAS, LUGARES, PAPELES, TABLERO, avanceDelRenglon, papelEn } from '../momentos/orden/datos'
import { LIENZO, PLANOS, TRAMOS, avanceDeLaTraza, avanceMostrado, fasesDe, medidasDelMarco, repeticionTerminada } from '../momentos/pantalla/planos'
import { CuerpoDelServicio } from '../PaginaDeServicio'
import type { Servicio } from '../tipos'

const pagina = (s: Servicio): string => renderToStaticMarkup(<><Intro servicio={s} /><CuerpoDelServicio servicio={s} enDesarrollo={false} /></>)
const WEB = pagina(PAGINAS_WEB)
const SOFTWARE = pagina(SOFTWARE_A_MEDIDA)
const IA = pagina(IA_Y_AUTOMATIZACIONES)
const muestras = (n: number): number[] => Array.from({ length: n + 1 }, (_, i) => i / n)
/** El marcado de un bloque por su `data-bloque` (hasta el cierre de su `<section>`, contando las anidadas). */
function bloque(html: string, nombre: string): string {
  const inicio = html.indexOf(`data-bloque="${nombre}"`)
  if (inicio < 0) return ''
  const desde = html.lastIndexOf('<section', inicio)
  let nivel = 0
  const re = /<section\b|<\/section>/g
  re.lastIndex = desde
  for (let m = re.exec(html); m !== null; m = re.exec(html)) {
    nivel += m[0] === '</section>' ? -1 : 1
    if (nivel === 0) return html.slice(desde, m.index + m[0].length)
  }
  return html.slice(desde)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('0 · La lectura del scroll')

afirmarIgual([avanceClavado(0, 3000, 1000), avanceClavado(-1000, 3000, 1000), avanceClavado(-2000, 3000, 1000), avanceClavado(-5000, 3000, 1000), avanceClavado(500, 3000, 1000)], [0, 0.5, 1, 1, 0], 'clavado: 0 con el tope arriba, 1 con el final abajo, acotado a los dos lados')
afirmarIgual([avanceDelCruce(900, 1000), avanceDelCruce(450, 1000), avanceDelCruce(2000, 1000), avanceDelCruce(-50, 1000)], [0, 1, 0, 1], 'cruce: 0 con el tope en el 90 % del alto, 1 en el 45 %, acotado')
afirmar(avanceClavado(0, 800, 1000) === 1, 'un tramo más bajo que la pantalla da 1 (no divide por cero)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Desarrollo web: la pantalla que se dibuja y luego es un celular')

const fases = muestras(400).map(fasesDe)
const monotona = (xs: readonly number[]): boolean => xs.every((x, i) => i === 0 || x >= xs[i - 1] - 1e-9)
afirmar((['dibujado', 'abierto', 'angostado', 'cruce', 'fase'] as const).every((k) => monotona(fases.map((f) => f[k]))), 'las cinco medidas suben con el scroll y nunca vuelven atrás (al subir, se desarman por el mismo camino)')
controlPositivo('  el detector ve una medida que retrocede', [0, 0.4, 0.3, 1], monotona)
const encadenados = TRAMOS.dibujo[1] <= TRAMOS.apertura[0] && TRAMOS.apertura[1] <= TRAMOS.angostado[0] && TRAMOS.cruce[0] >= TRAMOS.angostado[0] && TRAMOS.cruce[1] <= TRAMOS.angostado[1]
afirmar(encadenados, 'A y después B, un solo movimiento: el plano se dibuja, la pantalla se abre, y recién después el marco se angosta (el cruce de videos, adentro del angostamiento)')
const f0 = fasesDe(0)
const f1 = fasesDe(1)
afirmarIgual([f0.dibujado, f0.abierto, f0.angostado, f0.cruce, f1.dibujado, f1.abierto, f1.angostado, f1.cruce], [0, 0, 0, 0, 1, 1, 1, 1], 'arranca en nada y termina con todo: dibujado, abierto, angostado y en el video del celular')
afirmar(fases.every((f) => f.abierto === 0 || f.dibujado === 1), 'la pantalla real se abre recién con el plano entero dibujado')
const trazas = 12
afirmar(muestras(60).every((d) => { const a = muestras(trazas).slice(0, trazas).map((_, i) => avanceDeLaTraza(d, i, trazas)); return a.every((x, i) => i === 0 || x <= a[i - 1]) }), 'las trazas se dibujan una después de la otra, en el orden de lectura (ninguna adelanta a la anterior)')

afirmarIgual(Object.keys(PLANOS).sort(), PROYECTOS.map((p) => p.slug).sort(), 'cada trabajo de PROYECTOS tiene su plano (ninguno genérico)')
const dentroDelLienzo = (p: (typeof PLANOS)[keyof typeof PLANOS]): boolean =>
  p.trazas.every((t) => t.t === 'linea' ? [t.x1, t.x2].every((x) => x >= 0 && x <= LIENZO.ancho) && [t.y1, t.y2].every((y) => y >= 0 && y <= LIENZO.alto) : t.t === 'rect' ? t.x >= 0 && t.y >= 0 && t.x + t.w <= LIENZO.ancho && t.y + t.h <= LIENZO.alto : t.t === 'circulo' ? t.cx - t.r >= 0 && t.cx + t.r <= LIENZO.ancho : true) &&
  p.rotulos.every((r) => r.despues >= 0 && r.despues < p.trazas.length && r.x >= 0 && r.x < LIENZO.ancho && r.y >= 0 && r.y < LIENZO.alto)
afirmar(Object.values(PLANOS).every(dentroDelLienzo), '  y cada traza y cada rótulo caen adentro del lienzo de 1440 × 900, con el rótulo atado a una traza que existe')
controlPositivo('  el detector ve una traza que se sale', { trazas: [{ t: 'rect', x: 1300, y: 0, w: 200, h: 10 }], rotulos: [] }, dentroDelLienzo)

const sinPasarse = muestras(20).every((s) => [0, 100, 600, 1300, 2600, 9000].every((ms) => { const v = avanceMostrado(s, ms); return v >= 0 && v <= s + 1e-9 }))
afirmar(sinPasarse, 'al cambiar de trabajo la repetición va de 0 al avance del scroll y nunca lo pasa')
afirmar(muestras(20).every((s) => avanceMostrado(s, 0) === 0 && avanceMostrado(s, 60000) === s && repeticionTerminada(s, 60000)), '  arranca en 0 y termina EXACTAMENTE en el scroll (no salta al terminar)')
afirmar(muestras(20).every((s) => avanceMostrado(s, null) === s), '  sin cambio, lo que se ve es el scroll')
controlPositivo('  el detector ve una repetición que se pasa', (s: number, ms: number) => Math.min(1, s * 1.2 * Math.min(1, ms / 1000)), (f: (s: number, ms: number) => number) => muestras(20).every((s) => [0, 500, 2000].every((ms) => f(s, ms) <= s + 1e-9)))

const marcos = [[900, 600], [1100, 700], [358, 520], [700, 640]].map(([w, h]) => ({ w, h, a: medidasDelMarco(w, h, 0), b: medidasDelMarco(w, h, 1) }))
afirmar(marcos.every(({ w, h, a, b }) => a.ancho <= w + 1e-6 && a.alto <= h + 1e-6 && Math.abs(a.ancho / a.alto - 1.6) < 1e-6 && b.ancho <= w + 1e-6 && b.alto <= h + 1e-6 && b.alto / b.ancho > 2), 'el marco entra en su caja en las dos puntas: de escritorio (16:10) a teléfono (más del doble de alto que de ancho)')

const menu = /role="group" aria-label="Elegí el trabajo"[\s\S]*?<\/ul>/.exec(WEB)?.[0] ?? ''
const botones = [...menu.matchAll(/<button[^>]*aria-pressed="(true|false)"[^>]*>([\s\S]*?)<\/button>/g)]
afirmarIgual(botones.map((b) => /<span class="truncate[^"]*">([^<]*)<\/span>/.exec(b[2])?.[1]), trabajosDeLaPantalla(PAGINAS_WEB).map((t) => t.nombre), 'el menú tiene los tres trabajos de la página, en su orden')
afirmarIgual(botones.map((b) => b[1]), ['true', 'false', 'false'], '  con el primero elegido (`aria-pressed`)')
afirmarIgual(trabajosDeLaPantalla(PAGINAS_WEB).map((t) => t.slug), ['el-garage', 'esquina-estudio', 'banu-scents'], '  que son los tres de PROYECTOS')
const videosDeLaPantalla = [...bloque(WEB, 'la-pantalla').matchAll(/<video\b[^>]*>/g)].map((m) => m[0])
const videosQuietos = (vs: readonly string[]): boolean => vs.length === 2 && vs.every((v) => !/\s(src|poster|autoplay)=/.test(v) && /preload="none"/.test(v) && /\smuted/.test(v) && /\sloop/.test(v) && /\splaysinline/i.test(v))
afirmar(videosQuietos(videosDeLaPantalla), 'los dos videos (escritorio y celular) salen sin src, sin póster y sin autoplay, mudos, en bucle, en línea y sin precarga: se piden al acercarse', `${String(videosDeLaPantalla.length)} videos`)
controlPositivo('  un video con autoplay se detecta', ['<video autoplay="" muted="" preload="none">', '<video muted="" preload="none">'], videosQuietos)
afirmar(bloque(SOFTWARE, 'la-pantalla') === '' && bloque(IA, 'la-pantalla') === '', 'la pantalla es sólo de Desarrollo web')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Software a medida: el tachado simultáneo y el tablero')

const tachado = bloque(SOFTWARE, 'lo-de-siempre')
afirmarIgual((tachado.match(/data-trazo="tachado"/g) ?? []).length, 4, 'cuatro renglones, cada uno con el tachado del titular de Quiénes somos (`data-trazo="tachado"`, la raya de trazo.css)')
afirmar(muestras(50).every((v) => avanceDelRenglon(v) >= 0 && avanceDelRenglon(v) <= 1) && avanceDelRenglon(0) === 0 && avanceDelRenglon(1) === 1, 'un solo valor por renglón mueve las dos cosas (la raya y lo nuevo), de 0 a 1: simultáneos por construcción')
afirmar(/data-parte="linea"/.test(tachado) && !/style="[^"]*scale/.test(tachado), '  sin JS (y con movimiento reducido) sale tachado y con lo nuevo a la vista: ninguna transformada ni recorte en el HTML')
controlPositivo('  un tachado que sale a medio dibujar se detecta', '<span data-trazo="tachado">x<span data-parte="linea" style="transform:scaleX(0)"></span></span>', (h: string) => /data-parte="linea"/.test(h) && !/style="[^"]*scale/.test(h))

type Caja = { readonly x: number; readonly y: number; readonly w: number; readonly h: number }
const seTocan = (a: Caja, b: Caja): boolean => a.x < b.x + b.w - 1e-6 && b.x < a.x + a.w - 1e-6 && a.y < b.y + b.h - 1e-6 && b.y < a.y + a.h - 1e-6
const sinSolapes = (cajas: readonly Caja[]): boolean => cajas.every((a, i) => cajas.every((b, j) => j <= i || !seTocan(a, b)))
const cajaDe = (x: number, y: number): Caja => ({ x, y, w: ANCHO_DEL_PAPEL, h: TABLERO.alto })
afirmar(sinSolapes(LUGARES.map((l) => cajaDe(l.x, l.y))), 'al final, ningún papel pisa a otro (en % de la mesa: vale en cualquier proporción)')
afirmar(sinSolapes(PAPELES.map((p) => cajaDe(p.x, p.y))), 'al principio, tirados, tampoco (sin el giro): el desorden es de lugar y de ángulo, no una pila ilegible')
afirmar([...LUGARES.map((l) => cajaDe(l.x, l.y)), ...PAPELES.map((p) => cajaDe(p.x, p.y))].every((c) => c.x >= 0 && c.y >= 0 && c.x + c.w <= 100 + 1e-6 && c.y + c.h <= 100 + 1e-6), 'y todos quedan adentro de la mesa, al principio y al final')
afirmar(LUGARES.every((l) => l.y >= TABLERO.cabecera), '  y abajo de la cabecera de su columna')
afirmar(PAPELES.every((p) => p.y >= FRANJA_DE_LAS_CABECERAS), '  [revisión] tirados, ninguno arranca encima de las cabeceras de las columnas (no pisa «En curso»)')
controlPositivo('  un papel tirado sobre la cabecera se detecta', [{ y: 3 }], (ps: { y: number }[]) => ps.every((p) => p.y >= FRANJA_DE_LAS_CABECERAS))
controlPositivo('  dos papeles en el mismo lugar se detectan', [cajaDe(10, 10), cajaDe(20, 15)], sinSolapes)
const paso = 1 / 2000
const maxSalto = Math.max(...PAPELES.map((_, i) => Math.max(...muestras(2000).slice(1).map((v) => { const a = papelEn(i, v - paso); const b = papelEn(i, v); return Math.hypot(b.x - a.x, b.y - a.y) }))))
afirmar(maxSalto < 0.5, 'ningún papel se teletransporta: entre dos lecturas del scroll muy cercanas, se mueve menos de medio punto de la mesa', `máximo ${maxSalto.toFixed(3)} % por 1/2000 de recorrido`)
afirmar(PAPELES.every((_, i) => { const a = papelEn(i, 0); const b = papelEn(i, 1); return a.x === PAPELES[i].x && a.giro === PAPELES[i].giro && b.x === LUGARES[i].x && b.y === LUGARES[i].y && b.giro === 0 && b.llego }), 'arrancan donde están tirados y terminan en su lugar, derechos y apoyados')
controlPositivo('  el detector de saltos ve un papel que salta', 3, (s: number) => s < 0.5)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Integraciones con IA: el chat, las automatizaciones y «pasa solo»')

const h1s = (html: string): number => (html.match(/<h1(?=[\s>])/g) ?? []).length
afirmarIgual([h1s(WEB), h1s(SOFTWARE), h1s(IA)], [1, 1, 1], 'un solo h1 en cada página, el de la intro (el prototipo 5 tenía tres)')
controlPositivo('  un segundo h1 se detecta', `${IA}<h1>Un chatbot</h1>`, (h: string) => h1s(h) === 1)
const chat = bloque(IA, 'el-chat')
afirmar(/data-pieza="boton-pausa"[^>]*aria-label="Pausar la conversación de ejemplo"|aria-label="Pausar la conversación de ejemplo"[^>]*data-pieza="boton-pausa"/.test(chat), '[revisión] la conversación que se mueve sola tiene su pausa (WCAG 2.2.2): la del home, para el teclado')
controlPositivo('  un chat sin pausa se detecta', chat.replace(/data-pieza="boton-pausa"/g, ''), (h: string) => /data-pieza="boton-pausa"[^>]*aria-label="Pausar la conversación de ejemplo"|aria-label="Pausar la conversación de ejemplo"[^>]*data-pieza="boton-pausa"/.test(h))
afirmar(chat.includes('data-chat-que-atiende') && !/<h[1-6][\s>]/.test(chat.replace(/^[\s\S]*?data-chat-que-atiende/, '')), 'el chat es una ventana de chat (sin encabezados adentro), no el panel')
afirmar(!/cyan|zinc|MarcoDelPanel|data-demo/.test(chat), '  sin el cian ni el gris del panel ni su marco: el acento es el de la página')
controlPositivo('  el cian del panel se detecta', '<div class="border-cyan-500/30">', (h: string) => !/cyan|zinc|MarcoDelPanel|data-demo/.test(h))
afirmar(/Respuestas de ejemplo/.test(chat) && PREGUNTAS_SUGERIDAS.every((p) => chat.includes(p.pregunta)), '  dice que las respuestas son de ejemplo y se prueba con las preguntas del negocio de ejemplo del panel (no un guion propio con afirmaciones nuevas); el guion arranca vacío y corre a la vista')
const auto = bloque(IA, 'automatizaciones')
afirmarIgual((auto.match(/data-tarea=""/g) ?? []).length, TAREAS.length, 'el módulo de automatizaciones tiene la lista de tareas que pasan solas')
afirmar(!/\d+\s?%|\bUSD\b|\$\s?\d/.test(auto), '  sin cifras ni precios inventados')

const TRAYECTO_DEL_TILDE = [0, 0.5, 1, 0.5, 0.2, 0, 0.5]
const conHisteresis = (siguiente: (h: boolean, a: number) => boolean): boolean => {
  let h = false
  return JSON.stringify(TRAYECTO_DEL_TILDE.map((a) => (h = siguiente(h, a)))) === JSON.stringify([false, false, true, true, true, false, false])
}
afirmar(conHisteresis(tildeSiguiente), 'el tilde tiene histéresis: se tilda al pasar la línea de arriba y se destilda recién al volver debajo de la de abajo (no titila)')
controlPositivo('  un tilde sin histéresis se detecta', (_h: boolean, a: number) => a >= 0.5, conHisteresis)
const ramas = [
  { reducido: false, antes: false, ahora: true, aLaVista: true, suena: true },
  { reducido: true, antes: false, ahora: true, aLaVista: true, suena: false },
  { reducido: false, antes: true, ahora: false, aLaVista: true, suena: false },
  { reducido: false, antes: false, ahora: true, aLaVista: false, suena: false },
  { reducido: false, antes: true, ahora: true, aLaVista: true, suena: false },
]
afirmarIgual(ramas.map((r) => debeSonar(r)), ramas.map((r) => r.suena), 'el tic suena sólo al tildarse, con movimiento y a la vista; con movimiento reducido, al destildar o en un salto, no (el sonido apagado lo calla el bus)')
controlPositivo('  un tic que ignora el movimiento reducido se detecta', (m: { reducido: boolean; antes: boolean; ahora: boolean; aLaVista: boolean }) => !m.antes && m.ahora && m.aLaVista, (f: typeof debeSonar) => !f({ reducido: true, antes: false, ahora: true, aLaVista: true }))

cerrar('momentos')
