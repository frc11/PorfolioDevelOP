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
import { paradasDeTabulacion } from '../../_lib/__tests__/s10-lectura'
import { NOMBRES_REALES } from '../_contrato/escaneo'
import { ATRIBUTO_DE_PANEL } from '../_contrato/forma'
import { MARCADORES, cuentaDeMarcadores, marcadoresPedidos, textosDe } from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'
import { seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO, ROTULO_DE_SECCION_RETIRADO } from './contenido'
import { afirmarQueElContenidoNoEsUnDato, conLaLlaveApagada } from '../_invariantes/llave'
import { CSS, FUENTES, FUENTE_DE_LA_COMPOSICION, FUENTE_DEL_PANEL, afirmarElTunel, afirmarLasCuatroEntradas, sinTres, sumaDeLosTramos, veces } from './soporte'
import { coloresDelTema, enlacesConNombreSucio, enlacesFueraDelContenido, nombresQueNoSonEncabezado } from './trabajos-piezas'
import {
  DESTINO_DEL_CTA,
  PX_DE_LA_SECCION,
  DISPARO_DE_LA_NOCHE,
} from './geometria'
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

/**
 * ⚠️ **EL ALTO DE LA SECCIÓN DEJÓ DE SALIR DEL CONTENIDO Y SALE DEL RECORRIDO.**
 *
 * Decía «los pasos son los proyectos» y era cierto cuando la sección mostraba una
 * pantalla por cliente. Con el túnel de zoom eso se cayó: **cuánto scroll pide el
 * tramo sale del ritmo relativo, del tamaño de nacimiento y del relevo**, y no de
 * cuántos clientes hay. La igualdad vieja se habría vuelto una mentira cómoda.
 *
 * Lo que la reemplaza es más fuerte, no más débil: la suma de los cinco tramos
 * —cartel, túnel, CTA, levantada y demos— tiene que ENTRAR en el alto declarado,
 * y el sobrante tiene que ser el tramo de demos y no un hueco anónimo.
 */
afirmar(
  sumaDeLosTramos(CONTENIDO.proyectos.length) <= PX_DE_LA_SECCION,
  `los cinco tramos entran en el alto declarado: piden ${sumaDeLosTramos(CONTENIDO.proyectos.length).toFixed(0)} px de los ${PX_DE_LA_SECCION} que dan las ${seccion.pasosDeLaSecuencia ?? 0} pantallas`,
)
controlPositivo(
  'la cuenta del alto vería una sección de tres pantallas, que es la que tenía',
  3 * 900,
  (px: number) => sumaDeLosTramos(CONTENIDO.proyectos.length) <= px,
)
// ⚠️ La conversión ya no es una ventana de progreso —corre por tiempo— así que
// lo único que queda por afirmar acá es la HISTÉRESIS: las dos líneas existen, son
// distintas y sueltan más abajo de donde prenden.
afirmar(DISPARO_DE_LA_NOCHE.vuelta > DISPARO_DE_LA_NOCHE.ida, `las dos líneas del disparo son distintas y la de soltar va DEBAJO de la de prender: recorte ${DISPARO_DE_LA_NOCHE.ida} % para prender, ${DISPARO_DE_LA_NOCHE.vuelta} % para soltar`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El contenido no se puede leer como un dato')

/** ⚠️ B12 §4 · esta sección muestra contenido INVENTADO; todo se afirma sobre
 *  estas vistas con la llave apagada. El porqué, en `_invariantes/llave.ts`. */
const { SIN_LLAVE, quietoSinLlave, animadoSinLlave } = conLaLlaveApagada(CONTENIDO, quieto, conMotion)

afirmar(TEXTOS.length > 0, `el contenido tiene ${TEXTOS.length} textos: la cuenta no es vacía`)
afirmarQueElContenidoNoEsUnDato(CONTENIDO, SIN_LLAVE)
afirmar(CONTENIDO.titular.length > 0 && !/\d/.test(CONTENIDO.titular), 'el titular existe y no lleva una sola cifra', CONTENIDO.titular)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · ⚠️ NO QUEDA UN SOLO PEDIDO: la sección se completó')

/**
 * ⚠️ **TRABAJOS ES LA PRIMERA SECCIÓN QUE NO DEBE NADA, y por eso todas estas
 * cifras son cero.**
 *
 * Tenía nueve casillas abiertas: seis medios —`[LOGO]` × 3 y `[CAPTURA]` × 3— y
 * tres rubros —`[TEXTO]` × 3—. Llegaron los seis archivos a `public/capturas/` y
 * una carpeta de logos que ya se borró, y el dueño dictó los tres rubros. **Una casilla que se llena
 * SALE de la lista**, así que el contenido ya no emite un solo marcador y
 * `PEDIDO` quedó vacío.
 *
 * Las cifras se afirman en CERO y no se borran: un cero afirmado dice «esto se
 * completó», y una comprobación borrada no dice nada. Si mañana vuelve un
 * marcador acá, esto se pone rojo.
 */
const pedidos = marcadoresPedidos(SIN_LLAVE)
afirmarIgual([...pedidos].sort(), [], 'el contenido no deja NINGÚN marcador pedido: los seis archivos llegaron y los tres rubros los dictó el dueño')
const cuenta = cuentaDeMarcadores(SIN_LLAVE)
afirmarIgual([cuenta.get('[MÉTRICA]'), cuenta.get('[LOGO]'), cuenta.get('[CAPTURA]'), cuenta.get('[TEXTO]')], [undefined, undefined, undefined, undefined], '  ni métrica, ni logo, ni captura, ni rubro: las cuatro clases cerradas')
afirmarIgual(MARCADORES.filter((m: string) => quietoSinLlave.includes(m)), [], '  y ni uno del vocabulario cerrado llega al marcado de la rama quieta')
afirmarIgual(MARCADORES.filter((m: string) => animadoSinLlave.includes(m)), [], '  ni al de la rama animada: las dos ramas cerraron las mismas casillas, que es lo que hace que no haya un hueco visible en un solo ancho')
afirmarIgual(veces(quieto, 'data-medio="marcador"'), 0, 'cero marcos vacíos en la rama quieta: donde había un hueco punteado hay una imagen')
afirmarIgual(veces(conMotion, 'data-medio="placeholder"'), 0, '  y cero provisionales con la coreografía puesta: el rayado se fue con los archivos reales')

titulo('5 · Los tres nombres reales, literales — y DERIVADOS de la lista')

const NOMBRES = CONTENIDO.proyectos.map((p) => p.nombre)
afirmarIgual(NOMBRES_REALES.filter((real) => !NOMBRES.some((n) => n.includes(real))), [], 'cada nombre de NOMBRES_REALES está adentro de un nombre del contenido: la lista sigue gobernando aunque la marca se escriba entera')
for (const n of NOMBRES) afirmar(quieto.includes(n) && conMotion.includes(n), `"${n}" aparece literal en las dos ramas`)
controlPositivo('el chequeo de los nombres ve un marcado sin ellos', '<div>tres clientes</div>', (html: string) => NOMBRES.every((n) => html.includes(n)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Abajo de 1025 el contenido está COMPLETO y no se mueve')

const RUTAS_DE_ARCHIVO = new Set(TEXTOS.filter((h) => h.valor.startsWith('/')).map((h) => h.ruta))
const TEXTOS_DE_PANTALLA = TEXTOS.filter((h) => !RUTAS_DE_ARCHIVO.has(h.ruta))
// ⚠️ Ahora SÍ hay rutas de archivo en el contenido —las seis, reales— y por eso
// se eximen de «todo texto llega a la pantalla»: una ruta no es algo que se lea.
afirmarIgual(RUTAS_DE_ARCHIVO.size, 3, 'las TRES rutas de archivo del contenido se eximen del censo de texto: un `/capturas/...` no es algo que alguien lea en pantalla')
afirmarIgual(TEXTOS_DE_PANTALLA.filter((h) => !quieto.includes(h.valor)).map((h) => h.ruta), [], 'los textos del contenido llegan enteros a la rama quieta')
afirmar(!quieto.includes(ROTULO_DE_SECCION_RETIRADO), `y el RÓTULO DE SECCIÓN («${ROTULO_DE_SECCION_RETIRADO}») ya NO se lee: el título toma su lugar (B12, regla 15 — la cadena no se borra, se da vuelta)`)
controlPositivo('el chequeo de "está completo" ve un marcado al que le falta un texto', '<div>Trabajos</div>', (html: string) => TEXTOS_DE_PANTALLA.every((h) => html.includes(h.valor)))
// ⚠️ Las TRES capturas llegan a las dos ramas, y es lo correcto: abajo de 1025 la
// sección es una lista de trabajos, y una lista de trabajos sin las capturas no
// es la misma información con otro ritmo, es menos.
afirmarIgual(veces(quieto, '<img'), 3, 'las TRES capturas reales llegan a la rama quieta: una por proyecto, y ninguna más')
afirmarIgual(veces(conMotion, '<img'), 3, '  y las mismas tres con la coreografía puesta: el túnel muestra la misma imagen que la lista, con otro gesto')
afirmar(!quieto.includes('transform:'), 'la rama quieta no escribe una sola transformada')
afirmar(!quieto.includes('will-change'), '  ni promueve una capa de composición')
afirmar(!conPreferencia.includes('transform:'), 'y con `prefers-reduced-motion` tampoco: la compuerta no instala nada')
controlPositivo('el chequeo de "no hay transformada" ve un style con transform', '<div style="transform:translateY(10%)"></div>', (html: string) => !html.includes('transform:'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Nada de la sección se lee por un lector y no por un ojo')

// ⚠️ Era «LA MÉTRICA NUNCA ESTÁ OCULTA». La métrica se fue (PORTFOLIO) y con
// ella su comprobación: lo que sobrevive es la mitad que no era de la métrica
// —que en esta sección no hay texto escondido— y esa sigue corriendo.
afirmarIgual(veces(quieto, 'sr-only'), 0, 'en toda la sección no hay un solo `sr-only`')
controlPositivo('el chequeo del `sr-only` ve uno donde lo hay', '<div class="sr-only"><p>algo</p></div>', (html: string) => veces(html, 'sr-only') === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · Cero `three`: el efecto es HTML con perspectiva, no geometría 3D')

for (const { archivo, texto } of FUENTES) afirmar(sinTres(texto), `${archivo} no importa three, @react-three ni drei`)
afirmarIgual(FUENTES.length, 10, `y se leyeron del disco los DIEZ archivos del lane, no cero — B1 sacó la geometría, B4-A el asentamiento, B12 las piezas y la gota, y PORTFOLIO el trabajo y el túnel: ${FUENTES.map((f) => f.archivo).join(' · ')}`)
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
afirmarIgual(veces(quieto, 'bg-acento'), veces(quieto, 'data-pieza="prefijo-de-servicio"'), `va como RELLENO ${veces(quieto, 'bg-acento')} veces: sólo el prefijo de la marca del rótulo (B4-A). Las tres pastillas de métrica se fueron y con ellas el único otro uso`)
// ⚠️ Cero: el borde punteado era del marco PROVISIONAL, y ya no hay ninguno. La
// medición del token (4,62:1 sobre el oscuro) queda en el historial; lo que se
// afirma hoy es que no queda un hueco punteado en la sección.
afirmarIgual(veces(quieto, 'border-borde-fuerte'), 0, 'cero bordes punteados: no queda un marco provisional en la sección')

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · Higiene del lane: color, foco, interactividad y puertas')

afirmarIgual(veces(quieto, 'outline-none'), 0, 'cero `outline-none`: el anillo de foco lo pone el tema')
afirmar(!/#[0-9a-fA-F]{3,8}\b/.test(quieto), 'cero color fuera de los tokens: ni un hex suelto')
afirmar(!/-\[\d+(px|rem)\]/.test(quieto), 'cero px o rem suelto en un valor arbitrario de clase')
controlPositivo('el chequeo del hex ve un hex', '<i style="color:#ff0000">', (html: string) => !/#[0-9a-fA-F]{3,8}\b/.test(html))
// ⚠️ La clase de prueba se ARMA y no se escribe: el escaneo de Tailwind 4 lee
// este archivo —comentarios incluidos— y una clase arbitraria deletreada entera
// se emite como regla real, capaz de romper el build apuntando a `globals.css`.
// Es la regla del CLAUDE.md, y acá estaba escrita entera desde antes.
const CLASE_DE_PRUEBA = 'p-' + '[' + '7px' + ']'
controlPositivo('el chequeo del px suelto ve una clase con un valor en px', `<i class="${CLASE_DE_PRUEBA}">`, (html: string) => !/-\[\d+(px|rem)\]/.test(html))

const hovers = veces(quieto, 'hover:')
afirmarIgual(hovers, veces(quieto, 'focus-visible:'), 'toda `hover:` tiene su gemela `focus-visible:`')
afirmarIgual(hovers, 0, '  y en esta sección son cero: el énfasis de puntero queda pedido, no escrito suelto')
afirmarIgual(veces(quieto, '<button'), 0, 'cero botones')
// ⚠️ SEIS, y son DOS por proyecto a propósito. Eran cuatro —nombre, rubro, logo
// y captura—: el logo se fue con el rediseño del tramo y el rubro dejó de ser
// ancla, porque tres paradas seguidas al mismo destino se anuncian tres veces
// igual. Quedan las dos que hacen falta: el nombre, que es lo que se lee, y la
// captura, que es lo que se ve. La de la imagen declara su `aria-label`.
afirmarIgual(veces(quieto, '<a '), 7, 'SIETE enlaces: el nombre y la captura de cada proyecto, más el CTA del final')
afirmarIgual(veces(quieto, 'rel="noopener noreferrer"'), 6, '  los SEIS que salen del sitio abren afuera sin darle acceso a esta ventana ni el referente — el séptimo es el CTA, que lleva adentro')
afirmarIgual(veces(conMotion, '<a '), 7, '  y los mismos siete con la coreografía puesta: el recorrido de teclado no cambia con el ancho')
afirmarIgual(enlacesFueraDelContenido(quieto, [...PROYECTOS.map((p) => p.enlace), DESTINO_DEL_CTA]), [], '  y ni un `href` que no salga del contenido o de la tabla de navegación: ninguna URL inventada acá')
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

// ⚠️ VACÍO, y es lo que se afirma: la sección se completó. Decía «no es una lista
// vacía» cuando todavía faltaban nueve cosas.
afirmarIgual(PEDIDO.length, 0, 'el pedido está vacío: no queda una sola casilla abierta en esta sección')
afirmarIgual(entradasColgadas(CONTENIDO, PEDIDO).map((e) => e.ruta), [], 'ninguna apunta a una ruta que no existe')
controlPositivo('el chequeo de entradas colgadas ve una ruta inventada', [{ ruta: 'proyectos[3].nombre', clase: 'prosa' as const, marcador: null, quienLoTrae: 'valentino' as const, que: 'nada', formato: 'texto plano' }], (p) => entradasColgadas(CONTENIDO, p).length === 0)
afirmarIgual([...new Set(PEDIDO.map((e) => e.clase))].sort(), [], '  y por lo tanto no cubre ninguna clase')
afirmarIgual(PEDIDO.filter((e) => e.marcador !== null).length, 0, '  ni una con marcador visible: no hay hueco que mostrar')
afirmarIgual(PEDIDO.filter((e) => e.ruta === 'titular' || e.ruta === 'bajada').map((e) => e.ruta), [], '  y ni el titular ni la bajada siguen pedidos: llegaron dictados, y llenar una casilla la SACA de la lista')
afirmar(PEDIDO.every((e) => e.formato.length > 0), '  y todas dicen en qué formato entra el dato')
/** ✅ **B4-A · LA DESINCRONIZACIÓN, CERRADA.** B2 no podía tocar `contenido.ts` y
 *  publicó las dos cifras por separado con su dueño; hoy la tabla dice las dos y
 *  la publicación vuelve a ser UNA afirmación de igualdad. */
const patronesDelFuente = [...new Set([...FUENTE.matchAll(/patron="(P\d)"/g)].map((m) => m[1]))].sort()
// ⚠️ TRES desde que Portfolio llega con el gesto de la casa: P1 entró cuando el
// cartel dejó de crecer desde un punto y pasó a subir renglón por renglón.
// ⚠️ El que se fue en su momento es P2. El tramo pasó a tener vocabulario propio
// (`tunel.ts`): nacer y crecer desde una esquina, huir en z. El cartel y los
// nombres dejaron de llegar por un patrón del sistema. Queda P3 —el cuerpo que
// se pinta— y P7, que es el patrón del BLOQUE y de ahí sale la perspectiva.
afirmarIgual(patronesDelFuente, ['P1', 'P3', 'P7'], 'el componente consume TRES patrones: P1 el titular que llega renglón por renglón —el gesto de la casa—, P3 el cuerpo que se pinta, y P7 en el bloque, de donde sale la perspectiva del vuelo')
afirmarIgual([...PATRONES_DE_LA_SECCION].sort(), patronesDelFuente, '  y `PATRONES_DE_LA_SECCION` de `contenido.ts` dice exactamente los mismos: la tabla dejó de estar vieja')

// ════════════════════════════════════════════════════════════════════════════
titulo('16 · Las seis anclas son paradas de teclado de verdad, con su lugar puesto')

/**
 * ⚠️ **«ES UN ENLACE» NO ES «SE PUEDE LLEGAR CON EL TECLADO», y la diferencia
 * la hace el LUGAR — por eso esto se monta con la posición escrita.**
 *
 * Contar `<a ` (§11) dice que hay seis marcas en el papel. Lo que decide si son
 * paradas es otra cosa: que lleven `href`, que nadie les ponga `tabindex="-1"`,
 * que no estén escondidas de los lectores, y que tengan un nombre —tres de las
 * cuatro piezas de un proyecto van al MISMO destino, así que sin nombre propio
 * suenan dos veces igual—. Eso se lee del marcado real, con las capturas
 * posicionadas por el túnel: `left/top/width/height` y su punto interior.
 *
 * ⚠️ **Y el límite se afirma en vez de esconderse.** Arriba de 1025 las piezas
 * arrancan en `visibility: hidden` —su ventana todavía no abrió— y eso las saca
 * del orden de tabulación mientras dure: ahí una pieza es parada **sólo mientras
 * está pintada**, que es lo mismo que le pasa a cualquier cosa de un tramo
 * gobernado por el scroll. La garantía incondicional es la de abajo de 1025, y es
 * la que esta sección afirma: ahí las seis están puestas desde el primer cuadro.
 */
const DESTINOS_LEGITIMOS = [...PROYECTOS.map((p) => p.enlace), DESTINO_DEL_CTA]
const PARADAS = paradasDeTabulacion(quieto)
afirmarIgual(PARADAS.length, 7, 'abajo de 1025 las siete anclas son paradas de teclado: ninguna se quedó en marca de papel')
afirmarIgual(PARADAS.filter((p) => p.etiqueta !== 'a').map((p) => p.etiqueta), [], '  las siete son anclas —no un `div` con un manejador—, que es lo que las hace parada sin escribir un `tabindex`')
afirmarIgual(PARADAS.filter((p) => p.destino === null || !DESTINOS_LEGITIMOS.includes(p.destino)).map((p) => p.destino), [], '  las siete llevan a un destino declarado: un ancla sin `href` no es parada, y una URL de otro lado no es de nadie')
afirmarIgual(PARADAS.filter((p) => p.rotulo.trim() === '').map((p) => p.destino), [], '  y las siete se anuncian con algo: dos van al mismo sitio por proyecto, así que el nombre propio es lo único que las distingue')
afirmarIgual(PARADAS.filter((p) => p.ocultoALectores).length, 0, '  ninguna cuelga de algo escondido a los lectores')
afirmarIgual(veces(quieto, 'visibility:hidden'), 1, '  y lo único oculto en toda la rama quieta es la capa del barrido, que es decoración y lo declara')
afirmarIgual(paradasDeTabulacion(conMotion).length, 7, 'y con la coreografía puesta son las mismas siete: el recorrido no lo cambia el ancho')
// El LUGAR, que es la otra mitad: el punto interior del cartel, que es el único
// cartel— y cada una con su punto interior, desde el marcado y no desde un efecto.
afirmarIgual(veces(conMotion, 'transform-origin:'), 1, '  UN solo punto interior escrito, y es el del cartel: el túnel crece desde el centro y no necesita ninguno')
afirmarIgual(veces(conMotion, 'data-captura='), 3, '  y las tres capturas se identifican una por una')
controlPositivo('el chequeo de las paradas ve un ancla sin `href`', '<a>El Garage</a>', (html: string) => paradasDeTabulacion(html).length === 1)
controlPositivo('  y ve una parada sin nombre', '<a href="https://esquinaestudio.com.ar"></a>', (html: string) => paradasDeTabulacion(html).every((p) => p.rotulo.trim() !== ''))

// ════════════════════════════════════════════════════════════════════════════
afirmarElTunel(conMotion, quieto, PROYECTOS.length)
afirmarLasCuatroEntradas()

cerrar('trabajos.invariant')
