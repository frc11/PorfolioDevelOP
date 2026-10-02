/**
 * RETOQUE 3D · RONDA 2 — el invariante: npm run test:s43-ronda2
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   F6 · el ambiente: queda Bruma, de fábrica, al 0,5; Vidrio y Gotas se borraron (ya no se elige).
 *   F3 · el encendido del haz (parpadeo y zumbido) sólo con la noche empezando en Portfolio, scrolleando: en un viaje del
 *        menú o fuera de Portfolio, el haz prende callado y sin fallar.
 *   F1 · los formularios envían de verdad (el contacto del pie y el del panel a `/api/contacto`, el newsletter a
 *        `/api/newsletter`): Zod y límite por IP en el servidor, validación al lado del campo, sin carteles de «todavía
 *        no envía» ni `mailto`; WhatsApp vuelve al pie (fuera del formulario).
 *   F2 · las llegadas y salidas de los títulos 3D (Portfolio, la frase, El equipo, las demos) y de los valores son función
 *        del scroll, con el asiento al frenar (armado o desarmado del todo); la frase vuelve a tener salida; la llegada
 *        después de un viaje se puede interrumpir y converge.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/ronda2/LEEME.txt`.
 */
import { readFileSync } from 'node:fs'

import { BRUMA } from '../sonido/ambienteGenerativo'
import { CHOREO_TRAMOS } from '../escena/choreography'
import { avanzarElEncendido, encendidoInicial, noPasoDePortfolio } from '../escena/entorno/encendido'
import { VOLUMEN_DEL_AMBIENTE } from '../sonido/catalogo'
import { leerVolumenes } from '../sonido/preferencia'
import { validarElMail, validarElPie } from '../formularios/validar'
import { mostradoDelScroll, persigue } from '../escena/titulos3d/llegada'
import { ASIENTO } from '../titulos3d/repeticiones'
import { ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { filoDeDiaGlsl } from '../escena/titulos3d/filo'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('F6 · El ambiente: Bruma, al 0,5')

const generativo = sinComentarios(leer('_lib/sonido/ambienteGenerativo.ts'))
const soloBruma = (c: string): boolean => /export const BRUMA: Caracter = /.test(c) && !/Vidrio|Gotas|'vidrio'|'gota'/.test(c) && !/CARACTERES/.test(c)
afirmar(soloBruma(generativo) && BRUMA.nombre === 'Bruma', 'queda un solo ambiente, Bruma (colchones lentos en re dórico); Vidrio y Gotas se borraron')
controlPositivo('el detector VE un ambiente de más', `${generativo}\nconst VIDRIO = { nombre: 'Vidrio' }`, soloBruma)
const delElegir = ['_lib/sonido/motor.ts', '_lib/sonido/preferencia.ts', '_chrome/sonido/PruebaDeSonidos.tsx', '_chrome/sonido/motorCompartido.ts'].map((r) => sinComentarios(leer(r))).join('\n')
afirmar(!/Elegidos|elegir\(|leerElegidos|guardarElegidos/.test(delElegir), '  ya no se elige: ni la preferencia, ni el motor, ni la página de prueba (escucharlo y moverle el volumen)')
const almacenQueTira = { getItem: (): never => { throw new Error('bloqueado') }, setItem: (): never => { throw new Error('bloqueado') } }
const g = globalThis as unknown as { window?: unknown }
const antes = g.window
g.window = { localStorage: almacenQueTira }
const deFabrica = leerVolumenes()
g.window = antes
afirmar(VOLUMEN_DEL_AMBIENTE === 0.5 && deFabrica.ambiente === 0.5, '  de fábrica al 0,5 (con el almacenamiento bloqueado, también: try/catch)')
afirmar(/const CLAVE_DE_LOS_VOLUMENES = 'develop-v3-sonido-volumenes-2'/.test(sinComentarios(leer('_lib/sonido/preferencia.ts'))), '  la clave de los volúmenes es nueva: el 0,5 vale aunque en el navegador hubiera quedado el volumen de antes')

// ═══════════════════════════════════════════════════════════════════════════
titulo('F3 · El encendido del haz, sólo en Portfolio')

const apagado = encendidoInicial(0, 0)
const fases = (sinGuion: boolean): string[] => {
  let e = apagado
  const vistas: string[] = []
  for (let t = 1; t < 6; t += 1 / 30) {
    e = avanzarElEncendido(e, 0.9, t, sinGuion)
    if (!vistas.includes(e.fase)) vistas.push(e.fase)
  }
  return vistas
}
afirmar(fases(false).includes('encendiendo') && !fases(true).includes('encendiendo') && fases(true).at(-1) === 'prendido', 'sin guion (un viaje del menú, fuera de Portfolio, movimiento reducido) el haz prende sin pasar por los intentos: ni parpadeo ni zumbido (el sonido se larga sólo al entrar a `encendiendo`)', `con guion: ${fases(false).join(' → ')} · sin: ${fases(true).join(' → ')}`)
let aMitad = encendidoInicial(0, 0)
for (let t = 1; t < 1.6; t += 1 / 30) aMitad = avanzarElEncendido(aMitad, 0.9, t, false)
afirmar(aMitad.fase === 'encendiendo' && avanzarElEncendido(aMitad, 0.9, 1.7, true).fase === 'prendido', '  y si un viaje empieza a mitad del guion, queda prendido (y el zumbido se calla: lo calla el entorno al salir de `encendiendo`)')
const hastaPortfolio = (f: typeof noPasoDePortfolio): boolean => f(0.55, CHOREO_TRAMOS) && f(0.45, CHOREO_TRAMOS) && !f(0.7, CHOREO_TRAMOS) && !f(0.9, CHOREO_TRAMOS)
afirmar(hastaPortfolio(noPasoDePortfolio), '  hasta el final de Portfolio (el tramo `trabajos`, 0,625): la noche la dispara el círculo de entrada a Trabajos, que puede caer antes de su nudo; más abajo (Servicios, Tu panel, el amanecer), sin guion')
controlPositivo('el detector VE la noche de más abajo con guion', (() => true) as typeof noPasoDePortfolio, hastaPortfolio)
const entornoTsx = sinComentarios(leer('_lib/escena/entorno/Entorno.tsx'))
afirmar(/const sinGuion = quieto \|\| viajeEnCurso\(\) !== null \|\| !noPasoDePortfolio\(rig\.current\.progress, CHOREO_TRAMOS\)/.test(entornoTsx) && /encendidoInicial\(noche, t\), noche, t, sinGuion\)/.test(entornoTsx), '  el entorno lo pide así en cada cuadro: con movimiento reducido, en un viaje o fuera de Portfolio, sin guion')

// ═══════════════════════════════════════════════════════════════════════════
titulo('F1 · Los formularios, listos para enviar')

const ruta = (r: string): string => sinComentarios(readFileSync(`src/app/api/${r}/route.ts`, 'utf8'))
const endpointSano = (f: string): boolean => {
  const limite = f.indexOf('checkRateLimit(')
  const cuerpo = f.indexOf('request.json()')
  const exportados = [...f.matchAll(/^export\s+(?:async\s+)?(?:function|const)\s+(\w+)/gm)].map((m) => m[1])
  return limite > 0 && cuerpo > limite && /\.safeParse\(cuerpo\)/.test(f) && /from 'zod'/.test(f) && exportados.join() === 'POST' && !/error\.message|String\(error\)|stack/.test(f)
}
afirmar(endpointSano(ruta('contacto')) && endpointSano(ruta('newsletter')), '`/api/contacto` y `/api/newsletter`: el límite por IP ANTES de leer el cuerpo, los datos por su esquema de Zod, sólo `POST` exportado y nunca el error interno en la respuesta')
controlPositivo('el detector VE un endpoint que lee antes de limitar', ruta('contacto').replace('const ip = await getClientIpHash()', 'const ip0 = await request.json()\n    const ip = await getClientIpHash()'), endpointSano)
afirmar(/z\.discriminatedUnion\('origen', \[DelPie, DelPanel\]\)/.test(ruta('contacto')), '  el contacto recibe los dos formularios (el del pie y el del panel), cada uno con su esquema')
const pie = sinComentarios(leer('_secciones/cierre/FormularioDelPie.tsx'))
const panel = sinComentarios(leer('_chrome/contacto/enviarContacto.ts'))
const novedades = sinComentarios(leer('_secciones/tu-panel/NewsletterDelPanel.tsx'))
const envian = (p: string, h: string, n: string): boolean => /enviarAlServidor\('\/api\/contacto', \{ origen: 'pie'/.test(p) && /enviar\('\/api\/contacto', \{ origen: 'panel'/.test(h) && /enviarAlServidor\('\/api\/newsletter'/.test(n) && !/disabled\b(?!=\{enviando\})/.test(p.replace(/disabled:/g, ''))
afirmar(envian(pie, panel, novedades), 'el contacto del pie, el del panel y el newsletter envían de verdad (el botón, ocupado sólo mientras viaja)')
controlPositivo('el detector VE un botón deshabilitado para siempre', [pie.replace('disabled={enviando}', 'disabled'), panel, novedades], ([p, h, n]: string[]) => envian(p, h, n))
const textos = [leer('_secciones/cierre/contenido.ts'), leer('_secciones/tu-panel/contenido.ts'), leer('_chrome/contacto/contenido.ts'), pie, novedades].join('\n')
afirmar(!/Todavía no (envía|hay a dónde)|Enviar por mail|abrimos tu correo|lo conectamos en la próxima etapa/i.test(sinComentarios(textos)) && !/mailto:\$\{MAIL\}\?subject=/.test(panel), '  sin carteles de «todavía no envía» y sin el `mailto` del panel')
afirmar(/role="alert"/.test(pie) && /role="status"/.test(pie) && /role="alert"/.test(novedades) && /role="status"/.test(novedades), '  el resultado, en sus regiones vivas: el error normal del formulario y el «listo»')
const errores = validarElPie({ nombre: 'A', mail: 'no-es-un-mail', mensaje: '' })
afirmar(Object.keys(errores).join() === 'nombre,mail,mensaje' && Object.keys(validarElPie({ nombre: 'Ana', mail: 'ana@empresa.com', mensaje: 'Hola' })).length === 0 && validarElMail('ana@empresa.com') === null && validarElMail('ana') !== null, '  la validación del navegador (la misma regla que el servidor): cada campo dice lo suyo')
controlPositivo('el detector VE un mail sin arroba aceptado', ((d: { nombre: string; mail: string; mensaje: string }) => (d.mail.length > 0 ? {} : { mail: 'x' })) as typeof validarElPie, (f: typeof validarElPie) => f({ nombre: 'Ana', mail: 'ana', mensaje: 'Hola' }).mail !== undefined)
const piezas = sinComentarios(leer('_secciones/cierre/PiezasDeContacto.tsx'))
afirmar(/data-pieza="whatsapp"/.test(piezas) && /href=\{WHATSAPP\.href\}/.test(piezas) && !/whatsapp|wa\.me/i.test(sinComentarios(leer('_chrome/contacto/FormularioDeContacto.tsx')) + panel), 'WhatsApp vuelve al pie, donde estaba, con su botón; en el formulario de contacto (el panel) no está')

// ═══════════════════════════════════════════════════════════════════════════
titulo('F2 · Llegadas y salidas que no se rompen')

type Seguidor = (mostrado: number, pedido: number, asentar: boolean, dt: number) => number
/** Idas y vueltas rápidas (un scroll que salta), y después quieto: cada cuadro coherente, y al final armado o desarmado del todo. */
const noSeRompe = (f: Seguidor): boolean => {
  const dt = 1 / 60
  let m = 0
  let azar = 7
  for (let k = 0; k < 600; k += 1) {
    azar = (azar * 9301 + 49297) % 233280
    const pedido = (k % 40 < 20 ? 1 : 0) * (azar / 233280)
    m = f(m, pedido, false, dt)
    if (!(m >= 0 && m <= 1)) return false
  }
  // Frena a mitad de camino: el asiento lo completa o lo deshace, en lo que dura el asiento (más un margen).
  for (const parado of [0.62, 0.3]) {
    let q = m
    for (let t = 0; t < ASIENTO.s + 0.2; t += dt) q = f(q, parado, true, dt)
    if (q !== (parado >= 0.5 ? 1 : 0)) return false
  }
  return true
}
afirmar(noSeRompe(mostradoDelScroll), 'lo que se muestra es función del scroll: idas y vueltas a cualquier velocidad dan siempre un estado coherente, y al frenar queda armado o desarmado del todo (el asiento)', `asiento: ${String(ASIENTO.quietoMs)} ms quieto, ${String(ASIENTO.s)} s de punta a punta`)
controlPositivo('el detector VE la persecución de antes (no asienta: al frenar a mitad queda a mitad)', ((m: number, p: number, _a: boolean, dt: number) => persigue(m, p, dt)) as Seguidor, noSeRompe)
const alcanza = (f: Seguidor): boolean => {
  let m = 1
  for (let t = 0; t < ASIENTO.alcanceS + 0.05; t += 1 / 60) m = f(m, 0.4, false, 1 / 60)
  return m === 0.4
}
afirmar(alcanza(mostradoDelScroll), '  al volver el scroll después de un asiento, alcanza al progreso sin saltar (en lo que dura el alcance) y desde ahí lo sigue tal cual')
const escena3d = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
afirmar(/const asentar = !enViaje && REPETICIONES\.activas === 0 && ahora - s\.scroll\.cuando > ASIENTO\.quietoMs/.test(escena3d) && (escena3d.match(/mostradoDelScroll\(/g) ?? []).length === 3 && !/m\.llegada > 0 \? 1 :/.test(escena3d), '  en la escena: Portfolio, la frase, El equipo y las demos (la llegada y la salida), sin «termina lo que empezó»; el asiento, sólo con el scroll quieto y sin un viaje ni una llegada repetida corriendo')
const porQueDevelop = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
afirmar((porQueDevelop.match(/salida: levantada, corrida \}/g) ?? []).length === 2 && /salida=\{volumen\.salida\}/.test(porQueDevelop) && !/llegadaDe="por-que-develop" queda/.test(porQueDevelop), 'la frase de Por qué develOP vuelve a irse con la levantada (con la misma regla)')
const repetida = sinComentarios(leer('_componentes/llegadaDelTitulo.ts'))
afirmar(/REPETICIONES\.activas \+= 1/.test(repetida) && /repeticion\.set\(-1\)\s*terminar\(\)/.test(repetida), 'la llegada aislada después de un viaje (por tiempo) se puede interrumpir y converge: un pedido nuevo la reinicia, cortada vuelve al scroll; mientras corre, no se asienta')
const valor = sinComentarios(leer('_secciones/por-que-develop/valorEnVolumen.tsx'))
afirmar(/a\.reloj = window\.setTimeout\(\(\) => \{\s*a\.control = animate\(p, destino,/.test(valor) && /a\.control\?\.stop\(\)/.test(valor), 'los valores (CSS 3D): la pose, función de su tramo; quietos a mitad, se asientan; cualquier scroll lo interrumpe')

// ═══════════════════════════════════════════════════════════════════════════
titulo('F4 · La legibilidad del 3D de día, a prueba')

const apagadoEnElProducto = (e: typeof ENTORNO): boolean => e.pruebas.filo === 'no'
afirmar(PRUEBAS_APAGADAS.filo === 'no' && apagadoEnElProducto(ENTORNO), 'el producto no cambia: el filo de día es una prueba, apagada')
controlPositivo('el detector VE el filo prendido en el producto', { ...ENTORNO, pruebas: { filo: 'a' } }, apagadoEnElProducto)
const pedido = (v: string): string => entornoPedido(`producto,filo=${v}`).pruebas.filo
afirmar(pedido('a') === 'a' && pedido('b') === 'b' && pedido('c') === 'c' && pedido('x') === 'no', '  `?pruebas=filo=a|b|c` pide cada variante (otra cosa, ninguna)')
const variantes = (f: typeof filoDeDiaGlsl): boolean => {
  const [a, b, c] = (['a', 'b', 'c'] as const).map(f)
  const filo = (g: string): boolean => /uContornoDelLogo/.test(g) && /filoDeDia \*/.test(g)
  const costado = (g: string): boolean => /mix\( 1\.0, vTapaDelLogo/.test(g)
  return filo(a) && !costado(a) && costado(b) && !filo(b) && filo(c) && costado(c) && [a, b, c].every((g) => /emissive\.r \/ EMISION_DE_LA_NOCHE/.test(g))
}
afirmar(variantes(filoDeDiaGlsl), '  a: el filo claro en el contorno de la cara; b: los costados en otro gris; c: las dos; todas se apagan con la noche')
controlPositivo('el detector VE la c sin el costado', ((v: 'a' | 'b' | 'c') => (v === 'c' ? filoDeDiaGlsl('a') : filoDeDiaGlsl(v))) as typeof filoDeDiaGlsl, variantes)
const material = leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx')
afirmar(/else if \(filo !== 'no'\) shader\.fragmentShader/.test(material) && /customProgramCacheKey = \(\) => `titulo-de-volumen-\$\{variante\}-filo-\$\{filo\}`/.test(material), '  sólo en los títulos negros (el blanco tiene su filo oscuro), y cada variante con su programa')
const delLogo = ['_lib/escena/logoDeNoche.ts', '_lib/escena/logoEmision.ts'].map(leer).join('\n')
afirmar(!/filo\.ts|filoDeDiaGlsl|pruebas\.filo/.test(delLogo), '  el logo no se toca')

cerrar('s43-ronda2')
