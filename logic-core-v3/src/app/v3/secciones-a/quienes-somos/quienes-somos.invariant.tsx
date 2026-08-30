/**
 * INVARIANTE — 02 · Quiénes somos.
 *
 * Corre con `npx tsx src/app/v3/secciones-a/quienes-somos/quienes-somos.invariant.tsx`.
 *
 * Acá viven las AFIRMACIONES, y nada más. Los renders de la sección (la rama
 * quieta, la coreografía forzada y la preferencia mandando sobre el modo), los
 * ayudantes de conteo y las tablas de datos viven en el módulo hermano
 * `quienes-somos-piezas.tsx`, que explica por qué hacen falta las tres ramas y
 * por qué cada una sola mentiría.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { sizesPorColumnas } from '../../_lib/imagen'
import {
  cuentaDeMarcadores,
  hallazgosDeCifraConSimbolo,
  hallazgosDeDigito,
  hallazgosDeMarcadorDesconocido,
  numerosDe,
} from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'
import { pantallasDe } from '../_contrato/forma'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO } from './contenido'
import { GEOMETRIA, SIZES_DE_LA_FOTO } from './QuienesSomos'
import {
  conFoto, conMotion, conPreferencia, FUENTE, LITERALES,
  PEDIDOS, quieto, seccion, TEXTOS, todosSeVen, veces,
} from './quienes-somos-piezas'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El alto, la superficie y el pinneo salen de la tabla, no de acá')

afirmarIgual(seccion.superficie, 'papel-opaco', 'la superficie es papel-opaco: el canvas no se ve')
afirmarIgual(pantallasDe(seccion), 2, 'ocupa DOS pantallas — el tramo más largo sin escena')
afirmarIgual(seccion.pinneada, undefined, 'y NO es pinneada: las dos pantallas scrollean')
afirmarIgual(veces(quieto, 'data-pinneado="sticky"'), 0, '  no hay un solo hijo sticky en el marcado')

afirmarIgual(
  veces(quieto, 'data-pantalla='),
  2,
  'el marcado reparte el alto en dos cajas de pantalla, no en una',
)
afirmar(
  quieto.includes('data-pantalla="agencia"') && quieto.includes('data-pantalla="personas"'),
  '  y son las dos declaradas: la agencia primero, las personas después',
)
afirmarIgual(veces(quieto, 'min-h-svh'), 2, '  cada una pide una pantalla: 1 + 1 = los 200svh')

controlPositivo(
  'la lectura del alto ve un alto distinto',
  { ...seccion, alto: '300svh' },
  (s) => pantallasDe(s) === 2,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El contenido no se puede leer como un dato')

afirmar(TEXTOS.length > 0, `el contenido tiene ${TEXTOS.length} textos: la cuenta no es vacía`)

afirmarIgual(hallazgosDeCifraConSimbolo(CONTENIDO).length, 0, 'cero cifras con símbolo')
controlPositivo('el detector de cifras con símbolo ve un +340%', { a: 'crecimos +340% en ventas' }, (c) =>
  hallazgosDeCifraConSimbolo(c).length === 0,
)

afirmarIgual(hallazgosDeDigito(CONTENIDO).length, 0, 'cero dígitos, punto')
controlPositivo('el detector de dígitos ve un 12 sin símbolo', { a: '12 proyectos entregados' }, (c) =>
  hallazgosDeDigito(c).length === 0,
)

afirmarIgual(numerosDe(CONTENIDO).length, 0, 'cero hojas numéricas: nada que el escáner de cadenas no vea')
controlPositivo('el detector de hojas numéricas ve un { clientes: 12 }', { clientes: 12 }, (c) =>
  numerosDe(c).length === 0,
)

afirmarIgual(hallazgosDeMarcadorDesconocido(CONTENIDO).length, 0, 'cero marcadores fuera del conjunto cerrado')
controlPositivo('el detector de marcadores ve un [METRICA] sin tilde', { a: 'subimos [METRICA]' }, (c) =>
  hallazgosDeMarcadorDesconocido(c).length === 0,
)

/** La palabra "dos" es la única cantidad del contenido, y es verdad declarada
 *  por el sprint. Se afirma que está ESCRITA CON LETRAS: con cifra pasaría a
 *  ser un dato que se lee como medición. */
afirmar(
  CONTENIDO.titular.includes('dos personas') && !/\d/.test(CONTENIDO.titular),
  'la única cantidad del contenido va con letras y no con cifra',
  CONTENIDO.titular,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los marcadores se VEN: un pedido que no llega a la pantalla no es un pedido')

afirmarIgual(PEDIDOS, ['[FOTO DEL EQUIPO]', '[TEXTO]'], 'los marcadores del contenido, en orden')

const cuenta = cuentaDeMarcadores(CONTENIDO)
afirmarIgual(cuenta.get('[FOTO DEL EQUIPO]'), 1, 'hay exactamente UNA foto del equipo pedida')
afirmarIgual(cuenta.get('[TEXTO]'), 2, 'y exactamente DOS [TEXTO]: uno por persona')

afirmar(todosSeVen(quieto), 'los dos marcadores llegan al marcado en la rama quieta')
afirmar(todosSeVen(conMotion), '  y también con la coreografía puesta')
controlPositivo('el chequeo de "el marcador se ve" ve un marcado sin marcadores', '<div>nada</div>', todosSeVen)

afirmarIgual(
  veces(quieto, 'data-marcador="[FOTO DEL EQUIPO]"'),
  1,
  'y hay UN solo marco de foto en la pantalla, no dos',
)
afirmarIgual(veces(quieto, '[TEXTO]'), 2, 'y dos huecos de persona, uno por cada una')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Abajo de 1025 el contenido está COMPLETO y no se mueve')

const faltantes = TEXTOS.filter((h) => !quieto.includes(h.valor))
afirmarIgual(faltantes.map((h) => h.ruta), [], 'los textos del contenido llegan enteros a la rama quieta')
controlPositivo(
  'el chequeo de "está completo" ve un marcado al que le falta un texto',
  '<div>Quiénes somos</div>',
  (html: string) => TEXTOS.every((h) => html.includes(h.valor)),
)

afirmar(!quieto.includes('transform:'), 'la rama quieta no escribe una sola transformada')
afirmar(!quieto.includes('will-change'), '  ni promueve una capa de composición')
afirmar(!conPreferencia.includes('transform:'), 'y con `prefers-reduced-motion` tampoco, aunque el modo esté forzado')

controlPositivo(
  'el chequeo de "no hay transformada" ve un style con transform',
  '<div style="transform:translateY(10%)"></div>',
  (html: string) => !html.includes('transform:'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · CONTROL POSITIVO — con la coreografía puesta, SÍ se anima')

afirmar(conMotion.includes('transform:'), 'con coreografía los bloques P2 SÍ escriben transformada')
afirmarIgual(
  veces(conMotion, 'will-change-transform'),
  5,
  'y son exactamente los CINCO bloques P2 declarados: bajada, cómo trabajamos, foto, y las dos personas',
)
afirmar(
  quieto.includes('data-texto-por-lineas="entero"') &&
    conMotion.includes('data-texto-por-lineas="partido"'),
  'el titular P1 sale entero en la rama quieta y partido con coreografía',
)
afirmarIgual(
  veces(conPreferencia, 'data-texto-por-lineas="entero"'),
  1,
  '  y con la preferencia vuelve a salir entero: la política de S2 gana sobre el modo forzado',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Lo verdadero está escrito, y lo que no sabemos está declarado ausente')

for (const literal of LITERALES) {
  afirmar(quieto.includes(literal), `"${literal}" aparece literal en el marcado quieto`)
  afirmar(conMotion.includes(literal), `  y también con coreografía`)
}
controlPositivo(
  'el chequeo de los literales ve un marcado sin ellos',
  '<div>una agencia</div>',
  (html: string) => LITERALES.every((l) => html.includes(l)),
)

afirmarIgual(CONTENIDO.personas.length, 2, 'son exactamente DOS personas')
afirmarIgual(
  CONTENIDO.personas.filter((p) => p.enUnProyecto === '[TEXTO]').length,
  2,
  '  y cada una tiene su marcador [TEXTO]: no inventamos qué hace cada uno')
afirmarIgual(
  CONTENIDO.personas.map((p) => p.rol),
  ['Estrategia · Comercial · Planificación', 'Ejecución técnica'],
  '  con los roles reales, los mismos que publica el sitio vivo',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · El marco de la foto: relación de aspecto y `sizes`, sobre el marcado')

afirmar(
  quieto.includes(`aspect-ratio:${GEOMETRIA.foto.ancho} / ${GEOMETRIA.foto.alto}`),
  'el marco declara su relación de aspecto EN EL MARCADO, no en un comentario',
  `${GEOMETRIA.foto.ancho} / ${GEOMETRIA.foto.alto} — apaisado 3:2, dos personas a la par`,
)
controlPositivo(
  'el chequeo de la relación de aspecto ve una caja sin ella',
  '<div role="img"></div>',
  (html: string) => html.includes('aspect-ratio:'),
)

afirmar(SIZES_DE_LA_FOTO.trim().length > 0, 'el `sizes` no es vacío', SIZES_DE_LA_FOTO)
afirmarIgual(
  SIZES_DE_LA_FOTO,
  sizesPorColumnas(GEOMETRIA.foto.columnas, GEOMETRIA.foto.columnasTotales),
  '  y está ARMADO con el ayudante de _lib/imagen, no escrito a mano',
)

afirmar(conFoto.includes(`sizes="${SIZES_DE_LA_FOTO}"`), 'el mismo marco con foto emite el `sizes` en el HTML')
afirmar(conFoto.includes('w"') && !conFoto.includes('2x'), '  y su srcset usa descriptores de ANCHO, no de densidad')
controlPositivo(
  'el chequeo del srcset ve descriptores de densidad',
  '<img srcSet="/a.jpg 1x, /b.jpg 2x"/>',
  (html: string) => html.includes('w"') && !html.includes('2x'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · El árbol de encabezados')

afirmarIgual(veces(quieto, '<h1'), 0, 'ningún h1: el h1 es del Hero')
afirmarIgual(veces(quieto, '<h2'), 1, 'exactamente UN h2 — el titular de la sección')
afirmarIgual(veces(conMotion, '<h2'), 1, '  y sigue siendo uno con la coreografía partiendo el texto')
afirmarIgual(veces(quieto, '<h3'), 2, 'y dos h3: uno por persona')
for (const persona of CONTENIDO.personas) {
  afirmar(
    new RegExp(`<h3[^>]*>${persona.nombre}</h3>`).test(quieto),
    `"${persona.nombre}" es un h3, no un párrafo con tamaño de título`,
  )
}
controlPositivo(
  'el chequeo del h3 ve un nombre que no es encabezado',
  '<p>Franco</p>',
  (html: string) => /<h3[^>]*>Franco<\/h3>/.test(html),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · Higiene del lane: color, foco, interactividad y puertas')

afirmarIgual(veces(quieto, 'text-acento'), 0, 'cero `text-acento`: sobre fondo oscuro no llega a 3:1')
afirmarIgual(veces(quieto, 'outline-none'), 0, 'cero `outline-none`: el anillo de foco lo pone el tema')
afirmar(!/#[0-9a-fA-F]{3,8}\b/.test(quieto), 'cero color fuera de los tokens: ni un hex suelto')
afirmar(!/-\[\d+(px|rem)\]/.test(quieto), 'cero px o rem suelto en un valor arbitrario de clase')

controlPositivo('el chequeo del hex ve un hex', '<i class="a" style="color:#ff0000">', (html: string) =>
  !/#[0-9a-fA-F]{3,8}\b/.test(html),
)
controlPositivo('el chequeo del px suelto ve un p-[7px]', '<i class="p-[7px]">', (html: string) =>
  !/-\[\d+(px|rem)\]/.test(html),
)

/**
 * Esta sección no tiene un solo elemento interactivo, y es una decisión: el CTA
 * del recorrido vive en el Hero y en el Cierre, no acá. La afirmación se hace
 * igual —y con su control positivo— porque lo que se comprueba no es que haya
 * cero controles sino que **si apareciera uno, sería nativo y focalizable**.
 */
const hovers = veces(quieto, 'hover:')
afirmarIgual(hovers, veces(quieto, 'focus-visible:'), 'toda `hover:` tiene su gemela `focus-visible:`')
afirmarIgual(hovers, 0, '  y en esta sección son cero: no hay nada interactivo')
afirmarIgual(veces(quieto, '<button'), 0, 'cero botones')
afirmarIgual(veces(quieto, '<a '), 0, 'cero enlaces')
afirmarIgual(veces(FUENTE, 'onClick'), 0, 'y cero `onClick` en la fuente: ningún div haciendo de botón')
controlPositivo(
  'el chequeo de `hover:` sin gemela ve un marcado desparejo',
  '<i class="hover:opacity-casi">',
  (html: string) => veces(html, 'hover:') === veces(html, 'focus-visible:'),
)
controlPositivo(
  'el chequeo del onClick ve un div clickeable',
  '<div onClick={ir}>ir</div>',
  (src: string) => veces(src, 'onClick') === 0,
)

afirmarIgual(
  veces(FUENTE, 'motion/_componentes'),
  0,
  'la sección no importa de `motion/_componentes`: la única puerta es `_contrato/piezas`',
)
controlPositivo(
  'el chequeo de la puerta ve un import directo',
  "import { Pieza } from '../../motion/_componentes/Pieza'",
  (src: string) => veces(src, 'motion/_componentes') === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · El pedido y los patrones declarados')

afirmar(PEDIDO.length > 0, `el pedido tiene ${PEDIDO.length} entradas: no es una lista vacía`)
afirmarIgual(entradasColgadas(CONTENIDO, PEDIDO).map((e) => e.ruta), [], 'ninguna apunta a una ruta que no existe')
controlPositivo(
  'el chequeo de entradas colgadas ve una ruta inventada',
  [{ ruta: 'no.existe', clase: 'prosa' as const, que: 'nada' }],
  (p) => entradasColgadas(CONTENIDO, p).length === 0,
)
afirmarIgual(
  [...new Set(PEDIDO.map((e) => e.clase))],
  ['prosa'],
  'y las seis son `prosa`: el relleno que NO se ve como agujero',
)

afirmarIgual(PATRONES_DE_LA_SECCION, ['P1', 'P2'], 'la sección declara consumir P1 y P2, y nada más')

cerrar('quienes-somos.invariant')
