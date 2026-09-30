/**
 * SPRINT ESCENA 9 — PREMIUM, lo que se puede prometer sin navegador. Cada afirmación lleva su control positivo donde
 * el chequeo podría pasar por no mirar nada. Una sección por ticket.
 *
 * T1 · el obstáculo, afuera: el polvo en vuelo no se entera del logo (ni el rodeo del flujo, ni el contacto que lo
 *      corría por la cara, ni la holgura del bokeh y tras el cursor, ni el deslizar); el campo del flujo y la bandera
 *      `obstaculo` se borraron. Queda sólo lo aprobado: con la página quieta, la mota que CAE sobre una cara de arriba
 *      se posa ahí, y con el despertar o el movimiento se levanta.
 * T2 · el logo de noche (prueba, `logo-noche=<variante>`): los costados sin emisión y las tapas con la de hoy y un
 *      borde en su contorno (el campo de distancia 2D del contorno del SVG); qué cara es cuál sale de la normal de la
 *      geometría; de día no cambia nada (todo es proporcional a la emisión); el amanecer guarda la noche con el mismo
 *      dibujo. Apagada en el producto; con banco o en la URL (`?pruebas=`), sin tocar el resto de las banderas.
 */
import * as THREE from 'three'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { FISICA } from '../polvo/simulacion'
import { conCantosSuaves } from '../cantosDelLogo'
import { PROBE_EXTRUDE } from '../probeScene'
import { CONTORNO, VARIANTES_DEL_LOGO_DE_NOCHE, distanciasAlContorno } from '../logoDeNoche'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8')

// ── T1 · el obstáculo, afuera ─────────────────────────────────────────────
titulo('T1 · el obstáculo, afuera: el polvo en vuelo atraviesa al logo')
const simulacion = leer('polvo/simulacion.ts')
const parche = leer('polvo/parche.ts')
const fisica = leer('polvo/Fisica.tsx')
const campo = leer('polvo/campoDelLogo.ts')
/** Restos del obstáculo en vuelo: el rodeo, su campo, el contacto, la velocidad de la cara, la holgura y el deslizar. */
const OBSTACULO = /alrededorDelLogo|flujoDelLogo|normalDelFlujo|FLUJO_EN_VIVO|CAMPO_DEL_FLUJO|publicarElFlujo|velocidadDelLogo|uLogoAntes|\bchocar\(|FISICA\.contacto|FISICA\.obstaculo|AIRE_OBSTACULO|afueraDelLogo|afueraDelCampo|HOLGURA|modoConPeso\( 4\.0|modo = 4\.0/
const sinObstaculo = (fuentes: readonly string[]): boolean => fuentes.every((c) => !OBSTACULO.test(c))
afirmar(sinObstaculo([simulacion, parche, fisica, campo, leer('polvo/Aire.tsx'), leer('entorno.ts')]), 'ni el rodeo, ni su campo, ni el contacto, ni la holgura, ni el deslizar: el código se borró')
controlPositivo('el detector VE el rodeo de CALIDAD 1', [simulacion, 'vec3 viento = vientoDelDespertar( p ) + alrededorDelLogo( p, uVientoDelAire );'], sinObstaculo)
afirmar(!existsSync(path.join(ESCENA, 'polvo/obstaculo.ts')) && existsSync(path.join(ESCENA, 'polvo/formaDelLogo.ts')), '  `obstaculo.ts` no existe: la forma del logo (la leen el piso vivo y la fugaz) vive en `formaDelLogo.ts`')
afirmar(!('obstaculo' in ENTORNO) && !('obstaculo' in entornoPedido('producto,obstaculo=no')) && !('contacto' in FISICA) && !('obstaculo' in FISICA), '  y la bandera tampoco: `obstaculo=no` ya no es un pedido')

/** El bloque de un modo en `main()`: desde su `if` hasta el `if` del modo siguiente. */
const bloque = (desde: RegExp, hasta: RegExp, c: string): string => {
  const i = c.search(desde)
  const resto = c.slice(i + 1)
  const j = resto.search(hasta)
  return i < 0 || j < 0 ? '' : c.slice(i, i + 1 + j)
}
const TOCA_EL_LOGO = /campoDelLogo|normalDelCampo|uLogo|posarseEnElLogo/
const delAire = (c: string): string => bloque(/\tif \( modo < 0\.5 \) \{/, /\tif \( modo > 0\.5 && modo < 1\.5 \) \{/, c)
/** Desde la levantada hasta el final de `main()` (el cierre de la plantilla de la simulación). */
const deLaLevantada = (c: string): string => {
  const i = c.indexOf('// Levantada')
  const fin = c.slice(i).search(/\n\}\r?\n`/)
  return i < 0 || fin < 0 ? '' : c.slice(i, i + fin)
}
const aireLibre = (c: string): boolean => delAire(c).length > 200 && !TOCA_EL_LOGO.test(delAire(c)) && /vec3 viento = vientoDelDespertar\( p \);/.test(delAire(c))
afirmar(aireLibre(simulacion), 'la mota del aire no lee el logo: sólo el despertar la empuja y el resorte la devuelve')
controlPositivo('el detector VE el contacto del aire de CALIDAD 1', simulacion.replace('vec3 viento = vientoDelDespertar( p );', 'vec3 viento = vientoDelDespertar( p ); float cara = campoDelLogo( q );'), aireLibre)
const levantadaLibre = (c: string): boolean => deLaLevantada(c).length > 200 && !TOCA_EL_LOGO.test(deLaLevantada(c))
afirmar(levantadaLibre(simulacion), '  la levantada tampoco: el viento la lleva a través del logo')
controlPositivo('el detector VE el choque de la levantada', simulacion.replace('if ( p.y < piso ) { p.y = piso; v.y = max( v.y, 0.0 ); }', 'chocar( p, v );\n\tif ( p.y < piso ) { p.y = piso; v.y = max( v.y, 0.0 ); }').replace('// Levantada', '// Levantada campoDelLogo'), levantadaLibre)
afirmar(!/AIRE_OBSTACULO|afuera/.test(parche.replace('Lo que queda afuera de la sala', '')) && /#ifdef AIRE_FISICA\s*uniform mat4 uLogo;/.test(parche), '  el material del polvo y del bokeh no corre ninguna mota del logo (ni antes de proyectar ni tras el cursor); sólo lee su pose para lo posado')

// Lo aprobado: la que CAE con la página quieta sobre una cara de arriba se posa; la que entra de otro modo, lo atraviesa.
const posarse = /bool posarseEnElLogo\( inout vec3 p, vec3 antes \) \{[\s\S]*?\n\}/.exec(simulacion)?.[0] ?? ''
/** Se posa sólo si ENTRA (antes afuera, ahora a menos de `radio`) y por una cara de arriba; no empuja ni frena nada. */
const soloSePosa = (f: string): boolean =>
  /if \( d >= \$\{FISICA\.logo\.radio\.toFixed\(3\)\} \) return false;/.test(f) &&
  /if \( campoDelLogo\( \( uLogoInverso \* vec4\( antes, 1\.0 \) \)\.xyz \) < \$\{FISICA\.logo\.radio\.toFixed\(3\)\} \) return false;/.test(f) &&
  /if \( n\.y <= \$\{FISICA\.logo\.cara\.toFixed\(2\)\} \) return false;/.test(f) &&
  !/\bv\b/.test(f)
afirmar(soloSePosa(posarse), 'lo aprobado: la mota que cae y ENTRA al logo por una cara de arriba se posa ahí; si ya estaba adentro o entra de costado, lo atraviesa')
controlPositivo('el detector VE un posarse que atrapa a la que ya estaba adentro', posarse.replace(/\tif \( campoDelLogo\( \( uLogoInverso \* vec4\( antes, 1\.0 \) \)\.xyz \)[^\n]*\n/, ''), soloSePosa)
const cae = bloque(/\tif \( modo > 0\.5 && modo < 1\.5 \) \{/, /\tif \( modo > 1\.5 && modo < 2\.5 \) \{/, simulacion)
afirmar(/vec3 antes = p;/.test(cae) && /if \( posarseEnElLogo\( p, antes \) \) \{/.test(cae) && (simulacion.match(/posarseEnElLogo\(/g) ?? []).length === 2, '  y sólo la que cae (con la página quieta) la llama: ningún otro modo se posa ni choca')
const enElLogo = bloque(/\tif \( modo > 2\.5 && modo < 3\.5 \) \{/, /\/\/ Levantada/, simulacion)
/** Con el despertar o con el movimiento, la posada se levanta (modo 5): ni resbala ni se queda en el borde. */
const seLevanta = (c: string): boolean => /if \( despierta \|\| uMovimiento > \$\{FISICA\.resbala\.toFixed\(2\)\} \) \{ modo = 5\.0; desde = uReloj;/.test(c) && !/modo = 4\.0/.test(c)
afirmar(seLevanta(enElLogo), 'al despertar (o con el movimiento de la coreografía) la posada se suelta del logo: se levanta, no resbala hasta su borde', 'medido (t1-obstaculo, despertar): de 15 motas sobre el logo, 2 contra la cara a los 0,5 s y 0 al 1,5 s; antes, 12 resbalando a los 0,5 s y de 4 a 8 contra la cara entre 1,5 y 4 s después')
controlPositivo('el detector VE el deslizar de ESCENA 6', enElLogo.replace('if ( despierta || uMovimiento >', 'if ( despierta ) { modo = 5.0; } else if ( uMovimiento >').replace('{ modo = 5.0; desde = uReloj;', '{ modo = 4.0; desde = uReloj;'), seLevanta)
afirmar(/campoDeAPoco\(contorno\)/.test(fisica) && (fisica.match(/hornearDeAPoco\(/g) ?? []).length === 2, '  el campo de la malla real se hornea una vez (sólo el fino: el del flujo se fue, un horneado menos al cargar)')

// ── T2 · el logo de noche ─────────────────────────────────────────────────
titulo('T2 · el logo de noche: costados negros, tapas grises con borde (prueba)')
afirmar(ENTORNO.pruebas.logoDeNoche === 'no' && PRUEBAS_APAGADAS.logoDeNoche === 'no', 'apagada en el producto')
afirmar(entornoPedido('producto,logo-noche=fino').pruebas.logoDeNoche === 'fino' && entornoPedido('producto,logo-noche=claro').pruebas.logoDeNoche === 'claro' && entornoPedido('producto,logo-noche=otra').pruebas.logoDeNoche === 'no', '  el banco la pide por variante (y una que no existe es «no»)')
const entornoFuente = leer('entorno.ts')
afirmar(/const pruebas = new URLSearchParams\(window\.location\.search\)\.get\('pruebas'\)/.test(entornoFuente) && /\{ \.\.\.ENTORNO, pruebas: entornoPedido\(`producto,\$\{pruebas\}`\)\.pruebas \}/.test(entornoFuente), '  sin banco, en la URL (`/v3?pruebas=logo-noche=fino`): sólo las pruebas, el resto del producto intacto y sin los ganchos del banco')
const variantes = VARIANTES_DEL_LOGO_DE_NOCHE
afirmar(Object.keys(variantes).length === 3 && variantes.fino.ancho < variantes.grueso.ancho && variantes.fino.luz === 0 && variantes.grueso.luz === 0 && variantes.claro.luz > 0.5, '  tres variantes de grosor y contraste: negro fino, negro grueso y claro', JSON.stringify(variantes))
// Qué cara es cuál: en una extrusión como la del logo (bisel 1/1/5 y los costados suaves de B7), las tapas tienen la
// normal ±z exacta y los costados nunca llegan al corte del shader.
const formaDePrueba = new THREE.Shape()
formaDePrueba.absarc(0, 0, 250, Math.PI / 6, 2 * Math.PI - Math.PI / 6, false)
formaDePrueba.absarc(0, 0, 150, 2 * Math.PI - Math.PI / 6, Math.PI / 6, true)
const extrusion = conCantosSuaves(new THREE.ExtrudeGeometry(formaDePrueba, PROBE_EXTRUDE))
const nz = extrusion.getAttribute('normal')
const porGrupo = extrusion.groups.map((g) => Array.from({ length: g.count }, (_, i) => Math.abs(nz.getZ(g.start + i))))
extrusion.dispose()
const logoDeNocheFuente = leer('logoDeNoche.ts')
const umbralDelShader = Number(/vTapaDelLogo = step\( ([0-9.]+), abs\( normal\.z \) \);/.exec(logoDeNocheFuente)?.[1] ?? 'NaN')
const separa = (umbral: number): boolean => porGrupo.length === 2 && porGrupo[0].every((z) => z >= umbral) && porGrupo[1].every((z) => z < umbral)
afirmar(separa(umbralDelShader), 'las tapas y los costados se separan por la normal de la geometría (el corte del shader)', `tapas |nz| = 1; costados hasta ${Math.max(...porGrupo[1]).toFixed(4)}; corte ${String(umbralDelShader)}`)
controlPositivo('el detector VE un corte que mezcla el primer anillo del bisel con la tapa', 0.99, separa)
// El borde: la distancia al contorno, horneada. Un cuadrado de 100 de lado: en el medio de un lado a 5 unidades adentro, 5;
// en el centro, lejos (topada).
const cuadrado = [[new THREE.Vector2(0, 0), new THREE.Vector2(100, 0), new THREE.Vector2(100, 100), new THREE.Vector2(0, 100)]]
const n: [number, number] = [70, 70]
const min: [number, number] = [-20, -20]
const d = distanciasAlContorno(cuadrado, min, n)
const en = (x: number, y: number, datos: Uint8Array): number => (datos[Math.floor((y - min[1]) / CONTORNO.celda) * n[0] + Math.floor((x - min[0]) / CONTORNO.celda)] / 255) * CONTORNO.alcance
const mide = (datos: Uint8Array): boolean => Math.abs(en(51, 5, datos) - 5) < 1.2 && Math.abs(en(95, 51, datos) - 5) < 1.2 && en(50, 50, datos) > CONTORNO.alcance - 0.5
afirmar(mide(d), 'el borde sale de la distancia al contorno: a 5 unidades del lado da 5; en el centro, el tope', `${en(51, 5, d).toFixed(2)} y ${en(95, 51, d).toFixed(2)}; centro ${en(50, 50, d).toFixed(1)}`)
controlPositivo('el detector VE un contorno corrido', distanciasAlContorno([cuadrado[0].map((p) => p.clone().addScalar(8))], min, n), mide)
// De día no cambia: lo nuevo es proporcional a la emisión (de día, cero) y se mezcla con la de hoy por la bandera.
afirmar(/float noche = clamp\( emissive\.r \/ \$\{EMISION_EN_LA_NOCHE\.toFixed\(3\)\}, 0\.0, 1\.0 \);/.test(logoDeNocheFuente) && /vec3 conBorde = mix\( totalEmissiveRadiance \* vTapaDelLogo, vec3\( \$\{radianciaDe\('uLuzDelBorde'\)\} \) \* noche, bordeDelLogoDeNoche\(\) \);/.test(logoDeNocheFuente) && /totalEmissiveRadiance = mix\( totalEmissiveRadiance, conBorde, uLogoDeNoche \);/.test(logoDeNocheFuente), 'de día el logo no cambia: los costados y el borde salen de la emisión, que de día es cero', 'medido en el mismo cuadro: 0 píxeles distintos en el hero a 1440 y a 375 con las tres variantes')
afirmar(/const variante = entornoDeLaEscena\(\)\.pruebas\.logoDeNoche\s*if \(variante === 'no'\) return \{ material: built, logoDeNoche: null \}/.test(leer('ProbeLogo.tsx')), '  y sin la bandera el material es el de siempre (el parche no se instala)')
const luz = leer('amanecer/luz.ts')
// En el fuente, el GLSL va en una plantilla: los saltos son `\n` escritos (dos caracteres).
const guardaConDibujo = (c: string): boolean =>
  c.includes('#ifdef LOGO_DE_NOCHE_CON_BORDE\\n\\tgl_FragColor.rgb = mix( colorDelLogoDeNoche( ${LOGO_DE_NOCHE.toFixed(2)} ), gl_FragColor.rgb, alcanzadoPorElDia( vMundoDelLogo ) );') &&
  c.includes('#else\\n\\tgl_FragColor.rgb = mix( vec3( ${LOGO_DE_NOCHE.toFixed(2)} ), gl_FragColor.rgb, alcanzadoPorElDia( vMundoDelLogo ) );\\n#endif')
afirmar(guardaConDibujo(luz), 'el amanecer guarda la noche con el mismo dibujo; sin la prueba, el gris parejo de siempre')
controlPositivo('el detector VE el amanecer de antes (sólo el gris parejo)', luz.replace('#ifdef LOGO_DE_NOCHE_CON_BORDE', ''), guardaConDibujo)

cerrar('s35-escena9')
