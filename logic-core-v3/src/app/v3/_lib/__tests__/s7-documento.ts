import {
  QUIENES_TRAEN,
  ROTULO_DE_QUIEN,
  type EntradaDePedido,
  type QuienLoTrae,
} from '../../_secciones/_contrato/pedido'
import { REGISTRO } from '../../_secciones/_contrato/registro'

/**
 * EL PEDIDO A FRANCO, COMO DOCUMENTO — producido, no transcrito.
 *
 * ── Por qué el documento se genera ────────────────────────────────────────
 *
 * Porque un pedido escrito a mano se queda viejo en silencio, y ésa es
 * exactamente la clase de defecto que este proyecto viene cazando: una lista de
 * lo que falta que ya no corresponde con lo que falta no es una lista
 * incompleta, es una lista **equivocada**, y se lee igual de bien.
 *
 * Acá el documento sale del mismo dato del que sale la pantalla: el `PEDIDO` que
 * cada sección declara al lado de su contenido, y el `archivoDeContenido` que el
 * registro deriva. `s7-pedido` compara el archivo en disco contra lo que esta
 * función produce, así que un pedido que cambie sin regenerar el documento hace
 * fallar el gate.
 *
 * ── Para quién está escrito ───────────────────────────────────────────────
 *
 * Para alguien que no va a abrir el código. Por eso cada entrada dice **qué
 * dato es**, **en qué archivo se edita** y **qué formato espera**, y por eso
 * está agrupado por sección y no por clase: quien lo llena mira la pantalla, y
 * la pantalla está ordenada por sección.
 *
 * ── Y qué le faltaba: a quién pedírselo (V3-D) ────────────────────────────
 *
 * Las tres cosas de arriba dicen QUÉ falta. Ninguna decía **de quién es**, y
 * una lista de cincuenta ítems sin dueño no se empieza: se lee entera, se
 * cierra, y al día siguiente hay que volver a decidir ítem por ítem si eso lo
 * consigue uno o hay que pedirlo afuera. Desde V3-D cada entrada declara su
 * `quienLoTrae` y el documento sale además repartido en tres listas cortas —una
 * por dueño— y con una nota de qué conviene pedir primero.
 *
 * El reparto se DERIVA del mismo dato: no hay una tabla de dueños escrita al
 * lado del pedido, porque sería la segunda fuente que este archivo existe para
 * no tener.
 */

const ENCABEZADO = `# Contenido pendiente — el home de \`/v3\`

Esto es **todo lo que falta** para que el home nuevo deje de tener relleno. Está
agrupado por sección, en el orden en que se ven al scrollear.

Cada fila dice tres cosas: **qué dato es**, **en qué archivo se edita** y **qué
formato espera**. No hace falta abrir código para nada más que pegar el valor en
el archivo que la fila nombra.

> ⚠️ Este documento **lo produce un instrumento** (\`npm run test:s7-pedido\`) a
> partir de lo que cada sección declara al lado de su contenido. No se edita a
> mano: si alguien cambia un pedido en el código y no regenera esto, el gate de
> calidad falla. Es lo que impide que la lista se quede vieja mientras parece
> completa.

## Cómo leerlo

- **Marcador** es lo que se ve hoy en la pantalla ocupando ese lugar —\`[CIFRA]\`,
  \`[FOTO DEL EQUIPO]\`—. Donde dice *(prosa)*, lo provisional **no se ve como un
  agujero**: es un texto con la longitud y el tono correctos, y hay que
  reemplazarlo igual.
- **Dónde** es la clave dentro del archivo de contenido de esa sección.
- **Quién lo trae** es a quién hay que pedírselo. Está también repartido más
  abajo, en tres listas, para poder mandar cada una por separado.
- **Una fila que se llena desaparece de acá.** No hay tilde de "hecho": el
  documento sale del pedido que declara el código, y una casilla que ya tiene su
  dato deja de estar pedida. Lo que se ve en esta lista es, exactamente, lo que
  todavía falta.
- **La regla dura del proyecto:** ninguna cifra se inventa, ni de ejemplo. Si un
  dato no existe o no se puede medir, la respuesta correcta es **sacar la
  casilla**, no redondear. develOP ya tiene cuatro landings publicadas con
  cifras fabricadas y esto existe para no sumar una quinta.
- **Los precios no están cerrados** y no entran ni como ejemplo.
`

/** Una línea de la tabla, con las tuberías escapadas. */
function fila(celdas: readonly string[]): string {
  return `| ${celdas.map((c) => c.replace(/\|/g, '\\|')).join(' | ')} |`
}

/** Una entrada del pedido con la sección de la que salió. Es lo que hace falta
 *  para poder listarla fuera de su tabla sin perder de dónde viene. */
interface EntradaUbicada {
  readonly seccion: string
  readonly entrada: EntradaDePedido
}

/** Todas las entradas de las ocho, en el orden del recorrido. */
function todasLasEntradas(): EntradaUbicada[] {
  return REGISTRO.flatMap((s) =>
    s.pedido.map((entrada) => ({ seccion: `${s.seccion.numero} · ${s.seccion.nombre}`, entrada })),
  )
}

/** Cómo se nombra una entrada en las listas de afuera de su tabla. */
function referencia({ seccion, entrada }: EntradaUbicada): string {
  return `- **${seccion}** · \`${entrada.ruta}\` — ${entrada.que}`
}

/**
 * LO MÁS CARO DE CONSEGUIR — una comparación entre todas, no una propiedad de
 * cada una, y por eso vive acá y no como un campo por entrada.
 *
 * Lo caro no es el trabajo: una captura lleva diez minutos y el copy lo escribe
 * quien quiera sentarse a escribirlo. Lo caro es la ESPERA. Las únicas casillas
 * que no dependen de develOP son las que hay que ir a buscar **afuera**, al
 * negocio de un cliente: el número que dice qué cambió en cada uno, y lo que
 * dijo alguien con permiso para publicarlo y con su nombre. Ésas pueden tardar
 * semanas y nadie de acá las puede apurar, así que son las que se piden primero
 * aunque sean las últimas que se ven en la pantalla.
 *
 * El conjunto se RESUELVE contra el pedido vivo —las métricas de Trabajos y todo
 * lo de clase `testimonio`— así que una casilla que mañana deje de estar pedida
 * deja de aparecer acá sola.
 */
function loMasCaro(): EntradaUbicada[] {
  return REGISTRO.flatMap((s) =>
    s.pedido
      .filter((e) => (s.id === 'trabajos' && e.clase === 'metrica') || e.clase === 'testimonio')
      .map((entrada) => ({ seccion: `${s.seccion.numero} · ${s.seccion.nombre}`, entrada })),
  )
}

/** El bloque del reparto: las tres listas, una por dueño, siempre las tres. */
function repartoPorDueno(todas: readonly EntradaUbicada[]): string[] {
  const partes: string[] = ['\n## Quién trae qué\n']
  partes.push(
    'Las mismas cosas de arriba, repartidas. Cada lista se puede mandar sola: ' +
      'nadie tiene que leer las otras dos para saber qué le toca.\n',
  )
  partes.push('| quién | cuántas |\n|---|---:|')
  const porDueno = new Map<QuienLoTrae, EntradaUbicada[]>(QUIENES_TRAEN.map((q) => [q, []]))
  for (const ubicada of todas) porDueno.get(ubicada.entrada.quienLoTrae)?.push(ubicada)
  for (const quien of QUIENES_TRAEN) {
    partes.push(fila([ROTULO_DE_QUIEN[quien], String(porDueno.get(quien)?.length ?? 0)]))
  }
  for (const quien of QUIENES_TRAEN) {
    const suyas = porDueno.get(quien) ?? []
    partes.push(`\n### ${ROTULO_DE_QUIEN[quien]} — ${suyas.length}\n`)
    if (suyas.length === 0) partes.push('Ninguna hoy.')
    else for (const ubicada of suyas) partes.push(referencia(ubicada))
  }
  return partes
}

export function documentoDePedidos(): string {
  const partes: string[] = [ENCABEZADO]

  const total = REGISTRO.reduce((n, s) => n + s.pedido.length, 0)
  const conMarcador = REGISTRO.reduce(
    (n, s) => n + s.pedido.filter((e) => e.marcador !== null).length,
    0,
  )
  partes.push(
    `\n## Resumen\n\n` +
      `**${total} cosas pendientes** en las ocho secciones, de las cuales **${conMarcador}** se ven ` +
      `hoy en la pantalla como un marcador y ${total - conMarcador} son prosa de relleno que no se ` +
      `ve como agujero.\n`,
  )

  partes.push('\n| sección | pendientes |\n|---|---:|')
  for (const s of REGISTRO) {
    partes.push(fila([`${s.seccion.numero} · ${s.seccion.nombre}`, String(s.pedido.length)]))
  }
  partes.push('')

  const todas = todasLasEntradas()
  partes.push(...repartoPorDueno(todas))

  const caras = loMasCaro()
  partes.push('\n## Lo que conviene pedir primero\n')
  partes.push(
    `**Estas ${caras.length}, y no porque sean más trabajo.** Son las únicas que no ` +
      'dependen de develOP: el dato vive en el negocio de un cliente y hay que ir a ' +
      'buscarlo afuera —el número que dice qué cambió en cada uno, y lo que dijo alguien ' +
      'con el permiso para publicarlo y con su nombre—. Una captura lleva diez minutos y ' +
      'se hace cuando haya un rato; esto puede tardar semanas y nadie de acá lo puede ' +
      'apurar. Por eso van primero, aunque en la pantalla se vean últimas.\n',
  )
  for (const ubicada of caras) partes.push(referencia(ubicada))
  partes.push('')

  for (const s of REGISTRO) {
    partes.push(`\n## ${s.seccion.numero} · ${s.seccion.nombre}\n`)
    partes.push(`Se edita en \`${s.archivoDeContenido}\`.\n`)
    partes.push('| marcador | dónde | quién lo trae | qué dato es | formato |')
    partes.push('|---|---|---|---|---|')
    for (const e of s.pedido) {
      partes.push(
        fila([
          e.marcador === null ? '*(prosa)*' : `\`${e.marcador}\``,
          `\`${e.ruta}\``,
          ROTULO_DE_QUIEN[e.quienLoTrae],
          e.que,
          e.formato,
        ]),
      )
    }
    partes.push('')
  }

  return `${partes.join('\n').trimEnd()}\n`
}

/** Dónde vive el documento, relativo a la raíz del proyecto. */
export const RUTA_DEL_DOCUMENTO = 'docs/rediseno/CONTENIDO-PENDIENTE.md'
