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
 *   A5 · la cabeza fija de Servicios (abajo de 1024) libre del menú pasa al producto, sin bandera.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/ajustes-finales/mirar.txt`.
 */
import { existsSync, readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { ESCALON_DE_LAS_ONDAS_S, IconoDelParlante, ONDAS_EN_ESPERA, PULSO_DE_LA_ESPERA } from '../../_chrome/sonido/IconoDelParlante'
import { VeloDeCarga } from '../../_componentes/VeloDeCarga'
import { RESPALDO_2D_CON_ESCENA_MS, RESPALDO_2D_MS } from '../../_componentes/titulos3d/titular2d'
import { CARGA, abrirLaCarga, cargaLista, hayPrimerCuadro, marcarElPrimerCuadro, suscribirALaCarga } from '../carga'

import { PARES_DE_LA_CAMARA, TRAMO_DE_LA_CAMARA, comoEntonces, progresoDeLaCamara } from '../escena/camaraDeEntonces'
import { PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { APARECE_CON_EL_TITULO, opacidadDelAcompanante } from '../escena/titulos3d/acompanantes'
import { FLOOR_Y } from '../escena/probeScene'
import { SOMBRA_DEL_LOGO } from '../escena/sombra/delLogo'
import { APLICAR_LA_SOMBRA_DE_LOS_TITULOS_GLSL, BASE_EN_TEXELES, CHARCO_CON_LOS_TITULOS_GLSL, DISTANCIA_DEL_LOGO, FONDO_DEL_MAPA, PENUMBRA_DEL_LOGO, SOMBRA_DE_LOS_TITULOS, SOMBRA_DE_LOS_TITULOS_EN_VIVO, SOMBRA_DE_LOS_TITULOS_GLSL, TEXEL_DE_LA_LETRA_GLSL, ajustarLaCamara, crearMapaDeLosTitulos, direccionDeLaLuz, fuerzasDeLaSombra, lodDeLaPenumbra, materialDeLaSombraDelTitulo, penumbraEn } from '../escena/sombra/deLosTitulos'
import { poseDeLaLectura } from '../escena/titulos3d/colocacion'
import { DISOLVER_GLSL, LLEGADA_NORMAL_GLSL, LLEGADA_PARS_GLSL, LLEGADA_POSICION_GLSL, mostradoDelScroll } from '../escena/titulos3d/llegada'
import { LECTURA, LLEGADA_DE_PORTFOLIO } from '../titulos3d/registro'
import { LENTOS } from '../titulos3d/repeticiones'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DE_ESTILO } from './s3-archivos'
import { REGISTRO_POR_NOMBRE } from './s3-registro-de-tokens'
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
const seguroSinJs = (h: string): boolean => /\[data-v3\] \[data-pieza='velo-de-carga'\] \{\s*--velo-fundido: (\d+)ms;\s*--velo-espera: (\d+)ms;\s*opacity: 1;/.test(h) && /\[data-velo='espera'\] \{\s*animation: velo-de-carga-sale var\(--velo-fundido\) var\(--ease-salida\) var\(--velo-espera\) both;/.test(h) && /\[data-velo='saliendo'\] \{\s*animation: velo-de-carga-sale-ya var\(--velo-fundido\) var\(--ease-salida\) both;/.test(h) && /@keyframes velo-de-carga-sale \{\s*to \{\s*opacity: 0;/.test(h) && /@keyframes velo-de-carga-sale-ya \{\s*to \{\s*opacity: 0;/.test(h) && /@media \(prefers-reduced-motion: reduce\) \{\s*\[data-v3\] \[data-pieza='velo-de-carga'\]\[data-velo='espera'\] \{\s*animation: none;/.test(h)
const [fundidoDeLaHoja, esperaDeLaHoja] = [Number(/--velo-fundido: (\d+)ms/.exec(hojaA4)?.[1]), Number(/--velo-espera: (\d+)ms/.exec(hojaA4)?.[1])]
const politicaReducida = leer('../globals.css')
afirmar(seguroSinJs(hojaA4) && fundidoDeLaHoja === CARGA.fundidoMs && esperaDeLaHoja === CARGA.plazoMs && CARGA.fundidoMs === 800 && CARGA.plazoMs === 4000 && CARGA.margenMs > 0 && CARGA.margenMs < CARGA.fundidoMs && /prefers-reduced-motion: reduce[\s\S]*animation-duration: 1ms !important/.test(politicaReducida), 'la hoja lleva el seguro sin hidratar (en espera se funde sola a los 4 s, con el mismo fundido de 0,8 s) y el fundido ya cuando el hook lo pide: los mismos números que el hook; con movimiento reducido la espera no se anima (la política del sitio corta toda animación a 1 ms: el velo quedaría destapado antes de tiempo, medido) y la salida es de golpe', `${String(CARGA.fundidoMs)} ms · plazo ${String(CARGA.plazoMs)} ms · margen ${String(CARGA.margenMs)} ms`)
controlPositivo('el detector VE la hoja sin el seguro sin JS', hojaA4.replace(/animation: velo-de-carga-sale var[^;]*;/, ''), seguroSinJs)
afirmar(ARCHIVOS_DE_ESTILO.includes(`${V3}/_estilos/carga.css`) && /import '\.\/_estilos\/carga\.css'/.test(leer('layout.tsx')) && REGISTRO_POR_NOMBRE.get('--velo-fundido')?.valor === `${String(CARGA.fundidoMs)}ms` && REGISTRO_POR_NOMBRE.get('--velo-espera')?.valor === `${String(CARGA.plazoMs)}ms`, '  la hoja entra por el layout (cómo se importa), está en el padrón de s3 y sus dos propiedades de componente están registradas con esos números')
// Qué espera: las fuentes, el primer cuadro de la escena (o la escena caída) y el titular del hero armado si está anotado; o el plazo.
const veloFuente = sinComentarios(leer('_componentes/VeloDeCarga.tsx'))
const esperaTodo = (c: string): boolean => /const todo = fuentes && \(primerCuadro \|\| caida\) && \(!conTitular \|\| \(titular1 && titular2\)\)/.test(c) && /if \(etapa !== 'espera' \|\| !\(todo \|\| vencido\)\) return undefined\s*const ya = performance\.now\(\)\s*if \(ya < CARGA\.plazoMs\) \{\s*setEtapa\('saliendo'\)/.test(c) && /window\.setTimeout\(terminar, Math\.max\(0, CARGA\.plazoMs \+ CARGA\.fundidoMs - ya\) \+ CARGA\.margenMs\)/.test(c) && /void document\.fonts\.ready\.then/.test(c) && /Math\.max\(0, CARGA\.plazoMs - performance\.now\(\)\)/.test(c) && /TITULOS_DE_VOLUMEN\.has\(IDS_DEL_TITULAR_DEL_HERO\[0\]\)/.test(c) && /const terminar = useCallback\(\(\): void => \{\s*abrirLaCarga\(\)\s*setEtapa\('fuera'\)/.test(c) && /if \(e\.animationName\.startsWith\('velo-de-carga-sale'\)\) terminar\(\)/.test(c) && /onAnimationEnd=\{alTerminarLaAnimacion\}/.test(c)
afirmar(esperaTodo(veloFuente), '  el fundido arranca cuando están las fuentes, el primer cuadro de la escena (o la escena se cayó) y, si el titular del hero está anotado como título de volumen, sus dos registros armados; o al vencer el plazo. Si el DOM se entera después del plazo, deja terminar el fundido de la hoja (no lo reinicia: era un destello blanco con CPU ×4). El fin de la animación es lo que desmonta el velo y abre la carga (con un seguro por si no llega)')
controlPositivo('el detector VE un velo que no espera al titular', veloFuente.replace('(!conTitular || (titular1 && titular2))', 'true'), esperaTodo)
controlPositivo('el detector VE el velo que reiniciaba el fundido aunque la hoja ya lo estuviera fundiendo', veloFuente.replace('if (ya < CARGA.plazoMs) {', 'if (true) {'), esperaTodo)
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

cerrar('s48-ajustes-finales')
