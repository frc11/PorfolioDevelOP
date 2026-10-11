/**
 * PULIDO 16 — el invariante: npm run test:s67-pulido-16
 *
 * Cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en `docs/rediseno/entregas/pulido-16/`;
 * el log, `docs/rediseno/SPRINT-PULIDO-16.md`.
 *   N1 · Nosotros siempre a la vista: los planos de «El equipo» (el título y las dos personas) y de «Nosotros» (el título y la
 *        foto), alejados (más chicos hacia el centro del cuadro) y siguiendo una parte de la órbita del mouse: en todo el
 *        recorrido, la foto, el nombre y la bio de cada uno (y los títulos y la foto del equipo) quedan dentro del cuadro con 24 px
 *        de margen en el peor caso del mouse, a 1024, 1280, 1366, 1440, 1920 y 2560. (`?nosotros=fijo`, la otra lectura, se
 *        borró en PULIDO 17: s68.)
 *   N2 · el plasma llevado a otro nivel (`?energia=plasma`; el modelo, `docs/rediseno/PLASMA.md`): átomos, iones y electrones con
 *        Coulomb suavizado y repulsión de corto alcance, moléculas que vibran, la temperatura (el puente con el usuario) con su
 *        autolímite, arcos que siguen al campo con sus re-golpes y su resplandor, la ionización y la recombinación, el logo como
 *        generador, el clic, la carga y la descarga; en módulos, sin reservas por cuadro; lo medido en la NVIDIA.
 */
import { existsSync, readFileSync } from 'node:fs'
import * as THREE from 'three'

import { PLANO_DE_NOSOTROS } from '../../_secciones/quienes-somos/geometria'
import { factorDeLaBanda, fovConFactor } from '../escena/banda'
import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { crearDesplazamiento, desplazamientoDelMouse } from '../escena/modulacionDeLaPose'
import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR } from '../escena/probeScene'
import { anotarLaPoseDelCuadro, camaraConParteDelMouse, posarLaCamaraSinElMouse } from '../escena/sinElMouse'
import { cuadrilateroEnElPlano } from '../escena/titulos3d/acompanantes'
import { colocar, lineaDeBase, poseDeLaLectura } from '../escena/titulos3d/colocacion'
import { ARCOS, crearArcos, golpeEn, residualEn } from '../escena/energia/arcos/arcos'
import { CAMINO, PUNTOS_DEL_CAMINO, camino, type Campo } from '../escena/energia/arcos/camino'
import { programarArcos } from '../escena/energia/arcos/programador'
import { crearAfuera, crearMemoria, cuadro } from '../escena/energia/cuadro'
import { CARGA_DE, ESPECIE, ESPECIES, azarConSemilla, cargaTotal, censo, crearParticulas, fundidos, ionizar, recombinar } from '../escena/energia/especies'
import { ENLACE, FISICA, armarLaGrilla, campoEn, cargaCercana, crearEntrada, crearGas } from '../escena/energia/fisica/fisica'
import { pasoDelGas } from '../escena/energia/fisica/integracion'
import { enlacesVivos } from '../escena/energia/fisica/reacciones'
import { TEMPERATURA, calentar, crearTemperatura, pasoDeLaTemperatura } from '../escena/energia/fisica/temperatura'
import { INTERACCION, apretar, avanzar, crearPuntero, moverApretado, soltar } from '../escena/energia/interaccion/interaccion'
import { FRAGMENTOS_DE_LOS_ARCOS, FRAGMENTOS_DE_LOS_EFECTOS } from '../escena/energia/render/arcosYEfectos'
import { armar } from '../escena/energia/render/armado'
import { FRAGMENTOS_DE_LAS_PARTICULAS, PARTICULAS, VERTICES_DE_LAS_PARTICULAS } from '../escena/energia/render/particulas'
import { SONIDOS } from '../sonido/catalogo'
import { CORTES_DEL_SPRITE } from '../sonido/sprite'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const recibo = <T,>(nombre: string): T => JSON.parse(readFileSync(`docs/rediseno/entregas/pulido-16/${nombre}`, 'utf8')) as T

// ═══════════════════════════════════════════════════════════════════════════
titulo('N1 · Nosotros: que siempre se vea todo (alejado, con el mouse en el peor caso)')

type Caja4 = readonly [number, number, number, number]
/** Lo medido: la caja que se ve y si su plano tenía la matriz de la escena (1) o estaba en su lugar del DOM (0). */
type Medida = readonly [number, number, number, number, number]
interface PiezaDelRecibo { readonly id: string; readonly dom: Caja4 }
interface MuestraDelRecibo { readonly scroll: number; readonly progreso: number; readonly piezas: readonly PiezaDelRecibo[]; readonly medido: Readonly<Record<string, Readonly<Record<string, Medida>>>> }
interface AnchoDelRecibo { readonly placa: string; readonly logo: readonly [number, number]; readonly fov: number; readonly muestras: readonly MuestraDelRecibo[] }
const N1 = recibo<{ anchos: Readonly<Record<string, AnchoDelRecibo>> }>('n1-nosotros.json')
const ANCHOS = ['1024x768', '1280x800', '1366x768', '1440x900', '1920x1080', '2560x1440'] as const
const MARGEN = 24
// Las piezas: la foto, el nombre y la bio de cada uno; los dos títulos (sus planos) y la foto del equipo.
const PIEZAS = ['titulo-equipo', 'franco-nombre', 'franco-bio', 'franco-foto', 'valentino-nombre', 'valentino-bio', 'valentino-foto', 'titulo-nosotros', 'nosotros-foto'] as const
// El puntero de r3f en [−1, 1]: quieto, las cuatro esquinas y los cuatro costados (el peor caso está en el borde del cuadro).
const PUNTEROS: readonly (readonly [number, number])[] = [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]
// Las esquinas del banco (el mouse en el píxel de la esquina, 2,6 s: la persecución del puntero, MOUSE_TAU 0,45 s, al 99,7 %).
const ESQUINAS: Readonly<Record<string, readonly [number, number]>> = { quieto: [0, 0], ad: [1, 1], abd: [1, -1], abi: [-1, -1], ai: [-1, 1] }
interface Plano { readonly alejamiento: number; readonly parteDelMouse: number }
const ANTES: Plano = { alejamiento: 1, parteDelMouse: 0 }
const dimensiones = (a: string): readonly [number, number] => a.split('x').map(Number) as unknown as readonly [number, number]

// EL MODELO: las mismas funciones que la escena. La cámara del recorrido es la pose del progreso (sin el mouse ni la inercia: el
// banco esperó a que se asiente) con el logo medido; el mouse le suma lo de `desplazamientoDelMouse`; el plano se coloca con la
// cámara de su parte del mouse (`camaraConParteDelMouse`) y alejado (`colocar`), y las cajas del DOM se proyectan con la viva (la
// parte 1: todo el mouse) por `cuadrilateroEnElPlano`, la cuenta del texto 2D en el plano de su título.
const PLANO = new THREE.Group()
const FUENTE = { ascender: 900, descender: -250, resolution: 1000 }
const Q: number[] = []
function proyectadas(ancho: string, a: AnchoDelRecibo, m: MuestraDelRecibo, plano: Plano, px: number, py: number): Map<string, Caja4> {
  const [W, H] = dimensiones(ancho)
  const base = new THREE.PerspectiveCamera(fovConFactor(CAMERA_FOV, factorDeLaBanda(W, H)), W / H, CAMERA_NEAR, CAMERA_FAR)
  const p = poseDeLaLectura(m.progreso)
  const pose = { angleDeg: p.angleDeg, height: p.height, distance: p.distance, frameX: p.frameX, frameY: p.frameY, logoW: a.logo[0], logoH: a.logo[1] }
  posarLaCamaraSinElMouse(base, pose, W / H)
  anotarLaPoseDelCuadro(base, pose, desplazamientoDelMouse(crearDesplazamiento(), { x: px, y: py }, pose.distance, 1, m.progreso), W / H)
  const delPlano = camaraConParteDelMouse(plano.parteDelMouse).clone()
  const viva = camaraConParteDelMouse(1).clone()
  const lugar = { izquierda: W / 2, arriba: H / 2, linea: 100, cuerpo: 80, ancho: W, alto: H }
  colocar(PLANO, delPlano, lugar, FUENTE, plano.alejamiento)
  const ancla = { x: lugar.izquierda, y: lineaDeBase(lugar, FUENTE) }
  const salida = new Map<string, Caja4>()
  for (const pz of m.piezas) {
    const caja = { x: pz.dom[0], y: pz.dom[1], ancho: pz.dom[2] - pz.dom[0], alto: pz.dom[3] - pz.dom[1] }
    if (!cuadrilateroEnElPlano(PLANO, ancla, lugar.cuerpo, caja, viva, { ancho: W, alto: H }, Q)) continue
    const xs = [0, 2, 4, 6].map((i) => caja.x + Q[i])
    const ys = [1, 3, 5, 7].map((i) => caja.y + Q[i])
    salida.set(pz.id, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)])
  }
  return salida
}

/**
 * EL CRITERIO. Donde la pieza se LEE (la página la tiene entera en el cuadro: su caja del DOM adentro), la que se ve queda adentro
 * con 24 px por los cuatro lados; y donde la pieza cruza el cuadro (entrando o saliendo con el scroll), con 24 px por los
 * costados (por los costados no se entra con el scroll: un corte ahí es siempre del plano). Devuelve el peor margen y dónde.
 */
interface Peor { readonly margen: number; readonly donde: string }
function margenesDe(ancho: string, dom: Caja4, vista: Caja4): readonly number[] {
  const [W, H] = dimensiones(ancho)
  const seLee = dom[0] >= 0 && dom[1] >= 0 && dom[2] <= W && dom[3] <= H
  const cruza = dom[3] > 0 && dom[1] < H
  const costados = [vista[0], W - vista[2]]
  return seLee ? [...costados, vista[1], H - vista[3]] : cruza ? costados : []
}
function peorDelModelo(ancho: string, a: AnchoDelRecibo, plano: Plano): Peor {
  let peor: Peor = { margen: Infinity, donde: '' }
  for (const m of a.muestras) {
    for (const [px, py] of PUNTEROS) {
      const vistas = proyectadas(ancho, a, m, plano, px, py)
      for (const pz of m.piezas) {
        const v = vistas.get(pz.id)
        if (v === undefined) continue
        const margen = Math.min(...margenesDe(ancho, pz.dom, v))
        if (margen < peor.margen) peor = { margen, donde: `${pz.id} en el scroll ${String(m.scroll)}, puntero (${String(px)}, ${String(py)})` }
      }
    }
  }
  return peor
}
const todosLosAnchos = (r: Readonly<Record<string, AnchoDelRecibo>>, plano: Plano, anchos: readonly string[]): Record<string, Peor> => Object.fromEntries(anchos.map((w) => [w, r[w] === undefined ? { margen: -Infinity, donde: 'falta el ancho' } : peorDelModelo(w, r[w], plano)]))
const cubre = (r: Readonly<Record<string, AnchoDelRecibo>>, anchos: readonly string[]): boolean => anchos.every((w) => r[w] !== undefined && r[w].muestras.length >= 10 && PIEZAS.every((id) => r[w].muestras.some((m) => m.piezas.some((p) => p.id === id && margenesDe(w, p.dom, p.dom).length === 4))))
const conMargen = (peores: Record<string, Peor>): boolean => Object.values(peores).every((p) => p.margen >= MARGEN)
const resumen = (peores: Record<string, Peor>): string => Object.entries(peores).map(([w, p]) => `${w}: ${p.margen.toFixed(0)} px`).join(' · ')

afirmar(cubre(N1.anchos, ANCHOS), 'N1 · el recibo cubre los seis anchos, con el recorrido entero de Nosotros (10 muestras o más) y cada pieza leída entera en algún punto', ANCHOS.map((w) => `${w}: ${String(N1.anchos[w]?.muestras.length ?? 0)}`).join(' · '))
// A1 sigue: sin alejar y con el mouse quieto, la cuenta es la identidad (el texto, donde el DOM lo puso, en el plano de su título).
const identidad = (r: Readonly<Record<string, AnchoDelRecibo>>, plano: Plano, k: number): boolean => ANCHOS.every((w) => {
  const [W, H] = dimensiones(w)
  return r[w].muestras.every((m) => {
    const v = proyectadas(w, r[w], m, plano, 0, 0)
    return m.piezas.every((p) => {
      const c = v.get(p.id)
      const esperada = [W / 2 + k * (p.dom[0] - W / 2), H / 2 + k * (p.dom[1] - H / 2), W / 2 + k * (p.dom[2] - W / 2), H / 2 + k * (p.dom[3] - H / 2)]
      return c !== undefined && c.every((x, i) => Math.abs(x - esperada[i]) < 0.5)
    })
  })
})
afirmar(identidad(N1.anchos, ANTES, 1), '  el modelo es la colocación de la escena: sin alejar y con el mouse quieto, cada caja queda donde el DOM la puso (A1, la identidad)')
const SEGUIDO = PLANO_DE_NOSOTROS
afirmar(identidad(N1.anchos, SEGUIDO, SEGUIDO.alejamiento), `  alejado: con el mouse quieto, cada caja se ve ${String(SEGUIDO.alejamiento)} veces más chica hacia el centro del cuadro (el mismo plano, a la profundidad del logo)`)
controlPositivo('  el detector VE un alejamiento que no es el declarado', 0.9, (k: number) => identidad(N1.anchos, { ...SEGUIDO, alejamiento: k }, SEGUIDO.alejamiento))

const delModelo = todosLosAnchos(N1.anchos, SEGUIDO, ANCHOS)
afirmar(conMargen(delModelo), `  en todo el recorrido, con el mouse en el peor caso (las esquinas y los costados), cada foto, nombre y bio (y los títulos y la foto del equipo) entran enteros con ${String(MARGEN)} px de margen (alejado ${String(SEGUIDO.alejamiento)}, el plano sigue ${String(SEGUIDO.parteDelMouse)} de la órbita)`, resumen(delModelo))
const deAntes = todosLosAnchos(N1.anchos, ANTES, ['1920x1080'])
controlPositivo('  el detector VE el corte de antes (a 1920, sin alejar y fijo en el mundo: Valentino y la foto de Franco afuera)', ANTES, (p: Plano) => conMargen(todosLosAnchos(N1.anchos, p, ['1920x1080'])))
afirmar(deAntes['1920x1080'].margen < -150, '  (antes, a 1920: el peor caso se iba más de 150 px de la pantalla)', `${deAntes['1920x1080'].margen.toFixed(0)} px: ${deAntes['1920x1080'].donde}`)
controlPositivo('  el detector VE sólo alejar, sin seguir nada del mouse (hace falta mucho más chico)', { alejamiento: SEGUIDO.alejamiento, parteDelMouse: 0 }, (p: Plano) => conMargen(todosLosAnchos(N1.anchos, p, ANCHOS)))
// Lo legible: el plano no se achica de más (la bio, de 15 px en el DOM, se ve de 12 px o más).
afirmar(SEGUIDO.alejamiento >= 0.8 && SEGUIDO.parteDelMouse <= 0.7, '  lo legible: el plano no se achica de más (la bio de 15 px se ve de 12 o más) y sigue a lo sumo el 70 % de la órbita (se sigue viendo en perspectiva)')

// LO MEDIDO: el banco con el mouse real en las cuatro esquinas (n1-cajas.ts, MOUSE=1), las cajas que se ven (la matriz que la
// escena escribe en el plano, sobre las esquinas de cada pieza en reposo): el mismo criterio, en los seis anchos. Un título 3D
// sin la matriz de su plano (el plano fuera del cuadro) no se midió donde se ve (su lugar del DOM es transparente): no cuenta.
const peorMedido = (ancho: string, a: AnchoDelRecibo): Peor => {
  let peor: Peor = { margen: Infinity, donde: '' }
  for (const m of a.muestras) for (const [estado, cajas] of Object.entries(m.medido)) for (const pz of m.piezas) {
    const v = cajas[pz.id]
    if (v === undefined || (pz.id.startsWith('titulo-') && v[4] !== 1)) continue
    const margen = Math.min(...margenesDe(ancho, pz.dom, [v[0], v[1], v[2], v[3]]))
    if (margen < peor.margen) peor = { margen, donde: `${pz.id} en el scroll ${String(m.scroll)} (${estado})` }
  }
  return peor
}
const medidoBien = (r: Readonly<Record<string, AnchoDelRecibo>>, anchos: readonly string[]): boolean => anchos.every((w) => r[w] !== undefined && r[w].placa !== '' && r[w].muestras.every((m) => ['quieto', 'ad', 'abd', 'abi', 'ai'].every((e) => m.medido[e] !== undefined)) && peorMedido(w, r[w]).margen >= MARGEN)
afirmar(medidoBien(N1.anchos, ANCHOS), `  medido con el mouse real en las cuatro esquinas, en los seis anchos: ninguna pieza a menos de ${String(MARGEN)} px del borde`, ANCHOS.map((w) => `${w}: ${peorMedido(w, N1.anchos[w]).margen.toFixed(0)} px`).join(' · '))
const empujada = (r: Readonly<Record<string, AnchoDelRecibo>>): Readonly<Record<string, AnchoDelRecibo>> => {
  const a = r['1920x1080']
  const i = a.muestras.findIndex((m) => m.piezas.some((p) => p.id === 'valentino-bio' && margenesDe('1920x1080', p.dom, p.dom).length === 4))
  const muestras = a.muestras.map((m, k) => (k !== i ? m : { ...m, medido: { ...m.medido, abd: { ...m.medido.abd, 'valentino-bio': [1700, 600, 1950, 700, 1] as Medida } } }))
  return { ...r, '1920x1080': { ...a, muestras } }
}
controlPositivo('  el detector VE la bio de Valentino cortada a la derecha (como en el pedido)', N1.anchos, (r: Readonly<Record<string, AnchoDelRecibo>>) => medidoBien(empujada(r), ANCHOS))
// El modelo es lo que se ve: en cada muestra y esquina, la caja del modelo y la medida difieren en pocos px (donde el plano tenía
// su matriz: fuera del cuadro la pieza queda en su lugar del DOM, sin dibujarse).
const DIFERENCIA_PX = 8
const coteja = (r: Readonly<Record<string, AnchoDelRecibo>>, plano: Plano): number => {
  let peor = 0
  for (const w of ANCHOS) for (const m of r[w].muestras) for (const [estado, [px, py]] of Object.entries(ESQUINAS)) {
    const vistas = proyectadas(w, r[w], m, plano, px, py)
    for (const [id, medida] of Object.entries(m.medido[estado] ?? {})) {
      const v = vistas.get(id)
      if (v === undefined || medida[4] !== 1) continue
      peor = Math.max(peor, ...v.map((x, i) => Math.abs(x - medida[i])))
    }
  }
  return peor
}
const diferencia = coteja(N1.anchos, SEGUIDO)
afirmar(diferencia <= DIFERENCIA_PX, `  el modelo es lo que se ve: en cada muestra y esquina, la caja del modelo y la medida difieren a lo sumo ${String(DIFERENCIA_PX)} px`, `${diferencia.toFixed(1)} px`)
controlPositivo('  el detector VE un modelo con otro plano (el de antes) contra lo medido', ANTES, (p: Plano) => coteja(N1.anchos, p) <= DIFERENCIA_PX)

// EL CÓDIGO: el título y su texto 2D se colocan con la MISMA cámara (la de su parte del mouse) y el mismo alejamiento (A1: en el
// mismo plano); lo que entra y sale del cuadro se mide donde se ve; la sección pide los dos planos.
const EQUIPO = leer('_secciones/quienes-somos/equipo.tsx')
const TITULOS = leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx')
const ACOMP = leer('_lib/escena/titulos3d/acompanantes.ts')
const RIG = leer('_lib/escena/OrbitRig.tsx')
const COLOC = leer('_lib/escena/titulos3d/colocacion.ts')
const cableado = (equipo: string, titulos: string, acomp: string, rig: string, coloc: string): boolean =>
  /id: 'equipo',[^\n]*queda: false, \.\.\.PLANO_DE_NOSOTROS \}\)/.test(equipo) && /id: 'nosotros',[^\n]*queda: false, \.\.\.PLANO_DE_NOSOTROS \}\)/.test(equipo) &&
  /const deColocar = \(a\.titulo\.parteDelMouse \?\? 0\) > 0 \? camaraConParteDelMouse\(a\.titulo\.parteDelMouse \?\? 0\) : viva/.test(titulos) &&
  titulos.includes('colocarElArmado(a, s.nudo, aspecto, stats, deColocar)') && titulos.includes('ubicar(a, d, deColocar)') &&
  titulos.includes('colocar(a.grupo, viva, a.ahora, a.fuente.data, a.titulo.alejamiento)') && titulos.includes('colocar(a.grupo, nudo, lugar, a.fuente.data, a.titulo.alejamiento)') &&
  /alturaAlejada\(l\.arriba \+ d, l\.alto, k\) > l\.alto \|\| alturaAlejada\(l\.arriba \+ l\.linea \+ d, l\.alto, k\) < 0/.test(titulos) &&
  acomp.includes('colocar(PLANO, camaraConParteDelMouse(t.parteDelMouse ?? 0), AHORA, a.fuente.data, k)') && acomp.includes('colocar(PLANO, camara, lugar, a.fuente.data, t.alejamiento)') &&
  /alturaAlejada\(y, cuadro\.alto, k\) > cuadro\.alto \|\| alturaAlejada\(y \+ alto, cuadro\.alto, k\) < 0/.test(acomp) &&
  /posarLaCamaraSinElMouse\(state\.camera, sinElMouse, [^\n]+\n[^\n]*\n\s*anotarLaPoseDelCuadro\(state\.camera, sinElMouse, desplazamiento, /.test(rig) &&
  /const x = alejamiento \* \(\(2 \* lugar\.izquierda\) \/ lugar\.ancho - 1\)/.test(coloc) && /const mundoPorPx = \(alejamiento \* 2 \* profundidad/.test(coloc)
afirmar(cableado(EQUIPO, TITULOS, ACOMP, RIG, COLOC), '  en el código: los dos títulos piden su plano; el título y su texto 2D se colocan con la misma cámara (su parte del mouse) y el mismo alejamiento; lo que sale del cuadro, donde se ve; el rig anota la pose de cada cuadro')
controlPositivo('  el detector VE el texto 2D colocado con la cámara sin el mouse y el título con la suya (fuera de su plano)', ACOMP.replace('colocar(PLANO, camaraConParteDelMouse(t.parteDelMouse ?? 0), AHORA, a.fuente.data, k)', 'colocar(PLANO, CAMARA_SIN_EL_MOUSE, AHORA, a.fuente.data, k)'), (c: string) => cableado(EQUIPO, TITULOS, c, RIG, COLOC))
controlPositivo('  y el título que deja el plano de Nosotros (sin alejar)', EQUIPO.replace("id: 'equipo', texto: CONTENIDO.tituloDelEquipo, fuente: 'chivo-400', gesto: 'levanta', llegada: progreso, queda: false, ...PLANO_DE_NOSOTROS })", "id: 'equipo', texto: CONTENIDO.tituloDelEquipo, fuente: 'chivo-400', gesto: 'levanta', llegada: progreso, queda: false })"), (c: string) => cableado(c, TITULOS, ACOMP, RIG, COLOC))
controlPositivo('  y lo que sale del cuadro medido en el DOM (el salto al salir)', ACOMP.replace('alturaAlejada(y, cuadro.alto, k) > cuadro.alto || alturaAlejada(y + alto, cuadro.alto, k) < 0', 'y > cuadro.alto || y + alto < 0'), (c: string) => cableado(EQUIPO, TITULOS, c, RIG, COLOC))
// [PULIDO 17] O1 · la bandera (`nosotros=fijo`) se borró: s68 afirma que no vuelve.

// ═══════════════════════════════════════════════════════════════════════════
titulo('N2 · El plasma: átomos, iones y electrones; arcos que obedecen a la física')

/** El cuerpo de la función `nombre` en `texto` (de la llave que abre su renglón a la que la cierra), o '' si no está. */
const cuerpo = (texto: string, nombre: string): string => {
  const m = new RegExp(`function ${nombre}\\(`).exec(texto)
  if (m === null) return ''
  const desde = texto.indexOf('{\n', m.index)
  if (desde < 0) return ''
  let nivel = 0
  for (let i = desde; i < texto.length; i += 1) {
    if (texto[i] === '{') nivel += 1
    else if (texto[i] === '}') {
      nivel -= 1
      if (nivel === 0) return texto.slice(desde, i + 1)
    }
  }
  return ''
}

// LOS MÓDULOS: especies, física, arcos, interacción y dibujo, cada uno en su archivo (ninguno de más de 300 líneas de código); los
// de PULIDO 15 (cargas, arcos de 394 líneas, sombreadores, armado) se borraron.
const ENERGIA = `${V3}/_lib/escena/energia`
const MODULOS = ['especies.ts', 'fisica/fisica.ts', 'fisica/integracion.ts', 'fisica/reacciones.ts', 'fisica/temperatura.ts', 'arcos/camino.ts', 'arcos/arcos.ts', 'arcos/programador.ts', 'arcos/bufer.ts', 'interaccion/interaccion.ts', 'interaccion/puntero.ts', 'interaccion/lineasDeCampo.ts', 'render/comun.ts', 'render/particulas.ts', 'render/arcosYEfectos.ts', 'render/armado.ts', 'cuadro.ts', 'banco.ts', 'PlasmaYCargas.tsx', 'textoEnPantalla.ts'] as const
const deCodigo = (t: string): number => t.split('\n').filter((l) => l.trim() !== '' && !/^\s*(\/\/|\*|\/\*)/.test(l)).length
const ARCHIVOS: Record<string, string | undefined> = Object.fromEntries(MODULOS.map((m) => [m, existsSync(`${ENERGIA}/${m}`) ? readFileSync(`${ENERGIA}/${m}`, 'utf8').replace(/\r\n/g, '\n') : undefined]))
const modulosBien = (a: Record<string, string | undefined>): boolean => MODULOS.every((m) => a[m] !== undefined && deCodigo(a[m] ?? '') <= 300) && !['cargas.ts', 'arcos.ts', 'sombreadores.ts', 'armado.ts'].some((v) => existsSync(`${ENERGIA}/${v}`))
afirmar(modulosBien(ARCHIVOS), 'N2 · el plasma en módulos —especies, física (fuerzas, integración, reacciones, temperatura), arcos (camino, modelo, programador, búfer), interacción, dibujo— ninguno de más de 300 líneas de código; los de PULIDO 15 se borraron', MODULOS.map((m) => `${m.split('/').pop() ?? m} ${String(deCodigo(ARCHIVOS[m] ?? ''))}`).join(' · '))
controlPositivo('  el detector VE un arcos.ts de 400 líneas', { ...ARCHIVOS, 'arcos/arcos.ts': 'const x = 1\n'.repeat(400) }, modulosBien)

// LAS ESPECIES: el átomo neutro, el ion + y el electrón −; ionizar suelta un electrón rápido y recombinar lo devuelve (con su
// destello y su eco); la carga se conserva siempre; el electrón capturado se funde y libera su lugar.
const cicloBien = (ioniza: typeof ionizar): boolean => {
  const azar = azarConSemilla(2)
  const p = crearParticulas(10, 4, azar)
  const antes = censo(p)
  const e = ioniza(p, 5, 1, 0, 0, 3, azar)
  if (e < 0 || cargaTotal(p) !== 0) return false
  const despues = censo(p)
  const sale = Math.hypot(p.velocidad[e * 3], p.velocidad[e * 3 + 1], p.velocidad[e * 3 + 2]) >= 2.5 && p.alfa[e] === 0
  const ionizado = despues.iones === antes.iones + 1 && despues.electrones === antes.electrones + 1 && despues.atomos === antes.atomos - 1
  const brilloAntes = p.brillo[5]
  if (!recombinar(p, 5, e) || p.especie[5] !== ESPECIE.atomo || cargaTotal(p) !== 0 || p.brillo[5] <= brilloAntes || p.ecos[((p.eco + ESPECIES.eco.cuantos - 1) % ESPECIES.eco.cuantos) * 4 + 3] !== 0) return false
  for (let k = 0; k < 30; k += 1) fundidos(p, 1 / 60, azar)
  return sale && ionizado && p.especie[e] === ESPECIE.vacio && cargaTotal(p) === 0
}
const especiesBien = CARGA_DE[ESPECIE.atomo] === 0 && CARGA_DE[ESPECIE.ion] === 1 && CARGA_DE[ESPECIE.electron] === -1 && cargaTotal(crearParticulas(ESPECIES.atomos.escritorio, ESPECIES.electrones.escritorio, azarConSemilla(1))) === 0
afirmar(especiesBien && cicloBien(ionizar), '  las especies: átomo (0), ion (+1), electrón (−1); ionizar suelta un electrón rápido (aparece con su fundido); recombinar lo devuelve al átomo con un destello y un eco, y el electrón capturado se funde y libera su lugar; la carga, siempre cero')
controlPositivo('  el detector VE una ionización que no suelta el electrón', ((p: Parameters<typeof ionizar>[0], i: number) => {
  p.especie[i] = ESPECIE.ion
  return p.nAtomos
}) as typeof ionizar, cicloBien)
// Nunca un pop: lo que se ve persigue a su meta en su tiempo; el más rápido (el electrón que sale disparado) tarda tres cuadros o más.
const saltoMaximo = (f: typeof fundidos): number => {
  const azar = azarConSemilla(3)
  const p = crearParticulas(40, 8, azar)
  ionizar(p, 7, 0, 1, 0, 3, azar)
  let maximo = 0
  for (let k = 0; k < 90; k += 1) {
    const antes = p.alfa.slice()
    f(p, 1 / 60, azar)
    for (let i = 0; i < p.n; i += 1) maximo = Math.max(maximo, Math.abs(p.alfa[i] - antes[i]))
  }
  return maximo
}
const sinPop = (f: typeof fundidos): boolean => saltoMaximo(f) <= 1 / 60 / Math.min(...Object.values(ESPECIES.fundido)) + 1e-6 && Math.min(...Object.values(ESPECIES.fundido)) * 60 >= 3
afirmar(sinPop(fundidos), `  al nacer y al morir, un fundido (nunca un pop): lo más rápido tarda ${String(Math.round(Math.min(...Object.values(ESPECIES.fundido)) * 60))} cuadros; el salto mayor de un cuadro, ${saltoMaximo(fundidos).toFixed(2)}`)
controlPositivo('  el detector VE partículas que aparecen de golpe', ((p: Parameters<typeof fundidos>[0]) => {
  for (let i = 0; i < p.n; i += 1) p.alfa[i] = p.meta[i]
}) as typeof fundidos, sinPop)

// LA FÍSICA, sin navegador: un par de cargas (lejos del logo, sin agitación de más) se atrae si son opuestas y se repele si son
// iguales; pegadas, la repulsión de corto alcance las separa (no colapsan); el campo es finito encima de una carga (suavizado).
// Dos partículas (la primera en el lugar 0; la segunda en el 2 si es un electrón, en el 1 si no), a `d` u, lejos del logo.
const parDeCargas = (a: number, b: number, d: number): { p: ReturnType<typeof crearParticulas>; g: ReturnType<typeof crearGas> } => {
  const p = crearParticulas(2, 1, azarConSemilla(4))
  p.especie.fill(ESPECIE.vacio)
  p.especie[0] = a
  const j = b === ESPECIE.electron ? 2 : 1
  p.especie[j] = b
  p.lugar.fill(0)
  p.lugar.set([8 - d / 2, 0, 0], 0)
  p.lugar.set([8 + d / 2, 0, 0], j * 3)
  p.velocidad.fill(0)
  p.alfa.fill(1)
  p.meta.fill(1)
  return { p, g: crearGas(p) }
}
const separacion = (p: ReturnType<typeof crearParticulas>, i: number, j: number): number => Math.hypot(p.lugar[j * 3] - p.lugar[i * 3], p.lugar[j * 3 + 1] - p.lugar[i * 3 + 1], p.lugar[j * 3 + 2] - p.lugar[i * 3 + 2])
const correr = (paso: typeof pasoDelGas, g: ReturnType<typeof crearGas>, segundos: number, temperatura = 0): void => {
  const e = crearEntrada()
  e.temperatura = temperatura
  const azar = azarConSemilla(5)
  for (let t = 0; t < segundos; t += 1 / 60) paso(g, 1 / 60, e, azar)
}
const fuerzas = (paso: typeof pasoDelGas): readonly number[] => {
  const opuestas = parDeCargas(ESPECIE.ion, ESPECIE.electron, 1.6)
  correr(paso, opuestas.g, 1)
  const iguales = parDeCargas(ESPECIE.ion, ESPECIE.ion, 1.2)
  correr(paso, iguales.g, 1.5)
  const pegadas = parDeCargas(ESPECIE.ion, ESPECIE.electron, 0.02)
  correr(paso, pegadas.g, 0.4)
  return [separacion(opuestas.p, 0, 2), separacion(iguales.p, 0, 1), separacion(pegadas.p, 0, 2)]
}
const fuerzasBien = (paso: typeof pasoDelGas): boolean => {
  const [o, i, p] = fuerzas(paso)
  return o < 1.2 && i > 1.6 && p > FISICA.repulsion.sigma * 0.5
}
const F = fuerzas(pasoDelGas)
const E0 = new Float32Array(3)
const sobreLaCarga = parDeCargas(ESPECIE.ion, ESPECIE.electron, 1)
armarLaGrilla(sobreLaCarga.g)
campoEn(sobreLaCarga.g, crearEntrada(), sobreLaCarga.p.lugar[0], 0, 0, E0)
afirmar(fuerzasBien(pasoDelGas) && E0.every((x) => Number.isFinite(x)), `  la física: Coulomb suavizado (las opuestas se acercan, 1,6 → ${F[0].toFixed(2)} u en 1 s; las iguales se alejan, 1,2 → ${F[1].toFixed(2)}; el campo, finito encima de una carga) y la repulsión de corto alcance (pegadas a 0,02 u, en 0,4 s → ${F[2].toFixed(2)}: no colapsan)`)
controlPositivo('  el detector VE una física en la que nada se mueve', ((g: ReturnType<typeof crearGas>) => {
  void g
}) as typeof pasoDelGas, fuerzasBien)

// EL GAS EN EL TIEMPO (dos minutos, como en la página: 60 cuadros por segundo): 40 s en calma, 40 s con scroll rápido (3,5 pantallas
// por segundo, la mitad del tiempo) y 40 s en calma otra vez, con los arcos y los anillos del pulso del logo cada 3,7 s.
interface CorridaDelGas { temperaturas: number[]; moleculas: number[]; iones: number[]; ionizaciones: number; recombinaciones: number; minima: number; carga: number; nan: boolean; arcos: number; mirados: number; vibra: number; subpasos: boolean; enElTexto: number; porClase: Record<string, number> }
const conTexto = (x: number): boolean => x > 0.3
const correrElGas = (compacto: boolean, temperar: typeof pasoDeLaTemperatura, seVe: (x: number, y: number, z: number) => boolean = (x) => x > -1e9): CorridaDelGas => {
  const azar = azarConSemilla(16)
  const p = crearParticulas(compacto ? ESPECIES.atomos.compacta : ESPECIES.atomos.escritorio, compacto ? ESPECIES.electrones.compacta : ESPECIES.electrones.escritorio, azar)
  const g = crearGas(p)
  const e = crearEntrada()
  const arcos = crearArcos(azar)
  const T = crearTemperatura()
  const en = {
    rayo: null,
    maximo: compacto ? ARCOS.maximoCompacto : ARCOS.maximo,
    temperatura: 0,
    actividadDelLogo: 0,
    seVe,
    bordeDelLogo: (x: number, y: number, z: number, d: Float32Array): boolean => {
      const l = Math.hypot(x, y, z) || 1
      d[0] = (x / l) * 3.4
      d[1] = (y / l) * 3.4
      d[2] = (z / l) * 3.4
      return seVe(d[0], d[1], d[2])
    },
    campo: (x: number, y: number, z: number, d: Float32Array): void => campoEn(g, e, x, y, z, d),
    buscarCarga: (x: number, y: number, z: number, d: Float32Array): boolean => {
      const j = cargaCercana(g, x, y, z, CAMINO.ramas.busca, -1)
      if (j < 0) return false
      d.set(p.lugar.subarray(j * 3, j * 3 + 3))
      return true
    },
  }
  const r: CorridaDelGas = { temperaturas: [], moleculas: [], iones: [], ionizaciones: 0, recombinaciones: 0, minima: Infinity, carga: 0, nan: false, arcos: 0, mirados: 0, vibra: 0, subpasos: true, enElTexto: 0, porClase: {} }
  let ultimoAnillo = -10
  const largos: number[] = []
  let seguido = -1
  for (let k = 0; k < 120 * 60; k += 1) {
    const s = k / 60
    if (s - ultimoAnillo >= 3.72) {
      ultimoAnillo = s
      calentar(T, TEMPERATURA.anillo)
    }
    temperar(T, 1 / 60, s > 40 && s < 80 ? (Math.sin(s * 1.3) > 0 ? 3.5 : 0.5) : 0)
    e.temperatura = T.valor
    e.tiempo = s
    en.temperatura = T.valor
    pasoDelGas(g, 1 / 60, e, azar)
    r.subpasos = r.subpasos && g.acumulado < FISICA.paso + 1e-9
    programarArcos(arcos, g, 1 / 60, en, azar)
    if (arcos.nacidos > 0) calentar(T, TEMPERATURA.arco * arcos.nacidos)
    for (const a of arcos.arcos) {
      if (!a.activo || a.edad > 1e-9) continue
      // Un arco que nace: sus dos extremos, a la vista.
      const desde = a.a >= 0 ? p.lugar.subarray(a.a * 3, a.a * 3 + 3) : a.puntoA
      const hasta = a.b >= 0 ? p.lugar.subarray(a.b * 3, a.b * 3 + 3) : a.puntoB
      if (!conTexto(desde[0]) || !conTexto(hasta[0])) r.enElTexto += 1
    }
    r.arcos = Math.max(r.arcos, arcos.arcos.filter((a) => a.activo).length)
    // Un enlace en calma, seguido 2 s: su largo late.
    if (seguido < 0 && s > 20 && s < 30) for (let i = 0; i < p.n; i += 1) if (g.tipo[i] === ENLACE.molecula && g.pareja[i] > i) seguido = i
    if (seguido >= 0 && largos.length < 120 && g.pareja[seguido] >= 0) largos.push(separacion(p, seguido, g.pareja[seguido]))
    if (k % 60 === 59) {
      r.temperaturas.push(T.valor)
      r.moleculas.push(enlacesVivos(g).moleculas)
      r.iones.push(censo(p).iones)
      r.carga = Math.max(r.carga, Math.abs(cargaTotal(p)))
      for (let i = 0; i < p.n; i += 1) {
        if (p.especie[i] === ESPECIE.vacio || p.capturadoPor[i] >= 0) continue
        if (!Number.isFinite(p.lugar[i * 3]) || !Number.isFinite(p.velocidad[i * 3])) r.nan = true
        for (let j = i + 1; j < p.n; j += 1) if (p.especie[j] !== ESPECIE.vacio && p.capturadoPor[j] < 0) r.minima = Math.min(r.minima, separacion(p, i, j))
      }
    }
  }
  r.ionizaciones = p.cuenta.ionizaciones
  r.recombinaciones = p.cuenta.recombinaciones
  r.mirados = g.paresMirados
  const media = largos.reduce((a, b) => a + b, 0) / Math.max(1, largos.length)
  r.vibra = largos.length >= 60 ? Math.sqrt(largos.reduce((a, b) => a + (b - media) ** 2, 0) / largos.length) : 0
  r.porClase = Object.fromEntries(Object.entries(arcos.contados).map(([c, v]) => [c, Math.round((v / 120) * 100) / 100]))
  return r
}
const promedio = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const GAS = correrElGas(false, pasoDeLaTemperatura)
const calma = (r: CorridaDelGas): readonly number[] => r.temperaturas.slice(10, 40)
const caliente = (r: CorridaDelGas): readonly number[] => r.temperaturas.slice(45, 80)
const temperaturaBien = (r: CorridaDelGas): boolean => Math.max(...calma(r)) <= 0.3 && promedio(caliente(r)) >= 0.55 && Math.max(...r.temperaturas) <= TEMPERATURA.techo && r.temperaturas[r.temperaturas.length - 1] <= 0.3
afirmar(temperaturaBien(GAS), `  la temperatura: en calma ${promedio(calma(GAS)).toFixed(2)} (con los anillos del logo y los arcos), con el scroll rápido ${promedio(caliente(GAS)).toFixed(2)}, vuelve a la calma (${GAS.temperaturas[GAS.temperaturas.length - 1].toFixed(2)}) y nunca pasa del techo (${String(TEMPERATURA.techo)}: el autolímite)`)
controlPositivo('  el detector VE una temperatura sin autolímite (lo crudo, sin saturar)', ((t: ReturnType<typeof crearTemperatura>, dt: number, v: number) => {
  pasoDeLaTemperatura(t, dt, v)
  t.valor = t.crudo * 1.6
}) as typeof pasoDeLaTemperatura, (f: typeof pasoDeLaTemperatura) => temperaturaBien(correrElGas(false, f)))
// Caliente se rompen las moléculas y hay más iones; al volver la calma se forman moléculas y los iones recapturan (se ordena).
const ordenBien = (r: CorridaDelGas): boolean => {
  const [caliente, despues] = [r.moleculas.slice(50, 80), r.moleculas.slice(95, 120)]
  return promedio(despues) > promedio(caliente) + 2 && promedio(r.iones.slice(50, 80)) > promedio(r.iones.slice(10, 40)) && promedio(r.iones.slice(110, 120)) < promedio(r.iones.slice(70, 80)) && r.vibra > 0.015
}
afirmar(ordenBien(GAS), `  caliente se rompen las moléculas y hay más iones (moléculas ${promedio(GAS.moleculas.slice(50, 80)).toFixed(1)}, iones ${promedio(GAS.iones.slice(10, 40)).toFixed(1)} → ${promedio(GAS.iones.slice(50, 80)).toFixed(1)}); al volver la calma se ordena (moléculas ${promedio(GAS.moleculas.slice(95, 120)).toFixed(1)}, iones ${promedio(GAS.iones.slice(110, 120)).toFixed(1)}); el enlace vibra (su largo varía ${GAS.vibra.toFixed(3)} u)`)
const FRIO: CorridaDelGas = correrElGas(false, ((t: ReturnType<typeof crearTemperatura>, dt: number) => pasoDeLaTemperatura(t, dt, 0)) as typeof pasoDeLaTemperatura)
controlPositivo('  el detector VE un gas que no se calienta (nada se rompe)', FRIO, ordenBien)
const cicloDelGas = (r: CorridaDelGas, pool: number): boolean => r.ionizaciones > 30 && r.recombinaciones > 30 && Math.max(...r.iones) <= pool && r.carga === 0 && !r.nan && r.minima > 0.08 && r.subpasos
afirmar(cicloDelGas(GAS, ESPECIES.electrones.escritorio), `  el ciclo, contenido: ${String(GAS.ionizaciones)} ionizaciones y ${String(GAS.recombinaciones)} recombinaciones en 2 min; los iones nunca pasan de la reserva de electrones (${String(Math.max(...GAS.iones))} de ${String(ESPECIES.electrones.escritorio)}); la carga, cero; sin NaN; nunca a menos de ${GAS.minima.toFixed(2)} u (no colapsan); paso fijo de 1/120 s con subpasos`)
controlPositivo('  el detector VE un gas que colapsa', { ...GAS, minima: 0.01 }, (r: CorridaDelGas) => cicloDelGas(r, ESPECIES.electrones.escritorio))
const grillaBien = (mirados: number, n: number): boolean => mirados < ((n * (n - 1)) / 2) * 0.2
const N_ESCRITORIO = ESPECIES.atomos.escritorio + ESPECIES.electrones.escritorio
afirmar(grillaBien(GAS.mirados, N_ESCRITORIO), `  la grilla: ${String(GAS.mirados)} pares mirados por subpaso de ${String((N_ESCRITORIO * (N_ESCRITORIO - 1)) / 2)} (lineal en la cantidad, no O(n²)); ${String(N_ESCRITORIO)} partículas en escritorio y ${String(ESPECIES.atomos.compacta + ESPECIES.electrones.compacta)} en el teléfono (cientos)`)
controlPositivo('  el detector VE todos contra todos', (N_ESCRITORIO * (N_ESCRITORIO - 1)) / 2, (m: number) => grillaBien(m, N_ESCRITORIO))

// LOS ARCOS: como mucho 5 a la vez (4 en el teléfono; los re-golpes no suman); ninguno nace sobre un texto (acá, la mitad de la
// izquierda); las tres clases de siempre (pares, logo) a su ritmo.
const TELEFONO = correrElGas(true, pasoDeLaTemperatura)
const CON_TEXTO = correrElGas(false, pasoDeLaTemperatura, conTexto)
const arcosBien = (r: CorridaDelGas, maximo: number): boolean => r.arcos <= maximo && r.arcos >= 3 && (r.porClase.par ?? 0) > 0.3 && (r.porClase.logo ?? 0) > 0.15
afirmar(arcosBien(GAS, ARCOS.maximo) && arcosBien(TELEFONO, ARCOS.maximoCompacto) && arcosBien(CON_TEXTO, ARCOS.maximo) && CON_TEXTO.enElTexto === 0, `  los arcos en 2 min: como mucho ${String(GAS.arcos)} a la vez (${String(TELEFONO.arcos)} en el teléfono); por segundo ${JSON.stringify(GAS.porClase)}; con un texto en media pantalla, ninguno nace encima`)
controlPositivo('  el detector VE arcos que nacen sobre el texto (un programador que no lo pregunta)', correrElGas(false, pasoDeLaTemperatura, () => true), (r: CorridaDelGas) => r.enElTexto === 0)
// El camino sigue al campo: un líder escalonado guiado por el campo de verdad va más alineado con él (|cos| medio entre cada paso
// del líder y el campo en ese punto, medido aparte) que uno guiado por un campo al azar (el camino que ignora la física). Entre
// las dos cargas de un par, desde un costado: las líneas de campo se curvan.
const PAR_DEL_CAMPO = parDeCargas(ESPECIE.ion, ESPECIE.electron, 5)
armarLaGrilla(PAR_DEL_CAMPO.g)
const ENTRADA_DEL_CAMPO = crearEntrada()
const conCampo: Campo = (x, y, z, d) => campoEn(PAR_DEL_CAMPO.g, ENTRADA_DEL_CAMPO, x, y, z, d)
const alineacionCon = (guia: Campo): number => {
  const p = PAR_DEL_CAMPO.p
  const salida = new Float32Array(PUNTOS_DEL_CAMINO * 3)
  const E1 = new Float32Array(3)
  const azar = azarConSemilla(7)
  let [suma, n] = [0, 0]
  for (let k = 0; k < 40; k += 1) {
    camino(salida, p.lugar[0] + 0.3, 0.9, 0.3, p.lugar[6] - 0.3, -0.9, -0.2, guia, azar, false)
    for (let s = 0; s + CAMINO.detalle < PUNTOS_DEL_CAMINO; s += CAMINO.detalle) {
      const [x, y, z] = [salida[s * 3], salida[s * 3 + 1], salida[s * 3 + 2]]
      const t = s + CAMINO.detalle
      const d = [salida[t * 3] - x, salida[t * 3 + 1] - y, salida[t * 3 + 2] - z]
      conCampo(x, y, z, E1)
      const [ld, le] = [Math.hypot(d[0], d[1], d[2]), Math.hypot(E1[0], E1[1], E1[2])]
      if (ld < 1e-6 || le < 1e-9) continue
      suma += Math.abs((d[0] * E1[0] + d[1] * E1[1] + d[2] * E1[2]) / (ld * le))
      n += 1
    }
  }
  return suma / Math.max(1, n)
}
const azarDelCampo = azarConSemilla(8)
const CAMPO_AL_AZAR: Campo = (x, y, z, d) => {
  d[0] = azarDelCampo() - 0.5
  d[1] = azarDelCampo() - 0.5
  d[2] = azarDelCampo() - 0.5
}
const ALINEADO = alineacionCon(conCampo)
const AL_AZAR = alineacionCon(CAMPO_AL_AZAR)
// Sesgado por el campo, no al azar: el guiado por el campo, bastante más alineado con él que el guiado al azar.
const sigueAlCampo = (guia: Campo): boolean => alineacionCon(guia) >= AL_AZAR + 0.08
afirmar(sigueAlCampo(conCampo), `  el camino de un arco es un líder escalonado que sigue al campo: alineado ${ALINEADO.toFixed(2)} con él (|cos| medio de cada paso con el campo de verdad; un camino guiado por un campo al azar, ${AL_AZAR.toFixed(2)})`)
controlPositivo('  el detector VE un camino al azar', CAMPO_AL_AZAR, sigueAlCampo)
// Los re-golpes: 2 o 3 golpes en ~150 ms por el mismo canal, con su resplandor que decae en ~140 ms; el arco vive lo que tarda.
const regolpesBien = (golpes: readonly number[], vida: number, enGolpe: (t: number) => number, residual: (t: number) => number): boolean => {
  const ultimo = golpes[golpes.length - 1]
  return golpes.length >= 2 && golpes.length <= 3 && ultimo <= ARCOS.golpes.ventana[1] + 1e-6 && golpes.every((t) => enGolpe(t) >= 0.95) && residual(ultimo + 0.2) < 0.35 * residual(ultimo + 0.005) && vida > ultimo + 0.25 && vida < ultimo + 0.45
}
const UN_ARCO = (() => {
  const azar = azarConSemilla(9)
  const e = crearArcos(azar)
  const { p, g } = parDeCargas(ESPECIE.ion, ESPECIE.electron, 1)
  armarLaGrilla(g)
  g.pareja[0] = 2
  g.pareja[2] = 0
  e.forzado = 'par'
  const en = { rayo: null, maximo: 5, temperatura: 0.2, actividadDelLogo: 0, seVe: () => true, bordeDelLogo: () => false, campo: conCampo, buscarCarga: () => false }
  programarArcos(e, g, 1 / 60, en, azar)
  void p
  return e.arcos.find((a) => a.activo) ?? null
})()
afirmar(UN_ARCO !== null && regolpesBien([...UN_ARCO.tiempos.slice(0, UN_ARCO.golpes)], UN_ARCO.vida, (t) => golpeEn(UN_ARCO, t), (t) => residualEn(UN_ARCO, t)), `  la re-descarga: ${String(UN_ARCO?.golpes ?? 0)} golpes a los ${[...(UN_ARCO?.tiempos.slice(0, UN_ARCO.golpes) ?? [])].map((t) => String(Math.round(t * 1000))).join(', ')} ms por el mismo canal; el resplandor del canal decae en ~${String(Math.round(ARCOS.golpes.residual * 1000))} ms; vive ${String(Math.round((UN_ARCO?.vida ?? 0) * 1000))} ms`)
controlPositivo('  el detector VE un arco de un solo golpe', [0], (g: readonly number[]) => UN_ARCO !== null && regolpesBien(g, UN_ARCO.vida, (t) => golpeEn(UN_ARCO, t), (t) => residualEn(UN_ARCO, t)))
// La ionización por un arco: el del logo, hacia un átomo en el medio de un grupo de átomos: ioniza (el átomo donde pega o los que
// toca su camino) y el electrón sale disparado.
const ionizaElArco = (forzar: (e: ReturnType<typeof crearArcos>) => void): boolean => {
  const azar = azarConSemilla(10)
  const p = crearParticulas(30, 10, azar)
  for (let i = 0; i < 30; i += 1) {
    p.especie[i] = ESPECIE.atomo
    p.lugar.set([5 + (i % 5) * 0.3, Math.floor(i / 5) * 0.3 - 0.8, 0], i * 3)
    p.alfa[i] = 1
    p.meta[i] = 1
  }
  for (let i = 30; i < 40; i += 1) p.especie[i] = ESPECIE.vacio
  const g = crearGas(p)
  armarLaGrilla(g)
  const e = crearArcos(azar)
  forzar(e)
  const en = { rayo: null, maximo: 5, temperatura: 0.2, actividadDelLogo: 0, seVe: () => true, bordeDelLogo: (x: number, y: number, z: number, d: Float32Array): boolean => { d.set([3.4, 0, 0]); return true }, campo: (x: number, y: number, z: number, d: Float32Array): void => campoEn(g, crearEntrada(), x, y, z, d), buscarCarga: () => false }
  const antes = p.cuenta.ionizaciones
  programarArcos(e, g, 1 / 60, en, azar)
  const e2 = p.especie.indexOf(ESPECIE.electron)
  return p.cuenta.ionizaciones > antes && e2 >= 0 && Math.hypot(p.velocidad[e2 * 3], p.velocidad[e2 * 3 + 1], p.velocidad[e2 * 3 + 2]) >= ARCOS.eyeccion[0] - 0.5
}
afirmar(ionizaElArco((e) => { e.forzado = 'logo' }), '  la ionización: un arco del logo hacia un grupo de átomos ioniza (el átomo donde pega o los que toca su camino) y el electrón sale disparado')
controlPositivo('  el detector VE un arco que no nace (y nada se ioniza)', (e: ReturnType<typeof crearArcos>) => { e.forzado = null; e.proximoDelLogo = 99 }, ionizaElArco)

// LA INTERACCIÓN, la máquina del gesto: un clic corto es un pulso; mantener carga (en 1,4 s del todo) y soltar dispara la descarga
// con su fuerza; un dedo que se mueve (el scroll) cancela; sobre un texto, nada.
const gestoBien = (mover: typeof moverApretado): boolean => {
  const pulso = crearPuntero()
  apretar(pulso, 0, 100, 100, false)
  soltar(pulso, 120)
  const carga = crearPuntero()
  apretar(carga, 0, 100, 100, false)
  for (let t = 0; t <= 1800; t += 16) avanzar(carga, t, 0.016)
  const cargada = carga.carga
  soltar(carga, 1800)
  const scroll = crearPuntero()
  apretar(scroll, 0, 100, 100, false)
  mover(scroll, 100, 160, true)
  soltar(scroll, 100)
  const texto = crearPuntero()
  apretar(texto, 0, 100, 100, true)
  soltar(texto, 100)
  return pulso.pulso && !pulso.descarga && cargada > 0.99 && carga.descarga && carga.fuerza > 0.99 && !carga.pulso && !scroll.pulso && !scroll.descarga && !texto.pulso
}
afirmar(gestoBien(moverApretado), `  el gesto: un clic corto (menos de ${String(Math.round(INTERACCION.mantener * 1000))} ms) es el pulso; mantener carga (del todo en ${String(INTERACCION.carga)} s: el puntero ${String(INTERACCION.cargaMaxima)} veces más fuerte) y soltar es la descarga; el dedo que se mueve más de ${String(INTERACCION.mueveCancela)} px está haciendo scroll (se cancela); sobre un texto, nada`)
controlPositivo('  el detector VE un scroll del dedo que dispara un pulso', (() => undefined) as typeof moverApretado, gestoBien)

// EL CUADRO ENTERO, sin navegador (las mallas de three se arman igual): el logo es el generador (más arcos después de su pulso y en
// el golpe del final, una descarga), el clic tira arcos y ioniza, soltar lo cargado dispara la descarga; caliente con el scroll.
const LOGO = new THREE.Group()
LOGO.add(new THREE.Mesh(new THREE.BoxGeometry(6.9, 4.8, 1)))
LOGO.updateMatrixWorld(true)
const CAMARA = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 200)
CAMARA.position.set(0, 2, 24)
CAMARA.lookAt(0, 0, 0)
CAMARA.updateMatrixWorld(true)
interface CorridaDelCuadro { logos: number; pulsos: number; descargas: number; ionizacionesDelPulso: number; enElGolpe: boolean; temperaturaCaliente: number; maximo: number }
const correrElCuadro = (latido: boolean, golpe: boolean, gestos: boolean, scroll: boolean): CorridaDelCuadro => {
  const a = armar(false, false, { current: { camara: CAMARA, ancho: 1440, alto: 900 } }, () => LOGO)
  const m = crearMemoria()
  const f = crearAfuera()
  f.camara = CAMARA
  f.alto = 900
  f.golpe = 0.6
  f.anillos = [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()]
  const r: CorridaDelCuadro = { logos: 0, pulsos: 0, descargas: 0, ionizacionesDelPulso: 0, enElGolpe: false, temperaturaCaliente: 0, maximo: 0 }
  let finAntes = 0
  for (let k = 0; k < 60 * 30; k += 1) {
    const s = k / 60
    f.dt = 1 / 60
    f.ahora = s * 1000
    f.tiempo = s
    f.scroll = scroll && s > 20 && s < 26 ? s * 3000 : 0
    // El pulso principal del logo, cada 2 s (con `latido`).
    f.ultimoPrincipal = latido ? Math.floor(s / 2) * 2 : Number.NEGATIVE_INFINITY
    // El final: el golpe cae a los 28 s.
    f.fin = golpe && s > 27 ? Math.min(1, 0.55 + (s - 27) * 0.1) : 0
    const pt = a.puntero
    if (gestos) {
      pt.x = 0.05
      pt.y = 0.05
      pt.mouse = true
      pt.fuera = false
      // Un clic a los 5 s; apretado de 10 a 11,8 s y soltar.
      if (k === 300) apretar(pt, f.ahora, 700, 450, false)
      if (k === 305) soltar(pt, f.ahora)
      if (k === 600) apretar(pt, f.ahora, 700, 450, false)
      if (k === 708) soltar(pt, f.ahora)
    }
    const logoAntes = a.arcos.contados.logo
    const ionizAntes = a.p.cuenta.ionizaciones
    const pulsoAntes = a.arcos.contados.pulso
    cuadro(a, m, f)
    if (a.arcos.contados.pulso > pulsoAntes) r.ionizacionesDelPulso += a.p.cuenta.ionizaciones - ionizAntes
    if (finAntes < f.golpe && f.fin >= f.golpe && a.arcos.contados.logo > logoAntes) r.enElGolpe = true
    finAntes = f.fin
    if (s > 20 && s < 26) r.temperaturaCaliente = Math.max(r.temperaturaCaliente, a.temperatura.valor)
    r.maximo = Math.max(r.maximo, a.arcos.arcos.filter((x) => x.activo).length)
  }
  r.logos = a.arcos.contados.logo
  r.pulsos = a.arcos.contados.pulso
  r.descargas = a.arcos.contados.descarga
  return r
}
const BASE_DEL_CUADRO = correrElCuadro(false, false, false, false)
const CON_LATIDO = correrElCuadro(true, false, false, false)
const generadorBien = (sin: CorridaDelCuadro, con: CorridaDelCuadro): boolean => con.logos > sin.logos * 1.3 && sin.logos >= 4
afirmar(generadorBien(BASE_DEL_CUADRO, CON_LATIDO), `  el logo es el generador: en 30 s, ${String(BASE_DEL_CUADRO.logos)} arcos suyos; con su pulso latiendo, ${String(CON_LATIDO.logos)} (después del pulso está más activo)`)
controlPositivo('  el detector VE un logo que no late', BASE_DEL_CUADRO, (c: CorridaDelCuadro) => generadorBien(BASE_DEL_CUADRO, c))
const EN_EL_GOLPE = correrElCuadro(false, true, false, false)
afirmar(EN_EL_GOLPE.enElGolpe, '  en el golpe del pie, el logo descarga (un arco suyo en ese cuadro, y el gas se calienta: coherente con la descarga del filo)')
const CON_GESTOS = correrElCuadro(false, false, true, true)
const gestosBien = (c: CorridaDelCuadro): boolean => c.pulsos >= 1 && c.descargas === 1 && c.temperaturaCaliente >= 0.55 && c.maximo <= ARCOS.maximo
afirmar(gestosBien(CON_GESTOS), `  el clic tira ${String(CON_GESTOS.pulsos)} arcos (y ioniza ${String(CON_GESTOS.ionizacionesDelPulso)}); soltar lo cargado, la descarga (${String(CON_GESTOS.descargas)}); con el scroll rápido el gas se calienta (${CON_GESTOS.temperaturaCaliente.toFixed(2)}); nunca más de ${String(ARCOS.maximo)} arcos a la vez`)
controlPositivo('  el detector VE un puntero sin gestos', BASE_DEL_CUADRO, gestosBien)

// EL DIBUJO (en la GPU): las partículas instanciadas con su LOD (las órbitas de cerca, con un fundido), sus estelas alineadas a la
// velocidad, la profundidad de campo barata, de día el grafito con su borde especular y de noche luz; la luz de los arcos; los
// arcos en dos pasadas (de día, la tinta y el núcleo blanco); todo detrás de los textos y por el tono de la escena (ACES compensado).
const VP = VERTICES_DE_LAS_PARTICULAS
const FP = FRAGMENTOS_DE_LAS_PARTICULAS
const dibujoBien = (vp: string, fp: string, fa: string, fe: string): boolean =>
  vp.includes(`smoothstep( ${String(PARTICULAS.lod[0])} * uPixel, ${String(PARTICULAS.lod[1])} * uPixel, radioPx )`) && vp.includes('aVelocidad * ') && vp.includes('abs( distancia - uFoco )') && vp.includes('vLuz = luzDeLosArcos( aLugar );') &&
  fp.includes('if ( vLod > 0.01 ) {') && fp.includes('float lambert = ') && fp.includes('float borde = ') && fp.includes('vec2 hacia = vLocal - LUZ_DIA.xy * 0.42;') &&
  [fp, fa, fe].every((x) => x.includes('vec3 alTono( vec3 c ) {') && x.includes('c = toneMapping( c );') && x.includes('linearToOutputTexel( vec4( c, 1.0 ) )') && x.includes('vTexto')) &&
  fa.includes('float aDia = uCapa < 0.5 ? tinta : blanco;') && fa.includes('resplandor * 0.5 * vResidual') &&
  fe.includes('tipo < 0.5') && fe.includes('El anillo del pulso') && fe.includes('El halo del puntero que se carga')
afirmar(dibujoBien(VP, FP, FRAGMENTOS_DE_LOS_ARCOS, FRAGMENTOS_DE_LOS_EFECTOS), '  el dibujo: LOD con fundido (las órbitas de cerca), estelas por la velocidad, profundidad de campo, de día el grafito con su borde especular, la luz de los arcos, los arcos en dos pasadas (tinta y núcleo blanco), el piso, el logo, el pulso y el halo; detrás de los textos y por el tono ACES compensado de la escena')
controlPositivo('  el detector VE un sombreador sin el tono de la escena', FP.replace('c = toneMapping( c );', ''), (f: string) => dibujoBien(VP, f, FRAGMENTOS_DE_LOS_ARCOS, FRAGMENTOS_DE_LOS_EFECTOS))
// Con movimiento reducido: quietas, sin arcos ni pulsos (el cuadro sale antes de la física, de los arcos y del gesto).
const PLASMA_TSX = ARCHIVOS['PlasmaYCargas.tsx'] ?? ''
const quietoBien = (c: string): boolean => /if \(quieto\) \{\s*cuadroQuieto\(a, memoria\.current\)\s*return\s*\}[\s\S]*const nacidos = cuadro\(a, memoria\.current, f\)/.test(c)
afirmar(quietoBien(PLASMA_TSX) && !/pasoDelGas|programarArcos|avanzar/.test(cuerpo(ARCHIVOS['cuadro.ts'] ?? '', 'cuadroQuieto')), '  con movimiento reducido, quietas y sin arcos ni pulsos')
controlPositivo('  el detector VE el plasma moviéndose con movimiento reducido', PLASMA_TSX.replace(/if \(quieto\) \{\s*cuadroQuieto\(a, memoria\.current\)\s*return\s*\}/, ''), quietoBien)
// Sin reservas por cuadro: las funciones de cada cuadro no crean objetos, arreglos ni funciones (todo vive en búferes fijos; los
// tramos y las partículas suben enteros, sin los rangos de three, que ordenan con un comparador nuevo en cada subida).
const POR_CUADRO: readonly (readonly [string, readonly string[]])[] = [
  ['cuadro.ts', ['cuadro', 'efecto', 'sobreUnTexto']],
  ['fisica/integracion.ts', ['subpaso', 'pasoDelGas']],
  ['fisica/reacciones.ts', ['reacciones', 'soltarEnlace']],
  ['fisica/fisica.ts', ['armarLaGrilla', 'campoEn', 'distanciaAlRayo', 'anilloEn', 'cargaCercana']],
  ['fisica/temperatura.ts', ['calentar', 'pasoDeLaTemperatura']],
  ['especies.ts', ['fundidos', 'ionizar', 'recombinar', 'lugarDeElectron']],
  ['arcos/programador.ts', ['programarArcos', 'lugarLibre', 'encender', 'golpear', 'ionizarElCamino', 'cargaAlAzar', 'alAlcance', 'pulsar', 'descargar']],
  ['arcos/arcos.ts', ['extremo', 'golpeEn', 'residualEn', 'activos', 'lucesDeLosArcos']],
  ['arcos/camino.ts', ['lider', 'detallar', 'camino', 'temblarElCanal', 'rama']],
  ['arcos/bufer.ts', ['tramo', 'llevar', 'rellenarTramos']],
  ['interaccion/interaccion.ts', ['avanzar']],
  ['interaccion/lineasDeCampo.ts', ['seguir', 'trazarLineas']],
  ['render/armado.ts', ['subir']],
]
const RESERVA = /\bnew\s+[A-Z]|=>|(?:[=(,:?]|\breturn)\s*\[|(?:[=(,:?]|\breturn)\s*\{(?!\s*$)|addUpdateRange|\.slice\(|\.map\(|\.filter\(/
const sinReservas = (archivos: Record<string, string | undefined>): string[] => POR_CUADRO.flatMap(([archivo, funciones]) => funciones.filter((fn) => {
  const c = cuerpo(archivos[archivo] ?? '', fn)
  return c === '' || RESERVA.test(c)
}).map((fn) => `${archivo}:${fn}`))
afirmar(sinReservas(ARCHIVOS).length === 0, `  sin reservas por cuadro: ${String(POR_CUADRO.reduce((n, [, f]) => n + f.length, 0))} funciones de cada cuadro sin crear objetos, arreglos ni funciones (los búferes son fijos; la física, en la CPU con la grilla)`, sinReservas(ARCHIVOS).join(' · '))
controlPositivo('  el detector VE un arreglo nuevo en cada cuadro', { ...ARCHIVOS, 'cuadro.ts': (ARCHIVOS['cuadro.ts'] ?? '').replace('  const T = a.temperatura\n', '  const T = a.temperatura\n  const nuevos = [T.valor, T.crudo]\n') }, (a: Record<string, string | undefined>) => sinReservas(a).length === 0)

// LOS EXPERIMENTOS, apagados: `?plasma-campo=si` (las líneas de campo, sólo con el botón apretado) y `?plasma-sonido=si` (la chispa:
// en el sprite, fabricada como los demás, muy baja y sin ametrallar; sólo suena con el sonido prendido, por el bus).
const CUADRO_TS = ARCHIVOS['cuadro.ts'] ?? ''
const experimentosBien = (plasma: string, c: string): boolean =>
  (['plasma-campo', 'plasma-sonido'] as const).every((k) => (PRUEBAS_SUELTAS as readonly string[]).includes(k) && ENTORNO.pruebas[k] === 'no' && entornoPedido(`producto,${k}=si`).pruebas[k] === 'si' && entornoPedido('producto').pruebas[k] === 'no') &&
  'chispa' in CORTES_DEL_SPRITE && SONIDOS.chispa.volumen <= 0.08 && SONIDOS.chispa.separacionMs >= 100 &&
  plasma.includes("if (sonido && nacidos > 0) sonar('chispa')") && c.includes('a.lineas.visible = f.campo ? pt.campo : 0') && c.includes('rellenarTramos(a.arcos, a.g, f.campo ? a.lineas : null, a.bufer)')
afirmar(experimentosBien(PLASMA_TSX, CUADRO_TS), `  los experimentos, apagados en el producto: \`?plasma-campo=si\` (las líneas de campo con el botón apretado) y \`?plasma-sonido=si\` (la chispa: ${String(CORTES_DEL_SPRITE.chispa[1])} ms en el sprite, volumen ${String(SONIDOS.chispa.volumen)}, cada ${String(SONIDOS.chispa.separacionMs)} ms como mucho)`)
controlPositivo('  el detector VE la chispa sonando sin la bandera', PLASMA_TSX.replace("if (sonido && nacidos > 0) sonar('chispa')", "if (nacidos > 0) sonar('chispa')"), (p: string) => experimentosBien(p, CUADRO_TS))

// LO MEDIDO (`n2-plasma.ts`, el banco de producción): en la NVIDIA, a 1440 (el mouse) y a 390 (el dedo), en calma, en la temperatura
// máxima (con scroll rápido, pulsos y carga) y de noche; en color y con las líneas de campo; la base del polvo. Ningún cuadro de más
// de 20 ms; los estados de la hoja capturados (la ionización, el pulso, la carga y la descarga).
interface Cuadros { readonly media: number; readonly maximo: number; readonly mayoresDe20: number }
interface EstadoMedido { readonly especies: Record<string, number>; readonly contados: Record<string, number>; readonly maximoALaVez: number; readonly temperatura: number; readonly carga: number }
interface CorridaMedida { readonly placa: string; readonly calma: Cuadros; readonly maxima: Cuadros; readonly noche: Cuadros; readonly estadoMaxima?: EstadoMedido | null; readonly arcoConIonizacion?: EstadoMedido | null; readonly pulso?: EstadoMedido | null; readonly cargando?: EstadoMedido | null; readonly descarga?: EstadoMedido | null }
const N2 = recibo<{ corridas: Readonly<Record<string, CorridaMedida>> }>('n2-plasma.json').corridas
const sinTironesDelPlasma = (c: Cuadros | undefined): boolean => c !== undefined && c.media <= 16.7 && c.mayoresDe20 === 0
const particulasDe = (e: EstadoMedido | null | undefined): number => (e === null || e === undefined ? 0 : Object.values(e.especies).reduce((a, b) => a + b, 0))
const medidoDelPlasma = (r: Readonly<Record<string, CorridaMedida>>): boolean =>
  ['plasma-1440', 'plasma-390', 'color-1440', 'campo-1440', 'polvo-1440', 'polvo-390'].every((k) => r[k] !== undefined && r[k].placa.includes('NVIDIA') && sinTironesDelPlasma(r[k].calma) && sinTironesDelPlasma(r[k].maxima) && sinTironesDelPlasma(r[k].noche)) &&
  (['1440', '390'] as const).every((w) => {
    const c = r[`plasma-${w}`]
    const [maximo, atomos] = w === '1440' ? [ARCOS.maximo, ESPECIES.atomos.escritorio] : [ARCOS.maximoCompacto, ESPECIES.atomos.compacta]
    return (c.estadoMaxima?.temperatura ?? 0) >= 0.95 && (c.estadoMaxima?.maximoALaVez ?? 99) <= maximo && particulasDe(c.estadoMaxima) >= atomos && (c.arcoConIonizacion ?? null) !== null && (c.pulso?.contados.pulso ?? 0) > 0 && (c.cargando?.carga ?? 0) >= 0.9 && (c.descarga?.contados.descarga ?? 0) > 0
  })
const ms = (k: string): string => (N2[k] === undefined ? 'falta' : `${N2[k].calma.media.toFixed(2)}/${N2[k].maxima.media.toFixed(2)} (máx. ${String(N2[k].maxima.maximo)})`)
afirmar(medidoDelPlasma(N2), `  medido en la NVIDIA (ms por cuadro en calma / en la temperatura máxima con scroll, pulsos y carga): a 1440 ${ms('plasma-1440')}, a 390 ${ms('plasma-390')}, en color ${ms('color-1440')}, con el campo ${ms('campo-1440')}; el polvo ${ms('polvo-1440')}; ningún cuadro de más de 20 ms; capturados el arco que ioniza, el pulso, la carga y la descarga, con el mouse y con el dedo`)
controlPositivo('  el detector VE un cuadro de más de 20 ms', { ...N2, 'plasma-390': { ...N2['plasma-390'], maxima: { ...N2['plasma-390'].maxima, maximo: 22, mayoresDe20: 1 } } }, medidoDelPlasma)
controlPositivo('  y el dedo que no descarga', { ...N2, 'plasma-390': { ...N2['plasma-390'], descarga: null } }, medidoDelPlasma)

cerrar('s67-pulido-16')
