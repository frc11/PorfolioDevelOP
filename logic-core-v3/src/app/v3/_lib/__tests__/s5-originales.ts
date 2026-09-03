/**
 * LOS TRES ORIGINALES DE LAS CAPTURAS DE TRABAJOS — fuera del lane, y por qué.
 *
 * ⚠ **Vive acá y no en `s5-codigo.invariant.ts` por la regla de las 300 líneas**,
 * que ese archivo cruzó al agregarse esta sección. El corte es por tema: acá está
 * TODO lo que hay que saber sobre los tres PNG y las comprobaciones que sostienen
 * la decisión de dejarlos afuera.
 *
 * ── El rojo que esto cerró, y la decisión que lo cerró de verdad ───────────
 *
 * V3-D dejó `banu.png`, `esquina.png` y `garage.png` adentro de
 * `_secciones/trabajos/` y no los declaró: `archivosSinRegistrar()` los veía y el
 * padrón no cerraba. V3-E los registró primero, y **el dueño del proyecto lo
 * revirtió en la parada**: son 3,83 MiB (2.782 + 1.075 + 68 KiB) que no se
 * sirven, contra los 284 KiB de las tres `.webp` que sí, y meterlos en el
 * historial no compra nada. **No se commitean y no forman parte del lane**:
 * `FUERA_DEL_LANE` lo declara con la razón, y quedan en disco hasta que el dueño
 * los borre.
 *
 * ── ⚠ LA PREMISA QUE NO SE VERIFICÓ, Y ES EL DATO ──────────────────────────
 *
 * La lectura natural de un binario adentro de `src/app/` es que se importa como
 * módulo: `import banu from './banu.png'`, que en Next da hash en el nombre y
 * `width`/`height` en tiempo de compilación. **No es lo que pasa.**
 * `medios.tsx` recibe la fuente como CADENA y se la pasa a `next/image`, y
 * `contenido.ts` la escribe como `/capturas/banu.webp` — o sea que la captura
 * entra por `public/`, como cualquier archivo estático.
 *
 * Los PNG, entonces, **no los importa ni los nombra nadie**. Un binario que
 * nadie importa adentro de `src/app/` es inerte: Next no lo copia, no lo hashea
 * y no lo emite. **Su peso servido es cero**, y eso es lo que se afirma abajo en
 * vez de escribirlo — es la razón de la exclusión, y tiene que seguir valiendo.
 *
 * Las comprobaciones sobreviven a que los archivos se borren: lo que se afirma es
 * sobre el CÓDIGO del lane (que no los nombra) y sobre las servidas (que
 * existen); el estado en disco de los tres se publica, no se afirma.
 */

import path from 'node:path'

import { afirmarIgual, controlPositivo } from './afirmar'
import { ARCHIVOS_DE_CODIGO, CAPTURAS_SERVIDAS, FUERA_DEL_LANE, existe, pesoDe } from './s5-archivos'
import { archivosQueNombran } from './s5-escaneo'

/** Los `.ts`/`.tsx` del padrón: los únicos que podrían nombrar un original. */
const FUENTES = ARCHIVOS_DE_CODIGO.filter((archivo) => /\.tsx?$/.test(archivo))

export function afirmarLosOriginales(): void {
  afirmarIgual(
    archivosQueNombran(FUERA_DEL_LANE, FUENTES),
    [],
    'los tres originales no los importa ni los nombra ningún archivo del lane: su peso SERVIDO es cero, y la exclusión sigue teniendo razón',
  )
  controlPositivo(
    'el detector de consumo ve un archivo que sí se nombra',
    ['x/contenido.ts'],
    (nombres: readonly string[]) => archivosQueNombran(nombres, FUENTES).length === 0,
  )
  afirmarIgual(
    CAPTURAS_SERVIDAS.filter((captura) => !existe(captura)),
    [],
    'y las tres capturas que SÍ se sirven existen en `public/` — una por original',
  )

  const kib = (archivo: string) => {
    const peso = pesoDe(archivo)
    return `${path.basename(archivo)} ${peso < 0 ? 'ya no está en disco' : `${(peso / 1024).toFixed(1)} KiB`}`
  }
  console.log(`  fuera del lane, sin commitear (el dueño los borra): ${FUERA_DEL_LANE.map(kib).join(' · ')}`)
  console.log(`  servidas: ${CAPTURAS_SERVIDAS.map(kib).join(' · ')}`)
}
