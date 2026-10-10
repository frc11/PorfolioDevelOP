/**
 * PULIDO 10 — el invariante: npm run test:s61-pulido-10
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   J1  · 1024 y «Portátil L»: el texto 3D en renglones, la banda portátil (el campo de visión y las medidas del logo en el
 *         DOM) y los solapes (el detector y los recibos del banco a 1024, 1280 y 1440).
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-10.md`.
 */
import { existsSync, readFileSync } from 'node:fs'

import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { BANDA, enUnidadesDelLogo, factorDeLaBanda, fovConFactor } from '../escena/banda'
import { CAMERA_FOV } from '../escena/probeScene'
import { armarElTitulo } from '../escena/titulos3d/geometria'
import { solapesDe, type Silueta } from './solapes'
import { valorDeToken } from './s10-css'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

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

cerrar('s61-pulido-10')
