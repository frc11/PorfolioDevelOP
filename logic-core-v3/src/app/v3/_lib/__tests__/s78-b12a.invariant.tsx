/**
 * s78 · B12a · LA ESCENA CONSCIENTE DE LA RUTA (`docs/rediseno/SPRINT-B12a.md`), sin navegador. B12a.1: el preset que declara la página
 * (D1), la escena que duerme en una subruta sin preset y en el papel (D8), y el home con su preset de siempre. Cada afirmación con su
 * control positivo. Lo medido en el sitio (`/v3/tipografia` en reposo: ≤ 50 ms/s de tareas y 0 cuadros de más de 50 ms) lo corre la
 * sonda de Fase 0 (`scratchpad/ph/costo-subruta.ts`). B12a.2: la intro de la página, su avance (de 0 a 1 en 1,5 pantallas, en un canal
 * propio, no en el progreso del rig) y la composición inicial (la pose en avance 0), con la ruta `/v3/prueba-de-pagina?intro=1|2|3`.
 * [B12a.8]: la intro de 2,5 pantallas en `/v3/pagina-base` (la ruta de prueba pasó a ser la página base), su composición
 * (`?composicion=1|2|3`), el título protagonista (T1), el texto sobre la escena (P-H33), el velo nuevo y la vuelta por entrada (§13 y §14).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { inflateSync } from 'node:zlib'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import * as THREE from 'three'

import { ATRIBUTO_DE_LA_INTRO_DE_PAGINA, IntroDeLaPagina, SELECTOR_DE_LA_INTRO, TRAMOS_DE_LA_INTRO } from '../../_componentes/pagina/IntroDeLaPagina'
import { anchoDelTitulo, anchoEnEm } from '../../_componentes/titulos3d/anchoDelTitulo'
import { CAIDA_DEL_TITULO, CARA_DEL_DOM, COMBINACIONES_DEL_TITULO, TITULOS_CON_LETRAS, TITULO_DE_PAGINA, caeElTitulo, combinacionDeLaBandera, partesDelTitulo } from '../../_componentes/titulos3d/presets'
import { MAS_PESADA, legibilidadDeLaBandera } from '../../_componentes/titulos3d/legibilidad'
import { SERVICIOS } from '../../_secciones/_contrato/acento'
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
import { ENTRADAS_GUARDADAS, guardarLaPosicionDelHome, posicionGuardadaDelHome } from '../escena/ruta/posicionDelHome'
// prettier-ignore
import { AVANCE_DE_LA_INTRO, COMPOSICION_INICIAL, PANTALLAS_DE_LA_INTRO, PISTA_DE_LA_INTRO, POSE_DE_LA_INTRO, TRAMO_DEL_TITULO, avanceDeLaIntro, luzDeLaPagina, pistaDeLaPagina } from '../escena/ruta/pistaDeLaIntro'
import { COMPOSICIONES, COMPOSICION_EN_LA_ESCENA, COMPOSICION_POR_DEFECTO, composicionDeLaBandera, huecoEnElCuadro } from '../escena/ruta/composicion'
import { encuadreDelHueco, poseDeLaIntro } from '../escena/ruta/composicionEnLaEscena'
import { armarLaCamara, cajaProyectada } from '../escena/poseDelPortfolio'
import { CAMERA_FOV } from '../escena/probeScene'
import { PRESET_DEL_HOME, apilarElPreset, despiertaEnLaPagina, presetActual, type CajaVertical, type PresetDeLaEscena } from '../escena/ruta/preset'
import { atenderLaSalida, pedirLaSalidaDeLaVariante } from '../escena/ruta/salidaDeLaVariante'
import { COMPOSICION_DE_LA_LUZ, SALIDA_DE_LA_VARIANTE_MS } from '../escena/ruta/variante'
import { esFuenteDePagina } from '../escena/titulos3d/fuentesDePagina'
import { PLUMA_DEL_VELO, VELO, colorDelVelo, coberturaDelVelo, frenteDelVelo, geometriaDeLaBanda, puedeDestapar, siguienteFaseDelVelo, transformadaDelVelo, type GeometriaDeLaBanda } from '../../_chrome/velo/velo'
import { PLUMA_DE_LA_BANDA, anchoTotalDeLaBanda } from '../../_secciones/trabajos/gota'
import { EVENTOS_DEL_VELO, VELO_EN_CURSO, cuandoElVeloQuede, esperaAlVelo } from '../veloDeNavegacion'
import { MARGEN_DE_REANUDACION } from '../escena/visibilidad'
import type { FuenteDePagina } from '../titulos3d/registro'
import { nacimientoDeLaPildora } from '../../_chrome/barra/BarraDelHome'
import { ITEMS_DEL_DESPLEGABLE } from '../../_chrome/barra/DesplegableDeServicios'
import { ENLACES_DEL_HOME } from '../../_chrome/enlaces'
import { HOME, PAGINAS_DE_SERVICIO, SERVICIOS_DEL_HOME, destinoDesde } from '../../_chrome/paginas'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.1 · 1 · El preset de la página (D1): lo declara la página, en una pila')

const DE_PRUEBA: PresetDeLaEscena = { id: 'base', tramos: { intro: `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: null, variante: null }
const antes = presetActual()
const sacarElHome = apilarElPreset(PRESET_DEL_HOME)
const sacarLaPrueba = apilarElPreset(DE_PRUEBA)
const conLasDos = presetActual()
sacarElHome()
const sinElViejo = presetActual()
sacarLaPrueba()
afirmarIgual([antes, conLasDos?.id, sinElViejo?.id, presetActual()], [null, 'base', 'base', null], 'sin página, ninguno; la que entra después manda; cada una saca SÓLO lo suyo (la nueva entra antes de que se vaya la vieja: la navegación cliente)')
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
  // [B12a.6] Entre el avance y el despertar, el rig vuelve al progreso del hero (la navegación cliente lo traía del home).
  /if \(secciones === null\) \{\s*const preset = presetActual\(\)\s*const intro = [^\n]+\n\s*if \(intro !== null\) AVANCE_DE_LA_INTRO\.current = [^\n]+\n(?:\s*if \(rig\.current\.progress !== 0\) rig\.set\('progress', 0\)\n)?\s*const despierta = !hayPrimerCuadro\(\) \|\| despiertaEnLaPagina\(preset, bloquesDelPreset\(document, preset, desplazamiento\), desplazamiento, ventana, MARGEN_DE_REANUDACION\)/.test(a) &&
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
titulo('B12a.2 · 4 · El avance de la intro: 0 arriba, 1 a las `PANTALLAS_DE_LA_INTRO` pantallas (± 1 %); [B12a.8] 2,5')

type Avance = (arriba: number, y: number, alto: number) => number
// A 1440 × 900 con la intro en el tope, y a 390 × 844 con algo de 120 px arriba de ella.
const avanceBien = (f: Avance): boolean =>
  [{ arriba: 0, alto: 900 }, { arriba: 120, alto: 844 }].every(({ arriba, alto }) => {
    const en = (pantallas: number): number => f(arriba, arriba + pantallas * alto, alto)
    return Math.abs(en(0)) <= 0.01 && Math.abs(en(PANTALLAS_DE_LA_INTRO / 2) - 0.5) <= 0.01 && Math.abs(en(PANTALLAS_DE_LA_INTRO) - 1) <= 0.01 && en(3) === 1 && f(arriba, arriba - 200, alto) === 0
  }) && f(0, 500, 0) === 0
// [B12a.8] Reemplazada por la spec: la intro pasa de 1,5 a 2,5 pantallas (la parte 3D quedaba corta).
afirmar(PANTALLAS_DE_LA_INTRO === 2.5 && avanceBien(avanceDeLaIntro), 'el avance va de 0 (el tope de la intro en el tope del cuadro) a 1 (2,5 pantallas después), lineal, acotado de los dos lados; con el alto en cero, 0')
controlPositivo('  el detector ve un avance de una sola pantalla', ((a, y, alto) => Math.min(1, Math.max(0, (y - a) / alto))) as Avance, avanceBien)
controlPositivo('  y uno sin acotar (pasada la intro seguiría girando)', ((a, y, alto) => (alto > 0 ? (y - a) / (PANTALLAS_DE_LA_INTRO * alto) : 0)) as Avance, avanceBien)

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
afirmar(centrada(POSE_DE_LA_INTRO) && centrada(poseEn(PISTA_DE_LA_INTRO, 0.5)), '  la pista no lleva encuadre (el logo en el medio): [B12a.8] lo corre la composición, con el encuadre resuelto en cada cuadro (§13)')
controlPositivo('  el detector ve la pose de subir (la 3 de las candidatas: el logo corrido hacia abajo)', { angleDeg: -20, height: 10, distance: 20, frameX: 0, frameY: -0.25 }, centrada)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.2 · 6 · La pista que lee el rig ([B12a.2] la bandera de las poses salió)')

const sinBandera = (c: string): boolean => !/varianteDeLaIntro|keyframesDeLaIntro|POSES_DE_LA_INTRO|intro=/.test(c)
afirmar(sinBandera(sinComentarios(leer('_lib/escena/ruta/pistaDeLaIntro.ts')) + sinComentarios(leer('pagina-base/page.tsx'))), '`?intro=1|2|3` salió con las poses 1 y 3: queda la elegida')
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
  // [B12a.6] Reemplazada por la spec: en una página el progreso del rig sólo vuelve al del hero (0: con la navegación cliente llegaba el del
  // home); nunca lleva el avance de la intro.
  (enLaPagina(a).match(/rig\.set\(/g) ?? []).length === 1 && /if \(rig\.current\.progress !== 0\) rig\.set\('progress', 0\)/.test(enLaPagina(a))
afirmar(escribeElAvance(atadura), 'la lectura del scroll mide el tope de la intro en el layout y escribe su avance en `AVANCE_DE_LA_INTRO`; en una página el progreso del rig no lleva el avance (lo leen los títulos, el polvo, la formación y el entorno con el significado del home): [B12a.6] sólo vuelve al del hero')
controlPositivo('  el detector ve el avance escrito en el progreso del rig', atadura.replace('AVANCE_DE_LA_INTRO.current = avanceDeLaIntro(', "rig.set('progress', avanceDeLaIntro(") , escribeElAvance)

const rig = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
const rigCableado = (r: string): boolean =>
  /sampleTrack\(track, progresoDeLaCamara\(progress\), target\)\s*if \(isChoreo\) mezclarConElPortfolio\([^\n]*\n\s*const pagina = pistaDeLaPagina\(\)\s*if \(pagina !== null\) poseDeLaIntro\(pagina\.track, AVANCE_DE_LA_INTRO\.current, target, state\.size\.width \/ Math\.max\(1, state\.size\.height\), fovDeLaBanda\(CAMERA_FOV, state\.size\.width, state\.size\.height\), stats\.current\.logoW, stats\.current\.logoH\)\s*luzDeLaPagina\(pagina, progress, arc\)\s*arc\.level = nivelConLaNocheDisparada\(arc\.level\)/.test(r) &&
  r.includes('physics && enElSostenDelCta(rigValues.progress)') &&
  r.includes('rigValues.mouseScale * escalaDeLaOrbita(), rigValues.progress)')
afirmar(rigCableado(rig), 'el rig, en una página con pista: su pista con el avance de la intro ([B12a.8] y el encuadre de su composición) ENCIMA de la del recorrido y de la mezcla del Portfolio, y la luz del principio con la noche del preset ANTES de la noche disparada; las líneas del home, tal cual')
controlPositivo('  el detector ve el rig del home solo (la página caería en la pista del recorrido)', rig.replace('if (pagina !== null) poseDeLaIntro(pagina.track, AVANCE_DE_LA_INTRO.current, target, state.size.width / Math.max(1, state.size.height), fovDeLaBanda(CAMERA_FOV, state.size.width, state.size.height), stats.current.logoW, stats.current.logoH)', ''), rigCableado)
controlPositivo('  y uno con la pista de la página ANTES de la mezcla del Portfolio (la mezcla quedaría encima)', rig.replace('if (pagina !== null) poseDeLaIntro(pagina.track, AVANCE_DE_LA_INTRO.current, target, state.size.width / Math.max(1, state.size.height), fovDeLaBanda(CAMERA_FOV, state.size.width, state.size.height), stats.current.logoW, stats.current.logoH)', '').replace('sampleTrack(track, progresoDeLaCamara(progress), target)', 'sampleTrack(track, progresoDeLaCamara(progress), target)\nif (pagina !== null) poseDeLaIntro(pagina.track, AVANCE_DE_LA_INTRO.current, target, state.size.width / Math.max(1, state.size.height), fovDeLaBanda(CAMERA_FOV, state.size.width, state.size.height), stats.current.logoW, stats.current.logoH)'), rigCableado)
afirmar(!enElSostenDelCta(0) && azimutDelMouseEn(0) === AZIMUT_DEL_MOUSE_POR_PROGRESO[0][1], '  el dolly del CTA y el mouse del recorrido no necesitan guarda: leen el progreso del rig, que en una página queda en el del hero (0 en una carga directa; con la navegación, B12a.5 lo vuelve a 0 al volver a la composición inicial)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.2 · 8 · El bloque de la intro y la ruta de prueba ([B12a.8] la página base)')

const intro = renderToStaticMarkup(<IntroDeLaPagina titulo="Una página" bajada={<p>La bajada.</p>} preset={DE_PRUEBA} />)
/** El texto del `h1` (sin etiquetas): el que leen el lector de pantalla y los buscadores. */
const textoDelH1 = (html: string): string | null => /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1]?.replace(/<[^>]+>/g, '') ?? null
const bloqueBien = (html: string): boolean =>
  // [B12a.3] Reemplazada por la spec: el atributo lleva el id de la página (antes, vacío). [B12a.4] Y el `h1` dice el nombre con sus dos
  // partes adentro (el título de la página): se mira su texto, no que el texto sea lo único adentro.
  // [B12a.8] Y el alto sale de la constante por una variable de CSS (calibrable).
  html.includes(`${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}="base"`) && textoDelH1(html) === 'Una página' && html.includes(`--pantallas-de-la-intro:${String(PANTALLAS_DE_LA_INTRO)}`) && html.includes('h-[calc(var(--pantallas-de-la-intro)*100svh)]') && html.includes('data-seccion="invertida"') && html.includes('<p>La bajada.</p>')
afirmar(bloqueBien(intro), 'la intro es un bloque con el atributo que mide la escena, el `h1` con el nombre, el alto de `PANTALLAS_DE_LA_INTRO` y, de noche, los claros (la sección invertida); declara el preset sin pintar nada más')
controlPositivo('  el detector ve una intro de una pantalla', intro.replace(`--pantallas-de-la-intro:${String(PANTALLAS_DE_LA_INTRO)}`, '--pantallas-de-la-intro:1'), bloqueBien)
afirmar(DE_PRUEBA.tramos?.intro === `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`, '  y el selector del preset es el de ese atributo')

const ruta = sinComentarios(leer('pagina-base/page.tsx'))
const rutaBien = (r: string): boolean =>
  /const PRESET: PresetDeLaEscena = \{[\s\S]*?pista: PISTA_DE_LA_INTRO,[\s\S]*?noche: 'noche',/.test(r) && /preset=\{PRESET\}/.test(r) && /robots: \{ index: false, follow: false/.test(r)
afirmar(rutaBien(ruta), 'la página base (`/v3/pagina-base`, sin indexar): un preset armado una vez (el mismo objeto en cada render), de noche, con la pista de la intro')
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
const bloque3Bien = (html: string): boolean => html.includes(`${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}="base"`) && html.includes('data-servicio="web"') && SELECTOR_DE_LA_INTRO === `[${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}]`
afirmar(bloque3Bien(bloque3), '  la intro lleva en su atributo el id de la página y, con acento, es del servicio (`[data-servicio]` pone su claro); `SELECTOR_DE_LA_INTRO` es lo que va en `tramos.intro`')
controlPositivo('  el detector ve la intro de B12a.2 (el atributo vacío, sin el acento)', bloque3.replace(`${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}="base"`, `${ATRIBUTO_DE_LA_INTRO_DE_PAGINA}=""`).replace('data-servicio="web"', ''), bloque3Bien)
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
// [B12a.6] Reemplazada por la spec: el enlace interino (`EnlaceConLaSalida`) se fue; la página de prueba vuelve con `EnlaceDeRuta`, que pide
// la señal ANTES del velo (§11 afirma el resto de su cableado).
const enlace = leerV3('_componentes/navegacion/EnlaceDeRuta.tsx')
// [B12a.8] Reemplazada por la spec (4): la salida y el velo JUNTOS (una pasada); el router sólo precarga, nunca navega. Y (8): el enlace
// al home vive en el cuerpo de la base (su cierre, `CuerpoDeLaBase`), no en la página.
const cuerpoDeLaBase = sinComentarios(leer('pagina-base/CuerpoDeLaBase.tsx'))
const enlaceBien = (e: string): boolean => /e\.preventDefault\(\)\s*const enlace = e\.currentTarget\s*precargar\(\)\s*void Promise\.all\(\[pedirLaSalidaDeLaVariante\(\),/.test(e) && /dejarPasar\.current = true\s*enlace\.click\(\)/.test(e) && !/router\.(push|replace|back|forward|refresh)/.test(e) && cuerpoDeLaBase.includes('<EnlaceDeRuta href="/v3"')
afirmar(enlaceBien(enlace), '  la página base vuelve al home con `EnlaceDeRuta`: pide la señal y el velo, espera los dos y recién deja pasar el clic al `<Link>` (nunca `router.push`)')
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.4 · 10 · El título de las páginas (P-H13, P-H14): el `h1` y sus dos partes en volumen, en dos variantes de Archivo (D3)')

const conPartes = (t: string, p?: readonly [string, string]): string => renderToStaticMarkup(<IntroDeLaPagina titulo={t} partes={p} bajada={<p>b</p>} preset={DE_PRUEBA} />)
const NOMBRES = SERVICIOS.map((s) => s.nombre)
const h1Bien = (pintar: (t: string) => string): boolean => NOMBRES.every((n) => textoDelH1(pintar(n)) === n) && textoDelH1(pintar('Desarrollo web')) === 'Desarrollo web'
afirmar(h1Bien((t) => conPartes(t)) && textoDelH1(conPartes('Desarrollo web', ['Desarrollo', 'web'])) === 'Desarrollo web' && partesDelTitulo('Software a medida').join(' ') === 'Software a medida', 'el `h1` dice el nombre entero de cada servicio, el MISMO texto que el título 3D: sus dos partes (las dadas, o la primera palabra y el resto) unidas con un espacio')
controlPositivo('  el detector ve un `h1` con las partes pegadas (sin el espacio)', (t: string) => conPartes(t).replace('</span> <span', '</span><span'), h1Bien)
const caraDe = (f: FuenteDePagina): string => `style="font-family:${CARA_DEL_DOM[f].familia};font-weight:${String(CARA_DEL_DOM[f].peso)}"`
const partesBien = (html: string): boolean => html.includes(`data-parte="titulo-1" class="inline-block" ${caraDe(TITULO_DE_PAGINA.fuentes[0])}`) && html.includes(caraDe(TITULO_DE_PAGINA.fuentes[1]))
afirmar(partesBien(conPartes('Desarrollo web')) && TITULO_DE_PAGINA === COMBINACIONES_DEL_TITULO[0], '  cada parte va en la cara del DOM de su fuente (la de la combinación 1 sin la bandera), con el peso de su instancia: la escena mide sus letras con la métrica del 3D')
controlPositivo('  el detector ve las dos partes en la misma cara', conPartes('Desarrollo web').replace(caraDe(TITULO_DE_PAGINA.fuentes[1]), caraDe(TITULO_DE_PAGINA.fuentes[0])), partesBien)
const banderaBien = (f: (v: string | null) => unknown): boolean =>
  f('1') === COMBINACIONES_DEL_TITULO[0] && f('2') === COMBINACIONES_DEL_TITULO[1] && f('3') === COMBINACIONES_DEL_TITULO[2] && f('4') === COMBINACIONES_DEL_TITULO[3] && f(null) === TITULO_DE_PAGINA && f('5') === TITULO_DE_PAGINA && f('x') === TITULO_DE_PAGINA
// [B12a.8] Reemplazada por la spec: cuatro combinaciones que se distinguen de verdad (las tres de B12a.4 no se distinguían).
afirmar(banderaBien(combinacionDeLaBandera) && COMBINACIONES_DEL_TITULO.length === 4, '  `?titulo=1|2|3|4` elige la combinación; sin ella o con otra cosa, la 1 (`TITULO_DE_PAGINA`, la del «6»)')
controlPositivo('  el detector ve una bandera que no se lee', () => TITULO_DE_PAGINA, banderaBien)

// D3: dos variantes de Archivo por combinación, ninguna de las del home (la 62 del hero, la 100/600 y la 100/900 del CTA del final).
type Instancia = { readonly wght: number; readonly wdth: number; readonly fuente: string }
const archivoDe = (f: FuenteDePagina): string => `${f}-pagina`
type FuenteEnJson = { readonly glyphs: Readonly<Record<string, unknown>>; readonly original_font_information: { readonly fontSubfamily: string; readonly source: string } }
const delJson = (f: FuenteDePagina): FuenteEnJson => JSON.parse(leer(`_fuentes/${archivoDe(f)}.json`)) as FuenteEnJson
const instanciaDe = (f: FuenteDePagina): Instancia => {
  const m = /^wght (\d+) wdth ([\d.]+)$/.exec(delJson(f).original_font_information.fontSubfamily)
  return { wght: Number(m?.[1]), wdth: Number(m?.[2]), fuente: delJson(f).original_font_information.source }
}
// [B12a.8] T5 · y la de la opción `?legibilidad=peso` (la parte liviana un paso más pesada): también es de página, en 3D y en el DOM.
const USADAS = [...new Set([...COMBINACIONES_DEL_TITULO.flatMap((c) => c.fuentes), ...Object.values(MAS_PESADA).flatMap((f) => (f === undefined ? [] : [f]))])]
const delHome = (i: Instancia): boolean => i.wdth === 62 || (i.wdth === 100 && (i.wght === 600 || i.wght === 900))
const ningunaDelHome = (instancias: readonly Instancia[]): boolean =>
  instancias.length === USADAS.length && instancias.every((i) => Number.isFinite(i.wght) && Number.isFinite(i.wdth) && i.fuente === 'Archivo[wdth,wght].ttf' && !delHome(i)) && COMBINACIONES_DEL_TITULO.every((c) => c.fuentes[0] !== c.fuentes[1])
const instancias = USADAS.map(instanciaDe)
afirmar(USADAS.every(esFuenteDePagina) && ningunaDelHome(instancias), `  D3 · dos variantes de Archivo por combinación, ninguna del home: ${instancias.map((i) => `${String(i.wdth)}/${String(i.wght)}`).join(', ')}`)
controlPositivo('  el detector ve la del CTA del final (100/600)', [...instancias.slice(1), { wght: 600, wdth: 100, fuente: 'Archivo[wdth,wght].ttf' }], ningunaDelHome)

// La cobertura: cada letra de los tres nombres (y de la ruta de prueba) en cada instancia, en el 3D (JSON) y en el DOM (WOFF).
/** Los códigos que mapea el `cmap` (formato 4) de un WOFF de `_fuentes/`: un lector propio (zlib), aparte del de `s10-woff2.ts`. */
function codigosDelWoff(archivo: string): ReadonlySet<number> {
  const b = readFileSync(path.join(V3, '_fuentes', archivo))
  if (b.toString('ascii', 0, 4) !== 'wOFF') throw new Error(`${archivo} no es un WOFF`)
  let cmap: Buffer | null = null
  for (let i = 0; i < b.readUInt16BE(12); i += 1) {
    const e = 44 + i * 20
    if (b.toString('ascii', e, e + 4) !== 'cmap') continue
    const [desde, comprimido, original] = [b.readUInt32BE(e + 4), b.readUInt32BE(e + 8), b.readUInt32BE(e + 12)]
    const bloque = b.subarray(desde, desde + comprimido)
    cmap = comprimido < original ? inflateSync(bloque) : bloque
  }
  if (cmap === null) throw new Error(`${archivo} no trae cmap`)
  const codigos = new Set<number>()
  for (let r = 0; r < cmap.readUInt16BE(2); r += 1) {
    const sub = cmap.subarray(cmap.readUInt32BE(4 + r * 8 + 4))
    if (sub.readUInt16BE(0) !== 4) continue
    const seg = sub.readUInt16BE(6) / 2
    for (let s = 0; s < seg; s += 1) {
      const [hasta, desde] = [sub.readUInt16BE(14 + s * 2), sub.readUInt16BE(16 + seg * 2 + s * 2)]
      for (let c = desde; c <= hasta && c !== 0xffff; c += 1) codigos.add(c)
    }
  }
  return codigos
}
// Las letras: las de los títulos que el preset sabe escribir, la MISMA lista que la del generador (los nombres de las páginas de servicio,
// los de `acento.ts` y el de la prueba).
const delGenerador = /^TEXTOS_DE_PAGINA = \[([^\]]*)\]/m.exec(readFileSync(path.join(process.cwd(), 'scripts-retoque/fuentes-3d.py'), 'utf8'))?.[1]?.split(',').map((t) => t.trim().slice(1, -1)) ?? []
afirmarIgual(delGenerador, [...TITULOS_CON_LETRAS], '  los títulos con letras son los del generador de las fuentes (`TEXTOS_DE_PAGINA`), con los tres de `acento.ts` adentro')
afirmar(NOMBRES.every((n) => (TITULOS_CON_LETRAS as readonly string[]).includes(n)), '    (los de la ruta de prueba, `?nombre=`, están)')
const LETRAS = [...new Set(TITULOS_CON_LETRAS.join(''))]
const cubre = (letras: readonly string[]): boolean =>
  USADAS.every((f) => {
    const enElDom = codigosDelWoff(`${archivoDe(f)}.woff`)
    return letras.every((l) => Object.hasOwn(delJson(f).glyphs, l) && enElDom.has(l.codePointAt(0) ?? -1))
  })
afirmar(cubre(LETRAS), `  la cobertura: las ${String(LETRAS.length)} letras de esos títulos están en las ${String(USADAS.length)} instancias, en el 3D y en el DOM (un nombre nuevo obliga a regenerar: \`scripts-retoque/fuentes-3d.py\`)`)
controlPositivo('  el detector ve un nombre con una letra que no está (la Ñ)', [...LETRAS, 'Ñ'], cubre)

// El home no las baja: las 3D con un import dinámico, las del DOM sin precarga.
const deLaPagina = leerV3('_lib/escena/titulos3d/fuentesDePagina.ts')
const conEstatica = (readdirSync(V3, { recursive: true, encoding: 'utf8' }) as string[]).filter((r) => /\.tsx?$/.test(r) && !r.includes('__tests__') && /^import [^\n]*-pagina\.json'/m.test(leer(r)))
const perezosas = ([f, estaticas]: readonly [string, readonly string[]]): boolean => estaticas.length === 0 && (f.match(/\(\) => import\('\.\.\/\.\.\/\.\.\/_fuentes\/archivo-[\d-]+-pagina\.json'\)/g) ?? []).length === USADAS.length
afirmar(perezosas([deLaPagina, conEstatica]), '  el home no las baja: las fuentes 3D de las páginas llegan con un import dinámico cada una (`fuentesDePagina.ts`) y ninguna es estática (las del home, sí, con el lienzo)')
controlPositivo('  el detector ve una importada estática', [deLaPagina, ['_lib/escena/titulos3d/armado.ts']] as const, perezosas)
const layout = leer('layout.tsx')
const carasBien = (l: string): boolean =>
  USADAS.every((f) => l.includes(`localFont({ src: './_fuentes/${archivoDe(f)}.woff', variable: '${CARA_DEL_DOM[f].familia.slice(4, -1)}', weight: '${String(CARA_DEL_DOM[f].peso)}', style: 'normal', display: 'swap', preload: false })`)) && /\$\{CARAS_DE_PAGINA\} font-cuerpo/.test(l)
afirmar(carasBien(layout), '  y las caras del DOM las declara el layout sin precarga: el home sólo lleva su `@font-face`; una página baja las dos de su combinación')
controlPositivo('  el detector ve una precargada', layout.replace('preload: false })', 'preload: true })'), carasBien)

// El cableado: en la pantalla (sigue al `h1` fijo de la intro), con el gesto y el reloj del titular del hero; cae con el gatillo de la intro.
const delTitulo = leerV3('_componentes/titulos3d/TituloDePagina.tsx')
const tituloCableado = (c: string): boolean =>
  /const comun = \{ lectura: 0, salida: null, queda: true, gesto: 'azar', colocacion: 'pantalla', rearma: true, minimoS: LLEGADA_DEL_TITULAR_S, asiento: preset\.asiento, saleCayendo: preset\.saleCayendo, parteDelMouse: [^,]+, material: [^,]+, activo \} as const/.test(c) &&
  // [B12a.8] Reemplazada por la spec: cae antes de que su tramo se suelte (antes, con el avance 0,5).
  /const activo = material !== 'no' && escritorio && !reducido/.test(c) && /const ahora = !caeElTitulo\(tramo\.getBoundingClientRect\(\)\.bottom, fijo\.offsetHeight, window\.innerHeight, caidaTarde\(\) \? -0\.3 : undefined\)/.test(c) &&
  /animate\(presencia, ahora \? 1 : 0, \{ duration: CAIDA_DEL_TITULO\.s,/.test(c) && /const APAGADO = 'escritorio:opacity-0'/.test(c) && /className=\{cn\('inline-block', listo && APAGADO\)\}/.test(c)
afirmar(tituloCableado(delTitulo) && COMBINACIONES_DEL_TITULO.every((c) => c.saleCayendo) && CAIDA_DEL_TITULO.antes > 0 && CAIDA_DEL_TITULO.antes < 1, `  el título en volumen va en la pantalla, llega con el gesto y el reloj del titular del hero y cae (nunca de golpe) cuando a su tramo le falta ${String(CAIDA_DEL_TITULO.antes)} pantalla para soltarse; con las dos partes armadas el DOM se apaga sólo desde 1024 (sigue en el árbol accesible); sin WebGL, con movimiento reducido o abajo de 1024, el \`h1\` es el visible`)
controlPositivo('  el detector ve el título en volumen con movimiento reducido', delTitulo.replace("material !== 'no' && escritorio && !reducido", "material !== 'no' && escritorio"), tituloCableado)
controlPositivo('  y el `h1` apagado en todos los anchos', delTitulo.replace("const APAGADO = 'escritorio:opacity-0'", "const APAGADO = 'opacity-0'"), tituloCableado)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.6 · 11 · La navegación entre páginas: el velo y `EnlaceDeRuta`')

// La máquina del velo: quieto → cubriendo → cubierto → (la ruta cambia) destapando → quieto.
type SiguienteDelVelo = typeof siguienteFaseDelVelo
const maquinaDelVelo = (f: SiguienteDelVelo): boolean =>
  f('quieto', 'cubrir') === 'cubriendo' && f('cubriendo', 'cubrio') === 'cubierto' && f('cubierto', 'llego') === 'destapando' && f('destapando', 'destapo') === 'quieto' &&
  f('cubriendo', 'cubrir') === 'cubriendo' && f('cubierto', 'cubrir') === 'cubierto' && f('quieto', 'llego') === 'quieto' && f('cubriendo', 'llego') === 'cubriendo' && f('destapando', 'cubrir') === 'cubriendo'
afirmar(maquinaDelVelo(siguienteFaseDelVelo), 'el velo: quieto → cubriendo → cubierto → destapando (recién cuando la ruta cambió) → quieto; un pedido en medio no lo reinicia; destapando, uno nuevo vuelve a cubrir')
controlPositivo('  el detector ve un velo que destapa sin esperar a la ruta', ((f, e) => (e === 'cubrio' && f === 'cubriendo' ? 'destapando' : siguienteFaseDelVelo(f, e))) as SiguienteDelVelo, maquinaDelVelo)
// La cobertura: entero en el cuadro del cambio; crece al cubrir y decrece al destapar; sin tapar al empezar y al terminar.
type Cobertura = typeof coberturaDelVelo
const coberturaBien = (c: Cobertura): boolean =>
  c('cubierto', 0) === 1 && c('quieto', 1) === 0 && c('cubriendo', 0) === 0 && c('cubriendo', 1) === 1 && c('destapando', 0) === 1 && c('destapando', 1) === 0 &&
  [0.25, 0.5, 0.75, 1].every((t, k, a) => k === 0 || c('cubriendo', t) >= c('cubriendo', a[k - 1] ?? 0))
// [B12a.8] P-H32 · Reemplazada por la spec: la banda ya no es una máscara que cambia en cada cuadro, es un elemento con su degradé quieto
// movido con `transform` (el compositor). Cubierta, el cuerpo de la banda (entre sus dos plumas) contiene las cuatro esquinas del cuadro.
const esquinasCubiertas = (g: GeometriaDeLaBanda, ancho: number, alto: number, frente: number): boolean => {
  // Sobre el barrido (de abajo a la derecha hacia arriba a la izquierda), desde la esquina de abajo a la derecha: el cuerpo va de
  // frente − pluma − (espesor − 2·pluma) a frente − pluma.
  const u = { x: -alto / Math.hypot(ancho, alto), y: -ancho / Math.hypot(ancho, alto) }
  const q = (x: number, y: number): number => (x - ancho) * u.x + (y - alto) * u.y
  const desde = frente - g.pluma - (g.espesor - 2 * g.pluma)
  const hasta = frente - g.pluma
  return [q(0, 0), q(ancho, 0), q(0, alto), q(ancho, alto)].every((v) => v >= desde - 0.5 && v <= hasta + 0.5)
}
const cubreEntero = (geometria: typeof geometriaDeLaBanda): boolean =>
  [[1440, 900], [390, 844], [1024, 768], [768, 1024]].every(([w = 0, h = 0]) => {
    const g = geometria(w, h)
    return esquinasCubiertas(g, w, h, frenteDelVelo('cubierto', 1, g)) && !esquinasCubiertas(g, w, h, frenteDelVelo('cubriendo', 0, g)) && frenteDelVelo('destapando', 1, g) - g.espesor >= g.recorrido - 5 && Math.abs(g.largo - Math.hypot(w, h)) < 10
  })
afirmar(coberturaBien(coberturaDelVelo) && cubreEntero(geometriaDeLaBanda) && /^translate\(-50%, -50%\) rotate\(-?[\d.]+rad\) translateY\(-?[\d.]+px\)$/.test(transformadaDelVelo(100, geometriaDeLaBanda(1440, 900))) && PLUMA_DEL_VELO === PLUMA_DE_LA_BANDA, '  el velo cubre el cuadro ENTERO en el cuadro del cambio (la gota, no: 62 % de la diagonal), a cualquier aspecto; entra por abajo a la derecha y sale por arriba a la izquierda, con la pluma de la gota, movido sólo con `transform` (P-H32)')
controlPositivo('  el detector ve una banda más angosta que el recorrido (dejaría una esquina sin tapar)', ((w: number, h: number) => ({ ...geometriaDeLaBanda(w, h), espesor: geometriaDeLaBanda(w, h).espesor * 0.7 })) as typeof geometriaDeLaBanda, cubreEntero)
controlPositivo('  el detector ve la banda de la gota (nunca cubre entera)', ((f, t) => Math.min(anchoTotalDeLaBanda() / 100, coberturaDelVelo(f, t))) as Cobertura, coberturaBien)
// [B12a.8] Reemplazada por la spec (5): el color ya no es la noche del destino (sobre papel, un velo de papel no se veía): contrasta con
// lo que tapa. Y pasa DEBAJO del chrome (T2: la píldora se desliza a su lugar mientras el velo pasa).
const delVeloNuevo = leerV3('_chrome/velo/VeloDeNavegacion.tsx')
const colorDelVeloBien = (f: typeof colorDelVelo, velo: string): boolean => f('claro') === 'tinta' && f('oscuro') === 'papel' && velo.includes('color = COLOR[colorDelVelo(tonoDeLoQueTapa())]') && velo.includes('z-[calc(var(--z-cabecera)-1)]')
afirmar(colorDelVeloBien(colorDelVelo, delVeloNuevo), '  el velo contrasta con lo que tapa: sobre papel (o la sala de día) la tinta, sobre la escena de noche el papel; y pasa debajo del chrome')
controlPositivo('  el detector ve el velo del color del destino (el de B12a.6)', ((tapa) => (tapa === 'claro' ? 'papel' : 'tinta')) as typeof colorDelVelo, (f: typeof colorDelVelo) => colorDelVeloBien(f, delVeloNuevo))
// EnlaceDeRuta: el <Link>, nunca router.push; pide la salida de la variante, después el velo, y recién deja pasar el clic.
const delEnlace = leerV3('_componentes/navegacion/EnlaceDeRuta.tsx')
const enlaceDelVeloBien = (c: string): boolean =>
  // [B12a.8] Reemplazada por la spec (4): la precarga (el `prefetch` del `<Link>`, que con el puntero encima la adelanta; con el puntero o el
  // foco se calientan las fuentes del destino), sin `useRouter` (s51 renderiza el chrome fuera del router), y la salida y el velo JUNTOS.
  /<Link\s+ref=\{ref\}\s+href=\{href\}\s+scroll=\{false\}\s+prefetch/.test(c) && !/router\.push|router\.replace|TransitionContext/.test(c) && /if \(href\.startsWith\('#'\)\)/.test(c) &&
  !/useRouter/.test(c) && /const precargar = \(\): void => calentarElDestino\(href\)/.test(c) && /onPointerEnter=\{\(e\) => \{\s*onPointerEnter\?\.\(e\)\s*precargar\(\)/.test(c) && /onFocus=\{\(e\) => \{\s*onFocus\?\.\(e\)\s*precargar\(\)/.test(c) &&
  /void Promise\.all\(\[pedirLaSalidaDeLaVariante\(\), sinVelo\(\) \? Promise\.resolve\(\) : cubrirConElVelo\(\)\]\)\.then\(\(\) => \{\s*dejarPasar\.current = true\s*enlace\.click\(\)/.test(c)
afirmar(enlaceDelVeloBien(delEnlace), '`EnlaceDeRuta`: el `<Link>` de next (la navegación cliente: el lienzo y el chrome no se rehacen), nunca `router.push`; precarga el destino (con el puntero encima o el foco) y pide la salida de la variante y el velo juntos; cubierto, deja pasar el clic; un ancla del documento es un `<a>` (el viaje del home)')
controlPositivo('  el detector ve el enlace que navega sin pedir el velo', delEnlace.replace('sinVelo() ? Promise.resolve() : cubrirConElVelo()', 'Promise.resolve()'), enlaceDelVeloBien)
controlPositivo('  y uno con `router.push`', `${delEnlace}\nrouter.push(href)`, enlaceDelVeloBien)
controlPositivo('  y uno con `useRouter` (se cae fuera del router de next)', delEnlace.replace('const dejarPasar = useRef(false)', 'const dejarPasar = useRef(false)\n  const router = useRouter()'), enlaceDelVeloBien)


titulo('B12a.7 · 12 · La vuelta al home: la flecha con la posición que el home dejó')

// El corte: la flecha cambia la ruta sin pedir nada, así que el velo cubre de una desde cualquier fase.
const cortaDeUna = (f: SiguienteDelVelo): boolean => (['quieto', 'cubriendo', 'cubierto', 'destapando'] as const).every((fase) => f(fase, 'corte') === 'cubierto')
afirmar(cortaDeUna(siguienteFaseDelVelo) && maquinaDelVelo(siguienteFaseDelVelo), 'el corte cubre de una desde cualquier fase (la flecha), y la máquina de B12a.6 sigue igual')
controlPositivo('  el detector ve un velo que con la flecha se queda como estaba', ((f, e) => (e === 'corte' ? f : siguienteFaseDelVelo(f, e))) as SiguienteDelVelo, cortaDeUna)
// La posición, ida y vuelta por sessionStorage (en Node, uno de mentira); una guardada rota no se usa.
const almacen = new Map<string, string>()
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: (k: string) => almacen.get(k) ?? null, setItem: (k: string, v: string) => void almacen.set(k, v) } })
const idaYVuelta = (leer: () => unknown): boolean => {
  almacen.clear()
  guardarLaPosicionDelHome({ y: 15234, noche: 1, diaDelFinal: false })
  const bien = JSON.stringify(leer()) === JSON.stringify({ y: 15234, noche: 1, diaDelFinal: false })
  almacen.set('v3:posicion-del-home', JSON.stringify({ y: '15234', noche: 1, diaDelFinal: false }))
  const rota = leer()
  almacen.set('v3:posicion-del-home', '{')
  const cortada = leer()
  almacen.clear()
  return bien && rota === null && cortada === null && leer() === null
}
afirmar(idaYVuelta(posicionGuardadaDelHome), '  la posición del home va y vuelve entera (el scroll, la noche, el día del final); una rota, cortada o ausente da null (la flecha lleva arriba)')
// [B12a.8] (7) Una por entrada del historial (la clave de la Navigation API): dos entradas del home devuelven cada una la suya.
const porEntrada = (guardar: typeof guardarLaPosicionDelHome, leer: typeof posicionGuardadaDelHome): boolean => {
  almacen.clear()
  guardar({ y: 100, noche: 0, diaDelFinal: false }, 'entrada-1')
  guardar({ y: 7218, noche: 1, diaDelFinal: false }, 'entrada-2')
  const una = leer('entrada-1')?.y === 100 && leer('entrada-2')?.y === 7218 && leer('entrada-3') === null
  for (let i = 0; i < ENTRADAS_GUARDADAS + 5; i += 1) guardar({ y: i, noche: 0, diaDelFinal: false }, `otra-${String(i)}`)
  return una && leer('entrada-1') === null && leer(`otra-${String(ENTRADAS_GUARDADAS + 4)}`)?.y === ENTRADAS_GUARDADAS + 4
}
afirmar(porEntrada(guardarLaPosicionDelHome, posicionGuardadaDelHome), `  y cada entrada del historial guarda la suya (dos entradas del home: atrás, atrás, adelante devuelve la de cada una); se recuerdan las últimas ${String(ENTRADAS_GUARDADAS)}`)
controlPositivo('  el detector ve la de B12a.7 (una sola: la última pisa a la primera)', [(p: { y: number; noche: number; diaDelFinal: boolean }) => guardarLaPosicionDelHome(p, 'unica'), () => posicionGuardadaDelHome('unica')] as const, ([g, l]: readonly [(p: { y: number; noche: number; diaDelFinal: boolean }, c?: string) => void, (c?: string) => ReturnType<typeof posicionGuardadaDelHome>]) => porEntrada(g, l))
controlPositivo('  el detector ve una lectura que no valida', () => {
  try {
    return JSON.parse(sessionStorage.getItem('v3:posicion-del-home') ?? 'null') as unknown
  } catch {
    return null
  }
}, idaYVuelta)
Reflect.deleteProperty(globalThis, 'sessionStorage')
// La guarda: la limpieza de un efecto de LAYOUT (corre antes de que React saque el DOM del home); la pasiva corre con el scroll de la página.
const paginaDelHome = leerV3('page.tsx')
const deLaGuarda = leerV3('_lib/escena/ruta/GuardaDeLaPosicionDelHome.tsx')
const guardaBien = (pagina: string, guarda: string): boolean =>
  // [B12a.8] Bajo la clave de su entrada: la última en la que se estuvo en el home (se sigue con `currententrychange`, sólo con su ruta).
  /<GuardaDeLaPosicionDelHome\s*\/>/.test(pagina) && /useLayoutEffect\(\(\) => \{[\s\S]*?return \(\) => \{[\s\S]*?guardarLaPosicionDelHome\(posicionDeAhora\(\), clave\)/.test(guarda) && guarda.includes("if (window.location.pathname === RUTA_DEL_HOME) clave = claveDeLaEntrada()")
afirmar(guardaBien(paginaDelHome, deLaGuarda), 'el home guarda su posición al irse, por cualquier camino: la limpieza de un efecto de layout, con el scroll y la noche todavía suyos')
controlPositivo('  el detector ve la guarda en un efecto pasivo', [paginaDelHome, deLaGuarda.replace('useLayoutEffect(() => {', 'useEffect(() => {')] as const, ([p, g]: readonly [string, string]) => guardaBien(p, g))
// El velo: escucha la flecha, corta, trae la posición sólo hacia el home y la devuelve en el primer cuadro (antes de que la gota observe).
const delVelo = delVeloNuevo
const vueltaBien = (c: string): boolean =>
  c.includes("window.addEventListener('popstate', alUsarLaFlecha)") && /pasar\('corte'\)\s*pintar\('cubierto', 1\)/.test(c) &&
  c.includes('vuelta = destino === RUTA_DEL_HOME && !sinVuelta() ? posicionGuardadaDelHome(claveDeLaEntrada()) : null') &&
  c.includes('if (guardada !== null) devolverLosAlmacenes(guardada)') && /if \(guardada === null\) scrollDeLaRuta\(\)\s*else llevarElScrollA\(guardada\.y\)/.test(c)
afirmar(vueltaBien(delVelo), '  el velo: con la flecha corta (el color del destino), trae la posición sólo si vuelve al home, devuelve la noche y el día del final y lleva el scroll en el primer cuadro')
controlPositivo('  el detector ve un velo sordo a la flecha', delVelo.replace("window.addEventListener('popstate', alUsarLaFlecha)", ''), vueltaBien)
controlPositivo('  y uno que vuelve arriba', delVelo.replace('else llevarElScrollA(guardada.y)', 'else scrollDeLaRuta()'), vueltaBien)
// El ancla de la URL (`#trabajos`, que el viaje deja en el historial) no pisa la posición devuelta.
const delAncla = leerV3('_secciones/trabajos/portfolio/useAnclaDeLaCarga.ts')
const anclaCede = (c: string): boolean => /const irAlAncla = \(\): \(\(\) => void\) \| null => \{\s*(?:\/\/[^\n]*\n\s*)*if \(VUELTA_AL_HOME\.enCurso\) return null/.test(c)
afirmar(anclaCede(delAncla), '  el ancla de la carga del Portfolio cede durante la vuelta')
controlPositivo('  el detector ve el ancla que pisa la vuelta', delAncla.replace('if (VUELTA_AL_HOME.enCurso) return null', ''), anclaCede)
// [B12a.8] Reemplazada por la spec (4): el destape con el PRIMER cuadro estable de la página nueva (montada, con su scroll y dos cuadros
// pintados), no 20 cuadros y todos los títulos (hasta 3,5 s tapado): con la banda en el compositor lo que la página arme después no la traba.
type Destapa = typeof puedeDestapar
const esperaBien = (d: Destapa, velo: string): boolean =>
  !d(1, true, 100) && d(2, true, 100) && !d(5, false, 100) && !d(0, true, 3499) && d(0, false, 3500) && VELO.esperaMaximaMs === 3500 && VELO.cubrirMs + VELO.destaparMs <= 1100 && velo.includes('if (puedeDestapar(pintados, true, ahora - t0)) destapar()')
afirmar(esperaBien(puedeDestapar, delVelo), `el destape: la página nueva montada y ${String(VELO.cuadrosPintados)} cuadros pintados con su scroll (el primer cuadro estable), con 3,5 s de techo; cubrir y destapar, ${String(VELO.cubrirMs)} y ${String(VELO.destaparMs)} ms: una pasada de 1,2 s o menos con la página en su lugar`)
controlPositivo('  el detector ve la espera de B12a.7 (20 cuadros y todos los títulos: hasta 3,5 s tapado)', ((p, m, ms) => (p >= 20 && m) || ms >= 3500) as Destapa, (d: Destapa) => esperaBien(d, delVelo))
const deLaSincronia = leerV3('_lib/escena/titulos3d/sincronia.ts')
afirmar(deLaSincronia.includes('TITULOS_EN_CAMINO.todos = new Set([...ESPERANDO, ...COMPILANDO]).size'), '  la sincronía publica todos los títulos en camino: los que esperan (su fuente, el ocio) y los que compilan')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.8 · 13 · La intro de 2,5 pantallas, su composición (`?composicion=1|2|3`) y el texto sobre la escena (P-H33)')

// Los tramos: el del título (el marco fijo arriba, con la columna y el hueco del logo) y el de «de qué se trata»; los altos salen de las dos
// constantes (variables de CSS): calibrar la intro es cambiar el número.
const introLarga = renderToStaticMarkup(<IntroDeLaPagina titulo="Una página" bajada={<p>La bajada.</p>} deQueSeTrata={<p>De qué se trata.</p>} preset={DE_PRUEBA} />)
const tramosBien = (html: string): boolean =>
  html.includes(`--pantallas-de-la-intro:${String(PANTALLAS_DE_LA_INTRO)}`) && html.includes(`--tramo-del-titulo:${String(TRAMO_DEL_TITULO)}`) &&
  html.indexOf(`data-parte="${TRAMOS_DE_LA_INTRO.titulo}"`) < html.indexOf('<h1') && html.indexOf('<h1') < html.indexOf('data-parte="hueco-del-logo"') &&
  html.indexOf('data-parte="hueco-del-logo"') < html.indexOf(`data-parte="${TRAMOS_DE_LA_INTRO.deQueSeTrata}"`) && html.indexOf(`data-parte="${TRAMOS_DE_LA_INTRO.deQueSeTrata}"`) < html.indexOf('De qué se trata.') && html.includes('data-parte="bajada"')
afirmar(PANTALLAS_DE_LA_INTRO === 2.5 && TRAMO_DEL_TITULO > 1 && TRAMO_DEL_TITULO <= PANTALLAS_DE_LA_INTRO - 0.8 && tramosBien(introLarga), `la intro: ${String(PANTALLAS_DE_LA_INTRO)} pantallas, en orden el tramo del título (${String(TRAMO_DEL_TITULO)}: el marco de una pantalla fijo arriba, con la columna y el hueco del logo) y «de qué se trata» (el slot de la página, sobre la escena); el papel entra en la última pantalla`)
controlPositivo('  el detector ve la intro sin «de qué se trata» (la de B12a.2)', renderToStaticMarkup(<IntroDeLaPagina titulo="Una página" bajada={<p>La bajada.</p>} preset={DE_PRUEBA} />), tramosBien)
// La caída: antes de que el tramo del título se suelte (el `h1` todavía quieto): el título en volumen nunca sube con el scroll.
type Cae = typeof caeElTitulo
const caidaBien = (f: Cae): boolean => !f(900 + 400, 900, 900) && !f(900 + 181, 900, 900) && f(900 + 179, 900, 900) && f(900, 900, 900) && f(900 - 50, 900, 900)
afirmar(caidaBien(caeElTitulo) && CAIDA_DEL_TITULO.antes === 0.2, `  el título cae cuando al tramo le falta ${String(CAIDA_DEL_TITULO.antes)} pantalla para soltarse: el título en volumen nunca sube con el \`h1\` (medido en el sitio: \`scripts-carga/intro-larga.ts\`)`)
controlPositivo('  el detector ve la caída con el `h1` ya subiendo', ((fondo, fijo, alto) => fondo - fijo < -0.3 * alto) as Cae, caidaBien)

// La bandera de la composición, después de hidratar (el servidor pinta la de por defecto, la 3: la del hero del home).
type Bandera = typeof composicionDeLaBandera
const composicionBien = (f: Bandera): boolean => f('1') === '1' && f('2') === '2' && f('3') === '3' && f(null) === COMPOSICION_POR_DEFECTO && f('4') === COMPOSICION_POR_DEFECTO && COMPOSICION_POR_DEFECTO === '3'
afirmar(Object.keys(COMPOSICIONES).join() === '1,2,3' && composicionBien(composicionDeLaBandera), 'tres composiciones detrás de `?composicion=1|2|3` (1: el título centrado arriba del logo; 2: a la derecha; 3: a la izquierda, como el hero del home, la de por defecto); cualquier otra cosa, la de por defecto')
controlPositivo('  el detector ve una bandera que no cae en la de por defecto', ((v) => (v === '2' ? '2' : v === '3' ? '3' : '1')) as Bandera, composicionBien)

// El encuadre: el logo no se mueve en la escena; la cámara corre el blanco para que el centro del logo caiga en el del hueco, en cada pose
// de la pista (la pose 2 se estira entera) y a cualquier aspecto. Con la cámara del rig (`armarLaCamara`) y la caja proyectada del logo.
const LOGO = { w: 6.863, h: 4.779 }
const enElHueco = (encuadre: typeof encuadreDelHueco): boolean =>
  [1440 / 900, 1280 / 800, 1024 / 768].every((aspecto) =>
    [0, 0.5, 1].every((avance) =>
      [{ x: 0, y: -0.3 }, { x: -0.5, y: 0.05 }, { x: 0.5, y: 0.05 }].every((hueco) => {
        const pose = poseEn(PISTA_DE_LA_INTRO, avance)
        const e = encuadre(pose, hueco, aspecto, CAMERA_FOV, LOGO.w, LOGO.h)
        const c = cajaProyectada(armarLaCamara(new THREE.PerspectiveCamera(), { ...pose, frameX: e.frameX, frameY: e.frameY }, aspecto, CAMERA_FOV, LOGO.w, LOGO.h), LOGO.w, LOGO.h)
        return Math.abs(c.x - hueco.x) < 0.002 && Math.abs(c.y - hueco.y) < 0.002
      }),
    ),
  )
afirmar(enElHueco(encuadreDelHueco), 'el encuadre de la composición: el centro del logo en el del hueco (± 0,1 % del cuadro), en los avances 0, 0,5 y 1 de la pose 2 y a 1440 × 900, 1280 × 800 y 1024 × 768; el logo no se mueve en la escena (el ángulo, la altura y la distancia son los de la pista)')
controlPositivo('  el detector ve la pista sin encuadre (el logo en el medio)', (() => ({ frameX: 0, frameY: 0 })) as typeof encuadreDelHueco, enElHueco)
const conHueco = (hueco: { readonly x: number; readonly y: number } | null): MutableChoreoPose => {
  const p: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
  COMPOSICION_EN_LA_ESCENA.hueco = hueco
  poseDeLaIntro(buildTrack(PISTA_DE_LA_INTRO), 0, p, 1.6, CAMERA_FOV, LOGO.w, LOGO.h)
  COMPOSICION_EN_LA_ESCENA.hueco = null
  return p
}
afirmar(conHueco(null).frameX === 0 && conHueco({ x: 0.5, y: 0 }).frameX > 0.1 && conHueco({ x: -0.5, y: 0 }).frameX < -0.1 && huecoEnElCuadro({ izquierda: 720, arriba: 0, ancho: 720, alto: 900 }, 1440, 900).x === 0.5, '  la pose de la intro (la que lee el rig): sin hueco medido, la pista; con el hueco a la derecha o a la izquierda, el encuadre que lo lleva ahí')

// El DOM: la columna (el título y la bajada) y el hueco, y la fila de «de qué se trata» con la MISMA columna (el mismo eje por construcción).
const composicion = leerV3('_componentes/pagina/ComposicionDeLaIntro.tsx')
const columnaBien = (c: string): boolean =>
  /'2': '[^']*escritorio:col-start-2 escritorio:row-start-1 escritorio:items-start escritorio:self-center/.test(c) && /'3': '[^']*escritorio:col-start-1 escritorio:row-start-1 escritorio:items-start escritorio:self-center/.test(c) &&
  /'1': '@container flex w-full flex-col items-center/.test(c) && c.includes('<div className="flex max-w-[42ch] flex-col gap-[var(--spacing-3)]">{children}</div>') && (c.match(/className=\{COLUMNA\[id\]\}/g) ?? []).length === 2 && /'2': 'h-full min-h-0 w-full escritorio:col-start-1/.test(c) && /'3': 'h-full min-h-0 w-full escritorio:col-start-2/.test(c)
afirmar(columnaBien(composicion), '  el marco: en la 1 (y abajo de 1024 en las tres) la columna centrada arriba y el hueco debajo; desde 1024, en la 2 la columna a la derecha y el hueco a la izquierda, en la 3 al revés; «de qué se trata» con la misma columna (el mismo borde; medido: 0,00 % de desvío)')
// [B12a.8] T4 · De costado, 8 vw de aire del lado de afuera (el título fijo en el mundo crece hacia ese borde con el mouse en el extremo:
// sin el aire se salía hasta 100 px a 1280; medido con `scripts-carga/titulo-3d.ts`); y la bajada en el plano de su título, como el hero.
const aireBien = (c: string): boolean => /'2': '[^']*escritorio:self-center escritorio:pr-\[8vw\]'/.test(c) && /'3': '[^']*escritorio:self-center escritorio:pl-\[8vw\]'/.test(c) && !/'1': '[^']*escritorio:p[lr]-/.test(c)
afirmar(aireBien(composicion), '  T4 · las de costado dejan 8 vw de aire afuera (el título en perspectiva no se sale del cuadro con el mouse en el extremo); la 1, no')
controlPositivo('  el detector ve la 3 sin el aire (se salía 98 px a 1280)', composicion.replace(' escritorio:pl-[8vw]', ''), aireBien)
const deLaBajada = leerV3('_componentes/pagina/BajadaDeLaIntro.tsx')
const bajadaBien = (b: string, intro: string): boolean => /const ref = useAcompananteDelTitulo<HTMLDivElement>\(idDeLaParte\(id, 1\)\)/.test(b) && /<div ref=\{ref\} data-parte="bajada"/.test(b) && intro.includes('<BajadaDeLaIntro id={preset.id}>{bajada}</BajadaDeLaIntro>')
afirmar(bajadaBien(deLaBajada, leerV3('_componentes/pagina/IntroDeLaPagina.tsx')), '  T4 · la bajada va en el plano de su título (`useAcompananteDelTitulo`, el de la bajada del hero): con el mouse en un costado el título no la pisa')
controlPositivo('  el detector ve la bajada quieta en el DOM (la pisaba hasta 120 px)', deLaBajada.replace('<div ref={ref} data-parte="bajada"', '<div data-parte="bajada"'), (b: string) => bajadaBien(b, leerV3('_componentes/pagina/IntroDeLaPagina.tsx')))
const ultima = composicion.lastIndexOf('className={COLUMNA[id]}')
controlPositivo('  el detector ve «de qué se trata» con otra columna', `${composicion.slice(0, ultima)}className="flex flex-col"${composicion.slice(ultima + 'className={COLUMNA[id]}'.length)}`, columnaBien)

// [B12a.8] Reemplazada por la spec (T5): sin el velo radial detrás del texto (formaba una mancha; no se pidió). P-H33 · el texto del DOM
// sobre la escena lleva sólo una sombra PEGADA a las letras (corta y densa, sin colas), en la bajada, «de qué se trata» y las partes del
// `h1` (que se apagan con el título en volumen); nunca en el `h1` mismo, y ningún pseudo-elemento ni fondo en la intro.
const hojaDeLaIntro = leer('_estilos/intro.css')
const sombraDeLaIntroBien = (h: string): boolean =>
  h.includes("[data-v3] [data-intro-de-pagina] [data-parte='bajada'],") && h.includes("[data-v3] [data-intro-de-pagina] [data-parte='de-que-se-trata'] [data-parte='columna-de-la-intro'],") &&
  h.includes("[data-v3] [data-intro-de-pagina] h1 [data-parte^='titulo-'] {") && /text-shadow: var\(--sombra-de-la-intro\)/.test(h) &&
  !/::before|::after|background|radial-gradient/.test(h.replace(/\/\*[\s\S]*?\*\//g, '')) && !/(\d+(\.\d+)?)em/.test((/--sombra-de-la-intro:([^;]*);/.exec(h)?.[1] ?? '').replace(/0\.0[0-9]em|0\.1[0-9]em/g, '')) &&
  leer('layout.tsx').includes("import './_estilos/intro.css'")
afirmar(sombraDeLaIntroBien(hojaDeLaIntro), 'P-H33 · T5 · el texto de la intro sobre la escena: sin velo ni mancha detrás; una sombra pegada a las letras (desenfoques de 0,2 em o menos, `intro.css` por el layout) en la bajada, «de qué se trata» y las partes del `h1`')
controlPositivo('  el detector ve el velo radial de antes', `${hojaDeLaIntro}\n[data-v3] [data-intro-de-pagina] [data-parte='bajada']::before { background: radial-gradient(closest-side, black 55%, transparent); }`, sombraDeLaIntroBien)
controlPositivo('  y una sombra con cola larga (la mancha)', hojaDeLaIntro.replace('0 0 0.12em var(--color-fondo);', '0 0 0.12em var(--color-fondo), 0 0 0.9em var(--color-fondo);'), sombraDeLaIntroBien)

// P-H33 · T4 y T5 · el título en volumen: de noche, en papel (el claro, como su `h1`), sin halo ni placa detrás (se lee por su volumen, su
// material y su luz) y FIJO EN EL MUNDO como la mayoría de los títulos del home (`parteDelMouse` 0): la cámara lo muestra en perspectiva
// con el mouse, con sus mismos topes y suavizado. Pegado a la pantalla (B12a.6) se veía plano, como el `h1`.
const tituloDeNocheBien = (titulo: string, sincronia: string): boolean =>
  /parteDelMouse: pegadoAlH1\(\) \? 1 : 0, material: deNoche && !tituloDeTinta\(\) \? 'blanco' : undefined, activo \} as const/.test(titulo) && !/halo/i.test(titulo.replace(/\/\/[^\n]*/g, '')) &&
  sincronia.includes('const a = armar(titulo, titulo.material ?? t.variante)') && sincronia.includes('a.material === b.material\n') && !existsSync(path.join(V3, '_lib/escena/titulos3d/haloDelTitulo.ts'))
afirmar(tituloDeNocheBien(delTitulo, leerV3('_lib/escena/titulos3d/sincronia.ts')), '  T4 · el título de una página va fijo en el mundo (la perspectiva del home con el mouse) y, de noche, en papel y sin halo (la tinta daba 0,6 % de sus píxeles en 3:1); un cambio de material lo rearma')
controlPositivo('  el detector ve el título pegado a la pantalla (el de B12a.6: plano con el mouse)', delTitulo.replace('parteDelMouse: pegadoAlH1() ? 1 : 0', 'parteDelMouse: 1'), (t: string) => tituloDeNocheBien(t, leerV3('_lib/escena/titulos3d/sincronia.ts')))
// T4 · la salida como en el home, a cualquier velocidad: el que sale cayendo cae DONDE ESTABA (el corrimiento de cuando empezó, también
// para saber si está fuera del cuadro). La intro suelta su bloque fijo a mitad de la caída (2,4 s, el mínimo del titular): el título subía
// 260–310 px mientras se acostaba, con la rueda rápida, humana o lenta (medido en el build).
const deLosTitulos = leerV3('_lib/escena/titulos3d/TitulosDeVolumen.tsx')
const caeEnSuLugar = (c: string): boolean =>
  c.includes('const cae = a.titulo.saleCayendo === true && a.cayendo && m.llegada < 1') && c.includes('a.corrimientoDeLaCaida = cae ? (a.corrimientoDeLaCaida ?? d) : null') &&
  c.includes('if (visible) ubicar(a, a.corrimientoDeLaCaida ?? d, viva)') && c.includes('const fuera = fueraDelCuadro(a, a.corrimientoDeLaCaida ?? d)')
afirmar(caeEnSuLugar(deLosTitulos), '  T4 · el título que sale cayendo cae donde estaba: su lugar puede irse con el scroll a mitad de la caída, él no (ni se apaga por eso)')
controlPositivo('  el detector ve el que se va con su lugar mientras cae (el de B1.2b)', deLosTitulos.replace('if (visible) ubicar(a, a.corrimientoDeLaCaida ?? d, viva)', 'if (visible) ubicar(a, d, viva)'), caeEnSuLugar)
controlPositivo('  y el que se apaga al irse su lugar', deLosTitulos.replace('const fuera = fueraDelCuadro(a, a.corrimientoDeLaCaida ?? d)', 'const fuera = fueraDelCuadro(a, d)'), caeEnSuLugar)
controlPositivo('  y el título de la tinta del entorno', delTitulo.replace("material: deNoche && !tituloDeTinta() ? 'blanco' : undefined, ", ''), (t: string) => tituloDeNocheBien(t, leerV3('_lib/escena/titulos3d/sincronia.ts')))

// T5 · Las dos opciones de legibilidad sin velo, sólo detrás de `?legibilidad=` (Valentino elige mirando; sin la bandera, ninguna): `peso`
// (la parte liviana un paso más pesada: 125/400) y `tamano` (el título más grande en la 1 desde 1024). `luz` y `motas` se probaron y se
// sacaron: medidas en el build, no movían el número (94,2 → 94,0 y 93,9 %).
type DeLaBandera = typeof legibilidadDeLaBandera
const legibilidadBien = (f: DeLaBandera, titulo: string, hoja: string, marco: string): boolean =>
  f(null) === null && f('') === null && f('luz') === null && f('motas') === null && f('peso') === 'peso' && f('tamano') === 'tamano' && MAS_PESADA['archivo-125-300'] === 'archivo-125-400' &&
  titulo.includes("const preset = legibilidad === 'peso' ? { ...familia, fuentes: [familia.fuentes[0], MAS_PESADA[familia.fuentes[1]] ?? familia.fuentes[1]] as const } : familia") &&
  /'1': '[^']*escritorio:\[--ancho-del-titulo:74cqw\] escritorio:data-\[legibilidad=tamano\]:\[--ancho-del-titulo:80cqw\]'/.test(marco) && !/'[23]': '[^']*legibilidad/.test(marco) &&
  marco.includes('data-legibilidad={legibilidad ?? undefined}') && !/legibilidad/.test(hoja)
const conLasOpciones = (f: DeLaBandera): boolean => legibilidadBien(f, delTitulo, hojaDeLaIntro, leerV3('_componentes/pagina/ComposicionDeLaIntro.tsx'))
afirmar(conLasOpciones(legibilidadDeLaBandera), '  T5 · las dos opciones sin velo (`?legibilidad=peso|tamano`) sólo con la bandera: sin ella, el título como es')
controlPositivo('  el detector ve una opción prendida sin la bandera', ((v: string | null) => (v === null ? 'peso' : legibilidadDeLaBandera(v))) as DeLaBandera, conLasOpciones)

// T1 · El título protagonista: en UNA línea, del tamaño que le da la parte del ancho que pone la composición entre su ancho en em.
type MetricasEnJson = Readonly<Record<string, { readonly avance: Readonly<Record<string, number>>; readonly kerning: Readonly<Record<string, number>> }>>
const metricas = JSON.parse(leer('_fuentes/metricas-del-titulo.json')) as MetricasEnJson
type FuenteConKerning = { readonly glyphs: Readonly<Record<string, { readonly ha: number }>>; readonly resolution: number; readonly kerning?: Readonly<Record<string, number>> }
// El mismo ancho contado con la fuente 3D (el JSON entero): las métricas chicas son las de la misma instancia.
const anchoDelJson = (texto: string, f: FuenteDePagina): number => {
  const j = JSON.parse(leer(`_fuentes/${f}-pagina.json`)) as FuenteConKerning
  const l = [...texto]
  return l.reduce((s, c, i) => s + (j.glyphs[c]?.ha ?? 0) / j.resolution + (i + 1 < l.length ? (j.kerning?.[c + (l[i + 1] ?? '')] ?? 0) / j.resolution : 0), 0)
}
const metricasBien = (ancho: typeof anchoEnEm): boolean =>
  Object.keys(metricas).sort().join() === [...USADAS].sort().join() && USADAS.every((f) => NOMBRES.every((n) => Math.abs(ancho(n, f) - anchoDelJson(n, f)) < 1e-3))
afirmar(metricasBien(anchoEnEm), `T1 · el ancho del título en em sale de las métricas de cada instancia (\`metricas-del-titulo.json\`, del generador): el mismo que da la fuente 3D, con su kerning, para los ${String(NOMBRES.length)} nombres y las ${String(USADAS.length)} instancias`)
controlPositivo('  el detector ve un ancho sin el kerning', ((texto: string, f: FuenteDePagina) => [...texto].reduce((s, c) => s + (metricas[f]?.avance[c] ?? 0), 0)) as typeof anchoEnEm, metricasBien)
const unaLinea = (html: string): boolean => {
  const partes = partesDelTitulo('IA y automatizaciones')
  return /<h1[^>]*class="[^"]*whitespace-nowrap/.test(html) && html.includes(`--em-del-titulo:${anchoDelTitulo(partes, TITULO_DE_PAGINA).toFixed(4)}`) && html.includes('font-size:calc(var(--ancho-del-titulo, 60vw) / var(--em-del-titulo))')
}
afirmar(unaLinea(conPartes('IA y automatizaciones')), '  el `h1` va en una línea (nunca una palabra sola en un renglón) y su tamaño es la parte del ancho entre su ancho en em: el servidor ya lo pinta así (sin medir el DOM ni saltar al cargar)')
controlPositivo('  el detector ve el título de B12a.4 (dos renglones, del tamaño del nivel)', conPartes('IA y automatizaciones').replace('whitespace-nowrap', 'flex flex-col'), unaLinea)
const partesDelAncho = (c: string): boolean =>
  (c.match(/'@container flex w-full flex-col items-center gap-\[var\(--spacing-4\)\] \[--ancho-del-titulo:97cqw\]/g) ?? []).length === 3 && c.includes('escritorio:[--ancho-del-titulo:74cqw]')
afirmar(partesDelAncho(composicion), '  la parte del ancho, de la columna (el contenedor del título): el 74 % en la 1 desde 1024 (del cuadro, pedido de 60 a 75 %), el 97 % de una columna de costado y del ancho útil abajo de 1024 (pedido: al menos 85); medido en el sitio con los tres nombres (`scripts-carga/composicion.ts`)')
controlPositivo('  el detector ve la columna sin contenedor (el título del tamaño del cuadro entero)', composicion.split('@container ').join(''), partesDelAncho)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.8 · 14 · La navbar en todas las rutas (3, T2), los avisos del velo y la vuelta del bfcache (P-H35)')

// «Home» primero; «Servicios» es un enlace (a la sección del home) y la lista abre aparte, sin «Todos los servicios».
const homeBien = (enlaces: readonly { readonly id: string; readonly destino: string }[], desde: typeof destinoDesde): boolean =>
  enlaces[0]?.id === HOME.id && HOME.rotulo === 'Home' && desde('/v3', HOME.destino) === HOME.destino && desde('/v3/pagina-base', HOME.destino) === '/v3' && desde('/v3/pagina-base', SERVICIOS_DEL_HOME.destino) === '/v3#servicios' && desde('/v3/pagina-base', '#trabajos') === '/v3#trabajos'
afirmar(homeBien(ENLACES_DEL_HOME, destinoDesde), '«Home» va primero: en el home, el viaje al hero; desde una página, el home arriba (sin ancla); «Servicios» lleva a la sección del home (desde una página, con el velo)')
controlPositivo('  el detector ve la barra de B12a.5 (sin «Home»)', ENLACES_DEL_HOME.slice(1), (e: readonly { readonly id: string; readonly destino: string }[]) => homeBien(e, destinoDesde))
const delDesplegable = leerV3('_chrome/barra/DesplegableDeServicios.tsx')
const desplegableBien = (c: string, items: readonly { readonly id: string }[]): boolean =>
  items.length === PAGINAS_DE_SERVICIO.length && items.every((i) => i.id !== SERVICIOS_DEL_HOME.id) && !/Todos los servicios/.test(c) &&
  /<EnlaceDeRuta\s+ref=\{refDelEnlace\}\s+href=\{destinoDesde\(ruta, SERVICIOS_DEL_HOME\.destino\)\}/.test(c) && /onKeyDown=\{alTeclearElEnlace\}/.test(c) && /if \(e\.key !== 'ArrowDown'\) return/.test(c) &&
  /data-parte="abrir-servicios"\s+aria-label="Las páginas de servicio"\s+aria-expanded=\{abierto\}\s+aria-controls=\{ID_DEL_DESPLEGABLE\}/.test(c) && /onPointerEnter=\{alEntrar\} onPointerLeave=\{alSalir\}/.test(c) && /intencionMs: 180/.test(c)
afirmar(desplegableBien(delDesplegable, ITEMS_DEL_DESPLEGABLE), '  la lista: sólo las páginas de servicio; abre con el hover con intención (180 ms), con la flecha abajo sobre «Servicios» y con Enter en la flechita del costado (el foco entra a la lista)')
controlPositivo('  el detector ve la lista de B12a.5 (con «Todos los servicios»)', [SERVICIOS_DEL_HOME, ...ITEMS_DEL_DESPLEGABLE] as const, (i: readonly { readonly id: string }[]) => desplegableBien(delDesplegable, i))
const delPanel = leerV3('_chrome/menu/PanelDelMenu.tsx')
const acordeonBien = (c: string): boolean =>
  /<EnlaceDeRuta href=\{destinoDesde\(ruta, enlace\.destino\)\} data-parte="item-del-menu" onClick=\{alCerrar\} className=\{cn\(CLASE_DEL_ITEM, 'flex-1'\)\}>/.test(c) && /data-parte="abrir-el-acordeon" aria-label="Las páginas de servicio" aria-expanded=\{servicios\}/.test(c)
afirmar(acordeonBien(delPanel), '  en el teléfono: «Servicios» navega y la flechita de al lado abre el acordeón con las páginas')
controlPositivo('  el detector ve el acordeón de B12a.5 («Servicios» sólo abre)', delPanel.replace("className={cn(CLASE_DEL_ITEM, 'flex-1')}", "className={CLASE_DEL_ITEM}"), acordeonBien)

// T2 · dónde nace la píldora: en el home, abajo (el gesto del hero); en una página, arriba y quieta (`?navbar=abajo`, la del home).
const nacimientoBien = (f: typeof nacimientoDeLaPildora, hoja: string): boolean =>
  f('/v3', null) === 'abajo' && f('/v3', 'arriba') === 'abajo' && f('/v3/pagina-base', null) === 'arriba' && f('/v3/pagina-base', 'abajo') === 'abajo' && f(null, null) === 'abajo' &&
  /\[data-pieza="barra"\]\[data-nacimiento="arriba"\] \{\s*top: 0;/.test(hoja) && /\[data-nacimiento="arriba"\] > \[data-parte="pastilla"\] \{\s*top: var\(--barra-reposo\);/.test(hoja)
const hojaDeLaBarra = leer('_estilos/barra.css')
afirmar(nacimientoBien(nacimientoDeLaPildora, hojaDeLaBarra), 'T2 · la píldora: en el home nace al pie y sube con el scroll; en una página, ARRIBA desde el principio (donde queda en el home) y quieta; `?navbar=abajo`, la del home para comparar')
controlPositivo('  el detector ve la píldora de B12a.5 (al pie también en las páginas)', (() => 'abajo') as typeof nacimientoDeLaPildora, (f: typeof nacimientoDeLaPildora) => nacimientoBien(f, hojaDeLaBarra))
// Mientras pasa el velo, la píldora se desliza de su lugar al del destino: el velo avisa cuándo cubre y cuándo la página nueva tiene su scroll.
// [B12a.8] La sonda (`scripts-carga/sonda-pildora.ts`) encontró que el layout la ponía en su lugar nuevo un cuadro antes del aviso del
// scroll: saltaba y volvía. Ahora, en el cambio de ruta (un efecto de layout, antes de pintar), se la retiene donde estaba.
const delaBarra = leerV3('_chrome/barra/useDeslizDeLaPildora.ts')
// [B12a.8] Reemplazada por la spec: arranca al DESTAPAR (`destapa`, en un cuadro del rAF), no con `repuso` en medio del montaje del home
// (la animación tomaba la hora del cuadro trabado y aparecía por el 72 %: un salto de 24 a 606 px, medido en el build con `velo.ts`).
const deslizBien = (barra: string, velo: string): boolean =>
  velo.includes('window.dispatchEvent(new Event(EVENTOS_DEL_VELO.cubre))') && velo.includes('window.dispatchEvent(new Event(EVENTOS_DEL_VELO.repuso))') && /pasar\('llego'\)\s*window\.dispatchEvent\(new Event\(EVENTOS_DEL_VELO\.destapa\)\)/.test(velo) &&
  barra.includes('window.addEventListener(EVENTOS_DEL_VELO.cubre, alCubrir)') && barra.includes('window.addEventListener(EVENTOS_DEL_VELO.destapa, alDestapar)') && !barra.includes('EVENTOS_DEL_VELO.repuso,') &&
  barra.includes("animacion.current = el.animate([{ translate: `0 ${corrida.toFixed(1)}px` }, { translate: '0 0' }]") && barra.includes('retenida.current = el.animate(') && /useLayoutEffect\(\(\) => \{[\s\S]*?\}, \[pastilla, ruta\]\)/.test(barra) &&
  leerV3('_chrome/barra/BarraDelHome.tsx').includes('useDeslizDeLaPildora(pastillaRef, ruta)') && new Set(Object.values(EVENTOS_DEL_VELO)).size === 4
afirmar(deslizBien(delaBarra, delVeloNuevo), '  y entre una ruta y otra se desliza: el velo avisa cuándo cubre (se toma dónde está); al cambiar la ruta se la retiene ahí, y al destapar se anima a su lugar')
controlPositivo('  el detector ve la píldora que arranca con `repuso` (el salto medido)', delaBarra.replace('window.addEventListener(EVENTOS_DEL_VELO.destapa, alDestapar)', 'window.addEventListener(EVENTOS_DEL_VELO.repuso, alDestapar)'), (b: string) => deslizBien(b, delVeloNuevo))

// P-H35 · una página que vuelve del bfcache: la salida de la variante se olvida (vuelve a su avance) y el velo queda quieto.
const deLaRanura = leerV3('_lib/escena/ruta/RanuraDeLaVariante.tsx')
const bfcacheBien = (ranura: string, velo: string): boolean =>
  /window\.addEventListener\('pageshow', alVolver\)/.test(ranura) && /if \(!e\.persisted \|\|[^\n]*\) return/.test(ranura) && /saliendo\.current = false\s*salida\.current = null/.test(ranura) &&
  /window\.addEventListener\('pageshow', alVolverDelBfcache\)/.test(velo) && /if \(!e\.persisted\) return[\s\S]*?pintar\('quieto', 0\)/.test(velo)
afirmar(bfcacheBien(deLaRanura, delVeloNuevo), 'P-H35 · al volver del bfcache (la flecha, después de una navegación que cambió de documento) la variante vuelve a su avance (la salida que se pidió al irse se olvida) y el velo queda quieto; medido en el build (`scripts-carga/bfcache.ts`)')
controlPositivo('  el detector ve la ranura de B12a.3 (sin escuchar el bfcache)', deLaRanura.replace("window.addEventListener('pageshow', alVolver)", ''), (r: string) => bfcacheBien(r, delVeloNuevo))

// [B12a.8] (4) Lo que el home arma al montarse y no se ve espera al velo quieto. Medido en el build (`scripts-carga/velo.ts`, Long Animation
// Frames) llegando al home desde la página: la frase 3D del CTA del final (~360 ms, dos veces), las piezas del pie (~165 ms) y el ocio de
// los títulos (~369 ms) se armaban mientras el velo tapaba y destapaba (tapado entero ~900 ms, cuadros de 400 ms al destapar).
type Espera = typeof esperaAlVelo
type Cuando = typeof cuandoElVeloQuede
const lugar = (top: number): Element => ({ getBoundingClientRect: () => ({ top, bottom: top + 200 }) }) as unknown as Element
const ventanaDePrueba = Object.assign(new EventTarget(), { innerHeight: 900 })
Object.defineProperty(globalThis, 'window', { configurable: true, value: ventanaDePrueba })
const esperaFuncionaBien = (espera: Espera, cuando: Cuando): boolean => {
  VELO_EN_CURSO.activo = false
  let corrio = 0
  cuando(() => (corrio += 1))
  const quietoEnElActo = corrio === 1 && !espera([lugar(9000)])
  VELO_EN_CURSO.activo = true
  const lejos = espera([lugar(9000)]) && espera([null]) && !espera([lugar(300)]) && !espera([lugar(9000), lugar(-100)])
  cuando(() => (corrio += 1))
  const cancelar = cuando(() => (corrio += 10))
  cancelar()
  const antes = corrio
  VELO_EN_CURSO.activo = false
  ventanaDePrueba.dispatchEvent(new Event(EVENTOS_DEL_VELO.quieto))
  return quietoEnElActo && lejos && antes === 1 && corrio === 2
}
afirmar(esperaFuncionaBien(esperaAlVelo, cuandoElVeloQuede), '(4) con el velo en curso, una obra espera si ninguno de sus lugares está a la vista (media pantalla de margen) y corre al quedar quieto (cancelable); con el velo quieto, en el acto')
controlPositivo('  el detector ve la espera que no exceptúa lo que está a la vista (la vuelta al pie con la flecha armaría el pie después de destapar)', (() => VELO_EN_CURSO.activo) as Espera, (e: Espera) => esperaFuncionaBien(e, cuandoElVeloQuede))
Reflect.deleteProperty(globalThis, 'window')
const delCta = leerV3('_lib/escena/ctaDelFinal/EscenaDelCta.tsx')
const delPie = leerV3('_lib/escena/pie3d/PieDeVolumen.tsx')
const delOcio = leerV3('_lib/escena/titulos3d/ocio.ts')
const obrasBien = (cta: string, pie: string, ocio: string, velo: string): boolean =>
  /valores\.some\(\(el\) => el === null \|\| el\.offsetWidth === 0\) \|\| esperaAlVelo\(\[destino\]\)\) \{\s*espera = window\.setTimeout\(intentar, 250\)/.test(cta) &&
  /if \(esperaAlVelo\(\[\.\.\.PIEZAS_DEL_PIE\.values\(\)\]\.map\(\(p\) => p\.elemento\)\)\) \{\s*pedir\(\)\s*return\s*\}\s*rearmar\(s, g, s\.estudio\)/.test(pie) &&
  /const sinElVelo = cuandoElVeloQuede\(\(\) => \{[\s\S]*?requestIdleCallback\(f/.test(ocio) &&
  /VELO_EN_CURSO\.activo = f !== 'quieto'\s*if \(enCurso && f === 'quieto'\) window\.dispatchEvent\(new Event\(EVENTOS_DEL_VELO\.quieto\)\)/.test(velo)
afirmar(obrasBien(delCta, delPie, delOcio, delVeloNuevo), '  la frase del CTA del final, las piezas del pie y el ocio de los títulos esperan al velo; el velo marca cuándo está en curso y avisa al quedar quieto')
controlPositivo('  el detector ve el CTA del final que se arma con el velo encima', delCta.replace(' || esperaAlVelo([destino])', ''), (c: string) => obrasBien(c, delPie, delOcio, delVeloNuevo))
// [B12a.8] (4) El papel de la carga del home, sólo en la carga del documento: llegando al home por la navegación cliente, el velo de la
// carga (opaco, encima del chrome) se volvía a montar y tapaba todo hasta su seguro (16 cuadros en blanco a «Portfolio», en el build).
const deLaCarga = leerV3('_componentes/VeloDeCarga.tsx')
const cargaBien = (c: string): boolean => /const \[deUnaNavegacion\] = useState\(hayPrimerCuadro\)/.test(c) && /useState<Etapa>\(deUnaNavegacion \? 'fuera' : 'espera'\)/.test(c) && /if \(deUnaNavegacion\) abrirLaCarga\(\)/.test(c)
afirmar(cargaBien(deLaCarga), '(4) el papel de la carga del home sólo en la carga del documento: llegando por la navegación cliente (la escena ya pintó) arranca fuera y abre la carga en el acto (medido: 0 cuadros en blanco)')
controlPositivo('  el detector ve el papel que arranca en espera siempre (el de B12a.7)', deLaCarga.replace("useState<Etapa>(deUnaNavegacion ? 'fuera' : 'espera')", "useState<Etapa>('espera')"), cargaBien)

cerrar('s78-b12a')
