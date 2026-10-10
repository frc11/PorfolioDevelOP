/**
 * PULIDO 10 — el invariante: npm run test:s61-pulido-10
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   J1  · 1024 y «Portátil L»: el texto 3D en renglones, la banda portátil (el campo de visión y las medidas del logo en el
 *         DOM) y los solapes (el detector y los recibos del banco a 1024, 1280 y 1440).
 *   J8  · el pie nuevo: 25/50/25 con el recorrido en texto (el subrayado del sitio, en 3D y en el plano), Demos con su propio
 *         destino adentro de Trabajos, `?pie=columna2` (el encuadre corrido) y `?pie=menu-abajo`, y los recibos del pie.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-10.md`.
 */
import { existsSync, readFileSync } from 'node:fs'

import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { BANDA, enUnidadesDelLogo, factorDeLaBanda, fovConFactor } from '../escena/banda'
import { CAMERA_FOV } from '../escena/probeScene'
import { armarElTitulo } from '../escena/titulos3d/geometria'
import { solapesDe, type Silueta } from './solapes'
import datos400 from '../../_fuentes/chivo-400-pie.json'
import datos500 from '../../_fuentes/chivo-500-pie.json'
import datos600 from '../../_fuentes/chivo-600-pie.json'
import { SELECTOR_DE_LOS_VIAJES } from '../../_componentes/deslizamiento'
import { destinoDelViaje } from '../../_componentes/destinosDelViaje'
import { DESTINOS_DE_LA_RUTA } from '../../_secciones/cierre/contenido'
import { MARCA_COREOGRAFIA_DEL_HOME } from '../../_secciones/_contrato/marcaCoreografia'
import { SUBRAYADO_DEL_PIE } from '../escena/pie3d/armadas'
import { VOLUMEN_DEL_PIE, armarLaPieza, baseDeLaLetra, type FuentesDelPie } from '../escena/pie3d/geometria'
import { CORRIMIENTO_DE_LA_COLUMNA_2, disposicionDelPie } from '../pie3d/disposicion'
import type { LetraDelPie } from '../pie3d/medida'
import { NodoFalso, conDomFalso } from './s27-dom-falso'
import { valorDeToken } from './s10-css'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('J1 · 1024 y «Portátil L»: el texto 3D en renglones, la banda portátil y los solapes')

// A · El título en volumen sigue los renglones del DOM: con el texto partido, cada letra baja a su renglón (antes, todas en
// una línea de base: «VINEGOOO»). Sin renglones, igual que siempre.
const fuenteDelHero = new Font(JSON.parse(readFileSync(`${V3}/_fuentes/archivo-700-titulos.json`, 'utf8')) as FontData)
const REGISTRO_1 = 'TU NEGOCIO VENDIENDO'
const posiciones = [...'TUNEGOCIOVENDIENDO'].map((_, k) => (k < 8 ? k * 0.55 : (k - 8) * 0.55))
const bajadas = [...'TUNEGOCIOVENDIENDO'].map((_, k) => (k < 8 ? 0 : 1.1))
const altoDe = (t: { geometria: THREE.BufferGeometry }): number => {
  t.geometria.computeBoundingBox()
  const b = t.geometria.boundingBox ?? new THREE.Box3()
  return b.max.y - b.min.y
}
const enRenglones = (armar: (b: readonly number[] | null) => { geometria: THREE.BufferGeometry }): boolean => {
  const partido = altoDe(armar(bajadas))
  const deUno = altoDe(armar(null))
  return partido > deUno + 0.9 && Math.abs(altoDe(armar(bajadas.map(() => 0))) - deUno) < 1e-6
}
afirmar(enRenglones((b) => armarElTitulo(fuenteDelHero, REGISTRO_1, posiciones, 'letras', [], undefined, b)), 'A · con el texto partido en dos renglones, el título 3D tiene dos (baja cada letra al suyo); sin renglones, el de siempre')
controlPositivo('A · el detector VE el título de antes (todo en una línea de base)', (b: readonly number[] | null) => armarElTitulo(fuenteDelHero, REGISTRO_1, posiciones, 'letras', [], undefined, b === null ? null : null), enRenglones)
const colocacion = leer('_lib/escena/titulos3d/colocacion.ts')
const armado = leer('_lib/escena/titulos3d/armado.ts')
afirmar(/const linea = el\.offsetHeight \/ Math\.max\(1, renglones\)/.test(colocacion) && /if \(arribas\.length === 0 \|\| arriba > arribas\[arribas\.length - 1\] \+ 0\.5\) arribas\.push\(arriba\)/.test(colocacion) && /const bajadas = dom === null \|\| renglones <= 1 \? null : dom\.renglon\.map\(\(r\) => r \* dom\.paso\)/.test(armado), '  la línea de base es la del primer renglón y el renglón de cada letra sale del DOM (más de medio cuerpo más abajo: otro renglón)')
const hero = leer('_secciones/hero/geometria.ts')
const cta = leer('_secciones/por-que-develop/CtaTransformado.tsx') + leer('_secciones/por-que-develop/PorQueDevelop.tsx')
const quienes = leer('_secciones/quienes-somos/geometria.ts')
const sinPartir = (h: string, c: string, q: string): boolean =>
  h.includes('escritorio:text-[length:min(var(--text-fluido-display),calc(100cqw/8.4))] escritorio:whitespace-nowrap') && leer('_secciones/hero/Hero.tsx').includes("className={cn('@container flex flex-col items-start', MEZCLA_SOBRE_LA_ESCENA)}") &&
  c.includes("className={cn(claseDelTexto, 'escritorio:whitespace-nowrap')}") && c.includes('calc((100vw-2*var(--pad-lateral-compacto))/15.4)') &&
  q.includes("'--titular-tamano-escritorio': 'min(38px, calc((50vw - 118px) / 14))'")
afirmar(sinPartir(hero, cta, quienes), '  donde el diseño es UN renglón (el registro 1 del hero, la frase del CTA) el DOM no se parte desde 1024 y la letra no pasa de su caja; el titular de Quiénes somos, de su columna')
controlPositivo('  el detector VE el registro 1 que se parte (el fluido sin tope)', hero.replace('escritorio:text-[length:min(var(--text-fluido-display),calc(100cqw/8.4))] escritorio:whitespace-nowrap', 'escritorio:text-fluido-display'), (h: string) => sinPartir(h, cta, quienes))

// A3 · Quiénes somos desde 1024: el ≠ pegado al margen (como en la tablet angosta; centrado caía sobre el arco del logo) y
// la fila del ≠ es la que crece: el titular arriba, el cuerpo abajo y el logo entre los dos (con el hueco parejo no entraba).
// Los bordes, 13 y 12 svh: los del banco a 1440 × 900 en el reposo del viaje (el titular despejado de la barra y del logo, el
// cuerpo entero debajo del logo).
const CORTE = Number(valorDeToken('--breakpoint-escritorio').replace('px', ''))
const quienesEnEscritorio = (banda: string, geometria: string, seccion: string): boolean =>
  banda.includes(`@media (width >= 426px) and (width < 769px), (width >= ${String(CORTE)}px) {`) &&
  geometria.includes("repartoDeLaAgencia: 'escritorio:content-stretch escritorio:grid-rows-[0_auto_1fr_auto] escritorio:pt-[var(--agencia-arriba)] escritorio:pb-[var(--agencia-abajo)]'") &&
  geometria.includes("agencia: { '--agencia-arriba': '13svh', '--agencia-abajo': '12svh' } as React.CSSProperties,") &&
  geometria.includes("signo: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-3 escritorio:self-center'") &&
  seccion.includes('className={cn(CLASES_DEL_REPARTO, GEOMETRIA.repartoDeLaAgencia)} style={GEOMETRIA.estilos.agencia}')
const BANDA_CSS = leer('_estilos/banda.css')
const SECCION_QUIENES = leer('_secciones/quienes-somos/QuienesSomos.tsx')
afirmar(quienesEnEscritorio(BANDA_CSS, quienes, SECCION_QUIENES), 'A3 · Quiénes somos desde 1024: el ≠ al margen (el corte, el de `--breakpoint-escritorio`) y su fila la que crece, con el titular arriba y el cuerpo abajo')
controlPositivo('A3 · el detector VE la primera pantalla de antes (el reparto parejo)', SECCION_QUIENES.replace('cn(CLASES_DEL_REPARTO, GEOMETRIA.repartoDeLaAgencia)', 'CLASES_DEL_REPARTO'), (q: string) => quienesEnEscritorio(BANDA_CSS, quienes, q))
controlPositivo('A3 · el detector VE el ≠ centrado desde 1024 (la regla sólo en la tablet angosta)', BANDA_CSS.replace(`, (width >= ${String(CORTE)}px) {`, ' {'), (b: string) => quienesEnEscritorio(b, quienes, SECCION_QUIENES))

// B · La banda portátil: desde 1024, el campo de visión se abre lo justo para que el logo ocupe del ancho lo de 1440 × 900
// (el mayor entre 1,6/aspecto y 1440/ancho, con tope); lo aprobado (1440 × 900, 1920 × 1080) y abajo de 1024, igual.
const bandaBien = (f: typeof factorDeLaBanda): boolean =>
  f(1440, 900) === 1 && f(1920, 1080) === 1 && f(768, 1024) === 1 && f(390, 844) === 1 &&
  Math.abs(f(1024, 824) - 1440 / 1024) < 1e-9 && Math.abs(f(1280, 800) - 1.125) < 1e-9 && f(1024, 1366) === BANDA.tope && f(1440, 824) === 1
afirmar(bandaBien(factorDeLaBanda), 'B · la banda: 1 en lo aprobado y abajo de 1024; 1,41 a 1024 × 824, 1,13 a 1280 × 800, el tope en un retrato de 1024', `tope ${String(BANDA.tope)}`)
controlPositivo('B · el detector VE la banda sin el término del ancho (a 1280 × 800 no achicaba nada)', ((w: number, h: number) => (w >= 1024 ? Math.min(BANDA.tope, Math.max(1, (1.6 * h) / w)) : 1)) as typeof factorDeLaBanda, bandaBien)
// El logo se ve más chico por el mismo factor: la tangente del medio campo, por el factor.
const fovBien = [1, 1.2, 1.45].every((k) => Math.abs(Math.tan((fovConFactor(CAMERA_FOV, k) * Math.PI) / 360) / Math.tan((CAMERA_FOV * Math.PI) / 360) - k) < 1e-9)
// Las medidas del logo en el DOM (CSS): q dividido el factor del aspecto, evaluando la expresión en varios cuadros.
const evaluarCss = (expr: string, w: number, h: number): number => {
  const js = expr.replace(/([\d.]+)svh/g, (_, v: string) => `(${v}*${String(h)}/100)`).replace(/([\d.]+)vw/g, (_, v: string) => `(${v}*${String(w)}/100)`).replace(/max\(/g, 'Math.max(').replace(/min\(/g, 'Math.min(')
  return Function(`return ${js}`)() as number
}
const unidadesBien = (f: typeof enUnidadesDelLogo): boolean => [[1024, 824], [1280, 800], [1440, 900], [1024, 1366], [2560, 1080]].every(([w, h]) => Math.abs(evaluarCss(f(30), w, h) - (30 * h) / 100 / Math.min(BANDA.tope, Math.max(1, (BANDA.aspecto * h) / w))) < 0.01)
afirmar(fovBien && unidadesBien(enUnidadesDelLogo), '  el campo de visión achica por el factor, y las medidas del logo en el DOM (CSS) son su medida dividida el factor del aspecto')
controlPositivo('  el detector VE una medida sin el tope (un retrato la achicaba de más)', ((q: number) => `min(${String(q)}svh,${String(q / BANDA.aspecto)}vw)`) as typeof enUnidadesDelLogo, unidadesBien)
const rig = leer('_lib/escena/OrbitRig.tsx')
const cableadoDeLaBanda = (r: string, c: string): boolean => r.includes('BANDA_EN_VIVO.factor = factorDeLaBanda(state.size.width, state.size.height)') && r.includes('const fov = fovConFactor(CAMERA_FOV, BANDA_EN_VIVO.factor)') && c.includes('c.fov = fovConFactor(CAMERA_FOV, BANDA_EN_VIVO.factor)') && leer('_lib/escena/cameraFraming.ts').includes('const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : CAMERA_FOV')
afirmar(cableadoDeLaBanda(rig, colocacion), '  la cámara viva, la de la lectura de los títulos (y los planos del CTA) y el encuadre usan el mismo campo de visión')
controlPositivo('  el detector VE la cámara de los títulos con el campo de siempre', [rig, colocacion.replace('c.fov = fovConFactor(CAMERA_FOV, BANDA_EN_VIVO.factor)', 'c.fov = CAMERA_FOV')], ([r, c]: string[]) => cableadoDeLaBanda(r, c))

// C · Los solapes: el detector (la misma función que el banco) y los recibos del banco a 1024, 1280 y 1440: en el reposo de
// cada sección, ninguna caja de texto se cruza con otra ni con la silueta del logo.
const SILUETA: Silueta = { celda: 8, cols: 10, filas: 10, ocupadas: [55] }
const detecta = (f: typeof solapesDe): boolean => {
  const cruzadas = f([{ id: 'a', grupo: 'a', x: 0, y: 0, ancho: 40, alto: 20 }, { id: 'b', grupo: 'b', x: 30, y: 10, ancho: 40, alto: 20 }], null)
  const mismoBloque = f([{ id: 'a', grupo: 'g', x: 0, y: 0, ancho: 40, alto: 20 }, { id: 'b', grupo: 'g', x: 30, y: 10, ancho: 40, alto: 20 }], null)
  const sobreElLogo = f([{ id: 'c', grupo: 'c', x: 36, y: 36, ancho: 16, alto: 16 }], SILUETA)
  const alLado = f([{ id: 'd', grupo: 'd', x: 0, y: 0, ancho: 30, alto: 30 }], SILUETA)
  return cruzadas.length === 1 && cruzadas[0].tipo === 'texto' && mismoBloque.length === 0 && sobreElLogo.length === 1 && sobreElLogo[0].tipo === 'logo' && alLado.length === 0
}
afirmar(detecta(solapesDe), 'C · el detector ve dos bloques que se cruzan y una caja sobre el logo; no cuenta los renglones de un mismo bloque ni lo que queda al lado')
controlPositivo('C · el detector VE un detector ciego (que no mira el logo)', ((c: Parameters<typeof solapesDe>[0]) => solapesDe(c, null)) as typeof solapesDe, detecta)
const RECIBOS = 'docs/rediseno/entregas/pulido-10'
const recibos = ['1024x824', '1280x800', '1440x900'].map((t) => ({ t, ruta: `${RECIBOS}/solapes-${t}.json` }))
const recibosBien = recibos.every(({ ruta }) => {
  if (!existsSync(ruta)) return false
  const r = JSON.parse(readFileSync(ruta, 'utf8')) as { momentos: Record<string, { solapes: unknown[] }> }
  return ['hero', 'quienes', 'portfolio', 'razones', 'cta', 'pie'].every((m) => r.momentos[m] !== undefined && r.momentos[m].solapes.length === 0)
})
afirmar(recibosBien, '  los recibos del banco a 1024 × 824, 1280 × 800 y 1440 × 900: en el reposo del hero, Quiénes somos, Portfolio, Seis razones, el CTA y el pie, cero solapes', recibos.map(({ t, ruta }) => `${t}: ${existsSync(ruta) ? 'medido' : 'falta'}`).join(' · '))

// ═══════════════════════════════════════════════════════════════════════════
titulo('J8 · El pie nuevo: 25/50/25, el recorrido en texto con el subrayado del sitio, Demos y las dos disposiciones')

// A · El enlace de texto en volumen: sus letras extruidas (como el texto suelto) y, aparte —lo que se escala—, su subrayado:
// una barra de la primera letra a donde termina la última, debajo de la línea de base, con el grosor del subrayado del sitio
// y la profundidad de las letras, que crece desde su izquierda (`origen`).
const FUENTES_DEL_PIE: FuentesDelPie = { 400: new Font(datos400 as FontData), 500: new Font(datos500 as FontData), 600: new Font(datos600 as FontData) }
const CHIVO_600 = FUENTES_DEL_PIE[600].data
const avanceDe = (ch: string, cuerpo: number): number => ((CHIVO_600.glyphs[ch]?.ha ?? 0) / CHIVO_600.resolution) * cuerpo
const letrasDelEnlace = (texto: string, desde: number, cuerpo: number): LetraDelPie[] => {
  let x = desde
  return [...texto].map((ch) => {
    const l: LetraDelPie = { ch, x, arriba: 2, alto: cuerpo * 1.5, cuerpo, peso: 600, enLaTecla: false }
    x += avanceDe(ch, cuerpo)
    return l
  })
}
const PORTFOLIO_EN_EL_PIE = letrasDelEnlace('Portfolio', 3, 15)
const enlaceBien = (armar: typeof armarLaPieza): boolean => {
  const p = armar('enlace', { caja: { x: 0, y: 0, ancho: 90, alto: 30, radio: 0 }, letras: PORTFOLIO_EN_EL_PIE, trazos: [], pozos: [], tecla: null }, FUENTES_DEL_PIE)
  if (p.fija === null || p.hundible === null) return false
  p.hundible.computeBoundingBox()
  const b = p.hundible.boundingBox ?? new THREE.Box3()
  const [primera, ultima] = [PORTFOLIO_EN_EL_PIE[0], PORTFOLIO_EN_EL_PIE[PORTFOLIO_EN_EL_PIE.length - 1]]
  const ancho = ultima.x + avanceDe(ultima.ch, ultima.cuerpo) - primera.x
  const arriba = -(baseDeLaLetra(primera, CHIVO_600) + VOLUMEN_DEL_PIE.subrayado.bajo * primera.cuerpo)
  const cerca = (a: number, c: number): boolean => Math.abs(a - c) < 1e-4
  return p.origen === primera.x && cerca(b.min.x, 0) && cerca(b.max.x, ancho) && cerca(b.max.y, arriba) && cerca(b.max.y - b.min.y, VOLUMEN_DEL_PIE.subrayado.alto) && cerca(b.max.z, 0) && cerca(b.min.z, -VOLUMEN_DEL_PIE.texto.profundidad * primera.cuerpo)
}
afirmar(enlaceBien(armarLaPieza), 'A · el enlace de texto en volumen: las letras y, aparte, su subrayado (de la primera a la última letra, debajo de la base, tres filetes de grosor, la profundidad de las letras) que crece desde la primera letra')
controlPositivo('A · el detector VE un enlace sin subrayado (armado como el texto suelto)', ((forma, m, f) => armarLaPieza(forma === 'enlace' ? 'texto' : forma, m, f)) as typeof armarLaPieza, enlaceBien)

// B · El subrayado es el del sitio (el del CTA: `--duracion-muy-lenta` y `--ease-principal`), en 3D y en el pie plano; crece con
// el mouse encima o el foco (el mismo `HUNDIDOS` de las placas) y, con movimiento reducido, de golpe.
const ARMADAS_DEL_PIE = leer('_lib/escena/pie3d/armadas.ts')
const ENLACE_DE_TEXTO = leer('_componentes/volumen/EnlaceDeTexto.tsx')
const subrayadoBien = (sub: { readonly s: number; readonly curva: readonly number[] }, armadas: string, enlace: string): boolean =>
  sub.s * 1000 === parseFloat(valorDeToken('--duracion-muy-lenta')) &&
  `cubic-bezier(${sub.curva.join(', ')})` === valorDeToken('--ease-principal').replace(/\s+/g, ' ') &&
  armadas.includes("if (a.pieza.forma === 'enlace') dibujarElSubrayado(a, s.quieto, dt)") &&
  armadas.includes('const pide = h !== undefined && (h.encima || h.foco) ? 1 : 0') &&
  armadas.includes('a.hundido = quieto ? pide : pide > a.hundido ? Math.min(pide, a.hundido + paso) : Math.max(pide, a.hundido - paso)') &&
  armadas.includes('a.cuerpo.scale.x = Math.max(1e-4, dibujado)') &&
  enlace.includes("usePiezaDelPie(raiz, { id, forma: 'enlace', activo: volumen })") && enlace.includes('useHundido(raiz, volumen)') &&
  enlace.includes('duration-[var(--duracion-muy-lenta)] ease-[var(--ease-principal)]')
afirmar(subrayadoBien(SUBRAYADO_DEL_PIE, ARMADAS_DEL_PIE, ENLACE_DE_TEXTO), 'B · el subrayado del sitio: el tiempo y la curva del CTA en 3D y en el pie plano; con el mouse encima o el foco, y de golpe con movimiento reducido', `${String(SUBRAYADO_DEL_PIE.s)} s`)
controlPositivo('B · el detector VE un subrayado con otro tiempo', { ...SUBRAYADO_DEL_PIE, s: 0.6 }, (sub: { readonly s: number; readonly curva: readonly number[] }) => subrayadoBien(sub, ARMADAS_DEL_PIE, ENLACE_DE_TEXTO))

// C · El recorrido: siete destinos (con Portfolio y Demos), en dos columnas de cuatro y tres, como enlaces de texto, y viajan
// como los del menú.
const RECORRIDO_DEL_PIE = leer('_secciones/cierre/RecorridoDelPie.tsx')
const recorridoBien = (r: string, selector: string): boolean =>
  DESTINOS_DE_LA_RUTA.length === 7 &&
  r.includes("'grid grid-flow-col grid-cols-[auto_auto] grid-rows-4 justify-start") &&
  /<ul\s+data-pieza="destinos-del-pie"[\s\S]{0,900}<EnlaceDeTexto href=\{destino\.ancla\}/.test(r) &&
  selector.split(', ').includes('[data-pieza="destinos-del-pie"] a[data-pieza="pie-enlace"]')
afirmar(recorridoBien(RECORRIDO_DEL_PIE, SELECTOR_DE_LOS_VIAJES), 'C · el recorrido: siete destinos en dos columnas (cuatro y tres), enlaces de texto que viajan como los del menú')
controlPositivo('C · el detector VE los enlaces de texto afuera del viaje', SELECTOR_DE_LOS_VIAJES.replace(', [data-pieza="destinos-del-pie"] a[data-pieza="pie-enlace"]', ''), (sel: string) => recorridoBien(RECORRIDO_DEL_PIE, sel))

// D · 25/50/25 con el pie de volumen (un cuarto por columna; el formulario con su techo fijo) y las dos disposiciones de la
// consulta (`?pie=columna2`, `?pie=menu-abajo`; cualquier otra cosa, el producto).
const CIERRE = leer('_secciones/cierre/Cierre.tsx')
const ARRIBA_FIJO = leer('_secciones/cierre/useArribaFijo.ts')
const cierreBien = (c: string, a: string): boolean =>
  c.includes("const anchoDeLaColumna = volumen ? 'escritorio:w-1/4' : 'escritorio:w-[calc(50%-var(--hueco-del-pie))]'") &&
  c.includes("{volumen && disposicion === 'producto' && <RecorridoDelPie") && c.includes("{volumen && disposicion === 'columna2' && (") &&
  c.includes("{volumen && disposicion === 'menu-abajo' && (") && c.includes('<ColumnasDelPie progreso={p} sinRecorrido={volumen} />') &&
  c.includes('useArribaFijo(columnaDelFormulario, volumen)') &&
  a.includes('el.style.top = `${String(Math.round((padre.clientHeight - el.offsetHeight) / 2))}px`') && a.includes("el.style.translate = 'none'")
const disposicionBien = (f: typeof disposicionDelPie): boolean => f('columna2') === 'columna2' && f('menu-abajo') === 'menu-abajo' && f(null) === 'producto' && f('antes') === 'producto'
afirmar(cierreBien(CIERRE, ARRIBA_FIJO) && disposicionBien(disposicionDelPie), 'D · 25/50/25 con el pie de volumen (el formulario con su techo fijo: la tarjeta de gracias no baja) y las dos disposiciones de `?pie=`')
controlPositivo('D · el detector VE el formulario centrado con la transformada (se recentra)', ARRIBA_FIJO.replace("el.style.translate = 'none'", "el.style.translate = ''"), (a: string) => cierreBien(CIERRE, a))
controlPositivo('D · el detector VE una disposición que no se lee', ((v: string | null | undefined) => (v === 'columna2' ? 'columna2' : 'producto')) as typeof disposicionDelPie, disposicionBien)

// E · `?pie=columna2`: la cámara corre el encuadre (`setViewOffset`) del centro al de la segunda de cuatro columnas, y la cámara
// sin el mouse copia la proyección (el pie de volumen se coloca con ella: sigue sobre su DOM).
const RIG = leer('_lib/escena/OrbitRig.tsx')
const SIN_EL_MOUSE = leer('_lib/escena/sinElMouse.ts')
const corrimientoBien = (k: number, rig: string): boolean =>
  Math.abs(0.5 - k - 1.5 / 4) < 1e-9 &&
  rig.includes("disposicionDeLaPagina() === 'columna2' ? Math.round(CORRIMIENTO_DE_LA_COLUMNA_2 * llegadaDelCorrimiento(PROGRESO_DEL_PIE.valor?.get() ?? 0) * anchoDelCuadro) : 0") &&
  rig.includes('state.camera.setViewOffset(anchoDelCuadro, altoDelCuadro, corrimiento, 0, anchoDelCuadro, altoDelCuadro)') &&
  SIN_EL_MOUSE.includes('c.projectionMatrix.copy(viva.projectionMatrix)')
afirmar(corrimientoBien(CORRIMIENTO_DE_LA_COLUMNA_2, RIG), 'E · `?pie=columna2`: el encuadre corrido un octavo del ancho (el logo, en el centro de la segunda columna) a medida que el pie llega; la cámara sin el mouse lo copia')
controlPositivo('E · el detector VE un corrimiento de un cuarto (el logo en el borde de la columna)', 0.25, (k: number) => corrimientoBien(k, RIG))

// F · Demos viaja a SU destino adentro de Trabajos (el final del pin, que abarca la sección: las demos ya llegaron y la de abajo
// no asoma); sin coreografía, a su ancla. El hijo pegado que lo contiene mide una pantalla: no es el pin (el banco lo midió).
const BLOQUE_ANIMADO = `[data-arbol="${MARCA_COREOGRAFIA_DEL_HOME}"]`
conDomFalso(900, 72, () => {
  const trabajos = new NodoFalso({ tope: 5073, alto: 7997 }, { 'data-panel': 'trabajos' })
  const pegado = new NodoFalso({ tope: 5073, alto: 900 })
  const demos = Object.assign(new NodoFalso({ tope: 5250, alto: 300 }).cercano('[data-panel]', trabajos).cercano(BLOQUE_ANIMADO, pegado), { id: 'demos' })
  const esperado = Math.floor(5073 + 7997 - 900 - 2)
  afirmarIgual(destinoDelViaje(trabajos as unknown as HTMLElement, demos as unknown as HTMLElement), esperado, 'F · Demos: el final del pin de Trabajos (la sección menos una pantalla), dos píxeles antes, con el viaje de siempre')
  const sinPin = Object.assign(new NodoFalso({ tope: 9000, alto: 300 }).cercano('[data-panel]', trabajos), { id: 'demos' })
  afirmarIgual(destinoDelViaje(trabajos as unknown as HTMLElement, sinPin as unknown as HTMLElement), 9000 - 72, '  sin coreografía (la rama quieta), su ancla debajo de la barra')
  controlPositivo('F · el detector VE Demos viajando al nudo de Trabajos (sin su ancla)', destinoDelViaje(trabajos as unknown as HTMLElement), (d: number) => d === esperado)
})

// G · Los recibos del banco (`pie-<cuadro>.json`): en las tres disposiciones, a 1024, 1280, 1440 y 1920, los siete enlaces en
// un renglón, nada afuera del cuadro y el pie de volumen listo.
const RECIBOS_DEL_PIE = ['1024x824', '1280x800', '1440x900', '1920x1080'].map((t) => ({ t, ruta: `${RECIBOS}/pie-${t}.json` }))
type ReciboDelPie = Record<string, { enlaces: { renglones: number }[]; fuera: unknown[]; listo: boolean | null }>
const pieBien = (r: ReciboDelPie): boolean => ['producto', 'columna2', 'menu-abajo'].every((d) => r[d] !== undefined && r[d].enlaces.length === 7 && r[d].enlaces.every((e) => e.renglones === 1) && r[d].fuera.length === 0 && r[d].listo === true)
afirmar(RECIBOS_DEL_PIE.every(({ ruta }) => existsSync(ruta) && pieBien(JSON.parse(readFileSync(ruta, 'utf8')) as ReciboDelPie)), 'G · los recibos del pie a 1024, 1280, 1440 y 1920: en las tres disposiciones, los siete enlaces en un renglón y nada afuera del cuadro', RECIBOS_DEL_PIE.map(({ t, ruta }) => `${t}: ${existsSync(ruta) ? 'medido' : 'falta'}`).join(' · '))
controlPositivo('G · el detector VE un enlace partido en dos renglones', { producto: { enlaces: [{ renglones: 2 }], fuera: [], listo: true } } as ReciboDelPie, pieBien)

cerrar('s61-pulido-10')
