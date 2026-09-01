/**
 * LeadOS — La ficha de observación, ORDENADA POR FUENTE (el recorrido real).
 *
 * Qué resuelve. El setter sale a mirar tres lugares: el Instagram, la ficha de
 * Google y la web que ya tienen. Hasta acá la pantalla le pedía los DATOS en un
 * orden (identidad, presencia, reseñas, contenido…) y el MATERIAL en otro
 * momento (el grupo «material para construir la demo», al final), así que
 * recorría las tres fuentes dos veces: una para anotar y otra para bajar el logo
 * y las fotos. Este módulo es el censo de qué campo se saca de dónde, para que
 * cada fuente se visite UNA vez.
 *
 * REGLA DE LÍMITE — esto es el MAPA, no el criterio ni las palabras:
 *   - Acá vive a QUÉ BLOQUE pertenece cada campo y qué significa que un bloque
 *     esté completo.
 *   - El CRITERIO de la señal mínima sigue siendo `fichaFaltantes` (`flow.ts`),
 *     único dueño del gate. Este módulo no lo reimplementa. Los `REQUISITOS` de
 *     abajo son el mapa requisito→campos que `fichaFaltantes` no expone (devuelve
 *     prosa), y el invariante cruza los dos con fichas sintéticas: si alguien
 *     agrega un requisito allá y no lo mapea acá, rojo.
 *   - Las PALABRAS (título de cada bloque, qué mirar, qué bajar) viven en
 *     `guidance-content.ts`, como el resto del copy del paso.
 *
 * Sin React, sin Prisma, sin 'use server': lógica pura (mismo patrón que
 * `flow.ts` / `ficha-calidad.ts`), importable desde el cliente y desde un
 * invariante bajo tsx.
 *
 * ── Qué NO hace ──────────────────────────────────────────────────────────────
 * No bloquea nada. Un bloque «incompleto» solo significa «acá todavía no avanzo
 * solo»: todos los bloques se pueden abrir a mano en cualquier orden, y el único
 * gate que decide si el veredicto entra sigue siendo el server-side de
 * `registrarEvaluacion`. Un negocio sin web tiene que poder seguir.
 */
import type { Ficha } from '@/lib/leados/contracts'

// ── Los bloques, en el orden del recorrido ───────────────────────────────────

/**
 * El orden ES el del viaje: se abre el Instagram, después la ficha de Google,
 * después la web —si tienen—, y recién ahí se puede escribir el balance («qué
 * tienen y qué no»), porque necesita haber mirado las tres. El cierre es el
 * veredicto: no es un campo de la ficha, es el paso que cierra la pantalla.
 */
export const BLOQUE_IDS = ['instagram', 'google', 'web', 'balance', 'cierre'] as const
export type BloqueId = (typeof BLOQUE_IDS)[number]

/** Los bloques que se llenan con campos de la ficha (el cierre no es uno). */
export const BLOQUES_DE_FICHA = ['instagram', 'google', 'web', 'balance'] as const
export type BloqueFichaId = (typeof BLOQUES_DE_FICHA)[number]

// ── El censo: qué campo se saca de dónde ─────────────────────────────────────

/**
 * Los campos del formulario de la ficha. Fuente única del set: `FichaFormState`
 * (en `ficha-form.tsx`) se deriva de acá, así el COMPILADOR —no un chequeo—
 * garantiza que no exista un campo del form sin bloque asignado, ni un bloque
 * asignado a un campo que no existe.
 */
export type CampoFicha =
  | 'igManejadoPor'
  | 'identidadNotas'
  | 'contenidoReal'
  | 'comoSePresenta'
  | 'imagenesUrl'
  | 'resenas'
  | 'resenasUrl'
  | 'queVende'
  | 'presenciaDigital'
  | 'senalesOperativas'
  | 'otraRedUrl'
  | 'otros'

/**
 * EL CENSO. A qué fuente pertenece cada campo, según lo que pide su propio hint
 * en `GUIA_FICHA` (no según una intuición). Los tres casos que NO tienen fuente
 * única quedan anotados, porque quien los lea después tiene que saber que la
 * asignación fue una decisión y no un hecho:
 *
 *   · `identidadNotas` — su ejemplo es de Instagram («la cuenta la firma
 *     Marce»), pero «hace cuánto existe el negocio» también sale de Maps. Va a
 *     Instagram FORZADO POR EL CONTRATO: `identidad` es un solo objeto y
 *     `fichaFaltantes` evalúa notas/igManejadoPor como un OR — separarlos
 *     partiría un requisito del gate entre dos bloques sin ninguna necesidad.
 *
 *   · `comoSePresenta` — «su bio, su eslogan o el quiénes somos»: la bio es de
 *     Instagram y el quiénes-somos de la web. Desempata su propio ejemplo, que
 *     dice «bio de IG».
 *
 *   · `imagenesUrl` — «una carpeta de Drive, la web vieja, el perfil con las
 *     mejores fotos»: las tres. Va a Instagram para quedar PEGADO a
 *     `contenidoReal` («¿hay logo? ¿las fotos son reales?»), que es la misma
 *     mirada al mismo perfil. Separarlos reconstruiría adentro de la pantalla el
 *     doble viaje que este orden viene a sacar.
 *
 * Y el hallazgo del censo: `presenciaDigital`, `senalesOperativas`, `otraRedUrl`
 * y `otros` no salen de NINGUNA fuente sola. `presenciaDigital` pide «qué tienen
 * y qué no» —un inventario que solo se puede escribir después de mirar las
 * tres—; `senalesOperativas` reparte sus preguntas entre las tres (horarios en
 * Maps, pedidos por DM en Instagram, demoras en las reseñas); `otraRedUrl`
 * apunta a una cuarta red; `otros` es el cajón. Son el bloque `balance`: el que
 * apareció del censo, y va después del recorrido porque antes no hay con qué
 * contestarlo.
 */
export const BLOQUE_DE_CAMPO: Record<CampoFicha, BloqueFichaId> = {
  igManejadoPor: 'instagram',
  identidadNotas: 'instagram',
  contenidoReal: 'instagram',
  comoSePresenta: 'instagram',
  imagenesUrl: 'instagram',
  resenas: 'google',
  resenasUrl: 'google',
  queVende: 'web',
  presenciaDigital: 'balance',
  senalesOperativas: 'balance',
  otraRedUrl: 'balance',
  otros: 'balance',
}

/** Los campos de un bloque, en el orden en que se declararon arriba. */
export function camposDelBloque(bloque: BloqueFichaId): CampoFicha[] {
  return (Object.keys(BLOQUE_DE_CAMPO) as CampoFicha[]).filter(
    (campo) => BLOQUE_DE_CAMPO[campo] === bloque,
  )
}

// ── La señal mínima, mapeada a los campos que la arreglan ────────────────────

/**
 * Los requisitos de `fichaFaltantes`, con los campos que pueden satisfacerlos.
 * NO es una segunda implementación del gate: es la traducción requisito→campos
 * que `fichaFaltantes` no expone porque devuelve prosa. El invariante
 * (`ficha-bloques.invariant.ts`) le da a `fichaFaltantes` fichas sintéticas
 * armadas con estos campos y exige que el conteo coincida en las dos
 * direcciones — cumplir todo esto tiene que dar cero faltantes, y romper uno
 * tiene que dar exactamente uno. Un requisito nuevo allá sin mapa acá = rojo.
 */
export const REQUISITOS = [
  { id: 'identidad', campos: ['igManejadoPor', 'identidadNotas'] },
  { id: 'presencia', campos: ['presenciaDigital'] },
  { id: 'evidencia', campos: ['resenas', 'contenidoReal'] },
] as const satisfies readonly { id: string; campos: readonly CampoFicha[] }[]

export type RequisitoId = (typeof REQUISITOS)[number]['id']

/** El estado del formulario visto como texto plano — lo único que este módulo mira. */
export type ValoresFicha = Record<CampoFicha, string>

const conContenido = (valores: ValoresFicha, campo: CampoFicha): boolean =>
  valores[campo].trim().length > 0

/** ¿Qué requisitos de la señal mínima siguen sin cumplirse? (OR por requisito). */
export function requisitosPendientes(valores: ValoresFicha): RequisitoId[] {
  return REQUISITOS.filter(
    (requisito) => !requisito.campos.some((campo) => conContenido(valores, campo)),
  ).map((requisito) => requisito.id)
}

/**
 * Lo que un bloque DEBE: los requisitos pendientes que se pueden arreglar desde
 * él. Un requisito con campos en dos bloques (`evidencia`: las reseñas están en
 * Google y el contenido real en Instagram) lo deben LOS DOS mientras nadie lo
 * cumpla, y deja de deberlo cualquiera apenas uno de los dos se llena — que es
 * exactamente lo que dice el gate.
 */
export function deudaDelBloque(bloque: BloqueFichaId, valores: ValoresFicha): RequisitoId[] {
  const pendientes = new Set<RequisitoId>(requisitosPendientes(valores))
  return REQUISITOS.filter(
    (requisito) =>
      pendientes.has(requisito.id) &&
      requisito.campos.some((campo) => BLOQUE_DE_CAMPO[campo] === bloque),
  ).map((requisito) => requisito.id)
}

/** ¿Hay algo escrito en este bloque? */
export function bloqueTieneContenido(bloque: BloqueFichaId, valores: ValoresFicha): boolean {
  return camposDelBloque(bloque).some((campo) => conContenido(valores, campo))
}

/**
 * COMPLETO = «no te debe nada y no está vacío».
 *
 * Las dos mitades hacen falta, y cada una responde a una pregunta distinta:
 *   · «no debe nada» es el gate — sin eso la ficha no habilita el veredicto.
 *   · «no está vacío» es lo que hace que el recorrido CAMINE. Sin esa mitad, un
 *     bloque cuyos campos son todos opcionales (la web) o cuyo requisito ya lo
 *     cumplió otro bloque (Google, cuando el contenido real se escribió en
 *     Instagram) estaría completo desde que se abre, y los tres siguientes se
 *     desplegarían de golpe: el recorrido por fuentes se perdería.
 *
 * Y sigue sin bloquear nada: «incompleto» solo significa que el avance
 * automático no salta desde acá. El bloque siguiente se abre a mano con un click
 * en su cabecera — por eso un negocio sin web no queda en un callejón.
 */
export function bloqueCompleto(bloque: BloqueFichaId, valores: ValoresFicha): boolean {
  return deudaDelBloque(bloque, valores).length === 0 && bloqueTieneContenido(bloque, valores)
}

// ── Qué bloque está abierto ──────────────────────────────────────────────────

/**
 * El bloque que se despliega AL ENTRAR a la pantalla.
 *
 *   · Si la señal mínima ya está cumplida → el cierre. El setter que vuelve con
 *     la ficha en condiciones vuelve a DECIDIR, no a releer las fuentes. Que le
 *     falte un bloque opcional (la web de un negocio que no tiene web) no lo
 *     puede mandar a un formulario en vez de a su veredicto.
 *   · Si todavía falta señal → el primer bloque incompleto, que es donde dejó el
 *     trabajo.
 *
 * Es una pregunta distinta de la que responde `bloqueSiguiente` («a dónde sigue
 * el recorrido»), y por eso la respuesta es distinta: entrar no es avanzar.
 *
 * Se DERIVA de lo que hay escrito — no se persiste nada. Ni cookie, ni clave en
 * `progresoJson`, ni columna: la ficha ya guarda sola (autosave), así que al
 * volver la derivación reconstruye el mismo lugar sin inventar un dato nuevo.
 */
export function bloqueInicial(valores: ValoresFicha): BloqueId {
  if (requisitosPendientes(valores).length === 0) return 'cierre'
  return BLOQUES_DE_FICHA.find((bloque) => !bloqueCompleto(bloque, valores)) ?? 'cierre'
}

/**
 * A dónde avanza solo el recorrido cuando el bloque abierto quedó completo: al
 * primero incompleto DESPUÉS de él; si no queda ninguno, al cierre. Devuelve
 * `null` si no hay a dónde ir (ya está en el cierre).
 *
 * Nunca retrocede: si el setter vuelve a un bloque anterior y lo vacía, el
 * avance no lo arrastra de vuelta — lo escrito no se pierde y lo abierto no se
 * mueve bajo sus pies. Solo cambia lo que dicen las cabeceras.
 */
export function bloqueSiguiente(desde: BloqueId, valores: ValoresFicha): BloqueId | null {
  if (desde === 'cierre') return null
  const indice = BLOQUES_DE_FICHA.indexOf(desde as BloqueFichaId)
  const posteriores = BLOQUES_DE_FICHA.slice(indice + 1)
  return posteriores.find((bloque) => !bloqueCompleto(bloque, valores)) ?? 'cierre'
}

// ── Puente con la ficha persistida ───────────────────────────────────────────

/**
 * La `Ficha` guardada, aplanada a los valores del formulario. Es el MISMO mapeo
 * que hace `estadoInicial` en `ficha-form.tsx`, expuesto acá para que la
 * derivación del bloque inicial se pueda calcular (y probar) sin montar React.
 */
export function valoresDeFicha(ficha: Ficha | null | undefined): ValoresFicha {
  return {
    igManejadoPor: ficha?.identidad?.igManejadoPor ?? '',
    identidadNotas: ficha?.identidad?.notas ?? '',
    contenidoReal: ficha?.contenidoReal ?? '',
    comoSePresenta: ficha?.materiales?.comoSePresenta ?? '',
    imagenesUrl: ficha?.materiales?.imagenesUrl ?? '',
    resenas: ficha?.resenas ?? '',
    resenasUrl: ficha?.materiales?.resenasUrl ?? '',
    queVende: ficha?.materiales?.queVende ?? '',
    presenciaDigital: ficha?.presenciaDigital ?? '',
    senalesOperativas: ficha?.senalesOperativas ?? '',
    otraRedUrl: ficha?.materiales?.otraRedUrl ?? '',
    otros: ficha?.otros ?? '',
  }
}
