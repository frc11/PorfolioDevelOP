/**
 * AJUSTES FINALES — el invariante: npm run test:s48-ajustes-finales
 *
 * La regla del sprint: cada comportamiento aprobado que se toca queda FIJADO acá (duraciones, recorridos, orden), con su
 * control positivo. Una sección por ticket:
 *   A1 · Portfolio: la llegada de ESCENA 10 (e10) y nada más. Las variantes y su bandera se borraron; la cámara de ese
 *        tramo es la de ESCENA 10 (sólo la cámara) y el título se coloca con la cámara de 0,4718, como entonces. Una
 *        sola transición: la llegada (bajando) y su inversa exacta (subiendo, antes de la sección); pasada la llegada
 *        el estado es «armado» y no cambia más (sin efecto de salida; desde abajo vuelve armado).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/ajustes-finales/mirar.txt`.
 */
import { existsSync, readFileSync } from 'node:fs'


import { PARES_DE_LA_CAMARA, TRAMO_DE_LA_CAMARA, comoEntonces, progresoDeLaCamara } from '../escena/camaraDeEntonces'
import { PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { poseDeLaLectura } from '../escena/titulos3d/colocacion'
import { DISOLVER_GLSL, LLEGADA_NORMAL_GLSL, LLEGADA_PARS_GLSL, LLEGADA_POSICION_GLSL, mostradoDelScroll } from '../escena/titulos3d/llegada'
import { LECTURA, LLEGADA_DE_PORTFOLIO } from '../titulos3d/registro'
import { LENTOS } from '../titulos3d/repeticiones'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · Portfolio: la llegada de ESCENA 10 (e10) y nada más — una sola transición, la llegada y su inversa; después, armado')

// Las variantes y su bandera se fueron: ni archivos, ni tipo, ni `?pruebas=portfolio=`.
const entornoA1 = sinComentarios(leer('_lib/escena/entorno.ts'))
const sinVariantes = (e: string): boolean => !/VARIANTES_DE_PORTFOLIO|VarianteDePortfolio|portfolio:/.test(e) && !('portfolio' in PRUEBAS_APAGADAS) && !('portfolio' in entornoPedido('producto,portfolio=e9').pruebas)
afirmar(sinVariantes(entornoA1) && !existsSync(`${V3}/_lib/titulos3d/variantesDePortfolio.ts`) && !existsSync(`${V3}/_componentes/titulos3d/PortfolioDePrueba.tsx`), 'e9, 3ds y lejos se borraron con su bandera: `?pruebas=portfolio=…` ya no pide nada y los dos archivos de la prueba no existen')
controlPositivo('el detector VE la bandera de antes', `${entornoA1}\nexport const VARIANTES_DE_PORTFOLIO = ['e9'] as const`, sinVariantes)

// La cámara de ESCENA 10 en el tramo de Portfolio, en el producto (era la prueba): la de hoy fuera del tramo, la de
// entonces en cada scroll medido, creciente y continua; y el rig la muestrea siempre con ella.
const PARES = PARES_DE_LA_CAMARA
const siempreLaDeEntonces = (f: (p: number) => number): boolean => Array.from({ length: 201 }, (_, k) => k / 200).every((p) => f(p) === comoEntonces(p))
afirmar(siempreLaDeEntonces(progresoDeLaCamara) && [0, 0.05, 0.125, 0.625, 0.8, 1].every((p) => comoEntonces(p) === p) && TRAMO_DE_LA_CAMARA.desde === 0.125 && TRAMO_DE_LA_CAMARA.hasta === 0.625, 'la cámara del producto es la de ESCENA 10 en Quiénes somos → Trabajos (sin bandera) y la de la tabla de hoy fuera de ese tramo')
controlPositivo('el detector VE la cámara de hoy en todo el recorrido (la de antes de elegir)', (p: number) => p, siempreLaDeEntonces)
afirmar(PARES.every(([h, e]) => Math.abs(comoEntonces(h) - e) < 1e-9), '  en cada scroll medido es la de entonces (los pares de ESCENA 10 contra hoy, a 1440×900)', `${String(PARES.length)} pares`)
const monotona = (f: (p: number) => number): boolean => {
  let previo = f(0)
  for (let p = 0.0005; p <= 1; p += 0.0005) {
    const v = f(p)
    if (!(v > previo) || v - previo > 0.01) return false
    previo = v
  }
  return true
}
afirmar(monotona(comoEntonces), '  y nunca va para atrás ni salta: creciente y continua en todo el recorrido')
controlPositivo('el detector VE una cámara que vuelve atrás', (p: number) => (p > 0.45 && p < 0.46 ? 0.4 : comoEntonces(p)), monotona)
const az = (p: number): number => poseDeLaLectura(p).angleDeg
const barridoHoy = az(0.4713) - az(0.4561)
const barridoEntonces = az(comoEntonces(0.4713)) - az(comoEntonces(0.4561))
afirmar(barridoEntonces > 2 * barridoHoy, '  mientras llegan las letras la cámara gira como entonces (el doble que con la tabla de hoy): eso es lo que las hace venir de lejos', `hoy ${barridoHoy.toFixed(1)}° · entonces ${barridoEntonces.toFixed(1)}°`)
afirmar(/sampleTrack\(track, progresoDeLaCamara\(progress\), target\)/.test(sinComentarios(leer('_lib/escena/OrbitRig.tsx'))) && /return comoEntonces\(p\)/.test(sinComentarios(leer('_lib/escena/camaraDeEntonces.ts'))), '  sólo la cámara: el rig la muestrea con ese progreso siempre (la luz, la noche y el resto siguen al scroll con la tabla de hoy)')

// La colocación de entonces: la cámara de 0,4718; con la cámara de ESCENA 10, cuando la llegada termina (0,4713 de la tabla
// de hoy) la cámara está en 0,4426 y la relación entre las dos es la aprobada (8° de azimut y 1,8 de altura).
const pose = (p: number): { readonly angleDeg: number; readonly height: number } => ({ ...poseDeLaLectura(p) })
const aprobada = { az: pose(0.4718).angleDeg - pose(0.4426).angleDeg, y: pose(0.4718).height - pose(0.4426).height }
const relacion = (lectura: unknown): boolean => {
  if (typeof lectura !== 'number') return false
  const fin = pose(comoEntonces(LLEGADA_DE_PORTFOLIO.termina))
  // La tolerancia es la de la medida: los pares de la cámara van cada 60 px de scroll (~0,004 de progreso, ~1° acá).
  return Math.abs(pose(lectura).angleDeg - fin.angleDeg - aprobada.az) < 1 && Math.abs(pose(lectura).height - fin.height - aprobada.y) < 0.3
}
afirmar(LECTURA.portfolio === 0.4718 && aprobada.az > 5 && aprobada.y > 1 && relacion(LECTURA.portfolio) && Math.abs(comoEntonces(LLEGADA_DE_PORTFOLIO.termina) - 0.4426) < 0.003, 'el título se coloca con la cámara de 0,4718 (la de ESCENA 10, tal cual) y, con la cámara de entonces, al terminar la llegada la cámara está en 0,4426: la relación aprobada (la cámara seguía orbitando 8° de azimut y 1,8 de altura entre terminar de llegar y colocarse)', `Δaz ${aprobada.az.toFixed(2)}° Δy ${aprobada.y.toFixed(2)} · termina en cámara ${comoEntonces(LLEGADA_DE_PORTFOLIO.termina).toFixed(4)}`)
controlPositivo('el detector VE la colocación encima de la llegada (0,4426: de frente, cortas)', 0.4426, relacion)

// El título: `queda` y nada más (sin huida ni salida propia): la huida del cartel es del DOM.
const piezasA1 = sinComentarios(leer('_secciones/trabajos/piezas.tsx'))
const soloQueda = (c: string): boolean => /<ConInercia>\s*<TituloDeVolumen id="portfolio" texto=\{CONTENIDO\.titular\} lectura=\{LECTURA\.portfolio\} llegada=\{progresoDeLaMascara\} salida=\{salidaDelTitulo\} llegadaDe=\{seccion\.id\} minimoS=\{LENTOS\.llegadaDePortfolioS\} queda \/>\s*<\/ConInercia>/.test(c) && !/PortfolioDePrueba|useVarianteDePortfolio|huidaDelTitulo/.test(c) && /salidaDelTitulo\.set\(primeraFotoTapa\(p\) \? 1 : 0\)/.test(c)
afirmar(soloQueda(piezasA1), 'Portfolio es UN título de volumen, que se queda: su `salida` sólo dice si la primera foto del túnel ya lo tapa (1) o no (0); la huida del cartel es del DOM y no lo mueve')
controlPositivo('el detector VE el título que se iba con la huida del cartel (la prueba e10)', piezasA1.replace('salida={salidaDelTitulo}', 'salida={huidaDelTitulo}'), soloQueda)
const escenaA1 = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const sinSalidaPropia = (c: string): boolean => /const tapado = a\.titulo\.salida >= 0\.999/.test(c) && /m\.salida = 0\s*a\.uniforms\.uLlegada\.value = m\.llegada\s*a\.uniforms\.uSalida\.value = 0/.test(c) && /const visible = m\.llegada > 0 && !fuera && !tapado/.test(c)
afirmar(sinSalidaPropia(escenaA1), '  en la escena el que se queda no tiene salida (su uniforme va siempre en 0): tapado se esconde sin moverse y destapado reaparece como estaba')
controlPositivo('el detector VE una salida que anima', escenaA1.replace('a.uniforms.uSalida.value = 0', 'a.uniforms.uSalida.value = m.salida'), sinSalidaPropia)

// La única transición, simulada como la lleva la escena (`alCuadroDelQueQueda`): lo mostrado persigue al progreso de la
// máscara (0 antes, 1 después) con el mínimo de 1,4 s y el asiento de F2. El scroll va en ventanas de la máscara.
const DT = 1 / 60
type Modelo = (mostrado: number, y: number, asentar: boolean) => number
const deProducto: Modelo = (m, y, a) => mostradoDelScroll(m, Math.min(1, Math.max(0, y)), a, DT, LENTOS.llegadaDePortfolioS)
const tramo = (desde: number, hasta: number, cuadros: number): number[] => Array.from({ length: cuadros }, (_, k) => desde + ((hasta - desde) * (k + 1)) / cuadros)
const quieto = (y: number, cuadros: number): number[] => Array.from({ length: cuadros }, () => y)
/** Recorre una trayectoria y devuelve lo mostrado en cada cuadro (asienta con el scroll quieto más de 180 ms). */
const recorrer = (f: Modelo, ys: readonly number[]): number[] => {
  let m = 0
  let quietoDesde = 0
  const salida: number[] = []
  ys.forEach((y, k) => {
    if (k > 0 && y !== ys[k - 1]) quietoDesde = k
    m = f(m, y, (k - quietoDesde) * DT > 0.18)
    salida.push(m)
  })
  return salida
}
// Bajada rápida más allá de la llegada (hasta el túnel), vuelta rápida hasta justo después de la llegada, y otra bajada.
const idaYVuelta = [...tramo(-1, 8, 20), ...quieto(8, 150), ...tramo(8, 1.2, 10), ...quieto(1.2, 60), ...tramo(1.2, 8, 10), ...quieto(8, 60), ...tramo(8, 1.05, 6), ...quieto(1.05, 30)]
const siempreArmadoDespues = (f: Modelo): boolean => {
  const vistos = recorrer(f, idaYVuelta)
  let llego = false
  let previo = 0
  return vistos.every((m, k) => {
    const masAlla = idaYVuelta[k] >= 1
    if (masAlla && m === 1) llego = true
    const bien = !masAlla || (m >= previo - 1e-12 && (!llego || m === 1))
    previo = m
    return bien
  }) && llego
}
afirmar(siempreArmadoDespues(deProducto), 'bajando y subiendo a cualquier velocidad, más allá de la llegada las letras sólo se arman (nunca retroceden) y, armadas, quedan armadas: ni efecto de salida al seguir bajando ni un hueco al volver desde abajo')
// La prueba e10 se iba con la huida del cartel (salida 1→0 al volver desde abajo = las letras «se arman al revés»).
const comoE10: Modelo = (() => {
  let salida = 0
  return (m, y, a) => {
    salida = mostradoDelScroll(salida, Math.min(1, Math.max(0, y - 6)), a, DT, 1.4)
    return mostradoDelScroll(m, Math.min(1, Math.max(0, y)), a, DT, LENTOS.llegadaDePortfolioS) * (1 - salida)
  }
})()
controlPositivo('el detector VE la prueba e10 (al volver desde abajo las letras se rearman desde cero)', comoE10, siempreArmadoDespues)
// La inversa exacta: con un scroll que no le gana al mínimo, lo mostrado es función del scroll, igual a la ida y a la vuelta.
const ida = tramo(-0.2, 1.2, 252)
const lento = [...ida, ...[...ida].reverse()]
const funcionDelScroll = (f: Modelo): boolean => {
  const vistos = recorrer(f, lento)
  return ida.every((_, k) => Math.abs(vistos[ida.length + k] - vistos[ida.length - 1 - k]) < 1e-9) && vistos[ida.length - 1] === 1 && vistos[lento.length - 1] === 0
}
afirmar(funcionDelScroll(deProducto), '  subiendo despacio, cada letra deshace exactamente lo que hizo bajando (el mismo estado en el mismo scroll): la única transición es la llegada y su inversa')
controlPositivo('el detector VE un título que no se desarma al subir', ((m, y, a) => Math.max(m, deProducto(m, y, a))) as Modelo, funcionDelScroll)

cerrar('s48-ajustes-finales')
