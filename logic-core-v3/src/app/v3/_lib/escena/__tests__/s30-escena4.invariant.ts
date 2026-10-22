/**
 * SPRINT ESCENA 4 y 5 — lo que las pruebas de la escena prometen sin navegador.
 *
 * [ESCENA 6] La formación, la cámara contra las copias y las estrellas se mudaron a
 * `s31-escena6.invariant.ts` (la formación cambió entera); acá queda lo de ESCENA 4 y 5 que sigue.
 *
 * §1 · las banderas: el moiré y el polvo parejo prendidos en el producto, las pruebas apagadas,
 *      la base sin nada, y el pedido del banco se lee bien. [B8] `moire` es la variante del moiré quieto.
 * §4 · el moiré: [B8] el vivo (M1a a M4) se borró —reaccionaba al scroll—; lo que lo reemplaza, en `s78-b8`.
 * §5 · el polvo: la caja se repite sin salto; la quietud y el despertar; la forma del logo lo saca.
 * §6 · la sombra según el haz (5c): sin haz no cambia nada; de noche más dura, de día más difusa.
 * §7 · el túnel: el número que la escena trae se re-deriva de la sección de Trabajos.
 * §8 · la limpieza: del logo con peso, de la membrana y de M5 no queda código.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { MOIRE_POR_DEFECTO } from '../moire/fijo'
import { formaDelLogo } from '../polvo/formaDelLogo'
import { NUNCA, POSARSE, avanzarElPolvo, polvoInicial } from '../polvo/posarse'
import { POLVO_PAREJO, envolver } from '../polvo/volumen'
import { PROBE_SVG_SCALE } from '../probeScene'
import { MOIRE_NEAR_RADIUS } from '../probeMoire'
import { pantallaDeProgreso, progresoDePantalla } from '../recorrido'
import { manchasDelHaz } from '../sombra/sombraDelHaz'
import { SOLAPE_DE_LA_SECCION } from '../../../_secciones/trabajos/geometria'
import { PX_DE_LA_APROXIMACION } from '../../../_secciones/trabajos/portfolio/pasos'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../navegacion'

// ── §1 · las banderas ─────────────────────────────────────────────────────
titulo('§1 · el moiré y el polvo prendidos, las pruebas apagadas, salvo en el banco')
afirmar(ENTORNO.moire === MOIRE_POR_DEFECTO && ENTORNO.polvoParejo, '[B8] el producto trae el moiré quieto en su defecto y el polvo parejo', `moire=${ENTORNO.moire}`)
afirmar(BASE_LIMPIA.moire === MOIRE_POR_DEFECTO && !BASE_LIMPIA.polvoParejo, 'la base, el polvo de antes ([B8] el moiré de la base también es el quieto: el que se movía se borró)')
afirmarIgual(ENTORNO.pruebas, PRUEBAS_APAGADAS, 'el producto no trae ninguna prueba (las de ESCENA 6, en s31)')
afirmarIgual(BASE_LIMPIA.pruebas, PRUEBAS_APAGADAS, '  la base tampoco')
const antes = entornoPedido('producto,moire=1,polvo=antes')
afirmar(antes.moire === '1' && !antes.polvoParejo && antes.E1, '`moire=1` y `polvo=antes` dan el producto con una rendija y el polvo de la base')
afirmar(entornoPedido('E1,E4,E6,E7').moire === MOIRE_POR_DEFECTO && entornoPedido('E1,moire=mouse').moire === 'mouse' && entornoPedido('producto,moire=hoy').moire === MOIRE_POR_DEFECTO, 'sin `producto`, sólo lo que la lista nombra; el moiré, su defecto si no se nombra (`moire=hoy`, el de antes, ya no existe)')
controlPositivo('el detector VE un pedido que prende de más', 'E1,E4,amanecer', (p: string) => !entornoPedido(p).amanecer && entornoPedido(p).moire === MOIRE_POR_DEFECTO)

// ── §4 · el moiré ─────────────────────────────────────────────────────────
titulo('§4 · [B8] el moiré vivo se borró (reaccionaba al scroll); el quieto, en s78-b8')
const MOIRE_DIR = path.join(process.cwd(), 'src/app/v3/_lib/escena/moire')
const vivoBorrado = ['variantes.ts', 'parche.ts', 'MoireVivo.tsx'].filter((a) => existsSync(path.join(MOIRE_DIR, a)))
afirmar(vivoBorrado.length === 0, 'M1a, M2, M3 y M4 no tienen código: ni sus números, ni el parche de la fina, ni el componente', vivoBorrado.join(', '))
const escenario = readFileSync(path.join(process.cwd(), 'src/app/v3/_lib/escena/ProbeStage.tsx'), 'utf8')
const montaElQuieto = (s: string): boolean => /<MoireDelMouse moireRef=\{moireRef\} quieto=\{reducedMotion\} \/>/.test(s) && !/<MoireVivo/.test(s)
afirmar(montaElQuieto(escenario), 'el escenario monta sólo la rendija del mouse, sin el rig (no lee el progreso)')
controlPositivo('el detector VE el escenario de ESCENA 5 (el moiré vivo con el rig)', escenario.replace('<MoireDelMouse moireRef={moireRef} quieto={reducedMotion} />', '<MoireVivo rig={rig} moireRef={moireRef} quieto={reducedMotion} />'), montaElQuieto)

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
// [ESCENA 9] T1: el obstáculo (5a) se borró; la forma queda (la leen el piso vivo y la fugaz): s35.
const cuencos = (f: typeof forma): boolean => [f.c, f.p].every((t) => t[2] > 0 && t[3] > 0 && t[3] < t[2]) && f.c[0] < f.p[0]
afirmar(cuencos(forma), '5a · la forma del logo: dos cuencos con su tubo más fino que su radio, la «c» a la izquierda de la «p»')
controlPositivo('y una forma sin escala no', formaDelLogo({ x: 515, y: 546 }, 0), cuencos)

// ── §6 · la sombra según el haz ───────────────────────────────────────────
titulo('§6 · la sombra según el haz (5c)')
afirmarIgual(manchasDelHaz(1, 1, false), { escalaBlanda: 1, opacidadBlanda: 1, escalaDura: 1, opacidadDura: 0 }, 'sin el haz la mancha es la de siempre')
// [ESCENA 10] T1: la noche y lo prendido del haz van por separado (la blanda sigue a la noche; la dura, a la noche por `k`).
const noche = manchasDelHaz(1, 1, true)
const dia = manchasDelHaz(0, 1, true)
afirmar(noche.opacidadDura > 1 && dia.opacidadDura === 0, 'de noche aparece la mancha dura y oscura; de día no')
afirmar(dia.escalaBlanda > 1 && dia.opacidadBlanda < 1, 'de día la blanda se abre y se aclara')

// ── §7 · el túnel ─────────────────────────────────────────────────────────
titulo('§7 · el túnel de Trabajos en el progreso de la escena — [B1] desde el pin del selector; [B1.2b] ya no apaga nada')
// El progreso de Trabajos corre de `top bottom` a `bottom bottom`: arranca una pantalla antes de la caja,
// que a su vez empieza el solape antes de la pantalla de su nudo (0,5).
const arranqueDeLaCaja = pantallaDeProgreso(0.5) - SOLAPE_DE_LA_SECCION - 1
// [B1] el PIN del selector (la aproximación termina a una pantalla del arranque del progreso): donde entra el panel del Portfolio.
const derivado = progresoDePantalla(arranqueDeLaCaja + PX_DE_LA_APROXIMACION / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA)
afirmar(Math.abs(derivado - 0.475) < 0.001, 'el pin del selector de la sección cae en p 0,475 (donde entra el panel)', `derivado ${derivado.toFixed(5)}`)
// [B1.2b] La ventana que apagaba estrellas, fugaces y la formación desde el pin se borró: existía porque el túnel tapaba la sala.
const VENTANA = /fueraDelTunel|tunelEnLaEscena|TUNEL_EN_LA_ESCENA/
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const conVentana = ['estrellas/Estrellas.tsx', 'estrellas/Fugaz.tsx', 'formacion/Formacion.tsx'].filter((r) => VENTANA.test(sinComentarios(readFileSync(path.join(process.cwd(), 'src/app/v3/_lib/escena', r), 'utf8'))))
afirmar(conVentana.length === 0 && !existsSync(path.join(process.cwd(), 'src/app/v3/_lib/escena/tunelEnLaEscena.ts')), 'estrellas, fugaces y la formación siguen durante el Portfolio: ninguno se apaga por una ventana del progreso (y la ventana se borró)', conVentana.join(', '))
controlPositivo('el detector VE una ventana', 'const visible = fueraDelTunel(rig.current.progress)', (c: string) => !VENTANA.test(sinComentarios(c)))

// ── §8 · la limpieza ──────────────────────────────────────────────────────
titulo('§8 · del logo con peso, la membrana y M5 no queda código')
const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
afirmar(!existsSync(path.join(ESCENA, 'peso')) && !existsSync(path.join(ESCENA, 'membrana')), 'las carpetas `peso/` y `membrana/` no existen')
const codigo = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? (d.name === '__tests__' ? [] : codigo(path.join(dir, d.name))) : /\.tsx?$/.test(d.name) ? [readFileSync(path.join(dir, d.name), 'utf8')] : []))
const RESTOS = /PesoDelLogo|pesoRef|CupulaViva|conMembrana|MEMBRANA|\bM5\b|radioDeLaLosaConFormacion|ESCENA4_APAGADA/
afirmar(!codigo(ESCENA).some((c) => RESTOS.test(c)), '  y ningún fuente de la escena los nombra')
controlPositivo('el detector VE un resto', 'const pesoRef = useRef(null)', (c: string) => !RESTOS.test(c))

cerrar('s30-escena4')
