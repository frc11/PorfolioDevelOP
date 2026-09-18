/**
 * INVARIANTE — 03 · Números.
 *
 * Corre con `npx tsx src/app/v3/_secciones/numeros/numeros.invariant.tsx`. La
 * sección se renderiza DE VERDAD tres veces: quieta (`modo="nunca"`, abajo de
 * 1025 y con `prefers-reduced-motion`), con la coreografía forzada, y con la
 * preferencia mandando sobre el modo forzado. Sin P1: los seis bloques son P2
 * y escriben transformada en el primer cuadro — el control positivo de "abajo
 * de 1025 no se mueve nada".
 */

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
import { seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO } from './contenido'
import { afirmarQueElContenidoNoEsUnDato, conLaLlaveApagada } from '../_invariantes/llave'
import { Numeros } from './Numeros'

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
