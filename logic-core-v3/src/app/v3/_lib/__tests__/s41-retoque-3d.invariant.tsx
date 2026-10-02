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
 *
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/` (un `mirar.txt` por bloque y el `LEEME.txt`).
 */
import { readFileSync } from 'node:fs'

import { avanzarElPolvo, polvoInicial } from '../escena/polvo/posarse'
import { corrimiento } from '../escena/titulos3d/colocacion'
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
const terminaLaLlegada = (c: string): boolean => /m\.llegada = persigue\(m\.llegada, enViaje \? 0 : m\.llegada > 0 \? 1 : a\.titulo\.llegada, dt\)/.test(c)
afirmar(terminaLaLlegada(escena), '  la llegada, una vez empezada, termina: el scroll para atrás a mitad de camino no la deja a medio armar («Portf\'o»)')
controlPositivo('el detector VE la llegada que sigue al scroll para atrás', escena.replace('m.llegada > 0 ? 1 : a.titulo.llegada', 'a.titulo.llegada'), terminaLaLlegada)
const conSuSeccion = (c: string): boolean => /correr\(a, d\)/.test(c) && /const d = corrimiento\(a\.pin, y\)/.test(c)
afirmar(conSuSeccion(escena), '  llegado, va corrido con su escenario: sale con la sección, sin animación propia')
controlPositivo('el detector VE el título clavado en el mundo', escena.replace('correr(a, d)', 'correr(a, 0)'), conSuSeccion)
const pin = { inicio: 5073, fin: 10986 }
afirmar(corrimiento(pin, 4573) === 500 && corrimiento(pin, 7000) === 0 && corrimiento(pin, 11486) === -500, '  el corrimiento: antes del escenario clavado baja con la sección, clavado no se mueve, después sube con ella')
afirmar(/if \(fuera\) m\.llegada = 0/.test(escena) && /return m\.llegada > 0 && !fuera && !tapado/.test(escena), '  fuera del cuadro no se dibuja y se rearma para la próxima llegada (desde Por qué develOP ya no se ve de espaldas)')
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

cerrar('s41-retoque-3d')
