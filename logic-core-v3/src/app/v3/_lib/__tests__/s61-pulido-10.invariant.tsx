/**
 * PULIDO 10 — el invariante: npm run test:s61-pulido-10
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   J1  · 1024 y «Portátil L»: el texto 3D en renglones, la banda portátil (el campo de visión y las medidas del logo en el
 *         DOM) y los solapes (el detector y los recibos del banco a 1024, 1280 y 1440).
 *   J2  · abrir Contacto sin el cuadrado negro (la cara de atrás de la placa, del papel).
 *   J3  · la carga de develOP: el trazo (o el giro, `?carga=giro`), los textos, la espera mínima, el botón del pie y el panel.
 *   J4  · las transformaciones de gracias: el pie con el volteo y el panel con el hundido, el título en Archivo (minúsculas), el
 *         foco que no desaparece y la placa en su lugar.
 *   J5  · el error: la placa rechaza (el resorte), Reintentar gira, el error sale de atrás del botón, el pulso; los dos formularios.
 *   J6  · el autocompletado del pie con la piel del formulario.
 *   J8  · el pie nuevo: 25/50/25 con el recorrido en texto (el subrayado del sitio, en 3D y en el plano), Demos con su propio
 *         destino adentro de Trabajos, `?pie=columna2` (el encuadre corrido) y `?pie=menu-abajo`, y los recibos del pie.
 *   J10 · el polvo con un solo toque: una vez despertado, termina de subir y pasa un tiempo mínimo en el aire antes de volver a
 *         evaluar si se posa (la histéresis).
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-10.md`.
 */
import { existsSync, readFileSync } from 'node:fs'

import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { BANDA, enUnidadesDelLogo, factorDeLaBanda, fovConFactor } from '../escena/banda'
import { CAMERA_FOV } from '../escena/probeScene'
import { armarElTitulo } from '../escena/titulos3d/geometria'
import { solapesDe, type Silueta } from './solapes'
import { varianteDeGracias, GRACIAS } from '../formularios/gracias'
import { REINTENTAR, cuadrosDelRechazo, hundidoDelRechazo } from '../formularios/rechazo'
import { FUENTES_DEL_CTA } from '../escena/ctaDelFinal/fuentesDelCta'
import { poseDeLaTransformacion } from '../escena/pie3d/transformacionDelPie'
import { CARGA, varianteDeLaCarga } from '../../_componentes/carga/Carga'
import { TEXTOS_DE_ENVIO } from '../formularios/enviar'
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
import { HISTERESIS, POSARSE, quietoConHisteresis, tomarElFrente } from '../escena/polvo/posarse'
import { DT, N, QUIETO, SUSPENDIDO, simular, type Cableado, type Tramo } from './modeloDelPolvo'
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
titulo('J2 · Abrir Contacto sin el cuadrado negro')

// La placa del panel llega desde el fondo con cinco caras detrás del frente (la hoja). La de atrás era de tinta: nunca se ve —el
// frente la tapa—, salvo en los cuadros en que la hoja (una capa grande, con todo el formulario) todavía no se rasterizó mientras
// el fondo se desenfoca: ahí se veía un cuadrado negro del tamaño de la placa. Ahora es del papel de la hoja. Hipótesis sin la
// ráfaga del banco (sin memoria para abrirlo): ver el log.
const PLACA_J2 = leer('_chrome/contacto/PlacaDelContacto.tsx')
const atrasDelPapel = (p: string): boolean => p.includes("{ cara: 'atras', className: 'inset-0 rounded-[var(--radius-medio)] bg-fondo', style: { transform: `translateZ(-${String(E)}px)` } },")
afirmar(atrasDelPapel(PLACA_J2), 'J2 · la cara de atrás de la placa de Contacto es del papel de la hoja: si la hoja tarda en pintarse, no asoma un cuadrado negro')
controlPositivo('J2 · el detector VE la cara de atrás de tinta', PLACA_J2.replace("rounded-[var(--radius-medio)] bg-fondo', style: { transform: `translateZ", "rounded-[var(--radius-medio)] bg-tinta', style: { transform: `translateZ"), atrasDelPapel)

// ═══════════════════════════════════════════════════════════════════════════
titulo('J3 · La carga de develOP: el trazo (o el giro), sus textos, la espera mínima y los dos lugares donde va')

// A · La API: tres tamaños, la tinta según el fondo (o la de quien la contiene, `--carga-tinta`), los textos en un estado vivo y
// la espera mínima de 1,4 s; `?carga=giro`, el giro (cualquier otra cosa, el trazo). Se pinta con `fill`/`stroke` y el texto con
// `-webkit-text-fill-color` (sobre la tecla del pie de volumen el `color` es transparente), y sin WebGL: ningún lienzo aparte.
const CARGA_TSX = leer('_componentes/carga/Carga.tsx')
const apiBien = (minimo: number, variante: typeof varianteDeLaCarga, c: string): boolean =>
  minimo === 1400 && variante('giro') === 'giro' && variante(null) === 'trazo' && variante('anillo') === 'trazo' &&
  Object.keys(CARGA.lados).join() === 'chico,medio,grande' && c.includes('role="status"') && c.includes('data-sin-volumen=""') &&
  c.includes("const color = `var(--carga-tinta, ${tinta === 'filo' ? 'var(--color-fondo)' : 'var(--color-tinta)'})`") &&
  c.includes('style={{ WebkitTextFillColor: color }}') && c.includes('const [resultado] = await Promise.all([promesa, new Promise((listo) => window.setTimeout(listo, ms))])') &&
  !/<canvas|<Canvas|@react-three|from 'three'/.test(c)
afirmar(apiBien(CARGA.minimoMs, varianteDeLaCarga, CARGA_TSX), 'A · la carga: tres tamaños, la tinta del fondo (o la de quien la contiene), el estado vivo, la espera mínima de 1,4 s y `?carga=giro`; pintada con fill y text-fill (se ve sobre la tecla), sin WebGL')
controlPositivo('A · el detector VE una carga con el texto pintado por `color` (sobre la tecla quedaría transparente)', CARGA_TSX.replace(' style={{ WebkitTextFillColor: color }}', ''), (c: string) => apiBien(CARGA.minimoMs, varianteDeLaCarga, c))
controlPositivo('  y una variante que no se lee', ((v: string | null | undefined) => (v === 'trazo' ? 'trazo' : 'trazo')) as typeof varianteDeLaCarga, (f: typeof varianteDeLaCarga) => apiBien(CARGA.minimoMs, f, CARGA_TSX))

// B · El pie de volumen no la mide (`data-sin-volumen`): ni sus letras ni su trazo van a la placa (se queda viva en el DOM, sobre
// la tecla) y su estado al cambiar no rearma la geometría (la firma no cambia).
const MEDIDA = leer('_lib/pie3d/medida.ts')
const sinVolumenBien = (m: string): boolean => m.includes("padre.closest('[data-sin-volumen]') !== null) return false") && m.includes("svg.closest('[data-sin-volumen]') !== null) continue")
afirmar(sinVolumenBien(MEDIDA), 'B · lo que lleva `data-sin-volumen` (la carga) no se extruye: ni sus letras ni su trazo')
controlPositivo('B · el detector VE la carga medida como un ícono de la tecla', MEDIDA.replace(" || svg.closest('[data-sin-volumen]') !== null", ''), sinVolumenBien)

// C · Los dos lugares: en el botón del pie (la carga chica encima del rótulo, que se queda invisible guardando el ancho; clara
// sobre la tecla y sobre el botón lleno del angosto) y en el panel de Contacto (la grande, en lugar del anillo); los dos con la
// espera mínima (el panel, sólo si de verdad viaja: un formulario inválido responde al toque). Los textos: «Enviando…» y «Casi…».
const PIE_FORM = leer('_secciones/cierre/FormularioDelPie.tsx')
const PANEL = leer('_chrome/contacto/FormularioDeContacto.tsx')
const lugaresBien = (p: string, m: string): boolean =>
  TEXTOS_DE_ENVIO.join() === 'Enviando…,Casi…' &&
  p.includes('{enviando && <Carga tamano="chico" textos={TEXTOS_DE_ENVIO} enLinea className="absolute inset-0 justify-center" />}') &&
  p.includes('[--carga-tinta:var(--color-tinta)] max-escritorio:[--carga-tinta:var(--color-fondo)]') &&
  p.includes("<span aria-hidden={enviando || undefined} className={cn('grid justify-items-center perspective-midrange', enviando && 'invisible')}>") &&
  p.includes('const r = await conDuracionMinima(enviarAlServidor(') && !p.includes('Loader2') &&
  m.includes('<Carga tamano="grande" textos={TEXTOS_DE_ENVIO} etiqueta={ROTULO_ENVIANDO} />') &&
  m.includes('const r = valido ? await conDuracionMinima(enviarContacto(datos)) : await enviarContacto(datos)') && !m.includes('AnilloDeCarga')
afirmar(lugaresBien(PIE_FORM, PANEL), 'C · la carga en el botón del pie (chica, encima del rótulo invisible: nada se mueve) y en el panel de Contacto (grande, en lugar del anillo), con la espera mínima')
controlPositivo('C · el detector VE el panel esperando 1,4 s también con el formulario inválido', PANEL.replace('const r = valido ? await conDuracionMinima(enviarContacto(datos)) : await enviarContacto(datos)', 'const r = await conDuracionMinima(enviarContacto(datos))'), (m: string) => lugaresBien(PIE_FORM, m))

// D · Con movimiento reducido, el logo quieto (relleno, sin trazo ni giro) y el texto.
const reducidaBien = (c: string): boolean => /\{quieto \? \(\s*<path d=\{LOGO_PATH_D\} fill=\{color\} \/>/.test(c) && c.includes('animate={quieto ? undefined : { rotateY: 360 }}') && c.includes('Array.from({ length: quieto ? 1 : capas }')
afirmar(reducidaBien(CARGA_TSX), 'D · con movimiento reducido, el logo quieto (ni trazo ni giro) y el texto')
controlPositivo('D · el detector VE un giro que gira igual con movimiento reducido', CARGA_TSX.replace('animate={quieto ? undefined : { rotateY: 360 }}', 'animate={{ rotateY: 360 }}'), reducidaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('J4 · Las transformaciones de gracias: cada formulario la suya, el título en Archivo, el foco y la placa en su lugar')

// A · El pie con el volteo y el panel de Contacto con el hundido; `?gracias=` cambia los dos.
const PANEL_J4 = leer('_chrome/contacto/FormularioDeContacto.tsx')
const variantesBien = (f: typeof varianteDeGracias, panel: string): boolean =>
  f(null) === 'volteo' && f(null, 'hundido') === 'hundido' && f('volteo', 'hundido') === 'volteo' && f('hundido') === 'hundido' && f('otra', 'hundido') === 'hundido' &&
  panel.includes("const variante = useSyncExternalStore(sinSuscripcion, varianteDelPanel, () => 'hundido' as const)")
afirmar(variantesBien(varianteDeGracias, PANEL_J4), 'A · el pie con el volteo y el panel de Contacto con el hundido; `?gracias=` elige en los dos')
controlPositivo('A · el detector VE un panel que sigue con el volteo', ((v: string | null | undefined) => (v === 'hundido' ? 'hundido' : 'volteo')) as typeof varianteDeGracias, (f: typeof varianteDeGracias) => variantesBien(f, PANEL_J4))

// B · El título de la tarjeta en 3D: en Archivo con minúsculas, compuesto como la frase del CTA (los avances y el kerning de la
// fuente, desde donde el DOM empieza el renglón), no con las cajas del DOM (su cara de display no trae minúsculas).
const FUENTES_J4: FuentesDelPie = { 400: new Font(datos400 as FontData), 500: new Font(datos500 as FontData), 600: new Font(datos600 as FontData), archivo: FUENTES_DEL_CTA.frase }
const RENGLON = { texto: GRACIAS.titulo, x: 20, arriba: 20, alto: 40, cuerpo: 32, enLaTecla: false }
const conTitulo = { caja: { x: 0, y: 0, ancho: 300, alto: 140, radio: 12 }, letras: [], trazos: [], pozos: [], tecla: null, archivo: [RENGLON] }
const sinTitulo = { ...conTitulo, archivo: [] }
const vertices = (f: FuentesDelPie, m: typeof conTitulo): number => armarLaPieza('formulario', m, f).fija?.getAttribute('position').count ?? 0
const tituloBien = (f: FuentesDelPie): boolean =>
  [...GRACIAS.titulo].every((c) => c.trim() === '' || FUENTES_DEL_CTA.frase.fuente.data.glyphs[c] !== undefined) && vertices(f, conTitulo) > vertices(f, sinTitulo) &&
  leer('_lib/pie3d/medida.ts').includes('archivo: renglonesArchivoDe(el, r, deLaPlaca),') && leer('_lib/escena/pie3d/geometria.ts').includes('const { x } = avancesDe(f, r.texto, TRACKING_DEL_CTA.frase)') &&
  leer('_componentes/formularios/TarjetaDeGracias.tsx').includes("enVolumen ? 'text-transparent' : 'uppercase'")
afirmar(tituloBien(FUENTES_J4), 'B · el título de la tarjeta en 3D: Archivo en minúsculas (la fuente de la frase del CTA trae sus letras), compuesto con sus avances y su kerning; en el DOM plano, las mayúsculas aprobadas')
controlPositivo('B · el detector VE el título sin su Archivo (no se dibuja)', { ...FUENTES_J4, archivo: undefined }, tituloBien)

// C · El foco no desaparece en la transformación: el DOM se apaga sólo de vuelta al formulario, y la tarjeta muestra su anillo.
const ARMADAS_J4 = leer('_lib/escena/pie3d/armadas.ts')
const focoBien = (a: string, t: string): boolean => a.includes("if (estado !== 'gracias') p.elemento.style.opacity = '0'") && !t.includes('outline-none')
afirmar(focoBien(ARMADAS_J4, leer('_componentes/formularios/TarjetaDeGracias.tsx')), 'C · el foco no desaparece: hacia la tarjeta el DOM sigue (transparente) y la tarjeta muestra el anillo del foco')
controlPositivo('C · el detector VE el DOM apagado también hacia la tarjeta', ARMADAS_J4.replace("if (estado !== 'gracias') p.elemento.style.opacity = '0'", "p.elemento.style.opacity = '0'"), (a: string) => focoBien(a, leer('_componentes/formularios/TarjetaDeGracias.tsx')))

// D · La placa en su lugar (y la etiqueta «Contacto» pegada a su borde): con la columna de techo fijo (J8) la tarjeta empieza
// donde empezaba el formulario, y el hundido lleva la entrante con su borde de arriba quieto en todos los cuadros. Antes, la
// columna se recentraba (la tarjeta bajaba 63 px) y el borde se corría.
const bordeQuieto = (dy: number): boolean => {
  const caja = { ancho: 300, alto: 140 }
  const m = new THREE.Matrix4()
  return [0.42, 0.5, 0.6, 0.7, 0.85, 1].every((t) => {
    poseDeLaTransformacion('hundido', false, t, true, caja, { ancho: 300, alto: 360, dx: 0, dy }, 30, m)
    return Math.abs(new THREE.Vector3(0, 0, 0).applyMatrix4(m).y) < 1e-6
  })
}
afirmar(bordeQuieto(0), 'D · con el techo fijo, el hundido lleva la tarjeta con el borde de arriba quieto en cada cuadro (la etiqueta «Contacto» no se despega)')
controlPositivo('D · el detector VE la columna recentrada de antes (la tarjeta baja 63 px en la transformación)', 63, (dy: number) => bordeQuieto(dy))

// ═══════════════════════════════════════════════════════════════════════════
titulo('J5 · El error en los dos formularios: la placa rechaza, Reintentar gira y el error sale de atrás del botón')

// A · El resorte (una curva para los dos formularios): baja rápido hasta el fondo, vuelve pasándose apenas y se asienta.
const resorteBien = (f: (u: number) => number): boolean => {
  const muestras = Array.from({ length: 101 }, (_, k) => f(k / 100))
  const fondo = muestras.indexOf(Math.max(...muestras))
  return f(0) === 0 && Math.abs(Math.max(...muestras) - 1) < 0.02 && fondo > 0 && fondo < 20 && Math.min(...muestras.slice(20, 70)) < -0.05 && Math.abs(f(0.95)) < 0.06 && f(1) === 0
}
afirmar(resorteBien(hundidoDelRechazo) && cuadrosDelRechazo(10).length === 25 && Math.abs(Math.max(...cuadrosDelRechazo(10)) - 10) < 0.3, 'A · el resorte del rechazo: al fondo antes del 20 % del tiempo, se pasa apenas (vuelve más allá de la cara) y se asienta')
controlPositivo('A · el detector VE un resorte sin amortiguar (no se asienta)', (u: number) => (u <= 0 || u >= 1 ? 0 : Math.sin(2 * Math.PI * 1.6 * u)), resorteBien)

// B · El pie: cada error, un rechazo (`data-rechazo`, para la placa 3D), el pulso, el foco en Reintentar, Reintentar girando en el
// DOM plano (en 3D gira la tecla), el error en su renglón saliendo de atrás del botón y, en el DOM plano, la escala del resorte
// (en 3D no: la transformada del formulario la escribe la escena).
const PIE_J5 = leer('_secciones/cierre/FormularioDelPie.tsx')
const pieRechazaBien = (p: string): boolean =>
  p.includes('setRechazos((n) => n + 1)') && p.includes("sonar('pulso')") && p.includes('data-rechazo={rechazos}') &&
  p.includes("placa.current?.querySelector<HTMLElement>('button[type=\"submit\"]')?.focus({ preventScroll: true })") &&
  p.includes("const rotulo = enviando ? c.enviando : estado.fase === 'error' ? REINTENTAR : c.enviar") &&
  p.includes('const giraElRotulo = !reducido && !enVolumen && rotulo === REINTENTAR') &&
  p.includes("className={cn(ERROR, 'overflow-hidden', estado.fase !== 'error' && 'sr-only')}") && p.includes("initial={reducido ? { opacity: 0 } : { opacity: 0, y: '-100%' }}") &&
  p.includes('style={volumen || rechazos === 0 ? undefined : { scale: escalaDelRechazo }}') && p.includes('if (rechazos === 0 || reducido || volumen) return undefined')
afirmar(pieRechazaBien(PIE_J5), 'B · el pie: el rechazo, el pulso, el foco en Reintentar (que gira), el error saliendo de atrás del botón y el resorte del DOM plano; con movimiento reducido, sin resorte ni giro')
controlPositivo('B · el detector VE la escala del resorte sobre el formulario de volumen (pisaría su homografía)', PIE_J5.replace('style={volumen || rechazos === 0 ? undefined : { scale: escalaDelRechazo }}', 'style={{ scale: escalaDelRechazo }}'), pieRechazaBien)

// C · La placa 3D del pie: un rechazo nuevo (otro `data-rechazo` en el mismo formulario) arranca el resorte (la placa entera se
// hunde en profundidad) y el giro de la tecla; con movimiento reducido, ninguno.
const ARMADAS_J5 = leer('_lib/escena/pie3d/armadas.ts')
const placaRechazaBien = (a: string): boolean =>
  a.includes('vieja.marcaDelRechazo !== null && rechazo !== null && rechazo !== vieja.marcaDelRechazo') && a.includes('if (rechazoNuevo) [a.rechazo, a.giroDeLaTecla] = [0, 0]') &&
  a.includes('a.viaje.matrix.multiply(HUNDIMIENTO.makeTranslation(0, 0, -RECHAZO.hondoPx * hundidoDelRechazo(u)))') && a.includes('if (quieto || a.rechazo === null) {') &&
  a.includes('if (a.giroDeLaTecla === null || t === null || quieto) {')
afirmar(placaRechazaBien(ARMADAS_J5), 'C · la placa 3D del pie se hunde en profundidad con el resorte y la tecla de Reintentar gira; con movimiento reducido, nada')
controlPositivo('C · el detector VE un resorte que corre también con movimiento reducido', ARMADAS_J5.replace('if (quieto || a.rechazo === null) {', 'if (a.rechazo === null) {'), placaRechazaBien)

// D · El panel de Contacto: el mismo resorte (el bloque de la placa en profundidad; la hoja del teléfono, en escala), el pulso,
// Reintentar girando y el error saliendo de atrás del botón; el foco, en Reintentar.
const panelRechazaBien = (m: string, placa: string): boolean =>
  m.includes('setRechazos((n) => n + 1)') && m.includes("sonar('pulso')") && m.includes("pedirFoco.current = 'enviar'") &&
  m.includes('const rotuloDelEnvio = enviando ? ROTULO_ENVIANDO : avisoALaVista ? REINTENTAR : ROTULO_DEL_ENVIO') && m.includes('<PlacaDelContacto activa={placa} rechazo={hundidoDelRechazo}>') &&
  m.includes('style={placa ? undefined : { scale: escalaDelRechazo }}') && m.includes('if (rechazos === 0 || reducido) return undefined') &&
  placa.includes('z: rechazo,')
afirmar(panelRechazaBien(PANEL_J4, leer('_chrome/contacto/PlacaDelContacto.tsx')), 'D · el panel: la placa se hunde y vuelve (la hoja del teléfono, en escala), el pulso, Reintentar girando y el error de atrás del botón; el foco en Reintentar')
controlPositivo('D · el detector VE un panel que rechaza en silencio', PANEL_J4.replace("sonar('pulso')", ''), (m: string) => panelRechazaBien(m, leer('_chrome/contacto/PlacaDelContacto.tsx')))

// E · «Reintentar» en la tecla de la placa 3D: la Chivo 600 del pie trae sus letras.
const reintentarBien = (f: FontData): boolean => [...REINTENTAR].every((c) => (f.glyphs as Record<string, unknown>)[c] !== undefined)
afirmar(reintentarBien(datos600 as FontData), 'E · la Chivo 600 del pie trae las letras de «Reintentar» (la tecla en 3D)')
controlPositivo('E · el detector VE una fuente sin la R', { ...(datos600 as FontData), glyphs: Object.fromEntries(Object.entries((datos600 as FontData).glyphs).filter(([c]) => c !== 'R')) } as FontData, reintentarBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('J6 · El autocompletado del pie con la piel del formulario')

// Chrome pinta el campo autocompletado con su fondo (que una regla no pisa) y su color de texto: en 3D esa caja quedaba a la vista
// sobre la cara de la placa, despegada de su pozo (más hondo). El fondo de siempre se queda (el cambio se demora para siempre) y el
// texto y el cursor van en la tinta del formulario.
const PIE_J6 = leer('_secciones/cierre/FormularioDelPie.tsx')
const autocompletadoBien = (p: string): boolean => /const CAMPO ='[^']*autofill:\[transition:background-color_100000s_0s,color_100000s_0s\] autofill:\[-webkit-text-fill-color:currentColor\] autofill:\[caret-color:currentColor\]'/.test(p)
afirmar(autocompletadoBien(PIE_J6), 'J6 · el campo autocompletado del pie se queda con su fondo y su tinta (no asoma la caja del navegador sobre la placa)')
controlPositivo('J6 · el detector VE los campos sin la regla del autocompletado', PIE_J6.replace(' autofill:[transition:background-color_100000s_0s,color_100000s_0s] autofill:[-webkit-text-fill-color:currentColor] autofill:[caret-color:currentColor]', ''), autocompletadoBien)

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

// ═══════════════════════════════════════════════════════════════════════════
titulo('J10 · El polvo con un solo toque: termina de subir y se queda en el aire')

// Posado (15 s quieto), UN toque de scroll (un décimo de segundo) y la página quieta 30 s. Se mira, cuadro a cuadro, cuándo
// están todas las motas en el aire y cuándo empieza a caer la primera: entre una y otra, por lo menos `enElAireS`. Y al
// caer la primera, la altura media y la dispersión son las del polvo suspendido (terminó de subir).
const cableadoDeHoy: Cableado = (e, f) => {
  if (e.desperto - e.antes > POSARSE.empiezaS) tomarElFrente(f, e)
  return { desperto: f.desperto, origen: f.origen, quieto: quietoConHisteresis(e.quieto, f) }
}
/** El de antes (PULIDO 9): la quietud desde el último movimiento, sin histéresis. */
const cableadoDeAntes: Cableado = (e, f) => {
  if (e.desperto - e.antes > POSARSE.empiezaS) tomarElFrente(f, e)
  return { desperto: f.desperto, origen: f.origen, quieto: e.quieto }
}
const TOQUE: Tramo = { s: 30, mueve: (t) => t < 0.1 }
interface Medida {
  readonly todasEnElAire: number
  readonly primeraCae: number
  readonly alCaer: { readonly media: number; readonly dispersion: number } | null
}
const medir = (c: Cableado): Medida => {
  const desdeElToque = QUIETO.s
  let [todasEnElAire, primeraCae] = [Number.NaN, Number.NaN]
  simular(c, [QUIETO, TOQUE], (reloj, modo) => {
    if (reloj <= desdeElToque + 0.2) return
    if (Number.isNaN(todasEnElAire) && modo.every((m) => m === 0)) todasEnElAire = reloj - desdeElToque
    if (Number.isNaN(primeraCae) && modo.some((m) => m === 1)) primeraCae = reloj - desdeElToque
  })
  // Al caer la primera: la estadística en ese instante (corriendo el mismo guion hasta ahí).
  const alCaer = Number.isNaN(primeraCae) ? null : simular(c, [QUIETO, { s: primeraCae, mueve: TOQUE.mueve }])[1]
  return { todasEnElAire, primeraCae, alCaer }
}
const histeresisBien = (m: Medida): boolean =>
  Number.isFinite(m.todasEnElAire) && Number.isFinite(m.primeraCae) && m.primeraCae - m.todasEnElAire >= HISTERESIS.enElAireS - DT &&
  m.alCaer !== null && Math.abs(m.alCaer.media - SUSPENDIDO.media) < 0.3 && Math.abs(m.alCaer.dispersion - SUSPENDIDO.dispersion) < 0.3
const hoy = medir(cableadoDeHoy)
afirmar(histeresisBien(hoy), `1 · con un solo toque, todas vuelven al aire y recién ${String(HISTERESIS.enElAireS)} s después empieza a caer la primera, con la altura y la dispersión del polvo suspendido`, `en el aire a los ${hoy.todasEnElAire.toFixed(1)} s; cae la primera a los ${hoy.primeraCae.toFixed(1)} s; ${String(N)} motas`)
controlPositivo('1 · el detector VE el código de antes: a los 4 s de quietud vuelve a bajar antes de terminar de subir', medir(cableadoDeAntes), histeresisBien)

// 2 · La escena le pasa esa quietud a la simulación (la del rig, con la histéresis), y la regla sigue: sin despertar, la de siempre.
const fisica = leer('_lib/escena/polvo/Fisica.tsx')
const cableado = (c: string): boolean => c.includes('p.quieto = quietoConHisteresis(despertar.quieto, m.frente)\n') && !/p\.quieto = despertar\.quieto\b/.test(c)
afirmar(cableado(fisica) && quietoConHisteresis(5, { desperto: -1e9, origen: [0, 0, 0], delCursor: false }) === 5 && quietoConHisteresis(1e9, { desperto: 3, origen: [0, 0, 0], delCursor: false }) === 1e9, '2 · la escena le pasa a la simulación la quietud con la histéresis; sin despertar, o con movimiento, la de siempre')
controlPositivo('2 · el detector VE el cableado de antes', fisica.replace('p.quieto = quietoConHisteresis(despertar.quieto, m.frente)\n', 'p.quieto = despertar.quieto\n'), cableado)

cerrar('s61-pulido-10')
