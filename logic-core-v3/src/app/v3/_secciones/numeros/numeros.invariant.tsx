/**
 * INVARIANTE — 03 · Números.
 *
 * Corre con `npx tsx src/app/v3/_secciones/numeros/numeros.invariant.tsx`.
 *
 * La sección se renderiza DE VERDAD tres veces en el mismo proceso: en su rama
 * quieta (`modo="nunca"` — lo que pasa abajo de 1025 y con
 * `prefers-reduced-motion`), con la coreografía forzada, y con la preferencia
 * mandando sobre el modo forzado. Todo se afirma sobre el MARCADO.
 *
 * ── Por qué la mitad interesante es geométrica ─────────────────────────────
 *
 * El requisito central —*"dispersos en posiciones asimétricas y tamaños
 * distintos; una barra de cuatro columnas pierde el efecto entero"*— es una
 * propiedad de la FORMA, y una forma se puede afirmar. Por eso las celdas no se
 * leen de `GEOMETRIA`: se **parsean de las clases renderizadas**, y sobre esos
 * números se comprueba que no hay barra de columnas iguales, que ninguna se
 * sale de las doce y que ninguna se superpone. Leer la constante en vez del
 * marcado quedaría verde el día que una clase armada por interpolación dejara
 * de emitirse — el modo de falla que `GEOMETRIA` documenta.
 *
 * ⚠ **B2 le agrega una coordenada a esa forma: la PANTALLA.** La sección se
 * compone en cuatro cajas de pantalla y las filas son locales a su caja, así
 * que una celda sin su pantalla ya no ubica nada. El censo corta por
 * `data-pantalla` y afirma que **ninguna cifra comparte renglón con otra** —más
 * fuerte que las tres filas distintas que se pedían cuando las cinco vivían en
 * una sola pantalla—.
 *
 * ⚠ Acá no hay P1, así que no hay fase de medición que esperar: los seis bloques
 * son P2 y escriben transformada en el primer cuadro — ése es el control
 * positivo de "abajo de 1025 no se mueve nada". */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import {
  cuentaDeMarcadores,
  hallazgosDeCifraConSimbolo,
  hallazgosDeDigito,
  hallazgosDeMarcadorDesconocido,
  marcadoresPedidos,
  numerosDe,
  textosDe,
} from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO, type ClaveDeCifra } from './contenido'
import { GEOMETRIA, Numeros } from './Numeros'

const seccion = seccionDe('numeros')

const seccionMontada = <Numeros seccion={seccion} />

/** La rama de abajo de 1025 — y la misma que produce la preferencia de S2. */
const quieto = marcar(seccionMontada, { anima: false })
/** El control positivo: la coreografía forzada, sin la preferencia. */
const conMotion = marcar(seccionMontada, { anima: true })
/**
 * ⚠ QUÉ SIGNIFICA `conPreferencia` DESPUÉS DE SITIO-S7. Antes la sección
 * consultaba la compuerta por su cuenta y la política de movimiento reducido la
 * apagaba desde adentro. Ahora la compuerta se resuelve UNA vez arriba de las
 * ocho y **la preferencia se lee ahí**: con `prefers-reduced-motion` puesto,
 * `CompuertaDelHome` no instala una sola primitiva animada, o sea que esa
 * persona recibe **el árbol quieto** — que es lo que este render reproduce. La
 * política no cambió de fuerza: cambió de lugar, y se aplica antes de que
 * exista un árbol animado que apagar. La tabla de verdad es `deberiaAnimar`,
 * pura y afirmada abajo, sin montar React ni depender de esta sección.
 */
const conPreferencia = marcar(seccionMontada, { anima: false, preferencia: 'always' })

const veces = (html: string, aguja: string): number => html.split(aguja).length - 1
const distintos = (v: readonly (number | string)[]): number => new Set(v).size
const TEXTOS = textosDe(CONTENIDO)
const ROTULOS = CONTENIDO.cifras.map((c) => c.rotulo)
const FUENTE = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'Numeros.tsx'), 'utf8')

/** Una celda de la composición, leída del marcado y no de la constante. */
interface CeldaLeida {
  /** La caja de pantalla en la que cae. B2: la fila es local a su caja. */
  readonly pantalla: string
  readonly col: number
  readonly ancho: number
  readonly fila: number
}

function celdaDe(clases: string, pantalla: string): CeldaLeida {
  const n = (re: RegExp): number => {
    const m = re.exec(clases)
    if (m === null) throw new Error(`falta ${re.source} en "${clases}"`)
    return Number.parseInt(m[1], 10)
  }
  return { pantalla, col: n(/tablet:col-start-(\d+)/), ancho: n(/tablet:col-span-(\d+)/), fila: n(/tablet:row-start-(\d+)/) }
}

/** Los ítems posicionados, POR PANTALLA y en orden de documento: la cabecera y
 *  las cinco cifras. Sin el corte por `data-pantalla` la fila no ubica nada. */
const celdasDe = (html: string): CeldaLeida[] =>
  html.split('data-pantalla="').slice(1).flatMap((t) => {
    const pantalla = t.slice(0, t.indexOf('"'))
    return [...t.matchAll(/class="([^"]*tablet:col-start-\d+[^"]*)"/g)].map((m) => celdaDe(m[1], pantalla))
  })

/** Dos celdas de la MISMA pantalla y fila cuyas columnas se pisan. Pantallas
 *  distintas nunca se pisan: son cajas distintas del flujo. */
const seSuperponen = (c: readonly CeldaLeida[]): boolean =>
  c.some((a, i) => c.some((b, j) => i !== j && a.pantalla === b.pantalla && a.fila === b.fila && a.col < b.col + b.ancho && b.col < a.col + a.ancho))

/** La pantalla que la tabla le asigna a una cifra. */
const pantallaDe = (clave: ClaveDeCifra): string =>
  GEOMETRIA.pantallas.find((p) => p.cifras.includes(clave))?.id ?? '(ninguna)'

/** Los `grid-cols-N` numéricos del marcado, sin repetir y ordenados. */
const columnasDe = (html: string): number[] => [
  ...new Set([...html.matchAll(/\bgrid-cols-(\d+)\b/g)].map((m) => Number.parseInt(m[1], 10))),
].sort((a, b) => a - b)

/** El nivel de cada cifra: el primer `data-nivel` después de su `data-cifra`. */
const nivelesDe = (html: string): string[][] =>
  [...html.matchAll(/data-cifra="([^"]+)"[\s\S]*?data-nivel="([^"]+)"/g)].map((m) => [m[1], m[2]])

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El alto, la superficie y el pinneo salen de la tabla, no de acá')

afirmarIgual(seccion.superficie, 'papel-opaco', 'la superficie es papel-opaco: el canvas no se ve')
afirmarIgual(pantallasDe(seccion), 4, 'ocupa CUATRO pantallas — B2 la subió de una, ver el docblock de su fila en `secciones.ts`')
afirmarIgual(seccion.pinneada, undefined, 'y NO es pinneada: la pantalla scrollea')
afirmarIgual(veces(quieto, 'data-pinneado="sticky"'), 0, '  no hay un solo hijo sticky en el marcado')
/** ⚠ **B2 · ERA `1` Y AHORA SON CUATRO, atadas a la tabla.** La Fase 0 subió la
 *  sección a 400svh y la composición seguía siendo UNA caja: `s10-mobile` §2 lo
 *  publicaba en rojo y el censo medía CERO grupos adentro de `[4320, 8640]`,
 *  porque los seis bloques aterrizaban entre 3720 y 4320, fuera de la sección. */
afirmarIgual(veces(quieto, 'min-h-svh'), pantallasDe(seccion), 'y CUATRO cajas de pantalla, una por pantalla declarada: la composición se reparte sobre las cuatro')
afirmarIgual(veces(quieto, 'data-pantalla='), pantallasDe(seccion), '  y las cuatro se declaran en el marcado — la cuenta sale de la tabla, no de un número escrito acá')
afirmarIgual(GEOMETRIA.pantallas.length, pantallasDe(seccion), '  y la tabla de la composición declara las mismas cuatro')
afirmarIgual(GEOMETRIA.pantallas.flatMap((p) => p.cifras), CONTENIDO.cifras.map((c) => c.clave), '  que reparten las CINCO cifras en el orden de lectura, sin repetir ni perder ninguna')
afirmarIgual(GEOMETRIA.pantallas.filter((p) => p.cabecera).map((p) => p.id), ['entrada'], '  y UNA sola lleva la cabecera: es lo que la separa del primer aterrizaje de cifra')
controlPositivo('el reparto vería una cifra perdida', GEOMETRIA.pantallas.map((p) => ({ ...p, cifras: p.cifras.slice(1) })), (ps: readonly { readonly cifras: readonly ClaveDeCifra[] }[]) => ps.flatMap((p) => p.cifras).length === CONTENIDO.cifras.length)
controlPositivo('la lectura del alto ve un alto distinto', { ...seccion, alto: '200svh' }, (s) => pantallasDe(s) === 4)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El contenido no se puede leer como un dato — la sección donde más cuesta')

afirmar(TEXTOS.length > 0, `el contenido tiene ${TEXTOS.length} textos: la cuenta no es vacía`)
afirmarIgual(hallazgosDeCifraConSimbolo(CONTENIDO).length, 0, 'cero cifras con símbolo')
controlPositivo('el detector ve un +340%', { a: 'crecimos +340%' }, (c) => hallazgosDeCifraConSimbolo(c).length === 0)
afirmarIgual(hallazgosDeDigito(CONTENIDO).length, 0, 'cero dígitos, punto')
controlPositivo('el detector ve un 12 sin símbolo', { a: '12 proyectos' }, (c) => hallazgosDeDigito(c).length === 0)
afirmarIgual(numerosDe(CONTENIDO).length, 0, 'cero hojas numéricas: nada que el escáner de cadenas no vea')
controlPositivo('el detector ve un { clientes: 12 }', { clientes: 12 }, (c) => numerosDe(c).length === 0)
afirmarIgual(hallazgosDeMarcadorDesconocido(CONTENIDO).length, 0, 'cero marcadores fuera del conjunto cerrado')
controlPositivo('ve un [METRICA] sin tilde', { a: '[METRICA]' }, (c) => hallazgosDeMarcadorDesconocido(c).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · CINCO cifras y CINCO rótulos, y los diez llegan a la pantalla')

afirmarIgual(CONTENIDO.cifras.length, 5, 'son exactamente cinco casillas')
afirmarIgual(marcadoresPedidos(CONTENIDO), ['[CIFRA]'], 'el único marcador pedido es [CIFRA]')
afirmarIgual(cuentaDeMarcadores(CONTENIDO).get('[CIFRA]'), 5, '  y son cinco casillas vacías, no una')
afirmarIgual(veces(quieto, '[CIFRA]'), 5, 'los cinco [CIFRA] llegan al marcado quieto')
afirmarIgual(veces(conMotion, '[CIFRA]'), 5, '  y también con la coreografía puesta')
controlPositivo('ve un marcado sin marcadores', '<div>nada</div>', (h: string) => veces(h, '[CIFRA]') === 5)
afirmarIgual(distintos(ROTULOS), 5, 'los cinco rótulos son distintos entre sí')
afirmarIgual(ROTULOS.filter((r) => !quieto.includes(r)), [], 'y los cinco llegan: cada hueco dice QUÉ falta')
afirmar(ROTULOS.every((r) => conMotion.includes(r)), '  y siguen ahí con la coreografía puesta')
controlPositivo('ve un marcado sin rótulos', '<p>[CIFRA]</p>', (h: string) => ROTULOS.every((r) => h.includes(r)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las cifras NO están en una barra de columnas iguales')

const COLUMNAS = columnasDe(quieto)
afirmarIgual(COLUMNAS, [1, 12], 'las únicas grillas numéricas del marcado son la de 1 y la de 12')
const sinBarra = (h: string): boolean => !columnasDe(h).includes(4) && !columnasDe(h).includes(5)
afirmar(sinBarra(quieto), 'no hay barra de cuatro ni de cinco columnas iguales: el efecto no se pierde')
controlPositivo('ve una barra de cuatro columnas iguales', '<div class="grid grid-cols-4"><i>a</i></div>', sinBarra)
afirmarIgual(veces(quieto, 'data-composicion="dispersa"'), pantallasDe(seccion), 'y hay UNA composición dispersa POR PANTALLA declarada, ni una suelta de más: B2 la repartió sobre las cuatro y la cuenta se ata a la tabla')
afirmar(quieto.includes(`tablet:grid-cols-${GEOMETRIA.columnas}`), 'la grilla tiene las columnas que declara GEOMETRIA')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La composición es asimétrica — celdas parseadas DEL MARCADO')

const CELDAS = celdasDe(quieto)
const CIFRAS = CELDAS.slice(1)
afirmarIgual(CELDAS.length, 6, 'hay seis ítems posicionados: la cabecera y las cinco cifras')
afirmarIgual(CIFRAS.length, 5, '  y cinco de ellos son cifras: la cuenta no es vacía')
afirmarIgual(CIFRAS, CONTENIDO.cifras.map((c) => celdaDe(GEOMETRIA.celdas[c.clave].celda, pantallaDe(c.clave))), '  y son las que declara GEOMETRIA, en la pantalla que le toca a cada una y en el orden de lectura')
afirmar(distintos(CIFRAS.map((c) => c.col)) >= 4, 'al menos cuatro columnas de arranque distintas', CIFRAS.map((c) => c.col).join(' · '))
afirmar(distintos(CIFRAS.map((c) => c.ancho)) >= 3, 'al menos tres anchos distintos: no son iguales', CIFRAS.map((c) => c.ancho).join(' · '))
/** ⚠ **B2 · REEMPLAZA A «al menos tres filas distintas», y es más exigente.**
 *  Aquélla toleraba que dos cifras compartieran renglón, y las dos que lo
 *  compartían se separaban con 80 px de desplome —menos de un paso del censo,
 *  así que aterrizaban juntas—. Ahora las CINCO tienen renglón propio en
 *  pantalla propia: cinco pares `(pantalla, fila)` distintos. */
afirmar(distintos(CIFRAS.map((c) => `${c.pantalla}·${c.fila}`)) === 5, 'ninguna cifra comparte renglón con otra: cada una tiene su fila en su pantalla', CIFRAS.map((c) => `${c.pantalla}·${c.fila}`).join(' · '))
afirmar(distintos(CIFRAS.map((c) => c.pantalla)) === 3, '  y se reparten en TRES pantallas: la cuarta es la de la cabecera', CIFRAS.map((c) => c.pantalla).join(' · '))
controlPositivo('ve cinco celdas idénticas', Array.from({ length: 5 }, () => ({ pantalla: 'volumen', col: 1, ancho: 3, fila: 1 })), (c: readonly CeldaLeida[]) => distintos(c.map((x) => x.col)) >= 4 && distintos(c.map((x) => x.ancho)) >= 3)
controlPositivo('ve dos cifras compartiendo renglón en la misma pantalla', [{ pantalla: 'volumen', col: 1, ancho: 5, fila: 1 }, { pantalla: 'volumen', col: 9, ancho: 4, fila: 1 }], (c: readonly CeldaLeida[]) => distintos(c.map((x) => `${x.pantalla}·${x.fila}`)) === c.length)
const desborda = (c: readonly CeldaLeida[]): number => c.filter((x) => x.col + x.ancho - 1 > GEOMETRIA.columnas).length
afirmarIgual(desborda(CELDAS), 0, 'ninguna celda se sale de las doce columnas: nada desborda al angostar')
afirmar(!seSuperponen(CELDAS), 'ninguna celda se superpone con otra: nada tapa a nada')
controlPositivo('ve dos celdas pisadas', [{ pantalla: 'volumen', col: 1, ancho: 6, fila: 1 }, { pantalla: 'volumen', col: 4, ancho: 4, fila: 1 }], (c: readonly CeldaLeida[]) => !seSuperponen(c))
controlPositivo('  y NO las ve en pantallas distintas: son cajas distintas del flujo', [{ pantalla: 'volumen', col: 1, ancho: 6, fila: 1 }, { pantalla: 'tiempo', col: 4, ancho: 4, fila: 1 }], (c: readonly CeldaLeida[]) => seSuperponen(c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Cuatro tamaños distintos entre las cinco cifras, contados en el marcado')

const NIVELES = nivelesDe(quieto)
afirmarIgual(NIVELES.length, 5, 'las cinco cifras declaran su nivel tipográfico en el marcado')
afirmarIgual(NIVELES, CONTENIDO.cifras.map((c) => [c.clave, GEOMETRIA.celdas[c.clave].nivel]), '  y cada una es la que le asignó GEOMETRIA')
const tamanos = (h: string): number => distintos(nivelesDe(h).map((n) => n[1]))
afirmar(tamanos(quieto) >= 4, 'al menos CUATRO tamaños distintos entre las cinco: la jerarquía existe', NIVELES.map((n) => n[1]).join(' · '))
afirmarIgual(tamanos(quieto), 4, '  cuatro y no cinco: la escala de display tiene exactamente cuatro niveles')
controlPositivo('ve cinco cifras del mismo nivel', '<p data-cifra="a"><span data-nivel="titulo-m">x</span></p>'.repeat(5), (h: string) => tamanos(h) >= 4)
afirmar(tamanos(conMotion) >= 4, 'y la asimetría de tamaños es la misma con la coreografía puesta')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Abajo de 1025 el contenido está COMPLETO, en orden y no se mueve')

afirmarIgual(TEXTOS.filter((h) => !quieto.includes(h.valor)).map((h) => h.ruta), [], 'los textos llegan enteros')
controlPositivo('ve un marcado al que le falta un texto', '<div>Números</div>', (h: string) => TEXTOS.every((t) => h.includes(t.valor)))

const enOrden = (html: string): boolean => {
  const p = ROTULOS.map((r) => html.indexOf(r))
  return p.every((x, i) => x >= 0 && (i === 0 || x > p[i - 1]))
}
afirmar(enOrden(quieto), 'los cinco rótulos salen en el orden de lectura declarado en contenido.ts')
controlPositivo('ve dos rótulos dados vuelta', ROTULOS.map((_, i) => `<i>${ROTULOS[i === 0 ? 1 : i === 1 ? 0 : i]}</i>`).join(''), enOrden)
afirmar(!quieto.includes('transform:'), 'la rama quieta no escribe una sola transformada')
afirmar(!quieto.includes('will-change'), '  ni promueve una capa de composición')
afirmar(!conPreferencia.includes('transform:'), 'y con `prefers-reduced-motion` tampoco: la compuerta no instala nada')
controlPositivo('ve un style con transform', '<div style="transform:translateY(10%)"></div>', (h: string) => !h.includes('transform:'))

/** Abajo de 768 la composición se apila: TODO desplazamiento vive en `tablet:`.
 *  Un `col-start` sin prefijo posicionaría en un viewport de 375, donde la
 *  grilla tiene UNA columna, y la cifra caería fuera de lugar en silencio. */
const SIN_PREFIJO = /(?<!tablet:)\b(col-start|col-span|row-start|mt)-\d+/
afirmar(!SIN_PREFIJO.test(quieto), 'ningún desplazamiento se aplica abajo de 768: todos son `tablet:`')
afirmar(quieto.includes('grid-cols-1'), '  y abajo de 768 la composición cae a UNA columna')
controlPositivo('ve un col-start suelto', '<div class="col-start-3">x</div>', (h: string) => !SIN_PREFIJO.test(h))

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · CONTROL POSITIVO — con la coreografía puesta, SÍ se anima')

afirmar(conMotion.includes('transform:'), 'con coreografía los bloques P2 SÍ escriben transformada')
afirmarIgual(veces(conMotion, 'will-change-transform'), 6, 'y son los SEIS bloques: la cabecera y uno por cifra — de ahí sale el escalonado')
afirmarIgual(veces(quieto, 'will-change-transform'), 0, '  y ninguno en la rama quieta')

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · El árbol de encabezados y la higiene del lane')

afirmarIgual(veces(quieto, '<h1'), 0, 'ningún h1: el h1 es del Hero')
afirmarIgual(veces(quieto, '<h2'), 1, 'exactamente UN h2 — el titular de la sección')
afirmarIgual(veces(conMotion, '<h2'), 1, '  y sigue siendo uno con la coreografía')
afirmarIgual(veces(quieto, '<h3'), 0, 'y ningún h3: una cifra no es un encabezado')
controlPositivo('el chequeo del h2 ve un marcado con dos', '<h2>a</h2><h2>b</h2>', (h: string) => veces(h, '<h2') === 1)

afirmarIgual(veces(quieto, 'text-acento'), 0, 'cero `text-acento`: sobre fondo oscuro no llega a 3:1')
afirmarIgual(veces(quieto, 'outline-none'), 0, 'cero `outline-none`: el anillo de foco lo pone el tema')
afirmar(!/#[0-9a-fA-F]{3,8}\b/.test(quieto), 'cero color fuera de los tokens: ni un hex suelto')
afirmar(!/-\[\d+(px|rem)\]/.test(quieto), 'cero px o rem suelto en un valor arbitrario de clase')
controlPositivo('el chequeo del hex ve un hex', '<i style="color:#ff0000">', (h: string) => !/#[0-9a-fA-F]{3,8}\b/.test(h))
controlPositivo('el chequeo del px suelto ve un mt-[7px]', '<i class="mt-[7px]">', (h: string) => !/-\[\d+(px|rem)\]/.test(h))

/** Esta sección no tiene un solo elemento interactivo, y es una decisión: el CTA
 *  del recorrido vive en el Hero y en el Cierre. La afirmación se hace igual
 *  porque lo que comprueba no es que haya cero controles, sino que si apareciera
 *  uno sería nativo y focalizable. */
const hovers = veces(quieto, 'hover:')
afirmarIgual(hovers, veces(quieto, 'focus-visible:'), 'toda `hover:` tiene su gemela `focus-visible:`')
afirmarIgual(hovers, 0, '  y acá son cero: no hay nada interactivo')
afirmarIgual(veces(quieto, '<button'), 0, 'cero botones')
afirmarIgual(veces(quieto, '<a '), 0, 'cero enlaces')
afirmarIgual(veces(FUENTE, 'onClick'), 0, 'cero `onClick` en la fuente: ningún div haciendo de botón')
controlPositivo('ve un div clickeable', '<div onClick={ir}>ir</div>', (s: string) => veces(s, 'onClick') === 0)
afirmarIgual(veces(FUENTE, 'motion/_componentes'), 0, 'la única puerta a las piezas es `_contrato/piezas`')
/** ⚠ La entrada equivocada es el ESPECIFICADOR solo, sin la palabra `from`
 *  delante. Escrito como un import completo, el escáner de imports de
 *  `s5-codigo.invariant.ts` lo levantaría de ESTE archivo y reportaría que el
 *  invariante importa de `motion/_componentes` — un falso positivo en un
 *  instrumento transversal, causado por el control positivo de otro. */
controlPositivo('ve un especificador a motion/_componentes', '../../motion/_componentes/Pieza', (s: string) =>
  veces(s, 'motion/_componentes') === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · El pedido y los patrones declarados')

afirmar(PEDIDO.length > 0, `el pedido tiene ${PEDIDO.length} entradas: no es una lista vacía`)
afirmarIgual(entradasColgadas(CONTENIDO, PEDIDO).map((e) => e.ruta), [], 'ninguna apunta a una ruta inexistente')
controlPositivo('ve una ruta inventada', [{ ruta: 'no.existe', clase: 'prosa' as const, marcador: null, quienLoTrae: 'valentino' as const, que: 'nada', formato: 'texto plano' }], (p) => entradasColgadas(CONTENIDO, p).length === 0)
afirmarIgual(PEDIDO.filter((e) => e.clase === 'cifra').length, 5, 'cinco entradas `cifra`, una por casilla vacía')
afirmarIgual(PEDIDO.filter((e) => e.clase === 'prosa').length, 2, 'y dos de `prosa`: el titular y la bajada')
afirmarIgual(PATRONES_DE_LA_SECCION, ['P2'], 'la sección declara consumir P2, y nada más')

cerrar('numeros.invariant')
