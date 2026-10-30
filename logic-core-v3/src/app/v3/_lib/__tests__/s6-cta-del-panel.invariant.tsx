/**
 * INVARIANTE — [C2 · 60c] EL CTA DEL PANEL (la tarea 60 de la cola 2, «El CTA del Panel»; el cuerpo del Panel es de `s6-tu-panel`).
 *
 * Renderiza el CTA REAL a HTML en sus dos ramas (sin y con coreografía) y afirma sobre el marcado; el reposo y los gestos del botón,
 * el cuerpo que viaja a la newsletter y la entrada del gatillo se afirman contra los datos y las funciones puras que usan los
 * componentes. Lo que sólo ve el navegador (el renglón real de «acá.» en cada ancho, la escala del botón cuadro por cuadro, el hover
 * y el apretón, los envíos con la ruta interceptada) lo mide el banco `scripts-carga/cta-del-panel.ts`. Cada detector corre además
 * contra una entrada rota (control positivo). Esta prueba nunca llama a `/api/newsletter`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RAIZ } from './s3-archivos'
import { quitarComentarios } from './s3-escaneo'
import { marcar } from '../../_secciones/_invariantes/render'
import { AL_PROBAR, BOTON_DE_PROBAR, fotogramasDelReposo, type NumerosDelReposo } from '../../_secciones/tu-panel/BotonDeProbar'
import { CTA, NEWSLETTER, textoDe } from '../../_secciones/tu-panel/contenido'
import { CtaDelPanel } from '../../_secciones/tu-panel/CtaDelPanel'
import { focalizablesDe, sinLaOpacidadDelEnvio, textoAccesible } from '../../_secciones/tu-panel/deteccion'
import { cuerpoDelNewsletter } from '../../_secciones/tu-panel/NewsletterDelPanel'

const leer = (ruta: string): string => readFileSync(path.join(RAIZ, ruta), 'utf8').replace(/\r\n/g, '\n')
const V3 = 'src/app/v3'
const fuente = (nombre: string): string => quitarComentarios(leer(`${V3}/_secciones/tu-panel/${nombre}`))
const QUIETO = marcar(<CtaDelPanel />, { anima: false })
const ANIMADO = marcar(<CtaDelPanel />, { anima: true })
const plano = (t: string): string => t.replace(/\s+/g, ' ').trim()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los textos, tal cual 05-TEXTOS («El CTA del Panel» y el aviso)')

const TEXTOS = leer('docs/cola/2026-10-23/05-TEXTOS.md')
/** Los textos entre «» de la sección del CTA del Panel, y el del aviso de scroll del CTA. */
function textosPedidos(doc: string): string[] {
  const seccion = /### El CTA del Panel\n([\s\S]*?)(?=\n## )/.exec(doc)?.[1] ?? ''
  const aviso = /- CTA del Panel: \*\*«([^»]+)»\*\*/.exec(doc)?.[1]
  return [...[...seccion.matchAll(/«([^»]+)»/g)].map((m) => m[1]), ...(aviso === undefined ? [] : [aviso])]
}
const PEDIDOS = textosPedidos(TEXTOS)
afirmar(PEDIDOS.length === 14, `la tarea pide ${String(PEDIDOS.length)} textos (el titular, la bajada, la izquierda, el botón, el divisor, la derecha, los campos y el aviso)`)
/** Lo que falta en el CTA: el titular se compara en mayúsculas (lo escribe la hoja); el aviso es decorativo y se busca en el marcado. */
function faltantes(pedidos: readonly string[], html: string): string[] {
  const accesible = plano(textoAccesible(html))
  const titular = textoDe(CTA.titular).toUpperCase()
  return pedidos.filter((t) => (t === t.toUpperCase() && /[A-Z]/.test(t) ? t !== titular : !accesible.includes(t) && !html.includes(t)))
}
for (const [rama, html] of [['sin coreografía', QUIETO], ['con coreografía', ANIMADO]] as const) {
  afirmarIgual(faltantes(PEDIDOS, html), [], `${rama}: cada texto pedido está en el CTA, tal cual`)
}
afirmar(plano(textoAccesible(QUIETO)).includes(`${CTA.probar.texto} ${CTA.probar.remate}`), '  «Probala acá.» se anuncia de corrido (el bloque de «acá.» no lo parte para el lector)')
controlPositivo('  el detector VE un texto cambiado', textosPedidos(TEXTOS.replace('«Probar ahora»', '«Probalo ya»')), (p: readonly string[]) => faltantes(p, QUIETO).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · «acá.» solo en el último renglón, forzado por la estructura')

/** El párrafo de «Probar el panel»: el texto y, como último hijo, «acá.» en un bloque propio (un bloque empieza renglón y lo termina). */
function acaSolo(html: string): boolean {
  const m = /<p[^>]*>([^<]*)<span data-parte="remate-del-texto" class="([^"]*)">([^<]*)<\/span><\/p>/.exec(html)
  return m !== null && plano(m[1]) === CTA.probar.texto && m[3] === CTA.probar.remate && m[2].split(/\s+/).includes('block')
}
afirmar(acaSolo(QUIETO) && acaSolo(ANIMADO), '«acá.» es el último hijo del párrafo, en un bloque propio: cae solo en su renglón en cualquier ancho')
controlPositivo('  el detector VE «acá.» en línea (dependería del ancho)', QUIETO.replace(/(data-parte="remate-del-texto" class="[^"]*)\bblock\b/, '$1inline'), acaSolo)
controlPositivo('  el detector VE algo después de «acá.» en el mismo párrafo', QUIETO.replace(`${CTA.probar.remate}</span></p>`, `${CTA.probar.remate}</span> y más</p>`), acaSolo)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las columnas, el divisor con «o si no» y el orden (una columna abajo de 1024)')

const ORDEN = ['data-pieza="titulo-que-se-pinta"', 'data-pieza="bajada-del-cta"', 'data-pieza="columna-probar"', 'data-pieza="flecha-punteada"', 'data-pieza="probar-ahora"', 'data-pieza="o-del-cta"', 'data-pieza="columna-novedades"', 'data-pieza="form-de-novedades"', 'data-pieza="aviso-de-scroll"']
const enOrden = (html: string): boolean => ORDEN.every((a, i) => html.indexOf(a) >= 0 && (i === 0 || html.indexOf(a) > html.indexOf(ORDEN[i - 1])))
afirmar(enOrden(QUIETO) && enOrden(ANIMADO), 'en orden: el titular, la bajada, «Probar el panel» (la flecha y el botón), el divisor, las novedades (su form) y el aviso')
controlPositivo('  el detector VE las novedades antes que «Probar el panel»', QUIETO.replace('data-pieza="columna-probar"', 'data-pieza="x"').replace('data-pieza="columna-novedades"', 'data-pieza="columna-probar"'), enOrden)
const clasesDe = (html: string, pieza: string): string[] => (new RegExp(`data-pieza="${pieza}" class="([^"]*)"`).exec(html)?.[1] ?? '').split(/\s+/)
const fila = clasesDe(QUIETO, 'fila-del-cta')
afirmar(['flex', 'flex-col', 'escritorio:flex-row', 'escritorio:items-stretch'].every((c) => fila.includes(c)), 'la fila: apilada abajo de 1024 (teléfono y tablet) y en dos columnas desde 1024, del mismo alto')
/** El divisor: dos tramos con «o si no» en el hueco, acostado abajo de 1024 y parado desde 1024, del alto de las columnas. */
function divisorBien(html: string): boolean {
  const caja = /<div data-pieza="o-del-cta" class="([^"]*)">([\s\S]*?)<\/div>/.exec(html)
  if (caja === null) return false
  const clases = caja[1].split(/\s+/)
  const tramos = [...caja[2].matchAll(/<span aria-hidden="true" data-parte="tramo" class="([^"]*)"><\/span>/g)].map((m) => m[1].split(/\s+/))
  const hueco = /<\/span><p[^>]*>([^<]*)<\/p><span/.exec(caja[2])?.[1]
  return clases.includes('escritorio:flex-col') && !clases.includes('flex-col') && clases.includes('escritorio:h-full') && tramos.length === 2 && tramos.every((t) => ['h-px', 'flex-1', 'escritorio:w-px', 'escritorio:h-auto'].every((c) => t.includes(c))) && hueco === CTA.o
}
afirmar(divisorBien(QUIETO), 'el divisor: una línea que en el medio se corta y deja «o si no» en el hueco; acostada abajo de 1024, parada desde 1024')
controlPositivo('  el detector VE una línea entera, sin hueco', QUIETO.replace(/(<div data-pieza="o-del-cta"[^>]*>)<span[^>]*><\/span><p[^>]*>[^<]*<\/p>/, '$1'), divisorBien)
controlPositivo('  el detector VE el divisor parado también en el teléfono', QUIETO.replace(/(data-pieza="o-del-cta" class=")/, '$1flex-col '), divisorBien)
const gatilloDelDivisor = /<div data-gatillo="[^"]*" class="([^"]*)"><div[^>]*><div data-pieza="o-del-cta"/.exec(ANIMADO)?.[1].split(/\s+/) ?? []
afirmar(gatilloDelDivisor.includes('escritorio:self-stretch') && gatilloDelDivisor.includes('escritorio:flex-row'), '  el gatillo del divisor se estira al alto de la fila (y su hijo con él): la línea va de arriba abajo de las columnas')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La bajada, las columnas y el divisor entran desde abajo (el gatillo del contrato), sin el deslizamiento lateral')

const CTA_FUENTE = fuente('CtaDelPanel.tsx')
const GATILLO = quitarComentarios(leer(`${V3}/_secciones/_contrato/Gatillo.tsx`))
const desdeAbajo = (cta: string, gatillo: string): boolean => {
  const bloque = /const CLASES_DESDE_ABAJO[^=]*= \{([\s\S]*?)\n\}/.exec(gatillo)?.[1] ?? ''
  const todos = cta.match(/<Gatillo\b/g)?.length ?? 0
  return todos === 4 && (cta.match(/<Gatillo desde="abajo"/g)?.length ?? 0) === todos && /espera: 'translate-y-8 opacity-0'/.test(bloque) && /ido: 'translate-y-8 opacity-0 /.test(bloque) && !/translate-x/.test(bloque) && /desde === 'abajo' \? CLASES_DESDE_ABAJO : CLASES_DEL_ESTADO/.test(gatillo)
}
afirmar(desdeAbajo(CTA_FUENTE, GATILLO), 'los cuatro gatillos del CTA (la bajada, las dos columnas, el divisor) llegan desde abajo, en su lugar, y se van igual')
controlPositivo('  el detector VE una pieza que todavía entra de costado', [CTA_FUENTE.replace('<Gatillo desde="abajo"', '<Gatillo'), GATILLO] as const, ([c, g]: readonly [string, string]) => desdeAbajo(c, g))
controlPositivo('  el detector VE un «desde abajo» que en verdad se corre de costado', [CTA_FUENTE, GATILLO.replace("espera: 'translate-y-8 opacity-0'", "espera: 'translate-x-8 opacity-0'")] as const, ([c, g]: readonly [string, string]) => desdeAbajo(c, g))
afirmar(/const CLASES_DEL_ESTADO[^=]*= \{\s*quieto: '',\s*espera: 'translate-x-8 opacity-0',/.test(GATILLO) && /desde = 'costado'/.test(GATILLO), '  sin la prop, el gatillo sigue entrando de costado: los demás usos no cambian')
afirmarIgual((ANIMADO.match(/data-gatillo="quieto"/g) ?? []).length, 4, '  servido, los cuatro quietos y a la vista (la máquina arranca en el navegador)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · «Probar ahora»: grande, redondo, el reposo, el hover, el apretón y el reflejo; por ahora no hace nada')

/** El botón: un `<button type="button">` sin enlace ni `disabled`, una píldora en la tinta, con el reflejo como ÚLTIMO hijo directo. */
function botonBien(html: string): boolean {
  const m = /<div data-pieza="probar-el-panel" class="[^"]*"><button type="button" data-pieza="probar-ahora" class="([^"]*)">([\s\S]*?)<\/button><\/div>/.exec(html)
  if (m === null) return false
  const clases = m[1].split(/\s+/)
  return ['rounded-full', 'overflow-hidden', 'relative', 'bg-tinta', 'text-fondo'].every((c) => clases.includes(c)) && m[2].includes(`<span>${CTA.boton}</span>`) && /<span aria-hidden="true" data-reluciente="caja"[^>]*><\/span>$/.test(m[2]) && !/href=|disabled|onclick/i.test(m[0])
}
afirmar(botonBien(QUIETO) && botonBien(ANIMADO), 'el botón: una píldora grande en la tinta, «Probar ahora» y la flecha en su círculo, con `Reluciente` como hijo directo (el hover lo intensifica)')
controlPositivo('  el detector VE un botón con un enlace', QUIETO.replace('<button type="button" data-pieza="probar-ahora"', '<button type="button" data-pieza="probar-ahora" href="#"'), botonBien)
controlPositivo('  el detector VE el reflejo fuera del botón', QUIETO.replace(/(<span aria-hidden="true" data-reluciente="caja"[^>]*><\/span>)<\/button>/, '</button>$1'), botonBien)
const BOTON = fuente('BotonDeProbar.tsx')
const unSoloLugar = (codigos: readonly string[]): boolean => AL_PROBAR === undefined && codigos.join('\n').match(/\bAL_PROBAR\b/g)?.length === 2 && /onClick=\{AL_PROBAR\}/.test(codigos[0]) && (codigos.join('\n').match(/onClick=/g)?.length ?? 0) === 1
afirmar(unSoloLugar([BOTON, CTA_FUENTE, fuente('NewsletterDelPanel.tsx')]), '  por ahora no hace nada, y lo que haga se conecta en UN lugar (`AL_PROBAR`, su único `onClick`)')
controlPositivo('  el detector VE un segundo manejador escondido en el CTA', [BOTON, `${CTA_FUENTE}\n<button onClick={() => undefined} />`, ''], unSoloLugar)

type Fotograma = Keyframe
/** El reposo: cada ~3 s, un medio-apretón al principio del ciclo (se hunde un poco y rebota) y el resto quieto en 1. */
function reposoBien(f: readonly Fotograma[], b: { readonly cicloMs: number; readonly apretonMs: number }): boolean {
  const offsets = f.map((x) => Number(x.offset))
  const escalas = f.map((x) => Number(x.scale))
  const fin = b.apretonMs / b.cicloMs
  const quietoDespues = f.filter((x) => Number(x.offset) >= fin - 1e-9).every((x) => Number(x.scale) === 1)
  const minimo = Math.min(...escalas)
  const maximo = Math.max(...escalas)
  const iHundido = escalas.indexOf(minimo)
  const iRebote = escalas.indexOf(maximo)
  return offsets[0] === 0 && offsets[offsets.length - 1] === 1 && offsets.every((o, i) => i === 0 || o > offsets[i - 1]) && escalas[0] === 1 && quietoDespues && minimo >= 0.9 && minimo <= 0.97 && maximo > 1 && maximo <= 1.06 && iHundido < iRebote && b.cicloMs >= 2500 && b.cicloMs <= 3500 && fin <= 0.3
}
const REPOSO = fotogramasDelReposo()
afirmar(reposoBien(REPOSO, BOTON_DE_PROBAR), `el reposo: cada ${String(BOTON_DE_PROBAR.cicloMs)} ms se hunde a ${String(BOTON_DE_PROBAR.hundido)} y rebota a ${String(BOTON_DE_PROBAR.rebote)} en ${String(BOTON_DE_PROBAR.apretonMs)} ms; el resto del ciclo, quieto`)
controlPositivo('  el detector VE un apretón sin rebote', fotogramasDelReposo({ ...BOTON_DE_PROBAR, rebote: 1 }), (f: readonly Fotograma[]) => reposoBien(f, BOTON_DE_PROBAR))
controlPositivo('  y un reposo cada 6 s (no «cada ~3 s»)', { ...BOTON_DE_PROBAR, cicloMs: 6000 } as NumerosDelReposo, (b: NumerosDelReposo) => reposoBien(fotogramasDelReposo(b), b))
/** El resorte rebota si está subamortiguado de verdad: la razón de amortiguamiento muy por debajo de 1. */
const rebota = (r: { readonly stiffness: number; readonly damping: number; readonly mass: number }): boolean => r.damping / (2 * Math.sqrt(r.stiffness * r.mass)) < 0.5
afirmar(BOTON_DE_PROBAR.levanta < 0 && BOTON_DE_PROBAR.aplastado < 1 && BOTON_DE_PROBAR.aplastado >= 0.85 && rebota(BOTON_DE_PROBAR.resorte), `  el hover lo levanta ${String(-BOTON_DE_PROBAR.levanta)} px; el apretón lo aplasta a ${String(BOTON_DE_PROBAR.aplastado)} y al soltar rebota (amortiguamiento ${(BOTON_DE_PROBAR.resorte.damping / (2 * Math.sqrt(BOTON_DE_PROBAR.resorte.stiffness * BOTON_DE_PROBAR.resorte.mass))).toFixed(2)})`)
controlPositivo('  el detector VE un resorte que no rebota', { ...BOTON_DE_PROBAR.resorte, damping: 60 }, rebota)
const gestos = (c: string): boolean =>
  /if \(e\.pointerType !== 'mouse'\) return\s+setBajoElMouse\(true\)\s+mover\(\{ y: BOTON_DE_PROBAR\.levanta \}\)/.test(c) && /onPointerDown=\{\(\) => mover\(\{ scale: BOTON_DE_PROBAR\.aplastado, y: 0 \}\)\}/.test(c) && /onPointerUp=\{\(e\) => mover\(\{ scale: 1, /.test(c) &&
  /if \(!anima \|\| el === null\) return\s+void animate\(el, destino, BOTON_DE_PROBAR\.resorte\)/.test(c) && !/whileTap|motion\.button/.test(c) &&
  /const late = anima && aLaVista && !bajoElMouse && !conFoco/.test(c) && /el\.animate\(fotogramasDelReposo\(\), \{ duration: BOTON_DE_PROBAR\.cicloMs, iterations: Infinity \}\)/.test(c) && /return \(\) => reposo\.cancel\(\)/.test(c)
afirmar(gestos(BOTON), '  conectado: el reposo corre sólo a la vista, con movimiento y sin el mouse ni el foco encima (y se cancela al irse); el hover (sólo el mouse) y el apretón, con el resorte y sólo con movimiento, sin el tabindex de más de `whileTap`')
controlPositivo('  el detector VE un reposo que sigue corriendo fuera de la pantalla', BOTON.replace('anima && aLaVista && ', 'anima && '), gestos)
const servidoQuieto = (html: string): boolean => !html.includes('data-reposo') && !/transform:/.test(html)
afirmar(servidoQuieto(QUIETO) && servidoQuieto(ANIMADO), '  servido, quieto: sin reposo y sin una transformada escrita (el reposo arranca recién a la vista)')
controlPositivo('  el detector VE un botón servido latiendo', QUIETO.replace('data-pieza="probar-el-panel"', 'data-pieza="probar-el-panel" data-reposo=""'), servidoQuieto)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Las novedades: el form chico del estándar, con `EstadoDeEnvio`, y sólo el mail a la ruta')

/**
 * El form: debajo de su título, dentro de `EstadoDeEnvio`, «Nombre» y «Mail» en las píldoras del sitio y «Suscribirme» que envía. Sin
 * nombre propio, como el de antes: así no suma un punto de referencia al documento (`s10-acceso` cuenta doce).
 */
function formBien(html: string): boolean {
  const form = /<h4[^>]*>Suscribite a las novedades<\/h4>[\s\S]*?<div data-pieza="estado-de-envio"[\s\S]*?<form data-pieza="form-de-novedades" novalidate=""( [^>]*)>([\s\S]*?)<\/form>/i.exec(html)
  if (form === null || /aria-label/.test(form[1])) return false
  const campos = [...form[2].matchAll(/<label data-foco="pastilla"[^>]*><span[^>]*>([^<]*)<\/span><input([^>]*)>/g)].map((m) => ({ rotulo: m[1], atributos: m[2] }))
  const [nombre, mail] = campos
  return campos.length === 2 && nombre.rotulo === NEWSLETTER.rotuloDelNombre && /autocomplete="name"/i.test(nombre.atributos) && mail.rotulo === NEWSLETTER.rotulo && /autocomplete="email"/i.test(mail.atributos) && /inputmode="email"/i.test(mail.atributos) && /required=""/.test(mail.atributos) && campos.every((c) => !c.atributos.includes('data-foco="campo"')) && /<button type="submit" data-pieza="cta"[\s\S]*Suscribirme/.test(form[2])
}
afirmar(formBien(QUIETO) && formBien(ANIMADO), 'el form chico: «Nombre» y «Mail» (las píldoras del sitio, con el autocompletado global de /v3) y «Suscribirme» que envía, dentro de `EstadoDeEnvio`')
controlPositivo('  el detector VE un form sin el campo del nombre', QUIETO.replace(/<label data-foco="pastilla"[^>]*><span[^>]*>Nombre<\/span><input[^>]*>/, ''), formBien)
controlPositivo('  y un campo que se excluye del arreglo del autocompletado (el del pie)', QUIETO.replace(/(autocomplete="email")/i, '$1 data-foco="campo"'), formBien)
controlPositivo('  y un form con nombre propio (sumaría un punto de referencia)', QUIETO.replace(/(<form data-pieza="form-de-novedades" novalidate="")/i, '$1 aria-labelledby="x"'), formBien)
/** Lo que `s6-tu-panel` §2 le descuenta al marcado: sólo la opacidad de la capa del formulario de `EstadoDeEnvio`. */
const opacidades = (html: string): number => (html.match(/style="opacity:1"/g) ?? []).length
afirmar(opacidades(QUIETO) === 1 && opacidades(sinLaOpacidadDelEnvio(QUIETO)) === 0, '  la única opacidad en línea del CTA es la de la capa de `EstadoDeEnvio` (la pieza compartida), y `s6-tu-panel` descuenta sólo ésa')
controlPositivo('  el descuento no se come otra opacidad escrita a mano', `${QUIETO}<p style="opacity:1">x</p>`, (h: string) => opacidades(sinLaOpacidadDelEnvio(h)) === 0)
const NEWSLETTER_FUENTE = fuente('NewsletterDelPanel.tsx')
afirmar(/<EstadoDeEnvio estado=\{estado\} alVolver=\{alVolver\} mensajes=\{MENSAJES_DEL_ENVIO\.newsletter}>/.test(NEWSLETTER_FUENTE) && /enviarAlServidor\('\/api\/newsletter', cuerpoDelNewsletter\(datos\)\)/.test(NEWSLETTER_FUENTE) && /setEstado\(r\.ok \? 'exito' : 'error'\)/.test(NEWSLETTER_FUENTE), '  el envío es el estándar (la carga, el encastre y el mensaje de la newsletter) y va a la ruta de siempre')
/** Las claves que la ruta acepta, leídas de su esquema de Zod. */
const clavesDeLaRuta = (ruta: string): string[] => [...(/z\.object\(\{([^}]*)\}\)/.exec(ruta)?.[1] ?? '').matchAll(/(\w+):/g)].map((m) => m[1])
const ACEPTA = clavesDeLaRuta(leer('src/app/api/newsletter/route.ts'))
const cabe = (cuerpo: Readonly<Record<string, string>>): boolean => Object.keys(cuerpo).every((k) => ACEPTA.includes(k))
const CUERPO = cuerpoDelNewsletter({ nombre: 'Ana Prueba', mail: '  ana@ejemplo.com ' })
afirmar(ACEPTA.join() === 'mail' && cabe(CUERPO) && CUERPO.mail === 'ana@ejemplo.com', `  la ruta (que no se toca) acepta sólo [${ACEPTA.join(', ')}]: viaja el mail solo, sin espacios; el nombre queda en el form (para Franco)`)
controlPositivo('  el detector VE un cuerpo con el nombre, que la ruta no acepta', { ...CUERPO, nombre: 'Ana Prueba' }, cabe)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Para el lector y el teclado')

const encabezados = (html: string): string[] => [...html.matchAll(/<(h[1-6])\b/g)].map((m) => m[1])
afirmarIgual(encabezados(QUIETO), ['h3', 'h4', 'h4'], 'el titular (h3) y debajo los dos subtítulos (h4): «Probar el panel» y «Suscribite a las novedades»')
afirmarIgual([focalizablesDe(QUIETO).length, focalizablesDe(ANIMADO).length], [4, 4], '4 paradas en las dos ramas: «Probar ahora», el nombre, el mail y «Suscribirme» (el aviso y la flecha son decorativos; ningún tabindex de más)')
controlPositivo('  el detector VE el tabindex que `whileTap` le sumaba al botón', ANIMADO.replace('data-pieza="probar-ahora" class="', 'data-pieza="probar-ahora" tabindex="0" class="'), (h: string) => focalizablesDe(h).length === 4)
afirmar(/<svg data-pieza="flecha-punteada"[^>]*aria-hidden="true"/.test(QUIETO) && /<div aria-hidden="true" data-pieza="aviso-de-scroll"/.test(QUIETO), '  la flecha punteada y el aviso de scroll no se anuncian')
afirmar(/<p[^>]*>Seguí bajando, que todavía hay más<\/p>|>Seguí bajando, que todavía hay más</.test(QUIETO) && QUIETO.lastIndexOf('data-pieza="aviso-de-scroll"') > QUIETO.lastIndexOf('</form>'), '  el aviso va debajo de todo')

cerrar('s6-cta-del-panel.invariant')
