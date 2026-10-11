/**
 * PULIDO 16 — el invariante: npm run test:s67-pulido-16
 *
 * Cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en `docs/rediseno/entregas/pulido-16/`;
 * el log, `docs/rediseno/SPRINT-PULIDO-16.md`.
 *   N1 · Nosotros siempre a la vista: los planos de «El equipo» (el título y las dos personas) y de «Nosotros» (el título y la
 *        foto), alejados (más chicos hacia el centro del cuadro) y siguiendo una parte de la órbita del mouse: en todo el
 *        recorrido, la foto, el nombre y la bio de cada uno (y los títulos y la foto del equipo) quedan dentro del cuadro con 24 px
 *        de margen en el peor caso del mouse, a 1024, 1280, 1366, 1440, 1920 y 2560. `?nosotros=fijo`: la otra lectura.
 */
import { readFileSync } from 'node:fs'
import * as THREE from 'three'

import { PLANO_DE_NOSOTROS } from '../../_secciones/quienes-somos/geometria'
import { factorDeLaBanda, fovConFactor } from '../escena/banda'
import { ENTORNO, PRUEBAS_SUELTAS, entornoPedido } from '../escena/entorno'
import { crearDesplazamiento, desplazamientoDelMouse } from '../escena/modulacionDeLaPose'
import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR } from '../escena/probeScene'
import { anotarLaPoseDelCuadro, camaraConParteDelMouse, posarLaCamaraSinElMouse } from '../escena/sinElMouse'
import { cuadrilateroEnElPlano } from '../escena/titulos3d/acompanantes'
import { colocar, lineaDeBase, poseDeLaLectura } from '../escena/titulos3d/colocacion'
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
const N1 = recibo<{ anchos: Readonly<Record<string, AnchoDelRecibo>>; fijo: Readonly<Record<string, AnchoDelRecibo>> }>('n1-nosotros.json')
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
const SEGUIDO = PLANO_DE_NOSOTROS.seguido
afirmar(identidad(N1.anchos, SEGUIDO, SEGUIDO.alejamiento), `  alejado: con el mouse quieto, cada caja se ve ${String(SEGUIDO.alejamiento)} veces más chica hacia el centro del cuadro (el mismo plano, a la profundidad del logo)`)
controlPositivo('  el detector VE un alejamiento que no es el declarado', 0.9, (k: number) => identidad(N1.anchos, { ...SEGUIDO, alejamiento: k }, SEGUIDO.alejamiento))

const delModelo = todosLosAnchos(N1.anchos, SEGUIDO, ANCHOS)
afirmar(conMargen(delModelo), `  en todo el recorrido, con el mouse en el peor caso (las esquinas y los costados), cada foto, nombre y bio (y los títulos y la foto del equipo) entran enteros con ${String(MARGEN)} px de margen (alejado ${String(SEGUIDO.alejamiento)}, el plano sigue ${String(SEGUIDO.parteDelMouse)} de la órbita)`, resumen(delModelo))
const deAntes = todosLosAnchos(N1.anchos, ANTES, ['1920x1080'])
controlPositivo('  el detector VE el corte de antes (a 1920, sin alejar y fijo en el mundo: Valentino y la foto de Franco afuera)', ANTES, (p: Plano) => conMargen(todosLosAnchos(N1.anchos, p, ['1920x1080'])))
afirmar(deAntes['1920x1080'].margen < -150, '  (antes, a 1920: el peor caso se iba más de 150 px de la pantalla)', `${deAntes['1920x1080'].margen.toFixed(0)} px: ${deAntes['1920x1080'].donde}`)
controlPositivo('  el detector VE sólo alejar, sin seguir nada del mouse (hace falta mucho más chico)', { alejamiento: SEGUIDO.alejamiento, parteDelMouse: 0 }, (p: Plano) => conMargen(todosLosAnchos(N1.anchos, p, ANCHOS)))
const FIJO = PLANO_DE_NOSOTROS.fijo
const delFijo = todosLosAnchos(N1.anchos, FIJO, ANCHOS)
afirmar(FIJO.parteDelMouse === 0 && conMargen(delFijo), `  la otra lectura (\`?nosotros=fijo\`): fijo en el mundo y alejado ${String(FIJO.alejamiento)}, también entra con ${String(MARGEN)} px`, resumen(delFijo))
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
afirmar(medidoBien(N1.fijo, ['1920x1080']), '  y con `?nosotros=fijo`, a 1920', N1.fijo['1920x1080'] === undefined ? 'falta' : `${peorMedido('1920x1080', N1.fijo['1920x1080']).margen.toFixed(0)} px`)
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
// mismo plano); lo que entra y sale del cuadro se mide donde se ve; la sección pide los dos planos (o la otra lectura).
const EQUIPO = leer('_secciones/quienes-somos/equipo.tsx')
const TITULOS = leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx')
const ACOMP = leer('_lib/escena/titulos3d/acompanantes.ts')
const RIG = leer('_lib/escena/OrbitRig.tsx')
const COLOC = leer('_lib/escena/titulos3d/colocacion.ts')
const cableado = (equipo: string, titulos: string, acomp: string, rig: string, coloc: string): boolean =>
  /id: 'equipo',[^\n]*queda: false, \.\.\.planoDeNosotros\(\) \}\)/.test(equipo) && /id: 'nosotros',[^\n]*queda: false, \.\.\.planoDeNosotros\(\) \}\)/.test(equipo) &&
  /return entornoDeLaEscena\(\)\.pruebas\.nosotros === 'fijo' \? PLANO_DE_NOSOTROS\.fijo : PLANO_DE_NOSOTROS\.seguido/.test(equipo) &&
  /const deColocar = \(a\.titulo\.parteDelMouse \?\? 0\) > 0 \? camaraConParteDelMouse\(a\.titulo\.parteDelMouse \?\? 0\) : viva/.test(titulos) &&
  titulos.includes('colocarElArmado(a, s.nudo, aspecto, stats, deColocar)') && titulos.includes('ubicar(a, d, deColocar)') &&
  titulos.includes('colocar(a.grupo, viva, a.ahora, a.fuente.data, a.titulo.alejamiento)') && titulos.includes('colocar(a.grupo, nudo, lugar, a.fuente.data, a.titulo.alejamiento)') &&
  /alturaAlejada\(l\.arriba \+ d, l\.alto, k\) > l\.alto \|\| alturaAlejada\(l\.arriba \+ l\.linea \+ d, l\.alto, k\) < 0/.test(titulos) &&
  acomp.includes('colocar(PLANO, camaraConParteDelMouse(t.parteDelMouse ?? 0), AHORA, a.fuente.data, k)') && acomp.includes('colocar(PLANO, camara, lugar, a.fuente.data, t.alejamiento)') &&
  /alturaAlejada\(y, cuadro\.alto, k\) > cuadro\.alto \|\| alturaAlejada\(y \+ alto, cuadro\.alto, k\) < 0/.test(acomp) &&
  /posarLaCamaraSinElMouse\(state\.camera, sinElMouse, [^\n]+\n[^\n]*\n\s*anotarLaPoseDelCuadro\(state\.camera, sinElMouse, desplazamiento, /.test(rig) &&
  /const x = alejamiento \* \(\(2 \* lugar\.izquierda\) \/ lugar\.ancho - 1\)/.test(coloc) && /const mundoPorPx = \(alejamiento \* 2 \* profundidad/.test(coloc)
afirmar(cableado(EQUIPO, TITULOS, ACOMP, RIG, COLOC), '  en el código: los dos títulos piden su plano (`?nosotros=fijo`, la otra lectura); el título y su texto 2D se colocan con la misma cámara (su parte del mouse) y el mismo alejamiento; lo que sale del cuadro, donde se ve; el rig anota la pose de cada cuadro')
controlPositivo('  el detector VE el texto 2D colocado con la cámara sin el mouse y el título con la suya (fuera de su plano)', ACOMP.replace('colocar(PLANO, camaraConParteDelMouse(t.parteDelMouse ?? 0), AHORA, a.fuente.data, k)', 'colocar(PLANO, CAMARA_SIN_EL_MOUSE, AHORA, a.fuente.data, k)'), (c: string) => cableado(EQUIPO, TITULOS, c, RIG, COLOC))
controlPositivo('  y el título que deja el plano de Nosotros (sin alejar)', EQUIPO.replace("id: 'equipo', texto: CONTENIDO.tituloDelEquipo, fuente: 'chivo-400', gesto: 'levanta', llegada: progreso, queda: false, ...planoDeNosotros() })", "id: 'equipo', texto: CONTENIDO.tituloDelEquipo, fuente: 'chivo-400', gesto: 'levanta', llegada: progreso, queda: false })"), (c: string) => cableado(c, TITULOS, ACOMP, RIG, COLOC))
controlPositivo('  y lo que sale del cuadro medido en el DOM (el salto al salir)', ACOMP.replace('alturaAlejada(y, cuadro.alto, k) > cuadro.alto || alturaAlejada(y + alto, cuadro.alto, k) < 0', 'y > cuadro.alto || y + alto < 0'), (c: string) => cableado(EQUIPO, TITULOS, c, RIG, COLOC))
// La bandera: `nosotros=fijo` es su único valor; apagada en el producto.
const banderaBien = (f: typeof entornoPedido): boolean => (PRUEBAS_SUELTAS as readonly string[]).includes('nosotros') && ENTORNO.pruebas.nosotros === 'no' && f('producto').pruebas.nosotros === 'no' && f('producto,nosotros=fijo').pruebas.nosotros === 'fijo' && f('producto,nosotros=seguido').pruebas.nosotros === 'no'
afirmar(banderaBien(entornoPedido), '  `?nosotros=fijo` se pide por su nombre (suelta en la URL), vale sólo `fijo` y en el producto está apagada')
controlPositivo('  el detector VE una bandera que acepta cualquier valor', ((p: string) => { const e = entornoPedido(p); return p.includes('nosotros=') ? { ...e, pruebas: { ...e.pruebas, nosotros: 'fijo' as const } } : e }) as typeof entornoPedido, banderaBien)

cerrar('s67-pulido-16')
