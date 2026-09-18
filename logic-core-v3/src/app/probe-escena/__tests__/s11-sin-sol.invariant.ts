/**
 * COMPROBACIONES DE S11 · las dos cosas que este sprint decidió NO tener.
 *
 *     npx tsx src/app/probe-escena/__tests__/s11-sin-sol.invariant.ts
 *
 * Son las dos afirmaciones más frágiles del sprint, porque las dos son de
 * AUSENCIA — y una comprobación de ausencia contra una escena vacía es verdadera
 * por vacío: pasaría igual con el instrumento roto, y seguiría pasando el día que
 * alguien vuelva a poner lo que se sacó.
 *
 *   1. **El cuerpo del sol se fue.** Con un escáner del fuente y su control
 *      positivo, mismo criterio que `syntheticOccluder()` de S10.
 *   2. **Los haces no se construyeron**, y la tabla que sostiene esa decisión
 *      queda publicada para que sea revocable con datos y no haya que volver a
 *      medir.
 *
 * ⚠️ **Modo pulido sacó de §1 la comparación de oscuridad tinta-vs-papel en una
 * vista iluminada**: era composición.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { CELOSIA_SHAFT_ALPHA_FOR_5_PERCENT } from '@/app/v3/_lib/escena/probeCelosia'
import { check, report, section } from './harness'

// ── 1 · El disco se fue ─────────────────────────────────────────────────────

section('El disco se fue, y esto lo verifica sin quedar verde por vacío')

{
  const componentsDir = join(process.cwd(), 'src/app/v3/_lib/escena')

  /** Cuenta declaraciones de sprite en un fuente. */
  function spriteDeclarations(source: string): number {
    return (source.match(/<sprite[\s>]/g) ?? []).length
  }

  /**
   * ⚠️ **CONTROL POSITIVO.** Primero hay que comprobar que el escáner ENCUENTRE un
   * cuerpo de sol puesto a mano. Sin esto, el chequeo de abajo pasaría con el
   * escáner roto y seguiría pasando el día que alguien vuelva a meter un sprite.
   */
  const fixture = '<sprite ref={sunRef} scale={[32, 32, 1]}>\n  <spriteMaterial />\n</sprite>'
  check(
    'control positivo — el escáner encuentra un cuerpo de sol puesto a mano',
    spriteDeclarations(fixture) === 1,
    'mismo criterio que `syntheticOccluder()` de S10'
  )

  const files = readdirSync(componentsDir).filter((name) => name.endsWith('.tsx'))
  const offenders = files.filter(
    (name) => spriteDeclarations(readFileSync(join(componentsDir, name), 'utf8')) > 0
  )
  check(
    'y en la escena real no queda ninguno',
    offenders.length === 0,
    `${files.length} componentes revisados · ${offenders.join(', ') || 'ninguno declara <sprite>'}`
  )
  check(
    'los tres archivos del sol ya no existen',
    !readdirSync(componentsDir).some((name) =>
      ['SunBody.tsx', 'SunWashout.tsx', 'probeSun.ts'].includes(name)
    ),
    'el cuerpo, el washout y sus números'
  )
}

// ── 2 · Los haces que no se construyeron ────────────────────────────────────

section('Los haces: la tabla queda para que la decisión sea revocable')

/**
 * ⚠️ **UNA PREMISA DEL SPRINT QUE LA MEDICIÓN CORRIGIÓ.**
 *
 * El sprint decía que un haz claro solo se lee contra fondo oscuro y que "en
 * Hero, Números y Trabajos el cuadro es claro y un haz claro es invisible". Con
 * el cielo tapado el fondo aéreo baja lo suficiente en las SEIS poses, así que el
 * enunciado es demasiado general. Lo que sí sigue siendo verdad —y es la frase
 * que corresponde— es que **sobre el PISO no hay margen**, y el piso es el 51% al
 * 73% del cuadro en las poses claras.
 *
 * Los haces igual no se construyeron, por tres razones que no son estéticas y
 * están en `probeCelosia.ts`. La tabla queda acá para que la decisión se pueda
 * revocar con datos.
 */
check(
  'la tabla de los seis fondos aéreos está publicada y ordenada de claro a oscuro',
  CELOSIA_SHAFT_ALPHA_FOR_5_PERCENT.length === 6 &&
    CELOSIA_SHAFT_ALPHA_FOR_5_PERCENT.every((row, i, list) => i === 0 || row[1] < list[i - 1][1]),
  CELOSIA_SHAFT_ALPHA_FOR_5_PERCENT.map(([name, bg, alpha]) => `${name} ${bg}/${alpha}`).join(' · ')
)
check(
  'y contradice la premisa del sprint: hay margen en las SEIS, no solo en las oscuras',
  CELOSIA_SHAFT_ALPHA_FOR_5_PERCENT.every(([, bg]) => 255 - bg > 40),
  'sobre el fondo aéreo de hero, números y trabajos un haz claro NO sería invisible — sobre el PISO sí'
)

report('s11 · lo que no se construyó')
