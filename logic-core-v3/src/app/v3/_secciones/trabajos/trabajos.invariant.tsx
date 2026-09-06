/**
 * INVARIANTE — 04 · Trabajos.
 *
 * Corre con `npx tsx src/app/v3/_secciones/trabajos/trabajos.invariant.tsx`.
 *
 * La sección se renderiza DE VERDAD tres veces, en el mismo proceso y sin
 * navegador: rama quieta (la de abajo de 1025), coreografía forzada, y la
 * preferencia de movimiento reducido mandando sobre el modo forzado. Todo se
 * afirma sobre el MARCADO que sale. Las dos ramas están porque cada una sola
 * miente: "abajo de 1025 no se escribe una transformada" pasa en verde si el
 * sistema no anima nunca, y el control es la rama con coreografía.
 *
 * Lo propio de esta sección, además de lo que el lane pide a las cuatro:
 *
 *   · **La métrica nunca está oculta**, ni ella ni ningún ancestro suyo.
 *   · **Cero `three`**, del disco. · **El ritmo**: tres pantallas pinneadas son
 *     UN momento. · **El despinneo.** · **Los pasos = los proyectos** (B1).
 *   · **El acento no puede ser texto**: los hex se LEEN del tema. · **Las tres
 *     capturas** (V3-D): que el ARCHIVO mida la relación declarada.
 *   · **B2 · el reparto de los tres planos** (§15), sobre la función pura.
 *
 * ⚠ Entra en 300 líneas por la regla del lane: los detectores puros viven en
 * `trabajos-piezas.ts`, que es su módulo de apoyo declarado. Donde hubo que
 * elegir se sacaron afirmaciones redundantes y NUNCA controles positivos.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { sizesPorColumnas } from '../../_lib/imagen'
import type { Seccion as EntradaDeSeccion } from '../../_lib/secciones'
import { NOMBRES_REALES } from '../_contrato/escaneo'
import { ATRIBUTO_DE_PANEL } from '../_contrato/forma'
import { cuentaDeMarcadores, hallazgosDeCifraConSimbolo, hallazgosDeDigito, hallazgosDeMarcadorDesconocido, marcadoresPedidos, numerosDe, textosDe } from '../_contrato/marcadores'
import { MarcoDeMedio } from '../_contrato/medios'
import { entradasColgadas } from '../_contrato/pedido'
import { ritmoDe } from '../_contrato/ritmo'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO } from './contenido'
import { CSS, FUENTES, FUENTE_DEL_PANEL, abrirCaptura, sinTres, veces } from './soporte'
import { ancestrosDe, aterrizajesMedidos, capturasConOtraRelacion, capturasQueNoLlegan, coloresDelTema, desviosDelContrato, enlacesConNombreSucio, enlacesFueraDelContenido, metricaVisible, nombresQueNoSonEncabezado, repartoMonotono, separacionMinima, type MedidasDeImagen } from './trabajos-piezas'
import { ATERRIZAJES_DE_LOS_PLANOS, GEOMETRIA, SIZES_DE_LA_CAPTURA, localDelPlano } from './geometria'
import { Trabajos } from './Trabajos'

const seccion = seccionDe('trabajos')

const seccionMontada = <Trabajos seccion={seccion} />

/** La rama de abajo de 1025 — y la misma que produce la preferencia de S2. */
const quieto = marcar(seccionMontada, { anima: false })
/** El control positivo: la coreografía forzada, sin la preferencia. */
const conMotion = marcar(seccionMontada, { anima: true })
/** Y la preferencia mandando sobre el modo forzado. ⚠ DESDE SITIO-S7 la
 *  compuerta se resuelve arriba de las ocho y **la preferencia se lee ahí**:
 *  con ella puesta no se instala una sola primitiva animada, así que lo que esa
 *  persona recibe **es el árbol quieto**. */
const conPreferencia = marcar(seccionMontada, { anima: false, preferencia: 'always' })

const TEXTOS = textosDe(CONTENIDO) // las hojas de texto del contenido, con su ruta
const PROYECTOS = CONTENIDO.proyectos // y sus `enlace`, que §11 compara contra el marcado

/** Los colores del tema invertido, derivados del CSS por el módulo de apoyo. */
const { fondo: FONDO_OSCURO, tinta: TINTA_CLARA, acentos: ACENTOS } = coloresDelTema(CSS)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El alto, la superficie y el pinneo salen de la tabla, no de acá')

afirmarIgual(seccion.superficie, 'oscuro-opaco', 'la superficie es oscuro-opaco: la banda oscura')
afirmarIgual(pantallasDe(seccion), 3, 'ocupa TRES pantallas — la secuencia más larga del lane')
afirmarIgual(seccion.pinneada, 'desde-escritorio', 'y es PINNEADA DESDE 1025: abajo no se clava, y cada proyecto toma su pantalla')
afirmarIgual(veces(quieto, 'data-pinneado="desde-escritorio"'), 1, '  y hay UN solo hijo pinneado en el marcado')
afirmarIgual(veces(quieto, 'escritorio:sticky'), 1, '  con el sticky acotado a la variante de 1025, no suelto')
// La contracara del despinneo: los tres proyectos suman los 300svh declarados.
afirmarIgual(veces(quieto, 'min-h-svh'), GEOMETRIA.planos, '  y los tres proyectos toman una pantalla cada uno abajo del umbral')
afirmarIgual(veces(quieto, 'escritorio:min-h-0'), 3, '    y la sueltan desde 1025, donde el panel sí está clavado')
afirmar(quieto.includes('data-seccion="invertida"'), 'el panel escribe `data-seccion="invertida"`: el tema se da vuelta solo')
/** ⚠ **B1 · LOS TRES `h-full` SE QUEDAN, y que hayan VUELTO a su valor viejo es
 *  la prueba de que el arreglo fue del contrato y no un parche acá.** La versión
 *  intermedia tenía dos: el bloque llevaba `minHeight: seccion.alto` y con el
 *  escenario en 3240 px la grilla quieta no podía colgar de su `h-full`. Con
 *  `anclaje: 'seccion'` vuelve a `min-h-0 flex-1`. */
afirmarIgual(veces(quieto, 'h-full'), 3, 'el alto de escritorio lo ponen los TRES envoltorios encadenados con `h-full`')
afirmarIgual(veces(quieto, 'escritorio:h-svh'), 1, '  y la ÚNICA pantalla pedida arriba de 1025 es la del hijo pinneado')
/** ── 1b · EL PUENTE ENTRE LAS DOS FUENTES DEL ATRIBUTO DEL PANEL (B1). Se
 *  escribe dos veces —`forma.ts` y literal en `Panel.tsx`— porque `s13b-escena`
 *  lo exige literal y está congelado. El modo de falla es mudo: `closest()` de
 *  un atributo inexistente devuelve `null`. */
afirmar(FUENTE_DEL_PANEL.includes(`${ATRIBUTO_DE_PANEL}={seccion.id}`), 'el atributo que `anclaje: "seccion"` busca es el que `Panel.tsx` emite', `${ATRIBUTO_DE_PANEL} — dos fuentes, atadas acá porque el invariante que lo exige literal está congelado`)
controlPositivo('el puente vería a las dos fuentes separadas', 'data-panel-viejo={seccion.id}', (t: string) => t.includes(`${ATRIBUTO_DE_PANEL}={seccion.id}`))

afirmarIgual(seccion.pasosDeLaSecuencia, CONTENIDO.proyectos.length, 'los pasos declarados en la tabla SON los proyectos del contenido: el alto se DERIVA y la igualdad es comprobable')
controlPositivo('la afirmación de los pasos vería una tabla desincronizada', { ...seccion, pasosDeLaSecuencia: 4 }, (s: EntradaDeSeccion) => s.pasosDeLaSecuencia === CONTENIDO.proyectos.length)
controlPositivo('la lectura del alto ve un alto distinto', { ...seccion, alto: '100svh' }, (s: EntradaDeSeccion) => pantallasDe(s) === 3)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El ritmo: la secuencia cuenta como UN momento, no como tres pantallas')

const ritmo = ritmoDe([seccion])
afirmarIgual(ritmo.pantallas, 3, 'tres pantallas nominales')
/** ⚠ CORRECCIÓN DE SITIO-S7: este lane contaba la sección ENTERA como pinneada
 *  (3 de 3); el otro contaba el recorrido del pin (2 de 3), que es el que la
 *  referencia midió (SCROLL.md §4). La derivación: `_contrato/ritmo.ts`. */
afirmarIgual(ritmo.pantallasPinneadas, 2, '  las DOS que consume el pin: 3 de sección menos la pantalla del `sticky`')
afirmarIgual(ritmo.secuencias, 1, '  que es UNA sola secuencia')
afirmarIgual(ritmo.momentos, 2, 'momentos = 3 − 2 + 1 = DOS (SCROLL.md §4 y §6)')
controlPositivo('la cuenta de momentos ve una sección que NO está pinneada', [{ ...seccion, pinneada: undefined }], (ss: readonly EntradaDeSeccion[]) => ritmoDe(ss).momentos === 2)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El contenido no se puede leer como un dato')

afirmar(TEXTOS.length > 0, `el contenido tiene ${TEXTOS.length} textos: la cuenta no es vacía`)
afirmarIgual(hallazgosDeCifraConSimbolo(CONTENIDO).length, 0, 'cero cifras con símbolo')
controlPositivo('el detector de cifras con símbolo ve un +340%', { a: 'vendieron +340% mas' }, (c) => hallazgosDeCifraConSimbolo(c).length === 0)
afirmarIgual(hallazgosDeDigito(CONTENIDO).length, 0, 'cero dígitos, punto')
controlPositivo('el detector de dígitos ve un 12 sin símbolo', { a: '12 proyectos entregados' }, (c) => hallazgosDeDigito(c).length === 0)
afirmarIgual(numerosDe(CONTENIDO).length, 0, 'cero hojas numéricas: nada que el escáner de cadenas no vea')
controlPositivo('el detector de hojas numéricas ve un { clientes: 12 }', { clientes: 12 }, (c) => numerosDe(c).length === 0)
afirmarIgual(hallazgosDeMarcadorDesconocido(CONTENIDO).length, 0, 'cero marcadores fuera del conjunto cerrado')
controlPositivo('el detector de marcadores ve un [METRICA] sin tilde', { a: 'subimos [METRICA]' }, (c) => hallazgosDeMarcadorDesconocido(c).length === 0)
afirmar(CONTENIDO.titular.includes('Tres proyectos') && !/\d/.test(CONTENIDO.titular), 'la única cantidad del contenido va con letras y no con cifra', CONTENIDO.titular)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El marcador que queda se VE, y el que se cerró YA NO')

const pedidos = marcadoresPedidos(CONTENIDO)
afirmarIgual(pedidos, ['[MÉTRICA]'], 'el único marcador que el contenido deja pedido')
const cuenta = cuentaDeMarcadores(CONTENIDO)
afirmarIgual(cuenta.get('[MÉTRICA]'), 3, 'tres métricas pedidas: una por proyecto')
afirmarIgual(cuenta.get('[CAPTURA]'), undefined, 'y CERO capturas pedidas (V3-D): los tres archivos existen, y §13 cuenta las tres imágenes')
afirmarIgual(veces(quieto, '[MÉTRICA]'), 3, 'las tres métricas llegan al marcado de la rama quieta')
afirmarIgual(veces(quieto, 'data-marcador="[CAPTURA]"'), 0, 'y no queda un solo marco de captura vacío')
const todosSeVen = (html: string): boolean => pedidos.every((m) => html.includes(m))
afirmar(todosSeVen(conMotion), 'el marcador también está con la coreografía puesta')
controlPositivo('el chequeo de "el marcador se ve" ve un marcado sin marcadores', '<div>nada</div>', todosSeVen)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los tres nombres reales, literales — y DERIVADOS de la lista')

const NOMBRES = CONTENIDO.proyectos.map((p) => p.nombre)
afirmarIgual(NOMBRES, [...NOMBRES_REALES], 'los del contenido son los de NOMBRES_REALES, en orden')
for (const n of NOMBRES) afirmar(quieto.includes(n) && conMotion.includes(n), `"${n}" aparece literal en las dos ramas`)
controlPositivo('el chequeo de los nombres ve un marcado sin ellos', '<div>tres clientes</div>', (html: string) => NOMBRES.every((n) => html.includes(n)))
afirmarIgual(GEOMETRIA.planos, CONTENIDO.proyectos.length, 'los planos que anima P7 son los proyectos que hay')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Abajo de 1025 el contenido está COMPLETO y no se mueve')

const RUTAS_DE_ARCHIVO = new Set(CONTENIDO.proyectos.map((_, i) => `proyectos[${i}].captura.fuente`))
const TEXTOS_DE_PANTALLA = TEXTOS.filter((h) => !RUTAS_DE_ARCHIVO.has(h.ruta))
afirmarIgual(RUTAS_DE_ARCHIVO.size, 3, 'se eximieron exactamente las TRES rutas de archivo, ni una más')
afirmarIgual(TEXTOS_DE_PANTALLA.filter((h) => !quieto.includes(h.valor)).map((h) => h.ruta), [], 'los textos del contenido llegan enteros a la rama quieta')
controlPositivo('el chequeo de "está completo" ve un marcado al que le falta un texto', '<div>Trabajos</div>', (html: string) => TEXTOS_DE_PANTALLA.every((h) => html.includes(h.valor)))
afirmarIgual(capturasQueNoLlegan(quieto, PROYECTOS), [], '  y las tres capturas llegan, codificadas por el optimizador')
controlPositivo('el detector de capturas ve un marcado sin la ruta codificada', '<img src="/_next/image?url=%2Fotra.webp"/>', (html: string) => capturasQueNoLlegan(html, PROYECTOS).length === 0)
afirmar(!quieto.includes('transform:'), 'la rama quieta no escribe una sola transformada')
afirmar(!quieto.includes('will-change'), '  ni promueve una capa de composición')
afirmar(!conPreferencia.includes('transform:'), 'y con `prefers-reduced-motion` tampoco: la compuerta no instala nada')
controlPositivo('el chequeo de "no hay transformada" ve un style con transform', '<div style="transform:translateY(10%)"></div>', (html: string) => !html.includes('transform:'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · CONTROL POSITIVO — con la compuerta abierta, P7 SÍ escribe transformada')

afirmar(conMotion.includes('transform:'), 'P7 escribe transformada ya en el primer cuadro')
afirmarIgual(veces(conMotion, 'translate3d(0px, 0px, -3000px) scale(0.6)'), 3, '  y los tres planos arrancan en el extremo medido: −3000 de profundidad, escala 0,6')
/** ⚠ **B2 · ERAN TRES Y AHORA SON CUATRO.** La cuarta es el MARCO, que hasta B2
 *  no se animaba: por eso el censo medía el primer aterrizaje recién en
 *  `scrollY` 10200, 1.560 px después de que la sección arranca. Entra con P2 y
 *  su rango cierra antes del pin, así que sigue siendo el plano quieto. */
afirmarIgual(veces(conMotion, 'will-change-transform'), GEOMETRIA.planos + 1, 'son CUATRO piezas: una por proyecto y el marco')
afirmarIgual(veces(conMotion, 'pointer-events:none'), 3, 'y lo que está lejos no es clickeable')
/** ⚠ DESDE SITIO-S7 la perspectiva vive sólo en la rama animada: sin
 *  transformada 3D no hay nada que poner en perspectiva. Su efecto secundario
 *  —crear bloque contenedor— lo cubre `s7-arboles`. */
afirmarIgual(veces(conMotion, 'perspective:1000px'), 1, 'la perspectiva va UNA vez, en el ancestro de los planos')
afirmarIgual(veces(quieto, 'perspective:1000px'), 0, '  y NO en la rama quieta, donde no hay nada que poner en perspectiva')

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · LA MÉTRICA NUNCA ESTÁ OCULTA — ni ella ni ninguno de sus ancestros')

afirmar(ancestrosDe(quieto, '[MÉTRICA]').length > 0, 'la métrica tiene una cadena de ancestros real, no vacía')
afirmar(metricaVisible(quieto), 'ningún ancestro de la métrica lleva hidden, opacity-0 ni sr-only')
afirmarIgual(veces(quieto, 'sr-only'), 0, 'y en toda la sección no hay un solo `sr-only`')
controlPositivo('el chequeo de la métrica ve una métrica escondida en un `sr-only`', '<div class="sr-only"><p>[MÉTRICA]</p></div>', metricaVisible)

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · Cero `three`: el efecto es HTML con perspectiva, no geometría 3D')

for (const { archivo, texto } of FUENTES) afirmar(sinTres(texto), `${archivo} no importa three, @react-three ni drei`)
afirmarIgual(FUENTES.length, 3, 'y se leyeron del disco los TRES archivos que se despachan, no cero — B1: la geometría salió a su archivo y también se despacha')
controlPositivo('el detector ve un import de three', "import * as T from 'three'", sinTres)

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Sobre el oscuro el acento no llega ni a 3:1 — así que no es texto')

afirmarIgual(ACENTOS.length, 3, 'se leyeron los tres acentos de theme-develop.css')
afirmarIgual(FONDO_OSCURO, '#0E0E0E', 'y el fondo de la sección invertida, del mismo archivo')
for (const acento of ACENTOS) {
  const razon = razonDeContraste(acento, FONDO_OSCURO)
  afirmar(razon < 3, `${acento} sobre ${FONDO_OSCURO} da ${razon.toFixed(2)}: no llega a 3:1`)
}
controlPositivo('la cuenta de contraste ve un par que SÍ llega a 3:1', '#FFFFFF', (hex: string) => razonDeContraste(hex, FONDO_OSCURO) < 3)
afirmar(razonDeContraste(TINTA_CLARA, ACENTOS[0]) >= 4.5, `el acento como RELLENO con el papel encima da ${razonDeContraste(TINTA_CLARA, ACENTOS[0]).toFixed(2)}: pasa AA`)
afirmarIgual(veces(quieto, 'text-acento'), 0, 'cero `text-acento` en el marcado')
afirmarIgual(veces(quieto, 'border-acento'), 0, 'y cero `border-acento`: el acento nunca marca un límite')
afirmarIgual(veces(quieto, 'bg-acento'), 3, 'va como relleno, tres veces: una pastilla por métrica')
afirmarIgual(veces(quieto, 'border-borde-fuerte'), 0, 'ya no hay borde punteado (V3-D): el límite lo marca la captura, que ocupa el ancho entero')
const conTamano = (html: string): boolean => /<span[^>]*text-fluido-micro[^>]*>\[MÉTRICA\]/.test(html)
afirmar(conTamano(quieto), 'la pastilla conserva su tamaño micro: el color va afuera para que `tailwind-merge` no se lo coma')
controlPositivo('el chequeo del tamaño ve una métrica a la que `text-tinta` le comió la escala', '<span class="text-tinta">[MÉTRICA]</span>', conTamano)

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · Higiene del lane: color, foco, interactividad y puertas')

afirmarIgual(veces(quieto, 'outline-none'), 0, 'cero `outline-none`: el anillo de foco lo pone el tema')
afirmar(!/#[0-9a-fA-F]{3,8}\b/.test(quieto), 'cero color fuera de los tokens: ni un hex suelto')
afirmar(!/-\[\d+(px|rem)\]/.test(quieto), 'cero px o rem suelto en un valor arbitrario de clase')
controlPositivo('el chequeo del hex ve un hex', '<i style="color:#ff0000">', (html: string) => !/#[0-9a-fA-F]{3,8}\b/.test(html))
controlPositivo('el chequeo del px suelto ve un p-[7px]', '<i class="p-[7px]">', (html: string) => !/-\[\d+(px|rem)\]/.test(html))

const hovers = veces(quieto, 'hover:')
afirmarIgual(hovers, veces(quieto, 'focus-visible:'), 'toda `hover:` tiene su gemela `focus-visible:`')
afirmarIgual(hovers, 0, '  y en esta sección son cero: el énfasis de puntero queda pedido, no escrito suelto')
afirmarIgual(veces(quieto, '<button'), 0, 'cero botones')
afirmarIgual(veces(quieto, '<a '), 3, 'TRES enlaces: uno por proyecto, al sitio en producción')
afirmarIgual(enlacesFueraDelContenido(quieto, PROYECTOS.map((p) => p.enlace)), [], '  y ni un `href` que no salga del contenido: ninguna URL inventada acá')
afirmarIgual(enlacesConNombreSucio(quieto, PROYECTOS), [], '  el nombre accesible de cada uno es el del cliente y nada más: la métrica queda AFUERA')
controlPositivo('el detector ve un enlace inventado', '<a href="https://inventado.example">Esquina</a>', (html: string) => enlacesFueraDelContenido(html, PROYECTOS.map((p) => p.enlace)).length === 0)
controlPositivo('el chequeo de `hover:` sin gemela ve un marcado desparejo', '<i class="hover:opacity-casi">', (html: string) => veces(html, 'hover:') === veces(html, 'focus-visible:'))
const FUENTE = FUENTES[0].texto
afirmarIgual(veces(FUENTE, 'onClick'), 0, 'cero `onClick` en la fuente: ningún div haciendo de botón')
afirmarIgual(veces(FUENTE, 'motion/_componentes'), 0, 'la única puerta a las piezas es `_contrato/piezas`')
controlPositivo('el chequeo de la puerta ve un import directo', "import { Pieza } from '../../motion/_componentes/Pieza'", (src: string) => veces(src, 'motion/_componentes') === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · El árbol de encabezados')

afirmarIgual(veces(quieto, '<h1'), 0, 'ningún h1: el h1 es del Hero')
afirmarIgual(veces(quieto, '<h2'), 1, 'exactamente UN h2 — el titular de la sección')
afirmarIgual(veces(quieto, '<h3'), 3, 'y tres h3: uno por proyecto')
afirmarIgual(veces(conMotion, '<h3'), 3, '  también con la coreografía: los tres planos existen igual')
afirmarIgual(nombresQueNoSonEncabezado(quieto, NOMBRES), [], 'los tres nombres son un h3 con su enlace adentro')
controlPositivo('el detector ve un nombre enlazado que NO es encabezado', '<p><a href="https://esquinaweb.com.ar">Esquina</a></p>', (html: string) => nombresQueNoSonEncabezado(html, NOMBRES).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('13 · Las capturas: relación de aspecto y `sizes`, sobre el marcado')

afirmarIgual(veces(quieto, `width="${GEOMETRIA.captura.ancho}" height="${GEOMETRIA.captura.alto}"`), 3, 'las tres imágenes declaran sus dimensiones EN EL MARCADO')
controlPositivo('el chequeo de las dimensiones ve una imagen sin ellas', '<img src="/a.webp"/>', (html: string) => html.includes(`width="${GEOMETRIA.captura.ancho}"`))
const DECLARADA: MedidasDeImagen = { ancho: GEOMETRIA.captura.ancho, alto: GEOMETRIA.captura.alto }
afirmarIgual(capturasConOtraRelacion(PROYECTOS, DECLARADA, abrirCaptura), [], '  y los tres ARCHIVOS miden lo declarado: sin esto el salto de layout vuelve en silencio')
controlPositivo('el detector ve un archivo de otra relación', { ...DECLARADA, alto: DECLARADA.alto + 1 }, (d: MedidasDeImagen) => capturasConOtraRelacion(PROYECTOS, d, abrirCaptura).length === 0)
afirmar(SIZES_DE_LA_CAPTURA.trim().length > 0, 'el `sizes` no es vacío', SIZES_DE_LA_CAPTURA)
afirmarIgual(SIZES_DE_LA_CAPTURA, sizesPorColumnas(GEOMETRIA.captura.columnasDelPlano, GEOMETRIA.captura.columnasDeLaGrilla, GEOMETRIA.captura.completo), '  y está ARMADO con el ayudante de _lib/imagen, no escrito a mano. ⚠ B1: sale de las COLUMNAS del plano (2 de 3 = 67vw) y no de un porcentaje escrito. Describe la caja de la rama ANIMADA — la quieta de escritorio muestra 1 de 3 y baja el doble de lo que necesita: sobre-pedir cuesta bytes, sub-pedir sirve una captura borrosa a la mayoría')

/** El `sizes` sobre el marcado REAL: demuestra descriptores de ANCHO. */
afirmarIgual(veces(quieto, `sizes="${SIZES_DE_LA_CAPTURA}"`), 3, 'las tres imágenes emiten el `sizes` en el HTML')
afirmar(quieto.includes('w"') && !quieto.includes('2x'), '  y su srcset usa descriptores de ANCHO')
controlPositivo('el chequeo del srcset ve descriptores de densidad', '<img srcSet="/a.jpg 1x, /b.jpg 2x"/>', (html: string) => html.includes('w"') && !html.includes('2x'))

/** Y el marco SIGUE teniendo su rama de hueco: el día que una captura se caiga
 *  vuelve el marcador con su relación de aspecto, y no una imagen rota. */
const sinArchivo = renderToStaticMarkup(
  <MarcoDeMedio marcador="[CAPTURA]" fuente={null} alt={CONTENIDO.proyectos[0].captura.alt} ancho={GEOMETRIA.captura.ancho} alto={GEOMETRIA.captura.alto} sizes={SIZES_DE_LA_CAPTURA} />,
)
afirmar(sinArchivo.includes('[CAPTURA]') && sinArchivo.includes(`aspect-ratio:${GEOMETRIA.captura.ancho} / ${GEOMETRIA.captura.alto}`), 'la rama sin archivo sigue viva: marcador y relación de aspecto, no una imagen rota')

// ═══════════════════════════════════════════════════════════════════════════
titulo('14 · El pedido y el patrón declarado')

afirmar(PEDIDO.length > 0, `el pedido tiene ${PEDIDO.length} entradas: no es una lista vacía`)
afirmarIgual(entradasColgadas(CONTENIDO, PEDIDO).map((e) => e.ruta), [], 'ninguna apunta a una ruta que no existe')
controlPositivo('el chequeo de entradas colgadas ve una ruta inventada', [{ ruta: 'proyectos[3].nombre', clase: 'prosa' as const, marcador: null, quienLoTrae: 'valentino' as const, que: 'nada', formato: 'texto plano' }], (p) => entradasColgadas(CONTENIDO, p).length === 0)
afirmarIgual([...new Set(PEDIDO.map((e) => e.clase))].sort(), ['metrica', 'prosa'], 'el pedido cubre las DOS clases que esta sección deja pedidas: la de `captura` se cerró')
afirmarIgual(PEDIDO.filter((e) => e.marcador !== null).length, 3, '  tres con marcador visible: las tres métricas, y ninguna captura')
afirmarIgual(PEDIDO.filter((e) => e.ruta.includes('captura')).map((e) => e.ruta), [], '  y no queda una sola entrada pidiendo algo de las capturas: llenar una casilla la SACA de la lista')
afirmar(PEDIDO.every((e) => e.formato.length > 0), '  y todas dicen en qué formato entra el dato')
afirmarIgual(PATRONES_DE_LA_SECCION, ['P7'], 'la tabla de `contenido.ts` declara P7, y nada más')
const patronesDelFuente = [...new Set([...FUENTE.matchAll(/patron="(P\d)"/g)].map((m) => m[1]))].sort()
afirmarIgual(patronesDelFuente, ['P2', 'P7'], '  y el componente consume DOS: P7 para los planos y P2 para el marco (B2)')
console.log(
  '  ⚠️ DESINCRONIZACIÓN REPORTADA, NO ARREGLADA [dueño: `trabajos/contenido.ts`] — `PATRONES_DE_LA_SECCION` sigue diciendo ' +
    'sólo P7. `contenido.ts` está FUERA del scope del frente B de B2 (regla 3 de la instrucción: el contenido no se toca), así que ' +
    'la tabla queda vieja y las dos afirmaciones de arriba dejan la diferencia a la vista en vez de esconderla en un igual que mienta.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('15 · B2 · El reparto de los tres planos: cada proyecto, su tercio del scroll')

const ATERRIZAJES = aterrizajesMedidos(localDelPlano, GEOMETRIA.planos)
afirmarIgual(ATERRIZAJES, [...ATERRIZAJES_DE_LOS_PLANOS], 'los tres planos dejan de cambiar en 1/3, 2/3 y 1 del recorrido — con el escalonado de P7 haciendo el reparto terminaban en 0,814 · 0,907 · 1, amontonados en las últimas dos décimas, y el censo los leía como DOS grupos pegados al final')
afirmar(separacionMinima(ATERRIZAJES) >= 1 / GEOMETRIA.planos - 1e-9, 'y entre dos aterrizajes hay al menos un tercio del recorrido', separacionMinima(ATERRIZAJES).toFixed(6))
afirmar(repartoMonotono(localDelPlano, GEOMETRIA.planos), 'ningún plano retrocede: uno que volviera atrás se desarmaría solo mientras el visitante baja')
afirmarIgual(desviosDelContrato(localDelPlano, GEOMETRIA.planos), [], 'y el plano vigente lee el MISMO `local` que `tramoDeSecuencia` del contrato: es la secuencia de Servicios, no una copia parecida')
controlPositivo('el detector ve un reparto que NO separa: con los tres leyendo el progreso entero, los tres terminan en el mismo punto', (p: number) => p, (r: (p: number, i: number) => number) => separacionMinima(aterrizajesMedidos(r, GEOMETRIA.planos)) >= 1 / GEOMETRIA.planos - 1e-9)
controlPositivo('  y ve un reparto que retrocede', (p: number) => 1 - p, (r: (p: number, i: number) => number) => repartoMonotono(r, GEOMETRIA.planos))

cerrar('trabajos.invariant')
