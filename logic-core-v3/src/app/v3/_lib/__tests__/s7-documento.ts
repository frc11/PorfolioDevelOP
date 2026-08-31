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

  for (const s of REGISTRO) {
    partes.push(`\n## ${s.seccion.numero} · ${s.seccion.nombre}\n`)
    partes.push(`Se edita en \`${s.archivoDeContenido}\`.\n`)
    partes.push('| marcador | dónde | qué dato es | formato |')
    partes.push('|---|---|---|---|')
    for (const e of s.pedido) {
      partes.push(
        fila([
          e.marcador === null ? '*(prosa)*' : `\`${e.marcador}\``,
          `\`${e.ruta}\``,
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
