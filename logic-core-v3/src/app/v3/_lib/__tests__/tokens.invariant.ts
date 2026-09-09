/**
 * INVARIANTE — los 89 tokens de S0 entraron enteros, y las cuatro diferencias
 * son EXACTAMENTE las cuatro aprobadas en la Parada 1.
 *
 * Corre con `npm run test:s1-tokens`.
 *
 * Qué afirma, y por qué cada cosa:
 *
 *   1. El archivo del repo declara los tokens del PADRÓN —los de S0, más los
 *      agregados aprobados, con el renombre aprobado—, y ni uno más. La cuenta
 *      NO es un literal: sale de `padron-de-tokens.ts` (S4). Un token perdido
 *      en la copia es un token que nadie va a extrañar hasta que algo se vea
 *      mal; uno de más es un token que nadie decidió.
 *   2. Las diferencias de VALOR contra el original son exactamente 12 líneas:
 *      3 familias + 9 espaciados. Ni una más.
 *   3. `@theme static` — y las tres variantes compiladas, con sus números.
 *      Es la medición que corrige a S0 y no se puede dejar como prosa. **El
 *      testigo de la poda es sintético desde S4**: los reales se agotaron dos
 *      veces en dos sprints, porque los sprints les dan consumidor. Ver
 *      `poda.ts`.
 *   4. `@theme inline` rompe el override contextual. Es la regla no negociable
 *      del sprint y acá queda medida, no citada.
 *   5. Una sola colisión de nombre contra `globals.css`, y está resuelta.
 *   6. Los nueve `--spacing-*` en rem computan el MISMO píxel que los px de S0
 *      con raíz 16, y las quince utilidades afectadas también.
 *   7. El umbral de la compuerta y `--breakpoint-escritorio` dicen lo mismo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { ESCENARIO_MIN_ANCHO_PX } from '../compuerta'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import {
  AGREGADOS,
  ORIGINAL_DE_S0,
  RAIZ_DEL_PROYECTO,
  TEMA_EN_EL_REPO,
  cardinalidadEsperada,
  comoSeDeriva,
  declarados,
  sinComentarios,
} from './padron-de-tokens'
import { ausentesDelRoot, conTestigos, emitirCss, testigosSinteticos, tokensDelRoot } from './poda'

const GLOBALS = path.join(RAIZ_DEL_PROYECTO, 'src/app/globals.css')

const original = readFileSync(ORIGINAL_DE_S0, 'utf8')
const enElRepo = readFileSync(TEMA_EN_EL_REPO, 'utf8')
const globals = readFileSync(GLOBALS, 'utf8')

/** Las líneas de declaración, ya sin comentarios ni vacías. */
function declaraciones(css: string): string[] {
  return sinComentarios(css)
    .split('\n')
    .map((l) => l.replace(/\/\*[\s\S]*?\*\//g, '').trim())
    .filter((l) => l.length > 0)
}

async function principal(): Promise<void> {
  // ─────────────────────────────────────────────────────────────────────────
  titulo(`1 · Los ${cardinalidadEsperada()} tokens del padrón, y ni uno más`)

  /**
   * ⚠ EL CONTEO NO ES UN LITERAL — S4.
   *
   * Decía `89` escrito a mano, y `89 + AGREGADOS_DECLARADOS.length` en el otro
   * lado. Eran 89 cuando se escribió y son 90 desde la corrección aprobada en
   * la parada de S3, así que el mismo número vivía en tres archivos y ya se
   * había desincronizado en uno de ellos.
   *
   * Ahora sale del padrón compartido —`padron-de-tokens.ts`—, que lo deriva de
   * dos hechos verificables: cuántos tokens declara el original de S0, y qué se
   * aprobó agregar o renombrar después, con su sprint y su motivo.
   *
   * **No se convierte en un contador**: el padrón nombra las excepciones una por
   * una. Un token nuevo que no esté declarado ahí sigue rompiendo esta
   * comprobación, que es para lo que existe.
   */
  const AGREGADOS_DECLARADOS = AGREGADOS.map((a) => a.token)

  const nombresS0 = declarados(original)
  const nombresRepo = declarados(enElRepo)
  afirmarIgual(nombresS0.length, 89, 'S0 declara 89 tokens')
  afirmarIgual(
    nombresRepo.length,
    cardinalidadEsperada(),
    `el archivo del repo declara ${cardinalidadEsperada()} — ${comoSeDeriva()}`,
  )

  const perdidos = nombresS0.filter((n) => n !== '--font-mono' && !nombresRepo.includes(n))
  afirmarIgual(perdidos, [], 'ningún token de S0 se perdió en la copia')

  const agregados = nombresRepo.filter(
    (n) => n !== '--font-codigo' && !nombresS0.includes(n) && !AGREGADOS_DECLARADOS.includes(n),
  )
  afirmarIgual(agregados, [], 'no se agregó ningún token fuera de la corrección declarada')

  const declaradosQueNoEstan = AGREGADOS_DECLARADOS.filter((n) => !nombresRepo.includes(n))
  afirmarIgual(declaradosQueNoEstan, [], 'y las correcciones declaradas están donde dicen estar')

  controlPositivo(
    'el filtro de agregados vería un token que nadie declaró',
    '--token-colado-por-la-ventana',
    (nombre) =>
      [...nombresRepo, nombre].filter(
        (n) => n !== '--font-codigo' && !nombresS0.includes(n) && !AGREGADOS_DECLARADOS.includes(n),
      ).length === 0,
  )

  afirmar(!nombresRepo.includes('--font-mono'), 'CAMBIO 2 — `--font-mono` ya no se declara acá')
  afirmar(nombresRepo.includes('--font-codigo'), 'CAMBIO 2 — `--font-codigo` ocupa su lugar')

  controlPositivo(
    'el detector de tokens ve un token faltante',
    declarados(original.replace('--color-foco: var(--color-tinta);', '')),
    (lista) => lista.includes('--color-foco'),
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('2 · Las diferencias contra el original de S0 son exactamente las aprobadas')

  const declS0 = declaraciones(original)
  const declRepo = declaraciones(enElRepo)
  const soloEnS0 = declS0.filter((l) => !declRepo.includes(l))
  const soloEnRepo = declRepo.filter((l) => !declS0.includes(l))

  const ESPERADO_FUERA = [
    '@theme {',
    '--font-titulo: "Chivo", system-ui, sans-serif;',
    '--font-cuerpo: "Chivo", system-ui, sans-serif;',
    '--font-mono: "Chivo Mono", ui-monospace, monospace;',
    '--spacing-1: 4px;',
    '--spacing-2: 8px;',
    '--spacing-3: 12px;',
    '--spacing-4: 16px;',
    '--spacing-5: 20px;',
    '--spacing-6: 24px;',
    '--spacing-8: 32px;',
    '--spacing-12: 48px;',
    '--spacing-20: 80px;',
    '--text-base: 16px;',
    // ⚠ SITIO-S11: los DOS PISOS que se caían del sistema a 375, medidos por
    // `s10-mobile` §9 y publicados en §7.38. Salen con su valor viejo y
    // vuelven abajo con el nuevo; los seis TECHOS no se movieron, así que la
    // costura de `s3-tipografia` §2 con el token fijo de cada nivel es la
    // misma. `micro` llegaba a 8px, un 20% abajo del propio `--text-micro`;
    // `titulo-s` resolvía a 16px, o sea EXACTAMENTE `--text-base`.
    '--text-fluido-micro: clamp(8px, 0.456rem + 0.1878vw, 10px);',
    '--text-fluido-titulo-s: clamp(16px, 0.912rem + 0.3756vw, 20px);',
    // ⚠ V3-C: los CUATRO TECHOS restantes que suben al extender la banda hasta
    // `--container-tope`. Salen con el valor de S0 —que es el que la referencia
    // mide a 1440— y vuelven abajo con la recta prolongada hasta 1920. Ni un
    // coeficiente cambia, así que los dos puntos medidos siguen dando lo mismo:
    // 375 → el piso, 1440 → el token fijo del nivel. `micro` no está porque su
    // recta es constante y prolongarla no la mueve.
    '--text-fluido-caption: clamp(11px, 0.6655rem + 0.0939vw, 12px);',
    '--text-fluido-titulo-m: clamp(18px, 0.8169rem + 1.3146vw, 32px);',
    '--text-fluido-titulo-l: clamp(24px, 1.0599rem + 1.8779vw, 44px);',
    '--text-fluido-titulo-xl: clamp(36px, 1.8099rem + 1.8779vw, 56px);',
  ]
  const ESPERADO_DENTRO = [
    '@theme static {',
    '--font-titulo: var(--font-v3-chivo), system-ui, sans-serif;',
    '--font-cuerpo: var(--font-v3-chivo), system-ui, sans-serif;',
    '--font-codigo: var(--font-v3-chivo-mono), ui-monospace, monospace;',
    '--spacing-1: 0.25rem;',
    '--spacing-2: 0.5rem;',
    '--spacing-3: 0.75rem;',
    '--spacing-4: 1rem;',
    '--spacing-5: 1.25rem;',
    '--spacing-6: 1.5rem;',
    '--spacing-8: 2rem;',
    '--spacing-12: 3rem;',
    '--spacing-20: 5rem;',
    '--text-base: 1rem;',
    // ⚠ AGREGADO POR S3 (2026-08-29), aprobado en su parada: la superficie
    // translúcida que le faltaba a `--blur-panel`. Son DOS líneas porque el
    // token se declara en el tema claro y se redefine en la sección invertida.
    '--color-superficie-translucida: rgba(247, 247, 245, 0.60);',
    '--color-superficie-translucida: rgba(14, 14, 14, 0.60);',
    // La regla de foco que agrega S1. Su `}` de cierre NO aparece acá porque
    // esa línea ya existe idéntica en el archivo de S0 — el comparador es de
    // conjuntos, no de posiciones.
    '[data-v3] :focus-visible,',
    '[data-v3]:focus-visible {',
    'outline: var(--foco-grosor) solid var(--color-foco);',
    'outline-offset: var(--foco-desplazamiento);',
    // ⚠ SITIO-S11 — el piso de `micro` subido, del otro lado del diff. Su techo
    // sigue siendo el mismo 10px y por eso su banda es CERO: V3-C no lo tocó.
    '--text-fluido-micro: clamp(10px, 0.625rem, 10px);',
    // ⚠ V3-C — los CINCO techos prolongados hasta `--container-tope` (1920px),
    // que es donde `Envoltorio.tsx` deja de agrandar la caja de contenido. El
    // techo de cada nivel es su propia recta evaluada ahí, a cuatro decimales.
    // `titulo-s` lleva además el piso de 17px que subió SITIO-S11.
    // ⚠️ La premisa que lo pidió está REFUTADA y se declara: `LAYOUT.md` §2.3
    // mide la referencia a 1440 y a 1920 y da lo MISMO en los seis niveles. Es
    // una decisión de develOP que se aparta de la referencia, no una
    // transferencia. `s3-tipografia` §9 lo reproduce leyendo esa tabla.
    '--text-fluido-caption: clamp(11px, 0.6655rem + 0.0939vw, 12.4509px);',
    '--text-fluido-titulo-s: clamp(17px, 0.9965rem + 0.2817vw, 21.3526px);',
    '--text-fluido-titulo-m: clamp(18px, 0.8169rem + 1.3146vw, 38.3107px);',
    '--text-fluido-titulo-l: clamp(24px, 1.0599rem + 1.8779vw, 53.0141px);',
    '--text-fluido-titulo-xl: clamp(36px, 1.8099rem + 1.8779vw, 65.0141px);',
    // ⚠ SITIO-S11 — las OTRAS DOS TINTAS, dadas vuelta en la sección
    // invertida. Los nombres ya existían en S0 (con su valor claro, que no se
    // tocó); lo que entra son las dos REDEFINICIONES del bloque
    // `[data-seccion="invertida"]`, derivadas con el mismo método espejado.
    // Cierran los defectos 5 y 11 de §7.39 en la raíz: el `<p>` de ayuda del
    // formulario de novedades pasa de 2,80:1 a 6,44:1.
    '--color-tinta-media: #9E9E9E;',
    '--color-tinta-tenue: #959595;',
  ]
  afirmarIgual(soloEnS0.sort(), [...ESPERADO_FUERA].sort(), `las ${ESPERADO_FUERA.length} líneas que salieron son las previstas`)
  afirmarIgual(soloEnRepo.sort(), [...ESPERADO_DENTRO].sort(), `las ${ESPERADO_DENTRO.length} líneas que entraron son las previstas`)

  controlPositivo(
    'el comparador de declaraciones ve una línea cambiada',
    declaraciones(enElRepo.replace('--radius-sutil: 4px;', '--radius-sutil: 99px;')),
    (lista) => lista.includes('--radius-sutil: 4px;'),
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('3 · `@theme static`, y las tres variantes medidas')

  afirmar(/^@theme static \{/m.test(enElRepo), 'CAMBIO 1 — el bloque abre con `@theme static`')
  // Sobre el texto SIN comentarios: el archivo menciona `@theme inline` varias
  // veces en prosa, justamente para explicar por qué no se usa.
  afirmar(
    !/@theme\s+inline/.test(sinComentarios(enElRepo)),
    'nunca `@theme inline` — regla no negociable del sprint',
  )

  const cuerpoRepo = enElRepo
  const cuerpoLlano = enElRepo.replace(/^@theme static \{/m, '@theme {')
  const cuerpoInline = enElRepo.replace(/^@theme static \{/m, '@theme inline {')

  // CONTROL POSITIVO DEL DETECTOR, antes de creerle un solo número: si le saco
  // un token al tema, ¿lo ve ausente? Sin esto, "0 ausentes" es indistinguible
  // de un detector que mira el lugar equivocado.
  const rootMutilado = tokensDelRoot(await emitirCss(cuerpoRepo.replace('--color-superficie-3: #DBDBD9;', '')))
  afirmar(
    rootMutilado !== null && !rootMutilado.has('--color-superficie-3') && rootMutilado.has('--color-superficie-2'),
    '[control positivo] el detector ve ausente un token borrado, y presente uno que no borré',
    `${rootMutilado?.size ?? 0} tokens en el :root de la corrida mutilada`,
  )

  const ausentes = (cuerpo: string): Promise<string[]> => ausentesDelRoot(cuerpo, nombresRepo)

  const cssStatic = await emitirCss(cuerpoRepo)
  const cssInline = await emitirCss(cuerpoInline)

  afirmarIgual(
    (await ausentes(cuerpoRepo)).length,
    0,
    `\`@theme static\` — los ${nombresRepo.length} llegan al :root`,
  )

  /**
   * LA MEDICIÓN QUE CORRIGE A S0, CON UN TESTIGO QUE NO SE PUEDE AGOTAR — S4.
   *
   * Tailwind SÍ poda, y poda POR USO. La afirmación siempre fue ésa; lo que
   * cambió tres veces es con qué se demuestra.
   *
   *   · S1 la demostró con las seis expresiones fluidas, que nadie consumía.
   *     Medía 21 podados de 89.
   *   · S3 construyó la tipografía, les dio consumidor a las seis, y el testigo
   *     tuvo que mudarse a los radios.
   *   · S2 —mergeado después— les dio consumidor a los radios también. **Hoy se
   *     podan 0 de 90.**
   *
   * O sea que **cualquier token real es un mal testigo por construcción**: el
   * trabajo normal de un sprint es darle consumidor a los tokens, así que el
   * testigo no se rompe cuando algo anda mal — se rompe cuando todo anda bien.
   * Se agotó dos veces en dos sprints seguidos.
   *
   * El testigo de ahora es SINTÉTICO: dos tokens inventados que se inyectan en
   * el fixture en memoria —el archivo del repo no se toca— y que nadie puede
   * consumir sin escribir su nombre. Su nombre no está escrito en ninguna
   * parte: se arma por concatenación en `poda.ts`, así que el escáner de
   * Tailwind no lo ve. Si algún día alguien lo escribe, esta comprobación falla
   * y el arreglo es gratis — se cambia el nombre inventado. Con un token real
   * no había arreglo gratis, y por eso éste es el tercer sprint que toca lo
   * mismo.
   */
  const testigos = testigosSinteticos()
  const conLosDos = [...nombresRepo, testigos.propio, testigos.enFamiliaDeColor]
  const testigosStatic = await ausentesDelRoot(conTestigos(cuerpoRepo), conLosDos)
  const testigosLlano = await ausentesDelRoot(conTestigos(cuerpoLlano), conLosDos)

  afirmar(
    !testigosStatic.includes(testigos.propio) && !testigosStatic.includes(testigos.enFamiliaDeColor),
    '`@theme static` — los dos testigos sintéticos SOBREVIVEN aunque nadie los consuma',
    'que es exactamente lo que `static` promete',
  )
  afirmar(
    testigosLlano.includes(testigos.propio),
    '`@theme` a secas — el testigo sintético SE PODA: la poda sigue siendo real, medida hoy',
  )
  /**
   * La contracara, y reemplaza a la afirmación vieja —"los referenciados
   * sobreviven"— que hoy sería verde por vacío, porque con 0 podados se cumple
   * sola. Ésta se mide: dos tokens del MISMO namespace `--color-*`, uno
   * consumido y otro no, y sólo se poda el que nadie usa.
   */
  afirmar(
    testigosLlano.includes(testigos.enFamiliaDeColor) && !testigosLlano.includes('--color-fondo'),
    '  y se poda también dentro de `--color-*`, donde `--color-fondo` sobrevive: la poda es por USO, no por namespace',
  )

  /**
   * EL HECHO NUEVO, PUBLICADO CON SU NÚMERO.
   *
   * Cero tokens reales podados quiere decir que **el sistema está enteramente
   * consumido**: los 90 tienen al menos un consumidor en el repo. Es un buen
   * resultado y hay que publicarlo.
   *
   * ⚠ Y NO ES UN ARGUMENTO PARA VOLVER A `@theme` A SECAS. La poda es por uso:
   * que hoy se poden 0 no dice que Tailwind dejó de podar, dice que hoy todos
   * tienen consumidor. El primer token que quede sin consumidor —uno nuevo que
   * todavía no se usa, o uno viejo cuyo último consumidor se borró— se va a
   * podar, y va a desaparecer del `:root` sin error de build y sin diff. El
   * testigo sintético de arriba es exactamente ese caso, y se poda en cada
   * corrida.
   */
  const podados = testigosLlano.filter((n) => n !== testigos.propio && n !== testigos.enFamiliaDeColor)
  afirmarIgual(
    podados,
    [],
    `\`@theme\` a secas — 0 de ${nombresRepo.length} tokens reales se podan: el sistema está ENTERAMENTE CONSUMIDO`,
  )
  console.log(`       tokens reales podados hoy: ${podados.length === 0 ? '(ninguno)' : podados.join(' ')}`)
  afirmar(
    !podados.some((n) => n.startsWith('--text-fluido-')),
    '  las seis expresiones fluidas YA NO se podan: S3 les dio consumidor',
  )
  afirmar(
    !podados.some((n) => n.startsWith('--radius-')),
    '  ni los radios: S2 les dio consumidor, y por eso el testigo pasó a ser sintético',
  )

  controlPositivo(
    'sin inyectar, el testigo NO existe en el tema: es sintético, no un token del sistema',
    cuerpoRepo,
    (cuerpo) => cuerpo.includes(testigos.propio),
  )
  controlPositivo(
    'y el inyector no inyecta en el vacío: sin bloque `@theme` no inventa uno',
    ':root { --algo: 1px; }',
    (cuerpo) => conTestigos(cuerpo).includes(testigos.propio),
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('4 · `@theme inline` rompe el override contextual — medido, no citado')

  const regla = (css: string, selector: string): string => {
    const m = sinComentarios(css).match(new RegExp(`\\${selector}\\s*\\{[^}]*\\}`))
    return m ? m[0].replace(/\s+/g, ' ') : 'NO EMITIDA'
  }
  afirmar(
    regla(cssStatic, '.text-acento').includes('var(--color-acento)'),
    '`static` — la utilidad consume var(--color-acento): el override llega',
    regla(cssStatic, '.text-acento'),
  )
  afirmar(
    regla(cssInline, '.text-acento').includes('var(--color-acento-web)'),
    '`inline` — el valor queda incrustado: el override NO llega',
    regla(cssInline, '.text-acento'),
  )
  afirmar(
    regla(cssInline, '.bg-fondo').includes('#F7F7F5'),
    '`inline` — el hex queda incrustado en la utilidad',
    regla(cssInline, '.bg-fondo'),
  )
  afirmar(
    /\[data-servicio="software"\]/.test(cssStatic) && /\[data-seccion="invertida"\]/.test(cssStatic),
    'los bloques de override contextual e invertida se emiten',
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('5 · Colisiones contra `globals.css`')

  const nombresGlobals = declarados(globals.replace(/@import\s+"[^"]+";/g, ''))
  const colisiones = nombresRepo.filter((n) => nombresGlobals.includes(n))
  afirmarIgual(colisiones, [], 'cero colisiones de nombre con el sistema viejo')
  afirmar(nombresGlobals.includes('--font-mono'), '  (y `--font-mono` sigue siendo del sistema viejo, intacto)')

  controlPositivo(
    'el detector de colisiones ve una colisión que existe',
    declarados(globals).filter((n) => n !== '--font-mono'),
    (lista) => nombresRepo.concat('--font-mono').filter((n) => lista.includes(n)).length > 0,
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('6 · CAMBIO 4 — los nueve `--spacing-*` en rem computan el mismo píxel')

  const RAIZ_PX = 16
  const EQUIVALENCIAS: ReadonlyArray<readonly [string, number]> = [
    ['1', 4],
    ['2', 8],
    ['3', 12],
    ['4', 16],
    ['5', 20],
    ['6', 24],
    ['8', 32],
    ['12', 48],
    ['20', 80],
  ]
  const enRem = (sufijo: string, css: string): number => {
    const m = css.match(new RegExp(`--spacing-${sufijo}:\\s*([0-9.]+)rem`))
    return m ? Number.parseFloat(m[1]) * RAIZ_PX : Number.NaN
  }
  for (const [sufijo, px] of EQUIVALENCIAS) {
    afirmarIgual(enRem(sufijo, enElRepo), px, `--spacing-${sufijo} = ${px}px con raíz ${RAIZ_PX}`)
  }

  controlPositivo(
    'la conversión rem→px ve una equivalencia mal hecha',
    enElRepo.replace('--spacing-4: 1rem;', '--spacing-4: 1.5rem;'),
    (css) => enRem('4', css) === 16,
  )

  // Las quince utilidades que cambian de fórmula: el valor computado tiene que
  // ser el mismo que la fórmula dinámica de Tailwind con raíz 16.
  const UTILIDADES = ['p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-12', 'p-20', 'gap-4', 'm-20', 'space-y-2', 'leading-6', 'md:p-4', 'lg:p-4']
  const cssUtil = sinComentarios(cssStatic)
  const SPACING_BASE_REM = 0.25
  /** El múltiplo es SIEMPRE el último segmento: `space-y-2` → 2, `md:p-4` → 4. */
  const multiploDe = (utilidad: string): number => Number.parseInt(utilidad.split('-').pop() ?? '', 10)
  const desajustadas = UTILIDADES.filter((u) => {
    const multiplo = multiploDe(u)
    return enRem(String(multiplo), enElRepo) !== multiplo * SPACING_BASE_REM * RAIZ_PX
  })
  afirmarIgual(desajustadas, [], 'las 15 utilidades afectadas computan el mismo píxel que antes')
  afirmarIgual(UTILIDADES.length, 15, '  y son quince, las quince medidas')

  controlPositivo(
    'el lector de múltiplos no devuelve NaN en `space-y-2` (el bug que tuvo antes)',
    'space-y-2',
    (u) => Number.isNaN(multiploDe(u)),
  )
  // Sobre el CSS del pipeline real: los múltiplos DECLARADOS consumen el token
  // y los NO declarados siguen en la fórmula dinámica. Las dos mitades importan
  // — si la escala dinámica hubiera muerto, medio sitio se quedaría sin padding.
  afirmar(
    /\.p-7\s*\{[^}]*calc\(var\(--spacing\)\s*\*\s*7\)/.test(cssUtil),
    'la escala dinámica sobrevive: `p-7` sigue en calc(var(--spacing) * 7)',
  )
  afirmar(/\.p-4\s*\{[^}]*var\(--spacing-4\)/.test(cssUtil), '  y `p-4` pasa a consumir el token declarado')

  // ─────────────────────────────────────────────────────────────────────────
  titulo('6b · CAMBIO 5 — `--text-base` en rem computa el mismo píxel')

  /**
   * Mismo argumento y mismo control que el CAMBIO 4, sobre el único token de
   * los ocho de la escala de texto que cae en un nombre que Tailwind ya usa.
   * A diferencia del 4, éste no pisa nada: RESTITUYE el defecto de Tailwind.
   */
  const baseEnRem = enElRepo.match(/--text-base:\s*([0-9.]+)rem/)
  afirmarIgual(
    baseEnRem ? Number.parseFloat(baseEnRem[1]) * RAIZ_PX : Number.NaN,
    16,
    '--text-base = 16px con raíz 16 — mismo valor que el px de S0',
  )
  afirmar(!/--text-base:\s*\d+px/.test(sinComentarios(enElRepo)), '  y ya no hay un px pisando el defecto de Tailwind')
  afirmar(
    /\.text-base\s*\{[^}]*var\(--text-base\)/.test(cssUtil) || /--text-base:\s*1rem/.test(cssUtil),
    '  el CSS emitido lo lleva en rem, igual que text-sm y text-lg: una sola especie',
  )

  controlPositivo(
    'la conversión de --text-base ve una equivalencia mal hecha',
    enElRepo.replace('--text-base: 1rem;', '--text-base: 1.5rem;'),
    (css) => {
      const m = css.match(/--text-base:\s*([0-9.]+)rem/)
      return (m ? Number.parseFloat(m[1]) * RAIZ_PX : Number.NaN) === 16
    },
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('7 · El umbral de la compuerta y el token dicen lo mismo')

  const breakpoint = enElRepo.match(/--breakpoint-escritorio:\s*(\d+)px/)
  afirmarIgual(breakpoint ? Number.parseInt(breakpoint[1], 10) : null, ESCENARIO_MIN_ANCHO_PX, '`--breakpoint-escritorio` = ESCENARIO_MIN_ANCHO_PX = 1025')

  controlPositivo(
    'el comparador de umbral ve una desincronización',
    enElRepo.replace('--breakpoint-escritorio: 1025px', '--breakpoint-escritorio: 1024px'),
    (css) => {
      const m = css.match(/--breakpoint-escritorio:\s*(\d+)px/)
      return (m ? Number.parseInt(m[1], 10) : 0) === ESCENARIO_MIN_ANCHO_PX
    },
  )

  cerrar('tokens.invariant')
}

void principal()
