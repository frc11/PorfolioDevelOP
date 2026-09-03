/**
 * SITIO-S9 · LA DEUDA DE INSTRUMENTOS — cuatro pendientes que SITIO-S8 dejó
 * anotados, cada uno con el instrumento que lo mide.
 *
 * ⚠️ **TRES DE LAS CUATRO SECCIONES VIVEN EN SU PROPIO MÓDULO**, por la regla de
 * las 300 líneas y con el corte siempre por tema: §1 en `s9-censoDelLane.ts`
 * (V3-E), §2 en `s9-acoplamiento.ts` (SITIO-S11) y §4 en `s9-scrollPadding.ts`.
 * La razón completa de cada una está en su módulo.
 *
 * ── Qué custodia, en una línea por tarea ───────────────────────────────────
 *
 *   1. **El marcador de los controles positivos, unificado.** El repo tiene DOS
 *      arneses y el contador del agregado veía 14 de los 18 controles del lane
 *      de la escena. Ahora hay UN marcador y los ve todos. **V3-E le sacó las
 *      tres cardinalidades escritas**, que se habían roto tres veces: el censo
 *      se deriva y lo que se afirma son propiedades. Ver `s9-censoDelLane.ts`.
 *   2. **El acoplamiento de TIPO hacia `/probe-escena`** — CERRADO en S11.
 *   3. **§7.13 apunta a rutas que existen**, que es lo que la mudanza de S8 le
 *      había roto.
 *   4. **El `scroll-padding-top` del sitio viejo aplica a `/v3`**, con el desvío
 *      en píxeles y las dos varas contra las que se lo puede medir.
 */

import path from 'node:path'


import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { LARGOS_HEREDADOS, heredadosQueCrecieron } from './s8-largos'
import { afirmarElAcoplamientoCerrado } from './s9-acoplamiento'
import { afirmarElCensoDelLane } from './s9-censoDelLane'
import { afirmarElScrollPadding } from './s9-scrollPadding'
import { bloque713, contarLineas, existe, leer, rutasQueNombra } from './s9-instrumentos'

// ═══════════════════════════════════════════════════════════════════════════
afirmarElCensoDelLane()
// ═════════════════════════════════════════════════════════════════════════
// §2 vive en `s9-acoplamiento.ts`: la reescritura de SITIO-S11 lo hizo cruzar
// las 300 líneas del repo. El corte es por tema — no comparte una constante con
// lo que queda acá.
afirmarElAcoplamientoCerrado()

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · §7.13 — las rutas existen en el disco, y los largos no se movieron')

const BLOQUE = bloque713(leer('docs/rediseno/DIRECCION-ESCENA.md'))
afirmar(BLOQUE.length > 1000, `§7.13 se encontró y se leyó entero (${BLOQUE.length} caracteres)`)

const RUTAS_713 = rutasQueNombra(BLOQUE)
afirmar(RUTAS_713.length >= 12, `§7.13 nombra ${RUTAS_713.length} rutas repo-relativas`)
afirmarIgual(
  RUTAS_713.filter((ruta) => !existe(ruta)),
  [],
  'y TODAS existen en el disco — que es exactamente lo que la mudanza de S8 le había roto',
)
controlPositivo(
  'el detector de rutas inexistentes no está ciego',
  'src/app/probe-escena/_components/OrbitRig.tsx',
  (ruta: string) => existe(ruta),
)

/** Los seis heredados están nombrados por §7.13, y miden lo que declara la base. */
const heredados = Object.keys(LARGOS_HEREDADOS).sort()
afirmarIgual(
  heredados.filter((ruta) => !RUTAS_713.includes(ruta)),
  [],
  'los seis de `LARGOS_HEREDADOS` están nombrados en §7.13 — `probeMoire.ts` faltaba y SITIO-S9 lo agregó',
)

/**
 * ⚠️ **LA CONTRADICCIÓN QUE §7.43 DEJÓ ANOTADA, DIRIMIDA CON LA MEDICIÓN
 * (SITIO-S12).**
 *
 * Acá había una **segunda escritura** de la vigilancia de los seis heredados, y
 * no decía lo mismo que la primera: `s8-largos.ts` documenta *«≤ el largo
 * declarado»* y lo implementa con `>`, y esta sección lo implementaba con
 * IGUALDAD estricta (`hoy !== base`). Las dos fallan igual cuando un archivo
 * engorda —por eso el desacuerdo nunca se vio— pero **se separan en la
 * dirección que importa**: con la igualdad, un archivo que ADELGACE se pone en
 * rojo.
 *
 * **La medición dice que hoy no distinguen:** los seis miden exactamente su
 * base, Δ=0 en los seis, así que cambiar de regla no afloja nada verificable.
 * Lo que decide es el día que se separen, y ese día tiene dueño escrito: §7.13
 * declara que `OrbitRig`, `probeStore` y `lightRig` van JUNTOS a un sprint de
 * limpieza. Con la igualdad, ese sprint pone esta comprobación en rojo **por el
 * trabajo que ella existía para provocar** — y con el mensaje «ninguno se
 * movió», que como diagnóstico sería literalmente falso. Es la forma exacta que
 * `s8-largos.ts` ya nombra: *«un check puesto a fallar por algo que su sprint no
 * produce ni puede arreglar no protege: entrena a ignorarlo»*.
 *
 * **Gana `≤`, y la segunda escritura se borra en vez de corregirse:** esta
 * sección consume `heredadosQueCrecieron()`, que es la implementación de
 * `s8-largos.ts`. Dos escrituras de la misma regla vuelven a divergir; una sola
 * no puede.
 *
 * **Lo único que la igualdad detectaba y `≤` no —que la base quedó VIEJA porque
 * un archivo adelgazó— no se pierde: se PUBLICA.** Es la otra mitad de la regla
 * 13 (lo heredado se publica con atribución y se vigila), y va abajo con el Δ
 * de cada uno. Un Δ negativo no es una falla: es un aviso de que la base sobra.
 */
const medidos = heredados.map((archivo) => ({ archivo, lineas: contarLineas(leer(archivo)) }))
afirmarIgual(
  heredadosQueCrecieron(medidos),
  [],
  'y ninguno ENGORDÓ contra su línea de base — la misma regla que `s8-largos.ts` documenta e implementa, consumida y no reescrita',
)
const deltas = medidos.map((m) => ({ ...m, delta: m.lineas - LARGOS_HEREDADOS[m.archivo] }))
console.log(
  `  · ${deltas.map((d) => `${path.basename(d.archivo)} ${d.lineas}${d.delta === 0 ? '' : ` (base ${LARGOS_HEREDADOS[d.archivo]}, Δ${d.delta > 0 ? '+' : ''}${d.delta})`}`).join(' · ')}`,
)
const adelgazaron = deltas.filter((d) => d.delta < 0)
console.log(
  adelgazaron.length === 0
    ? '  · ninguno adelgazó: las seis bases siguen describiendo el archivo que vigilan'
    : `  ⚠️ ${adelgazaron.length} adelgazó/aron y su base quedó VIEJA — no es una falla, es que sobra: ${adelgazaron.map((d) => `${path.basename(d.archivo)} ${d.lineas} contra ${LARGOS_HEREDADOS[d.archivo]}`).join(' · ')}`,
)
controlPositivo(
  'la vigilancia ve un heredado que ENGORDÓ',
  [{ archivo: heredados[0], lineas: LARGOS_HEREDADOS[heredados[0]] + 1 }],
  (lista: readonly { readonly archivo: string; readonly lineas: number }[]) =>
    heredadosQueCrecieron(lista).length === 0,
)
afirmarIgual(
  heredadosQueCrecieron([{ archivo: heredados[0], lineas: LARGOS_HEREDADOS[heredados[0]] - 1 }]),
  [],
  '  y NO se pone en rojo con uno que ADELGAZÓ, que es exactamente lo que hará el sprint de limpieza de §7.13',
)
controlPositivo(
  '`contarLineas` cuenta saltos como `wc -l`, no elementos de `split`',
  'a\nb\n',
  (texto: string) => contarLineas(texto) === 3,
)

// ═══════════════════════════════════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════════════
// §4 vive en `s9-scrollPadding.ts`, por el mismo corte que §2: la reescritura
// del acoplamiento hizo cruzar las 300 líneas a este archivo.
afirmarElScrollPadding()

cerrar('s9-instrumentos')
