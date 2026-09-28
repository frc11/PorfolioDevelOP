/**
 * SPRINT ESCENA 4 y 5 — lo que las pruebas de la escena prometen sin navegador.
 *
 * [ESCENA 6] La formación, la cámara contra las copias y las estrellas se mudaron a
 * `s31-escena6.invariant.ts` (la formación cambió entera); acá queda lo de ESCENA 4 y 5 que sigue.
 *
 * §1 · las banderas: el moiré vivo y el polvo parejo prendidos en el producto, las pruebas apagadas,
 *      la base sin nada, y el pedido del banco se lee bien.
 * §4 · el moiré: M1a y M2 se suman con tope; M4 es entero en cada tramo y cambia suave; M3 corre una celda.
 * §5 · el polvo: la caja se repite sin salto; la quietud y el despertar; la forma del logo lo saca.
 * §6 · la sombra según el haz (5c): sin haz no cambia nada; de noche más dura, de día más difusa.
 * §7 · el túnel: el número que la escena trae se re-deriva de la sección de Trabajos.
 * §8 · la limpieza: del logo con peso, de la membrana y de M5 no queda código.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { M1A, M2, M3, M4, PERIODO_DE_LA_BASE_S, corrimientoDelPulso, desajusteEn, velocidadDeLaGruesa } from '../moire/variantes'
import { distanciaAlLogo, formaDelLogo } from '../polvo/obstaculo'
import { NUNCA, POSARSE, avanzarElPolvo, polvoInicial } from '../polvo/posarse'
import { POLVO_PAREJO, envolver } from '../polvo/volumen'
import { PROBE_SVG_SCALE } from '../probeScene'
import { MOIRE_NEAR_RADIUS } from '../probeMoire'
import { pantallaDeProgreso, progresoDePantalla } from '../recorrido'
import { manchasDelHaz } from '../sombra/sombraDelHaz'
import { TUNEL_EN_LA_ESCENA, fueraDelTunel } from '../tunelEnLaEscena'
import { CAPAS_DEL_TUNEL } from '../../../_secciones/trabajos/tunel'
import { PANTALLAS_DE_LA_SECCION, SOLAPE_DE_LA_SECCION, ventanaDelTunel } from '../../../_secciones/trabajos/geometria'

// ── §1 · las banderas ─────────────────────────────────────────────────────
titulo('§1 · el moiré y el polvo prendidos, las pruebas apagadas, salvo en el banco')
afirmar(ENTORNO.moire && ENTORNO.polvoParejo, 'el producto trae el moiré vivo (M1a + M2 + M3 + M4) y el polvo parejo')
afirmar(!BASE_LIMPIA.moire && !BASE_LIMPIA.polvoParejo, 'la base, el moiré y el polvo de antes')
afirmarIgual(ENTORNO.pruebas, PRUEBAS_APAGADAS, 'el producto no trae ninguna prueba (las de ESCENA 6, en s31)')
afirmarIgual(BASE_LIMPIA.pruebas, PRUEBAS_APAGADAS, '  la base tampoco')
const antes = entornoPedido('producto,moire=hoy,polvo=antes')
afirmar(!antes.moire && !antes.polvoParejo && antes.E1, '`moire=hoy` y `polvo=antes` dan el producto con el moiré y el polvo de la base')
afirmar(!entornoPedido('E1,E4,E6,E7').moire && entornoPedido('E1,moire').moire, 'sin `producto`, sólo lo que la lista nombra')
controlPositivo('el detector VE un pedido que prende de más', 'E1,E4,inercia', (p: string) => !entornoPedido(p).pruebas.inercia && !entornoPedido(p).moire)

// ── §4 · el moiré ─────────────────────────────────────────────────────────
titulo('§4 · el moiré vivo')
const base1 = 1 / PERIODO_DE_LA_BASE_S
afirmar(Math.abs(velocidadDeLaGruesa(0) - M1A * base1) < 1e-12, 'M1a · quieta, la gruesa baja 3 veces más rápido que en la base', `una celda cada ${(1 / velocidadDeLaGruesa(0)).toFixed(1)} s`)
afirmar(velocidadDeLaGruesa(0.02) > velocidadDeLaGruesa(0) && Math.abs(velocidadDeLaGruesa(10) - M2.tope * base1) < 1e-12, 'M2 · el scroll se SUMA al piso de M1a y el tope es el de siempre (24 veces la base)')
const enteros = M4.tramos.map((t, i) => desajusteEn(i + 1 < M4.tramos.length ? (t.desde + M4.tramos[i + 1].desde) / 2 : t.desde + M4.transicion + 0.005))
afirmarIgual(enteros, M4.tramos.map((t) => t.desajuste), 'M4 · en el medio de cada tramo el desajuste es su entero (cierra alrededor del cilindro)')
let salto = 0
for (let q = 0; q < 1; q += 0.0005) salto = Math.max(salto, Math.abs(desajusteEn(q + 0.0005) - desajusteEn(q)))
afirmar(salto < 0.2, 'M4 · y cambia suave: ningún salto entre dos progresos vecinos', `salto máximo ${salto.toFixed(3)}`)
afirmar(corrimientoDelPulso(-1) === 0 && Math.abs(corrimientoDelPulso(M3.duraS * 2) - M3.celdas) < 1e-9, 'M3 · el principal corre la fase una celda, y ahí se queda')
const escenario = readFileSync(path.join(process.cwd(), 'src/app/v3/_lib/escena/ProbeStage.tsx'), 'utf8')
afirmar(/<MoireVivo rig=\{rig\} moireRef=\{moireRef\}/.test(escenario), 'el escenario monta el moiré vivo, después del rig')

// ── §5 · el polvo ─────────────────────────────────────────────────────────
titulo('§5 · el polvo parejo y las pruebas del polvo')
const L = POLVO_PAREJO.lado
let fuera = 0
for (let v = -200; v <= 200; v += 0.37) {
  const w = envolver(v, 13.2, L)
  if (w < 13.2 - L / 2 - 1e-9 || w >= 13.2 + L / 2 + 1e-9 || Math.abs(((w - v) / L) - Math.round((w - v) / L)) > 1e-9) fuera += 1
}
afirmar(fuera === 0, 'la caja se repite: toda mota cae adentro, corrida un número entero de lados')
afirmar(POLVO_PAREJO.radio < MOIRE_NEAR_RADIUS, '  y el polvo no sale de la trama', `radio ${String(POLVO_PAREJO.radio)}`)
afirmar(POSARSE.empiezaS > 0 && POSARSE.asentadoS > POSARSE.empiezaS, '5b · empieza a bajar con la quietud y después está en el piso (los tiempos de ESCENA 7, en s32)')
let e = polvoInicial(0)
e = avanzarElPolvo(e, 1, [0, 0, 0], false)
afirmar(e.quieto === NUNCA && e.desperto === 1, '5b · el movimiento lo despierta, y desde donde empezó')
e = avanzarElPolvo(e, 1.5, null, false)
afirmar(e.quieto === 1, '  y sin movimiento vuelve a quedar quieto desde el último')
afirmar(avanzarElPolvo(polvoInicial(0), 30, null, true).quieto === NUNCA, '  con movimiento reducido no se posa nunca')
const forma = formaDelLogo({ x: 515, y: 546 }, PROBE_SVG_SCALE)
const centroDelTrazo: [number, number, number] = [forma.c[0] - forma.c[2], forma.c[1], 0]
afirmar(distanciaAlLogo(centroDelTrazo, forma) < 0, '5a · un punto en el trazo de la «c» está adentro de la forma del logo')
controlPositivo('y uno lejos no', [0, 20, 0] as [number, number, number], (q) => distanciaAlLogo(q, forma) < 0)

// ── §6 · la sombra según el haz ───────────────────────────────────────────
titulo('§6 · la sombra según el haz (5c)')
afirmarIgual(manchasDelHaz(1, false), { escalaBlanda: 1, opacidadBlanda: 1, escalaDura: 1, opacidadDura: 0 }, 'sin el haz la mancha es la de siempre')
const noche = manchasDelHaz(1, true)
const dia = manchasDelHaz(0, true)
afirmar(noche.opacidadDura > 1 && dia.opacidadDura === 0, 'de noche aparece la mancha dura y oscura; de día no')
afirmar(dia.escalaBlanda > 1 && dia.opacidadBlanda < 1, 'de día la blanda se abre y se aclara')

// ── §7 · el túnel ─────────────────────────────────────────────────────────
titulo('§7 · el túnel de Trabajos en el progreso de la escena')
// El progreso de Trabajos corre de `top bottom` a `bottom bottom`: arranca una pantalla antes de la caja,
// que a su vez empieza el solape antes de la pantalla de su nudo (0,5).
const arranqueDeLaCaja = pantallaDeProgreso(0.5) - SOLAPE_DE_LA_SECCION - 1
const derivado = progresoDePantalla(arranqueDeLaCaja + PANTALLAS_DE_LA_SECCION * ventanaDelTunel(CAPAS_DEL_TUNEL.proyectos.length).desde)
afirmar(Math.abs(derivado - TUNEL_EN_LA_ESCENA.desde) < 0.001, 'el arranque del túnel que trae la escena es el de la sección', `derivado ${derivado.toFixed(5)} · traído ${String(TUNEL_EN_LA_ESCENA.desde)}`)
afirmar(fueraDelTunel(0.5) === 1 && fueraDelTunel(TUNEL_EN_LA_ESCENA.desde) === 0 && fueraDelTunel(0.6) === 0 && fueraDelTunel(0.9) === 1, 'fuera del túnel vale 1 (Trabajos arriba, Por qué develOP) y adentro 0')

// ── §8 · la limpieza ──────────────────────────────────────────────────────
titulo('§8 · del logo con peso, la membrana y M5 no queda código')
const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
afirmar(!existsSync(path.join(ESCENA, 'peso')) && !existsSync(path.join(ESCENA, 'membrana')), 'las carpetas `peso/` y `membrana/` no existen')
const codigo = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? (d.name === '__tests__' ? [] : codigo(path.join(dir, d.name))) : /\.tsx?$/.test(d.name) ? [readFileSync(path.join(dir, d.name), 'utf8')] : []))
const RESTOS = /PesoDelLogo|pesoRef|CupulaViva|conMembrana|MEMBRANA|\bM5\b|radioDeLaLosaConFormacion|ESCENA4_APAGADA/
afirmar(!codigo(ESCENA).some((c) => RESTOS.test(c)), '  y ningún fuente de la escena los nombra')
controlPositivo('el detector VE un resto', 'const pesoRef = useRef(null)', (c: string) => !RESTOS.test(c))

cerrar('s30-escena4')
