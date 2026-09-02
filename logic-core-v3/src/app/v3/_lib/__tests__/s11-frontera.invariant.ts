/**
 * CHECK DE FRONTERA DE SITIO-S11 — el que S11 no tuvo, escrito en SITIO-S12.
 *
 * Corre con `npm run test:s11-frontera`, o con `npm run test:frontera` junto al
 * resto. **NO entra en ningún agregado, y corre ANTES del commit** (regla 12).
 *
 * ── Por qué existe, y qué agujero tapa ─────────────────────────────────────
 *
 * SITIO-S11 hizo **dos toques declarados adentro de `/probe-escena`**, que es
 * un directorio prohibido: `_components/choreographyEditor.ts` re-exporta los
 * tres tipos que §7.36 mandó mudar, y `_components/choreographyNotes.ts` recibió
 * la declaración del defecto 18. Los dos son mínimos, los dos tienen su razón
 * escrita, y ninguno estaba autorizado por un check propio.
 *
 * Mientras el detector de ventana de `s3-frontera` estuvo roto —cruzaba sus
 * testigos contra `rutasTocadas()` en vez de contra las ALTAS— esos dos toques
 * se REPORTABAN, en rojo y por la razón equivocada: S11 aparecía «dentro de la
 * ventana de S3» porque había modificado cuatro archivos que S3 creó. Con el
 * detector bien fechado eso desapareció, **y con ello desapareció el único
 * instrumento que los miraba**. Este archivo es el que los mira.
 *
 * ── ⚠️ ESTE CHECK NACE FUERA DE SU VENTANA, y eso NO es un defecto ─────────
 *
 * S11 está commiteado (`51865251`), así que su diff contra `HEAD` es vacío por
 * construcción y las comprobaciones de §1 salen con `noCorre()` — que es la
 * tercera salida que `afirmar.ts` existe para dar: ni verde ni roja, **declarada
 * y contada aparte**. Lo que sí corre siempre es §2, que no mira `git` sino el
 * DISCO: los dos toques siguen siendo lo que S11 declaró, o no. Un check de
 * frontera que fuera del todo inerte fuera de ventana sería un archivo muerto;
 * éste conserva la mitad que es propiedad del código.
 *
 * Es, además, el molde: el sprint que venga copia esta forma y su check nace
 * DENTRO de su ventana, que es donde sirve entero.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, noCorre, titulo } from './afirmar'
import { RAIZ } from './s4-corrida'
import { enElRepo, rutasDadasDeAlta, rutasTocadas } from './s3-git'
import { suitesDelPaquete } from './s4-agregado'
import { CHECKS_DE_FRONTERA, scriptsDe } from './s4-suites'
import { encabezadoDeFrontera, evaluarVentana } from './s4-ventana'

const leer = (relativo: string): string => readFileSync(path.join(RAIZ, relativo), 'utf8')
const existe = (relativo: string): boolean => {
  try {
    readFileSync(path.join(RAIZ, relativo))
    return true
  } catch {
    return false
  }
}

/**
 * LOS TESTIGOS DE LA VENTANA: las quince ALTAS de SITIO-S11.
 *
 * ⚠ **Son ALTAS y no «lo que S11 tocó», y la distinción es la que S11 pagó
 * caro.** Un alta la hace UNA vez quien crea el archivo; los sprints que vienen
 * después lo modifican. Cruzar contra modificaciones declara dentro de ventana a
 * cualquier sprint posterior que roce un archivo ajeno — que es exactamente el
 * defecto que `s3-git.ts` documenta.
 *
 * Los quince salen del commit de S11 (`git show 51865251 --name-status`, letra
 * `A`). Se declaran acá y se comprueba que sigan en disco: un padrón que nombra
 * un archivo que no existe no es un padrón.
 */
const ALTAS_DE_S11: readonly string[] = [
  'docs/rediseno/sprints/SITIO-S11-arreglos.md',
  'src/app/v3/_chrome/SaltarAlContenido.tsx',
  'src/app/v3/_lib/__tests__/s10-acceso-contraste.ts',
  'src/app/v3/_lib/__tests__/s10-acceso-landmarks.ts',
  'src/app/v3/_lib/__tests__/s10-mobile-escala.ts',
  'src/app/v3/_lib/__tests__/s10-mobile-pastilla.ts',
  'src/app/v3/_lib/__tests__/s10-mobile-peso.ts',
  'src/app/v3/_lib/__tests__/s9-acoplamiento.ts',
  'src/app/v3/_lib/__tests__/s9-scrollPadding.ts',
  'src/app/v3/_lib/escena/__tests__/camaraDelCuadro.ts',
  'src/app/v3/_lib/escena/__tests__/s10-logo-encuadre.ts',
  'src/app/v3/_lib/escena/__tests__/s10-logo-tablas.ts',
  'src/app/v3/_lib/escena/choreographyEditorTypes.ts',
  'src/app/v3/_lib/escena/encuadre.ts',
  'src/app/v3/_secciones/servicios/CabeceraDeServicios.tsx',
]

/**
 * LOS DOS TOQUES DECLARADOS EN ZONA CERRADA, con lo que cada uno tiene que
 * seguir cumpliendo.
 *
 * No alcanza con listarlos: un toque autorizado sin una propiedad que lo defina
 * es un permiso en blanco. Cada uno trae la marca que lo justifica, leída del
 * disco, y por eso §2 corre dentro y fuera de ventana.
 */
interface ToqueDeclarado {
  readonly archivo: string
  readonly razon: string
  /** La marca que tiene que estar en el archivo para que el toque siga siendo el declarado. */
  readonly marca: RegExp
  readonly queAfirma: string
}

const TOQUES_EN_ZONA_CERRADA: readonly ToqueDeclarado[] = [
  {
    archivo: 'src/app/probe-escena/_components/choreographyEditor.ts',
    razon:
      're-exporta los tres tipos mudados por §7.36. Sin esto el acoplamiento se MUEVE en vez de cerrarse: los siete consumidores del panel seguirían tirando del panel',
    marca: /export type \{[^}]*ChoreoEditor[^}]*\}/,
    queAfirma: 'el panel sigue RE-EXPORTANDO los tres tipos, y no declarándolos',
  },
  {
    archivo: 'src/app/probe-escena/_components/choreographyNotes.ts',
    razon:
      'recibió la declaración del defecto 18 —el recorte por arriba de la pose `demos`—. §6 dice que los comentarios de cada keyframe se editan ahí y no en el array, y `test:s7e-export-sprites` lo hace cumplir byte por byte',
    marca: /recorte por arriba/,
    queAfirma: 'la declaración del recorte de `demos` sigue viviendo en el archivo del que el exportador la REGENERA',
  },
]

const TESTIGOS = ALTAS_DE_S11.map(enElRepo)
const ventana = evaluarVentana(TESTIGOS, rutasDadasDeAlta())
console.log(`\n${encabezadoDeFrontera('s11-frontera', ventana)}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Las zonas cerradas, y las DOS excepciones que S11 declaró')

/** Los prefijos que S11 tenía prohibidos. Los dos toques son la excepción. */
const DIRECTORIOS_CERRADOS = [
  'src/app/probe-escena/',
  'src/components/home-intro/',
  'src/app/setter/',
  'src/app/(protected)/setter/',
  'src/app/leados/',
]

const cerradosEnElRepo = DIRECTORIOS_CERRADOS.map(enElRepo)
const excepciones = TOQUES_EN_ZONA_CERRADA.map((t) => enElRepo(t.archivo))
const tocados = rutasTocadas()
const enZonaCerrada = tocados.filter((ruta) => cerradosEnElRepo.some((d) => ruta.startsWith(d)))
const sinDeclarar = enZonaCerrada.filter((ruta) => !excepciones.includes(ruta))

if (ventana.dentro) {
  afirmarIgual(
    sinDeclarar,
    [],
    `de las ${DIRECTORIOS_CERRADOS.length} zonas cerradas sólo se tocaron las ${excepciones.length} excepciones declaradas`,
  )
  afirmar(
    TESTIGOS.some((ruta) => tocados.includes(ruta)),
    'y `git status` ve al menos uno de los testigos: las dos listas hablan el mismo idioma',
    'sin esto la afirmación de arriba pasaría en verde comparando peras con manzanas',
  )
} else {
  noCorre(
    `sólo se tocaron las ${excepciones.length} excepciones declaradas de las zonas cerradas`,
    ventana.razon,
  )
  noCorre('y `git status` ve al menos uno de los testigos', ventana.razon)
}

controlPositivo(
  'el filtro reconocería un toque NO declarado en una zona cerrada',
  [enElRepo('src/app/probe-escena/_components/ProbeControls.tsx')],
  (rutas: string[]) =>
    rutas.filter((r) => cerradosEnElRepo.some((d) => r.startsWith(d)) && !excepciones.includes(r)).length === 0,
)
controlPositivo(
  '  y NO se queja de las dos que SÍ están declaradas',
  excepciones,
  (rutas: string[]) =>
    rutas.filter((r) => cerradosEnElRepo.some((d) => r.startsWith(d)) && !excepciones.includes(r)).length > 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los dos toques siguen siendo lo declarado — se lee del DISCO, corre siempre')

/**
 * ⚠ **ESTA SECCIÓN ES LA QUE HACE ÚTIL A UN CHECK NACIDO FUERA DE VENTANA.**
 * No pregunta «¿S11 tocó esto?» —eso ya no se puede saber— sino «¿lo que S11
 * dejó ahí sigue estando?», que es una propiedad del código y vale siempre. Es
 * la misma forma que `s3-frontera` §1b usa para el tema: leer de `HEAD` o del
 * disco lo que no depende del momento.
 */
for (const toque of TOQUES_EN_ZONA_CERRADA) {
  const nombre = path.basename(toque.archivo)
  afirmar(existe(toque.archivo), `${nombre} sigue en disco`, toque.archivo)
  afirmar(toque.marca.test(leer(toque.archivo)), `  y ${toque.queAfirma}`, toque.razon)
}
controlPositivo(
  'el detector de la re-exportación no está ciego: la forma DECLARATIVA no la cumple',
  'export type ChoreoEditor = {',
  (fuente: string) => TOQUES_EN_ZONA_CERRADA[0].marca.test(fuente),
)
controlPositivo(
  '  y el de la declaración del recorte tampoco: un docblock sin la frase no pasa',
  '/** La pose `demos`: el logo llena el cuadro. */',
  (fuente: string) => TOQUES_EN_ZONA_CERRADA[1].marca.test(fuente),
)
afirmarIgual(
  ALTAS_DE_S11.filter((a) => !existe(a)),
  [],
  `las ${ALTAS_DE_S11.length} altas de SITIO-S11 existen en disco: el padrón de testigos no nombra un fantasma`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL CENSO — cuántos lanes tienen check de frontera propio')

/**
 * ⚠ **ES UN HUECO DE MÉTODO, NO DE ESTE SPRINT, y por eso se PUBLICA y se
 * afirma sólo lo propio (regla 13).** El repo tiene diecinueve lanes con suite
 * permanente y hasta SITIO-S12 **uno solo** tenía check de frontera. Los otros
 * no midieron nunca qué tocaron mientras lo tocaban.
 *
 * El censo se DERIVA de `package.json` (regla 14): una lista escrita al lado se
 * queda vieja el día que alguien agrega un lane.
 */
const suites = suitesDelPaquete().permanentes.map((s) => s.nombre)
const scriptsDelPaquete = scriptsDe(JSON.parse(leer('package.json')))
const conFrontera = CHECKS_DE_FRONTERA.map((s) => /^test:(s\d+[a-z]?)-/.exec(s)?.[1] ?? s)
const sinFrontera = suites.filter((s) => !conFrontera.includes(s))
console.log(`  lanes con suite permanente: ${suites.length} — ${suites.join(' · ')}`)
console.log(`  con check de frontera propio: ${conFrontera.length} — ${conFrontera.join(' · ')}`)
console.log(`  SIN check de frontera propio: ${sinFrontera.length} — ${sinFrontera.join(' · ')}`)
afirmar(
  conFrontera.includes('s11'),
  'SITIO-S11 ya tiene el suyo: es lo que este archivo entrega',
  `los ${CHECKS_DE_FRONTERA.length} declarados en \`CHECKS_DE_FRONTERA\``,
)
afirmarIgual(
  CHECKS_DE_FRONTERA.filter((s) => !(s in scriptsDelPaquete)),
  [],
  '  y los declarados existen como script: la lista y el paquete no divergen',
)
console.log(
  `  ⚠️ HUECO DE MÉTODO PUBLICADO, NO ARREGLADO: ${sinFrontera.length} de los ${suites.length} lanes siguen sin check de frontera propio.\n` +
    '     No es de este sprint —escribir el de un sprint cerrado sólo sirve como molde, porque nace fuera de ventana—\n' +
    '     y la salida es que cada sprint nuevo nazca con el suyo. Este archivo es el molde.',
)

cerrar('s11-frontera.invariant')
