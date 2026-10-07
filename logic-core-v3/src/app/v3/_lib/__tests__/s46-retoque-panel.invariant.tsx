/**
 * RETOQUE: TU PANEL Y TEXTOS 3D — el invariante: npm run test:s46-retoque-panel
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   T1 · Tu panel: cada demo se usa en su lugar (sin la grande ni la miniatura), al tamaño que necesita, con los bordes
 *        fundidos (`panelborde=a|b`); sin la tarjeta «En vivo»; los nombres de los leads, enteros (lo demás, en s6).
 *   T2 · adentro de una demo de Tu panel, el clic suena el pestillo de la barra y los CTA (sin el clic propio).
 *   T3 · «Seis razones / para elegirnos» llega y se queda quieta un tramo antes de irse (la salida lenta sigue).
 *   T4 · el titular de Quiénes somos en volumen: lo marcado con su peso y su raya extruida, el ≠ con sus cuatro trazos
 *        (la misma cuenta y el mismo orden que en el DOM), y el cuerpo y el equipo en el plano de su título.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-panel/LEEME.txt`.
 */
import { readFileSync } from 'node:fs'

import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { CURVAS } from '../motion/curvas'
import { entornoPedido } from '../escena/entorno'
import { TIEMPOS_DEL_FINAL, progresoDelPin } from '../escena/finalDelRecorrido'
import { pantallasDe } from '../escena/anclaje'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { armarElTitulo } from '../escena/titulos3d/geometria'
import { DISOLVER_GLSL, LLEGADA_PARS_GLSL, LLEGADA_POSICION_GLSL } from '../escena/titulos3d/llegada'
import { VENTANA_DE_LA_FRASE, VENTANA_DE_LA_LEVANTADA, VENTANA_DE_LA_SUBIDA_DE_LA_FRASE, ventanaDelValor } from '../../_secciones/por-que-develop/geometria'
import { CORTE_DE_LA_VENTANA_DEL_TRAZO } from '../../_secciones/_contrato/bloqueAnimado'
import { TRAMOS_DEL_TITULAR } from '../../_secciones/quienes-somos/contenido'
import { avanceDelTrazo, avancesDelSigno, principal } from '../../_secciones/quienes-somos/trazos3d'
import { TABLA_DEL_CAOS, escalaDeLaDemo } from '../../_secciones/tu-panel/geometria'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · Tu panel: las demos en su lugar, al tamaño que necesitan, con los bordes fundidos')

const TU_PANEL = sinComentarios(leer('_secciones/tu-panel/TuPanel.tsx'))
const TARJETA = sinComentarios(leer('_secciones/tu-panel/Tarjeta.tsx'))
const enSuLugar = (tuPanel: string, tarjeta: string): boolean => !/PanelEnVivo/.test(tuPanel) && /<DemoEnSuLugar /.test(tarjeta) && !/MiniaturaDeLaDemo|Ampliacion|<button/.test(tarjeta)
afirmar(enSuLugar(TU_PANEL, TARJETA), 'sin la tarjeta «En vivo», sin la miniatura y sin la ampliación: la tarjeta no es un botón, lleva la demo usable')
controlPositivo('  el chequeo vería la tarjeta de antes (un botón con la miniatura)', [TU_PANEL, '<button><MiniaturaDeLaDemo demo={tarjeta.demo} /></button>'], ([a, b]: string[]) => enSuLugar(a, b))
// [PASADA FINAL] B1/B2 · la especificación cambió: el panel entero a escala reducida (0,65 a 0,9 a 1440) en el caos del
// nocturno, y el marco con esquinas y sombra (la prueba `panelborde` se borró). Lo fija `s6-tu-panel` §6-§9 y s47 (B).
const a1440 = TABLA_DEL_CAOS.map((_, i) => escalaDeLaDemo(i, 1376))
afirmar(a1440.every((e) => e >= 0.65 && e <= 0.9), 'a 1440 cada demo se ve entera a escala reducida (0,65 a 0,9): se lee y se usa en su lugar', a1440.map((e) => e.toFixed(2)).join(' · '))
afirmar(!('panelBorde' in entornoPedido('producto').pruebas), 'la prueba `panelborde` ya no existe: el marco flota con esquinas y sombra (B2)')
const tarjetaDeLead = sinComentarios(leer('_panel-vivo/demos/leads/TarjetaDeLead.tsx'))
const detalleDelLead = sinComentarios(leer('_panel-vivo/demos/leads/DetalleDelLead.tsx'))
const nombreEntero = (f: string): boolean => /\{lead\.name \?\? 'Sin nombre'\}/.test(f) && !/className="truncate[^"]*">\{lead\.name/.test(f)
afirmar(nombreEntero(tarjetaDeLead) && nombreEntero(detalleDelLead), 'en las copias, el nombre del lead no se corta (baja de renglón)')
controlPositivo('  el chequeo vería el nombre cortado del panel real', '<h3 className="truncate text-base">{lead.name ?? \'Sin nombre\'}</h3>', nombreEntero)
const proxima = readFileSync('docs/rediseno/PROXIMA-ETAPA.md', 'utf8')
afirmar(/Para Franco[^\n]*ConversationsTable[^\n]*HUMAN_REQUEST/.test(proxima) && /Para Franco[^\n]*LeadDetail[^\n]*min[uú]scula/.test(proxima) && /Para Franco[^\n]*BusinessLeadCard[^\n]*truncate/.test(proxima), '  y las tres cosas del panel real quedan anotadas para Franco (el dashboard no se tocó)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · Adentro de las demos, el pestillo de la barra y los CTA')

const SONIDO = sinComentarios(leer('_chrome/sonido/ControlDelSonido.tsx'))
const pestilloEnLasDemos = (f: string): boolean => /const DE_LAS_DEMOS_DEL_PANEL = '\[data-pieza="demo-del-panel"\]'/.test(f) && /if \(blanco\.closest\(DE_LAS_DEMOS_DEL_PANEL\) !== null\) \{\s*if \(blanco\.closest\(ENLACES_Y_BOTONES\) !== null\) sonar\('pestillo'\)\s*return\s*\}/.test(f)
afirmar(pestilloEnLasDemos(SONIDO) && sinComentarios(leer('_panel-vivo/DemoDelPanel.tsx')).includes('data-pieza="demo-del-panel"'), 'lo que se toca adentro de una demo suena el pestillo, y nada más (la demo es la región que lo marca)')
controlPositivo('  el chequeo vería el clic de siempre en las demos', SONIDO.replace(/if \(blanco\.closest\(DE_LAS_DEMOS_DEL_PANEL\)[\s\S]*?return\s*\}/, ''), pestilloEnLasDemos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T3 · La frase llega y se queda quieta un tramo antes de irse')

/** Lo quieta que queda (pantallas): de que termina de llegar a que empieza a moverse (la cámara y la subida, juntas). */
const quieta = (frase: { readonly hasta: number }, llegaHasta: number, subeDesde: number): number => Math.min(frase.hasta, subeDesde) - llegaHasta
const enPantallas = (p: number): number => p * (progresoDelPin(1) === 0 ? 1 : 1 / progresoDelPin(1))
const sostenida = quieta(TIEMPOS_DEL_FINAL.frase, enPantallas(VENTANA_DE_LA_FRASE.hasta), enPantallas(VENTANA_DE_LA_SUBIDA_DE_LA_FRASE.desde))
afirmar(sostenida >= 0.5, 'después de llegar, la frase queda quieta media pantalla (la cámara y la frase no se mueven)', `${sostenida.toFixed(2)} pantallas`)
controlPositivo('  el chequeo vería la de antes (la cámara se movía apenas llegaba: 0,05 pantallas)', quieta({ hasta: 0.5 }, 0.45, 0.5), (q: number) => q >= 0.5)
// El tramo quieto se cumple sólo si la escena llega a la sección a tiempo: el mapeo es proporcional a la tabla de
// secciones, y Tu panel (5,9 pantallas a 1440 desde T1) declaraba 2 (la cámara llegaba media pantalla antes).
const declarado = pantallasDe(seccionDe('tu-panel').alto)
afirmar(declarado >= 5.5, '  y la escena llega a tiempo: la tabla declara el alto real de Tu panel (el mapeo es proporcional)', `${String(declarado)} pantallas`)
controlPositivo('  el chequeo vería la tabla de antes (200svh)', pantallasDe('200svh'), (d: number) => d >= 5.5)
afirmar(VENTANA_DE_LA_SUBIDA_DE_LA_FRASE.hasta <= Math.min(...[0, 1, 2, 3, 4, 5].map((i) => ventanaDelValor(i).desde)) && VENTANA_DE_LA_LEVANTADA.desde === progresoDelPin(TIEMPOS_DEL_FINAL.valores.hasta), '  después sube, llegan los valores, y recién con la levantada se va (con la salida lenta de A5)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T4 · Quiénes somos en volumen: el titular, sus rayas, el ≠, y el cuerpo y el equipo en su plano')

const fuente = (nombre: string): Font => new Font(JSON.parse(readFileSync(`${V3}/_fuentes/${nombre}.json`, 'utf8')) as FontData)
const tiene = (f: Font, texto: string): boolean => [...texto].every((c) => c.trim() === '' || f.data.glyphs[c] !== undefined)
afirmar(TRAMOS_DEL_TITULAR.every((r) => tiene(fuente('chivo-400-titulos'), r.antes) && tiene(fuente(r.tipo === 'subrayado' ? 'chivo-700-titulos' : 'chivo-300-titulos'), `${r.marcado}${r.cierre}`)), 'cada parte del titular tiene sus letras en su fuente: lo de siempre en la 400, lo subrayado en la 700 y lo tachado en la 300 (los pesos del DOM)')
const muestras = Array.from({ length: 21 }, (_, k) => k / 20)
afirmar(muestras.every((t) => Math.abs(principal(t) - CURVAS.principal(t)) < 1e-12), 'las rayas crecen con la curva de las del DOM (`CURVAS.principal`, escrita en la sección para no traer el sistema de motion)')
const C = CORTE_DE_LA_VENTANA_DEL_TRAZO
afirmar(avanceDelTrazo('subrayado', C) === 1 && avanceDelTrazo('tachado', C) === 0 && avanceDelTrazo('tachado', 1) === 1, '  el mismo orden: el subrayado termina antes de que empiece el tachado')
const signo = avancesDelSigno(C * 0.4)
afirmar(signo[0] > signo[1] && signo[1] >= 0 && signo[2] === 0 && avancesDelSigno(1)[2] === 1 && avancesDelSigno(C + 0.1)[2] === avanceDelTrazo('tachado', C + 0.1), '  el ≠: la barra de arriba un poco antes que la de abajo, y la diagonal con el tachado')
// La geometría: una raya es una barra extruida con su índice; un título sin letras (el ≠) se arma igual.
const raya = { indice: 0, x1: 0, y1: -0.2, x2: 2, y2: -0.2, grosor: 0.05, nace: 'punta' as const }
const conRaya = armarElTitulo(fuente('chivo-700-titulos'), 'algo', null, 'levanta', [raya])
const indices = new Set(Array.from(conRaya.geometria.getAttribute('aTrazo').array))
afirmar(indices.has(0) && indices.has(1) && conRaya.letras === 4 && conRaya.cajaDeLasLetras.min.y > -0.3, 'el título con su raya: las letras con índice 0, la raya con el suyo, y el pie de la palabra sale de las letras solas')
const sinLetras = armarElTitulo(fuente('chivo-400-titulos'), '', null, 'letras', [raya, { ...raya, indice: 1, y1: 0.2, y2: 0.2, nace: 'medio' }])
const posiciones = Array.from(sinLetras.geometria.getAttribute('position').array)
afirmar(sinLetras.letras === 0 && sinLetras.cajaDeLasLetras.isEmpty() && posiciones.length > 0 && posiciones.every(Number.isFinite), 'el ≠, sin letras: sólo sus rayas (y su caja de letras vacía, que la escena no usa de pie)')
const armado = sinComentarios(leer('_lib/escena/titulos3d/armado.ts'))
afirmar(/cajaDeLasLetras\.isEmpty\(\) \? new THREE\.Vector2\(\)/.test(armado), '  la escena no le pasa al sombreador el pie de una caja vacía (sería infinito y daría NaN)')
afirmar(/uniform vec4 uTrazos;/.test(LLEGADA_PARS_GLSL) && /transformed \+= esTrazo \* aEjeDelTrazo \* dot\( transformed - aOrigenDelTrazo, aEjeDelTrazo \) \* \( sDelTrazo - 1\.0 \);/.test(LLEGADA_POSICION_GLSL) && /if \( vDelTrazo < 0\.002 \) discard;/.test(DISOLVER_GLSL), 'el vértice estira cada raya desde su origen con su avance; sin avance no deja un punto pintado')
const QUIENES = sinComentarios(leer('_secciones/quienes-somos/QuienesSomos.tsx'))
const EQUIPO = sinComentarios(leer('_secciones/quienes-somos/equipo.tsx'))
const TITULAR = sinComentarios(leer('_secciones/quienes-somos/titular3d.tsx'))
afirmar(/<RenglonDeVolumen renglon=\{TRAMOS_DEL_TITULAR\[indice\]\}/.test(QUIENES) && /<SignoDeVolumen progreso=\{progresoDelSigno\} \/>/.test(QUIENES) && (TITULAR.match(/useTextoDeVolumen</g) ?? []).length === 3, 'el titular (dos títulos por renglón) y el ≠ van en volumen, desde 1024 (`useTextoDeVolumen` sólo se anota en escritorio)')
const enElPlano = (f: string, id: string): boolean => new RegExp(`useAcompananteDelTitulo<HTMLDivElement>\\('${id}'\\)`).test(f) && /<div ref=\{enElPlano\}/.test(f)
// [NOCTURNO FINAL] D1 · la foto de «Nosotros» también va en el plano de su título (otro `enElPlano` en el archivo): el
// chequeo del equipo mira el cuerpo de `ElEquipo`.
const deElEquipo = (f: string): string => f.slice(f.indexOf('export function ElEquipo'), f.indexOf('export function LaFoto'))
afirmar(enElPlano(QUIENES, 'agencia-signo') && enElPlano(deElEquipo(EQUIPO), 'equipo'), 'el cuerpo va en el plano del ≠ y las personas (textos y fotos) en el de «El equipo», como A1')
controlPositivo('  el chequeo vería el equipo suelto', EQUIPO.replace('<div ref={enElPlano}', '<div'), (f: string) => enElPlano(deElEquipo(f), 'equipo'))

cerrar('s46-retoque-panel')
