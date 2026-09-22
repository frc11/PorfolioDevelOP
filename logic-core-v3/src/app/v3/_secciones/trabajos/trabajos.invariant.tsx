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
import type { Seccion as EntradaDeSeccion } from '../../_lib/secciones'
import { NOMBRES_REALES } from '../_contrato/escaneo'
import { ATRIBUTO_DE_PANEL } from '../_contrato/forma'
import { MARCADORES, cuentaDeMarcadores, marcadoresPedidos, textosDe } from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'
import { seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO, ROTULO_DE_SECCION_RETIRADO } from './contenido'
import { afirmarQueElContenidoNoEsUnDato, conLaLlaveApagada } from '../_invariantes/llave'
import { CSS, FUENTES, FUENTE_DE_LA_COMPOSICION, FUENTE_DEL_PANEL, sinTres, veces } from './soporte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { caminoDeLaPersecucion, coloresDelTema, enlacesConNombreSucio, enlacesFueraDelContenido, medidasDeWebp, nombresQueNoSonEncabezado, pxDelTema } from './trabajos-piezas'
import {
  ARRANQUE_DE_DEMOS,
  CARTEL,
  DISPARO_DE_LA_NOCHE,
  MEDIDAS_DE_LAS_CAPTURAS,
  PANTALLAS_DE_LA_SECCION,
  VENTANA_DEL_TUNEL,
  progresoDeLaVentana,
} from './geometria'
import {
  ANCHO_AL_APARECER,
  ANCHO_DEL_LIMITE,
  ANCHO_DEL_RELEVO,
  ASENTAMIENTO_DEL_TUNEL_MS,
  BANDA_DEL_ROTULO,
  RESTO_AL_ASENTARSE,
  TAU_DEL_TUNEL_MS,
  anchoDeLaCaptura,
  anchoFinalDeLaPrimera,
  avanceDelNacimiento,
  avanceQueCompletaElTunel,
  opacidadDelRotulo,
  perseguir,
} from './tunel'
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

afirmarIgual(seccion.pasosDeLaSecuencia, CONTENIDO.proyectos.length, 'los pasos declarados en la tabla son los proyectos del contenido: el alto se DERIVA y la igualdad es comprobable')
controlPositivo('la afirmación de los pasos vería una tabla desincronizada', { ...seccion, pasosDeLaSecuencia: 7 }, (s: EntradaDeSeccion) => s.pasosDeLaSecuencia === CONTENIDO.proyectos.length)
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
 * `public/logos/`, y el dueño dictó los tres rubros. **Una casilla que se llena
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
afirmarIgual(veces(quieto, '<a '), 6, 'SEIS enlaces: el nombre y la captura de cada proyecto llevan a su sitio')
afirmarIgual(veces(quieto, 'rel="noopener noreferrer"'), 6, '  los seis abren afuera sin darle al otro sitio acceso a esta ventana ni el referente')
afirmarIgual(veces(conMotion, '<a '), 6, '  y los mismos seis con la coreografía puesta: el recorrido de teclado no cambia con el ancho')
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
// ⚠️ DOS, y el que se fue es P2. El tramo pasó a tener vocabulario propio
// (`tunel.ts`): nacer y crecer desde una esquina, huir en z. El cartel y los
// nombres dejaron de llegar por un patrón del sistema. Queda P3 —el cuerpo que
// se pinta— y P7, que es el patrón del BLOQUE y de ahí sale la perspectiva.
afirmarIgual(patronesDelFuente, ['P3', 'P7'], 'el componente consume DOS patrones: P3 el cuerpo que se pinta, y P7 en el bloque, que es de donde sale la perspectiva de la huida')
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
const PARADAS = paradasDeTabulacion(quieto)
afirmarIgual(PARADAS.length, 6, 'abajo de 1025 las seis anclas son paradas de teclado: ninguna se quedó en marca de papel')
afirmarIgual(PARADAS.filter((p) => p.etiqueta !== 'a').map((p) => p.etiqueta), [], '  las seis son anclas —no un `div` con un manejador—, que es lo que las hace parada sin escribir un `tabindex`')
afirmarIgual(PARADAS.filter((p) => p.destino === null || !PROYECTOS.some((x) => x.enlace === p.destino)).map((p) => p.destino), [], '  las seis llevan a un `enlace` del contenido: un ancla sin `href` no es parada, y una URL de otro lado no es de nadie')
afirmarIgual(PARADAS.filter((p) => p.rotulo.trim() === '').map((p) => p.destino), [], '  y las seis se anuncian con algo: dos van al mismo sitio por proyecto, así que el nombre propio es lo único que las distingue')
afirmarIgual(PARADAS.filter((p) => p.ocultoALectores).length, 0, '  ninguna cuelga de algo escondido a los lectores')
afirmarIgual(veces(quieto, 'visibility:hidden'), 1, '  y lo único oculto en toda la rama quieta es la capa del barrido, que es decoración y lo declara')
afirmarIgual(paradasDeTabulacion(conMotion).length, 6, 'y con la coreografía puesta son las mismas seis: el recorrido no lo cambia el ancho')
// El LUGAR, que es la otra mitad: el punto interior del cartel, que es el único
// cartel— y cada una con su punto interior, desde el marcado y no desde un efecto.
afirmarIgual(veces(conMotion, 'transform-origin:'), 1, '  UN solo punto interior escrito, y es el del cartel: el túnel crece desde el centro y no necesita ninguno')
afirmarIgual(veces(conMotion, 'data-captura='), 3, '  y las tres capturas se identifican una por una')
controlPositivo('el chequeo de las paradas ve un ancla sin `href`', '<a>El Garage</a>', (html: string) => paradasDeTabulacion(html).length === 1)
controlPositivo('  y ve una parada sin nombre', '<a href="https://esquinaestudio.com.ar"></a>', (html: string) => paradasDeTabulacion(html).every((p) => p.rotulo.trim() !== ''))

// ════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
titulo('17 · El túnel: sus constantes son la medición de la referencia')

/**
 * ⚠️ **ESTE BLOQUE NO COMPRUEBA QUE EL TÚNEL SE VEA BIEN. Comprueba que sus
 * números sigan siendo los que se midieron, y que lo que se deriva se derive.**
 *
 * La mecánica salió de medir heatbureau.com con `scripts-b4/` a 1440 × 900,
 * cuadro por cuadro. Las tres cifras que gobiernan la composición —el relevo, el
 * desborde y el ritmo— entraron desde esa medición y no desde una preferencia, y
 * lo que este bloque cuida es que nadie las mueva sin darse cuenta.
 */

// ── La primera captura nace MIENTRAS el cartel huye, y es una igualdad ──────
afirmarIgual(
  VENTANA_DEL_TUNEL.desde,
  progresoDeLaVentana(CARTEL, CARTEL.huirDesde ?? 1),
  'el túnel arranca en el instante EXACTO en que el cartel empieza a huir: el paso 2 de la secuencia es una derivación y no dos números escritos aparte',
)
afirmarIgual(VENTANA_DEL_TUNEL.hasta, ARRANQUE_DE_DEMOS, '  y termina donde empieza el tramo de demos, que es la única punta declarada de las dos')
controlPositivo(
  'el chequeo del arranque vería un túnel desenganchado del cartel',
  { desde: 0.5, hasta: ARRANQUE_DE_DEMOS },
  (v: { desde: number; hasta: number }) => v.desde === progresoDeLaVentana(CARTEL, CARTEL.huirDesde ?? 1),
)

// ── EL RELEVO — al nacer una, la anterior mide exactamente el relevo ────────
for (let i = 1; i < PROYECTOS.length; i += 1) {
  const alNacer = avanceDelNacimiento(i)
  afirmarIgual(
    (anchoDeLaCaptura(i - 1, alNacer) ?? 0).toFixed(4),
    ANCHO_DEL_RELEVO.toFixed(4),
    `  al nacer la captura ${i + 1}, la anterior mide ${ANCHO_DEL_RELEVO} anchos de cuadro — la referencia medía 29 %, 36 % y 29 %`,
  )
  afirmarIgual(anchoDeLaCaptura(i, alNacer), null, `    y la que nace todavía no se dibuja: por debajo de ${ANCHO_AL_APARECER} es un punto, no una imagen`)
}

// ── EL DESBORDE de la primera cae adentro de la banda MEDIDA ───────────────
/**
 * La referencia dejaba a sus imágenes entre 1,17 y 1,68 anchos de cuadro cuando
 * llegaban a su tope. Acá nadie puso un tope: el desborde es lo que queda de
 * `(n−1) × relevo + 1`. Que caiga adentro de esa banda es la comprobación de que
 * el modelo reproduce la composición y no sólo el gesto.
 */
const DESBORDE_MEDIDO = { minimo: 1.17, maximo: 1.68 } as const
const desborde = anchoFinalDeLaPrimera(PROYECTOS.length)
afirmar(
  desborde >= DESBORDE_MEDIDO.minimo && desborde <= DESBORDE_MEDIDO.maximo,
  `la primera captura termina en ${desborde.toFixed(4)} anchos de cuadro, adentro de los ${DESBORDE_MEDIDO.minimo}–${DESBORDE_MEDIDO.maximo} que se midieron en la referencia`,
)
controlPositivo(
  'la banda del desborde vería un túnel de una sola captura',
  1,
  (n: number) => anchoFinalDeLaPrimera(n) >= DESBORDE_MEDIDO.minimo,
)

// ── EL RITMO: anchos de cuadro por cada 1000 px de scroll ───────────────────
/**
 * La referencia avanzaba 1,15 anchos de cuadro por cada 1000 px de scroll
 * (mediana de las tres imágenes que recorrieron su vida entera dentro del tramo
 * grabado: 1,149 · 0,998 · 1,450). Acá el ritmo no se elige: sale de cuánto
 * scroll le toca al túnel —la mitad de una sección de tres pantallas— y de
 * cuánto avance hay que recorrer. Que caiga cerca es la corroboración.
 */
const RITMO_DE_LA_REFERENCIA = 1.15
const pxDelTramo = (VENTANA_DEL_TUNEL.hasta - VENTANA_DEL_TUNEL.desde) * PANTALLAS_DE_LA_SECCION * 900
const ritmo = avanceQueCompletaElTunel(PROYECTOS.length) / (pxDelTramo / 1000)
afirmar(
  Math.abs(ritmo / RITMO_DE_LA_REFERENCIA - 1) < 0.25,
  `el túnel avanza ${ritmo.toFixed(3)} anchos de cuadro cada 1000 px de scroll contra los ${RITMO_DE_LA_REFERENCIA} de la referencia: ${((ritmo / RITMO_DE_LA_REFERENCIA - 1) * 100).toFixed(1)} % de diferencia sobre ${pxDelTramo.toFixed(0)} px de tramo`,
)

// ── LA PERSECUCIÓN: su ley, y que no dependa de los cuadros por segundo ────
/**
 * ⚠️ **La comprobación que importa no es el 99 %: es que el mismo tiempo dé el
 * mismo resultado a 60 y a 144 cuadros por segundo.**
 *
 * Es el defecto clásico de una persecución escrita como `actual += (falta) * k`
 * con `k` fijo: la constante se vuelve «por cuadro» y el gesto dura la mitad en
 * un monitor de 120 Hz. Acá el paso es `1 − e^(−dt/τ)`, así que los dos caminos
 * llegan al mismo número — y eso es lo que se afirma.
 */
const enPersecucion = (v: number, dt: number): number => perseguir(v, 1, dt)
const a60 = caminoDeLaPersecucion(ASENTAMIENTO_DEL_TUNEL_MS, 1000 / 60, enPersecucion)
const a144 = caminoDeLaPersecucion(ASENTAMIENTO_DEL_TUNEL_MS, 1000 / 144, enPersecucion)
afirmar(
  a60 >= 1 - RESTO_AL_ASENTARSE,
  `a los ${ASENTAMIENTO_DEL_TUNEL_MS} ms la persecución recorrió el ${(a60 * 100).toFixed(2)} % del camino: eso es «ya frenó»`,
)
afirmar(
  Math.abs(a60 - a144) < 1e-3,
  `y el mismo tiempo da el mismo resultado a 60 y a 144 cuadros por segundo: ${a60.toFixed(6)} contra ${a144.toFixed(6)} — la constante es de TIEMPO y no de cuadro`,
)
// ⚠️ El factor del control es 0,002 y no uno cualquiera: con un factor grande
// las DOS corridas saturan en 1 dentro de la ventana y el control se queda ciego
// —medido: con 0,05 la diferencia cae a 1e-4 y el predicado no ve nada—. Tiene
// que ser lo bastante chico para que a 3 s las dos sigan a mitad de camino.
controlPositivo(
  'el chequeo de los cuadros por segundo vería una persecución por factor fijo',
  0.002,
  (k: number) => {
    const porFactorFijo = (v: number): number => v + (1 - v) * k
    const corre = (dt: number): number => caminoDeLaPersecucion(ASENTAMIENTO_DEL_TUNEL_MS, dt, porFactorFijo)
    return Math.abs(corre(1000 / 60) - corre(1000 / 144)) < 1e-3
  },
)
afirmarIgual(TAU_DEL_TUNEL_MS.toFixed(1), (ASENTAMIENTO_DEL_TUNEL_MS / Math.log(1 / RESTO_AL_ASENTARSE)).toFixed(1), '  y la constante de tiempo se DERIVA del asentamiento: no hay dos números que mantener de acuerdo')

// ── EL RÓTULO: su banda son las dos constantes de arriba, no una tercera ───
afirmarIgual(
  [BANDA_DEL_ROTULO.desde, BANDA_DEL_ROTULO.hasta],
  [ANCHO_DEL_RELEVO, ANCHO_DEL_LIMITE],
  'la banda en la que el rótulo se lee son el relevo y el límite de la pantalla: cero constantes nuevas para el texto',
)
afirmarIgual(opacidadDelRotulo(ANCHO_DEL_RELEVO), 0, '  al tamaño del relevo el rótulo todavía no se ve')
afirmarIgual(opacidadDelRotulo(ANCHO_DEL_LIMITE), 0, '  y cuando la captura llena el cuadro ya se fue')
afirmar(
  opacidadDelRotulo((ANCHO_DEL_RELEVO + ANCHO_DEL_LIMITE) / 2) === 1,
  '  y en el medio de la banda se ve entero: es donde el proyecto «se lee bien»',
)

// ── EL CLIC: las anclas del túnel tienen que RECIBIRLO ─────────────────────
/**
 * ⚠️ **Un defecto medido en el sprint anterior, cerrado acá.** La capa del túnel
 * se monta sin eventos de puntero —si no, taparía el scroll de la sección—, y con
 * eso las anclas tomaban foco pero **el clic las atravesaba**. Se veían, se
 * tabulaban, y no llevaban a ningún lado. El arreglo es devolverle los eventos a
 * lo que se puede clickear y a nada más.
 */
afirmar(conMotion.includes('pointer-events-none'), 'la capa del túnel se monta sin eventos de puntero: el aire no tapa el scroll')
afirmarIgual(
  veces(conMotion, 'pointer-events-auto'),
  PROYECTOS.length * 2,
  '  y se los devuelve a lo clickeable: la captura y el rótulo de cada proyecto, y nada más',
)
afirmarIgual(veces(quieto, 'pointer-events-auto'), 0, '  abajo de 1025 no hace falta ninguno: ahí la lista está en el flujo')

// ── LAS TRES CAPTURAS MIDEN LO QUE LA GEOMETRÍA DECLARA ────────────────────
/**
 * ⚠️ **El lector de WEBP existía y no lo llamaba nadie.** `medidasDeWebp` quedó
 * huérfano cuando el contenido renombró su campo, así que la comprobación que
 * evitaba un salto de layout dejó de correr en silencio. Acá vuelve, y ahora
 * importa más que antes: el túnel SÓLO escala, así que dos relaciones distintas
 * se leerían como dos gestos distintos.
 */
for (const [i, proyecto] of PROYECTOS.entries()) {
  const declarada = MEDIDAS_DE_LAS_CAPTURAS[i]
  const real = medidasDeWebp(new Uint8Array(readFileSync(join('public', proyecto.pagina.fuente))))
  afirmarIgual(
    [real.ancho, real.alto],
    [declarada.ancho, declarada.alto],
    `«${proyecto.nombre}» — el archivo en disco mide lo que declara \`MEDIDAS_DE_LAS_CAPTURAS\``,
  )
}
afirmarIgual(
  [...new Set(MEDIDAS_DE_LAS_CAPTURAS.map((m) => (m.ancho / m.alto).toFixed(6)))],
  [(16 / 9).toFixed(6)],
  '  y las tres comparten relación: por eso las tres crecen igual sin que nadie lo declare',
)
afirmarIgual(
  MEDIDAS_DE_LAS_CAPTURAS.length,
  PROYECTOS.length,
  '  y hay exactamente una medida por proyecto: un cuarto proyecto sin su medida tira al montar, no tres cuadros después',
)

// ── EL RECORTE: sin él, el desborde le da al SITIO una barra horizontal ────
/**
 * ⚠️ **Un defecto medido, y de los que no se ven mirando la sección.** La primera
 * captura llega a 1,64 anchos de cuadro; centrada sobre 1.440, su borde derecho
 * cae en 1.898 px. Sin recorte eso no queda en la sección: `document.scrollWidth`
 * pasaba de 1.440 a **1.899** y el sitio entero ganaba una barra de scroll
 * horizontal a mitad del tramo. Con el recorte puesto se midió 1.440 en los tres
 * puntos del recorrido, con las capturas igual de grandes.
 *
 * Por eso esto se afirma sobre el MARCADO y no sobre una cuenta: lo único que lo
 * sostiene es una clase, y una clase se borra sin querer.
 */
afirmar(
  conMotion.includes('overflow:clip'),
  'la capa del túnel recorta al cuadro: sin eso el desborde de la primera captura le da al sitio 459 px de scroll horizontal',
)
afirmar(
  conMotion.includes('overflow-clip-margin'),
  '  y recorta con margen: `hidden` se comería el anillo de foco de las seis anclas, que se dibuja 2 px por afuera',
)
/**
 * ⚠️ **EL MARGEN DEL RECORTE, ATADO A LOS DOS TOKENS DEL ANILLO.** En el
 * componente es una longitud a mano —`calc()` con variables computa 0px en esta
 * propiedad, medido— así que la derivación se comprueba de este lado: el margen
 * tiene que ser el desplazamiento del anillo MÁS su grosor, leídos del tema. Si
 * el tema engorda el anillo y nadie toca la capa, esto se pone rojo.
 */
const px = (nombre: string): number => pxDelTema(CSS, nombre)
const margenDelAnillo = px('foco-desplazamiento') + px('foco-grosor')
const margenEscrito = Number(/overflow-clip-margin:\s*(\d+(?:\.\d+)?)px/.exec(conMotion)?.[1] ?? NaN)
afirmarIgual(
  margenEscrito,
  margenDelAnillo,
  `  y el margen son los ${margenDelAnillo} px del anillo —desplazamiento ${px('foco-desplazamiento')} más grosor ${px('foco-grosor')}—, leídos del tema y no elegidos acá`,
)
afirmarIgual(
  veces(conMotion, 'overflow-hidden'),
  0,
  '  y NO usa `overflow-hidden`: es lo que el invariante de la compacta prohíbe encima de un focalizable, y tiene razón',
)

// ── EL TECLADO: se esconde por ESCALA, porque `visibility` saca del foco ───
/**
 * ⚠️ **El defecto que esto cuida se midió con Tab de verdad, no con una cuenta.**
 *
 * Las paradas de §16 se cuentan sobre el marcado, y ahí las seis están siempre.
 * En el navegador no estaban: la capa escondía cada captura con
 * `visibility: hidden`, y eso saca del foco secuencial a TODO su subárbol —el
 * navegador no le da Tab a lo que no se renderiza—. Como arriba de 1025 la lista
 * no existe, **los tres enlaces a los sitios de los clientes no se alcanzaban
 * con el teclado**: el foco saltaba de Quiénes somos a Servicios. Medido
 * despachando Tab por CDP desde el tope de la página.
 *
 * La corrección son dos mitades y las dos se afirman acá: esconder con
 * `scale(0)` —que no pinta, no recibe clic y SÍ es parada— y un piso: mientras
 * el foco esté adentro de una captura, el avance no baja del tamaño del relevo.
 * Con las dos puestas, las tres se alcanzan y cada una aparece a 461 px sobre un
 * cuadro de 1440, que es exactamente `ANCHO_DEL_RELEVO`.
 */
const FUENTE_DEL_TUNEL = FUENTES.find((f) => f.archivo.includes('CapaDelTunel'))?.texto ?? ''
afirmar(FUENTE_DEL_TUNEL.length > 0, 'se leyó del disco la fuente de la capa del túnel')
afirmarIgual(
  veces(FUENTE_DEL_TUNEL, "setProperty('visibility'"),
  0,
  'la capa NO esconde con `visibility`: eso sacaría del recorrido de teclado a las seis anclas del túnel',
)
afirmarIgual(
  veces(conMotion, 'scale(0)'),
  PROYECTOS.length,
  `  las ${PROYECTOS.length} capturas nacen en escala cero —no escondidas— ya en el primer render`,
)
afirmar(
  FUENTE_DEL_TUNEL.includes('focusin') && FUENTE_DEL_TUNEL.includes('pisoDelFoco'),
  '  y hay un piso del foco: una parada que no se ve no sirve, así que enfocar una captura la muestra',
)
controlPositivo(
  'el detector vería una capa que vuelve a esconder con `visibility`',
  "el.style.setProperty('visibility', 'hidden')",
  (src: string) => veces(src, "setProperty('visibility'") === 0,
)

cerrar('trabajos.invariant')
