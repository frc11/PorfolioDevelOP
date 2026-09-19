/**
 * INVARIANTE — 02 · Quiénes somos.
 *
 * Corre con `npx tsx src/app/v3/_secciones/quienes-somos/quienes-somos.invariant.tsx`.
 *
 * Acá viven las AFIRMACIONES, y nada más. Los renders de la sección (la rama
 * quieta, la coreografía forzada y la preferencia mandando sobre el modo), los
 * ayudantes de conteo y las tablas de datos viven en el módulo hermano
 * `quienes-somos-piezas.tsx`, que explica por qué hacen falta las tres ramas y
 * por qué cada una sola mentiría.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import {
  cuentaDeMarcadores,
  hallazgosDeCifraConSimbolo,
  hallazgosDeDigito,
  hallazgosDeMarcadorDesconocido,
  numerosDe,
} from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO, ROTULO_DE_SECCION_RETIRADO } from './contenido'
import {
  conMotion, conPreferencia, FUENTE, LITERALES,
  PEDIDOS, personasSinLlave, quieto, TEXTOS_DE_PANTALLA, quietoSinLlave, conMotionSinLlave, SIN_LLAVE, TEXTOS, todosSeVen, veces,
} from './quienes-somos-piezas'

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

// Modo pulido: el titular nuevo no nombra ninguna cantidad; "cero dígitos, punto" (arriba) ya cubre el resto del contenido.

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Los marcadores se VEN: un pedido que no llega a la pantalla no es un pedido')

afirmarIgual(PEDIDOS, ['[FOTO]', '[FOTO DEL EQUIPO]'], 'los marcadores del contenido, en orden')

const cuenta = cuentaDeMarcadores(SIN_LLAVE)
afirmarIgual(cuenta.get('[FOTO DEL EQUIPO]'), 1, 'hay exactamente UNA foto del equipo pedida: la toma seria')
// Cinco [FOTO]: las dos tomas de cada persona más la descontracturada del equipo.
afirmarIgual(cuenta.get('[FOTO]'), 5, 'y cinco [FOTO]: dos por persona y la suelta del equipo')

afirmar(todosSeVen(quietoSinLlave), 'los dos marcadores llegan al marcado en la rama quieta')
afirmar(todosSeVen(conMotionSinLlave), '  y también con la coreografía puesta')
controlPositivo('el chequeo de "el marcador se ve" ve un marcado sin marcadores', '<div>nada</div>', todosSeVen)

afirmarIgual(veces(quieto, 'data-marcador="[FOTO DEL EQUIPO]"'), 1, 'y hay UN solo marco de foto del equipo en la pantalla, no dos')
// Seis marcos en total: los tres de la composición, cada uno con su par de tomas.
afirmarIgual(veces(quieto, 'data-medio="placeholder"'), 6, 'y seis marcos: tres frentes con dos tomas cada uno')
afirmarIgual(veces(quieto, 'data-marco="dos-tomas"'), 3, '  agrupados en tres frentes: Franco, Valentino y el equipo')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Abajo de 1025 el contenido está COMPLETO y no se mueve')

afirmarIgual(TEXTOS.length - TEXTOS_DE_PANTALLA.length, 1, 'se eximió exactamente UNA ruta de archivo, ni una más')
const faltantes = TEXTOS_DE_PANTALLA.filter((h) => !quieto.includes(h.valor))
afirmarIgual(faltantes.map((h) => h.ruta), [], 'los textos del contenido llegan enteros a la rama quieta')
afirmar(quieto.includes(encodeURIComponent(CONTENIDO.equipo.fuente)), '  y el placeholder de la foto llega, codificado por el optimizador', CONTENIDO.equipo.fuente)
controlPositivo('el detector del placeholder ve un marcado con otra ruta', '<img src="/_next/image?url=%2Fotra.png"/>', (html: string) => html.includes(encodeURIComponent(CONTENIDO.equipo.fuente)))
/** ⚠️ B12 · `CONTENIDO.etiqueta` estaba en esta cuenta y ahora se afirma al revés. Regla 15. */
afirmar(!quieto.includes(ROTULO_DE_SECCION_RETIRADO), `y el RÓTULO DE SECCIÓN («${ROTULO_DE_SECCION_RETIRADO}») ya NO se lee: el título toma su lugar (B12)`)
controlPositivo(
  'el chequeo de "está completo" ve un marcado al que le falta un texto',
  '<div>Quiénes somos</div>',
  (html: string) => TEXTOS.every((h) => html.includes(h.valor)),
)

afirmar(!quieto.includes('transform:'), 'la rama quieta no escribe una sola transformada')
afirmar(!quieto.includes('will-change'), '  ni promueve una capa de composición')
afirmar(!conPreferencia.includes('transform:'), 'y con `prefers-reduced-motion` tampoco: la compuerta no instala nada')

controlPositivo(
  'el chequeo de "no hay transformada" ve un style con transform',
  '<div style="transform:translateY(10%)"></div>',
  (html: string) => !html.includes('transform:'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · CONTROL POSITIVO — con la coreografía puesta, SÍ se anima')

afirmar(conMotion.includes('transform:'), 'con coreografía los bloques P2 SÍ escriben transformada')
// Modo pulido: OCHO. El bloque del equipo repartió el texto en piezas propias —cada
// nombre y cada descripción entran por su cuenta— así que a los cuatro de antes se les
// suman dos nombres y dos descripciones. Los DOS retratos siguen sin contar acá: los
// mueve `LlegadaEnCurva` con `motion`, que no escribe la clase del sistema.
// NUEVE: el titular pasó a tener una pieza POR RENGLÓN —su máscara es por renglón, así
// que P1 vuelve a escalonar dos— y eso suma una a las ocho de antes.
afirmarIgual(
  veces(conMotion, 'will-change-transform'),
  9,
  'y son nueve: los DOS renglones del titular (P1), el rótulo del equipo, la bajada, la foto y los dos nombres con sus dos descripciones',
)
// Modo pulido: el handle ya no puede ser `data-texto-por-lineas` —el titular no usa ese
// primitivo—, así que las dos afirmaciones se aflojan a la propiedad que seguían cuidando.
afirmar(
  quieto.includes(CONTENIDO.titular) && veces(quieto, 'will-change-transform') === 0,
  'el titular sale entero en la rama quieta, y ahí no se promueve una sola capa',
)
afirmarIgual(
  veces(conPreferencia, 'will-change-transform'),
  0,
  '  y con la preferencia sigue siendo el árbol quieto, no una versión apagada',
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
// Las seis tomas se piden con leyendas DISTINTAS: con dos iguales, el intercambio del
// hover sería indistinguible de un parpadeo y no se podría afirmar que cambió la imagen.
const LEYENDAS: readonly string[] = [
  ...CONTENIDO.personas.flatMap((p) => [p.seria.leyenda, p.suelta.leyenda]),
  CONTENIDO.equipo.seria.leyenda,
  CONTENIDO.equipo.suelta.leyenda,
]
afirmarIgual(LEYENDAS.length, 6, '  y las tres fichas piden DOS tomas cada una')
afirmarIgual(new Set(LEYENDAS).size, LEYENDAS.length, '  con las seis leyendas distintas: así el intercambio se puede ver')

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · El árbol de encabezados')

afirmarIgual(veces(quieto, '<h1'), 0, 'ningún h1: el h1 es del Hero')
afirmarIgual(veces(quieto, '<h2'), 1, 'exactamente UN h2 — el titular de la sección')
afirmarIgual(veces(conMotion, '<h2'), 1, '  y sigue siendo uno con la coreografía partiendo el texto')
// El bloque nuevo mete un nivel: «El Equipo» es el h3 que cuelga del titular, y cada
// persona es un h4 adentro de él. Los nombres siguen siendo encabezados, no párrafos
// con tamaño de título, que es lo que esta afirmación cuida.
afirmarIgual(veces(quieto, '<h3'), 1, 'un solo h3: el rótulo del bloque del equipo')
afirmar(new RegExp(`<h3[^>]*>${CONTENIDO.tituloDelEquipo}</h3>`).test(quieto), `  y es «${CONTENIDO.tituloDelEquipo}»`)
afirmarIgual(veces(quieto, '<h4'), 2, 'y dos h4: uno por persona')
for (const persona of CONTENIDO.personas) {
  afirmar(
    new RegExp(`<h4[^>]*>${persona.nombre}</h4>`).test(quieto),
    `"${persona.nombre}" es un h4, no un párrafo con tamaño de título`,
  )
}
controlPositivo(
  'el chequeo del h4 ve un nombre que no es encabezado',
  '<p>Franco</p>',
  (html: string) => /<h4[^>]*>Franco<\/h4>/.test(html),
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
// 12: cuatro por marco —la toma que crece, el velo, y las dos clases de estado del
// único texto que quedó en el hover— por los tres marcos. Bajó de 23 cuando el revelado
// dejó de tener dos partes escalonadas: ahora es el puesto, solo, con su máscara. Lo
// que esta afirmación cuida no es el número sino la de arriba: ninguna viaja sin gemela.
// 24: ocho por marco, por los tres. Por marco: el acercamiento de la toma seria (escala
// y duración), la suelta que crece (recorte y duración), el velo (opacidad) y el texto
// (subida, duración y el retardo que lo hace arrancar cuando la imagen ya se reveló).
afirmarIgual(hovers, 24, '  y en esta sección son 24: ocho por cada uno de los tres marcos')
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
  [{ ruta: 'no.existe', clase: 'prosa' as const, marcador: null, quienLoTrae: 'valentino' as const, que: 'nada', formato: 'texto plano' }],
  (p) => entradasColgadas(CONTENIDO, p).length === 0,
)
afirmarIgual(
  [...new Set(PEDIDO.map((e) => e.clase))].sort(),
  ['foto', 'prosa'],
  'el pedido cubre la prosa y la foto del equipo, que es el único archivo que falta acá',
)
afirmar(PEDIDO.every((e) => e.formato.length > 0), '  y todas las entradas dicen en qué formato entra el dato')

afirmarIgual(PATRONES_DE_LA_SECCION, ['P1', 'P2'], 'la sección declara consumir P1 y P2, y nada más')

cerrar('quienes-somos.invariant')
