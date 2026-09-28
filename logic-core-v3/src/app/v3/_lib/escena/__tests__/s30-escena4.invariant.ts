/**
 * SPRINT ESCENA 4 y 5 — lo que las pruebas de la escena prometen sin navegador.
 *
 * §1 · las banderas: el moiré vivo y el polvo parejo prendidos en el producto, las pruebas apagadas,
 *      la base sin nada, y el pedido del banco se lee bien.
 * §2 · la formación: NINGUNA copia sale perfecta; todas afuera de la trama y del escenario, adentro
 *      del piso de abajo; cada bloque mira al escenario; las filas van intercaladas.
 * §3 · la cámara: nunca sale del cilindro de la trama ni se acerca a una copia, en todo el recorrido.
 * §4 · el moiré: M1a y M2 se suman con tope; M4 es entero en cada tramo y cambia suave; M3 corre una celda.
 * §5 · el polvo: la caja se repite sin salto; el polvo se posa y despierta; la forma del logo lo saca.
 * §6 · la sombra según el haz (5c): sin haz no cambia nada; de noche más dura, de día más difusa.
 * §7 · el túnel: el número que la escena trae se re-deriva de la sección de Trabajos.
 * §8 · la limpieza: del logo con peso, de la membrana y de M5 no queda código.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
import { MOUSE_HEIGHT_FACTOR } from '../choreographyPhysics'
import { buildTrack, sampleTrack } from '../choreographySampler'
import type { MutableChoreoPose } from '../choreographyTypes'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { ESTRELLAS } from '../estrellas/Estrellas'
import { FALLAS, FORMACION, anguloDelBloque, esPerfecta, formar, type Caja, type Copia, type MedidasDeLaCopia } from '../formacion/enFormacion'
import { REGION } from '../formacion/regiones'
import { M1A, M2, M3, M4, PERIODO_DE_LA_BASE_S, corrimientoDelPulso, desajusteEn, velocidadDeLaGruesa } from '../moire/variantes'
import { distanciaAlLogo, formaDelLogo } from '../polvo/obstaculo'
import { NUNCA, POSARSE, avanzarElPolvo, polvoInicial, posadaEn } from '../polvo/posarse'
import { POLVO_PAREJO, envolver } from '../polvo/volumen'
import { CAMERA_FOV, PROBE_SVG_SCALE } from '../probeScene'
import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../probeMoire'
import { pantallaDeProgreso, progresoDePantalla } from '../recorrido'
import { manchasDelHaz } from '../sombra/sombraDelHaz'
import { TUNEL_EN_LA_ESCENA, fueraDelTunel } from '../tunelEnLaEscena'
import { CAPAS_DEL_TUNEL } from '../../../_secciones/trabajos/tunel'
import { PANTALLAS_DE_LA_SECCION, SOLAPE_DE_LA_SECCION, ventanaDelTunel } from '../../../_secciones/trabajos/geometria'

// ── §1 · las banderas ─────────────────────────────────────────────────────
titulo('§1 · el moiré y el polvo prendidos, las pruebas apagadas, salvo en el banco')
afirmar(ENTORNO.moire && ENTORNO.polvoParejo, 'el producto trae el moiré vivo (M1a + M2 + M3 + M4) y el polvo parejo')
afirmar(!BASE_LIMPIA.moire && !BASE_LIMPIA.polvoParejo, 'la base, el moiré y el polvo de antes')
afirmarIgual(ENTORNO.pruebas, PRUEBAS_APAGADAS, 'el producto no trae ninguna prueba')
afirmarIgual(BASE_LIMPIA.pruebas, PRUEBAS_APAGADAS, '  la base tampoco')
afirmarIgual(
  PRUEBAS_APAGADAS,
  { formacion: false, mirada: false, movil: 'ninguna', estrellas: false, obstaculo: false, posarse: false, sombraHaz: false, motas: false, relieve: 'no', relieveVivo: false },
  '  y apagado es todo apagado (y en el teléfono, sin formación)',
)
const pedido = entornoPedido('producto,formacion,mirada,movil=menos,estrellas,obstaculo,posarse,sombra=haz,motas,R2,relieve=vivo')
afirmar(pedido.E1 && pedido.E4 && pedido.E6 && pedido.E7 && pedido.moire && pedido.polvoParejo, 'con `producto` se parte del producto')
afirmarIgual(
  pedido.pruebas,
  { formacion: true, mirada: true, movil: 'menos', estrellas: true, obstaculo: true, posarse: true, sombraHaz: true, motas: true, relieve: 'R2', relieveVivo: true },
  '  y el pedido del banco prende cada prueba',
)
const antes = entornoPedido('producto,moire=hoy,polvo=antes')
afirmar(!antes.moire && !antes.polvoParejo && antes.E1, '`moire=hoy` y `polvo=antes` dan el producto con el moiré y el polvo de la base')
afirmar(!entornoPedido('E1,E4,E6,E7').moire && entornoPedido('E1,moire').moire, 'sin `producto`, sólo lo que la lista nombra')
controlPositivo('el detector VE un pedido que prende de más', 'E1,E4,formacion', (p: string) => !entornoPedido(p).pruebas.formacion && !entornoPedido(p).moire)

// ── §2 · la formación ─────────────────────────────────────────────────────
titulo('§2 · la formación')
// Una «cp» de juguete con las medidas del logo (6,86 × 5,0): alcanza para las reglas, que no miran la malla.
const cajaDeJuguete = (): Caja => ({ x0: -3.43, x1: 3.43, y0: 0, y1: 5, z0: -0.28, z1: 0.28 })
const medidas: MedidasDeLaCopia = { ancho: 6.86, alto: 5, caja: cajaDeJuguete }
const todas: { nombre: string; copias: Copia[] }[] = []
for (const semilla of [0x0cf0a11a, 1, 2, 3, 4, 5, 6, 7]) for (const movil of [false, true]) todas.push({ nombre: `semilla ${String(semilla)}${movil ? ' móvil' : ''}`, copias: formar(medidas, { semilla, movil }) })
const sanas = todas.flatMap((t) => t.copias.filter(esPerfecta).map(() => t.nombre))
afirmar(sanas.length === 0, 'NINGUNA copia sale perfecta, con ninguna semilla ni en el teléfono', `${String(todas.reduce((n, t) => n + t.copias.length, 0))} copias revisadas`)
const sana: Copia = { x: 50, z: 0, mira: 0, bloque: 0, fila: 0, falla: 'color', anguloAlCentro: 0, retardo: 0, piezas: [{ region: REGION.todo, corte: 0, giro: [0, 0, 0], pivote: [0, 0, 0], escala: [1, 1, 1], desplazamiento: [0, 0, 0], tono: FORMACION.tono.base }] }
controlPositivo('una copia sana, armada a mano, SÍ se detecta como perfecta', [sana], (copias) => copias.filter(esPerfecta).length === 0)
const usadas = new Set(todas.flatMap((t) => t.copias.map((c) => c.falla)))
afirmar(FALLAS.length === 17 && FALLAS.every((f) => usadas.has(f)), 'se mantienen las 17 fallas de pieza rígida, y aparecen todas', `${String(usadas.size)} de ${String(FALLAS.length)}`)
const base = formar(medidas)
const f = FORMACION
afirmar(f.escala >= 0.85 && f.escala <= 1, 'del tamaño casi del logo: no son miniaturas', `escala ${String(f.escala)}`)
// La huella de cada copia: un rectángulo de ancho × espesor (con lo que corren las piezas), girado a donde mira.
const medioAncho = (medidas.ancho * f.escala) / 2 + 0.3
const medioHondo = 0.9 * f.escala
const esquinas = (c: Copia): [number, number][] =>
  [[-medioAncho, -medioHondo], [medioAncho, -medioHondo], [medioAncho, medioHondo], [-medioAncho, medioHondo]].map(([a, b]) => [c.x + a * Math.cos(c.mira) + b * Math.sin(c.mira), c.z - a * Math.sin(c.mira) + b * Math.cos(c.mira)])
const radios = base.flatMap((c) => esquinas(c).map(([x, z]) => Math.hypot(x, z)))
afirmar(f.radioDelEscenario > MOIRE_FAR_RADIUS, 'el escenario termina afuera de la capa gruesa', `${String(f.radioDelEscenario)} contra ${String(MOIRE_FAR_RADIUS)}`)
afirmar(Math.min(...radios) > f.radioDelEscenario + 1, 'ninguna copia entra en el escenario (ni su borde)', `la más adentro, a ${Math.min(...radios).toFixed(2)}`)
afirmar(Math.max(...radios) < f.radioDelPisoDeAbajo - 1, '  ni sale del piso de abajo', `la más afuera, a ${Math.max(...radios).toFixed(2)} contra ${String(f.radioDelPisoDeAbajo)}`)
const angulos = new Set(base.map((c) => Math.round(Math.atan2(Math.sin(c.mira), Math.cos(c.mira)) * 1000)))
afirmar(angulos.size === f.bloques, 'en cada bloque todas miran al mismo lado: un ángulo por bloque', `${String(angulos.size)} ángulos, ${String(f.bloques)} bloques`)
const alEscenario = base.every((c) => Math.abs(Math.cos(c.mira - (anguloDelBloque(c.bloque) + Math.PI)) - 1) < 1e-9)
afirmar(alEscenario, '  y ese lado es el escenario: cada bloque mira al centro')
const torcidas = base.filter((c) => c.falla !== 'malMontado' && c.piezas.some((p) => p.giro[1] !== 0))
afirmar(torcidas.length === 0, '  sólo las mal montadas giran sobre su eje')
const intercaladas = base.filter((c) => c.bloque === 0).reduce((n, c) => n + (c.fila % 2), 0)
afirmar(intercaladas === (f.bloque.columnas - 1) * Math.floor(f.bloque.filas / 2), 'las filas van intercaladas: la impar lleva una menos, corrida media posición')
afirmar(base.length > 100 && base.length < 160, 'la formación de base', `${String(base.length)} copias en ${String(f.bloques)} bloques`)

// ── §3 · la cámara ────────────────────────────────────────────────────────
titulo('§3 · la cámara nunca sale del cilindro ni se acerca a una copia')
const pista = buildTrack(CHOREO_KEYFRAMES)
const pose: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
let radioMaximo = 0
let masCerca = { d: Infinity, p: 0 }
for (let p = 0; p <= 1; p += 0.0005) {
  sampleTrack(pista, p, pose)
  radioMaximo = Math.max(radioMaximo, pose.distance)
  for (const h of [-1, 1]) {
    for (const extra of [-8, 0, 8]) {
      const a = ((pose.angleDeg + extra) * Math.PI) / 180
      const cam: [number, number, number] = [Math.sin(a) * pose.distance, pose.height + h * MOUSE_HEIGHT_FACTOR * pose.distance, Math.cos(a) * pose.distance]
      for (const c of base) {
        // La cámara en el espacio de la copia: el ancho va de costado y el espesor hacia donde mira.
        const [dx, dz] = [cam[0] - c.x, cam[2] - c.z]
        const costado = dx * Math.cos(c.mira) - dz * Math.sin(c.mira)
        const frente = dx * Math.sin(c.mira) + dz * Math.cos(c.mira)
        const d = Math.hypot(Math.max(0, Math.abs(costado) - medioAncho), Math.max(0, Math.abs(frente) - medioHondo))
        if (d < masCerca.d) masCerca = { d, p }
      }
    }
  }
}
afirmar(radioMaximo < MOIRE_FAR_RADIUS, 'la cámara no sale nunca del cilindro de la trama (la capa gruesa)', `radio máximo ${radioMaximo.toFixed(1)} (el pie) contra ${String(MOIRE_FAR_RADIUS)}; la fina está en ${String(MOIRE_NEAR_RADIUS)}`)
afirmar(masCerca.d > 6, 'ninguna copia queda cerca de la lente', `la más cercana, a ${masCerca.d.toFixed(1)} de su huella (p ${masCerca.p.toFixed(3)}), y detrás de la cámara`)
// Todas las direcciones que la cámara llega a ver caen en la banda de las estrellas.
const bajada = Math.max(...CHOREO_KEYFRAMES.map((k) => (Math.atan2(k.pose.height, k.pose.distance) * 180) / Math.PI))
const subida = Math.max(...CHOREO_KEYFRAMES.map((k) => (-Math.atan2(k.pose.height, k.pose.distance) * 180) / Math.PI))
afirmar(ESTRELLAS.elevacion.desde < -(bajada + CAMERA_FOV / 2) && ESTRELLAS.elevacion.hasta > subida + CAMERA_FOV / 2, 'las estrellas cubren todo el cielo que la cámara puede ver', `de ${(-(bajada + CAMERA_FOV / 2)).toFixed(1)}° a ${(subida + CAMERA_FOV / 2).toFixed(1)}°`)

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
afirmar(posadaEn(POSARSE.empiezaS - 0.01, 0) === 0 && posadaEn(POSARSE.asentadoS, 0) === 1, '5b · el polvo empieza a bajar a los 8 s de quietud y a los 25 está en el piso')
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
