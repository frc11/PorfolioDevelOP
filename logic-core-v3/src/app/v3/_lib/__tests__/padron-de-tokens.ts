/**
 * EL PADRÓN DE TOKENS — una sola fuente para "cuántos tokens declara el tema".
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 *
 * `tokens-de-uso.invariant.ts` afirmaba `TOKENS.length === 89` con un literal.
 * Eran 89 cuando se escribió y son 90 desde la corrección aprobada en la parada
 * de S3 —`--color-superficie-translucida`, el papel translúcido que le dio
 * superficie a `--blur-panel`—, así que el instrumento empezó a fallar por
 * crecer bien.
 *
 * **Un instrumento que afirma una cardinalidad escrita a mano se rompe cada vez
 * que el sistema crece legítimamente, y entrena a que se lo actualice sin
 * pensar** — que es la peor cosa que se le puede enseñar a quien lo mantiene.
 *
 * ── Qué hace en lugar de eso ──────────────────────────────────────────────
 *
 * El número NO se declara: se DERIVA del mismo padrón que ya usaba
 * `tokens.invariant.ts` —el original de S0, más una lista de excepciones
 * NOMBRADAS—. La cuenta sale de dos hechos verificables:
 *
 *   · cuántos tokens declara `docs/rediseno/s0/theme-develop.css`, que se
 *     conserva sin tocar justamente para esto;
 *   · qué se aprobó agregar o renombrar después, con su sprint y su motivo.
 *
 * Un renombre no mueve la cuenta (sale uno, entra uno). Un agregado la mueve en
 * uno, y sólo si está declarado acá. **Un token nuevo que no esté en esta lista
 * sigue rompiendo la comprobación, que es exactamente para lo que existe.**
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Cinco niveles: __tests__ → _lib → v3 → app → src → raíz del proyecto. */
export const RAIZ_DEL_PROYECTO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../..',
)

export const ORIGINAL_DE_S0 = path.join(RAIZ_DEL_PROYECTO, 'docs/rediseno/s0/theme-develop.css')
export const TEMA_EN_EL_REPO = path.join(RAIZ_DEL_PROYECTO, 'src/app/theme-develop.css')

/** Quita comentarios para no leer nombres de token citados en prosa. */
export const sinComentarios = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Nombres de custom property DECLARADOS (no referenciados). */
export function declarados(css: string): string[] {
  const encontrados = [...sinComentarios(css).matchAll(/(?:^|[;{}\s])(--[a-zA-Z0-9-]+)\s*:/g)]
  return [...new Set(encontrados.map((m) => m[1]))]
}

export interface Renombre {
  readonly de: string
  readonly a: string
  readonly sprint: string
  readonly motivo: string
}

export interface Agregado {
  readonly token: string
  readonly sprint: string
  readonly motivo: string
}

/**
 * Los renombres aprobados. NO mueven la cardinalidad: sale uno, entra uno.
 */
export const RENOMBRES: readonly Renombre[] = [
  {
    de: '--font-mono',
    a: '--font-codigo',
    sprint: 'S1',
    motivo: '`--font-mono` ya existía en `globals.css` y era la única colisión de nombre contra el sistema viejo.',
  },
]

/**
 * Los agregados aprobados después de S0. **Cada uno mueve la cardinalidad en
 * uno**, y sólo entra acá con aprobación explícita en una parada.
 */
export const AGREGADOS: readonly Agregado[] = [
  {
    token: '--color-superficie-translucida',
    sprint: 'S3',
    motivo:
      'La superficie sobre la cual `--blur-panel` significa algo. S0 había emitido el desenfoque sin emitir la superficie, así que era un token muerto que parecía vivo.',
  },
  {
    token: '--font-display',
    sprint: 'TITULAR',
    motivo:
      'La cuarta familia: Archivo, de la MISMA fundición que Chivo y con la misma cap height (686 sobre 1000, leída de los dos binarios), pero con un eje de ancho que Chivo no tiene. Es la cara de la línea 1 del titular del hero y la única del sistema que se sirve pinchada en un punto del eje `wdth` (62). Sin token, la familia viviría escrita adentro de una clase del Hero.',
  },
  {
    token: '--font-weight-liviano',
    sprint: 'TITULAR',
    motivo:
      'El quinto peso, 300. CIERRA UNA DECISIÓN QUE EL PROPIO TEMA DEJÓ ABIERTA: su bloque de pesos declaraba que el 300 existe en el eje de Chivo y que no se agregaba porque «agregarlo es una decisión de sistema», dejando el dato escrito para cuando hubiera que tomarla. La línea 2 del titular —Chivo Light itálica— la tomó.',
  },
  {
    token: '--text-display',
    sprint: 'TITULAR',
    motivo:
      'El noveno nivel de la escala, 58 px. [derivado] No es «un tamaño más grande»: es el mayor entero que entra en UNA línea en la caja medida del titular (478,40 px a 1440) con el avance del `.woff2` que se sirve (8,5670 em en wdth 62 · wght 700) y el interletrado del nivel (−0,02 em). Con 59 se pasa. La cuenta la vuelve a correr `hero.invariant.tsx` §12b contra el binario.',
  },
  {
    token: '--text-fluido-display',
    sprint: 'TITULAR',
    motivo:
      'La séptima expresión fluida, con EL MISMO método que las seis de S0 y ni una excepción: piso a 375, el token fijo a 1440, la recta evaluada en 1920 como techo. El piso (37 px) también es forzado: es el único entero que a la vez pasa el piso de `titulo-xl` (36, o los dos niveles colisionarían a 375) y entra en una línea en la caja medida a 375 (311,00 px).',
  },
  {
    token: '--text-display-xl',
    sprint: 'TITULAR',
    motivo:
      'El décimo nivel de la escala, 104 px, y el MÁS GRANDE de los diez. [derivado] Es la línea 2 del titular con el mismo método que el noveno: el mayor entero que entra en UNA línea en la caja medida (478,39 px a 1440) con el avance medido de la cara (4,58409 em, Chivo Light itálica) y el interletrado del nivel (−0,03 em). Con 105 se pasa: 481,33 px contra 478,39 de caja. Sube la línea 2 de 44 a 104 px, o sea al 179 % de la línea 1, que queda congelada en 58.',
  },
  {
    token: '--text-fluido-display-xl',
    sprint: 'TITULAR',
    motivo:
      'La octava expresión fluida, con el mismo método y las mismas tres anclas: piso a 375, el token fijo a 1440, la recta evaluada en 1920 como techo. El piso (67 px) también es forzado: es el mayor entero que entra en una línea en la caja medida a 375 (311,00 px; con 68 da 311,7 y se pasa), y pasa de sobra el piso del nivel de abajo (`display`, 37), así que la escala sigue estrictamente creciente en los cuatro anchos.',
  },
  {
    token: '--breakpoint-angosto',
    sprint: 'TEXTO-3',
    motivo:
      'El CUARTO breakpoint, 375 px, y el primero que el lane usa hacia ABAJO. [COMPO-1 le agregó un segundo consumidor: `max-angosto:text-display-xl-angosto`.] [PAPEL-2 le sacó el primero: la superficie del Hero se mudó a `max-chico:`, que es el único corte que cubre 375, y acá queda sólo el del registro 2 — su banda medida es 320–374 y no la del papel. Ya no es la única variante `max-` del lane: son dos.] [derivado] El valor no se eligió: es el MISMO número que `--fluido-piso`, el piso de la banda fluida, o sea el ancho más angosto al que se midió el sistema tipográfico — «abajo de angosto» quiere decir «más angosto que cualquier cosa medida». Nace con UN consumidor escrito y acotado: `max-angosto:bg-fondo` en el Hero, que a 320 tapa la escena porque ahí el bloque de texto (51 % del viewport) y la masa del logo (37 %) suman más de 100 y no existe posición limpia; TEXTO-1 barrió 16 configuraciones de tipografía y TEXTO-2 lo empeoró de 31,6 % a 46,7 %. Se declara aparte de `--fluido-piso` y no como `var()` porque una media query NO puede leer una custom property: el literal es obligatorio, y `tokens.invariant` §7b afirma que los dos dicen 375.',
  },
  {
    token: '--text-display-xl-angosto',
    sprint: 'COMPO-1',
    motivo:
      'NO es un nivel nuevo de la escala —no entra en `NIVELES` y `s3-tipografia` §6 no lo mira—: es el DÉCIMO NIVEL resuelto en el único ancho donde no entra. [derivado] El titular pasa a tres filas abajo de 1025 y la fila 3 («LAS 24 HS», el registro 2) tiene que entrar en UN renglón de 320 a 1024. A 320 la caja del titular mide 256 px y el nivel resuelve 67, o sea 306,79 px de tinta con el avance del `.woff2` itálico: se pasa por 50,79. El techo es 256 / 4,58406 em = 55,85, así que 55 entra con 4,16 px y 56 se pasa por 0,42. ⚠️ Y hace falta un token porque BAJAR EL PISO DEL `clamp()` NO ARREGLA 320, medido: ahí el nivel no está gobernado por su piso sino por su recta, que vale 65,09 px —9,18 por arriba de lo que la caja admite— y el piso sólo manda cuando la recta queda por debajo de él. Mover la recta sería mover el ancla de 375 o la de 1440, las dos fuera de alcance. La banda es exactamente 320–374 porque de 371,13 px de ventana para arriba el nivel ya entra solo, y `--breakpoint-angosto` (375) es el corte declarado más chico y contiene entero el tramo que falla. `hero.invariant` §14a corre las tres cuentas contra el binario.',
  },
  {
    token: '--breakpoint-chico',
    sprint: 'PAPEL-2',
    motivo:
      'El QUINTO breakpoint, 390 px, y el segundo que el lane usa hacia ABAJO. [derivado] Nace porque el §1 pide que el papel opaco del Hero cubra 375 y NO cubra 390, y `max-angosto:` emite `@media (width < 375px)`, que deja 375 afuera. NO se hizo subiéndole el número a `--breakpoint-angosto`, y el motivo está medido: ese token tiene DOS consumidores con bandas distintas —`max-angosto:bg-fondo` (la superficie) y `max-angosto:text-display-xl-angosto` (el registro 2 a 55 px)— y la banda del segundo es exactamente 320–374, porque de 371,13 px de ventana para arriba el décimo nivel ya entra solo en la caja del titular. Moverlo a 390 habría achicado el registro 2 de 375 un 18 % sin una medición que lo pida, habría dejado al token contradiciendo su propia derivación escrita y habría desincronizado `tokens.invariant` §7b, que ata ese 375 al de `--fluido-piso`. El 390 sale del mismo lugar que salió el 375: es el primer ancho del set donde la regla deja de aplicar — tinta del titular sobre la masa del logo, medida en COMPO-1 §9.1: 43,76 % a 320 y 40,59 % a 375 contra 2,71 % a 390. ⚠️ Es un PROXY declarado: lo que hunde a 375 es su ALTO y no su ancho (el set aparea 320×568 y 375×667 contra 390×844, o sea que la banda son los dos viewports CORTOS), y una media query de ancho no puede preguntar eso. Es el único breakpoint del lane con consumidores en los DOS sentidos: `max-chico:` pinta el papel, achica el pie y baja el registro 1; `chico:` esconde la marca del Hero y la pastilla de navegación.',
  },
  {
    token: '--text-display-r1-papel',
    sprint: 'PAPEL-2',
    motivo:
      'NO es un nivel nuevo de la escala —no entra en `NIVELES` y `s3-tipografia` §6 no lo mira—: es el registro 1 del titular IGUALADO al registro 2, y no lleva un número sino una RAZÓN. [derivado] El §3 pide que la tinta del más ancho de «TU NEGOCIO» / «VENDIENDO» iguale la de «LAS 24 HS» con 2 px de tolerancia. Dos cadenas igualan su tinta cuando `tamaño₁ × avance₁ = tamaño₃ × avance₃`, así que el factor es `avance₃ / avance₁` y NO depende del ancho de pantalla: depende sólo de las dos caras. Medido contra los binarios que se sirven: «TU NEGOCIO» 4,12429 em (Archivo wdth 62 · wght 700 con `--tracking-display` y el factor del eje de peso de `hero/composicion.ts`), «VENDIENDO» 3,93223 em, «LAS 24 HS» 4,57900 em (Chivo Light itálica con `--tracking-titulo`). 4,57900 / 4,12429 = 1,11025. Por eso es `calc(var(--text-fluido-display-xl) * 1,11025)` y no un valor: la igualdad se cumple en TODO el tramo 375–389 y no sólo en los anchos medidos. Da 74,39 px a 375, o sea 306,79 px de tinta contra los 306,79 de la fila 3 — desvío 0,0000 — y entra en la caja, cuyo techo es 75,41. `hero.invariant` §15a recalcula la razón contra los dos `.woff2` y afirma que el `calc()` dice ese número.',
  },
  {
    token: '--text-display-r1-papel-angosto',
    sprint: 'PAPEL-2',
    motivo:
      'El MISMO tamaño que `--text-display-r1-papel`, dicho para el otro régimen del registro 2. [derivado] Abajo de `--breakpoint-angosto` el registro 2 no se pinta con su `clamp()` sino con `--text-display-xl-angosto` (55 px), así que el registro 1 tiene que multiplicar a ÉSE: `calc(var(--text-display-xl-angosto) * 1,11025)` = 61,06 px a 320, o sea 251,85 px de tinta contra los 251,85 de la fila 3 — desvío 0,0000 — en una caja cuyo techo es 62,07. ⚠️ Hacen falta DOS tokens y no uno porque `calc()` no puede elegir cuál de los dos tokens del registro 2 manda: esa elección es una media query, y una media query no se escribe adentro de un `calc()`. El 1,11025 queda escrito dos veces, que es la misma forma que `--breakpoint-angosto` y `--fluido-piso` ya tienen —dos literales de UN hecho medido— y se ata igual: `hero.invariant` §15a afirma que los dos `calc()` dicen el mismo número y que ese número es la razón recalculada contra los binarios.',
  },
  {
    token: '--text-display-r1-portatil',
    sprint: 'COMPO-2',
    motivo:
      'NO es un nivel nuevo de la escala —no entra en `NIVELES` y `s3-tipografia` §6 no lo mira— y tampoco es una RAZÓN como los dos de PAPEL-2: son **DOS TECHOS medidos sobre el píxel** y la recta que los une. [medido] El §3 y el §4 del sprint piden que «TU NEGOCIO VENDIENDO» crezca en 768 y en 1024, con el mismo criterio dicho con dos palabras distintas —«lo más grande posible antes de tocar el logo» y «casi del ancho de LAS 24 HS»—: el mayor tamaño con el que la tinta del titular que cae sobre la masa negra de la escena no sube de lo que ya es hoy. Barrido en el navegador con `scripts-compo2/a-medir.ts`, una hoja `!important` por candidato sobre la MISMA página y la cifra del cruce de TAPADO-1: a 768, con el bloque devuelto a su posición de hoy, 66 px dan 3,07 %, **67 px dan 3,35 % — exactamente lo de hoy—** y 68 px dan 3,58 %; a 1024, **95 px dan 0,52 % contra los 0,51 % de hoy** y 96 px dan 0,58 %. ⚠️ El techo de 768 se midió CON el bloque en su lugar: la regla global del sprint (la bajada en un renglón) le saca 25,6 px al bloque y, como se apoya abajo, lo BAJA —a 768 eso mete el registro 2 adentro de la SEGUNDA masa de la escena (filas 800–838) y la superposición salta sola de 3,35 % a 8,53 %—, así que el Hero le devuelve ese renglón como margen en la banda `tablet` y el barrido corre sobre el bloque devuelto. ⚠ Es una RECTA y no dos valores fijos porque el set tiene 768 y 1024 y nada en el medio: dos valores fijos pondrían un salto de 28 px en un píxel que nadie midió (860) y la recta reparte el mismo error — a = (95 − 67) / (1024 − 768) = 0,109375 → 10,9375vw; b = 67 − 0,109375 × 768 = −17 px → −1,0625rem. ⚠ La banda es 768–1024 y ninguna punta se puede correr: abajo de 768 están 390 y 425 (el primero intocable por el §5, el segundo resuelto por posición en el §2) y de 1025 para arriba el registro 1 vuelve a ser UN renglón con las dos palabras inline, o sea otra composición. La clase lo dice con sus dos mitades —`tablet:` prende y `escritorio:` apaga—, que es la lección que COMPO-1 §6 dejó escrita midiendo 8,8 px de corrimiento en 1440 y 1920. El escalón que deja en 768 (44,75 → 67 px) cae en el MISMO píxel donde la composición ya conmuta: `tablet:` es donde la grilla de la caja del titular pasa de una columna a tres. `hero.invariant` §16c evalúa la recta en sus dos anclas y afirma las dos mitades de la clase.',
  },
]

/** Los tokens que declara el original de S0, leídos del archivo. */
export function tokensDeS0(): string[] {
  return declarados(readFileSync(ORIGINAL_DE_S0, 'utf8'))
}

/** Los tokens que declara el tema del repo, leídos del archivo. */
export function tokensDelRepo(): string[] {
  return declarados(readFileSync(TEMA_EN_EL_REPO, 'utf8'))
}

/**
 * La cardinalidad que el padrón implica. **No es un literal**: es
 * `|S0| + |AGREGADOS|`, porque los renombres no mueven la cuenta.
 */
export function cardinalidadEsperada(): number {
  return tokensDeS0().length + AGREGADOS.length
}

/** El texto con el que se publica la cuenta, para que el número no viaje solo. */
export function comoSeDeriva(): string {
  const s0 = tokensDeS0().length
  const agregados = AGREGADOS.map((a) => `${a.token} (${a.sprint})`).join(', ')
  return `${s0} de S0 + ${AGREGADOS.length} aprobado(s) después [${agregados}] = ${s0 + AGREGADOS.length}`
}
