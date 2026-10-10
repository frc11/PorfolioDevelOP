/**
 * RETOQUE DEL PIE + FILO — el invariante: npm run test:s44-pie
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   P1 · el filo de día: la b (los costados en otro gris) en todos los títulos 3D negros; la a, la c y la bandera, borradas.
 *   P2 · el pie en WebGL, con la lógica de los títulos 3D: fijo en el mundo y de frente (sólo se mueve la cámara); el texto
 *        extruido, los enlaces en placas, el formulario en una placa con pozos y su tecla; lo interactivo es el DOM, sobre
 *        su pieza; se hunde sin girar; sombras de contacto en el piso vivo; abajo de 1025 plano; `pie=antes`.
 *   P3 · `pie=llegada` (se arma al final de la página) y `pie=onda` (el piso ondea hacia la pieza), apagadas; `pie=luz`,
 *        descartada (el pie siempre es de día). [NOCTURNO] A2: la llegada se borró (el pie sólo aparece desde abajo, con el
 *        scroll) y la onda pasó al producto.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/pie/LEEME.txt`.
 */
import { existsSync, readFileSync } from 'node:fs'

import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datos400 from '../../_fuentes/chivo-400-pie.json'
import datos500 from '../../_fuentes/chivo-500-pie.json'
import datos600 from '../../_fuentes/chivo-600-pie.json'
import { LOGOTIPO } from '../../_componentes/marca/sistema'
import { MAIL, LINEA_LEGAL, WHATSAPP } from '../../_secciones/cierre/contacto'
import { COLUMNAS, CONTACTO_DEL_FORMULARIO, DESTINOS_DE_LA_RUTA, TITULAR_DE_CIERRE } from '../../_secciones/cierre/contenido'
import { ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { SATINADO } from '../escena/estudio'
import { COLOCACION_DEL_PIE, colocarLaPieza, profundidadDeLaPieza, profundidadDelLogo } from '../escena/pie3d/colocacion'
import { VOLUMEN_DEL_PIE, armarLaPieza, type FuentesDelPie } from '../escena/pie3d/geometria'
import { materialDelPie } from '../escena/pie3d/material'
import { HUNDIDA_DEL_PIE } from '../escena/pie3d/armadas'
import { SOMBRAS_DEL_PIE_GLSL, formaDeLaSombra } from '../escena/pie3d/sombras'
import { CAMERA_FOV, FLOOR_Y } from '../escena/probeScene'
import { COSTADO_DE_DIA, costadoDeDiaGlsl } from '../escena/titulos3d/filo'
import { aplicar, homografia, matrix3dCss } from '../pie3d/homografia'
import type { CajaDelPie, LetraDelPie } from '../pie3d/medida'
import { cuantoSeHunde, type Hundido } from '../pie3d/registro'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1 · El filo de día: la b, en el producto')

const glsl = costadoDeDiaGlsl(2)
const esLaB = (g: string): boolean => /mix\( vec3\( 0\.200 \), diffuseColor\.rgb, mix\( 1\.0, vTapaDelLogo, /.test(g) && /emissive\.r \/ 2\.000/.test(g) && !/uContornoDelLogo/.test(g)
afirmar(esLaB(glsl) && COSTADO_DE_DIA === 0.2, 'de día, los costados en un gris (0,2 lineal) distinto de la cara; se apaga con la noche del logo; sin el filo claro de la a')
controlPositivo('el detector VE el filo claro de la a', `${glsl}\nfloat d = texture2D( uContornoDelLogo, vPlanoDelLogo ).r;`, esLaB)
const material = sinComentarios((leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx') + leer('_lib/escena/titulos3d/armado.ts')))
const enTodos = (c: string): boolean =>
  /if \(variante === 'blanco'\) shader\.fragmentShader = [^\n]*FILO_DE_DIA_GLSL[^\n]*\n\s*else shader\.fragmentShader = shader\.fragmentShader\.replace\('#include <map_fragment>', `#include <map_fragment>\\n\$\{costadoDeDiaGlsl\(EMISION_EN_LA_NOCHE\)\}`\)/.test(c) &&
  /customProgramCacheKey = \(\) => `titulo-de-volumen-\$\{variante\}`/.test(c)
afirmar(enTodos(material), '  en todos los títulos negros (el hero, El equipo, Portfolio, la frase, las demos): sin condición; el blanco sigue con su filo oscuro')
controlPositivo('el detector VE la b todavía con bandera', material.replace("else shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>'", "else if (filo !== 'no') shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>'"), enTodos)
// [PULIDO 6] E2 · el nombre `filo=` volvió con otro sentido (el filo del logo). [PULIDO 7] F1 · y se borró otra vez (ganó la
// descarga): vuelve la aserción de antes, la clave `filo` no está.
const sinBandera = (e: typeof ENTORNO, codigo: string): boolean => !('filo' in e.pruebas) && !/pruebas\.filo|filoDeDiaGlsl|FILO_DE_DIA\b/.test(codigo)
afirmar(sinBandera(ENTORNO, material) && !('filo' in PRUEBAS_APAGADAS) && !('filo' in entornoPedido('producto,filo=a').pruebas), '  la a, la c y la bandera se borraron: `?pruebas=filo=a` ya no pide nada')
controlPositivo('el detector VE la bandera', { ...ENTORNO, pruebas: { filo: 'a' } } as unknown as typeof ENTORNO, (e) => sinBandera(e, material))
const delLogo = ['_lib/escena/logoDeNoche.ts', '_lib/escena/logoEmision.ts'].map(leer).join('\n')
afirmar(!/filo'|costadoDeDiaGlsl/.test(delLogo), '  el logo no se toca')

// ═══════════════════════════════════════════════════════════════════════════
titulo('P2 · El pie en 3D de verdad')

// Lo interactivo sobre su pieza: la homografía lleva la caja al cuadrilátero (sus cuatro esquinas, con perspectiva).
const m: number[] = []
const cerca = (a: readonly number[], b: readonly number[], tol = 0.01): boolean => a.length === b.length && a.every((v, k) => Math.abs(v - b[k]) <= tol)
const llevaLasEsquinas = (h: typeof homografia, q: readonly number[]): boolean => {
  if (!h(200, 60, q, m)) return false
  const [w, alto] = [200, 60]
  return [[0, 0], [w, 0], [w, alto], [0, alto]].every(([x, y], k) => cerca(aplicar(m, x, y), [q[2 * k], q[2 * k + 1]]))
}
const quieta = [0, 0, 200, 0, 200, 60, 0, 60]
const enPerspectiva = [6, -3, 211, 2, 207, 66, 3, 58]
afirmar(llevaLasEsquinas(homografia, quieta) && cerca(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], 1e-9) && llevaLasEsquinas(homografia, enPerspectiva), 'lo interactivo, sobre su pieza: la caja del DOM va a donde la cámara viva ve la cara (las cuatro esquinas, con su perspectiva); quieta, la identidad')
const soloAfin: typeof homografia = (w, h, q, d) => {
  d.length = 16
  d.splice(0, 16, (q[2] - q[0]) / w, (q[3] - q[1]) / w, 0, 0, (q[6] - q[0]) / h, (q[7] - q[1]) / h, 0, 0, 0, 0, 1, 0, q[0], q[1], 0, 1)
  return true
}
controlPositivo('el detector VE una transformada sin perspectiva (la cuarta esquina se va)', soloAfin, (h) => llevaLasEsquinas(h, enPerspectiva))
afirmar(/^matrix3d\((-?[\d.e+-]+,){15}-?[\d.e+-]+\)$/.test(matrix3dCss(m)), '  se escribe como `matrix3d` (con `transform-origin` en 0 0)')

// Dónde va: la cámara de la pose del pie (sin el mouse), de frente; a la profundidad del logo, o adelante si quedaría bajo el piso.
const camara = new THREE.PerspectiveCamera(CAMERA_FOV, 1440 / 900, 0.1, 400)
camara.position.set(0, 5, 40)
camara.lookAt(0, 0, 0)
camara.updateMatrixWorld()
const dLogo = profundidadDelLogo(camara)
const enElPiso = (prof: (c: THREE.Camera, x: number, y: number, w: number, h: number) => number): boolean => {
  const arriba = prof(camara, 300, 300, 1440, 900)
  const abajo = prof(camara, 300, 820, 1440, 900)
  const grupo = new THREE.Group()
  colocarLaPieza(grupo, camara, 300, 780, 1440, 900, abajo)
  grupo.updateMatrixWorld(true)
  const pie = new THREE.Vector3(0, -40, 0).applyMatrix4(grupo.matrixWorld)
  return Math.abs(arriba - dLogo) < 1e-6 && abajo < dLogo && pie.y >= FLOOR_Y + COLOCACION_DEL_PIE.holgura - 0.05
}
afirmar(enElPiso(profundidadDeLaPieza), '  arriba del piso, a la profundidad del logo (como los títulos); más abajo que su base, adelante hasta quedar sobre el piso (nunca adentro)', `logo ${dLogo.toFixed(1)} · abajo ${profundidadDeLaPieza(camara, 300, 820, 1440, 900).toFixed(1)}`)
controlPositivo('el detector VE la pieza bajo el piso', () => dLogo, enElPiso)
const g = new THREE.Group()
const mpp = colocarLaPieza(g, camara, 900, 300, 1440, 900, dLogo)
g.updateMatrixWorld(true)
const enSuLugar = new THREE.Vector3(100, -50, 0).applyMatrix4(g.matrixWorld).project(camara)
afirmar(cerca([((enSuLugar.x + 1) / 2) * 1440, ((1 - enSuLugar.y) / 2) * 900], [1000, 350], 0.05) && g.quaternion.angleTo(camara.quaternion) < 1e-6 && mpp > 0, '  la cámara de la pose la ve en su lugar del DOM y de su tamaño (un px de la pieza, un px del cuadro), mirando al frente')
const escenaEntera = ['_lib/escena/pie3d/PieDeVolumen.tsx', '_lib/escena/pie3d/armadas.ts'].map((r) => sinComentarios(leer(r))).join('\n')
// [PULIDO 10] J5 · la única pieza que gira es la tecla con «Reintentar» (entra girando desde canto, por tiempo, y termina de frente):
// se la saca de la búsqueda de giros y se afirma aparte que no lee el mouse. Antes: ningún giro en todo el archivo.
const GIRO_DE_LA_TECLA = /function girarLaTecla\([\s\S]*?\n\}\n/
const escena = escenaEntera.replace(GIRO_DE_LA_TECLA, '')
const giroDeLaTecla = GIRO_DE_LA_TECLA.exec(escenaEntera)?.[0] ?? ''
afirmar(giroDeLaTecla.includes('a.giroDeLaTecla += dt') && giroDeLaTecla.includes('a.cuerpo.rotation.x = u >= 1 ? 0 : angulo') && !/puntero|mirada|mouse/i.test(giroDeLaTecla), '  [PULIDO 10] J5 · la tecla de Reintentar gira por tiempo (desde canto hasta de frente) y no lee el mouse')
const fijaEnElMundo = (c: string): boolean => /colocarLaPieza\(a\.grupo, CAMARA_SIN_EL_MOUSE, /.test(c) && /profundidadDeLaPieza\(CAMARA_SIN_EL_MOUSE, /.test(c) && !/suscribirALaMirada|puntero|rotation\.|rotate[XYZ]\(/.test(c)
afirmar(fijaEnElMundo(escena), '  fija en el mundo: se coloca con la cámara SIN el mouse (lo único que se mueve es la cámara); ninguna pieza gira con el mouse ni lo lee ([PASADA FINAL] C2: su llegada por columnas va aparte, en `coreografia.ts`)')
controlPositivo('el detector VE una pieza que gira con el mouse', `${escena}\na.grupo.rotation.y = puntero.x`, fijaEnElMundo)
// [PASADA FINAL] C2 · la llegada (lo único que gira, y sólo mientras llega) tampoco lee el mouse: es función del scroll.
const coreografiaDelPie = sinComentarios(leer('_lib/escena/pie3d/coreografia.ts'))
const sinMouse = (c: string): boolean => !/suscribirALaMirada|puntero|pointer|mouse|clientX/.test(c)
afirmar(sinMouse(coreografiaDelPie), '  y su llegada por columnas tampoco lo lee: la pose sale sólo de cuánto llegó cada pieza (el scroll)')
controlPositivo('el detector VE una llegada que mira el mouse', `${coreografiaDelPie}\nconst giro = puntero.x`, sinMouse)
afirmar(/a\.d = d\b/.test(escena) && /d = Math\.min\(d, profundidadDeLaPieza\(/.test(escena), '  todas en un plano (el más cercano que pide el piso): el paralaje mueve el pie entero, un rótulo no se despega de su columna')

// La geometría: el texto suelto extruido; la placa con su relieve; el formulario, una placa con pozos y la tecla de Enviar.
const FUENTES: FuentesDelPie = { 400: new Font(datos400 as FontData), 500: new Font(datos500 as FontData), 600: new Font(datos600 as FontData) }
const letra = (ch: string, x: number, arriba: number, cuerpo: number, peso: 400 | 500 | 600, enLaTecla = false): LetraDelPie => ({ ch, x, arriba, alto: cuerpo * 1.2, cuerpo, peso, enLaTecla })
const caja = (x: number, y: number, ancho: number, alto: number, radio = 0): CajaDelPie => ({ x, y, ancho, alto, radio })
const zDe = (geo: THREE.BufferGeometry | null): [number, number] => {
  if (geo === null) return [Number.NaN, Number.NaN]
  geo.computeBoundingBox()
  const b = geo.boundingBox ?? new THREE.Box3()
  return [b.min.z, b.max.z]
}
const placa = armarLaPieza('placa', { caja: caja(0, 0, 120, 34), letras: [...'Inicio'].map((c, k) => letra(c, 40 + k * 9, 8, 15, 600)), trazos: [], pozos: [], tecla: null }, FUENTES)
const [atrasDeLaPlaca, adelanteDeLaPlaca] = zDe(placa.hundible)
afirmar(placa.fija === null && Math.abs(atrasDeLaPlaca + VOLUMEN_DEL_PIE.placa) < 0.01 && adelanteDeLaPlaca >= VOLUMEN_DEL_PIE.relieve.px - 0.01 && placa.hundible?.getAttribute('color') !== undefined, 'un enlace: una placa sólida (con su espesor hacia atrás, entera se hunde) y su texto en relieve hacia la cámara, con su color')
const formulario = armarLaPieza('formulario', { caja: caja(0, 0, 253, 400, 10), letras: [letra('N', 20, 20, 10, 500), letra('E', 30, 340, 15, 600, true)], trazos: [], pozos: [caja(20, 40, 213, 60, 4), caja(20, 130, 213, 60, 4)], tecla: caja(20, 320, 110, 50, 25) }, FUENTES)
const [atrasDelFormulario] = zDe(formulario.fija)
const [, adelanteDeLaTecla] = zDe(formulario.hundible)
const pozos = (p: typeof formulario): boolean => {
  if (p.fija === null) return false
  const pos = p.fija.getAttribute('position')
  let enElFondo = 0
  for (let i = 0; i < pos.count; i += 1) if (Math.abs(pos.getZ(i) + VOLUMEN_DEL_PIE.pozo) < 0.01) enElFondo += 1
  return enElFondo > 0
}
afirmar(pozos(formulario) && Math.abs(atrasDelFormulario + VOLUMEN_DEL_PIE.formulario) < 1.01 && adelanteDeLaTecla >= VOLUMEN_DEL_PIE.tecla + VOLUMEN_DEL_PIE.relieve.px - 0.01, '  el formulario: UNA placa, con un pozo por campo (su pared y su fondo, más adentro) y Enviar como tecla que sale de la cara (aparte: se hunde sola)')
controlPositivo('el detector VE el formulario sin pozos', { ...formulario, fija: armarLaPieza('formulario', { caja: caja(0, 0, 253, 400, 10), letras: [], trazos: [], pozos: [], tecla: null }, FUENTES).fija }, pozos)
const texto = armarLaPieza('texto', { caja: caja(0, 0, 500, 120), letras: [...'Lo que'].filter((c) => c !== ' ').map((c, k) => letra(c, k * 30, 10, 56, 400)), trazos: [], pozos: [], tecla: null }, FUENTES)
const [atrasDelTexto, adelanteDelTexto] = zDe(texto.fija)
afirmar(texto.hundible === null && Math.abs(adelanteDelTexto) < 1 && Math.abs(atrasDelTexto + VOLUMEN_DEL_PIE.texto.profundidad * 56) < 1, '  el texto suelto (el titular, el logotipo, los rótulos, la línea legal), extruido como los títulos: la cara donde el DOM y el cuerpo hacia atrás')

// Cada texto del pie, en la fuente de su peso (si cambia el contenido, se regenera: `scripts-retoque/fuentes-3d.py`).
const conGlifos = (f: FontData, textos: readonly string[]): string[] => [...new Set(textos.join('').replace(/\s/g, ''))].filter((c) => (f.glyphs as Record<string, unknown>)[c] === undefined)
const faltan = [
  ...conGlifos(datos400 as FontData, [TITULAR_DE_CIERRE, LINEA_LEGAL]),
  ...conGlifos(datos500 as FontData, [...COLUMNAS.map((c) => c.titulo), CONTACTO_DEL_FORMULARIO.nombre, CONTACTO_DEL_FORMULARIO.mail, CONTACTO_DEL_FORMULARIO.mensaje].map((t) => t.toLocaleUpperCase('es'))),
  ...conGlifos(datos600 as FontData, [LOGOTIPO, ...DESTINOS_DE_LA_RUTA.map((d) => d.rotulo), MAIL, WHATSAPP.rotulo, CONTACTO_DEL_FORMULARIO.enviar, CONTACTO_DEL_FORMULARIO.enviando]),
]
afirmar(faltan.length === 0, '  cada letra del pie está en la Chivo de su peso (400 el titular y la línea legal, 500 los rótulos en mayúsculas, 600 lo demás)', faltan.join(''))

// El material: el negro satinado con el filo b (P1): lo que no es cara, en el gris de los costados.
const shader = { uniforms: {}, vertexShader: '#include <common>\n#include <beginnormal_vertex>', fragmentShader: '#include <common>\n#include <color_fragment>' }
const mat = materialDelPie()
mat.onBeforeCompile(shader as unknown as Parameters<THREE.Material['onBeforeCompile']>[0], {} as THREE.WebGLRenderer)
afirmar(mat.vertexColors && mat.roughness === SATINADO.roughness && /vTapaDelPie = step\( 0\.999, abs\( objectNormal\.z \) \)/.test(shader.vertexShader) && shader.fragmentShader.includes(`mix( vec3( ${COSTADO_DE_DIA.toFixed(3)} ), diffuseColor.rgb, vTapaDelPie )`), '  el negro satinado del logo, con el filo b: los costados, el bisel y las paredes de los pozos en el gris de los títulos')

// Se hunde en su eje, sin girar; con el mouse, el foco y apretada; y suena como los CTA.
const h = (encima: boolean, foco: boolean, apretada: boolean): Hundido => ({ encima, foco, apretada })
afirmar(cuantoSeHunde(h(false, false, false), 0.4) === 0 && cuantoSeHunde(h(true, false, false), 0.4) === 0.4 && cuantoSeHunde(h(false, true, false), 0.4) === 0.4 && cuantoSeHunde(h(true, false, true), 0.4) === 1 && HUNDIDA_DEL_PIE.apretada > HUNDIDA_DEL_PIE.encima && HUNDIDA_DEL_PIE.encima > 0, '  se hunde un poco con el mouse encima o el foco del teclado, y más apretada (el botón, Enter o Espacio)')
afirmar(/a\.cuerpo\.position\.z = -a\.hundido/.test(escena) && !/cuerpo\.rotation|cuerpo\.quaternion/.test(escena), '  en su eje (la profundidad), sin girar: la placa entera; en el formulario, la tecla')
const bloque = sinComentarios(leer('_componentes/volumen/BloqueSolido.tsx'))
const sonido = sinComentarios(leer('_chrome/sonido/ControlDelSonido.tsx'))
afirmar(/data-pieza="bloque-solido" data-forma=\{forma\} data-solido=\{solido \? '' : undefined\}/.test(bloque) && /\[data-pieza="bloque-solido"\]\[data-solido\]/.test(sonido) && /useHundido\(raiz, solido\)/.test(bloque), '  con el parlante prendido, el tic al pasar y el pestillo al hacer clic (los del sonido de los CTA); el campo no suena ni se hunde')

// Lo interactivo es el DOM de verdad; lo que dibuja el 3D, el DOM lo apaga recién con el 3D listo.
const form = sinComentarios(leer('_secciones/cierre/FormularioDelPie.tsx'))
afirmar(/usePiezaDelPie\(placa, \{ id: 'formulario-del-pie', forma: 'formulario', activo: volumen \}\)/.test(form) && /data-seccion=\{enVolumen \? 'invertida' : undefined\}/.test(form) && /const enVolumen = volumen && listo/.test(form) && /<input/.test(form) && /<textarea/.test(form) && /<button type="submit"/.test(form), '  el formulario, una pieza: sus campos y su botón son los del DOM (se enfocan, se escriben, lo anuncia el lector), en la tinta clara sobre la placa con el 3D listo')
const listoAntes = (c: string): boolean => /solido && listo && 'text-transparent /.test(c) && /usePiezaDelPie\(raiz, \{ id, forma: 'placa', activo: forma === 'placa' \}\)/.test(c)
afirmar(listoAntes(bloque), '  cada enlace, una placa: el DOM se vuelve transparente recién con el 3D compilado (sin WebGL, el pie de siempre); el anillo del foco, no')
controlPositivo('el detector VE el DOM apagado antes de que el 3D esté', bloque.replace("solido && listo && 'text-transparent ", "solido && 'text-transparent "), listoAntes)
const deTexto = ['_secciones/cierre/Cierre.tsx', '_secciones/cierre/ColumnasDelPie.tsx', '_secciones/cierre/PiezasDeContacto.tsx'].map((r) => sinComentarios(leer(r))).join('\n')
afirmar((deTexto.match(/<TextoDelPie/g) ?? []).length === 4 && /<TextoDelPie className="max-escritorio:hidden">\s*<Logotipo \/>/.test(deTexto), '  en 3D también el logotipo, el titular, los rótulos de columna y la línea legal (`TextoDelPie`)')

// Abajo de 1025, el pie plano; el de antes, con su bandera. [PULIDO 3B] B1 · el montaje ya no se corta abajo de 1025 (el CTA
// del final va en todo ancho): el pie de volumen sigue sólo desde escritorio.
const modo = sinComentarios(leer('_lib/pie3d/registro.ts'))
const montaje = sinComentarios(leer('_lib/escena/PruebasDeLaEscena.tsx'))
afirmar(/return escritorio && delEntorno !== 'no' \? delEntorno : 'plano'/.test(modo) && /if \(entornoDeLaEscena\(\)\.titulos === 'no'\) return null/.test(montaje) && /const conElPie = entornoDeLaEscena\(\)\.pruebas\.pie !== 'antes'/.test(montaje) && /\{escritorio && conElPie && \(/.test(montaje), '  abajo de 1025, el pie plano de siempre (el módulo 3D ni se descarga)')
afirmar(PRUEBAS_APAGADAS.pie === 'no' && ENTORNO.pruebas.pie === 'no' && entornoPedido('producto,pie=antes').pruebas.pie === 'antes' && /if \(modo === 'antes'\) return <BloqueDeAntes/.test(bloque), '  `?pruebas=pie=antes`: el pie de antes de RONDA 2 (las teclas de CSS 3D), para comparar')
const cierre = sinComentarios(leer('_secciones/cierre/Cierre.tsx'))
afirmar(/const progreso = volumen \? null : deLaSeccion/.test(cierre) && /\{volumen && <RedesDelPie \/>\}/.test(cierre) && /\{volumen && <LineaLegal \/>\}/.test(cierre) && /\{!volumen && \(/.test(cierre), '  en 3D, las redes y la línea legal suben a la columna izquierda (más abajo que la base del logo quedarían bajo el piso) y el DOM no hace su llegada')

// Las sombras de contacto, en el piso vivo: más oscuras y nítidas cuanto más cerca flota la pieza.
const [ras, media, lejos] = [0, 1.5, 8].map(formaDeLaSombra)
afirmar(ras.alfa > media.alfa && media.alfa > lejos.alfa && lejos.alfa < 0.01 && ras.blanda < media.blanda, '  sombras de contacto: más oscuras y nítidas al ras, blandas y apagadas lejos del piso')
const piso = leer('_lib/escena/piso/bloques.ts')
afirmar(/Object\.assign\(shader\.uniforms, uniforms, SOMBRAS_DEL_PIE\)/.test(piso) && /\$\{SOMBRAS_DEL_PIE_GLSL\}/.test(piso) && /\$\{APLICAR_LAS_SOMBRAS_DEL_PIE_GLSL\}/.test(piso) && /if \( i >= uCuantasSombrasDelPie \) break;/.test(SOMBRAS_DEL_PIE_GLSL), '  las pinta el propio piso vivo (siguen sus olas); sin pie a la vista, el lazo sale enseguida')

// ═══════════════════════════════════════════════════════════════════════════
titulo('P3 · Pruebas chicas del pie — [NOCTURNO] A2: la llegada, borrada; la onda, en el producto')

const prueba = (v: string): string => entornoPedido(`producto,pie=${v}`).pruebas.pie
afirmar(prueba('llegada') === 'no' && prueba('onda') === 'no' && prueba('luz') === 'no' && prueba('antes') === 'antes' && ENTORNO.pruebas.pie === 'no', 'las banderas `pie=llegada` y `pie=onda` ya no existen (queda `pie=antes`); `pie=luz` se había descartado')
// La llegada: el módulo y su uso, fuera; el pie sólo aparece desde abajo, con el scroll.
const delPie = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const sinLlegada = (c: string): boolean => !/aplicarLaLlegada|alFinalDeLaPagina|cuantoLeFalta|conLlegada|SIN_ARMAR|s\.inicio/.test(c)
afirmar(!existsSync(`${V3}/_lib/escena/pie3d/llegada.ts`) && sinLlegada(delPie), '  la llegada de prueba se borró (piezas sembradas por la sala, con reloj, al llegar al final de la página) y no vuelve; [PASADA FINAL] C2 trae otra, por columnas y función del scroll (s47 · C2)')
controlPositivo('el detector VE la llegada si vuelve', `${delPie}\nif (conLlegada) aplicarLaLlegada(a.grupo, a.llegada, 1)`, sinLlegada)
// La onda: el mouse sobre una pieza pide la de los valores, hacia ella, siempre.
const registro = sinComentarios(leer('_lib/pie3d/registro.ts'))
const conOnda = (c: string): boolean => !/conOnda|pruebas\.pie === 'onda'/.test(c) && /h\.encima = true\s*const r = el\.getBoundingClientRect\(\)\s*pedirLaOnda\(/.test(c)
afirmar(conOnda(registro), '  la onda, en el producto: el mouse sobre una pieza hace ondear el piso vivo hacia ella (la onda de los valores de Por qué develOP)')
controlPositivo('el detector VE la onda si vuelve a tener bandera', registro.replace('      h.encima = true\n', "      h.encima = true\n      if (!conOnda) return\n"), conOnda)

cerrar('s44-pie')
