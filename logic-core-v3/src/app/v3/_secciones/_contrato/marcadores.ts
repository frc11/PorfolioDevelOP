/**
 * LAS CONVENCIONES DE RELLENO — y los detectores que las hacen comprobables.
 *
 * ⚠️ **REGLA DURA DEL SPRINT, Y NO SE NEGOCIA: EL CONTENIDO INVENTADO TIENE
 * QUE PARECER INVENTADO.**
 *
 * develOP tiene deuda registrada por esto. Sus cuatro landings actuales llevan
 * cifras y testimonios fabricados —`+340%`, `86% más económico`,
 * `2+ años en el mercado`, `Respondemos en menos de 2hs`— que nadie midió y que
 * hoy están publicados. **No se duplica.**
 *
 * La asimetría que justifica la regla es toda la razón:
 *
 *   · un **marcador visible** (`[MÉTRICA]`) es un pedido que no se puede
 *     ignorar: quien mire la pantalla lo ve y sabe que falta un dato;
 *   · una **cifra falsa** se publica sin que nadie se acuerde de que era falsa,
 *     porque se lee exactamente igual que una verdadera.
 *
 * Por eso el relleno de este lane no imita el aspecto de un dato: lo declara
 * ausente. Los textos sí tienen la longitud y la estructura retórica correctas
 * —hacen falta para juzgar la composición— pero **ningún número**.
 *
 * ── La forma que toma la regla en el código ────────────────────────────────
 *
 * El contenido de cada sección es un DATO, en su propio archivo, y sobre ese
 * dato corren tres comprobaciones, cada una con su control positivo:
 *
 *   1. **Cero cifras con símbolo** — un dígito pegado a `%`, `+` o `×` es la
 *      forma exacta que tiene la deuda que no se repite. Es la que pide §0.4.
 *   2. **Cero dígitos, punto.** Es más fuerte que la anterior y la contiene:
 *      `12 proyectos` no lleva símbolo y se lee como un hecho igual. La regla
 *      del sprint dice *ningún número que se pueda leer como un hecho*, y la
 *      única lectura operativa de eso es "ninguno".
 *   3. **Cero números fuera de los textos** — el contenido no tiene hojas
 *      numéricas. Un `{ clientes: 12 }` no lo ve un escáner de cadenas, y
 *      llegaría a la pantalla igual.
 *
 * ── Dónde va la geometría, entonces ────────────────────────────────────────
 *
 * En el COMPONENTE, no en el contenido. La relación de aspecto de una imagen,
 * su `sizes` y su ancho intrínseco son técnicos: los decide quien construye la
 * sección y no cambian cuando Franco traiga el dato real. Mezclarlos con el
 * contenido obligaría a exceptuarlos del escáner, y una excepción es por donde
 * vuelve a entrar la primera cifra inventada.
 */

/**
 * LOS MARCADORES — el conjunto cerrado.
 *
 * Cerrado a propósito. Con la lista abierta cada sección inventa el suyo
 * —`[NUMERO]`, `[dato]`, `[XX]`— y el pedido a Franco deja de ser una lista
 * para pasar a ser una búsqueda. Agregar uno es editar esta línea, que es
 * exactamente el momento en que alguien tiene que pensarlo.
 *
 * ── La unificación de los dos vocabularios (SITIO-S7) ─────────────────────
 *
 * Los dos lanes escribieron el suyo: seis marcadores el lane A, trece el lane
 * B, con cinco en común y ninguno en conflicto. **Acá van los dos, unidos**, y
 * ésta es la única de las divergencias del contrato donde unir era la
 * respuesta y no elegir: no son dos formas de resolver un problema, son dos
 * mitades del mismo vocabulario. Elegir una habría dejado secciones con
 * marcadores fuera de la lista cerrada, que es exactamente el estado que la
 * lista existe para impedir.
 *
 * Están agrupados por lo que se pide, porque es como se lee el pedido.
 *
 * ⚠ **Ninguno lleva dígitos.** El home actual usa `[+00%]`, `[00 días]` y
 * `[000]`, que son marcadores honestos y a la vez cifras con símbolo: se ven
 * como el dato que reemplazan. Acá se prefiere la palabra, que no se puede leer
 * como un número ni por accidente, y que además deja pasar el escáner sin una
 * sola excepción.
 */
export const MARCADORES = [
  // Datos que se leen como un hecho.
  '[CIFRA]',
  '[MÉTRICA]',
  '[PRECIO]',
  '[PLAZO]',
  '[FECHA]',
  // Palabras de alguien.
  '[TESTIMONIO]',
  '[NOMBRE]',
  '[TEXTO]',
  // Archivos que no existen.
  '[FOTO DEL EQUIPO]',
  '[CAPTURA]',
  '[CAPTURA DEL PANEL]',
  '[VIDEO]',
  '[PÓSTER]',
  '[LOGO]',
  // Destinos.
  '[ENLACE]',
] as const

export type Marcador = (typeof MARCADORES)[number]

const CONJUNTO_DE_MARCADORES: ReadonlySet<string> = new Set(MARCADORES)

export function esMarcador(valor: string): valor is Marcador {
  return CONJUNTO_DE_MARCADORES.has(valor)
}

/** Cualquier cosa entre corchetes. Lo que aparezca acá y no esté en la lista
 *  cerrada es un marcador inventado, y el instrumento lo nombra. */
const CORCHETES = /\[[^\]]*\]/g

export function marcadoresDe(texto: string): string[] {
  return [...texto.matchAll(CORCHETES)].map((m) => m[0])
}

export function marcadoresDesconocidosDe(texto: string): string[] {
  return marcadoresDe(texto).filter((m) => !esMarcador(m))
}

/**
 * DETECTOR 1 — cifras con símbolo. La forma exacta de la deuda de develOP.
 *
 * `+340%`, `3× más`, `86%`, `2+ años`. El símbolo puede ir de los dos lados,
 * así que se miran los dos. `x` minúscula entra como multiplicador —`3x` es
 * exactamente lo mismo que `3×` y se escribe más— pero sólo pegada a un dígito,
 * para no marcar la x de una palabra.
 */
const CIFRA_CON_SIMBOLO = /[+×%‰]\s?\d|\d\s?[+×%‰]|\d\s?x(?![a-záéíóúñ])/giu

export function cifrasConSimboloDe(texto: string): string[] {
  return [...texto.matchAll(CIFRA_CON_SIMBOLO)].map((m) => m[0])
}

/**
 * DETECTOR 2 — cualquier dígito. Es el que manda, y contiene al anterior.
 *
 * El anterior no sobra: nombra la clase de defecto que el sprint señala, y su
 * salida se lee distinto en un reporte ("cero cifras con símbolo" contra "cero
 * dígitos"). Los dos corren, los dos tienen control positivo.
 */
export function digitosDe(texto: string): string[] {
  return [...texto.matchAll(/\d+/g)].map((m) => m[0])
}

/**
 * LA LISTA BLANCA — declarada, y hoy vacía.
 *
 * §0.4 admite excepciones "que estén en una lista blanca declarada". Ninguna
 * hizo falta: las cuatro secciones se escribieron sin un solo dígito en el
 * contenido, así que la lista está vacía **y eso es un resultado, no un
 * descuido**. El día que una haga falta se agrega acá con su motivo, y el
 * instrumento la nombra en su salida — nunca en silencio.
 *
 * ⚠ La lista vacía NO es lo que hace pasar la comprobación: lo que la hace
 * pasar es que no hay hallazgos. Que el detector no esté ciego lo prueban los
 * controles positivos, no esta constante.
 */
export interface ExcepcionDeCifra {
  /** El texto exacto que se admite. */
  readonly texto: string
  /** En qué sección. */
  readonly seccion: string
  /** Por qué no es una cifra inventada. Obligatorio. */
  readonly motivo: string
}

export const LISTA_BLANCA_DE_CIFRAS: readonly ExcepcionDeCifra[] = []

const TEXTOS_EN_LISTA_BLANCA: ReadonlySet<string> = new Set(
  LISTA_BLANCA_DE_CIFRAS.map((e) => e.texto),
)

export function estaEnListaBlanca(texto: string): boolean {
  return TEXTOS_EN_LISTA_BLANCA.has(texto)
}

/** Una hoja del contenido, con la ruta por la que se llegó a ella. */
export interface Hoja<T> {
  /** `proyectos[0].nombre`. Es lo que hace accionable un hallazgo. */
  readonly ruta: string
  readonly valor: T
}

/**
 * Recorre un contenido y devuelve TODAS sus cadenas, con su ruta.
 *
 * Sobre `unknown` a propósito: cada sección tiene su propia forma y ninguna
 * tiene que declararle nada al escáner. Recorre objetos y arreglos; ignora
 * funciones y símbolos, que no pueden llegar a una pantalla como texto.
 */
export function textosDe(valor: unknown, ruta = ''): Hoja<string>[] {
  if (typeof valor === 'string') return [{ ruta: ruta || '(raíz)', valor }]
  if (Array.isArray(valor)) return valor.flatMap((v, i) => textosDe(v, `${ruta}[${i}]`))
  if (typeof valor === 'object' && valor !== null) {
    return Object.entries(valor).flatMap(([clave, v]) =>
      textosDe(v, ruta === '' ? clave : `${ruta}.${clave}`),
    )
  }
  return []
}

/**
 * Lo mismo para los números. Es el detector 3: una hoja numérica no la ve un
 * escáner de cadenas y llega a la pantalla igual.
 */
export function numerosDe(valor: unknown, ruta = ''): Hoja<number>[] {
  if (typeof valor === 'number') return [{ ruta: ruta || '(raíz)', valor }]
  if (Array.isArray(valor)) return valor.flatMap((v, i) => numerosDe(v, `${ruta}[${i}]`))
  if (typeof valor === 'object' && valor !== null) {
    return Object.entries(valor).flatMap(([clave, v]) =>
      numerosDe(v, ruta === '' ? clave : `${ruta}.${clave}`),
    )
  }
  return []
}

/** Un hallazgo del escáner: dónde estaba y qué se encontró. */
export interface Hallazgo {
  readonly ruta: string
  readonly texto: string
  readonly encontrado: readonly string[]
}

/** Las cadenas del contenido que llevan una cifra con símbolo. */
export function hallazgosDeCifraConSimbolo(contenido: unknown): Hallazgo[] {
  return hallazgos(contenido, cifrasConSimboloDe)
}

/** Las cadenas del contenido que llevan cualquier dígito. */
export function hallazgosDeDigito(contenido: unknown): Hallazgo[] {
  return hallazgos(contenido, digitosDe)
}

/** Las cadenas del contenido con un marcador que no está en la lista cerrada. */
export function hallazgosDeMarcadorDesconocido(contenido: unknown): Hallazgo[] {
  return hallazgos(contenido, marcadoresDesconocidosDe)
}

function hallazgos(contenido: unknown, detector: (texto: string) => string[]): Hallazgo[] {
  const salida: Hallazgo[] = []
  for (const { ruta, valor } of textosDe(contenido)) {
    if (estaEnListaBlanca(valor)) continue
    const encontrado = detector(valor)
    if (encontrado.length > 0) salida.push({ ruta, texto: valor, encontrado })
  }
  return salida
}

/**
 * Los marcadores que un contenido deja pedidos, en orden de aparición y sin
 * repetir. Es el pedido a Franco, producido por la misma función que lo
 * comprueba — no transcrito a mano en un reporte.
 */
export function marcadoresPedidos(contenido: unknown): string[] {
  const vistos: string[] = []
  for (const { valor } of textosDe(contenido)) {
    for (const marcador of marcadoresDe(valor)) {
      if (!vistos.includes(marcador)) vistos.push(marcador)
    }
  }
  return vistos
}

/** Cuántas veces aparece cada marcador. El pedido necesita la cuenta, no sólo
 *  la lista: "falta `[CIFRA]`" no dice cuántas casillas hay que llenar. */
export function cuentaDeMarcadores(contenido: unknown): Map<string, number> {
  const cuenta = new Map<string, number>()
  for (const { valor } of textosDe(contenido)) {
    for (const marcador of marcadoresDe(valor)) {
      cuenta.set(marcador, (cuenta.get(marcador) ?? 0) + 1)
    }
  }
  return cuenta
}
