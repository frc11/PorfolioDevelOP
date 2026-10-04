/**
 * SPRINT NOCTURNO (RETOQUES + TU PANEL VIVO) — el invariante: npm run test:s45-nocturno
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   A2 · el pie: la llegada de prueba borrada y la onda en el producto (en s44-pie, que es su invariante).
 *   A4 · la llegada de Portfolio vuelve a ser la larga de ESCENA 10 (persigue al scroll con un mínimo de tiempo), con lo
 *        que arregló F2: se da vuelta con el scroll y al frenar termina armada o desarmada.
 *   A5 · la salida de «Seis razones / para elegirnos», con el mismo mecanismo y bastante más lenta (se iba volando).
 *   A3 · los enlaces del recorrido del pie viajan como los ítems del menú (el mismo escucha, el mismo plan de la escena y
 *        la misma llegada repetida del título del destino).
 *   A1 · el texto 2D que acompaña a un título 3D (la bajada y los CTA del hero, la bajada de Portfolio, los valores de la
 *        frase, el párrafo de Demos) va en el plano de su título como lo ve la cámara viva: queda siempre debajo de él.
 *   B  · Tu panel vivo: cada feature con su demo armada con los componentes del panel real (importados o copiados a
 *        `_panel-vivo/`), sin red, sin server actions ni sesión, sin las zonas de Franco, sin precios, con «Ejemplo»,
 *        diferida (se monta al entrar en pantalla) y accesible (la grande, usable; la miniatura, inerte).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/nocturno/LEEME.txt`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import * as THREE from 'three'

import { SELECTOR_DE_LOS_VIAJES } from '../../_componentes/deslizamiento'
import { DESTINOS_DE_LA_RUTA } from '../../_secciones/cierre/contenido'
import { IDS_DE_SECCION } from '../../_secciones/_contrato/forma'
import { preciosEncontrados } from '../../_secciones/_contrato/escaneo'
import { TARJETAS } from '../../_secciones/tu-panel/contenido'
import { ITEM_DE_LA_DEMO, ROTULO_DE_EJEMPLO } from '../../_panel-vivo/catalogo'
import { LIMITE_DE_LINEAS_DE_CODIGO, contarLineasDeCodigo } from './s8-largos'
import { LLEGADA_DE_LAS_LETRAS, mostradoDelScroll } from '../escena/titulos3d/llegada'
import { cuadrilateroEnElPlano } from '../escena/titulos3d/acompanantes'
import { colocar, lineaDeBase } from '../escena/titulos3d/colocacion'
import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR, ORBIT_TARGET_Y } from '../escena/probeScene'
import { ASIENTO, LENTOS } from '../titulos3d/repeticiones'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const DT = 1 / 60

type Seguidor = (mostrado: number, pedido: number, asentar: boolean, dt: number) => number

/** Cuánto tarda lo mostrado en ir de `desde` a `pedido` (s), con el scroll quieto o no; `Infinity` si no llega en 10 s. */
function cuantoTarda(f: Seguidor, desde: number, pedido: number, asentar: boolean, destino: number): number {
  let m = desde
  for (let t = 0; t < 10; t += DT) {
    if (m === destino) return t
    m = f(m, pedido, asentar, DT)
  }
  return Number.POSITIVE_INFINITY
}

/** Se da vuelta con el scroll: medio camino hacia 1 y el scroll vuelve; el cuadro siguiente ya baja. */
function seDaVuelta(f: Seguidor): boolean {
  let m = 0
  for (let t = 0; t < 0.4; t += DT) m = f(m, 1, false, DT)
  const antes = m
  return antes > 0.05 && antes < 0.95 && f(m, 0, false, DT) < antes
}

/** Idas y vueltas rápidas y después quieto a mitad: cada cuadro en [0, 1] y al final en 0 o 1 exactos (el asiento). */
function convergeSiempre(f: Seguidor, asientoS: number): boolean {
  let m = 0
  let azar = 11
  for (let k = 0; k < 900; k += 1) {
    azar = (azar * 9301 + 49297) % 233280
    m = f(m, (k % 50 < 25 ? 1 : 0) * (azar / 233280), false, DT)
    if (!(m >= 0 && m <= 1)) return false
  }
  for (const parado of [0.62, 0.3]) {
    let q = m
    for (let t = 0; t < asientoS + 0.2; t += DT) q = f(q, parado, true, DT)
    if (q !== (parado >= 0.5 ? 1 : 0)) return false
  }
  return true
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · La llegada de Portfolio: la larga de ESCENA 10, sin perder F2')

const portfolio: Seguidor = (m, p, a, dt) => mostradoDelScroll(m, p, a, dt, LENTOS.llegadaDePortfolioS)
const deF2: Seguidor = (m, p, a, dt) => mostradoDelScroll(m, p, a, dt)
const larga = (f: Seguidor): boolean => cuantoTarda(f, 0, 1, false, 1) >= LENTOS.llegadaDePortfolioS - DT
const tarda = cuantoTarda(portfolio, 0, 1, false, 1)
afirmar(LENTOS.llegadaDePortfolioS === LLEGADA_DE_LAS_LETRAS.minimoS && larga(portfolio) && tarda < LENTOS.llegadaDePortfolioS + 2 * DT, 'con un scroll que salta la ventana entera, las letras llegan en el mínimo de ESCENA 10 (desde la profundidad, girando), no en lo que tarda el scroll', `de 0 a 1 en ${tarda.toFixed(2)} s (F2: ${cuantoTarda(deF2, 0, 1, false, 1).toFixed(2)} s)`)
controlPositivo('el detector VE la llegada corta de F2', deF2, larga)
afirmar(seDaVuelta(portfolio), '  se interrumpe: si el scroll vuelve a mitad de la llegada, las letras se dan vuelta en el cuadro siguiente')
controlPositivo('el detector VE una llegada que termina lo que empezó', ((m: number, p: number, _a: boolean, dt: number) => mostradoDelScroll(m, m > 0 ? 1 : p, false, dt, LENTOS.llegadaDePortfolioS)) as Seguidor, seDaVuelta)
afirmar(convergeSiempre(portfolio, LENTOS.llegadaDePortfolioS), '  nunca queda a medias: con idas y vueltas rápidas cada cuadro es coherente, y al frenar a mitad asienta a la MISMA velocidad (frenar no acorta la llegada) en armado o desarmado del todo')
controlPositivo('el detector VE el seguidor sin asiento (al frenar a mitad queda a mitad)', ((m: number, p: number, _a: boolean, dt: number) => mostradoDelScroll(m, p, false, dt, LENTOS.llegadaDePortfolioS)) as Seguidor, (f: Seguidor) => convergeSiempre(f, LENTOS.llegadaDePortfolioS))
afirmar(cuantoTarda(deF2, 1, 0.4, false, 0.4) <= ASIENTO.alcanceS + DT && convergeSiempre(deF2, ASIENTO.s), '  los demás títulos siguen con F2 tal cual (sin mínimo: alcanzan al scroll en el alcance y asientan en el asiento)')
const piezas = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
const componente = sinComentarios(leer('_componentes/titulos3d/TituloDeVolumen.tsx'))
const escena = sinComentarios((leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx') + leer('_lib/escena/titulos3d/armado.ts')))
const enchufada = (c: string): boolean => /<TituloDeVolumen id="portfolio"[^>]*minimoS=\{LENTOS\.llegadaDePortfolioS\}/.test(c)
afirmar(enchufada(piezas) && /salida, queda, corrida, minimoS,( salidaMinimaS,)?( asiento,)? activo:/.test(componente) && /if \(a\.titulo\.rearma\) m\.llegada = mostradoDelScroll\(m\.llegada, enViaje \? 0 : a\.titulo\.llegada, asentar, dt, enViaje \? null : a\.titulo\.minimoS\)/.test(escena), '  Portfolio pide su mínimo (sección → registro → escena); en un viaje del menú se desarma rápido, como antes')
controlPositivo('el detector VE a Portfolio sin su mínimo', piezas.replace(' minimoS={LENTOS.llegadaDePortfolioS}', ''), enchufada)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A5 · «Seis razones / para elegirnos»: la salida, bastante más lenta')

const salida: Seguidor = (m, p, a, dt) => mostradoDelScroll(m, p, a, dt, LENTOS.salidaDeLaFraseS)
const lenta = (f: Seguidor): boolean => cuantoTarda(f, 0, 1, false, 1) >= 1.4 * LENTOS.llegadaDePortfolioS - DT
const seVaEn = cuantoTarda(salida, 0, 1, false, 1)
afirmar(lenta(salida), 'con un scroll que cruza la levantada de una, las letras se van en el mínimo (de vuelta a la profundidad, girando), no en lo que tarda el scroll', `de 0 a 1 en ${seVaEn.toFixed(2)} s (antes, ${cuantoTarda(deF2, 0, 1, false, 1).toFixed(2)} s; la llegada de Portfolio, ${String(LENTOS.llegadaDePortfolioS)} s)`)
controlPositivo('el detector VE la salida que se iba volando', deF2, lenta)
afirmar(seDaVuelta(salida) && convergeSiempre(salida, LENTOS.salidaDeLaFraseS), '  con la robustez de F2: se da vuelta si el scroll vuelve y al frenar a mitad queda ida o armada del todo')
const porQue = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
const registro = sinComentarios(leer('_lib/titulos3d/registro.ts'))
const lentaEnLaFrase = (c: string): boolean => /<TituloDeVolumen [^>]*salida=\{volumen\.salida\}[^>]*salidaMinimaS=\{LENTOS\.salidaDeLaFraseS\}[^>]*llegadaDe="por-que-develop" \/>/.test(c)
afirmar(lentaEnLaFrase(porQue) && /salida, queda, corrida, minimoS, salidaMinimaS,( asiento,)? activo:/.test(componente) && /rearma, minimoS, salidaMinimaS(, asiento)?(, trazos)? \}\)/.test(registro) && /a\.mostrado\.salida = mostradoDelScroll\(a\.mostrado\.salida, a\.titulo\.salida, asentar, dt, a\.titulo\.salidaMinimaS\)/.test(escena), '  la frase pide su salida lenta (sección → registro → escena); los demás títulos (sin `salidaMinimaS`) siguen con la de F2')
controlPositivo('el detector VE la frase sin su salida lenta', porQue.replace(' salidaMinimaS={LENTOS.salidaDeLaFraseS}', ''), lentaEnLaFrase)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · Los enlaces del pie viajan como los del menú')

const DEL_PIE = '[data-pieza="destinos-del-pie"] a[data-pieza="pie-enlace-icono"]'
const columnas = sinComentarios(leer('_secciones/cierre/ColumnasDelPie.tsx'))
const viajan = (selector: string, fuente: string): boolean => selector.split(', ').includes(DEL_PIE) && /<ul data-pieza="destinos-del-pie"[^>]*>[\s\S]{0,600}<EnlaceDelPieConIcono\s+href=\{destino\.ancla\}/.test(fuente)
afirmar(viajan(SELECTOR_DE_LOS_VIAJES, columnas), 'los enlaces del recorrido del pie entran en el MISMO selector que la barra y el menú: el mismo escucha, el mismo plan de la escena (día y noche) y la misma llegada del título al terminar')
controlPositivo('el detector VE los enlaces del pie afuera del viaje (el salto de antes)', SELECTOR_DE_LOS_VIAJES.replace(`, ${DEL_PIE}`, ''), (sel: string) => viajan(sel, columnas))
const secciones = IDS_DE_SECCION as readonly string[]
afirmar(DESTINOS_DE_LA_RUTA.length > 0 && DESTINOS_DE_LA_RUTA.every((d) => d.ancla.startsWith('#') && secciones.includes(d.ancla.slice(1))), '  cada destino es el ancla de una sección (el viaje la resuelve a su nudo); ninguno es `#contacto` (ése abre el panel)', DESTINOS_DE_LA_RUTA.map((d) => d.ancla).join(' '))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · El texto 2D pegado a su título 3D')

// Un título colocado como lo coloca la escena (a la profundidad del logo, de frente a la cámara con que se coloca) y su
// bajada debajo. La cámara viva: la misma (el mouse quieto) o corrida 8° alrededor del logo (el mouse, la órbita).
const CUADRO = { ancho: 1440, alto: 900 }
const camaraEn = (grados: number): THREE.PerspectiveCamera => {
  const c = new THREE.PerspectiveCamera(CAMERA_FOV, CUADRO.ancho / CUADRO.alto, CAMERA_NEAR, CAMERA_FAR)
  const a = THREE.MathUtils.degToRad(grados)
  c.position.set(Math.sin(a) * 30, 4, Math.cos(a) * 30)
  c.lookAt(0, ORBIT_TARGET_Y, 0)
  c.updateMatrixWorld(true)
  return c
}
const deLaColocacion = camaraEn(0)
const LUGAR = { izquierda: 180, arriba: 300, linea: 110, cuerpo: 96, ancho: CUADRO.ancho, alto: CUADRO.alto }
const FUENTE = { ascender: 900, descender: -250, resolution: 1000 }
const grupo = new THREE.Group()
colocar(grupo, deLaColocacion, LUGAR, FUENTE)
const ancla = { x: LUGAR.izquierda, y: lineaDeBase(LUGAR, FUENTE) }
const bajadaDelTitulo = { x: 184, y: 440, ancho: 520, alto: 150 }
type Caja = typeof bajadaDelTitulo
type Cuenta = (camara: THREE.Camera, caja: Caja, destino: number[]) => boolean
const enElPlano: Cuenta = (camara, caja, destino) => cuadrilateroEnElPlano(grupo, ancla, LUGAR.cuerpo, caja, camara, CUADRO, destino)
const q: number[] = []
const enSuLugar = enElPlano(deLaColocacion, bajadaDelTitulo, q) && [0, 0, 520, 0, 520, 150, 0, 150].every((v, k) => Math.abs(q[k] - v) < 0.01)
afirmar(enSuLugar, 'con la cámara viva en la pose con que se colocó el título (el mouse quieto), el texto queda donde el DOM lo puso: la transformada es la identidad')
/** Sigue al título: el origen del título, puesto como una caja de un px, cae donde la cámara viva ve el título; y la bajada queda debajo. */
const sigueAlTitulo = (f: Cuenta): boolean => {
  const viva = camaraEn(8)
  const punto: number[] = []
  if (!f(viva, { x: ancla.x, y: ancla.y, ancho: 1, alto: 1 }, punto)) return false
  const visto = grupo.position.clone().project(viva)
  const [vx, vy] = [((visto.x + 1) / 2) * CUADRO.ancho, ((1 - visto.y) / 2) * CUADRO.alto]
  const enElTitulo = Math.hypot(ancla.x + punto[0] - vx, ancla.y + punto[1] - vy) < 0.5
  const bajada: number[] = []
  if (!f(viva, bajadaDelTitulo, bajada)) return false
  const seMovio = Math.hypot(bajada[0], bajada[1]) > 5
  const debajo = bajadaDelTitulo.y + Math.min(bajada[1], bajada[3]) > vy
  return enElTitulo && seMovio && debajo
}
afirmar(sigueAlTitulo(enElPlano), '  con la cámara corrida 8° (el paralaje, la órbita), el texto se corre con el título: su origen cae donde se ve el título y la bajada sigue debajo de él')
controlPositivo('el detector VE el texto quieto en la pantalla (el defecto de la captura)', ((_c: THREE.Camera, caja: Caja, destino: number[]) => enElPlano(deLaColocacion, caja, destino)) as Cuenta, sigueAlTitulo)
const deEspaldas = new THREE.PerspectiveCamera(CAMERA_FOV, CUADRO.ancho / CUADRO.alto, CAMERA_NEAR, CAMERA_FAR)
deEspaldas.position.set(0, 4, 30)
deEspaldas.lookAt(0, 4, 60)
deEspaldas.updateMatrixWorld(true)
afirmar(!enElPlano(deEspaldas, bajadaDelTitulo, []), '  con el plano detrás de la cámara no hay transformada: el texto queda en su lugar')
// En el código: la escena lo lleva con la cámara VIVA, por cuadro, escribiendo el estilo (sin `setState`); el DOM se anota
// desde 1024 con el título armado (abajo la mezcla del texto no se toca) y vuelve a su lugar al soltarse.
const delDom = sinComentarios(leer('_lib/titulos3d/acompanantes.ts'))
const deLaEscena = sinComentarios(leer('_lib/escena/titulos3d/acompanantes.ts'))
const conLaViva = (c: string): boolean => /llevarLosAcompanantes\(m\.current\.armados, state\.camera, /.test(c)
afirmar(conLaViva(escena) && /el\.style\.transform = css/.test(deLaEscena) && !/setState|useState/.test(deLaEscena) && /const activo = material !== 'no' && escritorio && listo/.test(delDom) && /el\.style\.transform = ''/.test(delDom), '  la escena lo lleva por cuadro con la cámara viva (escribe el estilo, sin `setState`); sólo desde 1024 y con el título armado; al soltarse, vuelve a su lugar')
controlPositivo('el detector VE el texto llevado con la cámara sin el mouse', escena.replace('llevarLosAcompanantes(m.current.armados, state.camera, ', 'llevarLosAcompanantes(m.current.armados, CAMARA_SIN_EL_MOUSE, '), conLaViva)
const PEGADOS: readonly (readonly [string, RegExp])[] = [
  ['_secciones/hero/Hero.tsx', /const enElPlano = useAcompananteDelTitulo<HTMLDivElement>\('hero-registro-2'\)[\s\S]{0,120}<div ref=\{enElPlano\}/],
  ['_secciones/trabajos/piezas.tsx', /const bajada = useAcompananteDelTitulo<HTMLDivElement>\('portfolio'\)[\s\S]*<div ref=\{bajada\} style=\{\{ maxWidth/],
  ['_secciones/por-que-develop/PorQueDevelop.tsx', /useAcompananteDelTitulo<HTMLDivElement>\('frase-izquierda'\)[\s\S]*useAcompananteDelTitulo<HTMLDivElement>\('frase-derecha'\)[\s\S]*<div ref=\{valoresDeLaIzquierda\}[\s\S]*<div ref=\{valoresDeLaDerecha\}/],
  ['_secciones/trabajos/demos/TextoDeDemos.tsx', /const enElPlano = useAcompananteDelTitulo<HTMLDivElement>\('demos-2'\)[\s\S]*<div ref=\{enElPlano\}>\s*<div ref=\{refDelParrafo\}>/],
]
const pegados = PEGADOS.map(([ruta, patron]) => patron.test(sinComentarios(leer(ruta))))
afirmar(pegados.every(Boolean), '  en el hero (la bajada y los CTA), en Portfolio (su bajada), en Por qué develOP (cada columna de valores con su mitad de la frase) y en Demos (el párrafo)', pegados.map((v, k) => `${PEGADOS[k][0].split('/').pop() ?? ''}: ${v ? 'sí' : 'NO'}`).join(' · '))
const ids = ['hero-registro-2', 'portfolio', 'frase-izquierda', 'frase-derecha', 'demos-2']
const anotados = ['_secciones/hero/Hero.tsx', '_secciones/trabajos/piezas.tsx', '_secciones/por-que-develop/PorQueDevelop.tsx', '_secciones/trabajos/demos/TextoDeDemos.tsx'].map(leer).join('\n')
afirmar(ids.every((id) => anotados.includes(`id: '${id}'`) || anotados.includes(`id="${id}"`)), '  cada uno acompaña a un título que existe (el mismo id con que la sección lo anota)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B · Tu panel vivo: las demos del panel real')

const CARPETA = `${V3}/_panel-vivo`
const deLaCarpeta = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(path.join(dir, n)).isDirectory() ? deLaCarpeta(path.join(dir, n)) : /\.tsx?$/.test(n) ? [path.join(dir, n).replace(/\\/g, '/')] : []))
const ARCHIVOS_VIVOS = deLaCarpeta(CARPETA)
const fuenteViva = (a: string): string => readFileSync(a, 'utf8')
const importsDe = (c: string): string[] => [...c.matchAll(/^import\s+(type\s+)?[\s\S]*?from\s+'([^']+)'/gm)].filter((m) => m[1] === undefined).map((m) => m[2])
const PROHIBIDO = /^(next\/link|next\/navigation|next\/router|next-auth|server-only|@\/auth|@\/lib\/prisma|@\/lib\/db|@prisma\/client)$|\/actions?(\/|$)|\/server(\/|$)|\.server$|OsLead|\/leados|\/setter|ActivityChannel/
const sinLoProhibido = (archivos: readonly string[], leer: (a: string) => string): string[] => archivos.flatMap((a) => importsDe(leer(a)).filter((i) => PROHIBIDO.test(i)).map((i) => `${path.basename(a)} → ${i}`))
afirmar(ARCHIVOS_VIVOS.length >= 6 && sinLoProhibido(ARCHIVOS_VIVOS, fuenteViva).length === 0, `ningún archivo de las demos importa una server action, prisma, auth, \`next/link\`, \`next/navigation\` ni las zonas de Franco (${String(ARCHIVOS_VIVOS.length)} archivos)`, sinLoProhibido(ARCHIVOS_VIVOS, fuenteViva).join(' · '))
controlPositivo('el detector VE un import prohibido', [`${CARPETA}/x.tsx`], (l: readonly string[]) => sinLoProhibido(l, () => "import Link from 'next/link'\nimport { createTicketAction } from '@/lib/tickets/actions'\n").length === 0)
// Un nivel más: lo que se importa del dashboard tampoco trae esas cosas (lo que trae, se copió).
const DEL_DASHBOARD = [...new Set(ARCHIVOS_VIVOS.flatMap((a) => importsDe(fuenteViva(a))).filter((i) => /^@\/(components|modules|lib)\//.test(i)))]
const resolver = (i: string): string => ['.tsx', '.ts'].map((x) => `src/${i.slice(2)}${x}`).find((r) => { try { return statSync(r).isFile() } catch { return false } }) ?? ''
/**
 * Las excepciones, con su motivo: `ui/Tabs` importa `next/link` para su modo ENLACE; las demos lo usan en modo VALOR
 * (`value` y `onValueChange`, como `ProjectTaskTabs`), que no pinta ningún `<Link>` (sin `<Link>` no hay prefetch).
 */
const CON_MOTIVO: Readonly<Record<string, string>> = { '@/components/ui/Tabs': 'modo valor: no pinta ningún <Link>' }
const importadosLimpios = DEL_DASHBOARD.filter((i) => i in CON_MOTIVO || (resolver(i) !== '' && sinLoProhibido([resolver(i)], fuenteViva).length === 0 && !/^\s*['"]use server['"]/m.test(fuenteViva(resolver(i)))))
afirmar(DEL_DASHBOARD.length > 0 && importadosLimpios.length === DEL_DASHBOARD.length, '  lo que se IMPORTA del panel real es sólo su parte visual: tampoco trae server actions, `<Link>` ni navegación', DEL_DASHBOARD.filter((i) => !importadosLimpios.includes(i)).join(' · ') || `${String(DEL_DASHBOARD.length)} módulos`)
const usosDeTabs = ARCHIVOS_VIVOS.flatMap((a) => [...sinComentarios(fuenteViva(a)).matchAll(/<Tabs\b[\s\S]*?\/>/g)].map((m) => m[0]))
const enModoValor = (usos: readonly string[]): boolean => usos.every((u) => /\bvalue=\{/.test(u) && /\bonValueChange=\{/.test(u) && !/\bhref/.test(u))
afirmar(usosDeTabs.length > 0 && enModoValor(usosDeTabs), '  `ui/Tabs` (que importa `next/link` para su modo enlace) va siempre en modo valor: ningún `<Link>` pintado', `${String(usosDeTabs.length)} uso(s)`)
controlPositivo('el detector VE un Tabs en modo enlace', ["<Tabs items={[{ href: '/dashboard/resultados' }]} />"], enModoValor)
const RED = /\bfetch\(|XMLHttpRequest|EventSource|WebSocket|sendBeacon|\baxios\b/
const conRed = ARCHIVOS_VIVOS.filter((a) => RED.test(sinComentarios(fuenteViva(a))))
afirmar(conRed.length === 0, '  cero red: ninguna demo pide nada (todo es de ejemplo y local)', conRed.join(' · '))
const literales = ARCHIVOS_VIVOS.flatMap((a) => [...sinComentarios(fuenteViva(a)).matchAll(/'((?:[^'\\\n]|\\.)*)'/g)].map((m) => m[1])).join(' · ')
afirmar(preciosEncontrados(literales).length === 0, '  ningún precio en los datos de ejemplo (ni de ejemplo: `inventado.ts`)', preciosEncontrados(literales).map((h) => h.fragmento).join(' '))
controlPositivo('el detector VE un precio de ejemplo', 'Plan Pro, USD 49 por mes', (t: string) => preciosEncontrados(t).length === 0)
const largos = ARCHIVOS_VIVOS.filter((a) => contarLineasDeCodigo(fuenteViva(a)) > LIMITE_DE_LINEAS_DE_CODIGO)
afirmar(largos.length === 0, `  ningún archivo de las demos pasa las ${String(LIMITE_DE_LINEAS_DE_CODIGO)} líneas de código`, largos.join(' · '))
// Cada feature con su demo; cada demo, en el marco del panel (con «Ejemplo») y con el ítem del panel que le toca.
const cargador = sinComentarios(fuenteViva(`${CARPETA}/DemoDelPanel.tsx`))
const conDemo = TARJETAS.filter((t) => new RegExp(`\\b${t.demo}: lazy\\(\\(\\) => import\\('\\./demos/`).test(cargador))
afirmar(TARJETAS.every((t) => t.demo in ITEM_DE_LA_DEMO) && new Set(TARJETAS.map((t) => t.demo)).size === TARJETAS.length, 'cada una de las ocho features nombra su demo (una distinta cada una)', `con demo: ${conDemo.map((t) => t.demo).join(', ')}`)
const modulos = [...cargador.matchAll(/import\('(\.\/demos\/[^']+)'\)/g)].map((m) => `${CARPETA}/${m[1].slice(2)}.tsx`)
afirmar(modulos.length === conDemo.length && modulos.every((m) => /<MarcoDelPanel item="/.test(fuenteViva(m))), '  cada demo va en el marco del panel (que lleva siempre «Ejemplo»)', modulos.map((m) => path.basename(m)).join(' · '))
const marco = sinComentarios(fuenteViva(`${CARPETA}/MarcoDelPanel.tsx`))
// [RETOQUE PANEL] T1 · la miniatura y la grande se fueron: cada demo se usa en su lugar (s6-tu-panel y s46 lo cuidan).
afirmar(ROTULO_DE_EJEMPLO === 'Ejemplo' && /\{ROTULO_DE_EJEMPLO\}<\/span>/.test(marco), '  el rótulo «Ejemplo» va siempre en el marco')
// Diferida, pausada fuera de cuadro y accesible.
const demoEnSuLugar = (c: string): boolean => (c.match(/new IntersectionObserver\(/g) ?? []).length === 2 && /rootMargin: ANTES_DE_ENTRAR/.test(c) && /\{montada && \(/.test(c) && /const corre = laMasVisible && pestana && !pausada && !reducido/.test(c)
afirmar(demoEnSuLugar(cargador), '  la demo se monta recién al acercarse a la pantalla y corre sólo si es la más visible ([PASADA FINAL] B3), con la pestaña visible, sin pausa y sin movimiento reducido')
controlPositivo('el detector VE una demo que se monta siempre', cargador.replace('{montada && (', '{('), demoEnSuLugar)
const reproduccion = sinComentarios(fuenteViva(`${CARPETA}/reproduccion.ts`))
afirmar(/if \(!r\.corre \|\| paso >= total\) return undefined/.test(reproduccion), '  los pasos avanzan solos sólo mientras corre (con movimiento reducido, a mano)')
afirmar(/role="region"\s+aria-label=\{`Demo de \$\{NOMBRE_DE_LA_DEMO\[demo\]\}, con datos de ejemplo`\}/.test(cargador) && /aria-pressed=\{r\.pausada\}/.test(marco) && /data-parte="saltar-la-demo"/.test(cargador), '  es una región con nombre, la que se mueve sola tiene su botón de pausa, y el teclado la puede saltar entera')

cerrar('s45-nocturno')
