/**
 * INVARIANTE — EL CHROME DEL HOME: la pastilla, el pie y el cursor apagado.
 *
 * Corre con `npm run test:s8-chrome`.
 *
 * ── Qué custodia, y por qué cada cosa está acá ─────────────────────────────
 *
 *   4. **El pie enlaza las OCHO, derivadas**, y ningún `href` lleva a la nada.
 *   5. **El cursor está detrás de la constante, TOMADA en B5.**
 *   6. **El rodeo de `peso` está restaurado, y se dice DÓNDE estaba.**
 *
 * Los detectores y las entradas rotas viven en `./soporte.ts`, afuera de este
 * archivo, para que cada control positivo corra LA MISMA función contra una
 * entrada fabricada.
 */

import { createElement } from 'react'

import { CURSOR_MIN_ANCHO_PX, deberiaMontarseElCursor } from '../../_lib/cursor'
import { MARCA_CURSOR } from '../../_lib/marcaCursor'
import { ENLACES_DE_MUESTRA } from '../../_lib/navegacion'
import { SECCIONES } from '../../_lib/secciones'
import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from '../../_lib/__tests__/afirmar'
import { DIST, conjuntoInicial, contiene, kib, pesar, todosLosChunks } from '../../_lib/__tests__/s3-bundle'
import { Cierre } from '../../_secciones/cierre/Cierre'
import { ANCLAS_QUE_EXISTEN, CONTACTO_DEL_PIE, DESTINOS_DE_LA_RUTA } from '../../_secciones/cierre/contenido'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { marcar } from '../../_secciones/_invariantes/render'
import {
  CANDIDATOS_DEL_RODEO,
  CURSOR_PROPIO_EN_EL_HOME,
  GATEADO_POR_SU_CUENTA,
  MODULO_DEL_CHROME,
  PIEZAS_QUE_SE_CONSUMEN,
} from '../contrato'
import { ChromeDelHome } from '../ChromeDelHome'
import * as S from './soporte'

const CHROME = S.leer(MODULO_DEL_CHROME)
const CHROME_LIMPIO = S.sinComentariosNiCadenas(CHROME)
const MARCADO = marcar(createElement(ChromeDelHome), { anima: false })
const PIE = marcar(createElement(Cierre, { seccion: seccionDe('cierre') }), { anima: false })

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El pie enlaza las OCHO, DERIVADAS, y ningún href lleva a la nada')

afirmarIgual(ANCLAS_QUE_EXISTEN.length, SECCIONES.length, `las anclas que existen son las ${SECCIONES.length} de la tabla`)
// FINAL 3 + CONTACTO: el pie enlaza las secciones MONTADAS (sin el Cierre, que no se enlaza a sí mismo, ni Números, que
// no se monta) y el hero se llama «Inicio»; los externos son el mail, WhatsApp y las redes; `#contacto` abre el formulario.
const SIN_ENLACE_EN_EL_PIE = ['cierre', 'numeros']
const ENLAZADAS = SECCIONES.filter((s) => !SIN_ENLACE_EN_EL_PIE.includes(s.id))
afirmarIgual(DESTINOS_DE_LA_RUTA.map((d) => d.ancla), ENLAZADAS.map((s) => `#${s.id}`), `el pie ofrece ${DESTINOS_DE_LA_RUTA.length}, en el ORDEN DEL RECORRIDO y derivadas de la tabla: todas menos el Cierre y Números`)
afirmarIgual(DESTINOS_DE_LA_RUTA.map((d) => d.rotulo), ENLAZADAS.map((s) => (s.id === 'hero' ? 'Inicio' : s.nombre)), '  con los rótulos de la misma fila, salvo el hero, que en el pie se llama «Inicio»')
const HREFS_DEL_PIE = S.hrefsDe(PIE)
const esExterno = (h: string): boolean => /^(mailto:|https:\/\/)/.test(h)
const HREFS_INTERNOS = HREFS_DEL_PIE.filter((h) => !esExterno(h) && h !== CONTACTO_DEL_PIE.destino)
afirmarIgual(HREFS_DEL_PIE.filter((h) => h === CONTACTO_DEL_PIE.destino).length, 1, 'el pie tiene UN enlace que abre el formulario de contacto')
afirmarIgual(S.aLaNada(HREFS_INTERNOS, ANCLAS_QUE_EXISTEN), [], `los ${HREFS_INTERNOS.length} enlaces internos del pie apuntan a un ancla que existe (los otros son el mail, WhatsApp y las redes)`)
afirmarIgual(S.aLaNada(ENLACES_DE_MUESTRA.map((e) => e.destino).filter((d) => d !== '#contacto'), ANCLAS_QUE_EXISTEN), [], `y los de la pastilla también; «Contacto» abre el formulario`)
afirmar(ENLACES_DE_MUESTRA.at(-1)?.destino === '#contacto' && ENLACES_DE_MUESTRA.at(-1)?.rotulo === 'Contacto', '  «Contacto» de la pastilla va a `#contacto`, que el chrome intercepta para abrir el formulario')
controlPositivo('el detector ve un href a la nada', S.HREFS_A_LA_NADA, (l: readonly string[]) => S.aLaNada(l, ANCLAS_QUE_EXISTEN).length === 0)
controlPositivo('y no se pone verde con la lista vacía de anclas', ['#hero'], (l: readonly string[]) => S.aLaNada(l, []).length === 0)

/**
 * ⚠️ **LO QUE ESTE CAMBIO ROMPIÓ Y ESTE SPRINT NO ARREGLA.** Se publica con el
 * número y no se afirma: la salida es de CONTENIDO y la decide el humano.
 */
// SPRINT FINAL: el pie ya no tiene CTA propio (el llamado es el tiempo C de «Por qué develOP»);
// su columna de contacto enlaza a `#contacto`, el destino declarado provisorio del sprint.
afirmar(CONTACTO_DEL_PIE.destino === '#contacto' && !ANCLAS_QUE_EXISTEN.includes(CONTACTO_DEL_PIE.destino), '  el contacto del pie va a `#contacto`, que no es un ancla: lo intercepta el chrome y abre el formulario (CONTACTO)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · EL RODEO DE `peso` — restaurado, y NO estaba en Servicios')

/**
 * ⚠️ **LA INSTRUCCIÓN DECÍA «SERVICIOS» Y EL RODEO NO ESTABA AHÍ** (regla 8: una
 * afirmación incorrecta se reemplaza y se explica, nunca se afloja).
 *
 * §7.24 y la instrucción de este sprint dicen que *«`peso="medio"` sigue
 * esquivado en Servicios»*, y ninguna de las dos da la línea. El único rodeo con
 * su motivo escrito al lado está en `cierre/ColumnasDelPie.tsx`, y en Servicios
 * lo que hay es OTRA cosa: un rodeo del MISMO defecto de `cn()` pero sobre el
 * COLOR, que SITIO-S7 ya sacó al arreglar la raíz. Restaurar algo en Servicios
 * para que la frase quedara cierta habría sido inventar composición.
 */
const RODEO = 'src/app/v3/_secciones/cierre/ColumnasDelPie.tsx'
const SERVICIOS = 'src/app/v3/_secciones/servicios/ContenidoDeServicio.tsx'
afirmarIgual([...CANDIDATOS_DEL_RODEO], [RODEO, SERVICIOS], 'los dos candidatos que la Fase 0 dejó localizados')
// FINAL 3: el pie ya no tiene marcadores ([ENLACE], [FECHA], [NOMBRE]): el rodeo de `peso` se fue con la pieza que lo llevaba.
afirmar(!/PedidoDelPie/.test(S.sinComentarios(S.leer(RODEO))) && !/\[ENLACE\]/.test(PIE), `el rodeo estaba en \`${RODEO}\` y se fue con los marcadores del pie (FINAL 3): ya no hay pieza que pesar`)
afirmarIgual([...S.sinComentarios(S.leer(SERVICIOS)).matchAll(/\speso=/g)].length, 0, `y en \`${SERVICIOS}\` no hay un solo \`peso=\`: no había nada que restaurar ahí`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El cursor propio, detrás de la constante — y la constante, TOMADA (B5)')

/** ⚠️ Se dio vuelta en B5 sin aflojar nada (`_chrome/contrato.ts`): sigue
 *  vigilando una constante, leída por el chrome, con las compuertas de S3
 *  adelante. Se ensancha a `boolean` o `tsc` sabe la respuesta. */
const decision: boolean = CURSOR_PROPIO_EN_EL_HOME
afirmar(decision === true, 'la decisión está TOMADA: `CURSOR_PROPIO_EN_EL_HOME` en `true` (B5)')
afirmar(CHROME_LIMPIO.includes('CURSOR_PROPIO_EN_EL_HOME'), 'y el chrome la LEE: el montaje del cursor cuelga de ella, no de un comentario')
afirmar(S.importsDe(CHROME).includes('../_componentes/chrome/CursorCompuerta'), '  montando la compuerta que YA EXISTE desde S3, no una nueva')

/** ⚠️ **Verde por vacío, corregido:** el `!MARCADO.includes(MARCA_CURSOR)` de antes
 *  pasaba con la constante en los DOS valores. Se afirma junto con su causa. */
afirmar(
  !MARCADO.includes(MARCA_CURSOR) && S.leer('src/app/v3/_componentes/chrome/CursorCompuerta.tsx').includes('ssr: false'),
  'la marca no viaja en el marcado del SERVIDOR, y la causa es el `ssr: false` de la compuerta — no la constante',
)
controlPositivo('el buscador de la marca no está ciego', `<div data-marca="${MARCA_CURSOR}"></div>`, (h: string) => !h.includes(MARCA_CURSOR))

/** Las dos compuertas de S3 siguen enteras: el chrome agrega una tercera, no las reemplaza. */
afirmarIgual(GATEADO_POR_SU_CUENTA.filter((a) => !S.existe(a)), [], 'la pieza gateada por su cuenta existe')
for (const [ancho, menos, esperado] of [[true, false, true], [false, false, false], [true, true, false], [false, true, false]] as const) {
  afirmarIgual(deberiaMontarseElCursor(ancho, menos), esperado, `  compuertas de S3: arriba del umbral=${ancho}, menos movimiento=${menos} → ${esperado}`)
}
// §7.25: se mira el fuente SIN comentarios. El docblock de `ChromeDelHome`
// EXPLICA el umbral de 1025 —eso es correcto y es la mitad del trabajo—; lo que
// no puede es declararlo. Un detector que mirara el archivo entero pondría en
// rojo justamente el haberlo escrito.
afirmarIgual([...CHROME_LIMPIO.matchAll(/\bmatchMedia\b|\b1025\b/g)].map((m) => m[0]), [], 'y el chrome no reimplementa ninguna de las dos: no nombra `matchMedia` ni el umbral')
controlPositivo('el detector ve el umbral declarado en código', 'const UMBRAL = 1025', (f: string) => [...S.sinComentariosNiCadenas(f).matchAll(/\bmatchMedia\b|\b1025\b/g)].length === 0)
console.log(`  el umbral de montaje del cursor sigue siendo el único del sistema: ${CURSOR_MIN_ANCHO_PX} px, importado y no reescrito.`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Nada del chrome se monta abajo de 1025 salvo lo declarado')

/**
 * La pastilla es la excepción, y no es una concesión: es CSS `sticky` puro. Lo
 * que lo hace verdad es que el chrome no importe una línea de JavaScript de
 * comportamiento — ni el sistema de motion, ni un hook, ni `next/dynamic`.
 */
const PROHIBIDOS: readonly [string, RegExp][] = [
  ['el sistema de motion', /_lib\/motion\//],
  ['las primitivas de coreografía', /_contrato\/coreografia/],
  ['`next/dynamic`', /^next\/dynamic$/],
]
for (const [nombre, patron] of PROHIBIDOS) {
  afirmarIgual(S.importsDe(CHROME).filter((m) => patron.test(m)), [], `el chrome no importa ${nombre}`)
}
afirmar(!/'use client'/.test(CHROME_LIMPIO), 'y no lleva `use client`: es un componente de servidor — la pastilla es marcado y clases')
controlPositivo('el detector de imports ve uno del sistema de motion', "import { X } from '../_lib/motion/patrones'", (f: string) => S.importsDe(f).filter((m) => /_lib\/motion\//.test(m)).length === 0)
afirmarIgual(PIEZAS_QUE_SE_CONSUMEN.filter((a) => !S.existe(a)), [], `las ${PIEZAS_QUE_SE_CONSUMEN.length} piezas que el chrome consume existen: no se reescribió ninguna`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · EL PESO — qué costaría prender el cursor, sobre la salida del build')

if (!S.existe('.next')) {
  noCorre('el peso del chunk perezoso del cursor', 'no hay build en `.next`. Corré `npm run build` y volvé a correr esto.')
} else {
  const chunks = todosLosChunks()
  const conLaMarca = chunks.filter((f) => contiene(f, MARCA_CURSOR))
  const peso = pesar(conLaMarca)
  afirmar(chunks.length > 0, `el build tiene ${chunks.length} chunks para buscar`)
  afirmar(conLaMarca.length > 0, `la marca del cursor está en ${conLaMarca.length} chunk(s)`, conLaMarca.join(' · '))
  console.log(`  ⚠️ EL NÚMERO DE LA DECISIÓN: prender \`CURSOR_PROPIO_EN_EL_HOME\` haría que /v3 pida ${kib(peso.crudo)} crudo · ${kib(peso.gzip)} gzip DE MÁS, y sólo arriba de ${CURSOR_MIN_ANCHO_PX} px y sin \`prefers-reduced-motion\`. El chunk es autocontenido: su único import de valor fuera de React son dos módulos de datos de \`_lib\`. La hoja \`cursor.css\` ya viaja hoy —el layout de /v3 la importa— así que prenderlo NO agrega CSS.`)
  const inicial = conjuntoInicial('/v3')
  if (inicial.length === 0) {
    noCorre('la marca del cursor fuera de la carga inicial de /v3', `no hay HTML prerenderizado de /v3 en ${DIST}`)
  } else {
    afirmarIgual(inicial.filter((f) => contiene(f, MARCA_CURSOR)), [], `con la constante en \`false\`, ningún archivo de la carga inicial de /v3 (${inicial.length}) lleva la marca del cursor`)
    afirmar(conLaMarca.length > 0 && inicial.filter((f) => contiene(f, MARCA_CURSOR)).length === 0, '  y el chequeo distingue las dos cosas: encuentra la marca en el build y NO la encuentra en la carga inicial')
  }
  controlPositivo('el buscador no encuentra una marca que no existe', 'v3-cursor-que-no-existe-en-ningun-chunk', (m: string) => chunks.some((f) => contiene(f, m)))
}

cerrar('s8-chrome.invariant')
