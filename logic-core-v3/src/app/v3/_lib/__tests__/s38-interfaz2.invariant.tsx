/**
 * SPRINT INTERFAZ 2 — el invariante del sprint, después de su cierre: lo que pasó al producto (sin bandera) y lo que el
 * cierre agregó, con sus controles positivos.
 *
 *   T1 · la escena responde a la interfaz: el pulso que pide un CTA, la onda del piso hacia un valor, la sala detrás del
 *        menú del teléfono.
 *   T2 · la vista previa del destino en la barra.
 *   T3 · la vida propia: Tu panel (la barra, sin número); Servicios sin vida (cierre final). [NOCTURNO B5] La onda de las portadas se fue.
 *   Cierre · el cartel de las demos pegado al cursor, el infinito del recorrido, la sombra de día (una sola).
 *
 * Lo que necesita navegador está en los bancos de `scripts-interfaz2/` y sus entregas en `~/.cache/b4-medicion/interfaz2/`.
 */
import { existsSync, readFileSync } from 'node:fs'
import * as THREE from 'three'

import { SELECTOR_DE_LOS_ITEMS } from '../../_chrome/escena/AnticipacionDelMenu'
import { SELECTOR_DE_LOS_CTA, SELECTOR_DE_LOS_VALORES, centroNormalizado } from '../../_chrome/escena/RespuestaDeLaEscena'
import { demoBajo, estadoBajo, nocheQueSeVe, tonoBajo } from '../../_chrome/cursor/estado'
import { ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { ENCENDIDO } from '../escena/entorno/encendido'
import { ANILLOS_GLSL } from '../escena/entorno/Pulso'
import { PULSO, avanzarElPulso, pulsoInicial, type EntradasDelPulso, type EstadoDelPulso } from '../escena/entorno/maquinaDelPulso'
import { ANTICIPACION, anticipacionInicial, avanzarLaAnticipacion, luzDeLaAnticipacion, planDeLaAnticipacion, type EstadoDeLaAnticipacion, type PlanDeAnticipacion } from '../escena/interfaz/anticipacion'
import { MENU_DE_LA_INTERFAZ, VIGENCIA_DEL_PEDIDO_MS, pedirLaOnda, vigente } from '../escena/interfaz/pedidos'
import { RESPUESTA, RESPUESTA_EN_VIVO, nivelConLaInterfaz } from '../escena/interfaz/respuesta'
import { NIVEL_DE_LA_NOCHE } from '../escena/lightArc'
import { BRILLO_DE_LA_NOCHE, brilloDeLaNocheEn } from '../escena/particleGlow'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { ANCLAS_DEL_DIBUJO, ONDA_EN_VIVO, atenderLaOnda, conOndaDirigida } from '../escena/piso/ondaDirigida'
import { RIM_NIGHT_LEVEL } from '../escena/probeLighting'
import { FLOOR_Y } from '../escena/probeScene'
import { manchasDelHaz } from '../escena/sombra/sombraDelHaz'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
// [P-H] Los finales de línea normalizados antes de buscar: en CRLF (el worktree de servicios) lo que busca varias líneas no encontraba nada.
const enLf = (texto: string): string => texto.replace(/\r\n/g, '\n')
const enCrlf = (texto: string): string => texto.replace(/\n/g, '\r\n')
const leer = (ruta: string): string => enLf(readFileSync(`${V3}/${ruta}`, 'utf8'))
const veces = (texto: string, aguja: string): number => texto.split(aguja).length - 1
const sinComentarios = (fuente: string): string => fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('Cierre · lo aprobado pasó al producto: las banderas del sprint ya no existen')

// [3D Y SONIDO] T1: los títulos de ESCENA 10 pasaron al producto; la prueba que queda es el sonido.
// [RETOQUE 3D] 3J: + la del túnel lento; el sonido pasó al producto (su bandera se borró).
// [CIERRE RETOQUE 3D] D6 y P1: el túnel lento se borró y el polvo en facetas pasó al producto.
// [RONDA 2] F4: la única prueba es el filo de los títulos de día (s43 · F4). [RETOQUE DEL PIE] P1: se borró; las de ahora, en s44.
// [PULIDO 6] E2 · el nombre `filo=` volvió con otro sentido (el filo del logo). [PULIDO 7] F1 · y se borró otra vez (ganó la
// descarga): vuelve la aserción de antes, la clave `filo` no está.
afirmar(['sonido', 'tunel', 'polvo', 'filo'].every((k) => !(k in PRUEBAS_APAGADAS)), 'no queda ninguna de antes: el sonido y el polvo en facetas pasaron al producto, el túnel lento y el filo de RONDA 2 se borraron')
const pedidas = entornoPedido('producto,responde=si,anticipa=si,vida=si,recorrido=logo').pruebas as unknown as Record<string, unknown>
afirmar(['responde', 'anticipa', 'vida', 'recorrido'].every((k) => !(k in pedidas)) && Object.values(ENTORNO.pruebas).every((v) => v === 'no'), '  `responde`, `anticipa`, `vida` y `recorrido`, borradas: en la URL no piden nada')
afirmar(!/usePrueba|pruebasDeLaInterfaz/.test(['_chrome/ChromeDelHome.tsx', '_chrome/menu/MenuMovil.tsx', '_chrome/escena/RespuestaDeLaEscena.tsx', '_chrome/escena/AnticipacionDelMenu.tsx', '_secciones/tu-panel/TuPanel.tsx', '_secciones/servicios/ServiciosEnSecuencia.tsx'].map(leer).join('\n')), '  y nada del DOM pregunta por ellas')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · 1 · El pulso que pide un CTA: el principal de E4, por la misma máquina')

type Pedido = { readonly desde: number; readonly hasta: number; readonly scroll?: boolean; readonly pedidos?: readonly number[] }
const DT = 1 / 60
function recorrer(tramos: readonly Pedido[], maquina: (s: EstadoDelPulso, e: EntradasDelPulso) => EstadoDelPulso = avanzarElPulso, conPedido = true): { principales: number[]; estados: EstadoDelPulso[] } {
  let estado = pulsoInicial(0)
  const estados: EstadoDelPulso[] = []
  const vistos = new Set<number>()
  const principales: number[] = []
  for (const tramo of tramos) {
    const pendientes = [...(tramo.pedidos ?? [])]
    for (let t = tramo.desde; t < tramo.hasta - 1e-9; t += DT) {
      const pedido = pendientes.length > 0 && t >= pendientes[0] ? (pendientes.shift(), true) : false
      const base = { t, scrollEnMovimiento: tramo.scroll ?? false, hover: false, reducido: false }
      estado = maquina(estado, conPedido ? { ...base, pedido } : base)
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
afirmar(repetido.principales.length === 2 && Math.abs(repetido.principales[1] - 7) < 2 * DT, `  entrar y salir del CTA no los apila: otro principal recién a los ${String(PULSO.pedidoCadaS)} s del anterior`, JSON.stringify(repetido.principales))
afirmar(recorrer([{ desde: 0, hasta: 10, scroll: true, pedidos: [5] }]).principales.length === 0, '  con el scroll en movimiento no nace (como cualquier anillo de E4)')
afirmar(recorrer([{ desde: 0, hasta: 12, pedidos: [1, 2.7, 4.4, 6.1, 7.8] }]).estados.every((s) => s.anillos.length <= PULSO.tope), `  y nunca hay más de ${String(PULSO.tope)} vivos`)
afirmar(JSON.stringify(recorrer([{ desde: 0, hasta: 20 }], avanzarElPulso, true).estados) === JSON.stringify(recorrer([{ desde: 0, hasta: 20 }], avanzarElPulso, false).estados), 'sin pedido, la máquina es la de siempre: el mismo recorrido, cuadro por cuadro')
const glotona = (s: EstadoDelPulso, e: EntradasDelPulso): EstadoDelPulso => (e.pedido === true ? { ...s, anillos: [...s.anillos, { nace: e.t, clase: 'principal' }] } : avanzarElPulso(s, e))
controlPositivo('el chequeo del apilado ve una máquina que larga un principal por cada pedido', [{ desde: 0, hasta: 12, pedidos: [5, 5.5, 6, 7] }] as readonly Pedido[], (t: readonly Pedido[]) => recorrer(t, glotona).principales.length === 2)
afirmar(vigente(0, 100) && !vigente(0, VIGENCIA_DEL_PEDIDO_MS + 1) && !vigente(10, 5), `un pedido vale ${String(VIGENCIA_DEL_PEDIDO_MS)} ms: la escena suspendida no lo cobra al volver`)
afirmar(/if \(PULSO_PEDIDO\.n !== m\.pulsoAtendido\) \{\s*m\.pulsoAtendido = PULSO_PEDIDO\.n\s*entradas\.pedido = vigente\(PULSO_PEDIDO\.cuando, performance\.now\(\)\)/.test(leer('_lib/escena/entorno/Entorno.tsx')), 'la escena atiende cada pedido una vez, y sólo si es reciente')

titulo('T1 · 2 · La onda del piso hacia un valor')

const conOnda = conOndaDirigida(SIMULACION_GLSL)
afirmar(veces(conOnda, 'uniform vec4 uOnda;') === 1 && veces(conOnda, 'fuerza += empujeDeLaOnda( p, r * uLado );') === 1, 'la simulación con la onda: su uniform y su empuje, una vez cada uno, junto a los anillos')
controlPositivo('la inyección se niega si la simulación cambió (no entra a ciegas)', 'void main() {}', (glsl: string) => {
  try {
    conOndaDirigida(glsl)
    return true
  } catch {
    return false
  }
})
afirmar(ANILLOS_GLSL.includes(ANCLAS_DEL_DIBUJO.funcion) && leer('_lib/escena/piso/bloques.ts').includes(ANCLAS_DEL_DIBUJO.mezcla), 'las dos anclas del dibujo existen: la onda se ve con la banda de los anillos')
const PISO_VIVO_TSX = leer('_lib/escena/piso/PisoVivo.tsx')
// [CIERRE] 3 · la simulación lleva además el final del pie, por afuera (`final/enElPiso.ts`): la onda sigue adentro.
afirmar(PISO_VIVO_TSX.includes('crearPingPong(grilla.n, grilla.n, 1, conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL)), {') && PISO_VIVO_TSX.includes('  conLaOndaEnElPiso(material)'), 'el piso vivo del producto arma la onda: la simulación y el dibujo')
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
afirmar(izquierda[3] === 1 && izquierda[1] < -0.2 && derecha[1] > 0.2 && izquierda[2] > 0 && derecha[2] > 0, 'un valor a la izquierda da una onda hacia la izquierda, y al revés; hacia el piso que se ve (del lado de la cámara)', JSON.stringify({ izquierda, derecha }))
const antes = ONDA_EN_VIVO.uOnda.value.toArray()
pedirLaOnda(-0.65, 0.35, 30_000)
atenderLaOnda(camara, 40, 30_000 + VIGENCIA_DEL_PEDIDO_MS + 50)
afirmarIgual(ONDA_EN_VIVO.uOnda.value.toArray(), antes, '  un pedido viejo no se atiende')

titulo('T1 · 3 · El menú del teléfono: la sala se oscurece apenas (su luz) y se desenfoca (el lienzo)')

RESPUESTA_EN_VIVO.menu = 0
MENU_DE_LA_INTERFAZ.abierto = false
afirmar([1, 0.5, 0.04, 0.3].every((n) => nivelConLaInterfaz(n, 1 / 60) === n), 'sin menú ni anticipación, el rig recibe EXACTAMENTE el mismo nivel')
const correrMenu = (abierto: boolean, nivel: number, segundos: number, hz: number): number => {
  MENU_DE_LA_INTERFAZ.abierto = abierto
  let n = nivel
  for (let k = 0; k < Math.round(segundos * hz); k += 1) n = nivelConLaInterfaz(nivel, 1 / hz)
  return n
}
const abierto380 = correrMenu(true, 1, 0.38, 60)
afirmar(abierto380 <= 1 - 0.95 * RESPUESTA.menu.oscurece + 1e-6, `con el menú abierto, a los 380 ms la luz bajó el 95 % de lo que baja (${String(RESPUESTA.menu.oscurece)}): ${abierto380.toFixed(3)}`)
afirmar(correrMenu(true, NIVEL_DE_LA_NOCHE, 1, 60) >= NIVEL_DE_LA_NOCHE - 1e-9 && correrMenu(false, 1, 0.8, 60) > 0.999, '  de noche no baja de la noche; al cerrar vuelve a la luz entera')
RESPUESTA_EN_VIVO.menu = 0
MENU_DE_LA_INTERFAZ.abierto = false
// [NAVBAR] El menú del teléfono: el botón (`MenuMovil`) y el panel con su velo (`MenuDeVidrio`).
const MENU_MOVIL = leer('_chrome/menu/MenuMovil.tsx') + leer('_chrome/menu/MenuDeVidrio.tsx')
afirmar(MENU_MOVIL.includes(['backdrop-blur-', '[calc(var(--blur-panel)/3)]'].join('')) && /useEffect\(\(\) => \{\s*salaDetrasDelMenu\(abierto\)\s*return \(\) => salaDetrasDelMenu\(false\)\s*\}, \[abierto\]\)/.test(MENU_MOVIL), 'el velo desenfoca POCO la página y la sala toma el desenfoque y baja su luz al abrir el menú')
afirmar(/arc\.level = nivelConLaNocheDisparada\(arc\.level\)\s*\/\/[^\n]*\n\s*arc\.level = nivelConLaInterfaz\(arc\.level, Math\.min\(delta, 0\.1\)\)/.test(leer('_lib/escena/OrbitRig.tsx')), 'el rig suma la interfaz DESPUÉS de la noche disparada: la luz de salida de un viaje queda limpia')
afirmarIgual(centroNormalizado({ left: 0, top: 0, width: 100, height: 100 }, 200, 200), [-0.5, 0.5], 'el centro de una pieza en coordenadas del lienzo')
afirmar(SELECTOR_DE_LOS_CTA.includes('[data-pieza="cta"]') && SELECTOR_DE_LOS_CTA.includes('[data-pieza="ventana-del-cta"]') && SELECTOR_DE_LOS_VALORES === '[data-pieza="valor"]', 'los CTA y la ventana de «Hablemos» piden el pulso; los valores, la onda (con puntero fino)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · La vista previa del destino: adentro de la clase de luz, y el clic sin salto')

const haciaLaNoche = luzDeLaAnticipacion('dia-a-noche', 1, null)
afirmar(haciaLaNoche < -0.3 && brilloDeLaNocheEn(1 + haciaLaNoche) === 0, `de día, hacia Trabajos: la luz baja (${haciaLaNoche.toFixed(3)}) sin cruzar a la noche`)
const haciaElDia = luzDeLaAnticipacion('noche-a-dia', NIVEL_DE_LA_NOCHE, null)
afirmar(haciaElDia > 0 && brilloDeLaNocheEn(NIVEL_DE_LA_NOCHE + haciaElDia) >= ENCENDIDO.prende, `de noche, hacia el día: la luz sube (${haciaElDia.toFixed(3)}) sin apagar el haz`)
afirmar(luzDeLaAnticipacion('dia-a-noche', RIM_NIGHT_LEVEL + 0.02, null) <= 0, '  una sala de día pegada a la frontera no se ACLARA para anticipar la noche')
function anticipar(plan: PlanDeAnticipacion | null, hz: number, segundos: number, viaje?: { readonly desde: number; readonly destino: string; readonly y0: number; readonly y1: number }, maquina = avanzarLaAnticipacion): { luz: number[]; giro: number[] } {
  const e = anticipacionInicial()
  const [luz, giro]: [number[], number[]] = [[], []]
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
const en = (serie: number[], s: number): number => serie[Math.round(s * 60) - 1]
const quieto = anticipar(plan, 60, 3)
// [CIERRE A] A1 · la anticipación queda en la luz: el hover de la barra no gira la cámara (era 7°).
const sinGiro = (r: { readonly giro: readonly number[] }): boolean => r.giro.every((g) => g === 0)
afirmar(Math.abs(en(quieto.luz, 0.55) - plan.luz) < 0.05 * Math.abs(plan.luz) && sinGiro(quieto) && Math.abs(en(quieto.luz, 2.9)) < 0.03 * Math.abs(plan.luz), `la luz entra en medio segundo y vuelve sola después de ${String(ANTICIPACION.sostenS)} s; la cámara no gira (${String(ANTICIPACION.giroDeg)}°)`)
controlPositivo('  el chequeo ve la anticipación de antes, que giraba la cámara', anticipar(plan, 60, 3, undefined, (e, p, v, y, ahora, dt) => {
  avanzarLaAnticipacion(e, p, v, y, ahora, dt)
  if (p !== null && ahora - p.desde < ANTICIPACION.sostenS * 1000) e.giro += (p.sentido * 7 - e.giro) * (1 - Math.exp(-dt / ANTICIPACION.subeTauS))
}), sinGiro)
const conClic = anticipar(plan, 60, 4, { desde: 0.6, destino: 'trabajos', y0: 0, y1: 5000 })
const iClic = Math.round(0.6 * 60)
afirmar(Math.abs(conClic.luz[iClic] - conClic.luz[iClic - 1]) < 0.01 && Math.abs(en(conClic.luz, 3.8)) < 1e-9 && Math.abs(en(conClic.giro, 3.8)) < 1e-9, 'con el clic, el viaje arranca DESDE la anticipación (sin salto) y la descuenta con su avance: en la llegada es cero')
const deGolpe = (e: EstadoDeLaAnticipacion, p: PlanDeAnticipacion | null, v: string | null, y: number, ahora: number, dt: number): void => {
  avanzarLaAnticipacion(e, p, v, y, ahora, dt)
  if (v !== null) [e.luz, e.giro] = [0, 0]
}
controlPositivo('el chequeo del salto ve un viaje que suelta la anticipación de golpe', plan, (p: PlanDeAnticipacion) => {
  const r = anticipar(p, 60, 4, { desde: 0.6, destino: 'trabajos', y0: 0, y1: 5000 }, deGolpe)
  return Math.abs(r.luz[iClic] - r.luz[iClic - 1]) < 0.01
})
// [CIERRE RETOQUE 3D] D1: la misma cuenta, con la pose sin el mouse tomada antes.
afirmar(/const giroDeLaVista = physics \? giroDeLaInterfaz\(\) : 0/.test(leer('_lib/escena/OrbitRig.tsx')) && /angleDeg \+= desplazamiento\.angleDeg \+ giroDeLaVista/.test(leer('_lib/escena/OrbitRig.tsx')) && SELECTOR_DE_LOS_ITEMS === '[data-pieza="barra"] a[data-pieza="barra-enlace"]' && leer('_chrome/escena/AnticipacionDelMenu.tsx').includes('const viaje = planDelViaje(seccion.id, y1)'), 'el giro sólo con la física; los ítems de la barra; la misma cuenta que el clic')

// ═══════════════════════════════════════════════════════════════════════════
titulo('T3 · La vida propia: Tu panel (la barra, sin número); [B5] la onda de las portadas, fuera')

const borrado = (ruta: string): boolean => {
  try {
    leer(ruta)
    return false
  } catch {
    return true
  }
}
// [NOCTURNO B5] Reemplazada por la spec (decisión de Valentino, «el efecto de agua sale»): la onda de las portadas se fue entera
// (su código, su escucha delegado y su banco); lo que se afirmaba de ella (el frente y la cola de los anillos, su mapa, sin capas) se
// fue con ella. Lo que queda es que no vuelva: ni los archivos ni el montaje en el chrome.
const sinLaOnda = (chrome: string): boolean => !/OndaDeLasPortadas|ondaDeLaPortada|onda-de-la-portada/.test(sinComentarios(chrome)) && borrado('_secciones/trabajos/demos/ondaDeLaPortada.ts') && borrado('_secciones/trabajos/demos/OndaDeLasPortadas.tsx')
afirmar(sinLaOnda(leer('_chrome/ChromeDelHome.tsx')), '[B5] las portadas ya no ondean: sin el filtro del agua ni su escucha, y el chrome no la monta')
controlPositivo('  el chequeo vería la onda montada otra vez', `${leer('_chrome/ChromeDelHome.tsx')}\n      <OndaDeLasPortadas />\n`, sinLaOnda)
// [RETOQUE PANEL] T1 · la tarjeta «En vivo · datos de ejemplo» se fue de Tu panel (y sus tres archivos, que nadie más usaba).
const TU_PANEL = leer('_secciones/tu-panel/TuPanel.tsx')
const sinElPanelEnVivo = (f: string): boolean => !/PanelEnVivo|_componentes\/vida\//.test(f)
afirmar(sinElPanelEnVivo(TU_PANEL) && borrado('_componentes/vida/PanelEnVivo.tsx'), 'Tu panel, sin el panel en vivo: lo vivo son las demos de cada feature')
controlPositivo('  el chequeo vería el panel en vivo montado', '      <PanelEnVivo />', sinElPanelEnVivo)
afirmar(!/ProcesoEnVivo|proceso-en-vivo/.test(leer('_secciones/servicios/ServiciosEnSecuencia.tsx')), 'Servicios, como antes de INTERFAZ 2: sin el recorrido del pedido de ejemplo (cierre final)')
controlPositivo('el chequeo de Servicios ve el recorrido montado', '<ProcesoEnVivo posicion={posicion} />', (f: string) => !/ProcesoEnVivo|proceso-en-vivo/.test(f))

// ═══════════════════════════════════════════════════════════════════════════
titulo('Cierre · 4 · El cartel de las demos: uno solo, pegado al cursor')

const libro = { closest: (s: string) => (s.includes('libro') ? libro : null), getAttribute: (a: string) => (a === 'data-demo' ? 'ethereal' : null) } as unknown as Element
// [CIERRE A] A5 · el libro de ejemplo, uno que sigue en el catálogo (Zero Protocol se fue).
afirmar(estadoBajo(libro, false) === 'demo' && demoBajo(libro)?.texto === 'Click para ver The Ethereal Resort', 'sobre un libro: el estado de la demo y el texto de la pastilla («Click para ver The Ethereal Resort»)', demoBajo(libro)?.texto)
const CURSOR_CSS = sinComentarios(leer('_estilos/cursor-sala.css'))
afirmar(!/etiqueta|Abrir/.test(CURSOR_CSS + sinComentarios(leer('_chrome/cursor/CursorDeLaSala.tsx'))) && /\[data-estado="demo"\] :is\(\[data-parte="nucleo"\], \[data-parte="halo"\]\) \{\s*scale: 0;/.test(CURSOR_CSS), 'el círculo «Abrir» se borró: sobre una demo el punto y el halo se van y queda el cartel')
const declaracion = (hoja: string, selector: string, propiedad: string): string => new RegExp(`${selector.replace(/[[\]().*+?^$|\\]/g, '\\$&')} \\{[^}]*?${propiedad}: ([^;]+);`).exec(hoja)?.[1] ?? '?'
const PASTILLA = ['border', 'border-radius', 'background-color', 'backdrop-filter', 'box-shadow', 'block-size']
const DEMOS_CSS = sinComentarios(leer('_estilos/demos.css'))
afirmar(PASTILLA.every((p) => declaracion(CURSOR_CSS, '[data-v3] [data-pieza="cursor-sala"] [data-parte="cartel"]', p) === declaracion(DEMOS_CSS, '[data-v3] [data-pieza="cartel-de-demos"]', p)), '  es la MISMA pastilla del estante: borde, radio, superficie, desenfoque, sombra y alto')
const CURSOR_TSX = leer('_chrome/cursor/CursorDeLaSala.tsx')
const paso = CURSOR_TSX.slice(CURSOR_TSX.indexOf('const paso = (ahora: number): void => {'), CURSOR_TSX.indexOf('const despertar'))
afirmar(veces(CURSOR_TSX, 'data-parte="cartel"') === 1 && veces(CURSOR_TSX, 'data-parte="cartel-texto"') === 2, 'UN objeto: una caja con dos capas de texto para el fundido (nunca dos cajas que se cruzan)')
afirmar(paso.includes('cartel.ancho += (ancho - cartel.ancho) * fn') && paso.includes('cartel.x += (cx - cartel.x) * fh') && paso.includes('cartel.escala += (escala - cartel.escala) * fn'), '  el ancho, la posición y la escala persiguen en segundos (la interpolación del cursor): se estira y se achica continuo')
afirmar(!/\bnew \w|getBoundingClientRect|\[[^\]]*\] = \[|\.map\(|\.filter\(/.test(paso), '  y el bucle no reserva nada por cuadro', paso.match(/\bnew \w|getBoundingClientRect|\[[^\]]*\] = \[/)?.[0] ?? '')
afirmar(CURSOR_TSX.includes("if (nuevo === 'demo' && cartel.escala < 0.02) {\n          cartel.x = destino.x\n          cartel.y = destino.y") && paso.includes('const escala = conCartel ? 1 : 0') && paso.includes(': destino.x'), '  nace en el punto del cursor y se va achicándose hacia él')
// [P-H] Con CRLF pasa igual (se lee normalizado), y un defecto real en CRLF (el cartel que no nace en su lugar) sigue fallando.
const naceEnSuLugar = (c: string): boolean => c.includes("if (nuevo === 'demo' && cartel.escala < 0.02) {\n          cartel.x = destino.x\n          cartel.y = destino.y")
afirmar(naceEnSuLugar(enLf(enCrlf(CURSOR_TSX))), '  [P-H] y con los finales de línea de Windows (CRLF) también: se busca en el texto normalizado')
controlPositivo('  [P-H] el detector VE un defecto real en CRLF (el cartel que no nace en su lugar)', enLf(enCrlf(CURSOR_TSX.replace('cartel.x = destino.x', 'cartel.x = 0'))), naceEnSuLugar)
afirmar(/cy = conCartel \? Math\.max\(cartel\.tope - cartel\.aire - cartel\.alto \/ 2/.test(paso), '  y se apoya ARRIBA de la cara levantada: no tapa la demo')
afirmar(CURSOR_TSX.includes("if (nuevo === 'demo' && (demo === null || Number(getComputedStyle(demo.pieza).opacity) < 0.5)) nuevo = 'texto'"), '  y no lo abre un libro apagado: la máscara del vacío del túnel no corta el hit-testing (medido en el cierre: en Portfolio, «Click para ver AXON Studio» sobre la nada)')
afirmar(leer('_secciones/trabajos/demos/Biblioteca.tsx').includes('if (!PRESENCIA_DEL_CURSOR.montado) mostrarElCartel(e.currentTarget, demo)') && CURSOR_TSX.includes('PRESENCIA_DEL_CURSOR.montado = true'), 'sin el cursor de la sala (táctil, movimiento reducido) y con el teclado queda la pastilla fija de siempre')

// ═══════════════════════════════════════════════════════════════════════════
titulo('Cierre · 5 · El infinito del recorrido: [CIERRE A] A6 · se sacó (la esquina de abajo a la derecha, libre)')

// [CIERRE A] A6 · con el sentido nuevo: el indicador (la lemniscata que se completaba con el porcentaje) se sacó en escritorio y en el
// teléfono: ni su componente, ni su módulo, ni su montaje (el parlante, en su esquina: `s73` A6). Lo que queda de esta sección es el tono
// del cursor sobre la noche que se ve.
const CHROME_T4 = leer('_chrome/ChromeDelHome.tsx')
const sinElInfinito = (chrome: string): boolean =>
  !existsSync(`${V3}/_chrome/recorrido/InfinitoDelRecorrido.tsx`) && !existsSync(`${V3}/_chrome/recorrido/recorrido.ts`) && !/InfinitoDelRecorrido|infinito-del-recorrido/.test(chrome) && chrome.includes('<EsquinaDelSonido />')
afirmar(sinElInfinito(CHROME_T4), 'el infinito del recorrido no se monta ni existe: el chrome monta la esquina del sonido')
controlPositivo('  el detector VE el infinito montado (el de antes)', CHROME_T4.replace('<EsquinaDelSonido />', '<InfinitoDelRecorrido encima={<SonidoDelHome />} />'), sinElInfinito)
const salaDeTrabajos = { tagName: 'SECTION', parentElement: null, hasAttribute: (n: string) => n === 'data-panel', getAttribute: () => 'trabajos' } as unknown as Element
const tonoDeTrabajos = (noche: number): boolean => tonoBajo(salaDeTrabajos, noche, () => 'rgba(0, 0, 0, 0)') === 'oscuro'
BRILLO_DE_LA_NOCHE.uNoche.value = 1
afirmar(nocheQueSeVe() === 1 && tonoDeTrabajos(nocheQueSeVe()) && CURSOR_TSX.includes('tonoBajo(debajo, nocheQueSeVe())'), '  la noche que SE VE (la del arco o la de la gota): llegando a Trabajos de un salto, claro sobre la noche (el cursor)')
BRILLO_DE_LA_NOCHE.uNoche.value = 0
controlPositivo('el chequeo del tono ve la noche de la gota sola (cero después de un salto) dejándolo oscuro sobre la noche', 0, tonoDeTrabajos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('Cierre · 6 · La sombra de día: una sola, la del logo')

const [dia, noche] = [manchasDelHaz(0, 1, true), manchasDelHaz(1, 1, true)]
afirmar(dia.opacidadBlanda === 0 && dia.opacidadDura === 0 && noche.opacidadDura > 1, 'de día no hay mancha de contacto (queda la sombra real del logo); de noche, sólo la del haz')
afirmar(Array.from({ length: 100 }, (_, k) => k / 100).every((n) => Math.abs(manchasDelHaz(n + 0.01, 1, true).opacidadDura - manchasDelHaz(n, 1, true).opacidadDura) <= 0.02), '  y el paso de una a otra sigue continuo en la noche')

cerrar('s38-interfaz2')
