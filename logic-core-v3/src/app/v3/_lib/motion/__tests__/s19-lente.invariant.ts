/**
 * INVARIANTE — B6-A · EL LENTE DE LA ESCENA.
 *
 *     npx tsx src/app/v3/_lib/motion/__tests__/s19-lente.invariant.ts
 *     npm run test:s19-lente
 *
 * Mide que (1) el FOV que el lente espeja sea el de la cámara —el guardián del
 * espejo—, (2) la `perspective` sea el foco de esa cámara en alturas de
 * ventana y nada más, (3) con ese foco los −3000 px con los que P7 arranca
 * caigan en la pared del fondo de la celosía y no detrás de la sala, (4) el
 * origen del lente sea el centro del viewport en coordenadas del bloque, y (5)
 * el contrato lo consuma y Trabajos lo pida, sin que el árbol quieto importe un
 * valor del sistema de motion.
 *
 * ⚠ NO mide cómo se VE el plano viniendo de adentro: eso es captura y va al
 * reporte. Acá se afirma la aritmética y el cableado.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../../escena/choreography'
import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../../escena/probeMoire'
import { CAMERA_FOV } from '../../escena/probeScene'
import { FOCO_EN_ALTOS_DE_VENTANA, FOV_DE_LA_ESCENA, origenDeLaLente, perspectivaDeLaEscena } from '../lente'
import { PATRONES } from '../patrones'

const RAIZ = process.cwd()
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EL ESPEJO — el FOV del lente es el de la cámara, al bit')

afirmarIgual(FOV_DE_LA_ESCENA, CAMERA_FOV, '`FOV_DE_LA_ESCENA` ES `CAMERA_FOV`: el espejo no envejeció')
controlPositivo('el guardián vería un espejo viejo', CAMERA_FOV + 1, (fov: number) => fov === FOV_DE_LA_ESCENA)

const foco = 0.5 / Math.tan((CAMERA_FOV * Math.PI) / 360)
afirmar(Math.abs(FOCO_EN_ALTOS_DE_VENTANA - foco) < 1e-12, 'el foco es (1/2) / tan(FOV/2), recalculado acá desde `CAMERA_FOV`', foco.toFixed(6))
afirmarIgual(Math.round(foco * 900), 1427, 'a 900 de alto el foco mide 1427 px')
afirmarIgual(Math.round(foco * 1080), 1713, 'y a 1080, 1713 px (1712,6)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LA PERSPECTIVA — una cadena sobre svh, con el foco y nada más')

afirmarIgual(perspectivaDeLaEscena(), `calc(100svh * ${foco.toFixed(4)})`, 'la perspectiva es `calc(100svh * foco)` con cuatro decimales')
afirmar(!/\d+px/.test(perspectivaDeLaEscena()), '  y no lleva un píxel escrito: escala con la ventana, como el canvas fijo')
controlPositivo(
  'la cadena de otro FOV sería otra cadena: el foco no es un número copiado',
  0.5 / Math.tan(((CAMERA_FOV + 10) * Math.PI) / 360),
  (otro: number) => `calc(100svh * ${otro.toFixed(4)})` === perspectivaDeLaEscena(),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · DÓNDE CAE −3000 — en la pared del fondo, no detrás de la sala')

/**
 * P7 no cambió un valor: se afirma sobre el fuente del patrón que los planos
 * siguen arrancando en −3000 y que el patrón sigue declarando sus 1000 px. Lo
 * que cambia es el lente, y con el lente cambia a qué profundidad de la SALA
 * cae ese −3000. Un `translateZ` de −Z px, con perspectiva f, se ve a
 * (f + Z) / f veces la distancia del plano de pantalla; si el plano de
 * pantalla es el del sujeto —el logo, a la distancia ojo-objeto del keyframe—
 * la profundidad se lee en unidades de la sala.
 */
const FUENTE_DE_P7 = leer('src/app/v3/_lib/motion/patrones-piezas.ts')
afirmar(FUENTE_DE_P7.includes("{ clave: 'translateZ', desde: -3000, hasta: 0 }"), 'P7 sigue arrancando en −3000: el patrón no cambió un valor')
afirmarIgual(PATRONES.P7.perspectivaPx, 1000, '  y sigue declarando sus 1000 px: lo que cambia es el lente, no el patrón')

const trabajos = CHOREO_KEYFRAMES.find((k) => k.name === 'trabajos')
afirmar(trabajos !== undefined, 'el keyframe de Trabajos existe')
const pose = trabajos?.pose ?? { distance: 0, height: 0 }
const ojo = Math.hypot(pose.distance, pose.height)
const profundidad = (zPx: number, perspectivaPx: number): number => (ojo * (perspectivaPx + zPx)) / perspectivaPx
const fA900 = foco * 900
const paredCerca = MOIRE_NEAR_RADIUS + pose.distance
const paredLejos = MOIRE_FAR_RADIUS + pose.distance
console.log(`  ojo-objeto en Trabajos: ${ojo.toFixed(2)} (distance ${pose.distance}, height ${pose.height}) · pared del fondo: de ${paredCerca} a ${paredLejos} unidades`)
console.log(`  −3000 px con el lente (${fA900.toFixed(0)} px a 900): ${profundidad(3000, fA900).toFixed(1)} unidades · con 1000 px: ${profundidad(3000, 1000).toFixed(1)}`)
afirmar(
  profundidad(3000, fA900) >= paredCerca && profundidad(3000, fA900) <= paredLejos,
  `con el lente, −3000 cae ADENTRO de la pared del fondo: ${profundidad(3000, fA900).toFixed(1)} en [${paredCerca}, ${paredLejos}]`,
)
afirmar(profundidad(3000, 1000) > paredLejos, `  y con los 1000 px del patrón caía DETRÁS de la sala: ${profundidad(3000, 1000).toFixed(1)}`)
afirmar(Math.abs(profundidad(0, fA900) - ojo) < 1e-9, '  y el plano llega (z = 0) al plano del sujeto, sea cual sea el lente')
controlPositivo('el detector ve un lente que manda el plano detrás de la sala', 1000, (f: number) => profundidad(3000, f) <= paredLejos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL ORIGEN — el centro del viewport en coordenadas del bloque')

const VP = { ancho: 1440, alto: 900 }
afirmarIgual(origenDeLaLente({ left: 0, top: 0 }, VP), '720.0px 450.0px', 'un bloque en el origen del viewport recibe el centro del viewport')
afirmarIgual(origenDeLaLente({ left: 188, top: 230 }, VP), '532.0px 220.0px', '  y un bloque corrido resta su posición: el punto de fuga NO se mueve con el bloque')
afirmarIgual(origenDeLaLente({ left: 0, top: 0 }, { ancho: 1920, alto: 1080 }), '960.0px 540.0px', '  y a 1920×1080 es su centro')
controlPositivo(
  'el origen no es el centro del bloque: con el bloque corrido cambia',
  { left: 100, top: 0 },
  (caja: { left: number; top: number }) => origenDeLaLente(caja, VP) === origenDeLaLente({ left: 0, top: 0 }, VP),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · EL CABLEADO — el contrato lo consume y Trabajos lo pide')

const ANIMADO = leer('src/app/v3/_secciones/_contrato/coreografia-animada.tsx')
const QUIETO = leer('src/app/v3/_secciones/_contrato/coreografia.tsx')
const TRABAJOS = leer('src/app/v3/_secciones/trabajos/Trabajos.tsx')
afirmar(ANIMADO.includes("props.lente === 'escena' ? perspectivaDeLaEscena()"), 'el módulo animado escribe la perspectiva del lente cuando el bloque lo pide')
afirmar(ANIMADO.includes('useOrigenDeLaLente(refDelBloque'), '  y el origen lo escribe el hook, sobre el propio bloque')
afirmar(QUIETO.includes("readonly lente?: 'escena'"), 'el contrato declara la prop `lente`')
afirmar(!/from '\.\.\/\.\.\/_lib\/motion\/lente'/.test(QUIETO), '  y el árbol quieto NO importa el lente: un valor del sistema de motion no cruza la compuerta')
afirmar(/<Bloque patron="P7" anclaje="seccion" lente="escena"/.test(TRABAJOS), 'Trabajos pide el lente en el bloque de P7, y en ningún otro')
afirmarIgual((TRABAJOS.match(/<Bloque[^>]*lente="escena"/g) ?? []).length, 1, '  en UN solo bloque')
controlPositivo('el detector ve un bloque de P7 sin lente', '<Bloque patron="P7" anclaje="seccion" className="relative">', (t: string) => /<Bloque patron="P7" anclaje="seccion" lente="escena"/.test(t))

cerrar('s19-lente')
