/**
 * CIERRE + FINAL DEL PIE — el invariante: npm run test:s49-cierre-final
 *
 * Cada arreglo y cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por ticket:
 *   1A · el velo de carga siempre se va: abajo de 1024 espera sólo las fuentes y el primer cuadro de la escena; con
 *        JavaScript, el seguro de 4 s sin condiciones; sin hidratar, la hoja lo saca en los dos modos de movimiento.
 *   1B · la llegada de los demos de Trabajos (título, párrafo y libros, en el vacío del túnel) dura el doble de scroll:
 *        arranca donde siempre y su reloj corre a la mitad; el vacío no cambia; el piso del regulador la espera entera.
 *   1C · el túnel: la misma animación (la tabla de heatbureau, sus rampas, sus resortes y su regulador), estirada por `k`
 *        desde 1024 ([EL ENCASTRE] 1A: 1,8, y la prueba `tunelk` se borró); con k = 1, el de antes cuadro a cuadro; las
 *        leyes de prueba de AJUSTES FINALES B1 se borraron; REGLA DE ALTURAS: la escena descuenta el tramo estirado.
 *   2A · los nanobots de IA y automatización: el flujo es una figura aparte, horizontal, debajo del robot, sin línea que los
 *        una; el robot que habla y el flujo que se enciende tramo a tramo, como estaban.
 *   2B · el contacto como placa, al producto (desde la barra y con movimiento): un bloque con espesor que llega desde un
 *        punto del fondo, deja ver sus costados con el puntero y al cerrar se acuesta antes de que se vaya el desenfoque;
 *        `contactofondo` y el fundido a blanco se borraron; el teléfono y el movimiento reducido, la hoja de siempre.
 *   3  · el final del pie: una cola de scroll después del pie (fuera de la tabla de secciones) donde el logo se acuesta y
 *        se encastra en el piso mientras la cámara sube a mirarlo desde arriba; el golpe (partículas de tinta en un solo
 *        dibujo y una onda en el piso), el piso que vibra y se oscurece bajo el mouse, el quieto que gira y se aleja con
 *        tope, y la vuelta en reversa; las piezas del pie van con la cámara. Desde 1024 y con movimiento.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/cierre-final/mirar.txt`.
 */
import { existsSync, readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { HojaParaElInvariante } from '../../_chrome/contacto/FormularioDeContacto'
import { ESCALA_AL_NACER, ESPESOR_DE_LA_PLACA_PX, MS_DE_LA_SALIDA_DE_LA_PLACA, PERSPECTIVA_DE_LA_PLACA, TRANSICIONES, paralajeDe, seVeElCostadoIzquierdo, viajeDesdeElFondo } from '../../_chrome/contacto/placa'
import { CATALOGO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'
import { LLEGADA, escalaDeDemos, llegadaDeDemos, tramoDelLibro } from '../../_secciones/trabajos/demos/entrada'
import { BANDA_DEL_EFECTO, FIN_DE_LA_LLEGADA_EN_EL_VACIO, LLEGADA_DE_LOS_DEMOS, MARGEN_DEL_DESPINEADO, PX_DEL_FIN_DE_LA_LLEGADA, PX_DE_LA_SECCION, progresoDelPxDelTunel } from '../../_secciones/trabajos/geometria'
import { enElRiel } from '../../_secciones/trabajos/regulador'
import { ESTIRAMIENTO_DEL_TUNEL, PX_DEL_ARRANQUE_DEL_TUNEL, pantallasExtra, progresoDeLaTabla, pxDeLaTabla } from '../../_secciones/trabajos/ritmo'
import { PX_DEL_TUNEL, poseDelTunel } from '../../_secciones/trabajos/tunel'
import { ANCLAJE, pantallaDeScroll } from '../escena/anclaje'
import { ANCLAS_DEL_FINAL, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { FINAL_DEL_PIE, acostado, camaraDelFinal, pasoDelReloj, poseDelLogo, relojDelQuieto, relojQuieto } from '../escena/final/recorridoDelFinal'
import { conOndaDirigida } from '../escena/piso/ondaDirigida'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { FLOOR_Y } from '../escena/probeScene'
import { PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { progresoDelScroll } from '../escena/recorrido'
import { sinElEstiramiento } from '../escena/tramoEstirado'
import { CARGA, SEGURO_DEL_VELO_MS, estaTodo, type EstadoDeLaCarga } from '../carga'
import { CAPAS_DEL_ROBOT, FLUJO, ROBOT, robot } from '../nanobots/robot'
import { RELOJ_DEL_ROBOT, vidaDelRobot } from '../nanobots/vida'
import { ESCENARIO_MIN_ANCHO_PX } from '../compuerta'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1A · El velo de carga siempre se va, en todos los anchos (en el teléfono quedaba tapando la página)')

// Qué espera, por ancho: el peor caso es el titular anotado y nunca armado (lo que la hipótesis del teléfono temía).
const ANCHOS = [320, 360, 390, 412, 600, 768, 1000, 1023, 1024, 1025, 1280, 1440, 1920] as const
type Regla = (e: EstadoDeLaCarga) => boolean
const conLoQueHayAhi = (regla: Regla): boolean =>
  ANCHOS.every((ancho) => {
    const escritorio = ancho >= ESCENARIO_MIN_ANCHO_PX
    const peor = { fuentes: true, primerCuadro: true, caida: false, escritorio, conTitular: true, titularListo: false }
    // Abajo de 1024 alcanzan las fuentes y el primer cuadro (o la escena caída); desde 1024 se espera el titular anotado.
    return regla(peor) === !escritorio && regla({ ...peor, primerCuadro: false, caida: true }) === !escritorio && !regla({ ...peor, fuentes: false }) && !regla({ ...peor, primerCuadro: false }) && regla({ ...peor, titularListo: true })
  })
afirmar(conLoQueHayAhi(estaTodo) && ESCENARIO_MIN_ANCHO_PX === 1024, 'abajo de 1024 (el umbral del sitio: desde ahí se monta como escritorio) el velo espera sólo lo que existe ahí —las fuentes y el primer cuadro de la escena (o la escena caída)—, aunque un titular de volumen estuviera anotado; desde 1024, además el titular del hero armado', `${String(ANCHOS.length)} anchos, de ${String(ANCHOS[0])} a ${String(ANCHOS[ANCHOS.length - 1])}`)
controlPositivo('el detector VE la regla de A4 (el titular anotado se esperaba en cualquier ancho)', (e: EstadoDeLaCarga) => e.fuentes && (e.primerCuadro || e.caida) && (!e.conTitular || e.titularListo), conLoQueHayAhi)

// Sin hidratar (el teléfono por la IP de la red, un módulo que no llega): la hoja sola. Cuándo se va, por modo de movimiento.
const hoja = leer('_estilos/carga.css')
const politica = readFileSync('src/app/globals.css', 'utf8').replace(/\r\n/g, '\n')
const reglaReducida = /@media \(prefers-reduced-motion: reduce\) \{\s*\*,\s*\*::before,\s*\*::after \{([^}]*)\}/.exec(politica)?.[1] ?? ''
const laPoliticaSacaLaEspera = /animation-delay: 0ms !important/.test(reglaReducida) && /animation-duration: 1ms !important/.test(reglaReducida)
/** Cuándo se va el velo sin JavaScript (ms desde el arranque); `Infinity`: nunca. Con movimiento reducido manda la política. */
const seVaSinJs = (h: string, reducido: boolean): number => {
  const plazo = Number(/--velo-espera: (\d+)ms/.exec(h)?.[1])
  const fundido = Number(/--velo-fundido: (\d+)ms/.exec(h)?.[1])
  if (!reducido) return /\[data-velo='espera'\] \{\s*animation: velo-de-carga-sale var\(--velo-fundido\) var\(--ease-salida\) var\(--velo-espera\) both;/.test(h) ? plazo + fundido : Infinity
  // La regla de la espera con movimiento reducido (si la hay): `animation: none` la deja opaca para siempre.
  const enReducido = /@media \(prefers-reduced-motion: reduce\) \{\s*\[data-v3\] \[data-pieza='velo-de-carga'\]\[data-velo='espera'\] \{([^}]*)\}/.exec(h)?.[1] ?? ''
  if (/animation: none/.test(enReducido)) return Infinity
  // Si no le devuelve la espera con `!important`, la política se la saca: se iría en el acto, antes de que esté nada.
  if (!/animation-delay: var\(--velo-espera\) !important;/.test(enReducido)) return laPoliticaSacaLaEspera ? 0 : plazo
  // Con la espera devuelta, la animación de la política (1 ms) es un corte a los `plazo` (en escalón: no hay fundido).
  return /animation-timing-function: step-end;/.test(enReducido) ? plazo : plazo + 1
}
const siempreSeVa = (h: string): boolean => [false, true].every((reducido) => seVaSinJs(h, reducido) >= CARGA.plazoMs && seVaSinJs(h, reducido) <= CARGA.plazoMs + CARGA.fundidoMs)
afirmar(laPoliticaSacaLaEspera && siempreSeVa(hoja) && /<style>\{`\[data-v3\] \[data-pieza='velo-de-carga'\] \{ display: none; \}`\}<\/style>/.test(leer('_componentes/VeloDeCarga.tsx')), 'sin hidratar, la hoja lo saca sola a los 4 s en los dos modos: con movimiento, con su fundido (4–4,8 s); con movimiento reducido, de golpe a los 4 s (el `!important` le devuelve la espera que la política le saca); sin JavaScript, el `<noscript>`', `con movimiento ${String(seVaSinJs(hoja, false))} ms · reducido ${String(seVaSinJs(hoja, true))} ms`)
controlPositivo('el detector VE la hoja de A4 (con movimiento reducido la espera no se animaba: opaco para siempre)', hoja.replace(/animation-timing-function: step-end;\s*animation-delay: var\(--velo-espera\) !important;/, 'animation: none;'), siempreSeVa)
controlPositivo('  y VE el corte sin `!important` (la política le saca la espera: destapado antes de que esté nada)', hoja.replace('animation-delay: var(--velo-espera) !important;', 'animation-delay: var(--velo-espera);'), siempreSeVa)

// Con JavaScript: el seguro sin condiciones (ni de lo que llegó, ni del ancho, ni de la etapa).
const velo = sinComentarios(leer('_componentes/VeloDeCarga.tsx'))
const seguroSinCondiciones = (c: string): boolean => /useEffect\(\(\) => \{\s*const reloj = window\.setTimeout\(terminar, Math\.max\(0, SEGURO_DEL_VELO_MS - performance\.now\(\)\)\)\s*return \(\) => window\.clearTimeout\(reloj\)\s*\}, \[terminar\]\)/.test(c) && /const terminar = useCallback\(\(\): void => \{\s*abrirLaCarga\(\)\s*setEtapa\('fuera'\)\s*\}, \[\]\)/.test(c) && /if \(etapa === 'fuera'\) return null/.test(c)
afirmar(seguroSinCondiciones(velo) && SEGURO_DEL_VELO_MS === CARGA.plazoMs + CARGA.fundidoMs + CARGA.margenMs && SEGURO_DEL_VELO_MS <= 5200, 'con JavaScript, a los 5,2 s del arranque se va igual, sin ninguna condición (antes, el seguro dependía de lo que esperaba y se podía correr)', `${String(SEGURO_DEL_VELO_MS)} ms`)
controlPositivo('el detector VE un seguro que depende de lo que esperaba', velo.replace('}, [terminar])', '}, [terminar, todo])').replace('const reloj = window.setTimeout(terminar, Math.max(0, SEGURO_DEL_VELO_MS', 'if (!todo) return undefined\n    const reloj = window.setTimeout(terminar, Math.max(0, SEGURO_DEL_VELO_MS'), seguroSinCondiciones)

// La causa en el teléfono: el servidor de desarrollo rechazaba la conexión de recarga desde la IP de la red y la hidratación
// colgaba de ella (Next 16). Sólo afecta a `next dev`: el teléfono por la red local tiene que hidratar para probarse.
const config = readFileSync('next.config.ts', 'utf8')
afirmar(/allowedDevOrigins: \['192\.168\.1\.\*'\],/.test(config), '  en desarrollo, la red local (192.168.1.x) puede abrir /v3 entera: el teléfono hidrata (sin eso la página quedaba muerta)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1B · Las demos de Trabajos llegan el doble de lento (en scroll): el título, el párrafo y los libros, en el vacío')

// Dónde pasa cada cosa, en px del túnel (la regla de la referencia, desde el arranque del túnel), con un reloj dado.
const primerPx = (reloj: (mostrado: number) => number, umbral: number): number => {
  let px = 0
  while (px < 8000 && reloj(progresoDelPxDelTunel(px)) < umbral) px += 1
  return px
}
const tramoDeLaLlegada = (reloj: (mostrado: number) => number): { readonly titulo: number; readonly ultimoLibro: number } => ({ titulo: primerPx(reloj, LLEGADA.titulo.desde), ultimoLibro: primerPx(reloj, tramoDelLibro(CATALOGO_DE_DEMOS.length - 1, CATALOGO_DE_DEMOS.length).hasta) })
const antes = tramoDeLaLlegada(escalaDeDemos)
const ahora = tramoDeLaLlegada(llegadaDeDemos)
const dobleDeLento = (t: { readonly titulo: number; readonly ultimoLibro: number }): boolean => t.titulo === antes.titulo && Math.abs(t.ultimoLibro - t.titulo - 2 * (antes.ultimoLibro - antes.titulo)) <= 2
afirmar(dobleDeLento(ahora) && LLEGADA_DE_LOS_DEMOS.lenta === 2 && LLEGADA.titulo.desde === LLEGADA_DE_LOS_DEMOS.desde, 'la aparición dura el doble de scroll: el título sube donde siempre (el vacío al 60 %) y el último libro se asienta el doble de lejos', `antes ${String(antes.ultimoLibro - antes.titulo)} px de la regla (${String(antes.titulo)} → ${String(antes.ultimoLibro)}) · ahora ${String(ahora.ultimoLibro - ahora.titulo)} px (→ ${String(ahora.ultimoLibro)})`)
controlPositivo('el detector VE la llegada de antes (atada al vacío: 388 px)', escalaDeDemos, (r: (m: number) => number) => dobleDeLento(tramoDeLaLlegada(r)))
// El reloj es el vacío hasta el título (nada llega antes) y a la mitad después; el vacío no cambió: llena el cuadro donde siempre.
let mismoHastaElTitulo = true
for (let px = 0; px <= antes.titulo; px += 7) if (Math.abs(llegadaDeDemos(progresoDelPxDelTunel(px)) - escalaDeDemos(progresoDelPxDelTunel(px))) > 1e-9) mismoHastaElTitulo = false
const vacioLleno = primerPx(escalaDeDemos, 1)
afirmar(mismoHastaElTitulo && vacioLleno === antes.ultimoLibro && Math.abs(FIN_DE_LA_LLEGADA_EN_EL_VACIO - 1.4) < 1e-12, '  hasta el título el reloj es la fracción del vacío, y el vacío llena el cuadro en el mismo píxel que antes (la salida por el vacío no cambia): el último libro se asienta ya con el vacío lleno', `vacío lleno en ${String(vacioLleno)}`)
// El piso del regulador: el tramo del túnel y el salto, los de siempre; la llegada entera una muesca antes del despineado.
const piso = BANDA_DEL_EFECTO.piso
const ultimo = piso[piso.length - 1]
afirmar(piso.length === 4 && ultimo.scroll === PX_DE_LA_SECCION - MARGEN_DEL_DESPINEADO && ultimo.efecto === PX_DEL_FIN_DE_LA_LLEGADA && enElRiel(piso, PX_DE_LA_SECCION - MARGEN_DEL_DESPINEADO) >= PX_DEL_FIN_DE_LA_LLEGADA && piso[1].scroll === piso[2].scroll, '  el piso del regulador termina la llegada una muesca antes del despineado (el túnel y el salto sobre la espera, los de siempre: s5-trabajos lo simula a todas las velocidades)')

// La capa: lo que llega usa el reloj de la llegada. [EL ENCASTRE] 1B · abajo de 1024 la capa rígida ya no sigue al vacío
// (cambió por pedido: también más lenta, y las dos con la velocidad tope); lo afirma s50.
const capa = sinComentarios(leer('_secciones/trabajos/demos/CapaDeDemos.tsx'))
const cableada = (c: string): boolean => /progresoDelTitulo\.set\(enElTramo\(l, LLEGADA\.titulo\)\)/.test(c) && /const delParrafo = enElTramo\(l, LLEGADA\.parrafo\)/.test(c) && /poseDelLibro\(enElTramo\(l, tramoDelLibro\(i, libros\.current\.length\)\)\)/.test(c) && /setProperty\('--demos-escala', a\.toFixed\(5\)\)/.test(c) && /aparicion\.current\.mostrada >= 1/.test(c)
afirmar(cableada(capa), '  la capa: el título, el párrafo y los libros siguen el reloj de la llegada; el carrusel arranca cuando todo llegó (lo mostrado); abajo de 1024 la capa rígida escala con la aparición mostrada')
controlPositivo('el detector VE los libros atados al vacío', capa.replace('poseDelLibro(enElTramo(l, ', 'poseDelLibro(enElTramo(u, '), cableada)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1C · El túnel: la misma animación, más larga — la tabla de siempre estirada por k desde 1024 (1,8 desde EL ENCASTRE 1A)')

// Las tres leyes de prueba de AJUSTES FINALES se fueron con su bandera y sus archivos; [EL ENCASTRE] 1A: y la prueba del k.
const T = '_secciones/trabajos'
const sinLasLeyes = (codigo: string): boolean => !/profundidad|tunel=constante|tunel=tope|tunel=largo|sinResortes|poseMostrada|ritmoMostrado/.test(codigo)
const delTunel = ['CapaDelTunel.tsx', 'piezas.tsx', 'regulador.ts', 'estiramiento.ts', 'ritmo.ts'].map((r) => sinComentarios(leer(`${T}/${r}`))).join('\n')
afirmar(sinLasLeyes(delTunel) && !existsSync(`${V3}/${T}/profundidad.ts`) && !existsSync(`${V3}/${T}/largo.ts`) && !('tunel' in PRUEBAS_APAGADAS) && !('tunel' in entornoPedido('producto,tunel=largo').pruebas), '`tunel=constante|tope|largo` se borraron: ni archivos (profundidad.ts, largo.ts), ni ley, ni bandera')
controlPositivo('el detector VE la ley de prueba de antes', `${delTunel}\nconst pose = poseMostrada(px)`, sinLasLeyes)
// [EL ENCASTRE] 1A · lo que esta línea afirmaba (k = 1,5 y `tunelk=1|1.3|1.8`) cambió por pedido: k = 1,8 y sin la prueba.
const sinLaPruebaDelK = (pruebas: object, codigo: string): boolean => !('tunelk' in pruebas) && !/tunelk|estiramientoDeEscritorio|ritmoDelTunel/.test(codigo)
afirmar(sinLaPruebaDelK(PRUEBAS_APAGADAS, delTunel) && sinLaPruebaDelK(entornoPedido('producto,tunelk=1.3').pruebas, delTunel) && ESTIRAMIENTO_DEL_TUNEL.escritorio === 1.8, 'k = 1,8 en el producto (EL ENCASTRE 1A); la prueba `tunelk` se borró: `?pruebas=tunelk=1.3` no pide nada y el túnel no la lee')
controlPositivo('el detector VE la prueba del k de CIERRE (la bandera en las pruebas y su lectura en el túnel)', { ...PRUEBAS_APAGADAS, tunelk: 'no' }, (p: object) => sinLaPruebaDelK(p, delTunel))

// Con k = 1, el reloj es la identidad en cada píxel: lo que llega al regulador es lo de hoy, cuadro a cuadro.
const identidad = (reloj: (px: number) => number): boolean => {
  for (let px = 0; px <= 9000; px += 0.5) if (reloj(px) !== px) return false
  return true
}
let progresoIgual = true
for (let p = 0; p <= 1; p += 1 / 8192) if (progresoDeLaTabla(p, 1) !== p) progresoIgual = false
afirmar(identidad((px) => pxDeLaTabla(px, 1)) && progresoIgual, 'con k = 1 el túnel es el de hoy cuadro a cuadro: el reloj devuelve el MISMO número en cada píxel y en cada progreso (bit a bit), así que el regulador, los resortes y la pose reciben lo de siempre')
controlPositivo('el detector VE un reloj que no es la identidad (el de 1,5)', (px: number) => pxDeLaTabla(px, 1.5), identidad)
const estira = sinComentarios(leer(`${T}/estiramiento.ts`))
afirmar(/if \(!\(panel instanceof HTMLElement\) \|\| ritmo\.banda !== BANDA_DEL_EFECTO \|\| !\(ritmo\.estiramiento > 1\)\) return \(\) => undefined/.test(estira), '  y con k = 1 (o abajo de 1024, donde estira el CSS de MÓVIL 2) el panel no crece y la escena no descuenta nada')

// Las mismas curvas en el progreso de la tabla: adentro del túnel cada píxel de la tabla cuesta k de scroll; después, 1.
const A = PX_DEL_ARRANQUE_DEL_TUNEL
type Reloj = (px: number, k: number) => number
const mismasCurvas = (k: number, reloj: Reloj = pxDeLaTabla): boolean => {
  for (let x = 0; x <= PX_DEL_TUNEL; x += 7) {
    if (Math.abs(reloj(A + k * x, k) - (A + x)) > 1e-9) return false
    const [a, b] = [poseDelTunel(reloj(A + k * x, k) - A), poseDelTunel(x)]
    if (a.anchos.some((v, i) => Math.abs(v - b.anchos[i]) > 1e-12) || Math.abs(a.fraccionDelCta - b.fraccionDelCta) > 1e-12) return false
  }
  // Antes del túnel, el mismo píxel (el cartel, la huida, Portfolio); después, corrido: la espera, la salida y los demos duran lo mismo.
  const antes = [0, A / 3, A].every((y) => reloj(y, k) === y)
  const despues = [0, 552, 1131, 2000, 2931].every((d) => Math.abs(reloj(A + k * PX_DEL_TUNEL + d, k) - (A + PX_DEL_TUNEL + d)) < 1e-9)
  return antes && despues
}
afirmar([1.3, 1.5, 1.8].every((k) => mismasCurvas(k)), 'las mismas curvas en el progreso de la tabla, para k = 1,3, 1,5 y 1,8: la pose en el scroll A + k·x es la de la tabla en A + x; antes del túnel el mismo píxel; después del túnel la espera, la salida por el vacío y los demos duran el mismo scroll')
const desparejo: Reloj = (px, k) => (px <= A || px >= A + k * PX_DEL_TUNEL ? pxDeLaTabla(px, k) : A + ((px - A) / (k * PX_DEL_TUNEL)) ** 2 * PX_DEL_TUNEL)
controlPositivo('el detector VE un túnel estirado desparejo (otra curva: lento al principio, rápido al final)', desparejo, (r: Reloj) => mismasCurvas(1.5, r))
const kDelProducto = ESTIRAMIENTO_DEL_TUNEL.escritorio
afirmar(Math.abs(pantallasExtra(1.5) - (0.5 * PX_DEL_TUNEL) / 900) < 1e-12 && Math.abs(pantallasExtra(kDelProducto) - ((kDelProducto - 1) * PX_DEL_TUNEL) / 900) < 1e-12 && /panel\.style\.minHeight = `calc\(var\(--alto-minimo-del-panel\) \+ \$\{\(pantallasExtra\(ritmo\.estiramiento\) \* 100\)\.toFixed\(4\)\}svh\)`/.test(estira), '  el panel crece exactamente lo que el túnel se estiró: (k − 1) túneles contados contra 900', `1,5 → +${(pantallasExtra(1.5) * 100).toFixed(1)} svh · el producto (${String(kDelProducto)}) → +${(pantallasExtra(kDelProducto) * 100).toFixed(1)} svh`)

// REGLA DE ALTURAS: con la sección estirada y el descuento de la escena, el mapeo es el de la tabla declarada fuera del túnel.
const H = 900
const trabajosG = ANCLAJE.geometria.find((g) => g.id === 'trabajos')
const desdeDelTunel = ((trabajosG?.desdePantalla ?? 0) - 1) * H + A
const abajoDeclarado = ANCLAJE.pantallasDelDocumento * H
const mapeoIntacto = (k: number, descontar: (y: number, k: number) => number): boolean => {
  const estirar = (y: number): number => (y <= desdeDelTunel ? y : y <= desdeDelTunel + PX_DEL_TUNEL ? desdeDelTunel + (y - desdeDelTunel) * k : y + (k - 1) * PX_DEL_TUNEL)
  for (let y = 0; y <= abajoDeclarado - H; y += 37) {
    const declarado = progresoDelScroll(y, 0, abajoDeclarado, H)
    const medido = progresoDelScroll(descontar(estirar(y), k), 0, descontar(estirar(abajoDeclarado), k), H)
    if (Math.abs(declarado - medido) > 1e-9) return false
  }
  return true
}
const descuento = (y: number, k: number): number => sinElEstiramiento(y, desdeDelTunel, k * PX_DEL_TUNEL, k)
afirmar(trabajosG !== undefined && [1.3, 1.5, 1.8].every((k) => mapeoIntacto(k, descuento)), 'REGLA DE ALTURAS: con la sección estirada (k = 1,3, 1,5 y 1,8) y el descuento de la escena (`tramoEstirado.ts`), el progreso de la escena en cada punto es el de la tabla declarada — antes del túnel igual, adentro a 1/k, después sin lo agregado —: Portfolio, la frase, la noche y el amanecer no se mueven')
controlPositivo('el detector VE el mapeo sin el descuento (todo lo de después llegaría tarde)', (y: number) => y, (sin: (y: number) => number) => mapeoIntacto(1.5, (y) => sin(y)))
const atadura = sinComentarios(leer('_lib/escena/ataduraAlScroll.ts'))
const viaje = sinComentarios(leer('_lib/escena/planDelViaje.ts'))
const capaDelTunel = sinComentarios(leer(`${T}/CapaDelTunel.tsx`))
const cableado = (a: string): boolean =>
  a.includes('const medida = medidaSinElEstiramiento(desplazamiento, secciones.abajo, desplazamiento, ventana, sinEstirar)') &&
  a.includes('progresoDelScroll(medida.y, secciones.arriba, medida.abajo, ventana)') &&
  viaje.includes('sampleLightArc(progresoDelScroll(m.y, secciones.arriba, m.abajo, v), arco)') &&
  capaDelTunel.includes('const ritmo = seguirElRitmo(caja, panel)') && capaDelTunel.includes('progresoDeLaTabla(progreso.get(), ritmo.actual().estiramiento)') && capaDelTunel.includes('ritmo.soltar()') &&
  estira.includes('TRAMO_ESTIRADO.valor = tramo') && estira.includes('let ritmo = ritmoDe(caja)') && estira.includes('soltarElPanel()\n    ritmo = ritmoDe(caja)')
afirmar(cableado(atadura), '  el cableado: el lazo de la escena y la luz de los viajes miden sin el tramo estirado; el túnel lee su ritmo (el CSS abajo de 1024, el k del producto desde 1024, también al cambiar el ancho), estira el panel y lo suelta al desmontarse')
controlPositivo('el detector VE la escena midiendo el scroll crudo', atadura.replace('progresoDelScroll(medida.y, secciones.arriba, medida.abajo, ventana)', 'progresoDelScroll(desplazamiento, secciones.arriba, secciones.abajo, ventana)'), cableado)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2A · Nanobots de IA y automatización: el flujo es una figura aparte, horizontal, debajo del robot y sin línea que los una')

interface FormaDelFlujo {
  readonly nodos: readonly (readonly [number, number])[]
  readonly tramos: readonly (readonly [number, number])[]
}
const C = ROBOT.cabeza
const aparteYHorizontal = (f: FormaDelFlujo): boolean => {
  const [n0, n1, n2] = f.nodos
  const horizontal = n0[1] === n1[1] && n1[1] === n2[1] && n0[0] < n1[0] && n1[0] < n2[0]
  // Ningún tramo sale del robot (todos van de nodo a nodo) y todo el flujo queda debajo de la cabeza, con aire.
  const deNodoANodo = f.tramos.every(([de, a]) => de >= 0 && a >= 0 && de < f.nodos.length && a < f.nodos.length)
  const debajo = f.nodos.every(([, y]) => y + FLUJO.anillo < C.cy - C.my - 0.15)
  return horizontal && deNodoANodo && debajo
}
afirmar(aparteYHorizontal(FLUJO), 'el flujo va aparte: tres nodos en línea horizontal, de izquierda a derecha, debajo de la cabeza del robot y con aire (más de 0,15 del símbolo); ningún tramo sale del robot', `nodos en y = ${String(FLUJO.nodos[0][1])} · la cabeza termina en ${(C.cy - C.my).toFixed(2)}`)
const flujoDeAntes: FormaDelFlujo = { nodos: [[-0.05, -0.05], [0.17, -0.27], [0.39, -0.49], [0.69, -0.52], [0.42, -0.79]], tramos: [[-1, 0], [0, 1], [1, 2], [2, 3], [2, 4]] }
controlPositivo('el detector VE el flujo de A6 (salía de la cabeza en diagonal)', flujoDeAntes, aparteYHorizontal)
// En los nanobots: ningún punto del flujo cerca del robot (sin línea que los una), y el robot sigue siendo el mismo.
let azar = 7
const aleatorio = (): number => ((azar = (azar * 16807) % 2147483647) / 2147483647)
const puntos = robot(4000, aleatorio)
const delRobot = puntos.filter((p) => p[3] < CAPAS_DEL_ROBOT.globo)
const delFlujo = puntos.filter((p) => p[3] >= CAPAS_DEL_ROBOT.nodos)
const aire = Math.min(...delFlujo.map((f) => Math.min(...delRobot.map((r) => Math.hypot(f[0] - r[0], f[1] - r[1])))))
afirmar(delFlujo.length > 200 && aire > 0.2, '  en el enjambre: entre el flujo y el robot no hay ningún nanobot que los una (la distancia mínima entre los dos)', `${aire.toFixed(3)} del símbolo`)
// El flujo se sigue encendiendo como antes: el primer nodo a 0,1 del ciclo, el pulso por el tramo y en la bifurcación por las dos ramas.
const F = RELOJ_DEL_ROBOT.flujo
const rellenoDe = (k: number): readonly number[] | undefined => delFlujo.find((p) => Math.abs(p[3] - (CAPAS_DEL_ROBOT.nodos + (k + 0.5) / 10)) < 1e-4)
const primero = rellenoDe(0)
const enciendeIgual = primero !== undefined && vidaDelRobot(primero[3], (F.porTramo - 0.01) * F.periodoS, false).ve === 0 && vidaDelRobot(primero[3], (F.porTramo + 0.01) * F.periodoS, false).ve === 1 && F.periodoS === 8
afirmar(enciendeIgual, '  y se enciende como antes: el primer nodo se llena a 0,1 del ciclo de 8 s (antes de eso, la pausa: donde corría el tramo que salía del robot), y de ahí tramo a tramo (s48 A6)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2B · El contacto como placa, al producto: espesor de verdad, desde un punto del fondo, y se acuesta antes de que se vaya el desenfoque')

// La prueba se fue con el fundido a blanco: desde la barra y con movimiento, la placa; si no, la hoja de siempre.
const formulario = sinComentarios(leer('_chrome/contacto/FormularioDeContacto.tsx'))
const placaDelContacto = sinComentarios(leer('_chrome/contacto/PlacaDelContacto.tsx'))
const alProducto = (f: string): boolean => f.includes('const placa = desdeArriba && !reducido') && !/contactofondo|useFondoDeLaPrueba|'blanco'|fondo === /.test(f) && f.includes('<PlacaDelContacto activa={placa}>')
afirmar(alProducto(formulario) && !('contactofondo' in PRUEBAS_APAGADAS) && !('contactofondo' in entornoPedido('producto,contactofondo=blanco').pruebas) && placaDelContacto.includes('if (!activa) return <>{children}</>'), 'la placa pasó al producto (desde la barra y con movimiento) con el fondo desenfocado; `?pruebas=contactofondo=` y el fundido a blanco se borraron; apagada (el teléfono, con el menú, y con movimiento reducido) la placa no envuelve nada: la hoja de siempre')
controlPositivo('el detector VE la prueba de AJUSTES FINALES (la placa sólo con la bandera)', formulario.replace('const placa = desdeArriba && !reducido', "const placa = fondo !== 'no' && desdeArriba && !reducido"), alProducto)

// El bloque: el frente es la hoja (el diálogo, con sus campos) y detrás, cinco caras de CSS 3D con el espesor.
const hojaDelServidor = renderToStaticMarkup(<HojaParaElInvariante />)
const E = String(ESPESOR_DE_LA_PLACA_PX)
const conEspesor = (h: string): boolean => {
  const bloque = h.indexOf('data-parte="bloque-de-la-placa"')
  const hoja = h.indexOf('data-parte="hoja"')
  const caras: readonly (readonly [string, string])[] = [['izquierda', 'rotateY(90deg)'], ['derecha', 'rotateY(-90deg)'], ['arriba', 'rotateX(-90deg)'], ['abajo', 'rotateX(90deg)'], ['atras', `translateZ(-${E}px)`]]
  return bloque > 0 && hoja > bloque && /transform-style:preserve-3d/.test(h) && caras.every(([cara, giro]) => new RegExp(`data-cara="${cara}" aria-hidden="true"[^>]*style="[^"]*transform:${giro.replace(/[()]/g, '\\$&')}`).test(h))
}
afirmar(conEspesor(hojaDelServidor) && ESPESOR_DE_LA_PLACA_PX >= 40 && /role="dialog"/.test(hojaDelServidor), 'un bloque con espesor de verdad: el frente es el formulario (el diálogo del DOM) y detrás los cuatro costados y la cara de atrás, girados en CSS 3D (preserve-3d)', `${E} px de espesor`)
controlPositivo('el detector VE la placa de AJUSTES FINALES (una hoja sin caras, con un canto pintado)', hojaDelServidor.replace(/<div data-cara="[^"]+"[^>]*><\/div>/g, ''), conEspesor)

// El puntero es la cámara, exagerada: a la izquierda se le ve el costado izquierdo; a la derecha, el derecho; arriba, la cara de arriba.
const ANCHO_DE_LA_PLACA = 944
const costados = (par: typeof paralajeDe): boolean =>
  seVeElCostadoIzquierdo(0.04, ANCHO_DE_LA_PLACA, 1440, par) && seVeElCostadoIzquierdo(0.25, ANCHO_DE_LA_PLACA, 1440, par) && !seVeElCostadoIzquierdo(0.5, ANCHO_DE_LA_PLACA, 1440, par) &&
  Math.abs(par(0.96, 0.5).rotateY + par(0.04, 0.5).rotateY) < 1e-9 && par(0.96, 0.5).origenX > 50 && par(0.5, 0.04).rotateX < 0 && par(0.5, 0.96).rotateX > 0 && par(0.5, 0.04).origenY < 50 && Math.abs(par(0.04, 0.5).rotateY) >= 15
afirmar(costados(paralajeDe) && /if \(e\.pointerType === 'touch'\) return/.test(sinComentarios(leer('_chrome/contacto/placa.ts'))), 'el puntero es la cámara y exagera: con el mouse a la izquierda la cara izquierda gira hacia adelante y el punto de vista se corre (se ve el costado ya desde un cuarto del cuadro; al centro, sólo el frente); a la derecha el derecho; arriba la de arriba y abajo la de abajo. Con el dedo no gira', `${paralajeDe(0.04, 0.5).rotateY.toFixed(1)}° · punto de vista al ${paralajeDe(0.04, 0.5).origenX.toFixed(0)} %`)
const paralajeDeAntes: typeof paralajeDe = (x, y) => ({ rotateY: (x - 0.5) * 2 * 3, rotateX: -(y - 0.5) * 2 * 3, origenX: 50, origenY: 50, corrimientoX: 0, corrimientoY: 0 })
controlPositivo('el detector VE el paralaje de AJUSTES FINALES (±3°, hacia el puntero: el costado no se ve nunca)', paralajeDeAntes, costados)

// La llegada: nace en un PUNTO del fondo y viaja hasta adelante, con el tamaño aparente creciendo casi en recta (como el túnel).
const d = PERSPECTIVA_DE_LA_PLACA
const escalaDe = (z: number): number => d / (d - z)
const desdeUnPunto = (zs: readonly number[]): boolean => {
  const escalas = zs.map(escalaDe)
  const crece = escalas.every((e, i) => i === 0 || e > escalas[i - 1])
  const pasos = escalas.slice(1).map((e, i) => e - escalas[i])
  return escalas[0] <= 0.03 && zs[zs.length - 1] === 0 && crece && pasos[0] > 0.04 && pasos[pasos.length - 1] < pasos[0]
}
afirmar(desdeUnPunto(viajeDesdeElFondo()) && ESCALA_AL_NACER === 0.02 && TRANSICIONES.viaje.ease === 'linear', 'llega desde un punto del fondo (al 2 % de su tamaño, no al tercio) y viaja hasta adelante: su tamaño aparente crece casi en recta y se asienta al final', `z al nacer ${viajeDesdeElFondo()[0].toFixed(0)} px`)
controlPositivo('el detector VE la llegada de AJUSTES FINALES (nacía a un tercio: dos focos atrás)', [-2 * d, -d, 0], desdeUnPunto)
const viajeCableado = /animate=\{\{ z: \[\.\.\.VIAJE\], rotateX: 0 \}\}/.test(placaDelContacto) && /initial=\{\{ z: VIAJE\[0\], rotateX: 0 \}\}/.test(placaDelContacto) && placaDelContacto.includes('transition={TRANSICIONES.viaje}')
afirmar(viajeCableado, '  y el viaje es ése: de `z` en `z`, en tramos iguales de tiempo, después de que el fondo empezó a desenfocarse')

// La salida: primero la placa se acuesta hacia atrás sobre su base (como los títulos y los libros) y recién después se va el desenfoque.
const sale = (placa: string, form: string, t: typeof TRANSICIONES): boolean =>
  placa.includes("transformOrigin: 'center bottom'") && placa.includes('exit={{ rotateX: 90, z: 0, transition: TRANSICIONES.acostarse }}') &&
  form.includes("exit={placa ? { opacity: 0, backdropFilter: 'blur(0px)', transition: TRANSICIONES.fondoAlCerrar } : { opacity: 0 }}") &&
  t.fondoAlCerrar.delay >= t.acostarse.duration && t.acostarse.duration === MS_DE_LA_SALIDA_DE_LA_PLACA / 1000
afirmar(sale(placaDelContacto, formulario, TRANSICIONES), 'al cerrar (Esc, la cruz, el velo), primero la placa se acuesta hacia atrás sobre su base y RECIÉN DESPUÉS se va el desenfoque del fondo', `${String(MS_DE_LA_SALIDA_DE_LA_PLACA)} ms la placa, después ${String(TRANSICIONES.fondoAlCerrar.duration * 1000)} ms el fondo`)
controlPositivo('el detector VE el fondo que se iba a la vez que la placa', { ...TRANSICIONES, fondoAlCerrar: { ...TRANSICIONES.fondoAlCerrar, delay: 0 } }, (t: typeof TRANSICIONES) => sale(placaDelContacto, formulario, t))
afirmar(/className="pointer-events-none absolute inset-0 grid place-items-center/.test(placaDelContacto) && /data-parte="bloque-de-la-placa" className="pointer-events-auto relative"/.test(placaDelContacto), '  un clic al lado de la placa cae en el velo (que cierra): el escenario no recibe el puntero, el bloque sí')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El final del pie: el logo se acuesta y se encastra, la cámara lo mira desde arriba; el golpe, el piso que vibra, el quieto y la vuelta')

// La cola: un scroll sin contenido después del pie, FUERA de la tabla de secciones; mientras se la recorre el pie queda
// pegado arriba. Sólo desde 1024 y con movimiento; abajo y con movimiento reducido no existe (el pie termina la página).
const pagina = sinComentarios(leer('page.tsx'))
const hojaDelPie = leer('_estilos/pie.css')
const colaBien = (pg: string, css: string): boolean =>
  /<Home \/>\s*(\{\}\s*)?<div data-pieza="cola-del-final" aria-hidden="true" className="hidden escritorio:motion-safe:block escritorio:motion-safe:h-\[var\(--cola-del-final\)\]" \/>\s*<\/main>/.test(pg) &&
  /\[data-v3\] \[data-pieza="cola-del-final"\] \{\s*--cola-del-final: \d+svh;\s*\}/.test(css) &&
  /\[data-v3\] \[data-panel="cierre"\] \{\s*position: sticky;\s*top: 0;\s*\}/.test(css) && !/@media/.test(css.slice(css.indexOf('[CIERRE] 3')))
afirmar(colaBien(pagina, hojaDelPie), 'la cola del final: un `div` sin contenido después de las secciones, adentro del `<main>`, que sólo existe desde 1024 y con movimiento (sus variantes, sin media query escrita); mientras se la recorre el pie queda pegado arriba (sin cola el `sticky` no hace nada: el pie es lo último)')
controlPositivo('el detector VE una cola que también estaría con movimiento reducido', [pagina.replace('escritorio:motion-safe:block', 'escritorio:block'), hojaDelPie] as const, ([pg, css]: readonly [string, string]) => colaBien(pg, css))
// Nada de lo de antes se mueve: la cola no es una sección, y la escena se queda en su último nudo (la cuenta se acota).
const v = 900
const abajoDeLasSecciones = ANCLAJE.pantallasDelDocumento * v
afirmar([0, 200, 720].every((dentro) => pantallaDeScroll(abajoDeLasSecciones - v + dentro, 0, abajoDeLasSecciones, v) === ANCLAJE.pantallasDeScroll) && !/data-panel/.test(/<div data-pieza="cola-del-final"[^>]*>/.exec(pagina)?.[0] ?? 'data-panel'), '  la cola no cuenta para la escena: no es una sección, y recorriéndola el progreso queda en el último nudo (la pose E): Portfolio, la frase, la noche y el amanecer no se mueven')
// [EL ENCASTRE] 2A · cambió por pedido: `fin` ya no es lo recorrido de la cola, tiene su reloj (lo detalla s50 2A).
const reloj = relojQuieto()
pasoDelReloj(reloj, true, 5000, 720, 1 / 60, false)
for (let i = 0; i < 60; i += 1) pasoDelReloj(reloj, true, 5000, 720, 1 / 60, false)
const solo = reloj.fin
pasoDelReloj(reloj, true, 4900, 720, 1 / 60, false)
for (let i = 0; i < 300; i += 1) pasoDelReloj(reloj, true, 4900, 720, 1 / 60, false)
afirmar(solo > 0.1 && reloj.fin === 0, '  `fin` tiene su reloj (EL ENCASTRE 2A): llegado al pie avanza solo, sin scroll, y un gesto hacia arriba lo devuelve a 0', `en 1 s solo: ${solo.toFixed(2)}`)

// La secuencia, en función de `fin`: se acuesta (y la cámara sube) y se encastra. Con `fin` 0, el logo de hoy.
// [EL ENCASTRE] 2B · cambió por pedido: se acuesta EN SU LUGAR (antes, sobre su base: el centro se corría al fondo) y cae
// derecho al piso; cómo se encastra lo afirma s50 (2B, y 2D el hundimiento a presión que reemplaza al rebote).
const tam = { alto: 4.78, espesor: 0.56 }
const pose = { centro: new THREE.Vector3(), rotacionX: 0 }
poseDelLogo(0, tam, pose)
const deHoy = pose.centro.length() < 1e-12 && pose.rotacionX === 0
poseDelLogo(1, tam, pose)
const alFinal = Math.abs(pose.rotacionX + Math.PI / 2) < 1e-12 && pose.centro.x === 0 && pose.centro.z === 0 && pose.centro.y < FLOOR_Y + tam.espesor / 2 + 1e-9
let monotono = true
for (let f = 0; f < 1; f += 0.005) if (acostado(f + 0.005) < acostado(f)) monotono = false
afirmar(deHoy && alFinal && monotono && acostado(1) === 1, 'el logo: con `fin` 0 es el de hoy (sin saltos al engancharse en la pose E); al final está acostado hacia atrás (−90°), sobre el eje (no se corrió) y encastrado en el piso (EL ENCASTRE 2B)')

// La cámara: sin final, intacta; al final, mirando el logo desde arriba (el cenit), sin vuelco; el paso es continuo.
const camara = (): THREE.PerspectiveCamera => {
  const c = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 400)
  c.position.set(0, 5, 40)
  c.lookAt(0, 0, 0)
  c.updateMatrixWorld()
  return c
}
const quieta = camara()
const antesDeTocar = quieta.matrixWorld.clone()
camaraDelFinal(quieta, 0, new THREE.Vector3(0, -4, -2.39), 0, 0, null)
const desdeArriba = camara()
const blanco = new THREE.Vector3(0, FLOOR_Y + 0.28, -2.39)
camaraDelFinal(desdeArriba, 1, blanco, 0, 0, null)
const adelante = desdeArriba.getWorldDirection(new THREE.Vector3())
const alBlanco = blanco.clone().sub(desdeArriba.position).normalize()
const arribaDeLaPantalla = new THREE.Vector3(0, 1, 0).applyQuaternion(desdeArriba.quaternion)
const casiCero = camara()
camaraDelFinal(casiCero, 1e-6, blanco, 0, 0, null)
afirmar(quieta.matrixWorld.equals(antesDeTocar) && adelante.y < -0.99 && adelante.dot(alBlanco) > 0.9999 && arribaDeLaPantalla.z < -0.99 && casiCero.position.distanceTo(new THREE.Vector3(0, 5, 40)) < 1e-3 && Math.abs(desdeArriba.position.distanceTo(blanco) - Math.hypot(5, 40) * FINAL_DEL_PIE.camara.lejos) < 1e-6, 'la cámara: sin final no la toca; al final mira el logo acostado desde arriba (89°: «arriba» en la pantalla es la cabeza del logo, sin vuelco en el cenit) y el paso desde la pose E es continuo', `elevación ${String(FINAL_DEL_PIE.camara.elevacion)}°`)

// Quieto en el pie: gira sin fin y se aleja con tope; al moverse, todo vuelve rápido.
const quieto = { giro: 0, aleja: 0 }
let tQuieto = 0
for (let i = 0; i < 6000; i += 1) tQuieto = relojDelQuieto(tQuieto, true, 99, 0.1, quieto)
const conTope = quieto.aleja <= FINAL_DEL_PIE.quieto.alejaHasta && quieto.aleja > 0.99 * FINAL_DEL_PIE.quieto.alejaHasta && quieto.giro > 2500
for (let i = 0; i < 40; i += 1) relojDelQuieto(tQuieto, false, 0, 0.05, quieto)
const aLos2s = Math.abs(quieto.giro) < 0.02 * 180 && quieto.aleja < 0.02 * FINAL_DEL_PIE.quieto.alejaHasta
for (let i = 0; i < 80; i += 1) relojDelQuieto(tQuieto, false, 0, 0.05, quieto)
afirmar(conTope && aLos2s && quieto.giro === 0 && quieto.aleja === 0 && relojDelQuieto(0, true, 0.5, 0.1, { giro: 0, aleja: 0 }) === 0, 'quieto en el pie (el final entero y sin scroll hace 1,4 s): la cámara gira sin fin y se aleja hacia un tope que nunca pasa (sin perder el logo); al volver a scrollear, el giro (por el camino corto) y el alejamiento vuelven: a los 2 s queda menos del 2 % (aun desde media vuelta) y a los 6 s, cero', `${FINAL_DEL_PIE.quieto.giroGradosS}°/s · tope ${String(FINAL_DEL_PIE.quieto.alejaHasta)} u`)

// El golpe: el piso (la onda del golpe y la vibración), inyectado sin tocar la onda.
// [EL ENCASTRE] 2C · cambió por pedido: la explosión del golpe se fue; las partículas eran el vapor al acostarse.
// [RETOQUE DEL ENCASTRE] 1A · cambió por pedido: el vapor se fue entero; el final no tiene partículas (lo afirma s51 1A).
// [EL ENCASTRE] 2F · cambió por pedido: la vibración debajo del mouse se fue; es el rastro que levanta los bloques (s50 2F).
const simulacion = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const pisoBien = simulacion.includes('float empujeDelGolpe( vec2 xz )') && simulacion.includes(`${ANCLAS_DEL_FINAL.empuje}
	fuerza += empujeDelGolpe( p * uLado ) + empujeDelRastro( p, h );`) && conOndaDirigida(SIMULACION_GLSL).length < simulacion.length
afirmar(pisoBien && !existsSync(`${V3}/_lib/escena/final/vapor.ts`), 'en el piso, la onda del golpe y el rastro del mouse (EL ENCASTRE 2F), sumados por afuera de la onda dirigida; sin partículas (RETOQUE DEL ENCASTRE 1A: el vapor se fue, s51)')
const montaje = sinComentarios(leer('_lib/escena/ProbeStage.tsx'))
const pisoVivo = sinComentarios(leer('_lib/escena/piso/PisoVivo.tsx'))
const armadas = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const cableadoDelFinal = (mo: string): boolean =>
  mo.includes("{calidad === 'plena' && !reducedMotion && <FinalDelPie logoGroupRef={logoGroupRef} stats={stats} />}") &&
  mo.indexOf('<FinalDelPie') > mo.indexOf('<OrbitRig') && mo.indexOf('<FinalDelPie') < mo.indexOf('<Entorno') &&
  pisoVivo.includes('conElFinalEnElPiso(material)') && armadas.includes('d = Math.min(d, profundidadDelFinal(CAMARA_SIN_EL_MOUSE))') && armadas.includes('const sy = scrollDelPie(scrollY)')
afirmar(cableadoDelFinal(montaje), '  el cableado: el final va justo después del rig (le suma el final a su cámara y al logo antes que nadie lo lea), sólo desde 1024 y con movimiento; las piezas del pie se colocan con la cámara del final, adelante del piso, con el scroll en que el pie se pegó')
controlPositivo('el detector VE el final montado también con movimiento reducido', montaje.replace("{calidad === 'plena' && !reducedMotion && <FinalDelPie", "{calidad === 'plena' && <FinalDelPie"), cableadoDelFinal)

cerrar('s49-cierre-final')
