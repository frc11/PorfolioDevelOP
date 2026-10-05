/**
 * AJUSTES FINALES — el invariante: npm run test:s48-ajustes-finales
 *
 * La regla del sprint: cada comportamiento aprobado que se toca queda FIJADO acá (duraciones, recorridos, orden), con su
 * control positivo. Una sección por ticket:
 *   A1 · Portfolio: la llegada de ESCENA 10 (e10) y nada más. Las variantes y su bandera se borraron; la cámara de ese
 *        tramo es la de ESCENA 10 (sólo la cámara) y el título se coloca con la cámara de 0,4718, como entonces. Una
 *        sola transición: la llegada (bajando) y su inversa exacta (subiendo, antes de la sección); pasada la llegada
 *        el estado es «armado» y no cambia más (sin efecto de salida; desde abajo vuelve armado).
 *   A2 · la sombra de los títulos de volumen pasa al producto (sin bandera) y mejora: el borde según la distancia de la
 *        letra al piso (un mapa de cobertura por niveles, calibrado con la penumbra del logo y con tope: sin dientes, sin
 *        sangrado ni grietas), la misma dirección y fuerza que la del logo de día, y de noche cenital:
 *        le quita luz al charco del haz y apenas a la sala. La del logo no se tocó (s47 C3).
 *   A3 · el sonido sin gesto: guardado como prendido, el primer clic, toque o tecla en CUALQUIER parte desbloquea el audio y
 *        arranca todo (el ambiente, en el acto); mientras no hubo gesto el botón muestra «en espera» (las ondas tenues
 *        latiendo despacio), no «activado». Medido en Chrome con el perfil limpio (mirar.txt).
 *   A4 · la carga: la página arranca toda blanca (el velo, en el HTML del servidor, sin bloquear el scroll); con el primer
 *        cuadro de la escena, las fuentes y el titular 3D armado, todo aparece junto en un fundido de 0,8 s; recién
 *        terminado cae el titular del hero con su llegada (y con él la bajada y los CTA, en su plano); a los 4 s el fundido
 *        arranca igual (con el respaldo 2D si el 3D no llegó), también sin JavaScript; con movimiento reducido, corto.
 *        [CIERRE] 1A: abajo de 1024 no espera al titular y el velo siempre se va (s49).
 *   A5 · la cabeza fija de Servicios (abajo de 1024) libre del menú pasa al producto, sin bandera.
 *   A6 · los nanobots macizos y parejos: trazos por longitud de arco (`nanobots/trazos.ts`); el globo como el 🌐, los
 *        engranajes completos, el robot que habla (`robot.ts`) y su flujo que se enciende tramo a tramo (`vida.ts`).
 *   A7 · las demos de Tu panel llegan más despacio (`ventana-de-la-demo`) y la sección es un 12 % más larga; la tabla
 *        declara el alto real (700svh): REGLA DE ALTURAS.
 *   A8 · abajo de 1024 cada demo es el panel de escritorio a escala, como un video: sin puntero, en bucle, con su pausa.
 *   B1 · [CIERRE] 1C: las tres leyes de prueba del túnel (`tunel=constante|tope|largo`) se borraron con su bandera y sus
 *        archivos; el producto quedó con la tabla de siempre, estirada (s49 1C).
 *   B2 · [CIERRE] 2B: Valentino eligió el desenfoque; el contacto como placa pasó al producto (con espesor, desde un punto
 *        del fondo, que se acuesta al irse) y `contactofondo` se borró con el fundido a blanco (s49 2B).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/ajustes-finales/mirar.txt`.
 */
import { existsSync, readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { ESCALON_DE_LAS_ONDAS_S, IconoDelParlante, ONDAS_EN_ESPERA, PULSO_DE_LA_ESPERA } from '../../_chrome/sonido/IconoDelParlante'
import { VeloDeCarga } from '../../_componentes/VeloDeCarga'
import { RESPALDO_2D_CON_ESCENA_MS, RESPALDO_2D_MS } from '../../_componentes/titulos3d/titular2d'
import { RESPIRO_DEL_BUCLE } from '../../_panel-vivo/reproduccion'
import { ANCLA_DE_LA_DEMO, ANCLA_DE_LA_VENTANA_VISIBLE } from '../../_secciones/_contrato/bloqueAnimado'
import { TABLA_DEL_CAOS, arranques } from '../../_secciones/tu-panel/geometria'
import { CARGA, SEGURO_DEL_VELO_MS, abrirLaCarga, cargaLista, estaTodo, hayPrimerCuadro, marcarElPrimerCuadro, suscribirALaCarga } from '../carga'

import { PARES_DE_LA_CAMARA, TRAMO_DE_LA_CAMARA, comoEntonces, progresoDeLaCamara } from '../escena/camaraDeEntonces'
import { PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { APARECE_CON_EL_TITULO, opacidadDelAcompanante } from '../escena/titulos3d/acompanantes'
import { FLOOR_Y } from '../escena/probeScene'
import { SOMBRA_DEL_LOGO } from '../escena/sombra/delLogo'
import { APLICAR_LA_SOMBRA_DE_LOS_TITULOS_GLSL, BASE_EN_TEXELES, CHARCO_CON_LOS_TITULOS_GLSL, DISTANCIA_DEL_LOGO, FONDO_DEL_MAPA, PENUMBRA_DEL_LOGO, SOMBRA_DE_LOS_TITULOS, SOMBRA_DE_LOS_TITULOS_EN_VIVO, SOMBRA_DE_LOS_TITULOS_GLSL, TEXEL_DE_LA_LETRA_GLSL, ajustarLaCamara, crearMapaDeLosTitulos, direccionDeLaLuz, fuerzasDeLaSombra, lodDeLaPenumbra, materialDeLaSombraDelTitulo, penumbraEn } from '../escena/sombra/deLosTitulos'
import { poseDeLaLectura } from '../escena/titulos3d/colocacion'
import { DISOLVER_GLSL, LLEGADA_NORMAL_GLSL, LLEGADA_PARS_GLSL, LLEGADA_POSICION_GLSL, mostradoDelScroll } from '../escena/titulos3d/llegada'
import type { ParDeAnclas } from '../motion/anclas'
import { VERTICE_DEL_ENJAMBRE } from '../nanobots/enjambre'
import { CAPAS_DEL_ROBOT, FLUJO, GLOBO_DE_DIALOGO, PRIMER_TRAMO_EN_EL_RELOJ } from '../nanobots/robot'
import { ENGRANAJES, GLOBO, PUNTOS_DEL_ENJAMBRE, simbolosDelEnjambre } from '../nanobots/simbolos'
import { type Trazo, circulo, disco, rectanguloRedondeado, repartir, trazar } from '../nanobots/trazos'
import { RELOJ_DEL_ROBOT, VIDA_DEL_ROBOT_GLSL, textoEscrito, vidaDelRobot } from '../nanobots/vida'
import { seccionPorId } from '../secciones'
import { LECTURA, LLEGADA_DE_PORTFOLIO } from '../titulos3d/registro'
import { LENTOS } from '../titulos3d/repeticiones'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DE_ESTILO } from './s3-archivos'
import { REGISTRO_POR_NOMBRE } from './s3-registro-de-tokens'
import { LIMITE_DE_LINEAS_DE_CODIGO, lineasDeCodigo } from './s8-largos'
import { valorDeToken } from './s10-css'

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

// ═══════════════════════════════════════════════════════════════════════════
titulo('A2 · La sombra de los títulos, al producto y mejor: el borde según la distancia al piso, sin dientes, coherente con la del logo de día y con el haz de noche')

// Sin bandera: la monta la escena de los títulos y el piso la lee siempre que haya títulos de volumen en esta carga.
const entornoA2 = sinComentarios(leer('_lib/escena/entorno.ts'))
const titulosA2 = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const pisoVivoA2 = sinComentarios(leer('_lib/escena/piso/PisoVivo.tsx'))
const alProducto = (e: string, t: string, pv: string): boolean => !/sombratitulos/.test(e) && !('sombratitulos' in PRUEBAS_APAGADAS) && !('sombratitulos' in entornoPedido('producto,sombratitulos=si').pruebas) && /<group ref=\{raiz\} name="titulos de volumen" \/>\s*<SombraDeLosTitulos armados=\{\(\) => m\.current\.armados\} keyLightRef=\{keyLightRef\} \/>/.test(t) && !/sombratitulos/.test(t) && /const conTitulos = entornoDeLaEscena\(\)\.titulos !== 'no'/.test(pv)
afirmar(alProducto(entornoA2, titulosA2, pisoVivoA2), 'la bandera `sombratitulos` se borró: la sombra se monta con los títulos de volumen y el piso la lee en esta carga si hay títulos (`titulos` no es `no`)')
controlPositivo('el detector VE la sombra detrás de la bandera', titulosA2.replace('<SombraDeLosTitulos armados', "{entornoDeLaEscena().pruebas.sombratitulos === 'si' ? <SombraDeLosTitulos armados"), (t: string) => alProducto(entornoA2, t, pisoVivoA2))

// Coherente con la del logo: la misma fuerza de día y, a la distancia del logo, la MISMA penumbra; después crece con la
// distancia de la letra al piso (el contacto), con tope.
const S2 = SOMBRA_DE_LOS_TITULOS
const penumbraDelLogo = SOMBRA_DEL_LOGO.desenfoque.sigma * Math.sqrt(SOMBRA_DEL_LOGO.desenfoque.pasadas) * ((2 * SOMBRA_DEL_LOGO.radio) / SOMBRA_DEL_LOGO.resolucion)
const comoElLogo = (p: { readonly fuerza: number; readonly penumbra: { readonly tope: number } }): boolean => p.fuerza === SOMBRA_DEL_LOGO.fuerza && Math.abs(penumbraEn(DISTANCIA_DEL_LOGO) - PENUMBRA_DEL_LOGO) / PENUMBRA_DEL_LOGO < 0.05 && Math.abs(p.penumbra.tope - PENUMBRA_DEL_LOGO) / PENUMBRA_DEL_LOGO < 0.05 && Math.abs(PENUMBRA_DEL_LOGO - penumbraDelLogo) < 1e-12 && Math.abs(DISTANCIA_DEL_LOGO + FLOOR_Y * Math.SQRT2) < 1e-12
afirmar(comoElLogo(S2), 'de día oscurece como la del logo (la misma fuerza), a la distancia del logo (su centro al piso, con el sol a 45°) su penumbra es la del logo, y nunca es más blanda que ésa (el tope): las letras se siguen leyendo', `penumbra del logo ${PENUMBRA_DEL_LOGO.toFixed(4)} u a ${DISTANCIA_DEL_LOGO.toFixed(2)} u · la de los títulos ahí ${penumbraEn(DISTANCIA_DEL_LOGO).toFixed(4)} u · tope ${String(S2.penumbra.tope)} u`)
controlPositivo('el detector VE la fuerza de la prueba (0,32: más clara que la del logo)', { ...S2, fuerza: 0.32 }, comoElLogo)
controlPositivo('el detector VE un tope más blando que el logo (0,25: las letras se volvían un manchón)', { ...S2, penumbra: { ...S2.penumbra, tope: 0.25 } }, comoElLogo)
const crece = (f: (d: number) => number): boolean => {
  let previo = f(0)
  for (let d = 0.5; d <= 60; d += 0.5) {
    const v = f(d)
    if (v < previo - 1e-12) return false
    previo = v
  }
  return f(0) === 0 && f(1) > 0 && f(1) < f(2) && f(60) === S2.penumbra.tope && f(60) < 1
}
afirmar(crece(penumbraEn), '  la penumbra crece con la distancia de la letra al piso (una letra que casi toca el piso, nítida; una que flota alto, blanda) y tiene tope: un título alto sigue dibujando sus letras', `tope ${String(S2.penumbra.tope)} u`)
controlPositivo('el detector VE una penumbra que no depende de la distancia', (d: number) => (d > 0 ? 0.12 : 0), crece)
const nivelBien = (lod: (sigma: number) => number): boolean => lod(0) === 0 && lod(BASE_EN_TEXELES) === 0 && lod(4) > 0 && lod(8) > lod(4) && lod(64) === S2.penumbra.hastaLod && lod(1000) === S2.penumbra.hastaLod && Math.abs(lod(Math.hypot(BASE_EN_TEXELES, 8 / Math.sqrt(12))) - 3) < 1e-9
afirmar(nivelBien(lodDeLaPenumbra), '  el nivel del mapa sale de la penumbra pedida: 0 hasta el desenfoque nítido, un nivel por octava de la caja de la mipmap (una caja de 8 texeles es el nivel 3), hasta el tope')
controlPositivo('el detector VE un nivel que no sube', (sigma: number) => (sigma > BASE_EN_TEXELES ? 1 : 0), nivelBien)

// En el piso: dos lecturas (la nítida dice cuánto tapan las letras y a qué distancia están; la del nivel, la cota de
// Chebyshev), con las MISMAS cifras que la cuenta de JS; de día hacia el color del contacto, de noche al charco y a la sala.
const f6 = (x: number): string => x.toFixed(6)
const glslA2 = SOMBRA_DE_LOS_TITULOS_GLSL
const dosLecturas = (g: string): boolean => g.includes(`vec4 ancho = texture2DLodEXT( uMapaDeLosTitulos, uv, ${f6(S2.penumbra.hastaLod)} );`) && g.includes('if ( ancho.b < 0.001 ) return 0.0;') && g.includes('float letras = ancho.a / ancho.b;') && g.includes(`float distancia = ( receptor - letras ) * ${f6(S2.lejos)};`) && g.includes(`float sigma = max( ${f6(BASE_EN_TEXELES)}, min( ${f6(S2.penumbra.tope)}, ${f6(S2.penumbra.porUnidad)} * distancia ) / uTexelDeLosTitulos );`) && g.includes(`float lod = clamp( log2( max( 1.0, faltante / ${f6(1 / Math.sqrt(12))} ) ), 0.0, ${f6(S2.penumbra.hastaLod)} );`) && g.includes('float cobertura = texture2DLodEXT( uMapaDeLosTitulos, uv, lod ).b;') && g.indexOf('vec4 ancho = ') < g.indexOf('float cobertura = ') && !/varianza|Chebyshev/.test(g) && g.includes('return cobertura * smoothstep( 0.0, 0.04, min( alBorde.x, alBorde.y ) );')
afirmar(dosLecturas(glslA2), 'el piso lee el nivel más ancho (si hay letras cerca y a qué profundidad) y con la distancia de ahí al piso elige el nivel, con las mismas cifras que la cuenta de JS; la sombra es la cobertura de las letras en ese nivel (sin cota de varianza: ni sangrado ni grietas)')
controlPositivo('el detector VE la cota de Chebyshev de la primera versión', glslA2.replace('float cobertura = texture2DLodEXT( uMapaDeLosTitulos, uv, lod ).b;', 'vec4 m = texture2DLodEXT( uMapaDeLosTitulos, uv, lod );\n\tfloat varianza = max( m.y - m.x * m.x, 0.000002 );\n\tfloat cobertura = 1.0 - varianza / ( varianza + ( receptor - m.x ) * ( receptor - m.x ) );'), dosLecturas)
const bloquesA2 = sinComentarios(leer('_lib/escena/piso/bloques.ts'))
const diaYNoche = (ap: string, ch: string, bl: string): boolean => ap.includes('mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, sombraDeLosTitulosAca * uFuerzaDeLosTitulos )') && ap.includes(`gl_FragColor.rgb *= 1.0 - sombraDeLosTitulosAca * uNocheDeLosTitulos * ${S2.noche.sala.toFixed(3)};`) && ch === ` * ( 1.0 - sombraDeLosTitulosAca * uNocheDeLosTitulos * ${S2.noche.charco.toFixed(3)} )` && bl.indexOf('${APLICAR_LA_SOMBRA_DE_LOS_TITULOS_GLSL}') < bl.indexOf('charcoDelHaz( vPiso.xz ) * uHaz${conTitulos ? CHARCO_CON_LOS_TITULOS_GLSL') && S2.noche.sala < S2.noche.charco
afirmar(diaYNoche(APLICAR_LA_SOMBRA_DE_LOS_TITULOS_GLSL, CHARCO_CON_LOS_TITULOS_GLSL, bloquesA2), '  de día oscurece hacia el color del contacto (como la del logo); de noche le quita luz al charco del haz (0,8) y apenas a la sala (0,35), así se lee también donde el haz no llega, sin ensuciar', `sala ${String(S2.noche.sala)} · charco ${String(S2.noche.charco)}`)
controlPositivo('el detector VE la noche sólo en el charco (la prueba: donde el haz no llegaba no había sombra)', APLICAR_LA_SOMBRA_DE_LOS_TITULOS_GLSL.replace(/\n\s*gl_FragColor\.rgb \*= 1\.0 - sombraDeLosTitulosAca[^\n]*/, ''), (ap: string) => diaYNoche(ap, CHARCO_CON_LOS_TITULOS_GLSL, bloquesA2))
const fDia = fuerzasDeLaSombra(1, 0)
const fNoche = fuerzasDeLaSombra(1, 1)
const fMedia = fuerzasDeLaSombra(0.5, 0.5)
afirmar(fDia.dia === S2.fuerza && fDia.noche === 0 && fNoche.dia === 0 && fNoche.noche === 1 && Math.abs(fMedia.dia - S2.fuerza * 0.25) < 1e-9 && fMedia.noche === 0.5, '  cuánto: de día con el nivel de la principal y el día que hay; de noche, la noche que hay (sin saltos entre las dos)')
const sol = new THREE.Vector3(-6, 9, 4)
const [deDia, deNoche, entre] = [0, 1, 0.5].map((n) => direccionDeLaLuz(sol, n, new THREE.Vector3()))
afirmar(deDia.distanceTo(sol.clone().normalize()) < 1e-9 && deNoche.distanceTo(new THREE.Vector3(0, 1, 0)) < 1e-9 && entre.y > deDia.y && entre.y < 1, '  desde dónde: el sol de día (la misma dirección que la del logo), desde arriba de noche (el haz es cenital), entre los dos con la noche')

// El mapa: de cobertura (cada letra escribe que tapa y a qué profundidad; lo que no tapa, limpio con alfa 0), flotante
// con mipmaps (el piso elige el nivel), y el desenfoque de los cuatro canales.
const mapaA2 = crearMapaDeLosTitulos()
const desenfoqueA2 = mapaA2.desenfoque.escena.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
const mapaBien = (m: typeof mapaA2): boolean => m.bufer.texture.generateMipmaps && m.bufer.texture.minFilter === THREE.LinearMipmapLinearFilter && m.bufer.texture.type === THREE.FloatType && m.bufer.width === S2.resolucion && !m.desenfoque.bufer.texture.generateMipmaps && m.escena.background === null
afirmar(mapaBien(mapaA2) && TEXEL_DE_LA_LETRA_GLSL === 'gl_FragColor = vec4( vProfundidad, 0.0, 1.0, vProfundidad );' && FONDO_DEL_MAPA.b === 0 && FONDO_DEL_MAPA.r === 1 && /gl_FragColor = m;/.test(desenfoqueA2.material.fragmentShader) && /vec4 m = texture2DLodEXT\( uMapa, vUv, 0\.0 \)/.test(desenfoqueA2.material.fragmentShader), 'el mapa es de cobertura (una letra: tapa en b, su profundidad en r y en a por la cobertura; el fondo, lejos y sin tapar), flotante con mipmaps, y el desenfoque es de los cuatro canales', `${String(S2.resolucion)} texeles`)
controlPositivo('el detector VE el mapa de la prueba (sin mipmaps)', { ...mapaA2, bufer: { ...mapaA2.bufer, texture: { ...mapaA2.bufer.texture, generateMipmaps: false } } } as unknown as typeof mapaA2, mapaBien)
mapaA2.soltar()
const sombraFuente = sinComentarios(leer('_lib/escena/sombra/deLosTitulos.ts'))
const limpioConAlfaCero = (c: string): boolean => /gl\.setClearColor\(FONDO_DEL_MAPA, 0\)\s*gl\.setRenderTarget\(bufer\)\s*gl\.render\(escena, camara\)\s*gl\.setClearColor\(COLOR_DE_ANTES, alfaDeAntes\)/.test(c)
afirmar(limpioConAlfaCero(sombraFuente), '  el mapa se limpia con el fondo y alfa 0 antes de dibujar los títulos (el fondo de una escena de three no sabe de alfa, y un alfa 1 contaría como profundidad de letra), y el lienzo recupera su color de limpieza')
controlPositivo('el detector VE el fondo de la escena de antes (alfa 1)', sombraFuente.replace('gl.setClearColor(FONDO_DEL_MAPA, 0)', 'gl.setClearColor(FONDO_DEL_MAPA, 1)'), limpioConAlfaCero)
const uniformesDelTitulo = { uLlegada: { value: 0.3 }, uSalida: { value: 0 }, uQuieto: { value: 0 }, uLevanta: { value: 0 }, uPieDeLaPalabra: { value: new THREE.Vector2() }, uTrazos: { value: new THREE.Vector4() } }
const deLaSombra = materialDeLaSombraDelTitulo({ pars: LLEGADA_PARS_GLSL, normal: LLEGADA_NORMAL_GLSL, posicion: LLEGADA_POSICION_GLSL }, uniformesDelTitulo)
const conSuLlegada = (mat: THREE.ShaderMaterial, u: Record<string, THREE.IUniform>): boolean => {
  const v = mat.vertexShader
  const orden = [v.indexOf(LLEGADA_PARS_GLSL), v.indexOf('vec3 objectNormal = vec3( normal );'), v.indexOf(LLEGADA_NORMAL_GLSL), v.indexOf('vec3 transformed = vec3( position );'), v.indexOf(LLEGADA_POSICION_GLSL), v.indexOf('vec4 vista = viewMatrix * modelMatrix * vec4( transformed, 1.0 );')]
  return orden.every((k, i) => k >= 0 && (i === 0 || k > orden[i - 1])) && mat.fragmentShader.indexOf(DISOLVER_GLSL) > 0 && mat.fragmentShader.indexOf(DISOLVER_GLSL) < mat.fragmentShader.indexOf(TEXEL_DE_LA_LETRA_GLSL) && mat.uniforms === u && mat.uniforms.uLlegada === u.uLlegada
}
afirmar(conSuLlegada(deLaSombra, uniformesDelTitulo), '  cada letra proyecta donde está: el material del mapa hace la llegada de su título con sus mismos uniformes (en el mismo cuadro) y su tramado, y escribe que tapa (b: 1) y a qué profundidad (r, y a por la cobertura)')
controlPositivo('el detector VE un mapa con las letras quietas (sus propios uniformes)', { ...uniformesDelTitulo }, (u: Record<string, THREE.IUniform>) => conSuLlegada(deLaSombra, u))
deLaSombra.dispose()
const camaraA2 = new THREE.OrthographicCamera()
const camaraSana = (direccion: THREE.Vector3): boolean => {
  const texel = ajustarLaCamara(camaraA2, new THREE.Sphere(new THREE.Vector3(2, 6, -3), 4), direccion)
  return camaraA2.matrixWorld.elements.every(Number.isFinite) && Math.abs(camaraA2.right - 4 * S2.margen) < 1e-9 && Math.abs(texel - (2 * 4 * S2.margen) / S2.resolucion) < 1e-12 && camaraA2.position.distanceTo(new THREE.Vector3(2, 6, -3).addScaledVector(direccion, S2.lejos / 2)) < 1e-9 && Math.abs(camaraA2.up.dot(direccion)) < 1e-6
}
afirmar(camaraSana(deDia) && camaraSana(deNoche), '  la cámara de la luz abraza a los títulos (con aire) desde su luz y dice cuánto mundo es un texel (lo que el piso necesita para la penumbra); de noche mira derecho hacia abajo sin quedar indefinida')
const copiaA2 = sinComentarios(leer('_lib/escena/titulos3d/SombraDeLosTitulos.tsx'))
afirmar(/c\.copia\.matrixWorld\.copy\(a\.malla\.matrixWorld\)/.test(copiaA2) && /c\.copia\.visible = a\.malla\.visible/.test(copiaA2) && /s\.texel = ajustarLaCamara\(mapa\.camara, s\.esfera, direccionDeLaLuz\(principal\.position, VIVO\.uNocheDelLogo\.value, s\.direccion\)\)\s*u\.uTexelDeLosTitulos\.value = s\.texel/.test(copiaA2) && 'uTexelDeLosTitulos' in SOMBRA_DE_LOS_TITULOS_EN_VIVO, '  una copia por título armado (su geometría, su llegada, su matriz y si se ve, en cada cuadro), y el texel del cuadro va al piso; sin luz o sin títulos a la vista, no se dibuja')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · El sonido sin gesto: el primer clic, toque o tecla en cualquier parte arranca todo; mientras tanto, «en espera» honesto')

// El botón: prendido y esperando la primera acción, las ondas tenues laten (entre lo tenue y un poco más, sin parar);
// sonando, enteras; apagado, cortadas. Con movimiento reducido no late. Lo que sale del servidor sigue siendo lo tenue.
const iconoA3 = (prendido: boolean, suena: boolean, reducido: boolean): string => renderToStaticMarkup(<IconoDelParlante prendido={prendido} suena={suena} reducido={reducido} />)
const ondasDe = (html: string): number[] => Array.from(html.matchAll(/<path data-parte="onda"[^>]*opacity="([\d.]+)"/g), (m) => Number(m[1]))
afirmar(ondasDe(iconoA3(true, false, false)).every((o) => o === ONDAS_EN_ESPERA) && ondasDe(iconoA3(true, true, false)).every((o) => o === 1) && ondasDe(iconoA3(false, false, false)).every((o) => o === 0), 'en espera las ondas salen tenues (lo que se ve es lo real, también en el HTML del servidor); sonando, enteras; apagado, cortadas', `en espera ${String(ONDAS_EN_ESPERA)}`)
const iconoFuente = sinComentarios(leer('_chrome/sonido/IconoDelParlante.tsx'))
const late = (c: string): boolean => /const espera = prendido && !suena && !reducido/.test(c) && /opacity: espera \? \[ONDAS_EN_ESPERA, PULSO_DE_LA_ESPERA\.hasta, ONDAS_EN_ESPERA\] : visible/.test(c) && /const LATIDO = \{ duration: PULSO_DE_LA_ESPERA\.s, repeat: Infinity, ease: 'easeInOut' \} as const/.test(c) && /const transicion = espera \? \{ \.\.\.TRAZO_DEL_ICONO, delay: demora, opacity: LATIDO \} : \{ \.\.\.TRAZO_DEL_ICONO, delay: demora \}/.test(c) && /transition: reducido \? \{ duration: 0 \} : transicion/.test(c)
afirmar(late(iconoFuente) && PULSO_DE_LA_ESPERA.hasta > ONDAS_EN_ESPERA && PULSO_DE_LA_ESPERA.hasta < 1 && PULSO_DE_LA_ESPERA.s >= 1.2 && PULSO_DE_LA_ESPERA.s <= 2.5 && ESCALON_DE_LAS_ONDAS_S === 0.08, '  y en espera laten: la opacidad va y vuelve entre lo tenue y un poco más (nunca a «activado»), despacio y sin parar; con movimiento reducido, quietas', `${String(ONDAS_EN_ESPERA)} ↔ ${String(PULSO_DE_LA_ESPERA.hasta)} cada ${String(PULSO_DE_LA_ESPERA.s)} s`)
controlPositivo('el detector VE las ondas en espera quietas (la pasada final)', iconoFuente.replace('opacity: espera ? [ONDAS_EN_ESPERA, PULSO_DE_LA_ESPERA.hasta, ONDAS_EN_ESPERA] : visible', 'opacity: visible'), late)
// El control: cualquier parte de la página (la ventana, en captura) carga el motor con la primera interacción y lo despierta
// con cada gesto de verdad; y apenas el motor queda listo, el ambiente arranca en el acto (no espera el reintento).
const controlA3 = sinComentarios(leer('_chrome/sonido/ControlDelSonido.tsx'))
const arrancaTodo = (c: string): boolean => ["window.addEventListener('pointerdown', cargar, true)", "window.addEventListener('keydown', cargar, true)", "window.addEventListener('touchstart', cargar, true)", "window.addEventListener('wheel', cargar, true)", "window.addEventListener('pointerdown', despertar, true)", "window.addEventListener('keydown', despertar, true)", "window.addEventListener('touchend', despertar, true)"].every((l) => c.includes(l)) && /const soltarElMotor = suscribirAlMotor\(\(\) => \{\s*if \(estadoDelMotor\(\) === 'listo'\) ambiente\(\)\s*\}\)/.test(c) && /soltarElMotor\(\)\s*window\.clearInterval\(reintento\)/.test(c)
afirmar(arrancaTodo(controlA3), 'guardado como prendido: la primera interacción en CUALQUIER parte (la ventana, en captura) carga el motor, cada clic, toque o tecla lo despierta, y apenas está listo el ambiente arranca en el acto (medido en Chrome con perfil limpio: la rueda carga pero no desbloquea; el primer clic o tecla, sí)')
controlPositivo('el detector VE el ambiente que espera al reintento de cada segundo', controlA3.replace("if (estadoDelMotor() === 'listo') ambiente()", ''), arrancaTodo)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · La carga: toda blanca, todo junto con un fundido cuando está todo, y recién después cae el titular')

// El velo sale del servidor opaco (en espera), encima de todo y sin recibir el puntero.
const veloHtml = renderToStaticMarkup(<VeloDeCarga />)
const claseDelVelo = /class="([^"]*)"/.exec(veloHtml)?.[1] ?? ''
const velaDesdeElServidor = (html: string, clase: string): boolean => html.includes('<div data-pieza="velo-de-carga" data-velo="espera" aria-hidden="true"') && /<noscript><style>\[data-v3\] \[data-pieza='velo-de-carga'\] \{ display: none; \}<\/style><\/noscript>/.test(html) && clase.split(' ').includes('fixed') && clase.split(' ').includes('inset-0') && clase.split(' ').includes('pointer-events-none') && clase.split(' ').includes('bg-fondo') && new RegExp(`(^| )z-\\[var\\(--z-${'overlay'}\\)\\]( |$)`).test(clase)
afirmar(velaDesdeElServidor(veloHtml, claseDelVelo), 'el velo viaja en el HTML del servidor, en espera: del color de fondo, fijo sobre el cuadro entero, por encima de todo y sin recibir el puntero (no bloquea el scroll ni un cuadro); sin JavaScript, `<noscript>` lo saca')
controlPositivo('el detector VE un velo que atrapa el puntero', [veloHtml, claseDelVelo.replace('pointer-events-none', 'pointer-events-auto')] as const, ([h, c]: readonly [string, string]) => velaDesdeElServidor(h, c))
const paginaA4 = sinComentarios(readFileSync(`${V3}/page.tsx`, 'utf8').replace(/\r\n/g, '\n'))
afirmar(paginaA4.indexOf('<VeloDeCarga />') > 0 && paginaA4.indexOf('<VeloDeCarga />') < paginaA4.indexOf('<ChromeDelHome />'), '  lo monta la página de /v3, antes que el chrome')
// La hoja: el seguro sin JavaScript (a los 4 s se funde sola), el fundido ya cuando el hook lo pide, y corto con movimiento reducido.
const hojaA4 = leer('_estilos/carga.css')
const seguroSinJs = (h: string): boolean => /\[data-v3\] \[data-pieza='velo-de-carga'\] \{\s*--velo-fundido: (\d+)ms;\s*--velo-espera: (\d+)ms;\s*opacity: 1;/.test(h) && /\[data-velo='espera'\] \{\s*animation: velo-de-carga-sale var\(--velo-fundido\) var\(--ease-salida\) var\(--velo-espera\) both;/.test(h) && /\[data-velo='saliendo'\] \{\s*animation: velo-de-carga-sale-ya var\(--velo-fundido\) var\(--ease-salida\) both;/.test(h) && /@keyframes velo-de-carga-sale \{\s*to \{\s*opacity: 0;/.test(h) && /@keyframes velo-de-carga-sale-ya \{\s*to \{\s*opacity: 0;/.test(h) && /@media \(prefers-reduced-motion: reduce\) \{\s*\[data-v3\] \[data-pieza='velo-de-carga'\]\[data-velo='espera'\] \{\s*animation-timing-function: step-end;\s*animation-delay: var\(--velo-espera\) !important;/.test(h)
const [fundidoDeLaHoja, esperaDeLaHoja] = [Number(/--velo-fundido: (\d+)ms/.exec(hojaA4)?.[1]), Number(/--velo-espera: (\d+)ms/.exec(hojaA4)?.[1])]
const politicaReducida = leer('../globals.css')
afirmar(seguroSinJs(hojaA4) && fundidoDeLaHoja === CARGA.fundidoMs && esperaDeLaHoja === CARGA.plazoMs && CARGA.fundidoMs === 800 && CARGA.plazoMs === 4000 && CARGA.margenMs > 0 && CARGA.margenMs < CARGA.fundidoMs && /prefers-reduced-motion: reduce[\s\S]*animation-duration: 1ms !important/.test(politicaReducida), 'la hoja lleva el seguro sin hidratar (en espera se funde sola a los 4 s, con el mismo fundido de 0,8 s) y el fundido ya cuando el hook lo pide: los mismos números que el hook; con movimiento reducido la espera es un corte a los 4 s (la política del sitio corta toda animación a 1 ms y le saca la espera: el velo quedaría destapado antes de tiempo, medido; [CIERRE] 1A: antes no se animaba y, sin hidratar, quedaba opaco para siempre) y la salida es de golpe', `${String(CARGA.fundidoMs)} ms · plazo ${String(CARGA.plazoMs)} ms · margen ${String(CARGA.margenMs)} ms`)
controlPositivo('el detector VE la hoja sin el seguro sin JS', hojaA4.replace(/animation: velo-de-carga-sale var[^;]*;/, ''), seguroSinJs)
afirmar(ARCHIVOS_DE_ESTILO.includes(`${V3}/_estilos/carga.css`) && /import '\.\/_estilos\/carga\.css'/.test(leer('layout.tsx')) && REGISTRO_POR_NOMBRE.get('--velo-fundido')?.valor === `${String(CARGA.fundidoMs)}ms` && REGISTRO_POR_NOMBRE.get('--velo-espera')?.valor === `${String(CARGA.plazoMs)}ms`, '  la hoja entra por el layout (cómo se importa), está en el padrón de s3 y sus dos propiedades de componente están registradas con esos números')
// Qué espera: las fuentes, el primer cuadro de la escena (o la escena caída) y el titular del hero armado si está anotado; o el plazo.
const veloFuente = sinComentarios(leer('_componentes/VeloDeCarga.tsx'))
const esperaTodo = (c: string): boolean => /const todo = estaTodo\(\{ fuentes, primerCuadro, caida, escritorio, conTitular, titularListo: titular1 && titular2 \}\)/.test(c) && /const escritorio = useAnchoMinimo\(CONSULTA_ESCENARIO\)/.test(c) && /if \(etapa === 'espera' && todo && performance\.now\(\) < CARGA\.plazoMs\) setEtapa\('saliendo'\)/.test(c) && /window\.setTimeout\(terminar, Math\.max\(0, SEGURO_DEL_VELO_MS - performance\.now\(\)\)\)/.test(c) && /void document\.fonts\.ready\.then/.test(c) && /TITULOS_DE_VOLUMEN\.has\(IDS_DEL_TITULAR_DEL_HERO\[0\]\)/.test(c) && /const terminar = useCallback\(\(\): void => \{\s*abrirLaCarga\(\)\s*setEtapa\('fuera'\)/.test(c) && /if \(e\.animationName\.startsWith\('velo-de-carga-sale'\)\) terminar\(\)/.test(c) && /onAnimationEnd=\{alTerminarLaAnimacion\}/.test(c)
// [CIERRE] 1A · la regla de qué se espera vive en `estaTodo` (`_lib/carga.ts`): desde 1024 el titular anotado se sigue esperando.
const todoA4 = { fuentes: true, primerCuadro: true, caida: false, escritorio: true, conTitular: true, titularListo: false }
afirmar(esperaTodo(veloFuente) && !estaTodo(todoA4) && estaTodo({ ...todoA4, titularListo: true }) && estaTodo({ ...todoA4, conTitular: false }) && !estaTodo({ ...todoA4, titularListo: true, fuentes: false }) && !estaTodo({ ...todoA4, titularListo: true, primerCuadro: false }) && estaTodo({ ...todoA4, titularListo: true, primerCuadro: false, caida: true }) && SEGURO_DEL_VELO_MS === CARGA.plazoMs + CARGA.fundidoMs + CARGA.margenMs, '  el fundido arranca cuando están las fuentes, el primer cuadro de la escena (o la escena se cayó) y, desde 1025, si el titular del hero está anotado como título de volumen, sus dos registros armados; o al vencer el plazo. Si el DOM se entera después del plazo, deja terminar el fundido de la hoja (no lo reinicia: era un destello blanco con CPU ×4). El fin de la animación es lo que desmonta el velo y abre la carga, y el seguro sin condiciones lo saca igual ([CIERRE] 1A)')
controlPositivo('el detector VE un velo que no espera al titular', veloFuente.replace('titularListo: titular1 && titular2', 'titularListo: true'), esperaTodo)
controlPositivo('el detector VE el velo que reiniciaba el fundido aunque la hoja ya lo estuviera fundiendo', veloFuente.replace("performance.now() < CARGA.plazoMs) setEtapa('saliendo')", "true) setEtapa('saliendo')"), esperaTodo)
const titular2dFuente = sinComentarios(leer('_componentes/titulos3d/titular2d.ts'))
const vencidoQueda = (c: string): boolean => /let plazoVencido = false/.test(c) && /useState\(\(\) => plazoVencido\)/.test(c) && /const vencer = \(\): void => \{\s*plazoVencido = true\s*setVencido\(true\)\s*\}\s*if \(plazoVencido\) \{\s*vencer\(\)\s*return undefined\s*\}/.test(c)
afirmar(vencidoQueda(titular2dFuente), '  el plazo del respaldo 2D, vencido, queda vencido para toda la carga: al remontarse el `h1` (llega la coreografía) el respaldo no desaparece un segundo (medido con CPU ×4)')
controlPositivo('el detector VE el respaldo que volvía a `oculto` al remontarse', titular2dFuente.replace('if (plazoVencido) {', 'if (false) {'), vencidoQueda)
// Los bits: el primer cuadro lo marca el motor de la escena (cuando ya se pintó); la carga se abre una vez; los oyentes se enteran.
let avisosA4 = 0
const soltarA4 = suscribirALaCarga(() => {
  avisosA4 += 1
})
const antesA4 = { cuadro: hayPrimerCuadro(), lista: cargaLista() }
marcarElPrimerCuadro()
marcarElPrimerCuadro()
abrirLaCarga()
abrirLaCarga()
soltarA4()
afirmar(!antesA4.cuadro && !antesA4.lista && hayPrimerCuadro() && cargaLista() && avisosA4 === 2, '  los dos bits (el primer cuadro, la carga abierta) arrancan apagados, se prenden una vez y avisan una vez cada uno')
const precompilarA4 = sinComentarios(leer('_lib/escena/gpu/Precompilar.tsx'))
afirmar(/if \(!e\.primerCuadro\) \{\s*e\.primerCuadro = true\s*requestAnimationFrame\(marcarElPrimerCuadro\)\s*\}/.test(precompilarA4) && precompilarA4.indexOf('if (!e.primerCuadro)') < precompilarA4.indexOf('if (e.hecho) return'), '  el motor de la escena marca el primer cuadro en su primer paso del lazo, cuando ese cuadro ya se pintó (el siguiente)')
// Recién abierta la carga cae el titular del hero, y con él la bajada y los CTA (en su plano): aparecen con sus letras.
const escenaA4 = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
const esperaLaCarga = (c: string): boolean => /else if \(!fuera && !tapado\) m\.llegada = persigue\(m\.llegada, cargaLista\(\) \? a\.titulo\.llegada : 0, dt, a\.titulo\.minimoS \?\? undefined\)/.test(c)
afirmar(esperaLaCarga(escenaA4), '  el título que llega una vez por carga (el hero) no arranca hasta que la carga se abre: hasta ahí lo pedido es 0 (nada se dibuja)')
controlPositivo('el detector VE el hero que caía apenas armado (la pasada final)', escenaA4.replace('cargaLista() ? a.titulo.llegada : 0', 'a.titulo.llegada'), esperaLaCarga)
const acompA4 = sinComentarios(leer('_lib/escena/titulos3d/acompanantes.ts'))
const delDom = sinComentarios(leer('_lib/titulos3d/acompanantes.ts'))
const titularA4 = { rearma: false } as unknown as Parameters<typeof opacidadDelAcompanante>[0]
const otroA4 = { rearma: true } as unknown as Parameters<typeof opacidadDelAcompanante>[0]
afirmar(opacidadDelAcompanante(titularA4, 0) === '0.000' && opacidadDelAcompanante(titularA4, APARECE_CON_EL_TITULO / 2) === '0.500' && opacidadDelAcompanante(titularA4, APARECE_CON_EL_TITULO) === '1.000' && opacidadDelAcompanante(titularA4, 1) === '1.000' && opacidadDelAcompanante(otroA4, 0) === '' && APARECE_CON_EL_TITULO > 0.35 && APARECE_CON_EL_TITULO < 1, '  la bajada y los CTA (los acompañantes del hero) aparecen con las letras que caen: su opacidad sigue a la llegada mostrada hasta el 60 %; los acompañantes de los demás títulos no cambian', `hasta ${String(APARECE_CON_EL_TITULO)}`)
afirmar(/const opacidad = a === undefined \? '' : opacidadDelAcompanante\(a\.titulo, a\.mostrado\.llegada\)\s*if \(opacidad !== ac\.opacidad\) \{\s*ac\.opacidad = opacidad\s*el\.style\.opacity = opacidad\s*\}/.test(acompA4) && /el\.style\.opacity = ''/.test(delDom), '  la escena la escribe en cada cuadro (sólo si cambió) y al soltarse el acompañante vuelve a la suya')
afirmar(RESPALDO_2D_CON_ESCENA_MS === CARGA.plazoMs && RESPALDO_2D_MS < CARGA.plazoMs, '  el respaldo 2D del titular con la escena montada comparte el plazo del velo: si el 3D no llegó, el 2D aparece con el fundido del velo (sin lienzo, a los 2,5 s como antes)', `${String(RESPALDO_2D_CON_ESCENA_MS)} ms`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A5 · La cabeza de Servicios libre del menú (abajo de 1024), al producto')

const angostoA5 = sinComentarios(leer('_secciones/servicios/angosto.tsx'))
const entornoA5 = sinComentarios(leer('_lib/escena/entorno.ts'))
const cabezaLibreSiempre = (a: string, e: string): boolean =>
  !/useCabezaLibre|pruebas\.cabeza|useSyncExternalStore/.test(a) &&
  /px-\[var\(--pad-lateral-compacto\)\] pt-\[calc\(var\(--spacing-6\)\+var\(--spacing-3\)\*2\+var\(--text-cuerpo\)\*var\(--leading-texto\)\+var\(--spacing-2\)\)\] pb-\[var\(--spacing-4\)\] escritorio:hidden/.test(a) &&
  !/cabeza/.test(e) && !('cabeza' in PRUEBAS_APAGADAS) && !('cabeza' in entornoPedido('producto,cabeza=libre').pruebas)
afirmar(cabezaLibreSiempre(angostoA5, entornoA5), 'la cabeza deja arriba el reposo y el alto de la barra (sus mismos tokens: 24 + 48) y aire, siempre: la bandera `cabeza=libre` se borró (medido en PASADA FINAL D10: a 390 el botón del menú tapaba «…PROBLEMAS» y a 1000 la pastilla tapaba el antetítulo y Contacto / Login al gráfico)')
controlPositivo('el detector VE la cabeza de antes (el relleno parejo)', [angostoA5.replace('pt-[calc(var(--spacing-6)+var(--spacing-3)*2+var(--text-cuerpo)*var(--leading-texto)+var(--spacing-2))] pb-[var(--spacing-4)]', 'py-[var(--spacing-4)]'), entornoA5] as const, ([a, e]: readonly [string, string]) => cabezaLibreSiempre(a, e))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A6 · Los nanobots macizos y parejos: trazos por longitud de arco; el globo como el 🌐, los engranajes completos, el robot que habla y su flujo que se enciende')

type PuntoA6 = [number, number, number, number]
const puntosA6 = (d: Float32Array): PuntoA6[] => Array.from({ length: d.length / 4 }, (_, i) => [d[4 * i], d[4 * i + 1], d[4 * i + 2], d[4 * i + 3]])
const [, globoA6, engranajesA6, robotA6] = simbolosDelEnjambre(PUNTOS_DEL_ENJAMBRE.ancho).map(puntosA6)
const sombreadorA6 = VERTICE_DEL_ENJAMBRE

// El trazo: los nanobots van a paso constante por el LARGO de cada trazo (no por su parámetro), y un símbolo da exactamente n.
const trazosDePrueba: Trazo[] = [{ vertices: rectanguloRedondeado(0, 0, 0.5, 0.3, 0.1), w: 0, cerrado: true }, { vertices: circulo(0.8, 0.8, 0.2), w: 1, cerrado: true }, { vertices: [[-1, -1], [1, -1]], w: 2 }]
const pasoConstante = (f: typeof trazar): boolean => {
  const ps = f(trazosDePrueba, 500, 0, () => 0.5)
  const pasos = ps.slice(1).map((p, i): [number, boolean] => [Math.hypot(p[0] - ps[i][0], p[1] - ps[i][1]), p[3] === ps[i][3]]).filter(([, mismo]) => mismo).map(([d]) => d)
  const mediana = [...pasos].sort((a, b) => a - b)[Math.floor(pasos.length / 2)]
  return ps.length === 500 && pasos.every((d) => Math.abs(d - mediana) < mediana * 0.05)
}
const discoParejo = (ps: readonly PuntoA6[]): boolean => {
  const adentro = (r: number): number => ps.filter((p) => Math.hypot(p[0], p[1]) < r).length / ps.length
  return ps.length === 400 && Math.abs(adentro(0.5) - 0.25) < 0.03 && Math.abs(adentro(Math.SQRT1_2) - 0.5) < 0.03
}
afirmar(pasoConstante(trazar) && discoParejo(disco(0, 0, 1, 400, 0)) && repartir(10, [1, 1, 1]).reduce((s, x) => s + x, 0) === 10, 'los nanobots van sobre cada trazo a PASO CONSTANTE por longitud de arco (el mismo paso en todos los trazos de un símbolo: el mismo grosor de línea), las superficies se llenan parejas (el girasol: la mitad de los nanobots en la mitad del área) y un símbolo da exactamente n')
controlPositivo('el detector VE un trazo muestreado al azar (el de antes)', ((trazos, n, espesor, azar) => trazar(trazos, n, espesor, azar).map((p, i): PuntoA6 => [p[0] + (((i * 7919) % 13) / 13 - 0.5) * 0.06, p[1], p[2], p[3]])) as typeof trazar, pasoConstante)
controlPositivo('  y VE una superficie llena por radio al azar (densa en el centro)', Array.from({ length: 400 }, (_, i): PuntoA6 => [(i / 400) * Math.cos(i), (i / 400) * Math.sin(i), 0, 0]), discoParejo)
const parejo = (ps: readonly PuntoA6[], trazos: number, en3d = false): boolean => {
  const d = ps.slice(1).map((p, i) => Math.hypot(p[0] - ps[i][0], p[1] - ps[i][1], en3d ? p[2] - ps[i][2] : 0))
  const mediana = [...d].sort((a, b) => a - b)[Math.floor(d.length / 2)]
  // Un salto por cambio de trazo, no más; y lo demás, al paso (±20 %).
  return d.filter((x) => x > mediana * 2).length <= trazos && d.filter((x) => Math.abs(x - mediana) < mediana * 0.2).length / d.length > 0.97
}
const soloTrazos = robotA6.filter((p) => p[3] >= 1 && !(p[3] >= 3 && p[3] < 4 && (p[3] - 3) * 10 - Math.floor((p[3] - 3) * 10 + 0.001) > 0.25))
afirmar(parejo(engranajesA6, 2 * 3 + ENGRANAJES.a.rayos + ENGRANAJES.b.rayos) && parejo(soloTrazos, 2 + 3 + 5 + 5) && parejo(globoA6, GLOBO.meridianos + GLOBO.paralelos.length + 1, true), 'y así salen los tres símbolos de líneas (los engranajes, el robot con su globo y su flujo, el globo): el paso entre nanobots consecutivos es el mismo en el 97 % de los pares, salvo un salto por trazo')

// El globo, como el 🌐: la red simétrica sobre la esfera y el aro de la silueta aparte, que no gira.
const redA6 = globoA6.filter((p) => p[3] < 0.5)
const aroA6 = globoA6.filter((p) => p[3] > 0.5)
const hayCerca = (q: PuntoA6): boolean => redA6.some((p) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 0.02)
const simetrico = redA6.every((p) => hayCerca([-p[0], p[1], p[2], 0]) && hayCerca([p[0], -p[1], p[2], 0]) && hayCerca([-p[0], p[1], -p[2], 0]))
const aroDondeLaMiradaToca = (aro: { readonly z: number; readonly radio: number }): boolean => Math.abs(aro.z - GLOBO.radio ** 2 / GLOBO.mirada) < 1e-9 && Math.abs(aro.radio - GLOBO.radio * Math.sqrt(1 - (GLOBO.radio / GLOBO.mirada) ** 2)) < 1e-9
afirmar(GLOBO.meridianos === 4 && GLOBO.paralelos.join() === '-45,0,45' && simetrico && aroA6.length > 0 && aroA6.every((p) => Math.abs(Math.hypot(p[0], p[1]) - GLOBO.aro.radio) < 1e-3 && Math.abs(p[2] - GLOBO.aro.z) < 1e-6) && aroDondeLaMiradaToca(GLOBO.aro) && GLOBO.mirada === 3 && sombreadorA6.includes('float cerca = 3.0 / ( 3.0 - p.z );') && sombreadorA6.includes('if ( d.w < 0.5 ) {\n\t\t\tp.xz = girar( p.xz, t * 0.35 );'), 'web: el globo como el 🌐 — cuatro meridianos (cada 45°), el ecuador y dos paralelos (±45°), simétrico de izquierda a derecha, de arriba abajo y al girar media vuelta; y el aro de la silueta aparte (w 1), que no gira y está donde la mirada toca la esfera (en perspectiva, con la mirada a 3 del centro: coincide con la red)', `${String(redA6.length)} en la red · ${String(aroA6.length)} en el aro`)
controlPositivo('el detector VE un aro en el ecuador (que en perspectiva queda adentro de la red)', { z: 0, radio: GLOBO.radio }, aroDondeLaMiradaToca)

// Los engranajes, completos: el contorno dentado, la llanta, el cubo y los rayos, cada nanobot en el suyo.
const completos = ([ENGRANAJES.a, ENGRANAJES.b] as const).every((g, k) => {
  const mios = engranajesA6.filter((p) => (p[3] < 0.5) === (k === 0))
  const polar = mios.map((p) => ({ r: Math.hypot(p[0] - g.centro[0], p[1] - g.centro[1]), a: Math.atan2(p[1] - g.centro[1], p[0] - g.centro[0]) }))
  const en = (radio: number): number => polar.filter(({ r }) => Math.abs(r - radio) < 0.012).length
  const llanta = g.pie * ENGRANAJES.llanta
  const rayos = polar.filter(({ r }) => r > g.cubo + 0.02 && r < llanta - 0.02)
  const sobreUnRayo = rayos.every(({ a }) => Array.from({ length: g.rayos }, (_, i) => g.fase + (i / g.rayos) * 2 * Math.PI).some((ar) => Math.abs(Math.atan2(Math.sin(a - ar), Math.cos(a - ar))) < 0.02))
  const puntas = Array.from({ length: g.dientes }, (_, i) => g.fase + ((i + 0.25) * 2 * Math.PI) / g.dientes).every((ad) => polar.some(({ r, a }) => Math.abs(r - g.punta) < 0.012 && Math.abs(Math.atan2(Math.sin(a - ad), Math.cos(a - ad))) < 0.03))
  return en(g.cubo) > 20 && en(llanta) > 40 && en(g.punta) > 40 && en(g.pie) > 40 && rayos.length > 20 && sobreUnRayo && puntas
})
afirmar(completos && ENGRANAJES.llanta === 0.8, 'software: los dos engranajes completos — el contorno dentado (las doce y las ocho puntas, todas), la llanta, el cubo y los rayos (sólo sobre sus ángulos): nada suelto')

// El robot: la cabeza a la izquierda; el globo de diálogo arriba a la derecha con sus renglones, en orden; el flujo abajo
// ([CIERRE] 2A: una figura aparte, horizontal, debajo del robot y sin línea que los una; s49 2A).
const K6 = CAPAS_DEL_ROBOT
const capa = (w: number): PuntoA6[] => robotA6.filter((p) => Math.floor(p[3]) === w)
const [cuerpoA6, dialogoA6, textoA6, nodosA6, tramosA6] = [K6.robot, K6.globo, K6.texto, K6.nodos, K6.tramos].map(capa)
const G6 = GLOBO_DE_DIALOGO
const sinRectanguloAbajo = robotA6.every((p) => !(p[0] < -0.5 && p[1] < -0.1))
const textoEnOrden = [...textoA6].sort((p, q) => p[3] - q[3]).every((p, i, ps) => i === 0 || p[1] <= ps[i - 1][1] + 1e-9)
const dentroDelGlobo = textoA6.every((p) => Math.abs(p[0] - G6.cx) < G6.mx - G6.margen + 1e-9 && Math.abs(p[1] - G6.cy) < G6.my)
afirmar(sinRectanguloAbajo && cuerpoA6.every((p) => p[0] < 0) && dialogoA6.length > 0 && dialogoA6.every((p) => p[0] > -0.1 && p[1] > 0.3) && textoA6.length > 0 && dentroDelGlobo && textoEnOrden && Math.min(...textoA6.map((p) => p[3])) >= K6.texto && Math.max(...textoA6.map((p) => p[3])) < K6.nodos, 'IA: el rectángulo de abajo a la izquierda se fue; el robot habla por un globo de diálogo arriba a la derecha, con tres renglones adentro y cada nanobot del texto sabe en qué punto del texto está (2 + f, en orden: de arriba abajo)', `${String(G6.renglones.length)} renglones`)
const nodoEn = (k: number, relleno: boolean): PuntoA6[] => nodosA6.filter((p) => Math.abs(p[3] - (K6.nodos + (k + (relleno ? 0.5 : 0)) / 10)) < 1e-4)
const anillosYRellenos = FLUJO.nodos.every(([x, y], k) => nodoEn(k, false).length > 0 && nodoEn(k, false).every((p) => Math.abs(Math.hypot(p[0] - x, p[1] - y) - FLUJO.anillo) < 0.003) && nodoEn(k, true).length > 0 && nodoEn(k, true).every((p) => Math.hypot(p[0] - x, p[1] - y) <= FLUJO.relleno + 1e-9))
const [n0, n1, n2, n3, n4] = FLUJO.nodos
const enLinea = n0[1] === n1[1] && n1[1] === n2[1] && n1[0] > n0[0] && n2[0] > n1[0] && Math.abs(n1[0] - n0[0] - (n2[0] - n1[0])) < 1e-9
const anguloDesde = (d: readonly [number, number]): number => Math.atan2(d[1] - n2[1], d[0] - n2[0]) - Math.atan2(n2[1] - n1[1], n2[0] - n1[0])
const bifurcacion = FLUJO.tramos.filter(([de]) => de === 2).length === 2 && Math.abs(anguloDesde(n3) + anguloDesde(n4)) < 0.02 && Math.abs(anguloDesde(n3)) > 0.5 && Math.abs(anguloDesde(n3)) < 0.9
const tramoRecorrido = FLUJO.tramos.every(([de, a], L) => {
  const enElReloj = L + PRIMER_TRAMO_EN_EL_RELOJ
  const mios = tramosA6.filter((p) => p[3] >= K6.tramos + enElReloj / 10 && p[3] < K6.tramos + (enElReloj + 1) / 10).sort((p, q) => p[3] - q[3])
  const desde = FLUJO.nodos[de]
  const [primero, ultimo] = [mios[0], mios[mios.length - 1]]
  return mios.length > 10 && Math.hypot(primero[0] - desde[0], primero[1] - desde[1]) < Math.hypot(ultimo[0] - desde[0], ultimo[1] - desde[1]) && Math.hypot(ultimo[0] - FLUJO.nodos[a][0], ultimo[1] - FLUJO.nodos[a][1]) < FLUJO.anillo + 0.02
})
afirmar(anillosYRellenos && enLinea && bifurcacion && tramoRecorrido && sombreadorA6.includes(`return d.w < ${K6.nodos.toFixed(5)} ? uColores[ 3 ] : uColores[ 4 ];`), 'automatización: el flujo es nuestro — nodos que son anillos (con su relleno aparte), tres en línea HORIZONTAL de izquierda a derecha ([CIERRE] 2A: era en diagonal desde la cabeza) y del tercero una bifurcación simétrica (±34°); cada tramo sabe cuánto de sí es cada nanobot (4 + (L + u) / 10, desde el 1 del reloj), de borde de anillo a borde de anillo; el robot y su globo en verde (#10b981), el flujo en ámbar (#f59e0b)')

// La vida del robot: el texto se tipea y se borra; el flujo se enciende tramo a tramo con el pulso, y vuelve a empezar. Con movimiento reducido, el final quieto.
const RT = RELOJ_DEL_ROBOT
const visibles = (ps: readonly PuntoA6[], t: number, quieto = false): number => ps.filter((p) => vidaDelRobot(p[3], t, quieto).ve > 0.5).length
const pulsoEn = (ps: readonly PuntoA6[], t: number): number => ps.reduce((s, p) => s + vidaDelRobot(p[3], t, false).pulso, 0)
const escrituras = Array.from({ length: 12 }, (_, i) => visibles(textoA6, (i / 11) * RT.tipeo.escribe * RT.tipeo.periodoS))
const seTipea = escrituras.every((v, i) => i === 0 || v >= escrituras[i - 1]) && escrituras[0] === 0 && escrituras[11] === textoA6.length && visibles(textoA6, (RT.tipeo.borraDesde - 0.01) * RT.tipeo.periodoS) === textoA6.length && visibles(textoA6, (RT.tipeo.borraHasta + 0.01) * RT.tipeo.periodoS) === 0
const rellenosA6 = nodosA6.filter((p) => (p[3] - K6.nodos) * 10 - Math.floor((p[3] - K6.nodos) * 10 + 0.001) > 0.25)
const alTiempo = (fase: number): number => fase * RT.flujo.periodoS
const seEnciende = [0, 1, 2].every((k) => visibles(rellenosA6, alTiempo((k + 1) * RT.flujo.porTramo + 0.01)) === nodoEn(0, true).length * (k + 1) + (k === 2 ? 0 : 0)) && visibles(rellenosA6, alTiempo(4 * RT.flujo.porTramo + 0.01)) === rellenosA6.length && visibles(rellenosA6, alTiempo(RT.flujo.reinicio + 0.01)) === 0
const tramoDe = (L: number): PuntoA6[] => tramosA6.filter((p) => p[3] >= K6.tramos + L / 10 && p[3] < K6.tramos + (L + 1) / 10)
// [CIERRE] 2A · el lugar 0 del reloj no tiene nanobots (era el tramo que salía del robot): es la pausa antes del primer nodo.
const pulsoPorTramo = tramoDe(0).length === 0 && [1, 2].every((L) => pulsoEn(tramoDe(L), alTiempo((L + 0.5) * RT.flujo.porTramo)) > 0 && [1, 2, 3, 4].filter((otro) => otro !== L).every((otro) => pulsoEn(tramoDe(otro), alTiempo((L + 0.5) * RT.flujo.porTramo)) === 0)) && pulsoEn(tramoDe(3), alTiempo(3.5 * RT.flujo.porTramo)) > 0 && pulsoEn(tramoDe(4), alTiempo(3.5 * RT.flujo.porTramo)) > 0 && pulsoEn(tramosA6, alTiempo(0.5)) === 0
const quietoAlFinal = robotA6.filter((p) => p[3] >= K6.texto).every((p) => vidaDelRobot(p[3], 0, true).ve === 1 && vidaDelRobot(p[3], 0, true).pulso === 0)
afirmar(seTipea && textoEscrito(0) === 0 && textoEscrito(RT.tipeo.escribe) === 1 && textoEscrito(0.95) === 0, 'el texto se tipea en orden hasta `escribe`, se queda, se borra (de atrás para adelante) y vuelve a empezar', `${String(RT.tipeo.periodoS)} s por ciclo`)
afirmar(seEnciende && pulsoPorTramo, 'el flujo se enciende tramo a tramo: el pulso recorre un tramo (y sólo ese), el nodo al que llega se llena, sigue al siguiente, en la bifurcación va por las dos ramas a la vez, queda encendido y se apaga todo para volver a empezar', `${String(RT.flujo.periodoS)} s por ciclo`)
afirmar(quietoAlFinal && sombreadorA6.includes('vidaDelRobot( d, t, uQuieto )') && sombreadorA6.includes('* deNube * vida.x;') && sombreadorA6.includes('float pulso = vida.y;') && VIDA_DEL_ROBOT_GLSL.includes(`fract( t / ${RT.tipeo.periodoS.toFixed(5)} )`) && VIDA_DEL_ROBOT_GLSL.includes(`fract( t / ${RT.flujo.periodoS.toFixed(5)} )`) && VIDA_DEL_ROBOT_GLSL.includes(`step( fase, ${RT.flujo.reinicio.toFixed(5)} )`) && VIDA_DEL_ROBOT_GLSL.includes(`quieto > 0.5 ? ${(RT.flujo.reinicio - 0.01).toFixed(5)}`), 'con movimiento reducido el robot queda en su estado final (todo escrito, todo encendido, sin pulso); y el sombreador corre la misma cuenta, con los mismos números (la copia en TypeScript es la que acaba de medirse)')
controlPositivo('el detector VE una vida que con movimiento reducido arranca vacía', robotA6.filter((p) => p[3] >= K6.texto).every((p) => vidaDelRobot(p[3], 0, false).ve === 1), (x: boolean) => x)

// Lo mismo de siempre, que no se perdió: una llamada, el lazo que para fuera de pantalla (s47 C4), y menos nanobots en el teléfono; archivos bajo las 300 líneas de código.
const lineasDeCodigoA6 = (ruta: string): number => lineasDeCodigo(leer(ruta)).length
const nanobotsA6 = ['trazos', 'robot', 'vida', 'simbolos', 'enjambre', 'montaje'].map((a) => `_lib/nanobots/${a}.ts`)
afirmar(PUNTOS_DEL_ENJAMBRE.ancho === 3000 && PUNTOS_DEL_ENJAMBRE.angosto === 1200 && nanobotsA6.every((a) => lineasDeCodigoA6(a) <= LIMITE_DE_LINEAS_DE_CODIGO) && sinComentarios(leer('_lib/nanobots/enjambre.ts')).includes("Math.min(2.6, Math.max(1.6, ancho / 140))"), 'el enjambre sigue siendo UNA llamada con el morph en la GPU (s47 C4 lo fija); en el teléfono 1200 nanobots (eran 900: a paso constante el trazo pide más) y el punto no baja de 1,6 px (tocan al siguiente); cada módulo de `_lib/nanobots/` bajo las 300 líneas de código', nanobotsA6.map((a) => `${a.slice(14)} ${String(lineasDeCodigoA6(a))}`).join(' · '))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A7 · Las demos de Tu panel llegan más despacio y la sección es un poco más larga (REGLA DE ALTURAS: la tabla declara lo real)')

const arranquesA7 = arranques()
afirmar(arranquesA7[arranquesA7.length - 1] === 584 && TABLA_DEL_CAOS.map((f) => f.separacion).join() === '16,92,92,87,87,92,40,78', 'las separaciones del caos crecieron un 12 % (de 522 a 584 svh hasta la última feature): las demos llegaban demasiado rápido una tras otra', `${String(arranquesA7[arranquesA7.length - 1])} svh`)
afirmar(seccionPorId('tu-panel').alto === '700svh', 'y la tabla de secciones declara el alto nuevo (700svh: medido 6,9–7,0 pantallas a 1440 × 900 con el banco; con 600 contra 6,33 medidas todo lo que venía después llegaba 0,0035 de progreso tarde)')
const anclaDeLaDemo = (a: ParDeAnclas): boolean => a.inicio === ANCLA_DE_LA_VENTANA_VISIBLE.inicio && a.fin.declarado === 'bottom 50%' && a.fin.elemento.fraccion === 1 && a.fin.elemento.px === 0 && a.fin.viewport.fraccion === 0.5 && a.fin.viewport.px === 0
const tarjetaA7 = leer('_secciones/tu-panel/Tarjeta.tsx')
const animadaA7 = sinComentarios(leer('_secciones/_contrato/coreografia-animada.tsx'))
const destinosA7 = sinComentarios(leer('_componentes/destinosDelViaje.ts'))
afirmar(anclaDeLaDemo(ANCLA_DE_LA_DEMO) && /<Bloque patron="P2" rango="ventana-de-la-demo" className="w-full">/.test(tarjetaA7) && animadaA7.includes("if (props.rango === 'ventana-de-la-demo') return ANCLA_DE_LA_DEMO") && destinosA7.includes("'ventana-de-la-demo': ANCLA_DE_LA_DEMO,") && /rango="ventana-visible"/.test(leer('_secciones/tu-panel/Fondo.tsx')), 'cada feature llega con `ventana-de-la-demo`: la misma entrada que la ventana visible (asoma y arranca) pero termina de subir cuando su pie cruza la MITAD del cuadro, no 240 px antes de salir (a 1440 × 900 y 600 px de demo, 970 px de recorrido en vez de 760: un 28 % más despacio, con P2 intacto); los viajes del menú la conocen; las palabras del fondo siguen con la ventana visible')
controlPositivo('el detector VE la ventana visible de antes (llegada 240 px antes de salir)', ANCLA_DE_LA_VENTANA_VISIBLE, anclaDeLaDemo)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A8 · Tu panel abajo de 1024: cada demo es el panel de escritorio a escala, corriendo como un video')

const cargadorA8 = sinComentarios(leer('_panel-vivo/DemoDelPanel.tsx'))
const reproduccionA8 = sinComentarios(leer('_panel-vivo/reproduccion.ts'))
const geometriaA8 = sinComentarios(leer('_secciones/tu-panel/geometria.ts'))
const comoVideo = (c: string): boolean =>
  c.includes('const escalada = escala > 0') &&
  c.includes('bucle: !escritorio }') &&
  /className=\{`\$\{escalada \? 'absolute top-0 left-0 origin-top-left' : 'absolute inset-0'\} max-escritorio:pointer-events-none\$\{corre \? '' : ` \$\{CONGELADA\}`\}`\}/.test(c) &&
  /data-parte="pausa-del-video"[\s\S]{0,400}aria-pressed=\{pausada\}[\s\S]{0,600}escritorio:hidden/.test(c) &&
  c.includes('const corre = laMasVisible && pestana && !pausada && !reducido')
afirmar(comoVideo(cargadorA8), 'la demo se escala SIEMPRE a su caja (ya no sólo desde 1024: en el teléfono es el mismo panel a escala); abajo de 1024 no recibe el puntero (nada que tocar adentro), va en bucle, y su pausa es un botón afuera de la escala (WCAG 2.2.2), sólo ahí; sigue corriendo sólo la más visible, con la pestaña visible y sin movimiento reducido')
controlPositivo('el detector VE la demo del teléfono de antes (a su alto, sin escala)', cargadorA8.replace('const escalada = escala > 0', 'const escalada = escritorio && escala > 0'), comoVideo)
const enBucle = (r: string): boolean => /readonly bucle: boolean/.test(r) && r.includes('bucle: false })') && /if \(!\(r\.corre && r\.bucle\) \|\| paso < total\) return undefined\s*const reloj = window\.setTimeout\(\(\) => setTicks\(0\), cadaMs \* RESPIRO_DEL_BUCLE\)/.test(r) && RESPIRO_DEL_BUCLE >= 1
afirmar(enBucle(reproduccionA8), 'el bucle: terminado el guion, un respiro (dos pasos) y arranca de nuevo — sólo mientras corre y sólo en bucle (el escritorio, donde la demo se usa, sigue parándose en el último paso)', `${String(RESPIRO_DEL_BUCLE)} pasos de respiro`)
controlPositivo('el detector VE un bucle que reinicia aunque la demo no corra', reproduccionA8.replace('if (!(r.corre && r.bucle) || paso < total) return undefined', 'if (!r.bucle || paso < total) return undefined'), enBucle)
const marcoA8 = /<div\s+data-parte="marco"[\s\S]*?className="([^"]*)"/.exec(tarjetaA7)?.[1] ?? ''
afirmar(/^relative aspect-\[var\(--proporcion\)\] w-full overflow-hidden /.test(marcoA8) && !/alto-angosto|escritorio:h-auto|escritorio:aspect/.test(marcoA8) && !/altoAngosto|alto-angosto/.test(geometriaA8) && !/alto-angosto/.test(sinComentarios(tarjetaA7)), 'el marco tiene SIEMPRE la proporción de su pantalla (el alto propio de abajo de 1024 se fue de la tabla, de la tarjeta y del estilo inline)', marcoA8.split(' ').slice(0, 3).join(' '))

cerrar('s48-ajustes-finales')
