/**
 * ⚠️ INVARIANTE — LA LLAVE DEL CONTENIDO INVENTADO.
 *
 * Corre con `npm run test:s21-llave`. Es **la** comprobación de B12 §4, y lo
 * que afirma son las cuatro propiedades que la instrucción exige antes de que
 * se escriba una sola cifra falsa:
 *
 *   1. **La llave existe**, sola, en su módulo, y es un booleano.
 *   2. **Apagarla devuelve los marcadores** — comprobado sobre las DOS ramas en
 *      la misma corrida, casilla por casilla, y sobre las ocho secciones
 *      renderizadas.
 *   3. **Hay una marca visible en pantalla** mientras esté prendida, y con la
 *      llave apagada no existe.
 *   4. **El build de producción FALLA con ella prendida**, y no hay salida en
 *      un entorno de deploy.
 *
 * Y una quinta que no está en la lista pero es la que sostiene todo:
 *
 *   5. **El escáner NO se aflojó.** Los detectores corren con su condición
 *      intacta; lo único que cambia es que reciben el texto con las mentiras
 *      declaradas devueltas a su marcador. Una cifra que no esté en la lista
 *      cerrada sigue poniéndolos en rojo, y eso se prueba acá con una cifra
 *      fabricada y con la deuda real de develOP.
 *
 * ⚠ Las entradas equivocadas viven en `s21-llave-soporte.tsx` —casillas mal
 * formadas, fuentes de llave rotas, una cifra sin declarar—: son lo que el lane
 * tiene prohibido escribir y por eso están afuera del padrón escaneado.
 */

import { escanearLoReal, textoVisible } from '../../_secciones/_contrato/escaneo'
import { INVENTOS, LISTA_DE_INVENTOS, conLlave, type Invento } from '../../_secciones/_contrato/inventado'
import { apareceEn, sinLoInventado, sinLoInventadoEn } from '../../_secciones/_contrato/restauracion'
import { CONTENIDO_INVENTADO } from '../../_secciones/_contrato/llave'
import { esMarcador, marcadoresDe } from '../../_secciones/_contrato/marcadores'
import { REGISTRO } from '../../_secciones/_contrato/registro'
import { marcar } from '../../_secciones/_invariantes/render'
import { CONTENIDO_PROHIBIDO_DE_CONTROL, LANE, leer, recorrer } from '../../_secciones/_invariantes/soporte'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { afirmarLaMarcaYElGuardian, CASILLAS_QUE_SE_PISAN, CASILLAS_ROTAS, CIFRA_SIN_DECLARAR } from './s21-llave-soporte'

const MODULO_DE_LA_LLAVE = `${LANE}/_contrato/llave.ts`
const MODULO_DE_LO_INVENTADO = `${LANE}/_contrato/inventado.ts`
const RE_EXPORTACION = /^export\s+(?:const|function|type|interface|class)\s+(\w+)/gm
const RE_LLAMADA = /conLlave\(\s*([A-Za-z0-9_.]*)/g

/** Las ocho, en su rama quieta. Es lo que se lee abajo de 1025 y arriba también:
 *  un marcador que sólo volviera con la coreografía puesta no vuelve. */
const TEXTO_DE_LAS_OCHO = REGISTRO.map(({ id, Componente, seccion }) => ({
  id,
  texto: textoVisible(marcar(<Componente seccion={seccion} />, { anima: false })),
}))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La llave existe, está sola en su módulo, y es un booleano')

const fuenteDeLaLlave = leer(MODULO_DE_LA_LLAVE)
afirmarIgual(typeof CONTENIDO_INVENTADO, 'boolean', 'la llave es un booleano en tiempo de ejecución')
console.log(
  `  ⚠️ LA LLAVE ESTÁ ${CONTENIDO_INVENTADO ? 'PRENDIDA — el sitio muestra cifras inventadas' : 'APAGADA — el sitio muestra sus marcadores'}`,
)

afirmarIgual(
  [...fuenteDeLaLlave.matchAll(RE_EXPORTACION)].map((m) => m[1]),
  ['CONTENIDO_INVENTADO'],
  'su módulo exporta ESO y nada más: apagarla es editar un token en un archivo que no hace otra cosa',
)
afirmarIgual(
  [...fuenteDeLaLlave.matchAll(/^import\s/gm)].length,
  0,
  '  y no importa nada: no hay una segunda cosa de la que dependa',
)
afirmar(
  /export const CONTENIDO_INVENTADO: boolean =/.test(fuenteDeLaLlave),
  '  el tipo está ANOTADO `boolean` y no inferido: con el literal, TypeScript estrecha cada ternario a una rama y §2 no compilaría',
)

controlPositivo(
  'el lector de exportaciones vería una segunda',
  'export const CONTENIDO_INVENTADO: boolean = true\nexport const OTRA = 1\n',
  (f: string) => [...f.matchAll(RE_EXPORTACION)].length === 1,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · `conLlave` — las DOS ramas, casilla por casilla, en la misma corrida')

afirmar(
  LISTA_DE_INVENTOS.length > 0,
  `la lista cerrada tiene ${LISTA_DE_INVENTOS.length} casillas inventadas`,
  'sin esto todo lo de abajo sería verde por vacío',
)

afirmarIgual(
  LISTA_DE_INVENTOS.filter((i) => conLlave(i, true) !== i.mentira).length,
  0,
  `con la llave PRENDIDA, las ${LISTA_DE_INVENTOS.length} casillas devuelven su mentira`,
)
afirmarIgual(
  LISTA_DE_INVENTOS.filter((i) => conLlave(i, false) !== i.pedido).length,
  0,
  `⚠️ con la llave APAGADA, las ${LISTA_DE_INVENTOS.length} devuelven su texto con el marcador: NADA SE PIERDE`,
)
afirmarIgual(
  LISTA_DE_INVENTOS.filter((i) => conLlave(i) !== (CONTENIDO_INVENTADO ? i.mentira : i.pedido)),
  [],
  '  y sin argumento, las dos lecturas coinciden con la constante del árbol',
)

controlPositivo(
  'una casilla con las dos caras iguales no distinguiría las ramas',
  CASILLAS_ROTAS.lasDosCarasIguales,
  (i: Invento) => conLlave(i, true) !== conLlave(i, false),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La lista cerrada: cada casilla vuelve a un marcador del conjunto')

for (const [clave, i] of Object.entries(INVENTOS) as readonly [string, Invento][]) {
  const corta = i.mentira.length > 46 ? `${i.mentira.slice(0, 46)}…` : i.mentira
  afirmar(
    esMarcador(i.marcador) &&
      i.pedido.includes(i.marcador) &&
      i.mentira.trim() !== '' &&
      i.mentira !== i.pedido &&
      marcadoresDe(i.mentira).length === 0,
    `\`${clave}\` — ${i.marcador} → «${corta}»`,
    'marcador del conjunto · el pedido lo contiene · la mentira no está vacía, no es el pedido y no lleva un marcador adentro',
  )
}

/** Una mentira que MATCHEE adentro de otra —con el límite de palabra puesto,
 *  que es como se sustituye— haría que la restauración dependiera del orden. */
const sePisan = (lista: readonly Invento[]): Invento[] =>
  lista.filter((i, n) => lista.some((o, m) => m !== n && sinLoInventado(o.mentira, [i]) !== o.mentira))

afirmarIgual(
  sePisan(LISTA_DE_INVENTOS).map((i) => i.mentira),
  [],
  'ninguna mentira matchea adentro de otra: la restauración no depende del orden de la lista',
)
afirmar(
  sinLoInventado('de 3 a 14 consultas por semana', LISTA_DE_INVENTOS) === '[MÉTRICA]',
  '⚠️ y el límite de palabra hace su trabajo: el `4` de «14» NO es la casilla `[CIFRA]` que vale `4`',
  'sin el límite, una casilla de un dígito se comería el dígito de otra',
)

controlPositivo(
  'el detector ve un pedido que NO contiene su marcador',
  CASILLAS_ROTAS.sinMarcadorEnElPedido,
  (i: Invento) => i.pedido.includes(i.marcador),
)
controlPositivo('  una mentira vacía', CASILLAS_ROTAS.mentiraVacia, (i: Invento) => i.mentira.trim() !== '')
controlPositivo(
  '  y una mentira con un marcador adentro, que haría ambigua la vuelta',
  CASILLAS_ROTAS.mentiraConMarcadorAdentro,
  (i: Invento) => marcadoresDe(i.mentira).length === 0,
)
controlPositivo(
  '  y dos casillas donde una mentira matchea adentro de la otra',
  CASILLAS_QUE_SE_PISAN,
  (lista: readonly Invento[]) => sePisan(lista).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Toda mentira pasa por la lista: ninguna sección escribe la suya')

/**
 * ⚠ La comprobación NO es «buscar la cadena de la mentira en el resto del lane»:
 * una mentira corta aparece en cualquier archivo por casualidad, y un detector
 * con falsos positivos se afloja al primer rojo. Lo que se afirma es la
 * propiedad que sí es exacta: **todas las llamadas a `conLlave` del lane pasan
 * una entrada de `INVENTOS`, y todas las entradas de `INVENTOS` se usan.** Una
 * cifra escrita derecho no llama a `conLlave` y la cazan los detectores de §5 y
 * §6, que corren sobre el contenido restaurado.
 */
/**
 * ⚠ Los comentarios se sacan, y las CADENAS NO.
 *
 * Los dos motivos son medidos, y el segundo costó una corrida: el docblock de
 * `MarcaDeLaLlave.tsx` NOMBRA a `conLlave()` para explicar de dónde saca su
 * parámetro, y el barrido lo leía como una llamada sin declarar. Y
 * `sinComentariosNiCadenas` —el podador que ya existe— **no sirve acá**: mata
 * `//` en cualquier lugar de la línea, así que `'https://esquinaweb.com.ar'`
 * pierde su comilla de cierre, la comilla huérfana se aparea con la del renglón
 * siguiente y el barrido se comió DOS de las tres casillas de Trabajos. Un
 * detector que se traga silenciosamente parte del archivo es peor que ninguno.
 */
const sinComentarios = (fuente: string): string =>
  fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/[^\n]*$/gm, ' ')

const FUENTES_DEL_LANE = recorrer(LANE).filter(
  (a) => /\.tsx?$/.test(a) && a !== MODULO_DE_LO_INVENTADO && !/\.invariant\.tsx?$/.test(a),
)
const llamadas: { readonly archivo: string; readonly clave: string | null }[] = []
for (const archivo of FUENTES_DEL_LANE) {
  for (const m of sinComentarios(leer(archivo)).matchAll(RE_LLAMADA)) {
    const declarada = /^INVENTOS\.\w+$/.test(m[1])
    llamadas.push({ archivo, clave: declarada ? m[1].slice('INVENTOS.'.length) : null })
  }
}
afirmarIgual(
  llamadas.filter((l) => l.clave === null).map((l) => l.archivo),
  [],
  `las ${llamadas.length} llamadas a \`conLlave\` del lane pasan una entrada de \`INVENTOS\`: ninguna arma su propia casilla`,
)
afirmarIgual(
  [...new Set(llamadas.map((l) => l.clave))].sort(),
  Object.keys(INVENTOS).sort(),
  'y las claves usadas son EXACTAMENTE las declaradas: ni una casilla muerta, ni una sin declarar',
)
afirmar(
  FUENTES_DEL_LANE.length > 0 && llamadas.length > 0,
  `  el barrido miró ${FUENTES_DEL_LANE.length} archivos del lane y encontró ${llamadas.length} llamadas: no es verde por vacío`,
)

controlPositivo(
  'el lector ve una llamada que arma la casilla en el lugar',
  "cuerpo: conLlave({ marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: 'nueve' })",
  (f: string) => [...f.matchAll(RE_LLAMADA)].every((m) => /^INVENTOS\.\w+$/.test(m[1])),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La restauración devuelve el sitio de antes — sobre las OCHO renderizadas')

afirmarIgual(
  LISTA_DE_INVENTOS.filter((i) => sinLoInventado(i.mentira) !== i.pedido),
  [],
  'cada mentira, sola, vuelve a su pedido',
)
const UNA = LISTA_DE_INVENTOS[0]
afirmarIgual(
  sinLoInventadoEn({ a: [{ b: UNA?.mentira ?? '' }] }),
  { a: [{ b: UNA?.pedido ?? '' }] },
  'y la restauración PROFUNDA la alcanza adentro de un objeto: los detectores que recorren el DATO ven lo mismo que los que recorren el texto',
)

const enPantalla = new Set<string>()
for (const { id, texto } of TEXTO_DE_LAS_OCHO) {
  const restaurado = sinLoInventado(texto)
  afirmarIgual(
    LISTA_DE_INVENTOS.filter((i) => apareceEn(restaurado, i)).map((i) => i.mentira),
    [],
    `\`${id}\` — restaurado, no queda una sola mentira en el texto`,
  )
  const aca = LISTA_DE_INVENTOS.filter((i) => apareceEn(texto, i))
  for (const i of aca) enPantalla.add(i.mentira)
  afirmarIgual(
    aca.filter((i) => !restaurado.includes(i.marcador)).map((i) => i.marcador),
    [],
    `  y los ${aca.length} marcadores de \`${id}\` volvieron: ${[...new Set(aca.map((i) => i.marcador))].join(' ')}`,
  )
}
afirmarIgual(
  LISTA_DE_INVENTOS.filter((i) => !enPantalla.has(i.mentira)).map((i) => i.mentira),
  [],
  `las ${LISTA_DE_INVENTOS.length} casillas LLEGAN A LA PANTALLA: ninguna mentira declarada que no se vea`,
)

controlPositivo(
  'la restauración NO toca lo que no está declarado',
  CIFRA_SIN_DECLARAR,
  (t: string) => sinLoInventado(t) !== t,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · ⚠️ EL ESCÁNER NO SE AFLOJÓ')

for (const { id, texto } of TEXTO_DE_LAS_OCHO) {
  afirmarIgual(
    escanearLoReal(texto),
    [],
    `\`${id}\` — cero hallazgos sobre ${texto.length} caracteres de texto renderizado, con la resta puesta`,
  )
}
afirmar(
  escanearLoReal(CONTENIDO_PROHIBIDO_DE_CONTROL).length > 0,
  `y con la resta puesta SIGUE viendo la deuda real de develOP: ${escanearLoReal(CONTENIDO_PROHIBIDO_DE_CONTROL).length} hallazgos`,
)
controlPositivo(
  'el escáner ve la frase prohibida aunque la resta esté puesta',
  CONTENIDO_PROHIBIDO_DE_CONTROL,
  (t: string) => escanearLoReal(t).length === 0,
)
controlPositivo(
  '  y ve una cifra que nadie declaró: la resta es una lista cerrada de literales, no una amnistía a los números',
  CIFRA_SIN_DECLARAR,
  (t: string) => escanearLoReal(t).length === 0,
)

afirmarLaMarcaYElGuardian()

cerrar('s21-llave.invariant')
