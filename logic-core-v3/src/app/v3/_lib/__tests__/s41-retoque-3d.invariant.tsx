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
 *   3D · las fotos del equipo llegan desde atrás en un marco con espesor (CSS 3D, el hover no cambia) y quedan fijas; al
 *        revés con el scroll para arriba; planas sin coreografía.
 *   3E · los libros de las demos se levantan desde atrás sobre su base (y se acuestan para atrás).
 *   3G · cada valor de Por qué develOP (ícono, título y texto) llega desde un lugar distinto de la sala (CSS 3D).
 *   3H · el cierre del túnel: sin «Hablemos» ni «(un clic y arrancamos)»; abajo y centrado «Clickeá acá para empezar»,
 *        el gris más tenue con 3:1 (texto grande) sobre el papel de la ventana; lleva al pie.
 *   3I · el pie en volumen (CSS 3D: paredes y piso que miran al logo; todo lo que se toca, del DOM); el contacto es un
 *        formulario (nombre, mail, mensaje) que no envía y lo dice; WhatsApp afuera; todo apunta a contacto.
 *   N1 · «Contacto» sale de la pastilla: con «Login» (el login del sitio) en la esquina de arriba a la derecha; en el
 *        teléfono, los dos separados al pie del menú de vidrio.
 *   N2 · el infinito del recorrido, 1,3 veces más grande (y el parlante corrido con él).
 *   Partículas · tres variantes con bandera (`polvo=a|b|c`; la de hoy, la referencia): cambian cuántas, el tamaño, el
 *        brillo y la forma; la posición la sigue escribiendo la física (lo aprobado anda igual en las tres).
 *
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/` (un `mirar.txt` por bloque y el `LEEME.txt`).
 */
import { existsSync, readFileSync } from 'node:fs'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { avanzarElPolvo, polvoInicial } from '../escena/polvo/posarse'
import { corrimiento } from '../escena/titulos3d/colocacion'
import { armarElTitulo } from '../escena/titulos3d/geometria'
import { DISOLVER_GLSL, LLEGADA_NORMAL_GLSL, LLEGADA_POSICION_GLSL } from '../escena/titulos3d/llegada'
import { CONTENIDO as CONTENIDO_DEL_HERO } from '../../_secciones/hero/contenido'
import { CONTENIDO as CONTENIDO_DE_QUIENES } from '../../_secciones/quienes-somos/contenido'
import { CORRIDAS_DEL_REMATE } from '../../_secciones/tu-panel/entrada'
import { SUBIDA_DE_LA_FRASE_SVH } from '../../_secciones/por-que-develop/geometria'
import { LIBRO_QUE_LLEGA, poseDelLibro } from '../../_secciones/trabajos/demos/entrada'
import { DESDE_DONDE_LLEGAN, poseDelValor } from '../../_secciones/por-que-develop/valorEnVolumen'
import { primeraFotoTapa, progresoDelPxDelTunel } from '../../_secciones/trabajos/geometria'
import { CONTENIDO as CONTENIDO_DE_TRABAJOS } from '../../_secciones/trabajos/contenido'
import { PORCENTAJE_DE_TINTA_TENUE } from '../../_secciones/trabajos/ventana'
import { ENLACES_DE_SECCION, ENLACE_DE_CONTACTO, ENLACE_DE_LOGIN } from '../../_chrome/enlaces'
import { afirmar, cerrar, controlPositivo, razonDeContraste, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1 · Portfolio: sin salida propia, se queda y se va con su sección')

const piezas = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
const porQue = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
// [CIERRE RETOQUE 3D] B6: la frase de Por qué develOP también se queda (s42 · B6).
afirmar(/<TituloDeVolumen id="portfolio"[^>]*\squeda \/>/.test(piezas) && porQue.length > 0, 'Portfolio se queda (`queda`)')
const escena = sinComentarios((leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx') + leer('_lib/escena/titulos3d/armado.ts')))
// [RONDA 2] F2: la llegada de Portfolio ya no «termina lo que empezó» (con el scroll rápido quedaba en «Portfoli»): es función del scroll, con el asiento al frenar (s43 · F2).
// [NOCTURNO] A4: con su mínimo de tiempo (la llegada larga de ESCENA 10; s45 · A4).
const terminaLaLlegada = (c: string): boolean => /if \(a\.titulo\.rearma\) m\.llegada = mostradoDelScroll\(m\.llegada, enViaje \? 0 : a\.titulo\.llegada, asentar, dt, enViaje \? null : a\.titulo\.minimoS\)/.test(c)
afirmar(terminaLaLlegada(escena), '  la llegada de Portfolio es función del scroll: a cualquier velocidad, un estado coherente; al frenar, armado o desarmado del todo')
controlPositivo('el detector VE la llegada que termina lo que empezó', escena.replace('mostradoDelScroll(m.llegada, enViaje ? 0 : a.titulo.llegada, asentar, dt, enViaje ? null : a.titulo.minimoS)', 'persigue(m.llegada, m.llegada > 0 ? 1 : a.titulo.llegada, dt)'), terminaLaLlegada)
const conSuSeccion = (c: string): boolean => /correr\(a, d\)/.test(c) && /const d = corrimiento\(a\.pin, y\)/.test(c)
afirmar(conSuSeccion(escena), '  llegado, va corrido con su escenario: sale con la sección, sin animación propia')
controlPositivo('el detector VE el título clavado en el mundo', escena.replace('correr(a, d)', 'correr(a, 0)'), conSuSeccion)
const pin = { inicio: 5073, fin: 10986 }
afirmar(corrimiento(pin, 4573) === 500 && corrimiento(pin, 7000) === 0 && corrimiento(pin, 11486) === -500, '  el corrimiento: antes del escenario clavado baja con la sección, clavado no se mueve, después sube con ella')
afirmar(/const visible = m\.llegada > 0 && !fuera && !tapado/.test(escena), '  fuera del cuadro no se dibuja (y la llegada, función del scroll, ya es la que corresponde cuando vuelve)')
const tapa = (f: (p: number) => boolean): boolean => !f(progresoDelPxDelTunel(0)) && !f(progresoDelPxDelTunel(400)) && f(progresoDelPxDelTunel(910))
afirmar(tapa(primeraFotoTapa), '  lo esconde la primera foto del túnel recién cuando tapa el cuadro entero (no la huida del cartel: ahí todavía se veía)')
controlPositivo('el detector VE el escondido con la foto chica', (p: number) => p >= progresoDelPxDelTunel(300), tapa)
// [AJUSTES FINALES] A4 · el hero, además, espera a que la carga se abra (el velo terminó de fundirse): hasta ahí lo pedido es 0.
afirmar(/else if \(!fuera && !tapado\) m\.llegada = persigue\(m\.llegada, cargaLista\(\) \? a\.titulo\.llegada : 0, dt, a\.titulo\.minimoS/.test(escena), '  tapado o fuera, el que llega por tiempo (el hero) espera (y hasta que la carga se abre); Portfolio sigue al scroll')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B2 · El polvo posado: cualquier scroll lo levanta')

const simulacion = leer('_lib/escena/polvo/simulacion.ts')
const sube = (c: string): boolean => /vec3 lugar = cercaDeLasCaras \? vec3\( p\.x, f\.y, p\.z \) : f;/.test(c) && /p \+= relajar\( v, viento \+ hacia, /.test(c) && !/viento \+ vec3\( 0\.0, - \$\{FISICA\.soplo\.gravedad/.test(c)
afirmar(sube(simulacion), 'la levantada SUBE a su lugar en el aire (cerca de las caras de la caja, a su altura), no la devuelve la gravedad ni el resorte lento del aire', 'medido con un scroll de una muesca: la altura media de la suelta de −4,2 a +3,9 en 5 s (antes, −4,2 a −3,9 y el 44 % nunca salió del piso)')
controlPositivo('el detector VE la levantada con gravedad de antes', simulacion.replace('viento + hacia, ', 'viento + vec3( 0.0, - ${FISICA.soplo.gravedad.toFixed(2)}, 0.0 ), '), sube)
afirmar(/bool llego = distance\( p, f \) < /.test(simulacion) && /if \( !cercaDeLasCaras && llego \) \{/.test(simulacion), '  se le entrega al aire cuando llegó a su lugar (o el suyo es debajo del piso, donde se funde): sin salto')
const fisica = leer('_lib/escena/polvo/Fisica.tsx')
// [CIERRE RETOQUE 3D] B2: o la página se movió (s42 · B2).
afirmar(/const scroll = \(!Number\.isNaN\(m\.progreso\) && Math\.abs\(progreso - m\.progreso\) > 1e-6\)/.test(fisica), '  el despertar es cualquier cambio del scroll (un píxel de los 27.705 de la página es 3,6e-5 > 1e-6)')

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
const subeConLaLevantada = (c: string): boolean => /const corrida = useTransform\(levantada, \(u\) => \(-u \* SUBIDA_DE_LA_LEVANTADA_SVH\) \/ 100\)/.test(c) && (c.match(/llegada: frase, salida: levantada, corrida \}\}/g) ?? []).length === 2
afirmar(subeConLaLevantada(porQue), '  el título de volumen de la frase sube con la levantada (la misma subida que su pieza del DOM): los valores ya no le pasan por encima')
controlPositivo('el detector VE la frase clavada mientras suben los valores', porQue.replace(/llegada: frase, salida: levantada, corrida \}\}/g, 'llegada: frase, salida: levantada }}'), subeConLaLevantada)
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
// [PASADA FINAL] A1 · el hero ya no se pinta primero: su texto 2D lleva el estado de `titular2d.ts` (s47); `TEXTO_REEMPLAZADO` sigue para los demás textos de volumen (El equipo, Demos).
afirmar(/useTitular2D\(listo1 && listo2\)/.test(hero) && (hero.match(/data-titular-2d=\{titular2d\}/g) ?? []).length === 2 && !/TEXTO_REEMPLAZADO/.test(hero) && clase.startsWith('escritorio:opacity-0 ') && !clase.includes('invisible'), '  el texto 2D del hero lleva su estado (oculto desde 1024 hasta que el 3D llega; `titular2d.ts`) y sigue en el árbol accesible (es el `h1`); los otros textos de volumen se apagan con una opacidad desde 1024')
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

// [CIERRE] 3D · las fotos del equipo volvieron a como estaban (sin marco 3D): s42 · D4.

// ═══════════════════════════════════════════════════════════════════════════
titulo('3E · Las demos se levantan desde atrás')

const anguloDe = (t: string): number => (t === 'none' ? 0 : Number(/rotateX\((-?[\d.]+)deg\)/.exec(t)?.[1] ?? NaN))
const seLevanta = (pose: typeof poseDelLibro): boolean => anguloDe(pose(0).transform) === LIBRO_QUE_LLEGA.acostado && pose(1).transform === 'none' && Math.min(...Array.from({ length: 41 }, (_, k) => anguloDe(pose(k / 40).transform))) < 0
afirmar(seLevanta(poseDelLibro) && LIBRO_QUE_LLEGA.acostado === 90, 'acostado hacia atrás sobre su base (90°), se para con el sobrepaso de siempre (se pasa un poco hacia adelante) y se asienta sin transformada; es la fracción del vacío: para atrás se vuelve a acostar')
controlPositivo('el detector VE la llegada de antes (desde abajo, sin giro sobre la base)', ((t: number) => ({ transform: t >= 1 ? 'none' : `translateY(${String((1 - t) * 110)}%)`, opacidad: 1 })) as typeof poseDelLibro, seLevanta)
afirmar(/\[data-v3\] \[data-pieza="libro"\] \{[^}]*transform-origin: 50% 100%;/.test(readFileSync(`${V3}/_estilos/demos.css`, 'utf8')), '  el giro va sobre la base del libro (`transform-origin` abajo)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3G · Los valores de Por qué develOP llegan desde la sala')

const lugares = new Set(DESDE_DONDE_LLEGAN.map((d) => `${String(d.x)},${String(d.y)},${String(d.z)}`))
const cadaUnoDeUnLugar = (pose: typeof poseDelValor): boolean => [0, 1, 2, 3, 4, 5].every((i) => pose(1, i).transform === 'none' && pose(0, i).opacidad === 0 && /translate3d\(-?\d/.test(pose(0, i).transform)) && new Set([0, 1, 2, 3, 4, 5].map((i) => pose(0, i).transform)).size === 6
afirmar(cadaUnoDeUnLugar(poseDelValor) && lugares.size === 6 && DESDE_DONDE_LLEGAN.every((d) => d.z < 0) && DESDE_DONDE_LLEGAN.slice(0, 3).every((d) => d.x < 0) && DESDE_DONDE_LLEGAN.slice(3).every((d) => d.x > 0), 'los seis desde seis lugares distintos (de atrás; los de la izquierda desde la izquierda), girados y apagados, y se asientan sin transformada')
controlPositivo('el detector VE a todos llegando del mismo lugar', ((p: number) => poseDelValor(p, 0)) as typeof poseDelValor, cadaUnoDeUnLugar)
afirmar(/<ValorEnVolumen progreso=\{tramo\} indice=\{indice\}>\s*<PiezaDeValor/.test(porQue) && !/requestAnimationFrame|setInterval/.test(sinComentarios(leer('_secciones/por-que-develop/valorEnVolumen.tsx'))), '  el bloque entero (ícono, título y texto) del DOM, con el progreso de su tramo (sin reloj: al revés para atrás)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3H · El cierre del túnel: «Clickeá acá para empezar»')

const cta = CONTENIDO_DE_TRABAJOS.cta as Record<string, string>
afirmar(cta.empezar === 'Clickeá acá para empezar' && cta.rotulo === undefined && cta.aclaracion === undefined && cta.frase === '¿El próximo proyecto sos vos?', 'la frase queda; «Hablemos» y «(un clic y arrancamos)» se fueron')
const piezasDeTrabajos = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
const lleva = (c: string): boolean => (c.match(/<a href=\{DESTINO_DEL_CTA\} data-pieza="empezar"[^>]*style=\{ESTILO_DE_EMPEZAR\}>\s*\{CONTENIDO\.cta\.empezar\}/g) ?? []).length === 2 && !/CtaEnlace/.test(c)
afirmar(lleva(piezasDeTrabajos) && /mt-auto self-center/.test(piezasDeTrabajos) && /after:absolute after:inset-0/.test(piezasDeTrabajos), '  en las dos ramas lleva al pie (el contacto); arriba de 1025 abajo y centrado en la ventana, que sigue siendo entera el enlace; sin 3D')
controlPositivo('el detector VE el «Hablemos» de antes', `${piezasDeTrabajos}<CtaEnlace href={DESTINO_DEL_CTA} />`, lleva)
// La mezcla de la ventana: `--color-fondo` (la tinta, #0E0E0E en la sala invertida) sobre `--color-tinta` (el papel, #F7F7F5).
const mezcla = (pct: number): string => {
  const canal = (a: number, b: number): string => Math.round((a * pct + b * (100 - pct)) / 100).toString(16).padStart(2, '0')
  return `#${canal(0x0e, 0xf7)}${canal(0x0e, 0xf7)}${canal(0x0e, 0xf5)}`
}
const masTenueCon3 = (pct: number): boolean => razonDeContraste(mezcla(pct), '#F7F7F5') >= 3 && razonDeContraste(mezcla(pct - 1), '#F7F7F5') < 3
afirmar(masTenueCon3(PORCENTAJE_DE_TINTA_TENUE), '  gris claro: lo más tenue con 3:1 (texto grande) sobre el papel de la ventana, en pasos enteros de la mezcla', `${mezcla(PORCENTAJE_DE_TINTA_TENUE)} ${razonDeContraste(mezcla(PORCENTAJE_DE_TINTA_TENUE), '#F7F7F5').toFixed(2)}:1; con ${String(PORCENTAJE_DE_TINTA_TENUE - 1)} %, ${razonDeContraste(mezcla(PORCENTAJE_DE_TINTA_TENUE - 1), '#F7F7F5').toFixed(2)}:1`)
controlPositivo('el detector VE un gris que no llega a 3:1', PORCENTAJE_DE_TINTA_TENUE - 1, masTenueCon3)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3I · El pie en volumen, con el contacto de verdad')

// [CIERRE RETOQUE 3D] D5: el pie ya no es una sala alrededor del logo (paredes y piso): bloques sólidos, s42 · D5.
const formulario = sinComentarios(leer('_secciones/cierre/FormularioDelPie.tsx'))
// [RONDA 2] F1: el formulario envía (al endpoint propio, sin aviso): s43 · F1.
afirmar(/<form id="contacto"/.test(formulario) && ['nombre', 'mail', 'mensaje'].every((c) => formulario.includes(`'${c}'`)), 'el contacto es un formulario de verdad (nombre, mail y mensaje, cada campo con su rótulo)')
const piezasDeContacto = sinComentarios(leer('_secciones/cierre/PiezasDeContacto.tsx'))
// [CIERRE RETOQUE 3D] N1: la hoja vuelve (sin WhatsApp, por mail): s42 · N1.
// [RONDA 2] F1: WhatsApp volvió al pie (sólo queda fuera del formulario de contacto): s43 · F1.
afirmar(piezasDeContacto.length > 0, 'las piezas de contacto del pie')
const efecto = sinComentarios(readFileSync('src/app/v3/_componentes/useDeslizamientoDelCta.ts', 'utf8'))
afirmar(/const seccion = elAncla\?\.closest<HTMLElement>\(`\[\$\{ATRIBUTO_DE_PANEL\}\]`\) \?\? elAncla/.test(efecto) && /const foco = llego \? \(objetivo \?\? destino\) : origen/.test(efecto), '  todo apunta a contacto: `#contacto` (la barra, el menú, el «Hablemos» del hero) viaja a la sección del pie y le da el foco al formulario; los CTA de Servicios viajan ahí también')

// [CIERRE] 3J · el túnel lento se borró (código y bandera): s42 · D6.

// ═══════════════════════════════════════════════════════════════════════════
titulo('N1 · Contacto y Login, en la esquina')

afirmar(ENLACES_DE_SECCION.every((e) => e.destino.startsWith('#') && e.destino !== '#contacto') && ENLACES_DE_SECCION.length === 5 && ENLACE_DE_CONTACTO.destino === '#contacto' && ENLACE_DE_LOGIN.destino === '/login' && existsSync('src/app/login/page.tsx'), 'la pastilla lleva las cinco secciones; Contacto va al formulario del pie y Login al login que el sitio ya tiene (`/login`)')
const barra = sinComentarios(leer('_chrome/barra/BarraDelHome.tsx'))
const enLaEsquina = (c: string): boolean => /\{ENLACES_DE_SECCION\.map\(/.test(c) && /<div data-parte="esquina"[\s\S]*href=\{ENLACE_DE_CONTACTO\.destino\}[\s\S]*data-pieza="barra-login"/.test(c)
afirmar(enLaEsquina(barra), '  la esquina: Contacto (un enlace del viaje, como los de la pastilla) y Login (un botón)')
controlPositivo('el detector VE a Contacto adentro de la pastilla', barra.replace('ENLACES_DE_SECCION.map(', 'ENLACES_DEL_HOME.map('), enLaEsquina)
const cssDeLaBarra = readFileSync(`${V3}/_estilos/barra.css`, 'utf8')
afirmar(/\[data-parte="esquina"\] \{\s*position: fixed;\s*top: var\(--barra-reposo\);\s*right: var\(--pad-lateral-compacto\);/.test(cssDeLaBarra) && /\[data-modo="menu"\] > :is\(\[data-parte="pastilla"\], \[data-parte="esquina"\]\)/.test(cssDeLaBarra) && /AIRE_DE_LA_ESQUINA/.test(barra), '  arriba a la derecha, siempre arriba (al pie del hero están el infinito y el parlante); si no entra al lado de la pastilla, el menú del teléfono')
const menu = sinComentarios(leer('_chrome/menu/PanelDelMenu.tsx'))
// [CIERRE RETOQUE 3D] N1: Contacto, un botón que abre el panel.
afirmar(/<ul data-parte="pie-del-menu"[\s\S]*\{ENLACE_DE_CONTACTO\.rotulo\}[\s\S]*href=\{ENLACE_DE_LOGIN\.destino\}/.test(menu) && /\{ENLACES_DE_SECCION\.map\(/.test(menu), '  en el teléfono, separados al pie del menú de vidrio')

// ═══════════════════════════════════════════════════════════════════════════
titulo('N2 · El infinito, 1,3 veces más grande')

const infinito = leer('_chrome/recorrido/InfinitoDelRecorrido.tsx')
const masGrande = (c: string): boolean => c.includes('w-[calc(var(--spacing-12)*1.3)]') && c.includes('escritorio:w-[calc(var(--spacing-8)*2.6)]')
afirmar(masGrande(infinito), 'de 48 a 62 px en el teléfono y de 64 a 83 en escritorio (el trazo crece con él: es del dibujo)')
controlPositivo('el detector VE el de antes', infinito.replace('*1.3)]', ')]').replace('*2.6)]', '*2)]'), masGrande)
// [PASADA FINAL] C1 · el parlante dejó la izquierda del infinito: va justo encima, centrado, en la misma columna (s47 · C1).
afirmar(leer('_chrome/ChromeDelHome.tsx').includes('<InfinitoDelRecorrido encima={<SonidoDelHome />} />') && leer('_chrome/recorrido/InfinitoDelRecorrido.tsx').includes('{encima}'), '  y el parlante se corre con él: [PASADA FINAL] C1, justo encima, en su misma columna (medido en vivo con scripts-pasada/c1-esquina.ts)')

// [CIERRE] Sonido · el clic, el pestillo (S1), y el ambiente, generativo (S2): s42 · S1 y S2.

// [CIERRE] Partículas · la b pasó al producto y la a y la c se borraron: s42 · P1.

cerrar('s41-retoque-3d')
