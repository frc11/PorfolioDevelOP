/**
 * SPRINT INTERFAZ 2 — el invariante del sprint: una sección por ticket, con sus controles positivos.
 *
 * T1 · la escena responde a la interfaz (`responde=si`): el pulso principal que pide un CTA por la MISMA máquina de E4,
 * la onda del piso hacia un valor de Por qué develOP, y la sala que se oscurece y se desenfoca detrás del menú del
 * teléfono. Sin la bandera, todo como estaba.
 *
 * Lo que necesita navegador (que la onda se vea, que el lienzo se desenfoque) está en los bancos de `scripts-interfaz2/`
 * y sus entregas en `~/.cache/b4-medicion/interfaz2/`.
 */
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { DIA_DEL_RELOJ, NOCHE_DEL_RELOJ, colorDeLaLuz, lugarEnElDisco } from '../../_chrome/recorrido/RelojDelDia'
import { SECCIONES_DEL_RECORRIDO, TRAZO_DEL_INFINITO, TRAZO_DEL_PALO, avanceDeLaPagina, avanceDelRecorrido, dibujado, iniciosDelRecorrido, seccionDelTramo } from '../../_chrome/recorrido/recorrido'
import { SELECTOR_DE_LOS_VIAJES } from '../../_componentes/deslizamiento'
import { IDS_DE_SECCION } from '../../_secciones/_contrato/forma'
import { PanelEnVivo } from '../../_componentes/vida/PanelEnVivo'
import { CONTADOR_DE_EJEMPLO, PEDIDOS_DE_EJEMPLO, PROCESOS_DE_EJEMPLO, QUIEN_DE_EJEMPLO, ROTULO_DE_EJEMPLO, ROTULO_DEL_PROCESO, TOPE_DEL_CONTADOR } from '../../_componentes/vida/ejemplos'
import { IDS_DE_SERVICIO } from '../../_secciones/_contrato/acento'
import { ONDA_DE_LA_PORTADA, colaDeLaOnda, frenteDeLaOnda, pixelDelMapa } from '../../_secciones/trabajos/demos/ondaDeLaPortada'

import { SELECTOR_DE_LOS_ITEMS } from '../../_chrome/escena/AnticipacionDelMenu'
import { SELECTOR_DE_LOS_CTA, SELECTOR_DE_LOS_VALORES, centroNormalizado } from '../../_chrome/escena/RespuestaDeLaEscena'
import { ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { ENCENDIDO } from '../escena/entorno/encendido'
import { ANILLOS_GLSL } from '../escena/entorno/Pulso'
import { PULSO, avanzarElPulso, pulsoInicial, type EntradasDelPulso, type EstadoDelPulso } from '../escena/entorno/maquinaDelPulso'
import { ANTICIPACION, anticipacionInicial, avanzarLaAnticipacion, luzDeLaAnticipacion, planDeLaAnticipacion, type EstadoDeLaAnticipacion, type PlanDeAnticipacion } from '../escena/interfaz/anticipacion'
import { MENU_DE_LA_INTERFAZ, VIGENCIA_DEL_PEDIDO_MS, pedirLaOnda, vigente } from '../escena/interfaz/pedidos'
import { RESPUESTA, RESPUESTA_EN_VIVO, giroDeLaInterfaz, nivelConLaInterfaz } from '../escena/interfaz/respuesta'
import { NIVEL_DE_LA_NOCHE } from '../escena/lightArc'
import { brilloDeLaNocheEn } from '../escena/particleGlow'
import { RIM_NIGHT_LEVEL } from '../escena/probeLighting'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { ANCLAS_DEL_DIBUJO, ONDA_DIRIGIDA, ONDA_EN_VIVO, atenderLaOnda, conOndaDirigida } from '../escena/piso/ondaDirigida'
import { FLOOR_Y } from '../escena/probeScene'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const veces = (texto: string, aguja: string): number => texto.split(aguja).length - 1

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 0 · La bandera: apagada en el producto, `responde=si` la pide')

afirmar(PRUEBAS_APAGADAS.responde === 'no' && ENTORNO.pruebas.responde === 'no', 'apagada en el producto y en la lista de pruebas apagadas')
afirmar(entornoPedido('producto,responde=si').pruebas.responde === 'si' && entornoPedido('producto,responde=otro').pruebas.responde === 'no', '`responde=si` la prende (con banco o en la URL); otro valor, no')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 1 · El pulso que pide un CTA: el principal de E4, por la misma máquina')

type Pedido = { readonly desde: number; readonly hasta: number; readonly scroll?: boolean; readonly pedidos?: readonly number[] }
const DT = 1 / 60
/** Recorre la máquina con pedidos en ciertos instantes; devuelve los principales que nacieron y todos los estados. */
function recorrer(tramos: readonly Pedido[], maquina: (s: EstadoDelPulso, e: EntradasDelPulso) => EstadoDelPulso = avanzarElPulso, conPedido = true): { principales: number[]; estados: EstadoDelPulso[] } {
  let estado = pulsoInicial(0)
  const estados: EstadoDelPulso[] = []
  const vistos = new Set<number>()
  const principales: number[] = []
  for (const tramo of tramos) {
    const pendientes = [...(tramo.pedidos ?? [])]
    for (let t = tramo.desde; t < tramo.hasta - 1e-9; t += DT) {
      const pedido = pendientes.length > 0 && t >= pendientes[0] ? (pendientes.shift(), true) : false
      const e: EntradasDelPulso = conPedido ? { t, scrollEnMovimiento: tramo.scroll ?? false, hover: false, reducido: false, pedido } : { t, scrollEnMovimiento: tramo.scroll ?? false, hover: false, reducido: false }
      estado = maquina(estado, e)
      estados.push(estado)
      for (const a of estado.anillos) {
        if (a.clase !== 'principal' || vistos.has(a.nace)) continue
        vistos.add(a.nace)
        principales.push(a.nace)
      }
    }
  }
  return { principales, estados }
}

const uno = recorrer([{ desde: 0, hasta: 10, pedidos: [5] }])
afirmar(uno.principales.length === 1 && Math.abs(uno.principales[0] - 5) < 2 * DT, 'un CTA con el puntero encima: nace un PRINCIPAL en ese instante', JSON.stringify(uno.principales))
const repetido = recorrer([{ desde: 0, hasta: 12, pedidos: [5, 5.5, 6, 7] }])
afirmar(
  repetido.principales.length === 2 && Math.abs(repetido.principales[1] - 7) < 2 * DT,
  `  entrar y salir del CTA no los apila: otro principal recién a los ${String(PULSO.pedidoCadaS)} s del anterior`,
  JSON.stringify(repetido.principales),
)
afirmar(recorrer([{ desde: 0, hasta: 10, scroll: true, pedidos: [5] }]).principales.length === 0, '  con el scroll en movimiento no nace (como cualquier anillo de E4)')
afirmar(recorrer([{ desde: 0, hasta: 12, pedidos: [1, 2.7, 4.4, 6.1, 7.8] }]).estados.every((s) => s.anillos.length <= PULSO.tope), `  y nunca hay más de ${String(PULSO.tope)} vivos`)
const sinPedido = recorrer([{ desde: 0, hasta: 20 }], avanzarElPulso, false)
const conPedidoFalso = recorrer([{ desde: 0, hasta: 20 }], avanzarElPulso, true)
afirmar(JSON.stringify(conPedidoFalso.estados) === JSON.stringify(sinPedido.estados), 'sin pedido, la máquina es la de siempre: el mismo recorrido, cuadro por cuadro', `${String(sinPedido.estados.length)} cuadros`)
const glotona = (s: EstadoDelPulso, e: EntradasDelPulso): EstadoDelPulso => (e.pedido === true ? { ...s, anillos: [...s.anillos, { nace: e.t, clase: 'principal' }] } : avanzarElPulso(s, e))
controlPositivo('el chequeo del apilado ve una máquina que larga un principal por cada pedido', [{ desde: 0, hasta: 12, pedidos: [5, 5.5, 6, 7] }] as readonly Pedido[], (t: readonly Pedido[]) => recorrer(t, glotona).principales.length === 2)

afirmar(vigente(0, 100) && !vigente(0, VIGENCIA_DEL_PEDIDO_MS + 1) && !vigente(10, 5), `un pedido vale ${String(VIGENCIA_DEL_PEDIDO_MS)} ms: la escena suspendida no lo cobra al volver`)
const ENTORNO_TSX = leer('_lib/escena/entorno/Entorno.tsx')
afirmar(/if \(e\.pruebas\.responde === 'si' && PULSO_PEDIDO\.n !== m\.pulsoAtendido\) \{\s*m\.pulsoAtendido = PULSO_PEDIDO\.n\s*entradas\.pedido = vigente\(PULSO_PEDIDO\.cuando, performance\.now\(\)\)/.test(ENTORNO_TSX), 'la escena atiende el pedido sólo con la bandera, una vez, y si es reciente')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 2 · La onda del piso hacia un valor: inyectada sólo con la bandera')

const conOnda = conOndaDirigida(SIMULACION_GLSL)
afirmar(veces(conOnda, 'uniform vec4 uOnda;') === 1 && veces(conOnda, 'fuerza += empujeDeLaOnda( p, r * uLado );') === 1, 'la simulación con la onda: su uniform y su empuje, una vez cada uno, junto a los anillos')
afirmar(!SIMULACION_GLSL.includes('uOnda'), '  y la simulación del producto no se tocó')
controlPositivo('la inyección se niega si la simulación cambió (no entra a ciegas)', 'void main() {}', (glsl: string) => {
  try {
    conOndaDirigida(glsl)
    return true
  } catch {
    return false
  }
})
afirmar(ANILLOS_GLSL.includes(ANCLAS_DEL_DIBUJO.funcion) && leer('_lib/escena/piso/bloques.ts').includes(ANCLAS_DEL_DIBUJO.mezcla), 'las dos anclas del dibujo (la banda de los anillos) existen: la onda se ve como un anillo')
const PISO_VIVO_TSX = leer('_lib/escena/piso/PisoVivo.tsx')
afirmar(
  PISO_VIVO_TSX.includes('conOnda ? conOndaDirigida(SIMULACION_GLSL) : SIMULACION_GLSL') && PISO_VIVO_TSX.includes('if (conOnda) conLaOndaEnElPiso(material)') && /const conOnda = entornoDeLaEscena\(\)\.pruebas\.responde === 'si'/.test(PISO_VIVO_TSX),
  'el piso vivo arma la onda (simulación y dibujo) sólo con `responde=si`',
)

// La dirección: una cámara como la del final (al ras, mirando al logo) y un valor a cada lado.
const camara = new THREE.PerspectiveCamera(40, 1440 / 900, 0.1, 400)
camara.position.set(0, FLOOR_Y + 1.6, 15.6)
camara.lookAt(0, 0, 0)
camara.updateMatrixWorld()
const direccionPara = (x: number, ahora: number): number[] => {
  pedirLaOnda(x, 0.35, ahora)
  atenderLaOnda(camara, ahora / 1000, ahora + 10)
  return ONDA_EN_VIVO.uOnda.value.toArray()
}
ONDA_EN_VIVO.uOnda.value.set(0, 1, 0, 0)
const izquierda = direccionPara(-0.65, 10_000)
const derecha = direccionPara(0.65, 20_000)
afirmar(izquierda[3] === 1 && izquierda[1] < -0.2 && derecha[1] > 0.2, 'un valor a la izquierda del logo da una onda hacia la izquierda; uno a la derecha, hacia la derecha', JSON.stringify({ izquierda, derecha }))
afirmar(izquierda[2] > 0 && derecha[2] > 0, '  y hacia el piso que se ve (del lado de la cámara): no corre por la franja del horizonte')
const antes = ONDA_EN_VIVO.uOnda.value.toArray()
pedirLaOnda(-0.65, 0.35, 20_200)
atenderLaOnda(camara, 20.2, 20_210)
afirmarIgual(ONDA_EN_VIVO.uOnda.value.toArray(), antes, `  una onda no corta a otra más joven que ${String(ONDA_DIRIGIDA.cadaS)} s`)
pedirLaOnda(-0.65, 0.35, 30_000)
atenderLaOnda(camara, 40, 30_000 + VIGENCIA_DEL_PEDIDO_MS + 50)
afirmarIgual(ONDA_EN_VIVO.uOnda.value.toArray(), antes, '  y un pedido viejo no se atiende')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 3 · El menú del teléfono: la sala se oscurece apenas (su luz) y se desenfoca (el lienzo)')

const SIN_BANDERAS = { responde: false, anticipa: false }
const SOLO_RESPONDE = { responde: true, anticipa: false }
afirmar([1, 0.5, 0.04, 0.3].every((n) => nivelConLaInterfaz(n, 1 / 60, SIN_BANDERAS) === n), 'sin la bandera el rig recibe EXACTAMENTE el mismo nivel')
const correrMenu = (abierto: boolean, nivel: number, segundos: number, hz: number): number => {
  MENU_DE_LA_INTERFAZ.abierto = abierto
  let n = nivel
  for (let k = 0; k < Math.round(segundos * hz); k += 1) n = nivelConLaInterfaz(nivel, 1 / hz, SOLO_RESPONDE)
  return n
}
RESPUESTA_EN_VIVO.menu = 0
const abierto380 = correrMenu(true, 1, 0.38, 60)
afirmar(abierto380 <= 1 - 0.95 * RESPUESTA.menu.oscurece + 1e-6 && abierto380 >= 1 - RESPUESTA.menu.oscurece - 1e-6, `con el menú abierto, a los 380 ms del menú la luz bajó el 95 % de lo que baja (${String(RESPUESTA.menu.oscurece)}): ${abierto380.toFixed(3)}`)
RESPUESTA_EN_VIVO.menu = 0
const a144 = correrMenu(true, 1, 0.2, 144)
RESPUESTA_EN_VIVO.menu = 0
const a60 = correrMenu(true, 1, 0.2, 60)
afirmar(Math.abs(a144 - a60) < 1e-3, `  en segundos: la misma luz a 60 y a 144 Hz (${a60.toFixed(4)} y ${a144.toFixed(4)})`)
afirmar(correrMenu(true, NIVEL_DE_LA_NOCHE, 1, 60) >= NIVEL_DE_LA_NOCHE - 1e-9, '  de noche no baja de la noche')
afirmar(correrMenu(false, 1, 0.8, 60) > 0.999, '  al cerrar vuelve a la luz entera')
RESPUESTA_EN_VIVO.menu = 0
MENU_DE_LA_INTERFAZ.abierto = false
afirmar(/arc\.level = nivelConLaNocheDisparada\(arc\.level\)\s*\/\/[^\n]*\n\s*arc\.level = nivelConLaInterfaz\(arc\.level, Math\.min\(delta, 0\.1\)\)/.test(leer('_lib/escena/OrbitRig.tsx')), 'el rig la aplica DESPUÉS de la noche disparada: la luz de salida de un viaje (`NIVEL_NATURAL`) queda limpia')

const MENU_MOVIL = leer('_chrome/menu/MenuMovil.tsx')
// Las clases del velo, partidas: el escaneo de Tailwind lee este archivo (CLAUDE.md, modo pulido).
const VELO_POCO = ['backdrop-blur-', '[calc(var(--blur-panel)/3)]'].join('')
const VELO_ENTERO = ['backdrop-blur-', '[var(--blur-panel)]'].join('')
afirmar(MENU_MOVIL.includes(`salaDetras ? '${VELO_POCO}' : '${VELO_ENTERO}'`), 'con la bandera el velo desenfoca POCO la página (un tercio) y la que se va de foco es la sala; sin ella, el velo de siempre')
afirmar(/useEffect\(\(\) => \{\s*if \(!responde\) return undefined\s*salaDetrasDelMenu\(abierto\)\s*return \(\) => salaDetrasDelMenu\(false\)\s*\}, \[responde, abierto\]\)/.test(MENU_MOVIL), '  el menú avisa al abrir y al cerrar (y al desmontarse), sólo con la bandera')
const SALA = leer('_chrome/escena/salaDetrasDelMenu.ts')
afirmar(SALA.includes("document.querySelector<HTMLElement>('[data-escena]')") && SALA.includes("'blur(var(--blur-panel))'"), '  el lienzo de la escena toma el desenfoque entero (`--blur-panel`), con la duración del menú')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 4 · Lo que escucha el DOM')

afirmarIgual(centroNormalizado({ left: 0, top: 0, width: 100, height: 100 }, 200, 200), [-0.5, 0.5], 'el centro de una pieza en coordenadas del lienzo (y hacia arriba)')
afirmar(SELECTOR_DE_LOS_CTA.includes('[data-pieza="cta"]') && SELECTOR_DE_LOS_CTA.includes('[data-pieza="ventana-del-cta"]') && SELECTOR_DE_LOS_VALORES === '[data-pieza="valor"]', 'los CTA del sistema y la ventana de «Hablemos» del túnel piden el pulso; los valores, la onda')
const RESPUESTA_TSX = leer('_chrome/escena/RespuestaDeLaEscena.tsx')
afirmar(RESPUESTA_TSX.includes("if (responde !== 'si') return undefined") && RESPUESTA_TSX.includes("(e.pointerType !== 'mouse' && e.pointerType !== 'pen') || !fino.matches"), 'sin la bandera no escucha nada; con ella, sólo el puntero fino (un toque no tiene «encima»)')
afirmar(leer('_chrome/ChromeDelHome.tsx').includes('<RespuestaDeLaEscena />'), 'montada en el chrome del home (no en una pieza compartida)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · 1 · La vista previa del destino: hacia la luz del destino, adentro de la clase de la sala')

afirmar(PRUEBAS_APAGADAS.anticipa === 'no' && entornoPedido('producto,anticipa=si').pruebas.anticipa === 'si', 'apagada en el producto; `anticipa=si` la pide')
const haciaLaNoche = luzDeLaAnticipacion('dia-a-noche', 1, null)
afirmar(haciaLaNoche < -0.3 && brilloDeLaNocheEn(1 + haciaLaNoche) === 0, `de día, hacia Trabajos: la luz baja (${haciaLaNoche.toFixed(3)}) sin cruzar a la noche (las motas no brillan, el haz no se enciende)`)
const haciaElDia = luzDeLaAnticipacion('noche-a-dia', NIVEL_DE_LA_NOCHE, null)
afirmar(haciaElDia > 0 && brilloDeLaNocheEn(NIVEL_DE_LA_NOCHE + haciaElDia) >= ENCENDIDO.prende, `de noche, hacia una sección de día: la luz sube (${haciaElDia.toFixed(3)}) sin dejar la noche (el brillo queda arriba de lo que prende el haz)`)
afirmar(luzDeLaAnticipacion('dia-a-noche', RIM_NIGHT_LEVEL + 0.02, null) <= 0, '  una sala de día pegada a la frontera no se ACLARA para anticipar la noche')
afirmar(luzDeLaAnticipacion('dia-a-dia', 1, 1) === 0 && luzDeLaAnticipacion('noche-a-noche', NIVEL_DE_LA_NOCHE, null) === 0, '  de día a día con la misma luz (Servicios, Por qué develOP): sólo la cámara')
const planHaciaAbajo = planDeLaAnticipacion('trabajos', 'dia-a-noche', 1, null, 0, 5000, 0)
const planHaciaArriba = planDeLaAnticipacion('quienes-somos', 'dia-a-dia', 1, 1, 9000, 1000, 0)
afirmar(planHaciaAbajo.sentido === 1 && planHaciaArriba.sentido === -1, 'la cámara gira hacia donde queda el destino: el ángulo de la pista crece con el progreso')

titulo('T2 · 2 · Sube, se sostiene un segundo, vuelve; con el clic, el viaje sale de ahí')

/** Corre la anticipación cuadro a cuadro: `plan` desde `t0`, y un viaje desde `tViaje` (el scroll de y0 a y1 en 2,6 s). */
function anticipar(plan: PlanDeAnticipacion | null, hz: number, segundos: number, viaje?: { readonly desde: number; readonly destino: string; readonly y0: number; readonly y1: number }, maquina = avanzarLaAnticipacion): { luz: number[]; giro: number[] } {
  const e = anticipacionInicial()
  const luz: number[] = []
  const giro: number[] = []
  for (let k = 0; k < Math.round(segundos * hz); k += 1) {
    const t = k / hz
    const enViaje = viaje !== undefined && t >= viaje.desde && t < viaje.desde + 3.2
    const avance = viaje === undefined ? 0 : Math.max(0, Math.min(1, (t - viaje.desde - 0.3) / 2.6))
    const scrollY = viaje === undefined ? 0 : viaje.y0 + (viaje.y1 - viaje.y0) * (avance * avance * (3 - 2 * avance))
    maquina(e, plan, enViaje ? (viaje?.destino ?? null) : null, scrollY, t * 1000, 1 / hz)
    luz.push(e.luz)
    giro.push(e.giro)
  }
  return { luz, giro }
}
const plan = planDeLaAnticipacion('trabajos', 'dia-a-noche', 1, null, 0, 5000, 0)
const ant60 = anticipar(plan, 60, 3)
const en = (serie: number[], s: number, hz = 60): number => serie[Math.round(s * hz) - 1]
afirmar(Math.abs(en(ant60.luz, 0.55) - plan.luz) < 0.05 * Math.abs(plan.luz) && Math.abs(en(ant60.giro, 0.55) - ANTICIPACION.giroDeg) < 0.05 * ANTICIPACION.giroDeg, `entra en medio segundo: luz ${en(ant60.luz, 0.55).toFixed(3)} de ${plan.luz.toFixed(3)}, giro ${en(ant60.giro, 0.55).toFixed(2)}° de ${String(ANTICIPACION.giroDeg)}°`)
afirmar(Math.abs(en(ant60.luz, 2.9)) < 0.03 * Math.abs(plan.luz) && Math.abs(en(ant60.giro, 2.9)) < 0.03 * ANTICIPACION.giroDeg, `  y vuelve sola después de ${String(ANTICIPACION.sostenS)} s aunque el puntero siga encima (a los 2,9 s: ${en(ant60.luz, 2.9).toFixed(4)})`)
const ant144 = anticipar(plan, 144, 0.4)
afirmar(Math.abs(en(ant144.luz, 0.4, 144) - en(ant60.luz, 0.4)) < 2e-3, `  en segundos: igual a 60 y a 144 Hz (${en(ant60.luz, 0.4).toFixed(4)} y ${en(ant144.luz, 0.4, 144).toFixed(4)})`)

const conClic = anticipar(plan, 60, 4, { desde: 0.6, destino: 'trabajos', y0: 0, y1: 5000 })
const maximoSalto = (serie: number[]): number => serie.reduce((m, v, i) => (i === 0 ? m : Math.max(m, Math.abs(v - serie[i - 1]))), 0)
const iClic = Math.round(0.6 * 60)
afirmar(Math.abs(conClic.luz[iClic] - conClic.luz[iClic - 1]) < 0.01 && Math.abs(conClic.giro[iClic] - conClic.giro[iClic - 1]) < 0.15, 'con el clic, el viaje arranca DESDE la anticipación: el cuadro del clic sigue al de antes (sin salto)')
afirmar(Math.abs(en(conClic.luz, 3.8)) < 1e-9 && Math.abs(en(conClic.giro, 3.8)) < 1e-9, '  y lo anticipado se descuenta con el avance del viaje: en la llegada es cero')
afirmar(maximoSalto(conClic.luz) < 0.05 && maximoSalto(conClic.giro) < 0.8, `  ningún cuadro salta (el mayor cambio, el de la entrada suave: ${maximoSalto(conClic.luz).toFixed(3)} de luz, ${maximoSalto(conClic.giro).toFixed(2)}°)`)
const deGolpe = (e: EstadoDeLaAnticipacion, p: PlanDeAnticipacion | null, v: string | null, y: number, ahora: number, dt: number): void => {
  avanzarLaAnticipacion(e, p, v, y, ahora, dt)
  if (v !== null) [e.luz, e.giro] = [0, 0]
}
controlPositivo('el chequeo del salto ve un viaje que suelta la anticipación de golpe al hacer clic', plan, (p: PlanDeAnticipacion) => {
  const r = anticipar(p, 60, 4, { desde: 0.6, destino: 'trabajos', y0: 0, y1: 5000 }, deGolpe)
  return Math.abs(r.luz[iClic] - r.luz[iClic - 1]) < 0.01
})
const aOtroLado = anticipar(plan, 60, 4, { desde: 0.6, destino: 'servicios', y0: 0, y1: 9000 })
afirmar(maximoSalto(aOtroLado.luz) < 0.05 && Math.abs(en(aOtroLado.luz, 3.8)) < 0.01 * Math.abs(plan.luz), 'un viaje a OTRO lado (el CTA del hero, otro ítem): lo anticipado vuelve en el tiempo, sin salto')

titulo('T2 · 3 · Dónde vive: el rig, la barra, la misma cuenta que el clic')

afirmarIgual(giroDeLaInterfaz({ responde: true, anticipa: false }), 0, 'sin la bandera la cámara no recibe nada')
afirmar(/angleDeg \+= desplazamiento\.angleDeg\s*\n\s*height \+= desplazamiento\.height\s*\n\s*\/\/[^\n]*\n\s*if \(physics\) angleDeg \+= giroDeLaInterfaz\(\)/.test(leer('_lib/escena/OrbitRig.tsx')), 'el giro va junto al del mouse y sólo con la física (no con movimiento reducido); la pose publicada no lo lleva')
const ANTICIPACION_TSX = leer('_chrome/escena/AnticipacionDelMenu.tsx')
afirmar(ANTICIPACION_TSX.includes('const y1 = destinoDelViaje(seccion)') && ANTICIPACION_TSX.includes('const viaje = planDelViaje(seccion.id, y1)'), 'el plan sale de LA MISMA cuenta que el clic: el nudo del destino y la clase de luz del viaje')
afirmar(ANTICIPACION_TSX.includes('if (reducido.matches || viajeEnCurso() !== null || !deberiaDeslizar(getIntroStage())) return') && ANTICIPACION_TSX.includes('if (seccion === null) return'), '  y sólo donde el clic viaja: sin movimiento reducido, sin un viaje en curso, con la compuerta del intro; «Contacto» (no es una sección) no anticipa')
afirmar(SELECTOR_DE_LOS_ITEMS === '[data-pieza="navegacion"] a[data-pieza="nav-enlace"]' && leer('_chrome/ChromeDelHome.tsx').includes('<AnticipacionDelMenu />'), '  los ítems de la barra, con un escucha delegado (la pastilla compartida no se toca)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T3 · 1 · Las portadas de las demos: una onda del mismo lenguaje que el piso')

afirmar(PRUEBAS_APAGADAS.vida === 'no' && entornoPedido('producto,vida=si').pruebas.vida === 'si', 'apagada en el producto; `vida=si` la pide')
afirmar(ANILLOS_GLSL.includes('( 1.0 - pow( 1.0 - t, 2.2 ) )') && Math.abs(frenteDeLaOnda(0.5) - (1 - 0.5 ** 2.2)) < 1e-12 && frenteDeLaOnda(0) === 0 && frenteDeLaOnda(1) === 1, 'el frente de la onda es el de los anillos del piso (rápido al nacer, frenando): la misma curva')
afirmar(colaDeLaOnda(0) === 0 && colaDeLaOnda(1) === 0 && colaDeLaOnda(0.1) > colaDeLaOnda(0.6), '  y la cola: nace sin golpe, se apaga con el frente')
const [r0, g0, b0] = pixelDelMapa(0, 0)
const enElFrente = pixelDelMapa(ONDA_DE_LA_PORTADA.radioEnElMapa, 0)
const antesDelFrente = pixelDelMapa(ONDA_DE_LA_PORTADA.radioEnElMapa - ONDA_DE_LA_PORTADA.anchoEnElMapa * 0.7, 0)
const despuesDelFrente = pixelDelMapa(ONDA_DE_LA_PORTADA.radioEnElMapa + ONDA_DE_LA_PORTADA.anchoEnElMapa * 0.7, 0)
afirmar(Math.abs(r0 - 0.5) < 1e-6 && Math.abs(g0 - 0.5) < 1e-6 && b0 < 1e-6, 'el mapa es neutro lejos del frente (no corre la imagen entera)')
afirmar(enElFrente[2] > 0.99 && antesDelFrente[0] > 0.5 && despuesDelFrente[0] < 0.5, '  en el frente: la banda entera, y empuja hacia afuera de un lado y hacia adentro del otro (una cresta)')
const ONDA_TS = leer('_secciones/trabajos/demos/ondaDeLaPortada.ts').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
afirmar(!/will-change|willChange/.test(ONDA_TS) && leer('_secciones/trabajos/demos/OndaDeLasPortadas.tsx').includes("querySelector<HTMLElement>('[data-parte=\"cara\"] img')"), 'un filtro sobre la IMAGEN de la cara, sin promover nada (la cara no puede llevar will-change: rompe el vacío del túnel)')
afirmar(!/ondear|OndaDeLasPortadas/.test(leer('_secciones/trabajos/demos/Biblioteca.tsx')) && leer('_chrome/ChromeDelHome.tsx').includes('<OndaDeLasPortadas />'), '  la biblioteca no se toca: un escucha delegado, montado en el chrome del home')
afirmar(/if \(\(e\.pointerType !== 'mouse' && e\.pointerType !== 'pen'\) \|\| !fino\.matches \|\| reducido\.matches\) return/.test(leer('_secciones/trabajos/demos/OndaDeLasPortadas.tsx')), '  sólo con puntero fino y sin movimiento reducido')

titulo('T3 · 2 · Tu panel y Servicios con vida propia: datos de ejemplo que se dicen de ejemplo')

const TEXTOS_DE_EJEMPLO = [ROTULO_DE_EJEMPLO, QUIEN_DE_EJEMPLO, CONTADOR_DE_EJEMPLO, ROTULO_DEL_PROCESO, ...PEDIDOS_DE_EJEMPLO.flatMap((p) => [p.que, p.desde]), ...Object.values(PROCESOS_DE_EJEMPLO).flat()]
const sinCifras = (textos: readonly string[]): boolean => textos.every((t) => !/[0-9%$+×]/.test(t))
afirmar(sinCifras(TEXTOS_DE_EJEMPLO), 'ningún texto de ejemplo trae una cifra, un porcentaje o un monto (CONTENIDO_INVENTADO)', `${String(TEXTOS_DE_EJEMPLO.length)} textos`)
controlPositivo('el chequeo de las cifras ve un ejemplo con una cifra de negocio', ['Ventas +38 %'], sinCifras)
afirmar(/ejemplo/i.test(ROTULO_DE_EJEMPLO) && /ejemplo/i.test(QUIEN_DE_EJEMPLO) && /ejemplo/i.test(CONTADOR_DE_EJEMPLO) && /ejemplo/i.test(ROTULO_DEL_PROCESO), '  y todo dice que es de ejemplo: el rótulo, el contador, quién manda los pedidos, el proceso')
afirmar(TOPE_DEL_CONTADOR < 10, `  el contador cuenta ESTE ejemplo y vuelve a empezar en ${String(TOPE_DEL_CONTADOR)}: no parece un acumulado`)
afirmarIgual(Object.keys(PROCESOS_DE_EJEMPLO).sort(), [...IDS_DE_SERVICIO].sort(), 'un proceso por servicio, con los ids del sistema')
afirmar(Object.values(PROCESOS_DE_EJEMPLO).every((p) => p.length === 4), '  de cuatro pasos cada uno (el alto de la tarjeta no cambia con el servicio)')

const PANEL_HTML = renderToStaticMarkup(<PanelEnVivo />)
afirmar(PANEL_HTML.includes('aria-label="Ejemplo del panel funcionando, con datos de ejemplo"') && PANEL_HTML.includes('aria-label="Pausar el ejemplo"'), 'el panel se nombra para el lector y se puede pausar (WCAG 2.2.2: se mueve solo más de cinco segundos)')
afirmar(veces(PANEL_HTML, 'aria-hidden="true"') >= 3 && /<ul aria-hidden="true"/.test(PANEL_HTML), '  lo que se mueve (la lista, el contador, las barras) no se anuncia')
const LATIDO_TS = leer('_componentes/vida/useLatido.ts')
afirmar(LATIDO_TS.includes('new IntersectionObserver') && LATIDO_TS.includes("prefers-reduced-motion: reduce") && LATIDO_TS.includes("document.visibilityState === 'visible'") && LATIDO_TS.includes('pausado'), 'se detiene solo: fuera de cuadro, con la pestaña oculta, con movimiento reducido y con la pausa')
afirmar(leer('_secciones/tu-panel/TuPanel.tsx').includes("{vida === 'si' && <PanelEnVivo />}") && leer('_secciones/servicios/ServiciosEnSecuencia.tsx').includes("{vida === 'si' && <ProcesoEnVivo posicion={posicion} />}"), 'montados sólo con `vida=si`: en el servidor y sin la bandera no existen (el marcado del producto no cambia)')
const PROCESO_TSX = leer('_componentes/vida/ProcesoEnVivo.tsx')
afirmar(PROCESO_TSX.includes("useMotionValueEvent(posicion, 'change'") && !/addEventListener\('scroll'|useScroll\(/.test(PROCESO_TSX) && !PROCESO_TSX.includes('data-servicio'), 'el proceso de Servicios cambia con el rodillo (su disparo), sin escuchar el scroll y sin otro `[data-servicio]` (un acento por contexto)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T4 · 1 · El recorrido: las secciones, dónde empiezan, un tramo igual para cada una')

afirmar(PRUEBAS_APAGADAS.recorrido === 'no' && entornoPedido('producto,recorrido=logo').pruebas.recorrido === 'logo' && entornoPedido('producto,recorrido=reloj').pruebas.recorrido === 'reloj' && entornoPedido('producto,recorrido=barra').pruebas.recorrido === 'no', 'apagado en el producto; `recorrido=logo` o `recorrido=reloj` (las dos variantes)')
const IDS_DEL_RECORRIDO = SECCIONES_DEL_RECORRIDO.map((s) => s.id)
afirmar(IDS_DEL_RECORRIDO.length === 7 && !IDS_DEL_RECORRIDO.includes('numeros') && IDS_DEL_RECORRIDO.every((id) => (IDS_DE_SECCION as readonly string[]).includes(id)), 'siete secciones, las del sitio en su orden (Números, vacía, no se nombra)', IDS_DEL_RECORRIDO.join(', '))
afirmar(SECCIONES_DEL_RECORRIDO[0].rotulo === 'Inicio' && SECCIONES_DEL_RECORRIDO[6].rotulo === 'Contacto', '  con nombres para una persona: «Inicio» y «Contacto», no «Hero» y «Cierre»')
// Una página de 25 pantallas de 900: el Cierre (la última, una pantalla) termina en el scroll máximo.
const ALTO = 900
const TOPES = [0, 900, 3600, 8100, 15300, 17100, 21600]
const MAXIMO = 21600
const INICIOS = iniciosDelRecorrido(TOPES, MAXIMO, ALTO)
afirmar(INICIOS[0] === 0 && INICIOS[6] < 1 && INICIOS.every((s, i) => i === 0 || s > INICIOS[i - 1]), `cada sección empieza cuando su tope cruza la mitad del cuadro (la línea de la barra): el Cierre, antes del final (${INICIOS[6].toFixed(3)})`)
controlPositivo('el chequeo ve el borde de arriba: el Cierre empezaría en 1 y nunca se lo vería empezar', TOPES.map((t, i) => (i === 0 ? 0 : t / MAXIMO)), (s: readonly number[]) => s[6] < 1)
afirmar(INICIOS.every((s, i) => Math.abs(avanceDelRecorrido(s, INICIOS) - i / 7) < 1e-9), 'un tramo igual por sección: cada una empieza en i/7 del indicador (las cortas no se amontonan)')
afirmar([0, 0.03, 0.2, 0.5, 0.71, 0.9, 0.99, 1].every((p) => Math.abs(avanceDeLaPagina(avanceDelRecorrido(p, INICIOS), INICIOS) - p) < 1e-9), '  y vuelve: del indicador a la página y de la página al indicador, el mismo punto')
const pasoDelAvance = Array.from({ length: 201 }, (_, k) => avanceDelRecorrido(k / 200, INICIOS))
afirmar(pasoDelAvance.every((r, k) => k === 0 || r >= pasoDelAvance[k - 1]), '  nunca retrocede al bajar')
afirmar(seccionDelTramo(0, 7) === 0 && seccionDelTramo(0.999, 7) === 6 && seccionDelTramo(3.5 / 7, 7) === 3, 'tocar el trazo o el disco en un tramo lleva a la sección de ese tramo')

titulo('T4 · 2 · V1 el logo que se dibuja, V2 el reloj del día')

afirmar(dibujado(0, 7).infinito === 0 && dibujado(0, 7).palo === 0 && Math.abs(dibujado(6 / 7, 7).infinito - 1) < 1e-9 && dibujado(6 / 7, 7).palo < 1e-9 && dibujado(1, 7).palo === 1, 'el infinito se arma con las secciones hasta Por qué develOP; el palo, con el Cierre: al final de la página se completa')
afirmar(TRAZO_DEL_INFINITO.endsWith('618.8 618.5') && TRAZO_DEL_PALO.startsWith('M618.8 618.5'), '  el palo baja desde donde termina el cuenco de la «p» (un solo trazo, en dos tramos)')
afirmarIgual(colorDeLaLuz(0), NOCHE_DEL_RELOJ.toLowerCase(), 'el reloj: la noche de la sala en el nivel 0')
afirmarIgual(colorDeLaLuz(1), DIA_DEL_RELOJ.toLowerCase(), '  y el papel en el nivel 1 (los extremos de la sala, no los de la tinta: no se dan vuelta con el tono)')
afirmar(lugarEnElDisco(0)[0] === 50 && lugarEnElDisco(0)[1] < 10 && lugarEnElDisco(0.25)[0] > 90, '  las horas, desde arriba y en el sentido del reloj')

titulo('T4 · 3 · Navegación accesible, sólo desde 1024, con el gesto de la barra')

const INDICADOR = leer('_chrome/recorrido/IndicadorDelRecorrido.tsx')
afirmar(SELECTOR_DE_LOS_VIAJES.includes('[data-pieza="recorrido"] a[data-parte="paso-del-recorrido"]') && INDICADOR.includes('data-pieza="recorrido"') && INDICADOR.includes('data-parte="paso-del-recorrido"'), 'los puntos viajan con el MISMO gesto que la barra (están en `SELECTOR_DE_LOS_VIAJES` y el indicador los emite tal cual)')
afirmar(INDICADOR.includes('aria-label="Recorrido de la página"') && INDICADOR.includes('aria-label={`Ir a ${s.rotulo}`}') && INDICADOR.includes("aria-current={i === actual ? 'location' : undefined}"), 'para el lector y el teclado: una navegación con nombre, un enlace por sección, la actual marcada')
afirmar(/aria-hidden="true" className="block h-auto w-full/.test(leer('_chrome/recorrido/LogoQueSeDibuja.tsx')) && leer('_chrome/recorrido/RelojDelDia.tsx').includes('<span ref={disco} aria-hidden="true"'), '  y el dibujo no se anuncia')
afirmar(INDICADOR.includes('max-escritorio:hidden'), 'sólo desde 1024 (el umbral único del sitio)')
afirmar(/if \(i !== actual\) setActual\(i\)/.test(INDICADOR) && /useTransform\(scrollYProgress, \(p\) => avanceDelRecorrido\(p, iniciosVivos\.current\)\)/.test(INDICADOR), 'el dibujo lo mueve el avance directo (un MotionValue); React, sólo al cambiar de sección')
afirmar(leer('_chrome/ChromeDelHome.tsx').includes('<IndicadorDelRecorrido />') && INDICADOR.includes("if (variante === 'no') return null"), 'montado en el chrome del home; sin la bandera no existe')

cerrar('s38-interfaz2')
