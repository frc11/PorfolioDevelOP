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
import * as THREE from 'three'

import { SELECTOR_DE_LOS_CTA, SELECTOR_DE_LOS_VALORES, centroNormalizado } from '../../_chrome/escena/RespuestaDeLaEscena'
import { ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { ANILLOS_GLSL } from '../escena/entorno/Pulso'
import { PULSO, avanzarElPulso, pulsoInicial, type EntradasDelPulso, type EstadoDelPulso } from '../escena/entorno/maquinaDelPulso'
import { MENU_DE_LA_INTERFAZ, VIGENCIA_DEL_PEDIDO_MS, pedirLaOnda, vigente } from '../escena/interfaz/pedidos'
import { RESPUESTA, RESPUESTA_EN_VIVO, nivelConLaInterfaz } from '../escena/interfaz/respuesta'
import { NIVEL_DE_LA_NOCHE } from '../escena/lightArc'
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

afirmar([1, 0.5, 0.04, 0.3].every((n) => nivelConLaInterfaz(n, 1 / 60, false) === n), 'sin la bandera el rig recibe EXACTAMENTE el mismo nivel')
const correrMenu = (abierto: boolean, nivel: number, segundos: number, hz: number): number => {
  MENU_DE_LA_INTERFAZ.abierto = abierto
  let n = nivel
  for (let k = 0; k < Math.round(segundos * hz); k += 1) n = nivelConLaInterfaz(nivel, 1 / hz, true)
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

cerrar('s38-interfaz2')
