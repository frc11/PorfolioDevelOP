/**
 * INVARIANTE — LOS DOS ÁRBOLES DICEN LO MISMO.
 *
 * Corre con `npm run test:s7-arboles`.
 *
 * ── El riesgo que este archivo existe para cazar ──────────────────────────
 *
 * Partir el home en un árbol quieto y uno animado tiene un modo de falla que es
 * peor que cualquier cantidad de KiB: **que la persona que entra desde un
 * teléfono lea un contenido distinto del de escritorio**. Los dos lanes lo
 * dijeron con esas palabras y por eso ninguno de los dos quiso partir.
 *
 * La arquitectura de SITIO-S7 lo hace imposible por construcción —el contenido
 * está escrito UNA vez y lo único que cambia son las primitivas que lo
 * envuelven— y aun así se comprueba, porque *verdad por construcción* y
 * *verificado* no son lo mismo: una primitiva animada que se olvidara de
 * renderizar sus hijos rompería la igualdad sin romper nada más.
 *
 * ── Qué se compara, y por qué el TEXTO y no el marcado ────────────────────
 *
 * El texto visible, que es lo que la persona lee. El marcado NO puede ser igual
 * y no tiene por qué: la rama animada agrega envoltorios, escribe transformadas
 * y, en el caso del divisor de líneas, parte el titular en piezas. Comparar
 * marcado sería exigir que la coreografía no exista.
 *
 * ⚠ **La única diferencia legítima de TEXTO, declarada y acotada:** el divisor
 * de líneas emite el titular DOS veces —una copia `sr-only` para el árbol de
 * accesibilidad y otra partida en piezas con `aria-hidden`— así que en la rama
 * animada el titular aparece repetido. Por eso se compara el VOCABULARIO (el
 * conjunto de palabras) y no la cadena: es lo que distingue "dice otra cosa" de
 * "lo dice dos veces". El instrumento publica la diferencia de conteo, así que
 * si un día crece, se ve.
 */

import { useMotionValue } from 'motion/react'

import { REGISTRO } from '../../_secciones/_contrato/registro'
import { textoVisible } from '../../_secciones/_contrato/escaneo'
import { marcar } from '../../_secciones/_invariantes/render'
import { SERVICIOS } from '../../_secciones/_contrato/acento'
import { PanelDeSecuencia } from '../../_secciones/servicios/ServiciosEnSecuencia'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

/** Las palabras de un texto, normalizadas. Es la unidad de comparación. */
function palabras(texto: string): string[] {
  return texto
    .toLowerCase()
    .split(/[^\p{L}\p{N}[\]áéíóúñü·%+×$-]+/u)
    .filter((p) => p.length > 0)
}

const vocabulario = (texto: string): Set<string> => new Set(palabras(texto))

function diferencia(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((p) => !b.has(p)).sort()
}

interface Rama {
  readonly id: string
  readonly quieto: string
  readonly animado: string
  /** Cuántos renders hicieron falta para ver la rama animada entera. */
  readonly estados: number
}

/**
 * ⚠ UNA SECCIÓN EN SECUENCIA NO SE VE ENTERA EN UN RENDER, Y ESO LO ENCONTRÓ
 * ESTE INSTRUMENTO.
 *
 * Servicios es una secuencia pinneada: con coreografía muestra UN servicio por
 * vez —el del tramo activo— y los otros dos entran al scrollear. Su rama quieta,
 * en cambio, muestra los tres apilados, uno por pantalla.
 *
 * O sea que la comparación ingenua —un render contra un render— reporta 248
 * palabras "faltantes" en la rama animada, y **no falta ninguna**: están en los
 * otros dos tramos. La primera corrida de este archivo dio exactamente eso, y
 * es un buen ejemplo de la clase de cosa que un instrumento encuentra y una
 * lectura no.
 *
 * Lo que hay que comparar no es un instante contra un instante: es **todo lo
 * que la rama quieta dice** contra **todo lo que la animada llega a decir**. Por
 * eso una sección en secuencia enumera sus tramos, y la unión de los tres es su
 * vocabulario.
 *
 * `PanelDeSecuencia` se exporta justamente para esto: el estado del tramo está
 * izado, así que el instrumento lo puede fijar sin inventar un atributo de
 * forzado en el producto.
 */
function SondaDeTramo({ activo }: { readonly activo: number }): React.JSX.Element {
  const progreso = useMotionValue(0)
  return <PanelDeSecuencia activo={activo} progreso={progreso} />
}

/** Las secciones cuya rama animada es una SECUENCIA, con sus estados. */
const EN_SECUENCIA: Readonly<Record<string, readonly React.JSX.Element[]>> = {
  servicios: SERVICIOS.map((_, i) => <SondaDeTramo key={i} activo={i} />),
}

const RAMAS: readonly Rama[] = REGISTRO.map(({ id, Componente, seccion }) => {
  const tramos = EN_SECUENCIA[id]
  const animados =
    tramos === undefined
      ? [marcar(<Componente seccion={seccion} />, { anima: true })]
      : tramos.map((tramo) => marcar(tramo, { anima: true }))
  return {
    id,
    quieto: textoVisible(marcar(<Componente seccion={seccion} />, { anima: false })),
    animado: animados.map(textoVisible).join(' '),
    estados: animados.length,
  }
})

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El alcance: las ocho, en las dos ramas, y ninguna vacía')

afirmarIgual(RAMAS.length, 8, 'se compararon las ocho secciones')
for (const { id, quieto, animado, estados } of RAMAS) {
  afirmar(quieto.length > 0, `\`${id}\` — la rama quieta dice algo`, `${quieto.length} caracteres`)
  afirmar(
    animado.length > 0,
    `  y la animada también, en ${estados} estado(s)`,
    `${animado.length} caracteres`,
  )
}

/** El contrapeso: sin esto, "las dos dicen lo mismo" pasaría con las dos vacías. */
const totalDePalabras = RAMAS.reduce((n, r) => n + palabras(r.quieto).length, 0)
afirmar(
  totalDePalabras > 200,
  `el home quieto tiene ${totalDePalabras} palabras: la comparación no es sobre el vacío`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LA TESIS — las dos ramas dicen exactamente lo mismo')

for (const { id, quieto, animado } of RAMAS) {
  const vq = vocabulario(quieto)
  const va = vocabulario(animado)
  afirmarIgual(diferencia(vq, va), [], `\`${id}\` — nada que diga la rama quieta falta en la animada`)
  afirmarIgual(diferencia(va, vq), [], `  ni al revés: la coreografía no agrega ni una palabra`)
}

/**
 * La diferencia de CONTEO, publicada. Es la copia `sr-only` del divisor de
 * líneas, y es la única repetición legítima. Si un día crece, se ve acá antes de
 * que nadie lo note en una pantalla.
 */
console.log('  palabras por rama. El delta positivo es la copia `sr-only` del divisor de líneas;')
console.log('  en una sección en secuencia también entra la repetición entre tramos.')
for (const { id, quieto, animado, estados } of RAMAS) {
  const delta = palabras(animado).length - palabras(quieto).length
  console.log(
    `    ${id.padEnd(18)} ${String(palabras(quieto).length).padStart(4)} quietas · ` +
      `${delta >= 0 ? '+' : ''}${delta} en la animada  (${estados} estado${estados === 1 ? '' : 's'})`,
  )
}

controlPositivo(
  'el comparador ve una rama a la que le falta una palabra',
  { a: 'el panel muestra las entregas', b: 'el panel muestra' },
  (caso: { a: string; b: string }) =>
    diferencia(vocabulario(caso.a), vocabulario(caso.b)).length === 0,
)

controlPositivo(
  'y una rama que dice algo de más',
  { a: 'el panel muestra', b: 'el panel muestra las entregas' },
  (caso: { a: string; b: string }) =>
    diferencia(vocabulario(caso.b), vocabulario(caso.a)).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Y NO son el mismo árbol: la rama animada sí anima')

/**
 * Sin esto, la §2 pasaría en verde con una implementación animada que no anime
 * nada — que es exactamente el estado que tendría el home si la instalación de
 * las primitivas fallara en silencio.
 */
const marcadoQuieto = REGISTRO.map(({ Componente, seccion }) =>
  marcar(<Componente seccion={seccion} />, { anima: false }),
).join('')
const marcadoAnimado = REGISTRO.map(({ Componente, seccion }) =>
  marcar(<Componente seccion={seccion} />, { anima: true }),
).join('')

const transformadas = (html: string): number => (html.match(/transform:/g) ?? []).length
afirmarIgual(transformadas(marcadoQuieto), 0, 'la rama quieta no escribe UNA sola transformada')
afirmar(
  transformadas(marcadoAnimado) > 0,
  `y la animada escribe ${transformadas(marcadoAnimado)}: el detector no está ciego`,
)

const partidos = (html: string): number => (html.match(/data-texto-por-lineas="partido"/g) ?? []).length
afirmar(
  partidos(marcadoQuieto) === 0 && partidos(marcadoAnimado) > 0,
  `y el divisor de líneas parte ${partidos(marcadoAnimado)} titular(es) sólo en la animada`,
)

controlPositivo(
  'el detector de transformadas ve una donde la hay',
  '<div style="transform:translateY(10px)"></div>',
  (html: string) => transformadas(html) === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La rama quieta de Trabajos no tiene descendientes posicionados')

/**
 * ⚠ NO ES UNA CURIOSIDAD: es la condición que hace inerte la única diferencia
 * de ESTILO entre las dos ramas.
 *
 * El bloque quieto no escribe `perspective` —no hay nada que poner en
 * perspectiva sin transformadas 3D— y el animado sí. La propiedad tiene un
 * efecto secundario real: crea bloque contenedor para descendientes
 * posicionados. Es inofensivo sólo mientras la rama quieta no tenga ninguno, y
 * eso se afirma sobre el marcado en vez de razonarse.
 *
 * El único patrón que declara perspectiva y que alguna sección consume es P7,
 * en Trabajos.
 */
const trabajos = REGISTRO.find((m) => m.id === 'trabajos')
afirmar(trabajos !== undefined, 'Trabajos está en el registro')
if (trabajos !== undefined) {
  const quieto = marcar(<trabajos.Componente seccion={trabajos.seccion} />, { anima: false })
  const animado = marcar(<trabajos.Componente seccion={trabajos.seccion} />, { anima: true })
  const absolutos = (html: string): number => (html.match(/class="[^"]*\babsolute\b/g) ?? []).length
  afirmarIgual(absolutos(quieto), 0, 'su rama quieta no tiene un solo descendiente `absolute`')
  afirmar(absolutos(animado) > 0, `  y la animada tiene ${absolutos(animado)}: el detector ve`)
  afirmar(!quieto.includes('perspective'), '  y la quieta no escribe `perspective`')
  afirmar(animado.includes('perspective'), '  y la animada sí, que es donde significa algo')
}

cerrar('s7-arboles.invariant')
