/**
 * SPRINT ESCENA 9 — PREMIUM, lo que se puede prometer sin navegador. Cada afirmación lleva su control positivo donde
 * el chequeo podría pasar por no mirar nada. Una sección por ticket.
 *
 * T1 · el obstáculo, afuera: el polvo en vuelo no se entera del logo (ni el rodeo del flujo, ni el contacto que lo
 *      corría por la cara, ni la holgura del bokeh y tras el cursor, ni el deslizar); el campo del flujo y la bandera
 *      `obstaculo` se borraron. Queda sólo lo aprobado: con la página quieta, la mota que CAE sobre una cara de arriba
 *      se posa ahí, y con el despertar o el movimiento se levanta.
 * T2 · el logo de noche: los costados sin emisión y las tapas con la de siempre y un borde en su contorno (el campo de
 *      distancia 2D del contorno del SVG); qué cara es cuál sale de la normal de la geometría; de día no cambia nada
 *      (todo es proporcional a la emisión); el amanecer guarda la noche con el mismo dibujo.
 * T3 · material y luz: el estudio generado, la sombra del logo sobre el piso vivo (varianza, una lectura por píxel) y el
 *      tono ACES compensado con el brillo de Neutral. El antialiasing de prueba (TAA u 8 muestras) se borró en ESCENA 10.
 * T4 · fluidez: los bloques del piso vivo de adelante hacia atrás (órdenes por sector, cada bloque con su celda), las
 *      dos cúpulas que no suman no se dibujan (con las condiciones exactas de su fragmento), el aire que decide el
 *      scroll en segundos y la placa del banco.
 * T5 · los títulos en 3D: borrados.
 *
 * [ESCENA 10] T1 · lo que Valentino decidió pasó al producto (el logo de noche claro, el negro satinado, la sombra del
 * logo, ACES compensado, el scroll de nk) y lo demás se borró (las otras variantes, el brillante, el bloom, AgX, el
 * sedoso, los títulos): acá queda lo que ESCENA 9 construyó y sigue valiendo; lo del producto nuevo lo afirma s36.
 */
import * as THREE from 'three'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, entornoPedido } from '../entorno'
import { FISICA } from '../polvo/simulacion'
import { conCantosSuaves } from '../cantosDelLogo'
import { PROBE_EXTRUDE } from '../probeScene'
import { CONTORNO, distanciasAlContorno } from '../logoDeNoche'
import { ESTUDIO, escenaDelEstudio } from '../estudio'
import { SOMBRA_DEL_LOGO_GLSL } from '../sombra/delLogo'
import { TONO_COMPENSADO_GLSL } from '../tono'
import { PISO_VIVO, centroDeLaCelda, grillaDelPiso } from '../piso/bloques'
import { ORDEN_DE_LA_GRILLA, ORDEN_DE_LOS_BLOQUES, armarLosOrdenes, ponerElOrden, sectorDe } from '../piso/ordenDeLosBloques'
import { CIELO_DE_DIA, diaDelCielo } from '../cieloDeDia/nubes'
import { RETENCION_DEL_SCROLL_S } from '../polvo/Aire'

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
titulo('T2 · el logo de noche: costados negros, tapas con borde (en el producto desde ESCENA 10: s36)')
const entornoFuente = leer('entorno.ts')
afirmar(/const pruebas = new URLSearchParams\(window\.location\.search\)\.get\('pruebas'\)/.test(entornoFuente) && /const pedido = pruebas === null \? null : entornoPedido\(`producto,\$\{pruebas\}`\)/.test(entornoFuente) && /\{ \.\.\.ENTORNO, titulos: pedido\.titulos, pruebas: pedido\.pruebas \}/.test(entornoFuente), 'sin banco, las pruebas se piden en la URL (`/v3?pruebas=…`): sólo las pruebas (y, desde 3D Y SONIDO, el material de los títulos), el resto del producto intacto y sin los ganchos del banco')
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
// De día no cambia: lo nuevo es proporcional a la emisión (de día, cero).
const deDiaIgual = (c: string): boolean =>
  /float noche = clamp\( emissive\.r \/ \$\{EMISION_EN_LA_NOCHE\.toFixed\(3\)\}, 0\.0, 1\.0 \);/.test(c) &&
  /vec3 tapa = uTapaDeNoche < 0\.0 \? totalEmissiveRadiance : vec3\( [^\n]*\) \* noche;/.test(c) &&
  /totalEmissiveRadiance = mix\( tapa \* vTapaDelLogo, [^\n]*\* noche, bordeDelLogoDeNoche\(\) \);/.test(c)
afirmar(deDiaIgual(logoDeNocheFuente), 'de día el logo no cambia: los costados y el borde salen de la emisión, que de día es cero', 'medido en ESCENA 9 en el mismo cuadro: 0 píxeles distintos en el hero a 1440 y a 375')
controlPositivo('el detector VE un borde que no depende de la noche', logoDeNocheFuente.replace('* noche, bordeDelLogoDeNoche() );', ', bordeDelLogoDeNoche() );'), deDiaIgual)
const luz = leer('amanecer/luz.ts')
// En el fuente, el GLSL va en una plantilla: los saltos son `\n` escritos (dos caracteres).
const guardaConDibujo = (c: string): boolean =>
  c.includes('#ifdef LOGO_DE_NOCHE_CON_BORDE\\n\\tgl_FragColor.rgb = mix( colorDelLogoDeNoche( ${LOGO_DE_NOCHE.toFixed(2)} ), gl_FragColor.rgb, alcanzadoPorElDia( vMundoDelLogo ) );') &&
  c.includes('#else\\n\\tgl_FragColor.rgb = mix( vec3( ${LOGO_DE_NOCHE.toFixed(2)} ), gl_FragColor.rgb, alcanzadoPorElDia( vMundoDelLogo ) );\\n#endif')
afirmar(guardaConDibujo(luz), 'el amanecer guarda la noche con el mismo dibujo; sin él (`logo-noche=no`), el gris parejo')
controlPositivo('el detector VE el amanecer de antes (sólo el gris parejo)', luz.replace('#ifdef LOGO_DE_NOCHE_CON_BORDE', ''), guardaConDibujo)

// ── T3 · material y luz ───────────────────────────────────────────────────
titulo('T3 · material y luz: el estudio, la sombra y el tono (el bloom, el brillante y el antialiasing de prueba se borraron)')
const luzDelLogo = leer('LuzDelLogo.tsx')
afirmar(!existsSync(path.join(ESCENA, 'gpu/posproceso.ts')) && !/posproceso|Posproceso/.test(leer('PruebasDeLaEscena.tsx')) && !('aa' in entornoPedido('producto,aa=taa').pruebas), '[ESCENA 10] el posproceso de prueba (el bloom, el TAA y las 8 muestras) se borró: queda el antialias del lienzo de CALIDAD 1')

// El estudio: lo arma y lo suelta el MISMO montaje (en desarrollo React monta dos veces).
const logoFuente = leer('ProbeLogo.tsx')
const estudioEnElEfecto = (c: string): boolean => /useEffect\(\(\) => \{\s*if \(!entornoDeLaEscena\(\)\.materialDelLogo\) return undefined\s*return ponerElEstudio\(material, gl\)/.test(c) && !/useMemo\([^)]*(crearElEstudio|ponerElEstudio)/.test(c)
afirmar(estudioEnElEfecto(logoFuente) && /estudio\.dispose\(\)/.test(leer('estudio.ts')), 'el entorno lo arma y lo suelta cada montaje (armado en el render y soltado en la limpieza quedaba negro)')
controlPositivo('el detector VE el estudio armado en el render', logoFuente.replace('return ponerElEstudio(material, gl)', 'return undefined'), estudioEnElEfecto)
/** Ningún softbox baja del horizonte: una tapa plana vista desde apenas arriba refleja hacia abajo, y no lo toma entero. */
const arribaDelHorizonte = (cajas: readonly { readonly centro: readonly number[]; readonly tam: readonly number[] }[]): boolean => cajas.every((b) => b.centro[1] - b.tam[1] / 2 > 1)
afirmar(arribaDelHorizonte(ESTUDIO.softbox) && ESTUDIO.sala.gris < 0.1 && ESTUDIO.piso.gris < 0.2, '  los softbox del estudio, todos arriba del horizonte, en una sala oscura: el logo sigue negro, con bandas', `${String(ESTUDIO.softbox.length)} softbox; sala ${String(ESTUDIO.sala.gris)}, piso ${String(ESTUDIO.piso.gris)}`)
controlPositivo('el detector VE la tira a la altura del logo (la primera versión: las tapas se volvían blancas)', [...ESTUDIO.softbox, { centro: [-8, 1.2, 3.5], tam: [0.8, 7] }], arribaDelHorizonte)
const escenaEstudio = escenaDelEstudio()
afirmar(escenaEstudio.escena.children.length === 2 + ESTUDIO.softbox.length, '  la escena del estudio: la sala, el piso y un plano por softbox')
escenaEstudio.soltar()
afirmar(/material\.envMapIntensity = Math\.min\(1, principal\.intensity \/ KEY_INTENSITY\)/.test(luzDelLogo), '  los reflejos siguen a la luz de la sala: de noche el estudio se apaga')

// La sombra: VSM, una lectura por píxel, sólo el logo proyecta, y de noche no se dibuja.
afirmar((SOMBRA_DEL_LOGO_GLSL.match(/texture2D\(/g) ?? []).length === 1 && !/for \(/.test(SOMBRA_DEL_LOGO_GLSL), 'la sombra en el piso: UNA lectura por píxel (el mapa de varianza desenfocado; la primera versión, PCSS, leía 36)')
controlPositivo('el detector VE la búsqueda y el filtro de PCSS', `${SOMBRA_DEL_LOGO_GLSL}\nfor ( int i = 0; i < 12; i++ ) { texture2D( uMapaDeLaSombra, uv ); }`, (c: string) => (c.match(/texture2D\(/g) ?? []).length === 1 && !/for \(/.test(c))
afirmar(/copia\.matrixAutoUpdate = false\s*copia\.matrixWorldAutoUpdate = false/.test(luzDelLogo), '  las copias del logo en el mapa llevan su matriz copiada (sin eso, el dibujo la volvía la identidad y el mapa quedaba vacío)')
afirmar(/if \(fuerza < 0\.001\) return/.test(luzDelLogo), '  sin fuerza (de noche) el mapa no se dibuja')
afirmar(/piso-vivo-mar\$\{conContacto \? '-contacto' : ''\}\$\{conSombra \? '-sombra-del-logo' : ''\}/.test(leer('piso/bloques.ts')), '  el piso lleva la sombra sólo cuando la hay (su programa es otro; el banco la apaga con `sombra-logo=no`)')

// El tono: la compensación descansa en que ACES conserva el gris (sus matrices suman 1 por fila; las de AgX también).
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
afirmar(compensa(TONO_COMPENSADO_GLSL), '  el tono compensado: el color de ACES con el brillo de Neutral', 'medido en ESCENA 9: menos del 0,4 % de los píxeles cambia más de 5 niveles; el papel y el piso llegan a ΔE 2,0–2,7')
controlPositivo('el detector VE el tono crudo', 'vec3 CustomToneMapping( vec3 color ) { return ACESFilmicToneMapping( color ); }', compensa)

// ── T4 · fluidez ──────────────────────────────────────────────────────────
titulo('T4 · fluidez: lo tapado y lo que no suma no se pinta; el scroll suave, a prueba')
// Los bloques del piso vivo de adelante hacia atrás: órdenes por sector, armados una vez; cada instancia con su celda.
afirmar(ENTORNO.ordenDelPiso && !entornoPedido('producto,orden-piso=no').ordenDelPiso && !BASE_LIMPIA.ordenDelPiso, 'los bloques de adelante hacia atrás, en el producto (`orden-piso=no` los deja en el orden de la grilla, para comparar)')
const grillaT4 = grillaDelPiso(PISO_VIVO.radioDeReferencia)
const centrosT4 = new Float32Array(grillaT4.cuantas * 2)
const matricesT4 = new Float32Array(grillaT4.cuantas * 16)
for (let k = 0; k < grillaT4.cuantas; k += 1) {
  const [x, z] = centroDeLaCelda(grillaT4.celdas[k * 2], grillaT4.celdas[k * 2 + 1], grillaT4)
  centrosT4.set([x, z], k * 2)
  matricesT4.set(new THREE.Matrix4().makeTranslation(x, 0, z).elements, k * 16)
}
const ordenesT4 = armarLosOrdenes(centrosT4, matricesT4, grillaT4.celdas)
/** De adelante hacia atrás para el sector: la proyección hacia la cámara nunca sube a lo largo del orden. */
const deAdelanteHaciaAtras = (orden: Uint32Array, sector: number): boolean => {
  const a = (sector / ORDEN_DE_LOS_BLOQUES.sectores) * 2 * Math.PI
  let previa = Infinity
  for (const j of orden) {
    const p = centrosT4[j * 2] * Math.cos(a) + centrosT4[j * 2 + 1] * Math.sin(a)
    if (p > previa + 1e-9) return false
    previa = p
  }
  return true
}
const sonPermutaciones = ordenesT4.ordenes.every((o) => o.length === grillaT4.cuantas && new Set(o).size === grillaT4.cuantas)
afirmar(sonPermutaciones && ordenesT4.ordenes.length === ORDEN_DE_LOS_BLOQUES.sectores + 1 && ordenesT4.ordenes.slice(0, -1).every((o, k) => deAdelanteHaciaAtras(o, k)), `  ${String(ORDEN_DE_LOS_BLOQUES.sectores)} órdenes, cada uno con todos los bloques una vez y de adelante hacia atrás desde su sector; el último, el de la grilla`, `${String(grillaT4.cuantas)} bloques`)
controlPositivo('el detector VE el orden de la grilla (de −z a +z: de atrás hacia adelante con la cámara del lado +z)', ordenesT4.ordenes[ORDEN_DE_LA_GRILLA], (o: Uint32Array) => deAdelanteHaciaAtras(o, 2))
afirmar(sectorDe(1, 0) === 0 && sectorDe(0, 1) === 2 && sectorDe(-1, 0) === 4 && sectorDe(0, -1) === 6 && sectorDe(1, -0.01) === 0, '  el sector sale de la dirección del centro del piso hacia la cámara')
// Reordenar no puede separar un bloque de su celda: la simulación se lee por la celda y el bloque se dibuja por su matriz.
const mallaT4 = new THREE.InstancedMesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial(), grillaT4.cuantas)
mallaT4.instanceMatrix.array.set(matricesT4)
const celdasT4 = new THREE.InstancedBufferAttribute(grillaT4.celdas.slice(), 2)
/** Cada instancia: su matriz está en el centro de su celda. */
const pareadas = (m: THREE.InstancedMesh, c: THREE.InstancedBufferAttribute): boolean => {
  for (let k = 0; k < grillaT4.cuantas; k += 1) {
    const [x, z] = centroDeLaCelda(c.array[k * 2], c.array[k * 2 + 1], grillaT4)
    if (Math.abs(m.instanceMatrix.array[k * 16 + 12] - x) > 1e-4 || Math.abs(m.instanceMatrix.array[k * 16 + 14] - z) > 1e-4) return false
  }
  return true
}
ponerElOrden(mallaT4, celdasT4, ordenesT4, 3)
const pareadasEn3 = pareadas(mallaT4, celdasT4)
ponerElOrden(mallaT4, celdasT4, ordenesT4, ORDEN_DE_LA_GRILLA)
afirmar(pareadasEn3 && pareadas(mallaT4, celdasT4) && celdasT4.array.every((v, k) => v === grillaT4.celdas[k]), '  al reordenar, cada bloque se lleva su celda (la simulación y el dibujo siguen apareados), y el de la grilla vuelve a como estaba')
const celdasCorridas = new THREE.InstancedBufferAttribute(celdasT4.array.slice(), 2)
celdasCorridas.array.copyWithin(0, 2)
controlPositivo('el detector VE las celdas corridas una instancia', celdasCorridas, (c: THREE.InstancedBufferAttribute) => pareadas(mallaT4, c))
const pisoVivoFuente = leer('piso/PisoVivo.tsx')
afirmar(/if \(armado\.orden !== null && !armado\.orden\.apagado\) ponerElOrden\(armado\.bloques, armado\.celdas, armado\.orden, m\.sector\)/.test(pisoVivoFuente) && /if \(cual === o\.puesto\) return/.test(leer('piso/ordenDeLosBloques.ts')), '  en cada cuadro sólo se pregunta el sector: se copia únicamente al cambiar', 'medido a 1440 con dpr 1,5: hero 16,1 → 11,7 ms de GPU en la integrada, 2,1 → 1,5 en la NVIDIA; la imagen, igual salvo en aristas compartidas (0–292 píxeles de 1,3 millones)')

// La vía láctea: se deja de dibujar exactamente cuando su fragmento vale cero (de día y en el túnel).
const estrellasFuente = leer('estrellas/Estrellas.tsx')
/** La condición de la cúpula en JS es la del shader: el borde de su `smoothstep`, la visibilidad, las estrellas del amanecer. */
const escondeSoloEnCero = (c: string): boolean =>
  /float noche = smoothstep\( \$\{NOCHE_DE_LA_CUPULA\.toFixed\(2\)\}, 0\.9, uNoche \) \* uVisible \* uEstrellasDelAmanecer;/.test(c) &&
  /const deNoche = VIVO\.uNoche\.value > NOCHE_DE_LA_CUPULA && visible > 0 && a\.uEstrellasDelAmanecer\.value > 0/.test(c) &&
  /return deNoche \|\| a\.uResplandor\.value > 0 \|\| a\.uBarridoDelDia\.value > 0\.5/.test(c) &&
  /cupula\.visible = cupulaEnCuadro\(visible\)/.test(c)
afirmar(escondeSoloEnCero(estrellasFuente), 'la vía láctea no se dibuja cuando no suma: de día, en el túnel y con las estrellas apagadas (las mismas condiciones que anulan su fragmento)', 'medido en el mismo cuadro: 0 píxeles distintos en los cinco momentos y en tres del amanecer; 1,0–1,7 ms menos de día a 1440 con dpr 1,5')
controlPositivo('el detector VE un umbral más alto que el del shader (la escondería mientras todavía suma)', estrellasFuente.replace('VIVO.uNoche.value > NOCHE_DE_LA_CUPULA', 'VIVO.uNoche.value > 0.6'), escondeSoloEnCero)
// El cielo de día: sin nada de día pinta el color de la niebla, el del fondo.
afirmar(diaDelCielo(1) === 0 && diaDelCielo(CIELO_DE_DIA.noche[1]) === 0 && diaDelCielo(0) === 1 && /a\.cupula\.visible = mostrado && a\.uniforms\.uDia\.value > 0/.test(leer('cieloDeDia/CieloDeDia.tsx')), 'el cielo de día no se dibuja de noche (su día vale cero exacto desde la noche que lo apaga)', 'medido en el mismo cuadro: 0 píxeles distintos de noche; en el amanecer, 1 a 3 píxeles de 3 niveles (el dithering)')

// El scroll suave: [ESCENA 10] T1 · el modo de nk pasó al producto (s36); queda la premisa que lo sostiene.
const deLaRaiz = (rel: string): string => readFileSync(path.join(process.cwd(), rel), 'utf8')
const lerpDeNk = Number(/\| `lerp` \| \*\*([0-9.]+)\*\* \|/.exec(deLaRaiz('docs/rediseno/s0/SCROLL.md'))?.[1] ?? 'NaN')
// La premisa: la curva del sitio (1,1 s con la exponencial de salida) y la de nk son casi la misma.
const sitio = deLaRaiz('src/components/layout/SmoothScroll.tsx')
const duracionDeHoy = Number(/duration: ([0-9.]+),/.exec(sitio)?.[1] ?? 'NaN')
const conLaCurvaDeHoy = /easing: \(t: number\) => Math\.min\(1, 1\.001 - Math\.pow\(2, -10 \* t\)\),/.test(sitio)
/** Lo que falta para llegar (de 1 a 0) con la curva de hoy de duración `d`, contra el lerp de nk (continuo en el tiempo). */
const apartamiento = (d: number): number => {
  let peor = 0
  for (let t = 0; t <= d; t += 0.005) peor = Math.max(peor, Math.abs(1 - Math.min(1, 1.001 - 2 ** (-10 * (t / d))) - Math.exp(-lerpDeNk * 60 * t)))
  return peor
}
const parecidas = (d: number): boolean => conLaCurvaDeHoy && apartamiento(d) < 0.03
afirmar(parecidas(duracionDeHoy), 'la curva de hoy y la de nk son casi la misma exponencial: lo que falta para llegar difiere menos del 3 % del gesto', `duración ${String(duracionDeHoy)} s: ${(apartamiento(duracionDeHoy) * 100).toFixed(1)} %`)
controlPositivo('el detector VE una curva que no se parece (0,6 s)', 0.6, parecidas)

// El aire decide si hay scroll en segundos: el scroll se mueve de a píxeles enteros y, contado por cuadro, en la cola de
// Lenis a 144 Hz el aire creía que el scroll paraba dos cuadros de cada tres.
const aireFuente = leer('polvo/Aire.tsx')
const enSegundos = (c: string): boolean => /m\.desdeElScroll = [^\n]*\? 0 : m\.desdeElScroll \+ dt/.test(c) && /const conScroll = m\.desdeElScroll < RETENCION_DEL_SCROLL_S/.test(c)
afirmar(enSegundos(aireFuente) && RETENCION_DEL_SCROLL_S >= 1 / 30 && RETENCION_DEL_SCROLL_S <= 0.1, 'el aire decide si hay scroll en segundos (cuenta como scroll hasta 50 ms después del último píxel)', 'medido con el reloj virtual (t4-hz): la deriva a 144 Hz se apartaba 10,7 % de la de 60; ahora 1,6 %')
controlPositivo('el detector VE la decisión por cuadro (la de antes)', aireFuente.replace(/m\.desdeElScroll = [^\n]*\n\s*const conScroll = m\.desdeElScroll < RETENCION_DEL_SCROLL_S/, 'const conScroll = !Number.isNaN(m.progreso) && Math.abs(progreso - m.progreso) > 1e-6'), enSegundos)

// La placa: el Chrome del banco elige la integrada; `BANCO_GPU=alta` pide la NVIDIA.
afirmar(/process\.env\.BANCO_GPU === 'alta' \? \['--force_high_performance_gpu'\] : \[\]/.test(deLaRaiz('scripts-b4/cdp.ts')), 'el banco puede medir con la NVIDIA (`BANCO_GPU=alta`): por defecto Chrome usa la AMD integrada', 'medido con WEBGL_debug_renderer_info (t4-gpu)')

// ── T5 · títulos en 3D ────────────────────────────────────────────────────
titulo('T5 · los títulos en 3D de ESCENA 9: borrados (los reemplaza T3 de ESCENA 10)')
const deV3 = (rel: string): string => path.join(process.cwd(), 'src/app/v3', rel)
const restos = ['_componentes/titulos3d/LetrasQueLlegan.tsx', '_componentes/titulos3d/TituloDePrueba.tsx', '_lib/titulos3d/llegada.ts', '_lib/titulos3d/enLaEscena.ts', '_lib/escena/titulos', '_fuentes/chivo-400-latin.ttf'].filter((r) => existsSync(deV3(r)))
// [3D Y SONIDO] T1: los títulos pasaron al producto (`Entorno.titulos`): `dom` y `webgl` no los piden.
const titulosPedidos = (v: string): unknown => entornoPedido(`producto,titulos=${v}`).titulos
afirmar(restos.length === 0 && titulosPedidos('dom') !== 'dom' && titulosPedidos('webgl') !== 'webgl', 'V1 (DOM) y V2 (troika) no existen: ni sus archivos, ni la TTF, ni sus banderas', restos.join(', ') || 'nada')
const secciones = readFileSync(deV3('_secciones/trabajos/piezas.tsx'), 'utf8') + readFileSync(deV3('_secciones/por-que-develop/PorQueDevelop.tsx'), 'utf8')
afirmar(!/TituloDePrueba|usePruebaDeTitulos|LetrasQueLlegan/.test(secciones), '  y las secciones volvieron a su pieza de siempre')

cerrar('s35-escena9')
