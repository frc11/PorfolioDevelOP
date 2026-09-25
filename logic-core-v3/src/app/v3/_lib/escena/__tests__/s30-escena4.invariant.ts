/**
 * SPRINT ESCENA 4 — lo que las pruebas de la escena prometen sin navegador.
 *
 * §1 · las banderas: todo apagado en el producto y en la base, y el pedido del banco se lee bien.
 * §2 · la formación: NINGUNA copia sale perfecta; ninguna entra en el claro ni sale del piso; todas
 *      miran al mismo lado salvo las mal montadas; las filas van intercaladas.
 * §3 · el peso del logo: en reposo vale exactamente cero, vuelve a cero, y al frenar un scroll se
 *      pasa del cero (eso es el peso).
 * §4 · la cúpula: el desajuste de M4 es entero en cada tramo y cambia suave; M3 corre una celda.
 * §5 · el túnel: el número que la escena trae se re-deriva de la sección de Trabajos.
 */
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { BASE_LIMPIA, ENTORNO, ESCENA4_APAGADA, entornoPedido } from '../entorno'
import { FALLAS, FORMACION, esPerfecta, formar, radioDelPisoDeAbajo, type Caja, type Copia, type MedidasDeLaCopia } from '../formacion/enFormacion'
import { REGION } from '../formacion/regiones'
import { M3, M4, corrimientoDelPulso, desajusteEn } from '../membrana/cupula'
import { avanzarElPeso, pesoInicial, type EstadoDelPeso } from '../peso/resortes'
import { pantallaDeProgreso, progresoDePantalla } from '../recorrido'
import { TUNEL_EN_LA_ESCENA, fueraDelTunel } from '../tunelEnLaEscena'
import { CAPAS_DEL_TUNEL } from '../../../_secciones/trabajos/tunel'
import { PANTALLAS_DE_LA_SECCION, SOLAPE_DE_LA_SECCION, ventanaDelTunel } from '../../../_secciones/trabajos/geometria'

// ── §1 · las banderas ─────────────────────────────────────────────────────
titulo('§1 · todo apagado, salvo en el banco')
afirmarIgual(ENTORNO.escena4, ESCENA4_APAGADA, 'el producto no trae ninguna prueba de ESCENA 4')
afirmarIgual(BASE_LIMPIA.escena4, ESCENA4_APAGADA, 'la base tampoco')
afirmarIgual(ESCENA4_APAGADA, { formacion: 'no', densidad: 'base', mirada: false, movil: 'ninguna', peso: false, membrana: false, estrellas: false, moire: 'hoy' }, '  y apagado es todo apagado (y en el teléfono, sin formación)')
const pedido = entornoPedido('E1,E4,E6,E7,L2,densidad=mas,mirada,movil=menos,peso,membrana,estrellas,moire=M3').escena4
afirmarIgual(pedido, { formacion: 'L2', densidad: 'mas', mirada: true, movil: 'menos', peso: true, membrana: true, estrellas: true, moire: 'M3' }, 'el pedido del banco prende cada una')
afirmarIgual(entornoPedido('E1,moire=M9').escena4.moire, 'hoy', 'una variante del moiré que no existe es la de hoy')

// ── §2 · la formación ─────────────────────────────────────────────────────
titulo('§2 · la formación')
// Una «cp» de juguete con las medidas del logo (6,86 × 5,0): alcanza para las reglas, que no miran la malla.
const cajaDeJuguete = (): Caja => ({ x0: -3.43, x1: 3.43, y0: 0, y1: 5, z0: -0.28, z1: 0.28 })
const medidas: MedidasDeLaCopia = { ancho: 6.86, alto: 5, caja: cajaDeJuguete }
const todas: { nombre: string; copias: Copia[] }[] = []
for (const lectura of ['L1', 'L2'] as const) {
  for (const densidad of ['menos', 'base', 'mas'] as const) {
    for (const movil of [false, true]) todas.push({ nombre: `${lectura} ${densidad}${movil ? ' móvil' : ''}`, copias: formar(lectura, densidad, medidas, { movil }) })
  }
}
const sanas = todas.flatMap((t) => t.copias.filter(esPerfecta).map(() => t.nombre))
afirmar(sanas.length === 0, 'NINGUNA copia sale perfecta, en ninguna lectura, densidad o ancho', `${String(todas.reduce((n, t) => n + t.copias.length, 0))} copias revisadas`)
const sana: Copia = { x: 30, z: 0, falla: 'color', anguloAlCentro: 0, retardo: 0, piezas: [{ region: REGION.todo, corte: 0, giro: [0, 0, 0], pivote: [0, 0, 0], escala: [1, 1, 1], desplazamiento: [0, 0, 0], tono: FORMACION.tono.base }] }
controlPositivo('una copia sana, armada a mano, SÍ se detecta como perfecta', [sana], (copias) => copias.filter(esPerfecta).length === 0)
const usadas = new Set(todas.flatMap((t) => t.copias.map((c) => c.falla)))
afirmar(FALLAS.every((f) => usadas.has(f)), 'aparecen todas las fallas de la lista', `${String(usadas.size)} de ${String(FALLAS.length)}`)
const base = todas.find((t) => t.nombre === 'L1 base')?.copias ?? []
afirmar(base.length > 200, 'la formación de base tiene sus cientos de copias', String(base.length))
for (const lectura of ['L1', 'L2'] as const) {
  const copias = todas.filter((t) => t.nombre.startsWith(lectura)).flatMap((t) => t.copias)
  const medio = (medidas.ancho * FORMACION[lectura].escala) / 2
  const adentro = copias.filter((c) => Math.hypot(Math.max(0, Math.abs(c.x) - medio), c.z) < radioDelPisoDeAbajo(lectura))
  const afuera = copias.filter((c) => Math.hypot(Math.abs(c.x) + medio, c.z) > FORMACION.radioExterior)
  afirmar(adentro.length === 0, `${lectura} · ninguna copia entra en el claro (ni su borde)`, `radio ${radioDelPisoDeAbajo(lectura).toFixed(1)}`)
  afirmar(afuera.length === 0, `${lectura} · ninguna sale del piso de abajo`, `radio ${FORMACION.radioExterior.toFixed(1)}`)
}
afirmar(FORMACION.radioDelClaro > 20, 'el claro es más grande que la distancia más larga de la cámara en las poses cercanas (20)')
const torcidas = base.filter((c) => c.falla !== 'malMontado' && c.piezas.some((p) => p.giro[1] !== 0))
afirmar(torcidas.length === 0, 'todas miran al mismo lado (+z): sólo las mal montadas giran sobre su eje')
// Filas intercaladas: en un mismo bloque, la fila siguiente queda corrida medio paso.
const filas = new Map<number, number[]>()
for (const c of base) filas.set(Math.round(c.z * 1000), [...(filas.get(Math.round(c.z * 1000)) ?? []), c.x])
const zs = [...filas.keys()].sort((a, b) => a - b)
const corridas = zs.slice(1).filter((z, i) => {
  const a = filas.get(zs[i]) ?? []
  const b = filas.get(z) ?? []
  const orden = [...a].sort((x, y) => x - y)
  const paso = Math.min(...orden.slice(1).map((x, k) => x - orden[k]).filter((d) => d > 0.01))
  return Number.isFinite(paso) && b.some((x) => a.some((y) => Math.abs(Math.abs(x - y) - paso / 2) < 0.01))
})
afirmar(corridas.length > zs.length / 3, 'las filas van intercaladas: una de cada dos queda corrida medio paso de la anterior', `${String(corridas.length)} de ${String(zs.length - 1)} pares de filas`)

// ── §3 · el peso del logo ─────────────────────────────────────────────────
titulo('§3 · el peso del logo')
const valores = (e: EstadoDelPeso): number[] => [e.costado.x, e.arriba.x, e.bajada.x, e.cabeceo.x]
let e = pesoInicial(0.2)
for (let i = 0; i < 120; i += 1) e = avanzarElPeso(e, { dt: 1 / 60, progreso: 0.2, cursor: null, apagado: false })
afirmar(valores(e).every((v) => v === 0), 'con el cursor afuera y el scroll quieto vale EXACTAMENTE cero: la pose de reposo no cambia')
e = pesoInicial(0.2)
let maximo = 0
for (let i = 0; i < 300; i += 1) {
  e = avanzarElPeso(e, { dt: 1 / 60, progreso: 0.2, cursor: { x: 1, y: 1 }, apagado: false })
  maximo = Math.max(maximo, e.costado.x)
}
const hacia = e.costado.x
afirmar(hacia > 0.05 && hacia < 0.1, 'hacia el cursor se inclina pocos grados', `${((hacia * 180) / Math.PI).toFixed(1)}°`)
afirmar(maximo > 0.07 * 1.05, '  con resorte: se pasa del objetivo antes de asentarse', `pico ${((maximo / 0.07) * 100).toFixed(0)} % del objetivo`)
for (let i = 0; i < 300; i += 1) e = avanzarElPeso(e, { dt: 1 / 60, progreso: 0.2, cursor: null, apagado: false })
afirmar(valores(e).every((v) => Math.abs(v) < 1e-3), '  y con el cursor afuera vuelve a cero')
// Un scroll fuerte y un frenazo: la bajada va para abajo mientras corre y se pasa para arriba al frenar.
e = pesoInicial(0.2)
let p = 0.2
let masBajo = 0
for (let i = 0; i < 30; i += 1) {
  p += 0.12 / 60
  e = avanzarElPeso(e, { dt: 1 / 60, progreso: p, cursor: null, apagado: false })
  masBajo = Math.min(masBajo, e.bajada.x)
}
let seLevanta = 0
for (let i = 0; i < 120; i += 1) {
  e = avanzarElPeso(e, { dt: 1 / 60, progreso: p, cursor: null, apagado: false })
  seLevanta = Math.max(seLevanta, e.bajada.x)
}
afirmar(masBajo < -0.1 && seLevanta > 0.02, 'al frenar un scroll fuerte se pasa del cero y se asienta', `baja ${masBajo.toFixed(3)} y se pasa ${seLevanta.toFixed(3)}`)
e = pesoInicial(0.2)
for (let i = 0; i < 60; i += 1) e = avanzarElPeso(e, { dt: 1 / 60, progreso: 0.2 + i * 0.002, cursor: { x: 1, y: 1 }, apagado: true })
afirmar(valores(e).every((v) => v === 0), 'apagado (táctil, reducido, túnel o viaje) no se mueve nada')

// ── §4 · la cúpula ────────────────────────────────────────────────────────
titulo('§4 · la cúpula')
const enteros = M4.tramos.map((t, i) => desajusteEn(i + 1 < M4.tramos.length ? (t.desde + M4.tramos[i + 1].desde) / 2 : t.desde + M4.transicion + 0.005))
afirmarIgual(enteros, M4.tramos.map((t) => t.desajuste), 'M4 · en el medio de cada tramo el desajuste es su entero (cierra alrededor del cilindro)')
let salto = 0
for (let q = 0; q < 1; q += 0.0005) salto = Math.max(salto, Math.abs(desajusteEn(q + 0.0005) - desajusteEn(q)))
afirmar(salto < 0.2, 'M4 · y cambia suave: ningún salto entre dos progresos vecinos', `salto máximo ${salto.toFixed(3)}`)
afirmar(corrimientoDelPulso(-1) === 0 && Math.abs(corrimientoDelPulso(M3.duraS * 2) - M3.celdas) < 1e-9, 'M3 · el principal corre la fase una celda, y ahí se queda')

// ── §5 · el túnel ─────────────────────────────────────────────────────────
titulo('§5 · el túnel de Trabajos en el progreso de la escena')
// El progreso de Trabajos corre de `top bottom` a `bottom bottom`: arranca una pantalla antes de la caja,
// que a su vez empieza el solape antes de la pantalla de su nudo (0,5).
const arranqueDeLaCaja = pantallaDeProgreso(0.5) - SOLAPE_DE_LA_SECCION - 1
const derivado = progresoDePantalla(arranqueDeLaCaja + PANTALLAS_DE_LA_SECCION * ventanaDelTunel(CAPAS_DEL_TUNEL.proyectos.length).desde)
afirmar(Math.abs(derivado - TUNEL_EN_LA_ESCENA.desde) < 0.001, 'el arranque del túnel que trae la escena es el de la sección', `derivado ${derivado.toFixed(5)} · traído ${String(TUNEL_EN_LA_ESCENA.desde)}`)
afirmar(fueraDelTunel(0.5) === 1 && fueraDelTunel(TUNEL_EN_LA_ESCENA.desde) === 0 && fueraDelTunel(0.6) === 0 && fueraDelTunel(0.9) === 1, 'fuera del túnel vale 1 (Trabajos arriba, Por qué develOP) y adentro 0')

cerrar('s30-escena4')
