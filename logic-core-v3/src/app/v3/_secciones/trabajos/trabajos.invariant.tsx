/**
 * INVARIANTE — 04 · Trabajos.
 *
 * Corre con `npx tsx src/app/v3/_secciones/trabajos/trabajos.invariant.tsx`.
 *
 * La sección se renderiza DE VERDAD tres veces, en el mismo proceso y sin
 * navegador: rama quieta (abajo de 1025), coreografía forzada, y movimiento
 * reducido mandando sobre el modo forzado. Todo se afirma sobre el MARCADO que
 * sale. Las dos ramas están porque cada una sola miente: "abajo de 1025 no se
 * escribe una transformada" pasa en verde si el sistema no anima nunca.
 *
 * Lo propio de esta sección, además de lo que el lane pide a las cuatro:
 *
 *   · **La métrica nunca está oculta**, ni ella ni ningún ancestro suyo.
 *   · **Cero `three`**, del disco. · **Los pasos = los proyectos** (B1).
 *   · **El acento no puede ser texto**: los hex se LEEN del tema.
 *
 * ⚠ Entra en 300 líneas por la regla del lane: los detectores puros viven en
 * `trabajos-piezas.ts` y el arnés en `soporte.ts`. Donde hubo que elegir se
 * sacaron afirmaciones redundantes y NUNCA controles positivos.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import type { Seccion as EntradaDeSeccion } from '../../_lib/secciones'
import { NOMBRES_REALES } from '../_contrato/escaneo'
import { ATRIBUTO_DE_PANEL } from '../_contrato/forma'
import { cuentaDeMarcadores, marcadoresPedidos, textosDe } from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'
import { seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO, ROTULO_DE_SECCION_RETIRADO } from './contenido'
import { afirmarQueElContenidoNoEsUnDato, conLaLlaveApagada } from '../_invariantes/llave'
import { CSS, FUENTES, FUENTE_DE_LA_COMPOSICION, FUENTE_DEL_PANEL, sinTres, veces } from './soporte'
import { ancestrosDe, capturasQueNoLlegan, coloresDelTema, enlacesConNombreSucio, enlacesFueraDelContenido, metricaVisible, nombresQueNoSonEncabezado } from './trabajos-piezas'
import { GEOMETRIA } from './geometria'
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
// ── 1b · EL PUENTE ENTRE LAS DOS FUENTES DEL ATRIBUTO DEL PANEL (B1). Se
// escribe dos veces —`forma.ts` y literal en `Panel.tsx`— porque `s13b-escena`
// lo exige literal y está congelado. El modo de falla es mudo: `closest()` de
// un atributo inexistente devuelve `null`.
titulo('1 · El puente del atributo del panel, y los pasos declarados')

afirmar(FUENTE_DEL_PANEL.includes(`${ATRIBUTO_DE_PANEL}={seccion.id}`), 'el atributo que `anclaje: "seccion"` busca es el que `Panel.tsx` emite', `${ATRIBUTO_DE_PANEL} — dos fuentes, atadas acá porque el invariante que lo exige literal está congelado`)
controlPositivo('el puente vería a las dos fuentes separadas', 'data-panel-viejo={seccion.id}', (t: string) => t.includes(`${ATRIBUTO_DE_PANEL}={seccion.id}`))

afirmarIgual(seccion.pasosDeLaSecuencia, CONTENIDO.proyectos.length, 'los pasos declarados en la tabla SON los proyectos del contenido: el alto se DERIVA y la igualdad es comprobable')
controlPositivo('la afirmación de los pasos vería una tabla desincronizada', { ...seccion, pasosDeLaSecuencia: 4 }, (s: EntradaDeSeccion) => s.pasosDeLaSecuencia === CONTENIDO.proyectos.length)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El contenido no se puede leer como un dato')

/** ⚠️ B12 §4 · esta sección muestra contenido INVENTADO; todo se afirma sobre
 *  estas vistas con la llave apagada. El porqué, en `_invariantes/llave.ts`. */
const { SIN_LLAVE, quietoSinLlave, animadoSinLlave } = conLaLlaveApagada(CONTENIDO, quieto, conMotion)

afirmar(TEXTOS.length > 0, `el contenido tiene ${TEXTOS.length} textos: la cuenta no es vacía`)
afirmarQueElContenidoNoEsUnDato(CONTENIDO, SIN_LLAVE)
afirmar(CONTENIDO.titular.includes('Tres proyectos') && !/\d/.test(CONTENIDO.titular), 'la única cantidad del contenido va con letras y no con cifra', CONTENIDO.titular)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El marcador que queda se VE, y el que se cerró YA NO')

const pedidos = marcadoresPedidos(SIN_LLAVE)
afirmarIgual(pedidos, ['[MÉTRICA]'], 'el único marcador que el contenido deja pedido')
const cuenta = cuentaDeMarcadores(SIN_LLAVE)
afirmarIgual(cuenta.get('[MÉTRICA]'), 3, 'tres métricas pedidas: una por proyecto')
afirmarIgual(cuenta.get('[CAPTURA]'), undefined, 'y CERO capturas pedidas (V3-D): los tres archivos existen, y §13 cuenta las tres imágenes')
afirmarIgual(veces(quietoSinLlave, '[MÉTRICA]'), 3, 'las tres métricas llegan al marcado de la rama quieta')
afirmarIgual(veces(quieto, 'data-marcador="[CAPTURA]"'), 0, 'y no queda un solo marco de captura vacío')
const todosSeVen = (html: string): boolean => pedidos.every((m) => html.includes(m))
afirmar(todosSeVen(animadoSinLlave), 'el marcador también está con la coreografía puesta')
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
afirmar(!quieto.includes(ROTULO_DE_SECCION_RETIRADO), `y el RÓTULO DE SECCIÓN («${ROTULO_DE_SECCION_RETIRADO}») ya NO se lee: el título toma su lugar (B12, regla 15 — la cadena no se borra, se da vuelta)`)
controlPositivo('el chequeo de "está completo" ve un marcado al que le falta un texto', '<div>Trabajos</div>', (html: string) => TEXTOS_DE_PANTALLA.every((h) => html.includes(h.valor)))
afirmarIgual(capturasQueNoLlegan(quieto, PROYECTOS), [], '  y las tres capturas llegan, codificadas por el optimizador')
controlPositivo('el detector de capturas ve un marcado sin la ruta codificada', '<img src="/_next/image?url=%2Fotra.webp"/>', (html: string) => capturasQueNoLlegan(html, PROYECTOS).length === 0)
afirmar(!quieto.includes('transform:'), 'la rama quieta no escribe una sola transformada')
afirmar(!quieto.includes('will-change'), '  ni promueve una capa de composición')
afirmar(!conPreferencia.includes('transform:'), 'y con `prefers-reduced-motion` tampoco: la compuerta no instala nada')
controlPositivo('el chequeo de "no hay transformada" ve un style con transform', '<div style="transform:translateY(10%)"></div>', (html: string) => !html.includes('transform:'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · LA MÉTRICA NUNCA ESTÁ OCULTA — ni ella ni ninguno de sus ancestros')

afirmar(ancestrosDe(quietoSinLlave, '[MÉTRICA]').length > 0, 'la métrica tiene una cadena de ancestros real, no vacía')
afirmar(metricaVisible(quietoSinLlave), 'ningún ancestro de la métrica lleva hidden, opacity-0 ni sr-only')
afirmarIgual(veces(quieto, 'sr-only'), 0, 'y en toda la sección no hay un solo `sr-only`')
controlPositivo('el chequeo de la métrica ve una métrica escondida en un `sr-only`', '<div class="sr-only"><p>[MÉTRICA]</p></div>', metricaVisible)

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · Cero `three`: el efecto es HTML con perspectiva, no geometría 3D')

for (const { archivo, texto } of FUENTES) afirmar(sinTres(texto), `${archivo} no importa three, @react-three ni drei`)
afirmarIgual(FUENTES.length, 7, `y se leyeron del disco los SIETE archivos que se despachan, no cero — B1 sacó la geometría, B4-A el asentamiento y B12 las piezas y la gota: ${FUENTES.map((f) => f.archivo).join(' · ')}`)
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
afirmarIgual(veces(quieto, 'bg-acento'), CONTENIDO.proyectos.length + veces(quieto, 'data-pieza="prefijo-de-servicio"'), `va como RELLENO ${veces(quieto, 'bg-acento')} veces: una pastilla por métrica (${CONTENIDO.proyectos.length}) más el prefijo de la marca del rótulo (B4-A), y ninguna otra`)
afirmarIgual(veces(quieto, 'border-borde-fuerte'), 0, 'ya no hay borde punteado (V3-D): el límite lo marca la captura, que ocupa el ancho entero')
const conTamano = (html: string): boolean => /<span[^>]*text-fluido-micro[^>]*>\[MÉTRICA\]/.test(html)
afirmar(conTamano(quietoSinLlave), 'la pastilla conserva su tamaño micro: el color va afuera para que `tailwind-merge` no se lo coma')
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
const FUENTE = FUENTE_DE_LA_COMPOSICION
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
titulo('14 · El pedido y el patrón declarado')

afirmar(PEDIDO.length > 0, `el pedido tiene ${PEDIDO.length} entradas: no es una lista vacía`)
afirmarIgual(entradasColgadas(CONTENIDO, PEDIDO).map((e) => e.ruta), [], 'ninguna apunta a una ruta que no existe')
controlPositivo('el chequeo de entradas colgadas ve una ruta inventada', [{ ruta: 'proyectos[3].nombre', clase: 'prosa' as const, marcador: null, quienLoTrae: 'valentino' as const, que: 'nada', formato: 'texto plano' }], (p) => entradasColgadas(CONTENIDO, p).length === 0)
afirmarIgual([...new Set(PEDIDO.map((e) => e.clase))].sort(), ['metrica', 'prosa'], 'el pedido cubre las DOS clases que esta sección deja pedidas: la de `captura` se cerró')
afirmarIgual(PEDIDO.filter((e) => e.marcador !== null).length, 3, '  tres con marcador visible: las tres métricas, y ninguna captura')
afirmarIgual(PEDIDO.filter((e) => e.ruta.includes('captura')).map((e) => e.ruta), [], '  y no queda una sola entrada pidiendo algo de las capturas: llenar una casilla la SACA de la lista')
afirmar(PEDIDO.every((e) => e.formato.length > 0), '  y todas dicen en qué formato entra el dato')
/** ✅ **B4-A · LA DESINCRONIZACIÓN, CERRADA.** B2 no podía tocar `contenido.ts` y
 *  publicó las dos cifras por separado con su dueño; hoy la tabla dice las dos y
 *  la publicación vuelve a ser UNA afirmación de igualdad. */
const patronesDelFuente = [...new Set([...FUENTE.matchAll(/patron="(P\d)"/g)].map((m) => m[1]))].sort()
// ⚠️ B12 · UN SOLO PATRÓN: el MARCO con P2 dejó de estar arriba y pasó a ser la
// PORTADA, el plano de índice −1 del mismo reparto (P7). La igualdad se conserva.
afirmarIgual(patronesDelFuente, ['P7'], 'el componente consume UN patrón: P7, para los tres planos y para la portada (B12)')
afirmarIgual([...PATRONES_DE_LA_SECCION].sort(), patronesDelFuente, '  y `PATRONES_DE_LA_SECCION` de `contenido.ts` dice exactamente los mismos: la tabla dejó de estar vieja')

cerrar('trabajos.invariant')
