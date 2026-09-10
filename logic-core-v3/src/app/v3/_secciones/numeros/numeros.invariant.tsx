/**
 * INVARIANTE — 03 · Números.
 *
 * Corre con `npx tsx src/app/v3/_secciones/numeros/numeros.invariant.tsx`. La
 * sección se renderiza DE VERDAD tres veces: quieta (`modo="nunca"`, abajo de
 * 1025 y con `prefers-reduced-motion`), con la coreografía forzada, y con la
 * preferencia mandando sobre el modo forzado. Todo se afirma sobre el MARCADO, y
 * la mitad interesante es geométrica: la dispersión es una propiedad de la FORMA,
 * así que las celdas se **parsean de las clases renderizadas** —no de `GEOMETRIA`,
 * que quedaría verde si una clase interpolada dejara de emitirse— y sobre esos
 * números se comprueba que no hay barra, que nada desborda y nada se pisa. B2 le
 * agregó la PANTALLA (las filas son locales a su caja) y afirma que ninguna cifra
 * comparte renglón. Sin P1: los seis bloques son P2 y escriben transformada en el
 * primer cuadro — el control positivo de "abajo de 1025 no se mueve nada". */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import {
  cuentaDeMarcadores,
  marcadoresPedidos,
  textosDe,
} from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { claseDe, etiquetasDeAperturaCon } from '../_invariantes/marcado'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO, type ClaveDeCifra } from './contenido'
import { afirmarQueElContenidoNoEsUnDato, conLaLlaveApagada } from '../_invariantes/llave'
import { GEOMETRIA, Numeros } from './Numeros'

const seccion = seccionDe('numeros')

const seccionMontada = <Numeros seccion={seccion} />

/** La rama de abajo de 1025 — y la misma que produce la preferencia de S2. */
const quieto = marcar(seccionMontada, { anima: false })
/** El control positivo: la coreografía forzada, sin la preferencia. */
const conMotion = marcar(seccionMontada, { anima: true })
/** ⚠ Desde SITIO-S7 la compuerta se resuelve UNA vez arriba de las ocho y la preferencia
 *  se lee ahí: con `prefers-reduced-motion`, `CompuertaDelHome` no instala una primitiva
 *  animada y esa persona recibe **el árbol quieto** (`deberiaAnimar`, pura y afirmada aparte). */
const conPreferencia = marcar(seccionMontada, { anima: false, preferencia: 'always' })

const veces = (html: string, aguja: string): number => html.split(aguja).length - 1
const distintos = (v: readonly (number | string)[]): number => new Set(v).size
const TEXTOS = textosDe(CONTENIDO)
const ROTULOS = CONTENIDO.cifras.map((c) => c.rotulo)
const FUENTE = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'Numeros.tsx'), 'utf8')

/** Una celda de la composición, leída del marcado y no de la constante; `pantalla` es la caja en la que cae (B2: la fila es local a su caja). */
interface CeldaLeida { readonly pantalla: string; readonly col: number; readonly ancho: number; readonly fila: number }

function celdaDe(clases: string, pantalla: string): CeldaLeida {
  const n = (re: RegExp): number => {
    const m = re.exec(clases)
    if (m === null) throw new Error(`falta ${re.source} en "${clases}"`)
    return Number.parseInt(m[1], 10)
  }
  return { pantalla, col: n(/tablet:col-start-(\d+)/), ancho: n(/tablet:col-span-(\d+)/), fila: n(/tablet:row-start-(\d+)/) }
}

/** La pieza que `EtiquetaDeSeccion` emite en el marcado: distingue al rótulo de una celda. */
const MARCA_DEL_ROTULO = 'data-pieza="etiqueta-de-seccion"'
const posicionados = (t: string): string[] => etiquetasDeAperturaCon(t, 'tablet:col-start-')

/**
 * Los ítems posicionados, POR PANTALLA y en orden de documento: la cabecera y
 * las cinco cifras. ⚠ **B11 · EL CONTADOR TENÍA UN DEFECTO Y SE ARREGLA, NO SE
 * AFLOJA:** levantaba toda clase con `tablet:col-start-`, y por eso el rótulo iba
 * sin `col-start` (posicionado, era una sexta cifra). Ahora salta el rótulo POR
 * SU PIEZA, no por su clase; el control positivo prueba que sólo la marca lo salva.
 */
const celdasDe = (html: string): CeldaLeida[] =>
  html.split('data-pantalla="').slice(1).flatMap((t) => {
    const pantalla = t.slice(0, t.indexOf('"'))
    return posicionados(t)
      .filter((tag) => !tag.includes(MARCA_DEL_ROTULO))
      .map((tag) => celdaDe(claseDe(tag), pantalla))
  })

/** Fixtura con y sin la marca del rótulo: mantiene honestos a los dos lectores. */
const FIXTURA_DE_ROTULO = (conPieza: boolean): string =>
  `<div data-pantalla="entrada"><p ${conPieza ? `${MARCA_DEL_ROTULO} ` : ''}class="tablet:col-start-7 tablet:col-span-1 tablet:row-start-1">N</p><div class="tablet:col-start-7 tablet:col-span-6 tablet:row-start-2">c</div></div>`

/** La columna de arranque del rótulo de sección, leída del marcado; `null` si no está posicionado. */
const rotuloDe = (html: string): { readonly pantalla: string; readonly col: number } | null => {
  for (const t of html.split('data-pantalla="').slice(1)) {
    const tag = posicionados(t).find((x) => x.includes(MARCA_DEL_ROTULO))
    if (tag !== undefined) return { pantalla: t.slice(0, t.indexOf('"')), col: Number.parseInt(/tablet:col-start-(\d+)/.exec(claseDe(tag))?.[1] ?? '0', 10) }
  }
  return null
}

/** Dos celdas de la MISMA pantalla y fila cuyas columnas se pisan; pantallas distintas nunca (son cajas distintas del flujo). */
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

/** ⚠️ B8 · Custodiaba `papel-opaco` (S5; B6-A midió que el logo quedaba detrás del 39,9 % del cuerpo). El humano la abrió igual —«las secciones
 *  1, 2, 3, 4, 7 y 8 ven la sala»— y lo que eso rompe se DECLARA, no se tapa: `s10-acceso` §10 lo cita, `s8-tinta` §4 lo mide, y lo que no llega a AA es deuda declarada. */
afirmarIgual(seccion.superficie, 'papel-transparente', 'la superficie es papel-transparente: el canvas se ve (B8, por decisión)')
afirmarIgual(pantallasDe(seccion), 4, 'ocupa CUATRO pantallas — B2 la subió de una, ver el docblock de su fila en `secciones.ts`')
afirmarIgual(seccion.pinneada, undefined, 'y NO es pinneada: la pantalla scrollea')
afirmarIgual(veces(quieto, 'data-pinneado="sticky"'), 0, '  no hay un solo hijo sticky en el marcado')
/** ⚠ B2 · ERA `1` Y AHORA SON CUATRO, atadas a la tabla: la Fase 0 subió la sección a
 *  400svh con UNA caja, `s10-mobile` §2 en rojo y CERO grupos del censo en `[4320, 8640]`. */
afirmarIgual(veces(quieto, 'min-h-svh'), pantallasDe(seccion), 'y CUATRO cajas de pantalla, una por pantalla declarada: la composición se reparte sobre las cuatro')
afirmarIgual(veces(quieto, 'data-pantalla='), pantallasDe(seccion), '  y las cuatro se declaran en el marcado — la cuenta sale de la tabla, no de un número escrito acá')
afirmarIgual(GEOMETRIA.pantallas.length, pantallasDe(seccion), '  y la tabla de la composición declara las mismas cuatro')
afirmarIgual(GEOMETRIA.pantallas.flatMap((p) => p.cifras), CONTENIDO.cifras.map((c) => c.clave), '  que reparten las CINCO cifras en el orden de lectura, sin repetir ni perder ninguna')
afirmarIgual(GEOMETRIA.pantallas.filter((p) => p.cabecera).map((p) => p.id), ['entrada'], '  y UNA sola lleva la cabecera: es lo que la separa del primer aterrizaje de cifra')
controlPositivo('el reparto vería una cifra perdida', GEOMETRIA.pantallas.map((p) => ({ ...p, cifras: p.cifras.slice(1) })), (ps: readonly { readonly cifras: readonly ClaveDeCifra[] }[]) => ps.flatMap((p) => p.cifras).length === CONTENIDO.cifras.length)
controlPositivo('la lectura del alto ve un alto distinto', { ...seccion, alto: '200svh' }, (s) => pantallasDe(s) === 4)

/** ⚠️ B12 §4 · esta sección muestra contenido INVENTADO; todo se afirma sobre
 *  estas vistas con la llave apagada. El porqué, en `_invariantes/llave.ts`. */
const { SIN_LLAVE, quietoSinLlave, animadoSinLlave } = conLaLlaveApagada(CONTENIDO, quieto, conMotion)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El contenido no se puede leer como un dato — la sección donde más cuesta')

afirmar(TEXTOS.length > 0, `el contenido tiene ${TEXTOS.length} textos: la cuenta no es vacía`)
afirmarQueElContenidoNoEsUnDato(CONTENIDO, SIN_LLAVE)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · CINCO cifras y CINCO rótulos, y los diez llegan a la pantalla')

afirmarIgual(CONTENIDO.cifras.length, 5, 'son exactamente cinco casillas')
afirmarIgual(marcadoresPedidos(SIN_LLAVE), ['[CIFRA]'], 'el único marcador pedido es [CIFRA]')
afirmarIgual(cuentaDeMarcadores(SIN_LLAVE).get('[CIFRA]'), 5, '  y son cinco casillas vacías, no una')
afirmarIgual(veces(quietoSinLlave, '[CIFRA]'), 5, 'los cinco [CIFRA] llegan al marcado quieto')
afirmarIgual(veces(animadoSinLlave, '[CIFRA]'), 5, '  y también con la coreografía puesta')
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
/** ⚠ **B2 · REEMPLAZA A «al menos tres filas distintas», y es más exigente:** aquélla
 *  toleraba dos cifras en un renglón separadas por 80 px de desplome (menos de un paso
 *  del censo: aterrizaban juntas). Ahora: cinco pares `(pantalla, fila)` distintos. */
afirmar(distintos(CIFRAS.map((c) => `${c.pantalla}·${c.fila}`)) === 5, 'ninguna cifra comparte renglón con otra: cada una tiene su fila en su pantalla', CIFRAS.map((c) => `${c.pantalla}·${c.fila}`).join(' · '))
afirmar(distintos(CIFRAS.map((c) => c.pantalla)) === 3, '  y se reparten en TRES pantallas: la cuarta es la de la cabecera', CIFRAS.map((c) => c.pantalla).join(' · '))
controlPositivo('ve cinco celdas idénticas', Array.from({ length: 5 }, () => ({ pantalla: 'volumen', col: 1, ancho: 3, fila: 1 })), (c: readonly CeldaLeida[]) => distintos(c.map((x) => x.col)) >= 4 && distintos(c.map((x) => x.ancho)) >= 3)
controlPositivo('ve dos cifras compartiendo renglón en la misma pantalla', [{ pantalla: 'volumen', col: 1, ancho: 5, fila: 1 }, { pantalla: 'volumen', col: 9, ancho: 4, fila: 1 }], (c: readonly CeldaLeida[]) => distintos(c.map((x) => `${x.pantalla}·${x.fila}`)) === c.length)
const desborda = (c: readonly CeldaLeida[]): number => c.filter((x) => x.col + x.ancho - 1 > GEOMETRIA.columnas).length
afirmarIgual(desborda(CELDAS), 0, 'ninguna celda se sale de las doce columnas: nada desborda al angostar')
afirmar(!seSuperponen(CELDAS), 'ninguna celda se superpone con otra: nada tapa a nada')

/** ⚠️ B12 · La afirmación del rótulo se da vuelta (regla 15): estaba posicionado
 *  y ahora se afirma que NO está, con el MISMO lector. */
const ROTULO = rotuloDe(quieto)
afirmarIgual(ROTULO, null, 'NO hay rótulo de sección en el marcado: el número y el nombre se fueron de las ocho (B12)')
afirmar(
  CELDAS.every((c) => c.col >= GEOMETRIA.primeraColumnaLibre),
  `ninguna pieza arranca antes de la primera columna libre (${GEOMETRIA.primeraColumnaLibre}): el logo tapa las columnas 1–5 en las cuatro pantallas y en los tres anchos (B11)`,
  `arranques ${CELDAS.map((c) => c.col).join(' · ')}`,
)
controlPositivo('  y el lector de rótulos NO está ciego: sobre una fixtura con rótulo lo encuentra', FIXTURA_DE_ROTULO(true), (h: string) => rotuloDe(h) === null)
afirmarIgual(celdasDe(FIXTURA_DE_ROTULO(true)).length, 1, 'el contador salta el rótulo posicionado POR SU PIEZA y cuenta la celda que queda')
controlPositivo('  y la misma clase SIN la pieza sigue contando: lo que lo salva es la marca, no la clase', FIXTURA_DE_ROTULO(false), (h: string) => celdasDe(h).length === 1)
controlPositivo('ve una pieza que arranca antes de la primera columna libre', [{ pantalla: 'volumen', col: 1, ancho: 5, fila: 1 }], (c: readonly CeldaLeida[]) => c.every((x) => x.col >= GEOMETRIA.primeraColumnaLibre))
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

/** Abajo de 768 la composición se apila: TODO desplazamiento vive en `tablet:`. Un
 *  `col-start` sin prefijo posicionaría en 375, donde la grilla tiene UNA columna. */
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

/** Sin elementos interactivos, y es una decisión (el CTA vive en el Hero y en el
 *  Cierre): lo que se comprueba es que si apareciera uno sería nativo y focalizable. */
const hovers = veces(quieto, 'hover:')
afirmarIgual(hovers, veces(quieto, 'focus-visible:'), 'toda `hover:` tiene su gemela `focus-visible:`')
afirmarIgual(hovers, 0, '  y acá son cero: no hay nada interactivo')
afirmarIgual(veces(quieto, '<button'), 0, 'cero botones')
afirmarIgual(veces(quieto, '<a '), 0, 'cero enlaces')
afirmarIgual(veces(FUENTE, 'onClick'), 0, 'cero `onClick` en la fuente: ningún div haciendo de botón')
controlPositivo('ve un div clickeable', '<div onClick={ir}>ir</div>', (s: string) => veces(s, 'onClick') === 0)
afirmarIgual(veces(FUENTE, 'motion/_componentes'), 0, 'la única puerta a las piezas es `_contrato/piezas`')
/** ⚠ La entrada equivocada es el ESPECIFICADOR solo, sin `from`: escrito como import
 *  completo, el escáner de `s5-codigo.invariant.ts` lo levantaría de ESTE archivo y
 *  reportaría un falso positivo en un instrumento transversal. */
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
