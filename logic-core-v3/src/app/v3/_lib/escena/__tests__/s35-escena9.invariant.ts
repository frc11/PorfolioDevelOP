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
 * T3 · material y luz (cinco pruebas, cada una con su bandera): el material físico con un estudio generado, la sombra
 *      del logo sobre el piso vivo (varianza, una lectura por píxel), el bloom de noche por capa, el tono AgX/ACES
 *      compensado con el brillo de Neutral y el antialiasing (TAA u 8 muestras). Apagadas en el producto.
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
import { ESTUDIO, MATERIALES_DEL_LOGO, escenaDelEstudio } from '../estudio'
import { SOMBRA_DEL_LOGO_GLSL } from '../sombra/delLogo'
import { CAPA_DEL_BLOOM, CAPA_DEL_POLVO, LOS_QUE_BRILLAN, halton } from '../gpu/posproceso'
import { tonoCompensadoGlsl } from '../tono'

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

// ── T3 · material y luz ───────────────────────────────────────────────────
titulo('T3 · material y luz: cinco pruebas con bandera, ninguna en el producto')
afirmar(ENTORNO.pruebas.materialDelLogo === 'no' && !ENTORNO.pruebas.sombraDelLogo && !ENTORNO.pruebas.bloom && ENTORNO.pruebas.tono === 'no' && ENTORNO.pruebas.aa === 'no', 'las cinco apagadas en el producto')
const conTodas = entornoPedido('producto,material=brillante,sombra-logo,bloom,tono=agx,aa=taa').pruebas
afirmar(conTodas.materialDelLogo === 'brillante' && conTodas.sombraDelLogo && conTodas.bloom && conTodas.tono === 'agx' && conTodas.aa === 'taa', '  el banco (o la URL) las pide por nombre', JSON.stringify(conTodas))
const pruebasT3 = leer('PruebasDeLaEscena9.tsx')
afirmar(/pruebas\.materialDelLogo !== 'no' \? <ReflejosDelLogo/.test(pruebasT3) && /pruebas\.sombraDelLogo \? <SombraDelLogo/.test(pruebasT3) && /pruebas\.bloom \|\| pruebas\.aa !== 'no' \? <Posproceso/.test(pruebasT3), '  sin bandera no se monta nada (los reflejos, la sombra y el posproceso)')

// El material: el color no cambia; el estudio se genera (no se descarga) y sus softbox están arriba del horizonte.
const logoFuente = leer('ProbeLogo.tsx')
afirmar(/new THREE\.MeshPhysicalMaterial\(\{ \.\.\.parametros, \.\.\.MATERIALES_DEL_LOGO\[pedido\] \}\)/.test(logoFuente) && /color: INK_COLOR,/.test(logoFuente), 'el material físico: el mismo color (la tinta) y la rugosidad y la laca de la variante')
afirmar(MATERIALES_DEL_LOGO.satinado.clearcoat === 0 && MATERIALES_DEL_LOGO.brillante.clearcoat === 1 && MATERIALES_DEL_LOGO.brillante.roughness < MATERIALES_DEL_LOGO.satinado.roughness, '  satinado sin laca; brillante con laca y menos rugoso', JSON.stringify(MATERIALES_DEL_LOGO))
/** El estudio en una efecto: lo arma y lo suelta el MISMO montaje (en desarrollo React monta dos veces). */
const estudioEnElEfecto = (c: string): boolean => /useEffect\(\(\) => \{\s*if \(!\(material instanceof THREE\.MeshPhysicalMaterial\)\) return undefined\s*const sacar = ponerElEstudio\(material, gl\)/.test(c) && /return \(\) => \{\s*sacar\(\)/.test(c) && !/useMemo\([^)]*(crearElEstudio|ponerElEstudio)/.test(c)
afirmar(estudioEnElEfecto(logoFuente) && /estudio\.dispose\(\)/.test(leer('estudio.ts')), '  el entorno lo arma y lo suelta cada montaje (armado en el render y soltado en la limpieza quedaba negro)')
controlPositivo('el detector VE el estudio armado en el render', logoFuente.replace('const sacar = ponerElEstudio(material, gl)', 'const otro = 1'), estudioEnElEfecto)
/** Ningún softbox baja del horizonte: una tapa plana vista desde apenas arriba refleja hacia abajo, y no lo toma entero. */
const arribaDelHorizonte = (cajas: readonly { readonly centro: readonly number[]; readonly tam: readonly number[] }[]): boolean => cajas.every((b) => b.centro[1] - b.tam[1] / 2 > 1)
afirmar(arribaDelHorizonte(ESTUDIO.softbox) && ESTUDIO.sala.gris < 0.1 && ESTUDIO.piso.gris < 0.2, '  los softbox del estudio, todos arriba del horizonte, en una sala oscura: el logo sigue negro, con bandas', `${String(ESTUDIO.softbox.length)} softbox; sala ${String(ESTUDIO.sala.gris)}, piso ${String(ESTUDIO.piso.gris)}`)
controlPositivo('el detector VE la tira a la altura del logo (la primera versión: las tapas se volvían blancas)', [...ESTUDIO.softbox, { centro: [-8, 1.2, 3.5], tam: [0.8, 7] }], arribaDelHorizonte)
const escenaEstudio = escenaDelEstudio()
afirmar(escenaEstudio.escena.children.length === 2 + ESTUDIO.softbox.length, '  la escena del estudio: la sala, el piso y un plano por softbox')
escenaEstudio.soltar()
afirmar(/ESTUDIO_EN_VIVO\.nivel = Math\.min\(1, principal\.intensity \/ KEY_INTENSITY\)/.test(pruebasT3) && /material\.envMapIntensity = ESTUDIO_EN_VIVO\.reflejos \* ESTUDIO_EN_VIVO\.nivel/.test(pruebasT3), '  los reflejos siguen a la luz de la sala: de noche el estudio se apaga')

// La sombra: VSM, una lectura por píxel, sólo el logo proyecta, y de noche no se dibuja.
afirmar((SOMBRA_DEL_LOGO_GLSL.match(/texture2D\(/g) ?? []).length === 1 && !/for \(/.test(SOMBRA_DEL_LOGO_GLSL), 'la sombra en el piso: UNA lectura por píxel (el mapa de varianza desenfocado; la primera versión, PCSS, leía 36)')
controlPositivo('el detector VE la búsqueda y el filtro de PCSS', `${SOMBRA_DEL_LOGO_GLSL}\nfor ( int i = 0; i < 12; i++ ) { texture2D( uMapaDeLaSombra, uv ); }`, (c: string) => (c.match(/texture2D\(/g) ?? []).length === 1 && !/for \(/.test(c))
afirmar(/copia\.matrixAutoUpdate = false\s*copia\.matrixWorldAutoUpdate = false/.test(pruebasT3), '  las copias del logo en el mapa llevan su matriz copiada (sin eso, el dibujo la volvía la identidad y el mapa quedaba vacío)')
afirmar(/const fuerza = cruda < 0\.03 \? 0 : cruda/.test(pruebasT3) && /if \(fuerza < 0\.001\) return/.test(pruebasT3), '  de noche (la principal casi apagada) no se dibuja')
afirmar(/piso-vivo-mar\$\{conContacto \? '-contacto' : ''\}\$\{conSombra \? '-sombra-del-logo' : ''\}/.test(leer('piso/bloques.ts')), '  el piso lleva la sombra sólo con la bandera (su programa es otro)')

// El posproceso: sin bloom da la misma imagen; el bloom es sólo de noche; el TAA reproyecta sin el corrimiento.
const pp = leer('gpu/posproceso.ts')
afirmar(/escenaRT\.texture\.internalFormat = 'RGBA8'/.test(pp) && /isXRRenderTarget = true/.test(pp), 'la escena en su búfer sale como en la pantalla (el tono y la codificación de three) y se resuelve (RGBA8 en las muestras y en la textura)', 'medido: sin bloom, 0 píxeles distintos contra el dibujo directo, en el mismo cuadro')
/** Una pasada de una capa sin el fondo: con un fondo de color, three limpia el búfer aunque autoClear esté apagado. */
const sinElFondo = (c: string): boolean => /escena\.background = null\s*camara\.layers\.set\(capa\)/.test(c) && /escena\.background = fondo/.test(c)
afirmar(sinElFondo(pp), '  las pasadas de una capa (lo que brilla, el polvo sobre el TAA) sacan el fondo mientras dibujan')
controlPositivo('el detector VE la pasada con el fondo (borraba la escena)', pp.replace('escena.background = null', 'escena.background = fondo'), sinElFondo)
afirmar(/const fuerza = opciones\.bloom \? \(POSPROCESO\.bloom\.intensidad \* noche \* banco\.bloom\)/.test(pp) && /if \( uBloomFuerza > 0\.0 \) c \+= texture2D\( uBloom, vUv \)\.rgb \* uBloomFuerza \+/.test(pp), '  el bloom es proporcional a la noche (de día, nada) y su suma lleva dithering')
afirmar(LOS_QUE_BRILLAN.join() === 'haz,estrellas,fugaz' && new Set<number>([0, CAPA_DEL_BLOOM, CAPA_DEL_POLVO]).size === 3,'  brillan el haz, las estrellas y la fugaz (su capa), no el polvo')
/** El TAA reconstruye el punto con la cámara SIN corrimiento. */
const reproyectaBien = (c: string): boolean => /u\.taa\.uInversaActual\.value\.multiplyMatrices\(sinCorrimiento, camara\.matrixWorldInverse\)\.invert\(\)/.test(c)
afirmar(reproyectaBien(pp), 'el TAA reproyecta con la cámara sin corrimiento (con la corrida, el historial se leía desplazado y no convergía)', 'medido quieto: titileo 1,24 → 0,17')
controlPositivo('el detector VE la reproyección con la cámara corrida', pp.replace('multiplyMatrices(sinCorrimiento, camara.matrixWorldInverse).invert()', 'multiplyMatrices(camara.projectionMatrix, camara.matrixWorldInverse).invert()'), reproyectaBien)
afirmar(Math.abs(halton(1, 2) - 0.5) < 1e-12 && Math.abs(halton(2, 2) - 0.25) < 1e-12 && Math.abs(halton(1, 3) - 1 / 3) < 1e-12 && Array.from({ length: 8 }, (_, k) => halton(k + 1, 3)).every((v) => v > 0 && v < 1), '  el corrimiento es Halton (2, 3): repartido en el píxel, sin repetirse en 8 cuadros')
afirmar(/if \(pruebas\.aa === 'taa' && polvo\.current\.size < 2\)/.test(pruebasT3) && /soloLaCapa\(gl, escena, camara, CAPA_DEL_POLVO, escenaRT\)/.test(pp), '  con el TAA el polvo va aparte y se dibuja encima (el TAA borraba las motas: no tienen vectores de movimiento)')
const canvas = leer('configuracionDelCanvas.ts')
afirmar(/antialias: posproceso \? false : base\.antialias/.test(canvas), '  con el posproceso el lienzo va sin sus muestras (las pone el búfer de la escena)')

// El tono: la compensación descansa en que AgX y ACES conservan el gris (sus matrices suman 1 por fila).
const trozo = THREE.ShaderChunk.tonemapping_pars_fragment
/** Las filas de una mat3 de GLSL declarada por columnas, por nombre. */
const filasDe = (texto: string, nombre: string): number[][] | null => {
  const m = new RegExp(`${nombre}\\s*=\\s*mat3\\(([\\s\\S]*?)\\);`).exec(texto)
  if (m === null) return null
  const n = (m[1].match(/-?\s*\d+\.\d+/g) ?? []).map((x) => Number(x.replace(/\s+/g, '')))
  if (n.length !== 9) return null
  return [0, 1, 2].map((f) => [n[f], n[3 + f], n[6 + f]])
}
const conservaElGris = (texto: string): boolean => ['AgXInsetMatrix', 'AgXOutsetMatrix', 'ACESInputMat', 'ACESOutputMat', 'LINEAR_SRGB_TO_LINEAR_REC2020', 'LINEAR_REC2020_TO_LINEAR_SRGB'].every((k) => {
  const filas = filasDe(texto, k)
  return filas !== null && filas.every((f) => Math.abs(f[0] + f[1] + f[2] - 1) < 2e-3)
})
afirmar(conservaElGris(trozo), 'las matrices de AgX y de ACES de three suman 1 por fila: un gris entra y sale gris (la premisa de la compensación)')
controlPositivo('el detector VE una matriz que tiñe', trozo.replace('0.856627153315983', '0.9'), conservaElGris)
/** El compensado: el color del tono, escalado por Neutral sobre el tono en la luminancia (en un gris, Neutral exacto). */
const compensa = (c: string): boolean => /float brilloDeHoy = NeutralToneMapping\( vec3\( l \) \)\.g;/.test(c) && /return saturate\( (AgXToneMapping|ACESFilmicToneMapping)\( color \) \* \( brilloDeHoy \/ max\( brilloDelTono, 1e-6 \) \) \);/.test(c)
afirmar(compensa(tonoCompensadoGlsl('agx')) && compensa(tonoCompensadoGlsl('aces')), '  el tono compensado: el color de AgX (o ACES) con el brillo de Neutral', 'medido: menos del 0,4 % de los píxeles cambia más de 5 niveles; el papel y el piso llegan a ΔE 2,0–2,7 (no cumple del todo: se queda Neutral)')
controlPositivo('el detector VE el tono crudo', 'vec3 CustomToneMapping( vec3 color ) { return AgXToneMapping( color ); }', compensa)
afirmar(/const TONO_DE_PRUEBA = instalarElTono\(entornoDeLaEscena\(\)\.pruebas\.tono\)/.test(canvas) && /toneMapping: TONO_DE_PRUEBA \? THREE\.CustomToneMapping : base\.toneMapping/.test(canvas), '  se instala antes de compilar y sólo con la bandera (sin ella, Neutral)')

cerrar('s35-escena9')
