/**
 * Lectura ACOTADA de la fuente de producción — la pieza que le falta a un
 * invariante para hablar del sistema y no de sí mismo.
 *
 * ── Por qué existe (P27) ─────────────────────────────────────────────────────
 * El censo de P26 midió que de los 55 invariantes del repo 33 son
 * sobre-satisfacibles, y que la forma MÁS COMÚN —nueve, la peor, porque los
 * nueve custodian aislamiento— es «el helper suelto»: el invariante afirma que
 * una función devuelve el filtro correcto
 *
 *     assert.deepEqual(ownSetterMetaWhere(A), { setterId: A })
 *
 * y NADA afirma que alguna consulta real la llame. Un `findMany({ where: {
 * leadId } })` escrito a mano en el call-site deja el invariante en verde con la
 * fuga abierta. La promesa del encabezado («toda lectura del meta se filtra por
 * setterId») es sobre las LECTURAS; la aserción era sobre la función.
 *
 * El módulo puro `isolation.ts` no puede cerrar ese hueco solo: las consultas
 * viven en módulos que importan `@/lib/prisma`, y estos chequeos corren sin
 * Neon a propósito. La única forma de mirar la consulta real sin levantarla es
 * LEER SU FUENTE. Y leerla ACOTADA, que es lo que este módulo aporta: buscar en
 * el archivo entero da verde sobre una función vaciada — el falso verde exacto
 * que P25 encontró en `acuse-recibo` y que P26 volvió a encontrar en otros
 * cuatro invariantes.
 *
 * El modelo es `dossier-stage.invariant.ts` (`bloqueDelCase`), que ya hacía esto
 * a mano para un `case`. Acá se generaliza a funciones y a declaraciones de
 * nivel superior, y se le suma lo que aquel no necesitaba: un escáner que
 * SALTEA strings, plantillas y comentarios, para que una llave dentro de un
 * copy —abundantes en esta superficie— no descuadre el balanceo.
 *
 * ── Qué NO hace ──────────────────────────────────────────────────────────────
 * No parsea TypeScript. Es lectura de texto acotada, con las limitaciones que
 * eso tiene; a cambio no arrastra un parser al árbol de runtime de un chequeo
 * que se define por no necesitar nada. Cuando el recorte falla, falla RUIDOSO
 * (lanza), nunca devolviendo un bloque vacío que después firme cualquier cosa.
 */
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Fuente de un archivo del repo, por partes de ruta relativas a la raíz. */
export function fuenteDe(...partes: string[]): string {
  return readFileSync(join(process.cwd(), ...partes), 'utf8')
}

/**
 * Todo `.ts`/`.tsx` bajo un directorio del repo, en rutas relativas a la raíz y
 * con separadores `/` (para que un censo congelado se lea igual en Windows).
 *
 * Barrer el árbol es lo que le da a un censo la mitad que le falta: un chequeo
 * «el helper aparece en este bloque» no puede ver una consulta NUEVA escrita en
 * otro archivo. El barrido sí.
 */
export function archivosFuente(...partesDir: string[]): string[] {
  const raiz = process.cwd()
  const salida: string[] = []
  const caminar = (dir: string): void => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const ruta = join(dir, entrada.name)
      if (entrada.isDirectory()) caminar(ruta)
      else if (/\.tsx?$/.test(entrada.name)) {
        salida.push(ruta.slice(raiz.length + 1).replace(/\\/g, '/'))
      }
    }
  }
  caminar(join(raiz, ...partesDir))
  return salida.sort()
}

/** Ruta legible para los mensajes de error (sin separadores de Windows). */
function rotulo(partes: readonly string[]): string {
  return partes.join('/')
}

/**
 * Desde `i`, si ahí arranca un string, una plantilla o un comentario, devuelve
 * el índice del carácter siguiente a su cierre. Si no arranca ninguno, `i`.
 *
 * Es lo que evita que un `{` dentro de un texto —`'{leadId}'`, `// abre {`— haga
 * creer al balanceo que entró en un bloque que nunca se cierra.
 */
function saltarLiteral(fuente: string, i: number): number {
  const c = fuente[i]
  if (c === "'" || c === '"' || c === '`') {
    let j = i + 1
    while (j < fuente.length && fuente[j] !== c) {
      if (fuente[j] === '\\') j += 1
      j += 1
    }
    return j + 1
  }
  if (c === '/' && fuente[i + 1] === '/') {
    const fin = fuente.indexOf('\n', i)
    return fin === -1 ? fuente.length : fin
  }
  if (c === '/' && fuente[i + 1] === '*') {
    const fin = fuente.indexOf('*/', i + 2)
    return fin === -1 ? fuente.length : fin + 2
  }
  return i
}

/**
 * Desde la llave de apertura en `desde`, el texto hasta su llave de cierre
 * (inclusive), salteando literales y comentarios.
 */
function bloqueDeLlaves(fuente: string, desde: number, contexto: string): string {
  let nivel = 0
  for (let i = desde; i < fuente.length; ) {
    const salto = saltarLiteral(fuente, i)
    if (salto !== i) {
      i = salto
      continue
    }
    const c = fuente[i]
    if (c === '{') nivel += 1
    else if (c === '}') {
      nivel -= 1
      if (nivel === 0) return fuente.slice(desde, i + 1)
    }
    i += 1
  }
  throw new Error(
    `${contexto}: el bloque no cierra llaves — la fuente quedó ilegible para el invariante. ` +
      'Arreglá el recorte junto con el cambio; un bloque que no se puede leer no protege nada.',
  )
}

/**
 * Índice de la llave que ABRE EL CUERPO de una función, dado el índice de su
 * paréntesis de apertura de parámetros.
 *
 * ── Por qué no alcanza «el primer `{` después de la firma» (P27) ─────────────
 * Porque las dos formas más comunes de este repo lo rompen, y lo rompen EN
 * SILENCIO —devolviendo un bloque que no es el cuerpo y que después firma
 * cualquier cosa—:
 *
 *   getNovedadesSetter(userId, leads, opts?: { excludeLeadIds?: … })
 *        └─ el primer `{` es el tipo del parámetro: se recortaban 551 caracteres
 *           de la LISTA DE PARÁMETROS, sin una sola consulta adentro.
 *   cargarProspecto(…): Promise<ActionResult<{ id: string }>> { … }
 *        └─ el primer `{` es el tipo de retorno: se recortaba `{ id: string }`.
 *
 * Los dos casos se detectaron comparando el recorte contra un mecanismo
 * independiente (el censo por declaraciones de nivel superior, que atribuía
 * consultas a funciones cuyo «cuerpo» no tenía ninguna).
 *
 * Se balancean los paréntesis de los parámetros y recién después se busca el
 * `{` a profundidad CERO de `(`/`[`/`<`, saltando `=>` para que el `>` de una
 * lambda de tipo no descuadre el conteo de genéricos.
 */
function aperturaDelCuerpo(fuente: string, parenIdx: number, contexto: string): number {
  let nivel = 0
  let i = parenIdx
  for (; i < fuente.length; ) {
    const salto = saltarLiteral(fuente, i)
    if (salto !== i) {
      i = salto
      continue
    }
    const c = fuente[i]
    if (c === '(') nivel += 1
    else if (c === ')') {
      nivel -= 1
      if (nivel === 0) {
        i += 1
        break
      }
    }
    i += 1
  }
  assert.ok(nivel === 0 && i < fuente.length, `${contexto}: la firma no cierra paréntesis`)

  let profundidad = 0
  for (; i < fuente.length; ) {
    const salto = saltarLiteral(fuente, i)
    if (salto !== i) {
      i = salto
      continue
    }
    const c = fuente[i]
    if (c === '=' && fuente[i + 1] === '>') {
      i += 2
      continue
    }
    if (c === '(' || c === '[' || c === '<') profundidad += 1
    else if (c === ')' || c === ']' || c === '>') profundidad = Math.max(0, profundidad - 1)
    else if (c === '{') {
      if (profundidad === 0) return i
      profundidad += 1
    } else if (c === '}') profundidad = Math.max(0, profundidad - 1)
    i += 1
  }
  throw new Error(`${contexto}: no se encontró la llave del cuerpo — fuente ilegible`)
}

/**
 * El CUERPO de `export function <nombre>(` en un archivo del repo — desde su
 * llave de apertura hasta la de cierre.
 *
 * Lanza si la función no existe: una función que se renombró o se fue se lleva
 * puestas sus garantías, y el invariante tiene que enterarse en vez de firmar
 * sobre un texto vacío.
 */
export function cuerpoDeFuncion(partes: readonly string[], nombre: string): string {
  const fuente = fuenteDe(...partes)
  const contexto = `function ${nombre} de ${rotulo(partes)}`
  // `\n` obligatorio adelante: ancla la declaración a su renglón, así una
  // mención en un comentario de doc («…llama a getNovedadesSetter(…)») no puede
  // hacer pasar el recorte por otro lado.
  const decl = new RegExp(
    `\\n(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?function\\s+${nombre}\\s*(?:<[^>]*>)?\\s*\\(`,
  )
  const m = decl.exec(fuente)
  assert.ok(
    m,
    `no existe \`function ${nombre}(\` en ${rotulo(partes)}. Si la función se renombró o se ` +
      'fue, sus garantías se fueron con ella: actualizá el invariante junto con el cambio, ' +
      'no lo borres — sin este recorte el chequeo firmaría sobre un texto vacío.',
  )
  const apertura = aperturaDelCuerpo(fuente, m.index + m[0].length - 1, contexto)
  const cuerpo = bloqueDeLlaves(fuente, apertura, contexto)
  assert.ok(
    cuerpo.length > 2,
    `el cuerpo de \`${nombre}\` en ${rotulo(partes)} quedó vacío — el recorte no sirve como red`,
  )
  return cuerpo
}

/**
 * El VALOR que sigue a `clave:` en un bloque — el objeto `{…}` entero si lo hay,
 * o la expresión hasta la coma de su mismo nivel.
 *
 * Es lo que permite afirmar sobre el PAYLOAD de una escritura sin que el resto
 * del bloque lo firme: `saveOwnedProgreso` tiene `stage: 'CONSTRUCCION'` en su
 * `where` (legítimo, es el guard optimista) y no debe tenerlo en su `data`.
 * Buscar `stage` en el bloque entero no distingue esos dos; recortar el `data:`
 * sí.
 */
export function valorDeClave(bloque: string, clave: string, contexto: string): string {
  const i = bloque.indexOf(`${clave}:`)
  assert.notEqual(
    i,
    -1,
    `${contexto}: no se encontró \`${clave}:\`. Si la escritura cambió de forma, el invariante ` +
      'no puede verificar su payload: actualizalo junto con el cambio.',
  )
  let j = i + clave.length + 1
  while (j < bloque.length && /\s/.test(bloque[j]!)) j += 1
  if (bloque[j] === '{') return bloqueDeLlaves(bloque, j, contexto)
  // Expresión suelta (una llamada, un identificador): hasta la coma de su nivel.
  let nivel = 0
  for (let k = j; k < bloque.length; ) {
    const salto = saltarLiteral(bloque, k)
    if (salto !== k) {
      k = salto
      continue
    }
    const c = bloque[k]!
    if (c === '(' || c === '[' || c === '{') nivel += 1
    else if (c === ')' || c === ']' || c === '}') {
      if (nivel === 0) return bloque.slice(j, k).trim()
      nivel -= 1
    } else if (c === ',' && nivel === 0) return bloque.slice(j, k).trim()
    k += 1
  }
  return bloque.slice(j).trim()
}

/**
 * Las claves de PRIMER NIVEL de un objeto literal recortado de la fuente.
 *
 * Permite conservar en el sujeto REAL la exactitud que una aserción tenía sobre
 * un espejo escrito a mano (`assert.deepEqual(Object.keys(writeData), […])`):
 * pasar de un espejo a la fuente no puede costar precisión, o el invariante se
 * debilita justo donde se lo estaba fortaleciendo.
 *
 * Un spread (`...ALGO`) se devuelve tal cual, con los puntos: es una clave que
 * no se puede resolver leyendo texto, y decirlo es más honesto que omitirla.
 */
export function clavesDeObjeto(objeto: string): string[] {
  const claves: string[] = []
  let nivel = 0
  let inicio = -1
  for (let i = 0; i < objeto.length; ) {
    const salto = saltarLiteral(objeto, i)
    if (salto !== i) {
      i = salto
      continue
    }
    const c = objeto[i]!
    if (c === '{' || c === '(' || c === '[') {
      nivel += 1
      if (nivel === 1) inicio = i + 1
    } else if (c === '}' || c === ')' || c === ']') {
      if (nivel === 1 && inicio !== -1) {
        const ultima = objeto.slice(inicio, i).trim()
        if (ultima.length > 0) claves.push(ultima)
      }
      nivel -= 1
    } else if (c === ',' && nivel === 1) {
      claves.push(objeto.slice(inicio, i).trim())
      inicio = i + 1
    }
    i += 1
  }
  return claves
    .filter((entrada) => entrada.length > 0)
    .map((entrada) =>
      entrada.startsWith('...') ? entrada : (entrada.split(':')[0] ?? entrada).trim(),
    )
}

/**
 * El objeto literal asignado a `const <nombre>` dentro de un bloque —saltando la
 * anotación de tipo, si la hay.
 *
 * `valorDeClave` no sirve para esto: busca `nombre:` y en
 *
 *     const data: Prisma.OsLeadDossierUpdateManyMutationInput = { … }
 *
 * lo que sigue a `data:` es el TIPO, no el valor. Medido en P27: el recorte se
 * pasaba del objeto y seguía leyendo el `switch` de abajo, con lo cual un
 * `...RELOOP_RESET` escrito en cualquier otro lado de la función lo habría
 * satisfecho — el mismo falso verde por granularidad, una capa más adentro.
 */
export function objetoAsignadoA(bloque: string, nombre: string, contexto: string): string {
  const decl = new RegExp(`const\\s+${nombre}\\s*(?::[^=]*)?=\\s*\\{`)
  const m = decl.exec(bloque)
  assert.ok(
    m,
    `${contexto}: no se encontró \`const ${nombre} = {…}\`. Si la composición cambió de forma, ` +
      'el invariante no puede verificarla: actualizalo junto con el cambio.',
  )
  return bloqueDeLlaves(bloque, m.index + m[0].length - 1, contexto)
}

/**
 * Las declaraciones de NIVEL SUPERIOR de un archivo (columna 0), con el tramo de
 * texto que le corresponde a cada una: desde su propia línea hasta la línea de
 * la siguiente.
 *
 * ── Por qué particionar y no balancear llaves ────────────────────────────────
 * En un `.tsx` el sujeto natural es el COMPONENTE, y un componente es una
 * declaración de nivel superior. Partir el archivo por esas declaraciones da el
 * mismo recorte que balancear llaves, sin depender de que el JSX —lleno de
 * llaves dentro de atributos y de textos— balancee. Y es estrictamente MÁS
 * acotado que el archivo entero, que es de lo que se trata.
 */
export type BloqueTop = { nombre: string; texto: string; desde: number; hasta: number }

const DECLARACION_TOP =
  /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+([A-Za-z_$][\w$]*)/gm

export function bloquesTopLevel(fuente: string): BloqueTop[] {
  const marcas: { nombre: string; desde: number }[] = []
  DECLARACION_TOP.lastIndex = 0
  for (const m of fuente.matchAll(DECLARACION_TOP)) {
    marcas.push({ nombre: m[1]!, desde: m.index! })
  }
  return marcas.map((marca, i) => ({
    nombre: marca.nombre,
    desde: marca.desde,
    hasta: marcas[i + 1]?.desde ?? fuente.length,
    texto: fuente.slice(marca.desde, marcas[i + 1]?.desde ?? fuente.length),
  }))
}

/** La declaración de nivel superior que contiene el índice `idx`. */
export function bloqueTopLevelDe(fuente: string, idx: number): BloqueTop | null {
  const bloques = bloquesTopLevel(fuente)
  for (let i = bloques.length - 1; i >= 0; i -= 1) {
    const b = bloques[i]!
    if (idx >= b.desde && idx < b.hasta) return b
  }
  return null
}

// ── Censo de consultas Prisma ────────────────────────────────────────────────

/** Una llamada a Prisma encontrada en la fuente. */
export type ConsultaPrisma = {
  /** `osLead`, `osSetterNotice`, … */
  modelo: string
  /** `findMany`, `updateMany`, `count`, … */
  operacion: string
  /** Declaración de nivel superior que la contiene (o `'(top)'`). */
  funcion: string
  /** 1-based, para que el mensaje de error se pueda abrir. */
  linea: number
}

/**
 * Toda llamada `prisma.<modelo>.<operacion>(` / `tx.<modelo>.<operacion>(` de un
 * archivo, para los modelos pedidos. Es la materia prima del censo congelado:
 * lo que permite afirmar que no apareció una consulta NUEVA sin filtro, que es
 * justo lo que un chequeo «el helper aparece en el bloque» no puede ver.
 */
export function consultasPrismaEn(
  partes: readonly string[],
  modelos: readonly string[],
): ConsultaPrisma[] {
  const fuente = fuenteDe(...partes)
  const bloques = bloquesTopLevel(fuente)
  const patron = new RegExp(
    `(?:prisma|tx)\\.(${modelos.join('|')})\\.([a-zA-Z]+)\\s*\\(`,
    'g',
  )
  const salida: ConsultaPrisma[] = []
  for (const m of fuente.matchAll(patron)) {
    const idx = m.index!
    const bloque = bloques.find((b) => idx >= b.desde && idx < b.hasta)
    salida.push({
      modelo: m[1]!,
      operacion: m[2]!,
      funcion: bloque?.nombre ?? '(top)',
      linea: fuente.slice(0, idx).split('\n').length,
    })
  }
  return salida
}

// ── Recortes que necesita el invariante del REFLEJO (P31) ────────────────────

/**
 * Desde el paréntesis de apertura en `desde`, el texto hasta su cierre
 * (inclusive), salteando literales y comentarios.
 *
 * Es el gemelo por paréntesis de `bloqueDeLlaves`, y existe por lo mismo: el
 * sujeto de un invariante sobre call-sites es LA LLAMADA —`run(…)`,
 * `startTransition(…)`—, no el archivo. Buscar en el archivo entero le deja a
 * una acción muda que le firme la señal el `successToast` de la acción de al
 * lado; es el falso verde por granularidad que P25 y P27 ya cerraron dos veces
 * en `acuse-recibo`.
 */
export function bloqueDeParentesis(fuente: string, desde: number, contexto: string): string {
  let nivel = 0
  for (let i = desde; i < fuente.length; ) {
    const salto = saltarLiteral(fuente, i)
    if (salto !== i) {
      i = salto
      continue
    }
    const c = fuente[i]
    if (c === '(') nivel += 1
    else if (c === ')') {
      nivel -= 1
      if (nivel === 0) return fuente.slice(desde, i + 1)
    }
    i += 1
  }
  throw new Error(
    `${contexto}: el bloque no cierra paréntesis — la fuente quedó ilegible para el invariante. ` +
      'Arreglá el recorte junto con el cambio; un bloque que no se puede leer no protege nada.',
  )
}

/**
 * La misma fuente con los COMENTARIOS reemplazados por espacios — mismos
 * índices, mismo largo, y los literales INTACTOS.
 *
 * Lo pide un censo que pregunta «¿esta acción revalida?»: `ofrecerHorarios`
 * tiene escrito en un comentario «Sin revalidatePath: este sprint es backend
 * puro», y un `grep` lo cuenta como que SÍ revalida — exactamente al revés de lo
 * que dice. Medido: el primer censo de P31 la marcó revalidando por esa línea.
 *
 * ── Por qué los literales quedan intactos, y por qué igual hay que saltearlos ─
 * Blanquearlos también parecía más prolijo, y rompió al primer uso: un chequeo
 * que busca `from 'sonner'` o `<Toaster` deja de encontrarlos si el contenido de
 * las comillas pasó a ser espacios. Pero SALTEARLOS no es opcional: `'https://…'`
 * tiene un `//` adentro, y un escáner que no reconozca el literal se come el
 * resto del renglón creyendo que arrancó un comentario. Este repo tiene URLs en
 * literales (`'https://smoke-draft.netlify.app'`), así que ese borrado sería
 * silencioso.
 */
export function sinComentarios(fuente: string): string {
  const salida = fuente.split('')
  for (let i = 0; i < fuente.length; ) {
    const c = fuente[i]
    if (c === "'" || c === '"' || c === '`') {
      i = saltarLiteral(fuente, i)
      continue
    }
    if (c === '/' && (fuente[i + 1] === '/' || fuente[i + 1] === '*')) {
      const fin = saltarLiteral(fuente, i)
      // Los saltos de línea se conservan para que los números de renglón de los
      // mensajes de error sigan siendo los del archivo real.
      for (let k = i; k < Math.min(fin, fuente.length); k += 1) {
        if (salida[k] !== '\n') salida[k] = ' '
      }
      i = fin
      continue
    }
    i += 1
  }
  return salida.join('')
}
