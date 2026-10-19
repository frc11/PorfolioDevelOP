/**
 * s78 · B12a · LA ESCENA CONSCIENTE DE LA RUTA (`docs/rediseno/SPRINT-B12a.md`), sin navegador. B12a.1: el preset que declara la página
 * (D1), la escena que duerme en una subruta sin preset y en el papel (D8), y el home con su preset de siempre. Cada afirmación con su
 * control positivo. Lo medido en el sitio (`/v3/tipografia` en reposo: ≤ 50 ms/s de tareas y 0 cuadros de más de 50 ms) lo corre la
 * sonda de Fase 0 (`scratchpad/ph/costo-subruta.ts`).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { PresetDeLaPagina } from '../escena/ruta/PresetDeLaPagina'
import { PRESET_DEL_HOME, apilarElPreset, despiertaEnLaPagina, presetActual, type CajaVertical, type PresetDeLaEscena } from '../escena/ruta/preset'
import { MARGEN_DE_REANUDACION } from '../escena/visibilidad'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B12a.1 · 1 · El preset de la página (D1): lo declara la página, en una pila')

const DE_PRUEBA: PresetDeLaEscena = { id: 'prueba', tramos: { intro: '[data-intro-de-pagina]', pie: null }, noche: 'noche', acento: null }
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
  /if \(secciones === null\) \{\s*const preset = presetActual\(\)\s*const despierta = !hayPrimerCuadro\(\) \|\| despiertaEnLaPagina\(preset, bloquesDelPreset\(document, preset, desplazamiento\), desplazamiento, ventana, MARGEN_DE_REANUDACION\)/.test(a) &&
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

cerrar('s78-b12a')
