/**
 * SPRINT RETOQUE 3D — el invariante: npm run test:s41-retoque-3d
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   B1 · el título de Portfolio sin salida propia: la llegada, una vez empezada, termina; llegado, se queda y se va con
 *        su sección (corrido con su escenario); fuera del cuadro se rearma; lo esconde la primera foto del túnel tapando
 *        el cuadro, y mientras tanto no cambia (la llegada después de un viaje espera a que se vea).
 *
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/` (un `mirar.txt` por bloque y el `LEEME.txt`).
 */
import { readFileSync } from 'node:fs'

import { corrimiento } from '../escena/titulos3d/colocacion'
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
const conSuSeccion = (c: string): boolean => /a\.grupo\.position\.copy\(a\.base\)\.addScaledVector\(a\.arriba, -d \* a\.mundoPorPx\)/.test(c) && /const d = corrimiento\(a\.pin, y\)/.test(c)
afirmar(conSuSeccion(escena), '  llegado, va corrido con su escenario: sale con la sección, sin animación propia')
controlPositivo('el detector VE el título clavado en el mundo', escena.replace('-d * a.mundoPorPx', '0'), conSuSeccion)
const pin = { inicio: 5073, fin: 10986 }
afirmar(corrimiento(pin, 4573) === 500 && corrimiento(pin, 7000) === 0 && corrimiento(pin, 11486) === -500, '  el corrimiento: antes del escenario clavado baja con la sección, clavado no se mueve, después sube con ella')
afirmar(/if \(fuera\) m\.llegada = 0/.test(escena) && /return m\.llegada > 0 && !fuera && !tapado/.test(escena), '  fuera del cuadro no se dibuja y se rearma para la próxima llegada (desde Por qué develOP ya no se ve de espaldas)')
const tapa = (f: (p: number) => boolean): boolean => !f(progresoDelPxDelTunel(0)) && !f(progresoDelPxDelTunel(400)) && f(progresoDelPxDelTunel(910))
afirmar(tapa(primeraFotoTapa), '  lo esconde la primera foto del túnel recién cuando tapa el cuadro entero (no la huida del cartel: ahí todavía se veía)')
controlPositivo('el detector VE el escondido con la foto chica', (p: number) => p >= progresoDelPxDelTunel(300), tapa)
afirmar(/else if \(!tapado\) m\.llegada = persigue/.test(escena), '  tapado, nada cambia: después de un viaje desde más allá del túnel la llegada espera a que se vea')

cerrar('s41-retoque-3d')
