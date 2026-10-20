/**
 * s78 · B12a · LA ESCENA CONSCIENTE DE LA RUTA (`docs/rediseno/SPRINT-B12a.md`), sin navegador. B12a.1: el preset que declara la página
 * (D1), la escena que duerme en una subruta sin preset y en el papel (D8), y el home con su preset de siempre. Cada afirmación con su
 * control positivo. Lo medido en el sitio (`/v3/tipografia` en reposo: ≤ 50 ms/s de tareas y 0 cuadros de más de 50 ms) lo corre la
 * sonda de Fase 0 (`scratchpad/ph/costo-subruta.ts`). B12a.2: la intro de la página, su avance (de 0 a 1 en 1,5 pantallas, en un canal
 * propio, no en el progreso del rig) y la composición inicial (la pose en avance 0), con la ruta `/v3/prueba-de-pagina?intro=1|2|3`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ATRIBUTO_DE_LA_INTRO_DE_PAGINA, IntroDeLaPagina, SELECTOR_DE_LA_INTRO } from '../../_componentes/pagina/IntroDeLaPagina'
import { REGISTRO_DE_VARIANTES, esIdDeVariante } from '../../_variantes/registro'
import { CHOREO_KEYFRAMES } from '../escena/choreography'
import { AZIMUT_DEL_MOUSE_POR_PROGRESO } from '../escena/choreographyPhysics'
import { buildTrack, sampleLightArc, sampleTrack } from '../escena/choreographySampler'
import { CHOREO_CHANNELS, type ChoreoKeyframe, type ChoreoPose, type MutableChoreoPose, type MutableLightLevels } from '../escena/choreographyTypes'
import { ENERGIA_DE_LA_RUTA } from '../escena/energia/energiaDeLaRuta'
import { LUZ_DE_ABAJO_EN_VIVO } from '../escena/final/luzDeAbajo'
import { enElSostenDelCta } from '../escena/finalDelRecorrido'
import { NIVEL_DE_LA_NOCHE } from '../escena/lightArc'
import { azimutDelMouseEn } from '../escena/modulacionDeLaPose'
import { PresetDeLaPagina } from '../escena/ruta/PresetDeLaPagina'
// prettier-ignore
import { AVANCE_DE_LA_INTRO, COMPOSICION_INICIAL, PANTALLAS_DE_LA_INTRO, PISTA_DE_LA_INTRO, POSE_DE_LA_INTRO, avanceDeLaIntro, luzDeLaPagina, pistaDeLaPagina } from '../escena/ruta/pistaDeLaIntro'
import { PRESET_DEL_HOME, apilarElPreset, despiertaEnLaPagina, presetActual, type CajaVertical, type PresetDeLaEscena } from '../escena/ruta/preset'
import { atenderLaSalida, pedirLaSalidaDeLaVariante } from '../escena/ruta/salidaDeLaVariante'
import { COMPOSICION_DE_LA_LUZ, SALIDA_DE_LA_VARIANTE_MS } from '../escena/ruta/variante'
import { MARGEN_DE_REANUDACION } from '../escena/visibilidad'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.1 · 1 · El preset de la página (D1): lo declara la página, en una pila')

const DE_PRUEBA: PresetDeLaEscena = { id: 'prueba', tramos: { intro: `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: null, variante: null }
const antes = presetActual()
const sacarElHome = apilarElPreset(PRESET_DEL_HOME)
const sacarLaPrueba = apilarElPreset(DE_PRUEBA)
const conLasDos = presetActual()
sacarElHome()
const sinElViejo = presetActual()
sacarLaPrueba()
afirmarIgual([antes, conLasDos?.id, sinElViejo?.id, presetActual()], [null, 'prueba', 'prueba', null], 'sin página, ninguno; la que entra después manda; cada una saca SÓLO lo suyo (la nueva entra antes de que se vaya la vieja: la navegación cliente)')
afirmar(PRESET_DEL_HOME.tramos === null && PRESET_DEL_HOME.id === 'home', '  el del home no tiene bloques: manda el mapeo de sus secciones (el preset ni se consulta)')

type Despierta = (p: PresetDeLaEscena | null, b: readonly CajaVertical[], y: number, alto: number, margen: number) => boolean
const INTRO: CajaVertical = { arriba: 0, abajo: 1350 }
const reglas = (f: Despierta): boolean =>
  !f(null, [INTRO], 0, 900, MARGEN_DE_REANUDACION) && f(DE_PRUEBA, [INTRO], 0, 900, MARGEN_DE_REANUDACION) && f(DE_PRUEBA, [INTRO], 1400, 900, MARGEN_DE_REANUDACION) &&
  !f(DE_PRUEBA, [INTRO], 2000, 900, MARGEN_DE_REANUDACION) && !f(DE_PRUEBA, [INTRO], 0, 0, MARGEN_DE_REANUDACION) && f({ ...DE_PRUEBA, tramos: null }, [], 5000, 900, MARGEN_DE_REANUDACION)
afirmar(reglas(despiertaEnLaPagina), `fuera del home: sin preset, dormida; con preset, despierta mientras un bloque suyo asoma (con el margen de encendido del home, ${String(MARGEN_DE_REANUDACION)} pantallas), dormida en el papel; con el alto en cero (la pestaña oculta), dormida`)
controlPositivo('  el detector ve una escena siempre despierta (la de Fase 0: unos 600 ms/s en una galería)', (() => true) as Despierta, reglas)
controlPositivo('  y una que no mira el margen (se apagaría con la intro asomando)', ((p, b, y, alto) => p !== null && alto > 0 && (p.tramos === null || b.some((c) => c.abajo > y && c.arriba < y + alto))) as Despierta, (f: Despierta) => f(DE_PRUEBA, [INTRO], 1400, 900, MARGEN_DE_REANUDACION) && f(DE_PRUEBA, [{ arriba: 1000, abajo: 2000 }], 0, 900, MARGEN_DE_REANUDACION))

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.1 · 2 · La escena en una subruta: duerme, pero recién después de su primer cuadro')

const atadura = sinComentarios(leer('_lib/escena/ataduraAlScroll.ts'))
const cableada = (a: string): boolean =>
  /if \(secciones === null\) \{\s*const preset = presetActual\(\)\s*const intro = [^\n]+\n\s*if \(intro !== null\) AVANCE_DE_LA_INTRO\.current = [^\n]+\n\s*const despierta = !hayPrimerCuadro\(\) \|\| despiertaEnLaPagina\(preset, bloquesDelPreset\(document, preset, desplazamiento\), desplazamiento, ventana, MARGEN_DE_REANUDACION\)/.test(a) &&
  /const enLaPagina = despierta \? EN_CUADRO : FUERA_DE_CUADRO\s*if \(siguiente\(estadoRef\.current, enLaPagina\) !== estadoRef\.current\) setEstado/.test(a) &&
  /const desuscribirDelPreset = suscribirseAlPreset\(pedir\)/.test(a) && /const desuscribirDeLaCarga = suscribirALaCarga\(pedir\)/.test(a) && /desuscribirDelPreset\(\)\s*desuscribirDeLaCarga\(\)/.test(a)
afirmar(cableada(atadura), 'sin las secciones del home, la lectura del scroll pregunta al preset: la escena se suspende (`never`) en una galería y en el papel de una página, y se vuelve a leer cuando cambia el preset o cuando la escena pinta su primer cuadro')
controlPositivo('  el detector ve la lectura de Fase 0 (sin secciones, salía sin decidir: la escena corría para siempre)', atadura.replace(/if \(secciones === null\) \{[\s\S]*?\n {6}\}\n/, 'if (secciones === null) return\n'), cableada)
afirmar(/const progreso = quieta\s*\? PROGRESO_RETENIDO\s*: progresoDelScroll\(medida\.y, secciones\.arriba, medida\.abajo, ventana\)/.test(atadura), '  y en el home la lectura sigue como estaba: el progreso de sus secciones (s74, s75 y el mapeo de s76 lo afirman)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.1 · 3 · El home declara su preset, y no pinta nada')

const pagina = sinComentarios(leer('page.tsx'))
const declara = (p: string): boolean => /<PresetDeLaPagina preset=\{PRESET_DEL_HOME\} \/>/.test(p)
afirmar(declara(pagina), 'el home monta `<PresetDeLaPagina preset={PRESET_DEL_HOME} />`')
controlPositivo('  el detector ve un home sin su preset', pagina.replace('<PresetDeLaPagina preset={PRESET_DEL_HOME} />', ''), declara)
const pieza = sinComentarios(leer('_lib/escena/ruta/PresetDeLaPagina.tsx'))
afirmar(renderToStaticMarkup(<PresetDeLaPagina preset={PRESET_DEL_HOME} />) === '' && /useLayoutEffect\(\(\) => apilarElPreset\(preset\), \[preset\]\)/.test(pieza), '  y no pinta nada: apila al montarse (antes del primer cuadro) y saca al desmontarse; el marcado del home no cambia')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.2 · 4 · El avance de la intro: 0 arriba, 1 a las 1,5 pantallas (± 1 %)')

type Avance = (arriba: number, y: number, alto: number) => number
// A 1440 × 900 con la intro en el tope, y a 390 × 844 con algo de 120 px arriba de ella.
const avanceBien = (f: Avance): boolean =>
  [{ arriba: 0, alto: 900 }, { arriba: 120, alto: 844 }].every(({ arriba, alto }) => {
    const en = (pantallas: number): number => f(arriba, arriba + pantallas * alto, alto)
    return Math.abs(en(0)) <= 0.01 && Math.abs(en(0.75) - 0.5) <= 0.01 && Math.abs(en(PANTALLAS_DE_LA_INTRO) - 1) <= 0.01 && en(3) === 1 && f(arriba, arriba - 200, alto) === 0
  }) && f(0, 500, 0) === 0
afirmar(PANTALLAS_DE_LA_INTRO === 1.5 && avanceBien(avanceDeLaIntro), 'el avance va de 0 (el tope de la intro en el tope del cuadro) a 1 (1,5 pantallas después), lineal, acotado de los dos lados; con el alto en cero, 0')
controlPositivo('  el detector ve un avance de una sola pantalla', ((a, y, alto) => Math.min(1, Math.max(0, (y - a) / alto))) as Avance, avanceBien)
controlPositivo('  y uno sin acotar (pasada la intro seguiría girando)', ((a, y, alto) => (alto > 0 ? (y - a) / (1.5 * alto) : 0)) as Avance, avanceBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.2 · 5 · La composición inicial: la pose en avance 0, en las tres variantes')

const poseEn = (keyframes: readonly ChoreoKeyframe[], avance: number): MutableChoreoPose => {
  const p: MutableChoreoPose = { angleDeg: Number.NaN, height: Number.NaN, distance: Number.NaN, frameX: Number.NaN, frameY: Number.NaN }
  sampleTrack(buildTrack(keyframes), avance, p)
  return p
}
const igual = (a: ChoreoPose, b: ChoreoPose): boolean => CHOREO_CHANNELS.every((c) => Math.abs(a[c] - b[c]) < 1e-9)
// [B12a.2] Reemplazadas por la decisión (2026-10-20): de las tres poses quedó la 2 (girar); las otras y `?intro=` salieron.
const parten = (pista: readonly ChoreoKeyframe[]): boolean => igual(poseEn(pista, 0), COMPOSICION_INICIAL) && igual(poseEn(pista, 1), POSE_DE_LA_INTRO)
afirmar(parten(PISTA_DE_LA_INTRO) && POSE_DE_LA_INTRO.angleDeg === 38 && POSE_DE_LA_INTRO.height === 5.2 && POSE_DE_LA_INTRO.distance === 15, 'la pista de la intro arranca en la composición inicial (avance 0) y llega a la pose elegida, GIRAR (avance 1): la misma pose, la misma cámara, 0 px de diferencia del logo a cualquier ancho')
controlPositivo('  el detector ve una pista que arranca en el hero del home (con el logo corrido para su texto)', [{ ...PISTA_DE_LA_INTRO[0], pose: CHOREO_KEYFRAMES[0].pose }, PISTA_DE_LA_INTRO[1]] as readonly ChoreoKeyframe[], parten)
controlPositivo('  y la pista de otra pose (acercarse, la 1 de las candidatas)', [PISTA_DE_LA_INTRO[0], { ...PISTA_DE_LA_INTRO[1], pose: { angleDeg: 0, height: 4.2, distance: 12.5, frameX: 0, frameY: 0 } }] as readonly ChoreoKeyframe[], parten)
const hero = CHOREO_KEYFRAMES[0].pose
afirmar(
  COMPOSICION_INICIAL.angleDeg === hero.angleDeg && COMPOSICION_INICIAL.height === hero.height && COMPOSICION_INICIAL.distance === hero.distance && COMPOSICION_INICIAL.frameX === 0 && COMPOSICION_INICIAL.frameY === 0,
  `  y es la pose del hero del home con el logo centrado (frameX 0; el hero lo corre a ${String(hero.frameX)}), copiada: el hero no se toca (es el destino del preloader del sitio vivo)`,
)
const centrada = (p: ChoreoPose): boolean => p.frameX === 0 && p.frameY === 0
afirmar(centrada(POSE_DE_LA_INTRO) && centrada(poseEn(PISTA_DE_LA_INTRO, 0.5)), '  la pose deja el logo centrado, y todo el camino también (el título va encima)')
controlPositivo('  el detector ve la pose de subir (la 3 de las candidatas: el logo corrido hacia abajo)', { angleDeg: -20, height: 10, distance: 20, frameX: 0, frameY: -0.25 }, centrada)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.2 · 6 · La pista que lee el rig ([B12a.2] la bandera de las poses salió)')

const sinBandera = (c: string): boolean => !/varianteDeLaIntro|keyframesDeLaIntro|POSES_DE_LA_INTRO|intro=/.test(c)
afirmar(sinBandera(sinComentarios(leer('_lib/escena/ruta/pistaDeLaIntro.ts')) + sinComentarios(leer('prueba-de-pagina/page.tsx'))), '`?intro=1|2|3` salió con las poses 1 y 3: queda la elegida')
controlPositivo('  el detector ve la bandera de las tres poses', "const v = new URLSearchParams(busqueda).get('intro')\nreturn v === '2' ? 2 : v === '3' ? 3 : 1 // varianteDeLaIntro", sinBandera)
const sinPagina = pistaDeLaPagina()
const sacarElDelHome = apilarElPreset(PRESET_DEL_HOME)
const conElHome = pistaDeLaPagina()
const sacarLaDePrueba = apilarElPreset(DE_PRUEBA)
const una = pistaDeLaPagina()
const otra = pistaDeLaPagina()
sacarLaDePrueba()
sacarElDelHome()
afirmar(
  sinPagina === null && conElHome === null && PRESET_DEL_HOME.pista === null && una !== null && una === otra && una.noche && una.track.keyframes.length === 2 && pistaDeLaPagina() === null,
  'el rig lee la pista de la página: ninguna en una galería ni en el home (su pista es la del recorrido); en una página con pista, la suya, armada una vez (el mismo objeto en cada cuadro: nada se crea por cuadro)',
)
const luz = (f: (a: MutableLightLevels) => void): MutableLightLevels => {
  const a: MutableLightLevels = { level: Number.NaN, kelvin: Number.NaN, azimuthDeg: Number.NaN, elevationDeg: Number.NaN }
  f(a)
  return a
}
const delArco = (p: number): MutableLightLevels => luz((a) => sampleLightArc(p, a))
const deNoche = luz((a) => luzDeLaPagina(una, 0.6, a))
afirmar(
  JSON.stringify(luz((a) => luzDeLaPagina(null, 0.6, a))) === JSON.stringify(delArco(0.6)) &&
    JSON.stringify(luz((a) => luzDeLaPagina({ noche: false }, 0.6, a))) === JSON.stringify(delArco(0)) &&
    deNoche.level === Math.min(delArco(0).level, NIVEL_DE_LA_NOCHE) && deNoche.kelvin === delArco(0).kelvin,
  '  y la luz: en el home, la del recorrido; en una página, la del principio del recorrido (sin importar el progreso), y con la noche del preset acotada a la noche',
  `de noche: ${deNoche.level.toFixed(3)}`,
)
afirmar(AVANCE_DE_LA_INTRO.current === 0, '  el avance arranca en 0: una página que carga arriba está en la composición inicial')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.2 · 7 · El cableado: el avance va por su canal, no por el progreso del rig')

const enLaPagina = (a: string): string => /if \(secciones === null\) \{[\s\S]*?\n {6}\}\n/.exec(a)?.[0] ?? ''
const escribeElAvance = (a: string): boolean =>
  /const intro = preset === null \|\| preset\.pista === null \|\| preset\.tramos === null \? null : document\.querySelector\(preset\.tramos\.intro\)\s*if \(intro !== null\) AVANCE_DE_LA_INTRO\.current = avanceDeLaIntro\(intro\.getBoundingClientRect\(\)\.top \+ desplazamiento, desplazamiento, ventana\)/.test(enLaPagina(a)) &&
  !/rig\.set\(/.test(enLaPagina(a))
afirmar(escribeElAvance(atadura), 'la lectura del scroll mide el tope de la intro en el layout y escribe su avance en `AVANCE_DE_LA_INTRO`; en una página no toca el progreso del rig (lo leen los títulos, el polvo, la formación y el entorno con el significado del home)')
controlPositivo('  el detector ve el avance escrito en el progreso del rig', atadura.replace('AVANCE_DE_LA_INTRO.current = avanceDeLaIntro(', "rig.set('progress', avanceDeLaIntro(") , escribeElAvance)

const rig = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
const rigCableado = (r: string): boolean =>
  /sampleTrack\(track, progresoDeLaCamara\(progress\), target\)\s*if \(isChoreo\) mezclarConElPortfolio\([^\n]*\n\s*const pagina = pistaDeLaPagina\(\)\s*if \(pagina !== null\) sampleTrack\(pagina\.track, AVANCE_DE_LA_INTRO\.current, target\)\s*luzDeLaPagina\(pagina, progress, arc\)\s*arc\.level = nivelConLaNocheDisparada\(arc\.level\)/.test(r) &&
  r.includes('physics && enElSostenDelCta(rigValues.progress)') &&
  r.includes('rigValues.mouseScale * escalaDeLaOrbita(), rigValues.progress)')
afirmar(rigCableado(rig), 'el rig, en una página con pista: su pista con el avance de la intro ENCIMA de la del recorrido y de la mezcla del Portfolio, y la luz del principio con la noche del preset ANTES de la noche disparada; las líneas del home, tal cual')
controlPositivo('  el detector ve el rig del home solo (la página caería en la pista del recorrido)', rig.replace('if (pagina !== null) sampleTrack(pagina.track, AVANCE_DE_LA_INTRO.current, target)', ''), rigCableado)
controlPositivo('  y uno con la pista de la página ANTES de la mezcla del Portfolio (la mezcla quedaría encima)', rig.replace('if (pagina !== null) sampleTrack(pagina.track, AVANCE_DE_LA_INTRO.current, target)', '').replace('sampleTrack(track, progresoDeLaCamara(progress), target)', 'sampleTrack(track, progresoDeLaCamara(progress), target)\nif (pagina !== null) sampleTrack(pagina.track, AVANCE_DE_LA_INTRO.current, target)'), rigCableado)
afirmar(!enElSostenDelCta(0) && azimutDelMouseEn(0) === AZIMUT_DEL_MOUSE_POR_PROGRESO[0][1], '  el dolly del CTA y el mouse del recorrido no necesitan guarda: leen el progreso del rig, que en una página queda en el del hero (0 en una carga directa; con la navegación, B12a.5 lo vuelve a 0 al volver a la composición inicial)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.2 · 8 · El bloque de la intro y la ruta de prueba')

const intro = renderToStaticMarkup(<IntroDeLaPagina titulo="Una página" bajada={<p>La bajada.</p>} preset={DE_PRUEBA} />)
const bloqueBien = (html: string): boolean =>
  // [B12a.3] Reemplazada por la spec: el atributo lleva el id de la página (antes, vacío).
  html.includes(`${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}="prueba"`) && /<h1[^>]*>Una página<\/h1>/.test(html) && html.includes(`h-[${String(PANTALLAS_DE_LA_INTRO * 100)}svh]`) && html.includes('data-seccion="invertida"') && html.includes('<p>La bajada.</p>')
afirmar(bloqueBien(intro), 'la intro es un bloque con el atributo que mide la escena, el `h1` con el nombre, el alto de `PANTALLAS_DE_LA_INTRO` y, de noche, los claros (la sección invertida); declara el preset sin pintar nada más')
controlPositivo('  el detector ve una intro de una pantalla', intro.replace(`h-[${String(PANTALLAS_DE_LA_INTRO * 100)}svh]`, `h-[${String(100)}svh]`), bloqueBien)
afirmar(DE_PRUEBA.tramos?.intro === `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`, '  y el selector del preset es el de ese atributo')

const ruta = sinComentarios(leer('prueba-de-pagina/page.tsx'))
const rutaBien = (r: string): boolean =>
  /const PRESET: PresetDeLaEscena = \{[\s\S]*?pista: PISTA_DE_LA_INTRO,[\s\S]*?noche: 'noche',/.test(r) && /preset=\{PRESET\}/.test(r) && /robots: \{ index: false, follow: false/.test(r)
afirmar(rutaBien(ruta), 'la ruta de prueba (`/v3/prueba-de-pagina`, sin indexar): un preset armado una vez (el mismo objeto en cada render), de noche, con la pista de la intro')
controlPositivo('  el detector ve una ruta que arma el preset en cada render', ruta.replace('preset={PRESET}', 'preset={{ ...PRESET }}'), rutaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.3 · 9 · La ranura de variantes y lo que le presta a la variante (P-H29 a a f)')

const leerV3 = (r: string): string => sinComentarios(leer(r))
// e · El registro: un id por variante, con un import dinámico; fuera de `_lib/` (que nunca importa `_servicios/`).
const registro = leerV3('_variantes/registro.ts')
const registroBien = (r: string): boolean => /prueba: \(\) => import\('\.\.\/_lib\/escena\/ruta\/VarianteDePrueba'\)/.test(r) && !/^import (?!type)[^\n]*_servicios/m.test(r) && !/^import (?!type)[^\n]*VarianteDePrueba/m.test(r)
afirmar(registroBien(registro) && esIdDeVariante('prueba') && !esIdDeVariante('otra') && typeof REGISTRO_DE_VARIANTES.prueba === 'function', '[P-H29e] el preset lleva el id de la variante y la ranura la carga del registro con un import dinámico (una página de servidor no puede pasarle una función a un componente de cliente); la variante queda en su propio pedazo')
controlPositivo('  el detector ve un registro que importa la variante entera (entraría en la carga del lienzo)', `import VarianteDePrueba from '../_lib/escena/ruta/VarianteDePrueba'\n${registro}`, registroBien)
afirmar(PRESET_DEL_HOME.variante === null && DE_PRUEBA.variante === null, '  el home no tiene variante')
// El bloque de la intro: el id de la página en su atributo, el acento en el bloque, el selector exportado.
const conAcento: PresetDeLaEscena = { ...DE_PRUEBA, acento: 'web', variante: 'prueba' }
const bloque3 = renderToStaticMarkup(<IntroDeLaPagina titulo="Una página" bajada={<p>La bajada.</p>} preset={conAcento} />)
const bloque3Bien = (html: string): boolean => html.includes(`${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}="prueba"`) && html.includes('data-servicio="web"') && SELECTOR_DE_LA_INTRO === `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`
afirmar(bloque3Bien(bloque3), '  la intro lleva en su atributo el id de la página y, con acento, es del servicio (`[data-servicio]` pone su claro); `SELECTOR_DE_LA_INTRO` es lo que va en `tramos.intro`')
controlPositivo('  el detector ve la intro de B12a.2 (el atributo vacío, sin el acento)', bloque3.replace(`${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}="prueba"`, `${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}=""`).replace('data-servicio="web"', ''), bloque3Bien)
// La ranura: montada después del final; un dueño por tramo; la salida.
const escenario = leerV3('_lib/escena/ProbeStage.tsx')
const ranura = leerV3('_lib/escena/ruta/RanuraDeLaVariante.tsx')
const despuesDelFinal = (e: string): boolean => e.indexOf('<RanuraDeLaVariante calidad={calidad} reducido={reducedMotion} />') > e.indexOf('<FinalDelPie ') && e.includes('<FinalDelPie ')
afirmar(despuesDelFinal(escenario), '  la ranura está montada DESPUÉS del final del pie: su cuadro corre después y, en la intro, la luz de abajo es la suya')
controlPositivo('  el detector ve la ranura antes del final (el final le pisaría la luz)', `<RanuraDeLaVariante calidad={calidad} reducido={reducedMotion} />\n${escenario.replace('<RanuraDeLaVariante calidad={calidad} reducido={reducedMotion} />', '')}`, despuesDelFinal)
const duenaBien = (r: string): boolean =>
  /const ahora = saliendo\.current \|\| yendose \|\| \(deLaPagina !== null && deLaPagina\.pista !== null && AVANCE_DE_LA_INTRO\.current < 1\)/.test(r) &&
  /ENERGIA_DE_LA_RUTA\.pedido = true\s*LUZ_DE_ABAJO_EN_VIVO\.uEnergiaDeLaLuz\.value = Math\.min\(1, Math\.max\(0, luz\.current\.energia\)\)\s*LUZ_DE_ABAJO_EN_VIVO\.uExpansionDeLaLuz\.value\.set\(RADIO_DE_LA_LUZ_PRESTADA, 1\)\s*LUZ_DE_ABAJO_EN_VIVO\.uColorDeLaLuz\.value\.copy\(luz\.current\.color\)/.test(r)
afirmar(duenaBien(ranura), '[P-H29a] un dueño por tramo: la luz de abajo y el color de la energía son de la ranura mientras la intro está a la vista (o la variante sale); fuera, del final (B13: el pie). En el home (sin pista), nunca')
controlPositivo('  el detector ve una ranura que se queda con la luz en toda la página (le quitaría el pie al final)', ranura.replace(' && AVANCE_DE_LA_INTRO.current < 1', ''), duenaBien)
// [P-H29d] La salida, REEMPLAZADA por la spec (la medición del build, D7): antes arrancaba cuando cambiaba la ruta, con la página nueva
// montándose (los cuadros trabados, la luz que saltaba y se ponía blanca); ahora la pide la navegación con una señal, ANTES de irse.
let pedidas = 0
const soltarLaSalida = atenderLaSalida(() => {
  pedidas += 1
  return Promise.resolve()
})
void pedirLaSalidaDeLaVariante()
soltarLaSalida()
void pedirLaSalidaDeLaVariante()
const senal = leer('_lib/escena/ruta/salidaDeLaVariante.ts')
const senalBien = (s: string): boolean => !/^import /m.test(s) && /return atender === null \? Promise\.resolve\(\) : atender\(\)/.test(s)
afirmar(pedidas === 1 && senalBien(senal), '[P-H29d] la señal de salida: la navegación la pide (`pedirLaSalidaDeLaVariante`) y espera su promesa; la atiende la ranura mientras tiene una variante, y sin ella se resuelve en el acto; sin react ni three')
controlPositivo('  el detector ve una señal que importa three (entraría en la carga de la navegación)', `import * as THREE from 'three'\n${senal}`, senalBien)
const salidaBien = (r: string): boolean =>
  SALIDA_DE_LA_VARIANTE_MS === 420 &&
  /return atenderLaSalida\(\(\) => \(hayBanco\(\) && \(window as VentanaDelBanco\)\.__ranuraSinLaSenal === true \? Promise\.resolve\(\) : salir\('senal'\)\)\)/.test(r) &&
  /if \(enCurso !== null\) return enCurso\.promesa\s*saliendo\.current = true/.test(r) &&
  /reducido \|\| !duena\.current \? 0 : SALIDA_DE_LA_VARIANTE_MS/.test(r) &&
  /void salir\('ruta'\)\.then\(\(\) => \{\s*if \(vigente\) setMontada\(null\)/.test(r) &&
  !/s\.hecha = true[\s\S]{0,300}saliendo\.current = false/.test(r)
afirmar(salidaBien(ranura), `  la ranura atiende la señal con la salida: \`saliendo\` y ${String(SALIDA_DE_LA_VARIANTE_MS)} ms para volver a la composición con la página quieta (con movimiento reducido o la escena tapada, en el acto); una sola salida a la vez; si la ruta cambia sin pedirla (la flecha del navegador), arranca ahí; se desmonta recién con la salida terminada y \`saliendo\` dura hasta el desmontaje`)
controlPositivo('  el detector ve la ranura que ignora la señal (la salida de antes: la variante sale con la página nueva ya montándose)', ranura.replace("salir('senal')", 'Promise.resolve()'), salidaBien)
const acentoBien = (r: string): boolean => /acento: acentoDelToken\(presetActual\(\)\?\.acento \?\? null\) \}\)/.test(r) && r.includes('acento={montada.acento}') && !r.includes('acento={acento}')
afirmar(acentoBien(ranura), '  el acento es de la variante montada, fijado al cargarla: al salir, la luz baja teñida (antes tomaba el del home, blanco, y se ponía blanca de golpe)')
controlPositivo('  el detector ve el acento de la ruta actual (el defecto medido en el build)', ranura.replace('acento={montada.acento}', 'acento={acento}'), acentoBien)
const continuaBien = (r: string): boolean => /const yendose = m !== null && \(deLaPagina === null \|\| deLaPagina\.id !== m\.pagina \|\| deLaPagina\.variante !== m\.id\)/.test(r) && /const ahora = saliendo\.current \|\| yendose \|\|/.test(r)
afirmar(continuaBien(ranura), '  la ranura no suelta la luz entre el cambio de ruta y su salida: con la página ida y la variante montada, sigue siendo la dueña (si no, el final se la quedaba un cuadro)')
controlPositivo('  el detector ve la ranura que la suelta un cuadro', ranura.replace('saliendo.current || yendose ||', 'saliendo.current ||'), continuaBien)
const enlace = leerV3('prueba-de-pagina/EnlaceConLaSalida.tsx')
const enlaceBien = (e: string): boolean => /e\.preventDefault\(\)\s*const enlace = e\.currentTarget\s*void pedirLaSalidaDeLaVariante\(\)\.then\(\(\) => \{\s*dejarPasar\.current = true\s*enlace\.click\(\)/.test(e) && !/useRouter|router\./.test(e) && ruta.includes('<EnlaceConLaSalida href="/v3"')
afirmar(enlaceBien(enlace), '  la página de prueba vuelve al home pidiendo la señal: espera la salida y recién deja pasar el clic al `<Link>` (nunca `router.push`; interino hasta `EnlaceDeRuta`, B12a.6)')
controlPositivo('  el detector ve el enlace que navega sin esperar la salida', enlace.replace('e.preventDefault()', ''), enlaceBien)
// b · El color de la luz de abajo, en los dos shaders; c · el de la energía, prestado sin pisar al banco.
const piso = leer('_lib/escena/final/enElPiso.ts')
const plano = leer('_lib/escena/final/planoDeLaLuz.ts')
const colorBien = (a: string, b: string): boolean => a.includes('return color + vec3( luz * junta * uBrilloDeLaLuz ) * uColorDeLaLuz;') && b.includes('* luz * uBrilloDeLaLuz ) * uColorDeLaLuz, 1.0 );') && a.includes('uniform vec3 uColorDeLaLuz;') && b.includes('uniform vec3 uColorDeLaLuz;')
afirmar(colorBien(piso, plano) && LUZ_DE_ABAJO_EN_VIVO.uColorDeLaLuz.value.getHex() === 0xffffff, '[P-H29b] la luz de abajo tiene color (`uColorDeLaLuz`): las juntas del piso y el plano de debajo lo multiplican; blanco, el de siempre, salvo en la intro de una página')
controlPositivo('  el detector ve el blanco escrito en el shader (antes de P-H29b)', [piso.replace(' * uColorDeLaLuz;', ';'), plano] as const, ([a, b]: readonly [string, string]) => colorBien(a, b))
const energia = leerV3('_lib/escena/energia/PlasmaYCargas.tsx')
const energiaBien = (e: string): boolean => /if \(ENERGIA_DE_LA_RUTA\.pedido\) \{\s*u\.uLuzNoche\.value\.set\(ENERGIA_DE_LA_RUTA\.color\.r, ENERGIA_DE_LA_RUTA\.color\.g, ENERGIA_DE_LA_RUTA\.color\.b\)\s*tenida\.current = true\s*\} else if \(tenida\.current\) \{\s*u\.uLuzNoche\.value\.set\(1, 1, 1\)/.test(e)
afirmar(energiaBien(energia) && ENERGIA_DE_LA_RUTA.pedido === false, '[P-H29c] el color de la energía (las brasas, los arcos y la red: `uLuzNoche`) se presta a la ranura: se copia sólo mientras ella lo pide (el banco no se pisa) y al soltarlo vuelve al blanco')
controlPositivo('  el detector ve la energía teñida siempre (le pisaría el color al banco)', energia.replace('if (ENERGIA_DE_LA_RUTA.pedido) {', 'if (true) {'), energiaBien)
// f · La luz de la composición, del home.
afirmar(COMPOSICION_DE_LA_LUZ.noche === 1 && COMPOSICION_DE_LA_LUZ.brilloDelPiso === 0.12 && /useRef\(\{ energia: COMPOSICION_DE_LA_LUZ\.brilloDelPiso as number, color: new THREE\.Color\(1, 1, 1\) \}\)/.test(ranura), '[P-H29f] la luz de la composición compartida la define el home (de noche entera, el piso a 0,12) y la ranura la pone en la intro de toda página, con o sin variante')
// La variante de prueba: sólo lo prestado, y libera lo suyo. `variante.ts`: sólo tipos y números.
const deprueba = leerV3('_lib/escena/ruta/VarianteDePrueba.tsx')
const soloLoPrestado = (v: string): boolean =>
  !/camera|LUZ_DE_ABAJO_EN_VIVO|ENERGIA_DE_LA_RUTA|AVANCE_DE_LA_INTRO|rig\.|EffectComposer|_servicios|new THREE\.(Mesh|RingGeometry|MeshBasicMaterial)\(/.test(v) && /luzDeAbajo\(COMPOSICION_DE_LA_LUZ\.brilloDelPiso \+/.test(v) && /<mesh ref=\{anillo\}/.test(v) && /^export default function VarianteDePrueba/m.test(v) && /^'use client'/.test(leer('_lib/escena/ruta/VarianteDePrueba.tsx'))
afirmar(soloLoPrestado(deprueba), '  la variante de prueba toca sólo lo prestado (con las dos funciones que le presta la ranura: la luz de abajo y el color de la energía), lee el avance, arma lo suyo en JSX (R3F lo libera al desmontarse) y es el `default` de un módulo `use client`')
controlPositivo('  el detector ve una variante que mueve la cámara', `${deprueba}\nstate.camera.position.y = 10`, soloLoPrestado)
const tipos = leer('_lib/escena/ruta/variante.ts')
const soloTipos = (t: string): boolean => !/^import (?!type)/m.test(t) && /export const PRESUPUESTO_DE_LA_VARIANTE = \{ cpuMsPorCuadro: 0\.5 \} as const/.test(t)
afirmar(soloTipos(tipos), '  `variante.ts` (lo que importa servicios) son tipos y números: ningún valor de three ni de react; el presupuesto, 0,5 ms de CPU por cuadro')
controlPositivo('  el detector ve un valor de three en los tipos', `import * as THREE from 'three'\n${tipos}`, soloTipos)

cerrar('s78-b12a')
