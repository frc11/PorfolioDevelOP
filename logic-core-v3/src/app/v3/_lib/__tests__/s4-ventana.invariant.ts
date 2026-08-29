/**
 * INVARIANTE — un check fuera de su ventana NO pasa en verde silencioso.
 *
 * Corre con `npm run test:s4-ventana`.
 *
 * ── Qué se está custodiando ───────────────────────────────────────────────
 *
 * `s3-frontera` compara el árbol de trabajo contra `HEAD`. Después del merge
 * ese diff es vacío por construcción, así que sus cinco afirmaciones no son ni
 * verdaderas ni falsas: **no tienen base**. La salida elegida es `noCorre()`.
 *
 * Esa elección tiene un riesgo obvio y hay que medirlo: si el detector de
 * ventana se rompiera diciendo siempre "fuera", el check quedaría apagado para
 * siempre **y la salida se vería igual de bien**. Un verde indistinguible entre
 * "verifiqué" y "no había nada que verificar" es exactamente el modo de falla
 * que este proyecto viene cazando desde S10.
 *
 * Por eso se afirma lo mismo en los dos sentidos —dice DENTRO cuando hay base y
 * FUERA cuando no— y se comprueba que `noCorre` **imprime**: la descripción y
 * el motivo, en la salida, donde se leen.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { correr, fallo, leerResumen } from './s4-corrida'
import { encabezadoDeFrontera, evaluarVentana } from './s4-ventana'

const TESTIGOS = ['logic-core-v3/src/app/v3/_estilos/cta.css', 'logic-core-v3/src/app/v3/_lib/cta.ts']

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El detector distingue los dos estados')

const dentro = evaluarVentana(TESTIGOS, [TESTIGOS[1], 'otro/archivo.ts'])
afirmar(dentro.dentro, 'con un testigo sin commitear, dice DENTRO', dentro.razon)
afirmarIgual(dentro.vistos, [TESTIGOS[1]], 'y nombra cuál lo puso adentro')

const fuera = evaluarVentana(TESTIGOS, [])
afirmar(!fuera.dentro, 'con el árbol limpio, dice FUERA', fuera.razon)
afirmar(
  fuera.razon.includes('ya están en HEAD') && fuera.razon.includes('vacío por construcción'),
  'y el motivo explica POR QUÉ no corre, no sólo que no corre',
)

controlPositivo(
  'no dice DENTRO por una ruta ajena',
  ['un/archivo/que/no/es/testigo.ts'],
  (tocados) => evaluarVentana(TESTIGOS, tocados).dentro,
)
controlPositivo(
  'ni por un prefijo parcial del nombre',
  ['logic-core-v3/src/app/v3/_lib/cta.ts.bak'],
  (tocados) => evaluarVentana(TESTIGOS, tocados).dentro,
)
afirmar(
  evaluarVentana(TESTIGOS, ['logic-core-v3/src/app/v3/_estilos/']).dentro,
  'y sí acepta un directorio tocado que contiene al testigo',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El encabezado declara la naturaleza del check en su propia salida')

const cabeceraFuera = encabezadoDeFrontera('s3-frontera', fuera)
const cabeceraDentro = encabezadoDeFrontera('s3-frontera', dentro)
afirmar(cabeceraFuera.includes('FUERA DE VENTANA'), 'fuera de ventana lo dice con todas las letras')
afirmar(cabeceraDentro.includes('DENTRO DE VENTANA'), 'y dentro también')
afirmar(cabeceraFuera !== cabeceraDentro, 'los dos encabezados NO son el mismo texto: no es una constante')
afirmar(
  cabeceraFuera.includes('propiedad del MOMENTO'),
  'y el encabezado dice de qué naturaleza es el check, no sólo su estado',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · `noCorre` imprime, cuenta aparte, y sale en cero — medido en un hijo')

/**
 * Se mide sobre PROCESOS HIJOS y no llamando a `noCorre()` acá, y la razón es
 * de higiene: los contadores de `afirmar.ts` son del módulo, así que una
 * llamada de prueba haría que ESTE invariante reportara "1 fuera de ventana" en
 * su propio resumen. Un instrumento que se ensucia la cifra al medirla es la
 * misma clase de contaminación que el testigo de la poda.
 *
 * De paso, el hijo mide la cadena entera —impresión, conteo y código de
 * salida— y no sólo el texto.
 */
const FIXTURES = 'src/app/v3/_lib/__tests__/s4-fixtures'

const conUnaFuera = correr('fixture:fuera-de-ventana', `npx tsx ${FIXTURES}/fuera-de-ventana.invariant.ts`)
afirmarIgual(conUnaFuera.codigo, 0, 'un check con una comprobación fuera de ventana NO falla: sale en cero')
afirmarIgual(conUnaFuera.fueraDeVentana, 1, 'y el resumen la cuenta aparte, no como afirmación')
afirmarIgual(conUnaFuera.afirmaciones, 1, 'las afirmaciones de verdad siguen contándose solas')
afirmar(conUnaFuera.salida.includes('NO CORRE'), 'la salida dice NO CORRE, no `ok`')
afirmar(
  conUnaFuera.salida.includes('fuera de ventana — porque su base ya está en HEAD'),
  'y trae el motivo, no sólo el hecho',
)
afirmar(
  conUnaFuera.salida.includes('este verde es parcial, no limpio'),
  'y el cierre avisa que el verde es parcial: no se puede confundir con "verifiqué todo"',
)
afirmar(!fallo(conUnaFuera), 'el corredor no lo cuenta como falla')
afirmar(conUnaFuera.fueraDeVentana > 0, '  pero el agregado lo reporta como `parcial`, no como `ok`')

const todoFuera = correr('fixture:todo-fuera-de-ventana', `npx tsx ${FIXTURES}/todo-fuera-de-ventana.invariant.ts`)
afirmarIgual(todoFuera.codigo, 0, 'un check ENTERO fuera de ventana tampoco falla: sale en cero')
afirmarIgual(todoFuera.afirmaciones, 0, 'con cero afirmaciones')
afirmarIgual(todoFuera.fueraDeVentana, 2, 'y las dos comprobaciones declaradas como no corridas')
afirmar(
  todoFuera.salida.includes('NO CORRIERON'),
  'y lo dice con todas las letras en vez de terminar en silencio',
)

/**
 * EL CONTROL: sin esto, `cerrar()` podría estar aceptando CUALQUIER invariante
 * sin afirmaciones —el "verde por vacío" que persigue desde S1— con la excusa
 * de la ventana. Cero afirmaciones y cero fuera de ventana sigue siendo falla.
 */
const vacio = correr('fixture:vacio', `npx tsx ${FIXTURES}/vacio.invariant.ts`)
afirmarIgual(vacio.codigo, 1, 'un invariante con cero afirmaciones y cero huecos SIGUE fallando')
afirmar(vacio.salida.includes('verde por vacío'), '  y dice por qué', 'la excusa de la ventana no lo cubre')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El resumen lleva la cuenta aparte, y el corredor la lee')

const conVentana = leerResumen('algo.invariant: 12 afirmaciones, 0 fallas, 5 fuera de ventana')
afirmarIgual(conVentana, { afirmaciones: 12, fallas: 0, fueraDeVentana: 5 }, 'el corredor lee las tres cifras')
const sinVentana = leerResumen('algo.invariant: 12 afirmaciones, 0 fallas')
afirmarIgual(sinVentana, { afirmaciones: 12, fallas: 0, fueraDeVentana: 0 }, 'y el formato viejo sigue leyéndose')
controlPositivo(
  'el lector de resumen no inventa uno donde no lo hay',
  'una salida cualquiera sin línea de cierre',
  (salida) => leerResumen(salida) !== null,
)

cerrar('s4-ventana.invariant')
