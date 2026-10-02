/**
 * SPRINT RETOQUE 3D — el invariante: npm run test:s41-retoque-3d
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   B1 · el título de Portfolio sin salida propia: la llegada, una vez empezada, termina; llegado, se queda y se va con
 *        su sección (corrido con su escenario); fuera del cuadro se rearma; lo esconde la primera foto del túnel tapando
 *        el cuadro, y mientras tanto no cambia (la llegada después de un viaje espera a que se vea).
 *   B2 · el polvo posado: cualquier scroll lo levanta (la levantada sube a su lugar en el aire).
 *   B3 · el remolino de noche: el remolino del despertar sólo con el cursor; el del scroll, sólo el frente.
 *   B4 · «Y más…» de Tu panel aparece y se va en su lugar (una corrida corta con fundido), no cruzando la pantalla.
 *   B5 · «para elegirnos» separado del primer valor: la frase sube más (con el mismo lugar de las columnas) y el título
 *        de volumen sube con la levantada, como su pieza del DOM.
 *   3A · el titular del hero en volumen (Archivo 700 y la Chivo 300 itálica): las letras llegan una vez por carga desde
 *        lugares al azar de la sala; el DOM se pinta primero (LCP) y se apaga con una opacidad (sigue en el árbol
 *        accesible); va con la página (`pantalla`), sin salida.
 *   3C · «El equipo» se levanta de acostado a parado con el progreso de su máscara (y se acuesta para atrás); acostado,
 *        su línea lo tapa: lo que queda debajo del pie de la palabra no se dibuja.
 *
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/` (un `mirar.txt` por bloque y el `LEEME.txt`).
 */
import { readFileSync } from 'node:fs'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { avanzarElPolvo, polvoInicial } from '../escena/polvo/posarse'
import { corrimiento } from '../escena/titulos3d/colocacion'
import { armarElTitulo } from '../escena/titulos3d/geometria'
import { DISOLVER_GLSL, LLEGADA_NORMAL_GLSL, LLEGADA_POSICION_GLSL } from '../escena/titulos3d/llegada'
import { CONTENIDO as CONTENIDO_DEL_HERO } from '../../_secciones/hero/contenido'
import { CONTENIDO as CONTENIDO_DE_QUIENES } from '../../_secciones/quienes-somos/contenido'
import { CORRIDAS_DEL_REMATE } from '../../_secciones/tu-panel/entrada'
import { SUBIDA_DE_LA_FRASE_SVH } from '../../_secciones/por-que-develop/geometria'
import { primeraFotoTapa, progresoDelPxDelTunel } from '../../_secciones/trabajos/geometria'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1 · Portfolio: sin salida propia, se queda y se va con su sección')

const piezas = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
const porQue = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
afirmar(/<TituloDeVolumen id="portfolio"[^>]*\squeda \/>/.test(piezas) && !/<TituloDeVolumen[^>]*\squeda/.test(porQue), 'Portfolio se queda (`queda`); la frase de Por qué develOP sigue con su salida')
const escena = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const terminaLaLlegada = (c: string): boolean => /m\.llegada = persigue\(m\.llegada, seVa \? 0 : m\.llegada > 0 \? 1 : a\.titulo\.llegada, dt, /.test(c)
afirmar(terminaLaLlegada(escena), '  la llegada, una vez empezada, termina: el scroll para atrás a mitad de camino no la deja a medio armar («Portf\'o»)')
controlPositivo('el detector VE la llegada que sigue al scroll para atrás', escena.replace('m.llegada > 0 ? 1 : a.titulo.llegada', 'a.titulo.llegada'), terminaLaLlegada)
const conSuSeccion = (c: string): boolean => /correr\(a, d\)/.test(c) && /const d = corrimiento\(a\.pin, y\)/.test(c)
afirmar(conSuSeccion(escena), '  llegado, va corrido con su escenario: sale con la sección, sin animación propia')
controlPositivo('el detector VE el título clavado en el mundo', escena.replace('correr(a, d)', 'correr(a, 0)'), conSuSeccion)
const pin = { inicio: 5073, fin: 10986 }
afirmar(corrimiento(pin, 4573) === 500 && corrimiento(pin, 7000) === 0 && corrimiento(pin, 11486) === -500, '  el corrimiento: antes del escenario clavado baja con la sección, clavado no se mueve, después sube con ella')
afirmar(/if \(fuera\) \{\s*if \(a\.titulo\.rearma\) m\.llegada = 0/.test(escena) && /const visible = m\.llegada > 0 && !fuera && !tapado/.test(escena), '  fuera del cuadro no se dibuja y se rearma para la próxima llegada (desde Por qué develOP ya no se ve de espaldas)')
const tapa = (f: (p: number) => boolean): boolean => !f(progresoDelPxDelTunel(0)) && !f(progresoDelPxDelTunel(400)) && f(progresoDelPxDelTunel(910))
afirmar(tapa(primeraFotoTapa), '  lo esconde la primera foto del túnel recién cuando tapa el cuadro entero (no la huida del cartel: ahí todavía se veía)')
controlPositivo('el detector VE el escondido con la foto chica', (p: number) => p >= progresoDelPxDelTunel(300), tapa)
afirmar(/else if \(!tapado\) m\.llegada = persigue/.test(escena), '  tapado, nada cambia: después de un viaje desde más allá del túnel la llegada espera a que se vea')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B2 · El polvo posado: cualquier scroll lo levanta')

const simulacion = leer('_lib/escena/polvo/simulacion.ts')
const sube = (c: string): boolean => /vec3 lugar = cercaDeLasCaras \? vec3\( p\.x, f\.y, p\.z \) : f;/.test(c) && /p \+= relajar\( v, viento \+ hacia, /.test(c) && !/viento \+ vec3\( 0\.0, - \$\{FISICA\.soplo\.gravedad/.test(c)
afirmar(sube(simulacion), 'la levantada SUBE a su lugar en el aire (cerca de las caras de la caja, a su altura), no la devuelve la gravedad ni el resorte lento del aire', 'medido con un scroll de una muesca: la altura media de la suelta de −4,2 a +3,9 en 5 s (antes, −4,2 a −3,9 y el 44 % nunca salió del piso)')
controlPositivo('el detector VE la levantada con gravedad de antes', simulacion.replace('viento + hacia, ', 'viento + vec3( 0.0, - ${FISICA.soplo.gravedad.toFixed(2)}, 0.0 ), '), sube)
afirmar(/bool llego = distance\( p, f \) < /.test(simulacion) && /if \( !cercaDeLasCaras && llego \) \{/.test(simulacion), '  se le entrega al aire cuando llegó a su lugar (o el suyo es debajo del piso, donde se funde): sin salto')
const fisica = leer('_lib/escena/polvo/Fisica.tsx')
afirmar(/const scroll = !Number\.isNaN\(m\.progreso\) && Math\.abs\(progreso - m\.progreso\) > 1e-6/.test(fisica), '  el despertar es cualquier cambio del scroll (un píxel de los 27.705 de la página es 3,6e-5 > 1e-6)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B3 · El remolino de noche: sólo el cursor arma remolino')

const conRemolinoSoloDelCursor = (c: string): boolean => /\+ vec3\( radial\.x, 0\.0, radial\.y \) \* aspira \) \* uRemolino;/.test(c)
afirmar(conRemolinoSoloDelCursor(simulacion), 'el giro, la subida por el centro y la aspiración del despertar, multiplicados por `uRemolino`; el frente queda para los dos', 'la causa: el despertar del scroll armaba el vórtice en un punto fijo 6 u delante de la cámara; de noche las motas encendidas lo volvían un embudo de luz que la cámara dejaba atrás')
controlPositivo('el detector VE el remolino de siempre', simulacion.replace(' * aspira ) * uRemolino;', ' * aspira );'), conRemolinoSoloDelCursor)
afirmar(/p\.remolino = despertar\.delCursor \? 1 : 0/.test(fisica) && /delCursor = true/.test(fisica), '  el estado del polvo recuerda de dónde salió el despertar: el cursor (con su punto en el piso) o el scroll')
const delScroll = avanzarElPolvo(polvoInicial(0), 10, [0, 0, 0], false)
const delCursor = avanzarElPolvo(polvoInicial(0), 10, [1, 0, 1], false, true)
afirmar(!delScroll.delCursor && delCursor.delCursor && avanzarElPolvo(delCursor, 10.1, [5, 0, 5], false).delCursor, '  y lo guarda mientras dura el movimiento (sólo cambia al despertar de una quietud)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B4 · «Y más…»: aparece y se va en su lugar')

const remate = sinComentarios(leer('_secciones/tu-panel/Remate.tsx'))
const enSuLugar = (c: string): boolean => /const desde = t\.pieza === 'punto' \? corrida : corrida \* CORRIDAS_DEL_REMATE/.test(c) && !/window\.innerWidth/.test(c) && /\{ opacity: 0, transform: `translateX\(\$\{desde\}px\)` \}/.test(c)
afirmar(enSuLugar(remate) && CORRIDAS_DEL_REMATE <= 4, 'la frase y el newsletter entran con una corrida corta desde la derecha y un fundido (y se van igual, en espejo): no salen del borde del cuadro', `${String(CORRIDAS_DEL_REMATE)} corridas de --spacing-8`)
controlPositivo('el detector VE la entrada desde el borde del cuadro', remate.replace('corrida * CORRIDAS_DEL_REMATE', 'window.innerWidth - el.getBoundingClientRect().left'), enSuLugar)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B5 · «para elegirnos» y el primer valor, separados')

const geoPorQue = leer('_secciones/por-que-develop/geometria.ts')
const arribaDeLosValores = (): number => {
  const m = /const ARRIBA_DE_LOS_VALORES_SVH = 50 - SUBIDA_DE_LA_FRASE_SVH \+ (\d+)/.exec(geoPorQue)
  return m === null ? NaN : 50 - SUBIDA_DE_LA_FRASE_SVH + Number(m[1])
}
afirmar(SUBIDA_DE_LA_FRASE_SVH === 33 && arribaDeLosValores() === 27, 'la frase sube 3 svh más y las columnas quedan donde estaban (27 svh): el aire entre los dos pasa de 7 a 10 svh', 'medido a 1440 × 900: de la «g» del 3D al ícono de «Calidad que se nota», 16 px → 43 px')
const subeConLaLevantada = (c: string): boolean => /const corrida = useTransform\(levantada, \(u\) => \(-u \* SUBIDA_DE_LA_LEVANTADA_SVH\) \/ 100\)/.test(c) && (c.match(/salida: levantada, corrida \}\}/g) ?? []).length === 2
afirmar(subeConLaLevantada(porQue), '  el título de volumen de la frase sube con la levantada (la misma subida que su pieza del DOM): los valores ya no le pasan por encima')
controlPositivo('el detector VE la frase clavada mientras suben los valores', porQue.replace(/salida: levantada, corrida \}\}/g, 'salida: levantada }}'), subeConLaLevantada)
afirmar(/a\.grupo\.position\.copy\(a\.base\)\.addScaledVector\(a\.arriba, -\(d \+ a\.titulo\.corrida \* alto\) \* a\.mundoPorPx\)/.test(escena), '  en la escena, la corrida se suma al corrimiento del escenario (el mismo paso para todos los títulos)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3A · El titular del hero en volumen: desde el azar de la sala, una vez')

const fuenteDe = (archivo: string): FontData => JSON.parse(readFileSync(`${V3}/_fuentes/${archivo}`, 'utf8')) as FontData
const archivo = fuenteDe('archivo-700-titulos.json')
const italica = fuenteDe('chivo-300-italica-titulos.json')
const registro1 = `${CONTENIDO_DEL_HERO.titularFila1} ${CONTENIDO_DEL_HERO.titularFila2}`.toUpperCase()
const registro2 = CONTENIDO_DEL_HERO.titularFila3.toUpperCase()
const cubre = (g: FontData['glyphs'], t: string): boolean => [...t].every((c) => g[c] !== undefined)
afirmar(cubre(archivo.glyphs, registro1) && cubre(italica.glyphs, registro2) && /wght 700/.test(String(archivo.original_font_information.fontSubfamily)) && /wght 300/.test(String(italica.original_font_information.fontSubfamily)), 'cada registro con la fuente que el DOM pinta (Archivo 700 y la Chivo 300 itálica), en mayúsculas como el `uppercase`: cada letra tiene su glifo', `${registro1} · ${registro2}`)
controlPositivo('el detector VE el registro en minúsculas (como está en el contenido)', `${CONTENIDO_DEL_HERO.titularFila1}`, (t: string) => cubre(archivo.glyphs, t))
const hero = sinComentarios(leer('_secciones/hero/Hero.tsx'))
const unaVezDesdeElAzar = (c: string): boolean => (c.match(/gesto: 'azar', llegada: null, queda: true, rearma: false/g) ?? []).length === 2
afirmar(unaVezDesdeElAzar(hero) && /fuente: 'archivo-700'/.test(hero) && /fuente: 'chivo-300-italica'/.test(hero), '  los dos registros llegan desde el azar, solos y una vez (al armarse; no se rearman ni se van en un viaje), sin salida')
controlPositivo('el detector VE un registro que se rearma', hero.replace('rearma: false', 'rearma: true'), unaVezDesdeElAzar)
const usa = sinComentarios(leer('_componentes/titulos3d/useTextoDeVolumen.ts'))
const clase = /TEXTO_REEMPLAZADO = '([^']*)'/.exec(usa)?.[1] ?? ''
afirmar(/listo1 && TEXTO_REEMPLAZADO/.test(hero) && /listo2 && TEXTO_REEMPLAZADO/.test(hero) && clase.startsWith('escritorio:opacity-0 ') && !clase.includes('invisible'), '  el DOM se pinta primero (el LCP) y, con el título armado, se apaga con una opacidad desde 1024: sigue en el árbol accesible (es el `h1`)')
const fuenteDelHero = new Font(archivo)
const conAzar = armarElTitulo(fuenteDelHero, registro1, null, 'azar')
const desde = conAzar.geometria.getAttribute('aDesde')
const distintos = new Set<string>()
for (let k = 0; k < desde.count; k += 1) distintos.add(`${desde.getX(k).toFixed(2)},${desde.getY(k).toFixed(2)},${desde.getZ(k).toFixed(2)}`)
const repetido = armarElTitulo(fuenteDelHero, registro1, null, 'azar').geometria.getAttribute('aDesde')
afirmar(distintos.size === conAzar.letras && repetido.getX(0) === desde.getX(0) && [...distintos].every((d) => Number(d.split(',')[2]) < 0), '  cada letra sale de un lugar distinto de la sala (sembrado: el mismo en cada carga), nunca de delante de la cámara', `${String(distintos.size)} lugares para ${String(conAzar.letras)} letras`)
const enFila = armarElTitulo(fuenteDelHero, registro1).geometria.getAttribute('aDesde')
afirmar(enFila.getX(0) === 0 && enFila.getZ(0) < 0, '  y los títulos de siempre (`letras`) salen de donde salían (de atrás, `aDesde` constante)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3C · «El equipo» se levanta en su lugar; acostado, su línea lo tapa')

const equipo = sinComentarios(leer('_secciones/quienes-somos/equipo.tsx'))
const seLevantaConLaMascara = (c: string): boolean => /useTextoDeVolumen<HTMLHeadingElement>\(\{ id: 'equipo', texto: CONTENIDO\.tituloDelEquipo, fuente: 'chivo-400', gesto: 'levanta', llegada: progreso, queda: false \}\)/.test(c)
afirmar(seLevantaConLaMascara(equipo) && CONTENIDO_DE_QUIENES.tituloDelEquipo === 'El equipo', 'con el progreso de su máscara (y se acuesta con el scroll para atrás: no se queda), con la Chivo del DOM')
controlPositivo('el detector VE el que se queda', equipo.replace('queda: false', 'queda: true'), seLevantaConLaMascara)
afirmar(/<CanalDeTexto progreso=\{progreso\} tipo="titulo" texto=\{CONTENIDO\.tituloDelEquipo\}>/.test(equipo) && /listo && TEXTO_REEMPLAZADO/.test(equipo), '  el canal del texto sigue (sin WebGL o hasta que se arma, el de siempre); armado, el DOM se apaga')
afirmar(/mat3 alzado = mat3\( 1\.0, 0\.0, 0\.0, 0\.0, cos\( acostada \), sin\( acostada \), 0\.0, - sin\( acostada \), cos\( acostada \) \);/.test(LLEGADA_NORMAL_GLSL) && /transformed = mix\( enCamino, pieDeLaLetra \+ alzado \* \( transformed - pieDeLaLetra \), uLevanta \);/.test(LLEGADA_POSICION_GLSL), '  acostada hacia adelante sobre el pie de atrás de la palabra (de _ a |)')
// La cuenta del giro, en el plano (y, z) relativo al pie (atrás y abajo de la palabra): acostada, a 90°.
const giro = (y: number, z: number, a: number): readonly [number, number] => [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
const espesor = 0.15
const debajoDelPie = (ps: readonly (readonly [number, number])[]): boolean => ps.every(([y]) => y <= 1e-9)
afirmar(debajoDelPie([giro(0.7, espesor, Math.PI / 2), giro(0, espesor, Math.PI / 2), giro(0.7, 0, Math.PI / 2)]), '  la cuenta: acostada, cada punto de la letra queda a la altura del pie o debajo (el recorte la tapa entera)')
controlPositivo('el detector VE la acostada hacia atrás (se vería arriba de la línea)', [giro(0.7, espesor, -Math.PI / 2)], debajoDelPie)
afirmar(/if \( vSobreElPie < 0\.002 \) discard;/.test(DISOLVER_GLSL), '  lo que queda debajo del pie no se dibuja: aparece de la nada recién cuando se levanta')

cerrar('s41-retoque-3d')
