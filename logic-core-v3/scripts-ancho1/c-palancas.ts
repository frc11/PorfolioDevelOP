/**
 * C · LAS PALANCAS, CON SU NÚMERO — y ninguna se aplica.
 *
 *     npx tsx scripts-ancho1/c-palancas.ts
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 *
 * Para cada salida que podría cerrar el hueco a 1920 sin abrirlo a 1440: **qué
 * número haría falta**, qué le pasa al hueco en los otros anchos, y qué
 * instrumento se pone en rojo. Se recalcula en cada corrida sobre el árbol de
 * hoy en vez de quedar escrito: una palanca con un número viejo es una palanca
 * que ya no se puede usar (`s10-logo-encuadre.ts`, `palancasDeComposicion`).
 *
 * ⚠️ **NINGUNA SE APLICA.** `choreography.ts`, `probeScene.ts`,
 * `theme-develop.css` y `hero/geometria.ts` no se tocan. Lo que sale son cifras
 * al costado de cada salida.
 *
 * ── Las dos velocidades, que son el defecto ───────────────────────────────
 *
 * El borde izquierdo del logo es una FRACCIÓN DEL CUADRO —se mueve con el ancho
 * de la ventana—, y el borde derecho de la tinta es **un origen fijo más un
 * ancho que sale de una rampa `clamp()` con techo**. Las dos derivadas se
 * calculan y se publican: ahí está el «once veces» de la instrucción.
 *
 * ── ⚠️ EL COSTO SOBRE `test:s15e-intro-aterrizaje`, que la instrucción pide
 *    con número ────────────────────────────────────────────────────────────
 *
 * El §1 de ese invariante compara `sampleLogoPose(planIntroFlight(w,h), T, 1)`
 * contra `frameSceneEntry(w,h)`. Y `planIntroFlight` SACA su destino de
 * `frameSceneEntry` (`introFlight.ts:80`), así que las dos mitades leen la
 * misma función: la diferencia es `origen + (destino − origen)·lugar(1) −
 * destino`, que vale cero para CUALQUIER destino siempre que `lugar(1) = 1`.
 * Acá se mide ese `lugar(1)`, que es lo único de esa cuenta que puede no ser 1.
 */

import { CAMERA_FOV, ORBIT_TARGET_Y, PROBE_SVG_SCALE } from '@/app/v3/_lib/escena/probeScene'
import type { ChoreoPose } from '@/app/v3/_lib/escena/choreographyTypes'
import { SCENE_ENTRY_POSE, SCENE_ENTRY_VIEW, frameSceneEntry, frameScenePose } from '@/lib/scene-framing'
import { planIntroFlight, sampleLogoPose } from '@/components/layout/home-intro/introFlight'
import { HOME_INTRO_TIMELINE } from '@/components/layout/home-intro/introTimeline'
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import { tokenPx } from '@/app/v3/_lib/__tests__/s10-css'

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { TEMP, red } from './ancho1-comun'
import { cajaDeLaTinta, camaraCon, proyectarCon } from './b-modelo'

const DEG = Math.PI / 180

interface FilaMedida {
  readonly ancho: number
  readonly alto: number
  readonly mancha: { readonly hay: boolean; readonly x0: number }
  readonly bordeSeguroX: number
  readonly tintaHasta: number
  readonly dom: { readonly titular: { readonly x: number; readonly ancho: number } | null }
}
const ACUMULADO = path.join(TEMP, 'mancha.json')
const medidas: FilaMedida[] = existsSync(ACUMULADO) ? (JSON.parse(readFileSync(ACUMULADO, 'utf8')) as FilaMedida[]) : []
const medida = (w: number, h: number) => medidas.find((m) => m.ancho === w && m.alto === h)

/** Los tres cuadros del defecto: los pares declarados de 16:9 / 16:10. */
const CUADROS: readonly (readonly [number, number])[] = [
  [1280, 800],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
]

const salida: Record<string, unknown> = {}
const pct = (v: number) => `${(v * 100).toFixed(1)} %`

// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 0 · LAS DOS VELOCIDADES ═══')

const borde = (w: number, h: number) => cajaDeLaTinta(SCENE_ENTRY_POSE, w, h)!.izquierda
const velocidadDelLogo = CUADROS.map(([w, h]) => ({ cuadro: `${w}×${h}`, fraccion: red(borde(w, h) / w, 4) }))
console.log(`  el borde IZQUIERDO del logo, como fracción del ancho: ${velocidadDelLogo.map((v) => `${v.cuadro} → ${v.fraccion}`).join(' · ')}`)

/** La rampa tipográfica de la línea 1, leída del tema. */
const TAMANO = (w: number) => tokenPx('--text-fluido-display', w)
/** El avance de la línea 1 en `em`, despejado de la medición del navegador. */
const m1440 = medida(1440, 900)!
const AVANCE_EM = (m1440.tintaHasta - m1440.dom.titular!.x) / TAMANO(1440)
console.log(`  la rampa \`--text-fluido-display\`: ${[1280, 1440, 1600, 1920, 2560].map((w) => `${w} → ${red(TAMANO(w), 3)} px`).join(' · ')}`)
console.log(`  el avance de la línea 1, despejado de la medición a 1440: ${red(AVANCE_EM, 4)} em`)

const dLogo = (borde(1920, 1080) - borde(1440, 900)) / (1920 - 1440)
const dTinta = (medida(1920, 1080)!.tintaHasta - medida(1440, 900)!.tintaHasta) / (1920 - 1440)
const dLogo2 = (borde(2560, 1440) - borde(1920, 1080)) / (2560 - 1920)
const dTinta2 = (medida(2560, 1440)!.tintaHasta - medida(1920, 1080)!.tintaHasta) / (2560 - 1920)
console.log(
  `  1440→1920: el borde del logo corre ${red(dLogo, 4)} px por píxel de ventana; el borde de la tinta ${red(dTinta, 4)} → ` +
    `el logo va ${red(dLogo / dTinta, 2)}× más rápido`,
)
console.log(
  `  1920→2560: el logo ${red(dLogo2, 4)} px/px; la tinta ${red(dTinta2, 4)} px/px (y la tinta NO crece: lo que se mueve es el arranque de la columna, que se recentra)`,
)
salida.velocidades = { velocidadDelLogo, avanceEm: AVANCE_EM, dLogo, dTinta, dLogo2, dTinta2 }

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ 1 · EL HUECO DE HOY, y qué haría falta para cerrarlo ═══')
const OBJETIVO = medida(1440, 900)!.bordeSeguroX - medida(1440, 900)!.tintaHasta
console.log(`  el hueco de 1440×900 —el más chico— es ${OBJETIVO} px. Es el que las palancas tienen que NO abrir.`)
const huecos = CUADROS.map(([w, h]) => {
  const m = medida(w, h)!
  return { cuadro: `${w}×${h}`, tintaHasta: m.tintaHasta, bordeSeguro: m.bordeSeguroX, hueco: m.bordeSeguroX - m.tintaHasta }
})
for (const x of huecos) console.log(`  ${x.cuadro.padEnd(10)} tinta hasta ${String(x.tintaHasta).padStart(5)} · borde seguro ${String(x.bordeSeguro).padStart(5)} · hueco ${String(x.hueco).padStart(4)} px`)
salida.huecos = huecos

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ 2 · PALANCA (c) — LA ESCALA DEL OBJETO (`PROBE_SVG_SCALE`) ═══')
/**
 * Escalar el objeto multiplica su caja de mundo y por lo tanto su ancho en
 * píxeles. El CENTRO casi no se mueve —`travelX` resta media caja del mesh— así
 * que el borde izquierdo se corre hacia la IZQUIERDA cuando el logo crece.
 */
const escalas = [0.0049, 0.006, 0.007, 0.008, 0.009, 0.0105]
const porEscala = escalas.map((s) => {
  const filas = CUADROS.map(([w, h]) => {
    const c = cajaDeLaTinta(SCENE_ENTRY_POSE, w, h, CAMERA_FOV, s)!
    const m = medida(w, h)!
    return { cuadro: `${w}×${h}`, izquierda: red(c.izquierda, 1), anchoTinta: red(c.anchoPx, 1), hueco: red(c.izquierda - m.tintaHasta, 1) }
  })
  return { escala: s, razon: red(s / PROBE_SVG_SCALE, 4), filas }
})
console.log(`  escala    ×hoy   ${CUADROS.map(([w, h]) => `${w}×${h}`.padEnd(20)).join('')}`)
for (const e of porEscala) {
  console.log(
    `  ${e.escala.toFixed(4)}  ×${e.razon.toFixed(3)}  ` +
      e.filas.map((f) => `izq ${f.izquierda.toFixed(0)} hueco ${f.hueco.toFixed(0)}`.padEnd(20)).join(''),
  )
}
salida.escala = porEscala

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ 3 · PALANCA (d1) — LA DISTANCIA DE CÁMARA (keyframe `hero`) ═══')
const distancias = [14, 16, 19, 22, 26, 30]
const porDistancia = distancias.map((d) => {
  const pose: ChoreoPose = { ...SCENE_ENTRY_POSE, distance: d }
  const filas = CUADROS.map(([w, h]) => {
    const c = cajaDeLaTinta(pose, w, h)!
    const m = medida(w, h)!
    return { cuadro: `${w}×${h}`, izquierda: red(c.izquierda, 1), anchoTinta: red(c.anchoPx, 1), hueco: red(c.izquierda - m.tintaHasta, 1) }
  })
  return { distancia: d, filas }
})
console.log(`  distancia  ${CUADROS.map(([w, h]) => `${w}×${h}`.padEnd(20)).join('')}`)
for (const e of porDistancia) {
  console.log(`  ${String(e.distancia).padStart(9)}  ` + e.filas.map((f) => `izq ${f.izquierda.toFixed(0)} hueco ${f.hueco.toFixed(0)}`.padEnd(20)).join(''))
}
salida.distancia = porDistancia

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ 4 · PALANCA (d2) — EL `fov` (`CAMERA_FOV`, VERTICAL) ═══')
const fovs = [26, 30, 35, 40, 46]
const porFov = fovs.map((f) => {
  const filas = CUADROS.map(([w, h]) => {
    const c = cajaDeLaTinta(SCENE_ENTRY_POSE, w, h, f)!
    const m = medida(w, h)!
    return { cuadro: `${w}×${h}`, izquierda: red(c.izquierda, 1), anchoTinta: red(c.anchoPx, 1), hueco: red(c.izquierda - m.tintaHasta, 1) }
  })
  return { fov: f, filas }
})
console.log(`  fov        ${CUADROS.map(([w, h]) => `${w}×${h}`.padEnd(20)).join('')}`)
for (const e of porFov) {
  console.log(`  ${String(e.fov).padStart(9)}  ` + e.filas.map((f) => `izq ${f.izquierda.toFixed(0)} hueco ${f.hueco.toFixed(0)}`.padEnd(20)).join(''))
}
salida.fov = porFov

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ 5 · EL COSTO SOBRE `test:s15e-intro-aterrizaje` ═══')

/** §1 — la identidad: ¿cuánto vale `lugar(1)` de la línea de tiempo del vuelo? */
const w0 = 1440
const h0 = 810
const plan0 = planIntroFlight(w0, h0)
const pose0 = sampleLogoPose(plan0, HOME_INTRO_TIMELINE, 1)
const destino0 = frameSceneEntry(w0, h0)!
const lugarEnUno =
  Math.abs(destino0.centerXPx - plan0.originXPx) < 1e-12
    ? Number.NaN
    : (pose0.centerXPx - plan0.originXPx) / (destino0.centerXPx - plan0.originXPx)
console.log(`  §1 · \`lugar(1)\` de la línea de tiempo = ${lugarEnUno} (origen x ${red(plan0.originXPx, 3)} → destino x ${red(destino0.centerXPx, 3)})`)
console.log(
  '  §1 · las dos mitades salen de `frameSceneEntry` (`introFlight.ts:80`): la diferencia es\n' +
    '       `origen + (destino − origen)·lugar(1) − destino`, que vale 0 para CUALQUIER destino.\n' +
    '       ⇒ mover `fov`, `distance` o `PROBE_SVG_SCALE` deja el 0,0000 px EN 0,0000 px.',
)

/** §2 — las tres comprobaciones de la silueta, que sí dependen de la lente. */
const VENTANAS_DEL_INVARIANTE: readonly (readonly [string, number, number])[] = [
  ['1440×810', 1440, 810],
  ['1920×1080', 1920, 1080],
  ['1280×800', 1280, 800],
]
const INK_W = LOGO_INK_VIEWBOX.width * PROBE_SVG_SCALE
const INK_H = LOGO_INK_VIEWBOX.height * PROBE_SVG_SCALE

function siluetas(w: number, h: number, fovDeg: number, pose: ChoreoPose, escala: number) {
  const razon = escala / PROBE_SVG_SCALE
  const c = camaraCon(pose, w, h, fovDeg, 6.8632 * razon, 4.7787 * razon)!
  const esquinas = ([[-1, 1], [1, 1], [1, -1], [-1, -1]] as const).map(([sx, sy]) => {
    const p = proyectarCon(c, [(sx * INK_W * razon) / 2, (sy * INK_H * razon) / 2, 0], w, h)!
    return { x: p.xPx, y: p.yPx }
  })
  const caja = cajaDeLaTinta(pose, w, h, fovDeg, escala)!
  const pitch = (Math.atan2(pose.height - ORBIT_TARGET_Y, pose.distance) * 180) / Math.PI
  const medioAlto = (caja.altoPx * Math.cos(pitch * DEG)) / 2
  const intro = [
    { x: caja.centroX - caja.anchoPx / 2, y: caja.centroY - medioAlto },
    { x: caja.centroX + caja.anchoPx / 2, y: caja.centroY - medioAlto },
    { x: caja.centroX + caja.anchoPx / 2, y: caja.centroY + medioAlto },
    { x: caja.centroX - caja.anchoPx / 2, y: caja.centroY + medioAlto },
  ]
  const cuna = esquinas[1].x - esquinas[0].x - (esquinas[2].x - esquinas[3].x)
  const altoEscena = (esquinas[3].y - esquinas[0].y + (esquinas[2].y - esquinas[1].y)) / 2
  const altoIntro = intro[3].y - intro[0].y
  return {
    cuna: red(cuna, 2),
    deltaDeAlto: red(Math.abs(altoEscena - altoIntro), 3),
    peorEsquina: red(Math.max(...esquinas.map((p, i) => Math.hypot(p.x - intro[i].x, p.y - intro[i].y))), 1),
  }
}

const CONTROL_S15E = VENTANAS_DEL_INVARIANTE.map(([n, w, h]) => ({ ventana: n, ...siluetas(w, h, CAMERA_FOV, SCENE_ENTRY_POSE, PROBE_SVG_SCALE) }))
console.log(`\n  §2 · control de equivalencia contra la corrida real de HOY (cuña > 1 px · |Δalto| < 1 px):`)
for (const c of CONTROL_S15E) console.log(`       ${c.ventana.padEnd(10)} cuña ${String(c.cuna).padStart(6)} px · |Δalto| ${String(c.deltaDeAlto).padStart(6)} px · peor esquina ${c.peorEsquina} px`)

console.log('\n  §2 · con cada palanca (🔴 = la comprobación se pone en rojo):')
const hipotesis: { readonly etiqueta: string; readonly fov: number; readonly pose: ChoreoPose; readonly escala: number }[] = [
  ...fovs.filter((f) => f !== CAMERA_FOV).map((f) => ({ etiqueta: `fov ${f}`, fov: f, pose: SCENE_ENTRY_POSE, escala: PROBE_SVG_SCALE })),
  ...distancias.filter((d) => d !== SCENE_ENTRY_POSE.distance).map((d) => ({ etiqueta: `distance ${d}`, fov: CAMERA_FOV, pose: { ...SCENE_ENTRY_POSE, distance: d }, escala: PROBE_SVG_SCALE })),
  ...escalas.filter((s) => s !== PROBE_SVG_SCALE).map((s) => ({ etiqueta: `escala ${s}`, fov: CAMERA_FOV, pose: SCENE_ENTRY_POSE, escala: s })),
]
const costos = hipotesis.map((hy) => {
  const filas = VENTANAS_DEL_INVARIANTE.map(([n, w, h]) => ({ ventana: n, ...siluetas(w, h, hy.fov, hy.pose, hy.escala) }))
  const rojas = filas.flatMap((f) => [
    ...(f.cuna > 1 ? [] : [`${f.ventana}: la cuña cae a ${f.cuna} px (exige > 1)`]),
    ...(f.deltaDeAlto < 1 ? [] : [`${f.ventana}: |Δalto| sube a ${f.deltaDeAlto} px (exige < 1)`]),
  ])
  return { palanca: hy.etiqueta, filas, rojas }
})
for (const c of costos) {
  console.log(
    `       ${c.palanca.padEnd(16)} ${c.filas.map((f) => `cuña ${String(f.cuna).padStart(6)} Δalto ${String(f.deltaDeAlto).padStart(6)}`).join(' | ')}` +
      (c.rojas.length > 0 ? `   🔴 ${c.rojas.join(' · ')}` : '   verde'),
  )
}
salida.s15e = { lugarEnUno, controlDeHoy: CONTROL_S15E, costos }

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ 6 · EL CLAMP DE ANCHO DEL PRELOADER, que sólo vive de un lado ═══')
const clamps = CUADROS.map(([w, h]) => {
  const f = frameScenePose(SCENE_ENTRY_POSE, w, h)!
  return { cuadro: `${w}×${h}`, recorte: red(f.widthClamp, 4) }
})
console.log(`  \`DEST_WIDTH_MARGIN\` recorta el destino del preloader: ${clamps.map((c) => `${c.cuadro} → ×${c.recorte}`).join(' · ')}`)
console.log(`  (la escena viva NO tiene ese clamp: \`scene-framing.ts:50-55\` lo declara como deuda)`)
console.log(`  \`SCENE_ENTRY_VIEW\`: yaw ${red(SCENE_ENTRY_VIEW.yawDeg, 3)}° · pitch ${red(SCENE_ENTRY_VIEW.pitchDeg, 3)}°`)
salida.clamp = clamps

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ 7 · LA CIFRA QUE DECIDE — el hueco de 1920 MENOS el de 1440 ═══')
/**
 * «Cerrar el hueco a 1920 sin abrirlo a 1440» es, literalmente, **llevar esta
 * resta a cero**. Las palancas (c) y (d) son perillas UNIFORMES: agrandan o
 * achican el logo en los cuatro cuadros a la vez. Si la resta no se mueve,
 * ninguna de las dos puede cerrar el defecto, por más que se las fuerce.
 */
const diferencias = [
  { etiqueta: 'HOY', fov: CAMERA_FOV, pose: SCENE_ENTRY_POSE, escala: PROBE_SVG_SCALE },
  ...hipotesis,
].map((hy) => {
  const h1440 = cajaDeLaTinta(hy.pose, 1440, 900, hy.fov, hy.escala)!.izquierda - medida(1440, 900)!.tintaHasta
  const h1920 = cajaDeLaTinta(hy.pose, 1920, 1080, hy.fov, hy.escala)!.izquierda - medida(1920, 1080)!.tintaHasta
  const h2560 = cajaDeLaTinta(hy.pose, 2560, 1440, hy.fov, hy.escala)!.izquierda - medida(2560, 1440)!.tintaHasta
  return {
    palanca: hy.etiqueta,
    hueco1440: red(h1440, 1),
    hueco1920: red(h1920, 1),
    hueco2560: red(h2560, 1),
    diferencia: red(h1920 - h1440, 1),
  }
})
for (const d of diferencias) {
  console.log(
    `  ${d.palanca.padEnd(16)} 1440 ${String(d.hueco1440).padStart(7)} · 1920 ${String(d.hueco1920).padStart(7)} · 2560 ${String(d.hueco2560).padStart(7)}  →  1920−1440 = ${String(d.diferencia).padStart(7)} px`,
  )
}
const rango = diferencias.map((d) => d.diferencia)
console.log(
  `  la resta hoy vale ${diferencias[0].diferencia} px y en TODO el barrido se mueve entre ${Math.min(...rango)} y ${Math.max(...rango)} px.\n` +
    '  ⇒ ninguna palanca de escala, distancia o lente la lleva a cero: son perillas uniformes y el defecto no lo es.',
)
salida.diferencias = diferencias

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ 8 · PALANCAS (a) y (b) — LA COLUMNA ═══')
/**
 * (a) EL ANCHO MÁXIMO DE LA COLUMNA. Arriba de 1440 la línea 1 entra en UN
 * renglón, así que su tinta mide `tamaño × avance` y **no depende de la caja**:
 * ensanchar la columna agrega aire a la derecha del renglón y no mueve un píxel
 * de tinta. Se publica la holgura que ya sobra hoy.
 */
const holguras = CUADROS.map(([w, h]) => {
  const m = medida(w, h)!
  const caja = m.dom.titular!
  const tinta = m.tintaHasta - caja.x
  return { cuadro: `${w}×${h}`, cajaPx: red(caja.ancho, 1), tintaPx: red(tinta, 1), sobra: red(caja.ancho - tinta, 1), tamanoPx: red(TAMANO(w), 3) }
})
for (const x of holguras) {
  console.log(`  ${x.cuadro.padEnd(10)} caja ${String(x.cajaPx).padStart(6)} px · tinta ${String(x.tintaPx).padStart(6)} px · SOBRA ${String(x.sobra).padStart(6)} px · \`--text-fluido-display\` ${x.tamanoPx} px`)
}
console.log('  ⇒ (a) es INERTE de 1440 para arriba: la caja ya sobra, y achicarla partiría el renglón (más alto, más angosto y MÁS lejos del logo).')

/**
 * (b) EL ARRANQUE DE LA COLUMNA. Mueve la tinta uno a uno. Se publica el
 * corrimiento que cada cuadro necesitaría para quedar con el hueco de 1440.
 */
const arranques = CUADROS.map(([w, h]) => {
  const m = medida(w, h)!
  return { cuadro: `${w}×${h}`, arranque: red(m.dom.titular!.x, 1), corrimiento: red(m.bordeSeguroX - m.tintaHasta - OBJETIVO, 1) }
})
for (const x of arranques) console.log(`  ${x.cuadro.padEnd(10)} arranca en x ${String(x.arranque).padStart(6)} · para dejar ${OBJETIVO} px habría que correrla ${String(x.corrimiento).padStart(6)} px`)
console.log('  ⇒ (b) sólo cierra si el corrimiento DEPENDE DEL ANCHO: un número fijo que cierra 1920 mete la tinta adentro del logo a 1440.')

/**
 * (e) LA RAMPA TIPOGRÁFICA — la palanca que el barrido encontró y la instrucción
 * no nombra. Es la única que puede igualar las dos velocidades del §0.
 */
const pendienteDeHoy = 0.019718
const pendienteNecesaria = dLogo2 / AVANCE_EM
console.log(
  `\n  (e) \`--text-fluido-display\`: hoy \`clamp(37px, 1.8504rem + ${pendienteDeHoy * 100}vw, ${red(TAMANO(1920), 4)}px)\` — el techo se alcanza EXACTAMENTE en 1920 (= \`--container-tope\`).\n` +
    `      para que la tinta corriera a la velocidad del logo (${red(dLogo2, 4)} px/px) haría falta una pendiente de ${red(pendienteNecesaria * 100, 3)}vw, ${red(pendienteNecesaria / pendienteDeHoy, 2)}× la de hoy,\n` +
    `      y sin techo: a 2560 el titular mediría ${red(TAMANO(1920) + pendienteNecesaria * (2560 - 1920), 1)} px en vez de ${red(TAMANO(2560), 1)}.`,
)
salida.columna = { holguras, arranques, pendienteDeHoy, pendienteNecesaria }

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n═══ 9 · EL OTRO GUARDIÁN DE (c) y (d): `s10-logo` §3 ═══')
/**
 * §3 afirma `heroEntero` — *«el logo entra ENTERO en el cuadro en los cuatro
 * aspectos y en toda su ventana»*— sobre las cuatro ventanas de
 * `s10-logo-lectura.ts`. Agrandar el logo, acortar la distancia o cerrar la
 * lente lo empuja contra el borde. Acá se evalúa con la caja del MESH (la que el
 * rig encuadra, con bisel), que es la más grande de las dos.
 */
const VENTANAS_DE_S10: readonly (readonly [number, number])[] = [
  [1025, 667],
  [1025, 844],
  [1025, 900],
  [1920, 900],
]
const MESH_W = 6.8632
const MESH_H = 4.7787
function entraEntero(fovDeg: number, pose: ChoreoPose, escala: number): { readonly entra: boolean; readonly peor: string } {
  const razon = escala / PROBE_SVG_SCALE
  let peorMargen = Infinity
  let peorCuadro = ''
  for (const [w, h] of VENTANAS_DE_S10) {
    const c = camaraCon(pose, w, h, fovDeg, MESH_W * razon, MESH_H * razon)!
    const xs: number[] = []
    const ys: number[] = []
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const p = proyectarCon(c, [(sx * MESH_W * razon) / 2, (sy * MESH_H * razon) / 2, 0], w, h)!
        xs.push(p.xPx)
        ys.push(p.yPx)
      }
    }
    const margen = Math.min(Math.min(...xs), w - Math.max(...xs), Math.min(...ys), h - Math.max(...ys))
    if (margen < peorMargen) {
      peorMargen = margen
      peorCuadro = `${w}×${h}`
    }
  }
  return { entra: peorMargen >= 0, peor: `${peorCuadro} con ${red(peorMargen, 1)} px de margen` }
}
const guardian = [
  { etiqueta: 'HOY', fov: CAMERA_FOV, pose: SCENE_ENTRY_POSE, escala: PROBE_SVG_SCALE },
  ...hipotesis,
].map((hy) => ({ palanca: hy.etiqueta, ...entraEntero(hy.fov, hy.pose, hy.escala) }))
for (const g of guardian) console.log(`  ${g.palanca.padEnd(16)} ${g.entra ? 'entra entero' : '🔴 SE SALE'} — peor: ${g.peor}`)
salida.guardianS10 = guardian

const DESTINO = path.join(TEMP, 'palancas.json')
writeFileSync(DESTINO, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
console.log(`\n→ ${DESTINO}`)
