/**
 * §2 DE `s9-instrumentos.invariant.ts` — EL ACOPLAMIENTO DE TIPO HACIA
 * `/probe-escena`, CERRADO EN SITIO-S11 (§7.36).
 *
 * ── Por qué vive en su propio archivo, y no es una preferencia ─────────────
 *
 * Porque el invariante cruzó las 300 líneas del repo al reescribir esta sección,
 * y la reescritura no era opcional: §7.36 anticipó que resolver el acoplamiento
 * dejaría **tres afirmaciones verdaderas por vacío**, y arreglarlas bien pasó de
 * 11 afirmaciones con 1 control a 19 con 4. El corte es por TEMA y no por
 * tamaño: lo que queda del otro lado —el marcador de los controles, las rutas de
 * §7.13 y el `scroll-padding-top`— no comparte una sola constante con esto.
 *
 * ⚠ **El archivo ya medía 361 líneas antes de este sprint**, o sea que la regla
 * ya estaba rota y ningún instrumento la mide para `_lib/__tests__/` —`s8-montaje`
 * censa sólo lo que S8 escribió—. Queda dicho acá para que se lea: el split
 * cierra la violación, no la descubre.
 *
 * Exporta UNA función y no corre nada al importarse: quien la llama es el
 * invariante, en el orden en que sus secciones se leen.
 */

import path from 'node:path'

import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import {
  consumidoresDelPanel,
  contarLineas,
  declaraTipo,
  existe,
  importaDe,
  leer,
  reexportaTipoDesde,
  usosDeValor,
} from './s9-instrumentos'

export function afirmarElAcoplamientoCerrado(): void {
titulo('2 · EL ACOPLAMIENTO DE TIPO HACIA /probe-escena — CERRADO (SITIO-S11, §7.36)')

  /**
   * ⚠ **ESTA SECCIÓN CAMBIÓ DE SUJETO, Y ES LO PRIMERO QUE HAY QUE LEER DE ELLA.**
   *
   * Hasta SITIO-S10 afirmaba *«el acoplamiento EXISTE y es de TIPO»*: los tres
   * módulos de PRODUCCIÓN —`pistaDelHome.ts`, `OrbitRig.tsx` y `ProbeStage.tsx`—
   * traían `ChoreoEditor` de `@/app/probe-escena/_components/choreographyEditor`, y
   * lo que se medía era que eso costara **cero bytes**. §7.36 lo dejó declarado,
   * con su plan exacto y con su costo, y **SITIO-S11 lo ejecutó**: los tres tipos
   * —`ChoreoEditor`, `EditableKeyframe` y `KeyframeOrigin`— se mudaron a
   * `_lib/escena/choreographyEditorTypes.ts`, del lado de la escena, y el panel los
   * **re-exporta** para que ningún consumidor suyo cambie una línea.
   *
   * **Ahora afirma otra cosa: «el acoplamiento NO existe, el tipo vive del lado de
   * la escena y el panel lo re-exporta».** No es la misma propiedad con otro
   * número —es una propiedad más fuerte—, y por eso las afirmaciones se
   * reescribieron enteras en vez de ajustarles el especificador.
   *
   * 🔴 **POR QUÉ NO ALCANZABA CON DEJARLAS: TRES QUEDABAN VERDES POR VACÍO.** Las
   * viejas *«no importa un VALOR del panel»* seguirían pasando después del arreglo
   * —verdaderas porque el archivo ya no importa NADA del panel—, y una sección en
   * verde por vacío se lee exactamente igual que una que custodia algo. Es el modo
   * de falla que este repo lleva diez sprints cazando, y §7.36 lo anticipó con esas
   * palabras. La reescritura consiste en afirmar que **el panel no se nombra en
   * NINGÚN import**, de tipo ni de valor: una propiedad que el detector PUEDE
   * fallar, y cuyos dos controles positivos lo demuestran fallando —uno con el
   * import de valor y otro con el `import type`, que es justamente el que el
   * escáner viejo dejaba pasar a propósito—.
   *
   * **El costo real fue mayor que el publicado:** los tipos a mudar eran TRES y no
   * dos —`KeyframeOrigin` vivía del lado del panel y `EditableKeyframe` lo nombra,
   * así que dejarlo allá habría MOVIDO el acoplamiento en vez de cerrarlo—, y los
   * dos instrumentos reescritos son éste y `s8-escena.invariant.ts` §3. La cuenta
   * entera está en el docblock de `pistaDelHome.ts`.
   */

  const TRES = [
    'src/app/v3/_lib/escena/pistaDelHome.ts',
    'src/app/v3/_lib/escena/OrbitRig.tsx',
    'src/app/v3/_lib/escena/ProbeStage.tsx',
  ]
  const EDITOR = 'src/app/probe-escena/_components/choreographyEditor.ts'
  const TIPOS = 'src/app/v3/_lib/escena/choreographyEditorTypes.ts'
  /** Los tres que se mudaron. `KeyframeOrigin` entró porque `EditableKeyframe` lo nombra. */
  const MUDADOS = ['ChoreoEditor', 'EditableKeyframe', 'KeyframeOrigin']
  const IMPORT_DEL_LADO_DE_LA_ESCENA =
    /^import type \{ ChoreoEditor \} from '\.\/choreographyEditorTypes'$/m

  for (const archivo of TRES) {
    const fuente = leer(archivo)
    const quien = path.basename(archivo)
    afirmar(
      IMPORT_DEL_LADO_DE_LA_ESCENA.test(fuente),
      `${quien} trae \`ChoreoEditor\` del módulo de la ESCENA, con el especificador relativo`,
    )
    afirmar(
      !importaDe(fuente, 'probe-escena'),
      `y ${quien} no nombra el panel en NINGÚN import — tampoco con \`import type\``,
    )
    afirmarIgual(
      usosDeValor(fuente, 'ChoreoEditor'),
      [],
      `y ${quien} sigue sin usarlo como VALOR: el import se borra igual que antes`,
    )
  }
  /**
   * ⚠ **EL CONTROL QUE FALTABA, Y LO ENCONTRÓ SITIO-S12 AUDITANDO ESTA MISMA
   * SECCIÓN.** `usosDeValor` era el ÚNICO detector de este archivo sin control
   * positivo en ningún lugar del repo: las tres afirmaciones de «no se usa como
   * VALOR» pasaban por AUSENCIA, y un detector roto que devolviera siempre `[]`
   * las habría dejado verdes igual. Es el residuo del §2 viejo —cuando la
   * pregunta era «¿cuesta bytes?»— sobrevivido a la reescritura que decía
   * haberlo eliminado. La propiedad fuerte de arriba lo subsume, pero un
   * detector sin control no es una comprobación: es una frase.
   */
  controlPositivo(
    'el escáner de usos de VALOR no está ciego: ve una asignación del identificador',
    'const editor = ChoreoEditor',
    (fuente: string) => usosDeValor(fuente, 'ChoreoEditor').length === 0,
  )
  controlPositivo(
    '  y también lo ve en posición de constructor',
    'const editor = new ChoreoEditor()',
    (fuente: string) => usosDeValor(fuente, 'ChoreoEditor').length === 0,
  )
  controlPositivo(
    'el detector VE un `import type` del panel — que es exactamente el que el escáner de VALOR dejaba pasar',
    "import type { ChoreoEditor } from '@/app/probe-escena/_components/choreographyEditor'",
    (fuente: string) => !importaDe(fuente, 'probe-escena'),
  )
  controlPositivo(
    'y sigue viendo uno de VALOR',
    "import { createChoreoEditor } from '@/app/probe-escena/_components/choreographyEditor'",
    (fuente: string) => !importaDe(fuente, 'probe-escena'),
  )

  /**
   * LA DIRECCIÓN DE LA FLECHA, que es lo único que el arreglo cambió.
   *
   * El dueño del contrato es la ESCENA y el panel es el que lo consume. Las dos
   * mitades se afirman: que el módulo nuevo DECLARE los tres, y que el panel ya no
   * los declare — sin la segunda, un repo que declarara el tipo en los DOS lados
   * pasaría la primera con el acoplamiento entero del otro lado.
   */
  const FUENTE_TIPOS = leer(TIPOS)
  const FUENTE_EDITOR = leer(EDITOR)
  afirmarIgual(
    MUDADOS.filter((nombre) => !declaraTipo(FUENTE_TIPOS, nombre)),
    [],
    `los tres tipos se DECLARAN del lado de la escena, en \`${path.basename(TIPOS)}\``,
  )
  afirmarIgual(
    MUDADOS.filter((nombre) => declaraTipo(FUENTE_EDITOR, nombre)),
    [],
    'y el panel ya no declara ninguno: el contrato tiene UN dueño, no dos',
  )
  controlPositivo(
    'el detector de declaración no está ciego: ve la forma exacta que el panel tenía antes del arreglo',
    'export type ChoreoEditor = {\n  readonly variantId: string\n}\n',
    (fuente: string) => !declaraTipo(fuente, 'ChoreoEditor'),
  )
  afirmar(
    !importaDe(FUENTE_TIPOS, 'probe-escena'),
    'y el módulo de la escena no importa nada del panel: la flecha va del panel hacia producción y no al revés',
  )

  /**
   * LA RE-EXPORTACIÓN, y por qué se afirma que está VIVA y no sólo que existe.
   *
   * El arreglo se comprometió a que ningún consumidor de `/probe-escena` cambiara
   * una línea, y ese compromiso lo paga la re-exportación. Afirmar sólo que la
   * línea `export type { … }` está en el archivo dejaría pasar el caso en que nadie
   * la use — o sea una re-exportación decorativa, que el primero que limpie imports
   * borra sin enterarse de que era el puente. Por eso se cuentan también los
   * archivos del panel que siguen tirando de ella.
   */
  afirmarIgual(
    MUDADOS.filter((nombre) => !reexportaTipoDesde(FUENTE_EDITOR, nombre, 'choreographyEditorTypes')),
    [],
    'el panel RE-EXPORTA los tres desde el módulo de la escena — traídos de allá y vueltos a sacar',
  )
  controlPositivo(
    'el detector de re-exportación no confunde DECLARAR con RE-EXPORTAR: el estado viejo del panel no la cumple',
    'export type ChoreoEditor = {\n  readonly variantId: string\n}\nexport type { ChoreoEditor }\n',
    (fuente: string) => reexportaTipoDesde(fuente, 'ChoreoEditor', 'choreographyEditorTypes'),
  )
  const CONSUMIDORES = consumidoresDelPanel(MUDADOS)
  afirmar(
    CONSUMIDORES.length >= 7,
    `y la re-exportación está VIVA: ${CONSUMIDORES.length} archivos del panel siguen trayendo los tipos desde \`./choreographyEditor\``,
  )
  console.log(`  · ${CONSUMIDORES.map((ruta) => path.basename(ruta)).join(' · ')}`)

  /**
   * LO QUE NO CAMBIÓ, y se conserva porque sigue siendo verdad y sigue importando.
   *
   * ⚠ **El día que `/probe-escena` se borre, el build sigue sin quejarse.**
   * `next.config.ts` declara `typescript.ignoreBuildErrors`, así que la única
   * guardia de un import roto es `tsc --noEmit`, que hay que correr aparte. Lo que
   * el arreglo cambió no es esa guardia —que sigue sin existir— sino **qué
   * quedaría roto**: antes, tres módulos de producción; ahora, ninguno.
   */
  afirmar(
    leer('tsconfig.json').includes('"isolatedModules": true'),
    'con `isolatedModules` el borrado del `import type` no depende de mirar el módulo del otro lado',
  )
  afirmar(
    /ignoreBuildErrors:\s*true/.test(leer('next.config.ts')),
    'el build sigue ignorando los errores de tipo: un import roto sólo se ve corriendo `tsc --noEmit`',
  )
  afirmar(
    existe(EDITOR),
    `y el panel sigue existiendo (${contarLineas(FUENTE_EDITOR)} líneas): lo que se cerró es el vínculo, no el panel`,
  )
}
