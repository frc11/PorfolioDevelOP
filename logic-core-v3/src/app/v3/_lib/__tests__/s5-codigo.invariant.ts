/**
 * INVARIANTE TRANSVERSAL — las propiedades del CÓDIGO del lane A.
 *
 * Corre con `npm run test:s5-codigo`. **Entra en el agregado**: lo que afirma se
 * lee del disco y es cierto hoy, mañana y después del merge (regla 12 del
 * proyecto — un check que compara contra `git` mide el momento del sprint, no
 * el código, y no va acá).
 *
 * ── Por qué lo escribe el principal y no los subagentes ───────────────────
 *
 * Porque **ninguna sección puede afirmar el aislamiento**. Un subagente que
 * escribe sólo dentro de su carpeta no puede comprobar que las otras tres
 * respetaron la suya, y cuatro comprobaciones parciales del mismo aislamiento
 * son cuatro formas de no comprobarlo.
 *
 * ── El alcance de cada bloque, y por qué no es el mismo ───────────────────
 *
 * Los detectores viven en `s5-escaneo.ts`, con la explicación completa de por
 * qué los de import y de foco corren sobre `ARCHIVOS_ESCANEABLES` —lo que pinta
 * pantalla— y no sobre los instrumentos: los invariantes contienen A PROPÓSITO
 * la entrada equivocada de cada detector, así que escanearlos hace fallar a las
 * comprobaciones por su propio arnés. La primera versión de este archivo cayó
 * en eso con cinco rojos, y los cinco eran falsos.
 *
 * Lo que NO se recorta es el alcance del padrón, de los prohibidos y de las 300
 * líneas: ahí los instrumentos cuentan como cualquier otro archivo. Los
 * BINARIOS sí quedan afuera de las dos últimas, desde V3-E: ver
 * `ARCHIVOS_DE_CODIGO`.
 */

import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { apagadosDeFoco, quitarComentarios } from './s3-escaneo'
import {
  ARCHIVOS_DEL_LANE,
  ARCHIVOS_DE_CODIGO,
  ARCHIVOS_ESCANEABLES,
  CARPETAS_DE_SECCION,
  RAIZ_DEL_LANE,
  archivosDeclaradosQueFaltan,
  archivosSinRegistrar,
  leer,
} from './s5-archivos'
import { afirmarLosOriginales } from './s5-originales'
import {
  IMPORTS_PERMITIDOS,
  PROHIBIDOS,
  crucesEntreSecciones,
  hayProhibido,
  importsDe,
  importsDe3D,
  importsFueraDeLaLista,
  instrumentosDeS5,
  paridadDeEstado,
  sinGemela,
} from './s5-escaneo'

/** Los `.ts` y `.tsx` del lane, instrumentos incluidos. */
const ARCHIVOS_TS = ARCHIVOS_DE_CODIGO.filter((a) => /\.tsx?$/.test(a))
/** Sólo lo que pinta pantalla. Ver el docblock de `s5-escaneo.ts`. */
const PANTALLA = ARCHIVOS_ESCANEABLES.filter((a) => /\.tsx?$/.test(a))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El padrón cierra en los dos sentidos')

afirmarIgual(archivosDeclaradosQueFaltan(), [], 'todo lo declarado en el padrón existe en disco')
afirmarIgual(archivosSinRegistrar(), [], 'y nada en disco quedó sin registrar en el padrón')
afirmar(
  ARCHIVOS_DEL_LANE.length > 0,
  `el padrón declara ${ARCHIVOS_DEL_LANE.length} archivos`,
  'no es verde por vacío',
)
afirmarIgual(CARPETAS_DE_SECCION.length, 4, 'son cuatro secciones, una por subagente')
afirmar(
  PANTALLA.length < ARCHIVOS_TS.length,
  `${PANTALLA.length} archivos pintan pantalla y ${ARCHIVOS_TS.length - PANTALLA.length} son instrumentos`,
  'el recorte de alcance existe y no es decorativo',
)

afirmarLosOriginales()

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Ninguna sección importa de otra')

const cruces = ARCHIVOS_TS.map((a) => ({ archivo: a, cruces: crucesEntreSecciones(a, leer(a)) })).filter(
  (r) => r.cruces.length > 0,
)
afirmarIgual(cruces, [], 'ninguna de las cuatro secciones importa de otra')

const importsMirados = ARCHIVOS_TS.reduce((n, a) => n + importsDe(leer(a)).length, 0)
afirmar(importsMirados > 0, `el escáner miró ${importsMirados} imports`, 'no es verde por vacío')

controlPositivo(
  'el detector de cruces ve un import a la carpeta de otra sección',
  { archivo: `${RAIZ_DEL_LANE}/hero/Hero.tsx`, codigo: "import { X } from '../trabajos/contenido'" },
  (caso) => crucesEntreSecciones(caso.archivo, caso.codigo).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Una sola puerta a las piezas de motion, y `three` no entra')

/**
 * ⚠ LA PUERTA SE MUDÓ EN SITIO-S7, y el que la cruza cambió de naturaleza.
 *
 * Era `_contrato/piezas.tsx`, el único archivo de este lane que importaba la
 * glue de la ruta de demostración de S2. Con los dos contratos unificados la
 * puerta es una sola para las OCHO secciones —`_contrato/coreografia-animada.tsx`—
 * y además es el módulo que **no baja abajo de 1025**, así que la propiedad que
 * este bloque custodia pasó de "una sola puerta" a "una sola puerta, y del lado
 * de afuera de la compuerta".
 *
 * Lo que este invariante sigue afirmando es lo suyo: que **ninguna de estas
 * cuatro secciones** la cruza por su cuenta. Que la puerta sea una para las
 * ocho lo afirma `s7-contrato`, que es de quien las unificó.
 */
const PUERTA = 'src/app/v3/_secciones/_contrato/coreografia-animada.tsx'

const puertasDeMas = PANTALLA.filter(
  (a) => a !== PUERTA && importsDe(leer(a)).some((m) => m.includes('motion/_componentes')),
)
afirmarIgual(
  puertasDeMas,
  [],
  'ninguna de las cuatro secciones importa de `motion/_componentes/` por su cuenta',
)
afirmar(
  importsDe(leer(PUERTA)).some((m) => m.includes('motion/_componentes')),
  'y la puerta declarada SÍ importa de ahí',
  'si no importara, la afirmación de arriba sería verde por vacío',
)

const conTresD = PANTALLA.map((a) => ({ archivo: a, hallados: importsDe3D(leer(a)) })).filter(
  (r) => r.hallados.length > 0,
)
afirmarIgual(conTresD, [], 'ningún archivo que pinte pantalla importa geometría 3D')

controlPositivo(
  'el detector ve un import de three',
  "import * as THREE from 'three'",
  (codigo: string) => importsDe3D(codigo).length === 0,
)
controlPositivo(
  'y uno de @react-three/fiber',
  "import { Canvas } from '@react-three/fiber'",
  (codigo: string) => importsDe3D(codigo).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La lista blanca de dependencias externas')

const externos = PANTALLA.map((archivo) => ({
  archivo,
  externos: importsFueraDeLaLista(leer(archivo)),
})).filter((r) => r.externos.length > 0)
afirmarIgual(externos, [], `ninguno importa fuera de la lista blanca (${IMPORTS_PERMITIDOS.length} nombres)`)

controlPositivo(
  'el escáner ve una dependencia nueva',
  "import gsap from 'gsap'",
  (codigo: string) => importsFueraDeLaLista(codigo).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Cero `any`, cero base de datos, ninguna zona del otro socio')

/** Acá el alcance SÍ es todo el lane: ninguno de estos ocho patrones aparece
 *  como entrada equivocada de un control positivo en los instrumentos, y `any`
 *  en un instrumento es tan prohibido como en un componente. */
for (const [nombre, patron] of PROHIBIDOS) {
  const donde = ARCHIVOS_TS.filter((a) => patron.test(quitarComentarios(leer(a))))
  afirmarIgual(donde, [], `ningún archivo del lane usa ${nombre}`)
}

controlPositivo('el detector de `any` lo ve', 'const x: any = 1', (c: string) => !hayProhibido(c))
controlPositivo('y el de `router.push` también', 'router.push("/a")', (c: string) => !hayProhibido(c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El acento no es texto, y nadie apaga el anillo de foco')

/**
 * `text-acento` sobre la banda oscura da 2,71 · 2,99 · 2,46 contra `#0E0E0E`:
 * no llega ni a 3:1. La prohibición se extiende a TODO lo que pinta pantalla y
 * no sólo a la sección invertida, y es a propósito — una utilidad que es
 * correcta en un panel e incorrecta en el de al lado es una que alguien va a
 * mover.
 */
const conAcentoDeTexto = PANTALLA.map((archivo) => ({
  archivo,
  hallados: [...quitarComentarios(leer(archivo)).matchAll(/\btext-acento\b[a-z-]*/g)].map((m) => m[0]),
})).filter((r) => r.hallados.length > 0)
afirmarIgual(
  conAcentoDeTexto,
  [],
  'cero `text-acento` — sobre oscuro el acento va como relleno o subrayado',
)

controlPositivo(
  'el detector ve un text-acento',
  'className="text-acento font-titulo"',
  (codigo: string) => !/\btext-acento\b/.test(codigo),
)

const apagados = PANTALLA.map((archivo) => ({
  archivo,
  hallados: apagadosDeFoco(quitarComentarios(leer(archivo))),
})).filter((r) => r.hallados.length > 0)
afirmarIgual(apagados, [], `ninguno de los ${PANTALLA.length} archivos de pantalla apaga el anillo de foco`)

controlPositivo(
  'el detector ve las formas de apagarlo',
  'const c = "outline-none"',
  (codigo: string) => apagadosDeFoco(codigo).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Toda `hover:` con su gemela de foco')

const desparejos = PANTALLA.filter((a) => sinGemela(leer(a)))
afirmarIgual(desparejos, [], 'ningún archivo del lane tiene `hover:` sin `focus-visible:`')

const conEstado = PANTALLA.filter((a) => {
  const p = paridadDeEstado(leer(a))
  return p.hover + p.grupoHover > 0
})
/**
 * ⚠ HOY ESA CUENTA ES CERO, Y SE PUBLICA EN VEZ DE AFIRMARSE.
 *
 * La primera versión de este bloque exigía "al menos un archivo con estado de
 * puntero", para que la paridad no fuera verde por vacío. Estaba mal: **exigía
 * que existiera un hover**, y Trabajos decidió con razón no tener ninguno —no
 * hay página de caso para ninguno de los tres proyectos, y tres enlaces que no
 * llevan a ningún lado son tres paradas de tabulación que no hacen nada—. Un
 * check que obliga a agregar una interacción para poder pasar no protege nada.
 *
 * Que el detector no esté ciego lo prueban los dos controles positivos de acá
 * abajo, que es donde tiene que probarse. Que hoy no haya hovers es un HECHO
 * del lane, y va impreso.
 */
console.log(
  `  archivos con estado de puntero: ${conEstado.length === 0 ? '(ninguno — ver Trabajos: sin controles, la métrica va siempre visible)' : conEstado.join(' · ')}`,
)

controlPositivo(
  'el detector ve un hover sin foco',
  'className="hover:opacity-100"',
  (codigo: string) => !sinGemela(codigo),
)
controlPositivo(
  'y un group-hover sin su group-focus-visible',
  'className="group-hover:underline focus-visible:underline"',
  (codigo: string) => !sinGemela(codigo),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · Ningún archivo pasa las 300 líneas')

const INSTRUMENTOS = instrumentosDeS5()
/** Los binarios quedan afuera: contarle saltos de línea a un PNG no mide nada. */
const TODOS = [...new Set([...ARCHIVOS_DE_CODIGO, ...INSTRUMENTOS])]

const medidos = TODOS.map((archivo) => ({ archivo, lineas: leer(archivo).split('\n').length }))
afirmarIgual(
  medidos.filter((r) => r.lineas > 300),
  [],
  `ninguno de los ${TODOS.length} archivos pasa las 300 líneas`,
)

const masLargo = [...medidos].sort((a, b) => b.lineas - a.lineas)[0]
console.log(`  el más largo: ${masLargo.archivo} — ${masLargo.lineas} líneas`)

afirmar(
  INSTRUMENTOS.length > 0,
  `${INSTRUMENTOS.length} instrumentos de S5 incluidos en la cuenta`,
  INSTRUMENTOS.map((i) => path.basename(i)).join(' · '),
)

controlPositivo(
  'el medidor ve un archivo de más de 300 líneas',
  { archivo: 'inventado.ts', lineas: 301 },
  (r: { lineas: number }) => r.lineas <= 300,
)

cerrar('s5-codigo.invariant')
